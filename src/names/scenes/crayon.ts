// 演的是字面意思：蠟筆＋小＋新——小恐龍拿到一支全新的蠟筆，在工地的白牆上畫什麼，那個東西就活過來（沒有粗眉毛的小孩、沒有小白狗、沒有露屁股）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小恐龍用新蠟筆在牆上畫獅子，敲一下，獅子就「啵」地活過來跳下牆撲他，畫得一次比一次大。
// 同一個動作（舉筆刷刷刷畫 → 退一步得意欣賞 → 拿筆敲一下 → 啵！變回彩色跳下來撲他）、同一串「刷—叩—啵—咚」做三次：
// 小獅子撲到肚子、他嚇一跳 → 中獅子把他撲得一屁股跌坐 → 第三次跳上跳下畫一隻超大的，敲一下沒反應、再敲還是沒反應（停一拍），
// 他得意地轉身要走——背後「吼！」活過來了。反轉：他急中生智在牆上畫一扇門，門一活過來他就鑽進去，
// 門又變回畫，追過來的大獅子一頭撞在牆上；他從牆頭冒出來，舉著蠟筆亮相：「蠟筆小新」。

// ── 站位 ──
const S = 36 // 小恐龍
const KY = 77 - 0.42 * S
// 牆（prop:brick-wall 染成淡淡的粉白）：x 約 58～122、頂在 y 40
const WS = 70
const WALL = { x: 90, y: 77 - 0.42 * WS }
const TOP = WALL.y - 0.107 * WS // 牆頂
// 牆上的畫：還沒活的時候是黑白線稿（像著色本），活過來才有顏色
const SKETCH = 'grayscale(1) contrast(2.4) brightness(1.25) sepia(0.5)'
const WALL_TINT = 'saturate(0.3) contrast(0.35) brightness(1.6)'
/** 三隻獅子：畫在牆上的大小 d、位置，活過來以後的大小 s */
const LIONS = [
  { d: 20, x: 86, y: 61, s: 24 },
  { d: 28, x: 91, y: 58.5, s: 36 },
  { d: 38, x: 98, y: 57, s: 50 },
]
const DOOR = { x: 67, s: 24 }
const DOOR_Y = 77 - 0.42 * DOOR.s
const LY = (s: number) => 77 - 0.42 * s
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

// ── 拿著蠟筆的手（小恐龍朝右時，手相對身體的位置；量過） ──
type Pose = 'idle' | 'reach' | 'point' | 'know' | 'smug' | 'surprised' | 'fall' | 'flee'
const HAND: Record<Pose, [number, number]> = {
  idle: [9.6, 7.8], reach: [12, 0.2], point: [10.7, -5], know: [8.7, -10.2],
  smug: [9, 6.6], surprised: [9, 7], fall: [12, 9.6], flee: [8.6, -5.2],
}
/** 蠟筆筆尖朝前上方（轉 90°）握在後半截：中心離拳頭 G，筆尖離拳頭 TIP（斜 45°，各軸） */
const PEN = 10
const G = 1.6
const TIP = 5.4

const M: Move[] = []
const st = { x: -14, y: KY, pose: 'know' as Pose, dir: 1 }
const penAt = (x: number, y: number, pose: Pose, dir: number) => ({
  x: x + dir * (HAND[pose][0] + G), y: y + HAND[pose][1] - G,
})
/** 小恐龍換姿勢／轉身／走到哪：蠟筆跟著手走（同一段時間、同一種緩動） */
function rex(at: number, o: { pose?: Pose; x?: number; dur?: number; ease?: Move['ease']; arc?: number; dir?: number }) {
  const dur = o.dur ?? 0.08
  if (o.dir !== undefined && o.dir !== st.dir) {
    M.push(
      { at, actor: 'rex', do: 'flip' },
      { at, actor: 'pen', do: 'flip' },
      { at, actor: 'pen', do: 'rotateTo', amount: o.dir > 0 ? -180 : 180, dur: 0.01 },
    )
    st.dir = o.dir
  }
  if (o.pose && o.pose !== st.pose) {
    M.push({ at, actor: 'rex', do: 'swap', emoji: `hero:rex/${o.pose}` })
    st.pose = o.pose
  }
  const moved = o.x !== undefined && o.x !== st.x
  if (moved) {
    st.x = o.x!
    M.push({ at, actor: 'rex', do: 'moveTo', to: { x: st.x, y: st.y }, dur, ease: o.ease, arc: o.arc })
  }
  M.push({ at, actor: 'pen', do: 'moveTo', to: penAt(st.x, st.y, st.pose, st.dir), dur: moved ? dur : 0.06, ease: o.ease, arc: o.arc })
}
function hop(at: number, amount: number, dur: number) {
  M.push({ at, actor: 'rex', do: 'hop', amount, dur }, { at, actor: 'pen', do: 'hop', amount, dur })
}

