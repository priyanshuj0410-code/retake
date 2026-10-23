import './tag.css'

/** A one- or two-word label: the locked rule, "Sample" on the board. */
export function Tag(props: { children: string; label?: string; live?: boolean }) {
  return (
    <span className="tag" aria-label={props.label} role={props.live ? 'status' : undefined}>
      {props.children}
    </span>
  )
}
