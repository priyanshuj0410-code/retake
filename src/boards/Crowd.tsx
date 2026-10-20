import { cast, type CrowdStep } from '../content'
import type { CrowdAnswer } from '../engine/answers'
import { useT } from '../i18n'
import { Cluster, Portrait, Slider, Stack } from '../ui'
import { nameOf, useSkin, type BoardProps } from './common'

/** Predict the crowd: a share from 0 to 100, scored later on how close it was. */
export function CrowdBoard({ step, answer, onChange }: BoardProps<CrowdStep, CrowdAnswer>) {
  const { t, lang } = useT()
  const skin = useSkin()
  return (
    <Stack>
      <Cluster>
        {(step.who ?? []).map((w) => (
          <Portrait key={w} id={w} name={nameOf(w, lang)} art={cast(w).art} skin={skin} size="l" />
        ))}
      </Cluster>
      <Slider
        caption={t('crowd.yours')}
        label={t('crowd.label')}
        value={answer.guess}
        onChange={(guess) => onChange({ ...answer, guess })}
      />
    </Stack>
  )
}
