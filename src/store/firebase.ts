/**
 * The Realtime Database store on the shared project the-equal-lens, every node prefixed
 * eval-. Used against the emulator (demo-eval) in this prototype; the live project is used
 * only after the rules piece is deployed by the owner from The Equal Lens repo's firebase/
 * folder (knowledge/playbooks/firebase.md). Every device signs in anonymously, with nothing
 * asked, so the rules have a user id to hold a session's claim; the id is never written into
 * any record.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import { connectDatabaseEmulator, get, getDatabase, ref, update, type Database } from 'firebase/database'
import type { DeploymentId } from '../engine/config'
import type { CodeKeys } from '../engine/codes'
import type { Submission } from '../engine/records'
import type { Enrolment, Explanation, LangSet, Release, Schedule, StartResult, Store } from './types'

export interface FirebaseSettings {
  apiKey: string
  projectId: string
  databaseURL: string
  emulator?: { host: string; dbPort: number; authPort: number }
}

export class FirebaseStore implements Store {
  readonly kind: 'emulator' | 'firebase'
  private app: FirebaseApp
  private db: Database
  private auth: Auth
  private claimed: { tok?: string; enrol?: string } | null = null

  constructor(s: FirebaseSettings) {
    this.kind = s.emulator ? 'emulator' : 'firebase'
    this.app = initializeApp({ apiKey: s.apiKey, projectId: s.projectId, databaseURL: s.databaseURL }, `eval-${Math.random()}`)
    this.db = getDatabase(this.app)
    this.auth = getAuth(this.app)
    if (s.emulator) {
      connectDatabaseEmulator(this.db, s.emulator.host, s.emulator.dbPort)
      connectAuthEmulator(this.auth, `http://${s.emulator.host}:${s.emulator.authPort}`, { disableWarnings: true })
    }
  }

  private async uid(): Promise<string> {
    if (!this.auth.currentUser) await signInAnonymously(this.auth)
    return (this.auth.currentUser as { uid: string }).uid
  }

  private async read<T>(path: string): Promise<T | null> {
    await this.uid()
    const snap = await get(ref(this.db, path))
    return snap.exists() ? (snap.val() as T) : null
  }

  async start(token: string): Promise<StartResult> {
    try {
      const uid = await this.uid()
      const t = await this.read<{ dep: DeploymentId; langs: LangSet; s: string }>(`eval-tokens/${token}`)
      if (!t) return { ok: false, reason: 'unknown' }
      if (t.s !== 'issued') return { ok: false, reason: 'used' }
      await update(ref(this.db), { [`eval-tokens/${token}/s`]: 'started', [`eval-claims/${uid}`]: { tok: token } })
      this.claimed = { tok: token }
      return { ok: true, dep: t.dep, langs: t.langs }
    } catch (e) {
      return { ok: false, reason: String(e).includes('PERMISSION_DENIED') ? 'used' : 'offline' }
    }
  }

  async startEnrolment(enrolKey: string, today: string) {
    try {
      const uid = await this.uid()
      const e = await this.read<Enrolment>(`eval-enrol/${enrolKey}`)
      if (!e) return { ok: false as const, reason: 'unknown' as const }
      if (e.s !== 'enrolled') return { ok: false as const, reason: 'used' as const }
      if (today < e.from || today > e.to) return { ok: false as const, reason: 'window' as const, enrolment: e }
      await update(ref(this.db), { [`eval-enrol/${enrolKey}/s`]: 'started', [`eval-claims/${uid}`]: { enrol: enrolKey } })
      this.claimed = { enrol: enrolKey }
      return { ok: true as const, dep: 'firm' as const, langs: 'choose' as LangSet, enrolment: e }
    } catch {
      return { ok: false as const, reason: 'offline' as const }
    }
  }

  async submit(codeKey: string, dep: DeploymentId, sub: Submission | null) {
    const uid = await this.uid()
    if (!this.claimed) throw new Error('refused: no open session')
    const w: Record<string, unknown> = { [`eval-codes/${codeKey}`]: dep, [`eval-claims/${uid}`]: null }
    if (this.claimed.tok) w[`eval-tokens/${this.claimed.tok}/s`] = 'done'
    if (this.claimed.enrol) w[`eval-enrol/${this.claimed.enrol}/s`] = 'done'
    if (sub) {
      w[`eval-play/${sub.play.key}`] = sub.play.value
      for (const c of sub.crosswise) w[`eval-xw/${c.key}`] = c.value
      for (const d of sub.demographics) w[`eval-demo/${d.key}`] = d.value
    }
    await update(ref(this.db), w)
    this.claimed = null
  }

  async withdraw(keys: CodeKeys) {
    await this.uid()
    /* Reads are refused on every record store, so the count is of keys the code derives. */
    const w: Record<string, null> = { [`eval-play/${keys.play}`]: null }
    for (const k of keys.xw) w[`eval-xw/${k}`] = null
    for (const k of keys.demo) w[`eval-demo/${k}`] = null
    await update(ref(this.db), w)
    return Object.keys(w).length
  }

  async codeKnown(codeKey: string) {
    try {
      return await this.read<DeploymentId>(`eval-codes/${codeKey}`)
    } catch {
      return null
    }
  }

  async release(dep: DeploymentId) {
    return (await this.read<Release>(`eval-config/${dep}`)) ?? { releaseAt: Infinity, deleteUntil: 0 }
  }

  async explanation(dep: DeploymentId) {
    try {
      return await this.read<Explanation>(`eval-explain/${dep}`)
    } catch {
      return null
    }
  }

  async schedule(firm: string) {
    return this.read<Schedule>(`eval-schedule/${firm}`)
  }

  async enrol(enrolKey: string, e: Enrolment) {
    await this.uid()
    await update(ref(this.db), { [`eval-enrol/${enrolKey}`]: e })
  }

  async issueTokens(): Promise<string[]> {
    throw new Error('tokens are issued by the panel provider or scripts/seed-emulator.ts, never by a device')
  }
}
