import { dayByN, type Day } from '../content'
import { contentDayOf, isoWeek } from '../engine/calendar'
import { handleText } from '../engine/handles'
import { marks, streak } from '../engine/streak'
import type { Comp } from '../engine/score'
import { useT, type UiKey } from '../i18n'
import { playedDates, type Saved } from '../store'
import { Nav, Streak } from '../ui'

export const dayOf = (date: string): Day => dayByN(contentDayOf(date))

/** The series line at the top: the object's number and weekday, and the level. */
export function useMeta(date: string): [string, string] {
  const { t, tx } = useT()
  const day = dayOf(date)
  const m = day.masthead
  const wd = t(`weekday.${day.weekday}` as UiKey)
  if (day.sunday) return [`${tx(m.series)} · ${t('nav.week')} ${isoWeek(date).week}`, wd]
  const left =
    day.skin === 'lugdi' ? `${tx(m.series)} · ${t('today.no', { n: m.no })} · ${wd}` : `${tx(m.series)} ${m.no} · ${wd}`
  const right = day.level ? t('today.level', { n: day.level }) : tx(day.levelName)
  return [left, right]
}

export function TabBar(props: { at: 'today' | 'board' | 'week' }) {
  const { t } = useT()
  return (
    <Nav
      label={t('nav.label')}
      items={[
        { href: '#/', label: t('nav.today'), current: props.at === 'today' },
        { href: '#/board', label: t('nav.board'), current: props.at === 'board' },
        { href: '#/week', label: t('nav.week'), current: props.at === 'week' },
      ]}
    />
  )
}

export function StreakStrip(props: { saved: Saved; date: string }) {
  const { t, date } = useT()
  const played = playedDates(props.saved)
  const s = streak(played, props.date)
  const key: Record<string, UiKey> = {
    played: 'streak.played',
    missed: 'streak.missed',
    forgiven: 'streak.forgivenDay',
    future: 'streak.future',
    today: 'streak.today',
  }
  return (
    <Streak
      label={t('streak.label')}
      count={s.count === 1 ? t('streak.one') : t('streak.days', { n: s.count })}
      note={t('streak.forgiven')}
      marks={marks(played, props.date).map((m) => ({ ...m, label: t(key[m.mark], { date: date(m.date) }) }))}
    />
  )
}

const COMP_LABEL: Record<Comp, UiKey> = {
  rules: 'result.rules',
  matching: 'result.matching',
  checks: 'result.checks',
  words: 'result.words',
}

/** Each part of consistency as its clear number: per cent kept, n of total, checks or words apart. */
export function useCompRows(comps: Partial<Record<Comp, { n: number; total?: number }>>) {
  const { t } = useT()
  return (Object.entries(comps) as [Comp, { n: number; total?: number }][]).map(([c, v]) => ({
    label: t(COMP_LABEL[c]),
    n:
      c === 'matching'
        ? t('unit.of', { n: v.n, total: v.total ?? 0 })
        : c === 'checks'
          ? t('unit.checks', { n: v.n })
          : c === 'words'
            ? t('unit.words', { n: v.n })
            : t('unit.percent', { n: v.n }),
  }))
}

export const handleOf = (s: Saved, lang: 'en' | 'hi') => (s.handle ? handleText(s.handle, lang) : '')
