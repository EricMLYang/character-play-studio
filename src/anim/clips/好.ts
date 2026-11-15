import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 好（v2）：右邊站著一隻好大的比讚大拇指。很有自信的豬探長每次對它有禮貌地鞠一個躬——大拇指往後一縮、彈起來大聲說「好！」，
// 就丟一個獎給他，一次比一次大、一次比一次重：一顆星星貼紙貼在胸口（他閉眼得意）→ 一面金牌掛上脖子，重得他彎腰直不起來 →
// 先停一拍（他斜眼看大拇指，大拇指縮得更低）、再鞠躬：一座大獎盃從天上掉進他手裡，舉在頭上腿都在抖。
// 星星變成「女」、金牌變成「子」飛上去，獎盃一到手整個字亮起來。
// 回馬槍：他什麼都沒做，只是「哈……啾！」打了一個大噴嚏，頭往前一甩——看起來像鞠躬，大拇指照樣「好！」，
// 天上掉下一座比他還大的超大獎盃，「咚」一聲把他震飛，整個人掉進獎盃裡只露出頭。
// 好、好、好、好、好棒、好、這是什麼字？、好
const S = 34
const P = 77 - 0.42 * S
/** 前三次都站在同一個地方鞠躬 */
const X = 34
/** 回馬槍時他站的地方（把獎盃放下以後走過來） */
const X4 = 62
/** 大拇指 */
const TS = 44
const TX = 128
const TY = 77 - 0.42 * TS
/** 大拇指的指尖：獎從這裡丟出去 */
const TIP = { x: TX + 3, y: TY - 18 }

/** 獎品落在他身上的位置 */
const STAR = { x: X + 4, y: P - 2 }
const MEDAL = { x: X + 4, y: P - 6 }
/** 彎腰時脖子往前低下去 */
const MEDAL_BENT = { x: X + 9, y: P + 4 }
const CUP = 18
const CUP_HELD = { x: X + 1, y: 77 - 0.84 * S - 0.42 * CUP + 2 }
/** 獎盃放在地上 */
const CUP_FLOOR = { x: 44, y: 77 - 0.42 * CUP }
/** 超大獎盃 */
const BIG = 54
const BX = 26
const BY = 77 - 0.42 * BIG
/** 掉進超大獎盃裡：身體在杯子裡、只露出頭 */
const INSIDE = { x: BX + 1, y: 27 }

type V = { x: number; y: number }

/**
 * 「好！」：他鞠一個躬 → 大拇指往後一縮（預備）→ 彈起來大聲「好！」＋✨＋嗶，
 * 獎從指尖丟過去、落在他身上那一刻鏡頭推近＋震＋同一個「叮」（一次比一次多疊一個音）。
 * k 是第幾次（0 星星、1 金牌、2 獎盃），wait 是鞠躬後大拇指多等多久（第三次停一拍）。回傳說「好」的那一刻 g 與落地 l。
 */
