/**
 * The firm's play window (tool design v3, firm act E; candidates v12 3.0): 7 to 1 days before
 * or 1 to 7 days after the player's own training, 1:1, BLOCKED by firm and month.
 *
 * Permuted blocks of random size within each firm and training month: when a block is empty
 * the tool draws its size from `firmWindows.blockSizes` (2 or 4), fills it with equal numbers
 * of each arm in a random order, gives the first arm to the enrolling player and keeps the rest
 * as the block's pending state (`eval-alloc/<firm>/<month>`, e.g. "after,before,before"). The
 * state is only the remaining arms: no identity, token, count of players or time. So within
 * every firm-month the arms are equal at every block's completion and differ by at most half a
 * block in between, and no draw reads the player's sex or any answer. Random sizes keep a
 * colleague's arm from fixing the next player's: concealment is at the permuted-block rate.
 */
import { config } from './config'
import type { Rng } from './rng'

export type Arm = 'before' | 'after'
const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export const parsePending = (s: string | null | undefined): Arm[] =>
  s ? (s.split(',') as Arm[]) : []
export const formatPending = (arms: Arm[]): string | null => (arms.length ? arms.join(',') : null)

/** The next arm in a firm-month, given the block's pending arms (empty at a block's start). */
export function nextArm(
  pending: Arm[],
  rng: Rng,
): { arm: Arm; pending: Arm[]; newBlock: number | null } {
  if (pending.length > 0) return { arm: pending[0], pending: pending.slice(1), newBlock: null }
  const size = rng.pick(config.firmWindows.blockSizes)
  const block = rng.shuffle(
    [...Array(size)].map((_, i) => (i < size / 2 ? 'after' : 'before') as Arm),
  )
  return { arm: block[0], pending: block.slice(1), newBlock: size }
}

export function windowFor(
  arm: Arm,
  trainingDate: string,
): { from: string; to: string; month: string } {
  const t = Date.parse(`${trainingDate}T00:00:00Z`)
  const [a, b] = arm === 'after' ? config.firmWindows.afterDays : config.firmWindows.beforeDays
  return {
    from: arm === 'after' ? iso(t + a * DAY) : iso(t - a * DAY),
    to: arm === 'after' ? iso(t + b * DAY) : iso(t - b * DAY),
    month: trainingDate.slice(0, 7),
  }
}
