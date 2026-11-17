// 演的是字面意思：外（外面）＋星（星星）＋人——從別的星星來的人，開著飛碟在沙漠上口好渴，用光束想吸一桶水，一直吸錯。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：外星人渴得要命，用飛碟光束吸地上那桶水——水桶抖一抖不上來，吸上來砸到他臉上的都是別的東西。
// 同一個舉棒子、同一道光束、同一聲「咚」，三次只有光束越開越寬、吸上來的越來越大：
// 第一次一隻臭襪子啪在臉上、第二次一隻青蛙趴在臉上；停一拍（他把光束開到最大、旁邊的大象抬頭看）——
// 第三次吸到大象，大象太重，把飛碟整台往下拉，卡住、抖、光束斷掉，大象「碰」掉回地上，他頭昏。
// 回馬槍是第四次：他又舉棒子，這次大象搶先把水桶的水吸光、鼻子一抬「噗」順著光束噴上來——他終於喝到水了（淋成落湯雞）。
// 亮相：「外星人」。
// 他一直坐在飛碟裡：飛碟只畫下面那片盤子（cut 0.7），外星人另外一個角色擺姿勢、下半身藏在盤子後面，
// 比例照 `hero:alien/saucer` 那張（外星人的頭寬約是盤子的 0.43），所以不會有「站在地上跟飛碟一樣大」的問題。
const U = 52 // 飛碟盤子的 size
const UX = 80 // 飛碟停的地方（每次都在這裡吸）
const UY = 30 // 飛碟盤子的中心 y（角色的 y 是圖的正中間）
const A = 32 // 外星人的 size
const AY = UY - 0.9 // 外星人的中心 y：腰剛好藏在盤緣後面
/** 盤子：外星人姿勢圖裡那片飛碟的下半截 */
const PLATE = { half: 'bottom' as const, cut: 0.7 }
/** 外星人的臉：吸上來的東西都砸在這裡 */
const FACE = { x: UX - 1, y: AY + 2 }
const BUCKET = { x: UX, y: 77 - 0.42 * 16 } // 水桶（size 16），一直在光束正中間
const SOCK = { x: 64, y: 77 - 0.42 * 16 }
const FROG = { x: 101, y: 77 - 0.42 * 24 } // 青蛙（size 24，圖只佔畫布 0.72）
const E = 30 // 大象的 size
const EY = 77 - 0.42 * E
const ELE = { x: 124, y: EY }
/** 大象被吸過來、掉下來的地方：剛好站在水桶後面（elephant-suck 圖上的水桶對準 BUCKET） */
const ELE_IN = { x: BUCKET.x + 0.18 * E, y: EY }
/** 光束一次比一次寬（地上那一端的寬度） */
const WIDTH = [30, 50, 92]
/** 砸到臉以後傻眼停多久 */
const HOLD = 0.55

/** 光束從 from 照到 to：一串短的接力，開關都很乾脆（故事屋「外星人來了」的寫法） */
function beam(from: number, to: number, n: number): Fx[] {
  const out: Fx[] = []
  for (let at = from; at < to - 0.3; at += 0.4) out.push({ at: +at.toFixed(2), kind: 'beam', actor: 'ufo', n, dur: 0.55 })
  out.push({ at: +Math.max(from, to - 0.3).toFixed(2), kind: 'beam', actor: 'ufo', n, dur: 0.3 })
  return out
}

/** 飛碟跟外星人一起動（moveTo／shake），寫一次給兩個 */
function both(m: Omit<Move, 'actor'>, dy = 0): Move[] {
  const a = { ...m }
  if (m.to) a.to = { x: m.to.x, y: m.to.y + dy }
  if (m.from) a.from = { x: m.from.x, y: m.from.y + dy }
  return [{ ...m, actor: 'ufo' } as Move, { ...a, actor: 'alien' } as Move]
}

/**
 * 每一次都一樣的「開光束」：蓄力縮一下 → 舉棒子 → 光束「咻」照下來、水桶抖一抖（不上來）。p 是光束照下來那一刻。
 * k 是第幾次（0～3），光束越開越寬；off 是光束關掉的時間。
 */
