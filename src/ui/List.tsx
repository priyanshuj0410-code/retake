import './list.css'

export function List({ items }: { items: string[] }) {
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
