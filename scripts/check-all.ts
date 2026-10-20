/**
 * `pnpm check` (after tsc and oxlint, before the browser checks): the trainer's own checks.
 * The mapping from each requirement to its check is knowledge/reference/acceptance-tests.md.
 */
import { results, summary } from './lib/check'

const t0 = performance.now()
const modules = ['./design-check', './content-check', './scoring-check', './privacy-check', './bundle-check']
for (const m of modules) {
  try {
    const mod = (await import(m)) as { run: () => Promise<void> }
    await mod.run()
  } catch (e) {
    results.push({ test: `ERROR ${m}`, name: 'threw', ok: false, detail: String(e) })
  }
}
const ok = summary()
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed in ${((performance.now() - t0) / 1000).toFixed(1)} s`)
process.exit(ok ? 0 : 1)
