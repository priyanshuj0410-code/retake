/**
 * Which people cards a player plays, and how each is presented: the restricted
 * randomisation of research plan v1, 4.1, drawn per card and per player.
 *
 * - Each family on each form plays its configured cue-carrying count, plus one all-baseline
 *   presentation at a card drawn at random. On opportunity cards the counts hold per role
 *   sub-stratum (type x band): the bank keeps one spare card per sub-stratum, and the
 *   baseline's sub-stratum, drawn at random, plays its spare too.
 * - Every cue-carrying card carries two woman-cued and two man-cued characters (one of the
 *   six labellings, drawn). Every other ground's labels are drawn the same way, independently
 *   of sex and of each other.
 * - Presentation (human or animal) is balanced within person: one of each per opportunity
 *   sub-stratum where the count allows, half and half otherwise. One species per card.
 * - Opportunity coverage: the tone pair on every human card; on human cards, the caste pair
 *   (surname) on one per band and the birthplace pair on the other, never both on one
 *   character; the religion pair on one surname-free card per sub-stratum.
 * - Language for bilinguals is balanced within family and form.
 * - The starting order is a fresh random permutation per card, independent of all of the above.
 * - R1's partial arms present every non-filler form A card with identical descriptions:
 *   PARTIAL-G varies only sex, PARTIAL-A varies only the badge.
 */
import { cards, identity } from '../content'
import type {
  Band,
  ConductStratum,
  Family,
  Form,
  Lang,
  OppType,
  PeopleCard,
} from '../content/types'
import type { FormCounts, R1Arm } from './config'
import { config } from './config'
import type { Rng } from './rng'

export type Sex = 'woman' | 'man' | 'neutral'
export type Religion = 'hindu' | 'muslim' | 'none'

export interface Character {
  /** The description this character carries (its id). */
  d: string
  sex: Sex
  name: string
  religion: Religion
  surname?: string
  caste?: string
  tone?: 'darker' | 'lighter' | 'constant'
  toneEmoji?: string
  born?: { region: string; city: string }
  badge?: 'green' | 'blue'
}

export interface Presented {
  card: PeopleCard
  form: Form
  family: Family
  /** "ranking/male-typed", "accused-woman", "npt". */
  stratum: string
  presentation: 'human' | 'animal'
  species?: string
  speciesEmoji?: string
  baseline: boolean
  lang: Lang
  arm: R1Arm
  filler: boolean
  rematch: boolean
  grounds: { religion: boolean; tone: boolean; caste: boolean; birthplace: boolean; badge: boolean }
  chars: Character[]
  /** start[p] is the index in chars of the character shown at position p before any move. */
  start: number[]
}

export const BANDS: Band[] = ['male-typed', 'integrated', 'female-typed']
export const TYPES: OppType[] = ['ranking', 'allocation']
export const STRATA: ConductStratum[] = ['accused-man', 'accused-woman']

const firstNames = identity.firstNames as Record<
  'hindu' | 'muslim',
  Record<'woman' | 'man', string[]>
>

interface Slot {
  card: PeopleCard
  baseline: boolean
}

/** Picks `n` cue-carrying cards, plus one baseline when `withBaseline`, from a pool. Fillers are always played and never the baseline. */
function pickFromPool(
  rng: Rng,
  pool: PeopleCard[],
  n: number,
  withBaseline: boolean,
  fillers: Set<string>,
): Slot[] {
  const need = n + (withBaseline ? 1 : 0)
  if (pool.length < need)
    throw new Error(
      `card bank too small: need ${need}, have ${pool.length} (${pool.map((c) => c.id).join(', ')})`,
    )
  const fixed = pool.filter((c) => fillers.has(c.id))
  const rest = rng.shuffle(pool.filter((c) => !fillers.has(c.id)))
  const chosen = [...fixed, ...rest].slice(0, need)
  const slots = chosen.map((card) => ({ card, baseline: false }))
  if (withBaseline) {
    const eligible = slots.filter((s) => !fillers.has(s.card.id))
    rng.pick(eligible).baseline = true
  }
  return slots
}

export function bankFor(family: Family, form: Form | 'AB'): PeopleCard[] {
  return cards.filter((c) => c.family === family && (form === 'AB' || c.form === form))
}

