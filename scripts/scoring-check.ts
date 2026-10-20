/**
 * The scoring held as a test (knowledge/design.md, section 7): two-way lean, per-person
 * absolute lean, twins, rule-locking, check and word parity, the headline sum, the streak's
 * forgiven day, the board's ranks, and road names. Synthetic players answer every step of the
 * fortnight (scripts/lib/policies.ts); nothing here needs a browser.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { DAYS, twinHalves } from '../src/content'
import { emptyAnswer, isComplete } from '../src/engine/answers'
import { rankOf, sampleNamed, sampleTaken, topOfBoard } from '../src/engine/board'
import { anchorDate } from '../src/engine/calendar'
import { handleKey, handleText, offers } from '../src/engine/handles'
import { totalPractice, weekSummary, dayResult } from '../src/engine/results'
import { seeded } from '../src/engine/rng'
import { leanSize, scorePair } from '../src/engine/score'
import { marks, streak } from '../src/engine/streak'
import type { Saved } from '../src/store'
import { record } from './lib/check'
import { answerFor, type Policy } from './lib/policies'

const T = 'S scoring, streak, board and road names'
const ROOT = new URL('..', import.meta.url).pathname

function play(policy: Policy, seed = 1, days = DAYS.filter((d) => !d.sunday)): Saved {
  const rng = seeded(seed)
  const flip = { n: 0 }
  const s: Saved = { v: 1, lang: 'en', seed, handle: { a: 'ghat', b: 'jugnu' }, friends: [], days: {}, notes: {} }
  for (const d of days)
    s.days[anchorDate(d.n)] = { n: d.n, answers: d.steps.map((st) => answerFor(st, policy, rng, flip)), at: d.steps.length, done: true }
  return s
}
const fortnight = (s: Saved) => {
  const a = weekSummary(s, anchorDate(1))
  const b = weekSummary(s, anchorDate(8))
  return { a, b }
}

export async function run() {
  for (const d of DAYS)
    for (const st of d.steps) {
      for (const p of ['even', 'women', 'men', 'random'] as Policy[])
        if (!isComplete(st, answerFor(st, p, seeded(3), { n: 0 })))
          record(T, `policy ${p} answers ${st.id} completely`, false)
      if (isComplete(st, emptyAnswer(st)) && st.kind !== 'crowd') record(T, `${st.id} cannot be committed empty`, false)
    }

  const even = fortnight(play('even'))
  const women = fortnight(play('women'))
  const men = fortnight(play('men'))
  record(
    T,
    'two-way: favouring women costs exactly what favouring men costs (lean and consistency, both weeks)',
    women.a.lean === men.a.lean && women.b.lean === men.b.lean && women.a.consistency === men.a.consistency && women.b.consistency === men.b.consistency,
    `women ${women.a.lean}/${women.b.lean} ${women.a.consistency}/${women.b.consistency}; men ${men.a.lean}/${men.b.lean} ${men.a.consistency}/${men.b.consistency}`,
  )
  record(
    T,
    'overcorrection is not fair: a player who always favours women shows a large lean, the even player a small one',
    (women.b.lean ?? 0) >= 50 && (even.b.lean ?? 100) <= 15 && (even.b.consistency ?? 0) > (women.b.consistency ?? 100),
    `even lean ${even.b.lean} consistency ${even.b.consistency}; women lean ${women.b.lean} consistency ${women.b.consistency}`,
  )
  const randoms = [...Array(40).keys()].map((i) => fortnight(play('random', 100 + i)).b.lean ?? 0)
  const meanRandom = randoms.reduce((s, x) => s + x, 0) / randoms.length
  record(
    T,
    'noise is not a lean: random players average a lean well below the one-sided player',
    meanRandom < (women.b.lean ?? 0) / 2,
    `random mean ${meanRandom.toFixed(1)}, one-sided ${women.b.lean}`,
  )
  record(
    T,
    'shrinkage: one tie decided one way is a lean of 33, never 100',
    leanSize([{ d: 1, area: 'home', source: 'x' }]) === 33 && leanSize([{ d: -1, area: 'home', source: 'x' }]) === 33,
  )
  const signed = JSON.stringify([even, women, men])
  record(T, 'the summaries carry the lean as a size only (no negative number, no direction field)', !/-\d|"sign"|"direction"/.test(signed))
  record(
    T,
    'the headline is consistency plus practice',
    [even, women, men].every((f) => [f.a, f.b].every((w) => w.score === w.practice + (w.consistency ?? 0))),
  )

  const { a, b } = twinHalves('T1')
  const pick = (id: string) => ({ kind: 'pick' as const, choice: id })
  const words = scorePair({ ...a!, answer: pick('raju') }, { ...b!, answer: pick('kamla') })
  const gender = scorePair({ ...a!, answer: pick('raju') }, { ...b!, answer: pick('raju') })
  record(
    T,
    'twin T1: the same words chosen both times is a matched case with no lean; the same person both times is not',
    words.parts[0].score === 1 && words.units[0].d === 0 && gender.parts[0].score === 0 && Math.abs(gender.units[0].d) === 1,
  )
  for (const id of ['T1', 'T2', 'T3']) {
    const h = twinHalves(id)
    record(T, `twin ${id} has both halves, the first in the Lugdi week and the second in the Station week`, !!h.a && !!h.b && h.a.day.n <= 7 && h.b.day.n > 7)
  }
  const evenSave = play('even')
  const wed = dayResult(play('even', 1, DAYS.slice(0, 6)), anchorDate(3))
  const thu = dayResult(evenSave, anchorDate(11))
  record(T, "a twin's first half shows no consistency number; the second half shows the matched case", wed.consistency === null && wed.deferred && thu.comps.matching?.n === 1 && !thu.deferred)
  const transfer = DAYS.find((d) => d.transfer)!
  const tr = dayResult(evenSave, anchorDate(transfer.n))
  record(T, 'the transfer day gives no feedback: no consistency, no parts', tr.transfer && tr.consistency === null && Object.keys(tr.comps).length === 0)
  const withNote = { ...evenSave, notes: { '2026-W44': 'I chose Raju because of the words.' } }
  record(T, 'the private Sunday note changes nothing the scoring returns', JSON.stringify(fortnight(withNote)) === JSON.stringify(fortnight(evenSave)))
  const engine = readdirSync(join(ROOT, 'src/engine')).map((f) => readFileSync(join(ROOT, 'src/engine', f), 'utf8')).join('\n')
  record(T, 'nothing in the engine reads the notes', !/\b(s|saved|state)\.notes\b/.test(engine))

  const s = (ds: string[]) => new Set(ds)
  const r1 = streak(s(['2026-10-19', '2026-10-20', '2026-10-22']), '2026-10-22')
  const r2 = streak(s(['2026-10-19', '2026-10-22']), '2026-10-22')
  const r3 = streak(s(['2026-10-19', '2026-10-20']), '2026-10-21')
  record(
    T,
    'streak: counts days played; one missed day a week is forgiven and shown; a second breaks it; today never breaks it',
    r1.count === 3 && r1.forgiven.has('2026-10-21') && r2.count === 1 && r3.count === 2 &&
      marks(s(['2026-10-19', '2026-10-20', '2026-10-22']), '2026-10-22').find((m) => m.date === '2026-10-21')?.mark === 'forgiven',
    `${r1.count} ${r2.count} ${r3.count}`,
  )

  const top = topOfBoard(10)
  record(T, 'board: the top ranks are in order and the sample has a spread', top.every((p, i) => i === 0 || p.practice <= top[i - 1].practice) && top[0].practice > top[9].practice)
  const lo = rankOf(10)
  const hi = rankOf(totalPractice(play('even')))
  record(T, "board: more practice is a better rank; the player's band is a top percentage", hi.rank < lo.rank && hi.topPercent <= lo.topPercent && hi.topPercent >= 1, `${hi.rank} ${lo.rank}`)

  const taken = sampleTaken()
  const offered = [0, 1, 2, 3].flatMap((r) => offers(5, r, taken))
  record(
    T,
    'road names: offers are free (not on the sample board), three different per round, and render in English and Devanagari',
    offered.every((h) => !taken.has(handleKey(h))) &&
      new Set(offered.slice(0, 3).map(handleKey)).size === 3 &&
      offered.every((h) => /^[A-Z][A-Za-z ]+( \d+)?$/.test(handleText(h, 'en')) && /[ऀ-ॿ]/.test(handleText(h, 'hi'))),
    offered.slice(0, 3).map((h) => handleText(h, 'en')).join(', '),
  )
  record(T, 'road names on the sample board are unique', new Set(sampleNamed().map((p) => p.key)).size === sampleNamed().length)
}
