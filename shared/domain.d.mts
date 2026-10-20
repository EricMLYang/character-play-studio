import type { CharEntry, Media, Progress, Scene } from '../src/types'
export function taiwanDay(value?: Date | string): string
export function isPublished(media: Media): boolean
export function publishedMedia(entry: CharEntry): Media[]
export function completeWatch(progress: Progress, char: string, at?: string): Progress
export function addTrace(progress: Progress, char: string, strokes: number[][], at?: string): Progress
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
