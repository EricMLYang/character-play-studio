import type { Resident } from '../types'
import { COMBOS, SPELLS, type Act } from '../../shared/spells.mjs'
import { residentLevel } from '../../shared/domain.mjs'

/**
 * 魔法世界（World.tsx）：他寫過的每一個會變身的字，都住在這裡——魚在池塘、鳥在天上、樹長在山上、好吃的在野餐墊上。
 * 從小鎮的紀錄（progress.town，描過就有）推出來，所以字卡上描的字也會出現在這裡；合體合出來的詞記在 progress.fused。
 * 憑記憶寫越多次越大（跟小鎮居民長大同一個等級 residentLevel）。寫得越多，世界越熱鬧——收集是他的動力。
 */
export type Zone = 'sky' | 'pond' | 'hill' | 'ground' | 'picnic'

/** 每一種動作住哪裡 */
export const ZONE_OF: Record<Act, Zone> = {
  swim: 'pond', splash: 'pond',
  fly: 'sky', float: 'sky', shine: 'sky', fall: 'sky',
  grow: 'hill',
  run: 'ground', hop: 'ground', stomp: 'ground', slither: 'ground', crawl: 'ground', drive: 'ground', bounce: 'ground', burn: 'ground',
  yum: 'picnic',
}

/** 每一區在世界裡的範圍（百分比：左、右、上、下） */
export const ZONES: Record<Zone, [number, number, number, number]> = {
  sky: [4, 96, 16, 40],
  hill: [5, 95, 42, 58],
  pond: [6, 42, 66, 88],
  ground: [42, 96, 50, 80],
  picnic: [50, 97, 84, 98],
}

export type Dweller = { char: string; emoji: string; act: Act; zone: Zone; x: number; y: number; size: number; level: number }

/** 同一個字每次都站在同一個地方（不然每次打開都換位置，他找不到「我的魚」） */
export function spot(char: string, salt = 0): number {
  let h = 2166136261 ^ salt
  for (const c of char) h = Math.imul(h ^ c.codePointAt(0)!, 16777619)
  return ((h >>> 0) % 1000) / 1000
}

/**
 * 世界裡住了誰。emojiOf：字 → 它的 emoji（字庫的）；沒有的不放。
 * 同一區的東西太擠就往旁邊挪一點（最多試 40 次）。
 */
export function dwellers(town: Record<string, Resident>, emojiOf: (char: string) => string | undefined, fused: Record<string, string> = {}): Dweller[] {
  const out: Dweller[] = []
  // 他寫過的字，加上合體合出來的詞（火山、熊貓…，比單字大一號）
  const who = [
    ...SPELLS.flatMap((s) => {
      const resident = town[s.char]
      const emoji = emojiOf(s.char)
      return resident?.traces && emoji ? [{ char: s.char, emoji, act: s.act, level: residentLevel(resident), big: 0 }] : []
    }),
    ...COMBOS.filter((c) => fused[c.word]).map((c) => ({ char: c.word, emoji: c.emoji, act: c.act, level: 2, big: 2.5 })),
  ]
  // 野餐墊上的吃的小一點（吃的字最多，一樣大放不下）
  const natural = (zone: Zone, level: number, big: number) => (7 + level * 1.6 + big) * (zone === 'picnic' ? 0.7 : 1)
  // 一區住太多就整區一起縮小：照原大小全部要佔的面積超過那一區放得下的，就等比例縮（最多縮到 55%）。
  // 寫到六十幾個字（兩個月的模擬），地上擠了二十幾個，原大小怎麼挪都疊在一起、字牌互相蓋住
  // 一個東西佔 size²：結算那張世界裡每個東西寬 size%（背景那張只有一半大），照比較擠的那張算
  const need: Partial<Record<Zone, number>> = {}
  for (const w of who) { const z = ZONE_OF[w.act]; need[z] = (need[z] || 0) + natural(z, w.level, w.big) ** 2 }
  const shrink = (zone: Zone) => {
    const [l, r, t, b] = ZONES[zone]
    const room = 0.45 * (r - l) * (b - t) * 1.6
    return Math.max(0.55, Math.min(1, Math.sqrt(room / (need[zone] || 1))))
  }
  for (const { char, emoji, act, level, big } of who) {
    const s = { char, act }
    const zone = ZONE_OF[act]
    const [l, r, t, b] = ZONES[zone]
    const size = natural(zone, level, big) * shrink(zone)
    let x = 0, y = 0
    for (let k = 0; k < 40; k++) {
      x = l + spot(s.char, k) * (r - l)
      y = t + spot(s.char, k + 100) * (b - t)
      // 跟旁邊的東西至少隔兩個人大小的一半（y 乘 1.6：世界是 16:10，橫的距離跟直的一樣長）
      if (!out.some((d) => Math.hypot(d.x - x, (d.y - y) * 1.6) < (d.size + size) * 0.42)) break
    }
    out.push({ char, emoji, act, zone, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, size: Math.round(size * 10) / 10, level })
  }
  // 後面（上面）的先畫，前面（下面）的蓋在上面
  return out.sort((a, b) => a.y - b.y)
}

/**
 * 他最近變出來的幾個東西（最近寫的、會變身的字）：首頁今天的路兩旁站著陪他，點了進魔法筆（Home 的 PathBoard）。
 * 每次打開樂園都看得到自己寫出來的魚、球——寫字的成果不只在魔法筆裡。
 */
export function recentMade(town: Record<string, Resident>, emojiOf: (char: string) => string | undefined, n = 2, fused: Record<string, string> = {}): { char: string; emoji: string }[] {
  // 合體合出來的詞也算（剛合出火山，站在路旁的就是火山，比火、山更威）；char 是那個詞，點了排一輪火山
  const made = [
    ...SPELLS.filter((s) => town[s.char]?.traces && emojiOf(s.char)).map((s) => ({ char: s.char, emoji: emojiOf(s.char)!, at: Date.parse(town[s.char].last) })),
    ...COMBOS.filter((c) => fused[c.word]).map((c) => ({ char: c.word, emoji: c.emoji, at: Date.parse(fused[c.word]) })),
  ]
  return made.sort((a, b) => b.at - a.at).slice(0, n).map(({ char, emoji }) => ({ char, emoji }))
}
