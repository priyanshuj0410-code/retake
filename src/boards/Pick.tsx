import type { PickStep } from '../content'
import type { PickAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Options, Person } from '../ui'
import { personView, useSkin, type BoardProps } from './common'

/** A two-way (or few-way) pick. People options show the same stats; only their words differ. */
export function PickBoard({ step, answer, onChange, order }: BoardProps<PickStep, PickAnswer>) {
  const { tx, lang } = useT()
  const skin = useSkin()
  const people = order(
    step.options.filter((o) => o.who),
    (o) => o.id,
  )
  const even = step.options.filter((o) => !o.who)
  const tiles = people.length === 2 && even.length === 0
  return (
    <Options label={tx(step.prompt)} role="radiogroup" columns={tiles ? 2 : 1}>
      {[...people, ...even].map((o) => (
        <Person
          key={o.id}
          skin={skin}
          role="radio"
          layout={tiles ? 'tile' : 'row'}
          checked={answer.choice === o.id}
          onPress={() => onChange({ ...answer, choice: o.id })}
          person={
            o.who
              ? personView(o.who, lang, {
                  quote: o.quote ? tx(o.quote) : undefined,
                  stats: step.stats?.map((s) => ({ n: String(o.values?.[s.id] ?? ''), label: tx(s.label) })),
                })
              : { id: o.id, name: tx(o.label ?? { en: o.id }), art: false }
          }
        />
      ))}
    </Options>
  )
}
