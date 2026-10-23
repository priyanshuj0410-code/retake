import type { ReactNode } from 'react'
import { Portrait } from './Portrait'
import './splash.css'

/**
 * The first screen: a picture that fills it (the day's cover painting in Lugdi, the cast in
 * enamel in Station) with the actions on top. Decorative; the heading is for screen readers.
 */
export function Splash(props: {
  skin: 'lugdi' | 'station'
  art?: string
  cast: { id: string; name: string }[]
  children: ReactNode
}) {
  return (
    <section className="splash">
      {props.skin === 'lugdi' && props.art ? (
        <div
          className="splash__art"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}art/${props.art}.webp)` }}
          aria-hidden="true"
        />
      ) : (
        <div className="splash__grid" aria-hidden="true">
          {props.cast.map((c) => (
            <Portrait key={c.id} id={c.id} name={c.name} art skin={props.skin} size="fill" />
          ))}
        </div>
      )}
      <div className="splash__actions">{props.children}</div>
    </section>
  )
}
