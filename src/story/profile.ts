/**
 * The optional, pseudonymous player profile (EVAL-4, the owner's retake decision of 19 Oct
 * 2026). Made after a result, never before. It holds a display name and one entry per saved
 * season: the story, the day, the band and the numbers behind it, and that season's
 * withdrawal code (so "Delete my profile and all my answers" can withdraw each one).
 *
 * Sign-in needs no email: the device signs in anonymously and the profile opens with a
 * recovery code shown once. The store sees only ciphertext: the whole profile is encrypted
 * on the device (AES-GCM) under a key derived from the recovery code, at a node key derived
 * from the same code (eval-profile/<key>). Nobody without the code can read it, link its
 * seasons, or find it. A player who opts in to longitudinal research use (consent PENDING
 * v18) also writes eval-long/<key>: the play keys of their saved seasons, which is the link
 * the research team may then use; opting out deletes it.
 *
 * Signing in (EVAL-12) is entering the recovery code. The code is then kept in this browser's
 * storage until the player signs out, so the landing page can say "Continue as <name>"; nothing
 * identifying is stored anywhere, so a lost code cannot be recovered. A profile may also keep an
 * optional email for follow-ups with its two opt-ins: the details go to eval-contact at a random
 * key, linked to nothing on the server, and only the key sits inside the ciphertext, so the
 * holder can change or delete them.
 */
import type { Lang } from '../content/types'
import { config, type ProfileReadingId } from '../engine/config'
import { deriveKeys, newCode, normaliseCode } from '../engine/codes'
import { randomKey } from '../engine/rng'
import { fill } from '../engine/text'
import { store } from '../store'
import { RT } from './content'
import { walk } from './pool'
import type { Level, Zone } from './rating'
import type { Counts } from './range'

export interface ProfileSession {
  story: string
  /** The day it was played, YYYY-MM-DD, inside the ciphertext only. */
  day: string
  zone: Zone
  /** The five-level reading (owner decision O2); older saves carry the zone only. */
  level?: Level
  towards?: 'focal' | 'comparison'
  weight: number
  pairs: number
  /** The women-and-men pairs, woman first, man first and even (EVAL-10): the timeline's position with range. Older saves have none. */
  counts?: { w: number; m: number; e: number }
  /**
   * Every profile reading's counts this season (EVAL-12): the focal group first, the comparison
   * group first, and neither, over the equal-description pairs (the areas: women and men on the
   * area's own cards). The profile pools these. Older saves have the women-and-men counts only.
   */
  readings?: Partial<Record<ProfileReadingId, Counts>>
  /** The season's report as it was saved, for the read-only view: its reasons, in its language. */
  report?: { lang: Lang; why: string[] }
  /** That season's withdrawal code. */
  code: string
}

/** The optional email for follow-ups (EVAL-12): the details live at eval-contact/<key>. */
export interface ProfileContact {
  key: string
  em: string
  follow: boolean
  research: boolean
}

export interface ProfileData {
  v: 1
  name: string
  sessions: ProfileSession[]
  research: boolean
  contact?: ProfileContact
  /** True for the seeded demo profile, whose past seasons are made up. */
  demo?: boolean
}

export interface ProfileBox {
  iv: string
  ct: string
}

export interface Unlocked {
  code: string
  key: string
  long: string
  aes: CryptoKey
  data: ProfileData
}

const enc = new TextEncoder()
const SALT = 'equal-lens-evaluator/profile/v0'
const b64 = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const hex = (b: ArrayBuffer) =>
  Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('')

export async function profileKeys(code: string, iterations = config.code.kdfIterations) {
  const base = await crypto.subtle.importKey(
    'raw',
    enc.encode(normaliseCode(code)),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(SALT), iterations, hash: 'SHA-256' },
      base,
      512,
    ),
  )
  const mac = await crypto.subtle.importKey(
    'raw',
    bits.slice(0, 32),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const h = async (label: string) =>
    hex(await crypto.subtle.sign('HMAC', mac, enc.encode(label))).slice(0, 32)
  const aes = await crypto.subtle.importKey('raw', bits.slice(32), 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
  return { key: await h('profile'), long: await h('long'), aes }
}

async function seal(aes: CryptoKey, data: ProfileData): Promise<ProfileBox> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aes,
    enc.encode(JSON.stringify(data)),
  )
  return { iv: b64(iv), ct: b64(ct) }
}

async function open(aes: CryptoKey, box: ProfileBox): Promise<ProfileData> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, aes, unb64(box.ct))
  return JSON.parse(new TextDecoder().decode(pt)) as ProfileData
}

/**
 * The profile open on this device. Signing in keeps the recovery code in this browser (EVAL-12)
 * until the player signs out or deletes the profile, so a reload reopens it.
 */
