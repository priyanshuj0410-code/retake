import { useState } from 'react'
import { Button } from './Button'
import { Checks } from './Choice'
import './share.css'

/**
 * The summary card a player can keep or pass on (EVAL-10, owner): by default the season only
 * ("I played Team Season: The warehouse. 77 decisions, 5 chapters, 8 colleagues. Try it
 * yourself."). An unticked "Include my result" adds the women-and-men tag and one line on how
 * often chance alone gives it; nothing else about the player, and never religion or skin tone.
 * Share uses the device's own share sheet where there is one, else copies the words; the result
 * is a status line and focus stays on the button.
 */
export function ShareCard({
  text,
  result,
  include,
  includeLegend,
  title,
  button,
  copied,
  failed,
}: {
  text: string
  /** The result lines the box adds: the tag and the chance line. */
  result?: string
  /** The box's label, "Include my result". */
  include?: string
  /** The box's question, "Add to the card". */
  includeLegend?: string
  title: string
  button: string
  copied: string
  failed: string
}) {
  const [status, setStatus] = useState('')
  const [withResult, setWithResult] = useState(false)
  const card = withResult && result ? `${text} ${result}` : text
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: card })
        return
      }
      await navigator.clipboard.writeText(card)
      setStatus(copied)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setStatus(failed)
    }
  }
  return (
    <section className="share" aria-label={title}>
      <p className="share__card">{card}</p>
      {result && include ? (
        <Checks
          legend={includeLegend ?? title}
          options={[{ id: 'result', text: include }]}
          value={withResult ? ['result'] : []}
          onChange={(ids) => setWithResult(ids.includes('result'))}
        />
      ) : null}
      <Button kind="secondary" onClick={() => void share()}>
        {button}
      </Button>
      <p className="share__status" role="status">
        {status}
      </p>
    </section>
  )
}
