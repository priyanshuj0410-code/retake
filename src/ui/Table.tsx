import './table.css'

/**
 * The demo results table. The scroll box is a named, focusable region, so a keyboard can
 * scroll a table wider than the phone; with no rows it says so in one full-width cell.
 */
export function Table({
  head,
  rows,
  caption,
  empty = '',
}: {
  head: string[]
  rows: { cells: string[]; suppressed?: boolean }[]
  caption: string
  empty?: string
}) {
  return (
    <div className="table__wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className="table">
        <caption className="table__cell">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th className="table__head" key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="table__cell table__cell--suppressed" colSpan={head.length}>
                {empty}
              </td>
            </tr>
          ) : null}
          {rows.map((r, i) => (
            <tr key={i}>
              {r.cells.map((c, j) => (
                <td
                  className={r.suppressed ? 'table__cell table__cell--suppressed' : 'table__cell'}
                  key={j}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
