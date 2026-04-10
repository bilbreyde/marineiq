import { useState, useEffect } from 'react'

const API = 'https://func-marineiq-prod.azurewebsites.net/api'
const KEY = import.meta.env.VITE_API_KEY || ''

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verify()
  }, [])

  async function verify() {
    try {
      const res = await fetch(`${API}/auth?code=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'verify' })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.userId) setUser(data)
      }
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function login(email, password) {
    const res = await fetch(`${API}/auth?code=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'login', email, password })
    })
    const data = await res.json()
    if (res.ok && data.userId) {
      setUser(data)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  async function register(email, password, name) {
    const res = await fetch(`${API}/auth?code=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'register', email, password, name })
    })
    const data = await res.json()
    if (res.ok && data.userId) {
      setUser(data)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  async function logout() {
    await fetch(`${API}/auth?code=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' })
    })
    setUser(null)
    window.location.href = '/'
  }

  return { user, loading, login, register, logout }
}
