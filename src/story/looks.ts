/**
 * Who looks like what (knowledge/design.md, section 4c). The portrait system has one geometry;
 * this file only picks its options.
 *
 * - The fixed cast: each slot has one look for each sex (SLOT below, matching the generated
 *   portraits), and sex, religion and tone are drawn onto the slots per player (session.ts), so
 *   no hairstyle, glasses or facial hair goes with a sex, religion or tone across players.
 *   Equal detail for everyone; one uniform; one dark brown for all drawn hair. The skin tone is the cast member's own
 *   (the emoji tone drawn for them, mapped to five drawn tones).
 * - One-off characters (applicants, complainants, vendors): the same system at the medium tone,
 *   glasses and facial hair by their tied group (shared by both faces of a pair), so a character
 *   never changes between renders and the pair differs only on the cue.
 * - Mascots: the cast member's animal.
 * There is no attire layer: religion is carried by names only.
 */
import type { Animal, Hair, Look, Tone } from '../ui'
import { isPeople, storyById } from './content'
import type { CastMember } from './session'

type PersonLook = Extract<Look, { kind: 'person' }>

/**
 * Each slot's look, for both sexes, matching the generated portraits (scripts/portraits/cast.py,
 * slots s1 to s8 = 0 to 7): glasses on both sexes and facial hair on the man are a balanced 2x2
 * across the slots (both: 3 and 6; glasses only: 2 and 4; facial hair only: 1 and 5; neither: 0
 * and 7). Sex is drawn per slot, so the woman and the man of a slot are a matched pair. The drawn
 * fallback uses the nearest of its hairstyles, so the label is right for the image and the drawing.
 */
const SLOT: { w: Hair; m: Hair; glasses: boolean; facial?: 'beard' | 'moustache' }[] = [
  { w: 'long', m: 'side', glasses: false },
  { w: 'bun', m: 'crew', glasses: false, facial: 'moustache' },
  { w: 'plait', m: 'quiff', glasses: true },
  { w: 'wavy', m: 'curly', glasses: true, facial: 'beard' },
  { w: 'bun', m: 'quiff', glasses: true },
  { w: 'long', m: 'crew', glasses: false, facial: 'moustache' },
  { w: 'wavy', m: 'side', glasses: true, facial: 'beard' },
  { w: 'bun', m: 'side', glasses: false },
]

const WOMEN: Hair[] = ['long', 'bun', 'plait', 'wavy']
const MEN: Hair[] = ['curly', 'side', 'quiff', 'crew']
const FACIAL = [undefined, 'moustache', 'beard'] as const

const TONE: Record<string, Tone> = {
  '\u{1F3FB}': 'l1',
  '\u{1F3FC}': 'l2',
  '\u{1F3FD}': 'm',
  '\u{1F3FE}': 'd1',
  '\u{1F3FF}': 'd2',
}

/** FNV-1a: a small stable hash, so a one-off's drawn hairstyle depends on its id only. */
function hash(s: string) {
  let h = 0x811c9dc5
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/**
 * The one-off slots' groups, in the order the season creates them (session.ts, and
 * oneoff_slots in scripts/portraits/cast.py): a rank makes two tied pairs, a pick one, a split
 * its third colleague and then a tied pair. Both faces of a tied pair share glasses and facial
 * hair (group g: glasses when g % 3 is 0, facial hair none, moustache, beard by g % 3), so the
 * pair differs only on the cue.
 */
const ONE_OFF_GROUP: Map<number, number> = (() => {
  const out = new Map<number, number>()
  let slot = 100
  let g = 0
  for (const b of storyById('warehouse')?.beats ?? []) {
    if (!isPeople(b) || b.shape !== 'oneoff') continue
    const groups = b.kind === 'rank' ? [2, 2] : b.kind === 'pick' ? [2] : [1, 2]
    for (const n of groups) {
      for (let k = 0; k < n; k++) out.set(slot++, g)
      g += 1
    }
  }
  return out
})()

export function personLook(c: CastMember): PersonLook {
  const tone = TONE[c.toneEmoji] ?? 'm'
  if (c.oneOff) {
    const g = ONE_OFF_GROUP.get(c.slot) ?? 0
    const hair = (c.sex === 'woman' ? WOMEN : MEN)[hash(`${c.slot}:${c.name}`) % 4]
    return {
      kind: 'person',
      sex: c.sex,
      slot: c.slot,
      oneOff: true,
      tone,
      hair,
      glasses: g % 3 === 0,
      facial: c.sex === 'man' ? FACIAL[g % 3] : undefined,
    }
  }
  const look = SLOT[c.slot % 8]
  return {
    kind: 'person',
    sex: c.sex,
    slot: c.slot,
    tone,
    hair: c.sex === 'woman' ? look.w : look.m,
    glasses: look.glasses,
    facial: c.sex === 'man' ? look.facial : undefined,
  }
}

export function mascotLook(c: CastMember): Look | undefined {
  return c.species ? { kind: 'animal', animal: c.species as Animal } : undefined
}

const TONE_WORDS: Record<CastMember['tone'], string> = {
  darker: 'darker skin tone',
  lighter: 'lighter skin tone',
  constant: 'medium skin tone',
}

/** What a screen reader says for a drawn person: sex, tone, and glasses or facial hair if any. */
export function lookLabel(c: CastMember, look: PersonLook): string {
  return [
    c.sex,
    TONE_WORDS[c.tone],
    ...(look.glasses ? ['glasses'] : []),
    ...(look.facial ? [look.facial] : []),
  ].join(', ')
}
