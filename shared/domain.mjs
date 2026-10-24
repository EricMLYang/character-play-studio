import { radicalById } from './radicals.mjs'
/**
 * All daily records use Taiwan time, including timestamps saved as UTC.
 * 格式器建一次就好：首頁每拿到一顆星星就會對每一筆紀錄算一次台灣日期
 * （「今天的三件事」、首頁那隻角色），每次都 new 一個要花十幾毫秒。
 */
let dayFormat = null
export function taiwanDay(value = new Date()) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  dayFormat ||= new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return dayFormat.format(date)
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
/**
 * 他描完一個字。blind＝遮起來、沒有外框，憑記憶寫出來的（研究上寫字的好處來自分析字的結構，
 * 描線條只有一半；所以 traces 算每一次，blind 另外算，小鎮長大與寫字那顆星看的是 blind）。
 */
export function addTrace(progress, char, strokes, at = new Date().toISOString(), blind = false) {
  const previous = progress.town?.[char]
  const newer = !previous || Date.parse(at) >= Date.parse(previous.last)
  return {
    ...progress,
    town: { ...progress.town, [char]: {
      traces: (previous?.traces || 0) + 1,
      blind: (previous?.blind || 0) + (blind ? 1 : 0),
      first: previous?.first && Date.parse(previous.first) < Date.parse(at) ? previous.first : at,
      last: newer ? at : previous.last,
      strokes: newer ? strokes : previous.strokes,
    } },
  }
}

/** 小鎮居民長到第幾級（1～5）：搬進來是 1，每憑記憶寫一次長一級，第 5 級戴皇冠 */
export const residentLevel = (resident) => Math.min(1 + (resident?.blind || 0), 5)
export const CROWN_LEVEL = 5

/** 魔法鍋第一次變出這個字的時間。之後再變出來不改，圖鑑記的是「發現」。 */
export function discover(progress, char, at = new Date().toISOString()) {
  const previous = progress.lab?.[char]
  if (previous && Date.parse(previous) <= Date.parse(at)) return progress
  return { ...progress, lab: { ...progress.lab, [char]: at } }
}

/** 孩子自己組的詞最多留幾個：首頁要放得下，新的擠掉最舊的。 */
export const MAX_WORDS = 8

/** 自己組的詞：2～4 個字，可以重複（跳跳）。 */
export const validWord = (text) => typeof text === 'string' && [...text].length >= 2 && [...text].length <= 4

/**
 * 孩子自己組的詞（字火車）：記最後一次組出來的時間，新的排前面，超過上限丟掉最舊的。
 * remove 是他自己按掉；比那次更新的組合不受影響（離線補送時順序可能亂掉）。
 */
export function saveWord(progress, text, at = new Date().toISOString(), remove = false) {
  const { [text]: previous, ...rest } = progress.words || {}
  if (previous && Date.parse(previous) > Date.parse(at)) return progress
  if (remove) return previous === undefined ? progress : { ...progress, words: rest }
  const words = Object.entries({ ...rest, [text]: at }).sort((a, b) => Date.parse(b[1]) - Date.parse(a[1])).slice(0, MAX_WORDS)
  return { ...progress, words: Object.fromEntries(words) }
}

/**
 * 餵大怪獸：聽到字、自己把字找出來。每個字有一個「記住程度」box（0–5），
 * 答對升一級、隔更久再考；答錯降一級、今天再考一次。隔幾天再想起來，比一直重看記得牢。
 */
export const RECALL_DAYS = [0, 1, 2, 4, 7, 15]

export function recall(progress, char, ok, at = new Date().toISOString()) {
  const previous = progress.recall?.[char]
  const counts = { right: (previous?.right || 0) + (ok ? 1 : 0), wrong: (previous?.wrong || 0) + (ok ? 0 : 1) }
  // 離線補送的舊事件：次數照算，但不能把比較新的那次決定的排程改掉
  if (previous && Date.parse(at) < Date.parse(previous.last)) return { ...progress, recall: { ...progress.recall, [char]: { ...previous, ...counts } } }
  const box = ok ? Math.min((previous?.box ?? 0) + 1, RECALL_DAYS.length - 1) : Math.max((previous?.box ?? 0) - 1, 0)
  const due = taiwanDay(Date.parse(at) + (ok ? RECALL_DAYS[box] : 0) * 864e5)
  return { ...progress, recall: { ...progress.recall, [char]: { box, due, last: at, ...counts } } }
}

