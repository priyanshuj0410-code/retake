/**
 * Acceptance test 5: no instructed items. The item banks hold no instructed, dummy or
 * attention-check item, and the repeat pairs are real items: a bank audit against the
 * registered item lists (the content files), and an audit of what sessions actually ask.
 */
import { directItems, screeningItems, surveyItems, xw } from '../src/content'
import { playDemo } from '../src/demo/players'
import { DEPLOYMENTS } from '../src/engine/config'
import { record } from './lib/check'

const T = 'AT-5 no instructed items'
const INSTRUCTED =
  /\b(select|choose|tick|click|press|mark)\b.*\b(option|answer|box|this)\b|attention check|paying attention|to show (that )?you are|please answer|if you are reading|leave this|for this (item|question)|correct answer|strongly (agree|disagree) (for|here)/i

export async function run() {
  const bank = [
    ...surveyItems.map((i) => ['survey', i.id, i.text.en, i.text.hinglish]),
    ...directItems.map((i) => ['direct', i.id, i.text.en, i.text.hinglish]),
    ...screeningItems.map((i) => ['screening', i.id, i.text.en, i.text.hinglish]),
    ...[
      ...xw.m1hStatements,
      ...xw.m1hControls,
      ...xw.m3Items,
      ...xw.rcItems,
      xw.anchor,
      xw.knownZero,
      ...xw.neutral,
      ...xw.practice.direct,
      ...xw.practice.crosswise,
    ].map((i) => ['crosswise', i.id, i.text.en, i.text.hinglish]),
  ]
  const hits = bank.filter(([, , en]) => INSTRUCTED.test(en))
  record(
    T,
    `no item in the banks instructs an answer or checks attention (${bank.length} items)`,
    hits.length === 0,
    hits.map((h) => h[1]).join(', '),
  )
  const ids = bank.map((b) => b[1])
  record(T, 'every item id is unique', new Set(ids).size === ids.length)
  record(
    T,
    'the repeat pairs are survey items flagged repeat, nothing else',
    surveyItems.filter((i) => i.repeat).length === 8 &&
      directItems.filter((i) => i.repeat).length === 4,
  )
  const registered = new Set(ids)
  for (const dep of DEPLOYMENTS) {
    const p = await playDemo(
      5,
      dep,
      ['en'],
      dep === 'firm' ? { timingArm: 'before', batchMonth: '2026-11', sex: 'man' } : undefined,
    )
    const asked = p.runner.steps.flatMap((s) =>
      s.kind === 'survey'
        ? [s.item.id]
        : s.kind === 'screening'
          ? [s.id]
          : s.kind === 'xw' || s.kind === 'xw-direct' || s.kind === 'm1h-direct'
            ? [s.item.id]
            : [],
    )
    record(
      T,
      `${dep}: every item asked is a registered bank item`,
      asked.every((i) => registered.has(i)),
    )
    const sv = p.runner.steps.filter((s) => s.kind === 'survey')
    const seconds = sv.filter((s) => s.kind === 'survey' && s.second)
    record(
      T,
      `${dep}: every second asking repeats a real item word for word, asked earlier`,
      seconds.every(
        (s) =>
          s.kind === 'survey' &&
          s.item.repeat &&
          sv.findIndex((x) => x.kind === 'survey' && x.item.id === s.item.id) < sv.indexOf(s),
      ),
    )
  }
}
