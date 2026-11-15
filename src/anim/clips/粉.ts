import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 粉（v2）：愛現的忍者小老鼠抱著一大袋麵粉，麵粉一飄起來他鼻子就癢——每次「哈——啾！」一個大噴嚏，整團白粉「噗」地噴到對面的紅東西上，
// 白粉一散開，紅的就變成粉紅的：紅蘋果→粉紅蘋果（白粉裡飛出米的上半）、紅色消防車→粉紅消防車（米的下半）、
// 第三次前他捏著鼻子忍⋯⋯忍不住，最大的一個噴嚏把來阻止他的狗狗警長整隻噴成粉紅色（分從警長身上彈出來）。這就是「粉」：白白的粉，加到紅色裡就是粉紅。
// 回馬槍：第四次他捏住鼻子忍住了、正得意，結果是滿身麵粉的警長鼻子癢——「哈啾！」反過來把他噴成一隻粉紅色的小老鼠。
// 最後畫面暗下來只剩「粉」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「粉！」，然後退場只留字。
// 粉、粉、麵粉、這是什麼字？、粉（字卡語詞「粉紅」「粉色」的紅、色在多音字表裡，anim:check 不讓用，改用「麵粉」）
const P = 77 - 0.42 * 28 // 小老鼠、警長（size 28）站在地上的 y
/** 小老鼠每次都站在同一個地方打噴嚏（左邊），麵粉袋在他前面 */
const MX = 24
const BAG = { x: 43, y: 77 - 0.42 * 18 }
/** 被噴的東西每次都在同一個地方（右邊） */
const TX = 124
const APPLE = { size: 24, y: 77 - 0.42 * 24 }
const TRUCK = { size: 36, y: 77 - 0.42 * 36 }
/** 語詞那一刻與回馬槍：小老鼠走到中間，麵粉袋放大在他右邊 */
const MX4 = 56
const BAG4 = { x: 90, y: 77 - 0.42 * 18 }
/** 白粉雲每一次多大：一次比一次大團（雲的 actor 本身 size 24） */
const CLOUD = [26, 34, 46, 42]
/** 紅的東西蓋上白粉變粉紅（調淡、往洋紅偏一點，不是褪色的紅） */
const PINK_RED = 'contrast(.5) brightness(1.6) saturate(1.5) hue-rotate(-18deg)'
/** 整隻動物變粉紅（黃狗、灰老鼠都一樣染成粉紅） */
const PINK_BODY = 'sepia(1) saturate(2.6) hue-rotate(-48deg) brightness(1.18)'
/** 小老鼠變粉紅：深色忍者服也要亮成粉紅，比警長再亮一點 */
const PINK_MOUSE = 'sepia(1) saturate(3.4) hue-rotate(-58deg) brightness(1.4)'
/** 傻眼停多久 */
const HOLD = 0.5

type Shot = {
  /** 打噴嚏的人與他嘴巴前面那一點（白粉從這裡噴出去） */
  who: 'mouse' | 'sheriff'
  from: { x: number; y: number }
  /** 被噴的是誰、白粉撲到哪一點 */
  target: string
  to: { x: number; y: number }
  /** 變粉紅用哪一種 */
  tint: string
}

/**
 * 「哈——啾！」：鼻子前飄起一點白粉（癢）→ 頭往後仰、張大嘴吸氣（yawn 姿勢＋拉長，預備）→
 * 噴嚏（sneeze 姿勢）那一刻，一整團白粉雲「噗」地噴到對面蓋住目標＋💥＋⚪ 粉末四散＋鏡頭推近＋震＋同一個音效 →
 * 白粉散開，目標變成粉紅色、亮一下，打噴嚏的人傻眼停 HOLD 秒。k 是第幾次（雲越後面越大、震得越大、音效疊越多）。
 */
