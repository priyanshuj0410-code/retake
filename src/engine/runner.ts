/**
 * The session runner: walks a session's steps and keeps every answer in memory until submit.
 * The screens and the seeded demo players drive the same runner, so a demo player produces
 * exactly the records a person would. Nothing here writes to a store or reads a clock.
 */
import { ordinaryBank, screens, xw } from '../content'
import type { Lang } from '../content/types'
import { config, type CardDeploymentId, type NoteId } from './config'
import { deriveKeys, newCode, type CodeKeys } from './codes'
import { m3Label, type ConductCard } from './m3'
import {
  buildSubmission,
  emptyAnswers,
  type Answers,
  type ItemRecord,
  type PlayMeta,
  type Submission,
} from './records'
import type { Rng } from './rng'
import { characterScores } from './score'
import {
  createSession,
  phase2,
  routeAndNote,
  screeningScore,
  splitOf,
  type Route,
  type Session,
  type Split,
  type Step,
} from './session'

export interface FirmLabels {
  timingArm: 'before' | 'after'
  batchMonth: string
  sex: string
}

export class Runner {
  readonly session: Session
  steps: Step[]
  index = 0
  answers: Answers = emptyAnswers()
  screening: Record<string, string> = {}
  split: Split | null = null
  route: Route = 'standard'
  note: NoteId | null = null
  rc = false
  points = 0
  code: string | null = null
  keys: CodeKeys | null = null

  private readonly rng: Rng
  readonly dep: CardDeploymentId
  readonly langs: Lang[]
  readonly firm?: FirmLabels

  constructor(rng: Rng, dep: CardDeploymentId, langs: Lang[], firm?: FirmLabels) {
    this.rng = rng
    this.dep = dep
    this.langs = langs
    this.firm = firm
    this.session = createSession(rng, dep, langs)
    this.steps = this.session.phase1.slice()
    /* With no screening block in this session (game 2, the firm, R1's partial arms), phase two follows at once. */
    if (!this.steps.some((st) => st.kind === 'screening')) this.extend()
  }

  get current(): Step | undefined {
    return this.steps[this.index]
  }

  get done() {
    return this.index >= this.steps.length
  }

  /** Builds phase two once the screening block is answered (or at once, with no screening block). */
  private extend() {
    if (this.steps.some((st) => st.kind === 'screening'))
      this.split = splitOf(screeningScore(this.screening))
    const r = routeAndNote(this.session, this.split)
    this.route = r.route
    this.note = r.note
    this.rc = r.rc
    this.steps.push(...phase2(this.session, this.route, this.note, this.rc, this.rng))
  }

  private record(it: ItemRecord) {
    this.answers.items.push(it)
  }

  /** Records the answer to the current step and moves on. `value`'s shape follows the step's kind. */
  answer(value: unknown) {
    const s = this.current
    if (!s) return
    switch (s.kind) {
      case 'people': {
        const v = value as { order?: number[]; units?: number[] }
        this.answers.people.set(s.n, { p: s.p, ...v })
        break
      }
      case 'ordinary': {
        const opt = s.d.options.find((o) => o.id === value)
        if (s.d.scored && opt) this.points += opt.effect
        this.record({ k: 'ord', i: s.d.id, v: String(value) })
        break
      }
      case 'screening':
        this.screening[s.id] = String(value)
        this.record({ k: 'screen', i: s.id, v: String(value) })
        break
      case 'survey':
        this.record({
          k: s.admin === 'direct' ? 'direct' : 'survey',
          i: s.item.id,
          v: Number(value),
          ...(s.admin === 'direct' ? {} : { a: s.admin }),
          ...(s.second ? { r: true } : {}),
        })
        break
      case 'xw-direct':
        this.answers.xwDirect[s.item.id] = Boolean(value)
        break
      case 'xw':
        this.answers.xw.push({ i: s.item.id, purpose: s.purpose, a: value as 'same' | 'different' })
        break
      case 'm1h-direct':
        /* Neutral padding items are answered and discarded, as in the crosswise half. */
        if (xw.m1hStatements.some((i) => i.id === s.item.id))
          this.record({ k: 'm1h-direct', i: s.item.id, v: value ? 'true' : 'false' })
        break
      case 'inbox': {
        const v = value as { label: number; action: string }
        this.record({ k: 'inbox', i: s.id, v: v.label, l: s.lang, x: v.action })
        break
      }
      case 'recall':
        this.record({ k: 'recall', i: 'recall', v: String(value), x: s.order.join(',') })
        break
      case 'probe':
        this.record({ k: 'probe', i: 'probe', v: (value as string[]).slice().sort().join(',') })
        break
      case 'prior':
        this.record({ k: 'prior', i: s.id, v: String(value) })
        break
      case 'demographics':
        this.answers.demographics = { ...(value as Record<string, string>) }
        break
      default:
        break
    }
    const wasScreening = s.kind === 'screening'
    this.index += 1
    if (wasScreening && (this.current === undefined || this.current.kind !== 'screening'))
      this.extend()
  }

