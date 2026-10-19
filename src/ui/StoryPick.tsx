import { PanelArt, type ArtKey } from './PanelArt'
import './storypick.css'

export interface StoryOption {
  id: string
  /** The season's drawn cover panel. */
  art: ArtKey
  title: string
  premise: string
  /** A season that is not playable yet: shown, with when it opens. */
  later?: string
}

/** Pick one season story: one tap on the drawn season starts it; the others are aria-disabled. */
export function StoryPick({
  options,
  onPick,
  label,
}: {
  options: StoryOption[]
  onPick: (id: string) => void
  label: string
}) {
  return (
    <ul className="storypick" aria-label={label}>
      {options.map((o) => (
        <li key={o.id}>
          <button
            type="button"
            className="storypick__card"
            aria-disabled={!!o.later}
            onClick={() => (o.later ? undefined : onPick(o.id))}
          >
            <span className="storypick__art">
              <PanelArt art={o.art} />
            </span>
            <span className="storypick__text">
              <span className="storypick__title">{o.title}</span>
              <span className="storypick__premise">{o.premise}</span>
              {o.later ? <span className="storypick__later">{o.later}</span> : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
