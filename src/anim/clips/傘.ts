import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 傘（v2）：傘一放下，雨就倒下來。下雨天，小骷髏把一把大紅傘高高撐在頭上——雨停了，他開心地把傘放到地上、張開手伸懶腰，
// 天上「轟隆」一聲——「嘩！」一大柱雨不偏不倚倒在他一個人身上；他趕快把傘撐回頭上，雨馬上就停。一次比一次大：
// 細細一柱，淋濕傻眼（人從傘頂飛出來）→ 粗粗一柱，沖得一屁股跌坐在水裡（四個小人從水花裡飛出來）→
// 先停一拍：他把傘慢慢放低、停住、抬頭看天、冒汗……踮著腳把傘放下、偷偷溜開一步、得意——「嘩！」一整片瀑布把他壓扁、沖到畫面另一頭，
// 傘也被沖倒（十從傘柄飛出來）。國字回中央唸「傘」。
// 國字讓到右上，他爬起來把傘撿回來撐好，雨打在傘上滴滴答答：「雨傘」。
// 回馬槍（第四次）：他想到辦法了（💡）——自己把傘放下，可是把傘倒過來放、跳進去坐好；最大的一柱「嘩！」倒下來，
// 地上淹成一片水，倒過來的雨傘變成一艘小船浮起來，他坐在船上開心揮手，划出畫面。
// 最後畫面暗下來只剩「傘」，小骷髏走回來，問「這是什麼字？」，手放耳邊等他回答，再指著字說「傘！」，然後退場只留字。
// 刻意不跟「雲」（雲跟著他、只下在他身上）、「風」（傘被風吹翻吹走）、「雷」（閃電充電）撞：這支沒有雲當角色，
// 規則只有一個——傘在頭上就不下、傘一離手就倒下來。背景是亮亮的淺灰藍雨天，一身黑的小骷髏每一格都看得清楚。
// 傘、傘、雨傘、這是什麼字？、傘

/** 小骷髏（hero:jerry；圖朝左） */
const JS = 36
const JY = 77 - 0.42 * JS
/** 每次都站在同一個地方：畫面中間偏左（右上留給字框） */
const JX = 76
const STAND: Vec = { x: JX, y: JY }
/** 雨傘（props-21 `umbrella`，打開的紅傘、直立、木握把） */
const US = 46
/** 撐在頭上（know 那隻高舉的手握著傘柄） */
const HELD: Vec = { x: JX - 8, y: 39 }
/** 放在地上（他的左邊，傘柄朝下立著） */
const DOWN: Vec = { x: JX - 31, y: 77 - 0.42 * US }
/** 頭頂 */
const HEAD_Y = JY - 15

/** 字框：右上角，背後是素色的天空 */
const FRAME: Vec = { x: 136, y: 18 }
const FRAME_K = 0.42

const RAIN = '#1D4FC4'
const RAIN_HI = '#8FC0F5'
const WATER = '#3D9BEA'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; end: number; hit: number }

/** 一條一條藍色的雨線，從 src 往 dst 落下去（每 0.07 秒換一批位置，看起來一直往下掉）。錨在看不見的 sky（0, 0） */
function rain(at: number, dur: number, cols: { src: Vec; dst: Vec }[], width: number, len: number): Fx[] {
  const out: Fx[] = []
  const step = 0.07
  for (let s = 0; at + s * step < at + dur - 0.04; s++) {
    cols.forEach(({ src, dst }, i) => {
      const L = Math.hypot(dst.x - src.x, dst.y - src.y)
      if (L < 2) return
      const ph = (s * 0.37 + i * 0.29) % 1
      const a = Math.max(0, ph * L - len * 0.3), b = Math.min(L, a + len)
      const p0 = { x: src.x + ((dst.x - src.x) * a) / L, y: src.y + ((dst.y - src.y) * a) / L }
      const p1 = { x: src.x + ((dst.x - src.x) * b) / L, y: src.y + ((dst.y - src.y) * b) / L }
      const t = at + s * step
      out.push({ at: t, dur: 0.2, kind: 'line', actor: 'sky', dx: p0.x, dy: p0.y, to: p1, color: RAIN, width })
      out.push({ at: t, dur: 0.2, kind: 'line', actor: 'sky', dx: p0.x, dy: p0.y, to: p1, color: RAIN_HI, width: width * 0.35 })
    })
  }
  return out
}

