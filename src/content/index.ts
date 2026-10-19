/** Every content file, typed. Researchers edit content/, never this file. */
import { seasonSentence3 } from '../engine/config'
import opportunity from '../../content/cards/opportunity.json'
import conduct from '../../content/cards/conduct.json'
import npt from '../../content/cards/npt.json'
import ordinary from '../../content/ordinary.json'
import inbox from '../../content/inbox.json'
import survey from '../../content/survey.json'
import directBlock from '../../content/direct-block.json'
import screening from '../../content/screening.json'
import crosswise from '../../content/crosswise.json'
import notes from '../../content/notes.json'
import identity from '../../content/identity.json'
import disclosure from '../../content/disclosure.json'
import screens from '../../content/screens.json'
import type {
  CrosswiseItem,
  InboxIncident,
  NoteText,
  OrdinaryDecision,
  PeopleCard,
  ScreeningItem,
  SurveyItem,
  T,
} from './types'

export const cards = [
  ...(opportunity as PeopleCard[]),
  ...(npt as PeopleCard[]),
  ...(conduct as PeopleCard[]),
]
export const cardById = new Map(cards.map((c) => [c.id, c]))
export const ordinaryBank = ordinary as OrdinaryDecision[]
export const inboxBank = inbox as InboxIncident[]
export const surveyItems = (survey as { items: SurveyItem[] }).items
export const directItems = (directBlock as { items: SurveyItem[] }).items
export const screeningItems = (screening as { items: ScreeningItem[] }).items
export const notesById = new Map((notes as NoteText[]).map((n) => [n.id, n]))

export interface CrosswiseContent {
  randomiser: T
  randomiserQuestion: { low: T; high: T }
  answers: { same: T; different: T }
  instructions: T
  practice: { fictionalRandomiser: T; direct: CrosswiseItem[]; crosswise: CrosswiseItem[] }
  anchor: CrosswiseItem
  knownZero: CrosswiseItem
  m1hControls: CrosswiseItem[]
  m1hStatements: CrosswiseItem[]
  m3Items: CrosswiseItem[]
  rcItems: CrosswiseItem[]
  neutral: CrosswiseItem[]
}
export const xw = crosswise as CrosswiseContent
export { identity, disclosure, screens }
export const registeredSentences = disclosure.registered as Record<'en' | 'hinglish', string[]>

/**
 * The disclosure's four sentences: the registered four, or for the season story the four with
 * sentence 3 replaced by the interim line in src/engine/config.ts (seasonSentence3), which
 * awaits the owner's wording; it is never a placeholder.
 */
export const sentencesFor = (l: 'en' | 'hinglish', season: boolean): string[] =>
  season
    ? registeredSentences[l].map((s, i) => (i === 2 ? seasonSentence3[l] : s))
    : registeredSentences[l]
