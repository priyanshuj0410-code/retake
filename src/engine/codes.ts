/**
 * The withdrawal code and the keys derived from it (candidates v12, 3.0 rule 7; plan v1,
 * section 9, test 6). The code is shown once and never stored anywhere. Every stored key is
 * a keyed hash of it, separate per store:
 *   code   eval-codes/<h>   lets the explanation page recognise the code
 *   play   eval-play/<h>    the person-level card, survey and Inbox records
 *   xw:i   eval-xw/<h>      each crosswise record, scattered at its own key
 *   demo:i eval-demo/<h>    each demographic record, scattered at its own key
 * No two stores share a field: joining them needs the code, which only the player holds.
 * The slow step (PBKDF2) runs once per session; each key is then one HMAC.
 */
import { config } from './config'

const enc = new TextEncoder()
export const MAX_XW = 48
export const MAX_DEMO = 8
const SALT = 'equal-lens-evaluator/withdrawal/v0'

export function newCode(): string {
  const { length, alphabet } = config.code
  const out: string[] = []
  const buf = new Uint8Array(1)
  const limit = 256 - (256 % alphabet.length)
  while (out.length < length) {
    crypto.getRandomValues(buf)
    if (buf[0] < limit) out.push(alphabet[buf[0] % alphabet.length])
  }
  return out.join('')
}

export const normaliseCode = (s: string) => s.toUpperCase().replace(/[^0-9A-Z]/g, '')
export const formatCode = (c: string) => c.match(/.{1,4}/g)?.join('-') ?? c
export const validCode = (c: string) => c.length === config.code.length && [...c].every((ch) => config.code.alphabet.includes(ch))

export interface CodeKeys {
  code: string
  play: string
  xw: string[]
  demo: string[]
}

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('')

export async function deriveKeys(code: string, iterations = config.code.kdfIterations): Promise<CodeKeys> {
  const base = await crypto.subtle.importKey('raw', enc.encode(normaliseCode(code)), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(SALT), iterations, hash: 'SHA-256' }, base, 256)
  const key = await crypto.subtle.importKey('raw', bits, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const h = async (label: string) => hex(await crypto.subtle.sign('HMAC', key, enc.encode(label))).slice(0, 32)
  return {
    code: await h('code'),
    play: await h('play'),
    xw: await Promise.all([...Array(MAX_XW).keys()].map((i) => h(`xw:${i}`))),
    demo: await Promise.all([...Array(MAX_DEMO).keys()].map((i) => h(`demo:${i}`))),
  }
}

/** A firm enrolment code: random, kept only in the player's calendar file. */
export const newEnrolmentCode = () => newCode()
export async function enrolmentKey(code: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(`equal-lens-evaluator/enrol/v0:${normaliseCode(code)}`))
  return hex(d).slice(0, 32)
}
