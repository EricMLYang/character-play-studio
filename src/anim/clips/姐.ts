import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 姐（v2）：愛幫弟弟打扮的恐龍姐姐。小恐龍乖乖站著，姐姐眼睛一亮（✨）、彎腰伸手——「啵！」往他身上加一樣東西，
// 退一步遮嘴咯咯笑（好可愛 💕），弟弟垂著頭一臉無奈。同一個「眼睛一亮→啵地加上去→遮嘴笑」，加上去的一次比一次誇張：
// 頭上一個紅色蝴蝶結（女從蝴蝶結飛出來）→ 一副超大的太陽眼鏡（且的外框）→
// 先停一拍：弟弟想踮腳偷溜，被姐姐一把拉回來——一頂快跟他一樣高的大禮帽，重得他站不穩、整個人晃（且的裡面兩橫和底下一橫）。
// 語詞那一刻姐姐站在正中間、最大，被打扮成洋娃娃的弟弟指著她：「姐姐」。
// 回馬槍（第四次，反過來）：換弟弟眼睛一亮——全身用力一抖，「啵！」蝴蝶結、眼鏡、大禮帽全部飛到姐姐身上，
// 姐姐嚇一跳，換弟弟遮嘴咯咯笑；姐姐頂著一身打扮尖叫著跑走。
// 最後畫面暗下來只剩「姐」，小恐龍問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「姐！」，然後退場只留字。
// 姐、姐、姐姐、這是什麼字？、姐

/** 小恐龍（弟弟，明星）：站在左邊、面向右邊的姐姐（flip） */
const RS = 36
const RY = 77 - 0.42 * RS
const RX = 60
/** 恐龍姐姐（道具圖 prop:sis*，朝左）：畫面上最大，比弟弟高一個頭 */
const SS = 56
const SY = 77 - 0.42 * SS
const SX = 104
/** 國字放大時兩個人一起退到右邊（左上角是字框，弟弟頭上的高帽子不能鑽到字框底下） */
const R_SIDE = 120
const S_SIDE = 150
/** 字框在左上角：太陽在右上，左上角後面是素色的天空 */
const FRAME = { x: 25, y: 23 }
const FRAME_K = 0.47

/**
 * 小恐龍各個姿勢的頭頂、眼睛在圖上的位置（512 格、圖朝左；量過 public/hero/rex/*.png）。
 * 東西戴在他身上沒辦法黏著走，所以每換一個姿勢，身上的東西就照這張表搬到新的頭頂、眼睛。
 */
const REX_HEAD: Record<string, { top: [number, number]; eye: [number, number] }> = {
  hungry: { top: [215, 62], eye: [200, 205] },
  sneak: { top: [215, 95], eye: [175, 195] },
  point: { top: [250, 80], eye: [236, 125] },
  drool: { top: [240, 55], eye: [220, 115] },
}
/** 姐姐嚇一跳（sis-shock）的頭頂、眼睛 */
const SIS_TOP: [number, number] = [230, 92]
const SIS_EYE: [number, number] = [235, 150]

/** 戴上去的三樣東西（陣列順序＝繪製順序：禮帽畫在最後面，後戴上去的禮帽才不會把蝴蝶結整個蓋掉） */
const ITEMS = [
  { id: 'hat', emoji: '🎩', size: 30 },
  { id: 'bow', emoji: '🎀', size: 15 },
  { id: 'glasses', emoji: '🕶️', size: 17 },
] as const
type ItemId = (typeof ITEMS)[number]['id']
const SIZE: Record<ItemId, number> = { bow: 15, glasses: 17, hat: 30 }

/** 圖上的 (u, v) 換成舞台座標：size、中心 (x, y)、有沒有翻面 */
function stage([u, v]: [number, number], size: number, x: number, y: number, flip: boolean): Vec {
  const dx = (u / 512 - 0.5) * size
  return { x: flip ? x - dx : x + dx, y: y + (v / 512 - 0.5) * size }
}

