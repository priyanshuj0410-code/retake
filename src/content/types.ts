/**
 * The shapes of every content file in content/. Researchers replace content by
 * editing those JSON files; nothing here holds a word of it. scripts/content-check.ts
 * validates every file against these shapes and the rules in the comments.
 *
 * Text is bilingual: `en` is English, `hinglish` is Hinglish in Latin script.
 * A text may hold tokens, resolved per character by src/engine/text.ts:
 *   {name}               the character's display name (first name, plus surname if drawn)
 *   {first}              in a continuation: the name of the character the player put first
 *   {recall}             in an unscored ordinary decision: a character the player staffed earlier
 *   {g:he|she|they}      a word that agrees with the character's sex (man|woman|neutral)
 */
export interface T {
  en: string
  hinglish: string
}

export type Lang = keyof T

export type Family = 'opportunity' | 'npt' | 'conduct'
export type Band = 'male-typed' | 'integrated' | 'female-typed'
export type OppType = 'ranking' | 'allocation'
export type ConductStratum = 'accused-man' | 'accused-woman'
export type Form = 'A' | 'B'

/** One description on a people card. Merit-close to the others on its card, never tied. */
export interface Description {
  id: string
  text: T
}

/**
 * A people card. Four descriptions, fixed across players; only the identity layer and the
 * starting order vary. A ranking card is sorted; an allocation card shares `pool` units.
 */
export interface PeopleCard {
  id: string
  family: Family
  /** The bank the card is drawn from: form A (before the note) or form B (after). */
  form: Form
  /** Opportunity cards: ranking or good-resource allocation. NPT and conduct cards: ranking. */
  type: OppType
  /** Opportunity and NPT cards: the role's planning sex-typing band (P1 rates it; not yet rated). */
  band?: Band
  /** Conduct cards: the accused's sex, fixed for the card. */
  stratum?: ConductStratum
  /** The role, in a few words, for the band audit ("logistics lead"). */
  role: T
  title: T
  prompt: T
  /** Allocation cards: what is shared, and how many units. */
  unit?: T
  pool?: number
  descriptions: [Description, Description, Description, Description]
  /** The fixed, never evaluative narrative line after the card. Identical whatever the cues. */
  continuation: T
}

export interface OrdinaryOption {
  id: string
  text: T
  /** Season points. Ignored when the decision is unscored. */
  effect: number
}

/** A budget, vendor, schedule or risk decision. The season is decided by the scored ones only. */
export interface OrdinaryDecision {
  id: string
  kind: 'budget' | 'vendor' | 'schedule' | 'risk'
  scored: boolean
  title: T
  body: T
  options: OrdinaryOption[]
  continuation: T
  /** Shown in the first-week tutorial. */
  tutorial?: boolean
}

/** A Committee Inbox incident: harassment under the 2013 Act, or a legal near-miss. */
export interface InboxIncident {
  id: string
  kind: 'harassment' | 'near-miss'
  severity: 'lower' | 'middle' | 'higher'
  text: T
}

/** A matched-survey item. The fair answer sits at a scale end. */
export interface SurveyItem {
  id: string
  family: 'opportunity' | 'conduct'
  /** Which end is fair: agree-fair puts the fair answer at "strongly agree". */
  keying: 'agree-fair' | 'disagree-fair'
  /** disagree-fair items only: whom the unfair (agree) answer favours. */
  unfairFavours?: 'men' | 'women'
  /** Asked twice, apart within the survey (a repeat pair). A real item, never an instructed one. */
  repeat: boolean
  text: T
}

export interface ScreeningItem {
  id: string
  format: 'direct' | 'vignette'
  text: T
  /** Direct items: which end of the five-point agreement scale is fair. */
  keying?: 'agree-fair' | 'disagree-fair'
  /** Vignettes list their own options, each with its fairness from 0 (least) to 1 (fairest). */
  options?: { id: string; text: T; fairness: number }[]
}

/** A crosswise statement. Records carry only the item id, the answer, the subsample and a label. */
export interface CrosswiseItem {
  id: string
  text: T
}

export interface NoteText {
  id: 'a' | 'b' | 'c'
  statistic: T
  source: T
  instruction: T
  /** True until the statistic is sourced and verified. Shown in demo mode only. */
  placeholder: boolean
}
