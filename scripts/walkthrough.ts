/**
 * The question walkthrough: every screen the prototype shows, in the order a player meets it,
 * as one static HTML page for the owner's feedback on content and look. It walks the real
 * session engine (src/engine) with seeded draws and renders each screen with the app's own
 * components (src/screens, src/ui) and stylesheets, so nothing here is a hand copy.
 *
 * Usage: pnpm walkthrough [output path]
 * Default output: the session scratchpad's question-walkthrough.html (artifact-ready: no
 * document skeleton, everything inline).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement as h, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { notesById, screens, screeningItems } from '../src/content'
import type { Lang } from '../src/content/types'
import { config, formatDate, releaseOf, type CardDeploymentId } from '../src/engine/config'
import { windowFor } from '../src/engine/firm'
import { estimate, longest } from '../src/engine/length'
import { seeded } from '../src/engine/rng'
import { Runner } from '../src/engine/runner'
import { phase2, type Step } from '../src/engine/session'
import { characterView, fill } from '../src/engine/text'
import { Disclosure } from '../src/screens/Disclosure'
import { Enrol, Explain, Withdraw } from '../src/screens/Pages'
import { Consent, DemoNotice, Finished, LanguageStep } from '../src/screens/PreScreens'
import { StepView } from '../src/screens/StepView'
import { DEMO_SCHEDULE } from '../src/store/local'
import type { Enrolment, Explanation } from '../src/store/types'

const ROOT = new URL('..', import.meta.url).pathname
const OUT =
  process.argv[2] ??
  '/private/tmp/claude-501/-Users-priyanshu-Sex-Ed/3d15375f-6fc5-4923-b9ba-cc461051ced8/scratchpad/question-walkthrough.html'
const UI: Lang = 'en'
const T = config.timing
;(globalThis as unknown as { location: unknown }).location = {
  origin: 'https://evaluator.example',
  pathname: '/',
  hash: '',
  search: '',
}

/* ------------------------------------------------------------------ the model of the page */

interface Screen {
  kind: 'screen'
  id: string
  name: string
  html: string
  seconds: number
  varies?: string
  after?: string
  placeholder?: string
  note?: string
}
interface Act {
  kind: 'act'
  id: string
  title: string
}
interface Branch {
  kind: 'branch'
  id?: string
  title: string
  note: string
  arms: { label: string; note?: string; nodes: Node[] }[]
}
type Node = Screen | Act | Branch
interface Section {
  id: string
  title: string
  intro: string
  nodes: Node[]
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** One screen's markup, made static: unique ids, no landmarks or page-level headings repeated. */
function markup(el: ReactElement, id: string): string {
  let html = renderToStaticMarkup(el)
  html = html.replace(/<main /g, '<div ').replace(/<\/main>/g, '</div>')
  html = html
    .replace(
      /<h1 class="page__title"([^>]*)>/g,
      '<p class="page__title" role="heading" aria-level="4"$1>',
    )
    .replace(/<\/h1>/g, '</p>')
  html = html.replace(/ tabindex="-1"/g, '')
  /* Links inside a screen point into the app; on this page they lead nowhere, so they keep their look only. */
  html = html.replace(/ href="[^"]*"/g, '').replace(/ download="[^"]*"/g, '')
  html = html.replace(
    / (id|for|name|aria-labelledby)="([^"]+)"/g,
    (_, a: string, v: string) => ` ${a}="${id}-${v.replace(/[^A-Za-z0-9-]/g, '')}"`,
  )
  return html
}

/* ------------------------------------------------------------------ screen times (25 s a card) */

function secondsOf(step: Step, dep: CardDeploymentId): number {
  switch (step.kind) {
    case 'people':
      return T.secondsPerCard
    case 'ordinary':
      return T.ordinary
    case 'tutorial':
      return T.tutorial
    case 'intro':
      return step.which === 'otr'
        ? T.crosswiseInstructions
        : step.which === 'inbox'
          ? T.contentNote
          : 0
    case 'screening':
      return screeningItems.find((i) => i.id === step.id)?.format === 'vignette'
        ? T.screeningVignette
        : T.screeningItem
    case 'survey':
      return step.admin === 'direct' ? T.blockItem : T.surveyItem
    case 'xw-direct':
    case 'm1h-direct':
      return T.directItem
    case 'xw':
      return step.purpose === 'anchor'
        ? T.anchor
        : step.purpose === 'zero'
          ? T.knownZero
          : T.crosswiseItem
    case 'inbox':
      return T.inbox
    case 'note':
      return T.note
    case 'recall':
      return T.recall
    case 'probe':
      return T.probe
    case 'result':
      return T.result
    case 'prior':
      return T.priorItem
    case 'debrief':
      return T.debrief
    case 'code':
      return T.code
    case 'demographics':
      return (dep === 'firm' ? 3 : 4) * T.demographicItem
    case 'submit':
      return T.submit
  }
}

const ACT_NUMBER: Record<string, string> = {
  firstWeek: 'A1',
  season: 'A2',
  screening: 'A3',
  survey: 'A4',
  offTheRecord: 'A5',
  inbox: 'A6',
  note: 'A7',
  after: 'A8',
  direct: 'A8',
  wrap: 'A9',
}
const ACT_TITLE = (act: string) =>
  screens.common.acts[act as keyof typeof screens.common.acts]?.en ?? act

