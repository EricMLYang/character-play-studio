import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 七（v2）：熱心的浣熊花生排好一道七種顏色的彩虹（一條一條亮過去，數到七）。每次排好他就得意地轉身——
// 毛茸茸的大尾巴「唰」地一甩，正好掃到彩虹，一次比一次慘：七條顏色撞歪、排錯順序 → 整道彩虹垮下來、七條平平地堆在地上（他嚇得跌坐）→
// 冒汗回頭看看自己的尾巴、小心轉身，還是「唰」——整道彩虹被甩飛，最上面那條紅的變成一橫、彎彎的那一道變成豎彎鉤，飛進字框；他自己也被甩得轉一圈趴扁。
// 語詞「七彩」：他再排一次，七條一條一條亮過去。回馬槍：他踮腳走得遠遠的才轉身——尾巴碰不到，彩虹好好的！他高興得原地轉一圈，
// 這一轉，七條顏色「咻」地全被捲過來，一圈一圈纏在他身上，變成一隻七彩浣熊。
// 七、七、七彩、這是什麼字？、七
const RS = 40
const RY = 77 - 0.42 * RS // 花生站在地上的 y
/** 花生站的地方（彩虹左邊） */
const RX = 36
/** 彩虹：圓心在地板上、偏右（國字放大到正中央前就已經被甩飛） */
const RC = { x: 100, y: 74 }
/** 七條色帶的半徑（外圈紅 → 內圈紫）與粗細 */
const radius = (i: number) => 36 - 3.1 * i
const BW = 2.8
const COLORS = ['#E53935', '#FB8C00', '#F9C80E', '#43A047', '#1E88E5', '#3F51B5', '#8E24AA']
/** 尾巴的顏色（灰色毛） */
const TAIL = '#55525E'
/** 尾巴掃到彩虹的那一點（左腳） */
const HIT = { x: 66, y: 62 }

type V = { x: number; y: number }
const SEG = 9
/** 一條色帶的折線：半圓（rot 度轉一下、sy 壓扁） */
function arcPts(r: number, cx = RC.x, cy = RC.y, rot = 0, sy = 1): V[] {
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180)
  return Array.from({ length: SEG + 1 }, (_, j) => {
    const a = Math.PI * (1 - j / SEG)
    const x = Math.cos(a) * r, y = -Math.sin(a) * r * sy
    return { x: cx + x * c - y * s, y: cy + x * s + y * c }
  })
}
/** 把折線畫成一段一段的線（錨在看不見的 rb 上，dx／dy 就是舞台座標） */
function strip(at: number, dur: number, pts: V[], color: string, width = BW): Fx[] {
  const out: Fx[] = []
  for (let j = 0; j < pts.length - 1; j++) out.push({ at, dur, kind: 'line', actor: 'rb', dx: pts[j].x, dy: pts[j].y, to: pts[j + 1], color, width })
  return out
}
/** 整整齊齊的彩虹：七條從外圈（紅）開始一條一條亮過去，第 i 條在 at + gap × i 出現、end(i) 收掉 */
function rainbow(at: number, gap: number, end: (i: number) => number): Fx[] {
  return COLORS.flatMap((c, i) => strip(at + gap * i, end(i) - (at + gap * i), arcPts(radius(i)), c))
}
/** 撞歪了：每條往不同邊歪、顏色順序也亂了（還是七條） */
const SHUF = [3, 0, 5, 2, 6, 1, 4]
const OFF = [6, -5, 8, -7, 4, -8, 5]
const ROT = [-7, 6, -4, 9, -10, 5, -6]
function messy(at: number, end: (i: number) => number): Fx[] {
  return COLORS.flatMap((_, i) => strip(at, end(i) - at, arcPts(radius(i), RC.x + OFF[i], RC.y + 1, ROT[i]), COLORS[SHUF[i]]))
}
/** 垮下來：七條平平地疊在地上（還是七條） */
function pile(at: number, end: (i: number) => number): Fx[] {
  return COLORS.flatMap((c, i) => strip(at, end(i) - at,
    [{ x: 64 + 2.5 * i + (i % 2) * 3, y: 72.3 - 2.9 * i }, { x: 136 - 3.5 * i - (i % 2) * 2, y: 72.3 - 2.9 * i + (i % 2 ? 0.8 : -0.8) }], c))
}

