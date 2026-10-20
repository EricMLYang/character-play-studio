import type { CharEntry, Progress } from '../types'
import { looksAlike } from './dishes'

/**
 * 詞語拼圖：看圖、聽一個詞（生日🎂），詞裡缺一個字，從幾張字卡裡把它找出來補上。
 * 練的是詞彙：同一個字放進不同的詞（生日、日出、日記），他才知道這個字在生活裡怎麼用。
 * 缺的那個字一定是他看過的字；詞裡其他的字直接寫出來，不認得也沒關係。
 */

/** 一輪拼幾個詞 */
export const PIECES = 5
/** 一輪最多幾題「看詞找圖」 */
export const PICTURE_ROUNDS = 2
/** 一輪最多幾題複習（上次要靠提示才拼好的詞） */
export const REVIEWS = 2

/**
 * 難度跟著他走：看他拼過的詞第一下就找對的比例（至少拼過 8 次才算數）。
 * - easy（不到一半）：只放兩張卡
 * - hard（八成以上）：補字題放一張長得像的字（日、目），看詞找圖放一個有共同字的詞（火車、火山），要真的讀清楚
 * - 其他：三張卡、干擾的字長得不像
 */
export type Level = 'easy' | 'normal' | 'hard'
export function puzzleLevel(progress: Progress): Level {
  const all = Object.values(progress.puzzles || {})
  const count = all.reduce((n, p) => n + p.count, 0)
  if (count < 8) return 'normal'
  const rate = all.reduce((n, p) => n + p.right, 0) / count
  return rate < 0.5 ? 'easy' : rate >= 0.8 ? 'hard' : 'normal'
}

export type PuzzleItem = {
  /**
   * char：詞缺一個字，聽「生日的日」把字卡補上（聽音認字）。
   * picture：整個詞寫出來，圖是空的，讀懂了把對的那張圖放上去（讀懂詞義）；只出詞裡每個字他都看過的詞。
   */
  kind: 'char' | 'picture'
  /** 整個詞 */
  word: string
  /** 圖 */
  emoji: string
  /** 缺的那個字 */
  char: string
  /** 缺在第幾個位置 */
  slot: number
  /** 卡片（含答案，已經洗好）：char 題是字，picture 題是詞（卡片上畫那個詞的圖） */
  options: string[]
  /** 上次要靠提示才拼好、這輪回來複習的詞 */
  review?: boolean
}

/**
 * 字卡上的語詞是給大人解釋字用的，有些對幼兒太難、或只是文法（你的、有的），拿來拼圖只會卡住他。
 * 這些不出題。要調整直接改這張表（字卡上的語詞不受影響）。
 */
export const SKIP_WORDS = new Set([
  '你的', '他的', '其他', '有的', '在這裡', '還給', '交給', '時候', '辣的', '指著', '很快',
  '快捷', '敏捷', '膝關節', '屈膝', '犬齒', '獅子座', '腿軟', '翹腿', '龜速', '猴急', '多嘴', '嘴饞', '酸痛', '背部',
])
/** 圖畫不出意思的詞（中間↔️、小心⚠️）：可以補字，但不出「看詞找圖」。 */
export const NO_PICTURE = new Set([
  '中間', '上面', '入口', '小心', '大家', '時間', '準時', '現在', '今年', '星期', '分開', '超級', '好玩', '有趣', '沒有',
  '他們', '滿足', '忍耐', '忍住', '不怕', '著急', '急忙', '走開', '給你', '送給', '大叫', '背後', '親愛', '甜心', '辛苦', '吃苦',
])

/** 這個字可以拿來拼的詞：要有圖、2～4 個字、這個字在詞裡只出現一次、不在 SKIP_WORDS。 */
export function wordsFor(entry: CharEntry) {
  return (entry.words || []).filter((w) => {
    const chars = [...w.text]
    return w.emoji && !SKIP_WORDS.has(w.text) && chars.length >= 2 && chars.length <= 4 && chars.filter((c) => c === entry.char).length === 1
  })
}

