/**
 * Scoring (knowledge/design.md, section 7; consistency-and-levels-2026-10-20.md, section 1.0).
 *
 * Two kinds of evidence come out of every step:
 * - lean units: a signed d in [-1, 1] for a mirrored judgement, positive when the woman's side
 *   came out better and negative when the man's did. Lean is the size of their shrunk mean, so
 *   favouring women costs exactly what favouring men costs, and a player who overcorrects
 *   shows a lean like anyone else. The sign never leaves this module.
 * - parts of consistency, each a score in [0, 1]: rules kept (the player's own locked rule),
 *   matching cases treated alike (mirrored lines, and twins that return days later with the
 *   genders swapped), check-spending parity and word-choice parity.
 *
 * Consistency is the mean of the parts present, with evenness (1 minus the lean size) added
 * over a week. The headline score is consistency plus practice. Steps whose within-day
 * comparison is confounded by design (a twin's loaded words, a voice that points at one
 * person) give their lean units only when both halves are in.
 */
import { cast, twinHalves, type Area, type Day, type Step } from '../content'
import type {
  Answer,
  AssignAnswer,
  ChecksAnswer,
  PickAnswer,
  RankAnswer,
  SwipeAnswer,
  TeamAnswer,
  WordsAnswer,
} from './answers'
import type {
  AssignStep,
  ChecksStep,
  PickStep,
  RankStep,
  SwipeStep,
  TeamStep,
  WordsStep,
} from '../content/types'

/** Shrinkage: a lean is the units' sum over (count + K), so one choice is never a verdict. */
export const SHRINK = 2
export const PRACTICE_PER_STEP = 10
export const PRACTICE_SUNDAY = 10

export type Comp = 'rules' | 'matching' | 'checks' | 'words'
export const COMPS: Comp[] = ['rules', 'matching', 'checks', 'words']

export interface Unit {
  d: number
  area: Area | 'none'
  source: string
}

/** A part of consistency, and the clear number shown for it. */
export interface Part {
  comp: Comp
  score: number
  /** rules and words: per cent kept or gap of 100; matching: n of total; checks: checks apart. */
  shown: { n: number; total?: number }
}

export interface StepScore {
  units: Unit[]
  parts: Part[]
  deferred: boolean
  crowdOff?: number
}

const gender = (who: string) => cast(who).gender
const sideOf = (who: string | null | undefined) =>
  who ? (gender(who) === 'w' ? 1 : -1) : 0
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)
const clamp = (x: number) => Math.max(-1, Math.min(1, x))

/** People grouped by an equal key; only groups holding both a woman and a man are returned. */
function mixedTies<T>(xs: T[], key: (x: T) => number, who: (x: T) => string): T[][] {
  const groups = new Map<number, T[]>()
  for (const x of xs) groups.set(key(x), [...(groups.get(key(x)) ?? []), x])
  return [...groups.values()].filter(
    (g) => g.some((x) => gender(who(x)) === 'w') && g.some((x) => gender(who(x)) === 'm'),
  )
}

/** d for a tie group: the women's mean outcome minus the men's, outcome in [0, 1]. */
function tieD<T>(g: T[], outcome: (x: T) => number, who: (x: T) => string) {
  const w = g.filter((x) => gender(who(x)) === 'w').map(outcome)
  const m = g.filter((x) => gender(who(x)) === 'm').map(outcome)
  return clamp(mean(w) - mean(m))
}

/** Share of ordered pairs (higher key, lower key) whose outcomes keep that order. */
function compliance<T>(xs: T[], key: (x: T) => number, outcome: (x: T) => number) {
  let pairs = 0
  let kept = 0
  for (const i of xs)
    for (const j of xs)
      if (key(i) > key(j)) {
        pairs++
        if (outcome(i) >= outcome(j)) kept++
      }
  return pairs ? kept / pairs : 1
}

const keyFor = (values: Record<string, number> | undefined, key: string) =>
  key === 'sum'
    ? Object.values(values ?? {}).reduce((s, v) => s + v, 0)
    : (values?.[key] ?? 0)

