// 演的是本尊：格林童話的白雪公主——咬了一口紅蘋果就倒下沉睡；搞笑版，不演壞皇后、毒、棺材、王子，她只是太貪吃、睡太熟。造型照 prop:snowwhite 那一套（原創：黑髮麻花辮、雪花髮夾、淺藍冬裝白毛邊），不照任何動畫電影的版本。
import type { Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：貪吃的白雪公主咬一口蘋果就睡著，動物們輪流來叫她，一隻比一隻大聲，她怎麼都叫不醒。
// 同一套「走到她頭邊 → 吸氣鼓起來 → 對著她叫出一圈一圈的橘色聲波 → 她的反應」，三次只有動物越來越大、聲波越來越大、
// 她越來越離譜地淡定：小鳥「啾」（她吹出一顆鼾聲泡泡，啵地把小鳥彈退）→ 公雞「喔喔喔」（她翻個身、鼾打得更大，公雞傻眼）→
// 停一拍（地面一震一震）——大象「叭——」（最大的聲波、整個畫面震，小鳥和公雞被吹到畫面邊，她被吹得滑一段）……風停了，她咂咂嘴繼續睡。
// 三隻一起垮下來。反轉：公雞被吹掉的那根羽毛飄下來，小鳥叼著它在她鼻子上搔兩下——吸氣、吸氣、吸氣——「哈啾！」
// 她彈起來，一小塊蘋果像子彈一樣噴出去，正中大象的屁股。她伸個大懶腰，看到大家，開心跳起來：「白雪公主」。
const S = 44 // 白雪公主的 size（九張同一個比例；prop 圖留白多，鏡頭再推近補）
const G = 77 - 0.42 * S // 她站在地上的 y（躺平那張也一樣底部對齊，直接 swap）
const SX = 100 // 躺下來的地方（頭在左邊）
const SX2 = 104 // 被大象吹得滑過去之後
/** 躺平那張圖上臉的中心（u 0.33、v 0.60）、嘴巴鼻子（u 0.40、v 0.62） */
const face = (x: number): Vec => ({ x: x - 0.17 * S, y: G + 0.1 * S })
const nose = (x: number): Vec => ({ x: x - 0.1 * S, y: G + 0.12 * S })
const B = 11 // 小鳥
const BG = 77 - 0.42 * B
const BX = 72 // 小鳥叫她的地方
const R = 28 // 公雞
const RG = 77 - 0.42 * R
const RX = 60
const RX2 = 146 // 公雞叫完退到她腳邊後面
const E = 54 // 大象
const EG = 77 - 0.42 * E
const EX = 40
const STUMP = { x: 133, size: 18 }
const PERCH = { x: STUMP.x, y: 77 - 0.42 * STUMP.size - 13 } // 小鳥站在樹樁上
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡（引擎還會再夾在背景裡） */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })
const RING = '#FF7A12' // 聲波（綠樹林、淺藍天上都看得清楚）
// 小鳥在樹林裡要看得見：白描邊＋一點光暈
const BIRD_TINT = 'saturate(1.2) drop-shadow(0 0 1px #FFFFFF) drop-shadow(0 0 2.5px #FFFFFF)'
const APPLE_TINT = 'saturate(1.2) drop-shadow(0 0 1px #FFF6C8) drop-shadow(0 0 3px #FFE07A)'

/** 聲波：以嘴巴為中心、一圈一圈往右的「)」弧，一圈比一圈晚一點出來 */
function rings(at: number, c: Vec, radii: number[], width: number, dur: number): Fx[] {
  const fx: Fx[] = []
  radii.forEach((r, i) => {
    const t = at + i * 0.06
    const w = width * (1 - 0.3 * (i / Math.max(1, radii.length - 1)))
    for (const low of [false, true]) {
      fx.push({ at: t, dur, kind: 'swoosh', x: c.x, y: c.y, to: { x: c.x + 200, y: c.y }, n: r, sweep: -25, low, width: w, color: RING })
    }
  })
  return fx
}

