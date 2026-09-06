import type { CharEntry, Progress } from '../src/types'
export const DAILY_LIMIT: number
export function hasPublishedVideo(entry: CharEntry): boolean
export function browseCharacters(characters: CharEntry[]): CharEntry[]
export function pickToday(characters: CharEntry[], progress: Progress, now?: Date): CharEntry[]
