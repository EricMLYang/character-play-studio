// 演的是字面意思：花＋生——浣熊花生把一顆花生種進土裡澆水，土裡一直「生」出花生，最後一顆大花生裂開，「生」出一朵大花。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：花生每澆一次水，土裡就「啵」冒出一顆花生、飛起來砸在他頭上——一次比一次大。
// 同一個水桶、同一種倒法、同一聲「嘩—啵—咚」，三次只有冒出來的花生越來越大：一小顆敲一下頭 → 跟他一樣大、把他壓扁在地上 →
// 先停一拍（他抱著水桶看著土、猶豫，還是倒了），土裡升起一顆比他還高的超大花生，他抱頭蹲下等著被砸——
// 反轉：大花生沒有倒下來，「啪」裂開，裡面「生」出一朵超大的向日葵。他站起來在花旁邊敬禮：「花生」。
const S = 34 // 浣熊花生
const Y = 77 - 0.42 * S
const COON = 64 // 他每次都站在這裡（朝右看著土）
const SPOT = 98 // 種花生的地方
const NUT = 12 // 花生的基本 size（每次冒出來再放大）
const NUT_Y = 77 - 0.42 * NUT
const BX = COON - 19 // 水桶平常放在他左後方的地上
const BY = 77 - 0.42 * 12
const HEAD = 49 // 他頭頂的 y（花生的底落在這裡）
const LIFT_Y = 48.5 // 水桶舉在頭上（lift 的雙手）
/** 每次冒出來的花生放大幾倍 */
const GROW = [1, 2.1, 3.6]

