import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 書（v2）：一本大書立在畫面中間。忍者小老鼠每次伸手一翻開——「啵！」書裡的東西整隻跳出來，把他嚇一跳，一次比一次大、一次比一次誇張：
// 青蛙（愣住；青蛙跳走，他「啪」地把書闔上，聿的上半從書頁飛上去）→ 大熊（吼！往後跳開；熊縮回書裡，他衝過去闔上，聿的下半）→
// 先停一拍：書自己抖起來，他踮腳偷偷靠近、蹲低偷看——比畫面還高的恐龍（嚇得往後跳、一屁股跌坐；恐龍縮回去，書「砰」地闔上彈到旁邊，曰）。
// 語詞：書跳回中間、攤開變最大，他指著——故事書。回馬槍：他把書闔上、鼓起勇氣再翻開——什麼都沒跳出來，他湊近看……
// 整隻被書「咻」地吸進去，書闔上，書封上多了一隻小小的他在揮手。
// 最後畫面暗下來只剩「書」，他從書裡跳出來問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「書！」，然後退場只留字。
// 書、書、故事書、這是什麼字？、書
const M = 32
/** 小老鼠站在地上的 y */
const P = 77 - 0.42 * M
/** 他平常站的地方、伸手翻書時站的地方（都在書的左邊、面向右邊的書） */
const STAND = 46
const NEAR = 63
/** 書：畫面中間、大 */
const BX = 94
const BOOK = 46
const BY = 77 - 0.42 * BOOK
/** 書被恐龍震到旁邊、問他之前退場的位置 */
const BSIDE = 132
/** 字框在左上：書在中間、東西從書的正上方跳出來，不經過字框 */
const FRAME = { x: 37, y: 21.5 }
/** 跳出來的東西腳底在書頁裡（畫在書後面，下半身被書擋住＝從書裡冒出來） */
const FEET = 54
/** 自製道具圖的內容底部在畫布的 0.961：腳底在 feet 時的 y */
const propY = (feet: number, size: number) => feet - 0.461 * size
/** 跳出來的東西：青蛙、大熊、恐龍（一次比一次大） */
const FROG = 30
const BEAR = 56
const DINO = 62
const dinoY = (feet: number) => feet + 4 - 0.42 * DINO
/** 跳出來以後他傻眼停多久 */
const HOLD = 0.45

/**
 * 翻開書：他走到書旁邊、伸手（reach，看得到的預備；書抖一下）→ 書換成打開的 → 那一格鏡頭推近書頁＋震＋同一個「啵」（一次比一次多疊一個音）＋書頁冒亮光。
 * pop 是從書裡跳出來的東西（id、size、腳底），沒有就是什麼都沒跳出來（回馬槍）。at 是翻開那一刻、k 是第幾次。
 */
function open(at: number, k: number, pop?: { id: string; size: number; y: (feet: number) => number }) {
  const moves: Move[] = [
    { at: at - 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: at - 0.6, actor: 'mouse', do: 'moveTo', to: { x: NEAR, y: P }, dur: 0.22 },
    { at: at - 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: at - 0.3, actor: 'book', do: 'shake', amount: 0.5 + 0.2 * k, dur: 0.25 },
    { at, actor: 'book', do: 'swap', emoji: '📖' },
  ]
  const fx: Fx[] = []
  const camera: Camera[] = []
  const lights: Light[] = []
  const cues: Cue[] = []
  if (pop) {
    moves.push(
      // 啵！從書頁裡冒上來（pop 從小放大＋往上一冒）
      { at: at - 0.03, actor: pop.id, do: 'moveTo', to: { x: BX, y: pop.y(FEET + 8) }, dur: 0.01 },
      { at, actor: pop.id, do: 'pop', dur: 0.24 },
      { at, actor: pop.id, do: 'moveTo', to: { x: BX, y: pop.y(FEET) }, dur: 0.18, ease: 'back' },
      // 他同一刻傻眼
      { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at, actor: 'mouse', do: 'squash', amount: Math.min(0.32, 0.22 + 0.05 * k), dur: 0.22 },
      { at: at + 0.12, actor: 'mouse', do: 'shake', amount: 0.6 + 0.3 * k, dur: HOLD - 0.12 },
    )
    fx.push(
      { at, kind: 'burst', actor: 'book', dy: 6, emoji: '✨', n: 6 + k, dur: 0.4, scale: 1.1 + 0.15 * k },
      { at: at + 0.03, kind: 'pop', actor: 'mouse', emoji: '❗', dx: 4, dur: HOLD, scale: 1.3 + 0.2 * k },
    )
    camera.push(
      { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: 74, y: FEET - 8 } },
      { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
    )
    lights.push({ at, dur: 0.04, level: -0.12 - 0.04 * k }, { at: at + 0.04, dur: 0.25, level: 0 })
    cues.push({ at, sfx: 'plop' })
    if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
    if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  } else {
    // 什麼都沒跳出來：書頁只冒一點點亮光
    fx.push({ at, kind: 'burst', actor: 'book', dy: 6, emoji: '✨', n: 3, dur: 0.35 })
    cues.push({ at, sfx: 'tap' })
  }
  return { moves, fx, camera, lights, cues }
}

