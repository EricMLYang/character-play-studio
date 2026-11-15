import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 八（v2）：一隻熱情的章魚有八隻腳（開場一隻一隻長出來，數到八）。小恐龍每次伸手要跟牠握手——
// 章魚開心得「咻」地伸腳過來握，一次比一次多隻：一隻腳握住他的手上下猛搖 → 四隻腳把他抱緊搖到轉一圈、頭暈坐倒 →
// 冒汗、慢慢伸手，八隻腳全部舉起來——一起撲上來把他整個抱住、甩飛出去趴扁。第一次甩出一撇、第二次甩出一捺，第三次整個字亮起來。
// 語詞「八個」：八隻腳一隻一隻舉高高。回馬槍：小恐龍這次先蹲穩、閉眼得意地伸手，八隻腳一抓，他用力一拉——
// 這下換章魚整隻被拉飛過來，「啪」地蓋在他頭上，八隻腳抱住他的臉，變成一頂章魚帽子。
// 八、八、八個、這是什麼字？、八
const RS = 40
const RY = 77 - 0.42 * RS // 小恐龍站在地上的 y
/** 小恐龍站的地方（章魚左邊，每次都在這裡伸手） */
const RX = 40
/** 章魚頭（自製道具 octo-head，沒有腳、底部平的；八隻腳由程式畫）：在國字放大到中央的範圍右邊 */
const OX = 122
const OS = 36
/** 頭的平底在 y + BOT（道具圖內容的底在畫布 0.961） */
const BOT = 0.461 * OS
const OY = 57 - BOT
/** 章魚腳的顏色 */
const LEG = '#EE4F5A'
const LW = 2.1

type V = { x: number; y: number }
/** 二次貝茲曲線切成 n 段 */
function bez(p0: V, c: V, p1: V, n = 5): V[] {
  return Array.from({ length: n + 1 }, (_, j) => {
    const s = j / n
    return { x: (1 - s) ** 2 * p0.x + 2 * (1 - s) * s * c.x + s * s * p1.x, y: (1 - s) ** 2 * p0.y + 2 * (1 - s) * s * c.y + s * s * p1.y }
  })
}
/** 把折線畫成一段一段的線（錨在看不見的 rb 上，dx／dy 就是舞台座標） */
function strip(at: number, end: number, pts: V[]): Fx[] {
  const out: Fx[] = []
  for (let j = 0; j < pts.length - 1; j++) out.push({ at, dur: end - at, kind: 'line', actor: 'rb', dx: pts[j].x, dy: pts[j].y, to: pts[j + 1], color: LEG, width: LW })
  return out
}
/** 第 i 隻腳（左到右 0～7）長在章魚頭底下的哪裡 */
const root = (i: number, cx = OX, cy = OY): V => ({ x: cx - 11 + i * (22 / 7), y: cy + BOT - 1 })
/** 平常：八隻腳攤在地上，尾巴捲起來（左邊四隻往左、右邊四隻往右） */
const REST_X = [99, 106.5, 114, 121.5, 135, 141.5, 148, 154.5].map((x) => x + OX - 130)
function rest(i: number, at: number, end: number): Fx[] {
  const r = root(i), dir = i < 4 ? -1 : 1, tip = { x: REST_X[i], y: 72.6 }
  const pts = bez(r, { x: r.x + (tip.x - r.x) * 0.25, y: 73 }, tip, 3)
  pts.push({ x: tip.x + dir * 2.4, y: 69.8 })
  return strip(at, end, pts)
}
/** 舉高高：八隻腳往上張開成一把扇子 */
function raised(i: number, at: number, end: number): Fx[] {
  const r = root(i), a = ((150 - i * (115 / 7)) * Math.PI) / 180, L = 19
  const tip = { x: r.x + Math.cos(a) * L, y: r.y - Math.sin(a) * L }
  const c = { x: r.x + Math.cos(a) * L * 0.5 + Math.sin(a) * 3, y: r.y - Math.sin(a) * L * 0.5 + Math.cos(a) * 3 }
  const pts = bez(r, c, tip, 3)
  pts.push({ x: tip.x + (i < 4 ? -2 : 2), y: tip.y + 1.8 })
  return strip(at, end, pts)
}
/** 伸過去抓住 p：長長的一條，中間往下垂一點（sag） */
function grab(i: number, at: number, end: number, p: V, sag = 7): Fx[] {
  const r = root(i)
  return strip(at, end, bez(r, { x: (r.x + p.x) / 2, y: (r.y + p.y) / 2 + sag }, p, 3))
}
/** 回馬槍：章魚蓋在小恐龍頭上，八隻腳從頭頂垂下來抱住他的臉和身體 */
const HAT = { x: RX, y: 46 - BOT }
const HAT_TIP = [{ x: -16, y: 52 }, { x: -17, y: 59 }, { x: -15, y: 66 }, { x: -11, y: 72 }, { x: 11, y: 72 }, { x: 15, y: 66 }, { x: 17, y: 59 }, { x: 16, y: 52 }].map((p) => ({ x: RX + p.x, y: p.y }))
function hat(i: number, at: number, end: number): Fx[] {
  const r = root(i, HAT.x, HAT.y), tip = HAT_TIP[i]
  return strip(at, end, bez(r, { x: tip.x + (i < 4 ? -2 : 2), y: r.y + 1 }, tip, 3))
}

