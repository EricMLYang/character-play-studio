import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 虹（v2）：雨停了，天邊出現一道又大又亮的彩虹。狗狗警長想跑到彩虹底下——可是每次他一靠近，
// 彩虹就抖一下、「咻」地拉成一道彩色的光溜走，一次比一次遠、他撲空一次比一次慘：
// 走過去伸手，彩虹滑到旁邊（他嚇一跳；虫的上半從彩虹剛剛在的地方飛出來）→ 用衝的撲過去，彩虹跳到畫面另一頭、他趴扁（虫的下半）→
// 先停一拍：他轉過去假裝不看、吹口哨，突然回頭飛撲——彩虹整道升到天邊，他「嘩」地摔進水窪（工）。
// 語詞「彩虹」：彩虹從天邊溜回來，停在畫面中間。回馬槍：他不追了，嘆一口氣——彩虹自己「咻」地跑過來，
// 「咚」地落在他身上，變成一道大拱門把他罩在正下面：他終於站在彩虹底下了。
// 虹、虹、彩虹、這是什麼字？、虹
const S = 36
const P = 77 - 0.42 * S // 警長站在地上的 y

type V = { x: number; y: number }
/** 七條色帶（外圈紅 → 內圈紫） */
const COLORS = ['#E53935', '#FB8C00', '#F9C80E', '#43A047', '#1E88E5', '#3F51B5', '#8E24AA']
const SEG = 14
/** 一道彩虹的樣子：圓心 c（通常在地板上）、外圈半徑 r、色帶粗細 w（色帶之間不留縫） */
type Bow = { c: V; r: number; w: number; sy?: number }
/** 地上的大彩虹（開場）：他在左邊，彩虹在右邊 */
const A: Bow = { c: { x: 104, y: 74 }, r: 32, w: 2.9 }
/** 第 1 次：往右滑一點 */
const B: Bow = { c: { x: 128, y: 74 }, r: 30, w: 2.75 }
/** 第 2 次：跳到畫面另一頭（水窪上） */
const C: Bow = { c: { x: 31, y: 74 }, r: 28, w: 2.6 }
/** 第 3 次：升到右上的天邊（變小＝變遠；國字放大時不擋字） */
const D: Bow = { c: { x: 141, y: 46 }, r: 16.5, w: 2 }
/** 語詞：溜回來，停在畫面中間偏左 */
const E: Bow = { c: { x: 46, y: 74 }, r: 30, w: 2.8 }
/** 回馬槍：落在他身上的大拱門（內圈要比他高） */
const F: Bow = { c: { x: 94, y: 74 }, r: 53, w: 2.6 }
const top = (b: Bow): V => ({ x: b.c.x, y: b.c.y - b.r })

/** 一條色帶的折線：半圓（sy 壓扁） */
function arcPts(c: V, r: number, sy = 1): V[] {
  return Array.from({ length: SEG + 1 }, (_, j) => {
    const a = Math.PI * (1 - j / SEG)
    return { x: c.x + Math.cos(a) * r, y: c.y - Math.sin(a) * r * sy }
  })
}
/** 把折線畫成一段一段的線（錨在看不見的 rb 上，它停在 0,0，dx／dy 就是舞台座標） */
function strip(at: number, dur: number, pts: V[], color: string, width: number): Fx[] {
  const out: Fx[] = []
  for (let j = 0; j < pts.length - 1; j++) out.push({ at, dur, kind: 'line', actor: 'rb', dx: pts[j].x, dy: pts[j].y, to: pts[j + 1], color, width })
  return out
}
/** 一道彩虹從 from 停到 to（七條一起出現） */
function bow(b: Bow, from: number, to: number): Fx[] {
  return COLORS.flatMap((col, i) => strip(from, to - from, arcPts(b.c, b.r - i * b.w, b.sy ?? 1), col, b.w + 0.35))
}

/**
 * 「咻」：彩虹先往下一縮（預備：它要溜了！），再拉成一道七色的光，從 a 的頂端射到 b 的頂端，到了再展開成彩虹。
 * h 是溜走的那一刻；平常停著的彩虹另外用 bow 畫（舊的畫到 h − SQUASH，新的從 h + 0.12 開始）。
 */
