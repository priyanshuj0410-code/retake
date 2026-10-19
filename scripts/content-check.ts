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
import { config, DEPLOYMENTS, type NoteId } from '../src/engine/config'
import { BANDS, STRATA, TYPES, bankFor } from '../src/engine/layout'
import { recallOptions } from '../src/engine/session'
import { fill } from '../src/engine/text'
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

  /* No screen offers or quotes a note its player did not see (owner decisions O1, O2), and no
     result line names what decides the season (B1, O3). */
  const NUM = { en: ['', 'one', 'two', 'three'], hinglish: ['', 'ek', 'do', 'teen'] }
  const explanations = JSON.parse(readFileSync(join(ROOT, 'content/explanation.json'), 'utf8')) as {
    dep: string
    sections: { body: { en: string; hinglish: string }[] }[]
  }[]
  for (const dep of DEPLOYMENTS) {
    const shown = new Set(
      Object.values(config.deployments[dep].notes ?? {}).flatMap((arms) => Object.keys(arms)),
    )
    const recallOk = [...shown].every((n) => {
      const ids = recallOptions(n as NoteId).map((o) => o.id)
      const real = ids.filter((id) => ['a', 'b', 'c'].includes(id))
      return real.length === 1 && real[0] === n && ids.includes('none')
    })
    record(
      T,
      `${dep}: the recall item offers each arm only its own real note`,
      recallOk,
      [...shown].join(','),
    )
    const body = explanations.find((e) => e.dep === dep)?.sections.flatMap((x) => x.body) ?? []
    const quoted = body.map((b) => b.en.match(/^Note ([a-z]):/)?.[1]).filter((x) => !!x)
    const counted =
      quoted.length === 0 ||
      (body.some((b) => b.en.includes(`These were the ${NUM.en[quoted.length]} notes`)) &&
        body.some((b) => b.hinglish.includes(`Yeh ${NUM.hinglish[quoted.length]} notes`)))
    record(
      T,
      `${dep}: the explanation quotes only notes this game shows, and counts them right`,
      quoted.every((n) => shown.has(n as string)) && counted,
      `shown ${[...shown].join(',') || 'none'}; quoted ${quoted.join(',') || 'none'}`,
    )
  }
  /* The recall item's made-up notes: two or three, each like a real option in length and
     register ("A figure about ..., then: ..."), with no instruction to answer any way and
     nothing from a real note's topic. */
  const realOpts = screens.recall.options.filter((o) => ['a', 'b', 'c'].includes(o.id))
  const decoys = screens.recall.options.filter((o) => 'decoy' in o && o.decoy)
  const meanLen = realOpts.reduce((t, o) => t + o.text.en.length, 0) / realOpts.length
  const INSTRUCTION = /answer|jawab|ideal|honest|imaandar|sach|truth|employee/i
  const REAL_TOPIC = /gender|commut|aane jaane|transport|travel|equal|women|men\b|aurat|mard/i
  const badDecoys = decoys.filter(
    (o) =>
      [o.text.en, o.text.hinglish].some((t) => INSTRUCTION.test(t) || REAL_TOPIC.test(t)) ||
      !/^A figure about .+, then: .+/.test(o.text.en) ||
      !/ka ek aankda, phir: /.test(o.text.hinglish) ||
      Math.abs(o.text.en.length - meanLen) > meanLen * 0.25,
  )
  record(
    T,
    `the recall item's made-up notes (${decoys.length}) carry no instruction, no real note's topic, and match the real options' shape`,
    decoys.length >= 2 && decoys.length <= 3 && badDecoys.length === 0,
    badDecoys.map((o) => o.id).join(', '),
  )
  const BASIS = /budget|vendor|schedule|people|decision|calls|score|faisl|logon/i
  const resultLines = screens.wrap.result.bands.flatMap((b) => [b.text.en, b.text.hinglish])
  record(
    T,
    'no season result line names what decides the season',
    resultLines.every((l) => !BASIS.test(l)) &&
      Object.keys(screens.wrap.result).every((k) => k === 'title' || k === 'bands'),
    resultLines.filter((l) => BASIS.test(l)).join(' | '),
  )

  /* Every gendered text, filled the three ways the generator fills it: no "they was", and no
     sentence restarting in lower case. */
  const gendered: string[] = []
  const collect = (v: unknown): void => {
    if (typeof v === 'string') {
      if (v.includes('{g:')) gendered.push(v)
    } else if (v && typeof v === 'object') Object.values(v).forEach(collect)
  }
  for (const f of walk(join(ROOT, 'content')).filter((f) => f.endsWith('.json')))
    collect(JSON.parse(readFileSync(f, 'utf8')))
  const slips: string[] = []
  for (const s of gendered)
    for (const sex of ['man', 'woman', undefined] as const) {
      const out = fill(s, { name: 'Asha' }, sex)
      const m = out.match(/\bthey (was|is|has|does)\b|[.!?] [a-z]/)
      if (m)
        slips.push(
          `${sex ?? 'neutral'}: ${out.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + 20)}`,
        )
    }
  record(
    T,
    `gendered texts agree and capitalise in all three forms (${gendered.length} texts)`,
    gendered.length > 0 && slips.length === 0,
    slips.slice(0, 5).join(' | '),
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
