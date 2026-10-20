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
}

/** 這個字可以拿來拼的詞：要有圖、2～4 個字、這個字在詞裡只出現一次。 */
export function wordsFor(entry: CharEntry) {
  return (entry.words || []).filter((w) => {
    const chars = [...w.text]
    return w.emoji && chars.length >= 2 && chars.length <= 4 && chars.filter((c) => c === entry.char).length === 1
  })
}

/**
 * 這一輪的詞。
 * - 只用他看過的字，看越多次的字越前面（最可能認得）
 * - 還沒拼過的詞優先，圖鑑才會一直有新東西；都拼過了就挑最久沒拼的
 * - 同一個字的新詞裡，詞裡其他字他也看過的先上（火山比擁抱好認）
 * - 一輪裡每個字只出一次，不會整輪都在找同一個字
 * 第一題放最有把握的字暖身。
 */
export function pickPuzzles(library: CharEntry[], progress: Progress, random = Math.random, n = PIECES, cards = 3, pictures = PICTURE_ROUNDS): PuzzleItem[] {
  const watched = library.filter((c) => progress.watched[c.char] && wordsFor(c).length)
  const seen = (c: CharEntry) => progress.watched[c.char]?.count || 0
  const done = progress.puzzles || {}
  const lastTime = (word: string) => (done[word] ? Date.parse(done[word].last) : -Infinity)
  /** 詞裡其他的字，他看過幾個 */
  const familiar = (word: string, char: string) => [...word].filter((c) => c !== char && progress.watched[c]).length
  // 每個字挑一個詞：沒拼過的先，拼過的挑最久沒拼的
  const choices = watched.map((entry) => {
    const words = shuffle(wordsFor(entry), random)
    const fresh = words.filter((w) => !done[w.text]).sort((a, b) => familiar(b.text, entry.char) - familiar(a.text, entry.char))
    const word = fresh[0] ?? [...words].sort((a, b) => lastTime(a.text) - lastTime(b.text))[0]
    return { entry, word, fresh: fresh.length > 0 }
  })
  // 有新詞的字先；同樣有新詞的，看越多次的越前面，但打散一點，不要每次都同一批
  const ranked = shuffle(choices, random).sort((a, b) => Number(b.fresh) - Number(a.fresh) || seen(b.entry) - seen(a.entry))
  const top = ranked.slice(0, n * 2)
  const picked = [top[0], ...shuffle(top.slice(1), random)].filter(Boolean).slice(0, n)
  const known = watched.map((c) => c.char)
  const everyone = library.map((c) => c.char)
  const allWords = library.flatMap((c) => wordsFor(c))
  // 看詞找圖：第一題不出（先暖身），只出每個字都看過的詞
  const readable = (w: string) => [...w].every((c) => progress.watched[c])
  const pictureAt = new Set(shuffle(picked.map((_, i) => i).filter((i) => i > 0 && readable(picked[i].word.text)), random).slice(0, pictures))
  return picked.map(({ entry, word }, i) => {
    const chars = [...word.text]
    const base = { word: word.text, emoji: word.emoji!, char: entry.char, slot: chars.indexOf(entry.char) }
    if (pictureAt.has(i)) {
      const others = pickPictureDecoys(word.text, word.emoji!, allWords, cards - 1, random)
      if (others.length === cards - 1) return { kind: 'picture' as const, ...base, options: shuffle([word.text, ...others], random) }
    }
    const decoys = pickDecoys(entry.char, word.text, known, everyone, cards - 1, random)
    return { kind: 'char' as const, ...base, options: shuffle([entry.char, ...decoys], random) }
  })
}

/**
 * 看詞找圖的其他圖：圖不能跟答案一樣、彼此也不重複；跟答案沒有共同字的詞先挑（日出 跟 生日 都有日，太像，留給以後）。
 */
export function pickPictureDecoys(word: string, emoji: string, all: { text: string; emoji?: string }[], n: number, random = Math.random) {
  const share = (w: string) => [...w].some((c) => word.includes(c))
  const pool = shuffle(all.filter((w) => w.text !== word && w.emoji && w.emoji !== emoji), random).sort((a, b) => Number(share(a.text)) - Number(share(b.text)))
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
export function pickDecoys(target: string, word: string, known: string[], everyone: string[], n: number, random = Math.random) {
  const inWord = new Set(word)
  const ok = (c: string) => c !== target && !inWord.has(c) && !looksAlike(c, target)
  const out: string[] = []
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
