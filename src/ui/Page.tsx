import { useEffect, useRef, type ReactNode } from 'react'
import { DemoBadge } from './DemoBadge'
import './page.css'

const PRODUCT = 'Team season'

export interface PageProps {
  surface: 'game' | 'oof' | 'sober'
  act?: string
  /** Progress through the session, "Page 15 of 96": never a countdown. */
  progress?: string
  /** The episode track: n of k, drawn as pips beside the act label (which says it in words). */
  track?: { n: number; k: number }
  /** The out-of-fiction line, "This part is not part of the game." */
  oof?: string
  title?: string
  demo?: string
  /** Changes on every new screen, so focus moves to its heading. */
  stepKey: string
  children?: ReactNode
  actions?: ReactNode
  lang?: string
  /** Keep the action row at the foot of the screen (the story's turn-the-page screens). */
  pin?: boolean
  /** A marker for the checks and screenshots: data-screen. */
  screen?: string
}

export function Page({
  surface,
  act,
  progress,
  track,
  oof,
  title,
  demo,
  stepKey,
  children,
  actions,
  lang,
  screen,
  pin,
}: PageProps) {
  const mainRef = useRef<HTMLElement>(null)
  /* Each new screen: focus on its heading (the title, or a question's h1 inside its legend),
     and a document title that names it, "Your season · Team season". */
  useEffect(() => {
    const main = mainRef.current
    const h1 = main?.querySelector('h1')
    if (h1) h1.tabIndex = -1
    ;(h1 ?? main)?.focus()
    document.title = h1?.textContent ? `${h1.textContent} · ${PRODUCT}` : PRODUCT
    window.scrollTo(0, 0)
  }, [stepKey])
  return (
    <div className="page" data-surface={surface} lang={lang} data-screen={screen ?? stepKey}>
      <div className="page__inner">
        {demo || act || progress ? (
          <header className="page__head">
            {demo ? <DemoBadge text={demo} /> : null}
            {act || progress ? (
              <div className="page__bar">
                {act ? <p className="page__act">{act}</p> : null}
                {track ? (
                  <span className="page__track" aria-hidden="true">
                    {[...Array(track.k).keys()].map((i) => (
                      <i
                        key={i}
                        className={i < track.n ? 'page__pip page__pip--on' : 'page__pip'}
                      />
                    ))}
                  </span>
                ) : null}
                {progress ? <p className="page__progress">{progress}</p> : null}
              </div>
            ) : null}
          </header>
        ) : null}
        <main className="page__body" ref={mainRef} tabIndex={-1}>
          {oof ? <p className="page__oof">{oof}</p> : null}
          {title ? <h1 className="page__title">{title}</h1> : null}
          {children}
          {actions ? (
            <div className={pin ? 'page__actions page__actions--pinned' : 'page__actions'}>
              {actions}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
