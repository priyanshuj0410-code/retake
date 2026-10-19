/**
 * The session-length estimator at 25 s a card (research plan v1, 4.2; plan-scripts/cap_fit.py's
 * timing model): every game must fit the 30-minute cap on its longest route. Run alone with
 * `pnpm length` for the act-by-act table, at the configured counts and at the research plan's targets (content/config.json, targets).
 */
import { config, DEPLOYMENTS } from '../src/engine/config'
import { enrolmentEstimate, estimate, longest } from '../src/engine/length'
import { record } from './lib/check'

const T = 'X-1 session length: each game fits 30 minutes at 25 s a card'
const min = (s: number) => `${(s / 60).toFixed(1)} min`

export async function run(print = false) {
  const t = config.timing.secondsPerCard
  for (const dep of DEPLOYMENTS) {
    const es = estimate(dep, t)
    const l = longest(es)
    record(
      T,
      `${dep}: longest route ${l.route}, ${min(l.total)} against ${min(config.timing.cap)}`,
      l.total <= config.timing.cap,
    )
    const target = longest(estimate(dep, t, config.targets[dep]))
    if (print) {
      console.log(`\n${dep} (${config.deployments[dep].label.en}) at ${t} s a card`)
      for (const e of es) {
        console.log(`  route: ${e.route}: ${min(e.total)}, ${e.peopleCards} people cards`)
        for (const a of e.acts)
          console.log(`    ${a.act.padEnd(52)} ${String(Math.round(a.seconds)).padStart(5)} s`)
      }
      console.log(
        `  at the research plan's targets (content/config.json, targets): ${min(target.total)}`,
      )
    }
  }
  const enrol = enrolmentEstimate().reduce((s, a) => s + a.seconds, 0)
  record(T, `firm enrolment sitting: ${min(enrol)}`, enrol <= config.timing.cap)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { summary } = await import('./lib/check')
  await run(true)
  console.log('')
  process.exit(summary() ? 0 : 1)
}
