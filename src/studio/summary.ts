import type { CharEntry, Progress } from '../types'
import { taiwanDay, totalStars } from '../../shared/domain.mjs'
import { NO_PICTURE } from '../play/puzzles'
import { nextPartner, partnerCount } from '../play/partners'

/**
 * 家長看的學習小結：孩子端各個遊戲記下的東西，整理成大人一眼看得懂的幾個數字與清單。
 * 只讀 progress，不改任何東西。日期一律用台灣時間。
 */
export type Summary = {
  /** 看過幾個字、今天看了幾個 */
  watched: number
  watchedToday: number
  /** 餵大怪獸：認得幾個字（記住程度至少升過一級）、今天該複習幾個、找錯最多次的字 */
  known: number
  dueToday: number
  tricky: { char: string; wrong: number; right: number }[]
  /** 詞語拼圖：收集了幾個詞、今天拼了幾個新詞、第一下就對的比例（0–1，沒拼過是 null） */
  words: number
  wordsToday: number
  firstTry: number | null
  /** 上次要靠提示才拼好的詞，下次會先回來複習 */
  practice: { word: string; char: string }[]
  /** 最近收集、畫得出來的詞：家長可以問「你在哪裡看過○○？」 */
  talk: { word: string; emoji?: string }[]
  /** 小鎮：描過幾個字 */
  traced: number
  /** 他在孩子端追的那條線：一共幾顆星星、換到幾位夥伴、下一位還差幾顆 */
  stars: number
  partners: number
  toNextPartner: number | null
}

export function summarize(progress: Progress, characters: CharEntry[], now = new Date()): Summary {
  const today = taiwanDay(now)
  const watched = Object.entries(progress.watched || {})
  const recall = Object.entries(progress.recall || {})
  const puzzles = Object.entries(progress.puzzles || {})
  const pictures = new Map(characters.flatMap((c) => (c.words || []).map((w) => [w.text, w.emoji] as const)))
  const attempts = puzzles.reduce((n, [, p]) => n + p.count, 0)
  const stars = totalStars(progress)
  return {
    watched: watched.length,
    watchedToday: watched.filter(([, w]) => taiwanDay(w.last) === today).length,
    known: recall.filter(([, r]) => r.box > 0).length,
    dueToday: recall.filter(([, r]) => r.due <= today).length,
    tricky: recall.filter(([, r]) => r.wrong > 0)
      .sort((a, b) => b[1].wrong - a[1].wrong || a[1].right - b[1].right)
      .slice(0, 6).map(([char, r]) => ({ char, wrong: r.wrong, right: r.right })),
    words: puzzles.length,
    wordsToday: puzzles.filter(([, p]) => taiwanDay(p.first) === today).length,
    firstTry: attempts ? puzzles.reduce((n, [, p]) => n + p.right, 0) / attempts : null,
    practice: puzzles.filter(([, p]) => p.lastOk === false)
      .sort((a, b) => Date.parse(b[1].last) - Date.parse(a[1].last))
      .slice(0, 8).map(([word, p]) => ({ word, char: p.char })),
    talk: puzzles.filter(([word]) => !NO_PICTURE.has(word))
      .sort((a, b) => Date.parse(b[1].first) - Date.parse(a[1].first))
      .slice(0, 3).map(([word]) => ({ word, emoji: pictures.get(word) })),
    traced: Object.keys(progress.town || {}).length,
    stars: stars,
    partners: partnerCount(stars),
    toNextPartner: nextPartner(stars)?.need ?? null,
  }
}
