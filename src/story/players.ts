/**
 * Seeded season players for the checks and the demo (DEMO ONLY, nothing here is a finding).
 * Each decides by a random-utility model: the merit tier of the notes, a weight against
 * women (cueWeight > 0 favours men), noise, and an optional content-blind (careless) mode.
 */
import { seeded, type Rng } from '../engine/rng'
import { surveyItems } from '../content'
import { storyById } from './content'
import { StoryRunner, type BeatAnswer } from './runner'
import type { PeoplePresented } from './session'
import { config } from '../engine/config'

export interface SeasonTraits {
  cueWeight: number
  noise: number
  careless: boolean
}

const gauss = (rng: Rng) =>
  Math.sqrt(-2 * Math.log(1 - rng.next())) * Math.cos(2 * Math.PI * rng.next())

export function decide(rng: Rng, r: StoryRunner, p: PeoplePresented, t: SeasonTraits): BeatAnswer {
  const k = p.chars.length
  const u = p.chars.map((ch) => {
    if (t.careless) return rng.next()
    const c = r.cast[ch.slot]
    const cue = c.sex === 'woman' ? -t.cueWeight : 0
    return ch.tier + cue + t.noise * gauss(rng)
  })
  const order = [...Array(k).keys()].sort((a, b) => u[b] - u[a])
  if (p.beat.kind === 'rank') return { order }
  if (p.beat.kind === 'pick') return { pick: order[0] }
  const units = Array<number>(k).fill(0)
  const pool = p.beat.pool ?? 6
  const cap = config.season.splitCap
  /* Most to the most wanted (or, for unwanted work, to the best placed), within the cap. */
  const plan = [Math.min(cap, Math.ceil(pool / 2)), Math.floor(pool / 3), 0]
  let left = pool
  order.forEach((pos, rk) => {
    const give = Math.min(left, rk === k - 1 ? left : (plan[rk] ?? 0), cap)
    units[pos] = give
    left -= give
  })
  return { units }
}

/** Plays a whole season to the submit screen, with every answer a seeded player gives. */
export function playSeason(seed: number, t: SeasonTraits, storyId = 'warehouse') {
  const rng = seeded(seed)
  const story = storyById(storyId)
  if (!story) throw new Error(`no story ${storyId}`)
  const r = new StoryRunner(rng, story, ['en'])
  for (let guard = 0; guard < 400 && r.current && r.current.kind !== 'submit'; guard++) {
    const s = r.current
    if (s.kind === 'beat') {
      const b = r.season.beats[s.i]
      if (b.kind === 'people') r.answer(decide(rng, r, b, t))
      else r.answer({ option: rng.pick(b.order) })
    } else if (s.kind === 'survey')
      r.answer(Object.fromEntries(surveyItems.map((i) => [i.id, rng.int(5)])))
    else if (s.kind === 'prior') r.answer('no')
    else if (s.kind === 'demographics') r.answer({})
    else r.answer(null)
  }
  return r
}

export const fairPlayer: SeasonTraits = { cueWeight: 0, noise: 0.3, careless: false }
export const leaningPlayer: SeasonTraits = { cueWeight: 2, noise: 0.3, careless: false }
export const carelessPlayer: SeasonTraits = { cueWeight: 0, noise: 0, careless: true }
