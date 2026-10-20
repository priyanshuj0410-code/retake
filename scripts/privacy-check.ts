/**
 * Profile C as extended (20 Oct 2026): play-day dates are kept, and nothing else about time.
 * No response times, keystrokes or per-answer stamps are stored; nothing in the app counts
 * time on screen; the notes are private. The browser half (the saved state after real play)
 * is in scripts/e2e.ts.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { record } from './lib/check'

const T = 'P privacy: dates only, no timers'
const ROOT = new URL('..', import.meta.url).pathname

export async function run() {
  const files = readdirSync(join(ROOT, 'src'), { recursive: true })
    .map(String)
    .filter((f) => /\.tsx?$/.test(f))
  const src = Object.fromEntries(files.map((f) => [f, readFileSync(join(ROOT, 'src', f), 'utf8')]))
  const clocks = files.filter((f) => /Date\.now\(|performance\.now\(|new Date\(\)|setInterval\(/.test(src[f]))
  record(T, 'only the calendar reads the clock (for the date), and nothing counts time', clocks.every((f) => f === 'engine/calendar.ts' || f === 'engine\\calendar.ts'), clocks.join(', '))
  const timeouts = files.filter((f) => /setTimeout\(/.test(src[f]))
  record(T, 'the one timeout is the hit-stop (a fixed hold, never a measure)', timeouts.length === 1 && /ui[/\\]Button\.tsx/.test(timeouts[0]), timeouts.join(', '))
  const types = src['store/index.ts'] + src['engine/answers.ts']
  record(T, 'the stored shapes have no time, duration, stamp or keystroke field', !/\b(time|ms|duration|stamp|timestamp|at[A-Z]\w*|keys?|keystrokes?|elapsed|took)\??:\s/.test(types.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')))
  const keyEvents = files.filter((f) => /onKey(Down|Up|Press)/.test(src[f]) && !/ui[/\\]Choices\.tsx/.test(f))
  record(T, 'no key events are listened to beyond radio-group arrow keys', keyEvents.length === 0, keyEvents.join(', '))
}
