const { CosmosClient } = require('@azure/cosmos')
const { verifyToken, CORS, handleOptions, err } = require('../shared/auth')

const ADMIN_EMAIL = 'don.bilbrey@gmail.com'

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

module.exports = async function (context, req) {
  context.log('Admin function called')

  if (req.method === 'OPTIONS') { handleOptions(context); return }

  let caller
  try {
    caller = verifyToken(req)
  } catch (e) {
    err(context, e.status || 401, e.message); return
  }

  if (caller.email !== ADMIN_EMAIL) {
    err(context, 403, 'Admin access only'); return
  }

  const action = req.body && req.body.action

  try {
    switch (action) {

      case 'listUsers': {
        const { resources: users } = await database.container('users').items.query({
          query: 'SELECT c.id, c.userId, c.email, c.name, c.createdAt FROM c'
        }).fetchAll()

        // Get membership counts per user
        const { resources: memberships } = await database.container('vesselMemberships').items.query({
          query: "SELECT c.userId, c.role, c.vesselId FROM c WHERE c.status = 'active'"
        }).fetchAll()

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
        break
      }

      case 'listVessels': {
        const { resources: vessels } = await database.container('vessels').items.query({
          query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
        }).fetchAll()

        const { resources: memberships } = await database.container('vesselMemberships').items.query({
          query: "SELECT c.vesselId, c.userId, c.userEmail, c.userName, c.role FROM c WHERE c.status = 'active'"
        }).fetchAll()

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
        break
      }

      default:
        err(context, 400, 'Unknown action')
    }
  } catch (e) {
    context.log.error('Admin error:', e.message)
    err(context, 500, e.message)
  }
}
