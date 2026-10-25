import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TAKE, type Lang, type Screen } from './data'
import { LangContext } from './lang'
import { cacheAhead, onUpdateReady } from '../pwa'
import { PrivacyContext, SetLangContext, SheetBackContext, UpdateContext, closeWatched, focusScreen } from './parts'
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
import { KEY, SIG, adopt, canKeep, forget as wipe, freshElsewhere, load, save } from './store'

// past the last screen the finished take rests on its reading (SC-93 opened again), never back at the opening
const END = Math.max(0, TAKE.flow.findIndex((s) => s.type === 'results'))

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
  // looking back: a view another window's progress has overtaken no longer counts
  const looking = view !== null && view < at
  const shown = looking ? view : at
  const screen = flow[shown]
  // the first visit: the birth date before anything else; under 18, when the game opens (SC-15, SC-16)
  const gate = !isOpen(saved) ? (saved.opens ? 'notyet' : 'birth') : null

  // after Delete all nothing is kept again until the take starts from a first visit
  const wiped = useRef(false)
  useEffect(() => {
    if (!wiped.current) save(saved)
  }, [saved])
  // another window of the take on this phone (a second tab, the installed app beside the browser): its changes are
  // taken here, and its Delete all empties this window too, so nothing deleted is ever written back. A window still on
  // "Deleted." writes nothing and takes nothing; leaving it, it takes whatever the other window has started since.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.storageArea !== localStorage || (e.key !== null && e.key !== KEY) || wiped.current) return
      let now: string | null = null
      try {
        now = localStorage.getItem(KEY)
      } catch {
        // a blocked store: nothing to take
      }
      if (now === null) {
        setHelp(false)
        setView(null)
        setSaved(freshElsewhere())
      } else {
        const s = adopt()
        setView((v) => (v !== null && v < s.at ? v : null))
        setSaved(s)
      }
    }
    addEventListener('storage', on)
    return () => removeEventListener('storage', on)
  }, [])
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
    // the first tap or key press wakes the sound: a keyboard player never sends a pointerdown
    const wake = () => {
      sound.wake()
      removeEventListener('pointerdown', wake)
      removeEventListener('keydown', wake)
    }
    addEventListener('pointerdown', wake)
    addEventListener('keydown', wake)
    return () => {
      removeEventListener('pointerdown', wake)
      removeEventListener('keydown', wake)
    }
  }, [sound])

  // after Delete all the take starts again from a first visit, by whatever way the player leaves "Deleted.", or from
  // the new start another window has made meanwhile
  const restart = useCallback(() => {
    wiped.current = false
    setHelp(false)
    setView(null)
    setSaved(adopt())
  }, [])
  const next = useCallback(() => {
    if (wiped.current) return restart()
    setHelp(false)
    setView(null)
    setSaved((s) => ({ ...s, at: s.at + 1 >= flow.length ? END : s.at + 1 }))
    scrollTo(0, 0)
  }, [flow.length, restart])
  // Back from a step: the step before it, read-only; from a chapter's first step, the chapter's title card; from a title
  // card, the chapter's way in (SC-91 leaves the starter for the cover or the Week tab, which come with the daily, M3)
  const backFrom = (i: number) => {
    if (flow[i]?.type === 'cover') return flow[i - 1]?.type === 'cut' ? i - 1 : null
    if (flow[i]?.type !== 'step') return null
    if (flow[i - 1]?.type === 'step') return i - 1
    for (let j = i - 1; j >= 0; j--) if (flow[j].type === 'cover') return j
    return null
  }
  const back = () => {
    if (wiped.current) return restart()
    const j = gate === null ? backFrom(shown) : null
    if (j === null) return
    setHelp(false)
    setView(j)
  }
  const toCurrent = () => {
    if (wiped.current) return restart()
    setHelp(false)
    setView(null)
  }

  // The phone's back. One history entry stands for "back" while a step or title card has Back (and, where the browser
  // has no CloseWatcher, while the sheet is open), so a press steps back inside the take; where there is nowhere to go
  // back to (a cutscene, the birth date, the reading) the entry goes, and a press leaves the game, as on a cover
  // (SC-01). Chrome skips an entry a page adds without a fresh tap (its rule against back-button traps), so the entry
  // is added only on a tap: never on opening, and after a press only once the player taps again. Two presses with no
  // tap between them leave the game.
  const sheetBack = useRef<(() => void) | null>(null)
  const setSheetBack = useCallback((up: (() => void) | null) => {
    sheetBack.current = up
  }, [])
  const canBack = (help && !closeWatched) || (gate === null && backFrom(shown) !== null)
  const nav = useRef({ canBack, back, skip: false, popped: false })
  const sync = useCallback(() => {
    const n = nav.current
    const has = history.state?.retake === 1
    if (n.canBack && !has) {
      if (!n.popped && (navigator.userActivation?.isActive ?? true)) history.pushState({ retake: 1 }, '')
    } else if (!n.canBack && has && !n.skip) {
      n.skip = true
      history.back()
    }
  }, [])
  useEffect(() => {
    nav.current.canBack = canBack
    nav.current.back = back
    sync()
  })
  useEffect(() => {
    const on = () => {
      const n = nav.current
      if (n.skip) {
        n.skip = false
        sync()
        return
      }
      n.popped = true
      if (sheetBack.current) sheetBack.current()
      else n.back()
    }
    // a tap or a key press: the entry can be added again
    const tap = () => {
      nav.current.popped = false
      sync()
    }
    addEventListener('popstate', on)
    for (const t of ['pointerup', 'keydown', 'click']) addEventListener(t, tap, true)
    return () => {
      removeEventListener('popstate', on)
      for (const t of ['pointerup', 'keydown', 'click']) removeEventListener(t, tap, true)
    }
  }, [sync])

  const commit = (id: string) => (a: Answer) => {
    setSaved((s) => ({ ...s, answers: { ...s.answers, [id]: { ...a, s: SIG[id] } } }))
    next()
  }
  const setLang = useCallback((lang: Lang) => setSaved((s) => ({ ...s, lang })), [])
  const privacy = useMemo(
    () => ({
      deleteAll: () => {
        wiped.current = true
        wipe()
      },
      restart,
    }),
    [restart],
  )
  // "Not you? Remove this reading": the answers go, and the take starts again (a shared phone, F-203)
  const forget = useCallback(() => {
    setHelp(false)
    setView(null)
    setSaved((s) => ({ ...s, at: 0, answers: {} }))
  }, [])

  // focus follows the take: a new screen's heading (a cutscene's frame) takes it, so a keyboard or a screen reader is
  // never left on the page; when the sheet closes over the same screen, "?" has it again (SC-40)
  const main = useRef<HTMLElement>(null)
  const where = gate ?? String(shown)
  const last = useRef({ where, help })
  useEffect(() => {
    const p = last.current
    last.current = { where, help }
    const root = main.current
    if (!root) return
    if (p.where !== where) focusScreen(root)
    else if (p.help && !help) root.querySelector<HTMLElement>('[data-help]')?.focus({ preventScroll: true })
  }, [where, help])
  const soundCtx = useMemo(
    () => ({ sound, on: saved.sound, toggle: () => setSaved((s) => ({ ...s, sound: !s.sound })) }),
    [sound, saved.sound],
  )

  const props = { help, onHelp: setHelp }
  const [keeps] = useState(canKeep)
  let body
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
  // a way in watched again goes on to its title card, then to the screen the take is on
  else if (screen.type === 'cut') body = <Cutscene c={screen} onNext={!looking ? next : shown + 1 >= at ? toCurrent : () => setView(shown + 1)} {...props} />
  else if (screen.type === 'cover')
    body = (
      <Cover
        c={screen}
        onNext={looking ? toCurrent : next}
        onBack={backFrom(shown) === null ? undefined : back}
        revisit={looking}
        {...props}
      />
    )
  else if (screen.type === 'step') {
    const Kind = KINDS[screen.kind]
    body = (
      <Kind
        s={screen}
        onCommit={commit(screen.id)}
        onBack={back}
        revisit={looking ? { answer: saved.answers[screen.id], onReturn: toCurrent } : undefined}
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
            <SheetBackContext.Provider value={setSheetBack}>
              <UpdateContext.Provider value={update}>
                <main className="take" key={where} ref={main}>
                  {body}
                </main>
              </UpdateContext.Provider>
            </SheetBackContext.Provider>
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
