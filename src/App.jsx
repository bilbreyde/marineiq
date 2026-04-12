import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { apiPost } from './api'
import { VesselProvider } from './contexts/VesselContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import Logbook from './pages/Logbook'
import Maintenance from './pages/Maintenance'
import ProfileSetup from './pages/ProfileSetup'
import Profile from './pages/Profile'
import VesselManage from './pages/VesselManage'
import Admin from './pages/Admin'
import Messages from './pages/Messages'

export default function App() {
  const { user, loading, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [crewNotifications, setCrewNotifications] = useState(0)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!user) { setProfileLoading(false); return }
    apiPost('profile', { action: 'getProfile', userId: user.userId })
      .then(d => setProfile(d.profile))
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }, [user])

  useEffect(() => {
    if (!user) return
    function pollAll() {
      apiPost('vessels', { action: 'msg:unreadCount' })
        .then(d => { if (typeof d.count === 'number') setUnreadMessages(d.count) })
        .catch(() => {})
      apiPost('membership', { action: 'notifications' })
        .then(d => { setCrewNotifications((d.pendingInvites || 0) + (d.pendingRequests || 0)) })
        .catch(() => {})
    }
    pollAll()
    pollRef.current = setInterval(pollAll, 30000)
    return () => clearInterval(pollRef.current)
  }, [user])

  if (loading || profileLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c2a4a', color: '#fff', fontSize: '14px' }}>
      Checking your credentials, sailor...
    </div>
  )

  if (!user) {
    window.location.href = '/login.html'
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c2a4a', color: '#fff', fontSize: '14px' }}>
        Redirecting to login...
      </div>
    )
  }

  if (!profile) return (
    <ProfileSetup user={user} onComplete={() => {
      apiPost('profile', { action: 'getProfile', userId: user.userId })
        .then(d => setProfile(d.profile))
    }} />
  )

  return (
    <VesselProvider user={user}>
      <Layout user={user} profile={profile} logout={logout} unreadMessages={unreadMessages} crewNotifications={crewNotifications}>
        <Routes>
          <Route path="/" element={<Dashboard userId={user.userId} profile={profile} />} />
          <Route path="/chat" element={<Chat userId={user.userId} profile={profile} />} />
          <Route path="/quiz" element={<Quiz userId={user.userId} />} />
          <Route path="/logbook" element={<Logbook userId={user.userId} />} />
          <Route path="/maintenance" element={<Maintenance userId={user.userId} />} />
          <Route path="/profile" element={<Profile user={user} onUpdate={setProfile} />} />
          <Route path="/vessel" element={<VesselManage user={user} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/messages" element={<Messages user={user} onRead={() => {
            apiPost('vessels', { action: 'msg:unreadCount' })
              .then(d => { if (typeof d.count === 'number') setUnreadMessages(d.count) })
              .catch(() => {})
          }} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </VesselProvider>
  )
}