/**
 * 這一輪的詞。
 * - 只用他看過的字，看越多次的字越前面（最可能認得）
 * - 還沒拼過的詞優先，圖鑑才會一直有新東西；都拼過了就挑最久沒拼的
 * - 同一個字的新詞裡，畫得出來的具體詞先上（火山比小心好懂），再來是詞裡其他字他也看過的（火山比擁抱好認）
 * - 上次要靠提示才拼好的詞，下一輪先回來複習，但一輪最多 REVIEWS 個，不要整輪都是他不熟的
 * - 一輪裡每個字只出一次，不會整輪都在找同一個字
 * 第一題放最有把握的字暖身（不放複習的詞）。
 */
export function pickPuzzles(library: CharEntry[], progress: Progress, random = Math.random, n = PIECES, pictures = PICTURE_ROUNDS): PuzzleItem[] {
  const level = puzzleLevel(progress)
  const cards = level === 'easy' ? 2 : 3
  const tricky = level === 'hard'
  const watched = library.filter((c) => progress.watched[c.char] && wordsFor(c).length)
  const seen = (c: CharEntry) => progress.watched[c.char]?.count || 0
  const done = progress.puzzles || {}
  const lastTime = (word: string) => (done[word] ? Date.parse(done[word].last) : -Infinity)
  /** 詞裡其他的字，他看過幾個 */
  const familiar = (word: string, char: string) => [...word].filter((c) => c !== char && progress.watched[c]).length
  // 每個字挑一個詞：上次沒拼對的先複習，再來是沒拼過的，都拼過了挑最久沒拼的
  const choices = watched.map((entry) => {
    const words = shuffle(wordsFor(entry), random)
    const concrete = (w: string) => (NO_PICTURE.has(w) ? 0 : 1)
    const again = words.find((w) => done[w.text]?.lastOk === false)
    const fresh = words.filter((w) => !done[w.text])
      .sort((a, b) => concrete(b.text) - concrete(a.text) || familiar(b.text, entry.char) - familiar(a.text, entry.char))
    const word = again ?? fresh[0] ?? [...words].sort((a, b) => lastTime(a.text) - lastTime(b.text))[0]
    return { entry, word, review: Boolean(again), fresh: !again && fresh.length > 0 }
  })
  const reviews = shuffle(choices.filter((c) => c.review), random).slice(0, REVIEWS)
  // 其他的：有新詞的字先；同樣有新詞的，看越多次的越前面，但打散一點，不要每次都同一批
  const ranked = shuffle(choices.filter((c) => !c.review), random).sort((a, b) => Number(b.fresh) - Number(a.fresh) || seen(b.entry) - seen(a.entry))
  const top = ranked.slice(0, n * 2)
  const warm = top[0] ?? reviews[0]
  const rest = [...reviews, ...shuffle(top.slice(1), random)].filter((c) => c !== warm).slice(0, n - 1)
  const picked = [warm, ...shuffle(rest, random)].filter(Boolean)
  const known = watched.map((c) => c.char)
  const everyone = library.map((c) => c.char)
  const allWords = library.flatMap((c) => wordsFor(c))
  // 看詞找圖：第一題不出（先暖身），只出每個字都看過的詞
  const readable = (w: string) => !NO_PICTURE.has(w) && [...w].every((c) => progress.watched[c])
  const pictureAt = new Set(shuffle(picked.map((_, i) => i).filter((i) => i > 0 && readable(picked[i].word.text)), random).slice(0, pictures))
  return picked.map(({ entry, word, review }, i) => {
    const chars = [...word.text]
    const base = { word: word.text, emoji: word.emoji!, char: entry.char, slot: chars.indexOf(entry.char), ...(review ? { review: true } : {}) }
    if (pictureAt.has(i)) {
      const others = pickPictureDecoys(word.text, word.emoji!, allWords, cards - 1, random, tricky)
      if (others.length === cards - 1) return { kind: 'picture' as const, ...base, options: shuffle([word.text, ...others], random) }
    }
    const decoys = pickDecoys(entry.char, word.text, known, everyone, cards - 1, random, tricky)
    return { kind: 'char' as const, ...base, options: shuffle([entry.char, ...decoys], random) }
  })
}

