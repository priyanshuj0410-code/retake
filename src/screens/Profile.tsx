/**
 * The optional pseudonymous profile (EVAL-12, owner; knowledge/design.md section 4b): out of
 * fiction, in the note register.
 *   #/profile          the header (name, seasons, stories against those left, the next season's
 *                      date in words when a gap applies), "You now" (every reading pooled since
 *                      the last restart, tagged only at its registered season count), the change
 *                      line, and "This season" (its own position and range, untagged)
 *   #/profile/history  the trend of the pooled reading and every past season, untagged, each
 *                      with its read-only report (#/profile/season/<n>)
 *   #/profile/account  the recovery code, the display name, the optional email and its two
 *                      opt-ins, the research opt-in, sign out, and delete with its confirmation
 * Signed out, it is the sign-in screen. No timer, no countdown, nothing pending on screen.
 */
import { useEffect, useState } from 'react'
import { screens } from '../content'
import type { T } from '../content/types'
import { config, formatDate, type ProfileReadingId } from '../engine/config'
import { formatCode } from '../engine/codes'
import { fill } from '../engine/text'
import { LD, PF, RT, SS, storyById } from '../story/content'
import { profileNow, type PooledReading } from '../story/pool'
import {
  currentProfile,
  deleteProfile,
  lockProfile,
  nextRetake,
  rename,
  restoreProfile,
  setContact,
  setResearch,
  signedIn,
  storiesPlayed,
  type ProfileSession,
  type Unlocked,
} from '../story/profile'
import { pc, positionOf } from '../story/range'
import type { Cue } from '../story/rating'
import { levelName, rangeInWords, toTagLine } from '../story/why'
import {
  Button,
  Checks,
  Code,
  DevNotes,
  Field,
  Group,
  Heading,
  List,
  Notice,
  Page,
  RangeLine,
  ReadingList,
  Text,
  Timeline,
  Trend,
} from '../ui'
import { SignIn } from './Landing'

const S = screens
const L = (t: T) => t.en
const dateOf = (day: string) => formatDate(Date.parse(`${day}T12:00:00+05:30`), 'en')
const monthOf = (day: string) =>
  new Date(Date.parse(`${day}T12:00:00+05:30`)).toLocaleDateString('en-GB', {
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })
const storyTitle = (id: string) => {
  const s = storyById(id)
  return s ? L(s.title) : id
}
const SEX_ENDS = () => ({
  left: L(RT.rangeLeft),
  middle: L(RT.rangeMiddle),
  right: L(RT.rangeRight),
})
/** Each reading's line ends: its comparison group first on the left, its focal group on the right. */
const endsOf = (id: ProfileReadingId) =>
  id === 'tone' || id === 'religion'
    ? { left: L(PF.ends[id].left), middle: L(RT.rangeMiddle), right: L(PF.ends[id].right) }
    : SEX_ENDS()
/** The cue a reading's tag names: the areas read women and men on their own cards. */
const cueOf = (id: ProfileReadingId): Cue => (id === 'tone' || id === 'religion' ? id : 'sex')
const lineSaid = (id: ProfileReadingId, at: number, lo: number, hi: number) =>
  fill(L(PF.lineSaid), {
    label: L(PF.labels[id]),
    right: endsOf(id).right.toLowerCase(),
    at: pc(at),
    lo: pc(lo),
    hi: pc(hi),
  })

const back = (go: (h: string) => void, to: string, said: T) => (
  <Button kind="nav" onClick={() => go(to)} label={L(said)}>
    {L(LD.back)}
  </Button>
)

