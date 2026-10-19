/**
 * The firm's play window (tool design v3, firm act E; candidates v12 3.0): drawn at enrolment,
 * 7 to 1 days before or 1 to 7 days after the player's own training, 1:1.
 * Registered: blocked by firm and month. A device cannot block without shared allocation
 * state, so this prototype draws 1:1 per player; knowledge/architecture/data-and-privacy.md
 * names the gap and the server-side allocation that closes it.
 */
import { config } from './config'
import type { Rng } from './rng'

const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export function drawWindow(
  rng: Rng,
  trainingDate: string,
): { arm: 'before' | 'after'; from: string; to: string; month: string } {
  const after = rng.next() < config.firmWindows.afterShare
  const t = Date.parse(`${trainingDate}T00:00:00Z`)
  const [a, b] = after ? config.firmWindows.afterDays : config.firmWindows.beforeDays
  return {
    arm: after ? 'after' : 'before',
    from: after ? iso(t + a * DAY) : iso(t - a * DAY),
    to: after ? iso(t + b * DAY) : iso(t - b * DAY),
    month: trainingDate.slice(0, 7),
  }
}
