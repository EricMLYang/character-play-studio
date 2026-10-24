import type { Radical } from './radicals.mjs'
export const SOUNDS: Radical[]
export function soundById(id: unknown): Radical | undefined
export const SOUND_LINES: { ask: (s: Radical) => string; home: (s: Radical) => string }
export function soundLines(): string[]
export function soundGlyphs(): string[]
