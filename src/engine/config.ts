import raw from '../../content/config.json'
import type { Family, T } from '../content/types'

/** The card-engine deployments of research plan v2 (src/engine/session.ts). */
export type CardDeploymentId = 'panel-g1' | 'panel-g2' | 'firm'
export const DEPLOYMENTS: CardDeploymentId[] = ['panel-g1', 'panel-g2', 'firm']
/** Every deployment a token or a record can carry: the card games and the season story (src/story/). */
export type DeploymentId = CardDeploymentId | 'season'
export const ALL_DEPLOYMENTS: DeploymentId[] = [...DEPLOYMENTS, 'season']
export type NoteId = 'a' | 'b' | 'c'
export type R1Arm = 'FULL' | 'PARTIAL-G' | 'PARTIAL-A'

export interface FormCounts {
  opportunityPerSubstratum?: number
  npt?: number
  conductPerStratum?: number
  rematch?: number
}

export interface DeploymentConfig {
  label: T
  formA: FormCounts
  formB: FormCounts
  formBBank?: 'A' | 'B'
  conductBank?: 'AB'
  screening: boolean
  surveyFirstHalf: boolean
  surveySecondHalf: boolean
  offTheRecord: 'm1h' | 'm3' | 'none'
  inbox: number
  notes: Partial<Record<'low' | 'all', Partial<Record<NoteId, number>>>>
  rematchFamily?: Family
  directBlock: boolean
  r1?: Record<R1Arm, number>
  r1Fillers?: string[]
  demographics: boolean
}

export interface Config {
  version: string
  demo: boolean
  timing: Record<string, number>
  targets: Record<CardDeploymentId, { formA?: FormCounts; formB?: FormCounts; inbox?: number }>
  deployments: Record<CardDeploymentId, DeploymentConfig>
  baselinePerFamily: number
  ordinaryPerPeopleCards: number
  tutorialOrdinary: number
  survey: { scalePoints: number }
  inbox: { scalePoints: number }
  split: { lowBelow: number }
  m1h: { share: number }
  m3: { q: number; permutations: number }
  engagement: { alpha: number; permutations: number }
  rc: { share: number }
  crosswise: { lowSubsampleShare: number }
  firmWindows: { beforeDays: [number, number]; afterDays: [number, number]; blockSizes: number[] }
  code: { length: number; alphabet: string; kdfIterations: number }
  release: {
    minCell: number
    withdrawalDaysAfterRelease: number
    releaseAt: Record<DeploymentId, string>
  }
  season: SeasonConfig
}

/** The season story's planning values: every key in pendingV17 is PENDING v17. */
export interface SeasonConfig {
  pendingV17: string[]
  castSize: number
  weeks: number
  splitCap: number
  rating: { q: number; minPairs: number; engagementMin: number }
  timing: Record<string, number>
  change: { minDiff: number }
  retakeGapDays: number | null
  episodes: number
  decisionsPerEpisode: number
  cards: { minPairs: number; share: number }
}

export const config = raw as unknown as Config

const DAY = 86_400_000

/** A deployment's release and the end of its withdrawal window, both from `config.release`:
    the one source of every date the code screen, the explanation and withdrawal pages, the
    stores and the database rules show or enforce. */
export const releaseOf = (dep: DeploymentId) => {
  const releaseAt = Date.parse(`${config.release.releaseAt[dep]}T00:00:00+05:30`)
  return { releaseAt, deleteUntil: releaseAt + config.release.withdrawalDaysAfterRelease * DAY }
}

/** A date as players read it: "15 March 2027", India time. */
export const formatDate = (ms: number, lang: 'en' | 'hinglish') =>
  new Date(ms).toLocaleDateString(lang === 'hinglish' ? 'en-IN' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
