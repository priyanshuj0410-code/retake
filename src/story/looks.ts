/**
 * Who looks like what (knowledge/design.md, section 4c). The portrait system has one geometry;
 * this file only picks its options.
 *
 * - The fixed cast: within each sex the four looks are dealt by the colleague's place in the
 *   cast, and that place is shuffled against religion and skin tone when the cast is drawn
 *   (session.ts), so no hairstyle, glasses or facial hair goes with a religion or a tone across
 *   players. Women: long hair, a bun, a plait, wavy hair with glasses. Men: curly hair with a
 *   beard, a side parting with a moustache, a quiff with glasses, a crew cut. Equal detail for
 *   everyone; one uniform; one dark brown for all hair. The skin tone is the cast member's own
 *   (the emoji tone drawn for them, mapped to five drawn tones).
 * - One-off characters (applicants, complainants, vendors): the same system at the medium tone,
 *   with a look fixed by a hash of their id (slot and first name), so a character never changes
 *   between renders. The name is a random draw, so the look is unrelated to the cue they carry.
 * - Mascots: the cast member's animal.
 * There is no attire layer: religion is carried by names only.
 */
import type { Animal, Hair, Look, Tone } from '../ui'
import type { CastMember } from './session'

type PersonLook = Extract<Look, { kind: 'person' }>
type Style = Pick<PersonLook, 'hair' | 'facial' | 'glasses'>

const WOMEN: Style[] = [
  { hair: 'long' },
  { hair: 'bun' },
  { hair: 'plait' },
  { hair: 'wavy', glasses: true },
]
const MEN: Style[] = [
  { hair: 'curly', facial: 'beard' },
  { hair: 'side', facial: 'moustache' },
  { hair: 'quiff', glasses: true },
  { hair: 'crew' },
]

const TONE: Record<string, Tone> = {
  '\u{1F3FB}': 'l1',
  '\u{1F3FC}': 'l2',
  '\u{1F3FD}': 'm',
  '\u{1F3FE}': 'd1',
  '\u{1F3FF}': 'd2',
}

/** FNV-1a: a small stable hash, so a one-off's look depends on its id only. */
function hash(s: string) {
  let h = 0x811c9dc5
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

export function personLook(c: CastMember, cast: CastMember[]): PersonLook {
  const tone = TONE[c.toneEmoji] ?? 'm'
  if (c.oneOff) {
    const h = hash(`${c.slot}:${c.name}`)
    const styles = c.sex === 'woman' ? WOMEN : MEN
    const hair: Hair = styles[h % 4].hair
    const glasses = (h >>> 4) % 3 === 0
    const facial =
      c.sex === 'man' ? ([undefined, 'beard', 'moustache'] as const)[(h >>> 8) % 3] : undefined
    return { kind: 'person', sex: c.sex, slot: c.slot, oneOff: true, tone, hair, glasses, facial }
  }
  const same = cast.filter((x) => x.sex === c.sex)
  const style = (c.sex === 'woman' ? WOMEN : MEN)[Math.max(0, same.indexOf(c)) % 4]
  return { kind: 'person', sex: c.sex, slot: c.slot, tone, ...style }
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
