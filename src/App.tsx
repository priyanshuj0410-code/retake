import { useCallback, useEffect, useState } from 'react'
import { config, devRoutes } from './engine/config'
import { enrolmentKey } from './engine/codes'
import { store, today } from './store'
import { Play } from './screens/Play'
import { Enrol, Explain, Home, Withdraw } from './screens/Pages'
import { HowItWorks, Landing, SignIn } from './screens/Landing'
import { Results } from './screens/Results'
import { Profile } from './screens/Profile'
import { Notice, Page, UpdateReady } from './ui'
import { onUpdateReady } from './pwa'
import { screens } from './content'

const route = () => location.hash.replace(/^#/, '').split('?')[0] || '/'

export function App() {
  const [update, setUpdate] = useState<(() => void) | null>(null)
  useEffect(() => onUpdateReady((apply) => setUpdate(() => apply)), [])
  const screen = <Screen />
  return (
    <>
      {screen}
      {update ? (
        <UpdateReady
          text={screens.common.updateReady.en}
          button={screens.common.update.en}
          onUpdate={update}
        />
      ) : null}
    </>
  )
}

function Screen() {
  const [path, setPath] = useState(route)
  useEffect(() => {
    const on = () => setPath(route())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((h: string) => {
    location.hash = h
  }, [])
  const [, kind, arg, sub] = path.split('/')
  const startToken = useCallback(() => store.start(arg ?? ''), [arg])
  const resumeToken = useCallback(() => store.resume(arg ?? ''), [arg])
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
      return (
        <Play
          key={path}
          start={startToken}
          resume={resumeToken}
          sessionKey={arg ? `play/${arg}` : undefined}
          firm={false}
        />
      )
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
      return <Profile key={path} go={go} view={arg} arg={sub} />
    case 'signin':
      return <SignIn go={go} />
    case 'how':
      return <HowItWorks go={go} />
    case 'results':
      return config.demo ? <Results /> : null
    default:
      /* The landing (EVAL-12): what a season is, start or resume, and sign-in for returning players. */
      return <Landing go={go} />
  }
}
