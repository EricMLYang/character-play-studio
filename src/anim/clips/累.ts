import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 累（v2）：小機器人背上背著一顆大電池，滿滿三格。他一板一眼，天上掉下什麼就舉起來丟掉——
// 每丟完一件，背上的電池就「嘟——」掉一格（那一格飛上去變成字的一塊），人垮得一次比一次低，汗一次比一次多：
// 小紙箱→彎腰手撐膝蓋、吐舌喘氣（田）；大石頭→一屁股坐在地上、眼睛轉圈圈（糸的上半）；
// 先停一拍：掉下來一台汽車，他抬頭看一眼、再回頭看一眼只剩一格的電池（紅紅的在閃）——硬舉起來丟掉，整個趴在地上（糸的下半）。
// 語詞那一刻：他撐起來、彎著腰拖著腳走到畫面中間，電池只剩紅紅一條，滿頭大汗：很累。
// 回馬槍（第四次）：天上又掉下一台大巴士。他硬撐著舉起來——「嘟——」最後一格也沒了，螢幕一黑「咻」地當機，
// 巴士掉回地上、他直直往後倒成一根木頭。躺著躺著，電池「嗶、嗶、嗶」自己充滿了！他彈起來、單手把大巴士舉過頭，興沖沖扛著衝出畫面。
// 最後畫面暗下來只剩「累」，他走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「累！」，然後退場只留字。
// 刻意不跟「推」（推越來越大的東西）、「公」（打瞌睡、💤越來越大）、「急」「慢」「晚」撞：這支只演「累＝做完事沒電了：喘氣、冒汗、垂頭、電池一格一格掉」。
// 累、累、很累、這是什麼字？、累

/** 小機器人（hero:bot；圖朝左，不翻：看著左邊掉下來的東西、往左丟） */
const BS = 36
const BY = 77 - 0.42 * BS
/** 前三次都站在同一個地方（右邊；國字字框在左上角的天空） */
const BX = 121
/** 語詞與第四次站的地方（畫面中間） */
const CX = 86
/** 背上的電池：灰色的殼（空的部分）＋上面一層照電量切掉上半的綠色電池 */
const PS = 28
/** 電池的綠色在圖上的範圍（從上往下的比例）：0.19～0.87，三格 */
const LV = [0, 0.417, 0.643, 0.72, 0.87]
/** 電池背在他背上：每個姿勢背的位置不一樣（相對於他的 x，y 是電池中心） */
const PACK: Record<string, Vec> = {
  stand: { x: 14, y: 55 },
  tired: { x: 15, y: 59 },
  dizzy: { x: 14, y: 62 },
  flat: { x: 6, y: 47 },
  plank: { x: -2, y: 58 },
}
/** 東西共用一個角色換圖：底子 size 寫最大的（大巴士），其他用 scaleTo 縮（寫在 pop 之後） */
const IB = 42
const ITEMS = [
  { emoji: 'prop:box', size: 16 },
  { emoji: 'prop:rock', size: 24 },
  { emoji: '🚗', size: 32 },
]
/** 舉過頭時東西的底部高度 */
const OVER = 42.5
/** 傻眼／垮下去停多久 */
const HOLD = 0.45
/** 電量偏低時染成紅色 */
const LOW = 'hue-rotate(-75deg) saturate(3) brightness(.9)'
const GRAY = 'grayscale(1) brightness(.78) contrast(1.1)'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 電池跟著他移動到某個姿勢的位置 */
function pack(at: number, x: number, pose: keyof typeof PACK, dur = 0.01, ease?: Move['ease']): Move[] {
  const p = PACK[pose]
  const to = { x: x + p.x, y: p.y }
  return [
    { at, actor: 'shell', do: 'moveTo', to, dur, ease },
    { at, actor: 'fill', do: 'moveTo', to, dur, ease },
  ]
}

