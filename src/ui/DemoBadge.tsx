import './demo.css'

export function DemoBadge({ text }: { text: string }) {
  return (
    <p className="demo" role="note">
      {text}
    </p>
  )
}