export function Profile({
  go,
  view = '',
  arg,
}: {
  go: (h: string) => void
  view?: string
  arg?: string
}) {
  const [p, setP] = useState<Unlocked | null>(currentProfile)
  const [waiting, setWaiting] = useState(() => !currentProfile() && signedIn())
  useEffect(() => {
    if (!waiting) return
    let live = true
    void restoreProfile().then((u) => {
      if (!live) return
      setP(u)
      setWaiting(false)
    })
    return () => {
      live = false
    }
  }, [waiting])
  if (waiting)
    return (
      <Page surface="oof" stepKey="profile-wait" screen="profile-wait">
        <Text>…</Text>
      </Page>
    )
  const open = p ?? currentProfile()
  if (!open)
    return (
      <SignIn
        go={(h) => {
          setP(currentProfile())
          go(h)
        }}
        after={`#/profile${view ? `/${view}` : ''}${arg ? `/${arg}` : ''}`}
      />
    )
  if (view === 'history') return <History go={go} p={open} />
  if (view === 'season') return <Report go={go} p={open} n={Number(arg)} />
  if (view === 'account') return <Account go={go} p={open} />
  return <Overview go={go} p={open} />
}

/** One reading's row in "Your readings": its tag once confirmed, else how it is forming. */
function readingRow(r: PooledReading) {
  const level = r.tagged
    ? levelName(r.level, cueOf(r.id), r.towards, 'en')
    : r.opens === null
      ? L(PF.notAvailable)
      : fill(L(PF.forming), { left: toTagLine(r.toTag, 'en') })
  return {
    id: r.id,
    label: L(PF.labels[r.id]),
    level,
    zone: r.tagged
      ? r.level === 'strong' || r.level === 'moderate'
        ? ('lean' as const)
        : ('none' as const)
      : ('unread' as const),
  }
}

function Overview({ go, p }: { go: (h: string) => void; p: Unlocked }) {
  const sessions = p.data.sessions
  const now = profileNow(sessions)
  const sex = now.readings.find((r) => r.id === 'sex')
  const { played, left } = storiesPlayed(sessions)
  const next = nextRetake(sessions)
  const latest = sessions[sessions.length - 1] as ProfileSession | undefined
  const latestPos = latest?.counts ? positionOf(latest.counts) : null
  const first = now.pooled.length ? sessions[now.pooled[0]] : null
  const tag = sex?.tagged ? levelName(sex.level, 'sex', sex.towards, 'en') : L(RT.forming.title)
  return (
    <Page
      surface="oof"
      stepKey="profile"
      screen="profile"
      lang="en-GB"
      nav={back(go, '#/', LD.backSaid)}
      oof={L(S.common.outOfFiction)}
      title={fill(L(PF.named), { name: p.data.name })}
      actions={
        <>
          <Button onClick={() => go('#/profile/history')}>{L(PF.seePast)}</Button>
          <Button kind="quiet" onClick={() => go('#/profile/account')}>
            {L(PF.account)}
          </Button>
        </>
      }
    >
      <Text kind="lead">
        {fill(L(sessions.length === 1 ? PF.countsOne : PF.counts), {
          s: sessions.length,
          p: played,
          total: config.season.profile.storiesTotal,
          left,
        })}
      </Text>
      {next !== null ? <Text>{fill(L(PF.retakeOn), { date: formatDate(next, 'en') })}</Text> : null}
      {p.data.demo ? <Notice>{L(PF.demoNote)}</Notice> : null}
      <Heading>{L(PF.nowTitle)}</Heading>
      {!sessions.length ? (
        <Text>{L(PF.nowEmpty)}</Text>
      ) : now.latestChanged ? (
        <>
          <Text kind="strong">{L(PF.changed)}</Text>
          <Text>{L(PF.changedBody)}</Text>
          <Text kind="muted">{L(PF.nowRestart)}</Text>
        </>
      ) : (
        <>
          <Text kind="muted">
            {fill(L(now.pooled.length === 1 ? PF.nowPooledOne : PF.nowPooled), {
              date: first ? dateOf(first.day) : '',
            })}
          </Text>
          <Text kind="strong">{tag}</Text>
          {sex && sex.at !== null && sex.lo !== null && sex.hi !== null ? (
            <RangeLine
              at={sex.at}
              lo={sex.lo}
              hi={sex.hi}
              ends={SEX_ENDS()}
              point={sex.tagged ? 'solid' : config.season.rating.untagged.point}
              label={`${tag}. ${lineSaid('sex', sex.at, sex.lo, sex.hi)}`}
              note={sex.tagged ? undefined : rangeInWords(sex.lo, sex.hi, 'en')}
            />
          ) : null}
          {sex && !sex.tagged ? (
            <>
              <Text>{L(RT.forming.next)}</Text>
              <Text kind="muted">{toTagLine(sex.toTag, 'en')}</Text>
            </>
          ) : null}
          <Text kind="strong">{L(PF.noChange)}</Text>
          <Text kind="muted">{L(PF.timelineNote)}</Text>
        </>
      )}
      {sessions.length ? (
        <>
          <Heading>{L(PF.readingsTitle)}</Heading>
          <ReadingList label={L(PF.readingsTitle)} items={now.readings.map(readingRow)} />
          <Text kind="small">{L(PF.readingsNote)}</Text>
        </>
      ) : null}
      {latest && latestPos ? (
        <>
          <Heading>{L(PF.thisSeason)}</Heading>
          <Text kind="muted">
            {fill(L(PF.thisSeasonOf), {
              story: storyTitle(latest.story),
              date: dateOf(latest.day),
            })}
          </Text>
          <RangeLine
            at={latestPos.at}
            lo={latestPos.lo}
            hi={latestPos.hi}
            ends={SEX_ENDS()}
            point={config.season.rating.untagged.point}
            label={`${L(PF.thisSeason)}. ${lineSaid('sex', latestPos.at, latestPos.lo, latestPos.hi)}`}
            note={rangeInWords(latestPos.lo, latestPos.hi, 'en')}
          />
        </>
      ) : null}
      <DevNotes
        title={L(SS.devTitle)}
        notes={[
          L(PF._devChangePending),
          fill(PF._devPooling as unknown as string, {
            pooling: config.season.profile.pooling,
            z: config.season.profile.reliableChange,
            counts: config.season.profile.readings
              .map((r) => `${r.id} ${r.opens ?? 'none'}`)
              .join(', '),
          }),
        ]}
      />
    </Page>
  )
}

