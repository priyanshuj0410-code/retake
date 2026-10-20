import type { Step } from '../content'
import type { Answer } from '../engine/answers'
import type { UiKey } from '../i18n'
import { AssignBoard } from './Assign'
import { ChecksBoard } from './Checks'
import { CrowdBoard } from './Crowd'
import { PickBoard } from './Pick'
import { RankBoard } from './Rank'
import { SwipeBoard } from './Swipe'
import { TeamBoard } from './Team'
import { WordsBoard } from './Words'
import type { BoardProps } from './common'

/** The engine's registry: one board and one commit label per mechanic. */
export const COMMIT: Record<Step['kind'], UiKey> = {
  assign: 'assign.commit',
  pick: 'pick.commit',
  checks: 'checks.commit',
  team: 'team.commit',
  rank: 'rank.commit',
  words: 'words.commit',
  swipe: 'swipe.commit',
  crowd: 'crowd.commit',
}

// Each case narrows the step; the answer belongs to the same step by construction.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = BoardProps<any, any>

export function Board(props: BoardProps<Step, Answer>) {
  const p = props as Any
  switch (props.step.kind) {
    case 'assign':
      return <AssignBoard {...p} />
    case 'pick':
      return <PickBoard {...p} />
    case 'checks':
      return <ChecksBoard {...p} />
    case 'team':
      return <TeamBoard {...p} />
    case 'rank':
      return <RankBoard {...p} />
    case 'words':
      return <WordsBoard {...p} />
    case 'swipe':
      return <SwipeBoard {...p} />
    case 'crowd':
      return <CrowdBoard {...p} />
  }
}

export { SkinContext, useSkin, personView, nameOf } from './common'
