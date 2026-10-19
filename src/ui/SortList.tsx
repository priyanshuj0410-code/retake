import { useRef, useState, type PointerEvent } from 'react'
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

/** Drag a row by its body, or use its up and down buttons; every move is announced. A button
    at the end of the list is aria-disabled, not disabled, so keyboard focus stays on it. */
export function SortList({ items, order, onChange, labels }: SortListProps) {
  const [live, setLive] = useState('')
  const [dragging, setDragging] = useState<number | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const drag = useRef<{ from: number; startY: number; pointer: number } | null>(null)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return
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

  const down = (pos: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { from: pos, startY: e.clientY, pointer: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(pos)
  }
  const moveDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || Math.abs(e.clientY - d.startY) < 12) return
    const to = rowAt(e.clientY)
    if (to !== d.from) {
      move(d.from, to)
      d.from = to
      d.startY = e.clientY
      setDragging(to)
    }
  }
  const up = () => {
    drag.current = null
    setDragging(null)
  }

  return (
    <>
      <ol className="sort" ref={listRef} aria-label={labels.label}>
        {order.map((idx, pos) => (
          <li
            key={idx}
            className={dragging === pos ? 'sort__row sort__row--dragging' : 'sort__row'}
          >
            <span className="sort__rank" aria-hidden="true">
              {pos + 1}
            </span>
            <div
              className="sort__body sort__handle"
              onPointerDown={down(pos)}
              onPointerMove={moveDrag}
              onPointerUp={up}
              onPointerCancel={up}
            >
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
