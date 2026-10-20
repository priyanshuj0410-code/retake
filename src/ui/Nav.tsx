import './nav.css'

/** The three tabs: today, the board and the week. */
export function Nav(props: { label: string; items: { href: string; label: string; current: boolean }[] }) {
  return (
    <nav className="nav" aria-label={props.label}>
      {props.items.map((i) => (
        <a key={i.href} className="nav__link" href={i.href} aria-current={i.current ? 'page' : undefined}>
          {i.label}
        </a>
      ))}
    </nav>
  )
}
