import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 爸（v2）：舉高高。楊捷睿跑到爸爸面前伸手（抱我！），爸爸蹲低一撈、「嘿！」把他往天上一拋——「咻——」他飛上去，
// 掉下來爸爸「碰」地穩穩接住，他咯咯大笑、又伸手要再一次。同一個「伸手→拋→接住」，一次比一次高：
// 拋過爸爸頭頂（父的兩點從飛在半空的他身上飛出來）→ 拋到畫面頂、頭都出去了（父的交叉從爸爸接住的大手上飛出來）→
// 先停一拍：爸爸盯著上面、蹲馬步、用力憋氣發抖——拋出畫面頂，安靜一拍……「咻——」掉回來，接住那一下爸爸被壓得一沉（巴從落下來的他身上飛出來）。
// 語詞那一刻爸爸站在正中間，他抱著爸爸：「爸爸」。
// 回馬槍（第四次）：同樣伸手、拋出畫面——這次爸爸得意地秀起肌肉、閉著眼睛，忘了接！一抬頭嚇一跳——
// 他「咚」地剛好落在爸爸肩膀上騎著，兩個人一起大笑。他跳下來，爸爸揮揮手走出去。
// 最後畫面暗下來只剩「爸」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「爸！」，然後退場只留字。
// 爸、爸、爸爸、這是什麼字？、爸

/** 楊捷睿：站在爸爸左前方、面向右邊的爸爸（flip） */
const S = 34
const P = 77 - 0.42 * S
const YX = 52
/** 爸爸（道具圖 prop:dad*，朝左）：畫面正中間、最大 */
const DS = 52
const DY = 77 - 0.42 * DS
const DX = 88
/** 被爸爸捧在手上（dad-catch 的雙手在圖的 u 0.2～0.5、v 0.5：腳踩在手上） */
const HX = 67
const HY = DY - 0.42 * S
/** 被拋上去時走的直線（爸爸舉高的雙手中間） */
const AIR = 72
/** 騎在爸爸肩膀上：畫在爸爸後面（ride 在 dad 前面），下半身被爸爸的頭擋住，只露出上半身和舉高的手 */
const RIDE = { x: 91, y: 37.5 }
/** 字框在左上角：楊捷睿每次都往正上方飛，碰不到它 */
const FRAME = { x: 24, y: 21 }
const FRAME_K = 0.48
/** 接住那一下，效果冒在雙手旁邊（不蓋臉） */
const HANDS = { x: HX - 8, y: DY - 4 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/**
 * 「伸手→拋」：他伸手（抱我！）→ 爸爸蹲低（地上的他被一撈到手上；手上的他跟著一沉）→「嘿！」雙手往上一送，他咻地飛上去。
 * 回傳飛到最高的那一刻。
 */
function toss(T: number, k: number, peak: number, up: number, fromGround: boolean) {
  g.moves.push(
    { at: T - 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: T - 0.6, actor: 'yang', do: 'hop', amount: 2, dur: 0.22 },
    { at: T - 0.35, actor: 'dad', do: 'swap', emoji: 'prop:dad-catch' },
    fromGround
      ? { at: T - 0.35, dur: 0.22, actor: 'yang', do: 'moveTo', to: { x: HX, y: HY }, arc: 5 }
      : { at: T - 0.35, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: HX, y: HY + 2.5 } },
    { at: T - 0.3, dur: 0.3, actor: 'dad', do: 'squash', amount: 0.1 + 0.04 * k },
    // 拋！
    { at: T, actor: 'dad', do: 'swap', emoji: 'prop:dad-throw' },
    { at: T, dur: 0.25, actor: 'dad', do: 'squash', amount: -0.12 },
    { at: T, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: T, dur: up, actor: 'yang', do: 'moveTo', to: { x: AIR, y: peak }, ease: 'out' },
  )
  g.cues.push({ at: T, sfx: 'whoosh' })
  return T + up
}

