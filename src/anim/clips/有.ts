import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 有（v2）：熱心的浣熊花生有一個什麼都掏得出來的大背包。豬探長每次問「有沒有⋯⋯？」（想法泡泡），花生就把手伸進背包一掏——「有！」
// 掏出來的東西一次比一次大、一次比一次離譜，他熱心地丟給豬探長，把豬探長壓扁：要一顆蘋果→一顆超大蘋果（手 𠂇 從花生伸出來的手飛上去）、
// 要一滴水→一隻噴水的大鯨魚，把他沖走（月的外框）、先停一拍（豬探長猶豫要不要問）要一顆花生→一隻大象（月裡面兩橫）。
// 「有」本來就是手上拿著一塊肉：上面是手、下面的月其實是肉，所以手從伸出來的手來、月從手上掏出來的東西來。
// 回馬槍：豬探長學乖了，只要一隻小螞蟻，還先抱頭蹲好——花生掏了半天：沒有！再往裡面找，整個人栽進背包，背包自己跳著跑掉，豬探長笑著追出去。
// 最後畫面暗下來只剩「有」，花生從背包裡爬出來跑回來、轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「有！」，然後退場只留字。
// 有、有、沒有、這是什麼字？、有
const P = 66.9 // 豬探長、花生（size 24）站在地上的 y
/** 大背包（🎒）：畫面中間最大的東西 */
const BAG = { x: 80, size: 38 }
const BAG_Y = 77 - 0.42 * BAG.size
/** 背包口：東西從這裡掏出來 */
const MOUTH = { x: 78, y: 50 }
/** 豬探長每次都站在同一個地方問（背包左邊），東西每次都砸在這裡 */
const PIG = 40
/** 花生每次都站在背包右邊掏 */
const RAC = 103
/** 站在地上的 y */
const fy = (size: number) => 77 - 0.42 * size
/** 被砸扁以後傻眼停多久 */
const HOLD = 0.45
/** 掏出來 → 丟過去 → 砸到 */
const TOSS = 0.25, FALL = 0.3

/**
 * 掏出來的東西：同一個角色（item）每次換一個 emoji、放大，道具才不會超過兩個。
 * up 是冒出背包口以後停的地方（往左上、避開上面的字框），arc 是丟過去的弧線高度。
 */
type Item = { emoji: string; size: number; up: { x: number; y: number }; arc: number }
const APPLE: Item = { emoji: '🍎', size: 28, up: { x: 68, y: 44 }, arc: 8 }
const WHALE: Item = { emoji: '🐳', size: 42, up: { x: 60, y: 50 }, arc: 4 }
const ELE: Item = { emoji: '🐘', size: 50, up: { x: 58, y: 54 }, arc: 3 }
const ITEMS = [APPLE, WHALE, ELE]

/**
 * 「有！」：豬探長想要一個東西（想法泡泡）→ 花生舉手「我有！」→ 把手伸進背包、背包抖（預備）→
 * 掏出來那一刻東西「噗」地從背包口冒出來、花生舉手 → 丟給豬探長 → 砸到那一刻 💥＋鏡頭推近＋震＋同一個音效，豬探長被壓扁傻眼停 HOLD 秒。
 * k 是第幾次（越後面東西越大、背包抖得越兇、💥 越大）。at 是掏出來的那一刻，askAt 是豬探長問的那一刻。
 */
