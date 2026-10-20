import { cast, type SwipeStep } from '../content'
import type { SwipeAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Notice, Swipe } from '../ui'
import { nameOf, useSkin, type BoardProps } from './common'

/** Quick-fire keep or cut, one line at a time. */
export function SwipeBoard({ step, answer, onChange, order }: BoardProps<SwipeStep, SwipeAnswer>) {
  const { t, tx, lang } = useT()
  const skin = useSkin()
  const items = order(step.items, (i) => i.id)
  const at = items.findIndex((i) => !answer.verdicts[i.id])
  if (at < 0) return <Notice live>{t('swipe.progress', { i: items.length, n: items.length })}</Notice>
  const item = items[at]
  return (
    <Swipe
      skin={skin}
      progress={t('swipe.progress', { i: at + 1, n: items.length })}
      cut={tx(step.cut)}
      keep={tx(step.keep)}
      item={{ id: item.id, who: item.who, name: nameOf(item.who, lang), art: cast(item.who).art, text: tx(item.text) }}
      onVerdict={(v) => onChange({ ...answer, verdicts: { ...answer.verdicts, [item.id]: v } })}
    />
  )
}
