/**
 * The season stories' content (content/story.json), typed. Researchers edit the JSON, never
 * this file. scripts/story-check.ts validates it against these shapes and the story rules.
 */
import raw from '../../content/story.json'
import type { T } from '../content/types'

export type Tier = 1 | 2 | 3

export interface StoryDescription {
  id: string
  /** The description's merit for this job, set by the builder (P1 rates it): 3 strong, 2 tied, 1 weaker. */
  tier: Tier
  text: T
}

/**
 * The tie structure of a people beat: which characters carry the equally strong notes.
 * - mixed: a rank of two rival pairs (one woman and one man each), each pair tied.
 * - same: a rank of two women and two men, the women tied and the men tied.
 * - rival: a pick between, or a split led by, one rival pair carrying tied notes.
 * - clear: a pick between two colleagues whose notes differ clearly.
 * - oneoff: one-off characters, not the cast: a rank of a caste pair and a birthplace pair, or a
 *   pick or split led by one tied pair differing on `cue` (same sex, the medium tone).
 */
export type Shape = 'mixed' | 'same' | 'rival' | 'clear' | 'oneoff'

export type Domain = 'hiring' | 'conduct' | 'resources'

export interface PeopleBeat {
  id: string
  episode: number
  /** Played before the reveal: colleagues shown as their animal mascots. */
  mascot?: boolean
  kind: 'rank' | 'pick' | 'split'
  shape: Shape
  /** npt: the split shares work nobody wants, so fewer units is the better share. conduct: whose account or concern is taken up. */
  family: 'opportunity' | 'npt' | 'conduct'
  /** The result page's area: hiring and promotion, complaints and conduct, sharing resources. */
  domain: Domain
  /** B: played after the mid-season note (the faking test's form B); never in the rating. */
  form?: 'B'
  /** oneoff beats: who the one-offs are, and which cue their tied pair carries. */
  oneoff?: string
  cue?: 'caste' | 'born'
  role: T
  scene: T
  question: T
  unit?: T
  pool?: number
  descriptions: StoryDescription[]
  /** The consequence on the next screen, keyed by the merit tier of the lead's notes ("even" for an even split). */
  after: Record<string, T>
}

export interface OrdinaryBeat {
  id: string
  episode: number
  mascot?: boolean
  kind: 'ordinary'
  type: 'budget' | 'vendor' | 'schedule' | 'risk'
  scene: T
  question: T
  options: { id: string; effect: number; text: T; after: T }[]
}

export type Beat = PeopleBeat | OrdinaryBeat

export interface Story {
  id: string
  built: boolean
  emoji: string
  title: T
  premise: T
  company?: T
  intro?: T[]
  episodes?: { title: T; premise: T; interlude?: { after: string; text: T } }[]
  mascots?: T
  reveal?: { title: T; body: T; line: T; go: T }
  beats?: Beat[]
}

export interface StoryContent {
  status: string
  stories: Story[]
  screens: Record<string, unknown> & {
    outcome: Record<string, T>
    bands: { min: number; text: T }[]
    surveyKey: T[]
    debrief: T[]
    consent: T[]
  }
  rating: Record<string, unknown>
}

export const storyContent = raw as unknown as StoryContent
export const stories = storyContent.stories
export const storyById = (id: string) => stories.find((s) => s.id === id)
/** A story screen's text by key. */
export const SS = storyContent.screens as unknown as Record<string, T> & StoryContent['screens']
export const RT = storyContent.rating as unknown as Record<string, T> & {
  bands: Record<'lean' | 'none' | 'unread' | 'unengaged', { name: T; body: T }>
  zone: Record<'lean' | 'none' | 'unread', T>
  meaning: Record<'lean' | 'none' | 'unread', T>
  cueShort: Record<string, T>
  cues: Record<string, Record<string, T>>
  cards: Record<string, T>
  domains: Record<Domain, { title: T; narrative: T; origin: T[]; watch: T[] }>
}
export const isPeople = (b: Beat): b is PeopleBeat => b.kind !== 'ordinary'
export const PF = (raw as unknown as { profile: Record<string, T> & { researchConsent: T[] } })
  .profile
