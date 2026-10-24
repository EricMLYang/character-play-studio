import type { CharEntry, Progress } from '../types'
import { taiwanDay } from '../../shared/domain.mjs'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { familyOf } from '../../shared/radicals.mjs'
import { familiesIn, familyFor, foundIn } from './families'
import { wordsFor } from './puzzles'

/**
 * 今天的路：打開就是這五站，走完就結束（10～15 分鐘）。
 *
 * 以前是「今天的三件事」加一排遊戲入口，6 歲只會點最熟的那個：他的紀錄裡「看」很多、
 * 「寫」跟「自己認出來」很少，剛好跟研究說最有效的兩件事相反。所以首頁改成一條路，
 * 每一站就是一個字要學會的一步（docs/learning-redesign-plan.md）：
 *
 *   ① 想起來  複習到期的字（間隔提取）      → 餵大怪獸
 *   ② 新朋友  今天的新字：看 → 描 → 憑記憶寫 → 字卡
 *   ③ 牠的家  今天的字住哪一家               → 部首家族
 *   ④ 讀一讀  把今天的字放進詞裡             → 詞語拼圖（之後換成指讀小書）
 *   ⑤ 回家    搬進小鎮、開寶箱               → 小鎮
 *
 * 全部從已經在記的紀錄算出來（哪一筆是今天做的看台灣日期），沒有新的進度欄位：
 * 換裝置、重新整理都一樣。字太少（看過不到 4 個）的時候只有「新朋友」跟「回家」——其他玩法都要先有看過的字。
 */
export type StopGo =
  | { kind: 'game'; id: string; want?: string }
  | { kind: 'char'; char: string }
  | null

export type Stop = {
  id: 'recall' | 'new' | 'family' | 'read' | 'home'
  icon: string
  title: string
  /** 這一站要做什麼，一句話 */
  hint: string
  /** 站在這一站的角色（public/hero/<hero>/idle.png） */
  hero: string
  /** 按鈕上的字 */
  cta: string
  /** 唸出來的那句（他還不會讀字；shared/voice-lines.mjs 的 path*） */
  say: string
  /** 這一站的字（顯示用，也是 want） */
  chars: string[]
  /** 這一站的補充標籤（例如住哪一家） */
  label?: string
  done: number
  need: number
  go: StopGo
}

/** 一天幾個新字、複習幾個、拼幾個詞 */
export const NEW_PER_DAY = 2
export const RECALL_PER_DAY = 3
export const READ_PER_DAY = 2
/** 看過的字不到這個數就先不開遊戲那幾站 */
const ENOUGH = 4

/** 今天第一次看的字：看過、最後一次是今天、次數還很少（重看一次也算） */
const newToday = (w: Progress['watched'][string] | undefined, today: string) =>
  Boolean(w) && taiwanDay(w!.last) === today && w!.count <= 2

