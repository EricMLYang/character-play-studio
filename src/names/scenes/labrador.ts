// 演的是字面意思：拉（拉扯）＋布（布袋）＋拉＋多（好多），警長＝頭上頂著警燈的狗狗。狗警長抓住小偷的布袋往後拉，拉出好多東西。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { pressStack } from '../../anim/helpers'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小黑貓揹著一大袋偷來的骨頭想跑，狗警長一把抓住布袋往後拉——袋子越拉越長、「嘩啦」掉出骨頭，手一滑袋子「啵」地彈回去，
// 一次比一次拉得長、掉得多（一根 → 三根 → 一大堆）。同一個動作（貓要跑、警長撲上去抓、往後拉、骨頭掉出來、跌坐）、同一串音效做三次；
// 第三次前停一拍：布袋被拉得好長好長，兩邊都在抖。回馬槍：第三次袋子倒空了、彈回去的力氣太大，翻過去「噗」一聲把小偷整隻套進袋子裡，
// 只剩頭露在袋口。警長爬起來，警燈閃閃、敬禮：「拉布拉多警長」。
const S = 36 // 狗警長的 size
const DY = 77 - 0.42 * S // 站在地上的 y
const DX = 52 // 狗警長平常站的地方
const GRAB = 68 // 撲上去抓布袋的地方
const SIREN = 11 // 警燈的 size
const C = 26 // 小黑貓的 size
const CY = 77 - 0.42 * C
const CX = 104 // 小黑貓每次要跑的起點
const RUN = 6 // 貓往前衝多遠（衝不動）
const BAG = 24 // 布袋的 size
const BDX = -7 // 布袋揹在貓背上（貓朝右，背在左邊）
const BDY = -13
const BAG_HALF = 0.37 * BAG // 布袋圖的半寬
const BONE = 15
const BY = 77 - 0.42 * BONE
const BIG = 32 // 套住貓以後的布袋

/** 警長每個姿勢的帽頂（圖朝左時，帽頂中心離圖中線幾 px、離圖頂幾 px，512 的圖） */
const HEAD: Record<string, [number, number]> = {
  idle: [-10, 21], dash: [-35, 44], pull: [53, 41], fall: [-1, 22], surprised: [-7, 21], salute: [1, 21], happy: [6, 26], angry: [-9, 21],
}
/** 警長站在 (x, y)、擺 pose 時，警燈該在哪（整支都朝右，所以左右鏡射） */
const head = (pose: string, x: number, y: number) => {
  const [hx, top] = HEAD[pose]
  return { x: x - (hx / 512) * S, y: y - S / 2 + (top / 512) * S - SIREN * 0.36 }
}

// 警長的動作一律從 dog() 寫、照時間順序：警燈跟著頭（換姿勢時頭的位置會變，警燈一起換位置）
const D: Move[] = []
let dPose = 'dash'
let dPos = { x: -24, y: DY }
type DogStep = { pose?: string; to?: { x: number; y: number }; dur?: number; ease?: Move['ease']; arc?: number; anticipate?: number }
function dog(at: number, s: DogStep) {
  if (s.pose && s.pose !== dPose) { D.push({ at, actor: 'dog', do: 'swap', emoji: `hero:sheriff/${s.pose}` }); dPose = s.pose }
  const dur = s.to ? (s.dur ?? 0.3) : 0.05
  if (s.to) { D.push({ at, actor: 'dog', do: 'moveTo', to: s.to, dur, ease: s.ease, arc: s.arc, anticipate: s.anticipate }); dPos = s.to }
  D.push({ at, actor: 'siren', do: 'moveTo', to: head(dPose, dPos.x, dPos.y), dur, ease: s.ease, arc: s.arc, anticipate: s.anticipate })
}
/** 警長跳一下／抖一下，警燈照抄 */
const dogAlso = (m: Move): Move[] => [m, { ...m, actor: 'siren' }]

