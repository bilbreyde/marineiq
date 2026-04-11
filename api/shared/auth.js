/**
 * Auth helpers for Azure Functions.
 *
 * Identity resolution order:
 *  1. x-ms-client-principal header — injected by SWA when the function app is
 *     called through the SWA proxy. Cryptographically trustworthy.
 *  2. userId / callerEmail / callerName in the request body — used when the
 *     function app is called directly with a function key. The function key
 *     is the API-level gating mechanism in that case.
 */

/**
 * Extract caller identity from the request.
 * Returns { userId, email, name } or throws { status, message }.
 */
function extractCaller(req) {
  // ── SWA proxy path ─────────────────────────────────────────────────────────
  const principalHeader =
    (req.headers && (req.headers['x-ms-client-principal'] || req.headers['X-MS-CLIENT-PRINCIPAL']))

  if (principalHeader) {
    try {
      const p = JSON.parse(Buffer.from(principalHeader, 'base64').toString('utf8'))
      const nameClaim = (p.claims || []).find(
        c => c.typ === 'name' ||
             c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      )
      return {
        userId: p.userId,
        email:  p.userDetails || '',
        name:   nameClaim?.val || p.userDetails || '',
      }
    } catch {}
  }

  // ── Direct call (function-key secured) ────────────────────────────────────
  const userId = req.body && req.body.userId
  if (!userId) throw { status: 401, message: 'Not authenticated' }

  return {
    userId,
    email: (req.body && req.body.callerEmail) || '',
    name:  (req.body && req.body.callerName)  || '',
  }
}

// Alias so existing call sites (verifyToken) work without changes
const verifyToken = extractCaller

/**
 * Standard CORS headers used by all functions.
 */
const CORS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://white-ocean-0b1cc9e0f.7.azurestaticapps.net',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
}

function handleOptions(context) {
  context.res = {
    status: 200,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
  }
}

function err(context, status, message) {
  context.res = { status, headers: CORS, body: { error: message } }
}

module.exports = { extractCaller, verifyToken, CORS, handleOptions, err }
