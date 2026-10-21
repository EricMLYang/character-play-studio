import type { CharEntry } from '../types'
import { STAR_DEEDS, type StarDeed } from '../../shared/domain.mjs'
import { partsOf } from './parts'
import { wordsFor } from './puzzles'

/**
 * 一個字「做得到」的星星有哪幾顆。
 *
 * 五顆星的規則在 shared/domain.mjs（STAR_DEEDS），但不是每個字五顆都拿得到：
 * - 魔法鍋只變得出「裡面有他也在學的字」的字（火拆不出東西，就永遠變不出來）
 * - 詞語拼圖只出畫得出來的詞（有些字的語詞全在 SKIP_WORDS／沒有圖示）
 * 拿不到的那顆不列出來，也不算進滿星，不然他會一直差一顆、永遠集不滿。
 */
export function deedsFor(entry: CharEntry, known: Set<string>): StarDeed[] {
  return STAR_DEEDS.filter((deed) =>
    deed.id === 'brew' ? partsOf(entry.char).some((p) => known.has(p.char))
    : deed.id === 'puzzle' ? wordsFor(entry).length > 0
    : true)
}

/** 這個字最多幾顆星（字卡上集滿就戴皇冠）。 */
export const maxStars = (entry: CharEntry, known: Set<string>) => deedsFor(entry, known).length

/** 整個字庫的上限表，首頁一次算好。 */
export function starCaps(library: CharEntry[]): Map<string, number> {
  const known = new Set(library.map((c) => c.char))
  return new Map(library.map((c) => [c.char, maxStars(c, known)]))
}
