import { Board, COMMIT, SkinContext } from '../boards'
import { emptyAnswer, isComplete, type Answer } from '../engine/answers'
import { hash } from '../engine/rng'
import { useT } from '../i18n'
import { store, useSaved, type DayRecord } from '../store'
import { Button, Heading, Masthead, Shell, Stack, Text, useCommit } from '../ui'
import { dayOf, handleOf, useMeta } from './common'

/** Today's puzzle, step by step. Every change is saved, so a reload carries on. */
export function Play(props: { date: string; go: (h: string) => void }) {
  const { t, tx, lang } = useT()
  const saved = useSaved()
  const day = dayOf(props.date)
  const rec: DayRecord = saved.days[props.date] ?? {
    n: day.n,
    answers: day.steps.map(() => null),
    at: 0,
    done: false,
  }
  const at = Math.min(rec.at, day.steps.length - 1)
  const step = day.steps[at]
  const answer: Answer = rec.answers[at] ?? emptyAnswer(step)
  const put = (r: DayRecord) => store.update((s) => ({ ...s, days: { ...s.days, [props.date]: r } }))
  /* This player's order for the step's people: a hash of seed, date, step and person. */
  const order = <T,>(xs: T[], key: (x: T) => string) => {
    const rank = (x: T) => hash(`${saved.seed}|${props.date}|${step.id}|${key(x)}`)
    return [...xs].sort((a, b) => rank(a) - rank(b))
  }
  const [stamped, commit] = useCommit(() => {
    const last = at === day.steps.length - 1
    put({ ...rec, answers: rec.answers.map((x, i) => (i === at ? answer : x)), at: at + 1, done: last })
    if (last) props.go('#/result')
  })
  const meta = useMeta(props.date)
  const m = day.masthead
  return (
    <SkinContext.Provider value={day.skin}>
      <Shell meta={meta} screen={`play-${props.date}-${at}`}>
        <Masthead
          skin={day.skin}
          title={tx(m.title, { handle: handleOf(saved, lang) })}
          blurb={tx(m.blurb)}
          art={at === 0 ? m.art : undefined}
          artPosition={m.artPosition}
          roundel={m.roundel ? tx(m.roundel) : undefined}
          board={m.board}
          script={m.script}
          city={m.city ? tx(m.city) : undefined}
        />
        <Stack>
          {day.steps.length > 1 ? <Text size="s">{t('play.part', { i: at + 1, n: day.steps.length })}</Text> : null}
          <Heading>{tx(step.prompt)}</Heading>
          <Board
            key={step.id}
            step={step}
            answer={answer}
            order={order}
            onChange={(a) => put({ ...rec, answers: rec.answers.map((x, i) => (i === at ? a : x)) })}
          />
        </Stack>
        <Button disabled={!isComplete(step, answer)} stamped={stamped} onPress={commit}>
          {stamped ? t('play.stamped') : t(COMMIT[step.kind])}
        </Button>
      </Shell>
    </SkinContext.Provider>
  )
}