function fire(p: number, k: number, off: number) {
  const moves: Move[] = [
    { at: p - 0.35, actor: 'alien', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: p - 0.15, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: p + 0.05, actor: 'bucket', do: 'shake', amount: 0.6 + 0.2 * k, dur: 0.5 },
  ]
  const fx: Fx[] = [...beam(p, off, WIDTH[Math.min(k, 2)])]
  const cues: Cue[] = [{ at: p, sfx: 'laser' }]
  const lights = [{ at: p, dur: 0.05, level: -0.12 }, { at: p + 0.05, dur: 0.25, level: 0 }]
  return { moves, fx, cues, lights }
}

/**
 * 吸上來的東西砸在臉上：傻眼、鏡頭推一下、震一下、💥，停住。k 越大推得越近、震得越大。
 */
function smack(hit: number, k: number) {
  const moves: Move[] = [
    { at: hit, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: hit, actor: 'alien', do: 'squash', amount: 0.15 + 0.08 * k, dur: 0.25 },
  ]
  const fx: Fx[] = [{ at: hit, kind: 'burst', x: FACE.x + 7, y: FACE.y - 4, n: 1, dur: 0.35, scale: 1.3 + 0.3 * k }]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: UX, y: AY + 4 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.7 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at: hit, sfx: 'bonk' }]
  return { moves, fx, camera, cues }
}

// 時間表
const P1 = 1.45, P2 = 3.25, P3 = 5.65, P4 = 8.85
const RISE = 0.55 // 從地上被吸到臉上要多久
const H1 = P1 + RISE, H2 = P2 + RISE
const OFF1 = H1 + 0.1, OFF2 = H2 + 0.1
// 第三次：大象被拉過來、往上拉一點點，飛碟被往下拉，卡住
const H3 = P3 + 0.6
const DROP = H3 + 0.7 // 光束斷掉、大象掉下去
const f1 = fire(P1, 0, OFF1), s1 = smack(H1, 0)
const f2 = fire(P2, 1, OFF2), s2 = smack(H2, 1)
const f3 = fire(P3, 2, DROP)
// 第四次：大象搶先吸水、噴上來
const SUCK = P4 - 0.75 // 他蓄力的時候，大象偷偷把水吸光
const SPRAY = P4 // 光束一照下來，大象就噴
const WET = SPRAY + 0.15 // 水噴到臉上
const f4 = fire(P4, 2, WET + 0.5)
const SINK = 6 // 第三次飛碟被往下拉多少
const LIFT = 12 // 大象被吸離地面多高（上半身卡進飛碟底下）
const END = 11.3

