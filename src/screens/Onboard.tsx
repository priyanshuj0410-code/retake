import { useState } from 'react'
import { sampleTaken } from '../engine/board'
import { handleKey, handleText, offers } from '../engine/handles'
import { LANGS, useT } from '../i18n'
import { store, useSaved } from '../store'
import { Button, Choices, Notice, Shell, Stack, Text, Title } from '../ui'

/** First run: the language, then a generated road name. */
export function Language() {
  const { t } = useT()
  return (
    <Shell meta={[t('app.name'), '']} screen="lang">
      <Title>{t('app.name')}</Title>
      <Text size="l">{t('app.tagline')}</Text>
      <Choices
        legend={t('lang.title')}
        columns={2}
        value={null}
        options={LANGS.map((l) => ({ id: l.id, label: l.label, lang: l.htmlLang }))}
        onChange={(id) => store.update((s) => ({ ...s, lang: id as 'en' | 'hi' }))}
      />
      {LANGS.some((l) => l.draft) ? <Notice>{t('lang.draftNote')}</Notice> : null}
    </Shell>
  )
}

export function HandlePick() {
  const { t, lang } = useT()
  const saved = useSaved()
  const [round, setRound] = useState(0)
  const options = offers(saved.seed, round, sampleTaken())
  const [chosen, setChosen] = useState<string | null>(null)
  const pick = options.find((o) => handleKey(o) === chosen) ?? null
  return (
    <Shell meta={[t('app.name'), '']} screen="handle">
      <Title>{t('handle.title')}</Title>
      <Text>{t('handle.lede')}</Text>
      <Choices
        legend={t('handle.title')}
        value={chosen}
        options={options.map((o) => ({ id: handleKey(o), label: handleText(o, lang) }))}
        onChange={setChosen}
      />
      <Stack>
        <Button
          variant="secondary"
          onPress={() => {
            setRound(round + 1)
            setChosen(null)
          }}
        >
          {t('handle.more')}
        </Button>
        <Button disabled={!pick} onPress={() => pick && store.update((s) => ({ ...s, handle: pick }))}>
          {t('handle.confirm')}
        </Button>
      </Stack>
    </Shell>
  )
}
