import type { ChecksStep } from '../content'
import { checksUsed, type ChecksAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Choices, Options, Person, Punches, Stack, Text, Voice } from '../ui'
import { nameOf, personView, useSkin, type BoardProps } from './common'
import { cast } from '../content'

/** Spend checks across candidates (each a punch that stays), then choose one. */
export function ChecksBoard({ step, answer, onChange, order }: BoardProps<ChecksStep, ChecksAnswer>) {
  const { t, tx, lang } = useT()
  const skin = useSkin()
  const left = step.budget - checksUsed(answer)
  const people = order(step.people, (p) => p.who)
  return (
    <Stack>
      {step.voice ? (
        <Voice
          id={step.voice.who}
          name={nameOf(step.voice.who, lang)}
          art={cast(step.voice.who).art}
          skin={skin}
          line={tx(step.voice.line)}
        />
      ) : null}
      <Text size="l">{t('checks.left', { n: left })}</Text>
      <Options label={tx(step.prompt)}>
        {people.map((p) => {
          const used = answer.checks[p.who] ?? 0
          return (
            <Person
              key={p.who}
              skin={skin}
              role="button"
              disabled={left === 0}
              onPress={() => onChange({ ...answer, checks: { ...answer.checks, [p.who]: used + 1 } })}
              label={`${tx(step.checkLabel)}: ${nameOf(p.who, lang)}, ${t('unit.checks', { n: used })}`}
              aside={<Punches used={used} total={step.budget} label={t('unit.checks', { n: used })} />}
              person={personView(p.who, lang, {
                record: tx(p.record),
                quote: used > 0 ? tx(p.finding) : undefined,
              })}
            />
          )
        })}
      </Options>
      <Choices
        legend={tx(step.choosePrompt)}
        columns={3}
        options={people.map((p) => ({ id: p.who, label: nameOf(p.who, lang) }))}
        value={answer.choice}
        onChange={(choice) => onChange({ ...answer, choice })}
      />
    </Stack>
  )
}
