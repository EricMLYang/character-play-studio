// 演的是本尊：台灣民間故事的虎姑婆——老虎假扮成老婆婆，半夜甜甜地招手騙小孩過來；搞笑版，不演吃小孩、吃手指。造型照 prop:tigeraunt 那一套（藍底白花頭巾、小圓眼鏡、深藍衣裙、白圍裙），不照任何改編作品。
import type { Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：虎姑婆裝成老婆婆招手騙小孩，尾巴卻一直「啵」地從裙子後面翹出來，一次比一次誇張。
// 同一個招手、同一聲「啵」、同一個「回頭看到、慌張塞回去」，三次只有尾巴越翹越長：一小截（小孩指著）→ 長長一條還會扭
// （小孩退一步、托下巴懷疑，她整個人壓上去塞）→ 停一拍（招手招到一半僵住、斜眼往後看）——尾巴「咻」地衝到天上、
// 甩回來把頭巾掀飛，她乾脆現原形大吼。反轉：小孩一點都不怕，跳過她頭頂、一腳踩住攤在地上的尾巴，她「嗷」地彈上天、
// 摔下來坐地頭暈。小孩遞上一顆花生，她抱著一碗花生吃得好開心：「虎姑婆」。
const S = 44 // 虎姑婆的 size（prop 圖留白多，要比小孩大一號，鏡頭再推近補）
const G = 77 - 0.42 * S // 虎姑婆站在地上的 y
const TX = 100 // 虎姑婆站的地方
const K = 26 // 小孩的 size
const KG = 77 - 0.42 * K
const KX = 58 // 小孩一開始站的地方
const STEP = 64 // 好奇往前一步
const BACK = 55 // 第二次退一步
const KR = 134 // 跳過去踩尾巴的地方
const FLOOR_TAIL = 76 // 攤在地上的尾巴（跟腳底一樣高）
const TAIL = '#FC9615' // 尾巴的橘色（照圖上的尾巴取色）
const TW = 2.6 // 尾巴粗細
/** oops 那張圖上尾巴的尖端（u 0.797、v 0.504）：多出來的那一截從這裡接出去 */
const T0: Vec = { x: TX + 0.297 * S, y: G + 0.004 * S }
/** 現原形那張沒有畫尾巴：從裙子後面接出來 */
const R0 = { dx: 0.3 * S, dy: 0.22 * S }
const JOINTS = ['j1', 'j2', 'j3', 'j4']
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡（引擎還會再夾在背景裡） */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })
const off = (o: [number, number]): Vec => ({ x: T0.x + o[0], y: T0.y + o[1] })

/** 尾巴的關節一起移動到一組位置（相對 T0 的偏移） */
function bend(at: number, dur: number, pts: [number, number][], ease: Move['ease'] = 'back'): Move[] {
  return JOINTS.map((id, i) => ({ at, actor: id, do: 'moveTo' as const, to: off(pts[i]), dur, ease }))
}
/** 尾巴四段：從 actor 身上（dx／dy）接到 j1，再一節一節接到尖端 j4 */
function tailFx(at: number, dur: number, base: { dx: number; dy: number }): Fx[] {
  const common = { kind: 'tube' as const, color: TAIL, width: TW, n: 2.2 }
  return [
    { at, dur, actor: 'tg', target: 'j1', dx: base.dx, dy: base.dy, ...common },
    { at, dur, actor: 'j1', target: 'j2', ...common },
    { at, dur, actor: 'j2', target: 'j3', ...common },
    { at, dur, actor: 'j3', target: 'j4', ...common },
  ]
}

// 三次尾巴翹出來的形狀（相對 T0）：一小截 → 長長一條 → 衝上天
const SHAPES: [number, number][][] = [
  [[1.5, -3], [3, -6], [3.5, -9], [2.5, -12]],
  [[4, -7], [7, -14], [7, -21], [4, -28]],
  [[4, -11], [6, -23], [4, -35], [0, -45]],
]

/**
 * 主軸笑點：她正在招手 → 「啵」尾巴從裙子後面翹出來（oops：回頭嚇一跳、冒汗）→ 慌張彎腰把尾巴塞回去 → 再裝沒事招手。
 * k 是第幾次（0、1），p 是啵的那一刻，hold 是尾巴翹著多久。第三次另外寫（衝上天、掀頭巾）。回傳 end＝重新招手的時間。
 */
