/**
 * The season stories' content (content/story.json), typed. Researchers edit the JSON, never
 * this file. scripts/story-check.ts validates it against these shapes and the story rules.
 */
import raw from '../../content/story.json'
import type { T } from '../content/types'
import type { Animal, ArtKey } from '../ui'

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
  /** The season card's drawn cover panel. */
  art: ArtKey
  title: T
  premise: T
  company?: T
  intro?: T[]
  episodes?: {
    title: T
    premise: T
    /** The interlude as a strip of two or three drawn panels, each with its caption (retired by the chapters, EVAL-8). */
    interlude?: { after: string; panels: { art: ArtKey; text: T }[] }
    /** The chapter's opening line, the first card's top caption: 25 words or fewer (PENDING v21). */
    opening: T
    /** The chapter's payoff strip: three panels following two colleagues ({a}, {b}), the same for every player. */
    payoff: { art: ArtKey; text: T }[]
  }[]
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
    rankStamps: T[]
    debrief: T[]
    consent: T[]
    startPoints: { icon: string; text: T }[]
  }
  rating: Record<string, unknown>
}

export const storyContent = raw as unknown as StoryContent
export const stories = storyContent.stories
export const storyById = (id: string) => stories.find((s) => s.id === id)
/** A story screen's text by key. */
export const SS = storyContent.screens as unknown as Record<string, T> & StoryContent['screens']
export const RT = storyContent.rating as unknown as Record<string, T> & {
  /** The five tags (EVAL-10): Clear pattern, Pattern, Maybe a pattern, No pattern, Not enough to tell. */
  tags: Record<'strong' | 'moderate' | 'possible' | 'none' | 'unread', T>
  tagBodies: Record<'strong' | 'moderate' | 'possible' | 'none', T>
  /** A forming reading (EVAL-10, owner): never a dead end. */
  forming: Record<
    | 'title'
    | 'unread'
    | 'unengaged'
    | 'next'
    | 'left'
    | 'leftOne'
    | 'notYet'
    | 'pairs'
    | 'start'
    | 'save',
    T
  >
  rangeWords: Record<
    'mostlyMen' | 'slightlyMen' | 'equal' | 'slightlyWomen' | 'mostlyWomen' | 'between' | 'around',
    T
  >
  /** Range words for skin tone and religion (EVAL-12): left is the comparison group first. */
  rangeWordsCues: Record<
    'tone' | 'religion',
    Record<'mostlyLeft' | 'slightlyLeft' | 'equal' | 'slightlyRight' | 'mostlyRight', T>
  >
  meaning: Record<'lean' | 'none' | 'unread', T>
  cueShort: Record<string, T>
  cues: Record<string, Record<string, T>>
  cards: Record<string, T>
  domains: Record<Domain, { title: T; narrative: T; origin: T[]; watch: T[] }>
}
export const isPeople = (b: Beat): b is PeopleBeat => b.kind !== 'ordinary'
export const PF = (
  raw as unknown as {
    profile: Record<string, T> & {
      researchConsent: T[]
      labels: Record<string, T>
      ends: Record<string, { left: T; right: T }>
    }
  }
).profile

/** The landing page, sign-in and "How this works" (EVAL-12). */
export const LD = (
  raw as unknown as {
    landing: Record<string, T> & {
      points: { icon: string; text: T }[]
      howMeasured: T[]
      howPrivacy: T[]
      lost: T[]
      _devDemoCode: string
    }
  }
).landing

/** One practice item (EVAL-10): the mascots doing something that is not work, with no cue. */
export interface PracticeItem {
  kind: 'rank' | 'split' | 'pick'
  /** The mascot animal on each card, and its name as shown ("Bear"). */
  animals: { animal: Animal; name: T; text: T }[]
  scene: T
  question: T
  hint: T
  pool?: number
}

/** The opt-in practice round: offered once at the start, never recorded or scored. */
export const PRACTICE = (
  raw as unknown as {
    practice: {
      offer: T
      offerBody: T
      practise: T
      start: T
      label: T
      items: PracticeItem[]
    }
  }
).practice

/** A split card's pool (EVAL-10): every split sets its own; there is no default (content-check). */
export function poolOf(b: { id?: string; pool?: number }): number {
  if (!b.pool) throw new Error(`split ${b.id ?? ''} has no pool`)
  return b.pool
}
