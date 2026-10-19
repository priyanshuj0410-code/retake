import { useCallback, useEffect, useState } from 'react'
import { config, devRoutes } from './engine/config'
import { enrolmentKey } from './engine/codes'
import { store, today } from './store'
import { Play } from './screens/Play'
import { Enrol, Explain, Home, SeasonLanding, Withdraw } from './screens/Pages'
import { Results } from './screens/Results'
import { Profile } from './screens/Profile'
import { Notice, Page } from './ui'

const route = () => location.hash.replace(/^#/, '').split('?')[0] || '/'

export function App() {
  const [path, setPath] = useState(route)
  useEffect(() => {
    const on = () => setPath(route())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((h: string) => {
    location.hash = h
  }, [])
  const [, kind, arg] = path.split('/')
  const startToken = useCallback(() => store.start(arg ?? ''), [arg])
  const startFirm = useCallback(async () => {
    const r = await store.startEnrolment(await enrolmentKey(arg ?? ''), today())
    if (!r.ok || !r.enrolment) return r
    return {
      ...r,
      firm: { timingArm: r.enrolment.arm, batchMonth: r.enrolment.month, sex: r.enrolment.sex },
    }
  }, [arg])
  const closed = (
    <Page surface="oof" stepKey="none">
      <Notice>Open the link you were sent to play.</Notice>
    </Page>
  )
  switch (kind) {
    case 'play':
      return <Play key={path} start={startToken} firm={false} />
    case 'firm':
      return devRoutes() ? <Play key={path} start={startFirm} firm /> : closed
    case 'enrol':
      return devRoutes() ? <Enrol firm={arg ?? ''} /> : closed
    case 'dev':
      return devRoutes() ? <Home go={go} /> : closed
    case 'explain':
      return <Explain />
    case 'withdraw':
      return <Withdraw />
    case 'profile':
      return <Profile go={go} />
    case 'results':
      return config.demo ? <Results /> : null
    default:
      return config.demo ? <SeasonLanding go={go} /> : closed
  }
}
