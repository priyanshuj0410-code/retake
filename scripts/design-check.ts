/**
 * The design system held as a test (knowledge/design.md, section 1), after Spot the
 * Stereotype's design-check: raw values only in tokens.css; stylesheets read semantic tokens
 * only; no token read that does not exist and none defined that nothing reads; every class
 * owned by one stylesheet and used; screens compose src/ui and never write a class or a style;
 * every exported component documented.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { record } from './lib/check'

const T = 'X-4 design system (knowledge/design.md)'
const ROOT = new URL('..', import.meta.url).pathname
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

export async function run() {
  const tokens = strip(read('src/styles/tokens.css'))
  const primBlock = tokens.slice(
    0,
    tokens.indexOf('/* @tier semantic') >= 0
      ? tokens.indexOf('/* @tier semantic')
      : tokens.search(/:root\s*{\s*--c-bg/),
  )
  const prim = new Set([...primBlock.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
  const allDefined = new Set([...tokens.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
  /* The art tier (EVAL-6): raw colours for the drawn pictures, read only by the art sheets. */
  const rawTokens = read('src/styles/tokens.css')
  const artBlock = rawTokens.includes('/* @tier art */')
    ? strip(rawTokens.slice(rawTokens.indexOf('/* @tier art */')))
    : ''
  const art = new Set([...artBlock.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
  const semantic = new Set([...allDefined].filter((t) => !prim.has(t) && !art.has(t)))
  const ART_SHEETS = new Set(['src/ui/portrait.css', 'src/ui/panelart.css'])
  const artBad: string[] = []

  const sheets = [
    ...readdirSync(join(ROOT, 'src/ui'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => `src/ui/${f}`),
    'src/styles/base.css',
  ]
  const rawBad: string[] = []
  const tierBad: string[] = []
  const reads = new Set<string>()
  for (const s of sheets) {
    const css = strip(read(s))
    const body = css.replace(/@media[^{]+/g, '')
    for (const m of body.matchAll(/:\s*([^;{}]+);/g)) {
      const v = m[1].replace(/var\([^)]*\)/g, '').replace(/\bspan \d+\b/g, '')
      if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(v)) rawBad.push(`${s}: ${m[1].trim()}`)
      const nums = [
        ...v.matchAll(/(?<![\w-])(-?\d*\.?\d+)(px|rem|em|ms|s|vw|vh|%)?(?![\w-])/g),
      ].filter(
        (n) =>
          !(
            n[1] === '0' ||
            (n[1] === '1' && !n[2]) ||
            (n[1] === '100' && (n[2] === '%' || n[2] === 'vh'))
          ),
      )
      if (nums.length) rawBad.push(`${s}: ${m[1].trim()}`)
    }
    for (const m of css.matchAll(/var\((--[\w-]+)/g)) {
      reads.add(m[1])
      if (art.has(m[1])) {
        if (!ART_SHEETS.has(s)) artBad.push(`${s}: ${m[1]}`)
      } else if (!semantic.has(m[1]))
        tierBad.push(`${s}: ${m[1]}${allDefined.has(m[1]) ? ' (primitive)' : ' (undefined)'}`)
    }
  }
  const media = [...strip(read('src/ui/page.css')).matchAll(/@media\s*\(([^)]*)\)/g)].map(
    (m) => m[1],
  )
  record(
    T,
    'raw colours, sizes and durations live only in tokens.css',
    rawBad.length === 0,
    rawBad.slice(0, 6).join(' | '),
  )
  record(
    T,
    'stylesheets read semantic tokens only, and only tokens that exist',
    tierBad.length === 0,
    tierBad.slice(0, 6).join(' | '),
  )
  void media
  record(
    T,
    "art tokens (the pictures' raw colours) are read by portrait.css and panelart.css only, and the art tier holds only colours",
    art.size > 0 &&
      artBad.length === 0 &&
      [...artBlock.matchAll(/--[\w-]+\s*:\s*([^;]+);/g)].every((m) =>
        /^#[0-9a-f]{6}$/i.test(m[1].trim()),
      ),
    artBad.slice(0, 6).join(' | '),
  )
  /* No component or screen writes a colour: the SVG pictures take theirs from classes. */
  const tsx = [
    ...readdirSync(join(ROOT, 'src/ui')).map((f) => `src/ui/${f}`),
    ...readdirSync(join(ROOT, 'src/screens')).map((f) => `src/screens/${f}`),
  ].filter((f) => f.endsWith('.tsx'))
  const coloured = tsx.filter((f) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(read(f)))
  record(
    T,
    'no colour is written in a component or screen (pictures fill from art classes)',
    coloured.length === 0,
    coloured.join(', '),
  )
  for (const m of tokens.matchAll(/var\((--[\w-]+)/g)) reads.add(m[1])
  const unread = [...allDefined].filter((t) => !reads.has(t))
  record(T, 'every token is read somewhere', unread.length === 0, unread.join(', '))

  /* Ownership and use of classes. */
  const owned = new Map<string, string>()
  const ownBad: string[] = []
  for (const s of sheets) {
    const raw = read(s)
    const owns =
      raw
        .match(/@owns ([^*]+)\*\//)?.[1]
        .trim()
        .split(/\s+/) ?? []
    if (s.startsWith('src/ui/') && owns.length === 0) ownBad.push(`${s}: no @owns`)
    for (const o of owns) {
      if (owned.has(o)) ownBad.push(`${o} owned twice`)
      owned.set(o, s)
    }
    for (const m of strip(raw).matchAll(/\.([a-z][\w-]*)/g))
      if (!owns.includes(m[1]) && s.startsWith('src/ui/'))
        ownBad.push(`${s} styles .${m[1]} it does not own`)
  }
  record(
    T,
    'every class is owned by one stylesheet, which styles only what it owns',
    ownBad.length === 0,
    [...new Set(ownBad)].slice(0, 6).join(' | '),
  )
  const uiTsx = readdirSync(join(ROOT, 'src/ui'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => read(`src/ui/${f}`))
    .join('\n')
  const used = new Set<string>()
  for (const m of uiTsx.matchAll(/className=\{?[`'"]([^`'"]+)[`'"]/g))
    for (const c of m[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/))
      if (c && !c.endsWith('--')) used.add(c)
  for (const m of uiTsx.matchAll(/'([a-z_ -]+)'/g))
    for (const c of m[1].split(' ')) if (owned.has(c)) used.add(c)
  for (const m of uiTsx.matchAll(/([a-z_]+)--\$\{/g))
    for (const o of owned.keys()) if (o.startsWith(`${m[1]}--`)) used.add(o)
  const undefinedUsed = [...used].filter((c) => !owned.has(c))
  const unused = [...owned.keys()].filter(
    (c) => !used.has(c) && !owned.get(c)?.endsWith('base.css'),
  )
  record(
    T,
    'every class used in src/ui is defined, and every class defined is used',
    undefinedUsed.length === 0 && unused.length === 0,
    `undefined: ${undefinedUsed.join(',')}; unused: ${unused.join(',')}`,
  )

  /* Screens compose src/ui only. */
  const screenFiles = [
    ...readdirSync(join(ROOT, 'src/screens')).map((f) => `src/screens/${f}`),
    'src/App.tsx',
  ]
  const styled = screenFiles.filter((f) => /className=|style=\{/.test(read(f)))
  record(T, 'screens never write a className or a style', styled.length === 0, styled.join(', '))

  /* Every exported component is documented in design.md, section 4. */
  const exported = [...read('src/ui/index.ts').matchAll(/export \{ ([^}]+) \}/g)].flatMap((m) =>
    m[1]
      .split(',')
      .map((x) => x.trim())
      .filter((x) => !x.startsWith('type ')),
  )
  const doc = read('knowledge/design.md')
  const section4 = doc.slice(doc.indexOf('## 4.'), doc.indexOf('## 5.'))
  const undocumented = exported.filter((e) => !section4.includes(`\`${e}\``))
  record(
    T,
    'every component exported from src/ui has a row in design.md section 4',
    undocumented.length === 0,
    undocumented.join(', '),
  )

  /* Visual weight (owner, 19 Oct 2026): frames recede. Every surface's --edge and --frame
     resolve to at most 2 px, the heavy 3 px ink is read only by the selected or stamped state,
     and a control's resting edge keeps 3:1 against its ground (WCAG 1.4.11). */
  const def = (block: string, name: string) =>
    block.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]?.trim()
  const resolve = (block: string, name: string, depth = 0): string | undefined => {
    const v = def(block, name) ?? def(tokens, name)
    const ref = v?.match(/^var\((--[\w-]+)\)$/)?.[1]
    return ref && depth < 6 ? resolve(block, ref, depth + 1) : v
  }
  const blocks: [string, string][] = [
    ['root', tokens.slice(tokens.indexOf('/* @tier semantic') >= 0 ? 0 : 0)],
    ...(['game', 'oof', 'sober'] as const).map((sf): [string, string] => {
      const i = tokens.indexOf(`[data-surface='${sf}']`)
      return [sf, i >= 0 ? tokens.slice(i, tokens.indexOf('}', i)) : '']
    }),
  ]
  const heavyFrames: string[] = []
  for (const [sf, b] of blocks)
    for (const n of ['--edge', '--frame', '--ink-frame']) {
      const v = resolve(b, n)
      const px = Number(v?.match(/^([\d.]+)px$/)?.[1] ?? 0)
      if (px > 2) heavyFrames.push(`${sf} ${n} ${v}`)
    }
  record(
    T,
    'card, panel and page frames are at most 2 px on every surface (--edge, --frame, --ink-frame)',
    heavyFrames.length === 0,
    heavyFrames.join(', '),
  )
  const heavyReads = sheets.flatMap((sh) =>
    /var\(--ink-heavy\)/.test(read(sh))
      ? [...strip(read(sh)).matchAll(/([^{}]+)\{[^}]*var\(--ink-heavy\)/g)]
          .map((m) => m[1].trim())
          .filter((sel) => !/--on|--chosen|--stamped|\[aria-pressed='true'\]/.test(sel))
          .map((sel) => `${sh}: ${sel}`)
      : [],
  )
  record(
    T,
    'the heavy ink weight is read only by a selected or stamped state',
    heavyReads.length === 0,
    heavyReads.join(', '),
  )
  const lum = (hex: string) => {
    const c = hex.replace('#', '')
    const [r, g, b] = [0, 2, 4].map((i) => {
      const x = parseInt(c.slice(i, i + 2), 16) / 255
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
    return (x + 0.05) / (y + 0.05)
  }
  const faint: string[] = []
  for (const [sf, b] of blocks.slice(1)) {
    if (!b) continue
    for (const edge of ['--c-option-rest', '--c-ink-line', '--c-focus']) {
      const fg = resolve(b, edge)
      const bg = resolve(b, '--c-bg')
      if (!fg?.startsWith('#') || !bg?.startsWith('#')) continue
      const r = ratio(fg, bg)
      if (r < 3) faint.push(`${sf} ${edge} ${fg} on ${bg}: ${r.toFixed(2)}`)
    }
  }
  record(
    T,
    'control boundaries and focus rings keep 3:1 against their ground on every surface (WCAG 1.4.11)',
    faint.length === 0,
    faint.join(', '),
  )

  /* The installed app's colours are tokens (EVAL-7): the manifest and the theme-color meta. */
  const man = JSON.parse(read('public/manifest.webmanifest')) as {
    theme_color: string
    background_color: string
  }
  const tokenHex = (n: string) => def(tokens, n)?.toLowerCase()
  const html = read('index.html')
  record(
    T,
    'the manifest and theme-color meta use token colours (--violet, --note-paper)',
    man.theme_color.toLowerCase() === tokenHex('--violet') &&
      man.background_color.toLowerCase() === tokenHex('--note-paper') &&
      html.includes(`name="theme-color" content="${man.theme_color}"`),
    `${man.theme_color} ${man.background_color}`,
  )
}
