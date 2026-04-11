/**
 * API client.
 *
 * Every request is enriched with callerEmail and callerName from the cached
 * user object so backend functions that need the caller's display name or
 * email (membership invites, admin checks, etc.) don't need a separate lookup.
 *
 * Authorization is provided by the Azure Function key (?code=…) and, when
 * called through the SWA proxy, by the x-ms-client-principal header.
 */

const BASE      = 'https://func-marineiq-prod.azurewebsites.net/api'
const KEY       = import.meta.env.VITE_API_KEY || ''
const USER_KEY  = 'marineiq_user'

function storedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}') } catch { return {} }
}

export async function apiPost(endpoint, body) {
  const u = storedUser()
  const res = await fetch(`${BASE}/${endpoint}?code=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callerEmail: u.email || '',
      callerName:  u.name  || '',
      ...body,
    })
  })
  return res.json()
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
