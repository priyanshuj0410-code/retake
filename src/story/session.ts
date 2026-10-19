/**
 * One season's draws, all made before the first decision so no draw follows an answer.
 *
 * The cast. Eight colleagues, four women and four men (config.season.castSize, PENDING v18),
 * carrying sex, religion and skin tone only: within each sex two Hindus and two Muslims (first
 * names from content/identity.json), the darker tone on one of each, so religion and tone are
 * balanced within sex. Caste and birthplace ride on one-off characters met once inside the
 * episodes (applicants, complainants, vendors; the owner's layout, PENDING v18). Before the reveal each colleague is a different animal mascot with a
 * made-up mascot name; the reveal maps each mascot to its person. Each woman is paired at
 * random with one man as rivals: the pairs whose notes are tied when the season sets one
 * against the other.
 *
 * Each people beat then draws which colleagues it shows (by its tie structure, balanced over
 * the season), which of its descriptions each one carries (the tied descriptions always go to
 * the tied colleagues, in a random order) and the order on screen. Ordinary decisions draw
 * the order of their options.
 */
import { identity } from '../content'
import type { T } from '../content/types'
import { config } from '../engine/config'
import type { Rng } from '../engine/rng'
import {
  isPeople,
  type Beat,
  type OrdinaryBeat,
  type PeopleBeat,
  type Story,
  type Tier,
} from './content'

export type Sex = 'woman' | 'man'

export interface CastMember {
  slot: number
  sex: Sex
  religion: 'hindu' | 'muslim'
  name: string
  surname?: string
  caste?: string
  born?: { region: string; city: string }
  tone: 'darker' | 'lighter' | 'constant'
  toneEmoji: string
  /** A one-off character (an applicant, a complainant, a vendor): met once, never in the cast. */
  oneOff?: boolean
  species: string
  animal: string
  animalName: T
  mascot: string
  /** The slot of this colleague's rival (one of the other sex). */
  rival: number
}

export interface BeatChar {
  slot: number
  d: string
  tier: Tier
}

export interface PeoplePresented {
  kind: 'people'
  beat: PeopleBeat
  /** Display order, top to bottom. */
  chars: BeatChar[]
}

export interface OrdinaryPresented {
  kind: 'ordinary'
  beat: OrdinaryBeat
  order: string[]
}

export type Presented = PeoplePresented | OrdinaryPresented

export interface Season {
  story: Story
  cast: CastMember[]
  /** The one-off characters, at slots 100 and up (ONE_OFF + index). */
  extras: CastMember[]
  beats: Presented[]
}

export const ONE_OFF = 100

const firstNames = identity.firstNames as Record<'hindu' | 'muslim', Record<Sex, string[]>>

export function drawCast(rng: Rng): CastMember[] {
  const species = rng.shuffle(identity.species.list)
  const mascots = rng.shuffle(identity.neutralNames)
  const cast: CastMember[] = []
  const usedNames = new Set<string>()
  const tones = identity.tones as unknown as Record<string, string[]>
  for (const sex of ['woman', 'man'] as Sex[]) {
    const slots = rng.shuffle(['h-focal', 'h-comparison', 'm-focal', 'm-comparison'])
    const darkHindu = rng.next() < 0.5 ? 'h-focal' : 'h-comparison'
    const darkMuslim = rng.next() < 0.5 ? 'm-focal' : 'm-comparison'
    for (const role of slots) {
      const religion = role.startsWith('h') ? 'hindu' : 'muslim'
      const name = rng.pick(firstNames[religion][sex].filter((n) => !usedNames.has(n)))
      usedNames.add(name)
      const slot = cast.length
      const sp = species[slot]
      const tone = role === darkHindu || role === darkMuslim ? 'darker' : 'lighter'
      const m: CastMember = {
        slot,
        sex,
        religion,
        name,
        tone,
        toneEmoji: rng.pick(tones[tone]),
        species: sp.id,
        animal: sp.emoji,
        animalName: sp.name,
        mascot: mascots[slot],
        rival: -1,
      }
      cast.push(m)
    }
  }
  const women = cast.filter((c) => c.sex === 'woman')
  const men = rng.shuffle(cast.filter((c) => c.sex === 'man'))
  women.forEach((w, i) => {
    w.rival = men[i].slot
    men[i].rival = w.slot
  })
  return cast
}

/** A queue that hands out items in shuffled rounds, so each is used equally often. */
function rounds<X>(rng: Rng, items: X[]) {
  let q: X[] = []
  return () => {
    if (q.length === 0) q = rng.shuffle(items)
    return q.shift() as X
  }
}

