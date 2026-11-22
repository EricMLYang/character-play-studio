// 演的是字面意思：巧（手很巧、很巧妙）＋虎（一隻真的大老虎）——大老虎想用大爪子輕輕拿起小小的蛋，一碰就破；最後想出巧妙的辦法，用尾巴尖把蛋送進鳥窩（老虎不穿衣服、不站著，就是一隻四腳的老虎）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：大老虎想輕輕拿起小雞推過來的蛋，大爪子一碰——啪，蛋就破了，蛋黃一次比一次噴得慘。
// 同一個動作（小雞啄一下籃子、蛋滾到老虎面前 → 老虎憋氣、往前探身伸爪 → 啪）、同一聲「喀—啪」，做三次：
// 蛋黃濺到鼻子 → 糊了半張臉、蛋殼掛在耳朵上 → 第三次前停一拍：他慢到發抖，小雞嚇得轉過頭不敢看——還是啪，
// 噴得滿頭滿臉、蛋殼像帽子扣在頭上，他張大嘴哇哇叫。
// 反轉：最後一顆他不用爪子了。甩掉蛋黃、轉過身，用尾巴尖輕輕把蛋勾起來，一甩——蛋慢慢飛過他的頭，穩穩落進鳥窩。
// 喀……小雞孵出來了。老虎得意地挺胸：「巧虎」。
// 卡司：老虎（prop:tiger 三張當三個表情：平常、張大嘴、嚇到）＋小雞 🐤；道具：蛋（prop:egg 染白）、🧺、🪹。

// ── 站位 ──
const S = 38 // 老虎的 size
const TY = 77 - 0.42 * S
const TX = 64 // 老虎站的地方（面向右）
const LEAN = [4, 4, 5] // 伸爪時往前探多少（第幾次）
const TX2 = 70 // 反轉：轉身（面向左）後站的地方，尾巴尖剛好在蛋上面
// 臉上的點（老虎站在 TX、面向右時，量過）：嚇到（scared）、張大嘴（roar）
const SCARED = { nose: { x: TX + 10.5, y: 66 }, cheek: { x: TX + 14.5, y: 67.5 }, brow: { x: TX + 7, y: 58.5 }, ear: { x: TX + 11, y: 61 } }
const ROAR = { nose: { x: TX + 7.5, y: 56.5 }, cheek: { x: TX + 12.5, y: 62 }, brow: { x: TX + 1.5, y: 54.5 }, top: { x: TX + 3, y: 55 } }
const TAIL = { x: TX2 + 11.5, y: 53 } // 轉身後尾巴尖頂著蛋的地方（蛋的 y）
const ES = 9 // 蛋的 size
const EY = 77 - 0.42 * ES
const SPOT = 82 // 蛋每次都滾到這裡（老虎前腳前面）
const BASKET = { x: 103, y: 77 - 0.42 * 13 }
const CHICK = { x: 115, y: 77 - 0.42 * 13 } // 小雞要比老虎小很多（老虎的圖留白多，size 38 畫出來只比 size 18 的 emoji 大一點）
const NEST = { x: 34, y: 77 - 0.42 * 24 }
const IN_NEST = { x: 34, y: 58 } // 蛋落進鳥窩
const EGG = 'grayscale(1) brightness(1.75) contrast(0.95)' // 白色的蛋
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const r1 = (t: number) => Math.round(t * 100) / 100

/** 小雞啄一下籃子，蛋從籃子裡滾出來、停在老虎面前（每一次都一樣）。R＝開始啄 */
function roll(R: number, ids: string[]): Move[] {
  return [
    { at: R, actor: 'chick', do: 'squash', amount: -0.15, dur: 0.12 },
    { at: R + 0.1, actor: 'chick', do: 'tilt', amount: 20, dur: 0.25 },
    { at: R + 0.15, actor: 'basket', do: 'squash', amount: 0.15, dur: 0.2 },
    ...ids.flatMap((id): Move[] => [
      { at: R + 0.15, actor: id, do: 'pop', dur: 0.1 },
      { at: R + 0.2, actor: id, do: 'moveTo', to: { x: SPOT, y: EY }, arc: 5, dur: 0.45, ease: 'out' },
    ]),
  ]
}

/**
 * 主軸：老虎憋氣、往前探身伸爪輕輕一碰 → 喀—啪，蛋破掉，蛋黃噴到臉上。k 是第幾次（0、1、2），越後面噴得越慘。
 * R＝小雞開始啄籃子；reach＝伸爪要多久（第三次慢到發抖）。回傳 hit＝破掉那一刻、end＝傻眼停完。
 */