function History({ go, p }: { go: (h: string) => void; p: Unlocked }) {
  const sessions = p.data.sessions
  const now = profileNow(sessions)
  const changed = new Set(now.changes)
  const points = now.trend.map((t) =>
    fill(L(t.change ? PF.trendChange : PF.trendPoint), {
      date: dateOf(sessions[t.season].day),
      at: pc(t.at),
      lo: pc(t.lo),
      hi: pc(t.hi),
    }),
  )
  return (
    <Page
      surface="oof"
      stepKey="profile-history"
      screen="profile-history"
      lang="en-GB"
      nav={back(go, '#/profile', PF.backProfile)}
      oof={L(S.common.outOfFiction)}
      title={L(PF.historyTitle)}
    >
      <Heading>{L(PF.trendTitle)}</Heading>
      {now.trend.length ? (
        <Trend
          label={fill(L(PF.trendSaid), {
            first: dateOf(sessions[0].day),
            last: dateOf(sessions[sessions.length - 1].day),
            points: points.join('; '),
          })}
          ends={{ top: L(RT.rangeRight), middle: L(RT.rangeMiddle), bottom: L(RT.rangeLeft) }}
          items={now.trend.map((t) => ({
            when: monthOf(sessions[t.season].day),
            at: t.at,
            lo: t.lo,
            hi: t.hi,
            change: t.change,
          }))}
        />
      ) : null}
      <Text kind="muted">{L(PF.trendNote)}</Text>
      <Heading>{L(PF.seasonsTitle)}</Heading>
      <Timeline
        label={L(PF.seasonsTitle)}
        ends={SEX_ENDS()}
        items={sessions.map((s, i) => {
          const pos = s.counts ? positionOf(s.counts) : null
          return {
            when: dateOf(s.day),
            what: storyTitle(s.story),
            band: L(PF.pastLabel),
            range: pos
              ? {
                  ...pos,
                  point: config.season.rating.untagged.point,
                  label: `${L(PF.pastLabel)}. ${lineSaid('sex', pos.at, pos.lo, pos.hi)}`,
                }
              : undefined,
            note: changed.has(i) ? L(PF.pastChanged) : undefined,
            open: {
              href: `#/profile/season/${i}`,
              text: L(PF.openReport),
              label: fill(L(PF.openReportSaid), {
                story: storyTitle(s.story),
                date: dateOf(s.day),
              }),
            },
          }
        })}
      />
      <Text kind="muted">{L(PF.timelineNote)}</Text>
    </Page>
  )
}

