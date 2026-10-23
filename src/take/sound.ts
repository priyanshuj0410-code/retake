import { createContext, useContext } from 'react'

// Each world's suggested default from the sound pages (design-system/sound/), quiet, through their own engines, which
// the export writes to public/take/sound.js (demo.sound_engines). Every person makes the same sound, so sound never
// hints at a lean. Nothing plays before the first tap; Station's chime plays on its cover only; cutscenes and the
// reading have no bed. The engines load on the first tap, so a weak signal never waits on them.

interface Engine {
  S: { vol: number; fx: number; ctx: unknown }
  FX: Record<string, Record<string, (t: number, v: number) => void>>
  MUSIC: Record<string, unknown>
  startLoop: (m: unknown) => void
  stopLoop: () => void
  ensureCtx: () => { currentTime: number } | null
}
type Win = Window & { SND_LS?: Engine; SND_W?: Engine }

const SOUND: Record<string, [keyof Win & ('SND_LS' | 'SND_W'), string, boolean]> = {
  lugdi: ['SND_LS', 'lB', true],
  station: ['SND_LS', 'sB', false],
  jadugar: ['SND_W', 'jB', true],
  cricket: ['SND_W', 'cB', true],
  rukavat: ['SND_W', 'rA', true],
}

export type Fx = 'tap' | 'unpick' | 'fill' | 'spend' | 'refuse' | 'commit' | 'cover' | 'tab'

let loading: Promise<void> | null = null
const load = () =>
  (loading ??= new Promise<void>((done) => {
    const s = document.createElement('script')
    s.src = '/take/sound.js'
    s.onload = () => done()
    // a failed load (a weak signal) is tried again on the next screen, not given up for the session
    s.onerror = () => {
      loading = null
      s.remove()
      done()
    }
    document.head.appendChild(s)
  }))

const engine = (w: string) => (SOUND[w] ? (window as Win)[SOUND[w][0]] : undefined)

export class Sound {
  on = true
  private woke = false
  private bed = ''
  private want: { world: string; cover: boolean; quiet: boolean } = { world: '', cover: false, quiet: true }

  wake() {
    if (this.woke) return
    this.woke = true
    void load().then(() => this.music())
  }

  /** The screen now showing: its world, whether it is a cover, and whether it is quiet (a cutscene, the reading). */
  screen(world: string, cover: boolean, quiet: boolean) {
    this.want = { world, cover, quiet }
    this.retry()
    this.music()
  }

  set(on: boolean) {
    this.on = on
    this.retry()
    this.music()
  }

  private retry() {
    if (this.woke && this.on && !engine(this.want.world)) void load().then(() => this.music())
  }

  fx(world: string, id: Fx) {
    const e = engine(world)
    if (!this.on || !this.woke || !e) return
    e.S.vol = 0.3
    const c = e.ensureCtx()
    const f = c && e.FX[world]?.[id]
    if (f) f(c.currentTime + 0.02, e.S.fx)
  }

  private music() {
    const { world, cover, quiet } = this.want
    const s = SOUND[world]
    const key = this.on && this.woke && s && engine(world) && !quiet && (cover || s[2]) ? world + s[1] : ''
    if (key === this.bed) return
    for (const n of ['SND_LS', 'SND_W'] as const) {
      const e = (window as Win)[n]
      if (e?.S.ctx) e.stopLoop()
    }
    this.bed = key
    if (key) {
      const e = engine(world)!
      e.S.vol = 0.3
      e.startLoop(e.MUSIC[s[1]])
    }
  }
}

export const SoundContext = createContext<{ sound: Sound; on: boolean; toggle: () => void }>({
  sound: new Sound(),
  on: true,
  toggle: () => {},
})
export const useSound = () => useContext(SoundContext)
