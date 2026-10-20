/** The screens around a session's steps: consent, language and the end. */
import { useState } from 'react'
import { screens } from '../content'
import type { Lang, T } from '../content/types'
import { SS } from '../story/content'
import { fill } from '../engine/text'
import { Button, Choice, Details, List, Notice, Page, Text } from '../ui'

const S = screens

export function Consent({
  ui,
  firm,
  season,
  help,
  minutes,
  onAgree,
  onDecline,
}: {
  ui: Lang
  /** "English with Hinglish help" (EVAL-10): the Hinglish under each point, smaller. */
  help?: boolean
  /** The season's one session length (EVAL-10), filled into "{minutes}". */
  minutes?: number
  firm?: boolean
  /** The season story's consent (content/story.json, a draft for the owner): it tells the player about the personal rating. */
  season?: boolean
  onAgree?: () => void
  onDecline?: () => void
}) {
  const L = (t: T) => fill(t[ui], { minutes: minutes ?? '' })
  const H = (t: T) => fill(t.hinglish, { minutes: minutes ?? '' })
  /* Short points to scan in about ten seconds; the full consent text, unchanged, one tap away
     under "Read the full details" (owner, 19 Oct 2026). */
  const c = firm
    ? S.consent.firm
    : season
      ? { ...S.consent.panel, title: SS.consentTitle, short: SS.consentShort, points: SS.consent }
      : S.consent.panel
  return (
    <Page
      surface="oof"
      stepKey={firm ? 'enrol-consent' : 'consent'}
      oof={L(S.common.outOfFiction)}
      title={L(c.title)}
      actions={
        <>
          <Button onClick={onAgree}>{L(c.agree)}</Button>
          <Button kind="quiet" onClick={onDecline}>
            {L(c.decline)}
          </Button>
        </>
      }
    >
      <List items={c.short.map(L)} help={help ? c.short.map(H) : undefined} />
      <Details summary={L(S.common.fullDetails)}>
        <List items={c.points.map(L)} help={help ? c.points.map(H) : undefined} />
      </Details>
    </Page>
  )
}

export function Declined({ ui, stepKey = 'declined' }: { ui: Lang; stepKey?: string }) {
  const L = (t: T) => t[ui]
  return (
    <Page surface="oof" stepKey={stepKey} oof={L(S.common.outOfFiction)}>
      <Text kind="lead">{L(S.consent.declined)}</Text>
    </Page>
  )
}

export function Finished({ ui, finished }: { ui: Lang; finished: 'submitted' | 'withdrawn' }) {
  const L = (t: T) => t[ui]
  return (
    <Page
      surface="oof"
      stepKey="finished"
      oof={L(S.common.outOfFiction)}
      title={L(S.wrap.submit.title)}
    >
      <Notice kind="ok">
        {finished === 'submitted' ? L(S.wrap.submit.submitted) : L(S.wrap.submit.withdrawn)}
      </Notice>
    </Page>
  )
}

export function LanguageStep({ ui, onChoose }: { ui: Lang; onChoose?: (l: Lang[]) => void }) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<string | null>(null)
  return (
    <Page
      surface="oof"
      stepKey="language"
      oof={L(S.common.outOfFiction)}
      actions={
        <Button
          onClick={() => v && onChoose?.(v === 'both' ? ['en', 'hinglish'] : [v as Lang])}
          disabled={!v}
        >
          {L(S.common.continue)}
        </Button>
      }
    >
      <Choice
        heading
        legend={L(S.language.title)}
        options={[
          { id: 'en', text: L(S.language.en) },
          { id: 'hinglish', text: L(S.language.hinglish) },
          { id: 'both', text: L(S.language.both) },
        ]}
        value={v}
        onChange={setV}
      />
    </Page>
  )
}