function describe(
  step: Step,
  runner: Runner,
): Pick<Screen, 'name' | 'varies' | 'after' | 'placeholder' | 'note'> {
  switch (step.kind) {
    case 'people': {
      const p = step.p
      const views = p.chars.map((c) => characterView(p, c, p.lang))
      const s = p.card.type === 'allocation' ? 0 : p.start[0]
      const first = views[s]?.name ?? ''
      const what = p.baseline
        ? 'All-baseline presentation (the merit reference): animals with neutral names, no surname, no birthplace line. Which card gets it is drawn per player.'
        : p.arm !== 'FULL'
          ? `R1 ${p.arm}: the four characters share one description; ${p.arm === 'PARTIAL-G' ? 'only sex varies' : 'only the badge varies'}.`
          : `${p.presentation === 'human' ? 'Human' : 'Animal'} presentation. Cues on this card: sex${p.grounds.religion ? ', religion (first name)' : ''}${p.grounds.caste ? ', caste (surname)' : ''}${p.grounds.birthplace ? ', place of birth' : ''}${p.grounds.tone ? ', skin tone' : ''}${p.grounds.badge ? ', badge colour' : ''}.`
      return {
        name: `${p.family === 'opportunity' ? `Opportunity card, ${p.card.type}, ${p.card.band} role` : p.family === 'npt' ? 'Non-promotable task card' : `Conduct card, ${p.stratum}`}${p.rematch ? ' (rematch)' : p.filler ? ' (R1 filler)' : ''}`,
        varies: `${what} Varies per player: which cards come from the bank, human or animal, every name and cue, the starting order and, for bilinguals, the language. This is one seeded example.`,
        after: `After Confirm the same screen shows: "${fill(p.card.continuation.en, { first })}" (a fixed line, the same whatever the cues).`,
        note: p.rematch
          ? "A rematch: the same characters return with their starting order flipped. Used for S5's consistency guard."
          : undefined,
      }
    }
    case 'ordinary':
      return {
        name: `Ordinary decision (${step.d.kind}, ${step.d.scored ? 'scored' : 'unscored'})`,
        after: `After Confirm: "${fill(step.d.continuation.en, { recall: runner.recallName() })}"`,
        varies: step.d.body.en.includes('{recall}')
          ? 'The colleague named is one the player staffed earlier.'
          : undefined,
      }
    case 'tutorial':
      return { name: 'Tutorial' }
    case 'intro':
      return {
        name: {
          screening: 'Screening block: introduction',
          survey: 'Matched survey: introduction',
          direct: 'Direct block: introduction',
          otr: 'Off the Record: introduction',
          'xw-direct': 'Practice: direct questions',
          'xw-practice': 'Practice: the crosswise format',
          'xw-items': 'Off the Record: the real questions',
          'm1h-direct': 'The same statements, answered directly',
          inbox: 'Content note before the Committee Inbox',
        }[step.which],
      }
    case 'screening':
      return { name: `Screening item ${step.id}` }
    case 'survey':
      return {
        name: `${step.admin === 'direct' ? 'Direct block' : `Matched survey, administration ${step.admin}`}: ${step.item.id}${step.second ? ' (asked a second time)' : ''}`,
        varies: 'Item order is drawn per player; repeat pairs come back later in the block.',
      }
    case 'xw-direct':
      return { name: `Practice, answered directly: ${step.item.id}` }
    case 'xw':
      return {
        name: `Crosswise: ${{ practice: 'practice item', anchor: 'anchor item', zero: 'known-zero item', control: 'M1-H control statement', m1h: 'M1-H statement', m3: 'own-conduct item (M3 diary)', rc: 'module RC item', neutral: 'neutral privacy item' }[step.purpose]} ${step.item.id}`,
        varies: `Statement B depends on the player's subsample (birthday January to March, or April to December).${step.purpose === 'neutral' ? ' Which neutral items, drawn per player.' : ''}`,
      }
    case 'm1h-direct':
      return { name: `Answered directly: ${step.item.id}` }
    case 'inbox':
      return {
        name: `Committee Inbox: ${step.id}`,
        varies:
          'Which incidents (half harassment, half near-miss), their order and, for bilinguals, the language are drawn per player.',
      }
    case 'note': {
      const n = notesById.get(step.note)
      return {
        name: `Mid-season note (${step.note})`,
        placeholder: n?.placeholder
          ? 'The statistic and its source are placeholders until sourced.'
          : undefined,
      }
    }
    case 'recall':
      return { name: 'Recall item' }
    case 'probe':
      return { name: 'Spot the pattern (noticing probe)' }
    case 'result':
      return {
        name: 'Season result',
        varies: 'The result line depends on the ordinary decisions only.',
      }
    case 'prior':
      return { name: `Prior-knowledge item: ${step.id}` }
    case 'debrief':
      return { name: 'Short debrief' }
    case 'code':
      return {
        name: 'Withdrawal code',
        varies: 'The code is random per player and shown once; this one is an example.',
      }
    case 'demographics':
      return { name: 'Optional demographics (unlinked)' }
    case 'submit':
      return { name: 'Submit or withdraw' }
  }
}

/* ------------------------------------------------------------------ building a section */

class Builder {
  nodes: Node[] = []
  private n = 0
  private seenActs = new Set<string>()
  readonly prefix: string
  readonly dep: CardDeploymentId
  constructor(prefix: string, dep: CardDeploymentId) {
    this.prefix = prefix
    this.dep = dep
  }

