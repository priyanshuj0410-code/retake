/**
 * Random draws. In play every session is seeded from the platform's cryptographic source,
 * so no draw can be predicted or replayed; the checks seed it by number so a statistical
 * test is reproducible. sfc32, a small fast generator with a 128-bit state.
 */
export interface Rng {
  /** Uniform on [0, 1). */
  next(): number
  int(n: number): number
  pick<T>(xs: readonly T[]): T
  shuffle<T>(xs: readonly T[]): T[]
  /** A random subset of size k of 0..n-1, as a boolean mask. */
  choose(n: number, k: number): boolean[]
  /** Draws a key of `weights` with probability proportional to its value. */
  weighted<K extends string>(weights: Partial<Record<K, number>>): K
}

export function sfc32(a: number, b: number, c: number, d: number): Rng {
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
  const rng: Rng = {
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
    choose: (n, k) => {
      const idx = rng.shuffle([...Array(n).keys()]).slice(0, k)
      return [...Array(n).keys()].map((i) => idx.includes(i))
    },
    weighted: <K extends string>(weights: Partial<Record<K, number>>) => {
      const entries = Object.entries(weights) as [K, number][]
      const total = entries.reduce((s, [, w]) => s + w, 0)
      let u = next() * total
      for (const [k, w] of entries) {
        u -= w
        if (u < 0) return k
      }
      return entries[entries.length - 1][0]
    },
  }
  return rng
}

export const seeded = (seed: number) => sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed >>> 0)

export function cryptoRng(): Rng {
  const s = new Uint32Array(4)
  crypto.getRandomValues(s)
  return sfc32(s[0], s[1], s[2], s[3])
}

/** A random key for a stored record: 128 bits, base-36. Carries no time and no order. */
export function randomKey(): string {
  const b = new Uint32Array(4)
  crypto.getRandomValues(b)
  return Array.from(b, (x) => x.toString(36).padStart(7, '0')).join('')
}
