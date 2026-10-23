import { useCallback, useEffect, useMemo, useState } from 'react'
import { TAKE, type Lang, type Screen } from './data'
import { LangContext } from './lang'
import { SetLangContext } from './parts'
import { Cover, Cutscene } from './screens'
import { Sound, SoundContext } from './sound'
import { Pick } from './steps/Pick'
import { Soon } from './steps/Soon'
import type { Answer } from './steps/common'
import { load, save } from './store'

// The First take, one screen at a time (the demo's flow): the opening, each chapter's way in, title card, eight
// decisions and way out, then the diary, the private reading and the trunk handed on. It resumes where it was left
// (FL-03); "?" holds the languages and sound on every screen.
export function Take() {
  const [saved, setSaved] = useState(load)
  const [help, setHelp] = useState(false)
  const sound = useMemo(() => new Sound(), [])
  const flow = TAKE.flow
  const at = Math.min(saved.at, flow.length - 1)
  const screen = flow[at]

  useEffect(() => save(saved), [saved])
  useEffect(() => {
    sound.set(saved.sound)
  }, [sound, saved.sound])
  useEffect(() => {
    const world = worldOf(screen)
    sound.screen(world, screen.type === 'cover', screen.type === 'cut' || screen.type === 'results')
    document.documentElement.lang = saved.lang === 'hi' ? 'hi' : 'en-GB'
  }, [sound, screen, saved.lang])
  useEffect(() => {
    const wake = () => sound.wake()
    addEventListener('pointerdown', wake, { once: true })
    return () => removeEventListener('pointerdown', wake)
  }, [sound])
  useFit()

  const next = useCallback(() => {
    setHelp(false)
    setSaved((s) => ({ ...s, at: s.at + 1 >= flow.length ? 0 : s.at + 1 }))
    scrollTo(0, 0)
  }, [flow.length])
  const commit = (id: string) => (a: Answer) => {
    setSaved((s) => ({ ...s, answers: { ...s.answers, [id]: a } }))
    next()
  }
  const setLang = useCallback((lang: Lang) => setSaved((s) => ({ ...s, lang })), [])
  const soundCtx = useMemo(
    () => ({ sound, on: saved.sound, toggle: () => setSaved((s) => ({ ...s, sound: !s.sound })) }),
    [sound, saved.sound],
  )

  const props = { help, onHelp: setHelp }
  let body
  if (screen.type === 'cut') body = <Cutscene c={screen} onNext={next} {...props} />
  else if (screen.type === 'cover') body = <Cover c={screen} onNext={next} {...props} />
  else if (screen.type === 'step')
    body =
      screen.kind === 'pick' || screen.kind === 'checks' ? (
        <Pick s={screen} onCommit={commit(screen.id)} {...props} />
      ) : (
        <Soon s={screen} onCommit={commit(screen.id)} {...props} />
      )
  else body = null

  // a screen is drawn fresh each time it comes up, so a step never opens with the last step's picks
  return (
    <LangContext.Provider value={saved.lang}>
      <SetLangContext.Provider value={setLang}>
        <SoundContext.Provider value={soundCtx}>
          <main className="demo take" key={at}>
            {body ?? <SkipResults onNext={next} />}
          </main>
        </SoundContext.Provider>
      </SetLangContext.Provider>
    </LangContext.Provider>
  )
}

function SkipResults({ onNext }: { onNext: () => void }) {
  useEffect(onNext, [onNext])
  return null
}

const worldOf = (s: Screen) =>
  s.type === 'step' || s.type === 'cover' ? s.world : s.type === 'cut' ? s.panels[0].world.replace(/^w-/, '') : 'rukavat'

/** The app fills the viewport's height at every size (the demo's fit): on a phone the screen takes the visible height,
 * read as the browser's bars come and go; on a wider screen the phone frame scales to fill the height. */
function useFit() {
  useEffect(() => {
    const fit = () => {
      const vh = window.visualViewport?.height ?? innerHeight
      document.documentElement.style.setProperty('--app-h', `${vh}px`)
      const zoom = innerWidth <= 500 ? '' : String(Math.min((vh - 32) / 844, (innerWidth - 32) / 390))
      document.documentElement.style.setProperty('--take-zoom', zoom || '1')
    }
    fit()
    addEventListener('resize', fit)
    window.visualViewport?.addEventListener('resize', fit)
    return () => {
      removeEventListener('resize', fit)
      window.visualViewport?.removeEventListener('resize', fit)
    }
  }, [])
}
