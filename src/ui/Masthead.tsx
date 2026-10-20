import './masthead.css'

/**
 * The top of a day. Lugdi: the pulp cover, with the title on a solid band (so its contrast is
 * real, never over the painting) and the painting beneath it as decoration. Station: the
 * enamel board, with the city's own script line above the title, as real boards stack them.
 * The title is the screen's h1.
 */
export function Masthead(props: {
  skin: 'lugdi' | 'station'
  title: string
  blurb: string
  art?: string
  artPosition?: 'top' | 'centre' | 'bottom'
  roundel?: string
  board?: 'yellow' | 'blue' | 'white'
  script?: string
  scriptLang?: string
  city?: string
}) {
  if (props.skin === 'lugdi')
    return (
      <section className="masthead">
        <div className="masthead__band">
          <h1 className="masthead__title">{props.title}</h1>
          <p className="masthead__blurb">{props.blurb}</p>
          {props.roundel ? (
            <span className="masthead__roundel" aria-hidden="true">
              {props.roundel}
            </span>
          ) : null}
        </div>
        {props.art ? (
          <div
            className="masthead__art"
            data-pos={props.artPosition ?? 'centre'}
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}art/${props.art}.webp)` }}
            aria-hidden="true"
          />
        ) : null}
      </section>
    )
  return (
    <section className="masthead">
      <div className="board" data-tone={props.board ?? 'yellow'}>
        {props.script ? (
          <p className="board__script" lang={props.scriptLang}>
            {props.script}
          </p>
        ) : null}
        <h1 className="board__title">{props.title}</h1>
        {props.city ? <p className="board__city">{props.city}</p> : null}
        <p className="board__sub">{props.blurb}</p>
      </div>
    </section>
  )
}
