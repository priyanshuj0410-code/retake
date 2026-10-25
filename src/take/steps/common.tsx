import { useState, type ReactNode } from 'react'
import { TAKE, type Bi, type Step } from '../data'
import { useLabel } from '../lang'
import { AppFrame, Main, Progress, Topbar, useMoreCue } from '../parts'
import { useSound, type Fx } from '../sound'

/** What a decision's commit hands back: a name, a set of names, an order, or the chores each person was given (with
 * which chore went to whom, so a revisited Split shows them). Kept with the hash of the decision it answered (s,
 * store.SIG). */
export type Answer = (
  | { pick: string | null }
  | { set: string[] }
  | { order: string[] }
  | { chores: Record<string, number>; given?: Record<number, string> }
) & { s?: string }

export interface StepProps {
  s: Step
  onCommit: (a: Answer) => void
  help: boolean
  onHelp: (open: boolean) => void
  /** The top bar's Back (R-STEP-9): the previous step, read-only, or the chapter's title card. */
  onBack: () => void
  /** A step already committed, shown again read-only with its answer and a lock (R-STEP-9). */
  revisit?: { answer: Answer | undefined; onReturn: () => void }
}

/** The answer a revisited step starts from, of the shape this kind keeps. */
export const was = <K extends 'pick' | 'set' | 'order' | 'chores'>(props: StepProps, k: K) => {
  const a = props.revisit?.answer
  return a && k in a ? (a as Extract<Answer, Record<K, unknown>>) : null
}

/** Cards come in a new order on every load, as for a player (the demo's data-shuffle): once, when the screen opens. */
export function useShuffled<T>(items: T[]): T[] {
  const [order] = useState(() => {
    const k = [...items]
    for (let i = k.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[k[i], k[j]] = [k[j], k[i]]
    }
    return k
  })
  return order
}

export const useFx = (world: string) => {
  const { sound } = useSound()
  return (id: Fx) => sound.fx(world, id)
}

/** A step's frame (first_take.frame, in the app frame): top bar with the world's plate, progress, the parts, the one main
 * button. */
export function Frame(props: StepProps & { cls: string; children: ReactNode; button: Bi; live: boolean; commit: () => void }) {
  const { s } = props
  const fx = useFx(s.world)
  const [chapter, step, steps] = s.prog
  const cue = useMoreCue()
  const label = useLabel()
  const back = props.revisit
  return (
    <AppFrame
      world={s.world}
      kind="step"
      // a revisited step is read-only: picks keep their chosen look with a lock (library.css .is-revisited)
      cls={`${props.cls}${back ? ' is-revisited' : ''}`}
      label={label([`${step} of ${steps}: ${s.title}`, `${TAKE.worlds[s.world].title[1]}, ${steps} में से ${step}`])}
      art={s.art}
      help={props.help}
      onHelp={props.onHelp}
    >
      <Topbar plate={s.plate} onHelp={props.onHelp} onBack={props.onBack} />
      <div className={`scr-body${cue.more ? ' has-more' : ''}`} ref={cue.ref}>
        <Progress chapter={chapter} step={step} steps={steps} />
        {props.children}
      </div>
      {cue.node}
      {back ? (
        // the one way on from a revisited step: back to where the player is (R-STEP-9's secondary-style button)
        <Main t={['Go to the current step', 'मौजूदा सवाल पर जाएँ']} live out onGo={back.onReturn} />
      ) : (
        <Main
          t={props.button}
          live={props.live}
          refuse={() => fx('refuse')}
          onGo={() => {
            fx('commit')
            props.commit()
          }}
        />
      )}
    </AppFrame>
  )
}

