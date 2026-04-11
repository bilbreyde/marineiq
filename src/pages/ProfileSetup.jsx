import { useState } from 'react'
import { apiPost } from '../api'

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px',
  background: '#f5f5f3', fontFamily: 'inherit', outline: 'none'
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

export default function ProfileSetup({ user, onComplete }) {
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState(user.name || '')
  const [form, setForm] = useState({
    vesselName: '',
    vesselType: 'Sailboat',
    hullId: '',
    make: '',
    model: '',
    year: '',
    homePort: '',
    lengthFt: '',
    beamFt: '',
    draftFt: '',
    hullSpeed: '',
    engine: '',
    mmsi: '',
    callSign: '',
    emergencyContact: ''
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  async function save() {
    if (!form.vesselName || !form.homePort) return
    setSaving(true)
    try {
      await apiPost('profile', {
        action: 'saveProfile',
        userId: user.userId,
        name: displayName || user.name,
        email: user.email || '',
        provider: user.provider,
        ...form
      })
      onComplete()
    } catch (e) {}
    finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      <div style={{ background: '#0c2a4a', padding: '16px 20px', color: '#fff' }}>
        <div style={{ fontSize: '17px', fontWeight: '600' }}>Tell me about your vessel</div>
        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '3px' }}>Captain Cole needs to know your boat</div>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
              {(displayName || user.email || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888780' }}>Signed in via {user.provider}</div>
              <div style={{ fontSize: '11px', color: '#888780', marginTop: '1px' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Your display name</div>
          <input
            style={inp}
            placeholder="Don Bilbrey"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </div>

        <Section title="Vessel identity">
          <Field label="Vessel name *">
            <input style={inp} placeholder="S/V Blue Horizon" value={form.vesselName} onChange={e => set('vesselName', e.target.value)} />
          </Field>
          <Field label="Vessel type">
            <select style={inp} value={form.vesselType} onChange={e => set('vesselType', e.target.value)}>
              <option>Sailboat</option>
              <option>Powerboat</option>
              <option>Catamaran</option>
              <option>Trawler</option>
              <option>Center console</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Hull ID (HIN)">
            <input
              style={{ ...inp, fontFamily: 'monospace' }}
              placeholder="ABC12345D101"
              maxLength={12}
              value={form.hullId}
              onChange={e => set('hullId', e.target.value.toUpperCase().replace(/[\s-]/g, ''))}
            />
            <div style={{ fontSize: '10px', color: '#888780', marginTop: '3px' }}>
              Optional — 12-character number on your transom. Prevents duplicate vessel registrations.
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Make">
              <input style={inp} placeholder="Hunter" value={form.make} onChange={e => set('make', e.target.value)} />
            </Field>
            <Field label="Model">
              <input style={inp} placeholder="38" value={form.model} onChange={e => set('model', e.target.value)} />
            </Field>
            <Field label="Year">
              <input type="number" style={inp} placeholder="2008" value={form.year} onChange={e => set('year', e.target.value)} />
            </Field>
            <Field label="Home port *">
              <input style={inp} placeholder="Dinner Key, Miami" value={form.homePort} onChange={e => set('homePort', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Specifications">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Length overall (ft)">
              <input type="number" step="0.1" style={inp} placeholder="38" value={form.lengthFt} onChange={e => set('lengthFt', e.target.value)} />
            </Field>
            <Field label="Beam (ft)">
              <input type="number" step="0.1" style={inp} placeholder="12.5" value={form.beamFt} onChange={e => set('beamFt', e.target.value)} />
            </Field>
            <Field label="Draft (ft)">
              <input type="number" step="0.1" style={inp} placeholder="5.5" value={form.draftFt} onChange={e => set('draftFt', e.target.value)} />
            </Field>
            <Field label="Hull speed (kts)">
              <input type="number" step="0.1" style={inp} placeholder="8.2" value={form.hullSpeed} onChange={e => set('hullSpeed', e.target.value)} />
            </Field>
          </div>
          <Field label="Engine">
            <input style={inp} placeholder="Yanmar 3YM30" value={form.engine} onChange={e => set('engine', e.target.value)} />
          </Field>
        </Section>

        <Section title="Safety and comms">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="MMSI number">
              <input style={inp} placeholder="123456789" value={form.mmsi} onChange={e => set('mmsi', e.target.value)} />
            </Field>
            <Field label="Call sign">
              <input style={inp} placeholder="WDC1234" value={form.callSign} onChange={e => set('callSign', e.target.value)} />
            </Field>
          </div>
          <Field label="Emergency contact">
            <input style={inp} placeholder="Name and phone number" value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} />
          </Field>
        </Section>

        <button onClick={save} disabled={saving || !form.vesselName || !form.homePort} style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: saving || !form.vesselName || !form.homePort ? '#ccc' : '#0c2a4a',
          color: '#fff', border: 'none', fontSize: '15px', fontWeight: '500',
          cursor: saving || !form.vesselName || !form.homePort ? 'default' : 'pointer',
          marginBottom: '24px'
        }}>
          {saving ? 'Saving...' : 'Set sail with MarineIQ'}
        </button>
      </div>
    </div>
  )
}