  id(act: string, suffix = '') {
    this.n += 1
    return `${this.prefix}-${act}${suffix}-${String(this.n).padStart(2, '0')}`
  }
  act(code: string, title: string, into: Node[] = this.nodes) {
    const id = `${this.prefix}-${code}`.toLowerCase()
    if (this.seenActs.has(id)) return
    this.seenActs.add(id)
    into.push({ kind: 'act', id, title })
  }
  page(
    into: Node[],
    act: string,
    name: string,
    el: ReactElement,
    seconds: number,
    extra: Partial<Screen> = {},
    suffix = '',
  ) {
    const id = this.id(act, suffix)
    into.push({ kind: 'screen', id, name, html: markup(el, id), seconds, ...extra })
  }
  step(into: Node[], runner: Runner, step: Step, suffix = '') {
    const act = ACT_NUMBER[step.act] ?? 'A0'
    if (!suffix) this.act(act, ACT_TITLE(step.act), into)
    const id = this.id(act, suffix)
    const el = h(StepView, {
      runner,
      step,
      ui: UI,
      demo: config.demo,
      onDone: () => {},
      submitState: 'idle',
      onSubmit: () => {},
      onWithdraw: () => {},
    })
    into.push({
      kind: 'screen',
      id,
      html: markup(el, id),
      seconds: secondsOf(step, this.dep),
      ...describe(step, runner),
    })
  }
}

/** Plays one step the way a calm player would, so later screens (recall, result) read naturally. */
function answer(r: Runner, s: Step) {
  if (s.kind === 'people')
    r.answer(
      s.p.card.type === 'allocation' ? { units: spread(s.p.card.pool ?? 0) } : { order: s.p.start },
    )
  else if (s.kind === 'ordinary')
    r.answer(s.d.options.slice().sort((a, b) => b.effect - a.effect)[0].id)
  else if (s.kind === 'screening') r.answer('2')
  else if (s.kind === 'survey') r.answer(2)
  else if (s.kind === 'inbox') r.answer({ label: 2, action: 'committee' })
  else if (s.kind === 'xw') r.answer('same')
  else if (s.kind === 'probe') r.answer(['descriptions'])
  else if (s.kind === 'demographics') r.answer({})
  else if (s.kind === 'submit') r.index += 1
  else r.answer(true)
}
const spread = (pool: number) =>
  [0, 1, 2, 3].map((i) => Math.floor(pool / 4) + (i < pool % 4 ? 1 : 0))

function preScreens(b: Builder, firm: boolean) {
  b.act('A0', 'Start')
  b.page(b.nodes, 'A0', 'Demo notice (demo mode only)', h(DemoNotice, { ui: UI }), 0, {
    note: 'Shown only in demo mode, before the disclosure, so the disclosure screen itself stays exactly the four sentences.',
  })
  b.page(
    b.nodes,
    'A0',
    'The four sentences',
    h(Disclosure, { langs: ['en', 'hinglish'], onContinue: () => {} }),
    T.four,
    {
      note: 'Registered text, nothing else on the screen. Players whose link lets them choose a language see both languages; a monolingual link shows one.',
      placeholder: 'The Hinglish wording is a draft, not yet pre-tested.',
    },
  )
  if (!firm) b.page(b.nodes, 'A0', 'Consent', h(Consent, { ui: UI, demo: config.demo }), T.consent)
  b.page(b.nodes, 'A0', 'Language', h(LanguageStep, { ui: UI, demo: config.demo }), T.language, {
    note: 'Shown when the link lets the player choose. Bilingual players then meet English and Hinglish cards, drawn per card.',
  })
}

function runPhase1(b: Builder, r: Runner) {
  while (!r.done) {
    const s = r.current as Step
    if (s.kind === 'screening' || r.steps.indexOf(s) >= r.session.phase1.length) break
    b.step(b.nodes, r, s)
    answer(r, s)
  }
}

const sig = (s: Step) =>
  JSON.stringify([
    s.kind,
    s.act,
    'which' in s ? s.which : '',
    'item' in s ? s.item.id : '',
    'id' in s ? s.id : '',
    'note' in s ? s.note : '',
    s.kind === 'people' ? s.p.card.id : '',
  ])

/** Splits two step lists into a shared prefix, two differing middles and a shared suffix. */
function diff(a: Step[], b: Step[]) {
  let p = 0
  while (p < a.length && p < b.length && sig(a[p]) === sig(b[p])) p++
  let q = 0
  while (
    q < a.length - p &&
    q < b.length - p &&
    sig(a[a.length - 1 - q]) === sig(b[b.length - 1 - q])
  )
    q++
  return {
    prefix: a.slice(0, p),
    a: a.slice(p, a.length - q),
    b: b.slice(p, b.length - q),
    suffix: a.slice(a.length - q),
  }
}

function wrapAndEnd(b: Builder, r: Runner, steps: Step[]) {
  for (const s of steps) {
    if (s.kind === 'code' && !r.code) continue
    b.step(b.nodes, r, s)
  }
  b.nodes.push({
    kind: 'branch',
    title: 'After Submit or Withdraw',
    note: 'The player chooses.',
    arms: [
      {
        label: 'Submit my answers',
        nodes: [
          screenOf(
            b,
            'A9',
            'Thank-you screen after submitting',
            h(Finished, { ui: UI, demo: config.demo, finished: 'submitted' }),
            0,
            's',
          ),
        ],
      },
      {
        label: 'Withdraw now',
        nodes: [
          screenOf(
            b,
            'A9',
            'Thank-you screen after withdrawing (nothing stored)',
            h(Finished, { ui: UI, demo: config.demo, finished: 'withdrawn' }),
            0,
            'w',
          ),
        ],
      },
    ],
  })
}

