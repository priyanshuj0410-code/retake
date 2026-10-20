import './figures.css'

/** Clear numbers, one per row: what each part of consistency came to. */
export function Figures(props: { rows: { label: string; n: string }[]; label?: string }) {
  return (
    <dl className="figures" aria-label={props.label}>
      {props.rows.map((r) => (
        <div className="figures__row" key={r.label}>
          <dt className="figures__label">{r.label}</dt>
          <dd className="figures__n">{r.n}</dd>
        </div>
      ))}
    </dl>
  )
}
