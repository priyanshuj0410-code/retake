/**
 * The season story on screen (EVAL-4): the season picker, every story step, and the result
 * page. Story screens are on the game surface; the statements, the wrap and the result are out
 * of fiction (knowledge/design.md, section 3). Every decision commits on its tap and the next
 * screen opens with what came of it; Back reopens the last decision. Nothing counts down.
 */
import { useEffect, useState } from 'react'
import { screens, surveyItems } from '../content'
import type { Lang, T } from '../content/types'
import { config, formatDate, releaseOf } from '../engine/config'
import { formatCode } from '../engine/codes'
import { fill } from '../engine/text'
import { store, today } from '../store'
import { randomKey } from '../engine/rng'
import { PF, RT, SS, stories, storyById, type Story } from '../story/content'
import {
  addSession,
  createProfile,
  currentProfile,
  nextRetake,
  playedStories,
} from '../story/profile'
import type { StoryRunner } from '../story/runner'
import { colleagueView, langAttr, rosterItems } from '../story/view'
import { resultModel } from '../story/why'
import {
  AgreeGrid,
  Beat,
  Button,
  Checks,
  Choice,
  Code,
  Field,
  Heading,
  Link,
  List,
  Notice,
  Options,
  Page,
  PickOne,
  QuickSplit,
  PointCard,
  ReadingGrid,
  Roster,
  ShareCard,
  Spectrum,
  StoryPick,
  TapOrder,
  Text,
} from '../ui'

const S = screens

/** The season picker, NPQE's way in: three short stories, one tap starts one. */
export function StoryPicker({
  ui,
  demo,
  onPick,
}: {
  ui: Lang
  demo: boolean
  onPick: (s: Story) => void
}) {
  const L = (t: T) => t[ui]
  const played = playedStories()
  const options = stories.map((s) => ({
    id: s.id,
    emoji: s.emoji,
    title: L(s.title),
    premise: L(s.premise),
    later: !s.built ? L(SS.pickLater) : played.has(s.id) ? L(PF.played) : undefined,
  }))
  const left = options.some((o) => !o.later)
  return (
    <Page
      surface="game"
      stepKey="story-pick"
      screen="story:pick"
      demo={demo ? L(S.common.demoBadge) : undefined}
      lang={langAttr(ui)}
      title={L(SS.pickTitle)}
    >
      <Text kind="lead">{L(SS.pickBody)}</Text>
      <StoryPick
        options={options}
        label={L(SS.pickTitle)}
        onPick={(id) => {
          const s = storyById(id)
          if (s) onPick(s)
        }}
      />
      {left ? null : <Notice>{L(PF.noStoryLeft)}</Notice>}
    </Page>
  )
}

