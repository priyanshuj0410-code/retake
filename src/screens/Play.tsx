/**
 * A session from its link to its last screen. The token (panel) or the enrolment (firm) is
 * spent before the first screen, so a link starts one session only. A season in progress is
 * kept on this device (src/store/progress.ts), so a reload resumes the same screen, answers and
 * draw; the one-time rule then refuses the link only once the session is submitted or
 * withdrawn, and a reload of the result shows the same result. The first screen of every
 * sitting is the four registered sentences and nothing else; the season's eligibility items
 * come before them.
 */
import { useEffect, useRef, useState } from 'react'
import { screens } from '../content'
import type { Lang, T } from '../content/types'
import { config, devRoutes, type DeploymentId } from '../engine/config'
import { cryptoRng, cryptoSeed, fromSeed, type Seed } from '../engine/rng'
import { Runner, type FirmLabels } from '../engine/runner'
import { store } from '../store'
import { progress } from '../store/progress'
import type { LangSet, StartResult } from '../store/types'
import { Page, Text, Notice } from '../ui'
import { Disclosure } from './Disclosure'
import { Consent, Declined, Finished, LanguageStep } from './PreScreens'
import { StepView } from './StepView'
import { Eligibility, NotEligible, StoryPicker, StoryResult, StoryView } from './Story'
import { stories, storyById } from '../story/content'
import { playedStories } from '../story/profile'
import { StoryRunner, type RunnerState } from '../story/runner'
import type { Story } from '../story/content'

const S = screens

type Pre = 'disclosure' | 'consent' | 'language' | 'declined' | 'pick'
type Entry = StartResult & { firm?: FirmLabels }
type Finish = 'submitted' | 'withdrawn' | null

/** A season session as this device keeps it between reloads (never sent anywhere). */
interface Saved {
  v: 1
  entry: Entry
  pre: Pre
  eligible: 'unasked' | 'yes' | 'no'
  langs: Lang[] | null
  drawn: string | null
  season: { story: string; seed: Seed; langs: Lang[]; state: RunnerState } | null
  finished: Finish
}

function restoreSeason(s: Saved['season']): StoryRunner | null {
  const story = s ? storyById(s.story) : undefined
  if (!s || !story) return null
  const r = new StoryRunner(fromSeed(s.seed), story, s.langs)
  r.restore(s.state)
  return r
}