/** 東西戴在某個頭上的位置：蝴蝶結歪戴在頭頂靠後、眼鏡在眼睛、禮帽戴在頭頂 */
function wear(id: ItemId, top: [number, number], eye: [number, number], size: number, x: number, y: number, flip: boolean, k = 1): Vec {
  if (id === 'glasses') return stage(eye, size, x, y, flip)
  if (id === 'bow') {
    const p = stage([top[0] + 40, top[1] + 8], size, x, y, flip)
    return { x: p.x, y: p.y - 0.25 * SIZE.bow * k }
  }
  const p = stage(top, size, x, y, flip)
  return { x: p.x, y: p.y - 0.3 * SIZE.hat * k }
}
const onRex = (id: ItemId, pose: string, x = RX, flip = true) => wear(id, REX_HEAD[pose].top, REX_HEAD[pose].eye, RS, x, RY, flip)
/** 飛到姐姐身上時放大一點（她的頭比較大） */
const ON_SIS_K = 1.2
const onSis = (id: ItemId, x = SX) => wear(id, SIS_TOP, SIS_EYE, SS, x, SY, false, ON_SIS_K)

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 現在戴在弟弟身上的東西 */
const worn: ItemId[] = []
/** 弟弟（連同身上的東西）一起動：arc 讓大家照同一條拋物線走（引擎不幫 arc 的移動加步伐，東西才不會跟身體對不上） */
function rexMove(at: number, dur: number, x: number, pose: string, arc: number, ease: Move['ease'] = 'inOut', flip = true) {
  g.moves.push({ at, dur, actor: 'rex', do: 'moveTo', to: { x, y: RY }, arc, ease })
  for (const id of worn) g.moves.push({ at, dur, actor: id, do: 'moveTo', to: onRex(id, pose, x, flip), arc, ease })
}
/** 弟弟換姿勢：身上的東西同一刻搬到新的頭頂、眼睛 */
function rexPose(at: number, pose: string, x = RX, flip = true) {
  g.moves.push({ at, actor: 'rex', do: 'swap', emoji: `hero:rex/${pose}` })
  for (const id of worn) g.moves.push({ at, dur: 0.06, actor: id, do: 'moveTo', to: onRex(id, pose, x, flip) })
}
/** 弟弟（連同身上的東西）一起原地動：hop／shake */
function rexAll(m: Omit<Move, 'actor'>) {
  g.moves.push({ ...m, actor: 'rex' } as Move)
  for (const id of worn) g.moves.push({ ...m, actor: id } as Move)
}

/** 姐姐眼睛一亮（✨），彎腰往前伸手——固定訊號的第一拍 */
function sparkle(D: number) {
  g.moves.push(
    { at: D, actor: 'sis', do: 'swap', emoji: 'prop:sis-give' },
    { at: D + 0.05, dur: 0.28, actor: 'sis', do: 'moveTo', to: { x: SX - 10, y: SY }, ease: 'out' },
  )
  g.fx.push({ at: D, kind: 'pop', x: SX - 18, y: 30, emoji: '✨', dur: 0.45, scale: 2.3 })
  g.cues.push({ at: D, sfx: 'blip' })
}

/**
 * 「啵！」把東西加到弟弟身上：東西在他身上彈出來、他被壓得一沉、一圈星星＋鏡頭推近＋震＋同一個音效（一次多疊一個音）。
 * 姐姐退一步、遮嘴咯咯笑（💕），弟弟垂頭無奈（冒汗）。k 是第幾次。回傳「啵」那一刻。
 */
