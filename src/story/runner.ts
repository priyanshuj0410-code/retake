/**
 * The season runner: walks one season story from its opening to its last screen and keeps
 * every answer in memory until submit, as the card games' runner does. Every decision commits
 * as soon as it is made (no Next); Back reopens the last decision and clears its answer, so
 * the stored record holds only each decision's final answer. The screens and the checks'
 * seeded players drive the same runner.
 */
import { identity } from '../content'
import type { Lang, T } from '../content/types'
import { config, type NoteId } from '../engine/config'
import { recallOptions } from '../engine/session'
import { deriveKeys, newCode, type CodeKeys } from '../engine/codes'
import type { CardRecord, CharRecord, ItemRecord, PlayMeta, Submission } from '../engine/records'
import { randomKey, type Rng } from '../engine/rng'
import { fill } from '../engine/text'
import { SS, isPeople, type PeopleBeat, type Story } from './content'
import {
  ONE_OFF,
  drawSeason,
  type CastMember,
  type OrdinaryPresented,
  type PeoplePresented,
  type Season,
} from './session'

export type StoryStep =
  | { kind: 'intro' }
  | { kind: 'episode'; n: number }
  | { kind: 'beat'; i: number }
  | { kind: 'reveal' }
  | { kind: 'interlude'; n: number }
  | { kind: 'season' }
  | { kind: 'screening' }
  | { kind: 'fsurvey'; admin: 1 | 2 }
  | { kind: 'note' }
  | { kind: 'recall' }
  | { kind: 'probe' }
  | { kind: 'prior'; id: string }
  | { kind: 'debrief' }
  | { kind: 'code' }
  | { kind: 'demographics' }
  | { kind: 'submit' }

/** rank: order of positions (indices into the beat's chars), first choice first; pick: one index; split: units per char; ordinary: option id. */
export type BeatAnswer =
  { order: number[] } | { pick: number } | { units: number[] } | { option: string }

export interface RecordEntry {
  episode: number
  role: T
  tier: number
}

export const IN_STORY: StoryStep['kind'][] = [
  'intro',
  'episode',
  'beat',
  'reveal',
  'interlude',
  'season',
]

/** The wrap's single-choice items: prior knowledge, origin and replay (candidates v17 3.5). */
const faking = config.season.faking

export const WRAP_ITEMS = ['told', 'origin', 'replay'] as const

export class StoryRunner {
  readonly dep = 'season' as const
  readonly season: Season
  readonly steps: StoryStep[]
  readonly lang: Lang
  readonly langs: Lang[]
  index = 0
  answers = new Map<number, BeatAnswer>()
  /** The faking test's survey, per administration (the same four items twice). */
  survey: Record<1 | 2, Record<string, number>> = { 1: {}, 2: {} }
  screening: Record<string, number> = {}
  recall: string | null = null
  probe: string[] = []
  prior: Record<string, string> = {}
  /** Game 1's low branch, the demo route: the note drawn 1:1 at entry (b honest retake, c faking). */
  readonly note: NoteId
  readonly recallOrder: string[]
  demographics: Record<string, string> = {}
  code: string | null = null
  keys: CodeKeys | null = null

  constructor(rng: Rng, story: Story, langs: Lang[]) {
    this.langs = langs
    this.lang = langs[0]
    this.season = drawSeason(rng, story)
    this.note = rng.weighted(config.deployments['panel-g1'].notes.low ?? { b: 1 })
    this.recallOrder = [
      ...rng.shuffle(recallOptions(this.note).filter((o) => o.id !== 'none')).map((o) => o.id),
      'none',
    ]
    const beats = this.season.beats
    const firstB = beats.findIndex((b) => b.kind === 'people' && b.beat.form === 'B')
    const lastB = beats.map((b) => b.kind === 'people' && b.beat.form === 'B').lastIndexOf(true)
    const interludes = new Map(
      (story.episodes ?? []).flatMap((e, n) => (e.interlude ? [[e.interlude.after, n + 1]] : [])),
    )
    const steps: StoryStep[] = [{ kind: 'intro' }]
    beats.forEach((b, i) => {
      const prev = beats[i - 1]?.beat
      if (prev?.mascot && !b.beat.mascot) steps.push({ kind: 'reveal' })
      if (prev?.episode !== b.beat.episode) steps.push({ kind: 'episode', n: b.beat.episode })
      /* Game 1's low branch: after the last form-A card, the screening block, the first survey
         administration and the note; then form B; then the second administration and recall. */
      if (i === firstB)
        steps.push({ kind: 'screening' }, { kind: 'fsurvey', admin: 1 }, { kind: 'note' })
      steps.push({ kind: 'beat', i })
      const n = interludes.get(b.beat.id)
      if (n) steps.push({ kind: 'interlude', n })
      if (i === lastB) steps.push({ kind: 'fsurvey', admin: 2 }, { kind: 'recall' })
    })
    steps.push({ kind: 'probe' }, { kind: 'season' })
    for (const id of WRAP_ITEMS) steps.push({ kind: 'prior', id })
    steps.push({ kind: 'demographics' }, { kind: 'debrief' }, { kind: 'code' }, { kind: 'submit' })
    this.steps = steps
  }

