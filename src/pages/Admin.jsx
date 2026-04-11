import { useState, useEffect } from 'react'
import { apiPost } from '../api'

const ADMIN_EMAIL = 'don.bilbrey@gmail.com'

export default function Admin({ user }) {
  if (user?.email !== ADMIN_EMAIL) return null

  return <AdminPanel />
}

function AdminPanel() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [vessels, setVessels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [ud, vd] = await Promise.all([
        apiPost('admin', { action: 'listUsers' }),
        apiPost('admin', { action: 'listVessels' })
      ])
      if (ud.error) throw new Error(`Users: ${ud.error}`)
      if (vd.error) throw new Error(`Vessels: ${vd.error}`)
      setUsers(ud.users || [])
      setVessels(vd.vessels || [])
    } catch (e) {
      setError(e.message)
    }
    finally { setLoading(false) }
  }

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'vessels', label: 'Vessels' }
  ]

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.15)', fontSize: '13px',
    background: '#fff', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box'
  }

  const filteredUsers = search.trim()
    ? users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const filteredVessels = search.trim()
    ? vessels.filter(v =>
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.hullId?.toLowerCase().includes(search.toLowerCase()) ||
        v.members?.some(m => m.userEmail?.toLowerCase().includes(search.toLowerCase()))
      )
    : vessels

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#0c2a4a', padding: '16px' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600' }}>Admin</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>Owner access only</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#fff', padding: '0 16px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setExpanded(null) }} style={{
            padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: tab === t.id ? '600' : '400',
            color: tab === t.id ? '#0c2a4a' : '#888780',
            borderBottom: tab === t.id ? '2px solid #0c2a4a' : '2px solid transparent',
            marginBottom: '-1px'
          }}>{t.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={loadAll} style={{
          padding: '8px 12px', border: 'none', background: 'none',
          fontSize: '12px', color: '#888780', cursor: 'pointer', alignSelf: 'center'
        }}>Refresh</button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 8px' }}>
        <input style={inp} placeholder={tab === 'users' ? 'Search by name or email...' : 'Search by vessel name, HIN, or member email...'}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#888780', fontSize: '13px' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: '24px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '13px' }}>
            {error}
          </div>
        ) : tab === 'users' ? (
          <>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '10px', fontWeight: '600' }}>
              {filteredUsers.length} USER{filteredUsers.length !== 1 ? 'S' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredUsers.map(u => {
                const isOpen = expanded === u.id
                const captain = u.vessels?.filter(v => v.role === 'captain') || []
                const crew = u.vessels?.filter(v => v.role !== 'captain') || []
                return (
                  <div key={u.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
                    <button onClick={() => setExpanded(isOpen ? null : u.id)} style={{
                      width: '100%', padding: '12px 14px', border: 'none', background: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left'
                    }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', background: '#185FA5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '600', color: '#fff', flexShrink: 0
                      }}>
                        {(u.name || u.email || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{u.name || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#5f5e5a', marginTop: '1px' }}>{u.email}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', color: '#888780' }}>
                          {u.vessels?.length || 0} vessel{u.vessels?.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                      <span style={{ color: '#aaa', fontSize: '11px', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', padding: '10px 14px', background: '#fafafa' }}>
                        <div style={{ fontSize: '11px', color: '#888780', marginBottom: '6px', fontWeight: '600' }}>VESSEL MEMBERSHIPS</div>
                        {u.vessels?.length === 0 ? (
                          <div style={{ fontSize: '12px', color: '#aaa' }}>No vessel memberships</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {u.vessels.map((v, i) => {
                              const vessel = vessels.find(vs => vs.id === v.vesselId)
                              return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                  <span style={{
                                    padding: '1px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                                    background: v.role === 'captain' ? '#0c2a4a' : v.role === 'first_mate' ? '#185FA5' : '#e0eaf5',
                                    color: v.role === 'crew' ? '#0c2a4a' : '#fff'
                                  }}>{v.role}</span>
                                  <span style={{ color: '#1a1a1a' }}>{vessel?.name || v.vesselId}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <div style={{ marginTop: '8px', fontSize: '10px', color: '#bbb', fontFamily: 'monospace' }}>
                          ID: {u.userId || u.id}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '10px', fontWeight: '600' }}>
              {filteredVessels.length} VESSEL{filteredVessels.length !== 1 ? 'S' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredVessels.map(v => {
                const isOpen = expanded === v.id
                const captain = v.members?.find(m => m.role === 'captain')
                return (
                  <div key={v.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
                    <button onClick={() => setExpanded(isOpen ? null : v.id)} style={{
                      width: '100%', padding: '12px 14px', border: 'none', background: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left'
                    }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>⛵</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{v.name}</div>
                        <div style={{ fontSize: '11px', color: '#5f5e5a', marginTop: '1px' }}>
                          {captain?.userEmail || '—'}
                          {v.type && <span style={{ color: '#aaa' }}> · {v.type}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', color: '#888780' }}>
                          {v.members?.length || 0} member{v.members?.length !== 1 ? 's' : ''}
                        </div>
                        {v.hullId && (
                          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px', fontFamily: 'monospace' }}>{v.hullId}</div>
                        )}
                      </div>
                      <span style={{ color: '#aaa', fontSize: '11px', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', padding: '10px 14px', background: '#fafafa' }}>
                        <div style={{ fontSize: '11px', color: '#888780', marginBottom: '6px', fontWeight: '600' }}>CREW</div>
                        {v.members?.length === 0 ? (
                          <div style={{ fontSize: '12px', color: '#aaa' }}>No active members</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {v.members.map((m, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                <span style={{
                                  padding: '1px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                                  background: m.role === 'captain' ? '#0c2a4a' : m.role === 'first_mate' ? '#185FA5' : '#e0eaf5',
                                  color: m.role === 'crew' ? '#0c2a4a' : '#fff'
                                }}>{m.role}</span>
                                <span style={{ color: '#1a1a1a' }}>{m.userName || '—'}</span>
                                <span style={{ color: '#888780' }}>{m.userEmail}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {v.homePort && (
                          <div style={{ marginTop: '8px', fontSize: '11px', color: '#888780' }}>Home port: {v.homePort}</div>
                        )}
                        <div style={{ marginTop: '6px', fontSize: '10px', color: '#bbb' }}>
                          Created {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
