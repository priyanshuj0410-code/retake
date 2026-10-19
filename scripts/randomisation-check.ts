/**
 * Acceptance test 2 (research plan v1, section 9): per-card and per-player randomisation.
 * In 20000 seeded synthetic sessions per deployment, each draw's frequencies match their
 * registered probabilities (chi-square at 0.01), the cue draws are independent of the
 * descriptions and of the starting positions (no association at 0.01), the restricted
 * randomisation gives every player the cue-carrying counts and coverage of plan v1 4.1, and
 * no draw depends on an earlier answer except the registered note and route rules.
 */
import { config, type DeploymentId } from '../src/engine/config'
import { drawWindow } from '../src/engine/firm'
import { BANDS, TYPES, bankFor, type Presented } from '../src/engine/layout'
import { seeded } from '../src/engine/rng'
import { Runner } from '../src/engine/runner'
import { createSession, routeAndNote, type Split } from '../src/engine/session'
import { record } from './lib/check'
import { gof, independence } from './lib/stats'

const T = 'AT-2 per-card and per-player randomisation'
const N = Number(process.env.RAND_N ?? 20000)
const ALPHA = 0.01
/* Every cue is a two-of-four labelling per card (lib/stats.ts, independence). */
const RESTRICTED = 3 / 4

const pTest = (name: string, r: { p: number; stat: number; df: number }) =>
  record(T, name, r.p > ALPHA, `chi2 ${r.stat.toFixed(2)}, df ${r.df}, p ${r.p.toFixed(3)}`)

const labellingIndex = (mask: boolean[]) => {
  const all = ['1100', '1010', '1001', '0110', '0101', '0011']
  return all.indexOf(mask.map((b) => (b ? '1' : '0')).join(''))
}
const perms = (() => {
  const out: string[] = []
  const go = (rest: number[], acc: number[]) => {
    if (!rest.length) out.push(acc.join(''))
    rest.forEach((x, i) => go([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, x]))
  }
  go([0, 1, 2, 3], [])
  return out
})()

