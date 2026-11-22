// 演的是字面意思：寶（寶石、寶藏）＋可（可以）＋夢（做夢）——睡著做夢也可以撿到寶：夢遊的小骷髏一路絆到寶石（沒有紅白球、丟球收服、小怪獸、對戰、進化、圖鑑、訓練家）。
import type { Camera, Cue, Fx, Light, Move } from '../../anim/clip'
import { scene } from '../../story/scene'
import { pressStack } from '../../anim/helpers'

// 主軸笑點（一句話）：小骷髏閉著眼睛夢遊，每絆到一顆小石頭，石頭底下就「叮」地蹦出一顆寶石落到他頭上，一顆比一顆大；
// 醒著的山羊拚命用角撞大石頭，什麼都撞不出來，越看越氣。
// 同一個動作（夢遊走過去、腳尖絆到小石頭、身體一晃、寶石蹦出來疊到頭上）、同一串「咚—蹦—叮」，做三次：
// 第一顆小寶石 → 第二顆更大、疊在上面搖搖晃晃 → 第三次前停一拍：山羊氣得卯足全力撞大石頭，結果把自己撞扁在地上，
// 剛好躺在夢遊的路上——他停在山羊前面晃呀晃……反轉：這次絆倒他的是山羊，他被絆得飛起來一屁股坐在大石頭上，
// 「喀啦」大石頭裂開，裡面是一顆比他還大的寶石，他正好坐在上面。醒過來一看：「寶可夢」。
// 主角用小骷髏（有站著睡的 doze、跌坐、傻眼、跳起來的姿勢；不用老鼠——原作的招牌就是老鼠，整支不出現老鼠）；浣熊剛演完做夢，不用。不用 💭 夢泡泡、也不被吵醒。

// ── 站位 ──
const S = 36 // 小骷髏的 size
const KY = 77 - 0.42 * S
const X0 = 118 // 第一次絆倒的地方
const X1 = 104 // 第二次（也是第三次前停的地方）
// 山羊（size 26，圖朝左）：站在大石頭右邊，用角撞石頭
const GS = 26
const GY = 77 - 0.42 * GS
const GX = 75
const BUTT = 71 // 撞到石頭時站的地方
const FLAT = 85 // 第三次把自己撞飛、扁在地上的地方
// 大石頭（prop:rock size 36）：頂端約在 y 53；裂開以後原地換成一顆更大的寶石（💎 size 46，頂端在 y 46）
const RX = 44
const RS = 36
const RY = 77 - 0.42 * RS
const TOPY = 53 // 石頭／大寶石的頂
const SIT = { x: RX + 2, y: TOPY + 1 - 0.42 * S } // 坐在石頭頂上
const BIG = 46 // 大寶石
const BIGTOP = 77 - 0.67 * BIG
// 小石頭（🪨 size 9）：在他腳尖前面
const PS = 9
const PY = 77 - 0.42 * PS
const toe = (x: number) => x - 13
// 寶石疊在頭上：頭頂在 x − 3、y 約 50（量過）。g1 浮在空中會自動放大（16 → 約 21），g2（24 → 約 28.5）
const HEAD = { dx: -3, y: 50 }
const G1 = { s: 16, k: 1.3 }
const G2 = { s: 24, k: 1.19 }
/** 浮著的寶石底部剛好在 bottom 時的 y（放大後的 size × 0.44 是中心到底的距離） */
const gemY = (bottom: number, g: { s: number; k: number }) => bottom - 0.44 * g.s * g.k
const G1Y = gemY(HEAD.y, G1)
const G1TOP = G1Y - 0.25 * G1.s * G1.k
const G2Y = gemY(G1TOP + 1, G2)
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 頭上的寶石跟著他走：k＝頭上已經有幾顆 */
function walk(at: number, from: number, to: number, dur: number, k: number): Move[] {
  const moves: Move[] = [{ at, actor: 'kid', do: 'moveTo', to: { x: to, y: KY }, dur, ease: 'inOut' }]
  if (k >= 1) moves.push({ at, actor: 'g1', do: 'moveTo', to: { x: to + HEAD.dx, y: G1Y }, dur, ease: 'inOut' })
  if (k >= 2) moves.push({ at, actor: 'g2', do: 'moveTo', to: { x: to + HEAD.dx, y: G2Y }, dur, ease: 'inOut' })
  // 夢遊：身體慢慢左右晃，頭上的寶石跟著搖
  const sway = Math.max(1, Math.round(dur / 0.5))
  for (let i = 0; i < sway; i++) {
    moves.push({ at: at + i * (dur / sway), actor: 'kid', do: 'tilt', amount: i % 2 ? 4 : -4, dur: dur / sway })
    if (k >= 1) moves.push({ at: at + i * (dur / sway), actor: 'g1', do: 'tilt', amount: i % 2 ? 6 : -6, dur: dur / sway })
    if (k >= 2) moves.push({ at: at + i * (dur / sway), actor: 'g2', do: 'tilt', amount: i % 2 ? -9 : 9, dur: dur / sway })
  }
  return moves
}

