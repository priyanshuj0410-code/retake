/**
 * Road names: generated, never typed, so no real name, number or slur can be one. Every word
 * names a place, a time or a thing (content/handles.json), so no handle carries a gender. A
 * number is added only when the plain name is taken.
 */
import { HANDLE_WORDS } from '../content'
import type { Lang } from '../content/types'
import { seededBy, type Rng } from './rng'

export interface Handle {
  a: string
  b: string
  n?: number
}

export const handleKey = (h: Handle) => `${h.a}.${h.b}${h.n ? `.${h.n}` : ''}`

export function handleText(h: Handle, lang: Lang): string {
  const a = HANDLE_WORDS.first.find((w) => w.id === h.a)
  const b = HANDLE_WORDS.second.find((w) => w.id === h.b)
  if (!a || !b) return ''
  const pick = (w: { en: string; hi: string }) => (lang === 'hi' ? w.hi : w.en)
  const joiner = b.joiner ? (lang === 'hi' ? (b.joiner.hi ?? b.joiner.en) : b.joiner.en) : ''
  return [pick(a), joiner, pick(b), h.n ? String(h.n) : ''].filter(Boolean).join(' ')
}

/** A free handle from the generator, numbered only if the plain name is taken. */
export function drawHandle(rng: Rng, taken: ReadonlySet<string>): Handle {
  for (;;) {
    const h: Handle = {
      a: rng.pick(HANDLE_WORDS.first).id,
      b: rng.pick(HANDLE_WORDS.second).id,
    }
    if (!taken.has(handleKey(h))) return h
    for (let tries = 0; tries < 20; tries++) {
      const numbered = { ...h, n: 2 + rng.int(98) }
      if (!taken.has(handleKey(numbered))) return numbered
    }
  }
}

/** Three different offers for round `round` of a player's re-rolls. */
export function offers(seed: number, round: number, taken: ReadonlySet<string>): Handle[] {
  const rng = seededBy('offers', seed, round)
  const out: Handle[] = []
  const seen = new Set(taken)
  while (out.length < 3) {
    const h = drawHandle(rng, seen)
    seen.add(handleKey(h))
    if (!out.some((o) => o.a === h.a || o.b === h.b)) out.push(h)
  }
  return out
}
