/**
 * A season in progress as this device keeps it between reloads (src/store/progress.ts; never
 * sent anywhere), read by the play screen and, since EVAL-12, by the landing's "Resume chapter N".
 */
import type { Lang } from '../content/types'
import { config } from '../engine/config'
import type { FirmLabels } from '../engine/runner'
import { fromSeed, type Seed } from '../engine/rng'
import { progress } from '../store/progress'
import type { StartResult } from '../store/types'
import { storyById } from './content'
import { StoryRunner, type RunnerState } from './runner'

export type Pre = 'disclosure' | 'consent' | 'language' | 'declined' | 'pick'
type Entry = StartResult & { firm?: FirmLabels }
type Finish = 'submitted' | 'withdrawn' | null

/** A season session as this device keeps it between reloads (never sent anywhere). */
export interface Saved {
  v: 1
  entry: Entry
  pre: Pre
  eligible: 'unasked' | 'yes' | 'no'
  langs: Lang[] | null
  drawn: string | null
  season: { story: string; seed: Seed; langs: Lang[]; state: RunnerState } | null
  finished: Finish
  /** Stopped at a chapter end with "Stop here, carry on later". */
  stopped?: boolean
}

/** A save older than the configured days is deleted unsent (EVAL-8; PENDING v21). */
export function loadSaved(key: string | undefined): { saved: Saved | null; expired: boolean } {
  if (!key) return { saved: null, expired: false }
  const r = progress.fresh<Saved>(key, config.season.chapters.saveDays)
  return { saved: r.value, expired: r.expired }
}

/**
 * The season in progress this device holds, for the landing's "Resume chapter N" (EVAL-12): the
 * most recent unfinished, unexpired season save, its link and the chapter it is in (1 before the
 * story starts; the finale after chapter 5). Read only: nothing is spent or written.
 */
export function savedSeason(): { token: string; chapter: number; finale: boolean } | null {
  const found = progress
    .keys('play/')
    .map((key) => ({
      key,
      v: progress.fresh<Saved & { _savedAt?: number }>(key, config.season.chapters.saveDays).value,
    }))
    .filter(({ v }) => v && v.v === 1 && v.entry.ok && v.entry.dep === 'season' && !v.finished)
    .sort((a, b) => (b.v?._savedAt ?? 0) - (a.v?._savedAt ?? 0))[0]
  if (!found?.v) return null
  const r = restoreSeason(found.v)
  const chapter = r ? r.chapterAt() : 1
  return {
    token: found.key.slice('play/'.length),
    chapter: Math.min(chapter, r?.chapters ?? chapter),
    finale: !!r && chapter > r.chapters,
  }
}

export function restoreSeason(saved: Saved | null): StoryRunner | null {
  const s = saved?.season
  const story = s ? storyById(s.story) : undefined
  if (!s || !story) return null
  const r = new StoryRunner(fromSeed(s.seed), story, s.langs)
  r.restore(s.state)
  /* Reopened at a save point (a chapter end, or after "Stop here"): a new sitting. */
  if (!saved?.finished && (saved?.stopped || r.current?.kind === 'saved')) r.newSitting()
  return r
}