function good(s: number, k: number, wait = 0) {
  const w = s + 0.35 + wait
  const g = w + 0.25 + (k === 2 ? 0.15 : 0)
  const moves: Move[] = [
    // 有禮貌地鞠躬
    { at: s, actor: 'pig', do: 'swap', emoji: 'hero:pig/bow' },
    { at: s + 0.38, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 大拇指往下一縮、往後仰（預備），一次比一次縮得低
    { at: w, actor: 'thumb', do: 'squash', amount: 0.08 + 0.03 * k, dur: g - w + 0.05 },
    { at: w, actor: 'thumb', do: 'tilt', amount: 4 + 2 * k, dur: g - w + 0.05 },
    // 「好！」彈起來
    { at: g, actor: 'thumb', do: 'hop', amount: 5 + 1.5 * k, dur: 0.32 },
    { at: g, actor: 'prize', do: 'swap', emoji: ['⭐', '🥇', '🏆'][k] },
    { at: g, actor: 'prize', do: 'moveTo', to: TIP, dur: 0.01 },
    { at: g, actor: 'prize', do: 'pop', dur: 0.12 },
  ]
  let l: number
  if (k === 0) {
    l = g + 0.45
    moves.push(
      { at: g + 0.05, actor: 'prize', do: 'moveTo', to: STAR, dur: 0.4, arc: 14, ease: 'in' },
      { at: g + 0.05, actor: 'prize', do: 'rotateTo', amount: -360, dur: 0.4 },
      // 貼在胸口，閉眼得意
      { at: l, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
      { at: l, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
    )
  } else if (k === 1) {
    l = g + 0.45
    moves.push(
      { at: g + 0.02, actor: 'prize', do: 'scaleTo', amount: 13 / 9, dur: 0.01 },
      { at: g + 0.05, actor: 'prize', do: 'moveTo', to: MEDAL, dur: 0.4, arc: 18, ease: 'in' },
      { at: g + 0.05, actor: 'prize', do: 'rotateTo', amount: -360, dur: 0.4 },
      // 掛上脖子：好重！傻眼，接著被拉得彎腰直不起來
      { at: l, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: l, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: l + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/bow' },
      { at: l + 0.4, actor: 'prize', do: 'moveTo', to: MEDAL_BENT, dur: 0.15, ease: 'in' },
      { at: l + 0.55, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.4 },
    )
  } else {
    // 往天上丟，飛出畫面，再從他頭上掉下來
    l = g + 0.65
    moves.push(
      { at: g + 0.02, actor: 'prize', do: 'scaleTo', amount: CUP / 9, dur: 0.01 },
      { at: g + 0.05, actor: 'prize', do: 'moveTo', to: { x: TX - 20, y: -30 }, dur: 0.25, ease: 'out' },
      { at: g + 0.32, actor: 'prize', do: 'moveTo', to: { x: CUP_HELD.x, y: -30 }, dur: 0.01 },
      { at: l - 0.28, actor: 'prize', do: 'moveTo', to: CUP_HELD, dur: 0.28, ease: 'in' },
      // 他抬頭伸手接（舉高）——接到了，好重：整個人往下一沉、腿抖
      { at: l - 0.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
      { at: l, actor: 'pig', do: 'squash', amount: 0.42, dur: 0.5 },
      { at: l, actor: 'prize', do: 'hop', amount: -3, dur: 0.5 },
      { at: l + 0.5, actor: 'pig', do: 'shake', amount: 1, dur: 0.6 },
      { at: l + 0.5, actor: 'prize', do: 'shake', amount: 1, dur: 0.6 },
    )
  }
  const fx: Fx[] = [
    { at: g, kind: 'burst', x: TIP.x, y: TIP.y - 2, emoji: '✨', n: 6, dur: 0.45, scale: 1 + 0.2 * k },
    { at: l, kind: 'burst', x: k === 2 ? CUP_HELD.x : X + 4, y: k === 2 ? CUP_HELD.y : P - 6, emoji: '✨', n: 6, dur: 0.45, scale: 0.8 + 0.2 * k },
  ]
  // 星星貼紙輕輕的；金牌、獎盃重重的「咚」
  if (k >= 1) fx.push({ at: l, kind: 'burst', x: k === 2 ? CUP_HELD.x : X + 4, y: k === 2 ? CUP_HELD.y : P - 6, n: 1, dur: 0.4, scale: 1 + 0.3 * k })
  if (k >= 1) fx.push({ at: l + 0.3, kind: 'sweat', actor: 'pig', dur: 0.7 })
  const camera: Camera[] = [
    { at: l, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: X + 8, y: 52 } },
    { at: l, dur: 0.3, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一個「好！嗶——叮」，一次比一次多疊一個音
  const cues: Cue[] = [{ at: s + 0.02, sfx: 'tap' }, { at: g + 0.02, sfx: 'blip' }, { at: l, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: l + 0.03, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: l + 0.06, sfx: 'rumble' })
  return { g, l, moves, fx, camera, cues }
}

const g1 = good(0.4, 0)
const g2 = good(2.25, 1)
/** 第三次前停一拍：他斜眼看大拇指 */
const PAUSE = 4.45
const g3 = good(4.9, 2, 0.15)
const HOME = g3.l + 0.2
const PARK = HOME + 1.2
/** 語詞那一刻：大拇指跳到中間 */
const WORD = PARK + 0.5
/** 回馬槍 */
const HA = WORD + 0.6
const ACHOO = HA + 0.45
const G4 = ACHOO + 0.4
const L4 = G4 + 0.22
const OUT = L4 + 0.95
const ASK = 11.1
const ANSWER = 13.7

const clip: Clip = {
  format: 2,
  char: '好',
  meta: { theme: '豬探長鞠躬，大拇指說好給獎', cast: '豬探長＋比讚大拇指＋獎品', gags: ['豬探長每次對比讚大拇指鞠一個躬，大拇指就彈起來大聲說「好！」丟一個獎給他，一次比一次大、一次比一次重（星星貼紙 → 金牌重得他彎腰 → 停一拍、大獎盃從天上掉進手裡舉到腿抖）；回馬槍是他什麼都沒做、只打了一個噴嚏，頭一甩像鞠躬，大拇指照樣說「好！」，掉下一座比他還大的獎盃把他震進杯子裡'] },
  duration: 15,
  bg: { top: '#FFE9F0', bottom: '#FFF8F2', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    // 豬探長在超大獎盃前面先畫，掉進杯子裡時被杯子擋住、只露出頭
    { id: 'pig', emoji: 'hero:pig/walk', x: X, y: P, size: S, flip: true, hidden: true },
    { id: 'prize', emoji: '⭐', x: TIP.x, y: TIP.y, size: 9, hidden: true, float: true, pivot: 'center' },
    { id: 'big', emoji: '🏆', x: BX, y: BY, size: BIG, hidden: true },
    { id: 'thumb', emoji: '👍', x: TX, y: TY, size: TS, flip: true },
  ],
  moves: [
    // 開場：他走進來，看到大拇指
    { at: 0, actor: 'pig', do: 'enter', from: { x: -20, y: P }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 1 次：星星貼紙
    ...g1.moves,
    { at: g1.l + 0.45, actor: 'prize', do: 'vanish', dur: 0.15 },
    { at: g1.l + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 2 次：金牌
    ...g2.moves,
    { at: g2.l + 0.95, actor: 'prize', do: 'vanish', dur: 0.15 },
    { at: g2.l + 1.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 3 次前停一拍：他斜眼看大拇指（還要嗎？），大拇指扭一扭
    { at: PAUSE, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: PAUSE + 0.15, actor: 'thumb', do: 'tilt', amount: -6, dur: 0.35 },
    ...g3.moves,
    // 國字亮起來的時候他還舉著獎盃發抖；放到地上，喘一口氣，走到中間
    { at: PARK - 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: PARK - 0.45, actor: 'prize', do: 'moveTo', to: { x: X + 10, y: CUP_HELD.y + 4 }, dur: 0.15 },
    { at: PARK - 0.3, actor: 'prize', do: 'moveTo', to: CUP_FLOOR, dur: 0.35, arc: 6, ease: 'in' },
    { at: PARK + 0.1, actor: 'pig', do: 'moveTo', to: { x: X4, y: P }, dur: 0.35 },
    // 語詞那一刻：大拇指跳到中間，大大地比讚；他開心跳起來
    { at: WORD - 0.25, actor: 'thumb', do: 'moveTo', to: { x: 100, y: TY }, dur: 0.25, arc: 6, ease: 'out' },
    { at: WORD - 0.05, actor: 'thumb', do: 'scaleTo', amount: 1.12, dur: 0.25, ease: 'back' },
    { at: WORD, actor: 'thumb', do: 'bounce', amount: 4, times: 2, dur: 0.6 },
    { at: WORD, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: WORD + 0.05, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
    { at: WORD + 0.55, actor: 'thumb', do: 'moveTo', to: { x: TX, y: TY }, dur: 0.25, arc: 4 },
    { at: WORD + 0.55, actor: 'thumb', do: 'scaleTo', amount: 1 / 1.12, dur: 0.25 },
    // 回馬槍：什麼都沒做——鼻子癢，「哈……哈……」頭往後仰
    { at: HA - 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: HA, actor: 'pig', do: 'rotateTo', amount: -7, dur: 0.25 },
    { at: HA + 0.28, actor: 'pig', do: 'rotateTo', amount: -6, dur: 0.22 },
    // 「啾！」頭往前一甩（像鞠躬）
    { at: ACHOO, actor: 'pig', do: 'swap', emoji: 'hero:pig/sneeze' },
    { at: ACHOO, actor: 'pig', do: 'rotateTo', amount: 21, dur: 0.1 },
    { at: ACHOO + 0.25, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.15 },
    // 大拇指照樣「好！」
    { at: G4 - 0.3, actor: 'thumb', do: 'squash', amount: 0.1, dur: 0.35 },
    { at: G4 - 0.3, actor: 'thumb', do: 'tilt', amount: 10, dur: 0.35 },
    { at: G4, actor: 'thumb', do: 'hop', amount: 9, dur: 0.35 },
    // 他傻眼：我什麼都沒做啊？
    { at: G4 - 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 超大獎盃從天上掉下來，「咚」——地一震，把他震飛進杯子裡
    { at: G4 + 0.03, actor: 'big', do: 'drop', dur: 0.6 },
    { at: L4 + 0.02, actor: 'pig', do: 'moveTo', to: INSIDE, dur: 0.4, arc: 22, ease: 'in' },
    { at: L4 + 0.02, actor: 'pig', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    { at: L4 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: L4 + 0.45, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
    { at: L4 + 0.45, actor: 'big', do: 'squash', amount: 0.12, dur: 0.25 },
    // 大拇指縮回地底、獎盃「噗」地收起來，他跳出來
    { at: OUT - 0.1, actor: 'thumb', do: 'moveTo', to: { x: TX, y: 125 }, dur: 0.3, ease: 'in' },
    { at: OUT, actor: 'big', do: 'vanish', dur: 0.15 },
    { at: OUT, actor: 'prize', do: 'vanish', dur: 0.15 },
    // 問他：豬探長跳到左前方、變大，面向右邊的國字
    { at: OUT, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3, arc: 6, ease: 'in' },
    { at: OUT, actor: 'pig', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    { at: ASK + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 12.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.3, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.8, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.25, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 7, dur: 0.25 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ANSWER + 0.12, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.17, ease: 'in' },
  ],
  builds: [
    // 星星貼紙變成「女」、金牌變成「子」
    { at: g1.l + 0.4, dur: 0.55, strokes: [0, 1, 2], from: 'prize', color: partColor('女') },
    { at: g2.l + 0.9, dur: 0.55, strokes: [3, 4, 5], from: 'prize', color: partColor('子') },
  ],
  glyph: [
    // 獎盃一到手，整個字亮起來
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: HOME + 0.45, dur: 0.4, do: 'pulse' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.8, do: 'ask', keep: ['pig'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.1, kind: 'pop', actor: 'pig', emoji: '❓', dx: 4, dur: 0.5, scale: 1.2 },
    ...g3.fx,
    // 語詞：大拇指一圈星星
    { at: WORD, kind: 'burst', x: 100, y: 46, emoji: '🌟', n: 8, dur: 0.5, scale: 1.3 },
    // 噴嚏噴向大拇指
    { at: ACHOO, kind: 'burst', x: X4 + 14, y: P - 6, emoji: '💦', n: 5, dur: 0.4, scale: 1 },
    { at: G4, kind: 'burst', x: TIP.x, y: TIP.y - 2, emoji: '✨', n: 8, dur: 0.45, scale: 1.6 },
    { at: L4, kind: 'burst', x: BX, y: 70, n: 1, dur: 0.45, scale: 2.4 },
    { at: L4 + 0.45, kind: 'burst', x: INSIDE.x + 4, y: 19, emoji: '✨', n: 8, dur: 0.5, scale: 1.4 },
    { at: OUT, kind: 'burst', x: BX + 8, y: 50, emoji: '✨', n: 8, dur: 0.35, scale: 1.3 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 大拇指和豬探長都要一直在畫面裡：國字拼好前不讓自動取景推近到只剩一個
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    { at: L4, dur: 0.45, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.25 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'tap' },
    { at: g1.g, say: '好' },
    ...g1.cues,
    ...g2.cues,
    { at: g2.g, say: '好' },
    { at: PAUSE + 0.15, sfx: 'blip' },
    ...g3.cues,
    { at: g3.g, say: '好' },
    { at: HOME + 0.05, say: '好' },
    { at: WORD, say: '好棒' },
    { at: WORD + 0.05, sfx: 'cheer' },
    { at: HA, sfx: 'slide' },
    { at: ACHOO, sfx: 'achoo' },
    { at: G4 + 0.02, sfx: 'blip' },
    { at: G4, say: '好' },
    { at: L4, sfx: 'bonk' },
    { at: L4 + 0.03, sfx: 'rumble' },
    { at: L4 + 0.05, sfx: 'boing' },
    { at: L4 + 0.45, sfx: 'plop' },
    { at: OUT, sfx: 'poof' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '好' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
