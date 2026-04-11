const { CosmosClient } = require('@azure/cosmos')
const { verifyToken, CORS, handleOptions, err } = require('../shared/auth')
const { requireMembership, getMembership, hasRole } = require('../shared/membership')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

module.exports = async function (context, req) {
  context.log('Logbook function called')

  if (req.method === 'OPTIONS') { handleOptions(context); return }

  // Verify JWT — userId comes from the token, never from the body
  let caller
  try {
    caller = verifyToken(req)
  } catch (e) {
    err(context, e.status || 401, e.message); return
  }
  const { userId } = caller

  const action = req.body && req.body.action
  const vesselId = req.body && req.body.vesselId

  try {
    switch (action) {

      // ── TRIPS ──────────────────────────────────────────────────────────────

      case 'logTrip': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        await requireMembership(vesselId, userId, 'crew')

        const container = database.container('trips')
        const trip = {
          id: `trip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          vesselId,
          date: req.body.date || new Date().toISOString(),
          departure: req.body.departure,
          destination: req.body.destination,
          hoursUnderway: req.body.hoursUnderway || 0,
          hoursMotoring: req.body.hoursMotoring || 0,
          nauticalMiles: req.body.nauticalMiles || 0,
          crew: req.body.crew || 1,
          conditions: req.body.conditions || '',
          notes: req.body.notes || '',
          certCategory: req.body.certCategory || null,
          photos: req.body.photos || [],
          createdAt: new Date().toISOString()
        }
        const { resource } = await container.items.create(trip)
        context.res = { status: 201, headers: CORS, body: { success: true, trip: resource } }
        break
      }

      case 'getTrips': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        const mem = await requireMembership(vesselId, userId, 'crew')

        const container = database.container('trips')
        const queries = [
          // All trips tagged with this vesselId (from all members)
          container.items.query({
            query: 'SELECT * FROM c WHERE c.vesselId = @vesselId ORDER BY c.date DESC',
            parameters: [{ name: '@vesselId', value: vesselId }]
          }).fetchAll()
        ]

        // For the captain: also include their old pre-migration trips (no vesselId field)
        if (mem.role === 'captain') {
          queries.push(
            container.items.query({
              query: 'SELECT * FROM c WHERE c.userId = @userId AND (NOT IS_DEFINED(c.vesselId) OR c.vesselId = null OR c.vesselId = "")',
              parameters: [{ name: '@userId', value: userId }]
            }).fetchAll()
          )
        }

        const results = await Promise.all(queries)
        const seen = new Set()
        const trips = results
          .flatMap(r => r.resources)
          .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        const totalHours = trips.reduce((s, t) => s + (t.hoursUnderway || 0), 0)
        const totalMiles = trips.reduce((s, t) => s + (t.nauticalMiles || 0), 0)
        const totalMotoring = trips.reduce((s, t) => s + (t.hoursMotoring || 0), 0)

        context.res = {
          status: 200, headers: CORS,
          body: {
            trips,
            stats: {
              totalTrips: trips.length,
              totalHoursSailing: Math.round(totalHours * 10) / 10,
              totalHoursMotoring: Math.round(totalMotoring * 10) / 10,
              totalNauticalMiles: Math.round(totalMiles)
            }
          }
        }
        break
      }

      // ── MAINTENANCE ────────────────────────────────────────────────────────

      case 'logMaintenance': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        await requireMembership(vesselId, userId, 'crew')

        const container = database.container('maintenance')
        const entry = {
          id: `maint-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          vesselId,
          date: req.body.date || new Date().toISOString(),
          description: req.body.description,
          category: req.body.category,
          engineHoursAtService: req.body.engineHoursAtService || 0,
          nextDueEngineHours: req.body.nextDueEngineHours || null,
          nextDueDate: req.body.nextDueDate || null,
          laborHours: req.body.laborHours || 0,
          cost: req.body.cost || 0,
          technician: req.body.technician || 'Owner',
          partIds: req.body.partIds || [],
          notes: req.body.notes || '',
          photos: req.body.photos || [],
          createdAt: new Date().toISOString()
        }
        const { resource } = await container.items.create(entry)
        context.res = { status: 201, headers: CORS, body: { success: true, entry: resource } }
        break
      }

      case 'getMaintenance': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        const mem = await requireMembership(vesselId, userId, 'crew')

        const container = database.container('maintenance')
        const queries = [
          container.items.query({
            query: 'SELECT * FROM c WHERE c.vesselId = @vesselId ORDER BY c.date DESC',
            parameters: [{ name: '@vesselId', value: vesselId }]
          }).fetchAll()
        ]

        if (mem.role === 'captain') {
          queries.push(
            container.items.query({
              query: 'SELECT * FROM c WHERE c.userId = @userId AND (NOT IS_DEFINED(c.vesselId) OR c.vesselId = null OR c.vesselId = "")',
              parameters: [{ name: '@userId', value: userId }]
            }).fetchAll()
          )
        }

        const results = await Promise.all(queries)
        const seen = new Set()
        const entries = results
          .flatMap(r => r.resources)
          .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        context.res = { status: 200, headers: CORS, body: { entries } }
        break
      }

      // ── PARTS ──────────────────────────────────────────────────────────────

      case 'logPart': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        await requireMembership(vesselId, userId, 'crew')

        const container = database.container('parts')
        const part = {
          id: `part-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          vesselId,
          name: req.body.name,
          manufacturer: req.body.manufacturer || '',
          partNumber: req.body.partNumber || '',
          category: req.body.category || '',
          installDate: req.body.installDate || new Date().toISOString(),
          lastReplacedDate: req.body.lastReplacedDate || null,
          notes: req.body.notes || '',
          photos: req.body.photos || [],
          createdAt: new Date().toISOString()
        }
        const { resource } = await container.items.create(part)
        context.res = { status: 201, headers: CORS, body: { success: true, part: resource } }
        break
      }

      case 'updatePart': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        await requireMembership(vesselId, userId, 'crew')

        const { partId, partUserId } = req.body
        if (!partId || !partUserId) { err(context, 400, 'partId and partUserId required'); return }

        const container = database.container('parts')
        const { resource: existing } = await container.item(partId, partUserId).read()
        if (!existing) { err(context, 404, 'Part not found'); return }
        if (existing.vesselId !== vesselId) { err(context, 403, 'Part does not belong to this vessel'); return }

        const updated = {
          ...existing,
          name: req.body.name ?? existing.name,
          manufacturer: req.body.manufacturer ?? existing.manufacturer,
          partNumber: req.body.partNumber ?? existing.partNumber,
          category: req.body.category ?? existing.category,
          installDate: req.body.installDate ?? existing.installDate,
          lastReplacedDate: req.body.lastReplacedDate ?? existing.lastReplacedDate,
          notes: req.body.notes ?? existing.notes,
          photos: req.body.photos ?? existing.photos,
          updatedAt: new Date().toISOString()
        }

        const { resource } = await container.item(partId, partUserId).replace(updated)
        context.res = { status: 200, headers: CORS, body: { success: true, part: resource } }
        break
      }

      case 'getParts': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        const mem = await requireMembership(vesselId, userId, 'crew')

        const container = database.container('parts')
        const queries = [
          container.items.query({
            query: 'SELECT * FROM c WHERE c.vesselId = @vesselId ORDER BY c.category',
            parameters: [{ name: '@vesselId', value: vesselId }]
          }).fetchAll()
        ]

        if (mem.role === 'captain') {
          queries.push(
            container.items.query({
              query: 'SELECT * FROM c WHERE c.userId = @userId AND (NOT IS_DEFINED(c.vesselId) OR c.vesselId = null OR c.vesselId = "")',
              parameters: [{ name: '@userId', value: userId }]
            }).fetchAll()
          )
        }

        const results = await Promise.all(queries)
        const seen = new Set()
        const parts = results
          .flatMap(r => r.resources)
          .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
          .sort((a, b) => (a.category || '').localeCompare(b.category || ''))

        context.res = { status: 200, headers: CORS, body: { parts } }
        break
      }

      // ── ALERTS ─────────────────────────────────────────────────────────────

      case 'checkAlerts': {
        if (!vesselId) { err(context, 400, 'vesselId required'); return }
        await requireMembership(vesselId, userId, 'crew')

        const currentEngineHours = req.body.currentEngineHours || 0
        const maintContainer = database.container('maintenance')

        const { resources } = await maintContainer.items.query({
          query: 'SELECT * FROM c WHERE c.vesselId = @vesselId AND IS_DEFINED(c.nextDueEngineHours) AND c.nextDueEngineHours != null',
          parameters: [{ name: '@vesselId', value: vesselId }]
        }).fetchAll()

        const alerts = resources
          .filter(m => m.nextDueEngineHours && currentEngineHours >= (m.nextDueEngineHours - 10))
          .map(m => ({
            description: m.description,
            dueAt: m.nextDueEngineHours,
            currentHours: currentEngineHours,
            hoursRemaining: m.nextDueEngineHours - currentEngineHours,
            overdue: currentEngineHours >= m.nextDueEngineHours
          }))

        context.res = { status: 200, headers: CORS, body: { alerts } }
        break
      }

      default:
        err(context, 400, 'Unknown action')
    }
  } catch (e) {
    if (e.status) { err(context, e.status, e.message); return }
    context.log.error('Logbook error:', e.message)
    err(context, 500, e.message)
  }
}
