import raw from '../../content/config.json'
import type { Family, T } from '../content/types'

export type DeploymentId = 'panel-g1' | 'panel-g2' | 'firm'
export const DEPLOYMENTS: DeploymentId[] = ['panel-g1', 'panel-g2', 'firm']
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
  targets: Record<DeploymentId, { formA?: FormCounts; formB?: FormCounts; inbox?: number }>
  deployments: Record<DeploymentId, DeploymentConfig>
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
  firmWindows: { beforeDays: [number, number]; afterDays: [number, number]; afterShare: number }
  code: { length: number; alphabet: string; kdfIterations: number }
  release: {
    minCell: number
    withdrawalDaysAfterRelease: number
    releaseAt: Record<DeploymentId, string>
  }
}

export const config = raw as unknown as Config
