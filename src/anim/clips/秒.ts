import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 秒（v2）：一秒鐘就做完！畫面正中間站著一個大碼錶，紅色的秒針「滴！」走一格＝一秒。最快的兔子女孩蹲在旁邊，
// 秒針一「滴」，她就「咻」地衝過去，一團煙「噗」——一秒就做完一件事、衝回原位閉眼得意，頭上冒煙；一次比一次大件：
// 一秒吃光一根紅蘿蔔（禾）→ 一秒把空紙箱包成一個大禮物（少的小）→ 先停一拍：她蹲著盯碼錶，秒針抖啊抖就是不走……
// 滴！一秒用一塊磚頭蓋好一座大城堡（少的丿）。語詞那一刻碼錶在正中間「滴」地走一格：一秒。
// 回馬槍（第四次）：她得意忘形，「滴」一聲就繞著碼錶來回咻咻咻跑好幾圈——風把秒針吹得狂轉，「啵ㄧㄛ」整根飛出去，
// 碼錶「喀」地倒下，她睜開眼睛傻眼：秒針呢？
// 最後畫面暗下來只剩「秒」，兔子女孩問「這是什麼字？」，手放耳邊等他回答，再指著字說「秒！」，然後退場只留字。
// 秒、秒、一秒、這是什麼字？、秒

/** 兔子女孩（size 36）站在地上 */
const SB = 36
const B = 77 - 0.42 * SB
/** 她每次蹲著等的地方（圖朝左，flip 朝右看碼錶） */
const BX = 34
/** 碼錶（prop:alarm-face，沒有指針的鐘，秒針由劇本畫）：畫面正中間、最大 */
const SC = 40
const C = 77 - 0.42 * SC
const CX = 80
/** 國字回中央放大時，碼錶跳到右邊讓位 */
const CX_AWAY = 134
/** 要做的事放在右邊同一個地方；底子 size 寫最大的城堡，小東西用 scaleTo 縮 */
const SI = 42
const IX = 126
const IY = 77 - 0.42 * SI
/** 她衝過去停的地方（在碼錶後面跑過去，碼錶一直看得到） */
const RUN_X = IX - 15

/** 鐘面（圖上的比例，以 size 為單位）：鐘面中心在圖中心往下 0.072、秒針長 0.25（跟「時」量的一樣） */
const FACE_DY = 0.072
const HAND_L = 0.25 * SC
const HAND = '#E8102B'
const GLOW = '#FFE066'
const faceAt = (x: number): Vec => ({ x, y: C + FACE_DY * SC })

/** 字框：一開始就在上方正中（室內場景左上是窗戶、右上是掛畫，正中是素色的牆） */
const FRAME = { x: 80, y: 18 }
const FRAME_K = 0.42

/** 秒針指著 deg 度（0 是十二點，順時針）：從看不見的錨點 face（鐘面中心）加偏移畫到 face，所以碼錶搬家時指針跟著走 */
function hand(at: number, dur: number, deg: number, glow = false, scale = 1): Fx[] {
  const r = (deg * Math.PI) / 180
  const L = HAND_L * scale
  const tip = { dx: L * Math.sin(r), dy: -L * Math.cos(r) }
  // 用沒有環節的管子畫（有深色描邊、一出來就整根在，不像 line 要長出來、淡掉）
  const out: Fx[] = [{ at, dur, kind: 'tube', actor: 'face', ...tip, target: 'face', color: HAND, width: 2.4 * scale, n: 99 }]
  if (glow) out.unshift({ at, dur: Math.min(dur, 0.35), kind: 'tube', actor: 'face', ...tip, target: 'face', color: GLOW, width: 6 * scale, n: 99 })
  return out
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const empty = (): Gag => ({ moves: [], fx: [], camera: [], cues: [] })
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera), cues: gs.flatMap((g) => g.cues),
})

/**
 * 「滴！」秒針走一格（from → from+30 度）：秒針跳過去、黃光亮一下、碼錶點一下、鏡頭往碼錶推一下。四次＋語詞那一刻一模一樣。
 * hold：秒針停在新的位置多久。
 */
