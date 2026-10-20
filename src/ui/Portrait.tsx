import './portrait.css'

/**
 * A cast portrait in the skin's art (public/art/pulp-<id>.webp or enamel-<id>.webp), or a
 * monogram plate for a new character who has no portrait yet. Decorative: the name is always
 * written beside it.
 */
export function Portrait(props: {
  id: string
  name: string
  art: boolean
  skin: 'lugdi' | 'station'
  size?: 's' | 'm' | 'l' | 'fill'
  round?: boolean
}) {
  const size = props.size ?? 'm'
  if (!props.art)
    return (
      <span className="portrait portrait__mono" data-size={size} data-round={props.round ? 'true' : 'false'} aria-hidden="true">
        {props.name.slice(0, 1)}
      </span>
    )
  const src = `${import.meta.env.BASE_URL}art/${props.skin === 'lugdi' ? 'pulp' : 'enamel'}-${props.id}.webp`
  return (
    <img
      className="portrait"
      data-size={size}
      data-round={props.round ? 'true' : 'false'}
      src={src}
      alt=""
      width={340}
      height={340}
      loading="lazy"
      decoding="async"
    />
  )
}
