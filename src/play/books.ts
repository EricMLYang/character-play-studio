import type { CharEntry, Progress } from '../types'
import { taiwanDay } from '../../shared/domain.mjs'
import { PATTERNS, patternChars, sentenceText, spokenPart, type Pattern } from '../../shared/books.mjs'
import { NO_PICTURE, wordsFor } from './puzzles'

/**
 * 指讀小書（Book.tsx）的規則：今天這本書有哪幾句、每句用哪個句型與語詞、最後一頁的貨架。純函式，好測。
 *
 * - 句型只用字庫裡有的字（shared/books.mjs），空格放一個有圖的語詞
 * - 今天的字（今天的路上複習與新學的）優先進書；不夠就拿他看過、還沒在小書裡讀過的字補
 * - 同一本書句型不重複；句型照日期輪，同一天重開是同一本
 */
export type Word = { text: string; emoji?: string; char: string }
export type Segment = { text: string; say?: string; slot?: boolean }
export type ReadPage = { kind: 'read'; pattern: Pattern; word: Word; char: string; text: string; segments: Segment[] }
export type MinePage = { kind: 'mine'; pattern: Pattern; shelf: Word[] }
export type Page = ReadPage | MinePage

/**
 * 句型的空格要放「一個東西」（火車好大！）；動作、抽象的詞放進去會變成「大叫好可愛」。
 * 語詞沒有詞性資料，先用 puzzles.ts 的 NO_PICTURE（畫不出來的詞）加這張表擋；看到怪句子就把那個詞加進來。
 */
export const BOOK_SKIP = new Set(['大叫', '睿智', '一起', '有趣', '敏捷', '快捷', '小心', '大家', '一樣', '一半', '一直'])

/** 一本書幾句、最後一頁貨架幾個詞 */
export const SENTENCES = 4
export const SHELF = 6

/** 這個字庫用得上的句型（固定的字都在孩子端看得到） */
export function usablePatterns(library: CharEntry[]) {
  const known = new Set(library.map((c) => c.char))
  return PATTERNS.filter((p) => patternChars(p).every((c) => known.has(c)))
}

/** 把一句拆成會亮的段落：前面固定的字、語詞（slot）、後面固定的字；標點跟在段落裡顯示但不唸 */
export function segmentsOf(pattern: Pattern, word: string): Segment[] {
  const out: Segment[] = []
  if (pattern.before) out.push({ text: pattern.before, say: spokenPart(pattern.before) })
  out.push({ text: word, say: word, slot: true })
  if (pattern.after) out.push({ text: pattern.after, say: spokenPart(pattern.after) || undefined })
  return out
}

const dayNumber = (today: string) => Math.floor(Date.parse(`${today}T00:00:00Z`) / 864e5)

export function pickBook(library: CharEntry[], progress: Progress, focus: string[], random = Math.random, today = taiwanDay()): Page[] {
  const patterns = usablePatterns(library)
  if (!patterns.length) return []
  const byChar = new Map(library.map((c) => [c.char, c]))
  const watched = progress.watched || {}
  const read = new Set(Object.keys(progress.books || {}))
  const readChars = new Set(Object.values(progress.books || {}).map((b) => b.char))
  const pictureWords = (entry: CharEntry): Word[] => wordsFor(entry).filter((w) => !NO_PICTURE.has(w.text) && !BOOK_SKIP.has(w.text))
    .map((w) => ({ text: w.text, emoji: w.emoji, char: entry.char }))

  // 進書的字：今天的字先，再補他看過、還沒讀過的，最後才是讀過的
  const seen = library.filter((c) => watched[c.char] && pictureWords(c).length)
  const pool = [
    ...focus.map((c) => byChar.get(c)).filter((c): c is CharEntry => Boolean(c) && pictureWords(c!).length > 0),
    ...shuffle(seen.filter((c) => !focus.includes(c.char) && !readChars.has(c.char)), random),
    ...shuffle(seen.filter((c) => !focus.includes(c.char) && readChars.has(c.char)), random),
  ]
  const targets: CharEntry[] = []
  for (const c of pool) if (!targets.includes(c) && targets.length < SENTENCES) targets.push(c)

  const start = dayNumber(today)
  const pages: Page[] = targets.map((entry, i) => {
    const pattern = patterns[(start + i) % patterns.length]
    const words = pictureWords(entry)
    // 還沒在小書裡讀過的詞先上
    const fresh = words.filter((w) => !read.has(sentenceText(pattern, w.text)))
    const word = (fresh.length ? fresh : words)[Math.floor(random() * (fresh.length ? fresh : words).length)]
    return { kind: 'read', pattern, word, char: entry.char, text: sentenceText(pattern, word.text), segments: segmentsOf(pattern, word.text) }
  })
  if (!pages.length) return []

  // 最後一頁：自己接一句。貨架上放他看過的字的詞，每個字一個
  const shelf: Word[] = []
  for (const c of shuffle(seen, random)) {
    if (shelf.length >= SHELF) break
    if (shelf.some((w) => w.char === c.char)) continue
    const words = pictureWords(c)
    shelf.push(words[Math.floor(random() * words.length)])
  }
  const minePattern = patterns[(start + targets.length) % patterns.length]
  if (shelf.length >= 2) pages.push({ kind: 'mine', pattern: minePattern, shelf })
  return pages
}

/** 這一頁他要指出來的字在句子的第幾個位置（一句裡那個字只出現一次才能問） */
export const askable = (page: ReadPage) => [...page.text].filter((c) => c === page.char).length === 1

function shuffle<T>(list: T[], random: () => number) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