/** 滿天的小雨；umbrella 給了就讓傘面上的雨停在傘頂（傘擋住了） */
function drizzle(at: number, dur: number, umbrella?: Vec): Fx[] {
  const cols: { src: Vec; dst: Vec }[] = []
  for (let x = 4; x < 160; x += 10) {
    const over = umbrella && Math.abs(x - umbrella.x) < 19
    // 傘面是圓頂：越靠中間越高
    const top = umbrella ? umbrella.y - 17 + 0.022 * (x - umbrella.x) ** 2 : 0
    cols.push({ src: { x: x + 3, y: -4 }, dst: { x, y: over ? top : 77 } })
  }
  const out = rain(at, dur, cols, 0.9, 7)
  if (umbrella) for (let t = at + 0.1; t < at + dur - 0.2; t += 0.3) {
    out.push({ at: t, kind: 'burst', x: umbrella.x + ((t * 37) % 20) - 10, y: umbrella.y - 15, emoji: '💧', n: 3, dur: 0.3, scale: 0.7 })
  }
  return out
}

/** 天上倒下來的一大柱雨：x 為中心、寬 w，落到 yEnd（頭頂或地上） */
function pour(at: number, dur: number, x: number, w: number, yEnd: number, width: number): Fx[] {
  const n = Math.max(3, Math.round(w / 2.2))
  const cols = Array.from({ length: n }, (_, i) => {
    const o = -w / 2 + (w * i) / (n - 1)
    return { src: { x: x + o, y: -6 }, dst: { x: x + o, y: yEnd } }
  })
  return rain(at, dur, cols, width, 16)
}

/** 淹水：水面 level(t) 從畫面底下漲上來，畫成一條很粗的水管（tube 不會長出來也不會淡掉，深色描邊就是水面） */
function flood(t0: number, t1: number, level: (t: number) => number): Fx[] {
  const out: Fx[] = []
  for (let t = t0; t < t1; t += 0.05) {
    const L = level(t)
    if (L >= 90) continue
    const h = 92 - L
    out.push({ at: t, dur: 0.05, kind: 'tube', actor: 'sky', dx: -30, dy: L + h / 2, to: { x: 190, y: L + h / 2 }, color: WATER, width: h, n: 999 })
  }
  return out
}

/** 把傘撐回頭上（know：一隻手高高舉起來握著傘柄） */
function grab(at: number): Move[] {
  return [
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/know' },
    { at, actor: 'umbrella', do: 'moveTo', to: HELD, dur: 0.16, ease: 'out' },
    { at, actor: 'umbrella', do: 'rotateTo', amount: 0, dur: 0.16 },
  ]
}

/**
 * 同一個笑點「嘩！」：傘已經放在地上（at 那一刻落地）→ 天上「轟隆」（預備：他抬頭）→
 * 嘩！一柱雨不偏不倚倒在他身上＋💦＋鏡頭推近＋震＋同一個音效，他傻眼停住 → 他把傘撐回頭上，雨馬上停。
 * k 是第幾次（0～2）：雨柱一次比一次粗、他一次比一次慘、💦 一次比一次大、音效多疊一個。
 * wait 是傘放下到倒雨之間停多久（第三次故意等久一點）。
 */