/** 「咻——碰」：掉回爸爸手上，爸爸穩穩接住（一次比一次沉），他咯咯大笑。回傳接住的那一刻 */
function fall(F: number, k: number, down: number) {
  const C = F + down
  g.moves.push(
    { at: F - 0.15, actor: 'dad', do: 'swap', emoji: 'prop:dad-catch' },
    { at: F, dur: down, actor: 'yang', do: 'moveTo', to: { x: HX, y: HY }, ease: 'in' },
    { at: C, dur: 0.3 + 0.12 * k, actor: 'dad', do: 'squash', amount: 0.12 + 0.12 * k },
    { at: C, dur: 0.25, actor: 'yang', do: 'squash', amount: 0.2 },
    { at: C, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
  )
  if (k >= 2) g.moves.push({ at: C, dur: 0.35, actor: 'dad', do: 'shake', amount: 1 })
  g.fx.push(
    { at: C, kind: 'burst', x: HANDS.x, y: HANDS.y, emoji: '✨', n: 5 + 2 * k, dur: 0.5, scale: 1.2 + 0.25 * k },
  )
  if (k >= 2) g.fx.push({ at: C, kind: 'puff', actor: 'dad', dx: 0, dy: 24, dur: 0.5, scale: 1.4 })
  g.camera.push(
    { at: C, dur: 0.4, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: HX + 4, y: 46 } },
    { at: C, dur: 0.3, do: 'shake', amount: 0.6 + 0.45 * k },
  )
  // 同一個「碰」，一次比一次多疊一個音
  g.cues.push({ at: C, sfx: 'plop' })
  if (k >= 1) g.cues.push({ at: C + 0.05, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: C + 0.1, sfx: 'bonk' })
  return C
}

// 第 1 次：拋過爸爸頭頂
const T1 = 1.3
const P1 = toss(T1, 0, 26, 0.3, true)
const C1 = fall(P1 + 0.1, 0, 0.3)
// 第 2 次：拋到畫面頂，頭都飛出去了（轉一圈）
const T2 = 2.85
const P2 = toss(T2, 1, -4, 0.38, false)
const C2 = fall(P2 + 0.14, 1, 0.4)
// 第 3 次前停一拍：爸爸盯著上面、蹲馬步憋氣發抖
const CHARGE = 4.15
const T3 = 5.1
const P3 = toss(T3, 2, -55, 0.3, false)
/** 飛出畫面以後安靜多久 */
const WAIT3 = 0.55
const C3 = fall(P3 + WAIT3, 2, 0.4)
/** 國字放大到中間：兩個人讓到兩邊 */
const ASIDE = C3 + 0.3
const HOME = C3 + 0.5
const PARK = 7.6
const WORD = 8.2
// 回馬槍：同樣伸手、拋出畫面——爸爸秀肌肉忘了接
const T4 = 9.15
const P4 = toss(T4, 3, -55, 0.3, true)
const FLEX = P4 + 0.05
const SHOCK = 9.82
const LAND = 10.15
const LAUGH = 10.42
const BYE = 10.6
const ASK = 10.98
const Q = 11.06
const ANSWER = 13.56
/** 問他的時候他放大一點 */
const ASK_S = 1.15
const SIDE_Y = 15, SIDE_D = 141

