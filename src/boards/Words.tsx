import { useState } from 'react'
import { cast, type WordsStep } from '../content'
import type { WordsAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Plate, Stack, Text, WordBank, WordNote } from '../ui'
import { nameOf, useSkin, type BoardProps } from './common'

/** Two notes on the same facts, filled from one shared bank of words. */
export function WordsBoard({ step, answer, onChange, order }: BoardProps<WordsStep, WordsAnswer>) {
  const { t, tx, lang } = useT()
  const skin = useSkin()
  const people = order(step.people, (p) => p)
  const firstEmpty = () => {
    for (const p of people) {
      const i = answer.notes[p].indexOf(null)
      if (i >= 0) return { who: p, i }
    }
    return null
  }
  const [active, setActive] = useState<{ who: string; i: number } | null>(firstEmpty)
  const word = (id: string | null) => {
    const w = step.bank.find((b) => b.id === id)
    return w ? tx(w.text) : null
  }
  const fill = (id: string) => {
    if (!active) return
    const notes = { ...answer.notes, [active.who]: answer.notes[active.who].map((w, i) => (i === active.i ? id : w)) }
    onChange({ ...answer, notes })
    let next: { who: string; i: number } | null = null
    for (const p of people) {
      const i = notes[p].indexOf(null)
      if (i >= 0) {
        next = { who: p, i }
        break
      }
    }
    setActive(next)
  }
  return (
    <Stack>
      <Plate tone="plate">
        <Text>{tx(step.facts)}</Text>
      </Plate>
      <Text size="s">{t('words.howto')}</Text>
      {people.map((p) => {
        const name = nameOf(p, lang)
        const parts = tx(step.template, { name }).split('___')
        return (
          <WordNote
            key={p}
            id={p}
            name={name}
            art={cast(p).art}
            skin={skin}
            parts={parts}
            blanks={answer.notes[p].map((w, i) => ({
              text: word(w),
              label: t('words.blank', { i: i + 1, name }),
              active: active?.who === p && active.i === i,
            }))}
            onBlank={(i) => setActive({ who: p, i })}
          />
        )
      })}
      <WordBank
        label={tx(step.prompt)}
        disabled={!active}
        words={step.bank.map((b) => ({ id: b.id, text: tx(b.text) }))}
        onWord={fill}
      />
    </Stack>
  )
}