let unlocked: Unlocked | null = null
const SIGNED_IN = 'eval-profile-signin'
const remember = (code: string | null) => {
  try {
    if (code) localStorage.setItem(SIGNED_IN, code)
    else localStorage.removeItem(SIGNED_IN)
  } catch {
    /* blocked storage: signed in for this page's life only */
  }
}
const remembered = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(SIGNED_IN)
  } catch {
    return null
  }
}
export const currentProfile = () => unlocked
/** Sign out on this browser: the profile stays in the store; the code opens it again. */
export const lockProfile = () => {
  unlocked = null
  remember(null)
}
/** True when this browser holds a sign-in, opened or not yet. */
export const signedIn = () => !!unlocked || !!remembered()
/** Reopens the profile this browser is signed in to; null when there is none or it is gone. */
export async function restoreProfile(): Promise<Unlocked | null> {
  if (unlocked) return unlocked
  const code = remembered()
  if (!code) return null
  const u = await openProfile(code)
  if (!u) remember(null)
  return u
}

export async function createProfile(
  name: string,
  first?: ProfileSession,
  demo = false,
): Promise<Unlocked> {
  const code = newCode()
  const k = await profileKeys(code)
  const data: ProfileData = { v: 1, name, sessions: first ? [first] : [], research: false }
  if (demo) data.demo = true
  await store.profilePut(k.key, await seal(k.aes, data))
  unlocked = { code, ...k, data }
  remember(code)
  return unlocked
}

/** Opens a profile by its recovery code; null when no profile has that code. */
export async function openProfile(code: string): Promise<Unlocked | null> {
  const k = await profileKeys(code)
  const box = await store.profileGet(k.key)
  if (!box) return null
  try {
    unlocked = { code: normaliseCode(code), ...k, data: await open(k.aes, box) }
    remember(unlocked.code)
    return unlocked
  } catch {
    return null
  }
}

async function write(u: Unlocked) {
  await store.profilePut(u.key, await seal(u.aes, u.data))
  if (u.data.research) await store.longPut(u.long, { plays: await playKeys(u.data.sessions) })
}

const playKeys = async (sessions: ProfileSession[]) =>
  (await Promise.all(sessions.map(async (s) => (await deriveKeys(s.code)).play))).join(',')

export async function addSession(s: ProfileSession) {
  if (!unlocked) throw new Error('no profile open')
  unlocked.data.sessions.push(s)
  await write(unlocked)
}

/** A new display name (any name, up to 24 characters). */
export async function rename(name: string) {
  if (!unlocked) throw new Error('no profile open')
  unlocked.data.name = name.trim().slice(0, 24)
  await write(unlocked)
}

/**
 * The optional email for follow-ups and its two opt-ins (EVAL-12): written to eval-contact at the
 * profile's own random key, replaced on every change; an empty email deletes the details.
 */
export async function setContact(em: string, follow: boolean, research: boolean) {
  if (!unlocked) throw new Error('no profile open')
  const key = unlocked.data.contact?.key ?? randomKey()
  const email = em.trim().slice(0, 120)
  if (!email) {
    await store.contactPut(key, null)
    delete unlocked.data.contact
  } else {
    await store.contactPut(key, { em: email, follow, research })
    unlocked.data.contact = { key, em: email, follow, research }
  }
  await write(unlocked)
}

export async function setResearch(on: boolean) {
  if (!unlocked) throw new Error('no profile open')
  unlocked.data.research = on
  await write(unlocked)
  if (!on) await store.longPut(unlocked.long, null)
}

/**
 * Deletes the profile, its research link and every saved season's records that are still
 * inside their withdrawal window. Returns how many seasons were withdrawn and how many were
 * past their window (those records stay, with nothing left that links them to the player).
 */
export async function deleteProfile(): Promise<{ withdrawn: number; closed: number }> {
  if (!unlocked) throw new Error('no profile open')
  let withdrawn = 0
  let closed = 0
  for (const s of unlocked.data.sessions) {
    try {
      await store.withdraw(await deriveKeys(s.code))
      withdrawn += 1
    } catch {
      closed += 1
    }
  }
  if (unlocked.data.contact) await store.contactPut(unlocked.data.contact.key, null)
  await store.longPut(unlocked.long, null)
  await store.profileDelete(unlocked.key)
  lockProfile()
  return { withdrawn, closed }
}

/**
 * The change line (EVAL-12): "Your decisions changed" only when the faster change rule fires on
 * the latest season against the seasons pooled before it (src/story/pool.ts); null otherwise
 * ("No change shown"). `towards` is the side the latest season moved to.
 */
export function changeOf(sessions: ProfileSession[]) {
  const w = walk(sessions)
  if (!w.latestChanged) return null
  const last = w.trend[w.trend.length - 1]
  const before = [...w.trend].reverse().find((t) => t.season < last.season)
  if (!before) return null
  return {
    from: sessions[before.season],
    to: sessions[last.season],
    towards: last.at > before.at ? ('focal' as const) : ('comparison' as const),
  }
}

