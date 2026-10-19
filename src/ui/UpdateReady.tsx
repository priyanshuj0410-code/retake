import { Button } from './Button'
import './update.css'

/**
 * "Update ready": a quiet bar at the foot of the screen when a new version of the app is
 * waiting (EVAL-7). It never reloads on its own; the player taps Update when it suits them, and
 * a season in progress resumes where it was.
 */
export function UpdateReady({
  text,
  button,
  onUpdate,
}: {
  text: string
  button: string
  onUpdate: () => void
}) {
  return (
    <div className="update" role="status">
      <p className="update__text">{text}</p>
      <Button kind="secondary" onClick={onUpdate}>
        {button}
      </Button>
    </div>
  )
}
