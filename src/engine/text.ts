/** Resolves a content text for one language and one character (tokens: content/types.ts). */
import { identity } from '../content'
import type { Lang, T } from '../content/types'
import type { Character, Presented } from './layout'
import { displayName } from './layout'

export const tr = (t: T, lang: Lang) => t[lang]

const PLURAL: Record<string, string> = { was: ' were', is: ' are', has: ' have', does: ' do' }

export function fill(
  s: string,
  vars: Record<string, string | number> = {},
  sex?: Character['sex'],
): string {
  /* A gendered word takes the verb that follows it with it ("they were", never "they was"), and
     a capital when it opens a sentence ("laughed. She asked"), whichever form is chosen. */
  let out = s.replace(
    /\{g:([^}|]*)\|([^}|]*)(?:\|([^}|]*))?\}( (?:was|is|has|does)\b)?/g,
    (
      _,
      man: string,
      woman: string,
      neutral: string | undefined,
      verb: string | undefined,
      at: number,
    ) => {
      let w = sex === 'woman' ? woman : sex === 'man' ? man : (neutral ?? man)
      if (verb) w += w === 'they' ? PLURAL[verb.trim()] : verb
      return /(^|[.!?]\s+)$/.test(s.slice(0, at)) ? w.charAt(0).toUpperCase() + w.slice(1) : w
    },
  )
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}

const toneWords: Record<string, string> = {
  darker: 'darker skin tone',
  lighter: 'lighter skin tone',
  constant: 'medium skin tone',
}

export function characterView(p: Presented, c: Character, lang: Lang) {
  const desc = p.card.descriptions.find((d) => d.id === c.d)
  const name = displayName(c)
  const cues: string[] = []
  if (c.born) cues.push(fill(identity.birthplace.label[lang], { city: c.born.city }))
  if (c.badge && p.grounds.badge)
    cues.push((identity.badge.label as Record<string, T>)[c.badge][lang])
  let figure: string
  let figureLabel: string
  if (p.presentation === 'human' && !p.baseline) {
    figure =
      (c.sex === 'woman' ? identity.figures.woman : identity.figures.man) + (c.toneEmoji ?? '')
    figureLabel = `${c.sex}, ${toneWords[c.tone ?? 'constant']}`
  } else {
    figure = p.speciesEmoji ?? ''
    const sp = identity.species.list.find((s) => s.id === p.species)
    figureLabel = sp ? sp.name[lang] : 'animal'
  }
  return {
    figure,
    figureLabel,
    name,
    cues,
    description: desc ? fill(desc.text[lang], { name }, c.sex) : '',
  }
}
