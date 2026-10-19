import type { ReactNode } from 'react'
import './resulthero.css'

/**
 * The top of the result page, out of fiction: one number to remember for the sex reading
 * ("38 of 46 equal pairs where you put the man ahead"), the same pairs as a dot grid (filled:
 * the man ahead; ring: the woman ahead; dashed: neither), then the band and its sentence. Ink on
 * grey only: no colour says good or bad. Without a sex reading it shows only the band line, and
 * the page goes on to the readings the player does have.
 */
export function ResultHero({
  group,
  figure,
  band,
  body,
  children,
}: {
  group: string
  figure?: {
    big: string
    line: string
    dots: { filled: number; rings: number; dashed: number; label: string }
  }
  band: string
  body: string
  children?: ReactNode
}) {
  return (
    <section className="resulthero" aria-label={group}>
      <p className="resulthero__group">{group}</p>
      {figure ? (
        <>
          <p className="resulthero__big">
            <span className="resulthero__number">{figure.big}</span>
            <span className="resulthero__line">{figure.line}</span>
          </p>
          <span className="resulthero__dots" role="img" aria-label={figure.dots.label}>
            {[
              ...Array<string>(figure.dots.filled).fill('resulthero__dot resulthero__dot--filled'),
              ...Array<string>(figure.dots.dashed).fill('resulthero__dot resulthero__dot--dashed'),
              ...Array<string>(figure.dots.rings).fill('resulthero__dot'),
            ].map((c, i) => (
              <i key={i} className={c} />
            ))}
          </span>
        </>
      ) : null}
      <h2 className="resulthero__band">{band}</h2>
      <p className="resulthero__body">{body}</p>
      {children}
    </section>
  )
}
