/** The screens around a session's steps: consent, language and the end. */
import { useState } from 'react'
import { screens, sentencesFor } from '../content'
import type { Lang, T } from '../content/types'
import { SS } from '../story/content'
import { fill } from '../engine/text'
import {
  Button,
  Choice,
  Details,
  IconList,
  List,
  Notice,
  Page,
  Text,
  type NoteIconKind,
} from '../ui'

const S = screens

export function Consent({
  ui,
  firm,
  onAgree,
  onDecline,
}: {
  ui: Lang
  firm?: boolean
  onAgree?: () => void
  onDecline?: () => void
}) {
  const L = (t: T) => t[ui]
  /* Short points to scan in about ten seconds; the full consent text, unchanged, one tap away
     under "Read the full details" (owner, 19 Oct 2026). The season's consent is merged with its
     disclosure in `SeasonStart` (EVAL-10). */
  const c = firm ? S.consent.firm : S.consent.panel
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
      <List items={c.short.map(L)} />
      <Details summary={L(S.common.fullDetails)}>
        <List items={c.points.map(L)} />
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

/**
 * The season's first screen (EVAL-10, owner; a registered change for v22): the disclosure and
 * the consent merged into one "Before you start" screen, so nothing is said twice. The four
 * registered sentences come first, verbatim and in their order (sentence 3 the season's interim
 * line), each in its own row with a drawn icon; then the practical points the sentences do not
 * already say; the complete consent text, Internal Committee help included, one tap away under
 * "Read the full details"; "I agree to take part" and the quiet decline. In the chosen language
 * only, with the Hinglish under each row in the help mode. One phone screen at 390 x 844 with the
 * details closed (`pnpm ux`).
 */
export function SeasonStart({
  ui,
  help,
  minutes,
  onAgree,
  onDecline,
}: {
  ui: Lang
  help?: boolean
  minutes?: number
  onAgree: () => void
  onDecline: () => void
}) {
  const F = (t: string) => fill(t, { minutes: minutes ?? '' })
  const L = (t: T) => F(t[ui])
  const H = (t: T) => (help ? F(t.hinglish) : undefined)
  const sentences = sentencesFor(ui, true)
  const hinglish = help ? sentencesFor('hinglish', true) : []
  const icons: NoteIconKind[] = ['lens', 'cast', 'result', 'descriptions']
  const points = SS.startPoints as unknown as { icon: NoteIconKind; text: T }[]
  return (
    <Page
      surface="oof"
      stepKey="season-start"
      screen="start"
      lang={ui === 'hinglish' ? 'hi-Latn' : 'en-GB'}
      title={L(SS.consentTitle)}
      actions={
        <>
          <Button onClick={onAgree}>{L(S.consent.panel.agree)}</Button>
          <Button kind="quiet" onClick={onDecline}>
            {L(S.consent.panel.decline)}
          </Button>
        </>
      }
    >
      <IconList
        label={L(SS.startSentences)}
        items={sentences.map((text, i) => ({ icon: icons[i], text, help: hinglish[i] }))}
      />
      <IconList
        label={L(SS.startPractical)}
        items={points.map((p) => ({ icon: p.icon, text: L(p.text), help: H(p.text) }))}
      />
      <Details summary={L(S.common.fullDetails)}>
        <List
          items={SS.consent.map(L)}
          help={help ? SS.consent.map((t) => F(t.hinglish)) : undefined}
        />
      </Details>
    </Page>
  )
}
