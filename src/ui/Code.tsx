import { useRef, useState } from 'react'
import { Button } from './Button'
import './code.css'

/**
 * The withdrawal code in large monospace groups. One tap selects the whole code; with `copy`,
 * a button copies it and a status line says so (the system clipboard, or a selection and the
 * browser's copy command on old phones without it). Nothing times out: the line stays.
 */
export function Code({
  value,
  label,
  copy,
}: {
  value: string
  label: string
  copy?: { button: string; done: string }
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [copied, setCopied] = useState(false)
  const select = () => {
    const el = ref.current
    if (!el) return false
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    return true
  }
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(select() && document.execCommand('copy'))
    }
  }
  return (
    <>
      <p ref={ref} className="code" aria-label={`${label}: ${value.split('').join(' ')}`}>
        {value}
      </p>
      {copy ? (
        <>
          <Button kind="secondary" onClick={() => void doCopy()}>
            {copy.button}
          </Button>
          <p className="code__status" role="status">
            {copied ? copy.done : ''}
          </p>
        </>
      ) : null}
    </>
  )
}
