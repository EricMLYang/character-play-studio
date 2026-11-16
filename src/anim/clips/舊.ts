import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 舊（v2）：舊東西用了好久好久，灰灰的、一碰就壞。楊捷睿在院子裡翻一個舊箱子，每次「咚」地跳出一樣灰撲撲的舊東西，
// 他伸手拍一拍——「噗！」揚起一大團灰，「喀啦！」東西整個垮掉、零件四散，他傻眼、被灰嗆得打一個大噴嚏，一次比一次大件、垮得一次比一次慘：
// 舊書（書頁飛出來）→ 舊椅子（木條飛出來）→ 先停一拍：舊腳踏車，他托著下巴不太敢碰，只用一根手指輕輕一點——垮成一片、輪子飛出去，他被灰轟得一屁股跌坐。
// 語詞那一刻：箱子裡又跳出一本舊書，揚起一小團灰，他指著：「舊書」，然後小心地把它丟回箱子。
// 回馬槍（第四次）：最後跳出來的是最舊最破、耳朵貼著補丁的玩偶熊。他拍一拍——最大的一團灰！他抱頭蹲下等著「喀啦」……熊好好的，沒壞！
// 他鬆一口氣，被灰嗆得打出最大的噴嚏——「喀啦！」垮掉的是後面那個舊箱子。他抱起最愛的舊熊熊跑走。
// 最後畫面暗下來只剩「舊」，他走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「舊！」，然後退場只留字。
// 刻意不跟「新」（新東西被泥巴打髒）撞：這支沒有泥巴、沒有烏雲、不拿新東西來比，只演「舊＝用很久了：灰灰的、一拍就噗一團灰、一碰就垮」。
// 也不跟「分」（手刀劈成兩半）、「粉」（噴嚏把粉噴到別人身上）撞：東西是被輕輕一拍就自己垮掉，噴嚏只是被灰嗆到的反應（第四次才是噴嚏震垮箱子）。
// 舊、舊、舊書、這是什麼字？、舊

/** 楊捷睿（hero:yang；圖朝左，flip 以後看著右邊的舊東西） */
const YS = 36
const YY = 77 - 0.42 * YS
/** 每次都站在同一個地方（左邊，國字字框在他頭頂上方的天空） */
const YX = 34
/** 舊東西每次都落在畫面正中間 */
const ICX = 80
/** 舊東西共用一個角色換圖：底子 size 寫最大的（舊腳踏車），其他用 scaleTo 縮（寫在 pop 之後） */
const IB = 46
const IY = 77 - 0.42 * IB
const ITEMS = [
  { emoji: 'prop:book-ajar', size: 30, bits: '📄', flat: 1.7 },
  { emoji: '🪑', size: 38, bits: '🪵', flat: 2.2 },
  { emoji: '🚲', size: 46, bits: '🛞', flat: 2.8 },
]
/** 語詞那一刻的舊書、回馬槍的舊熊熊 */
const WORD_BOOK = 38
const BEAR = 42
/** 舊箱子（右下） */
const BOX: Vec = { x: 134, y: 77 - 0.42 * 32 }
const BOX_SIZE = 32
/** 灰塵雲（prop:smoke 染成灰褐色）：底子 size 寫最大的（第 4 次），一次比一次大 */
const DB = 66
const DUST = [32, 44, 58, 66]
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 33, y: 22 }
const PARK_AMT = 0.5
/** 傻眼停多久 */
const HOLD_FACE = 0.42

/** 舊東西：褪色、灰灰的 */
const OLD = 'grayscale(.55) sepia(.4) brightness(.97) contrast(.92)'
/** 最舊最破的熊熊：更灰 */
const OLDEST = 'grayscale(.8) sepia(.45) brightness(.85) contrast(.9)'
/** 灰塵：灰褐色 */
const DUSTY = 'sepia(.6) saturate(.7) brightness(.74)'

