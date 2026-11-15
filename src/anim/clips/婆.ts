import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 婆（v2）：外婆最愛捏臉頰。楊捷睿一站到外婆面前，外婆就笑咪咪地彎下腰「好可愛～」捏住他的臉頰往後一拉——
// 臉頰像麻糬一樣被拉得長長的，一放手「啵！」彈回去，一次比一次長：
// 拉一點點，彈回去他傻眼、眼淚噴出來（氵從噴出來的淚滴上飛出來）→ 拉到半個畫面，彈回去他整個人轉一圈（皮從彈回去的臉頰上飛出來）→
// 先停一拍：他蹲下來抱著頭護住臉，外婆端出一碗熱騰騰的湯，他眼睛一亮、手一放——外婆一把捏住，一路倒退拉到畫面外，
// 「啵——」彈回來把他轉了兩圈甩到畫面邊（女從走回來的外婆身上飛出來）。「彎腰→捏住→拉長→啵，彈回去」四次都一樣。
// 語詞那一刻：外婆站在畫面正中間，他跑回來喊「外婆！」，外婆笑得愛心冒出來。
// 回馬槍（第四次）：外婆又彎下腰伸手——這次他先跳起來，一把捏住外婆的臉頰往後拉，外婆的臉頰被拉得長長的，「啵！」彈回去，
// 換外婆嚇一跳；外婆哈哈大笑，他撲過去抱住外婆。外婆舉起湯勺「開飯囉」，走回廚房。
// 最後畫面暗下來只剩「婆」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「婆！」，然後退場只留字。
// 刻意不跟「姑」（姑姑衝過來親）、「媽」（抱一下就好了）、「臉」（做鬼臉）、「長」（把蛇越拉越長）、「蛙」（長舌頭黏走點心）、
// 「喝」「肉」「肚」（吃到肚子圓）撞：這支只演「外婆捏臉頰一拉、彈回去」，湯只是第三次引他放手的餌，沒有人喝。
// 婆、婆、外婆、這是什麼字？、婆

/** 楊捷睿：每次都站在同一個地方、面向右邊的外婆（flip） */
const S = 38
const P = 77 - 0.42 * S
const YX = 50
/** 他臉頰（surprised，翻向右邊）：圖的 u 0.68、v 0.41 */
const CHEEK: Vec = { x: YX + 0.179 * S, y: P - 0.094 * S }
/** 外婆（道具圖 prop:grandma*，朝左）：畫面上最大 */
const GS = 54
const GY = 77 - 0.42 * GS
/** 外婆平常站的地方（正中偏右） */
const GH = 104
/** 捏臉的指尖（grandma-pinch：x − 0.275 × size、y − 0.02 × size，assets/prop-sheets/README.md） */
const HAND = { dx: -0.275 * GS, dy: -0.02 * GS }
/** 捏住那一刻外婆站的地方：指尖剛好在他臉頰上 */
const GP = CHEEK.x - HAND.dx + 0.5
/** 外婆彎腰時自己的臉頰（grandma-pinch 的 u 0.355、v 0.448） */
const G_CHEEK = { dx: -0.145 * GS, dy: -0.052 * GS }
/** 他用力往後拉（pull，翻向右邊）時的拳頭：圖的 u 0.70、v 0.59 */
const PULL_HAND = { dx: 0.2 * S, dy: 0.09 * S }
/** 字框：左上角（hills 的天空，背後素色；外婆的頭在中間偏右） */
const FRAME = { x: 23, y: 20 }
const FRAME_K = 0.47
/** 拉長的臉頰：膚色、粗粗圓圓 */
const SKIN = '#F8CDB0'
const CW = 5.6
const NOOF: Partial<Move> = { arc: 0.01 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [] }

/**
 * 「彎腰→捏住→拉長→啵，彈回去」：外婆彎腰（grandma-pinch）指尖捏住他的臉頰（T），倒退 back 把臉頰拉長，停 hold 秒；
 * 放手（REL），拉長的臉頰從外婆手上「啵」地縮回他臉上（snap 秒）。k 是第幾次。回傳彈回去的那一刻。
 * 外婆走過來（from → GP）由呼叫的人自己寫（第三次是端著湯走過來）。
 */
