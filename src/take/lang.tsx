import { createContext, useContext, useLayoutEffect, useRef, type ElementType, type HTMLAttributes } from 'react'
import { TAKE, type Bi, type Lang } from './data'

// Three modes, as in the demo (library.js translate): 'mix' is the original Hinglish (English words, Hindi on the
// signs), 'hi' Hindi, and 'en' English only, which also says Hinglish's Hindi words in English (library.py ENG).
export const LangContext = createContext<Lang>('mix')
export const useLang = () => useContext(LangContext)

export const eng = (en: string) => TAKE.eng.reduce((s, [a, b]) => s.split(a).join(b), en)

export const say = (lang: Lang, [en, hi]: Bi) => (lang === 'hi' ? hi : lang === 'en' ? eng(en) : en)

/** A string in the chosen language; Hindi carries lang="hi", which the library's Devanagari sizes key on. */
export function T({ t, as: Tag = 'span', ...rest }: { t: Bi; as?: ElementType } & HTMLAttributes<HTMLElement>) {
  const lang = useLang()
  return (
    <Tag {...rest} lang={lang === 'hi' ? 'hi' : undefined}>
      {say(lang, t)}
    </Tag>
  )
}

/** The aria-label for a string pair. */
export const useLabel = () => {
  const lang = useLang()
  return (t: Bi) => say(lang, t)
}

/** Markup the library drew (a cover, a sheet's dress), turned to the chosen language the way library.js does it. */
export function Drawn({ html, className, as: Tag = 'div' }: { html: string; className?: string; as?: ElementType }) {
  const lang = useLang()
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (root) translate(root, lang)
  }, [lang, html])
  return <Tag ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function translate(root: HTMLElement, lang: Lang) {
  root.querySelectorAll<HTMLElement>('[data-hi], [data-eng]').forEach((el) => {
    if (el.dataset.en === undefined) el.dataset.en = el.innerHTML
    const hi = lang === 'hi' && el.dataset.hi !== undefined
    el.innerHTML = hi ? el.dataset.hi! : (lang === 'en' && el.dataset.eng) || el.dataset.en
    if (hi) el.setAttribute('lang', 'hi')
    else el.removeAttribute('lang')
  })
  root.querySelectorAll<HTMLElement>('[data-hi-label]').forEach((el) => {
    if (el.dataset.enLabel === undefined) el.dataset.enLabel = el.getAttribute('aria-label') ?? ''
    el.setAttribute('aria-label', lang === 'hi' ? el.dataset.hiLabel! : (lang === 'en' && el.dataset.engLabel) || el.dataset.enLabel)
  })
}
