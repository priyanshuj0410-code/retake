import type { ReactNode } from 'react'
import './resulthero.css'

/**
 * The top of the result page, out of fiction (EVAL-10): one number to remember for women and
 * men ("38 of 46 pairs where you put the man first"), one sentence saying what a pair is, the
 * same pairs as a dot grid (filled: the man first; ring: the woman first; dashed: neither),
 * then the tag and its sentence, then the position with its range (children). Ink on grey
 * only: no colour says good or bad. With "Not enough to tell" it shows the tag and its sentence
 * only, and nothing of the result follows it (copy audit G5).
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
    /** What a pair is, in one sentence (EVAL-10, copy audit G1). */
    pair: string
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
          <p className="resulthero__pair">{figure.pair}</p>
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