/**
 * 詞語拼圖：看圖聽詞，把詞裡缺的那個字補上。拼好的詞收進他的詞語圖鑑。
 * 記第一次拼好的時間（圖鑑照這個排）、最後一次、拼了幾次、其中幾次第一下就找對，
 * 以及最後一次是不是第一下就對（lastOk：沒對的詞下一輪先回來複習）。
 */
export const validPuzzle = (event) => typeof event.word === 'string' && typeof event.ok === 'boolean' &&
  [...event.word].length >= 2 && [...event.word].length <= 4 && [...event.word].includes(event.char)

export function solvePuzzle(progress, word, char, ok, at = new Date().toISOString()) {
  const previous = progress.puzzles?.[word]
  const time = Date.parse(at)
  // 離線補送的舊紀錄：次數照算，但「最後一次」的時間與結果留給比較新的那筆
  const newer = !previous || Date.parse(previous.last) <= time
  const entry = {
    char,
    first: previous && Date.parse(previous.first) < time ? previous.first : at,
    last: newer ? at : previous.last,
    count: (previous?.count || 0) + 1,
    right: (previous?.right || 0) + (ok ? 1 : 0),
    lastOk: newer ? ok : previous.lastOk ?? true,
  }
  return { ...progress, puzzles: { ...progress.puzzles, [word]: entry } }
}

/** 指讀小書：text 是整句（含標點），char 是他要指出來的那個字（要在句子裡），ok 是第一下就指對 */
export const validBook = (event) => typeof event.text === 'string' && [...event.text].length >= 3 && [...event.text].length <= 16 &&
  typeof event.char === 'string' && [...event.text].includes(event.char) && typeof event.ok === 'boolean' &&
  (event.mine === undefined || typeof event.mine === 'boolean')

/** 記下他讀過的一句：讀了幾次、幾次第一下就指對；mine＝最後一頁他自己接的 */
export function readBook(progress, text, char, ok, at = new Date().toISOString(), mine = false) {
  const previous = progress.books?.[text]
  const time = Date.parse(at)
  const newer = !previous || Date.parse(previous.last) <= time
  const entry = {
    char,
    first: previous && Date.parse(previous.first) < time ? previous.first : at,
    last: newer ? at : previous.last,
    count: (previous?.count || 0) + 1,
    right: (previous?.right || 0) + (ok ? 1 : 0),
    ...(mine || previous?.mine ? { mine: true } : {}),
  }
  return { ...progress, books: { ...progress.books, [text]: entry } }
}

/** 部首家族的「找家人」：family 這一家的 char 是他自己找出來的（radicals.mjs 的成員才算） */
export const validRadical = (event) => {
  const family = radicalById(event?.family)
  return Boolean(family && typeof event.char === 'string' && Object.hasOwn(family.members, event.char) && typeof event.ok === 'boolean')
}

/** 記下他在哪一家找到了哪個字；第一次找到的時間留著（離線補送的舊紀錄比較早就換成它） */
export function findFamily(progress, family, char, at = new Date().toISOString()) {
  const found = progress.radicals?.[family] || {}
  if (found[char] && Date.parse(found[char]) <= Date.parse(at)) return progress
  return { ...progress, radicals: { ...progress.radicals, [family]: { ...found, [char]: at } } }
}

/**
 * 一個字可以收集的五顆星，剛好是五個不同的地方：看過它、自己把它寫出來、餵大怪獸時自己認出來、
 * 在詞裡把它補上、在魔法鍋裡把它變出來。集滿五顆＝這個字他整個樂園都玩過一遍了。
 *
 * 星星完全從已經在記的紀錄算出來，不另外存一份：舊的進度檔一打開就有星星，
 * 也不會有「紀錄有、星星沒有」這種對不起來的狀況。
 * where 是缺這顆星時要去哪個遊戲（games.tsx 的 id），watch 這顆在字卡裡就拿得到，所以是 null。
 */
