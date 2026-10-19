/**
 * The season runner: walks one season story from its opening to its last screen and keeps
 * every answer until submit. Nothing reaches the server before submit; in a browser the
 * in-progress state is kept on this device (src/screens/Play.tsx) so a reload resumes the
 * same screen, answers and draw. Back reopens the last decision with its saved answer; the
 * final answer is the one stored, and each re-answer is counted. The screens and the checks'
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
  | { kind: 'beat'; i: number }
  | { kind: 'reveal' }
  | { kind: 'season' }
  | { kind: 'payoff'; n: number }
  | { kind: 'saved'; n: number }
  | { kind: 'screening' }
  | { kind: 'fsurvey'; admin: 1 | 2 }
  | { kind: 'note' }
  | { kind: 'recall' }
  | { kind: 'probe' }
  | { kind: 'wrap' }
  | { kind: 'demographics' }
  | { kind: 'close' }

/** rank: order of positions (indices into the beat's chars), first choice first; pick: one index; split: units per char; ordinary: option id. */
export type BeatAnswer =
  { order: number[] } | { pick: number } | { units: number[] } | { option: string }

export interface RecordEntry {
  episode: number
  role: T
  tier: number
}

/** Everything a reload needs besides the story and the seed (which redraw the season). */
export interface RunnerState {
  index: number
  answers: [number, BeatAnswer][]
  edits: [number, number][]
  survey: Record<1 | 2, Record<string, number>>
  screening: Record<string, number>
  recall: string | null
  probe: string[]
  prior: Record<string, string>
  demographics: Record<string, string>
  code: string | null
  sittings?: number
}

export const IN_STORY: StoryStep['kind'][] = ['intro', 'beat', 'reveal', 'season', 'payoff']

