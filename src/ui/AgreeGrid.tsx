import { useId } from 'react'
import './agree.css'

/**
 * Agree or disagree statements on one screen, as a compact grid. Each statement is its own
 * fieldset (the statement is the legend) with five native radios in one row, numbered 1 to 5;
 * each radio's name carries its full point ("1, Strongly disagree"), and the key gives the words
 * once, in a header that stays at the top of the screen while the statements scroll under it
 * (never repeated under each row). At 320 px the five points still fit one row at 44 px or more.
 * Keyboard: Tab between statements, arrows within one, as native radios do.
 */
export function AgreeGrid({
  items,
  scale,
  scaleHelp,
  value,
  onChange,
  keyLabel,
}: {
  /** `help`: the statement in Hinglish under it (EVAL-10's help mode). */
  items: { id: string; text: string; help?: string }[]
  scale: string[]
  /** The scale's words in Hinglish, under each in the key, in the help mode (EVAL-10). */
  scaleHelp?: string[]
  value: Record<string, number>
  onChange: (v: Record<string, number>) => void
  keyLabel: string
}) {
  const base = useId()
  return (
    <div className="agree">
      <p className="agree__key" aria-label={keyLabel}>
        {scale.map((s, i) => (
          <span className="agree__keyitem" key={s}>
            {i + 1} {s}
            {scaleHelp?.[i] ? (
              <span className="agree__help" lang="hi-Latn">
                {scaleHelp[i]}
              </span>
            ) : null}
          </span>
        ))}
      </p>
      {items.map((it, n) => (
        <fieldset className="agree__item" key={it.id}>
          <legend className="agree__statement">
            {n + 1}. {it.text}
            {it.help ? (
              <span className="agree__help" lang="hi-Latn">
                {it.help}
              </span>
            ) : null}
          </legend>
          <div className="agree__points">
            {scale.map((s, i) => (
              <label
                className={value[it.id] === i ? 'agree__point agree__point--on' : 'agree__point'}
                key={s}
              >
                <input
                  className="agree__input"
                  type="radio"
                  name={`${base}-${it.id}`}
                  value={i}
                  checked={value[it.id] === i}
                  onChange={() => onChange({ ...value, [it.id]: i })}
                />
                <span aria-hidden="true">{i + 1}</span>
                <span className="agree__sr">{`${i + 1}, ${s}`}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
