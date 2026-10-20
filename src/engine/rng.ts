/**
 * Seeded random draws (sfc32, seeded through splitmix32). The trainer uses them where a draw
 * must repeat: the order options are shown in (per player and step, so the same twin is not
 * always on the left), handle offers, and the sample board every phone sees the same way.
 */
export interface Rng {
  next(): number
  int(n: number): number
  pick<T>(xs: readonly T[]): T
  shuffle<T>(xs: readonly T[]): T[]
}

function sfc32(a: number, b: number, c: number, d: number): Rng {
  const next = () => {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
  for (let i = 0; i < 15; i++) next()
  return {
    next,
    int: (n) => Math.floor(next() * n),
    pick: (xs) => xs[Math.floor(next() * xs.length)],
    shuffle: (xs) => {
      const out = xs.slice()
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
}

export function seeded(seed: number): Rng {
  let x = seed >>> 0
  const mix = () => {
    x = (x + 0x9e3779b9) | 0
    let z = x
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    return (z ^ (z >>> 16)) >>> 0
  }
  return sfc32(mix(), mix(), mix(), mix())
}

/** A 32-bit hash of a string (FNV-1a), to seed a draw from names. */
export function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export const seededBy = (...parts: (string | number)[]) => seeded(hash(parts.join('|')))

/** A fresh seed from the platform's cryptographic source. */
export function freshSeed(): number {
  const s = new Uint32Array(1)
  crypto.getRandomValues(s)
  return s[0]
}
