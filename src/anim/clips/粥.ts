import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 粥（v2）：晚上肚子好餓，一大碗白粥擺在中間，碗上兩道彎彎的熱氣一直冒。楊捷睿流著口水，舀起一大匙還在冒煙的粥就往嘴裡送——
// 「燙！」他瞪大眼、臉一路紅上來、兩邊耳朵噴出蒸氣，整個人彈到半空中吐舌頭猛搧，掉下來垂頭喘氣。同一個動作一次比一次認真、也一次比一次燙：
// 直接喝（彈一下，左邊那道熱氣變成左邊的弓）→ 對著湯匙「呼、呼」吹兩下再喝（彈更高，碗裡的米飛出來）→ 先停一拍：丟一顆冰塊進去（「滋」一下就不見）、
// 拿扇子猛搧、等到站著睡著……小心翼翼舀一匙——還是燙，彈到畫面頂（右邊那道熱氣變成右邊的弓）。
// 回馬槍（第四次）：他學乖了，不吹了，把碗放著、趴在旁邊等到睡著——醒來碗上不冒煙了。一樣流著口水舀一匙——
// 湯匙「喀」插進去拔不出來：粥涼過頭、結成一整塊。他用力一拔，整碗粥連碗黏在湯匙上被舉起來，像一支大棒棒糖；
// 他舉著它傻眼，舔一口——「……冰的」，打個冷顫。（刻意避開「餃」的吹飛：這支的回馬槍沒有吹、沒有東西飛上天掉回來。）
// 最後畫面暗下來只剩「粥」，他把那支「棒棒糖」往後一丟、站到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「粥！」，然後退場只留字。
// 刻意不跟「飯」（餵飯不張嘴）、「辣」（辣到衝去找水）、「冷」（被凍住）、「喝」（吸光肚子鼓）撞：這支只演「喝一口→燙到彈起來」。
// 粥、粥、喝粥、這是什麼字？、粥

/** 楊捷睿（右邊；圖朝左，剛好面向中間那碗粥） */
const YS = 40
const YX = 118
const YY = 77 - 0.42 * YS
/** 那碗粥：這個字講的東西，擺在正中間 */
const BS = 36
const BX = 78
const BY = 77 - 0.42 * BS
/** 白粥的圖從哪裡橫著切：上面是粥，下面是碗 */
const CUT = 0.47

/** 湯匙（🥄 匙面在左上、柄在右下，柄朝他的手） */
const SS = 23
const BOWL_OF = { x: -0.23 * SS, y: -0.23 * SS }
/** 匙上那一坨粥（白粥的圖只畫上面一截） */
const SCOOP_S = 20
/** 用「匙面在哪裡」來寫位置，換成湯匙中心／那一坨粥的中心 */
const spoonAt = (p: Vec): Vec => ({ x: p.x - BOWL_OF.x, y: p.y - BOWL_OF.y })
const scoopAt = (p: Vec): Vec => ({ x: p.x, y: p.y + 0.5 })

/** 匙面：拿在手上、插進碗裡、舀起來舉著、送到嘴邊 */
const REST: Vec = { x: 100, y: 53 }
const DIP: Vec = { x: 84, y: 57 }
const READY: Vec = { x: 98, y: 46 }
const MOUTH: Vec = { x: 113.5, y: 58.5 }

/** 字框：左上方（他在右邊彈上彈下，左上是素色的夜空） */
const FRAME = { x: 50, y: 21 }
const FRAME_K = 0.44

