import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 肚（v2）：浣熊花生的圓肚子是彈簧床。每次他張開雙手把肚子挺出來、肚子「砰砰」抖兩下（來！），東西就飛過來
// 「咚～」撞在他肚子上——肚子凹進去（整個人被壓扁、往後仰），停一下，「啵！」彈回來，把東西彈得老遠，他閉眼得意，一次比一次大：
// 皮球（⺼ 的外框從肚子飛出來）→ 大西瓜（⺼ 裡面兩橫）→ 先停一拍：滾來一顆比他還大的大石頭，他傻眼、冒汗、吞口水，
// 還是張開手挺肚子——「咚————」凹得最深、抖好久，「啵！」把大石頭彈上天（土）。「挺肚子抖兩下→咚地凹進去→啵地彈回去」四次都一樣。
// 語詞那一刻：他回到中間，拍拍自己的肚子「肚子」，鏡頭推近肚子。
// 回馬槍（第四次）：他又挺肚子等著，這次飄來的是一根輕輕的羽毛——羽毛一碰到肚子，他怕癢，「哈哈哈」笑到倒在地上滾，笑出來的氣把羽毛吹走。
// 最後畫面暗下來只剩「肚」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「肚！」，然後退場只留字。
// 刻意不跟「睿」（大猩猩用肚子撞禮物、被彈回去的是自己）、「喝」（肚子鼓大、打嗝噴回去）、「肉」（吃到肚子脹）、「足」（踢球被彈回來）、
// 「家」「十」（圓肚子卡住）撞：這支的花生站著不動，肚子是彈簧床，被彈飛的永遠是東西。
// 肚、肚、肚子、這是什麼字？、肚

/** 花生：畫面上最大、站在中間偏左，面向右邊飛來的東西（flip） */
const RS = 52
const RY = 77 - 0.42 * RS
const RX = 72
/** 肚子的中心（白肚皮） */
const BELLY: Vec = { x: RX + 1, y: 65 }
/** 字框：左上角（右邊是東西飛來、彈走的路） */
const FRAME = { x: 25, y: 22 }
const FRAME_K = 0.5
const WIDE = { x: 80, y: 45 }
/** 三樣東西撞在肚子上的位置（大小不同，中心不同） */
const BALL_S = 15
const MELON_S = 26
const ROCK_S = 72
const BALL_AT: Vec = { x: RX + 14, y: 64 }
const MELON_AT: Vec = { x: RX + 19, y: 64 }
const ROCK_Y = 77 - 0.42 * ROCK_S
const ROCK_AT: Vec = { x: RX + 41, y: ROCK_Y }
const FEATHER_S = 18
const FEATHER_AT: Vec = { x: RX + 13, y: 63 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 挺肚子、「砰砰」抖兩下（來！）：張開雙手（hug）、肚子往前挺。回傳抖完的時間 */
function brace(at: number, k = 0) {
  g.moves.push(
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at, dur: 0.22, actor: 'raccoon', do: 'squash', amount: -0.14 },
    { at: at + 0.24, dur: 0.13, actor: 'raccoon', do: 'squash', amount: 0.12 },
    { at: at + 0.4, dur: 0.13, actor: 'raccoon', do: 'squash', amount: 0.12 },
  )
  // 抖的時候肚子上冒一圈小星星：「這裡！肚子！」
  g.fx.push({ at: at + 0.24, dur: 0.35, kind: 'burst', x: BELLY.x, y: BELLY.y, emoji: '✨', n: 6, scale: 0.9 + 0.1 * k })
  g.cues.push({ at: at + 0.24, sfx: 'tap' }, { at: at + 0.4, sfx: 'tap' })
  return at + 0.55
}

/**
 * 「咚～……啵！」：東西撞上肚子那一刻 💥（在肚子右邊，不蓋臉）＋鏡頭推近肚子＋震＋同一個音效，
 * 肚子凹進去（他被壓扁、往後仰，東西陷進來一點）停 hold 秒，「啵」地彈回去（拉長、跳一下），東西被彈走。
 * k 是第幾次（越後面越深、越大），id 是撞上來的東西、at 是它撞上的位置、away 是被彈到哪裡。回傳彈回去的那一刻。
 */
