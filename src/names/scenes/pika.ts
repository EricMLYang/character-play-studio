// 演的是字面意思：皮＝一顆大皮球、卡＝一台卡車、丘＝一座山丘：小機器人想用卡車把皮球載上山丘（沒有黃色老鼠、閃電尾巴、紅臉頰，也沒有閃電）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小機器人把大皮球放上卡車要載上山丘，可是卡車一爬坡，球就從車上滾下來、咚咚咚滾回山腳撞到他。
// 同一個動作（舉球放上車、卡車爬坡、球滾下來）、同一串「咚咚咚」，三次只有結果越來越慘：
// 撞到腳嚇一跳 → 把他撞得跌坐 → 先停一拍（他托著下巴看山、球在車頂搖搖晃晃，他抱頭）——整個人被壓扁。
// 反轉：壓扁的他像彈簧床一樣「咚～」把球彈回去，球自己滾上山坡、跳過溜下來的空卡車，停在山頂上。他爬起來指著山頂：「皮卡丘」。

// ── 站位 ──
const S = 38 // 小機器人的 size
const BY = 77 - 0.42 * S // 小機器人站在地上的 y
const BX = 26 // 小機器人每次都站在這裡舉球
// 山丘：prop:mountain（size 76）橫著拉寬 1.85 倍，壓成一座斜坡平緩的小山丘。坡從山腳 (66.4, 77.7) 斜到山頂 (130.6, 45.2)（用紅點量過）
const HX = 130
const HS = 76
const FOOT = 66.4
const SLOPE = 0.506
const slopeY = (x: number) => 77.7 - SLOPE * (x - FOOT)
const TILT = -27 // 卡車爬坡時車身斜的角度（車頭朝右上）
// 卡車（size 26）
const TS = 26
const TY = 77 - 0.42 * TS
const PARK = 62 // 卡車停在山腳的地方
const onSlope = (x: number) => ({ x, y: slopeY(x) - 4.8 }) // 卡車斜著停在坡上的位置
const RAMP = onSlope(70) // 前輪剛上坡
const TOP = onSlope(110) // 每次都只爬到這裡（差一點到山頂）
// 皮球（size 24，染成藍色）
const BS = 24
const GB = 77 - 0.42 * BS // 皮球在地上的 y
const ROOF_FLAT = -18 // 平放時皮球在車頂（比卡車的 y 高多少）
const ROOF_TILT = { x: -19, y: -17 } // 卡車斜著時，皮球在車頂後半
const HEAD = { x: BX + 1, y: 41 } // 舉在頭上
const REST = 46 // 球滾回來撞到他以後停的地方
// 鏡頭的 zoom 是「以 to 為定點推近」：to 放在左下，畫面就留住左邊的他與地面
const NEAR = { x: 12, y: 44 } // 舉球、被撞的時候推近他
const WIDE = { x: 54, y: 50 } // 卡車爬坡時看整座山丘
const SUMMIT = { x: 130.6, y: 38.8 } // 山頂上的皮球

