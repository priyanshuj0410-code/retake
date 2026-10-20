import { useState } from 'react'
import { findPlayers, playerByKey, rankOf, topOfBoard } from '../engine/board'
import { handleText } from '../engine/handles'
import { totalPractice } from '../engine/results'
import { useT } from '../i18n'
import { store, useSaved } from '../store'
import { Button, Field, Figures, Heading, Notice, Ranks, Shell, Stack, Text, Title } from '../ui'
import { handleOf, TabBar, useMeta } from './common'

/** One global board by practice: the top ranks, the player's own rank and band, and friends. */
export function BoardScreen(props: { date: string }) {
  const { t, lang, num } = useT()
  const saved = useSaved()
  const [query, setQuery] = useState('')
  const [asked, setAsked] = useState('')
  const mine = totalPractice(saved)
  const r = rankOf(mine)
  const handle = handleOf(saved, lang)
  const render = (h: Parameters<typeof handleText>[0]) => handleText(h, lang)
  const found = findPlayers(asked, render).filter((p) => !saved.friends.includes(p.key))
  const friends = saved.friends.map(playerByKey).filter((p) => p !== undefined)
  return (
    <Shell meta={useMeta(props.date)} screen="board" nav={<TabBar at="board" />}>
      <Title>{t('board.title')}</Title>
      <Notice>{t('board.sample')}</Notice>
      <Figures
        rows={[
          { label: t('board.yourRank'), n: num(r.rank) },
          { label: t('board.band'), n: t('board.percentile', { p: r.topPercent }) },
          { label: t('board.practiceCol'), n: num(mine) },
        ]}
      />
      <Ranks
        caption={t('board.top')}
        cols={[t('board.rankCol'), t('board.nameCol'), t('board.practiceCol')]}
        rows={topOfBoard(10).map((p, i) => ({ rank: num(i + 1), name: render(p.handle), practice: num(p.practice) }))}
        you={{ rank: num(r.rank), name: t('board.you', { handle }), practice: num(mine) }}
      />
      <Stack>
        <Heading>{t('board.friends')}</Heading>
        {friends.length ? (
          <Ranks
            caption={t('board.friends')}
            cols={[t('board.rankCol'), t('board.nameCol'), t('board.practiceCol')]}
            rows={friends.map((p) => ({
              rank: num(rankOf(p.practice).rank),
              name: render(p.handle),
              practice: num(p.practice),
            }))}
          />
        ) : (
          <Text>{t('board.noFriends')}</Text>
        )}
        {friends.map((p) => (
          <Button
            key={p.key}
            variant="secondary"
            onPress={() => store.update((s) => ({ ...s, friends: s.friends.filter((f) => f !== p.key) }))}
          >
            {t('board.remove', { handle: render(p.handle) })}
          </Button>
        ))}
        <Field
          label={t('board.find')}
          value={query}
          onChange={setQuery}
          onSubmit={() => setAsked(query)}
          action={
            <Button variant="secondary" onPress={() => setAsked(query)}>
              {t('board.search')}
            </Button>
          }
        />
        {asked && !found.length ? <Notice live>{t('board.none')}</Notice> : null}
        {found.map((p) => (
          <Button
            key={p.key}
            onPress={() => store.update((s) => ({ ...s, friends: [...s.friends, p.key] }))}
          >
            {t('board.add', { handle: render(p.handle) })}
          </Button>
        ))}
      </Stack>
    </Shell>
  )
}