/**
 * 主軸：腳尖絆到小石頭（咚）→ 身體往前一晃 → 寶石從石頭底下蹦出來（蹦）→ 落到頭上（叮）。
 * T＝絆到那一刻，x＝他站的地方，k＝第幾顆（0、1）。回傳 land＝寶石落到頭上那一刻。
 */
function trip(T: number, x: number, k: number) {
  const gem = `g${k + 1}`
  const p = toe(x)
  const g = [G1, G2][k]
  const target = { x: x + HEAD.dx, y: k === 0 ? G1Y : G2Y }
  const land = T + 0.65
  const onHead = ['g1', 'g2'].slice(0, k)
  const moves: Move[] = [
    // 絆一下：往前一晃、小跳一步（頭上的寶石一起跳）
    { at: T, actor: 'kid', do: 'tilt', amount: -12, dur: 0.4 },
    { at: T, actor: 'kid', do: 'hop', amount: 3, dur: 0.3 },
    ...onHead.map((id): Move => ({ at: T, actor: id, do: 'hop', amount: 3, dur: 0.3 })),
    ...onHead.map((id): Move => ({ at: T, actor: id, do: 'shake', amount: 1, dur: 0.4 })),
    // 小石頭被踢走
    { at: T, actor: `p${k}`, do: 'moveTo', to: { x: p - 16, y: PY }, arc: 5, dur: 0.4, ease: 'out' },
    { at: T, actor: `p${k}`, do: 'spin', times: -2, dur: 0.4 },
    { at: T + 0.9, actor: `p${k}`, do: 'vanish', dur: 0.3 },
    // 寶石從石頭原本的地方蹦出來，飛一個弧線落到頭上
    { at: T + 0.12, actor: gem, do: 'pop', dur: 0.15 },
    { at: T + 0.2, actor: gem, do: 'moveTo', to: target, arc: 12 + 2 * k, dur: land - T - 0.2, ease: 'inOut' },
    { at: T + 0.2, actor: gem, do: 'spin', times: 1, dur: land - T - 0.2 },
    // 落到頭上：壓一下（越來越重）
    ...pressStack(land, 0.3, 0.06 + 0.06 * k, S, ['kid', ...onHead, gem]),
    { at: land, actor: gem, do: 'squash', amount: 0.2, dur: 0.2 },
  ]
  const fx: Fx[] = [
    { at: T, kind: 'puff', x: p, y: 74, n: 3, dur: 0.4 },
    { at: T + 0.12, kind: 'burst', x: p, y: 66, emoji: '✨', n: 5, dur: 0.5, scale: 1.2 },
    { at: land, kind: 'burst', x: target.x, y: target.y - 4, emoji: '✨', n: 6 + 2 * k, dy: -6, dur: 0.6, scale: 1.3 + 0.2 * k },
  ]
  const cues: Cue[] = [
    { at: T, sfx: 'tap' },
    { at: T + 0.12, sfx: 'boing' },
    { at: land, sfx: 'clink' },
  ]
  return { moves, fx, cues, land, gem, g }
}

/** 山羊轉過來看：氣得發抖（停住 0.5 秒），再轉回去 */
function glare(at: number, k: number): Move[] {
  return [
    { at, actor: 'goat', do: 'flip' },
    { at, actor: 'goat', do: 'swap', emoji: 'prop:goat-butt' },
    { at: at + 0.1, actor: 'goat', do: 'shake', amount: 0.6 + 0.4 * k, dur: 0.5 },
    ...(k >= 1 ? [{ at: at + 0.15, actor: 'goat', do: 'hop', amount: 3, dur: 0.25 } as Move] : []),
    { at: at + 0.65, actor: 'goat', do: 'flip' },
  ]
}

