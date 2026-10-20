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
  Allocate,
  DotGrid,
  Glance,
  Pairs,
  Tally,
  Trend,
  Button,
  Checks,
  Choice,
  Code,
  Field,
  List,
  Portrait,
  QuickSplit,
  SortList,
  StoryPick,
  Table,
  TapOrder,
} from '../src/ui'
import { setPortraitFiles } from '../src/ui/portraitImages'
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
  const character = (name: string) => ({
    figure: '',
    figureLabel: 'x',
    name,
    cues: [],
    description: '',
  })
  const person = (name: string) => ({
    look: { kind: 'animal' as const, animal: 'panda' as const },
    figureLabel: 'panda',
    name,
    cues: [],
    description: '',
  })
  const sort = html(
    h(SortList, {
      items: [character('A'), character('B'), character('C')],
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

  /* Portraits (EVAL-6): the generated WebP when the manifest lists it, else the drawn SVG. */
  const woman = {
    kind: 'person' as const,
    sex: 'woman' as const,
    slot: 0,
    tone: 'd1' as const,
    hair: 'bun' as const,
  }
  const face = (eager?: boolean) =>
    html(
      h(Portrait, {
        look: woman,
        label: 'woman, darker skin tone',
        inset: { kind: 'animal', animal: 'panda' },
        eager,
      }),
    )
  setPortraitFiles(null)
  const drawn = face()
  record(
    T,
    'Portrait: with no manifest, the drawn SVG in the comic frame, role="img" with its label, no <img>',
    /role="img" aria-label="woman, darker skin tone"/.test(drawn) &&
      /<svg class="portrait__art"[^>]*data-tone="d1"/.test(drawn) &&
      !/<img/.test(drawn),
  )
  setPortraitFiles(['0-woman-d1.webp', 'portraits/mascot-panda.webp'])
  const photo = face()
  record(
    T,
    'Portrait: a listed image (slot, sex, tone; mascot by animal) sits on the backdrop with width, height, lazy loading and the same label',
    /<img class="portrait__photo" src="\/portraits\/0-woman-d1\.webp" alt="woman, darker skin tone" aria-label="woman, darker skin tone" width="384" height="384" loading="lazy"/.test(
      photo,
    ) &&
      /src="\/portraits\/mascot-panda\.webp"/.test(photo) &&
      /data-tone="d1"/.test(photo) &&
      !/class="pt-skin/.test(photo),
  )
  record(
    T,
    'Portrait: eager faces (above the fold) load at once',
    /loading="eager"/.test(face(true)) && !/loading="lazy"/.test(face(true)),
  )
  const applicant = {
    kind: 'person' as const,
    sex: 'man' as const,
    slot: 103,
    oneOff: true,
    tone: 'm' as const,
    hair: 'crew' as const,
  }
  setPortraitFiles(['o103-man.webp'])
  const oneOff = html(h(Portrait, { look: applicant, label: 'man, medium skin tone' }))
  setPortraitFiles(['o104-man.webp'])
  record(
    T,
    'Portrait: a one-off takes o{slot}-{sex}.webp when the manifest lists it, else is drawn',
    /src="\/portraits\/o103-man\.webp"/.test(oneOff) &&
      !/<img/.test(html(h(Portrait, { look: applicant, label: 'man, medium skin tone' }))),
  )
  setPortraitFiles(['1-woman-d1.webp'])
  record(
    T,
    'Portrait: a tone or slot the manifest does not list falls back to the drawn SVG',
    !/<img/.test(face()) && /class="pt-skin/.test(face()),
  )
  /* Each story's own cast (EVAL-10): the newsroom's face is newsroom-{slot}-{sex}-{tone}.webp;
     a missing story file draws the SVG, never the warehouse face; one-offs stay shared. */
  const newsroom = {
    kind: 'person' as const,
    sex: 'woman' as const,
    slot: 2,
    story: 'newsroom',
    tone: 'd1' as const,
    hair: 'long' as const,
  }
  const nf = (files: string[]) => {
    setPortraitFiles(files)
    return html(h(Portrait, { look: newsroom, label: 'woman, darker skin tone' }))
  }
  const withStory = nf(['newsroom-2-woman-d1.webp', '2-woman-d1.webp'])
  const onlyWarehouse = nf(['2-woman-d1.webp'])
  const sharedOneOff = (() => {
    setPortraitFiles(['o103-man.webp'])
    return html(h(Portrait, { look: { ...applicant, story: 'newsroom' }, label: 'man' }))
  })()
  record(
    T,
    "Portrait: a story's cast takes its own prefixed file; without it the SVG is drawn, never the warehouse face; one-offs are shared across stories",
    /src="\/portraits\/newsroom-2-woman-d1\.webp"/.test(withStory) &&
      !/<img/.test(onlyWarehouse) &&
      /src="\/portraits\/o103-man\.webp"/.test(sharedOneOff),
  )
  setPortraitFiles(null)
  /* The season story's inputs (EVAL-4). */
  const tap = html(
    h(TapOrder, {
      items: [person('A'), person('B'), person('C'), person('D')],
      onDone: () => {},
      labels: {
        hint: 'Tap in order',
        clear: 'Clear the stamps',
        cleared: 'Stamps cleared.',
        lock: 'Confirm this order',
        ready: 'All stamped.',
        stamp: (n) => `${n}st`,
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
    'TapOrder: every card is a portrait-panel button, none pressed or stamped yet, each named "Choose as number 1", a polite live region, no "Clear the stamps" before a tap',
    (tap.match(/<button[^>]*class="tapcard"/g) ?? []).length === 4 &&
      (tap.match(/aria-pressed="false"/g) ?? []).length === 4 &&
      (tap.match(/Choose as number 1:/g) ?? []).length === 4 &&
      (tap.match(/role="img" aria-label="panda"/g) ?? []).length === 4 &&
      !/class="stamp/.test(tap) &&
      /aria-live="polite"/.test(tap) &&
      !/>Clear the stamps</.test(tap),
  )
  const split = html(
    h(QuickSplit, {
      items: [person('A'), person('B'), person('C')],
      pool: 6,
      cap: 4,
      onDone: () => {},
      labels: {
        left: (n) => `${n} left`,
        chip: (x, k) => `${x}: ${k}`,
        clear: 'Start again',
        lock: 'Confirm these shares',
      },
    }),
  )
  record(
    T,
    'QuickSplit: three colleagues, a row of 0 to cap chips each, none pressed and every stamp an empty ring at the start (it never looks answered), none disabled while 6 are left, the count live, no confirm yet',
    (split.match(/class="split__chip[ "]/g) ?? []).length === 15 &&
      (split.match(/aria-pressed="true"/g) ?? []).length === 0 &&
      (split.match(/class="stamp stamp--empty"/g) ?? []).length === 3 &&
      !/>Confirm these shares</.test(split) &&
      !/>Start again</.test(split) &&
      !/aria-disabled="true"/.test(split) &&
      /aria-live="polite">6 left/.test(split),
  )
  /* No auto-advance (owner, 19 Oct 2026): a saved answer (Back) comes back stamped, with the confirm button. */
  const tapSaved = html(
    h(TapOrder, {
      items: [person('A'), person('B'), person('C'), person('D')],
      onDone: () => {},
      initial: [2, 0, 3, 1],
      labels: {
        hint: 'Tap in order',
        clear: 'Clear the stamps',
        cleared: 'Stamps cleared.',
        lock: 'Confirm this order',
        ready: 'All stamped.',
        stamp: (n) => `No ${n}`,
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
    'TapOrder: a saved order shows every stamp and waits for "Confirm this order" (no auto-advance), with "Clear the stamps"',
    (tapSaved.match(/class="stamp"/g) ?? []).length === 4 &&
      (tapSaved.match(/aria-pressed="true"/g) ?? []).length === 4 &&
      />Confirm this order</.test(tapSaved) &&
      />Clear the stamps</.test(tapSaved),
  )
  const splitSaved = html(
    h(QuickSplit, {
      items: [person('A'), person('B'), person('C')],
      pool: 6,
      cap: 4,
      onDone: () => {},
      initial: [4, 2, 0],
      labels: {
        left: (n) => `${n} left`,
        chip: (x, k) => `${x}: ${k}`,
        clear: 'Start again',
        lock: 'Confirm these shares',
      },
    }),
  )
  record(
    T,
    'QuickSplit: a saved split comes back exactly (4, 2, 0 pressed) and waits for "Confirm these shares"',
    (splitSaved.match(/aria-pressed="true"/g) ?? []).length === 3 &&
      /aria-label="A: 4" aria-pressed="true"|aria-pressed="true"[^>]*aria-label="A: 4"/.test(
        splitSaved,
      ) &&
      />Confirm these shares</.test(splitSaved) &&
      !/>Confirm these shares</.test(split),
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
        { id: 'a', art: 'warehouse', title: 'A', premise: 'p' },
        { id: 'b', art: 'newsroom', title: 'B', premise: 'p', later: 'After your rating.' },
      ],
      onPick: () => {},
      label: 'Pick',
    }),
  )
  record(
    T,
    'StoryPick: a drawn cover panel per season (no emoji); a season not open is aria-disabled with its line, never disabled',
    (pick.match(/aria-disabled="true"/g) ?? []).length === 1 &&
      (pick.match(/<svg class="panelart"/g) ?? []).length === 2 &&
      /After your rating\./.test(pick) &&
      !/ disabled=""/.test(pick),
  )
  const alloc = (units: number[]) =>
    html(
      h(Allocate, {
        items: [character('A'), character('B')],
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
  const field = (invalid: boolean) =>
    html(h(Field, { label: 'Code', value: 'X', onChange: () => {}, invalid, errorId: 'err' }))
  record(
    T,
    'Field: invalid sets aria-invalid and aria-describedby; valid sets neither',
    /aria-invalid="true"/.test(field(true)) &&
      /aria-describedby="err"/.test(field(true)) &&
      !/aria-invalid|aria-describedby/.test(field(false)),
  )
  record(
    T,
    'Field: a one-field form, so Enter submits natively',
    /^<form class="field"/.test(field(false)),
  )
  const code = html(
    h(Code, { value: 'ABCD-EFGH', label: 'Code', copy: { button: 'Copy', done: 'Copied' } }),
  )
  record(
    T,
    'Code: with copy, a button and an always-present status region (empty until copied)',
    /<button[^>]*>Copy<\/button><p class="code__status" role="status"><\/p>/.test(code),
  )
  record(T, 'List: empty renders nothing', html(h(List, { items: [] })) === '')
  const table = (rows: { cells: string[]; suppressed?: boolean }[]) =>
    html(h(Table, { head: ['Group', 'n'], rows, caption: 'Results', empty: 'No groups yet' }))
  record(
    T,
    'Table: the scroll box is a named, focusable region',
    /<div class="table__wrap" role="region" aria-label="Results" tabindex="0">/.test(table([])),
  )
  record(
    T,
    'Table: no rows says so across every column',
    /colSpan="2"|colspan="2"/.test(table([])) && /No groups yet/.test(table([])),
  )
  record(
    T,
    'Table: a suppressed row is marked in every cell',
    (table([{ cells: ['a', 'b'], suppressed: true }]).match(/table__cell--suppressed/g) ?? [])
      .length === 2,
  )

  /* EVAL-12: the result and profile pictures carry their meaning in shape and words, each with a
     spoken sentence. */
  const ends = { left: 'Men first', middle: 'About equal', right: 'Women first' }
  const glance = html(
    h(Glance, {
      label: 'At a glance',
      rows: [
        {
          id: 'a',
          label: 'Women and men',
          status: 'Pattern',
          at: 0.3,
          lo: 0.2,
          hi: 0.4,
          point: 'solid',
          ends,
          said: 'Women and men: Pattern',
        },
        {
          id: 'b',
          label: 'Skin tone',
          status: 'Tagged after 1 more season',
          at: 0.5,
          lo: 0.3,
          hi: 0.7,
          point: 'hollow',
          ends,
          said: 'Skin tone: Tagged after 1 more season',
        },
      ],
    }),
  )
  record(
    T,
    'Glance: one row per reading, a solid point when tagged and a hollow one when not, the status in words, each line spoken',
    (glance.match(/glance__row/g) ?? []).length === 2 &&
      (glance.match(/rangeline__dot--hollow/g) ?? []).length === 1 &&
      /Tagged after 1 more season/.test(glance) &&
      /role="img" aria-label="Skin tone: Tagged after 1 more season"/.test(glance),
  )
  const dots = html(
    h(DotGrid, { filled: 3, rings: 2, dashed: 1, label: '6 pairs', caption: 'caption' }),
  )
  record(
    T,
    'DotGrid: filled, dashed and ring dots by shape, one spoken image, the caption visible',
    (dots.match(/dotgrid__dot--filled/g) ?? []).length === 3 &&
      (dots.match(/dotgrid__dot--dashed/g) ?? []).length === 1 &&
      (dots.match(/<i /g) ?? []).length === 6 &&
      /role="img" aria-label="6 pairs"/.test(dots) &&
      /<figcaption[^>]*>caption</.test(dots),
  )
  const tally = html(h(Tally, { k: 3, n: 4, caption: 'came first', said: '3 of 4 came first' }))
  const parts = html(
    h(Tally, {
      parts: [
        { label: 'Darker', n: 2 },
        { label: 'Lighter', n: 3 },
      ],
      said: 'Darker 2, lighter 3',
    }),
  )
  record(
    T,
    'Tally: the figures and the bar (75%), or two named parts with their counts; each spoken in a sentence',
    /3 \/ 4/.test(tally) &&
      /width:75%/.test(tally) &&
      /aria-label="3 of 4 came first"/.test(tally) &&
      /Darker: 2/.test(parts) &&
      /Lighter: 3/.test(parts) &&
      /tally__fill--second/.test(parts),
  )
  const pairs = html(
    h(Pairs, {
      label: 'Pairs',
      firstWord: 'first',
      items: [
        {
          context: 'Chapter 1',
          first: 'Ravi',
          other: 'Meena',
          relation: 'equal',
          said: 'Ravi first',
        },
        { first: 'Asha', other: 'Imran', relation: 'weaker', said: 'Asha weaker first' },
        {
          first: 'Uma',
          other: 'Ali',
          relation: 'equal',
          even: true,
          count: '2 each of 4',
          said: 'even',
        },
      ],
    }),
  )
  record(
    T,
    'Pairs: who came first is set first and marked in words ("first"); "=" or "<" between the names; an even pair has no mark; each row spoken',
    (pairs.match(/pairs__mark/g) ?? []).length === 2 &&
      />=</.test(pairs) &&
      />&lt;</.test(pairs) &&
      /2 each of 4/.test(pairs) &&
      (pairs.match(/role="img"/g) ?? []).length === 3 &&
      !/<img/.test(pairs),
  )
  const trend = html(
    h(Trend, {
      label: 'trend said',
      ends: { top: 'Women first', middle: 'About equal', bottom: 'Men first' },
      items: [
        { when: 'Jun', at: 0.2, lo: 0.1, hi: 0.3 },
        { when: 'Jul', at: 0.6, lo: 0.5, hi: 0.7, change: true },
        { when: 'Aug', at: 0.4, lo: 0.3, hi: 0.5 },
        { when: 'Sep', at: 0.35, lo: 0.3, hi: 0.4 },
      ],
    }),
  )
  record(
    T,
    'Trend: a point per season, a change drawn as a square with its own bar and the band broken there, one spoken image',
    (trend.match(/trend__point/g) ?? []).length === 5 &&
      (trend.match(/trend__point--change/g) ?? []).length === 1 &&
      (trend.match(/<polygon/g) ?? []).length === 1 &&
      (trend.match(/trend__bar/g) ?? []).length === 2 &&
      /role="img" aria-label="trend said"/.test(trend),
  )
}
