import { useEffect, useId, useRef, useState } from 'react'
import { daysBetween, indiaToday } from '../engine/calendar'
import { TAKE, type Bi, type Lang } from './data'
import { T, useLabel, useLang } from './lang'
import { AppFrame, Main, useMoreCue } from './parts'
import { Svg } from './Svg'

// The first visit (SC-15, SC-16; feature-set F-14a, F-14b; library.py birth_phone and notyet_phone): the one screen
// before anything else asks for the birth date, which stays on this phone. Under 18, the phone keeps only the day the
// game opens and says how far off it is, worked out here each day; "Wrong date?" is offered once. Hindi: drafts.

const FIELDS: { label: Bi; ac: string; max: number }[] = [
  { label: ['Day', 'दिन'], ac: 'bday-day', max: 2 },
  { label: ['Month', 'महीना'], ac: 'bday-month', max: 2 },
  { label: ['Year', 'साल'], ac: 'bday-year', max: 4 },
]
const MONTHS: Bi[] = [
  ['January', 'जनवरी'], ['February', 'फ़रवरी'], ['March', 'मार्च'], ['April', 'अप्रैल'], ['May', 'मई'], ['June', 'जून'],
  ['July', 'जुलाई'], ['August', 'अगस्त'], ['September', 'सितंबर'], ['October', 'अक्टूबर'], ['November', 'नवंबर'], ['December', 'दिसंबर'],
]
const pad = (n: number) => String(n).padStart(2, '0')
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

export type Reading =
  | { state: 'incomplete' }
  | { state: 'error'; line: Bi }
  | { state: 'ok'; iso: string; words: Bi; opens: string | null }

/** What the three fields say: not finished, not a real date, or a date with the day the game opens (null: 18 or older). */
export function readDate(day: string, month: string, year: string, today: string): Reading {
  if (!day || !month || year.length < 4) return { state: 'incomplete' }
  const d = +day
  const m = +month
  const y = +year
  if (m < 1 || m > 12 || d < 1 || d > daysIn(y, m)) return { state: 'error', line: ['That date does not exist.', 'यह तारीख़ होती ही नहीं।'] }
  const iso = `${y}-${pad(m)}-${pad(d)}`
  if (iso > today) return { state: 'error', line: ['That date is still to come.', 'यह तारीख़ अभी आई नहीं।'] }
  if (y < +today.slice(0, 4) - 120) return { state: 'error', line: ['Check the year.', 'साल फिर से देखें।'] }
  // the 18th birthday; one born on 29 February turns 18 on 1 March in a year without one
  const y18 = y + 18
  const opens = m === 2 && d === 29 && daysIn(y18, 2) === 28 ? `${y18}-03-01` : `${y18}-${pad(m)}-${pad(d)}`
  return { state: 'ok', iso, words: [`${d} ${MONTHS[m - 1][0]} ${y}`, `${d} ${MONTHS[m - 1][1]} ${y}`], opens: opens > today ? opens : null }
}

