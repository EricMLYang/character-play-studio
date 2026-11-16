import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 海（v2）：狗狗警長到海邊，在大陽傘旁邊躺下來曬太陽——右邊一大片藍藍的大海「嘩——」地湧上沙灘，一次比一次大：
// 沖到腳（他嚇得跳好高，氵從浪花飛出來）→ 淹過整個人、把他沖得轉一圈、陽傘被推歪（𠂉）→
// 先停一拍：他轉身盯著大海看，海很乖，他得意地又躺下去……整片海站起來變成一道大浪牆，他傻眼——「轟嘩！」整個人被捲走，
// 陽傘被拋上天掉進海裡，浪退了，他扁扁地趴在沙灘另一頭，頭上一條魚（母）。
// 語詞那一刻：大海漲潮漲到畫面中間，他張開雙手：「大海」（魚跳回海裡）。
// 回馬槍（第四次）：他學乖了，躺得遠遠的。浪來了——小小的，碰不到他，他坐起來指著海哈哈笑——
// 海裡「咻」地跳出一隻海豚，一個大肚子拍水「啪嘩！」就落在他面前，最大的一片水花整個淋在他頭上，他嚇得跳最高。
// 最後畫面暗下來只剩「海」，警長走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「海！」，然後退場只留字。
// 刻意不跟「洗」（被潑顏料、洗澡泡泡）、「象」（噴水柱）、「蝦」「蟹」（海邊小動物整人）、「浪」（衝浪）、「島」（小島）撞：
// 這支只演「大海的浪湧上沙灘、一次比一次大」，不划船、不衝浪，海一直是畫面右邊那一大片藍。
// 海、海、大海、這是什麼字？、海

/** 狗狗警長（hero:sheriff；圖朝左，躺著時頭在左、腳在右，正好把腳伸向右邊的海） */
const SS = 36
const SY = 77 - 0.42 * SS
/** 前三次都躺在同一個地方（陽傘右邊） */
const LIE = 80
/** 第三次被捲走、吐回沙灘的地方（左邊，國字回中央時不擋字） */
const SPIT = 26
/** 語詞那一刻站的地方、回馬槍學乖躺的地方 */
const WORD_X = 60
const FAR = 64
/** 大陽傘 */
const US = 30
const UX = 58
const UY = 77 - 0.42 * US
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 30, y: 20 }
const PARK_K = 0.5

// ---- 海：一排一排的藍色粗線疊成一大片海面（掛在看不見的錨點上，錨點在 0,0，dx／dy 就是舞台座標） ----

/** 海平線 */
const HORIZON = 58
/** 海面的每一排（由上往下） */
const ROWS = Array.from({ length: 15 }, (_, i) => HORIZON + 0.6 + i * 2.3)
/** 海岸線：每一排的海從這個 x 開始往右（斜的：遠的海岸在右邊，近的在左邊） */
const shore = (y: number) => 113 - (y - HORIZON) * 0.5
/** 地板那一排的海岸 */
const SHORE_F = shore(74)
const ROW_W = 3.1

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
/** 上面淺、下面深的藍 */
const rowColor = (y: number) => mix('#5CB9F4', '#1A64C8', Math.max(0, Math.min(1, (y - HORIZON) / 33)))
const FOAM = '#FFFFFF'

const ease = (p: number) => p * p * (3 - 2 * p)
const easeOut = (p: number) => 1 - (1 - p) * (1 - p)
const clamp01 = (p: number) => Math.max(0, Math.min(1, p))

/**
 * 一道浪：T 是浪頭打到他的那一刻。先在海岸湧起來（rise）、衝上沙灘（rush）到 reach，
 * 停一下再往前推 over（hold）、退回海裡（back）。H 是浪頭比地板高多少。
 */
type Surge = { T: number; reach: number; H: number; rise: number; rush: number; hold: number; back: number; over: number }

function surgeAt(s: Surge, t: number): { f: number; h: number } | null {
  const t0 = s.T - s.rush - s.rise
  if (t < t0 || t > s.T + s.hold + s.back) return null
  if (t < s.T - s.rush) return { f: SHORE_F, h: s.H * easeOut((t - t0) / s.rise) }
  if (t < s.T) return { f: SHORE_F + (s.reach - SHORE_F) * easeOut((t - s.T + s.rush) / s.rush), h: s.H }
  if (t < s.T + s.hold) {
    const p = (t - s.T) / s.hold
    return { f: s.reach + s.over * easeOut(p), h: s.H * (1 - 0.55 * p) }
  }
  const p = ease((t - s.T - s.hold) / s.back)
  return { f: s.reach + s.over + (SHORE_F - s.reach - s.over) * p, h: s.H * 0.45 * (1 - p) }
}

