/**
 * One step of a session, on screen. Every screen is a Page on one of three surfaces
 * (knowledge/design.md, section 3). No screen shows a timer, a score or a right answer.
 */
import { useEffect, useState } from 'react'
import { inboxBank, notesById, screeningItems, screens, xw } from '../content'
import type { Lang, T } from '../content/types'
import { formatDate, releaseOf } from '../engine/config'
import { formatCode } from '../engine/codes'
import { characterView, fill } from '../engine/text'
import { randomiserStatement, type Runner } from '../engine/runner'
import { isOutOfFiction, recallOptions, type Step } from '../engine/session'
import {
  Allocate,
  Button,
  Checks,
  Choice,
  Code,
  List,
  Notice,
  Page,
  SortList,
  Statement,
  Text,
} from '../ui'

const S = screens

export function StepView({
  runner,
  step,
  ui,
  demo,
  onDone,
  submitState,
  onSubmit,
  onWithdraw,
}: {
  runner: Runner
  step: Step
  ui: Lang
  demo: boolean
  onDone: (value: unknown) => void
  submitState: 'idle' | 'sending' | 'failed'
  onSubmit: () => void
  onWithdraw: () => void
}) {
  const L = (t: T) => t[ui]
  const key = `${runner.index}`
  const oof = isOutOfFiction(step) ? L(S.common.outOfFiction) : undefined
  const surface = step.act === 'inbox' ? 'sober' : oof ? 'oof' : 'game'
  const act = L((S.common.acts as Record<string, T>)[step.act])
  const page = {
    surface,
    act,
    oof,
    demo: demo ? L(S.common.demoBadge) : undefined,
    stepKey: key,
    lang: ui === 'hinglish' ? 'hi-Latn' : 'en-GB',
    screen: `${step.act}:${step.kind}${step.kind === 'intro' ? `:${step.which}` : step.kind === 'people' ? `:${step.p.card.type}` : ''}`,
  } as const

  switch (step.kind) {
    case 'tutorial':
      return (
        <Page
          {...page}
          title={L(S.tutorial.title)}
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          <List items={S.tutorial.body.map(L)} />
        </Page>
      )
    case 'people':
      return <PeopleStep key={key} step={step} ui={ui} page={page} onDone={onDone} />
    case 'ordinary':
      return (
        <OrdinaryStep key={key} runner={runner} step={step} ui={ui} page={page} onDone={onDone} />
      )
    case 'intro':
      return <IntroStep key={key} step={step} ui={ui} page={page} onDone={onDone} />
    case 'screening': {
      const item = screeningItems.find((i) => i.id === step.id)
      if (!item) return null
      const options =
        item.format === 'direct'
          ? S.survey.scale.map((t, i) => ({ id: String(i), text: L(t) }))
          : (item.options ?? []).map((o) => ({ id: o.id, text: L(o.text) }))
      return (
        <ChoiceStep
          key={key}
          page={page}
          legend={L(item.text)}
          options={options}
          next={L(S.common.next)}
          onDone={onDone}
        />
      )
    }
    case 'survey':
      return (
        <ChoiceStep
          key={key}
          page={page}
          legend={L(step.item.text)}
          options={S.survey.scale.map((t, i) => ({ id: String(i), text: L(t) }))}
          next={L(S.common.next)}
          onDone={(v) => onDone(Number(v))}
        />
      )
    case 'xw-direct':
      return (
        <ChoiceStep
          key={key}
          page={page}
          legend={L(step.item.text)}
          options={[
            { id: 'yes', text: L(S.common.yes) },
            { id: 'no', text: L(S.common.no) },
          ]}
          next={L(S.common.next)}
          onDone={(v) => onDone(v === 'yes')}
        />
      )
    case 'xw': {
      const b = randomiserStatement(runner.session.draws.xwSub, ui)
      return (
        <ChoiceStep
          key={key}
          page={page}
          before={
            <>
              {step.fictional ? (
                <Text kind="muted">{L(xw.practice.fictionalRandomiser)}</Text>
              ) : null}
              <Statement
                a={L(step.item.text)}
                b={b}
                labelA={L(S.offTheRecord.statementA)}
                labelB={L(S.offTheRecord.statementB)}
              />
            </>
          }
          legend={L(S.offTheRecord.which)}
          options={[
            { id: 'same', text: L(xw.answers.same) },
            { id: 'different', text: L(xw.answers.different) },
          ]}
          next={L(S.common.next)}
          onDone={onDone}
        />
      )
    }
    case 'm1h-direct':
      return (
        <ChoiceStep
          key={key}
          page={page}
          legend={L(step.item.text)}
          options={[
            { id: 'true', text: L(S.offTheRecord.true) },
            { id: 'false', text: L(S.offTheRecord.false) },
          ]}
          next={L(S.common.next)}
          onDone={(v) => onDone(v === 'true')}
        />
      )
    case 'inbox':
      return <InboxStep key={key} step={step} page={page} onDone={onDone} />
    case 'note': {
      const n = notesById.get(step.note)
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
        <ChoiceStep
          key={key}
          page={page}
          legend={L(S.recall.question)}
          options={recallOptions(runner.note).map((o) => ({ id: o.id, text: L(o.text) }))}
          next={L(S.common.next)}
          onDone={onDone}
        />
      )
    case 'probe':
      return <ProbeStep key={key} page={page} ui={ui} onDone={onDone} />
    case 'result':
      return (
        <Page
          {...page}
          surface="game"
          oof={undefined}
          title={L(S.wrap.result.title)}
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          <Text kind="lead">{L(runner.seasonBand().text)}</Text>
        </Page>
      )
    case 'prior': {
      const p = S.wrap.prior.find((x) => x.id === step.id)
      if (!p) return null
      return (
        <ChoiceStep
          key={key}
          page={page}
          legend={L(p.text)}
          options={[
            { id: 'yes', text: L(S.common.yes) },
            { id: 'no', text: L(S.common.no) },
            { id: 'not-sure', text: L(S.common.notSure) },
          ]}
          next={L(S.common.next)}
          onDone={onDone}
        />
      )
    }
    case 'debrief':
      return (
        <Page
          {...page}
          title={L(S.wrap.debrief.title)}
          actions={<Button onClick={() => onDone(null)}>{L(S.common.continue)}</Button>}
        >
          <List items={S.wrap.debrief.points.map(L)} />
        </Page>
      )
    case 'code':
      return <CodeStep key={key} runner={runner} page={page} ui={ui} onDone={onDone} />
    case 'demographics':
      return <DemographicsStep key={key} runner={runner} page={page} ui={ui} onDone={onDone} />
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

function ChoiceStep({
  page,
  legend,
  options,
  next,
  onDone,
  before,
}: {
  page: PageBase
  legend: string
  options: { id: string; text: string }[]
  next: string
  onDone: (v: string) => void
  before?: React.ReactNode
}) {
  const [v, setV] = useState<string | null>(null)
  return (
    <Page
      {...page}
      actions={
        <Button onClick={() => v !== null && onDone(v)} disabled={v === null}>
          {next}
        </Button>
      }
    >
      {before}
      <Choice legend={legend} options={options} value={v} onChange={setV} heading />
    </Page>
  )
}

function PeopleStep({
  step,
  ui,
  page,
  onDone,
}: {
  step: Extract<Step, { kind: 'people' }>
  ui: Lang
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const p = step.p
  const lang = p.lang
  const Lc = (t: T) => t[lang]
  const L = (t: T) => t[ui]
  const views = p.chars.map((c) => characterView(p, c, lang))
  const [order, setOrder] = useState<number[]>(p.start)
  const [units, setUnits] = useState<number[]>([0, 0, 0, 0])
  const [answered, setAnswered] = useState(false)
  const pool = p.card.pool ?? 0
  const alloc = p.card.type === 'allocation'
  const complete = !alloc || units.reduce((a, b) => a + b, 0) === pool
  const firstIdx = alloc ? units.indexOf(Math.max(...units)) : order[0]
  if (answered) {
    return (
      <Page
        {...page}
        stepKey={`${page.stepKey}:answered`}
        lang={lang === 'hinglish' ? 'hi-Latn' : 'en-GB'}
        title={Lc(p.card.title)}
        actions={
          <Button onClick={() => onDone(alloc ? { units } : { order })}>
            {L(screens.common.next)}
          </Button>
        }
      >
        <Text kind="lead">{fill(Lc(p.card.continuation), { first: views[firstIdx].name })}</Text>
      </Page>
    )
  }
  return (
    <Page
      {...page}
      lang={lang === 'hinglish' ? 'hi-Latn' : 'en-GB'}
      title={Lc(p.card.title)}
      actions={
        <Button onClick={() => setAnswered(true)} disabled={!complete}>
          {L(screens.common.confirm)}
        </Button>
      }
    >
      <Text>{alloc ? `${Lc(p.card.prompt)}` : Lc(p.card.prompt)}</Text>
      {alloc ? (
        <Allocate
          items={views}
          order={p.start}
          units={units}
          pool={pool}
          onChange={setUnits}
          labels={{
            add: (n) => `${L(screens.common.add)}: ${n}`,
            remove: (n) => `${L(screens.common.remove)}: ${n}`,
            left: (n) => fill(L(screens.common.left), { n }),
            done: L(screens.common.allShared),
            unit: p.card.unit ? Lc(p.card.unit) : '',
          }}
        />
      ) : (
        <>
          <Text kind="small">{L(screens.common.dragHint)}</Text>
          <SortList
            items={views}
            order={order}
            onChange={setOrder}
            labels={{
              label: Lc(p.card.title),
              up: (n) => `${L(screens.common.moveUp)}: ${n}`,
              down: (n) => `${L(screens.common.moveDown)}: ${n}`,
              moved: (n, pos, of) => `${n}, ${fill(L(screens.common.position), { n: pos, k: of })}`,
            }}
          />
        </>
      )}
    </Page>
  )
}

function OrdinaryStep({
  runner,
  step,
  ui,
  page,
  onDone,
}: {
  runner: Runner
  step: Extract<Step, { kind: 'ordinary' }>
  ui: Lang
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [recall] = useState(() => runner.recallName())
  if (answered) {
    return (
      <Page
        {...page}
        stepKey={`${page.stepKey}:answered`}
        title={L(step.d.title)}
        actions={<Button onClick={() => onDone(v)}>{L(screens.common.next)}</Button>}
      >
        <Text kind="lead">{fill(L(step.d.continuation), { recall })}</Text>
      </Page>
    )
  }
  return (
    <Page
      {...page}
      title={L(step.d.title)}
      actions={
        <Button onClick={() => setAnswered(true)} disabled={v === null}>
          {L(screens.common.confirm)}
        </Button>
      }
    >
      <Text>{fill(L(step.d.body), { recall })}</Text>
      <Choice
        legend={L(step.d.title)}
        options={step.d.options.map((o) => ({ id: o.id, text: L(o.text) }))}
        value={v}
        onChange={setV}
      />
    </Page>
  )
}

function IntroStep({
  step,
  ui,
  page,
  onDone,
}: {
  step: Extract<Step, { kind: 'intro' }>
  ui: Lang
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const go = <Button onClick={() => onDone(null)}>{L(screens.common.continue)}</Button>
  switch (step.which) {
    case 'screening':
      return (
        <Page {...page} title={L(screens.common.acts.screening)} actions={go}>
          <Text>{L(screens.screening.intro)}</Text>
        </Page>
      )
    case 'survey':
      return (
        <Page {...page} title={L(screens.common.acts.survey)} actions={go}>
          <Text>{L(screens.survey.intro)}</Text>
        </Page>
      )
    case 'direct':
      return (
        <Page {...page} title={L(screens.common.acts.direct)} actions={go}>
          <Text>{L(screens.direct.intro)}</Text>
        </Page>
      )
    case 'otr':
      return (
        <Page {...page} title={L(screens.offTheRecord.title)} actions={go}>
          <Text>{L(xw.instructions)}</Text>
          <Text kind="strong">{L(xw.randomiser)}</Text>
        </Page>
      )
    case 'xw-direct':
      return (
        <Page {...page} title={L(screens.offTheRecord.practiceTitle)} actions={go}>
          <Text>{L(screens.offTheRecord.directIntro)}</Text>
        </Page>
      )
    case 'xw-practice':
      return (
        <Page {...page} title={L(screens.offTheRecord.practiceTitle)} actions={go}>
          <Text>{L(screens.offTheRecord.practiceIntro)}</Text>
          <Text kind="strong">{L(xw.practice.fictionalRandomiser)}</Text>
        </Page>
      )
    case 'xw-items':
      return (
        <Page {...page} title={L(screens.offTheRecord.title)} actions={go}>
          <Text>{L(screens.offTheRecord.itemsIntro)}</Text>
          <Text kind="strong">{L(xw.randomiser)}</Text>
        </Page>
      )
    case 'm1h-direct':
      return (
        <Page {...page} title={L(screens.offTheRecord.title)} actions={go}>
          <Text>{L(screens.offTheRecord.directM1h)}</Text>
        </Page>
      )
    case 'inbox':
      return (
        <Page
          {...page}
          surface="sober"
          oof={undefined}
          title={L(screens.inbox.noteTitle)}
          actions={go}
        >
          <Text>{L(screens.inbox.note)}</Text>
          <Text kind="small">{L(screens.inbox.route)}</Text>
        </Page>
      )
  }
}

function InboxStep({
  step,
  page,
  onDone,
}: {
  step: Extract<Step, { kind: 'inbox' }>
  page: PageBase
  onDone: (v: unknown) => void
}) {
  const lang = step.lang
  const L = (t: T) => t[lang]
  const inc = inboxBank.find((i) => i.id === step.id)
  const [label, setLabel] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)
  if (!inc) return null
  return (
    <Page
      {...page}
      lang={lang === 'hinglish' ? 'hi-Latn' : 'en-GB'}
      actions={
        <Button
          onClick={() =>
            label !== null && action !== null && onDone({ label: Number(label), action })
          }
          disabled={label === null || action === null}
        >
          {L(screens.common.next)}
        </Button>
      }
    >
      <Text kind="lead">{L(inc.text)}</Text>
      <Choice
        heading
        legend={L(screens.inbox.question)}
        options={screens.inbox.scale.map((t, i) => ({ id: String(i), text: L(t) }))}
        value={label}
        onChange={setLabel}
      />
      <Choice
        legend={L(screens.inbox.nextQuestion)}
        options={screens.inbox.actions.map((a) => ({ id: a.id, text: L(a.text) }))}
        value={action}
        onChange={setAction}
      />
      <Text kind="small">{L(screens.inbox.route)}</Text>
    </Page>
  )
}

function ProbeStep({
  page,
  ui,
  onDone,
}: {
  page: PageBase
  ui: Lang
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<string[]>([])
  return (
    <Page
      {...page}
      actions={
        <Button onClick={() => onDone(v)} disabled={v.length === 0}>
          {L(screens.common.next)}
        </Button>
      }
    >
      <Checks
        heading
        legend={L(screens.wrap.probe.question)}
        hint={L(screens.wrap.probe.hint)}
        options={screens.wrap.probe.options.map((o) => ({ id: o.id, text: L(o.text) }))}
        value={v}
        onChange={setV}
      />
    </Page>
  )
}

function CodeStep({
  runner,
  page,
  ui,
  onDone,
}: {
  runner: Runner
  page: PageBase
  ui: Lang
  onDone: (v: unknown) => void
}) {
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
  const { releaseAt, deleteUntil: until } = releaseOf(runner.dep)
  return (
    <Page
      {...page}
      title={L(screens.wrap.code.title)}
      actions={
        <Button onClick={() => onDone(null)} disabled={!ready || !saved}>
          {L(screens.common.continue)}
        </Button>
      }
    >
      <Text>{L(screens.wrap.code.body)}</Text>
      {ready && runner.code ? (
        <Code value={formatCode(runner.code)} label={L(screens.wrap.code.title)} />
      ) : (
        <Notice>…</Notice>
      )}
      <Text>
        {fill(L(screens.wrap.code.release), {
          date: formatDate(releaseAt, ui),
          until: formatDate(until, ui),
        })}
      </Text>
      <Checks
        legend={L(screens.wrap.code.saved)}
        options={[{ id: 'saved', text: L(screens.common.yes) }]}
        value={saved ? ['saved'] : []}
        onChange={(ids) => setSaved(ids.includes('saved'))}
      />
    </Page>
  )
}

function DemographicsStep({
  runner,
  page,
  ui,
  onDone,
}: {
  runner: Runner
  page: PageBase
  ui: Lang
  onDone: (v: unknown) => void
}) {
  const L = (t: T) => t[ui]
  const items = screens.wrap.demographics.items.filter((i) => runner.dep !== 'firm' || i.firm)
  const [v, setV] = useState<Record<string, string>>({})
  return (
    <Page
      {...page}
      title={L(screens.wrap.demographics.title)}
      actions={<Button onClick={() => onDone(v)}>{L(screens.common.continue)}</Button>}
    >
      <Text>{L(screens.wrap.demographics.body)}</Text>
      {items.map((it) => (
        <Choice
          key={it.id}
          legend={L(it.text)}
          options={[
            ...it.options.map((o) => ({ id: o.id, text: L(o.text) })),
            { id: 'prefer-not', text: L(screens.common.skip) },
          ]}
          value={v[it.id] ?? null}
          onChange={(id) => setV({ ...v, [it.id]: id })}
        />
      ))}
    </Page>
  )
}