function assign(step: AssignStep, a: AssignAnswer, area: Unit['area']): StepScore {
  const rule = step.rules.find((r) => r.id === a.rule)
  const slotOf = (who: string) => {
    const s = Object.entries(a.slots).find(([, v]) => v === who)?.[0]
    return step.slots.find((x) => x.id === s)?.value ?? 0
  }
  if (!rule) return { units: [], parts: [], deferred: false }
  const key = (p: AssignStep['people'][number]) => keyFor(p.values, rule.key)
  const score = compliance(step.people, key, (p) => slotOf(p.who))
  const units = mixedTies(step.people, key, (p) => p.who).map((g) => ({
    d: tieD(g, (p) => slotOf(p.who), (p) => p.who),
    area,
    source: step.id,
  }))
  return {
    units,
    parts: [{ comp: 'rules', score, shown: { n: Math.round(score * 100) } }],
    deferred: false,
  }
}

function rank(step: RankStep, a: RankAnswer, area: Unit['area']): StepScore {
  const n = step.people.length
  const pos = (who: string) => {
    const i = a.order.indexOf(who)
    return i < 0 ? n : i
  }
  const outcome = (who: string) => (n - 1 - pos(who)) / Math.max(1, n - 1)
  const rule = step.rules?.find((r) => r.id === a.rule)
  if (!rule) return { units: [], parts: [], deferred: false }
  const key = (p: RankStep['people'][number]) => keyFor(p.values, rule.key)
  const score = compliance(step.people, key, (p) => outcome(p.who))
  const units = mixedTies(step.people, key, (p) => p.who).map((g) => ({
    d: tieD(g, (p) => outcome(p.who), (p) => p.who),
    area,
    source: step.id,
  }))
  return {
    units,
    parts: [{ comp: 'rules', score, shown: { n: Math.round(score * 100) } }],
    deferred: false,
  }
}

/** A pick between people whose descriptions match: the chosen side, or 0 for an even option. */
function pickSide(step: PickStep, a: PickAnswer) {
  return sideOf(step.options.find((o) => o.id === a.choice)?.who)
}

function pick(step: PickStep, a: PickAnswer, area: Unit['area']): StepScore {
  if (step.twin) return { units: [], parts: [], deferred: true }
  const people = step.options.filter((o) => o.who)
  const mirrored = people.some((x) =>
    people.some(
      (y) => x.profile && x.profile === y.profile && gender(x.who!) !== gender(y.who!),
    ),
  )
  return {
    units: mirrored ? [{ d: pickSide(step, a), area, source: step.id }] : [],
    parts: [],
    deferred: false,
  }
}

function mirrorPairs(step: ChecksStep) {
  const tags = [...new Set(step.people.map((p) => p.mirror).filter(Boolean))]
  return tags.map((t) => {
    const g = step.people.filter((p) => p.mirror === t)
    return {
      w: g.find((p) => gender(p.who) === 'w')!.who,
      m: g.find((p) => gender(p.who) === 'm')!.who,
    }
  })
}

function checks(step: ChecksStep, a: ChecksAnswer, area: Unit['area']): StepScore {
  const pairs = mirrorPairs(step)
  const gaps = pairs.map((p) => Math.abs((a.checks[p.w] ?? 0) - (a.checks[p.m] ?? 0)))
  const gap = Math.max(0, ...gaps)
  const parts: Part[] = pairs.length
    ? [{ comp: 'checks', score: 1 - gap / step.budget, shown: { n: gap } }]
    : []
  if (step.twin) return { units: [], parts, deferred: true }
  const units = pairs.flatMap((p) => [
    {
      d: clamp(((a.checks[p.m] ?? 0) - (a.checks[p.w] ?? 0)) / step.budget),
      area,
      source: `${step.id}:checks`,
    },
    {
      d: a.choice === p.w ? 1 : a.choice === p.m ? -1 : 0,
      area,
      source: `${step.id}:choice`,
    },
  ])
  return { units, parts, deferred: false }
}

