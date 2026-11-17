// 演的是字面意思：大＋野狼——一隻大野狼對著房子吸氣、吹氣，房子吹不倒，最後吹太用力，自己像洩氣的氣球一樣飛走。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：大野狼吸一大口氣、對著房子用力吹——房子就是不倒，最後吹太用力，自己像洩氣的氣球飛出去。
// 同一個吸氣（仰頭、肚子鼓起來）、同一個吹氣（鼓腮、💨 打在房子上）、同一聲「咻」做三次，只有越吸越大、風越吹越大：
// 第一次房子抖一下、窗口的小豬嚇一跳；第二次門窗亂抖、煙囪上的旗子被吹歪，小豬只晃一下；
// 停一拍：大野狼氣得跺腳，小豬打個哈欠。第三次吸到圓滾滾、憋住——一吹，房子沒動，他自己往後「噗嚕嚕」倒著繞圈飛走，
// 繞一大圈掉在那棟吹不倒的房子屋頂上，坐穩了叉腰壞笑：「大野狼」。
const S = 34 // 大野狼的 size
const WY = 77 - 0.42 * S // 大野狼站在地上的 y
const WX = 112 // 大野狼每次都站在這裡吹
const HX = 50 // 房子
const HS = 48
const HY = 77 - 0.42 * HS
const WIN = { x: HX + 8.6, y: HY + 3 } // 房子的窗口（小豬露臉的地方）
const FLAG = { x: HX - 11.6, y: HY - 21.6 } // 煙囪上的小旗子
const ROOF = { x: HX + 1, y: 24.5 } // 最後坐在屋頂上的位置
/** 吹完以後傻眼停多久 */
const HOLD = 0.5
/** 每次吸氣鼓多大（scaleTo 倍率）、肚子變多寬（stretchTo） */
const PUFF = [1.12, 1.28, 1.5]
const WIDE = [1.08, 1.16, 1.26]

