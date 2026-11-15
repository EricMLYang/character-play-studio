import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 鼻（v2）：小恐龍的鼻子超靈。畫面另一邊放著一個倒扣的紙箱（看不到裡面），他閉上眼睛、鼻子抬高「吸、吸、吸」，
// 一條橘色的香味線從箱子彎彎地飄進他的鼻尖——鼻子「叮」地一亮，像被線拉著一樣先往前衝，身體才跟上；
// 他掀開箱子「登登！」，好吃的東西亮出來，他流口水一口吃掉。東西一次比一次大、一次比一次遠：
// 第 1 次近的箱子裡是蛋糕（自從鼻尖飛出來）→ 第 2 次遠遠的箱子裡是烤肉（田）→
// 先停一拍：這次掉下來三個一模一樣的箱子，他托著下巴看不出來；鼻子一吸，被拉著一個一個聞過去（笨手笨腳把前兩個撞飛），
// 在最後一個前面鼻子狂抖——大西瓜（丌）。
// 回馬槍（第四次）：他得意地指著自己的鼻子，同樣吸吸吸、同樣被鼻子拉過去、同樣得意地掀開——是一隻臭襪子！
// 綠色的臭味線反過來鑽進他的鼻子，他捏住鼻子往後仰，眼冒金星坐倒。
// 最後畫面暗下來只剩「鼻」，小恐龍問「這是什麼字？」，手放耳邊等他回答，再指著字說「鼻！」，然後退場只留字。
// 鼻、鼻、鼻子、這是什麼字？、鼻

/** 小恐龍：最大的明星，鼻子是這支的主角。圖朝左，整支 flip 朝右（箱子都在右邊） */
const S = 44
/** 站在地上的 y（跟其他明星一樣）。整個人轉一個角度時引擎會把他抬起來一點，所以仰頭吸氣只轉 4 度，不然看起來浮在半空 */
const P = 77 - 0.42 * S
/** 每次吸氣都站在同一個地方 */
const SX = 30
/** 各個姿勢的鼻尖在原圖（朝左、0～1）裡的位置 */
const NOSE = {
  idle: [0.19, 0.36], smug: [0.19, 0.28], dash: [0.08, 0.4], reach: [0.2, 0.34], drool: [0.23, 0.34],
  point: [0.236, 0.25], surprised: [0.22, 0.36], eat: [0.23, 0.34], happy: [0.23, 0.36], stinky: [0.16, 0.42],
} as const
type Pose = keyof typeof NOSE
/** 他站在 x、擺這個姿勢、朝右、往後仰 deg 度（負的是鼻子抬高）時，鼻尖在哪裡 */
function noseAt(pose: Pose, x: number, deg = 0, s = 1) {
  const [u, v] = NOSE[pose]
  const feet = { x, y: P + 0.42 * S }
  const dx = (0.5 - u) * S * s, dy = ((v - 0.5) * S - 0.42 * S) * s
  const r = (deg * Math.PI) / 180
  return { x: feet.x + dx * Math.cos(r) - dy * Math.sin(r), y: feet.y + dx * Math.sin(r) + dy * Math.cos(r) }
}

/** 倒扣的紙箱（prop:box 轉 180 度、以中心轉）：箱口朝下貼著地板。只有一個 box 角色反覆用，用 scaleTo 換大小（以腳底縮放） */
const BOX0 = 19
/** 箱子畫成 size 大時，box 角色的 y（中心在 76.5 − 0.32 × size：原圖箱子佔 18%～96%，倒過來以後箱口在中心下面 0.32 × size） */
const boxY = (size: number, base = BOX0) => 76.5 - 0.32 * size - 0.42 * (base - size)
const boxTop = (size: number) => 76.5 - 0.32 * size - 0.46 * size
/** 站在地上的道具 */
const ground = (size: number) => 77 - 0.42 * size

const SCENT = '#FF6A00'
const STINK = '#4CAF1A'