export function todayPath(library: CharEntry[], progress: Progress, today = taiwanDay()): Stop[] {
  const watched = progress.watched || {}
  const known = new Set(library.map((c) => c.char))
  const seen = Object.keys(watched).filter((c) => known.has(c)).length
  const enough = seen >= ENOUGH
  const families = familiesIn(library)
  const stops: Stop[] = []

  // ① 想起來：到期的字（餵大怪獸自己會挑；沒有到期的它也會出新的）
  const due = Object.entries(progress.recall || {}).filter(([c, r]) => known.has(c) && r.due <= today).map(([c]) => c)
  const recalledToday = Object.values(progress.recall || {}).filter((r) => taiwanDay(r.last) === today && r.due > today).length
  const recallNeed = enough ? RECALL_PER_DAY : 0
  if (recallNeed) {
    stops.push({ id: 'recall', icon: '🍽️', title: '想起來', hint: '前幾天的字，你還記得嗎？', hero: 'monster', cta: '去餵牠 →',
      say: FIXED_LINES.pathRecall, chars: due.slice(0, RECALL_PER_DAY), done: Math.min(recalledToday, recallNeed), need: recallNeed,
      go: { kind: 'game', id: 'feed' } })
  }

  // ② 新朋友：還沒看過的字，優先挑能讓某一家湊起來的（集中識字），再照字庫順序
  const candidates = library.filter((c) => !watched[c.char] || newToday(watched[c.char], today))
  const rank = (c: CharEntry) => {
    if (newToday(watched[c.char], today)) return 0
    const family = familyOf(c.char)
    const kin = family ? Object.keys(family.members).filter((m) => m !== c.char && watched[m]).length : 0
    return kin > 0 ? 1 : 2
  }
  const picks = [...candidates].sort((a, b) => rank(a) - rank(b) || a.priority - b.priority).slice(0, NEW_PER_DAY)
  const newNeed = Math.min(NEW_PER_DAY, candidates.length)
  const fresh = picks.filter((c) => newToday(watched[c.char], today)).length
  const nextNew = picks.find((c) => !newToday(watched[c.char], today))
  if (newNeed) {
    stops.push({ id: 'new', icon: '🌈', title: '新朋友', hint: '認識今天的新字：看一看、描一描、遮起來寫', hero: 'yang', cta: '去看字 →',
      say: FIXED_LINES.pathNew, chars: picks.map((c) => c.char), done: Math.min(fresh, newNeed), need: newNeed,
      go: nextNew ? { kind: 'char', char: nextNew.char } : null })
  }

  // ③ 牠的家：今天的字裡誰住的那一家開了門；都沒有就找一家還沒找齊的
  const todayChars = [...due.slice(0, RECALL_PER_DAY), ...picks.map((c) => c.char)]
  const fromToday = todayChars.find((c) => familyFor(c, families))
  const unfinished = families.find((f) => foundIn(f, progress) < f.list.length) ?? families[0]
  const want = fromToday ?? unfinished?.list[0]?.char
  const family = want ? familyFor(want, families) : undefined
  const foundToday = Object.values(progress.radicals || {}).reduce((n, f) => n + Object.values(f).filter((at) => taiwanDay(at) === today).length, 0)
  if (enough && family && want) {
    stops.push({ id: 'family', icon: '🏠', title: '牠的家', hint: `「${want}」住在哪一家？`, hero: 'dino', cta: '去看看 →',
      say: FIXED_LINES.pathFamily, chars: [want], label: `${family.emoji} ${family.name}的家`, done: Math.min(foundToday, 1), need: 1,
      go: { kind: 'game', id: 'roots', want } })
  }

  // ④ 讀一讀：把今天的字放進詞裡（詞語拼圖）
  const readNeed = enough ? READ_PER_DAY : 0
  const readToday = Object.values(progress.puzzles || {}).filter((q) => taiwanDay(q.last) === today).length
  const readWant = todayChars.map((c) => library.find((e) => e.char === c)).find((e) => e && wordsFor(e).length > 0)?.char
  if (readNeed) {
    stops.push({ id: 'read', icon: '📖', title: '讀一讀', hint: '今天的字，放進詞裡讀讀看', hero: 'raccoon', cta: '去拼詞 →',
      say: FIXED_LINES.pathRead, chars: readWant ? [readWant] : [], done: Math.min(readToday, readNeed), need: readNeed,
      go: { kind: 'game', id: 'puzzle', ...(readWant ? { want: readWant } : {}) } })
  }

  // ⑤ 回家：前面都做完了才算到家
  const rest = stops.every((s) => s.done >= s.need)
  stops.push({ id: 'home', icon: '🏡', title: '回家', hint: '回小鎮看看今天搬進來的字', hero: 'sheriff', cta: '去小鎮 →',
    say: FIXED_LINES.pathHome, chars: [], done: rest ? 1 : 0, need: 1, go: { kind: 'game', id: 'town' } })
  return stops
}

/** 現在走到哪一站（第一個沒做完的）；全部做完回 null */
export const currentStop = (stops: Stop[]) => stops.find((s) => s.done < s.need) ?? null

/** 整條路走完了沒 */
export const pathDone = (stops: Stop[]) => stops.length > 0 && stops.every((s) => s.done >= s.need)
