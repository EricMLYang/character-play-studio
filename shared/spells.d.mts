export type Act = 'swim' | 'fly' | 'fall' | 'grow' | 'bounce' | 'burn' | 'shine' | 'drive' | 'run' | 'hop' | 'stomp' | 'slither' | 'crawl' | 'float' | 'splash' | 'yum'
export type Spell = { char: string; n: number; act: Act; wish: string; thanks: string; sound?: string }
export const ACTS: Act[]
export const SPELLS: Spell[]
export type Combo = { word: string; emoji: string; act: Act; thanks: string }
export const COMBOS: Combo[]
export function comboOf(a: string, b: string): Combo | undefined
export const SPELL_FIXED: { hello: string; look: string; gone: string; peek: string; traceIt: string; again: string; done: string; world: string; fuse: string; hint: string; choose: string; memory: string; levelUp: string; yours: string }
export function spellFor(char: string): Spell | undefined
export function spellLines(): string[]
