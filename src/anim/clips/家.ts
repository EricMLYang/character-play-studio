import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 家（v2）：浣熊花生抱著一大疊東西要回家——每次走到門口，那疊東西比門高，「咚」地撞上門框，房子一彈把他彈出來，一次比一次遠：
// 一屁股跌坐（宀 從被撞得一震的屋頂掉下來）、滾到畫面邊（豕的上半從屋裡震出來）、先停一拍再走過去，彈上天（豕的下半），連房子都被撞歪到一邊。
// 回馬槍：他學乖了，把東西全部放下、空手得意地走進門——結果卡住的是他自己圓滾滾的肚子，推呀推，房子一彈，他飛得最高、摔成一片。
// 最後畫面暗下來只剩「家」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「家！」，然後退場只留字。
// 家、家、回家、這是什麼字？、家
const P = 66.9 // 花生（size 24）站在地上的 y
/** 大房子（size 46） */
const HS = 46
const HY = 77 - 0.42 * HS
/** 房子平常在的地方（畫面中間偏右） */
const HX = 104
/** 第三次被撞歪到右邊 */
const HX_AWAY = 132
/** 門的左緣（3D 圖的門在房子左半邊） */
const DOOR = HX - 11.5
/** 前三次都走到同一個地方：那疊東西剛好頂到門框 */
const BUMP = DOOR + 2 - 7.5
/** 花生每次出發的地方 */
const HOME = 40
/** 疊在箱子上面那一包（📦，size 12）相對花生的位置 */
const PILE = { dx: 3.5, dy: -16 }
/** 撞到以後傻眼停多久，才被彈出去 */
const HOLD = 0.45
/** 撞到的地方：那疊東西頂到門框 */
const HIT = { x: DOOR + 2, y: 54 }
/** 語詞那一刻他放大多少 */
const BIG = 1.2

/** 花生和頭上那包一起走 */
function walk(at: number, x: number, dur: number, ease: Move['ease'] = 'inOut'): Move[] {
  return [
    { at, actor: 'raccoon', do: 'moveTo', to: { x, y: P }, dur, ease },
    { at, actor: 'pile', do: 'moveTo', to: { x: x + PILE.dx, y: P + PILE.dy }, dur, ease },
  ]
}

/** 重新抱起一大疊：換抱箱子的姿勢，頂上那包從上面掉回來疊好 */
function pickUp(at: number, x: number): Move[] {
  return [
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at, actor: 'pile', do: 'moveTo', to: { x: x + PILE.dx, y: P + PILE.dy - 12 }, dur: 0.01 },
    { at: at + 0.02, actor: 'pile', do: 'pop', dur: 0.12 },
    { at: at + 0.02, actor: 'pile', do: 'moveTo', to: { x: x + PILE.dx, y: P + PILE.dy }, dur: 0.18, ease: 'bounce' },
  ]
}

/**
 * 「咚—啵」：花生往前一頂（預備：身體往後仰、拉長）→ 頂到門框那一刻 💥、房子被擠扁、鏡頭推近＋震、同一個音效，
 * 那一包和箱子噴散（📦 一圈），他傻眼停 HOLD 秒（看得見臉），房子「啵」地彈回原狀把他彈出去。k 是第幾次（越後面越大）。
 * 第 4 次（carry: false）他空手：肚子卡在門口（推的姿勢）推呀推，才「啵」。
 */
function bump(at: number, k: number, carry = true) {
  const moves: Move[] = [
    // 房子被擠扁，再啵地彈回來
    { at, actor: 'house', do: 'squash', amount: 0.1 + 0.04 * k, dur: 0.3 },
    { at, actor: 'house', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.3 },
    // 傻眼
    { at: at + 0.08, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: at + 0.08, actor: 'raccoon', do: 'squash', amount: 0.18 + 0.06 * k, dur: 0.25 },
    { at: at + HOLD, actor: 'house', do: 'squash', amount: -(0.12 + 0.05 * k), dur: 0.28 },
  ]
  if (carry) moves.push(
    // 預備：身體往後仰一下，再往前一頂
    { at: at - 0.3, actor: 'raccoon', do: 'tilt', amount: -8, dur: 0.22 },
    { at: at - 0.3, actor: 'raccoon', do: 'squash', amount: -0.12, dur: 0.25 },
    // 那一包和箱子噴散
    { at: at + 0.08, actor: 'pile', do: 'vanish', dur: 0.08 },
  )
  const hit = carry ? HIT : { x: DOOR + 4, y: 67 }
  const fx: Fx[] = [
    // 💥 每次都在同一個地方（頂到門框），一次比一次大
    { at, kind: 'burst', x: hit.x, y: hit.y, n: 1, dur: 0.35, scale: carry ? 1.4 + 0.3 * k : 1.9 },
  ]
  if (carry) fx.push({ at: at + 0.08, kind: 'burst', x: HIT.x - 6, y: HIT.y + 2, emoji: '📦', n: 5 + k, dur: 0.5, scale: 1.6 + 0.2 * k })
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.03 * k, to: { x: hit.x - 4, y: k >= 3 ? 50 : P } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效（咚＋啵），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'bonk' }, { at: at + HOLD, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + HOLD + 0.04, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.06, sfx: 'clink' })
  return { moves, fx, camera, cues }
}

