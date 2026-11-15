import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 很（v2）：狗狗警長巡邏了一整天，脫下一隻襪子，舉高「甩一甩」——「噗」一團綠色的臭氣飄出去，聞到的東西就「咚」地昏倒。
// 每次甩一下、同一團臭氣、同一個「噗」，只是一次比一次臭、飄得一次比一次遠、倒下的東西一次比一次大：
// 面前的小花垂頭倒下（彳）→ 飛過來的小鳥翻肚直直掉下來（艮的上半）→ 先停一拍：遠遠走來一隻大象，他看看大象、看看襪子，還是甩——大象僵住、轟地側躺昏倒（艮的下半）。
// 「很」＝程度一級一級加上去：很臭、很臭、很——臭。他每次都閉眼得意（他自己不覺得臭）。
// 回馬槍（第四次）：他不信邪，把襪子湊到自己鼻子前用力一聞——「噗」最大的一團臭氣在他臉上炸開，他整個綠掉、嚇得跳好高，落地昏倒。
// 最後畫面暗下來只剩「很」，警長跳到前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「很！」，然後退場只留字。
// 很、很、很臭、這是什麼字？、很
const SZ = 34
const P = 77 - 0.42 * SZ // 警長（size 34）站在地上的 y
/** 警長前三次站的地方（面向右邊） */
const SX = 26
/** 語詞那一刻、回馬槍時站的地方（倒下的小花右邊；跳起來往左上、落下來剛好壓在小花上，不碰上方的字框） */
const MX = 54
/** 小花、小鳥、大象 */
const FS = 18, FXX = 43, FY = 77 - 0.42 * FS
const BS = 18, BX = 104, BY = 53
const ES = 44, EX = 134, EY = 77 - 0.42 * ES
/** 襪子舉高時在哪（throw 姿勢舉起來的那隻手，翻過來朝右）：相對警長的位置 */
const UP = { dx: 12, dy: -17 }
/** 臭氣（白煙染成半透明的黃綠） */
const GREEN = 'brightness(0.88) sepia(1) saturate(3.2) hue-rotate(42deg) opacity(0.82)'
/** 聞到以後傻眼停多久 */
const HOLD = 0.45

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 甩一甩：舉起襪子（throw）、襪子抖兩下（預備）→「噗」一團綠色臭氣從襪子冒出來、邊飄邊變大，飄到 to（T 秒），停在對方鼻子前面（不蓋住對方）。
 * 他甩完就閉眼得意（smug，他不覺得臭）；臭氣到的那一刻對方身上冒臭味線，鏡頭推近那裡＋震＋同一個音效（一次比一次多疊一個）。
 * k 是第幾次（越後面越大），x 是他站的地方，sc 是臭氣飄到時的大小（倍率），hit 是被臭到的東西（臭味線、鏡頭對著那裡）。
 */
