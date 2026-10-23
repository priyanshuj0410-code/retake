import { TAKE } from './data'
import type { Answer } from './steps/common'

// What the private reading reads from each answer (the demo's favoured()), apart from the cards that show it.

/** Which of a decision's hidden two the answer favoured, or null when it favoured neither (the demo's favoured()). */
export function favoured(id: string, a: Answer | undefined): string | null {
  const d = TAKE.results.decisions[id]
  if (!d || !a) return null
  const [p, q] = d.pair
  if ('pick' in a) return a.pick && d.pair.includes(a.pick) ? a.pick : null
  if ('set' in a) {
    const x = a.set.includes(p)
    const y = a.set.includes(q)
    return x === y ? null : x ? p : q
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
