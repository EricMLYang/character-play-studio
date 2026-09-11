import { publishedMedia } from './domain.mjs'

export const hasPublishedVideo = (entry) => publishedMedia(entry).some((m) => m.kind === 'video')

/** 孩子端只看得到家長開放過的字：新加的字在資料補齊、家長按開放前不當作教材。 */
export function browseCharacters(characters) {
  return characters.filter((c) => !c.hidden).sort((a, b) => Number(hasPublishedVideo(b)) - Number(hasPublishedVideo(a)) || a.priority - b.priority)
}