function screenOf(
  b: Builder,
  act: string,
  name: string,
  el: ReactElement,
  seconds: number,
  suffix = '',
  extra: Partial<Screen> = {},
): Screen {
  const tmp: Node[] = []
  b.page(tmp, act, name, el, seconds, extra, suffix)
  return tmp[0] as Screen
}

function stepsInto(b: Builder, r: Runner, steps: Step[], suffix: string): Node[] {
  const out: Node[] = []
  let last = ''
  for (const s of steps) {
    /* Act headings inside a branch, as the player meets them. */
    if (s.act !== last) {
      out.push({
        kind: 'act',
        id: `${b.prefix}-${ACT_NUMBER[s.act] ?? 'A0'}${suffix}-${b.nodes.length}-${out.length}`.toLowerCase(),
        title: ACT_TITLE(s.act),
      })
      last = s.act
    }
    b.step(out, r, s, suffix)
  }
  return out
}

/* ------------------------------------------------------------------ the three sessions */

function findSeed(dep: CardDeploymentId, ok: (r: Runner) => boolean, from = 1): number {
  for (let s = from; s < from + 5000; s++) if (ok(new Runner(seeded(s), dep, ['en']))) return s
  throw new Error(`no seed for ${dep}`)
}

async function game1(): Promise<Section> {
  const b = new Builder('G1', 'panel-g1')
  preScreens(b, false)
  /* R1's arm is drawn at entry. */
  const partial = (arm: string): Node[] => {
    const r = new Runner(
      seeded(findSeed('panel-g1', (x) => x.session.draws.arm === arm)),
      'panel-g1',
      ['en'],
    )
    const cards = r.session.phase1.filter((s) => s.kind === 'people')
    const sample = [
      cards.find((s) => s.kind === 'people' && !s.p.filler && !s.p.baseline),
      cards.find((s) => s.kind === 'people' && s.p.filler),
    ].filter(Boolean) as Step[]
    return stepsInto(b, r, sample, arm === 'PARTIAL-G' ? 'G' : 'A')
  }
  b.nodes.push({
    kind: 'branch',
    title: "R1's arm, drawn at entry",
    note: `FULL ${config.deployments['panel-g1'].r1?.FULL}, PARTIAL-G ${config.deployments['panel-g1'].r1?.['PARTIAL-G']}, PARTIAL-A ${config.deployments['panel-g1'].r1?.['PARTIAL-A']} (planning values). Partial-arm players play all 25 form A cards in their arm (the R1 filler cards are presented in full) and then go straight to the season wrap: no screening block, no Off the Record, no note.`,
    arms: [
      { label: 'FULL (the main path below)', nodes: [] },
      { label: 'PARTIAL-G: two example cards', nodes: partial('PARTIAL-G') },
      { label: 'PARTIAL-A: two example cards', nodes: partial('PARTIAL-A') },
    ],
  })
  const seed = findSeed('panel-g1', (x) => x.session.draws.arm === 'FULL')
  const r = new Runner(seeded(seed), 'panel-g1', ['en'])
  runPhase1(b, r)
  while (!r.done && (r.current as Step).kind === 'screening') {
    b.step(b.nodes, r, r.current as Step)
    answer(r, r.current as Step)
  }
  await r.prepareCode(1000)
  const rng = () => seeded(seed + 1)
  const low = phase2(r.session, 'standard', 'c', false, rng())
  const lowB = phase2(r.session, 'standard', 'b', false, rng())
  const m1h = phase2(r.session, 'm1h', null, false, rng())
  const high = phase2(r.session, 'high', null, false, rng())
  const wrapAt = (xs: Step[]) => xs.findIndex((s) => s.kind === 'probe')
  const lowBody = low.slice(0, wrapAt(low))
  const nd = diff(lowBody, lowB.slice(0, wrapAt(lowB)))
  const hd = diff(m1h.slice(0, wrapAt(m1h)), high.slice(0, wrapAt(high)))
  const lowNodes: Node[] = [
    ...stepsInto(b, r, nd.prefix, 'L'),
    {
      kind: 'branch',
      title: 'The note, drawn 1:1 for low scorers',
      note: 'The two notes have the same format and length; only the instruction differs.',
      arms: [
        { label: 'Faking arm: note (c)', nodes: stepsInto(b, r, nd.a, 'Lc') },
        { label: 'Honest-retake arm: note (b)', nodes: stepsInto(b, r, nd.b, 'Lb') },
      ],
    },
    ...stepsInto(b, r, nd.suffix, 'L'),
  ]
  const highNodes: Node[] = [
    ...stepsInto(b, r, hd.prefix, 'H'),
    {
      kind: 'branch',
      title: "M1-H's random subsample, drawn among high scorers",
      note: `Share drawn into the statement route: ${config.m1h.share} (planning value). The other high scorers answer neutral privacy items on the same number of screens, in the same formats; none of those answers is stored.`,
      arms: [
        {
          label:
            'M1-H subsample: control statements, the 12 statements in crosswise form, then the same 12 directly',
          nodes: stepsInto(b, r, hd.a, 'Hm'),
        },
        { label: 'Other high scorers: neutral privacy items', nodes: stepsInto(b, r, hd.b, 'Hn') },
      ],
    },
    ...stepsInto(b, r, hd.suffix, 'H'),
  ]
  b.nodes.push({
    kind: 'branch',
    title: 'The screening split',
    note: `A player whose screening fairness score is below ${config.split.lowBelow} (planning value; P1 fixes it at its pilot's 30th percentile) is a low scorer. Consent does not tell players that the route depends on these answers (M1's first named non-disclosure).`,
    arms: [
      {
        label: 'Low scorers (M1-L): honest survey, the note, rounds after the note, survey again',
        nodes: lowNodes,
      },
      { label: 'High scorers (M1-H): Off the Record', nodes: highNodes },
    ],
  })
  b.act('A9', `${ACT_TITLE('wrap')} (every route ends here)`)
  wrapAndEnd(b, r, low.slice(wrapAt(low)))
  return {
    id: 'g1',
    title: 'Panel game 1',
    intro:
      'E1, E2, A1, R1, M4(a), M4(c), M1-L, M1-H. One session of at most 30 minutes; three routes after form A.',
    nodes: b.nodes,
  }
}