/** 湯匙：銀白色＋深色描邊（原本的 3D 湯匙是淡紫色，在夜空上看不清楚） */
const SILVER = 'grayscale(1) brightness(1.3) drop-shadow(0 0 0.6px #2E3440) drop-shadow(0 0 0.6px #2E3440)'
/** 臉一路紅上來：一級比一級紅（第 k 次從第 k 級開始，連跳三級） */
const RED = [0, 1, 2, 3, 4, 5].map((l) => `sepia(1) saturate(${2.5 + 1.1 * l}) hue-rotate(-${44 + 2 * l}deg)`)
/** 彈在半空中時身上剩的紅（一次比一次紅） */
const PINK = ['saturate(1.25) hue-rotate(-6deg)', 'saturate(1.5) hue-rotate(-10deg)', 'saturate(1.8) hue-rotate(-14deg)']
const STEAM = '#FFFFFF'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 湯匙和上面那一坨粥一起移動（匙面到 p） */
function carry(at: number, dur: number, p: Vec, ease: Move['ease'] = 'inOut'): Move[] {
  return [
    { at, dur, actor: 'spoon', do: 'moveTo', to: spoonAt(p), ease },
    { at, dur, actor: 'scoop', do: 'moveTo', to: scoopAt(p), ease },
  ]
}

/**
 * 一道彎彎的熱氣（白色、粗、S 形）：兩段弧上下接起來，跟著 actor 走；每一輪 1 秒，慢慢擺一下再淡掉，兩輪錯開半拍，所以一直看得到。
 * (dx, dy) 是熱氣最下面那一點（相對 actor 頭頂），r 是彎的大小（整道高 1.64 × r），width 是粗細。
 */
function wisp(actor: string, from: number, to: number, dx: number, dy: number, r: number, width: number): Fx[] {
  const out: Fx[] = []
  for (const ph of [0, 1]) {
    for (let t = from + ph * 0.5; t < to - 0.05; t += 1) {
      const dur = Math.min(1, to - t)
      const lift = ph * 0.22 * r
      // 下半段往右鼓、上半段往左鼓
      out.push({ at: t, dur, kind: 'swoosh', actor, dx: dx - r, dy: dy - lift, to: { x: 999, y: 0 }, n: r, sweep: 0, color: STEAM, width })
      out.push({ at: t, dur, kind: 'swoosh', actor, dx: dx + 0.574 * r, dy: dy - 0.82 * r - lift, to: { x: -999, y: 0 }, n: r, sweep: 0, color: STEAM, width })
    }
  }
  return out
}
/** 碗上的兩道熱氣（相對碗的頭頂＝圖上熱氣的頂端） */
const WISP_X = 6.5
const bowlSteam = (from: number, to: number): Fx[] => [
  ...wisp('bowl', from, to, -WISP_X, 9, 5.6, 2.3),
  ...wisp('bowl', from, to, WISP_X, 9, 5.6, 2.3),
]
/** 匙上那一坨粥也在冒煙 */
const scoopSteam = (from: number, to: number): Fx[] => wisp('scoop', from, to, 0, 3.5, 3.4, 1.7)

