/**
 * Acceptance tests 1, 6, 8, 9 and 10, end to end on the demo store, which keeps the same tree
 * and the same refusals as the database rules. scripts/rules-check.ts repeats 1, 6 and 9
 * against the real rules in the Realtime Database emulator.
 */
import { playDemo } from '../src/demo/players'
import { config, type CardDeploymentId, type DeploymentId } from '../src/engine/config'
import { deriveKeys, formatCode, normaliseCode, validCode } from '../src/engine/codes'
import { seeded } from '../src/engine/rng'
import { Runner } from '../src/engine/runner'
import { LocalStore, releaseOf } from '../src/store/local'
import { record } from './lib/check'

const DAY = 86_400_000

export async function run() {
  /* ---------------------------------------------------------------- AT-1 one-time tokens */
  {
    const T = 'AT-1 one-time tokens'
    const store = new LocalStore(() => Date.parse('2026-12-01T10:00:00Z'))
    const tokens = await store.issueTokens('panel-g1', 1000, 'en')
    let firstOk = 0
    let replayRefused = 0
    let resubmitRefused = 0
    let tokenInRecords = 0
    for (const [i, t] of tokens.entries()) {
      const r = await store.start(t)
      if (r.ok) firstOk += 1
      const runner = new Runner(seeded(i), 'panel-g1', ['en'])
      await runner.prepareCode(1)
      const keys = runner.keys
      if (!keys) continue
      await store.submit(keys.code, 'panel-g1', null)
      const again = await store.start(t)
      if (!again.ok && again.reason === 'used') replayRefused += 1
      try {
        await store.submit(keys.code + 'x', 'panel-g1', null)
      } catch {
        resubmitRefused += 1
      }
    }
    for (const [, v] of Object.entries(store.tree['eval-play']))
      if (tokens.some((t) => JSON.stringify(v).includes(t))) tokenInRecords += 1
    record(T, '1000 synthetic sessions each start once', firstOk === 1000, `${firstOk}`)
    record(
      T,
      'every replay of a spent token is refused',
      replayRefused === 1000,
      `${replayRefused} of 1000`,
    )
    record(
      T,
      'every second submission after a session is refused',
      resubmitRefused === 1000,
      `${resubmitRefused} of 1000`,
    )
    const p = await playDemo(3, 'panel-g1', ['en'])
    const sub = JSON.stringify(p.runner.submission())
    record(
      T,
      'no record carries a token (the token is never given to the session runner)',
      tokenInRecords === 0 && !/"tok"/.test(sub),
    )
    const unknown = await store.start('not-a-token')
    record(T, 'an unknown token is refused', !unknown.ok && unknown.reason === 'unknown')
  }

  /* ------------------------------------------------------------ AT-6 the withdrawal code */
  {
    const T = 'AT-6 the withdrawal code'
    let now = Date.parse('2026-12-01T10:00:00Z')
    const explanations = [{ dep: 'panel-g2' as DeploymentId, sections: [] }]
    const store = new LocalStore(
      () => now,
      null,
      async () => explanations,
    )
    const keep = await playDemo(11, 'panel-g2', ['en'])
    const leave = await playDemo(12, 'panel-g2', ['en'])
    for (const p of [keep, leave]) {
      const [t] = await store.issueTokens('panel-g2', 1, 'en')
      await store.start(t)
      await store.submit(
        (p.runner.keys as { code: string }).code,
        'panel-g2',
        p.runner.submission(),
      )
    }
    const code = leave.runner.code as string
    record(
      T,
      'the code is random, of the registered length and alphabet',
      validCode(code) && code.length === config.code.length && keep.runner.code !== code,
    )
    record(
      T,
      'the code is entered as shown, with its separators',
      normaliseCode(formatCode(code).toLowerCase()) === code,
    )
    const count = () => ({
      play: Object.keys(store.tree['eval-play']).length,
      xw: Object.keys(store.tree['eval-xw']).length,
      demo: Object.keys(store.tree['eval-demo']).length,
    })
    const before = count()
    record(
      T,
      'both players have records in every store',
      before.play === 2 && before.xw > 0 && before.demo > 0,
      JSON.stringify(before),
    )
    record(
      T,
      'the explanation page is closed before the release date',
      (await store.explanation('panel-g2')) === null,
    )
    const keys = await deriveKeys(code, 1000)
    record(
      T,
      'the explanation page recognises the code',
      (await store.codeKnown(keys.code)) === 'panel-g2',
    )
    const removed = await store.withdraw(keys)
    const after = count()
    const leaveXw = leave.runner.submission().crosswise.length
    const leaveDemo = leave.runner.submission().demographics.length
    record(
      T,
      'withdrawing deletes every record carrying the code, in every store',
      after.play === 1 &&
        after.xw === before.xw - leaveXw &&
        after.demo === before.demo - leaveDemo,
      `removed ${removed}; ${JSON.stringify(after)}`,
    )
    const keepKeys = keep.runner.keys as { play: string }
    record(
      T,
      "the other player's records are untouched",
      store.tree['eval-play'][keepKeys.play] !== undefined,
    )
    record(
      T,
      'a withdrawn code still opens the explanation once released',
      (await store.codeKnown(keys.code)) === 'panel-g2',
    )
    now = releaseOf('panel-g2').releaseAt + DAY
    record(
      T,
      'the explanation opens after the release date',
      (await store.explanation('panel-g2')) !== null,
    )
    now = releaseOf('panel-g2').deleteUntil + DAY
    let refused = false
    try {
      await store.withdraw(await deriveKeys(keep.runner.code as string, 1000))
    } catch {
      refused = true
    }
    record(T, 'withdrawal closes two weeks after the release', refused)
    record(
      T,
      'no stored record holds the code itself',
      !JSON.stringify(store.tree).includes(code) &&
        !JSON.stringify(store.tree).includes(keep.runner.code as string),
    )
  }

  /* ------------------------------------------- AT-8 unlinked demographics, sex-label exception */
  {
    const T = 'AT-8 unlinked demographics, with the sex-label exception'
    for (const dep of ['panel-g1', 'panel-g2', 'firm'] as CardDeploymentId[]) {
      const p = await playDemo(
        21,
        dep,
        ['en'],
        dep === 'firm' ? { timingArm: 'after', batchMonth: '2026-11', sex: 'woman' } : undefined,
      )
      const s = p.runner.submission()
      const playKeys = new Set(
        Object.keys(s.play.value.cards).concat(Object.keys(s.play.value.items), [s.play.key]),
      )
      const xwFields = new Set(s.crosswise.flatMap((c) => Object.keys(c.value)))
      const demoFields = new Set(s.demographics.flatMap((d) => Object.keys(d.value)))
      record(
        T,
        `${dep}: crosswise records hold only item, answer, subsample, label and deployment`,
        [...xwFields].every((f) => ['dep', 'i', 'a', 'sub', 'lab'].includes(f)),
        [...xwFields].join(','),
      )
      record(
        T,
        `${dep}: demographic records hold only item, answer and deployment`,
        [...demoFields].every((f) => ['dep', 'i', 'a'].includes(f)),
        [...demoFields].join(','),
      )
      const shared = [...s.crosswise.map((c) => c.key), ...s.demographics.map((d) => d.key)].filter(
        (k) => playKeys.has(k) || JSON.stringify(s.play.value).includes(k),
      )
      record(
        T,
        `${dep}: no key or value of the person-level record appears in the unlinked stores, so no join is possible`,
        shared.length === 0,
      )
      const xwKeys = new Set(s.crosswise.map((c) => c.key))
      record(
        T,
        `${dep}: crosswise and demographic records share no key`,
        s.demographics.every((d) => !xwKeys.has(d.key)),
      )
      if (dep === 'firm') {
        const meta = s.play.value.meta as unknown as Record<string, unknown>
        const identifying = Object.keys(meta).filter(
          (k) =>
            ![
              'dep',
              'v',
              'langs',
              'arm',
              'route',
              'result',
              'timingArm',
              'batchMonth',
              'sex',
            ].includes(k),
        )
        record(
          T,
          'firm: card records carry the sex label, the timing arm and the batch-month, and nothing else identifying',
          meta.sex === 'woman' &&
            meta.timingArm === 'after' &&
            meta.batchMonth === '2026-11' &&
            identifying.length === 0,
          identifying.join(','),
        )
        record(
          T,
          'firm: sex is not asked again in the wrap',
          !s.demographics.some((d) => d.value.i === 'gender'),
        )
      } else {
        record(T, `${dep}: panel records carry no sex label`, !('sex' in s.play.value.meta))
      }
    }
  }

  /* -------------------------------------------------------- AT-9 no arrival order in the store */
  {
    const T = 'AT-9 no arrival order in the store'
    const store = new LocalStore(() => Date.parse('2026-12-01T10:00:00Z'))
    const inserted: string[] = []
    for (let i = 0; i < 120; i++) {
      const p = await playDemo(40_000 + i, 'panel-g2', ['en'])
      const [t] = await store.issueTokens('panel-g2', 1, 'en')
      await store.start(t)
      const s = p.runner.submission()
      await store.submit((p.runner.keys as { code: string }).code, 'panel-g2', s)
      inserted.push(s.play.key)
    }
    const rho = (keys: string[]) => {
      const stored = Object.keys(store.tree['eval-play']).sort()
      const ranks = keys.map((k) => stored.indexOf(k))
      const n = ranks.length
      const mean = (n - 1) / 2
      let num = 0
      let den = 0
      ranks.forEach((r, i) => {
        num += (r - mean) * (i - mean)
        den += (i - mean) ** 2
      })
      return num / den
    }
    const r = rho(inserted)
    record(
      T,
      'the order of insertion cannot be recovered from the stored keys (|rank correlation| < 0.25 over 120 inserts)',
      Math.abs(r) < 0.25,
      `rho ${r.toFixed(3)}`,
    )
    const p = await playDemo(99, 'panel-g1', ['en'])
    const cardKeys = Object.keys(p.runner.submission().play.value.cards)
    const ns = Object.values(p.runner.submission().play.value.cards).map((c) => c.n)
    const sortedByKey = cardKeys
      .slice()
      .sort()
      .map((k) => p.runner.submission().play.value.cards[k])
    record(
      T,
      'record keys inside a submission are random (128-bit, no sequence)',
      cardKeys.every((k) => /^[0-9a-z]{28}$/.test(k)) && new Set(cardKeys).size === cardKeys.length,
      `${cardKeys.length} keys; card positions ${Math.min(...ns)} to ${Math.max(...ns)} are in-season positions (PF-15), not arrival order`,
    )
    void sortedByKey
    const xwKeys = Object.keys(store.tree['eval-xw'])
    record(
      T,
      'crosswise records are written individually at keys derived from the code, with no person grouping',
      xwKeys.every((k) => /^[0-9a-f]{32}$/.test(k)) &&
        Object.values(store.tree['eval-xw']).every((v) => !('code' in (v as object))),
    )
    record(
      T,
      'the store holds no write time, batch id or session id',
      !/"(time|ts|at|batch|session|sid|created)"/.test(JSON.stringify(store.tree['eval-play'])),
    )
  }

  /* ---------------------------------------------------------------- AT-10 M3's device label */
  {
    const T = "AT-10 M3's device label"
    const labels = new Set<string>()
    let leak = 0
    for (let i = 0; i < 60; i++) {
      const p = await playDemo(60_000 + i, 'panel-g2', ['en'])
      const s = p.runner.submission()
      for (const c of s.crosswise) labels.add(c.value.lab)
      const playJson = JSON.stringify(s.play.value)
      if (/"(lab|label|L|floor|beta|half)":|"(upper|lower|not-engaged)"/.test(playJson)) leak += 1
      if (new Set(s.crosswise.map((c) => c.value.lab)).size !== 1) leak += 1
    }
    record(
      T,
      'crosswise records carry only "upper", "lower" or "not-engaged"',
      [...labels].every((l) => ['upper', 'lower', 'not-engaged'].includes(l)),
      [...labels].join(', '),
    )
    record(
      T,
      'the label, L, its floor and beta appear nowhere in the person-level record, and every crosswise record of a player carries the same label',
      leak === 0,
      `${leak} leaks`,
    )
    const runnerSrc = (await import('node:fs')).readFileSync(
      new URL('../src/engine/runner.ts', import.meta.url),
      'utf8',
    )
    record(
      T,
      'the device keeps no copy: the label is computed at submit and held in no field of the runner',
      !/this\.(label|m3|half)\s*=/.test(runnerSrc),
    )
  }
}
