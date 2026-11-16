import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 冰（v2）：大熱天，小骷髏熱到吐舌頭搧風——每次跳上大冰塊、一屁股坐下去「啊～好涼」，停一下——
// 「嘶——！」屁股被冰到，他整個人變藍、抱著發抖，從冰塊上彈起來，一次比一次高、一次比一次藍：
// 彈一下落到旁邊（冰塊被坐得噴出兩顆碎冰：冫）→ 彈到天上（冰水濺起來：水的左半）→
// 先停一拍：他托著下巴看冰塊、又熱得搧風——還是坐上去，這次直接被彈出畫面頂端（水的右半）。
// 國字回中央時他還在天上；國字讓位後他才「咚」地掉回來，一屁股跌坐在地上，指著冰塊：「冰塊」。
// 回馬槍（第四次）：他學乖了，慢慢坐上去、閉眼得意（這次沒事？）——停最久——「嘶——！！」最大的一次，
// 而且這次冰塊凍住、黏在他屁股上，連冰塊一起彈上天，落下來坐著冰塊「咻——」滑出畫面。
// 最後畫面暗下來只剩「冰」，小骷髏走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「冰！」，然後退場只留字。
// 刻意不跟「冷」（抱冰塊被凍成一塊冰、冰殼裂開）、「雪」（被雪埋住）撞：這支演的是「冰冰的東西一碰就『嘶』地彈起來」，
// 冰塊本身每一格都在、從頭到尾沒有被包住或碎掉；被凍住只在回馬槍出現一次（冰塊黏在屁股上）。
// 冰、冰、冰塊、這是什麼字？、冰

/** 小骷髏（hero:jerry；圖朝左，flip 朝右看冰塊） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 大冰塊（prop:ice）：右邊、畫面上最大的東西；國字回中央那一秒也不會疊到字（左緣約 x 114） */
const IS = 36
const ICE: Vec = { x: 131, y: 77 - 0.42 * IS }
/** 坐在冰塊上（腳底＝屁股在冰塊頂面） */
const SIT: Vec = { x: 128, y: 48 - 0.42 * JS }
/** 每次都站在同一個地方（冰塊左邊），彈起來也落回這裡 */
const STAND: Vec = { x: 97, y: JY }
/** 彈多高（第 3 次直接彈出畫面頂端） */
const LAUNCH = [9, 15, 110]
/** 往上彈多久 */
const UP = [0.28, 0.34, 0.5]
/** 被冰到變藍：一次比一次藍（他一身黑，白色的骨頭、臉變藍） */
const BLUE = [
  'sepia(.6) saturate(2.5) hue-rotate(165deg)',
  'sepia(.85) saturate(3.5) hue-rotate(165deg)',
  'sepia(1) saturate(4.5) hue-rotate(165deg)',
  'sepia(1) saturate(5.5) hue-rotate(165deg) brightness(1.05)',
]
/** 傻眼停在半空多久 */
const HANG = 0.16
/** 落回地上多久 */
const DOWN = 0.28

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; land: number }

/** 跳上冰塊、一屁股坐下去「啊～好涼」（at 是坐下去那一刻） */
function sitDown(at: number, pose = 'full'): Move[] {
  return [
    { at: at - 0.28, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: at - 0.28, actor: 'jerry', do: 'moveTo', to: SIT, arc: 7, dur: 0.28 },
    { at, actor: 'jerry', do: 'swap', emoji: `hero:jerry/${pose}` },
    { at, actor: 'ice', do: 'squash', amount: 0.08, dur: 0.2 },
  ]
}

/**
 * 同一個笑點「嘶——！」：坐著的冰塊一抖（預備）→ 屁股被冰到，傻眼、整個人變藍、從冰塊上彈起來（surprised 停在半空看得見臉），
 * 屁股那裡噴一圈 ❄️（一次比一次大）＋鏡頭推一下＋震＋同一個音效（一次多疊一個音）；落回原地抱著發抖（cold）。
 * k 是第幾次（0～2），第 3 次彈出畫面頂端、不落回來（國字回中央時他不在場）。
 */