function team(step: TeamStep, a: TeamAnswer, area: Unit['area']): StepScore {
  const units = mixedTies(
    step.people,
    (p) => p.value,
    (p) => p.who,
  ).map((g) => ({
    d: tieD(
      g,
      (p) => (a.picked.includes(p.who) ? 1 : 0),
      (p) => p.who,
    ),
    area,
    source: `${step.id}:tie`,
  }))
  return { units, parts: [], deferred: !!step.twin }
}

function words(step: WordsStep, a: WordsAnswer, area: Unit['area']): StepScore {
  const val = (id: string | null) => step.bank.find((b) => b.id === id)?.valence ?? 0
  const noteMean = (who: string) => mean((a.notes[who] ?? []).map(val))
  const w = step.people.filter((p) => gender(p) === 'w').map(noteMean)
  const m = step.people.filter((p) => gender(p) === 'm').map(noteMean)
  const d = clamp((mean(w) - mean(m)) / 2)
  return {
    units: [{ d, area, source: step.id }],
    parts: [{ comp: 'words', score: 1 - Math.abs(d), shown: { n: Math.round(Math.abs(d) * 100) } }],
    deferred: false,
  }
}

function swipe(step: SwipeStep, a: SwipeAnswer, area: Unit['area']): StepScore {
  const pairs = [...new Set(step.items.map((i) => i.pair))]
  let alike = 0
  const units: Unit[] = []
  for (const p of pairs) {
    const items = step.items.filter((i) => i.pair === p)
    const kept = (g: 'w' | 'm') =>
      items.filter((i) => gender(i.who) === g).some((i) => a.verdicts[i.id] === 'keep') ? 1 : 0
    if (kept('w') === kept('m')) alike++
    units.push({ d: kept('m') - kept('w'), area, source: `${step.id}:${p}` })
  }
  return {
    units,
    parts: [
      {
        comp: 'matching',
        score: pairs.length ? alike / pairs.length : 1,
        shown: { n: alike, total: pairs.length },
      },
    ],
    deferred: false,
  }
}

export function scoreStep(day: Day, step: Step, a: Answer): StepScore {
  const area = day.area ?? 'none'
  switch (step.kind) {
    case 'assign':
      return assign(step, a as AssignAnswer, area)
    case 'rank':
      return rank(step, a as RankAnswer, area)
    case 'pick':
      return pick(step, a as PickAnswer, area)
    case 'checks':
      return checks(step, a as ChecksAnswer, area)
    case 'team':
      return team(step, a as TeamAnswer, area)
    case 'words':
      return words(step, a as WordsAnswer, area)
    case 'swipe':
      return swipe(step, a as SwipeAnswer, area)
    case 'crowd':
      return {
        units: [],
        parts: [],
        deferred: false,
        crowdOff: Math.abs(a.kind === 'crowd' ? a.guess - step.sample : 0),
      }
  }
}

/**
 * A twin whose two halves are both in: one matching part (were the halves treated alike?) and
 * the lean units the halves held back (the mean of the halves' signed outcomes, so following
 * the words or the voice both times cancels, and following gender both times does not).
 */
