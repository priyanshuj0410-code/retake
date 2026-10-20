/**
 * The way in (EVAL-12, owner): the landing page at the root, sign-in by recovery code, and "How
 * this works". The landing is one phone screen in the comic register: what a season is, the
 * mascots, "Start a season" (language, eligibility, then "Before you start") and "I've played
 * before: sign in", or for a returning player "Continue as <name>", and "Resume chapter N" first
 * whenever this browser holds an unfinished season. Sign-in and "How this works" are out of
 * fiction, in the note register. Nothing here says how answers are read.
 */
import { useEffect, useState } from 'react'
import { screens, sentencesFor } from '../content'
import type { T } from '../content/types'
import { config } from '../engine/config'
import { formatCode, normaliseCode } from '../engine/codes'
import { fill } from '../engine/text'
import { store } from '../store'
import { LD, PF, SS, stories } from '../story/content'
import {
  DEMO_PROFILE_CODE,
  openProfile,
  restoreProfile,
  seedDemoProfile,
  signedIn,
} from '../story/profile'
import { sessionMinutes } from '../story/runner'
import {
  Button,
  CastGrid,
  Caption,
  Details,
  DevNotes,
  Field,
  Heading,
  IconList,
  Link,
  List,
  Notice,
  Page,
  Splash,
  Text,
  type Animal,
  type NoteIconKind,
} from '../ui'
import { savedSeason } from '../story/saved'

const S = screens
const L = (t: T) => t.en
const minutes = () => {
  const built = stories.find((s) => s.built)
  return built ? sessionMinutes(built) : ''
}

/** A demo season link, the way a panel provider's link would carry it; the player chooses the language. */
async function startSeason(go: (h: string) => void) {
  const [t] = await store.issueTokens('season', 1, 'choose')
  go(`#/play/${t}`)
}

export function Landing({ go }: { go: (h: string) => void }) {
  const [name, setName] = useState<string | null>(null)
  const [ready, setReady] = useState(!signedIn())
  const [resume] = useState(savedSeason)
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    void restoreProfile().then((u) => {
      if (!live) return
      setName(u?.data.name ?? null)
      setReady(true)
    })
    return () => {
      live = false
    }
  }, [])
  const start = () => void startSeason(go).catch((e: unknown) => setMsg(String(e)))
  const primary = resume ? (
    <Button onClick={() => go(`#/play/${resume.token}`)}>
      {resume.finale ? L(LD.resumeFinale) : fill(L(LD.resume), { n: resume.chapter })}
    </Button>
  ) : name ? (
    <Button onClick={() => go('#/profile')}>{fill(L(LD.continueAs), { name })}</Button>
  ) : config.demo ? (
    <Button onClick={start}>{L(LD.start)}</Button>
  ) : (
    <Button onClick={() => go('#/signin')}>{L(LD.signInGo)}</Button>
  )
  const quiet = name ? (
    resume ? (
      <Button kind="quiet" onClick={() => go('#/profile')}>
        {fill(L(LD.continueAs), { name })}
      </Button>
    ) : config.demo ? (
      <Button kind="quiet" onClick={start}>
        {L(LD.startNew)}
      </Button>
    ) : null
  ) : resume || config.demo ? (
    <Button kind="quiet" onClick={() => go('#/signin')}>
      {L(LD.signIn)}
    </Button>
  ) : null
  const mascots = LD.mascots as unknown as { animal: Animal; name: T }[]
  const points = LD.points as unknown as { icon: NoteIconKind; text: T }[]
  return (
    <Page
      surface="game"
      stepKey={ready ? 'landing' : 'landing-wait'}
      screen="landing"
      lang="en-GB"
      footnote={L(S.common.prototype)}
      actions={
        ready ? (
          <>
            {primary}
            {quiet}
          </>
        ) : undefined
      }
    >
      <Splash title={L(LD.title)} body={L(LD.line)} />
      <CastGrid
        kind="sheet"
        label={L(LD.castLabel)}
        items={mascots.map((m) => ({
          look: { kind: 'animal', animal: m.animal },
          label: fill(L(LD.mascotSaid), { name: L(m.name) }),
          name: L(m.name),
          lines: [],
        }))}
      />
      <Caption>{L(LD.mascotsCaption)}</Caption>
      <IconList
        label={L(LD.pointsLabel)}
        items={points.map((p) => ({ icon: p.icon, text: fill(L(p.text), { minutes: minutes() }) }))}
      />
      {name ? <Text kind="small">{fill(L(LD.signedIn), { name })}</Text> : null}
      {resume ? <Text kind="small">{L(LD.saved)}</Text> : null}
      {config.demo ? null : <Text kind="small">{L(LD.studyLinks)}</Text>}
      <Link href="#/how">{L(LD.how)}</Link>
      {msg ? <Notice kind="error">{msg}</Notice> : null}
    </Page>
  )
}