/** 角色以腳底為準縮放：要讓縮過的東西「中心」在 cy，角色的 y 要這樣算 */
const yFor = (cy: number, size: number, base: number) => cy + 0.42 * size - 0.42 * base
/** 站在地上、size 為 s 的東西的中心 */
const cyOf = (s: number) => 77 - 0.42 * s

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 「咚」：舊東西從箱子裡跳出來，落在畫面正中間。at 是跳出來那一刻 */
function popOut(at: number, emoji: string, size: number, tint: string): { moves: Move[]; cues: Cue[] } {
  return {
    moves: [
      { at: at - 0.2, actor: 'box', do: 'shake', amount: 1.2, dur: 0.2 },
      { at: at - 0.03, actor: 'item', do: 'swap', emoji },
      { at: at - 0.03, actor: 'item', do: 'tint', filter: tint },
      { at: at - 0.02, actor: 'item', do: 'moveTo', to: { x: BOX.x, y: IY - 14 }, dur: 0.01 },
      { at, actor: 'item', do: 'pop', dur: 0.16 },
      { at: at + 0.001, actor: 'item', do: 'scaleTo', amount: size / IB, dur: 0.01 },
      { at: at + 0.04, actor: 'item', do: 'moveTo', to: { x: ICX, y: IY }, arc: 12, dur: 0.32, ease: 'out' },
      { at, actor: 'box', do: 'squash', amount: -0.15, dur: 0.2 },
    ],
    cues: [{ at, sfx: 'plop' }],
  }
}

/** 「噗！」灰塵雲從舊東西後面冒出來、漲大、散掉。at 是冒出來那一刻，size 是舊東西的大小 */
function dust(at: number, size: number, ds: number): { moves: Move[]; fx: Fx[]; cues: Cue[] } {
  const cy = cyOf(size) - 0.28 * size
  return {
    moves: [
      { at: at - 0.02, actor: 'dust', do: 'moveTo', to: { x: ICX, y: yFor(cy, ds, DB) }, dur: 0.01 },
      { at, actor: 'dust', do: 'pop', dur: 0.2 },
      { at: at + 0.001, actor: 'dust', do: 'scaleTo', amount: ds / DB, dur: 0.01 },
      { at: at + 0.2, actor: 'dust', do: 'scaleTo', amount: 1.12, dur: 0.45, ease: 'out' },
      { at: at + 0.66, actor: 'dust', do: 'vanish', dur: 0.24 },
    ],
    fx: [{ at, kind: 'puff', actor: 'item', dur: 0.5 }],
    cues: [{ at, sfx: 'poof' }],
  }
}

/** 他走近、伸手拍一拍（兩下）。at 是第一下 */
function pat(at: number, size: number): { moves: Move[]; cues: Cue[] } {
  const near = ICX - 0.36 * size - 13
  return {
    moves: [
      { at: at - 0.24, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: at - 0.24, actor: 'yang', do: 'moveTo', to: { x: near, y: YY }, dur: 0.22, ease: 'out' },
      { at, actor: 'item', do: 'squash', amount: 0.08, dur: 0.1 },
      { at, actor: 'yang', do: 'tilt', amount: -5, dur: 0.1 },
      { at: at + 0.12, actor: 'item', do: 'squash', amount: 0.08, dur: 0.1 },
      { at: at + 0.12, actor: 'yang', do: 'tilt', amount: -5, dur: 0.1 },
    ],
    cues: [{ at, sfx: 'tap' }, { at: at + 0.12, sfx: 'tap' }],
  }
}

