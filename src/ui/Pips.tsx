import './pips.css'

/** A count shown as dots, said in words for screen readers: the level, a day's parts. */
export function Pips(props: { on: number; total: number; label: string }) {
  return (
    <span className="pips" role="img" aria-label={props.label}>
      {[...Array(props.total).keys()].map((i) => (
        <span key={i} className="pips__pip" data-on={i < props.on ? 'true' : 'false'} />
      ))}
    </span>
  )
}
