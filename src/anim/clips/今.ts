import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 今（v2）：豬探長賴床不想起來。太陽每次從地底下「噹」地彈出來——天亮了，今天到了！——光一照就把他從床上轟起來，一次比一次猛：
// 嚇得在床上跳起來（被子掀開飛上去變成「人」字頭）→ 被轟下床滾到地上（被子裡再飛出那一點）→ 先停一拍（太陽在地底下抖、他抱頭躲好）→ 連人帶床轟上天（太陽彈起來那一彎變成下面那一筆）。
// 他每次都爬起來把太陽按回地底下（天又暗了），得意地倒頭再睡。太陽出來＝今天，同一個畫面重複四次。
// 回馬槍：床飛走了，他乾脆把太陽按下去、直接睡在太陽出來的那個洞口上壓住它——太陽照樣「噹」地彈出來，把他頂上天，飛得最高。
// 最後畫面暗下來只剩「今」，豬探長從天上掉回來、轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「今！」，然後退場只留字。
// 今、今、今天、這是什麼字？、今
const P = 66.9 // 豬探長（size 24）站在地上的 y
/** 站在地上的 y */
const fy = (size: number) => 77 - 0.42 * size
/** 太陽每次都從同一個地方（畫面正中間、字框正下方）彈出來 */
const SUN_X = 80
/** 太陽一次比一次大：第 1、2、3 次、回馬槍 */
const SUN = [32, 37, 42, 48]
/** 太陽彈出來時頂端停在字框下緣（38），整個在字框下面、不擋字 */
const sunUp = (s: number) => ({ x: SUN_X, y: 38 + s - 0.42 * SUN[0] })
/** 太陽在地底下偷看：只露出頭頂一小塊 */
const sunPeek = (s: number) => ({ x: SUN_X, y: 67 + s - 0.42 * SUN[0] })
/** 太陽被按回地底下（整個在畫面外） */
const sunDown = (s: number) => ({ x: SUN_X, y: 96 + s - 0.42 * SUN[0] })
/** 床：在太陽右邊，豬探長站在床上伸手就按得到太陽 */
const BED = { x: 124, size: 34 }
/** 床墊的高度：豬探長躺在床上、站在床上，腳底都在這裡 */
const ON_BED = 61 - 0.42 * 24
/** 躺在床上睡（頭在左邊的枕頭上） */
const LIE = { x: 124, y: ON_BED }
/** 站在床上（左半邊），伸手往左按太陽 */
const STAND = { x: 109, y: ON_BED }
/** 被轟起來以後傻眼停多久 */
const HOLD = 0.45

/**
 * 「噹！今天到了」：太陽從地底下冒出頭頂、抖一抖（預備）→ 「噹」地彈出來（白光一閃、天亮了）→ 光一照，豬探長嚇得站起來傻眼，
 * 💥＋鏡頭推近＋震＋同一個音效，停 HOLD 秒。k 是第幾次（太陽越來越大、白光越來越亮、💥 越大），peek 是太陽偷看多久（第三次停一拍）。
 */
function pop(at: number, k: number, peek = 0.5) {
  const s = SUN[k]
  const hit = at + 0.1
  const moves: Move[] = [
    // 太陽還在地底下：先放大到這一次的大小，再冒出頭頂
    ...(k > 0 ? [{ at: at - peek - 0.05, actor: 'sun', do: 'scaleTo', amount: s / SUN[k - 1], dur: 0.01 }] as Move[] : []),
    { at: at - peek, actor: 'sun', do: 'moveTo', to: sunPeek(s), dur: 0.25, ease: 'out' },
    { at: at - 0.3, actor: 'sun', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.28 },
    // 噹！彈出來
    { at, actor: 'sun', do: 'moveTo', to: sunUp(s), dur: 0.14, ease: 'back' },
    { at, actor: 'sun', do: 'squash', amount: -0.22 - 0.05 * k, dur: 0.3 },
    // 光一照：嚇得站起來、傻眼
    { at: hit, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: hit, actor: 'pig', do: 'hop', amount: 4 + 2 * k, dur: 0.3 },
  ]
  const fx: Fx[] = [
    // 太陽四周噴出一圈光芒，一次比一次多
    { at, kind: 'burst', actor: 'sun', emoji: '🌟', n: 6 + 2 * k, dur: 0.45, scale: 1.2 + 0.2 * k },
    // 💥 每次都在豬探長身上同一個位置，一次比一次大
    { at: hit, kind: 'burst', actor: 'pig', n: 1, dur: 0.4, dx: -4, scale: 1.4 + 0.4 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: 104, y: 52 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 1 + 0.5 * k },
  ]
  // 天亮了：白光一閃，一次比一次亮
  const lights: Light[] = [
    { at, dur: 0.05, level: -(0.35 + 0.12 * k) },
    { at: at + 0.05, dur: 0.3, level: 0 },
  ]
  // 同一個音效（噹＋彈），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.3, sfx: 'rumble' }, { at, sfx: 'clink' }, { at: at + 0.03, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'crack' })
  return { moves, fx, camera, lights, cues, hit, after: hit + HOLD }
}

