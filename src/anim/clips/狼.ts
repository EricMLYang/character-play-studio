import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 狼（v2）：大野狼吹房子。小骷髏站在自己蓋的小房子屋頂上，對右邊的大野狼摀嘴偷笑——
// 大野狼仰頭深吸一口氣、鼓起腮幫子「呼——！」一大排白色風線橫掃過去，房子就被吹走、他從屋頂摔下來，一次比一次難吹：
// 草屋一吹就飛上天（犭從大野狼身上跳出來）→ 他「啵」地蓋一間木頭房子，大野狼吹一口只晃一下、再吹一口才飛走（良的上半從房子上飛出來）→
// 先停一拍：他托著下巴想一想，「啵」地蓋一座磚頭堡壘、站上去閉眼得意——大野狼吸最大一口氣，吹最久，磚頭動都不動（良的下半從磚頭上彈出來），
// 大野狼吹到整張臉都紅了、頭暈眼花，搖搖晃晃退到旁邊。
// 語詞那一刻大野狼不服氣，走到中間仰頭一嚎：「大野狼」。
// 回馬槍（第四次）：大野狼脹到最大、使出全力「呼——！！」——風撞上磚頭整個彈回來，把大野狼自己轉著圈吹飛出畫面，小骷髏在磚頭上跳起來歡呼。
// 最後小骷髏跳下來、「啵」地把磚頭收掉，畫面暗下來只剩「狼」，他轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「狼！」，然後退場只留字。
// 刻意不跟「風」（風把手上的東西吹走）、「獅」（吼聲把人吹走）、「雲」（雲吹氣）、「家」（撞門框被房子彈出來）撞：這支演「大野狼吹倒房子」。
// 狼、狼、大野狼、這是什麼字？、狼

/** 小骷髏（hero:jerry；圖朝左，flip 朝右看大野狼） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 房子：左邊，同一個角色換三次圖（草屋 → 木頭房子 → 磚頭）；底子 size 寫最大的磚頭 */
const HX = 26
const HS = 38
const HY = 77 - 0.42 * HS
/** 三間房子的大小（一間比一間大）與站在屋頂上時他腳底的 y */
const SIZES = [28, 33, 38]
const ROOF: Vec[] = [{ x: HX, y: 42.5 }, { x: HX + 1, y: 40 }, { x: HX, y: 33 }]
const HOUSES = ['🛖', '🏚️', '🧱']

/** 大野狼（prop:wolf，朝左面向房子）；吹氣那張的風畫在圖的左邊、本體偏右，同一個 x swap 時身體會往左探一點，剛好像往前湊過去吹，就不另外對 x（移 x 會拖出殘影） */
const WS = 46
const WY = 77 - 0.42 * WS
const WX = 118
/** 頭暈退到右邊（國字回中央那一秒讓開：左緣約 x 119） */
const WX_REST = 134
/** 語詞那一刻嚎叫的地方（國字讓位在上方正中，右邊一點才不會疊到字） */
const WX_HOWL = 116

/** 字框讓位的地方（國字中心） */
const FRAME: Vec = { x: 72, y: 24 }

/** 風線：白色＋藍灰描邊，淺色天空上看得清楚 */
const WIND = '#FFFFFF'
const EDGE = '#4A6A8A'
/** 大野狼吹出來的風跟磚頭被打到的那一排（房子的高度，人在屋頂上、風線從腳下掃過） */
const ROWS = [61, 53, 69, 47, 57, 65, 50]

/**
 * 一大排風線：從 x0 掃到 x1（往左或往右），每一排是一串短線一段接一段冒出來。掛在看不見的錨 air（在 0,0）上，dx／dy 就是舞台座標。
 */