  /** Every counted decision (the owner's 80): week one's mascot cards, the screening block, the faking test (survey, form B, survey, recall) and the rating cards. */
  get counted(): number {
    const people = this.season.beats.filter((b) => b.kind === 'people').length
    return people + faking.screening.length + 2 * faking.survey.length + 1
  }

  /** Every decision asked: the counted ones, the two eligibility items, the ordinary decisions and the wrap's four. */
  get asked(): number {
    return (
      this.counted +
      2 +
      this.season.beats.filter((b) => b.kind === 'ordinary').length +
      1 +
      WRAP_ITEMS.length
    )
  }

  /**
   * The session's length at the planning paces (config.season.timing, the 80-decision
   * scenario's per-type paces, PENDING v18): every card, grid item, single choice, the probe,
   * the note, the ordinary decisions, the fixed overhead and this build's own screens.
   */
  estimateSeconds(): number {
    const tm = config.season.timing
    const beats = this.season.beats
    const cards = beats.filter((b) => b.kind === 'people')
    const ordinary = beats.length - cards.length
    const grid = faking.screening.length + 2 * faking.survey.length
    const single = 2 + 1 + WRAP_ITEMS.length
    const story = this.season.story
    return (
      cards.reduce((s, b) => s + (tm[b.beat.kind] ?? tm.rank), 0) +
      ordinary * tm.ordinary +
      grid * tm.gridItem +
      single * tm.single +
      tm.probe +
      tm.note +
      tm.overhead +
      (story.episodes?.length ?? 0) * (tm.episode + tm.interlude) +
      tm.intro +
      tm.season +
      tm.debrief +
      tm.code +
      tm.demographics +
      tm.submit
    )
  }

  /** The rating cards: after the reveal, before the note. */
  isRating(i: number) {
    const b = this.season.beats[i]
    return b.kind === 'people' && !b.beat.mascot && b.beat.form !== 'B'
  }

  /** A character by slot: a cast member, or a one-off (slots from ONE_OFF). */
  person(slot: number): CastMember {
    return slot >= ONE_OFF ? this.season.extras[slot - ONE_OFF] : this.season.cast[slot]
  }

  get current(): StoryStep | undefined {
    return this.steps[this.index]
  }

  get cast(): CastMember[] {
    return this.season.cast
  }

  /** The number of decisions in the story (people and ordinary beats). */
  get decisions() {
    return this.season.beats.length
  }

  /** Records the answer to the current step and moves on. */
  answer(value: unknown) {
    const s = this.current
    if (!s) return
    if (s.kind === 'beat') this.answers.set(s.i, value as BeatAnswer)
    if (s.kind === 'fsurvey') this.survey[s.admin] = { ...(value as Record<string, number>) }
    if (s.kind === 'screening') this.screening = { ...(value as Record<string, number>) }
    if (s.kind === 'recall') this.recall = String(value)
    if (s.kind === 'probe') this.probe = [...(value as string[])]
    if (s.kind === 'prior') this.prior[s.id] = String(value)
    if (s.kind === 'demographics') this.demographics = { ...(value as Record<string, string>) }
    this.index += 1
  }

  /** The beat step before the current one inside the story, which Back reopens; null where Back is not offered. */
  get backTarget(): number | null {
    const s = this.current
    if (!s || !IN_STORY.includes(s.kind)) return null
    for (let i = this.index - 1; i >= 0; i--) if (this.steps[i].kind === 'beat') return i
    return null
  }

  back() {
    const to = this.backTarget
    if (to === null) return
    const st = this.steps[to]
    if (st.kind === 'beat') this.answers.delete(st.i)
    this.index = to
  }

