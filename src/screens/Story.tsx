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
import type { Level } from '../story/rating'
import {
  AgreeGrid,
  Beat,
  type BeatThen,
  Caption,
  CastGrid,
  DevNotes,
  Details,
  Fold,
  Group,
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
  PairShare,
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
  footnote,
  languages,
  onDone,
}: {
  ui: Lang
  /** The prototype line, on this landing screen only. */
  footnote?: string
  /** The language choice on the same screen, when the link lets the player choose (EVAL-8). */
  languages?: boolean
  onDone: (ok: boolean, langs?: Lang[]) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<Record<string, string>>({})
  const [lang, setLang] = useState<string | null>(null)
  const items = SS.eligible as unknown as { id: string; text: T }[]
  return (
    <Page
      surface="oof"
      stepKey="eligibility"
      screen="eligibility"
      footnote={footnote}
      oof={L(S.common.outOfFiction)}
      lang={langAttr(ui)}
      title={L(SS.eligibleTitle)}
      actions={
        <Button
          onClick={() =>
            onDone(
              items.every((i) => v[i.id] === 'yes'),
              lang ? (lang === 'both' ? ['en', 'hinglish'] : [lang as Lang]) : undefined,
            )
          }
          disabled={items.some((i) => !v[i.id]) || (languages === true && !lang)}
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
      {languages ? (
        <Choice
          legend={L(S.language.title)}
          options={[
            { id: 'en', text: L(S.language.en) },
            { id: 'hinglish', text: L(S.language.hinglish) },
            { id: 'both', text: L(S.language.both) },
          ]}
          value={lang}
          onChange={setLang}
        />
      ) : null}
    </Page>
  )
}

/** "Stop here, carry on later": the season stays saved on this device for the configured days. */
export function StoryStopped({ ui, onCarryOn }: { ui: Lang; onCarryOn: () => void }) {
  const L = (t: T) => t[ui]
  return (
    <Page
      surface="oof"
      stepKey="stopped"
      screen="story:stopped"
      oof={L(S.common.outOfFiction)}
      lang={langAttr(ui)}
      title={L(SS.savedHeading)}
      actions={<Button onClick={onCarryOn}>{L(SS.stoppedGo)}</Button>}
    >
      <Text>{fill(L(SS.stoppedBody), { days: config.season.chapters.saveDays })}</Text>
      <Text kind="small">{L(SS.savedRating)}</Text>
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
  drawn,
  onPick,
}: {
  ui: Lang
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
  submitState,
  onDone,
  onBack,
  onStop,
  onSubmit,
  onWithdraw,
}: {
  runner: StoryRunner
  submitState: 'idle' | 'sending' | 'failed'
  onDone: (v: unknown) => void
  onBack: () => void
  /** "Stop here, carry on later" at a chapter end: the season stays saved on this device. */
  onStop: () => void
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
    step.kind === 'beat' ||
    step.kind === 'reveal' ||
    step.kind === 'payoff' ||
    step.kind === 'season'
  /* The season map (EVAL-8, concept D): six stops and the current chapter's card dots, on the
     story's screens, the chapter-end save screens and the finale's cards. */
  const k = runner.chapters
  const chapter = runner.chapterAt()
  const finale = chapter > k
  const stopTitle = (n: number) => (n > k ? L(SS.finaleAct) : L(episodes[n - 1].title))
  const cards = runner.chapterCards(chapter)
  const showMap = inStory || step.kind === 'saved'
  const map = showMap
    ? {
        stops: [...Array(k + 1).keys()].map((i) => ({
          title: stopTitle(i + 1),
          state: (i + 1 < chapter ? 'done' : i + 1 === chapter ? 'now' : 'next') as
            'done' | 'now' | 'next',
        })),
        cards,
        label: finale
          ? fill(L(SS.mapFinale), { done: cards.done, cards: cards.total })
          : fill(L(SS.mapNow), {
              n: chapter,
              k,
              title: stopTitle(chapter),
              done: cards.done,
              cards: cards.total,
            }),
      }
    : undefined
  const page = {
    surface: inStory ? 'game' : 'oof',
    act: showMap
      ? finale
        ? L(SS.finaleAct)
        : fill(L(SS.chapterOf), { n: chapter, k, title: stopTitle(chapter) })
      : undefined,
    map,
    oof: inStory ? undefined : L(S.common.outOfFiction),
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
        <Page {...page} actions={<Button onClick={() => onDone(null)}>{L(SS.start)}</Button>}>
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
    case 'reveal': {
      const rv = story.reveal
      if (!rv) return null
      return (
        <Page {...page} actions={<Button onClick={() => onDone(null)}>{L(rv.go)}</Button>}>
          {then ? <Then id={`${key}-then`} {...then} /> : null}
          <Splash
            title={L(rv.title)}
            body={L(rv.body)}
            describedBy={then ? `${key}-then` : undefined}
          />
          <CastGrid
            kind="reveal"
            label={L(rv.title)}
            items={castTiles(
              runner,
              true,
              (c) => [
                fill(L(rv.line), {
                  mascot: c.mascot,
                  animal: L(c.animalName),
                  name: runner.displayName(c.slot, true),
                }),
                ...colleagueView(runner, c, true).cues,
              ],
              true,
            )}
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
          {/* A statistic not yet sourced is a marked placeholder in content/notes.json; a player
             never sees it (X-16), so the note shows its instruction only until it is sourced. */}
          {n.placeholder ? null : (
            <>
              <Text kind="lead">{L(n.statistic)}</Text>
              <Text kind="small">{`${L(S.note.sourceLabel)}: ${L(n.source)}`}</Text>
            </>
          )}
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
    case 'payoff': {
      const ep = episodes[step.n - 1]
      const [sa, sb] = config.season.chapters.payoffSlots
      const names = { a: runner.displayName(sa, true), b: runner.displayName(sb, true) }
      return (
        <Page
          {...page}
          pin
          actions={<Button onClick={() => onDone(null)}>{L(SS.payoffGo)}</Button>}
        >
          <Beat then={then} question={L(ep.title)} />
          <Strip
            label={L(SS.payoffLabel)}
            panels={ep.payoff.map((p) => ({ art: p.art, text: fill(L(p.text), names) }))}
          />
          {back}
        </Page>
      )
    }
    case 'saved': {
      const last = step.n >= runner.chapters
      const days = config.season.chapters.saveDays
      return (
        <Page
          {...page}
          title={fill(L(SS.savedTitle), { n: step.n })}
          actions={
            <>
              <Button onClick={() => onDone(null)}>
                {last ? L(SS.savedGoFinale) : fill(L(SS.savedGo), { n: step.n + 1 })}
              </Button>
              <Button kind="quiet" onClick={onStop}>
                {L(SS.savedStop)}
              </Button>
            </>
          }
        >
          <Heading>{L(SS.savedHeading)}</Heading>
          <Text>{fill(L(SS.savedBody), { days })}</Text>
          <Text>
            {fill(L(SS.savedNext), {
              title: last ? L(SS.finaleAct) : L(episodes[step.n].title),
            })}
          </Text>
          <Text kind="small">{L(SS.savedRating)}</Text>
        </Page>
      )
    }
    case 'wrap':
      return <WrapStep key={key} ui={ui} page={page} onDone={onDone} />
    case 'demographics':
      return <DemographicsStep key={key} ui={ui} page={page} onDone={onDone} />
    case 'close':
      return (
        <CloseStep
          key={key}
          runner={runner}
          page={page}
          submitState={submitState}
          onSubmit={onSubmit}
          onWithdraw={onWithdraw}
        />
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
  return { text: c.text, look: v?.look, label: v?.figureLabel }
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
  /* The chapter's opening is folded into its first card's caption (EVAL-8, concept A). */
  const chapter = runner.chapterAt()
  const firstOfChapter =
    chapter <= runner.chapters &&
    runner.steps.findIndex((st, k) => st.kind === 'beat' && runner.chapterOf[k] === chapter) ===
      runner.index
  const opening = firstOfChapter ? runner.season.story.episodes?.[chapter - 1]?.opening : undefined
  const scene = opening ? `${L(opening)} ${L(b.beat.scene)}` : L(b.beat.scene)
  const head = <Beat then={then} scene={scene} question={L(b.beat.question)} />
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
  const saved = runner.answers.get(i)
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
        initial={saved && 'order' in saved ? saved.order : undefined}
        labels={{
          hint: L(SS.rankHint),
          clear: L(SS.rankUndo),
          lock: L(SS.rankLock),
          ready: L(SS.rankReady),
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
  else {
    /* A share as a one-tap pair (EVAL-8, B1): the whole pool to one, or evenly; stored as units,
       so scoring and records are unchanged. */
    const pool = b.beat.pool ?? 6
    const initial =
      saved && 'units' in saved
        ? saved.units[0] === saved.units[1]
          ? ('even' as const)
          : saved.units.indexOf(Math.max(...saved.units))
        : undefined
    input = (
      <PairShare
        items={items}
        initial={initial}
        onDone={(c) =>
          onDone({
            units: items.map((_, pos) => (c === 'even' ? pool / 2 : pos === c ? pool : 0)),
          })
        }
        labels={{
          hint: L(SS.pairHint),
          even: L(SS.pairEven),
          lock: L(SS.pairLock),
          chosen: (name) => fill(L(SS.pairChosen), { name }),
          chosenEven: L(SS.pairChosenEven),
        }}
      />
    )
  }
  return (
    <Page {...page}>
      {head}
      {b.beat.kind === 'split' ? (
        <Text kind="small">{L(SS.pairHint)}</Text>
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

/**
 * The wrap's three items on one screen with one Done (EVAL-8): prior knowledge, how they came
 * to play, and replay. Done waits until all three are answered.
 */
function WrapStep({
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
  const told = S.wrap.prior.find((x) => x.id === 'told')
  const items = [
    {
      id: 'told',
      text: told?.text ?? SS.wrapTitle,
      options: [
        { id: 'yes', text: S.common.yes },
        { id: 'no', text: S.common.no },
        { id: 'not-sure', text: S.common.notSure },
      ],
    },
    SS.origin as unknown as { id: string; text: T; options: { id: string; text: T }[] },
    SS.replay as unknown as { id: string; text: T; options: { id: string; text: T }[] },
  ]
  return (
    <Page
      {...page}
      title={L(SS.wrapTitle)}
      actions={
        <Button onClick={() => onDone(v)} disabled={items.some((it) => !v[it.id])}>
          {L(SS.wrapDone)}
        </Button>
      }
    >
      {items.map((it) => (
        <Choice
          key={it.id}
          legend={L(it.text)}
          options={it.options.map((o) => ({ id: o.id, text: L(o.text) }))}
          value={v[it.id] ?? null}
          onChange={(id) => setV({ ...v, [it.id]: id })}
        />
      ))}
    </Page>
  )
}

/**
 * Debrief, code and submit on one screen (EVAL-8): what the season measured, the withdrawal
 * code with its release dates and the "I have saved it" box, then Submit or Withdraw, which
 * wait for the code and the box.
 */
function CloseStep({
  runner,
  page,
  submitState,
  onSubmit,
  onWithdraw,
}: {
  runner: StoryRunner
  page: PageBase
  submitState: 'idle' | 'sending' | 'failed'
  onSubmit: () => void
  onWithdraw: () => void
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
  const wait = !ready || !saved || submitState === 'sending'
  return (
    <Page
      {...page}
      title={L(SS.debriefTitle)}
      actions={
        <>
          <Button onClick={onSubmit} disabled={wait}>
            {L(S.wrap.submit.submit)}
          </Button>
          <Button kind="secondary" onClick={onWithdraw} disabled={wait}>
            {L(S.wrap.submit.withdraw)}
          </Button>
        </>
      }
    >
      <List items={SS.debrief.map(L)} />
      <Group label={L(S.wrap.code.title)}>
        <Heading>{L(S.wrap.code.title)}</Heading>
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
      </Group>
      <Group label={L(SS.submitTitle)}>
        <Heading>{L(SS.submitTitle)}</Heading>
        <Text>{L(S.wrap.submit.body)}</Text>
        {submitState === 'failed' ? <Notice kind="error">{L(S.wrap.submit.failed)}</Notice> : null}
      </Group>
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
  finished,
}: {
  runner: StoryRunner
  finished: 'submitted' | 'withdrawn'
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const [m] = useState(() => resultModel(runner))
  const h = m.rating.headline
  /* The band's reading opens with its first sentence; the rest is one tap away (owner, 19 Oct
     2026: no block of more than about 60 words on a note screen). */
  const [lead, ...more] = m.body.split(/(?<=[.!?])\s+(?=[A-Z])/)
  return (
    <Page
      surface="oof"
      stepKey="story-result"
      screen="story:result"
      title={L(RT.title)}
      oof={L(S.common.outOfFiction)}
      lang={langAttr(ui)}
    >
      <Text kind="lead">{L(RT.opening)}</Text>
      <ResultHero
        group={L(RT.cues.sex.label)}
        figure={m.hero ?? undefined}
        band={m.band}
        body={lead}
      >
        {more.length ? (
          <Details summary={L(S.common.fullDetails)}>
            <Text>{more.join(' ')}</Text>
          </Details>
        ) : null}
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
      <Text kind="small">{L(RT.intro)}</Text>
      <Heading>{L(RT.areasTitle)}</Heading>
      {m.domains.map((d, n) => (
        <Fold key={d.domain} title={d.title} open={n === 0}>
          <Text>{d.narrative}</Text>
          {d.reading ? (
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
          ) : null}
          {d.examples.length ? (
            <PointCard
              title={L(RT.cards.examplesTitle)}
              body={L(RT.cards.examplesBody)}
              evidence={d.examples}
              evidenceLabel={L(RT.evidence)}
            />
          ) : null}
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
      <Notice>{L(finished === 'submitted' ? RT.submitted : RT.withdrawn)}</Notice>
      <KeepIt
        runner={runner}
        zone={h.zone}
        level={h.level}
        towards={h.towards}
        weight={h.weight}
        pairs={h.pairs}
      />
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
    <Group label={L(RT.contactTitle)}>
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
    </Group>
  )
}

/** Save to a profile (made here if there is none open) and the retake line. */
function KeepIt({
  runner,
  zone,
  level,
  towards,
  weight,
  pairs,
}: {
  runner: StoryRunner
  zone: 'lean' | 'none' | 'unread'
  level: Level
  towards?: 'focal' | 'comparison'
  weight: number
  pairs: number
}) {
  const ui = runner.lang
  const L = (t: T) => t[ui]
  const open = currentProfile()
  const [name, setName] = useState('')
  /* After a reload of the result, a season this profile already holds shows as saved. */
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'noName' | 'failed'>(() =>
    runner.code && open?.data.sessions.some((x) => x.code === runner.code) ? 'saved' : 'idle',
  )
  const [code, setCode] = useState<string | null>(null)
  const session = () => ({
    story: runner.season.story.id,
    day: today(),
    zone,
    level,
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
    <Group label={L(PF.saveTitle)}>
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
    </Group>
  )
}
