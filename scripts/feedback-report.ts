/**
 * `pnpm feedback` (EVAL-24): the players' ratings and lines, read with the owner's Firebase login (the rules let nobody
 * else read them). The same data is in the console: https://console.firebase.google.com/project/the-equal-lens/database
 */
import { execFileSync } from 'node:child_process'

type Rating = { stars: number; line?: string; sent: string }
const ACCOUNT = 'priyanshu.jain@theequallens.com'
let raw = ''
try {
  raw = execFileSync(
    'firebase',
    ['database:get', '/retake-feedback', '--project', 'the-equal-lens', '--instance', 'the-equal-lens-default-rtdb', '--account', ACCOUNT],
    { encoding: 'utf8', maxBuffer: 2 ** 30, stdio: ['ignore', 'pipe', 'ignore'] },
  )
} catch {
  console.error(`Could not read the ratings. Renew the login with "firebase login:add" and pick ${ACCOUNT} (not "firebase login --reauth"), or read them in the console, https://console.firebase.google.com/project/the-equal-lens/database`)
  process.exit(1)
}
const rows = Object.values((JSON.parse(raw) ?? {}) as Record<string, Rating>).sort((a, b) => String(a.sent).localeCompare(String(b.sent)))
if (!rows.length) {
  console.log('No ratings yet.')
  process.exit(0)
}
const mean = rows.reduce((n, r) => n + r.stars, 0) / rows.length
console.log(`${rows.length} rating${rows.length === 1 ? '' : 's'}, ${mean.toFixed(1)} of 5 on average`)
for (const s of [5, 4, 3, 2, 1]) console.log(`  ${s} stars: ${rows.filter((r) => r.stars === s).length}`)
console.log('')
// a line is whatever someone sent: it never gets to move the cursor or fake a row
for (const r of rows) console.log(`${r.sent}  ${r.stars}/5  ${r.line ? JSON.stringify(r.line) : ''}`)
