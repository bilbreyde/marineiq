/**
 * MarineIQ — Database Deduplication Sweep
 *
 * Run with:
 *   COSMOS_CONNECTION_STRING="..." node api/scripts/dedup-sweep.js
 *
 * Add --fix to automatically resolve problems (prints what it will do first).
 * Add --dry-run to print the fix plan without writing anything (default if --fix not passed).
 *
 * What this checks:
 *   1. Vessels with no active captain membership (orphaned)
 *   2. Users who are captain of multiple vessels with the same normalized name (migrate race)
 *   3. Users with multiple active memberships for the same vessel
 *   4. Trips/maintenance with vesselId that also appear in a by-userId query (document-level dups)
 *   5. Invite/request records pointing to vesselIds that no longer exist
 */

const { CosmosClient } = require('@azure/cosmos')

const FIX = process.argv.includes('--fix')
const conn = process.env.COSMOS_CONNECTION_STRING

if (!conn) {
  console.error('\nERROR: Set COSMOS_CONNECTION_STRING env var before running.\n')
  process.exit(1)
}

const client = new CosmosClient(conn)
const db = client.database('marineiq')

// ─── helpers ─────────────────────────────────────────────────────────────────

async function fetchAll(containerName, query, params = []) {
  const container = db.container(containerName)
  const { resources } = await container.items.query({
    query,
    parameters: params
  }).fetchAll()
  return resources
}

async function mergeDuplicateVessel(db, activeMems, allInvites, allRequests, keep, dup) {
  const dupMems = activeMems.filter(m => m.vesselId === dup.id)
  for (const dm of dupMems) {
    const alreadyMember = activeMems.find(m => m.vesselId === keep.id && m.userId === dm.userId)
    if (!alreadyMember) {
      const newMem = { ...dm, id: `mem-${keep.id}-${dm.userId}`, vesselId: keep.id }
      await db.container('vesselMemberships').items.upsert(newMem)
      console.log(`     Moved membership ${dm.userId} → ${keep.id}`)
    }
    try { await db.container('vesselMemberships').item(dm.id, dup.id).delete() } catch {}
  }
  // Re-point invites and requests
  for (const inv of allInvites.filter(i => i.vesselId === dup.id)) {
    await db.container('vesselInvites').items.upsert({ ...inv, vesselId: keep.id })
    try { await db.container('vesselInvites').item(inv.id, dup.id).delete() } catch {}
  }
  for (const req of allRequests.filter(r => r.vesselId === dup.id)) {
    await db.container('vesselJoinRequests').items.upsert({ ...req, vesselId: keep.id })
    try { await db.container('vesselJoinRequests').item(req.id, dup.id).delete() } catch {}
  }
  await db.container('vessels').item(dup.id, dup.id).delete()
}

function group(arr, key) {
  const map = {}
  for (const item of arr) {
    const k = item[key]
    if (!map[k]) map[k] = []
    map[k].push(item)
  }
  return map
}

let totalIssues = 0
let totalFixed = 0

