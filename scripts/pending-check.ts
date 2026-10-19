/**
 * Copy hygiene (EVAL-6): no player-facing string says "PENDING". Pending markers live in
 * underscore keys of the content (`_pending`, `_note`), in code comments, or in the dev-only
 * DevNotes panel, which a production build never renders. There is no exception: the season
 * disclosure's sentence 3 is an interim line, never a placeholder (owner, 19 Oct 2026).
 * `pnpm ux` also reads every rendered screen for the word (scripts/ux-audit.ts).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { sentencesFor } from '../src/content'
import { DevNotes } from '../src/ui'
import { record } from './lib/check'

const T = 'X-16 no PENDING in player copy'
const ROOT = new URL('..', import.meta.url).pathname
/** Content files that are not player copy: planning values and their notes. */
const NOT_COPY = new Set(['config.json'])

function* strings(o: unknown, path: string[]): Generator<[string, string]> {
  if (typeof o === 'string') yield [path.join('.'), o]
  else if (Array.isArray(o))
    for (const [i, v] of o.entries()) yield* strings(v, [...path, String(i)])
  else if (o && typeof o === 'object')
    for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) yield* strings(v, [...path, k])
}

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )

export async function run() {
  const leaks: string[] = []
  for (const f of walk(join(ROOT, 'content')).filter((x) => x.endsWith('.json'))) {
    const name = f.slice(join(ROOT, 'content').length + 1)
    if (NOT_COPY.has(name)) continue
    const data = JSON.parse(readFileSync(f, 'utf8')) as Record<string, unknown>
    const { status: _status, ...copy } = data
    for (const [p, v] of strings(copy, []))
      if (/PENDING|owner wording/i.test(v)) leaks.push(`${name} ${p}`)
  }
  record(
    T,
    'no content string a player can see says PENDING (markers live in underscore keys)',
    leaks.length === 0,
    leaks.slice(0, 6).join(' | '),
  )
  const shown = (['en', 'hinglish'] as const).flatMap((l) => [
    ...sentencesFor(l, true),
    ...sentencesFor(l, false),
  ])
  record(
    T,
    'the disclosure as rendered (both languages, season and panel) shows no PENDING and no owner-wording placeholder',
    !shown.some((x) => /PENDING|owner wording/i.test(x)),
    shown.filter((x) => /PENDING|owner wording/i.test(x)).join(' | '),
  )
  const code = walk(join(ROOT, 'src'))
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) =>
      /PENDING/.test(
        readFileSync(f, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:])\/\/.*$/gm, '$1'),
      ),
    )
  record(
    T,
    'no string or JSX text in src/ says PENDING (comments may)',
    code.length === 0,
    code.join(', '),
  )
  record(
    T,
    'the dev-only notes panel renders nothing outside the Vite dev server',
    renderToStaticMarkup(h(DevNotes, { title: 'Notes', notes: ['PENDING v18: x'] })) === '',
  )
}
