import { useState } from 'react'
import { Button } from './Button'
import './share.css'

/**
 * The summary card a player can keep or pass on: the season and the band, nothing else about
 * them, worded to work for every band. Share uses the device's own share sheet where there is
 * one, else copies the words; the result is a status line and focus stays on the button.
 */
export function ShareCard({
  text,
  title,
  button,
  copied,
  failed,
}: {
  text: string
  title: string
  button: string
  copied: string
  failed: string
}) {
  const [status, setStatus] = useState('')
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setStatus(copied)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setStatus(failed)
    }
  }
  return (
    <section className="share" aria-label={title}>
      <p className="share__card">{text}</p>
      <Button kind="secondary" onClick={() => void share()}>
        {button}
      </Button>
      <p className="share__status" role="status">
        {status}
      </p>
    </section>
  )
}
