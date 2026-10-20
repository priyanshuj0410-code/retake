import './punches.css'

/** Checks as punch holes: `used` filled of `total`. The count is also said in words. */
export function Punches(props: { used: number; total: number; label: string }) {
  return (
    <span className="punches" role="img" aria-label={props.label}>
      {[...Array(props.total).keys()].map((i) => (
        <span key={i} className="punches__hole" data-on={i < props.used ? 'true' : 'false'} />
      ))}
    </span>
  )
}
