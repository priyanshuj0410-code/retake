/** What the story screens show of a colleague: the mascot before the reveal or, after it, the person. */
import { identity } from '../content'
import type { Lang, T } from '../content/types'
import { fill } from '../engine/text'
import type { CastTile, ColleagueView } from '../ui'
import { SS } from './content'
import { lookLabel, mascotLook, personLook } from './looks'
import type { StoryRunner } from './runner'
import type { CastMember } from './session'

export function colleagueView(
  r: StoryRunner,
  c: CastMember,
  revealed: boolean,
  description?: string,
): ColleagueView {
  const L = (t: T) => t[r.lang]
  const mascot = mascotLook(c)
  if (!revealed && mascot)
    return {
      look: mascot,
      figureLabel: L(c.animalName),
      name: c.mascot,
      cues: [],
      description,
    }
  const cues: string[] = []
  if (c.born) cues.push(fill(L(identity.birthplace.label), { city: c.born.city }))
  const look = personLook(c)
  return {
    look,
    figureLabel: lookLabel(c, look),
    inset: mascot,
    name: r.displayName(c.slot, true),
    cues,
    description,
  }
}

/** The cast as panels: mascots before the reveal, people (with the mascot inset) after it. */
export function castTiles(
  r: StoryRunner,
  revealed: boolean,
  lines: (c: CastMember) => string[] = () => [],
): CastTile[] {
  return r.cast.map((c) => {
    const v = colleagueView(r, c, revealed)
    return { look: v.look, label: v.figureLabel, inset: v.inset, name: v.name, lines: lines(c) }
  })
}

/** The jobs each colleague led this season, for the season's end. */
export function trackLines(r: StoryRunner): (c: CastMember) => string[] {
  const L = (t: T) => t[r.lang]
  const records = r.records()
  return (c) => {
    const rec = records.get(c.slot) ?? []
    return [rec.length ? rec.map((e) => L(e.role)).join(', ') : L(SS.rosterEmpty)]
  }
}

export const langAttr = (l: Lang) => (l === 'hinglish' ? 'hi-Latn' : 'en-GB')
