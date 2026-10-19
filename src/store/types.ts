import type { Rng } from '../engine/rng'
import type { DeploymentId } from '../engine/config'
import type { CodeKeys } from '../engine/codes'
import type { Submission } from '../engine/records'

export type LangSet = 'en' | 'hinglish' | 'both' | 'choose'

export type StartResult =
  | { ok: true; dep: DeploymentId; langs: LangSet }
  | { ok: false; reason: 'used' | 'unknown' | 'offline' | 'window' }

export interface Release {
  releaseAt: number
  deleteUntil: number
}

export interface Explanation {
  dep: DeploymentId
  sections: {
    heading: { en: string; hinglish: string }
    body: { en: string; hinglish: string }[]
  }[]
}

export interface Schedule {
  firm: string
  name: string
  batches: { id: string; label: string; date: string }[]
}

export interface Enrolment {
  firm: string
  batch: string
  tdate: string
  arm: 'before' | 'after'
  from: string
  to: string
  month: string
  sex: string
  s: 'enrolled' | 'started' | 'done'
}

export type EnrolmentBase = Pick<Enrolment, 'firm' | 'batch' | 'tdate' | 'sex'>

export interface Store {
  readonly kind: 'local' | 'emulator' | 'firebase'
  /** Spends a one-time token: issued to started. A started or done token is refused. */
  start(token: string): Promise<StartResult>
  /** Spends a firm enrolment for its one play session, inside its play window. */
  startEnrolment(enrolKey: string, today: string): Promise<StartResult & { enrolment?: Enrolment }>
  /** One write: the records (or none, for a player who withdraws at once), the code's key, and the token to done. */
  submit(codeKey: string, dep: DeploymentId, sub: Submission | null): Promise<void>
  /** Deletes every record carrying the code, in every store. Returns how many were found. */
  withdraw(keys: CodeKeys): Promise<number>
  codeKnown(codeKey: string): Promise<DeploymentId | null>
  release(dep: DeploymentId): Promise<Release>
  /** The scoring explanation: null until the deployment's release date. */
  explanation(dep: DeploymentId): Promise<Explanation | null>
  schedule(firm: string): Promise<Schedule | null>
  /**
   * Enrols a player: draws the timing arm from the firm-month's block (blocked randomisation,
   * src/engine/firm.ts) with `rng`, writes the enrolment and the block's new state in
   * one write, and returns the enrolment with its arm and window.
   */
  enrol(enrolKey: string, base: EnrolmentBase, rng: Rng): Promise<Enrolment>
  /** Demo only: issue tokens the way a panel provider's links would carry them. */
  issueTokens(dep: DeploymentId, n: number, langs: LangSet): Promise<string[]>
}
