import { useState, useEffect } from 'react'
import { useVessel } from '../contexts/VesselContext'
import { apiPost } from '../api'

const ROLE_LABELS = { captain: 'Captain', first_mate: 'First Mate', crew: 'Crew' }
const ROLE_COLORS = {
  captain:    { bg: '#FAEEDA', text: '#633806' },
  first_mate: { bg: '#E6F1FB', text: '#0C447C' },
  crew:       { bg: '#EAF3DE', text: '#27500A' },
}

export default function VesselManage() {
  const { vessel, vessels, role, loading: vesselLoading, selectVessel, refresh } = useVessel()
  const [tab, setTab] = useState('members')

  if (vesselLoading) return <Loading text="Loading vessel..." />
  if (!vessel) return <NoVessel />

  const isCaptain = role === 'captain'
  const isFirstMate = role === 'first_mate'
  const canManage = isCaptain || isFirstMate

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '16px 16px 0' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600', marginBottom: '4px' }}>
          {vessel.name}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '12px' }}>
          {vessel.type}{vessel.homePort ? ` · ${vessel.homePort}` : ''}
          {' · '}
          <span style={{ color: ROLE_COLORS[role]?.text || '#fff', background: ROLE_COLORS[role]?.bg, padding: '1px 6px', borderRadius: '8px', fontSize: '11px' }}>
            {ROLE_LABELS[role] || role}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'members', label: 'Members' },
            canManage && { id: 'invites', label: 'Invites' },
            canManage && { id: 'requests', label: 'Requests' },
            isCaptain && { id: 'settings', label: 'Settings' },
            { id: 'search', label: 'Find Vessel' },
          ].filter(Boolean).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 14px', borderRadius: '8px 8px 0 0', fontSize: '13px', fontWeight: '500',
              border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#fff' : 'rgba(255,255,255,0.12)',
              color: tab === t.id ? '#0c2a4a' : 'rgba(255,255,255,0.7)'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {tab === 'members'   && <MembersTab vessel={vessel} role={role} refresh={refresh} />}
        {tab === 'invites'   && <InvitesTab vessel={vessel} role={role} />}
        {tab === 'requests'  && <RequestsTab vessel={vessel} role={role} />}
        {tab === 'settings'  && <SettingsTab vessel={vessel} refresh={refresh} />}
        {tab === 'search'    && <SearchTab currentVesselId={vessel.id} refresh={refresh} selectVessel={selectVessel} />}
      </div>
    </div>
  )
}

// ─── Members ─────────────────────────────────────────────────────────────────

