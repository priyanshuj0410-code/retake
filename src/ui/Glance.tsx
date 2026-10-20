import { RangeLine } from './RangeLine'
import './glance.css'

export interface GlanceRow {
  id: string
  label: string
  /** The tag once the reading is confirmed, otherwise how it is forming. */
  status: string
  at: number
  lo: number
  hi: number
  /** Solid once tagged; hollow while untagged (the range is the mark). */
  point: 'solid' | 'hollow' | 'none'
  ends: { left: string; middle: string; right: string }
  /** The spoken label: the status, the position and the range in words. */
  said: string
}

/**
 * "At a glance" (EVAL-12): small multiples, one compact position-and-range line per reading on
 * the same 0 to 1 scale, each with its label, its status (the tag, or "Still forming. Tagged
 * after N more seasons on your profile") and its own end words, so the readings compare at once.
 * Ink only; the point's fill says tagged or not, and the status says it in words.
 */
export function Glance({ rows, label }: { rows: GlanceRow[]; label: string }) {
  return (
    <ul className="glance" aria-label={label}>
      {rows.map((r) => (
        <li className="glance__row" key={r.id}>
          <span className="glance__text">
            <span className="glance__label">{r.label}</span>
            <span className="glance__status">{r.status}</span>
          </span>
          <span className="glance__line">
            <RangeLine
              compact
              at={r.at}
              lo={r.lo}
              hi={r.hi}
              ends={r.ends}
              point={r.point}
              label={r.said}
            />
            <span className="glance__ends" aria-hidden="true">
              <span>{r.ends.left}</span>
              <span>{r.ends.right}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
