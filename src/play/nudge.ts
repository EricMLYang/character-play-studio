import type { CharEntry, Progress } from '../types'
import { taiwanDay } from '../../shared/domain.mjs'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { nextPartner } from './partners'

/**
 * 首頁上那隻角色現在要跟他說什麼。
 *
 * 六歲打開 app 不會自己想「今天該做什麼」：字卡攤開兩百多張，七個遊戲一排按鈕，
 * 他就點最熟的那個。所以讓一隻角色站在首頁，看他的紀錄挑一件現在最值得做的事說出來，
 * 按一下直接過去。（他的紀錄裡魔法鍋跟字火車是 0 次——不是不好玩，是從來沒被帶進去過。）
 *
 * 規則有先後：今天還沒開始 → 沒玩過的地方 → 該複習了 → 快開到寶箱 → 快滿星的字 → 不然就講他的星星。
 * 每一條都只用已經在記的紀錄算，沒有新的進度欄位。
 */
export type Nudge = {
  /** 哪一隻角色來說（public/hero/<hero>/<pose>.png） */
  hero: string
  pose: string
  /** 說的話。對六歲講具體的事，不講統計 */
  text: string
  /** 按鈕上的字 */
  cta: string
  /**
   * 按下去要去哪：遊戲 id（games.tsx 的 GAMES）、'char:<字>' 去開那個字，
   * 或 null＝留在首頁自己挑字卡
   */
  go: string | null
}

/** 每個地方派誰出來講話 */
const WHO: Record<string, { hero: string; pose: string }> = {
  card: { hero: 'yang', pose: 'happy' },
  feed: { hero: 'monster', pose: 'idle' },
  river: { hero: 'mouse', pose: 'idle' },
  lab: { hero: 'alien', pose: 'idle' },
  train: { hero: 'robot', pose: 'idle' },
  puzzle: { hero: 'raccoon', pose: 'idle' },
  town: { hero: 'sheriff', pose: 'idle' },
  star: { hero: 'cape', pose: 'happy' },
  chest: { hero: 'pirate', pose: 'happy' },
}

/**
 * 還沒去過的地方，照這個順序推薦。跳石頭過河不在這裡：它跟餵大怪獸記同一種紀錄（recall），
 * 分不出他去過沒，所以改由「該複習了」跟最後那條預設去推。
 */
const UNTRIED: { id: string; played: (p: Progress) => boolean; text: string; cta: string }[] = [
  { id: 'lab', played: (p) => Object.keys(p.lab || {}).length > 0, text: FIXED_LINES.nudgeLab, cta: '去魔法鍋 →' },
  { id: 'train', played: (p) => Object.keys(p.words || {}).length > 0, text: FIXED_LINES.nudgeTrain, cta: '去接火車 →' },
  { id: 'puzzle', played: (p) => Object.keys(p.puzzles || {}).length > 0, text: FIXED_LINES.nudgePuzzle, cta: '去拼詞語 →' },
]

export function pickNudge(
  /** 孩子端看得到的字（只用來確認推薦的字還在字庫裡） */
  library: CharEntry[],
  progress: Progress,
  stars: Map<string, number>,
  caps: Map<string, number>,
  today = taiwanDay(),
): Nudge {
  const watched = progress.watched || {}
  const seen = Object.keys(watched).length

  // 一個字都還沒看過：先把第一張字卡點開，其他都還談不上
  if (!seen) return { ...WHO.card, text: FIXED_LINES.nudgeFirst, cta: '挑一個字 →', go: null }

  // 今天還沒開始：先看一個字。看字是這裡所有玩法的入口（遊戲只考他看過的字）
  const todayCount = Object.values(watched).filter((w) => taiwanDay(w.last) === today).length
  if (!todayCount) return { ...WHO.card, text: FIXED_LINES.nudgeToday, cta: '挑一個字 →', go: null }

  // 字太少的時候不推遊戲：遊戲只考他看過的字，去了也只有兩張卡可以選
  const enough = seen >= 4
  if (enough) {
    for (const place of UNTRIED) {
      if (place.played(progress)) continue
      return { ...WHO[place.id], text: place.text, cta: place.cta, go: place.id }
    }
  }

  // 有字到期該複習了：餵大怪獸跟過河都在考這個，輪流說，不要每天都同一隻
  const due = Object.entries(progress.recall || {}).filter(([, r]) => r.due <= today).length
  if (enough && due >= 3) {
    const toRiver = due % 2 === 0
    return toRiver
      ? { ...WHO.river, text: `有 ${due} 個字可以再認一次，陪我過河好不好？`, cta: '去過河 →', go: 'river' }
      : { ...WHO.feed, text: `我肚子餓了，有 ${due} 個字想吃！`, cta: '去餵牠 →', go: 'feed' }
  }

  // 快開到下一個寶箱了：這是他現在最近的一個獎勵，講出來他才知道差一點點
  const total = [...stars.values()].reduce((sum, n) => sum + n, 0)
  const chest = nextPartner(total)
  if (enough && chest && chest.need <= 3) {
    return { ...WHO.chest, text: `再 ${chest.need} 顆星星就有新夥伴了！`, cta: '去拿星星 →', go: 'river' }
  }

  // 差一顆就滿星的字：講那個字，不講數字
  const nearly = [...stars].filter(([char, n]) => n > 0 && n + 1 === (caps.get(char) ?? 5) && library.some((c) => c.char === char))
  if (nearly.length) {
    const [char] = nearly[Math.floor(Math.random() * nearly.length)]
    return { ...WHO.star, text: `「${char}」只差一顆星星就集滿了！`, cta: `去看「${char}」 →`, go: `char:${char}` }
  }

  // 沒有特別該做的事：講他已經拿到的，再順手推一個地方
  if (!enough) return { ...WHO.card, text: FIXED_LINES.nudgeMore, cta: '挑一個字 →', go: null }
  return { ...WHO.star, text: `你已經收集了 ${total} 顆星星！再去拿幾顆？`, cta: '去過河 →', go: 'river' }
}
