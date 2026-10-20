import { RangeLine } from './RangeLine'
import './timeline.css'

export interface TimelineItem {
  when: string
  what: string
  band: string
  /** The season's position with its range on the men-first to women-first line (EVAL-10). */
  range?: { at: number; lo: number; hi: number; label: string }
}

/**
 * Past seasons in order (the profile page): a vertical line of dated entries, each with its
 * tag and, where the season saved its counts, its position with range as a compact line, so
 * two seasons can be compared by eye.
 */
export function Timeline({
  items,
  label,
  ends,
}: {
  items: TimelineItem[]
  label: string
  ends: { left: string; middle: string; right: string }
}) {
  return (
    <ol className="timeline" aria-label={label}>
      {items.map((it) => (
        <li className="timeline__entry" key={`${it.when}-${it.what}`}>
          <span className="timeline__when">{it.when}</span>
          <span className="timeline__what">{it.what}</span>
          <span className="timeline__band">{it.band}</span>
          {it.range ? (
            <span className="timeline__range">
              <RangeLine
                compact
                at={it.range.at}
                lo={it.range.lo}
                hi={it.range.hi}
                ends={ends}
                label={it.range.label}
              />
              <span className="timeline__ends" aria-hidden="true">
                <span>{ends.left}</span>
                <span>{ends.right}</span>
              </span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
