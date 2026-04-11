const { CosmosClient } = require('@azure/cosmos')
const jwt = require('jsonwebtoken')

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
} catch (e) {}

module.exports = async function (context, req) {
  context.log('Fleet search function invoked')

  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } }
    return
  }

  if (!client || !database) {
    context.res = { status: 500, headers: CORS, body: { error: 'Database unavailable' } }
    return
  }

  // Any logged-in user can search the fleet
  const authHeader = (req.headers && (req.headers['authorization'] || req.headers['Authorization'])) || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    context.res = { status: 401, headers: CORS, body: { error: 'Not authenticated' } }
    return
  }
  try { jwt.verify(token, JWT_SECRET) }
  catch (e) {
    context.res = { status: 401, headers: CORS, body: { error: 'Session expired' } }
    return
  }

  try {
    // Fetch all vessels and their active memberships
    let vessels = []
    try {
      const { resources } = await database.container('vessels').items
        .query('SELECT * FROM c ORDER BY c.createdAt DESC')
        .fetchAll()
      vessels = resources
    } catch (e) {
      context.log.warn('vessels container unavailable:', e.message)
    }

    let memberships = []
    try {
      const { resources } = await database.container('vesselMemberships').items
        .query("SELECT c.vesselId, c.userId, c.userEmail, c.userName, c.role FROM c WHERE c.status = 'active'")
        .fetchAll()
      memberships = resources
    } catch (e) {
      context.log.warn('vesselMemberships unavailable:', e.message)
    }

    // Group members by vessel
    const memByVessel = {}
    for (const m of memberships) {
      if (!memByVessel[m.vesselId]) memByVessel[m.vesselId] = []
      memByVessel[m.vesselId].push(m)
    }

    const result = vessels.map(v => {
      const crew = memByVessel[v.id] || []
      const captain = crew.find(m => m.role === 'captain')
      return {
        id: v.id,
        name: v.name,
        type: v.type || '',
        hullId: v.hullId || '',
        homePort: v.homePort || '',
        make: v.make || '',
        model: v.model || '',
        year: v.year || '',
        lengthFt: v.lengthFt || '',
        captainName: captain?.userName || '',
        captainEmail: captain?.userEmail || '',
        crewCount: crew.length,
        createdAt: v.createdAt || ''
      }
    })

    context.res = { status: 200, headers: CORS, body: { vessels: result } }
  } catch (e) {
    context.log.error('Fleet search error:', e.message)
    context.res = { status: 500, headers: CORS, body: { error: e.message } }
  }
}
