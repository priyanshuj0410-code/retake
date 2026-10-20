/**
 * The profile's readings pooled across seasons (EVAL-12, owner; research design v25 section 3.18
 * and 3.20, every value PENDING v26 in config.season.profile).
 *
 * Each saved season keeps, per reading, three counts over its equal-description pairs: the focal
 * group first (women; darker skin tones; Muslim colleagues), the comparison group first, and
 * neither. A season's estimate is the posterior mean of the share with the focal group first
 * under config.season.rating.range's prior, with that posterior's variance. The profile pools
 * the seasons since the last restart: with equal weights (v25; `pooling: 'equal'`, the pooled
 * variance the sum of the variances over k squared) or by inverse variance (v22, withdrawn in
 * v23; kept as the config's other value). The pooled range is the estimate plus or minus the
 * normal quantile for `range.mass` standard errors, and the pooled level reads the same quantiles
 * as one season (config.season.rating.levels) on the two-sided normal p of the estimate against
 * an even share.
 *
 * The faster change rule (v23, the applicant's OQ-27; restart after the firing season since v24):
 * the latest season's women-and-men estimate against the pool before it, the difference over the
 * root of the sum of their variances, against `reliableChange`. When it fires, that season is the
 * change, shown untagged and not pooled, and the pool starts again on the next season. One
 * restart point serves every reading. A reading is tagged only once the seasons pooled since the
 * restart reach its registered count (`opens`); before that it shows its range, hollow, and
 * "Tagged after N more seasons on your profile", N the count less the seasons pooled, never a
 * projection per player.
 */
import { config, type ProfileReadingId } from '../engine/config'
import type { Level } from './rating'
import { normalQuantile, type Counts } from './range'

export interface Estimate {
  /** The share with the focal group first, 0 to 1. */
  at: number
  /** Its variance. */
  v: number
  /** Pairs behind it. */
  n: number
}

export interface PooledReading {
  id: ProfileReadingId
  /** The registered season count; null when no count meets the targets yet. */
  opens: number | null
  /** Seasons pooled since the last restart that carry this reading. */
  seasons: number
  /** Seasons still to pool before it can be tagged; null when it has no count yet. */
  toTag: number | null
  tagged: boolean
  level: Level
  towards?: 'focal' | 'comparison'
  /** The pooled position and range; null with no pairs pooled. */
  at: number | null
  lo: number | null
  hi: number | null
}

export interface TrendPoint {
  /** The season's index in the profile. */
  season: number
  at: number
  lo: number
  hi: number
  /** The faster change rule fired on this season: the point is that season alone, untagged. */
  change: boolean
  /** Seasons in the pool after this season (0 after a change). */
  pooled: number
}

/** What a saved season holds for the pooling: its per-reading counts (older saves: sex only). */
export interface PoolSeason {
  counts?: Counts
  readings?: Partial<Record<ProfileReadingId, Counts>>
}

const clamp = (x: number) => Math.min(1, Math.max(0, x))

/** The standard normal distribution function (Abramowitz and Stegun 7.1.26 on erf). */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x)
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2
}

/** One season's estimate for one reading: the Beta posterior's mean and variance. */
export function estimateOf(c: Counts | undefined): Estimate | null {
  if (!c) return null
  const n = c.w + c.m + c.e
  if (n <= 0) return null
  const [pa, pb] = config.season.rating.range.prior
  const a = pa + c.w + c.e / 2
  const b = pb + c.m + c.e / 2
  const s = a + b
  return { at: a / s, v: (a * b) / (s * s * (s + 1)), n }
}

/** Seasons' estimates combined by the configured weights. */
export function pool(es: Estimate[], how = config.season.profile.pooling): Estimate | null {
  if (!es.length) return null
  const n = es.reduce((t, e) => t + e.n, 0)
  if (how === 'inverse-variance') {
    const w = es.map((e) => 1 / e.v)
    const sw = w.reduce((t, x) => t + x, 0)
    return { at: es.reduce((t, e, i) => t + w[i] * e.at, 0) / sw, v: 1 / sw, n }
  }
  const k = es.length
  return {
    at: es.reduce((t, e) => t + e.at, 0) / k,
    v: es.reduce((t, e) => t + e.v, 0) / (k * k),
    n,
  }
}

