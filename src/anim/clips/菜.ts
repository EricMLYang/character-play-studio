import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 菜（v2）：忍者小老鼠辛辛苦苦種菜：挖洞、放小苗、澆水，「啵」一聲長成一棵漂亮的青菜，他閉眼得意擦汗，轉身去拿下一棵苗——
// 兔子女孩從右邊探頭、眼睛發亮流口水，踮腳溜過來「喀滋喀滋喀滋！」三口把菜啃到只剩一小截菜梗，鼓著臉頰溜回旁邊裝沒事吹口哨；
// 他轉回來，看到菜梗傻眼。同一個笑點，一次比一次多、一次比一次快：一棵（菜梗飛出艹）→ 一排三棵，她像打字機一樣一路啃過去（爫）→
// 先停一拍：他種了一棵特別大的，搬紙箱罩住、自己站在箱子上守著、左看右看……箱子底下傳來「喀滋喀滋」，他掀開只剩菜梗，她從箱子另一邊的地洞冒出來打飽嗝（木）。
// 回馬槍（第四次）：他偷笑著種下一棵「紅紅的菜」（辣椒上面蓋菜葉），故意轉身吹口哨——她照樣「喀滋！」，臉紅起來、噴火，衝去喝水；
// 他哈哈大笑，再把一棵真正的大青菜送給她：「青菜」，兩個人一起吃。最後畫面暗下來只剩「菜」，問「這是什麼字？」，等他回答，再指著字說「菜！」，退場只留字。
// 刻意不跟「飯」（餵飯不張嘴）、「森」（澆水長樹把人頂飛）、「葉」（葉堆被跳散）、「辣」（自己咬辣椒找水）撞：這支只演「種好→一轉身→被吃掉」。
// 菜、菜、青菜、這是什麼字？、菜

/** 兩個明星一樣大 */
const S = 36
const PY = 77 - 0.42 * S
/** 青菜（prop:bokchoy）：每棵都種在畫面中間這一點；一排三棵時左右各一棵 */
const VS = 36
const VY = 77 - 0.42 * VS
const XV = 84
const ROW = [58, 84, 110]
/** 一排的那三棵 size 30；特別大的那棵 size 47 */
const RS = 30 / VS
const BIG = 1.3
/** 小苗（🌱）的大小：青菜那個角色先縮成小苗，「啵」一聲再長回來 */
const SPR = 15 / VS
/** 小老鼠每次都站在菜的左邊種（面向右）；轉身去拿苗時背對菜、往左走 */
const XM = 62
const XA = 40
/** 兔子女孩每次都從右邊同一個地方探頭，溜到菜的右邊啃 */
const XK = 140
const XE = 106
/** 字框一開始就在左上（太陽在右上） */
const FRAME = { x: 21, y: 19 }
const FRAME_K = 0.42
/** 啃三口：每一口切掉上面一截（整棵 → 剩一半 → 菜梗） */
const CUTS = [0.34, 0.58, 0.8]
/** 菜梗頂端的高度（size 是畫出來的大小） */
const topAt = (size: number, cut: number) => 74 - size * (1 - cut)

const moves: Move[] = []
const fx: Fx[] = []
const camera: Camera[] = []
const cues: Cue[] = []
const lights: Light[] = []

/** 挖洞、放小苗（原本的菜梗先被挖掉） */
function dig(at: number, id: string, x: number) {
  moves.push(
    { at, dur: 0.08, actor: id, do: 'vanish' },
    { at: at + 0.09, dur: 0.01, actor: id, do: 'moveTo', to: { x, y: VY } },
    { at: at + 0.1, actor: id, do: 'swap', emoji: '🌱', half: 'whole' },
    { at: at + 0.11, dur: 0.15, actor: id, do: 'pop' },
    { at: at + 0.111, dur: 0.01, actor: id, do: 'scaleTo', amount: SPR },
  )
  fx.push(
    { at, dur: 0.3, kind: 'pop', x: x - 10, y: 66, emoji: '⛏️', scale: 1.2 },
    { at: at + 0.02, dur: 0.35, kind: 'puff', x, y: 74 },
  )
  cues.push({ at, sfx: 'tap' }, { at: at + 0.11, sfx: 'plop' })
}