/**
 * 一條彎彎的味道線：從 from 先往上飄、再彎彎曲曲地鑽到 to，一段一段長出來（從箱子那頭先出現）。
 * 用 line 效果串起來：每一段掛在 actor 身上（dx／dy 對到那一點），線很粗、外面還有一圈光，淺色背景上看得清楚。
 */
function trail(at: number, dur: number, actor: string, anchor: { x: number; y: number }, from: { x: number; y: number }, to: { x: number; y: number },
  color: string, width = 1.5, lift = 12): Fx[] {
  const N = 12
  const ctrl = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - lift }
  const pt = (q: number) => {
    const b = { x: (1 - q) ** 2 * from.x + 2 * (1 - q) * q * ctrl.x + q * q * to.x, y: (1 - q) ** 2 * from.y + 2 * (1 - q) * q * ctrl.y + q * q * to.y }
    // 沿著線左右扭兩個半波，兩端不扭（從箱子冒出來、鑽進鼻尖）
    const w = 2.4 * Math.sin(q * Math.PI * 5) * Math.sin(q * Math.PI)
    return { x: b.x, y: b.y + w }
  }
  const out: Fx[] = []
  for (let i = 0; i < N; i++) {
    const a = pt(i / N), b = pt((i + 1) / N)
    const t0 = at + i * 0.025
    out.push({ at: t0, dur: dur - i * 0.025, kind: 'line', actor, dx: a.x - anchor.x, dy: a.y - anchor.y, to: b, color, width })
  }
  return out
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera), cues: gs.flatMap((g) => g.cues),
})

/** 吸吸吸的時間（三下）；吸完鼻子一亮、被拉出去 */
const SNIFF = 0.55
/** 吸氣時仰頭幾度 */
const UP = 4
/** 拉到箱子前面後，掀開那一刻（登登！）比到達晚多久 */
const LIFT = 0.06

/**
 * 吸吸吸：閉眼（smug）、鼻子抬高，三下吸氣（同一個音效三下，每吸一下鼻尖閃一下、身體往上拉一下），
 * 香味線從箱子彎彎地飄進鼻尖。k 是第幾次（越後面香味線越粗），bx／bs 是香味從哪個箱子來，x 是他站的地方。
 * 香味線掛在他身上（size 44 不會被自動放大，吸的時候也不跳），所以用 squash 吸氣、不用 hop。
 */
function sniff(at: number, k: number, bx: number, bs: number, x = SX, color = SCENT): Gag {
  const tip = noseAt('smug', x, -UP)
  const top = { x: bx, y: boxTop(bs) + 1 }
  const moves: Move[] = [
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at, dur: 0.15, actor: 'rex', do: 'rotateTo', amount: -UP },
  ]
  const fx: Fx[] = [
    ...trail(at + 0.04, SNIFF - 0.02, 'rex', { x, y: P }, top, tip, color, 1.4 + 0.15 * k),
  ]
  const cues: Cue[] = []
  for (let i = 0; i < 3; i++) {
    const t = at + 0.08 + i * 0.16
    moves.push({ at: t, dur: 0.14, actor: 'rex', do: 'squash', amount: -0.06 })
    fx.push({ at: t, dur: 0.22, kind: 'burst', x: tip.x + 1, y: tip.y, n: 1, emoji: '✨', scale: 0.75 + 0.05 * k })
    cues.push({ at: t, sfx: 'blip' })
  }
  return { moves, fx, camera: [], cues }
}

/**
 * 鼻子一亮、被拉過去：鼻尖先閃一大下（🌟＋鏡頭推近鼻子），身體往前傾（鼻子先動），然後整個人被拖過去（dash、越跑越快），
 * 到了箱子前面身體還往前傾、彈回來。回傳到達的時間。
 */
