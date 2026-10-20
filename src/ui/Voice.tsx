import { Portrait } from './Portrait'
import './voice.css'

/** A character's line pressing on the decision (a protective or pressure voice). */
export function Voice(props: { id: string; name: string; art: boolean; skin: 'lugdi' | 'station'; line: string }) {
  return (
    <figure className="voice">
      <Portrait id={props.id} name={props.name} art={props.art} skin={props.skin} size="s" round />
      <blockquote className="voice__line">
        <span className="voice__who">{props.name}: </span>
        {props.line}
      </blockquote>
    </figure>
  )
}
