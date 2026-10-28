/**
 * The dailies' groundwork held as a test (EVAL-23): the play day that changes at 4 am India time and a day begun before
 * it finishing as that day (F-09, F-12), the five-world turn from launch Monday (F-214), the streak on any level's
 * own-day play with one day off a week and past puzzles kept out (F-62, F-66, F-210, F-49a), the twin holdback in Past
 * puzzles (F-49f), the store's checks on load and across a content change (F-173a), two windows, a full phone (F-168)
 * and Delete all. Nothing here needs a browser; the phone's store is a map in memory, and a second window is a second
 * copy of the store module.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  KEY,
  LEVELS,
  OLD_KEY,
  UNREAD_KEY,
  begin,
  commit,
  counts,
  finish,
  fresh,
  load,
  openWeek,
  parse,
  pastPuzzles,
  reconcile,
  resume,
  save,
  stepAt,
  stepSig,
  streakOf,
  weekMarks,
  type Daily,
  type Level,
  type Listed,
  type Play,
} from '../src/daily/store'
import {
  LAUNCH_MONDAY,
  WORLDS,
  addDays,
  indiaToday,
  isDate,
  isoWeek,
  launchWeek,
  mondayOf,
  playDay,
  weekStart,
  weekday,
  worldOf,
} from '../src/engine/calendar'
import { TAKE, type Step } from '../src/take/data'
import { KEY as TAKE_KEY, SIG, forget as deleteAll } from '../src/take/store'
import { record } from './lib/check'

const T = 'Y the dailies: the 4 am day, five worlds, the streak, past puzzles and their store'
const ROOT = new URL('..', import.meta.url).pathname
/** An India time as the device clock reads it. */
const ist = (t: string) => Date.parse(`${t}+05:30`)

const STEPS = TAKE.flow.filter((x): x is Step => x.type === 'step')
const step = (id: string) => STEPS.find((x) => x.id === id)!

/** A level begun and finished on the play day `today` (its own day unless a later one is given). */
const played = (s: Daily, date: string, level: Level = 'easy', today = date) =>
  finish(begin(s, date, level, { id: `${date}-${level}` }, today), date, level, today)
/** The list's entries as "date/level", newest first as Past puzzles gives them. */
const named = (list: readonly Listed[]) => list.map((x) => `${x.date}/${x.level}`).join(' ')
const playedOn = (list: [string, Level][]) => list.reduce((s, [d, l]) => played(s, d, l), fresh())

