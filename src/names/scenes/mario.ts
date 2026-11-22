// 演的是字面意思：名字沒有字面意思，演「一個好愛跳的人」——小骷髏看到擋路的東西就要從上面跳過去，一個比一個高（沒有紅帽子、鬍子、吊帶褲、水管、問號磚、磚塊平台、蘑菇、烏龜、金幣、旗桿，也不踩誰）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小骷髏看到擋路的東西就一定要從上面跳過去——擋路的一個比一個高。
// 同一套跳法（助跑兩步、蹲、跳過去、落地「咚」），三次只有東西越來越大、落地越來越重：
// 小石頭 → 走進來的綿羊 → 「咚」把趴著睡覺的河馬震得整隻彈起來、落在路中間繼續睡（停一拍：他傻眼，再退後好幾步助跑），跳過去「咚！」震醒河馬。
// 反轉：河馬爬起來學他，助跑一跳反過來從他頭上跳過去，「轟」一落地把他震得一屁股坐在地上。他跳起來樂翻了：「瑪利歐」。
// 主角用小骷髏（hero:jerry）：楊捷睿是紅外套配藍短褲，跟原作的配色太像，刻意不用。
const S = 36 // 小骷髏的 size
const G = 77 - 0.42 * S
const GX = 78 // 擋路的東西都在這裡
const HIP = 38 // 河馬（頭朝右）
const HG = 77 - 0.42 * HIP
const NAP = 1.15 // 睡著時趴扁：寬 1.15 倍、高 1／1.15
const H0 = 120 // 河馬一開始睡在右邊
const SH = 22 // 綿羊
const SG = 77 - 0.42 * SH
const ROCK = 14

/**
 * 主軸：助跑兩步、蹲、跳過去、落地「咚」（三次一模一樣，只有弧線越高、落地越重）。
 * T＝起跳那一刻；from 助跑起點、take 起跳點、land 落點；k 第幾次（0、1、2）。
 */
function jump(T: number, k: number, from: number, take: number, land: number) {
  const dur = [0.45, 0.5, 0.6][k]
  const L = T + dur
  const moves: Move[] = [
    { at: T - 0.45, actor: 'kid', do: 'swap', emoji: 'hero:jerry/dash' },
    { at: T - 0.45, actor: 'kid', do: 'moveTo', to: { x: take, y: G }, dur: 0.3, ease: 'in' },
    { at: T - 0.15, actor: 'kid', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: T, actor: 'kid', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: T, actor: 'kid', do: 'moveTo', to: { x: land, y: G }, arc: [12, 17, 22][k], dur, ease: 'linear' },
    { at: L, actor: 'kid', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: L, actor: 'kid', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.25 },
  ]
  const fx: Fx[] = [
    { at: L, kind: 'puff', actor: 'kid', n: 6 + 5 * k, dur: 0.6 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at: L, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.4 + 0.6 * k },
  ]
  if (k >= 1) camera.push({ at: L, dur: 0.4, do: 'punch', amount: 0.04 + 0.04 * k, to: { x: land, y: 62 } })
  // 同一聲「嘿咻」起跳＋「咚」落地，一次比一次多疊一個
  const cues: Cue[] = [{ at: T, sfx: 'boing' }, { at: L, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: L + 0.02, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: L + 0.05, sfx: 'rumble' })
  return { moves, fx, camera, cues, L }
}

// 三次的站位：左右對稱，跳過去的落點就是下一次的助跑起點
const LEFT = 50, RIGHT = 104, TAKE_L = 58, TAKE_R = 96
const T1 = 0.95
const j1 = jump(T1, 0, LEFT, TAKE_L, RIGHT) // 左 → 右，跳過小石頭
const T2 = 2.95
const j2 = jump(T2, 1, RIGHT, TAKE_R, LEFT) // 右 → 左，跳過綿羊
// 「咚」把河馬震得整隻彈起來，落在路中間繼續睡；停一拍，退後好幾步
const ROLL = j2.L + 0.1
const BACK = 34
const T3 = 6.3
const J3L = 110
const j3 = jump(T3, 2, BACK, 47, J3L) // 左 → 右，跳過河馬
// 反轉：河馬醒來，反過來從他頭上跳過去
const WAKE = 7.3
const HT = 7.95 // 河馬起跳
const HD = 0.6
const HL = HT + HD // 河馬落地「轟」
const HX = 136
/** 睡著的呼吸：每 1.1 秒鼓起來一下 */
function breathe(from: number, to: number): Move[] {
  const out: Move[] = []
  for (let t = from; t + 1 <= to; t += 1.1) out.push({ at: t, actor: 'hippo', do: 'squash', amount: -0.06, dur: 1 })
  return out
}
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const UP = 9.4 // 他跳起來亮相
const POSE = UP + 0.45