/** 舉起水桶、走到土那邊倒下去、放回地上（每一次都一模一樣）。w 是開始舉的時間 */
function pour(w: number) {
  const moves: Move[] = [
    { at: w, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/lift' },
    { at: w, actor: 'bucket', do: 'moveTo', to: { x: COON + 1, y: LIFT_Y }, arc: 4, dur: 0.3, ease: 'out' },
    { at: w + 0.4, actor: 'bucket', do: 'moveTo', to: { x: COON + 9, y: LIFT_Y + 1 }, dur: 0.25 },
    { at: w + 0.4, actor: 'bucket', do: 'rotateTo', amount: 105, dur: 0.25 },
    { at: w + 1.0, actor: 'bucket', do: 'rotateTo', amount: -105, dur: 0.25 },
    { at: w + 1.0, actor: 'bucket', do: 'moveTo', to: { x: BX, y: BY }, arc: 4, dur: 0.3 },
    { at: w + 1.0, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
  ]
  const fx: Fx[] = [
    { at: w + 0.6, kind: 'blow', actor: 'bucket', to: { x: SPOT, y: 73 }, emoji: '💧', n: 7, dur: 0.45, scale: 1.3 },
    { at: w + 0.75, kind: 'burst', x: SPOT, y: 70, emoji: '💦', n: 5, dur: 0.45, scale: 1.2 },
  ]
  const cues: Cue[] = [{ at: w + 0.6, sfx: 'splash' }]
  return { moves, fx, cues }
}

/**
 * 主軸笑點：澆水 → 土裡「啵」冒出花生 → 飛起來「咚」砸在他頭上、傻眼。k 是第幾次（0、1），越後面花生越大、震越大、音效多疊一個。
 * 回傳 hit＝砸中那一刻、end＝傻眼停完的時間。
 */
function water(w: number, k: number) {
  const p = pour(w)
  const up = w + 1.2 // 冒出來
  const fly = up + 0.3
  const hit = fly + 0.35
  const moves: Move[] = [
    ...p.moves,
    // 土動一下（預備）→ 啵！冒出來
    { at: up, actor: 'nut', do: 'moveTo', to: { x: SPOT, y: NUT_Y }, dur: 0.01 },
    { at: up, actor: 'nut', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: up, actor: 'nut', do: 'pop', dur: 0.25 },
    { at: up, actor: 'nut', do: 'scaleTo', amount: GROW[k], dur: 0.25, ease: 'back' },
    // 他湊過去看
    { at: up + 0.05, actor: 'coon', do: 'tilt', amount: -8, dur: 0.25 },
    // 飛起來畫一道弧，砸在他頭上
    { at: fly, actor: 'nut', do: 'moveTo', to: { x: COON + 1, y: HEAD }, arc: 12 - 4 * k, dur: 0.35, ease: 'linear' },
    { at: fly, actor: 'nut', do: 'spin', times: -1, dur: 0.35 },
    { at: hit, actor: 'coon', do: 'swap', emoji: k >= 1 ? 'hero:raccoon/flat' : 'hero:raccoon/surprised' },
    { at: hit, actor: 'coon', do: 'squash', amount: 0.2 + 0.1 * k, dur: 0.25 },
  ]
  const fx: Fx[] = [
    ...p.fx,
    { at: up - 0.15, kind: 'puff', x: SPOT, y: 74, n: 5 + 3 * k, dur: 0.4 },
    { at: up, kind: 'burst', x: SPOT, y: 70, emoji: '🍃', n: 5, dur: 0.45 },
    // 💥 在砸中的地方（第二次他被壓扁，位置低一點）
    { at: hit, kind: 'burst', x: COON, y: k >= 1 ? 62 : HEAD - 2, n: 1, dur: 0.4, scale: 1.4 + 0.5 * k },
    { at: hit + 0.05, kind: 'burst', x: COON, y: k >= 1 ? 58 : HEAD - 4, emoji: '⭐', n: 4 + 2 * k, dur: 0.5, scale: 1.1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.08 + 0.06 * k, to: { x: COON + 6, y: 52 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.7 + 0.6 * k },
  ]
  // 同一組音效（嘩—啵—咚），一次比一次多疊一個
  const cues: Cue[] = [...p.cues, { at: up, sfx: 'plop' }, { at: hit, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: up + 0.05, sfx: 'boing' }, { at: hit + 0.05, sfx: 'deflate' })
  return { moves, fx, camera, cues, hit, end: hit + 0.5 }
}

const W1 = 1.35, W2 = 3.7, W3 = 7.3
const w1 = water(W1, 0)
const w2 = water(W2, 1)
const p3 = pour(W3)
// 第三次：同一個水桶、同一種倒法——土裡慢慢升起一顆比他還高的花生
const UP3 = W3 + 1.2
const CRACK = UP3 + 1.05
const BIG = NUT * GROW[2]

export default scene({
  duration: 11.9,
  bg: { top: '#FFD6A5', bottom: '#FFF3D9', floor: '#93C96A', scenery: 'forest' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 26, y: 18, size: 13, float: true },
    { id: 'bush', emoji: 'prop:bush', x: 140, y: 77 - 0.42 * 20, size: 20 },
    { id: 'flower', emoji: '🌻', x: SPOT + 2, y: 77 - 0.42 * 54, size: 54, hidden: true },
    { id: 'bucket', emoji: 'prop:bucket', x: BX, y: BY, size: 12, pivot: 'center' },
    { id: 'nut', emoji: '🥜', x: COON + 8, y: 58, size: NUT, pivot: 'center' },
    { id: 'coon', emoji: 'hero:raccoon/idle', x: COON, y: Y, size: S, flip: true },
  ],
  moves: [
    // ① 抱著一顆花生走來，丟進土裡、拍一拍
    { at: 0, actor: 'coon', do: 'enter', from: { x: -20, y: Y }, dur: 0.7, ease: 'out' },
    { at: 0, actor: 'nut', do: 'enter', from: { x: -12, y: 58 }, dur: 0.7, ease: 'out' },
    { at: 0.8, actor: 'coon', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: 0.85, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/throw' },
    { at: 0.85, actor: 'nut', do: 'moveTo', to: { x: SPOT, y: NUT_Y }, arc: 10, dur: 0.35, ease: 'linear' },
    { at: 0.85, actor: 'nut', do: 'spin', times: 1, dur: 0.35 },
    { at: 1.2, actor: 'nut', do: 'squash', amount: 0.4, dur: 0.15 },
    { at: 1.25, actor: 'nut', do: 'vanish', dur: 0.15 },
    { at: 1.25, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 第一次：一小顆花生敲一下頭，彈到地上滾走
    ...w1.moves,
    { at: w1.hit + 0.05, actor: 'nut', do: 'moveTo', to: { x: COON - 26, y: NUT_Y }, arc: 8, dur: 0.4, ease: 'linear' },
    { at: w1.hit + 0.45, actor: 'nut', do: 'moveTo', to: { x: -20, y: NUT_Y }, dur: 0.4, ease: 'in' },
    { at: w1.hit + 0.45, actor: 'nut', do: 'rotateTo', amount: -600, dur: 0.4 },
    { at: w1.hit + 0.85, actor: 'nut', do: 'vanish', dur: 0.05 },
    { at: w1.end, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第二次：跟他一樣大的花生，把他壓扁在地上，滾下來
    ...w2.moves,
    { at: w2.hit, actor: 'nut', do: 'moveTo', to: { x: COON + 2, y: 67 }, dur: 0.12, ease: 'in' },
    { at: w2.hit + 0.6, actor: 'nut', do: 'moveTo', to: { x: -30, y: 77 - 0.42 * NUT * GROW[1] }, dur: 0.55, ease: 'in' },
    { at: w2.hit + 0.6, actor: 'nut', do: 'rotateTo', amount: -500, dur: 0.55 },
    { at: w2.hit + 1.15, actor: 'nut', do: 'vanish', dur: 0.05 },
    { at: w2.hit + 0.6, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 停一拍：他看看水桶、看看土，托著下巴想……還是要倒
    { at: 6.7, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: 6.75, actor: 'coon', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 7.1, actor: 'coon', do: 'squash', amount: -0.1, dur: 0.2 },
    // 第三次：同一種倒法
    ...p3.moves,
    { at: UP3, actor: 'nut', do: 'moveTo', to: { x: SPOT, y: NUT_Y }, dur: 0.01 },
    { at: UP3, actor: 'nut', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: UP3, actor: 'nut', do: 'pop', dur: 0.4 },
    { at: UP3, actor: 'nut', do: 'scaleTo', amount: GROW[2], dur: 0.6, ease: 'out' },
    { at: UP3, actor: 'nut', do: 'shake', amount: 0.6, dur: 0.6 },
    // 他抬頭一看：比他還高！抱頭蹲下等著被砸
    { at: UP3 + 0.35, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: UP3 + 0.75, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/duck' },
    { at: UP3 + 0.7, actor: 'nut', do: 'tilt', amount: -14, dur: 0.45 },
    // 反轉：啪！裂開，生出一朵超大的向日葵
    { at: CRACK - 0.15, actor: 'nut', do: 'squash', amount: -0.12, dur: 0.15 },
    { at: CRACK, actor: 'nut', do: 'vanish', dur: 0.08 },
    { at: CRACK, actor: 'flower', do: 'pop', dur: 0.45 },
    { at: CRACK + 0.5, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: CRACK + 0.5, actor: 'coon', do: 'hop', amount: 4, dur: 0.3 },
    // ⑤ 站在大花旁邊敬禮
    { at: CRACK + 1.0, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: CRACK + 1.0, actor: 'coon', do: 'moveTo', to: { x: COON + 8, y: Y }, dur: 0.25 },
    { at: CRACK + 1.1, actor: 'flower', do: 'tilt', amount: 6, dur: 0.8 },
    { at: CRACK + 2.0, actor: 'coon', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 1.2, kind: 'puff', x: SPOT, y: 74, n: 6, dur: 0.5 },
    ...w1.fx,
    ...w2.fx,
    { at: w2.hit + 0.6, kind: 'dizzy', actor: 'coon', dur: 0.6 },
    // 停一拍：一滴汗
    { at: 6.8, kind: 'sweat', actor: 'coon', dur: 0.6 },
    ...p3.fx,
    { at: UP3 - 0.15, kind: 'puff', x: SPOT, y: 74, n: 14, dur: 0.7 },
    { at: UP3, kind: 'burst', x: SPOT, y: 70, emoji: '🍃', n: 8, dur: 0.6 },
    { at: UP3 + 0.8, kind: 'sweat', actor: 'coon', dur: 0.6 },
    // 裂開：花生殼噴出來、一團煙、花瓣
    { at: CRACK, kind: 'burst', x: SPOT, y: 52, emoji: 'prop:smoke', n: 1, dur: 0.6, scale: 3.2 },
    { at: CRACK, kind: 'burst', x: SPOT, y: 52, emoji: '🥜', n: 8, dur: 0.7, scale: 1.4 },
    { at: CRACK + 0.2, kind: 'burst', actor: 'flower', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: CRACK + 1.0, kind: 'burst', actor: 'coon', emoji: '🎉', n: 7, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    // 定住構圖：水桶、他、土都在畫面裡，他夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.25, to: { x: 80, y: 52 } },
    ...w1.camera,
    ...w2.camera,
    // 停一拍時慢慢推近
    { at: 6.7, dur: 0.6, do: 'zoom', amount: 1.4, to: { x: 76, y: 54 } },
    // 大花生升起來：退一點讓整顆進畫面
    { at: UP3, dur: 0.5, do: 'zoom', amount: 1.12, to: { x: 84, y: 46 } },
    { at: UP3, dur: 0.6, do: 'shake', amount: 1.2 },
    { at: CRACK, dur: 0.45, do: 'punch', amount: 0.12, to: { x: SPOT, y: 50 } },
    { at: CRACK, dur: 0.4, do: 'shake', amount: 1.6 },
    // 亮相：浣熊和花一起在畫面中間
    { at: CRACK + 0.6, dur: 0.5, do: 'zoom', amount: 1.42, to: { x: 86, y: 50 } },
  ],
  lights: [
    { at: CRACK, dur: 0.05, level: -0.45 },
    { at: CRACK + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.85, sfx: 'whoosh' },
    { at: 1.2, sfx: 'plop' },
    ...w1.cues,
    ...w2.cues,
    { at: 7.1, sfx: 'gulp' },
    ...p3.cues,
    { at: UP3, sfx: 'rumble' },
    { at: UP3 + 0.75, sfx: 'blip' },
    { at: CRACK, sfx: 'crack' },
    { at: CRACK + 0.05, sfx: 'poof' },
    { at: CRACK + 1.05, say: '花生' },
    { at: CRACK + 1.4, sfx: 'cheer' },
  ],
})
