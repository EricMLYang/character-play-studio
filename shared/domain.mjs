/** All daily records use Taiwan time, including timestamps saved as UTC. */
export function taiwanDay(value = new Date()) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

// Existing imported media predates review; preserve its published behavior.
export const isPublished = (media) => media.review === undefined || media.review === 'published'
export const publishedMedia = (entry) => (entry.media || []).filter(isPublished)

export function completeWatch(progress, char, at = new Date().toISOString()) {
  const previous = progress.watched?.[char]
  return {
    ...progress,
    watched: { ...progress.watched, [char]: { count: (previous?.count || 0) + 1,
      last: previous?.last && Date.parse(previous.last) > Date.parse(at) ? previous.last : at } },
    stickers: [...new Set([...(progress.stickers || []), char])],
  }
}

export const negativeTags = ['unclear', 'noisy', 'confusing', 'fast']
export const feedbackTags = ['love', 'clear', ...negativeTags]
export const revisionTags = (entry) => negativeTags.filter((tag) =>
  (entry.feedback || []).some((feedback) => feedback.tags.includes(tag)))

export function addFeedback(entry, tags, at = new Date().toISOString(), mediaFile) {
  if (!Array.isArray(tags) || !tags.length || tags.some((tag) => !feedbackTags.includes(tag))) {
    throw new Error('請選擇有效的回饋標籤')
  }
  entry.feedback = [...(entry.feedback || []), { tags, at, ...(mediaFile ? { mediaFile } : {}) }]
  entry.needsRedo = Boolean(entry.needsRedo || tags.some((tag) => negativeTags.includes(tag)))
}

export function publishMedia(entry, file, audioMode, volume, checks) {
  const media = entry.media.find((m) => m.file === file)
  if (!media) throw new Error('找不到這個版本')
  if (!['original', 'narration'].includes(audioMode) || !Number.isFinite(volume) || volume < 0 || volume > 1) {
    throw new Error('發音或音量設定不正確')
  }
  if (!checks?.shape || !checks?.pronunciation || !checks?.volume) throw new Error('請先確認字形、發音與音量')
  for (const other of entry.media) {
    if (other.kind === media.kind && isPublished(other)) other.review = 'paused'
  }
  Object.assign(media, { review: 'published', audioMode, volume, checkedAt: new Date().toISOString(), checks })
  entry.status = 'live'
  // An old version must not clear feedback received after it was produced.
  if (media.kind === 'video' && !(entry.feedback || []).slice(media.feedbackCount ?? 0)
    .some((f) => f.tags.some((t) => negativeTags.includes(t)))) entry.needsRedo = false
  return media
}
