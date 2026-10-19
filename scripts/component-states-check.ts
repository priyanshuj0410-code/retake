/**
 * X-9 component states: every component in src/ui rendered in each of its states, checking the
 * markup that carries the state (knowledge/reviews/component-states-2026-10-19.md). The
 * computed states (hover, focus ring, press, drag, reorder, forced colours, reduced motion)
 * are checked in the browser by `pnpm ux` (scripts/ux-states.ts).
 */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  AgreeGrid,
  Button,
  Checks,
  Choice,
  QuickSplit,
  SortList,
  StoryPick,
  TapOrder,
} from '../src/ui'
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

  /* The season story's inputs (EVAL-4). */
  const tap = html(
    h(TapOrder, {
      items: [person('A'), person('B'), person('C'), person('D')],
      onDone: () => {},
      labels: {
        hint: 'Tap in order',
        undo: 'Undo',
        choose: (n) => `Choose as number ${n}:`,
        chosen: (n) => `Number ${n}:`,
        said: (x, n) => `${x} ${n}`,
        next: (n) => `${n}`,
        taken: (x, n) => `${x} ${n}`,
      },
    }),
  )
  record(
    T,
    'TapOrder: every card is a button, none pressed yet, each named "Choose as number 1", a polite live region, no Undo before a tap',
    (tap.match(/<button[^>]*class="tapcard"/g) ?? []).length === 4 &&
      (tap.match(/aria-pressed="false"/g) ?? []).length === 4 &&
      (tap.match(/Choose as number 1:/g) ?? []).length === 4 &&
      /aria-live="polite"/.test(tap) &&
      !/>Undo</.test(tap),
  )
  const split = html(
    h(QuickSplit, {
      items: [person('A'), person('B')],
      pool: 6,
      cap: 4,
      onDone: () => {},
      labels: { left: (n) => `${n} left`, chip: (x, k) => `${x}: ${k}`, clear: 'Start again' },
    }),
  )
  record(
    T,
    'QuickSplit: a row of 0 to cap chips per colleague, 0 pressed, none disabled while 6 are left, the count live',
    (split.match(/class="split__chip[ "]/g) ?? []).length === 10 &&
      (split.match(/aria-pressed="true"/g) ?? []).length === 2 &&
      !/aria-disabled="true"/.test(split) &&
      /aria-live="polite">6 left/.test(split),
  )
  const grid = html(
    h(AgreeGrid, {
      items: [
        { id: 'a', text: 'S1' },
        { id: 'b', text: 'S2' },
      ],
      scale: ['Strongly disagree', 'Disagree', 'Neither', 'Agree', 'Strongly agree'],
      value: { a: 3 },
      onChange: () => {},
      keyLabel: 'key',
    }),
  )
  record(
    T,
    'AgreeGrid: one fieldset per statement, five native radios each with its full words, the answered point marked',
    (grid.match(/<fieldset/g) ?? []).length === 2 &&
      (grid.match(/type="radio"/g) ?? []).length === 10 &&
      (grid.match(/1, Strongly disagree/g) ?? []).length === 2 &&
      (grid.match(/agree__point--on/g) ?? []).length === 1,
  )
  const pick = html(
    h(StoryPick, {
      options: [
        { id: 'a', emoji: 'x', title: 'A', premise: 'p' },
        { id: 'b', emoji: 'y', title: 'B', premise: 'p', later: 'PENDING v17' },
      ],
      onPick: () => {},
      label: 'Pick',
    }),
  )
  record(
    T,
    'StoryPick: a season not built is aria-disabled with its PENDING line, never disabled',
    (pick.match(/aria-disabled="true"/g) ?? []).length === 1 &&
      /PENDING v17/.test(pick) &&
      !/ disabled=""/.test(pick),
  )
}
