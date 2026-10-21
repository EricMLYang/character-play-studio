import type { Progress } from '../types'
import { taiwanDay } from '../../shared/domain.mjs'

/**
 * 今天的三件事。
 *
 * 他可以玩的東西變多了（六個地方），但「今天到底要做什麼」還是沒人講。
 * 三件小事剛剛好：看得完、每件都有進度條、做完打一個勾，三件都做完放彩帶。
 * 沒有失敗、沒有倒數、沒做完也不會怎麼樣——這是給六歲的目標，不是作業。
 *
 * 全部從已經在記的紀錄算出來（哪一筆是今天做的看台灣日期），沒有新的進度欄位：
 * 換裝置、重新整理都一樣，也不會有「做了卻沒算到」。
 */
export type Quest = {
  id: string
  icon: string
  label: string
  /** 手機上排不下長名字時用的短名 */
  short: string
  /** 今天做到幾個 */
  done: number
  /** 要做到幾個 */
  need: number
  /** 按下去要去哪：遊戲 id，或 null＝自己挑字卡 */
  go: string | null
}

/** 每天從這裡挑，第一件固定是看字（其他玩法都只考他看過的字） */
const POOL: { id: string; icon: string; label: string; short: string; need: number; go: string | null; count: (p: Progress, today: string) => number }[] = [
  {
    id: 'watch', icon: '🌈', label: '看 3 個字', short: '看字', need: 3, go: null,
    count: (p, today) => Object.values(p.watched || {}).filter((w) => taiwanDay(w.last) === today).length,
  },
  {
    id: 'recall', icon: '🍽️', label: '自己認出 3 個字', short: '認字', need: 3, go: 'feed',
    // 答對會把下次要考的日子排到今天以後；答錯是今天再考一次，所以 due 還是今天
    count: (p, today) => Object.values(p.recall || {}).filter((r) => taiwanDay(r.last) === today && r.due > today).length,
  },
  {
    id: 'puzzle', icon: '🧩', label: '拼好 2 個詞', short: '拼詞', need: 2, go: 'puzzle',
    count: (p, today) => Object.values(p.puzzles || {}).filter((q) => taiwanDay(q.last) === today).length,
  },
  {
    id: 'write', icon: '✏️', label: '自己寫 1 個字', short: '寫字', need: 1, go: null,
    count: (p, today) => Object.values(p.town || {}).filter((r) => taiwanDay(r.last) === today).length,
  },
  {
    id: 'brew', icon: '🧪', label: '魔法鍋變出 2 個字', short: '變字', need: 2, go: 'lab',
    count: (p, today) => Object.values(p.lab || {}).filter((at) => taiwanDay(at) === today).length,
  },
]

/** 第幾天：拿來輪任務，同一天永遠挑到同一組 */
const dayNumber = (today: string) => Math.floor(Date.parse(`${today}T00:00:00Z`) / 864e5)

/**
 * 今天的三件事：看字固定，另外兩件照日期輪，每天不一樣但同一天不會變。
 * 字還太少的時候只給看字那一件——其他玩法都要先有看過的字。
 */
export function todayQuests(progress: Progress, today = taiwanDay()): Quest[] {
  const seen = Object.keys(progress.watched || {}).length
  const rest = POOL.slice(1)
  const n = dayNumber(today)
  // 相鄰的兩件：永遠是不同的兩件，每天往後挪一格
  const picked = seen >= 4 ? [POOL[0], rest[n % rest.length], rest[(n + 1) % rest.length]] : [POOL[0]]
  return picked.map((q) => ({
    id: q.id, icon: q.icon, label: q.label, short: q.short, need: q.need, go: q.go,
    done: Math.min(q.count(progress, today), q.need),
  }))
}

/** 三件都做完了沒 */
export const allDone = (quests: Quest[]) => quests.length > 0 && quests.every((q) => q.done >= q.need)