/** 浪頭的前緣：比地板高的排往前（左）倒一點（浪頭捲過來），比地板低的排往後一點（近的沙灘） */
const frontAt = (f: number, y: number) => (y < 74 ? f - (74 - y) * 0.32 : f + (y - 74) * 0.55)

type Seg = { a: Vec; b: Vec; color: string; width: number }

/** 海岸線往右退多少（負的是漲潮往左），照時間的關鍵格內插 */
function tideAt(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]
      return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0))
    }
  }
  return keys[keys.length - 1][1]
}

/** 某一刻整片海的樣子（一組線段，每段有自己的名字，前後格一樣就合併成一段） */
function seaFrame(t: number, surges: Surge[], tide: [number, number][]): Map<string, Seg> {
  const out = new Map<string, Seg>()
  const off = tideAt(tide, t)
  const live = surges.map((s) => surgeAt(s, t)).find((v) => v)
  const fronts: Vec[] = []
  ROWS.forEach((y, i) => {
    let x0 = shore(y) + off
    if (live && y >= 74 - live.h) {
      const fx = frontAt(live.f, y)
      if (fx < x0) { x0 = fx; fronts.push({ x: fx, y }) }
    }
    x0 = Math.max(x0, -8)
    if (x0 < 172) out.set(`r${i}`, { a: { x: x0, y }, b: { x: 176, y }, color: rowColor(y), width: ROW_W })
  })
  // 浪頭比海平線還高：海站起來變成一道牆（上面那幾排避開左上角的字框）
  if (live && live.h > 74 - HORIZON) {
    for (let j = 1; HORIZON + 0.6 - j * 2.3 >= 74 - live.h; j++) {
      const y = HORIZON + 0.6 - j * 2.3
      let x0 = frontAt(live.f, y)
      if (y < 44) x0 = Math.max(x0, 56)
      x0 = Math.max(x0, -8)
      out.set(`w${j}`, { a: { x: x0, y }, b: { x: 176, y }, color: mix('#7CCBF7', '#5CB9F4', clamp01((y - 30) / 28)), width: ROW_W })
      fronts.unshift({ x: x0, y })
    }
  }
  if (live && fronts.length) {
    // 浪頭的白色浪花：沿著前緣一條、最上面一大條
    fronts.sort((p, q) => p.y - q.y)
    for (let i = 0; i < fronts.length - 1; i++) out.set(`f${i}`, { a: fronts[i], b: fronts[i + 1], color: FOAM, width: 1.5 })
    const top = fronts[0]
    out.set('crest', { a: { x: top.x - 1, y: top.y - 1 }, b: { x: Math.min(176, top.x + 8 + live.h * 0.5), y: top.y - 1.2 }, color: FOAM, width: 2 })
  } else {
    // 平常：沿著海岸一條白白的浪花
    ROWS.forEach((y, i) => {
      if (i === ROWS.length - 1) return
      const a = { x: shore(y) + off, y }, b = { x: shore(ROWS[i + 1]) + off, y: ROWS[i + 1] }
      if (a.x < 172) out.set(`s${i}`, { a, b, color: FOAM, width: 1.1 })
    })
  }
  // 海平線一條白光、海面上幾道慢慢漂的白色小浪
  const h0 = Math.max(shore(HORIZON) + off, live && live.h > 74 - HORIZON ? 176 : -8)
  if (h0 < 170) out.set('hz', { a: { x: h0, y: HORIZON - 0.6 }, b: { x: 176, y: HORIZON - 0.6 }, color: '#E8F7FF', width: 0.8 })
  for (let i = 0; i < 12; i++) {
    const y = ROWS[1 + ((i * 5) % 13)]
    const x = 100 + ((i * 29 + Math.floor(t * 10) * 0.6) % 66)
    const edge = (live && y >= 74 - live.h ? Math.min(frontAt(live.f, y), shore(y) + off) : shore(y) + off) + 4
    if (x > edge && x < 166) out.set(`d${i}`, { a: { x, y: y - 0.6 }, b: { x: x + 4.5, y: y - 0.6 }, color: '#D8F1FF', width: 0.8 })
  }
  return out
}

