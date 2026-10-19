import './timeline.css'

/** Past seasons in order, one band each: a vertical line of dated entries (the profile page). */
export function Timeline({
  items,
  label,
}: {
  items: { when: string; what: string; band: string }[]
  label: string
}) {
  return (
    <ol className="timeline" aria-label={label}>
      {items.map((it) => (
        <li className="timeline__entry" key={`${it.when}-${it.what}`}>
          <span className="timeline__when">{it.when}</span>
          <span className="timeline__what">{it.what}</span>
          <span className="timeline__band">{it.band}</span>
        </li>
      ))}
    </ol>
  )
}