/** 山羊用角撞大石頭：縮一下、衝過去、撞到（hit）、彈回來。什麼都沒有 */
function butt(hit: number, k: number) {
  const moves: Move[] = [
    { at: hit - 0.35, actor: 'goat', do: 'swap', emoji: 'prop:goat-butt' },
    { at: hit - 0.35, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: hit - 0.18, actor: 'goat', do: 'moveTo', to: { x: BUTT, y: GY }, dur: 0.18, ease: 'in' },
    { at: hit, actor: 'rock', do: 'shake', amount: 0.5 + 0.3 * k, dur: 0.3 },
    { at: hit, actor: 'goat', do: 'moveTo', to: { x: GX, y: GY }, dur: 0.25, ease: 'out' },
    { at: hit + 0.35, actor: 'goat', do: 'swap', emoji: 'prop:goat' },
  ]
  const fx: Fx[] = [
    { at: hit, kind: 'burst', x: RX + 16, y: 60, n: 1, dur: 0.35, scale: 1 + 0.3 * k },
    { at: hit + 0.3, kind: 'sweat', actor: 'goat', dur: 0.6 },
  ]
  const cues: Cue[] = [{ at: hit, sfx: 'bonk' }]
  return { moves, fx, cues }
}

// ── 時間表 ──
const T1 = 1.45
const t1 = trip(T1, X0, 0)
const b0 = butt(0.55, 0)
const L1 = t1.land
const b1 = butt(L1 + 1.15, 0)
const T2 = 3.75
const t2 = trip(T2, X1, 1)
const L2 = t2.land
// 停一拍：山羊卯足全力（站起來蓄力）撞大石頭，把自己撞飛、扁在夢遊的路上
const REAR = L2 + 0.85
const SMASH = REAR + 0.7
const FLOP = SMASH + 0.45
// 他晃呀晃停在山羊前面
const WAIT = FLOP + 0.15
const T3 = WAIT + 0.9 // 第三次：絆到的是山羊
const LAND = T3 + 0.6 // 一屁股坐在大石頭上
const CRACK = LAND + 0.3 // 喀啦！大石頭裂開，裡面是大寶石
const WAKE = CRACK + 0.45
const POSE = WAKE + 0.5
const END = POSE + 1.6
// 第三次飛出去的弧線，頭上兩顆寶石飛到大寶石兩邊
const G1END = { x: 68, y: gemY(76, G1) }
const G2END = { x: 17, y: gemY(76, G2) }

