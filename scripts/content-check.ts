/**
 * The content held as a test: the fortnight's shape (two skins, Monday easy to Saturday hard,
 * a Sunday result each week, rotating life areas, every mechanic, twins that return across
 * the fortnight, a transfer day of a new type), symmetric answer options, the owner's copy
 * rules (British spelling, no em or en dashes, minimal reading, no visible timers, sample
 * data said to be sample) and the i18n layer (every English string has a Hindi draft).
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CAST, DAYS, HANDLE_WORDS, twinHalves, type Day, type Step, type Text } from '../src/content'
import { record } from './lib/check'

const T = 'C content and copy (content/, knowledge/design.md section 8)'
const ROOT = new URL('..', import.meta.url).pathname
const words = (s: string) => s.split(/\s+/).filter(Boolean).length
const AMERICAN = /\b(color|colors|favor|favorite|behavior|center|centered|organize|organized|practicing|analyze|analyzed|realize|realized|neighbor|neighborhood|theater|traveled|license|program)\b/i
const DASH = /[–—]/
const TIMER = /\b(seconds?|timer|countdown|hurry|time left|quick, )\b/i

/** Every Text in an object, with its path. */
function texts(x: unknown, path: string, out: [string, Text][] = []) {
  if (Array.isArray(x)) x.forEach((v, i) => texts(v, `${path}[${i}]`, out))
  else if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    if (typeof o.en === 'string' && Object.keys(o).every((k) => k === 'en' || k === 'hi')) out.push([path, o as Text])
    else for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) texts(v, `${path}.${k}`, out)
  }
  return out
}

const peopleOf = (st: Step): string[] => {
  switch (st.kind) {
    case 'assign':
    case 'team':
    case 'rank':
    case 'checks':
      return st.people.map((p) => ('who' in p ? p.who : ''))
    case 'pick':
      return st.options.flatMap((o) => (o.who ? [o.who] : []))
    case 'words':
      return st.people
    case 'swipe':
      return st.items.map((i) => i.who)
    case 'crowd':
      return st.who ?? []
  }
}
const g = (who: string) => CAST[who]?.gender