/** 他衝到書旁邊、「啪」地把書闔上 */
const slam = (at: number, from = NEAR): Move[] => [
  ...(from !== NEAR ? [
    { at: at - 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: at - 0.2, actor: 'mouse', do: 'moveTo', to: { x: NEAR, y: P }, dur: 0.18, ease: 'out' },
  ] as Move[] : []),
  { at: at - 0.02, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/push' },
  { at, actor: 'book', do: 'swap', emoji: '📘' },
  { at, actor: 'book', do: 'squash', amount: 0.15, dur: 0.2 },
]

/** 縮回書裡（以腳底縮小、往下沉，最後不見） */
const shrinkIn = (at: number, id: string, y: number): Move[] => [
  { at, actor: id, do: 'scaleTo', amount: 0.12, dur: 0.22, ease: 'in' },
  { at, actor: id, do: 'moveTo', to: { x: BX, y }, dur: 0.22, ease: 'in' },
  { at: at + 0.22, actor: id, do: 'vanish', dur: 0.01 },
]

const H1 = 1.7, H2 = 3.5, H3 = 5.85, H4 = 9.3
const o1 = open(H1, 0, { id: 'frog', size: FROG, y: (f) => propY(f, FROG) })
const o2 = open(H2, 1, { id: 'bear', size: BEAR, y: (f) => propY(f, BEAR) })
const o3 = open(H3, 2, { id: 'dino', size: DINO, y: dinoY })
const o4 = open(H4, 3)
/** 國字拼好、放大到正中央 */
const HOME = 6.95
const PARK = 7.85
/** 語詞那一刻：書跳回中間攤開變最大 */
const WORD = 8.1
const BIG = 1.3
/** 回馬槍：被吸進去 */
const SUCK = 9.95
/** 問他 */
const ASK = 10.9
const ANSWER = 13.6
/** 書封上的小小的他（腳底在書封下半） */
const MINI = 0.45
const COVER_FEET = BY + 10

const clip: Clip = {
  format: 2,
  char: '書',
  meta: { theme: '小老鼠翻開書，書裡的東西整隻跳出來', cast: '小老鼠＋大書＋青蛙／大熊／恐龍', gags: ['小老鼠每次伸手翻開大書，「啵！」書裡的東西就整隻跳出來把他嚇一跳，一次比一次大（青蛙愣住→大熊往後跳→比畫面還高的恐龍嚇到跌坐），他「啪」地把書闔上；回馬槍是他鼓起勇氣再翻開，什麼都沒跳出來，他湊近看，整隻被書「咻」地吸進去，書封上多了一隻小小的他'] },
  duration: 15,
  bg: { top: '#FFF1D6', bottom: '#FFF8EA', floor: '#E8C99A', scenery: 'room' },
  actors: [
    // 跳出來的東西畫在書後面：下半身被書頁擋住＝從書裡冒出來
    { id: 'frog', emoji: 'prop:frog', x: BX, y: propY(FEET, FROG), size: FROG, hidden: true },
    { id: 'bear', emoji: 'prop:bear-roar', x: BX, y: propY(FEET, BEAR), size: BEAR, hidden: true },
    { id: 'dino', emoji: '🦖', x: BX, y: dinoY(FEET), size: DINO, hidden: true },
    { id: 'book', emoji: '📘', x: BX, y: BY, size: BOOK },
    // 新的小老鼠圖朝左，翻過來朝右：面向書
    { id: 'mouse', emoji: 'hero:mouse/dash', x: STAND, y: P, size: M, hidden: true, flip: true },
  ],
  moves: [
    // 小老鼠咻地衝進來，轉頭指著左上的字框：書！再轉回來看著書
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.35, ease: 'out' },
    { at: 0.4, actor: 'mouse', do: 'flip' },
    { at: 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 1.0, actor: 'mouse', do: 'flip' },
    { at: 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 第 1 次：青蛙——啵！愣住；青蛙呱地跳走，他啪地闔上
    ...o1.moves,
    { at: H1 + 0.55, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: H1 + 0.55, actor: 'frog', do: 'moveTo', to: { x: 185, y: 20 }, arc: 12, dur: 0.45, ease: 'in' },
    ...slam(H1 + 1.0),
    { at: H1 + 1.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: H1 + 1.3, actor: 'mouse', do: 'moveTo', to: { x: STAND, y: P }, dur: 0.25 },
    // 第 2 次：大熊——啵！吼！往後跳開；熊縮回書裡，他衝過去闔上
    ...o2.moves,
    { at: H2 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    { at: H2 + HOLD, actor: 'mouse', do: 'moveTo', to: { x: 36, y: P }, arc: 10, dur: 0.35, ease: 'out' },
    { at: H2 + 0.3, actor: 'bear', do: 'shake', amount: 1, dur: 0.4 },
    ...shrinkIn(H2 + 0.8, 'bear', propY(FEET + 4, BEAR)),
    ...slam(H2 + 1.25, 36),
    // 第 3 次前停一拍：書自己抖起來（裡面有很大的東西），他踮腳偷偷靠近、蹲低偷看
    { at: H2 + 1.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: H2 + 1.55, actor: 'mouse', do: 'moveTo', to: { x: STAND + 4, y: P }, dur: 0.35 },
    { at: 4.95, actor: 'book', do: 'shake', amount: 1.2, dur: 0.45 },
    { at: 4.95, actor: 'book', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: 5.15, actor: 'book', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: 5.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/peek' },
    // 啵！比畫面還高的恐龍：嚇得往後跳、一屁股跌坐
    ...o3.moves,
    { at: H3 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    { at: H3 + HOLD, actor: 'mouse', do: 'moveTo', to: { x: 19, y: P }, arc: 16, dur: 0.4, ease: 'out' },
    { at: H3 + HOLD + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    { at: H3 + 0.25, actor: 'dino', do: 'shake', amount: 1.4, dur: 0.45 },
    // 恐龍縮回書裡，書「砰」地闔上、被震得跳到右邊（國字要到正中央）
    ...shrinkIn(H3 + 0.7, 'dino', dinoY(FEET + 4)),
    { at: H3 + 0.92, actor: 'book', do: 'swap', emoji: '📘' },
    { at: H3 + 0.95, actor: 'book', do: 'moveTo', to: { x: BSIDE, y: BY }, arc: 10, dur: 0.3, ease: 'out' },
    // 語詞那一刻：書跳回中間、攤開變最大；他爬起來站在旁邊指著——故事書
    { at: PARK, actor: 'book', do: 'moveTo', to: { x: BX, y: BY }, arc: 10, dur: 0.3, ease: 'out' },
    { at: PARK + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: PARK + 0.3, actor: 'mouse', do: 'moveTo', to: { x: 50, y: P }, dur: 0.2 },
    { at: WORD, actor: 'book', do: 'swap', emoji: '📖' },
    { at: WORD, actor: 'book', do: 'scaleTo', amount: BIG, dur: 0.3, ease: 'back' },
    { at: WORD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: WORD, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍（第 4 次）：他把書闔上，鼓起勇氣再翻開……
    { at: 8.75, actor: 'book', do: 'scaleTo', amount: 1 / BIG, dur: 0.25 },
    ...slam(8.85, 50),
    ...o4.moves,
    // 什麼都沒跳出來！他湊近看
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/duck' },
    { at: H4 + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: H4 + 0.3, actor: 'mouse', do: 'moveTo', to: { x: NEAR + 6, y: P }, dur: 0.3 },
    { at: H4 + 0.35, actor: 'mouse', do: 'tilt', amount: -12, dur: 0.3 },
    // 咻！整隻被書吸進去，書闔上
    { at: SUCK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: SUCK, actor: 'mouse', do: 'moveTo', to: { x: BX, y: 62 }, dur: 0.25, ease: 'in' },
    { at: SUCK, actor: 'mouse', do: 'scaleTo', amount: 0.1, dur: 0.25, ease: 'in' },
    { at: SUCK, actor: 'mouse', do: 'spin', dur: 0.25 },
    { at: SUCK + 0.25, actor: 'mouse', do: 'vanish', dur: 0.01 },
    { at: SUCK + 0.27, actor: 'book', do: 'swap', emoji: '📘' },
    // 書封上多了一隻小小的他，揮手
    { at: SUCK + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/wave' },
    { at: SUCK + 0.4, actor: 'mouse', do: 'flip' },
    { at: SUCK + 0.38, actor: 'mouse', do: 'moveTo', to: { x: BX + 1, y: COVER_FEET - 0.42 * M }, dur: 0.01 },
    { at: SUCK + 0.4, actor: 'mouse', do: 'pop', dur: 0.2 },
    { at: SUCK + 0.405, actor: 'mouse', do: 'scaleTo', amount: MINI, dur: 0.01 },
    { at: SUCK + 0.65, actor: 'mouse', do: 'tilt', amount: 10, dur: 0.25 },
    // 問他：書打開，他跳出來到左前方、變大，轉向觀眾
    { at: ASK, actor: 'book', do: 'swap', emoji: '📖' },
    { at: ASK + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: ASK + 0.3, actor: 'mouse', do: 'scaleTo', amount: 1.2 / MINI, dur: 0.3, ease: 'out' },
    { at: ASK + 0.3, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 3 }, arc: 4, dur: 0.3, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 12.0, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, actor: 'mouse', do: 'hop', amount: 8, dur: 0.2 },
    // 退場：他衝出左邊，書啪地闔上跳出右邊，畫面只留下字
    { at: ANSWER + 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: ANSWER + 0.2, actor: 'mouse', do: 'moveTo', to: { x: -45, y: P + 3 }, dur: 0.15, ease: 'in' },
    { at: ANSWER + 0.2, actor: 'book', do: 'swap', emoji: '📘' },
    { at: ANSWER + 0.2, actor: 'book', do: 'moveTo', to: { x: 215, y: BY }, arc: 8, dur: 0.14, ease: 'in' },
  ],
  builds: [
    // 每翻開一次，就有一組筆畫從書頁飛進字框：聿的上半、聿的下半、曰
    { at: H1 + 0.3, dur: 0.6, strokes: [0, 1, 2, 3], from: 'book', color: partColor('聿') },
    { at: H2 + 0.3, dur: 0.5, strokes: [4, 5], from: 'book', color: partColor('聿') },
    { at: H3 + 0.3, dur: 0.6, strokes: [6, 7, 8, 9], from: 'book', color: partColor('曰') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['mouse'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...o1.fx,
    ...o2.fx,
    { at: H2 + 0.25, kind: 'burst', actor: 'bear', dx: 14, dy: 10, emoji: '💢', n: 1, dur: 0.4, scale: 1.4 },
    { at: H2 + 0.9, kind: 'sweat', actor: 'mouse' },
    // 第 3 次前停一拍
    { at: 5.0, kind: 'pop', actor: 'mouse', emoji: '❓', dx: 4, dur: 0.6, scale: 1.4 },
    ...o3.fx,
    { at: H3 + HOLD + 0.45, kind: 'dizzy', actor: 'mouse', dur: 0.5 },
    { at: WORD, kind: 'burst', actor: 'book', dy: 6, emoji: '✨', n: 8, dur: 0.45 },
    ...o4.fx,
    { at: H4 + 0.3, kind: 'pop', actor: 'mouse', emoji: '❓', dx: 4, dur: 0.5, scale: 1.4 },
    { at: SUCK, kind: 'burst', actor: 'book', dy: 6, emoji: '✨', n: 9, dur: 0.4, scale: 1.4 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：要同時看得到小老鼠和跳出來的東西
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...o1.camera,
    ...o2.camera,
    ...o3.camera,
    { at: 6.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: SUCK + 0.27, dur: 0.4, do: 'punch', amount: 0.15, to: { x: BX, y: 55 } },
    { at: SUCK + 0.27, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...o1.lights,
    ...o2.lights,
    ...o3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '書' },
    ...o1.cues,
    { at: H1 + 0.55, sfx: 'boing' },
    { at: H1 + 1.0, sfx: 'tap' },
    ...o2.cues,
    { at: H2 + 0.2, sfx: 'rumble' },
    { at: H2 + 1.25, sfx: 'tap' },
    { at: 4.95, sfx: 'rumble' },
    ...o3.cues,
    { at: H3 + 0.2, sfx: 'rumble' },
    { at: H3 + HOLD + 0.4, sfx: 'plop' },
    { at: H3 + 0.92, sfx: 'bonk' },
    { at: HOME + 0.1, say: '書' },
    { at: WORD, say: '故事書' },
    { at: 8.85, sfx: 'tap' },
    ...o4.cues,
    { at: SUCK, sfx: 'whoosh' },
    { at: SUCK + 0.27, sfx: 'plop' },
    { at: ASK + 0.2, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '書' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
