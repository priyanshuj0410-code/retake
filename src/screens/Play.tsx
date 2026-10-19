/**
 * A session from its link to its last screen. The token (panel) or the enrolment (firm) is
 * spent before the first screen, so a link starts one session only. The first screen of
 * every sitting is the four registered sentences and nothing else; in demo mode a separate
 * demo notice comes before it.
 */
import { useEffect, useState } from 'react'
import { registeredSentences, screens } from '../content'
import type { Lang, T } from '../content/types'
import { config, type DeploymentId } from '../engine/config'
import { cryptoRng } from '../engine/rng'
import { Runner, type FirmLabels } from '../engine/runner'
import { store } from '../store'
import type { LangSet, StartResult } from '../store/types'
import { Button, Choice, List, Notice, Page, Text } from '../ui'
import { StepView } from './StepView'

const S = screens

type Pre = 'demo' | 'disclosure' | 'consent' | 'language' | 'declined'

export function Disclosure({ langs, onContinue }: { langs: Lang[]; onContinue: () => void }) {
  /* Exactly the four registered sentences, in each language the player may play in, and the
     Continue button. Nothing else: no heading, no act label, no demo badge, no logo. */
  return (
    <Page surface="oof" stepKey="disclosure" actions={<Button onClick={onContinue}>{S.common.continue[langs[0]]}</Button>}>
      {langs.map((l) => (
        <div key={l} lang={l === 'hinglish' ? 'hi-Latn' : 'en-GB'} data-disclosure={l}>
          {registeredSentences[l].map((s) => (
            <Text key={s}>{s}</Text>
          ))}
        </div>
      ))}
    </Page>
  )
}

export function Play({ start, firm }: { start: () => Promise<StartResult & { firm?: FirmLabels }>; firm: boolean }) {
  const demo = config.demo
  const [entry, setEntry] = useState<StartResult & { firm?: FirmLabels } | null>(null)
  const [pre, setPre] = useState<Pre>(demo ? 'demo' : 'disclosure')
  const [langs, setLangs] = useState<Lang[] | null>(null)
  const [runner, setRunner] = useState<Runner | null>(null)
  const [, setTick] = useState(0)
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'failed'>('idle')
  const [finished, setFinished] = useState<'submitted' | 'withdrawn' | null>(null)

  useEffect(() => {
    let live = true
    void start().then((r) => live && setEntry(r))
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

  if (!entry) return <Page surface="oof" stepKey="loading"><Text>…</Text></Page>
  if (!entry.ok) {
    const msg = entry.reason === 'used' ? S.entry.refused : entry.reason === 'offline' ? S.entry.offline : entry.reason === 'window' ? S.firm.closed : S.entry.unknown
    return (
      <Page surface="oof" stepKey="refused">
        <Notice kind="error">{msg.en}</Notice>
        <Text lang="hi-Latn">{msg.hinglish}</Text>
      </Page>
    )
  }
  const dep: DeploymentId = entry.dep
  const langSet: LangSet = entry.langs
  const offered: Lang[] = langSet === 'both' || langSet === 'choose' ? ['en', 'hinglish'] : [langSet]
  const ui: Lang = langs && langs.length === 1 ? langs[0] : offered[0]
  const L = (t: T) => t[ui]

  const begin = (chosen: Lang[]) => {
    setLangs(chosen)
    setRunner(new Runner(cryptoRng(), dep, chosen, entry.firm))
  }

  if (!runner) {
    if (pre === 'demo')
      return (
        <Page surface="oof" stepKey="demo" title={L(S.demoNotice.title)} actions={<Button onClick={() => setPre('disclosure')}>{L(S.common.continue)}</Button>}>
          <Text>{L(S.demoNotice.body)}</Text>
        </Page>
      )
    if (pre === 'disclosure') return <Disclosure langs={offered} onContinue={() => (firm ? (langSet === 'choose' ? setPre('language') : begin(offered)) : setPre('consent'))} />
    if (pre === 'declined')
      return (
        <Page surface="oof" stepKey="declined" oof={L(S.common.outOfFiction)}>
          <Text kind="lead">{L(S.consent.declined)}</Text>
        </Page>
      )
    if (pre === 'consent')
      return (
        <Page
          surface="oof"
          stepKey="consent"
          oof={L(S.common.outOfFiction)}
          demo={demo ? L(S.common.demoBadge) : undefined}
          title={L(S.consent.panel.title)}
          actions={
            <>
              <Button onClick={() => (langSet === 'choose' ? setPre('language') : begin(offered))}>{L(S.consent.panel.agree)}</Button>
              <Button kind="secondary" onClick={() => setPre('declined')}>
                {L(S.consent.panel.decline)}
              </Button>
            </>
          }
        >
          <List items={S.consent.panel.points.map(L)} />
        </Page>
      )
    return <LanguageStep ui={ui} demo={demo} langSet={langSet} offered={offered} onChoose={begin} />
  }

  if (finished)
    return (
      <Page surface="oof" stepKey="finished" oof={L(S.common.outOfFiction)} demo={demo ? L(S.common.demoBadge) : undefined} title={L(S.wrap.submit.title)}>
        <Notice kind="ok">{finished === 'submitted' ? L(S.wrap.submit.submitted) : L(S.wrap.submit.withdrawn)}</Notice>
      </Page>
    )

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

function LanguageStep({ ui, demo, langSet, offered, onChoose }: { ui: Lang; demo: boolean; langSet: LangSet; offered: Lang[]; onChoose: (l: Lang[]) => void }) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<string | null>(null)
  void langSet
  void offered
  return (
    <Page
      surface="oof"
      stepKey="language"
      oof={L(S.common.outOfFiction)}
      demo={demo ? L(S.common.demoBadge) : undefined}
      actions={<Button onClick={() => v && onChoose(v === 'both' ? ['en', 'hinglish'] : [v as Lang])} disabled={!v}>{L(S.common.continue)}</Button>}
    >
      <Choice legend={L(S.language.title)} options={[{ id: 'en', text: L(S.language.en) }, { id: 'hinglish', text: L(S.language.hinglish) }, { id: 'both', text: L(S.language.both) }]} value={v} onChange={setV} />
    </Page>
  )
}
