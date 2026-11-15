import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 雲（v2）：大晴天，小恐龍開心地出門。一朵白白胖胖的小雲從畫面邊慢慢飄過來，停在他正上方——影子罩住他，他抬頭看：「雲」。
// 雲一鼓、變灰，「嘩啦」——雨只下在他一個人身上（左右都是大太陽），他淋成落湯雞傻眼；他往旁邊一跳，雲「咻」地跟過去又罩住他。
// 同一個動作四次，一次比一次難躲、雨一次比一次大：毛毛雨（雨的外框從雲身上飛出來）→ 他撐起大荷葉當傘，雲就繞到旁邊斜著下大雨，
// 荷葉被沖飛（四點雨滴從落下來的雨裡飛出來）→ 先停一拍：他踮腳偷溜、突然全速衝到畫面另一頭，跳進紙箱蓋起來……安靜兩拍……
// 雲縮成一小團擠進紙箱縫，箱子裡「轟隆嘩啦」，水從縫裡噴出來，紙箱被沖飛，雲又冒出來罩住他（云從雲身上飛出來）。
// 語詞那一刻雲飄到畫面中間、變得又大又白又蓬，他在旁邊指著它：「雲朵」。
// 回馬槍（第四次）：他放棄了，垂頭喪氣、閉上眼睛讓它下——雲照樣飄過來、一鼓、變灰……卻沒有下，變回白白蓬蓬的，
// 飄下來貼在他身邊蹭一蹭（原來它只是想跟他玩），他張開手抱住它，頭上出現一道彩虹。
// 最後畫面暗下來只剩「雲」，他和小雲一起問「這是什麼字？」，手放耳邊等他回答，再指著字說「雲！」，然後跑走（雲跟著他），只留字。
// 刻意不跟「雪」（雪雲倒雪把人埋住）、「冷」（被凍住）、「象」（大象噴水把人沖飛）撞：這支只演「雲只跟著他一個人、只下在他身上」。
// 雲、雲、雲朵、這是什麼字？、雲

/** 小恐龍：最大的明星（圖朝左，整支大多 flip 朝右） */
const S = 42
const P = 77 - 0.42 * S
/** 頭頂（雨打到的地方）：hero 圖的頭頂約在 y − 0.45 × size */
const HEAD = P - 0.45 * S + 1
/** 每一次站的地方：一開始、跳開以後、偷溜到的地方、紙箱 */
const X1 = 54
const X2 = 88
const X3 = 100
const BX = 131

/** 雲（prop:smoke：一大團不透明的白雲、淺灰描邊）：這個字講的東西，比他的頭大很多 */
const CS = 38
/** 雲停在他正上方的高度（雲底約 y 31，他的頭頂約 y 41，中間是雨） */
const CY = 18
const cloudBottom = (y: number, k = 1) => y + 0.42 * CS * k
/** 下雨前雲一鼓、變灰（烏雲）；不下的時候白白的 */
const GREY = 'brightness(.74) saturate(.7)'
/** 雲的影子罩住他：整隻暗一點 */
const SHADE = 'brightness(.8)'

/** 荷葉傘（舉在頭上） */
const LS = 30
const LEAF = { x: X2 - 3, y: 31 }
/** 紙箱（打開的、箱口朝上，可以躲人） */
const BS = 34
const BY = 77 - 0.42 * BS

/** 字框：左上角（雲的路線在中間到右上，太陽在右上），背後是素色的天空 */
const FRAME = { x: 17, y: 17 }
const FRAME_K = 0.4

const RAIN = '#1D4FC4'
const RAIN_HI = '#8FC0F5'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 一陣雨：一條一條藍色的雨線，從 src[i] 往 dst[i] 落下去（每 0.07 秒換一批位置，看起來一直往下掉）。
 * 雨線錨在雲上（下雨時雲不動），cloud 是雲當下的中心。
 */
function rain(at: number, dur: number, cloud: Vec, cols: { src: Vec; dst: Vec }[], width: number, len: number): Fx[] {
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
      out.push({ at: t, dur: 0.2, kind: 'line', actor: 'cloud', dx: p0.x - cloud.x, dy: p0.y - cloud.y, to: p1, color: RAIN, width })
      out.push({ at: t, dur: 0.2, kind: 'line', actor: 'cloud', dx: p0.x - cloud.x, dy: p0.y - cloud.y, to: p1, color: RAIN_HI, width: width * 0.35 })
    })
  }
  return out
}

