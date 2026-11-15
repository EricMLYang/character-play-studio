import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 太（v2）：兔子女孩吹氣球——「呼、呼」吹到剛剛好，「叮」亮晶晶好漂亮，她開心跳一下；可是她不服輸，還要再吹大一點——
// 太大了！「砰！」氣球破掉，把她炸得往後飛。每次都是同一顆紫氣球、同一個「剛剛好→再一口→砰」，只是多吹的那幾口一次比一次多、炸得一次比一次慘：
// 多吹一口，往後跌坐（大的一撇一橫）→ 多吹兩口，被炸得趴扁（大的一捺）→ 先停一拍：多吹三口，氣球大到塞滿畫面、抖個不停，她自己都嚇到冒汗——砰！整個人被炸飛出畫面（多出來的那一點）。
// 「太」＝剛剛好就該停，還要再多一點，超過頭了：比「大」還多一點，就是「太」。
// 回馬槍（第四次）：她又吹到太大（唸「太大」），這次她學乖了、嚇得馬上停住，鬆一口氣……嘴一鬆，「咻——」氣球噴氣，拖著她滿場亂飛，最後摔在地上、扁掉的氣球蓋在她頭上。
// 最後畫面暗下來只剩「太」，她跳到前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「太！」，然後退場只留字。
// 太、太、太大、這是什麼字？、太
const SZ = 36
const P = 77 - 0.42 * SZ // 兔子（size 36）站在地上的 y
/** 她每次吹氣球站的地方（面向右邊） */
const X = 40
/** 她的嘴（blow 姿勢、翻成朝右）：氣球的結綁在這裡 */
const M = { x: X + 0.21 * SZ, y: P - 0.03 * SZ }
/** 氣球（🎈 的 3D 圖）：角色 size，往右上斜 40 度（以中心轉），整顆染成紫色（跟「大」同色） */
const B = 10
const TILT = 40
const PURPLE = 'hue-rotate(-62deg) saturate(1.15)'
const rad = (TILT * Math.PI) / 180
const cs = Math.cos(rad), sn = Math.sin(rad)
/** 3D 圖裡結與球身中心離圖中心多遠（圖寬的比例，還沒轉之前） */
const KNOT = { x: -0.09, y: 0.125 }
const BODY = { x: 0.047, y: -0.19 }
const rot = (v: { x: number; y: number }) => ({ x: v.x * cs - v.y * sn, y: v.x * sn + v.y * cs })
/** 氣球畫出來寬 W 時，角色要擺在哪，結才剛好在她嘴上（播放器：圖中心＝y＋0.42×size×(1−s)，以腳底縮放） */
function balAt(W: number) {
  const k = rot(KNOT)
  const s = W / (1.08 * B)
  return { x: M.x - k.x * W, y: M.y - k.y * W - 0.42 * B * (1 - s) }
}
/** 氣球寬 W 時，球身的中心（💥、筆畫從這裡出來） */
function bodyAt(W: number) {
  const k = rot(KNOT), b = rot(BODY)
  return { x: M.x + (b.x - k.x) * W, y: M.y + (b.y - k.y) * W }
}
/** 剛拿出來的小氣球、吹兩口剛剛好的大小、每一次多吹以後的大小 */
const W0 = 1.08 * B
const J = 38
const OVER = [62, 92, 150]

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 吹一口：她鼓臉、💨 吹進去、氣球「呼」地變大到 to */
function puff(at: number, from: number, to: number, g: Gag) {
  const p = balAt(to)
  g.moves.push(
    { at, actor: 'bunny', do: 'squash', amount: 0.1, dur: 0.16 },
    { at: at + 0.03, actor: 'bal', do: 'scaleTo', amount: to / from, dur: 0.14, ease: 'back' },
    { at: at + 0.03, actor: 'bal', do: 'moveTo', to: p, dur: 0.14, ease: 'back' },
  )
  g.fx.push({ at, kind: 'blow', actor: 'bunny', target: 'bal', dx: 7, dy: 12, n: 2, dur: 0.18 })
  g.cues.push({ at, sfx: 'whoosh' })
}

/**
 * 同一個笑點：拿出新的小氣球（R−0.3）→「呼、呼」兩口吹到剛剛好（R+0.36），「叮」亮晶晶，她開心跳一下 →
 * 她還要再大一點：再吹 k+1 口（每口一樣的「呼」），氣球抖 → 「砰！」（P）。回傳 P。
 * pause 是破之前停多久（第三次停一拍，她自己也嚇到冒汗）。
 */
