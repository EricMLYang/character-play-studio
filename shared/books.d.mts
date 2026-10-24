export type Pattern = { id: string; before: string; after: string }
export const PATTERNS: Pattern[]
export function patternById(id: string): Pattern | undefined
export function sentenceText(pattern: Pattern, word: string): string
export function patternChars(pattern: Pattern): string[]
export function spokenPart(segment: string): string
export const BOOK_FIXED: { bookHello: string; bookAsk: string; bookPage: string; bookMine: string; bookDone: string; bookPerfect: string }
export function bookLines(): string[]