  /** Whether cues are on screen: after the reveal. */
  revealed(i: number) {
    return !this.season.beats[i].beat.mascot
  }

  displayName(slot: number, revealed: boolean) {
    const c = this.person(slot)
    if (!revealed) return c.mascot
    return c.surname ? `${c.name} ${c.surname}` : c.name
  }

  /** The colleague an answer puts in the lead, by position in the beat's chars, or "even" for an even split. */
  lead(p: PeoplePresented, a: BeatAnswer): number | 'even' {
    if ('order' in a) return a.order[0]
    if ('pick' in a) return a.pick
    if ('units' in a) {
      const max = Math.max(...a.units)
      if (a.units.every((u) => u === max)) return 'even'
      /* Ties among the largest shares go to the stronger notes, then the description id: merit
         content only, never who carries it. */
      return a.units
        .map((u, i) => ({ u, i, t: p.chars[i].tier, d: p.chars[i].d }))
        .filter((x) => x.u === max)
        .sort((x, y) => y.t - x.t || x.d.localeCompare(y.d))[0].i
    }
    return 0
  }

  /** The consequence of beat i's answer, as the next screen tells it, and a line restating the answer. */
  consequence(i: number): { text: string; summary: string } | null {
    const b = this.season.beats[i]
    const a = this.answers.get(i)
    if (!a) return null
    const L = (t: T) => t[this.lang]
    if (b.kind === 'ordinary') {
      const o = b.beat.options.find((x) => 'option' in a && x.id === a.option)
      if (!o) return null
      return { text: L(o.after), summary: fill(L(SS.yourOption), { text: L(o.text) }) }
    }
    const shown = this.revealed(i)
    const name = (pos: number) => this.displayName(b.chars[pos].slot, shown)
    const lead = this.lead(b, a)
    const key = lead === 'even' ? 'even' : String(b.chars[lead].tier)
    const sex = lead === 'even' || !shown ? undefined : this.person(b.chars[lead].slot).sex
    const text = fill(L(b.beat.after[key]), { name: lead === 'even' ? '' : name(lead) }, sex)
    let summary = ''
    if ('order' in a)
      summary = fill(L(SS.yourOrder), {
        list: a.order.map((pos, r) => `${r + 1} ${name(pos)}`).join(', '),
      })
    else if ('pick' in a) summary = fill(L(SS.yourPick), { name: name(a.pick) })
    else if ('units' in a)
      summary = fill(L(SS.yourSplit), {
        list: b.chars.map((_, pos) => `${name(pos)} ${a.units[pos]}`).join(', '),
      })
    return { text, summary }
  }

  /** Each colleague's track record: the jobs they led, with how each went (by the notes they carried). */
  records(): Map<number, RecordEntry[]> {
    const out = new Map<number, RecordEntry[]>(this.cast.map((c) => [c.slot, []]))
    this.season.beats.forEach((b, i) => {
      const a = this.answers.get(i)
      if (!a || b.kind !== 'people') return
      const lead = this.lead(b, a)
      if (lead === 'even') return
      out
        .get(b.chars[lead].slot)
        ?.push({ episode: b.beat.episode, role: b.beat.role, tier: b.chars[lead].tier })
    })
    return out
  }

  get points() {
    let p = 0
    this.season.beats.forEach((b, i) => {
      const a = this.answers.get(i)
      if (b.kind === 'ordinary' && a && 'option' in a)
        p += b.beat.options.find((o) => o.id === a.option)?.effect ?? 0
    })
    return p
  }

  seasonBand() {
    return SS.bands.filter((b) => this.points >= b.min).pop() ?? SS.bands[0]
  }

  async prepareCode(iterations?: number) {
    if (this.keys) return
    this.code = newCode()
    this.keys = await deriveKeys(this.code, iterations)
  }

  /** Each colleague's score on a people beat, in [0, 1]: rank (k - 1 - rank) / (k - 1); pick 1 or 0; split the share (for npt, the share of the unwanted work). */
  static scores(p: PeoplePresented, a: BeatAnswer): number[] {
    const k = p.chars.length
    if ('order' in a) {
      const s = Array<number>(k).fill(0)
      a.order.forEach((pos, r) => (s[pos] = (k - 1 - r) / (k - 1)))
      return s
    }
    if ('pick' in a) return p.chars.map((_, pos) => (pos === a.pick ? 1 : 0))
    if ('units' in a) {
      const total = a.units.reduce((x, y) => x + y, 0) || 1
      return a.units.map((u) => u / total)
    }
    return p.chars.map(() => 0)
  }

