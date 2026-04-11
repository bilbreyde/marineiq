/**
 * MarineIQ — Remove OAuth duplicate accounts for a given email
 *
 * Finds every user document sharing an email address, identifies which ones
 * were created via OAuth (GitHub / Google / SWA EasyAuth), prints them, and
 * in --fix mode deletes them along with their associated memberships.
 *
 * The email/password account is always kept.  The userEmails index entry is
 * re-pointed at the surviving account if needed.
 *
 * Run (dry-run first):
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/remove-oauth-accounts.js --email don.bilbrey@gmail.com
 *
 * Then apply the fix:
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/remove-oauth-accounts.js --email don.bilbrey@gmail.com --fix
 */

const { CosmosClient } = require('@azure/cosmos')

const FIX   = process.argv.includes('--fix')
const emailArg = (() => {
  const i = process.argv.indexOf('--email')
  return i !== -1 ? process.argv[i + 1] : null
})()

if (!emailArg) {
  console.error('\nERROR: Pass --email <address>\n')
  process.exit(1)
}

const conn = process.env.COSMOS_CONNECTION_STRING
if (!conn) {
  console.error('\nERROR: Set COSMOS_CONNECTION_STRING env var before running.\n')
  process.exit(1)
}

const client = new CosmosClient(conn)
const db     = client.database('marineiq')

// ─── helpers ──────────────────────────────────────────────────────────────────

function isOAuth(user) {
  // Email/password accounts have authType === 'email' and a bcrypt password hash.
  // OAuth accounts (SWA EasyAuth / manual OAuth migration) have provider set to
  // 'github' or 'google', or have a userId that looks like 'github|…' / 'google|…',
  // or simply have no password hash at all and authType !== 'email'.
  if (user.authType === 'email' && user.password) return false
  if (/^(github|google|aad)\|/i.test(user.userId || '')) return true
  if (/^(github|google|aad)$/i.test(user.provider || '')) return true
  if (!user.password && user.authType !== 'email') return true
  return false
}

