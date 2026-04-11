/**
 * Email/password auth — REMOVED.
 * Authentication is now handled by Azure Static Web Apps built-in OAuth
 * (/.auth/login/google and /.auth/login/github).
 */
const { CORS, handleOptions } = require('../shared/auth')

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') { handleOptions(context); return }
  context.res = {
    status: 410,
    headers: CORS,
    body: { error: 'Email/password auth has been removed. Sign in via Google or GitHub.' }
  }
}