/** 被灰嗆到：吸一口氣（拉長）→ 「哈啾！」 at 是噴嚏那一刻 */
function sneeze(at: number, k: number): { moves: Move[]; fx: Fx[]; cues: Cue[] } {
  return {
    moves: [
      { at: at - 0.2, actor: 'yang', do: 'squash', amount: -0.12 - 0.03 * k, dur: 0.2 },
      { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneeze' },
      { at, actor: 'yang', do: 'squash', amount: 0.18 + 0.04 * k, dur: 0.22 },
      { at, actor: 'yang', do: 'tilt', amount: -10 - 3 * k, dur: 0.25 },
    ],
    fx: [],
    cues: [{ at, sfx: 'achoo' }],
  }
}

/**
 * 「喀啦！」舊東西整個垮掉：壓成扁扁的一攤＋零件四散＋💥＋鏡頭推近＋震＋同一個音效（一次多疊一個音）。
 * 垮掉的那一攤停一下，再「噗」地化成灰散掉。at 是垮掉那一刻、c 是東西中心。
 */
function crumble(at: number, k: number, c: Vec, actor: string, flat: number, bits: string, gone: number): Gag {
  const moves: Move[] = [
    { at, actor, do: 'stretchTo', amount: flat, dur: 0.14, ease: 'out' },
    { at, actor, do: 'shake', amount: 1 + 0.4 * k, dur: 0.3 },
    // 垮掉的那一攤化成灰散掉
    { at: gone, actor, do: 'vanish', dur: 0.22 },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', x: c.x, y: c.y, n: 1, dur: 0.38, scale: 1 + 0.3 * k },
    { at, kind: 'burst', x: c.x, y: c.y - 2, emoji: bits, n: 5 + k, dur: 0.55, scale: 1 + 0.3 * k },
    { at: gone, kind: 'puff', actor, dur: 0.45 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: c.x + 10, y: 50 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'crack' }, { at: at + 0.03, sfx: 'rumble' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'slide' })
  return { moves, fx, camera, cues }
}

/**
 * 同一個笑點（第 1～3 次）：箱子裡跳出一樣舊東西 → 他走近拍一拍 → 「噗！」一團灰 → 「喀啦！」東西垮掉、零件四散 →
 * 傻眼停住 → 被灰嗆得「哈啾！」→ 退回原位。at 是「喀啦」那一刻，k 是第幾次；pause 是第三次前停的那一拍。
 */
function gag(at: number, k: number, pause = 0): Gag {
  const it = ITEMS[k]
  const pop = at - 0.92 - pause
  const c: Vec = { x: ICX, y: cyOf(it.size) }
  const o = popOut(pop, it.emoji, it.size, OLD)
  const p = pat(at - 0.34, it.size)
  const d = dust(at - 0.16, it.size, DUST[k])
  const hit = crumble(at, k, c, 'item', it.flat, it.bits, at + 0.48)
  const sn = sneeze(at + HOLD_FACE + 0.08, k)
  const moves: Move[] = [
    ...o.moves,
    { at: pop + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...p.moves,
    ...d.moves,
    ...hit.moves,
    // 喀啦！傻眼
    { at: at + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: at + 0.02, actor: 'yang', do: 'squash', amount: -0.12, dur: 0.16 },
    ...sn.moves,
    // 一次比一次被嗆得往後退得遠（第 3 次一屁股跌坐）
    { at: at + HOLD_FACE + 0.1, actor: 'yang', do: 'moveTo', to: { x: YX - (k === 2 ? 4 : 0), y: YY }, arc: 2 + 3 * k, dur: 0.26, ease: 'out' },
    // 垮掉的東西消失後回原樣（stretchTo 會自己重來）
  ]
  if (k === 2) moves.push({ at: at + HOLD_FACE + 0.36, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' })
  const fx: Fx[] = [...d.fx, ...hit.fx, ...sn.fx]
  if (k >= 1) fx.push({ at: at + 0.15, kind: 'sweat', actor: 'yang', dx: 8 })
  return { moves, fx, camera: hit.camera, cues: [...o.cues, ...p.cues, ...d.cues, ...hit.cues, ...sn.cues] }
}

// 第 1 次：舊書
const S1 = 1.95
const g1 = gag(S1, 0)
// 第 2 次：舊椅子
const S2 = S1 + 1.65
const g2 = gag(S2, 1)
// 第 3 次前停一拍：舊腳踏車跳出來，他托著下巴、冒汗，不太敢碰——只用一根手指輕輕一點
const PAUSE = 0.42
const S3 = S2 + 1.65 + PAUSE
const g3 = gag(S3, 2, PAUSE)
const DOUBT = S3 - 0.92 - PAUSE + 0.4
/** 字框填滿、國字到正中央（他跌坐在右邊、箱子在左下，都讓開） */
const HOME = S3 + 0.85
const PARK = HOME + 0.85
/** 語詞那一刻：箱子裡又跳出一本舊書，揚起一小團灰 */
const WORD = PARK + 0.12
const WB = popOut(WORD, 'prop:book-ajar', WORD_BOOK, OLD)
const WORD_DUST = dust(WORD + 0.36, WORD_BOOK, 28)
const WORD_SAY = WORD + 0.3
/** 小心地把舊書丟回箱子 */
const TOSS = WORD_SAY + 0.62
// 回馬槍（第 4 次）：最舊最破的熊熊
const BEAR_POP = TOSS + 0.3
const BB = popOut(BEAR_POP, '🧸', BEAR, OLDEST)
const PAT4 = BEAR_POP + 0.45
const P4 = pat(PAT4, BEAR)
const DUST4 = PAT4 + 0.18
const D4 = dust(DUST4, BEAR, DUST[3])
/** 抱頭蹲下等著「喀啦」…… */
const DUCK = DUST4 + 0.08
/** 熊熊好好的！ */
const FINE = DUCK + 0.36
/** 被灰嗆得打出最大的噴嚏——垮掉的是後面的舊箱子 */
const S4 = FINE + 0.23
const SN4 = sneeze(S4, 3)
const BOX_C: Vec = { x: BOX.x - 12, y: BOX.y }
const g4 = crumble(S4 + 0.06, 3, BOX_C, 'box', 3, '📄', S4 + 0.6)
/** 抱起熊熊跑走 */
const HUG = S4 + 0.4
const RUN = HUG + 0.28
/** 問他 */
const ASK = RUN + 0.28
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 122, y: YY + 3 }
/** 熊熊耳朵上的補丁（🩹）：貼在熊熊右耳上（他那一側看得到） */
const PATCH = 11
const patchAt = (x: number) => ({ x: x + 0.26 * BEAR, y: cyOf(BEAR) - 0.36 * BEAR })

const builds: Build[] = [
  // 喀啦！從垮掉的舊東西裡掉出來：艹 → 隹 → 臼
  { at: S1 + 0.08, dur: 0.5, strokes: [0, 1, 2, 3], from: 'item', color: partColor('艹') },
  { at: S2 + 0.08, dur: 0.55, strokes: [4, 5, 6, 7, 8, 9, 10, 11], from: 'item', color: partColor('隹') },
  { at: S3 + 0.08, dur: 0.5, strokes: [12, 13, 14, 15, 16, 17], from: 'item', color: partColor('臼') },
]

const clip: Clip = {
  format: 2,
  char: '舊',
  meta: { theme: '舊東西一碰就垮', cast: '楊捷睿＋舊箱子＋舊東西＋灰塵', gags: ['楊捷睿從舊箱子裡翻出灰撲撲的舊東西，每次伸手拍一拍，「噗！」揚起一大團灰，「喀啦！」東西整個垮掉、零件四散，他傻眼、被灰嗆得打噴嚏，一次比一次大件（舊書→舊椅子→先停一拍不敢碰，只用一根手指點一下舊腳踏車，垮成一片、他跌坐）；回馬槍是最舊最破、貼著補丁的熊熊，拍出最大的一團灰，他抱頭等著——熊熊沒壞，他的大噴嚏反而把後面的舊箱子震垮了，他抱著最愛的舊熊熊跑走'] },
  duration: 15,
  bg: { top: '#C9E4F2', bottom: '#F3F8FA', floor: '#D8C79E', scenery: 'hills' },
  actors: [
    { id: 'box', emoji: 'prop:box', x: BOX.x, y: BOX.y, size: BOX_SIZE, tint: OLD },
    { id: 'dust', emoji: 'prop:smoke', x: ICX, y: 40, size: DB, hidden: true, float: true, tint: DUSTY },
    { id: 'item', emoji: ITEMS[0].emoji, x: BOX.x, y: IY, size: IB, hidden: true, tint: OLD },
    { id: 'patch', emoji: '🩹', x: 0, y: 0, size: PATCH, hidden: true, float: true, tint: 'saturate(.5) sepia(.3)' },
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: YY, size: YS },
  ],
  moves: [
    // 開場：從右邊跑進來，抬頭指著左上的字框「舊」，再轉身面向箱子
    { at: 0, actor: 'yang', do: 'enter', from: { x: 190, y: YY }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 0.95, actor: 'yang', do: 'flip' },
    { at: 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 1 次：舊書
    ...g1.moves,
    // 第 2 次：舊椅子
    ...g2.moves,
    // 第 3 次：舊腳踏車。先停一拍：托著下巴、不太敢碰
    { at: DOUBT, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: DOUBT + 0.05, actor: 'yang', do: 'tilt', amount: 6, dur: 0.3 },
    ...g3.moves,
    // 語詞：箱子裡又跳出一本舊書，揚起一小團灰，他站起來指著
    { at: WORD - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...WB.moves,
    ...WORD_DUST.moves,
    { at: WORD_SAY, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: WORD_SAY, actor: 'yang', do: 'moveTo', to: { x: ICX - 30, y: YY }, dur: 0.25, ease: 'out' },
    // 不敢拍，小心地把舊書丟回箱子
    { at: TOSS, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
    { at: TOSS, actor: 'item', do: 'moveTo', to: { x: BOX.x, y: IY - 12 }, arc: 14, dur: 0.3, ease: 'in' },
    { at: TOSS + 0.3, actor: 'item', do: 'vanish', dur: 0.04 },
    { at: TOSS + 0.32, actor: 'box', do: 'squash', amount: 0.15, dur: 0.18 },
    // 回馬槍：最舊最破的熊熊（耳朵上貼著補丁）
    ...BB.moves,
    { at: BEAR_POP + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    { at: BEAR_POP + 0.38, actor: 'patch', do: 'moveTo', to: patchAt(ICX), dur: 0.01 },
    { at: BEAR_POP + 0.4, actor: 'patch', do: 'pop', dur: 0.2 },
    ...P4.moves,
    ...D4.moves,
    // 抱頭蹲下，等著「喀啦」……
    { at: DUCK, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: DUCK, actor: 'yang', do: 'moveTo', to: { x: YX + 8, y: YY }, dur: 0.2, ease: 'out' },
    { at: DUCK + 0.1, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.3 },
    // 沒壞！熊熊好好的
    { at: FINE, actor: 'item', do: 'hop', amount: 3, dur: 0.25 },
    { at: FINE, actor: 'patch', do: 'hop', amount: 3, dur: 0.25 },
    { at: FINE + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    ...SN4.moves,
    // 喀啦！垮掉的是後面的舊箱子
    ...g4.moves,
    { at: S4 + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 抱起最愛的舊熊熊
    { at: HUG, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: HUG, actor: 'yang', do: 'moveTo', to: { x: ICX - 18, y: YY }, dur: 0.2, ease: 'out' },
    { at: HUG + 0.2, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
    { at: HUG + 0.2, actor: 'item', do: 'hop', amount: 3, dur: 0.25 },
    { at: HUG + 0.2, actor: 'patch', do: 'hop', amount: 3, dur: 0.25 },
    // 抱著熊熊往左跑走
    { at: RUN, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: RUN, actor: 'yang', do: 'flip' },
    { at: RUN, actor: 'yang', do: 'moveTo', to: { x: ICX - 18 - 120, y: YY }, dur: 0.22, ease: 'in' },
    { at: RUN + 0.02, actor: 'item', do: 'moveTo', to: { x: ICX - 120, y: IY }, dur: 0.22, ease: 'in' },
    { at: RUN + 0.02, actor: 'patch', do: 'moveTo', to: patchAt(ICX - 120), dur: 0.22, ease: 'in' },
    { at: RUN + 0.25, actor: 'item', do: 'vanish', dur: 0.01 },
    { at: RUN + 0.25, actor: 'patch', do: 'vanish', dur: 0.01 },
    // 問他：從右邊走回來，轉向國字、變大
    { at: ASK + 0.02, actor: 'yang', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: ASK + 0.1, actor: 'yang', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.12, actor: 'yang', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK_SAY + 1.0, actor: 'yang', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.16, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'yang', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.2, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（他在左下、舊東西在中間、箱子在右下）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_AMT },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_AMT },
    // 問他：國字稍微偏左、縮一點，右前方讓給他
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['yang'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: DOUBT + 0.05, kind: 'sweat', actor: 'yang', dx: 8 },
    ...g3.fx,
    ...WORD_DUST.fx,
    ...D4.fx,
    ...SN4.fx,
    ...g4.fx,
    { at: HUG + 0.08, kind: 'pop', actor: 'yang', emoji: '❤️', dx: 2, dur: 0.3 },
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.32 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到箱子和跳出來的東西）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD_SAY, dur: 0.5, do: 'punch', amount: 0.06, to: { x: ICX + 8, y: 52 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '舊' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '舊' },
    ...WB.cues,
    ...WORD_DUST.cues,
    { at: WORD_SAY, say: '舊書' },
    { at: TOSS + 0.32, sfx: 'plop' },
    ...BB.cues,
    ...P4.cues,
    ...D4.cues,
    ...SN4.cues,
    ...g4.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '舊' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
