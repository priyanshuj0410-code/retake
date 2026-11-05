import { TAKE, type Bi } from './data'
import type { Answer } from './steps/common'

// What the private reading reads from each answer (the demo's favoured()), apart from the cards that show it.

export type Side = 'm' | 'w'
export const SIDE: Record<Side, Bi> = { m: ['man', 'आदमी'], w: ['woman', 'औरत'] }

/** Which of a decision's hidden two the answer favoured, or null when it favoured neither (the demo's favoured()). */
export function favoured(id: string, a: Answer | undefined): string | null {
  const d = TAKE.results.decisions[id]
  if (!d || !a) return null
  const [p, q] = d.pair
  if ('pick' in a) return a.pick && d.pair.includes(a.pick) ? a.pick : null
  if ('set' in a) {
    const x = a.set.includes(p)
    const y = a.set.includes(q)
    if (x === y) return null
    return x !== !!d.burden ? p : q   // a chore: being left out is the favour, as in Split
  }
  if ('chores' in a) {
    const x = a.chores[p] ?? 0
    const y = a.chores[q] ?? 0
    return x === y ? null : x < y ? p : q   // fewer chores is the favour
  }
  const i = a.order.indexOf(p)
  const j = a.order.indexOf(q)
  return i < 0 || j < 0 ? null : i < j ? p : q
}

const swapEn = (s: string) => s.replace(/\b(man|woman)\b/g, (x) => (x === 'man' ? 'woman' : 'man'))
const swapHi = (s: string) => s.replace(/आदमी|औरत/g, (x) => (x === 'आदमी' ? 'औरत' : 'आदमी'))

/** The counts and twins the five cards draw, from the player's own answers. */
export function readingOf(answers: Record<string, Answer>) {
  const D = TAKE.results.decisions
  const picks = Object.fromEntries(Object.keys(D).map((id) => [id, favoured(id, answers[id])]))
  const sexOf = (id: string): Side | null => (picks[id] ? D[id].sex[picks[id]!] : null)
  const read = Object.keys(D).filter((id) => sexOf(id))
  const m = read.filter((id) => sexOf(id) === 'm').length
  const w = read.length - m
  const more: Side | null = m > w ? 'm' : w > m ? 'w' : null
  const twins = TAKE.results.twins.filter((t) => t.kind !== 'hard').map((t) => ({ ...t, ga: sexOf(t.a), gb: sexOf(t.b) }))
  return { picks, read, m, w, more, twins }
}

/** Card 2: one twin that shows it, and the words. In a chore's twin the one marked is the one who got more of it, since
 * pick yellow means "you picked this" (DESIGN.md), and the favoured one is the one let off. */
export function twinOf({ twins, picks, more }: ReturnType<typeof readingOf>) {
  const D = TAKE.results.decisions
  const one = twins
    .filter((t) => t.ga && t.ga === t.gb)
    .sort((x, y) => Number(y.ga === more) - Number(x.ga === more) || Number(x.kind === 'matters') - Number(y.kind === 'matters'))[0]
  const both = one ?? twins.find((t) => t.ga && t.gb)
  if (!both) return null
  const chore = D[both.a].kind === 'split' || !!D[both.a].burden
  const mark = (id: string) => (chore ? (D[id].pair.find((p) => picks[id] && p !== picks[id]) ?? null) : picks[id])
  const cap = both.nudge[0][0].toUpperCase() + both.nudge[0].slice(1)
  const given = one && SIDE[one.ga === 'm' ? 'w' : 'm']
  const text: Bi = !one
    ? [`Same numbers both times. ${cap} swapped sides, and so did your pick.`, `दोनों बार नंबर एक जैसे थे। ${both.nudge[1]} की जगह बदली, और आपकी पसंद भी।`]
    : chore
      ? [`Same numbers both times. ${cap} swapped sides. You gave the ${given![0]} more both times.`, `दोनों बार नंबर एक जैसे थे। बस ${both.nudge[1]} की जगह बदली। आपने दोनों बार ${given![1]} को ज़्यादा काम दिया।`]
      : [`Same numbers both times. ${cap} swapped sides. You picked the ${SIDE[one.ga!][0]} both times.`, `दोनों बार नंबर एक जैसे थे। बस ${both.nudge[1]} की जगह बदली। आपने दोनों बार ${SIDE[one.ga!][1]} को चुना।`]
  return { twin: both, marked: { [both.a]: mark(both.a), [both.b]: mark(both.b) } as Record<string, string | null>, text }
}

/** Card 3: the part of life the twins leaned most, as its plain line; null when none leaned. */
export function leanOf(twins: ReturnType<typeof readingOf>['twins']): { world: string; line: Bi } | null {
  const score: Record<string, number> = {}
  for (const t of twins) if (t.ga && t.ga === t.gb) score[t.world] = (score[t.world] ?? 0) + (t.ga === 'm' ? 1 : -1)
  const top = Object.entries(score).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0]
  if (!top || !top[1]) return null
  const real = TAKE.results.areas[top[0]].real
  return { world: top[0], line: top[1] > 0 ? real : [swapEn(real[0]), swapHi(real[1])] }
}
