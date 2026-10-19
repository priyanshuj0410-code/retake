/** What the story screens show of a colleague: the mascot before the reveal or, after it, the person. */
import { identity } from '../content'
import type { Lang, T } from '../content/types'
import { fill } from '../engine/text'
import type { ColleagueView, RosterItem } from '../ui'
import { SS } from './content'
import type { StoryRunner } from './runner'
import type { CastMember } from './session'

const toneWords: Record<string, string> = {
  darker: 'darker skin tone',
  lighter: 'lighter skin tone',
}

export function colleagueView(
  r: StoryRunner,
  c: CastMember,
  revealed: boolean,
  description?: string,
): ColleagueView {
  const L = (t: T) => t[r.lang]
  if (!revealed)
    return {
      figure: c.animal,
      figureLabel: L(c.animalName),
      name: c.mascot,
      cues: [],
      description,
    }
  const cues: string[] = []
  if (c.born) cues.push(fill(L(identity.birthplace.label), { city: c.born.city }))
  return {
    figure: (c.sex === 'woman' ? identity.figures.woman : identity.figures.man) + c.toneEmoji,
    figureLabel: `${c.sex}, ${toneWords[c.tone]}`,
    badge: c.animal,
    name: r.displayName(c.slot, true),
    cues,
    description,
  }
}

/** The cast with their running track records, as the roster shows them. */
export function rosterItems(
  r: StoryRunner,
  revealed: boolean,
  extra?: (c: CastMember) => string[],
): RosterItem[] {
  const L = (t: T) => t[r.lang]
  const records = r.records()
  return r.cast.map((c) => {
    const v = colleagueView(r, c, revealed)
    const rec = records.get(c.slot) ?? []
    const lines = [
      ...(extra ? extra(c) : v.cues),
      ...(rec.length
        ? rec.map((e) => `${L(e.role)}: ${L(SS.outcome[String(e.tier)])}`)
        : [L(SS.rosterEmpty)]),
    ]
    return { figure: v.figure, figureLabel: v.figureLabel, badge: v.badge, name: v.name, lines }
  })
}

export const langAttr = (l: Lang) => (l === 'hinglish' ? 'hi-Latn' : 'en-GB')
