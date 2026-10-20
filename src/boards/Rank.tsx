import type { RankStep } from '../content'
import type { RankAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Button, Choices, Options, Person, Stack, Text } from '../ui'
import { personView, useSkin, type BoardProps } from './common'

/** Rank people by tapping them in order, after locking a rule when the step has rules. */
export function RankBoard({ step, answer, onChange, order }: BoardProps<RankStep, RankAnswer>) {
  const { t, tx, lang } = useT()
  const skin = useSkin()
  const rules = (step.rules ?? []).map((r) => ({ id: r.id, label: tx(r.label) }))
  if (!answer.locked)
    return (
      <Stack>
        <Choices
          legend={t('rank.rule')}
          options={rules}
          value={answer.rule}
          onChange={(rule) => onChange({ ...answer, rule })}
        />
        <Button variant="secondary" disabled={!answer.rule} onPress={() => onChange({ ...answer, locked: true })}>
          {t('rank.lock')}
        </Button>
      </Stack>
    )
  return (
    <Stack>
      {answer.rule ? (
        <Text size="s">{t('rank.locked', { rule: rules.find((r) => r.id === answer.rule)?.label ?? '' })}</Text>
      ) : null}
      <Text>{t('rank.howto')}</Text>
      <Options label={tx(step.prompt)}>
        {order(step.people, (p) => p.who).map((p) => {
          const at = answer.order.indexOf(p.who)
          return (
            <Person
              key={p.who}
              skin={skin}
              role="button"
              checked={at >= 0}
              onPress={() =>
                onChange({
                  ...answer,
                  order: at >= 0 ? answer.order.slice(0, at) : [...answer.order, p.who],
                })
              }
              mark={at >= 0 ? tx(step.positions[at]) : ''}
              markEmpty={at < 0}
              person={personView(p.who, lang, { record: tx(p.record) })}
            />
          )
        })}
      </Options>
      <Button variant="secondary" disabled={answer.order.length === 0} onPress={() => onChange({ ...answer, order: [] })}>
        {t('rank.clear')}
      </Button>
    </Stack>
  )
}