export function selectCards(
  rng: Rng,
  counts: FormCounts,
  bank: Form | 'AB',
  conductBank: Form | 'AB',
  fillers: Set<string>,
): Slot[] {
  const out: Slot[] = []
  const baseline = config.baselinePerFamily > 0
  const nOpp = counts.opportunityPerSubstratum ?? 0
  if (nOpp > 0) {
    const subs = TYPES.flatMap((t) => BANDS.map((b) => [t, b] as const))
    const baseSub = rng.int(subs.length)
    subs.forEach(([t, b], i) => {
      const pool = bankFor('opportunity', bank).filter((c) => c.type === t && c.band === b)
      out.push(...pickFromPool(rng, pool, nOpp, baseline && i === baseSub, fillers))
    })
  }
  const nNpt = counts.npt ?? 0
  if (nNpt > 0) out.push(...pickFromPool(rng, bankFor('npt', 'A'), nNpt, baseline, fillers))
  const nCon = counts.conductPerStratum ?? 0
  if (nCon > 0) {
    const baseStratum = rng.int(STRATA.length)
    STRATA.forEach((s, i) => {
      const pool = bankFor('conduct', conductBank).filter((c) => c.stratum === s)
      out.push(...pickFromPool(rng, pool, nCon, baseline && i === baseStratum, fillers))
    })
  }
  return out
}

const stratumOf = (c: PeopleCard) =>
  c.family === 'opportunity'
    ? `${c.type}/${c.band}`
    : c.family === 'conduct'
      ? (c.stratum as string)
      : 'npt'

/** Two of four, drawn uniformly over the six labellings. */
const pairMask = (rng: Rng) => rng.choose(4, 2)

function namesFor(rng: Rng, sexes: Sex[], religions: Religion[]): string[] {
  const used = new Set<string>()
  return sexes.map((sex, i) => {
    const pool =
      sex === 'neutral'
        ? identity.neutralNames
        : firstNames[religions[i] === 'muslim' ? 'muslim' : 'hindu'][sex]
    const options = pool.filter((n) => !used.has(n))
    const name = rng.pick(options)
    used.add(name)
    return name
  })
}

/** Balanced assignment of a binary attribute over n items: floor(n/2) each, the odd one drawn. */
function balanced(rng: Rng, n: number): boolean[] {
  const half = Math.floor(n / 2)
  const xs = [...Array(n)].map((_, i) => i < half)
  if (n % 2 === 1) xs[n - 1] = rng.next() < 0.5
  return rng.shuffle(xs)
}

export interface PresentOptions {
  form: Form
  langs: Lang[]
  arm: R1Arm
  fillers: Set<string>
}

