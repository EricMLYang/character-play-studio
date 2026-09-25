import type { CharEntry, Media, Progress, Scene } from '../src/types'
export function taiwanDay(value?: Date | string): string
export function isPublished(media: Media): boolean
export function publishedMedia(entry: CharEntry): Media[]
export function completeWatch(progress: Progress, char: string, at?: string): Progress
export function addTrace(progress: Progress, char: string, strokes: number[][], at?: string): Progress
export function discover(progress: Progress, char: string, at?: string): Progress
export function validStrokes(strokes: unknown): strokes is number[][]
export const SCENES: Scene[]
