import { createContext, useContext } from 'react'
import { cast, type Lang, type Step } from '../content'
import type { Answer } from '../engine/answers'
import { textOf } from '../i18n'
import type { PersonView } from '../ui'

export type Skin = 'lugdi' | 'station'
export const SkinContext = createContext<Skin>('lugdi')
export const useSkin = () => useContext(SkinContext)

export const nameOf = (who: string, lang: Lang) => textOf(lang, cast(who).name)

export function personView(who: string, lang: Lang, extra: Partial<PersonView> = {}): PersonView {
  const c = cast(who)
  return { id: who, name: textOf(lang, c.name), art: c.art, ...extra }
}

export interface BoardProps<S extends Step, A extends Answer> {
  step: S
  answer: A
  onChange: (a: A) => void
  /** This player's order for the step's people or items, so no side is always first. */
  order: <T>(xs: T[], key: (x: T) => string) => T[]
}
