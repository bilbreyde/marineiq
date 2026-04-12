import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiPost } from '../api'

export default function Messages({ user, onRead }) {
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null) // { otherUserId, otherUserName }
  const [thread, setThread] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Support ?to=userId&name=UserName from Fleet page "Message" button
  useEffect(() => {
    const toId = searchParams.get('to')
    const toName = searchParams.get('name')
    if (toId && toId !== user.userId) {
      setActiveConv({ otherUserId: toId, otherUserName: toName || toId })
    }
  }, [searchParams])

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (activeConv) loadThread()
  }, [activeConv])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  async function loadConversations() {
    try {
      const data = await apiPost('messages', { action: 'getConversations' })
      if (data.error) throw new Error(data.error)
      setConversations(data.conversations || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadThread() {
    setThread([])
    try {
      const data = await apiPost('messages', { action: 'getThread', otherUserId: activeConv.otherUserId })
      if (data.error) throw new Error(data.error)
      setThread(data.messages || [])
      // Mark as read
      await apiPost('messages', { action: 'markRead', otherUserId: activeConv.otherUserId })
      // Update unread count in conversation list
      setConversations(prev => prev.map(c =>
        c.otherUserId === activeConv.otherUserId ? { ...c, unread: 0 } : c
      ))
      // Notify App to refresh badge
      onRead?.()
    } catch (e) {
      setError(e.message)
    }
  }

  async function send() {
    if (!draft.trim() || !activeConv || sending) return
    setSending(true)
    try {
      const data = await apiPost('messages', {
        action: 'send',
        toUserId: activeConv.otherUserId,
        toUserName: activeConv.otherUserName,
        text: draft.trim()
      })
      if (data.error) throw new Error(data.error)
      setDraft('')
      setThread(prev => [...prev, data.message])
      // Refresh conversation list to update last message
      loadConversations()
      inputRef.current?.focus()
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function openConv(conv) {
    setActiveConv({ otherUserId: conv.otherUserId, otherUserName: conv.otherUserName })
    setError(null)
  }

  const showList = !activeConv
  const showThread = !!activeConv

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(150deg,#0c2a4a 0%,#0e3666 100%)', padding: '20px 16px 28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {activeConv && (
          <button onClick={() => { setActiveConv(null); setThread([]) }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '20px', cursor: 'pointer', padding: '0 4px 0 0', lineHeight: 1 }}>
            ←
          </button>
        )}
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
            {activeConv ? activeConv.otherUserName : 'Messages'}
          </div>
          {!activeConv && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>
              Direct messages with other sailors
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px', maxWidth: '700px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

        {error && (
          <div style={{ margin: '12px 0 0', padding: '12px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {/* Conversation list */}
        {showList && (
          <div style={{ marginTop: '-14px', paddingBottom: '32px' }}>
            {loading ? (
              <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '16px', marginTop: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e8e8e6', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '12px', borderRadius: '4px', background: '#e8e8e6', width: '35%' }} />
                      <div style={{ height: '10px', borderRadius: '4px', background: '#ededeb', width: '65%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888780', fontSize: '13px', marginTop: '14px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                No messages yet.<br />
                <span style={{ fontSize: '12px' }}>Find a sailor in Fleet and send them a message.</span>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                {conversations.map((conv, i) => (
                  <button key={conv.conversationId} onClick={() => openConv(conv)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer',
                      textAlign: 'left', borderBottom: i < conversations.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none'
                    }}>
                    {/* Avatar */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#185FA5', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '14px', fontWeight: '600',
                      color: '#fff', flexShrink: 0
                    }}>
                      {(conv.otherUserName || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: conv.unread > 0 ? '600' : '500', color: '#1a1a1a' }}>
                          {conv.otherUserName}
                        </span>
                        <span style={{ fontSize: '10px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>
                          {formatTime(conv.lastSentAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#888780', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                          {conv.lastMessage}
                        </span>
                        {conv.unread > 0 && (
                          <span style={{
                            background: '#185FA5', color: '#fff', borderRadius: '10px',
                            fontSize: '10px', fontWeight: '700', padding: '1px 6px',
                            flexShrink: 0, marginLeft: '8px', minWidth: '18px', textAlign: 'center'
                          }}>
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Thread view */}
        {showThread && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '16px' }}>
            <div style={{
              flex: 1, overflowY: 'auto', marginTop: '12px',
              display: 'flex', flexDirection: 'column', gap: '8px',
              minHeight: '300px', maxHeight: 'calc(100vh - 280px)'
            }}>
              {thread.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 24px', color: '#888780', fontSize: '12px' }}>
                  Start the conversation
                </div>
              )}
              {thread.map(m => {
                const mine = m.fromUserId === user.userId
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: mine ? '#185FA5' : '#fff',
                      border: mine ? 'none' : '0.5px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ fontSize: '13px', color: mine ? '#fff' : '#1a1a1a', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize: '9px', color: mine ? 'rgba(255,255,255,0.55)' : '#aaa', marginTop: '4px', textAlign: mine ? 'right' : 'left' }}>
                        {formatTime(m.sentAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div style={{
              display: 'flex', gap: '8px', alignItems: 'flex-end',
              background: '#fff', borderRadius: '12px',
              border: '0.5px solid rgba(0,0,0,0.12)', padding: '10px 12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginTop: '12px'
            }}>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message…"
                rows={1}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none',
                  fontSize: '13px', fontFamily: 'inherit', background: 'transparent',
                  lineHeight: '1.4', maxHeight: '100px', overflowY: 'auto'
                }}
              />
              <button
                onClick={send}
                disabled={!draft.trim() || sending}
                style={{
                  background: draft.trim() ? '#185FA5' : '#e8e8e6',
                  color: draft.trim() ? '#fff' : '#aaa',
                  border: 'none', borderRadius: '8px', width: '34px', height: '34px',
                  cursor: draft.trim() ? 'pointer' : 'default',
                  fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.15s'
                }}>
                ↑
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
