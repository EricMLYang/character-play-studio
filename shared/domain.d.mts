import type { CharEntry, Media, Progress, Resident, Scene } from '../src/types'
export function taiwanDay(value?: Date | string): string
export function isPublished(media: Media): boolean
export function publishedMedia(entry: CharEntry): Media[]
export function completeWatch(progress: Progress, char: string, at?: string): Progress
export function addTrace(progress: Progress, char: string, strokes: number[][], at?: string, blind?: boolean): Progress
export function residentLevel(resident: Resident | undefined): number
export const CROWN_LEVEL: number
export function discover(progress: Progress, char: string, at?: string): Progress
export const MAX_WORDS: number
export function validWord(text: unknown): text is string
export function saveWord(progress: Progress, text: string, at?: string, remove?: boolean): Progress
export function validStrokes(strokes: unknown): strokes is number[][]
export const SCENES: Scene[]
export const feedbackTags: string[]
export const RECALL_DAYS: number[]
export function recall(progress: Progress, char: string, ok: boolean, at?: string): Progress
export function validPuzzle(event: unknown): boolean
export function solvePuzzle(progress: Progress, word: string, char: string, ok: boolean, at?: string): Progress
export type StarDeed = { id: 'watch' | 'write' | 'recall' | 'puzzle' | 'family'; icon: string; label: string; where: string | null; todo: (char: string) => string }
export const STAR_DEEDS: StarDeed[]
export const MAX_STARS: number
export function charStars(progress: Progress, char: string): Record<StarDeed['id'], boolean>
export function tracedOnly(progress: Progress, char: string): boolean
export const WRITE_STAR_CUTOVER: number
export function starIndex(progress: Progress): Map<string, number>
export function totalStars(progress: Progress): number
export function validRadical(event: unknown): boolean
export function findFamily(progress: Progress, family: string, char: string, at?: string): Progress
