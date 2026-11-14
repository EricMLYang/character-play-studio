import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 猴（v2）：一本正經的狗狗警長拿著一串香蕉，每次張大嘴要咬，吊在藤蔓上的猴子就「咻」地盪下來把香蕉搶走——他咬到空氣「喀」，嚇得跳好高，一次比一次高：
// 跳起來跌坐（犭從猴子身上跳出來）、跳更高轉一圈摔扁（香蕉一甩，甩出侯的左半）、先停一拍：他蹲低偷看猴子、猴子在晃……咻——嚇得直接跳出畫面（甩出侯的右半）。
// 每次搶完，調皮的猴子又把香蕉丟回給他。字拼好後猴子跳下來站在正中間抓頭裝沒事（猴子），又把香蕉丟回去；
// 回馬槍：猴子在地上，他放心地大口咬——猴子一跳抓住藤蔓、盪下來照樣搶走，他跳得最高。
// 最後畫面暗下來只剩「猴」，警長從天上掉到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「猴！」，然後退場只留字。
// 猴、猴、猴子、這是什麼字？、猴
const P = 66.9 // 警長（size 24）站在地上的 y
/** 警長每次站的地方（面向右邊的猴子） */
const SX = 46
/** 吊著的猴子（prop:monkey-hang，畫面上最大）；圖朝右，翻過來面向左邊的警長 */
const MS = 44
/** 猴子平常吊著的地方（字框右邊） */
const REST = { x: 134, y: 44 }
/** 藤蔓掛在畫面外右上角 */
const VINE = { x: 178, y: 4 }
/** 藤蔓接在猴子抓樹枝的那隻手（照 monkey-hang 的 x、y 算） */
const HAND = { dx: 2, dy: -16 }
/** 香蕉（prop:banana）在猴子另一隻手（照猴子的 x、y 算） */
const GRAB = { dx: -13.5, dy: 8.5 }
/** 香蕉拿在警長手上、送到嘴邊的位置 */
const HOLD_AT = { x: SX + 6, y: P - 1 }
const MOUTH = { x: SX + 6, y: P - 5 }
/** 搶到的那一刻猴子在哪裡：香蕉剛好在牠手上 */
const HIT = { x: MOUTH.x - GRAB.dx, y: MOUTH.y - GRAB.dy }
/** 站著的猴子（prop:monkey）：語詞那一刻在正中間 */
const MG = 38
const MGY = 77 - 0.42 * MG
const MID = 84
/** 咬到空氣以後傻眼停多久，才嚇得跳起來 */
const HOLD = 0.42
const BAN = 11

/** 猴子在 at 時吊在 from，香蕉跟著牠的手 */
const banAt = (m: { x: number; y: number }) => ({ x: m.x + GRAB.dx, y: m.y + GRAB.dy })

/**
 * 「咻—喀」：警長張大嘴把香蕉送到嘴邊（eat）；猴子先晃一下（預備）→ 咻地盪下來，香蕉到牠手上 →
 * 他咬到空氣那一刻 💥＋白光＋鏡頭推近＋震＋同一個音效，傻眼停 HOLD 秒（看得見臉）；猴子帶著香蕉盪回 from。
 * at 是咬空的那一刻，k 是第幾次（越後面越大）。之後怎麼跳、跳多高寫在劇本裡；這裡只管那一下長得一樣。
 */
