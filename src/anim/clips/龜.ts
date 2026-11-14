import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 龜（v2）：一本正經的狗狗警長要跟大烏龜握手，每次手一伸過去，烏龜就「咻」地縮進殼裡——他撲了個空、「叩」地敲在硬殼上，嚇得跳好高，一次比一次高：
// 跳起來吹手（頭縮進去，頭那組筆畫從頭飛出來）、跳更高轉一圈摔扁（腳縮進去，腳那組從腳飛出來）、先停一拍：他背過身假裝不看、倒退著偷偷靠近……叩——直接跳出畫面（殼和尾巴那組從殼上飛出來）。
// 字拼好放大時烏龜在旁邊站起來、擺成跟字一樣的側面（頭朝上、腳在左、殼在右），頭對頭、腳對腳、殼對殼各亮一下。
// 回馬槍：他伸手、烏龜縮進去，這次他手停住沒敲到、得意了，湊過去看殼裡的眼睛——烏龜「咻」地把頭伸出來頂到他臉上，他跳得最高。
// 最後畫面暗下來只剩「龜」，警長從天上掉到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「龜！」，然後退場只留字。
// 龜、龜、烏龜、這是什麼字？、龜
const P = 66.9 // 警長（size 24）站在地上的 y
/** 大烏龜（prop:turtle，側面朝左、頭腳伸出來；撐滿寬、高只佔 0.62），畫面上最大 */
const TS = 46
const T = 77 - 0.42 * TS // 烏龜站在地上的 y（畫布中心）
/** 烏龜平常站的地方：字框正下方 */
const TX = 84
/** prop:turtle-shell 跟 turtle 同 size swap，x 要往右移 0.074 × size 殼才對齊 */
const SHELL_DX = 0.074 * TS
/** turtle 圖上各部位（照 turtle 的 x、y 算；畫布 (u, v) → x + (u − 0.5) × size, y + (v − 0.5) × size） */
const HEAD = { dx: -0.31 * TS, dy: 0 }
const LEGS = { dx: -0.2 * TS, dy: 0.32 * TS }
const SHELL = { dx: 0.12 * TS, dy: 0.06 * TS }
/** 警長每次站的地方（面向右邊的烏龜） */
const SX = 40
/** 伸手的位置：手（伸手圖翻過來，手在 x + 8）剛好碰到烏龜的鼻子 */
const RX = 55
/** 撲空往前一栽：手敲在縮起來的殼上 */
const LUNGE = 61.5
/** 叩：敲到殼的地方（殼的左上） */
const KNOCK = { x: 70, y: 57 }
/** 💥 畫在敲到的地方右上，不蓋住他傻眼的臉 */
const BANG = { x: 76, y: 49 }
/** 敲到以後傻眼停多久，才嚇得跳起來 */
const HOLD = 0.4
/** 從伸手到敲到 */
const PRE = 0.7
/** 語詞那一刻烏龜變大一點 */
const BIG = 1.12

/**
 * 「咻—叩」：警長一本正經地伸手（reach）走上前要握手 → 烏龜抖一下（預備）→「咻」地縮進殼（turtle-shell）→
 * 他撲空往前一栽、手「叩」地敲在硬殼上那一刻 💥＋白光＋鏡頭推近＋震＋同一個音效，傻眼停 HOLD 秒（看得見臉）。
 * at 是敲到的那一刻，k 是第幾次（越後面越大）。烏龜過一下再把頭腳伸出來由 out 控制（null：劇本自己寫）。
 * 嚇得跳多高、怎麼落地每次不同，寫在劇本裡；這裡只管那一下長得一樣。
 */
