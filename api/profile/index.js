const { CosmosClient } = require('@azure/cosmos')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

module.exports = async function (context, req) {
  context.log('Profile function called')

  const action = req.body && req.body.action
  const userId = req.body && req.body.userId

  if (!userId) {
    context.res = { status: 400, body: { error: 'userId is required' } }
    return
  }

  const container = database.container('users')

  try {
    if (action === 'getProfile') {
      try {
        const { resource } = await container.item(userId, userId).read()
        context.res = { status: 200, body: { profile: resource } }
      } catch (e) {
        if (e.code === 404) {
          context.res = { status: 200, body: { profile: null } }
        } else {
          throw e
        }
      }
      return
    }

    if (action === 'saveProfile') {
      // Read the existing document first so auth fields (password, authType, createdAt)
      // are preserved. A blind upsert would overwrite and wipe the password hash.
      let existing = {}
      try {
        const { resource } = await container.item(userId, userId).read()
        if (resource) existing = resource
      } catch (e) {
        if (e.code !== 404) throw e
      }

      const profile = {
        ...existing,          // ← preserves password, authType, createdAt, etc.
        id: userId,
        userId,
        name: req.body.name || existing.name || '',
        email: req.body.email || existing.email || '',
        provider: req.body.provider || existing.provider || '',
        vesselName: req.body.vesselName || '',
        vesselType: req.body.vesselType || 'Sailboat',
        make: req.body.make || '',
        model: req.body.model || '',
        year: req.body.year || '',
        homePort: req.body.homePort || '',
        lengthFt: req.body.lengthFt || '',
        beamFt: req.body.beamFt || '',
        draftFt: req.body.draftFt || '',
        hullSpeed: req.body.hullSpeed || '',
        engine: req.body.engine || '',
        mmsi: req.body.mmsi || '',
        callSign: req.body.callSign || '',
        emergencyContact: req.body.emergencyContact || '',
        updatedAt: new Date().toISOString()
      }

      await container.items.upsert(profile)
      context.res = { status: 200, body: { success: true, profile } }
      return
    }

    context.res = { status: 400, body: { error: 'action must be getProfile or saveProfile' } }

  } catch (err) {
    context.log.error('Profile error:', err.message)
    context.res = { status: 500, body: { error: err.message } }
  }
}