function zing(at: number, k: number): Gag {
  const peak: Vec = { x: SIT.x, y: SIT.y - LAUNCH[k] }
  const down = at + 0.04 + UP[k] + HANG
  const land = down + DOWN
  const moves: Move[] = [
    // 預備：冰塊抖一下
    { at: at - 0.18, actor: 'ice', do: 'shake', amount: 0.6 + 0.2 * k, dur: 0.16 },
    // 嘶——！
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at, actor: 'jerry', do: 'tint', filter: BLUE[k] },
    { at, actor: 'jerry', do: 'squash', amount: -0.2, dur: 0.14 },
    { at, actor: 'ice', do: 'squash', amount: 0.12 + 0.04 * k, dur: 0.22 },
    { at: at + 0.04, actor: 'jerry', do: 'moveTo', to: peak, dur: UP[k], ease: k < 2 ? 'out' : 'in' },
  ]
  if (k < 2) moves.push(
    { at: down, actor: 'jerry', do: 'moveTo', to: STAND, dur: DOWN, ease: 'in' },
    { at: land, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/cold' },
    { at: land, actor: 'jerry', do: 'shake', amount: 0.8 + 0.5 * k, dur: 0.4 },
  )
  const fx: Fx[] = [
    // 屁股那裡噴一圈雪花，一次比一次大
    { at, kind: 'burst', x: SIT.x - 6, y: SIT.y + 14, emoji: '❄️', n: 7 + k, dur: 0.45, scale: 1.3 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: 105, y: 45 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效（叮＋彈），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'clink' }, { at: at + 0.04, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.07, sfx: 'crack' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'whoosh' })
  if (k < 2) cues.push({ at: land, sfx: 'plop' })
  return { moves, fx, camera, cues, land }
}

/** 抖完回過神來：又熱得吐舌頭搧風（變回原來的顏色） */
function hotAgain(at: number): Move[] {
  return [
    { at, actor: 'jerry', do: 'tint', filter: '' },
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/hot' },
  ]
}

// 第 1 次
const S1 = 1.35
const H1 = S1 + 0.36
const g1 = zing(H1, 0)
// 第 2 次
const HOT2 = g1.land + 0.32
const S2 = HOT2 + 0.35
const H2 = S2 + 0.36
const g2 = zing(H2, 1)
// 第 3 次前停一拍：托著下巴看冰塊……又熱得搧風，還是坐上去
const PONDER = g2.land + 0.32
const HOT3 = PONDER + 0.45
const S3 = HOT3 + 0.35
const H3 = S3 + 0.42
const g3 = zing(H3, 2)
/** 字框填滿、國字到正中央（他還在天上） */
const HOME = H3 + 0.55
const PARK = HOME + 1.0
/** 國字讓位後，他從天上掉回來 */
const FALL = PARK + 0.2
const THUD = FALL + 0.25
/** 語詞那一刻：站起來指著冰塊 */
const WORD = THUD + 0.3
// 回馬槍（第 4 次）：慢慢坐上去、閉眼得意，停最久
const S4 = WORD + 0.75
const H4 = S4 + 0.55
/** 連冰塊一起彈上天、落回地上，冰塊從屁股底下「咻」地滑出畫面，他一屁股跌坐 */
const PEAK4 = H4 + 0.36
const LAND4 = PEAK4 + 0.3
const SLIDE4 = LAND4 + 0.15
/** 問他 */
const ASK = SLIDE4 + 0.55
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }

/** 冰塊跟著他飛（凍住黏在屁股上）：冰塊中心跟他腳底的距離不變 */
const stuck = (p: Vec): Vec => ({ x: p.x + (ICE.x - SIT.x), y: p.y + (ICE.y - SIT.y) })

const builds: Build[] = [
  // 坐下去被冰到那一下，碎冰從冰塊噴出來：冫
  { at: H1 + 0.08, dur: 0.5, strokes: [0, 1], from: 'ice', color: partColor('冫') },
  // 冰水濺起來：水的左半（豎鉤＋左邊）
  { at: H2 + 0.08, dur: 0.5, strokes: [2, 3], from: 'ice', color: partColor('水') },
  // 水的右半
  { at: H3 + 0.08, dur: 0.45, strokes: [4, 5], from: 'ice', color: partColor('水') },
]

