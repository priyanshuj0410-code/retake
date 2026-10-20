/**
 * The first screen of every sitting, and of firm enrolment: exactly the four registered
 * sentences (content/disclosure.json, candidates v12 3.10), in the language the player chose
 * (both, the second smaller, for "English with Hinglish help"; every offered language on the
 * firm route, where the language comes later), and the Continue button. No heading, act label, demo badge or logo.
 * scripts/disclosure-check.ts renders it and compares the text byte for byte.
 */
import { screens, sentencesFor } from '../content'
import type { Lang } from '../content/types'
import { Button, Page, Text } from '../ui'

export function Disclosure({
  langs,
  onContinue,
  season = false,
}: {
  langs: Lang[]
  onContinue: () => void
  season?: boolean
}) {
  return (
    <Page
      surface="oof"
      stepKey="disclosure"
      screen="disclosure"
      actions={<Button onClick={onContinue}>{screens.common.continue[langs[0]]}</Button>}
    >
      {/* Only the language chosen (EVAL-10); with "English with Hinglish help", English first and
          the Hinglish under it, smaller. */}
      {langs.map((l, n) => (
        <div key={l} lang={l === 'hinglish' ? 'hi-Latn' : 'en-GB'} data-disclosure={l}>
          {sentencesFor(l, season).map((s) => (
            <Text key={s} kind={n > 0 ? 'small' : undefined}>
              {s}
            </Text>
          ))}
        </div>
      ))}
    </Page>
  )
}