function blowUp(R: number, k: number, pause: number, g: Gag): number {
  const sizes = k === 0 ? [OVER[0]] : k === 1 ? [70, OVER[1]] : [72, 108, OVER[2]]
  g.moves.push(
    { at: R - 0.32, actor: 'bal', do: 'moveTo', to: balAt(W0), dur: 0.01 },
    { at: R - 0.3, actor: 'bal', do: 'pop', dur: 0.2 },
    { at: R - 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/blow' },
    { at: R - 0.25, actor: 'bunny', do: 'squash', amount: -0.12, dur: 0.2 },
  )
  puff(R, W0, 24, g)
  puff(R + 0.18, 24, J, g)
  // 剛剛好：亮晶晶、「叮」，她開心跳一下
  const body = bodyAt(J)
  g.fx.push({ at: R + 0.38, kind: 'burst', x: body.x, y: body.y, emoji: '✨', n: 6, dur: 0.4, scale: 1.2 })
  g.cues.push({ at: R + 0.38, sfx: 'clink' })
  g.moves.push(
    { at: R + 0.38, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: R + 0.38, actor: 'bunny', do: 'hop', amount: 2, dur: 0.22 },
    { at: R + 0.38, actor: 'bal', do: 'hop', amount: 2, dur: 0.22 },
    // 可是還要再大一點
    { at: R + 0.62, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/blow' },
  )
  let w = J
  sizes.forEach((to, i) => { puff(R + 0.68 + 0.2 * i, w, to, g); w = to })
  const E = R + 0.68 + 0.2 * sizes.length
  const P = E + pause
  // 太大了：氣球抖（越抖越大）
  g.moves.push({ at: E, actor: 'bal', do: 'shake', amount: 0.8 + 0.5 * k, dur: pause })
  if (k === 2) {
    g.moves.push({ at: E + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' })
    g.fx.push({ at: E + 0.1, kind: 'sweat', actor: 'bunny', dx: -3 })
    g.cues.push({ at: E + 0.1, sfx: 'tap' }, { at: E + 0.3, sfx: 'tap' })
  }
  // 砰！
  const hit = bodyAt(w)
  g.moves.push({ at: P, actor: 'bal', do: 'vanish', dur: 0.05 })
  g.fx.push(
    { at: P, kind: 'burst', x: hit.x, y: hit.y, emoji: '💥', n: 1, dur: 0.45, scale: 1.6 + 0.8 * k },
    { at: P + 0.02, kind: 'burst', x: hit.x, y: hit.y, emoji: '🟣', n: 6 + 2 * k, dur: 0.5, scale: 0.8 + 0.4 * k },
  )
  g.camera.push(
    { at: P, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: hit.x, y: Math.max(hit.y, 46) } },
    { at: P, dur: 0.35, do: 'shake', amount: 0.9 + 0.6 * k },
  )
  g.cues.push({ at: P, sfx: 'crack' }, { at: P + 0.02, sfx: 'poof' })
  if (k >= 1) g.cues.push({ at: P + 0.05, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: P + 0.08, sfx: 'rumble' })
  return P
}

/** 被炸得往後飛：先傻眼停一下，再往左飛（一次比一次遠），落地跌坐／趴扁／飛出畫面 */
function blast(P: number, k: number, g: Gag) {
  g.moves.push({ at: P, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' })
  g.moves.push({ at: P, actor: 'bunny', do: 'shake', amount: 1.2, dur: 0.15 })
  if (k === 0) {
    g.moves.push(
      { at: P + 0.15, actor: 'bunny', do: 'moveTo', to: { x: 27, y: P_ }, arc: 3, dur: 0.25, ease: 'out' },
      { at: P + 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' },
    )
  } else if (k === 1) {
    g.moves.push(
      { at: P + 0.15, actor: 'bunny', do: 'moveTo', to: { x: 21, y: P_ }, arc: 3, dur: 0.3, ease: 'out' },
      { at: P + 0.15, actor: 'bunny', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
      { at: P + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    )
  } else {
    g.moves.push(
      { at: P + 0.15, actor: 'bunny', do: 'moveTo', to: { x: -40, y: P_ - 4 }, dur: 0.4, ease: 'in' },
      { at: P + 0.15, actor: 'bunny', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
      { at: P + 0.6, actor: 'bunny', do: 'vanish', dur: 0.01 },
    )
    g.camera.push({ at: P + 0.5, dur: 0.3, do: 'shake', amount: 1.6 })
    g.cues.push({ at: P + 0.55, sfx: 'bonk' })
  }
}
const P_ = P

/** 爬起來、走回原來的地方 */
const getUp = (at: number): Move[] => [
  { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  { at: at + 0.05, actor: 'bunny', do: 'moveTo', to: { x: X, y: P }, dur: 0.3 },
]

const g: Gag = { moves: [], fx: [], camera: [], cues: [] }
const R1 = 0.85
const P1 = blowUp(R1, 0, 0.2, g)
blast(P1, 0, g)
g.moves.push(...getUp(P1 + 0.62))
const R2 = P1 + 1.05
const P2 = blowUp(R2, 1, 0.2, g)
blast(P2, 1, g)
g.moves.push(...getUp(P2 + 0.62))
const R3 = P2 + 1.05
const P3 = blowUp(R3, 2, 0.5, g)
blast(P3, 2, g)

const builds: Build[] = [
  // 第 1 次：破掉的氣球，大的一橫一撇
  { at: P1 + 0.08, dur: 0.5, strokes: [0, 1], from: bodyAt(OVER[0]), color: partColor('大') },
  // 第 2 次：大的一捺
  { at: P2 + 0.08, dur: 0.5, strokes: [2], from: bodyAt(OVER[1]), color: partColor('大') },
  // 第 3 次：多出來的那一點
  { at: P3 + 0.08, dur: 0.5, strokes: [3], from: bodyAt(OVER[2]), color: partColor('丶') },
]
const DONE = P3 + 0.58
const HOME = DONE + 0.05
const PARK = HOME + 0.85

/** 回馬槍（第四次）：她走回來、再吹，吹到太大（唸「太大」）——這次嚇得馬上停住、鬆一口氣，嘴一鬆，氣球噴氣拖著她飛 */
const R4 = PARK + 0.45
const W4 = 100
const BIG = bodyAt(W4)
const LET = R4 + 1.0
const CRASH = LET + 0.55
const ASK = 11.1

const g4: Gag = { moves: [], fx: [], camera: [], cues: [] }
g4.moves.push(
  { at: R4 - 0.14, actor: 'bal', do: 'moveTo', to: balAt(W0), dur: 0.01 },
  { at: R4 - 0.12, actor: 'bal', do: 'pop', dur: 0.12 },
  { at: R4 - 0.12, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/blow' },
)
puff(R4, W0, 24, g4)
puff(R4 + 0.18, 24, J, g4)
puff(R4 + 0.36, J, 64, g4)
puff(R4 + 0.54, 64, W4, g4)

const clip: Clip = {
  format: 2,
  char: '太',
  meta: { theme: '兔子女孩吹氣球', cast: '兔子女孩＋紫氣球', gags: ['兔子女孩吹氣球，「呼、呼」吹到剛剛好、「叮」亮晶晶，她還要再大一點——太大了，「砰！」把她炸得往後飛，多吹的口數一次比一次多、炸得一次比一次慘（跌坐→趴扁→停一拍，氣球塞滿畫面抖個不停，整個人被炸出畫面）；回馬槍是她又吹到太大，這次學乖嚇得停住、鬆一口氣，嘴一鬆，氣球「咻——」噴氣拖著她滿場亂飛，摔在地上被扁掉的氣球蓋住頭'] },
  duration: 15,
  // 淡藍天空、草地：紫色的氣球跳得出來；太陽在右上，字框放左上（背後只有天空）
  bg: { top: '#DDF0FF', bottom: '#F4FAFF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'bal', emoji: '🎈', x: balAt(W0).x, y: balAt(W0).y, size: B, hidden: true, float: true, pivot: 'center', tint: PURPLE, half: 'top', cut: 0.67 },
    { id: 'bunny', emoji: 'hero:bunny/idle', x: X, y: P, size: SZ, hidden: true },
  ],
  moves: [
    // 氣球斜斜地綁在她嘴上（往右上 40 度）
    { at: 0, actor: 'bal', do: 'rotateTo', amount: TILT, dur: 0.01 },
    // 兔子女孩跳出來，指著左上的字框（唸第一聲）
    { at: 0, actor: 'bunny', do: 'pop', dur: 0.3 },
    { at: 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 0.3, actor: 'bunny', do: 'hop', amount: 2, dur: 0.2 },
    // 轉向右邊，拿出氣球
    { at: 0.62, actor: 'bunny', do: 'flip' },
    ...g.moves,
    // 語詞那一刻＋回馬槍：她走回來（國字讓位以後）
    { at: PARK, actor: 'bunny', do: 'pop', dur: 0.01 },
    { at: PARK, actor: 'bunny', do: 'moveTo', to: { x: -25, y: P }, dur: 0.01 },
    { at: PARK + 0.02, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: PARK + 0.15, actor: 'bunny', do: 'moveTo', to: { x: X, y: P }, dur: 0.22, ease: 'out' },
    ...g4.moves,
    // 太大了！她嚇得停住（不吹了），氣球抖
    { at: R4 + 0.75, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: R4 + 0.75, actor: 'bal', do: 'shake', amount: 1.4, dur: 0.45 },
    // 鬆一口氣：沒破！
    { at: R4 + 0.86, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    // 嘴一鬆——咻！氣球噴氣，拖著她滿場亂飛（氣球一邊飛一邊扁下去）
    { at: LET, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: LET, actor: 'bal', do: 'moveTo', to: { x: 128, y: 26 }, dur: 0.18, ease: 'in' },
    { at: LET, actor: 'bal', do: 'scaleTo', amount: 0.16, dur: 0.6 },
    { at: LET, actor: 'bal', do: 'rotateTo', amount: 540, dur: 0.6 },
    { at: LET + 0.02, actor: 'bunny', do: 'moveTo', to: { x: 110, y: 44 }, dur: 0.18, ease: 'in' },
    { at: LET + 0.18, actor: 'bal', do: 'moveTo', to: { x: 138, y: 58 }, dur: 0.14 },
    { at: LET + 0.2, actor: 'bunny', do: 'moveTo', to: { x: 120, y: 54 }, dur: 0.14 },
    { at: LET + 0.32, actor: 'bal', do: 'moveTo', to: { x: 96, y: 30 }, dur: 0.18 },
    { at: LET + 0.34, actor: 'bunny', do: 'moveTo', to: { x: 86, y: 44 }, dur: 0.18 },
    { at: LET + 0.34, actor: 'bunny', do: 'spin', times: 1, dur: 0.2, pivot: 'center' },
    // 摔下來趴扁
    { at: LET + 0.52, actor: 'bunny', do: 'moveTo', to: { x: 44, y: P }, dur: 0.12, ease: 'in' },
    { at: CRASH, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    // 扁掉的氣球掉下來蓋在她頭上
    { at: LET + 0.5, actor: 'bal', do: 'moveTo', to: { x: 56, y: 66 }, dur: 0.2, ease: 'in' },
    { at: ASK - 0.05, actor: 'bal', do: 'vanish', dur: 0.05 },
    // 問他：她爬起來，變大站到左前方，面向國字
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK, actor: 'bunny', do: 'scaleTo', amount: 1.35, dur: 0.3, ease: 'back' },
    { at: ASK - 0.05, actor: 'bunny', do: 'moveTo', to: { x: 34, y: P + 2 }, dur: 0.2 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.15, actor: 'bunny', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.65, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.1, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.62, actor: 'bunny', do: 'rotateTo', amount: -10, dur: 0.1 },
    { at: 13.62, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 13.62, actor: 'bunny', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: 13.78, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: 13.78, actor: 'bunny', do: 'flip' },
    { at: 13.78, actor: 'bunny', do: 'moveTo', to: { x: -45, y: P + 2 }, dur: 0.15, ease: 'in' },
  ],
  builds,
  glyph: [
    // 字框一開始就在左上角（背後只有天空；右邊留給越吹越大的氣球）
    { at: 0, dur: 0, do: 'park', to: { x: 22, y: 21 }, amount: 0.5 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: { x: 22, y: 21 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的兔子
    { at: ASK, dur: 2.85, do: 'ask', keep: ['bunny'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.12, dur: 0.4, do: 'home' },
    { at: 13.62, dur: 0.3, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    ...g4.fx,
    // 太大了：她嚇到冒汗
    { at: R4 + 0.8, kind: 'sweat', actor: 'bunny', dx: -3 },
    // 咻——噴氣
    { at: LET, kind: 'puff', actor: 'bal', dur: 0.5 },
    { at: CRASH, kind: 'dizzy', actor: 'bunny', dur: ASK - CRASH - 0.05 },
    { at: 13.62, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 整段保持幾乎全景（擋掉自動取景往前預看、把飛出去的她切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 46 } },
    ...g.camera,
    { at: CRASH, dur: 0.35, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.18 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.35, say: '太' },
    ...g.cues,
    { at: HOME + 0.15, say: '太' },
    ...g4.cues,
    { at: R4 + 0.78, say: '太大' },
    { at: LET, sfx: 'deflate' },
    { at: LET + 0.05, sfx: 'whoosh' },
    { at: CRASH, sfx: 'bonk' },
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: 13.64, say: '太' },
    { at: 13.66, sfx: 'cheer' },
  ],
}

export default clip