/** 把整支的海每 0.05 秒取一格，前後格一樣的線段合成一段，變成一串 line 效果 */
function seaFx(end: number, surges: Surge[], tide: [number, number][]): Fx[] {
  const fx: Fx[] = []
  const open = new Map<string, { seg: Seg; at: number }>()
  const same = (p: Seg, q: Seg) => Math.abs(p.a.x - q.a.x) < 0.05 && Math.abs(p.a.y - q.a.y) < 0.05 && Math.abs(p.b.x - q.b.x) < 0.05 && Math.abs(p.b.y - q.b.y) < 0.05 && p.color === q.color && p.width === q.width
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    // 多留 0.12 秒跟下一段疊在一起，換段的時候不會閃
    fx.push({ at: o.at, dur: t - o.at + (last ? 0 : 0.12), kind: 'line', actor: 'water', dx: o.seg.a.x, dy: o.seg.a.y, to: o.seg.b, color: o.seg.color, width: o.seg.width })
    open.delete(key)
  }
  const STEP = 0.05
  for (let n = 0; n * STEP < end - 1e-6; n++) {
    const t = +(n * STEP).toFixed(3)
    const frame = seaFrame(t, surges, tide)
    for (const key of [...open.keys()]) {
      const now = frame.get(key)
      if (!now || !same(now, open.get(key)!.seg)) close(key, t, false)
    }
    for (const [key, seg] of frame) if (!open.has(key)) open.set(key, { seg, at: t })
  }
  for (const key of [...open.keys()]) close(key, end, true)
  return fx
}

// ---- 時間表 ----
const W1 = 1.75
const W2 = 3.45
/** 第三次前停一拍：他轉身盯著海看 */
const SUSPECT = W2 + 0.9
const SMUG = SUSPECT + 0.5
const W3 = 5.85
/** 字框填滿、國字到正中央 */
const HOME = W3 + 1.05
const PARK = HOME + 0.85
/** 語詞：大海漲潮漲到畫面中間 */
const WORD = PARK + 0.05
/** 回馬槍：他學乖了，躺得遠遠的 */
const R4 = WORD + 0.85
const W4 = R4 + 0.75
const LAUGH = W4 + 0.1
/** 海豚跳出來 */
const LEAP = W4 + 0.2
const SPLASH = LEAP + 0.45
/** 問他 */
const ASK = SPLASH + 0.8
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: 122, y: SY + 3 }

const SURGES: Surge[] = [
  // 第 1 次：小浪，剛好沖到他的腳
  { T: W1, reach: 89, H: 5, rise: 0.3, rush: 0.35, hold: 0.3, back: 0.5, over: -3 },
  // 第 2 次：淹過整個人
  { T: W2, reach: 54, H: 13, rise: 0.3, rush: 0.35, hold: 0.3, back: 0.5, over: -6 },
  // 第 3 次：整片海站起來變成一道大浪牆，把整個沙灘都蓋過去
  { T: W3, reach: 56, H: 44, rise: 0.5, rush: 0.35, hold: 0.3, back: 0.5, over: -74 },
  // 第 4 次：小小的，停在他前面
  { T: W4, reach: 86, H: 3, rise: 0.3, rush: 0.35, hold: 0.35, back: 0.45, over: 0 },
]
/** 海岸線：國字回中央時往右退一點；語詞那一刻漲潮漲到畫面中間；問他之前整片退出畫面 */
const TIDE: [number, number][] = [
  [0, 0], [HOME - 0.3, 0], [HOME, 13], [PARK, 13], [WORD, 0], [WORD + 0.45, -34], [R4 - 0.05, -34], [R4 + 0.35, 0],
  [ASK - 0.32, 0], [ASK, 64],
]

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 「嘩——」浪打到那一下：浪花四濺＋鏡頭推一下＋震＋同一個音效（一次比一次多疊一個音） */
function hit(at: number, k: number, c: Vec): Gag {
  const fx: Fx[] = [
    { at, kind: 'burst', x: c.x, y: c.y, emoji: '💦', n: 6 + 2 * k, dur: 0.5, scale: 1.2 + 0.45 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: c.x, y: 58 } },
    { at, dur: 0.32, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at: at - 0.33, sfx: 'whoosh' }, { at, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'bubble' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'rumble' })
  return { moves: [], fx, camera, cues }
}

