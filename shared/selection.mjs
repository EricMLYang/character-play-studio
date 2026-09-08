import { publishedMedia } from './domain.mjs'

export const hasPublishedVideo = (entry) => publishedMedia(entry).some((m) => m.kind === 'video')

export function browseCharacters(characters) {
  return [...characters].sort((a, b) => Number(hasPublishedVideo(b)) - Number(hasPublishedVideo(a)) || a.priority - b.priority)
}
