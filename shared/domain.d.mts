import type { CharEntry, Media, Progress } from '../src/types'
export function taiwanDay(value?: Date | string): string
export function isPublished(media: Media): boolean
export function publishedMedia(entry: CharEntry): Media[]
export function completeWatch(progress: Progress, char: string, at?: string): Progress
