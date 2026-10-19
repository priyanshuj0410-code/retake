import './list.css'

/** A plain bulleted list; an empty list renders nothing rather than an empty <ul>. */
export function List({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="list">
      {items.map((t) => (
        <li className="list__item" key={t}>
          {t}
        </li>
      ))}
    </ul>
  )
}
