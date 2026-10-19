/**
 * database.rules.json against the Realtime Database emulator, never a real database:
 * acceptance tests 1 (one-time tokens, 1000 replays), 6 (withdrawal and the explanation's
 * release gate) and 9 (no arrival order), the field whitelist behind test 4, and the
 * refusals the design rests on. It speaks the REST API as a device does, signed in
 * anonymously under a user id, or as a stranger, or as the emulator's owner (whom the rules
 * do not bind; used only to set dates, issue tokens and look at what is stored).
 *
 * Usage: pnpm rules
 * (firebase emulators:exec --only database,auth --project demo-eval 'tsx scripts/rules-check.ts')
 */
import { playDemo } from '../src/demo/players'
import type { Submission } from '../src/engine/records'
import { randomKey } from '../src/engine/rng'
import { record, results, summary } from './lib/check'

const HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST
const PROJECT = process.env.GCLOUD_PROJECT ?? 'demo-eval'
if (!HOST || !PROJECT.startsWith('demo-')) {
  console.error('rules-check runs only inside the emulator, on a demo- project: pnpm rules')
  process.exit(1)
}
const NS = `${PROJECT}-default-rtdb`

type Who = 'stranger' | 'owner' | { uid: string }
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
const tokenFor = (uid: string) => {
  const at = Math.floor(Date.now() / 1000)
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ iss: `https://securetoken.google.com/${PROJECT}`, aud: PROJECT, iat: at, exp: at + 3600, auth_time: at, sub: uid, user_id: uid, firebase: { sign_in_provider: 'anonymous', identities: {} } })}.`
}
const as = (uid: string): Who => ({ uid })
async function call(who: Who, method: string, path: string, body?: unknown) {
  const auth = typeof who === 'object' ? `&auth=${tokenFor(who.uid)}` : ''
  const res = await fetch(`http://${HOST}/${path}.json?ns=${NS}${auth}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(who === 'owner' ? { authorization: 'Bearer owner' } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  return { allowed: res.ok, status: res.status, value: text ? (JSON.parse(text) as unknown) : null }
}
const patch = (who: Who, body: Record<string, unknown>) => call(who, 'PATCH', '', body)

const DAY = 86_400_000
const T1 = 'AT-1 one-time tokens (emulator rules)'
const T4 = 'AT-4 no timers (emulator rules: field whitelist)'
const T6 = 'AT-6 the withdrawal code (emulator rules)'
const T9 = 'AT-9 no arrival order in the store (emulator rules)'
const TR = 'X-6 rules refusals (emulator)'

function submitWrites(
  sub: Submission | null,
  codeKey: string,
  uid: string,
  claim: { tok?: string; enrol?: string },
) {
  const w: Record<string, unknown> = {
    [`eval-codes/${codeKey}`]: sub?.dep ?? 'panel-g1',
    [`eval-claims/${uid}`]: null,
  }
  if (claim.tok) w[`eval-tokens/${claim.tok}/s`] = 'done'
  if (claim.enrol) w[`eval-enrol/${claim.enrol}/s`] = 'done'
  if (sub) {
    w[`eval-play/${sub.play.key}`] = sub.play.value
    for (const c of sub.crosswise) w[`eval-xw/${c.key}`] = c.value
    for (const d of sub.demographics) w[`eval-demo/${d.key}`] = d.value
  }
  return w
}

