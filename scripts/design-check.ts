/**
 * The trainer's design system held as a test (knowledge/design.md, section 1).
 * - Raw colours, sizes and durations live only in src/styles/tokens.css; stylesheets read
 *   semantic tokens only, every token read exists and every token defined is read.
 * - The text-colour rule: text is ink or paper. Every `color` reads an --c-on-* token (or
 *   inherits), each of which resolves to its skin's ink or paper; the accent (--c-display*)
 *   is read only by display type and never resolves to red; red is never text.
 * - Contrast: every text token against its ground passes 4.5:1 in every skin and ground;
 *   focus rings pass 3:1.
 * - Screens and boards compose src/ui and never write a class or a style; nothing in the UI
 *   receives a gender; every class is owned by one stylesheet and used; every component is in
 *   design.md section 4.
 * - Motion: press feedback inside 100 ms, the hit-stop matching its token, and a designed
 *   reduced-motion state.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { record } from './lib/check'

const T = 'D design system (knowledge/design.md)'
const ROOT = new URL('..', import.meta.url).pathname
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const ls = (d: string, ext: string) =>
  readdirSync(join(ROOT, d))
    .filter((f) => f.endsWith(ext))
    .map((f) => `${d}/${f}`)

/** Rule blocks of a stylesheet, each with the @media it sits in. */
function blocks(css: string) {
  const out: { sel: string; body: string; media: string | null }[] = []
  const walk = (text: string, media: string | null) => {
    let i = 0
    while (i < text.length) {
      const open = text.indexOf('{', i)
      if (open < 0) break
      const sel = text.slice(i, open).trim()
      let depth = 1
      let j = open + 1
      while (j < text.length && depth) {
        if (text[j] === '{') depth++
        else if (text[j] === '}') depth--
        j++
      }
      const body = text.slice(open + 1, j - 1)
      if (sel.startsWith('@media')) walk(body, sel)
      else if (!sel.startsWith('@font-face')) out.push({ sel, body, media })
      i = j
    }
  }
  walk(strip(css), null)
  return out
}
const decls = (body: string) =>
  [...body.matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;]+);/g)].map((m) => ({ prop: m[1], value: m[2].trim() }))

