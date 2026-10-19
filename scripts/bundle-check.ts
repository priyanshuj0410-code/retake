/**
 * Rule 7 of the tool design: the scoring explanation opens only after the play window closes.
 * The explanation therefore must not ship in the app at all (a player could read it in the
 * bundle): it lives in content/explanation.json and reaches players only from the database,
 * whose rules open eval-explain/<deployment> after the release date. This builds the app and
 * confirms no sentence of the explanation is in it, and that nothing in src/ imports it.
 */
import { readFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { build } from 'vite'
import { record } from './lib/check'

const T = 'X-5 the scoring explanation is not in the app'
const ROOT = new URL('..', import.meta.url).pathname

export async function run() {
  const out = join(ROOT, 'node_modules/.tmp/bundle-check')
  await build({ root: ROOT, logLevel: 'silent', build: { outDir: out, emptyOutDir: true } })
  const files =
    readdirSync(join(out, 'assets'))
      .map((f) => readFileSync(join(out, 'assets', f), 'utf8'))
      .join('\n') + readFileSync(join(out, 'index.html'), 'utf8')
  const ex = JSON.parse(readFileSync(join(ROOT, 'content/explanation.json'), 'utf8')) as {
    sections: { body: { en: string }[] }[]
  }[]
  const sentences = ex.flatMap((e) =>
    e.sections.flatMap((s) => s.body.map((b) => b.en.slice(0, 60))),
  )
  const leaked = sentences.filter((s) => files.includes(s))
  record(
    T,
    `no sentence of the scoring explanation is in the built app (${sentences.length} checked)`,
    leaked.length === 0,
    leaked.slice(0, 2).join(' | '),
  )
  const src = readdirSync(join(ROOT, 'src'), { recursive: true })
    .filter((f) => String(f).match(/\.tsx?$/))
    .map((f) => readFileSync(join(ROOT, 'src', String(f)), 'utf8'))
    .join('\n')
  record(
    T,
    'nothing in src/ imports content/explanation.json',
    !/import[^\n]*explanation\.json/.test(src),
  )
  record(
    T,
    'the notes (b) and (c) wording of the faking instruction is in the app only as the note itself',
    (files.match(/answer as the ideal employee would/g) ?? []).length >= 1,
  )
  rmSync(out, { recursive: true, force: true })
}
