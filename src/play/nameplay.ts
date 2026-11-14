import type { CharEntry, Progress } from '../types'
import { ALIKE } from './alike'
import { NAMES, isHan, nameChars, spellChars, type Name } from '../../shared/names.mjs'

/**
 * 主角館（Names.tsx）的規則：牆上有哪幾張、怎麼排、字塊怎麼出。純函式，好測。
 * 名字的資料在 shared/names.mjs，每個名字演什麼在 src/names/scenes/<id>.ts。
 * 檔名不叫 names.ts：跟 Names.tsx 只差大小寫，macOS 上 TypeScript 會當成同一個檔（games.tsx 的說明）。
 */
export type Card = {
  name: Name
  /** 拼過幾次（0 就是還沒拼過：牆上是問號剪影） */
  count: number
  /** 名字裡他看過的字佔幾成（0～1）：高的排前面 */
  seen: number
  /** 名字裡還沒看過的字：卡片上小小標「有新字」 */
  fresh: string[]
}

/**
 * 牆：只放「每個國字都在孩子端字庫裡」的名字（家長把某個字收起來，那張就先不出現）；不鎖。
 * 名字裡看過的字比例高的排前面（他比較讀得出來），一樣高就照 NAMES 的順序。
 */
export function wallOf(library: CharEntry[], progress: Progress, has: (id: string) => boolean = () => true): Card[] {
  const known = new Set(library.map((c) => c.char))
  const watched = progress.watched || {}
  return NAMES.filter((name) => has(name.id) && nameChars(name).every((c) => known.has(c)))
    .map((name, order) => {
      const chars = nameChars(name)
      const fresh = chars.filter((c) => !watched[c]?.count)
      return { card: { name, count: progress.names?.[name.id]?.count ?? 0, seen: (chars.length - fresh.length) / chars.length, fresh }, order }
    })
    .sort((a, b) => b.card.seen - a.card.seen || a.order - b.order)
    .map((x) => x.card)
}

/** 一格：國字是要他拼的空格；不是國字的（Ａ）given，一開始就填好 */
export type Slot = { char: string; given: boolean }
export const slotsOf = (name: Name): Slot[] => [...name.text].map((char) => ({ char, given: !isHan(char) }))

/** 一塊字：key 讓同樣的字（屁屁）是兩塊不同的；decoy 是干擾字 */
export type Tile = { key: string; char: string; decoy: boolean }

/** 這兩個字長得像嗎（src/play/alike.ts：key 是兩個字照字碼排序接起來） */
const alike = (a: string, b: string) => ALIKE.has(a < b ? a + b : b + a)

/**
 * 字塊：名字裡的字打散（重複的字有兩塊），再加 decoys 個干擾字。
 * 干擾字優先挑跟名字裡某個字長得像的（要他真的看字，不是看形狀猜），不夠才從字庫隨機挑；
 * 一定不是名字裡的字（不然點了算對算錯都說不通）。rand 給測試固定用。
 */
export function tilesFor(name: Name, library: CharEntry[], decoys = 2, rand: () => number = Math.random): Tile[] {
  const own = new Set(nameChars(name))
  const pool = [...new Set(library.map((c) => c.char))].filter((c) => isHan(c) && !own.has(c))
  const shuffle = <T,>(list: T[]) => {
    const a = [...list]
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
    return a
  }
  const look = shuffle(pool.filter((c) => [...own].some((o) => alike(o, c))))
  const rest = shuffle(pool.filter((c) => !look.includes(c)))
  const extra = [...look, ...rest].slice(0, decoys)
  const tiles: Tile[] = [
    ...spellChars(name).map((char, i) => ({ key: `n${i}`, char, decoy: false })),
    ...extra.map((char, i) => ({ key: `d${i}`, char, decoy: true })),
  ]
  // 打散；剛好排成名字原本的順序就再洗一次（不然他不用讀，照著點就好）
  for (let k = 0; k < 6; k++) {
    const mixed = shuffle(tiles)
    if (mixed.filter((t) => !t.decoy).map((t) => t.char).join('') !== spellChars(name).join('') || tiles.length < 2) return mixed
  }
  return [...tiles].reverse()
}

/** 下一個要填的空格（-1 是都填好了） */
export const nextSlot = (slots: Slot[], filled: boolean[]) => slots.findIndex((s, i) => !s.given && !filled[i])

/** 點了這塊字對不對：要是下一個空格的那個字（同樣的字哪一塊都可以） */
export const fits = (slots: Slot[], filled: boolean[], tile: Tile) => {
  const i = nextSlot(slots, filled)
  return i >= 0 && slots[i].char === tile.char
}