export default scene({
  duration: END,
  bg: { top: '#24356F', bottom: '#8E8AC8', floor: '#E2C48C', scenery: 'desert' },
  actors: [
    { id: 'vase', emoji: '🏺', x: 150, y: 77 - 0.42 * 14, size: 14 },
    { id: 'gem3', emoji: '💎', x: RX, y: 77 - 0.42 * BIG, size: BIG, hidden: true },
    { id: 'rock', emoji: 'prop:rock', x: RX, y: RY, size: RS },
    { id: 'p0', emoji: '🪨', x: toe(X0), y: PY, size: PS, pivot: 'center' },
    { id: 'p1', emoji: '🪨', x: toe(X1), y: PY, size: PS, pivot: 'center' },
    { id: 'goat', emoji: 'prop:goat', x: GX, y: GY, size: GS },
    { id: 'kid', emoji: 'hero:jerry/doze', x: 172, y: KY, size: S },
    { id: 'g1', emoji: '💎', x: toe(X0), y: 66, size: G1.s, float: true, hidden: true, pivot: 'center' },
    { id: 'g2', emoji: '💎', x: toe(X1), y: 66, size: G2.s, float: true, hidden: true, pivot: 'center' },
  ],
  moves: [
    // 開場：閉著眼睛夢遊進來（💤），山羊正在用角撞大石頭
    ...walk(0, 172, X0, 1.35, 0),
    ...b0.moves,
    // 第一次：絆到小石頭，第一顆寶石落到頭上
    ...t1.moves,
    ...glare(L1 + 0.1, 0),
    ...b1.moves,
    // 晃呀晃走到下一顆小石頭
    ...walk(L1 + 0.45, X0, X1, T2 - L1 - 0.5, 1),
    // 第二次：更大的寶石疊在上面，搖搖晃晃
    ...t2.moves,
    { at: L2 + 0.2, actor: 'g2', do: 'tilt', amount: 10, dur: 0.5 },
    { at: L2 + 0.2, actor: 'g1', do: 'tilt', amount: -6, dur: 0.5 },
    ...glare(L2 + 0.1, 1),
    // 停一拍：山羊站起來蓄力……衝！
    { at: REAR - 0.1, actor: 'goat', do: 'moveTo', to: { x: GX + 6, y: GY }, dur: 0.3, ease: 'out' },
    { at: REAR, actor: 'goat', do: 'swap', emoji: 'prop:goat-rear' },
    { at: REAR + 0.1, actor: 'goat', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: SMASH - 0.2, actor: 'goat', do: 'swap', emoji: 'prop:goat-butt' },
    { at: SMASH - 0.2, actor: 'goat', do: 'moveTo', to: { x: BUTT, y: GY }, dur: 0.2, ease: 'in' },
    { at: SMASH, actor: 'rock', do: 'shake', amount: 1.2, dur: 0.35 },
    // 石頭沒事，山羊被彈飛，扁在地上（剛好躺在夢遊的路上）
    { at: SMASH, actor: 'goat', do: 'swap', emoji: 'prop:goat' },
    { at: SMASH + 0.2, actor: 'goat', do: 'flip' }, // 扁著臉朝右，不被飛過來的寶石擋住
    { at: SMASH, actor: 'goat', do: 'moveTo', to: { x: FLAT, y: GY }, arc: 10, dur: FLOP - SMASH, ease: 'out' },
    { at: SMASH, actor: 'goat', do: 'spin', times: 1, dur: FLOP - SMASH, pivot: 'center' },
    { at: FLOP, actor: 'goat', do: 'stretchTo', amount: 1.35, dur: 0.15, ease: 'out' },
    // 他還在睡，晃到山羊前面停住，一腳抬起來……
    ...walk(L2 + 0.6, X1, X1, WAIT - L2 - 0.6 + 0.9, 2),
    { at: T3 - 0.35, actor: 'kid', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: T3 - 0.35, actor: 'g1', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: T3 - 0.35, actor: 'g2', do: 'hop', amount: 1.5, dur: 0.3 },
    // 第三次：咚——絆到山羊，整個人飛起來，一屁股坐在大石頭上
    { at: T3, actor: 'kid', do: 'tilt', amount: -12, dur: 0.2 },
    // 還在睡：閉著眼睛往前撲著飛過去
    { at: T3 + 0.1, actor: 'kid', do: 'tilt', amount: -35, dur: LAND - T3 - 0.1, pivot: 'center' },
    { at: T3 + 0.1, actor: 'kid', do: 'moveTo', to: SIT, arc: 16, dur: LAND - T3 - 0.1, ease: 'inOut' },
    { at: LAND, actor: 'kid', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: T3 + 0.05, actor: 'goat', do: 'squash', amount: 0.3, dur: 0.25 },
    // 頭上兩顆寶石飛出去，落在大石頭兩邊（大的往左、小的往右）
    { at: T3 + 0.1, actor: 'g1', do: 'moveTo', to: G1END, arc: 22, dur: 0.7, ease: 'inOut' },
    { at: T3 + 0.1, actor: 'g1', do: 'spin', times: -2, dur: 0.7 },
    { at: T3 + 0.15, actor: 'g2', do: 'moveTo', to: G2END, arc: 10, dur: 0.6, ease: 'inOut' },
    { at: T3 + 0.15, actor: 'g2', do: 'spin', times: 1, dur: 0.6 },
    // 坐下去那一下壓得石頭晃，喀啦——裂開，換成一樣大的寶石，他就坐在寶石上
    { at: LAND, actor: 'rock', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: LAND + 0.1, actor: 'rock', do: 'shake', amount: 1, dur: CRACK - LAND - 0.1 },
    { at: CRACK, actor: 'rock', do: 'vanish', dur: 0.1 },
    { at: CRACK, actor: 'gem3', do: 'pop', dur: 0.3 },
    { at: CRACK, actor: 'kid', do: 'moveTo', to: { x: SIT.x, y: BIGTOP + 1.5 - 0.42 * S }, arc: 4, dur: 0.3, ease: 'out' },
    // 醒過來：傻眼——再跳起來站在大寶石上
    { at: WAKE, actor: 'kid', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: WAKE, actor: 'kid', do: 'moveTo', to: { x: SIT.x, y: BIGTOP + 1.5 - 0.42 * S }, dur: 0.15 },
    { at: POSE, actor: 'kid', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: POSE, actor: 'kid', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    { at: POSE, actor: 'kid', do: 'hop', amount: 4, dur: 0.35 },
    { at: POSE + 0.1, actor: 'gem3', do: 'squash', amount: 0.08, dur: 0.25 },
    { at: POSE, actor: 'g1', do: 'hop', amount: 2, dur: 0.3 },
    { at: POSE + 0.1, actor: 'g2', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'kid', emoji: '💤', dx: 6, dur: WAKE - 0.2, scale: 1.4 },
    ...b0.fx,
    ...t1.fx,
    ...b1.fx,
    ...t2.fx,
    { at: L2 + 0.25, kind: 'sweat', actor: 'goat', dur: 0.5 },
    // 山羊卯足全力撞：💥 很大，自己被彈飛、頭昏
    { at: SMASH, kind: 'burst', x: RX + 16, y: 58, n: 1, dur: 0.45, scale: 1.9 },
    { at: SMASH, kind: 'puff', x: BUTT - 6, y: 74, n: 6, dur: 0.5 },
    { at: FLOP + 0.05, kind: 'dizzy', actor: 'goat', dur: END - FLOP - 0.1 },
    // 第三次
    { at: T3, kind: 'puff', x: FLAT + 8, y: 74, n: 4, dur: 0.4 },
    { at: LAND, kind: 'burst', x: SIT.x, y: TOPY, n: 1, dur: 0.35, scale: 1.4 },
    { at: CRACK, kind: 'burst', x: RX, y: 62, emoji: 'prop:rock', n: 8, dur: 0.6, scale: 1.4 },
    { at: CRACK, kind: 'puff', x: RX, y: 74, n: 8, dur: 0.6 },
    { at: CRACK + 0.1, kind: 'burst', x: RX, y: 64, emoji: '✨', n: 10, dur: 0.8, scale: 1.5 },
    { at: WAKE + 0.05, kind: 'sweat', actor: 'kid', dur: 0.4 },
    // 亮相
    { at: POSE, kind: 'burst', actor: 'kid', emoji: '✨', n: 10, dy: -12, dur: 1.0, scale: 1.4 },
    { at: POSE + 0.25, kind: 'burst', actor: 'kid', emoji: '🎉', n: 8, dy: -14, dur: 1.0, scale: 1.3 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.3, to: look(100, 46, 1.3) },
    // 第二次：頭上疊高了，鏡頭稍微往上
    { at: L1 + 0.5, dur: 0.6, do: 'zoom', amount: 1.28, to: look(94, 44, 1.28) },
    { at: L1, dur: 0.3, do: 'punch', amount: 0.05, to: { x: X0, y: 45 } },
    { at: L2, dur: 0.35, do: 'punch', amount: 0.08, to: { x: X1, y: 40 } },
    // 停一拍：看山羊蓄力撞石頭
    { at: REAR - 0.2, dur: 0.5, do: 'zoom', amount: 1.35, to: look(76, 48, 1.35) },
    { at: SMASH, dur: 0.4, do: 'shake', amount: 1.2 },
    // 他晃到山羊前面
    { at: FLOP + 0.2, dur: 0.5, do: 'zoom', amount: 1.3, to: look(92, 46, 1.3) },
    // 絆倒、飛到大石頭上：拉開看整段弧線
    { at: T3, dur: 0.35, do: 'zoom', amount: 1.15, to: look(68, 46, 1.15) },
    { at: LAND, dur: 0.3, do: 'shake', amount: 1 },
    { at: CRACK, dur: 0.4, do: 'punch', amount: 0.08, to: { x: RX, y: 55 } },
    { at: CRACK, dur: 0.45, do: 'shake', amount: 1.5 },
    // 亮相：推近站在大寶石上的他
    { at: WAKE, dur: 0.6, do: 'zoom', amount: 1.25, to: look(64, 37, 1.25) },
  ],
  lights: [
    // 月光下有點暗；大寶石亮出來那一下閃一下、整個亮起來
    { at: -0.3, dur: 0, level: 0.12 } as Light,
    { at: CRACK, dur: 0.05, level: -0.25 },
    { at: CRACK + 0.05, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.2, sfx: 'whoosh' },
    ...b0.cues,
    ...t1.cues,
    ...b1.cues,
    ...t2.cues,
    { at: REAR, sfx: 'rumble' },
    { at: SMASH, sfx: 'bonk' },
    { at: FLOP, sfx: 'deflate' },
    { at: T3, sfx: 'tap' },
    { at: T3 + 0.1, sfx: 'whoosh' },
    { at: LAND, sfx: 'bonk' },
    { at: CRACK, sfx: 'crack' },
    { at: CRACK + 0.1, sfx: 'clink' },
    { at: POSE, sfx: 'cheer' },
    { at: POSE + 0.1, say: '寶可夢' },
  ],
})
