/**
 * The language layer. Interface strings live in content/i18n/<lang>.json, content strings in
 * each content file's Text fields. A string missing in a language falls back to English. To
 * add a language: a file under content/i18n/, an entry in LANGS (its script decides the font,
 * which the Hind family already covers for Bangla, Gujarati, Tamil and Telugu), and its key in
 * the content Text fields as they are translated.
 */
import { createContext, useContext } from 'react'
import en from '../../content/i18n/en.json'
import hi from '../../content/i18n/hi.json'
import type { Lang, Text } from '../content/types'

export type UiKey = Exclude<keyof typeof en, `_${string}`>

const TABLES: Record<Lang, Partial<Record<string, string>>> = { en, hi }

export const LANGS: { id: Lang; label: string; htmlLang: string; draft: boolean }[] = [
  { id: 'en', label: 'English', htmlLang: 'en-GB', draft: false },
  { id: 'hi', label: 'हिन्दी', htmlLang: 'hi', draft: (hi as { _status?: string })._status === 'draft' },
]

export type Vars = Record<string, string | number>

const fill = (s: string, vars?: Vars) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s

export const translate = (lang: Lang, key: UiKey, vars?: Vars) =>
  fill(TABLES[lang][key] ?? en[key], vars)

export const textOf = (lang: Lang, t: Text, vars?: Vars) => fill(t[lang] ?? t.en, vars)

export const formatNumber = (lang: Lang, n: number) =>
  new Intl.NumberFormat(lang === 'hi' ? 'hi-IN' : 'en-IN').format(n)

export const formatDate = (lang: Lang, iso: string) =>
  new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))

export const LangContext = createContext<Lang>('en')

export function useT() {
  const lang = useContext(LangContext)
  return {
    lang,
    t: (key: UiKey, vars?: Vars) => translate(lang, key, vars),
    tx: (text: Text, vars?: Vars) => textOf(lang, text, vars),
    num: (n: number) => formatNumber(lang, n),
    date: (iso: string) => formatDate(lang, iso),
  }
}
