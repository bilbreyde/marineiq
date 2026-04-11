const { CosmosClient } = require('@azure/cosmos')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

// Role hierarchy — higher index = more permissions
const ROLES = ['crew', 'first_mate', 'captain']

/**
 * Look up a user's active membership for a vessel.
 * Returns the membership doc or null.
 */
async function getMembership(vesselId, userId) {
  const container = database.container('vesselMemberships')
  const id = `mem-${vesselId}-${userId}`
  try {
    const { resource } = await container.item(id, vesselId).read()
    if (resource && resource.status === 'active') return resource
    return null
  } catch (e) {
    if (e.code === 404) return null
    throw e
  }
}

/**
 * Assert that the user is an active member of the vessel with at least the given role.
 * Throws { status, message } on failure.
 */
async function requireMembership(vesselId, userId, minRole = 'crew') {
  if (!vesselId) throw { status: 400, message: 'vesselId is required' }
  const mem = await getMembership(vesselId, userId)
  if (!mem) throw { status: 403, message: 'Not a member of this vessel' }
  if (ROLES.indexOf(mem.role) < ROLES.indexOf(minRole)) {
    throw { status: 403, message: `Requires ${minRole} role or higher` }
  }
  return mem
}

/**
 * Check if a role meets a minimum without throwing.
 */
function hasRole(role, minRole) {
  return ROLES.indexOf(role) >= ROLES.indexOf(minRole)
}

module.exports = { getMembership, requireMembership, hasRole, ROLES }