const clip: Clip = {
  format: 2,
  char: '冰',
  meta: { theme: '大熱天坐冰塊', cast: '小骷髏＋大冰塊', gags: ['大熱天小骷髏每次跳上大冰塊一屁股坐下去，停一下就「嘶——！」被冰到、整個人變藍彈起來，一次比一次高（彈一下→彈到天上→彈出畫面）；回馬槍是他慢慢坐、閉眼得意以為沒事，結果最大的一次「嘶」，冰塊還凍住黏在屁股上，連冰塊一起彈上天、坐著冰塊滑出畫面'] },
  duration: 15,
  bg: { top: '#FFE08A', bottom: '#FFF6D6', floor: '#E8C98E', scenery: 'hills' },
  actors: [
    { id: 'ice', emoji: 'prop:ice', x: ICE.x, y: ICE.y, size: IS },
    // 開場從左邊熱得搧風走進來
    { id: 'jerry', emoji: 'hero:jerry/hot', x: STAND.x, y: STAND.y, size: JS, flip: true },
  ],
  moves: [
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.6 },
    // 看到字框：冰！（指著上面），再看冰塊眼睛發亮
    { at: 0.65, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/drool' },
    // 第 1 次
    ...sitDown(S1),
    ...g1.moves,
    // 第 2 次
    ...hotAgain(HOT2),
    ...sitDown(S2),
    ...g2.moves,
    // 第 3 次前停一拍：托著下巴看冰塊
    { at: PONDER, actor: 'jerry', do: 'tint', filter: '' },
    { at: PONDER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/ponder' },
    { at: PONDER + 0.1, actor: 'jerry', do: 'tilt', amount: 8, dur: 0.35 },
    ...hotAgain(HOT3),
    ...sitDown(S3),
    ...g3.moves,
    // 國字讓位後，「咚」地掉回來、一屁股跌坐（還是藍的）
    { at: FALL - 0.01, actor: 'jerry', do: 'moveTo', to: { x: STAND.x, y: -30 }, dur: 0.01 },
    { at: FALL, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: FALL, actor: 'jerry', do: 'moveTo', to: STAND, dur: THUD - FALL, ease: 'in' },
    // 語詞：站起來指著冰塊——冰塊
    { at: WORD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: WORD, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
    { at: WORD, actor: 'ice', do: 'flash', dur: 0.4 },
    { at: WORD, actor: 'ice', do: 'squash', amount: -0.08, dur: 0.3 },
    // 回馬槍：慢慢坐上去、閉眼得意（這次沒事？）
    ...hotAgain(WORD + 0.5),
    ...sitDown(S4),
    { at: S4 + 0.3, actor: 'jerry', do: 'tilt', amount: -6, dur: 0.3 },
    // 嘶——！！最大的一次：冰塊凍住黏在屁股上，一起彈上天
    { at: H4 - 0.2, actor: 'ice', do: 'shake', amount: 1.4, dur: 0.18 },
    { at: H4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: H4, actor: 'jerry', do: 'tint', filter: BLUE[3] },
    { at: H4, actor: 'jerry', do: 'squash', amount: -0.22, dur: 0.14 },
    { at: H4, actor: 'jerry', do: 'moveTo', to: { x: 132, y: SIT.y - 12 }, dur: PEAK4 - H4, ease: 'out' },
    { at: H4, actor: 'ice', do: 'moveTo', to: stuck({ x: 132, y: SIT.y - 12 }), dur: PEAK4 - H4, ease: 'out' },
    // 連冰塊一起落回地上
    { at: PEAK4, actor: 'jerry', do: 'moveTo', to: { x: 138, y: SIT.y }, dur: LAND4 - PEAK4, ease: 'in' },
    { at: PEAK4, actor: 'ice', do: 'moveTo', to: stuck({ x: 138, y: SIT.y }), dur: LAND4 - PEAK4, ease: 'in' },
    // 冰塊滑溜溜，「咻——」從他屁股底下滑出畫面，他一屁股跌坐在地上
    { at: SLIDE4, actor: 'ice', do: 'moveTo', to: stuck({ x: 230, y: SIT.y }), dur: 0.4, ease: 'in' },
    { at: SLIDE4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: SLIDE4, actor: 'jerry', do: 'moveTo', to: { x: ASK_AT.x, y: JY }, dur: 0.2, ease: 'in' },
    // 問他：站起來（不藍了）、轉向國字、變大
    { at: ASK + 0.25, actor: 'jerry', do: 'tint', filter: '' },
    { at: ASK + 0.25, actor: 'jerry', do: 'flip' },
    { at: ASK + 0.25, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.25, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.25, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
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
  builds,
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: PONDER + 0.1, kind: 'sweat', actor: 'jerry', dx: -8 },
    ...g3.fx,
    // 語詞：冰塊亮晶晶
    { at: WORD, kind: 'burst', x: ICE.x, y: ICE.y - 4, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
    // 回馬槍：最大的一圈雪花
    { at: H4, kind: 'burst', x: SIT.x - 8, y: SIT.y + 14, emoji: '❄️', n: 10, dur: 0.5, scale: 1.8 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把冰塊、彈上去的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 85, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: THUD, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 115, y: 55 } },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.06, to: { x: 105, y: 45 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '冰' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '冰' },
    { at: THUD, sfx: 'bonk' },
    { at: WORD, say: '冰塊' },
    { at: H4, sfx: 'clink' },
    { at: H4 + 0.04, sfx: 'boing' },
    { at: H4 + 0.07, sfx: 'crack' },
    { at: H4 + 0.1, sfx: 'whoosh' },
    { at: LAND4, sfx: 'bonk' },
    { at: SLIDE4, sfx: 'slide' },
    { at: SLIDE4 + 0.2, sfx: 'plop' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '冰' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
