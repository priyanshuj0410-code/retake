/**
 * The puzzle engine's answers: what a player's choices on one step are, how an empty answer
 * starts, and when it is complete enough to commit. One entry per mechanic; a new mechanic
 * adds its step type (src/content/types.ts), an answer here, a scorer (score.ts) and a board
 * (src/ui). Answers hold choices only: no times, no order of taps, no keystrokes.
 */
import type {
  AssignStep,
  ChecksStep,
  CrowdStep,
  PickStep,
  RankStep,
  Step,
  SwipeStep,
  TeamStep,
  WordsStep,
} from '../content/types'

export interface AssignAnswer {
  kind: 'assign'
  rule: string | null
  locked: boolean
  slots: Record<string, string | null>
}
export interface PickAnswer {
  kind: 'pick'
  choice: string | null
}
export interface ChecksAnswer {
  kind: 'checks'
  checks: Record<string, number>
  choice: string | null
}
export interface TeamAnswer {
  kind: 'team'
  picked: string[]
  response: string | null
}
export interface RankAnswer {
  kind: 'rank'
  rule: string | null
  locked: boolean
  order: string[]
}
export interface WordsAnswer {
  kind: 'words'
  notes: Record<string, (string | null)[]>
}
export interface SwipeAnswer {
  kind: 'swipe'
  verdicts: Record<string, 'cut' | 'keep'>
}
export interface CrowdAnswer {
  kind: 'crowd'
  guess: number
}

export type Answer =
  | AssignAnswer
  | PickAnswer
  | ChecksAnswer
  | TeamAnswer
  | RankAnswer
  | WordsAnswer
  | SwipeAnswer
  | CrowdAnswer

export type AnswerOf<S extends Step> = S extends AssignStep
  ? AssignAnswer
  : S extends PickStep
    ? PickAnswer
    : S extends ChecksStep
      ? ChecksAnswer
      : S extends TeamStep
        ? TeamAnswer
        : S extends RankStep
          ? RankAnswer
          : S extends WordsStep
            ? WordsAnswer
            : S extends SwipeStep
              ? SwipeAnswer
              : S extends CrowdStep
                ? CrowdAnswer
                : never

export function emptyAnswer(step: Step): Answer {
  switch (step.kind) {
    case 'assign':
      return {
        kind: 'assign',
        rule: null,
        locked: false,
        slots: Object.fromEntries(step.slots.map((s) => [s.id, null])),
      }
    case 'pick':
      return { kind: 'pick', choice: null }
    case 'checks':
      return {
        kind: 'checks',
        checks: Object.fromEntries(step.people.map((p) => [p.who, 0])),
        choice: null,
      }
    case 'team':
      return { kind: 'team', picked: [], response: null }
    case 'rank':
      return { kind: 'rank', rule: null, locked: !step.rules, order: [] }
    case 'words':
      return {
        kind: 'words',
        notes: Object.fromEntries(step.people.map((p) => [p, [null, null]])),
      }
    case 'swipe':
      return { kind: 'swipe', verdicts: {} }
    case 'crowd':
      return { kind: 'crowd', guess: 50 }
  }
}

export function isComplete(step: Step, a: Answer): boolean {
  if (step.kind !== a.kind) return false
  switch (a.kind) {
    case 'assign':
      return a.locked && Object.values(a.slots).every((v) => v !== null)
    case 'pick':
      return a.choice !== null
    case 'checks':
      return a.choice !== null
    case 'team':
      return a.picked.length === (step as TeamStep).seats && a.response !== null
    case 'rank':
      return a.locked && a.order.length === (step as RankStep).people.length
    case 'words':
      return Object.values(a.notes).every((n) => n.every((w) => w !== null))
    case 'swipe':
      return (step as SwipeStep).items.every((i) => a.verdicts[i.id] !== undefined)
    case 'crowd':
      return a.guess >= 0 && a.guess <= 100
  }
}

export const checksUsed = (a: ChecksAnswer) => Object.values(a.checks).reduce((s, n) => s + n, 0)
