import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 你（v2）：盤子上的蛋糕不見了，豬探長拿放大鏡辦案——每次很有自信地轉身一指「就是你！」，被指的人嚇一跳、亮出不是他的證據，
// 豬探長「呃⋯⋯」。同一個笑點四次，只有指得越來越用力、糗得越來越大：轉一圈指花生（手上空空的，他冒汗；亻從被指的花生身上彈出來）→
// 轉身指睡覺的小老鼠（她被吵醒打哈欠，他一屁股跌坐）→ 先停一拍（他看看這個、看看那個）跳起來轉三圈再指花生（花生又攤手，他直挺挺倒下）。
// 尔是「你」的老寫法：每一次都從被指著的那個人身上彈出來。花生把他拉起來，他鞠躬「謝謝你」。
// 回馬槍：他再轉一圈要指——花生跟小老鼠先一起指回他，他鼻子上沾著奶油：蛋糕是他自己吃掉的。他舔掉奶油、不好意思地偷笑。
// 最後畫面暗下來只剩「你」，豬探長轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「你！」，然後退場只留字。
// 你、你、謝謝你、這是什麼字？、你
const fy = (size: number) => 77 - 0.42 * size
const PIG_SIZE = 32
const P = fy(PIG_SIZE) // 豬探長站在地上的 y
const R = fy(29) // 花生
const M = fy(27) // 小老鼠
/** 豬探長每次都站在同一個地方指（盤子左邊） */
const PIG = 33
/** 花生站在右邊、小老鼠睡在左邊：一個轉身指右邊、一個轉身指左邊 */
const RAC = 122
const MOU = 15
/** 空盤子（案發現場） */
const PLATE = { x: 47, size: 10 }
/** 語詞那一刻與回馬槍：豬探長被拉到畫面中間 */
const MID = 68
const RAC2 = 98
const MOU2 = 36
/** 被指到以後傻眼停多久 */
const HOLD = 0.45

/**
 * 「就是你！」：豬探長舉手「我知道了！」（know，蓄力）→ 跳起來轉圈 → 落地那一刻換 point、整個人往前傾指過去，
 * 被指的人同一刻傻眼、頭上 💥＋鏡頭推近他＋震＋同一個音效。k 是第幾次（跳得越高、轉越多圈、💥 越大），
 * target 是被指的人，aim 是往前傾幾度（指右邊正、指左邊負），flip 是轉圈的時候順便轉向。
 */
function accuse(at: number, k: number, target: string, aim: number, flip = false) {
  const spin = k === 2 ? 0.55 : 0.3
  const start = at - spin
  const moves: Move[] = [
    { at: start - 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/know' },
    { at: start - 0.25, actor: 'pig', do: 'squash', amount: -0.15 - 0.05 * k, dur: 0.22 },
    { at: start, actor: 'pig', do: 'hop', amount: [4, 5, 14, 5][k], dur: spin },
    { at: start, actor: 'pig', do: 'spin', times: k === 2 ? 3 : 1, dur: spin, pivot: 'center' },
    ...(flip ? [{ at: start + spin / 2, actor: 'pig', do: 'flip' } as Move] : []),
    // 就是你！
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at, actor: 'pig', do: 'rotateTo', amount: aim, dur: 0.08, pivot: 'center' },
  ]
  if (k < 3) {
    moves.push(
      { at, actor: target, do: 'swap', emoji: `hero:${target}/surprised` },
      { at, actor: target, do: 'squash', amount: 0.2 + 0.1 * k, dur: 0.25 },
    )
  }
  const fx: Fx[] = k < 3 ? [
    { at, kind: 'burst', actor: target, dx: target === 'mouse' ? 6 : 0, dy: 4, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
    { at, kind: 'burst', actor: target, dx: target === 'mouse' ? 8 : 0, dy: 8, emoji: '⭐', n: 5 + 2 * k, dur: 0.4 },
  ] : []
  const camera: Camera[] = k < 3 ? [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: target === 'mouse' ? 30 : 100, y: 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ] : []
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: start, sfx: 'whoosh' }]
  if (k < 3) {
    cues.push({ at, sfx: 'bonk' })
    if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
    if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  }
  return { moves, fx, camera, cues }
}

const H1 = 1.25, H2 = 3.35, H3 = 6.0, H4 = 9.55
const a1 = accuse(H1, 0, 'raccoon', 20)
const a2 = accuse(H2, 1, 'mouse', -30, true)
const a3 = accuse(H3, 2, 'raccoon', 20)
const a4 = accuse(H4, 3, 'raccoon', 20)
/** 回馬槍：大家指回他，他才發現（💥 換打在他身上、奶油冒出來） */
const GOTCHA = H4 + 0.25
/** 字框填滿、國字到正中央（第三次還指著不動，第二聲「你」） */
const HOME = 6.6
const PARK = 7.85
const THANKS = 8.7

