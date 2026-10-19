/**
 * The season story on screen (EVAL-4): the season picker, every story step, and the result
 * page. Story screens are on the game surface; the statements, the wrap and the result are out
 * of fiction (knowledge/design.md, section 3). Every decision commits on its tap and the next
 * screen opens with what came of it; Back reopens the last decision. Nothing counts down.
 */
import { useEffect, useState } from 'react'
import { notesById, screeningItems, screens, surveyItems } from '../content'
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
import { castTiles, colleagueView, langAttr, trackLines } from '../story/view'
import { resultModel } from '../story/why'
import {
  AgreeGrid,
  Beat,
  type BeatThen,
  Caption,
  CastGrid,
  DevNotes,
  Fold,
  Panel,
  ReadingList,
  ResultHero,
  Splash,
  Strip,
  Then,
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
  ShareCard,
  Spectrum,
  StoryPick,
  TapOrder,
  Text,
} from '../ui'

const S = screens

/**
 * The two eligibility items before the four sentences (candidates v17 3.19): aged 18 or over,
 * working in India. Asked, not counted, and not stored beyond the session.
 */
export function Eligibility({
  ui,
  demo,
  onDone,
}: {
  ui: Lang
  demo: boolean
  onDone: (ok: boolean) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<Record<string, string>>({})
  const items = SS.eligible as unknown as { id: string; text: T }[]
  return (
    <Page
      surface="oof"
      stepKey="eligibility"
      screen="eligibility"
      oof={L(S.common.outOfFiction)}
      demo={demo ? L(S.common.demoBadge) : undefined}
      lang={langAttr(ui)}
      title={L(SS.eligibleTitle)}
      actions={
        <Button
          onClick={() => onDone(items.every((i) => v[i.id] === 'yes'))}
          disabled={items.some((i) => !v[i.id])}
        >
          {L(S.common.continue)}
        </Button>
      }
    >
      {items.map((it) => (
        <Choice
          key={it.id}
          legend={L(it.text)}
          options={[
            { id: 'yes', text: L(S.common.yes) },
            { id: 'no', text: L(S.common.no) },
          ]}
          value={v[it.id] ?? null}
          onChange={(id) => setV({ ...v, [it.id]: id })}
        />
      ))}
    </Page>
  )
}

export function NotEligible({ ui }: { ui: Lang }) {
  const L = (t: T) => t[ui]
  return (
    <Page
      surface="oof"
      stepKey="not-eligible"
      oof={L(S.common.outOfFiction)}
      lang={langAttr(ui)}
      title={L(SS.eligibleTitle)}
    >
      <Text kind="lead">{L(SS.eligibleNo)}</Text>
    </Page>
  )
}

/** The season card, NPQE's way in: the drawn story starts with one tap; the others are shown, playable after the rating (PENDING v18). */
export function StoryPicker({
  ui,
  demo,
  drawn,
  onPick,
}: {
  ui: Lang
  demo: boolean
  /** The story the tool drew for this player (candidates v17 3.17: randomised, not chosen). */
  drawn: Story | null
  onPick: (s: Story) => void
}) {
  const L = (t: T) => t[ui]
  const played = playedStories()
  const options = stories.map((s) => ({
    id: s.id,
    art: s.art,
    title: L(s.title),
    premise: L(s.premise),
    later: s.id === drawn?.id ? undefined : played.has(s.id) ? L(PF.played) : L(SS.pickLater),
  }))
  const left = !!drawn
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
  const consequence = prev?.kind === 'beat' ? runner.consequence(prev.i) : null
  const then = thenView(runner, consequence)
  const inStory =
    step.kind === 'intro' ||
    step.kind === 'episode' ||
    step.kind === 'beat' ||
    step.kind === 'reveal' ||
    step.kind === 'interlude' ||
    step.kind === 'season'
  const episodeNow =
    step.kind === 'beat'
      ? runner.season.beats[step.i].beat.episode
      : step.kind === 'episode' || step.kind === 'interlude'
        ? step.n
        : step.kind === 'reveal' || step.kind === 'intro'
          ? 1
          : episodes.length
  const act = (n: number) =>
    fill(L(SS.episodeOf), { n, k: episodes.length, title: L(episodes[n - 1].title) })
  const page = {
    surface: inStory ? 'game' : 'oof',
    act: inStory ? act(episodeNow) : undefined,
    track: inStory ? { n: episodeNow, k: episodes.length } : undefined,
    progress: inStory
      ? fill(L(SS.pageOf), { n: runner.index + 1, k: runner.steps.length })
      : undefined,
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

  switch (step.kind) {
    case 'intro':
      return (
        <Page {...page} pin actions={<Button onClick={() => onDone(null)}>{L(SS.start)}</Button>}>
          <Splash title={fill(L(SS.startTitle), { company: L(story.company as T) })} />
          <Panel tone="paper">
            <List items={(story.intro ?? []).map(L)} />
          </Panel>
          {story.mascots ? <Caption>{L(story.mascots)}</Caption> : null}
          <CastGrid
            kind="sheet"
            label={L(SS.mascotsTitle)}
            items={castTiles(runner, false, (c) => [L(c.animalName)])}
          />
        </Page>
      )
    case 'episode': {
      const ep = episodes[step.n - 1]
      return (
        <Page
          {...page}
          pin
          actions={
            <Button onClick={() => onDone(null)}>{fill(L(SS.episodeGo), { n: step.n })}</Button>
          }
        >
          {then ? <Then id={`${key}-then`} {...then} /> : null}
          <Splash
            kicker={fill(L(SS.episodeShort), { n: step.n })}
            title={L(ep.title)}
            body={L(ep.premise)}
            describedBy={then ? `${key}-then` : undefined}
          />
          {back}
        </Page>
      )
    }
    case 'reveal': {
      const rv = story.reveal
      if (!rv) return null
      return (
        <Page {...page} pin actions={<Button onClick={() => onDone(null)}>{L(rv.go)}</Button>}>
          {then ? <Then id={`${key}-then`} {...then} /> : null}
          <Splash
            title={L(rv.title)}
            body={L(rv.body)}
            describedBy={then ? `${key}-then` : undefined}
          />
          <CastGrid
            kind="reveal"
            label={L(rv.title)}
            items={castTiles(runner, true, (c) => [
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
          pin
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          {then ? <Then id={`${key}-then`} {...then} /> : null}
          <Splash
            title={L(SS.seasonTitle)}
            body={L(runner.seasonBand().text)}
            describedBy={then ? `${key}-then` : undefined}
          />
          <CastGrid
            kind="reveal"
            label={L(SS.rosterTitle)}
            items={castTiles(runner, true, trackLines(runner))}
          />
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
          onDone={onDone}
        />
      )
    case 'interlude': {
      const ep = episodes[step.n - 1]
      const panels = ep.interlude?.panels ?? []
      return (
        <Page
          {...page}
          pin
          actions={<Button onClick={() => onDone(null)}>{L(SS.interludeGo)}</Button>}
        >
          <Beat then={then} question={L(ep.title)} />
          <Strip
            label={L(SS.stripLabel)}
            panels={panels.map((p) => ({ art: p.art, text: L(p.text) }))}
          />
          {back}
        </Page>
      )
    }
    case 'screening':
      return (
        <GridStep
          key={key}
          ui={ui}
          page={page}
          title={L(SS.screeningTitle)}
          items={config.season.faking.screening.flatMap((id) => {
            const it = screeningItems.find((x) => x.id === id)
            return it ? [{ id, text: L(it.text) }] : []
          })}
          onDone={onDone}
        />
      )
    case 'fsurvey':
      return (
        <GridStep
          key={key}
          ui={ui}
          page={page}
          title={L(step.admin === 1 ? SS.surveyTitle : SS.surveyTitle2)}
          items={config.season.faking.survey.flatMap((id) => {
            const it = surveyItems.find((x) => x.id === id)
            return it ? [{ id, text: L(it.text) }] : []
          })}
          onDone={onDone}
        />
      )
    case 'note': {
      const n = notesById.get(runner.note)
      if (!n) return null
      return (
        <Page
          {...page}
          title={L(S.note.title)}
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          <Text kind="lead">{L(n.statistic)}</Text>
          <Text kind="small">
            {L(S.note.sourceLabel)}: {L(n.source)}
          </Text>
          <Text kind="strong">{L(n.instruction)}</Text>
        </Page>
      )
    }
    case 'recall':
      return (
        <Page {...page} title={L(S.recall.question)}>
          <Options
            label={L(S.recall.question)}
            options={runner.recallOrder.map((id) => {
              const o = S.recall.options.find((x) => x.id === id)
              return { id, text: o ? L(o.text) : id }
            })}
            onPick={onDone}
          />
        </Page>
      )
    case 'probe':
      return <ProbeStep key={key} ui={ui} page={page} onDone={onDone} />
    case 'prior': {
      const item =
        step.id === 'origin'
          ? SS.origin
          : step.id === 'replay'
            ? SS.replay
            : {
                text: S.wrap.prior.find((x) => x.id === step.id)?.text,
                options: [
                  { id: 'yes', text: S.common.yes },
                  { id: 'no', text: S.common.no },
                  { id: 'not-sure', text: S.common.notSure },
                ],
              }
      const q = item as unknown as { text: T; options: { id: string; text: T }[] }
      if (!q.text) return null
      return (
        <Page {...page} title={L(q.text)}>
          <Options
            label={L(q.text)}
            options={q.options.map((o) => ({ id: o.id, text: L(o.text) }))}
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

/** The consequence panel's words and face: whoever led the last decision, as they were shown. */
function thenView(
  runner: StoryRunner,
  c: ReturnType<StoryRunner['consequence']>,
): BeatThen | undefined {
  if (!c) return undefined
  const v = c.lead ? colleagueView(runner, runner.person(c.lead.slot), c.lead.revealed) : null
  return { text: c.text, answer: c.summary, look: v?.look, label: v?.figureLabel }
}

function BeatStep({
  runner,
  i,
  page,
  then,
  back,
  onDone,
}: {
  runner: StoryRunner
  i: number
  page: PageBase
  then: BeatThen | undefined
  back: React.ReactNode
  onDone: (v: unknown) => void
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const b = runner.season.beats[i]
  const head = <Beat then={then} scene={L(b.beat.scene)} question={L(b.beat.question)} />
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
      </Page>
    )
  }
  const shown = runner.revealed(i)
  const items = b.chars.map((ch) => {
    const d = b.beat.descriptions.find((x) => x.id === ch.d)
    return colleagueView(runner, runner.person(ch.slot), shown, d ? L(d.text) : '')
  })
  let input: React.ReactNode
  if (b.beat.kind === 'rank')
    input = (
      <TapOrder
        items={items}
        onDone={(order) => onDone({ order })}
        labels={{
          hint: L(SS.rankHint),
          clear: L(SS.rankUndo),
          cleared: L(SS.rankCleared),
          stamp: (n) => L(SS.rankStamps[n - 1] ?? { en: String(n), hinglish: String(n) }),
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
    </Page>
  )
}

/** Agree or disagree items on one grid screen (the screening block, each survey administration). */
function GridStep({
  ui,
  page,
  title,
  items,
  onDone,
}: {
  ui: Lang
  page: PageBase
  title: string
  items: { id: string; text: string }[]
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<Record<string, number>>({})
  const left = items.filter((i) => v[i.id] === undefined).length
  return (
    <Page
      {...page}
      title={title}
      actions={
        <Button onClick={() => onDone(v)} disabled={left > 0}>
          {L(SS.surveyDone)}
        </Button>
      }
    >
      <Text>{L(SS.surveyBody)}</Text>
      <AgreeGrid
        items={items}
        scale={SS.surveyKey.map(L)}
        value={v}
        onChange={setV}
        keyLabel={SS.surveyKey.map((s, i) => `${i + 1} ${L(s)}`).join(', ')}
      />
      <Text kind="small">{left > 0 ? fill(L(SS.surveyLeft), { n: left }) : ''}</Text>
    </Page>
  )
}

/** "Spot the pattern": any number of answers, then one confirm tap (candidates v17 3.17). */
function ProbeStep({
  ui,
  page,
  onDone,
}: {
  ui: Lang
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<string[]>([])
  const pr = S.wrap.probe
  return (
    <Page
      {...page}
      actions={
        <Button onClick={() => onDone(v)} disabled={v.length === 0}>
          {L(SS.probeDone)}
        </Button>
      }
    >
      <Checks
        heading
        legend={L(pr.question)}
        hint={L(pr.hint)}
        options={pr.options.map((o) => ({ id: o.id, text: L(o.text) }))}
        value={v}
        onChange={setV}
      />
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
      <Notice>{L(finished === 'submitted' ? RT.submitted : RT.withdrawn)}</Notice>
      <ResultHero
        group={L(RT.cues.sex.label)}
        figure={m.hero ?? undefined}
        band={m.band}
        body={m.body}
      >
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
        {m.why.length ? <List items={m.why} /> : null}
      </ResultHero>
      <Heading>{L(RT.otherTitle)}</Heading>
      <ReadingList
        label={L(RT.otherTitle)}
        items={m.cards
          .filter((c) => c.cue !== 'sex')
          .map((c) => ({ id: c.cue, label: c.label, level: c.level, zone: c.zone }))}
      />
      <Text kind="lead">{L(RT.opening)}</Text>
      <Text kind="small">{L(RT.intro)}</Text>
      <Heading>{L(RT.areasTitle)}</Heading>
      {m.domains.map((d, n) => (
        <Fold key={d.domain} title={d.title} open={n === 0}>
          <Text>{d.narrative}</Text>
          <ReadingList
            label={d.title}
            items={[
              {
                id: d.domain,
                label: L(RT.cueShort.sex),
                level: d.reading.level,
                zone: d.reading.zone,
              },
            ]}
          />
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
        </Fold>
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
      <DevNotes
        title={L(SS.devTitle)}
        notes={[
          RT._devPending as unknown as T,
          RT._watchPending as unknown as T,
          RT._contactResearchPending as unknown as T,
        ].map((x) => (typeof x === 'string' ? x : L(x)))}
      />
    </Page>
  )
}

/**
 * After the result: name and email, both optional, and two separate unticked boxes (follow-up
 * and retake reminders; longitudinal research, consent PENDING v18). Stored apart from the
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
