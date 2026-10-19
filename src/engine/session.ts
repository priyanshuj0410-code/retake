/**
 * One session's script: the screens a player meets, in act order, with every draw made
 * by the tool. The order is the one act order of tool design v3 and candidates v12 3.0:
 * cards, then the Committee Inbox, then the direct items; the panel puts the screening
 * block (and in game 1 the honest first-half survey and the M1-H privacy block) after its
 * first cards, and the note and its rounds after the Inbox.
 *
 * Two phases. Phase one runs to the end of the screening block. The route and the note
 * depend on the screening split (the registered route rules), so phase two is built only
 * once the split is known; every random number it uses was drawn at the start.
 */
import {
  inboxBank,
  ordinaryBank,
  screeningItems,
  screens,
  surveyItems,
  directItems,
  xw,
} from '../content'
import type { CrosswiseItem, Lang, OrdinaryDecision, SurveyItem } from '../content/types'
import { config, type DeploymentId, type NoteId, type R1Arm } from './config'
import { present, rematchesOf, selectCards, type Presented } from './layout'
import type { Rng } from './rng'

export type Act =
  | 'firstWeek'
  | 'season'
  | 'screening'
  | 'survey'
  | 'offTheRecord'
  | 'inbox'
  | 'note'
  | 'after'
  | 'wrap'
  | 'direct'

export type XwPurpose = 'practice' | 'anchor' | 'zero' | 'control' | 'm1h' | 'm3' | 'rc' | 'neutral'

export type Step =
  | { kind: 'tutorial'; act: Act }
  | { kind: 'people'; act: Act; p: Presented; n: number }
  | { kind: 'ordinary'; act: Act; d: OrdinaryDecision }
  | {
      kind: 'intro'
      act: Act
      which:
        | 'screening'
        | 'survey'
        | 'direct'
        | 'otr'
        | 'inbox'
        | 'xw-direct'
        | 'xw-practice'
        | 'xw-items'
        | 'm1h-direct'
    }
  | { kind: 'screening'; act: Act; id: string }
  | { kind: 'survey'; act: Act; item: SurveyItem; admin: 1 | 2 | 'direct'; second: boolean }
  | { kind: 'xw-direct'; act: Act; item: CrosswiseItem }
  | { kind: 'xw'; act: Act; item: CrosswiseItem; purpose: XwPurpose; fictional: boolean }
  | { kind: 'm1h-direct'; act: Act; item: CrosswiseItem }
  | { kind: 'inbox'; act: Act; id: string; lang: Lang }
  | { kind: 'note'; act: Act; note: NoteId }
  | { kind: 'recall'; act: Act; order: string[] }
  | { kind: 'probe'; act: Act }
  | { kind: 'result'; act: Act }
  | { kind: 'prior'; act: Act; id: string }
  | { kind: 'debrief'; act: Act }
  | { kind: 'code'; act: Act }
  | { kind: 'demographics'; act: Act }
  | { kind: 'submit'; act: Act }

export type Split = 'low' | 'high'
export type Route = 'm1h' | 'high' | 'standard' | 'partial'

export interface Draws {
  arm: R1Arm
  /** Uniforms drawn at the start for the draws made after the split. */
  uRoute: number
  uNote: number
  uRc: number
  /** The crosswise subsample: whose statement B is the low (p 0.25) or high (p 0.75) one. */
  xwSub: 'low' | 'high'
}

export interface Session {
  dep: DeploymentId
  langs: Lang[]
  draws: Draws
  phase1: Step[]
  /** Card presentations of form B, drawn at the start so no draw follows an answer. */
  formB: Presented[]
  inbox: { id: string; lang: Lang }[]
  ordinaryQueue: OrdinaryDecision[]
  surveyOrder: { first: SurveyItem[]; second: SurveyItem[]; direct: SurveyItem[] }
}

const surveySequence = (rng: Rng, items: SurveyItem[]): { item: SurveyItem; second: boolean }[] => {
  for (;;) {
    const first = rng.shuffle(items).map((item) => ({ item, second: false }))
    const repeats = rng
      .shuffle(items.filter((i) => i.repeat))
      .map((item) => ({ item, second: true }))
    /* The repeats are asked apart: never straight after their first asking. */
    if (repeats.length === 0 || first[first.length - 1].item.id !== repeats[0].item.id)
      return [...first, ...repeats]
  }
}

