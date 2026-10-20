import './dotgrid.css'

/**
 * Equal-description pairs as dots (EVAL-10; its own component since EVAL-12): filled where the
 * man came first, a ring where the woman did, dashed where neither did. One image with a spoken
 * label that gives the three counts; the shapes, not a colour, carry the meaning. `small` is the
 * area version.
 */
export function DotGrid({
  filled,
  rings,
  dashed,
  label,
  small,
  caption,
}: {
  filled: number
  rings: number
  dashed: number
  label: string
  small?: boolean
  /** A visible line under the dots that says what they count (the areas, EVAL-12). */
  caption?: string
}) {
  const grid = (
    <span className={small ? 'dotgrid dotgrid--small' : 'dotgrid'} role="img" aria-label={label}>
      {[
        ...Array<string>(filled).fill('dotgrid__dot dotgrid__dot--filled'),
        ...Array<string>(dashed).fill('dotgrid__dot dotgrid__dot--dashed'),
        ...Array<string>(rings).fill('dotgrid__dot'),
      ].map((c, i) => (
        <i key={i} className={c} />
      ))}
    </span>
  )
  return caption ? (
    <figure className="dotgrid__figure">
      {grid}
      <figcaption className="dotgrid__caption">{caption}</figcaption>
    </figure>
  ) : (
    grid
  )
}
