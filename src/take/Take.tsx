import { useCallback, useEffect, useMemo, useState } from 'react'
import { TAKE, type Lang, type Screen } from './data'
import { LangContext } from './lang'
import { cacheAhead, onUpdateReady } from '../pwa'
import { SetLangContext, UpdateContext } from './parts'
import { Cover, Cutscene } from './screens'
import { Sound, SoundContext } from './sound'
import { Results } from './Results'
import { Order } from './steps/Order'
import { Pick } from './steps/Pick'
import { Rank } from './steps/Rank'
import { Split } from './steps/Split'
import { Team } from './steps/Team'
import type { Answer } from './steps/common'
import { load, save } from './store'

// The First take, one screen at a time (the demo's flow): the opening, each chapter's way in, title card, eight
// decisions and way out, then the diary, the private reading and the trunk handed on. It resumes where it was left
// (FL-03); "?" holds the languages and sound on every screen.
export function Take() {
  const [saved, setSaved] = useState(load)
  const [help, setHelp] = useState(false)
  const [update, setUpdate] = useState<(() => void) | null>(null)
  useEffect(() => onUpdateReady((apply) => setUpdate(() => apply)), [])
  const sound = useMemo(() => new Sound(), [])
  const flow = TAKE.flow
  const at = Math.min(saved.at, flow.length - 1)
  const screen = flow[at]

  useEffect(() => save(saved), [saved])
  // on opening and at each chapter's title card, keep that chapter's cutscene panels for offline play
  const chapter = TAKE.flow.slice(0, at + 1).filter((s) => s.type === 'cover').length
  useEffect(() => cacheAhead(chapterPanels(chapter)), [chapter])
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
  // "Not you? Remove this reading": the answers go, and the take starts again (a shared phone, F-203)
  const forget = useCallback(() => {
    setHelp(false)
    setSaved((s) => ({ ...s, at: 0, answers: {} }))
  }, [])
  const soundCtx = useMemo(
    () => ({ sound, on: saved.sound, toggle: () => setSaved((s) => ({ ...s, sound: !s.sound })) }),
    [sound, saved.sound],
  )

  const props = { help, onHelp: setHelp }
  let body
  if (screen.type === 'cut') body = <Cutscene c={screen} onNext={next} {...props} />
  else if (screen.type === 'cover') body = <Cover c={screen} onNext={next} {...props} />
  else if (screen.type === 'step') {
    const Kind = KINDS[screen.kind]
    body = <Kind s={screen} onCommit={commit(screen.id)} {...props} />
  } else
    body = (
      <Results
        answers={saved.answers}
        onNext={next}
        onForget={forget}
        {...props}
      />
    )

  // a screen is drawn fresh each time it comes up, so a step never opens with the last step's picks
  return (
    <LangContext.Provider value={saved.lang}>
      <SetLangContext.Provider value={setLang}>
        <SoundContext.Provider value={soundCtx}>
          <UpdateContext.Provider value={update}>
            <main className="take" key={at}>
              {body}
            </main>
          </UpdateContext.Provider>
        </SoundContext.Provider>
      </SetLangContext.Provider>
    </LangContext.Provider>
  )
}

const KINDS = { pick: Pick, checks: Pick, rank: Rank, team: Team, order: Order, split: Split }

/** The cutscene panels of a chapter: from its title card (the opening, for 0) to the next one. */
const chapterPanels = (chapter: number) => {
  const covers = TAKE.flow.flatMap((s, i) => (s.type === 'cover' ? [i] : []))
  const from = chapter ? covers[chapter - 1] : 0
  return TAKE.flow.slice(from, covers[chapter]).flatMap((s) => (s.type === 'cut' ? s.panels.map((p) => p.pic) : []))
}

const worldOf = (s: Screen) =>
  s.type === 'step' || s.type === 'cover' ? s.world : s.type === 'cut' ? s.panels[0].world.replace(/^w-/, '') : 'rukavat'
