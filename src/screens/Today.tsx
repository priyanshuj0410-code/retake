import { totalPractice } from '../engine/results'
import { useT } from '../i18n'
import { store, useSaved } from '../store'
import { Button, Figures, Masthead, Notice, Shell, Stack } from '../ui'
import { dayOf, handleOf, StreakStrip, TabBar, useMeta } from './common'

export function Today(props: { date: string; go: (h: string) => void }) {
  const { t, tx, lang, num } = useT()
  const saved = useSaved()
  const day = dayOf(props.date)
  const rec = saved.days[props.date]
  const handle = handleOf(saved, lang)
  const m = day.masthead
  return (
    <Shell meta={useMeta(props.date)} screen={`today-${props.date}`} nav={<TabBar at="today" />}>
      <Masthead
        skin={day.skin}
        title={tx(m.title, { handle })}
        blurb={tx(m.blurb)}
        art={m.art}
        artPosition={m.artPosition}
        roundel={m.roundel ? tx(m.roundel) : undefined}
        board={m.board}
        script={m.script}
        city={m.city ? tx(m.city) : undefined}
      />
      <Stack>
        {day.sunday ? (
          <Button onPress={() => props.go('#/week')}>{t('today.sunday')}</Button>
        ) : rec?.done ? (
          <>
            <Notice>{t('today.done')}</Notice>
            <Button onPress={() => props.go('#/result')}>{t('today.seeResult')}</Button>
          </>
        ) : (
          <Button onPress={() => props.go('#/play')}>{rec ? t('today.resume') : t('today.play')}</Button>
        )}
      </Stack>
      <Figures
        rows={[
          { label: t('board.nameCol'), n: handle },
          { label: t('today.practice'), n: num(totalPractice(saved)) },
        ]}
      />
      <StreakStrip saved={saved} date={props.date} />
      <Button variant="secondary" onPress={() => store.update((s) => ({ ...s, lang: lang === 'en' ? 'hi' : 'en' }))}>
        {t('lang.change')}
      </Button>
    </Shell>
  )
}
