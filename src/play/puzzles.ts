import type { CharEntry, Progress } from '../types'
import { looksAlike } from './dishes'

/**
 * 詞語拼圖：看圖、聽一個詞（生日🎂），詞裡缺一個字，從幾張字卡裡把它找出來補上。
 * 練的是詞彙：同一個字放進不同的詞（生日、日出、日記），他才知道這個字在生活裡怎麼用。
 * 缺的那個字一定是他看過的字；詞裡其他的字直接寫出來，不認得也沒關係。
 */

/** 一輪拼幾個詞 */
export const PIECES = 5

export type PuzzleItem = {
  /** 整個詞 */
  word: string
  /** 圖 */
  emoji: string
  /** 缺的那個字 */
  char: string
  /** 缺在第幾個位置 */
  slot: number
  /** 字卡（含答案，已經洗好） */
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
export function pickPuzzles(library: CharEntry[], progress: Progress, random = Math.random, n = PIECES, cards = 3): PuzzleItem[] {
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
  return picked.map(({ entry, word }) => {
    const chars = [...word.text]
    const decoys = pickDecoys(entry.char, word.text, known, everyone, cards - 1, random)
    return { word: word.text, emoji: word.emoji!, char: entry.char, slot: chars.indexOf(entry.char), options: shuffle([entry.char, ...decoys], random) }
  })
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
