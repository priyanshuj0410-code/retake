import { Button } from './Button'
import './update.css'

/** A new version is waiting: nothing reloads until the player taps. */
export function UpdateReady(props: { text: string; button: string; onUpdate: () => void }) {
  return (
    <div className="update" role="status">
      <p className="update__text">{props.text}</p>
      <Button onPress={props.onUpdate}>{props.button}</Button>
    </div>
  )
}