export function BirthDate(props: { onAdult: (iso: string) => void; onMinor: (opens: string) => void; setLang: (l: Lang) => void; canKeep: boolean }) {
  const [vals, setVals] = useState(['', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const lang = useLang()
  const label = useLabel()
  const qid = useId()
  const read = readDate(vals[0], vals[1], vals[2], indiaToday())
  const cue = useMoreCue()
  const hintRef = useRef<HTMLParagraphElement>(null)
  // a date that cannot be kept says why in place; on a short screen the line is brought into view
  const wrong = read.state === 'error'
  useEffect(() => {
    if (wrong) hintRef.current?.scrollIntoView({ block: 'nearest' })
  }, [wrong])
  const set = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, FIELDS[i].max)
    setVals(vals.map((x, j) => (j === i ? digits : x)))
    // a full field hands on to the next
    if (digits.length === FIELDS[i].max && i < 2) inputs.current[i + 1]?.focus()
  }
  const hint: { line: Bi; icon: string } =
    read.state === 'error'
      ? { line: read.line, icon: 'alert' }
      : props.canKeep
        ? { line: ['Stays on this phone', 'यह इसी फ़ोन पर रहता है'], icon: 'lock' }
        : { line: ['This phone cannot keep it; you will be asked again.', 'यह फ़ोन इसे रख नहीं सकता; अगली बार फिर पूछा जाएगा।'], icon: 'alert' }
  return (
    <AppFrame world={TAKE.gate.world} kind="cover" cls="is-gate" label={label(['The birth date', 'जन्म की तारीख़'])} art={TAKE.gate.art} help={false} onHelp={() => {}}>
      <div className={`scr-body is-cover${cue.more ? ' has-more' : ''}`} ref={cue.ref}>
        <div className="gatecard at-end">
          <div className="langrow">
            <Svg name="language" />
            <div className="langchips" role="group" aria-label={label(['Language', 'भाषा'])}>
              {TAKE.langs.map(([k, n]) => (
                <button key={k} type="button" aria-pressed={k === lang} lang={k === 'hi' ? 'hi' : undefined} onClick={() => props.setLang(k)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <T as="h1" t={['When were you born?', 'आपका जन्म कब हुआ?']} className="q" id={qid} />
          <div className="datefields" role="group" aria-labelledby={qid}>
            {FIELDS.map((f, i) => (
              <div key={f.ac}>
                <label htmlFor={`${qid}-${i}`}>
                  <T t={f.label} />
                </label>
                <input
                  id={`${qid}-${i}`}
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={f.ac}
                  maxLength={f.max}
                  value={vals[i]}
                  aria-invalid={read.state === 'error' || undefined}
                  aria-describedby={`${qid}-hint`}
                  onChange={(e) => set(i, e.target.value)}
                />
              </div>
            ))}
          </div>
          <p className="datewords" aria-live="polite">
            {read.state === 'ok' ? <T t={read.words} /> : null}
          </p>
          <p className="gatehint" id={`${qid}-hint`} ref={hintRef} role={read.state === 'error' ? 'alert' : undefined}>
            <Svg name={hint.icon} />
            <T t={hint.line} />
          </p>
        </div>
      </div>
      {cue.node}
      <Main
        t={read.state === 'ok' ? ['Start', 'शुरू करें'] : ['Type your birth date', 'अपनी जन्म तारीख़ लिखें']}
        live={read.state === 'ok'}
        onGo={() => {
          if (read.state !== 'ok') return
          if (read.opens) props.onMinor(read.opens)
          else props.onAdult(read.iso)
        }}
      />
    </AppFrame>
  )
}

/** Not yet 18: the day count in one line, worked out on the phone each day, and "Wrong date?" once. Nothing to play,
 * nothing sent or kept on our side (D2). */
export function NotYet(props: { opens: string; retry: boolean; onRetry: () => void }) {
  const label = useLabel()
  const days = daysBetween(indiaToday(), props.opens)
  const n = days.toLocaleString('en-IN')   // 4,969; lakhs as 1,00,000
  const line: Bi = days > 1 ? [`You can play in ${n} days.`, `आप ${n} दिन बाद खेल सकते हैं।`] : ['You can play tomorrow.', 'आप कल से खेल सकते हैं।']
  return (
    <AppFrame world={TAKE.gate.world} kind="cover" cls="is-gate" label={label(['Not yet 18', 'अभी 18 नहीं'])} art={TAKE.gate.art} help={false} onHelp={() => {}}>
      <div className="scr-body is-cover">
        <div className="gatecard at-end">
          <T as="h1" t={line} className="q" />
          {props.retry ? (
            <button className="textbtn on-paper" type="button" onClick={props.onRetry}>
              <T t={['Wrong date?', 'तारीख़ ग़लत है?']} />
            </button>
          ) : null}
        </div>
      </div>
    </AppFrame>
  )
}

/** The game is open to this phone: an adult's birth date, or an under-18's opening day that has come. */
export const isOpen = (s: { birth?: string; opens?: string }, today = indiaToday()) => !!s.birth || (!!s.opens && s.opens <= today)