export function StoryView({
  runner,
  demo,
  submitState,
  onDone,
  onBack,
  onSubmit,
  onWithdraw,
}: {
  runner: StoryRunner
  demo: boolean
  submitState: 'idle' | 'sending' | 'failed'
  onDone: (v: unknown) => void
  onBack: () => void
  onSubmit: () => void
  onWithdraw: () => void
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const step = runner.current
  if (!step) return null
  const story = runner.season.story
  const episodes = story.episodes ?? []
  const key = `s${runner.index}`
  const prev = runner.steps[runner.index - 1]
  const then = prev?.kind === 'beat' ? runner.consequence(prev.i) : null
  const inStory =
    step.kind === 'intro' ||
    step.kind === 'episode' ||
    step.kind === 'beat' ||
    step.kind === 'reveal' ||
    step.kind === 'season'
  const episodeNow =
    step.kind === 'beat'
      ? runner.season.beats[step.i].beat.episode
      : step.kind === 'episode'
        ? step.n
        : step.kind === 'reveal' || step.kind === 'intro'
          ? 1
          : episodes.length
  const act = (n: number) =>
    fill(L(SS.episodeOf), { n, k: episodes.length, title: L(episodes[n - 1].title) })
  const page = {
    surface: inStory ? 'game' : 'oof',
    act: inStory ? act(episodeNow) : L(S.common.acts.wrap),
    oof: inStory ? undefined : L(S.common.outOfFiction),
    demo: demo ? L(S.common.demoBadge) : undefined,
    stepKey: key,
    lang: langAttr(ui),
    screen: `story:${step.kind}${step.kind === 'beat' ? `:${runner.season.beats[step.i].beat.kind}` : ''}`,
  } as const
  const back =
    runner.backTarget !== null ? (
      <Button kind="quiet" onClick={onBack}>
        {L(SS.back)}
      </Button>
    ) : null
  const firstBeat = runner.steps.findIndex((s) => s.kind === 'beat')
  const revealedNow =
    step.kind === 'beat'
      ? runner.revealed(step.i)
      : step.kind !== 'intro' && !(step.kind === 'episode' && runner.index < firstBeat)
  const roster = <Roster title={L(SS.rosterTitle)} items={rosterItems(runner, revealedNow)} />

  switch (step.kind) {
    case 'intro':
      return (
        <Page {...page} actions={<Button onClick={() => onDone(null)}>{L(SS.start)}</Button>}>
          <Beat question={fill(L(SS.startTitle), { company: L(story.company as T) })} />
          <List items={(story.intro ?? []).map(L)} />
          {story.mascots ? <Text kind="strong">{L(story.mascots)}</Text> : null}
        </Page>
      )
    case 'episode': {
      const ep = episodes[step.n - 1]
      return (
        <Page
          {...page}
          actions={
            <Button onClick={() => onDone(null)}>{fill(L(SS.episodeGo), { n: step.n })}</Button>
          }
        >
          <Beat
            then={then?.text}
            answer={then?.summary}
            scene={L(ep.premise)}
            question={fill(L(SS.episodeShort), { n: step.n }) + ': ' + L(ep.title)}
          />
          {back}
          {step.n > 1 ? roster : null}
        </Page>
      )
    }
    case 'reveal': {
      const rv = story.reveal
      if (!rv) return null
      return (
        <Page {...page} actions={<Button onClick={() => onDone(null)}>{L(rv.go)}</Button>}>
          <Beat
            then={then?.text}
            answer={then?.summary}
            scene={L(rv.body)}
            question={L(rv.title)}
          />
          <Roster
            open
            large
            title={L(rv.title)}
            items={rosterItems(runner, true, (c) => [
              fill(L(rv.line), {
                mascot: c.mascot,
                animal: L(c.animalName),
                name: runner.displayName(c.slot, true),
              }),
              ...colleagueView(runner, c, true).cues,
            ])}
          />
          {back}
        </Page>
      )
    }
    case 'season':
      return (
        <Page
          {...page}
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          <Beat then={then?.text} answer={then?.summary} question={L(SS.seasonTitle)} />
          <Text kind="lead">{L(runner.seasonBand().text)}</Text>
          <Roster open title={L(SS.rosterTitle)} items={rosterItems(runner, true)} />
          {back}
        </Page>
      )
    case 'beat':
      return (
        <BeatStep
          key={key}
          runner={runner}
          i={step.i}
          page={page}
          then={then}
          back={back}
          roster={roster}
          onDone={onDone}
        />
      )
    case 'survey':
      return <SurveyStep key={key} ui={ui} page={page} onDone={onDone} />
    case 'prior': {
      const p = S.wrap.prior.find((x) => x.id === step.id)
      if (!p) return null
      return (
        <Page {...page} title={L(p.text)}>
          <Options
            label={L(p.text)}
            options={[
              { id: 'yes', text: L(S.common.yes) },
              { id: 'no', text: L(S.common.no) },
              { id: 'not-sure', text: L(S.common.notSure) },
            ]}
            onPick={onDone}
          />
        </Page>
      )
    }
    case 'debrief':
      return (
        <Page
          {...page}
          title={L(SS.debriefTitle)}
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          <List items={SS.debrief.map(L)} />
        </Page>
      )
    case 'code':
      return <CodeStep key={key} runner={runner} page={page} onDone={onDone} />
    case 'demographics':
      return <DemographicsStep key={key} ui={ui} page={page} onDone={onDone} />
    case 'submit':
      return (
        <Page
          {...page}
          title={L(S.wrap.submit.title)}
          actions={
            <>
              <Button onClick={onSubmit} disabled={submitState === 'sending'}>
                {L(S.wrap.submit.submit)}
              </Button>
              <Button kind="secondary" onClick={onWithdraw} disabled={submitState === 'sending'}>
                {L(S.wrap.submit.withdraw)}
              </Button>
            </>
          }
        >
          <Text>{L(S.wrap.submit.body)}</Text>
          {submitState === 'failed' ? (
            <Notice kind="error">{L(S.wrap.submit.failed)}</Notice>
          ) : null}
        </Page>
      )
  }
}

type PageBase = Omit<React.ComponentProps<typeof Page>, 'children' | 'actions' | 'title'>

function BeatStep({
  runner,
  i,
  page,
  then,
  back,
  roster,
  onDone,
}: {
  runner: StoryRunner
  i: number
  page: PageBase
  then: { text: string; summary: string } | null
  back: React.ReactNode
  roster: React.ReactNode
  onDone: (v: unknown) => void
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const b = runner.season.beats[i]
  const head = (
    <Beat
      then={then?.text}
      answer={then?.summary}
      scene={L(b.beat.scene)}
      question={L(b.beat.question)}
    />
  )
  if (b.kind === 'ordinary') {
    const opts = b.order.map((id) => {
      const o = b.beat.options.find((x) => x.id === id)
      return { id, text: o ? L(o.text) : id }
    })
    return (
      <Page {...page}>
        {head}
        <Options
          label={L(b.beat.question)}
          options={opts}
          onPick={(id) => onDone({ option: id })}
        />
        {back}
        {roster}
      </Page>
    )
  }
  const shown = runner.revealed(i)
  const items = b.chars.map((ch) => {
    const d = b.beat.descriptions.find((x) => x.id === ch.d)
    return colleagueView(runner, runner.cast[ch.slot], shown, d ? L(d.text) : '')
  })
  let input: React.ReactNode
  if (b.beat.kind === 'rank')
    input = (
      <TapOrder
        items={items}
        onDone={(order) => onDone({ order })}
        labels={{
          hint: L(SS.rankHint),
          undo: L(SS.rankUndo),
          choose: (n) => fill(L(SS.rankChoose), { n }),
          chosen: (n) => fill(L(SS.rankChosen), { n }),
          said: (name, n) => fill(L(SS.rankSaid), { name, n }),
          next: (n) => fill(L(SS.rankNext), { n }),
          taken: (name, n) => fill(L(SS.rankTaken), { name, n }),
        }}
      />
    )
  else if (b.beat.kind === 'pick')
    input = (
      <PickOne
        items={items}
        hint={L(SS.pickHint)}
        label={L(SS.pickLabel)}
        onPick={(pick) => onDone({ pick })}
      />
    )
  else
    input = (
      <QuickSplit
        items={items}
        pool={b.beat.pool ?? 6}
        cap={config.season.splitCap}
        onDone={(units) => onDone({ units })}
        labels={{
          left: (n) => fill(L(SS.splitLeft), { n }),
          chip: (name, k) => fill(L(SS.splitChip), { name, k }),
          clear: L(SS.splitClear),
        }}
      />
    )
  return (
    <Page {...page}>
      {head}
      {b.beat.kind === 'split' ? (
        <Text kind="small">
          {fill(L(SS.splitPool), {
            pool: b.beat.pool ?? 6,
            unit: b.beat.unit ? L(b.beat.unit) : '',
            cap: config.season.splitCap,
          })}
        </Text>
      ) : (
        <Text kind="small">{L(b.beat.kind === 'rank' ? SS.rankHint : SS.pickHint)}</Text>
      )}
      {input}
      {back}
      {roster}
    </Page>
  )
}

function SurveyStep({
  ui,
  page,
  onDone,
}: {
  ui: Lang
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<Record<string, number>>({})
  const left = surveyItems.filter((i) => v[i.id] === undefined).length
  return (
    <Page
      {...page}
      title={L(SS.surveyTitle)}
      actions={
        <Button onClick={() => onDone(v)} disabled={left > 0}>
          {L(SS.surveyDone)}
        </Button>
      }
    >
      <Text>{L(SS.surveyBody)}</Text>
      <AgreeGrid
        items={surveyItems.map((i) => ({ id: i.id, text: L(i.text) }))}
        scale={SS.surveyKey.map(L)}
        value={v}
        onChange={setV}
        keyLabel={SS.surveyKey.map((s, i) => `${i + 1} ${L(s)}`).join(', ')}
      />
      <Text kind="small">{left > 0 ? fill(L(SS.surveyLeft), { n: left }) : ''}</Text>
    </Page>
  )
}

function CodeStep({
  runner,
  page,
  onDone,
}: {
  runner: StoryRunner
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const [ready, setReady] = useState(runner.keys !== null)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    let live = true
    void runner.prepareCode().then(() => live && setReady(true))
    return () => {
      live = false
    }
  }, [runner])
  const { releaseAt, deleteUntil } = releaseOf('season')
  return (
    <Page
      {...page}
      title={L(S.wrap.code.title)}
      actions={
        <Button onClick={() => onDone(null)} disabled={!ready || !saved}>
          {L(S.common.continue)}
        </Button>
      }
    >
      <Text>{L(S.wrap.code.body)}</Text>
      {ready && runner.code ? (
        <Code value={formatCode(runner.code)} label={L(S.wrap.code.title)} />
      ) : (
        <Notice>…</Notice>
      )}
      <Text>
        {fill(L(S.wrap.code.release), {
          date: formatDate(releaseAt, ui),
          until: formatDate(deleteUntil, ui),
        })}
      </Text>
      <Checks
        legend={L(S.wrap.code.saved)}
        options={[{ id: 'saved', text: L(S.common.yes) }]}
        value={saved ? ['saved'] : []}
        onChange={(ids) => setSaved(ids.includes('saved'))}
      />
    </Page>
  )
}

function DemographicsStep({
  ui,
  page,
  onDone,
}: {
  ui: Lang
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<Record<string, string>>({})
  return (
    <Page
      {...page}
      title={L(S.wrap.demographics.title)}
      actions={<Button onClick={() => onDone(v)}>{L(S.common.continue)}</Button>}
    >
      <Text>{L(S.wrap.demographics.body)}</Text>
      {S.wrap.demographics.items.map((it) => (
        <Choice
          key={it.id}
          legend={L(it.text)}
          options={[
            ...it.options.map((o) => ({ id: o.id, text: L(o.text) })),
            { id: 'prefer-not', text: L(S.common.skip) },
          ]}
          value={v[it.id] ?? null}
          onChange={(id) => setV({ ...v, [it.id]: id })}
        />
      ))}
    </Page>
  )
}

/**
 * The result page, after submit (the owner's NPQE structure with our evidence and stance):
 * a disarming opening; "Your readings", one card per cue with sex first and wide (its band,
 * strength bar, long plain explanation and reasons); one section per decision area (a short
 * narrative, where the decisions followed the record, the blind spots ending with the actual
 * decisive pairs, where it may come from, how to keep watch); the Internal Committee line; then
 * keeping it (an optional profile, the retake), the summary card, and an optional, separate
 * stay-in-touch form.
 */
export function StoryResult({
  runner,
  demo,
  finished,
}: {
  runner: StoryRunner
  demo: boolean
  finished: 'submitted' | 'withdrawn'
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const [m] = useState(() => resultModel(runner))
  const h = m.rating.headline
  return (
    <Page
      surface="oof"
      stepKey="story-result"
      screen="story:result"
      title={L(RT.title)}
      oof={L(S.common.outOfFiction)}
      demo={demo ? L(S.common.demoBadge) : undefined}
      lang={langAttr(ui)}
    >
      <Notice kind="ok">{L(finished === 'submitted' ? RT.submitted : RT.withdrawn)}</Notice>
      <Text kind="lead">{L(RT.opening)}</Text>
      <Text kind="small">{L(RT.intro)}</Text>
      <Heading>{L(RT.readingsTitle)}</Heading>
      <ReadingGrid
        label={L(RT.readingsTitle)}
        items={m.cards.map((c) => ({ ...c, id: c.cue }))}
        first={
          <>
            {m.bar ? (
              <Spectrum
                at={m.bar.at}
                from={m.bar.from}
                to={m.bar.to}
                left={m.bar.left}
                right={m.bar.right}
                label={m.bar.label}
                zoneLabel={m.strength ?? L(RT.noLeanZone)}
              />
            ) : null}
            {m.bar ? <Text kind="muted">{L(RT.noLeanZone)}</Text> : null}
            <Text>{m.body}</Text>
            {m.why.length ? <List items={m.why} /> : null}
          </>
        }
      />
      {m.domains.map((d) => (
        <section key={d.domain} aria-label={d.title}>
          <Heading>{d.title}</Heading>
          <Text>{d.narrative}</Text>
          <Heading level={3}>{L(RT.followedTitle)}</Heading>
          {d.followed.length ? (
            d.followed.map((p) => <PointCard key={p.title} title={p.title} body={p.body} />)
          ) : (
            <Text kind="muted">{L(RT.noFollowed)}</Text>
          )}
          <Heading level={3}>{L(RT.blindTitle)}</Heading>
          {d.blind.length ? (
            d.blind.map((p) => (
              <PointCard
                key={p.title}
                title={p.title}
                body={p.body}
                evidence={p.evidence}
                evidenceLabel={L(RT.evidence)}
              />
            ))
          ) : (
            <Text kind="muted">{L(RT.noBlind)}</Text>
          )}
          <Heading level={3}>{L(RT.originTitle)}</Heading>
          <Text kind="small">{L(RT.originBody)}</Text>
          <List items={d.origin} />
          <Heading level={3}>{L(RT.watchTitle)}</Heading>
          <Text kind="small">{L(RT.watchBody)}</Text>
          <List items={d.watch} />
        </section>
      ))}
      <Notice>{L(RT.committee)}</Notice>
      <KeepIt runner={runner} zone={h.zone} towards={h.towards} weight={h.weight} pairs={h.pairs} />
      <Heading>{L(RT.shareTitle)}</Heading>
      <Text kind="small">{L(RT.shareBody)}</Text>
      <ShareCard
        text={m.share}
        title={L(RT.shareTitle)}
        button={L(RT.share)}
        copied={L(RT.copied)}
        failed={L(RT.shareFailed)}
      />
      <StayInTouch ui={ui} />
      {demo ? <Text kind="small">{L(RT.pending)}</Text> : null}
    </Page>
  )
}

/**
 * After the result: name and email, both optional, and two separate unticked boxes (follow-up
 * and retake reminders; longitudinal research, consent PENDING v17). Stored apart from the
 * answers and from any profile, at a random key, with nothing that links them.
 */
function StayInTouch({ ui }: { ui: Lang }) {
  const L = (t: T) => t[ui]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [follow, setFollow] = useState(false)
  const [research, setResearch] = useState(false)
  const [state, setState] = useState<'idle' | 'sent' | 'needEmail' | 'failed'>('idle')
  const send = async () => {
    if ((follow || research) && !email.trim()) return setState('needEmail')
    try {
      await store.contactPut(randomKey(), {
        ...(name.trim() ? { nm: name.trim().slice(0, 60) } : {}),
        ...(email.trim() ? { em: email.trim().slice(0, 120) } : {}),
        follow,
        research,
      })
      setState('sent')
    } catch {
      setState('failed')
    }
  }
  return (
    <section aria-label={L(RT.contactTitle)}>
      <Heading>{L(RT.contactTitle)}</Heading>
      {state === 'sent' ? (
        <Notice kind="ok">{L(RT.contactSent)}</Notice>
      ) : (
        <>
          <Text kind="small">{L(RT.contactBody)}</Text>
          <Field label={L(RT.contactName)} value={name} onChange={setName} />
          <Field label={L(RT.contactEmail)} value={email} onChange={setEmail} type="email" />
          <Checks
            legend={L(RT.contactFollow)}
            options={[{ id: 'yes', text: L(S.common.yes) }]}
            value={follow ? ['yes'] : []}
            onChange={(ids) => setFollow(ids.includes('yes'))}
          />
          <Checks
            legend={L(RT.contactResearch)}
            options={[{ id: 'yes', text: L(S.common.yes) }]}
            value={research ? ['yes'] : []}
            onChange={(ids) => setResearch(ids.includes('yes'))}
          />
          <Button kind="secondary" onClick={() => void send()}>
            {L(RT.contactSend)}
          </Button>
          {state === 'needEmail' ? <Notice kind="error">{L(RT.contactNeedEmail)}</Notice> : null}
          {state === 'failed' ? <Notice kind="error">{L(RT.contactFailed)}</Notice> : null}
        </>
      )}
    </section>
  )
}

/** Save to a profile (made here if there is none open) and the retake line. */
function KeepIt({
  runner,
  zone,
  towards,
  weight,
  pairs,
}: {
  runner: StoryRunner
  zone: 'lean' | 'none' | 'unread'
  towards?: 'focal' | 'comparison'
  weight: number
  pairs: number
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const open = currentProfile()
  const [name, setName] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'noName' | 'failed'>('idle')
  const [code, setCode] = useState<string | null>(null)
  const session = () => ({
    story: runner.season.story.id,
    day: today(),
    zone,
    ...(towards ? { towards } : {}),
    weight: Math.round(weight * 1000) / 1000,
    pairs,
    code: runner.code ?? '',
  })
  const save = async () => {
    if (!open && !name.trim()) return setState('noName')
    setState('saving')
    try {
      if (open) await addSession(session())
      else setCode((await createProfile(name.trim().slice(0, 24), session())).code)
      setState('saved')
    } catch {
      setState('failed')
    }
  }
  const p = currentProfile()
  const next = p ? nextRetake(p.data.sessions) : null
  return (
    <section aria-label={L(PF.saveTitle)}>
      <Heading>{L(PF.saveTitle)}</Heading>
      <Text>{L(PF.retake)}</Text>
      {next !== null ? <Text>{fill(L(PF.retakeOn), { date: formatDate(next, ui) })}</Text> : null}
      {state === 'saved' && p ? (
        <>
          <Notice kind="ok">{fill(L(PF.saved), { name: p.data.name })}</Notice>
          {code ? (
            <>
              <Text kind="strong">{L(PF.recoveryTitle)}</Text>
              <Code value={formatCode(code)} label={L(PF.recoveryTitle)} />
              <Text>{L(PF.recoveryBody)}</Text>
            </>
          ) : null}
          <Link href="#/profile">{L(PF.open)}</Link>
        </>
      ) : (
        <>
          {open ? null : (
            <>
              <Text>{L(PF.saveBody)}</Text>
              <Field label={L(PF.nameLabel)} value={name} onChange={setName} />
            </>
          )}
          <Button kind="secondary" onClick={() => void save()} disabled={state === 'saving'}>
            {L(open ? PF.save : PF.create)}
          </Button>
          {state === 'noName' ? <Notice kind="error">{L(PF.noName)}</Notice> : null}
          {state === 'failed' ? <Notice kind="error">{L(PF.failed)}</Notice> : null}
        </>
      )}
    </section>
  )
}
