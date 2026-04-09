import { useState, useEffect } from 'react'

import { apiPost } from '../api'

export default function Logbook({ userId }) {
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    departure: '', destination: '',
    date: new Date().toISOString().split('T')[0],
    hoursUnderway: '', hoursMotoring: '', nauticalMiles: '',
    crew: 1, conditions: '', notes: '', certCategory: ''
  })

  useEffect(() => { loadTrips() }, [])

  async function loadTrips() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/logbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getTrips', userId })
      })
      const data = await res.json()
      setTrips(data.trips || [])
      setStats(data.stats || null)
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function saveTrip() {
    if (!form.departure || !form.destination) return
    setSaving(true)
    try {
      await fetch(`${API}/logbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logTrip', userId, ...form,
          hoursUnderway: parseFloat(form.hoursUnderway) || 0,
          hoursMotoring: parseFloat(form.hoursMotoring) || 0,
          nauticalMiles: parseFloat(form.nauticalMiles) || 0,
          crew: parseInt(form.crew) || 1
        })
      })
      setShowForm(false)
      setForm({
        departure: '', destination: '',
        date: new Date().toISOString().split('T')[0],
        hoursUnderway: '', hoursMotoring: '', nauticalMiles: '',
        crew: 1, conditions: '', notes: '', certCategory: ''
      })
      loadTrips()
    } catch (e) {}
    finally { setSaving(false) }
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px',
    background: '#f5f5f3', fontFamily: 'inherit', outline: 'none'
  }

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600' }}>Trip Logbook</div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', padding: '7px 14px', borderRadius: '20px', fontSize: '13px'
        }}>
          {showForm ? 'Cancel' : '+ Log trip'}
        </button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', padding: '12px 16px', background: '#f0f4f8' }}>
          {[
            { label: 'Trips', value: stats.totalTrips },
            { label: 'Hours', value: stats.totalHoursSailing },
            { label: 'Miles', value: stats.totalNauticalMiles }
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#185FA5' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#888780', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ margin: '12px 16px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.12)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0c2a4a' }}>New trip entry</div>
          {[
            { key: 'departure', label: 'Departure', placeholder: 'Dinner Key Marina' },
            { key: 'destination', label: 'Destination', placeholder: 'Dry Tortugas' }
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>{f.label}</div>
              <input style={inp} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Date</div>
              <input type="date" style={inp} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Crew</div>
              <input type="number" style={inp} value={form.crew} min="1" onChange={e => setForm(p => ({ ...p, crew: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Hours underway</div>
              <input type="number" step="0.1" style={inp} placeholder="0.0" value={form.hoursUnderway} onChange={e => setForm(p => ({ ...p, hoursUnderway: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Hours motoring</div>
              <input type="number" step="0.1" style={inp} placeholder="0.0" value={form.hoursMotoring} onChange={e => setForm(p => ({ ...p, hoursMotoring: e.target.value }))} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Nautical miles</div>
            <input type="number" step="0.1" style={inp} placeholder="0" value={form.nauticalMiles} onChange={e => setForm(p => ({ ...p, nauticalMiles: e.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Conditions</div>
            <input style={inp} placeholder="ESE 15kts, 2ft seas..." value={form.conditions} onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Notes</div>
            <textarea style={{ ...inp, minHeight: '72px', resize: 'vertical' }} placeholder="Anything worth remembering..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Certification category</div>
            <select style={inp} value={form.certCategory} onChange={e => setForm(p => ({ ...p, certCategory: e.target.value }))}>
              <option value="">None</option>
              <option value="ASA-101">ASA 101</option>
              <option value="ASA-103">ASA 103</option>
              <option value="ASA-104">ASA 104</option>
              <option value="ASA-106">ASA 106</option>
              <option value="USCG">USCG</option>
            </select>
          </div>
          <button onClick={saveTrip} disabled={saving} style={{
            padding: '12px', borderRadius: '10px', background: '#0c2a4a',
            color: '#fff', border: 'none', fontSize: '14px', fontWeight: '500',
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'Logging entry...' : 'Log this trip'}
          </button>
        </div>
      )}

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px' }}>Loading logbook...</div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px', fontStyle: 'italic' }}>
            No trips logged yet. The tide is waiting, sailor.
          </div>
        ) : trips.map(trip => (
          <div key={trip.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                &#9973;
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {trip.departure} to {trip.destination}
                </div>
                <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                  {new Date(trip.date).toLocaleDateString()} &middot; {trip.crew} crew
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#E6F1FB', color: '#0C447C', fontWeight: '500' }}>
                    {trip.hoursUnderway}h underway
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#EAF3DE', color: '#27500A', fontWeight: '500' }}>
                    {trip.nauticalMiles}nm
                  </span>
                  {trip.certCategory ? (
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#FAEEDA', color: '#633806', fontWeight: '500' }}>
                      {trip.certCategory}
                    </span>
                  ) : null}
                </div>
                {trip.conditions ? (
                  <div style={{ fontSize: '11px', color: '#5f5e5a', marginTop: '6px' }}>{trip.conditions}</div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
