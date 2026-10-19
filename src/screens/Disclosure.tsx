/**
 * The first screen of every sitting, and of firm enrolment: exactly the four registered
 * sentences (content/disclosure.json, candidates v12 3.10), in each language the player may
 * play in, and the Continue button. No heading, act label, demo badge or logo.
 * scripts/disclosure-check.ts renders it and compares the text byte for byte.
 */
import { registeredSentences, screens } from '../content'
import type { Lang } from '../content/types'
import { Button, Page, Text } from '../ui'

export function Disclosure({ langs, onContinue }: { langs: Lang[]; onContinue: () => void }) {
  return (
    <Page
      surface="oof"
      stepKey="disclosure"
      screen="disclosure"
      actions={<Button onClick={onContinue}>{screens.common.continue[langs[0]]}</Button>}
    >
      {langs.map((l) => (
        <div key={l} lang={l === 'hinglish' ? 'hi-Latn' : 'en-GB'} data-disclosure={l}>
          {registeredSentences[l].map((s) => (
            <Text key={s}>{s}</Text>
          ))}
        </div>
      ))}
    </Page>
  )
}
