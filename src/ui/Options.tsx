import './options.css'

/** A single choice that commits on the tap: a list of full-width option buttons (no Next). */
export function Options({
  options,
  onPick,
  label,
}: {
  options: { id: string; text: string }[]
  onPick: (id: string) => void
  label: string
}) {
  return (
    <ul className="options" aria-label={label}>
      {options.map((o) => (
        <li key={o.id}>
          <button type="button" className="options__option" onClick={() => onPick(o.id)}>
            {o.text}
          </button>
        </li>
      ))}
    </ul>
  )
}
