import './portrait.css'

/**
 * A colleague's face, large: a human figure with its skin tone, or (in week one) an animal
 * mascot. After the reveal a small badge keeps the week-one mascot beside the person, so the
 * player can follow who was who. The label is what a screen reader says for the picture.
 */
export function Portrait({
  figure,
  label,
  badge,
  size = 'large',
}: {
  figure: string
  label: string
  badge?: string
  size?: 'large' | 'small'
}) {
  return (
    <span
      className={size === 'small' ? 'portrait portrait--small' : 'portrait'}
      role="img"
      aria-label={label}
    >
      <span className="portrait__face" aria-hidden="true">
        {figure}
      </span>
      {badge ? (
        <span className="portrait__badge" aria-hidden="true">
          {badge}
        </span>
      ) : null}
    </span>
  )
}