/** Interleaves one ordinary decision after every `per` people cards. */
function interleave(people: Step[], queue: OrdinaryDecision[], act: Act): Step[] {
  const out: Step[] = []
  people.forEach((s, i) => {
    out.push(s)
    if ((i + 1) % config.ordinaryPerPeopleCards === 0 && queue.length > 0)
      out.push({ kind: 'ordinary', act, d: queue.shift() as OrdinaryDecision })
  })
  return out
}

export function createSession(rng: Rng, dep: DeploymentId, langs: Lang[]): Session {
  const d = config.deployments[dep]
  const arm: R1Arm = d.r1 ? rng.weighted(d.r1) : 'FULL'
  const draws: Draws = {
    arm,
    uRoute: rng.next(),
    uNote: rng.next(),
    uRc: rng.next(),
    xwSub: rng.next() < config.crosswise.lowSubsampleShare ? 'low' : 'high',
  }
  const fillers = new Set(arm === 'FULL' ? [] : (d.r1Fillers ?? []))
  const conductBank = d.conductBank ?? 'A'

  const slotsA = selectCards(rng, d.formA, 'A', conductBank, fillers)
  let formA = rng.shuffle(present(rng, slotsA, { form: 'A', langs, arm, fillers }))
  /* Rematches: cue-carrying form A cards that return late in form A with the same characters
     and their starting order flipped, never next to their first showing. They are S5's
     consistency guard (plan v2: none in the panel games; two conduct cards in the firm). */
  const nRematch = d.formA.rematch ?? 0
  if (nRematch > 0) {
    const early = formA.slice(0, Math.max(1, formA.length - 3))
    for (const rm of rematchesOf(rng, early, nRematch, d.rematchFamily)) {
      const at = formA.findIndex((p) => p.card.id === rm.card.id && !p.rematch)
      const lo = Math.max(at + 2, Math.floor(formA.length * 0.6))
      const pos = Math.min(formA.length, lo + rng.int(Math.max(1, formA.length - lo + 1)))
      formA = [...formA.slice(0, pos), rm, ...formA.slice(pos)]
    }
  }
  const usedB = new Set(formA.map((p) => p.card.id))
  const bankB = d.formBBank ?? 'B'
  const slotsB = selectCards(rng, d.formB, bankB, 'B', new Set()).filter(
    (s) => !usedB.has(s.card.id),
  )
  const formB = rng.shuffle(
    present(rng, slotsB, { form: 'B', langs, arm: 'FULL', fillers: new Set() }),
  )

  const tutorialDecisions = ordinaryBank.filter((o) => o.tutorial).slice(0, config.tutorialOrdinary)
  const ordinaryQueue = ordinaryBank.filter((o) => !o.tutorial)

  const inboxN = Math.min(d.inbox, inboxBank.length)
  const harassment = rng
    .shuffle(inboxBank.filter((i) => i.kind === 'harassment'))
    .slice(0, Math.ceil(inboxN / 2))
  const nearMiss = rng
    .shuffle(inboxBank.filter((i) => i.kind === 'near-miss'))
    .slice(0, Math.floor(inboxN / 2))
  const chosen = rng.shuffle([...harassment, ...nearMiss])
  const inboxLangs =
    langs.length > 1
      ? rng.shuffle(chosen.map((_, i) => (i % 2 === 0 ? 'en' : 'hinglish') as Lang))
      : chosen.map(() => langs[0])
  const inbox = chosen.map((c, i) => ({ id: c.id, lang: inboxLangs[i] }))

  const surveyOrder = {
    first: surveySequence(rng, surveyItems).map((s) => s.item),
    second: surveySequence(rng, surveyItems).map((s) => s.item),
    direct: surveySequence(rng, directItems).map((s) => s.item),
  }

  const phase1: Step[] = [{ kind: 'tutorial', act: 'firstWeek' }]
  for (const t of tutorialDecisions) phase1.push({ kind: 'ordinary', act: 'firstWeek', d: t })
  const peopleA: Step[] = formA.map((p, i) => ({
    kind: 'people',
    act: i < 4 ? 'firstWeek' : 'season',
    p,
    n: i,
  }))
  phase1.push(...interleave(peopleA, ordinaryQueue, 'season'))
  if (d.screening && arm === 'FULL') {
    phase1.push({ kind: 'intro', act: 'screening', which: 'screening' })
    for (const s of screeningItems) phase1.push({ kind: 'screening', act: 'screening', id: s.id })
  }
  return { dep, langs, draws, phase1, formB, inbox, ordinaryQueue, surveyOrder }
}

