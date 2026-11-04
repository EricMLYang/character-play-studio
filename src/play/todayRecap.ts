import type { Progress } from '../types'
import { taiwanDay } from '../../shared/domain.mjs'

/**
 * 今日戰報：今天的路走完，不是只放彩帶，而是一張「今天的字」卡。
 *
 * 好的學習 App 收尾都會給孩子看「你今天做到了什麼」，而且是具體的東西（Khan Kids 的貼紙、Duolingo 的今日摘要）。
 * 這裡是他今天碰過的字，一個一個飛進來；他今天自己寫過的字貼上他的筆跡；每個字旁邊標今天做了哪幾件事。
 * 全部從紀錄算（台灣日期），沒有新的進度欄位。
 */
export type DayDeed = 'watch' | 'write' | 'recall' | 'read' | 'family'
export type DayChar = { char: string; deeds: DayDeed[]; strokes?: number[][] }

/** 越難的事分數越高（憑記憶寫、自己認出來是研究上最有效的兩件事） */
const WEIGHT: Record<DayDeed, number> = { write: 3, recall: 3, read: 2, family: 2, watch: 1 }

/** 卡片上最多幾個字（再多排不下，也唸太久） */
export const DAY_MAX = 6

export function dayCard(progress: Progress, today = taiwanDay()): DayChar[] {
  const on = (at?: string) => Boolean(at) && taiwanDay(at!) === today
  const chars = new Map<string, Set<DayDeed>>()
  const add = (c: string, d: DayDeed) => { if (!chars.has(c)) chars.set(c, new Set()); chars.get(c)!.add(d) }
  for (const [c, w] of Object.entries(progress.watched || {})) if (on(w.last)) add(c, 'watch')
  for (const [c, r] of Object.entries(progress.town || {})) if (on(r.last)) add(c, 'write')
  for (const [c, r] of Object.entries(progress.recall || {})) if (on(r.last) && r.due > today) add(c, 'recall')
  for (const b of Object.values(progress.books || {})) if (on(b.last) && b.char) add(b.char, 'read')
  for (const fam of Object.values(progress.radicals || {})) for (const [c, at] of Object.entries(fam)) if (on(at) && [...c].length === 1) add(c, 'family')
  // 今天最用功的字排前面：自己寫、自己認出來比看一次難，分數高；一樣高就照字的順序，每次打開都一樣
  const score = (deeds: DayDeed[]) => deeds.reduce((n, d) => n + WEIGHT[d], 0)
  return [...chars].map(([char, deeds]) => ({ char, deeds: [...deeds], strokes: progress.town?.[char]?.strokes }))
    .sort((a, b) => score(b.deeds) - score(a.deeds) || a.char.localeCompare(b.char))
    .slice(0, DAY_MAX)
}

export const DEED_ICON: Record<DayDeed, string> = { watch: '👀', write: '✏️', recall: '🍽️', read: '📖', family: '🏠' }
