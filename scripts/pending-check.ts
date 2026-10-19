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
import { PLACEHOLDER, PLACEHOLDER_WORDS } from './lib/placeholder'

const T = 'X-16 no PENDING in player copy'
const ROOT = new URL('..', import.meta.url).pathname
/** Content files that are not player copy: planning values and their notes. */
const NOT_COPY = new Set(['config.json'])

function* strings(o: unknown, path: string[]): Generator<[string, string]> {
  if (typeof o === 'string') yield [path.join('.'), o]
  else if (Array.isArray(o))
    for (const [i, v] of o.entries()) yield* strings(v, [...path, String(i)])
  else if (o && typeof o === 'object')
    /* A note marked `placeholder: true` keeps its unsourced statistic and source as marked
       placeholders (X-2 requires the marker); the note screens never render those two fields,
       so only they are skipped. Its instruction is player copy and is read like any other. */
    for (const [k, v] of Object.entries(o))
      if (
        !k.startsWith('_') &&
        !((o as { placeholder?: boolean }).placeholder && (k === 'statistic' || k === 'source'))
      )
        yield* strings(v, [...path, k])
}

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )

export async function run() {
  const leaks: string[] = []
  const read: string[] = []
  for (const f of walk(join(ROOT, 'content')).filter((x) => x.endsWith('.json'))) {
    const name = f.slice(join(ROOT, 'content').length + 1)
    if (NOT_COPY.has(name)) continue
    read.push(name)
    const data = JSON.parse(readFileSync(f, 'utf8')) as Record<string, unknown>
    const { status: _status, ...copy } = data
    for (const [p, v] of strings(copy, [])) if (PLACEHOLDER.test(v)) leaks.push(`${name} ${p}`)
  }
  record(
    T,
    'no content string a player can see holds a placeholder: PENDING, TODO, TBD, owner wording, {{ }} (markers live in underscore keys)',
    leaks.length === 0,
    leaks.slice(0, 6).join(' | '),
  )
  record(
    T,
    'every player-facing content file is read, the explanation and the notes included',
    ['explanation.json', 'notes.json', 'story.json', 'screens.json', 'disclosure.json'].every((f) =>
      read.includes(f),
    ),
    read.join(', '),
  )
  const shown = (['en', 'hinglish'] as const).flatMap((l) => [
    ...sentencesFor(l, true),
    ...sentencesFor(l, false),
  ])
  record(
    T,
    'the disclosure as rendered (both languages, season and panel) shows no PENDING and no owner-wording placeholder',
    !shown.some((x) => PLACEHOLDER.test(x)),
    shown.filter((x) => PLACEHOLDER.test(x)).join(' | '),
  )
  /* The note screens skip a marked placeholder's statistic and source. */
  const unshown = ['src/screens/Story.tsx', 'src/screens/StepView.tsx'].filter(
    (f) =>
      !/n\.placeholder \? null : \(\s*<>\s*<Text kind="lead">\{L\(n\.statistic\)\}/.test(
        readFileSync(join(ROOT, f), 'utf8'),
      ),
  )
  record(
    T,
    'a note whose statistic is a marked placeholder renders its instruction only, never the placeholder',
    unshown.length === 0,
    unshown.join(', '),
  )
  const code = walk(join(ROOT, 'src'))
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) =>
      PLACEHOLDER_WORDS.test(
        readFileSync(f, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:])\/\/.*$/gm, '$1'),
      ),
    )
  record(
    T,
    'no string or JSX text in src/ holds a placeholder (comments may)',
    code.length === 0,
    code.join(', '),
  )
  /* The interim sentence 3 is a real line, held in config with its comment (owner). */
  const cfg = readFileSync(join(ROOT, 'src/engine/config.ts'), 'utf8')
  record(
    T,
    'season sentence 3 renders "Attitudes are read; you see yours." from config, whose comment says it awaits the owner\'s wording',
    sentencesFor('en', true)[2] === 'Attitudes are read; you see yours.' &&
      sentencesFor('hinglish', true)[2] === 'Attitudes padhe jaate hain; aapko apne dikhte hain.' &&
      /AWAITS THE OWNER'S WORDING[\s\S]*export const seasonSentence3/.test(cfg),
  )
  /* Attack: the pattern catches the placeholders it names. */
  record(
    T,
    'the placeholder pattern fails a planted PENDING, TODO, TBD, owner wording, {{name}}, [PLACEHOLDER: ...] and other bracketed markers',
    [
      'PENDING v18',
      'TODO: copy',
      'Sentence TBD',
      '[owner wording]',
      'Hi {{name}}',
      '[PLACEHOLDER: a sourced statistic goes here.]',
      'Source: [source to be confirmed]',
      '[TBC]',
      '[INSERT FIGURE]',
    ].every((x) => PLACEHOLDER.test(x)) && !PLACEHOLDER.test('Attitudes are read; you see yours.'),
  )
  record(
    T,
    'the dev-only notes panel renders nothing outside the Vite dev server',
    renderToStaticMarkup(h(DevNotes, { title: 'Notes', notes: ['PENDING v18: x'] })) === '',
  )
}
