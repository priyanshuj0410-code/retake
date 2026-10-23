import './ranks.css'
import './hidden.css'

/** The board: the top ranks, then the player's own row. Never a bottom list. */
export function Ranks(props: {
  caption: string
  cols: [string, string, string]
  rows: { rank: string; name: string; practice: string; you?: boolean; action?: { label: string; glyph: string; onPress: () => void } }[]
  you?: { rank: string; name: string; practice: string }
}) {
  return (
    <table className="ranks">
      <caption className="vh">{props.caption}</caption>
      <thead>
        <tr>
          {props.cols.map((c) => (
            <th key={c} className="ranks__head" scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((r) => (
          <tr key={`${r.rank}-${r.name}`} className="ranks__row" data-you={r.you ? 'true' : 'false'}>
            <td className="ranks__cell">{r.rank}</td>
            <td className="ranks__cell">{r.name}</td>
            <td className="ranks__cell">
              {r.practice}
              {r.action ? (
                <button type="button" className="ranks__act" aria-label={r.action.label} onClick={r.action.onPress}>
                  {r.action.glyph}
                </button>
              ) : null}
            </td>
          </tr>
        ))}
        {props.you ? (
          <>
            <tr className="ranks__row" data-you="false" aria-hidden="true">
              <td className="ranks__gap" colSpan={3}>
                ⋮
              </td>
            </tr>
            <tr className="ranks__row" data-you="true">
              <td className="ranks__cell">{props.you.rank}</td>
              <td className="ranks__cell">{props.you.name}</td>
              <td className="ranks__cell">{props.you.practice}</td>
            </tr>
          </>
        ) : null}
      </tbody>
    </table>
  )
}
