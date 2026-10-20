import { DAYS } from '../content'
import { anchorDate, clearOverride } from '../engine/calendar'
import { useT } from '../i18n'
import { store } from '../store'
import { Button, Link, Shell, Stack, Text, Title } from '../ui'

/** The prototype menu: jump to any of the fortnight's 14 days, or start again. */
export function Dev(props: { go: (h: string) => void }) {
  const { t, tx, date } = useT()
  return (
    <Shell meta={[t('app.name'), t('dev.title')]} screen="dev">
      <Title>{t('dev.title')}</Title>
      <Text>{t('dev.lede')}</Text>
      <Stack gap="s">
        {DAYS.map((d) => (
          <Link key={d.id} href={`#/?day=${d.n}`}>
            {t('dev.day', { n: d.n, date: date(anchorDate(d.n)), object: tx(d.object) })}
          </Link>
        ))}
      </Stack>
      <Button
        variant="secondary"
        onPress={() => {
          clearOverride()
          props.go('#/')
        }}
      >
        {t('dev.clear')}
      </Button>
      <Button
        variant="secondary"
        onPress={() => {
          store.reset()
          props.go('#/')
        }}
      >
        {t('dev.reset')}
      </Button>
    </Shell>
  )
}
