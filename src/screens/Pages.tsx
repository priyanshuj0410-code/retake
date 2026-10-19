/** The pages around the sessions: the demo home, firm enrolment, the explanation and withdrawal. */
import { useState } from 'react'
import { screens } from '../content'
import { Disclosure } from './Disclosure'
import type { T } from '../content/types'
import { config, DEPLOYMENTS, type DeploymentId } from '../engine/config'
import {
  deriveKeys,
  enrolmentKey,
  formatCode,
  newEnrolmentCode,
  normaliseCode,
  validCode,
} from '../engine/codes'
import { cryptoRng } from '../engine/rng'
import { store, iso } from '../store'
import { DEMO_SCHEDULE } from '../store/local'
import type { Enrolment, Explanation, LangSet } from '../store/types'
import { Button, Choice, Code, Field, Heading, Link, List, Notice, Page, Text } from '../ui'

const S = screens
const L = (t: T) => t.en
const demoBadge = config.demo ? L(S.common.demoBadge) : undefined
const DAY = 86_400_000

export function Home({ go }: { go: (hash: string) => void }) {
  const [langs, setLangs] = useState<LangSet>('choose')
  const [msg, setMsg] = useState<string | null>(null)
  const startDemo = async (dep: DeploymentId) => {
    try {
      const [t] = await store.issueTokens(dep, 1, langs)
      go(`#/play/${t}`)
    } catch (e) {
      setMsg(String(e))
    }
  }
  return (
    <Page surface="oof" stepKey="home" demo={demoBadge} title="Equal Lens Evaluator: prototype v0">
      <Text>
        This page exists only in demo mode. In a study, a panel provider sends each player a
        one-time link, and a firm sends one generic enrolment link; no player sees this page.
      </Text>
      <Choice
        legend="Language set the link carries"
        options={[
          { id: 'choose', text: 'The player chooses (English, Hinglish or both)' },
          { id: 'en', text: 'English only' },
          { id: 'hinglish', text: 'Hinglish only' },
          { id: 'both', text: 'Bilingual: language drawn per card' },
        ]}
        value={langs}
        onChange={(v) => setLangs(v as LangSet)}
      />
      <Heading>Play a demo session</Heading>
      <Button onClick={() => void startDemo('panel-g1')}>Panel, game 1</Button>
      <Button onClick={() => void startDemo('panel-g2')}>Panel, game 2</Button>
      <Button kind="secondary" onClick={() => go(`#/enrol/${DEMO_SCHEDULE.firm}`)}>
        Firm session: enrol (fictional firm)
      </Button>
      <Heading>After play</Heading>
      <Button kind="secondary" onClick={() => go('#/explain')}>
        Scoring explanation (opens after release)
      </Button>
      <Button kind="secondary" onClick={() => go('#/withdraw')}>
        Withdraw with a code
      </Button>
      <Button kind="secondary" onClick={() => go('#/results')}>
        Demo results from seeded players
      </Button>
      {msg ? <Notice kind="error">{msg}</Notice> : null}
      <Text kind="small">
        Store: {store.kind}. Add ?now=YYYY-MM-DD to the address to try the release and window dates.
      </Text>
    </Page>
  )
}

export function Enrol({ firm }: { firm: string }) {
  const [step, setStep] = useState<'four' | 'consent' | 'form' | 'done' | 'declined'>('four')
  const [sex, setSex] = useState<string | null>(null)
  const [batch, setBatch] = useState<string | null>(null)
  const [done, setDone] = useState<{ code: string; e: Enrolment } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const schedule = firm === DEMO_SCHEDULE.firm ? DEMO_SCHEDULE : null
  if (step === 'four')
    return <Disclosure langs={['en', 'hinglish']} onContinue={() => setStep('consent')} />
  if (step === 'declined')
    return (
      <Page surface="oof" stepKey="enrol-declined" oof={L(S.common.outOfFiction)}>
        <Text kind="lead">{L(S.consent.declined)}</Text>
      </Page>
    )
  if (step === 'consent')
    return (
      <Page
        surface="oof"
        stepKey="enrol-consent"
        oof={L(S.common.outOfFiction)}
        demo={demoBadge}
        title={L(S.consent.firm.title)}
        actions={
          <>
            <Button onClick={() => setStep('form')}>{L(S.consent.firm.agree)}</Button>
            <Button kind="secondary" onClick={() => setStep('declined')}>
              {L(S.consent.firm.decline)}
            </Button>
          </>
        }
      >
        <List items={S.consent.firm.points.map(L)} />
      </Page>
    )
  if (step === 'form' || !done) {
    const submit = async () => {
      if (!schedule || !batch || !sex) return
      const b = schedule.batches.find((x) => x.id === batch)
      if (!b) return
      const code = newEnrolmentCode()
      try {
        const e = await store.enrol(
          await enrolmentKey(code),
          { firm, batch, tdate: b.date, sex },
          cryptoRng().next(),
        )
        setDone({ code, e })
        setStep('done')
      } catch (x) {
        setErr(String(x))
      }
    }
    return (
      <Page
        surface="oof"
        stepKey="enrol-form"
        oof={L(S.common.outOfFiction)}
        demo={demoBadge}
        title={schedule?.name ?? firm}
        actions={
          <Button onClick={() => void submit()} disabled={!sex || !batch}>
            {L(S.common.continue)}
          </Button>
        }
      >
        <Choice
          legend={L(S.firm.sexItem)}
          options={S.firm.sexOptions.map((o) => ({ id: o.id, text: L(o.text) }))}
          value={sex}
          onChange={setSex}
        />
        <Choice
          legend={L(S.firm.batch)}
          options={(schedule?.batches ?? []).map((b) => ({
            id: b.id,
            text: `${b.label}: ${b.date}`,
          }))}
          value={batch}
          onChange={setBatch}
        />
        {err ? <Notice kind="error">{err}</Notice> : null}
      </Page>
    )
  }
  const link = `${location.origin}${location.pathname}#/firm/${done.code}`
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Equal Lens//Evaluator//EN',
    'BEGIN:VEVENT',
    `UID:${done.code}@evaluator`,
    `DTSTART;VALUE=DATE:${done.e.from.replaceAll('-', '')}`,
    `DTEND;VALUE=DATE:${iso(Date.parse(`${done.e.to}T12:00:00+05:30`) + DAY).replaceAll('-', '')}`,
    'SUMMARY:Play your team season',
    `DESCRIPTION:${link}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
  return (
    <Page
      surface="oof"
      stepKey="enrol-done"
      oof={L(S.common.outOfFiction)}
      demo={demoBadge}
      title={L(S.consent.firm.title)}
    >
      <Notice kind="ok">
        {L(S.firm.enrolled).replace('{from}', done.e.from).replace('{to}', done.e.to)}
      </Notice>
      <Text>{L(S.firm.enrolmentCode)}</Text>
      <Code value={formatCode(done.code)} label={L(S.firm.enrolmentCode)} />
      <Link href={href} download="team-season.ics">
        {L(S.firm.calendar)}
      </Link>
      {config.demo ? (
        <Link href={`#/firm/${done.code}?now=${done.e.from}`}>
          Demo: open the play link on the first day of the window
        </Link>
      ) : null}
    </Page>
  )
}

