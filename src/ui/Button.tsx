import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import './button.css'

/** The hit-stop's hold, in ms. Equal to --dur-hitstop (design-check holds them together). */
export const HIT_STOP_MS = 140

/**
 * A full-width action. Disabled is `aria-disabled`, never `disabled`, so focus stays on it.
 * `stamped` is the committed state shown during the hit-stop.
 */
export function Button(props: {
  children: ReactNode
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  stamped?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      className="button"
      data-variant={props.variant ?? 'primary'}
      data-state={props.stamped ? 'stamped' : 'rest'}
      aria-disabled={props.disabled ? 'true' : undefined}
      aria-label={props.label}
      onClick={() => {
        if (!props.disabled && !props.stamped) props.onPress()
      }}
    >
      <span className="button__label">{props.children}</span>
    </button>
  )
}

/** Commit with a hit-stop: stamp at once, hold for HIT_STOP_MS, then carry on. */
export function useCommit(onDone: () => void): [boolean, () => void] {
  const [stamped, setStamped] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const commit = useCallback(() => {
    setStamped(true)
    timer.current = window.setTimeout(() => {
      setStamped(false)
      done.current()
    }, HIT_STOP_MS)
  }, [])
  return [stamped, commit]
}
