import type { CharEntry, Progress, Resident } from '../types'
import { COMBOS, SPELLS, type Combo, type Spell } from '../../shared/spells.mjs'

/**
 * 魔法筆（Spell.tsx）的兩個決定：今天許哪幾個願望、每個字要他怎麼寫。
 *
 * 怎麼寫＝鷹架（研究：寫比描好、遮起來寫比照著抄好，所以一步一步把扶手拿掉）：
 *   trace  第一次寫這個字：先示範一筆一筆寫給他看，再照著外框描
 *   look   描過一次：不示範，外框在他寫對第一筆後慢慢淡掉，後面憑剛剛那一眼寫（寫錯兩次那一筆會閃）
 *   blind  描過兩次或憑記憶寫過：「看一眼，記住喔！」字整個給他看兩秒，然後變不見，他自己寫出來
 * 這就是 Look-Cover-Write：看一眼、遮起來、寫，每一次都是一次提取練習。
 */
export type WriteLevel = 'trace' | 'look' | 'blind'

export function writeLevel(resident?: Resident): WriteLevel {
  if (!resident || !resident.traces) return 'trace'
  // 描過兩次、或憑記憶寫過一次，就該把扶手拿掉了（不然在魔法筆裡永遠只是「看一眼」）
  return (resident.blind || 0) > 0 || resident.traces >= 2 ? 'blind' : 'look'
}

export type Wish = Spell & { emoji: string; level: WriteLevel }

/** 每種寫法舒服的筆畫數：超過一筆扣一點分（不是不准，看過又該複習的字還是會被挑到） */
const COMFORT: Record<WriteLevel, number> = { trace: 8, look: 11, blind: 14 }

/** 一輪許幾個願望：三個剛好（每個字要寫一陣子，六歲一次大約撐三個） */
export const WISHES_PER_ROUND = 3

/**
 * 挑願望。先挑他看過的字（沒看過的字還不認得，寫出來也只是描線條）；
 * 看過的字裡：該複習的（記住程度到期了）最優先，再來是還沒寫過的、只描過沒遮起來寫過的。
 * 筆畫多的往後排（第一次寫的字尤其是）。一輪裡動作不重複（不要三個都在游泳）。want＝他為了這個字來的，有的話排第一個。
 */
type PickOptions = {
  n?: number; want?: string; today: string; rand?: () => number
  /** 今天的路上的字（今天的新字、該複習的）：今天學的就今天寫 */
  focus?: string[]
}

export function pickWishes(library: CharEntry[], progress: Progress, options: PickOptions): Wish[] {
  const n = options.n ?? WISHES_PER_ROUND
  const scored = scoreSpells(library, progress, options)
  const picked: typeof scored = []
  for (const w of scored) if (picked.length < n && !picked.some((p) => p.act === w.act)) picked.push(w)
  for (const w of scored) if (picked.length < n && !picked.includes(w)) picked.push(w)
  return picked.map(strip)
}

const strip = ({ score: _score, ...w }: Wish & { score: number }): Wish => w

/** 一輪：三個願望；後兩個湊得成合體魔法（月＋餅 → 月餅）的話，combo 就是那個詞 */
export type Round = { wishes: Wish[]; combo?: Combo }

/** 合體的兩個字都要排在前面這麼多名以內（不能為了合體硬塞他沒看過、筆畫又多的字） */
const COMBO_RANK = 10

/**
 * 挑一輪。先看有沒有合體湊得成：兩個字都在前 10 名裡（看過、不太難），挑兩個字分數加起來最高的那組，
 * 排在第二、三個願望，第一個是另外一個字（動作不跟它們重複）。湊不成就是普通的三個願望。
 */
export function pickRound(library: CharEntry[], progress: Progress, options: PickOptions): Round {
  const scored = scoreSpells(library, progress, options)
  const top = scored.slice(0, COMBO_RANK)
  const rank = (c: string) => top.find((w) => w.char === c)
  const combos = COMBOS.flatMap((combo) => {
    const [a, b] = [...combo.word]
    const wa = rank(a), wb = rank(b)
    if (!wa || !wb || a === options.want || b === options.want) return []
    return [{ combo, wa, wb, score: wa.score + wb.score }]
  }).sort((x, y) => y.score - x.score)
  const best = combos[0]
  if (!best) return { wishes: pickWishes(library, progress, options) }
  const first = scored.find((w) => w !== best.wa && w !== best.wb && w.act !== best.wa.act && w.act !== best.wb.act)
    ?? scored.find((w) => w !== best.wa && w !== best.wb)
  return { wishes: [...(first ? [first] : []), best.wa, best.wb].map(strip), combo: best.combo }
}

function scoreSpells(library: CharEntry[], progress: Progress, { want, focus = [], today, rand = Math.random }: PickOptions) {
  const byChar = new Map(library.map((e) => [e.char, e]))
  return SPELLS.flatMap((s) => {
    const entry = byChar.get(s.char)
    if (!entry?.emoji) return []
    const seen = (progress.watched?.[s.char]?.count || 0) > 0
    const due = progress.recall?.[s.char]?.due
    const resident = progress.town?.[s.char]
    let score = rand() * 1.2
    if (seen) score += 4
    if (due && due <= today) score += 2
    if (focus.includes(s.char)) score += 2.5
    if (!resident) score += 1.5
    else if (!resident.blind) score += 1
    // 筆畫太多會寫到放棄：第一次寫的字 8 筆以內最好，越熟可以越多（六歲一次寫 15 筆是很大的工程）
    const level = writeLevel(resident)
    score -= Math.max(0, s.n - COMFORT[level]) * 0.45
    if (s.char === want) score += 100
    return [{ ...s, emoji: entry.emoji, level, score }]
  }).sort((a, b) => b.score - a.score)
}