function pull(at: number, k: number, from: number, to: number, dur: number): Gag & { arrive: number } {
  const tip = noseAt('smug', from, -UP)
  const moves: Move[] = [
    // 鼻子先動：從仰頭一口氣往前傾（腳還釘在地上）
    { at, dur: 0.12, actor: 'rex', do: 'rotateTo', amount: UP + 14, ease: 'out' },
    { at: at + 0.08, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    // 身體才跟上：被鼻子拖著走，越拖越快
    { at: at + 0.12, dur, actor: 'rex', do: 'moveTo', to: { x: to, y: P }, ease: 'in' },
    { at: at + 0.12 + dur, dur: 0.18, actor: 'rex', do: 'rotateTo', amount: -14, ease: 'back' },
  ]
  const fx: Fx[] = [
    { at, dur: 0.35, kind: 'burst', x: tip.x + 6, y: tip.y + 1, n: 1, emoji: '🌟', scale: 0.85 + 0.1 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.3, do: 'punch', amount: 0.06, to: { x: tip.x, y: tip.y + 6 } },
  ]
  const cues: Cue[] = [{ at, sfx: 'boing' }, { at: at + 0.12, sfx: 'whoosh' }]
  return { moves, fx, camera, cues, arrive: at + 0.12 + dur }
}

/**
 * 登登！掀開箱子：伸手一掀，箱子翻著飛走，裡面的東西「啵」地亮出來（鏡頭推近＋震、一圈 ✨、同一個音效，一次多疊一個音）。
 * x 是他站的地方、bx 箱子、food 是亮出來的東西（大小 fs）。
 */
function reveal(at: number, k: number, box: string, x: number, bx: number, fs: number, food: string, sparkle = '✨'): Gag {
  const moves: Move[] = [
    // pop 會把大小重設成 1，所以換大小寫在 pop 後面一點點（food 角色的原始大小是 F1）
    { at: at + 0.025, dur: 0.01, actor: food, do: 'scaleTo', amount: fs / F1 },
    { at: at - 0.08, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
    { at, dur: 0.4, actor: box, do: 'moveTo', to: { x: bx + 55, y: 12 }, ease: 'out' },
    { at, dur: 0.4, actor: box, do: 'rotateTo', amount: 200, ease: 'out' },
    { at: at + 0.4, dur: 0.05, actor: box, do: 'vanish' },
    { at: at + 0.02, dur: 0.3, actor: food, do: 'pop' },
  ]
  const fx: Fx[] = [
    { at: at + 0.03, dur: 0.5, kind: 'burst', x: bx, y: ground(fs) - 2, emoji: sparkle, n: 6 + 2 * k, scale: 0.9 + 0.1 * k },
  ]
  const camera: Camera[] = [
    { at: at + 0.03, dur: 0.35, do: 'punch', amount: 0.06 + 0.02 * k, to: { x: (x + bx) / 2, y: 58 } },
    { at: at + 0.03, dur: 0.3, do: 'shake', amount: 0.6 + 0.3 * k },
  ]
  const cues: Cue[] = [{ at: at + 0.03, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.09, sfx: 'clink' })
  if (k >= 2) cues.push({ at: at + 0.15, sfx: 'blip' })
  return { moves, fx, camera, cues }
}

/** 流口水（眼睛發亮）停一下，再張大嘴一口吃掉：東西縮進嘴裡、咕嚕 */
function gobble(at: number, x: number, fs: number, food: string): Gag {
  const mouth = noseAt('eat', x)
  const moves: Move[] = [
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
    { at, dur: 0.25, actor: 'rex', do: 'shake', amount: 0.5 },
    { at: at + 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/eat' },
    { at: at + 0.25, dur: 0.14, actor: food, do: 'moveTo', to: { x: mouth.x - 3, y: mouth.y + 4 + 0.42 * fs * 0.3 }, ease: 'in' },
    { at: at + 0.25, dur: 0.14, actor: food, do: 'scaleTo', amount: 0.3, ease: 'in' },
    { at: at + 0.37, dur: 0.05, actor: food, do: 'vanish' },
    { at: at + 0.39, dur: 0.22, actor: 'rex', do: 'squash', amount: 0.12 },
  ]
  return { moves, fx: [], camera: [], cues: [{ at: at + 0.38, sfx: 'gulp' }] }
}

// ---- 時間表 ----
const G1 = 0.5
/** 吃完跳回原位的時間（掀開之後） */
const BACK = 0.71
/** 箱子：第 1 次近、第 2 次遠、第 3 次三個一樣的、第 4 次在中間偏右 */
const B1 = 98, B2 = 136, B3 = [84, 109, 134], B4 = 120
const BS2 = 23, BS3 = 25, BS4 = 25
/** 東西：蛋糕 → 烤肉 → 大西瓜 → 臭襪子 */
const F1 = 14, F2 = 19, F3 = 23, F4 = 20
/** 他停在箱子左邊多遠 */
const GAP = 24
/** 語詞那一刻他站的地方（畫面中間）、問他時站的地方 */
const MX = 64
/** 語詞那一刻他放大一點 */
const WORD_S = 1.12
const AX = 34
const ASK_S = 1.1
/** 字框在上方、縮小一點：下面留給大大的小恐龍 */
const FRAME = { x: 80, y: 15.5 }
const FRAME_K = 0.46

// 第 1 次：近的箱子，蛋糕
const s1 = sniff(G1, 0, B1, BOX0)
const p1 = pull(G1 + SNIFF, 0, SX, B1 - GAP, 0.26)
const R1 = p1.arrive + LIFT
const r1 = reveal(R1, 0, 'box', B1 - GAP, B1, F1, 'food')
const e1 = gobble(R1 + 0.3, B1 - GAP, F1, 'food')
const G2 = R1 + 0.96
// 第 2 次：遠遠的箱子，烤肉（拖得更遠、更快）
const s2 = sniff(G2, 1, B2, BS2)
const p2 = pull(G2 + SNIFF, 1, SX, B2 - GAP, 0.34)
const R2 = p2.arrive + LIFT
const r2 = reveal(R2, 1, 'box', B2 - GAP, B2, F2, 'food')
const e2 = gobble(R2 + 0.3, B2 - GAP, F2, 'food')
/** 停一拍（三個箱子掉下來、他托著下巴看）之後才吸 */
const G3 = R2 + BACK + 0.77
// 第 3 次：三個一樣的箱子，香味從最後一個來；被拉著一個一個聞過去
const s3 = sniff(G3, 2, B3[2], BS3)
const p3a = pull(G3 + SNIFF, 2, SX, B3[0] - GAP, 0.2)
/** 在第一個、第二個箱子前面各聞一下（鼻子往下湊、抖一下），不是——鼻子又把他往下一個拖 */
const STOP = 0.2
const A3 = p3a.arrive
const B3t = A3 + STOP + 0.16
const C3 = B3t + STOP + 0.16
const R3 = C3 + 0.42
const r3 = reveal(R3, 2, 'box', B3[2] - GAP, B3[2], F3, 'food')
const e3 = gobble(R3 + 0.3, B3[2] - GAP, F3, 'food')
/** 國字拼好（最後一組筆畫落定）→ 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const HOME = R3 + 0.5
const PARK = R3 + 0.44 + 0.84
const WORD = PARK + 0.15
const G4 = WORD + 0.35
const ASK = 11.0
/** 回馬槍的反應：傻眼 → 捏鼻子往後仰（停 0.55 秒）→ 坐倒（停到 ask） */
const STINKY = 0.3, DIZZY = 0.85
const ANSWER = 13.6
// 第 4 次（回馬槍）：同樣吸、同樣被拉、同樣掀開——臭襪子
const s4 = sniff(G4, 3, B4, BS4, MX)
const p4 = pull(G4 + SNIFF, 3, MX, B4 - GAP, 0.16)
const R4 = p4.arrive + LIFT
const r4 = reveal(R4, 3, 'box', B4 - GAP, B4, F4, 'food', '✨')

/** 在箱子前面聞一下：閉眼、鼻子往下湊、抖一下（hard：在對的箱子前面鼻子狂抖、連閃好幾下）；聞完把身體擺正 */
function check(at: number, x: number, hard = false): Gag {
  const deg = hard ? 4 : 6
  const len = hard ? 0.4 : STOP
  const tip = noseAt('smug', x, deg)
  const moves: Move[] = [
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at, dur: 0.1, actor: 'rex', do: 'rotateTo', amount: deg },
    { at: at + 0.04, dur: len - 0.06, actor: 'rex', do: 'shake', amount: hard ? 1.6 : 0.6 },
    { at: at + len - 0.02, dur: 0.08, actor: 'rex', do: 'rotateTo', amount: -deg },
  ]
  const fx: Fx[] = [{ at: at + 0.04, dur: 0.2, kind: 'burst', x: tip.x + 1, y: tip.y, n: 1, emoji: '✨', scale: 0.6 }]
  const cues: Cue[] = [{ at: at + 0.04, sfx: 'blip' }]
  if (hard) {
    for (const d of [0.12, 0.2, 0.28]) {
      fx.push({ at: at + d, dur: 0.16, kind: 'burst', x: tip.x + 1, y: tip.y, n: 1, emoji: '✨', scale: 0.85 })
      cues.push({ at: at + d, sfx: 'blip' })
    }
  }
  return { moves, fx, camera: [], cues }
}

/** 鼻子又把他往下一個箱子拖，笨手笨腳地把剛聞過的箱子撞飛到後面 */
function bump(at: number, to: number, box: string, fly: { x: number; y: number }): Gag {
  return {
    moves: [
      { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
      { at, dur: 0.16, actor: 'rex', do: 'moveTo', to: { x: to, y: P }, ease: 'in' },
      { at: at + 0.06, dur: 0.4, actor: box, do: 'moveTo', to: fly, ease: 'out' },
      { at: at + 0.06, dur: 0.4, actor: box, do: 'rotateTo', amount: -300, ease: 'out' },
      { at: at + 0.44, dur: 0.05, actor: box, do: 'vanish' },
    ],
    fx: [], camera: [], cues: [{ at: at + 0.06, sfx: 'bonk' }],
  }
}

/**
 * 換下一回合：用過的箱子（已經翻著飛走）換到新的位置、大小，倒扣回去（掀開時轉了 200 度，轉回來），
 * 底下藏好下一個東西（還看不到），然後在 drop 那一刻從天上掉下來。drop 會把大小重設成 1，所以 scaleTo 寫在 drop 後面一點點。
 */
function setup(at: number, drop: number, bx: number, bs: number, food: string, foodAt = at, extra: Move[] = []): Move[] {
  // 箱子飛走後就能搬；東西要等上一個被吃掉（消失）以後才換（反正還藏著，看不到）
  return [
    { at, dur: 0.01, actor: 'box', do: 'moveTo', to: { x: bx, y: boxY(bs) } },
    { at, dur: 0.01, actor: 'box', do: 'rotateTo', amount: -200 },
    { at: foodAt, actor: 'food', do: 'swap', emoji: food },
    { at: foodAt, dur: 0.01, actor: 'food', do: 'moveTo', to: { x: bx, y: ground(F1) } },
    ...extra,
    { at: drop, dur: 0.45, actor: 'box', do: 'drop' },
    { at: drop + 0.005, dur: 0.01, actor: 'box', do: 'scaleTo', amount: bs / BOX0 },
  ]
}

const g3 = merge(
  s3, p3a,
  check(A3, B3[0] - GAP),
  bump(A3 + STOP, B3[1] - GAP, 'box2', { x: -20, y: 30 }),
  check(B3t, B3[1] - GAP),
  bump(B3t + STOP, B3[2] - GAP, 'box3', { x: -20, y: 36 }),
  // 就是這個！鼻子狂抖（鏡頭慢慢推近鼻子和箱子）
  check(C3, B3[2] - GAP, true),
  { moves: [], fx: [], camera: [
    { at: C3, dur: 0.36, do: 'zoom', amount: 1.12, to: { x: B3[2] - 12, y: 52 } },
    { at: R3 + 0.35, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
  ], cues: [] },
  r3,
)

/**
 * 臭襪子的綠色臭氣：一波一波從襪子冒出來（每 0.24 秒一波），三條往上高高飄、一條彎進他的鼻子。
 * 掛在他身上（他從掀開到坐倒都站在同一個地方），線很粗；往上飄的偏右，不蓋他的臉、也不碰上方的字框。
 */
function stinkWaves(from: number, to: number): Fx[] {
  const x = B4 - GAP
  const anchor = { x, y: P }
  const top = { x: B4, y: 77 - 0.75 * F4 * 1.2 }
  const out: Fx[] = []
  // 每一段線至少要 0.3 秒才長得完（trail 一段一段晚 0.025 秒出現），最後一波也在 to 之前收掉
  const d = 0.42
  for (let t = from, i = 0; t + d <= to; t += 0.24, i++) {
    out.push(...trail(t, d, 'rex', anchor, { x: top.x - 2, y: top.y }, { x: B4 + 4 + (i % 2) * 3, y: 28 }, STINK, 2.1, 4))
    out.push(...trail(t + 0.06, d - 0.06, 'rex', anchor, { x: top.x + 4, y: top.y + 2 }, { x: B4 + 20, y: 33 }, STINK, 1.9, 4))
    if (i < 3) out.push(...trail(t + 0.04, d, 'rex', anchor, { x: top.x - 5, y: top.y + 2 }, noseAt('surprised', x), STINK, 2.1, 5))
  }
  return out
}

const clip: Clip = {
  format: 2,
  char: '鼻',
  meta: { theme: '小恐龍的鼻子超靈，閉眼一吸就被鼻子拉去找好吃的', cast: '小恐龍＋紙箱＋蛋糕／烤肉／西瓜／臭襪子', gags: ['小恐龍閉眼「吸吸吸」，香味線從倒扣的紙箱飄進鼻尖，鼻子一亮就把他拖過去，掀開「登登！」亮出好吃的、一口吃掉；一次比一次大、一次比一次遠（近的蛋糕→遠的烤肉→停一拍：三個一樣的箱子，被拉著一個一個聞過去，在對的那個前面鼻子狂抖，大西瓜）；回馬槍是他得意地指著鼻子再吸一次，同樣被拉過去掀開——臭襪子，綠色臭味線鑽進鼻子，他捏著鼻子眼冒金星坐倒'] },
  duration: 15,
  // 淺藍天空、沙色地板：橘色香味線、綠色的他、綠色臭味都跳得出來
  bg: { top: '#D6EEFF', bottom: '#F4FAFF', floor: '#EED9A8', scenery: 'hills' },
  actors: [
    // 東西都畫在箱子後面（被蓋住）
    { id: 'food', emoji: 'prop:cake', x: B1, y: ground(F1), size: F1, hidden: true },
    { id: 'box', emoji: 'prop:box', x: B1, y: boxY(BOX0), size: BOX0, hidden: true, pivot: 'center' },
    { id: 'box2', emoji: 'prop:box', x: B3[0], y: boxY(BS3, BS3), size: BS3, hidden: true, pivot: 'center' },
    { id: 'box3', emoji: 'prop:box', x: B3[1], y: boxY(BS3, BS3), size: BS3, hidden: true, pivot: 'center' },
    { id: 'rex', emoji: 'hero:rex/walk', x: SX, y: P, size: S, hidden: true, flip: true },
  ],
  moves: [
    // 箱子都倒扣（箱口朝下）
    ...(['box', 'box2', 'box3'] as const).map((id): Move => ({ at: 0, dur: 0.01, actor: id, do: 'rotateTo', amount: 180 })),
    // 開場：小恐龍走進來，箱子從天上掉下來蓋住蛋糕；他抬頭看字框——鼻！
    { at: 0, actor: 'rex', do: 'enter', from: { x: -30, y: P }, dur: 0.45, ease: 'out' },
    { at: 0, dur: 0.4, actor: 'box', do: 'drop' },
    { at: 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 第 1 次
    ...s1.moves, ...p1.moves, ...r1.moves, ...e1.moves,
    // 開心地跳回原位；箱子又掉下來（遠遠的那一個）
    { at: R1 + 0.68, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: R1 + 0.68, dur: 0.26, actor: 'rex', do: 'moveTo', to: { x: SX, y: P }, arc: 5, ease: 'out' },
    ...setup(R1 + 0.455, G2 - 0.5, B2, BS2, 'prop:meat', R1 + 0.72),
    { at: G2 - 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 第 2 次
    ...s2.moves, ...p2.moves, ...r2.moves, ...e2.moves,
    { at: R2 + BACK, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: R2 + BACK, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: SX, y: P }, arc: 6, ease: 'out' },
    // 停一拍：三個一模一樣的箱子掉下來，他托著下巴看不出是哪一個
    ...setup(R2 + 0.46, G3 - 0.5, B3[2], BS3, 'prop:watermelon', R2 + 0.72),
    { at: G3 - 0.74, dur: 0.4, actor: 'box2', do: 'drop' },
    { at: G3 - 0.62, dur: 0.4, actor: 'box3', do: 'drop' },
    { at: G3 - 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
    { at: G3 - 0.35, dur: 0.3, actor: 'rex', do: 'tilt', amount: 5 },
    // 第 3 次
    ...g3.moves,
    ...e3.moves,
    // 國字放大到中間：他退到左邊
    { at: HOME - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: HOME - 0.05, dur: 0.4, actor: 'rex', do: 'moveTo', to: { x: 22, y: P }, arc: 5, ease: 'out' },
    // 語詞那一刻：走到畫面中間、放大，得意地指著自己的鼻子——鼻子！
    { at: PARK, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
    { at: PARK, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: MX, y: P } },
    { at: WORD - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'rex', do: 'hop', amount: 3 },
    { at: WORD - 0.05, dur: 0.25, actor: 'rex', do: 'scaleTo', amount: WORD_S, ease: 'back' },
    { at: G4 - 0.25, dur: 0.2, actor: 'rex', do: 'scaleTo', amount: 1 / WORD_S },
    // 回馬槍的箱子掉下來（裡面是臭襪子，觀眾看不到）
    ...setup(WORD + 0.1, G4 - 0.45, B4, BS4, '🧦', WORD + 0.1, [{ at: WORD + 0.1, actor: 'food', do: 'tint', filter: 'sepia(0.55) brightness(0.88)' }]),
    // 第 4 次：同樣吸、同樣被拉、同樣掀開
    ...s4.moves, ...p4.moves, ...r4.moves,
    // 臭襪子！傻眼 → 捏住鼻子往後仰 → 眼冒金星坐倒
    { at: R4 + 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: R4 + 0.1, dur: 0.2, actor: 'rex', do: 'squash', amount: -0.12 },
    // 站在原地（臭味線掛在他身上），捏著鼻子往後仰、抖
    { at: R4 + STINKY, actor: 'rex', do: 'swap', emoji: 'hero:rex/stinky' },
    { at: R4 + STINKY, dur: 0.15, actor: 'rex', do: 'rotateTo', amount: -6, ease: 'out' },
    { at: R4 + STINKY + 0.1, dur: 0.4, actor: 'rex', do: 'shake', amount: 0.8 },
    { at: R4 + DIZZY, dur: 0.1, actor: 'rex', do: 'rotateTo', amount: 6 },
    { at: R4 + DIZZY, actor: 'rex', do: 'swap', emoji: 'hero:rex/dizzy' },
    { at: R4 + DIZZY, dur: 0.25, actor: 'rex', do: 'squash', amount: 0.25 },
    // 問他：襪子收掉，他站起來走到左前方、放大
    { at: ASK, dur: 0.25, actor: 'food', do: 'vanish' },
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK, dur: 0.4, actor: 'rex', do: 'moveTo', to: { x: AX, y: P - 1 }, arc: 6, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: 12.65, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, dur: 0.3, actor: 'rex', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: ANSWER + 0.22, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: -45, y: P - 1 }, ease: 'in' },
  ],
  builds: [
    // 三組都從找到東西的鼻尖飛出來：自（第 1 次）、田（第 2 次）、丌（第 3 次）
    { at: R1 + 0.04, dur: 0.4, strokes: [0, 1, 2, 3, 4, 5], from: noseAt('reach', B1 - GAP), color: partColor('自') },
    { at: R2 + 0.04, dur: 0.4, strokes: [6, 7, 8, 9, 10], from: noseAt('reach', B2 - GAP), color: partColor('田') },
    { at: R3 + 0.04, dur: 0.4, strokes: [11, 12, 13], from: noseAt('reach', B3[2] - GAP), color: partColor('丌') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['rex'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx, ...p1.fx, ...r1.fx,
    ...s2.fx, ...p2.fx, ...r2.fx,
    // 停一拍：三個箱子，他冒汗
    { at: G3 - 0.4, kind: 'sweat', actor: 'rex', dx: 6 },
    ...g3.fx,
    // 語詞那一刻：鼻尖閃一下
    { at: WORD + 0.05, dur: 0.45, kind: 'burst', ...noseAt('point', MX, 0, WORD_S), n: 1, emoji: '🌟', scale: 1.1 },
    ...s4.fx, ...p4.fx, ...r4.fx,
    // 臭味：綠色的臭味線反過來鑽進他的鼻子，襪子上一直冒臭氣
    // （掛在他身上：他傻眼站著不動的這段才畫，他一往後仰就收掉）
    // （掛在他身上：他站在原地不動，一波一波從襪子冒出來，到他坐倒都還在冒）
    ...stinkWaves(R4 + 0.08, ASK - 0.05),
    { at: R4 + 0.1, dur: ASK - R4 - 0.1, kind: 'stink', actor: 'food', dy: -4, scale: 2.6 },
    { at: R4 + DIZZY + 0.06, dur: ASK - R4 - DIZZY - 0.06, kind: 'dizzy', actor: 'rex' },
  ],
  camera: [
    // 鏡頭固定在全景（自動取景會推近到把他的腳切掉），只有鼻子一亮、掀開那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...p1.camera, ...r1.camera,
    ...p2.camera, ...r2.camera,
    ...g3.camera,
    ...p4.camera, ...r4.camera,
    { at: R4 + DIZZY, dur: 0.3, do: 'shake', amount: 1.0 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.15, sfx: 'whoosh' },
    { at: 0.3, say: '鼻' },
    ...s1.cues, ...p1.cues, ...r1.cues, ...e1.cues,
    { at: G2 - 0.15, sfx: 'plop' },
    ...s2.cues, ...p2.cues, ...r2.cues, ...e2.cues,
    { at: G3 - 0.3, sfx: 'plop' },
    ...g3.cues, ...e3.cues,
    { at: HOME + 0.1, say: '鼻' },
    { at: WORD, say: '鼻子' },
    { at: G4 - 0.15, sfx: 'plop' },
    ...s4.cues, ...p4.cues, ...r4.cues,
    { at: R4 + STINKY, sfx: 'deflate' },
    { at: R4 + DIZZY, sfx: 'bonk' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '鼻' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