export default scene({
  duration: 11.1,
  bg: { top: '#78C6F2', bottom: '#E4F5FF', floor: '#95CB5C', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 9, y: 77 - 0.42 * 40, size: 40 },
    { id: 'flower', emoji: '🌻', x: 150, y: 77 - 0.42 * 12, size: 12 },
    { id: 'rock', emoji: 'prop:rock', x: GX, y: 77 - 0.42 * ROCK, size: ROCK },
    { id: 'hippo', emoji: '🦛', x: H0, y: HG, size: HIP, flip: true },
    { id: 'sheep', emoji: '🐑', x: -16, y: SG, size: SH, flip: true },
    { id: 'kid', emoji: 'hero:jerry/idle', x: LEFT, y: G, size: S, flip: true },
  ],
  moves: [
    // 河馬趴著睡大覺（壓扁一點、慢慢起伏像在呼吸）
    { at: 0, actor: 'hippo', do: 'stretchTo', amount: NAP, dur: 0.01 },
    ...breathe(0.2, ROLL - 0.1),
    ...breathe(ROLL + 0.8, j3.L),
    // 開場：看到小石頭，興奮地原地蹦一下
    { at: 0.1, actor: 'kid', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: 0.25, actor: 'kid', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: 0.25, actor: 'kid', do: 'hop', amount: 4, dur: 0.25 },
    // 第一次：小石頭
    ...j1.moves,
    // 轉身：綿羊慢慢走進來擋在中間
    { at: 1.7, actor: 'kid', do: 'flip' },
    { at: 1.7, actor: 'kid', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: 1.45, actor: 'sheep', do: 'moveTo', to: { x: GX, y: SG }, dur: 0.85, ease: 'out' },
    { at: 2.3, actor: 'kid', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: 2.3, actor: 'kid', do: 'hop', amount: 3, dur: 0.2 },
    // 第二次：綿羊（被頭上飛過去嚇一跳）
    ...j2.moves,
    { at: T2 + 0.1, actor: 'sheep', do: 'hop', amount: 4, dur: 0.3 },
    { at: j2.L + 0.1, actor: 'sheep', do: 'moveTo', to: { x: 185, y: SG }, dur: 0.45, ease: 'in' },
    // 「咚」把河馬震得整隻彈起來，落在路中間繼續睡
    { at: j2.L, actor: 'hippo', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 3.6, actor: 'kid', do: 'flip' },
    { at: 3.6, actor: 'kid', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ROLL, actor: 'hippo', do: 'moveTo', to: { x: GX, y: HG }, arc: 16, dur: 0.6, ease: 'linear' },
    { at: ROLL + 0.6, actor: 'hippo', do: 'squash', amount: 0.12, dur: 0.2 },
    // 停一拍：傻眼……然後咧嘴，退後好幾步，蹲得低低的
    { at: ROLL + 0.65, actor: 'kid', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: 5.15, actor: 'kid', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: 5.25, actor: 'kid', do: 'moveTo', to: { x: BACK, y: G }, dur: 0.45, ease: 'out' },
    { at: 5.6, actor: 'kid', do: 'squash', amount: 0.3, dur: 0.25 },
    // 第三次：河馬
    ...j3.moves,
    // 河馬被震醒：站高、彈一下
    { at: j3.L, actor: 'hippo', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: WAKE, actor: 'hippo', do: 'stretchTo', amount: 1 / NAP, dur: 0.25, ease: 'back' },
    { at: WAKE, actor: 'hippo', do: 'hop', amount: 6, dur: 0.3 },
    { at: WAKE + 0.2, actor: 'kid', do: 'flip' },
    { at: WAKE + 0.2, actor: 'kid', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 河馬學他：蹲、跳過他頭上
    { at: HT - 0.25, actor: 'hippo', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: HT, actor: 'hippo', do: 'moveTo', to: { x: HX, y: HG }, arc: 30, dur: HD, ease: 'linear' },
    { at: HT + 0.05, actor: 'kid', do: 'swap', emoji: 'hero:jerry/duck' },
    // 轟！他被震起來一屁股坐下
    // 自己寫小一點的壓扁，引擎就不會把牠壓成一片
    { at: HL, actor: 'hippo', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: HL, actor: 'kid', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: HL, actor: 'kid', do: 'hop', amount: 7, dur: 0.35 },
    // 跳起來樂翻了，河馬也跟著蹦
    { at: UP, actor: 'kid', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: UP, actor: 'kid', do: 'moveTo', to: { x: 98, y: G }, arc: 9, dur: 0.45, ease: 'out' },
    { at: UP + 0.1, actor: 'hippo', do: 'moveTo', to: { x: HX - 10, y: HG }, arc: 6, dur: 0.4, ease: 'out' },
    { at: POSE + 0.5, actor: 'hippo', do: 'hop', amount: 4, dur: 0.3 },
  ],
  fx: [
    { at: 0, kind: 'zzz', actor: 'hippo', emoji: '💤', dur: ROLL, scale: 1.5, dx: -6 },
    ...j1.fx,
    ...j2.fx,
    { at: ROLL + 0.6, kind: 'puff', actor: 'hippo', n: 8, dur: 0.7 },
    { at: ROLL + 0.75, kind: 'zzz', actor: 'hippo', emoji: '💤', dur: WAKE - ROLL - 0.8, scale: 1.5 },
    { at: 5.6, kind: 'sweat', actor: 'kid', dur: 0.6 },
    ...j3.fx,
    { at: HL, kind: 'puff', actor: 'hippo', n: 14, dur: 0.9 },
    { at: HL + 0.35, kind: 'dizzy', actor: 'kid', dur: 0.7 },
    { at: POSE, kind: 'burst', actor: 'kid', emoji: '✨', n: 10, dur: 0.9, scale: 1.4, dy: -12 },
    { at: POSE + 0.35, kind: 'burst', actor: 'kid', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4, dy: -16 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.2, to: look(86, 50, 1.2) },
    ...j1.camera,
    ...j2.camera,
    // 河馬彈到中間：鏡頭推近，停一拍
    { at: ROLL + 0.7, dur: 0.8, do: 'zoom', amount: 1.3, to: look(66, 53, 1.3) },
    { at: T3 - 0.4, dur: 0.4, do: 'zoom', amount: 1.2, to: look(80, 50, 1.2) },
    // 河馬跳過他頭上、落到右邊：短暫拉遠讓位
    { at: HT - 0.3, dur: 0.35, do: 'zoom', amount: 1.05, to: look(92, 46, 1.05) },
    ...j3.camera,
    { at: HL, dur: 0.5, do: 'shake', amount: 1.6 },
    // 亮相
    { at: UP, dur: 0.5, do: 'zoom', amount: 1.4, to: look(110, 56, 1.4) },
  ],
  lights: [
    { at: j3.L, dur: 0.05, level: -0.25 },
    { at: j3.L + 0.05, dur: 0.3, level: 0 },
    { at: HL, dur: 0.05, level: -0.25 },
    { at: HL + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.25, sfx: 'boing' },
    ...j1.cues,
    { at: 1.6, sfx: 'tap' },
    ...j2.cues,
    { at: ROLL, sfx: 'rumble' },
    { at: 5.25, sfx: 'slide' },
    ...j3.cues,
    { at: HT, sfx: 'boing' },
    { at: HL, sfx: 'bonk' },
    { at: HL + 0.03, sfx: 'rumble' },
    { at: POSE, say: '瑪利歐' },
    { at: POSE + 0.35, sfx: 'cheer' },
  ],
})
