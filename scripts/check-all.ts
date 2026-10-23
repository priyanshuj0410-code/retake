/**
 * `pnpm check` (after tsc and oxlint, before the browser checks, pnpm e2e and pnpm pwa): the content, the scoring
 * engine kept for the dailies, privacy and the built bundle. The turned-down build's design check went with its UI.
 * The mapping from each requirement to its check is knowledge/reference/acceptance-tests.md.
 */
import { results, summary } from './lib/check'

const t0 = performance.now()
const modules = ['./content-check', './scoring-check', './privacy-check', './bundle-check']
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
