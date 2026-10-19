/**
 * The optional pseudonymous profile (#/profile): open it with the recovery code, see past
 * ratings as a timeline (one band per season), the change line, the next retake as a date
 * (never a countdown), the separate longitudinal research opt-in (PENDING v17), and delete
 * everything. Out of fiction.
 */
import { useState } from 'react'
import { screens } from '../content'
import type { T } from '../content/types'
import { config, formatDate } from '../engine/config'
import { normaliseCode, validCode } from '../engine/codes'
import { store } from '../store'
import { PF, RT, storyById } from '../story/content'
import {
  changeOf,
  currentProfile,
  DEMO_PROFILE_CODE,
  deleteProfile,
  lockProfile,
  nextRetake,
  openProfile,
  playedStories,
  seedDemoProfile,
  setResearch,
} from '../story/profile'
import { stories } from '../story/content'
import { bandOf } from '../story/why'
import { Button, Checks, Field, Heading, List, Notice, Page, Text, Timeline } from '../ui'

const S = screens
const L = (t: T) => t.en
const demoBadge = config.demo ? L(S.common.demoBadge) : undefined

const dateOf = (day: string) => formatDate(Date.parse(`${day}T12:00:00+05:30`), 'en')

export function Profile({ go }: { go: (h: string) => void }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((x) => x + 1)
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'bad' | 'confirm' | 'deleted'>('idle')
  const [deleted, setDeleted] = useState<{ withdrawn: number; closed: number } | null>(null)
  const p = currentProfile()

  if (state === 'deleted' && deleted)
    return (
      <Page
        surface="oof"
        stepKey="profile-deleted"
        oof={L(S.common.outOfFiction)}
        demo={demoBadge}
        title={L(PF.title)}
      >
        <Notice kind="ok">
          {L(PF.deleted)
            .replace('{w}', String(deleted.withdrawn))
            .replace('{c}', String(deleted.closed))}
        </Notice>
      </Page>
    )

  if (!p) {
    const open = async (c: string) => {
      const n = normaliseCode(c)
      if (!validCode(n)) return setState('bad')
      const u = await openProfile(n)
      if (!u) return setState('bad')
      setState('idle')
      refresh()
    }
    return (
      <Page
        surface="oof"
        stepKey="profile-locked"
        oof={L(S.common.outOfFiction)}
        demo={demoBadge}
        title={L(PF.title)}
        actions={
          <>
            <Button onClick={() => void open(code)}>{L(PF.open)}</Button>
            {config.demo ? (
              <Button
                kind="secondary"
                onClick={() => void seedDemoProfile().then(() => open(DEMO_PROFILE_CODE))}
              >
                {L(PF.demoOpen)}
              </Button>
            ) : null}
          </>
        }
      >
        <Text>{L(PF.lockedBody)}</Text>
        <Field label={L(PF.codeLabel)} value={code} onChange={setCode} />
        {state === 'bad' ? <Notice kind="error">{L(PF.badCode)}</Notice> : null}
      </Page>
    )
  }

  if (state === 'confirm')
    return (
      <Page
        surface="oof"
        stepKey="profile-confirm"
        oof={L(S.common.outOfFiction)}
        demo={demoBadge}
        title={L(PF.deleteButton)}
        actions={
          <>
            <Button
              onClick={() =>
                void deleteProfile().then((r) => {
                  setDeleted(r)
                  setState('deleted')
                })
              }
            >
              {L(PF.deleteYes)}
            </Button>
            <Button kind="secondary" onClick={() => setState('idle')}>
              {L(PF.deleteNo)}
            </Button>
          </>
        }
      >
        <Text>{L(PF.deleteConfirm)}</Text>
      </Page>
    )

  const sessions = p.data.sessions
  const change = changeOf(sessions)
  const next = nextRetake(sessions)
  const played = playedStories()
  const canRetake = stories.some((s) => s.built && !played.has(s.id))
  const retake = async () => {
    const [t] = await store.issueTokens('season', 1, 'en')
    go(`#/play/${t}`)
  }
  const storyTitle = (id: string) => {
    const s = storyById(id)
    return s ? L(s.title) : id
  }
  return (
    <Page
      surface="oof"
      stepKey="profile"
      oof={L(S.common.outOfFiction)}
      demo={demoBadge}
      title={L(PF.named).replace('{name}', p.data.name)}
    >
      {p.data.demo ? <Notice>{L(PF.demoNote)}</Notice> : null}
      <Heading>{L(PF.timelineTitle)}</Heading>
      <Timeline
        label={L(PF.timelineTitle)}
        items={sessions.map((s) => ({
          when: dateOf(s.day),
          what: storyTitle(s.story),
          band: bandOf(s),
        }))}
      />
      <Heading>{L(PF.changeTitle)}</Heading>
      <Text>
        {change
          ? L(PF.change)
              .replace('{from}', dateOf(change.from.day))
              .replace('{to}', dateOf(change.to.day))
              .replace(
                '{group}',
                L(change.towards === 'focal' ? RT.cues.sex.focal : RT.cues.sex.comparison),
              )
          : L(PF.noChange)}
      </Text>
      {config.demo ? <Text kind="small">{L(PF.changePending)}</Text> : null}
      <Heading>{L(PF.retakeTitle)}</Heading>
      <Text>{L(PF.retakeBody)}</Text>
      {next !== null ? (
        <Text>{L(PF.retakeOn).replace('{date}', formatDate(next, 'en'))}</Text>
      ) : null}
      {config.demo && canRetake ? (
        <Button kind="secondary" onClick={() => void retake()}>
          {L(PF.retakeStart)}
        </Button>
      ) : null}
      {canRetake ? null : <Notice>{L(PF.noStoryLeft)}</Notice>}
      <Heading>{L(PF.researchTitle)}</Heading>
      <List items={PF.researchConsent.map(L)} />
      <Checks
        legend={L(PF.researchAgree)}
        options={[{ id: 'yes', text: L(S.common.yes) }]}
        value={p.data.research ? ['yes'] : []}
        onChange={(ids) => void setResearch(ids.includes('yes')).then(refresh)}
      />
      <Text kind="small">{L(p.data.research ? PF.researchOn : PF.researchOff)}</Text>
      <Heading>{L(PF.deleteTitle)}</Heading>
      <Button kind="secondary" onClick={() => setState('confirm')}>
        {L(PF.deleteButton)}
      </Button>
      <Button
        kind="quiet"
        onClick={() => {
          lockProfile()
          refresh()
        }}
      >
        {L(PF.lock)}
      </Button>
    </Page>
  )
}
