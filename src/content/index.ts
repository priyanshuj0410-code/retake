/** Every content file, typed. The days are listed here in the fortnight's order. */
import castJson from '../../content/cast.json'
import handlesJson from '../../content/handles.json'
import sampleJson from '../../content/sample.json'
import d01 from '../../content/days/01-lugdi-mon.json'
import d02 from '../../content/days/02-lugdi-tue.json'
import d03 from '../../content/days/03-lugdi-wed.json'
import d04 from '../../content/days/04-lugdi-thu.json'
import d05 from '../../content/days/05-lugdi-fri.json'
import d06 from '../../content/days/06-lugdi-sat.json'
import d07 from '../../content/days/07-lugdi-sun.json'
import d08 from '../../content/days/08-station-mon.json'
import d09 from '../../content/days/09-station-tue.json'
import d10 from '../../content/days/10-station-wed.json'
import d11 from '../../content/days/11-station-thu.json'
import d12 from '../../content/days/12-station-fri.json'
import d13 from '../../content/days/13-station-sat.json'
import d14 from '../../content/days/14-station-sun.json'
import type { CastMember, Day, Step, Text } from './types'

export const DAYS = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14] as Day[]

export const dayByN = (n: number): Day => DAYS[n - 1]
export const dayById = (id: string): Day | undefined => DAYS.find((d) => d.id === id)

const { _review: _castReview, ...castEntries } = castJson as unknown as Record<string, unknown>
void _castReview
export const CAST = castEntries as Record<string, CastMember>

export const cast = (who: string): CastMember => {
  const c = CAST[who]
  if (!c) throw new Error(`unknown cast member ${who}`)
  return c
}

export interface HandleWord {
  id: string
  en: string
  hi: string
  joiner?: Text
}
export const HANDLE_WORDS = handlesJson as unknown as { first: HandleWord[]; second: HandleWord[] }

export const SAMPLE = sampleJson as {
  players: number
  named: number
  seed: number
  topPractice: number
  medianPractice: number
}

/** Every step of the fortnight with the day it belongs to. */
export const allSteps = (): { day: Day; step: Step }[] =>
  DAYS.flatMap((day) => day.steps.map((step) => ({ day, step })))

/** The two halves of a twin, as content. */
export function twinHalves(id: string) {
  const halves = allSteps().filter(({ step }) => 'twin' in step && step.twin?.id === id)
  const a = halves.find(({ step }) => 'twin' in step && step.twin?.half === 'a')
  const b = halves.find(({ step }) => 'twin' in step && step.twin?.half === 'b')
  return { a, b }
}

export type * from './types'
