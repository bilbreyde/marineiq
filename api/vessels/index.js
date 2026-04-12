const { CosmosClient } = require('@azure/cosmos')
const { verifyToken, CORS, handleOptions, err } = require('../shared/auth')
const { getMembership } = require('../shared/membership')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

// Ensure new collections exist on first cold start
let ready = false
async function ensureContainers() {
  if (ready) return
  await Promise.all([
    database.containers.createIfNotExists({ id: 'vessels', partitionKey: { paths: ['/id'] } }),
    database.containers.createIfNotExists({ id: 'vesselMemberships', partitionKey: { paths: ['/vesselId'] } }),
    database.containers.createIfNotExists({ id: 'vesselInvites', partitionKey: { paths: ['/vesselId'] } }),
    database.containers.createIfNotExists({ id: 'vesselJoinRequests', partitionKey: { paths: ['/vesselId'] } }),
    database.containers.createIfNotExists({ id: 'messages', partitionKey: { paths: ['/conversationId'] } }),
  ])
  ready = true
}

function conversationId(a, b) {
  return [a, b].sort().join('_')
}

module.exports = async function (context, req) {
  context.log('Vessels function called')

  if (req.method === 'OPTIONS') { handleOptions(context); return }

  let caller
  try {
    caller = verifyToken(req)
  } catch (e) {
    err(context, e.status || 401, e.message); return
  }

  const { userId, email: callerEmail, name: callerName } = caller
  const action = req.body && req.body.action

  try {
    await ensureContainers()

    const vessels = database.container('vessels')
    const memberships = database.container('vesselMemberships')

    // ── listMine ─────────────────────────────────────────────────────────────
    if (action === 'listMine') {
      // Find all active memberships for this user (cross-partition)
      const { resources: mems } = await memberships.items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = "active"',
        parameters: [{ name: '@userId', value: userId }]
      }).fetchAll()

      if (mems.length === 0) {
        context.res = { status: 200, headers: CORS, body: { vessels: [] } }
        return
      }

      // Fetch each vessel by id (point reads, efficient)
      const vesselDocs = await Promise.all(
        mems.map(async m => {
          try {
            const { resource } = await vessels.item(m.vesselId, m.vesselId).read()
            return resource ? { ...resource, _myRole: m.role } : null
          } catch { return null }
        })
      )

      context.res = { status: 200, headers: CORS, body: { vessels: vesselDocs.filter(Boolean) } }
      return
    }

    // ── create ────────────────────────────────────────────────────────────────
    if (action === 'create') {
      const { name, type, make, model, year, homePort, lengthFt, beamFt, draftFt, hullSpeed, engine, mmsi, callSign, emergencyContact, hullId } = req.body
      if (!name || !name.trim()) {
        err(context, 400, 'Vessel name is required'); return
      }

      const nameLower = name.trim().toLowerCase()
      const normalizedHullId = hullId ? hullId.trim().toUpperCase().replace(/[\s-]/g, '') : ''

      // Hull ID is globally unique — no two vessels can share one
      if (normalizedHullId) {
        const { resources: hullDups } = await vessels.items.query({
          query: 'SELECT c.id, c.name FROM c WHERE c.hullId = @hullId',
          parameters: [{ name: '@hullId', value: normalizedHullId }]
        }).fetchAll()
        if (hullDups.length > 0) {
          err(context, 409, `Hull ID already registered to vessel "${hullDups[0].name}"`); return
        }
      }

      // Captain cannot have two vessels with the same normalized name
      const { resources: existing } = await vessels.items.query({
        query: 'SELECT c.id FROM c WHERE c.captainId = @captainId AND c.nameLower = @nameLower',
        parameters: [{ name: '@captainId', value: userId }, { name: '@nameLower', value: nameLower }]
      }).fetchAll()

      if (existing.length > 0) {
        err(context, 409, 'You already have a vessel with that name'); return
      }

      const vesselId = `vessel-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const vessel = {
        id: vesselId,
        name: name.trim(),
        nameLower,
        hullId: normalizedHullId,
        type: type || 'Sailboat',
        captainId: userId,
        make: make || '',
        model: model || '',
        year: year || '',
        homePort: homePort || '',
        lengthFt: lengthFt || '',
        beamFt: beamFt || '',
        draftFt: draftFt || '',
        hullSpeed: hullSpeed || '',
        engine: engine || '',
        mmsi: mmsi || '',
        callSign: callSign || '',
        emergencyContact: emergencyContact || '',
        createdAt: new Date().toISOString()
      }

      await vessels.items.create(vessel)

      // Captain membership
      const memId = `mem-${vesselId}-${userId}`
      await memberships.items.create({
        id: memId,
        vesselId,
        userId,
        userEmail: callerEmail,
        userName: callerName,
        role: 'captain',
        status: 'active',
        joinedAt: new Date().toISOString()
      })

      context.res = { status: 201, headers: CORS, body: { success: true, vessel: { ...vessel, _myRole: 'captain' } } }
      return
    }

    // ── get ───────────────────────────────────────────────────────────────────
    if (action === 'get') {
      const { vesselId } = req.body
      const mem = await getMembership(vesselId, userId)
      if (!mem) { err(context, 403, 'Not a member of this vessel'); return }

      const { resource } = await vessels.item(vesselId, vesselId).read()
      if (!resource) { err(context, 404, 'Vessel not found'); return }

      context.res = { status: 200, headers: CORS, body: { vessel: { ...resource, _myRole: mem.role } } }
      return
    }

    // ── update ────────────────────────────────────────────────────────────────
    if (action === 'update') {
      const { vesselId, name, type, make, model, year, homePort, lengthFt, beamFt, draftFt, hullSpeed, engine, mmsi, callSign, emergencyContact, hullId } = req.body
      const mem = await getMembership(vesselId, userId)
      if (!mem || mem.role !== 'captain') { err(context, 403, 'Only the captain can edit vessel details'); return }

      const { resource: existing } = await vessels.item(vesselId, vesselId).read()
      if (!existing) { err(context, 404, 'Vessel not found'); return }

      const nameLower = (name || existing.name).trim().toLowerCase()
      const normalizedHullId = hullId !== undefined
        ? hullId.trim().toUpperCase().replace(/[\s-]/g, '')
        : (existing.hullId || '')

      // Hull ID global uniqueness check (exclude self)
      if (normalizedHullId && normalizedHullId !== existing.hullId) {
        const { resources: hullDups } = await vessels.items.query({
          query: 'SELECT c.id, c.name FROM c WHERE c.hullId = @hullId',
          parameters: [{ name: '@hullId', value: normalizedHullId }]
        }).fetchAll()
        if (hullDups.some(d => d.id !== vesselId)) {
          err(context, 409, `Hull ID already registered to vessel "${hullDups.find(d => d.id !== vesselId).name}"`); return
        }
      }

      // Name uniqueness check (exclude self)
      if (nameLower !== existing.nameLower) {
        const { resources: dups } = await vessels.items.query({
          query: 'SELECT c.id FROM c WHERE c.captainId = @captainId AND c.nameLower = @nameLower',
          parameters: [{ name: '@captainId', value: userId }, { name: '@nameLower', value: nameLower }]
        }).fetchAll()
        if (dups.some(d => d.id !== vesselId)) {
          err(context, 409, 'You already have a vessel with that name'); return
        }
      }

      const updated = {
        ...existing,
        name: (name || existing.name).trim(),
        nameLower,
        hullId: normalizedHullId,
        type: type ?? existing.type,
        make: make ?? existing.make,
        model: model ?? existing.model,
        year: year ?? existing.year,
        homePort: homePort ?? existing.homePort,
        lengthFt: lengthFt ?? existing.lengthFt,
        beamFt: beamFt ?? existing.beamFt,
        draftFt: draftFt ?? existing.draftFt,
        hullSpeed: hullSpeed ?? existing.hullSpeed,
        engine: engine ?? existing.engine,
        mmsi: mmsi ?? existing.mmsi,
        callSign: callSign ?? existing.callSign,
        emergencyContact: emergencyContact ?? existing.emergencyContact,
        updatedAt: new Date().toISOString()
      }

      await vessels.items.upsert(updated)
      context.res = { status: 200, headers: CORS, body: { success: true, vessel: updated } }
      return
    }

    // ── search ────────────────────────────────────────────────────────────────
    if (action === 'search') {
      const { q } = req.body
      if (!q || q.trim().length < 2) {
        err(context, 400, 'Search query must be at least 2 characters'); return
      }
      const term = q.trim().toLowerCase()
      const { resources } = await vessels.items.query({
        query: 'SELECT c.id, c.name, c.type, c.homePort, c.captainId FROM c WHERE CONTAINS(c.nameLower, @term)',
        parameters: [{ name: '@term', value: term }]
      }).fetchAll()

      // Annotate each result with whether the caller is already a member
      const annotated = await Promise.all(resources.map(async v => {
        const mem = await getMembership(v.id, userId)
        return { ...v, _memberStatus: mem ? mem.status : null, _myRole: mem?.role || null }
      }))

      context.res = { status: 200, headers: CORS, body: { vessels: annotated } }
      return
    }

    // ── migrate ───────────────────────────────────────────────────────────────
    // Called once on first app load after the multi-vessel update.
    // Creates a vessel from the user's profile data if they have none.
    if (action === 'migrate') {
      const { resources: existingMems } = await memberships.items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = "active"',
        parameters: [{ name: '@userId', value: userId }]
      }).fetchAll()

      if (existingMems.length > 0) {
        // Already migrated
        context.res = { status: 200, headers: CORS, body: { migrated: false, vesselId: existingMems[0].vesselId } }
        return
      }

      // Read profile to get vessel data
      const usersContainer = database.container('users')
      let profile = null
      try {
        const { resource } = await usersContainer.item(userId, userId).read()
        profile = resource
      } catch (e) {}

      // Crew-only users opted out of vessel creation during onboarding
      if (profile?.crewOnly === true) {
        context.res = { status: 200, headers: CORS, body: { migrated: false, crewOnly: true } }
        return
      }

      const vesselName = profile?.vesselName || `${callerName}'s Vessel`
      const vesselId = `vessel-${Date.now()}-${Math.random().toString(36).slice(2)}`

      const vessel = {
        id: vesselId,
        name: vesselName,
        nameLower: vesselName.toLowerCase(),
        hullId: profile?.hullId ? profile.hullId.trim().toUpperCase().replace(/[\s-]/g, '') : '',
        type: profile?.vesselType || 'Sailboat',
        captainId: userId,
        make: profile?.make || '',
        model: profile?.model || '',
        year: profile?.year || '',
        homePort: profile?.homePort || '',
        lengthFt: profile?.lengthFt || '',
        beamFt: profile?.beamFt || '',
        draftFt: profile?.draftFt || '',
        hullSpeed: profile?.hullSpeed || '',
        engine: profile?.engine || '',
        mmsi: profile?.mmsi || '',
        callSign: profile?.callSign || '',
        emergencyContact: profile?.emergencyContact || '',
        createdAt: new Date().toISOString()
      }

      await vessels.items.create(vessel)
      await memberships.items.create({
        id: `mem-${vesselId}-${userId}`,
        vesselId,
        userId,
        userEmail: callerEmail,
        userName: callerName,
        role: 'captain',
        status: 'active',
        joinedAt: new Date().toISOString()
      })

      context.res = { status: 200, headers: CORS, body: { migrated: true, vesselId, vessel: { ...vessel, _myRole: 'captain' } } }
      return
    }

    // ── searchFleet ────────────────────────────────────────────────────────────
    // Returns all vessels with captain info for the Fleet discovery page.
    // Open to any authenticated user.
    if (action === 'searchFleet') {
      const { resources: allVessels } = await vessels.items
        .query('SELECT * FROM c ORDER BY c.createdAt DESC')
        .fetchAll()

      let allMems = []
      try {
        const { resources } = await memberships.items
          .query("SELECT c.vesselId, c.userId, c.userEmail, c.userName, c.role FROM c WHERE c.status = 'active'")
          .fetchAll()
        allMems = resources
      } catch (e) {
        context.log.warn('memberships query failed:', e.message)
      }

      const memByVessel = {}
      for (const m of allMems) {
        if (!memByVessel[m.vesselId]) memByVessel[m.vesselId] = []
        memByVessel[m.vesselId].push(m)
      }

      const result = allVessels.map(v => {
        const crew = memByVessel[v.id] || []
        const captain = crew.find(m => m.role === 'captain')
        return {
          id: v.id,
          name: v.name || '',
          type: v.type || '',
          hullId: v.hullId || '',
          homePort: v.homePort || '',
          make: v.make || '',
          model: v.model || '',
          year: v.year || '',
          lengthFt: v.lengthFt || '',
          captainName: captain?.userName || '',
          captainId: captain?.userId || '',
          crewCount: crew.length
        }
      })

      context.res = { status: 200, headers: CORS, body: { vessels: result } }
      return
    }

    // ── msg:send ──────────────────────────────────────────────────────────────
    if (action === 'msg:send') {
      const { toUserId, toUserName, text } = req.body
      if (!toUserId || !text || !text.trim()) { err(context, 400, 'toUserId and text are required'); return }
      if (toUserId === userId) { err(context, 400, 'Cannot message yourself'); return }

      const msgs = database.container('messages')
      const convId = conversationId(userId, toUserId)
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const doc = {
        id: msgId, conversationId: convId,
        fromUserId: userId, fromUserName: callerName || '',
        toUserId, toUserName: toUserName || '',
        text: text.trim(), sentAt: new Date().toISOString(), readAt: null
      }
      await msgs.items.create(doc)
      context.res = { status: 201, headers: CORS, body: { success: true, message: doc } }
      return
    }

    // ── msg:getConversations ───────────────────────────────────────────────────
    if (action === 'msg:getConversations') {
      const msgs = database.container('messages')
      const { resources } = await msgs.items.query({
        query: 'SELECT * FROM c WHERE c.fromUserId = @uid OR c.toUserId = @uid ORDER BY c.sentAt DESC',
        parameters: [{ name: '@uid', value: userId }]
      }).fetchAll()

      const convMap = {}
      for (const m of resources) {
        if (!convMap[m.conversationId]) {
          const otherId = m.fromUserId === userId ? m.toUserId : m.fromUserId
          const otherName = m.fromUserId === userId ? m.toUserName : m.fromUserName
          convMap[m.conversationId] = {
            conversationId: m.conversationId,
            otherUserId: otherId, otherUserName: otherName,
            lastMessage: m.text, lastSentAt: m.sentAt, unread: 0
          }
        }
        if (m.toUserId === userId && !m.readAt) convMap[m.conversationId].unread++
      }

      const conversations = Object.values(convMap).sort((a, b) => b.lastSentAt.localeCompare(a.lastSentAt))
      context.res = { status: 200, headers: CORS, body: { conversations } }
      return
    }

    // ── msg:getThread ─────────────────────────────────────────────────────────
    if (action === 'msg:getThread') {
      const { otherUserId } = req.body
      if (!otherUserId) { err(context, 400, 'otherUserId is required'); return }
      const msgs = database.container('messages')
      const convId = conversationId(userId, otherUserId)
      const { resources } = await msgs.items.query({
        query: 'SELECT * FROM c WHERE c.conversationId = @convId ORDER BY c.sentAt ASC',
        parameters: [{ name: '@convId', value: convId }]
      }).fetchAll()
      context.res = { status: 200, headers: CORS, body: { messages: resources } }
      return
    }

    // ── msg:markRead ──────────────────────────────────────────────────────────
    if (action === 'msg:markRead') {
      const { otherUserId } = req.body
      if (!otherUserId) { err(context, 400, 'otherUserId is required'); return }
      const msgs = database.container('messages')
      const convId = conversationId(userId, otherUserId)
      const { resources: unread } = await msgs.items.query({
        query: 'SELECT * FROM c WHERE c.conversationId = @convId AND c.toUserId = @uid AND IS_NULL(c.readAt)',
        parameters: [{ name: '@convId', value: convId }, { name: '@uid', value: userId }]
      }).fetchAll()
      const now = new Date().toISOString()
      await Promise.all(unread.map(m => msgs.items.upsert({ ...m, readAt: now })))
      context.res = { status: 200, headers: CORS, body: { marked: unread.length } }
      return
    }

    // ── msg:unreadCount ───────────────────────────────────────────────────────
    if (action === 'msg:unreadCount') {
      const msgs = database.container('messages')
      const { resources } = await msgs.items.query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.toUserId = @uid AND IS_NULL(c.readAt)',
        parameters: [{ name: '@uid', value: userId }]
      }).fetchAll()
      context.res = { status: 200, headers: CORS, body: { count: resources[0] || 0 } }
      return
    }

    err(context, 400, 'Unknown action')
  } catch (e) {
    if (e.status) { err(context, e.status, e.message); return }
    context.log.error('Vessels error:', e.message)
    err(context, 500, e.message)
  }
}
