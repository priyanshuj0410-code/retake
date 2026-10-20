import './list.css'

/**
 * A plain bulleted list; an empty list renders nothing rather than an empty <ul>. With `help`
 * (EVAL-10's "English with Hinglish help"), each item's Hinglish sits under it, smaller.
 */
export function List({ items, help }: { items: string[]; help?: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="list">
      {items.map((t, i) => (
        <li className="list__item" key={t}>
          {t}
          {help?.[i] ? (
            <span className="list__help" lang="hi-Latn">
              {help[i]}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
