import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { Character, type CharacterView } from './Character'
import './sortlist.css'

export interface SortListProps {
  items: CharacterView[]
  /** order[p] is the index in items shown at position p. */
  order: number[]
  onChange: (order: number[]) => void
  labels: {
    up: (name: string) => string
    down: (name: string) => string
    moved: (name: string, pos: number, of: number) => string
    label: string
  }
}

/** The motion token's current value in ms: 160, or 0 under reduced motion. */
const motionMs = (el: Element) => parseFloat(getComputedStyle(el).getPropertyValue('--motion')) || 0

/**
 * Drag a row by its body, or use its up and down buttons; every move is announced. A button at
 * the end of the list is aria-disabled, not disabled, so keyboard focus stays on it, and
 * pressing it says again where the row is. The lifted row scales up with a shadow and settles
 * back on release; rows that change place slide there (FLIP, one motion duration, none under
 * reduced motion). Pointer Events and the Web Animations API only: no library.
 */
export function SortList({ items, order, onChange, labels }: SortListProps) {
  const [live, setLive] = useState('')
  const [dragging, setDragging] = useState<number | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const drag = useRef<{ from: number; startY: number; pointer: number } | null>(null)
  /* FLIP: each row's offset before the last render, keyed by item. */
  const tops = useRef(new Map<number, number>())
  useLayoutEffect(() => {
    const rows = Array.from(listRef.current?.children ?? []) as HTMLElement[]
    const ms = listRef.current ? motionMs(listRef.current) : 0
    for (const row of rows) {
      const key = Number(row.dataset.item)
      const was = tops.current.get(key)
      const now = row.offsetTop
      tops.current.set(key, now)
      if (was === undefined || was === now || ms === 0) continue
      const lifted = getComputedStyle(row).transform
      const end = lifted === 'none' ? 'none' : lifted
      row.animate(
        [
          { transform: `translateY(${was - now}px) ${lifted === 'none' ? '' : lifted}` },
          { transform: end },
        ],
        { duration: ms, easing: 'ease-out' },
      )
    }
  }, [order])

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) {
      /* At a limit: nothing moves; say again where the row is (a trailing no-break space
         makes the live region announce the same words twice). */
      const again = labels.moved(items[order[from]].name, from + 1, order.length)
      setLive((l) => (l === again ? `${again}\u00a0` : again))
      return
    }
    if (from === to) return
    const next = order.slice()
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    onChange(next)
    setLive(labels.moved(items[x].name, to + 1, order.length))
  }

  const rowAt = (y: number) => {
    const rows = Array.from(listRef.current?.children ?? []) as HTMLElement[]
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect()
      if (y < r.top + r.height / 2) return i
    }
    return rows.length - 1
  }

  /* The drag listens on the window, not through pointer capture: React moves the row in the
     DOM as it passes another, and a moved element loses its capture. */
  /* Stable listeners that call the latest handlers, so the ones removed are the ones added. */
  const stable = useRef<{
    move: (e: globalThis.PointerEvent) => void
    up: (e: globalThis.PointerEvent) => void
  } | null>(null)
  stable.current ??= {
    move: (e) => moveRef.current(e),
    up: (e) => upRef.current(e),
  }
  const { move: onMove, up: onUp } = stable.current
  const moveDrag = (e: globalThis.PointerEvent) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointer || Math.abs(e.clientY - d.startY) < 12) return
    const to = rowAt(e.clientY)
    if (to !== d.from) {
      move(d.from, to)
      d.from = to
      d.startY = e.clientY
      setDragging(to)
    }
  }
  const up = (e: globalThis.PointerEvent) => {
    if (drag.current && e.pointerId !== drag.current.pointer) return
    drag.current = null
    setDragging(null)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }
  const moveRef = useRef(moveDrag)
  const upRef = useRef(up)
  moveRef.current = moveDrag
  upRef.current = up
  const down = (pos: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { from: pos, startY: e.clientY, pointer: e.pointerId }
    setDragging(pos)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <>
      <ol className="sort" ref={listRef} aria-label={labels.label}>
        {order.map((idx, pos) => (
          <li
            key={idx}
            data-item={idx}
            className={dragging === pos ? 'sort__row sort__row--dragging' : 'sort__row'}
          >
            <span className="sort__rank" aria-hidden="true">
              {pos + 1}
            </span>
            <div className="sort__body sort__handle" onPointerDown={down(pos)}>
              <Character c={items[idx]} />
            </div>
            <div className="sort__moves">
              <button
                type="button"
                className="sort__move"
                onClick={() => move(pos, pos - 1)}
                aria-disabled={pos === 0}
                aria-label={labels.up(items[idx].name)}
              >
                ↑
              </button>
              <button
                type="button"
                className="sort__move"
                onClick={() => move(pos, pos + 1)}
                aria-disabled={pos === order.length - 1}
                aria-label={labels.down(items[idx].name)}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
      <p className="sort__live" aria-live="polite">
        {live}
      </p>
    </>
  )
}
