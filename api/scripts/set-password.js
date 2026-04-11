/**
 * MarineIQ — Directly set a password for an account in Cosmos DB
 *
 * Use this when a user is locked out because their password was wiped
 * by the saveProfile bug and they cannot log in to use the UI reset flow.
 *
 * Run (dry-run first):
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/set-password.js \
 *     --email don.bilbrey@gmail.com --password "NewPassword123"
 *
 * Apply the change:
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/set-password.js \
 *     --email don.bilbrey@gmail.com --password "NewPassword123" --fix
 */

const { CosmosClient } = require('@azure/cosmos')
const bcrypt = require('bcryptjs')

const FIX = process.argv.includes('--fix')

function getArg(name) {
  const i = process.argv.indexOf(name)
  return i !== -1 ? process.argv[i + 1] : null
}

const emailArg    = getArg('--email')
const passwordArg = getArg('--password')

if (!emailArg || !passwordArg) {
  console.error('\nERROR: Pass --email <address> --password <newpassword>\n')
  process.exit(1)
}

if (passwordArg.length < 8) {
  console.error('\nERROR: Password must be at least 8 characters\n')
  process.exit(1)
}

const conn = process.env.COSMOS_CONNECTION_STRING
if (!conn) {
  console.error('\nERROR: Set COSMOS_CONNECTION_STRING env var before running.\n')
  process.exit(1)
}

const client = new CosmosClient(conn)
const db     = client.database('marineiq')

async function main() {
  const email = emailArg.toLowerCase().trim()

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  MarineIQ — Direct Password Reset')
  console.log(`  Email : ${email}`)
  console.log(`  Mode  : ${FIX ? 'FIX (writes enabled)' : 'DRY RUN (read-only)'}`)
  console.log('═══════════════════════════════════════════════════\n')

  // Find the user
  const { resources } = await db.container('users').items.query({
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email }]
  }).fetchAll()

  if (resources.length === 0) {
    console.log(`No user found for ${email}\n`)
    return
  }

  // Prefer the email-registered account (email- prefix)
  const emailAccount = resources.find(u => /^email-\d+-/.test(u.userId || u.id))
  const user = emailAccount || resources[0]

  console.log(`Found account:`)
  console.log(`  userId      : ${user.userId || user.id}`)
  console.log(`  provider    : ${user.provider || '—'}`)
  console.log(`  authType    : ${user.authType || '—'}`)
  console.log(`  hasPassword : ${!!user.password}`)
  console.log(`  createdAt   : ${user.createdAt || '—'}`)
  console.log()

  if (!FIX) {
    console.log(`→ Would set a new bcrypt password hash on this account`)
    console.log(`→ Would set authType = 'email'`)
    console.log('\nRe-run with --fix to apply.\n')
    return
  }

  const hashed = await bcrypt.hash(passwordArg, 12)
  const updated = {
    ...user,
    password: hashed,
    authType: 'email',
    updatedAt: new Date().toISOString()
  }

  await db.container('users').items.upsert(updated)

  // Also ensure the userEmails index points to this account
  try {
    await db.container('userEmails').items.upsert({
      id: email,
      userId: user.userId || user.id,
      createdAt: user.createdAt || new Date().toISOString()
    })
    console.log(`✅  userEmails index confirmed → ${user.userId || user.id}`)
  } catch (e) {
    console.warn(`⚠️  Could not update userEmails index: ${e.message}`)
  }

  console.log(`✅  Password set successfully for ${email}`)
  console.log(`\nYou can now sign in at the app with:`)
  console.log(`  Email    : ${email}`)
  console.log(`  Password : ${passwordArg}`)
  console.log('\nChange it immediately after logging in via Profile → Change Password.\n')
}

main().catch(e => { console.error('\nFatal error:', e.message, '\n'); process.exit(1) })
