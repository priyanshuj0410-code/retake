import { Portrait } from './Portrait'
import './reflect.css'

/**
 * A twin pair side by side for the Sunday look back. It shows what each side said and which
 * one the player chose, and gives no verdict.
 */
export function Reflect(props: {
  skin: 'lugdi' | 'station'
  chose: string
  cols: {
    label: string
    people: { id: string; name: string; art: boolean; line: string; chosen: boolean }[]
  }[]
}) {
  return (
    <div className="reflect">
      {props.cols.map((c) => (
        <section className="reflect__col" key={c.label} aria-label={c.label}>
          <span className="reflect__label">{c.label}</span>
          {c.people.map((p) => (
            <div key={p.id}>
              <Portrait id={p.id} name={p.name} art={p.art} skin={props.skin} size="s" />
              <p className="reflect__line">
                <strong>{p.name}</strong> {p.line}
              </p>
              {p.chosen ? <span className="reflect__chose">{props.chose}</span> : null}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
