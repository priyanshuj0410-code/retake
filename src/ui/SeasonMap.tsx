import './map.css'

const STOP = {
  done: 'map__stop map__stop--done',
  now: 'map__stop map__stop--now',
  next: 'map__stop map__stop--next',
}
const FINALE = {
  done: 'map__stop map__stop--done map__stop--finale',
  now: 'map__stop map__stop--now map__stop--finale',
  next: 'map__stop map__stop--next map__stop--finale',
}

export interface MapStop {
  /** The stop's short name: the chapter title, or "Finale and rating". */
  title: string
  state: 'done' | 'now' | 'next'
}

/**
 * The season map (EVAL-8, concept D), in the sticky header in place of a page count: six stops
 * (five chapters and the finale, the finale drawn square) on one line, and dots for the current
 * chapter's cards only, so progress resets each chapter. No countdown, no motion. It is one
 * image with a spoken label that says the same in words.
 */
export function SeasonMap({
  stops,
  cards,
  label,
}: {
  stops: MapStop[]
  cards: { done: number; total: number }
  label: string
}) {
  return (
    <div className="map" role="img" aria-label={label}>
      <ol className="map__stops">
        {stops.map((s, i) => (
          <li
            key={`${i}-${s.title}`}
            className={i === stops.length - 1 ? FINALE[s.state] : STOP[s.state]}
          >
            {i === stops.length - 1 ? '' : i + 1}
          </li>
        ))}
      </ol>
      <span className="map__dots">
        {[...Array(cards.total).keys()].map((i) => (
          <i key={i} className={i < cards.done ? 'map__dot map__dot--done' : 'map__dot'} />
        ))}
      </span>
    </div>
  )
}