function knock(at: number, k: number, out: number | null = at + 1.0) {
  const w = at - PRE
  const tuck = at - 0.16
  const moves: Move[] = [
    { at: w, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at: w, actor: 'sheriff', do: 'moveTo', to: { x: RX, y: P }, dur: 0.38, ease: 'out' },
    // 烏龜抖一下：要縮了
    { at: tuck - 0.2, actor: 'turtle', do: 'shake', amount: 0.6 + 0.2 * k, dur: 0.18 },
    // 咻！縮進殼裡
    { at: tuck, actor: 'turtle', do: 'swap', emoji: 'prop:turtle-shell' },
    { at: tuck, actor: 'turtle', do: 'moveTo', to: { x: TX + SHELL_DX, y: T }, dur: 0.01 },
    // 撲空往前一栽，叩！
    { at: at - 0.12, actor: 'sheriff', do: 'moveTo', to: { x: LUNGE, y: P }, dur: 0.12, ease: 'in' },
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.25 },
    { at: at + 0.12, actor: 'sheriff', do: 'shake', amount: 0.8 + 0.2 * k, dur: HOLD - 0.12 },
    { at, actor: 'turtle', do: 'squash', amount: 0.12, dur: 0.2 },
  ]
  if (out !== null) moves.push(
    { at: out, actor: 'turtle', do: 'swap', emoji: 'prop:turtle' },
    { at: out, actor: 'turtle', do: 'moveTo', to: { x: TX, y: T }, dur: 0.01 },
  )
  const fx: Fx[] = [
    // 咻：縮進去那一下，殼口噴一小團
    { at: tuck, kind: 'puff', x: TX + HEAD.dx + 4, y: T + 4, dur: 0.35, scale: 1.4 },
    // 叩：💥 在敲到的地方上面，一次比一次大
    { at, kind: 'burst', ...BANG, n: 1, dur: 0.4, scale: 1.5 + 0.35 * k },
    { at, kind: 'burst', ...BANG, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: KNOCK.x - 4, y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（縮進去「咻」、敲到「叩」），一次比一次多疊一個
  const cues: Cue[] = [{ at: tuck, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'clink' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  if (out !== null) cues.push({ at: out, sfx: 'poof' })
  return { moves, fx, camera, cues, tuck }
}

const H1 = 1.55, H2 = 3.75, H3 = 6.55
const k1 = knock(H1, 0)
const k2 = knock(H2, 1)
const k3 = knock(H3, 2, H3 + 0.3)
/** 嚇得跳起來的時刻 */
const F1 = H1 + HOLD, F2 = H2 + HOLD, F3 = H3 + HOLD
/** 國字拼好、放大到正中央 */
const HOME = 7.3
/** 讓位 */
const PARK = 8.3
/** 國字放大時烏龜站起來的地方（字的右邊）與放大的倍率（站起來跟字差不多高） */
const SIDE = { x: 144, y: 44 }
const STAND = 1.25
/** 回馬槍：伸手、烏龜縮進去（他沒敲到），湊過去看——頭伸出來頂到他 */
const W4 = 9.3
const H4 = 10.25
const ASK = 10.85
const ANSWER = 13.6

/** 站起來的烏龜（順時針轉 90°、以中心為支點、放大 STAND 倍）身上的頭、前腳、殼（照 anim:shot 量的） */
const UP_HEAD = { x: 144, y: 19 }
const UP_LEGS = { x: 125, y: 42 }
const UP_SHELL = { x: 141, y: 55 }
/** 國字在正中央時，頭（0–1 筆）、腳（8–13 筆）、殼（14–17 筆）的位置 */
const G_HEAD = { x: 76.2, y: 21 }
const G_LEGS = { x: 63.9, y: 53.5 }
const G_SHELL = { x: 90.9, y: 51 }

const clip: Clip = {
  format: 2,
  char: '龜',
  meta: { theme: '警長要跟烏龜握手', cast: '狗狗警長＋大烏龜', gags: ['一本正經的警長每次伸手要跟烏龜握手，烏龜就咻地縮進殼裡，他撲空叩地敲到硬殼，嚇得一次比一次跳得高；回馬槍是他學乖了手停住沒敲到、得意地湊過去看殼裡，烏龜咻地把頭伸出來頂到他臉，他跳得最高'] },
  duration: 15,
  bg: { top: '#D6F2FF', bottom: '#F3FBFF', floor: '#C8DE8A', scenery: 'hills' },
  actors: [
    // 大烏龜圖朝左（面向左邊的警長），站在字框正下方；站起來時以自己中心轉
    { id: 'turtle', emoji: 'prop:turtle', x: TX, y: T, size: TS },
    // 姿勢圖朝左，翻過來面向右邊的烏龜
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 警長登場，指著上面的字框：龜！
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.35, ease: 'out' },
    { at: 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    // 敬個禮，一本正經
    { at: 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    // 第 1 次：咻——叩！跳起來，落地吹手
    ...k1.moves,
    { at: F1, actor: 'sheriff', do: 'moveTo', to: { x: 46, y: P }, arc: 14, dur: 0.45, ease: 'out' },
    { at: F1 + 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/blow' },
    { at: F1 + 0.5, actor: 'sheriff', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 2.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 2.85, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.2 },
    // 第 2 次：咻——叩！跳更高、轉一圈飛到畫面邊摔扁
    ...k2.moves,
    { at: F2, actor: 'sheriff', do: 'moveTo', to: { x: 14, y: P }, arc: 22, dur: 0.5, ease: 'out' },
    { at: F2, actor: 'sheriff', do: 'spin', times: -1, dur: 0.5, pivot: 'center' },
    { at: F2 + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    { at: 5.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 5.0, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.3 },
    // 第 3 次前停一拍：他背過身吹口哨假裝不看，倒退著偷偷靠近；烏龜盯著他
    { at: 5.3, actor: 'sheriff', do: 'flip' },
    { at: 5.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 5.4, actor: 'sheriff', do: 'moveTo', to: { x: 47, y: P }, dur: 0.4 },
    { at: 5.45, actor: 'turtle', do: 'tilt', amount: -5, dur: 0.4 },
    { at: 5.85, actor: 'sheriff', do: 'flip' },
    ...k3.moves,
    // ……叩！直接嚇得跳出畫面
    { at: F3, actor: 'sheriff', do: 'squash', amount: -0.2, dur: 0.12 },
    { at: F3, actor: 'sheriff', do: 'moveTo', to: { x: LUNGE - 6, y: -55 }, dur: 0.35, ease: 'out' },
    { at: F3, actor: 'sheriff', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 字拼好前烏龜走到右邊；國字放大時牠站起來、擺成跟字一樣的側面（頭朝上、腳在左、殼在右）
    { at: 6.9, actor: 'turtle', do: 'moveTo', to: { x: SIDE.x - 10, y: T }, dur: 0.4, ease: 'out' },
    { at: 7.35, actor: 'turtle', do: 'moveTo', to: SIDE, dur: 0.35, ease: 'back' },
    { at: 7.35, actor: 'turtle', do: 'rotateTo', amount: 90, dur: 0.35, ease: 'back', pivot: 'center' },
    { at: 7.35, actor: 'turtle', do: 'scaleTo', amount: STAND, dur: 0.35 },
    // 警長從天上掉回左邊，摔扁
    { at: 7.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 7.4, actor: 'sheriff', do: 'moveTo', to: { x: 22, y: -50 }, dur: 0.01 },
    { at: 7.45, actor: 'sheriff', do: 'moveTo', to: { x: 22, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 語詞那一刻：國字讓回上方，烏龜躺回來、走到正中間變大（烏龜）；警長爬起來
    { at: PARK, actor: 'turtle', do: 'rotateTo', amount: -90, dur: 0.25, pivot: 'center' },
    { at: PARK, actor: 'turtle', do: 'moveTo', to: { x: 130, y: T }, dur: 0.25 },
    { at: PARK, actor: 'turtle', do: 'scaleTo', amount: BIG / STAND, dur: 0.25 },
    { at: PARK + 0.25, actor: 'turtle', do: 'moveTo', to: { x: TX, y: T }, dur: 0.3, ease: 'out' },
    { at: 8.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 8.4, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.3 },
    { at: 8.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    { at: 8.85, actor: 'turtle', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍（第 4 次）：伸手——烏龜照樣咻地縮進去……
    { at: W4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at: W4, actor: 'sheriff', do: 'moveTo', to: { x: RX - 3, y: P }, dur: 0.38, ease: 'out' },
    { at: W4 + 0.3, actor: 'turtle', do: 'shake', amount: 1, dur: 0.18 },
    { at: W4 + 0.5, actor: 'turtle', do: 'swap', emoji: 'prop:turtle-shell' },
    { at: W4 + 0.5, actor: 'turtle', do: 'moveTo', to: { x: TX + SHELL_DX * BIG, y: T }, dur: 0.01 },
    // ……這次他手停住、沒敲到！得意
    { at: W4 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: W4 + 0.6, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.25 },
    // 湊過去看殼裡的眼睛
    { at: 9.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' },
    { at: 9.95, actor: 'sheriff', do: 'moveTo', to: { x: LUNGE - 1, y: P }, dur: 0.25, ease: 'out' },
    // 咻！頭伸出來頂到他的臉
    { at: H4, actor: 'turtle', do: 'swap', emoji: 'prop:turtle' },
    { at: H4, actor: 'turtle', do: 'moveTo', to: { x: TX, y: T }, dur: 0.01 },
    { at: H4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: H4, actor: 'sheriff', do: 'squash', amount: 0.5, dur: 0.25 },
    { at: H4 + 0.1, actor: 'sheriff', do: 'shake', amount: 1.6, dur: 0.25 },
    // 跳得最高，飛出畫面
    { at: H4 + 0.35, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: -60 }, dur: 0.3, ease: 'out' },
    { at: H4 + 0.35, actor: 'sheriff', do: 'spin', times: -3, dur: 0.3, pivot: 'center' },
    // 烏龜得意地走掉（暗下來之前離場）
    { at: H4 + 0.45, actor: 'turtle', do: 'flip' },
    { at: H4 + 0.45, actor: 'turtle', do: 'moveTo', to: { x: 200, y: T }, dur: 0.45, ease: 'linear' },
    // 問他：警長從天上掉到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: ASK + 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.55, dur: 0.01 },
    { at: ASK + 0.1, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.0, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 8, dur: 0.2 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 第 1 次：頭縮進去那一下，頭那組（上面）從頭飛出來
    { at: k1.tuck, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5], from: { x: TX + HEAD.dx, y: T + HEAD.dy }, color: partColor('龜') },
    // 第 2 次：腳縮進去，腳那組（左邊）從腳飛出來
    { at: k2.tuck, dur: 0.55, strokes: [8, 9, 10, 11, 12, 13], from: { x: TX + LEGS.dx, y: T + LEGS.dy }, color: partColor('龜') },
    // 第 3 次：叩在殼上，殼和背、尾巴那組從殼上飛出來
    { at: H3, dur: 0.55, strokes: [6, 7, 14, 15, 16, 17], from: { x: TX + SHELL.dx, y: T + SHELL.dy }, color: partColor('龜') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 頭、腳縮進去的地方各閃一下（筆畫從那裡飛出去）
    { at: k1.tuck - 0.05, kind: 'burst', x: TX + HEAD.dx, y: T + HEAD.dy, emoji: '✨', n: 1, dur: 0.4, scale: 1.2 },
    ...k1.fx,
    ...k2.fx,
    { at: k2.tuck - 0.05, kind: 'burst', x: TX + LEGS.dx, y: T + LEGS.dy, emoji: '✨', n: 1, dur: 0.4, scale: 1.2 },
    { at: F2 + 0.5, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    // 第 3 次前停一拍：烏龜盯著他
    { at: 5.45, kind: 'pop', actor: 'turtle', emoji: '👀', dx: -20, dy: 8, dur: 0.6, scale: 1.4 },
    ...k3.fx,
    // 國字放大：站起來的烏龜在旁邊，頭和頭、腳和腳、殼和殼一起閃一下——長得一樣
    ...([[UP_HEAD, G_HEAD], [UP_LEGS, G_LEGS], [UP_SHELL, G_SHELL]] as const).flatMap(([p, g], i) => [
      { at: 7.7 + 0.18 * i, kind: 'burst' as const, ...p, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
      { at: 7.7 + 0.18 * i, kind: 'burst' as const, ...g, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    ]),
    { at: 7.8, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    // 回馬槍：頭伸出來頂到他
    { at: W4 + 0.5, kind: 'puff', x: TX + HEAD.dx * BIG + 4, y: T + 4, dur: 0.35, scale: 1.4 },
    // 💥 在頭和他的臉中間偏上，不蓋住他傻眼的臉
    { at: H4, kind: 'burst', x: BANG.x - 2, y: BANG.y - 3, n: 1, dur: 0.45, scale: 2.6 },
    { at: H4, kind: 'burst', x: BANG.x - 2, y: BANG.y - 3, emoji: '⭐', n: 12, dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：警長每次都被嚇到跳高、跳出畫面，自動取景會追著他把烏龜切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...k1.camera,
    ...k2.camera,
    { at: F2 + 0.5, dur: 0.25, do: 'shake', amount: 1.2 },
    ...k3.camera,
    { at: 7.1, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.75, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.3, to: { x: KNOCK.x - 6, y: P - 8 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.6 },
  ],
  lights: [
    // 每次敲到白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '龜' },
    ...k1.cues,
    ...k2.cues,
    { at: F2 + 0.5, sfx: 'plop' },
    ...k3.cues,
    { at: 7.75, sfx: 'plop' },
    { at: HOME + 0.1, say: '龜' },
    { at: 8.85, say: '烏龜' },
    { at: W4 + 0.5, sfx: 'whoosh' },
    { at: H4, sfx: 'whoosh' },
    { at: H4 + 0.03, sfx: 'bonk' },
    { at: H4 + 0.06, sfx: 'boing' },
    { at: H4 + 0.1, sfx: 'crack' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '龜' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
