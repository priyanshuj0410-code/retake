import './readinglist.css'

export interface ReadingRow {
  id: string
  label: string
  level: string
  zone: 'lean' | 'none' | 'unread'
}

/**
 * Readings as a plain list, label then level, in the out-of-fiction register. Every level is
 * set in the same ink and weight: "Leans towards men" looks exactly like "No lean read", so no
 * colour or weight reads as good or bad. Only "Not enough to say" is quieter, because it is
 * not a reading.
 */
export function ReadingList({ items, label }: { items: ReadingRow[]; label: string }) {
  return (
    <dl className="readinglist" aria-label={label}>
      {items.map((it) => (
        <div className="readinglist__row" key={it.id}>
          <dt className="readinglist__label">{it.label}</dt>
          <dd
            className={
              it.zone === 'unread'
                ? 'readinglist__level readinglist__level--unread'
                : 'readinglist__level'
            }
          >
            {it.level}
          </dd>
        </div>
      ))}
    </dl>
  )
}