/** 從雲底直直下到他身上：頭那一塊停在頭頂（不蓋住臉），兩邊一路下到地上 */
function overhead(x: number, k: number) {
  const offs = k === 0 ? [-17, -12, -7, -2, 3, 8, 13, 18] : [-17, -12, -7, -2, 3, 8, 13, 18]
  // flip 朝右：頭在右半邊
  return offs.map((o) => {
    const onHead = o > -8 && o < 15
    return { src: { x: x + o, y: cloudBottom(CY) - 1 }, dst: { x: x + o - 2, y: onHead ? HEAD + 2 : 73 } }
  })
}

/**
 * 同一個笑點「嘩啦」：雲已經停在他頭上（影子罩住他）→ 雲一鼓、變灰、抖一下（預備）→ 嘩啦！雨只下在他身上＋💦＋鏡頭推近＋震＋同一個音效，
 * 他淋成落湯雞、傻眼停住；下完雲變回白的，得意地彈一下。at 是嘩啦的那一刻，k 是第幾次（0～3），cloud 是雲那時候的位置，
 * cols 是這一次的雨（第 3 次在紙箱裡、看不到雨；第 4 次不下）。
 */
function soak(at: number, k: number, cloud: Vec, cols: { src: Vec; dst: Vec }[], rainDur: number, hit: Vec): Gag {
  const moves: Move[] = [
    { at: at - 0.45, actor: 'cloud', do: 'tint', filter: GREY },
    { at: at - 0.45, dur: 0.3, actor: 'cloud', do: 'squash', amount: -0.14 - 0.03 * k },
    { at: at - 0.3, dur: 0.22, actor: 'cloud', do: 'shake', amount: 1 + 0.3 * k },
  ]
  const fx: Fx[] = []
  const camera: Camera[] = []
  const cues: Cue[] = [{ at: at - 0.45, sfx: 'deflate' }]
  const lights: Light[] = []
  if (k < 3) {
    moves.push(
      { at: at + rainDur, actor: 'cloud', do: 'tint', filter: '' },
      { at: at + rainDur, dur: 0.3, actor: 'cloud', do: 'bounce', amount: 1.5, times: 2 },
    )
    if (cols.length) fx.push(...rain(at, rainDur, cloud, cols, 1.8 + 0.5 * k, 18 + 3 * k))
    // 打到的地方水花四濺（一次比一次大）
    fx.push({ at: at + 0.05, kind: 'burst', x: hit.x, y: hit.y, emoji: '💦', n: 6 + 2 * k, dur: 0.5, scale: 1.1 + 0.3 * k })
    camera.push(
      { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: hit.x, y: 48 } },
      { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.45 * k },
    )
    lights.push({ at, dur: 0.03, level: -0.12 - 0.04 * k }, { at: at + 0.03, dur: 0.2, level: 0 })
    // 同一個音效，一次比一次多疊一個
    cues.push({ at, sfx: 'splash' })
    if (k >= 1) cues.push({ at: at + 0.05, sfx: 'bubble' })
    if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
  }
  return { moves, fx, camera, cues, lights }
}

/** 雲「咻」地跟過去，停在 to（他的頭上），影子又罩住他 */
function follow(at: number, to: Vec, dur = 0.28): Gag {
  return {
    moves: [
      { at, dur, actor: 'cloud', do: 'moveTo', to, ease: 'back' },
      { at: at + dur, actor: 'rex', do: 'tint', filter: SHADE },
    ],
    fx: [], camera: [], lights: [],
    cues: [{ at, sfx: 'whoosh' }],
  }
}

/** 第 1 次：毛毛雨，直直下在他頭上 */
const H1 = 1.55
/** 第 2 次：他撐荷葉，雲繞到旁邊斜著下大雨 */
const H2 = 3.65
/** 第 3 次：躲進紙箱，雲擠進箱子縫，箱子裡轟隆嘩啦 */
const H3 = 6.6
/** 回馬槍：雲一鼓、變灰……沒有下 */
const H4 = 10.05

