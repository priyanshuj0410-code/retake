/**
 * A session from its link to its last screen. The token (panel) or the enrolment (firm) is
 * spent before the first screen, so a link starts one session only. The first screen of
 * every sitting is the four registered sentences and nothing else; in demo mode a separate
 * demo notice comes before it.
 */
import { useEffect, useRef, useState } from 'react'
import { screens } from '../content'
import type { Lang } from '../content/types'
import { config, type DeploymentId } from '../engine/config'
import { cryptoRng } from '../engine/rng'
import { Runner, type FirmLabels } from '../engine/runner'
import { store } from '../store'
import type { LangSet, StartResult } from '../store/types'
import { Page, Text, Notice } from '../ui'
import { Disclosure } from './Disclosure'
import { Consent, Declined, DemoNotice, Finished, LanguageStep } from './PreScreens'
import { StepView } from './StepView'

const S = screens

type Pre = 'demo' | 'disclosure' | 'consent' | 'language' | 'declined'

export function Play({
  start,
  firm,
}: {
  start: () => Promise<StartResult & { firm?: FirmLabels }>
  firm: boolean
}) {
  const demo = config.demo
  const [entry, setEntry] = useState<(StartResult & { firm?: FirmLabels }) | null>(null)
  const [pre, setPre] = useState<Pre>(demo ? 'demo' : 'disclosure')
  const [langs, setLangs] = useState<Lang[] | null>(null)
  const [runner, setRunner] = useState<Runner | null>(null)
  const [, setTick] = useState(0)
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'failed'>('idle')
  const [finished, setFinished] = useState<'submitted' | 'withdrawn' | null>(null)

  /* The token is spent once per mount, even where React runs an effect twice. */
  const started = useRef<ReturnType<typeof start> | null>(null)
  useEffect(() => {
    let live = true
    started.current ??= start()
    void started.current.then((r) => live && setEntry(r))
    return () => {
      live = false
    }
  }, [start])

  /* A page reload would lose the session (answers are held in memory only), so warn first. */
  useEffect(() => {
    if (!runner || finished) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [runner, finished])

  if (!entry)
    return (
      <Page surface="oof" stepKey="loading">
        <Text>…</Text>
      </Page>
    )
  if (!entry.ok) {
    const msg =
      entry.reason === 'used'
        ? S.entry.refused
        : entry.reason === 'offline'
          ? S.entry.offline
          : entry.reason === 'window'
            ? S.firm.closed
            : S.entry.unknown
    return (
      <Page
        surface="oof"
        stepKey="refused"
        title={`${S.entry.title.en} / ${S.entry.title.hinglish}`}
      >
        <Notice kind="error">{msg.en}</Notice>
        <Text lang="hi-Latn">{msg.hinglish}</Text>
      </Page>
    )
  }
  const dep: DeploymentId = entry.dep
  const langSet: LangSet = entry.langs
  const offered: Lang[] =
    langSet === 'both' || langSet === 'choose' ? ['en', 'hinglish'] : [langSet]
  const ui: Lang = langs && langs.length === 1 ? langs[0] : offered[0]

  const begin = (chosen: Lang[]) => {
    setLangs(chosen)
    setRunner(new Runner(cryptoRng(), dep, chosen, entry.firm))
  }

  if (!runner) {
    if (pre === 'demo') return <DemoNotice ui={ui} onContinue={() => setPre('disclosure')} />
    if (pre === 'disclosure')
      return (
        <Disclosure
          langs={offered}
          onContinue={() =>
            firm ? (langSet === 'choose' ? setPre('language') : begin(offered)) : setPre('consent')
          }
        />
      )
    if (pre === 'declined') return <Declined ui={ui} />
    if (pre === 'consent')
      return (
        <Consent
          ui={ui}
          demo={demo}
          onAgree={() => (langSet === 'choose' ? setPre('language') : begin(offered))}
          onDecline={() => setPre('declined')}
        />
      )
    return <LanguageStep ui={ui} demo={demo} onChoose={begin} />
  }

  if (finished) return <Finished ui={ui} demo={demo} finished={finished} />

  const step = runner.current
  if (!step) return null
  const send = async (withdraw: boolean) => {
    setSubmitState('sending')
    try {
      await runner.prepareCode()
      const keys = runner.keys
      if (!keys) throw new Error('no keys')
      await store.submit(keys.code, dep, withdraw ? null : runner.submission())
      setFinished(withdraw ? 'withdrawn' : 'submitted')
    } catch {
      setSubmitState('failed')
    }
  }
  return (
    <StepView
      runner={runner}
      step={step}
      ui={ui}
      demo={demo}
      submitState={submitState}
      onSubmit={() => void send(false)}
      onWithdraw={() => void send(true)}
      onDone={(v) => {
        runner.answer(v)
        setTick((t) => t + 1)
      }}
    />
  )
}
