/**
 * Seeds the Realtime Database emulator for a demo run on the Firebase store: release dates,
 * the demo firm's schedule, the scoring explanation (gated by the rules until its release
 * date), one-time tokens, and optionally the records of seeded demo players.
 * Usage, with `pnpm emulators` running in another terminal:
 *   pnpm seed [players]
 * then `pnpm dev:emu` and open a printed link. DEMO ONLY: refuses anything but a demo- project.
 */
import { readFileSync } from 'node:fs'
import { playDemo } from '../src/demo/players'
import { config, DEPLOYMENTS } from '../src/engine/config'
import { randomKey } from '../src/engine/rng'
import { DEMO_SCHEDULE, releaseOf } from '../src/store/local'

const HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST ?? '127.0.0.1:9000'
const PROJECT = process.env.GCLOUD_PROJECT ?? 'demo-eval'
if (!PROJECT.startsWith('demo-')) throw new Error('seed-emulator writes only to a demo- project')
const NS = `${PROJECT}-default-rtdb`
const put = (path: string, body: unknown) =>
  fetch(`http://${HOST}/${path}.json?ns=${NS}`, {
    method: 'PUT',
    headers: { authorization: 'Bearer owner' },
    body: JSON.stringify(body),
  })

const players = Number(process.argv[2] ?? 0)
for (const dep of DEPLOYMENTS) await put(`eval-config/${dep}`, releaseOf(dep))
await put(`eval-schedule/${DEMO_SCHEDULE.firm}`, DEMO_SCHEDULE)
const explanations = JSON.parse(
  readFileSync(new URL('../content/explanation.json', import.meta.url), 'utf8'),
) as { dep: string }[]
for (const e of explanations) await put(`eval-explain/${e.dep}`, e)
for (const dep of ['panel-g1', 'panel-g2'] as const) {
  for (const langs of ['choose', 'both']) {
    const t = randomKey()
    await put(`eval-tokens/${t}`, { dep, langs, s: 'issued' })
    console.log(`${dep} (${langs}): http://localhost:5173/#/play/${t}`)
  }
}
console.log(`firm enrolment: http://localhost:5173/#/enrol/${DEMO_SCHEDULE.firm}`)
for (let i = 0; i < players; i++) {
  const dep = DEPLOYMENTS[i % 3]
  const p = await playDemo(
    800_000 + i,
    dep,
    ['en'],
    dep === 'firm'
      ? {
          timingArm: i % 2 ? 'after' : 'before',
          batchMonth: '2026-11',
          sex: ['woman', 'man', 'prefer-not'][i % 3],
        }
      : undefined,
  )
  const s = p.runner.submission()
  await put(`eval-codes/${s.codeKey}`, dep)
  await put(`eval-play/${s.play.key}`, s.play.value)
  for (const c of s.crosswise) await put(`eval-xw/${c.key}`, c.value)
  for (const d of s.demographics) await put(`eval-demo/${d.key}`, d.value)
}
if (players)
  console.log(`${players} demo players' records written (demo version ${config.version})`)
