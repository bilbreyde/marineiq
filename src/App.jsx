import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import Logbook from './pages/Logbook'
import Maintenance from './pages/Maintenance'
import Login from './pages/Login'

export default function App() {
  const { user, loading, logout } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c2a4a', color: '#fff', fontSize: '14px' }}>
      Checking your credentials, sailor...
    </div>
  )

  if (!user) return <Login />

  return (
    <Layout user={user} logout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard userId={user.userId} />} />
        <Route path="/chat" element={<Chat userId={user.userId} />} />
        <Route path="/quiz" element={<Quiz userId={user.userId} />} />
        <Route path="/logbook" element={<Logbook userId={user.userId} />} />
        <Route path="/maintenance" element={<Maintenance userId={user.userId} />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
