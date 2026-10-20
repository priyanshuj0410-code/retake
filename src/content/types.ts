/**
 * The shape of every content file in content/ (the owner reviews them there, never in code).
 * Text is { en, hi }: English is the source, Hindi is a draft until a native speaker signs it
 * off (content/i18n/hi.json `_status`). A new language adds its key to Text and a file under
 * content/i18n/; any string without it falls back to English.
 */
export type Lang = 'en' | 'hi'
export type Text = { en: string } & Partial<Record<Exclude<Lang, 'en'>, string>>

export type Skin = 'lugdi' | 'station'
export type Ground = 'night' | 'jungle' | 'navy' | 'plum' | 'blood' | 'rail'
export type Area =
  | 'home'
  | 'online'
  | 'road'
  | 'work'
  | 'money'
  | 'sport'
  | 'travel'
  | 'trust'
export type BoardTone = 'yellow' | 'blue' | 'white'

/** A person in the cast. `gender` is read by the scoring only; no component ever receives it. */
export interface CastMember {
  name: Text
  gender: 'w' | 'm'
  /** true when public/art holds pulp-<id>.webp and enamel-<id>.webp; otherwise a monogram. */
  art: boolean
  /** Recurring characters return across the fortnight; new ones appear once. */
  recurring: boolean
}

export interface Stat {
  id: string
  label: Text
}

export interface Rule {
  id: string
  label: Text
  /** The stat that orders people under this rule; 'sum' adds every stat. */
  key: string
}

export interface Voice {
  who: string
  line: Text
  /** Who the voice points at, for the twin's swapped half. Scoring reads it; the UI does not. */
  target?: string
}

export interface Twin {
  id: string
  half: 'a' | 'b'
}

/** Lock a rule, then assign people to slots. */
export interface AssignStep {
  kind: 'assign'
  id: string
  prompt: Text
  stats: Stat[]
  rules: Rule[]
  people: { who: string; values: Record<string, number> }[]
  slots: { id: string; label: Text; value: number }[]
}

/** Choose one option; options can be people (with stats and a loaded quote) or even actions. */
export interface PickStep {
  kind: 'pick'
  id: string
  prompt: Text
  stats?: Stat[]
  options: {
    id: string
    who?: string
    label?: Text
    values?: Record<string, number>
    quote?: Text
    /** The non-gender attributes this option carries; a twin's halves match on it. */
    profile?: string
  }[]
  twin?: Twin
}

/** Spend a budget of checks across candidates, then choose one. */
export interface ChecksStep {
  kind: 'checks'
  id: string
  prompt: Text
  choosePrompt: Text
  budget: number
  checkLabel: Text
  people: { who: string; record: Text; finding: Text; mirror?: string }[]
  voice?: Voice
  twin?: Twin
}

/** Pick a team of `seats`, with a voice and a response to it. */
export interface TeamStep {
  kind: 'team'
  id: string
  prompt: Text
  seats: number
  stat: Stat
  people: { who: string; value: number }[]
  voice: Voice
  responsePrompt: Text
  responses: { id: string; label: Text; restricts: boolean }[]
  twin?: Twin
}

/** Put people in order; optionally lock a rule first. */
export interface RankStep {
  kind: 'rank'
  id: string
  prompt: Text
  positions: Text[]
  rules?: Rule[]
  stats?: Stat[]
  people: { who: string; record: Text; values?: Record<string, number> }[]
}

/** Fill the blanks of two notes from one shared bank of words. */
export interface WordsStep {
  kind: 'words'
  id: string
  prompt: Text
  facts: Text
  template: Text
  people: string[]
  bank: { id: string; text: Text; valence: -1 | 0 | 1 }[]
}

/** Quick-fire keep or cut; items come in mirrored pairs. */
export interface SwipeStep {
  kind: 'swipe'
  id: string
  prompt: Text
  cut: Text
  keep: Text
  items: { id: string; who: string; text: Text; pair: string }[]
}

/** Guess a share of the crowd; scored on closeness. The crowd figure is sample data. */
export interface CrowdStep {
  kind: 'crowd'
  id: string
  prompt: Text
  sample: number
  players: number
  who?: string[]
}

export type Step =
  | AssignStep
  | PickStep
  | ChecksStep
  | TeamStep
  | RankStep
  | WordsStep
  | SwipeStep
  | CrowdStep
export type StepKind = Step['kind']

export interface Masthead {
  series: Text
  no: number
  title: Text
  blurb: Text
  /** Lugdi: a cover painting, public/art/<art>.webp. */
  art?: string
  artPosition?: 'top' | 'centre' | 'bottom'
  roundel?: Text
  /** Station: the board, its colour and the city's own script line (a draft). */
  board?: BoardTone
  script?: string
  city?: Text
}

export interface Reflection {
  twin: string
  prompt: Text
}

export interface Day {
  id: string
  /** 1 to 14: the fortnight's order, Monday of the Lugdi week first. */
  n: number
  skin: Skin
  ground: Ground
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7
  level: number | null
  levelName: Text
  area: Area | null
  object: Text
  transfer?: boolean
  sunday?: boolean
  masthead: Masthead
  steps: Step[]
  reflect?: Reflection
  /** What the owner should know when reviewing this day. Never shown to players. */
  _review?: string
}
