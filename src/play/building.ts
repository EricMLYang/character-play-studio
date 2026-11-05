import type { Progress } from '../types'
import type { Family } from './families'

/**
 * 蓋字工坊：部首家族的第三幕（變身故事 → 找家人 → 蓋字）。
 *
 * 「河」拆成兩塊積木：三點水、可。可 放在格子裡，旁邊空一格，下面三塊部首（三點水、提手旁、口字旁）——
 * 哪一塊放上去會變成「河」？河裡流著水，所以是三點水。放上去「喀」一聲合體，三點水開始滴水。
 *
 * 研究上「部件意識」與「集中識字」都有證據：看得出字是兩塊拼起來的、知道左邊那塊管意思，
 * 遇到不認得的字也猜得到一半。以前的魔法鍋（2026-10-24 拿掉）也是拼字，但它是「把字丟進鍋子」，
 * 抽象、沒有目標，他一次都沒進去過。這裡不一樣的地方：
 *   - 不是新入口，是找完家人之後接著玩；問題永遠是「哪一塊管意思」，答案就是剛剛那一家
 *   - 積木是那個字自己的筆畫切出來的（public/strokes 的 radStrokes），放上去位置剛好對上，
 *     不是兩個字型硬湊在一起
 *   - 干擾的積木也從別的字切出來、部首在同一邊，看起來都放得上去，要靠意思選
 *
 * 這個檔只放純函式（tests/workshop.test.mjs），畫面在 Workshop.tsx。
 */

export type StrokeData = { strokes: string[]; medians: number[][][]; radStrokes?: number[] }
/** 部首在字的哪一邊 */
export type Layout = 'left' | 'right' | 'top' | 'bottom'
export type Split = { rad: number[]; rest: number[]; layout: Layout }
/** [x0, y0, x1, y1]，筆順資料的座標（0–1024，y 往上） */
export type Box = [number, number, number, number]

/** 這幾筆的外框（用每一筆的中線算，夠準，不用解析 SVG 路徑） */
export function boxOf(data: StrokeData, strokes: number[]): Box {
  const box: Box = [Infinity, Infinity, -Infinity, -Infinity]
  for (const i of strokes) {
    for (const [x, y] of data.medians[i] ?? []) {
      box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y)
      box[2] = Math.max(box[2], x); box[3] = Math.max(box[3], y)
    }
  }
  return box
}

/**
 * 把一個字切成「部首」與「其餘」兩塊。切不乾淨的不出題：
 * - 沒有部首資料、或整個字就是部首
 * - 部首的筆數跟這一家的部首（例如 氵 三筆）對不上——那是字典的部首跟這一家講的不是同一個（愛 的心有四筆、忄 只有三筆）
 */
export function splitOf(data: StrokeData | null | undefined, formStrokes: number): Split | null {
  const rad = data?.radStrokes ?? []
  if (!data || !rad.length || rad.length !== formStrokes) return null
  const rest = data.strokes.map((_, i) => i).filter((i) => !rad.includes(i))
  if (!rest.length) return null
  const a = boxOf(data, rad)
  const b = boxOf(data, rest)
  const dx = (a[0] + a[2]) / 2 - (b[0] + b[2]) / 2
  const dy = (a[1] + a[3]) / 2 - (b[1] + b[3]) / 2
  // y 往上：部首中心比較高就是在上面
  const layout: Layout = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy > 0 ? 'top' : 'bottom')
  return { rad, rest, layout }
}

export type Decoy = { family: string; char: string }
export type Build = { char: string; family: string; split: Split; decoys: Decoy[] }

/** 一次蓋幾個字（找完五個家人之後，三個剛好，再多他坐不住） */
export const BUILD_ROUNDS = 3

/**
 * 出題：這一家切得乾淨的家人，他看過的先、還沒蓋過的先；每題配兩塊干擾的積木，
 * 從別家切出來、部首在同一邊（看起來都放得上去）、同一家只出一塊。
 *
 * splits：字 → 切法（Workshop 先把筆順檔抓下來算好），沒有的字就是切不開。
 */
export function pickBuilds(family: Family, families: Family[], progress: Progress, splits: Map<string, Split>,
  random = Math.random, max = BUILD_ROUNDS): Build[] {
  if (family.kind !== 'radical') return []
  const built = progress.radicals?.[family.id] || {}
  const seen = (c: string) => Boolean(progress.watched[c])
  const pool = family.list.map((c) => c.char).filter((c) => splits.has(c))
  const order = shuffle(pool, random).sort((a, b) => Number(seen(b)) - Number(seen(a)) || Number(Boolean(built[a])) - Number(Boolean(built[b])))
  const others = families.filter((f) => f.kind === 'radical' && f.id !== family.id)
  const builds: Build[] = []
  for (const char of order) {
    if (builds.length >= max) break
    const split = splits.get(char)!
    const decoys: Decoy[] = []
    for (const other of shuffle(others, random)) {
      if (decoys.length >= 2) break
      const match = other.list.find((c) => splits.get(c.char)?.layout === split.layout)
      if (match) decoys.push({ family: other.id, char: match.char })
    }
    if (decoys.length) builds.push({ char, family: family.id, split, decoys })
  }
  return builds
}

/** 這一家可不可以蓋字（找家人做完之後要不要給「🔨 蓋字」那顆按鈕） */
export const canBuild = (family: Family, families: Family[], progress: Progress, splits: Map<string, Split>) =>
  pickBuilds(family, families, progress, splits, () => 0.5, 1).length > 0

/**
 * 「其餘」那一塊本身是不是一個他在學的字（河 = 氵 + 可）。是的話合體那句話就講完整：
 * 「三點水，加上，可，變成，河！」；不是的話只講「變成，河！」。parts 是 data/parts.json 那一筆。
 */
export function restChar(parts: { char: string; strokes: number[] }[] | undefined, split: Split) {
  const same = (a: number[], b: number[]) => a.length === b.length && a.every((n, i) => n === b[i])
  return parts?.find((p) => same([...p.strokes].sort((x, y) => x - y), split.rest))?.char
}

function shuffle<T>(list: T[], random: () => number) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