function smash(R: number, k: number, reach: number) {
  const e = `e${k}`
  const go = R + 0.75 // 開始伸爪
  const hit = r1(go + reach)
  const hold = [0.55, 0.7, 0.85][k]
  const moves: Move[] = [
    ...roll(R, [`${e}t`, `${e}b`]),
    // 憋氣（身體拉長一下），往前探身、伸爪
    { at: R + 0.45, actor: 'tiger', do: 'squash', amount: -0.1, dur: 0.3 },
    { at: go, actor: 'tiger', do: 'moveTo', to: { x: TX + LEAN[k], y: TY }, dur: reach, ease: 'out' },
    { at: go, actor: 'tiger', do: 'tilt', amount: k >= 2 ? -11 : -9, dur: reach + 0.05 },
    // 啪！蛋殼上半截彈飛、下半截壓扁；老虎嚇得往後縮
    { at: hit, actor: `${e}b`, do: 'stretchTo', amount: 1.5, dur: 0.12, ease: 'out' },
    { at: hit, actor: 'tiger', do: 'swap', emoji: k >= 2 ? 'prop:tiger-roar' : 'prop:tiger-scared' },
    { at: hit, actor: 'tiger', do: 'moveTo', to: { x: TX, y: TY }, dur: 0.15, ease: 'out' },
    { at: hit + 0.05, actor: 'tiger', do: 'shake', amount: 0.4 + 0.3 * k, dur: hold - 0.1 },
  ]
  // 第三次：慢到發抖
  if (k >= 2) moves.push({ at: go + 0.2, actor: 'tiger', do: 'shake', amount: 0.35, dur: reach - 0.25 }, { at: hit + 0.05, actor: 'tiger', do: 'hop', amount: 3, dur: 0.3 })
  // 蛋殼上半截：第一次掉在地上、第二次掛在耳朵上、第三次扣在頭上像帽子
  const cap = [{ x: SPOT + 9, y: EY - 0.5 }, SCARED.ear, ROAR.top][k]
  moves.push(
    { at: hit, actor: `${e}t`, do: 'moveTo', to: cap, arc: 8 + 3 * k, dur: 0.3, ease: 'out' },
    { at: hit, actor: `${e}t`, do: 'spin', times: k === 0 ? 2 : 1, dur: 0.3 },
  )
  // 蛋黃黏在臉上：一次比一次多、比一次大
  const face = k >= 2 ? ROAR : SCARED
  const spots = [[face.nose], [face.nose, face.cheek], [face.nose, face.cheek, face.brow]][k]
  spots.forEach((p, i) => {
    const id = `y${i + 1}`
    moves.push(
      { at: hit, actor: id, do: 'moveTo', to: p, dur: 0.01 },
      { at: hit + 0.04 + 0.04 * i, actor: id, do: 'pop', dur: 0.15 },
    )
    if (k >= 2) moves.push({ at: hit + 0.04 + 0.04 * i, actor: id, do: 'scaleTo', amount: 1.15, dur: 0.15, ease: 'back' })
  })
  const fx: Fx[] = [
    { at: hit, kind: 'burst', x: SPOT, y: EY - 3, emoji: '🟡', n: 4 + 3 * k, dur: 0.45 + 0.1 * k, scale: 0.7 + 0.25 * k },
    { at: hit, kind: 'burst', x: SPOT, y: EY - 3, n: 1, dur: 0.3, scale: 0.9 + 0.3 * k },
  ]
  if (k >= 1) fx.push({ at: hit + 0.15, kind: 'sweat', actor: 'tiger', dur: hold })
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.06 + 0.04 * k, to: { x: TX + 22, y: 60 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  // 同一聲「喀—啪」，一次比一次多疊一個
  const cues: Cue[] = [{ at: R + 0.1, sfx: 'tap' }, { at: R + 0.25, sfx: 'slide' }, { at: hit, sfx: 'crack' }, { at: hit + 0.05, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: hit + 0.1, sfx: 'plop' })
  if (k >= 2) cues.push({ at: hit + 0.15, sfx: 'bonk' })
  return { moves, fx, camera, cues, hit, end: r1(hit + hold) }
}

/** 甩頭把蛋黃甩掉、換回平常的臉，破蛋收掉（下一顆蛋前） */
function shakeOff(at: number, k: number) {
  const gone = [...['y1', 'y2', 'y3'].slice(0, k + 1), `e${k}t`, `e${k}b`]
  const moves: Move[] = [
    { at, actor: 'tiger', do: 'swap', emoji: 'prop:tiger' },
    { at, actor: 'tiger', do: 'shake', amount: 1.6, dur: 0.3 },
    ...gone.map((id): Move => ({ at: at + 0.1, actor: id, do: 'vanish', dur: 0.15 })),
  ]
  const fx: Fx[] = [{ at: at + 0.1, kind: 'burst', x: TX + 8, y: 56, emoji: '💦', n: 5 + 2 * k, dur: 0.4 }]
  const cues: Cue[] = [{ at, sfx: 'whoosh' }]
  return { moves, fx, cues, next: r1(at + 0.3) }
}

// ── 時間表 ──
const s1 = smash(0.25, 0, 0.35)
const o1 = shakeOff(s1.end, 0)
const s2 = smash(o1.next, 1, 0.35)
const o2 = shakeOff(s2.end, 1)
const s3 = smash(o2.next, 2, 1.0) // 第三次：慢到發抖（停一拍）
const o3 = shakeOff(s3.end, 2)
// 反轉：轉身，尾巴對著蛋；小雞推來最後一顆，尾巴尖輕輕勾起來、一甩，蛋慢慢飛進鳥窩
const TURN = o3.next
const R4 = r1(TURN + 0.1)
const SCOOP = r1(R4 + 0.8)
const FLICK = r1(SCOOP + 0.55)
const NESTED = r1(FLICK + 0.85)
const HATCH = r1(NESTED + 0.45)
const POSE = r1(HATCH + 0.35)
const END = Math.round((POSE + 1.35) * 10) / 10

export default scene({
  duration: END,
  bg: { top: '#7FCFC3', bottom: '#D8F0DA', floor: '#5F9A4E', scenery: 'forest' },
  actors: [
    { id: 'nest', emoji: '🪹', x: NEST.x, y: NEST.y, size: 24 },
    { id: 'baby', emoji: '🐣', x: IN_NEST.x, y: IN_NEST.y + 3, size: 15, hidden: true },
    { id: 'basket', emoji: '🧺', x: BASKET.x, y: BASKET.y, size: 13 },
    { id: 'chick', emoji: '🐤', x: CHICK.x, y: CHICK.y, size: 13 },
    ...[0, 1, 2].flatMap((k) => [
      { id: `e${k}b`, emoji: 'prop:egg', x: BASKET.x, y: 66, size: ES, half: 'bottom' as const, cut: 0.48, tint: EGG, hidden: true },
      { id: `e${k}t`, emoji: 'prop:egg', x: BASKET.x, y: 66, size: ES, half: 'top' as const, cut: 0.48, tint: EGG, hidden: true, pivot: 'center' as const },
    ]),
    { id: 'tiger', emoji: 'prop:tiger', x: TX, y: TY, size: S, flip: true },
    { id: 'e3', emoji: 'prop:egg', x: BASKET.x, y: 66, size: ES, tint: EGG, hidden: true, float: true, pivot: 'center' },
    { id: 'y1', emoji: '🟡', x: 0, y: 0, size: 5, float: true, hidden: true },
    { id: 'y2', emoji: '🟡', x: 0, y: 0, size: 5.5, float: true, hidden: true },
    { id: 'y3', emoji: '🟡', x: 0, y: 0, size: 6, float: true, hidden: true },
  ],
  moves: [
    ...s1.moves,
    ...o1.moves,
    ...s2.moves,
    ...o2.moves,
    // 停一拍：小雞不敢看，轉過頭去
    { at: s3.hit - 0.9, actor: 'chick', do: 'flip' },
    { at: s3.hit - 0.9, actor: 'chick', do: 'hop', amount: 2, dur: 0.25 },
    { at: s3.hit + 0.35, actor: 'chick', do: 'flip' },
    ...s3.moves,
    ...o3.moves,
    // 反轉：轉過身（尾巴朝著蛋）
    { at: TURN, actor: 'tiger', do: 'flip' },
    { at: TURN, actor: 'tiger', do: 'moveTo', to: { x: TX2, y: TY }, dur: 0.3, ease: 'out' },
    ...roll(R4, ['e3']).map((m) => (m.do === 'moveTo' ? { ...m, to: { x: SPOT, y: EY } } : m)),
    // 尾巴尖輕輕勾起來，頂著蛋晃一晃
    { at: SCOOP, actor: 'e3', do: 'moveTo', to: TAIL, dur: 0.3, ease: 'out' },
    { at: SCOOP + 0.3, actor: 'e3', do: 'tilt', amount: 10, dur: 0.25 },
    { at: SCOOP, actor: 'tiger', do: 'squash', amount: -0.05, dur: 0.3 },
    // 一甩：蛋慢慢飛過他的頭，落進鳥窩
    { at: FLICK - 0.1, actor: 'tiger', do: 'squash', amount: 0.1, dur: 0.15 },
    { at: FLICK, actor: 'tiger', do: 'hop', amount: 2, dur: 0.25 },
    { at: FLICK, actor: 'e3', do: 'moveTo', to: IN_NEST, arc: 28, dur: NESTED - FLICK, ease: 'inOut' },
    { at: FLICK, actor: 'e3', do: 'spin', times: -1, dur: NESTED - FLICK },
    // 小雞跟過來看
    { at: FLICK + 0.1, actor: 'chick', do: 'moveTo', to: { x: 101, y: CHICK.y }, dur: 0.6 },
    { at: NESTED, actor: 'nest', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: NESTED + 0.15, actor: 'e3', do: 'shake', amount: 0.8, dur: HATCH - NESTED - 0.15 },
    // 喀——孵出來了
    { at: HATCH, actor: 'e3', do: 'vanish', dur: 0.05 },
    { at: HATCH, actor: 'baby', do: 'pop', dur: 0.3 },
    { at: HATCH + 0.05, actor: 'tiger', do: 'hop', amount: 2, dur: 0.25 },
    // 亮相：老虎得意地挺胸變大
    { at: POSE, actor: 'tiger', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: POSE + 0.1, actor: 'chick', do: 'hop', amount: 4, dur: 0.35 },
    { at: POSE + 0.2, actor: 'baby', do: 'hop', amount: 3, dur: 0.3 },
    { at: POSE + 0.6, actor: 'chick', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    ...s1.fx,
    ...o1.fx,
    ...s2.fx,
    ...o2.fx,
    { at: s3.hit - 0.95, kind: 'sweat', actor: 'tiger', dur: 0.9 },
    ...s3.fx,
    ...o3.fx,
    { at: SCOOP + 0.25, kind: 'burst', x: TAIL.x, y: TAIL.y - 3, emoji: '✨', n: 4, dur: 0.4 },
    { at: NESTED, kind: 'puff', x: IN_NEST.x, y: IN_NEST.y + 2, n: 4, dur: 0.4 },
    { at: HATCH, kind: 'burst', x: IN_NEST.x, y: IN_NEST.y - 2, emoji: '✨', n: 8, dy: -6, dur: 0.6, scale: 1.2 },
    { at: POSE, kind: 'burst', actor: 'tiger', emoji: '✨', n: 10, dy: -12, dur: 1.0, scale: 1.4 },
    { at: POSE + 0.25, kind: 'burst', actor: 'tiger', emoji: '🎉', n: 8, dy: -14, dur: 1.0, scale: 1.3 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.6, to: look(86, 57, 1.6) },
    ...s1.camera,
    ...s2.camera,
    // 停一拍：慢慢推近
    { at: s3.hit - 1.05, dur: 0.9, do: 'zoom', amount: 1.8, to: look(84, 59, 1.8) },
    ...s3.camera,
    // 反轉：拉開看到鳥窩、蛋飛過去的弧線
    { at: TURN, dur: 0.5, do: 'zoom', amount: 1.3, to: look(74, 52, 1.3) },
    { at: FLICK, dur: 0.5, do: 'zoom', amount: 1.2, to: look(66, 48, 1.2) },
    { at: NESTED, dur: 0.25, do: 'shake', amount: 0.4 },
    { at: HATCH, dur: 0.35, do: 'punch', amount: 0.06, to: { x: IN_NEST.x, y: IN_NEST.y } },
    // 亮相：推近老虎
    { at: POSE - 0.1, dur: 0.5, do: 'zoom', amount: 1.5, to: look(63, 54, 1.5) },
  ],
  lights: [
    { at: s3.hit, dur: 0.05, level: -0.25 },
    { at: s3.hit + 0.05, dur: 0.4, level: 0 },
    { at: HATCH, dur: 0.05, level: -0.25 },
    { at: HATCH + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    ...s1.cues,
    ...o1.cues,
    ...s2.cues,
    ...o2.cues,
    { at: s3.hit - 0.9, sfx: 'blip' },
    ...s3.cues,
    ...o3.cues,
    { at: R4 + 0.1, sfx: 'tap' },
    { at: R4 + 0.25, sfx: 'slide' },
    { at: SCOOP, sfx: 'boing' },
    { at: FLICK, sfx: 'whoosh' },
    { at: NESTED, sfx: 'plop' },
    { at: HATCH, sfx: 'crack' },
    { at: POSE, sfx: 'cheer' },
    { at: POSE + 0.1, say: '巧虎' },
  ],
})