// 第 1 次：沖到腳，他嚇得跳好高，落地傻眼；浪退了，他氣呼呼地又躺回去
const g1 = hit(W1, 0, { x: 92, y: 66 })
g1.moves.push(
  { at: W1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: W1, actor: 'sheriff', do: 'hop', amount: 16, dur: 0.5 },
  { at: W1 + 0.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
  { at: W1 + 1.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/sleep' },
)
// 第 2 次：淹過整個人，把他沖得轉一圈、往左推；陽傘被推歪
const g2 = hit(W2, 1, { x: 78, y: 60 })
g2.moves.push(
  { at: W2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: W2, actor: 'sheriff', do: 'hop', amount: 9, dur: 0.5 },
  { at: W2, actor: 'sheriff', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
  { at: W2, actor: 'sheriff', do: 'moveTo', to: { x: LIE - 10, y: SY }, dur: 0.5, ease: 'out' },
  { at: W2 + 0.05, actor: 'umbrella', do: 'rotateTo', amount: -28, dur: 0.3, ease: 'back' },
  { at: W2 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
  { at: W2 + 0.6, actor: 'sheriff', do: 'shake', amount: 1.4, dur: 0.3 },
)
g2.fx.push({ at: W2 + 0.55, kind: 'sweat', actor: 'sheriff', dx: 10 })
// 停一拍：走回原位、轉身盯著海看（海很乖），得意地又躺下去
const pause: Move[] = [
  { at: SUSPECT - 0.3, actor: 'sheriff', do: 'moveTo', to: { x: LIE, y: SY }, dur: 0.28 },
  { at: SUSPECT, actor: 'sheriff', do: 'flip' },
  { at: SUSPECT, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
  { at: SUSPECT + 0.05, actor: 'sheriff', do: 'tilt', amount: 6, dur: 0.35 },
  { at: SMUG, actor: 'sheriff', do: 'flip' },
  { at: SMUG, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
  { at: SMUG + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/sleep' },
]
// 第 3 次：海站起來——他坐起來轉頭看，傻眼；轟嘩！整個人被捲走，陽傘被拋上天掉進海裡
const SEE3 = W3 - 0.6
const g3 = hit(W3, 2, { x: 84, y: 46 })
g3.moves.push(
  { at: SEE3, actor: 'sheriff', do: 'flip' },
  { at: SEE3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: SEE3, actor: 'sheriff', do: 'hop', amount: 5, dur: 0.3 },
  { at: SEE3 + 0.35, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 0.25 },
  // 被捲在水裡往左帶（看不到他），浪退了才露出來：扁扁地趴在沙灘另一頭
  { at: W3 + 0.08, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
  { at: W3 + 0.08, actor: 'sheriff', do: 'flip' },
  { at: W3 + 0.08, actor: 'sheriff', do: 'moveTo', to: { x: SPIT, y: SY }, dur: 0.4, ease: 'out' },
  // 陽傘被拋上天、翻著掉進海裡
  { at: W3 - 0.08, actor: 'umbrella', do: 'moveTo', to: { x: 150, y: 70 }, arc: 46, dur: 0.75, ease: 'linear' },
  { at: W3 - 0.08, actor: 'umbrella', do: 'rotateTo', amount: 340, dur: 0.75 },
  { at: W3 + 0.7, actor: 'umbrella', do: 'vanish', dur: 0.01 },
  // 頭上掉下一條魚，啪噠啪噠
  { at: W3 + 0.62, actor: 'fish', do: 'pop', dur: 0.2 },
  { at: W3 + 0.85, actor: 'fish', do: 'hop', amount: 3, dur: 0.22 },
  { at: W3 + 1.2, actor: 'fish', do: 'hop', amount: 3, dur: 0.22 },
)
g3.fx.push({ at: SEE3, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: -12, dy: 2 })
g3.cues.unshift({ at: W3 - 0.85, sfx: 'rumble' })
// 浪牆湧起來的時候，牆頂一直噴白色浪花
for (const dt of [0.7, 0.5, 0.3]) g3.fx.push({ at: W3 - dt, kind: 'burst', x: 124 - (0.7 - dt) * 40, y: 74 - 44 + 2, emoji: '💦', n: 5, dur: 0.35, scale: 1.1 })

/** 第 4 次：海豚肚子拍水，一大片水花從牠落水的地方噴起來、整個蓋在他頭上 */
const DROP: Vec = { x: 87, y: 70 }
const HEAD4: Vec = { x: FAR - 4, y: 50 }
function sheet(at: number): Fx[] {
  const out: Fx[] = []
  const arcs = [
    { apex: 28, land: { x: HEAD4.x + 2, y: 46 }, w: 4.6 },
    { apex: 32, land: { x: HEAD4.x - 6, y: 50 }, w: 3.8 },
    { apex: 34, land: { x: HEAD4.x + 9, y: 52 }, w: 3.2 },
  ]
  const N = 10
  for (const [j, a] of arcs.entries()) {
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const s = i / N
      const x = DROP.x + (a.land.x - DROP.x) * s
      const y = DROP.y + (a.land.y - DROP.y) * s - 4 * (DROP.y - a.apex) * s * (1 - s) * (1 + 0.15 * s)
      return { x, y }
    })
    for (let i = 0; i < N; i++) {
      // 水從落水的地方往上噴、一段一段長過去
      const t = at + j * 0.03 + i * 0.022
      out.push({ at: t, dur: at + 0.5 - t, kind: 'line', actor: 'water', dx: pts[i].x, dy: pts[i].y, to: pts[i + 1], color: '#3D9BEA', width: a.w })
      if (i % 2 === 0) out.push({ at: t, dur: at + 0.5 - t, kind: 'line', actor: 'water', dx: pts[i].x, dy: pts[i].y, to: pts[i + 1], color: '#D8F1FF', width: a.w * 0.35 })
    }
  }
  return out
}
const g4 = hit(SPLASH, 3, { x: HEAD4.x + 8, y: 48 })
g4.moves.push(
  // 海豚從海裡「咻」地跳出來，大肚子拍水
  { at: LEAP, actor: 'dolphin', do: 'pop', dur: 0.05 },
  { at: LEAP, actor: 'dolphin', do: 'moveTo', to: { x: DROP.x, y: DROP.y - 6 }, arc: 30, dur: SPLASH - LEAP, ease: 'linear' },
  { at: LEAP, actor: 'dolphin', do: 'rotateTo', amount: -70, dur: SPLASH - LEAP },
  { at: SPLASH, actor: 'dolphin', do: 'squash', amount: 0.3, dur: 0.2 },
  { at: SPLASH + 0.18, actor: 'dolphin', do: 'moveTo', to: { x: 150, y: 84 }, arc: 12, dur: 0.45, ease: 'in' },
  { at: SPLASH + 0.18, actor: 'dolphin', do: 'rotateTo', amount: 70, dur: 0.45 },
  { at: SPLASH + 0.65, actor: 'dolphin', do: 'vanish', dur: 0.01 },
  // 整個淋濕：嚇得跳最高，再一屁股坐下去
  { at: SPLASH + 0.04, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at: SPLASH + 0.28, actor: 'sheriff', do: 'hop', amount: 18, dur: 0.42 },
  { at: SPLASH + 0.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },
)
g4.fx.push(
  ...sheet(SPLASH),
  { at: SPLASH, kind: 'burst', x: DROP.x, y: DROP.y - 4, emoji: '💦', n: 8, dur: 0.45, scale: 1.6 },
  { at: SPLASH + 0.28, kind: 'sweat', actor: 'sheriff', dx: 10, dur: 0.4 },
)
g4.cues.push({ at: LEAP, sfx: 'boing' }, { at: SPLASH + 0.12, sfx: 'bonk' })

const builds: Build[] = [
  // 浪花濺起來：氵 → 每的上半（𠂉）→ 每的下半（母）
  { at: W1 + 0.05, dur: 0.5, strokes: [0, 1, 2], from: { x: 92, y: 64 }, color: partColor('氵') },
  { at: W2 + 0.05, dur: 0.5, strokes: [3, 4], from: { x: 76, y: 56 }, color: partColor('每') },
  { at: W3 + 0.05, dur: 0.5, strokes: [5, 6, 7, 8, 9], from: { x: 92, y: 36 }, color: partColor('每') },
]

const clip: Clip = {
  format: 2,
  char: '海',
  meta: { theme: '海邊曬太陽被大海的浪沖', cast: '狗狗警長＋海豚＋陽傘', gags: ['狗狗警長在海邊陽傘旁躺下來曬太陽，右邊一大片大海「嘩——」地湧上沙灘，一次比一次大：沖到腳嚇得他跳好高→淹過整個人把他沖得轉一圈→停一拍，他盯著海看、海很乖，得意地躺回去，整片海站起來變成大浪牆把他捲走，陽傘飛進海裡，他扁扁地趴在沙灘另一頭、頭上一條魚；回馬槍是他學乖了躺得遠遠的，浪小小的碰不到他，他坐起來哈哈笑，海裡跳出一隻海豚肚子拍水，最大的水花整個淋在他頭上'] },
  duration: 15,
  // 淺藍的天、金黃的沙灘：右邊一大片藍色的海跳得出來
  bg: { top: '#BCE4FF', bottom: '#EAF7FF', floor: '#F2DCA2', scenery: 'sea' },
  actors: [
    // 看不見的錨點：海面、浪、水花的線都掛在它身上（在 0,0，不會動）
    { id: 'water', emoji: '🟦', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'umbrella', emoji: '⛱️', x: UX, y: UY, size: US, pivot: 'center' },
    { id: 'dolphin', emoji: '🐬', x: 142, y: 86, size: 26, hidden: true, float: true, pivot: 'center' },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: LIE, y: SY, size: SS },
    { id: 'fish', emoji: '🐟', x: SPIT - 9, y: 60, size: 13, hidden: true, float: true },
  ],
  moves: [
    // 開場：走進來，抬頭指著字框「海」，躺下來曬太陽
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: 30, y: SY }, dur: 0.45 },
    { at: 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/sleep' },
    ...g1.moves,
    ...g2.moves,
    ...pause,
    ...g3.moves,
    // 語詞：站起來衝到中間，對著漲上來的大海張開雙手；魚跳回海裡
    // 等國字讓到左上角以後才站起來（扁扁的他比較矮，國字飛過去時不會疊到）
    { at: WORD + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/hug' },
    { at: WORD + 0.3, actor: 'sheriff', do: 'flip' },
    { at: WORD + 0.3, actor: 'sheriff', do: 'moveTo', to: { x: WORD_X, y: SY }, dur: 0.28, ease: 'out' },
    { at: WORD + 0.62, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.25 },
    // 等國字讓到左上角以後才跳，不從字前面經過
    { at: WORD + 0.4, actor: 'fish', do: 'moveTo', to: { x: 96, y: 76 }, arc: 14, dur: 0.45, ease: 'in' },
    { at: WORD + 0.4, actor: 'fish', do: 'rotateTo', amount: 120, dur: 0.45 },
    { at: WORD + 0.87, actor: 'fish', do: 'vanish', dur: 0.01 },
    // 回馬槍：學乖了，退到遠遠的地方得意地躺下
    { at: R4, actor: 'sheriff', do: 'flip' },
    { at: R4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: R4, actor: 'sheriff', do: 'moveTo', to: { x: FAR, y: SY }, dur: 0.25 },
    { at: R4 + 0.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/sleep' },
    // 小小的浪碰不到他：坐起來指著海哈哈笑
    { at: LAUGH, actor: 'sheriff', do: 'flip' },
    { at: LAUGH, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/laugh' },
    { at: LAUGH + 0.1, actor: 'sheriff', do: 'hop', amount: 3, dur: 0.25 },
    ...g4.moves,
    // 問他：從右邊走回來，轉向國字、變大
    { at: ASK + 0.02, actor: 'sheriff', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: ASK + 0.1, actor: 'sheriff', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.12, actor: 'sheriff', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: ANSWER + 0.16, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'sheriff', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（海在右邊、他在中間）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給警長
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 58, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...seaFx(ASK, SURGES, TIDE),
    ...g1.fx,
    ...g2.fx,
    { at: SUSPECT + 0.05, kind: 'pop', actor: 'sheriff', emoji: '❓', dx: -8 },
    ...g3.fx,
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把右邊的海切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD + 0.1, dur: 0.6, do: 'punch', amount: 0.06, to: { x: 96, y: 60 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '海' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '海' },
    { at: WORD, sfx: 'splash' },
    { at: WORD + 0.1, say: '大海' },
    { at: W4 - 0.3, sfx: 'plop' },
    { at: LAUGH + 0.05, sfx: 'tap' },
    ...g4.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '海' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
