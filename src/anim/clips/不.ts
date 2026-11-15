import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 不（v2）：小恐龍什麼都說「不！」。一板一眼的小機器人每次把一樣東西舉過頭端過來，小恐龍叉腰、頭用力一甩，
// 手一推大喊「不！」——一個大紅叉「啪」地彈出來，那樣東西就被這一聲「不」震飛，一次比一次大、飛得越遠：
// 牙刷（刷牙？不！牙刷轉著飛出畫面，機器人往後一退；橫從紅叉上飛出來）→ 浴缸（洗澡？不！浴缸飛走，機器人一屁股跌坐滑到畫面邊；撇）→
// 先停一拍：機器人吃力地扛來一張大床（睡覺？），偷看他一眼、冒汗，小恐龍深吸一大口氣……不！床連機器人一起飛上天（豎和點）。
// 語詞那一刻小恐龍站到前面，對著機器人搖頭、大紅叉：「不對」。機器人想一想——💡 跑去端來一個大蛋糕。
// 回馬槍（第四次）：小恐龍閉著眼睛照樣叉腰一甩頭「不！」——蛋糕飛走了，他才張開眼睛：那是蛋糕！傻眼，拔腿追出去。
// 最後畫面暗下來只剩「不」，小恐龍跑回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「不！」，然後退場只留字。
// 刻意不跟「飯」（餵飯不張嘴、湯匙撞臉）撞：這支端來的前三樣都不是吃的，「不」是一聲把東西震飛。
// 不、不、不、不、不對、不、這是什麼字？、不
// （「不要」「不會」的 要、會 是多音字表裡擋掉的，語詞用「不對」）

/** 小恐龍（右邊，圖朝左，剛好面向機器人） */
const RS = 40
const RX = 118
const RY = 77 - 0.42 * RS
/** 小機器人（左邊，flip 朝右；每次都站在同一個地方把東西舉過頭） */
const BS = 26
const BX = 44
const BY = 77 - 0.42 * BS
/** 機器人舉過頭的東西：底部貼著他舉高的手 */
const HANDS = BY - 0.5 * BS
const itemY = (size: number) => HANDS - 0.36 * size
/** 大紅叉彈出來的地方（兩個人中間、字框下面），筆畫也從這裡飛上去 */
const XM = { x: 80, y: 58 }
/** 每一下：叉腰甩頭（預備）多久 */
const PREP = 0.5

/**
 * 「不！」：小恐龍叉腰、頭用力一甩（預備）→ 手一推大喊「不！」，大紅叉啪地彈出來（一次比一次大），
 * 機器人舉著的東西 💥 被震飛（鏡頭推近＋震＋同一個音效，一次多疊一個音）。k 是第幾次，item 是被震飛的東西。
 * 小恐龍的姿勢由 prep 決定：前三次是叉腰生氣（angry），第四次是閉眼得意（smug，沒在看）。
 */
