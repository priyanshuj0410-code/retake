import './stats.css'

/** Numbers with their labels, read as a description list (label, then number). */
export function Stats(props: { items: { n: string; label: string }[] }) {
  return (
    <dl className="stats">
      {props.items.map((i) => (
        <div className="stats__item" key={i.label}>
          <dt className="stats__label">{i.label}</dt>
          <dd className="stats__n">{i.n}</dd>
        </div>
      ))}
    </dl>
  )
}