export async function run() {
  const before = playDay(ist('2026-10-28T03:59:00'))
  const after = playDay(ist('2026-10-28T04:01:00'))
  const newYear = playDay(ist('2027-01-01T03:59:00'))
  record(
    T,
    'the play day changes at 4 am India time: 3:59 am is still the day before, 4:01 am the new day, New Year included',
    before === '2026-10-27' && after === '2026-10-28' && newYear === '2026-12-31' && playDay(ist('2027-01-01T04:01:00')) === '2027-01-01',
    `${before} ${after} ${newYear}`,
  )
  record(
    T,
    "the gate's calendar date still changes at midnight (indiaToday keeps its meaning)",
    indiaToday(ist('2026-10-28T03:59:00')) === '2026-10-28' && indiaToday(ist('2026-10-27T23:59:00')) === '2026-10-27',
  )

  const pick = step('station-3')
  const team = step('station-1')
  const d1 = playDay(ist('2026-10-28T03:50:00'))
  let s = begin(fresh(), d1, 'easy', { id: 'p1' }, d1)
  s = commit(s, d1, 'easy', pick, { pick: pick.people[0].en })
  const d2 = playDay(ist('2026-10-28T04:10:00'))
  const reopened = resume(s, d2)
  record(
    T,
    'a day begun at 3:50 am is found again at 4:10 am, the next play day, and reopens on its first step without an answer',
    reopened?.date === d1 && reopened.level === 'easy' && stepAt(s.days[d1]!.easy!, [pick, team]) === 1 &&
      resume(s, addDays(d2, 1)) === null && resume(finish(s, d1, 'easy', d2), d2) === null,
    JSON.stringify(reopened),
  )
  const both = begin({ ...s, level: 'hard' }, d2, 'hard', { id: 'h' }, d2)
  record(
    T,
    "with two plays open, resume takes the remembered level's, then the older day's",
    resume(both, d2)?.level === 'hard' && resume({ ...both, level: 'medium' }, d2)?.date === d1,
  )
  s = finish(s, d1, 'easy', d2)
  const p1 = s.days[d1]?.easy
  record(
    T,
    'a day begun at 3:50 am and finished at 4:10 am finishes as the day it began, played on its day',
    d1 === '2026-10-27' && d2 === '2026-10-28' && !!p1?.done && p1.onDay && p1.begun === d1 && !s.days[d2] &&
      streakOf(s, d2).count === 1 && counts(s, d2).today.easy === 0 && counts(s, d2).week.easy === 1,
    `${d1} ${d2}`,
  )
  record(
    T,
    "each puzzle plays once, and tomorrow's cannot be begun",
    begin(s, d1, 'easy', { id: 'again' }, d2) === s && commit(s, d1, 'easy', pick, { pick: pick.people[1].en }) === s &&
      Object.keys(begin(fresh(), '2026-10-29', 'easy', { id: 'p2' }, '2026-10-28').days).length === 0,
  )
  const left = begin(played(fresh(), '2026-11-02'), '2026-11-03', 'easy', { id: 'e' }, '2026-11-03')
  const late = finish(left, '2026-11-03', 'easy', '2026-11-05')
  const lateCounts = counts(late, '2026-11-05')
  record(
    T,
    'a puzzle begun on its day and finished two play days later is a past puzzle: All time only, the gap stays',
    late.days['2026-11-03']?.easy?.done === true && late.days['2026-11-03']?.easy?.onDay === false &&
      streakOf(late, '2026-11-05').count === 0 && weekMarks(late, '2026-11-05')[1].mark === 'missed' &&
      lateCounts.week.easy === 1 && lateCounts.allTime.easy === 2 && resume(left, '2026-11-05') === null,
    `${streakOf(late, '2026-11-05').count} ${JSON.stringify(lateCounts)}`,
  )
  const clock = playedOn([['2026-11-02', 'easy'], ['2026-11-04', 'easy'], ['2026-11-06', 'easy']])
  const wound = played(clock, '2026-11-05', 'easy', '2026-11-05')
  record(
    T,
    "a phone whose clock went back plays a missed day as a past puzzle: it mends no gap, and opens no earlier Sunday's week",
    streakOf(clock, '2026-11-06').count === 2 && wound.days['2026-11-05']?.easy?.onDay === false &&
      streakOf(wound, '2026-11-06').count === 2 && weekMarks(wound, '2026-11-06')[3].mark === 'forgiven' &&
      openWeek(played(fresh(), '2026-11-09'), '2026-11-08').sundays.length === 0,
    `${streakOf(wound, '2026-11-06').count}`,
  )

  const L = '2026-11-02'
  const turn = [...Array(11).keys()].map((w) => [...Array(7).keys()].map((k) => worldOf(addDays(L, w * 7 + k), L)))
  const want = ['lugdi', 'station', 'jadugar', 'cricket', 'rukavat', 'lugdi', 'station', 'jadugar', 'cricket', 'rukavat', 'lugdi']
  record(
    T,
    'five worlds a week each from launch Monday, weeks 1 to 11: Lugdi, Station, Jadugar, Cricket, Rukavat, then again',
    turn.every((week, w) => week.every((x) => x === want[w])),
    turn.map((week) => week[0]).join(' '),
  )
  record(
    T,
    'New Year does not slip the turn: ISO week 53 and 1 January share one week and one world, and the next Monday moves on one',
    isoWeek('2026-12-31').week === 53 && ['2026-12-28', '2026-12-31', '2027-01-01', '2027-01-03'].every((d) => worldOf(d, L) === 'cricket') &&
      worldOf('2027-01-04', L) === 'rukavat',
  )
  const jan1 = `${Number(LAUNCH_MONDAY.slice(0, 4)) + 1}-01-01`
  const mondays = [...Array(12).keys()].map((i) => addDays(mondayOf(jan1), (i - 6) * 7))
  record(
    T,
    'LAUNCH_MONDAY is a Monday in Lugdi, and from it each Monday moves the turn on one world, across the next New Year too',
    weekday(LAUNCH_MONDAY) === 1 && worldOf(LAUNCH_MONDAY) === 'lugdi' &&
      mondays.every((m, i) => i === 0 || WORLDS.indexOf(worldOf(m)) === (WORLDS.indexOf(worldOf(mondays[i - 1])) + 1) % WORLDS.length) &&
      (weekday(jan1) === 1 || worldOf(addDays(jan1, -1)) === worldOf(jan1)),
    `${LAUNCH_MONDAY}; ${mondays.map((m) => worldOf(m)).join(' ')}`,
  )
  record(
    T,
    'before launch every date is in week 1 and Lugdi, never week 0 or the end of the turn, and keeps its own Monday',
    ['2026-10-19', '2026-10-28', '2026-11-01'].every((d) => launchWeek(d, L) === 1 && worldOf(d, L) === 'lugdi') &&
      weekStart('2026-10-28', L) === '2026-10-26' && weekStart('2026-11-01', L) === '2026-10-26' && launchWeek('2026-11-09', L) === 2,
    ['2026-10-19', '2026-10-28'].map((d) => `${launchWeek(d, L)} ${worldOf(d, L)}`).join(', '),
  )

  const one = playedOn([['2026-10-19', 'easy'], ['2026-10-20', 'hard'], ['2026-10-22', 'medium']])
  const r1 = streakOf(one, '2026-10-22')
  const m1 = weekMarks(one, '2026-10-22')
  record(
    T,
    'streak: any one level played on its day counts; one missed day a week is forgiven and marked off, in a Monday to Sunday week',
    r1.count === 3 && r1.forgiven.has('2026-10-21') && m1.find((m) => m.date === '2026-10-21')?.mark === 'forgiven' &&
      m1.length === 7 && m1[0].date === '2026-10-19' && m1[6].date === '2026-10-25' && m1[6].mark === 'future',
    `${r1.count}; ${m1.map((m) => m.mark).join(' ')}`,
  )
  const two = playedOn([['2026-10-19', 'easy'], ['2026-10-22', 'easy']])
  const open = playedOn([['2026-10-19', 'easy'], ['2026-10-20', 'easy']])
  record(
    T,
    'streak: a second missed day in the week breaks it; today, not yet played, never does',
    streakOf(two, '2026-10-22').count === 1 && streakOf(open, '2026-10-21').count === 2 &&
      weekMarks(open, '2026-10-21').find((m) => m.date === '2026-10-21')?.mark === 'today',
    `${streakOf(two, '2026-10-22').count} ${streakOf(open, '2026-10-21').count}`,
  )
  const broke = playedOn([['2026-11-02', 'easy']])
  const again = playedOn([['2026-11-02', 'easy'], ['2026-11-05', 'easy']])
  const brokeMarks = weekMarks(broke, '2026-11-05').map((m) => m.mark).join(' ')
  record(
    T,
    'streak: a missed day after the streak broke is missed, never off, played again on the day after or not',
    streakOf(broke, '2026-11-05').count === 0 && streakOf(broke, '2026-11-05').forgiven.size === 0 &&
      brokeMarks === 'played missed missed today future future future' &&
      streakOf(again, '2026-11-05').count === 1 && streakOf(again, '2026-11-05').forgiven.size === 0 &&
      streakOf(two, '2026-10-22').forgiven.size === 0,
    brokeMarks,
  )
  const mended = played(played(two, '2026-10-20', 'easy', '2026-10-22'), '2026-10-21', 'medium', '2026-10-22')
  const c = counts(mended, '2026-10-22')
  record(
    T,
    'a past puzzle mends no gap: it adds to All time only, never to Today, This week or the streak',
    mended.days['2026-10-20']?.easy?.onDay === false && streakOf(mended, '2026-10-22').count === 1 &&
      weekMarks(mended, '2026-10-22').find((m) => m.date === '2026-10-20')?.mark === 'missed' &&
      c.allTime.easy === 3 && c.allTime.medium === 1 && c.week.easy === 2 && c.week.medium === 0 && c.today.easy === 1 && c.today.medium === 0,
    JSON.stringify(c),
  )
  const sunday = playDay(ist('2026-10-26T02:00:00'))
  const week = openWeek(playedOn(['19', '20', '21', '22', '23', '24'].map((d) => [`2026-10-${d}`, 'easy'])), sunday)
  record(
    T,
    "opening the week counts as Sunday's day until Monday's 4 am; opening it on a weekday keeps nothing",
    sunday === '2026-10-25' && streakOf(week, '2026-10-26').count === 7 && weekMarks(week, '2026-10-25')[6].mark === 'played' &&
      openWeek(fresh(), '2026-10-22').sundays.length === 0,
    `${sunday} ${streakOf(week, '2026-10-26').count}`,
  )

  const listed: Listed[] = [
    { date: '2026-10-20', level: 'easy', twins: ['t9'] },
    { date: '2026-10-21', level: 'easy' },
    { date: '2026-10-23', level: 'hard' },
    { date: '2026-10-23', level: 'easy', twins: ['t9'] },
  ]
  const P = '2026-11-02'
  const half = played(fresh(), '2026-10-20', 'easy', P)
  const shown = (st: Daily, today: string) => named(pastPuzzles(st, today, listed))
  const held = [...Array(7).keys()].map((i) => shown(half, addDays(P, i)))
  const day8 = shown(half, addDays(P, 7))
  record(
    T,
    'Past puzzles: once one half of a hidden pair is played, the whole day with the other half is held back 7 days and back on day 8, newest first',
    held.every((x) => x === '2026-10-21/easy') && day8 === '2026-10-23/easy 2026-10-23/hard 2026-10-21/easy' &&
      shown(begin(half, '2026-10-23', 'hard', { id: 'h' }, P), P) === '2026-10-23/hard 2026-10-21/easy' &&
      pastPuzzles(half, P, listed).every((x) => listed.includes(x)),
    `${held[0]}; ${day8}`,
  )
  const pastOnly: Listed[] = [
    { date: '2026-11-03', level: 'easy' },
    { date: '2026-11-03', level: 'hard', twins: ['p'] },
    { date: '2026-11-04', level: 'easy' },
  ]
  const Q = '2026-11-05'
  const todayHalf = finish(begin(fresh(), Q, 'easy', { id: 'e', twins: ['p'] }, Q), Q, 'easy', Q)
  const ahead: Listed[] = [...pastOnly, { date: Q, level: 'easy', twins: ['p'] }, { date: addDays(Q, 1), level: 'easy' }]
  record(
    T,
    "Past puzzles: an unfinished one stays to be finished; today's and later are never listed; today's half holds back the past day even when only past days are listed",
    shown(begin(fresh(), '2026-10-20', 'easy', { id: 'p' }, P), P) === '2026-10-21/easy 2026-10-20/easy' &&
      named(pastPuzzles(todayHalf, Q, pastOnly)) === '2026-11-04/easy' && named(pastPuzzles(todayHalf, Q, ahead)) === '2026-11-04/easy' &&
      named(pastPuzzles(todayHalf, addDays(Q, 7), pastOnly)) === '2026-11-04/easy 2026-11-03/easy 2026-11-03/hard',
    named(pastPuzzles(todayHalf, Q, pastOnly)),
  )

  const good: Play = { id: 'e1', answers: { [pick.id]: { pick: pick.people[0].en, s: stepSig(pick) } }, done: true, begun: '2026-10-20', onDay: true }
  const stored = {
    v: 1,
    days: {
      '2026-10-20': { easy: good, medium: { ...good, onDay: 'yes' }, expert: good },
      '2026-10-21': { hard: { ...good, begun: '2026-10-21', answers: { ...good.answers, broken: { pick: 3 } } } },
      '2026-02-30': { easy: good },
    },
    level: 'hard',
    suggested: true,
    met: ['pick', 7, 'team'],
    sundays: ['2026-10-25', '2026-10-24'],
    notes: { '2026-10-19': 'Same words, so the same answer.', '2026-10-20': 'not a Monday' },
  }
  const r = parse(JSON.stringify(stored))
  const dropped = ['days/2026-10-20/medium', 'days/2026-10-20/expert', 'days/2026-10-21/hard/broken', 'days/2026-02-30', 'met/1', 'sundays/1', 'notes/2026-10-20']
  record(
    T,
    'a bad stored entry is dropped and named while the rest is kept; a finished day keeps its done mark when one answer is dropped',
    r.s.days['2026-10-20']?.easy?.done === true && !r.s.days['2026-10-20']?.medium && r.s.days['2026-10-21']?.hard?.done === true &&
      !!r.s.days['2026-10-21']?.hard?.answers[pick.id] && !r.s.days['2026-02-30'] && r.s.level === 'hard' && r.s.suggested &&
      r.s.met.join() === 'pick,team' && r.s.sundays.join() === '2026-10-25' && Object.keys(r.s.notes).join() === '2026-10-19' &&
      [...r.dropped].sort().join() === [...dropped].sort().join(),
    r.dropped.join(', '),
  )
  const odd = parse(JSON.stringify({
    v: 1,
    days: {
      '2026-10-20': {
        easy: { ...good, onDay: false, startedAt: 1730000000000, answers: { [pick.id]: { pick: pick.people[0].en, s: 'q', t: 1730000000000 } } },
        medium: { ...good, begun: '2026-10-21' },
        hard: { ...good, twins: ['t9', 3] },
      },
    },
    notes: { '2026-10-19': '' },
  }))
  const oddEasy = odd.s.days['2026-10-20']?.easy
  record(
    T,
    "a kept answer keeps only its known fields (a time rides along nowhere); a cleared note is not reported as lost; a play marked on its day but begun later is dropped",
    !!oddEasy && !oddEasy.onDay && Object.keys(oddEasy).sort().join() === 'answers,begun,done,id,onDay' &&
      Object.keys(oddEasy.answers[pick.id] ?? {}).sort().join() === 'pick,s' && !odd.s.days['2026-10-20']?.medium &&
      !!odd.s.days['2026-10-20']?.hard && !odd.s.days['2026-10-20']?.hard?.twins && Object.keys(odd.s.notes).length === 0 &&
      odd.dropped.sort().join() === 'days/2026-10-20/hard/twins,days/2026-10-20/medium',
    odd.dropped.join(', '),
  )
  record(
    T,
    'an unreadable store starts fresh and says so; an empty phone starts fresh with nothing dropped',
    JSON.stringify(parse('{"v":1,').s) === JSON.stringify(fresh()) && parse('{"v":1,').dropped.join() === 'store' &&
      parse(JSON.stringify({ v: 2 })).dropped.join() === 'store' && parse(null).dropped.length === 0,
  )

  record(T, "a step's content signature is the First take's recipe (SIG) for every one of its steps", STEPS.every((x) => stepSig(x) === SIG[x.id]))
  const day = '2026-10-28'
  let u = begin(fresh(), day, 'medium', { id: 'm1' }, day)
  u = commit(u, day, 'medium', pick, { pick: pick.people[0].en })
  u = commit(u, day, 'medium', team, { set: team.people.slice(0, team.need).map((x) => x.en) })
  const changed: Step = { ...pick, people: pick.people.map((x, i) => (i === 0 ? { ...x, vals: [...x.vals, '1'] } : x)) }
  const reworded: Step = { ...team, q: ['Who goes on the trip?', 'यात्रा पर कौन जाएगा?'] }
  const done = finish(u, day, 'medium', day)
  const kept = reconcile(done, day, 'medium', { id: 'm1-fixed', steps: [changed, reworded] })
  record(
    T,
    'a finished day stays finished when its content signature changes: nothing dropped, the changed step named',
    kept.s === done && kept.dropped.length === 0 && kept.stale.join() === pick.id,
    kept.stale.join(),
  )
  const fixed = reconcile(u, day, 'medium', { id: 'm1-fixed', steps: [changed, reworded] })
  const fp = fixed.s.days[day]?.medium
  record(
    T,
    'an unfinished day keeps the steps that still fit, a reworded one included, drops the changed one and says so',
    fixed.dropped.join() === pick.id && !!fp && !fp.done && !fp.answers[pick.id] && !!fp.answers[team.id] && fp.id === 'm1-fixed',
    fixed.dropped.join(),
  )

  record(
    T,
    "the daily store keeps only F-116's list: plays by date and level (with their puzzle's twin pairs), the level, the suggestion shown, kinds met, Sundays opened and notes",
    Object.keys(fresh()).sort().join() === 'days,level,met,notes,suggested,sundays,v' &&
      Object.keys(one.days['2026-10-19']?.easy ?? {}).sort().join() === 'answers,begun,done,id,onDay' &&
      Object.keys(todayHalf.days[Q]?.easy ?? {}).sort().join() === 'answers,begun,done,id,onDay,twins',
  )
  const source = readFileSync(join(ROOT, 'src/daily/store.ts'), 'utf8')
  record(T, "the First take adds nothing to the dailies: their store never reads the take's key or store (F-205)", !/retake\.take|from '\.\.\/take\/store'/.test(source))

  const had = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const mem = new Map<string, string>()
  // a full phone refuses every write
  let full = false
  const phone = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (full) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      mem.set(k, String(v))
    },
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size
    },
  }
  const onPhone = () => parse(mem.get(KEY) ?? null).s
  Object.defineProperty(globalThis, 'localStorage', { value: phone, configurable: true, writable: true })
  try {
    const back = save(one) && JSON.stringify(load().s) === JSON.stringify(one) && load().dropped.length === 0
    record(T, 'the daily store saves and loads back the same state', back)
    const more = played(one, '2026-10-23')
    full = true
    const refused = !save(more) && !onPhone().days['2026-10-23']
    full = false
    record(T, 'a full phone: save says the day was not kept (F-168), and the next save once there is room keeps it', refused && save(more) && !!onPhone().days['2026-10-23']?.easy?.done)

    deleteAll()
    const unreadable = '{"v":"1","days":{"2026-10-28":{"easy":{"id":"e","answers":{},"done":true,"begun":"2026-10-28","onDay":true}}}}'
    mem.set(KEY, unreadable)
    const unread = load()
    record(
      T,
      'a kept store this version cannot read is set aside before anything is written over it (F-173a)',
      unread.dropped.join() === 'store' && save(played(unread.s, day, 'medium')) && mem.get(UNREAD_KEY) === unreadable && !!onPhone().days[day]?.medium?.done,
    )

    // a second window of the app on this phone: the same store code with its own memory of what it last read or wrote
    const other = (await import(new URL('../src/daily/store.ts?window=2', import.meta.url).href)) as typeof import('../src/daily/store')
    deleteAll()
    const easy = played(load().s, day, 'easy')
    const medium = played(other.load().s, day, 'medium')
    const wrote = save(easy) && other.save(medium) && save(begin(easy, day, 'hard', { id: 'h' }, day))
    const joined = onPhone().days[day]
    const taken = other.adopt().s
    full = true
    const quiet = other.save(taken)
    full = false
    record(
      T,
      "two windows: each keeps the level the other finished, whoever writes last, and a window that adopts the other's state writes nothing back",
      wrote && !!joined?.easy?.done && !!joined.medium?.done && !!joined.hard && !joined.hard.done && streakOf(onPhone(), day).count === 1 &&
        !!taken.days[day]?.easy?.done && quiet,
      Object.keys(joined ?? {}).join(),
    )
    deleteAll()
    const stale = other.save(commit(taken, day, 'hard', pick, { pick: pick.people[0].en })) && !mem.has(KEY)
    const restart = other.save(played(other.freshElsewhere(), day, 'hard')) && Object.keys(onPhone().days[day] ?? {}).join() === 'hard'
    record(
      T,
      'Delete all in one window is never written back by another still open, which keeps nothing until it starts again from a first visit',
      stale && restart,
      [...mem.keys()].join(', '),
    )

    deleteAll()
    const split = step('rukavat-1')
    const who = split.people.map((x) => x.en)
    let lived = playedOn(['19', '20', '21', '22', '23'].map((d) => [`2026-10-${d}`, 'easy']))
    const sat = '2026-10-24'
    lived = begin(lived, sat, 'hard', { id: 'h', twins: ['t1'] }, sat)
    lived = commit(lived, sat, 'hard', pick, { pick: pick.people[0].en })
    lived = commit(lived, sat, 'hard', team, { set: team.people.slice(0, team.need).map((x) => x.en) })
    lived = commit(lived, sat, 'hard', split, {
      chores: { [who[0]]: 3, [who[1]]: 2 },
      given: Object.fromEntries((split.chores ?? []).map((_, i) => [i, who[i % who.length]])),
    })
    lived = openWeek(finish(lived, sat, 'hard', sat), '2026-10-25')
    save({ ...lived, met: ['pick', 'team', 'split'], notes: { '2026-10-19': 'Same words, same answer.' } })
    const PLAY = ['answers', 'begun', 'done', 'id', 'onDay', 'twins']
    const ANSWER = ['chores', 'given', 'order', 'pick', 's', 'set']
    const only = (o: object, ok: readonly string[]) => Object.keys(o).every((k) => ok.includes(k))
    const raw = JSON.parse(mem.get(KEY) ?? 'null') as Daily
    const plays = Object.values(raw.days).flatMap((l) => LEVELS.flatMap((x) => l[x] ?? []))
    record(
      T,
      "a played week leaves only F-116's fields on the phone, each date a real date: walked after begin, commit, finish, the week opened and a note",
      only(raw, Object.keys(fresh())) && Object.keys(raw.days).every(isDate) && Object.values(raw.days).every((l) => only(l, LEVELS)) &&
        raw.sundays.join() === '2026-10-25' && Object.keys(raw.notes).every(isDate) && plays.length === 6 &&
        plays.every((p) => only(p, PLAY) && isDate(p.begun) && Object.values(p.answers).every((a) => only(a, ANSWER))) &&
        plays.some((p) => Object.keys(p.answers).length === 3),
      Object.keys(raw.days).join(' '),
    )

    mem.set(TAKE_KEY, '{}')
    mem.set(OLD_KEY, '{}')
    mem.set(UNREAD_KEY, '{}')
    mem.set('other', '1')
    deleteAll()
    const gone = !mem.has(TAKE_KEY) && !mem.has(KEY) && !mem.has(UNREAD_KEY) && !mem.has(OLD_KEY) && mem.has('other')
    record(
      T,
      "Delete all clears the First take, the dailies, a store set aside unread and the turned-down build's elt:v1",
      gone && save(one) && mem.has(KEY),
      [...mem.keys()].join(', '),
    )
  } finally {
    if (had) Object.defineProperty(globalThis, 'localStorage', had)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
}
