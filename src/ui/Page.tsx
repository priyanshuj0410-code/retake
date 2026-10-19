import { useEffect, useRef, type ReactNode } from 'react'
import { SeasonMap, type MapStop } from './SeasonMap'
import './page.css'

const PRODUCT = 'Team season'

export interface PageProps {
  surface: 'game' | 'oof' | 'sober'
  act?: string
  /** The season map beside the act label (EVAL-8): six stops and the current chapter's cards. */
  map?: { stops: MapStop[]; cards: { done: number; total: number }; label: string }
  /** The out-of-fiction line, "This part is not part of the game." */
  oof?: string
  title?: string
  /** A quiet line under the content, in the note register: the prototype line on the landing only. */
  footnote?: string
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
  map,
  oof,
  title,
  footnote,
  stepKey,
  children,
  actions,
  lang,
  screen,
  pin,
}: PageProps) {
  const mainRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  /* The sticky header's height, as --head-h, so a focused or scrolled-to element is never
     under it (scroll-margin-top in page.css). */
  useEffect(() => {
    const head = headRef.current
    const root = pageRef.current
    if (!head || !root || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() =>
      root.style.setProperty('--head-h', `${head.getBoundingClientRect().height}px`),
    )
    ro.observe(head)
    return () => ro.disconnect()
  }, [act])
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
    <div
      className="page"
      data-surface={surface}
      lang={lang}
      data-screen={screen ?? stepKey}
      ref={pageRef}
    >
      <div className="page__inner">
        {act ? (
          <header className="page__head" ref={headRef}>
            <div className="page__bar">
              <p className="page__act">{act}</p>
              {map ? <SeasonMap {...map} /> : null}
            </div>
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
          {footnote ? <p className="page__footnote">{footnote}</p> : null}
        </main>
      </div>
    </div>
  )
}
