import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MAX_LINE, send, withdraw } from './rating'
import { T, useLabel } from './lang'
import { Main, closeWatched, useCloseRequest } from './parts'
import { dayOf } from '../engine/calendar'
import { useSound } from './sound'
import { Svg } from './Svg'

// The rating, once, after the take (owner, 5 Nov 2026, EVAL-24; library.py rate_sheet): five stars and one optional line,
// in a sheet over the resting reading. Send is the only thing that ever leaves the phone; closing it sends nothing.
export function RateSheet({ world, onSent, onClose }: { world: string; onSent: () => void; onClose: () => void }) {
  const label = useLabel()
  const { sound } = useSound()
  const [stars, setStars] = useState(0)
  const [line, setLine] = useState('')
  const [state, setState] = useState<'open' | 'sending' | 'failed' | 'sent'>('open')
  const close = useRef<HTMLButtonElement>(null)
  const line_ = useRef<HTMLInputElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  // leaving before "Thank you" sends nothing: a try that may have landed unheard is taken back
  const leave = () => {
    if (state !== 'sent') void withdraw()
    onClose()
  }
  useCloseRequest(true, leave)
  useEffect(() => {
    if (closeWatched) return
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave()
    }
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  })
  useEffect(() => {
    if (state === 'open' || state === 'sent') close.current?.focus()
  }, [state])
  // a modal sheet: the reading beneath takes no focus and no taps
  useLayoutEffect(() => {
    const el = sheet.current
    const play = el?.parentElement
    if (!el || !play) return
    const behind = [...play.children].filter((c): c is HTMLElement => c instanceof HTMLElement && !c.matches('.scrim, .sheet, .dialog'))
    for (const c of behind) c.inert = true
    return () => {
      for (const c of behind) c.inert = false
    }
  }, [])
  // the phone's keyboard covers the page without moving it, so the sheet rises by what it covers
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const place = () => sheet.current?.style.setProperty('--kb', `${Math.max(0, innerHeight - vv.height - vv.offsetTop)}px`)
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    return () => {
      vv.removeEventListener('resize', place)
      vv.removeEventListener('scroll', place)
    }
  }, [])
  const go = async () => {
    sound.fx(world, 'commit')
    setState('sending')
    if (await send(stars, line, dayOf())) {
      onSent()
      setState('sent')
    } else setState('failed')
  }
  return (
    <>
      {/* a tap outside only puts the keyboard away: it never loses the stars and the line */}
      <div className="scrim" aria-hidden="true" onClick={() => (document.activeElement as HTMLElement | null)?.blur()} />
      <div className="sheet ratesheet" role="dialog" aria-modal="true" aria-labelledby="ratehead" ref={sheet}>
        <div className="grab">
          <span className="spacer" />
          <button className="handle" type="button" aria-label={label(['Drag to close', 'बंद करने के लिए खींचें'])} onClick={leave}>
            <i />
          </button>
          <button ref={close} className="close" type="button" aria-label={label(['Close', 'बंद करें'])} onClick={leave}>
            <Svg name="close" />
          </button>
        </div>
        {state === 'sent' ? (
          <T as="h2" t={['Thank you.', 'शुक्रिया।']} id="ratehead" />
        ) : (
          <>
            <T as="h2" t={['How was it?', 'कैसा लगा?']} id="ratehead" />
            <div className="ratestars" role="radiogroup" aria-labelledby="ratehead">
              {[1, 2, 3, 4, 5].map((n) => (
                <label className={`ratestar${n <= stars ? ' is-on' : ''}`} key={n}>
                  <input
                    type="radio"
                    name="ratestars"
                    checked={n === stars}
                    aria-label={label([`${n} star${n > 1 ? 's' : ''}`, `${n} स्टार`])}
                    onChange={() => {
                      sound.fx(world, 'tap')
                      setStars(n)
                    }}
                  />
                  <Svg name={n <= stars ? 'star-fill' : 'star'} />
                </label>
              ))}
            </div>
            {/* the keyboard's own key puts it away, so Send is in sight; nothing is submitted */}
            <form
              className="field"
              onSubmit={(e) => {
                e.preventDefault()
                line_.current?.blur()
              }}
            >
              <label htmlFor="rateline">
                <T t={['One line, if you like', 'एक लाइन, अगर चाहें']} />
              </label>
              <input
                ref={line_}
                id="rateline"
                type="text"
                maxLength={MAX_LINE}
                autoComplete="off"
                enterKeyHint="done"
                aria-describedby="ratehint"
                value={line}
                onChange={(e) => setLine(e.target.value)}
              />
              <small id="ratehint">
                <T t={['Only this is sent. No names, please.', 'सिर्फ़ यही भेजा जाता है। नाम न लिखें।']} />
              </small>
            </form>
            {state === 'failed' ? (
              <p className="gatehint ratefail" role="alert">
                <Svg name="alert" />
                <T t={['Not sent. Try again.', 'नहीं गया। फिर कोशिश करें।']} />
              </p>
            ) : null}
            <Main
              t={state === 'sending' ? ['Sending', 'भेज रहे हैं'] : stars ? ['Send', 'भेजें'] : ['Tap a star', 'एक स्टार चुनें']}
              live={!!stars && state !== 'sending'}
              onGo={() => void go()}
            />
          </>
        )}
      </div>
    </>
  )
}
