import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 棕（v2）：大棕熊最愛抱抱。綠色的小恐龍站在牠旁邊，棕熊每次張開雙手、從後面撲過來「噗」一個熊抱——
// 放開以後，小恐龍身上被染成棕色，一次比一次大片：先是腳（木）、再來從脖子以下（宀）、
// 先停一拍（他伸手掌「等一下！」，熊還是撲過來）整隻從頭到腳都變棕色（示）。每次他都傻眼，再用力一抖，把棕色甩掉、甩出一個部件。
// 語詞那一刻棕熊站在正中間，小恐龍指著牠：「棕熊」。
// 回馬槍（第四次，反過來）：這次熊一張開手，小恐龍自己張開雙手衝過去抱牠——被抱得飛起來，落地整隻棕色，這次他不抖了，開心得冒愛心。
// 最後畫面暗下來只剩「棕」，小恐龍問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「棕！」，然後退場只留字。
// 棕、棕、棕熊、這是什麼字？、棕
const R = 62.7 // 小恐龍（size 34）站在地上的 y
const BEAR = 50 // 大棕熊（prop:bear／bear-roar 同一個比例，同 size 直接 swap）：畫面上最大的東西
const BY = 77 - 0.42 * BEAR
/** 小恐龍前三次站的地方（畫面左邊，朝右看熊） */
const REX = 44
/** 棕熊平常站的地方（畫面右邊） */
const BX = 112
/** 熊抱：熊撲到小恐龍正後面（熊畫在小恐龍後面，張開的手從他兩邊包過來） */
const HUG = 54
/** 棕色：把綠色的小恐龍染成跟棕熊一樣的棕色 */
const BROWN = 'sepia(1) saturate(2.6) hue-rotate(-14deg) brightness(.72)'
/** 棕色那一層每一次從圖的哪裡往下染（0 是整隻）：腳 → 脖子以下 → 從頭到腳 */
const CUT = [0.58, 0.3, 0]
/** 放開以後傻眼停多久，才開始抖 */
const HOLD = 0.5

// 棕色那一層（mud）是同一張小恐龍的圖、染成棕色、只畫下面一截，疊在小恐龍身上；所有動作跟小恐龍一模一樣。
// id 刻意取 'rexMud4'：引擎的「站著等的小動作」照 id 的雜湊決定節奏（hashOf(id) % 105），這個 id 跟 'rex' 同一個餘數，兩層才不會抖得不一樣。
const MUD = 'rexMud4'

/** 小恐龍的動作：棕色那一層同一刻做一樣的事 */
function both(m: Omit<Move, 'actor'>): Move[] {
  return [{ ...m, actor: 'rex' } as Move, { ...m, actor: MUD } as Move]
}

/**
 * 熊抱：棕熊張開雙手、蹲一下（預備）→ 從後面撲到小恐龍身上「噗」——同一個音效、💕＋一圈 🟤 噴出來、鏡頭推近＋震，
 * 小恐龍被抱得變細長、傻眼；熊放開走回去，他身上那一截已經變成棕色（k 越後面染得越大片），傻眼停 HOLD 秒，
 * 再用力一抖：棕色甩掉、一圈 🟤 飛出去，筆畫從他身上飛上字框。
 */
