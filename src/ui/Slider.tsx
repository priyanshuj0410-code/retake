import { useId } from 'react'
import './slider.css'

/** A guess from 0 to 100 per cent, in steps of 5, with the number shown large. */
export function Slider(props: { label: string; caption: string; value: number; onChange: (n: number) => void }) {
  const id = useId()
  return (
    <div className="slider">
      <label className="slider__label" htmlFor={id}>
        {props.caption}
      </label>
      <output className="slider__value" htmlFor={id} aria-live="polite">
        {props.value}%
      </output>
      <input
        id={id}
        className="slider__input"
        type="range"
        min={0}
        max={100}
        step={5}
        value={props.value}
        aria-label={props.label}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <span className="slider__scale" aria-hidden="true">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </span>
    </div>
  )
}
