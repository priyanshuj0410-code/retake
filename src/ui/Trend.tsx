import './trend.css'

export interface TrendItem {
  /** A short label under the point (the season's month). */
  when: string
  /** 0 (the bottom end) to 1 (the top end). */
  at: number
  lo: number
  hi: number
  /** A season that changed: a square point with its own range, and the band breaks there. */
  change?: boolean
}

/**
 * The profile's trend (EVAL-12): the pooled reading after each season, as a point on a vertical
 * line from "Men first" (bottom) to "Women first" (top) with a dashed "About equal" rule, and its
 * range as a shaded band joined from season to season. A season that changed is a square with its
 * own range bar, and the band starts again after it. One image with a spoken label that says every
 * point; ink on the ground only, no colour says good or bad, nothing moves.
 */
export function Trend({
  items,
  label,
  ends,
}: {
  items: TrendItem[]
  label: string
  ends: { top: string; middle: string; bottom: string }
}) {
  const n = items.length
  const x = (i: number) => ((i + 0.5) / Math.max(1, n)) * 100
  const y = (v: number) => (1 - Math.min(1, Math.max(0, v))) * 100
  const pc = (v: number) => `${Math.round(v * 10) / 10}%`
  /* Runs of seasons pooled together: a change ends one run and is drawn alone. */
  const runs: number[][] = []
  items.forEach((it, i) => {
    if (it.change) return runs.push([i])
    const last = runs[runs.length - 1]
    if (last && !items[last[last.length - 1]].change && last[last.length - 1] === i - 1)
      last.push(i)
    else runs.push([i])
  })
  return (
    <figure className="trend">
      <div className="trend__body">
        <div className="trend__axis" aria-hidden="true">
          <span>{ends.top}</span>
          <span className="trend__middle">{ends.middle}</span>
          <span>{ends.bottom}</span>
        </div>
        <div className="trend__plot" role="img" aria-label={label}>
          <svg
            className="trend__svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <line className="trend__mid" x1="0" y1="50" x2="100" y2="50" />
            {runs.map((r) =>
              r.length > 1 ? (
                <g key={r[0]}>
                  <polygon
                    className="trend__band"
                    points={[
                      ...r.map((i) => `${x(i)},${y(items[i].hi)}`),
                      ...r
                        .slice()
                        .reverse()
                        .map((i) => `${x(i)},${y(items[i].lo)}`),
                    ].join(' ')}
                  />
                  <polyline
                    className="trend__line"
                    points={r.map((i) => `${x(i)},${y(items[i].at)}`).join(' ')}
                  />
                </g>
              ) : (
                <line
                  key={r[0]}
                  className="trend__bar"
                  x1={x(r[0])}
                  x2={x(r[0])}
                  y1={y(items[r[0]].hi)}
                  y2={y(items[r[0]].lo)}
                />
              ),
            )}
          </svg>
          {items.map((it, i) => (
            <span
              key={`${i}-${it.when}`}
              className={it.change ? 'trend__point trend__point--change' : 'trend__point'}
              style={{ left: pc(x(i)), top: pc(y(it.at)) }}
            />
          ))}
        </div>
        <span />
        <div className="trend__when" aria-hidden="true">
          {items.map((it, i) => (
            <span key={`${i}-${it.when}`}>{it.when}</span>
          ))}
        </div>
      </div>
    </figure>
  )
}
