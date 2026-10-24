import type { CharEntry, Progress } from '../types'
import { charStars, taiwanDay } from '../../shared/domain.mjs'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { nextPartner } from './partners'
import { deedsFor } from './stars'

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

/** 按下去要去哪 */
export type NudgeGo =
  /** 某個遊戲（games.tsx 的 GAMES）。want＝為了哪個字去的，那個遊戲的第一題就出這個字 */
  | { kind: 'game'; id: string; want?: string }
  /** 打開那個字的字卡 */
  | { kind: 'char'; char: string }
  /** 留在首頁自己挑字卡 */
  | null

export type Nudge = {
  /** 哪一隻角色來說（public/hero/<hero>/<pose>.png） */
  hero: string
  pose: string
  /** 說的話。對六歲講具體的事，不講統計 */
  text: string
  /**
   * 唸出來的句子，一句接一句（他還不會讀字）。
   * 跟 text 不一定一樣：帶數字與字的句子做不出音檔，所以拆成固定句子＋那個字本身，
   * 全部都有做好的音檔（shared/voice-lines.mjs 的 nudge*）。
   */
  say: string[]
  /** 按鈕上的字 */
  cta: string
  go: NudgeGo
}

/** 去某個遊戲的按鈕字樣 */
const GO_TO: Record<string, string> = {
  feed: '去餵牠 →', river: '去過河 →', lab: '去魔法鍋 →', train: '去接火車 →', puzzle: '去拼詞語 →', town: '去小鎮 →', roots: '去部首家族 →',
}

/** 缺的那顆星要怎麼拿（唸出來的那句；shared/domain.mjs 的 STAR_DEEDS 一個 id 一句） */
const DEED_SAY: Record<string, string> = {
  watch: FIXED_LINES.nudgeDoWatch,
  write: FIXED_LINES.nudgeDoWrite,
  recall: FIXED_LINES.nudgeDoRecall,
  puzzle: FIXED_LINES.nudgeDoPuzzle,
  family: FIXED_LINES.nudgeDoFamily,
}

/** 每個地方派誰出來講話 */
const WHO: Record<string, { hero: string; pose: string }> = {
  card: { hero: 'yang', pose: 'happy' },
  feed: { hero: 'monster', pose: 'idle' },
  river: { hero: 'mouse', pose: 'idle' },
  lab: { hero: 'alien', pose: 'idle' },
  train: { hero: 'robot', pose: 'idle' },
  puzzle: { hero: 'raccoon', pose: 'idle' },
  roots: { hero: 'dino', pose: 'idle' },
  town: { hero: 'sheriff', pose: 'idle' },
  star: { hero: 'cape', pose: 'happy' },
  chest: { hero: 'pirate', pose: 'happy' },
}

/**
 * 還沒去過的地方，照這個順序推薦。跳石頭過河不在這裡：它跟餵大怪獸記同一種紀錄（recall），
 * 分不出他去過沒，所以改由「該複習了」跟最後那條預設去推。
 */
const UNTRIED: { id: string; played: (p: Progress) => boolean; text: string }[] = [
  { id: 'lab', played: (p) => Object.keys(p.lab || {}).length > 0, text: FIXED_LINES.nudgeLab },
  { id: 'train', played: (p) => Object.keys(p.words || {}).length > 0, text: FIXED_LINES.nudgeTrain },
  { id: 'puzzle', played: (p) => Object.keys(p.puzzles || {}).length > 0, text: FIXED_LINES.nudgePuzzle },
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
  if (!seen) return { ...WHO.card, text: FIXED_LINES.nudgeFirst, say: [FIXED_LINES.nudgeFirst], cta: '挑一個字 →', go: null }

  // 今天還沒開始：先看一個字。看字是這裡所有玩法的入口（遊戲只考他看過的字）
  const todayCount = Object.values(watched).filter((w) => taiwanDay(w.last) === today).length
  if (!todayCount) return { ...WHO.card, text: FIXED_LINES.nudgeToday, say: [FIXED_LINES.nudgeToday], cta: '挑一個字 →', go: null }

  // 字太少的時候不推遊戲：遊戲只考他看過的字，去了也只有兩張卡可以選
  const enough = seen >= 4
  if (enough) {
    for (const place of UNTRIED) {
      if (place.played(progress)) continue
      return { ...WHO[place.id], text: place.text, say: [place.text], cta: GO_TO[place.id], go: { kind: 'game', id: place.id } }
    }
  }

  // 有字到期該複習了：餵大怪獸跟過河都在考這個，輪流說，不要每天都同一隻
  const due = Object.entries(progress.recall || {}).filter(([, r]) => r.due <= today).length
  if (enough && due >= 3) {
    const toRiver = due % 2 === 0
    return toRiver
      ? { ...WHO.river, text: `有 ${due} 個字可以再認一次，陪我過河好不好？`, say: [FIXED_LINES.nudgeRiverDue], cta: GO_TO.river, go: { kind: 'game', id: 'river' } }
      : { ...WHO.feed, text: `我肚子餓了，有 ${due} 個字想吃！`, say: [FIXED_LINES.nudgeFeedDue], cta: GO_TO.feed, go: { kind: 'game', id: 'feed' } }
  }

  // 快開到下一個寶箱了：這是他現在最近的一個獎勵，講出來他才知道差一點點
  const total = [...stars.values()].reduce((sum, n) => sum + n, 0)
  const chest = nextPartner(total)
  if (enough && chest && chest.need <= 3) {
    return { ...WHO.chest, text: `再 ${chest.need} 顆星星就有新夥伴了！`, say: [FIXED_LINES.nudgeChest], cta: '去拿星星 →', go: { kind: 'game', id: 'river' } }
  }

  // 差一顆就滿星的字：講那個字，不講數字
  const nearly = [...stars].filter(([char, n]) => n > 0 && n + 1 === (caps.get(char) ?? 5) && library.some((c) => c.char === char))
  if (nearly.length) {
    const [char] = nearly[Math.floor(Math.random() * nearly.length)]
    const entry = library.find((c) => c.char === char)!
    const got = charStars(progress, char)
    // 缺的是哪一顆：直接把他帶到那個遊戲，而且那裡的第一題就出這個字（games.tsx 的 want）。
    // 只說「去看『楊』」的話，他還要自己在字卡上找到星星那一條、再按一次「去」。
    const missing = deedsFor(entry, new Set(library.map((c) => c.char))).find((d) => !got[d.id])
    const text = `「${char}」只差一顆星星！`
    const say = [FIXED_LINES.nudgeNearly, char, ...(missing ? [DEED_SAY[missing.id]] : [])]
    return missing?.where
      ? { ...WHO[missing.where], text, say, cta: GO_TO[missing.where], go: { kind: 'game', id: missing.where, want: char } }
      : { ...WHO.star, text, say, cta: `去看「${char}」 →`, go: { kind: 'char', char } }
  }

  // 沒有特別該做的事：講他已經拿到的，再順手推一個地方
  if (!enough) return { ...WHO.card, text: FIXED_LINES.nudgeMore, say: [FIXED_LINES.nudgeMore], cta: '挑一個字 →', go: null }
  return { ...WHO.star, text: `你已經收集了 ${total} 顆星星！再去拿幾顆？`, say: [FIXED_LINES.nudgeStars], cta: GO_TO.river, go: { kind: 'game', id: 'river' } }
}
