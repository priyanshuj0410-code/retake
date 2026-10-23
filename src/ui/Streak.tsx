import './streak.css'
import './hidden.css'

/**
 * The streak: the count and the fortnight's strip. Lugdi draws spines (a forgiven day is the red
 * spine), Station draws platform tickets (a forgiven day is the white ticket). Each mark says
 * its state in words for screen readers; the screen shows no sentence about it.
 */
export function Streak(props: { label: string; count: string; marks: { date: string; mark: string; label: string }[] }) {
  return (
    <section className="streak" aria-label={props.label}>
      <div className="streak__head">
        <span className="vh">{props.label}</span>
        <span className="streak__count">{props.count}</span>
      </div>
      <ol className="streak__strip">
        {props.marks.map((m) => (
          <li key={m.date} className="streak__mark" data-mark={m.mark} aria-label={m.label} />
        ))}
      </ol>
    </section>
  )
}
