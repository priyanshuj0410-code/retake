import './statement.css'

/** A crosswise pair: the sensitive statement A and the randomiser statement B. */
export function Statement({ a, b, labelA, labelB }: { a: string; b: string; labelA: string; labelB: string }) {
  return (
    <div className="statement">
      <div className="statement__box">
        <p className="statement__label">{labelA}</p>
        <p className="statement__text">{a}</p>
      </div>
      <div className="statement__box">
        <p className="statement__label">{labelB}</p>
        <p className="statement__text">{b}</p>
      </div>
    </div>
  )
}
