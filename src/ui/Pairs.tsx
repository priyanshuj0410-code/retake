import './pairs.css'

export interface PairItem {
  /** Where it happened: "Chapter 1, Interview panel". */
  context?: string
  /** The colleague put first (set first, marked "first"). */
  first: string
  other: string
  /** equal: the two descriptions were equally strong; weaker: the first one's was weaker. */
  relation: 'equal' | 'weaker'
  /** Neither came first more often: no "first" marker. */
  even?: boolean
  /** A count beside the row: "8 of 12". */
  count?: string
  /** The whole row in one sentence, for a screen reader. */
  said: string
}

/**
 * The player's own decisions as compact pair rows (EVAL-12): two name chips with an equals sign
 * (equally strong descriptions) or a less-than sign (the first one's description was weaker),
 * the colleague put first set first and marked "first" in words, and the place it happened
 * above. Names only: the result page has no portraits. Each row is one image with a full
 * spoken sentence; the word "first" and the order, never a colour, say who came first.
 */
export function Pairs({
  items,
  label,
  firstWord,
}: {
  items: PairItem[]
  label: string
  firstWord: string
}) {
  return (
    <ul className="pairs" aria-label={label}>
      {items.map((p, i) => (
        <li className="pairs__row" key={`${i}-${p.said}`}>
          {p.context ? <span className="pairs__context">{p.context}</span> : null}
          <span className="pairs__line" role="img" aria-label={p.said}>
            <span className={p.even ? 'pairs__chip' : 'pairs__chip pairs__chip--first'}>
              {p.first}
              {p.even ? null : <span className="pairs__mark">{firstWord}</span>}
            </span>
            <span className="pairs__sign">{p.relation === 'equal' ? '=' : '<'}</span>
            <span className="pairs__chip">{p.other}</span>
            {p.count ? <span className="pairs__count">{p.count}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
