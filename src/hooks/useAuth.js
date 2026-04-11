/**
 * Auth hook — uses Azure Static Web Apps built-in OAuth.
 *
 * Login:  redirect to /.auth/login/google  or  /.auth/login/github
 * Identity: call /.auth/me — returns a stable userId tied to the OAuth account.
 *           Same Google/GitHub account → same userId on every device.
 * Logout: redirect to /.auth/logout
 *
 * The user object is also cached in localStorage so apiPost can attach
 * callerEmail / callerName to every request without needing React context.
 */

import { useState, useEffect } from 'react'

const USER_KEY = 'marineiq_user'

export function useAuth() {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/.auth/me')
      .then(r => r.json())
      .then(data => {
        const p = data.clientPrincipal
        if (p) {
          // SWA includes a 'name' claim for Google — use it when present.
          const nameClaim = (p.claims || []).find(
            c => c.typ === 'name' ||
                 c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
          )
          const u = {
            userId:   p.userId,
            email:    p.userDetails  || '',
            name:     nameClaim?.val || p.userDetails?.split('@')[0] || 'Sailor',
            provider: p.identityProvider,
          }
          setUser(u)
          // Cache so apiPost can enrich requests without React context
          localStorage.setItem(USER_KEY, JSON.stringify(u))
        } else {
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
      })
      .catch(() => { setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/login.html'
  }

  return { user, loading, logout }
}