async function game2(): Promise<Section> {
  const b = new Builder('G2', 'panel-g2')
  preScreens(b, false)
  const seed = 4
  const r = new Runner(seeded(seed), 'panel-g2', ['en'])
  runPhase1(b, r)
  await r.prepareCode(1000)
  const rng = () => seeded(seed + 1)
  const aRc = phase2(r.session, 'standard', 'a', true, rng())
  const aNo = phase2(r.session, 'standard', 'a', false, rng())
  const bNo = phase2(r.session, 'standard', 'b', false, rng())
  const wrapAt = aRc.findIndex((s) => s.kind === 'probe')
  const rc = diff(aRc.slice(0, wrapAt), aNo.slice(0, wrapAt))
  const nt = diff(
    aNo.slice(0, wrapAt),
    bNo.slice(
      0,
      bNo.findIndex((s) => s.kind === 'probe'),
    ),
  )
  for (const s of rc.prefix) b.step(b.nodes, r, s)
  b.nodes.push({
    kind: 'branch',
    title: 'Module RC, drawn per player',
    note: `Share taking module RC: ${config.rc.share} (planning value). Everyone else answers neutral privacy items on the same number of screens; those answers are not stored.`,
    arms: [
      { label: 'Module RC', nodes: stepsInto(b, r, rc.a, 'R') },
      { label: 'Everyone else: neutral privacy items', nodes: stepsInto(b, r, rc.b, 'N') },
    ],
  })
  const afterRc = nt.prefix.slice(rc.prefix.length + rc.b.length)
  for (const s of afterRc) b.step(b.nodes, r, s)
  b.nodes.push({
    kind: 'branch',
    title: 'The note, drawn 1:1 for every player (game 2 has no screening block)',
    note: 'The two notes have the same format, styling and length, and the same instruction; only the statistic differs.',
    arms: [
      { label: 'Truthful-message arm: note (a)', nodes: stepsInto(b, r, nt.a, 'a') },
      { label: 'Unrelated-statistic arm: note (b)', nodes: stepsInto(b, r, nt.b, 'b') },
    ],
  })
  for (const s of nt.suffix) b.step(b.nodes, r, s)
  wrapAndEnd(b, r, aRc.slice(wrapAt))
  return {
    id: 'g2',
    title: 'Panel game 2',
    intro:
      'M2, M3, M5, M4(b). One session of at most 30 minutes, one route with two drawn branches.',
    nodes: b.nodes,
  }
}

async function firm(): Promise<Section> {
  const b = new Builder('FE', 'firm')
  b.act('A0', 'Enrolment (at least three weeks before training)')
  b.page(
    b.nodes,
    'A0',
    'The four sentences',
    h(Disclosure, { langs: ['en', 'hinglish'], onContinue: () => {} }),
    T.four,
    { placeholder: 'The Hinglish wording is a draft, not yet pre-tested.' },
  )
  b.page(
    b.nodes,
    'A0',
    'Consent (firm)',
    h(Consent, { ui: UI, demo: config.demo, firm: true }),
    T.consent,
  )
  b.page(
    b.nodes,
    'A0',
    'Sex item and training batch',
    h(Enrol, { firm: DEMO_SCHEDULE.firm, preview: { step: 'form' } }),
    T.enrolment - T.four - T.consent,
    {
      varies:
        "The batches are the firm's published schedule (here a fictional firm). The sex item is optional and is carried onto the play record as a group label.",
    },
  )
  const done = (arm: 'before' | 'after'): Enrolment => {
    const date = DEMO_SCHEDULE.batches[0].date
    return {
      firm: DEMO_SCHEDULE.firm,
      batch: DEMO_SCHEDULE.batches[0].id,
      tdate: date,
      sex: 'woman',
      arm,
      ...windowFor(arm, date),
      s: 'enrolled',
    }
  }
  b.nodes.push({
    kind: 'branch',
    title: 'The play window, drawn at enrolment',
    note: "Blocked by firm and training month in permuted blocks of 2 or 4: within every firm-month the arms are equal at each block's completion. The enrolment code and window are examples.",
    arms: (['before', 'after'] as const).map((arm) => ({
      label:
        arm === 'before'
          ? 'Before training: 7 to 1 days before'
          : 'After training: 1 to 7 days after',
      nodes: [
        screenOf(
          b,
          'A0',
          'Enrolled: window and calendar file',
          h(Enrol, {
            firm: DEMO_SCHEDULE.firm,
            preview: { step: 'done', done: { code: 'DEMO2345CODE', e: done(arm) } },
          }),
          15,
          arm === 'before' ? 'B' : 'F',
          { varies: 'The enrolment code is random per player; this one is an example.' },
        ),
      ],
    })),
  })
  const p = new Builder('FP', 'firm')
  p.act('A0', 'Play session, inside the window')
  p.page(p.nodes, 'A0', 'Demo notice (demo mode only)', h(DemoNotice, { ui: UI }), 0)
  p.page(
    p.nodes,
    'A0',
    'The four sentences (every sitting)',
    h(Disclosure, { langs: ['en', 'hinglish'], onContinue: () => {} }),
    T.four,
  )
  p.page(p.nodes, 'A0', 'Language', h(LanguageStep, { ui: UI, demo: config.demo }), T.language)
  const r = new Runner(seeded(7), 'firm', ['en'], {
    timingArm: 'after',
    batchMonth: '2026-11',
    sex: 'woman',
  })
  runPhase1(p, r)
  await r.prepareCode(1000)
  const rest = r.steps.slice(r.index)
  const w = rest.findIndex((s) => s.kind === 'probe')
  for (const s of rest.slice(0, w)) p.step(p.nodes, r, s)
  wrapAndEnd(p, r, rest.slice(w))
  return {
    id: 'firm',
    title: 'Firm session',
    intro:
      'S6, D1, S2, S5. Enrolment, then one play session in the drawn window. Both timing arms play the same screens.',
    nodes: [...b.nodes, ...p.nodes],
  }
}

