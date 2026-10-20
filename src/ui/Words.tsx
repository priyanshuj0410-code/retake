import { Fragment } from 'react'
import { Portrait } from './Portrait'
import './words.css'

/** A note with blanks; each blank is a button that selects it for the next word. */
export function WordNote(props: {
  id: string
  name: string
  art: boolean
  skin: 'lugdi' | 'station'
  parts: string[]
  blanks: { text: string | null; label: string; active: boolean }[]
  onBlank: (i: number) => void
}) {
  return (
    <div className="note">
      <Portrait id={props.id} name={props.name} art={props.art} skin={props.skin} size="s" />
      <p className="note__text">
        {props.parts.map((p, i) => (
          <Fragment key={i}>
            {p}
            {i < props.blanks.length ? (
              <button
                type="button"
                className="note__blank"
                aria-pressed={props.blanks[i].active}
                aria-label={`${props.blanks[i].label}${props.blanks[i].text ? `: ${props.blanks[i].text}` : ''}`}
                onClick={() => props.onBlank(i)}
              >
                {props.blanks[i].text ?? ' '}
              </button>
            ) : null}
          </Fragment>
        ))}
      </p>
    </div>
  )
}

/** The shared word bank: every word fits either note. */
export function WordBank(props: {
  label: string
  words: { id: string; text: string }[]
  disabled: boolean
  onWord: (id: string) => void
}) {
  return (
    <div className="bank" role="group" aria-label={props.label} data-options="">
      {props.words.map((w) => (
        <button
          type="button"
          key={w.id}
          className="bank__word"
          aria-disabled={props.disabled ? 'true' : undefined}
          onClick={() => {
            if (!props.disabled) props.onWord(w.id)
          }}
        >
          {w.text}
        </button>
      ))}
    </div>
  )
}
