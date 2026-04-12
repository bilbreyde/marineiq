import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../api'

const VESSEL_TYPES = ['All types', 'Sailboat', 'Powerboat', 'Catamaran', 'Trawler', 'Center console', 'Other']

export default function Admin({ user }) {
  const navigate = useNavigate()
  const [vessels, setVessels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [portFilter, setPortFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost('vessels', { action: 'searchFleet' })
      if (data.error) throw new Error(data.error)
      setVessels(data.vessels || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Unique home ports for the port filter dropdown
  const allPorts = useMemo(() => {
    const ports = [...new Set(vessels.map(v => v.homePort).filter(Boolean))].sort()
    return ports
  }, [vessels])

  const filtered = useMemo(() => {
    return vessels.filter(v => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        v.name?.toLowerCase().includes(q) ||
        v.captainName?.toLowerCase().includes(q) ||
        v.homePort?.toLowerCase().includes(q) ||
        v.make?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.hullId?.toLowerCase().includes(q)
      const matchType = typeFilter === 'All types' || v.type === typeFilter
      const matchPort = !portFilter || v.homePort === portFilter
      return matchSearch && matchType && matchPort
    })
  }, [vessels, search, typeFilter, portFilter])

  const inp = {
    padding: '9px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.15)',
    fontSize: '13px', background: '#fff', fontFamily: 'inherit', outline: 'none'
  }

  const sel = { ...inp, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(150deg,#0c2a4a 0%,#0e3666 100%)', padding: '20px 16px 28px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Fleet</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>
          Find vessels and sailors in the MarineIQ network
        </div>
      </div>

      <div style={{ padding: '0 16px', maxWidth: '700px', margin: '0 auto' }}>
        {/* Search + filters card */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '14px', marginTop: '-14px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
            placeholder="Search by vessel name, captain, home port, make / model…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select style={sel} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {VESSEL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select style={sel} value={portFilter} onChange={e => setPortFilter(e.target.value)}>
              <option value=''>All ports</option>
              {allPorts.map(p => <option key={p}>{p}</option>)}
            </select>
            {(search || typeFilter !== 'All types' || portFilter) && (
              <button onClick={() => { setSearch(''); setTypeFilter('All types'); setPortFilter('') }}
                style={{ padding: '9px 14px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.15)', background: '#f5f5f3', fontSize: '12px', cursor: 'pointer', color: '#5f5e5a', fontFamily: 'inherit' }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div style={{ marginTop: '16px', paddingBottom: '32px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e8e8e6' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ height: '14px', borderRadius: '4px', background: '#e8e8e6', width: '40%' }} />
                    <div style={{ height: '11px', borderRadius: '4px', background: '#ededeb', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: '20px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {error}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '11px', color: '#888780', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {filtered.length} vessel{filtered.length !== 1 ? 's' : ''}
                {filtered.length !== vessels.length && ` of ${vessels.length}`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888780', fontSize: '13px' }}>
                    No vessels match your filters.
                  </div>
                ) : filtered.map(v => {
                  const isOpen = expanded === v.id
                  return (
                    <div key={v.id} style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      <button onClick={() => setExpanded(isOpen ? null : v.id)} style={{
                        width: '100%', padding: '14px', border: 'none', background: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left'
                      }}>
                        {/* Vessel icon / type badge */}
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px',
                          background: v.type === 'Sailboat' ? '#e0eaf5' : v.type === 'Powerboat' ? '#e5f0e8' : v.type === 'Catamaran' ? '#f0e8f5' : '#f0ede8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0
                        }}>
                          {v.type === 'Sailboat' ? '⛵' : v.type === 'Powerboat' ? '🚤' : v.type === 'Catamaran' ? '⛵' : '🛥️'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{v.name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                            {[v.make, v.model, v.year].filter(Boolean).join(' ')}
                            {v.homePort && <span> · {v.homePort}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {v.type && (
                            <div style={{ fontSize: '10px', background: '#f0f0ee', borderRadius: '20px', padding: '2px 8px', color: '#5f5e5a', display: 'inline-block', marginBottom: '3px' }}>
                              {v.type}
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: '#aaa' }}>
                            {v.crewCount} crew
                          </div>
                        </div>
                        <span style={{ color: '#ccc', fontSize: '11px' }}>{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {isOpen && (
                        <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)', padding: '14px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { label: 'Captain', val: v.captainName || '—' },
                            { label: 'Home port', val: v.homePort || '—' },
                            { label: 'Length', val: v.lengthFt ? `${v.lengthFt} ft` : null },
                            { label: 'Hull ID (HIN)', val: v.hullId || null },
                          ].filter(r => r.val).map(r => (
                            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: '#888780' }}>{r.label}</span>
                              <span style={{ fontWeight: '500', fontFamily: r.label === 'Hull ID (HIN)' ? 'monospace' : 'inherit' }}>{r.val}</span>
                            </div>
                          ))}
                          {v.captainId && v.captainId !== user?.userId && (
                            <button
                              onClick={() => navigate(`/messages?to=${encodeURIComponent(v.captainId)}&name=${encodeURIComponent(v.captainName || 'Sailor')}`)}
                              style={{
                                marginTop: '4px', padding: '8px 14px', borderRadius: '8px',
                                background: '#185FA5', color: '#fff', border: 'none',
                                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                fontFamily: 'inherit', alignSelf: 'flex-start'
                              }}>
                              💬 Message {v.captainName || 'Captain'}
                            </button>
                          )}
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
    </div>
  )
}
