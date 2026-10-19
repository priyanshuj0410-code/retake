/**
 * Acceptance test 4: no timers. No countdown, deadline or time limit on any card, answer or
 * act, and no per-answer timestamp, response time or keystroke stored. A source audit of the
 * app, a schema audit of every record type and of real generated records, and the rules'
 * field whitelist (scripts/rules-check.ts proves the database refuses any other field).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { playDemo } from '../src/demo/players'
import { DEPLOYMENTS } from '../src/engine/config'
import { record } from './lib/check'

const T = 'AT-4 no timers'
const ROOT = new URL('..', import.meta.url).pathname
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) =>
    statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)],
  )

const TIME_KEY =
  /time|date|stamp|^ts$|^at$|created|updated|elapsed|duration|latency|seq|order(ed)?At|keystroke|^ms$/i

export function timeFields(o: unknown, path = ''): string[] {
  if (o === null || typeof o !== 'object')
    return typeof o === 'number' && o > 1e11 ? [`${path} looks like an epoch time`] : []
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => [
    /* Record keys are random or code-derived ids, not field names. */
    ...(TIME_KEY.test(k) && !/^\d+$/.test(k) && !/^([0-9a-z]{28}|[0-9a-f]{32})$/.test(k)
      ? [`${path}/${k}`]
      : []),
    ...timeFields(v, `${path}/${k}`),
  ])
}

export async function run() {
  const src = walk(join(ROOT, 'src')).filter((f) => /\.(tsx?|css)$/.test(f))
  const bad: string[] = []
  for (const f of src) {
    const s = readFileSync(f, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    for (const re of [
      /setTimeout/,
      /setInterval/,
      /requestAnimationFrame/,
      /performance\.now/,
      /countdown/i,
      /deadline/i,
      /timeLimit|time_limit|timeout/i,
      /onKey(Down|Up|Press)/,
      /@keyframes|animation:/,
    ])
      if (re.test(s)) bad.push(`${f.replace(ROOT, '')}: ${re}`)
  }
  record(
    T,
    'no timer, countdown, deadline, animation loop or keystroke capture in src/',
    bad.length === 0,
    bad.join('; '),
  )
  const clock = src.filter((f) => /Date\.now\(\)/.test(readFileSync(f, 'utf8')))
  record(
    T,
    'the clock is read only by the store (release dates, play windows), never by a session',
    clock.every((f) => /src\/store\//.test(f)),
    clock.map((f) => f.replace(ROOT, '')).join(', '),
  )

  const types = readFileSync(join(ROOT, 'src/engine/records.ts'), 'utf8')
  const fields = [...types.matchAll(/^\s+(\w+)\??:/gm)].map((m) => m[1])
  const timey = fields.filter((f) => TIME_KEY.test(f))
  record(T, 'no record type declares a time-like field', timey.length === 0, timey.join(', '))

  for (const dep of DEPLOYMENTS) {
    const p = await playDemo(
      31,
      dep,
      ['en', 'hinglish'],
      dep === 'firm' ? { timingArm: 'after', batchMonth: '2026-11', sex: 'woman' } : undefined,
    )
    const tf = timeFields(p.runner.submission())
    record(
      T,
      `a full ${dep} submission carries no time field and no epoch value`,
      tf.length === 0,
      tf.slice(0, 5).join(', '),
    )
  }
}