function tick(at: number, from: number, hold: number, k: number, cx = CX): Gag {
  const g = empty()
  // 黃光：秒針底下亮 0.3 秒（秒針本身由檔尾那一串停著的 hand 畫）
  g.fx.push(...hand(at, Math.max(hold, 0.3), from + 30, true).slice(0, 1))
  g.moves.push({ at, dur: 0.14, actor: 'clock', do: 'squash', amount: 0.1 })
  g.cues.push({ at, sfx: 'blip' })
  g.camera.push({ at, dur: 0.35, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: cx, y: C } })
  return g
}

/**
 * 同一個笑點：她蹲著等 → 「滴！」→「咻」衝到右邊（在碼錶後面跑過去）→ 一團大煙「噗」蓋住那件事、她在煙裡忙
 * （swap：煙裡換成做好的樣子）→「咻」衝回原位、閉眼得意、頭上冒煙。一次比一次大（k）。回傳每一拍的時間。
 */
function zip(at: number, k: number, deg: number, o: { cy: number; cloud: number; swap?: Move[] }) {
  const g = tick(at, deg, 0, k)
  const GO = at + 0.05
  const SMOKE = GO + 0.14
  const BACK = SMOKE + 0.3
  const DONE = BACK + 0.14
  g.moves.push(
    { at: GO, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: GO, dur: 0.14, actor: 'bunny', do: 'moveTo', to: { x: RUN_X, y: B }, ease: 'in' },
    { at: SMOKE, dur: 0.3, actor: 'bunny', do: 'shake', amount: 1.5 },
    ...(o.swap ?? []),
    // 咻！衝回來
    { at: BACK, actor: 'bunny', do: 'flip' },
    { at: BACK, dur: 0.14, actor: 'bunny', do: 'moveTo', to: { x: BX, y: B }, ease: 'out' },
    // 閉眼得意（轉回來面向碼錶）
    { at: DONE, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    { at: DONE, actor: 'bunny', do: 'flip' },
  )
  g.fx.push(
    // 噗：一大團煙蓋住那件事，一次比一次大
    { at: SMOKE, dur: 0.42, kind: 'burst', x: IX - 4, y: o.cy, n: 1, emoji: 'prop:smoke', scale: o.cloud },
    { at: SMOKE + 0.05, dur: 0.35, kind: 'burst', x: IX - 4, y: o.cy, n: 6, emoji: '💥', scale: 0.9 + 0.2 * k },
    // 頭上冒煙（跑太快熱到冒煙），一次比一次大
    { at: DONE + 0.04, dur: 0.8, kind: 'pop', actor: 'bunny', emoji: 'prop:smoke', dx: 3, dy: 5, scale: 1.8 + 0.35 * k },
  )
  g.cues.push({ at: GO, sfx: 'whoosh' }, { at: SMOKE, sfx: 'poof' }, { at: BACK, sfx: 'whoosh' })
  g.camera.push({ at: SMOKE, dur: 0.3, do: 'shake', amount: 0.5 + 0.3 * k })
  return { ...g, GO, SMOKE, BACK, DONE }
}

// ---- 時間表 ----
/** 開場：她衝進來、抬頭指字框 */
const SAY1 = 0.5
/** 第 1 次：紅蘿蔔 */
const P1 = 0.85
const T1 = 1.3
const g1 = zip(T1, 0, 0, {
  cy: 77 - 0.5 * SI * 0.5, cloud: 2.8,
  swap: [{ at: T1 + 0.3, dur: 0.15, actor: 'item', do: 'vanish' }],
})
/** 第 2 次：空紙箱 → 包好的禮物 */
const P2 = 2.55
const T2 = 3.15
const g2 = zip(T2, 1, 30, {
  cy: 77 - 0.5 * SI * 0.7, cloud: 3.3,
  swap: [{ at: T2 + 0.3, actor: 'item', do: 'swap', emoji: 'prop:gift' }],
})
/** 第 3 次：一塊磚頭 → 大城堡；先停一拍（秒針抖啊抖就是不走） */
const P3 = 4.4
const WAIT = 4.85
const T3 = 5.55
const g3 = zip(T3, 2, 60, {
  cy: 77 - 0.5 * SI, cloud: 4,
  swap: [
    { at: T3 + 0.3, actor: 'item', do: 'swap', emoji: '🏰' },
    { at: T3 + 0.3, dur: 0.01, actor: 'item', do: 'scaleTo', amount: 1 / 0.55 },
  ],
})
/** 筆畫從做好的東西上彈出來（東西跟著變成筆畫飛走） */
const B1 = g1.DONE + 0.3
const B2 = g2.DONE + 0.3
const B3 = g3.DONE + 0.3
const DONE3 = B3 + 0.4
/** 國字放大到中間（碼錶跳到右邊、她退到左邊）→ 停 0.9 秒 → 讓位 → 碼錶跳回中間 → 語詞 */
const HOME = DONE3 + 0.05
const PARK = HOME + 0.9
const WORD = PARK + 0.45
/** 回馬槍：滴！來回咻咻咻跑四趟，秒針被風吹得狂轉、整根飛出去 */
const T4 = WORD + 0.85
const LEG = 0.13
const LAPS = [RUN_X + 6, BX + 8, RUN_X + 6, BX]
const SPIN_END = T4 + 0.05 + LAPS.length * LEG + 0.12
const FLY = SPIN_END
const FLY_DUR = 0.7
const BACK4 = T4 + 0.05 + LAPS.length * LEG
const LOOK = BACK4 + 0.6
const FALL = LOOK + 0.1
const ASK = LOOK + 0.65
const AX = 34
const ASK_S = 1.3
const ANSWER = ASK + 2.6
const END = ANSWER + 1.35

/** 秒針每一刻停在哪：開場 12 點，每「滴」一次走 30 度 */
const DEG = { g1: 30, g2: 60, g3: 90, word: 120 }

/** 第 3 次前停一拍：秒針在 60 度抖啊抖（左右各晃 4 度） */
function tremble(from: number, to: number): Fx[] {
  const out: Fx[] = []
  for (let t = from, i = 0; t < to - 0.01; t += 0.1, i++) out.push(...hand(t, Math.min(0.1, to - t), DEG.g2 + (i % 2 ? 4 : -4)))
  return out
}

/** 回馬槍：秒針越轉越快（從 120 度起，兩圈半），再整根「啵」地飛出去、邊飛邊轉 */
function spin(from: number, to: number): Fx[] {
  const out: Fx[] = []
  const n = 14
  for (let i = 0; i < n; i++) {
    const t0 = from + ((to - from) * i) / n
    const p = i / n
    out.push(...hand(t0, (to - from) / n, DEG.word + 900 * p * p))
  }
  return out
}
function flyHand(from: number, dur: number): Fx[] {
  const out: Fx[] = []
  const n = 11
  for (let i = 0; i < n; i++) out.push(...hand(from + (dur * i) / n, dur / n, 40 + 75 * i, false, 1.3))
  return out
}

const gags = merge(g1, g2, g3, tick(WORD, DEG.g3, 0, 1), tick(T4, DEG.word, 0, 3))

const clip: Clip = {
  format: 2,
  char: '秒',
  meta: { theme: '一秒鐘就做完', cast: '兔子女孩＋大碼錶＋要做的事', gags: ['碼錶的秒針「滴！」走一格＝一秒，最快的兔子女孩就「咻」地衝過去、一團煙「噗」一秒做完一件事，衝回來閉眼得意、頭上冒煙，一次比一次大件（吃光紅蘿蔔→空紙箱包成禮物→停一拍：秒針抖啊抖就是不走，滴！一塊磚頭蓋成大城堡）；回馬槍是她得意忘形繞著碼錶來回咻咻咻跑好幾趟，風把秒針吹得狂轉、整根飛出去，碼錶倒下，她傻眼'] },
  duration: END,
  // 淡淡的蜜桃色房間：白色的兔子、白煙、紅色碼錶都跳得出來
  bg: { top: '#FFD9BC', bottom: '#FFEBDA', floor: '#D2A77C', scenery: 'room' },
  actors: [
    { id: 'item', emoji: '🥕', x: IX, y: IY, size: SI, hidden: true },
    // 她畫在碼錶後面：衝過去時從碼錶後面跑過，碼錶一直看得到
    { id: 'bunny', emoji: 'hero:bunny/dash', x: BX, y: B, size: SB, flip: true, hidden: true },
    { id: 'clock', emoji: 'prop:alarm-face', x: CX, y: C, size: SC },
    // 鐘面中心（看不見的錨點）：秒針從這裡畫
    { id: 'face', emoji: '⏺️', ...faceAt(CX), size: 2, float: true, hidden: true },
  ],
  moves: [
    // 開場：咻地衝進來，抬頭指著字框
    { at: 0, dur: 0.35, actor: 'bunny', do: 'enter', from: { x: -20, y: B }, ease: 'out' },
    { at: 0.38, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    ...gags.moves,
    // ---- 第 1 次：紅蘿蔔（底子是城堡的大小，縮成一半） ----
    { at: P1, dur: 0.3, actor: 'item', do: 'pop' },
    { at: P1, dur: 0.01, actor: 'item', do: 'scaleTo', amount: 0.5 },
    { at: P1 + 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    // 吃光了：嘴巴還在嚼
    { at: g1.DONE + 0.5, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/eat' },
    { at: g1.DONE + 0.55, dur: 0.2, actor: 'bunny', do: 'hop', amount: 1.5 },
    // ---- 第 2 次：空紙箱 ----
    { at: P2, dur: 0.3, actor: 'item', do: 'pop' },
    { at: P2, actor: 'item', do: 'swap', emoji: 'prop:box' },
    { at: P2, dur: 0.01, actor: 'item', do: 'scaleTo', amount: 0.7 },
    { at: P2 + 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: B2, dur: 0.25, actor: 'item', do: 'vanish' },
    // ---- 第 3 次：一塊磚頭；她蹲著盯碼錶，秒針抖啊抖就是不走（停一拍） ----
    { at: P3, dur: 0.3, actor: 'item', do: 'pop' },
    { at: P3, actor: 'item', do: 'swap', emoji: '🧱' },
    { at: P3, dur: 0.01, actor: 'item', do: 'scaleTo', amount: 0.55 },
    { at: P3 + 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: WAIT, dur: 0.6, actor: 'bunny', do: 'shake', amount: 0.6 },
    { at: B3, dur: 0.25, actor: 'item', do: 'vanish' },
    // ---- 國字放大到中間：碼錶跳到右邊、她退到左邊 ----
    { at: HOME - 0.35, dur: 0.3, actor: 'clock', do: 'moveTo', to: { x: CX_AWAY, y: C }, arc: 6 },
    { at: HOME - 0.35, dur: 0.3, actor: 'face', do: 'moveTo', to: faceAt(CX_AWAY), arc: 6 },
    { at: HOME - 0.35, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: HOME - 0.35, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: 20, y: B } },
    { at: HOME, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    // 讓位：碼錶跳回中間、她走過來指著它
    { at: PARK + 0.05, dur: 0.3, actor: 'clock', do: 'moveTo', to: { x: CX, y: C }, arc: 6 },
    { at: PARK + 0.05, dur: 0.3, actor: 'face', do: 'moveTo', to: faceAt(CX), arc: 6 },
    { at: PARK + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: PARK + 0.05, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: BX, y: B } },
    { at: WORD - 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: WORD, dur: 0.25, actor: 'bunny', do: 'hop', amount: 3 },
    // ---- 回馬槍：蹲好，滴！來回咻咻咻跑四趟（都在碼錶後面） ----
    { at: T4 - 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: T4 + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    ...LAPS.flatMap((x, i): Move[] => [
      ...(i > 0 ? [{ at: T4 + 0.05 + i * LEG, actor: 'bunny', do: 'flip' } as Move] : []),
      { at: T4 + 0.05 + i * LEG, dur: LEG, actor: 'bunny', do: 'moveTo', to: { x, y: B }, ease: 'linear' },
    ]),
    { at: BACK4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    { at: BACK4, actor: 'bunny', do: 'flip' },
    // 啵ㄧㄛ：秒針整根飛出去（錨點帶著秒針往右上飛出畫面），碼錶彈一下
    { at: FLY, dur: FLY_DUR, actor: 'face', do: 'moveTo', to: { x: 172, y: 26 }, arc: 26, ease: 'linear' },
    { at: FLY, dur: 0.3, actor: 'clock', do: 'hop', amount: 4 },
    // 她睜開眼睛：秒針呢？傻眼
    { at: LOOK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: LOOK, dur: 0.25, actor: 'bunny', do: 'hop', amount: 5 },
    // 碼錶喀地往右倒下
    { at: FALL, dur: 0.3, actor: 'clock', do: 'rotateTo', amount: 80, ease: 'in' },
    { at: ASK - 0.25, dur: 0.2, actor: 'clock', do: 'vanish' },
    // ---- 問他：她走到左前方放大，面向右邊的國字 ----
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: AX, y: B - 1 }, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 1.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 咻地退場，畫面只留下字
    { at: ANSWER + 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: ANSWER + 0.15, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: -40, y: B - 1 }, ease: 'in' },
  ],
  builds: [
    // 吃光紅蘿蔔：禾從她身上彈出來；禮物、城堡：少從做好的東西上彈出來（東西跟著變成筆畫飛走）
    { at: B1, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'bunny', color: partColor('禾') },
    { at: B2, dur: 0.45, strokes: [5, 6, 7], from: 'item', color: partColor('少') },
    { at: B3, dur: 0.4, strokes: [8], from: 'item', color: partColor('少') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['bunny'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.8, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 先畫笑點的效果（滴的黃光在秒針底下），再畫秒針
    ...gags.fx,
    // 秒針：每一段停在哪（滴的那一刻由 tick 畫，這裡畫中間停著的時候）
    ...hand(0, T1, 0),
    ...hand(T1, T2 - T1, DEG.g1),
    ...hand(T2, WAIT - T2, DEG.g2),
    ...tremble(WAIT, T3),
    ...hand(T3, WORD - T3, DEG.g3),
    ...hand(WORD, T4 - WORD, DEG.word),
    ...spin(T4 + 0.02, SPIN_END),
    ...flyHand(FLY, FLY_DUR),
    // 第 3 次前停一拍：她冒汗
    { at: WAIT + 0.1, kind: 'sweat', actor: 'bunny', dx: 4 },
    // 語詞那一刻：碼錶旁冒一圈星星
    { at: WORD, dur: 0.6, kind: 'burst', x: CX, y: C - 2, n: 8, emoji: '✨' },
    // 回馬槍：風、超大的煙
    { at: BACK4 + 0.04, dur: 0.6, kind: 'pop', actor: 'bunny', emoji: 'prop:smoke', dx: 3, dy: 5, scale: 2.9 },
    { at: FLY, dur: 0.3, kind: 'burst', x: CX, y: C - 6, n: 1, emoji: '💥', scale: 1 },
    { at: LOOK + 0.05, kind: 'sweat', actor: 'bunny', dx: 4 },
  ],
  camera: [
    // 擋住自動取景：整支都是全景（碼錶在中間、要做的事在右邊、她在左邊，推近會切掉）
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...gags.camera,
    { at: FLY, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: SAY1, say: '秒' },
    { at: P1, sfx: 'plop' },
    { at: P2, sfx: 'plop' },
    { at: P3, sfx: 'plop' },
    { at: WAIT, sfx: 'tap' },
    { at: WAIT + 0.3, sfx: 'tap' },
    ...gags.cues,
    { at: HOME + 0.1, say: '秒' },
    { at: WORD + 0.05, say: '一秒' },
    // 回馬槍：來回咻咻咻、秒針狂轉滴滴滴、啵ㄧㄛ飛出去、碼錶倒下
    ...LAPS.slice(1).map((_, i): Cue => ({ at: T4 + 0.05 + (i + 1) * LEG, sfx: 'whoosh' })),
    ...[0.15, 0.27, 0.37, 0.45, 0.52].map((d): Cue => ({ at: T4 + d, sfx: 'tap' })),
    { at: FLY, sfx: 'boing' },
    { at: FALL + 0.3, sfx: 'bonk' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '秒' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