/** The screening block's fairness score, 0 to 1 (1 fair on every item). */
export function screeningScore(answers: Record<string, string>): number {
  const scores: number[] = []
  for (const item of screeningItems) {
    const a = answers[item.id]
    if (a === undefined) continue
    if (item.format === 'direct') {
      const v = Number(a) / (config.survey.scalePoints - 1)
      scores.push(item.keying === 'agree-fair' ? v : 1 - v)
    } else {
      scores.push(item.options?.find((o) => o.id === a)?.fairness ?? 0.5)
    }
  }
  return scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : 0.5
}

export function splitOf(score: number): Split {
  return score < config.split.lowBelow ? 'low' : 'high'
}

/**
 * The registered route and note rules (plan v2 1.1), applied with the uniforms drawn at entry.
 * Game 1: R1's partial arms go to the wrap; high scorers to Off the Record, a random share of
 * them on M1-H's statement route; low scorers to the note (faking or honest retake) and the
 * second half. Game 2 and the firm have one route; game 2's note is drawn 1:1, unstratified.
 */
export function routeAndNote(
  s: Session,
  split: Split | null,
): { route: Route; note: NoteId | null; rc: boolean } {
  const d = config.deployments[s.dep]
  const pickNote = (w: Partial<Record<NoteId, number>> | undefined): NoteId | null => {
    if (!w) return null
    const entries = Object.entries(w) as [NoteId, number][]
    const total = entries.reduce((a, [, v]) => a + v, 0)
    let u = s.draws.uNote * total
    for (const [k, v] of entries) {
      u -= v
      if (u < 0) return k
    }
    return entries[entries.length - 1][0]
  }
  const rc = d.offTheRecord === 'm3' && s.draws.uRc < config.rc.share
  if (s.draws.arm !== 'FULL') return { route: 'partial', note: null, rc: false }
  if (d.screening) {
    if (split === 'high')
      return { route: s.draws.uRoute < config.m1h.share ? 'm1h' : 'high', note: null, rc: false }
    return { route: 'standard', note: pickNote(d.notes.low), rc: false }
  }
  return { route: 'standard', note: pickNote(d.notes.all), rc }
}

function offTheRecord(route: Route, rc: boolean, rng: Rng, kind: 'm1h' | 'm3'): Step[] {
  const out: Step[] = []
  out.push({ kind: 'intro', act: 'offTheRecord', which: 'otr' })
  out.push({ kind: 'intro', act: 'offTheRecord', which: 'xw-direct' })
  for (const item of xw.practice.direct) out.push({ kind: 'xw-direct', act: 'offTheRecord', item })
  out.push({ kind: 'intro', act: 'offTheRecord', which: 'xw-practice' })
  const practice = [...xw.practice.direct, ...xw.practice.crosswise].slice(0, 3)
  for (const item of practice)
    out.push({ kind: 'xw', act: 'offTheRecord', item, purpose: 'practice', fictional: true })
  out.push({ kind: 'intro', act: 'offTheRecord', which: 'xw-items' })
  out.push({
    kind: 'xw',
    act: 'offTheRecord',
    item: xw.anchor,
    purpose: 'anchor',
    fictional: false,
  })
  out.push({
    kind: 'xw',
    act: 'offTheRecord',
    item: xw.knownZero,
    purpose: 'zero',
    fictional: false,
  })
  /* Every route is filled to the same number of screens with neutral privacy items. */
  const neutral = rng.shuffle(xw.neutral)
  const pad = (n: number) =>
    neutral
      .splice(0, n)
      .map(
        (item) =>
          ({ kind: 'xw', act: 'offTheRecord', item, purpose: 'neutral', fictional: false }) as Step,
      )
  if (kind === 'm1h') {
    if (route === 'm1h') {
      for (const item of xw.m1hControls)
        out.push({ kind: 'xw', act: 'offTheRecord', item, purpose: 'control', fictional: false })
      for (const item of xw.m1hStatements)
        out.push({ kind: 'xw', act: 'offTheRecord', item, purpose: 'm1h', fictional: false })
      out.push({ kind: 'intro', act: 'offTheRecord', which: 'm1h-direct' })
      for (const item of xw.m1hStatements)
        out.push({ kind: 'm1h-direct', act: 'offTheRecord', item })
    } else {
      /* Neutral items in the crosswise format for the crosswise half, and answered directly
         for the direct half, so both routes have the same screens and the same formats. */
      out.push(...pad(xw.m1hControls.length))
      const twelve = neutral.splice(0, xw.m1hStatements.length)
      for (const item of twelve)
        out.push({ kind: 'xw', act: 'offTheRecord', item, purpose: 'neutral', fictional: false })
      out.push({ kind: 'intro', act: 'offTheRecord', which: 'm1h-direct' })
      for (const item of twelve) out.push({ kind: 'm1h-direct', act: 'offTheRecord', item })
    }
  } else {
    for (const item of xw.m3Items)
      out.push({ kind: 'xw', act: 'offTheRecord', item, purpose: 'm3', fictional: false })
    if (rc)
      for (const item of xw.rcItems)
        out.push({ kind: 'xw', act: 'offTheRecord', item, purpose: 'rc', fictional: false })
    else out.push(...pad(xw.rcItems.length))
  }
  return out
}

