import './pointcard.css'

/**
 * One finding in a decision area: a named pattern, a sentence with the counts, and, for a
 * blind spot, the evidence: the player's own decisive pairs, listed (never a made-up inner
 * voice).
 */
export function PointCard({
  title,
  body,
  evidence,
  evidenceLabel,
}: {
  title: string
  body: string
  evidence?: string[]
  evidenceLabel?: string
}) {
  return (
    <div className="pointcard">
      <p className="pointcard__title">{title}</p>
      <p className="pointcard__body">{body}</p>
      {evidence && evidence.length ? (
        <>
          <p className="pointcard__label">{evidenceLabel}</p>
          <ul className="pointcard__evidence">
            {evidence.map((e) => (
              <li className="pointcard__item" key={e}>
                {e}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
