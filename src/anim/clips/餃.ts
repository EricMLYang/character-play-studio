import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 餃（v2）：剛起鍋的一大鍋水餃還在冒煙，最快的忍者小老鼠等不及——每次夾起水餃就往嘴裡塞，「燙！」嘴巴噴出一團火、臉漲紅吐舌頭，
// 整個人跳起來原地打轉，一次比一次誇張：塞一顆（跳一下轉一圈，飠從嘴裡噴出來）、一口塞兩顆（轉兩圈滾到畫面邊，交的頭）、
// 先停一拍看著整盤……整盤倒進嘴裡（被燙上天，交的下半）。
// 回馬槍：他學乖了，夾起一顆先用力吹涼——吹太大力，整鍋水餃被吹得噴上天，一顆一顆掉進他張大的嘴裡，燙到最大的一次。
// 最後畫面暗下來只剩「餃」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「餃！」，然後退場只留字。
// 餃、餃、水餃、這是什麼字？、餃
const P = 66.9 // 小老鼠（size 24）站在地上的 y
/** 大鍋（prop:dumpling-pot）：畫面上最大、在中間偏右 */
const PX = 120, PS = 46, PY = 77 - 0.42 * PS
/** 小老鼠每次出發的地方 */
const HOME = 36
/** 每次都衝到同一個地方：鍋子左邊 */
const GRAB = PX - 32
/** 嘴巴的位置（小老鼠朝右，站在 GRAB） */
const MX = GRAB + 6, MY = P - 11
/** 燙到以後臉漲紅、抖著停多久，才跳起來 */
const HOLD = 0.45

/**
 * 「啊嗚—燙！」：把水餃塞進嘴裡那一刻（at）換成辣到的臉（臉紅、吐舌頭、搧風、噴淚），嘴巴噴出一團 🔥＋鏡頭推近＋震＋白光＋同一個音效，
 * 抖著停 HOLD 秒（臉看得清楚）。k 是第幾次（越後面越大）。跳起來、飛多遠由呼叫的地方寫。
 */
