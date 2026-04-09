import { useState, useEffect } from 'react'
import { apiPost } from '../api'

export default function Profile({ user, onUpdate }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadProfile() }, [])

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
      await apiPost('profile', {
        action: 'saveProfile',
        userId: user.userId,
        name: user.name,
        provider: user.provider,
        ...form
      })
      setProfile({ ...profile, ...form })
      setEditing(false)
      if (onUpdate) onUpdate({ ...profile, ...form })
    } catch (e) {}
    finally { setSaving(false) }
  }

  const inp = {
    width: '100%', padding: '8px 10px', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '13px',
    background: '#f5f5f3', fontFamily: 'inherit', outline: 'none'
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
            <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '500', color: '#5f5e5a', borderBottom: '0.5px solid rgba(0,0,0,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vessel</div>
              {[
                { label: 'Name', val: profile.vesselName },
                { label: 'Type', val: profile.vesselType },
                { label: 'Make / model', val: `${profile.make} ${profile.model}`.trim() },
                { label: 'Year', val: profile.year },
                { label: 'Home port', val: profile.homePort },
              ].filter(r => r.val).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: '13px' }}>
                  <span style={{ color: '#888780' }}>{row.label}</span>
                  <span style={{ fontWeight: '500' }}>{row.val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {[
                { label: 'Length', val: profile.lengthFt ? `${profile.lengthFt} ft` : null },
                { label: 'Beam', val: profile.beamFt ? `${profile.beamFt} ft` : null },
                { label: 'Draft', val: profile.draftFt ? `${profile.draftFt} ft` : null },
                { label: 'Hull speed', val: profile.hullSpeed ? `${profile.hullSpeed} kts` : null },
              ].filter(s => s.val).map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: '#888780', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

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
            {[
              { key: 'vesselName', label: 'Vessel name', placeholder: 'S/V Blue Horizon' },
              { key: 'homePort', label: 'Home port', placeholder: 'Dinner Key, Miami' },
              { key: 'make', label: 'Make', placeholder: 'Hunter' },
              { key: 'model', label: 'Model', placeholder: '38' },
              { key: 'year', label: 'Year', placeholder: '2008' },
              { key: 'engine', label: 'Engine', placeholder: 'Yanmar 3YM30' },
              { key: 'mmsi', label: 'MMSI', placeholder: '123456789' },
              { key: 'callSign', label: 'Call sign', placeholder: 'WDC1234' },
              { key: 'emergencyContact', label: 'Emergency contact', placeholder: 'Name and phone' },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>{f.label}</div>
                <input style={inp} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { key: 'lengthFt', label: 'Length (ft)', placeholder: '38' },
                { key: 'beamFt', label: 'Beam (ft)', placeholder: '12.5' },
                { key: 'draftFt', label: 'Draft (ft)', placeholder: '5.5' },
                { key: 'hullSpeed', label: 'Hull speed (kts)', placeholder: '8.2' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>{f.label}</div>
                  <input type="number" step="0.1" style={inp} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
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