/**
 * 不要今天！豬探長伸手把太陽按回地底下（天又暗了），得意一下，倒頭再睡。from 是他按的時候站的地方。
 * 回傳的 moves 不含倒頭睡（每次睡的地方不一樣），sleep 是可以睡下去的時間。
 */
function pushDown(at: number, k: number, from: { x: number; y: number }) {
  const moves: Move[] = [
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/push' },
    { at, actor: 'pig', do: 'moveTo', to: from, dur: 0.12 },
    { at: at + 0.1, actor: 'sun', do: 'moveTo', to: sunDown(SUN[k]), dur: 0.35, ease: 'in' },
    { at: at + 0.1, actor: 'sun', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: at + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
  ]
  const lights: Light[] = [{ at: at + 0.15, dur: 0.35, level: 0.3 }]
  const cues: Cue[] = [{ at: at + 0.1, sfx: 'slide' }]
  return { moves, lights, cues, sleep: at + 0.65 }
}

/** 倒頭睡（床上或地上），頭上冒 zzz */
function sleep(at: number, to: { x: number; y: number }, zz = 0.8): { moves: Move[]; fx: Fx[] } {
  return {
    moves: [
      { at, actor: 'pig', do: 'moveTo', to, arc: 4, dur: 0.25 },
      { at: at + 0.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/sleep' },
    ],
    fx: [{ at: at + 0.3, kind: 'zzz', actor: 'pig', dur: zz, dx: -6 }],
  }
}

// 第 1 次：在床上跳起來
const p1 = pop(1.0, 0)
const d1 = pushDown(1.65, 0, STAND)
const s1 = sleep(d1.sleep, LIE)
// 第 2 次：被轟下床、趴在地上，爬回床上再按
const p2 = pop(3.0, 1)
const d2 = pushDown(4.6, 1, STAND)
const s2 = sleep(d2.sleep, LIE, 0.6)
// 第 3 次前停一拍：太陽在地底下抖、他抱頭躲好
const p3 = pop(6.25, 2, 0.75)
/** 字框填滿、國字到正中央 */
const HOME = 7.3
const PARK = 8.15
/** 語詞那一刻 */
const WORD = 8.4
/** 回馬槍：按下去、睡在洞口上 */
const D4 = 8.95
const P4 = 10.15
const d4 = pushDown(D4, 2, { x: 110, y: P })
const s4 = sleep(d4.sleep, { x: SUN_X, y: P }, 0.35)
/** 問他 */
const ASK = 10.5
const ANSWER = 13.45
/** 問他時豬探長站的地方（右前方，國字讓到左邊） */
const ASK_AT = { x: 128, y: P + 4 }

const clip: Clip = {
  format: 2,
  char: '今',
  meta: { theme: '豬探長賴床，太陽一直彈出來', cast: '豬探長＋太陽＋床', gags: ['豬探長賴床，太陽每次從地底下「噹」地彈出來（今天到了！）就把他轟起來，一次比一次猛（在床上跳起來→轟下床→連人帶床轟上天），他每次都把太陽按回地底下倒頭再睡；回馬槍是他直接睡在太陽出來的洞口上壓住它，結果被太陽頂上天、飛得最高'] },
  duration: 15,
  bg: { top: '#CFE8FF', bottom: '#FFF4D6', floor: '#C9E4B4', scenery: 'hills' },
  actors: [
    // 太陽（畫面正中間最大的東西）：一開始在地底下
    { id: 'sun', emoji: '🌞', x: SUN_X, y: sunDown(SUN[0]).y, size: SUN[0], pivot: 'center' },
    { id: 'bed', emoji: '🛏️', x: BED.x, y: fy(BED.size), size: BED.size, pivot: 'center' },
    // 豬探長躺在床上睡（頭在左邊的枕頭上、朝著太陽）
    { id: 'pig', emoji: 'hero:pig/sleep', x: LIE.x, y: LIE.y, size: 24 },
  ],
  moves: [
    // 第 1 次：在床上嚇得跳起來，傻眼——不要！伸手把太陽按回去，倒頭再睡
    ...p1.moves,
    { at: p1.after, actor: 'pig', do: 'swap', emoji: 'hero:pig/angry' },
    ...d1.moves,
    ...s1.moves,
    // 第 2 次：被轟下床，趴在地上
    ...p2.moves,
    { at: p2.after, actor: 'pig', do: 'moveTo', to: { x: 146, y: P }, arc: 8, dur: 0.4, ease: 'out' },
    { at: p2.after, actor: 'pig', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
    { at: p2.after + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: p2.after, actor: 'bed', do: 'shake', amount: 1.2, dur: 0.3 },
    // 爬起來，氣呼呼地跳回床上再按
    { at: 4.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/stomp' },
    { at: 4.2, actor: 'pig', do: 'hop', amount: 2, dur: 0.2 },
    { at: 4.35, actor: 'pig', do: 'moveTo', to: STAND, arc: 8, dur: 0.25 },
    ...d2.moves,
    ...s2.moves,
    // 第 3 次前停一拍：太陽在地底下抖，他知道要來了，抱頭躲好
    { at: 5.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: 5.85, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.4 },
    ...p3.moves,
    // 連人帶床轟上天
    { at: p3.after, actor: 'pig', do: 'moveTo', to: { x: 152, y: -40 }, arc: 6, dur: 0.6, ease: 'inOut' },
    { at: p3.after, actor: 'pig', do: 'spin', times: 2, dur: 0.6, pivot: 'center' },
    { at: p3.after, actor: 'bed', do: 'moveTo', to: { x: 205, y: 20 }, arc: 12, dur: 0.55, ease: 'out' },
    { at: p3.after, actor: 'bed', do: 'spin', times: 2, dur: 0.55 },
    // 太陽得意地跳到天上（左上角），國字到正中央
    { at: 6.98, actor: 'sun', do: 'moveTo', to: { x: 18, y: 30 }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 6.98, actor: 'sun', do: 'scaleTo', amount: 0.7, dur: 0.3 },
    // 豬探長從天上掉回來，頭暈坐在地上
    { at: 7.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 7.4, actor: 'pig', do: 'moveTo', to: { x: 134, y: -40 }, dur: 0.01 },
    { at: 7.42, actor: 'pig', do: 'moveTo', to: { x: 134, y: P }, dur: 0.3, ease: 'in' },
    // 語詞那一刻：太陽跳回正中間，豬探長站起來伸懶腰——今天！
    { at: PARK + 0.1, actor: 'sun', do: 'moveTo', to: sunUp(SUN[2]), arc: 4, dur: 0.3, ease: 'out' },
    { at: PARK + 0.1, actor: 'sun', do: 'scaleTo', amount: 1 / 0.7, dur: 0.3 },
    { at: PARK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: PARK, actor: 'pig', do: 'moveTo', to: { x: 110, y: P }, dur: 0.25 },
    { at: WORD, actor: 'pig', do: 'swap', emoji: 'hero:pig/yawn' },
    { at: WORD, actor: 'sun', do: 'squash', amount: -0.15, dur: 0.3 },
    // 回馬槍：還是不要！按下去，直接睡在洞口上壓住它
    ...d4.moves,
    ...s4.moves,
    { at: P4 - 0.3, actor: 'pig', do: 'shake', amount: 1.2, dur: 0.28 },
    { at: P4 - 0.31, actor: 'sun', do: 'scaleTo', amount: SUN[3] / SUN[2], dur: 0.01 },
    { at: P4, actor: 'sun', do: 'moveTo', to: sunUp(SUN[3]), dur: 0.14, ease: 'back' },
    { at: P4, actor: 'sun', do: 'squash', amount: -0.22, dur: 0.3 },
    { at: P4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 從太陽頂上彈到右邊半空，傻眼停一下（避開上面的字），再飛出畫面
    { at: P4, actor: 'pig', do: 'moveTo', to: { x: 116, y: 40 }, dur: 0.15, ease: 'out' },
    { at: P4 + 0.15, actor: 'pig', do: 'shake', amount: 1, dur: 0.3 },
    { at: P4 + 0.45, actor: 'pig', do: 'moveTo', to: { x: 150, y: -40 }, dur: 0.25, ease: 'in' },
    { at: P4 + 0.45, actor: 'pig', do: 'spin', times: 2, dur: 0.25, pivot: 'center' },
    // 太陽完成任務，沉回地底下（問他的時候畫面上只有國字和豬探長）
    { at: 10.55, actor: 'sun', do: 'moveTo', to: sunDown(SUN[3]), dur: 0.3, ease: 'in' },
    // 問他：豬探長從天上掉回右前方、變大，轉向觀眾
    { at: 10.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 10.85, actor: 'pig', do: 'moveTo', to: { x: ASK_AT.x, y: -40 }, dur: 0.01 },
    { at: 10.86, actor: 'pig', do: 'moveTo', to: ASK_AT, dur: 0.26, ease: 'in' },
    { at: 11.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 11.15, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 11.95, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
    // 退場：豬探長跑走，畫面只留下字
    { at: 13.68, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.68, actor: 'pig', do: 'flip' },
    { at: 13.7, actor: 'pig', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 第 1 次：被子（蓋子）掀開，飛上去變成「人」字頭
    { at: p1.hit + 0.05, dur: 0.55, strokes: [0, 1], from: 'bed', color: partColor('亼') },
    // 第 2 次：被轟下床，被子裡再飛出那一點（亼 的一）
    { at: p2.hit + 0.05, dur: 0.45, strokes: [2], from: 'bed', color: partColor('亼') },
    // 第 3 次：太陽「噹」地彈出來那一彎，變成下面那一筆
    { at: p3.hit + 0.05, dur: 0.5, strokes: [3], from: 'sun', color: partColor('乛') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的豬探長
    { at: ASK, dur: 3.45, do: 'ask', keep: ['pig'], to: { x: 64, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：還在睡
    { at: 0, kind: 'zzz', actor: 'pig', dur: 0.9, dx: -6 },
    ...p1.fx,
    ...s1.fx,
    ...p2.fx,
    { at: p2.after + 0.45, kind: 'dizzy', actor: 'pig', dur: 0.4 },
    ...s2.fx,
    // 第 3 次前停一拍
    { at: 5.9, kind: 'sweat', actor: 'pig' },
    ...p3.fx,
    // 語詞那一刻：太陽發光
    { at: WORD, kind: 'burst', actor: 'sun', emoji: '✨', n: 8, dur: 0.5, scale: 1.3 },
    ...s4.fx,
    // 回馬槍：太陽從他身子底下彈出來
    { at: P4, kind: 'burst', actor: 'sun', emoji: '🌟', n: 12, dur: 0.5, scale: 1.8 },
    { at: P4 + 0.02, kind: 'burst', x: 100, y: 50, n: 1, dur: 0.35, scale: 2.4 },
    { at: ANSWER, kind: 'burst', x: 64, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...p1.camera,
    ...p2.camera,
    // 第 3 次：自己固定鏡位（全景），連人帶床轟上天才看得到
    { at: 5.6, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...p3.camera,
    { at: 7.0, dur: 0.3, do: 'zoom', amount: 1 },
    // 回馬槍：全景，他被頂上天
    { at: 9.5, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    { at: P4 + 0.05, dur: 0.4, do: 'shake', amount: 2.8 },
    { at: 10.5, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 清晨：天還沒亮
    { at: 0, dur: 0.01, level: 0.3 },
    ...p1.lights,
    ...d1.lights,
    ...p2.lights,
    ...d2.lights,
    ...p3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...d4.lights,
    { at: P4, dur: 0.05, level: -0.5 },
    { at: P4 + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...p1.cues,
    { at: 1.0, say: '今' },
    ...d1.cues,
    ...p2.cues,
    { at: p2.after + 0.4, sfx: 'plop' },
    ...d2.cues,
    ...p3.cues,
    { at: HOME + 0.1, say: '今' },
    { at: WORD, say: '今天' },
    ...d4.cues,
    { at: P4 - 0.3, sfx: 'rumble' },
    { at: P4, sfx: 'clink' },
    { at: P4 + 0.03, sfx: 'boing' },
    { at: P4 + 0.07, sfx: 'bonk' },
    { at: P4 + 0.1, sfx: 'crack' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '今' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
