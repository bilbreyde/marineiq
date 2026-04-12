const { CosmosClient } = require('@azure/cosmos')
const { verifyToken, CORS, handleOptions, err } = require('../shared/auth')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const database = client.database('marineiq')

let ready = false
async function ensureContainer() {
  if (ready) return
  await database.containers.createIfNotExists({
    id: 'messages',
    partitionKey: { paths: ['/conversationId'] }
  })
  ready = true
}

function conversationId(a, b) {
  return [a, b].sort().join('_')
}

module.exports = async function (context, req) {
  context.log('Messages function called')

  if (req.method === 'OPTIONS') { handleOptions(context); return }

  let caller
  try {
    caller = verifyToken(req)
  } catch (e) {
    err(context, e.status || 401, e.message); return
  }

  const { userId, name: callerName } = caller
  const action = req.body && req.body.action

  try {
    await ensureContainer()
    const messages = database.container('messages')

    // ── send ──────────────────────────────────────────────────────────────────
    if (action === 'send') {
      const { toUserId, toUserName, text } = req.body
      if (!toUserId || !text || !text.trim()) {
        err(context, 400, 'toUserId and text are required'); return
      }
      if (toUserId === userId) {
        err(context, 400, 'Cannot message yourself'); return
      }

      const convId = conversationId(userId, toUserId)
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const doc = {
        id: msgId,
        conversationId: convId,
        fromUserId: userId,
        fromUserName: callerName || '',
        toUserId,
        toUserName: toUserName || '',
        text: text.trim(),
        sentAt: new Date().toISOString(),
        readAt: null
      }

      await messages.items.create(doc)
      context.res = { status: 201, headers: CORS, body: { success: true, message: doc } }
      return
    }

    // ── getConversations ───────────────────────────────────────────────────────
    // Returns one summary per conversation: latest message + unread count
    if (action === 'getConversations') {
      // All messages where this user is sender or recipient
      const { resources } = await messages.items.query({
        query: 'SELECT * FROM c WHERE c.fromUserId = @uid OR c.toUserId = @uid ORDER BY c.sentAt DESC',
        parameters: [{ name: '@uid', value: userId }]
      }).fetchAll()

      // Group by conversationId, pick latest message per conversation
      const convMap = {}
      for (const m of resources) {
        if (!convMap[m.conversationId]) {
          const otherId = m.fromUserId === userId ? m.toUserId : m.fromUserId
          const otherName = m.fromUserId === userId ? m.toUserName : m.fromUserName
          convMap[m.conversationId] = {
            conversationId: m.conversationId,
            otherUserId: otherId,
            otherUserName: otherName,
            lastMessage: m.text,
            lastSentAt: m.sentAt,
            unread: 0
          }
        }
        // Count unread messages TO this user
        if (m.toUserId === userId && !m.readAt) {
          convMap[m.conversationId].unread++
        }
      }

      const conversations = Object.values(convMap).sort((a, b) =>
        b.lastSentAt.localeCompare(a.lastSentAt)
      )

      context.res = { status: 200, headers: CORS, body: { conversations } }
      return
    }

    // ── getThread ─────────────────────────────────────────────────────────────
    if (action === 'getThread') {
      const { otherUserId } = req.body
      if (!otherUserId) { err(context, 400, 'otherUserId is required'); return }

      const convId = conversationId(userId, otherUserId)
      const { resources } = await messages.items.query({
        query: 'SELECT * FROM c WHERE c.conversationId = @convId ORDER BY c.sentAt ASC',
        parameters: [{ name: '@convId', value: convId }]
      }).fetchAll()

      context.res = { status: 200, headers: CORS, body: { messages: resources } }
      return
    }

    // ── markRead ──────────────────────────────────────────────────────────────
    if (action === 'markRead') {
      const { otherUserId } = req.body
      if (!otherUserId) { err(context, 400, 'otherUserId is required'); return }

      const convId = conversationId(userId, otherUserId)
      // Find unread messages TO this user in this conversation
      const { resources: unread } = await messages.items.query({
        query: 'SELECT * FROM c WHERE c.conversationId = @convId AND c.toUserId = @uid AND IS_NULL(c.readAt)',
        parameters: [
          { name: '@convId', value: convId },
          { name: '@uid', value: userId }
        ]
      }).fetchAll()

      const now = new Date().toISOString()
      await Promise.all(
        unread.map(m => messages.items.upsert({ ...m, readAt: now }))
      )

      context.res = { status: 200, headers: CORS, body: { marked: unread.length } }
      return
    }

    // ── unreadCount ───────────────────────────────────────────────────────────
    if (action === 'unreadCount') {
      const { resources } = await messages.items.query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.toUserId = @uid AND IS_NULL(c.readAt)',
        parameters: [{ name: '@uid', value: userId }]
      }).fetchAll()

      const count = resources[0] || 0
      context.res = { status: 200, headers: CORS, body: { count } }
      return
    }

    err(context, 400, 'Unknown action')
  } catch (e) {
    if (e.status) { err(context, e.status, e.message); return }
    context.log.error('Messages error:', e.message)
    err(context, 500, e.message)
  }
}