function outside(): Section {
  const b = new Builder('X', 'panel-g1')
  b.act('A1', 'The explanation page (opened with the withdrawal code)')
  b.page(b.nodes, 'A1', 'Code entry', h(Explain, {}), 0)
  b.page(
    b.nodes,
    'A1',
    'Before the release date',
    h(Explain, {
      preview: { kind: 'notYet', date: formatDate(releaseOf('panel-g1').releaseAt, 'en') },
    }),
    0,
  )
  b.page(
    b.nodes,
    'A1',
    'A code that is not recognised',
    h(Explain, { preview: { kind: 'bad' } }),
    0,
  )
  const ex = JSON.parse(
    readFileSync(join(ROOT, 'content/explanation.json'), 'utf8'),
  ) as Explanation[]
  b.nodes.push({
    kind: 'branch',
    title: 'After the release date: the scoring explanation, per deployment',
    note: 'Served from the database after release, never bundled in the app. Draft text for review.',
    arms: ex.map((e) => ({
      label: e.dep === 'season' ? 'Season story' : config.deployments[e.dep].label.en,
      nodes: [
        screenOf(
          b,
          'A1',
          `Scoring explanation, ${e.dep}`,
          h(Explain, { preview: { kind: 'open', dep: e.dep, ex: e } }),
          0,
          e.dep === 'firm' ? 'F' : e.dep === 'panel-g1' ? '1' : '2',
          {
            placeholder:
              e.dep === 'firm' ? undefined : 'Quotes the notes, whose statistics are placeholders.',
          },
        ),
      ],
    })),
  })
  b.act('A2', 'Withdrawal')
  b.page(b.nodes, 'A2', 'Code entry', h(Withdraw, {}), 0)
  b.page(b.nodes, 'A2', 'Records deleted', h(Withdraw, { preview: 'done' }), 0)
  b.page(b.nodes, 'A2', 'After withdrawal has closed', h(Withdraw, { preview: 'closed' }), 0)
  return {
    id: 'after',
    title: 'Pages outside a session',
    intro: 'Reached with the withdrawal code, after play.',
    nodes: b.nodes,
  }
}

/* ------------------------------------------------------------------ the page */

function countScreens(nodes: Node[]): number {
  return nodes.reduce(
    (n, x) =>
      n +
      (x.kind === 'screen'
        ? 1
        : x.kind === 'branch'
          ? x.arms.reduce((m, a) => m + countScreens(a.nodes), 0)
          : 0),
    0,
  )
}