export default scene({
  duration: END,
  bg: { top: '#2A1B57', bottom: '#B4557A', floor: '#B9784E', scenery: 'desert' },
  actors: [
    { id: 'alien', emoji: 'hero:alien/idle', x: UX, y: AY, size: A, float: true },
    { id: 'ufo', emoji: 'hero:alien/saucer', x: UX, y: UY, size: U, float: true, ...PLATE },
    { id: 'elephant', emoji: 'prop:elephant', x: ELE.x, y: ELE.y, size: E },
    { id: 'bucket', emoji: 'prop:bucket', x: BUCKET.x, y: BUCKET.y, size: 16 },
    { id: 'frog', emoji: 'prop:frog', x: FROG.x, y: FROG.y, size: 24 },
    { id: 'sock', emoji: 'prop:sock', x: SOCK.x, y: SOCK.y, size: 16, pivot: 'center' },
  ],
  moves: [
    // 開場：飛碟從左上咻地飛進來，晃一晃停住；外星人熱得流汗、看到水桶眼睛一亮
    ...both({ at: 0, do: 'enter', from: { x: -30, y: 14 }, dur: 0.8, ease: 'back' }, -0.9),
    { at: 0.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    ...both({ at: 0.9, do: 'shake', amount: 0.4, dur: 0.3 }),

    // 第一次：一隻臭襪子被吸上來，啪在臉上
    ...f1.moves,
    { at: P1 + 0.05, actor: 'sock', do: 'moveTo', to: FACE, dur: RISE - 0.05, ease: 'in' },
    { at: P1 + 0.05, actor: 'sock', do: 'spin', times: 1, dur: RISE - 0.05 },
    ...s1.moves,
    // 甩掉：襪子掉到左邊
    { at: H1 + HOLD, actor: 'sock', do: 'moveTo', to: { x: 32, y: SOCK.y }, arc: 10, dur: 0.5, ease: 'in' },
    { at: H1 + HOLD, actor: 'sock', do: 'rotateTo', amount: -200, dur: 0.5 },
    { at: H1 + HOLD, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },

    // 第二次：光束開寬一點——一隻青蛙被吸上來，趴在臉上
    ...f2.moves,
    { at: P2 + 0.05, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: P2 + 0.05, actor: 'frog', do: 'moveTo', to: { x: FACE.x + 1, y: FACE.y + 1 }, dur: RISE - 0.05, ease: 'in' },
    { at: H2, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    ...s2.moves,
    { at: H2 + 0.1, actor: 'frog', do: 'shake', amount: 0.6, dur: HOLD - 0.15 },
    // 甩掉：青蛙跳到左邊
    { at: H2 + HOLD, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: H2 + HOLD, actor: 'frog', do: 'moveTo', to: { x: 46, y: FROG.y }, arc: 12, dur: 0.55, ease: 'in' },
    { at: H2 + HOLD + 0.55, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    { at: H2 + HOLD + 0.55, actor: 'frog', do: 'flip' },
    { at: H2 + HOLD, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },

    // 停一拍：他瞇眼盯著水桶、蓄力把光束開到最大（飛碟抖），旁邊的大象抬頭看
    { at: 4.75, actor: 'alien', do: 'squash', amount: -0.2, dur: 0.6 },
    ...both({ at: 4.85, do: 'shake', amount: 0.4, dur: 0.6 }),
    { at: 4.9, actor: 'elephant', do: 'tilt', amount: 10, dur: 0.6 },

    // 第三次：最寬的光束把大象拉過來、往上吸——太重了，飛碟整台被往下拉，卡住發抖
    ...f3.moves,
    { at: P3 + 0.05, actor: 'elephant', do: 'moveTo', to: { x: BUCKET.x + 12, y: EY - LIFT }, dur: 0.55, ease: 'in' },
    ...both({ at: P3 + 0.3, do: 'moveTo', to: { x: UX, y: UY + SINK }, dur: 0.3, ease: 'in' }, -0.9),
    { at: H3, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: H3, actor: 'elephant', do: 'shake', amount: 1, dur: DROP - H3 },
    ...both({ at: H3, do: 'shake', amount: 1.2, dur: DROP - H3 }),
    // 光束斷掉：大象碰地掉下去，飛碟彈回原位，他頭昏
    { at: DROP, actor: 'elephant', do: 'moveTo', to: ELE_IN, dur: 0.18, ease: 'in' },
    ...both({ at: DROP, do: 'moveTo', to: { x: UX, y: UY }, dur: 0.45, ease: 'back' }, -0.9),
    { at: DROP + 0.05, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: DROP + 0.2, actor: 'bucket', do: 'hop', amount: 3, dur: 0.3 },
    { at: DROP + 0.2, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
    { at: DROP + 0.2, actor: 'sock', do: 'hop', amount: 3, dur: 0.3 },

    // 回馬槍：他又舉棒子——這次大象搶先把水桶的水吸光，鼻子一抬「噗」順著光束噴上來
    ...f4.moves.filter((m) => m.actor !== 'bucket'),
    { at: SUCK, actor: 'bucket', do: 'vanish', dur: 0.01 },
    { at: SUCK, actor: 'elephant', do: 'swap', emoji: 'prop:elephant-suck' },
    { at: SUCK, actor: 'elephant', do: 'moveTo', to: { x: ELE_IN.x + 0.02 * E, y: EY }, dur: 0.01 },
    { at: SUCK + 0.1, actor: 'elephant', do: 'squash', amount: -0.08, dur: 0.25 },
    { at: SUCK + 0.4, actor: 'elephant', do: 'squash', amount: -0.08, dur: 0.25 },
    { at: SUCK - 0.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
    { at: SPRAY, actor: 'elephant', do: 'swap', emoji: 'prop:elephant-spray' },
    { at: SPRAY, actor: 'elephant', do: 'moveTo', to: { x: ELE_IN.x + 0.086 * E, y: EY }, dur: 0.01 },
    // 淋成落湯雞……然後開心得要命（終於喝到水了）
    { at: WET, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: WET, actor: 'alien', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: WET + 0.5, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: WET + 0.5, actor: 'alien', do: 'hop', amount: 3, dur: 0.35 },
    { at: WET + 0.6, actor: 'elephant', do: 'swap', emoji: 'prop:elephant-laugh' },
    { at: WET + 0.6, actor: 'elephant', do: 'moveTo', to: ELE_IN, dur: 0.01 },
    { at: WET + 0.7, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
  ],
  fx: [
    // 開場：熱得流汗
    { at: 0.5, kind: 'sweat', actor: 'alien', dur: 0.9, scale: 1.4 },
    { at: 0.9, kind: 'burst', actor: 'bucket', emoji: '✨', n: 5, dur: 0.6, scale: 1.1 },
    ...f1.fx,
    { at: P1, kind: 'stink', actor: 'sock', dur: 1.4 },
    ...s1.fx,
    ...f2.fx,
    ...s2.fx,
    // 停一拍：他汗流浹背
    { at: 4.8, kind: 'sweat', actor: 'alien', dur: 0.8 },
    ...f3.fx,
    { at: H3, kind: 'burst', x: UX - 12, y: UY + SINK + 15, n: 1, dur: 0.4, scale: 1.6 },
    { at: DROP + 0.18, kind: 'puff', actor: 'elephant', n: 12, dur: 0.6 },
    { at: DROP + 0.1, kind: 'dizzy', actor: 'alien', dur: 1.0 },
    ...f4.fx,
    // 水柱：從象鼻往上噴到他臉上
    { at: SPRAY, kind: 'line', actor: 'elephant', dx: (0.16 - 0.5) * E, dy: (0.27 - 0.5) * E, to: { x: FACE.x, y: FACE.y + 4 }, color: '#7FD3FF', width: 3.2, dur: 0.6 },
    { at: WET, kind: 'burst', x: FACE.x, y: FACE.y - 2, emoji: '💦', n: 8, dur: 0.7, scale: 1.4 },
    { at: WET + 0.5, kind: 'burst', actor: 'alien', emoji: '✨', n: 10, dur: 0.9, scale: 1.3 },
    { at: WET + 0.9, kind: 'burst', actor: 'alien', emoji: '💧', n: 6, dur: 0.9, scale: 1.2 },
  ],
  camera: [
    // 定住構圖：飛碟、光束、地上的水桶都在畫面裡
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.1, to: { x: 84, y: 45 } },
    ...s1.camera,
    ...s2.camera,
    // 停一拍時慢慢推近
    { at: 4.75, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 88, y: 46 } },
    { at: H3, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: DROP + 0.18, dur: 0.4, do: 'shake', amount: 2.2 },
    { at: DROP + 0.2, dur: 0.5, do: 'zoom', amount: 1.1, to: { x: 84, y: 45 } },
    // 大象偷吸水：推近看清楚（飛碟還在畫面上方）
    { at: SUCK - 0.1, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 84, y: 50 } },
    { at: WET, dur: 0.4, do: 'punch', amount: 0.12, to: { x: UX, y: AY + 4 } },
    // 亮相
    { at: WET + 0.5, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: UX + 4, y: 42 } },
  ],
  lights: [
    ...f1.lights,
    ...f2.lights,
    ...f3.lights,
    { at: DROP + 0.18, dur: 0.05, level: -0.3 },
    { at: DROP + 0.23, dur: 0.35, level: 0 },
    ...f4.lights,
    { at: WET + 0.5, dur: 0.05, level: -0.3 },
    { at: WET + 0.55, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 0.9, sfx: 'blip' },
    ...f1.cues,
    ...s1.cues,
    { at: H1 + HOLD + 0.5, sfx: 'plop' },
    ...f2.cues,
    ...s2.cues,
    { at: H2 + 0.05, sfx: 'boing' },
    { at: 4.85, sfx: 'blip' },
    { at: 5.15, sfx: 'blip' },
    ...f3.cues,
    { at: H3, sfx: 'bonk' },
    { at: H3 + 0.05, sfx: 'rumble' },
    { at: DROP + 0.18, sfx: 'crack' },
    ...f4.cues,
    { at: SUCK + 0.1, sfx: 'gulp' },
    { at: SUCK + 0.4, sfx: 'gulp' },
    { at: SPRAY, sfx: 'splash' },
    { at: WET + 0.65, say: '外星人' },
    { at: WET + 0.9, sfx: 'cheer' },
  ],
})
