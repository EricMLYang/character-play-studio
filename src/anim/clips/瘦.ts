import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 瘦（v2）：小骷髏站在兩塊大石頭中間。石頭每次「轟隆隆」抖一下，就從兩邊夾過來——他吸一口氣、肚子一縮，
// 「咻」地把自己變得細細的，石頭「咚」地剛好貼著他停住，沒夾到！石頭退回去，他「啵」地彈回原來的寬度。一次比一次窄：
// 細一點，得意（疒）→ 更窄、細成一根筷子（叟的上面）→ 先停一拍：他托著下巴左看右看兩塊石頭、冒汗⋯⋯
// 石頭又來了，這次只剩一條縫，他細成一條線、咬牙撐住，石頭一退「啵」地彈太大力，整個人彈出畫面頂端（叟的下面：又）。
// 國字回中央時他還在天上；國字讓位後他才「咚」地掉回來，得意地自己再變細一次給大家看：「瘦巴巴」。
// 回馬槍（第四次）：他閉眼得意、沒注意石頭又抖了——這次石頭「碰！」地整個合起來，他細成一張紙才剛好夾在中間，
// 石頭撞得太大力彈開飛出畫面，那陣風把紙片一樣的他吹得飄啊飄、飄出畫面。
// 最後畫面暗下來只剩「瘦」，小骷髏走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「瘦！」，然後退場只留字。
// 刻意不跟「胖」（吞起司「啵」地撐圓）、「喝」（打嗝洩氣飛走）、「長」「高」「短」「矮」撞：這支只演「變窄」——
// 不吃東西、不演高矮；他變細時高度只多一點點，兩邊的石頭和越來越窄的縫每一格都看得到。
// 瘦、瘦、瘦巴巴、這是什麼字？、瘦

/** 小骷髏（hero:jerry；圖朝左） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 他的身體平常多寬（idle 的圖佔畫布寬 0.58） */
const JW = 0.58 * JS
/** 每次都站在同一個地方：兩塊石頭中間（畫面中間偏右，字框讓到左上） */
const GX = 92
const HERE: Vec = { x: GX, y: JY }
/** 一次比一次細（寬度倍率）；高度只多一點點——是「變窄」，不是「變高」 */
const THIN = [0.62, 0.4, 0.24]
const TALL = [1.08, 1.12, 1.16]
/** 語詞那一刻自己變細給大家看 */
const SHOW_W = 0.42, SHOW_H = 1.1
/** 回馬槍：細成一張紙 */
const PAPER_W = 0.1, PAPER_H = 1.2
/** 被風吹走時像紙片一樣翻面：一下看得到臉（寬）、一下只剩側面（窄） */
const FLAP_W = 0.5

/** 大石頭（prop:rock 拉細拉高成一根大石柱）：寬 20、高 34，比他高一點 */
const RS = 31.5
const RA = 0.69
const RW = 0.92 * RS * RA
const RY = 77 - 0.42 * RS
/** 平常停在兩邊（國字回中央那一秒不會疊到字：x 49–113 以外） */
const REST_L = 34
const REST_R = 146
/** 石頭夾過來時的縫：剛好比他變細以後寬一點點 */
const gap = (w: number) => w * JW + 1.2
/** 縫寬 g 時，左右兩塊石頭的中心 */
const closeL = (g: number) => GX - g / 2 - RW / 2
const closeR = (g: number) => GX + g / 2 + RW / 2
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 34, y: 21 }
/** 夾住後撐住多久（傻眼的臉停得住） */
const HOLD = [0.42, 0.45, 0.55]

/** 從 (w0, h0) 變成 (w1, h1)：stretchTo（寬 ×a、高 ÷a）＋ scaleTo（寬高 ×s） */
function shape(at: number, dur: number, w0: number, h0: number, w1: number, h1: number, ease: Move['ease'] = 'out'): Move[] {
  const rw = w1 / w0, rh = h1 / h0
  return [
    { at, actor: 'jerry', do: 'stretchTo', amount: Math.sqrt(rw / rh), dur, ease },
    { at, actor: 'jerry', do: 'scaleTo', amount: Math.sqrt(rw * rh), dur, ease },
  ]
}

/** 石頭「轟隆隆」抖一下（預備） */
function rumble(at: number, amount: number): Move[] {
  return [
    { at, actor: 'rockL', do: 'shake', amount, dur: 0.22 },
    { at, actor: 'rockR', do: 'shake', amount, dur: 0.22 },
  ]
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; hit: number }