/** 第 2 次雲繞到他右邊、比他的頭低一點，斜著往他身上下 */
const SIDE = { x: X2 + 36, y: 34 }
const sideCols = [-2, 2, 6, 10, 14].map((d, i) => ({
  src: { x: SIDE.x - 15, y: SIDE.y - 4 + i * 3 },
  dst: { x: X2 - 6 + d, y: 46 + i * 6 },
}))
/** 雨四點從斜斜落下來的雨裡飛出來的那一點 */
const DROP = { x: X2 + 12, y: 52 }

const g1 = soak(H1, 0, { x: X1, y: CY }, overhead(X1, 0), 0.7, { x: X1 + 4, y: HEAD })
const f1 = follow(2.75, { x: X2, y: CY })
const g2 = soak(H2, 1, SIDE, sideCols, 0.7, { x: X2 + 4, y: 52 })
const g3 = soak(H3, 2, { x: BX, y: 50 }, [], 0, { x: BX - 6, y: 58 })
const g4 = soak(H4, 3, { x: 128, y: CY }, [], 0, { x: 128, y: 40 })
const all = [g1, f1, g2, g3, g4]

/** 語詞那一刻：雲在畫面中間，又大又白又蓬 */
const WORD = 9.0
const WC = { x: 76, y: 44 }
const WK = 1.4
/** 雲從紙箱冒出來、又罩住他 */
const OUT = H3 + 0.45
const HOME = 7.65
const PARK = 8.45
/** 回馬槍時他站的地方（右邊，面向左邊的雲） */
const RX = 128
const ASK = 11.1
const ANSWER = 13.65
const AX = 36
const ASK_S = 1.22

