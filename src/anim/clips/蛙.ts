import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蛙（v2）：楊捷睿站在荷葉旁邊吃點心，每次點心才舉到嘴邊，大青蛙的長舌頭就「啪」地伸過來黏住、捲回嘴裡吞掉——他咬到空氣「喀」傻眼，
// 一次比一次大：餅乾（虫從青蛙身上蹦出來）→ 整支冰淇淋（青蛙吃得開心一跳，落在荷葉上濺出上面的土）→ 先停一拍：他偷看青蛙、慢慢舉起大漢堡……啪！（青蛙跳最高，濺出下面的土）。
// 字拼好後青蛙在正中間「呱」（青蛙）；回馬槍：他把大蛋糕藏在背後得意地閉眼——舌頭這次黏住的是他自己，整個人被拉過去貼在青蛙臉上，蛋糕被吞掉、他被吐上天。
// 最後畫面暗下來只剩「蛙」，楊捷睿從天上掉到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「蛙！」，然後退場只留字。
// 蛙、蛙、青蛙、這是什麼字？、蛙
const P = 66.9 // 楊捷睿（size 24）站在地上的 y
/** 楊捷睿每次站的地方（面向右邊的青蛙） */
const YX = 46
/** 大青蛙（prop:frog 只佔畫布的 0.72，size 寫大一點）：畫面上最大、最中間 */
const FS = 54
const FX = 90
const FY = 77 - 0.42 * FS
/** 青蛙的嘴（照 frog 的 x、y 算；圖朝左，嘴在左半邊） */
const MOUTH_D = { dx: -0.17 * FS, dy: 0.04 * FS }
const MOUTH_F = { x: FX + MOUTH_D.dx, y: FY + MOUTH_D.dy }
/** 點心拿在手上、送到嘴邊的位置 */
const HAND = { x: YX + 7, y: P + 1 }
const BITE = { x: YX + 5, y: P - 4 }
/** 舌頭的顏色 */
const TONGUE = '#F0507E'
/** 咬到空氣以後傻眼停多久 */
const HOLD = 0.45

/**
 * 「啪—喀」：他把點心送到嘴邊（eat）；青蛙抖一下、鼓起來（預備）→ 粉紅色的長舌頭「啪」地伸出去黏住點心 →
 * 點心跟著舌頭縮回青蛙嘴裡、吞掉；他咬到空氣那一刻 💥＋白光＋鏡頭推近＋震＋同一個音效，傻眼停 HOLD 秒。
 * at 是咬空（點心進青蛙嘴）的那一刻，k 是第幾次（越後面越大）。之後他怎麼哭、青蛙怎麼跳寫在劇本裡；這裡只管那一下長得一樣。
 */
