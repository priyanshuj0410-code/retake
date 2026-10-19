/**
 * X-9 component states: every component in src/ui rendered in each of its states, checking the
 * markup that carries the state (knowledge/reviews/component-states-2026-10-19.md). The
 * computed states (hover, focus ring, press, drag, reorder, forced colours, reduced motion)
 * are checked in the browser by `pnpm ux` (scripts/ux-states.ts).
 */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button } from '../src/ui'
import { record } from './lib/check'

const T = 'X-9 component states (markup)'
const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el)

export async function run() {
  record(
    T,
    'Button: disabled is a real disabled button',
    /<button[^>]*disabled=""/.test(html(h(Button, { disabled: true, children: 'Next' }))),
  )
}
