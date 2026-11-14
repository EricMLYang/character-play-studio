import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 雪（v2）：下雪天，浣熊花生熱心地要堆雪人——每次把雪球滾大一點、站起來得意，頭上的雪雲就「噗」地倒下一大坨雪，把他埋住，一次比一次深：
// 埋到胸口（雨字頭的上半從天上落下來）、只剩耳朵（雨的四點）、先停一拍再整個埋掉、只露出一隻手揮（彐）——碰！連人帶雪球被炸上天。
// 語詞：雪球掉回來變成雪人（雪人）。回馬槍：他學乖了，撐傘站在雪人旁邊；雲只掉一片小雪花在傘上，他得意地收起傘——最大的一坨雪「噗」地連人帶雪人一起埋掉，只剩收好的傘露在外面；
// 他鑽出來，雪人已經被壓垮不見了，倒空的雪雲飄走。
// 最後畫面暗下來只剩「雪」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「雪！」，然後退場只留字。
// 雪球、掉下來的雪、埋住他的雪堆都是 prop:snowball（白色帶淡藍陰影與深色描邊，雪地上看得見）：雪堆是同一顆雪球落地時 stretchTo 壓成寬扁的一坨。
// 雪、雪、雪人、這是什麼字？、雪
const P = 66.9 // 花生（size 24）站在地上的 y
/** 花生每次站的地方：雪雲正下方（雲在國字字框的右邊） */
const X = 116
/** 雪雲（🌨️）在他頭上 */
const CLOUD = { x: 120, y: 14 }
/** 雪球：右緣貼著他推的手，越滾越大、往左長 */
const BALL_R = 104
const BALL = 20
/** 雪球每一次滾完多大（size）：一次比一次大 */
const BALLS = [20, 24, 29, 34]
/**
 * 雪堆每一次：size（落地後的大小）、w（壓成多寬：寬 ×w、高 ÷w）、x（落在哪裡）。一次比一次深：
 * 埋到肩膀只露出頭（頂在 y≈66）、只剩耳朵（≈60）、整個埋掉只剩一隻手（≈50）、第 4 次連旁邊的雪人一起埋（≈40，寬到蓋住雪人和他）。
 */
const PILE = [
  { size: 20.4, w: 1.7, x: X },
  { size: 28.5, w: 1.5, x: X },
  { size: 36.5, w: 1.19, x: X },
  { size: 53, w: 1.27, x: 97 },
]
/** 雪堆的基本 size（actor 寫的），每次 pop 都從這個大小算 */
const PILE0 = 20
/** 從雲裡掉下來時是一顆圓雪球，大小是雪堆的這麼多倍；落地那一下放大、壓扁成雪堆 */
const FALL = 0.8
/** 埋住以後傻眼停多久，才鑽出來 */
const HOLD = 0.5
/** 語詞那一刻起他放大多少 */
const BIG = 1.15

const ballX = (size: number) => BALL_R - 0.45 * size
const floorY = (size: number) => 77 - 0.42 * size

/**
 * 「噗」埋住：花生推雪球（push、雪球轉著變大）→ 站起來得意 → 雪雲抖一下（預備）→ 一坨雪從雲裡掉下來砸在他身上，
 * 落地那一刻雪堆長到這一次的大小＋❄️ 一圈＋💥＋白光＋鏡頭推近＋震＋同一個音效，他傻眼停 HOLD 秒。
 * k 是第幾次（雪堆越後面越大、埋得越深）。roll: false 是第 4 次（不推雪球，撐傘的那段另外寫）。
 * lead：推雪球提早多少秒（第 3 次推完先停一拍、抬頭看雲）。
 */