function dig(at: number, k: number, it: Item, want: string, askAt = at - 1.1) {
  const hit = at + TOSS + FALL
  const land = { x: PIG, y: fy(it.size) }
  const moves: Move[] = [
    // 上一次丟出去的東西還在畫面外：先藏起來、搬回背包口、換成這一次的東西、放大到這一次的大小
    ...(k > 0 ? [
      { at: at - 0.1, actor: 'item', do: 'vanish', dur: 0.01 },
      { at: at - 0.08, actor: 'item', do: 'moveTo', to: MOUTH, dur: 0.01 },
      { at: at - 0.08, actor: 'item', do: 'swap', emoji: it.emoji },
      { at: at - 0.08, actor: 'item', do: 'scaleTo', amount: it.size / ITEMS[k - 1].size, dur: 0.01 },
    ] as Move[] : []),
    { at: askAt, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: askAt + 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/know' },
    { at: askAt + 0.3, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    // 預備：手伸進背包裡翻，背包一直抖
    { at: at - 0.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: at - 0.55, actor: 'raccoon', do: 'tilt', amount: -14, dur: 0.5 },
    { at: at - 0.5, actor: 'bag', do: 'shake', amount: 1 + 0.5 * k, dur: 0.45 },
    // 掏出來：東西從背包口冒出來，花生舉手「有！」
    { at, actor: 'item', do: 'pop', dur: 0.12 },
    { at, actor: 'item', do: 'moveTo', to: it.up, dur: TOSS, ease: 'out' },
    { at, actor: 'bag', do: 'squash', amount: -0.2 - 0.06 * k, dur: 0.25 },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/know' },
    // 熱心地丟給豬探長
    { at: at + TOSS, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/throw' },
    { at: at + TOSS, actor: 'item', do: 'moveTo', to: land, arc: it.arc, dur: FALL, ease: 'in' },
    { at: at + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 砸到：壓扁
    { at: hit, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: hit, actor: 'pig', do: 'squash', amount: 0.3 + 0.1 * k, dur: HOLD },
    { at: hit, actor: 'item', do: 'squash', amount: 0.2 + 0.05 * k, dur: 0.25 },
    { at: hit + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
  ]
  const fx: Fx[] = [
    // 豬探長想要的東西（小小的一個），泡泡放大才看得清楚
    { at: askAt, kind: 'bubble', actor: 'pig', emoji: want, dur: 0.85, scale: 1.8, dx: -2 },
    // 💥 每次都在豬探長身上同一個位置，一次比一次大
    { at: hit, kind: 'burst', x: PIG, y: P - 8, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
    { at: hit, kind: 'burst', x: PIG, y: P - 4, emoji: '⭐', n: 5 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: PIG + 6, y: P - 10 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.5, sfx: 'rumble' }, { at, sfx: 'poof' }, { at: hit, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'whoosh' })
  return { moves, fx, camera, cues, hit }
}

const H1 = 1.35, H2 = 3.45, H3 = 6.25
const d1 = dig(H1, 0, APPLE, '🍎')
const d2 = dig(H2, 1, WHALE, '💧')
// 第 3 次前停一拍：豬探長猶豫要不要問，最後只敢要一顆小花生
const d3 = dig(H3, 2, ELE, '🥜', 5.6)
/** 回馬槍：掏了半天，沒有！ */
const H4 = 9.3
/** 再往裡面找，整個人栽進背包 */
const DIVE = 9.9

const clip: Clip = {
  format: 2,
  char: '有',
  meta: { theme: '花生的萬能大背包', cast: '浣熊花生＋豬探長＋大背包', gags: ['豬探長每次問有沒有一個小東西，花生就往大背包裡一掏「有！」，掏出來的東西一次比一次大（超大蘋果、噴水鯨魚、大象），熱心丟給他把他壓扁；回馬槍是他只要一隻小螞蟻、還先抱頭蹲好，花生掏半天「沒有」，自己栽進背包'] },
  duration: 15,
  bg: { top: '#FFE6D5', bottom: '#FFF8F0', floor: '#C9DFA0', scenery: 'hills' },
  actors: [
    // 新的豬探長圖朝左，翻過來朝右：面向背包和花生
    { id: 'pig', emoji: 'hero:pig/idle', x: PIG, y: P, size: 24, flip: true },
    // 掏出來的東西（蘋果 → 鯨魚 → 大象，同一個角色換 emoji）
    { id: 'item', emoji: APPLE.emoji, x: MOUTH.x, y: MOUTH.y, size: APPLE.size, hidden: true },
    { id: 'bag', emoji: '🎒', x: BAG.x, y: BAG_Y, size: BAG.size },
    // 花生朝左：面向背包和豬探長
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: RAC, y: P, size: 24, hidden: true },
  ],
  moves: [
    // 花生從右邊跑進來，站到背包旁邊
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: 180, y: P }, dur: 0.4, ease: 'out' },
    // 第 1 次：要一顆蘋果——有！一顆超大的蘋果
    ...d1.moves,
    { at: d1.hit + HOLD, actor: 'item', do: 'moveTo', to: { x: -30, y: fy(APPLE.size) }, arc: 10, dur: 0.35, ease: 'out' },
    { at: d1.hit + HOLD, actor: 'item', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    { at: d1.hit + HOLD, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: d1.hit + HOLD + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 2 次：要一滴水——有！一隻噴水的大鯨魚，壓扁再沖走
    ...d2.moves,
    { at: d2.hit + HOLD, actor: 'pig', do: 'moveTo', to: { x: 16, y: P }, dur: 0.4, ease: 'out' },
    { at: d2.hit + HOLD, actor: 'item', do: 'moveTo', to: { x: -45, y: fy(WHALE.size) }, arc: 10, dur: 0.45, ease: 'in' },
    { at: d2.hit + HOLD + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: d2.hit + HOLD + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 3 次前停一拍：走回同一個地方，托著下巴猶豫……花生在旁邊舉手跳著等
    { at: 4.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 4.95, actor: 'pig', do: 'moveTo', to: { x: PIG, y: P }, dur: 0.4 },
    { at: 5.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: 5.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/know' },
    { at: 5.35, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.2 },
    ...d3.moves,
    // 大象慢慢走掉（往左），豬探長扁在地上轉星星
    { at: d3.hit + HOLD, actor: 'item', do: 'moveTo', to: { x: -50, y: fy(ELE.size) }, dur: 0.5, ease: 'in' },
    // 字框填滿：花生把背包拖到右邊讓字（回馬槍再推回中間）
    { at: 7.02, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/pull' },
    { at: 7.05, actor: 'raccoon', do: 'moveTo', to: { x: RAC + 44, y: P }, dur: 0.4 },
    { at: 7.05, actor: 'bag', do: 'moveTo', to: { x: BAG.x + 43, y: BAG_Y }, dur: 0.4 },
    { at: 7.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 8.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/push' },
    { at: 8.15, actor: 'raccoon', do: 'moveTo', to: { x: RAC, y: P }, dur: 0.4 },
    { at: 8.15, actor: 'bag', do: 'moveTo', to: { x: BAG.x, y: BAG_Y }, dur: 0.4 },
    // 回馬槍（第 4 次）：豬探長爬起來，這次只要一隻小螞蟻，還先抱頭蹲好
    { at: 8.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: 8.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/know' },
    { at: 8.55, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    // 掏、掏、掏……
    { at: 8.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: 8.75, actor: 'raccoon', do: 'rotateTo', amount: -25, dur: 0.2 },
    { at: 8.8, actor: 'bag', do: 'shake', amount: 2.2, dur: 0.5 },
    // 沒有！空著手抬頭
    { at: H4, actor: 'raccoon', do: 'rotateTo', amount: 25, dur: 0.15 },
    { at: H4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: H4, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    { at: H4 + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/peek' },
    // 再往裡面找——整個人栽進背包
    { at: DIVE - 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: DIVE - 0.3, actor: 'raccoon', do: 'moveTo', to: { x: MOUTH.x + 2, y: MOUTH.y - 2 }, arc: 8, dur: 0.3, ease: 'in' },
    { at: DIVE - 0.3, actor: 'raccoon', do: 'rotateTo', amount: -150, dur: 0.3, pivot: 'center' },
    { at: DIVE - 0.2, actor: 'raccoon', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    { at: DIVE, actor: 'raccoon', do: 'vanish', dur: 0.05 },
    { at: DIVE, actor: 'bag', do: 'squash', amount: 0.45, dur: 0.3 },
    // 背包自己跳著跑掉（花生在裡面亂動），豬探長笑完追出去
    { at: DIVE + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
    ...[10.2, 10.4, 10.6].map((at): Move => ({ at, actor: 'bag', do: 'hop', amount: 6, dur: 0.2 })),
    { at: 10.2, actor: 'bag', do: 'moveTo', to: { x: 200, y: BAG_Y }, dur: 0.6, ease: 'in' },
    { at: 10.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: 10.4, actor: 'pig', do: 'moveTo', to: { x: 200, y: P }, dur: 0.45, ease: 'in' },
    // 問他：花生從背包裡爬出來跑回來（從右邊），變大，轉向觀眾
    { at: 10.75, actor: 'raccoon', do: 'rotateTo', amount: 150, dur: 0.01, pivot: 'center' },
    { at: 10.75, actor: 'raccoon', do: 'scaleTo', amount: 1 / 0.6, dur: 0.01 },
    { at: 10.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 10.75, actor: 'raccoon', do: 'moveTo', to: { x: 185, y: P + 4 }, dur: 0.01 },
    { at: 10.77, actor: 'raccoon', do: 'pop', dur: 0.01 },
    { at: 10.78, actor: 'raccoon', do: 'moveTo', to: { x: 124, y: P + 4 }, dur: 0.3, ease: 'out' },
    { at: 11.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 11.1, actor: 'raccoon', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.95, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（衝刺回去找背包），畫面只留下字
    { at: 13.72, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 13.72, actor: 'raccoon', do: 'flip' },
    { at: 13.75, actor: 'raccoon', do: 'moveTo', to: { x: 205, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：手（𠂇）從花生伸進背包又伸出來的手飛上去
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1], from: 'raccoon', color: partColor('𠂇') },
    // 第 2、3 次：月（其實是手上拿的肉）從掏出來的東西飛上去：鯨魚 → 外框，大象 → 裡面兩橫
    { at: d2.hit + 0.05, dur: 0.55, strokes: [2, 3], from: 'item', color: partColor('月') },
    { at: d3.hit + 0.05, dur: 0.5, strokes: [4, 5], from: 'item', color: partColor('月') },
  ],
  glyph: [
    // 字框填滿：國字到正中央放大（背包先被拖到右邊）
    { at: 7.4, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.25, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的花生
    { at: 10.55, dur: 3.4, do: 'ask', keep: ['raccoon'], to: { x: 64, y: 43 }, amount: 0.82 },
    { at: 10.6, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...d1.fx,
    { at: d1.hit + 0.25, kind: 'sweat', actor: 'pig' },
    ...d2.fx,
    // 鯨魚壓下來還噴水：豬探長被沖走
    { at: d2.hit, kind: 'fountain', actor: 'item', n: 10, dur: 0.8, scale: 1.3 },
    { at: d2.hit + HOLD, kind: 'burst', x: 28, y: P, emoji: '💧', n: 6, dur: 0.45 },
    // 第 3 次前停一拍：冒汗、看一眼背包
    { at: 5.35, kind: 'sweat', actor: 'pig' },
    { at: 5.35, kind: 'pop', actor: 'pig', emoji: '👀', dur: 0.3, scale: 1.3 },
    ...d3.fx,
    { at: d3.hit + 0.3, kind: 'dizzy', actor: 'pig', dur: 0.9 },
    // 回馬槍：只要一隻小螞蟻
    { at: 8.25, kind: 'bubble', actor: 'pig', emoji: '🐜', dur: 0.85, scale: 1.8, dx: -2 },
    { at: 8.85, kind: 'sweat', actor: 'pig' },
    // 沒有！背包口噗出一口空氣，花生頭上一個大問號
    { at: H4, kind: 'pop', x: RAC - 6, y: P - 22, emoji: '❓', dur: 0.6, scale: 2.2 },
    { at: H4, kind: 'burst', x: MOUTH.x, y: MOUTH.y - 6, emoji: '💨', n: 4, dur: 0.45, scale: 1.3 },
    // 栽進背包那一下
    { at: DIVE, kind: 'burst', x: BAG.x, y: BAG_Y - 8, n: 1, dur: 0.4, scale: 2.8 },
    { at: DIVE, kind: 'burst', x: BAG.x, y: BAG_Y - 6, emoji: '⭐', n: 10, dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 64, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...d1.camera,
    ...d2.camera,
    ...d3.camera,
    // 語詞「沒有」那一刻：鏡頭靠近背包和花生
    { at: H4 - 0.15, dur: 0.3, do: 'zoom', amount: 1.25, to: { x: 90, y: 50 } },
    { at: DIVE + 0.35, dur: 0.3, do: 'zoom', amount: 1 },
    { at: DIVE, dur: 0.45, do: 'punch', amount: 0.15, to: { x: BAG.x, y: 45 } },
    { at: DIVE, dur: 0.35, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: 7.4, dur: 0.05, level: -0.35 },
    { at: 7.45, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: H1, say: '有' },
    ...d1.cues,
    ...d2.cues,
    { at: d2.hit + 0.1, sfx: 'splash' },
    ...d3.cues,
    { at: 7.5, say: '有' },
    { at: 8.8, sfx: 'rumble' },
    { at: H4, say: '沒有' },
    { at: DIVE, sfx: 'bonk' },
    { at: DIVE + 0.04, sfx: 'boing' },
    { at: DIVE + 0.08, sfx: 'whoosh' },
    { at: DIVE + 0.12, sfx: 'plop' },
    ...[10.2, 10.4, 10.6].map((at): Cue => ({ at, sfx: 'tap' })),
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '有' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
