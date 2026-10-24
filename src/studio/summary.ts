import type { CharEntry, Progress } from '../types'
import { charStars, starIndex, taiwanDay, totalStars } from '../../shared/domain.mjs'
import { NO_PICTURE } from '../play/puzzles'
import { nextPartner, partnerCount } from '../play/partners'
import { deedsFor } from '../play/stars'
import { browseCharacters } from '../../shared/selection.mjs'

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
  /** 星星集滿、戴皇冠的字 */
  full: string[]
  /**
   * 研究上最有效的兩件事他做得最少：寫（憑記憶寫）跟自己認出來。
   * 這兩排是「看過、但還沒憑記憶寫過」與「只看過一次」的字，家長挑一兩個帶他做。
   */
  notWritten: string[]
  onlyOnce: string[]
  /**
   * 只差一顆就集滿的字，跟缺的是哪一顆。
   * 家長最用得上的一條：孩子端那隻角色也會講這個，但這裡一次看得到全部，
   * 可以挑一個跟他說「我們去把『田』補完吧」。
   */
  nearly: { char: string; deed: string; where: string | null }[]
}

export function summarize(progress: Progress, characters: CharEntry[], now = new Date()): Summary {
  const today = taiwanDay(now)
  const watched = Object.entries(progress.watched || {})
  const recall = Object.entries(progress.recall || {})
  const puzzles = Object.entries(progress.puzzles || {})
  const pictures = new Map(characters.flatMap((c) => (c.words || []).map((w) => [w.text, w.emoji] as const)))
  const attempts = puzzles.reduce((n, [, p]) => n + p.count, 0)
  const stars = totalStars(progress)
  // 每個字拿到幾顆、做得到幾顆（孩子端看得到的字才算；拿不到的那顆不列入，不然永遠差一顆）
  const index = starIndex(progress)
  const visible = browseCharacters(characters)
  const counted = visible.map((entry) => {
    const got = index.get(entry.char) || 0
    const deeds = deedsFor(entry, new Set(visible.map((c) => c.char)))
    return { entry, got, deeds }
  })
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
    notWritten: visible.filter((c) => progress.watched?.[c.char] && !(progress.town?.[c.char]?.blind))
      .sort((a, b) => (progress.watched[b.char].count) - (progress.watched[a.char].count)).slice(0, 10).map((c) => c.char),
    onlyOnce: visible.filter((c) => progress.watched?.[c.char]?.count === 1)
      .sort((a, b) => Date.parse(progress.watched[a.char].last) - Date.parse(progress.watched[b.char].last)).slice(0, 10).map((c) => c.char),
    stars: stars,
    partners: partnerCount(stars),
    toNextPartner: nextPartner(stars)?.need ?? null,
    full: counted.filter((c) => c.got > 0 && c.got >= c.deeds.length).map((c) => c.entry.char),
    nearly: counted.filter((c) => c.got > 0 && c.got + 1 === c.deeds.length).slice(0, 8).map((c) => {
      const has = charStars(progress, c.entry.char)
      const missing = c.deeds.find((d) => !has[d.id])!
      return { char: c.entry.char, deed: missing.label, where: missing.where }
    }),
  }
}
