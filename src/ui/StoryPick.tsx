import './storypick.css'

export interface StoryOption {
  id: string
  emoji: string
  title: string
  premise: string
  /** A season that is not built yet: shown, not playable. */
  later?: string
}

/** Pick one season story: one tap on a built season starts it; seasons not built yet are aria-disabled. */
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
            <span className="storypick__emoji" aria-hidden="true">
              {o.emoji}
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