function render(sec: Section, minutesTotal: string): string {
  let main = 0
  let mainSecs = 0
  const actLine = () => `screens so far ${main}, about ${(mainSecs / 60).toFixed(1)} min so far`
  const renderNodes = (nodes: Node[], onMain: boolean): string =>
    nodes
      .map((x) => {
        if (x.kind === 'act')
          return `<h3 class="wt-act" id="${x.id}">${esc(x.title)} <span class="wt-count">${onMain ? actLine() : ''}</span></h3>`
        if (x.kind === 'branch') {
          const arms = x.arms
            .map((a) => {
              let n = 0
              let secs = 0
              const walk = (ns: Node[]) =>
                ns.forEach((y) =>
                  y.kind === 'screen'
                    ? ((n += 1), (secs += y.seconds))
                    : y.kind === 'branch'
                      ? y.arms.forEach((z) => walk(z.nodes))
                      : null,
                )
              walk(a.nodes)
              return `<div class="wt-arm"><h4 class="wt-arm-title">${esc(a.label)} <span class="wt-count">${n ? `${n} screens on this branch, about ${(secs / 60).toFixed(1)} min` : ''}</span></h4>${a.note ? `<p class="wt-note">${esc(a.note)}</p>` : ''}${a.nodes.length ? renderNodes(a.nodes, false) : '<p class="wt-note">Continues below.</p>'}</div>`
            })
            .join('')
          return `<div class="wt-branch" id="${x.id}"><p class="wt-branch-title">Branch: ${esc(x.title)}</p><p class="wt-note">${esc(x.note)}</p>${arms}</div>`
        }
        if (onMain) {
          main += 1
          mainSecs += x.seconds
        }
        const labels = [
          x.placeholder
            ? `<p class="wt-tag wt-tag-placeholder">Placeholder: ${esc(x.placeholder)}</p>`
            : '',
          x.varies ? `<p class="wt-tag wt-tag-varies">Varies: ${esc(x.varies)}</p>` : '',
          x.note ? `<p class="wt-tag">${esc(x.note)}</p>` : '',
          x.after ? `<p class="wt-tag">${esc(x.after)}</p>` : '',
        ].join('')
        return `<article class="wt-screen" id="${x.id}"><div class="wt-meta"><p class="wt-id">${x.id}</p><p class="wt-name">${esc(x.name)}</p>${labels}</div><div class="wt-phone" inert>${x.html}</div></article>`
      })
      .join('')
  const body = renderNodes(sec.nodes, true)
  return `<section class="wt-section" id="${sec.id}"><header class="wt-section-head"><h2>${esc(sec.title)}</h2><p class="wt-count">${countScreens(sec.nodes)} screens in all branches; ${main} on the main path shown first; longest route about ${minutesTotal} min at ${T.secondsPerCard} s a card</p><p class="wt-intro">${esc(sec.intro)}</p></header>${body}</section>`
}

function toc(sections: Section[]): string {
  const acts = (nodes: Node[]): { id: string; title: string }[] =>
    nodes.flatMap((n) =>
      n.kind === 'act'
        ? [n]
        : n.kind === 'branch' && n.id
          ? [{ id: n.id, title: `Branch: ${n.title}` }]
          : [],
    )
  return `<nav class="wt-toc" aria-label="Contents"><p class="wt-toc-title">Contents</p><ol>${sections
    .map(
      (s) =>
        `<li><a href="#${s.id}">${esc(s.title)}</a><ol>${acts(s.nodes)
          .map((a) => `<li><a href="#${a.id}">${esc(a.title)}</a></li>`)
          .join('')}</ol></li>`,
    )
    .join('')}</ol></nav>`
}

