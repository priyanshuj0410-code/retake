import { useId } from 'react'
import { Caption, Panel, Then } from './Comic'
import type { Look } from './portraitArt'
import './beat.css'

export interface BeatThen {
  text: string
  answer?: string
  look?: Look
  label?: string
}

/**
 * The top of a story screen, in the comic register: what came of the last decision as a small
 * "then" panel (smaller than the new scene, so the hierarchy runs forwards), then the new scene
 * in a panel, its narration in a yellow caption and the question as the screen's h1. Focus
 * lands on the h1, which names the rest as its description, so a screen reader hears the
 * question and then what happened.
 */
export function Beat({
  then,
  scene,
  question,
}: {
  then?: BeatThen
  scene?: string
  question: string
}) {
  const id = useId()
  const ids = [then ? `${id}-t` : '', scene ? `${id}-s` : ''].filter(Boolean).join(' ')
  return (
    <div className="beat">
      {then ? <Then id={`${id}-t`} {...then} /> : null}
      <Panel>
        {scene ? <Caption id={`${id}-s`}>{scene}</Caption> : null}
        <h1 className="beat__question" aria-describedby={ids || undefined}>
          {question}
        </h1>
      </Panel>
    </div>
  )
}
