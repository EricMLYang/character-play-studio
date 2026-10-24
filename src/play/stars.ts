import type { CharEntry } from '../types'
import { STAR_DEEDS, type StarDeed } from '../../shared/domain.mjs'
import { familyOf } from '../../shared/radicals.mjs'
import { wordsFor } from './puzzles'

/**
 * 一個字「做得到」的星星有哪幾顆。
 *
 * 五顆星的規則在 shared/domain.mjs（STAR_DEEDS），但不是每個字五顆都拿得到：
 * - 部首家族只有「住在某一家、而且那一家在孩子端湊得到兩個字」的字才找得到家（radicals.mjs）
 * - 詞語拼圖只出畫得出來的詞（有些字的語詞全在 SKIP_WORDS／沒有圖示）
 * 拿不到的那顆不列出來，也不算進滿星，不然他會一直差一顆、永遠集不滿。
 */
export function deedsFor(entry: CharEntry, known: Set<string>): StarDeed[] {
  return STAR_DEEDS.filter((deed) =>
    deed.id === 'family' ? hasHome(entry.char, known)
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

/** 這個字住的那一家，在孩子端看得到的字裡湊得到兩個（跟 families.ts 的 MIN_MEMBERS 同一個門檻） */
function hasHome(char: string, known: Set<string>) {
  const family = familyOf(char)
  return Boolean(family) && Object.keys(family!.members).filter((c) => known.has(c)).length >= 2
}