function hug(at: number, k: number) {
  const moves: Move[] = [
    // 預備：熊張開雙手、往下一蹲
    { at: at - 0.55, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' },
    { at: at - 0.5, actor: 'bear', do: 'squash', amount: 0.12 + 0.03 * k, dur: 0.25 },
    // 撲過去
    { at: at - 0.25, actor: 'bear', do: 'moveTo', to: { x: HUG, y: BY }, dur: 0.25, ease: 'in', anticipate: 4 },
    // 抱住：熊收手、用力擠，小恐龍被擠得細長、傻眼；棕色那一層同一刻出現（在噴出來的 🟤 底下）
    { at, actor: 'bear', do: 'swap', emoji: 'prop:bear' },
    { at, actor: 'bear', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.4 },
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    ...both({ at, do: 'squash', amount: -0.22 - 0.05 * k, dur: 0.45 }),
    k < 2
      ? { at, actor: MUD, do: 'swap', emoji: 'hero:rex/surprised', half: 'bottom', cut: CUT[k] }
      : { at, actor: MUD, do: 'swap', emoji: 'hero:rex/surprised', half: 'whole' },
    { at: at + 0.02, actor: MUD, do: 'enter', from: { x: REX, y: R }, dur: 0.02 },
    // 放開，走回去
    { at: at + 0.45, actor: 'bear', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.35, ease: 'out' },
    // 傻眼停住，然後用力一抖、把棕色甩掉
    ...both({ at: at + 0.45 + HOLD, do: 'swap', emoji: 'hero:rex/angry' }),
    ...both({ at: at + 0.5 + HOLD, do: 'shake', amount: 2 + 0.6 * k, dur: 0.4 }),
    { at: at + 0.75 + HOLD, actor: MUD, do: 'vanish', dur: 0.12 },
  ]
  const fx: Fx[] = [
    { at: at - 0.5, kind: 'pop', actor: 'bear', emoji: '💕', dx: 4, dur: 0.45, scale: 1.4 + 0.2 * k },
    // 「噗」：一圈棕色噴出來，一次比一次大
    { at, kind: 'burst', x: REX + 2, y: R - 4, emoji: '🟤', n: 6 + 2 * k, dur: 0.45, scale: 1.2 + 0.35 * k },
    { at: at + 0.05, kind: 'burst', actor: 'bear', emoji: '💕', n: 3, dy: 4, dur: 0.4, scale: 1.1 + 0.2 * k },
    { at: at + 0.5, kind: 'sweat', actor: 'rex', dx: -4 },
    // 抖掉：棕色往四面甩出去
    { at: at + 0.55 + HOLD, kind: 'burst', actor: 'rex', emoji: '🟤', n: 7 + 2 * k, dy: 10, dur: 0.45, scale: 1.1 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: REX + 6, y: R - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  cues.push({ at: at + 0.55 + HOLD, sfx: 'poof' })
  return { moves, fx, camera, cues, shake: at + 0.55 + HOLD }
}

const T1 = 1.6, T2 = 3.55, T3 = 6.15
const h1 = hug(T1, 0)
const h2 = hug(T2, 1)
const h3 = hug(T3, 2)
/** 回馬槍：小恐龍自己衝過去抱熊的那一刻 */
const T4 = 9.95
/** 語詞那一刻棕熊站到正中間 */
const MID = 102

const clip: Clip = {
  format: 2,
  char: '棕',
  meta: { theme: '大棕熊的熊抱', cast: '小恐龍＋大棕熊', gags: ['大棕熊每次撲過來一個熊抱，小恐龍就被染成棕色，一次比一次大片（腳、脖子以下、整隻），抖掉又被抱；回馬槍是他自己衝過去抱熊，整隻變棕色也開心'] },
  duration: 15,
  bg: { top: '#FFE8C8', bottom: '#FFF8EC', floor: '#BFD98F', scenery: 'hills' },
  actors: [
    // 熊畫在最後面：抱的時候從小恐龍後面包過來
    { id: 'bear', emoji: 'prop:bear', x: BX, y: BY, size: BEAR },
    // 圖朝左，翻過來朝右看熊
    { id: 'rex', emoji: 'hero:rex/idle', x: REX, y: R, size: 34, hidden: true, flip: true },
    { id: MUD, emoji: 'hero:rex/idle', x: REX, y: R, size: 34, hidden: true, flip: true, tint: BROWN, half: 'bottom', cut: CUT[0] },
  ],
  moves: [
    // 小恐龍登場，抬頭看字框
    { at: 0, actor: 'rex', do: 'enter', from: { x: -25, y: R }, dur: 0.5, ease: 'out' },
    // 棕熊好開心看到他
    { at: 0.6, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    // 第 1 次：沒注意，熊從後面抱上來——腳變棕色
    ...h1.moves,
    ...both({ at: h1.shake + 0.5, do: 'swap', emoji: 'hero:rex/idle' }),
    // 第 2 次：他嚇一跳（又來了！）——脖子以下都變棕色
    ...both({ at: T2 - 0.55, do: 'swap', emoji: 'hero:rex/scared' }),
    ...h2.moves,
    ...both({ at: h2.shake + 0.5, do: 'swap', emoji: 'hero:rex/idle' }),
    // 第 3 次前停一拍：熊又張開手，他伸手掌「等一下！」、冒汗——熊還是撲過來，整隻都變棕色
    { at: 5.2, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' },
    { at: 5.2, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    ...both({ at: 5.25, do: 'swap', emoji: 'hero:rex/wait' }),
    ...both({ at: 5.25, do: 'tilt', amount: -6, dur: 0.4 }),
    ...h3.moves,
    // 字框填滿：國字回到正中央，兩個讓到兩邊
    ...both({ at: h3.shake + 0.5, do: 'swap', emoji: 'hero:rex/idle' }),
    ...both({ at: h3.shake + 0.5, do: 'moveTo', to: { x: 20, y: R }, dur: 0.3 }),
    { at: h3.shake + 0.5, actor: 'bear', do: 'moveTo', to: { x: 134, y: BY }, dur: 0.3 },
    // 語詞那一刻：國字讓回上方，棕熊走到正中間，小恐龍指著牠
    { at: 8.75, actor: 'bear', do: 'moveTo', to: { x: MID, y: BY }, dur: 0.35 },
    ...both({ at: 8.75, do: 'moveTo', to: { x: 54, y: R }, dur: 0.35 }),
    ...both({ at: 9.0, do: 'swap', emoji: 'hero:rex/point' }),
    { at: 9.1, actor: 'bear', do: 'squash', amount: -0.12, dur: 0.3 },
    // 回馬槍（第 4 次）：熊又張開手——這次他自己張開雙手衝過去抱
    { at: 9.45, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' },
    { at: 9.45, actor: 'bear', do: 'squash', amount: 0.15, dur: 0.25 },
    ...both({ at: 9.5, do: 'swap', emoji: 'hero:rex/hug' }),
    ...both({ at: 9.6, do: 'moveTo', to: { x: MID - 10, y: R }, dur: 0.35, ease: 'in', anticipate: 3 }),
    // 抱住：熊把他抱得飛起來，落地整隻棕色（這次直接染在他身上，不抖了）
    { at: T4, actor: 'bear', do: 'swap', emoji: 'prop:bear' },
    { at: T4, actor: 'bear', do: 'squash', amount: -0.15, dur: 0.45 },
    { at: T4, actor: 'bear', do: 'shake', amount: 1.6, dur: 0.4 },
    { at: T4, actor: 'rex', do: 'tint', filter: BROWN },
    { at: T4, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: T4, actor: 'rex', do: 'hop', amount: 12, dur: 0.5 },
    { at: T4, actor: 'rex', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    // 熊開心揮揮手走出右邊；小恐龍走到左前方
    { at: 10.55, actor: 'bear', do: 'moveTo', to: { x: 200, y: BY }, dur: 0.5, ease: 'in' },
    { at: 10.6, actor: 'rex', do: 'moveTo', to: { x: 36, y: R + 4 }, dur: 0.4 },
    // 問他：轉向觀眾、變大
    { at: 11.05, actor: 'rex', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 11.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 12.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: 12.2, actor: 'rex', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.65, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.1, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.6, actor: 'rex', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: 13.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: 13.6, actor: 'rex', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.8, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: 13.8, actor: 'rex', do: 'moveTo', to: { x: -45, y: R + 4 }, dur: 0.18, ease: 'in' },
  ],
  builds: [
    // 每一次抖掉的棕色，從他身上甩上字框：木 → 宀 → 示
    { at: h1.shake + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: 'rex', color: partColor('木') },
    { at: h2.shake + 0.05, dur: 0.45, strokes: [4, 5, 6], from: 'rex', color: partColor('宀') },
    { at: h3.shake + 0.05, dur: 0.5, strokes: [7, 8, 9, 10, 11], from: 'rex', color: partColor('示') },
  ],
  glyph: [
    { at: 7.85, dur: 0.45, do: 'home', ease: 'back' },
    // 國字讓到上方偏左一點，右邊讓給站到中間的大棕熊（熊比較高，頭會碰到字）
    { at: 8.7, dur: 0.45, do: 'park', to: { x: 70, y: 21.5 } },
    // 問他：國字偏右、縮一點，左前方讓給變大的小恐龍
    { at: 10.95, dur: 3.05, do: 'ask', keep: ['rex'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 11.0, dur: 0.4, do: 'home' },
    { at: 13.6, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.55, kind: 'pop', actor: 'bear', emoji: '💕', dx: 4, dur: 0.5, scale: 1.3 },
    ...h1.fx,
    ...h2.fx,
    // 第 3 次前停一拍：他冒汗
    { at: 5.35, kind: 'sweat', actor: 'rex', dx: -4 },
    ...h3.fx,
    // 語詞：熊開心
    { at: 9.05, kind: 'burst', actor: 'bear', emoji: '💕', n: 4, dur: 0.45 },
    // 回馬槍：最大的一圈棕色＋滿滿的愛心
    { at: T4, kind: 'burst', x: MID - 6, y: R - 8, emoji: '🟤', n: 12, dur: 0.5, scale: 1.6 },
    { at: T4 + 0.1, kind: 'burst', x: MID - 6, y: R - 14, emoji: '💕', n: 6, dur: 0.6, scale: 1.6 },
    { at: 10.5, kind: 'pop', actor: 'rex', emoji: '💕', dx: -6, dur: 0.5, scale: 1.5 },
    { at: 13.6, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.24 },
  ],
  camera: [
    ...h1.camera,
    ...h2.camera,
    ...h3.camera,
    { at: T4, dur: 0.45, do: 'punch', amount: 0.3, to: { x: MID - 6, y: 40 } },
    { at: T4, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: 7.85, dur: 0.05, level: -0.35 },
    { at: 7.9, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '棕' },
    ...h1.cues,
    ...h2.cues,
    ...h3.cues,
    { at: 8.0, say: '棕' },
    { at: 9.05, say: '棕熊' },
    { at: T4, sfx: 'plop' },
    { at: T4 + 0.04, sfx: 'bonk' },
    { at: T4 + 0.08, sfx: 'boing' },
    { at: T4 + 0.12, sfx: 'cheer' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: 13.6, say: '棕' },
    { at: 13.65, sfx: 'cheer' },
  ],
}

export default clip
