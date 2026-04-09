import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/.auth/me')
      .then(r => r.json())
      .then(data => {
        const principal = data.clientPrincipal
        if (principal) {
          setUser({
            userId: principal.userId,
            name: principal.userDetails,
            provider: principal.identityProvider,
            roles: principal.userRoles
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/'
  }

  return { user, loading, logout }
}
