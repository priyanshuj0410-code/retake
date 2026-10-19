import { PortraitArt, type Look } from './portraitArt'
import { fileFor, usePortraitFiles } from './portraitImages'
import './portrait.css'

/** One face: the generated image on the comic backdrop when the manifest lists one, else drawn. */
function Face({ look, label, eager }: { look: Look; label: string; eager?: boolean }) {
  const src = fileFor(look, usePortraitFiles())
  if (!src) return <PortraitArt look={look} />
  return (
    <>
      <PortraitArt look={look} backdrop />
      <img
        className="portrait__photo"
        src={src}
        alt={label}
        aria-label={label || undefined}
        width={384}
        height={384}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </>
  )
}

/**
 * A face (section 4c): a person or a week-one mascot, in a comic panel. When the generated
 * WebP headshot for this slot, sex and tone (or this mascot) is listed in
 * public/portraits/manifest.json, it sits on the panel's tint and halftone backdrop; otherwise
 * the drawn SVG portrait is the fallback. After the reveal a small inset keeps the mascot in the
 * corner, so the player can follow who was who. The label is what a screen reader says for the
 * picture. Sizes: `panel` fills its card (ranking, picks, the reveal, the cast sheet), `row` is a
 * 72 px face beside a name (the split), `then` the 64 px face in a consequence panel. `eager`
 * loads the image at once (faces above the fold); the rest load lazily.
 */
export function Portrait({
  look,
  label,
  inset,
  size = 'panel',
  eager,
}: {
  look: Look
  label: string
  inset?: Look
  size?: 'panel' | 'row' | 'then'
  eager?: boolean
}) {
  return (
    <span
      className={size === 'panel' ? 'portrait' : `portrait portrait--${size}`}
      role="img"
      aria-label={label}
    >
      <Face look={look} label={label} eager={eager} />
      {inset ? (
        <span className="portrait__inset">
          <Face look={inset} label="" eager={eager} />
        </span>
      ) : null}
    </span>
  )
}
