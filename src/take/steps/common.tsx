import { useMemo, useState, type ReactNode } from 'react'
import type { Bi, Step } from '../data'
import { AppFrame, Main, Progress, Topbar } from '../parts'
import { useSound, type Fx } from '../sound'

/** What a decision's commit hands back: a name, a set of names, an order, or the chores each person was given. */
export type Answer = { pick: string | null } | { set: string[] } | { order: string[] } | { chores: Record<string, number> }

export interface StepProps {
  s: Step
  onCommit: (a: Answer) => void
  help: boolean
  onHelp: (open: boolean) => void
}

/** Cards come in a new order on every load, as for a player (the demo's data-shuffle). */
export function useShuffled<T>(items: T[]): T[] {
  return useMemo(() => {
    const k = [...items]
    for (let i = k.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[k[i], k[j]] = [k[j], k[i]]
    }
    return k
  }, [items])
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
  return (
    <AppFrame world={s.world} kind="step" cls={props.cls} label={`${step} of ${steps}: ${s.title}`} art={s.art} help={props.help} onHelp={props.onHelp}>
      <Topbar plate={s.plate} onHelp={props.onHelp} />
      <div className="scr-body">
        <Progress chapter={chapter} step={step} steps={steps} />
        {props.children}
      </div>
      <Main
        t={props.button}
        live={props.live}
        refuse={() => fx('refuse')}
        onGo={() => {
          fx('commit')
          props.commit()
        }}
      />
    </AppFrame>
  )
}

export const useToggle = () => useState<string[]>([])
