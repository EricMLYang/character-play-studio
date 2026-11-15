import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 公（v2）：阿公講故事。阿公坐在搖椅上翻開故事書，楊捷睿站在前面手放耳邊聽——阿公才講一句，頭就往後一仰睡著了，
// 「呼——嚕——」嘴巴裡噴出一顆大大的 💤，咻地砸在楊捷睿身上，一次比一次大：
// 砸在頭上，他一屁股跌坐（八的一撇從 💤 上飛出來）→ 把他撞得滾到畫面邊、頭暈（八的一捺）→
// 先停一拍：阿公的頭一點、一點，他趕快蹲低抱頭——超大顆的 💤 整個壓下來，把他壓扁（厶）。
// 每次他都跳起來舉手大喊，阿公驚醒（書飛起來），笑咪咪地翻開書接著講，又睡著。「翻書→頭一仰→呼嚕噴出 💤」四次都一樣。
// 語詞那一刻：他跑到阿公面前舉手大喊「阿公！」，阿公驚醒、翻開書接著講。
// 回馬槍（第四次）：阿公才講一句又睡著了——可是這次楊捷睿先打了個大哈欠，趴在地上也睡著了；
// 兩個人一起打呼，阿公噴出一顆小 💤，他噴出一顆比誰都大的 💤，「咚」地砸在阿公身上，換阿公被叫醒。
// 阿公看看睡得香香的他，笑咪咪地站起來、拄著拐杖揮揮手，輕輕走出去。
// 最後畫面暗下來只剩「公」，楊捷睿醒來問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「公！」，然後退場只留字。
// 刻意不跟「獅」（吼聲的風把人往後吹、抓住樹）、「早」（公雞叫醒賴床的他）、「呆」（怎麼吵都叫不醒熊貓）、「熊」（睡著的熊翻身壓人）撞：
// 這支只演「阿公一講故事就睡著，打呼噴出來的 💤 砸人」，叫醒阿公很簡單（舉手一喊就醒），好笑的是他一講就又睡著。
// 公、公、阿公、這是什麼字？、公

/** 楊捷睿：站在阿公左前方、面向右邊的阿公（flip） */
const S = 34
const P = 77 - 0.42 * S
const YX = 50
/** 阿公（道具圖 prop:grandpa*，坐在搖椅上、朝左）：畫面上最大 */
const GS = 62
const GY = 77 - 0.42 * GS
const GX = 112
/** 驚醒那張的搖椅往右偏了 0.028 × size（assets/prop-sheets/README.md） */
const WAKE_DX = -0.028 * GS
/** 睡著那張張大的嘴（grandpa-sleep 的 u 0.5、v 0.32） */
const MOUTH = { x: GX, y: GY - 0.18 * GS }
/** 💤 砸到他頭上的地方 */
const HEAD = { x: YX + 3, y: 49 }
/** 字框：上方正中偏左一點（室內場景左上是窗、右上是掛畫；讓開右邊阿公的頭） */
const FRAME = { x: 74, y: 19 }
const FRAME_K = 0.47
/** 💤 的原始大小（每次 pop 回到這個大小，再 scaleTo 長大） */
const ZS = 10

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [] }