const clip: Clip = {
  format: 2,
  char: '你',
  meta: { theme: '豬探長找偷吃蛋糕的人', cast: '豬探長＋浣熊花生＋小老鼠＋空盤子＋奶油', gags: ['蛋糕不見了，豬探長每次很有自信地轉身一指「就是你！」，被指的人亮出不是他的證據（手上空空、在睡覺、又攤手），他一次比一次指得用力、糗得越大（冒汗→跌坐→直挺挺倒下）；回馬槍是他再轉身要指，大家先一起指回他：他鼻子上沾著奶油'] },
  duration: 15,
  bg: { top: '#FFF0D6', bottom: '#FFFAF1', floor: '#C9A27A', scenery: 'room' },
  actors: [
    { id: 'plate', emoji: '🍽️', x: PLATE.x, y: fy(PLATE.size), size: PLATE.size },
    // 小老鼠在左邊睡覺（頭朝左）
    { id: 'mouse', emoji: 'hero:mouse/sleep', x: MOU, y: M, size: 27 },
    // 花生朝左：面向豬探長
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: RAC, y: R, size: 29 },
    // 新的豬探長圖朝左，翻過來朝右：面向盤子和花生
    { id: 'pig', emoji: 'hero:pig/think', x: PIG, y: P, size: PIG_SIZE, hidden: true, flip: true },
    // 豬探長鼻子上的奶油（回馬槍才冒出來）
    { id: 'cream', emoji: '☁️', x: MID + 2.5, y: 58.5, size: 6, hidden: true, float: true },
  ],
  moves: [
    // 豬探長拿著放大鏡走進來：盤子上的蛋糕不見了！
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'tilt', amount: 10, dur: 0.3 },
    // 第 1 次：轉一圈指花生——就是你！花生傻眼，攤開手：手上空空的。豬探長「呃⋯⋯」
    ...a1.moves,
    { at: H1 + HOLD, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: H1 + HOLD, actor: 'raccoon', do: 'shake', amount: 1.2, dur: 0.45 },
    { at: H1 + 0.7, actor: 'pig', do: 'rotateTo', amount: -20, dur: 0.15, pivot: 'center' },
    { at: H1 + 0.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: 2.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 再拿放大鏡看盤子
    { at: 2.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.45, actor: 'pig', do: 'tilt', amount: 10, dur: 0.3 },
    // 第 2 次：轉身指睡覺的小老鼠——她嚇醒，打個大哈欠（她在睡覺）。豬探長一屁股跌坐
    ...a2.moves,
    { at: H2, actor: 'mouse', do: 'hop', amount: 6, dur: 0.3 },
    { at: H2 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/yawn' },
    { at: H2 + 0.7, actor: 'pig', do: 'rotateTo', amount: 30, dur: 0.15, pivot: 'center' },
    { at: H2 + 0.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
    // 第 3 次前停一拍：爬起來，托著下巴，看看這個、看看那個……花生開始發抖
    { at: 4.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 4.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: 4.6, actor: 'pig', do: 'hop', amount: 2, dur: 0.2 },
    { at: 5.0, actor: 'pig', do: 'flip' },
    { at: 5.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/scared' },
    { at: 5.05, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.6 },
    // 跳起來轉三圈——就是你！指著不動（國字拼好、到正中央）
    ...a3.moves,
    { at: 7.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: 7.2, actor: 'raccoon', do: 'shake', amount: 1.4, dur: 0.45 },
    { at: 7.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    // 直挺挺倒下
    { at: 7.45, actor: 'pig', do: 'rotateTo', amount: -20, dur: 0.05, pivot: 'center' },
    { at: 7.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: 7.45, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.35 },
    // 語詞那一刻：花生走過來把他拉起來，拉到畫面中間，他鞠躬「謝謝你」
    { at: PARK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 7.95, actor: 'raccoon', do: 'moveTo', to: { x: 60, y: R }, dur: 0.3 },
    { at: 8.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: 8.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/pull' },
    { at: 8.4, actor: 'raccoon', do: 'moveTo', to: { x: RAC2, y: R }, dur: 0.3, ease: 'out' },
    { at: 8.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.4, actor: 'pig', do: 'moveTo', to: { x: MID, y: P }, dur: 0.3, ease: 'out' },
    { at: 8.4, actor: 'mouse', do: 'flip' },
    { at: 8.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 8.4, actor: 'mouse', do: 'moveTo', to: { x: MOU2, y: M }, dur: 0.35 },
    { at: THANKS, actor: 'pig', do: 'swap', emoji: 'hero:pig/bow' },
    { at: THANKS + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 回馬槍（第 4 次）：他又想到了，轉一圈要指——花生跟小老鼠先一起指回他
    { at: 9.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    ...a4.moves,
    { at: 9.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 9.35, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.2 },
    { at: 9.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 9.35, actor: 'mouse', do: 'hop', amount: 3, dur: 0.2 },
    // 是你！他鼻子上沾著奶油
    { at: GOTCHA, actor: 'pig', do: 'rotateTo', amount: -20, dur: 0.05, pivot: 'center' },
    { at: GOTCHA, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: GOTCHA, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: GOTCHA, actor: 'cream', do: 'pop', dur: 0.15 },
    // 舔掉奶油，不好意思地偷笑
    { at: 10.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
    { at: 10.3, actor: 'cream', do: 'vanish', dur: 0.12 },
    { at: 10.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/giggle' },
    { at: 10.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/laugh' },
    { at: 10.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    // 問他：花生、小老鼠笑著跑掉（小老鼠順手把空盤子拿走），豬探長走到左前方、變大，轉向觀眾
    { at: 10.6, actor: 'raccoon', do: 'flip' },
    { at: 10.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 10.6, actor: 'raccoon', do: 'moveTo', to: { x: 200, y: R }, dur: 0.45, ease: 'in' },
    { at: 10.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 10.6, actor: 'mouse', do: 'moveTo', to: { x: 200, y: M }, dur: 0.5, ease: 'in' },
    { at: 10.72, actor: 'plate', do: 'moveTo', to: { x: 218, y: fy(PLATE.size) }, dur: 0.4, ease: 'in' },
    { at: 10.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.6, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.35 },
    { at: 10.65, actor: 'pig', do: 'scaleTo', amount: 1.25, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 11.95, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字——你！
    { at: 13.45, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.45, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.72, actor: 'pig', do: 'flip' },
    { at: 13.75, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 每一次都從被指著的那個人（你）身上彈出來：花生 → 亻，小老鼠 → 尔的頭，花生 → 尔的小
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1], from: 'raccoon', color: partColor('亻') },
    { at: H2 + 0.05, dur: 0.55, strokes: [2, 3], from: 'mouse', color: partColor('尔') },
    { at: H3 + 0.05, dur: 0.5, strokes: [4, 5, 6], from: 'raccoon', color: partColor('尔') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 10.55, dur: 3.4, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.6, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.05, kind: 'zzz', actor: 'mouse', dx: -4, dy: 4, dur: H2 - 0.05 },
    // 蛋糕呢？
    { at: 0.4, kind: 'bubble', actor: 'pig', emoji: '🍰', dur: 0.6, scale: 1.6, dx: -2 },
    ...a1.fx,
    { at: H1 + 0.75, kind: 'sweat', actor: 'pig' },
    ...a2.fx,
    { at: H2 + 0.75, kind: 'sweat', actor: 'pig' },
    // 第 3 次前停一拍
    { at: 4.75, kind: 'pop', actor: 'pig', emoji: '👀', dur: 0.6, scale: 1.3 },
    { at: 5.1, kind: 'sweat', actor: 'raccoon' },
    ...a3.fx,
    { at: 7.5, kind: 'dizzy', actor: 'pig', dur: 0.4 },
    { at: THANKS + 0.1, kind: 'pop', actor: 'raccoon', emoji: '💕', dur: 0.5, scale: 1.2 },
    // 是你！💥 換打在他身上
    { at: GOTCHA, kind: 'burst', actor: 'pig', dx: -4, dy: -6, n: 1, dur: 0.35, scale: 2.2 },
    { at: GOTCHA, kind: 'burst', actor: 'pig', dy: 8, emoji: '⭐', n: 10, dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 指人的三次都要看得到兩邊（指的人、被指的人），自己固定全景
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...a1.camera,
    ...a2.camera,
    ...a3.camera,
    { at: 6.45, dur: 0.2, do: 'zoom', amount: 1 },
    { at: GOTCHA, dur: 0.45, do: 'punch', amount: 0.2, to: { x: MID, y: 50 } },
    { at: GOTCHA, dur: 0.35, do: 'shake', amount: 2.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: H1, say: '你' },
    ...a1.cues,
    ...a2.cues,
    ...a3.cues,
    { at: HOME + 0.1, say: '你' },
    { at: 7.45, sfx: 'plop' },
    { at: THANKS, say: '謝謝你' },
    ...a4.cues,
    { at: GOTCHA, sfx: 'bonk' },
    { at: GOTCHA + 0.04, sfx: 'boing' },
    { at: GOTCHA + 0.08, sfx: 'crack' },
    { at: GOTCHA + 0.12, sfx: 'hic' },
    { at: 10.3, sfx: 'gulp' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '你' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
