import { useRef, useState } from 'react'
import { Portrait } from './Portrait'
import { Button } from './Button'
import './swipe.css'

/**
 * Quick-fire keep or cut: drag the card left or right, or use the two buttons (the always
 * working path, and the keyboard one). No timer runs; the count only says how many are left.
 */
export function Swipe(props: {
  item: { id: string; who: string; name: string; art: boolean; text: string }
  skin: 'lugdi' | 'station'
  progress: string
  cut: string
  keep: string
  onVerdict: (v: 'cut' | 'keep') => void
}) {
  const [dx, setDx] = useState(0)
  const [drag, setDrag] = useState(false)
  const start = useRef<number | null>(null)
  const width = useRef(1)
  const end = () => {
    if (start.current === null) return
    const v = dx / width.current
    start.current = null
    setDrag(false)
    setDx(0)
    if (v < -0.3) props.onVerdict('cut')
    else if (v > 0.3) props.onVerdict('keep')
  }
  return (
    <div className="swipe">
      <p className="swipe__progress" aria-live="polite">
        {props.progress}
      </p>
      <div className="swipe__deck">
        <div
          className="swipe__card"
          key={props.item.id}
          data-dragging={drag ? 'true' : 'false'}
          style={{ transform: `translateX(${dx}px) rotate(${dx / 30}deg)` }}
          onPointerDown={(e) => {
            start.current = e.clientX
            width.current = e.currentTarget.getBoundingClientRect().width
            e.currentTarget.setPointerCapture(e.pointerId)
            setDrag(true)
          }}
          onPointerMove={(e) => {
            if (start.current !== null) setDx(e.clientX - start.current)
          }}
          onPointerUp={end}
          onPointerCancel={end}
        >
          <Portrait id={props.item.who} name={props.item.name} art={props.item.art} skin={props.skin} size="l" />
          <p className="swipe__text">{props.item.text}</p>
        </div>
      </div>
      <div className="swipe__actions" role="group" aria-label={props.progress} data-options="">
        <Button variant="secondary" onPress={() => props.onVerdict('cut')}>
          {props.cut}
        </Button>
        <Button variant="secondary" onPress={() => props.onVerdict('keep')}>
          {props.keep}
        </Button>
      </div>
    </div>
  )
}
