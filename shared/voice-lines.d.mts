import type { CharEntry } from '../src/types'

export const LINES: {
  townHello: (char: string) => string
  townWord: (char: string, word: string) => string
}
export function linesForEntry(entry: Pick<CharEntry, 'char' | 'words' | 'concept'>): string[]
