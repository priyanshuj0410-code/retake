import { TAKE } from './data'

// The library's icons (library.py ic()), as it draws them: the filled 256 set, or a stroked 24 motif.
const parsed = new Map<string, { attrs: Record<string, string>; inner: string }>()
const ATTR: Record<string, string> = {
  viewBox: 'viewBox',
  fill: 'fill',
  stroke: 'stroke',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
}

function parse(name: string) {
  let p = parsed.get(name)
  if (!p) {
    const src = TAKE.icons[name] ?? ''
    const head = src.match(/^<svg([^>]*)>/)?.[1] ?? ''
    const attrs: Record<string, string> = {}
    for (const [, k, v] of head.matchAll(/([\w-]+)="([^"]*)"/g)) if (ATTR[k]) attrs[ATTR[k]] = v
    p = { attrs, inner: src.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') }
    parsed.set(name, p)
  }
  return p
}

export function Svg({ name }: { name: string }) {
  const { attrs, inner } = parse(name)
  return <svg {...attrs} aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />
}
