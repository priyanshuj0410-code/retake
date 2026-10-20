import './tally.css'

/**
 * A count as a picture (EVAL-12): "68 of 68" in large figures beside a thin bar filled to k of n,
 * with a one-line caption; or, with `parts`, one bar split between two groups, each part named
 * with its count under it. One image with a spoken label; the figures and words, never a colour,
 * carry the numbers, and both parts are neutral ink and tan.
 */
export function Tally({
  title,
  k,
  n,
  parts,
  caption,
  said,
}: {
  title?: string
  k?: number
  n?: number
  parts?: { label: string; n: number }[]
  caption?: string
  said: string
}) {
  const pc = (x: number) => `${Math.round(Math.min(1, Math.max(0, x)) * 1000) / 10}%`
  const total = parts ? parts.reduce((t, p) => t + p.n, 0) : (n ?? 0)
  return (
    <figure className="tally">
      {title ? <figcaption className="tally__title">{title}</figcaption> : null}
      <div className="tally__row">
        {parts ? null : (
          <span className="tally__figure" aria-hidden="true">
            {`${k ?? 0} / ${n ?? 0}`}
          </span>
        )}
        <span className="tally__bar" role="img" aria-label={said}>
          {parts ? (
            parts.map((p, i) => (
              <span
                key={p.label}
                className={i === 0 ? 'tally__fill' : 'tally__fill tally__fill--second'}
                style={{ width: pc(total ? p.n / total : 0) }}
              />
            ))
          ) : (
            <span className="tally__fill" style={{ width: pc(n ? (k ?? 0) / n : 0) }} />
          )}
        </span>
      </div>
      {parts ? (
        <span className="tally__parts" aria-hidden="true">
          {parts.map((p) => (
            <span key={p.label}>{`${p.label}: ${p.n}`}</span>
          ))}
        </span>
      ) : null}
      {caption ? (
        <span className="tally__caption" aria-hidden="true">
          {caption}
        </span>
      ) : null}
    </figure>
  )
}
