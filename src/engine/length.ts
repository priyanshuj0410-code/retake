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
  n * secondsPerCard + Math.ceil(n / config.ordinaryPerPeopleCards) * t('ordinary')

export function estimate(dep: DeploymentId, secondsPerCard = t('secondsPerCard'), counts?: { formA?: FormCounts; formB?: FormCounts; inbox?: number }): Estimate[] {
  const d = config.deployments[dep]
  const formA = counts?.formA ?? d.formA
  const formB = counts?.formB ?? d.formB
  const inbox = counts?.inbox ?? d.inbox
  const b = bankCounts()
  const surveyAnswers = b.surveyItems + b.surveyRepeats
  const firm = dep === 'firm'

  const start: ActTime = { act: '0 start', seconds: t('four') + (firm ? 0 : t('consent')) + t('language') }
  const tutorial: ActTime = { act: '1 first week', seconds: t('tutorial') }
  const nA = formCards(formA)
  const nB = formCards(formB)
  const actA: ActTime = { act: '2 your season (form A)', seconds: cardTime(nA, secondsPerCard) }
  const screening: ActTime = {
    act: '3 screening block',
    seconds: d.screening ? b.screeningDirect * t('screeningItem') + b.screeningVignettes * t('screeningVignette') : 0,
  }
  const survey1: ActTime = { act: '4 survey, first half', seconds: d.surveyFirstHalf ? surveyAnswers * t('surveyItem') : 0 }
  const practice = t('crosswiseInstructions') + 2 * t('directItem') + 3 * t('crosswiseItem') + t('anchor') + t('knownZero')
  const m1hRoute = (b.m1hControls + b.m1hStatements) * t('crosswiseItem') + b.m1hStatements * t('directItem')
  const m3Route = (b.m3Items + b.rcItems) * t('crosswiseItem')
  const otrRoute = d.offTheRecord === 'm1h' ? m1hRoute : d.offTheRecord === 'm3' ? m3Route : 0
  const inboxAct: ActTime = { act: '6 Committee Inbox', seconds: inbox > 0 ? t('contentNote') + inbox * t('inbox') : 0 }
  const note: ActTime = { act: '7 mid-season note', seconds: Object.keys(d.notes).length > 0 ? t('note') : 0 }
  const second: ActTime = {
    act: '8 rounds after the note (form B), survey, recall',
    seconds:
      cardTime(nB, secondsPerCard) +
      (d.surveySecondHalf ? surveyAnswers * t('surveyItem') : 0) +
      (Object.keys(d.notes).length > 0 ? t('recall') : 0),
  }
  const direct: ActTime = { act: '8 direct block', seconds: d.directBlock ? (b.directItems + b.directRepeats) * t('blockItem') : 0 }
  const wrap: ActTime = {
    act: '9 season wrap',
    seconds:
      t('probe') + t('result') + (firm ? 3 : 2) * t('priorItem') + t('debrief') + t('code') + (firm ? 3 : 4) * t('demographicItem') + t('submit'),
  }

  const build = (route: string, otr: number, skipSecond: boolean): Estimate => {
    const acts = [
      start,
      tutorial,
      actA,
      screening,
      survey1,
      { act: '5 Off the Record', seconds: otr },
      inboxAct,
      skipSecond ? { ...note, seconds: 0 } : note,
      firm ? direct : skipSecond ? { ...second, seconds: 0 } : second,
      wrap,
    ].filter((a) => a.seconds > 0)
    return { deployment: dep, route, acts, total: acts.reduce((s, a) => s + a.seconds, 0), peopleCards: nA + (skipSecond || firm ? 0 : nB) }
  }

  if (d.offTheRecord === 'm1h' && d.m1hSkipsSecondHalf) {
    /* Plan v1 4.4 alternative (A): no act-4 padding, and M1-H's players skip the second half.
       Every other player has no crosswise item in this game, so no Off the Record either. */
    return [build('M1-H route (skips the second half)', practice + m1hRoute, true), build('every other route (no Off the Record)', 0, false)]
  }
  return [build(d.offTheRecord === 'none' ? 'the one route' : 'every route, padded to the longest', d.offTheRecord === 'none' ? 0 : practice + otrRoute, false)]
}

export function enrolmentEstimate(): ActTime[] {
  return [
    { act: 'E four sentences', seconds: t('four') },
    { act: 'E consent', seconds: t('consent') },
    { act: 'E sex item, batch and window', seconds: t('enrolment') },
  ]
}

export const longest = (es: Estimate[]) => es.reduce((a, b) => (b.total > a.total ? b : a))
