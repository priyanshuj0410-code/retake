import { useId } from 'react'
import './beat.css'

/**
 * The top of a story screen: what came of the last decision (its consequence, then the answer
 * restated), the new scene, and the question as the screen's h1. Focus lands on the h1, which
 * names the rest as its description, so a screen reader hears the question and then what
 * happened.
 */
export function Beat({
  then,
  answer,
  scene,
  question,
}: {
  then?: string
  answer?: string
  scene?: string
  question: string
}) {
  const id = useId()
  const ids = [then ? `${id}-t` : '', scene ? `${id}-s` : ''].filter(Boolean).join(' ')
  return (
    <div className="beat">
      {then ? (
        <div className="beat__then" id={`${id}-t`}>
          <p className="beat__consequence">{then}</p>
          {answer ? <p className="beat__answer">{answer}</p> : null}
        </div>
      ) : null}
      {scene ? (
        <p className="beat__scene" id={`${id}-s`}>
          {scene}
        </p>
      ) : null}
      <h1 className="beat__question" aria-describedby={ids || undefined}>
        {question}
      </h1>
    </div>
  )
}