const H1 = 1.55, H2 = 3.45, H3 = 5.95, H4 = 9.85
const b1 = bump(H1, 0)
const b2 = bump(H2, 1)
const b3 = bump(H3, 2)
const b4 = bump(H4, 3, false)
/** 傻眼完，被彈出去的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD, R4 = H4 + HOLD
/** 第四次：放大以後，肚子剛好卡在門口的地方 */
const STUCK = DOOR - 7
/** 東西放下來堆在左邊 */
const DUMP = 20
/** 語詞那一刻他站的地方 */
const WORD = 50

const clip: Clip = {
  format: 2,
  char: '家',
  meta: { theme: '浣熊花生抱太多東西回家', cast: '浣熊花生＋大房子＋一包東西', gags: ['花生抱著一大疊東西要回家，每次走到門口那疊東西就咚地撞上門框，房子一彈把他彈出來，一次比一次遠（跌坐、滾到畫面邊、彈上天）；回馬槍是他把東西全放下空手進門，卡住的是自己的圓肚子，房子一彈飛得最高'] },
  duration: 15,
  bg: { top: '#CFE8FF', bottom: '#F3F9FF', floor: '#9ED37A', scenery: 'hills' },
  actors: [
    { id: 'house', emoji: '🏠', x: HX, y: HY, size: HS },
    // 姿勢圖朝左，翻過來面向右邊的房子（問他時也面向右邊的字）
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 疊在箱子最上面的那一包（比門還高）
    { id: 'pile', emoji: '📦', x: HOME + PILE.dx, y: P + PILE.dy, size: 12, hidden: true, float: true },
  ],
  moves: [
    // 花生抱著一大疊東西登場：回家囉！
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0, actor: 'pile', do: 'enter', from: { x: -25 + PILE.dx, y: P + PILE.dy }, dur: 0.45, ease: 'out' },
    // 第 1 次：走到門口——咚！傻眼；啵，一屁股跌坐
    ...walk(0.9, BUMP, 0.65),
    ...b1.moves,
    { at: R1, actor: 'raccoon', do: 'moveTo', to: { x: HOME + 6, y: P }, arc: 8, dur: 0.3, ease: 'out' },
    { at: R1 + 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/fall' },
    // 第 2 次：抱起來再走過去——咚！啵，彈得更遠，滾到畫面邊
    ...pickUp(2.55, HOME + 6),
    ...walk(2.75, BUMP, 0.6),
    ...b2.moves,
    { at: R2, actor: 'raccoon', do: 'moveTo', to: { x: 16, y: P }, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'raccoon', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: R2 + 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 第 3 次：抱起來走回同一個地方——先停一拍：看一眼門、房子晃一下……咚！
    ...pickUp(4.6, 16),
    ...walk(4.8, BUMP, 0.55),
    { at: 5.45, actor: 'house', do: 'tilt', amount: -4, dur: 0.3 },
    ...b3.moves,
    // 啵！彈上天（往左上飛出畫面），房子也被撞歪到右邊
    { at: R3, actor: 'raccoon', do: 'moveTo', to: { x: 20, y: -45 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'raccoon', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    { at: R3, actor: 'house', do: 'moveTo', to: { x: HX_AWAY, y: HY }, dur: 0.4, ease: 'out' },
    { at: R3, actor: 'house', do: 'tilt', amount: 8, dur: 0.4 },
    // 掉回來
    { at: 6.95, actor: 'raccoon', do: 'moveTo', to: { x: 30, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'raccoon', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 語詞那一刻：國字讓回上方，房子蹦蹦跳回正中間；花生把東西全部放下（堆在左邊），開心地要回家
    { at: 8.35, actor: 'house', do: 'moveTo', to: { x: HX, y: HY }, arc: 6, dur: 0.4, ease: 'out' },
    { at: 8.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 8.35, actor: 'raccoon', do: 'scaleTo', amount: BIG, dur: 0.25, ease: 'back' },
    { at: 8.35, actor: 'raccoon', do: 'moveTo', to: { x: WORD, y: P }, dur: 0.3 },
    // 那一包又疊回他手上……他嘆口氣，全部丟到左邊
    { at: 8.35, actor: 'pile', do: 'moveTo', to: { x: WORD + PILE.dx * BIG, y: P + PILE.dy * BIG }, dur: 0.01 },
    { at: 8.36, actor: 'pile', do: 'pop', dur: 0.12 },
    { at: 8.36, actor: 'pile', do: 'scaleTo', amount: 16 / 12, dur: 0.01 },
    { at: 8.4, actor: 'pile', do: 'moveTo', to: { x: WORD + PILE.dx * BIG, y: P + PILE.dy * BIG }, dur: 0.25 },
    { at: 8.65, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 8.65, actor: 'pile', do: 'moveTo', to: { x: DUMP, y: 77 - 0.42 * 16 }, arc: 10, dur: 0.3, ease: 'in' },
    { at: 8.65, actor: 'pile', do: 'spin', times: -1, dur: 0.3 },
    { at: 8.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 8.85, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍（第 4 次）：空手得意地走進門——肚子卡住了，推呀推……啵！
    { at: 9.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
    { at: 9.15, actor: 'raccoon', do: 'moveTo', to: { x: STUCK, y: P }, dur: 0.3 },
    { at: 9.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/push' },
    { at: 9.45, actor: 'raccoon', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 9.5, actor: 'house', do: 'shake', amount: 0.6, dur: 0.3 },
    ...b4.moves,
    { at: R4, actor: 'raccoon', do: 'moveTo', to: { x: 24, y: -50 }, dur: 0.3, ease: 'out' },
    { at: R4, actor: 'raccoon', do: 'spin', times: -3, dur: 0.3, pivot: 'center' },
    // 問他：花生從天上掉回左前方、變大，轉向觀眾
    { at: 10.65, actor: 'raccoon', do: 'moveTo', to: { x: 34, y: -50 }, dur: 0.01 },
    { at: 10.66, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 10.66, actor: 'raccoon', do: 'scaleTo', amount: 1.5 / BIG, dur: 0.01 },
    { at: 10.7, actor: 'raccoon', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3, ease: 'in' },
    { at: 10.75, actor: 'house', do: 'vanish', dur: 0.3 },
    { at: 10.75, actor: 'pile', do: 'vanish', dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.95, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 6, dur: 0.25 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.72, actor: 'raccoon', do: 'flip' },
    { at: 13.75, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：屋頂被撞得一震，宀 從屋頂掉下來
    { at: H1 + 0.08, dur: 0.6, strokes: [0, 1, 2], from: { x: HX - 2, y: HY - 14 }, color: partColor('宀') },
    // 第 2、3 次：豕從屋裡（門口）震出來
    { at: H2 + 0.08, dur: 0.6, strokes: [3, 4, 5], from: { x: DOOR + 6, y: HY + 6 }, color: partColor('豕') },
    { at: H3 + 0.08, dur: 0.6, strokes: [6, 7, 8, 9], from: { x: DOOR + 6, y: HY + 6 }, color: partColor('豕') },
  ],
  glyph: [
    { at: 7.45, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.3, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: 10.6, dur: 3.35, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.65, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：回家囉！
    { at: 0.45, kind: 'pop', actor: 'raccoon', emoji: '😄', dx: -14, dur: 0.4, scale: 1.4 },
    ...b1.fx,
    { at: R1 + 0.3, kind: 'sweat', actor: 'raccoon' },
    ...b2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'raccoon', dur: 0.45 },
    // 第 3 次前停一拍：他看一眼門
    { at: 5.35, kind: 'pop', actor: 'raccoon', emoji: '👀', dx: -16, dy: 4, dur: 0.5, scale: 1.6 },
    ...b3.fx,
    { at: 7.3, kind: 'dizzy', actor: 'raccoon', dur: 0.6 },
    // 回家：房子冒愛心
    { at: 8.9, kind: 'burst', x: HX + 4, y: 50, emoji: '💕', n: 6, dur: 0.45, scale: 1.3 },
    // 卡住：流汗
    { at: 9.5, kind: 'sweat', actor: 'raccoon' },
    ...b4.fx,
    { at: R4 + 0.08, kind: 'burst', x: DOOR + 4, y: 60, emoji: '⭐', n: 8, dur: 0.45, scale: 1.6 },
    { at: 13.45, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    ...b4.camera,
    { at: R4, dur: 0.35, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: 7.45, dur: 0.05, level: -0.35 },
    { at: 7.5, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '家' },
    ...b1.cues,
    ...b2.cues,
    ...b3.cues,
    { at: 7.3, sfx: 'plop' },
    { at: 7.55, say: '家' },
    { at: 8.65, sfx: 'plop' },
    { at: 8.9, say: '回家' },
    { at: 9.5, sfx: 'slide' },
    ...b4.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '家' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
