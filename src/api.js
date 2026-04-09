const BASE = 'https://func-marineiq-prod.azurewebsites.net/api'
const KEY = import.meta.env.VITE_API_KEY || ''

export async function apiPost(endpoint, body) {
  const res = await fetch(`${BASE}/${endpoint}?code=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}