/**
 * 刷刷刷：舉手（point）在牆上左右來回畫，筆尖從上畫到下，畫一筆露一截。
 * id＝牆上那張畫，c＝中心，w＝左右幅度，top／bot＝筆尖從哪畫到哪，n 筆、每筆 step 秒。回傳畫完的時間。
 */
function scribble(T: number, id: string, c: number, w: number, top: number, bot: number, n: number, step: number) {
  const tipY = KY + HAND.point[1] - TIP // 站在地上時筆尖的高度
  const emoji = id === 'door' ? '🚪' : 'prop:lion'
  M.push({ at: T, actor: id, do: 'pop', dur: 0.1 })
  for (let i = 0; i < n; i++) {
    const at = T + i * step
    const y = top + ((bot - top) * i) / (n - 1)
    const x = c + (i % 2 ? w : -w) - (HAND.point[0] + TIP)
    rex(at, { pose: 'point', x, dur: step, ease: 'inOut' })
    hop(at, Math.max(-3, tipY - y), step)
    M.push({ at, actor: 'pen', do: 'tilt', amount: i % 2 ? 18 : -18, dur: step })
    M.push({ at: at + step * 0.7, actor: id, do: 'swap', emoji, half: i === n - 1 ? 'whole' : 'top', cut: (i + 1.6) / (n + 0.6) })
  }
  return T + n * step
}

/** 拿筆往前戳一下畫、彈回來。x＝敲的時候站哪 */
function tap(at: number, x: number) {
  rex(at - 0.15, { pose: 'reach', x, dur: 0.15, ease: 'out' })
  M.push({ at, actor: 'pen', do: 'moveTo', to: penAt(x + 3, KY, 'reach', 1), dur: 0.07, ease: 'in' })
  M.push({ at: at + 0.08, actor: 'pen', do: 'moveTo', to: penAt(x, KY, 'reach', 1), dur: 0.12, ease: 'out' })
}
/** 敲畫的時候站哪：筆尖剛好碰到畫的左邊 */
const tapX = (L: { d: number; x: number }) => L.x - 0.3 * L.d - (HAND.reach[0] + TIP)

const FX: Fx[] = [], CAM: Camera[] = [], CUE: Cue[] = []

/**
 * 主軸（第 k 次，k＝0、1）：畫 → 退一步得意 → 敲一下 → 啵！活過來 → 跳下牆撲他。回傳撲到的那一刻。
 */