/** 小恐龍身上被抓的地方：手、頭、背、腳⋯⋯（他面向右，手在右邊） */
const HAND = { x: RX + 13, y: 57 }
const WRAP: V[] = [{ x: 11, y: 47 }, { x: 13, y: 57 }, { x: 10, y: 65 }, { x: 8, y: 72 }, { x: 4, y: 42 }, { x: -5, y: 45 }, { x: -8, y: 56 }, { x: -7, y: 67 }].map((p) => ({ x: RX + p.x, y: p.y }))
/** 第 2 次：左邊四隻抓的地方 */
const WRAP4: V[] = [{ x: 10, y: 46 }, { x: 13, y: 57 }, { x: -7, y: 58 }, { x: 8, y: 71 }].map((p) => ({ x: RX + p.x, y: p.y }))

/**
 * 握手：小恐龍伸手——章魚開心得跳一下、冒愛心，「咻」地伸腳過來握住他，一次比一次多隻。h 是腳抓到他那一刻。
 * k 0：一隻腳握手上下猛搖；k 1：四隻腳抱緊搖，放開時他轉一圈頭暈坐倒；k 2：八隻腳一起抱住、甩飛出去趴扁。
 * k 3（回馬槍）：八隻腳一樣抓上來，後面由外面接（他用力一拉，章魚被拉飛過來）。
 * 腳畫在 legs 裡（看 hold／legsOf），這裡只管小恐龍、章魚頭、效果、聲音、鏡頭。
 */