export async function run() {
  const sessions: Record<DeploymentId, ReturnType<typeof createSession>[]> = {
    'panel-g1': [],
    'panel-g2': [],
    firm: [],
  }
  for (const dep of Object.keys(sessions) as DeploymentId[])
    for (let i = 0; i < N; i++)
      sessions[dep].push(createSession(seeded(1_000_000 + i), dep, ['en', 'hinglish']))

  /* R1's arm at entry. */
  const r1 = config.deployments['panel-g1'].r1 as Record<string, number>
  const arms = Object.keys(r1)
  pTest(
    'R1 arm frequencies match config',
    gof(
      arms.map((a) => sessions['panel-g1'].filter((s) => s.draws.arm === a).length),
      arms.map((a) => r1[a]),
    ),
  )

  const cue: Presented[] = []
  const all: Presented[] = []
  const formA = (s: ReturnType<typeof createSession>) =>
    s.phase1.flatMap((st) => (st.kind === 'people' ? [st.p] : []))
  let coverageFail = 0
  let coverageFirst = ''
  const fail = (why: string) => {
    coverageFail += 1
    coverageFirst ||= why
  }
  for (const dep of Object.keys(sessions) as DeploymentId[]) {
    const d = config.deployments[dep]
    for (const s of sessions[dep]) {
      const A = formA(s).filter((p) => !p.rematch)
      const B = s.formB
      for (const p of [...A, ...B]) {
        all.push(p)
        if (!p.baseline && p.arm === 'FULL') cue.push(p)
      }
      if (s.draws.arm !== 'FULL') continue
      /* Coverage of plan v1 4.1, exactly, on every FULL session. */
      for (const [form, ps, counts] of [
        ['A', A, d.formA],
        ['B', B, d.formB],
      ] as const) {
        const nOpp = counts.opportunityPerSubstratum ?? 0
        const opp = ps.filter((p) => p.family === 'opportunity')
        if (nOpp > 0) {
          if (opp.filter((p) => p.baseline).length !== 1)
            fail(`${dep} form ${form}: opportunity baseline count`)
          for (const t of TYPES)
            for (const b of BANDS) {
              const sub = opp.filter((p) => !p.baseline && p.card.type === t && p.card.band === b)
              if (sub.length !== nOpp)
                fail(`${dep} form ${form} ${t}/${b}: ${sub.length} cue-carrying, want ${nOpp}`)
              if (nOpp === 2 && sub.filter((p) => p.presentation === 'human').length !== 1)
                fail(`${dep} ${t}/${b}: one human and one animal`)
              const free = sub.filter((p) => !p.grounds.caste)
              if (free.length > 0 && sub.filter((p) => p.grounds.religion).length !== 1)
                fail(`${dep} ${t}/${b}: religion pair on one surname-free card`)
            }
          if (nOpp === 2) {
            for (const b of BANDS) {
              const hum = opp.filter(
                (p) => !p.baseline && p.card.band === b && p.presentation === 'human',
              )
              if (
                hum.filter((p) => p.grounds.caste).length !== 1 ||
                hum.filter((p) => p.grounds.birthplace).length !== 1
              )
                fail(`${dep} ${b}: caste on one human card and birthplace on the other`)
            }
          }
        }
        const nCon = counts.conductPerStratum ?? 0
        if (nCon > 0) {
          const con = ps.filter((p) => p.family === 'conduct')
          if (con.filter((p) => p.baseline).length !== 1)
            fail(`${dep} form ${form}: conduct baseline count`)
          for (const st of ['accused-man', 'accused-woman'])
            if (con.filter((p) => !p.baseline && p.card.stratum === st).length !== nCon)
              fail(`${dep} form ${form} ${st}: conduct count`)
        }
        const nNpt = counts.npt ?? 0
        if (nNpt > 0) {
          const npt = ps.filter((p) => p.family === 'npt')
          if (
            npt.filter((p) => !p.baseline).length !== nNpt ||
            npt.filter((p) => p.baseline).length !== 1
          )
            fail(`${dep} form ${form}: NPT counts`)
        }
        for (const p of ps.filter((x) => !x.baseline)) {
          if (p.chars.filter((c) => c.sex === 'woman').length !== 2)
            fail(`${dep} ${p.card.id}: two woman-cued characters`)
          if (p.chars.some((c) => c.surname && c.born))
            fail(`${dep} ${p.card.id}: surname and birthplace on one character`)
          if (p.presentation === 'human' && !p.grounds.tone)
            fail(`${dep} ${p.card.id}: tone pair on a human card`)
          if (p.presentation === 'animal' && p.chars.some((c) => c.tone))
            fail(`${dep} ${p.card.id}: tone on an animal card`)
          if (p.presentation === 'animal' && !p.species)
            fail(`${dep} ${p.card.id}: one species per card`)
        }
        for (const p of ps.filter((x) => x.baseline))
          if (
            p.chars.some((c) => c.sex !== 'neutral' || c.surname || c.born || c.tone) ||
            p.presentation !== 'animal'
          )
            fail(`${dep} ${p.card.id}: all-baseline presentation`)
      }
      const rm = formA(s).filter((p) => p.rematch)
      if ((d.formA.rematch ?? 0) > 0) {
        if (rm.length !== 1) fail(`${dep}: one rematch`)
        else {
          const src = A.find((p) => p.card.id === rm[0].card.id)
          if (
            !src ||
            rm[0].start.join() !== src.start.slice().reverse().join() ||
            JSON.stringify(rm[0].chars) !== JSON.stringify(src.chars)
          )
            fail(`${dep}: rematch has the same characters and its order flipped`)
          const order = formA(s)
          if (
            order.findIndex((p) => p.rematch) <=
            order.findIndex((p) => p.card.id === rm[0].card.id && !p.rematch)
          )
            fail(`${dep}: rematch returns later`)
        }
      }
    }
  }
  record(
    T,
    `restricted randomisation and coverage hold in every FULL session (${N} per deployment)`,
    coverageFail === 0,
    coverageFail ? `${coverageFail} violations; first: ${coverageFirst}` : '',
  )

  /* Draw frequencies. */
  const lab = (get: (p: Presented) => boolean[] | null) => {
    const c = [0, 0, 0, 0, 0, 0]
    for (const p of cue) {
      const m = get(p)
      if (m) c[labellingIndex(m)] += 1
    }
    return c
  }
  const six = Array(6).fill(1 / 6)
  pTest(
    'sex labelling: six labellings equally likely',
    gof(
      lab((p) => p.chars.map((c) => c.sex === 'woman')),
      six,
    ),
  )
  pTest(
    'religion labelling equally likely',
    gof(
      lab((p) => (p.grounds.religion ? p.chars.map((c) => c.religion === 'muslim') : null)),
      six,
    ),
  )
  pTest(
    'caste labelling equally likely',
    gof(
      lab((p) => (p.grounds.caste ? p.chars.map((c) => c.caste === 'sc-coded') : null)),
      six,
    ),
  )
  pTest(
    'birthplace labelling equally likely',
    gof(
      lab((p) => (p.grounds.birthplace ? p.chars.map((c) => c.born?.region === 'south') : null)),
      six,
    ),
  )
  pTest(
    'tone labelling equally likely',
    gof(
      lab((p) => (p.grounds.tone ? p.chars.map((c) => c.tone === 'darker') : null)),
      six,
    ),
  )
  pTest(
    'badge labelling equally likely',
    gof(
      lab((p) => (p.grounds.badge ? p.chars.map((c) => c.badge === 'green') : null)),
      six,
    ),
  )
  const startCounts = Array(24).fill(0)
  for (const p of all) startCounts[perms.indexOf(p.start.join(''))] += 1
  pTest('starting order: 24 orders equally likely', gof(startCounts, Array(24).fill(1 / 24)))
  const nonOpp = cue.filter((p) => p.family !== 'opportunity')
  pTest(
    'presentation on NPT and conduct cards: human 1:1',
    gof(
      [
        nonOpp.filter((p) => p.presentation === 'human').length,
        nonOpp.filter((p) => p.presentation === 'animal').length,
      ],
      [0.5, 0.5],
    ),
  )
  pTest(
    'language per card for bilinguals: 1:1',
    gof(
      [all.filter((p) => p.lang === 'en').length, all.filter((p) => p.lang === 'hinglish').length],
      [0.5, 0.5],
    ),
  )

  /* The all-baseline presentation falls on each eligible bank card equally often. */
  for (const [fam, form, dep] of [
    ['opportunity', 'A', 'panel-g1'],
    ['conduct', 'A', 'panel-g1'],
    ['npt', 'A', 'panel-g1'],
    ['opportunity', 'A', 'firm'],
  ] as const) {
    const bank = bankFor(fam, form).filter((c) => c.family === fam)
    const counts = bank.map(
      (c) =>
        sessions[dep].filter(
          (s) => s.draws.arm === 'FULL' && formA(s).some((p) => p.baseline && p.card.id === c.id),
        ).length,
    )
    pTest(
      `baseline card drawn uniformly: ${dep} ${fam} form ${form}`,
      gof(
        counts,
        bank.map(() => 1 / bank.length),
      ),
    )
  }

  /* Independence of cues from descriptions and from starting positions. */
  const table = (
    rowOf: (p: Presented, i: number) => number,
    rows: number,
    isFocal: (p: Presented, i: number) => boolean | null,
  ) => {
    const t = Array.from({ length: rows }, () => [0, 0])
    for (const p of cue)
      p.chars.forEach((_, i) => {
        const f = isFocal(p, i)
        if (f !== null) t[rowOf(p, i)][f ? 0 : 1] += 1
      })
    return t
  }
  const descIndex = (p: Presented, i: number) =>
    p.card.descriptions.findIndex((d) => d.id === p.chars[i].d)
  const startPos = (p: Presented, i: number) => p.start.indexOf(i)
  const grounds: [string, (p: Presented, i: number) => boolean | null][] = [
    ['sex', (p, i) => p.chars[i].sex === 'woman'],
    ['religion', (p, i) => (p.grounds.religion ? p.chars[i].religion === 'muslim' : null)],
    ['caste', (p, i) => (p.grounds.caste ? p.chars[i].caste === 'sc-coded' : null)],
    ['birthplace', (p, i) => (p.grounds.birthplace ? p.chars[i].born?.region === 'south' : null)],
    ['tone', (p, i) => (p.grounds.tone ? p.chars[i].tone === 'darker' : null)],
  ]
  for (const [g, f] of grounds) {
    pTest(
      `${g} cue independent of the description`,
      independence(table(descIndex, 4, f), RESTRICTED),
    )
    pTest(
      `${g} cue independent of the starting position`,
      independence(table(startPos, 4, f), RESTRICTED),
    )
  }
  for (const [g, f] of grounds.slice(1)) {
    const t = [
      [0, 0],
      [0, 0],
    ]
    for (const p of cue)
      p.chars.forEach((c, i) => {
        const x = f(p, i)
        if (x !== null) t[c.sex === 'woman' ? 0 : 1][x ? 0 : 1] += 1
      })
    pTest(`${g} cue independent of sex`, independence(t, RESTRICTED))
  }

  /* The registered route and note rules (applied with uniforms drawn at entry). */
  const notes = (dep: DeploymentId, split: Split, ids: string[]) => {
    const ss = sessions[dep].filter((s) => s.draws.arm === 'FULL')
    const got = ss
      .map((s) => routeAndNote(s, split))
      .filter((r) => r.route === 'standard')
      .map((r) => r.note)
    return ids.map((id) => got.filter((n) => n === id).length)
  }
  const g1 = config.deployments['panel-g1'].notes
  pTest(
    'game 1: low scorers drawn to note b or c as configured',
    gof(notes('panel-g1', 'low', ['b', 'c']), [g1.low?.b ?? 0, g1.low?.c ?? 0]),
  )
  const g2 = config.deployments['panel-g2'].notes
  pTest(
    'game 2: low scorers drawn to note a or b as configured',
    gof(notes('panel-g2', 'low', ['a', 'b']), [g2.low?.a ?? 0, g2.low?.b ?? 0]),
  )
  pTest(
    'game 2: high scorers drawn to note a or b as configured',
    gof(notes('panel-g2', 'high', ['a', 'b']), [g2.high?.a ?? 0, g2.high?.b ?? 0]),
  )
  const high = sessions['panel-g1']
    .filter((s) => s.draws.arm === 'FULL')
    .map((s) => routeAndNote(s, 'high').route)
  pTest(
    'game 1: M1-H subsample share among high scorers',
    gof(
      [high.filter((r) => r === 'm1h').length, high.filter((r) => r !== 'm1h').length],
      [config.m1h.share, 1 - config.m1h.share],
    ),
  )
  record(
    T,
    'note c is drawn for low scorers only',
    sessions['panel-g1'].every((s) => routeAndNote(s, 'high').note !== 'c'),
  )
  record(
    T,
    'partial-arm players receive note b',
    sessions['panel-g1']
      .filter((s) => s.draws.arm !== 'FULL')
      .every((s) => routeAndNote(s, 'low').note === 'b'),
  )
  const sub = sessions['panel-g2'].map((s) => s.draws.xwSub)
  pTest(
    'crosswise subsample low or high as configured',
    gof(
      [sub.filter((x) => x === 'low').length, sub.filter((x) => x === 'high').length],
      [config.crosswise.lowSubsampleShare, 1 - config.crosswise.lowSubsampleShare],
    ),
  )

  /* The firm's play window. */
  const wr = seeded(77)
  const ws = Array.from({ length: N }, () => drawWindow(wr, '2026-11-16'))
  pTest(
    'firm play window: before and after 1:1',
    gof(
      [ws.filter((w) => w.arm === 'after').length, ws.filter((w) => w.arm === 'before').length],
      [config.firmWindows.afterShare, 1 - config.firmWindows.afterShare],
    ),
  )
  record(
    T,
    'firm windows are 7 to 1 days before or 1 to 7 days after training',
    ws.every((w) =>
      w.arm === 'before'
        ? w.from === '2026-11-09' && w.to === '2026-11-15'
        : w.from === '2026-11-17' && w.to === '2026-11-23',
    ),
  )

  /* No draw depends on an earlier answer: the same seed played with opposite answers meets the
     same cards, cues, orders, Inbox and survey order; route and note differ only through the split. */
  let depOk = true
  let why = ''
  const play = (seed: number, dep: DeploymentId, pick: 'first' | 'last') => {
    const r = new Runner(seeded(seed), dep, ['en', 'hinglish'])
    let guard = 0
    while (!r.done && guard++ < 1000) {
      const st = r.current
      if (!st) break
      const choose = <X>(xs: X[]) => (pick === 'first' ? xs[0] : xs[xs.length - 1])
      if (st.kind === 'people')
        r.answer(
          st.p.card.type === 'allocation'
            ? { units: [st.p.card.pool ?? 0, 0, 0, 0] }
            : { order: pick === 'first' ? st.p.start : st.p.start.slice().reverse() },
        )
      else if (st.kind === 'screening') r.answer(pick === 'first' ? '0' : '4')
      else if (st.kind === 'ordinary') r.answer(choose(st.d.options).id)
      else if (st.kind === 'survey') r.answer(pick === 'first' ? 0 : 4)
      else if (st.kind === 'inbox') r.answer({ label: pick === 'first' ? 0 : 5, action: 'note' })
      else if (st.kind === 'xw') r.answer(pick === 'first' ? 'same' : 'different')
      else if (st.kind === 'probe') r.answer(['sex'])
      else if (st.kind === 'submit') r.index += 1
      else r.answer(pick === 'first' ? true : false)
    }
    return r
  }
  for (let i = 0; i < 100; i++) {
    for (const dep of ['panel-g1', 'panel-g2', 'firm'] as DeploymentId[]) {
      const a = play(70_000 + i, dep, 'first')
      const b = play(70_000 + i, dep, 'last')
      const cards = (r: Runner) =>
        JSON.stringify(
          r.steps
            .filter((x) => x.kind === 'people')
            .map((x) =>
              x.kind === 'people'
                ? [x.p.card.id, x.p.chars, x.p.start, x.p.lang, x.p.presentation]
                : null,
            ),
        )
      const fixed = (r: Runner) =>
        JSON.stringify({
          d: r.session.draws,
          ib: r.session.inbox,
          so: r.session.surveyOrder,
          fb: r.session.formB,
        })
      if (fixed(a) !== fixed(b)) {
        depOk = false
        why ||= `${dep} seed ${i}: entry draws differ`
      }
      if (
        a.split === b.split &&
        (a.route !== b.route || a.note !== b.note || cards(a) !== cards(b))
      ) {
        depOk = false
        why ||= `${dep} seed ${i}: same split, different route, note or cards`
      }
    }
  }
  record(
    T,
    'no draw depends on an earlier answer except the registered note and route rules',
    depOk,
    why,
  )
}