const lum = (hex: string) => {
  const c = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((k) => {
    const x = parseInt(c.slice(k, k + 2), 16) / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

export async function run() {
  const { HIT_STOP_MS } = await import('../src/ui/Button')
  const tokensCss = read('src/styles/tokens.css')
  const tb = blocks(tokensCss)
  const prim = new Map<string, string>()
  for (const d of decls(strip(tokensCss.slice(0, tokensCss.indexOf('/* @tier semantic'))))) prim.set(d.prop, d.value)
  const allDefined = new Set(tb.flatMap((b) => decls(b.body).map((d) => d.prop)))
  const semantic = new Set([...allDefined].filter((t) => !prim.has(t)))

  const rootSem = new Map(
    tb.filter((b) => b.sel === ':root' && !b.media).flatMap((b) => decls(b.body).map((d) => [d.prop, d.value] as const)),
  )
  const skinSets: { id: string; map: Map<string, string>; skin: string }[] = []
  for (const b of tb.filter((x) => /^\[data-skin='(\w+)'\]$/.test(x.sel))) {
    const skin = b.sel.match(/'(\w+)'/)![1]
    const base = new Map([...rootSem, ...decls(b.body).map((d) => [d.prop, d.value] as const)])
    skinSets.push({ id: skin, map: base, skin })
    for (const g of tb.filter((x) => x.sel.startsWith(`[data-skin='${skin}'][data-ground=`)))
      skinSets.push({
        id: `${skin}/${g.sel.match(/ground='(\w+)'/)![1]}`,
        map: new Map([...base, ...decls(g.body).map((d) => [d.prop, d.value] as const)]),
        skin,
      })
  }
  const resolve = (map: Map<string, string>, v: string, depth = 0): string => {
    const ref = v.match(/^var\((--[\w-]+)\)$/)?.[1]
    if (!ref || depth > 8) return v
    return resolve(map, map.get(ref) ?? prim.get(ref) ?? v, depth + 1)
  }
  /** The primitive a token lands on, so the red and the inks can be named. */
  const landsOn = (map: Map<string, string>, t: string, depth = 0): string => {
    const v = map.get(t) ?? prim.get(t) ?? ''
    const ref = v.match(/^var\((--[\w-]+)\)$/)?.[1]
    return ref && depth < 8 ? landsOn(map, ref, depth + 1) : t
  }

  const sheets = [...ls('src/ui', '.css'), 'src/styles/base.css']
  const rawBad: string[] = []
  const tierBad: string[] = []
  const colourBad: string[] = []
  const reads = new Set<string>()
  for (const s of sheets)
    for (const b of blocks(read(s))) {
      for (const d of decls(b.body)) {
        const v = d.value.replace(/var\([^)]*\)/g, '')
        if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(v)) rawBad.push(`${s}: ${d.prop}: ${d.value}`)
        const units = [...v.matchAll(/(?<![\w-])(-?\d*\.?\d+)(px|rem|em|ms|s|vw|vh|ch|deg|%)(?![\w-])/g)].filter(
          (n) => !(n[1] === '0' || (n[1] === '100' && (n[2] === '%' || n[2] === 'vh'))),
        )
        if (units.length) rawBad.push(`${s}: ${d.prop}: ${d.value}`)
        if (d.prop === 'color') {
          const tok = d.value.match(/^var\((--[\w-]+)\)$/)?.[1] ?? ''
          const ok =
            d.value === 'inherit' ||
            d.value === 'currentColor' ||
            tok.startsWith('--c-on-') ||
            (tok.startsWith('--c-display') && /title|display|flap/.test(b.sel))
          if (!ok) colourBad.push(`${s}: ${b.sel} { color: ${d.value} }`)
        }
      }
      for (const m of b.body.matchAll(/var\((--[\w-]+)/g)) {
        reads.add(m[1])
        if (!semantic.has(m[1])) tierBad.push(`${s}: ${m[1]}${allDefined.has(m[1]) ? ' (primitive)' : ' (undefined)'}`)
      }
    }
  for (const m of tokensCss.matchAll(/var\((--[\w-]+)/g)) reads.add(m[1])
  /* Read by code rather than a stylesheet: the hit-stop's hold (src/ui/Button.tsx). */
  if (read('src/ui/Button.tsx').includes('--dur-hitstop')) reads.add('--dur-hitstop')
  record(T, 'raw colours, sizes and durations live only in tokens.css', rawBad.length === 0, rawBad.slice(0, 6).join(' | '))
  record(T, 'stylesheets read semantic tokens only, and only tokens that exist', tierBad.length === 0, tierBad.slice(0, 6).join(' | '))
  const unread = [...allDefined].filter((t) => !reads.has(t))
  record(T, 'every token is read somewhere', unread.length === 0, unread.join(', '))

  record(
    T,
    'every text colour reads an --c-on-* token or inherits; the accent (--c-display*) only on display type',
    colourBad.length === 0,
    colourBad.slice(0, 6).join(' | '),
  )
  const inkBad: string[] = []
  const redBad: string[] = []
  for (const set of skinSets) {
    for (const t of [...set.map.keys()].filter((k) => k.startsWith('--c-on-'))) {
      const p = landsOn(set.map, t)
      if (p !== `--${set.skin}-ink` && p !== `--${set.skin}-paper`) inkBad.push(`${set.id} ${t} -> ${p}`)
    }
    for (const t of [...set.map.keys()].filter((k) => k.startsWith('--c-display')))
      if (/red/.test(landsOn(set.map, t))) redBad.push(`${set.id} ${t}`)
  }
  record(T, "every --c-on-* text token resolves to its skin's ink or paper, in every skin and ground", inkBad.length === 0, inkBad.join(', '))
  record(T, 'the display accent never resolves to red, so red is never text', redBad.length === 0 && skinSets.length >= 6, redBad.join(', '))

  const PAIRS: [string, string, number][] = [
    ['--c-on-ground', '--c-ground', 4.5],
    ['--c-on-plate', '--c-plate', 4.5],
    ['--c-on-sheet', '--c-sheet', 4.5],
    ['--c-on-ticket', '--c-ticket', 4.5],
    ['--c-on-band', '--c-band', 4.5],
    ['--c-on-button', '--c-button', 4.5],
    ['--c-on-button-alt', '--c-button-alt', 4.5],
    ['--c-on-selected', '--c-selected', 4.5],
    ['--c-on-band', '--c-roundel', 4.5],
    ['--c-display', '--c-ground', 4.5],
    ['--c-display', '--c-band', 4.5],
    ['--c-focus', '--c-ground', 3],
    ['--c-edge-ground', '--c-ground', 3],
  ]
  const low: string[] = []
  let pairs = 0
  for (const set of skinSets)
    for (const [fg, bg, min] of PAIRS) {
      const a = resolve(set.map, `var(${fg})`)
      const b = resolve(set.map, `var(${bg})`)
      if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) {
        low.push(`${set.id} ${fg}/${bg} unresolved`)
        continue
      }
      pairs++
      const r = ratio(a, b)
      if (r < min) low.push(`${set.id} ${fg} on ${bg}: ${r.toFixed(2)}`)
    }
  record(T, `every text and ground pair passes contrast in every skin and ground (${pairs} pairs)`, low.length === 0, low.join(', '))

  const composed = [...ls('src/screens', '.tsx'), ...ls('src/boards', '.tsx'), 'src/App.tsx']
  const styled = composed.filter((f) => /className=|style=\{/.test(read(f)))
  record(T, 'screens and boards never write a className or a style (they compose src/ui)', styled.length === 0, styled.join(', '))
  const uiFiles = [...ls('src/ui', '.tsx'), ...ls('src/ui', '.css'), ...ls('src/boards', '.tsx'), ...ls('src/screens', '.tsx')]
  const gendered = uiFiles.filter((f) => /\bgender\b|data-gender|\bwoman\b|\bman\b/i.test(strip(read(f))))
  record(T, 'no component, board or screen reads a gender, so no colour or shape can be gender-coded', gendered.length === 0, gendered.join(', '))
  const asym = ['src/ui/person.css', 'src/ui/choices.css', 'src/ui/words.css', 'src/ui/swipe.css'].filter((f) =>
    /:nth-child|:first-child|:last-child|:nth-of-type/.test(strip(read(f))),
  )
  record(T, 'answer options carry no position-based style', asym.length === 0, asym.join(', '))

  const owned = new Map<string, string>()
  const ownBad: string[] = []
  for (const s of ls('src/ui', '.css')) {
    const raw = read(s)
    const owns = raw.match(/@owns ([^*]+)\*\//)?.[1].trim().split(/\s+/) ?? []
    if (!owns.length) ownBad.push(`${s}: no @owns`)
    for (const o of owns) {
      if (owned.has(o)) ownBad.push(`${o} owned twice`)
      owned.set(o, s)
    }
    for (const m of strip(raw).matchAll(/\.([a-z][\w-]*)/g)) if (!owns.includes(m[1])) ownBad.push(`${s} styles .${m[1]} it does not own`)
  }
  record(T, 'every class is owned by one stylesheet, which styles only what it owns', ownBad.length === 0, [...new Set(ownBad)].slice(0, 6).join(' | '))
  const uiTsx = ls('src/ui', '.tsx').map(read).join('\n')
  const used = new Set<string>()
  for (const m of uiTsx.matchAll(/className="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) used.add(c)
  const undef = [...used].filter((c) => !owned.has(c))
  const unused = [...owned.keys()].filter((c) => !used.has(c))
  record(T, 'every class used in src/ui is defined, and every class defined is used', !undef.length && !unused.length, `undefined: ${undef.join(',')}; unused: ${unused.join(',')}`)
  const dynamic = ls('src/ui', '.tsx').filter((f) => /className=\{/.test(read(f)))
  record(T, 'class names are static; variants and states are data or aria attributes', dynamic.length === 0, dynamic.join(', '))

  const exported = [...read('src/ui/index.ts').matchAll(/export \{ ([^}]+) \}/g)].flatMap((m) =>
    m[1].split(',').map((x) => x.trim()).filter((x) => x && !x.startsWith('type ') && x !== 'HIT_STOP_MS'),
  )
  const doc = read('knowledge/design.md')
  const section4 = doc.slice(doc.indexOf('## 4.'), doc.indexOf('## 5.'))
  const undocumented = exported.filter((e) => !section4.includes(`\`${e}\``))
  record(T, 'every component exported from src/ui is in design.md section 4', section4.length > 0 && undocumented.length === 0, undocumented.join(', '))

  const ms = (t: string) => Number(resolve(rootSem, `var(${t})`).replace('ms', ''))
  record(T, `press feedback starts inside 100 ms (--dur-press ${ms('--dur-press')} ms)`, ms('--dur-press') <= 100)
  record(T, `the hit-stop in code (${HIT_STOP_MS} ms) is --dur-hitstop`, ms('--dur-hitstop') === HIT_STOP_MS)
  const rz = new Map(
    tb.filter((b) => b.media?.includes('prefers-reduced-motion: reduce')).flatMap((b) => decls(b.body).map((d) => [d.prop, d.value] as const)),
  )
  record(
    T,
    'reduced motion is a designed state: no press travel, no tilt, no transition time',
    ['--dur-press', '--dur-move', '--press-shift', '--stamp-tilt', '--lift-tilt'].every((t) => rz.has(t)) &&
      resolve(rootSem, rz.get('--dur-press') ?? '') === '0ms' &&
      rz.get('--press-shift') === '0px',
  )
  const transBad = sheets.filter((s) =>
    blocks(read(s)).some((b) =>
      decls(b.body).some((d) => /^(transition|animation)/.test(d.prop) && d.value !== 'none' && !/var\(--dur-/.test(d.value)),
    ),
  )
  record(T, 'every transition reads a --dur-* token', transBad.length === 0, transBad.join(', '))

  const fonts = read('src/styles/fonts.css')
  const families = new Set([...fonts.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]))
  const station = skinSets.find((s) => s.id === 'station')!
  const lugdi = skinSets.find((s) => s.id === 'lugdi')!
  record(
    T,
    'the faces are Hind (every script) and Sarpanch; Lugdi displays in Sarpanch, Station in Hind',
    [...families].sort().join(',') === 'Hind,Sarpanch' &&
      resolve(station.map, 'var(--font-display)').startsWith("'Hind'") &&
      resolve(lugdi.map, 'var(--font-display)').startsWith("'Sarpanch'"),
    [...families].join(', '),
  )

  const man = JSON.parse(read('public/manifest.webmanifest')) as { theme_color: string; background_color: string }
  const night = prim.get('--lugdi-night')
  record(
    T,
    'the manifest and theme-color meta use the Lugdi night token',
    man.theme_color === night && man.background_color === night && read('index.html').includes(`name="theme-color" content="${night}"`),
    `${man.theme_color} ${man.background_color}`,
  )
}
