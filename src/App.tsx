import { useCallback, useEffect, useState } from 'react'
import { contentDayOf, indiaToday, readOverride, mondayOf, addDays } from './engine/calendar'
import { dayByN } from './content'
import { LANGS, LangContext, translate } from './i18n'
import { onUpdateReady } from './pwa'
import { useSaved } from './store'
import { Language, HandlePick } from './screens/Onboard'
import { Today } from './screens/Today'
import { Play } from './screens/Play'
import { Result } from './screens/Result'
import { Week } from './screens/Week'
import { BoardScreen } from './screens/Board'
import { Dev } from './screens/Dev'
import { UpdateReady } from './ui'

const parse = () => {
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?')
  return { path: path || '/', query }
}

/** The date the app plays: the prototype override if one is held, else today in India. */
export const effectiveDate = (query: string) =>
  readOverride(query) ?? readOverride(location.search) ?? indiaToday()

/** The skin and ground live on <html>, so every token and the page ground follow the day. */
export function applySkin(date: string, route: string) {
  const day = dayByN(contentDayOf(route === '/week' ? addDays(mondayOf(date), 6) : date))
  document.documentElement.dataset.skin = day.skin
  document.documentElement.dataset.ground = day.ground
}

export function App() {
  const [route, setRoute] = useState(parse)
  const saved = useSaved()
  const [update, setUpdate] = useState<(() => void) | null>(null)
  useEffect(() => onUpdateReady((apply) => setUpdate(() => apply)), [])
  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((h: string) => {
    location.hash = h
  }, [])
  const date = effectiveDate(route.query)
  const lang = saved.lang ?? 'en'
  useEffect(() => {
    applySkin(date, route.path)
    document.documentElement.lang = LANGS.find((l) => l.id === lang)?.htmlLang ?? 'en-GB'
    document.title = translate(lang, 'app.name')
  }, [date, route.path, lang])
  return (
    <LangContext.Provider value={lang}>
      <Screen path={route.path} date={date} go={go} />
      {update ? (
        <UpdateReady text={translate(lang, 'update.ready')} button={translate(lang, 'update.button')} onUpdate={update} />
      ) : null}
    </LangContext.Provider>
  )
}

function Screen(props: { path: string; date: string; go: (h: string) => void }) {
  const saved = useSaved()
  if (props.path === '/dev') return <Dev go={props.go} />
  if (!saved.lang) return <Language />
  if (!saved.handle) return <HandlePick />
  const day = dayByN(contentDayOf(props.date))
  const done = !!saved.days[props.date]?.done
  switch (props.path) {
    case '/play':
      if (day.sunday) return <Week date={props.date} go={props.go} />
      return done ? <Result date={props.date} go={props.go} /> : <Play date={props.date} go={props.go} />
    case '/result':
      return <Result date={props.date} go={props.go} />
    case '/week':
      return <Week date={props.date} go={props.go} />
    case '/board':
      return <BoardScreen date={props.date} />
    default:
      return <Today date={props.date} go={props.go} />
  }
}
