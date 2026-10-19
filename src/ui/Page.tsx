import { useEffect, useRef, type ReactNode } from 'react'
import { DemoBadge } from './DemoBadge'
import './page.css'

export interface PageProps {
  surface: 'game' | 'oof' | 'sober'
  act?: string
  /** The out-of-fiction line, "This part is not part of the game." */
  oof?: string
  title?: string
  demo?: string
  /** Changes on every new screen, so focus moves to its heading. */
  stepKey: string
  children?: ReactNode
  actions?: ReactNode
  lang?: string
}

export function Page({ surface, act, oof, title, demo, stepKey, children, actions, lang }: PageProps) {
  const focusRef = useRef<HTMLHeadingElement & HTMLDivElement>(null)
  useEffect(() => {
    focusRef.current?.focus()
    window.scrollTo(0, 0)
  }, [stepKey])
  return (
    <div className="page" data-surface={surface} lang={lang}>
      <div className="page__inner">
        {demo ? <DemoBadge text={demo} /> : null}
        {act || oof ? (
          <div className="page__bar">
            {act ? <p className="page__act">{act}</p> : null}
          </div>
        ) : null}
        <main className="page__body" ref={title ? undefined : focusRef} tabIndex={title ? undefined : -1}>
          {oof ? <p className="page__oof">{oof}</p> : null}
          {title ? (
            <h1 className="page__title" ref={focusRef} tabIndex={-1}>
              {title}
            </h1>
          ) : null}
          {children}
          {actions ? <div className="page__actions">{actions}</div> : null}
        </main>
      </div>
    </div>
  )
}
