import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://func-marineiq-prod.azurewebsites.net/api'

export default function Dashboard({ userId }) {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/logbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getTrips', userId })
    })
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => {})
  }, [userId])

  const quickActions = [
    { label: 'Log trip', icon: '⛵', path: '/logbook', color: '#E6F1FB' },
    { label: 'Maintenance', icon: '🔧', path: '/maintenance', color: '#FAEEDA' },
    { label: 'Quiz me', icon: '📋', path: '/quiz', color: '#EAF3DE' },
    { label: 'Ask Captain', icon: '🧭', path: '/chat', color: '#FCEBEB' },
  ]

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '20px 16px 24px', color: '#fff' }}>
        <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>Welcome back, sailor</div>
        <div style={{ fontSize: '22px', fontWeight: '600' }}>S/V Blue Horizon</div>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
            <StatBox label="Sailing hours" value={stats.totalHoursSailing} />
            <StatBox label="Nautical miles" value={stats.totalNauticalMiles} />
            <StatBox label="Trips logged" value={stats.totalTrips} />
            <StatBox label="Motoring hours" value={stats.totalHoursMotoring} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#888780', marginBottom: '12px' }}>Quick log</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {quickActions.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', padding: '0'
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {a.icon}
              </div>
              <span style={{ fontSize: '10px', color: '#5f5e5a', textAlign: 'center' }}>{a.label}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', fontWeight: '500', color: '#888780', marginBottom: '12px' }}>Recent activity</div>
        <RecentActivity userId={userId} />
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 12px' }}>
      <div style={{ fontSize: '20px', fontWeight: '600' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{label}</div>
    </div>
  )
}

function RecentActivity({ userId }) {
  const [trips, setTrips] = useState([])

  useEffect(() => {
    fetch(`${API}/logbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getTrips', userId })
    })
      .then(r => r.json())
      .then(d => setTrips(d.trips?.slice(0, 3) || []))
      .catch(() => {})
  }, [userId])

  if (!trips.length) return (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#888780', fontSize: '13px' }}>
      No trips logged yet — what are you waiting for, sailor?
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {trips.map(trip => (
        <div key={trip.id} style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
          borderRadius: '12px', padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>⛵</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trip.departure} → {trip.destination}
            </div>
            <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
              {new Date(trip.date).toLocaleDateString()} · {trip.hoursUnderway}h · {trip.nauticalMiles}nm
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
