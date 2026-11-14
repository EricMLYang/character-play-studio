import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 森（v2）：地上種著三棵小苗，熱心的浣熊花生把一大桶水舉過頭頂去澆——每次水一倒下去，小苗就「轟」地一下長成大樹，把站在旁邊的他頂飛，一次比一次誇張：
// 被頂得跌坐在地上（後面那棵，上面的木從它的樹冠飛出來）、被樹冠托上樹梢掛著再摔下來（左前那棵，左下的木）、先停一拍：他盯著最後一棵小苗、慢慢倒水……直接被頂上天（右前那棵，右下的木）。
// 三棵樹排成跟「森」一樣：一棵在後面（上面）、兩棵在前面（下面）。字拼好放大時三棵樹縮到字的右邊，還是排成森的樣子，樹和木一對一對各亮一下——長得一樣。
// 語詞：三棵樹跳回中間（森林）。回馬槍：他得意地把桶裡剩下的水甩一甩，結果全倒在自己頭上——頭上冒出一棵小苗，「轟」地被頂上天，飛得最高。
// 最後畫面暗下來只剩「森」，樹縮回土裡，花生從天上掉到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「森！」，然後退場只留字。
// 森、森、森林、這是什麼字？、森
const P = 66.9 // 花生（size 24）站在地上的 y（腳底 77）
/**
 * 三棵樹（prop:tree）：一棵在後面（往上站一點、小一點）、兩棵在前面，排成「森」的樣子；合起來是畫面上最大的東西。
 * feet 是腳底（樹幹底）的 y；y 照引擎的畫法 feet − 0.42 × size。樹冠頂在 feet − 0.877 × size，都在字框（讓位時 y 35 以下）下面。
 */
const TREES = {
  tB: { x: 80, size: 40, feet: 72 },
  tL: { x: 52, size: 38, feet: 77 },
  tR: { x: 108, size: 38, feet: 77 },
} as const
type TreeId = keyof typeof TREES
const ty = (id: TreeId) => TREES[id].feet - 0.42 * TREES[id].size
/** 樹冠中心（筆畫從這裡飛出來、亮一下的地方） */
const crown = (id: TreeId, k = 1, at: { x: number; size: number; feet: number } = TREES[id]) => ({ x: at.x, y: at.feet - 0.59 * at.size * k })
/** 長大之前是小苗（🌱）：同一個角色縮成這麼多倍，長大那一刻換成樹、放大回來 */
const SPR = 0.3
/** 花生每次站在小苗左邊這麼遠、面向右邊倒水 */
const SP = -10
const spot = (id: TreeId) => TREES[id].x + SP
/** 水桶（prop:bucket）：舉在頭頂上（lift 姿勢的雙手上面）、放在地上 */
const BS = 11
const OVER = -15
const GROUND = 77 - 0.42 * BS
/** 被頂到以後傻眼停多久 */
const HOLD = 0.4
/** 國字放大時三棵樹縮到字的右邊、還是排成森：前面兩棵 0.55 倍，後面那棵 0.6 倍、站高一點 */
const SIDE = {
  tB: { x: 137.5, k: 0.6, feet: 67 },
  tL: { x: 128, k: 0.55, feet: 77 },
  tR: { x: 147, k: 0.55, feet: 77 },
} as const
/** 國字在正中央時，上面的木、左下的木、右下的木的中心（hanzi-writer 座標換算） */
const G = {
  tB: { x: 81, y: 30 },
  tL: { x: 64.5, y: 57 },
  tR: { x: 91.5, y: 57 },
} as const

/** 花生帶著舉在頭上的水桶一起走 */
function carry(at: number, dur: number, x: number, ease: Move['ease'] = 'inOut'): Move[] {
  return [
    { at, dur, actor: 'raccoon', do: 'moveTo', to: { x, y: P }, ease },
    { at, dur, actor: 'bucket', do: 'moveTo', to: { x: x + 1, y: P + OVER }, ease },
  ]
}
/** 把地上的水桶撿起來舉過頭 */
function pickUp(at: number, x: number): Move[] {
  return [
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/lift' },
    { at, dur: 0.18, actor: 'bucket', do: 'moveTo', to: { x: x + 1, y: P + OVER }, ease: 'out' },
  ]
}

