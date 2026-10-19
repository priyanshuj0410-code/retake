import './code.css'

export function Code({ value, label }: { value: string; label: string }) {
  return (
    <p className="code" aria-label={`${label}: ${value.split('').join(' ')}`}>
      {value}
    </p>
  )
}
