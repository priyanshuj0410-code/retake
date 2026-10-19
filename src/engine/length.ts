/**
 * The session-length estimator: plan-scripts/cap_fit.py's timing model, read from
 * content/config.json, applied to each deployment's configured content. Deterministic.
 * It reports the longest route through each session, act by act, against the cap.
 */
import { config, type DeploymentId, type FormCounts } from './config'
import { bankCounts } from './bank-counts'

export interface ActTime {
  act: string
  seconds: number
}

export interface Estimate {
  deployment: DeploymentId
  route: string
  acts: ActTime[]
  total: number
  peopleCards: number
}

const t = (k: string) => {
  const v = config.timing[k]
  if (v === undefined) throw new Error(`timing.${k} missing from content/config.json`)
  return v
}

export const formCards = (f: FormCounts, baseline = config.baselinePerFamily) => {
  const opp = (f.opportunityPerSubstratum ?? 0) * 6
  const npt = f.npt ?? 0
  const con = (f.conductPerStratum ?? 0) * 2
  const plus = (n: number) => (n > 0 ? n + baseline : 0)
  return plus(opp) + plus(npt) + plus(con) + (f.rematch ?? 0)
}

const cardTime = (n: number, secondsPerCard: number) =>
  n * secondsPerCard + Math.floor(n / config.ordinaryPerPeopleCards) * t('ordinary')

export function estimate(
  dep: DeploymentId,
  secondsPerCard = t('secondsPerCard'),
  counts?: { formA?: FormCounts; formB?: FormCounts; inbox?: number },
): Estimate[] {
  const d = config.deployments[dep]
  const formA = counts?.formA ?? d.formA
  const formB = counts?.formB ?? d.formB
  const inbox = counts?.inbox ?? d.inbox
  const b = bankCounts()
  const surveyAnswers = b.surveyItems + b.surveyRepeats
  const firm = dep === 'firm'
  const hasNote = Object.keys(d.notes).length > 0

  const start: ActTime = {
    act: '0 start',
    seconds: t('four') + (firm ? 0 : t('consent')) + t('language'),
  }
  const tutorial: ActTime = { act: '1 first week', seconds: t('tutorial') }
  const nA = formCards(formA)
  const nB = formCards(formB)
  const actA: ActTime = { act: '2 your season (form A)', seconds: cardTime(nA, secondsPerCard) }
  const screening: ActTime = {
    act: '3 screening block',
    seconds: d.screening
      ? b.screeningDirect * t('screeningItem') + b.screeningVignettes * t('screeningVignette')
      : 0,
  }
  const survey1: ActTime = {
    act: '4 survey, first half (honest)',
    seconds: d.surveyFirstHalf ? surveyAnswers * t('surveyItem') : 0,
  }
  const practice =
    t('crosswiseInstructions') +
    2 * t('directItem') +
    3 * t('crosswiseItem') +
    t('anchor') +
    t('knownZero')
  const m1hRoute =
    (b.m1hControls + b.m1hStatements) * t('crosswiseItem') + b.m1hStatements * t('directItem')
  const m3Route = (b.m3Items + b.rcItems) * t('crosswiseItem')
  const inboxAct: ActTime = {
    act: '6 Committee Inbox',
    seconds: inbox > 0 ? t('contentNote') + inbox * t('inbox') : 0,
  }
  const note: ActTime = { act: '7 mid-season note', seconds: hasNote ? t('note') : 0 }
  const second: ActTime = {
    act: '8 rounds after the note (form B), survey, recall',
    seconds: hasNote
      ? cardTime(nB, secondsPerCard) +
        (d.surveySecondHalf ? surveyAnswers * t('surveyItem') : 0) +
        t('recall')
      : 0,
  }
  const direct: ActTime = {
    act: '8 direct block',
    seconds: d.directBlock ? (b.directItems + b.directRepeats) * t('blockItem') : 0,
  }
  const wrap: ActTime = {
    act: '9 season wrap',
    seconds:
      t('probe') +
      t('result') +
      (firm ? 3 : 2) * t('priorItem') +
      t('debrief') +
      t('code') +
      (firm ? 3 : 4) * t('demographicItem') +
      t('submit'),
  }
  const build = (route: string, acts: ActTime[], cards: number): Estimate => {
    const kept = acts.filter((a) => a.seconds > 0)
    return {
      deployment: dep,
      route,
      acts: kept,
      total: kept.reduce((s, a) => s + a.seconds, 0),
      peopleCards: cards,
    }
  }
  if (d.screening) {
    /* Game 1's three branches (plan v2 1.1). */
    return [
      build(
        'low scorers (M1-L)',
        [start, tutorial, actA, screening, survey1, note, second, wrap],
        nA + nB,
      ),
      build(
        'high scorers (M1-H route, others padded to it)',
        [
          start,
          tutorial,
          actA,
          screening,
          { act: '5 Off the Record', seconds: practice + m1hRoute },
          wrap,
        ],
        nA,
      ),
      build("R1's partial arms", [start, tutorial, actA, wrap], nA),
    ]
  }
  const otr: ActTime = {
    act: '5 Off the Record',
    seconds: d.offTheRecord === 'm3' ? practice + m3Route : 0,
  }
  return [
    build(
      'every player',
      [start, tutorial, actA, otr, inboxAct, note, firm ? direct : second, wrap],
      nA + (hasNote ? nB : 0),
    ),
  ]
}

export function enrolmentEstimate(): ActTime[] {
  return [
    { act: 'E four sentences', seconds: t('four') },
    { act: 'E consent', seconds: t('consent') },
    { act: 'E sex item, batch and window', seconds: t('enrolment') },
  ]
}

export const longest = (es: Estimate[]) => es.reduce((a, b) => (b.total > a.total ? b : a))
