/**
 * X-9 component states: every component in src/ui rendered in each of its states, checking the
 * markup that carries the state (knowledge/reviews/component-states-2026-10-19.md). The
 * computed states (hover, focus ring, press, drag, reorder, forced colours, reduced motion)
 * are checked in the browser by `pnpm ux` (scripts/ux-states.ts).
 */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Allocate, Button, Checks, Choice, SortList } from '../src/ui'
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
  const person = (name: string) => ({
    figure: '',
    figureLabel: 'x',
    name,
    cues: [],
    description: '',
  })
  const sort = html(
    h(SortList, {
      items: [person('A'), person('B'), person('C')],
      order: [2, 0, 1],
      onChange: () => {},
      labels: {
        up: (n) => `Up: ${n}`,
        down: (n) => `Down: ${n}`,
        moved: (n, p, k) => `${n}, position ${p} of ${k}`,
        label: 'Team',
      },
    }),
  )
  record(
    T,
    'SortList: only the first up and the last down are aria-disabled, and none is disabled',
    (sort.match(/aria-disabled="true"/g) ?? []).length === 2 &&
      /aria-disabled="true" aria-label="Up: C"|aria-label="Up: C"[^>]*aria-disabled="true"/.test(
        sort,
      ) &&
      !/ disabled=""/.test(sort),
  )
  record(
    T,
    'SortList: rows are keyed by item for the reorder movement',
    (sort.match(/data-item="/g) ?? []).length === 3,
  )
  const alloc = (units: number[]) =>
    html(
      h(Allocate, {
        items: [person('A'), person('B')],
        order: [0, 1],
        units,
        pool: 4,
        onChange: () => {},
        labels: {
          add: (n) => `Add: ${n}`,
          remove: (n) => `Remove: ${n}`,
          left: (n) => `${n} left to share`,
          done: 'All shared',
          unit: 'days',
        },
      }),
    )
  const spent = alloc([3, 1])
  const empty = alloc([0, 0])
  record(
    T,
    'Allocate: all shared marks the line done and aria-disables every plus, none disabled',
    /alloc__left alloc__left--done/.test(spent) &&
      (spent.match(/aria-disabled="true"/g) ?? []).length === 2 &&
      !/ disabled=""/.test(spent),
  )
  record(
    T,
    'Allocate: nothing shared aria-disables every minus and says what is left',
    (empty.match(/aria-disabled="true"/g) ?? []).length === 2 && /4 left to share/.test(empty),
  )
}