async function main() {
  await call('owner', 'DELETE', '')
  const now = Date.now()
  for (const dep of ['panel-g1', 'panel-g2', 'firm'])
    await call('owner', 'PUT', `eval-config/${dep}`, {
      releaseAt: now + 30 * DAY,
      deleteUntil: now + 44 * DAY,
    })
  await call('owner', 'PUT', 'eval-explain/panel-g1', { dep: 'panel-g1', sections: [] })
  await call('owner', 'PUT', 'eval-explain/panel-g2', { dep: 'panel-g2', sections: [] })

  /* ------------------------------------------------------ one-time tokens, 1000 replays */
  const tokens = Array.from({ length: 1000 }, () => randomKey())
  await call(
    'owner',
    'PATCH',
    'eval-tokens',
    Object.fromEntries(tokens.map((t) => [t, { dep: 'panel-g1', langs: 'en', s: 'issued' }])),
  )
  let started = 0
  let submitted = 0
  let replayRefused = 0
  let resubmitRefused = 0
  const keys: string[] = []
  for (const [i, tok] of tokens.entries()) {
    const uid = `device-${i}`
    const s = await patch(as(uid), {
      [`eval-tokens/${tok}/s`]: 'started',
      [`eval-claims/${uid}`]: { tok },
    })
    if (s.allowed) started += 1
    const codeKey = randomKey()
    const sub = await patch(as(uid), submitWrites(null, codeKey, uid, { tok }))
    if (sub.allowed) submitted += 1
    keys.push(codeKey)
    const other = `replayer-${i}`
    const again = await patch(as(other), {
      [`eval-tokens/${tok}/s`]: 'started',
      [`eval-claims/${other}`]: { tok },
    })
    if (!again.allowed) replayRefused += 1
    const twice = await patch(as(uid), submitWrites(null, randomKey(), uid, { tok }))
    if (!twice.allowed) resubmitRefused += 1
  }
  record(
    T1,
    '1000 tokens each start once and submit once',
    started === 1000 && submitted === 1000,
    `${started} started, ${submitted} submitted`,
  )
  record(
    T1,
    'every replay of a spent token is refused by the rules',
    replayRefused === 1000,
    `${replayRefused} of 1000`,
  )
  record(
    T1,
    'every second submission is refused by the rules',
    resubmitRefused === 1000,
    `${resubmitRefused} of 1000`,
  )
  const unissued = randomKey()
  record(
    T1,
    'a token nobody issued cannot be started',
    !(
      await patch(as('x'), {
        [`eval-tokens/${unissued}/s`]: 'started',
        [`eval-claims/x`]: { tok: unissued },
      })
    ).allowed,
  )
  record(
    T1,
    'a device cannot issue itself a token',
    !(
      await call(as('x'), 'PUT', `eval-tokens/${randomKey()}`, {
        dep: 'panel-g1',
        langs: 'en',
        s: 'issued',
      })
    ).allowed,
  )
  record(
    T1,
    'a token cannot be started without its claim in the same write',
    !(await call(as('y'), 'PUT', `eval-tokens/${tokens[0]}/s`, 'started')).allowed,
  )

  /* --------------------------------------------- a full session, its records and their fields */
  const t2 = randomKey()
  await call('owner', 'PUT', `eval-tokens/${t2}`, { dep: 'panel-g2', langs: 'en', s: 'issued' })
  const player = await playDemo(4242, 'panel-g2', ['en'])
  const subm = player.runner.submission()
  const uid = 'player-1'
  await patch(as(uid), { [`eval-tokens/${t2}/s`]: 'started', [`eval-claims/${uid}`]: { tok: t2 } })
  const bad = structuredClone(subm)
  ;(bad.play.value.meta as unknown as Record<string, unknown>).createdAt = Date.now()
  record(
    T4,
    'a record with a write-time field is refused',
    !(await patch(as(uid), submitWrites(bad, subm.codeKey, uid, { tok: t2 }))).allowed,
  )
  const bad2 = structuredClone(subm)
  const firstCard = Object.values(bad2.play.value.cards)[0] as unknown as Record<string, unknown>
  firstCard.ms = 5321
  record(
    T4,
    'a card record with a response-time field is refused',
    !(await patch(as(uid), submitWrites(bad2, subm.codeKey, uid, { tok: t2 }))).allowed,
  )
  const bad3 = structuredClone(subm)
  if (bad3.crosswise[0])
    (bad3.crosswise[0].value as unknown as Record<string, unknown>).sid = 'session-1'
  record(
    T4,
    'a crosswise record with a session id is refused',
    bad3.crosswise.length > 0 &&
      !(await patch(as(uid), submitWrites(bad3, subm.codeKey, uid, { tok: t2 }))).allowed,
  )
  const ok = await patch(as(uid), submitWrites(subm, subm.codeKey, uid, { tok: t2 }))
  record(
    T4,
    'a real submission, every field on the whitelist, is accepted',
    ok.allowed,
    ok.allowed ? '' : JSON.stringify(ok.value),
  )

  record(
    TR,
    'no device can read a person-level record',
    !(await call(as(uid), 'GET', `eval-play/${subm.play.key}`)).allowed &&
      !(await call('stranger', 'GET', `eval-play/${subm.play.key}`)).allowed,
  )
  record(
    TR,
    'no device can list or read crosswise or demographic records',
    !(await call(as(uid), 'GET', 'eval-xw')).allowed &&
      !(await call(as(uid), 'GET', `eval-xw/${subm.crosswise[0]?.key}`)).allowed &&
      !(await call(as(uid), 'GET', 'eval-demo')).allowed,
  )
  record(
    TR,
    'tokens and codes cannot be listed',
    !(await call(as(uid), 'GET', 'eval-tokens')).allowed &&
      !(await call(as(uid), 'GET', 'eval-codes')).allowed,
  )
  record(
    TR,
    'a record cannot be written without an open session',
    !(
      await patch(as('nobody'), {
        [`eval-xw/${randomKey()}`]: {
          dep: 'panel-g2',
          i: 'xw-m3-1',
          a: 'same',
          sub: 'low',
          lab: 'upper',
        },
      })
    ).allowed,
  )
  record(
    TR,
    'a stored record cannot be overwritten',
    !(await patch(as(uid), { [`eval-play/${subm.play.key}/meta/route`]: 'm1h' })).allowed,
  )
  record(
    TR,
    'nothing can be written outside the eval- nodes',
    !(await call(as(uid), 'PUT', `rooms/x`, { a: 1 })).allowed &&
      !(await call(as(uid), 'PUT', `spot/ABCD`, { a: 1 })).allowed,
  )
  record(
    TR,
    'release dates are written by the owner only',
    !(await call(as(uid), 'PUT', 'eval-config/panel-g2/releaseAt', 0)).allowed,
  )

  /* --------------------------------------------- the explanation's gate, and withdrawal */
  record(
    T6,
    'the explanation is refused before the release date',
    !(await call(as(uid), 'GET', 'eval-explain/panel-g2')).allowed,
  )
  record(
    T6,
    'the code is recognised (the explanation page can open with it)',
    (await call(as('reader'), 'GET', `eval-codes/${subm.codeKey}`)).value === 'panel-g2',
  )
  await call('owner', 'PUT', 'eval-config/panel-g2/releaseAt', now - DAY)
  record(
    T6,
    'the explanation opens after the release date',
    (await call(as(uid), 'GET', 'eval-explain/panel-g2')).allowed,
  )
  const del: Record<string, null> = { [`eval-play/${subm.play.key}`]: null }
  for (const k of (player.runner.keys as { xw: string[]; demo: string[] }).xw)
    del[`eval-xw/${k}`] = null
  for (const k of (player.runner.keys as { xw: string[]; demo: string[] }).demo)
    del[`eval-demo/${k}`] = null
  const w = await patch(as('someone-with-the-code'), del)
  const left = await Promise.all([
    call('owner', 'GET', `eval-play/${subm.play.key}`),
    ...subm.crosswise.map((c) => call('owner', 'GET', `eval-xw/${c.key}`)),
    ...subm.demographics.map((d) => call('owner', 'GET', `eval-demo/${d.key}`)),
  ])
  record(
    T6,
    'entering the code deletes every record carrying it, in every store',
    w.allowed && left.every((r) => r.value === null),
    `${subm.crosswise.length} crosswise, ${subm.demographics.length} demographic`,
  )
  const t3 = randomKey()
  await call('owner', 'PUT', `eval-tokens/${t3}`, { dep: 'panel-g2', langs: 'en', s: 'issued' })
  const p3 = await playDemo(4343, 'panel-g2', ['en'])
  const s3 = p3.runner.submission()
  await patch(as('player-3'), {
    [`eval-tokens/${t3}/s`]: 'started',
    [`eval-claims/player-3`]: { tok: t3 },
  })
  await patch(as('player-3'), submitWrites(s3, s3.codeKey, 'player-3', { tok: t3 }))
  await call('owner', 'PUT', 'eval-config/panel-g2/deleteUntil', now - 1000)
  record(
    T6,
    'withdrawal is refused after deleteUntil (two weeks after the release)',
    !(await patch(as('late'), { [`eval-play/${s3.play.key}`]: null })).allowed,
  )

  /* ---------------------------------------------------------------- no arrival order */
  await call('owner', 'PUT', 'eval-config/panel-g2/deleteUntil', now + 44 * DAY)
  const inserted: string[] = []
  for (let i = 0; i < 60; i++) {
    const tok = randomKey()
    await call('owner', 'PUT', `eval-tokens/${tok}`, { dep: 'panel-g2', langs: 'en', s: 'issued' })
    const p = await playDemo(50_000 + i, 'panel-g2', ['en'])
    const s = p.runner.submission()
    const u = `arrival-${i}`
    await patch(as(u), { [`eval-tokens/${tok}/s`]: 'started', [`eval-claims/${u}`]: { tok } })
    const r = await patch(as(u), submitWrites(s, s.codeKey, u, { tok }))
    if (r.allowed) inserted.push(s.play.key)
  }
  const stored = Object.keys(((await call('owner', 'GET', 'eval-play')).value ?? {}) as object)
  const order = inserted.map((k) => stored.indexOf(k)).filter((x) => x >= 0)
  const n = order.length
  const mean = (n - 1) / 2
  const sorted = order.map((x) => order.filter((y) => y < x).length)
  let num = 0
  let den = 0
  sorted.forEach((r, i) => {
    num += (r - mean) * (i - mean)
    den += (i - mean) ** 2
  })
  const rho = num / den
  record(
    T9,
    `the order of 60 known inserts cannot be recovered from the stored order (|rho| < 0.3)`,
    n === 60 && Math.abs(rho) < 0.3,
    `rho ${rho.toFixed(3)}, ${n} found`,
  )
  const dump = JSON.stringify((await call('owner', 'GET', 'eval-play')).value)
  record(
    T9,
    'the stored person-level records hold no write time, sequence or session id',
    !/"(time|ts|at|seq|session|sid|created|updated)"|1[67]\d{11}/.test(dump),
  )

  /* ----------------------------------------------------------------- the firm's enrolment */
  const ek = randomKey()
  const enrol = {
    firm: 'demo-firm',
    batch: 'b1',
    tdate: '2026-11-16',
    arm: 'after',
    from: '2026-11-17',
    to: '2026-11-23',
    month: '2026-11',
    sex: 'woman',
    s: 'enrolled',
  }
  const TB = 'AT-2 firm play window blocked by firm and month (emulator rules)'
  const block = 'eval-alloc/demo-firm/2026-11'
  record(
    TR,
    'an enrolment is created once (with its block state, in one write)',
    (await patch(as('e1'), { [`eval-enrol/${ek}`]: enrol, [block]: 'before' })).allowed &&
      !(await patch(as('e2'), { [`eval-enrol/${ek}`]: { ...enrol, sex: 'man' }, [block]: null }))
        .allowed,
  )
  record(
    TR,
    'an enrolment with an extra field is refused',
    !(
      await patch(as('e1'), {
        [`eval-enrol/${randomKey()}`]: { ...enrol, arm: 'before', email: 'x' },
        [block]: null,
      })
    ).allowed,
  )
  const before = { ...enrol, arm: 'before', from: '2026-11-09', to: '2026-11-15' }
  record(
    TB,
    'the second enrolment of a block cannot take the arm the first took',
    !(await patch(as('e3'), { [`eval-enrol/${randomKey()}`]: enrol, [block]: null })).allowed,
  )
  record(
    TB,
    'the second enrolment cannot leave the block state behind',
    !(await patch(as('e3'), { [`eval-enrol/${randomKey()}`]: before })).allowed,
  )
  record(
    TB,
    'the second enrolment takes the owed arm and clears the block',
    (await patch(as('e3'), { [`eval-enrol/${randomKey()}`]: before, [block]: null })).allowed &&
      (await call('owner', 'GET', block)).value === null,
  )
  record(
    TB,
    "a block's first enrolment must leave the other arm owed",
    !(await patch(as('e4'), { [`eval-enrol/${randomKey()}`]: enrol, [block]: 'after' })).allowed &&
      !(await patch(as('e4'), { [`eval-enrol/${randomKey()}`]: enrol })).allowed,
  )
  await call('owner', 'PUT', block, 'after')
  record(
    TB,
    'the block state cannot be flipped from one arm to the other',
    !(await call(as('e5'), 'PUT', block, 'before')).allowed,
  )
  await call('owner', 'DELETE', block)
  record(
    TB,
    "an enrolment's month must be its training date's month",
    !(
      await patch(as('e6'), {
        [`eval-enrol/${randomKey()}`]: { ...enrol, month: '2026-12' },
        ['eval-alloc/demo-firm/2026-12']: 'before',
      })
    ).allowed,
  )
  /* Twenty enrolments in one block through the rules: the arms alternate in pairs. */
  let diff = 0
  let worst = 0
  for (let i = 0; i < 20; i++) {
    const owed = (await call(as(`p${i}`), 'GET', 'eval-alloc/demo-firm/2027-01')).value as
      string | null
    const arm = owed ?? (i % 3 === 0 ? 'after' : 'before')
    const w =
      arm === 'after'
        ? { from: '2027-01-11', to: '2027-01-17' }
        : { from: '2027-01-03', to: '2027-01-09' }
    const r = await patch(as(`p${i}`), {
      [`eval-enrol/${randomKey()}`]: {
        ...enrol,
        tdate: '2027-01-10',
        month: '2027-01',
        arm,
        ...w,
        sex: ['woman', 'man', 'prefer-not'][i % 3],
      },
      ['eval-alloc/demo-firm/2027-01']: owed ? null : arm === 'after' ? 'before' : 'after',
    })
    if (r.allowed) diff += arm === 'after' ? 1 : -1
    worst = Math.max(worst, Math.abs(diff))
  }
  record(
    TB,
    '20 enrolments in one block through the rules: the arms never differ by more than one',
    worst <= 1,
    `largest difference ${worst}`,
  )
  record(
    TR,
    'the enrolment is spent once for its play session',
    (
      await patch(as('f1'), {
        [`eval-enrol/${ek}/s`]: 'started',
        [`eval-claims/f1`]: { enrol: ek },
      })
    ).allowed &&
      !(
        await patch(as('f2'), {
          [`eval-enrol/${ek}/s`]: 'started',
          [`eval-claims/f2`]: { enrol: ek },
        })
      ).allowed,
  )
  const fp = await playDemo(77, 'firm', ['en'], {
    timingArm: 'after',
    batchMonth: '2026-11',
    sex: 'woman',
  })
  const fs = fp.runner.submission()
  record(
    TR,
    'a firm session submits once, carrying the sex label, timing arm and batch-month',
    (await patch(as('f1'), submitWrites(fs, fs.codeKey, 'f1', { enrol: ek }))).allowed &&
      !(await patch(as('f1'), submitWrites(fs, randomKey(), 'f1', { enrol: ek }))).allowed,
  )
}

await main().catch((e) =>
  results.push({ test: 'ERROR rules-check', name: 'threw', ok: false, detail: String(e) }),
)
const ok = summary()
process.exit(ok ? 0 : 1)
