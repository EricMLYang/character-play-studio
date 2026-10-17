import type { CharEntry } from '../src/types'

export const LINES: {
  townHello: (char: string) => string
  townWord: (char: string, word: string) => string
  feedAsk: (char: string) => string
  feedNotThis: (char: string) => string
}
export const FIXED_LINES: Record<'feedHungry' | 'feedFull', string>
export function linesForEntry(entry: Pick<CharEntry, 'char' | 'words' | 'concept'>): string[]
