import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { apiPost } from './api'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import Logbook from './pages/Logbook'
import Maintenance from './pages/Maintenance'
import ProfileSetup from './pages/ProfileSetup'
import Profile from './pages/Profile'

export default function App() {
  const { user, loading, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!user) { setProfileLoading(false); return }
    apiPost('profile', { action: 'getProfile', userId: user.userId })
      .then(d => setProfile(d.profile))
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }, [user])

  if (loading || profileLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c2a4a', color: '#fff', fontSize: '14px' }}>
      Checking your credentials, sailor...
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c2a4a', color: '#fff', fontSize: '14px' }}>
      Redirecting to login...
    </div>
  )

  if (!profile) return (
    <ProfileSetup user={user} onComplete={() => {
      apiPost('profile', { action: 'getProfile', userId: user.userId })
        .then(d => setProfile(d.profile))
    }} />
  )

  return (
    <Layout user={user} profile={profile} logout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard userId={user.userId} profile={profile} />} />
        <Route path="/chat" element={<Chat userId={user.userId} profile={profile} />} />
        <Route path="/quiz" element={<Quiz userId={user.userId} />} />
        <Route path="/logbook" element={<Logbook userId={user.userId} />} />
        <Route path="/maintenance" element={<Maintenance userId={user.userId} />} />
        <Route path="/profile" element={<Profile user={user} onUpdate={setProfile} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
