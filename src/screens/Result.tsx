import { dayResult } from '../engine/results'
import { addDays } from '../engine/calendar'
import { useT } from '../i18n'
import { useSaved } from '../store'
import { Button, Figures, Notice, Score, Shell, Stack, Text, Title } from '../ui'
import { dayOf, StreakStrip, TabBar, useCompRows, useMeta } from './common'

/** The day's result: the score as its sum, each part as a clear number, and the streak. */
export function Result(props: { date: string; go: (h: string) => void }) {
  const { t, tx, num } = useT()
  const saved = useSaved()
  const day = dayOf(props.date)
  const r = dayResult(saved, props.date)
  const tomorrow = dayOf(addDays(props.date, 1))
  const crowd = day.steps.find((s) => s.kind === 'crowd')
  const rows = useCompRows(r.comps)
  if (r.crowdOff !== undefined) rows.push({ label: t('result.crowd'), n: num(r.crowdOff) })
  return (
    <Shell meta={useMeta(props.date)} screen={`result-${props.date}`} nav={<TabBar at="today" />}>
      <Title>{t(day.skin === 'lugdi' ? 'result.title.lugdi' : 'result.title.station')}</Title>
      {!r.played ? (
        <Text>{t('result.notPlayed')}</Text>
      ) : r.transfer ? (
        <Notice>{t('result.transfer')}</Notice>
      ) : (
        <Stack>
          <Score
            total={{ n: num(r.score), label: t('result.score') }}
            parts={[
              { n: r.consistency === null ? '0' : num(r.consistency), label: t('result.consistency') },
              { n: num(r.practice), label: t('result.practice') },
            ]}
          />
          {rows.length ? <Figures rows={rows} label={t('result.today')} /> : null}
          {crowd && crowd.kind === 'crowd' ? (
            <Notice>{t('crowd.sample', { n: crowd.sample, players: num(crowd.players) })}</Notice>
          ) : null}
          {r.deferred ? <Text size="s">{t('result.later')}</Text> : null}
        </Stack>
      )}
      <StreakStrip saved={saved} date={props.date} />
      <Text>{t('result.tomorrow', { object: tx(tomorrow.object) })}</Text>
      <Stack>
        <Button onPress={() => props.go('#/board')}>{t('result.board')}</Button>
        <Button variant="secondary" onPress={() => props.go('#/')}>
          {t('result.home')}
        </Button>
      </Stack>
    </Shell>
  )
}
