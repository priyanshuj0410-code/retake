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
  /** The stop's short name: the chapter title, or "Finale and result". */
  title: string
  state: 'done' | 'now' | 'next'
}

/**
 * The season map (EVAL-8, concept D; moved by EVAL-10): six stops on one line (five chapters
 * and the finale, the finale drawn square), shown on the chapter-end screen, where the player
 * stops to look. The sticky header carries only the chapter label (EVAL-12). No countdown, no motion;
 * one image with a spoken label that says the same in words.
 */
export function SeasonMap({ stops, label }: { stops: MapStop[]; label: string }) {
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
    </div>
  )
}
