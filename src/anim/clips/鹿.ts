import type { Build, Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 鹿（v2）：鹿角是最棒的掛衣架。小骷髏旁邊有一疊東西，他每次拿起最上面那一樣、舉過頭，「咻——噹！」丟上去掛在大鹿的角上——
// 鹿角上的東西一次比一次多、一次比一次重，鹿的頭就被壓得一次比一次低：
// 紅圍巾掛上去，頭點一下（广從鹿角上彈出來）→ 書包掛上去，頭垂一截、冒汗（中間那塊從鹿頭彈出來）→
// 先停一拍：最下面是一大桶水，他舉得搖搖晃晃，鹿腳發抖——「噹！」鹿整個往前栽、屁股翹起來（下面的比從鹿腳彈出來）。
// 語詞那一刻他指著掛滿東西的鹿角：「鹿角」。
// 回馬槍（第四次）：他兩手扶著帽子，還想把帽子也掛上去——鹿頭用力往上一甩，圍巾、書包全飛出畫面，
// 那一大桶水在空中翻過來，「嘩啦！」倒扣在他頭上：這次被壓下去的是他。
// 最後畫面暗下來只剩「鹿」，小骷髏問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「鹿！」，然後退場只留字。
// 刻意不跟「肩」（東西停到肩膀上、最後小鳥一停就垮）撞：這支是他主動把東西掛到鹿角上、被壓的是鹿，回馬槍是鹿把東西甩回去。
// 鹿、鹿、鹿角、這是什麼字？、鹿

/** 大鹿（右邊，3D 圖朝左、鹿角在左上）：畫面上最大的東西 */
const DS = 44
const DY = 77 - 0.42 * DS
const DX = 120
/** 國字回中央放大那一秒，鹿被壓得踉蹌退出畫面右邊（不卡一半在邊上），讓位後再走回來 */
const DX_HOME = 192
/** 鹿頭被壓低的角度（負的是往前栽），第 0～3 次掛完以後 */
const TILT = [0, -6, -12, -20]
/** 鹿被壓矮的程度（stretchTo：寬變幾倍、高變幾分之一，腳彎下去），第 0～3 次掛完以後 */
const SQUAT = [1, 1.06, 1.14, 1.3]
/** 回馬槍鹿頭往上一甩的角度 */
const FLING = 12

/** 小骷髏（左邊，flip 朝右；前三次都站在同一個地方丟） */
const JS = 34
const JY = 77 - 0.42 * JS
const HX = 50
/** 那疊東西放的地方（他的左手邊、地上） */
const PX = 24

type Item = { id: string; size: number; spot: Vec; pile: Vec }
/**
 * 三樣東西：一次比一次大、一次比一次重。spot 是掛上去以後東西中心在 3D 鹿圖裡的比例：
 * 鹿角在 x 0.14–0.45、y 0.07–0.2，鹿臉在 x 0.09–0.39、y 0.2–0.39；東西全部掛在後面那支角往後垂、一個一個往後排，
 * 圍巾、書包畫在鹿後面（鹿角、鹿臉每一格都整個露出來），水桶最大、垂在鹿背上（畫在前面，最後才倒扣在他頭上）。
 */
const ITEMS: Item[] = [
  { id: 'scarf', size: 13, spot: { x: 0.53, y: 0.09 }, pile: { x: PX, y: 42 } },
  { id: 'bag', size: 15, spot: { x: 0.7, y: 0.2 }, pile: { x: PX, y: 54.8 } },
  { id: 'bucket', size: 17, spot: { x: 0.9, y: 0.28 }, pile: { x: PX, y: 77 - 0.42 * 17 } },
]

/** 鹿轉了 r 度、站在 x 的時候，圖裡比例 (u, v) 那一點在舞台上的位置（以腳底為支點，跟播放器一樣） */
function deerPoint(u: number, v: number, r: number, x = DX, sq = SQUAT[TILT.indexOf(r)] ?? 1): Vec {
  const lx = (u - 0.5) * DS * sq, ly = ((v - 0.5) * DS - 0.42 * DS) / sq
  const a = (r * Math.PI) / 180
  return { x: x + lx * Math.cos(a) - ly * Math.sin(a), y: 77 + lx * Math.sin(a) + ly * Math.cos(a) }
}
/** 鹿轉了 r 度時的 y：播放器斜的時候會把腳底抬高，這裡壓回去，腳才一直踩在地上 */
const deerY = (r: number) => DY + Math.abs(Math.sin((r * Math.PI) / 180)) * 0.42 * DS
/** 東西掛在鹿角上時的中心 */
function hung(it: Item, r: number, x = DX): Vec {
  return deerPoint(it.spot.x, it.spot.y, r, x)
}
/** 舉在他頭上時的中心 */
const held = (it: Item, x = HX): Vec => ({ x, y: 47 - 0.45 * it.size })
/** 鹿角正中間（語詞那一刻亮的地方） */
const antler = (r: number, x = DX) => deerPoint(0.3, 0.12, r, x)

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[]; builds: Build[] }

