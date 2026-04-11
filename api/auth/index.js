const { CosmosClient } = require('@azure/cosmos')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// Ensure userEmails index container exists once per cold start
let emailContainerReady = false
async function ensureEmailContainer() {
  if (emailContainerReady) return
  // Partitioned by /id so each email is its own partition — point-read and
  // point-write are O(1) and the id uniqueness constraint is enforced atomically
  await database.containers.createIfNotExists({
    id: 'userEmails',
    partitionKey: { paths: ['/id'] }
  })
  emailContainerReady = true
}

module.exports = async function (context, req) {
  context.log('Auth function called, action:', req.body && req.body.action)

  const action = req.body && req.body.action
  const usersContainer = database.container('users')

  const cors = {
    'Access-Control-Allow-Origin': 'https://white-ocean-0b1cc9e0f.7.azurestaticapps.net',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } }
    return
  }

  try {
    await ensureEmailContainer()
    const emailsContainer = database.container('userEmails')

    // ── register ──────────────────────────────────────────────────────────────
    if (action === 'register') {
      const { email, password, name } = req.body
      if (!email || !password) {
        context.res = { status: 400, headers: cors, body: { error: 'Email and password required' } }
        return
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Atomic uniqueness check: try to create the email reservation first.
      // Cosmos DB rejects with 409 if the id already exists in this partition,
      // making this race-condition-proof regardless of concurrent registrations.
      try {
        await emailsContainer.items.create({
          id: normalizedEmail,
          reserved: true, // placeholder — userId added after user doc is created
          createdAt: new Date().toISOString()
        })
      } catch (e) {
        if (e.code === 409) {
          context.res = { status: 409, headers: cors, body: { error: 'An account with this email already exists' } }
          return
        }
        throw e
      }

      let userId
      try {
        const hashedPassword = await bcrypt.hash(password, 12)
        userId = `email-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const user = {
          id: userId,
          userId,
          email: normalizedEmail,
          name: name || email.split('@')[0],
          password: hashedPassword,
          authType: 'email',
          createdAt: new Date().toISOString()
        }

        await usersContainer.items.create(user)

        // Back-fill the email reservation with the userId
        await emailsContainer.items.upsert({ id: normalizedEmail, userId, createdAt: user.createdAt })

        const token = jwt.sign({ userId, email: normalizedEmail, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
        context.res = {
          status: 200, headers: cors,
          body: { success: true, userId, name: user.name, email: normalizedEmail, token }
        }
      } catch (e) {
        // If user creation fails after the email was reserved, clean up the reservation
        // so they can retry registration with the same email.
        try { await emailsContainer.item(normalizedEmail, normalizedEmail).delete() } catch {}
        throw e
      }
      return
    }

    // ── login ─────────────────────────────────────────────────────────────────
    if (action === 'login') {
      const { email, password } = req.body
      if (!email || !password) {
        context.res = { status: 400, headers: cors, body: { error: 'Email and password required' } }
        return
      }

      const normalizedEmail = email.toLowerCase().trim()

      // First try a fast path: look up the userId via the email index (point-read)
      let user = null
      try {
        const { resource: emailDoc } = await emailsContainer.item(normalizedEmail, normalizedEmail).read()
        if (emailDoc?.userId) {
          const { resource } = await usersContainer.item(emailDoc.userId, emailDoc.userId).read()
          if (resource) user = resource
        }
      } catch (e) {
        if (e.code !== 404) throw e
      }

      // Fall back to cross-partition query (covers accounts created before this fix)
      if (!user) {
        const { resources } = await usersContainer.items.query({
          query: 'SELECT * FROM c WHERE c.email = @email AND c.authType = "email"',
          parameters: [{ name: '@email', value: normalizedEmail }]
        }).fetchAll()

        if (resources.length > 1) {
          // Multiple accounts with the same email — log for investigation
          context.log.warn(`Duplicate accounts for email ${normalizedEmail}: ${resources.map(r => r.userId).join(', ')}`)
          // Use the most recently created account
          resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }

        user = resources[0] || null

        // Back-fill the email index so future logins use the fast path
        if (user) {
          try {
            await emailsContainer.items.upsert({ id: normalizedEmail, userId: user.userId, createdAt: user.createdAt })
          } catch {}
        }
      }

      if (!user) {
        context.res = { status: 401, headers: cors, body: { error: 'Invalid email or password' } }
        return
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        context.res = { status: 401, headers: cors, body: { error: 'Invalid email or password' } }
        return
      }

      const token = jwt.sign({ userId: user.userId, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
      context.res = {
        status: 200, headers: cors,
        body: { success: true, userId: user.userId, name: user.name, email: user.email, token }
      }
      return
    }

    // ── verify ────────────────────────────────────────────────────────────────
    if (action === 'verify') {
      const token = req.body && req.body.token
      if (!token) {
        context.res = { status: 401, headers: cors, body: { error: 'Not authenticated' } }
        return
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        context.res = { status: 200, headers: cors, body: { userId: decoded.userId, name: decoded.name, email: decoded.email, provider: 'email' } }
      } catch (e) {
        context.res = { status: 401, headers: cors, body: { error: 'Session expired', detail: e.message } }
      }
      return
    }

    // ── changePassword ────────────────────────────────────────────────────────
    // Requires a valid JWT (user must be logged in).
    // If the account has no password (wiped by the saveProfile bug), the new
    // password can be set directly without supplying a current one.
    if (action === 'changePassword') {
      const authHeader = (req.headers && (req.headers['authorization'] || req.headers['Authorization'])) || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (!token) {
        context.res = { status: 401, headers: cors, body: { error: 'Not authenticated' } }
        return
      }
      let decoded
      try { decoded = jwt.verify(token, JWT_SECRET) }
      catch (e) {
        context.res = { status: 401, headers: cors, body: { error: 'Session expired' } }
        return
      }

      const { newPassword, currentPassword } = req.body
      if (!newPassword || newPassword.length < 8) {
        context.res = { status: 400, headers: cors, body: { error: 'New password must be at least 8 characters' } }
        return
      }

      const { resource: userDoc } = await usersContainer.item(decoded.userId, decoded.userId).read()
      if (!userDoc) {
        context.res = { status: 404, headers: cors, body: { error: 'User not found' } }
        return
      }

      // If the account already has a password, require the current one first
      if (userDoc.password) {
        if (!currentPassword) {
          context.res = { status: 400, headers: cors, body: { error: 'Current password required' } }
          return
        }
        const valid = await bcrypt.compare(currentPassword, userDoc.password)
        if (!valid) {
          context.res = { status: 401, headers: cors, body: { error: 'Current password is incorrect' } }
          return
        }
      }

      const hashed = await bcrypt.hash(newPassword, 12)
      await usersContainer.items.upsert({ ...userDoc, password: hashed, authType: 'email', updatedAt: new Date().toISOString() })
      context.res = { status: 200, headers: cors, body: { success: true } }
      return
    }

    // ── logout ────────────────────────────────────────────────────────────────
    if (action === 'logout') {
      context.res = { status: 200, headers: cors, body: { success: true } }
      return
    }

    context.res = { status: 400, headers: cors, body: { error: 'action must be register, login, verify, changePassword or logout' } }

  } catch (err) {
    context.log.error('Auth error:', err.message)
    context.res = { status: 500, headers: cors, body: { error: err.message } }
  }
}
