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

/** The season story's planning values: every key in pendingV18 is PENDING v18. */
export interface SeasonConfig {
  pendingV18: string[]
  castSize: number
  weeks: number
  splitCap: number
  rating: {
    /** Permutation quantiles of the five reading levels (owner decision O2; PENDING v20, never player copy). */
    levels: { strong: number; moderate: number; possible: number }
    minPairs: number
    engagementMin: number
    permutations: number
    /** The position-with-range display's maths (EVAL-10; PENDING v22, never player copy). */
    range: { method: 'beta' | 'wilson'; prior: [number, number]; mass: number }
  }
  counted: Record<string, number>
  faking: { screening: string[]; survey: string[]; formB: number }
  route: 'low'
  cueCarriers: { cast: string[]; oneOff: string[] }
  domains: { minPairs: number }
  timing: Record<string, number>
  change: { minDiff: number }
  retakeGapDays: number | null
  episodes: number
  cards: { minPairs: number; share: number }
  /** The season in five chapters and a finale (owner, 20 Oct 2026; every value PENDING v21). */
  chapters: {
    count: number
    finale: boolean
    saveDays: number
    sittingsMax: number
    captionWords: number
    ordinaryKept: string[]
    payoffSlots: [number, number]
  }
}

export const config = raw as unknown as Config

/*
 * The season disclosure's sentence 3. Registered sentence 3 ("Attitudes are read, for groups
 * only.") is not true for the season, which shows each player their own rating. This interim
 * line AWAITS THE OWNER'S WORDING (owner decision, 19 Oct 2026); until it arrives the player
 * sees this line, never a placeholder (scripts/pending-check.ts, X-16).
 */
export const seasonSentence3 = {
  en: 'Attitudes are read; you see yours.',
  hinglish: 'Attitudes padhe jaate hain; aapko apne dikhte hain.',
} as const

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

/**
 * The old card games (panel games 1 and 2, the firm session and its enrolment) and the demo
 * menu that starts them are kept for the checks only (EVAL-6, owner decision 19 Oct 2026): they
 * open on the Vite dev server in demo mode, and no player-facing page links to them.
 */
export const devRoutes = (): boolean => !!import.meta.env?.DEV && config.demo
