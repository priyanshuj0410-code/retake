import './spectrum.css'

/**
 * The strength bar of the result page: where the player's decisions sit between two groups,
 * with the middle the season cannot tell from chance shaded. The picture is one image with a
 * spoken label; the sentence under it gives the same numbers in words.
 */
export function Spectrum({
  at,
  from,
  to,
  left,
  right,
  label,
  zoneLabel,
}: {
  /** 0 (left end) to 1 (right end). */
  at: number
  from: number
  to: number
  left: string
  right: string
  label: string
  zoneLabel: string
}) {
  const pc = (x: number) => `${Math.round(Math.min(1, Math.max(0, x)) * 1000) / 10}%`
  return (
    <figure className="spectrum">
      <figcaption className="spectrum__label">{label}</figcaption>
      <div className="spectrum__track" role="img" aria-label={`${label}: ${zoneLabel}`}>
        <span className="spectrum__zone" style={{ left: pc(from), width: pc(to - from) }} />
        <span className="spectrum__marker" style={{ left: pc(at) }} />
      </div>
      <div className="spectrum__ends" aria-hidden="true">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <p className="spectrum__note">{zoneLabel}</p>
    </figure>
  )
}