/** 舀一匙：湯匙插進碗裡、一坨粥冒上來、舉起來（還在冒煙）。at 是插進去那一刻，回傳舉好的時間 */
function scoop(at: number): { moves: Move[]; cues: Cue[]; ready: number } {
  return {
    moves: [
      { at: at - 0.17, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      ...carry(at - 0.15, 0.15, DIP, 'in'),
      { at, dur: 0.01, actor: 'scoop', do: 'moveTo', to: scoopAt(DIP) },
      { at, dur: 0.15, actor: 'scoop', do: 'pop' },
      { at, dur: 0.15, actor: 'bowl', do: 'squash', amount: 0.08 },
      ...carry(at + 0.08, 0.17, READY, 'out'),
    ],
    cues: [{ at, sfx: 'plop' }],
    ready: at + 0.25,
  }
}

/** 他和手上的湯匙一起移動（dy 是離地多高、x 是他站哪裡） */
function lift(at: number, dur: number, x: number, dy: number, ease: Move['ease']): Move[] {
  return [
    { at, dur, actor: 'yang', do: 'moveTo', to: { x, y: YY - dy }, ease },
    { at, dur, actor: 'spoon', do: 'moveTo', to: spoonAt({ x: REST.x + x - YX, y: REST.y - dy }), ease },
  ]
}

/**
 * 同一個笑點「燙！」：（湯匙送進嘴裡）→ 那一刻他瞪大眼、臉一路紅上來、兩邊耳朵噴蒸氣＋💥＋鏡頭推近＋震＋同一個音效，
 * 停 REDDEN 秒 → 整個人彈到半空中，吐舌頭猛搧（停 HANG 秒）→ 掉下來垂頭喘氣。
 * T 是燙到的那一刻，k 是第幾次（0～2，越後面越大）。
 */
const REDDEN = 0.3
const RISE = 0.14
const HANG = 0.45
const JUMP = [9, 18, 32]
const landOf = (T: number) => T + REDDEN + RISE * 2 + HANG
function burn(T: number, k: number, o: { feed?: number; x0?: number; x?: number } = {}): Gag {
  const x0 = o.x0 ?? YX
  const x = o.x ?? x0
  const L = T + REDDEN
  const moves: Move[] = []
  if (o.feed) {
    moves.push(
      ...carry(T - o.feed, o.feed, MOUTH, 'in'),
      { at: T - Math.min(o.feed, 0.25), actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
      { at: T, dur: 0.05, actor: 'scoop', do: 'vanish' },
      { at: T + 0.02, dur: 0.12, actor: 'spoon', do: 'moveTo', to: spoonAt(REST), ease: 'out' },
    )
  }
  moves.push(
    // 燙！瞪大眼，臉一路紅上來
    { at: T, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: T, actor: 'yang', do: 'tint', filter: RED[k] },
    { at: T + 0.1, actor: 'yang', do: 'tint', filter: RED[k + 1] },
    { at: T + 0.2, actor: 'yang', do: 'tint', filter: RED[k + 2] },
    { at: T, dur: REDDEN, actor: 'yang', do: 'shake', amount: 0.7 + 0.3 * k },
    // 彈起來：吐舌頭猛搧
    { at: L, actor: 'yang', do: 'swap', emoji: 'hero:yang/spicy' },
    // 吐舌頭那張臉自己就是紅的：整個人的紅退一點，臉才看得清楚
    { at: L, actor: 'yang', do: 'tint', filter: PINK[k] },
  )
  const land = landOf(T)
  moves.push(
    ...lift(L, RISE, x, JUMP[k], 'out'),
    { at: L + RISE, dur: HANG, actor: 'yang', do: 'shake', amount: 1 + 0.35 * k },
    ...lift(land - RISE, RISE, x, 0, 'in'),
    { at: land, actor: 'yang', do: 'tint', filter: '' },
    { at: land + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/tired' },
  )
  // 兩邊耳朵噴蒸氣（一團一團白煙往斜上方噴），一次比一次大：地上一次、彈到空中再一次
  const jet = (at: number, dur: number, side: -1 | 1, cy: number): Fx => ({
    at, dur, kind: 'blow', actor: 'yang', emoji: 'prop:smoke', dx: side * 9, dy: 0.39 * YS, n: 3 + k,
    // 彈到畫面頂的那一次，空中的蒸氣往兩旁斜下噴、小一點（不然會被畫面的上緣、右緣切掉）
    scale: at >= L && k >= 2 ? 1.3 : 1.25 + 0.3 * k,
    to: { x: (at < L ? x0 : x) + side * (at >= L && k >= 2 ? 16 : 20), y: cy - (at >= L && k >= 2 ? -5 : 10) },
  })
  const earY = YY - 0.06 * YS
  const fx: Fx[] = [
    { at: T, kind: 'burst', x: x0 - 13, y: earY - 14, n: 1, dur: 0.35, scale: 1.1 + 0.3 * k },
    jet(T + 0.03, REDDEN + 0.05, -1, earY), jet(T + 0.03, REDDEN + 0.05, 1, earY),
  ]
  fx.push(jet(L + RISE - 0.02, HANG, -1, earY - JUMP[k]), jet(L + RISE - 0.02, HANG, 1, earY - JUMP[k]))
  const camera: Camera[] = [
    { at: T, dur: REDDEN, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: x0 - 6, y: 54 } },
    { at: T, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個「燙！」、同一個「咚」彈起來，一次比一次多疊一個
  const cues: Cue[] = [{ at: T, sfx: 'hic' }, { at: L, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: T + 0.04, sfx: 'crack' })
  if (k >= 2) cues.push({ at: L + 0.04, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 第 1 次：直接喝 */
const T1 = 1.4
/** 第 2 次：先對著湯匙「呼、呼」吹兩下 */
const T2 = 3.65
/** 第 3 次前停一拍：丟冰塊、搧扇子、等到睡著，再小心翼翼舀一匙 */
const BEAT = landOf(T2) + 0.12
const FAN = BEAT + 0.55
const DOZE = FAN + 0.5
const WAKE = DOZE + 0.38
const T3 = WAKE + 0.7
/** 第 3 次彈到畫面頂、落在旁邊（國字要放大到正中央） */
const X3 = 130
const LAND3 = landOf(T3)
const HOME = LAND3 + 0.07
const PARK = HOME + 0.82
/** 語詞那一刻他站的地方 */
const X4 = 122
const WORD = PARK + 0.28
/** 回馬槍：把碗放著、趴著等到睡著（碗上的熱氣沒了）→ 醒來 → 湯匙插進去拔不出來 → 整碗被舉起來 → 舔一口：冰的 */
const WAIT = WORD + 0.3
const WAKE4 = WAIT + 0.5
const DIP4 = WAKE4 + 0.17
const LIFT = DIP4 + 0.2
const LICK = LIFT + 0.6
const ASK = LICK + 0.18
const ANSWER = ASK + 0.05 + 0.974 + 1.51
/** 問他的時候站的地方、放大幾倍 */
const AX = 128
const ASK_S = 1.25

const sc1 = scoop(T1 - 0.55)
const sc2 = scoop(T2 - 0.9)
const sc3 = scoop(WAKE + 0.1)
const g1 = burn(T1, 0, { feed: 0.25 })
const g2 = burn(T2, 1, { feed: 0.25 })
const g3 = burn(T3, 2, { feed: 0.35, x: X3 })
const all = [g1, g2, g3]

/** 語詞那一刻那碗粥放大幾倍 */
const WORD_K = 1.2
/** 回馬槍：匙面插進結成一塊的粥裡；整碗被舉起來時匙面在哪裡（碗黏在匙面上，像一支大棒棒糖）、舔的時候拿到嘴邊 */
const STUCK: Vec = { x: BX + 5, y: 55 }
const POP: Vec = { x: 97, y: 33 }
const LICK_AT: Vec = { x: 104, y: 44 }
/** 碗黏在匙面上：匙面在 p 時碗的中心 */
const stuckBowl = (p: Vec): Vec => ({ x: p.x - 5, y: p.y - STUCK.y + BY })
/** 湯匙連著整碗一起移動 */
const pop = (at: number, dur: number, p: Vec, ease: Move['ease']): Move[] => [
  { at, dur, actor: 'spoon', do: 'moveTo', to: spoonAt(p), ease },
  { at, dur, actor: 'bowl', do: 'moveTo', to: stuckBowl(p), ease },
]

const clip: Clip = {
  format: 2,
  char: '粥',
  meta: { theme: '粥好燙', cast: '楊捷睿＋一大碗冒煙的白粥＋湯匙', gags: ['楊捷睿肚子好餓，舀起一大匙冒煙的粥就往嘴裡送——「燙！」臉一路紅上來、耳朵噴蒸氣，整個人彈起來吐舌頭猛搧；一次比一次認真也一次比一次燙（直接喝→先吹兩下→停一拍丟冰塊、搧扇子、等到睡著才小心喝一口，彈到畫面頂）；回馬槍是他學乖了、等到睡著，粥涼過頭結成一整塊，湯匙插進去拔不出來，用力一拔整碗連碗被舉起來像一支大棒棒糖，舔一口是冰的、打個冷顫'] },
  duration: 15,
  // 晚上（宵夜）：深藍的夜空，白色的熱氣、白粥、蒸氣都看得清楚
  bg: { top: '#232B6B', bottom: '#5C5FAE', floor: '#B98A5E', scenery: 'night' },
  actors: [
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: YY, size: YS, hidden: true },
    { id: 'bowl', emoji: 'prop:rice', x: BX, y: BY, size: BS },
    { id: 'spoon', emoji: '🥄', ...spoonAt(REST), size: SS, float: true, hidden: true, tint: SILVER },
    // 冰塊、扇子共用一個角色（先後出場）
    { id: 'item', emoji: 'prop:ice', x: 104, y: 42, size: 19, float: true, hidden: true },
    { id: 'scoop', emoji: 'prop:rice', ...scoopAt(DIP), size: SCOOP_S, half: 'top', cut: CUT, float: true, hidden: true },
  ],
  moves: [
    // 他拿著湯匙跑進來，看到粥，口水流下來
    { at: 0, dur: 0.3, actor: 'yang', do: 'enter', from: { x: 190, y: YY }, ease: 'out' },
    { at: 0.25, dur: 0.15, actor: 'spoon', do: 'pop' },
    { at: 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    { at: 0.4, dur: 0.25, actor: 'yang', do: 'hop', amount: 3 },
    // 第 1 次：舀一大匙（還在冒煙），直接喝
    ...sc1.moves,
    ...g1.moves,
    // 第 2 次：舀一匙，對著湯匙「呼、呼」吹兩下
    ...sc2.moves,
    { at: sc2.ready, actor: 'yang', do: 'swap', emoji: 'hero:yang/blow' },
    { at: sc2.ready + 0.02, dur: 0.18, actor: 'yang', do: 'squash', amount: 0.1 },
    { at: sc2.ready + 0.22, dur: 0.18, actor: 'yang', do: 'squash', amount: 0.1 },
    { at: sc2.ready + 0.02, dur: 0.38, actor: 'scoop', do: 'shake', amount: 0.5 },
    ...g2.moves,
    // 第 3 次前停一拍。丟一顆冰塊進去——「滋」一下就不見
    { at: BEAT, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
    { at: BEAT, dur: 0.12, actor: 'item', do: 'pop' },
    { at: BEAT + 0.12, dur: 0.25, actor: 'item', do: 'moveTo', to: { x: BX + 1, y: BY - 9 }, arc: 12, ease: 'in' },
    { at: BEAT + 0.37, dur: 0.15, actor: 'bowl', do: 'squash', amount: 0.1 },
    { at: BEAT + 0.37, dur: 0.14, actor: 'item', do: 'vanish' },
    // 拿扇子猛搧
    { at: FAN - 0.02, actor: 'item', do: 'swap', emoji: '🪭' },
    { at: FAN - 0.02, dur: 0.01, actor: 'item', do: 'moveTo', to: { x: 97, y: 50 } },
    { at: FAN, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: FAN, dur: 0.1, actor: 'item', do: 'pop' },
    ...[0, 1, 2, 3].map((i): Move => ({ at: FAN + 0.08 + i * 0.1, dur: 0.1, actor: 'item', do: 'tilt', amount: i % 2 ? 26 : -26 })),
    { at: DOZE - 0.03, dur: 0.08, actor: 'item', do: 'vanish' },
    // 等……等到站著睡著
    { at: DOZE, actor: 'yang', do: 'swap', emoji: 'hero:yang/doze' },
    { at: DOZE + 0.05, dur: 0.3, actor: 'yang', do: 'tilt', amount: -5 },
    // 醒來，小心翼翼舀一匙，慢慢送進嘴裡
    { at: WAKE, dur: 0.1, actor: 'yang', do: 'hop', amount: 1.5 },
    ...sc3.moves,
    { at: sc3.ready, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: sc3.ready, dur: T3 - sc3.ready - 0.05, actor: 'spoon', do: 'shake', amount: 0.35 },
    ...g3.moves,
    // 還是燙：他氣得把整碗抱到腳邊（國字放大到正中央，中間讓出來）
    { at: LAND3 + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/angry' },
    { at: LAND3 + 0.02, dur: 0.2, actor: 'bowl', do: 'moveTo', to: { x: X3 - 3, y: BY }, ease: 'out' },
    { at: LAND3 + 0.02, dur: 0.2, actor: 'bowl', do: 'scaleTo', amount: 0.7 },
    // 語詞那一刻：把碗放回正中間（最大），他拿著湯匙站在旁邊
    { at: PARK, dur: 0.25, actor: 'bowl', do: 'moveTo', to: { x: BX, y: BY }, ease: 'out' },
    { at: PARK, dur: 0.28, actor: 'bowl', do: 'scaleTo', amount: WORD_K / 0.7, ease: 'back' },
    ...lift(PARK, 0.25, X4, 0, 'out'),
    { at: PARK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    { at: WORD, dur: 0.25, actor: 'yang', do: 'hop', amount: 3 },
    { at: WORD, dur: 0.25, actor: 'bowl', do: 'squash', amount: -0.08 },
    // 回馬槍：他學乖了，不吹了，趴在旁邊等到睡著——碗上的熱氣慢慢沒了
    { at: WAIT, actor: 'yang', do: 'swap', emoji: 'hero:yang/sleep' },
    // 碗上不冒煙了：白粥的圖上自己畫了三道淡淡的熱氣，只留熱氣以下那一截
    { at: WAKE4 - 0.08, actor: 'bowl', do: 'swap', emoji: 'prop:rice', half: 'bottom', cut: 0.275 },
    // 醒來：不冒煙了！一樣流口水、一樣舀一匙
    { at: WAKE4, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    { at: WAKE4, dur: 0.15, actor: 'yang', do: 'hop', amount: 2.5 },
    { at: DIP4 - 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: DIP4 - 0.12, dur: 0.12, actor: 'spoon', do: 'moveTo', to: spoonAt(STUCK), ease: 'in' },
    // 「喀」——插進去拔不出來：粥結成一整塊了。用力拔，湯匙和碗一起抖
    { at: DIP4, dur: 0.2, actor: 'spoon', do: 'shake', amount: 0.9 },
    { at: DIP4, dur: 0.2, actor: 'bowl', do: 'shake', amount: 0.9 },
    { at: DIP4 + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    // 整碗粥連碗被舉起來，像一支大棒棒糖；他舉著它傻眼
    ...pop(LIFT, 0.12, POP, 'back'),
    { at: LIFT + 0.06, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: LIFT + 0.22, dur: 0.16, actor: 'spoon', do: 'hop', amount: 1.6 },
    { at: LIFT + 0.22, dur: 0.16, actor: 'bowl', do: 'hop', amount: 1.6 },
    { at: LIFT + 0.4, dur: 0.16, actor: 'spoon', do: 'hop', amount: 1.6 },
    { at: LIFT + 0.4, dur: 0.16, actor: 'bowl', do: 'hop', amount: 1.6 },
    // 舔一口——冰的！打個冷顫
    ...pop(LICK - 0.1, 0.1, LICK_AT, 'out'),
    { at: LICK - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: LICK + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/cold' },
    { at: LICK + 0.02, dur: 0.4, actor: 'yang', do: 'shake', amount: 1.3 },
    // 問他：把那支「棒棒糖」往後一丟，站到右前方、變大
    ...pop(ASK + 0.12, 0.22, { x: 215, y: 10 }, 'in'),
    { at: ASK + 0.34, actor: 'bowl', do: 'vanish', dur: 0.02 },
    { at: ASK + 0.34, actor: 'spoon', do: 'vanish', dur: 0.02 },
    { at: ASK + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
    { at: ASK + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.4, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: AX, y: YY }, ease: 'out' },
    { at: ASK + 0.45, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 1.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場：往右跑，畫面只留下字
    { at: ANSWER + 0.12, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.12, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: 215, y: YY }, ease: 'in' },
  ],
  builds: [
    // 兩個弓從碗上兩道彎彎的熱氣飛進字框，中間的米從碗裡飛出來
    { at: T1 + 0.06, dur: 0.45, strokes: [0, 1, 2], from: { x: BX - WISP_X, y: BY - 21 }, color: partColor('弓') },
    { at: T2 + 0.06, dur: 0.5, strokes: [3, 4, 5, 6, 7, 8], from: { x: BX, y: BY - 6 }, color: partColor('米') },
    { at: T3 + 0.06, dur: 0.4, strokes: [9, 10, 11], from: { x: BX + WISP_X, y: BY - 21 }, color: partColor('弓') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 60, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 碗上的兩道熱氣一直在，直到回馬槍他等到粥涼掉
    ...bowlSteam(0, WAKE4 - 0.05),
    // 匙上那一坨也在冒煙
    ...scoopSteam(sc1.ready - 0.1, T1), ...scoopSteam(sc2.ready - 0.1, T2), ...scoopSteam(sc3.ready - 0.1, T3),
    ...all.flatMap((g) => g.fx),
    // 第 2 次：呼、呼
    { at: sc2.ready + 0.02, dur: 0.2, kind: 'blow', actor: 'yang', dx: -4, dy: 0.42 * YS, to: { x: READY.x - 8, y: READY.y - 2 }, n: 3 },
    { at: sc2.ready + 0.22, dur: 0.2, kind: 'blow', actor: 'yang', dx: -4, dy: 0.42 * YS, to: { x: READY.x - 8, y: READY.y - 2 }, n: 3 },
    // 冰塊「滋」一下化成一團白煙
    { at: BEAT + 0.37, dur: 0.4, kind: 'burst', x: BX + 1, y: BY - 15, n: 1, emoji: 'prop:smoke', scale: 1.5 },
    // 扇子的風
    { at: FAN + 0.08, dur: 0.4, kind: 'blow', actor: 'item', dy: 6, to: { x: BX + 4, y: BY - 16 }, n: 4 },
    // 睡著
    { at: DOZE + 0.02, dur: WAKE - DOZE, kind: 'zzz', actor: 'yang', dx: 10, dy: 4, scale: 1.5 },
    // 語詞那一刻：那碗粥亮晶晶
    { at: WORD, dur: 0.5, kind: 'burst', x: BX, y: BY - 6, emoji: '✨', n: 8, scale: 1.3 },
    // 回馬槍：等到睡著
    { at: WAIT + 0.02, dur: WAKE4 - WAIT, kind: 'zzz', actor: 'yang', dx: 8, dy: 10, scale: 1.7 },
    // 「喀」
    { at: DIP4, dur: 0.3, kind: 'burst', x: STUCK.x - 4, y: STUCK.y - 8, n: 1, scale: 1.1 },
    { at: LIFT + 0.1, dur: 0.5, kind: 'pop', actor: 'yang', emoji: '❓', dx: 8, scale: 1.4 },
    // 冰的！
    { at: LICK + 0.02, dur: 0.45, kind: 'burst', actor: 'yang', emoji: '❄️', n: 6, dy: 12, scale: 1.2 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 鏡頭鎖全景（他會彈到畫面頂，字框在左上），只有燙到的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: DIP4, dur: 0.2, do: 'shake', amount: 0.8 },
    { at: LIFT, dur: 0.3, do: 'punch', amount: 0.08, to: { x: 100, y: 48 } },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.4, say: '粥' },
    ...sc1.cues, ...sc2.cues, ...sc3.cues,
    ...all.flatMap((g) => g.cues),
    { at: sc2.ready + 0.02, sfx: 'whoosh' },
    { at: sc2.ready + 0.22, sfx: 'whoosh' },
    { at: BEAT + 0.37, sfx: 'deflate' },
    { at: FAN + 0.08, sfx: 'slide' },
    { at: HOME + 0.05, say: '粥' },
    { at: WORD, say: '喝粥' },
    { at: DIP4, sfx: 'crack' },
    { at: LIFT, sfx: 'boing' },
    { at: LICK + 0.02, sfx: 'clink' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '粥' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
