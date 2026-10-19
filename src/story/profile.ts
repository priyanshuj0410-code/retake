/**
 * The optional, pseudonymous player profile (EVAL-4, the owner's retake decision of 19 Oct
 * 2026). Made after a result, never before. It holds a display name and one entry per saved
 * season: the story, the day, the band and the numbers behind it, and that season's
 * withdrawal code (so "Delete my profile and all my records" can withdraw each one).
 *
 * Sign-in needs no email: the device signs in anonymously and the profile opens with a
 * recovery code shown once. The store sees only ciphertext: the whole profile is encrypted
 * on the device (AES-GCM) under a key derived from the recovery code, at a node key derived
 * from the same code (eval-profile/<key>). Nobody without the code can read it, link its
 * seasons, or find it. A player who opts in to longitudinal research use (consent PENDING
 * v17) also writes eval-long/<key>: the play keys of their saved seasons, which is the link
 * the research team may then use; opting out deletes it.
 */
import { config } from '../engine/config'
import { deriveKeys, newCode, normaliseCode } from '../engine/codes'
import { store } from '../store'
import type { Zone } from './rating'

export interface ProfileSession {
  story: string
  /** The day it was played, YYYY-MM-DD, inside the ciphertext only. */
  day: string
  zone: Zone
  towards?: 'focal' | 'comparison'
  weight: number
  pairs: number
  /** That season's withdrawal code. */
  code: string
}

export interface ProfileData {
  v: 1
  name: string
  sessions: ProfileSession[]
  research: boolean
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

/** The profile open on this device, held in memory only: a reload asks for the code again. */
let unlocked: Unlocked | null = null
export const currentProfile = () => unlocked
export const lockProfile = () => {
  unlocked = null
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
  return unlocked
}

/** Opens a profile by its recovery code; null when no profile has that code. */
export async function openProfile(code: string): Promise<Unlocked | null> {
  const k = await profileKeys(code)
  const box = await store.profileGet(k.key)
  if (!box) return null
  try {
    unlocked = { code: normaliseCode(code), ...k, data: await open(k.aes, box) }
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
  await store.longPut(unlocked.long, null)
  await store.profileDelete(unlocked.key)
  unlocked = null
  return { withdrawn, closed }
}

/**
 * The change line between the last two readable seasons: a change is read only when the
 * headline weight moved by at least config.season.change.minDiff (PENDING v17).
 */
export function changeOf(sessions: ProfileSession[]) {
  const readable = sessions.filter((s) => s.zone !== 'unread')
  if (readable.length < 2) return null
  const [a, b] = readable.slice(-2)
  const d = b.weight - a.weight
  if (Math.abs(d) < config.season.change.minDiff) return null
  return { from: a, to: b, towards: d > 0 ? ('focal' as const) : ('comparison' as const) }
}

/** The day a retake opens, when v17 sets a gap (config.season.retakeGapDays); null otherwise. */
export function nextRetake(sessions: ProfileSession[]): number | null {
  const gap = config.season.retakeGapDays
  const last = sessions[sessions.length - 1]
  if (gap === null || !last) return null
  return Date.parse(`${last.day}T00:00:00+05:30`) + gap * 86_400_000
}

/** The stories a retake may use: never one this profile has played (the owner's rule). */
export const playedStories = () => new Set(unlocked?.data.sessions.map((s) => s.story) ?? [])

/**
 * The seeded demo profile: two made-up past seasons (in the newsroom and the clinic, as if
 * those were built), so the timeline and the change line can be seen. Its recovery code is
 * fixed and shown on the demo home page; seeding again replaces it.
 */
export const DEMO_PROFILE_CODE = 'DEMQPRQF2XE7'
export async function seedDemoProfile() {
  const { key, box } = await demoProfileBox()
  await store.profilePut(key, box)
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
      {
        story: 'newsroom',
        day: '2026-07-14',
        zone: 'lean',
        towards: 'comparison',
        weight: -0.6,
        pairs: 25,
        code: newCode(),
      },
      {
        story: 'clinic',
        day: '2026-09-02',
        zone: 'none',
        weight: -0.08,
        pairs: 25,
        code: newCode(),
      },
    ],
  }
  return { key: k.key, box: await seal(k.aes, data) }
}