/** The range around an estimate, holding config.season.rating.range.mass. */
export function rangeOf(e: Estimate): { lo: number; hi: number } {
  const z = normalQuantile(1 - (1 - config.season.rating.range.mass) / 2)
  const h = z * Math.sqrt(e.v)
  return { lo: clamp(e.at - h), hi: clamp(e.at + h) }
}

/** The pooled level, from the reading levels in config (the same quantiles as one season). */
export function levelOf(e: Estimate, minPairs = config.season.rating.minPairs): Level {
  if (e.n < minPairs) return 'unread'
  const z = (e.at - 0.5) / Math.sqrt(e.v)
  const p = 2 * (1 - normalCdf(Math.abs(z)))
  const lv = config.season.rating.levels
  if (z === 0) return 'none'
  if (p <= 1 - lv.strong) return 'strong'
  if (p <= 1 - lv.moderate) return 'moderate'
  if (p <= 1 - lv.possible) return 'possible'
  return 'none'
}

const countsOf = (s: PoolSeason, id: ProfileReadingId): Counts | undefined =>
  s.readings?.[id] ?? (id === 'sex' ? s.counts : undefined)

/** The faster change rule on one season against a pool: true when it fires. */
export function changed(latest: Estimate, before: Estimate): boolean {
  const d = (latest.at - before.at) / Math.sqrt(latest.v + before.v)
  return Math.abs(d) > config.season.profile.reliableChange
}

/**
 * The profile's seasons in order under the change rule: which are pooled now, whether the latest
 * season fired a change, and the pooled women-and-men reading after each season (the trend).
 */
export function walk(sessions: PoolSeason[]) {
  let current: number[] = []
  const trend: TrendPoint[] = []
  const changes: number[] = []
  const sexOf = (i: number) => estimateOf(countsOf(sessions[i], 'sex'))
  sessions.forEach((_, i) => {
    const e = sexOf(i)
    const before = pool(current.map(sexOf).filter((x): x is Estimate => !!x))
    if (e && before && changed(e, before)) {
      changes.push(i)
      current = []
      trend.push({ season: i, at: e.at, ...rangeOf(e), change: true, pooled: 0 })
      return
    }
    current = [...current, i]
    const now = pool(current.map(sexOf).filter((x): x is Estimate => !!x))
    if (now)
      trend.push({ season: i, at: now.at, ...rangeOf(now), change: false, pooled: current.length })
  })
  const last = sessions.length - 1
  return { pooled: current, changes, latestChanged: changes.includes(last) && last >= 0, trend }
}

/** "You now": every reading pooled over the seasons since the last restart. */
export function profileNow(sessions: PoolSeason[]) {
  const w = walk(sessions)
  const readings: PooledReading[] = config.season.profile.readings.map(({ id, opens }) => {
    const es = w.pooled
      .map((i) => estimateOf(countsOf(sessions[i], id)))
      .filter((x): x is Estimate => !!x)
    const seasons = es.length
    const p = pool(es)
    const minPairs =
      id === 'sex' || id === 'tone' || id === 'religion'
        ? config.season.rating.minPairs
        : config.season.domains.minPairs
    const level: Level = p ? levelOf(p, minPairs) : 'unread'
    const r = p ? rangeOf(p) : null
    const tagged = opens !== null && seasons >= opens && level !== 'unread'
    return {
      id,
      opens,
      seasons,
      toTag: opens === null ? null : Math.max(0, opens - seasons),
      tagged,
      level,
      ...(p && level !== 'none' && level !== 'unread'
        ? { towards: p.at > 0.5 ? ('focal' as const) : ('comparison' as const) }
        : {}),
      at: p?.at ?? null,
      lo: r?.lo ?? null,
      hi: r?.hi ?? null,
    }
  })
  return { ...w, readings }
}
