import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home', icon: '⚓' },
  { path: '/logbook', label: 'Logbook', icon: '📓' },
  { path: '/quiz', label: 'Train', icon: '📋' },
  { path: '/chat', label: 'Captain', icon: '🧭' },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { path: '/profile', label: 'Profile', icon: '👤' },
]

export default function Layout({ children, user, logout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <DesktopSidebar user={user} logout={logout} />
      <main style={{ flex: 1, paddingBottom: '80px', maxWidth: '100%', overflowX: 'hidden' }}>
        {children}
      </main>
      <MobileNav />
    </div>
  )
}

function DesktopSidebar({ user, logout }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <aside style={{
      width: '220px', background: '#0c2a4a', minHeight: '100vh',
      display: 'none', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh'
    }} className="desktop-sidebar">
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>&#9875; MarineIQ</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Sailor training companion</div>
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
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
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

function MobileNav() {
  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-nav { display: none !important; }
          main { padding-bottom: 0 !important; }
        }
      `}</style>
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
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
