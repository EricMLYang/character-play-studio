import type { CharEntry, Progress } from '../types'
import { taiwanDay } from '../../shared/domain.mjs'
import { STORIES, choiceChars, stickersOf, storyChars, type Story } from '../../shared/stories.mjs'

/**
 * 故事屋（Story.tsx）的規則：書架上有哪幾本、哪幾本打得開、接下來讀哪一本、什麼時候換他先讀。純函式，好測。
 * 故事的內容在 shared/stories.mjs，每一段演什麼在 src/story/scenes/。
 */
export type Book = {
  story: Story
  /** 打得開：選項的字他都看過了 */
  open: boolean
  /** 還要先認識哪幾個字（選項裡他還沒看過的） */
  need: string[]
  /** 每一種結果一張貼紙：拿到了沒 */
  stickers: { beat: string; char: string; emoji: string; got: boolean }[]
  /** 讀完幾遍 */
  count: number
  last?: string
}

/**
 * 書架：只放「每個字都在孩子端字庫裡」的故事（家長把某個字收起來，那本就先不出現，不會讀到點不開的字）。
 * 選項是他要自己讀的字，全部看過才打開；故事裡其他字會唸給他聽，不擋。
 */
export function shelfOf(library: CharEntry[], progress: Progress): Book[] {
  const known = new Set(library.map((c) => c.char))
  const watched = progress.watched || {}
  return STORIES.filter((story) => storyChars(story).every((c) => known.has(c))).map((story) => {
    const log = progress.stories?.[story.id]
    const need = choiceChars(story).filter((c) => !watched[c])
    return {
      story, need, open: need.length === 0, count: log?.count ?? 0, last: log?.last,
      stickers: stickersOf(story).map((s) => ({ ...s, got: Boolean(log?.seen?.[s.beat]) })),
    }
  })
}

/** 還有幾張貼紙沒拿到 */
export const missing = (book: Book) => book.stickers.filter((s) => !s.got).length

/**
 * 接下來推薦哪一本（書架上會跳的那本）：還沒讀過的先，再來是貼紙還沒收齊的，都收齊了就挑最久沒讀的。
 * 都打不開就沒有。
 */
export function nextBook(shelf: Book[]): Book | undefined {
  const open = shelf.filter((b) => b.open)
  return open.find((b) => b.count === 0)
    ?? open.filter((b) => missing(b) > 0).sort((a, b) => (a.last ?? '').localeCompare(b.last ?? ''))[0]
    ?? [...open].sort((a, b) => (a.last ?? '').localeCompare(b.last ?? ''))[0]
}

/**
 * 讀完過一遍的故事，再讀就「換他先讀」：字先出來、不唸，他讀好了按一下才演給他看（先自己想、再對答案）。
 * 第一遍是唸給他聽、字跟著亮——那時他還不知道故事在講什麼。
 */
export const yourTurn = (book: Pick<Book, 'count'>) => book.count >= 1

/** 今天讀完過故事了沒（今天的路「讀一讀」那一站用） */
export const storyToday = (progress: Progress, today = taiwanDay()) =>
  Object.values(progress.stories || {}).some((log) => log.count > 0 && taiwanDay(log.last) === today)

/** 看了這個字會多打開哪幾本（只差這一個字的）：今天的新字優先挑這種 */
export function opensWith(char: string, shelf: Book[]) {
  return shelf.filter((b) => b.need.length === 1 && b.need[0] === char)
}

/**
 * 一句話唸到第幾個字（字跟著聲音亮）。標點不亮，但會讓前一個字多停一下。
 * elapsed 是這句開始唸之後過了幾秒，dur 是整句多長；還沒開始回 -1，唸完回 -1。
 */
export function litIndex(text: string, elapsed: number, dur: number) {
  if (elapsed < 0 || elapsed >= dur) return -1
  const chars = [...text]
  const weight = chars.map((c) => (/[。！？，]/.test(c) ? 0.7 : 1))
  const total = weight.reduce((a, b) => a + b, 0)
  let at = 0
  for (let i = 0; i < chars.length; i++) {
    at += weight[i]
    if (elapsed / dur < at / total) {
      // 落在標點的停頓裡：亮著的還是前一個字
      let k = i
      while (k > 0 && weight[k] < 1) k--
      return k
    }
  }
  return -1
}