const clip: Clip = {
  format: 2,
  char: '雲',
  meta: { theme: '大晴天，一朵小雲只跟著他一個人下雨', cast: '小恐龍＋小白雲＋荷葉傘／紙箱', gags: ['一朵小雲飄到小恐龍頭頂上，一鼓變灰，「嘩啦」雨只下在他一個人身上（左右都是大太陽），他往旁邊一躲，雲咻地跟過去又罩住他；一次比一次難躲、雨一次比一次大（毛毛雨→撐荷葉，雲繞到旁邊斜著下大雨→停一拍：踮腳偷溜、突然衝到另一頭躲進紙箱蓋起來，雲擠進箱子縫，箱子裡轟隆嘩啦水噴出來）；回馬槍是他放棄了垂頭喪氣讓它下，雲一鼓卻沒下，變回白白蓬蓬的飄下來蹭他，原來只是想跟他玩，他抱住雲，頭上出現彩虹'] },
  duration: 15,
  // 藍一點的天空：白雲的描邊、灰色的烏雲、藍色的雨都看得清楚；右上角有太陽（大晴天）
  bg: { top: '#78B4EC', bottom: '#D8ECFA', floor: '#A9D37F', scenery: 'hills' },
  actors: [
    { id: 'rex', emoji: 'hero:rex/walk', x: X1, y: P, size: S, flip: true, hidden: true },
    // 雲畫在他前面（擠進紙箱時畫在紙箱後面）
    { id: 'cloud', emoji: 'prop:smoke', x: 190, y: CY, size: CS, float: true },
    { id: 'leaf', emoji: 'prop:lotus-leaf', x: LEAF.x, y: LEAF.y, size: LS, float: true, hidden: true, pivot: 'center' },
    { id: 'box', emoji: 'prop:box', x: BX, y: BY, size: BS },
  ],
  moves: [
    // 大晴天，他開開心心走進來
    { at: 0, dur: 0.5, actor: 'rex', do: 'enter', from: { x: -30, y: P }, ease: 'out' },
    { at: 0.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    // 一朵小雲從右邊慢慢飄過來，停在他正上方
    { at: 0.1, dur: 0.85, actor: 'cloud', do: 'moveTo', to: { x: X1, y: CY }, ease: 'out' },
    // 影子罩住他，他抬頭指著它：雲！
    { at: 0.8, actor: 'rex', do: 'tint', filter: SHADE },
    { at: 0.8, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: 0.8, dur: 0.25, actor: 'rex', do: 'hop', amount: 2.5 },
    // 第 1 次：雲一鼓……嘩啦！毛毛雨只下在他身上
    { at: H1 - 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    ...g1.moves,
    { at: H1 + 0.12, actor: 'rex', do: 'swap', emoji: 'hero:rex/cold' },
    { at: H1 + 0.12, dur: 0.5, actor: 'rex', do: 'shake', amount: 0.6 },
    // 往右一跳，跳出雲的影子：大太陽，好險！
    { at: 2.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/jump' },
    { at: 2.3, dur: 0.32, actor: 'rex', do: 'moveTo', to: { x: X2, y: P }, arc: 8, ease: 'out' },
    { at: 2.4, actor: 'rex', do: 'tint', filter: '' },
    { at: 2.62, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    // 雲咻地跟過來，又罩住他
    ...f1.moves,
    { at: 3.03, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    // 第 2 次：他撐起大荷葉當傘——雲就繞到旁邊，斜著下大雨
    { at: 3.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/lift' },
    { at: 3.2, dur: 0.2, actor: 'leaf', do: 'pop' },
    { at: H2 - 0.42, dur: 0.22, actor: 'cloud', do: 'moveTo', to: SIDE, arc: 6, ease: 'inOut' },
    ...g2.moves,
    // 荷葉被沖飛，他淋得大哭
    { at: H2 + 0.08, dur: 0.4, actor: 'leaf', do: 'moveTo', to: { x: 52, y: -30 }, ease: 'out' },
    { at: H2 + 0.08, dur: 0.4, actor: 'leaf', do: 'rotateTo', amount: -220 },
    { at: H2 + 0.5, dur: 0.01, actor: 'leaf', do: 'vanish' },
    { at: H2 + 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: H2 + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/cry' },
    { at: H2 + 0.3, dur: 0.45, actor: 'rex', do: 'shake', amount: 0.7 },
    // 雲回到他頭上
    { at: 4.45, dur: 0.25, actor: 'cloud', do: 'moveTo', to: { x: X2, y: CY }, ease: 'out' },
    // 第 3 次前停一拍：他踮腳偷偷往右溜，雲也偷偷跟著……他偷看一眼
    { at: 4.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/sneak' },
    { at: 4.8, dur: 0.15, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: 4.8, dur: 0.6, actor: 'rex', do: 'moveTo', to: { x: X3, y: P }, ease: 'linear' },
    { at: 4.95, dur: 0.15, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: 5.1, dur: 0.15, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: 5.25, dur: 0.15, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: 4.9, dur: 0.6, actor: 'cloud', do: 'moveTo', to: { x: X3, y: CY }, ease: 'linear' },
    { at: 5.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/peek' },
    // 突然全速衝到畫面另一頭，跳進紙箱
    { at: 5.75, actor: 'rex', do: 'tint', filter: '' },
    { at: 5.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: 5.75, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: BX - 20, y: P }, anticipate: 3, ease: 'in' },
    { at: 5.95, actor: 'rex', do: 'swap', emoji: 'hero:rex/jump' },
    { at: 5.95, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: BX, y: P }, arc: 8, ease: 'out' },
    { at: 6.15, dur: 0.2, actor: 'box', do: 'squash', amount: 0.15 },
    // 蓋起來：只看得到一個關好的紙箱
    { at: 6.15, dur: 0.05, actor: 'rex', do: 'vanish' },
    { at: 6.3, actor: 'box', do: 'swap', emoji: '📦' },
    // 雲被甩在後面，左看右看
    { at: 6.0, dur: 0.3, actor: 'cloud', do: 'tilt', amount: 10, times: 2 },
    // 安靜兩拍……雲飄過去，縮成一小團擠進箱子縫
    { at: 6.05, dur: 0.25, actor: 'cloud', do: 'moveTo', to: { x: BX, y: 26 }, ease: 'inOut' },
    { at: 6.3, dur: 0.25, actor: 'cloud', do: 'moveTo', to: { x: BX, y: 50 }, ease: 'in' },
    { at: 6.3, dur: 0.25, actor: 'cloud', do: 'scaleTo', amount: 0.3, ease: 'in' },
    { at: 6.55, dur: 0.05, actor: 'cloud', do: 'vanish' },
    // 箱子裡轟隆嘩啦！箱子跳起來
    ...g3.moves,
    { at: H3, dur: 0.4, actor: 'box', do: 'shake', amount: 2.4 },
    { at: H3, dur: 0.3, actor: 'box', do: 'hop', amount: 4 },
    // 紙箱被沖飛，他濕答答地站在原地大哭，雲從水裡冒出來又罩住他
    { at: OUT, actor: 'box', do: 'swap', emoji: 'prop:box' },
    { at: OUT, dur: 0.4, actor: 'box', do: 'moveTo', to: { x: 192, y: 30 }, ease: 'out' },
    { at: OUT, dur: 0.4, actor: 'box', do: 'rotateTo', amount: 160 },
    { at: OUT, actor: 'rex', do: 'swap', emoji: 'hero:rex/cry' },
    { at: OUT, dur: 0.01, actor: 'rex', do: 'moveTo', to: { x: BX, y: P } },
    { at: OUT, dur: 0.2, actor: 'rex', do: 'pop' },
    { at: OUT, actor: 'rex', do: 'tint', filter: SHADE },
    { at: OUT + 0.2, dur: 0.5, actor: 'rex', do: 'shake', amount: 0.6 },
    { at: OUT - 0.01, dur: 0.01, actor: 'cloud', do: 'moveTo', to: { x: BX, y: CY } },
    { at: OUT, dur: 0.25, actor: 'cloud', do: 'pop' },
    // 國字拼好、到正中央；他不哭了，讓位以後雲飄到中間
    { at: HOME + 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: PARK, actor: 'rex', do: 'flip' },
    { at: PARK, actor: 'rex', do: 'tint', filter: '' },
    { at: WORD - 0.3, dur: 0.3, actor: 'cloud', do: 'moveTo', to: WC, ease: 'out' },
    { at: WORD - 0.3, dur: 0.3, actor: 'cloud', do: 'scaleTo', amount: WK, ease: 'back' },
    // 語詞那一刻：雲在中間又大又白又蓬，開心地彈兩下；他在旁邊指著它：雲朵！
    { at: WORD - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: RX, y: P }, ease: 'out' },
    { at: WORD, dur: 0.25, actor: 'cloud', do: 'hop', amount: 2.5 },
    { at: WORD + 0.3, dur: 0.25, actor: 'cloud', do: 'hop', amount: 2.5 },
    // 回馬槍：雲又飄回他頭上；他放棄了，垂頭喪氣、閉上眼睛讓它下
    { at: 9.45, dur: 0.3, actor: 'cloud', do: 'moveTo', to: { x: RX, y: CY }, ease: 'inOut' },
    { at: 9.45, dur: 0.3, actor: 'cloud', do: 'scaleTo', amount: 1 / WK, ease: 'inOut' },
    { at: 9.75, actor: 'rex', do: 'tint', filter: SHADE },
    { at: 9.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/hungry' },
    { at: 9.5, dur: 0.35, actor: 'rex', do: 'tilt', amount: 6 },
    { at: H4 - 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/duck' },
    ...g4.moves,
    // ……沒有下。雲變回白白蓬蓬的，飄下來貼在他身邊蹭一蹭
    { at: H4 + 0.2, actor: 'cloud', do: 'tint', filter: '' },
    { at: H4 + 0.2, dur: 0.2, actor: 'cloud', do: 'squash', amount: 0.12 },
    { at: H4 + 0.3, dur: 0.3, actor: 'cloud', do: 'moveTo', to: { x: RX - 26, y: 46 }, ease: 'out' },
    { at: H4 + 0.6, dur: 0.4, actor: 'cloud', do: 'tilt', amount: 9, times: 2 },
    { at: H4 + 0.3, actor: 'rex', do: 'tint', filter: '' },
    { at: H4 + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    // 他張開手抱住它
    { at: H4 + 0.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/hug' },
    { at: H4 + 0.5, dur: 0.25, actor: 'rex', do: 'hop', amount: 2 },
    // 問他：他走到左前方、變大，轉向觀眾；小雲跟著他，停在他頭上
    { at: ASK - 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
    { at: ASK - 0.1, dur: 0.35, actor: 'rex', do: 'moveTo', to: { x: AX, y: P - 1 }, ease: 'out' },
    { at: ASK - 0.05, dur: 0.4, actor: 'cloud', do: 'moveTo', to: { x: AX - 4, y: 17 }, ease: 'out' },
    { at: ASK + 0.3, actor: 'rex', do: 'flip' },
    { at: ASK + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK + 0.3, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: 12.6, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, dur: 0.3, actor: 'rex', do: 'hop', amount: 7 },
    { at: ANSWER, dur: 0.3, actor: 'cloud', do: 'hop', amount: 3 },
    // 退場：他往左跑出去，小雲咻地跟著他，畫面只留下字
    { at: ANSWER + 0.12, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: ANSWER + 0.12, dur: 0.18, actor: 'rex', do: 'moveTo', to: { x: -45, y: P - 1 }, ease: 'in' },
    { at: ANSWER + 0.12, dur: 0.18, actor: 'cloud', do: 'moveTo', to: { x: -40, y: 17 }, ease: 'in' },
  ],
  builds: [
    // 毛毛雨：雨的外框從雲身上飛出來
    { at: H1 + 0.1, dur: 0.5, strokes: [0, 1, 2, 3], from: 'cloud', color: partColor('雨') },
    // 大雨：四點雨滴從斜斜落下來的雨裡飛進字框
    { at: H2 + 0.15, dur: 0.5, strokes: [4, 5, 6, 7], from: DROP, color: partColor('雨') },
    // 紙箱裡轟隆嘩啦以後：云從冒出來的雲身上飛出來
    { at: OUT + 0.1, dur: 0.5, strokes: [8, 9, 10, 11], from: 'cloud', color: partColor('云') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['rex', 'cloud'], to: { x: 104, y: 45 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    // 淋濕了：一直滴水
    { at: H1 + 0.2, kind: 'sweat', actor: 'rex', dx: -6 },
    { at: H2 + 0.35, kind: 'sweat', actor: 'rex', dx: -6 },
    // 紙箱裡轟隆嘩啦：水從箱子縫往上、往兩邊噴出來
    { at: H3, dur: 0.55, kind: 'fountain', actor: 'box', n: 10, scale: 1.4 },
    { at: H3 + 0.05, kind: 'burst', x: BX, y: 52, n: 1, dur: 0.35, scale: 1.8 },
    { at: OUT, kind: 'burst', x: BX - 6, y: 50, emoji: '💦', n: 8, dur: 0.5, scale: 1.15 },
    { at: OUT + 0.25, kind: 'sweat', actor: 'rex', dx: -6 },
    // 語詞那一刻：雲亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: WC.x, y: WC.y, n: 8, emoji: '✨', scale: 1.4 },
    // 回馬槍：雲蹭他，冒出愛心；他抱住它，頭上一道彩虹
    { at: H4 + 0.45, dur: 0.5, kind: 'pop', actor: 'cloud', emoji: '💕', dx: -4, dy: 4, scale: 1.5 },
    { at: H4 + 0.5, dur: ASK - H4 - 0.55, kind: 'pop', x: RX - 34, y: 40, emoji: '🌈', scale: 3 },
  ],
  camera: [
    // 鏡頭鎖全景（雲在畫面上半移動、雨連著雲和他，整條都要在畫面裡），只有嘩啦的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: OUT, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.85, say: '雲' },
    ...all.flatMap((g) => g.cues),
    { at: 2.3, sfx: 'boing' },
    { at: 3.2, sfx: 'blip' },
    { at: H2 + 0.1, sfx: 'whoosh' },
    { at: 5.75, sfx: 'whoosh' },
    { at: 6.3, sfx: 'tap' },
    { at: 6.3, sfx: 'slide' },
    { at: OUT, sfx: 'poof' },
    { at: HOME + 0.05, say: '雲' },
    { at: WORD, say: '雲朵' },
    { at: H4 + 0.25, sfx: 'boing' },
    { at: H4 + 0.5, sfx: 'blip' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '雲' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