/**
 * 看詞找圖的其他圖：圖不能跟答案一樣、彼此也不重複；跟答案沒有共同字的詞先挑（日出 跟 生日 都有日，太像）。
 * alike（難一點）：反過來先挑一個有共同字的詞，要讀清楚另一個字才分得出來。
 */
export function pickPictureDecoys(word: string, emoji: string, all: { text: string; emoji?: string }[], n: number, random = Math.random, alike = false) {
  const share = (w: string) => [...w].some((c) => word.includes(c))
  const pool = shuffle(all.filter((w) => w.text !== word && w.emoji && w.emoji !== emoji && !NO_PICTURE.has(w.text)), random)
    .sort((a, b) => Number(share(a.text)) - Number(share(b.text)))
  if (alike) {
    const i = pool.findIndex((w) => share(w.text))
    if (i > 0) pool.unshift(...pool.splice(i, 1))
  }
  const out: string[] = []
  const used = new Set([emoji])
  for (const w of pool) {
    if (out.length >= n) break
    if (used.has(w.emoji!)) continue
    used.add(w.emoji!)
    out.push(w.text)
  }
  return out
}

/**
 * 其他的字卡：不在這個詞裡、長得不像答案、彼此也不重複；優先挑他看過的字。
 * 看過的字不夠就從整個字庫補。
 */
export function pickDecoys(target: string, word: string, known: string[], everyone: string[], n: number, random = Math.random, alike = false) {
  const inWord = new Set(word)
  const ok = (c: string) => c !== target && !inWord.has(c) && !looksAlike(c, target)
  const out: string[] = []
  // 難一點：先放一張他看過、長得像的字
  if (alike) {
    const similar = shuffle(known.filter((c) => c !== target && !inWord.has(c) && looksAlike(c, target)), random)[0]
    if (similar && n > 0) out.push(similar)
  }
  for (const pool of [shuffle(known.filter(ok), random), shuffle(everyone.filter(ok), random)]) {
    for (const c of pool) if (out.length < n && !out.includes(c)) out.push(c)
  }
  return out
}

/**
 * 圖鑑按字排：每個拼過詞的字一排，最近拼的字在前；同一排先放拼好的詞，再放這個字還沒拼過的詞（只露出影子）。
 * 他會看到「火」還有別的詞可以收，字跟詞就這樣一串串連起來。
 */
export function shelves(library: CharEntry[], progress: Progress) {
  const done = collection(progress)
  const order = [...new Set(done.map((d) => d.char))]
  const byChar = new Map(library.map((c) => [c.char, c]))
  return order.map((char) => {
    const entry = byChar.get(char)
    const solved = done.filter((d) => d.char === char).map((d) => d.word)
    const rest = (entry ? wordsFor(entry) : []).map((w) => w.text).filter((w) => !solved.includes(w))
    return { char, solved, rest }
  })
}

/**
 * 別的遊戲要順口唸一個有這個字的詞（餵大怪獸找對時）：每次換一個，畫得出來的具體詞優先，
 * 不要每次都是字卡上的第一個詞。沒有能用的就退回第一個詞。
 */
export function exampleWord(entry: CharEntry, random = Math.random) {
  const concrete = wordsFor(entry).filter((w) => !NO_PICTURE.has(w.text))
  return concrete.length ? concrete[Math.floor(random() * concrete.length)] : entry.words?.[0]
}

/** 圖鑑：拼好過的詞，新的在前。 */
export function collection(progress: Progress) {
  return Object.entries(progress.puzzles || {}).sort((a, b) => Date.parse(b[1].first) - Date.parse(a[1].first)).map(([word, p]) => ({ word, ...p }))
}

function shuffle<T>(list: T[], random: () => number) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
