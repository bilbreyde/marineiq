import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../api'
import { useVessel } from '../contexts/VesselContext'

export default function Profile({ user, onUpdate }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [hullId, setHullId] = useState('')
  const { vessel, refresh: refreshVessel } = useVessel()
  const navigate = useNavigate()

  useEffect(() => { loadProfile() }, [])
  useEffect(() => { if (vessel) setHullId(vessel.hullId || '') }, [vessel])

  async function loadProfile() {
    setLoading(true)
    try {
      const data = await apiPost('profile', { action: 'getProfile', userId: user.userId })
      setProfile(data.profile)
      if (data.profile) setForm(data.profile)
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function save() {
    setSaving(true)
    try {
      // Save user profile (users collection)
      await apiPost('profile', {
        action: 'saveProfile',
        userId: user.userId,
        name: user.name,
        provider: user.provider,
        ...form
      })

      // Save HIN to vessel (vessels collection) if we have one
      if (vessel) {
        await apiPost('vessels', {
          action: 'update',
          vesselId: vessel.id,
          hullId: hullId.trim().toUpperCase().replace(/[\s-]/g, ''),
          // Keep vessel name in sync with profile vessel name if changed
          name: form.vesselName || vessel.name
        })
        await refreshVessel()
      }

      setProfile({ ...profile, ...form })
      setEditing(false)
      if (onUpdate) onUpdate({ ...profile, ...form })
    } catch (e) {
      alert(e.error || e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', padding: '8px 10px', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '13px',
    background: '#f5f5f3', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box'
  }

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#888780', fontSize: '13px' }}>
      Loading your profile...
    </div>
  )

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600' }}>My profile</div>
        <button onClick={() => setEditing(!editing)} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', padding: '7px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer'
        }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* User card */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#888780', marginTop: '2px' }}>Signed in via {user.provider}</div>
          </div>
        </div>

        {profile && !editing ? (
          <>
            {/* Vessel section — shows data from both profile and vessel context */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '500', color: '#5f5e5a', borderBottom: '0.5px solid rgba(0,0,0,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Vessel</span>
                <button onClick={() => navigate('/vessel')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                  Crew &amp; settings →
                </button>
              </div>
              {[
                { label: 'Name', val: vessel?.name || profile.vesselName },
                { label: 'Hull ID (HIN)', val: vessel?.hullId || null },
                { label: 'Type', val: vessel?.type || profile.vesselType },
                { label: 'Make / model', val: [vessel?.make || profile.make, vessel?.model || profile.model].filter(Boolean).join(' ') || null },
                { label: 'Year', val: vessel?.year || profile.year },
                { label: 'Home port', val: vessel?.homePort || profile.homePort },
              ].filter(r => r.val).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: '13px', gap: '12px' }}>
                  <span style={{ color: '#888780', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontWeight: '500', fontFamily: row.label === 'Hull ID (HIN)' ? 'monospace' : 'inherit', textAlign: 'right' }}>{row.val}</span>
                </div>
              ))}
              {/* HIN prompt if missing */}
              {!vessel?.hullId && (
                <div style={{ padding: '10px 14px', fontSize: '12px', color: '#888780', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#C17B2A' }}>⚠</span>
                  No Hull ID set — tap Edit to add your HIN and prevent duplicate registrations.
                </div>
              )}
            </div>

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {[
                { label: 'Length', val: (vessel?.lengthFt || profile.lengthFt) ? `${vessel?.lengthFt || profile.lengthFt} ft` : null },
                { label: 'Beam', val: (vessel?.beamFt || profile.beamFt) ? `${vessel?.beamFt || profile.beamFt} ft` : null },
                { label: 'Draft', val: (vessel?.draftFt || profile.draftFt) ? `${vessel?.draftFt || profile.draftFt} ft` : null },
                { label: 'Hull speed', val: (vessel?.hullSpeed || profile.hullSpeed) ? `${vessel?.hullSpeed || profile.hullSpeed} kts` : null },
              ].filter(s => s.val).map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: '#888780', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Safety section */}
            {(profile.mmsi || profile.callSign || profile.emergencyContact) && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '500', color: '#5f5e5a', borderBottom: '0.5px solid rgba(0,0,0,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safety</div>
                {[
                  { label: 'MMSI', val: profile.mmsi },
                  { label: 'Call sign', val: profile.callSign },
                  { label: 'Emergency contact', val: profile.emergencyContact },
                ].filter(r => r.val).map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: '13px' }}>
                    <span style={{ color: '#888780' }}>{row.label}</span>
                    <span style={{ fontWeight: '500' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : editing ? (
          <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            <FieldLabel>Vessel name</FieldLabel>
            <input style={inp} placeholder="S/V Blue Horizon" value={form.vesselName || ''} onChange={e => set('vesselName', e.target.value)} />

            <FieldLabel>Hull ID (HIN)</FieldLabel>
            <input
              style={{ ...inp, fontFamily: 'monospace', textTransform: 'uppercase' }}
              placeholder="ABC12345D101"
              maxLength={12}
              value={hullId}
              onChange={e => setHullId(e.target.value.toUpperCase().replace(/[\s-]/g, ''))}
            />
            <div style={{ fontSize: '11px', color: '#888780', marginTop: '-6px' }}>
              12-character number stamped on the transom. Globally unique — prevents duplicate registrations.
            </div>

            <FieldLabel>Home port</FieldLabel>
            <input style={inp} placeholder="Dinner Key, Miami" value={form.homePort || ''} onChange={e => set('homePort', e.target.value)} />

            <FieldLabel>Make</FieldLabel>
            <input style={inp} placeholder="Hunter" value={form.make || ''} onChange={e => set('make', e.target.value)} />

            <FieldLabel>Model</FieldLabel>
            <input style={inp} placeholder="38" value={form.model || ''} onChange={e => set('model', e.target.value)} />

            <FieldLabel>Year</FieldLabel>
            <input style={inp} placeholder="2008" value={form.year || ''} onChange={e => set('year', e.target.value)} />

            <FieldLabel>Engine</FieldLabel>
            <input style={inp} placeholder="Yanmar 3YM30" value={form.engine || ''} onChange={e => set('engine', e.target.value)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { key: 'lengthFt', label: 'Length (ft)', placeholder: '38' },
                { key: 'beamFt', label: 'Beam (ft)', placeholder: '12.5' },
                { key: 'draftFt', label: 'Draft (ft)', placeholder: '5.5' },
                { key: 'hullSpeed', label: 'Hull speed (kts)', placeholder: '8.2' },
              ].map(f => (
                <div key={f.key}>
                  <FieldLabel>{f.label}</FieldLabel>
                  <input type="number" step="0.1" style={inp} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>

            <FieldLabel>MMSI</FieldLabel>
            <input style={inp} placeholder="123456789" value={form.mmsi || ''} onChange={e => set('mmsi', e.target.value)} />

            <FieldLabel>Call sign</FieldLabel>
            <input style={inp} placeholder="WDC1234" value={form.callSign || ''} onChange={e => set('callSign', e.target.value)} />

            <FieldLabel>Emergency contact</FieldLabel>
            <input style={inp} placeholder="Name and phone" value={form.emergencyContact || ''} onChange={e => set('emergencyContact', e.target.value)} />

            <button onClick={save} disabled={saving} style={{
              padding: '12px', borderRadius: '10px', background: '#0c2a4a',
              color: '#fff', border: 'none', fontSize: '14px', fontWeight: '500',
              opacity: saving ? 0.7 : 1, cursor: saving ? 'default' : 'pointer',
              marginTop: '4px'
            }}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: '11px', color: '#888780', marginBottom: '2px' }}>{children}</div>
}