function round(T: number, k: number) {
  const L = LIONS[k]
  const d = `d${k + 1}`, lion = `lion${k + 1}`
  const end = scribble(T, d, L.x, 4 + 2 * k, L.y - 0.3 * L.d, L.y + 0.3 * L.d, 4 + k, 0.11)
  FX.push({ at: T + 0.1, kind: 'puff', actor: 'pen', n: 3, dur: 0.4 })
  CUE.push({ at: T, sfx: 'slide' }, { at: T + 0.25, sfx: 'slide' })
  // 退一步，得意地看
  rex(end + 0.05, { pose: 'smug', x: 50, dur: 0.22, ease: 'out' })
  M.push({ at: end + 0.27, actor: 'rex', do: 'squash', amount: -0.08, dur: 0.25 })
  // 敲一下
  const TAP = end + 0.6
  const tx = tapX(L)
  tap(TAP, tx)
  CUE.push({ at: TAP, sfx: 'tap' })
  // 啵！變回彩色、變大
  const POP = TAP + 0.18
  M.push({ at: POP, actor: d, do: 'vanish', dur: 0.05 }, { at: POP, actor: lion, do: 'pop', dur: 0.2 })
  FX.push({ at: POP, kind: 'burst', x: L.x, y: L.y - 2, emoji: '✨', n: 6 + 2 * k, dur: 0.5, scale: 1.1 + 0.2 * k })
  CUE.push({ at: POP, sfx: 'boing' })
  // 撲下來
  const JUMP = POP + 0.25
  const HIT = JUMP + 0.26
  const lx = tx + 11 + 0.3 * L.s
  M.push(
    { at: JUMP - 0.12, actor: lion, do: 'squash', amount: 0.15, dur: 0.12 },
    { at: JUMP, actor: lion, do: 'moveTo', to: { x: lx, y: LY(L.s) }, arc: 6 + 2 * k, dur: HIT - JUMP, ease: 'in' },
  )
  CUE.push({ at: JUMP, sfx: 'whoosh' }, { at: HIT, sfx: 'bonk' })
  if (k >= 1) CUE.push({ at: HIT + 0.05, sfx: 'boing' })
  // 撲到：第一次嚇一跳往後跳，第二次一屁股跌坐滑出去
  if (k === 0) rex(HIT, { pose: 'surprised', x: tx - 7, dur: 0.3, ease: 'out', arc: 4 })
  else rex(HIT, { pose: 'fall', x: tx - 15, dur: 0.35, ease: 'out' })
  FX.push(
    { at: HIT, kind: 'burst', x: tx + 10, y: KY - 2, n: 1, dur: 0.4, scale: 1.2 + 0.4 * k },
    { at: HIT + 0.1, kind: 'puff', x: tx, y: 74, n: 3 + 3 * k, dur: 0.5 },
  )
  CAM.push(
    { at: HIT, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: tx + 8, y: KY } },
    { at: HIT, dur: 0.3, do: 'shake', amount: 0.6 + 0.5 * k },
  )
  // 獅子彈回去、得意地跑出右邊
  M.push(
    { at: HIT + 0.05, actor: lion, do: 'moveTo', to: { x: lx + 6, y: LY(L.s) }, arc: 3, dur: 0.25, ease: 'out' },
    { at: HIT + 0.45, actor: lion, do: 'flip' },
    { at: HIT + 0.5, actor: lion, do: 'moveTo', to: { x: 200, y: LY(L.s) }, dur: 0.55, ease: 'in' },
  )
  return HIT
}

// ── 時間表 ──
// 開場：小恐龍舉著全新的蠟筆走進來，蠟筆亮一下
M.push({ at: 0, actor: 'pen', do: 'rotateTo', amount: -90, dur: 0.01 })
rex(0, { pose: 'know', x: 48, dur: 0.55, ease: 'out' })
const SHINE = 0.55
M.push({ at: SHINE, actor: 'pen', do: 'spin', times: 1, dur: 0.3 })
hop(SHINE, 3, 0.3)

const H1 = round(0.8, 0)
rex(H1 + 0.45, { pose: 'idle' })
const H2 = round(H1 + 0.55, 1)
// 爬起來
rex(H2 + 0.55, { pose: 'idle', x: 50, dur: 0.15 })
hop(H2 + 0.55, 3, 0.2)

