import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 他（v2）：花瓶倒了，狗狗警長一本正經地吹哨子問「誰弄的？」——被問的人每次都先對著警長攤手「不是我！」，
// 然後跳起來往旁邊一指：「他！」，被指的那個人嚇一跳、💥。同一個笑點四次，只有指得越來越用力、被指的跳得越來越高：
// 花生指小老鼠（亻從被指的小老鼠身上彈出來）→ 小老鼠指豬探長（也的頭從豬探長身上來）→ 先停一拍（豬探長往右看，沒人了）
// 跳起來轉一圈往回指，小老鼠趕快蹲下，指到的是最先被問的花生——繞了一圈（也的最後一筆從花生身上來），警長轉到頭暈。
// 語詞：警長吹哨把三個人叫成一排，三個人乖乖舉手，警長往旁邊一指「他們」。
// 回馬槍：三個人一起往旁邊一指——指的是警長自己的尾巴：他一回頭、尾巴又把花瓶掃得滾出去，他嚇得跳好高。
// 最後畫面暗下來只剩「他」，警長轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「他！」，然後退場只留字。
// 他、他、他們、這是什麼字？、他
const fy = (size: number) => 77 - 0.42 * size
const SHE_SIZE = 30
const S = fy(SHE_SIZE) // 警長站在地上的 y
const R = fy(28) // 花生
const M = fy(26) // 小老鼠
const P = fy(29) // 豬探長
/** 警長站在左邊不動，三個人一排站在右邊（每次問的人都面向他、往右邊——離開警長的那一邊——指） */
const SHE = 38
const RAC = 68
const MOU = 101
const PIG = 134
/** 倒在地上的花瓶（案發現場，在警長背後） */
const VASE = { x: 16, size: 13 }
/** 語詞那一刻：三個人被叫成一排，站到畫面中間 */
const RAC2 = 72
const MOU2 = 95
const PIG2 = 118
/** 被指到以後傻眼停多久 */
const HOLD = 0.5

/**
 * 「不是我！他！」：警長吹哨子問（whistle）→ 被問的人面向警長伸手掌「不是我」（wait）、搖一搖 → 蹲一下 →
 * 跳起來轉身往旁邊伸手一指（reach：手平平指出去），被指的人同一刻傻眼跳起來、頭上 💥＋鏡頭推近他＋震＋同一個音效。
 * k 是第幾次（跳得越高、💥 越大、音效越疊越多），who 指 target；right 是往右指（被問的人本來朝左面向警長，要轉身）。
 */