function wave(R: number, k: number, x: number, to: { x: number; y: number }, T: number, sc: number, hit: { x: number; y: number }): Gag {
  const hand = { x: x + UP.dx, y: P + UP.dy }
  const H = R + T
  const moves: Move[] = [
    { at: R - 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
    { at: R - 0.4, actor: 'sock', do: 'moveTo', to: hand, dur: 0.12 },
    { at: R - 0.3, actor: 'sock', do: 'shake', amount: 1.4 + 0.3 * k, dur: 0.3 },
    { at: R - 0.02, actor: 'cloud', do: 'moveTo', to: { x: hand.x + 3, y: hand.y - 2 }, dur: 0.01 },
    { at: R, actor: 'cloud', do: 'pop', dur: 0.2 },
    { at: R + 0.02, actor: 'cloud', do: 'moveTo', to, dur: T, ease: 'out' },
    { at: R + 0.02, actor: 'cloud', do: 'scaleTo', amount: sc, dur: T, ease: 'out' },
    { at: R + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: H + 0.45, actor: 'cloud', do: 'vanish', dur: 0.35 },
  ]
  const fx: Fx[] = [
    { at: H, kind: 'stink', x: hit.x, y: hit.y, dur: 1.2, scale: 1.3 + 0.4 * k },
  ]
  const camera: Camera[] = [
    { at: H, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: hit.x, y: Math.max(hit.y, 46) } },
    { at: H, dur: 0.3, do: 'shake', amount: 0.6 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at: R - 0.3, sfx: 'whoosh' }, { at: R, sfx: 'poof' }, { at: H, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: H + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: H + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 他睜開眼睛看到東西倒了：傻眼停住（看得見臉），再閉眼得意「不是我的襪子」 */
const shock = (at: number, back: number): Move[] => [
  { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.2 },
  { at: back, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
]

const R1 = 1.6, T1 = 0.3, H1 = R1 + T1
const R2 = 3.3, T2 = 0.45, H2 = R2 + T2
const R3 = 5.95, T3 = 0.55, H3 = R3 + T3
const g1 = wave(R1, 0, SX, { x: FXX - 3, y: FY - 11 }, T1, 1.1, { x: FXX, y: FY })
const g2 = wave(R2, 1, SX, { x: BX - 15, y: BY }, T2, 1.7, { x: BX, y: BY + 2 })
const g3 = wave(R3, 2, SX, { x: EX - 30, y: EY - 2 }, T3, 2.6, { x: EX - 4, y: EY + 4 })
/** 回馬槍：襪子湊到自己鼻子前；臭氣就在他臉上炸開 */
const R4 = 10.05
const NOSE = { x: MX + 7, y: P - 9 }

const clip: Clip = {
  format: 2,
  char: '很',
  meta: { theme: '狗狗警長的臭襪子', cast: '狗狗警長＋臭襪子＋小花／小鳥／大象', gags: ['狗狗警長脫下襪子甩一甩，「噗」一團綠色臭氣飄出去，聞到的東西就昏倒，一次比一次臭、一次比一次遠、一次比一次大（面前的小花垂頭倒下→飛過的小鳥翻肚掉下來→停一拍，遠遠的大象僵住轟地側躺）；回馬槍是他不信邪湊近自己聞，最大一團臭氣在臉上炸開，他嚇得跳好高、落地昏倒'] },
  duration: 15,
  // 淡黃天空、草地：綠色的臭氣跳得出來
  bg: { top: '#FFF1C9', bottom: '#FFFBEA', floor: '#C9E39A', scenery: 'hills' },
  actors: [
    { id: 'flower', emoji: '🌻', x: FXX, y: FY, size: FS },
    // 小鳥、大象共用一個角色（小鳥飛走以後換成大象走進來）
    { id: 'far', emoji: 'prop:swallow', x: 190, y: BY, size: BS, hidden: true, float: true },
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: SX, y: P, size: SZ, hidden: true, flip: true },
    { id: 'sock', emoji: 'prop:sock', x: SX + 6, y: P + 10, size: 13, hidden: true, float: true },
    { id: 'cloud', emoji: 'prop:smoke', x: SX, y: P, size: 14, hidden: true, float: true, tint: GREEN },
  ],
  moves: [
    // 警長巡邏一整天，走進來好累
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/tired' },
    // 抬頭看字框（唸第一聲）
    { at: 0.8, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 「啵」脫下一隻襪子
    { at: 1.0, actor: 'sock', do: 'pop', dur: 0.2 },
    { at: 1.0, actor: 'sock', do: 'moveTo', to: { x: SX + UP.dx, y: P + UP.dy }, arc: 6, dur: 0.25, ease: 'out' },
    { at: 1.0, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.2 },
    // 第 1 次：甩一甩——面前的小花聞到，垂頭倒下
    ...g1.moves,
    { at: H1, actor: 'flower', do: 'shake', amount: 1, dur: 0.15 },
    { at: H1 + 0.12, actor: 'flower', do: 'rotateTo', amount: -75, dur: 0.3, ease: 'in' },
    { at: H1 + 0.12, actor: 'flower', do: 'tint', filter: 'saturate(0.35) brightness(0.85)' },
    ...shock(H1 + 0.35, H1 + 0.35 + HOLD + 0.2),
    // 第 2 次：小鳥飛過來停在半空；甩一甩——小鳥翻肚、直直掉下來
    { at: 2.4, actor: 'far', do: 'pop', dur: 0.01 },
    { at: 2.4, actor: 'far', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.55, ease: 'out' },
    { at: 2.95, actor: 'far', do: 'hop', amount: 1.5, dur: 0.3 },
    ...g2.moves,
    { at: H2, actor: 'far', do: 'shake', amount: 1, dur: 0.15 },
    { at: H2 + 0.12, actor: 'far', do: 'rotateTo', amount: 180, dur: 0.15, pivot: 'center' },
    { at: H2 + 0.2, actor: 'far', do: 'moveTo', to: { x: BX, y: 77 - 0.42 * BS }, dur: 0.3, ease: 'in' },
    ...shock(H2 + 0.5, H2 + 0.5 + HOLD + 0.1),
    // 小鳥爬起來、暈頭轉向地飛走
    { at: 4.6, actor: 'far', do: 'rotateTo', amount: -180, dur: 0.15, pivot: 'center' },
    { at: 4.7, actor: 'far', do: 'moveTo', to: { x: 185, y: 20 }, dur: 0.35, ease: 'in' },
    // 第 3 次前停一拍：遠遠走來一隻大象（同一個角色換成大象）；他看看大象、看看襪子……還是甩
    { at: 5.06, actor: 'far', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: 5.06, actor: 'far', do: 'swap', emoji: 'prop:elephant' },
    { at: 5.06, actor: 'far', do: 'scaleTo', amount: ES / BS, dur: 0.01 },
    { at: 5.07, actor: 'far', do: 'moveTo', to: { x: 185, y: EY }, dur: 0.01 },
    { at: 5.1, actor: 'far', do: 'moveTo', to: { x: EX, y: EY }, dur: 0.55, ease: 'out' },
    { at: 5.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: 5.3, actor: 'sheriff', do: 'tilt', amount: 6, dur: 0.4 },
    ...g3.moves,
    // 大象僵住、轟地側躺昏倒（往左倒，不出畫面）
    { at: H3, actor: 'far', do: 'shake', amount: 1.2, dur: 0.2 },
    { at: H3 + 0.18, actor: 'far', do: 'rotateTo', amount: -90, dur: 0.3, ease: 'in' },
    ...shock(H3 + 0.5, 7.6),
    // 大象醒過來、搖搖晃晃跑掉（國字 home 到正中央之前）
    { at: 7.3, actor: 'far', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 7.5, actor: 'far', do: 'moveTo', to: { x: 205, y: EY }, dur: 0.35, ease: 'in' },
    { at: 7.9, actor: 'far', do: 'vanish', dur: 0.01 },
    // 語詞那一刻：國字讓位以後，他走到中間，把襪子舉到前面——很臭（襪子變大）
    { at: 8.65, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 8.65, actor: 'sheriff', do: 'moveTo', to: { x: MX, y: P }, dur: 0.3 },
    { at: 8.65, actor: 'sock', do: 'moveTo', to: { x: MX + 19, y: P - 6 }, dur: 0.3 },
    { at: 8.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at: 8.95, actor: 'sock', do: 'scaleTo', amount: 2, dur: 0.3, ease: 'back' },
    // 回馬槍（第 4 次）：他不信邪，閉眼把襪子湊到自己鼻子前用力一聞——噗！
    { at: 9.7, actor: 'sock', do: 'scaleTo', amount: 0.5, dur: 0.25 },
    { at: 9.7, actor: 'sock', do: 'moveTo', to: NOSE, dur: 0.25 },
    { at: 9.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: 9.8, actor: 'sheriff', do: 'squash', amount: -0.15, dur: 0.25 },
    { at: R4 - 0.02, actor: 'cloud', do: 'moveTo', to: { x: NOSE.x + 4, y: NOSE.y + 8 }, dur: 0.01 },
    { at: R4, actor: 'cloud', do: 'pop', dur: 0.15 },
    { at: R4 + 0.02, actor: 'cloud', do: 'scaleTo', amount: 2.0, dur: 0.2, ease: 'out' },
    { at: R4 + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/stinky' },
    { at: R4 + 0.05, actor: 'sheriff', do: 'tint', filter: 'sepia(0.6) saturate(3) hue-rotate(50deg)' },
    { at: R4 + 0.05, actor: 'sock', do: 'vanish', dur: 0.1 },
    { at: R4 + 1.0, actor: 'flower', do: 'vanish', dur: 0.1 },
    // 臭氣散開：看得到他整個綠掉、捏鼻子
    { at: R4 + 0.25, actor: 'cloud', do: 'moveTo', to: { x: NOSE.x - 16, y: NOSE.y - 6 }, dur: 0.3, ease: 'in' },
    { at: R4 + 0.25, actor: 'cloud', do: 'vanish', dur: 0.3 },
    // 嚇得跳好高（往左上，不碰上方的字框）……落地昏倒
    { at: R4 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: R4 + 0.6, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: P }, arc: 44, dur: 0.45, ease: 'inOut' },
    { at: R4 + 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 問他：警長爬起來，變大站到左前方，轉向觀眾
    { at: 11.3, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 11.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 11.3, actor: 'sheriff', do: 'scaleTo', amount: 1.4, dur: 0.3, ease: 'back' },
    { at: 11.3, actor: 'sheriff', do: 'moveTo', to: { x: 36, y: P + 2 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.1, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.6, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.55, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.1 },
    { at: 13.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 13.55, actor: 'sheriff', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: 13.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 13.7, actor: 'sheriff', do: 'flip' },
    { at: 13.7, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 2 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 第 1 次：倒下的小花身上掉出彳
    { at: H1 + 0.4, dur: 0.55, strokes: [0, 1, 2], from: 'flower', color: partColor('彳') },
    // 第 2 次：掉到地上的小鳥，艮的上半
    { at: H2 + 0.5, dur: 0.55, strokes: [3, 4, 5], from: 'far', color: partColor('艮') },
    // 第 3 次：轟地倒下的大象，艮的下半
    { at: H3 + 0.5, dur: 0.55, strokes: [6, 7, 8], from: 'far', color: partColor('艮') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park' },
    { at: 7.7, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.5, dur: 0.4, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: 11.05, dur: 2.8, do: 'ask', keep: ['sheriff'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 11.1, dur: 0.4, do: 'home' },
    { at: 13.55, dur: 0.3, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.55, kind: 'sweat', actor: 'sheriff' },
    { at: 1.0, kind: 'stink', actor: 'sock', dur: 0.6 },
    ...g1.fx,
    { at: H1 + 0.45, kind: 'dizzy', actor: 'flower', dur: 0.8 },
    { at: 2.45, kind: 'zzz', actor: 'far', emoji: '🎵', dx: -6, dur: 0.8 },
    ...g2.fx,
    { at: H2 + 0.5, kind: 'dizzy', actor: 'far', dur: 0.6 },
    // 第 3 次前停一拍：他看看大象、冒汗
    { at: 5.2, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: 2, dur: 0.5, scale: 1.3 },
    { at: 5.45, kind: 'sweat', actor: 'sheriff' },
    ...g3.fx,
    { at: H3 + 0.5, kind: 'dizzy', x: EX - 22, y: EY + 2, dur: 0.6, scale: 1.6 },
    // 語詞那一刻：襪子冒臭氣
    { at: 9.05, kind: 'stink', actor: 'sock', dur: 0.75, scale: 1.4 },
    // 回馬槍：臭氣在他臉上炸開
    { at: R4 + 0.1, kind: 'stink', x: NOSE.x - 4, y: NOSE.y + 2, dur: 0.8, scale: 2.2 },
    { at: R4 + 1.0, kind: 'dizzy', actor: 'sheriff', dur: 0.3 },
    { at: 13.55, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 整段保持幾乎全景（擋掉自動取景往前預看、把飛出去的東西切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 48 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: H3 + 0.48, dur: 0.35, do: 'shake', amount: 2 },
    { at: R4, dur: 0.45, do: 'punch', amount: 0.2, to: { x: NOSE.x, y: 46 } },
    { at: R4, dur: 0.35, do: 'shake', amount: 2.2 },
    { at: R4 + 1.0, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  lights: [
    { at: 7.7, dur: 0.05, level: -0.18 },
    { at: 7.75, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.85, say: '很' },
    { at: 1.0, sfx: 'plop' },
    ...g1.cues,
    { at: 2.45, sfx: 'blip' },
    ...g2.cues,
    { at: H2 + 0.5, sfx: 'bonk' },
    { at: 5.2, sfx: 'tap' },
    { at: 5.4, sfx: 'tap' },
    ...g3.cues,
    { at: H3 + 0.48, sfx: 'bonk' },
    { at: 7.85, say: '很' },
    { at: 9.05, say: '很臭' },
    { at: R4 - 0.3, sfx: 'whoosh' },
    { at: R4, sfx: 'poof' },
    { at: R4 + 0.04, sfx: 'boing' },
    { at: R4 + 0.08, sfx: 'rumble' },
    { at: R4 + 1.0, sfx: 'bonk' },
    { at: 11.08, say: FIXED_LINES.clipAsk },
    { at: 13.58, say: '很' },
    { at: 13.6, sfx: 'cheer' },
  ],
}

export default clip