export function drawSeason(rng: Rng, story: Story): Season {
  const cast = drawCast(rng)
  const pairs = cast.filter((c) => c.sex === 'woman').map((w) => [w.slot, w.rival] as const)
  const pairCombos: [number, number][] = []
  for (let i = 0; i < pairs.length; i++)
    for (let j = i + 1; j < pairs.length; j++) pairCombos.push([i, j])
  /* The mascot beats and the beats after the reveal balance separately: the reading uses only the latter. */
  const queues = [1, 2].map(() => ({
    met: [0, 0, 0, 0],
    pick: rounds(rng, [0, 1, 2, 3]),
    split: rounds(rng, [0, 1, 2, 3]),
  }))
  const bySex = (s: Sex) => cast.filter((c) => c.sex === s).map((c) => c.slot)
  /* One-off characters carry caste (a Hindu with a surname read as Scheduled Caste or upper
     caste) or birthplace (a Muslim born in the south or the north), never both, with the medium
     tone so skin tone does not vary; the fixed cast carries sex, religion and tone (PENDING v18). */
  const extras: CastMember[] = []
  const usedFirst = new Set(cast.map((c) => c.name))
  const surnames = identity.surnames.hindu as Record<string, string[]>
  const cities = identity.birthplace as unknown as Record<string, string[]>
  const oneOff = (cue: 'caste' | 'born', sex: Sex, focal: boolean): number => {
    const religion = cue === 'caste' ? 'hindu' : 'muslim'
    const pool = firstNames[religion][sex]
    const fresh = pool.filter((n) => !usedFirst.has(n))
    const name = rng.pick(
      fresh.length ? fresh : pool.filter((n) => !cast.some((c) => c.name === n)),
    )
    usedFirst.add(name)
    const m: CastMember = {
      slot: ONE_OFF + extras.length,
      sex,
      religion,
      name,
      tone: 'constant',
      toneEmoji: identity.tones.constant,
      species: '',
      animal: '',
      animalName: { en: '', hinglish: '' },
      mascot: '',
      rival: -1,
      oneOff: true,
    }
    if (cue === 'caste') {
      m.caste = focal ? identity.surnames.focal : identity.surnames.comparison
      m.surname = rng.pick(surnames[m.caste])
    } else {
      const region = focal ? identity.birthplace.focal : identity.birthplace.comparison
      m.born = { region, city: rng.pick(cities[region]) }
    }
    extras.push(m)
    return m.slot
  }
  const sexDraw = (): Sex => (rng.next() < 0.5 ? 'woman' : 'man')
  /* A tied pair of one-offs: the same sex, one focal and one comparison on the cue. */
  const oneOffPair = (cue: 'caste' | 'born') => {
    const sex = sexDraw()
    return rng.shuffle([oneOff(cue, sex, true), oneOff(cue, sex, false)])
  }
  const beats: Presented[] = (story.beats ?? []).map((beat: Beat) => {
    if (!isPeople(beat))
      return { kind: 'ordinary', beat, order: rng.shuffle(beat.options.map((o) => o.id)) }
    const q = queues[beat.mascot ? 0 : 1]
    const ds = beat.descriptions
    const byTier = (t: Tier) => rng.shuffle(ds.filter((d) => d.tier === t))
    const give = (slots: readonly number[], descs: typeof ds): BeatChar[] =>
      slots.map((slot, i) => ({ slot, d: descs[i].id, tier: descs[i].tier }))
    let chars: BeatChar[]
    if (beat.shape === 'oneoff') {
      if (beat.kind === 'rank') {
        const [top, low] = rng.shuffle([oneOffPair('caste'), oneOffPair('born')])
        chars = [...give(top, byTier(3)), ...give(low, byTier(1))]
      } else if (beat.kind === 'pick') chars = give(oneOffPair(beat.cue ?? 'caste'), byTier(2))
      else {
        const third = oneOff(rng.next() < 0.5 ? 'caste' : 'born', sexDraw(), rng.next() < 0.5)
        chars = [...give(oneOffPair(beat.cue ?? 'caste'), byTier(3)), ...give([third], byTier(1))]
      }
    } else if (beat.kind === 'rank' && beat.shape === 'mixed') {
      /* The two rival pairs that have met least so far (ties drawn), so every pair meets about
         equally often. */
      const best = Math.min(...pairCombos.map(([x, y]) => q.met[x] + q.met[y]))
      const combo = rng.pick(pairCombos.filter(([x, y]) => q.met[x] + q.met[y] === best))
      combo.forEach((x) => (q.met[x] += 1))
      const [a, b] = rng.shuffle(combo).map((i) => rng.shuffle(pairs[i]))
      chars = [...give(a, byTier(3)), ...give(b, byTier(1))]
    } else if (beat.kind === 'rank') {
      const [top, low] = rng.shuffle([
        rng.shuffle(bySex('woman')).slice(0, 2),
        rng.shuffle(bySex('man')).slice(0, 2),
      ])
      chars = [...give(top, byTier(3)), ...give(low, byTier(1))]
    } else if (beat.shape === 'rival') {
      const pair = rng.shuffle(pairs[beat.kind === 'pick' ? q.pick() : q.split()])
      chars = give(pair, byTier(beat.kind === 'pick' ? 2 : 3))
      if (beat.kind === 'split') {
        const third = rng.pick(cast.map((c) => c.slot).filter((s) => !pair.includes(s)))
        chars.push(...give([third], byTier(1)))
      }
    } else if (beat.shape === 'same') {
      const two = rng.shuffle(bySex(rng.next() < 0.5 ? 'woman' : 'man')).slice(0, 2)
      chars = give(two, byTier(2))
    } else {
      const two = rng.shuffle(cast.map((c) => c.slot)).slice(0, 2)
      chars = give(two, rng.shuffle(ds))
    }
    return { kind: 'people', beat, chars: rng.shuffle(chars) }
  })
  return { story, cast, extras, beats }
}

export const castSize = () => config.season.castSize
