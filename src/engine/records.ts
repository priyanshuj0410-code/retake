/**
 * What a session stores, built only at submit, in one write. Nothing is written while the
 * player plays, so the store never sees when an answer was given. No record holds a write
 * time, a sequence number, a session id, a token, a name of the player or a device detail.
 *
 * - The person-level record (eval-play/<play key>) holds the card, survey, screening, Inbox,
 *   ordinary-decision and wrap answers under the code's play key. Inside it every record sits
 *   at a random key. A card's `n` is its position in the session (the plan reads W by card
 *   position, PF-15); it is an order within one person's season, not an arrival order.
 * - Crosswise records (eval-xw) and demographic records (eval-demo) are unlinked: each sits at
 *   its own key derived from the code, and carries only its item, its answer and its label.
 */
import type { Lang } from '../content/types'
import { config, type DeploymentId, type NoteId, type R1Arm } from './config'
import type { CodeKeys } from './codes'
import type { Presented } from './layout'
import { randomKey } from './rng'
import { characterScores } from './score'
import type { Route, Split, XwPurpose } from './session'

export interface CharRecord {
  d: string
  sex: string
  nm: string
  rel: string
  sn?: string
  caste?: string
  city?: string
  born?: string
  tone?: string
  badge?: string
  st: number
  s: number
}

export interface CardRecord {
  card: string
  form: string
  fam: string
  str: string
  pres: string
  sp?: string
  lang: Lang
  base: boolean
  arm: R1Arm
  filler: boolean
  rm: boolean
  n: number
  chars: CharRecord[]
}

export interface ItemRecord {
  k: 'ord' | 'screen' | 'survey' | 'direct' | 'inbox' | 'm1h-direct' | 'recall' | 'probe' | 'prior'
  i: string
  v: string | number
  a?: number
  l?: Lang
  x?: string
  r?: boolean
}

export interface PlayMeta {
  dep: DeploymentId
  v: string
  langs: 'en' | 'hinglish' | 'both'
  arm: R1Arm
  route: Route
  note?: NoteId
  split?: Split
  m5?: number
  result: number
  timingArm?: 'before' | 'after'
  batchMonth?: string
  sex?: string
}

export interface PlayRecord {
  meta: PlayMeta
  cards: Record<string, CardRecord>
  items: Record<string, ItemRecord>
}

export interface CrosswiseRecord {
  dep: DeploymentId
  i: string
  a: 'same' | 'different'
  sub: 'low' | 'high'
  lab: string
}

export interface DemographicRecord {
  dep: DeploymentId
  i: string
  a: string
}

export interface Submission {
  codeKey: string
  dep: DeploymentId
  play: { key: string; value: PlayRecord }
  crosswise: { key: string; value: CrosswiseRecord }[]
  demographics: { key: string; value: DemographicRecord }[]
}

export interface Answers {
  people: Map<number, { p: Presented; order?: number[]; units?: number[] }>
  items: ItemRecord[]
  xw: { i: string; purpose: XwPurpose; a: 'same' | 'different' }[]
  xwDirect: Record<string, boolean>
  demographics: Record<string, string>
}

export const emptyAnswers = (): Answers => ({ people: new Map(), items: [], xw: [], xwDirect: {}, demographics: {} })

export function cardRecord(p: Presented, n: number, answer: { order?: number[]; units?: number[] }): CardRecord {
  const s = characterScores(p.card, answer)
  const startPos = p.start.map((_, pos) => pos)
  const st = [0, 0, 0, 0]
  p.start.forEach((ci, pos) => (st[ci] = startPos[pos]))
  const rec: CardRecord = {
    card: p.card.id,
    form: p.form,
    fam: p.family,
    str: p.stratum,
    pres: p.baseline ? 'baseline' : p.presentation,
    lang: p.lang,
    base: p.baseline,
    arm: p.arm,
    filler: p.filler,
    rm: p.rematch,
    n,
    chars: p.chars.map((c, i) => {
      const r: CharRecord = { d: c.d, sex: c.sex, nm: c.name, rel: c.religion, st: st[i], s: Math.round(s[i] * 1e4) / 1e4 }
      if (c.surname) r.sn = c.surname
      if (c.caste) r.caste = c.caste
      if (c.born) {
        r.city = c.born.city
        r.born = c.born.region
      }
      if (c.tone) r.tone = c.tone
      if (c.badge) r.badge = c.badge
      return r
    }),
  }
  if (p.species) rec.sp = p.species
  return rec
}

export function buildSubmission(args: {
  keys: CodeKeys
  meta: PlayMeta
  answers: Answers
  xwLabel: string
  xwSub: 'low' | 'high'
}): Submission {
  const { keys, meta, answers } = args
  if (answers.xw.filter((x) => x.purpose !== 'neutral' && x.purpose !== 'practice').length > keys.xw.length) throw new Error('more crosswise records than keys')
  const cards: Record<string, CardRecord> = {}
  for (const [n, a] of answers.people) cards[randomKey()] = cardRecord(a.p, n, a)
  const items: Record<string, ItemRecord> = {}
  for (const it of answers.items) items[randomKey()] = it
  const xwKeys = shuffleKeys(keys.xw)
  const crosswise = answers.xw
    .filter((x) => x.purpose !== 'neutral' && x.purpose !== 'practice')
    .map((x, idx) => ({ key: xwKeys[idx], value: { dep: meta.dep, i: x.i, a: x.a, sub: args.xwSub, lab: args.xwLabel } as CrosswiseRecord }))
  const demoKeys = shuffleKeys(keys.demo)
  const demographics = Object.entries(answers.demographics)
    .filter(([, a]) => a !== '')
    .map(([i, a], idx) => ({ key: demoKeys[idx], value: { dep: meta.dep, i, a } }))
  return { codeKey: keys.code, dep: meta.dep, play: { key: keys.play, value: { meta: { ...meta, v: config.version }, cards, items } }, crosswise, demographics }
}

/** The keys a session uses are a random subset in a random order, so even the key index carries no order. */
function shuffleKeys(keys: string[]): string[] {
  const out = keys.slice()
  const buf = new Uint32Array(out.length)
  crypto.getRandomValues(buf)
  for (let i = out.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
