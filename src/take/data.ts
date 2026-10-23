// The First take as data, written by design-system/tools/app_content.py from the same script the demo plays. Never
// edited by hand: change knowledge/story/first-take-script.md and export again.
import raw from '../../content/take/first-take.json'

/** A string in the library's two languages: [English, Hindi]. */
export type Bi = [string, string]
export type Lang = 'mix' | 'hi' | 'en'

export interface Person {
  en: string
  hi: string
  vals: string[]
  line: Bi | null
  face: string
  serial: string | null
}

export interface Step {
  type: 'step'
  id: string
  world: string
  cls: string
  n: number
  total: number
  title: string
  kind: 'pick' | 'checks' | 'rank' | 'team' | 'order' | 'split'
  rawKind: string
  q: Bi
  speaker: Bi
  speakerFace: string
  voice: Bi | null
  keys: [string, string, string][]
  plate: Bi | null
  art: [string, string] | null
  button: Bi
  teller: boolean
  people: Person[]
  prog: [number, number, number]
  max?: number
  seats?: number
  need?: number
  chores?: Bi[]
}

export interface Cut {
  type: 'cut'
  label: Bi
  panels: { id: string; world: string; pic: string; cap: Bi }[]
}

export interface Cover {
  type: 'cover'
  world: string
  cls: string
  art: [string, string] | null
  html: string
}

export interface Results {
  type: 'results'
}

export type Screen = Step | Cut | Cover | Results

export interface Decision {
  kind: 'pick' | 'set' | 'order' | 'rank' | 'split'
  pair: [string, string]
  sex: Record<string, 'm' | 'w'>
  q: Bi
  nudged: string
  faces: Record<string, string>
  hi: Record<string, string>
}

export interface Take {
  version: number
  langs: [Lang, string, string][]
  eng: [string, string][]
  worlds: Record<string, { cls: string; title: Bi }>
  help: Record<string, string>
  icons: Record<string, string>
  results: {
    decisions: Record<string, Decision>
    twins: { a: string; b: string; world: string; kind: string; nudge: Bi }[]
    areas: Record<string, { real: Bi; scene: string }>
    card: { world: string; cls: string; art: [string, string] }
  }
  flow: Screen[]
}

export const TAKE = raw as unknown as Take
