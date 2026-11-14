import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 給（v2）：楊捷睿熱心地把禮物「給」狗狗警長——每次雙手往前一送、警長伸手接下來、一打開，裡面的東西就彈出來撲到他臉上「碰」！
// 同一個笑點四次，只有結果越來越大：跳出一隻青蛙，警長嚇得跳好高（緞帶彈開變成「糸」）→ 噴出一顆大雪球，把他壓扁在地上（蓋子頂飛變成上面的「人一」）→
// 先停一拍（警長抱著禮物發抖、偷看）→ 彈簧拳套一拳把他打上天（他張大嘴叫出來的「口」）。楊捷睿每次都尷尬地冒汗，轉身再拿一個。
// 回馬槍：警長學乖了，比「等一下」，把禮物推回去「給你」——楊捷睿自己打開，跳出一隻超大的青蛙，一屁股把他坐扁。
// 最後畫面暗下來只剩「給」，楊捷睿爬起來、轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「給！」，然後退場只留字。
// 給、給、給你、這是什麼字？、給
const P = 66.9 // 楊捷睿、警長（size 24）站在地上的 y
/** 楊捷睿每次都站在同一個地方送（左邊，翻過來朝右） */
const YANG = 58
/** 警長每次都站在同一個地方接（右邊，朝左） */
const SH = 102
/** 禮物在楊捷睿手上、在警長手上的位置：兩個人中間就是「給」的那一下 */
const Y_HAND = { x: 69, y: 64 }
const S_HAND = { x: 91, y: 64 }
/** 警長的臉：每次東西都撲到這裡（💥 也在這裡） */
const FACE = { x: 95, y: 53 }
/** 站在地上的 y */
const fy = (size: number) => 77 - 0.42 * size
/** 被撲到以後傻眼停多久 */
const HOLD = 0.45
const GIFT = 13

/** 禮物裡彈出來的東西：同一個角色（item）每次換一個 emoji、放大，道具才不會超過兩個 */
type Item = { emoji: string; size: number }
const FROG: Item = { emoji: 'prop:frog-jump', size: 24 }
const SNOW: Item = { emoji: 'prop:snowball', size: 22 }
const GLOVE: Item = { emoji: '🥊', size: 20 }
const ITEMS = [FROG, SNOW, GLOVE]

/**
 * 「給你！」：楊捷睿舉起禮物（預備）→ 雙手往前一送、禮物飛到警長伸出來的手上（給的那一下，在畫面正中間）→
 * 楊捷睿開心等著、禮物在警長手上抖一抖（裡面有東西）→ 一打開，東西「噗」地彈出來撲到警長臉上：
 * 💥＋鏡頭推近＋震＋同一個音效，警長傻眼停 HOLD 秒。k 是第幾次（越後面抖得越兇、💥 越大），wait 是接下來以後多停幾拍（第三次）。
 */