function pinch(T: number, k: number, back: number, pull: number, hold: number, snap: number) {
  const GX2 = GP + back
  const REL = T + 0.1 + pull + hold
  const SNAP = REL + snap
  g.moves.push(
    // 彎腰
    { at: T - 0.12, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-pinch' },
    // 捏住：他傻眼
    { at: T, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: T, dur: 0.15, actor: 'yang', do: 'hop', amount: 1 },
    // 往後拉（外婆不踩步伐，倒退滑過去；身體往後仰一點）
    { at: T + 0.1, dur: pull, actor: 'grandma', do: 'moveTo', to: { x: GX2, y: GY }, ease: k >= 2 ? 'in' : 'inOut', ...NOOF },
    { at: T + 0.1, dur: pull + hold, actor: 'yang', do: 'tilt', amount: -5 - 3 * k },
    // 放手：彈回去的那一截
    { at: REL, dur: 0.01, actor: 'h', do: 'moveTo', to: { x: GX2 + HAND.dx, y: GY + HAND.dy } },
    { at: REL + 0.01, dur: snap - 0.01, actor: 'h', do: 'moveTo', to: CHEEK, ease: 'in' },
  )
  g.fx.push(
    // 拉長的臉頰：從外婆的指尖到他的臉頰
    { at: T, dur: REL - T, kind: 'tube', actor: 'grandma', dx: HAND.dx, dy: HAND.dy, target: 'ck', color: SKIN, width: CW, n: 99 },
    // 放手後縮回去的那一截
    { at: REL, dur: snap, kind: 'tube', actor: 'h', target: 'ck', color: SKIN, width: CW, n: 99 },
    // 外婆：好可愛～
    { at: T - 0.1, dur: 0.5, kind: 'pop', actor: 'grandma', emoji: '💕', dx: 12, dy: 2, scale: 1.3 },
    // 啵！
    { at: SNAP, dur: 0.4, kind: 'burst', x: CHEEK.x + 9, y: CHEEK.y - 14, n: 1, scale: 1.3 + 0.5 * k },
  )
  g.cues.push({ at: T, sfx: 'tap' }, { at: T + 0.1, sfx: 'slide' }, { at: SNAP, sfx: 'boing' })
  if (k >= 1) g.cues.push({ at: SNAP + 0.05, sfx: 'plop' })
  if (k >= 2) g.cues.push({ at: SNAP + 0.1, sfx: 'bonk' })
  g.camera.push(
    { at: SNAP, dur: 0.4, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: CHEEK.x + 6, y: 52 } },
    { at: SNAP, dur: 0.3, do: 'shake', amount: 0.6 + 0.45 * k },
  )
  return { REL, SNAP }
}

/** 外婆走過來（換回站好的樣子），停在捏得到的地方 */
function come(at: number, dur: number, emoji = 'prop:grandma') {
  g.moves.push(
    { at, actor: 'grandma', do: 'swap', emoji },
    { at, dur, actor: 'grandma', do: 'moveTo', to: { x: GP, y: GY } },
  )
}

/** 放手後外婆站直、走回原位 */
function home(at: number) {
  g.moves.push(
    { at, actor: 'grandma', do: 'swap', emoji: 'prop:grandma' },
    { at: at + 0.15, dur: 0.35, actor: 'grandma', do: 'moveTo', to: { x: GH, y: GY } },
  )
}