/** The day a retake opens, when v18 sets a gap (config.season.retakeGapDays); null otherwise. */
export function nextRetake(sessions: ProfileSession[]): number | null {
  const gap = config.season.retakeGapDays
  const last = sessions[sessions.length - 1]
  if (gap === null || !last) return null
  return Date.parse(`${last.day}T00:00:00+05:30`) + gap * 86_400_000
}

/**
 * The stories a retake may not use: every one this profile has played (the owner's rule). The
 * seeded demo profile's seasons are made up, so it blocks none and the owner can still play the
 * one built story while signed in to it.
 */
export const playedStories = () =>
  new Set(unlocked && !unlocked.data.demo ? unlocked.data.sessions.map((s) => s.story) : [])

/** Stories this profile has played, against the catalogue (each story once per profile). */
export function storiesPlayed(sessions: ProfileSession[]) {
  const played = new Set(sessions.map((s) => s.story)).size
  return { played, left: Math.max(0, config.season.profile.storiesTotal - played) }
}

/**
 * The seeded demo profile (EVAL-12): four made-up past seasons across three stories, so the owner
 * sees confirmed and unconfirmed readings, a restart (the second season fires the change rule)
 * and the trend. The fourth repeats a story, which a real profile cannot do; the demo profile is
 * marked and blocks no story. Its recovery code is fixed and shown only on the dev-only panel of
 * the sign-in screen; seeding writes it only when it is missing, so edits survive a reload.
 */
export const DEMO_PROFILE_CODE = 'DEMQPRQF2XE7'
export async function seedDemoProfile() {
  const { key, box } = await demoProfileBox()
  if (!(await store.profileGet(key))) await store.profilePut(key, box)
}

type Row = [w: number, m: number, e: number]
type DemoRows = Record<'sex' | 'tone' | 'religion' | 'hiring' | 'conduct' | 'resources', Row>
const demoSeason = (
  story: string,
  day: string,
  level: Level,
  towards: 'focal' | 'comparison' | undefined,
  r: DemoRows,
): ProfileSession => {
  const c = (x: Row): Counts => ({ w: x[0], m: x[1], e: x[2] })
  const sex = c(r.sex)
  const n = sex.w + sex.m + sex.e
  const manAhead = sex.m >= sex.w
  return {
    story,
    day,
    zone:
      level === 'strong' || level === 'moderate' ? 'lean' : level === 'unread' ? 'unread' : 'none',
    level,
    ...(towards ? { towards } : {}),
    weight: Math.round(((sex.w - sex.m) / n) * 1000) / 1000,
    pairs: n,
    counts: sex,
    readings: Object.fromEntries(Object.entries(r).map(([k, x]) => [k, c(x)])),
    report: {
      lang: 'en',
      why: [
        fill(RT.whyAll.en, {
          winner: manAhead ? RT.cues.sex.comparisonOne.en : RT.cues.sex.focalOne.en,
          k: Math.max(sex.w, sex.m),
          n,
        }),
      ],
    },
    code: newCode(),
  }
}

/** The demo profile's node key and ciphertext, for the demo store and the emulator seed. */
export async function demoProfileBox(): Promise<{ key: string; box: ProfileBox }> {
  const k = await profileKeys(DEMO_PROFILE_CODE)
  const data: ProfileData = {
    v: 1,
    name: 'Demo player',
    research: false,
    demo: true,
    sessions: [
      demoSeason('newsroom', '2026-06-02', 'strong', 'comparison', {
        sex: [5, 20, 0],
        tone: [9, 11, 0],
        religion: [10, 10, 0],
        hiring: [2, 8, 0],
        conduct: [1, 6, 0],
        resources: [2, 6, 0],
      }),
      demoSeason('clinic', '2026-07-14', 'none', undefined, {
        sex: [15, 9, 1],
        tone: [11, 12, 1],
        religion: [12, 11, 0],
        hiring: [6, 4, 0],
        conduct: [4, 3, 0],
        resources: [5, 2, 1],
      }),
      demoSeason('warehouse', '2026-08-25', 'possible', 'comparison', {
        sex: [9, 15, 1],
        tone: [10, 14, 0],
        religion: [11, 12, 1],
        hiring: [3, 6, 0],
        conduct: [3, 4, 1],
        resources: [3, 5, 0],
      }),
      demoSeason('newsroom', '2026-09-30', 'moderate', 'comparison', {
        sex: [7, 17, 1],
        tone: [8, 16, 0],
        religion: [12, 12, 0],
        hiring: [2, 7, 1],
        conduct: [3, 4, 0],
        resources: [2, 6, 0],
      }),
    ],
  }
  return { key: k.key, box: await seal(k.aes, data) }
}
