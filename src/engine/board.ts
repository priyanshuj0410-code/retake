/**
 * The global board, ranked by practice. There is no backend yet, so the other players are a
 * sample generated from content/sample.json with a fixed seed: every phone sees the same
 * board, and the screen labels it as made up. Only the top ranks and the player's own rank
 * and percentile are ever shown; there is no bottom list.
 */
import { SAMPLE } from '../content'
import { drawHandle, handleKey, type Handle } from './handles'
import { seeded } from './rng'

export interface SamplePlayer {
  handle: Handle
  key: string
  practice: number
}

let cache: { values: number[]; named: SamplePlayer[] } | null = null

function build() {
  if (cache) return cache
  const rng = seeded(SAMPLE.seed)
  /* A rank curve: a long head (rank to the power -0.12) times a tail that reaches 0 at the
     last rank, with the tail's power set so the middle rank has the median practice. */
  const n = SAMPLE.players
  const head = (r: number) => SAMPLE.topPractice * r ** -0.12
  const k = Math.log(SAMPLE.medianPractice / head(n / 2)) / Math.log(0.5)
  const values = [...Array(n).keys()].map((i) => Math.round(head(i + 1) * (1 - i / n) ** k))
  const taken = new Set<string>()
  const named = values.slice(0, SAMPLE.named).map((practice) => {
    const handle = drawHandle(rng, taken)
    taken.add(handleKey(handle))
    return { handle, key: handleKey(handle), practice }
  })
  cache = { values, named }
  return cache
}

export const sampleNamed = () => build().named
export const sampleTaken = () => new Set(build().named.map((p) => p.key))
export const sampleSize = () => SAMPLE.players

/** The player's rank among the sample with their practice, and the top band they sit in. */
export function rankOf(practice: number) {
  const { values } = build()
  let lo = 0
  let hi = values.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (values[mid] > practice) lo = mid + 1
    else hi = mid
  }
  const rank = lo + 1
  const total = values.length + 1
  return { rank, total, topPercent: Math.max(1, Math.ceil((100 * rank) / total)) }
}

export const topOfBoard = (n = 10) => build().named.slice(0, n)

export function findPlayers(query: string, render: (h: Handle) => string, limit = 6) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return build()
    .named.filter((p) => render(p.handle).toLowerCase().includes(q))
    .slice(0, limit)
}

export const playerByKey = (key: string) => build().named.find((p) => p.key === key)
