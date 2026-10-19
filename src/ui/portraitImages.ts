/**
 * Generated portrait images (owner decision, 19 Oct 2026): WebP headshots made separately land
 * in public/portraits/, with a manifest.json listing what exists. People are keyed by slot and
 * sex, with one pre-rendered image per skin tone ({slot}-{sex}-{tone}.webp, tones l1, l2, d1,
 * d2); one-off characters by their slot (100 up) and sex, at the medium tone they all share
 * (o{slot}-{sex}.webp); mascots by animal (mascot-{animal}.webp). Only files the manifest lists are used, so a
 * missing image never shows a broken picture: the drawn SVG is the fallback. The manifest is
 * fetched once, from this app's own origin; until it arrives, and if it is absent, every
 * portrait is drawn.
 */
import { useSyncExternalStore } from 'react'
import type { Look } from './portraitArt'

const BASE = `${import.meta.env?.BASE_URL ?? '/'}portraits/`
let files: ReadonlySet<string> | null = null
let asked = false
const subscribers = new Set<() => void>()

/** The manifest may be a list of file names or paths, or an object with a `files` list. */
function names(json: unknown): string[] {
  const list = Array.isArray(json)
    ? json
    : json && typeof json === 'object' && Array.isArray((json as { files?: unknown }).files)
      ? (json as { files: unknown[] }).files
      : []
  return list.filter((x): x is string => typeof x === 'string').map((x) => x.split('/').pop() ?? x)
}

/** Sets the known files (the manifest's list); the checks use it to render with images. */
export function setPortraitFiles(list: string[] | null) {
  files = list ? new Set(names(list)) : null
  subscribers.forEach((f) => f())
}

function subscribe(f: () => void) {
  subscribers.add(f)
  if (!asked && typeof fetch === 'function') {
    asked = true
    fetch(`${BASE}manifest.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((j: unknown) => setPortraitFiles(names(j)))
      .catch(() => setPortraitFiles([]))
  }
  return () => subscribers.delete(f)
}

/** The file for a look, if the manifest lists one. */
export function fileFor(look: Look, known: ReadonlySet<string> | null): string | null {
  if (!known) return null
  const name =
    look.kind === 'animal'
      ? `mascot-${look.animal}.webp`
      : look.slot === undefined
        ? null
        : look.oneOff
          ? `o${look.slot}-${look.sex}.webp`
          : `${look.slot}-${look.sex}-${look.tone}.webp`
  return name && known.has(name) ? `${BASE}${name}` : null
}

export const usePortraitFiles = () =>
  useSyncExternalStore(
    subscribe,
    () => files,
    () => files,
  )
