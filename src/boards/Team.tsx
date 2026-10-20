import { cast, type TeamStep } from '../content'
import type { TeamAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Choices, Options, Person, Stack, Text, Voice } from '../ui'
import { nameOf, personView, useSkin, type BoardProps } from './common'

/** Pick a team of `seats`, then answer the voice pressing on it. */
export function TeamBoard({ step, answer, onChange, order }: BoardProps<TeamStep, TeamAnswer>) {
  const { t, tx, lang } = useT()
  const skin = useSkin()
  const full = answer.picked.length >= step.seats
  return (
    <Stack>
      <Text size="l">{t('team.picked', { n: answer.picked.length, seats: step.seats })}</Text>
      <Options label={tx(step.prompt)} columns={2}>
        {order(step.people, (p) => p.who).map((p) => {
          const on = answer.picked.includes(p.who)
          return (
            <Person
              key={p.who}
              skin={skin}
              role="checkbox"
              portrait="s"
              checked={on}
              disabled={!on && full}
              onPress={() =>
                onChange({
                  ...answer,
                  picked: on ? answer.picked.filter((x) => x !== p.who) : [...answer.picked, p.who],
                })
              }
              person={personView(p.who, lang, { stats: [{ n: String(p.value), label: tx(step.stat.label) }] })}
            />
          )
        })}
      </Options>
      <Voice
        id={step.voice.who}
        name={nameOf(step.voice.who, lang)}
        art={cast(step.voice.who).art}
        skin={skin}
        line={tx(step.voice.line)}
      />
      <Choices
        legend={tx(step.responsePrompt)}
        options={step.responses.map((r) => ({ id: r.id, label: tx(r.label) }))}
        value={answer.response}
        onChange={(response) => onChange({ ...answer, response })}
      />
    </Stack>
  )
}
