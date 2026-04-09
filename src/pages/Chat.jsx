import { useState, useRef, useEffect } from 'react'
import { apiPost } from '../api'

export default function Chat({ userId, profile }) {
  const welcome = {
    role: 'assistant',
    content: profile?.vesselName
      ? `Ahoy. Name's Captain Cole — forty years on the water, Atlantic crossings, Gulf squalls, more close calls than I care to count. I see you're sailing ${profile.vesselName}${profile.homePort ? ` out of ${profile.homePort}` : ''}. Good to know my crew. What's on your mind, sailor?`
      : "Ahoy. Name's Captain Cole — forty years on the water, Atlantic crossings, Gulf squalls, more close calls than I care to count. I'm here to make sure you know your vessel, your rules, and your limits before the sea tests 'em. What's on your mind, sailor?"
  }

  const [messages, setMessages] = useState([welcome])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function buildVesselContext() {
    if (!profile) return ''
    const parts = []
    if (profile.vesselName) parts.push(`Vessel: ${profile.vesselName}`)
    if (profile.vesselType) parts.push(`Type: ${profile.vesselType}`)
    if (profile.make && profile.model) parts.push(`${profile.make} ${profile.model} ${profile.year || ''}`.trim())
    if (profile.homePort) parts.push(`Home port: ${profile.homePort}`)
    if (profile.lengthFt) parts.push(`LOA: ${profile.lengthFt}ft`)
    if (profile.draftFt) parts.push(`Draft: ${profile.draftFt}ft`)
    if (profile.hullSpeed) parts.push(`Hull speed: ${profile.hullSpeed}kts`)
    if (profile.engine) parts.push(`Engine: ${profile.engine}`)
    return parts.length ? `\n\n[Sailor's vessel — ${parts.join(', ')}]` : ''
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const vesselContext = buildVesselContext()
      const apiMessages = newMessages
        .filter(m => m !== welcome)
        .map((m, i) => {
          if (i === 0 && vesselContext) {
            return { role: m.role, content: m.content + vesselContext }
          }
          return { role: m.role, content: m.content }
        })

      const data = await apiPost('chat', { messages: apiMessages })
      const reply = data.content?.[0]?.text || "Something's wrong with the radio. Try again."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lost the signal. Try again, sailor." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ background: '#0c2a4a', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a3f6b', border: '2px solid #2563a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          &#9822;
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Captain Cole</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>40 years at sea &middot; Always watching</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f5f5f3' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: msg.role === 'user' ? '#185FA5' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#1a1a1a',
              fontSize: '14px', lineHeight: '1.6',
              border: msg.role === 'assistant' ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', fontSize: '13px', color: '#888780' }}>
              Captain Cole is thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 16px', background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.1)', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask the Captain anything..."
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '20px',
            border: '0.5px solid rgba(0,0,0,0.2)', background: '#f5f5f3',
            fontSize: '14px', resize: 'none', outline: 'none',
            fontFamily: 'inherit', lineHeight: '1.4'
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: loading || !input.trim() ? '#ccc' : '#185FA5',
          border: 'none', color: '#fff', fontSize: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, alignSelf: 'flex-end', cursor: 'pointer'
        }}>
          &#10148;
        </button>
      </div>
    </div>
  )
}