/**
 * 「嘩—轟」：花生把舉在頭上的水桶往前一倒（💦 澆在小苗上）→ 小苗抖、地上冒煙（預備）→
 * 「轟」地換成大樹、放大回來那一刻 💥＋🍃＋白光＋鏡頭震＋同一個音效，他傻眼（被頂飛怎麼飛每次不同，寫在劇本裡）。
 * at 是長成大樹的那一刻，k 是第幾次（越後面越大）。
 */
function grow(at: number, k: number, id: TreeId) {
  const rx = spot(id)
  const t = TREES[id]
  const moves: Move[] = [
    // 嘩：水桶往前倒
    { at: at - 0.65, dur: 0.2, actor: 'bucket', do: 'rotateTo', amount: 60 },
    { at: at - 0.65, dur: 0.2, actor: 'bucket', do: 'moveTo', to: { x: rx + 6, y: P + OVER + 2 } },
    { at: at - 0.65, dur: 0.4, actor: 'raccoon', do: 'tilt', amount: 8 },
    { at: at - 0.35, dur: 0.15, actor: 'bucket', do: 'rotateTo', amount: -60 },
    { at: at - 0.35, dur: 0.15, actor: 'bucket', do: 'moveTo', to: { x: rx + 1, y: P + OVER } },
    // 小苗抖：要長了
    { at: at - 0.32, dur: 0.3, actor: id, do: 'shake', amount: 1 + 0.5 * k },
    // 轟：長成大樹
    { at, actor: id, do: 'swap', emoji: 'prop:tree' },
    { at, dur: 0.28, actor: id, do: 'scaleTo', amount: 1 / SPR, ease: 'back' },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at, dur: 0.25, actor: 'raccoon', do: 'squash', amount: 0.25 + 0.08 * k },
  ]
  const fx: Fx[] = [
    { at: at - 0.55, kind: 'burst', x: t.x - 1, y: t.feet - 6, emoji: '💦', n: 5, dur: 0.4, scale: 1.1 },
    { at: at - 0.3, kind: 'puff', x: t.x, y: t.feet - 2, dur: 0.3, scale: 1 + 0.3 * k },
    // 💥 每次都在他頭上同一個位置，一次比一次大；樹冠噴出葉子
    { at, kind: 'burst', x: rx, y: P - 16, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
    { at: at + 0.05, kind: 'burst', ...crown(id), emoji: '🍃', n: 6 + 2 * k, dur: 0.5, scale: 1.2 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: rx + 4, y: P - 14 } },
    { at, dur: 0.3, do: 'shake', amount: 1 + 0.5 * k },
  ]
  const lights: Light[] = [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]
  // 同一個音效（倒水「嘩」、長大「轟—咚」），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.55, sfx: 'splash' }, { at: at - 0.3, sfx: 'rumble' }, { at, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'poof' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'whoosh' })
  return { moves, fx, camera, lights, cues }
}

const H1 = 1.75, H2 = 3.75, H3 = 6.45
const g1 = grow(H1, 0, 'tB')
const g2 = grow(H2, 1, 'tL')
const g3 = grow(H3, 2, 'tR')
/** 國字拼好、放大到正中央 */
const HOME = 7.5
/** 讓位、語詞 */
const PARK = 8.5
/** 回馬槍：水倒在自己頭上、頭上冒出小苗，轟 */
const SPILL = 9.55
const H4 = 10.25
const ASK = 10.85
const ANSWER = 13.6

/** 三棵樹一起移到某個排法（k 是相對於原本大小的倍率變化） */
function trees(at: number, dur: number, to: (id: TreeId) => { x: number; feet: number }, k: (id: TreeId) => number): Move[] {
  return (Object.keys(TREES) as TreeId[]).flatMap((id): Move[] => [
    { at, dur, actor: id, do: 'moveTo', to: { x: to(id).x, y: to(id).feet - 0.42 * TREES[id].size }, arc: 8, ease: 'out' },
    { at, dur, actor: id, do: 'scaleTo', amount: k(id), ease: 'out' },
  ])
}