/** 舉球、放上車、卡車爬坡、球滾下來撞到他：k 是第幾次（0、1、2）。s 是舉球那一刻；回傳 hit＝撞到他那一刻 */
function attempt(s: number, k: number, ballFrom: number, back?: number) {
  const climb = k >= 2 ? 0.85 : 0.6 // 爬坡
  const wobble = k >= 2 ? 0.55 : 0.2 // 球在車頂搖晃（第三次停一拍）
  const roll = [1, 0.85, 0.7][k] // 滾下來的速度（越來越快）
  const t = s + 0.8 + climb // 爬到了
  const r = t + wobble // 球滾下來
  const land = { x: 80, y: slopeY(86) - 6 } // 球掉到坡上
  const foot = { x: 61, y: GB }
  const d1 = 0.2 * roll, d2 = 0.24 * roll, d3 = 0.14 * roll
  const hit = r + d1 + d2 + d3
  const b = back ?? r + 0.1 // 空卡車往後溜的時間
  const moves: Move[] = [
    // 舉起來
    { at: s, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
    { at: s, actor: 'ball', do: 'moveTo', from: { x: ballFrom, y: GB }, to: HEAD, arc: 3, dur: 0.2, ease: 'out' },
    // 放上車頂、指著山頂「出發！」
    { at: s + 0.25, actor: 'ball', do: 'moveTo', to: { x: PARK, y: TY + ROOF_FLAT }, arc: 8, dur: 0.25, ease: 'inOut' },
    { at: s + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: s + 0.5, actor: 'truck', do: 'squash', amount: 0.15, dur: 0.2 },
    // 卡車蓄力、上坡：車身斜起來
    { at: s + 0.6, actor: 'truck', do: 'squash', amount: -0.1, dur: 0.15 },
    { at: s + 0.65, actor: 'truck', do: 'rotateTo', amount: TILT, dur: 0.2 },
    { at: s + 0.65, actor: 'truck', do: 'moveTo', to: RAMP, dur: 0.2, ease: 'in' },
    { at: s + 0.65, actor: 'ball', do: 'moveTo', to: { x: RAMP.x + ROOF_TILT.x, y: RAMP.y + ROOF_TILT.y }, dur: 0.2, ease: 'in' },
    { at: s + 0.85, actor: 'truck', do: 'moveTo', to: TOP, dur: climb - 0.05, ease: 'out' },
    { at: s + 0.85, actor: 'ball', do: 'moveTo', to: { x: TOP.x + ROOF_TILT.x, y: TOP.y + ROOF_TILT.y }, dur: climb - 0.05, ease: 'out' },
    { at: s + 0.8, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    // 爬到了……球在車頂搖搖晃晃
    { at: t, actor: 'ball', do: 'shake', amount: 0.6 + 0.4 * k, dur: wobble },
    // 咚、咚、咚：掉到坡上、滾下山腳、滾到他腳邊
    { at: r, actor: 'ball', do: 'moveTo', to: land, arc: 3, dur: d1, ease: 'in' },
    { at: r + d1, actor: 'ball', do: 'moveTo', to: foot, dur: d2, ease: 'in' },
    { at: r + d1 + d2, actor: 'ball', do: 'moveTo', to: { x: REST + 4, y: GB }, dur: d3, ease: 'linear' },
    { at: r, actor: 'ball', do: 'spin', times: -2, dur: hit - r },
    { at: r + 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    // 空卡車往後溜回山腳
    { at: b, actor: 'truck', do: 'moveTo', to: RAMP, dur: 0.45, ease: 'in' },
    { at: b + 0.45, actor: 'truck', do: 'rotateTo', amount: -TILT, dur: 0.15 },
    { at: b + 0.45, actor: 'truck', do: 'moveTo', to: { x: PARK, y: TY }, dur: 0.15, ease: 'out' },
  ]
  const fx: Fx[] = [
    { at: s + 0.6, kind: 'puff', x: PARK - 14, y: 74, n: 4 + 2 * k, dur: 0.5 },
    { at: hit, kind: 'burst', x: BX + 14, y: k >= 2 ? BY - 14 : BY + 4, n: 1, dur: 0.4, scale: 1.1 + 0.35 * k },
  ]
  const camera: Camera[] = [
    // 卡車爬坡時拉開看整座山丘，球滾下來時推回他身上
    { at: s + 0.55, dur: 0.45, do: 'zoom', amount: 1.08, to: WIDE },
    { at: r + 0.05, dur: 0.4, do: 'zoom', amount: 1.3, to: NEAR },
    // 第三次被壓扁：鏡頭退一點、往左下讓位，壓扁的他和球都要在畫面裡
    ...(k >= 2 ? [{ at: hit - 0.1, dur: 0.12, do: 'zoom', amount: 1.12, to: { x: 0, y: 90 } } as Camera] : []),
    { at: hit, dur: 0.4, do: 'punch', amount: k >= 2 ? 0.06 : 0.07 + 0.05 * k, to: { x: BX, y: k >= 2 ? 80 : BY } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  // 同一串音效：放上車「咚」、引擎、咚咚咚、撞到；一次比一次多疊一個
  const cues: Cue[] = [
    { at: s + 0.5, sfx: 'plop' },
    { at: s + 0.65, sfx: 'rumble' },
    { at: r, sfx: 'tap' },
    { at: r + d1, sfx: 'tap' },
    { at: r + d1 + d2, sfx: 'tap' },
    { at: b + 0.05, sfx: 'slide' },
    { at: hit, sfx: 'bonk' },
  ]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'deflate' })
  return { moves, fx, camera, cues, hit, t, r }
}

const a1 = attempt(0.4, 0, REST)
const a2 = attempt(3.05, 1, REST)
const S3 = 6.25
// 第三次的卡車晚一點才溜：跟彈回去的球在坡上錯身
const UP = attempt(S3, 2, REST - 4).hit + 0.3
const a3 = attempt(S3, 2, REST - 4, UP + 0.2)
const H1 = a1.hit, H2 = a2.hit, H3 = a3.hit
// 反轉：壓扁的他把球彈回去，球自己滾上山頂
const SETTLE = UP + 0.75
const POSE = SETTLE + 0.45

export default scene({
  duration: POSE + 1.5,
  bg: { top: '#8FCBF5', bottom: '#F1E6FF', floor: '#B79FE0', scenery: 'hills' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 40, y: 14, size: 14, float: true },
    { id: 'tree', emoji: '🌲', x: 152, y: 77 - 0.42 * 22 - 20, size: 22 },
    { id: 'hill', emoji: 'prop:mountain', x: HX, y: 77 - 0.42 * HS, size: HS },
    { id: 'flower', emoji: '🌼', x: 6, y: 77 - 0.42 * 8, size: 8 },
    { id: 'truck', emoji: '🚚', x: PARK, y: TY, size: TS, flip: true },
    { id: 'bot', emoji: 'hero:bot/idle', x: BX, y: BY, size: S, flip: true },
    { id: 'ball', emoji: '🏀', x: REST, y: GB, size: BS, pivot: 'center', tint: 'hue-rotate(190deg) saturate(1.2)' },
  ],
  moves: [
    { at: 0, actor: 'hill', do: 'stretchTo', amount: 1.85, dur: 0 },
    // 開場：蓄力一下，看看山丘
    { at: 0.05, actor: 'bot', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.2, actor: 'bot', do: 'hop', amount: 3, dur: 0.25 },
    // 第一次：球滾到腳邊撞一下，他嚇得跳起來
    ...a1.moves,
    { at: H1, actor: 'bot', do: 'hop', amount: 5, dur: 0.3 },
    { at: H1, actor: 'ball', do: 'moveTo', to: { x: REST, y: GB }, dur: 0.2, ease: 'out' },
    { at: H1 + 0.5, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 第二次：滾得更快，把他撞得跌坐、往後滑
    ...a2.moves,
    { at: H2, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall' },
    { at: H2, actor: 'bot', do: 'moveTo', to: { x: BX - 6, y: BY }, dur: 0.2, ease: 'out' },
    { at: H2, actor: 'ball', do: 'moveTo', to: { x: REST - 4, y: GB }, dur: 0.2, ease: 'out' },
    { at: H2 + 0.55, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: H2 + 0.6, actor: 'bot', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.25 },
    // 第三次前停一拍：托著下巴看山丘
    { at: S3 - 0.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/ponder' },
    { at: S3 - 0.35, actor: 'bot', do: 'tilt', amount: -8, dur: 0.35 },
    ...a3.moves,
    // 球在車頂搖：他抱頭
    { at: a3.t + 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/duck' },
    // 第三次：整個人被壓扁，球壓在他身上
    { at: H3, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
    { at: H3, actor: 'ball', do: 'moveTo', to: { x: BX - 9, y: GB - 4 }, dur: 0.12, ease: 'out' },
    { at: H3 + 0.12, actor: 'ball', do: 'squash', amount: 0.2, dur: 0.18 },
    // 反轉：咚～把球彈回去，球自己滾上坡、跳過溜下來的空卡車，停在山頂
    { at: UP, actor: 'bot', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: UP, actor: 'ball', do: 'moveTo', to: { x: 61, y: GB }, arc: 10, dur: 0.25, ease: 'out' },
    { at: UP + 0.25, actor: 'ball', do: 'moveTo', to: SUMMIT, arc: 27, dur: 0.5, ease: 'out' },
    { at: UP, actor: 'ball', do: 'spin', times: 3, dur: 0.75 },
    { at: SETTLE, actor: 'ball', do: 'tilt', amount: 12, dur: 0.35 },
    // 爬起來看——上去了！指著山頂
    { at: SETTLE + 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: SETTLE + 0.05, actor: 'bot', do: 'moveTo', to: { x: 40, y: BY }, dur: 0.35 },
    { at: POSE, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: POSE, actor: 'bot', do: 'scaleTo', amount: 1.08, dur: 0.3, ease: 'back' },
    { at: POSE, actor: 'ball', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    ...a1.fx,
    { at: H1 + 0.1, kind: 'sweat', actor: 'bot' },
    ...a2.fx,
    { at: H2 + 0.05, kind: 'burst', x: BX, y: BY - 14, emoji: '⭐', n: 5, dur: 0.5 },
    ...a3.fx,
    { at: a3.t + 0.1, kind: 'sweat', actor: 'bot', dur: 0.6 },
    { at: H3 + 0.05, kind: 'burst', x: BX - 6, y: 38, emoji: '⭐', n: 7, dur: 0.6, scale: 1.3 },
    { at: UP, kind: 'puff', x: BX, y: 74, n: 8, dur: 0.6 },
    { at: SETTLE, kind: 'puff', x: SUMMIT.x, y: 46, n: 5, dur: 0.5 },
    { at: POSE, kind: 'burst', actor: 'bot', emoji: '✨', n: 10, dy: -12, dur: 0.9, scale: 1.3 },
    { at: POSE + 0.3, kind: 'burst', x: SUMMIT.x, y: 24, emoji: '🎉', n: 7, dy: -8, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.3, to: NEAR },
    ...a1.camera,
    ...a2.camera,
    // 停一拍：推得更近
    { at: S3 - 0.4, dur: 0.6, do: 'zoom', amount: 1.4, to: { x: 16, y: 40 } },
    ...a3.camera.filter((c) => !(c.do === 'zoom' && c.at < a3.r)),
    // 球往山頂滾：拉開
    { at: UP + 0.1, dur: 0.4, do: 'zoom', amount: 1.05, to: WIDE },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.2, to: { x: 96, y: 60 } },
  ],
  lights: [
    { at: H3, dur: 0.05, level: -0.25 },
    { at: H3 + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.2, sfx: 'boing' },
    ...a1.cues,
    ...a2.cues,
    ...a3.cues,
    { at: UP, sfx: 'boing' },
    { at: UP + 0.25, sfx: 'whoosh' },
    { at: SETTLE, sfx: 'tap' },
    { at: POSE, sfx: 'cheer' },
    { at: POSE + 0.1, say: '皮卡丘' },
  ],
})