// 第 1 次：拉一點點
const T1 = 1.1
come(0.72, 0.32)
const { REL: REL1, SNAP: SNAP1 } = pinch(T1, 0, 18, 0.25, 0.35, 0.12)
home(REL1 + 0.05)
// 第 2 次：拉到半個畫面
const T2 = 2.85
come(2.45, 0.3)
const { REL: REL2, SNAP: SNAP2 } = pinch(T2, 1, 46, 0.4, 0.35, 0.15)
home(SNAP2 + 0.15)
// 第 3 次前停一拍：他蹲下抱頭護住臉；外婆端出一碗湯走過來，他眼睛一亮、手一放
const DUCK = SNAP2 + 0.5
const SERVE = DUCK + 0.3
come(SERVE + 0.05, 0.35, 'prop:grandma-serve')
const DROOL = SERVE + 0.6
const T3 = DROOL + 0.32
const { REL: REL3, SNAP: SNAP3 } = pinch(T3, 2, 120, 0.4, 0.3, 0.2)
/** 被彈得轉兩圈、甩到畫面左邊 */
const FLY = 0.42
const ASIDE_Y = 16
/** 外婆從右邊走回來 */
const BACK = SNAP3 + 0.05
const ASIDE_G = 138
/** 國字放大到中間：兩個人讓到兩邊 */
const HOME = SNAP3 + FLY + 0.08
const PARK = HOME + 0.8
// 語詞那一刻：外婆走到正中間，他跑回來喊「外婆！」
const GC = 98
const WORD = PARK + 0.25
// 回馬槍：外婆又彎腰伸手——他先跳起來捏住外婆的臉頰
const COME4 = WORD + 0.38
const BEND4 = COME4 + 0.25
const GRAB = BEND4 + 0.08
const PULL4 = GRAB + 0.08
const PULL4_D = 0.35
const REL4 = PULL4 + PULL4_D + 0.24
const SNAP4 = REL4 + 0.14
const LAUGH = SNAP4 + 0.28
const HUG = LAUGH
const LADLE = HUG + 0.3
const OUT = LADLE + 0.05
const ASK = 11.1
const Q = 11.12
const ANSWER = 13.6
/** 問他的時候他放大一點 */
const ASK_S = 1.12
/** 他往後拉時站的地方 */
const PULL_X = 24
/** 回馬槍：外婆彎腰時臉頰的位置 */
const GCHEEK4: Vec = { x: GP + G_CHEEK.dx, y: GY + G_CHEEK.dy }