function pop(p: number, k: number, hold: number) {
  const hide = p + hold
  const moves: Move[] = [
    { at: p, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-oops' },
    { at: p, actor: 'tg', do: 'squash', amount: -0.12 - 0.08 * k, dur: 0.3 },
    ...bend(p, 0.18 + 0.04 * k, SHAPES[k]),
    { at: p + 0.3, actor: 'tg', do: 'shake', amount: 0.4 + 0.3 * k, dur: 0.35 },
    // 塞回去：尾巴收掉、關節回到尖端
    { at: hide, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-hide' },
    ...bend(hide, 0.01, [[0, 0], [0, 0], [0, 0], [0, 0]], 'linear'),
    { at: hide + 0.05, actor: 'tg', do: 'squash', amount: 0.12 + 0.14 * k, dur: 0.3 + 0.15 * k },
    { at: hide + 0.1, actor: 'tg', do: 'shake', amount: 0.6 + 0.5 * k, dur: 0.3 + 0.1 * k },
    // 再裝沒事招手（笑得一次比一次假：歪頭歪更大）
    { at: hide + 0.45 + 0.1 * k, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-wave' },
    { at: hide + 0.5 + 0.1 * k, actor: 'tg', do: 'tilt', amount: -6 - 3 * k, dur: 0.35 },
  ]
  if (k >= 1) {
    // 第二次：長長的尾巴還會左右扭
    for (let i = 0; i < 3; i++) {
      const s = i % 2 ? -1 : 1
      const at = p + 0.25 + 0.2 * i
      moves.push(...bend(at, 0.2, SHAPES[1].map(([x, y], j) => [x + s * (j + 1) * 1.2, y] as [number, number]), 'inOut'))
    }
  }
  const fx: Fx[] = [
    ...tailFx(p, hold, { dx: T0.x - TX, dy: T0.y - G }),
    { at: p, kind: 'burst', x: T0.x + 2, y: T0.y - 2, emoji: '💥', n: 1, dur: 0.3, scale: 0.6 + 0.3 * k },
    { at: p + 0.2, kind: 'sweat', actor: 'tg', dur: 0.6 },
    { at: hide + 0.1, kind: 'sweat', actor: 'tg', dur: 0.6 + 0.2 * k },
  ]
  if (k >= 1) fx.push({ at: hide + 0.1, kind: 'puff', actor: 'tg', n: 6, dur: 0.5 })
  const tip = off(SHAPES[k][3])
  const camera: Camera[] = [
    { at: p + 0.02, dur: 0.4 + 0.1 * k, do: 'punch', amount: 0.07 + 0.02 * k, to: { x: TX - 6, y: 56 } },
  ]
  if (k >= 1) camera.push({ at: hide + 0.05, dur: 0.3, do: 'shake', amount: 0.7 })
  const cues: Cue[] = [{ at: p, sfx: 'plop' }, { at: p + 0.02, sfx: 'boing' }, { at: hide, sfx: 'slide' }]
  if (k >= 1) cues.push({ at: hide + 0.1, sfx: 'deflate' })
  return { moves, fx, camera, cues, end: hide + 0.45 + 0.1 * k }
}

/** 招手：前傾、手一招一招（歪頭） */
function beckon(at: number, n: number, amp: number): Move[] {
  const out: Move[] = []
  for (let i = 0; i < n; i++) {
    out.push({ at: at + 0.38 * i, actor: 'tg', do: 'tilt', amount: -amp, dur: 0.32 })
    out.push({ at: at + 0.38 * i, actor: 'tg', do: 'squash', amount: 0.05, dur: 0.32 })
  }
  return out
}

const ENTER = 0 // 偷笑著進場
const WAVE = 1.35 // 第一次招手
const P1 = 2.3, H1 = 0.7
const c1 = pop(P1, 0, H1)
const P2 = c1.end + 0.45, H2 = 0.95
const c2 = pop(P2, 1, H2)
const FREEZE = c2.end + 0.35 // 招手招到一半僵住
const GLANCE = FREEZE + 0.15 // 斜眼往後看
const P3 = GLANCE + 0.5 // 尾巴「咻」衝上天
const FLICK = P3 + 0.32 // 甩回來掀頭巾
const ROAR = FLICK + 0.06 // 現原形大吼
const FLOP = ROAR + 0.8 // 尾巴攤到地上
const JUMP = FLOP + 0.15 // 小孩跳過她頭頂
const STOMP = JUMP + 0.55 // 一腳踩住尾巴
const OW = STOMP + 0.2 // 嗷！彈上天
const DOWN = OW + 0.45 // 開始掉下來
const SIT = DOWN + 0.3 // 坐在地上頭暈
const GIVE = SIT + 0.45 // 小孩遞花生
const CATCH = GIVE + 0.55 // 花生進到懷裡：抱著一碗吃
const SAY = CATCH + 0.2
const UPY = 24 // 彈上天的最高點
const SITX = TX - 2

// 第三次的尾巴：衝上天 → 在頂上捲過來 → 尖端甩到頭頂（掀頭巾）
const HEAD: [number, number] = [TX - 3 - T0.x, G - 0.36 * S - T0.y]
const CURL: [number, number][] = [[4, -12], [3, -26], [-6, -36], HEAD]
// 現原形時的尾巴（從裙子後面翹上去、尖端往前勾），以及攤在地上的樣子（都是絕對座標，換算成相對 T0）
const abs = (x: number, y: number): [number, number] => [x - T0.x, y - T0.y]
const ROAR_TAIL = [abs(118, 58), abs(122, 46), abs(121, 34), abs(115, 26)]
const FLAT_TAIL = [abs(119, FLOOR_TAIL - 1), abs(126, FLOOR_TAIL), abs(133, FLOOR_TAIL), abs(140, FLOOR_TAIL)]

export default scene({
  duration: SAY + 1.5,
  bg: { top: '#3E3F8E', bottom: '#8A78C8', floor: '#6F8F57', scenery: 'night' },
  actors: [
    { id: 'house', emoji: '🏠', x: 24, y: 77 - 0.42 * 36, size: 36, tint: 'brightness(.85) saturate(.8)' },
    { id: 'lantern', emoji: '🏮', x: 146, y: 16, size: 10, float: true },
    // 尾巴的關節（看不見，只給 tube 接）
    ...JOINTS.map((id) => ({ id, emoji: '🟠', x: T0.x, y: T0.y, size: 2, hidden: true, float: true })),
    { id: 'kid', emoji: 'hero:yang/idle', x: KX, y: KG, size: K, flip: true },
    { id: 'tg', emoji: 'prop:tigeraunt', x: 152, y: G, size: S },
    { id: 'nut', emoji: '🥜', x: KR - 19, y: KG - 3, size: 13, hidden: true, float: true },
  ],
  moves: [
    // 開場：拄著拐杖、摀嘴偷笑，一步一步走進來
    { at: ENTER, actor: 'tg', do: 'moveTo', to: { x: TX, y: G }, dur: 0.9, ease: 'out' },
    { at: 0.95, actor: 'tg', do: 'shake', amount: 0.6, dur: 0.35 },
    { at: 0.95, actor: 'tg', do: 'squash', amount: 0.08, dur: 0.35 },
    { at: 0.3, actor: 'kid', do: 'hop', amount: 2, dur: 0.25 },
    // 甜甜地招手；小孩好奇地往前一步
    { at: WAVE, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-wave' },
    ...beckon(WAVE + 0.1, 2, 7),
    { at: WAVE + 0.3, actor: 'kid', do: 'swap', emoji: 'hero:yang/walk' },
    { at: WAVE + 0.3, actor: 'kid', do: 'moveTo', to: { x: STEP, y: KG }, dur: 0.45 },
    { at: WAVE + 0.75, actor: 'kid', do: 'swap', emoji: 'hero:yang/idle' },
    // 第一次：一小截尾巴，小孩嚇一跳、指著它
    ...c1.moves,
    { at: P1 + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: P1 + 0.1, actor: 'kid', do: 'hop', amount: 3, dur: 0.25 },
    { at: P1 + 0.4, actor: 'kid', do: 'swap', emoji: 'hero:yang/point' },
    { at: c1.end - 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/idle' },
    ...beckon(c1.end + 0.1, 1, 8),
    // 第二次：長長一條還會扭，小孩退一步、托下巴懷疑
    ...c2.moves,
    { at: P2 + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: P2 + 0.2, actor: 'kid', do: 'moveTo', to: { x: BACK, y: KG }, dur: 0.3, ease: 'out' },
    { at: P2 + 0.6, actor: 'kid', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: P2 + 0.65, actor: 'kid', do: 'tilt', amount: 6, dur: 0.5 },
    ...beckon(c2.end + 0.05, 1, 12),
    // 停一拍：招手招到一半僵住……斜眼往後看
    { at: FREEZE, actor: 'tg', do: 'rotateTo', amount: -8, dur: 0.12, ease: 'out' },
    { at: GLANCE, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt' },
    { at: GLANCE + 0.25, actor: 'tg', do: 'shake', amount: 0.3, dur: 0.25 },
    { at: GLANCE + 0.1, actor: 'kid', do: 'tilt', amount: 8, dur: 0.4 },
    // 第三次：尾巴「咻」地衝上天、捲過來甩到頭上
    { at: P3, actor: 'tg', do: 'rotateTo', amount: 8, dur: 0.1 },
    { at: P3, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-oops' },
    { at: P3, actor: 'tg', do: 'squash', amount: -0.25, dur: 0.3 },
    ...bend(P3, 0.2, SHAPES[2], 'out'),
    ...bend(P3 + 0.2, FLICK - P3 - 0.2, CURL, 'in'),
    // 頭巾被掀飛——乾脆現原形大吼
    { at: ROAR, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-roar' },
    ...bend(ROAR, 0.25, ROAR_TAIL, 'back'),
    { at: ROAR, actor: 'tg', do: 'scaleTo', amount: 1.12, dur: 0.25, ease: 'back' },
    { at: ROAR + 0.05, actor: 'tg', do: 'shake', amount: 1.2, dur: 0.6 },
    // 小孩一點都不怕：閉眼得意
    { at: ROAR + 0.3, actor: 'kid', do: 'swap', emoji: 'hero:yang/smug' },
    { at: ROAR + 0.35, actor: 'kid', do: 'hop', amount: 2, dur: 0.25 },
    // 尾巴攤到地上；小孩蹲低、跳過她頭頂
    ...bend(FLOP, 0.25, FLAT_TAIL, 'in'),
    { at: FLOP, actor: 'tg', do: 'scaleTo', amount: 1 / 1.12, dur: 0.25 },
    { at: JUMP - 0.15, actor: 'kid', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: JUMP, actor: 'kid', do: 'swap', emoji: 'hero:yang/jump' },
    { at: JUMP, actor: 'kid', do: 'moveTo', to: { x: KR, y: KG }, arc: 34, dur: STOMP - JUMP, ease: 'inOut' },
    { at: JUMP + 0.27, actor: 'kid', do: 'flip' },
    // 一腳踩住尾巴！
    { at: STOMP, actor: 'kid', do: 'swap', emoji: 'hero:yang/stomp' },
    // 踩到的那一下，她整個人一抖、尾巴毛都豎起來
    { at: STOMP, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-oops' },
    { at: STOMP, actor: 'tg', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: STOMP + 0.02, actor: 'tg', do: 'shake', amount: 1, dur: 0.18 },
    // 嗷！彈上天、手腳亂踢，摔下來坐地頭暈
    { at: OW, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-flee' },
    ...bend(OW, 0.01, [[0, 0], [0, 0], [0, 0], [0, 0]], 'linear'),
    { at: OW, actor: 'tg', do: 'moveTo', to: { x: TX, y: UPY }, dur: DOWN - OW, ease: 'out' },
    { at: OW + 0.05, actor: 'tg', do: 'tilt', amount: 14, dur: 0.18 },
    { at: OW + 0.23, actor: 'tg', do: 'tilt', amount: -14, dur: 0.18 },
    { at: OW + 0.41, actor: 'tg', do: 'tilt', amount: 10, dur: 0.18 },
    { at: DOWN, actor: 'tg', do: 'moveTo', to: { x: SITX, y: G }, dur: SIT - DOWN, ease: 'in' },
    { at: SIT, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-dizzy' },
    { at: SIT + 0.05, actor: 'tg', do: 'tilt', amount: 6, dur: 0.45 },
    { at: OW + 0.25, actor: 'kid', do: 'swap', emoji: 'hero:yang/laugh' },
    // 小孩笑著遞上花生
    { at: GIVE, actor: 'kid', do: 'swap', emoji: 'hero:yang/reach' },
    { at: GIVE, actor: 'kid', do: 'moveTo', to: { x: KR - 8, y: KG }, dur: 0.35 },
    { at: GIVE + 0.25, actor: 'nut', do: 'pop', dur: 0.2 },
    { at: CATCH - 0.15, actor: 'nut', do: 'moveTo', to: { x: SITX + 4, y: G + 6 }, arc: 6, dur: 0.15, ease: 'in' },
    { at: CATCH, actor: 'nut', do: 'vanish', dur: 0.05 },
    { at: CATCH, actor: 'tg', do: 'swap', emoji: 'prop:tigeraunt-eat' },
    { at: CATCH + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/laugh' },
    // 亮相：嚼嚼嚼
    { at: CATCH + 0.45, actor: 'tg', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: CATCH + 0.75, actor: 'tg', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: CATCH + 1.05, actor: 'tg', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: CATCH + 1.35, actor: 'tg', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: CATCH + 0.6, actor: 'kid', do: 'hop', amount: 2, dur: 0.3 },
    { at: CATCH + 1.2, actor: 'kid', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 1.0, kind: 'zzz', actor: 'tg', emoji: '🎵', dur: 0.4 },
    ...c1.fx,
    { at: P1 + 0.12, kind: 'pop', actor: 'kid', emoji: '❗', dur: 0.7 },
    ...c2.fx,
    { at: P2 + 0.12, kind: 'pop', actor: 'kid', emoji: '❗', dur: 0.5 },
    // 第三次：尾巴衝上天、甩過來
    ...tailFx(P3, ROAR - P3, { dx: T0.x - TX, dy: T0.y - G }),
    { at: P3, kind: 'burst', x: T0.x + 2, y: T0.y - 2, emoji: '💥', n: 1, dur: 0.35, scale: 1.2 },
    { at: P3 + 0.05, kind: 'sweat', actor: 'tg', dur: 0.5 },
    // 現原形：尾巴從裙子後面翹著，一直到被踩
    ...tailFx(ROAR, OW - ROAR, R0),
    { at: ROAR, kind: 'burst', actor: 'tg', emoji: '💥', n: 1, dx: -8, dy: -2, dur: 0.4, scale: 1.4 },
    { at: ROAR + 0.05, kind: 'blow', actor: 'tg', dx: -6, dy: 2, to: { x: STEP - 10, y: 45 }, dur: 0.5 },
    { at: STOMP, kind: 'burst', x: KR - 3, y: FLOOR_TAIL - 2, emoji: '💥', n: 1, dur: 0.35, scale: 1.3 },
    { at: STOMP, kind: 'puff', actor: 'kid', n: 6, dur: 0.5 },
    { at: OW + 0.05, kind: 'sweat', actor: 'tg', dur: 0.5 },
    { at: SIT, kind: 'dizzy', actor: 'tg', dur: 0.9 },
    { at: CATCH, kind: 'burst', actor: 'tg', emoji: '✨', n: 8, dy: -16, dur: 0.8, scale: 1.1 },
    { at: CATCH + 0.4, kind: 'burst', actor: 'tg', emoji: '🎉', n: 7, dx: -4, dy: -14, dur: 0.9, scale: 1.2 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.3, to: aim({ x: 86, y: 52 }, 1.3) },
    ...c1.camera,
    ...c2.camera,
    // 停一拍：慢慢推近她僵住的臉
    { at: FREEZE, dur: 0.6, do: 'zoom', amount: 1.5, to: aim({ x: TX - 2, y: 52 }, 1.5) },
    // 第三次：拉開看整條衝上天的尾巴
    { at: P3, dur: 0.2, do: 'zoom', amount: 1.15, to: aim({ x: 92, y: 45 }, 1.15) },
    { at: ROAR, dur: 0.45, do: 'punch', amount: 0.14, to: { x: TX - 4, y: G - 8 } },
    { at: ROAR, dur: 0.5, do: 'shake', amount: 1.4 },
    // 跳過頭頂、彈上天：定住全景
    { at: FLOP, dur: 0.3, do: 'zoom', amount: 1.1, to: aim({ x: 100, y: 46 }, 1.1) },
    { at: STOMP, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: SIT, dur: 0.3, do: 'shake', amount: 0.9 },
    // 亮相：推到她最大
    { at: GIVE, dur: 0.5, do: 'zoom', amount: 1.35, to: aim({ x: 108, y: 56 }, 1.35) },
    { at: CATCH, dur: 0.6, do: 'zoom', amount: 1.6, to: aim({ x: 108, y: 59 }, 1.6) },
  ],
  lights: [
    { at: ROAR, dur: 0.05, level: -0.35 },
    { at: ROAR + 0.05, dur: 0.35, level: 0 },
    { at: STOMP, dur: 0.05, level: -0.25 },
    { at: STOMP + 0.05, dur: 0.3, level: 0 },
    { at: CATCH, dur: 0.05, level: -0.3 },
    { at: CATCH + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.95, sfx: 'hic' },
    { at: WAVE + 0.1, sfx: 'blip' },
    ...c1.cues,
    ...c2.cues,
    { at: GLANCE, sfx: 'blip' },
    { at: P3, sfx: 'plop' },
    { at: P3 + 0.02, sfx: 'boing' },
    { at: P3 + 0.05, sfx: 'whoosh' },
    { at: ROAR, sfx: 'rumble' },
    { at: JUMP, sfx: 'whoosh' },
    { at: STOMP, sfx: 'bonk' },
    { at: OW + 0.02, sfx: 'boing' },
    { at: SIT, sfx: 'bonk' },
    { at: GIVE + 0.25, sfx: 'blip' },
    { at: CATCH, sfx: 'plop' },
    { at: CATCH + 0.45, sfx: 'gulp' },
    { at: SAY, say: '虎姑婆' },
    { at: SAY + 0.4, sfx: 'cheer' },
  ],
})