  private cardRecord(p: PeoplePresented, i: number, a: BeatAnswer): CardRecord {
    const s = StoryRunner.scores(p, a)
    const beat: PeopleBeat = p.beat
    return {
      card: beat.id,
      form: beat.form ?? 'A',
      fam: beat.family,
      str: `${beat.kind}-${beat.shape}`,
      pres: this.revealed(i) ? 'human' : 'animal',
      lang: this.lang,
      base: !this.revealed(i),
      arm: 'FULL',
      filler: false,
      rm: false,
      n: i,
      chars: p.chars.map((ch, pos) => {
        const c = this.person(ch.slot)
        const r: CharRecord = {
          d: ch.d,
          sex: c.sex,
          nm: c.name,
          rel: c.religion,
          st: pos,
          s: Math.round(s[pos] * 1e4) / 1e4,
        }
        if (c.surname) r.sn = c.surname
        if (c.caste) r.caste = c.caste
        if (c.born) {
          r.city = c.born.city
          r.born = c.born.region
        }
        r.tone = c.tone
        return r
      }),
    }
  }

  submission(): Submission {
    if (!this.keys) throw new Error('no code yet')
    const meta: PlayMeta = {
      dep: 'season',
      v: config.version,
      langs: this.langs.length > 1 ? 'both' : (this.lang as 'en' | 'hinglish'),
      arm: 'FULL',
      route: 'standard',
      result: this.points,
      /* The demo route is Game 1's low branch (config.season.route, PENDING v18). */
      split: 'low',
      note: this.note,
    }
    const cards: Record<string, CardRecord> = {}
    const items: Record<string, ItemRecord> = {}
    this.season.beats.forEach((b, i) => {
      const a = this.answers.get(i)
      if (!a) return
      if (b.kind === 'people') cards[randomKey()] = this.cardRecord(b, i, a)
      else if ('option' in a) items[randomKey()] = { k: 'ord', i: b.beat.id, v: a.option }
    })
    for (const admin of [1, 2] as const)
      for (const [id, v] of Object.entries(this.survey[admin]))
        items[randomKey()] = { k: 'survey', i: id, v, a: admin }
    for (const [id, v] of Object.entries(this.screening))
      items[randomKey()] = { k: 'screen', i: id, v: String(v) }
    if (this.recall)
      items[randomKey()] = {
        k: 'recall',
        i: 'recall',
        v: this.recall,
        x: this.recallOrder.join(','),
      }
    if (this.probe.length)
      items[randomKey()] = { k: 'probe', i: 'probe', v: this.probe.slice().sort().join(',') }
    for (const [id, v] of Object.entries(this.prior)) items[randomKey()] = { k: 'prior', i: id, v }
    const demoKeys = shuffled(this.keys.demo)
    const demographics = Object.entries(this.demographics)
      .filter(([, v]) => v !== '')
      .map(([i, a], idx) => ({ key: demoKeys[idx], value: { dep: 'season' as const, i, a } }))
    return {
      codeKey: this.keys.code,
      dep: 'season',
      play: { key: this.keys.play, value: { meta, cards, items } },
      crosswise: [],
      demographics,
    }
  }
}

/** A random order of the keys, so the key index carries no order (as in src/engine/records.ts). */
function shuffled(keys: string[]): string[] {
  const out = keys.slice()
  const buf = new Uint32Array(out.length)
  crypto.getRandomValues(buf)
  for (let i = out.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const peopleBeats = (r: StoryRunner) =>
  r.season.beats
    .map((b, i) => ({ b, i }))
    .filter((x): x is { b: PeoplePresented; i: number } => x.b.kind === 'people')

export const ordinaryBeats = (r: StoryRunner) =>
  r.season.beats.filter((b): b is OrdinaryPresented => b.kind === 'ordinary')

export const animalWord = (c: CastMember, lang: Lang) => c.animalName[lang]
export const toneWords = { darker: 'darker skin tone', lighter: 'lighter skin tone' }
export const figureOf = (c: CastMember) =>
  (c.sex === 'woman' ? identity.figures.woman : identity.figures.man) + c.toneEmoji
export { isPeople }