/** Phase two: everything after form A (and the screening block, where there is one). */
export function phase2(
  s: Session,
  route: Route,
  note: NoteId | null,
  rc: boolean,
  rng: Rng,
): Step[] {
  const d = config.deployments[s.dep]
  const out: Step[] = []
  if (route === 'm1h' || route === 'high') out.push(...offTheRecord(route, false, rng, 'm1h'))
  if (route === 'standard') {
    if (d.surveyFirstHalf) {
      out.push({ kind: 'intro', act: 'survey', which: 'survey' })
      for (const [i, item] of s.surveyOrder.first.entries())
        out.push({ kind: 'survey', act: 'survey', item, admin: 1, second: i >= surveyItems.length })
    }
    if (d.offTheRecord === 'm3') out.push(...offTheRecord(route, rc, rng, 'm3'))
    if (s.inbox.length > 0) {
      out.push({ kind: 'intro', act: 'inbox', which: 'inbox' })
      for (const i of s.inbox) out.push({ kind: 'inbox', act: 'inbox', id: i.id, lang: i.lang })
    }
    if (note) {
      out.push({ kind: 'note', act: 'note', note })
      const peopleB: Step[] = s.formB.map((p, i) => ({
        kind: 'people',
        act: 'after',
        p,
        n: 1000 + i,
      }))
      out.push(...interleave(peopleB, s.ordinaryQueue, 'after'))
      if (d.surveySecondHalf) {
        out.push({ kind: 'intro', act: 'after', which: 'survey' })
        for (const [i, item] of s.surveyOrder.second.entries())
          out.push({
            kind: 'survey',
            act: 'after',
            item,
            admin: 2,
            second: i >= surveyItems.length,
          })
      }
      out.push({
        kind: 'recall',
        act: 'after',
        order: [
          ...rng.shuffle(recallOptions(note).filter((o) => o.id !== 'none')).map((o) => o.id),
          'none',
        ],
      })
    }
    if (d.directBlock) {
      out.push({ kind: 'intro', act: 'direct', which: 'direct' })
      for (const [i, item] of s.surveyOrder.direct.entries())
        out.push({
          kind: 'survey',
          act: 'direct',
          item,
          admin: 'direct',
          second: i >= directItems.length,
        })
    }
  }
  out.push({ kind: 'probe', act: 'wrap' }, { kind: 'result', act: 'wrap' })
  out.push({ kind: 'prior', act: 'wrap', id: 'told' }, { kind: 'prior', act: 'wrap', id: 'heard' })
  if (s.dep === 'firm') out.push({ kind: 'prior', act: 'wrap', id: 'played' })
  out.push({ kind: 'debrief', act: 'wrap' }, { kind: 'code', act: 'wrap' })
  if (d.demographics) out.push({ kind: 'demographics', act: 'wrap' })
  out.push({ kind: 'submit', act: 'wrap' })
  return out
}

/** Out-of-fiction screens open with "This part is not part of the game" (rule 8). */
export const OUT_OF_FICTION: Act[] = [
  'screening',
  'survey',
  'offTheRecord',
  'note',
  'direct',
  'wrap',
]
export const isOutOfFiction = (step: Step) =>
  OUT_OF_FICTION.includes(step.act) ||
  (step.act === 'after' &&
    (step.kind === 'survey' || step.kind === 'recall' || step.kind === 'intro'))

/**
 * The recall item's options for a player (owner decisions O1, 19 Oct 2026): the note that player
 * saw, the made-up notes (`decoy` in content/screens.json: a statistic on another topic and no
 * instruction to answer any way), and "I do not remember". No arm is offered a real note it did
 * not see. This departs from the registered item (candidates v12 3.10 and later), which listed
 * every real note to every arm. The step shuffles all but "I do not remember", which stays last.
 */
export const recallOptions = (note: NoteId | null) =>
  screens.recall.options.filter(
    (o) => o.id === note || ('decoy' in o && o.decoy) || o.id === 'none',
  )
