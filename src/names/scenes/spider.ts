// 演的是字面意思：蜘蛛＋人——一個海盜學蜘蛛拿毛線繞圈織網，每繞一圈就把自己多纏一截；最後毛線一口氣轉開，他站在自己織的大網正中間，像一隻蜘蛛（沒有緊身衣、手腕噴絲、盪大樓、倒吊；線是手上的毛線）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：海盜學蜘蛛拿毛線繞一圈織網——每繞一圈，就把自己多纏一截。
// 蜘蛛在網上示範跑一圈，海盜照著把毛線團繞著自己轉一圈、用力一拉「咻——啾」：第一次纏住腳（站不穩晃兩下）→
// 第二次纏到肚子（手被綁住）→ 先停一拍（蜘蛛拚命搖頭，他還是要繞）→ 第三次纏到下巴，整個人只剩一顆頭。
// 反轉：蜘蛛垂絲下來，咬住線頭往後一拉——海盜像陀螺一樣原地轉開，毛線往四面八方甩出去，
// 停下來時他身後是一張比蜘蛛的還大的藍色毛線網，他站在網的正中間，蜘蛛跳上來：「蜘蛛人」。
const S = 38 // 海盜的 size
const PX = 102 // 海盜每次都站在這裡繞
const PY = 77 - 0.42 * S // 海盜站在地上的 y
const W = { x: 47, y: 40 } // 蜘蛛網的中心
const SP = 20 // 蜘蛛的 size
const SPY = 77 - 0.42 * SP // 蜘蛛站在沙灘上的 y
const YARN = '#3E7BD9' // 毛線（跟 🧶 同色）
const HOLD = 0.5 // 纏緊以後傻眼停多久

/** 海盜圖上的一點（u、v 是圖的比例，0.5 是中心）換成跟著他的 dx／dy，與站好時舞台上的座標 */
const off = (u: number, v: number) => ({ dx: (u - 0.5) * S, dy: (v - 0.5) * S })
const at0 = (u: number, v: number) => ({ x: PX + (u - 0.5) * S, y: PY + (v - 0.5) * S })

/** 三次纏上去的毛線（照傻眼 surprised 那張圖）：腳 → 肚子 → 一直到下巴 */
const BANDS: [number, number, number, number][][] = [
  [[0.24, 0.8, 0.76, 0.93], [0.24, 0.93, 0.76, 0.8]],
  [[0.15, 0.63, 0.85, 0.67], [0.14, 0.73, 0.86, 0.70], [0.2, 0.81, 0.8, 0.84]],
  [[0.18, 0.57, 0.84, 0.6], [0.2, 0.62, 0.82, 0.54], [0.74, 0.43, 0.9, 0.47]],
]
/** 毛線團繞圈的高度（跟那一次纏的地方一樣） */
const LAP_Y = [PY + 0.4 * S, PY + 0.24 * S, PY + 0.07 * S]
const UNWIND = 7.7 // 反轉：開始轉開的那一刻

/** 蜘蛛示範：在網上跑一圈回到中心 */
function demo(at: number): { moves: Move[]; cues: Cue[] } {
  const r = 9
  const pts = [{ x: W.x, y: W.y - r }, { x: W.x + r, y: W.y }, { x: W.x, y: W.y + r }, { x: W.x - r, y: W.y }, W]
  return {
    moves: [
      { at: at - 0.12, actor: 'spi', do: 'squash', amount: -0.2, dur: 0.12 },
      ...pts.map((to, i): Move => ({ at: at + i * 0.1, actor: 'spi', do: 'moveTo', to, dur: 0.1, ease: 'linear' })),
    ],
    cues: [{ at, sfx: 'whoosh' }],
  }
}

/**
 * 主軸笑點：毛線團繞著自己轉一圈（從左手 → 前面 → 右邊 → 繞到背後 → 回到左手），經過前面時毛線一圈一圈纏上去，
 * 用力一拉「啾」：纏緊、傻眼。k 是第幾次（0、1、2），纏的地方一次比一次高、拉得一次比一次大力。
 */