const clip: Clip = {
  format: 2,
  char: '森',
  meta: { theme: '花生澆水種樹', cast: '浣熊花生＋三棵樹＋水桶', gags: ['熱心的花生把一大桶水舉過頭去澆小苗，每次水一倒下去小苗就轟地長成大樹，把他頂飛，一次比一次誇張（跌坐、掛在樹梢、頂上天）；回馬槍是他得意地甩甩水桶，水全倒在自己頭上，頭上冒出小苗，轟地把自己頂得最高'] },
  duration: 15,
  bg: { top: '#D9F2D0', bottom: '#F4FBEF', floor: '#A4C77A', scenery: 'hills' },
  actors: [
    // 三棵小苗（同一個角色，長大時換成大樹）：後面那棵先畫
    ...(Object.keys(TREES) as TreeId[]).map((id) => ({ id, emoji: '🌱', x: TREES[id].x, y: ty(id), size: TREES[id].size })),
    // 姿勢圖朝左，翻過來面向右邊的小苗；一路舉著水桶（lift）
    { id: 'raccoon', emoji: 'hero:raccoon/lift', x: 40, y: P, size: 24, hidden: true, flip: true },
    { id: 'bucket', emoji: 'prop:bucket', x: 41, y: P + OVER, size: BS, hidden: true, pivot: 'center' as const },
  ],
  moves: [
    // 開場就縮成小苗
    ...(Object.keys(TREES) as TreeId[]).map((id): Move => ({ at: -0.02, dur: 0.01, actor: id, do: 'scaleTo', amount: SPR })),
    // 花生舉著一大桶水登場，抬頭看字框：森！
    { at: 0, dur: 0.45, actor: 'raccoon', do: 'enter', from: { x: -25, y: P }, ease: 'out' },
    { at: 0, dur: 0.45, actor: 'bucket', do: 'enter', from: { x: -24, y: P + OVER }, ease: 'out' },
    { at: 0.6, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 2 },
    { at: 0.6, dur: 0.3, actor: 'bucket', do: 'hop', amount: 2 },
    // 第 1 次：走到後面那棵小苗旁邊，嘩——轟！被頂得往後跌坐
    ...carry(0.8, 0.3, spot('tB')),
    ...g1.moves,
    { at: H1 + 0.05, dur: 0.45, actor: 'raccoon', do: 'moveTo', to: { x: 30, y: P }, arc: 12, ease: 'out' },
    { at: H1 + 0.05, dur: 0.45, actor: 'raccoon', do: 'spin', times: -1, pivot: 'center' },
    { at: H1 + 0.05, dur: 0.5, actor: 'bucket', do: 'moveTo', to: { x: 40, y: GROUND }, arc: 16, ease: 'out' },
    { at: H1 + 0.05, dur: 0.5, actor: 'bucket', do: 'spin', times: 1 },
    { at: H1 + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/fall' },
    // 第 2 次：撿起水桶，走到左前那棵小苗旁邊，嘩——轟！被樹冠托上樹梢掛著
    ...pickUp(2.75, 30),
    ...carry(2.85, 0.25, spot('tL')),
    ...g2.moves,
    { at: H2, dur: 0.28, actor: 'raccoon', do: 'moveTo', to: { x: 47, y: 35 }, ease: 'out' },
    { at: H2, dur: 0.55, actor: 'bucket', do: 'moveTo', to: { x: 36, y: GROUND }, arc: 18, ease: 'out' },
    { at: H2, dur: 0.55, actor: 'bucket', do: 'spin', times: -1 },
    { at: H2 + HOLD, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/scared' },
    { at: H2 + HOLD, dur: 0.4, actor: 'raccoon', do: 'shake', amount: 1.2 },
    // 撐不住，摔下來趴扁
    { at: 4.45, dur: 0.28, actor: 'raccoon', do: 'moveTo', to: { x: 40, y: P }, ease: 'in' },
    { at: 4.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 4.73, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    // 第 3 次：撿起水桶，走到右前那棵小苗旁邊——先停一拍：盯著小苗、冒汗，慢慢倒……轟！直接被頂上天
    ...pickUp(5.1, 40),
    ...carry(5.2, 0.45, spot('tR')),
    { at: 5.7, dur: 0.35, actor: 'raccoon', do: 'tilt', amount: -6 },
    ...g3.moves,
    // 傻眼停一下（看得見臉），才被頂上天
    { at: H3 + 0.08, dur: 0.22, actor: 'raccoon', do: 'shake', amount: 1.4 },
    { at: H3 + 0.3, dur: 0.12, actor: 'raccoon', do: 'squash', amount: -0.2 },
    { at: H3 + 0.3, dur: 0.35, actor: 'raccoon', do: 'moveTo', to: { x: 118, y: -55 }, ease: 'out' },
    { at: H3 + 0.3, dur: 0.35, actor: 'raccoon', do: 'spin', times: 2, pivot: 'center' },
    { at: H3 + 0.3, dur: 0.4, actor: 'bucket', do: 'moveTo', to: { x: 132, y: -40 }, ease: 'out' },
    { at: H3 + 0.3, dur: 0.4, actor: 'bucket', do: 'spin', times: 2 },
    // 字拼好前三棵樹縮到字的右邊、還是排成森；國字放大時樹和木一對一對亮一下
    ...trees(7.0, 0.4, (id) => SIDE[id], (id) => SIDE[id].k),
    ...(['tB', 'tL', 'tR'] as const).map((id, i): Move => ({ at: 7.95 + 0.18 * i, dur: 0.4, actor: id, do: 'flash' })),
    // 花生從天上掉回左邊，摔扁；水桶也掉下來
    { at: 7.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 7.55, dur: 0.01, actor: 'raccoon', do: 'moveTo', to: { x: 28, y: -50 } },
    { at: 7.6, dur: 0.3, actor: 'raccoon', do: 'moveTo', to: { x: 28, y: P }, ease: 'in' },
    { at: 7.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    { at: 7.6, dur: 0.01, actor: 'bucket', do: 'moveTo', to: { x: 40, y: -40 } },
    { at: 7.7, dur: 0.3, actor: 'bucket', do: 'moveTo', to: { x: 40, y: GROUND }, ease: 'in' },
    // 語詞那一刻：國字讓回上方，三棵樹跳回中間排好（森林）；花生爬起來開心
    ...trees(PARK, 0.4, (id) => TREES[id], (id) => 1 / SIDE[id].k),
    { at: PARK + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: PARK + 0.45, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 5 },
    ...(['tB', 'tL', 'tR'] as const).map((id, i): Move => ({ at: 8.95 + 0.06 * i, dur: 0.3, actor: id, do: 'hop', amount: 3 })),
    // 回馬槍（第 4 次）：得意地撿起水桶，把剩下的水甩一甩——往後倒，全倒在自己頭上
    { at: 9.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
    ...pickUp(9.25, 28),
    { at: SPILL - 0.15, dur: 0.2, actor: 'bucket', do: 'rotateTo', amount: -150 },
    { at: SPILL - 0.15, dur: 0.2, actor: 'bucket', do: 'moveTo', to: { x: 27, y: P + OVER + 4 } },
    { at: SPILL + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: SPILL + 0.05, dur: 0.25, actor: 'raccoon', do: 'squash', amount: 0.3 },
    // 頭上冒出小苗……地上轟轟地抖……
    { at: SPILL + 0.35, dur: 0.35, actor: 'raccoon', do: 'shake', amount: 1.6 },
    // 轟！被頂得最高，連水桶一起飛出畫面；三棵樹也跟著抖
    { at: H4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/scared' },
    { at: H4, dur: 0.2, actor: 'raccoon', do: 'shake', amount: 1.6 },
    { at: H4 + 0.2, dur: 0.12, actor: 'raccoon', do: 'squash', amount: -0.25 },
    { at: H4 + 0.2, dur: 0.33, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: -60 }, ease: 'out' },
    { at: H4 + 0.2, dur: 0.33, actor: 'raccoon', do: 'spin', times: -3, pivot: 'center' },
    { at: H4 + 0.2, dur: 0.38, actor: 'bucket', do: 'moveTo', to: { x: 20, y: -50 }, ease: 'out' },
    { at: H4 + 0.2, dur: 0.38, actor: 'bucket', do: 'spin', times: 2 },
    ...(['tB', 'tL', 'tR'] as const).map((id): Move => ({ at: H4, dur: 0.35, actor: id, do: 'shake', amount: 2 })),
    // 問他：樹縮回土裡；花生從天上掉到左前方、變大，轉向觀眾
    ...(['tB', 'tL', 'tR'] as const).flatMap((id): Move[] => [
      { at: ASK, dur: 0.35, actor: id, do: 'scaleTo', amount: 0.02, ease: 'in' },
      { at: ASK + 0.35, dur: 0.05, actor: id, do: 'vanish' },
    ]),
    { at: ASK + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK + 0.05, dur: 0.01, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: -50 } },
    { at: ASK + 0.05, dur: 0.01, actor: 'raccoon', do: 'scaleTo', amount: 1.55 },
    { at: ASK + 0.1, dur: 0.25, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: P + 4 }, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 12.05, dur: 0.3, actor: 'raccoon', do: 'rotateTo', amount: 10 },
    { at: 12.6, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'raccoon', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'raccoon', do: 'rotateTo', amount: -10 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, dur: 0.2, actor: 'raccoon', do: 'hop', amount: 8 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: ANSWER + 0.2, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.2, dur: 0.15, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, ease: 'in' },
  ],
  builds: [
    // 每長出一棵樹，就有一個完整的「木」從它的樹冠飛上去：後面那棵＝上面的木、左前＝左下的木、右前＝右下的木
    { at: H1 + 0.1, dur: 0.55, strokes: [0, 1, 2, 3], from: crown('tB'), color: partColor('木') },
    { at: H2 + 0.1, dur: 0.55, strokes: [4, 5, 6, 7], from: crown('tL'), color: partColor('木') },
    { at: H3 + 0.1, dur: 0.55, strokes: [8, 9, 10, 11], from: crown('tR'), color: partColor('木') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    { at: H1 + 0.5, kind: 'dizzy', actor: 'raccoon', dur: 0.5 },
    ...g2.fx,
    { at: H2 + HOLD, kind: 'sweat', actor: 'raccoon' },
    { at: 4.73, kind: 'dizzy', actor: 'raccoon', dur: 0.4 },
    // 第 3 次前停一拍：盯著最後一棵小苗、冒汗
    { at: 5.65, kind: 'pop', actor: 'raccoon', emoji: '👀', dx: 10, dy: 2, dur: 0.6, scale: 1.5 },
    { at: 5.75, kind: 'sweat', actor: 'raccoon' },
    ...g3.fx,
    { at: H3, kind: 'burst', x: spot('tR'), y: P - 16, emoji: '⭐', n: 6, dur: 0.4 },
    // 國字放大：縮到右邊的三棵樹和三個木，一對一對各亮一下——長得一樣
    ...(['tB', 'tL', 'tR'] as const).flatMap((id, i): Fx[] => [
      { at: 7.95 + 0.18 * i, kind: 'burst', ...crown(id, SIDE[id].k, { ...TREES[id], ...SIDE[id] }), emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
      { at: 7.95 + 0.18 * i, kind: 'burst', ...G[id], emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    ]),
    { at: 7.95, kind: 'dizzy', actor: 'raccoon', dur: 0.4 },
    // 森林：三棵樹跳回來，葉子飛
    { at: 8.95, kind: 'burst', x: 80, y: 46, emoji: '🍃', n: 8, dur: 0.5, scale: 1.2 },
    // 回馬槍：水倒在自己頭上，頭上冒出小苗
    { at: SPILL, kind: 'burst', x: 28, y: P - 12, emoji: '💦', n: 5, dur: 0.4, scale: 1.1 },
    { at: SPILL + 0.2, kind: 'pop', actor: 'raccoon', emoji: '🌱', dy: 4, dur: 0.62, scale: 2.6 },
    { at: SPILL + 0.4, kind: 'puff', x: 28, y: 75, dur: 0.3, scale: 1.6 },
    { at: H4, kind: 'burst', x: 46, y: P - 24, n: 1, dur: 0.45, scale: 2.7 },
    { at: H4, kind: 'burst', x: 32, y: P - 16, emoji: '🍃', n: 12, dur: 0.5, scale: 1.2 },
    { at: H4, kind: 'burst', x: 32, y: P - 16, emoji: '⭐', n: 8, dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：花生每次都被頂到樹梢、頂上天，自動取景會追著他把樹切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...g1.camera,
    ...g2.camera,
    { at: 4.73, dur: 0.25, do: 'shake', amount: 1.2 },
    ...g3.camera,
    { at: 7.2, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.9, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.25, to: { x: 36, y: P - 14 } },
    { at: H4, dur: 0.4, do: 'shake', amount: 2.6 },
  ],
  lights: [
    ...g1.lights,
    ...g2.lights,
    ...g3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: H4, dur: 0.04, level: -0.5 },
    { at: H4 + 0.04, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '森' },
    ...g1.cues,
    { at: H1 + 0.5, sfx: 'plop' },
    ...g2.cues,
    { at: 4.73, sfx: 'plop' },
    ...g3.cues,
    { at: 7.9, sfx: 'plop' },
    { at: HOME + 0.1, say: '森' },
    { at: 8.95, say: '森林' },
    { at: SPILL, sfx: 'splash' },
    { at: SPILL + 0.2, sfx: 'blip' },
    { at: SPILL + 0.4, sfx: 'rumble' },
    { at: H4, sfx: 'boing' },
    { at: H4 + 0.04, sfx: 'poof' },
    { at: H4 + 0.08, sfx: 'whoosh' },
    { at: H4 + 0.12, sfx: 'bonk' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '森' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
