import type { CharEntry, Progress } from '../types'

export const DAILY_LIMIT = 6
export const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const daysSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000

/**
 * 今天要看的字。規則：
 *  - 同一天結果固定（重新整理不會換一批，小孩才不會一直刷）
 *  - 有影片的優先，沒影片的用字卡動畫頂上
 *  - 混入「幾天前看過、該複習了」的字 —— 藏起來的間隔複習，不出考卷
 */
export function pickToday(characters: CharEntry[], progress: Progress): CharEntry[] {
  const key = todayKey()
  const byChar = new Map(characters.map((c) => [c.char, c]))
  const saved = progress.days?.[key]
  if (saved?.length) return saved.map((c) => byChar.get(c)).filter(Boolean) as CharEntry[]

  const watched = progress.watched || {}
  const hasMedia = (c: CharEntry) => (c.media?.length ?? 0) > 0
  const rank = (c: CharEntry) => (hasMedia(c) ? 0 : 1) * 1000 + c.priority

  const fresh = characters.filter((c) => !watched[c.char]).sort((a, b) => rank(a) - rank(b))
  const due = characters
    .filter((c) => watched[c.char] && daysSince(watched[c.char].last) >= 2)
    .sort((a, b) => daysSince(watched[b.char].last) - daysSince(watched[a.char].last))

  const reviewCount = Math.min(2, due.length, DAILY_LIMIT - 1)
  const picked = [...fresh.slice(0, DAILY_LIMIT - reviewCount), ...due.slice(0, reviewCount)]
  // 不足就補滿（字庫用完時會重複複習，這是刻意的）
  if (picked.length < DAILY_LIMIT) {
    for (const c of due.concat(characters)) {
      if (picked.length >= DAILY_LIMIT) break
      if (!picked.includes(c)) picked.push(c)
    }
  }
  return picked.slice(0, DAILY_LIMIT)
}
