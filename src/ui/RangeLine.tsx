import './rangeline.css'

/**
 * Where a result sits on one line from "men first" to "women first" (EVAL-10): an ink dot at
 * the position and a shaded range around it, with a tick at the middle ("about equal"). The
 * picture is one image with a spoken label; the words under it say the same thing. Ink on the
 * surface's own ground only: no colour says good or bad, and neither end is marked as the
 * right one. `compact` is the profile timeline's smaller line, without the end labels.
 */
export function RangeLine({
  at,
  lo,
  hi,
  ends,
  label,
  caption,
  note,
  compact,
}: {
  /** 0 (the left end) to 1 (the right end). */
  at: number
  lo: number
  hi: number
  ends: { left: string; middle: string; right: string }
  /** The spoken label: the position and the range in words. */
  label: string
  /** A heading line above the picture. */
  caption?: string
  /** A plain sentence under it. */
  note?: string
  compact?: boolean
}) {
  const pc = (x: number) => `${Math.round(Math.min(1, Math.max(0, x)) * 1000) / 10}%`
  return (
    <figure className={compact ? 'rangeline rangeline--compact' : 'rangeline'}>
      {caption ? <figcaption className="rangeline__caption">{caption}</figcaption> : null}
      <div className="rangeline__track" role="img" aria-label={label}>
        <span className="rangeline__axis" />
        <span className="rangeline__mid" />
        <span className="rangeline__range" style={{ left: pc(lo), width: pc(hi - lo) }} />
        <span className="rangeline__dot" style={{ left: pc(at) }} />
      </div>
      {compact ? null : (
        <div className="rangeline__ends" aria-hidden="true">
          <span>{ends.left}</span>
          <span className="rangeline__middle">{ends.middle}</span>
          <span>{ends.right}</span>
        </div>
      )}
      {note ? <p className="rangeline__note">{note}</p> : null}
    </figure>
  )
}
