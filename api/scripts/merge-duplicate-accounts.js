/**
 * MarineIQ — Duplicate Account Merger
 *
 * Finds users who registered more than once with the same email address,
 * then merges all their data (trips, maintenance, parts, vessel memberships)
 * into a single account.
 *
 * Run:
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/merge-duplicate-accounts.js
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/merge-duplicate-accounts.js --fix
 *
 * DRY RUN (default): prints what would be merged without writing anything.
 * --fix: performs the merge. The oldest account (first to register) is kept
 *        as the primary. All data from newer duplicate accounts is re-pointed
 *        to the primary userId, then the duplicates are removed.
 *
 * NOTE: trips/maintenance/parts are partitioned by /userId. Re-pointing them
 * means reading each document, deleting it from the old partition, and
 * recreating it under the primary userId. This is safe but cannot be rolled
 * back — take a Cosmos DB backup before running with --fix.
 */

const { CosmosClient } = require('@azure/cosmos')

const FIX = process.argv.includes('--fix')
const conn = process.env.COSMOS_CONNECTION_STRING
if (!conn) { console.error('Set COSMOS_CONNECTION_STRING first.'); process.exit(1) }

const client = new CosmosClient(conn)
const db = client.database('marineiq')

async function fetchAll(containerName, query, params = []) {
  try {
    const { resources } = await db.container(containerName).items.query({ query, parameters: params }).fetchAll()
    return resources
  } catch { return [] }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  MarineIQ — Duplicate Account Merger')
  console.log(`  Mode: ${FIX ? 'FIX (writes enabled)' : 'DRY RUN (read-only)'}`)
  console.log('═══════════════════════════════════════════════════════\n')

  // Load all user accounts
  const allUsers = await fetchAll('users', 'SELECT c.id, c.userId, c.email, c.name, c.createdAt, c.authType FROM c')
  console.log(`Found ${allUsers.length} user accounts.\n`)

  // Group by email
  const byEmail = {}
  for (const u of allUsers) {
    if (!u.email) continue
    const key = u.email.toLowerCase().trim()
    if (!byEmail[key]) byEmail[key] = []
    byEmail[key].push(u)
  }

  const duplicates = Object.entries(byEmail).filter(([, users]) => users.length > 1)

  if (duplicates.length === 0) {
    console.log('✓ No duplicate email accounts found. Nothing to do.\n')
    return
  }

  console.log(`Found ${duplicates.length} email(s) with duplicate accounts:\n`)

  for (const [email, users] of duplicates) {
    // Sort oldest first — keep the oldest as primary
    users.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    const primary = users[0]
    const duplicateUsers = users.slice(1)

    console.log(`── ${email} (${users.length} accounts) ─────────────────────`)
    console.log(`   PRIMARY  : userId=${primary.userId}  created=${primary.createdAt}`)
    for (const dup of duplicateUsers) {
      console.log(`   DUPLICATE: userId=${dup.userId}  created=${dup.createdAt}`)
    }

    for (const dup of duplicateUsers) {
      await mergeAccount(email, primary, dup)
    }
    console.log()
  }

  if (!FIX) {
    console.log('\nRun with --fix to perform the merge.\n')
  } else {
    console.log('\nMerge complete. Run the dedup-sweep.js script to verify.\n')
  }
}

async function mergeAccount(email, primary, dup) {
  console.log(`\n   Merging ${dup.userId} → ${primary.userId}`)

  // ── 1. Re-point vessel memberships ────────────────────────────────────────
  const dupMemberships = await fetchAll('vesselMemberships',
    'SELECT * FROM c WHERE c.userId = @userId AND c.status = "active"',
    [{ name: '@userId', value: dup.userId }]
  )
  console.log(`   - ${dupMemberships.length} vessel membership(s) to re-point`)
  if (FIX) {
    for (const m of dupMemberships) {
      // Check if primary already has a membership for this vessel
      const existingId = `mem-${m.vesselId}-${primary.userId}`
      let primaryAlreadyMember = false
      try {
        const { resource } = await db.container('vesselMemberships').item(existingId, m.vesselId).read()
        primaryAlreadyMember = !!resource
      } catch {}

      if (!primaryAlreadyMember) {
        await db.container('vesselMemberships').items.upsert({
          ...m,
          id: `mem-${m.vesselId}-${primary.userId}`,
          userId: primary.userId,
          userEmail: email,
          userName: primary.name
        })
        console.log(`     Moved membership for vessel ${m.vesselId} to primary`)
      } else {
        console.log(`     Primary already member of vessel ${m.vesselId} — skipping`)
      }
      // Remove dup's membership
      try { await db.container('vesselMemberships').item(m.id, m.vesselId).delete() } catch {}
    }
  }

  // ── 2. Re-point trips ──────────────────────────────────────────────────────
  await rePointDocuments('trips', dup.userId, primary.userId, 'trip')

  // ── 3. Re-point maintenance ────────────────────────────────────────────────
  await rePointDocuments('maintenance', dup.userId, primary.userId, 'maintenance')

  // ── 4. Re-point parts ─────────────────────────────────────────────────────
  await rePointDocuments('parts', dup.userId, primary.userId, 'part')

  // ── 5. Delete the duplicate user account ──────────────────────────────────
  if (FIX) {
    try {
      await db.container('users').item(dup.userId, dup.userId).delete()
      console.log(`   - Deleted duplicate user record ${dup.userId}`)
    } catch (e) {
      console.log(`   - Could not delete user record: ${e.message}`)
    }

    // Update email index to point to primary
    try {
      await db.container('userEmails').items.upsert({
        id: email,
        userId: primary.userId,
        createdAt: primary.createdAt
      })
      console.log(`   - Email index updated to point to primary`)
    } catch {}
  }
}

async function rePointDocuments(containerName, fromUserId, toUserId, label) {
  const docs = await fetchAll(containerName,
    'SELECT * FROM c WHERE c.userId = @userId',
    [{ name: '@userId', value: fromUserId }]
  )
  console.log(`   - ${docs.length} ${label} document(s) to re-point`)
  if (!FIX || docs.length === 0) return

  const container = db.container(containerName)
  let moved = 0, failed = 0

  for (const doc of docs) {
    try {
      // Create under primary userId (new partition)
      const newDoc = { ...doc, userId: toUserId }
      await container.items.create(newDoc)
      // Delete from old partition
      await container.item(doc.id, fromUserId).delete()
      moved++
    } catch (e) {
      if (e.code === 409) {
        // Document with this id already exists under primary userId — skip
        try { await container.item(doc.id, fromUserId).delete() } catch {}
        moved++
      } else {
        console.log(`     Failed to move ${label} ${doc.id}: ${e.message}`)
        failed++
      }
    }
  }
  console.log(`     Moved ${moved}${failed ? `, ${failed} failed` : ''} ${label} document(s)`)
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
