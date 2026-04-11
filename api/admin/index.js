const { CosmosClient } = require('@azure/cosmos')
const jwt = require('jsonwebtoken')

const ADMIN_EMAIL = 'don.bilbrey@gmail.com'
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

const CORS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://white-ocean-0b1cc9e0f.7.azurestaticapps.net',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
}

let client, database
try {
  client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
  database = client.database('marineiq')
} catch (e) {
  // Handled per-request below
}

module.exports = async function (context, req) {
  context.log('Admin function invoked, method:', req.method)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers: {
        ...CORS,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
    return
  }

  // Guard: Cosmos init
  if (!client || !database) {
    context.res = { status: 500, headers: CORS, body: { error: 'Database client failed to initialise' } }
    return
  }

  // Verify JWT from Authorization header
  const authHeader = (req.headers && (req.headers['authorization'] || req.headers['Authorization'])) || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    context.res = { status: 401, headers: CORS, body: { error: 'Not authenticated' } }
    return
  }

  let decoded
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (e) {
    context.res = { status: 401, headers: CORS, body: { error: 'Session expired' } }
    return
  }

  if (decoded.email !== ADMIN_EMAIL) {
    context.res = { status: 403, headers: CORS, body: { error: 'Admin access only' } }
    return
  }

  const action = req.body && req.body.action

  try {
    if (action === 'listUsers') {
      const { resources: users } = await database.container('users').items.query({
        query: 'SELECT c.id, c.userId, c.email, c.name, c.createdAt FROM c'
      }).fetchAll()

      let memberships = []
      try {
        const { resources } = await database.container('vesselMemberships').items.query({
          query: "SELECT c.userId, c.role, c.vesselId FROM c WHERE c.status = 'active'"
        }).fetchAll()
        memberships = resources
      } catch (e) {
        context.log.warn('vesselMemberships not available:', e.message)
      }

      const memByUser = {}
      for (const m of memberships) {
        if (!memByUser[m.userId]) memByUser[m.userId] = []
        memByUser[m.userId].push({ vesselId: m.vesselId, role: m.role })
      }

      const result = users.map(u => ({
        ...u,
        vessels: memByUser[u.userId || u.id] || []
      })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      context.res = { status: 200, headers: CORS, body: { users: result } }
      return
    }

    if (action === 'listVessels') {
      let vessels = []
      try {
        const { resources } = await database.container('vessels').items.query({
          query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
        }).fetchAll()
        vessels = resources
      } catch (e) {
        context.log.warn('vessels container not available:', e.message)
      }

      let memberships = []
      try {
        const { resources } = await database.container('vesselMemberships').items.query({
          query: "SELECT c.vesselId, c.userId, c.userEmail, c.userName, c.role FROM c WHERE c.status = 'active'"
        }).fetchAll()
        memberships = resources
      } catch (e) {
        context.log.warn('vesselMemberships not available:', e.message)
      }

      const memByVessel = {}
      for (const m of memberships) {
        if (!memByVessel[m.vesselId]) memByVessel[m.vesselId] = []
        memByVessel[m.vesselId].push(m)
      }

      const result = vessels.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        hullId: v.hullId,
        captainId: v.captainId,
        homePort: v.homePort,
        createdAt: v.createdAt,
        members: memByVessel[v.id] || []
      }))

      context.res = { status: 200, headers: CORS, body: { vessels: result } }
      return
    }

    context.res = { status: 400, headers: CORS, body: { error: 'action must be listUsers or listVessels' } }

  } catch (e) {
    context.log.error('Admin error:', e.message, e.stack)
    context.res = { status: 500, headers: CORS, body: { error: e.message } }
  }
}
