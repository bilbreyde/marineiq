import { useState, useEffect } from 'react'

const API = 'https://func-marineiq-prod.azurewebsites.net/api'
const KEY = import.meta.env.VITE_API_KEY || ''
const TOKEN_KEY = 'marineiq_token'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verify()
  }, [])

async function verify() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) { setLoading(false); return }
  try {
    const res = await fetch(`${API}/auth?code=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.userId) setUser(data)
      else localStorage.removeItem(TOKEN_KEY)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch (e) {}
  finally { setLoading(false) }
}

  async function login(email, password) {
    const res = await fetch(`${API}/auth?code=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    })
    const data = await res.json()
    if (res.ok && data.userId) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser({ userId: data.userId, name: data.name, email: data.email, provider: 'email' })
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  async function register(email, password, name) {
    const res = await fetch(`${API}/auth?code=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, name })
    })
    const data = await res.json()
    if (res.ok && data.userId) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser({ userId: data.userId, name: data.name, email: data.email, provider: 'email' })
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    window.location.href = '/login.html'
  }

  return { user, loading, login, register, logout }
}
