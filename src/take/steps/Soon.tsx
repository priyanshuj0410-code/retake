import { T } from '../lang'
import { Question, Voice } from '../parts'
import { Frame, type StepProps } from './common'

/** A decision kind the app does not draw yet (M1): its question and voice, and a way on. Never shipped to players. */
export function Soon(props: StepProps) {
  return (
    <Frame {...props} cls="" button={['Next', 'आगे']} live commit={() => props.onCommit({ pick: null })}>
      <Question s={props.s} id={`soon-${props.s.id}`} />
      <Voice s={props.s} />
      <T as="p" t={[`Build in progress: ${props.s.rawKind}`, `बन रहा है: ${props.s.rawKind}`]} className="nextline" />
    </Frame>
  )
}