function dress(D: number, k: number, id: ItemId, strokes: number[], part: '女' | '且') {
  sparkle(D)
  const P = D + 0.38
  if (k === 0) rexPose(P, 'hungry')
  const at = onRex(id, 'hungry')
  g.moves.push(
    { at: P, dur: 0.01, actor: id, do: 'moveTo', to: at },
    { at: P, dur: 0.22, actor: id, do: 'pop' },
  )
  // 被壓得一沉：戴著的東西跟著一起往下（hop 負的）
  const sink = 1.2 + 1.1 * k
  rexAll({ at: P + 0.05, dur: 0.3, do: 'hop', amount: -sink })
  g.moves.push({ at: P + 0.05, dur: 0.3, actor: id, do: 'hop', amount: -sink })
  worn.push(id)
  g.moves.push(
    { at: P + 0.45, actor: 'sis', do: 'swap', emoji: 'prop:sis-laugh' },
    { at: P + 0.45, dur: 0.25, actor: 'sis', do: 'moveTo', to: { x: SX, y: SY }, ease: 'out' },
  )
  g.fx.push(
    { at: P, kind: 'burst', x: at.x, y: at.y, emoji: '✨', n: 5 + k, dur: 0.45, scale: 1.0 + 0.3 * k },
    { at: P + 0.2, kind: 'sweat', actor: 'rex', dx: -9, dur: 0.6 },
    // 好可愛：愛心冒在她頭的左上（不蓋臉、不碰字框）
    { at: P + 0.5, kind: 'pop', x: SX - 24, y: 27, emoji: '💕', dur: 0.6, scale: 1.7 + 0.2 * k },
  )
  g.camera.push(
    { at: P, dur: 0.4, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: RX, y: 48 } },
    { at: P, dur: 0.25 + 0.05 * k, do: 'shake', amount: 0.5 + 0.35 * k },
  )
  g.cues.push({ at: P, sfx: 'poof' })
  if (k >= 1) g.cues.push({ at: P + 0.04, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: P + 0.08, sfx: 'rumble' })
  g.cues.push({ at: P + 0.5, sfx: 'bubble' })
  g.builds.push({ at: P + 0.06, dur: 0.4, strokes, from: id, color: partColor(part) })
  return P
}