function issue(msg) { totalIssues++; console.log(`  ⚠️  ${msg}`) }
function fixed(msg) { totalFixed++; console.log(`  ✅  ${msg}`) }
function ok(msg)    { console.log(`  ✓  ${msg}`) }

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('  MarineIQ Database Dedup Sweep')
  console.log(`  Mode: ${FIX ? 'FIX (writes enabled)' : 'DRY RUN (read-only)'}`)
  console.log('═══════════════════════════════════════════════════\n')

  // ── 1. Load all collections ─────────────────────────────────────────────────

  console.log('Loading data...')

  const containers = ['vessels', 'vesselMemberships', 'vesselInvites', 'vesselJoinRequests', 'trips', 'maintenance', 'parts']
  const exists = {}
  for (const name of containers) {
    try {
      await fetchAll(name, 'SELECT VALUE COUNT(1) FROM c')
      exists[name] = true
    } catch (e) {
      exists[name] = false
      console.log(`  (${name} does not exist yet — skipping)`)
    }
  }

  const allVessels        = exists.vessels           ? await fetchAll('vessels',           'SELECT * FROM c') : []
  const allMemberships    = exists.vesselMemberships  ? await fetchAll('vesselMemberships', 'SELECT * FROM c') : []
  const allInvites        = exists.vesselInvites      ? await fetchAll('vesselInvites',     'SELECT * FROM c') : []
  const allRequests       = exists.vesselJoinRequests ? await fetchAll('vesselJoinRequests','SELECT * FROM c') : []
  const allTrips          = exists.trips              ? await fetchAll('trips',             'SELECT c.id, c.userId, c.vesselId FROM c') : []
  const allMaintenance    = exists.maintenance        ? await fetchAll('maintenance',       'SELECT c.id, c.userId, c.vesselId FROM c') : []
  const allParts          = exists.parts              ? await fetchAll('parts',             'SELECT c.id, c.userId, c.vesselId FROM c') : []

  const vesselIds = new Set(allVessels.map(v => v.id))
  const activeMems = allMemberships.filter(m => m.status === 'active')

  console.log(`\nLoaded: ${allVessels.length} vessels, ${allMemberships.length} memberships, ` +
    `${allInvites.length} invites, ${allRequests.length} requests, ` +
    `${allTrips.length} trips, ${allMaintenance.length} maintenance, ${allParts.length} parts\n`)

  // ── 2. Orphaned vessels (no active captain membership) ──────────────────────

  console.log('── Check 1: Orphaned vessels ─────────────────────')
  let orphanCount = 0
  for (const v of allVessels) {
    const captainMem = activeMems.find(m => m.vesselId === v.id && m.role === 'captain')
    if (!captainMem) {
      orphanCount++
      issue(`Vessel "${v.name}" (${v.id}) has no active captain. captainId field: ${v.captainId}`)
      // Can't auto-fix without knowing the intended captain — just report
    }
  }
  if (orphanCount === 0) ok('No orphaned vessels.')

  // ── 3a. Duplicate hull IDs (definitive dedup — same physical boat) ──────────

  console.log('\n── Check 2a: Duplicate Hull IDs (HIN) ───────────')
  const vesselsByHullId = group(allVessels.filter(v => v.hullId), 'hullId')
  let hullDupCount = 0

  for (const [hullId, dups] of Object.entries(vesselsByHullId)) {
    if (dups.length > 1) {
      hullDupCount++
      dups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      const keep = dups[0]
      const remove = dups.slice(1)
      issue(`Hull ID "${hullId}" appears on ${dups.length} vessels (same physical boat):`)
      console.log(`     Keep  : "${keep.name}" ${keep.id} (created ${keep.createdAt})`)
      for (const dup of remove) {
        console.log(`     Remove: "${dup.name}" ${dup.id} (created ${dup.createdAt})`)
        if (FIX) {
          await mergeDuplicateVessel(db, activeMems, allInvites, allRequests, keep, dup)
          fixed(`Merged duplicate vessel ${dup.id} into ${keep.id}`)
        }
      }
    }
  }
  if (hullDupCount === 0) ok('No duplicate Hull IDs.')

  // ── 3b. Duplicate vessels per captain (same normalized name) ─────────────────

  console.log('\n── Check 2b: Duplicate vessel names per captain ──')
  const captainVessels = group(allVessels, 'captainId')
  let nameCount = 0

  for (const [captainId, vList] of Object.entries(captainVessels)) {
    const byName = group(vList, 'nameLower')
    for (const [nameLower, dups] of Object.entries(byName)) {
      if (dups.length > 1) {
        nameCount++
        // Sort by createdAt — keep oldest, remove rest
        dups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        const keep = dups[0]
        const remove = dups.slice(1)
        issue(`Captain ${captainId} has ${dups.length} vessels named "${nameLower}":`)
        console.log(`     Keep  : ${keep.id} (created ${keep.createdAt})`)
        for (const dup of remove) {
          console.log(`     Remove: ${dup.id} (created ${dup.createdAt})`)
          if (FIX) {
            await mergeDuplicateVessel(db, activeMems, allInvites, allRequests, keep, dup)
            fixed(`Merged duplicate vessel ${dup.id} into ${keep.id}`)
          }
        }
      }
    }
  }
  if (nameCount === 0) ok('No duplicate vessel names per captain.')

  // ── 4. Duplicate memberships (same userId + vesselId, both active) ──────────

  console.log('\n── Check 3: Duplicate memberships ────────────────')
  const memKey = m => `${m.vesselId}::${m.userId}`
  const memsByKey = group(activeMems, memKey)
  let memDupCount = 0

  for (const [key, mems] of Object.entries(memsByKey)) {
    if (mems.length > 1) {
      memDupCount++
      mems.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
      const keep = mems[0]
      const remove = mems.slice(1)
      issue(`Duplicate active memberships for ${key} (${mems.length} records):`)
      console.log(`     Keep  : ${keep.id} role=${keep.role}`)
      for (const dup of remove) {
        console.log(`     Remove: ${dup.id} role=${dup.role}`)
        if (FIX) {
          await db.container('vesselMemberships').item(dup.id, dup.vesselId).delete()
          fixed(`Deleted duplicate membership ${dup.id}`)
        }
      }
    }
  }
  if (memDupCount === 0) ok('No duplicate memberships.')

  // ── 5. Memberships pointing to non-existent vessels ─────────────────────────

  console.log('\n── Check 4: Memberships referencing missing vessels')
  let danglingMemCount = 0
  for (const m of activeMems) {
    if (!vesselIds.has(m.vesselId)) {
      danglingMemCount++
      issue(`Membership ${m.id} references missing vessel ${m.vesselId} (user: ${m.userId})`)
      if (FIX) {
        await db.container('vesselMemberships').item(m.id, m.vesselId).delete()
        fixed(`Deleted dangling membership ${m.id}`)
      }
    }
  }
  if (danglingMemCount === 0) ok('No dangling memberships.')

  // ── 6. Invites/requests referencing non-existent vessels ────────────────────

  console.log('\n── Check 5: Invites/requests referencing missing vessels')
  let danglingRefCount = 0
  for (const inv of allInvites.filter(i => i.status === 'pending')) {
    if (!vesselIds.has(inv.vesselId)) {
      danglingRefCount++
      issue(`Invite ${inv.id} for email ${inv.email} references missing vessel ${inv.vesselId}`)
      if (FIX) {
        await db.container('vesselInvites').item(inv.id, inv.vesselId).delete()
        fixed(`Deleted dangling invite ${inv.id}`)
      }
    }
  }
  for (const req of allRequests.filter(r => r.status === 'pending')) {
    if (!vesselIds.has(req.vesselId)) {
      danglingRefCount++
      issue(`Join request ${req.id} from ${req.userEmail} references missing vessel ${req.vesselId}`)
      if (FIX) {
        await db.container('vesselJoinRequests').item(req.id, req.vesselId).delete()
        fixed(`Deleted dangling request ${req.id}`)
      }
    }
  }
  if (danglingRefCount === 0) ok('No dangling invites or requests.')

  // ── 7. Trips/maintenance with duplicate document IDs ────────────────────────

  console.log('\n── Check 6: Duplicate document IDs in trips, maintenance, parts')

  for (const [label, docs] of [['trips', allTrips], ['maintenance', allMaintenance], ['parts', allParts]]) {
    const byId = group(docs, 'id')
    let dupDocCount = 0
    for (const [id, copies] of Object.entries(byId)) {
      if (copies.length > 1) {
        dupDocCount++
        issue(`${label}: document id "${id}" appears ${copies.length} times (partition keys: ${copies.map(c => c.userId).join(', ')})`)
        // Can't safely auto-delete without reading full docs — just report
      }
    }
    if (dupDocCount === 0) ok(`No duplicate IDs in ${label}.`)
  }

  // ── 8. Trips/maintenance without vesselId (legacy) ──────────────────────────

  // ── 6b. Vessels without a Hull ID (info) ───────────────────────────────────

  console.log('\n── Check 6b: Vessels missing Hull ID (info only) ─')
  const noHullId = allVessels.filter(v => !v.hullId)
  if (noHullId.length > 0) {
    console.log(`  ℹ️  ${noHullId.length} vessel(s) have no Hull ID:`)
    for (const v of noHullId) console.log(`     "${v.name}" (${v.id})`)
    console.log('     Add via Settings tab in /vessel — prevents duplicate registrations.')
  } else {
    ok('All vessels have a Hull ID.')
  }

  console.log('\n── Check 7: Legacy documents without vesselId (info only)')

  const legacyTrips = allTrips.filter(t => !t.vesselId)
  const legacyMaint = allMaintenance.filter(m => !m.vesselId)
  const legacyParts = allParts.filter(p => !p.vesselId)

  if (legacyTrips.length > 0) console.log(`  ℹ️  ${legacyTrips.length} trips have no vesselId (pre-migration, served by backward-compat query)`)
  if (legacyMaint.length > 0) console.log(`  ℹ️  ${legacyMaint.length} maintenance records have no vesselId`)
  if (legacyParts.length > 0) console.log(`  ℹ️  ${legacyParts.length} parts have no vesselId`)
  if (legacyTrips.length + legacyMaint.length + legacyParts.length === 0) ok('All documents have vesselId.')

  // ── Summary ──────────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  Summary: ${totalIssues} issue(s) found`)
  if (FIX) {
    console.log(`           ${totalFixed} fix(es) applied`)
  } else if (totalIssues > 0) {
    console.log('  Run with --fix to automatically resolve issues.')
  }
  console.log('═══════════════════════════════════════════════════\n')
}

main().catch(e => { console.error('Fatal error:', e.message); process.exit(1) })
