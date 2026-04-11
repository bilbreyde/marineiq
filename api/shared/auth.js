const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

/**
 * Extract and verify the JWT from the Authorization header.
 * Returns decoded payload { userId, email, name } or throws { status, message }.
 */
function verifyToken(req) {
  const auth = (req.headers && (req.headers['authorization'] || req.headers['Authorization'])) || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) throw { status: 401, message: 'Not authenticated' }
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    throw { status: 401, message: 'Session expired' }
  }
}

/**
 * Standard CORS headers. All functions use the same origin.
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

module.exports = { verifyToken, CORS, handleOptions, err }