/**
 * 同一個笑點「咻——咚！」：兩塊石頭抖一下（預備，他傻眼）→ 從兩邊夾過來，他雙手按肚子吸一口氣、「咻」地變細 →
 * 石頭「咚」地剛好貼著他停住：兩邊各一個 💥（一次比一次大）＋鏡頭推一下＋震＋同一個音效（一次多疊一個音）。
 * at 是石頭開始抖的那一刻，k 是第幾次（0～2）。回傳 hit（石頭停住那一刻）。
 */
function squeeze(at: number, k: number): Gag {
  const hit = at + 0.55
  const g = gap(THIN[k])
  const moves: Move[] = [
    ...rumble(at, 0.6 + 0.25 * k),
    { at: at + 0.02, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 夾過來
    { at: at + 0.25, actor: 'rockL', do: 'moveTo', to: { x: closeL(g), y: RY }, dur: 0.3, ease: 'in' },
    { at: at + 0.25, actor: 'rockR', do: 'moveTo', to: { x: closeR(g), y: RY }, dur: 0.3, ease: 'in' },
    // 吸一口氣、肚子一縮，咻——變細
    { at: at + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/hungry' },
    ...shape(at + 0.33, 0.16, 1, 1, THIN[k], TALL[k]),
    // 咚！貼著他停住
    { at: hit, actor: 'rockL', do: 'squash', amount: 0.08, dur: 0.18 },
    { at: hit, actor: 'rockR', do: 'squash', amount: 0.08, dur: 0.18 },
  ]
  const fx: Fx[] = [
    { at: hit, kind: 'burst', x: GX - g / 2 - 1, y: 66, n: 1, dur: 0.38, scale: 0.9 + 0.3 * k },
    { at: hit, kind: 'burst', x: GX + g / 2 + 1, y: 66, n: 1, dur: 0.38, scale: 0.9 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: GX, y: 52 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'rumble' }, { at: at + 0.33, sfx: 'whoosh' }, { at: hit, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'crack' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'clink' })
  return { moves, fx, camera, cues, hit }
}

/** 石頭退回兩邊，他「啵」地彈回原來的寬度（at 是彈回來那一刻） */
function release(at: number, k: number, hop: number): Move[] {
  return [
    { at: at - 0.12, actor: 'rockL', do: 'moveTo', to: { x: REST_L, y: RY }, dur: 0.35 },
    { at: at - 0.12, actor: 'rockR', do: 'moveTo', to: { x: REST_R, y: RY }, dur: 0.35 },
    ...shape(at, 0.2, THIN[k], TALL[k], 1, 1, 'back'),
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    ...(hop ? [{ at, actor: 'jerry', do: 'hop', amount: hop, dur: 0.32 } as Move] : []),
  ]
}

// 第 1 次
const R1 = 1.15
const g1 = squeeze(R1, 0)
const POP1 = g1.hit + HOLD[0] + 0.12
// 第 2 次
const R2 = POP1 + 0.5
const g2 = squeeze(R2, 1)
const POP2 = g2.hit + HOLD[1] + 0.12
// 第 3 次前停一拍：托著下巴左看右看兩塊石頭
const PONDER = POP2 + 0.36
const R3 = PONDER + 0.7
const g3 = squeeze(R3, 2)
/** 第 3 次彈回來太大力，整個人彈出畫面頂端 */
const POP3 = g3.hit + HOLD[2] + 0.12
/** 字框填滿、國字到正中央（他在天上） */
const HOME = POP3 + 0.5
const PARK = HOME + 0.9
/** 國字讓位後，他從天上掉回來 */
const FALL = PARK + 0.15
const THUD = FALL + 0.25
/** 語詞那一刻：自己變細給大家看 */
const WORD = THUD + 0.25
// 回馬槍（第 4 次）：閉眼得意，石頭又抖了
const R4 = WORD + 0.7
/** 石頭整個合起來 */
const SLAM = R4 + 0.55
/** 石頭撞太大力，彈開飛出畫面 */
const BOUNCE = SLAM + 0.45
/** 紙片一樣的他被風吹走 */
const BLOWN = BOUNCE + 0.05
const GONE = BLOWN + 0.8
/** 問他 */
const ASK = GONE + 0.05
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }
/** 他細成一張紙時的縫 */
const PAPER_GAP = gap(PAPER_W) - 0.6

const builds: Build[] = [
  // 咚！石頭夾住他那一下，從被擠細的身上擠出來：疒
  { at: g1.hit + 0.05, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'jerry', color: partColor('疒') },
  // 叟的上面
  { at: g2.hit + 0.05, dur: 0.5, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'jerry', color: partColor('叟') },
  // 叟的下面（又）
  { at: g3.hit + 0.05, dur: 0.45, strokes: [12, 13], from: 'jerry', color: partColor('叟') },
]

const clip: Clip = {
  format: 2,
  char: '瘦',
  meta: { theme: '石頭夾過來變細', cast: '小骷髏＋兩塊大石頭', gags: ['兩塊大石頭每次「轟隆隆」從兩邊夾過來，小骷髏就吸一口氣「咻」地把自己變細，石頭「咚」地剛好貼著他停住，一次比一次窄（細一點得意→細成筷子→先停一拍左看右看，細成一條線，彈回來太大力彈出畫面）；回馬槍是石頭「碰」地整個合起來，他細成一張紙夾在中間，石頭彈開飛走，那陣風把紙片一樣的他吹得飄出畫面'] },
  duration: 15,
  bg: { top: '#BFE3FF', bottom: '#FFF3D6', floor: '#E8C987', scenery: 'desert' },
  actors: [
    { id: 'rockL', emoji: 'prop:rock', x: REST_L, y: RY, size: RS },
    { id: 'rockR', emoji: 'prop:rock', x: REST_R, y: RY, size: RS, flip: true },
    { id: 'jerry', emoji: 'hero:jerry/walk', x: GX, y: JY, size: JS, flip: true },
  ],
  moves: [
    // 石頭拉細拉高成兩根大石柱（開場前就是這樣）
    { at: -0.02, actor: 'rockL', do: 'stretchTo', amount: RA, dur: 0.01 },
    { at: -0.02, actor: 'rockR', do: 'stretchTo', amount: RA, dur: 0.01 },
    // 開場：走進兩塊石頭中間，轉過去指著左上的字框「瘦」
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.6 },
    { at: 0.6, actor: 'jerry', do: 'flip' },
    { at: 0.6, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    // 第 1 次：細一點，得意
    ...g1.moves,
    { at: g1.hit + 0.12, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    ...release(POP1, 0, 3),
    { at: POP1 + 0.32, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 第 2 次：細成一根筷子，還是得意
    ...g2.moves,
    { at: g2.hit + 0.12, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: g2.hit + 0.15, actor: 'jerry', do: 'tilt', amount: -6, dur: 0.3 },
    ...release(POP2, 1, 6),
    // 第 3 次前停一拍：托著下巴，左看看、右看看兩塊石頭
    { at: PONDER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/ponder' },
    { at: PONDER + 0.3, actor: 'jerry', do: 'flip' },
    { at: PONDER + 0.3, actor: 'rockR', do: 'shake', amount: 0.3, dur: 0.15 },
    { at: PONDER + 0.6, actor: 'jerry', do: 'flip' },
    // 第 3 次：只剩一條縫，細成一條線、咬牙撐住
    ...g3.moves,
    { at: g3.hit + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/hold' },
    { at: g3.hit + 0.12, actor: 'jerry', do: 'shake', amount: 0.5, dur: 0.4 },
    // 彈回來太大力：整個人「啵」地彈出畫面頂端
    ...release(POP3, 2, 0),
    { at: POP3, actor: 'jerry', do: 'moveTo', to: { x: GX, y: -45 }, dur: 0.45, ease: 'in' },
    { at: POP3, actor: 'jerry', do: 'spin', dur: 0.45, pivot: 'center' },
    // 國字讓位後，他從天上「咚」地掉回來
    { at: FALL, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: FALL, actor: 'jerry', do: 'moveTo', to: HERE, dur: THUD - FALL, ease: 'in' },
    // 語詞：站起來，得意地自己再變細一次給大家看——瘦巴巴
    { at: WORD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    ...shape(WORD, 0.18, 1, 1, SHOW_W, SHOW_H),
    // 回馬槍：閉眼得意、沒注意——石頭又抖了，這次整個合起來
    ...rumble(R4, 1.2),
    { at: R4 + 0.25, actor: 'rockL', do: 'moveTo', to: { x: closeL(PAPER_GAP), y: RY }, dur: 0.3, ease: 'in' },
    { at: R4 + 0.25, actor: 'rockR', do: 'moveTo', to: { x: closeR(PAPER_GAP), y: RY }, dur: 0.3, ease: 'in' },
    { at: R4 + 0.22, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    ...shape(R4 + 0.3, 0.2, SHOW_W, SHOW_H, PAPER_W, PAPER_H),
    { at: SLAM, actor: 'rockL', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: SLAM, actor: 'rockR', do: 'squash', amount: 0.12, dur: 0.2 },
    // 石頭撞太大力，彈開飛出畫面
    { at: BOUNCE, actor: 'rockL', do: 'moveTo', to: { x: -40, y: RY }, dur: 0.45, ease: 'out' },
    { at: BOUNCE, actor: 'rockR', do: 'moveTo', to: { x: 200, y: RY }, dur: 0.45, ease: 'out' },
    // 那陣風把紙片一樣的他吹得飄啊飄、飄出畫面
    { at: BLOWN, actor: 'jerry', do: 'moveTo', to: { x: 185, y: 8 }, dur: GONE - BLOWN, ease: 'in' },
    { at: BLOWN, actor: 'jerry', do: 'rotateTo', amount: 50, dur: 0.3, pivot: 'center' },
    { at: BLOWN + 0.3, actor: 'jerry', do: 'rotateTo', amount: -70, dur: 0.3, pivot: 'center' },
    { at: BLOWN + 0.6, actor: 'jerry', do: 'rotateTo', amount: 60, dur: 0.25, pivot: 'center' },
    // 像紙片一樣翻面：寬（看得到臉）→ 窄 → 寬
    { at: BLOWN, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flee' },
    ...shape(BLOWN, 0.2, PAPER_W, PAPER_H, FLAP_W, PAPER_H, 'inOut'),
    ...shape(BLOWN + 0.2, 0.2, FLAP_W, PAPER_H, PAPER_W, PAPER_H, 'inOut'),
    ...shape(BLOWN + 0.4, 0.2, PAPER_W, PAPER_H, FLAP_W, PAPER_H, 'inOut'),
    // 問他：在畫面外變回原樣，從右邊走回來、轉向國字、變大
    ...shape(ASK, 0.01, FLAP_W, PAPER_H, 1, 1, 'linear'),
    { at: ASK, actor: 'jerry', do: 'rotateTo', amount: -40, dur: 0.01, pivot: 'center' },
    { at: ASK + 0.02, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: ASK + 0.02, actor: 'jerry', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.03, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.04, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.01 },
    { at: ASK + 0.5, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
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
    // 空字框一開始就讓到左上（石頭和他都在中間偏右）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: PONDER + 0.1, kind: 'sweat', actor: 'jerry', dx: 6 },
    ...g3.fx,
    // 語詞：細細的他亮晶晶
    { at: WORD, kind: 'burst', x: GX, y: 52, emoji: '✨', n: 7, dur: 0.5, scale: 1.6 },
    // 回馬槍：碰！最大的一次
    // 碰！兩塊石頭撞在一起：💥 冒在兩邊石頭頂上，不蓋住夾在中間的他
    { at: SLAM, kind: 'burst', x: GX - 13, y: 38, n: 1, dur: 0.42, scale: 1.9 },
    { at: SLAM, kind: 'burst', x: GX + 13, y: 38, n: 1, dur: 0.42, scale: 1.9 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把兩邊的石頭切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 82, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: THUD, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.1, to: { x: GX, y: 55 } },
    { at: SLAM, dur: 0.45, do: 'punch', amount: 0.08, to: { x: GX, y: 52 } },
    { at: SLAM, dur: 0.4, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.62, say: '瘦' },
    ...g1.cues,
    { at: POP1, sfx: 'boing' },
    ...g2.cues,
    { at: POP2, sfx: 'boing' },
    ...g3.cues,
    { at: POP3, sfx: 'boing' },
    { at: POP3 + 0.04, sfx: 'whoosh' },
    { at: HOME + 0.2, say: '瘦' },
    { at: THUD, sfx: 'bonk' },
    { at: WORD, say: '瘦巴巴' },
    { at: R4, sfx: 'rumble' },
    { at: R4 + 0.3, sfx: 'whoosh' },
    { at: SLAM, sfx: 'bonk' },
    { at: SLAM + 0.04, sfx: 'crack' },
    { at: SLAM + 0.08, sfx: 'clink' },
    { at: SLAM + 0.12, sfx: 'rumble' },
    { at: BLOWN, sfx: 'whoosh' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '瘦' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
