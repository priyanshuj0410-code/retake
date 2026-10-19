/**
 * X-9 component states: every component in src/ui rendered in each of its states, checking the
 * markup that carries the state (knowledge/reviews/component-states-2026-10-19.md). The
 * computed states (hover, focus ring, press, drag, reorder, forced colours, reduced motion)
 * are checked in the browser by `pnpm ux` (scripts/ux-states.ts).
 */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button, Checks, Choice } from '../src/ui'
import { record } from './lib/check'

const T = 'X-9 component states (markup)'
const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el)

export async function run() {
  record(
    T,
    'Button: disabled is a real disabled button',
    /<button[^>]*disabled=""/.test(html(h(Button, { disabled: true, children: 'Next' }))),
  )
  const choice = html(
    h(Choice, {
      legend: 'Q',
      heading: true,
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      value: 'b',
      onChange: () => {},
    }),
  )
  record(
    T,
    'Choice: the checked row carries choice__option--checked, the others do not',
    (choice.match(/choice__option--checked/g) ?? []).length === 1 &&
      /choice__option--checked"><input[^>]*checked=""[^>]*value="b"/.test(choice),
  )
  record(
    T,
    'Choice: heading puts the question in an h1 inside the legend',
    /<legend[^>]*><h1/.test(choice),
  )
  const checks = html(
    h(Checks, {
      legend: 'Q',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
        { id: 'c', text: 'C' },
      ],
      value: ['a', 'c'],
      onChange: () => {},
    }),
  )
  record(
    T,
    'Checks: every ticked row carries choice__option--checked',
    (checks.match(/choice__option--checked/g) ?? []).length === 2,
  )
}
