const BASE = 'https://func-marineiq-prod.azurewebsites.net/api'
const KEY = import.meta.env.VITE_API_KEY || ''
const TOKEN_KEY = 'marineiq_token'

export async function apiPost(endpoint, body) {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const res = await fetch(`${BASE}/${endpoint}?code=${KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  // Try to parse as JSON; fall back to a structured error with the HTTP status
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`HTTP ${res.status} from /${endpoint}: ${text.slice(0, 120)}`)
  }
}

export async function uploadPhoto(userId, file) {
  const { uploadUrl, publicUrl } = await apiPost('photos', {
    action: 'getUploadUrl',
    userId,
    filename: file.name,
    contentType: file.type
  })
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
    body: file
  })
  if (!uploadRes.ok) {
    throw new Error(`Photo upload failed: ${uploadRes.status} ${uploadRes.statusText}`)
  }
  return publicUrl
}