/** 澆水：小苗上面下一陣水滴 */
function water(at: number, ids: string[]) {
  moves.push({ at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' })
  for (const id of ids) fx.push({ at, dur: 0.28, kind: 'rain', actor: id, emoji: '💧', n: 4, dy: -4, scale: 1.2 })
  cues.push({ at, sfx: 'splash' })
}

/** 「啵」：小苗長成一棵青菜（size 是長大後的倍率） */
function grow(at: number, id: string, size: number, k = 0) {
  moves.push(
    { at, actor: id, do: 'swap', emoji: 'prop:bokchoy' },
    { at, dur: 0.22, actor: id, do: 'scaleTo', amount: size / SPR, ease: 'back' },
  )
  fx.push({ at: at + 0.05, dur: 0.45, kind: 'burst', actor: id, emoji: '✨', n: 6, dy: 8, scale: 1.2 + 0.15 * k })
  cues.push({ at, sfx: 'bubble' })
}

/** 種好了：閉眼得意、擦擦汗 */
function proud(at: number) {
  moves.push({ at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' })
  fx.push({ at: at + 0.03, kind: 'sweat', actor: 'mouse', dx: -4 })
}

/** 一轉身（背對菜）往左走，彎腰去拿下一棵苗 */
function turnAway(at: number, x: number, dur = 0.18) {
  moves.push(
    { at, actor: 'mouse', do: 'flip' },
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at, dur, actor: 'mouse', do: 'moveTo', to: { x, y: PY } },
    { at: at + dur + 0.02, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
  )
  fx.push({ at: at + dur + 0.02, dur: 0.6, kind: 'pop', x: x - 16, y: 70, emoji: '🌱', scale: 1.1 })
}

/** 她從右邊探頭（眼睛發亮、流口水）→ 踮腳溜到菜旁邊。回傳到了的時間 */
function sneakIn(at: number, eatX: number, sp = 1) {
  moves.push(
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/peek' },
    { at, dur: 0.12 * sp, actor: 'bunny', do: 'moveTo', to: { x: XK, y: PY }, ease: 'out' },
    { at: at + 0.15 * sp, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/drool' },
    { at: at + 0.32 * sp, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/sneak' },
    { at: at + 0.32 * sp, dur: 0.16 * sp, actor: 'bunny', do: 'moveTo', to: { x: eatX, y: PY } },
  )
  fx.push({ at: at + 0.15 * sp, dur: 0.35, kind: 'pop', actor: 'bunny', emoji: '✨', dx: -14, dy: 6, scale: 1.2 })
  cues.push({ at: at + 0.15 * sp, sfx: 'gulp' })
  return at + 0.5 * sp
}

/**
 * 喀滋喀滋喀滋！（每一次都一樣）：她張大嘴，一口一口把菜從上面啃掉（整棵 → 一半 → 菜梗），
 * 每一口碎菜葉噴出來、同一個「喀」、她一嚼一嚼、鏡頭震；第一口鏡頭推近。size 是那棵菜畫出來的大小。
 */
function crunch(at: number, id: string, x: number, size: number, k: number, gap: number, punch = true) {
  moves.push({ at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/eat' })
  CUTS.forEach((c, i) => {
    const t = at + i * gap
    moves.push(
      { at: t, actor: id, do: 'swap', half: 'bottom', cut: c },
      { at: t, dur: gap * 0.8, actor: id, do: 'shake', amount: 0.8 },
      { at: t, dur: gap * 0.8, actor: 'bunny', do: 'squash', amount: 0.14 },
    )
    fx.push({ at: t, dur: 0.4, kind: 'burst', x: x + 4, y: topAt(size, c) - 2, emoji: '🍃', n: 5, scale: 1.1 + 0.1 * k })
    cues.push({ at: t, sfx: 'crack' })
    camera.push({ at: t, dur: Math.min(0.2, gap), do: 'shake', amount: 0.5 + 0.2 * k })
  })
  if (punch) camera.push({ at, dur: 0.45, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: x + 8, y: 56 } })
}

/** 她鼓著臉頰溜回右邊、背對他裝沒事吹口哨 */
function slipAway(at: number, x = XK) {
  moves.push(
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/blow' },
    { at, actor: 'bunny', do: 'flip' },
    { at, dur: 0.15, actor: 'bunny', do: 'moveTo', to: { x, y: PY } },
  )
  fx.push({ at: at + 0.05, dur: 0.42, kind: 'zzz', actor: 'bunny', emoji: '🎵', dx: -4, scale: 1.3 })
}

/** 她咻地溜出畫面（下一次再從右邊探頭）；轉回面向左 */
function leave(at: number) {
  moves.push(
    { at, dur: 0.15, actor: 'bunny', do: 'moveTo', to: { x: 190, y: PY }, ease: 'in' },
    { at: at + 0.16, actor: 'bunny', do: 'flip' },
  )
}

/** 他轉回來，看到菜梗：傻眼 */
function discover(at: number) {
  moves.push(
    { at, actor: 'mouse', do: 'flip' },
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at, dur: 0.25, actor: 'mouse', do: 'hop', amount: 3 },
  )
  cues.push({ at, sfx: 'boing' })
}

// ---- 第一次：一棵 ----
const R1 = 0.55
dig(R1, 'veg', XV)
water(R1 + 0.2, ['veg'])
grow(R1 + 0.42, 'veg', 1)
proud(R1 + 0.58)
turnAway(R1 + 0.72, XA)
const E1 = sneakIn(R1 + 0.7, XE)
crunch(E1, 'veg', XV, VS, 0, 0.12)
slipAway(E1 + 0.33)
const D1 = E1 + 0.4
discover(D1)

// ---- 第二次：一排三棵，她像打字機一樣一路啃過去 ----
const R2 = D1 + 0.42
leave(R2)
moves.push({ at: R2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/push' })
ROW.forEach((x, i) => {
  const id = ['v1', 'veg', 'v3'][i]
  const at = R2 + i * 0.14
  if (i > 0) moves.push({ at: at - 0.08, dur: 0.08, actor: 'mouse', do: 'moveTo', to: { x: x - 16, y: PY } })
  dig(at, id, x)
})
water(R2 + 0.44, ['v1', 'veg', 'v3'])
;['v1', 'veg', 'v3'].forEach((id, i) => grow(R2 + 0.62 + i * 0.04, id, RS, 1))
proud(R2 + 0.76)
turnAway(R2 + 0.86, 26, 0.25)
const E2 = sneakIn(R2 + 0.84, ROW[2] + 22, 0.7)
const G2 = 0.06
const step = 3 * G2 + 0.05
;[2, 1, 0].forEach((i, n) => {
  const id = ['v1', 'veg', 'v3'][i]
  const at = E2 + n * step
  if (n > 0) moves.push({ at: at - 0.05, dur: 0.05, actor: 'bunny', do: 'moveTo', to: { x: ROW[i] + 22, y: PY } })
  crunch(at, id, ROW[i], VS * RS, 1, G2, n === 0)
})
const B2 = E2 + 2 * step + 3 * G2
slipAway(B2 + 0.03)
const D2 = B2 + 0.08
discover(D2)

// ---- 第三次：先停一拍。特別大的一棵，搬紙箱罩住、站在上面守著……箱子底下「喀滋喀滋」 ----
const R3 = D2 + 0.42
leave(R3)
const BOX = 58
/** 紙箱用 v3（size 30）放大成 BOX；放大以腳底為準，所以站在地上的 y 照 size 30 算 */
const BOXY = 77 - 0.42 * 30
moves.push(
  { at: R3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
  { at: R3, dur: 0.15, actor: 'mouse', do: 'moveTo', to: { x: XM, y: PY } },
  { at: R3 + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/push' },
  // 菜梗都挖掉
  { at: R3 + 0.15, dur: 0.08, actor: 'v1', do: 'vanish' },
  { at: R3 + 0.15, dur: 0.08, actor: 'v3', do: 'vanish' },
)
dig(R3 + 0.15, 'veg', XV)
water(R3 + 0.33, ['veg'])
grow(R3 + 0.55, 'veg', BIG, 2)
// 停一拍：他看看大青菜，再看看右邊（她都從那裡來）……拿出紙箱
const LOOK3 = R3 + 0.75
moves.push(
  { at: LOOK3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
)
fx.push({ at: LOOK3, kind: 'sweat', actor: 'mouse', dx: -4 })
cues.push({ at: LOOK3, sfx: 'gulp' })
const LIFT = LOOK3 + 0.22
moves.push(
  { at: LIFT - 0.02, dur: 0.01, actor: 'v3', do: 'moveTo', to: { x: XM + 10, y: BOXY - 28 } },
  { at: LIFT - 0.02, actor: 'v3', do: 'swap', emoji: 'prop:box', half: 'whole' },
  { at: LIFT, dur: 0.15, actor: 'v3', do: 'pop' },
  { at: LIFT + 0.001, dur: 0.01, actor: 'v3', do: 'scaleTo', amount: BOX / 30 },
  { at: LIFT, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/lift' },
)
// 碰！紙箱整個罩住大青菜
const SLAM = LIFT + 0.18
moves.push(
  { at: SLAM, dur: 0.14, actor: 'v3', do: 'moveTo', to: { x: XV, y: BOXY }, ease: 'in' },
)
cues.push({ at: SLAM + 0.14, sfx: 'bonk' })
camera.push({ at: SLAM + 0.14, dur: 0.25, do: 'shake', amount: 0.8 })
fx.push({ at: SLAM + 0.14, dur: 0.4, kind: 'puff', x: XV, y: 74 })
// 跳上箱子、蹲在上面左看右看守著
const GUARD = SLAM + 0.18
const ON = { x: XV - 2, y: 74 - BOX * 0.78 - 10 }
moves.push(
  { at: GUARD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/peek' },
  { at: GUARD, dur: 0.2, actor: 'mouse', do: 'moveTo', to: ON, arc: 6 },
  { at: GUARD + 0.2, actor: 'mouse', do: 'flip' },
  { at: GUARD + 0.34, actor: 'mouse', do: 'flip' },
)
// 箱子底下：喀滋喀滋喀滋（箱子一跳一跳、碎葉從底下噴出來）
const C3 = GUARD + 0.48
;[0, 1, 2].forEach((i) => {
  const t = C3 + i * 0.12
  moves.push(
    { at: t, dur: 0.1, actor: 'v3', do: 'hop', amount: 1.5 },
    { at: t, actor: 'veg', do: 'swap', half: 'bottom', cut: CUTS[i] },
  )
  fx.push({ at: t, dur: 0.4, kind: 'burst', x: XV + (i % 2 ? -14 : 14), y: 70, emoji: '🍃', n: 5, scale: 1.3 })
  cues.push({ at: t, sfx: 'crack' })
  camera.push({ at: t, dur: 0.12, do: 'shake', amount: 1.0 })
})
camera.push({ at: C3, dur: 0.45, do: 'punch', amount: 0.14, to: { x: XV, y: 52 } })
// 他在上面被震得一抖一抖、冒汗（還沒想到她在底下）
moves.push({ at: C3, dur: 0.36, actor: 'mouse', do: 'shake', amount: 1 })
fx.push({ at: C3 + 0.05, kind: 'sweat', actor: 'mouse', dx: -6, dy: 8 })
// 跳下來掀開箱子：只剩菜梗；她從箱子另一邊的地洞冒出來打飽嗝
const OPEN = C3 + 0.36
moves.push(
  { at: OPEN, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/lift' },
  { at: OPEN, dur: 0.16, actor: 'mouse', do: 'moveTo', to: { x: XM, y: PY }, arc: 4 },
  { at: OPEN + 0.05, dur: 0.25, actor: 'v3', do: 'moveTo', to: { x: -40, y: 40 }, ease: 'in' },
  { at: OPEN + 0.3, dur: 0.12, actor: 'v3', do: 'vanish' },
  { at: OPEN - 0.05, dur: 0.01, actor: 'v1', do: 'moveTo', to: { x: 126, y: 77 - 0.42 * 20 } },
  { at: OPEN - 0.04, actor: 'v1', do: 'swap', emoji: '🕳️', half: 'whole' },
  { at: OPEN, dur: 0.15, actor: 'v1', do: 'pop' },
  { at: OPEN - 0.02, dur: 0.01, actor: 'bunny', do: 'moveTo', to: { x: 128, y: PY + 20 } },
  { at: OPEN + 0.08, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/full' },
  { at: OPEN + 0.08, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: 132, y: PY }, ease: 'out' },
)
const D3 = OPEN + 0.18
moves.push({ at: D3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' })
cues.push({ at: OPEN + 0.08, sfx: 'poof' }, { at: OPEN + 0.32, sfx: 'hic' })
fx.push(
  { at: OPEN + 0.06, dur: 0.4, kind: 'puff', x: 128, y: 74 },
  { at: OPEN + 0.32, dur: 0.4, kind: 'pop', actor: 'bunny', emoji: '💨', dx: -16, dy: 10, scale: 1.2 },
)
// ---- 拼好：國字放大到中間（他退到左邊，她還在右邊揉肚子，國字讓位時她跳進地洞不見） ----
const HOME = D3 + 0.42
const PARK = HOME + 0.8
moves.push(
  { at: HOME - 0.02, dur: 0.18, actor: 'mouse', do: 'moveTo', to: { x: 28, y: PY } },
  { at: HOME + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
  { at: PARK - 0.1, dur: 0.15, actor: 'bunny', do: 'moveTo', to: { x: 190, y: PY }, ease: 'in' },
  { at: PARK - 0.1, dur: 0.12, actor: 'v1', do: 'vanish' },
)

// ---- 回馬槍（第四次）：「紅紅的菜」——辣椒上面蓋菜葉 ----
const R4 = PARK + 0.25
const CHILI = 34
moves.push(
  { at: R4 - 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
  { at: R4 - 0.15, dur: 0.15, actor: 'mouse', do: 'moveTo', to: { x: XM, y: PY } },
  { at: R4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/push' },
  // 菜梗挖掉，換成躺著的辣椒、上面蓋一叢菜葉（只畫青江菜上面的葉子）
  { at: R4, dur: 0.08, actor: 'veg', do: 'vanish' },
  { at: R4 + 0.09, dur: 0.01, actor: 'veg', do: 'moveTo', to: { x: XV, y: 77 - 0.42 * CHILI + 3 } },
  { at: R4 + 0.1, actor: 'veg', do: 'swap', emoji: 'prop:chili', half: 'whole' },
  { at: R4 + 0.11, dur: 0.15, actor: 'veg', do: 'pop' },
  { at: R4 + 0.111, dur: 0.01, actor: 'veg', do: 'scaleTo', amount: CHILI / VS },
  { at: R4 + 0.2, dur: 0.01, actor: 'v1', do: 'moveTo', to: { x: XV - 2, y: 62 } },
  { at: R4 + 0.21, actor: 'v1', do: 'swap', emoji: 'prop:bokchoy', half: 'top', cut: 0.55 },
  { at: R4 + 0.22, dur: 0.15, actor: 'v1', do: 'pop' },
  { at: R4 + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
)
fx.push({ at: R4, dur: 0.3, kind: 'pop', x: XV - 10, y: 66, emoji: '⛏️', scale: 1.2 }, { at: R4 + 0.02, dur: 0.35, kind: 'puff', x: XV, y: 74 })
cues.push({ at: R4, sfx: 'tap' }, { at: R4 + 0.11, sfx: 'plop' }, { at: R4 + 0.22, sfx: 'plop' })
// 故意轉身、吹口哨
const T4 = R4 + 0.38
moves.push(
  { at: T4, actor: 'mouse', do: 'flip' },
  { at: T4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
  { at: T4, dur: 0.18, actor: 'mouse', do: 'moveTo', to: { x: XA, y: PY } },
  { at: T4 + 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/blow' },
)
fx.push({ at: T4 + 0.2, dur: 1.0, kind: 'zzz', actor: 'mouse', emoji: '🎵', dx: -10 })
const E4 = sneakIn(T4, XE, 0.8)
// 喀滋！一口：菜葉不見，咬到的是辣椒
const BITE4 = E4 + 0.02
moves.push(
  { at: BITE4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/eat' },
  { at: BITE4, dur: 0.1, actor: 'bunny', do: 'squash', amount: 0.14 },
  { at: BITE4, dur: 0.08, actor: 'v1', do: 'vanish' },
  { at: BITE4, dur: 0.15, actor: 'veg', do: 'shake', amount: 0.8 },
)
fx.push({ at: BITE4, dur: 0.4, kind: 'burst', x: XV + 4, y: 50, emoji: '🍃', n: 5, scale: 1.4 })
cues.push({ at: BITE4, sfx: 'crack' })
camera.push({ at: BITE4, dur: 0.15, do: 'shake', amount: 0.8 })
// 停半拍……臉紅起來、噴火！
const HOT = BITE4 + 0.28
moves.push(
  { at: HOT, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/spicy' },
  { at: HOT, dur: 0.45, actor: 'bunny', do: 'shake', amount: 1.2 },
  { at: HOT + 0.1, actor: 'mouse', do: 'flip' },
  { at: HOT + 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
)
fx.push(
  { at: HOT, dur: 0.5, kind: 'blow', actor: 'bunny', to: { x: XV - 20, y: 40 }, emoji: '🔥', n: 6, dx: -8, dy: 10, scale: 1.6 },
  { at: HOT, dur: 0.4, kind: 'burst', actor: 'bunny', emoji: '💥', n: 1, dx: -10, dy: 4, scale: 1.4 },
)
cues.push({ at: HOT, sfx: 'whoosh' }, { at: HOT + 0.04, sfx: 'rumble' })
camera.push({ at: HOT, dur: 0.45, do: 'punch', amount: 0.15, to: { x: XE, y: 54 } }, { at: HOT, dur: 0.35, do: 'shake', amount: 1.6 })
// 衝去喝水（右邊畫面外）
const RUN4 = HOT + 0.4
moves.push(
  { at: RUN4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flee' },
  { at: RUN4, dur: 0.15, actor: 'bunny', do: 'moveTo', to: { x: 195, y: PY }, ease: 'in' },
)
cues.push({ at: RUN4 + 0.2, sfx: 'splash' })

// ---- 語詞那一刻：他把一棵真正的大青菜送給她——青菜！ ----
const WORD = RUN4 + 0.22
moves.push(
  { at: WORD - 0.1, dur: 0.08, actor: 'veg', do: 'vanish' },
  { at: WORD - 0.01, dur: 0.01, actor: 'veg', do: 'moveTo', to: { x: 82, y: VY } },
  { at: WORD, actor: 'veg', do: 'swap', emoji: 'prop:bokchoy' },
  { at: WORD, dur: 0.2, actor: 'veg', do: 'pop' },
  { at: WORD + 0.001, dur: 0.25, actor: 'veg', do: 'scaleTo', amount: BIG, ease: 'back' },
  { at: WORD - 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
  { at: WORD - 0.05, dur: 0.2, actor: 'mouse', do: 'moveTo', to: { x: 46, y: PY } },
  { at: WORD - 0.1, actor: 'bunny', do: 'flip' },
  { at: WORD - 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/drool' },
  { at: WORD - 0.1, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: 120, y: PY }, ease: 'out' },
  { at: WORD + 0.15, dur: 0.3, actor: 'bunny', do: 'hop', amount: 4 },
)
fx.push(
  { at: WORD, dur: 0.6, kind: 'burst', x: 82, y: 50, n: 8, emoji: '✨', scale: 1.6 },
  { at: WORD - 0.1, kind: 'sweat', actor: 'bunny', dx: 4 },
)
cues.push({ at: WORD, sfx: 'bubble' })
// 兩個人一起吃
const EAT = WORD + 0.35
moves.push(
  { at: EAT, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
  { at: EAT, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/eat' },
  { at: EAT, dur: 0.12, actor: 'bunny', do: 'squash', amount: 0.12 },
  { at: EAT + 0.06, dur: 0.12, actor: 'mouse', do: 'squash', amount: 0.12 },
)
cues.push({ at: EAT, sfx: 'crack' })

// ---- 問他 ----
const ASK = WORD + 0.75
/** 問句唸完（0.97 秒）再安靜 1.5 秒以上才回答 */
const ANSWER = ASK + 0.05 + 0.974 + 1.53
const AS = 1.22
const APY = 77 - 0.42 * S * AS
moves.push(
  { at: ASK, dur: 0.15, actor: 'veg', do: 'vanish' },
  { at: ASK + 0.45, dur: 0.25, actor: 'mouse', do: 'moveTo', to: { x: 26, y: APY }, ease: 'out' },
  { at: ASK + 0.45, dur: 0.25, actor: 'mouse', do: 'scaleTo', amount: AS },
  { at: ASK + 0.45, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: 134, y: APY }, ease: 'out' },
  { at: ASK + 0.45, dur: 0.25, actor: 'bunny', do: 'scaleTo', amount: AS },
  { at: ASK + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
  { at: ASK + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  { at: ASK + 1.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
  { at: ASK + 1.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
  { at: ASK + 1.6, dur: 0.3, actor: 'mouse', do: 'hop', amount: 1.5 },
  { at: ASK + 1.7, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
  { at: ASK + 2.1, dur: 0.3, actor: 'mouse', do: 'hop', amount: 1.5 },
  { at: ASK + 2.2, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
  { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
  { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
  { at: ANSWER, dur: 0.3, actor: 'mouse', do: 'hop', amount: 7 },
  { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
  { at: ANSWER + 0.08, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
  { at: ANSWER + 0.08, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
  { at: ANSWER + 0.08, dur: 0.15, actor: 'mouse', do: 'moveTo', to: { x: -40, y: APY }, ease: 'in' },
  { at: ANSWER + 0.08, dur: 0.15, actor: 'bunny', do: 'moveTo', to: { x: 200, y: APY }, ease: 'in' },
)

const clip: Clip = {
  format: 2,
  char: '菜',
  meta: { theme: '小老鼠種青菜，兔子女孩一轉身就吃掉', cast: '忍者小老鼠＋兔子女孩＋青江菜＋紙箱＋辣椒', gags: ['忍者小老鼠挖洞、放小苗、澆水，啵一聲長成一棵漂亮的青菜，他閉眼得意擦汗、一轉身去拿下一棵苗，兔子女孩就從右邊探頭流口水、溜過來喀滋喀滋喀滋三口啃到只剩菜梗，鼓著臉頰溜回去裝沒事吹口哨，他轉回來傻眼；一次比一次多（一棵→一排三棵她像打字機一路啃過去→停一拍：特別大的一棵，他用紙箱罩住、站在上面守著，箱子底下照樣喀滋喀滋，她從地洞冒出來打飽嗝）；回馬槍是他偷笑著種一棵蓋著菜葉的辣椒、故意轉身吹口哨，她照樣喀滋一口，辣到噴火衝去喝水，他哈哈大笑，再送她一棵真的青菜一起吃'] },
  duration: 15,
  // 菜園：淡淡的天空、嫩綠的草地（綠色的青菜要看得清楚，地用偏黃的草色）；太陽在右上，字框在左上
  bg: { top: '#DDF1FF', bottom: '#F6FBFF', floor: '#D9C99A', scenery: 'hills' },
  actors: [
    { id: 'v1', emoji: 'prop:bokchoy', x: ROW[0], y: 77 - 0.42 * 30, size: 30, hidden: true },
    { id: 'veg', emoji: 'prop:bokchoy', x: XV, y: VY, size: VS, hidden: true },
    { id: 'v3', emoji: 'prop:bokchoy', x: ROW[2], y: 77 - 0.42 * 30, size: 30, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/walk', x: XM, y: PY, size: S, hidden: true, flip: true },
    { id: 'bunny', emoji: 'hero:bunny/peek', x: 190, y: PY, size: S },
  ],
  moves: [
    // 開場：小老鼠走進菜園，回頭指著字框——菜！
    { at: 0, dur: 0.35, actor: 'mouse', do: 'enter', from: { x: -25, y: PY }, ease: 'out' },
    { at: 0.36, actor: 'mouse', do: 'flip' },
    { at: 0.36, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: R1 - 0.02, actor: 'mouse', do: 'flip' },
    { at: R1 - 0.02, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/push' },
    ...moves,
  ],
  builds: [
    // 每次被啃到只剩菜梗，就從菜梗上飛出一組筆畫
    { at: E1 + 0.3, dur: 0.45, strokes: [0, 1, 2], from: 'veg', color: partColor('艹') },
    { at: B2, dur: 0.45, strokes: [3, 4, 5, 6], from: 'v1', color: partColor('爫') },
    { at: OPEN + 0.12, dur: 0.45, strokes: [7, 8, 9, 10], from: 'veg', color: partColor('木') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.3, do: 'park' },
    { at: PARK + 0.3, dur: 0.3, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.25 - ASK, do: 'ask', keep: ['mouse', 'bunny'], to: { x: 80, y: 42 }, amount: 0.78 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.3, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...fx,
    { at: ANSWER, dur: 0.25, kind: 'burst', x: 80, y: 40, emoji: '🌟', n: 10 },
  ],
  camera: [
    // 鏡頭鎖全景（自動取景往前預看會切到人或字），只有啃的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...camera,
  ],
  lights: [
    ...lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.4, say: '菜' },
    ...cues,
    { at: HOME + 0.1, say: '菜' },
    { at: WORD, say: '青菜' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '菜' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
