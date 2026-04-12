const { CosmosClient } = require('@azure/cosmos')
const { verifyToken, CORS, handleOptions, err } = require('../shared/auth')
const { getMembership, requireMembership, hasRole } = require('../shared/membership')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

module.exports = async function (context, req) {
  context.log('Membership function called')

  if (req.method === 'OPTIONS') { handleOptions(context); return }

  let caller
  try {
    caller = verifyToken(req)
  } catch (e) {
    err(context, e.status || 401, e.message); return
  }

  const { userId, email: callerEmail, name: callerName } = caller
  const action = req.body && req.body.action
  const vesselId = req.body && req.body.vesselId

  const memberships = database.container('vesselMemberships')
  const invites = database.container('vesselInvites')
  const requests = database.container('vesselJoinRequests')
  const users = database.container('users')

  try {

    // ── myMembership ──────────────────────────────────────────────────────────
    if (action === 'myMembership') {
      if (!vesselId) { err(context, 400, 'vesselId required'); return }
      const mem = await getMembership(vesselId, userId)
      context.res = { status: 200, headers: CORS, body: { membership: mem } }
      return
    }

    // ── listMembers ───────────────────────────────────────────────────────────
    if (action === 'listMembers') {
      await requireMembership(vesselId, userId, 'crew')
      const { resources } = await memberships.items.query({
        query: 'SELECT * FROM c WHERE c.vesselId = @vesselId AND c.status = "active" ORDER BY c.joinedAt ASC',
        parameters: [{ name: '@vesselId', value: vesselId }]
      }, { partitionKey: vesselId }).fetchAll()
      context.res = { status: 200, headers: CORS, body: { members: resources } }
      return
    }

    // ── listPendingInvites ─────────────────────────────────────────────────────
    if (action === 'listPendingInvites') {
      await requireMembership(vesselId, userId, 'first_mate')
      const { resources } = await invites.items.query({
        query: 'SELECT * FROM c WHERE c.vesselId = @vesselId AND c.status = "pending" ORDER BY c.createdAt DESC',
        parameters: [{ name: '@vesselId', value: vesselId }]
      }, { partitionKey: vesselId }).fetchAll()
      context.res = { status: 200, headers: CORS, body: { invites: resources } }
      return
    }

    // ── listMyInvites — invites for the calling user's email ──────────────────
    if (action === 'listMyInvites') {
      const { resources } = await invites.items.query({
        query: 'SELECT * FROM c WHERE c.email = @email AND c.status = "pending"',
        parameters: [{ name: '@email', value: callerEmail.toLowerCase() }]
      }).fetchAll()

      // Attach vessel name to each invite
      const vessels = database.container('vessels')
      const enriched = await Promise.all(resources.map(async inv => {
        try {
          const { resource: v } = await vessels.item(inv.vesselId, inv.vesselId).read()
          return { ...inv, vesselName: v?.name || inv.vesselId }
        } catch { return { ...inv, vesselName: inv.vesselId } }
      }))
      context.res = { status: 200, headers: CORS, body: { invites: enriched } }
      return
    }

    // ── inviteUser ────────────────────────────────────────────────────────────
    if (action === 'inviteUser') {
      const mem = await requireMembership(vesselId, userId, 'first_mate')
      const { email, role } = req.body
      if (!email) { err(context, 400, 'email required'); return }
      if (!['crew', 'first_mate'].includes(role)) { err(context, 400, 'role must be crew or first_mate'); return }

      // first_mate can only invite crew
      if (mem.role === 'first_mate' && role !== 'crew') {
        err(context, 403, 'First mates can only invite crew members'); return
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Check if user already a member
      const { resources: existingUsers } = await users.items.query({
        query: 'SELECT c.userId FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: normalizedEmail }]
      }).fetchAll()

      if (existingUsers.length > 0) {
        const targetUserId = existingUsers[0].userId || existingUsers[0].id
        const existingMem = await getMembership(vesselId, targetUserId)
        if (existingMem) { err(context, 409, 'User is already a member of this vessel'); return }
      }

      // Check for existing pending invite
      const { resources: pendingInvites } = await invites.items.query({
        query: 'SELECT c.id FROM c WHERE c.vesselId = @vesselId AND c.email = @email AND c.status = "pending"',
        parameters: [{ name: '@vesselId', value: vesselId }, { name: '@email', value: normalizedEmail }]
      }, { partitionKey: vesselId }).fetchAll()

      if (pendingInvites.length > 0) { err(context, 409, 'An invite is already pending for this email'); return }

      const inviteId = `invite-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await invites.items.create({
        id: inviteId, vesselId, email: normalizedEmail, role,
        invitedBy: userId, invitedByName: callerName,
        status: 'pending', createdAt: new Date().toISOString(), expiresAt
      })

      context.res = { status: 201, headers: CORS, body: { success: true, inviteId } }
      return
    }

    // ── acceptInvite ──────────────────────────────────────────────────────────
    if (action === 'acceptInvite') {
      const { inviteId } = req.body
      if (!inviteId) { err(context, 400, 'inviteId required'); return }

      // Find invite cross-partition (user doesn't know vesselId yet)
      const { resources: found } = await invites.items.query({
        query: 'SELECT * FROM c WHERE c.id = @inviteId',
        parameters: [{ name: '@inviteId', value: inviteId }]
      }).fetchAll()

      if (found.length === 0) { err(context, 404, 'Invite not found'); return }
      const invite = found[0]

      if (invite.email !== callerEmail.toLowerCase()) {
        err(context, 403, 'This invite is for a different email address'); return
      }
      if (invite.status !== 'pending') {
        err(context, 409, `Invite is already ${invite.status}`); return
      }
      if (new Date(invite.expiresAt) < new Date()) {
        err(context, 410, 'Invite has expired'); return
      }

      const existingMem = await getMembership(invite.vesselId, userId)
      if (existingMem) { err(context, 409, 'You are already a member of this vessel'); return }

      // Create membership
      await memberships.items.create({
        id: `mem-${invite.vesselId}-${userId}`,
        vesselId: invite.vesselId, userId,
        userEmail: callerEmail, userName: callerName,
        role: invite.role, status: 'active',
        joinedAt: new Date().toISOString()
      })

      // Mark invite accepted
      await invites.items.upsert({ ...invite, status: 'accepted', acceptedAt: new Date().toISOString() })

      context.res = { status: 200, headers: CORS, body: { success: true, vesselId: invite.vesselId, role: invite.role } }
      return
    }

    // ── declineInvite ─────────────────────────────────────────────────────────
    if (action === 'declineInvite') {
      const { inviteId } = req.body
      const { resources: found } = await invites.items.query({
        query: 'SELECT * FROM c WHERE c.id = @inviteId',
        parameters: [{ name: '@inviteId', value: inviteId }]
      }).fetchAll()
      if (found.length === 0) { err(context, 404, 'Invite not found'); return }
      const invite = found[0]
      if (invite.email !== callerEmail.toLowerCase()) { err(context, 403, 'Not your invite'); return }
      await invites.items.upsert({ ...invite, status: 'declined' })
      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── requestAccess ─────────────────────────────────────────────────────────
    if (action === 'requestAccess') {
      if (!vesselId) { err(context, 400, 'vesselId required'); return }
      const { message } = req.body

      const existingMem = await getMembership(vesselId, userId)
      if (existingMem) { err(context, 409, 'You are already a member of this vessel'); return }

      // Check for existing pending request
      const { resources: existingReqs } = await requests.items.query({
        query: 'SELECT c.id FROM c WHERE c.vesselId = @vesselId AND c.userId = @userId AND c.status = "pending"',
        parameters: [{ name: '@vesselId', value: vesselId }, { name: '@userId', value: userId }]
      }, { partitionKey: vesselId }).fetchAll()

      if (existingReqs.length > 0) { err(context, 409, 'You already have a pending request for this vessel'); return }

      await requests.items.create({
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        vesselId, userId, userEmail: callerEmail, userName: callerName,
        message: message || '', status: 'pending', createdAt: new Date().toISOString(),
        reviewedBy: null, reviewedAt: null
      })

      context.res = { status: 201, headers: CORS, body: { success: true } }
      return
    }

    // ── listJoinRequests ──────────────────────────────────────────────────────
    if (action === 'listJoinRequests') {
      await requireMembership(vesselId, userId, 'first_mate')
      const { resources } = await requests.items.query({
        query: 'SELECT * FROM c WHERE c.vesselId = @vesselId AND c.status = "pending" ORDER BY c.createdAt ASC',
        parameters: [{ name: '@vesselId', value: vesselId }]
      }, { partitionKey: vesselId }).fetchAll()
      context.res = { status: 200, headers: CORS, body: { requests: resources } }
      return
    }

    // ── approveRequest ────────────────────────────────────────────────────────
    if (action === 'approveRequest') {
      const { requestId, role } = req.body
      const mem = await requireMembership(vesselId, userId, 'first_mate')
      if (!['crew', 'first_mate'].includes(role || 'crew')) { err(context, 400, 'Invalid role'); return }
      const assignedRole = role || 'crew'
      if (mem.role === 'first_mate' && assignedRole !== 'crew') {
        err(context, 403, 'First mates can only approve crew access'); return
      }

      const { resources: found } = await requests.items.query({
        query: 'SELECT * FROM c WHERE c.id = @id AND c.vesselId = @vesselId',
        parameters: [{ name: '@id', value: requestId }, { name: '@vesselId', value: vesselId }]
      }, { partitionKey: vesselId }).fetchAll()

      if (found.length === 0) { err(context, 404, 'Request not found'); return }
      const joinReq = found[0]
      if (joinReq.status !== 'pending') { err(context, 409, `Request is already ${joinReq.status}`); return }

      const existingMem = await getMembership(vesselId, joinReq.userId)
      if (!existingMem) {
        await memberships.items.create({
          id: `mem-${vesselId}-${joinReq.userId}`,
          vesselId, userId: joinReq.userId,
          userEmail: joinReq.userEmail, userName: joinReq.userName,
          role: assignedRole, status: 'active', joinedAt: new Date().toISOString()
        })
      }

      await requests.items.upsert({ ...joinReq, status: 'approved', reviewedBy: userId, reviewedAt: new Date().toISOString() })
      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── denyRequest ───────────────────────────────────────────────────────────
    if (action === 'denyRequest') {
      const { requestId } = req.body
      await requireMembership(vesselId, userId, 'first_mate')

      const { resources: found } = await requests.items.query({
        query: 'SELECT * FROM c WHERE c.id = @id AND c.vesselId = @vesselId',
        parameters: [{ name: '@id', value: requestId }, { name: '@vesselId', value: vesselId }]
      }, { partitionKey: vesselId }).fetchAll()

      if (found.length === 0) { err(context, 404, 'Request not found'); return }
      const joinReq = found[0]
      await requests.items.upsert({ ...joinReq, status: 'denied', reviewedBy: userId, reviewedAt: new Date().toISOString() })
      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── changeRole ────────────────────────────────────────────────────────────
    if (action === 'changeRole') {
      const { targetUserId, role } = req.body
      await requireMembership(vesselId, userId, 'captain')
      if (!['first_mate', 'crew'].includes(role)) { err(context, 400, 'Can only set role to first_mate or crew'); return }
      if (targetUserId === userId) { err(context, 400, 'Cannot change your own role'); return }

      const targetMem = await getMembership(vesselId, targetUserId)
      if (!targetMem) { err(context, 404, 'Member not found'); return }
      if (targetMem.role === 'captain') { err(context, 403, 'Use transferCaptain to change the captain'); return }

      await memberships.items.upsert({ ...targetMem, role })
      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── removeMember ──────────────────────────────────────────────────────────
    if (action === 'removeMember') {
      const { targetUserId } = req.body
      const mem = await requireMembership(vesselId, userId, 'first_mate')
      if (targetUserId === userId) { err(context, 400, 'Use leave to remove yourself'); return }

      const targetMem = await getMembership(vesselId, targetUserId)
      if (!targetMem) { err(context, 404, 'Member not found'); return }
      if (targetMem.role === 'captain') { err(context, 403, 'Cannot remove the captain'); return }
      if (mem.role === 'first_mate' && targetMem.role === 'first_mate') {
        err(context, 403, 'First mates cannot remove other first mates'); return
      }

      await memberships.items.upsert({ ...targetMem, status: 'removed', removedAt: new Date().toISOString() })
      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── leave ─────────────────────────────────────────────────────────────────
    if (action === 'leave') {
      const mem = await getMembership(vesselId, userId)
      if (!mem) { err(context, 404, 'Not a member'); return }
      if (mem.role === 'captain') { err(context, 403, 'Captain must transfer captaincy before leaving'); return }
      await memberships.items.upsert({ ...mem, status: 'removed', removedAt: new Date().toISOString() })
      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── transferCaptain ───────────────────────────────────────────────────────
    if (action === 'transferCaptain') {
      const { targetUserId } = req.body
      await requireMembership(vesselId, userId, 'captain')
      if (targetUserId === userId) { err(context, 400, 'You are already the captain'); return }

      const targetMem = await getMembership(vesselId, targetUserId)
      if (!targetMem) { err(context, 404, 'Target user is not a member of this vessel'); return }

      // Promote target
      await memberships.items.upsert({ ...targetMem, role: 'captain' })

      // Demote current captain
      const myMem = await getMembership(vesselId, userId)
      await memberships.items.upsert({ ...myMem, role: 'first_mate' })

      // Update vessel captainId
      const vessels = database.container('vessels')
      const { resource: vessel } = await vessels.item(vesselId, vesselId).read()
      if (vessel) await vessels.items.upsert({ ...vessel, captainId: targetUserId })

      context.res = { status: 200, headers: CORS, body: { success: true } }
      return
    }

    // ── notifications ─────────────────────────────────────────────────────────
    // Returns count of pending invites for this user + pending join requests
    // on vessels where they are captain or first_mate.
    if (action === 'notifications') {
      // Pending invites addressed to this user's email
      let pendingInvites = 0
      try {
        const { resources: myInvites } = await invites.items.query({
          query: 'SELECT VALUE COUNT(1) FROM c WHERE c.email = @email AND c.status = "pending"',
          parameters: [{ name: '@email', value: callerEmail.toLowerCase() }]
        }).fetchAll()
        pendingInvites = myInvites[0] || 0
      } catch (e) { context.log.warn('invite count failed:', e.message) }

      // Vessels where this user is captain or first_mate
      let pendingRequests = 0
      try {
        const { resources: myMems } = await memberships.items.query({
          query: 'SELECT c.vesselId FROM c WHERE c.userId = @uid AND c.status = "active" AND (c.role = "captain" OR c.role = "first_mate")',
          parameters: [{ name: '@uid', value: userId }]
        }).fetchAll()

        if (myMems.length > 0) {
          const counts = await Promise.all(myMems.map(async m => {
            try {
              const { resources } = await requests.items.query({
                query: 'SELECT VALUE COUNT(1) FROM c WHERE c.vesselId = @vid AND c.status = "pending"',
                parameters: [{ name: '@vid', value: m.vesselId }]
              }, { partitionKey: m.vesselId }).fetchAll()
              return resources[0] || 0
            } catch { return 0 }
          }))
          pendingRequests = counts.reduce((a, b) => a + b, 0)
        }
      } catch (e) { context.log.warn('request count failed:', e.message) }

      context.res = { status: 200, headers: CORS, body: { pendingInvites, pendingRequests } }
      return
    }

    err(context, 400, 'Unknown action')
  } catch (e) {
    if (e.status) { err(context, e.status, e.message); return }
    context.log.error('Membership error:', e.message)
    err(context, 500, e.message)
  }
}
