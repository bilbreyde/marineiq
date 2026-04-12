import { useState } from 'react'
import { apiPost } from '../api'

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px',
  background: '#f5f5f3', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '500', color: '#5f5e5a', borderBottom: '0.5px solid rgba(0,0,0,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>{label}</div>
      {children}
    </div>
  )
}

// ── Step 1: Role choice ────────────────────────────────────────────────────────
function RoleChoice({ user, onChoose }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      <div style={{ background: '#0c2a4a', padding: '24px 20px 28px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚓</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Welcome aboard, {user.name?.split(' ')[0]}!</div>
        <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>How are you joining MarineIQ?</div>
      </div>

      <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={() => onChoose('captain')} style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '14px',
          padding: '20px', textAlign: 'left', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧑‍✈️</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#0c2a4a', marginBottom: '4px' }}>I own or manage a vessel</div>
          <div style={{ fontSize: '12px', color: '#888780', lineHeight: 1.5 }}>
            Register your vessel, manage crew, track maintenance and logbook entries.
          </div>
        </button>

        <button onClick={() => onChoose('crew')} style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '14px',
          padding: '20px', textAlign: 'left', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🪢</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#0c2a4a', marginBottom: '4px' }}>I'm joining someone's crew</div>
          <div style={{ fontSize: '12px', color: '#888780', lineHeight: 1.5 }}>
            Use training, logbook and Captain Cole. Request to join or accept an invite from your captain.
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Step 2a: Captain vessel setup ──────────────────────────────────────────────
function CaptainSetup({ user, onComplete }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    vesselName: '', vesselType: 'Sailboat', hullId: '', make: '', model: '',
    year: '', homePort: '', lengthFt: '', beamFt: '', draftFt: '',
    hullSpeed: '', engine: '', mmsi: '', callSign: '', emergencyContact: ''
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  async function save() {
    if (!form.vesselName || !form.homePort) return
    setSaving(true)
    try {
      await apiPost('profile', {
        action: 'saveProfile',
        userId: user.userId,
        name: user.name,
        email: user.email || '',
        provider: user.provider,
        crewOnly: false,
        ...form
      })
      onComplete()
    } catch (e) {}
    finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      <div style={{ background: '#0c2a4a', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '17px', fontWeight: '600' }}>Tell me about your vessel</div>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <Section title="Vessel identity">
          <Field label="Vessel name *">
            <input style={inp} placeholder="S/V Blue Horizon" value={form.vesselName} onChange={e => set('vesselName', e.target.value)} />
          </Field>
          <Field label="Vessel type">
            <select style={inp} value={form.vesselType} onChange={e => set('vesselType', e.target.value)}>
              <option>Sailboat</option><option>Powerboat</option><option>Catamaran</option>
              <option>Trawler</option><option>Center console</option><option>Other</option>
            </select>
          </Field>
          <Field label="Hull ID (HIN)">
            <input style={{ ...inp, fontFamily: 'monospace' }} placeholder="ABC12345D101" maxLength={12}
              value={form.hullId} onChange={e => set('hullId', e.target.value.toUpperCase().replace(/[\s-]/g, ''))} />
            <div style={{ fontSize: '10px', color: '#888780', marginTop: '3px' }}>
              Optional — 12-character number on your transom.
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Make"><input style={inp} placeholder="Hunter" value={form.make} onChange={e => set('make', e.target.value)} /></Field>
            <Field label="Model"><input style={inp} placeholder="38" value={form.model} onChange={e => set('model', e.target.value)} /></Field>
            <Field label="Year"><input type="number" style={inp} placeholder="2008" value={form.year} onChange={e => set('year', e.target.value)} /></Field>
            <Field label="Home port *"><input style={inp} placeholder="Dinner Key, Miami" value={form.homePort} onChange={e => set('homePort', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Specifications">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Length overall (ft)"><input type="number" step="0.1" style={inp} placeholder="38" value={form.lengthFt} onChange={e => set('lengthFt', e.target.value)} /></Field>
            <Field label="Beam (ft)"><input type="number" step="0.1" style={inp} placeholder="12.5" value={form.beamFt} onChange={e => set('beamFt', e.target.value)} /></Field>
            <Field label="Draft (ft)"><input type="number" step="0.1" style={inp} placeholder="5.5" value={form.draftFt} onChange={e => set('draftFt', e.target.value)} /></Field>
            <Field label="Hull speed (kts)"><input type="number" step="0.1" style={inp} placeholder="8.2" value={form.hullSpeed} onChange={e => set('hullSpeed', e.target.value)} /></Field>
          </div>
          <Field label="Engine"><input style={inp} placeholder="Yanmar 3YM30" value={form.engine} onChange={e => set('engine', e.target.value)} /></Field>
        </Section>

        <Section title="Safety and comms">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="MMSI number"><input style={inp} placeholder="123456789" value={form.mmsi} onChange={e => set('mmsi', e.target.value)} /></Field>
            <Field label="Call sign"><input style={inp} placeholder="WDC1234" value={form.callSign} onChange={e => set('callSign', e.target.value)} /></Field>
          </div>
          <Field label="Emergency contact"><input style={inp} placeholder="Name and phone number" value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} /></Field>
        </Section>

        <button onClick={save} disabled={saving || !form.vesselName || !form.homePort} style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: saving || !form.vesselName || !form.homePort ? '#ccc' : '#0c2a4a',
          color: '#fff', border: 'none', fontSize: '15px', fontWeight: '500',
          cursor: saving || !form.vesselName || !form.homePort ? 'default' : 'pointer',
          marginBottom: '24px', fontFamily: 'inherit'
        }}>
          {saving ? 'Saving...' : 'Set sail with MarineIQ'}
        </button>
      </div>
    </div>
  )
}

// ── Step 2b: Crew setup + vessel search ───────────────────────────────────────
function CrewSetup({ user, onComplete }) {
  const [step, setStep] = useState('profile') // 'profile' | 'find'
  const [saving, setSaving] = useState(false)
  const [homePort, setHomePort] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [pendingInvites, setPendingInvites] = useState([])
  const [requestSent, setRequestSent] = useState({}) // vesselId -> true
  const [error, setError] = useState(null)

  async function saveProfile() {
    setSaving(true)
    try {
      await apiPost('profile', {
        action: 'saveProfile',
        userId: user.userId,
        name: user.name,
        email: user.email || '',
        provider: user.provider,
        homePort,
        crewOnly: true
      })
      // Load pending invites for this user
      const data = await apiPost('membership', { action: 'listMyInvites' })
      setPendingInvites(data.invites || [])
      setStep('find')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function doSearch(q) {
    setSearch(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const data = await apiPost('vessels', { action: 'search', q: q.trim() })
      setResults(data.vessels || [])
    } catch (e) {}
    finally { setSearching(false) }
  }

  async function requestAccess(vesselId) {
    try {
      await apiPost('membership', { action: 'requestAccess', vesselId })
      setRequestSent(p => ({ ...p, [vesselId]: true }))
    } catch (e) {
      setError(e.message)
    }
  }

  async function acceptInvite(inviteId) {
    try {
      await apiPost('membership', { action: 'acceptInvite', inviteId })
      setPendingInvites(p => p.filter(i => i.id !== inviteId))
    } catch (e) {
      setError(e.message)
    }
  }

  if (step === 'profile') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
        <div style={{ background: '#0c2a4a', padding: '16px 20px', color: '#fff' }}>
          <div style={{ fontSize: '17px', fontWeight: '600' }}>Your details</div>
          <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '3px' }}>Just a couple of things before you join</div>
        </div>
        <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>{user.email}</div>
            </div>
          </div>

          <Section title="Your home port">
            <Field label="Home port (optional)">
              <input style={inp} placeholder="Dinner Key, Miami" value={homePort} onChange={e => setHomePort(e.target.value)} />
            </Field>
          </Section>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '12px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button onClick={saveProfile} disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: saving ? '#ccc' : '#0c2a4a',
            color: '#fff', border: 'none', fontSize: '15px', fontWeight: '500',
            cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: '24px'
          }}>
            {saving ? 'Saving...' : 'Continue →'}
          </button>
        </div>
      </div>
    )
  }

  // step === 'find'
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      <div style={{ background: '#0c2a4a', padding: '16px 20px 24px', color: '#fff' }}>
        <div style={{ fontSize: '17px', fontWeight: '600' }}>Find your vessel</div>
        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '3px' }}>Search by vessel name, or accept a pending invite</div>
      </div>

      <div style={{ padding: '0 16px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div style={{ marginTop: '-12px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
            <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '600', color: '#185FA5', borderBottom: '0.5px solid rgba(0,0,0,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending invites
            </div>
            {pendingInvites.map(inv => (
              <div key={inv.id} style={{ padding: '12px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{inv.vesselName}</div>
                  <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                    Invited by {inv.invitedByName} · {inv.role}
                  </div>
                </div>
                <button onClick={() => acceptInvite(inv.id)} style={{
                  background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '7px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit'
                }}>
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Vessel search */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '14px', marginTop: pendingInvites.length > 0 ? '0' : '-12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
          <input
            style={{ ...inp, marginBottom: results.length > 0 || searching ? '10px' : '0' }}
            placeholder="Search vessel name…"
            value={search}
            onChange={e => doSearch(e.target.value)}
          />
          {searching && <div style={{ fontSize: '12px', color: '#888780', padding: '4px 0' }}>Searching…</div>}
          {results.map(v => (
            <div key={v.id} style={{ padding: '10px 0', borderTop: '0.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{v.name}</div>
                <div style={{ fontSize: '11px', color: '#888780', marginTop: '1px' }}>
                  {[v.type, v.homePort].filter(Boolean).join(' · ')}
                </div>
              </div>
              {requestSent[v.id] ? (
                <span style={{ fontSize: '11px', color: '#27500A', background: '#EAF3DE', padding: '4px 10px', borderRadius: '20px' }}>Requested</span>
              ) : (
                <button onClick={() => requestAccess(v.id)} style={{
                  background: '#0c2a4a', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '7px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit'
                }}>
                  Request
                </button>
              )}
            </div>
          ))}
          {search.length >= 2 && !searching && results.length === 0 && (
            <div style={{ fontSize: '12px', color: '#888780', padding: '8px 0 0' }}>No vessels found.</div>
          )}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', paddingBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: '#888780', marginBottom: '12px' }}>
            Can't find your vessel? Your captain can invite you by email from their Crew page.
          </div>
          <button onClick={onComplete} style={{
            background: 'none', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: '8px',
            padding: '9px 20px', fontSize: '12px', color: '#5f5e5a', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Skip for now — I'll join later
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────
export default function ProfileSetup({ user, onComplete }) {
  const [role, setRole] = useState(null) // null | 'captain' | 'crew'

  if (!role) return <RoleChoice user={user} onChoose={setRole} />
  if (role === 'captain') return <CaptainSetup user={user} onComplete={onComplete} />
  return <CrewSetup user={user} onComplete={onComplete} />
}