const clip: Clip = {
  format: 2,
  char: '爸',
  meta: { theme: '爸爸舉高高', cast: '楊捷睿＋爸爸', gags: ['楊捷睿每次伸手，爸爸就把他往天上一拋、穩穩接住，一次比一次高（過頭頂→頭飛出畫面頂→停一拍蹲馬步憋氣，整個人飛出畫面、安靜一拍才掉回來，接得爸爸一沉）；回馬槍是第四次拋出去以後爸爸得意地秀肌肉忘了接，一抬頭嚇一跳，他剛好咚地落在爸爸肩膀上騎著，兩個人一起大笑'] },
  duration: 15,
  // 晴天的草地公園：天藍 Polo 衫、紅外套的他在淡藍天空上都跳得出來
  bg: { top: '#D6ECFF', bottom: '#F4FAFF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'ride', emoji: 'hero:yang/jump', x: RIDE.x, y: RIDE.y, size: S, hidden: true, flip: true },
    { id: 'dad', emoji: 'prop:dad', x: DX, y: DY, size: DS },
    { id: 'yang', emoji: 'hero:yang/dash', x: YX, y: P, size: S, hidden: true, flip: true },
  ],
  moves: [
    // 開場：他從左邊衝進來，停在爸爸面前，伸手——爸！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -22, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    ...g.moves.filter((m) => m.at < C1 + 0.01),
    // 第 2 次：在爸爸手上又伸手要再一次，這次轉一圈
    { at: T2, dur: 0.4 + 0.14 + 0.4, actor: 'yang', do: 'spin', amount: 360, pivot: 'center' },
    ...g.moves.filter((m) => m.at >= C1 + 0.01 && m.at < C2 + 0.01),
    // 停一拍：爸爸盯著上面、蹲馬步、憋氣發抖；他在手上興奮地等
    { at: C2 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: CHARGE, dur: 0.7, actor: 'dad', do: 'squash', amount: 0.14 },
    // 飛出畫面以後：爸爸蹲好、雙手準備、盯著上面等
    { at: P3 + 0.1, actor: 'dad', do: 'swap', emoji: 'prop:dad-catch' },
    { at: CHARGE + 0.1, dur: 0.6, actor: 'dad', do: 'shake', amount: 0.8 },
    ...g.moves.filter((m) => m.at >= C2 + 0.01 && m.at < C3 + 0.01),
    // 國字放大到中間：他從手上跳下來讓到左邊，爸爸退到右邊
    { at: ASIDE, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ASIDE, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: SIDE_Y, y: P }, arc: 8 },
    { at: ASIDE, actor: 'dad', do: 'swap', emoji: 'prop:dad' },
    { at: ASIDE, dur: 0.4, actor: 'dad', do: 'moveTo', to: { x: SIDE_D, y: DY } },
    // 語詞那一刻：爸爸回到正中間，他跑過去抱住爸爸——爸爸
    { at: PARK, dur: 0.45, actor: 'dad', do: 'moveTo', to: { x: DX, y: DY } },
    { at: PARK + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.2, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: YX, y: P } },
    { at: WORD - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: WORD - 0.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    { at: WORD, dur: 0.3, actor: 'dad', do: 'hop', amount: 2 },
    // 回馬槍：同樣伸手、拋出畫面
    ...g.moves.filter((m) => m.at >= WORD + 0.2),
    // 爸爸得意地秀肌肉、閉眼——忘了接
    { at: FLEX, actor: 'dad', do: 'swap', emoji: 'prop:dad-flex' },
    { at: FLEX + 0.1, dur: 0.3, actor: 'dad', do: 'hop', amount: 1.5 },
    // 「咻——」他掉下來（換成畫在爸爸後面的 ride，掉下來時不會蓋住爸爸的臉），爸爸一抬頭嚇一跳
    { at: SHOCK - 0.25, dur: 0.01, actor: 'yang', do: 'vanish' },
    { at: SHOCK - 0.25, dur: 0.01, actor: 'ride', do: 'moveTo', to: { x: RIDE.x, y: -30 } },
    { at: SHOCK - 0.24, dur: 0.01, actor: 'ride', do: 'pop' },
    { at: SHOCK - 0.23, dur: LAND - SHOCK + 0.23, actor: 'ride', do: 'moveTo', to: RIDE, ease: 'in' },
    { at: SHOCK, actor: 'dad', do: 'swap', emoji: 'prop:dad-shock' },
    // 「咚」剛好落在爸爸肩膀上騎著
    { at: LAND, dur: 0.35, actor: 'dad', do: 'squash', amount: 0.25 },
    { at: LAND, dur: 0.25, actor: 'ride', do: 'squash', amount: 0.25 },
    // 兩個人一起大笑
    { at: LAUGH, actor: 'dad', do: 'swap', emoji: 'prop:dad-throw' },
    { at: LAUGH, actor: 'ride', do: 'swap', emoji: 'hero:yang/happy' },
    { at: LAUGH, dur: 0.25, actor: 'dad', do: 'hop', amount: 2 },
    { at: LAUGH, dur: 0.25, actor: 'ride', do: 'hop', amount: 2 },
    // 他跳下來，爸爸轉身走出去，他揮手
    { at: BYE, dur: 0.01, actor: 'ride', do: 'vanish' },
    { at: BYE, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: BYE, dur: 0.01, actor: 'yang', do: 'moveTo', to: { x: RIDE.x - 8, y: RIDE.y - 4 } },
    { at: BYE + 0.01, dur: 0.01, actor: 'yang', do: 'pop' },
    { at: BYE + 0.02, dur: 0.28, actor: 'yang', do: 'moveTo', to: { x: 40, y: P }, arc: 10 },
    { at: BYE, actor: 'dad', do: 'swap', emoji: 'prop:dad' },
    { at: BYE, dur: 0.01, actor: 'dad', do: 'flip' },
    { at: BYE + 0.02, dur: ASK - BYE - 0.06, actor: 'dad', do: 'moveTo', to: { x: 205, y: DY }, ease: 'in' },
    { at: BYE + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    // 問他：他跳到左前方、放大
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 3 }, ease: 'in' },
  ],
  builds: [
    // 父的兩點從飛在半空的他身上、父的交叉從爸爸接住的大手上、巴從落下來的他身上
    { at: P1, dur: 0.32, strokes: [0, 1], from: 'yang', color: partColor('父') },
    { at: C2 + 0.02, dur: 0.32, strokes: [2, 3], from: HANDS, color: partColor('父') },
    { at: C3 + 0.02, dur: 0.32, strokes: [4, 5, 6, 7], from: 'yang', color: partColor('巴') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx.filter((f) => f.at < C2 + 0.01),
    // 停一拍：爸爸憋氣冒汗
    { at: CHARGE + 0.05, kind: 'sweat', actor: 'dad', dx: 8, dur: 0.8 },
    ...g.fx.filter((f) => f.at >= C2 + 0.01 && f.at < WORD),
    // 飛出畫面以後安靜一拍：爸爸抬頭等
    { at: P3 + 0.15, kind: 'pop', actor: 'dad', emoji: '❓', dx: 14, dy: 2, dur: 0.5, scale: 1.8 },
    // 語詞那一刻：好愛爸爸
    { at: WORD, kind: 'burst', x: 68, y: 34, emoji: '💖', n: 1, dur: 0.5, scale: 1.6 },
    // 秀肌肉亮晶晶（強調線畫在圖上）
    { at: FLEX + 0.05, kind: 'burst', x: DX - 22, y: 28, emoji: '✨', n: 5, dur: 0.45, scale: 1.3 },
    // 咚！落在肩膀上：💥 在右上方，不蓋臉
    { at: LAND, kind: 'burst', x: DX + 22, y: 22, n: 1, dur: 0.4, scale: 2.2 },
    { at: LAUGH, kind: 'burst', x: DX + 20, y: 26, emoji: '💕', n: 6, dur: 0.5, scale: 1.1 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景跟著飛上天的他切掉人），只有接住、落下那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: LAND, dur: 0.4, do: 'punch', amount: 0.08, to: { x: DX, y: 42 } },
    { at: LAND, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.72, say: '爸' },
    ...g.cues.filter((c) => c.at < WORD),
    { at: CHARGE, sfx: 'rumble' },
    { at: P3 + WAIT3 - 0.05, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '爸' },
    { at: WORD, say: '爸爸' },
    ...g.cues.filter((c) => c.at >= WORD),
    { at: FLEX + 0.05, sfx: 'blip' },
    { at: SHOCK - 0.2, sfx: 'whoosh' },
    { at: LAND, sfx: 'bonk' },
    { at: LAND + 0.05, sfx: 'boing' },
    { at: LAUGH, sfx: 'cheer' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '爸' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
