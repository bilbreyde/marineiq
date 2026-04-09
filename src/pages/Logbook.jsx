import { useState, useEffect } from 'react'

const API = 'https://func-marineiq-prod.azurewebsites.net/api'

export default function Logbook({ userId }) {
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    departure: '', destination: '', date: new Date().toISOString().split('T')[0],
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
    } catch {}
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
          action: 'logTrip', userId,
          ...form,
          hoursUnderway: parseFloat(form.hoursUnderway) || 0,
          hoursMotoring: parseFloat(form.hoursMotoring) || 0,
          nauticalMiles: parseFloat(form.nauticalMiles) || 0,
          crew: parseInt(form.crew) || 1
        })
      })
      setShowForm(false)
      setForm({ departure: '', destination: '', date: new Date().toISOString().split('T')[0], hoursUnderway: '', hoursMotoring: '', nauticalMiles: '', crew: 1, conditions: '', notes: '', certCategory: '' })
      loadTrips()
    } catch {}
    finally { setSaving(false) }
  }

  const inputStyle = {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 16px', background: '#f0f4f8' }}>
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
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0c2a4a', marginBottom: '4px' }}>New trip entry</div>
          {[
            { key: 'departure', label: 'Departure', placeholder: 'Dinner Key Marina, Miami' },
            { key: 'destination', label: 'Destination', placeholder: 'Dry Tortugas' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>{f.label}</div>
              <input style={inputStyle} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Date</div>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Crew</div>
              <input type="number" style={inputStyle} value={form.crew} min="1" onChange={e => setForm(p => ({ ...p, crew: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Hours underway</div>