function burn(at: number, k: number) {
  const moves: Move[] = [
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/spicy' },
    { at, actor: 'mouse', do: 'squash', amount: -0.18 - 0.04 * k, dur: 0.25 },
    { at: at + 0.12, actor: 'mouse', do: 'shake', amount: 1.2 + 0.4 * k, dur: HOLD - 0.12 },
    // 鍋子也跟著噗一下
    { at, actor: 'pot', do: 'squash', amount: 0.12, dur: 0.25 },
  ]
  const fx: Fx[] = [
    // 嘴巴噴出一團火（在臉的右前方，不蓋住臉），一次比一次大
    { at, kind: 'burst', x: MX + 9, y: MY - 1, emoji: '🔥', n: 1, dur: HOLD, scale: 1.5 + 0.4 * k },
    // 第 2 次起多噴一圈小火
    ...(k >= 1 ? [{ at, kind: 'burst' as const, x: MX + 9, y: MY - 2, emoji: '🔥', n: 3 + 2 * k, dur: 0.45, scale: 0.8 + 0.2 * k }] : []),
    { at: at + 0.05, kind: 'burst', x: MX - 2, y: MY - 12, emoji: '💦', n: 3 + k, dur: 0.35, scale: 0.8 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: MX + 4, y: MY } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'hic' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 衝到鍋子旁邊、水餃出現在手上、換張大嘴吃的姿勢塞進去（at 是塞進嘴裡、燙到的那一刻） */
function stuff(at: number, items: { id: string; emoji: string; dx: number; dy: number }[]): Move[] {
  return [
    { at: at - 0.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: at - 0.75, actor: 'mouse', do: 'moveTo', to: { x: GRAB, y: P }, dur: 0.25, anticipate: 4, ease: 'in' },
    { at: at - 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    ...items.flatMap(({ id, emoji, dx, dy }, i): Move[] => [
      // 從鍋裡撈出來，跳到手上
      { at: at - 0.5 + 0.05 * i, actor: id, do: 'swap', emoji },
      { at: at - 0.5 + 0.05 * i, actor: id, do: 'moveTo', to: { x: PX - 4, y: PY - 14 }, dur: 0.01 },
      { at: at - 0.49 + 0.05 * i, actor: id, do: 'pop', dur: 0.1 },
      { at: at - 0.47 + 0.05 * i, actor: id, do: 'moveTo', to: { x: MX + dx, y: MY + dy }, arc: 6, dur: 0.2, ease: 'out' },
      // 一口塞進去
      { at: at - 0.12, actor: id, do: 'moveTo', to: { x: MX + 1, y: MY + 1 }, dur: 0.1, ease: 'in' },
      { at: at - 0.03, actor: id, do: 'vanish', dur: 0.04 },
    ]),
    { at: at - 0.14, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
  ]
}

const H1 = 1.75, H2 = 3.55, H3 = 6.05, H4 = 10.0
const b1 = burn(H1, 0)
const b2 = burn(H2, 1)
const b3 = burn(H3, 2)
const b4 = burn(H4, 3)
/** 燙完跳起來的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD, R4 = H4 + HOLD
/** 語詞那一刻：鍋裡跳出一顆水餃到筷子上 */
const WORD = 8.4
/** 第 4 次：用力吹的時刻 */
const BLOW = 9.0

const clip: Clip = {
  format: 2,
  char: '餃',
  meta: { theme: '忍者小老鼠等不及吃剛起鍋的水餃', cast: '小老鼠＋一大鍋水餃＋夾起來的水餃', gags: ['最快的小老鼠等不及，每次夾起剛起鍋的水餃就往嘴裡塞，燙到嘴巴噴火、跳起來原地打轉，一次比一次多（一顆→兩顆→整盤）、一次比一次飛得遠；回馬槍是他學乖了先用力吹涼，吹太大力把整鍋水餃吹上天，一顆顆掉進他嘴裡，燙到最大的一次'] },
  duration: 15,
  bg: { top: '#FFE3C2', bottom: '#FFF6E8', floor: '#D9B48A', scenery: 'room' },
  actors: [
    { id: 'pot', emoji: 'prop:dumpling-pot', x: PX, y: PY, size: PS },
    // 夾起來的水餃：每次換成那一次塞的東西（筷子夾一顆／一顆水餃／整盤）
    { id: 'a', emoji: 'prop:dumpling-chopsticks', x: MX + 8, y: MY + 2, size: 15, hidden: true, pivot: 'center' },
    { id: 'b', emoji: 'prop:dumpling', x: MX + 8, y: MY + 6, size: 11, hidden: true, pivot: 'center' },
    // 姿勢圖朝左，翻過來面向右邊的鍋子
    { id: 'mouse', emoji: 'hero:mouse/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 小老鼠衝進來、煞車，看到一大鍋冒煙的水餃：眼睛發亮流口水
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'back' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    { at: 0.5, actor: 'pot', do: 'shake', amount: 0.6, dur: 0.5 },
    // 第 1 次：夾一顆塞進嘴——燙！跳起來轉一圈，落回原地
    ...stuff(H1, [{ id: 'a', emoji: 'prop:dumpling-chopsticks', dx: 7, dy: 2 }]),
    ...b1.moves,
    { at: R1, actor: 'mouse', do: 'hop', amount: 9, dur: 0.45 },
    { at: R1, actor: 'mouse', do: 'spin', times: 1, dur: 0.45, pivot: 'center' },
    { at: R1 + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/hot' },
    { at: R1 + 0.5, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.3 },
    { at: R1 + 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    // 第 2 次：一口塞兩顆——更燙！跳更高轉兩圈，滾到畫面邊
    ...stuff(H2, [{ id: 'a', emoji: 'prop:dumpling', dx: 7, dy: -1 }, { id: 'b', emoji: 'prop:dumpling', dx: 8, dy: 6 }]),
    ...b2.moves,
    { at: R2, actor: 'mouse', do: 'moveTo', to: { x: 16, y: P }, arc: 20, dur: 0.5, ease: 'out' },
    { at: R2, actor: 'mouse', do: 'spin', times: -3, dur: 0.5, pivot: 'center' },
    { at: R2 + 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 第 3 次：走回來，捧起一整盤——先停一拍：看著盤子想一想（觀眾知道又要來了）……整盤倒進嘴裡！
    { at: 4.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: 4.85, actor: 'mouse', do: 'moveTo', to: { x: HOME + 8, y: P }, dur: 0.35 },
    { at: 5.2, actor: 'a', do: 'swap', emoji: 'prop:dumpling-plate' },
    { at: 5.2, actor: 'a', do: 'moveTo', to: { x: HOME + 8 + 10, y: P - 6 }, dur: 0.01 },
    { at: 5.21, actor: 'a', do: 'pop', dur: 0.15 },
    { at: 5.21, actor: 'a', do: 'scaleTo', amount: 18 / 15, dur: 0.15 },
    { at: 5.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: 5.2, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 5.45, actor: 'a', do: 'tilt', amount: 6, dur: 0.25 },
    { at: 5.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    // 捧著盤子衝到老地方，盤子翻過來倒進嘴裡
    { at: 5.6, actor: 'mouse', do: 'moveTo', to: { x: GRAB, y: P }, dur: 0.22, anticipate: 3, ease: 'in' },
    { at: 5.6, actor: 'a', do: 'moveTo', to: { x: MX + 8, y: MY - 5 }, dur: 0.22, ease: 'in' },
    { at: H3 - 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
    { at: H3 - 0.2, actor: 'a', do: 'rotateTo', amount: -70, dur: 0.18, ease: 'in' },
    ...b3.moves,
    // 燙上天（往右上飛出畫面，盤子跟著飛走），過一會兒才掉回來
    { at: R3, actor: 'mouse', do: 'moveTo', to: { x: 185, y: -15 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'mouse', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    { at: R3, actor: 'a', do: 'moveTo', to: { x: 200, y: 0 }, dur: 0.45, ease: 'out' },
    { at: R3, actor: 'a', do: 'rotateTo', amount: 70 + 720, dur: 0.45 },
    // 這次連整鍋都被噴上天（鍋子在國字放大時不在畫面上），國字讓位時才「咚」地掉回原地
    { at: R3 + 0.05, actor: 'pot', do: 'moveTo', to: { x: PX + 40, y: -45 }, dur: 0.4, ease: 'out' },
    { at: R3 + 0.05, actor: 'pot', do: 'rotateTo', amount: 200, dur: 0.4, pivot: 'center' },
    { at: 6.95, actor: 'mouse', do: 'moveTo', to: { x: 30, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'mouse', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，他回到鍋子旁邊，鍋裡跳出一顆水餃落在筷子上
    { at: 8.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 8.0, actor: 'mouse', do: 'moveTo', to: { x: GRAB, y: P }, dur: 0.3 },
    { at: 8.05, actor: 'pot', do: 'rotateTo', amount: -200, dur: 0.01, pivot: 'center' },
    { at: 8.05, actor: 'pot', do: 'moveTo', to: { x: PX, y: -30 }, dur: 0.01 },
    { at: 8.07, actor: 'pot', do: 'moveTo', to: { x: PX, y: PY }, dur: 0.28, ease: 'in' },
    { at: 8.35, actor: 'mouse', do: 'hop', amount: 3, dur: 0.2 },
    { at: WORD - 0.05, actor: 'a', do: 'rotateTo', amount: -790, dur: 0.01 },
    { at: WORD - 0.05, actor: 'a', do: 'swap', emoji: 'prop:dumpling-chopsticks' },
    { at: WORD - 0.05, actor: 'a', do: 'moveTo', to: { x: PX - 2, y: PY - 16 }, dur: 0.01 },
    { at: WORD, actor: 'a', do: 'pop', dur: 0.12 },
    { at: WORD, actor: 'a', do: 'moveTo', to: { x: MX + 9, y: MY + 1 }, arc: 10, dur: 0.3, ease: 'out' },
        { at: WORD + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 回馬槍（第 4 次）：他學乖了——先用力吹涼……吹太大力！整鍋水餃噴上天，一顆掉進他張大的嘴
    { at: BLOW, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/blow' },
    { at: BLOW, actor: 'mouse', do: 'squash', amount: -0.12, dur: 0.3 },
    { at: BLOW + 0.25, actor: 'a', do: 'moveTo', to: { x: 175, y: 30 }, dur: 0.4, ease: 'in' },
    { at: BLOW + 0.25, actor: 'a', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    { at: BLOW + 0.3, actor: 'pot', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: BLOW + 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    { at: BLOW + 0.65, actor: 'pot', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: BLOW + 0.65, actor: 'b', do: 'moveTo', to: { x: PX - 4, y: PY - 14 }, dur: 0.01 },
    { at: BLOW + 0.66, actor: 'b', do: 'pop', dur: 0.1 },
    { at: BLOW + 0.66, actor: 'b', do: 'moveTo', to: { x: MX + 16, y: 22 }, dur: 0.35, ease: 'out' },
    { at: BLOW + 0.66, actor: 'b', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
    { at: H4 - 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: H4 - 0.3, actor: 'b', do: 'moveTo', to: { x: MX + 1, y: MY + 1 }, dur: 0.27, ease: 'in' },
    { at: H4 - 0.03, actor: 'b', do: 'vanish', dur: 0.04 },
    ...b4.moves,
    // 燙上天（往左上），最遠的一次
    { at: R4, actor: 'mouse', do: 'moveTo', to: { x: -40, y: 20 }, arc: 14, dur: 0.4, ease: 'out' },
    // 鍋子也被噴飛出畫面（右邊），問他之前畫面清乾淨
    { at: R4 + 0.05, actor: 'pot', do: 'moveTo', to: { x: PX + 75, y: 10 }, dur: 0.4, ease: 'out' },
    { at: R4 + 0.05, actor: 'pot', do: 'rotateTo', amount: 160, dur: 0.4, pivot: 'center' },
    { at: R4, actor: 'mouse', do: 'spin', times: -3, dur: 0.4, pivot: 'center' },
    // 問他：小老鼠掉回左前方、變大，轉向觀眾
    { at: 10.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 10.75, actor: 'mouse', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: 10.77, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.22, ease: 'in' },
    { at: 11.0, actor: 'mouse', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
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
    // 第 1 次：塞進嘴裡那一口——飠（吃的東西）從嘴裡噴出來
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'mouse', color: partColor('飠') },
    // 第 2、3 次：燙到兩腳一交叉跳起來時甩出來——交
    { at: H2 + 0.05, dur: 0.6, strokes: [8, 9], from: 'mouse', color: partColor('交') },
    { at: H3 + 0.05, dur: 0.6, strokes: [10, 11, 12, 13], from: 'mouse', color: partColor('交') },
  ],
  glyph: [
    { at: 7.0, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.0, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.65, dur: 3.3, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.75, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：他口水流下來
    { at: 0.5, kind: 'pop', actor: 'mouse', emoji: '❗', dx: 6, dur: 0.5 },
    ...b1.fx,
    ...b2.fx,
    { at: R2 + 0.5, kind: 'dizzy', actor: 'mouse', dur: 0.45 },
    ...b3.fx,
    { at: 7.3, kind: 'dizzy', actor: 'mouse', dur: 0.6 },
    // 語詞那一刻：鍋裡跳出水餃，閃一下
    { at: 8.35, kind: 'burst', x: PX, y: PY - 12, emoji: '💦', n: 6, dur: 0.4 },
    { at: WORD, kind: 'burst', x: PX - 2, y: PY - 14, emoji: '✨', n: 6, dur: 0.5 },
    // 第 4 次：用力吹（一大串風吹向鍋子），整鍋水餃噴上天
    { at: BLOW + 0.05, kind: 'blow', actor: 'mouse', to: { x: PX, y: PY - 6 }, dx: 6, dy: 9, n: 6, dur: 0.6, scale: 1.8 },
    { at: BLOW + 0.65, kind: 'fountain', actor: 'pot', emoji: 'prop:dumpling', n: 7, dy: 4, dur: 0.9, scale: 1.6 },
    ...b4.fx,
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...b1.camera,
    ...b2.camera,
    // 第 3 次：飛上天之前自己框住地上（自動取景會預先往上看），飛走後再交回自動取景
    { at: 5.6, dur: 0.3, do: 'zoom', amount: 1.2, to: { x: 80, y: 52 } },
    ...b3.camera,
    { at: 6.75, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 8.35, dur: 0.3, do: 'shake', amount: 1.2 },
    // 第 4 次要看得到整鍋水餃噴上天：全景
    { at: BLOW, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b4.camera,
    { at: 10.5, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次燙到白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.0, dur: 0.05, level: -0.35 },
    { at: 7.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '餃' },
    ...[H1, H2].map((at): Cue => ({ at: at - 0.75, sfx: 'whoosh' })),
    { at: 5.6, sfx: 'whoosh' },
    ...b1.cues,
    ...b2.cues,
    ...b3.cues,
    ...[R1, R2, R3].map((at): Cue => ({ at, sfx: 'boing' })),
    { at: 7.3, sfx: 'plop' },
    { at: 7.15, say: '餃' },
    { at: WORD, sfx: 'splash' },
    { at: WORD + 0.15, say: '水餃' },
    { at: BLOW + 0.05, sfx: 'whoosh' },
    { at: BLOW + 0.65, sfx: 'splash' },
    ...b4.cues,
    { at: R4, sfx: 'boing' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '餃' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