function snatch(at: number, k: number, from = REST) {
  const moves: Move[] = [
    // 要吃了：張大嘴，香蕉送到嘴邊
    { at: at - 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/eat' },
    { at: at - 0.4, actor: 'banana', do: 'moveTo', to: MOUTH, dur: 0.15 },
    // 猴子晃一下（預備），咻地盪下來
    { at: at - 0.55, actor: 'monkey', do: 'shake', amount: 0.8 + 0.2 * k, dur: 0.25 },
    { at: at - 0.24, actor: 'monkey', do: 'moveTo', to: HIT, dur: 0.24, ease: 'in' },
    // 搶到！帶著香蕉盪回去
    { at: at + 0.02, actor: 'monkey', do: 'moveTo', to: from, dur: 0.36, ease: 'out' },
    { at: at + 0.02, actor: 'banana', do: 'moveTo', to: banAt(from), dur: 0.36, ease: 'out' },
    // 喀——咬到空氣，傻眼
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.25 },
    { at: at + 0.12, actor: 'sheriff', do: 'shake', amount: 0.6 + 0.2 * k, dur: HOLD - 0.12 },
    // 猴子吊在那裡得意地晃（偷笑）
    { at: at + 0.42, actor: 'monkey', do: 'hop', amount: 2, dur: 0.22 },
    { at: at + 0.66, actor: 'monkey', do: 'hop', amount: 2, dur: 0.22 },
  ]
  const fx: Fx[] = [
    // 咻：盪下來的風
    { at: at - 0.2, kind: 'swoosh', actor: 'sheriff', target: 'monkey', dx: 4, dy: -4, n: 13, sweep: 90, dur: 0.25, scale: 1 + 0.1 * k, width: 1.6 },
    // 喀：💥 在他嘴前面（一次比一次大）
    { at, kind: 'burst', x: MOUTH.x + 3, y: MOUTH.y - 6, n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
    { at, kind: 'burst', x: MOUTH.x + 3, y: MOUTH.y - 6, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: MOUTH.x + 6, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（咻、喀），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.24, sfx: 'whoosh' }, { at, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 調皮的猴子把香蕉丟回給他：他伸手接住，眼睛發亮 */
function giveBack(at: number, from: { x: number; y: number }) {
  const moves: Move[] = [
    { at, actor: 'banana', do: 'moveTo', from, to: HOLD_AT, arc: 12, dur: 0.38, ease: 'inOut' },
    { at, actor: 'banana', do: 'spin', times: 1, dur: 0.38 },
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/hug' },
    { at: at + 0.38, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
  ]
  return { moves, cues: [{ at: at + 0.38, sfx: 'tap' }] as Cue[] }
}

const H1 = 1.75, H2 = 3.85, H3 = 6.45, H4 = 10.2
const s1 = snatch(H1, 0)
const s2 = snatch(H2, 1)
const s3 = snatch(H3, 2)
/** 第 4 次：猴子從地上一跳抓住藤蔓，從比較高的地方盪下來，搶完直接盪出右邊 */
const TOP4 = REST
const s4 = snatch(H4, 3, TOP4)
const g1 = giveBack(2.95, banAt(REST))
const g2 = giveBack(5.15, banAt(REST))
/** 國字拼好、放大到正中央 */
const HOME = 7.55
const PARK = 8.4
/** 問他 */
const ASK = 10.75
const ANSWER = 13.6
/** 語詞那一刻：猴子跳下來站在正中間，把香蕉丟回去 */
/** 站著的猴子把香蕉抱在身邊 */
const STAND_BAN = { x: MID - 11, y: MGY + 6 }
const g3 = giveBack(9.15, STAND_BAN)

const clip: Clip = {
  format: 2,
  char: '猴',
  meta: { theme: '猴子搶警長的香蕉', cast: '狗狗警長＋猴子＋香蕉', gags: ['警長每次張嘴要咬香蕉，猴子就從藤蔓盪下來搶走，他咬到空氣嚇得跳起來，一次比一次高；回馬槍是猴子跳下來站在地上裝沒事，他放心大口咬，猴子一跳抓住藤蔓照樣盪下來搶走，他跳得最高'] },
  duration: 15,
  bg: { top: '#DDF0D0', bottom: '#F6FBEF', floor: '#B5D88A', scenery: 'forest' },
  actors: [
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: P, size: 24, hidden: true, flip: true },
    { id: 'monkey', emoji: 'prop:monkey-hang', x: REST.x, y: REST.y, size: MS, flip: true, float: true },
    { id: 'banana', emoji: 'prop:banana', x: HOLD_AT.x, y: HOLD_AT.y, size: BAN, float: true, hidden: true },
  ],
  moves: [
    // 警長拿著香蕉走進來，抬頭指著字框：猴！
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0, actor: 'banana', do: 'enter', from: { x: -25 + 6, y: HOLD_AT.y }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 0.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    // 第 1 次：咻——喀！嚇得跳起來，跌坐
    ...s1.moves,
    { at: H1 + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: H1 + HOLD, actor: 'sheriff', do: 'hop', amount: 14, dur: 0.45 },
    { at: H1 + HOLD + 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },
    // 猴子把香蕉丟回來
    ...g1.moves,
    // 第 2 次：咻——喀！跳更高、轉一圈、摔扁
    ...s2.moves,
    { at: H2 + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: H2 + HOLD, actor: 'sheriff', do: 'hop', amount: 26, dur: 0.6 },
    { at: H2 + HOLD, actor: 'sheriff', do: 'spin', times: -1, dur: 0.6, pivot: 'center' },
    { at: H2 + HOLD + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    ...g2.moves,
    // 第 3 次前停一拍：他蹲低偷看猴子，猴子吊在那裡一直晃
    { at: 5.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' },
    { at: 5.65, actor: 'monkey', do: 'tilt', amount: -8, dur: 0.35 },
    { at: 5.75, actor: 'sheriff', do: 'tilt', amount: 6, dur: 0.35 },
    ...s3.moves,
    // ……咻——喀！嚇得直接跳出畫面
    { at: H3 + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: H3 + HOLD, actor: 'sheriff', do: 'squash', amount: -0.25, dur: 0.12 },
    { at: H3 + HOLD, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: -55 }, dur: 0.35, ease: 'out' },
    { at: H3 + HOLD, actor: 'sheriff', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 國字放大時他從天上掉回來，摔扁
    { at: 7.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 7.7, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: -50 }, dur: 0.01 },
    { at: 7.75, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: P }, dur: 0.3, ease: 'in' },
    { at: 8.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 語詞那一刻：國字讓回上方，猴子放開藤蔓跳到正中間，站著抓頭壞笑（猴子）
    // （先在右邊直直落地，再跳到中間，不從國字前面經過）
    { at: PARK, actor: 'monkey', do: 'moveTo', to: { x: REST.x, y: MGY }, dur: 0.2, ease: 'in' },
    { at: PARK, actor: 'banana', do: 'moveTo', to: { x: REST.x - 11, y: MGY + 6 }, dur: 0.2, ease: 'in' },
    { at: PARK + 0.2, actor: 'monkey', do: 'swap', emoji: 'prop:monkey' },
    { at: PARK + 0.2, actor: 'monkey', do: 'scaleTo', amount: MG / MS, dur: 0.01 },
    { at: PARK + 0.22, actor: 'monkey', do: 'moveTo', to: { x: MID, y: MGY }, arc: 6, dur: 0.3, ease: 'out' },
    { at: PARK + 0.22, actor: 'banana', do: 'moveTo', to: STAND_BAN, arc: 6, dur: 0.3, ease: 'out' },
    { at: 8.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 8.5, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.35 },
    { at: 8.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 8.92, actor: 'monkey', do: 'tilt', amount: -6, dur: 0.3 },
    // 又把香蕉丟回去；他看猴子在地上，放心了
    ...g3.moves,
    { at: 9.58, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: 9.58, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.2 },
    // 回馬槍（第 4 次）：猴子蹲一下、一跳抓住藤蔓——咻
    { at: 9.5, actor: 'monkey', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 9.65, actor: 'monkey', do: 'moveTo', to: TOP4, arc: 4, dur: 0.25, ease: 'out' },
    { at: 9.75, actor: 'monkey', do: 'swap', emoji: 'prop:monkey-hang' },
    { at: 9.75, actor: 'monkey', do: 'scaleTo', amount: MS / MG, dur: 0.01 },
    ...s4.moves,
    // ……喀！跳得最高，飛出畫面
    { at: H4 + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: H4 + HOLD, actor: 'sheriff', do: 'moveTo', to: { x: SX - 6, y: -60 }, dur: 0.3, ease: 'out' },
    { at: H4 + HOLD, actor: 'sheriff', do: 'spin', times: -3, dur: 0.3, pivot: 'center' },
    // 猴子帶著香蕉盪出右邊
    { at: H4 + 0.45, actor: 'monkey', do: 'moveTo', to: { x: 200, y: 10 }, dur: 0.3, ease: 'in' },
    { at: H4 + 0.45, actor: 'banana', do: 'moveTo', to: { x: 200 + GRAB.dx, y: 10 + GRAB.dy }, dur: 0.3, ease: 'in' },
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
    // 第 1 次：犭從猴子身上跳出來
    { at: H1 + 0.4, dur: 0.55, strokes: [0, 1, 2], from: 'monkey', color: partColor('犭') },
    // 第 2、3 次：猴子得意地甩香蕉，侯從香蕉上甩出來（左半、右半）
    { at: H2 + 0.4, dur: 0.5, strokes: [3, 4, 5, 6], from: 'banana', color: partColor('侯') },
    { at: H3 + 0.4, dur: 0.55, strokes: [7, 8, 9, 10, 11], from: 'banana', color: partColor('侯') },
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
    // 藤蔓：從畫面外右上角垂到猴子抓樹枝的手（猴子跳到地上時放開）
    { at: 0, dur: PARK + 0.05, kind: 'line', actor: 'monkey', dx: HAND.dx, dy: HAND.dy, to: VINE, color: '#5E7F2A', width: 1.4 },
    { at: 9.76, dur: H4 + 0.75 - 9.76, kind: 'line', actor: 'monkey', dx: HAND.dx, dy: HAND.dy, to: VINE, color: '#5E7F2A', width: 1.4 },
    ...s1.fx,
    { at: H1 + HOLD + 0.5, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    ...s2.fx,
    { at: H2 + HOLD + 0.6, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    // 第 3 次前停一拍：偷看、冒汗
    { at: 5.65, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: 8, dy: 2, dur: 0.55, scale: 1.6 },
    { at: 5.75, kind: 'sweat', actor: 'sheriff' },
    ...s3.fx,
    { at: 8.05, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    ...s4.fx,
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：猴子在右上、警長會跳出畫面，自動取景會追著一個把另一個切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 7.3, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 8.05, dur: 0.25, do: 'shake', amount: 1.2 },
    ...s4.camera,
  ],
  lights: [
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.45, say: '猴' },
    ...s1.cues,
    { at: H1 + HOLD + 0.45, sfx: 'plop' },
    ...g1.cues,
    ...s2.cues,
    { at: H2 + HOLD + 0.6, sfx: 'plop' },
    ...g2.cues,
    ...s3.cues,
    { at: 8.05, sfx: 'plop' },
    { at: HOME + 0.1, say: '猴' },
    { at: 8.9, say: '猴子' },
    ...g3.cues,
    ...s4.cues,
    { at: ASK + 0.35, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '猴' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