  /** A name the player staffed earlier, for an unscored ordinary decision's {recall}. */
  recallName(): string {
    for (const a of [...this.answers.people.values()].reverse()) {
      if (a.p.baseline) continue
      const s = characterScores(a.p.card, a)
      const top = s.indexOf(Math.max(...s))
      const c = a.p.chars[top]
      if (c) return c.surname ? `${c.name} ${c.surname}` : c.name
    }
    return ordinaryBank.length ? 'A colleague' : ''
  }

  seasonBand() {
    const bands = screens.wrap.result.bands
    return bands.filter((b) => this.points >= b.min).pop() ?? bands[0]
  }

  /** M5: practice crosswise answers that agree with the player's own direct answers and the fictional randomiser value (February: the low statement is true). */
  m5Correct(): number {
    const lowTrue = true
    const bTrue = this.session.draws.xwSub === 'low' ? lowTrue : !lowTrue
    let n = 0
    for (const a of this.answers.xw.filter((x) => x.purpose === 'practice')) {
      const direct = this.answers.xwDirect[a.i]
      if (direct === undefined) continue
      if ((direct === bTrue ? 'same' : 'different') === a.a) n += 1
    }
    return n
  }

  async prepareCode(iterations?: number) {
    if (this.keys) return
    this.code = newCode()
    this.keys = await deriveKeys(this.code, iterations)
  }

  /** The crosswise label: the route label in game 1, the device's conduct-half label in game 2. */
  private xwLabel(): string {
    const d = config.deployments[this.dep]
    if (d.offTheRecord === 'm1h') return 'm1h'
    if (d.offTheRecord !== 'm3') return 'none'
    const conduct: ConductCard[] = [...this.answers.people.values()]
      .filter((a) => a.p.family === 'conduct' && a.p.form === 'A' && !a.p.baseline && !a.p.rematch)
      .map((a) => {
        const s = characterScores(a.p.card, a)
        return {
          stratum: a.p.stratum,
          chars: a.p.chars.map((c, i) => ({ d: c.d, woman: c.sex === 'woman', s: s[i] })),
        }
      })
    /* The label is computed here, attached below, and nothing that produced it is kept. */
    return m3Label(this.rng, conduct)
  }

  submission(): Submission {
    if (!this.keys) throw new Error('no code yet')
    const langs: PlayMeta['langs'] =
      this.langs.length > 1 ? 'both' : (this.langs[0] as 'en' | 'hinglish')
    const meta: PlayMeta = {
      dep: this.dep,
      v: config.version,
      langs,
      arm: this.session.draws.arm,
      route: this.route,
      result: this.points,
    }
    if (this.note) meta.note = this.note
    if (this.split) meta.split = this.split
    if (this.answers.xw.some((x) => x.purpose === 'practice')) meta.m5 = this.m5Correct()
    if (this.firm) {
      meta.timingArm = this.firm.timingArm
      meta.batchMonth = this.firm.batchMonth
      meta.sex = this.firm.sex
    }
    /* Game 1's high scorers outside M1-H answer neutral items only: none of their crosswise
       answers is stored, so no record marks the route. */
    if (this.route === 'high') this.answers.xw = []
    return buildSubmission({
      keys: this.keys,
      meta,
      answers: this.answers,
      xwLabel: this.xwLabel(),
      xwSub: this.session.draws.xwSub,
    })
  }
}

export const randomiserStatement = (sub: 'low' | 'high', lang: Lang) =>
  xw.randomiserQuestion[sub][lang]
