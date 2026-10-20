/** What the story screens show of a colleague: the mascot before the reveal or, after it, the person. */
import { identity } from '../content'
import type { Lang, T } from '../content/types'
import { fill } from '../engine/text'
import type { ArtKey, CastTile, ColleagueView } from '../ui'
import { SS } from './content'
import { lookLabel, mascotLook, personLook } from './looks'
import type { StoryRunner } from './runner'
import type { CastMember } from './session'

export function colleagueView(
  r: StoryRunner,
  c: CastMember,
  revealed: boolean,
  description?: string,
  /** The mascot beside the face: on the reveal only, as the bridge; never after it. */
  withInset = false,
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
  const look = personLook(c, r.season.story.id)
  return {
    look,
    figureLabel: lookLabel(c, look),
    inset: withInset ? mascot : undefined,
    name: r.displayName(c.slot, true),
    cues,
    description,
  }
}

/** The cast as panels: mascots before the reveal, people after it (the reveal adds the mascot inset). */
export function castTiles(
  r: StoryRunner,
  revealed: boolean,
  lines: (c: CastMember) => string[] = () => [],
  /** The reveal shows each mascot beside its face once; nowhere else does. */
  inset = false,
): CastTile[] {
  return r.cast.map((c) => {
    const v = colleagueView(r, c, revealed, undefined, inset)
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

/**
 * The drawn prop beside a decision's scene (EVAL-10's comic page, panel 2): picked from the
 * comic art kit by the decision's area, fixed by its id, so a card always shows the same prop
 * and no prop depends on who is on the card. No faces: props only.
 */
const PROPS: Record<string, ArtKey[]> = {
  hiring: ['board', 'table', 'dashboard', 'crowd'],
  conduct: ['letters', 'chat', 'note', 'glance'],
  resources: ['crates', 'ledger', 'truck', 'coffee'],
  ordinary: ['coffee', 'table'],
}
export function sceneArt(id: string, area: string): ArtKey {
  const set = PROPS[area] ?? PROPS.ordinary
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return set[h % set.length]
}
