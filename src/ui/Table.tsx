import './table.css'

export function Table({ head, rows, caption }: { head: string[]; rows: { cells: string[]; suppressed?: boolean }[]; caption: string }) {
  return (
    <div className="table__wrap">
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
          {rows.map((r, i) => (
            <tr key={i}>
              {r.cells.map((c, j) => (
                <td className={r.suppressed ? 'table__cell table__cell--suppressed' : 'table__cell'} key={j}>
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