export async function run() {
  record(T, 'fourteen days, in order: Lugdi Monday to Sunday, then Station', DAYS.length === 14 &&
    DAYS.every((d, i) => d.n === i + 1 && d.weekday === (i % 7) + 1 && d.skin === (i < 7 ? 'lugdi' : 'station')))
  record(T, 'each week ends on a Sunday result with a reflection and no puzzle', [7, 14].every((n) => {
    const d = DAYS[n - 1]
    return d.sunday && d.steps.length === 0 && !!d.reflect
  }) && DAYS.filter((d) => d.sunday).length === 2)
  const climbs = [DAYS.slice(0, 6), DAYS.slice(7, 13)].every((w) => {
    const lv = w.map((d) => d.level).filter((l): l is number => l !== null)
    return lv.every((l, i) => i === 0 || l >= lv[i - 1]) && lv[0] < lv[lv.length - 1]
  })
  record(T, 'difficulty climbs from Monday (easy) to Saturday (hard) in both weeks', climbs)
  const played = DAYS.filter((d) => !d.sunday)
  const areaRepeat = played.filter((d, i) => i > 0 && played[i - 1].n === d.n - 1 && played[i - 1].area === d.area)
  record(T, 'life areas rotate: no area on two days running', areaRepeat.length === 0, areaRepeat.map((d) => d.id).join(', '))
  const kinds = new Set(played.flatMap((d) => d.steps.map((s) => s.kind)))
  record(T, 'every mechanic is in the fortnight: assign, pick, checks, team, rank, words, swipe, crowd', ['assign', 'pick', 'checks', 'team', 'rank', 'words', 'swipe', 'crowd'].every((k) => kinds.has(k as Step['kind'])), [...kinds].join(', '))
  const mechRepeat = played.filter((d, i) => i > 0 && played[i - 1].n === d.n - 1 && played[i - 1].steps[0].kind === d.steps[0].kind)
  record(T, 'no mechanic opens two days running', mechRepeat.length === 0, mechRepeat.map((d) => d.id).join(', '))
  const objects = (w: Day[]) => new Set(w.map((d) => d.object.en)).size === w.length
  record(T, 'each day within a skin is a different object or genre', objects(DAYS.slice(0, 7)) && objects(DAYS.slice(7)))

  const transfer = DAYS.filter((d) => d.transfer)
  record(
    T,
    'one transfer day: a life area used nowhere else, no level, no twin',
    transfer.length === 1 &&
      DAYS.filter((d) => d.area === transfer[0].area).length === 1 &&
      transfer[0].level === null &&
      transfer[0].steps.every((s) => !('twin' in s) || !s.twin),
  )
  const twins = ['T1', 'T2', 'T3'].map((id) => ({ id, ...twinHalves(id) }))
  const swapped = twins.filter(({ a, b }) => {
    if (!a || !b || a.step.kind !== b.step.kind) return false
    if (a.step.kind === 'pick' && b.step.kind === 'pick') {
      const pa = a.step
      const pb = b.step
      return pa.options.every((o) => {
        const ob = pb.options.find((x) => x.id === o.id)
        return ob && ob.profile !== o.profile && JSON.stringify(ob.values) === JSON.stringify(o.values)
      })
    }
    if (a.step.kind === 'checks' && b.step.kind === 'checks')
      return g(a.step.voice!.target!) !== g(b.step.voice!.target!)
    if (a.step.kind === 'team' && b.step.kind === 'team') return a.step.voice.target !== b.step.voice.target
    return false
  })
  record(T, 'at least two twin pairs return across the fortnight with the genders swapped', swapped.length >= 2 && swapped.every((t) => t.a!.day.n < t.b!.day.n), swapped.map((t) => t.id).join(', '))

  const castBad = played.flatMap((d) => d.steps.flatMap((s) => peopleOf(s).filter((w) => !CAST[w]).map((w) => `${d.id}:${w}`)))
  const voices = played.flatMap((d) => d.steps.flatMap((s) => ('voice' in s && s.voice ? [s.voice.who] : [])))
  record(T, 'every person named in a day is in the cast', castBad.length === 0 && voices.every((v) => CAST[v]), castBad.join(', '))
  const used = new Set(played.flatMap((d) => d.steps.flatMap(peopleOf)))
  record(T, 'the cast mixes recurring and new characters', [...used].some((w) => CAST[w].recurring) && [...used].some((w) => !CAST[w].recurring))

  const sym: string[] = []
  for (const d of played)
    for (const st of d.steps) {
      if (st.kind === 'checks')
        for (const t of new Set(st.people.map((p) => p.mirror).filter(Boolean))) {
          const m = st.people.filter((p) => p.mirror === t)
          if (m.length !== 2 || g(m[0].who) === g(m[1].who) || m[0].record.en !== m[1].record.en || m[0].finding.en !== m[1].finding.en) sym.push(st.id)
        }
      if (st.kind === 'pick') {
        const ppl = st.options.filter((o) => o.who)
        const vals = new Set(ppl.map((o) => JSON.stringify(o.values ?? {})))
        if (vals.size !== 1 || new Set(ppl.map((o) => g(o.who!))).size !== 2) sym.push(st.id)
      }
      if (st.kind === 'swipe')
        for (const p of new Set(st.items.map((i) => i.pair))) {
          const its = st.items.filter((i) => i.pair === p)
          if (its.length !== 2 || g(its[0].who) === g(its[1].who)) sym.push(`${st.id}:${p}`)
        }
      if (st.kind === 'words' && (st.people.length !== 2 || g(st.people[0]) === g(st.people[1]))) sym.push(st.id)
      if (st.kind === 'team') {
        const cut = [...st.people].sort((x, y) => y.value - x.value)[st.seats - 1].value
        const tied = st.people.filter((p) => p.value === cut)
        if (new Set(tied.map((p) => g(p.who))).size !== 2) sym.push(st.id)
      }
      if (st.kind === 'words' && st.bank.filter((b) => b.valence > 0).length !== st.bank.filter((b) => b.valence < 0).length) sym.push(`${st.id}:bank`)
    }
  record(T, 'mirrors are true mirrors: same record, same words or same score, one woman and one man', sym.length === 0, sym.join(', '))

  const LIMITS: [RegExp, number][] = [
    [/\.prompt$|\.choosePrompt$|\.responsePrompt$/, 18],
    [/\.blurb$/, 12],
    [/\.quote$|\.line$|\.items\[\d+\]\.text$|\.facts$|\.finding$|\.record$/, 14],
    [/\.title$/, 6],
  ]
  const all = DAYS.flatMap((d) => texts(d, d.id))
  const long = all.filter(([p, t]) => LIMITS.some(([re, n]) => re.test(p) && words(t.en) > n)).map(([p]) => p)
  record(T, 'minimal reading: prompts 18 words, blurbs 12, quotes and lines 14, titles 6', long.length === 0, long.join(', '))
  const noHi = all.filter(([, t]) => !t.hi).map(([p]) => p)
  record(T, 'every content string has a Hindi draft', noHi.length === 0, noHi.slice(0, 5).join(', '))

  const en = JSON.parse(readFileSync(join(ROOT, 'content/i18n/en.json'), 'utf8')) as Record<string, string>
  const hi = JSON.parse(readFileSync(join(ROOT, 'content/i18n/hi.json'), 'utf8')) as Record<string, string>
  const keys = Object.keys(en).filter((k) => !k.startsWith('_'))
  const missing = keys.filter((k) => !hi[k])
  const vars = keys.filter((k) => hi[k] && [...en[k].matchAll(/\{\w+\}/g)].map(String).sort().join() !== [...hi[k].matchAll(/\{\w+\}/g)].map(String).sort().join())
  record(T, 'i18n: every interface string has a Hindi draft with the same {slots}, and the Hindi is marked draft', !missing.length && !vars.length && hi._status === 'draft', [...missing, ...vars].join(', '))

  const contentFiles = ['cast.json', 'handles.json', 'sample.json', ...readdirSync(join(ROOT, 'content/days')).map((f) => `days/${f}`), 'i18n/en.json', 'i18n/hi.json']
  const shown = contentFiles.flatMap((f) => {
    const j = JSON.parse(readFileSync(join(ROOT, 'content', f), 'utf8')) as unknown
    return f.startsWith('i18n') ? Object.entries(j as Record<string, string>).map(([k, v]) => [`${f}:${k}`, v] as const) : texts(j, f).flatMap(([p, t]) => [[p, t.en] as const, [p, t.hi ?? ''] as const])
  })
  const dashes = shown.filter(([, v]) => DASH.test(v)).map(([p]) => p)
  record(T, 'no em or en dash in any string', dashes.length === 0, dashes.join(', '))
  const us = shown.filter(([, v]) => AMERICAN.test(v)).map(([p, v]) => `${p}: ${v.match(AMERICAN)?.[0]}`)
  record(T, 'British spelling', us.length === 0, us.join(', '))
  const timers = shown.filter(([, v]) => TIMER.test(v)).map(([p]) => p)
  record(T, 'no visible timer: no string speaks of seconds, timers or hurrying', timers.length === 0, timers.join(', '))
  record(T, 'sample data says it is sample data (the board and the crowd figure)', /made up/i.test(en['board.sample']) && /made up/i.test(en['crowd.sample']))

  const PERSON = /\b(raja|rani|baadshah|badshah|begum|kamli|bhai|didi|bhaiya|queen|king|boy|girl|man|woman|lady|sahab|memsahab|beta|beti|chhora|chhori)\b/i
  const hw = [...HANDLE_WORDS.first, ...HANDLE_WORDS.second]
  record(T, 'road-name words name places, times and things, never a person, so no handle carries a gender', hw.every((w) => !PERSON.test(w.en)) && HANDLE_WORDS.second.every((w) => !!w.joiner) && new Set(hw.map((w) => w.id)).size === hw.length)
}
