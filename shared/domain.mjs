/** All daily records use Taiwan time, including timestamps saved as UTC. */
export function taiwanDay(value = new Date()) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

/**
 * 每個字的場景：決定孩子端的背景小動畫，以及魔法鍋裡兩個字相遇的反應。
 * 存在字卡的 scene 欄位；沒填的字（含還沒分類的新字）一律是 sparkle。
 */
export const SCENES = ['rain', 'fire', 'glow', 'grow', 'fly', 'bounce', 'zap', 'sparkle']

// Existing imported media predates review; preserve its published behavior.
export const isPublished = (media) => media.review === undefined || media.review === 'published'
export const publishedMedia = (entry) => (entry.media || []).filter(isPublished)

export function completeWatch(progress, char, at = new Date().toISOString()) {
  const previous = progress.watched?.[char]
  return {
    ...progress,
    watched: { ...progress.watched, [char]: { count: (previous?.count || 0) + 1,
      last: previous?.last && Date.parse(previous.last) > Date.parse(at) ? previous.last : at } },
  }
}

/**
 * 描完一個字，它就搬進孩子的小鎮。筆跡存最新的一次（字是他寫的，不是字型），
 * 次數決定居民長多大。strokes 是 hanzi-writer 內部座標（0–1024，y 朝上）。
 */
export function addTrace(progress, char, strokes, at = new Date().toISOString()) {
  const previous = progress.town?.[char]
  const newer = !previous || Date.parse(at) >= Date.parse(previous.last)
  return {
    ...progress,
    town: { ...progress.town, [char]: {
      traces: (previous?.traces || 0) + 1,
      first: previous?.first && Date.parse(previous.first) < Date.parse(at) ? previous.first : at,
      last: newer ? at : previous.last,
      strokes: newer ? strokes : previous.strokes,
    } },
  }
}

/** 魔法鍋第一次變出這個字的時間。之後再變出來不改，圖鑑記的是「發現」。 */
export function discover(progress, char, at = new Date().toISOString()) {
  const previous = progress.lab?.[char]
  if (previous && Date.parse(previous) <= Date.parse(at)) return progress
  return { ...progress, lab: { ...progress.lab, [char]: at } }
}

/** 筆跡只收合理的形狀：最多 40 筆，每筆最多 64 個點，座標在字框附近。 */
export function validStrokes(strokes) {
  return Array.isArray(strokes) && strokes.length > 0 && strokes.length <= 40 && strokes.every((s) =>
    Array.isArray(s) && s.length >= 2 && s.length <= 128 && s.length % 2 === 0 &&
    s.every((n) => Number.isInteger(n) && n >= -400 && n <= 1500))
}

export const negativeTags =['unclear', 'noisy', 'confusing', 'fast']
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