function shake(h: number, k: number) {
  const moves: Move[] = [
    { at: h - 0.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
    // 章魚開心得跳一下、嘟嘴要抱抱
    { at: h - 0.4, actor: 'oct', do: 'swap', emoji: 'prop:octo-kiss' },
    { at: h - 0.4, actor: 'oct', do: 'hop', amount: 2 + k, dur: 0.3 },
    { at: h, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
  ]
  const fx: Fx[] = [
        { at: h, kind: 'burst', x: HAND.x - 2, y: 54, n: 1, dur: 0.4, scale: 1.1 + 0.3 * Math.min(k, 2) },
  ]
  const cues: Cue[] = [{ at: h - 0.15, sfx: 'whoosh' }, { at: h, sfx: 'plop' }]
  const camera: Camera[] = [
    { at: h, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * Math.min(k, 2), to: { x: 62, y: 56 } },
    { at: h, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * Math.min(k, 2) },
  ]
  // 放開的那一刻換回開心的臉（第 4 次由外面接）
  const let_go = [h + 0.6, h + 0.65, h + 0.7][k]
  if (let_go) moves.push({ at: let_go, actor: 'oct', do: 'swap', emoji: 'prop:octo-head' })
  if (k === 0) {
    // 握住手上下猛搖
    moves.push(
      { at: h + 0.05, actor: 'rex', do: 'hop', amount: 3, dur: 0.2 },
      { at: h + 0.25, actor: 'rex', do: 'hop', amount: 3, dur: 0.2 },
      { at: h + 0.6, actor: 'rex', do: 'hop', amount: 4, dur: 0.3 },
    )
    fx.push({ at: h + 0.62, kind: 'pop', actor: 'rex', emoji: '❗', dx: 6, dur: 0.5, scale: 1.3 })
    cues.push({ at: h + 0.25, sfx: 'boing' })
  } else if (k === 1) {
    // 四隻腳抱緊搖——放開時轉一圈、頭暈坐倒
    moves.push(
      { at: h + 0.05, actor: 'rex', do: 'squash', amount: 0.15, dur: 0.5 },
      { at: h + 0.05, actor: 'rex', do: 'shake', amount: 2.5, dur: 0.55 },
      { at: h + 0.65, actor: 'rex', do: 'hop', amount: 6, dur: 0.4 },
      { at: h + 0.65, actor: 'rex', do: 'spin', pivot: 'center', times: 1, dur: 0.4 },
      { at: h + 1.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/dizzy' },
    )
    fx.push({ at: h + 1.05, kind: 'dizzy', actor: 'rex', dur: 0.6 })
    cues.push({ at: h + 0.3, sfx: 'boing' }, { at: h + 1.05, sfx: 'bonk' })
  } else if (k === 2) {
    // 八隻腳一起抱住猛搖，甩飛出去趴扁
    moves.push(
      { at: h + 0.05, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.6 },
      { at: h + 0.05, actor: 'rex', do: 'shake', amount: 3.5, dur: 0.6 },
      { at: h + 0.7, actor: 'rex', do: 'moveTo', to: { x: 24, y: RY }, arc: 16, dur: 0.45, ease: 'out' },
      { at: h + 0.7, actor: 'rex', do: 'spin', pivot: 'center', times: -1, dur: 0.4 },
      { at: h + 1.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/flat' },
    )
    fx.push(
      { at: h + 0.15, kind: 'burst', x: RX, y: 50, emoji: '💕', n: 8, dur: 0.55, scale: 1.5 },
    )
    cues.push({ at: h + 0.3, sfx: 'boing' }, { at: h + 0.7, sfx: 'whoosh' }, { at: h + 1.15, sfx: 'bonk' })
  }
  return { moves, fx, cues, camera }
}

const H1 = 2.2
const H2 = 3.8
const PAUSE = 4.95
const H3 = 6.0
const FULL = H3 + 0.95
const PARK = FULL + 0.85
const WORD = PARK + 0.15
/** 回馬槍：蹲穩、伸手，八隻腳一抓——他用力一拉，章魚被拉飛過來蓋在他頭上 */
const H4 = 9.35
const TUG = H4 + 0.25
const LAND = TUG + 0.3
const OFF = LAND + 0.6
const ASK = 11.0
const ANSWER = 13.6

const s1 = shake(H1, 0)
const s2 = shake(H2, 1)
const s3 = shake(H3, 2)
const s4 = shake(H4, 3)

/** 每隻腳整支的樣子（接下一段的地方重疊 0.1 秒，不會閃） */
function legsOf(i: number): Fx[] {
  const G = 0.12 // 伸出去要 0.12 秒：比 h 早一點出發，h 那一刻剛好抓到
  const left4 = i < 4
  const out: Fx[] = []
  // 開場一隻一隻長出來
  const born = 0.7 + 0.1 * i
  if (i === 0) {
    out.push(...rest(i, born, H1 - G + 0.1), ...grab(i, H1 - G, H1 + 0.6, HAND, 6), ...rest(i, H1 + 0.6, H2 - G + 0.1))
  } else out.push(...rest(i, born, left4 ? H2 - G + 0.1 : PAUSE + 0.3 + 0.1))
  if (left4) out.push(...grab(i, H2 - G, H2 + 0.65, WRAP4[i]), ...rest(i, H2 + 0.65, PAUSE + 0.3 + 0.1))
  // 第 3 次前停一拍：八隻腳一起舉起來（準備抱）
  out.push(...raised(i, PAUSE + 0.3, H3 - G + 0.1))
  out.push(...grab(i, H3 - G, H3 + 0.7, WRAP[i], 6 + (i % 3) * 3))
  out.push(...rest(i, H3 + 0.7, WORD + 0.1 * i + 0.1))
  // 八個：一隻一隻舉高高
  out.push(...raised(i, WORD + 0.1 * i, 8.75 + 0.1))
  out.push(...rest(i, 8.75, H4 - G + 0.1))
  // 回馬槍
  out.push(...grab(i, H4 - G, TUG + 0.05, WRAP[i], 6 + (i % 3) * 3))
  out.push(...hat(i, LAND, OFF))
  return out
}

const clip: Clip = {
  format: 2,
  char: '八',
  meta: { theme: '八隻腳的章魚', cast: '小恐龍＋一隻八隻腳的熱情章魚', gags: ['小恐龍每次伸手要跟熱情的章魚握手，章魚就咻地伸腳過來握，一次比一次多隻（一隻腳握手猛搖→四隻腳抱緊搖到轉一圈坐倒→八隻腳一起抱住、甩飛趴扁）；回馬槍是他蹲穩了得意地伸手、八隻腳一抓他用力一拉，換章魚整隻被拉飛過來蓋在他頭上，八隻腳抱住他的臉變成章魚帽子'] },
  duration: 15,
  bg: { top: '#BFE6FF', bottom: '#EAF7FF', floor: '#F3DDA6', scenery: 'hills' },
  actors: [
    // 看不見的錨：章魚腳的線都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    { id: 'rex', emoji: 'hero:rex/walk', x: RX, y: RY, size: RS, flip: true, hidden: true },
    { id: 'oct', emoji: 'prop:octo-head', x: OX, y: OY, size: OS, hidden: true },
  ],
  moves: [
    // 開場：章魚冒出來，小恐龍走進來，指著字框「八！」
    { at: 0.3, actor: 'oct', do: 'pop', dur: 0.3 },
    { at: 0, actor: 'rex', do: 'enter', from: { x: -25, y: RY }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: 1.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    // 第 1 次
    ...s1.moves,
    { at: H1 + 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 第 2 次
    ...s2.moves,
    // 第 3 次前停一拍：爬起來、托下巴、冒汗——章魚八隻腳全舉起來
    { at: PAUSE, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
    { at: PAUSE + 0.3, actor: 'oct', do: 'hop', amount: 2, dur: 0.3 },
    ...s3.moves,
    // 國字放大：章魚縮成一團
    // 讓位：他爬起來走回原位，指著章魚——八個！
    { at: PARK + 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
    { at: PARK + 0.2, actor: 'rex', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.35 },
    { at: PARK + 0.55, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: WORD + 0.8, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: WORD + 0.8, actor: 'rex', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：閉眼得意、蹲穩
    { at: 8.7, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: 8.7, actor: 'rex', do: 'squash', amount: 0.15, dur: 0.4 },
    ...s4.moves,
    // 用力一拉——章魚整隻被拉飛過來，蓋在他頭上
    { at: TUG, actor: 'rex', do: 'swap', emoji: 'hero:rex/pull' },
    { at: TUG, actor: 'oct', do: 'swap', emoji: 'prop:octo-dizzy' },
    { at: TUG + 0.02, actor: 'oct', do: 'moveTo', to: HAT, arc: 14, dur: 0.28, ease: 'in' },
    { at: TUG + 0.02, actor: 'oct', do: 'spin', pivot: 'center', times: -1, dur: 0.28 },
    { at: LAND, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: LAND, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: LAND + 0.15, actor: 'rex', do: 'shake', amount: 2, dur: 0.4 },
    { at: LAND + 0.15, actor: 'oct', do: 'shake', amount: 2, dur: 0.4 },
    // 章魚跳下來、開心地往左邊跑掉（不從國字底下經過）
    { at: OFF, actor: 'oct', do: 'moveTo', to: { x: -35, y: OY }, arc: 12, dur: 0.3, ease: 'in' },
    { at: OFF + 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/dizzy' },
    // 問他：他在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'rex', do: 'moveTo', to: { x: 30, y: RY + 2 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'rex', do: 'scaleTo', amount: 1.1, dur: 0.3 },
    { at: ASK + 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: 12.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: 12.2, actor: 'rex', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, actor: 'rex', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：往左跑出去
    { at: ANSWER + 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: ANSWER + 0.1, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'rex', do: 'moveTo', to: { x: -35, y: RY + 2 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次甩出一撇（握手的那隻腳）、第 2 次甩出一捺（章魚右邊）
    { at: H1 + 0.6, dur: 0.6, strokes: [0], from: HAND, color: partColor('八') },
    { at: H2 + 0.65, dur: 0.6, strokes: [1], from: { x: 140, y: 60 }, color: partColor('八') },
  ],
  glyph: [
    // 第 3 次：八隻腳一抱，整個字亮起來
    { at: H3 + 0.2, dur: 0.5, do: 'pulse' },
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['rex'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap(legsOf),
    ...s1.fx,
    ...s2.fx,
    // 第 3 次前停一拍
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'rex', dur: 0.7 },
    ...s3.fx,
    // 八個
    { at: WORD + 0.75, kind: 'burst', x: OX, y: 36, emoji: '✨', n: 8, dur: 0.45, scale: 1.3 },
    // 回馬槍
    ...s4.fx,
    { at: LAND, kind: 'burst', x: RX, y: 44, n: 1, dur: 0.4, scale: 2 },
    { at: LAND + 0.05, kind: 'burst', x: RX, y: 48, emoji: '💕', n: 8, dur: 0.55, scale: 1.6 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 章魚的八隻腳一直留在畫面裡：國字拼好前不讓自動取景推近到只剩小恐龍
    { at: 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 88, y: 45 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    // 八個：往右挪一點，八隻舉高的腳整個留在畫面裡
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.03, to: { x: 100, y: 45 } },
    ...s4.camera,
    { at: LAND, dur: 0.45, do: 'punch', amount: 0.25, to: { x: RX + 8, y: 52 } },
    { at: LAND, dur: 0.3, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: FULL, dur: 0.05, level: -0.25 },
    { at: FULL + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '八' },
    // 八隻腳一隻一隻長出來
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Cue => ({ at: 0.7 + 0.1 * i, sfx: 'blip' })),
    ...s1.cues,
    ...s2.cues,
    { at: PAUSE + 0.3, sfx: 'gulp' },
    ...s3.cues,
    { at: FULL + 0.05, say: '八' },
    { at: WORD, say: '八個' },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Cue => ({ at: WORD + 0.1 * i, sfx: 'blip' })),
    ...s4.cues,
    { at: TUG, sfx: 'whoosh' },
    { at: LAND, sfx: 'boing' },
    { at: OFF, sfx: 'poof' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '八' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