function bury(at: number, k: number, roll = true, lead = 0) {
  const { size, w, x } = PILE[k]
  /** 雪堆的高度（頂端約在 77 − 0.88 × h） */
  const h = size / w
  const moves: Move[] = []
  if (roll) {
    const from = BALLS[k - 1] ?? BALL, to = BALLS[k]
    moves.push(
      // 推雪球：雪球原地轉、變大（往左長，右緣一直貼著他的手）
      { at: at - 1.05 - lead, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/push' },
      { at: at - 1.0 - lead, actor: 'ball', do: 'rotateTo', amount: -150, dur: 0.55, ease: 'out' },
      { at: at - 1.0 - lead, actor: 'ball', do: 'scaleTo', amount: to / from, dur: 0.55, ease: 'out' },
      // 雪球放大是以腳底為準，y 不用動（一直站在地上）
      { at: at - 1.0 - lead, actor: 'ball', do: 'moveTo', to: { x: ballX(to), y: floorY(BALL) }, dur: 0.55, ease: 'out' },
      { at: at - 1.0 - lead, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.5 },
      // 滾好了！站起來得意
      { at: at - 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
      { at: at - 0.45, actor: 'raccoon', do: 'hop', amount: 2.5, dur: 0.22 },
    )
  }
  moves.push(
    // 雪雲抖一下（預備），一坨雪從雲裡掉下來
    { at: at - 0.42, actor: 'cloud', do: 'shake', amount: 1.2 + 0.4 * k, dur: 0.25 },
    { at: at - 0.42, actor: 'cloud', do: 'squash', amount: 0.15 + 0.05 * k, dur: 0.3 },
    { at: at - 0.3, actor: 'snow', do: 'moveTo', to: { x: CLOUD.x, y: CLOUD.y + 8 }, dur: 0.01 },
    { at: at - 0.29, actor: 'snow', do: 'pop', dur: 0.08 },
    { at: at - 0.28, actor: 'snow', do: 'scaleTo', amount: (FALL * size) / PILE0, dur: 0.01 },
    { at: at - 0.28, actor: 'snow', do: 'moveTo', to: { x, y: floorY(PILE0) }, dur: 0.28, ease: 'in' },
    // 噗！落地壓成寬扁的一大坨雪，埋住他
    { at, actor: 'snow', do: 'scaleTo', amount: 1 / FALL, dur: 0.14, ease: 'back' },
    { at, actor: 'snow', do: 'stretchTo', amount: w, dur: 0.14, ease: 'back' },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at, actor: 'raccoon', do: 'squash', amount: 0.2 + 0.05 * k, dur: 0.22 },
  )
  const fx: Fx[] = [
    // ❄️ 從雪堆底下往外噴（不蓋住他的臉）
    { at, kind: 'burst', x, y: 72, emoji: '❄️', n: 8, dur: 0.4, scale: 1.2 + 0.3 * k },
    // 💥 在雪堆頂上的右邊（不蓋住他露出來的地方），一次比一次大
    { at, kind: 'burst', x: x + 12, y: 77 - 0.88 * h, n: 1, dur: 0.35, scale: 1.2 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x, y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.28, sfx: 'whoosh' }, { at, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'plop' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 鑽出來：雪堆炸開成一片雪花，他抖掉身上的雪 */
function dig(at: number, k: number) {
  const { size, w, x } = PILE[k]
  const moves: Move[] = [
    { at, actor: 'snow', do: 'vanish', dur: 0.15 },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/cold' },
    { at, actor: 'raccoon', do: 'shake', amount: 1.4 + 0.2 * k, dur: 0.45 },
  ]
  const fx: Fx[] = [{ at, kind: 'burst', x, y: 77 - 0.5 * (size / w), emoji: '❄️', n: 6 + 2 * k, dur: 0.45, scale: 1 + 0.25 * k }]
  const cues: Cue[] = [{ at, sfx: 'poof' }]
  return { moves, fx, cues }
}

const H1 = 2.0, H2 = 3.85, H3 = 6.15
/** 第 3 次推完先停一拍 */
const LEAD3 = 0.4
const b1 = bury(H1, 0)
const b2 = bury(H2, 1)
const b3 = bury(H3, 2, true, LEAD3)
const C1 = H1 + HOLD, C2 = H2 + HOLD
const d1 = dig(C1, 0)
const d2 = dig(C2, 1)
/** 第 3 次：埋到只剩一隻手揮，然後碰！連人帶雪球炸上天 */
const C3 = H3 + HOLD + 0.1
/** 語詞：雪球從天上掉回來變成雪人（正中間；國字讓到左上方，雪雲在右上方） */
const SNOWMAN = { x: 80, size: 38 }
/** 回馬槍：撐傘 → 一片小雪花 → 收傘 → 噗 */
const UMB = 8.95, FLAKE = 9.3, CLOSE = 9.65, H4 = 10.05
const b4 = bury(H4, 3, false)
const C4 = H4 + HOLD + 0.05

const clip: Clip = {
  format: 2,
  char: '雪',
  meta: { theme: '下雪天堆雪人', cast: '浣熊花生＋雪雲＋雪球（雪人）', gags: ['花生熱心堆雪人，每次雪球滾好、站起來得意，頭上的雪雲就噗地倒下一大坨雪把他埋住，一次比一次深（胸口、只剩耳朵、只剩一隻手）；回馬槍是他學乖撐傘，雲只掉一片雪花，他得意收傘，最大的一坨雪噗地連人帶雪人整個埋掉、只剩傘露在外面'] },
  duration: 15,
  bg: { top: '#9FC6EC', bottom: '#E2EEFA', floor: '#F2F7FC', scenery: 'snow' },
  actors: [
    { id: 'cloud', emoji: '🌨️', x: CLOUD.x, y: CLOUD.y, size: 32, float: true, tint: 'brightness(.92) saturate(1.3)' },
    // 雪球（會滾）：語詞那一刻換成雪人
    { id: 'ball', emoji: 'prop:snowball', x: ballX(BALL), y: floorY(BALL), size: BALL, hidden: true, pivot: 'center' },
    // 姿勢圖朝左：他在雪球右邊往左推，不用翻
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: X, y: P, size: 24, hidden: true },
    // 掉下來的那坨雪＝埋住他的雪堆（同一顆雪球落地壓扁；畫在他和雪人前面）
    { id: 'snow', emoji: 'prop:snowball', x: CLOUD.x, y: CLOUD.y + 8, size: PILE0, hidden: true },
    // 傘（第 4 次）：舉在他頭上；畫在雪堆前面，被埋時收好的傘插在雪堆上
    { id: 'umb', emoji: '☂️', x: X + 1, y: 44, size: 22, hidden: true, float: true },
  ],
  moves: [
    // 花生跑進來，看到下雪好開心，指著天上：雪！
    { at: 0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: 185, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 0.55, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.25 },
    // 捏一顆小雪球放在地上：要堆雪人！
    { at: 0.85, actor: 'ball', do: 'pop', dur: 0.25 },
    ...b1.moves,
    ...d1.moves,
    // 第 2 次：再推大一點
    ...b2.moves,
    ...d2.moves,
    { at: C2 + 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 3 次：推完——先停一拍：他抬頭偷看雲（雲安安靜靜）……
    ...b3.moves,
    { at: H3 - 0.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/back' },
    { at: H3 - 0.85, actor: 'raccoon', do: 'tilt', amount: -6, dur: 0.35 },
    // 碰！雪堆炸開，連人帶雪球被炸上天
    { at: C3, actor: 'snow', do: 'vanish', dur: 0.12 },
    { at: C3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: C3, actor: 'raccoon', do: 'moveTo', to: { x: 150, y: -50 }, dur: 0.4, ease: 'out' },
    { at: C3, actor: 'raccoon', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    { at: C3, actor: 'ball', do: 'moveTo', to: { x: 50, y: -50 }, dur: 0.45, ease: 'out' },
    { at: C3, actor: 'ball', do: 'rotateTo', amount: -360, dur: 0.45 },
    // 語詞那一刻：雪球從天上掉回正中間——變成雪人！他也掉回來，好開心
    { at: 7.95, actor: 'ball', do: 'swap', emoji: 'prop:snowman' },
    // 滾過的角度全部轉回來，雪人站得直直的
    { at: 7.95, actor: 'ball', do: 'rotateTo', amount: 150 * 3 + 360, dur: 0.01 },
    { at: 7.95, actor: 'ball', do: 'scaleTo', amount: SNOWMAN.size / BALLS[2], dur: 0.01 },
    { at: 7.95, actor: 'ball', do: 'moveTo', to: { x: SNOWMAN.x, y: -40 }, dur: 0.01 },
    { at: 8.0, actor: 'ball', do: 'moveTo', to: { x: SNOWMAN.x, y: floorY(BALL) }, dur: 0.3, ease: 'in' },
    { at: 8.3, actor: 'ball', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 8.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 8.2, actor: 'raccoon', do: 'scaleTo', amount: BIG, dur: 0.01 },
    { at: 8.2, actor: 'raccoon', do: 'moveTo', to: { x: X, y: -50 }, dur: 0.01 },
    { at: 8.25, actor: 'raccoon', do: 'moveTo', to: { x: X, y: P }, dur: 0.3, ease: 'in' },
    { at: 8.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: 8.6, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍（第 4 次）：他學乖了——抬頭看雲，撐起傘
    { at: UMB, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/lift' },
    { at: UMB, actor: 'umb', do: 'pop', dur: 0.25 },
    // 雲一抖……只掉下一片小雪花，咚在傘上
    { at: FLAKE - 0.2, actor: 'cloud', do: 'shake', amount: 0.8, dur: 0.2 },
    { at: FLAKE + 0.2, actor: 'umb', do: 'hop', amount: -1.2, dur: 0.15 },
    // 哼哼，沒事！得意地收起傘
    { at: CLOSE, actor: 'umb', do: 'swap', emoji: '🌂' },
    { at: CLOSE, actor: 'umb', do: 'moveTo', to: { x: X - 14, y: 60 }, dur: 0.15 },
    { at: CLOSE, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
    { at: CLOSE + 0.05, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.2 },
    // 噗！最大的一坨，連人帶雪人整個埋掉；收好的傘插在雪堆上
    ...b4.moves,
    // 雪雲倒光了，輕飄飄地飄走（問他之前就出畫面）
    { at: H4 + 0.15, actor: 'cloud', do: 'moveTo', to: { x: 200, y: CLOUD.y - 4 }, dur: 0.4, ease: 'in' },
    { at: H4, actor: 'umb', do: 'moveTo', to: { x: X - 6, y: 31 }, dur: 0.12, ease: 'out' },
    { at: H4, actor: 'umb', do: 'rotateTo', amount: 25, dur: 0.12 },
    { at: H4 + 0.12, actor: 'umb', do: 'shake', amount: 1.2, dur: 0.4 },
    // 鑽出來——雪堆一散，雪人也被壓垮、跟著散掉了（問他的時候畫面上只剩他和字）
    { at: C4, actor: 'snow', do: 'vanish', dur: 0.15 },
    { at: C4, actor: 'ball', do: 'vanish', dur: 0.15 },
    { at: C4, actor: 'umb', do: 'vanish', dur: 0.15 },

    { at: C4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: C4, actor: 'raccoon', do: 'shake', amount: 1.8, dur: 0.4 },
    // 問他：他走到左前方、變大，轉向觀眾（字在右邊）
    { at: 10.72, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 10.72, actor: 'raccoon', do: 'flip' },
    { at: 10.72, actor: 'raccoon', do: 'scaleTo', amount: 1.5 / BIG, dur: 0.3, ease: 'back' },
    { at: 10.72, actor: 'raccoon', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.9, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.45, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.95, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.4, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.4, actor: 'raccoon', do: 'hop', amount: 6, dur: 0.25 },
    // 退場：他開心地跑走，畫面只留下字
    { at: 13.7, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.7, actor: 'raccoon', do: 'flip' },
    { at: 13.72, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：雪從天上落下來——雨字頭（上半、四點）
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2, 3], from: 'cloud', style: 'drop', color: partColor('雨') },
    { at: H2 + 0.05, dur: 0.55, strokes: [4, 5, 6, 7], from: 'cloud', style: 'drop', color: partColor('雨') },
    // 第 3 次：雪堆裡只露出一隻手揮——彐（手）從手上飛出來
    { at: H3 + 0.25, dur: 0.5, strokes: [8, 9, 10], from: { x: X + 2, y: 46 }, color: partColor('彐') },
  ],
  glyph: [
    { at: 7.05, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到左上方：正中間給雪人，右上方是雪雲
    { at: 7.85, dur: 0.45, do: 'park', to: { x: 38, y: 21 }, amount: 0.52 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: 10.65, dur: 3.3, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.7, dur: 0.4, do: 'home' },
    { at: 13.4, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'burst', x: 100, y: 30, emoji: '❄️', n: 6, dur: 0.5 },
    ...b1.fx,
    ...d1.fx,
    ...b2.fx,
    ...d2.fx,
    // 第 3 次前停一拍：他抬頭偷看雲
    { at: H3 - 0.85, kind: 'pop', actor: 'raccoon', emoji: '👀', dx: -12, dur: 0.45, scale: 1.8 },
    ...b3.fx,
    // 埋到只剩一隻手在外面揮
    { at: H3 + 0.12, kind: 'pop', x: X - 4, y: 50, emoji: '✋', dur: C3 - H3 - 0.12, scale: 1.7 },
    { at: C3, kind: 'burst', x: X, y: 56, emoji: '❄️', n: 12, dur: 0.55, scale: 1.8 },
    { at: C3, kind: 'burst', x: X, y: 56, n: 1, dur: 0.4, scale: 2.6 },
    // 雪人！
    { at: 8.3, kind: 'burst', x: SNOWMAN.x, y: 52, emoji: '✨', n: 8, dur: 0.5, scale: 1.4 },
    // 一片小雪花掉在傘上
    { at: FLAKE - 0.05, kind: 'pop', x: X - 4, y: 30, emoji: '❄️', dur: 0.35, scale: 1.5 },
    { at: CLOSE + 0.1, kind: 'pop', actor: 'raccoon', emoji: '😎', dx: -14, dur: 0.35, scale: 1.5 },
    ...b4.fx,
    { at: C4, kind: 'burst', x: X, y: 52, emoji: '❄️', n: 12, dur: 0.55, scale: 1.8 },
    { at: C4 + 0.1, kind: 'dizzy', actor: 'raccoon', dur: 0.4 },
    { at: 13.4, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 自動取景會推近到他、把頭上的雪雲切掉——劇本自己「推近」一點點（幾乎是全景），雲、雪球、他都在
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: C3, dur: 0.35, do: 'shake', amount: 2.2 },
    { at: 6.85, dur: 0.3, do: 'zoom', amount: 1 },
    // 回馬槍：國字拼好後自動取景會靠向他、切掉雪雲——這段也幾乎全景
    { at: 8.9, dur: 0.25, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b4.camera,
    { at: H4 + 0.05, dur: 0.4, do: 'shake', amount: 2.4 },
    { at: 10.5, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次被埋白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.05, dur: 0.05, level: -0.35 },
    { at: 7.1, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '雪' },
    { at: 0.9, sfx: 'tap' },
    ...[H1, H2, H3 - LEAD3].map((at): Cue => ({ at: at - 1.0, sfx: 'slide' })),
    ...b1.cues,
    ...d1.cues,
    ...b2.cues,
    ...d2.cues,
    ...b3.cues,
    { at: C3, sfx: 'poof' },
    { at: C3 + 0.05, sfx: 'whoosh' },
    { at: 7.15, say: '雪' },
    { at: 8.3, sfx: 'plop' },
    { at: 8.4, say: '雪人' },
    { at: UMB, sfx: 'blip' },
    { at: FLAKE + 0.15, sfx: 'tap' },
    { at: CLOSE, sfx: 'blip' },
    ...b4.cues,
    { at: H4 + 0.12, sfx: 'rumble' },
    { at: C4, sfx: 'poof' },
    { at: 10.85, say: FIXED_LINES.clipAsk },
    { at: 13.4, say: '雪' },
    { at: 13.45, sfx: 'cheer' },
    { at: 13.75, sfx: 'whoosh' },
  ],
}

export default clip