const SQUASH = 0.22
function zip(h: number, a: Bow, b: Bow, k: number, via?: V): { fx: Fx[]; cues: Cue[] } {
  const p = top(a), q = top(b)
  const sw = 2.1
  /** 一段七色的光：從 u 射到 v（第二段晚一點出發，像拐個彎） */
  const leg = (u: V, v: V, at: number): Fx[] => {
    const len = Math.hypot(v.x - u.x, v.y - u.y) || 1
    const nx = -(v.y - u.y) / len, ny = (v.x - u.x) / len
    return COLORS.map((col, i): Fx => {
      const o = (i - 3) * sw
      return { at, dur: 0.3, kind: 'line', actor: 'rb', dx: u.x + nx * o, dy: u.y + ny * o, to: { x: v.x + nx * o, y: v.y + ny * o }, color: col, width: sw + 0.3 }
    })
  }
  // 有 via 就從高處繞過去（不要從警長身上掃過去蓋住他）
  const streak = via ? [...leg(p, via, h), ...leg(via, q, h + 0.08)] : leg(p, q, h)
  return {
    fx: [
      // 預備：往下一縮、抖一下（同一個樣子，每次都一樣）
      ...bow({ ...a, sy: 0.8 }, h - SQUASH, h + 0.04),
      { at: h - SQUASH, kind: 'burst', x: p.x, y: p.y - 2, emoji: '✨', n: 5, dur: 0.4, scale: 1.1 },
      ...streak,
      { at: h + 0.14, kind: 'burst', x: Math.min(q.x, 130), y: q.y + 2, emoji: '✨', n: 6 + 2 * k, dur: 0.45, scale: 1 + 0.15 * k },
    ],
    cues: [{ at: h - SQUASH, sfx: 'boing' }, { at: h, sfx: 'whoosh' }],
  }
}

// 時間
const SHOW = 0.55 // 雨停、彩虹出現
const H1 = 2.35, H2 = 3.4, H3 = 5.95, H4 = 9.7
const LAND3 = 6.75 // 摔進水窪
const FULL = 7.3
const PARK = FULL + 0.85
const WORD = PARK + 0.55
const DROP = H4 + 0.15 // 拱門落下「咚」
const LEAVE = 10.7 // 彩虹溜出畫面
const ASK = 10.95
const ANSWER = 13.55
/** 水窪 */
const PX = 27
const PDY = 75

const z1 = zip(H1, A, B, 0)
const z2 = zip(H2, B, C, 1, { x: 100, y: 12 })
const z3 = zip(H3, C, D, 2)
const z4 = zip(WORD, D, E, 2)
const z5 = zip(H4, E, F, 3)
/** 停著的彩虹：從上一次「咻」到了，畫到下一次縮起來 */
const STAY = (b: Bow, from: number, to: number) => bow(b, from, to - SQUASH + 0.04)

/** 一攤水：深藍底＋淺藍水面＋白亮邊（錨在 rb） */
function puddle(from: number, to: number): Fx[] {
  const w = 14, d = to - from
  const layer = (hw: number, y: number, color: string, width: number): Fx[] => [-1, 1].map((side): Fx => (
    { at: from, dur: d, kind: 'line', actor: 'rb', dx: PX, dy: y, to: { x: PX + side * hw, y }, color, width }))
  return [
    ...layer(w, PDY, '#2F7FD8', 3.6),
    ...layer(w - 1.8, PDY - 0.8, '#7CC2F2', 2.4),
    { at: from, dur: d, kind: 'line', actor: 'rb', dx: PX - 7, dy: PDY - 1.5, to: { x: PX + 2, y: PDY - 1.5 }, color: '#EAF7FF', width: 0.8 },
  ]
}