function MembersTab({ vessel, role, refresh }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)

  useEffect(() => { load() }, [vessel.id])

  async function load() {
    setLoading(true)
    try {
      const data = await apiPost('membership', { action: 'listMembers', vesselId: vessel.id })
      setMembers(data.members || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function changeRole(targetUserId, newRole) {
    setWorking(targetUserId)
    try {
      await apiPost('membership', { action: 'changeRole', vesselId: vessel.id, targetUserId, role: newRole })
      await load()
    } catch (e) { alert(e.message || 'Failed') }
    finally { setWorking(null) }
  }

  async function remove(targetUserId) {
    if (!confirm('Remove this member from the vessel?')) return
    setWorking(targetUserId)
    try {
      await apiPost('membership', { action: 'removeMember', vesselId: vessel.id, targetUserId })
      await load()
    } catch (e) { alert(e.message || 'Failed') }
    finally { setWorking(null) }
  }

  if (loading) return <Loading text="Loading members..." />

  return (
    <div>
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '14px' }}>
        {members.length} {members.length === 1 ? 'member' : 'members'} aboard
      </div>
      {members.map(m => (
        <div key={m.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.1)',
          background: '#fff', marginBottom: '8px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#0c2a4a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: '600', flexShrink: 0
          }}>
            {(m.userName || m.userEmail || '?').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{m.userName || m.userEmail}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{m.userEmail}</div>
          </div>
          <RoleBadge role={m.role} />
          {role === 'captain' && m.role !== 'captain' && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {m.role === 'crew' && (
                <SmallButton disabled={working === m.userId} onClick={() => changeRole(m.userId, 'first_mate')}>
                  Promote
                </SmallButton>
              )}
              {m.role === 'first_mate' && (
                <SmallButton disabled={working === m.userId} onClick={() => changeRole(m.userId, 'crew')}>
                  Demote
                </SmallButton>
              )}
              <SmallButton danger disabled={working === m.userId} onClick={() => remove(m.userId)}>
                Remove
              </SmallButton>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Invites ──────────────────────────────────────────────────────────────────

function InvitesTab({ vessel, role }) {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('crew')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [myInvites, setMyInvites] = useState([])

  useEffect(() => { load() }, [vessel.id])

  async function load() {
    setLoading(true)
    try {
      const [pending, mine] = await Promise.all([
        apiPost('membership', { action: 'listPendingInvites', vesselId: vessel.id }),
        apiPost('membership', { action: 'listMyInvites' })
      ])
      setInvites(pending.invites || [])
      setMyInvites(mine.invites || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function sendInvite(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      await apiPost('membership', { action: 'inviteUser', vesselId: vessel.id, email: email.trim(), role: inviteRole })
      setEmail(''); setSent(true)
      setTimeout(() => setSent(false), 3000)
      await load()
    } catch (ex) { alert(ex.error || ex.message || 'Failed to send invite') }
    finally { setSending(false) }
  }

  async function acceptInvite(inviteId) {
    try {
      await apiPost('membership', { action: 'acceptInvite', inviteId })
      await load()
      alert('Joined successfully!')
    } catch (ex) { alert(ex.error || 'Failed to accept invite') }
  }

  async function declineInvite(inviteId) {
    try {
      await apiPost('membership', { action: 'declineInvite', inviteId })
      await load()
    } catch (ex) { alert(ex.error || 'Failed') }
  }

  if (loading) return <Loading text="Loading invites..." />

  return (
    <div>
      {/* My pending invites from other vessels */}
      {myInvites.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <SectionLabel>Invites waiting for you</SectionLabel>
          {myInvites.map(inv => (
            <div key={inv.id} style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #185FA5', background: '#E6F1FB', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#0c2a4a', marginBottom: '2px' }}>
                {inv.vesselName}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>
                Invited as <strong>{ROLE_LABELS[inv.role]}</strong> by {inv.invitedByName || 'a captain'}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <SmallButton onClick={() => acceptInvite(inv.id)}>Accept</SmallButton>
                <SmallButton danger onClick={() => declineInvite(inv.id)}>Decline</SmallButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send invite form */}
      <SectionLabel>Invite someone to {vessel.name}</SectionLabel>
      <form onSubmit={sendInvite} style={{ marginBottom: '20px' }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="sailor@example.com"
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box' }}
        />
        {role === 'captain' && (
          <select
            value={inviteRole} onChange={e => setInviteRole(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px', marginBottom: '8px', background: '#fff', boxSizing: 'border-box' }}
          >
            <option value="crew">Crew</option>
            <option value="first_mate">First Mate</option>
          </select>
        )}
        <button type="submit" disabled={sending || !email.trim()} style={{
          width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
          background: sent ? '#27500A' : '#0c2a4a', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
        }}>
          {sent ? 'Invite sent!' : sending ? 'Sending...' : 'Send Invite'}
        </button>
      </form>

      {/* Pending invites sent from this vessel */}
      {invites.length > 0 && (
        <>
          <SectionLabel>Pending outgoing invites</SectionLabel>
          {invites.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.1)', marginBottom: '6px', background: '#fff' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{inv.email}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{ROLE_LABELS[inv.role]} · expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
              </div>
              <RoleBadge role={inv.role} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ─── Join Requests ────────────────────────────────────────────────────────────

function RequestsTab({ vessel, role }) {
  const [reqs, setReqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)

  useEffect(() => { load() }, [vessel.id])

  async function load() {
    setLoading(true)
    try {
      const data = await apiPost('membership', { action: 'listJoinRequests', vesselId: vessel.id })
      setReqs(data.requests || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function approve(requestId) {
    setWorking(requestId)
    try {
      await apiPost('membership', { action: 'approveRequest', vesselId: vessel.id, requestId, role: 'crew' })
      await load()
    } catch (e) { alert(e.message || 'Failed') }
    finally { setWorking(null) }
  }

  async function deny(requestId) {
    setWorking(requestId)
    try {
      await apiPost('membership', { action: 'denyRequest', vesselId: vessel.id, requestId })
      await load()
    } catch (e) { alert(e.message || 'Failed') }
    finally { setWorking(null) }
  }

  if (loading) return <Loading text="Loading requests..." />

  if (reqs.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: '13px' }}>
      No pending join requests.
    </div>
  )

  return (
    <div>
      <SectionLabel>{reqs.length} pending {reqs.length === 1 ? 'request' : 'requests'}</SectionLabel>
      {reqs.map(r => (
        <div key={r.id} style={{ padding: '12px', borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{r.userName || r.userEmail}</div>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: r.message ? '6px' : '10px' }}>{r.userEmail} · {new Date(r.createdAt).toLocaleDateString()}</div>
          {r.message && (
            <div style={{ fontSize: '13px', color: '#444', fontStyle: 'italic', marginBottom: '10px', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
              "{r.message}"
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <SmallButton disabled={working === r.id} onClick={() => approve(r.id)}>Approve as Crew</SmallButton>
            <SmallButton danger disabled={working === r.id} onClick={() => deny(r.id)}>Deny</SmallButton>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Vessel Settings ──────────────────────────────────────────────────────────

function SettingsTab({ vessel, refresh }) {
  const [form, setForm] = useState({ ...vessel })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const field = (key, label, type = 'text') => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>
      <input
        type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px', boxSizing: 'border-box' }}
      />
    </div>
  )

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiPost('vessels', { action: 'update', vesselId: vessel.id, ...form })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await refresh()
    } catch (ex) { alert(ex.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={save}>
      <SectionLabel>Vessel details</SectionLabel>
      {field('name', 'Vessel name')}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Type</label>
        <select value={form.type || 'Sailboat'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}>
          {['Sailboat', 'Motorboat', 'Catamaran', 'Trimaran', 'Power Catamaran', 'Other'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      {field('make', 'Make')}
      {field('model', 'Model')}
      {field('year', 'Year')}
      {field('homePort', 'Home port')}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>{field('lengthFt', 'Length (ft)')}</div>
        <div style={{ flex: 1 }}>{field('draftFt', 'Draft (ft)')}</div>
      </div>
      {field('hullSpeed', 'Hull speed (kts)')}
      {field('engine', 'Engine')}
      {field('mmsi', 'MMSI')}
      {field('callSign', 'Call sign')}
      {field('emergencyContact', 'Emergency contact')}
      <button type="submit" disabled={saving} style={{
        width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
        background: saved ? '#27500A' : '#0c2a4a', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px'
      }}>
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save vessel details'}
      </button>
    </form>
  )
}

// ─── Vessel Search / Join ─────────────────────────────────────────────────────

function SearchTab({ currentVesselId, refresh, selectVessel }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [requestingId, setRequestingId] = useState(null)
  const [message, setMessage] = useState('')
  const [requested, setRequested] = useState({})
  const [createMode, setCreateMode] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  async function search(e) {
    e.preventDefault()
    if (q.trim().length < 2) return
    setSearching(true)
    try {
      const data = await apiPost('vessels', { action: 'search', q })
      setResults(data.vessels || [])
    } catch (e) {}
    finally { setSearching(false) }
  }

  async function requestAccess(vesselId) {
    try {
      await apiPost('membership', { action: 'requestAccess', vesselId, message })
      setRequested(r => ({ ...r, [vesselId]: true }))
      setRequestingId(null)
      setMessage('')
    } catch (ex) { alert(ex.error || 'Failed to send request') }
  }

  async function createVessel(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const data = await apiPost('vessels', { action: 'create', name: newName.trim() })
      if (data.vessel) {
        await refresh()
        selectVessel(data.vessel)
        setCreateMode(false)
        setNewName('')
      }
    } catch (ex) { alert(ex.error || 'Failed to create vessel') }
    finally { setCreating(false) }
  }

  return (
    <div>
      <SectionLabel>Search for a vessel to join</SectionLabel>
      <form onSubmit={search} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Vessel name..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px' }}
        />
        <button type="submit" disabled={searching || q.trim().length < 2} style={{
          padding: '10px 16px', borderRadius: '8px', border: 'none',
          background: '#0c2a4a', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
        }}>
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {results.map(v => (
        <div key={v.id} style={{ padding: '12px', borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{v.name}</div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{v.type}{v.homePort ? ` · ${v.homePort}` : ''}</div>
          {v._myRole ? (
            <span style={{ fontSize: '12px', color: '#27500A' }}>Already a member ({ROLE_LABELS[v._myRole]})</span>
          ) : requested[v.id] ? (
            <span style={{ fontSize: '12px', color: '#888' }}>Request sent</span>
          ) : requestingId === v.id ? (
            <div>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Optional message to the captain..."
                rows={2}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '13px', resize: 'none', marginBottom: '8px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <SmallButton onClick={() => requestAccess(v.id)}>Send request</SmallButton>
                <SmallButton onClick={() => { setRequestingId(null); setMessage('') }}>Cancel</SmallButton>
              </div>
            </div>
          ) : (
            <SmallButton onClick={() => setRequestingId(v.id)}>Request to join</SmallButton>
          )}
        </div>
      ))}

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
        <SectionLabel>Create a new vessel</SectionLabel>
        {createMode ? (
          <form onSubmit={createVessel}>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Vessel name"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={creating || !newName.trim()} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: '#0c2a4a', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
              }}>
                {creating ? 'Creating...' : 'Create vessel'}
              </button>
              <SmallButton onClick={() => setCreateMode(false)}>Cancel</SmallButton>
            </div>
          </form>
        ) : (
          <button onClick={() => setCreateMode(true)} style={{
            width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px dashed rgba(0,0,0,0.2)',
            background: '#fff', color: '#555', fontSize: '13px', cursor: 'pointer'
          }}>
            + Add another vessel
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || { bg: '#eee', text: '#555' }
  return (
    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: c.bg, color: c.text, flexShrink: 0 }}>
      {ROLE_LABELS[role] || role}
    </span>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
      {children}
    </div>
  )
}

function SmallButton({ children, onClick, danger, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
      border: `1px solid ${danger ? '#A32D2D' : 'rgba(0,0,0,0.2)'}`,
      background: danger ? '#FCEBEB' : '#fff',
      color: danger ? '#791F1F' : '#333',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1
    }}>{children}</button>
  )
}

function Loading({ text }) {
  return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>{text}</div>
  )
}

function NoVessel() {
  return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
      No vessel loaded. Return to home and try again.
    </div>
  )
}
