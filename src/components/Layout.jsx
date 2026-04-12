import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useVessel } from '../contexts/VesselContext'

const navItems = [
  { path: '/', label: 'Home', icon: '⚓' },
  { path: '/logbook', label: 'Logbook', icon: '📓' },
  { path: '/quiz', label: 'Train', icon: '📋' },
  { path: '/chat', label: 'Captain', icon: '🧭' },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { path: '/admin', label: 'Fleet', icon: '🌊' },
  { path: '/messages', label: 'Messages', icon: '💬' },
  { path: '/profile', label: 'Profile', icon: '👤' },
]

function getNavItems() {
  return navItems
}

export default function Layout({ children, user, logout, unreadMessages = 0 }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <DesktopSidebar user={user} logout={logout} unreadMessages={unreadMessages} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '100%', overflowX: 'hidden' }}>
        <MobileVesselBanner />
        <main style={{ flex: 1, paddingBottom: '80px' }}>
          {children}
        </main>
      </div>
      <MobileNav user={user} unreadMessages={unreadMessages} />
    </div>
  )
}

function VesselSwitcher({ dark }) {
  const { vessel, vessels, selectVessel } = useVessel()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!vessel) return null

  const textColor = dark ? 'rgba(255,255,255,0.85)' : '#0c2a4a'
  const subColor = dark ? 'rgba(255,255,255,0.45)' : '#888780'
  const borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
  const dropBg = dark ? '#0a2240' : '#fff'
  const dropBorder = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const hoverBg = dark ? 'rgba(255,255,255,0.08)' : '#f5f5f5'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: `1px solid ${borderColor}`,
          borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', width: '100%'
        }}
      >
        <span style={{ fontSize: '14px' }}>⛵</span>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {vessel.name}
          </div>
          <div style={{ fontSize: '10px', color: subColor }}>Switch vessel</div>
        </div>
        <span style={{ color: subColor, fontSize: '10px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: dropBg, border: `1px solid ${dropBorder}`,
          borderRadius: '10px', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          {vessels.map(v => (
            <button
              key={v.id}
              onClick={() => { selectVessel(v); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 12px', border: 'none', cursor: 'pointer',
                background: v.id === vessel.id ? hoverBg : 'transparent',
                fontSize: '12px', fontWeight: v.id === vessel.id ? '600' : '400',
                color: textColor
              }}
            >
              {v.name}
              {v.id === vessel.id && <span style={{ color: subColor, marginLeft: '6px' }}>✓</span>}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${dropBorder}` }}>
            <button
              onClick={() => { navigate('/vessel'); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 12px', border: 'none', cursor: 'pointer',
                background: 'transparent', fontSize: '12px', color: subColor
              }}
            >
              + Manage vessels &amp; crew
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileVesselBanner() {
  return (
    <>
      <style>{`
        .mobile-vessel-banner { display: flex; }
        @media (min-width: 768px) { .mobile-vessel-banner { display: none !important; } }
      `}</style>
      <div className="mobile-vessel-banner" style={{
        background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        padding: '8px 14px'
      }}>
        <VesselSwitcher dark={false} />
      </div>
    </>
  )
}

function DesktopSidebar({ user, logout, unreadMessages }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const navItems = getNavItems()

  return (
    <aside style={{
      width: '220px', background: '#0c2a4a', minHeight: '100vh',
      display: 'none', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh'
    }} className="desktop-sidebar">
      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-nav { display: none !important; }
          main { padding-bottom: 0 !important; }
        }
      `}</style>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>&#9875; MarineIQ</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', marginBottom: '12px' }}>Sailor training companion</div>
        <VesselSwitcher dark={true} />
      </div>
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '8px', fontSize: '13px',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
            background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
            marginBottom: '2px', transition: 'all 0.15s', textDecoration: 'none'
          })}>
            <span style={{ fontSize: '16px', position: 'relative' }}>
              {item.icon}
              {item.path === '/messages' && unreadMessages > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-6px',
                  background: '#e74c3c', color: '#fff', borderRadius: '10px',
                  fontSize: '8px', fontWeight: '700', padding: '1px 4px',
                  minWidth: '14px', textAlign: 'center', lineHeight: '12px'
                }}>{unreadMessages > 99 ? '99+' : unreadMessages}</span>
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Sailor'}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{user?.provider}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', padding: '7px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer'
        }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

function MobileNav({ user, unreadMessages }) {
  const navItems = getNavItems()
  return (
    <nav className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.12)',
      display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {navItems.map(item => (
        <NavLink key={item.path} to={item.path} end={item.path === '/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '8px 0 6px', fontSize: '9px',
          color: isActive ? '#185FA5' : '#888780', gap: '2px', textDecoration: 'none'
        })}>
          <span style={{ fontSize: '20px', position: 'relative', display: 'inline-block' }}>
            {item.icon}
            {item.path === '/messages' && unreadMessages > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-4px',
                background: '#e74c3c', color: '#fff', borderRadius: '10px',
                fontSize: '8px', fontWeight: '700', padding: '1px 4px',
                minWidth: '14px', textAlign: 'center', lineHeight: '12px'
              }}>{unreadMessages > 99 ? '99+' : unreadMessages}</span>
            )}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
