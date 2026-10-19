/**
 * M3's device label (candidates v12, 9, M3; research plan v1, section 9, test 10).
 *
 * From the player's own cue-carrying conduct cards, the device computes the merit weight
 * beta and its engagement test, the directional conduct cue weight L (the one-sided lean
 * against the woman complainant, floored per accused-sex stratum) and the player's own
 * floor Q on L. It attaches only "upper", "lower" or "not-engaged" to the crosswise records
 * and keeps no copy: the function returns the label and nothing else, and its inputs are
 * the in-memory card answers, which are never written with the label.
 *
 * The merit references come from P1's pilot. In demo mode they are content/merit-reference.json,
 * estimated from the seeded demo players' all-baseline presentations (scripts/merit-reference.ts).
 */
import meritRef from '../../content/merit-reference.json'
import { config } from './config'
import type { Rng } from './rng'

export type M3Label = 'upper' | 'lower' | 'not-engaged'

export interface ConductCard {
  stratum: string
  /** Per character: description id, complainant sex and the character's score s. */
  chars: { d: string; woman: boolean; s: number }[]
}

const m = (d: string) => (meritRef as Record<string, number>)[d] ?? 0.5

/** Within-card slope of s on m, pooled over cards. */
export function beta(cards: { m: number[]; s: number[] }[]): number {
  let num = 0
  let den = 0
  for (const c of cards) {
    const mm = c.m.reduce((a, b) => a + b, 0) / c.m.length
    const ms = c.s.reduce((a, b) => a + b, 0) / c.s.length
    c.m.forEach((mi, i) => {
      num += (mi - mm) * (c.s[i] - ms)
      den += (mi - mm) ** 2
    })
  }
  return den > 0 ? num / den : 0
}

/** Signed deviation per stratum: mean e over woman complainants minus mean e over men. */
function deltas(cards: ConductCard[], labels: boolean[][]): Map<string, number> {
  const acc = new Map<string, { w: number[]; m: number[] }>()
  cards.forEach((c, ci) => {
    const a = acc.get(c.stratum) ?? { w: [], m: [] }
    c.chars.forEach((ch, i) => (labels[ci][i] ? a.w : a.m).push(ch.s - m(ch.d)))
    acc.set(c.stratum, a)
  })
  const out = new Map<string, number>()
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
  for (const [k, a] of acc) out.set(k, mean(a.w) - mean(a.m))
  return out
}

export function m3Label(rng: Rng, cards: ConductCard[]): M3Label {
  if (cards.length === 0) return 'not-engaged'
  const P = config.engagement.permutations

  /* Engagement: beta against its within-card permutation null, observed value counted. */
  const obsBeta = beta(cards.map((c) => ({ m: c.chars.map((x) => m(x.d)), s: c.chars.map((x) => x.s) })))
  let atLeast = 1
  for (let r = 0; r < P; r++) {
    const b = beta(cards.map((c) => ({ m: rng.shuffle(c.chars.map((x) => m(x.d))), s: c.chars.map((x) => x.s) })))
    if (b >= obsBeta) atLeast += 1
  }
  if (atLeast / (P + 1) > config.engagement.alpha) return 'not-engaged'

  /* L and its one-sided floors G, from within-card, within-stratum permutations of the labels. */
  const strata = [...new Set(cards.map((c) => c.stratum))]
  const weight = new Map(strata.map((k) => [k, cards.filter((c) => c.stratum === k).length / cards.length]))
  const observed = cards.map((c) => c.chars.map((x) => x.woman))
  const perms: boolean[][][] = [observed]
  for (let r = 0; r < config.m3.permutations; r++) perms.push(cards.map((c) => rng.shuffle(c.chars.map((x) => x.woman))))
  const against = perms.map((lab) => {
    const dl = deltas(cards, lab)
    return new Map(strata.map((k) => [k, Math.max(0, -(dl.get(k) ?? 0))]))
  })
  const G = new Map(strata.map((k) => [k, against.reduce((s, a) => s + (a.get(k) ?? 0), 0) / against.length]))
  const L = (a: Map<string, number>) => strata.reduce((s, k) => s + (weight.get(k) ?? 0) * ((a.get(k) ?? 0) - (G.get(k) ?? 0)), 0)
  const values = against.map(L)
  const obsL = values[0]
  const sorted = values.slice().sort((a, b) => a - b)
  const Q = sorted[Math.min(sorted.length - 1, Math.floor(config.m3.q * sorted.length))]
  return obsL > Q ? 'upper' : 'lower'
}
