import { cast, twinHalves, type PickStep } from '../content'
import type { PickAnswer } from '../engine/answers'
import { rankOf, topOfBoard } from '../engine/board'
import { weekKey } from '../engine/calendar'
import { handleText } from '../engine/handles'
import { totalPractice, weekDates, weekSummary } from '../engine/results'
import { useT, type UiKey } from '../i18n'
import { store, useSaved, type Saved } from '../store'
import {
  Button,
  Figures,
  Heading,
  Masthead,
  NoteBox,
  Notice,
  Plate,
  Ranks,
  Reflect,
  Score,
  Shell,
  Stack,
  Text,
} from '../ui'
import { dayOf, handleOf, StreakStrip, TabBar, useCompRows, useMeta } from './common'

/** The latest played answer to a twin half, if any. */
function halfAnswer(s: Saved, n: number, step: PickStep) {
  const dates = Object.keys(s.days)
    .filter((d) => s.days[d].n === n && s.days[d].done)
    .sort()
  const d = dates.pop()
  if (!d) return null
  const i = (dayOf(d).steps as PickStep[]).findIndex((x) => x.id === step.id)
  return (s.days[d].answers[i] as PickAnswer | null) ?? null
}

/** The week's result: on Sunday the back cover or the PNR slip, on other days the week so far. */
export function Week(props: { date: string; go: (h: string) => void }) {
  const { t, tx, lang, num } = useT()
  const saved = useSaved()
  const dates = weekDates(props.date)
  const sunday = dates[6]
  const sun = dayOf(sunday)
  const isSunday = props.date === sunday
  const w = weekSummary(saved, props.date)
  const handle = handleOf(saved, lang)
  const key = weekKey(props.date)
  const m = sun.masthead
  const closed = !!saved.days[sunday]?.done

  const { a, b } = twinHalves(sun.reflect?.twin ?? 'T1')
  const reflectCols = (() => {
    if (!a || !b || a.step.kind !== 'pick' || b.step.kind !== 'pick') return []
    const line = (s: PickStep, id: string) => tx(s.options.find((o) => o.id === id)?.quote ?? { en: '' })
    const ansA = halfAnswer(saved, a.day.n, a.step)
    const ansB = halfAnswer(saved, b.day.n, b.step)
    const who = a.step.options.filter((o) => o.who).map((o) => o.id)
    const view = (s: PickStep, ans: PickAnswer | null) =>
      who.map((id) => ({
        id,
        name: tx(cast(id).name),
        art: cast(id).art,
        line: line(s, id),
        chosen: ans?.choice === id,
      }))
    if (sun.skin === 'lugdi')
      return view(a.step, ansA).map((p) => ({ label: t(`weekday.${a.day.weekday}` as UiKey), people: [p] }))
    return [
      { label: t('week.left'), people: view(a.step, ansA) },
      { label: t('week.right'), people: view(b.step, ansB) },
    ]
  })()

  const comps = useCompRows(w.comps)
  const mine = totalPractice(saved)
  const r = rankOf(mine)
  return (
    <Shell meta={useMeta(sunday)} screen={`week-${props.date}`} nav={<TabBar at="week" />}>
      <Masthead skin={sun.skin} title={tx(m.title, { handle })} blurb={tx(m.blurb)} board={m.board} />
      {w.puzzles === 0 && !closed ? <Notice>{t('week.empty')}</Notice> : null}
      <Score
        total={{ n: num(w.score), label: t('week.score') }}
        parts={[
          { n: w.consistency === null ? '0' : num(w.consistency), label: t('week.consistency') },
          { n: num(w.practice), label: t('week.practice') },
        ]}
      />
      <Figures
        rows={[
          { label: t('week.practice'), n: t('week.puzzles', { n: w.puzzles }) },
          { label: `${t('week.lean')} (${t('week.leanNote')})`, n: w.lean === null ? '0' : num(w.lean) },
        ]}
      />
      {comps.length ? (
        <Stack gap="s">
          <Heading>{t('week.parts')}</Heading>
          <Figures rows={comps} />
        </Stack>
      ) : null}
      {sun.reflect && reflectCols.length ? (
        <Plate tone="ground" label={t('week.reflect')}>
          <Stack>
            <Heading>{t('week.reflect')}</Heading>
            <Text>{tx(sun.reflect.prompt)}</Text>
            <Reflect skin={sun.skin} chose={t('week.chose')} cols={reflectCols} />
            <NoteBox
              label={t('week.note')}
              hint={t('week.noteHint')}
              value={saved.notes[key] ?? ''}
              onChange={(v) => store.update((s) => ({ ...s, notes: { ...s.notes, [key]: v } }))}
            />
          </Stack>
        </Plate>
      ) : null}
      <Ranks
        caption={t('week.board')}
        cols={[t('board.rankCol'), t('board.nameCol'), t('board.practiceCol')]}
        rows={topOfBoard(3).map((p, i) => ({
          rank: num(i + 1),
          name: handleText(p.handle, lang),
          practice: num(p.practice),
        }))}
        you={{ rank: num(r.rank), name: t('board.you', { handle }), practice: num(mine) }}
      />
      <Notice>{t('board.sample')}</Notice>
      <StreakStrip saved={saved} date={props.date} />
      <Stack>
        {isSunday ? (
          <Button
            disabled={closed}
            onPress={() =>
              store.update((s) => ({
                ...s,
                days: { ...s.days, [sunday]: { n: sun.n, answers: [], at: 0, done: true } },
              }))
            }
          >
            {closed ? t('week.closed') : t('week.close')}
          </Button>
        ) : null}
        <Button variant="secondary" onPress={() => props.go('#/board')}>
          {t('week.friend')}
        </Button>
      </Stack>
    </Shell>
  )
}
