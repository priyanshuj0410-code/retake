/**
 * The per-screen word budget (knowledge/design.md, section 8): the words a player has to read
 * on a screen, leaving out names (the cast, cities, road names), numbers (any token with a
 * digit) and character quotes (anything in double quotes). Visually hidden text (screen-reader
 * labels) is not read on screen and is not counted. The same rules run statically on the
 * content (content-check) and on the rendered screen (ux-audit).
 */
import { CAST, DAYS } from '../../src/content'
import { sampleNamed } from '../../src/engine/board'
import { handleText, type Handle } from '../../src/engine/handles'

export const BUDGET = { puzzle: 15, other: 20 }

export interface Names {
  tokens: string[]
  phrases: string[]
}

/** Every name a screen may show, in every language: the cast, cities and road names. */
export function names(extra: Handle[] = []): Names {
  const tokens = new Set<string>()
  for (const c of Object.values(CAST)) for (const v of Object.values(c.name)) tokens.add(v)
  for (const d of DAYS) for (const v of Object.values(d.masthead.city ?? {})) tokens.add(v)
  const phrases = [...sampleNamed().map((p) => p.handle), ...extra].flatMap((h) => [handleText(h, 'en'), handleText(h, 'hi')])
  return { tokens: [...tokens], phrases: phrases.sort((a, b) => b.length - a.length) }
}

/** The counted words of a text. */
export function countWords(text: string, n: Names): string[] {
  const nameSet = new Set(n.tokens.map((x) => x.toLowerCase()))
  let t = text
  for (const p of n.phrases) if (t.includes(p)) t = t.split(p).join(' ')
  return t
    .replace(/["“”][^"“”]*["“”]/g, ' ')
    .split(/[\s·:;,.!?()/|=+…⋮]+/)
    .map((w) => w.replace(/^['‘’]+|['‘’]+$/g, '').replace(/'s$|’s$/, ''))
    .filter((w) => /[\p{L}]/u.test(w) && [...w].length > 1 && !/\d/.test(w) && !nameSet.has(w.toLowerCase()))
}

/** The browser half: the visible text of the page, without visually hidden labels. */
export const PAGE_TEXT = `(() => {
  const skip = (el) => el.closest('.vh, [hidden]')
  const out = []
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement
    if (!el || skip(el) || !n.textContent.trim()) continue
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (cs.visibility === 'hidden' || cs.display === 'none' || r.width === 0 || r.height === 0) continue
    if (el.closest('details:not([open])') && !el.closest('summary')) continue
    out.push(n.textContent)
  }
  return out.join(' \\n ')
})()`