/** 小黑貓走到 x，布袋揹在背上一起走 */
const cat = (at: number, x: number, dur: number, ease?: Move['ease']): Move[] => [
  { at, actor: 'cat', do: 'moveTo', to: { x, y: CY }, dur, ease },
  { at, actor: 'bag', do: 'moveTo', to: { x: x + BDX, y: CY + BDY }, dur, ease },
]

// 骨頭堆在兩個人中間：一根 → 再三根 → 再五根（數得出越來越多）
const r1 = BY, r2 = BY - 5, r3 = BY - 10
const PILE = [
  { x: 82, y: r1 },
  { x: 71, y: r1 }, { x: 93, y: r1 }, { x: 77, y: r2 },
  // 第三次的落在袋子那一邊、只疊兩層：亮相時警長和小偷中間不要堆太滿
  { x: 104, y: r1 }, { x: 115, y: r1 }, { x: 99, y: r2 }, { x: 110, y: r2 }, { x: 121, y: r1 },
]
const WAVE = [[0], [1, 2, 3], [4, 5, 6, 7, 8]]

/**
 * 主軸笑點：貓蹲一下要跑 → 警長撲上去抓住布袋 → 往後拉、袋子越拉越長、兩邊都在抖 → 嘩啦掉出骨頭、手一滑、警長一屁股跌坐傻眼。
 * y 是嘩啦那一刻；k 是第幾次（0、1、2），越後面拉得越長、掉得越多；pull 是拉多久（第三次停一拍拉得最久）。
 * 前兩次袋子啵地彈回貓背上；第三次（回馬槍）袋子另外寫。
 */