export const STAR_DEEDS = [
  { id: 'watch', icon: '👀', label: '看過這個字', where: null, todo: (char) => `看一次「${char}」就拿到了` },
  { id: 'write', icon: '✏️', label: '憑記憶寫出來', where: null, todo: (char) => `描完「${char}」之後，按「遮起來，自己寫寫看」` },
  { id: 'recall', icon: '🍽️', label: '自己認出來', where: 'feed', todo: (char) => `去餵大怪獸，聽到「${char}」自己把它找出來` },
  { id: 'puzzle', icon: '📖', label: '在詞裡讀到', where: 'puzzle', todo: (char) => `去詞語拼圖，把「${char}」補進一個詞裡` },
  { id: 'family', icon: '🏠', label: '找到牠的家', where: 'roots', todo: (char) => `去部首家族，找到「${char}」住哪一家` },
]
export const MAX_STARS = STAR_DEEDS.length

/**
 * 2026-10-25 之前「描完」就有寫字那顆星，之後要憑記憶寫（blind）。
 * 在那之前搬進小鎮的字照舊算拿到，他已經拿到的星星不會變少。
 */
export const WRITE_STAR_CUTOVER = Date.parse('2026-10-25T00:00:00+08:00')
const wroteIt = (resident) => Boolean(resident) && ((resident.blind || 0) > 0 || Date.parse(resident.first) < WRITE_STAR_CUTOVER)
/** 魔法鍋刪掉之前變出來過的字，直接算成「找到牠的家」 */
const foundHome = (progress, char) => Boolean(progress.lab?.[char]) ||
  Object.values(progress.radicals || {}).some((family) => Boolean(family?.[char]))

/** 一個字拿到哪幾顆星：{ watch: true, write: false, ... }。 */
export function charStars(progress, char) {
  return {
    watch: (progress.watched?.[char]?.count || 0) > 0,
    write: wroteIt(progress.town?.[char]),
    // 靠提示才吃到的不算：這顆星要的是「他自己認出來」
    recall: (progress.recall?.[char]?.right || 0) > 0,
    // 在詞裡讀到：詞語拼圖補上過，或在小書裡指出來過
    puzzle: Object.values(progress.puzzles || {}).some((p) => p.char === char) || Object.values(progress.books || {}).some((b) => b.char === char),
    family: foundHome(progress, char),
  }
}

/** 描過、但還沒憑記憶寫過：寫字那顆星先亮一半 */
export const tracedOnly = (progress, char) => Boolean(progress.town?.[char]) && !wroteIt(progress.town[char])

/**
 * 每個字幾顆星，整份紀錄只掃一遍。首頁有兩百多張字卡，一張一張去翻紀錄會把每次更新都變慢。
 * 回傳的 Map 只有「至少一顆星」的字；沒出現過的字就是 0 顆。
 */
export function starIndex(progress) {
  const stars = new Map()
  const mark = (char) => stars.set(char, (stars.get(char) || 0) + 1)
  for (const [char, watched] of Object.entries(progress.watched || {})) if (watched?.count > 0) mark(char)
  for (const [char, resident] of Object.entries(progress.town || {})) if (wroteIt(resident)) mark(char)
  for (const [char, box] of Object.entries(progress.recall || {})) if (box?.right > 0) mark(char)
  for (const char of new Set([...Object.values(progress.puzzles || {}).map((p) => p.char), ...Object.values(progress.books || {}).map((b) => b.char)])) mark(char)
  const homes = new Set([...Object.keys(progress.lab || {}), ...Object.values(progress.radicals || {}).flatMap((f) => Object.keys(f || {}))])
  for (const char of homes) mark(char)
  return stars
}

/** 總共幾顆星。字庫裡已經刪掉的字也算進去——那些星星他確實拿過。 */
export const totalStars = (progress) => [...starIndex(progress).values()].reduce((sum, n) => sum + n, 0)

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
