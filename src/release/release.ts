/**
 * The release rule (candidates v12, 3.0 and 3.9; plan v1, section 9, test 7). Any results view
 * reports only cells of `minCell` (50) or more people. Smaller categories are merged, and what
 * still falls short is suppressed: never reported, never reported short.
 *
 * Firm cells are sex by batch-month. Small batches are merged within the firm-month, never
 * across timing arms; "prefer not to say" is its own sex cell under the same rule. The
 * employer's sex result is released only in groups of 50 or more.
 */
import { config } from '../engine/config'

export interface Cell<V = number> {
  label: string
  n: number
  /** The quantity reported for the cell (a group mean, a share). Absent when suppressed. */
  value?: V
}

export interface Released<V = number> {
  released: (Cell<V> & { merged?: string[] })[]
  suppressed: string[]
}

const MIN = () => config.release.minCell

/** One cell: released if it holds at least the minimum, refused otherwise. */
export function releaseCell<V>(c: Cell<V>, min = MIN()): Cell<V> | null {
  return c.n >= min ? c : null
}

/**
 * Categories within one released group. Categories below the minimum are pooled into one
 * merged category; if the pool is still below the minimum it is suppressed. `combine` gives
 * the merged category's value from its members.
 */
export function releaseCategories<V>(cells: Cell<V>[], combine: (cs: Cell<V>[]) => V | undefined, min = MIN(), mergedLabel = 'Other categories (merged)'): Released<V> {
  const big = cells.filter((c) => c.n >= min)
  const small = cells.filter((c) => c.n < min)
  const out: Released<V> = { released: big.map((c) => ({ ...c })), suppressed: [] }
  if (small.length > 0) {
    const n = small.reduce((s, c) => s + c.n, 0)
    if (n >= min && small.length > 1) out.released.push({ label: mergedLabel, n, value: combine(small), merged: small.map((c) => c.label) })
    else out.suppressed.push(...small.map((c) => c.label))
  }
  return out
}

export interface FirmCell<V = number> {
  firm: string
  month: string
  batch: string
  timingArm: 'before' | 'after'
  sex: string
  n: number
  value?: V
}

/** Sex by batch-month, merging small batches within the firm-month and the timing arm only. */
export function releaseFirm<V>(cells: FirmCell<V>[], combine: (cs: FirmCell<V>[]) => V | undefined, min = MIN()): Released<V> {
  const groups = new Map<string, FirmCell<V>[]>()
  for (const c of cells) {
    const k = [c.firm, c.month, c.timingArm, c.sex].join('|')
    groups.set(k, [...(groups.get(k) ?? []), c])
  }
  const out: Released<V> = { released: [], suppressed: [] }
  for (const [k, cs] of groups) {
    const label = (c: FirmCell<V>) => `${c.firm} ${c.month} ${c.batch} ${c.timingArm} ${c.sex}`
    for (const c of cs.filter((c) => c.n >= min)) out.released.push({ label: label(c), n: c.n, value: c.value })
    const small = cs.filter((c) => c.n < min)
    if (small.length === 0) continue
    const n = small.reduce((s, c) => s + c.n, 0)
    if (n >= min && small.length > 1) out.released.push({ label: `${k.replaceAll('|', ' ')} (batches merged)`, n, value: combine(small), merged: small.map(label) })
    else out.suppressed.push(...small.map(label))
  }
  return out
}

/** The employer receives only the sex result, and only for a group of the minimum size or more. */
export function employerSexResult<V>(group: Cell<V>, min = MIN()): Cell<V> | null {
  return releaseCell(group, min)
}