function lick(at: number, k: number, target = 'snack') {
  const moves: Move[] = [
    // 青蛙預備：抖一下、身體拉高
    { at: at - 0.55, actor: 'frog', do: 'shake', amount: 0.6 + 0.2 * k, dur: 0.2 },
    { at: at - 0.34, actor: 'frog', do: 'squash', amount: -0.12, dur: 0.12 },
    // 吞下去：咕嚕
    { at, actor: 'frog', do: 'squash', amount: 0.18 + 0.05 * k, dur: 0.25 },
  ]
  if (target === 'snack') {
    moves.push(
      // 要吃了：張大嘴，點心送到嘴邊
      { at: at - 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
      { at: at - 0.6, actor: 'snack', do: 'moveTo', to: BITE, dur: 0.18 },
      // 舌頭黏住，點心跟著舌頭縮回青蛙嘴裡
      { at: at - 0.19, actor: 'snack', do: 'moveTo', to: MOUTH_F, dur: 0.19, ease: 'in' },
      { at, actor: 'snack', do: 'vanish', dur: 0.06 },
      // 喀——咬到空氣，傻眼
      { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at, actor: 'yang', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.25 },
      { at: at + 0.12, actor: 'yang', do: 'shake', amount: 0.6 + 0.2 * k, dur: HOLD - 0.12 },
    )
  }
  const fx: Fx[] = [
    // 舌頭：從青蛙嘴巴伸到點心（點心被捲回來，舌頭跟著縮短）
    { at: at - 0.33, dur: 0.36, kind: 'line', actor: 'frog', dx: MOUTH_D.dx, dy: MOUTH_D.dy, target, color: TONGUE, width: 3.4 },
  ]
  if (target === 'snack') {
    // 喀：💥 在他嘴前面（一次比一次大）
    fx.push(
      { at, kind: 'burst', x: BITE.x + 2, y: BITE.y - 6, n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
      { at, kind: 'burst', x: BITE.x + 2, y: BITE.y - 6, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
    )
  }
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: (YX + FX) / 2, y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（啪、咕嚕、喀），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.21, sfx: 'tap' }, { at, sfx: 'gulp' }, { at: at + 0.03, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 他又拿出一個點心（從口袋變出來在手上） */
function newSnack(at: number, emoji: string, size: number): Move[] {
  return [
    // 越大的點心拿得離臉越遠，才不會把臉蓋住
    { at, actor: 'snack', do: 'moveTo', to: { x: YX + 4 + 0.4 * size, y: HAND.y + 0.1 * size }, dur: 0.01 },
    { at, actor: 'snack', do: 'swap', emoji },
    // pop 會把消失過的角色大小歸 1，所以放大寫在 pop 後面
    { at: at + 0.01, actor: 'snack', do: 'pop', dur: 0.25 },
    { at: at + 0.02, actor: 'snack', do: 'scaleTo', amount: size / 8, dur: 0.01 },
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
  ]
}

/** 青蛙吃得開心一跳，落回荷葉上（濺起水和泥土） */
function frogHop(at: number, amount: number, dur: number): Move[] {
  return [
    { at, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at, actor: 'frog', do: 'hop', amount, dur },
    { at: at + dur, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    { at: at + dur, actor: 'pad', do: 'squash', amount: 0.35, dur: 0.25 },
  ]
}

const H1 = 1.8, H2 = 3.75, H3 = 6.1, H4 = 10.2
const s1 = lick(H1, 0)
const s2 = lick(H2, 1)
const s3 = lick(H3, 2)
const s4 = lick(H4, 3, 'yang')
/** 第 2、3 次青蛙跳起來落地的時刻 */
const L2 = H2 + 0.55 + 0.5
const L3 = H3 + 0.55 + 0.5
/** 第 3 次以後：國字放大到正中央時，他跌到左邊、青蛙跳到右邊 */
const SIDE_Y = 22
const SIDE_F = 138
const HOME = 7.75
const PARK = 8.6
const ASK = 10.95
const ANSWER = 13.6
/** 第 4 次：被拉過去貼在青蛙臉上的位置 */
const FACE = { x: FX - 13, y: P - 8 }

const clip: Clip = {
  format: 2,
  char: '蛙',
  meta: { theme: '青蛙的長舌頭搶點心', cast: '楊捷睿＋大青蛙＋荷葉＋點心', gags: ['楊捷睿每次把點心舉到嘴邊，青蛙的長舌頭就啪地伸過來捲走吞掉，他咬到空氣傻眼，捲走的東西一次比一次大（餅乾→冰淇淋→大漢堡）；回馬槍是他把蛋糕藏在背後，舌頭黏住的是他自己，整個人被拉過去貼在青蛙臉上、再被吐上天'] },
  duration: 15,
  bg: { top: '#D6F1EE', bottom: '#F2FBF4', floor: '#9FD6A0', scenery: 'hills' },
  actors: [
    { id: 'pad', emoji: 'prop:lilypad', x: FX, y: 71, size: 60 },
    { id: 'frog', emoji: 'prop:frog', x: FX, y: FY, size: FS },
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: P, size: 24, hidden: true, flip: true },
    { id: 'snack', emoji: '🍪', x: HAND.x, y: HAND.y, size: 8, float: true, hidden: true },
  ],
  moves: [
    // 楊捷睿拿著餅乾走進來，指著大青蛙：蛙！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0, actor: 'snack', do: 'enter', from: { x: -25 + 7, y: HAND.y }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 0.6, actor: 'frog', do: 'hop', amount: 3, dur: 0.25 },
    { at: 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    // 第 1 次：啪——喀！餅乾被捲走，他摸著扁肚子
    ...s1.moves,
    { at: H1 + 0.2, actor: 'frog', do: 'hop', amount: 4, dur: 0.25 },
    { at: H1 + HOLD, actor: 'yang', do: 'swap', emoji: 'hero:yang/hungry' },
    // 第 2 次：拿出一整支冰淇淋——啪——喀！他大哭，青蛙吃得開心跳起來
    ...newSnack(2.75, '🍦', 13),
    ...s2.moves,
    { at: H2 + HOLD, actor: 'yang', do: 'swap', emoji: 'hero:yang/cry' },
    ...frogHop(H2 + 0.55, 14, 0.5),
    // 第 3 次前停一拍：拿出大漢堡，蹲低偷看青蛙；青蛙裝沒事
    ...newSnack(4.75, '🍔', 18),
    { at: 5.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    { at: 5.2, actor: 'yang', do: 'tilt', amount: 6, dur: 0.35 },
    { at: 5.3, actor: 'frog', do: 'tilt', amount: -6, dur: 0.4 },
    ...s3.moves,
    // ……啪——喀！他嚇得一屁股跌坐，青蛙跳最高
    { at: H3 + HOLD, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: H3 + HOLD, actor: 'yang', do: 'moveTo', to: { x: SIDE_Y, y: P }, dur: 0.35, ease: 'out' },
    { at: H3 + HOLD, actor: 'snack', do: 'vanish', dur: 0.01 },
    // 青蛙這次跳最高，一跳跳到荷葉右邊（國字放大時讓出正中間）
    { at: H3 + 0.55, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: H3 + 0.55, actor: 'frog', do: 'moveTo', to: { x: SIDE_F, y: FY }, arc: 16, dur: 0.5, ease: 'inOut' },
    { at: L3, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    { at: L3, actor: 'pad', do: 'squash', amount: 0.35, dur: 0.25 },
    // 國字放大：他爬起來
    { at: 8.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 語詞那一刻：青蛙一跳跳回荷葉正中間，鼓起來「呱」；他走回原位指著牠
    { at: PARK - 0.05, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: PARK - 0.05, actor: 'frog', do: 'moveTo', to: { x: FX, y: FY }, arc: 10, dur: 0.3 },
    { at: PARK + 0.25, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    { at: PARK - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK - 0.05, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, dur: 0.3 },
    { at: PARK + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: PARK + 0.3, actor: 'frog', do: 'scaleTo', amount: 1.12, dur: 0.25, ease: 'back' },
    { at: PARK + 0.75, actor: 'frog', do: 'scaleTo', amount: 1 / 1.12, dur: 0.25 },
    // 回馬槍（第 4 次）：拿出大蛋糕，藏到背後，得意地閉眼
    ...newSnack(9.2, '🎂', 16),
    { at: 9.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: 9.55, actor: 'snack', do: 'moveTo', to: { x: YX - 7, y: P + 1 }, dur: 0.2 },
    { at: 9.75, actor: 'yang', do: 'hop', amount: 2, dur: 0.2 },
    ...s4.moves,
    // 舌頭黏住他自己：整個人被拉過去，貼在青蛙臉上
    { at: H4 - 0.19, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H4 - 0.19, actor: 'yang', do: 'moveTo', to: FACE, dur: 0.19, ease: 'in' },
    { at: H4 - 0.19, actor: 'snack', do: 'moveTo', to: { x: FACE.x - 7, y: FACE.y + 1 }, dur: 0.19, ease: 'in' },
    { at: H4, actor: 'yang', do: 'squash', amount: 0.4, dur: 0.4 },
    { at: H4 + 0.1, actor: 'yang', do: 'shake', amount: 1.2, dur: 0.35 },
    // 蛋糕被吞掉，他被「呸」地吐上天
    { at: H4 + 0.45, actor: 'snack', do: 'moveTo', to: MOUTH_F, dur: 0.12, ease: 'in' },
    { at: H4 + 0.57, actor: 'snack', do: 'vanish', dur: 0.05 },
    { at: H4 + 0.57, actor: 'frog', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: H4 + 0.68, actor: 'frog', do: 'squash', amount: -0.25, dur: 0.15 },
    { at: H4 + 0.68, actor: 'yang', do: 'moveTo', to: { x: 20, y: -55 }, dur: 0.35, ease: 'out' },
    { at: H4 + 0.68, actor: 'yang', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 青蛙心滿意足，一跳跳出右邊
    { at: H4 + 0.75, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: H4 + 0.75, actor: 'frog', do: 'flip' },
    { at: H4 + 0.75, actor: 'frog', do: 'moveTo', to: { x: 215, y: FY }, arc: 8, dur: 0.3, ease: 'in' },
    { at: H4 + 0.75, actor: 'pad', do: 'squash', amount: 0.3, dur: 0.2 },
    // 荷葉沉進水裡（問他之前只留楊捷睿）
    { at: ASK, actor: 'pad', do: 'vanish', dur: 0.3 },
    // 問他：楊捷睿從天上掉到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.55, dur: 0.01 },
    { at: ASK + 0.1, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.0, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 8, dur: 0.2 },
    // 退場，荷葉也沉下去，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
      ],
  builds: [
    // 第 1 次：虫從吞下餅乾的青蛙身上蹦出來
    { at: H1 + 0.25, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5], from: 'frog', color: partColor('虫') },
    // 第 2、3 次：青蛙跳起來落回荷葉，濺起來的泥土一塊一塊疊上去（土、土）
    { at: L2, dur: 0.5, strokes: [6, 7, 8], from: 'pad', color: partColor('土') },
    { at: L3, dur: 0.5, strokes: [9, 10, 11], from: { x: SIDE_F, y: 70 }, color: partColor('土') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    { at: H1 + HOLD, kind: 'sweat', actor: 'yang' },
    ...s2.fx,
    { at: L2, kind: 'burst', x: FX, y: 72, emoji: '💦', n: 6, dur: 0.45 },
    // 第 3 次前停一拍：偷看
    { at: 5.25, kind: 'pop', actor: 'yang', emoji: '👀', dx: 6, dy: 2, dur: 0.6, scale: 1.6 },
    ...s3.fx,
    { at: L3, kind: 'burst', x: SIDE_F, y: 70, emoji: '💦', n: 8, dur: 0.5 },
    { at: H3 + HOLD + 0.1, kind: 'dizzy', actor: 'yang', dur: 0.6 },
    // 語詞那一刻：呱
    { at: PARK + 0.2, kind: 'burst', actor: 'frog', emoji: '🎵', n: 6, dx: -6, dy: 6, dur: 0.6 },
    ...s4.fx,
    // 貼在臉上的時候，舌頭再一伸把他背後的蛋糕捲走
    { at: H4 + 0.33, dur: 0.26, kind: 'line', actor: 'frog', dx: MOUTH_D.dx, dy: MOUTH_D.dy, target: 'snack', color: TONGUE, width: 3.4 },
    { at: H4, kind: 'burst', x: FACE.x, y: FACE.y - 10, n: 1, dur: 0.45, scale: 2.6 },
    { at: H4, kind: 'burst', x: FACE.x, y: FACE.y - 10, emoji: '⭐', n: 10, dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：舌頭從青蛙伸到他手上，自動取景追一個會把另一個切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 7.2, dur: 0.3, do: 'zoom', amount: 1 },
    ...s4.camera,
  ],
  lights: [
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.45, say: '蛙' },
    ...s1.cues,
    { at: 2.76, sfx: 'blip' },
    ...s2.cues,
    { at: L2, sfx: 'splash' },
    { at: 4.76, sfx: 'blip' },
    ...s3.cues,
    { at: L3, sfx: 'splash' },
    { at: HOME + 0.1, say: '蛙' },
    { at: PARK + 0.2, say: '青蛙' },
    { at: 9.21, sfx: 'blip' },
    ...s4.cues,
    { at: H4 + 0.68, sfx: 'whoosh' },
    { at: H4 + 0.75, sfx: 'boing' },
    { at: ASK + 0.15, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '蛙' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