function boing(H: number, k: number, hold: number, id: string, at: Vec, away: Vec, spin: number) {
  const R = H + hold
  g.moves.push(
    { at: H, dur: hold + 0.05, actor: 'raccoon', do: 'squash', amount: 0.24 + 0.09 * k },
    { at: H, dur: hold + 0.05, actor: 'raccoon', do: 'tilt', amount: 6 + 3 * k },
    { at: H, dur: hold * 0.5, actor: id, do: 'moveTo', to: { x: at.x - 3 - k, y: at.y }, ease: 'out' },
    { at: H, dur: hold + 0.05, actor: id, do: 'squash', amount: 0.15 },
    // 啵！
    { at: R, dur: 0.3, actor: 'raccoon', do: 'squash', amount: -0.3 - 0.05 * k },
    { at: R, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 2 + k },
    { at: R, dur: 0.5 + 0.1 * k, actor: id, do: 'moveTo', to: away, ease: 'out' },
    { at: R, dur: 0.5 + 0.1 * k, actor: id, do: 'rotateTo', amount: spin },
    // 閉眼得意
    { at: R + 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
  )
  g.fx.push(
    { at: H, dur: 0.4, kind: 'burst', x: BELLY.x + 10, y: BELLY.y, n: 1, scale: 1.2 + 0.3 * k },
    { at: R, dur: 0.4, kind: 'burst', x: BELLY.x + 6, y: BELLY.y, emoji: '💫', n: 5 + k, scale: 1 + 0.2 * k },
  )
  g.camera.push(
    { at: H, dur: hold + 0.2, do: 'punch', amount: 0.12 + 0.05 * k, to: { x: BELLY.x + 6, y: BELLY.y - 4 } },
    { at: H, dur: 0.3, do: 'shake', amount: 0.6 + 0.4 * k },
  )
  // 同一個「咚……啵」，一次比一次多疊一個音
  g.cues.push({ at: H, sfx: 'bonk' }, { at: R, sfx: 'boing' })
  if (k >= 1) g.cues.push({ at: R + 0.05, sfx: 'whoosh' })
  if (k >= 2) g.cues.push({ at: H + 0.05, sfx: 'rumble' })
  return R
}

// 開場：花生走到中間、抬頭看字框「肚」，拍拍肚子
const SAY1 = 0.55
// 第 1 次：皮球從右上方飛過來
const B1 = 0.75
const H1 = brace(B1) + 0.35
g.moves.push(
  { at: H1 - 0.5, dur: 0.5, actor: 'ball', do: 'moveTo', to: BALL_AT, arc: 10, ease: 'in' },
  { at: H1 - 0.5, dur: 0.5, actor: 'ball', do: 'rotateTo', amount: -300 },
)
const R1 = boing(H1, 0, 0.3, 'ball', BALL_AT, { x: 190, y: 8 }, 540)
g.builds.push({ at: R1 + 0.02, dur: 0.5, strokes: [0, 1], from: BELLY, color: partColor('⺼') })
// 第 2 次：大西瓜彈跳著過來
const B2 = R1 + 0.55
const H2 = brace(B2, 1) + 0.35
g.moves.push(
  { at: H2 - 0.55, dur: 0.55, actor: 'melon', do: 'moveTo', to: MELON_AT, arc: 16, ease: 'in' },
  { at: H2 - 0.55, dur: 0.55, actor: 'melon', do: 'rotateTo', amount: -200 },
)
const R2 = boing(H2, 1, 0.4, 'melon', MELON_AT, { x: 200, y: -25 }, 720)
g.builds.push({ at: R2 + 0.02, dur: 0.45, strokes: [2, 3], from: BELLY, color: partColor('⺼') })
// 第 3 次前停一拍：轟隆轟隆，滾來一顆比他還大的大石頭，停在前面；他傻眼、冒汗、吞口水……還是挺起肚子
const ROLL = R2 + 0.45
const STOP = ROLL + 0.5
const GULP = STOP + 0.1
const B3 = GULP + 0.45
const H3 = brace(B3, 2) + 0.2
g.moves.push(
  { at: ROLL, dur: 0.5, actor: 'rock', do: 'moveTo', to: { x: ROCK_AT.x + 12, y: ROCK_Y }, ease: 'out' },
  { at: ROLL, dur: 0.5, actor: 'rock', do: 'rotateTo', amount: -60 },
  { at: STOP, dur: 0.2, actor: 'rock', do: 'rotateTo', amount: 8 },
  { at: GULP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  { at: GULP + 0.25, dur: 0.2, actor: 'raccoon', do: 'hop', amount: -1.5 },
  { at: H3 - 0.25, dur: 0.25, actor: 'rock', do: 'moveTo', to: ROCK_AT, ease: 'in' },
  { at: H3 - 0.25, dur: 0.25, actor: 'rock', do: 'rotateTo', amount: -28 },
  // 凹得最深的時候傻眼、全身抖
  { at: H3 + 0.12, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  { at: H3 + 0.12, dur: 0.55, actor: 'raccoon', do: 'shake', amount: 1.2 },
  { at: H3 + 0.12, dur: 0.55, actor: 'rock', do: 'shake', amount: 0.8 },
)
g.fx.push({ at: GULP, dur: 0.55, kind: 'sweat', actor: 'raccoon', dx: 6 })
g.cues.push({ at: ROLL, sfx: 'rumble' }, { at: GULP + 0.25, sfx: 'gulp' })
const R3 = boing(H3, 2, 0.75, 'rock', ROCK_AT, { x: 150, y: -70 }, 400)
g.builds.push({ at: R3 + 0.02, dur: 0.5, strokes: [4, 5, 6], from: BELLY, color: partColor('土') })
g.fx.push({ at: R3, dur: 0.45, kind: 'puff', actor: 'raccoon', dx: 18, dy: 18, scale: 1.6 })
/** 國字放大到中間：他跳到右邊讓位 */
const ASIDE = R3 + 0.45
const HOME = ASIDE + 0.1
const PARK = HOME + 0.8
// 語詞那一刻：他回到中間拍拍肚子「肚子」
const WORD = PARK + 0.3
// 回馬槍：再挺肚子——飄來一根羽毛，輕輕一碰，他怕癢笑倒在地上滾
const B4 = WORD
const TOUCH = WORD + 0.85
const LAUGH = TOUCH + 0.2
const ROLLX = LAUGH + 0.12
const UP = ROLLX + 0.48
const ASK = UP + 0.4
const Q = ASK + 0.4
const ANSWER = 13.45
const ASK_S = 1.1
brace(B4, 1)

const clip: Clip = {
  format: 2,
  char: '肚',
  meta: {
    theme: '花生的肚子彈簧床',
    cast: '浣熊花生＋皮球＋大西瓜＋大石頭＋羽毛',
    gags: ['花生每次挺起肚子抖兩下，飛來的東西「咚」撞在肚子上凹進去、「啵」地被彈飛，皮球→大西瓜→比他還大的大石頭一次比一次大；回馬槍是飄來一根羽毛輕輕一碰，他怕癢笑到倒地打滾'],
  },
  duration: 15,
  bg: { top: '#D8EEFF', bottom: '#F4FAFF', floor: '#A8D67E', scenery: 'hills' },
  actors: [
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: RX, y: RY, size: RS, flip: true, hidden: true },
    { id: 'ball', emoji: '🏀', x: 185, y: 20, size: BALL_S, pivot: 'center' },
    { id: 'melon', emoji: 'prop:watermelon', x: 195, y: 40, size: MELON_S, pivot: 'center' },
    { id: 'rock', emoji: 'prop:rock', x: 215, y: ROCK_Y, size: ROCK_S, pivot: 'center' },
    { id: 'feather', emoji: 'prop:feather', x: 180, y: 18, size: FEATHER_S, float: true, pivot: 'center' },
  ],
  moves: [
    { at: 0, dur: 0.5, actor: 'raccoon', do: 'enter', from: { x: -25, y: RY }, ease: 'out' },
    ...g.moves,
    // 國字放大到中間：他跳到右邊讓位
    { at: ASIDE, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ASIDE, dur: 0.35, actor: 'raccoon', do: 'moveTo', to: { x: 138, y: RY }, arc: 8 },
    { at: ASIDE + 0.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASIDE + 0.4, actor: 'raccoon', do: 'flip' },
    // 讓位：走回中間
    { at: PARK + 0.05, dur: 0.3, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: RY } },
    { at: PARK + 0.35, actor: 'raccoon', do: 'flip' },
    // 回馬槍：羽毛輕輕飄下來（左右晃），碰到肚子
    { at: B4 - 0.2, dur: 0.5, actor: 'feather', do: 'moveTo', to: { x: 128, y: 34 }, ease: 'out' },
    { at: B4 + 0.3, dur: 0.35, actor: 'feather', do: 'moveTo', to: { x: 104, y: 48 } },
    { at: B4 + 0.3, dur: 0.35, actor: 'feather', do: 'rotateTo', amount: -30 },
    { at: B4 + 0.65, dur: 0.3, actor: 'feather', do: 'moveTo', to: FEATHER_AT },
    { at: B4 + 0.65, dur: 0.3, actor: 'feather', do: 'rotateTo', amount: 30 },
    // 搔一搔
    { at: TOUCH, dur: 0.3, actor: 'feather', do: 'tilt', amount: 25 },
    { at: TOUCH, dur: 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: TOUCH + 0.05, dur: 0.15, actor: 'raccoon', do: 'shake', amount: 0.8 },
    // 怕癢！笑到倒在地上滾
    { at: LAUGH, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/laugh' },
    { at: ROLLX, dur: 0.18, actor: 'raccoon', do: 'rotateTo', amount: -90, pivot: 'center' },
    { at: ROLLX, dur: 0.18, actor: 'raccoon', do: 'moveTo', to: { x: RX - 4, y: RY + 9 } },
    { at: ROLLX + 0.18, dur: 0.15, actor: 'raccoon', do: 'tilt', amount: 18, pivot: 'center' },
    { at: ROLLX + 0.18, dur: 0.3, actor: 'raccoon', do: 'shake', amount: 1 },
    { at: ROLLX + 0.33, dur: 0.15, actor: 'raccoon', do: 'tilt', amount: -18, pivot: 'center' },
    // 笑出來的氣把羽毛吹走
    { at: LAUGH + 0.05, dur: 0.6, actor: 'feather', do: 'moveTo', to: { x: 185, y: -10 }, ease: 'out' },
    { at: LAUGH + 0.05, dur: 0.6, actor: 'feather', do: 'rotateTo', amount: 300 },
    // 笑完爬起來
    { at: UP, dur: 0.2, actor: 'raccoon', do: 'rotateTo', amount: 90, pivot: 'center' },
    { at: UP, dur: 0.2, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: RY } },
    { at: UP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 問他：走到右前方、放大，轉向左邊的字
    { at: ASK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK, dur: 0.4, actor: 'raccoon', do: 'moveTo', to: { x: 128, y: RY + 3 }, arc: 6, ease: 'out' },
    { at: ASK + 0.2, actor: 'raccoon', do: 'flip' },
    { at: ASK, dur: 0.3, actor: 'raccoon', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: Q + 1.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: Q + 1.5, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 1.5 },
    { at: Q + 2.0, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.22, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.22, dur: 0.22, actor: 'raccoon', do: 'moveTo', to: { x: 205, y: RY + 3 }, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.45 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 語詞：拍拍肚子，肚子上一圈星星
    { at: WORD + 0.05, dur: 0.45, kind: 'burst', x: BELLY.x, y: BELLY.y, emoji: '✨', n: 8, scale: 1.3 },
    // 羽毛碰到：好癢——笑倒，笑出來的氣把羽毛吹走
    { at: LAUGH + 0.05, dur: 0.45, kind: 'blow', actor: 'raccoon', dx: 6, dy: -4, to: { x: 140, y: 24 }, scale: 1.2 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看），只有撞上肚子那一下推近肚子
    { at: 0.05, dur: 0.2, do: 'zoom', amount: 1.01, to: WIDE },
    ...g.camera,
    { at: WORD, dur: 0.6, do: 'punch', amount: 0.15, to: { x: BELLY.x, y: BELLY.y - 4 } },
    { at: TOUCH, dur: 0.5, do: 'punch', amount: 0.12, to: { x: BELLY.x + 4, y: BELLY.y - 4 } },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '肚' },
    ...g.cues,
    { at: HOME + 0.1, say: '肚' },
    { at: WORD + 0.1, say: '肚子' },
    { at: TOUCH, sfx: 'blip' },
    { at: LAUGH, sfx: 'boing' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '肚' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
