export type Radical = {
  id: string
  /** 原本的字在前、變成部首的樣子在後；只有一種樣子就一個 */
  forms: string[]
  name: string
  emoji: string
  intro: string
  change: string
  common: string
  /** 字 → 為什麼住在這一家 */
  members: Record<string, string>
}
export const RADICALS: Radical[]
export function radicalById(id: unknown): Radical | undefined
export function familyOf(char: string): Radical | undefined
export const RADICAL_LINES: { ask: (r: Radical) => string; home: (r: Radical) => string }
export const RADICAL_FIXED: { hello: string; play: string; allFound: string; nameHome: string }
export function radicalLines(): string[]
export function radicalGlyphs(): string[]