const clip: Clip = {
  format: 2,
  char: '婆',
  meta: { theme: '外婆最愛捏臉頰', cast: '楊捷睿＋外婆', gags: ['外婆最愛捏臉頰：楊捷睿一站到面前，外婆就彎腰捏住他的臉頰往後拉，臉頰像麻糬一樣拉得長長的、一放手「啵」地彈回去，一次比一次長（拉一點點他傻眼噴淚→拉到半個畫面他轉一圈→停一拍，他抱頭護臉，外婆端湯引他放手，一把捏住倒退拉到畫面外，彈回來把他轉兩圈甩到畫面邊）；回馬槍是第四次外婆又彎腰，這次他先跳起來捏住外婆的臉頰往後拉，「啵」地彈回去換外婆嚇一跳，外婆哈哈大笑、他撲過去抱住外婆'] },
  duration: 15,
  // 外婆家的院子：暖暖的奶油色天空、淡綠草地，橘紅碎花衣服的外婆、紅外套的他都跳得出來
  bg: { top: '#FFF0D8', bottom: '#FFF9EE', floor: '#BFDC8E', scenery: 'hills' },
  actors: [
    // 看不見的錨：ck 是被捏的臉頰（拉長的臉頰接在它身上），h 是放手後縮回去的那一端
    { id: 'ck', emoji: '⭐', x: CHEEK.x, y: CHEEK.y, size: 4, hidden: true },
    { id: 'h', emoji: '⭐', x: CHEEK.x, y: CHEEK.y, size: 4, hidden: true },
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: P, size: S, hidden: true, flip: true },
    { id: 'grandma', emoji: 'prop:grandma', x: GH, y: GY, size: GS },
  ],
  moves: [
    // 開場：他從左邊走進來，看到外婆，開心揮手
    { at: 0, actor: 'yang', do: 'enter', from: { x: -22, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    ...g.moves.filter((m) => m.at < 2.5),
    // 第 1 次彈回去：傻眼、眼淚噴出來，揉一揉站好
    { at: SNAP1, dur: 0.3, actor: 'yang', do: 'shake', amount: 1 },
    { at: SNAP1 + 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...g.moves.filter((m) => m.at >= 2.5 && m.at < DUCK),
    // 第 2 次彈回去：整個人原地轉一圈，頭暈
    { at: SNAP2, dur: 0.4, actor: 'yang', do: 'spin', amount: -360, pivot: 'center' },
    { at: SNAP2, dur: 0.4, actor: 'yang', do: 'hop', amount: 4 },
    { at: SNAP2 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 停一拍：他蹲下抱頭護住臉，發抖
    { at: DUCK, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: DUCK + 0.05, dur: SERVE + 0.5 - DUCK, actor: 'yang', do: 'shake', amount: 0.5 },
    ...g.moves.filter((m) => m.at >= DUCK && m.at < T3 - 0.2),
    // 一碗熱騰騰的湯就在眼前：他眼睛一亮、手放下來
    { at: DROOL, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    { at: DROOL, dur: 0.2, actor: 'yang', do: 'hop', amount: 2 },
    ...g.moves.filter((m) => m.at >= T3 - 0.2 && m.at < SNAP3),
    // 第 3 次彈回去：轉兩圈、被甩到畫面左邊，頭暈
    { at: SNAP3, dur: FLY, actor: 'yang', do: 'moveTo', to: { x: ASIDE_Y, y: P }, arc: 2, ease: 'inOut' },
    { at: SNAP3, dur: FLY, actor: 'yang', do: 'spin', amount: -720, pivot: 'center' },
    { at: SNAP3 + FLY, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 外婆從右邊走回來（站在右邊，讓國字放大）
    { at: BACK, actor: 'grandma', do: 'swap', emoji: 'prop:grandma' },
    { at: BACK, dur: 0.01, actor: 'grandma', do: 'moveTo', to: { x: 185, y: GY } },
    { at: BACK + 0.02, dur: 0.4, actor: 'grandma', do: 'moveTo', to: { x: ASIDE_G, y: GY }, ease: 'out' },
    // 讓位：外婆走到正中間，他走回來
    { at: PARK, dur: 0.45, actor: 'grandma', do: 'moveTo', to: { x: GC, y: GY } },
    { at: PARK + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.2, dur: 0.32, actor: 'yang', do: 'moveTo', to: { x: YX, y: P } },
    // 語詞：「外婆！」
    { at: WORD, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: WORD, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    // 回馬槍：外婆又走過來、彎腰伸手……
    { at: COME4, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: COME4, dur: 0.25, actor: 'grandma', do: 'moveTo', to: { x: GP, y: GY } },
    { at: BEND4, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-pinch' },
    { at: BEND4 - 0.01, dur: 0.01, actor: 'ck', do: 'moveTo', to: GCHEEK4 },
    // ……他先跳起來，一把捏住外婆的臉頰
    { at: BEND4 - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: BEND4 - 0.05, dur: 0.12, actor: 'yang', do: 'moveTo', to: { x: YX, y: P - 7 }, ease: 'out' },
    // 往後拉：外婆的臉頰被拉得長長的
    { at: PULL4, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    { at: PULL4, dur: PULL4_D, actor: 'yang', do: 'moveTo', to: { x: PULL_X, y: P }, ...NOOF },
    { at: PULL4 + 0.05, dur: PULL4_D + 0.25, actor: 'grandma', do: 'tilt', amount: 6 },
    // 放手：「啵！」彈回去，換外婆嚇一跳
    { at: REL4, dur: 0.01, actor: 'h', do: 'moveTo', to: { x: PULL_X + PULL_HAND.dx, y: P + PULL_HAND.dy } },
    { at: REL4 + 0.01, dur: SNAP4 - REL4 - 0.01, actor: 'h', do: 'moveTo', to: GCHEEK4, ease: 'in' },
    { at: REL4, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
    { at: SNAP4, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-shock' },
    { at: SNAP4, dur: 0.28, actor: 'grandma', do: 'hop', amount: 4 },
    // 外婆哈哈大笑，他撲過去抱住外婆
    { at: LAUGH, actor: 'grandma', do: 'swap', emoji: 'prop:grandma' },
    { at: HUG, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: HUG, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: GP - 15, y: P }, ease: 'out' },
    // 外婆舉起湯勺「開飯囉」，轉身走回廚房
    { at: LADLE, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-ladle' },
    { at: LADLE, dur: 0.2, actor: 'grandma', do: 'hop', amount: 2 },
    { at: LADLE, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OUT, dur: 0.01, actor: 'grandma', do: 'flip' },
    { at: OUT + 0.02, dur: ASK - OUT - 0.08, actor: 'grandma', do: 'moveTo', to: { x: 190, y: GY }, ease: 'in' },
    // 問他：他跳到左前方、放大
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.15, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 2 }, arc: 6, ease: 'out' },
    { at: ASK + 0.15, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.65, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.2, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 2 }, ease: 'in' },
  ],
  builds: [
    // 氵從噴出來的淚滴上飛出來、皮從彈回去的臉頰上飛出來、女從走回來的外婆身上飛出來
    { at: SNAP1 + 0.05, dur: 0.32, strokes: [0, 1, 2], from: 'yang', color: partColor('氵') },
    { at: SNAP2, dur: 0.35, strokes: [3, 4, 5, 6, 7], from: 'ck', color: partColor('皮') },
    { at: BACK, dur: 0.3, strokes: [8, 9, 10], from: 'grandma', color: partColor('女') },
  ] satisfies Build[],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 第 1 次：眼淚噴出來
    { at: SNAP1, dur: 0.5, kind: 'burst', actor: 'yang', emoji: '💦', n: 3, dx: 2, dy: 6, scale: 1.3 },
    { at: SNAP2 + 0.4, dur: 0.5, kind: 'dizzy', actor: 'yang' },
    // 停一拍：他冒汗；湯冒熱氣
    { at: DUCK + 0.05, dur: 0.7, kind: 'sweat', actor: 'yang', dx: 8 },
    { at: SNAP3 + FLY, dur: 0.6, kind: 'dizzy', actor: 'yang' },
    // 語詞：外婆笑得愛心冒出來
    { at: WORD, dur: 0.6, kind: 'burst', actor: 'grandma', emoji: '💕', n: 5, dx: -4, dy: 4, scale: 1.4 },
    // 回馬槍：拉長的是外婆的臉頰（從他的拳頭到外婆臉上）
    { at: PULL4, dur: REL4 - PULL4, kind: 'tube', actor: 'yang', dx: PULL_HAND.dx, dy: PULL_HAND.dy, target: 'ck', color: SKIN, width: CW, n: 99 },
    { at: REL4, dur: SNAP4 - REL4, kind: 'tube', actor: 'h', target: 'ck', color: SKIN, width: CW, n: 99 },
    { at: SNAP4, dur: 0.45, kind: 'burst', x: GP + 14, y: 22, n: 1, scale: 2.4 },
    { at: SNAP4, dur: 0.45, kind: 'pop', actor: 'grandma', emoji: '❗', dx: -12, scale: 1.4 },
    { at: HUG + 0.05, dur: 0.6, kind: 'burst', x: GP - 6, y: 22, emoji: '💕', n: 6, scale: 1.5 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看切到人），只有彈回去那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: SNAP4, dur: 0.4, do: 'punch', amount: 0.12, to: { x: GP - 6, y: 44 } },
    { at: SNAP4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '婆' },
    ...g.cues,
    { at: DUCK, sfx: 'blip' },
    { at: SERVE + 0.05, sfx: 'bubble' },
    { at: HOME + 0.1, say: '婆' },
    { at: WORD, say: '外婆' },
    { at: GRAB, sfx: 'tap' },
    { at: PULL4, sfx: 'slide' },
    { at: SNAP4, sfx: 'boing' },
    { at: SNAP4 + 0.05, sfx: 'plop' },
    { at: SNAP4 + 0.1, sfx: 'bonk' },
    { at: HUG + 0.05, sfx: 'blip' },
    { at: LADLE, sfx: 'clink' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '婆' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
