/** The screens around a session's steps: the demo notice, consent, language and the end. */
import { useState } from 'react'
import { screens } from '../content'
import type { Lang, T } from '../content/types'
import { SS } from '../story/content'
import { Button, Choice, List, Notice, Page, Text } from '../ui'

const S = screens

export function DemoNotice({ ui, onContinue }: { ui: Lang; onContinue?: () => void }) {
  const L = (t: T) => t[ui]
  return (
    <Page
      surface="oof"
      stepKey="demo"
      title={L(S.demoNotice.title)}
      actions={<Button onClick={onContinue}>{L(S.common.continue)}</Button>}
    >
      <Text>{L(S.demoNotice.body)}</Text>
    </Page>
  )
}

export function Consent({
  ui,
  demo,
  firm,
  season,
  onAgree,
  onDecline,
}: {
  ui: Lang
  demo: boolean
  firm?: boolean
  /** The season story's consent (content/story.json, a draft for the owner): it tells the player about the personal rating. */
  season?: boolean
  onAgree?: () => void
  onDecline?: () => void
}) {
  const L = (t: T) => t[ui]
  const c = firm
    ? S.consent.firm
    : season
      ? { ...S.consent.panel, title: SS.consentTitle, points: SS.consent }
      : S.consent.panel
  return (
    <Page
      surface="oof"
      stepKey={firm ? 'enrol-consent' : 'consent'}
      oof={L(S.common.outOfFiction)}
      demo={demo ? L(S.common.demoBadge) : undefined}
      title={L(c.title)}
      actions={
        <>
          <Button onClick={onAgree}>{L(c.agree)}</Button>
          <Button kind="secondary" onClick={onDecline}>
            {L(c.decline)}
          </Button>
        </>
      }
    >
      <List items={c.points.map(L)} />
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

export function Finished({
  ui,
  demo,
  finished,
}: {
  ui: Lang
  demo: boolean
  finished: 'submitted' | 'withdrawn'
}) {
  const L = (t: T) => t[ui]
  return (
    <Page
      surface="oof"
      stepKey="finished"
      oof={L(S.common.outOfFiction)}
      demo={demo ? L(S.common.demoBadge) : undefined}
      title={L(S.wrap.submit.title)}
    >
      <Notice kind="ok">
        {finished === 'submitted' ? L(S.wrap.submit.submitted) : L(S.wrap.submit.withdrawn)}
      </Notice>
    </Page>
  )
}

export function LanguageStep({
  ui,
  demo,
  onChoose,
}: {
  ui: Lang
  demo: boolean
  onChoose?: (l: Lang[]) => void
}) {
  const L = (t: T) => t[ui]
  const [v, setV] = useState<string | null>(null)
  return (
    <Page
      surface="oof"
      stepKey="language"
      oof={L(S.common.outOfFiction)}
      demo={demo ? L(S.common.demoBadge) : undefined}
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
