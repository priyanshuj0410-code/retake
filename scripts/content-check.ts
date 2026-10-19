/**
 * The content files: shapes, the counts the configured sessions need, the house writing rules
 * (British spelling, no em or en dashes), the markers that keep demo content from passing as
 * real (placeholders, not yet pre-tested), and the note arms' equal format and length.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  cards,
  identity,
  inboxBank,
  notesById,
  ordinaryBank,
  screens,
  surveyItems,
  xw,
} from '../src/content'
import { config, DEPLOYMENTS } from '../src/engine/config'
import { BANDS, STRATA, TYPES, bankFor } from '../src/engine/layout'
import { record } from './lib/check'

const T = 'X-2 content banks and writing rules'
const ROOT = new URL('..', import.meta.url).pathname
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) =>
    statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)],
  )
const AMERICAN =
  /\b(color|colors|organize[ds]?|organizing|organization|center|favor|favorite|behavior|analyze[ds]?|defense|traveled|traveling|labeled|labeling|honor|catalog|license[ds]? to|realize[ds]?|recognize[ds]?|prioritize[ds]?|summarize[ds]?|apologize|minimize[ds]?|emphasize[ds]?|utilize|criticize)\b/i

export async function run() {
  record(
    T,
    'every people card has four descriptions with unique ids',
    cards.every((c) => c.descriptions.length === 4) &&
      new Set(cards.flatMap((c) => c.descriptions.map((d) => d.id))).size === cards.length * 4,
  )
  record(
    T,
    'allocation cards have a unit and a pool',
    cards.filter((c) => c.type === 'allocation').every((c) => c.unit && (c.pool ?? 0) > 0),
  )
  record(
    T,
    'continuations use only {first}: a fixed template whatever the cues',
    cards.every((c) => !/\{(?!first\})/.test(c.continuation.en + c.continuation.hinglish)),
  )
  record(
    T,
    'opportunity and NPT descriptions carry no pronoun',
    cards
      .filter((c) => c.family !== 'conduct')
      .every((c) =>
        c.descriptions.every((d) => !/\b(he|she|his|her|him|they|their)\b/i.test(d.text.en)),
      ),
  )
  record(
    T,
    'conduct descriptions name the complainant only through {name} and its pronoun tokens',
    cards
      .filter((c) => c.family === 'conduct')
      .every((c) =>
        c.descriptions.every(
          (d) => d.text.en.includes('{name}') && d.text.hinglish.includes('{name}'),
        ),
      ),
  )

  /* Enough cards for every configured session (one spare per sub-stratum for the baseline). */
  for (const dep of DEPLOYMENTS) {
    const d = config.deployments[dep]
    for (const [form, counts, bank] of [
      ['A', d.formA, 'A'],
      ['B', d.formB, d.formBBank ?? 'B'],
    ] as const) {
      const n = counts.opportunityPerSubstratum ?? 0
      if (n > 0)
        for (const t of TYPES)
          for (const b of BANDS)
            record(
              T,
              `${dep} form ${form}: ${t}/${b} bank holds ${n} + 1`,
              bankFor('opportunity', bank).filter((c) => c.type === t && c.band === b).length >=
                n + 1,
            )
      const c = counts.conductPerStratum ?? 0
      if (c > 0)
        for (const s of STRATA)
          record(
            T,
            `${dep} form ${form}: conduct ${s} bank holds ${c} + 1`,
            bankFor('conduct', form === 'A' ? (d.conductBank ?? 'A') : 'B').filter(
              (x) => x.stratum === s,
            ).length >=
              c + 1,
          )
    }
    if (d.inbox > 0)
      record(
        T,
        `${dep}: Inbox bank holds the ${d.inbox} cards configured (half harassment, half near-miss)`,
        inboxBank.filter((i) => i.kind === 'harassment').length >= Math.ceil(d.inbox / 2) &&
          inboxBank.filter((i) => i.kind === 'near-miss').length >= Math.floor(d.inbox / 2),
      )
  }
  record(
    T,
    'R1 filler cards exist in form A',
    (config.deployments['panel-g1'].r1Fillers ?? []).every((id) =>
      cards.some((c) => c.id === id && c.form === 'A'),
    ),
  )
  record(
    T,
    'some ordinary decisions are unscored, and unscored ones are not tutorials',
    ordinaryBank.some((o) => !o.scored) &&
      ordinaryBank.filter((o) => !o.scored).every((o) => !o.tutorial),
  )
  record(
    T,
    '{recall} appears only in unscored ordinary decisions',
    ordinaryBank
      .filter((o) => (o.body.en + o.title.en).includes('{recall}'))
      .every((o) => !o.scored),
  )

  /* The survey's balanced keying. */
  const byFam = (f: string) => surveyItems.filter((i) => i.family === f)
  record(
    T,
    'survey: six items per family, three fair at each end',
    ['opportunity', 'conduct'].every(
      (f) =>
        byFam(f).length === 6 && byFam(f).filter((i) => i.keying === 'agree-fair').length === 3,
    ),
  )
  const dis = surveyItems.filter((i) => i.keying === 'disagree-fair')
  record(
    T,
    'survey: disagree-end items split equally between men- and women-favouring',
    dis.filter((i) => i.unfairFavours === 'men').length ===
      dis.filter((i) => i.unfairFavours === 'women').length,
  )
  record(
    T,
    'survey: four repeat pairs per family, two at each keying',
    ['opportunity', 'conduct'].every(
      (f) =>
        byFam(f).filter((i) => i.repeat).length === 4 &&
        byFam(f).filter((i) => i.repeat && i.keying === 'agree-fair').length === 2,
    ),
  )
  record(
    T,
    'crosswise: 12 M1-H statements, 2 controls, 8 own-conduct items, 4 RC items, an anchor and a known-zero item',
    xw.m1hStatements.length === 12 &&
      xw.m1hControls.length === 2 &&
      xw.m3Items.length === 8 &&
      xw.rcItems.length === 4 &&
      !!xw.anchor &&
      !!xw.knownZero,
  )
  record(
    T,
    'crosswise: enough neutral padding for the longest route',
    xw.neutral.length >=
      Math.max(xw.m1hControls.length + xw.m1hStatements.length, xw.rcItems.length),
  )

  /* The three notes: same format, same length, (b) and (c) the same statistic. */
  const a = notesById.get('a')
  const b = notesById.get('b')
  const c = notesById.get('c')
  const words = (n: typeof a) =>
    n ? `${n.statistic.en} ${n.source.en} ${n.instruction.en}`.split(/\s+/).length : 0
  record(
    T,
    'mid-season notes: three, the same three fields, within 3 words of the same length',
    !!(a && b && c) &&
      Math.max(words(a), words(b), words(c)) - Math.min(words(a), words(b), words(c)) <= 3,
    `${words(a)}, ${words(b)}, ${words(c)} words`,
  )
  record(
    T,
    'notes (b) and (c) share the statistic and source; (a) and (b) share the instruction',
    !!(a && b && c) &&
      b.statistic.en === c.statistic.en &&
      b.source.en === c.source.en &&
      a.instruction.en === b.instruction.en,
  )
  record(
    T,
    'note (c) is the registered instruction, with no "fair" and no CEO framing',
    c?.instruction.en ===
      'For the next part, the rounds and the questions after them, answer as the ideal employee would.',
  )
  record(
    T,
    'the truthful statistic is a marked placeholder until sourced',
    !!a &&
      (!a.placeholder || /PLACEHOLDER/.test(a.statistic.en)) &&
      (a.placeholder ? /PLACEHOLDER/.test(a.statistic.en) : true),
  )
  record(
    T,
    'the identity pools are marked not yet pre-tested',
    identity.status === 'not yet pre-tested',
  )
  record(
    T,
    'the Inbox states the Internal Committee route',
    /Internal Committee/.test(screens.inbox.route.en) &&
      /Internal Committee/.test(screens.inbox.note.en),
  )

  /* Writing rules over every content file and every string in src. */
  const files = [
    ...walk(join(ROOT, 'content')).filter((f) => f.endsWith('.json')),
    ...walk(join(ROOT, 'src')).filter((f) => /\.tsx?$/.test(f)),
  ]
  const dashes: string[] = []
  const us: string[] = []
  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    if (/[–—]/.test(text)) dashes.push(f.replace(ROOT, ''))
    const m = text.match(AMERICAN)
    if (m) us.push(`${f.replace(ROOT, '')}: ${m[0]}`)
  }
  record(
    T,
    'no em or en dash in any content file or source string',
    dashes.length === 0,
    dashes.join(', '),
  )
  record(T, 'British spelling (no common American forms)', us.length === 0, us.join('; '))
}