export function Play({
  start,
  resume,
  sessionKey,
  firm,
}: {
  start: () => Promise<Entry>
  /** Reopens the same link after a reload, when this device holds the session in progress. */
  resume?: () => Promise<Entry>
  /** Where this device keeps a season in progress (the token); none for the dev-only firm route. */
  sessionKey?: string
  firm: boolean
}) {
  const [saved] = useState(() => (sessionKey ? progress.get<Saved>(sessionKey) : null))
  const [entry, setEntry] = useState<Entry | null>(null)
  const [pre, setPre] = useState<Pre>(saved?.pre ?? 'disclosure')
  const [langs, setLangs] = useState<Lang[] | null>(saved?.langs ?? null)
  const [runner, setRunner] = useState<Runner | null>(null)
  const [seed, setSeed] = useState<Seed | null>(saved?.season?.seed ?? null)
  const [season, setSeason] = useState<StoryRunner | null>(() =>
    restoreSeason(saved?.season ?? null),
  )
  const [eligible, setEligible] = useState<'unasked' | 'yes' | 'no'>(saved?.eligible ?? 'unasked')
  /* The story is drawn at entry, uniformly over the built stories this profile has not played
     (candidates v17 3.17: randomised, not self-chosen); a reload keeps the same draw. */
  const [drawn] = useState<Story | null>(() => {
    if (saved) return saved.drawn ? (storyById(saved.drawn) ?? null) : null
    const played = playedStories()
    const open = stories.filter((s) => s.built && !played.has(s.id))
    return open.length ? cryptoRng().pick(open) : null
  })
  const [, setTick] = useState(0)
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'failed'>('idle')
  const [finished, setFinished] = useState<Finish>(saved?.finished ?? null)

  /* The token is spent once per mount, even where React runs an effect twice. A session this
     device holds is reopened instead (a finished one needs no store at all). */
  const started = useRef<Promise<Entry> | null>(null)
  useEffect(() => {
    let live = true
    started.current ??= saved?.finished
      ? Promise.resolve(saved.entry)
      : saved && resume
        ? resume().then((r) => (r.ok ? saved.entry : r))
        : start()
    void started.current.then((r) => live && setEntry(r))
    return () => {
      live = false
    }
  }, [start, resume, saved])

  /* Keep a season in progress for a reload: after every render, and after every change the
     runner makes on its own (the code, drawn once). */
  const save = () => {
    if (!sessionKey || !entry?.ok || entry.dep !== 'season') return
    const v: Saved = {
      v: 1,
      entry,
      pre,
      eligible,
      langs,
      drawn: drawn?.id ?? null,
      season:
        season && seed
          ? {
              story: season.season.story.id,
              seed,
              langs: season.langs,
              state: season.snapshot(),
            }
          : null,
      finished,
    }
    progress.put(sessionKey, v)
  }
  useEffect(() => {
    save()
    season?.setOnChange(save)
  })

  /* A card game is held in memory only, so a reload would lose it: warn first. */
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
  const L = (t: T) => t[ui]

  const isSeason = dep === 'season'
  /* The old card games open only on the dev server (EVAL-6); a player link to one is refused. */
  if (!isSeason && !devRoutes())
    return (
      <Page surface="oof" stepKey="closed">
        <Notice>Open the link you were sent to play.</Notice>
      </Page>
    )
  const begin = (chosen: Lang[]) => {
    setLangs(chosen)
    if (isSeason) setPre('pick')
    else setRunner(new Runner(cryptoRng(), dep, chosen, entry.firm))
  }
  const beginSeason = (story: Story) => {
    const s = cryptoSeed()
    setSeed(s)
    setSeason(new StoryRunner(fromSeed(s), story, langs ?? offered))
  }

  if (!runner && !season) {
    if (pre === 'disclosure' && isSeason && eligible === 'unasked')
      return (
        <Eligibility
          ui={ui}
          footnote={config.demo ? L(S.common.prototype) : undefined}
          onDone={(ok) => setEligible(ok ? 'yes' : 'no')}
        />
      )
    if (pre === 'disclosure' && isSeason && eligible === 'no') return <NotEligible ui={ui} />
    if (pre === 'disclosure')
      return (
        <Disclosure
          langs={offered}
          season={isSeason}
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
          season={isSeason}
          onAgree={() => (langSet === 'choose' ? setPre('language') : begin(offered))}
          onDecline={() => setPre('declined')}
        />
      )
    if (pre === 'pick') return <StoryPicker ui={ui} drawn={drawn} onPick={beginSeason} />
    return <LanguageStep ui={ui} onChoose={begin} />
  }

  if (season) {
    if (finished) return <StoryResult runner={season} finished={finished} />
    const sendSeason = async (withdraw: boolean) => {
      setSubmitState('sending')
      try {
        await season.prepareCode()
        const keys = season.keys
        if (!keys) throw new Error('no keys')
        await store.submit(keys.code, 'season', withdraw ? null : season.submission())
        setFinished(withdraw ? 'withdrawn' : 'submitted')
      } catch {
        setSubmitState('failed')
      }
    }
    return (
      <StoryView
        runner={season}
        submitState={submitState}
        onSubmit={() => void sendSeason(false)}
        onWithdraw={() => void sendSeason(true)}
        onBack={() => {
          season.back()
          setTick((x) => x + 1)
        }}
        onDone={(v) => {
          season.answer(v)
          setTick((x) => x + 1)
        }}
      />
    )
  }
  if (!runner) return null

  if (finished) return <Finished ui={ui} finished={finished} />

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