function css(): string {
  const font = (f: string) =>
    `data:font/woff2;base64,${readFileSync(join(ROOT, 'public/fonts', f)).toString('base64')}`
  const fonts = readFileSync(join(ROOT, 'src/styles/fonts.css'), 'utf8').replace(
    /url\('\/fonts\/([^']+)'\)/g,
    (_, f: string) => `url('${font(f)}')`,
  )
  let tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8')
  /* The phone column is 390 px wide at every viewport: the app's wide-screen steps are dropped. */
  tokens = tokens.replace(/@media \(min-width: 600px\) \{[\s\S]*?\n\}\n/, '')
  tokens = tokens
    .replace(
      ":root:not([data-theme='light']) {\n    --c-bg: var(--night);",
      ":root:not([data-theme='light']) {\n    color-scheme: dark;\n    --c-bg: var(--night);",
    )
    .replace(
      ":root[data-theme='dark'] {\n  --c-bg: var(--night);",
      ":root[data-theme='dark'] {\n  color-scheme: dark;\n  --c-bg: var(--night);",
    )
  const ui = readdirSync(join(ROOT, 'src/ui'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(ROOT, 'src/ui', f), 'utf8'))
    .join('\n')
    .replace(/@media \(min-width: 600px\)/g, '@container phone (min-width: 600px)')
  const own = `
:root {
  --wt-bg: var(--paper);
  --wt-ink: var(--ink);
  --wt-muted: var(--soft);
  --wt-rule: var(--mist);
  --wt-frame: var(--line);
  --wt-tag: var(--tint);
  --wt-flag: #fdebb4;
  --wt-flag-ink: #3a2a00;
  --wt-branch: #e9e1f6;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
    --wt-bg: var(--night);
    --wt-ink: var(--moon);
    --wt-muted: var(--moon-soft);
    --wt-rule: var(--night-line);
    --wt-frame: var(--night-line);
    --wt-tag: var(--night-raised);
    --wt-flag: #4a3a10;
    --wt-flag-ink: #fdebb4;
    --wt-branch: #2c2045;
  }
}
:root[data-theme='dark'] {
  color-scheme: dark;
  --wt-bg: var(--night);
  --wt-ink: var(--moon);
  --wt-muted: var(--moon-soft);
  --wt-rule: var(--night-line);
  --wt-frame: var(--night-line);
  --wt-tag: var(--night-raised);
  --wt-flag: #4a3a10;
  --wt-flag-ink: #fdebb4;
  --wt-branch: #2c2045;
}
html, body { background: var(--wt-bg); color: var(--wt-ink); margin: 0; }
.wt-wrap { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 64px; max-width: 1120px; margin: 0 auto; font-family: var(--face-body); }
.wt-wrap h1, .wt-wrap h2, .wt-wrap h3, .wt-wrap h4 { font-family: var(--face-display); color: var(--wt-ink); line-height: 1.2; }
.wt-wrap h1 { font-size: 28px; margin: 0 0 8px; }
.wt-lead { color: var(--wt-muted); margin: 0 0 16px; max-width: 70ch; }
.wt-legend { display: grid; gap: 8px; margin: 0 0 24px; padding: 0; list-style: none; max-width: 70ch; }
.wt-legend li { color: var(--wt-ink); }
.wt-toc { border: 1px solid var(--wt-rule); border-radius: 12px; padding: 12px 16px; margin-bottom: 32px; }
.wt-toc-title { font-family: var(--face-display); font-weight: 600; margin: 0 0 8px; }
.wt-toc ol { margin: 0; padding-left: 20px; }
.wt-toc ol ol { columns: 2 220px; padding-left: 16px; margin: 4px 0 12px; }
.wt-toc a { color: var(--violet); }
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) .wt-toc a { color: var(--lilac); } }
:root[data-theme='dark'] .wt-toc a { color: var(--lilac); }
.wt-section { border-top: 3px solid var(--wt-ink); padding-top: 16px; margin-top: 48px; }
.wt-section-head h2 { font-size: 26px; margin: 0 0 4px; }
.wt-intro { margin: 4px 0 0; color: var(--wt-muted); }
.wt-count { font-family: var(--face-body); font-size: 14px; font-weight: 400; color: var(--wt-muted); margin: 0; }
.wt-act { font-size: 20px; margin: 40px 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--wt-rule); display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
.wt-screen { display: grid; grid-template-columns: minmax(0, 390px); gap: 8px; margin: 0 0 24px; }
@media (min-width: 860px) { .wt-screen { grid-template-columns: 390px minmax(0, 1fr); gap: 24px; } .wt-meta { order: 2; } }
.wt-meta { min-width: 0; }
.wt-id { font-family: var(--face-mono); font-weight: 700; margin: 0; }
.wt-name { font-family: var(--face-display); font-weight: 600; margin: 2px 0 8px; }
.wt-tag { background: var(--wt-tag); border-radius: 8px; padding: 6px 10px; margin: 0 0 6px; font-size: 14px; line-height: 1.4; overflow-wrap: anywhere; }
.wt-tag-placeholder { background: var(--wt-flag); color: var(--wt-flag-ink); }
.wt-tag-varies { border-left: 3px solid var(--violet); }
.wt-phone { container: phone / inline-size; width: 100%; max-width: 390px; border: 1px solid var(--wt-frame); border-radius: 20px; overflow: hidden; }
.wt-phone .page { min-height: 0; padding: 16px 16px 24px; }
.wt-branch { border: 2px solid var(--wt-frame); border-radius: 16px; padding: 12px; margin: 24px 0; background: var(--wt-bg); }
.wt-branch-title { font-family: var(--face-display); font-weight: 700; margin: 0 0 4px; }
.wt-note { color: var(--wt-muted); font-size: 15px; margin: 0 0 12px; max-width: 70ch; }
.wt-arm { border-left: 4px solid var(--violet); background: var(--wt-branch); border-radius: 0 12px 12px 0; padding: 8px 8px 8px 12px; margin: 12px 0; min-width: 0; }
.wt-arm-title { font-size: 17px; margin: 4px 0 8px; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
.wt-arm .wt-act { margin-top: 16px; }
`
  return `${fonts}\n${tokens}\n${ui}\n${own}`
}

async function main() {
  const sections = [await game1(), await game2(), await firm(), outside()]
  for (const sec of sections) {
    let k = 0
    const walk = (ns: Node[]) =>
      ns.forEach((n) => {
        if (n.kind === 'branch') {
          k += 1
          n.id = `${sec.id}-branch-${k}`
          n.arms.forEach((a) => walk(a.nodes))
        }
      })
    walk(sec.nodes)
  }
  const mins = (dep: CardDeploymentId) => (longest(estimate(dep)).total / 60).toFixed(1)
  const body = [
    render(sections[0], mins('panel-g1')),
    render(sections[1], mins('panel-g2')),
    render(sections[2], mins('firm')),
    render(sections[3], '0'),
  ].join('')
  const total = sections.reduce((n, s) => n + countScreens(s.nodes), 0)
  const html = `<title>Evaluator Question Walkthrough</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css()}</style>
<div class="wt-wrap">
<h1>Equal Lens Evaluator: every question, in order</h1>
<p class="wt-lead">Prototype v0, generated by <code>pnpm walkthrough</code> from the session engine and the content files on ${new Date().toISOString().slice(0, 10)}. ${total} screens across ${sections.length} sections. Each screen is drawn with the app's own components and styles, at phone width, as a player first sees it; quote a screen's ID in feedback.</p>
<ul class="wt-legend">
<li><strong>Demo content.</strong> Every card, incident and item is fictional and not yet pre-tested; names, surnames and cities are illustrative. Hinglish wording is a draft.</li>
<li><strong>Varies</strong> marks content the tool draws per player: the example shown is one seeded draw, not fixed content.</li>
<li><strong>Placeholder</strong> marks text that must be replaced before any participant sees it.</li>
<li><strong>Branch</strong> boxes show where routes split; screens inside a branch are seen only by players on it. Minutes use the plan's planning times at ${T.secondsPerCard} s a card.</li>
</ul>
${toc(sections)}
${body}
</div>
`
  writeFileSync(OUT, html)
  console.log(`walkthrough: ${OUT}, ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`)
  for (const s of sections) console.log(`  ${s.title}: ${countScreens(s.nodes)} screens`)
}

await main()
