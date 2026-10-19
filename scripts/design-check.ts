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
  const semantic = new Set([...allDefined].filter((t) => !prim.has(t)))

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
      if (!semantic.has(m[1]))
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
}