export function Explain() {
  const [code, setCode] = useState('')
  const [state, setState] = useState<{
    kind: 'idle' | 'bad' | 'notYet' | 'open'
    dep?: DeploymentId
    date?: string
    ex?: Explanation
  }>({ kind: 'idle' })
  const open = async () => {
    const c = normaliseCode(code)
    if (!validCode(c)) return setState({ kind: 'bad' })
    const keys = await deriveKeys(c)
    const dep = await store.codeKnown(keys.code)
    if (!dep) return setState({ kind: 'bad' })
    const ex = await store.explanation(dep)
    if (!ex) return setState({ kind: 'notYet', dep, date: config.release.releaseAt[dep] })
    setState({ kind: 'open', dep, ex })
  }
  if (state.kind === 'open' && state.ex)
    return (
      <Page
        surface="oof"
        stepKey="explain-open"
        oof={L(S.common.outOfFiction)}
        demo={demoBadge}
        title={L(S.explain.title)}
      >
        {state.ex.sections.map((sec) => (
          <section key={sec.heading.en}>
            <Heading>{sec.heading.en}</Heading>
            {sec.body.map((b) => (
              <Text key={b.en}>{b.en}</Text>
            ))}
          </section>
        ))}
      </Page>
    )
  return (
    <Page
      surface="oof"
      stepKey="explain"
      oof={L(S.common.outOfFiction)}
      demo={demoBadge}
      title={L(S.explain.title)}
      actions={<Button onClick={() => void open()}>{L(S.explain.open)}</Button>}
    >
      <Field label={L(S.explain.enter)} value={code} onChange={setCode} />
      {state.kind === 'bad' ? <Notice kind="error">{L(S.explain.badCode)}</Notice> : null}
      {state.kind === 'notYet' ? (
        <Notice>{L(S.explain.notYet).replace('{date}', state.date ?? '')}</Notice>
      ) : null}
    </Page>
  )
}

export function Withdraw() {
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'bad' | 'done' | 'closed'>('idle')
  const go = async () => {
    const c = normaliseCode(code)
    if (!validCode(c)) return setState('bad')
    const keys = await deriveKeys(c)
    const dep = await store.codeKnown(keys.code)
    if (!dep) return setState('bad')
    try {
      await store.withdraw(keys)
      setState('done')
    } catch {
      setState('closed')
    }
  }
  const closedOn = DEPLOYMENTS.map((d) => config.release.releaseAt[d])[0]
  return (
    <Page
      surface="oof"
      stepKey="withdraw"
      oof={L(S.common.outOfFiction)}
      demo={demoBadge}
      title={L(S.withdraw.title)}
      actions={
        state === 'done' ? undefined : (
          <Button onClick={() => void go()}>{L(S.withdraw.button)}</Button>
        )
      }
    >
      <Text>{L(S.withdraw.body)}</Text>
      {state === 'done' ? (
        <Notice kind="ok">{L(S.withdraw.done)}</Notice>
      ) : (
        <Field label={L(S.explain.enter)} value={code} onChange={setCode} />
      )}
      {state === 'bad' ? <Notice kind="error">{L(S.explain.badCode)}</Notice> : null}
      {state === 'closed' ? (
        <Notice kind="error">{L(S.withdraw.closed).replace('{date}', closedOn)}</Notice>
      ) : null}
    </Page>
  )
}