function blame(at: number, k: number, who: string, target: string, right: boolean, hold = HOLD) {
  const w = at - 0.85
  const jump = [3, 5, 9][k]
  const moves: Move[] = [
    // 誰弄的？
    { at: w, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: w, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.2 },
    // 不是我！
    { at: w + 0.25, actor: who, do: 'swap', emoji: `hero:${who}/wait` },
    { at: w + 0.3, actor: who, do: 'shake', amount: 1, dur: 0.35 },
    { at: at - 0.25, actor: who, do: 'squash', amount: -0.15 - 0.05 * k, dur: 0.2 },
    { at: at - 0.12, actor: who, do: 'hop', amount: jump, dur: 0.4 },
    ...(right ? [{ at: at - 0.06, actor: who, do: 'flip' } as Move] : []),
    // 他！
    { at, actor: who, do: 'swap', emoji: `hero:${who}/reach` },
    { at, actor: target, do: 'swap', emoji: `hero:${target}/surprised` },
    { at, actor: target, do: 'hop', amount: [5, 7, 9][k], dur: 0.35 },
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: at + 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: at + hold, actor: target, do: 'swap', emoji: `hero:${target}/idle` },
    { at: at + hold, actor: who, do: 'swap', emoji: `hero:${who}/idle` },
    ...(right ? [{ at: at + hold, actor: who, do: 'flip' } as Move] : []),
  ]
  const tdx = target === 'mouse' ? 1 : 0
  const fx: Fx[] = [
    { at, kind: 'burst', actor: target, dx: tdx, dy: 4, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
    { at, kind: 'burst', actor: target, dx: tdx, dy: 8, emoji: '⭐', n: 5 + 2 * k, dur: 0.4 },
  ]
  const tx = { raccoon: RAC, mouse: MOU, pig: PIG }[target] ?? 80
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: tx, y: 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個哨子、同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: w, sfx: 'blip' }, { at: at - 0.12, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

const H1 = 1.3, H2 = 3.5, H3 = 6.0
const b1 = blame(H1, 0, 'raccoon', 'mouse', true)
const b2 = blame(H2, 1, 'mouse', 'pig', true)
// 第 3 次豬探長往回指（不用轉身），一直指著到國字拼好、第二聲「他」
const b3 = blame(H3, 2, 'pig', 'raccoon', false, 1.4)
/** 字框填滿、國字到正中央（豬探長還指著花生，第二聲「他」） */
const HOME = 6.6
const PARK = 7.85
/** 語詞：三個人排成一排舉手，警長往旁邊一指 */
const THEY = 8.45
/** 回馬槍：三個人一起往旁邊一指——指的是警長自己 */
const H4 = 9.55
const TAIL = 9.95

const clip: Clip = {
  format: 2,
  char: '他',
  meta: { theme: '狗狗警長問誰打破花瓶', cast: '狗狗警長＋浣熊花生＋小老鼠＋豬探長＋花瓶', gags: ['花瓶倒了，狗狗警長吹哨子問「誰弄的？」，被問的人每次都先對警長攤手「不是我」，再跳起來往旁邊一指「他！」，被指的人嚇得跳起來，一次比一次跳得高（花生指小老鼠→小老鼠指豬探長→豬探長轉一圈指回花生，警長轉到頭暈）；回馬槍是三個人一起往旁邊一指，指的是警長自己的尾巴：他一回頭，尾巴又把花瓶掃得滾出去'] },
  duration: 15,
  bg: { top: '#E3F0FF', bottom: '#F7FBFF', floor: '#B89A7A', scenery: 'room' },
  actors: [
    // 倒在地上的花瓶（躺著）
    { id: 'vase', emoji: '🏺', x: VASE.x, y: fy(VASE.size) + 2, size: VASE.size, pivot: 'center' },
    // 三個人一排，都朝左：面向警長
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: RAC, y: R, size: 28 },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: MOU, y: M, size: 26 },
    { id: 'pig', emoji: 'hero:pig/idle', x: PIG, y: P, size: 29 },
    // 警長的圖朝左，翻過來朝右：面向三個人（花瓶在他背後）
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: SHE, y: S, size: SHE_SIZE, hidden: true, flip: true },
  ],
  moves: [
    // 花瓶一開始就是倒著的
    { at: 0, actor: 'vase', do: 'rotateTo', amount: -90, dur: 0.01 },
    // 警長走進來
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: S }, dur: 0.4, ease: 'out' },
    // 第 1 次：問花生——花生指小老鼠
    ...b1.moves,
    // 第 2 次：問小老鼠——小老鼠指豬探長
    ...b2.moves,
    // 第 3 次前停一拍：警長吹哨子問豬探長，豬探長往右看——後面沒人了！大家都在冒汗
    { at: 4.45, actor: 'pig', do: 'flip' },
    { at: 4.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: 4.9, actor: 'pig', do: 'flip' },
    { at: 4.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/scared' },
    { at: 4.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    // 豬探長轉一圈往回指，小老鼠趕快蹲下讓手指過去
    { at: H3 - 0.5, actor: 'pig', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
    { at: H3 - 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/duck' },
    ...b3.moves,
    { at: H3 + 0.05, actor: 'sheriff', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    { at: H3 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    // 花生嚇得往後跳到警長旁邊、小老鼠蹲著溜到豬探長背後躲起來：中間讓給放大的國字
    { at: H3 + 0.3, actor: 'raccoon', do: 'moveTo', to: { x: 18, y: R }, dur: 0.35, arc: 8 },
    { at: H3 + 0.35, actor: 'mouse', do: 'moveTo', to: { x: 125, y: M }, dur: 0.3 },
    // 國字放大：豬探長還指著，花生又亮一下、跳一下
    { at: HOME + 0.1, actor: 'raccoon', do: 'flash', dur: 0.4 },
    { at: HOME + 0.1, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    { at: 7.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 語詞：警長吹哨，三個人排成一排到中間、乖乖舉手；警長往旁邊一指——他們
    { at: PARK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: PARK, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.2 },
    { at: 7.95, actor: 'raccoon', do: 'moveTo', to: { x: RAC2, y: R }, dur: 0.3 },
    { at: 7.95, actor: 'mouse', do: 'moveTo', to: { x: MOU2, y: M }, dur: 0.3 },
    { at: 7.95, actor: 'pig', do: 'moveTo', to: { x: PIG2, y: P }, dur: 0.35 },
    { at: 8.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/know' },
    { at: 8.33, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/know' },
    { at: 8.36, actor: 'pig', do: 'swap', emoji: 'hero:pig/know' },
    { at: THEY - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at: THEY - 0.05, actor: 'sheriff', do: 'hop', amount: 3, dur: 0.25 },
    // 回馬槍（第 4 次）：警長得意——三個人一起往旁邊一指：是你的尾巴！
    { at: 9.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: H4 - 0.25, actor: 'raccoon', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: H4 - 0.25, actor: 'mouse', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: H4 - 0.25, actor: 'pig', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: H4 - 0.12, actor: 'raccoon', do: 'hop', amount: 9, dur: 0.4 },
    { at: H4 - 0.12, actor: 'mouse', do: 'hop', amount: 9, dur: 0.4 },
    { at: H4 - 0.12, actor: 'pig', do: 'hop', amount: 9, dur: 0.4 },
    { at: H4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: H4, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: H4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 他回頭看自己的尾巴——尾巴一甩，又把花瓶掃得滾出去
    { at: 9.8, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/back' },
    { at: TAIL, actor: 'vase', do: 'moveTo', to: { x: 6, y: fy(VASE.size) + 2 }, dur: 0.35, ease: 'out' },
    { at: TAIL, actor: 'vase', do: 'rotateTo', amount: -200, dur: 0.35, ease: 'out' },
    // 嚇得跳好高
    { at: TAIL + 0.05, actor: 'sheriff', do: 'hop', amount: 16, dur: 0.5 },
    { at: 10.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/giggle' },
    { at: 10.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/laugh' },
    { at: 10.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    { at: 10.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
    // 問他：三個人笑著跑掉（小老鼠最快，順手把花瓶抱走），警長走到左前方、變大，轉向觀眾
    { at: 10.75, actor: 'raccoon', do: 'flip' },
    { at: 10.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 10.75, actor: 'raccoon', do: 'moveTo', to: { x: 200, y: R }, dur: 0.5, ease: 'in' },
    { at: 10.75, actor: 'pig', do: 'flip' },
    { at: 10.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: 10.75, actor: 'pig', do: 'moveTo', to: { x: 200, y: P }, dur: 0.45, ease: 'in' },
    { at: 10.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 10.75, actor: 'mouse', do: 'moveTo', to: { x: 10, y: M }, dur: 0.3, ease: 'in' },
    { at: 11.05, actor: 'vase', do: 'moveTo', to: { x: -40, y: fy(VASE.size) + 2 }, dur: 0.3, ease: 'in' },
    { at: 11.05, actor: 'mouse', do: 'moveTo', to: { x: -40, y: M }, dur: 0.3, ease: 'in' },
    { at: 10.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 10.75, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: S + 4 }, dur: 0.35 },
    { at: 10.8, actor: 'sheriff', do: 'scaleTo', amount: 1.2, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 11.95, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字——他！
    { at: 13.45, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 13.45, actor: 'sheriff', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 13.72, actor: 'sheriff', do: 'flip' },
    { at: 13.75, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: S + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 每一次都從被往旁邊一指的那個人（他）身上彈出來：小老鼠 → 亻，豬探長 → 也的頭，花生 → 也的最後一筆
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1], from: 'mouse', color: partColor('亻') },
    { at: H2 + 0.05, dur: 0.55, strokes: [2, 3], from: 'pig', color: partColor('也') },
    { at: H3 + 0.05, dur: 0.5, strokes: [4], from: 'raccoon', color: partColor('也') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: 10.7, dur: 3.3, do: 'ask', keep: ['sheriff'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.75, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 誰弄的？
    { at: 0.4, kind: 'pop', actor: 'sheriff', emoji: '❓', dur: 0.5, scale: 1.3, dx: -3 },
    ...b1.fx,
    ...b2.fx,
    // 第 3 次前停一拍
    { at: 4.5, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5, scale: 1.2, dx: 3 },
    { at: 4.95, kind: 'sweat', actor: 'pig' },
    { at: 4.95, kind: 'sweat', actor: 'raccoon' },
    ...b3.fx,
    { at: H3 + 0.6, kind: 'dizzy', actor: 'sheriff', dur: 1.0 },
    // 他們
    { at: THEY, kind: 'burst', x: MOU2, y: 40, emoji: '⭐', n: 8, dur: 0.4 },
    // 回馬槍：💥 換打在他身上
    { at: H4, kind: 'burst', actor: 'sheriff', dx: 9, dy: 14, n: 1, dur: 0.4, scale: 1.5 },
    { at: H4, kind: 'burst', actor: 'sheriff', dy: 8, emoji: '⭐', n: 11, dur: 0.45 },
    { at: TAIL - 0.15, kind: 'swoosh', actor: 'sheriff', target: 'vase', dx: -8, dy: 18, n: 10, windup: 0.1, color: '#E8B34A', width: 4, dur: 0.35 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 問人、指人的三次都要看得到整排（問的人、被問的人、被指的人），自己固定全景
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: 6.45, dur: 0.2, do: 'zoom', amount: 1 },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.2, to: { x: SHE, y: 50 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.4 },
    { at: TAIL + 0.05, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.4, sfx: 'tap' },
    ...b1.cues,
    { at: H1, say: '他' },
    ...b2.cues,
    { at: 4.5, sfx: 'tap' },
    ...b3.cues,
    { at: HOME + 0.1, say: '他' },
    { at: PARK, sfx: 'blip' },
    { at: THEY, say: '他們' },
    { at: H4 - 0.12, sfx: 'whoosh' },
    { at: H4, sfx: 'bonk' },
    { at: H4 + 0.04, sfx: 'boing' },
    { at: H4 + 0.08, sfx: 'crack' },
    { at: H4 + 0.12, sfx: 'hic' },
    { at: TAIL, sfx: 'clink' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '他' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
