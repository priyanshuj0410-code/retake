import './slots.css'

/** The places to fill (jobs, berths): each a button; tap one to place the chosen person. */
export function Slots(props: {
  label: string
  slots: { id: string; label: string; who: string | null; action: string }[]
  armed: boolean
  onSlot: (id: string) => void
}) {
  return (
    <div className="slots" role="group" aria-label={props.label}>
      {props.slots.map((s) => (
        <button
          type="button"
          key={s.id}
          className="slots__slot"
          data-filled={s.who ? 'true' : 'false'}
          data-armed={props.armed ? 'true' : 'false'}
          data-next={props.armed && !s.who ? 'true' : 'false'}
          aria-label={s.action}
          onClick={() => props.onSlot(s.id)}
        >
          <span className="slots__label">{s.label}</span>
          <span className="slots__who">{s.who ?? ''}</span>
        </button>
      ))}
    </div>
  )
}
