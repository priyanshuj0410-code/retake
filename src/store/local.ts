/**
 * The demo store: the same tree and the same refusals as database.rules.json, held in memory
 * (and, in a browser, in this device's storage so a demo survives a reload). It lets the
 * prototype run with no backend at all, and the checks run without the emulator. Nothing in
 * it leaves the device. The real rules are tested against the emulator (scripts/rules-check.ts).
 */
import { DEPLOYMENTS, releaseOf as releaseOfConfig, type DeploymentId } from '../engine/config'
import type { CodeKeys } from '../engine/codes'
import { randomKey } from '../engine/rng'
import type { Submission } from '../engine/records'
import { formatPending, nextArm, parsePending, windowFor } from '../engine/firm'
import type { Rng } from '../engine/rng'
import type {
  Enrolment,
  EnrolmentBase,
  Explanation,
  LangSet,
  Release,
  Schedule,
  StartResult,
  Store,
} from './types'

export type Tree = Record<string, Record<string, unknown>>

export const releaseOf = (dep: DeploymentId): Release => releaseOfConfig(dep)

export const DEMO_SCHEDULE: Schedule = {
  firm: 'demo-firm',
  name: 'Demo firm (fictional)',
  batches: [
    { id: 'b1', label: 'Batch 1', date: '2026-11-16' },
    { id: 'b2', label: 'Batch 2', date: '2026-11-30' },
    { id: 'b3', label: 'Batch 3', date: '2026-12-14' },
  ],
}

export class LocalStore implements Store {
  readonly kind = 'local' as const
  tree: Tree
  private claim: { tok?: string; enrol?: string } | null = null

  private readonly now: () => number
  private readonly persist: { load(): Tree | null; save(t: Tree): void } | null
  private readonly explanationSource: (() => Promise<Explanation[] | null>) | null

  constructor(
    now: () => number = () => Date.now(),
    persist: { load(): Tree | null; save(t: Tree): void } | null = null,
    explanationSource: (() => Promise<Explanation[] | null>) | null = null,
  ) {
    this.now = now
    this.persist = persist
    this.explanationSource = explanationSource
    this.tree = persist?.load() ?? {}
    for (const n of [
      'eval-config',
      'eval-tokens',
      'eval-play',
      'eval-xw',
      'eval-demo',
      'eval-codes',
      'eval-enrol',
      'eval-alloc',
      'eval-schedule',
    ])
      this.tree[n] ??= {}
    for (const dep of DEPLOYMENTS) this.tree['eval-config'][dep] = releaseOf(dep)
    this.tree['eval-schedule'][DEMO_SCHEDULE.firm] = DEMO_SCHEDULE
  }

  private save() {
    this.persist?.save(this.tree)
  }

  async issueTokens(dep: DeploymentId, n: number, langs: LangSet) {
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const t = randomKey()
      this.tree['eval-tokens'][t] = { dep, langs, s: 'issued' }
      out.push(t)
    }
    this.save()
    return out
  }

  async start(token: string): Promise<StartResult> {
    const t = this.tree['eval-tokens'][token] as
      { dep: DeploymentId; langs: LangSet; s: string } | undefined
    if (!t) return { ok: false, reason: 'unknown' }
    if (t.s !== 'issued') return { ok: false, reason: 'used' }
    t.s = 'started'
    this.claim = { tok: token }
    this.save()
    return { ok: true, dep: t.dep, langs: t.langs }
  }

  async startEnrolment(enrolKey: string, today: string) {
    const e = this.tree['eval-enrol'][enrolKey] as Enrolment | undefined
    if (!e) return { ok: false as const, reason: 'unknown' as const }
    if (e.s !== 'enrolled') return { ok: false as const, reason: 'used' as const }
    if (today < e.from || today > e.to)
      return { ok: false as const, reason: 'window' as const, enrolment: e }
    e.s = 'started'
    this.claim = { enrol: enrolKey }
    this.save()
    return {
      ok: true as const,
      dep: 'firm' as const,
      langs: 'choose' as LangSet,
      enrolment: { ...e },
    }
  }

  async submit(codeKey: string, dep: DeploymentId, sub: Submission | null) {
    if (!this.claim) throw new Error('refused: no open session (a spent token cannot submit)')
    for (const [node, key] of [
      ['eval-codes', codeKey],
      ...(sub
        ? [
            ['eval-play', sub.play.key],
            ...sub.crosswise.map((c) => ['eval-xw', c.key]),
            ...sub.demographics.map((d) => ['eval-demo', d.key]),
          ]
        : []),
    ] as [string, string][])
      if (this.tree[node][key] !== undefined) throw new Error(`refused: ${node} key exists`)
    this.tree['eval-codes'][codeKey] = dep
    if (sub) {
      this.tree['eval-play'][sub.play.key] = structuredClone(sub.play.value)
      for (const c of sub.crosswise) this.tree['eval-xw'][c.key] = { ...c.value }
      for (const d of sub.demographics) this.tree['eval-demo'][d.key] = { ...d.value }
    }
    if (this.claim.tok) (this.tree['eval-tokens'][this.claim.tok] as { s: string }).s = 'done'
    if (this.claim.enrol) (this.tree['eval-enrol'][this.claim.enrol] as { s: string }).s = 'done'
    this.claim = null
    this.save()
  }

  async withdraw(keys: CodeKeys) {
    const dep = this.tree['eval-codes'][keys.code] as DeploymentId | undefined
    if (dep && this.now() > releaseOf(dep).deleteUntil)
      throw new Error('refused: withdrawal closed')
    let n = 0
    const del = (node: string, k: string) => {
      if (this.tree[node][k] !== undefined) {
        delete this.tree[node][k]
        n += 1
      }
    }
    del('eval-play', keys.play)
    keys.xw.forEach((k) => del('eval-xw', k))
    keys.demo.forEach((k) => del('eval-demo', k))
    this.save()
    return n
  }

  async codeKnown(codeKey: string) {
    return (this.tree['eval-codes'][codeKey] as DeploymentId | undefined) ?? null
  }

  async release(dep: DeploymentId) {
    return releaseOf(dep)
  }

  async explanation(dep: DeploymentId) {
    if (this.now() < releaseOf(dep).releaseAt) return null
    const all = (await this.explanationSource?.()) ?? null
    return all?.find((e) => e.dep === dep) ?? null
  }

  async schedule(firm: string) {
    return (this.tree['eval-schedule'][firm] as Schedule | undefined) ?? null
  }

  async enrol(enrolKey: string, base: EnrolmentBase, rng: Rng) {
    if (this.tree['eval-enrol'][enrolKey] !== undefined)
      throw new Error('refused: enrolment exists')
    const month = base.tdate.slice(0, 7)
    const block = `${base.firm}/${month}`
    const next = nextArm(parsePending(this.tree['eval-alloc'][block] as string | undefined), rng)
    const e: Enrolment = {
      ...base,
      arm: next.arm,
      ...windowFor(next.arm, base.tdate),
      s: 'enrolled',
    }
    this.tree['eval-enrol'][enrolKey] = { ...e }
    const state = formatPending(next.pending)
    if (state) this.tree['eval-alloc'][block] = state
    else delete this.tree['eval-alloc'][block]
    this.save()
    return e
  }
}
