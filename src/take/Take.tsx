import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TAKE, type Lang, type Screen } from './data'
import { LangContext } from './lang'
import { cacheAhead, onUpdateReady } from '../pwa'
import { PrivacyContext, SetLangContext, UpdateContext } from './parts'
import { Cover, Cutscene } from './screens'
import { Sound, SoundContext } from './sound'
import { BirthDate, NotYet, isOpen } from './Gate'
import { Results } from './Results'
import { Order } from './steps/Order'
import { Pick } from './steps/Pick'
import { Rank } from './steps/Rank'
import { Split } from './steps/Split'
import { Team } from './steps/Team'
import type { Answer } from './steps/common'
import { canKeep, forget as wipe, fresh, load, save } from './store'

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
  // a screen before `at` shown again by Back, read-only (R-STEP-9); null is where the player is
  const [view, setView] = useState<number | null>(null)
  const shown = view ?? at
  const screen = flow[shown]

  // after Delete all nothing is kept again until the sheet closes and the take starts from a first visit
  const wiped = useRef(false)
  useEffect(() => {
    if (!wiped.current) save(saved)
  }, [saved])
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
    setView(null)
    setSaved((s) => ({ ...s, at: s.at + 1 >= flow.length ? 0 : s.at + 1 }))
    scrollTo(0, 0)
  }, [flow.length])
  // Back from a step: the step before it, read-only; from a chapter's first step, the chapter's title card
  const backFrom = (i: number) => {
    if (flow[i]?.type !== 'step') return null
    if (flow[i - 1]?.type === 'step') return i - 1
    for (let j = i - 1; j >= 0; j--) if (flow[j].type === 'cover') return j
    return null
  }
  const back = () => {
    const j = backFrom(shown)
    if (j === null) return false
    setHelp(false)
    setView(j)
    return true
  }
  const toCurrent = () => {
    setHelp(false)
    setView(null)
  }
  // the phone's own back does what Back does, while there is a step to go back from
  const backRef = useRef(back)
  useEffect(() => {
    backRef.current = back
  })
  useEffect(() => {
    history.pushState({ retake: 1 }, '')
    const on = () => {
      if (backRef.current()) history.pushState({ retake: 1 }, '')
    }
    addEventListener('popstate', on)
    return () => removeEventListener('popstate', on)
  }, [])
  const commit = (id: string) => (a: Answer) => {
    setSaved((s) => ({ ...s, answers: { ...s.answers, [id]: a } }))
    next()
  }
  const setLang = useCallback((lang: Lang) => setSaved((s) => ({ ...s, lang })), [])
  const privacy = useMemo(
    () => ({
      deleteAll: () => {
        wiped.current = true
        wipe()
      },
      restart: () => {
        wiped.current = false
        setHelp(false)
        setSaved(fresh())
      },
    }),
    [],
  )
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
  const [keeps] = useState(canKeep)
  let body
  // the first visit: the birth date before anything else; under 18, when the game opens (SC-15, SC-16)
  const gate = !isOpen(saved) ? (saved.opens ? 'notyet' : 'birth') : null
  if (gate === 'birth')
    body = (
      <BirthDate
        canKeep={keeps}
        setLang={setLang}
        onAdult={(birth) =>
          setSaved((s) => ({ ...s, birth, opens: undefined, retried: undefined }))
        }
        // under 18 the birth date is not kept: only the day the game opens (D1)
        onMinor={(opens) => setSaved((s) => ({ ...s, opens }))}
      />
    )
  else if (gate === 'notyet')
    body = (
      <NotYet
        opens={saved.opens!}
        retry={!saved.retried}
        onRetry={() => setSaved((s) => ({ ...s, opens: undefined, retried: true }))}
      />
    )
  else if (screen.type === 'cut') body = <Cutscene c={screen} onNext={next} {...props} />
  else if (screen.type === 'cover')
    body = <Cover c={screen} onNext={view === null ? next : toCurrent} revisit={view !== null} {...props} />
  else if (screen.type === 'step') {
    const Kind = KINDS[screen.kind]
    body = (
      <Kind
        s={screen}
        onCommit={commit(screen.id)}
        onBack={() => void back()}
        revisit={view === null ? undefined : { answer: saved.answers[screen.id], onReturn: toCurrent }}
        {...props}
      />
    )
  } else body = <Results answers={saved.answers} onNext={next} onForget={forget} {...props} />

  // a screen is drawn fresh each time it comes up, so a step never opens with the last step's picks
  return (
    <LangContext.Provider value={saved.lang}>
      <SetLangContext.Provider value={setLang}>
        <SoundContext.Provider value={soundCtx}>
          <PrivacyContext.Provider value={privacy}>
            <UpdateContext.Provider value={update}>
              <main className="take" key={gate ?? shown}>
                {body}
              </main>
            </UpdateContext.Provider>
          </PrivacyContext.Provider>
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
  return TAKE.flow
    .slice(from, covers[chapter])
    .flatMap((s) => (s.type === 'cut' ? s.panels.map((p) => p.pic) : []))
}

const worldOf = (s: Screen) =>
  s.type === 'step' || s.type === 'cover'
    ? s.world
    : s.type === 'cut'
      ? s.panels[0].world.replace(/^w-/, '')
      : 'rukavat'
