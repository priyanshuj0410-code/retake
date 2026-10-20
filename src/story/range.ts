/**
 * Where a season's result sits on the men-first to women-first line, and the range around it
 * (EVAL-10, the owner's position-with-range display). Out of the pairs where a woman and a man
 * had equally strong descriptions, the position is the share in which the woman came first,
 * an even share counting half: 0 is men first every time, 1 women first every time, the
 * middle about equal.
 *
 * The range maths lives in config.season.rating.range (PENDING v22, which redesigns the reading
 * to strict targets and will likely use a posterior model), never in player copy:
 *   - `beta`: the equal-tailed interval holding `mass` of a Beta(prior + women first, prior +
 *     men first) posterior, each even pair adding half to both sides;
 *   - `wilson`: the Wilson score interval at the normal quantile for `mass`.
 * No time, no answer and no name enters it: three counts only.
 */
import { config } from '../engine/config'

export interface Counts {
  /** Pairs where the woman came first. */
  w: number
  /** Pairs where the man came first. */
  m: number
  /** Pairs where neither did (an even share). */
  e: number
}

export interface Position {
  /** 0 (men first every time) to 1 (women first every time). */
  at: number
  lo: number
  hi: number
  n: number
}

const clamp = (x: number) => Math.min(1, Math.max(0, x))

/** The Beta(a, b) quantile at q, from its density summed on a fine grid (exact enough for a picture). */
function betaQuantile(a: number, b: number, q: number): number {
  const steps = 2000
  const logs: number[] = []
  for (let i = 0; i < steps; i++) {
    const x = (i + 0.5) / steps
    logs.push((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x))
  }
  const top = Math.max(...logs)
  const dens = logs.map((l) => Math.exp(l - top))
  const total = dens.reduce((s, d) => s + d, 0)
  let acc = 0
  for (let i = 0; i < steps; i++) {
    acc += dens[i] / total
    if (acc >= q) return (i + 0.5) / steps
  }
  return 1
}

/** The standard normal quantile (Acklam's rational approximation). */
export function normalQuantile(p: number): number {
  const a = [
    -39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716,
    2.506628277459239,
  ]
  const b = [
    -54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972,
    -13.28068155288572,
  ]
  const c = [
    -0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const lo = 0.02425
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
  if (p > 1 - lo) return -normalQuantile(1 - p)
  const q = p - 0.5
  const r = q * q
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  )
}

/** The position and its range for one season's counts; null when there are no pairs. */
export function positionOf(c: Counts, range = config.season.rating.range): Position | null {
  const n = c.w + c.m + c.e
  if (n <= 0) return null
  const wf = c.w + c.e / 2
  const mf = c.m + c.e / 2
  const at = wf / n
  const tail = (1 - range.mass) / 2
  if (range.method === 'wilson') {
    const z = normalQuantile(1 - tail)
    const mid = (at + (z * z) / (2 * n)) / (1 + (z * z) / n)
    const half = (z / (1 + (z * z) / n)) * Math.sqrt((at * (1 - at)) / n + (z * z) / (4 * n * n))
    return { at, lo: clamp(mid - half), hi: clamp(mid + half), n }
  }
  const [pa, pb] = range.prior
  /* The prior pulls the interval in from the ends; the range always holds the position. */
  return {
    at,
    lo: Math.min(at, betaQuantile(pa + wf, pb + mf, tail)),
    hi: Math.max(at, betaQuantile(pa + wf, pb + mf, 1 - tail)),
    n,
  }
}

/** Two seasons' ranges overlap: the profile then shows no change (the owner's line). */
export const overlaps = (a: Position, b: Position) => a.lo <= b.hi && b.lo <= a.hi

/** A per cent for words and labels, as a whole number. */
export const pc = (x: number) => Math.round(clamp(x) * 100)