function give(at: number, k: number, it: Item, wait = 0) {
  const recv = at + 0.3
  const open = recv + 0.35 + wait
  const hit = open + 0.12
  const moves: Move[] = [
    // 上一次彈出來的東西已經在畫面外：先藏起來、搬回禮物口、換成這一次的東西、放大到這一次的大小
    ...(k > 0 ? [
      { at: open - 0.05, actor: 'item', do: 'moveTo', to: S_HAND, dur: 0.01 },
      { at: open - 0.05, actor: 'item', do: 'swap', emoji: it.emoji },
      { at: open - 0.05, actor: 'item', do: 'scaleTo', amount: it.size / ITEMS[k - 1].size, dur: 0.01 },
    ] as Move[] : []),
    // 預備：舉起禮物
    { at: at - 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: at - 0.35, actor: 'gift', do: 'hop', amount: 3, dur: 0.3 },
    { at: at - 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    // 給！雙手往前一送，禮物飛到警長手上
    { at, actor: 'gift', do: 'moveTo', to: S_HAND, arc: 4, dur: 0.3 },
    { at, actor: 'yang', do: 'tilt', amount: 10, dur: 0.35 },
    { at: recv, actor: 'gift', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: recv + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 裡面有東西：禮物抖一抖
    { at: open - 0.3, actor: 'gift', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.28 },
    // 打開：蓋子掀開，東西彈出來撲到臉上
    { at: open, actor: 'gift', do: 'swap', emoji: 'prop:gift-open' },
    { at: open, actor: 'item', do: 'pop', dur: 0.08 },
    { at: open, actor: 'item', do: 'moveTo', to: FACE, dur: 0.12, ease: 'out' },
    { at: hit, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: hit, actor: 'sheriff', do: 'squash', amount: 0.2 + 0.1 * k, dur: 0.25 },
    { at: hit + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
  ]
  const fx: Fx[] = [
    // 💥 每次都在警長臉上同一個位置，一次比一次大
    { at: hit, kind: 'burst', x: FACE.x, y: FACE.y - 4, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
    { at: hit, kind: 'burst', x: FACE.x, y: FACE.y, emoji: '⭐', n: 5 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: 86, y: P - 10 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'whoosh' }, { at: open - 0.3, sfx: 'rumble' }, { at: open, sfx: 'poof' }, { at: hit, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues, open, hit, after: hit + HOLD }
}

/**
 * 楊捷睿尷尬地冒汗、轉身從背後再拿一個禮物（同一個 gift 角色：飛走的那個先藏起來，在他手上重新冒出來）。
 */
function regift(at: number): Move[] {
  return [
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/back' },
    { at: at + 0.22, actor: 'gift', do: 'vanish', dur: 0.01 },
    { at: at + 0.23, actor: 'gift', do: 'swap', emoji: 'prop:gift' },
    { at: at + 0.23, actor: 'gift', do: 'moveTo', to: Y_HAND, dur: 0.01 },
    { at: at + 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: at + 0.25, actor: 'gift', do: 'pop', dur: 0.15 },
  ]
}

const g1 = give(0.7, 0, FROG)
const g2 = give(3.05, 1, SNOW)
// 第 3 次前停一拍：警長抱著禮物發抖、偷看一眼
const g3 = give(5.35, 2, GLOVE, 0.4)
/** 字框填滿、國字到正中央 */
const HOME = 7.25
/** 回馬槍：警長把禮物推回去「給你」 */
const BACK = 8.85
/** 楊捷睿自己打開 */
const OPEN4 = 9.55
/** 超大青蛙坐扁他 */
const H4 = OPEN4 + 0.3
const BIG = 40 // 第 4 次的青蛙
/** 國字到正中央時，楊捷睿退到這裡讓字 */
const ASIDE = 28

const clip: Clip = {
  format: 2,
  char: '給',
  meta: { theme: '楊捷睿送禮物給警長', cast: '楊捷睿＋狗狗警長＋禮物盒＋盒子裡的東西', gags: ['楊捷睿每次熱心地把禮物給警長，警長一打開就有東西彈出來撲到臉上（青蛙嚇得跳好高、雪球壓扁、彈簧拳套打上天），一次比一次誇張；回馬槍是警長學乖了把禮物推回去「給你」，楊捷睿自己打開，被超大青蛙坐扁'] },
  duration: 15,
  bg: { top: '#FFE4EC', bottom: '#FFF7FA', floor: '#C9E4B4', scenery: 'hills' },
  actors: [
    // 狗狗警長朝左：面向楊捷睿和禮物
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: SH, y: P, size: 24 },
    // 楊捷睿的新圖朝左，翻過來朝右：面向警長
    { id: 'yang', emoji: 'hero:yang/idle', x: YANG, y: P, size: 24, flip: true, hidden: true },
    // 禮物裡彈出來的東西（青蛙 → 雪球 → 拳套 → 超大青蛙，同一個角色換 emoji）；青蛙朝左，翻過來撲向右邊的警長
    { id: 'item', emoji: FROG.emoji, x: S_HAND.x, y: S_HAND.y, size: FROG.size, hidden: true, flip: true, pivot: 'center' },
    { id: 'gift', emoji: 'prop:gift', x: Y_HAND.x, y: Y_HAND.y, size: GIFT, hidden: true, pivot: 'center' },
  ],
  moves: [
    // 楊捷睿捧著禮物跑進來
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0, actor: 'gift', do: 'enter', from: { x: -25 + Y_HAND.x - YANG, y: Y_HAND.y }, dur: 0.4, ease: 'out' },
    // 第 1 次：跳出一隻青蛙撲到臉上——警長嚇得跳好高，禮物被甩飛，青蛙跳走
    ...g1.moves,
    { at: g1.after, actor: 'sheriff', do: 'hop', amount: 14, dur: 0.55 },
    { at: g1.after, actor: 'item', do: 'moveTo', to: { x: 190, y: 40 }, arc: 10, dur: 0.5, ease: 'out' },
    { at: g1.after, actor: 'gift', do: 'moveTo', to: { x: 150, y: -25 }, dur: 0.45, ease: 'out' },
    { at: g1.after, actor: 'gift', do: 'spin', times: 2, dur: 0.45 },
    { at: g1.after + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
    ...regift(2.5),
    { at: 2.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 第 2 次：噴出一顆大雪球——撲到臉上，再把他壓扁在地上，滾走時把禮物一起帶走
    ...g2.moves,
    { at: g2.after, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    { at: g2.after, actor: 'item', do: 'moveTo', to: { x: SH + 2, y: 62 }, dur: 0.15, ease: 'in' },
    { at: g2.after + 0.15, actor: 'item', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: g2.after, actor: 'gift', do: 'moveTo', to: { x: S_HAND.x, y: fy(GIFT) }, dur: 0.15, ease: 'in' },
    { at: 4.85, actor: 'item', do: 'moveTo', to: { x: 200, y: fy(SNOW.size) }, dur: 0.5, ease: 'in' },
    { at: 4.85, actor: 'item', do: 'rotateTo', amount: 360, dur: 0.5, ease: 'in' },
    { at: 4.85, actor: 'gift', do: 'moveTo', to: { x: 200, y: fy(GIFT) }, dur: 0.5, ease: 'in' },
    { at: 4.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 4.95, actor: 'sheriff', do: 'shake', amount: 1.5, dur: 0.3 },
    ...regift(4.9),
    // 第 3 次前停一拍：警長接下來，抱著發抖、偷看一眼……
    ...g3.moves,
    { at: 5.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/scared' },
    { at: 5.75, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 6.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    // 彈簧拳套一拳：傻眼停一下，連禮物帶拳套一起被打上天
    { at: g3.after, actor: 'sheriff', do: 'moveTo', to: { x: SH + 10, y: -50 }, dur: 0.35, ease: 'out' },
    { at: g3.after, actor: 'sheriff', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    { at: g3.after, actor: 'item', do: 'moveTo', to: { x: SH + 2, y: -60 }, dur: 0.35, ease: 'out' },
    { at: g3.after, actor: 'gift', do: 'moveTo', to: { x: SH - 6, y: -50 }, dur: 0.38, ease: 'out' },
    // 字框填滿，國字到正中央：楊捷睿退到左邊抬頭看（讓字），尷尬地再拿一個，再走回原來的地方
    { at: 6.95, actor: 'yang', do: 'moveTo', to: { x: ASIDE, y: P }, dur: 0.3 },
    ...regift(7.5).map((m): Move => (m.to === Y_HAND ? { ...m, to: { x: Y_HAND.x - YANG + ASIDE, y: Y_HAND.y } } : m)),
    { at: 8.2, actor: 'yang', do: 'moveTo', to: { x: YANG, y: P }, dur: 0.3 },
    { at: 8.2, actor: 'gift', do: 'moveTo', to: Y_HAND, dur: 0.3 },
    // 警長從天上掉回原來的地方
    { at: 8.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 8.0, actor: 'sheriff', do: 'moveTo', to: { x: SH, y: -50 }, dur: 0.01 },
    { at: 8.05, actor: 'sheriff', do: 'moveTo', to: { x: SH, y: P }, dur: 0.3, ease: 'in' },
    // 回馬槍（第 4 次）：楊捷睿又要給——警長比「等一下」，把禮物推回去：給你！
    { at: 8.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 8.5, actor: 'gift', do: 'moveTo', to: { x: 80, y: 62 }, dur: 0.25 },
    { at: 8.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wait' },
    { at: 8.55, actor: 'sheriff', do: 'hop', amount: 3, dur: 0.2 },
    { at: BACK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/push' },
    { at: BACK, actor: 'gift', do: 'moveTo', to: Y_HAND, arc: 4, dur: 0.3 },
    { at: BACK + 0.3, actor: 'gift', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: BACK + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: BACK + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    // 楊捷睿：那我自己打開！——禮物抖得最兇
    { at: 9.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OPEN4 - 0.3, actor: 'gift', do: 'shake', amount: 2.2, dur: 0.28 },
    { at: OPEN4 - 0.05, actor: 'item', do: 'flip' },
    { at: OPEN4 - 0.05, actor: 'item', do: 'moveTo', to: Y_HAND, dur: 0.01 },
    { at: OPEN4 - 0.05, actor: 'item', do: 'swap', emoji: FROG.emoji },
    { at: OPEN4 - 0.05, actor: 'item', do: 'scaleTo', amount: BIG / GLOVE.size, dur: 0.01 },
    { at: OPEN4, actor: 'gift', do: 'swap', emoji: 'prop:gift-open' },
    { at: OPEN4, actor: 'item', do: 'pop', dur: 0.1 },
    { at: OPEN4, actor: 'item', do: 'moveTo', to: { x: YANG - 2, y: fy(BIG) + 4 }, arc: 4, dur: 0.3, ease: 'in' },
    { at: OPEN4 + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 一屁股坐扁
    { at: H4, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: H4, actor: 'yang', do: 'squash', amount: 0.5, dur: 0.5 },
    { at: H4, actor: 'item', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: H4, actor: 'gift', do: 'moveTo', to: { x: 30, y: fy(GIFT) }, arc: 6, dur: 0.3, ease: 'out' },
    { at: H4 + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/giggle' },
    // 青蛙跳走（把禮物踢出去），警長笑著跑掉
    { at: 10.35, actor: 'item', do: 'moveTo', to: { x: -50, y: 30 }, arc: 10, dur: 0.4, ease: 'in' },
    { at: 10.35, actor: 'gift', do: 'moveTo', to: { x: -30, y: fy(GIFT) }, dur: 0.3, ease: 'in' },
    { at: 10.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: 10.3, actor: 'sheriff', do: 'flip' },
    { at: 10.35, actor: 'sheriff', do: 'moveTo', to: { x: 200, y: P }, dur: 0.4, ease: 'in' },
    // 問他：楊捷睿爬起來走到左前方、變大，轉向觀眾
    { at: 10.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 10.6, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.35 },
    { at: 10.65, actor: 'yang', do: 'scaleTo', amount: 1.55, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 11.95, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.45, actor: 'yang', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.72, actor: 'yang', do: 'flip' },
    { at: 13.75, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：禮物一打開，緞帶（糸）彈開飛上去
    { at: g1.open + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'gift', color: partColor('糸') },
    // 第 2 次：蓋子（亼，人＋一）被雪球頂飛
    { at: g2.open + 0.05, dur: 0.55, strokes: [6, 7, 8], from: 'gift', color: partColor('亼') },
    // 第 3 次：警長被打上天，張大嘴叫出來（口）
    { at: g3.hit + 0.05, dur: 0.5, strokes: [9, 10, 11], from: 'sheriff', color: partColor('口') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.1, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: 10.5, dur: 3.45, do: 'ask', keep: ['yang'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.55, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    { at: g1.after + 0.15, kind: 'sweat', actor: 'yang' },
    ...g2.fx,
    { at: g2.after + 0.15, kind: 'burst', x: SH, y: 62, emoji: '❄️', n: 6, dur: 0.45 },
    { at: g2.after + 0.2, kind: 'sweat', actor: 'yang' },
    // 第 3 次前停一拍：警長看一眼禮物
    { at: 5.75, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: 2, dur: 0.5, scale: 1.3 },
    { at: 5.8, kind: 'sweat', actor: 'sheriff' },
    // 彈簧：從禮物拉到拳套
    { at: g3.open, kind: 'line', actor: 'gift', target: 'item', color: '#5C6170', width: 2.6, dur: g3.after - g3.open + 0.3 },
    ...g3.fx,
    { at: g3.after + 0.1, kind: 'sweat', actor: 'yang' },
    // 回馬槍
    { at: H4, kind: 'burst', x: YANG, y: 58, n: 1, dur: 0.45, scale: 3 },
    { at: H4, kind: 'burst', x: YANG, y: 62, emoji: '⭐', n: 10, dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    // 第 3 次：自己固定鏡位（全景），警長被打上天才看得到
    { at: 5.9, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...g3.camera,
    { at: 7.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.2, to: { x: YANG + 6, y: P - 10 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '給' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.1, say: '給' },
    { at: 8.35, sfx: 'plop' },
    { at: BACK, say: '給你' },
    { at: OPEN4 - 0.3, sfx: 'rumble' },
    { at: OPEN4, sfx: 'poof' },
    { at: H4, sfx: 'bonk' },
    { at: H4 + 0.04, sfx: 'boing' },
    { at: H4 + 0.08, sfx: 'crack' },
    { at: H4 + 0.12, sfx: 'plop' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '給' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