const moves: Move[] = [
  // 開場：雨停了，警長走進來——看到彩虹，嚇一跳、好開心
  { at: 0, actor: 'sheriff', do: 'enter', from: { x: -20, y: P }, dur: 0.55, ease: 'out' },
  { at: 0.62, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: 0.62, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.3 },
  { at: 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
  // 第 1 次：走過去、伸手——彩虹滑到旁邊
  { at: 1.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
  { at: 1.42, actor: 'sheriff', do: 'moveTo', to: { x: 64, y: P }, dur: 0.5 },
  { at: 1.98, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
  { at: H1 + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: H1 + 0.1, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.32 },
  // 第 2 次：衝過去、撲——彩虹跳到畫面另一頭，他趴扁
  { at: 2.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
  { at: 2.97, actor: 'sheriff', do: 'moveTo', to: { x: 100, y: P }, dur: 0.38, ease: 'in', anticipate: 3 },
  { at: 3.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
  { at: 3.35, actor: 'sheriff', do: 'moveTo', to: { x: 110, y: P }, arc: 5, dur: 0.38, ease: 'out' },
  { at: 3.73, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
  // 第 3 次前停一拍：爬起來、回頭看彩虹、想一想——轉過去假裝不看、吹口哨
  { at: 4.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: 4.45, actor: 'sheriff', do: 'flip' },
  { at: 4.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
  { at: 5.0, actor: 'sheriff', do: 'flip' },
  { at: 5.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
  { at: 5.2, actor: 'sheriff', do: 'tilt', amount: 6, dur: 0.6 },
  // 第 3 次：突然回頭飛撲——彩虹升到天邊，他摔進水窪
  { at: 5.85, actor: 'sheriff', do: 'flip' },
  { at: 5.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
  { at: 6.28, actor: 'sheriff', do: 'moveTo', to: { x: PX, y: P }, arc: 16, dur: 0.47, anticipate: 3, ease: 'inOut' },
  { at: 6.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
  { at: LAND3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
  { at: LAND3 + 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },
  // 字拼好、放大：他坐在水窪裡轉頭看
  { at: FULL, actor: 'sheriff', do: 'flip' },
  { at: FULL + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: FULL + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
  // 讓位：他爬起來走到右邊，回頭——彩虹溜回來了：彩虹！
  { at: PARK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
  { at: PARK + 0.02, actor: 'sheriff', do: 'moveTo', to: { x: F.c.x, y: P }, dur: 0.5 },
  { at: PARK + 0.52, actor: 'sheriff', do: 'flip' },
  { at: PARK + 0.52, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
  { at: WORD + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
  { at: WORD + 0.1, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.3 },
  // 回馬槍：他不追了，嘆一口氣——彩虹自己跑過來，「咚」地罩在他身上
  { at: 9.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/tired' },
  { at: DROP, actor: 'sheriff', do: 'squash', amount: 0.25, dur: 0.25 },
  { at: DROP + 0.08, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: DROP + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
  // 問他：他在左前方、變大，面向右邊的國字
  { at: ASK + 0.02, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
  { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: P + 2 }, dur: 0.35, ease: 'out' },
  { at: ASK + 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.1, dur: 0.35 },
  { at: ASK + 0.42, actor: 'sheriff', do: 'flip' },
  { at: ASK + 0.42, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
  { at: 12.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
  { at: 12.1, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.3 },
  { at: 12.7, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
  { at: 13.15, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
  // 回答：跳起來指著字
  { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.12 },
  { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
  { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 7, dur: 0.25 },
  // 退場：往左跑出去
  { at: ANSWER + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
  { at: ANSWER + 0.1, actor: 'sheriff', do: 'flip' },
  { at: ANSWER + 0.12, actor: 'sheriff', do: 'moveTo', to: { x: -35, y: P + 2 }, dur: 0.25, ease: 'in' },
]

const fx: Fx[] = [
  // 雨停了
  { at: 0, kind: 'rain', x: 60, y: 0, n: 8, dur: 0.55, scale: 1.4 },
  { at: 0.1, kind: 'rain', x: 112, y: 0, n: 8, dur: 0.5, scale: 1.4 },
  { at: SHOW, kind: 'burst', x: top(A).x, y: top(A).y, emoji: '✨', n: 8, dur: 0.5, scale: 1.3 },
  ...puddle(-0.3, ASK + 0.15),
  ...STAY(A, SHOW, H1), ...z1.fx,
  ...STAY(B, H1 + 0.12, H2), ...z2.fx,
  ...STAY(C, H2 + 0.12, H3), ...z3.fx,
  ...STAY(D, H3 + 0.12, WORD), ...z4.fx,
  ...STAY(E, WORD + 0.12, H4), ...z5.fx,
  ...bow(F, H4 + 0.12, LEAVE + 0.05),
  // 第 1 次：伸手撲空
  { at: H1 + 0.1, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: 2, dur: 0.55, scale: 1.3 },
  // 第 2 次：趴扁
  { at: 3.73, kind: 'burst', x: 108, y: 64, n: 1, dur: 0.45, scale: 1.6 },
  { at: 3.9, kind: 'dizzy', actor: 'sheriff', dur: 0.5 },
  // 停一拍：假裝不看、吹口哨（偷偷冒汗）
  { at: 4.65, kind: 'sweat', actor: 'sheriff', dur: 0.4 },
  { at: 5.05, kind: 'zzz', actor: 'sheriff', emoji: '🎵', dur: 0.8, scale: 1.3 },
  // 第 3 次：摔進水窪「嘩」
  { at: LAND3, kind: 'fountain', x: PX, y: PDY - 4, emoji: '💧', n: 12, dur: 0.6, scale: 1.6 },
  { at: LAND3, kind: 'burst', x: PX + 4, y: 60, n: 1, dur: 0.45, scale: 2.3 },
  { at: LAND3 + 0.45, kind: 'sweat', actor: 'sheriff', dur: 0.5 },
  // 語詞
  { at: WORD + 0.1, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: -4, dur: 0.5, scale: 1.2 },
  // 回馬槍：嘆氣
  { at: 9.2, kind: 'blow', actor: 'sheriff', dx: -6, dy: 12, to: { x: 70, y: 70 }, n: 3, dur: 0.45, scale: 1.3 },
  // 「咚」：拱門兩腳落地揚起星星
  { at: DROP, kind: 'burst', x: F.c.x - F.r + 6, y: 70, emoji: '✨', n: 6, dur: 0.45, scale: 1.2 },
  { at: DROP, kind: 'burst', x: F.c.x + F.r - 6, y: 70, emoji: '✨', n: 6, dur: 0.45, scale: 1.2 },
  { at: DROP + 0.55, kind: 'burst', actor: 'sheriff', emoji: '💖', n: 6, dur: 0.5 },
  // 彩虹又「咻」地溜出畫面（問他之前退場）
  ...COLORS.map((col, i): Fx => ({ at: LEAVE, dur: 0.25, kind: 'line', actor: 'rb', dx: top(F).x + (i - 3) * 2.1, dy: top(F).y, to: { x: top(F).x + 30 + (i - 3) * 2.1, y: -20 }, color: col, width: 2.4 })),
  { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
]

const cues: Cue[] = [
  { at: SHOW, sfx: 'blip' },
  { at: 0.85, say: '虹' },
  ...z1.cues,
  ...z2.cues,
  { at: 3.73, sfx: 'bonk' },
  { at: 4.3, sfx: 'gulp' },
  ...z3.cues,
  { at: LAND3, sfx: 'splash' },
  { at: FULL + 0.05, say: '虹' },
  ...z4.cues,
  { at: WORD + 0.05, say: '彩虹' },
  { at: 9.2, sfx: 'deflate' },
  ...z5.cues,
  { at: DROP, sfx: 'bonk' },
  { at: DROP + 0.55, sfx: 'cheer' },
  { at: LEAVE, sfx: 'whoosh' },
  { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
  { at: ANSWER, say: '虹' },
  { at: ANSWER + 0.05, sfx: 'cheer' },
]

const camera: Camera[] = [
  // 整道彩虹一直留在畫面裡：國字拼好前不讓自動取景推近到切掉彩虹
  { at: 0.3, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
  { at: H1 + 0.1, dur: 0.4, do: 'punch', amount: 0.08, to: { x: 80, y: 55 } },
  { at: 3.73, dur: 0.45, do: 'punch', amount: 0.14, to: { x: 102, y: 62 } },
  { at: 3.73, dur: 0.3, do: 'shake', amount: 1.2 },
  // 摔進水窪：不推近（推近會把升到右上天邊的彩虹切掉），震大一點
  { at: LAND3, dur: 0.45, do: 'shake', amount: 2.4 },
  { at: DROP, dur: 0.35, do: 'shake', amount: 1.8 },
]

const clip: Clip = {
  format: 2,
  char: '虹',
  meta: { theme: '追彩虹', cast: '狗狗警長＋一道會溜走的彩虹', gags: ['雨停了，狗狗警長想跑到彩虹底下，每次他一靠近，彩虹就抖一下、咻地拉成一道彩光溜走，一次比一次遠、他撲空一次比一次慘（走過去伸手，彩虹滑到旁邊→衝過去撲，彩虹跳到畫面另一頭、他趴扁→假裝不看吹口哨再突然飛撲，彩虹升到天邊、他摔進水窪）；回馬槍是他放棄了嘆一口氣，彩虹自己咻地跑過來，咚地落下變成拱門把他罩在正下面'] },
  duration: 14.9,
  // 雨後的淡藍天空、草地；字框放左上（背後只有天空，太陽在右上）
  bg: { top: '#CFE8FF', bottom: '#F3FAFF', floor: '#A9D98C', scenery: 'hills' },
  actors: [
    // 看不見的錨：彩虹、水窪的線都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: 46, y: P, size: S, flip: true, hidden: true },
  ],
  moves,
  builds: [
    // 每次彩虹溜走，原地留下一組筆畫，飛進左上的字框
    { at: H1 + 0.05, dur: 0.65, strokes: [0, 1, 2, 3], from: top(A), color: partColor('虫') },
    { at: H2 + 0.05, dur: 0.65, strokes: [4, 5], from: top(B), color: partColor('虫') },
    { at: H3 + 0.05, dur: 0.6, strokes: [6, 7, 8], from: top(C), color: partColor('工') },
  ],
  glyph: [
    { at: -0.05, dur: 0.01, do: 'park', to: { x: 26, y: 21 }, amount: 0.48 },
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: { x: 26, y: 21 }, amount: 0.48 },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx,
  camera,
  lights: [
    // 開場還在下雨：暗一點，雨停了亮起來
    { at: 0, dur: 0.01, level: 0.25 },
    { at: 0.15, dur: 0.4, level: 0 },
    { at: FULL, dur: 0.05, level: -0.25 },
    { at: FULL + 0.05, dur: 0.35, level: 0 },
  ],
  cues,
}

export default clip
