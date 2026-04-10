const { CosmosClient } = require('@azure/cosmos')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

module.exports = async function (context, req) {
  context.log('Auth function called, action:', req.body && req.body.action)
  context.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0)

  const action = req.body && req.body.action
  const container = database.container('users')

  const cors = {
    'Access-Control-Allow-Origin': 'https://white-ocean-0b1cc9e0f.7.azurestaticapps.net',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } }
    return
  }

  try {
    if (action === 'register') {
      const { email, password, name } = req.body
      if (!email || !password) {
        context.res = { status: 400, headers: cors, body: { error: 'Email and password required' } }
        return
      }

      const query = { query: 'SELECT * FROM c WHERE c.email = @email AND c.authType = "email"', parameters: [{ name: '@email', value: email.toLowerCase() }] }
      const { resources: existing } = await container.items.query(query).fetchAll()
      if (existing.length > 0) {
        context.res = { status: 409, headers: cors, body: { error: 'An account with this email already exists' } }
        return
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const userId = `email-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const user = {
        id: userId,
        userId,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        password: hashedPassword,
        authType: 'email',
        createdAt: new Date().toISOString()
      }

      await container.items.create(user)

      const token = jwt.sign({ userId, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
      context.res = {
        status: 200,
        headers: cors,
        body: { success: true, userId, name: user.name, email: user.email, token }
      }
      return
    }

    if (action === 'login') {
      const { email, password } = req.body
      if (!email || !password) {
        context.res = { status: 400, headers: cors, body: { error: 'Email and password required' } }
        return
      }

      const query = { query: 'SELECT * FROM c WHERE c.email = @email AND c.authType = "email"', parameters: [{ name: '@email', value: email.toLowerCase() }] }
      const { resources } = await container.items.query(query).fetchAll()
      if (resources.length === 0) {
        context.res = { status: 401, headers: cors, body: { error: 'Invalid email or password' } }
        return
      }

      const user = resources[0]
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        context.res = { status: 401, headers: cors, body: { error: 'Invalid email or password' } }
        return
      }

      const token = jwt.sign({ userId: user.userId, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
      context.res = {
        status: 200,
        headers: cors,
        body: { success: true, userId: user.userId, name: user.name, email: user.email, token }
      }
      return
    }

    if (action === 'verify') {
      const token = req.body && req.body.token
      context.log('Token received:', token ? token.substring(0, 20) + '...' : 'MISSING')
      if (!token) {
        context.res = { status: 401, headers: cors, body: { error: 'Not authenticated' } }
        return
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        context.log('Token decoded successfully for:', decoded.email)
        context.res = { status: 200, headers: cors, body: { userId: decoded.userId, name: decoded.name, email: decoded.email, provider: 'email' } }
      } catch (e) {
        context.log('Token verify error:', e.message)
        context.res = { status: 401, headers: cors, body: { error: 'Session expired', detail: e.message } }
      }
      return
    }

    if (action === 'logout') {
      context.res = { status: 200, headers: cors, body: { success: true } }
      return
    }

    context.res = { status: 400, headers: cors, body: { error: 'action must be register, login, verify or logout' } }

  } catch (err) {
    context.log.error('Auth error:', err.message)
    context.res = { status: 500, headers: cors, body: { error: err.message } }
  }
}