/** 「翻開書接著講」：阿公換回拿著打開的書、笑咪咪（搖椅回原位），他換成手放耳邊聽 */
function read(R: number) {
  g.moves.push(
    { at: R, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa' },
    { at: R, dur: 0.01, actor: 'grandpa', do: 'moveTo', to: { x: GX, y: GY } },
    { at: R, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
  )
}

/**
 * 「頭一仰→呼——嚕——」：阿公換成睡著打呼（搖椅往後一搖），嘴巴裡冒出一顆 💤，一邊長大一邊咻地飛到 to。
 * k 是第幾次（越後面越大）。回傳砸到的那一刻。
 */
function snore(T: number, k: number, grow: number, to: Vec) {
  const HIT = T + 0.65
  g.moves.push(
    { at: T, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-sleep' },
    { at: T, dur: 0.6, actor: 'grandpa', do: 'tilt', amount: 4 + k },
    { at: T + 0.08, dur: 0.01, actor: 'z', do: 'moveTo', to: MOUTH },
    { at: T + 0.1, dur: 0.2, actor: 'z', do: 'pop' },
    { at: T + 0.15, dur: 0.45, actor: 'z', do: 'scaleTo', amount: grow, ease: 'out' },
    { at: T + 0.35, dur: 0.3, actor: 'z', do: 'moveTo', to, ease: 'in' },
  )
  g.fx.push({ at: T + 0.3, dur: 0.4, kind: 'blow', actor: 'grandpa', dx: -4, dy: -10, target: 'yang', scale: 1.2 + 0.2 * k })
  g.cues.push({ at: T + 0.05, sfx: 'rumble' }, { at: T + 0.35, sfx: 'whoosh' })
  // 同一個「咚」，一次比一次多疊一個音
  g.cues.push({ at: HIT, sfx: 'bonk' })
  if (k >= 1) g.cues.push({ at: HIT + 0.05, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: HIT + 0.1, sfx: 'crack' })
  g.camera.push(
    { at: HIT, dur: 0.4, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: YX + 8, y: 50 } },
    { at: HIT, dur: 0.3, do: 'shake', amount: 0.6 + 0.45 * k },
  )
  return HIT
}

/** 「阿公！」：他跳起來舉手大喊，阿公驚醒（書飛起來、搖椅往後翹） */
function wake(W: number) {
  g.moves.push(
    { at: W, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: W, dur: 0.25, actor: 'yang', do: 'hop', amount: 3 },
    { at: W + 0.08, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-wake' },
    { at: W + 0.08, dur: 0.01, actor: 'grandpa', do: 'moveTo', to: { x: GX + WAKE_DX, y: GY } },
    { at: W + 0.08, dur: 0.22, actor: 'grandpa', do: 'hop', amount: 2.5 },
  )
  g.fx.push({ at: W, dur: 0.35, kind: 'pop', actor: 'yang', emoji: '❗', dx: 6, scale: 1.5 })
  g.cues.push({ at: W, sfx: 'tap' }, { at: W + 0.08, sfx: 'boing' })
}

// 第 1 次：砸在頭上，跌坐
const R1 = 0.78
const S1 = 1.18
const HIT1 = snore(S1, 0, 1.9, HEAD)
// 第 2 次：撞得滾到畫面邊
const W2 = 2.3
const R2 = 2.6
const S2 = 3.0
const HIT2 = snore(S2, 1, 2.9, HEAD)
const ROLL_X = 20
// 第 3 次前停一拍：阿公的頭一點、一點，他蹲低抱頭
const W3 = 4.65
const R3 = 4.95
const NOD1 = 5.18
const NOD2 = 5.52
const S3 = 5.85
const HIT3 = snore(S3, 2, 4.2, { x: YX, y: 56 })
/** 國字放大到中間：兩個人讓到兩邊 */
const ASIDE = HIT3 + 0.4
const HOME = ASIDE + 0.12
const PARK = 7.85
// 語詞那一刻：「阿公！」叫醒阿公
const WORD = 8.35
const R4 = WORD + 0.3
// 回馬槍：阿公又睡著，這次他也睡著，他的 💤 最大、砸醒阿公
const YAWN = R4 + 0.15
const S4 = 9.05
const HIT4 = S4 + 0.65
const UP = HIT4 + 0.32
const OUT = UP + 0.15
const ASK = 10.98
const Q = 11.05
const ANSWER = 13.55
/** 問他的時候他放大一點 */
const ASK_S = 1.15
const SIDE_Y = 16, SIDE_G = 133

// 依序排好四次
read(R1)
wake(W2)
read(R2)
wake(W3)
read(R3)
wake(WORD)
read(R4)

const clip: Clip = {
  format: 2,
  char: '公',
  meta: { theme: '阿公講故事', cast: '楊捷睿＋阿公＋💤', gags: ['阿公每次翻開故事書才講一句，頭就往後一仰睡著，「呼——嚕——」噴出一顆 💤 砸在聽故事的楊捷睿身上，一次比一次大（砸頭跌坐→撞得滾到畫面邊→停一拍，阿公的頭一點一點，超大顆的把他壓扁），每次他舉手一喊，阿公驚醒、書飛起來，笑咪咪接著講又睡著；回馬槍是第四次阿公又睡著，這次他也聽到睡著，他噴出一顆比誰都大的 💤 砸醒阿公，阿公笑咪咪地站起來揮手走出去'] },
  duration: 15,
  // 淡藍色牆壁的客廳：木頭搖椅、米色背心的阿公、紅外套的他都跳得出來
  bg: { top: '#E2EEF8', bottom: '#F4F9FD', floor: '#E6CFA6', scenery: 'room' },
  actors: [
    { id: 'grandpa', emoji: 'prop:grandpa', x: GX, y: GY, size: GS },
    { id: 'yang', emoji: 'hero:yang/dash', x: YX, y: P, size: S, hidden: true, flip: true },
    { id: 'zy', emoji: '💤', x: YX + 8, y: P, size: ZS, hidden: true, float: true },
    { id: 'z', emoji: '💤', x: MOUTH.x, y: MOUTH.y, size: ZS, hidden: true, float: true },
  ],
  moves: [
    // 開場：他從左邊跑進來，停在阿公面前——阿公講故事！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -22, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    ...g.moves.filter((m) => m.at < W2),
    // 第 1 次砸到：一屁股跌坐，💤 彈開消失
    { at: HIT1, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: HIT1, dur: 0.25, actor: 'yang', do: 'squash', amount: 0.2 },
    { at: HIT1, dur: 0.18, actor: 'z', do: 'vanish' },
    ...g.moves.filter((m) => m.at >= W2 && m.at < W3),
    // 第 2 次砸到：整個人往後滾到畫面邊，頭暈；再走回來
    { at: HIT2, dur: 0.18, actor: 'z', do: 'vanish' },
    { at: HIT2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: HIT2, dur: 0.42, actor: 'yang', do: 'moveTo', to: { x: ROLL_X, y: P }, ease: 'out' },
    { at: HIT2, dur: 0.42, actor: 'yang', do: 'spin', amount: -720, pivot: 'center' },
    { at: HIT2 + 0.42, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: HIT2 + 0.68, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: HIT2 + 0.68, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: YX, y: P } },
    ...g.moves.filter((m) => m.at >= W3 && m.at < WORD - 0.01),
    // 停一拍：阿公的頭一點、一點（差點睡著又醒），他趕快蹲低抱頭
    { at: NOD1, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-sleep' },
    { at: NOD1, dur: 0.2, actor: 'grandpa', do: 'tilt', amount: 3 },
    { at: NOD1 + 0.18, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa' },
    { at: NOD1, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: NOD1 + 0.05, dur: 0.6, actor: 'yang', do: 'shake', amount: 0.6 },
    { at: NOD2, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-sleep' },
    { at: NOD2, dur: 0.2, actor: 'grandpa', do: 'tilt', amount: 3 },
    { at: NOD2 + 0.18, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa' },
    // 第 3 次：超大顆的 💤 整個壓下來，把他壓扁（💤 在他身上停一下才破掉）
    { at: HIT3, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: HIT3, dur: 0.3, actor: 'z', do: 'squash', amount: 0.25 },
    { at: HIT3 + 0.3, dur: 0.15, actor: 'z', do: 'vanish' },
    // 國字放大到中間：他從地上彈起來讓到左邊，阿公（還在睡）連搖椅滑到右邊
    { at: ASIDE, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: ASIDE, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: SIDE_Y, y: P }, arc: 8 },
    { at: ASIDE, dur: 0.4, actor: 'grandpa', do: 'moveTo', to: { x: SIDE_G, y: GY } },
    // 讓位：阿公滑回中間，他走回阿公面前
    { at: PARK, dur: 0.45, actor: 'grandpa', do: 'moveTo', to: { x: GX, y: GY } },
    { at: PARK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.05, dur: 0.38, actor: 'yang', do: 'moveTo', to: { x: YX, y: P } },
    // 語詞：「阿公！」
    ...g.moves.filter((m) => m.at >= WORD - 0.01),
    // 回馬槍：阿公講一句……他先打一個大哈欠，趴下去睡著；阿公也頭一仰
    { at: YAWN, actor: 'yang', do: 'swap', emoji: 'hero:yang/yawn' },
    { at: S4, actor: 'yang', do: 'swap', emoji: 'hero:yang/sleep' },
    { at: S4, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-sleep' },
    { at: S4, dur: 0.6, actor: 'grandpa', do: 'tilt', amount: 4 },
    // 阿公的 💤 小小一顆往上飄
    { at: S4 + 0.08, dur: 0.01, actor: 'z', do: 'moveTo', to: MOUTH },
    { at: S4 + 0.1, dur: 0.2, actor: 'z', do: 'pop' },
    { at: S4 + 0.15, dur: 0.5, actor: 'z', do: 'moveTo', to: { x: GX + 12, y: 30 }, ease: 'out' },
    // 他的 💤 一邊長大一邊飄過去——比誰都大，「咚」砸在阿公身上
    { at: S4 + 0.12, dur: 0.01, actor: 'zy', do: 'moveTo', to: { x: YX + 10, y: P - 4 } },
    { at: S4 + 0.14, dur: 0.2, actor: 'zy', do: 'pop' },
    { at: S4 + 0.18, dur: 0.45, actor: 'zy', do: 'scaleTo', amount: 5, ease: 'out' },
    { at: S4 + 0.35, dur: 0.3, actor: 'zy', do: 'moveTo', to: { x: GX - 12, y: 54 }, ease: 'in' },
    // 換阿公被砸醒：書飛起來；阿公的小 💤 被撞飛
    { at: HIT4, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-wake' },
    { at: HIT4, dur: 0.01, actor: 'grandpa', do: 'moveTo', to: { x: GX + WAKE_DX, y: GY } },
    { at: HIT4, dur: 0.25, actor: 'grandpa', do: 'hop', amount: 3 },
    { at: HIT4, dur: 0.25, actor: 'zy', do: 'squash', amount: 0.25 },
    { at: HIT4 + 0.22, dur: 0.15, actor: 'zy', do: 'vanish' },
    { at: HIT4, dur: 0.3, actor: 'z', do: 'moveTo', to: { x: 175, y: 6 }, ease: 'out' },
    { at: HIT4 + 0.2, dur: 0.1, actor: 'z', do: 'vanish' },
    // 阿公看看睡得香香的他，笑咪咪地站起來、拄著拐杖揮揮手，輕輕走出去
    { at: UP, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-stand' },
    { at: UP, dur: 0.01, actor: 'grandpa', do: 'moveTo', to: { x: GX, y: GY } },
    { at: OUT, dur: 0.01, actor: 'grandpa', do: 'flip' },
    { at: OUT + 0.02, dur: ASK - OUT - 0.06, actor: 'grandpa', do: 'moveTo', to: { x: 190, y: GY } },
    // 問他：他醒過來跳到左前方、放大
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
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.2, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 3 }, ease: 'in' },
  ],
  builds: [
    // 三次都從砸下來的 💤 上飛出來：八的撇、八的捺、厶
    { at: HIT1, dur: 0.32, strokes: [0], from: 'z', color: partColor('八') },
    { at: HIT2, dur: 0.32, strokes: [1], from: 'z', color: partColor('八') },
    { at: HIT3, dur: 0.35, strokes: [2, 3], from: 'z', color: partColor('厶') },
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
    ...g.fx.filter((f) => f.at < WORD - 0.01),
    // 砸到的那一下：💥 在他頭的右上方（不蓋臉），一次比一次大
    { at: HIT1, dur: 0.35, kind: 'burst', x: HEAD.x + 10, y: HEAD.y - 8, n: 1, scale: 1.4 },
    { at: HIT2, dur: 0.4, kind: 'burst', x: HEAD.x + 10, y: HEAD.y - 8, n: 1, scale: 1.9 },
    { at: HIT2 + 0.42, dur: 0.45, kind: 'dizzy', actor: 'yang' },
    // 停一拍：他冒汗
    { at: NOD1 + 0.05, dur: 0.7, kind: 'sweat', actor: 'yang', dx: 8 },
    { at: HIT3, dur: 0.45, kind: 'burst', x: YX + 20, y: 52, n: 1, scale: 2.4 },
    { at: HIT3 + 0.3, dur: 0.35, kind: 'puff', actor: 'z', scale: 1.6 },
    ...g.fx.filter((f) => f.at >= WORD - 0.01),
    // 回馬槍：他打大哈欠；他的 💤 砸醒阿公（💥 在阿公頭的右上，不蓋臉）
    { at: YAWN + 0.05, dur: 0.4, kind: 'blow', actor: 'yang', dx: 4, dy: -6, to: { x: YX + 28, y: 44 }, scale: 1.1 },
    { at: S4 + 0.3, dur: 0.4, kind: 'blow', actor: 'yang', dx: 6, dy: -2, target: 'grandpa', scale: 1.6 },
    { at: HIT4, dur: 0.4, kind: 'burst', x: GX + 26, y: 22, n: 1, scale: 2.6 },
    { at: HIT4 + 0.22, dur: 0.35, kind: 'puff', actor: 'zy', scale: 1.6 },
    // 阿公看著他笑咪咪：愛心；站起來那一下冒一團煙（搖椅收起來）
    { at: UP - 0.05, dur: 0.4, kind: 'burst', x: GX + 20, y: 30, emoji: '💕', n: 5, scale: 1.2 },
    { at: UP, dur: 0.3, kind: 'puff', actor: 'grandpa', dy: 18, scale: 1.4 },
    { at: OUT + 0.3, dur: 0.6, kind: 'zzz', actor: 'yang', emoji: '💤', dx: 6 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看切到人），只有砸到那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: HIT4, dur: 0.4, do: 'punch', amount: 0.1, to: { x: GX - 10, y: 44 } },
    { at: HIT4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '公' },
    ...g.cues.filter((c) => c.at < WORD - 0.01),
    { at: NOD1, sfx: 'blip' },
    { at: NOD2, sfx: 'blip' },
    { at: HOME + 0.1, say: '公' },
    { at: WORD, say: '阿公' },
    ...g.cues.filter((c) => c.at >= WORD - 0.01),
    { at: S4 + 0.05, sfx: 'rumble' },
    { at: S4 + 0.35, sfx: 'whoosh' },
    { at: HIT4, sfx: 'bonk' },
    { at: HIT4 + 0.05, sfx: 'boing' },
    { at: HIT4 + 0.1, sfx: 'crack' },
    { at: UP, sfx: 'poof' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '公' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