/** 「嘟——」電池掉一格：綠色那層切短、殼抖一下；step 是第幾次掉（LV 的索引：1 剩兩格、2 剩一格、3 剩紅紅一條、4 見底） */
function beep(at: number, step: number, k: number): { moves: Move[]; cues: Cue[] } {
  const moves: Move[] = [
    { at, actor: 'fill', do: 'swap', emoji: '🔋', half: 'bottom', cut: LV[step] },
    { at, actor: 'shell', do: 'shake', amount: 1 + 0.35 * k, dur: 0.3 },
    { at, actor: 'fill', do: 'shake', amount: 1 + 0.35 * k, dur: 0.3 },
  ]
  if (step >= 2) moves.push({ at, actor: 'fill', do: 'tint', filter: LOW })
  // 同一個「嘟——」，一次比一次多疊一個音
  const cues: Cue[] = [{ at, sfx: 'blip' }, { at: at + 0.05, sfx: 'deflate' }]
  if (k >= 1) cues.push({ at: at + 0.09, sfx: 'slide' })
  if (k >= 2) cues.push({ at: at + 0.13, sfx: 'bonk' })
  return { moves, cues }
}

/**
 * 同一個笑點（第 1～3 次）：天上掉下一樣東西 → 他伸手、舉過頭（越重抖得越厲害）→ 往右丟掉 →
 * 「嘟——」背上的電池掉一格＋人垮下去一次比一次低＋汗一次比一次多 → 慢慢爬起來。at 是「嘟」那一刻，k 是第幾次。
 */
