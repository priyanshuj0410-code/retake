/**
 * DEMO ONLY. Writes content/merit-reference.json: each description's merit-only rank m(c, j),
 * the mean score of the description among all-baseline presentations, estimated here from
 * seeded demo players. In the study it comes from P1's pilot; this file is then replaced.
 * Usage: pnpm tsx scripts/merit-reference.ts [players]
 */
import { writeFileSync } from 'node:fs'
import { playDemo } from '../src/demo/players'
import { DEPLOYMENTS } from '../src/engine/config'
import { characterScores } from '../src/engine/score'

const N = Number(process.argv[2] ?? 1500)
const sum = new Map<string, { s: number; n: number }>()
for (let i = 0; i < N; i++) {
  for (const dep of DEPLOYMENTS) {
    const p = await playDemo(500_000 + i, dep, ['en'], dep === 'firm' ? { timingArm: 'before', batchMonth: '2026-11', sex: 'prefer-not' } : undefined, 1)
    for (const a of p.runner.answers.people.values()) {
      if (!a.p.baseline) continue
      const s = characterScores(a.p.card, a)
      a.p.chars.forEach((c, k) => {
        const e = sum.get(c.d) ?? { s: 0, n: 0 }
        e.s += s[k]
        e.n += 1
        sum.set(c.d, e)
      })
    }
  }
}
const out: Record<string, number> = { _note: 0 } as Record<string, number>
delete out._note
for (const [d, e] of [...sum].sort()) out[d] = Math.round((e.s / e.n) * 1e4) / 1e4
writeFileSync(new URL('../content/merit-reference.json', import.meta.url), JSON.stringify(out, null, 1) + '\n')
console.log(`merit-reference: ${sum.size} descriptions from ${N} demo players per deployment (DEMO; P1 replaces it)`)
