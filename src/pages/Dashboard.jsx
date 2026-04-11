import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../api'
import { useVessel } from '../contexts/VesselContext'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning, sailor'
  if (h < 17) return 'Good afternoon, sailor'
  return 'Good evening, sailor'
}

export default function Dashboard({ userId, profile }) {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const navigate = useNavigate()
  const { vessel } = useVessel()
  const vesselId = vessel?.id

  useEffect(() => {
    if (!vesselId) return
    apiPost('logbook', { action: 'getTrips', userId, vesselId })
      .then(d => setStats(d.stats))
      .catch(() => {})
  }, [vesselId])

  useEffect(() => {
    if (stats?.totalHoursMotoring && vesselId) {
      apiPost('logbook', { action: 'checkAlerts', userId, vesselId, currentEngineHours: stats.totalHoursMotoring })
        .then(d => setAlerts(d.alerts || []))
        .catch(() => {})
    }
  }, [stats])

  const quickActions = [
    { label: 'Log trip',    icon: '⛵', path: '/logbook',     color: '#E6F1FB' },
    { label: 'Maintenance', icon: '🔧', path: '/maintenance', color: '#FAEEDA' },
    { label: 'Quiz me',     icon: '📋', path: '/quiz',        color: '#EAF3DE' },
    { label: 'Ask Captain', icon: '🧭', path: '/chat',        color: '#FCEBEB' },
  ]

  const vesselName = vessel?.name || profile?.vesselName || 'My vessel'
  const vesselSub  = vessel
    ? [vessel.make, vessel.model, vessel.year].filter(Boolean).join(' ')
    : [profile?.make, profile?.model, profile?.year].filter(Boolean).join(' ')

  return (
    <div style={{ background: '#f5f5f3', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(150deg, #0c2a4a 0%, #0e3666 100%)',
        padding: '22px 20px 60px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 30, right: 40,  width:  90, height:  90, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>
          {getGreeting()}
        </div>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.3px' }}>{vesselName}</div>
        {vesselSub
          ? <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              {vesselSub}{profile?.homePort ? ` · ${profile.homePort}` : ''}
            </div>
          : null}

        {/* Wave — fills with page-bg colour, creating a curved bottom edge */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 375 52" style={{ display: 'block', width: '100%', height: '52px' }} preserveAspectRatio="none">
            <path d="M0,26 C80,52 160,4 250,26 C310,40 345,12 375,26 L375,52 L0,52 Z" fill="#f5f5f3" />
          </svg>
        </div>
      </div>

      {/* ── Floating stat cards ───────────────────────────────────────── */}
      <div style={{ margin: '-40px 16px 0', position: 'relative', zIndex: 10 }}>
        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <StatCard label="Sailing hours"  value={stats.totalHoursSailing}  unit="h"  accent="#dbeafe" accentDark="#1d4ed8" />
            <StatCard label="Nautical miles" value={stats.totalNauticalMiles} unit="nm" accent="#dcfce7" accentDark="#166534" />
            <StatCard label="Trips logged"   value={stats.totalTrips}                   accent="#ede9fe" accentDark="#5b21b6" />
            <StatCard label="Engine hours"   value={stats.totalHoursMotoring} unit="h"  accent="#fef3c7" accentDark="#92400e" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
                <div style={{ height: '10px', width: '55%', background: '#ebebea', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ height: '24px', width: '40%', background: '#ebebea', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ height: '3px',  width: '28px', background: '#ebebea', borderRadius: '2px' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── Maintenance alerts ────────────────────────────────────────── */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map((alert, i) => (
              <div key={i} onClick={() => navigate('/maintenance')} style={{
                background: '#fffbeb', border: '1px solid #f59e0b',
                borderRadius: '12px', padding: '12px 14px',
                display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer'
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{alert.overdue ? '🔴' : '🟡'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#78350f' }}>
                    {alert.overdue ? 'Overdue maintenance' : 'Maintenance due soon'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginTop: '2px' }}>
                    {alert.overdue
                      ? `${alert.description} — was due at ${alert.dueAt} engine hrs`
                      : `${alert.description} — due in ${Math.round(alert.hoursRemaining)} engine hrs`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick log ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '24px' }}>
          <SectionLabel>Quick log</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {quickActions.map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)',
                borderRadius: '14px', padding: '14px 6px 12px',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '13px',
                  background: a.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '21px'
                }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: '10px', color: '#5f5e5a', fontWeight: '500', textAlign: 'center', lineHeight: 1.3 }}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent trips ──────────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <SectionLabel noMargin>Recent trips</SectionLabel>
            <button onClick={() => navigate('/logbook')} style={{
              background: 'none', border: 'none', fontSize: '12px',
              color: '#185FA5', cursor: 'pointer', fontWeight: '500', padding: 0
            }}>
              View all →
            </button>
          </div>
          <RecentActivity userId={userId} />
        </div>

      </div>
    </div>
  )
}

function SectionLabel({ children, noMargin }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: '600', color: '#888780',
      letterSpacing: '0.5px', textTransform: 'uppercase',
      marginBottom: noMargin ? 0 : '12px'
    }}>
      {children}
    </div>
  )
}

function StatCard({ label, value, unit, accent, accentDark }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
      border: '0.5px solid rgba(0,0,0,0.04)'
    }}>
      <div style={{ fontSize: '11px', color: '#888780', fontWeight: '500', marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
        <span style={{ fontSize: '28px', fontWeight: '700', color: '#0c2a4a', lineHeight: 1 }}>
          {value ?? '—'}
        </span>
        {unit && value != null && (
          <span style={{ fontSize: '12px', fontWeight: '600', color: accentDark }}>{unit}</span>
        )}
      </div>
      <div style={{ height: '3px', background: accent, borderRadius: '2px', marginTop: '10px', width: '32px' }} />
    </div>
  )
}

function RecentActivity({ userId }) {
  const [trips, setTrips] = useState([])
  const { vessel } = useVessel()
  const vesselId = vessel?.id

  useEffect(() => {
    if (!vesselId) return
    apiPost('logbook', { action: 'getTrips', userId, vesselId })
      .then(d => setTrips(d.trips?.slice(0, 3) || []))
      .catch(() => {})
  }, [vesselId])

  if (!trips.length) return (
    <div style={{
      textAlign: 'center', padding: '32px 16px', color: '#888780',
      fontSize: '13px', background: '#fff', borderRadius: '14px',
      border: '0.5px solid rgba(0,0,0,0.08)'
    }}>
      No trips logged yet — what are you waiting for, sailor?
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {trips.map(trip => (
        <div key={trip.id} style={{
          background: '#fff', borderRadius: '14px',
          border: '0.5px solid rgba(0,0,0,0.08)',
          padding: '14px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0c2a4a' }}>{trip.departure}</span>
            <span style={{ fontSize: '12px', color: '#c4c2be' }}>→</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0c2a4a' }}>{trip.destination}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#888780' }}>
              {new Date(trip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {trip.hoursUnderway > 0 &&
              <span style={{ fontSize: '11px', color: '#888780' }}>{trip.hoursUnderway}h underway</span>}
            {trip.nauticalMiles > 0 &&
              <span style={{ fontSize: '11px', color: '#888780' }}>{trip.nauticalMiles} nm</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
