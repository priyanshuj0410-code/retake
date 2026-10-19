import './devnotes.css'

/**
 * Pending markers for the research team, never player copy: shown only by the Vite dev server
 * (`import.meta.env.DEV`), folded, and marked `data-dev` so the PENDING check leaves it out.
 * A production build renders nothing.
 */
export function DevNotes({ title, notes }: { title: string; notes: string[] }) {
  if (!import.meta.env?.DEV || notes.length === 0) return null
  return (
    <details className="devnotes" data-dev="">
      <summary className="devnotes__summary">{title}</summary>
      <ul className="devnotes__list">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </details>
  )
}
