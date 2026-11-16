import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 拉（v2）：地上一條繩子從畫面左邊伸進來，楊捷睿撿起來、抓緊、身體往後倒「嘿——咻！」一拉，
// 繩子另一頭就「咻」地拉出一樣東西，一次比一次大、拉得一次比一次吃力：
// 一隻小青蛙一拉就出來，他閉眼得意（扌）→ 一隻大熊，拉到發抖才出來，他往後一屁股跌坐（立的上半）→
// 先停一拍：繩子「轟隆隆」抖，他吞口水、托下巴看——拚命拉到腳底打滑，拉出一隻超大的獅子（一出來就「吼」），他整個人往後飛（立的下半）。
// 每次拉出來的東西都會被繩子另一頭「咻」地拉回去（那一頭好像有什麼）。
// 語詞那一刻：大熊走回來，跟他在畫面中間手牽手跳一跳：手拉手。
// 回馬槍（第四次）：繩子又伸進來了，他牽著大熊、得意地照樣一拉——這次另一頭反過來一拉，兩個連成一串「咻——」被拉出畫面。
// 最後畫面暗下來只剩「拉」，楊捷睿走回來問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「拉！」，然後退場只留字。
// 刻意不跟「推」（雙手往前頂、東西滑走）、「長」（拉蛇尾巴拉出好長一條）撞：這支一定是抓著繩子往後拉，東西從畫面外被拉進來。
// 拉、拉、手拉手、這是什麼字？、拉

/** 楊捷睿（右邊、朝左；前三次都站在同一個地方拉） */
const YS = 34
const P = 77 - 0.42 * YS
const YX = 112
/** 各姿勢握繩子的那隻手（圖朝左；照他的 x、y 算） */
const HAND = {
  pull: { dx: -0.27 * YS, dy: 0.05 * YS },
  reach: { dx: -0.42 * YS, dy: 0 },
  smug: { dx: -0.17 * YS, dy: 0.1 * YS },
  surprised: { dx: -0.2 * YS, dy: 0.2 * YS },
  fall: { dx: -0.15 * YS, dy: 0.12 * YS },
  ponder: { dx: -0.15 * YS, dy: 0.15 * YS },
}
type Pose = keyof typeof HAND
/** 繩子的顏色、粗細、一圈一圈的紋路間隔 */
const ROPE = '#C8954E'
const RW = 1.9
const RN = 1.7
/** 繩子在地上那一段的高度 */
const GROUND = 73.5

/**
 * 被拉出來的東西（都朝右，面向他），一次比一次大：小青蛙（高約 22）、大熊（高約 38）、超大獅子（高約 51）；從畫面外的 out 被拉到 x。
 * 繩子綁在胸前（knot 照牠的 x、y 算）。
 */