function chore(at: number, k: number, pause = 0): Gag {
  const it = ITEMS[k]
  const s = it.size
  const drop = at - 1.12 - pause
  const land = drop + 0.24
  const lift = at - 0.72
  const toss = at - 0.3
  const front = BX - 15 - 0.45 * s
  const pose = (['tired', 'dizzy', 'flat'] as const)[k]
  const b = beep(at, k + 1, k)
  const moves: Move[] = [
    // 天上掉下來
    { at: drop - 0.02, actor: 'item', do: 'swap', emoji: it.emoji },
    { at: drop - 0.01, actor: 'item', do: 'moveTo', to: { x: front, y: -30 }, dur: 0.01 },
    { at: drop, actor: 'item', do: 'pop', dur: 0.05 },
    { at: drop + 0.001, actor: 'item', do: 'scaleTo', amount: s / IB, dur: 0.01 },
    { at: drop + 0.02, actor: 'item', do: 'moveTo', to: { x: front, y: 77 - 0.42 * IB }, dur: land - drop - 0.02, ease: 'in' },
    { at: land, actor: 'item', do: 'squash', amount: 0.2 + 0.08 * k, dur: 0.2 },
    // 伸手、舉過頭：越重抖得越厲害、壓得越扁
    { at: lift - 0.14, actor: 'bot', do: 'swap', emoji: 'hero:bot/reach' },
    { at: lift, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
    { at: lift, actor: 'item', do: 'moveTo', to: { x: BX - 2, y: OVER - 0.42 * IB }, dur: 0.18, ease: 'out' },
    { at: lift + 0.18, actor: 'bot', do: 'squash', amount: 0.06 + 0.07 * k, dur: 0.24 },
    { at: lift + 0.18, actor: 'bot', do: 'shake', amount: 0.3 + 0.5 * k, dur: 0.24 },
    { at: lift + 0.18, actor: 'item', do: 'shake', amount: 0.3 + 0.5 * k, dur: 0.24 },
    // 往左丟掉（低低地飛出畫面，不經過左上角的字框）
    { at: toss, actor: 'bot', do: 'swap', emoji: 'hero:bot/throw' },
    { at: toss, actor: 'item', do: 'moveTo', to: { x: -45, y: 66 }, arc: 5, dur: 0.42, ease: 'out' },
    { at: toss, actor: 'item', do: 'rotateTo', amount: -160, dur: 0.42 },
    { at: toss + 0.43, actor: 'item', do: 'vanish', dur: 0.01 },
    { at: toss + 0.44, actor: 'item', do: 'rotateTo', amount: 160, dur: 0.01 },
    // 嘟——垮下去
    ...b.moves,
    { at, actor: 'bot', do: 'swap', emoji: `hero:bot/${pose}` },
    { at, actor: 'bot', do: 'squash', amount: 0.15 + 0.08 * k, dur: 0.3 },
    ...pack(at, BX, pose),
  ]
  const fx: Fx[] = [
    // 舉起來那一下冒汗（越重越多）、垮下去那一下汗噴出來（一次比一次大）
    { at: lift + 0.1, kind: 'sweat', actor: 'bot', dx: -9, scale: 1.3 + 0.3 * k },
    { at: at + 0.05, kind: 'sweat', actor: 'bot', dx: -8, dy: 2 + 3 * k, scale: 1.8 + 0.4 * k, dur: 0.9 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: 95, y: 45 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at: land, sfx: 'plop' }, { at: lift + 0.1, sfx: 'rumble' }, { at: toss, sfx: 'whoosh' }, ...b.cues]
  return { moves, fx, camera, cues }
}

/** 慢慢爬起來（站回原位） */
function getUp(at: number, x: number): Move[] {
  return [
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    ...pack(at, x, 'stand'),
  ]
}

const H1 = 1.85
const g1 = chore(H1, 0)
const H2 = H1 + 1.7
const g2 = chore(H2, 1)
/** 第三次前停一拍：汽車掉下來，他抬頭看、回頭看一眼只剩一格的電池 */
const PAUSE = 0.45
const H3 = H2 + 1.7 + PAUSE
const g3 = chore(H3, 2, PAUSE)
const LOOK = H3 - 1.12 - PAUSE + 0.3
/** 字框填滿、國字到正中央（他趴在左邊） */
const HOME = H3 + 0.68
const PARK = HOME + 0.82
/** 語詞那一刻：撐起來、拖著腳走到畫面中間 */
const RISE = PARK - 0.1
const WALK = RISE + 0.12
const WORD = WALK + 0.5
// 回馬槍（第四次）：大巴士
const BUS_DROP = WORD + 0.5
const BUS_LAND = BUS_DROP + 0.26
const BUS_FRONT = CX - 15 - 0.45 * IB
const LIFT4 = BUS_LAND + 0.16
const H4 = LIFT4 + 0.58
/** 當機：螢幕一黑、直直往後倒 */
const OFF = H4 + 0.12
const FALL = OFF + 0.26
/** 躺著自己充電：嗶、嗶、嗶 */
const CHG = FALL + 0.32
/** 滿格！彈起來、單手把大巴士舉過頭，扛著衝出去 */
const UP = CHG + 0.58
const RUN = UP + 0.3
/** 問他 */
const ASK = RUN + 0.26
const ASK_SAY = ASK + 0.08
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（左前方，國字讓到右邊） */
const ASK_AT: Vec = { x: 126, y: BY + 2 }

const b4 = beep(H4, 4, 3)

const builds: Build[] = [
  // 每掉一格，那一格電就從電池裡飛出去，變成字的一塊：田 → 糸的上半 → 糸的下半
  { at: H1 + 0.04, dur: 0.55, strokes: [0, 1, 2, 3, 4], from: 'fill', color: partColor('田') },
  { at: H2 + 0.04, dur: 0.5, strokes: [5, 6, 7], from: 'fill', color: partColor('糸') },
  { at: H3 + 0.04, dur: 0.5, strokes: [8, 9, 10], from: 'fill', color: partColor('糸') },
]

const clip: Clip = {
  format: 2,
  char: '累',
  meta: { theme: '小機器人的電池一格一格掉', cast: '小機器人＋背上的電池＋掉下來的東西', gags: ['小機器人每舉起一樣東西丟掉，背上的大電池就「嘟——」掉一格，人垮得一次比一次低、汗一次比一次多（小紙箱→喘氣撐膝蓋、大石頭→坐倒在地、先停一拍：汽車→整個趴在地上）；回馬槍是掉下一台大巴士，他硬舉起來，最後一格也沒了，「咻」地當機、直直倒成一根木頭——躺著躺著電池自己充滿了，他彈起來單手扛起大巴士衝出去'] },
  duration: 15,
  bg: { top: '#BFE3F5', bottom: '#EEF8FC', floor: '#C9DFA0', scenery: 'hills' },
  actors: [
    { id: 'item', emoji: ITEMS[0].emoji, x: 120, y: -40, size: IB, hidden: true },
    { id: 'bot', emoji: 'hero:bot/walk', x: BX, y: BY, size: BS },
    // 背上的電池：灰殼在下、綠色電量在上（只畫下面一截，越用越短）
    { id: 'shell', emoji: '🔋', x: BX + PACK.stand.x, y: PACK.stand.y, size: PS, float: true, tint: GRAY },
    { id: 'fill', emoji: '🔋', x: BX + PACK.stand.x, y: PACK.stand.y, size: PS, float: true, half: 'bottom', cut: LV[0] },
  ],
  moves: [
    // 開場：滿格的小機器人走進來，抬頭看右上角的字框
    { at: 0, actor: 'bot', do: 'enter', from: { x: 190, y: BY }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'shell', do: 'enter', from: { x: 190 + PACK.stand.x, y: PACK.stand.y }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'fill', do: 'enter', from: { x: 190 + PACK.stand.x, y: PACK.stand.y }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    // 第 1 次：小紙箱
    { at: H1 - 1.2, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    ...g1.moves,
    ...getUp(H1 + HOLD + 0.05, BX),
    // 第 2 次：大石頭
    ...g2.moves,
    ...getUp(H2 + HOLD + 0.05, BX),
    // 第 3 次前停一拍：汽車掉下來，他傻眼，回頭看一眼紅紅的最後一格
    { at: LOOK, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: LOOK + 0.25, actor: 'fill', do: 'shake', amount: 1.2, dur: 0.4 },
    ...g3.moves,
    { at: LOOK + 0.22, actor: 'bot', do: 'tilt', amount: -8, dur: 0.3 },
    // 語詞：撐起來、彎著腰拖著腳走到畫面中間：很累
    { at: RISE, actor: 'bot', do: 'swap', emoji: 'hero:bot/tired' },
    ...pack(RISE, BX, 'tired'),
    { at: WALK, actor: 'bot', do: 'moveTo', to: { x: CX, y: BY }, dur: 0.5, ease: 'inOut' },
    ...pack(WALK, CX, 'tired', 0.5, 'inOut'),
    { at: WORD, actor: 'bot', do: 'squash', amount: 0.12, dur: 0.3 },
    { at: WORD + 0.3, actor: 'bot', do: 'squash', amount: 0.12, dur: 0.3 },
    { at: WORD + 0.15, actor: 'fill', do: 'shake', amount: 1.2, dur: 0.4 },
    // 回馬槍：大巴士掉下來，他硬撐著舉起來
    { at: BUS_DROP - 0.02, actor: 'item', do: 'swap', emoji: '🚌' },
    // 大巴士從左邊開進來（從天上掉會經過左上角的字框），停在他面前
    { at: BUS_DROP - 0.01, actor: 'item', do: 'moveTo', to: { x: -40, y: 77 - 0.42 * IB }, dur: 0.01 },
    { at: BUS_DROP - 0.01, actor: 'item', do: 'flip' },
    { at: BUS_DROP, actor: 'item', do: 'pop', dur: 0.05 },
    { at: BUS_DROP + 0.02, actor: 'item', do: 'moveTo', to: { x: BUS_FRONT, y: 77 - 0.42 * IB }, dur: BUS_LAND - BUS_DROP - 0.02, ease: 'out' },
    { at: BUS_LAND + 0.02, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    ...pack(BUS_LAND + 0.02, CX, 'stand'),
    { at: LIFT4, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
    { at: LIFT4, actor: 'item', do: 'moveTo', to: { x: CX - 2, y: OVER - 0.42 * IB }, dur: 0.22, ease: 'out' },
    { at: LIFT4 + 0.22, actor: 'bot', do: 'squash', amount: 0.3, dur: 0.38 },
    { at: LIFT4 + 0.22, actor: 'bot', do: 'shake', amount: 2.2, dur: 0.38 },
    { at: LIFT4 + 0.22, actor: 'item', do: 'shake', amount: 2.2, dur: 0.38 },
    // 嘟——最後一格也沒了：當機，巴士掉回地上，他直直往後倒
    ...b4.moves,
    { at: H4, actor: 'bot', do: 'swap', emoji: 'hero:bot/glitch' },
    { at: OFF, actor: 'item', do: 'moveTo', to: { x: BUS_FRONT - 4, y: 77 - 0.42 * IB }, dur: 0.2, ease: 'in' },
    { at: OFF + 0.2, actor: 'item', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: FALL, actor: 'bot', do: 'rotateTo', amount: 90, dur: 0.22, ease: 'in' },
    ...pack(FALL, CX, 'plank', 0.22, 'in'),
    // 躺著，電池自己充電：嗶、嗶、嗶——滿格！
    { at: CHG, actor: 'fill', do: 'tint', filter: '' },
    { at: CHG, actor: 'fill', do: 'swap', emoji: '🔋', half: 'bottom', cut: LV[2] },
    { at: CHG + 0.2, actor: 'fill', do: 'swap', emoji: '🔋', half: 'bottom', cut: LV[1] },
    { at: CHG + 0.4, actor: 'fill', do: 'swap', emoji: '🔋', half: 'bottom', cut: LV[0] },
    { at: CHG + 0.4, actor: 'fill', do: 'squash', amount: -0.15, dur: 0.25 },
    // 彈起來、單手把大巴士舉過頭，扛著衝出畫面
    { at: UP, actor: 'bot', do: 'rotateTo', amount: -90, dur: 0.14, ease: 'out' },
    { at: UP, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: UP, actor: 'bot', do: 'hop', amount: 7, dur: 0.3 },
    ...pack(UP, CX, 'stand', 0.14, 'out'),
    { at: UP + 0.16, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
    { at: UP + 0.16, actor: 'item', do: 'moveTo', to: { x: CX - 2, y: OVER - 0.42 * IB }, dur: 0.14, ease: 'out' },
    { at: RUN, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: RUN, actor: 'bot', do: 'flip' },
    { at: RUN, actor: 'bot', do: 'moveTo', to: { x: CX + 140, y: BY }, dur: 0.28, ease: 'in' },
    { at: RUN, actor: 'item', do: 'moveTo', to: { x: CX + 142, y: OVER - 0.42 * IB }, dur: 0.28, ease: 'in' },
    ...pack(RUN, CX + 140 - 2 * PACK.stand.x, 'stand', 0.28, 'in'),
    { at: RUN + 0.3, actor: 'item', do: 'vanish', dur: 0.01 },
    { at: RUN + 0.3, actor: 'shell', do: 'vanish', dur: 0.01 },
    { at: RUN + 0.3, actor: 'fill', do: 'vanish', dur: 0.01 },
    // 問他：從右邊走回來（電池跟巴士留在畫面外），面向國字
    { at: ASK + 0.02, actor: 'bot', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.02, actor: 'bot', do: 'flip' },
    { at: ASK + 0.03, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: ASK + 0.05, actor: 'bot', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.4 },
    { at: ASK + 0.06, actor: 'bot', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: ASK_SAY + 1.0, actor: 'bot', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bot', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ANSWER, actor: 'bot', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
        { at: ANSWER + 0.18, actor: 'bot', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.2, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到右上（他在左下、丟東西往右下飛）
    { at: 0, dur: 0.01, do: 'park', to: { x: 34, y: 21 }, amount: 0.5 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: { x: 34, y: 21 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給他
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['bot'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: LOOK + 0.05, kind: 'sweat', actor: 'bot', dx: -8, scale: 1.4 },
    ...g3.fx,
    // 很累：滿頭大汗
    { at: WORD - 0.05, kind: 'sweat', actor: 'bot', dx: -8, scale: 2.2, dur: 0.9 },
    { at: LIFT4 + 0.15, kind: 'sweat', actor: 'bot', dx: -9, scale: 1.8 },
    { at: H4, kind: 'burst', actor: 'fill', n: 1, dur: 0.4, scale: 2 },
    { at: OFF, kind: 'puff', actor: 'item', dur: 0.5 },
    // 充電：電池旁邊冒閃電
    { at: CHG, kind: 'burst', actor: 'fill', emoji: '⚡', n: 6, dur: 0.6, scale: 1.3 },
    { at: CHG + 0.4, kind: 'pop', actor: 'fill', emoji: '⚡', dur: 0.5, scale: 1.4 },
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.32 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到掉下來的東西與右上的字框）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: CX, y: 55 } },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.22, to: { x: CX, y: 50 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.2 },
    { at: OFF + 0.2, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    // 當機：畫面一暗
    { at: OFF, dur: 0.08, level: 0.45 },
    { at: OFF + 0.3, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '累' },
    ...g1.cues,
    ...g2.cues,
    { at: LOOK, sfx: 'gulp' },
    ...g3.cues,
    { at: HOME + 0.2, say: '累' },
    { at: WORD, say: '很累' },
    { at: BUS_DROP, sfx: 'slide' },
    { at: BUS_LAND + 0.02, sfx: 'rumble' },
    ...b4.cues,
    { at: OFF, sfx: 'whoosh' },
    { at: OFF + 0.2, sfx: 'bonk' },
    { at: CHG, sfx: 'blip' },
    { at: CHG + 0.2, sfx: 'blip' },
    { at: CHG + 0.4, sfx: 'blip' },
    { at: CHG + 0.42, sfx: 'clink' },
    { at: UP, sfx: 'boing' },
    { at: RUN, sfx: 'whoosh' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '累' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