function splash(at: number, k: number, wait: number): Gag {
  const hit = at + wait
  const W = [7, 13, 26][k]
  const moves: Move[] = []
  const fx: Fx[] = []
  let end: number
  if (k === 0) {
    // 淋濕、傻眼，縮一下
    moves.push(
      { at: hit, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
      { at: hit, actor: 'jerry', do: 'squash', amount: 0.12, dur: 0.25 },
    )
    const g = hit + 0.5
    moves.push(...grab(g), { at: g + 0.16, actor: 'jerry', do: 'shake', amount: 0.6, dur: 0.3 })
    fx.push(...pour(hit, g + 0.06 - hit, JX + 1, W, HEAD_Y + 2, 1.6))
    end = g + 0.3
  } else if (k === 1) {
    // 沖得往後滑、一屁股跌坐在水裡
    moves.push(
      { at: hit, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/slip' },
      { at: hit, actor: 'jerry', do: 'moveTo', to: { x: JX + 5, y: JY }, dur: 0.18, ease: 'out' },
      { at: hit + 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
      { at: hit + 0.2, actor: 'jerry', do: 'squash', amount: 0.22, dur: 0.22 },
    )
    const g = hit + 0.7
    moves.push(
      { at: g - 0.12, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.14 },
      ...grab(g),
      { at: g + 0.16, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.3 },
    )
    fx.push(...pour(hit, g + 0.06 - hit, JX + 3, W, 52, 2))
    end = g + 0.3
  } else {
    // 一整片瀑布：壓扁、沖到畫面右邊；傘也被沖倒、滑到左邊
    moves.push(
      { at: hit, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
      { at: hit + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },
      { at: hit + 0.1, actor: 'jerry', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: hit + 0.3, actor: 'jerry', do: 'moveTo', to: { x: 140, y: 77 - 0.42 * JS + 3 }, dur: 0.55, ease: 'out' },
      { at: hit + 0.2, actor: 'umbrella', do: 'moveTo', to: { x: 16, y: DOWN.y + 3 }, dur: 0.5, ease: 'out' },
      { at: hit + 0.2, actor: 'umbrella', do: 'rotateTo', amount: -28, dur: 0.5 },
    )
    fx.push(...pour(hit, 0.5, JX + 1, W, 62, 2.4))
    end = hit + 0.85
  }
  fx.push(
    { at: hit + 0.04, kind: 'burst', x: k === 0 ? JX : JX + 15, y: k === 0 ? HEAD_Y - 2 : 68, emoji: '💦', n: 1, dur: 0.45, scale: 1.4 + 0.6 * k },
    { at: hit + 0.08, kind: 'burst', x: JX, y: 72, emoji: '💧', n: 4 + 2 * k, dur: 0.45, scale: 1 + 0.3 * k },
  )
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: JX, y: 52 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 1 + 0.6 * k },
  ]
  // 同一組音效（轟隆、嘩啦），一次比一次多疊一個
  const cues: Cue[] = [{ at: hit - 0.3, sfx: 'rumble' }, { at: hit, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: hit + 0.2, sfx: 'plop' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'crack' }, { at: hit + 0.3, sfx: 'slide' })
  return { moves, fx, camera, cues, end, hit }
}

/** 雨停了：張開手伸懶腰，把傘放到地上（at 那一刻落地） */
function putDown(at: number): Move[] {
  return [
    { at: at - 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: at - 0.3, actor: 'umbrella', do: 'moveTo', to: DOWN, dur: 0.3, ease: 'inOut' },
  ]
}

// 開場：撐著傘走進來，雨打在傘上；雨停了
const RAIN0 = 0.92
// 第 1 次
const A1 = 1.2
const g1 = splash(A1, 0, 0.32)
// 第 2 次
const A2 = g1.end + 0.2
const g2 = splash(A2, 1, 0.32)
// 第 3 次前停一拍：傘慢慢放低、停住、抬頭看天、冒汗……踮腳放下、偷偷溜開一步、得意
const PAUSE = g2.end + 0.1
const A3 = PAUSE + 0.85
const g3 = splash(A3, 2, 0.5)
/** 字框填滿、國字到正中央 */
const HOME = g3.hit + 0.55
const PARK = HOME + 0.85
// 語詞：爬起來把傘撿回來撐好，雨打在傘上——「雨傘」
const PICK = PARK + 0.4
const WORD = PICK + 0.2
// 回馬槍（第四次）：💡 自己把傘倒過來放、跳進去
const IDEA = WORD + 0.65
const FLIP = IDEA + 0.25
const HOP = FLIP + 0.3
const HIT4 = HOP + 0.38
/** 倒過來的傘＝小船：碗口朝上，傘柄翹起來 */
const BOAT: Vec = { x: JX - 4, y: 77 - 0.4 * US }
const SIT: Vec = { x: BOAT.x + 8, y: 56 }
/** 水漲到這裡、船浮起來 */
const SEA = 58
const RISE_END = HIT4 + 0.5
const FLOAT_DY = 16
const SAIL = RISE_END + 0.05
const DRAIN = SAIL + 0.65
/** 問他 */
const ASK = DRAIN + 0.2
const ASK_SAY = ASK + 0.45
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }

function level(t: number): number {
  if (t < HIT4 + 0.08) return 92
  if (t < RISE_END) return 92 - (92 - SEA) * ((t - HIT4 - 0.08) / (RISE_END - HIT4 - 0.08))
  if (t < DRAIN) return SEA
  return SEA + (92 - SEA) * Math.min(1, (t - DRAIN) / 0.3)
}

const clip: Clip = {
  format: 2,
  char: '傘',
  meta: { theme: '雨天撐傘、傘一放下雨就倒下來', cast: '小骷髏＋大紅雨傘', gags: ['傘一放下，雨就倒下來：雨停了，小骷髏開心地把傘放到地上伸懶腰，天上「轟隆」一聲、一柱雨「嘩」地只倒在他身上，他趕快撐回傘、雨就停；雨柱一次比一次粗（淋濕傻眼→沖得跌坐→停一拍、偷偷放下傘溜開，一整片瀑布把他壓扁沖走）；回馬槍是他把傘倒過來放、跳進去坐好，最大的一柱倒下來淹成一片水，傘變成小船載著他開心划走'] },
  duration: Math.round((ANSWER + 1.75) * 100) / 100,
  // 亮亮的淺灰藍雨天＋淺色地板：一身黑的小骷髏一直看得清楚
  bg: { top: '#B8C8DC', bottom: '#E4ECF4', floor: '#C9D3DC', scenery: 'city' },
  actors: [
    // 看不見的錨點：雨線、水都掛在這裡（0, 0）。用 ☀️ 是為了讓背景不畫太陽（下雨天；字框在右上角，背後要素色）
    { id: 'sky', emoji: '☀️', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'jerry', emoji: 'hero:jerry/know', x: JX, y: JY, size: JS },
    // 傘畫在他前面：撐著的時候傘柄蓋在手上，倒過來當船時他坐在碗裡
    { id: 'umbrella', emoji: 'prop:umbrella', x: HELD.x, y: HELD.y, size: US, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：撐著傘走進來
    { at: 0, actor: 'jerry', do: 'enter', from: { x: 185, y: JY }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'umbrella', do: 'enter', from: { x: 185 - 8, y: HELD.y }, dur: 0.5, ease: 'out' },
    // 雨停了：伸手探一探，開心地把傘放下
    ...putDown(A1),
    ...g1.moves,
    ...putDown(A2),
    ...g2.moves,
    // 第 3 次前停一拍：傘慢慢放低一半、停住，抬頭看天……
    { at: PAUSE, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: PAUSE, actor: 'umbrella', do: 'moveTo', to: { x: JX - 20, y: 50 }, dur: 0.35, ease: 'inOut' },
    { at: PAUSE + 0.4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/scared' },
    { at: PAUSE + 0.4, actor: 'jerry', do: 'shake', amount: 0.7, dur: 0.3 },
    // ……踮著腳把傘放下、偷偷溜開一步
    { at: A3 - 0.25, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/sneak' },
    { at: A3 - 0.25, actor: 'umbrella', do: 'moveTo', to: DOWN, dur: 0.25 },
    { at: A3, actor: 'jerry', do: 'moveTo', to: { x: JX + 3, y: JY }, dur: 0.2 },
    // 沒事！得意
    { at: A3 + 0.25, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    ...g3.moves,
    // 國字讓位以後，爬起來走回來、把傘撿起來撐好
    { at: PARK + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: PARK + 0.05, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.45 },
    { at: PARK + 0.05, actor: 'umbrella', do: 'moveTo', to: DOWN, dur: 0.45 },
    { at: PARK + 0.05, actor: 'umbrella', do: 'rotateTo', amount: 0, dur: 0.45 },
    ...grab(PICK),
    { at: WORD, actor: 'umbrella', do: 'hop', amount: 2, dur: 0.3 },
    // 回馬槍：💡 把傘倒過來放在地上，跳進去坐好
    { at: IDEA, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: FLIP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: FLIP, actor: 'umbrella', do: 'moveTo', to: BOAT, dur: 0.28, ease: 'inOut' },
    { at: FLIP, actor: 'umbrella', do: 'rotateTo', amount: 180, dur: 0.28 },
    { at: HOP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: HOP, actor: 'jerry', do: 'moveTo', to: SIT, arc: 10, dur: 0.3, ease: 'out' },
    { at: HOP + 0.32, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: HIT4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 水漲起來，船浮起來
    { at: HIT4 + 0.15, actor: 'umbrella', do: 'moveTo', to: { x: BOAT.x, y: BOAT.y - FLOAT_DY }, dur: RISE_END - HIT4 - 0.15, ease: 'out' },
    { at: HIT4 + 0.15, actor: 'jerry', do: 'moveTo', to: { x: SIT.x, y: SIT.y - FLOAT_DY }, dur: RISE_END - HIT4 - 0.15, ease: 'out' },
    { at: HIT4 + 0.35, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/wave' },
    // 划走
    { at: SAIL, actor: 'umbrella', do: 'moveTo', to: { x: BOAT.x + 130, y: BOAT.y - FLOAT_DY }, dur: 0.65, ease: 'in' },
    { at: SAIL, actor: 'jerry', do: 'moveTo', to: { x: SIT.x + 130, y: SIT.y - FLOAT_DY }, dur: 0.65, ease: 'in' },
    { at: SAIL, actor: 'umbrella', do: 'tilt', amount: 6, dur: 0.4 },
    { at: SAIL + 0.67, actor: 'umbrella', do: 'vanish', dur: 0.01 },
    // 問他：走回來，站好、變大
    { at: ASK - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: ASK - 0.05, actor: 'jerry', do: 'moveTo', to: { x: 190, y: ASK_AT.y }, dur: 0.01 },
    { at: ASK, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.35, ease: 'out' },
    { at: ASK + 0.35, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.38, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.27, actor: 'jerry', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'jerry', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 細細一柱雨打在傘頂：人從傘頂飛出來（傘頂就是一個人字）
    { at: g1.hit + 0.52, dur: 0.45, strokes: [0, 1], from: 'umbrella', color: partColor('人') },
    // 沖得跌坐在水裡：四個小人從水花裡飛出來
    { at: g2.hit + 0.22, dur: 0.5, strokes: [2, 3, 4, 5, 6, 7, 8, 9], from: 'jerry', color: partColor('人') },
    // 傘被沖倒：十從傘柄飛出來
    { at: g3.hit + 0.1, dur: 0.45, strokes: [10, 11], from: 'umbrella', color: partColor('十') },
  ],
  glyph: [
    // 字框一開始就搬到右上角，畫面中間讓給傘和倒下來的雨
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: ANSWER + 1.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：雨打在傘上
    ...drizzle(0.45, RAIN0 - 0.45, HELD),
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.42, kind: 'sweat', actor: 'jerry', dx: 8, scale: 1.4 },
    { at: PAUSE + 0.42, kind: 'pop', actor: 'jerry', emoji: '❓', dx: -8, dy: -2, dur: 0.45 },
    { at: A3 + 0.28, kind: 'pop', actor: 'jerry', emoji: '🎵', dx: 8, dur: 0.3 },
    ...g3.fx,
    { at: g3.hit + 0.85, kind: 'dizzy', actor: 'jerry', dur: 0.6 },
    // 語詞：雨打在撐好的傘上
    ...drizzle(PICK + 0.1, IDEA - PICK, HELD),
    { at: IDEA + 0.02, kind: 'pop', actor: 'jerry', emoji: '💡', dx: 6, dur: 0.4, scale: 1.3 },
    // 回馬槍：最大的一柱倒進倒過來的傘，地上淹成一片水
    // 倒在船的左半邊（碗裡），不蓋住坐在右半邊的他
    ...pour(HIT4, SAIL + 0.2 - HIT4, BOAT.x - 9, 18, 60, 2.4),
    { at: HIT4 + 0.05, kind: 'burst', x: BOAT.x - 14, y: 62, emoji: '💦', n: 1, dur: 0.45, scale: 2.4 },
    ...flood(HIT4, DRAIN + 0.35, level),
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    // 國字回中央以後手寫全景，蓋掉自動取景（傘在左、船往右划，推近會切掉）
    { at: HOME - 0.3, dur: 0.3, do: 'zoom', amount: 1, to: { x: 80, y: 45 } },
    { at: HIT4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '傘' },
    { at: 0.5, sfx: 'tap' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '傘' },
    { at: PICK, sfx: 'whoosh' },
    { at: WORD, say: '雨傘' },
    { at: IDEA, sfx: 'blip' },
    { at: HOP + 0.3, sfx: 'plop' },
    { at: HIT4 - 0.3, sfx: 'rumble' },
    { at: HIT4, sfx: 'splash' },
    { at: SAIL, sfx: 'cheer' },
    { at: ASK + 0.3, sfx: 'tap' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '傘' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