function wrap(at: number, k: number) {
  const y = LAP_Y[k]
  const L = 0.8
  const moves: Move[] = [
    // 預備：把毛線團舉起來蓄力
    { at: at - 0.2, actor: 'pir', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: at - 0.2, actor: 'yarn', do: 'moveTo', to: { x: PX - 17, y }, dur: 0.2, ease: 'out' },
    // 繞一圈
    { at, actor: 'yarn', do: 'moveTo', to: { x: PX - 1, y: y + 5 }, dur: L * 0.3, ease: 'linear' },
    { at, actor: 'yarn', do: 'scaleTo', amount: 1.3, dur: L * 0.3 },
    { at: at + L * 0.3, actor: 'yarn', do: 'moveTo', to: { x: PX + 17, y }, dur: L * 0.25, ease: 'out' },
    { at: at + L * 0.3, actor: 'yarn', do: 'scaleTo', amount: 1 / 1.3, dur: L * 0.25 },
    { at: at + L * 0.55, actor: 'yarn', do: 'vanish', dur: L * 0.12 },
    { at: at + L * 0.7, actor: 'yarn', do: 'moveTo', to: { x: PX - 15, y: PY + 6 }, dur: 0.01 },
    { at: at + L * 0.75, actor: 'yarn', do: 'pop', dur: L * 0.25 },
    // 毛線團被用掉一截，小一點
    { at: at + L, actor: 'yarn', do: 'scaleTo', amount: 0.85, dur: 0.2 },
  ]
  const hit = at + L + 0.05
  moves.push(
    // 啾——纏緊：傻眼
    { at: hit, actor: 'pir', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: hit, actor: 'pir', do: 'squash', amount: 0.12 + 0.06 * k, dur: 0.25 },
    { at: hit + 0.25, actor: 'pir', do: 'shake', amount: 0.4 + 0.3 * k, dur: HOLD - 0.2 },
  )
  // 纏上去的毛線：前面經過時一條一條出現，一直留到反轉轉開
  const fx: Fx[] = BANDS[k].map(([u1, v1, u2, v2], i): Fx => ({
    at: at + L * 0.15 + i * 0.07, dur: UNWIND + 0.1 - (at + L * 0.15 + i * 0.07), kind: 'tube', actor: 'pir',
    ...off(u1, v1), to: at0(u2, v2), color: YARN, width: 2.1, n: 99,
  }))
  // 繞圈時毛線團拖著一條線，連回他身上
  fx.push({ at, dur: L * 0.55, kind: 'line', actor: 'yarn', to: { x: PX - 0.33 * S, y }, color: YARN, width: 1.1 })
  // 纏緊那一下：腳邊揚起一圈灰
  fx.push({ at: hit, kind: 'puff', actor: 'pir', n: 4 + 2 * k, dur: 0.5 })
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.07 + 0.05 * k, to: { x: PX, y: PY - 4 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  // 同一個音效（繞圈咻＋拉緊啾），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'whoosh' }, { at: hit, sfx: 'slide' }]
  if (k >= 1) cues.push({ at: hit + 0.05, sfx: 'boing' })
  if (k >= 2) cues.push({ at: hit + 0.1, sfx: 'bonk' })
  return { moves, fx, camera, cues, end: hit + HOLD }
}

const A1 = 1.35, A2 = 3.45, A3 = 5.85
const d1 = demo(A1 - 0.65)
const d2 = demo(A2 - 0.65)
const w1 = wrap(A1, 0)
const w2 = wrap(A2, 1)
const w3 = wrap(A3, 2)
const DROP = 7.0 // 蜘蛛垂絲下來
const SPIN = 0.85 // 轉開轉多久
const STOP = UNWIND + SPIN
const POSE = STOP + 0.45
const DUR = POSE + 1.55

/** 轉開時甩出去的毛線：從他身邊一圈往外拉到大網的邊（避開臉，臉一直看得到） */
const C = { x: PX, y: 44 } // 大網的中心
const RAYS = [-90, -45, 0, 45, 135, 180, -135].map((deg) => {
  const a = (deg * Math.PI) / 180
  return { from: { dx: Math.cos(a) * 13, dy: C.y - PY + Math.sin(a) * 13 }, to: { x: C.x + Math.cos(a) * 34, y: Math.min(74, C.y + Math.sin(a) * 34) } }
})

export default scene({
  duration: DUR,
  bg: { top: '#16204A', bottom: '#3B5C9E', floor: '#E9CF95', scenery: 'night' },
  actors: [
    { id: 'palm1', emoji: '🌴', x: 14, y: 77 - 0.42 * 50, size: 50 },
    { id: 'palm2', emoji: '🌴', x: 148, y: 77 - 0.42 * 44, size: 44 },
    { id: 'web', emoji: 'prop:web', x: W.x, y: W.y, size: 38, float: true },
    { id: 'myweb', emoji: 'prop:web', x: C.x, y: C.y, size: 68, float: true, hidden: true, pivot: 'center', tint: 'brightness(0.55) sepia(1) hue-rotate(185deg) saturate(5)' },
    { id: 'pir', emoji: 'hero:pirate/idle', x: 178, y: PY, size: S },
    { id: 'yarn', emoji: '🧶', x: 178 - 15, y: PY + 6, size: 12, pivot: 'center' },
    { id: 'spi', emoji: '🕷️', x: W.x, y: W.y, size: SP, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：蜘蛛在網上得意地彈一下；海盜抱著毛線團走進來
    { at: 0.05, actor: 'spi', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.1, actor: 'pir', do: 'moveTo', to: { x: PX, y: PY }, dur: 0.55, ease: 'out' },
    { at: 0.1, actor: 'yarn', do: 'moveTo', to: { x: PX - 15, y: PY + 6 }, dur: 0.55, ease: 'out' },
    // 第一次：蜘蛛示範跑一圈，他照著繞——纏住腳，站不穩晃兩下
    ...d1.moves,
    { at: A1 - 0.4, actor: 'pir', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: A1 - 0.2, actor: 'pir', do: 'swap', emoji: 'hero:pirate/idle' },
    ...w1.moves,
    { at: w1.end, actor: 'pir', do: 'tilt', amount: 7, dur: 0.3 },
    { at: w1.end + 0.3, actor: 'pir', do: 'tilt', amount: -7, dur: 0.3 },
    { at: w1.end + 0.6, actor: 'pir', do: 'swap', emoji: 'hero:pirate/idle' },
    // 第二次：再示範一次，他再繞——纏到肚子
    ...d2.moves,
    ...w2.moves,
    { at: w2.end, actor: 'pir', do: 'tilt', amount: -6, dur: 0.35 },
    // 停一拍：他又舉起毛線團，蜘蛛拚命搖頭「不要！」——他還是繞了
    { at: 4.75, actor: 'pir', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 4.8, actor: 'yarn', do: 'hop', amount: 3, dur: 0.3 },
    { at: 4.85, actor: 'spi', do: 'tilt', amount: 35, dur: 0.2 },
    { at: 5.05, actor: 'spi', do: 'tilt', amount: -35, dur: 0.2 },
    { at: 5.25, actor: 'spi', do: 'tilt', amount: 35, dur: 0.2 },
    { at: 4.85, actor: 'spi', do: 'scaleTo', amount: 1.25, dur: 0.2, ease: 'back' },
    { at: 5.55, actor: 'spi', do: 'scaleTo', amount: 0.8, dur: 0.2 },
    { at: 5.3, actor: 'pir', do: 'tilt', amount: 5, dur: 0.3 },
    // 第三次：纏到下巴，只剩一顆頭
    ...w3.moves,
    // 反轉：蜘蛛垂絲下來、咬住線頭，往後一拉
    { at: DROP, actor: 'spi', do: 'moveTo', to: { x: 66, y: 50 }, dur: 0.3, ease: 'in' },
    { at: DROP + 0.3, actor: 'spi', do: 'moveTo', to: { x: 76, y: SPY }, dur: 0.25, ease: 'bounce' },
    { at: UNWIND - 0.1, actor: 'spi', do: 'moveTo', to: { x: 60, y: SPY }, anticipate: 3, dur: 0.3, ease: 'out' },
    { at: UNWIND - 0.1, actor: 'spi', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: UNWIND, actor: 'yarn', do: 'vanish', dur: 0.15 },
    // 像陀螺一樣原地轉開
    { at: UNWIND, actor: 'pir', do: 'spin', times: 4, dur: SPIN, pivot: 'center' },
    { at: UNWIND + 0.1, actor: 'myweb', do: 'pop', dur: SPIN - 0.1 },
    { at: UNWIND + 0.1, actor: 'myweb', do: 'rotateTo', amount: 200, dur: SPIN - 0.1, ease: 'out' },
    { at: UNWIND + 0.3, actor: 'spi', do: 'spin', times: -2, dur: 0.45, pivot: 'center' },
    // 停下來：頭暈一下，才發現身後是自己織的大網
    { at: STOP, actor: 'pir', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: STOP, actor: 'pir', do: 'tilt', amount: 8, dur: 0.4 },
    // 亮相：跳起來歡呼，蜘蛛跳上他的網
    { at: POSE, actor: 'pir', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: POSE, actor: 'pir', do: 'scaleTo', amount: 1.08, dur: 0.3, ease: 'back' },
    { at: POSE + 0.05, actor: 'spi', do: 'moveTo', to: { x: C.x - 25, y: C.y - 6 }, arc: 12, dur: 0.4, ease: 'out' },
    { at: POSE + 0.7, actor: 'spi', do: 'hop', amount: 2.5, dur: 0.3 },
  ],
  fx: [
    ...w1.fx,
    { at: w1.end - 0.1, kind: 'sweat', actor: 'pir' },
    ...w2.fx,
    { at: 4.85, kind: 'sweat', actor: 'spi', dur: 0.7 },
    ...w3.fx,
    // 蜘蛛垂下來的絲、咬住的線頭
    { at: DROP, dur: UNWIND + 0.2 - DROP, kind: 'line', actor: 'web', target: 'spi', color: '#FFFFFF', width: 0.5 },
    { at: DROP + 0.55, dur: STOP - DROP - 0.55, kind: 'line', actor: 'spi', to: at0(0.27, 0.88), color: YARN, width: 1.2 },
    // 轉開：毛線往四面八方甩出去
    ...RAYS.map((r, i): Fx => ({ at: UNWIND + 0.05 + i * 0.07, dur: SPIN + 0.1 - i * 0.07, kind: 'line', actor: 'pir', ...r.from, to: r.to, color: YARN, width: 1.3 })),
    { at: UNWIND, kind: 'puff', actor: 'pir', n: 6, dur: 0.6 },
    { at: POSE, kind: 'burst', actor: 'pir', emoji: '✨', n: 9, dur: 0.9, scale: 1.4, dy: -12 },
    { at: POSE + 0.35, kind: 'burst', actor: 'pir', emoji: '🎉', n: 7, dur: 0.9, scale: 1.3, dy: -12 },
  ],
  camera: [
    // 定住構圖：網、蜘蛛、海盜都在畫面裡，海盜夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.4, to: { x: 78, y: 55 } },
    ...w1.camera,
    ...w2.camera,
    // 停一拍時慢慢推近
    { at: 4.75, dur: 0.6, do: 'zoom', amount: 1.55, to: { x: 86, y: 56 } },
    ...w3.camera,
    { at: w3.end, dur: 0.4, do: 'zoom', amount: 1.4, to: { x: 84, y: 55 } },
    { at: STOP, dur: 0.3, do: 'shake', amount: 0.8 },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: PX - 4, y: 50 } },
  ],
  lights: [
    { at: POSE, dur: 0.05, level: -0.25 },
    { at: POSE + 0.05, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    ...d1.cues,
    ...w1.cues,
    ...d2.cues,
    ...w2.cues,
    { at: 4.85, sfx: 'blip' },
    { at: 5.05, sfx: 'blip' },
    { at: 5.25, sfx: 'blip' },
    ...w3.cues,
    { at: DROP, sfx: 'whoosh' },
    { at: UNWIND - 0.1, sfx: 'slide' },
    { at: UNWIND, sfx: 'rumble' },
    { at: STOP, sfx: 'boing' },
    { at: POSE, sfx: 'poof' },
    { at: POSE + 0.1, say: '蜘蛛人' },
    { at: POSE + 0.35, sfx: 'cheer' },
  ],
})