/** A past season's full report as it was saved, read only and untagged (EVAL-12). */
function Report({ go, p, n }: { go: (h: string) => void; p: Unlocked; n: number }) {
  const s = p.data.sessions[n] as ProfileSession | undefined
  const line = (id: ProfileReadingId) => {
    const c = s?.readings?.[id] ?? (id === 'sex' ? s?.counts : undefined)
    const pos = c ? positionOf(c) : null
    if (!pos) return <Text kind="muted">{`${L(PF.labels[id])}: ${L(PF.reportNone)}`}</Text>
    return (
      <RangeLine
        key={id}
        at={pos.at}
        lo={pos.lo}
        hi={pos.hi}
        ends={endsOf(id)}
        caption={L(PF.labels[id])}
        point={config.season.rating.untagged.point}
        label={lineSaid(id, pos.at, pos.lo, pos.hi)}
        note={id === 'tone' || id === 'religion' ? undefined : rangeInWords(pos.lo, pos.hi, 'en')}
      />
    )
  }
  return (
    <Page
      surface="oof"
      stepKey={`profile-season-${n}`}
      screen="profile-season"
      lang="en-GB"
      nav={back(go, '#/profile/history', PF.backHistory)}
      oof={L(S.common.outOfFiction)}
      title={s ? fill(L(PF.reportTitle), { story: storyTitle(s.story) }) : L(PF.historyTitle)}
    >
      {s ? (
        <>
          <Text kind="muted">{fill(L(PF.reportWhen), { date: dateOf(s.day) })}</Text>
          {line('sex')}
          {s.report?.why.length ? <List items={s.report.why} /> : null}
          <Heading>{L(PF.reportOthers)}</Heading>
          {line('religion')}
          {line('tone')}
          <Heading>{L(PF.reportAreas)}</Heading>
          {line('hiring')}
          {line('conduct')}
          {line('resources')}
          <Notice>{L(RT.committee)}</Notice>
        </>
      ) : (
        <Text>{L(PF.reportNone)}</Text>
      )}
    </Page>
  )
}

