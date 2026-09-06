import { publishedMedia, taiwanDay } from './domain.mjs'

export const DAILY_LIMIT = 6
export const hasPublishedVideo = (entry) => publishedMedia(entry).some((m) => m.kind === 'video')

export function browseCharacters(characters) {
  return [...characters].sort((a, b) => Number(hasPublishedVideo(b)) - Number(hasPublishedVideo(a)) || a.priority - b.priority)
}

/** Saved choices stay stable within each media tier; published videos always take precedence. */
export function pickToday(characters, progress, now = new Date()) {
  const saved = new Map((progress.days?.[taiwanDay(now)] || []).map((char, i) => [char, i]))
  const watched = progress.watched || {}
  const age = (c) => (new Date(now).getTime() - new Date(watched[c.char]?.last).getTime()) / 86400000
  const group = (c) => !watched[c.char] ? 0 : age(c) >= 2 ? 1 : 2
  return [...characters].sort((a, b) =>
    Number(hasPublishedVideo(b)) - Number(hasPublishedVideo(a)) ||
    Number(saved.has(b.char)) - Number(saved.has(a.char)) ||
    (saved.has(a.char) && saved.has(b.char) ? saved.get(a.char) - saved.get(b.char) : 0) ||
    group(a) - group(b) ||
    (group(a) > 0 ? age(b) - age(a) : 0) || a.priority - b.priority,
  ).slice(0, DAILY_LIMIT)
}