function achoo(at: number, k: number, s: Shot) {
  const cloud = 'cloud'
  // 第 3 次前面已經捏著鼻子忍了一拍，「哈——」短一點
  const prep = k === 2 ? 0.5 : 0.7
  const moves: Move[] = [
    // 預備：哈——（頭往後仰、吸一大口氣）
    { at: at - prep, actor: s.who, do: 'swap', emoji: `hero:${s.who}/yawn` },
    { at: at - prep, actor: s.who, do: 'squash', amount: -0.16 - 0.04 * k, dur: prep - 0.1 },
    // 啾！
    { at, actor: s.who, do: 'swap', emoji: `hero:${s.who}/sneeze` },
    { at, actor: s.who, do: 'squash', amount: 0.2 + 0.05 * k, dur: 0.25 },
    // 一整團白粉從嘴巴前噴出去，撲到目標上
    { at: at - 0.02, actor: cloud, do: 'moveTo', to: s.from, dur: 0.01 },
    { at, actor: cloud, do: 'pop', dur: 0.08 },
    { at: at + 0.005, actor: cloud, do: 'scaleTo', amount: CLOUD[k] / 24, dur: 0.01 },
    { at, actor: cloud, do: 'moveTo', to: s.to, dur: 0.16, ease: 'out' },
    { at: at + 0.42, actor: cloud, do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'out' },
    { at: at + 0.45, actor: cloud, do: 'vanish', dur: 0.2 },
    // 蓋住的那一刻被撞一下、變粉紅；白粉散開後亮一下給你看
    { at: at + 0.14, actor: s.target, do: 'squash', amount: 0.2 + 0.04 * k, dur: 0.25 },
    { at: at + 0.18, actor: s.target, do: 'tint', filter: s.tint },
    { at: at + 0.65, actor: s.target, do: 'hop', amount: 2.5, dur: 0.25 },
    // 打噴嚏的人傻眼：紅的變粉紅了！
    { at: at + 0.35, actor: s.who, do: 'swap', emoji: `hero:${s.who}/surprised` },
  ]
  const mid = { x: (s.from.x + s.to.x) / 2, y: (s.from.y + s.to.y) / 2 - 4 }
  const fx: Fx[] = [
    // 癢：白粉飄到鼻子前
    { at: at - 0.95, kind: 'burst', x: s.from.x, y: s.from.y - 2, emoji: '⚪', n: 3, dur: 0.3, scale: 0.45 },
    { at, kind: 'burst', x: mid.x, y: mid.y, n: 1, dur: 0.3, scale: 1.3 + 0.35 * k },
    // 粉末四散，一次比一次多
    { at: at + 0.15, kind: 'burst', x: s.to.x, y: s.to.y, emoji: '⚪', n: 6 + 2 * k, dur: 0.45, scale: 0.9 + 0.2 * k },
    // 變成粉紅色那一下閃一閃
    { at: at + 0.62, kind: 'burst', x: s.to.x, y: s.to.y - 9, emoji: '✨', n: 5, dur: 0.45, scale: 0.9 + 0.1 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: 80, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'achoo' }, { at: at + 0.05, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.08, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

const NOSE = { x: MX + 12, y: P - 6 }
const H1 = 1.65, H2 = 3.9, H3 = 6.25, H4 = 9.35
const a1 = achoo(H1, 0, { who: 'mouse', from: NOSE, target: 'item', to: { x: TX, y: APPLE.y - 2 }, tint: PINK_RED })
const a2 = achoo(H2, 1, { who: 'mouse', from: NOSE, target: 'item', to: { x: TX, y: TRUCK.y }, tint: PINK_RED })
const a3 = achoo(H3, 2, { who: 'mouse', from: NOSE, target: 'sheriff', to: { x: TX, y: P - 4 }, tint: PINK_BODY })
// 回馬槍：換滿身麵粉的警長打噴嚏，噴回小老鼠
const a4 = achoo(H4, 3, { who: 'sheriff', from: { x: TX - 12, y: P - 6 }, target: 'mouse', to: { x: MX4, y: P - 4 }, tint: PINK_MOUSE })

const clip: Clip = {
  format: 2,
  char: '粉',
  meta: { theme: '忍者小老鼠抱麵粉打噴嚏', cast: '小老鼠＋狗狗警長＋麵粉袋', gags: ['小老鼠抱著麵粉袋鼻子癢，每次哈——啾一個大噴嚏，整團白粉噗地噴到對面的紅東西上，紅的就變成粉紅的（紅蘋果、紅色消防車、第三次捏鼻子忍不住，把來阻止他的警長整隻噴成粉紅色）；回馬槍是他終於捏住鼻子忍住了，換滿身麵粉的警長哈啾，把他噴成粉紅色的小老鼠'] },
  duration: 15,
  // 深色廚房：白粉在深色牆前才看得見
  bg: { top: '#1F4E5F', bottom: '#2C6E7F', floor: '#7A5236', scenery: 'room' },
  actors: [
    // 被噴的紅東西：同一個 actor 依序是紅蘋果、紅色消防車
    { id: 'item', emoji: '🍎', x: TX, y: APPLE.y, size: APPLE.size },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: 190, y: P, size: 28, hidden: true },
    // 姿勢圖朝左，翻過來面向右邊（問他時也面向右邊的字）
    { id: 'mouse', emoji: 'hero:mouse/idle', x: MX, y: P, size: 28, hidden: true, flip: true },
    { id: 'bag', emoji: 'prop:flour', x: BAG.x, y: BAG.y, size: 18 },
    // 白粉雲：畫在最上面（撲上去那一刻蓋住目標）
    { id: 'cloud', emoji: '☁️', x: MX, y: P, size: 24, hidden: true, float: true },
  ],
  moves: [
    // 小老鼠衝進來，站到麵粉袋後面，擺忍者架式抬頭看字框
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'back' },
    { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 第 1 次：哈——啾！紅蘋果變粉紅蘋果
    ...a1.moves,
    { at: H1 + HOLD + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: H1 + HOLD + 0.4, actor: 'mouse', do: 'hop', amount: 3, dur: 0.25 },
    // 粉紅蘋果滾走，紅色消防車開進來
    { at: 2.7, actor: 'item', do: 'moveTo', to: { x: 190, y: APPLE.y }, dur: 0.35, ease: 'in' },
    { at: 2.7, actor: 'item', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
    { at: 3.06, actor: 'item', do: 'swap', emoji: '🚒' },
    { at: 3.06, actor: 'item', do: 'tint', filter: '' },
    { at: 3.06, actor: 'item', do: 'scaleTo', amount: TRUCK.size / APPLE.size, dur: 0.01 },
    { at: 3.06, actor: 'item', do: 'moveTo', to: { x: 200, y: TRUCK.y }, dur: 0.01 },
    { at: 3.08, actor: 'item', do: 'moveTo', to: { x: TX, y: TRUCK.y }, dur: 0.45, ease: 'out' },
    { at: 3.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 第 2 次：哈——啾！消防車變粉紅
    ...a2.moves,
    { at: H2 + HOLD + 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    // 粉紅消防車倒車開走，狗狗警長走過來要阻止他
    { at: 4.9, actor: 'item', do: 'flip' },
    { at: 4.95, actor: 'item', do: 'moveTo', to: { x: 205, y: TRUCK.y }, dur: 0.4, ease: 'in' },
    { at: 5.0, actor: 'sheriff', do: 'enter', from: { x: 190, y: P }, dur: 0.01 },
    { at: 5.05, actor: 'sheriff', do: 'moveTo', to: { x: TX, y: P }, dur: 0.45, ease: 'out' },
    { at: 5.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wait' },
    // 第 3 次前停一拍：他捏住鼻子忍⋯⋯忍⋯⋯
    { at: 5.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stinky' },
    { at: 5.15, actor: 'mouse', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 5.5, actor: 'mouse', do: 'shake', amount: 1.3, dur: 0.25 },
    // 忍不住：最大的哈——啾！警長整隻變粉紅
    ...a3.moves,
    { at: H3 + 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 字框填滿（國字 home 到正中央）：兩個人退到兩邊
    { at: 6.9, actor: 'sheriff', do: 'moveTo', to: { x: 136, y: P }, dur: 0.25 },
    { at: 7.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
    { at: 7.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    // 語詞那一刻：國字讓位，小老鼠把麵粉袋推到中間舉給你看——麵粉！
    { at: 7.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: 7.9, actor: 'mouse', do: 'moveTo', to: { x: MX4, y: P }, dur: 0.35 },
    { at: 7.9, actor: 'bag', do: 'moveTo', to: BAG4, dur: 0.35 },
    { at: 8.15, actor: 'bag', do: 'scaleTo', amount: 1.5, dur: 0.25, ease: 'back' },
    { at: 8.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 8.25, actor: 'mouse', do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.7, actor: 'bag', do: 'scaleTo', amount: 1 / 1.5, dur: 0.2 },
    // 回馬槍（第 4 次）：麵粉又飄起來，他捏住鼻子——忍住了！得意
    { at: 8.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stinky' },
    { at: 8.8, actor: 'mouse', do: 'shake', amount: 1, dur: 0.3 },
    { at: 9.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    // 換滿身麵粉的警長鼻子癢……哈——啾！把他噴成粉紅色
    ...a4.moves,
    { at: H4 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/giggle' },
    // 警長把麵粉袋沒收、抱走
    { at: 10.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 10.1, actor: 'sheriff', do: 'flip' },
    { at: 10.1, actor: 'sheriff', do: 'moveTo', to: { x: 200, y: P }, dur: 0.4, ease: 'in' },
    { at: 10.1, actor: 'bag', do: 'moveTo', to: { x: 210, y: BAG.y }, dur: 0.4, ease: 'in' },
    // 問他：粉紅色的小老鼠走到左前方、變大，轉向觀眾
    { at: 10.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: 10.3, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3 },
    { at: 10.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 10.65, actor: 'mouse', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 11.95, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 13.45, actor: 'mouse', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（衝刺），畫面只留下字
    { at: 13.72, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 13.72, actor: 'mouse', do: 'flip' },
    { at: 13.75, actor: 'mouse', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：白粉雲裡飛出來——米（白白的米粉）
    { at: H1 + 0.12, dur: 0.6, strokes: [0, 1, 2], from: 'cloud', color: partColor('米') },
    { at: H2 + 0.12, dur: 0.6, strokes: [3, 4, 5], from: 'cloud', color: partColor('米') },
    // 第 3 次：從變成粉紅色的警長身上彈出來——分
    { at: H3 + 0.2, dur: 0.6, strokes: [6, 7, 8, 9], from: 'sheriff', color: partColor('分') },
  ],
  glyph: [
    { at: 7.0, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.85, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.55, dur: 3.4, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.6, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'burst', x: NOSE.x, y: NOSE.y - 2, emoji: '⚪', n: 3, dur: 0.3, scale: 0.45 },
    ...a1.fx,
    ...a2.fx,
    { at: 5.2, kind: 'sweat', actor: 'mouse' },
    ...a3.fx,
    ...a4.fx,
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...a1.camera,
    ...a2.camera,
    ...a3.camera,
    // 語詞與回馬槍：兩個人一左一右都要在畫面裡，全景
    { at: 7.9, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...a4.camera,
    { at: 10.4, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    { at: 7.0, dur: 0.05, level: -0.35 },
    { at: 7.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '粉' },
    ...a1.cues,
    ...a2.cues,
    ...a3.cues,
    { at: 7.1, say: '粉' },
    { at: 8.2, say: '麵粉' },
    ...a4.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '粉' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
