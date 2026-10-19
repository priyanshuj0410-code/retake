import './character.css'

export interface CharacterView {
  figure: string
  /** Words for a screen reader: "woman, darker skin tone" or "elephant". */
  figureLabel: string
  name: string
  cues: string[]
  description: string
}

export function Character({ c }: { c: CharacterView }) {
  return (
    <div className="character">
      <span className="character__figure" role="img" aria-label={c.figureLabel}>
        {c.figure}
      </span>
      <div className="character__who">
        <p className="character__name">{c.name}</p>
        {c.cues.map((q) => (
          <p className="character__cue" key={q}>
            {q}
          </p>
        ))}
      </div>
      <p className="character__desc">{c.description}</p>
    </div>
  )
}
