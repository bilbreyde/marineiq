import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import Logbook from './pages/Logbook'
import Maintenance from './pages/Maintenance'

const DEMO_USER = 'user-001'

export default function App() {
  const [userId] = useState(DEMO_USER)

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard userId={userId} />} />
        <Route path="/chat" element={<Chat userId={userId} />} />
        <Route path="/quiz" element={<Quiz userId={userId} />} />
        <Route path="/logbook" element={<Logbook userId={userId} />} />
        <Route path="/maintenance" element={<Maintenance userId={userId} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