function no(at: number, k: number, item: string, itemPos: { x: number; y: number }, fly: { x: number; y: number }, prep = 'angry', delay = 0.12) {
  const moves: Move[] = [
    { at: at - PREP, actor: 'rex', do: 'swap', emoji: `hero:rex/${prep}` },
    // 頭用力一甩（左右甩兩下）
    { at: at - PREP + 0.12, actor: 'rex', do: 'tilt', amount: -9, dur: 0.16 },
    { at: at - PREP + 0.28, actor: 'rex', do: 'tilt', amount: 9, dur: 0.16 },
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/wait' },
    { at, actor: 'rex', do: 'hop', amount: 1.5 + 0.8 * k, dur: 0.25 },
    // 東西被震飛（停一下下才飛，看得到 💥）
    { at: at + delay, actor: item, do: 'moveTo', to: fly, arc: 14 + 6 * k, dur: 0.7 + 0.05 * k, ease: 'out' },
    { at: at + delay, actor: item, do: 'spin', times: -(2 + k), dur: 0.7 + 0.05 * k, pivot: 'center' },
  ]
  const fx: Fx[] = [
    // 大紅叉：每次都在同一個地方，一次比一次大
    { at, kind: 'burst', x: XM.x, y: XM.y, n: 1, emoji: '❌', dur: 0.6, scale: 2.2 + 0.4 * k },
    { at, kind: 'burst', x: itemPos.x, y: itemPos.y, n: 1, dur: 0.35, scale: 1.3 + 0.35 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.06 + 0.04 * k, to: { x: 80, y: 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, say: '不' }, { at: at + 0.05, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.08, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

const SIZES = { brush: 18, tub: 28, bed: 34, cake: 24 }
const BRUSH = { x: BX, y: itemY(SIZES.brush) }
const TUB = { x: BX, y: itemY(SIZES.tub) }
const BED = { x: BX, y: itemY(SIZES.bed) }
const CAKE = { x: BX, y: itemY(SIZES.cake) }

/** 第 3 次：機器人傻眼、床被頂住停多久才一起飛 */
const FLY3 = 0.4
const H1 = 1.3, H2 = 3.4, H3 = 6.1, H4 = 10.0
const n1 = no(H1, 0, 'item', BRUSH, { x: -25, y: 22 })
const n2 = no(H2, 1, 'item', TUB, { x: -35, y: 12 })
// 第 3 次：床跟機器人一起飛上天（床停一下、等機器人傻眼完一起飛）
const n3 = no(H3, 2, 'item', BED, { x: -45, y: -30 }, 'angry', FLY3)
// 回馬槍：閉著眼睛照樣「不！」，蛋糕飛走
const n4 = no(H4, 3, 'item', CAKE, { x: -40, y: 8 }, 'smug')

/** 字框填滿、放大到正中央；讓位；語詞；問他；回答 */
const HOME = 6.95
const PARK = 7.85
const WORD = 8.4
const ASK = 10.95
const ANSWER = 13.65

/** 機器人從左邊畫面外端著東西走進來（東西跟著他走）；東西在畫面外換成下一樣、換大小（scaleTo 會累乘） */
function carryIn(at: number, emoji: string, scale: number, pos: { x: number; y: number }, dur: number): Move[] {
  const item = 'item'
  return [
    { at, actor: item, do: 'swap', emoji },
    { at, actor: item, do: 'scaleTo', amount: scale, dur: 0.01 },
    { at, actor: 'bot', do: 'moveTo', to: { x: -22, y: BY }, dur: 0.01 },
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
    { at: at + 0.02, actor: 'bot', do: 'moveTo', to: { x: BX, y: BY }, dur },
    { at, actor: item, do: 'moveTo', to: { x: -22, y: pos.y }, dur: 0.01 },
    { at: at + 0.02, actor: item, do: 'moveTo', to: pos, dur },
  ]
}

const clip: Clip = {
  format: 2,
  char: '不',
  meta: { theme: '什麼都說不的小恐龍', cast: '小恐龍＋小機器人＋牙刷／浴缸／床＋蛋糕', gags: ['機器人每次端一樣東西來，小恐龍叉腰甩頭大喊「不！」，大紅叉彈出來、東西被震飛，牙刷→浴缸→床連機器人一起飛上天；回馬槍是端來蛋糕，他閉著眼照樣「不！」，蛋糕飛走才發現，傻眼追出去'] },
  duration: 15,
  bg: { top: '#FFE8D6', bottom: '#FFF6EE', floor: '#C9A27A', scenery: 'room' },
  actors: [
    { id: 'bot', emoji: 'hero:bot/lift', x: BX, y: BY, size: BS, flip: true, hidden: true },
    // 端來的東西只有一個角色：每次在畫面外換成下一樣（牙刷 → 浴缸 → 床 → 蛋糕），換大小
    { id: 'item', emoji: '🪥', x: BRUSH.x, y: BRUSH.y, size: SIZES.brush, hidden: true, float: true },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RY, size: RS },
  ],
  moves: [
    // 開場：機器人舉著牙刷走過來（刷牙囉）
    { at: 0, actor: 'bot', do: 'enter', from: { x: -22, y: BY }, dur: 0.6 },
    { at: 0, actor: 'item', do: 'enter', from: { x: -22, y: BRUSH.y }, dur: 0.6 },
    { at: 0.65, actor: 'bot', do: 'hop', amount: 2, dur: 0.22 },
    { at: 0.65, actor: 'item', do: 'hop', amount: 2, dur: 0.22 },
    // 第 1 次：不！牙刷飛走，機器人往後一退
    ...n1.moves,
    { at: H1, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: H1 + 0.1, actor: 'bot', do: 'moveTo', to: { x: BX - 8, y: BY }, dur: 0.25, ease: 'out' },
    { at: H1 + 0.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    // 轉身去拿下一樣
    { at: 2.0, actor: 'bot', do: 'flip' },
    { at: 2.0, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: 2.05, actor: 'bot', do: 'moveTo', to: { x: -22, y: BY }, dur: 0.4, ease: 'in' },
    { at: 2.5, actor: 'bot', do: 'flip' },
    { at: 2.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 第 2 次：扛著浴缸（洗澡囉）——不！浴缸飛走，機器人一屁股跌坐、滑到畫面邊
    ...carryIn(2.5, '🛁', SIZES.tub / SIZES.brush, TUB, 0.5),
    { at: 3.05, actor: 'bot', do: 'hop', amount: 2, dur: 0.22 },
    { at: 3.05, actor: 'item', do: 'hop', amount: 2, dur: 0.22 },
    ...n2.moves,
    { at: H2, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: H2 + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall' },
    { at: H2 + 0.1, actor: 'bot', do: 'moveTo', to: { x: 16, y: BY }, dur: 0.35, ease: 'out' },
    { at: H2 + 0.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: 4.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: 4.05, actor: 'bot', do: 'flip' },
    { at: 4.1, actor: 'bot', do: 'moveTo', to: { x: -22, y: BY }, dur: 0.25, ease: 'in' },
    { at: 4.45, actor: 'bot', do: 'flip' },
    { at: 4.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 第 3 次：吃力地扛來一張大床（睡覺囉）——先停一拍：偷看一眼、冒汗；小恐龍深吸一大口氣……
    ...carryIn(4.45, '🛏️', SIZES.bed / SIZES.tub, BED, 0.55),
    { at: 5.05, actor: 'bot', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 5.05, actor: 'item', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: H3 - PREP - 0.05, actor: 'rex', do: 'squash', amount: -0.12, dur: 0.5 },
    ...n3.moves,
    { at: H3, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    // 床被頂住停一下，跟傻眼的機器人一起飛上天
    { at: H3 + FLY3, actor: 'bot', do: 'moveTo', to: { x: -45, y: -10 }, arc: 26, dur: 0.6, ease: 'out' },
    { at: H3 + FLY3, actor: 'bot', do: 'spin', times: -3, dur: 0.6, pivot: 'center' },
    { at: H3 + 0.65, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    // 字框填滿：小恐龍往右讓一步，國字放大到正中央
    { at: 6.7, actor: 'rex', do: 'moveTo', to: { x: 138, y: RY }, dur: 0.25 },
    // 語詞那一刻：小恐龍站到前面，對著機器人搖頭——不對！
    { at: PARK + 0.15, actor: 'rex', do: 'moveTo', to: { x: 98, y: RY }, dur: 0.3 },
    { at: PARK - 0.1, actor: 'bot', do: 'moveTo', to: { x: -22, y: BY }, dur: 0.01 },
    { at: PARK - 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: PARK - 0.05, actor: 'bot', do: 'moveTo', to: { x: 30, y: BY }, dur: 0.4 },
    { at: WORD - 0.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/angry' },
    { at: WORD - 0.25, actor: 'rex', do: 'tilt', amount: -9, dur: 0.16 },
    { at: WORD - 0.1, actor: 'rex', do: 'tilt', amount: 9, dur: 0.16 },
    { at: WORD, actor: 'rex', do: 'swap', emoji: 'hero:rex/wait' },
    // 機器人想一想——💡 跑去端蛋糕
    { at: WORD + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/ponder' },
    { at: 8.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/know' },
    { at: 8.95, actor: 'bot', do: 'hop', amount: 3, dur: 0.2 },
    { at: 9.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    // 回到前三次站的地方（同一個站位）
    { at: 9.05, actor: 'rex', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.35 },
    { at: 9.2, actor: 'bot', do: 'flip' },
    { at: 9.2, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: 9.22, actor: 'bot', do: 'moveTo', to: { x: -22, y: BY }, dur: 0.2, ease: 'in' },
    { at: 9.45, actor: 'bot', do: 'flip' },
    ...carryIn(9.45, 'prop:cake', SIZES.cake / SIZES.bed, CAKE, 0.35),
    // 回馬槍：閉著眼睛照樣甩頭「不！」——蛋糕飛走，張開眼：那是蛋糕！
    ...n4.moves,
    { at: H4, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: H4 + 0.1, actor: 'bot', do: 'spin', times: -2, dur: 0.4, pivot: 'center' },
    { at: H4 + 0.12, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: H4 + 0.12, actor: 'rex', do: 'hop', amount: 4, dur: 0.25 },
    // 拔腿追出去（機器人也跟著跑）
    { at: H4 + 0.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: H4 + 0.62, actor: 'rex', do: 'moveTo', to: { x: -40, y: RY }, dur: 0.33, ease: 'in', anticipate: 4 },
    { at: H4 + 0.6, actor: 'bot', do: 'flip' },
    { at: H4 + 0.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: H4 + 0.7, actor: 'bot', do: 'moveTo', to: { x: -30, y: BY }, dur: 0.22, ease: 'in' },
    // 問他：小恐龍跑回來左前方、變大，面向右邊的國字
    { at: ASK, actor: 'rex', do: 'flip' },
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
    { at: ASK, actor: 'rex', do: 'scaleTo', amount: 1.1, dur: 0.01 },
    { at: ASK + 0.02, actor: 'rex', do: 'moveTo', to: { x: 34, y: RY - 2 }, dur: 0.35, ease: 'out' },
    { at: ASK + 0.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: 12.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: 12.25, actor: 'rex', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, actor: 'rex', do: 'hop', amount: 6, dur: 0.22 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.12, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: ANSWER + 0.12, actor: 'rex', do: 'moveTo', to: { x: -45, y: RY - 2 }, dur: 0.18, ease: 'in' },
  ],
  builds: [
    // 每一聲「不！」的大紅叉上飛出一塊：橫 → 撇 → 豎和點
    { at: H1 + 0.15, dur: 0.5, strokes: [0], from: XM, color: partColor('不') },
    { at: H2 + 0.15, dur: 0.5, strokes: [1], from: XM, color: partColor('不') },
    { at: H3 + 0.15, dur: 0.55, strokes: [2, 3], from: XM, color: partColor('不') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['rex'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...n1.fx,
    { at: H1 + 0.4, kind: 'sweat', actor: 'bot' },
    ...n2.fx,
    { at: H2 + 0.4, kind: 'dizzy', actor: 'bot', dur: 0.3 },
    // 第 3 次前停一拍：機器人偷看一眼、冒汗
    { at: 5.15, kind: 'pop', actor: 'bot', emoji: '👀', dx: 4, dy: -8, dur: 0.5, scale: 1.2 },
    { at: 5.4, kind: 'sweat', actor: 'bot', dy: -8 },
    ...n3.fx,
    // 語詞：大紅叉最大的一次（不吵、不震飛東西）
    { at: WORD, kind: 'burst', x: 60, y: 58, n: 1, emoji: '❌', dur: 0.7, scale: 3.2 },
    { at: WORD + 0.35, kind: 'pop', actor: 'bot', emoji: '❓', dx: 3, dur: 0.4, scale: 1.2 },
    { at: 8.95, kind: 'pop', actor: 'bot', emoji: '💡', dx: 3, dur: 0.4, scale: 1.3 },
    ...n4.fx,
    { at: H4 + 0.15, kind: 'pop', actor: 'rex', emoji: '❗', dx: -4, dur: 0.45, scale: 1.4 },
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 兩個人都要一直在畫面裡：國字拼好前不讓自動取景推近到只剩一個
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    ...n1.camera,
    ...n2.camera,
    ...n3.camera,
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    ...n4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.25 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, sfx: 'tap' },
    ...n1.cues,
    { at: 3.05, sfx: 'tap' },
    ...n2.cues,
    { at: H2 + 0.45, sfx: 'slide' },
    { at: 5.05, sfx: 'tap' },
    { at: 5.15, sfx: 'blip' },
    ...n3.cues,
    { at: HOME + 0.1, say: '不' },
    { at: WORD, say: '不對' },
    { at: 8.95, sfx: 'blip' },
    ...n4.cues,
    { at: H4 + 0.6, sfx: 'whoosh' },
    { at: ASK + 0.15, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '不' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