const FROG = { size: 30, x: 60, out: -25, knot: { dx: 0.3 * 30, dy: 0.12 * 30 }, ay: 77 - 0.42 * 62 }
const BEAR = { size: 44, x: 58, out: -35, knot: { dx: 0.25 * 44, dy: 0.12 * 44 } }
/** 獅子：畫面左邊容得下的最大（寬 x 6～56、吼的聲波到 x 60，頭頂 y 約 29），整隻在畫面裡、不碰字框（x 62.7 起） */
const LION = { size: 62, x: 31, out: -42, knot: { dx: 0.2 * 62, dy: 0.1 * 62 } }
const yOf = (size: number) => 77 - 0.42 * size
/** 繩結在畫面外等著的位置 */
const OFF = { x: -30, y: 66 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
/** ay：actor 本身的 y（小青蛙的底子是獅子的 size、縮小時以腳底為準，所以 y 要照獅子算） */
type Thing = { size: number; x: number; out: number; knot: { dx: number; dy: number }; ay?: number }

/**
 * 同一個笑點：換成 pull、咬牙發抖（strain 秒）→「嘿——咻！」身體往後一倒，繩子另一頭的東西「咻」地被拉進畫面（slide 秒），
 * 停在他前面那一刻：💥（一次比一次大）＋鏡頭推一下＋震＋同一個「啵」聲（一次多疊一個音）。
 * at 是東西停下來那一刻，k 是第幾次（0～2），land 是他往後飛落地的 x（鏡頭推向東西和他中間，兩個都留在畫面裡）。他往後飛多遠、怎麼反應由呼叫的人寫。
 */
function haul(at: number, k: number, who: string, th: Thing, strain: number, slide: number, land: number): Gag {
  const y = yOf(th.size), ay = th.ay ?? y
  const t0 = at - slide
  const moves: Move[] = [
    { at: t0 - strain, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    { at: t0 - strain + 0.1, actor: 'yang', do: 'shake', amount: 0.35 + 0.3 * k, dur: strain - 0.1 },
    // 被拉進來：貼著地面滑（小小的 arc 讓牠不踩步伐，像被拖著走）
    { at: t0, actor: who, do: 'moveTo', to: { x: th.x, y: ay }, dur: slide, ease: 'out', arc: 1.5 },
    { at: t0, actor: 'knot', do: 'moveTo', to: { x: th.x + th.knot.dx, y: y + th.knot.dy }, dur: slide, ease: 'out', arc: 1.5 },
    { at, actor: who, do: 'squash', amount: 0.18, dur: 0.25 },
  ]
  const front = { x: th.x + th.knot.dx + 2, y: y + th.knot.dy - 2 }
  const fx: Fx[] = [
    { at, kind: 'burst', x: front.x, y: front.y, n: 1, dur: 0.4, scale: 1.4 + 0.45 * k },
    { at, kind: 'puff', actor: who, dur: 0.45 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: k === 2 ? 0.05 : 0.08 + 0.03 * k, to: { x: (th.x + land) / 2, y: 55 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at: t0, sfx: 'whoosh' }, { at, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 繩子另一頭「咻」地把東西拉回畫面外 */
function yankBack(at: number, who: string, th: Thing, dur = 0.3): Gag {
  const ay = th.ay ?? yOf(th.size)
  return {
    moves: [
      { at, actor: who, do: 'moveTo', to: { x: th.out, y: ay }, dur, ease: 'in', arc: 1.5 },
      { at, actor: 'knot', do: 'moveTo', to: OFF, dur, ease: 'in' },
    ],
    fx: [],
    camera: [],
    cues: [{ at, sfx: 'slide' }],
  }
}

/** 繩子：一段一段（每段一個姿勢），從他的手接到繩結 */
function rope(from: number, to: number, pose: Pose): Fx {
  return { at: from, dur: to - from, kind: 'tube', actor: 'yang', ...HAND[pose], target: 'knot', color: ROPE, width: RW, n: RN }
}
/** 繩子不在他手上的時候：從地上的繩頭（end）接到繩結 */
function loose(from: number, to: number): Fx {
  return { at: from, dur: to - from, kind: 'tube', actor: 'end', target: 'knot', color: ROPE, width: RW, n: RN }
}

const H1 = 1.85, H2 = 3.95, H3 = 6.5, H4 = 10.4
const g1 = haul(H1, 0, 'thing', FROG, 0.4, 0.25, YX + 4)
const b1 = yankBack(2.6, 'thing', FROG)
const g2 = haul(H2, 1, 'bear', BEAR, 0.65, 0.35, YX + 16)
const b2 = yankBack(4.7, 'bear', BEAR, 0.35)
// 第三次：先停一拍，咬牙最久、拉最久
const g3 = haul(H3, 2, 'thing', LION, 0.6, 0.4, YX + 22)
const b3 = yankBack(6.95, 'thing', LION, 0.35)

const WORD = 9.25
/** 語詞那一刻：他在左、大熊在右，手牽在中間 */
const WX = 74
const BX = 104

const clip: Clip = {
  format: 2,
  char: '拉',
  meta: { theme: '拉繩子拉出大東西', cast: '楊捷睿＋小青蛙／獅子＋大熊＋繩子', gags: ['楊捷睿每次抓住繩子往後一拉，另一頭就拉出一樣東西，一次比一次大、拉得一次比一次吃力：小青蛙、拉到發抖的大熊、拉到腳打滑往後飛的超大獅子；回馬槍是他牽著大熊得意地再拉，另一頭反過來一拉，兩個連成一串被拉出畫面'] },
  duration: 15,
  bg: { top: '#CDEBFF', bottom: '#F4FBFF', floor: '#BFDC8E', scenery: 'hills' },
  actors: [
    // 繩子兩頭的錨點（看不見）
    { id: 'knot', emoji: '⭐', x: OFF.x, y: GROUND, size: 10, hidden: true },
    { id: 'end', emoji: '⭐', x: YX - 10, y: GROUND, size: 10, hidden: true },
    // 3D 圖顏色淡，加一點飽和與對比，在淺色草地上才站得出來
    // 小青蛙和獅子是同一個 actor：底子寫獅子的 size（引擎只放大小角色，寫小青蛙的 size 會讓換成獅子後又被放大），開場縮成小青蛙
    { id: 'thing', emoji: 'prop:frog', x: FROG.out, y: yOf(LION.size), size: LION.size, flip: true },
    { id: 'bear', emoji: 'prop:bear', x: BEAR.out, y: yOf(BEAR.size), size: BEAR.size, flip: true },
    { id: 'yang', emoji: 'hero:yang/idle', x: YX, y: P, size: YS, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'thing', do: 'scaleTo', amount: FROG.size / LION.size, dur: 0.01 },
    // 登場：從右邊走進來，抬頭看字框
    { at: 0, actor: 'yang', do: 'enter', from: { x: 185, y: P }, dur: 0.55, ease: 'out' },
    { at: 0.6, actor: 'yang', do: 'tilt', amount: 8, dur: 0.35 },
    // 看到地上的繩子，彎腰撿起來
    { at: 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 0.95, actor: 'end', do: 'moveTo', to: { x: YX + HAND.reach.dx, y: P + HAND.reach.dy }, dur: 0.15, ease: 'out' },
    { at: 0.95, actor: 'knot', do: 'moveTo', to: OFF, dur: 0.15 },
    // 第 1 次：小青蛙一拉就出來，他閉眼得意
    ...g1.moves,
    { at: H1 - 0.25, actor: 'yang', do: 'moveTo', to: { x: YX + 4, y: P }, dur: 0.25, ease: 'out' },
    { at: H1 + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: H1 + 0.15, actor: 'yang', do: 'hop', amount: 2, dur: 0.25 },
    { at: H1 + 0.3, actor: 'thing', do: 'hop', amount: 2.5, dur: 0.25 },
    // 被拉回去，他也被扯回原位
    ...b1.moves,
    { at: 2.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 2.6, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, dur: 0.2, ease: 'in' },
    // 換成大熊（畫面外換）
    // 第 2 次：拉到發抖、滿頭汗，大熊才出來，他往後一屁股跌坐
    ...g2.moves,
    { at: H2 - 0.35, actor: 'yang', do: 'moveTo', to: { x: YX + 16, y: P }, dur: 0.4, ease: 'out', arc: 3 },
    { at: H2 + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: H2 + 0.35, actor: 'bear', do: 'tilt', amount: 6, dur: 0.3 },
    // 大熊被拉回去，他坐著被拖回原位
    ...b2.moves,
    { at: 4.7, actor: 'yang', do: 'moveTo', to: { x: YX + 4, y: P }, dur: 0.3, ease: 'in' },
    { at: 5.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 5.05, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, dur: 0.15 },
    // 小青蛙在畫面外換成獅子（同一個 actor，角色數不變）
    { at: 5.15, actor: 'thing', do: 'swap', emoji: 'prop:lion' },
    { at: 5.15, actor: 'thing', do: 'moveTo', to: { x: LION.out, y: yOf(LION.size) }, dur: 0.01 },
    { at: 5.17, actor: 'thing', do: 'scaleTo', amount: LION.size / FROG.size, dur: 0.01 },
    // 第 3 次前停一拍：繩子轟隆隆抖，他托著下巴看繩子、吞口水
    { at: 5.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: 5.2, actor: 'yang', do: 'shake', amount: 0.5, dur: 0.3 },
    ...g3.moves,
    // 拉出超大的獅子，他整個人往後飛、跌坐
    { at: H3 - 0.3, actor: 'yang', do: 'moveTo', to: { x: YX + 22, y: P }, dur: 0.45, ease: 'out', arc: 7 },
    { at: H3 + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    // 一出來就張大嘴「吼——」（同一個比例，同 x 換圖）
    { at: H3 + 0.15, actor: 'thing', do: 'swap', emoji: 'prop:lion-roar' },
    { at: H3 + 0.42, actor: 'thing', do: 'swap', emoji: 'prop:lion' },
    // 獅子被拉回去，繩子從他手上咻地溜走
    ...b3.moves,
    { at: 6.93, actor: 'end', do: 'moveTo', to: { x: YX + 22 + HAND.fall.dx, y: P + HAND.fall.dy }, dur: 0.01 },
    { at: 6.95, actor: 'end', do: 'moveTo', to: { x: -70, y: GROUND }, dur: 0.35, ease: 'in' },
    { at: 7.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 語詞那一刻：他走到左邊，大熊從右邊走進來，兩個手牽手跳一跳
    { at: 8.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: 8.7, actor: 'yang', do: 'moveTo', to: { x: WX, y: P }, dur: 0.5 },
    { at: 8.65, actor: 'bear', do: 'moveTo', to: { x: 200, y: yOf(BEAR.size) }, dur: 0.01 },
    { at: 8.65, actor: 'bear', do: 'flip' },
    { at: 8.7, actor: 'bear', do: 'moveTo', to: { x: BX, y: yOf(BEAR.size) }, dur: 0.5 },
    { at: 9.2, actor: 'yang', do: 'flip' },
    { at: 9.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: WORD + 0.1, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
    { at: WORD + 0.1, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    { at: WORD + 0.4, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
    { at: WORD + 0.4, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍（第 4 次）：繩子又伸進來了，他牽著大熊、得意地照樣一拉——
    { at: 9.75, actor: 'end', do: 'moveTo', to: { x: -60, y: GROUND }, dur: 0.01 },
    { at: 9.77, actor: 'end', do: 'moveTo', to: { x: WX - 22, y: GROUND }, dur: 0.25, ease: 'out' },
    { at: 9.95, actor: 'yang', do: 'flip' },
    { at: 9.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: H4 - 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    { at: H4 - 0.3, actor: 'yang', do: 'shake', amount: 0.4, dur: 0.3 },
    // 另一頭反過來一拉：兩個連成一串咻地被拉出畫面左邊
    { at: H4, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H4, actor: 'yang', do: 'moveTo', to: { x: -45, y: P }, dur: 0.5, ease: 'in' },
    { at: H4 + 0.08, actor: 'bear', do: 'moveTo', to: { x: -20, y: yOf(BEAR.size) }, dur: 0.5, ease: 'in', arc: 2 },
    { at: H4, actor: 'knot', do: 'moveTo', to: { x: -140, y: OFF.y }, dur: 0.6, ease: 'in' },
    // 問他：從左邊走回來、變大
    { at: 11.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 11.0, actor: 'yang', do: 'flip' },
    { at: 11.0, actor: 'yang', do: 'scaleTo', amount: 1.3, dur: 0.01 },
    { at: 11.0, actor: 'yang', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.35, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 12.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.1, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.6, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.6, actor: 'yang', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.76, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 第 1 次：扌從拉出來的小青蛙身上飛出來
    { at: H1 + 0.1, dur: 0.5, strokes: [0, 1, 2], from: 'thing', color: partColor('扌') },
    // 第 2、3 次：立從大熊、超大獅子身上飛出來
    { at: H2 + 0.1, dur: 0.5, strokes: [3, 4], from: 'bear', color: partColor('立') },
    { at: H3 + 0.1, dur: 0.5, strokes: [5, 6, 7], from: 'thing', color: partColor('立') },
  ],
  glyph: [
    { at: 7.4, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.7, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: 11.0, dur: 2.95, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 11.0, dur: 0.4, do: 'home' },
    { at: 13.6, dur: 0.3, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 繩子：地上 → 他手上 → 獅子拉走時溜走 → 又伸進來 → 被拉走
    loose(0, 1.1),
    rope(1.1, 1.2, 'reach'),
    rope(1.2, H1 + 0.15, 'pull'),
    rope(H1 + 0.15, 2.6, 'smug'),
    rope(2.6, H2 - 0.65 - 0.35, 'surprised'),
    rope(H2 - 1.0, H2, 'pull'),
    rope(H2, 5.05, 'fall'),
    rope(5.05, 5.15, 'surprised'),
    rope(5.15, H3 - 1.0, 'ponder'),
    rope(H3 - 1.0, H3, 'pull'),
    rope(H3, 6.95, 'fall'),
    loose(6.95, 7.3),
    loose(9.75, 9.95),
    rope(9.95, H4 - 0.4, 'smug'),
    rope(H4 - 0.4, H4, 'pull'),
    rope(H4, H4 + 0.55, 'surprised'),
    { at: 0.85, kind: 'pop', actor: 'yang', emoji: '❗', dx: -4, dur: 0.4, scale: 1.3 },
    ...g1.fx,
    ...g2.fx,
    { at: H2 - 0.6, kind: 'sweat', actor: 'yang', scale: 1.2 },
    // 第 3 次前停一拍：繩子抖、他傻眼
    { at: 5.3, kind: 'pop', actor: 'yang', emoji: '😳', dx: -4, dur: 0.45, scale: 1.4 },
    // 拉到腳底打滑：腳後面一直揚灰、滿頭大汗
    { at: H3 - 0.75, kind: 'puff', x: YX + 6, y: 73, dur: 0.35 },
    { at: H3 - 0.55, kind: 'puff', x: YX + 8, y: 73, dur: 0.35 },
    { at: H3 - 0.35, kind: 'puff', x: YX + 10, y: 73, dur: 0.35 },
    { at: H3 - 0.8, kind: 'sweat', actor: 'yang', scale: 1.4 },
    ...g3.fx,
    // 手拉手
    { at: WORD + 0.1, kind: 'burst', x: (WX + BX) / 2, y: 50, emoji: '💕', n: 6, dur: 0.6 },
    // 回馬槍：被拉走那一刻同一個 💥（在他手上）
    { at: H4, kind: 'burst', x: WX + HAND.pull.dx - 8, y: P + HAND.pull.dy, n: 1, dur: 0.4, scale: 2.6 },
    { at: H4 + 0.1, kind: 'puff', x: WX, y: 73, dur: 0.45 },
    { at: 13.6, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    // 第 3 次：手寫一個幾乎全景的取景，整隻獅子和他都留在畫面裡（自動取景會推近到他身上、把獅子切掉）
    { at: 5.2, dur: 0.4, do: 'zoom', amount: 1.03, to: { x: 80, y: 47 } },
    ...g3.camera,
    { at: 7.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: H4, dur: 0.4, do: 'punch', amount: 0.16, to: { x: WX, y: 58 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: 7.4, dur: 0.05, level: -0.2 },
    { at: 7.45, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '拉' },
    { at: 0.95, sfx: 'tap' },
    ...g1.cues,
    ...b1.cues,
    ...g2.cues,
    ...b2.cues,
    { at: 5.2, sfx: 'rumble' },
    ...g3.cues,
    ...b3.cues,
    { at: 7.55, say: '拉' },
    { at: WORD, say: '手拉手' },
    { at: 9.77, sfx: 'slide' },
    { at: H4, sfx: 'whoosh' },
    { at: H4, sfx: 'poof' },
    { at: H4 + 0.04, sfx: 'bonk' },
    { at: H4 + 0.08, sfx: 'rumble' },
    { at: H4 + 0.12, sfx: 'boing' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: 13.6, say: '拉' },
    { at: 13.65, sfx: 'cheer' },
  ],
}

export default clip
