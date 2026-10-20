import './score.css'

/** The headline as its sum: score = consistency + practice, every number shown. */
export function Score(props: { total: { n: string; label: string }; parts: { n: string; label: string }[] }) {
  return (
    <dl className="score">
      <div className="score__part">
        <dt className="score__label">{props.total.label}</dt>
        <dd className="score__n">{props.total.n}</dd>
      </div>
      {props.parts.map((p, i) => (
        <div className="score__part" key={p.label}>
          <dt className="score__label">
            <span className="score__op" aria-hidden="true">
              {i === 0 ? '= ' : '+ '}
            </span>
            {p.label}
          </dt>
          <dd className="score__n">{p.n}</dd>
        </div>
      ))}
    </dl>
  )
}