export function scorePair(
  a: { day: Day; step: Step; answer: Answer },
  b: { day: Day; step: Step; answer: Answer },
): { units: Unit[]; parts: Part[] } {
  const area = b.day.area ?? 'none'
  const src = `twin:${'twin' in a.step ? a.step.twin?.id : ''}`
  if (a.step.kind === 'pick' && b.step.kind === 'pick') {
    const pa = a.answer as PickAnswer
    const pb = b.answer as PickAnswer
    const prof = (s: PickStep, x: PickAnswer) => s.options.find((o) => o.id === x.choice)?.profile
    const alike = prof(a.step, pa) === prof(b.step, pb) ? 1 : 0
    return {
      units: [{ d: (pickSide(a.step, pa) + pickSide(b.step, pb)) / 2, area, source: src }],
      parts: [{ comp: 'matching', score: alike, shown: { n: alike, total: 1 } }],
    }
  }
  if (a.step.kind === 'checks' && b.step.kind === 'checks') {
    const half = (s: ChecksStep, x: ChecksAnswer) => {
      const p = mirrorPairs(s)[0]
      const target = s.voice?.target
      const other = target === p.w ? p.m : p.w
      return {
        lean: clamp((x.checks[p.m] - x.checks[p.w]) / s.budget),
        choice: x.choice === p.w ? 1 : x.choice === p.m ? -1 : 0,
        toTarget: (x.checks[target ?? ''] ?? 0) - (x.checks[other] ?? 0),
        chose: x.choice === target ? 'target' : x.choice === other ? 'other' : 'third',
        budget: s.budget,
      }
    }
    const ha = half(a.step, a.answer as ChecksAnswer)
    const hb = half(b.step, b.answer as ChecksAnswer)
    const spend = 1 - Math.min(1, Math.abs(ha.toTarget - hb.toTarget) / ha.budget)
    const chose = ha.chose === hb.chose ? 1 : 0
    const alike = spend === 1 && chose === 1 ? 1 : 0
    return {
      units: [
        { d: (ha.lean + hb.lean) / 2, area, source: `${src}:checks` },
        { d: (ha.choice + hb.choice) / 2, area, source: `${src}:choice` },
      ],
      parts: [{ comp: 'matching', score: (spend + chose) / 2, shown: { n: alike, total: 1 } }],
    }
  }
  if (a.step.kind === 'team' && b.step.kind === 'team') {
    const half = (s: TeamStep, x: TeamAnswer) => {
      const r = s.responses.find((o) => o.id === x.response)
      return r?.restricts ? (s.voice.target === 'w' ? -1 : 1) : 0
    }
    const ra = (a.answer as TeamAnswer).response
    const rb = (b.answer as TeamAnswer).response
    const alike = ra === rb ? 1 : 0
    return {
      units: [
        {
          d: (half(a.step, a.answer as TeamAnswer) + half(b.step, b.answer as TeamAnswer)) / 2,
          area,
          source: `${src}:voice`,
        },
      ],
      parts: [{ comp: 'matching', score: alike, shown: { n: alike, total: 1 } }],
    }
  }
  return { units: [], parts: [] }
}

/** The lean size, 0 to 100: the shrunk mean's absolute value. The direction is dropped here. */
export function leanSize(units: Unit[]): number | null {
  if (!units.length) return null
  const sum = units.reduce((s, u) => s + u.d, 0)
  return Math.round((100 * Math.abs(sum)) / (units.length + SHRINK))
}

/** Each component's score over a set of parts: rules, checks and words average; matching pools. */
export function components(parts: Part[]) {
  const out: Partial<Record<Comp, { score: number; n: number; total?: number }>> = {}
  for (const c of COMPS) {
    const ps = parts.filter((p) => p.comp === c)
    if (!ps.length) continue
    if (c === 'matching') {
      const n = ps.reduce((s, p) => s + p.shown.n, 0)
      const total = ps.reduce((s, p) => s + (p.shown.total ?? 1), 0)
      out[c] = { score: mean(ps.map((p) => p.score)), n, total }
    } else if (c === 'checks') {
      out[c] = { score: mean(ps.map((p) => p.score)), n: Math.max(...ps.map((p) => p.shown.n)) }
    } else out[c] = { score: mean(ps.map((p) => p.score)), n: Math.round(mean(ps.map((p) => p.shown.n))) }
  }
  return out
}

/** Consistency, 0 to 100: the mean of the components present, plus evenness when a lean is. */
export function consistency(parts: Part[], lean: number | null): number | null {
  const comps = Object.values(components(parts)).map((c) => c.score)
  if (lean !== null) comps.push(1 - lean / 100)
  return comps.length ? Math.round(100 * mean(comps)) : null
}

/** What the twin's content halves are, to find a record's other half. */
export const halvesOf = (id: string) => twinHalves(id)