/**
 * 同一個笑點：轉身拿起那疊最上面的東西 → 舉過頭（lift）→ 往後一拉（throw）→「咻——噹！」掛上鹿角，
 * 鹿頭被壓低一截（已經掛著的東西跟著一起往下）、大大的 💥、鏡頭推一下＋震、同一個「噹」聲（一次多疊一個音）。
 * at 是掛上去那一刻，k 是第幾樣（0～2），wait 是舉著停多久（第三次停一拍讓他猜），strokes 是這一次彈出來的筆畫與從哪裡來。
 */
function hang(at: number, k: number, wait: number, strokes: number[], from: (r: number) => Vec): Gag {
  const it = ITEMS[k]
  const r0 = TILT[k], r1 = TILT[k + 1]
  const grab = at - 0.95 - wait
  const moves: Move[] = [
    // 轉身彎腰拿最上面那一樣
    { at: grab, actor: 'jerry', do: 'flip' },
    { at: grab, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: grab + 0.15, actor: it.id, do: 'moveTo', to: held(it), arc: 5, dur: 0.25, ease: 'out' },
    // 轉回來、舉過頭
    { at: grab + 0.3, actor: 'jerry', do: 'flip' },
    { at: grab + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    // 往後一拉（預備）
    { at: at - 0.45, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/throw' },
    { at: at - 0.45, actor: 'jerry', do: 'squash', amount: -0.12, dur: 0.15 },
    { at: at - 0.45, actor: it.id, do: 'moveTo', to: { x: HX - 5, y: held(it).y - 1 }, dur: 0.12 },
    // 咻——飛過去，勾上鹿角
    { at: at - 0.32, actor: it.id, do: 'moveTo', to: hung(it, r0), arc: 6, dur: 0.32, ease: 'in' },
    // 噹！鹿頭被壓低一截，掛著的東西全部跟著往下
    { at, actor: 'deer', do: 'rotateTo', amount: r1 - r0, dur: 0.22, ease: 'out' },
    { at, actor: 'deer', do: 'stretchTo', amount: SQUAT[k + 1] / SQUAT[k], dur: 0.22, ease: 'out' },
    { at, actor: 'deer', do: 'moveTo', to: { x: DX, y: deerY(r1) }, dur: 0.22, ease: 'out' },
    ...ITEMS.slice(0, k + 1).map((o): Move => ({ at, actor: o.id, do: 'moveTo', to: hung(o, r1), dur: 0.22, ease: 'out' })),
    { at: at + 0.22, actor: 'deer', do: 'shake', amount: 0.5 + 0.3 * k, dur: 0.35 },
    // 他很得意（還不知道鹿很辛苦）
    { at: at + 0.1, actor: 'jerry', do: 'swap', emoji: k < 2 ? 'hero:jerry/happy' : 'hero:jerry/surprised' },
  ]
  const p = hung(it, r1)
  const fx: Fx[] = [
    // 💥 每次都在掛上去的那一點，一次比一次大
    { at, kind: 'burst', x: p.x, y: p.y, n: 1, dur: 0.4, scale: 1.4 + 0.4 * k },
    // 鹿冒汗：一次比一次多
    { at: at + 0.25, kind: 'burst', x: deerPoint(0.12, 0.3, r1).x - 2, y: deerPoint(0.12, 0.3, r1).y - 4, emoji: '💦', n: 2 + 2 * k, dur: 0.5, scale: 1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: p.x - 6, y: p.y + 6 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.12 - 0.08 * k },
    { at: at + 0.04, dur: 0.25, level: 0 },
  ]
  // 同一個「噹」，一次比一次多疊一個音
  const cues: Cue[] = [{ at: at - 0.3, sfx: 'whoosh' }, { at, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  const builds: Build[] = [{ at: at + 0.08, dur: 0.55, strokes, from: from(r1), color: partColor('鹿') }]
  return { moves, fx, camera, cues, lights, builds }
}

const H1 = 2.15, H2 = 3.85, H3 = 6.05, H4 = 9.65
// 第 1 次：紅圍巾，广從鹿角上彈出來
const g1 = hang(H1, 0, 0, [0, 1, 2], (r) => antler(r))
// 第 2 次：書包，中間那塊從鹿頭彈出來
const g2 = hang(H2, 1, 0, [3, 4, 5, 6], (r) => deerPoint(0.2, 0.32, r))
// 第 3 次：先停一拍——一大桶水，下面的比從鹿腳彈出來
const g3 = hang(H3, 2, 0.45, [7, 8, 9, 10], () => ({ x: DX - 2, y: 70 }))

/** 語詞那一刻 */
const WORD = 8.6
/** 回馬槍他站的地方（離鹿頭近一點） */
const HX4 = 58
/** 水桶倒扣在他頭上（帽子上面）的中心 */
const CAP: Vec = { x: HX4 + 1, y: JY - 0.5 * JS + 4 }

const clip: Clip = {
  format: 2,
  char: '鹿',
  meta: { theme: '小骷髏把鹿角當掛衣架', cast: '小骷髏＋大鹿＋圍巾、書包、水桶', gags: ['小骷髏每次把一樣東西丟上去掛在鹿角上，東西一次比一次重，鹿頭被壓得一次比一次低，最後整隻往前栽；回馬槍是他還想把帽子也掛上去，鹿頭一甩，東西全飛走，水桶倒扣在他頭上'] },
  duration: 15,
  bg: { top: '#CFEFFF', bottom: '#F6FCFF', floor: '#C8E6A0', scenery: 'hills' },
  actors: [
    // 那一疊：水桶在最下面、書包、紅圍巾在最上面（拿的順序）。圍巾、書包排在鹿前面＝畫在鹿後面，掛上去以後鹿角、鹿臉整個露出來
    { id: 'scarf', emoji: '🧣', x: ITEMS[0].pile.x, y: ITEMS[0].pile.y, size: ITEMS[0].size, float: true, pivot: 'center' },
    // 書包原本是藍色，跟水桶撞色：轉成紫色
    { id: 'bag', emoji: 'prop:backpack', x: ITEMS[1].pile.x, y: ITEMS[1].pile.y, size: ITEMS[1].size, float: true, pivot: 'center', tint: 'hue-rotate(65deg) saturate(1.2)' },
    { id: 'deer', emoji: '🦌', x: DX, y: DY, size: DS },
    { id: 'jerry', emoji: 'hero:jerry/idle', x: HX, y: JY, size: JS, flip: true, hidden: true },
    // 水桶畫在最前面：掛上去垂在鹿背上，最後倒扣在他的帽子上
    { id: 'bucket', emoji: 'prop:bucket', x: ITEMS[2].pile.x, y: ITEMS[2].pile.y, size: ITEMS[2].size, pivot: 'center' },
  ],
  moves: [
    // 登場：走進來、抬頭看字框
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -25, y: JY }, dur: 0.55, ease: 'out' },
    { at: 0.65, actor: 'jerry', do: 'tilt', amount: -8, dur: 0.4 },
    { at: 1.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/know' },
    // 第 1 次：紅圍巾——噹，鹿頭點一下
    ...g1.moves,
    { at: H1 + 0.6, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 第 2 次：書包——噹，鹿頭垂一截
    ...g2.moves,
    { at: H2 + 0.55, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 第 3 次前停一拍：一大桶水，舉得搖搖晃晃，鹿腳發抖
    ...g3.moves,
    { at: H3 - 0.65, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: H3 - 0.65, actor: 'bucket', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: H3 - 0.55, actor: 'deer', do: 'shake', amount: 0.6, dur: 0.45 },
    // 噹！鹿整個往前栽；他嚇一跳往後退，鹿被壓得踉蹌退到右邊（國字回中央，兩邊讓開）
    { at: H3 + 0.45, actor: 'jerry', do: 'moveTo', to: { x: 22, y: JY }, dur: 0.35, ease: 'out' },
    { at: H3 + 0.45, actor: 'deer', do: 'moveTo', to: { x: DX_HOME, y: deerY(TILT[3]) }, dur: 0.45, ease: 'in' },
    ...ITEMS.map((o): Move => ({ at: H3 + 0.45, actor: o.id, do: 'moveTo', to: hung(o, TILT[3], DX_HOME), dur: 0.45, ease: 'in' })),
    // 語詞那一刻：國字讓回上方，鹿一步一步走回來，他走過去指著掛滿東西的鹿角
    { at: 8.0, actor: 'deer', do: 'moveTo', to: { x: DX, y: deerY(TILT[3]) }, dur: 0.45 },
    ...ITEMS.map((o): Move => ({ at: 8.0, actor: o.id, do: 'moveTo', to: hung(o, TILT[3]), dur: 0.45 })),
    { at: 7.95, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: 8.0, actor: 'jerry', do: 'moveTo', to: { x: HX, y: JY }, dur: 0.4 },
    { at: WORD - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: WORD - 0.05, actor: 'jerry', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍（第 4 次）：他還想把帽子也掛上去——兩手扶著帽子走過去，鹿腳發抖
    { at: 9.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: 9.0, actor: 'jerry', do: 'moveTo', to: { x: HX4, y: JY }, dur: 0.3 },
    { at: 9.25, actor: 'deer', do: 'shake', amount: 0.9, dur: 0.4 },
    // 鹿頭用力往上一甩：圍巾、書包飛出畫面右上，水桶在空中翻過來
    { at: H4, actor: 'deer', do: 'rotateTo', amount: FLING - TILT[3], dur: 0.18, ease: 'out' },
    { at: H4, actor: 'deer', do: 'stretchTo', amount: 1 / SQUAT[3], dur: 0.18, ease: 'out' },
    { at: H4, actor: 'deer', do: 'moveTo', to: { x: DX, y: deerY(FLING) }, dur: 0.18, ease: 'out' },
    { at: H4 + 0.25, actor: 'deer', do: 'rotateTo', amount: -FLING, dur: 0.25 },
    { at: H4 + 0.25, actor: 'deer', do: 'moveTo', to: { x: DX, y: DY }, dur: 0.25 },
    { at: H4 + 0.05, actor: 'scarf', do: 'moveTo', to: { x: 178, y: -12 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: H4 + 0.05, actor: 'scarf', do: 'spin', times: 2, dur: 0.45 },
    { at: H4 + 0.05, actor: 'bag', do: 'moveTo', to: { x: 182, y: 8 }, arc: 10, dur: 0.5, ease: 'out' },
    { at: H4 + 0.05, actor: 'bag', do: 'spin', times: -2, dur: 0.5 },
    { at: H4 + 0.05, actor: 'bucket', do: 'moveTo', to: CAP, arc: 7, dur: 0.4, ease: 'inOut' },
    { at: H4 + 0.05, actor: 'bucket', do: 'rotateTo', amount: 180, dur: 0.4 },
    // 嘩啦！倒扣在他頭上，整個人被壓扁一截、傻眼
    { at: H4 + 0.45, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: H4 + 0.45, actor: 'jerry', do: 'squash', amount: 0.4, dur: 0.5 },
    { at: H4 + 0.45, actor: 'bucket', do: 'squash', amount: 0.2, dur: 0.3 },
    // 水桶跟著他的頭一起被壓下去、再彈回來（一直扣在帽子上）
    { at: H4 + 0.45, actor: 'bucket', do: 'moveTo', to: { x: CAP.x, y: CAP.y + 9 }, dur: 0.12, ease: 'out' },
    { at: H4 + 0.57, actor: 'bucket', do: 'moveTo', to: CAP, dur: 0.38 },
    // 鹿抬頭挺胸、得意地跳一下，走出右邊
    { at: H4 + 0.55, actor: 'deer', do: 'hop', amount: 3, dur: 0.3 },
    { at: 10.3, actor: 'deer', do: 'moveTo', to: { x: 200, y: DY }, dur: 0.35, ease: 'in' },
    // 他甩頭，水桶飛掉
    { at: 10.5, actor: 'jerry', do: 'shake', amount: 1, dur: 0.2 },
    { at: 10.65, actor: 'bucket', do: 'moveTo', to: { x: -25, y: 40 }, arc: 6, dur: 0.25, ease: 'in' },
    { at: 10.65, actor: 'bucket', do: 'spin', times: -1, dur: 0.3 },
    // 問他：站到左前方、變大
    { at: 10.9, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: 10.9, actor: 'jerry', do: 'moveTo', to: { x: 36, y: JY + 4 }, dur: 0.3 },
    { at: 10.9, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 11.95, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: 11.95, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: 13.5, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.75, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: 13.78, actor: 'jerry', do: 'moveTo', to: { x: -45, y: JY + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [...g1.builds, ...g2.builds, ...g3.builds],
  glyph: [
    { at: 6.9, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.95, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小骷髏
    { at: 10.9, dur: 3.1, do: 'ask', keep: ['jerry'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.95, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    ...g3.fx,
    { at: H3 + 0.1, kind: 'burst', x: DX - 4, y: 68, emoji: '⭐', n: 8, dur: 0.45 },
    // 語詞：鹿角亮起來
    { at: WORD, kind: 'burst', x: antler(TILT[3]).x, y: antler(TILT[3]).y, emoji: '✨', n: 10, dur: 0.7, scale: 1.4 },
    // 回馬槍：甩頭的風、水嘩啦潑出來
    { at: H4, kind: 'swoosh', actor: 'deer', target: 'jerry', dx: -16, dy: -6, n: 14, sweep: 120, dur: 0.25, color: '#FFFFFF', width: 2.5 },
    { at: H4 + 0.45, kind: 'burst', x: HX4, y: JY - 6, emoji: '💦', n: 8, dur: 0.5, scale: 1.3 },
    { at: H4 + 0.45, kind: 'burst', x: CAP.x + 12, y: CAP.y + 2, n: 1, dur: 0.3, scale: 1.6 },
    { at: 13.5, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（#296：推近主角時會把右邊的鹿切掉一半）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.12, to: antler(TILT[3]) },
    { at: H4 + 0.45, dur: 0.45, do: 'punch', amount: 0.24, to: { x: HX4 + 6, y: 40 } },
    { at: H4 + 0.45, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    ...g1.lights,
    ...g2.lights,
    ...g3.lights,
    { at: 6.9, dur: 0.05, level: -0.35 },
    { at: 6.95, dur: 0.35, level: 0 },
    { at: H4 + 0.45, dur: 0.04, level: -0.4 },
    { at: H4 + 0.49, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 0.75, say: '鹿' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: 7.05, say: '鹿' },
    { at: WORD, say: '鹿角' },
    { at: H4, sfx: 'whoosh' },
    { at: H4 + 0.45, sfx: 'splash' },
    { at: H4 + 0.49, sfx: 'bonk' },
    { at: H4 + 0.53, sfx: 'rumble' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '鹿' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
