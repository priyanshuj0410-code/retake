/**
 * Acceptance test 3: the four-sentence disclosure, verbatim. The first screen of every sitting
 * (and of firm enrolment) shows exactly the four registered sentences and nothing else, in
 * every language build; bilinguals see both languages once. The registered English strings are
 * written out here a second time, from candidates v12 3.10, so an edit to the content file
 * cannot pass by changing both sides.
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { registeredSentences, screens } from '../src/content'
import { Disclosure } from '../src/screens/Disclosure'
import { SS } from '../src/story/content'
import { record } from './lib/check'

const T = 'AT-3 the four-sentence disclosure verbatim'
const REGISTERED_EN = [
  'The test measures attitudes towards religion, race, caste, sex, or place of birth.',
  'You will make decisions about fictional colleagues.',
  'Attitudes are read, for groups only.',
  'Decisions that do not follow the descriptions at all are read as not engaged.',
]

const textOf = (html: string) =>
  [...html.matchAll(/>([^<]+)</g)]
    .map((m) =>
      m[1].replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"').trim(),
    )
    .filter(Boolean)

export async function run() {
  record(
    T,
    'content/disclosure.json English strings are byte-identical to the registered text',
    JSON.stringify(registeredSentences.en) === JSON.stringify(REGISTERED_EN),
  )
  record(
    T,
    'every language holds exactly four sentences',
    Object.values(registeredSentences).every((l) => l.length === 4),
  )
  for (const langs of [['en'], ['hinglish'], ['en', 'hinglish']] as const) {
    const html = renderToStaticMarkup(
      createElement(Disclosure, { langs: [...langs], onContinue: () => {} }),
    )
    const got = textOf(html)
    const want = [
      ...langs.flatMap((l) => registeredSentences[l]),
      screens.common.continue[langs[0]],
    ]
    record(
      T,
      `rendered first screen, ${langs.join(' + ')}: the four sentences per language and the Continue button, nothing else`,
      JSON.stringify(got) === JSON.stringify(want),
      JSON.stringify(got) === JSON.stringify(want) ? '' : JSON.stringify(got),
    )
    record(
      T,
      `rendered first screen, ${langs.join(' + ')}: no heading, act label, demo badge, prototype line or out-of-fiction line`,
      !/<h1|"page__act"|class="demo"|page__footnote|page__oof/.test(html),
    )
  }
  /* The disclosure is the first screen of every sitting: the Play component starts on it
     (the season's eligibility items aside), and firm enrolment starts on it too. */
  const play = readFileSync(new URL('../src/screens/Play.tsx', import.meta.url), 'utf8')
  record(
    T,
    'Play opens on the disclosure (a reload resumes the saved screen), with no demo notice before it',
    /useState<Pre>\(saved\?\.pre \?\? 'disclosure'\)/.test(play) &&
      !/type Pre = [^\n]*'demo'/.test(play) &&
      !/DemoNotice/.test(play),
  )
  const pages = readFileSync(new URL('../src/screens/Pages.tsx', import.meta.url), 'utf8')
  record(
    T,
    'firm enrolment opens on the disclosure',
    /useState<EnrolStep>\(preview\?\.step \?\? 'four'\)/.test(pages) &&
      /step === 'four'[\s\S]{0,80}<Disclosure/.test(pages),
  )
  /* No other sentence about measurement anywhere before the explanation: the consent and
     every pre-release screen avoid the words the rule forbids. */
  const pre = JSON.stringify({
    c: screens.consent,
    t: screens.tutorial,
    d: screens.wrap.debrief,
    s: screens.wrap.submit,
    n: screens.inbox.note,
  })
  record(
    T,
    'consent, tutorial and short debrief never say "fair", "bias", "preference", "score" of the player or how attitudes are scored',
    !/\b(fair|fairly|bias|biased|preference|merit|weight)\b/i.test(pre),
  )
  /* The season story (EVAL-4): the same screen, with sentence 3 replaced by the interim line
     (awaiting the owner's wording), because the season shows each player a rating; 1, 2 and 4
     stay verbatim. */
  for (const langs of [['en'], ['hinglish']] as const) {
    const got = textOf(
      renderToStaticMarkup(
        createElement(Disclosure, { langs: [...langs], onContinue: () => {}, season: true }),
      ),
    )
    const l = langs[0]
    const want = [
      registeredSentences[l][0],
      registeredSentences[l][1],
      l === 'en'
        ? 'Attitudes are read; you see yours.'
        : 'Attitudes padhe jaate hain; aapko apne dikhte hain.',
      registeredSentences[l][3],
      screens.common.continue[l],
    ]
    record(
      T,
      `season story first screen, ${l}: registered sentences 1, 2 and 4 verbatim, sentence 3 the interim line (never a placeholder), Continue, nothing else`,
      JSON.stringify(got) === JSON.stringify(want),
      JSON.stringify(got) === JSON.stringify(want) ? '' : JSON.stringify(got),
    )
  }
  const seasonPre = JSON.stringify({ c: SS.consent, d: SS.debrief })
  record(
    T,
    'the season consent and debrief never say "fair", "bias", "preference", "merit" or "weight"',
    !/\b(fair|fairly|bias|biased|preference|merit|weight)\b/i.test(seasonPre),
  )
  record(
    T,
    'the Hinglish disclosure is marked not yet pre-tested',
    JSON.parse(readFileSync(new URL('../content/disclosure.json', import.meta.url), 'utf8'))
      .pretested.hinglish === false,
  )
}