function yank(y: number, k: number, pull: number) {
  const g = y - pull // 抓到布袋那一刻
  const long = [1.4, 1.8, 2.4][k]
  const sc = [1.1, 1.2, 1.3][k]
  const backUp = [4, 8, 14][k] // 一次比一次退得遠，袋子往他那邊越拉越長
  const moves: Move[] = []
  // 貓蹲一下、往前衝
  moves.push({ at: g - 0.5, actor: 'cat', do: 'squash', amount: -0.15, dur: 0.15 })
  moves.push(...cat(g - 0.35, CX + RUN, 0.35, 'in'))
  // 警長撲上去抓住
  dog(g - 0.35, { pose: 'dash', to: { x: GRAB, y: DY }, dur: 0.3, ease: 'in', anticipate: 3 })
  dog(g, { pose: 'pull' })
  // 往後拉：警長往後退一點，布袋往警長那邊越拉越長（左邊一直在他手上）
  const pd = pull - 0.05
  dog(g + 0.05, { to: { x: GRAB - backUp, y: DY }, dur: pd, ease: 'out' })
  const paw = GRAB - backUp + 5
  moves.push(
    { at: g + 0.05, actor: 'bag', do: 'stretchTo', amount: long, dur: pd, ease: 'out' },
    { at: g + 0.05, actor: 'bag', do: 'scaleTo', amount: sc, dur: pd, ease: 'out' },
    { at: g + 0.05, actor: 'bag', do: 'moveTo', to: { x: paw + BAG_HALF * long * sc, y: CY + BDY + 1 }, dur: pd, ease: 'out' },
    { at: g + 0.05, actor: 'cat', do: 'shake', amount: 0.5 + 0.3 * k, dur: pd },
    { at: g + 0.05, actor: 'bag', do: 'shake', amount: 0.3 + 0.3 * k, dur: pd },
    ...dogAlso({ at: g + 0.05, actor: 'dog', do: 'shake', amount: 0.4 + 0.3 * k, dur: pd }),
  )
  // 嘩啦！骨頭從袋口掉出來，落在兩個人中間
  for (const [i, b] of WAVE[k].entries()) {
    const id = `b${b}`
    const t = y + 0.07 * i
    moves.push(
      { at: t - 0.01, actor: id, do: 'moveTo', to: { x: paw + BAG_HALF * long * sc, y: CY + BDY - 6 }, dur: 0.01 },
      { at: t, actor: id, do: 'pop', dur: 0.1 },
      { at: t, actor: id, do: 'moveTo', to: PILE[b], arc: 12, dur: 0.4, ease: 'in' },
    )
  }
  // 手一滑：警長一屁股跌坐、傻眼
  dog(y + 0.05, { pose: 'fall', to: { x: GRAB - backUp - 3, y: DY }, dur: 0.2, ease: 'out' })
  moves.push(...pressStack(y + 0.25, 0.25, 0.2, S, ['siren']), { at: y + 0.25, actor: 'dog', do: 'squash', amount: 0.2, dur: 0.25 })
  if (k < 2) {
    // 袋子啵地彈回貓背上，貓往前踉蹌
    moves.push(
      { at: y + 0.05, actor: 'bag', do: 'stretchTo', amount: 1 / long, dur: 0.35, ease: 'elastic' },
      { at: y + 0.05, actor: 'bag', do: 'scaleTo', amount: 1 / sc, dur: 0.2 },
      ...cat(y + 0.05, CX + RUN + 6, 0.2, 'out'),
    )
  }
  const fx: Fx[] = [
    { at: y, kind: 'burst', x: paw + 2 * BAG_HALF * long * sc - 4, y: CY + BDY - 8, emoji: '💥', n: 1, dur: 0.35, scale: 1 + 0.3 * k },
    { at: y + 0.3, kind: 'puff', actor: 'dog', n: 5 + 2 * k, dur: 0.5 },
  ]
  if (k >= 1) fx.push({ at: g + 0.2, kind: 'sweat', actor: 'dog', dur: pull })
  const camera: Camera[] = [
    { at: y, dur: 0.45, do: 'punch', amount: 0.05 + 0.04 * k, to: { x: 80, y: 58 } },
    { at: y, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  // 同一串音效：抓（tap）→ 拉長（slide）→ 嘩啦（clink，越後面疊越多）
  const cues: Cue[] = [{ at: g, sfx: 'tap' }, { at: g + 0.1, sfx: 'slide' }, { at: y, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: y + 0.15, sfx: 'clink' })
  if (k >= 2) cues.push({ at: y + 0.3, sfx: 'clink' })
  if (k < 2) cues.push({ at: y + 0.1, sfx: 'boing' })
  return { moves, fx, camera, cues, end: y + 0.75 }
}

const Y1 = 1.85, Y2 = 3.85, Y3 = 6.5
// 回馬槍：第三次袋子倒空了，彈回去的力氣太大——翻過去把小黑貓整隻套進去
const SWAL = Y3 + 0.15
const FLY = SWAL + 0.12
const IN = FLY + 0.4
const CAT3 = CX + RUN + 0 // 第三次貓站的地方（袋子從頭上套下來）
const SACK_DX = 2 // 套下來時袋子蓋住整個頭，只露出腳和尾巴
const SACK_Y = 77 - 0.42 * BIG - 4 // 袋子底下露出四隻腳
const PEEK = IN + 0.75 // 停一拍（腳在袋子底下亂踢）以後，頭從袋口冒出來
// 從袋口冒出來的頭：🐈‍⬛ 的臉太小看不清楚，改用 🙀 染成同一個深紫色（白眼睛留著），傻眼雙手捧臉
const FACE = 19
const FACE_Y = SACK_Y - 19
const FACE_TINT = 'hue-rotate(225deg) saturate(2.2) brightness(0.62) contrast(1.6)'
/** 裝在袋子裡的貓跟袋子一起跳一下 */
const sackHop = (at: number): Move[] => [
  { at, actor: 'face', do: 'hop', amount: 3, dur: 0.3 },
  { at, actor: 'sack', do: 'hop', amount: 3, dur: 0.3 },
]
const POSE = 8.4

// 開場：小黑貓揹著布袋偷偷溜，警長亮著警燈衝進來
dog(0, { pose: 'dash', to: { x: DX, y: DY }, dur: 0.5, ease: 'out' })
dog(0.6, { pose: 'surprised' })
const y1 = yank(Y1, 0, 0.45)
// 每次跌坐完爬起來、站回原位
dog(y1.end, { pose: 'idle', to: { x: DX, y: DY }, dur: 0.3 })
const y2 = yank(Y2, 1, 0.6)
dog(y2.end, { pose: 'angry', to: { x: DX, y: DY }, dur: 0.3 })
const y3 = yank(Y3, 2, 1.3)
// 回馬槍之後：傻眼看著袋子，爬起來、敬禮
dog(IN + 0.4, { pose: 'surprised' })
dog(IN + 1.0, { pose: 'idle', to: { x: 60, y: DY }, dur: 0.35 })
dog(POSE, { pose: 'salute' })
// 換成敬禮那一下自己寫壓扁（警燈一起沉），引擎就不會另外加一個警燈跟不上的彈跳
const salute: Move[] = [{ at: POSE, actor: 'dog', do: 'squash', amount: 0.12, dur: 0.25 }, ...pressStack(POSE, 0.25, 0.12, S, ['siren'])]

export default scene({
  duration: 10.6,
  bg: { top: '#2E3577', bottom: '#EBA98E', floor: '#7DB862', scenery: 'night' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 150, y: 59, size: 40 },
    { id: 'bush', emoji: '🌳', x: 10, y: 63, size: 30 },
    ...PILE.map((_, i) => ({ id: `b${i}`, emoji: 'prop:bone', x: 90, y: 50, size: BONE, hidden: true })),
    // 布袋揹在背後（畫在貓後面）；套住貓的那一個畫在貓前面
    { id: 'bag', emoji: '💰', x: CX - 24 + BDX, y: CY + BDY, size: BAG, float: true },
    { id: 'cat', emoji: '🐈‍⬛', x: CX - 24, y: CY, size: C, flip: true },
    { id: 'face', emoji: '🙀', x: 112, y: 40, size: FACE, tint: FACE_TINT, hidden: true },
    { id: 'sack', emoji: '💰', x: 86, y: CY + BDY, size: BAG, float: true, pivot: 'center', hidden: true },
    { id: 'dog', emoji: 'hero:sheriff/dash', x: -24, y: DY, size: S, flip: true },
    { id: 'siren', emoji: '🚨', ...head('dash', -24, DY), size: SIREN, float: true },
  ],
  moves: [
    ...D,
    // 開場：貓揹著布袋溜進來，看到警燈嚇一跳
    ...cat(0.05, CX, 0.6, 'out'),
    { at: 0.1, actor: 'siren', do: 'flash', dur: 0.8 },
    { at: 0.75, actor: 'cat', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.75, actor: 'bag', do: 'hop', amount: 4, dur: 0.3 },
    ...y1.moves,
    ...cat(y1.end, CX, 0.3),
    ...y2.moves,
    ...cat(y2.end, CX, 0.3),
    // 第三次：停一拍拉得好長好長，嘩啦一大堆
    ...y3.moves,
    // 回馬槍：空袋子縮回來、翻一圈飛過去，從頭上把貓整隻套住，只剩四隻腳在外面
    { at: SWAL, actor: 'bag', do: 'stretchTo', amount: 1 / 2.4, dur: 0.12 },
    { at: SWAL, actor: 'bag', do: 'scaleTo', amount: 1 / 1.3, dur: 0.12 },
    { at: FLY - 0.01, actor: 'sack', do: 'moveTo', to: { x: 86, y: CY + BDY + 1 }, dur: 0.01 },
    { at: FLY, actor: 'bag', do: 'vanish', dur: 0.01 },
    { at: FLY, actor: 'sack', do: 'pop', dur: 0.01 },
    { at: FLY, actor: 'sack', do: 'moveTo', to: { x: CAT3 + SACK_DX, y: SACK_Y }, arc: 22, dur: 0.4, ease: 'inOut' },
    { at: FLY, actor: 'sack', do: 'scaleTo', amount: BIG / BAG, dur: 0.4 },
    { at: FLY, actor: 'sack', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
    { at: IN, actor: 'sack', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: IN, actor: 'cat', do: 'squash', amount: 0.2, dur: 0.3 },
    // 套著袋子看不到路，四隻腳亂走：往左撞一下、往右撞一下
    // 停一拍：整隻被套住，只剩腳在底下亂踢、袋子一直抖
    { at: IN + 0.3, actor: 'sack', do: 'shake', amount: 1.2, dur: PEEK - IN - 0.35 },
    { at: IN + 0.3, actor: 'cat', do: 'shake', amount: 1.2, dur: PEEK - IN - 0.35 },
    // 噗！頭從袋口鑽出來，一臉暈：小偷被自己的袋子裝起來了
    { at: PEEK, actor: 'cat', do: 'vanish', dur: 0.05 },
    { at: PEEK - 0.01, actor: 'face', do: 'moveTo', to: { x: CAT3 + SACK_DX, y: FACE_Y + 9 }, dur: 0.01 },
    { at: PEEK, actor: 'face', do: 'pop', dur: 0.05 },
    { at: PEEK, actor: 'face', do: 'moveTo', to: { x: CAT3 + SACK_DX, y: FACE_Y }, dur: 0.25, ease: 'back' },
    { at: PEEK, actor: 'sack', do: 'squash', amount: -0.12, dur: 0.25 },
    ...salute,
    ...sackHop(POSE + 0.55),
    ...sackHop(POSE + 1.15),
    // 亮相：警燈閃
    { at: POSE, actor: 'siren', do: 'flash', dur: 0.6 },
    { at: POSE + 0.6, actor: 'siren', do: 'flash', dur: 0.6 },
    { at: POSE + 1.2, actor: 'siren', do: 'flash', dur: 0.6 },
  ],
  fx: [
    ...y1.fx,
    ...y2.fx,
    ...y3.fx,
    { at: Y3 + 0.02, kind: 'fountain', x: 90, y: CY + BDY - 4, emoji: 'prop:bone', n: 7, dur: 0.8, scale: 1.5 },
    { at: IN, kind: 'puff', actor: 'sack', n: 8, dur: 0.5 },
    { at: PEEK + 0.25, kind: 'dizzy', actor: 'face', dur: 2.6 },
    { at: POSE, kind: 'burst', actor: 'dog', emoji: '✨', n: 8, dur: 0.9, scale: 1.4, dy: -18 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.35, to: { x: 82, y: 52 } },
    ...y1.camera,
    ...y2.camera,
    // 第三次前停一拍：慢慢推近
    { at: Y3 - 1.2, dur: 1.1, do: 'zoom', amount: 1.5, to: { x: 82, y: 54 } },
    ...y3.camera,
    { at: Y3 + 0.3, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 86, y: 52 } },
    { at: POSE - 0.2, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 86, y: 52 } },
  ],
  lights: [
    { at: IN, dur: 0.05, level: -0.25 },
    { at: IN + 0.05, dur: 0.3, level: 0 },
    { at: POSE, dur: 0.05, level: -0.25 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'blip' },
    { at: 0.35, sfx: 'blip' },
    { at: 0.75, sfx: 'whoosh' },
    ...y1.cues,
    ...y2.cues,
    ...y3.cues,
    { at: SWAL, sfx: 'whoosh' },
    { at: IN, sfx: 'poof' },
    { at: IN + 0.35, sfx: 'tap' },
    { at: IN + 0.55, sfx: 'tap' },
    { at: PEEK, sfx: 'boing' },
    { at: POSE, sfx: 'blip' },
    { at: POSE + 0.15, say: '拉布拉多警長' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
