/**
 * Seeded season players for the checks and the demo (DEMO ONLY, nothing here is a finding).
 * Each decides by a random-utility model: the merit tier of the notes, a weight against
 * women (cueWeight > 0 favours men), noise, and an optional content-blind (careless) mode.
 */
import { seeded, type Rng } from '../engine/rng'
import { storyById } from './content'
import { StoryRunner, type BeatAnswer } from './runner'
import type { PeoplePresented } from './session'
import { config } from '../engine/config'

export interface SeasonTraits {
  cueWeight: number
  /** A weight against one-offs with surnames read as Scheduled Caste (the caste check). */
  casteWeight?: number
  noise: number
  careless: boolean
}

const gauss = (rng: Rng) =>
  Math.sqrt(-2 * Math.log(1 - rng.next())) * Math.cos(2 * Math.PI * rng.next())

export function decide(rng: Rng, r: StoryRunner, p: PeoplePresented, t: SeasonTraits): BeatAnswer {
  const k = p.chars.length
  const u = p.chars.map((ch) => {
    if (t.careless) return rng.next()
    const c = r.person(ch.slot)
    const cue =
      (c.sex === 'woman' && !c.oneOff ? -t.cueWeight : 0) -
      (c.caste === 'sc-coded' ? (t.casteWeight ?? 0) : 0)
    /* Unwanted work goes the other way: a lean against women gives them more of it. */
    return ch.tier + (p.beat.family === 'npt' ? -cue : cue) + t.noise * gauss(rng)
  })
  const order = [...Array(k).keys()].sort((a, b) => u[b] - u[a])
  if (p.beat.kind === 'rank') return { order }
  if (p.beat.kind === 'pick') return { pick: order[0] }
  /* A share is a one-tap pair (EVAL-8): the whole pool to one colleague, or split evenly when
     the two are close. */
  const pool = p.beat.pool ?? 6
  if (k === 2 && Math.abs(u[0] - u[1]) < 0.2) return { units: [pool / 2, pool / 2] }
  return { units: p.chars.map((_, pos) => (pos === order[0] ? pool : 0)) }
}

/** Plays a whole season to the submit screen, with every answer a seeded player gives. */
export function playSeason(seed: number, t: SeasonTraits, storyId = 'warehouse') {
  const rng = seeded(seed)
  const story = storyById(storyId)
  if (!story) throw new Error(`no story ${storyId}`)
  const r = new StoryRunner(rng, story, ['en'])
  for (let guard = 0; guard < 400 && r.current && r.current.kind !== 'close'; guard++) {
    const s = r.current
    if (s.kind === 'beat') {
      const b = r.season.beats[s.i]
      if (b.kind === 'people') r.answer(decide(rng, r, b, t))
      else r.answer({ option: rng.pick(b.order) })
    } else if (s.kind === 'fsurvey')
      r.answer(Object.fromEntries(config.season.faking.survey.map((id) => [id, rng.int(5)])))
    else if (s.kind === 'screening')
      r.answer(Object.fromEntries(config.season.faking.screening.map((id) => [id, rng.int(5)])))
    else if (s.kind === 'recall') r.answer(r.note)
    else if (s.kind === 'probe') r.answer(['sex'])
    else if (s.kind === 'wrap') r.answer({ told: 'no', origin: 'chose', replay: 'no' })
    else if (s.kind === 'demographics') r.answer({})
    else r.answer(null)
  }
  return r
}

export const fairPlayer: SeasonTraits = { cueWeight: 0, noise: 0.3, careless: false }
export const leaningPlayer: SeasonTraits = { cueWeight: 2, noise: 0.3, careless: false }
export const carelessPlayer: SeasonTraits = { cueWeight: 0, noise: 0, careless: true }