function Account({ go, p }: { go: (h: string) => void; p: Unlocked }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((x) => x + 1)
  const [name, setName] = useState(p.data.name)
  const [nameState, setNameState] = useState<'idle' | 'saved' | 'empty'>('idle')
  const c = p.data.contact
  const [email, setEmail] = useState(c?.em ?? '')
  const [follow, setFollow] = useState(c?.follow ?? false)
  const [research, setResearchBox] = useState(c?.research ?? false)
  const [emailState, setEmailState] = useState<'idle' | 'saved' | 'removed' | 'need' | 'failed'>(
    'idle',
  )
  const [confirm, setConfirm] = useState(false)
  const [deleted, setDeleted] = useState<{ withdrawn: number; closed: number } | null>(null)
  if (deleted)
    return (
      <Page
        surface="oof"
        stepKey="profile-deleted"
        screen="profile-deleted"
        lang="en-GB"
        nav={back(go, '#/', LD.backSaid)}
        oof={L(S.common.outOfFiction)}
        title={L(PF.title)}
      >
        <Notice kind="ok">
          {fill(L(PF.deleted), { w: deleted.withdrawn, c: deleted.closed })}
        </Notice>
      </Page>
    )
  const saveName = async () => {
    if (!name.trim()) return setNameState('empty')
    await rename(name)
    setNameState('saved')
  }
  const saveEmail = async () => {
    if ((follow || research) && !email.trim()) return setEmailState('need')
    try {
      await setContact(email, follow, research)
      setEmailState(email.trim() ? 'saved' : 'removed')
    } catch {
      setEmailState('failed')
    }
  }
  return (
    <Page
      surface="oof"
      stepKey="profile-account"
      screen="profile-account"
      lang="en-GB"
      nav={back(go, '#/profile', PF.backProfile)}
      oof={L(S.common.outOfFiction)}
      title={L(PF.account)}
    >
      <Group label={L(PF.codeTitle)}>
        <Heading>{L(PF.codeTitle)}</Heading>
        <Text>{L(PF.codeBody)}</Text>
        <Code
          value={formatCode(p.code)}
          label={L(PF.codeTitle)}
          copy={{ button: L(PF.copy), done: L(PF.copied) }}
        />
      </Group>
      <Group label={L(PF.nameTitle)}>
        <Heading>{L(PF.nameTitle)}</Heading>
        <Field
          label={L(PF.nameLabel)}
          value={name}
          maxLength={24}
          onChange={(v) => {
            setName(v)
            setNameState('idle')
          }}
          invalid={nameState === 'empty'}
          errorId="name-error"
          onEnter={() => void saveName()}
        />
        <Button kind="secondary" onClick={() => void saveName()}>
          {L(PF.nameSave)}
        </Button>
        {nameState === 'saved' ? <Notice kind="ok">{L(PF.nameSaved)}</Notice> : null}
        {nameState === 'empty' ? (
          <Notice kind="error" id="name-error">
            {L(PF.noName)}
          </Notice>
        ) : null}
      </Group>
      <Group label={L(PF.emailTitle)}>
        <Heading>{L(PF.emailTitle)}</Heading>
        <Text kind="small">{L(PF.emailBody)}</Text>
        <Field
          label={L(RT.contactEmail)}
          value={email}
          type="email"
          inputMode="email"
          onChange={(v) => {
            setEmail(v)
            setEmailState('idle')
          }}
          invalid={emailState === 'need'}
          errorId="email-error"
          onEnter={() => void saveEmail()}
        />
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
          onChange={(ids) => setResearchBox(ids.includes('yes'))}
        />
        <Button kind="secondary" onClick={() => void saveEmail()}>
          {L(PF.emailSave)}
        </Button>
        {emailState === 'saved' ? <Notice kind="ok">{L(PF.emailSaved)}</Notice> : null}
        {emailState === 'removed' ? <Notice kind="ok">{L(PF.emailRemoved)}</Notice> : null}
        {emailState === 'need' ? (
          <Notice kind="error" id="email-error">
            {L(PF.emailNeed)}
          </Notice>
        ) : null}
        {emailState === 'failed' ? <Notice kind="error">{L(RT.contactFailed)}</Notice> : null}
      </Group>
      <Group label={L(PF.researchTitle)}>
        <Heading>{L(PF.researchTitle)}</Heading>
        <List items={PF.researchConsent.map(L)} />
        <Checks
          legend={L(PF.researchAgree)}
          options={[{ id: 'yes', text: L(S.common.yes) }]}
          value={p.data.research ? ['yes'] : []}
          onChange={(ids) => void setResearch(ids.includes('yes')).then(refresh)}
        />
        <Text kind="small">{L(p.data.research ? PF.researchOn : PF.researchOff)}</Text>
        <DevNotes
          title={L(SS.devTitle)}
          notes={[PF._researchConsentPending as unknown as string]}
        />
      </Group>
      <Group label={L(PF.signOutTitle)}>
        <Heading>{L(PF.signOutTitle)}</Heading>
        <Text kind="small">{L(PF.signOutBody)}</Text>
        <Button
          kind="secondary"
          onClick={() => {
            lockProfile()
            go('#/')
          }}
        >
          {L(PF.lock)}
        </Button>
      </Group>
      <Group label={L(PF.deleteTitle)}>
        <Heading>{L(PF.deleteTitle)}</Heading>
        {/* The confirmation opens under the button, which keeps focus (EVAL-12). */}
        <Button kind="secondary" onClick={() => setConfirm(true)}>
          {L(PF.deleteButton)}
        </Button>
        {confirm ? (
          <>
            <Notice kind="error">{L(PF.deleteConfirm)}</Notice>
            <Button
              kind="secondary"
              onClick={() => void deleteProfile().then((r) => setDeleted(r))}
            >
              {L(PF.deleteYes)}
            </Button>
            <Button kind="quiet" onClick={() => setConfirm(false)}>
              {L(PF.deleteNo)}
            </Button>
          </>
        ) : null}
      </Group>
    </Page>
  )
}