/**
 * 主軸笑點：吸氣鼓起來 → 對著她叫（壓扁一下、抖、聲波打出去、音符噴出來）。三隻同一套，k 越大越大聲。
 * who 是誰、mouth 是嘴巴在哪、p 是叫出聲那一刻。
 */
function call(p: number, k: number, who: string, mouth: Vec) {
  const inhale = 0.3 + 0.12 * k
  const moves: Move[] = [
    { at: p - inhale, actor: who, do: 'squash', amount: -0.12 - 0.05 * k, dur: inhale },
    { at: p - inhale, actor: who, do: 'scaleTo', amount: 1.08 + 0.03 * k, dur: inhale, ease: 'out' },
    { at: p, actor: who, do: 'scaleTo', amount: 1 / (1.08 + 0.03 * k), dur: 0.2, ease: 'out' },
    { at: p, actor: who, do: 'squash', amount: 0.14 + 0.03 * k, dur: 0.22 },
    { at: p + 0.05, actor: who, do: 'shake', amount: 0.4 + 0.4 * k, dur: 0.4 + 0.15 * k },
  ]
  const radii = [[3, 6], [5, 10, 15], [6, 12, 18, 23, 27]][k]
  const fx: Fx[] = [
    ...rings(p + 0.02, mouth, radii, 1.3 + 0.8 * k, 0.4 + 0.1 * k),
    { at: p + 0.05, kind: 'burst', x: mouth.x + 3, y: mouth.y - 10 - 4 * k, emoji: '🎵', n: 2 + 2 * k, dur: 0.6, scale: 0.5 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: p, dur: 0.3 + 0.05 * k, do: 'punch', amount: 0.03 + 0.04 * k, to: mouth },
    { at: p + 0.02, dur: 0.3 + 0.2 * k, do: 'shake', amount: 0.2 + 0.6 * k },
  ]
  const cues: Cue[] = [{ at: p - inhale, sfx: 'bubble' }, { at: p, sfx: 'blip' }, { at: p + 0.03, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: p + 0.05, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

// 時間表
const IN = 0 // 蹦蹦跳跳進來
const SEE = 0.45 // 捧起蘋果盯著看
const BITE = 0.85 // 咬一大口
const WOB = 1.3 // 眼睛一閉、晃兩下
const FALL = 1.62 // 往後倒
const SLEEP = 1.76 // 咚！躺平睡著
// 第一次：小鳥
const B_IN = 1.85
const P1 = 2.55
const c1 = call(P1, 0, 'bird', { x: BX + 6, y: BG - 3 })
const BUB = P1 + 0.25 // 鼾聲泡泡從嘴巴長出來
const BPOP = BUB + 0.55 // 飄到小鳥面前，啵
const B_OFF = BPOP + 0.3 // 小鳥飛到樹樁上
// 第二次：公雞
const R_IN = 3.3
const P2 = 4.3
const c2 = call(P2, 1, 'rooster', { x: RX + 0.38 * R + 1, y: RG - 0.3 * R })
const ROLL = P2 + 0.3 // 她翻個身
const DUH = ROLL + 0.45 // 公雞傻眼
const R_OFF = DUH + 0.3 // 公雞退到她腳邊後面
// 停一拍：地面一震一震，大象走進來
const THUMP = 5.25
const E_IN = 5.1
const P3 = 6.6
const c3 = call(P3, 2, 'ele', { x: EX + 0.33 * E, y: EG + 0.12 * E })
const CALM = P3 + 0.6 // 風停了
const SMACK = CALM + 0.05 // 咂咂嘴
const SLUMP = SMACK + 0.4 // 三隻一起垮下來
// 反轉：羽毛
const GRAB = SLUMP + 0.15 // 小鳥叼起飄下來的羽毛
const TICKLE = GRAB + 0.35 // 在她鼻子上搔
const SNIFF = TICKLE + 0.35 // 吸氣三次
const ACHOO = SNIFF + 0.72 // 哈啾！
const HIT = ACHOO + 0.42 // 正中大象屁股
const YAWN = ACHOO + 0.55 // 伸懶腰打呵欠
const HAPPY = YAWN + 0.45 // 看到大家，開心跳起來
const SAY = HAPPY + 0.12

const MOUTH_UP = { x: SX2 - 0.1 * S, y: G - 0.01 * S } // 打噴嚏那張的嘴巴
const BUTT = { x: EX + 0.33 * E, y: EG + 0.08 * E } // 大象轉過身後的屁股
const FEATHER_AT = { x: nose(SX2).x + 3, y: nose(SX2).y - 2.5 } // 搔鼻子時羽毛的中心
const BELLY = { x: SX2 + 5, y: G + 0.06 * S } // 小鳥站在她肚子上

/** 睡著時的呼吸：一起一伏（避開翻身、被吹的時候） */
const BREATH: Move[] = []
for (let t = SLEEP + 0.3; t < ACHOO - 0.8; t += 0.62) {
  if ((t > ROLL - 0.3 && t < ROLL + 0.7) || (t > P3 - 0.1 && t < CALM)) continue
  BREATH.push({ at: t, actor: 'sw', do: 'squash', amount: -0.04, dur: 0.55 })
}

export default scene({
  duration: SAY + 1.45,
  bg: { top: '#7FCBF0', bottom: '#DDF5D2', floor: '#79B84E', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 12, y: 77 - 0.42 * 64, size: 64 },
    { id: 'tree2', emoji: 'prop:tree', x: 154, y: 77 - 0.42 * 56, size: 56 },
    { id: 'stump', emoji: '🪵', x: STUMP.x, y: 77 - 0.42 * STUMP.size, size: STUMP.size },
    { id: 'apple', emoji: '🍎', x: STUMP.x, y: PERCH.y + 2, size: 9, tint: APPLE_TINT },
    { id: 'rooster', emoji: 'prop:rooster', x: -20, y: RG, size: R, flip: true },
    { id: 'ele', emoji: 'prop:elephant', x: -34, y: EG, size: E, flip: true },
    { id: 'sw', emoji: 'prop:snowwhite-happy', x: 62, y: G, size: S, flip: true },
    { id: 'snore', emoji: '🫧', x: nose(SX).x, y: nose(SX).y, size: 3, hidden: true, float: true },
    { id: 'feather', emoji: 'prop:feather', x: RX2, y: RG - 6, size: 10, hidden: true, float: true, pivot: 'center' },
    { id: 'bird', emoji: '🐦', x: 24, y: 22, size: B, flip: true, tint: BIRD_TINT },
    { id: 'chunk', emoji: '🍎', x: MOUTH_UP.x, y: MOUTH_UP.y, size: 6, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：蹦蹦跳跳進來，看到樹樁上閃閃發亮的大紅蘋果
    { at: IN, actor: 'sw', do: 'moveTo', to: { x: 114, y: G }, dur: SEE - IN, ease: 'out' },
    ...[0, 1].map((i): Move => ({ at: IN + 0.02 + 0.21 * i, actor: 'sw', do: 'hop', amount: 4, dur: 0.2 })),
    { at: 0.1, actor: 'apple', do: 'flash', dur: 0.35 },
    // 捧起來盯著看，口水都要流下來了
    { at: SEE, actor: 'apple', do: 'vanish', dur: 0.05 },
    { at: SEE, actor: 'sw', do: 'swap', emoji: 'prop:snowwhite-apple' },
    { at: SEE + 0.1, actor: 'sw', do: 'tilt', amount: 6, dur: 0.3 },
    // 咬一大口，嚼兩下
    { at: BITE, actor: 'sw', do: 'swap', emoji: 'prop:snowwhite-bite' },
    { at: BITE + 0.15, actor: 'sw', do: 'squash', amount: 0.1, dur: 0.13 },
    { at: BITE + 0.3, actor: 'sw', do: 'squash', amount: 0.1, dur: 0.13 },
    // 眼睛一閉、晃兩下——咚地往後倒
    { at: WOB, actor: 'sw', do: 'tilt', amount: -9, dur: 0.16 },
    { at: WOB + 0.16, actor: 'sw', do: 'tilt', amount: 9, dur: 0.16 },
    { at: FALL, actor: 'sw', do: 'rotateTo', amount: -35, dur: SLEEP - FALL, ease: 'in' },
    { at: SLEEP, actor: 'sw', do: 'rotateTo', amount: 35, dur: 0.01 },
    { at: SLEEP, actor: 'sw', do: 'swap', emoji: 'prop:snowwhite-sleep' },
    { at: SLEEP, actor: 'sw', do: 'flip' },
    { at: SLEEP, actor: 'sw', do: 'moveTo', to: { x: SX, y: G }, dur: 0.01 },
    { at: SLEEP, actor: 'sw', do: 'squash', amount: 0.22, dur: 0.22 },
    ...BREATH,
    // 第一次：小鳥飛到她頭邊，「啾」
    { at: B_IN, actor: 'bird', do: 'moveTo', to: { x: BX, y: BG }, arc: 8, dur: 0.4, ease: 'out' },
    ...c1.moves,
    // 她沒醒，嘴巴吹出一顆鼾聲泡泡，越來越大、飄到小鳥面前「啵」——把小鳥彈退一步
    { at: BUB, actor: 'snore', do: 'pop', dur: 0.1 },
    { at: BUB, actor: 'snore', do: 'moveTo', to: { x: face(SX).x - 4, y: face(SX).y - 9 }, dur: 0.4, ease: 'out' },
    { at: BUB, actor: 'snore', do: 'scaleTo', amount: 3, dur: 0.4, ease: 'out' },
    { at: BUB + 0.4, actor: 'snore', do: 'moveTo', to: { x: BX + 7, y: BG - 6 }, dur: BPOP - BUB - 0.4, ease: 'in' },
    { at: BPOP, actor: 'snore', do: 'vanish', dur: 0.05 },
    { at: BPOP, actor: 'bird', do: 'moveTo', to: { x: BX - 8, y: BG }, dur: 0.25, ease: 'out' },
    { at: BPOP, actor: 'bird', do: 'hop', amount: 3, dur: 0.25 },
    { at: BPOP, actor: 'bird', do: 'tilt', amount: -18, dur: 0.3 },
    // 小鳥飛到樹樁上
    { at: B_OFF, actor: 'bird', do: 'moveTo', to: PERCH, arc: 20, dur: 0.4, ease: 'inOut' },
    { at: B_OFF + 0.4, actor: 'bird', do: 'flip' },
    // 第二次：公雞大步走來、挺胸「喔喔喔」
    { at: R_IN, actor: 'rooster', do: 'moveTo', to: { x: RX, y: RG }, dur: 0.55, ease: 'out' },
    ...c2.moves,
    // 她只是翻個身（左右翻一下），鼾打得更大
    { at: ROLL, actor: 'sw', do: 'tilt', amount: 8, dur: 0.15 },
    { at: ROLL + 0.12, actor: 'sw', do: 'flip' },
    { at: ROLL + 0.12, actor: 'sw', do: 'squash', amount: 0.12, dur: 0.15 },
    { at: ROLL + 0.38, actor: 'sw', do: 'flip' },
    { at: ROLL + 0.38, actor: 'sw', do: 'squash', amount: 0.12, dur: 0.15 },
    // 公雞傻眼：往後一縮、抖
    { at: DUH, actor: 'rooster', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: DUH, actor: 'rooster', do: 'tilt', amount: 10, dur: 0.3 },
    // 退到她腳邊後面
    { at: R_OFF, actor: 'rooster', do: 'moveTo', to: { x: RX2, y: RG }, dur: 0.38, ease: 'in' },
    { at: R_OFF + 0.4, actor: 'rooster', do: 'flip' },
    // 停一拍：地面一震一震，大象走進來
    { at: E_IN, actor: 'ele', do: 'moveTo', to: { x: EX, y: EG }, dur: 0.9, ease: 'out' },
    ...[0, 1, 2].map((i): Move => ({ at: THUMP + 0.27 * i, actor: 'bird', do: 'hop', amount: 1.5 + i, dur: 0.15 })),
    ...[0, 1, 2].map((i): Move => ({ at: THUMP + 0.27 * i, actor: 'rooster', do: 'hop', amount: 1 + i, dur: 0.15 })),
    // 第三次：大象「叭——」
    ...c3.moves,
    { at: P3 - 0.42, actor: 'ele', do: 'rotateTo', amount: -8, dur: 0.4 },
    { at: P3, actor: 'ele', do: 'rotateTo', amount: 8, dur: 0.15 },
    // 小鳥和公雞被吹到畫面邊，羽毛被吹掉一根
    { at: P3 + 0.08, actor: 'bird', do: 'moveTo', to: { x: 145, y: BG }, arc: 10, dur: 0.4, ease: 'out' },
    { at: P3 + 0.08, actor: 'bird', do: 'tilt', amount: 25, dur: 0.4 },
    { at: P3 + 0.1, actor: 'rooster', do: 'moveTo', to: { x: 149, y: RG }, dur: 0.35, ease: 'out' },
    { at: P3 + 0.1, actor: 'rooster', do: 'tilt', amount: 18, dur: 0.4 },
    { at: P3 + 0.15, actor: 'feather', do: 'pop', dur: 0.1 },
    { at: P3 + 0.15, actor: 'feather', do: 'moveTo', to: { x: 128, y: 30 }, dur: 0.35, ease: 'out' },
    { at: P3 + 0.15, actor: 'feather', do: 'rotateTo', amount: -200, dur: 0.5 },
    { at: P3 + 0.5, actor: 'feather', do: 'moveTo', to: { x: 140, y: 56 }, dur: GRAB - P3 - 0.5, ease: 'inOut' },
    { at: P3 + 0.5, actor: 'feather', do: 'rotateTo', amount: 200, dur: GRAB - P3 - 0.5 },
    // 她被吹得滑一段、抖個不停
    { at: P3 + 0.05, actor: 'sw', do: 'moveTo', to: { x: SX2, y: G }, dur: 0.4, ease: 'out' },
    { at: P3 + 0.05, actor: 'sw', do: 'shake', amount: 0.8, dur: 0.5 },
    // 風停了……她咂咂嘴，繼續睡
    ...[0, 1].map((i): Move => ({ at: SMACK + 0.17 * i, actor: 'sw', do: 'squash', amount: 0.07, dur: 0.14 })),
    // 三隻一起垮下來；大象背過身去
    { at: SLUMP, actor: 'ele', do: 'flip' },
    { at: SLUMP, actor: 'ele', do: 'stretchTo', amount: 1.1, dur: 0.3, ease: 'out' },
    { at: SLUMP, actor: 'rooster', do: 'swap', emoji: 'prop:rooster-sleep' },
    { at: SLUMP, actor: 'rooster', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: SLUMP, actor: 'bird', do: 'squash', amount: 0.25, dur: 0.3 },
    // 反轉：小鳥叼起飄下來的羽毛，跳到她肚子上
    { at: GRAB - 0.1, actor: 'bird', do: 'flip' },
    { at: GRAB - 0.05, actor: 'bird', do: 'moveTo', to: { x: 143, y: 60 }, dur: 0.1 },
    { at: GRAB + 0.05, actor: 'bird', do: 'moveTo', to: BELLY, arc: 10, dur: TICKLE - GRAB - 0.05, ease: 'inOut' },
    { at: GRAB + 0.05, actor: 'feather', do: 'moveTo', to: FEATHER_AT, arc: 10, dur: TICKLE - GRAB - 0.05, ease: 'inOut' },
    { at: GRAB + 0.05, actor: 'feather', do: 'rotateTo', amount: -60, dur: TICKLE - GRAB - 0.05 },
    // 輕輕搔兩下
    ...[0, 1].map((i): Move => ({ at: TICKLE + 0.17 * i, actor: 'feather', do: 'rotateTo', amount: i ? 14 : -14, dur: 0.16 })),
    { at: TICKLE + 0.02, actor: 'feather', do: 'shake', amount: 0.6, dur: 0.3 },
    // 鼻子癢：吸氣、吸氣、吸氣（越來越大）
    ...[0, 1, 2].map((i): Move => ({ at: SNIFF + 0.22 * i, actor: 'sw', do: 'squash', amount: -0.06 - 0.05 * i, dur: 0.2 + 0.04 * i })),
    ...[0, 1, 2].map((i): Move => ({ at: SNIFF + 0.22 * i, actor: 'sw', do: 'tilt', amount: -3 - 2 * i, dur: 0.2 })),
    { at: SNIFF + 0.45, actor: 'bird', do: 'moveTo', to: { x: BELLY.x + 8, y: BELLY.y - 4 }, dur: 0.2, ease: 'out' },
    { at: SNIFF + 0.45, actor: 'feather', do: 'moveTo', to: { x: FEATHER_AT.x + 8, y: FEATHER_AT.y - 4 }, dur: 0.2, ease: 'out' },
    // 哈啾！她彈起來，一小塊蘋果像子彈一樣噴出去
    { at: ACHOO, actor: 'sw', do: 'swap', emoji: 'prop:snowwhite-sneeze' },
    { at: ACHOO, actor: 'sw', do: 'squash', amount: 0.25, dur: 0.22 },
    { at: ACHOO, actor: 'feather', do: 'vanish', dur: 0.1 },
    { at: ACHOO, actor: 'bird', do: 'moveTo', to: { x: 126, y: BG }, arc: 6, dur: 0.3, ease: 'out' },
    { at: ACHOO, actor: 'bird', do: 'tilt', amount: 20, dur: 0.3 },
    { at: ACHOO, actor: 'chunk', do: 'pop', dur: 0.04 },
    { at: ACHOO + 0.02, actor: 'chunk', do: 'moveTo', to: BUTT, dur: HIT - ACHOO - 0.02, ease: 'linear' },
    { at: ACHOO + 0.02, actor: 'chunk', do: 'rotateTo', amount: -540, dur: HIT - ACHOO - 0.02 },
    // 正中大象屁股：跳起來，轉回來看
    { at: HIT, actor: 'chunk', do: 'vanish', dur: 0.05 },
    { at: HIT, actor: 'ele', do: 'stretchTo', amount: 1 / 1.1, dur: 0.05 },
    { at: HIT, actor: 'ele', do: 'hop', amount: 12, dur: 0.45 },
    { at: HIT, actor: 'ele', do: 'shake', amount: 1, dur: 0.35 },
    { at: HIT + 0.45, actor: 'ele', do: 'flip' },
    { at: YAWN + 0.05, actor: 'ele', do: 'moveTo', to: { x: 64, y: EG }, dur: 0.4, ease: 'out' },
    // 她醒了：伸一個大懶腰打呵欠
    { at: YAWN, actor: 'sw', do: 'swap', emoji: 'prop:snowwhite-yawn' },
    { at: YAWN + 0.05, actor: 'sw', do: 'squash', amount: -0.1, dur: 0.4 },
    // 看到大家，開心跳起來；動物們圍著歡呼
    { at: HAPPY, actor: 'sw', do: 'swap', emoji: 'prop:snowwhite-happy' },
    { at: HAPPY, actor: 'sw', do: 'hop', amount: 7, dur: 0.4 },
    { at: HAPPY + 0.5, actor: 'sw', do: 'hop', amount: 3, dur: 0.3 },
    { at: HAPPY - 0.1, actor: 'ele', do: 'swap', emoji: 'prop:elephant-laugh' },
    { at: HAPPY - 0.1, actor: 'rooster', do: 'swap', emoji: 'prop:rooster' },
    { at: HAPPY - 0.1, actor: 'rooster', do: 'flip' },
    { at: HAPPY - 0.1, actor: 'rooster', do: 'moveTo', to: { x: 136, y: RG }, dur: 0.3 },
    { at: HAPPY - 0.1, actor: 'bird', do: 'flip' },
    ...[0, 1, 2].map((i): Move => ({ at: HAPPY + 0.1 + 0.3 * i, actor: 'bird', do: 'hop', amount: 4, dur: 0.25 })),
    ...[0, 1].map((i): Move => ({ at: HAPPY + 0.25 + 0.4 * i, actor: 'rooster', do: 'hop', amount: 3, dur: 0.3 })),
    ...[0, 1].map((i): Move => ({ at: HAPPY + 0.2 + 0.4 * i, actor: 'ele', do: 'squash', amount: 0.08, dur: 0.25 })),
  ],
  fx: [
    { at: 0.1, kind: 'burst', actor: 'apple', emoji: '✨', n: 5, dy: 3, dur: 0.5, scale: 0.7 },
    // 盯著蘋果流口水
    { at: SEE + 0.15, kind: 'burst', x: 112, y: 52, emoji: '💦', n: 2, dur: 0.35, scale: 0.4 },
    { at: BITE + 0.02, kind: 'burst', x: 112, y: 46, emoji: '✨', n: 3, dur: 0.35, scale: 0.5 },
    { at: SLEEP, kind: 'puff', actor: 'sw', n: 6, dur: 0.45 },
    // 一直打呼
    { at: SLEEP + 0.15, kind: 'zzz', x: face(SX).x + 4, y: face(SX).y - 7, dur: P3 - SLEEP - 0.15 },
    { at: ROLL + 0.4, kind: 'zzz', x: face(SX).x + 6, y: face(SX).y - 9, dur: P3 - ROLL - 0.4, scale: 1.5 },
    { at: CALM, kind: 'zzz', x: face(SX2).x + 6, y: face(SX2).y - 9, dur: SNIFF - CALM, scale: 1.5 },
    ...c1.fx,
    { at: BPOP, kind: 'burst', x: BX + 7, y: BG - 6, emoji: '💦', n: 4, dur: 0.35, scale: 0.6 },
    { at: BPOP + 0.05, kind: 'sweat', actor: 'bird', dur: 0.5 },
    ...c2.fx,
    { at: DUH, kind: 'sweat', actor: 'rooster', dur: 0.6 },
    // 大象一步一震
    ...[0, 1, 2].map((i): Fx => ({ at: THUMP + 0.27 * i, kind: 'puff', actor: 'ele', n: 3 + i, dur: 0.35 })),
    ...c3.fx,
    // 第二波聲波＋一陣大風（從她身體下面吹過，不蓋臉）
    ...rings(P3 + 0.3, { x: EX + 0.33 * E, y: EG + 0.12 * E }, [8, 15, 22, 27], 2.6, 0.45),
    { at: P3 + 0.05, kind: 'blow', x: EX + 0.33 * E + 4, y: 73, to: { x: 160, y: 72 }, n: 6, dur: 0.55 },
    { at: P3 + 0.15, kind: 'sweat', actor: 'rooster', dur: 0.5 },
    { at: SLUMP + 0.05, kind: 'sweat', actor: 'ele', dur: 0.6 },
    // 搔鼻子
    { at: TICKLE, kind: 'burst', x: nose(SX2).x + 3, y: nose(SX2).y - 6, emoji: '✨', n: 3, dur: 0.35, scale: 0.4 },
    // 哈啾！
    { at: ACHOO, kind: 'burst', x: MOUTH_UP.x - 13, y: MOUTH_UP.y + 5, emoji: '💥', n: 1, dur: 0.3, scale: 0.9 },
    { at: ACHOO + 0.02, kind: 'blow', x: MOUTH_UP.x - 3, y: MOUTH_UP.y + 2, to: { x: MOUTH_UP.x - 30, y: MOUTH_UP.y + 6 }, n: 4, dur: 0.4 },
    { at: HIT, kind: 'burst', x: BUTT.x + 2, y: BUTT.y, emoji: '💥', n: 1, dur: 0.4, scale: 1.4 },
    { at: HIT + 0.05, kind: 'sweat', actor: 'ele', dur: 0.6 },
    // 亮相
    { at: HAPPY, kind: 'burst', x: SX2, y: 22, emoji: '✨', n: 8, dur: 0.8, scale: 1.1 },
    { at: HAPPY + 0.3, kind: 'burst', x: SX2 + 4, y: 20, emoji: '🎉', n: 7, dur: 0.9, scale: 1.1 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.5, to: aim({ x: 106, y: 52 }, 1.5) },
    // 睡著：推近她的臉，頭邊留給叫她的動物
    { at: SLEEP, dur: 0.25, do: 'shake', amount: 0.5 },
    { at: SLEEP - 0.05, dur: 0.4, do: 'zoom', amount: 2, to: aim({ x: 87, y: 61 }, 2) },
    ...c1.camera,
    { at: R_IN, dur: 0.4, do: 'zoom', amount: 1.7, to: aim({ x: 84, y: 58 }, 1.7) },
    ...c2.camera,
    // 停一拍：退到全景放得下大象，一步一震
    { at: E_IN, dur: 0.4, do: 'zoom', amount: 1.2, to: aim({ x: 84, y: 52 }, 1.2) },
    ...[0, 1, 2].map((i): Camera => ({ at: THUMP + 0.27 * i, dur: 0.15, do: 'shake', amount: 0.4 + 0.25 * i })),
    ...c3.camera,
    { at: P3 + 0.3, dur: 0.5, do: 'shake', amount: 1.2 },
    // 反轉：推近她的鼻子
    { at: SLUMP + 0.1, dur: 0.45, do: 'zoom', amount: 1.75, to: aim({ x: SX2 - 2, y: 58 }, 1.75) },
    { at: SNIFF, dur: 0.66, do: 'zoom', amount: 1.95, to: aim({ x: SX2 - 4, y: 59 }, 1.95) },
    // 哈啾：退開看蘋果塊飛去打大象
    { at: ACHOO - 0.02, dur: 0.12, do: 'zoom', amount: 1.3, to: aim({ x: 82, y: 52 }, 1.3) },
    { at: ACHOO, dur: 0.3, do: 'punch', amount: 0.1, to: MOUTH_UP },
    { at: ACHOO, dur: 0.35, do: 'shake', amount: 1.3 },
    { at: HIT, dur: 0.3, do: 'shake', amount: 0.9 },
    // 亮相
    { at: YAWN + 0.1, dur: 0.5, do: 'zoom', amount: 1.6, to: aim({ x: SX2 + 2, y: 50 }, 1.6) },
  ],
  lights: [
    { at: ACHOO, dur: 0.05, level: -0.3 },
    { at: ACHOO + 0.05, dur: 0.3, level: 0 },
    { at: HAPPY, dur: 0.05, level: -0.3 },
    { at: HAPPY + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: IN + 0.02, sfx: 'boing' },
    { at: SEE, sfx: 'clink' },
    { at: BITE, sfx: 'crack' },
    { at: BITE + 0.15, sfx: 'gulp' },
    { at: BITE + 0.3, sfx: 'gulp' },
    { at: SLEEP, sfx: 'bonk' },
    { at: B_IN, sfx: 'whoosh' },
    ...c1.cues,
    { at: BUB, sfx: 'bubble' },
    { at: BPOP, sfx: 'poof' },
    ...c2.cues,
    { at: ROLL + 0.12, sfx: 'slide' },
    { at: DUH, sfx: 'boing' },
    ...[0, 1, 2].map((i): Cue => ({ at: THUMP + 0.27 * i, sfx: 'bonk' })),
    ...c3.cues,
    { at: P3 + 0.3, sfx: 'rumble' },
    { at: SMACK, sfx: 'tap' },
    { at: SMACK + 0.17, sfx: 'tap' },
    { at: SLUMP, sfx: 'deflate' },
    { at: TICKLE, sfx: 'tap' },
    { at: TICKLE + 0.17, sfx: 'tap' },
    ...[0, 1, 2].map((i): Cue => ({ at: SNIFF + 0.22 * i, sfx: 'hic' })),
    { at: ACHOO, sfx: 'achoo' },
    { at: ACHOO + 0.02, sfx: 'whoosh' },
    { at: HIT, sfx: 'bonk' },
    { at: HIT + 0.05, sfx: 'boing' },
    { at: HAPPY, sfx: 'boing' },
    { at: SAY, say: '白雪公主' },
    { at: SAY + 0.4, sfx: 'cheer' },
  ],
})
