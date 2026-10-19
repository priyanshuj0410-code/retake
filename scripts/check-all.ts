/**
 * `pnpm check` (after tsc and oxlint, and before the emulator's rules check): every registered
 * acceptance test of research plan v1, section 9, plus the build's own checks. The mapping from
 * each test to its script is knowledge/reference/acceptance-tests.md.
 */
import { results, summary } from './lib/check'

const t0 = performance.now()
const modules = [
  './disclosure-check',
  './randomisation-check',
  './no-timers',
  './no-instructed',
  './store-checks',
  './release-check',
  './session-length',
  './content-check',
  './game-rules-check',
  './design-check',
  './bundle-check',
  './component-states-check',
]
for (const m of modules) {
  try {
    const mod = (await import(m)) as { run: () => Promise<void> }
    await mod.run()
  } catch (e) {
    results.push({ test: `ERROR ${m}`, name: 'threw', ok: false, detail: String(e) })
  }
}
const ok = summary()
console.log(
  `\n${results.filter((r) => r.ok).length}/${results.length} checks passed in ${((performance.now() - t0) / 1000).toFixed(1)} s`,
)
process.exit(ok ? 0 : 1)