// 第三次：跳上跳下畫一隻超大的
const L3 = LIONS[2]
const T3 = H2 + 0.75
const E3 = scribble(T3, 'd3', L3.x, 10, L3.y - 0.3 * L3.d, L3.y + 0.3 * L3.d, 7, 0.11)
rex(E3 + 0.05, { pose: 'smug', x: 50, dur: 0.25, ease: 'out' })
M.push({ at: E3 + 0.3, actor: 'rex', do: 'squash', amount: -0.1, dur: 0.3 })
// 敲……沒反應。再敲……還是沒反應（停一拍）
const TX3 = tapX(L3)
const K1 = E3 + 0.65
tap(K1, TX3)
const K2 = K1 + 0.45
tap(K2, TX3)
// 聳聳肩，得意地轉身要走
const AWAY = K2 + 0.3
rex(AWAY, { pose: 'smug', dir: -1 })
rex(AWAY + 0.1, { x: TX3 - 6, dur: 0.3 })
// 吼！活過來了
const ROAR = AWAY + 0.4
const L3Y = L3.y + 0.461 * (L3.d - L3.s)
M.push(
  { at: ROAR, actor: 'd3', do: 'vanish', dur: 0.05 },
  { at: ROAR, actor: 'lion3', do: 'pop', dur: 0.25 },
  { at: ROAR + 0.3, actor: 'lion3', do: 'moveTo', to: { x: 106, y: LY(L3.s) }, arc: 4, dur: 0.3, ease: 'in' },
)
// 他嚇得跳起來、轉回來看
const JOLT = ROAR + 0.1
rex(JOLT, { pose: 'surprised', dir: 1 })
hop(JOLT, 6, 0.3)
// 急中生智：在牆上刷刷刷畫一扇門
const DS = JOLT + 0.3
const DE = scribble(DS, 'door', DOOR.x, 3, DOOR_Y - 8, DOOR_Y + 6, 3, 0.1)
// 門活過來，他鑽進去
const DOPEN = DE + 0.05
M.push({ at: DOPEN, actor: 'door', do: 'tint', filter: '' })
M.push({ at: DOPEN, actor: 'door', do: 'squash', amount: -0.15, dur: 0.2 })
const DIVE = DOPEN + 0.15
rex(DIVE, { pose: 'flee', x: DOOR.x, dur: 0.18, ease: 'in' })
M.push(
  { at: DIVE + 0.1, actor: 'rex', do: 'vanish', dur: 0.1 },
  { at: DIVE + 0.1, actor: 'pen', do: 'vanish', dur: 0.1 },
  { at: DIVE + 0.2, actor: 'door', do: 'squash', amount: 0.15, dur: 0.15 },
  { at: DIVE + 0.3, actor: 'door', do: 'tint', filter: SKETCH },
)
// 大獅子衝過來——門已經變回畫，一頭撞在牆上
const CHARGE = DIVE + 0.02
const BONK = DIVE + 0.4
const BX = DOOR.x + 0.3 * L3.s
M.push(
  { at: CHARGE, actor: 'lion3', do: 'moveTo', to: { x: BX, y: LY(L3.s) }, dur: BONK - CHARGE, ease: 'in' },
  { at: BONK, actor: 'lion3', do: 'stretchTo', amount: 0.8, dur: 0.1, ease: 'out' },
  { at: BONK + 0.3, actor: 'lion3', do: 'stretchTo', amount: 1 / 0.8, dur: 0.15, ease: 'out' },
  { at: BONK + 0.3, actor: 'lion3', do: 'swap', emoji: 'prop:lion-scared' },
  { at: BONK + 0.3, actor: 'lion3', do: 'moveTo', to: { x: BX + 24, y: LY(L3.s) }, dur: 0.35, ease: 'out' },
  { at: BONK, actor: 'wall', do: 'shake', amount: 0.6, dur: 0.3 },
)
// 他從牆頭冒出來，舉著蠟筆亮相
const UP = BONK + 0.4
const POSE = UP + 0.3
const TOPX = 76
const TOPY = TOP + 2.5 - 0.42 * S
const PEN2 = { x: TOPX + HAND.know[0] + G, y: TOPY + HAND.know[1] - G }
M.push(
  { at: 0, actor: 'pen2', do: 'rotateTo', amount: -90, dur: 0.01 },
  { at: UP, actor: 'rex2', do: 'enter', from: { x: TOPX, y: TOPY + 24 }, dur: 0.3, ease: 'back' },
  { at: UP, actor: 'pen2', do: 'enter', from: { x: PEN2.x, y: PEN2.y + 24 }, dur: 0.3, ease: 'back' },
  { at: POSE, actor: 'rex2', do: 'hop', amount: 4, dur: 0.35 },
  { at: POSE, actor: 'pen2', do: 'hop', amount: 4, dur: 0.35 },
)
const END = Math.round((POSE + 1.75) * 10) / 10

