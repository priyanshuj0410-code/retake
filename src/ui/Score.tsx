import './score.css'

/**
 * The headline: one big number, with at most one figure beside it (the week's lean size). The
 * sum it is made of (consistency + practice) sits in the details behind a tap.
 */
export function Score(props: { total: { n: string; label: string }; side?: { n: string; label: string; spoken: string } }) {
  return (
    <dl className="score">
      <div className="score__part">
        <dt className="score__label">{props.total.label}</dt>
        <dd className="score__n">{props.total.n}</dd>
      </div>
      {props.side ? (
        <div className="score__side" aria-label={props.side.spoken} role="group">
          <dt className="score__label">{props.side.label}</dt>
          <dd className="score__n">{props.side.n}</dd>
        </div>
      ) : null}
    </dl>
  )
}