/** The wrap's single-choice items: prior knowledge, origin and replay (candidates v17 3.5), on one screen with one Done (EVAL-8). */
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
  /** Each step's chapter, 1 to `chapters`, and `chapters + 1` for the finale. */
  readonly chapterOf: number[]
  readonly chapters: number
  /** How many sittings the season took (1 to 6; a count only, no times; PENDING v21). */
  sittings = 1
  demographics: Record<string, string> = {}
  code: string | null = null
  keys: CodeKeys | null = null
  /** Called after every change, so the screen can keep the state for a reload. */
  private onChange: (() => void) | null = null
  setOnChange(f: (() => void) | null) {
    this.onChange = f
  }

  constructor(rng: Rng, story: Story, langs: Lang[]) {
    this.langs = langs
    this.lang = langs[0]
    this.season = drawSeason(rng, story)
    this.note = rng.weighted(config.deployments['panel-g1'].notes.low ?? { b: 1 })
    this.recallOrder = [
      ...rng.shuffle(recallOptions(this.note).filter((o) => o.id !== 'none')).map((o) => o.id),
      'none',
    ]
    /* Five story chapters and a finale (EVAL-8, concept C; PENDING v21). Each chapter is one
       episode's form-A cards, its opening folded into the first card's caption (concept A), and
       ends on a payoff strip and a save screen. The finale holds the faking test (screening, the
       first survey, the note, form B, the second survey, recall), the wrap and the rating. */
    const beats = this.season.beats
    const chapters = story.episodes?.length ?? 1
    const steps: StoryStep[] = [{ kind: 'intro' }]
    const chapterOf: number[] = [1]
    const push = (st: StoryStep, n: number) => {
      steps.push(st)
      chapterOf.push(n)
    }
    for (let n = 1; n <= chapters; n++) {
      beats.forEach((b, i) => {
        if (b.beat.episode !== n || (b.kind === 'people' && b.beat.form === 'B')) return
        const prev = beats[i - 1]?.beat
        if (prev?.mascot && !b.beat.mascot) push({ kind: 'reveal' }, n)
        push({ kind: 'beat', i }, n)
      })
      if (n === chapters) push({ kind: 'season' }, n)
      if (story.episodes?.[n - 1]?.payoff?.length) push({ kind: 'payoff', n }, n)
      push({ kind: 'saved', n }, n)
    }
    const fin = chapters + 1
    push({ kind: 'screening' }, fin)
    push({ kind: 'fsurvey', admin: 1 }, fin)
    push({ kind: 'note' }, fin)
    beats.forEach((b, i) => {
      if (b.kind === 'people' && b.beat.form === 'B') push({ kind: 'beat', i }, fin)
    })
    push({ kind: 'fsurvey', admin: 2 }, fin)
    push({ kind: 'recall' }, fin)
    push({ kind: 'probe' }, fin)
    push({ kind: 'wrap' }, fin)
    push({ kind: 'demographics' }, fin)
    push({ kind: 'close' }, fin)
    this.chapterOf = chapterOf
    this.chapters = chapters
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
      cards.reduce(
        (s, b) => s + ((b.beat.kind === 'split' ? tm.pair : tm[b.beat.kind]) ?? tm.rank),
        0,
      ) +
      ordinary * tm.ordinary +
      grid * tm.gridItem +
      single * tm.single +
      tm.probe +
      tm.note +
      tm.overhead +
      /* Each chapter's end: the payoff strip and the save screen (EVAL-8). */
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
  /**
   * How many times each beat was answered again after Back (owner decision, 19 Oct 2026). The
   * final answer is the one scored, as before; the count is stored with the play as an 'edit'
   * item, so an edited decision can be told apart in the analysis.
   */
  readonly edits = new Map<number, number>()

  answer(value: unknown) {
    const s = this.current
    if (!s) return
    if (s.kind === 'beat') {
      if (this.answers.has(s.i)) this.edits.set(s.i, (this.edits.get(s.i) ?? 0) + 1)
      this.answers.set(s.i, value as BeatAnswer)
    }
    if (s.kind === 'fsurvey') this.survey[s.admin] = { ...(value as Record<string, number>) }
    if (s.kind === 'screening') this.screening = { ...(value as Record<string, number>) }
    if (s.kind === 'recall') this.recall = String(value)
    if (s.kind === 'probe') this.probe = [...(value as string[])]
    if (s.kind === 'wrap') this.prior = { ...(value as Record<string, string>) }
    if (s.kind === 'demographics') this.demographics = { ...(value as Record<string, string>) }
    this.index += 1
    this.onChange?.()
  }

  snapshot(): RunnerState {
    return structuredClone({
      index: this.index,
      answers: [...this.answers],
      edits: [...this.edits],
      survey: this.survey,
      screening: this.screening,
      recall: this.recall,
      probe: this.probe,
      prior: this.prior,
      demographics: this.demographics,
      code: this.code,
      sittings: this.sittings,
    })
  }

  /** Puts a snapshot back on a runner drawn from the same story and seed. */
  restore(st: RunnerState) {
    const s = structuredClone(st)
    this.index = Math.min(Math.max(0, s.index), this.steps.length - 1)
    this.answers = new Map(s.answers)
    this.edits.clear()
    for (const [i, n] of s.edits) this.edits.set(i, n)
    this.survey = s.survey
    this.screening = s.screening
    this.recall = s.recall
    this.probe = s.probe
    this.prior = s.prior
    this.demographics = s.demographics
    this.code = s.code
    this.sittings = s.sittings ?? 1
  }

  /** The chapter (or the finale, `chapters + 1`) a step belongs to. */
  chapterAt(index = this.index) {
    return this.chapterOf[index] ?? this.chapters + 1
  }

  /** The card steps of chapter n (for the map's dots): how many there are and how many are done. */
  chapterCards(n = this.chapterAt()) {
    const idx = this.steps.flatMap((st, k) =>
      st.kind === 'beat' && this.chapterOf[k] === n ? [k] : [],
    )
    return { total: idx.length, done: idx.filter((k) => k < this.index).length }
  }

  /** A new sitting: the season was reopened from this device at a save point (PENDING v21). */
  newSitting() {
    this.sittings = Math.min(this.sittings + 1, config.season.chapters.sittingsMax)
  }

  /** The beat step before the current one inside the story, which Back reopens; null where Back is not offered. */
  get backTarget(): number | null {
    const s = this.current
    if (!s || !IN_STORY.includes(s.kind)) return null
    /* Back stays inside the story run it is in: it never crosses a save screen, the note or any
       other out-of-fiction step (EVAL-8). */
    for (let i = this.index - 1; i >= 0; i--) {
      const k = this.steps[i].kind
      if (k === 'beat') return i
      if (!IN_STORY.includes(k)) return null
    }
    return null
  }

  /** Back reopens the last decision with its saved answer on screen, to edit or confirm again. */
  back() {
    const to = this.backTarget
    if (to === null) return
    this.index = to
    this.onChange?.()
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

  /**
   * The consequence of beat i's answer, as the next screen tells it, a line restating the
   * answer, and who led it (their slot, and whether they were shown as a person), for the face
   * in the consequence panel.
   */
  consequence(
    i: number,
  ): { text: string; summary: string; lead?: { slot: number; revealed: boolean } } | null {
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
    return {
      text,
      summary,
      ...(lead === 'even' ? {} : { lead: { slot: b.chars[lead].slot, revealed: shown } }),
    }
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
    this.code ??= newCode()
    this.onChange?.()
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
      sit: this.sittings,
    }
    const cards: Record<string, CardRecord> = {}
    const items: Record<string, ItemRecord> = {}
    this.season.beats.forEach((b, i) => {
      const a = this.answers.get(i)
      if (!a) return
      if (b.kind === 'people') cards[randomKey()] = this.cardRecord(b, i, a)
      else if ('option' in a) items[randomKey()] = { k: 'ord', i: b.beat.id, v: a.option }
      const e = this.edits.get(i)
      if (e) items[randomKey()] = { k: 'edit', i: b.beat.id, v: String(e) }
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