/** Presents every selected card of one form. */
export function present(rng: Rng, slots: Slot[], opts: PresentOptions): Presented[] {
  const species = identity.species.list
  const out: Presented[] = slots.map((s) => ({
    card: s.card,
    form: opts.form,
    family: s.card.family,
    stratum: stratumOf(s.card),
    presentation: 'animal',
    baseline: s.baseline,
    lang: opts.langs[0],
    arm: opts.fillers.has(s.card.id) ? 'FULL' : opts.arm,
    filler: opts.fillers.has(s.card.id),
    rematch: false,
    grounds: { religion: false, tone: false, caste: false, birthplace: false, badge: false },
    chars: [],
    start: [],
  }))
  const cue = out.filter((p) => !p.baseline)

  /* Presentation, balanced within person. */
  for (const fam of ['opportunity', 'npt', 'conduct'] as Family[]) {
    const famCards = cue.filter((p) => p.family === fam)
    if (fam === 'opportunity') {
      const byStratum = new Map<string, Presented[]>()
      for (const p of famCards) byStratum.set(p.stratum, [...(byStratum.get(p.stratum) ?? []), p])
      const odd: Presented[] = []
      for (const group of byStratum.values()) {
        const g = rng.shuffle(group)
        const half = Math.floor(g.length / 2)
        g.forEach((p, i) => {
          if (i < half) p.presentation = 'human'
          else if (i >= 2 * half) odd.push(p)
        })
      }
      balanced(rng, odd.length).forEach((h, i) => (odd[i].presentation = h ? 'human' : 'animal'))
    } else {
      balanced(rng, famCards.length).forEach(
        (h, i) => (famCards[i].presentation = h ? 'human' : 'animal'),
      )
    }
  }

  /* Language, balanced within family for bilinguals. */
  if (opts.langs.length > 1) {
    for (const fam of ['opportunity', 'npt', 'conduct'] as Family[]) {
      const famCards = out.filter((p) => p.family === fam)
      balanced(rng, famCards.length).forEach((en, i) => (famCards[i].lang = en ? 'en' : 'hinglish'))
    }
  }

  /* Coverage of the other grounds (opportunity, FULL presentation). */
  const full = (p: Presented) => p.arm === 'FULL'
  const oppHuman = cue.filter(
    (p) => p.family === 'opportunity' && p.presentation === 'human' && full(p),
  )
  for (const b of BANDS) {
    const inBand = rng.shuffle(oppHuman.filter((p) => p.card.band === b))
    inBand.forEach((p, i) => {
      if (i % 2 === 0) p.grounds.caste = true
      else p.grounds.birthplace = true
    })
  }
  const byStratum = new Map<string, Presented[]>()
  for (const p of cue.filter((p) => p.family === 'opportunity' && full(p)))
    byStratum.set(p.stratum, [...(byStratum.get(p.stratum) ?? []), p])
  for (const group of byStratum.values()) {
    const free = group.filter((p) => !p.grounds.caste)
    if (free.length > 0) rng.pick(free).grounds.religion = true
  }
  for (const fam of ['npt', 'conduct'] as Family[]) {
    const famCards = cue.filter((p) => p.family === fam && full(p))
    balanced(rng, famCards.length).forEach((r, i) => (famCards[i].grounds.religion = r))
  }
  for (const p of cue) {
    p.grounds.tone = p.presentation === 'human' && full(p)
    p.grounds.badge = full(p) || p.arm === 'PARTIAL-A'
  }

  /* The characters. */
  for (const p of out) {
    const descs = p.card.descriptions.map((d) => d.id)
    if (p.presentation === 'animal' || p.baseline) {
      const sp = rng.pick(species)
      p.species = sp.id
      p.speciesEmoji = sp.emoji
    }
    if (p.baseline) {
      p.chars = descs.map((d) => ({
        d,
        sex: 'neutral' as Sex,
        religion: 'none' as Religion,
        name: '',
      }))
      const names = namesFor(
        rng,
        ['neutral', 'neutral', 'neutral', 'neutral'],
        ['none', 'none', 'none', 'none'],
      )
      p.chars.forEach((c, i) => (c.name = names[i]))
    } else if (p.arm === 'PARTIAL-G' || p.arm === 'PARTIAL-A') {
      const same = rng.pick(descs)
      const sexes: Sex[] =
        p.arm === 'PARTIAL-G'
          ? pairMask(rng).map((w) => (w ? 'woman' : 'man'))
          : Array(4).fill(rng.next() < 0.5 ? 'woman' : 'man')
      const religions: Religion[] = Array(4).fill('hindu')
      const names = namesFor(rng, sexes, religions)
      const badges =
        p.arm === 'PARTIAL-A'
          ? pairMask(rng).map((g) => (g ? 'green' : 'blue'))
          : Array(4).fill('blue')
      p.chars = sexes.map((sex, i) => ({
        d: same,
        sex,
        name: names[i],
        religion: religions[i],
        tone: p.presentation === 'human' ? 'constant' : undefined,
        toneEmoji: p.presentation === 'human' ? identity.tones.constant : undefined,
        badge: badges[i] as 'green' | 'blue',
      }))
    } else {
      const sexes: Sex[] = pairMask(rng).map((w) => (w ? 'woman' : 'man'))
      const religions: Religion[] = p.grounds.religion
        ? pairMask(rng).map((m) => (m ? 'muslim' : 'hindu'))
        : Array(4).fill('hindu')
      const names = namesFor(rng, sexes, religions)
      const caste = p.grounds.caste ? pairMask(rng) : null
      const born = p.grounds.birthplace ? pairMask(rng) : null
      const tone = p.grounds.tone ? pairMask(rng) : null
      const badge = p.grounds.badge ? pairMask(rng) : null
      const usedSurnames = new Set<string>()
      const usedCities = new Set<string>()
      p.chars = descs.map((d, i) => {
        const c: Character = { d, sex: sexes[i], name: names[i], religion: religions[i] }
        if (caste) {
          const code = caste[i] ? identity.surnames.focal : identity.surnames.comparison
          const pool = (identity.surnames.hindu as Record<string, string[]>)[code].filter(
            (s) => !usedSurnames.has(s),
          )
          c.surname = rng.pick(pool)
          usedSurnames.add(c.surname)
          c.caste = code
        }
        if (born) {
          const region = born[i] ? identity.birthplace.focal : identity.birthplace.comparison
          const pool = (identity.birthplace as unknown as Record<string, string[]>)[region].filter(
            (s) => !usedCities.has(s),
          )
          const city = rng.pick(pool)
          usedCities.add(city)
          c.born = { region, city }
        }
        if (p.presentation === 'human') {
          const level = tone ? (tone[i] ? 'darker' : 'lighter') : 'constant'
          c.tone = level
          c.toneEmoji =
            level === 'constant'
              ? identity.tones.constant
              : rng.pick((identity.tones as unknown as Record<string, string[]>)[level])
        }
        if (badge) c.badge = badge[i] ? 'green' : 'blue'
        return c
      })
    }
    p.start = rng.shuffle([0, 1, 2, 3])
  }
  return out
}

/** The rematch: one cue-carrying form A card returns with the same characters and its starting order flipped. Scored by no claim. */
export function rematchOf(rng: Rng, formA: Presented[]): Presented | null {
  const eligible = formA.filter((p) => !p.baseline && !p.filler)
  if (eligible.length === 0) return null
  const src = rng.pick(eligible)
  return {
    ...src,
    rematch: true,
    chars: src.chars.map((c) => ({ ...c })),
    start: src.start.slice().reverse(),
  }
}

export const displayName = (c: Character) => (c.surname ? `${c.name} ${c.surname}` : c.name)
