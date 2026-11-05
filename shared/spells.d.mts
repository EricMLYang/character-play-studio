export type Act = 'swim' | 'fly' | 'fall' | 'grow' | 'bounce' | 'burn' | 'shine' | 'drive' | 'run' | 'hop' | 'stomp' | 'slither' | 'crawl' | 'float' | 'splash' | 'yum'
export type Spell = { char: string; act: Act; wish: string; thanks: string }
export const ACTS: Act[]
export const SPELLS: Spell[]
export const SPELL_FIXED: { hello: string; look: string; gone: string; peek: string; traceIt: string; again: string; done: string }
export function spellFor(char: string): Spell | undefined
export function spellLines(): string[]
