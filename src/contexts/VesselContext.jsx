import { createContext, useContext, useState, useEffect } from 'react'
import { apiPost } from '../api'

const Ctx = createContext(null)

export function VesselProvider({ user, children }) {
  const [vessels, setVessels] = useState([])
  const [vessel, setVessel] = useState(null)   // current vessel
  const [role, setRole] = useState(null)        // my role on current vessel
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    try {
      // Ensure the user has a vessel (creates one from profile on first run)
      await apiPost('vessels', { action: 'migrate' })

      const data = await apiPost('vessels', { action: 'listMine' })
      const list = data.vessels || []
      setVessels(list)

      if (list.length > 0) {
        const savedId = localStorage.getItem('marineiq_vesselId')
        const active = list.find(v => v.id === savedId) || list[0]
        await select(active, list)
      }
    } catch (e) {
      console.error('Vessel load error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function select(v, list = vessels) {
    const target = typeof v === 'string' ? (list.find(x => x.id === v) || { id: v }) : v
    localStorage.setItem('marineiq_vesselId', target.id)
    setVessel(target)
    setRole(target._myRole || null)
    // Fetch fresh membership to get authoritative role
    try {
      const data = await apiPost('membership', { action: 'myMembership', vesselId: target.id })
      if (data.membership) setRole(data.membership.role)
    } catch (e) {}
  }

  async function refresh() {
    await load()
  }

  return (
    <Ctx.Provider value={{ vessel, vessels, role, loading, selectVessel: select, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

export function useVessel() {
  return useContext(Ctx)
}