// 開場：弟弟喊「姐！」，姐姐從右邊走進來
const ENTER = 0.3
// 第 1 次：紅色蝴蝶結
const D1 = 0.95
const P1 = dress(D1, 0, 'bow', [0, 1, 2], '女')
// 第 2 次：超大太陽眼鏡
const D2 = P1 + 0.95
const P2 = dress(D2, 1, 'glasses', [3, 4], '且')
// 第 3 次前停一拍：弟弟轉身踮腳偷溜，姐姐一把拉回來
const E = P2 + 0.85
rexPose(E, 'sneak', RX, false)
g.moves.push({ at: E, dur: 0.01, actor: 'rex', do: 'flip' })
rexMove(E + 0.12, 0.25, RX - 7, 'sneak', 2.5, 'inOut', false)
rexMove(E + 0.42, 0.25, RX - 14, 'sneak', 2.5, 'inOut', false)
const GRAB = E + 0.62
g.moves.push(
  { at: GRAB, actor: 'sis', do: 'swap', emoji: 'prop:sis-give' },
  { at: GRAB, dur: 0.2, actor: 'sis', do: 'moveTo', to: { x: SX - 16, y: SY }, ease: 'out' },
  { at: GRAB + 0.25, dur: 0.3, actor: 'sis', do: 'moveTo', to: { x: SX, y: SY }, ease: 'inOut' },
)
g.fx.push({ at: GRAB, kind: 'pop', x: SX - 18, y: 26, emoji: '❗', dur: 0.4, scale: 1.7 })
g.cues.push({ at: GRAB, sfx: 'blip' }, { at: GRAB + 0.25, sfx: 'whoosh' })
// 被拉回原位（倒退著飛回來），落地轉回去面向姐姐、又垂下頭
rexMove(GRAB + 0.25, 0.3, RX, 'sneak', 5, 'out', false)
const BACK = GRAB + 0.58
g.moves.push({ at: BACK, dur: 0.01, actor: 'rex', do: 'flip' })
rexPose(BACK, 'hungry')
g.fx.push({ at: BACK + 0.05, kind: 'sweat', actor: 'rex', dx: -9, dur: 0.5 })
g.moves.push({ at: BACK + 0.1, actor: 'sis', do: 'swap', emoji: 'prop:sis' })
// 第 3 次：快跟他一樣高的大禮帽，重得站不穩
const D3 = BACK + 0.4
const P3 = dress(D3, 2, 'hat', [5, 6, 7], '且')
rexAll({ at: P3 + 0.35, dur: 0.7, do: 'shake', amount: 2.6 })
g.fx.push({ at: P3 + 0.4, kind: 'sweat', actor: 'rex', dx: 10, dur: 0.6 })
g.cues.push({ at: P3 + 0.35, sfx: 'slide' })
// 國字放大到中間：兩個人讓到兩邊
const ASIDE = P3 + 0.85
const HOME = ASIDE + 0.15
rexMove(ASIDE, 0.35, R_SIDE, 'hungry', 5)
g.moves.push({ at: ASIDE, dur: 0.45, actor: 'sis', do: 'moveTo', to: { x: S_SIDE, y: SY } })
const PARK = HOME + 0.85
// 語詞那一刻：兩個人走回來，被打扮成洋娃娃的弟弟指著站在中間的姐姐
// 等國字縮回角落才跳回來（不從字前面經過）；姐姐先走回來
g.moves.push({ at: PARK - 0.1, dur: 0.45, actor: 'sis', do: 'moveTo', to: { x: SX, y: SY } })
rexMove(PARK + 0.15, 0.3, RX, 'hungry', 6)
const WORD = PARK + 0.5
rexPose(WORD - 0.05, 'point')
rexAll({ at: WORD - 0.05, dur: 0.3, do: 'hop', amount: 3 })
g.moves.push(
  { at: WORD - 0.05, actor: 'sis', do: 'swap', emoji: 'prop:sis-laugh' },
  { at: WORD, dur: 0.3, actor: 'sis', do: 'hop', amount: 3 },
)
g.fx.push({ at: WORD, kind: 'burst', x: SX, y: 30, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 })
// 回馬槍：換弟弟眼睛一亮
const X4 = WORD + 0.65
g.moves.push({ at: X4 - 0.15, actor: 'sis', do: 'swap', emoji: 'prop:sis' })
rexPose(X4, 'drool')
g.fx.push({ at: X4, kind: 'pop', x: RX + 14, y: 34, emoji: '✨', dur: 0.45, scale: 2.3 })
g.cues.push({ at: X4, sfx: 'blip' })
// 「啵！」全身一抖，三樣東西全部飛到姐姐身上
const P4 = X4 + 0.4
rexAll({ at: P4 - 0.12, dur: 0.15, do: 'squash', amount: 0.15 })
g.moves.push({ at: P4, dur: 0.35, actor: 'rex', do: 'shake', amount: 2.2 })
for (const [i, id] of (['hat', 'glasses', 'bow'] as const).entries()) {
  g.moves.push(
    { at: P4 + 0.04 * i, dur: 0.32, actor: id, do: 'moveTo', to: onSis(id), arc: 12 - 2 * i, ease: 'out' },
    { at: P4 + 0.04 * i, dur: 0.32, actor: id, do: 'scaleTo', amount: ON_SIS_K },
  )
}
worn.length = 0
const HIT = P4 + 0.36
g.moves.push(
  { at: HIT, actor: 'sis', do: 'swap', emoji: 'prop:sis-shock' },
  { at: HIT + 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/giggle' },
)
// 姐姐頂著一身打扮嚇一跳：她和身上的東西一起跳
const SIS_WEAR = ['sis', 'hat', 'glasses', 'bow']
for (const actor of SIS_WEAR) g.moves.push({ at: HIT, dur: 0.35, actor, do: 'hop', amount: 5 } as Move)
g.fx.push(
  { at: HIT, kind: 'burst', x: SX, y: 26, emoji: '✨', n: 8, dur: 0.5, scale: 1.6 },
  { at: HIT + 0.05, kind: 'pop', x: SX + 20, y: 30, emoji: '❗', dur: 0.5, scale: 2 },
)
g.camera.push(
  { at: HIT, dur: 0.45, do: 'punch', amount: 0.15, to: { x: SX - 10, y: 45 } },
  { at: HIT, dur: 0.4, do: 'shake', amount: 1.8 },
)
g.cues.push({ at: P4, sfx: 'poof' }, { at: P4 + 0.04, sfx: 'boing' }, { at: P4 + 0.08, sfx: 'rumble' }, { at: HIT, sfx: 'bonk' })
// 弟弟遮嘴咯咯笑，姐姐尖叫著跳兩下跑出右邊（東西跟著她一起跳）
const RUN = HIT + 0.8
g.cues.push({ at: HIT + 0.5, sfx: 'bubble' }, { at: RUN, sfx: 'whoosh' })
g.fx.push({ at: RUN, kind: 'sweat', actor: 'sis', dx: 14, dur: 0.4 })
for (const actor of SIS_WEAR) {
  const dx = actor === 'sis' ? 0 : onSis(actor as ItemId).x - SX
  const dy = actor === 'sis' ? SY : onSis(actor as ItemId).y
  g.moves.push(
    { at: RUN, dur: 0.3, actor, do: 'moveTo', to: { x: SX + 34 + dx, y: dy }, arc: 6, ease: 'linear' },
    { at: RUN + 0.3, dur: 0.3, actor, do: 'moveTo', to: { x: SX + 90 + dx, y: dy }, arc: 6, ease: 'linear' },
  )
}
const ASK = RUN + 0.7
const Q = ASK + 0.08
const ANSWER = Q + 2.5
/** 問他的時候小恐龍放大一點 */
const ASK_S = 1.15

const clip: Clip = {
  format: 2,
  char: '姐',
  meta: { theme: '愛幫弟弟打扮的姐姐', cast: '小恐龍＋恐龍姐姐＋蝴蝶結、太陽眼鏡、大禮帽', gags: ['恐龍姐姐每次眼睛一亮、彎腰伸手「啵！」往弟弟小恐龍身上加一樣打扮，退一步遮嘴咯咯笑，弟弟垂頭無奈，一次比一次誇張（紅色蝴蝶結→超大太陽眼鏡→停一拍弟弟想偷溜被一把拉回來，快跟他一樣高的大禮帽重得他站不穩）；回馬槍是第四次反過來，換弟弟眼睛一亮、全身一抖，「啵！」三樣東西全飛到姐姐身上，姐姐嚇一跳、換弟弟遮嘴笑'] },
  duration: 15,
  // 晴天的草地：綠恐龍、紅蝴蝶結、黑禮帽在淡黃天空上都看得清楚
  bg: { top: '#FFF1CC', bottom: '#FFFBEE', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'sis', emoji: 'prop:sis', x: 200, y: SY, size: SS },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RY, size: RS, flip: true },
    ...ITEMS.map((it) => ({ id: it.id, emoji: it.emoji, x: RX, y: 40, size: it.size, hidden: true, float: true })),
  ],
  moves: [
    // 開場：弟弟揮手喊「姐！」，姐姐走進來
    { at: 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/wave' },
    { at: 0.25, dur: 0.25, actor: 'rex', do: 'hop', amount: 2.5 },
    { at: ENTER, dur: 0.6, actor: 'sis', do: 'moveTo', to: { x: SX, y: SY }, ease: 'out' },
    { at: ENTER + 0.55, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    ...g.moves,
    // 問他：小恐龍跳到左前方、放大
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK, dur: 0.4, actor: 'rex', do: 'moveTo', to: { x: 30, y: RY + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: Q + 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: Q + 1.5, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: Q + 2.0, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, dur: 0.3, actor: 'rex', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: -45, y: RY + 3 }, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['rex'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: g.fx,
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看、切掉頭上的東西），只有「啵」那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '姐' },
    ...g.cues,
    { at: HOME + 0.1, say: '姐' },
    { at: WORD, say: '姐姐' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '姐' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
