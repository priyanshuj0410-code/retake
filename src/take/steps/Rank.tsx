import { useId, useLayoutEffect, useRef, useState } from 'react'
import { T } from '../lang'
import { Question, Statkey, Voice } from '../parts'
import { Svg } from '../Svg'
import { Frame, useFx, useShuffled, was, type StepProps } from './common'
import { Row } from './Row'

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Rank, for the seats (first_take.step_rank): filled from the top by tapping, a ranked person tapped comes out. The
 * place is big type where the tick goes, ranked rows move up into their order, the places that win a seat show as
 * picks, and a perforation falls under the last seat (owner, 23 Oct 2026: "The rankings need to be more clear"). */
export function Rank(props: StepProps) {
  const { s } = props
  const seats = s.seats!
  const base = useShuffled(s.people)
  const [order, setOrder] = useState<string[]>(() => was(props, 'order')?.order ?? [])
  const fx = useFx(s.world)
  const qid = useId()
  const box = useRef<HTMLDivElement>(null)
  const before = useRef(new Map<string, number>())
  const tap = (name: string) => {
    if (props.revisit) return
    fx('fill')
    // where each row stands before the move, so it can glide to its new place
    before.current = new Map([...(box.current?.querySelectorAll<HTMLElement>('.row') ?? [])].map((r) => [r.dataset.en!, r.getBoundingClientRect().top]))
    setOrder(order.includes(name) ? order.filter((x) => x !== name) : [...order, name])
  }
  useLayoutEffect(() => {
    if (reduced()) return
    for (const r of box.current?.querySelectorAll<HTMLElement>('.row') ?? []) {
      const dy = (before.current.get(r.dataset.en!) ?? 0) - r.getBoundingClientRect().top
      if (dy && before.current.size) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2, 0, 0, 1)' })
    }
  }, [order])
  const rows = [...order.map((n) => base.find((p) => p.en === n)!), ...base.filter((p) => !order.includes(p.en))]
  const left = s.people.length - order.length
  const cut = (
    <div className="rkcut" key="cut" hidden={order.length < seats}>
      <Svg name="arrow" />
      <T t={s.cut ?? [`${seats} seats`, `${seats} सीटें`]} />
    </div>
  )
  const items = rows.map((p) => {
    const k = order.indexOf(p.en) + 1
    return (
      <Row
        key={p.en}
        s={s}
        p={p}
        checked={k > 0 && k <= seats}
        place={k || undefined}
        mark={
          <b className="rkno" aria-hidden="true">
            {k || ''}
          </b>
        }
        onClick={() => tap(p.en)}
      />
    )
  })
  items.splice(order.length >= seats ? seats : items.length, 0, cut)
  return (
    <Frame
      {...props}
      cls="js-rank"
      button={left ? [`Rank ${left} more`, `${left} और क्रम में लगाएँ`] : s.button}
      live={!left}
      commit={() => props.onCommit({ order })}
    >
      <Question s={s} id={qid} />
      <Voice s={s} />
      <Statkey keys={s.keys} />
      <div className="rows is-compact" role="group" aria-labelledby={qid} ref={box}>
        {items}
      </div>
    </Frame>
  )
}