/** Where a recovery code goes wrong as it is typed or sent: null when it may be tried. */
function codeProblem(raw: string, sending: boolean): string | null {
  const n = normaliseCode(raw)
  const bad = [...n].find((ch) => !config.code.alphabet.includes(ch))
  if (bad) return fill(L(LD.codeChar), { ch: bad })
  if (sending && n.length !== config.code.length) return L(LD.codeShort)
  return null
}

/** The code as typed, in groups of four ("7K2M-QX4P-9TRB"), upper case, nothing else kept. */
const grouped = (raw: string) =>
  formatCode(
    raw
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .slice(0, config.code.length),
  )

/**
 * Sign in (EVAL-12): enter the recovery code. It is grouped as it is typed and checked inline
 * (a character no code uses is named at once; a short code on sending); a code that opens no
 * profile shows the error pattern. "Lost your code?" says plainly that it cannot be recovered. In
 * demo mode the demo profile is seeded so its code works, and the code is shown only on the
 * dev-only panel.
 */
export function SignIn({ go, after = '#/profile' }: { go: (h: string) => void; after?: string }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (config.demo) void seedDemoProfile()
  }, [])
  const send = async () => {
    if (busy) return
    const problem = codeProblem(code, true)
    if (problem) return setError(problem)
    setBusy(true)
    const u = await openProfile(normaliseCode(code)).catch(() => null)
    setBusy(false)
    if (!u) return setError(L(LD.codeWrong))
    go(after)
  }
  return (
    <Page
      surface="oof"
      stepKey="signin"
      screen="signin"
      lang="en-GB"
      nav={
        <Button kind="nav" onClick={() => go('#/')} label={L(LD.backSaid)}>
          {L(LD.back)}
        </Button>
      }
      oof={L(S.common.outOfFiction)}
      title={L(LD.signInTitle)}
      actions={<Button onClick={() => void send()}>{L(LD.signInGo)}</Button>}
    >
      <Text>{L(LD.signInBody)}</Text>
      <Field
        label={L(PF.codeLabel)}
        hint={L(LD.codeHint)}
        value={code}
        maxLength={config.code.length + 2}
        onChange={(v) => {
          const next = grouped(v)
          setCode(next)
          setError(codeProblem(v, false))
        }}
        invalid={!!error}
        errorId="code-error"
        onEnter={() => void send()}
      />
      {error ? (
        <Notice kind="error" id="code-error">
          {error}
        </Notice>
      ) : null}
      <Details summary={L(LD.lostTitle)}>
        <List items={(LD.lost as unknown as T[]).map(L)} />
      </Details>
      <DevNotes
        title={L(SS.devTitle)}
        notes={config.demo ? [fill(LD._devDemoCode, { code: formatCode(DEMO_PROFILE_CODE) })] : []}
      />
    </Page>
  )
}

/**
 * "How this works" (EVAL-12), out of fiction: what a season looks at, the four sentences every
 * player agrees to (verbatim, in their order), and privacy. It never says how answers are read.
 */
export function HowItWorks({ go }: { go: (h: string) => void }) {
  const icons: NoteIconKind[] = ['lens', 'cast', 'result', 'descriptions']
  return (
    <Page
      surface="oof"
      stepKey="how"
      screen="how"
      lang="en-GB"
      nav={
        <Button kind="nav" onClick={() => go('#/')} label={L(LD.backSaid)}>
          {L(LD.back)}
        </Button>
      }
      oof={L(S.common.outOfFiction)}
      title={L(LD.howTitle)}
      actions={
        config.demo ? (
          <Button onClick={() => void startSeason(go)}>{L(LD.start)}</Button>
        ) : undefined
      }
    >
      <Heading>{L(LD.howMeasuredTitle)}</Heading>
      <List items={(LD.howMeasured as unknown as T[]).map(L)} />
      <Heading>{L(LD.howSentencesTitle)}</Heading>
      <IconList
        label={L(LD.howSentencesTitle)}
        items={sentencesFor('en', true).map((text, i) => ({ icon: icons[i], text }))}
      />
      <Heading>{L(LD.howPrivacyTitle)}</Heading>
      <List
        items={(LD.howPrivacy as unknown as T[]).map((t) =>
          fill(L(t), { days: config.season.chapters.saveDays }),
        )}
      />
    </Page>
  )
}