/** 吸氣：仰頭閉眼，整隻鼓起來。at 開始吸，dur 吸多久 */
function inhale(at: number, k: number, dur: number) {
  const moves: Move[] = [
    { at, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-howl' },
    { at, actor: 'wolf', do: 'scaleTo', amount: PUFF[k], dur, ease: 'out' },
    { at, actor: 'wolf', do: 'stretchTo', amount: WIDE[k], dur, ease: 'out' },
  ]
  const cues: Cue[] = [{ at, sfx: 'slide' }]
  return { moves, cues }
}

/**
 * 吹：鼓腮、💨 從嘴巴打到房子上。k 越大風越大、房子抖越大；b 是吹出去那一刻。
 * 小豬的反應反而一次比一次小（第一次跳起來、第二次只晃一下）。
 */
function blow(b: number, k: number) {
  const moves: Move[] = [
    { at: b, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-blow' },
    { at: b, actor: 'wolf', do: 'scaleTo', amount: 1 / PUFF[k], dur: 0.45, ease: 'inOut' },
    { at: b, actor: 'wolf', do: 'stretchTo', amount: 1 / WIDE[k], dur: 0.45, ease: 'inOut' },
    // 房子、窗戶、小豬、旗子一起抖（不倒）
    ...['house', 'window', 'pig', 'flag'].map((id): Move => ({ at: b + 0.15, actor: id, do: 'shake', amount: 0.5 + 0.6 * k, dur: 0.5 + 0.15 * k })),
    { at: b + 0.15, actor: 'flag', do: 'rotateTo', amount: -(14 + 22 * k), dur: 0.25, ease: 'out' },
  ]
  if (k === 0) moves.push(
    { at: b + 0.2, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
    { at: b + 0.9, actor: 'flag', do: 'rotateTo', amount: 14, dur: 0.4, ease: 'elastic' },
  )
  else moves.push({ at: b + 0.25, actor: 'pig', do: 'tilt', amount: 8, dur: 0.4 })
  const fx: Fx[] = [
    { at: b, kind: 'blow', actor: 'wolf', target: 'house', dx: -8, dy: 9, n: 4 + 2 * k, dur: 0.6 + 0.1 * k, scale: 1.2 + 0.4 * k },
    { at: b + 0.18, kind: 'burst', x: HX + 18, y: HY - 4, emoji: '💨', n: 1, dur: 0.45, scale: 1 + 0.4 * k },
    // 白色的風線：從嘴巴直直打到房子牆上，一次比一次多、比一次粗
    ...[-6, -1, 4, -11, 9].slice(0, 2 + k).map((d, i): Fx => ({ at: b + 0.03 * i, kind: 'line', actor: 'wolf', dx: -16, dy: -4 + d * 0.3,
      to: { x: HX + 20, y: HY - 4 + d }, color: '#FFFFFF', width: 0.8 + 0.5 * k, dur: 0.45 + 0.1 * k })),
  ]
  if (k >= 1) fx.push({ at: b + 0.05, kind: 'blow', actor: 'wolf', target: 'house', dx: -8, dy: 16, n: 4, dur: 0.7, scale: 1.4 })
  const camera: Camera[] = [
    { at: b + 0.15, dur: 0.45, do: 'punch', amount: 0.06 + 0.04 * k, to: { x: 76, y: 50 } },
    { at: b + 0.15, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.5 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at: b, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: b + 0.15, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

const B1 = 1.95, B2 = 3.85, B3 = 7.05
const i1 = inhale(B1 - 0.55, 0, 0.55)
const b1 = blow(B1, 0)
const i2 = inhale(B2 - 0.7, 1, 0.7)
const b2 = blow(B2, 1)
// 第三次：吸得最久，再憋住一拍
const IN3 = 5.65
const i3 = inhale(IN3, 2, 1.0)
// 回馬槍：洩氣的氣球——往後倒著繞一大圈，一路噴氣、一路縮回原來大小
const PATH = [
  { x: 132, y: 44 }, { x: 128, y: 21 }, { x: 100, y: 17 }, { x: 74, y: 22 }, ROOF,
]
const SEG = [0.28, 0.26, 0.26, 0.24, 0.3]
const legs: number[] = []
SEG.reduce((t, d) => (legs.push(t), t + d), B3)
const LAND = B3 + SEG.reduce((a, b) => a + b, 0)
const POSE = LAND + 0.6

export default scene({
  duration: 11.1,
  bg: { top: '#E98A5C', bottom: '#F8D49A', floor: '#7FA857', scenery: 'forest' },
  actors: [
    { id: 'tree1', emoji: '🌲', x: 148, y: 77 - 0.42 * 44, size: 44 },
    { id: 'tree2', emoji: '🌳', x: 10, y: 77 - 0.42 * 30, size: 30 },
    { id: 'flag', emoji: '🚩', x: FLAG.x, y: FLAG.y, size: 10 },
    { id: 'house', emoji: '🏠', x: HX, y: HY, size: HS },
    { id: 'window', emoji: 'prop:window-open', x: WIN.x, y: WIN.y, size: 13 },
    { id: 'pig', emoji: '🐷', x: WIN.x, y: WIN.y + 0.5, size: 8, hidden: true },
    { id: 'wolf', emoji: 'prop:wolf', x: WX, y: WY, size: S },
  ],
  moves: [
    // 開場：大野狼從右邊走進來，小豬從窗口探頭
    { at: 0, actor: 'wolf', do: 'enter', from: { x: 178, y: WY }, dur: 0.9, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'pop', dur: 0.3 },
    { at: 1.0, actor: 'wolf', do: 'hop', amount: 2, dur: 0.25 },
    // 第一次
    ...i1.moves,
    ...b1.moves,
    { at: B1 + HOLD + 0.1, actor: 'wolf', do: 'swap', emoji: 'prop:wolf' },
    // 第二次
    ...i2.moves,
    ...b2.moves,
    { at: B2 + HOLD + 0.1, actor: 'wolf', do: 'swap', emoji: 'prop:wolf' },
    // 停一拍：大野狼氣得跺腳，小豬打個哈欠
    { at: 4.8, actor: 'wolf', do: 'hop', amount: 3, dur: 0.22 },
    { at: 5.05, actor: 'wolf', do: 'hop', amount: 3, dur: 0.22 },
    { at: 4.9, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.6 },
    // 第三次：吸到圓滾滾、憋住發抖
    ...i3.moves,
    { at: IN3 + 1.0, actor: 'wolf', do: 'shake', amount: 0.8, dur: B3 - IN3 - 1.0 },
    // 一吹——房子沒動，他自己往後飛
    { at: B3, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-blow' },
    ...PATH.map((to, i): Move => ({ at: legs[i], actor: 'wolf', do: 'moveTo', to, dur: SEG[i], ease: i === PATH.length - 1 ? 'in' : 'linear' })),
    { at: B3, actor: 'wolf', do: 'spin', times: 3, dur: LAND - B3 - 0.1, pivot: 'center' },
    { at: B3, actor: 'wolf', do: 'scaleTo', amount: 1 / PUFF[2], dur: LAND - B3, ease: 'inOut' },
    { at: B3, actor: 'wolf', do: 'stretchTo', amount: 1 / WIDE[2], dur: LAND - B3, ease: 'inOut' },
    { at: B3 + 0.2, actor: 'flag', do: 'tilt', amount: 10, dur: 0.4 },
    // 「咚」掉在屋頂上：房子這次真的抖了一下，小豬抬頭
    { at: LAND, actor: 'wolf', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: LAND, actor: 'house', do: 'squash', amount: 0.08, dur: 0.3 },
    { at: LAND + 0.1, actor: 'pig', do: 'hop', amount: 2, dur: 0.3 },
    // 亮相：坐穩了，叉腰壞笑（我本來就要上來的）
    { at: POSE, actor: 'wolf', do: 'swap', emoji: 'prop:wolf' },
    { at: POSE, actor: 'wolf', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
  ],
  fx: [
    ...b1.fx,
    ...b2.fx,
    { at: 5.05, kind: 'puff', actor: 'wolf' },
    { at: 5.0, kind: 'zzz', actor: 'pig', dx: 2, dur: 1.2 },
    // 吸第三口：憋到流汗
    { at: IN3 + 0.8, kind: 'sweat', actor: 'wolf', dur: 0.6 },
    // 一吹：嘴前一小口 💨（房子沒事）
    { at: B3, kind: 'burst', x: WX - 14, y: WY - 8, emoji: '💨', n: 1, dur: 0.4, scale: 0.9 },
    // 飛的路上一路噴氣，留一串 💨
    ...PATH.slice(0, 4).map((p, i): Fx => ({ at: legs[i] + SEG[i] * 0.6, kind: 'burst', x: p.x, y: p.y, emoji: '💨', n: 1, dur: 0.5, scale: 1.2 })),
    { at: LAND, kind: 'burst', actor: 'wolf', dy: 4, emoji: '💥', n: 1, dur: 0.4, scale: 1.4 },
    { at: LAND + 0.05, kind: 'dizzy', actor: 'wolf', dur: 0.6 },
    { at: POSE, kind: 'burst', actor: 'wolf', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.45, kind: 'burst', actor: 'wolf', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：房子、大野狼都在畫面裡
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.35, to: { x: 75, y: 50 } },
    ...b1.camera,
    ...b2.camera,
    // 第三口吸氣：推近大野狼
    { at: IN3, dur: 1.0, do: 'zoom', amount: 1.4, to: { x: 104, y: 50 } },
    // 飛出去：退回全景看他繞一圈
    { at: B3, dur: 0.3, do: 'zoom', amount: 1, to: { x: 80, y: 45 } },
    { at: B3, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: LAND, dur: 0.35, do: 'shake', amount: 1.4 },
    // 亮相：推近屋頂上的他
    // 鏡頭是「以 to 為定點推近」：(0, 20) 讓視野落在 x 0～110、y 6～68，屋頂上的他整隻在裡面
    { at: LAND + 0.2, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 0, y: 20 } },
  ],
  lights: [
    { at: B3, dur: 0.05, level: -0.3 },
    { at: B3 + 0.05, dur: 0.3, level: 0 },
    { at: POSE, dur: 0.05, level: -0.3 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.5, sfx: 'blip' },
    ...i1.cues,
    ...b1.cues,
    ...i2.cues,
    ...b2.cues,
    { at: 4.8, sfx: 'tap' },
    { at: 5.05, sfx: 'tap' },
    ...i3.cues,
    { at: B3, sfx: 'deflate' },
    { at: B3 + 0.05, sfx: 'whoosh' },
    { at: LAND, sfx: 'bonk' },
    { at: POSE + 0.1, say: '大野狼' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