async function fetchAll(containerName, query, params = []) {
  const container = db.container(containerName)
  const { resources } = await container.items.query({ query, parameters: params }).fetchAll()
  return resources
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const email = emailArg.toLowerCase().trim()

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  MarineIQ — Remove OAuth Accounts')
  console.log(`  Email : ${email}`)
  console.log(`  Mode  : ${FIX ? 'FIX (writes enabled)' : 'DRY RUN (read-only)'}`)
  console.log('═══════════════════════════════════════════════════\n')

  // ── 1. Find all user documents for this email ─────────────────────────────

  const users = await fetchAll('users',
    'SELECT * FROM c WHERE c.email = @email',
    [{ name: '@email', value: email }]
  )

  if (users.length === 0) {
    console.log(`No user documents found for ${email}\n`)
    return
  }

  console.log(`Found ${users.length} account(s) for ${email}:\n`)
  for (const u of users) {
    const tag = isOAuth(u) ? '⚡ OAUTH' : '✉  EMAIL'
    console.log(`  [${tag}]  userId   : ${u.userId || u.id}`)
    console.log(`           provider : ${u.provider || '—'}`)
    console.log(`           authType : ${u.authType || '—'}`)
    console.log(`           hasPassword: ${!!u.password}`)
    console.log(`           createdAt: ${u.createdAt || '—'}`)
    console.log()
  }

  const emailAccounts = users.filter(u => !isOAuth(u))
  const oauthAccounts = users.filter(u =>  isOAuth(u))

  if (oauthAccounts.length === 0) {
    console.log('No OAuth accounts found — nothing to remove.\n')
    return
  }

  if (emailAccounts.length === 0) {
    console.log('⚠️  WARNING: No email/password account found.')
    console.log('   Removing OAuth accounts would leave no surviving account.')
    console.log('   Create an email/password account first, then re-run.\n')
    return
  }

  const keepUser = emailAccounts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
  console.log(`Keeping email account : ${keepUser.userId} (created ${keepUser.createdAt})`)
  console.log(`Removing OAuth account(s): ${oauthAccounts.map(u => u.userId).join(', ')}\n`)

  // ── 2. Check / fix the userEmails index ──────────────────────────────────

  try {
    const emailsContainer = db.container('userEmails')
    const { resource: idx } = await emailsContainer.item(email, email).read()

    if (idx) {
      const pointsToOAuth = oauthAccounts.some(u => u.userId === idx.userId)
      if (pointsToOAuth) {
        console.log(`⚠️  userEmails index points to OAuth account ${idx.userId} — needs re-pointing to ${keepUser.userId}`)
        if (FIX) {
          await emailsContainer.items.upsert({ id: email, userId: keepUser.userId, createdAt: keepUser.createdAt })
          console.log(`✅  userEmails index updated → ${keepUser.userId}\n`)
        }
      } else {
        console.log(`✓  userEmails index already points to email account ${idx.userId}\n`)
      }
    } else {
      console.log(`ℹ️  No userEmails index entry — will create one for ${keepUser.userId}`)
      if (FIX) {
        await emailsContainer.items.upsert({ id: email, userId: keepUser.userId, createdAt: keepUser.createdAt })
        console.log(`✅  userEmails index created → ${keepUser.userId}\n`)
      }
    }
  } catch (e) {
    if (e.code === 404) {
      console.log('ℹ️  userEmails container not found — skipping index check')
    } else {
      console.warn('⚠️  Could not check userEmails index:', e.message)
    }
  }

  // ── 3. For each OAuth account, show and optionally remove memberships ────

  for (const oauthUser of oauthAccounts) {
    const uid = oauthUser.userId || oauthUser.id
    console.log(`\n─── OAuth account: ${uid} ───`)

    // Memberships
    let mems = []
    try {
      mems = await fetchAll('vesselMemberships',
        'SELECT * FROM c WHERE c.userId = @uid',
        [{ name: '@uid', value: uid }]
      )
    } catch {}

    if (mems.length > 0) {
      console.log(`  ${mems.length} vessel membership(s):`)
      for (const m of mems) {
        console.log(`    vesselId=${m.vesselId}  role=${m.role}  status=${m.status}`)
        if (FIX) {
          try {
            await db.container('vesselMemberships').item(m.id, m.vesselId).delete()
            console.log(`    ✅  Deleted membership ${m.id}`)
          } catch (e) {
            console.warn(`    ⚠️  Could not delete membership ${m.id}: ${e.message}`)
          }
        }
      }
    } else {
      console.log('  No vessel memberships.')
    }

    // Trips (info only — not deleting, user may want to keep logbook data)
    let trips = []
    try {
      trips = await fetchAll('trips',
        'SELECT c.id, c.departure, c.destination, c.date FROM c WHERE c.userId = @uid',
        [{ name: '@uid', value: uid }]
      )
    } catch {}

    if (trips.length > 0) {
      console.log(`  ℹ️  ${trips.length} trip(s) logged under this userId — NOT deleted`)
      console.log('      (logbook data is preserved; re-associate manually if needed)')
    }

    // Maintenance records (info only)
    let maint = []
    try {
      maint = await fetchAll('maintenance',
        'SELECT c.id, c.task FROM c WHERE c.userId = @uid',
        [{ name: '@uid', value: uid }]
      )
    } catch {}

    if (maint.length > 0) {
      console.log(`  ℹ️  ${maint.length} maintenance record(s) — NOT deleted`)
    }

    // Delete the user document
    if (FIX) {
      try {
        await db.container('users').item(uid, uid).delete()
        console.log(`  ✅  Deleted user document ${uid}`)
      } catch (e) {
        console.warn(`  ⚠️  Could not delete user document ${uid}: ${e.message}`)
      }
    } else {
      console.log(`  → Would delete user document ${uid}`)
    }
  }

  // ── 4. Summary ────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════')
  if (FIX) {
    console.log(`  Done. Removed ${oauthAccounts.length} OAuth account(s).`)
    console.log(`  Surviving account: ${keepUser.userId}`)
    console.log(`  The email ${email} now maps to exactly one account.`)
  } else {
    console.log(`  DRY RUN complete — ${oauthAccounts.length} OAuth account(s) would be removed.`)
    console.log('  Re-run with --fix to apply changes.')
  }
  console.log('═══════════════════════════════════════════════════\n')
}

main().catch(e => { console.error('\nFatal error:', e.message, '\n'); process.exit(1) })