export default scene({
  duration: END,
  bg: { top: '#FFD3A0', bottom: '#FFF0DA', floor: '#D2AE84', scenery: 'city' },
  actors: [
    { id: 'cone1', emoji: '🚧', x: 140, y: LY(16), size: 16 },
    { id: 'cone2', emoji: '🚧', x: 24, y: LY(13), size: 13 },
    { id: 'rex2', emoji: 'hero:rex/know', x: TOPX, y: TOPY, size: S, flip: true, hidden: true },
    { id: 'pen2', emoji: '✏️', ...PEN2, size: PEN, flip: true, float: true, hidden: true, pivot: 'center' },
    { id: 'wall', emoji: 'prop:brick-wall', x: WALL.x, y: WALL.y, size: WS, tint: WALL_TINT },
    ...LIONS.map((L, i) => ({ id: `d${i + 1}`, emoji: 'prop:lion', x: L.x, y: L.y, size: L.d, float: true, hidden: true, tint: SKETCH, half: 'top' as const, cut: 0.1 })),
    { id: 'door', emoji: '🚪', x: DOOR.x, y: DOOR_Y, size: DOOR.s, float: true, hidden: true, tint: SKETCH, half: 'top' as const, cut: 0.1 },
    ...LIONS.map((L, i) => ({ id: `lion${i + 1}`, emoji: i === 2 ? 'prop:lion-roar' : 'prop:lion', x: L.x, y: L.y + 0.461 * (L.d - L.s), size: L.s, hidden: true })),
    { id: 'rex', emoji: 'hero:rex/know', x: -14, y: KY, size: S, flip: true },
    { id: 'pen', emoji: '✏️', ...penAt(-14, KY, 'know', 1), size: PEN, flip: true, float: true, pivot: 'center' },
  ],
  moves: M,
  fx: [
    { at: SHINE, kind: 'burst', actor: 'pen', emoji: '✨', n: 6, dur: 0.6, scale: 1.2 },
    ...FX,
    { at: T3 + 0.1, kind: 'puff', actor: 'pen', n: 5, dur: 0.5 },
    { at: K1 + 0.3, kind: 'sweat', actor: 'rex', dur: 0.5 },
    { at: ROAR, kind: 'burst', x: L3.x, y: L3Y - 4, emoji: '✨', n: 12, dur: 0.6, scale: 1.6 },
    { at: JOLT, kind: 'sweat', actor: 'rex', dur: 0.5 },
    { at: DOPEN, kind: 'burst', x: DOOR.x, y: DOOR_Y - 2, emoji: '✨', n: 6, dur: 0.4, scale: 1 },
    { at: DIVE + 0.1, kind: 'puff', x: DOOR.x, y: 74, n: 5, dur: 0.4 },
    { at: BONK, kind: 'burst', x: DOOR.x + 2, y: LY(L3.s) - 6, n: 1, dur: 0.5, scale: 2.4 },
    { at: BONK, kind: 'puff', x: DOOR.x + 6, y: 74, n: 8, dur: 0.6 },
    { at: BONK + 0.4, kind: 'dizzy', actor: 'lion3', dur: END - BONK - 0.4 },
    { at: POSE, kind: 'burst', actor: 'rex2', emoji: '✨', n: 10, dy: -8, dur: 1.0, scale: 1.4 },
    { at: POSE + 0.2, kind: 'burst', actor: 'rex2', emoji: '🎉', n: 8, dy: -10, dur: 1.0, scale: 1.3 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.45, to: look(76, 52, 1.45) },
    ...CAM,
    // 停一拍：推近他敲畫
    { at: K1 - 0.3, dur: 0.5, do: 'zoom', amount: 1.6, to: look(74, 54, 1.6) },
    // 吼！拉開看大獅子
    { at: ROAR, dur: 0.35, do: 'zoom', amount: 1.35, to: look(82, 50, 1.35) },
    { at: ROAR, dur: 0.5, do: 'shake', amount: 1.3 },
    { at: BONK, dur: 0.4, do: 'punch', amount: 0.12, to: { x: DOOR.x, y: 55 } },
    { at: BONK, dur: 0.45, do: 'shake', amount: 1.6 },
    // 亮相：推近牆頭上的他
    { at: UP, dur: 0.45, do: 'zoom', amount: 1.18, to: look(84, 41, 1.18) },
  ],
  lights: [
    { at: ROAR, dur: 0.05, level: -0.25 },
    { at: ROAR + 0.05, dur: 0.35, level: 0 },
    { at: BONK, dur: 0.05, level: -0.25 },
    { at: BONK + 0.05, dur: 0.35, level: 0 },
    { at: POSE, dur: 0.05, level: -0.25 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: SHINE, sfx: 'blip' },
    ...CUE,
    { at: T3, sfx: 'slide' },
    { at: T3 + 0.25, sfx: 'slide' },
    { at: T3 + 0.5, sfx: 'slide' },
    { at: K1, sfx: 'tap' },
    { at: K2, sfx: 'tap' },
    { at: ROAR, sfx: 'boing' },
    { at: ROAR + 0.05, sfx: 'rumble' },
    { at: DS, sfx: 'slide' },
    { at: DOPEN, sfx: 'boing' },
    { at: DIVE, sfx: 'whoosh' },
    { at: BONK, sfx: 'bonk' },
    { at: BONK + 0.05, sfx: 'crack' },
    { at: UP, sfx: 'boing' },
    { at: POSE, sfx: 'cheer' },
    { at: POSE + 0.05, say: '蠟筆小新' },
  ],
})
