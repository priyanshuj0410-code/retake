/**
 * The firm's play window (tool design v3, firm act E; candidates v12 3.0): 7 to 1 days before
 * or 1 to 7 days after the player's own training, 1:1, BLOCKED by firm and month.
 *
 * Blocks are permuted blocks of two per firm and training month: the first enrolment in a
 * block draws its arm at random, the second takes the other arm. The shared state per block is
 * only the arm still owed (`eval-alloc/<firm>/<month>`), never a count, a time or anything about
 * the players, so within every firm-month the arms differ by at most one player, and no draw
 * reads the player's sex or any answer.
 */
import { config } from './config'

export type Arm = 'before' | 'after'
const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const otherArm = (a: Arm): Arm => (a === 'before' ? 'after' : 'before')

/** The next arm in a block, given the arm the block still owes (null at a block's start) and a uniform u. */
export function nextArm(owed: Arm | null, u: number): { arm: Arm; owed: Arm | null } {
  if (owed) return { arm: owed, owed: null }
  const arm: Arm = u < config.firmWindows.afterShare ? 'after' : 'before'
  return { arm, owed: otherArm(arm) }
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