function windLines(at: number, rows: number, width: number, x0: number, x1: number, steps = 7): Fx[] {
  const out: Fx[] = []
  const dir = Math.sign(x1 - x0)
  const stepLen = Math.abs(x1 - x0) / steps
  for (let r = 0; r < rows; r++) {
    const y = ROWS[r]
    const L = 13 + (r % 2) * 5
    for (let j = 0; j < steps; j++) {
      const xa = x0 + dir * (j * stepLen + (r % 3) * 3)
      const t = at + j * 0.05 + (r % 3) * 0.03
      const base = { at: t, dur: 0.26, kind: 'line' as const, actor: 'air', dx: xa, dy: y, to: { x: xa + dir * L, y: y + 0.5 } }
      out.push({ ...base, color: EDGE, width: width + 0.5 })
      out.push({ ...base, color: WIND, width })
    }
  }
  return out
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個動作「呼——！」：大野狼仰頭深吸一口氣（換 howl、身體脹大）→ 換鼓腮幫子的圖、一大排風線往左掃過房子＋鏡頭震＋同一個音效。
 * at 是吹出去那一刻，breath 是吸氣多久，long 是吹多久（風線一波接一波），k 越大風越粗、排越多、脹得越大。
 */
function huff(at: number, k: number, breath: number, long: number): Gag {
  const puff = 1.06 + 0.05 * k
  const moves: Move[] = [
    { at: at - breath, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-howl' },
    { at: at - breath, actor: 'wolf', do: 'scaleTo', amount: puff, dur: breath, ease: 'out' },
    { at, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-blow' },
    { at, actor: 'wolf', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: at + long, actor: 'wolf', do: 'swap', emoji: 'prop:wolf' },
    { at: at + long, actor: 'wolf', do: 'scaleTo', amount: 1 / puff, dur: 0.2 },
  ]
  const fx: Fx[] = []
  const waves = Math.max(1, Math.round(long / 0.35))
  for (let w = 0; w < waves; w++) fx.push(...windLines(at + w * 0.33, 3 + k, 1.2 + 0.25 * k, 100, 30))
  const camera: Camera[] = [{ at, dur: Math.min(long, 0.35 + 0.1 * k), do: 'shake', amount: 0.7 + 0.35 * k }]
  const cues: Cue[] = [{ at: at - breath, sfx: 'gulp' }, { at, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.08, sfx: 'slide' })
  if (k >= 2) cues.push({ at: at + 0.35, sfx: 'whoosh' })
  return { moves, fx, camera, cues }
}

/** 「啵」地蓋好第 k 間房子：他雙手一舉、一團煙，房子冒出來；接著跳上屋頂、對大野狼偷笑 */
function build(at: number, k: number, pose = 'giggle'): Move[] {
  const moves: Move[] = [
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: at + 0.02, actor: 'house', do: 'swap', emoji: HOUSES[k] },
    { at: at + 0.03, actor: 'house', do: 'moveTo', to: { x: HX, y: HY }, dur: 0.01 },
    { at: at + 0.05, actor: 'house', do: 'pop', dur: 0.2 },
    { at: at + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: at + 0.3, actor: 'jerry', do: 'moveTo', to: ROOF[k], arc: 8, dur: 0.28 },
    { at: at + 0.58, actor: 'jerry', do: 'swap', emoji: `hero:jerry/${pose}` },
  ]
  // 放大縮小寫在 pop 出場之後（pop 會把大小重設回底子）
  if (SIZES[k] !== HS) moves.splice(4, 0, { at: at + 0.05, actor: 'house', do: 'scaleTo', amount: SIZES[k] / HS, dur: 0.01 })
  return moves
}

/** 房子被吹走：往上轉著圈飛出畫面（看得到飛一段），他傻眼停在半空一下，再摔到地上 */
function blownAway(at: number, k: number, land: string): Move[] {
  const peak = ROOF[k]
  return [
    { at, actor: 'house', do: 'moveTo', to: { x: -6, y: -40 }, dur: 0.75, ease: 'linear' },
    { at, actor: 'house', do: 'rotateTo', amount: -420, dur: 0.6 },
    { at: at + 0.77, actor: 'house', do: 'vanish', dur: 0.01 },
    { at: at + 0.78, actor: 'house', do: 'rotateTo', amount: 420, dur: 0.01 },
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at, actor: 'jerry', do: 'moveTo', to: { x: peak.x - 3, y: peak.y - 2 }, dur: 0.14, ease: 'out' },
    { at: at + 0.18, actor: 'jerry', do: 'moveTo', to: { x: HX - 2, y: JY }, dur: 0.2, ease: 'in' },
    { at: at + 0.38, actor: 'jerry', do: 'swap', emoji: `hero:jerry/${land}` },
  ]
}

// 開場：草屋已經蓋好，他站在屋頂上；大野狼從右邊走進來
const WOLF_IN = 0.65
// 第 1 次：草屋一吹就飛走
const B1 = 1.55
const g1 = huff(B1, 0, 0.4, 0.4)
// 第 2 次：木頭房子，吹一口只晃一下，再吹一口才飛走
const R2 = B1 + 0.85
const B2a = R2 + 0.85
const B2 = B2a + 0.45
const g2a = huff(B2a, 0, 0.3, 0.25)
const g2 = huff(B2, 1, 0.2, 0.45)
// 第 3 次前停一拍：托著下巴想一想，蓋磚頭
const PONDER = B2 + 0.55
const R3 = PONDER + 0.4
/** 第 3 次：吸最大一口氣、吹最久，磚頭動都不動 */
const B3 = R3 + 1.05
const LONG3 = 0.9
const g3 = huff(B3, 2, 0.55, LONG3)
/** 吹到臉紅、頭暈，搖搖晃晃退到右邊 */
const GIVE_UP = B3 + LONG3
/** 國字回中央 */
const HOME = GIVE_UP + 0.4
const PARK = HOME + 0.9
/** 語詞那一刻：大野狼走到中間仰頭一嚎 */
const HOWL = PARK + 0.35
// 回馬槍（第 4 次）：脹到最大、使出全力，風撞上磚頭彈回來把自己吹飛
const B4 = HOWL + 1.2
const BOUNCE = B4 + 0.3
const FLY = BOUNCE + 0.12
/** 他跳下來、把磚頭收掉 */
const DOWN = FLY + 0.6
/** 問他 */
const ASK = DOWN + 0.35
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（左前方，國字稍微讓到右邊） */
const ASK_AT: Vec = { x: 36, y: JY + 4 }

/** 臉紅：一次比一次紅 */
const RED = ['sepia(.45) saturate(2) hue-rotate(-55deg)', 'sepia(.7) saturate(3) hue-rotate(-60deg)']

const builds: Build[] = [
  // 第 1 次：犭從大野狼身上跳出來
  { at: B1 + 0.1, dur: 0.55, strokes: [0, 1, 2], from: 'wolf', color: partColor('犭') },
  // 第 2 次：良的上半（一點＋上面的框）從被吹走的木頭房子上飛出來
  { at: B2 + 0.1, dur: 0.55, strokes: [3, 4, 5, 6], from: 'house', color: partColor('良') },
  // 第 3 次：良的下半從被風打到的磚頭上彈出來
  { at: B3 + 0.3, dur: 0.5, strokes: [7, 8, 9], from: 'house', color: partColor('良') },
]

const clip: Clip = {
  format: 2,
  char: '狼',
  meta: { theme: '大野狼吹房子', cast: '小骷髏＋大野狼＋房子（草屋、木頭房子、磚頭）', gags: ['大野狼每次仰頭深吸一口氣、鼓起腮幫子「呼——！」，一大排白色風線把小骷髏站著的房子吹走，一次比一次難吹（草屋一吹就飛→木頭房子吹兩口才飛→磚頭吹到臉紅頭暈都不動）；回馬槍是大野狼使出全力吹，風撞上磚頭彈回來，把大野狼自己吹飛'] },
  duration: 15,
  bg: { top: '#A9DCF5', bottom: '#E6F6FD', floor: '#A8D08A', scenery: 'forest' },
  actors: [
    // 看不見的錨：風線都掛在它身上
    { id: 'air', emoji: '⭐', x: 0, y: 0, size: 10, hidden: true },
    { id: 'house', emoji: HOUSES[0], x: HX, y: HY, size: HS },
    { id: 'wolf', emoji: 'prop:wolf', x: WX, y: WY, size: WS },
    { id: 'jerry', emoji: 'hero:jerry/giggle', x: ROOF[0].x, y: ROOF[0].y, size: JS, flip: true },
  ],
  moves: [
    { at: -0.02, actor: 'house', do: 'scaleTo', amount: SIZES[0] / HS, dur: 0.01 },
    // 大野狼從右邊走進來，叉腰壞笑；他在屋頂上偷笑
    { at: 0, actor: 'wolf', do: 'enter', from: { x: 185, y: WY }, dur: WOLF_IN },
    { at: WOLF_IN, actor: 'wolf', do: 'hop', amount: 2, dur: 0.25 },
    { at: 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: 0.95, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },
    // 第 1 次：草屋一吹就飛走，他摔下來跌坐
    ...g1.moves,
    ...blownAway(B1 + 0.05, 0, 'fall'),
    // 第 2 次：「啵」地蓋一間木頭房子
    ...build(R2, 1),
    ...g2a.moves,
    // 第一口：房子晃一下、沒倒，他在屋頂上晃一晃
    { at: B2a + 0.05, actor: 'house', do: 'tilt', amount: -9, dur: 0.35 },
    { at: B2a + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: B2a + 0.05, actor: 'jerry', do: 'tilt', amount: -10, dur: 0.35 },
    { at: B2a + 0.35, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },
    ...g2.moves,
    // 第二口：房子飛走，他摔下來趴扁
    ...blownAway(B2 + 0.05, 1, 'flat'),
    // 第 3 次前停一拍：爬起來托著下巴想一想……蓋一座磚頭
    { at: PONDER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/ponder' },
    { at: PONDER + 0.1, actor: 'jerry', do: 'tilt', amount: 8, dur: 0.3 },
    ...build(R3, 2, 'smug'),
    ...g3.moves,
    // 磚頭動都不動（只抖一下），大野狼越吹臉越紅
    { at: B3 + 0.1, actor: 'house', do: 'shake', amount: 0.25, dur: 0.6 },
    { at: B3 + 0.3, actor: 'wolf', do: 'tint', filter: RED[0] },
    { at: B3 + 0.65, actor: 'wolf', do: 'tint', filter: RED[1] },
    { at: B3 + 0.2, actor: 'wolf', do: 'shake', amount: 0.8, dur: LONG3 - 0.2 },
    { at: B3 + 0.45, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },
    // 吹不動，頭暈眼花，搖搖晃晃退到右邊
    { at: GIVE_UP + 0.02, actor: 'wolf', do: 'moveTo', to: { x: WX_REST, y: WY }, dur: 0.35, ease: 'out' },
    { at: GIVE_UP + 0.02, actor: 'wolf', do: 'tilt', amount: 10, dur: 0.6 },
    // 語詞那一刻：大野狼不服氣，走到中間、仰頭一嚎（變大）
    { at: PARK, actor: 'wolf', do: 'tint', filter: '' },
    { at: PARK, actor: 'wolf', do: 'moveTo', to: { x: WX_HOWL, y: WY }, dur: 0.35 },
    { at: HOWL, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-howl' },
    { at: HOWL, actor: 'wolf', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: HOWL, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: HOWL + 0.8, actor: 'wolf', do: 'swap', emoji: 'prop:wolf' },
    { at: HOWL + 0.8, actor: 'wolf', do: 'scaleTo', amount: 1 / 1.12, dur: 0.25 },
    { at: HOWL + 0.8, actor: 'wolf', do: 'moveTo', to: { x: WX, y: WY }, dur: 0.3 },
    { at: HOWL + 0.9, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    // 回馬槍：脹到最大……「呼——！！」
    { at: B4 - 0.6, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-howl' },
    { at: B4 - 0.6, actor: 'wolf', do: 'scaleTo', amount: 1.22, dur: 0.6, ease: 'out' },
    { at: B4, actor: 'wolf', do: 'swap', emoji: 'prop:wolf-blow' },
    { at: B4 + 0.1, actor: 'house', do: 'shake', amount: 0.3, dur: 0.25 },
    // 風撞上磚頭彈回來，把大野狼自己轉著圈吹飛出畫面
    { at: FLY, actor: 'wolf', do: 'moveTo', to: { x: 205, y: 8 }, dur: 0.6, ease: 'in' },
    { at: FLY, actor: 'wolf', do: 'rotateTo', amount: 540, dur: 0.6 },
    { at: FLY, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: FLY + 0.05, actor: 'jerry', do: 'hop', amount: 5, dur: 0.3 },
    // 他跳下來、雙手一舉把磚頭「啵」地收掉
    { at: DOWN, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: DOWN, actor: 'jerry', do: 'moveTo', to: { x: ASK_AT.x, y: JY }, arc: 6, dur: 0.25 },
    { at: DOWN + 0.18, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: DOWN + 0.2, actor: 'house', do: 'vanish', dur: 0.12 },
    // 問他：轉向國字、變大
    { at: ASK + 0.15, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.15, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.15, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.27, actor: 'jerry', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'jerry', do: 'moveTo', to: { x: -45, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds,
  glyph: [
    // 字框一開始就讓到上方稍微偏左（右上角有一朵雲，字框背後留素色的天空）
    { at: 0, dur: 0.01, do: 'park', to: FRAME },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    { at: B1 + 0.6, kind: 'sweat', actor: 'jerry' },
    ...g2a.fx,
    ...g2.fx,
    { at: B2 + 0.6, kind: 'dizzy', actor: 'jerry', dur: 0.6 },
    { at: R2 + 0.05, kind: 'puff', actor: 'house', dur: 0.45, scale: 1.6 },
    { at: R3 + 0.05, kind: 'puff', actor: 'house', dur: 0.45, scale: 1.9 },
    { at: PONDER + 0.1, kind: 'sweat', actor: 'jerry', dx: -8 },
    ...g3.fx,
    { at: GIVE_UP + 0.1, kind: 'dizzy', actor: 'wolf', dur: 0.9 },
    { at: GIVE_UP + 0.1, kind: 'sweat', actor: 'wolf', dx: 6 },
    // 回馬槍：最粗的一排風線往左吹到磚頭……撞上去整個彈回來往右
    ...windLines(B4, 6, 2.0, 100, 30, 6),
    { at: BOUNCE - 0.02, kind: 'burst', x: 44, y: 58, emoji: '💥', n: 1, dur: 0.35, scale: 1.8 },
    ...windLines(BOUNCE, 6, 2.0, 40, 150, 7),
    ...windLines(BOUNCE + 0.3, 4, 1.7, 40, 150, 7),
    { at: FLY + 0.1, kind: 'burst', actor: 'jerry', emoji: '✨', n: 6, dur: 0.5 },
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把飛走的房子、風線、大野狼切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2a.camera,
    ...g2.camera,
    ...g3.camera,
    { at: B4, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: BOUNCE, dur: 0.45, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.75, say: '狼' },
    ...g1.cues,
    { at: B1 + 0.45, sfx: 'plop' },
    { at: R2, sfx: 'poof' },
    ...g2a.cues,
    ...g2.cues,
    { at: B2 + 0.45, sfx: 'plop' },
    { at: R3, sfx: 'poof' },
    { at: R3 + 0.05, sfx: 'bonk' },
    ...g3.cues,
    { at: HOME + 0.2, say: '狼' },
    { at: HOWL + 0.05, say: '大野狼' },
    { at: B4 - 0.6, sfx: 'gulp' },
    { at: B4, sfx: 'whoosh' },
    { at: BOUNCE, sfx: 'boing' },
    { at: BOUNCE + 0.05, sfx: 'whoosh' },
    { at: FLY + 0.1, sfx: 'slide' },
    { at: DOWN + 0.2, sfx: 'poof' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '狼' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
