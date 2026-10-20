import { useState } from 'react'
import type { AssignStep } from '../content'
import type { AssignAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Button, Choices, Options, Person, Slots, Stack, Text } from '../ui'
import { personView, useSkin, type BoardProps } from './common'

/** Lock a rule, then assign people to slots. The people appear only once the rule is locked. */
export function AssignBoard({ step, answer, onChange, order }: BoardProps<AssignStep, AssignAnswer>) {
  const { t, tx, lang } = useT()
  const skin = useSkin()
  const [armed, setArmed] = useState<string | null>(null)
  const rules = step.rules.map((r) => ({ id: r.id, label: tx(r.label) }))
  const slotOf = (who: string) => Object.entries(answer.slots).find(([, v]) => v === who)?.[0]
  if (!answer.locked)
    return (
      <Stack>
        <Choices
          legend={t('assign.rule')}
          options={rules}
          value={answer.rule}
          onChange={(rule) => onChange({ ...answer, rule })}
        />
        <Button
          variant="secondary"
          disabled={!answer.rule}
          onPress={() => onChange({ ...answer, locked: true })}
        >
          {t('assign.lock')}
        </Button>
      </Stack>
    )
  const place = (slot: string) => {
    const slots = { ...answer.slots }
    if (armed) {
      for (const k of Object.keys(slots)) if (slots[k] === armed) slots[k] = null
      slots[slot] = armed
      setArmed(null)
    } else slots[slot] = null
    onChange({ ...answer, slots })
  }
  const label = (s: AssignStep['slots'][number]) => tx(s.label)
  return (
    <Stack>
      <Text size="s">{t('assign.locked', { rule: rules.find((r) => r.id === answer.rule)?.label ?? '' })}</Text>
      <Text>{t('assign.howto')}</Text>
      <Slots
        label={tx(step.prompt)}
        armed={armed !== null}
        slots={step.slots.map((s) => {
          const who = answer.slots[s.id]
          return {
            id: s.id,
            label: label(s),
            who: who ? personView(who, lang).name : null,
            action: who ? t('assign.clear', { slot: label(s) }) : `${label(s)}: ${t('assign.empty')}`,
          }
        })}
        onSlot={place}
      />
      <Options label={tx(step.prompt)}>
        {order(step.people, (p) => p.who).map((p) => {
          const placed = slotOf(p.who)
          return (
            <Person
              key={p.who}
              skin={skin}
              role="button"
              checked={armed === p.who}
              onPress={() => setArmed(armed === p.who ? null : p.who)}
              portrait="s"
              mark={placed ? label(step.slots.find((s) => s.id === placed)!) : ''}
              markEmpty={!placed}
              person={personView(p.who, lang, {
                stats: step.stats.map((s) => ({ n: String(p.values[s.id]), label: tx(s.label) })),
              })}
            />
          )
        })}
      </Options>
    </Stack>
  )
}