/** 一條一條亮過去的「嗶」 */
const blips = (at: number, gap: number): Cue[] => COLORS.map((_, i) => ({ at: at + gap * i, sfx: 'blip' }))

/**
 * 「唰」：排好彩虹、得意地轉身（背對彩虹）——毛茸茸的大尾巴一甩，正好掃到彩虹。h 是尾巴掃到那一刻。
 * 前三次（k 0～2）一次比一次慘：轉回來傻眼跳一下 → 嚇得跌坐 → 自己也被甩得轉一圈趴扁。
 * 彩虹被掃成什麼樣子由外面的 messy／pile 決定（第三次直接甩飛，筆畫飛進字框）。
 */
function swish(h: number, k: number) {
  const moves: Move[] = [
    // 得意地轉身、閉眼——尾巴轉到彩虹那一邊
    { at: h - 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
    { at: h - 0.5, actor: 'raccoon', do: 'flip' },
    // 屁股一扭
    { at: h - 0.3, actor: 'raccoon', do: 'tilt', amount: -7 - 2 * k, dur: 0.35 },
  ]
  const fx: Fx[] = [
    { at: h - 0.3, dur: 0.45, kind: 'swoosh', actor: 'raccoon', dx: 10, dy: 24, to: { x: RC.x, y: 60 }, low: true, n: 14 + 3 * k, sweep: 140, windup: 0.12, color: TAIL, width: 5.5 + 0.8 * k },
    { at: h, kind: 'burst', x: HIT.x, y: HIT.y, n: 1, dur: 0.45, scale: 1.3 + 0.35 * k },
  ]
  const cues: Cue[] = [{ at: h - 0.2, sfx: 'whoosh' }, { at: h, sfx: 'boing' }]
  const camera: Camera[] = [
    { at: h, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: 62, y: 58 } },
    { at: h, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  if (k < 2) {
    // 轉回來看：傻眼（停得住）
    moves.push(
      { at: h + 0.28, actor: 'raccoon', do: 'flip' },
      { at: h + 0.28, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    )
    fx.push({ at: h + 0.28, kind: 'pop', actor: 'raccoon', emoji: '❗', dx: 2, dur: 0.5, scale: 1.3 + 0.2 * k })
    if (k === 0) moves.push({ at: h + 0.28, actor: 'raccoon', do: 'hop', amount: 5, dur: 0.3 })
    else {
      // 嚇得往後跳、跌坐
      moves.push(
        { at: h + 0.6, actor: 'raccoon', do: 'moveTo', to: { x: RX - 9, y: RY }, arc: 7, dur: 0.3, ease: 'out' },
        { at: h + 0.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/fall' },
      )
      cues.push({ at: h + 0.9, sfx: 'bonk' })
    }
  } else {
    // 甩太大力，自己也跟著轉一圈、趴扁
    moves.push(
      { at: h + 0.02, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
      { at: h + 0.05, actor: 'raccoon', do: 'moveTo', to: { x: 22, y: RY }, arc: 10, dur: 0.42, ease: 'out' },
      { at: h + 0.05, actor: 'raccoon', do: 'spin', pivot: 'center', times: -1, dur: 0.4 },
      { at: h + 0.48, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    )
    fx.push(
      { at: h + 0.02, kind: 'burst', x: RC.x, y: 52, emoji: '✨', n: 10, dur: 0.5, scale: 1.6 },
      { at: h + 0.48, kind: 'burst', x: 22, y: 68, n: 1, dur: 0.4, scale: 1.8 },
    )
    camera.push({ at: h + 0.48, dur: 0.3, do: 'shake', amount: 1.6 })
    cues.push({ at: h + 0.02, sfx: 'poof' }, { at: h + 0.48, sfx: 'bonk' }, { at: h + 0.52, sfx: 'crack' })
  }
  return { moves, fx, cues, camera }
}

const H1 = 2.0, H2 = 3.95, H3 = 6.75
const R1 = H1 + 0.85 // 第一次排回去
const R2 = H2 + 1.2 // 第二次排回去
const GAP = 0.07 // 排回去：一條一條亮
const s1 = swish(H1, 0), s2 = swish(H2, 1), s3 = swish(H3, 2)
const FULL = 7.5 // 國字填滿
const PARK = FULL + 0.85
const WORD = PARK + 0.15
/** 回馬槍：走得遠遠的再轉身（安全！），高興得原地轉一圈 */
const AWAY = 22
const SPIN = 10.05
const WRAP = SPIN + 0.3
const SHAKE = 10.85
const ASK = 11.05
const ANSWER = 13.65
/** 纏在身上的七條：花生頭暈坐著時的肚子到腳 */
const wrapped = (at: number, end: number): Fx[] =>
  COLORS.flatMap((c, i) => strip(at, end - at, [{ x: AWAY - 9 + (i % 2), y: 57 + 2.2 * i }, { x: AWAY + 9 - (i % 2), y: 57.5 + 2.2 * i }], c, 2))
/** 被捲過來的那一下：七條從彩虹拉成直直的線，一路連到他身上 */
const pulled = (at: number, dur: number): Fx[] =>
  COLORS.flatMap((c, i) => {
    const p = arcPts(radius(i))[3]
    return strip(at, dur, [p, { x: AWAY + 4, y: 57 + 2.2 * i }], c)
  })

const clip: Clip = {
  format: 2,
  char: '七',
  meta: { theme: '七彩的彩虹', cast: '浣熊花生＋一道七種顏色的彩虹', gags: ['熱心的浣熊花生排好一道七種顏色的彩虹，每次得意地轉身，大尾巴就唰地一甩掃到彩虹，一次比一次慘（七條撞歪、順序亂掉→整道垮下來平平堆在地上，他跌坐→冒汗小心轉身，整道被甩飛，他也被甩得轉一圈趴扁）；回馬槍是他踮腳走得遠遠的才轉身、彩虹好好的，他高興得原地轉一圈，七條顏色反而全被捲過來纏在他身上'] },
  duration: 15,
  bg: { top: '#CDEBFF', bottom: '#F2FAFF', floor: '#A8D98A', scenery: 'hills' },
  actors: [
    // 看不見的錨：彩虹的線都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: RX, y: RY, size: RS, flip: true, hidden: true },
  ],
  moves: [
    // 開場：花生走進來，指著字框「七！」——張開手，七條顏色一條一條亮過去
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -25, y: RY }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 0.68, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: 1.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 第 1 次
    ...s1.moves,
    { at: R1 - 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: R1 + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 第 2 次
    ...s2.moves,
    { at: R2 - 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: R2 - 0.2, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.2 },
    // 第 3 次前停一拍：托下巴想一想、回頭看自己的尾巴、冒汗
    { at: R2 + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: R2 + 0.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/back' },
    ...s3.moves,
    // 字拼好、讓位：他爬起來走回彩虹旁邊——再排一次：七彩！
    { at: PARK - 0.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: PARK - 0.2, actor: 'raccoon', do: 'moveTo', to: { x: 44, y: RY }, dur: 0.35 },
    { at: WORD - 0.02, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: WORD + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: WORD + 0.5, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：踮腳走得遠遠的，才轉身——尾巴碰不到，彩虹好好的！
    { at: 9.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/sneak' },
    { at: 9.05, actor: 'raccoon', do: 'flip' },
    { at: 9.08, actor: 'raccoon', do: 'moveTo', to: { x: AWAY, y: RY }, dur: 0.45 },
    { at: 9.58, actor: 'raccoon', do: 'flip' },
    { at: 9.58, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 9.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 9.75, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.25 },
    // 高興得原地轉一圈——七條全被捲過來，纏在他身上
    { at: SPIN, actor: 'raccoon', do: 'hop', amount: 5, dur: 0.4 },
    { at: SPIN, actor: 'raccoon', do: 'spin', pivot: 'center', times: 2, dur: 0.4 },
    { at: WRAP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 抖一抖，七條掉光
    { at: SHAKE, actor: 'raccoon', do: 'shake', amount: 1.5, dur: 0.2 },
    // 問他：他在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'raccoon', do: 'moveTo', to: { x: 30, y: RY + 2 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'raccoon', do: 'scaleTo', amount: 1.1, dur: 0.3 },
    { at: ASK + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 12.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 12.2, actor: 'raccoon', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：往左跑出去
    { at: ANSWER + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: ANSWER + 0.1, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'raccoon', do: 'moveTo', to: { x: -35, y: RY + 2 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 3 次：整道彩虹被甩飛——最上面那條紅的拉直成一橫、彎彎的那一道變成豎彎鉤，飛進字框
    { at: H3 + 0.05, dur: 0.6, strokes: [0], from: { x: RC.x, y: RC.y - radius(0) }, color: partColor('一') },
    { at: H3 + 0.15, dur: 0.6, strokes: [1], from: { x: RC.x + 20, y: 50 }, color: partColor('乚') },
  ],
  glyph: [
    // 前兩次被掃到時，空字框抖一下（「七」快要來了）
    { at: H1 + 0.1, dur: 0.4, do: 'wobble' },
    { at: H2 + 0.1, dur: 0.4, do: 'wobble' },
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 彩虹：開場一條一條亮到七 → 撞歪 → 排回去 → 垮下來 → 排回去 → 甩飛
    ...rainbow(0.7, 0.09, () => H1 + 0.12),
    ...messy(H1, (i) => R1 + GAP * i + 0.1),
    ...rainbow(R1, GAP, () => H2 + 0.12),
    // 垮下來：先壓扁一下，再平平地堆在地上
    ...COLORS.flatMap((c, i) => strip(H2, 0.16, arcPts(radius(i), RC.x, RC.y, 0, 0.45), c)),
    ...pile(H2 + 0.12, (i) => R2 + GAP * i + 0.1),
    ...rainbow(R2, GAP, () => H3 + 0.12),
    // 甩飛：整道往右上歪過去一下就不見
    ...COLORS.flatMap((c, i) => strip(H3, 0.16, arcPts(radius(i) * 1.1, RC.x + 6, RC.y - 4, 18), c)),
    ...s1.fx,
    ...s2.fx,
    // 第 3 次前停一拍
    { at: R2 + 0.9, kind: 'sweat', actor: 'raccoon', dur: 0.6 },
    ...s3.fx,
    { at: H3 + 0.6, kind: 'dizzy', actor: 'raccoon', dur: 0.6 },
    // 七彩：再排一次
    ...rainbow(WORD, 0.06, () => SPIN + 0.08),
    { at: WORD + 0.45, kind: 'burst', x: RC.x, y: 40, emoji: '✨', n: 8, dur: 0.45, scale: 1.3 },
    // 回馬槍
    { at: 9.75, kind: 'pop', actor: 'raccoon', emoji: '❗', dx: 2, dur: 0.3 },
    { at: SPIN, dur: 0.4, kind: 'swoosh', actor: 'raccoon', dx: 0, dy: 22, to: { x: RC.x, y: 60 }, n: 16, sweep: 330, color: TAIL, width: 4.6 },
    ...pulled(SPIN + 0.06, 0.32),
    ...wrapped(WRAP, SHAKE + 0.1),
    { at: WRAP, kind: 'burst', x: AWAY + 14, y: 50, n: 1, dur: 0.4, scale: 2 },
    { at: WRAP + 0.05, kind: 'dizzy', actor: 'raccoon', dur: 0.5 },
    { at: SHAKE, kind: 'puff', actor: 'raccoon', dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 整道彩虹一直留在畫面裡：國字拼好前不讓自動取景推近到只剩花生
    { at: 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 82, y: 45 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: WRAP, dur: 0.45, do: 'punch', amount: 0.25, to: { x: AWAY + 8, y: 55 } },
    { at: WRAP, dur: 0.3, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: FULL, dur: 0.05, level: -0.25 },
    { at: FULL + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '七' },
    ...blips(0.7, 0.09),
    ...s1.cues,
    ...blips(R1, GAP),
    ...s2.cues,
    ...blips(R2, GAP),
    { at: R2 + 0.85, sfx: 'gulp' },
    ...s3.cues,
    { at: FULL + 0.05, say: '七' },
    { at: WORD, say: '七彩' },
    ...blips(WORD, 0.06),
    { at: 9.75, sfx: 'cheer' },
    { at: SPIN, sfx: 'whoosh' },
    { at: WRAP, sfx: 'boing' },
    { at: SHAKE, sfx: 'poof' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '七' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
