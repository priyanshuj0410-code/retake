/**
 * Profile C as extended (20 Oct 2026): play-day dates are kept, and nothing else about time.
 * No response times, keystrokes or per-answer stamps are stored; nothing in the app counts
 * time on screen; the notes are private. The browser half (the saved state after real play)
 * is in scripts/e2e.ts.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { record } from './lib/check'

const T = 'P privacy: dates only, no timers (the First take keeps its place, answers, language and sound switch)'
const ROOT = new URL('..', import.meta.url).pathname

export async function run() {
  const files = readdirSync(join(ROOT, 'src'), { recursive: true })
    .map(String)
    .filter((f) => /\.tsx?$/.test(f))
  const src = Object.fromEntries(files.map((f) => [f, readFileSync(join(ROOT, 'src', f), 'utf8')]))
  const clocks = files.filter((f) => /Date\.now\(|performance\.now\(|new Date\(\)|setInterval\(/.test(src[f]))
  record(T, 'only the calendar reads the clock (for the date), and nothing counts time', clocks.every((f) => f === 'engine/calendar.ts' || f === 'engine\\calendar.ts'), clocks.join(', '))
  // the turned-down build's one timeout was its hit-stop; the First take waits on nothing
  const timeouts = files.filter((f) => /setTimeout\(/.test(src[f]))
  record(T, 'nothing waits on a timer', timeouts.length === 0, timeouts.join(', '))
  // every file that declares a stored shape; a moved or renamed one fails here instead of passing unread
  const shapes = ['store/index.ts', 'engine/answers.ts', 'take/store.ts', 'take/steps/common.tsx', 'daily/store.ts']
  const missing = shapes.filter((f) => !(f in src))
  const types = shapes.map((f) => src[f] ?? '').join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  // whole words, and the camelCase endings (startedAt, finishTime, durationMs); the take's `at:` is its place and the
  // board's `allTime:` a count, neither a time
  const timed = /\b(time|ms|ts|duration|stamp|timestamp|seconds?|minutes?|hours?|at[A-Z]\w*|keys?|keystrokes?|elapsed|took)\??:\s/.test(types) ||
    /(?<=[a-z])(?<!\ball)(At|Time|Ms|Stamp|Seconds?|Minutes?|Hours?)\??:\s/.test(types)
  record(T, 'the stored shapes have no time, duration, stamp or keystroke field', !missing.length && !timed, missing.length ? `not found: ${missing.join(', ')}` : '')
  const keyEvents = files.filter((f) => /onKey(Down|Up|Press)/.test(src[f]))
  record(T, 'no key events are listened to (Escape on the "?" sheet is a window listener, never a measure)', keyEvents.length === 0, keyEvents.join(', '))
}
