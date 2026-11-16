import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 推（v2）：力氣最大的小恐龍什麼都想推。每次站在同一個地方、往後一蹲，雙手往前一頂「嘿——咻！」，
// 雙手頂在東西上（💥），東西就「咻——」地往右滑出畫面。東西一次比一次大、推得一次比一次吃力：
// 大紙箱一推就滑走，他閉眼得意（扌從紙箱上震出來）→ 大石頭頂住停一下才滑走，他累得喘氣（隹的左半）→
// 先停一拍：一隻大象走過來站在他面前，他抬頭傻眼、吞口水、退到最後面蓄力——雙手一頂，大象紋風不動，
// 他腳在地上打滑、滿頭大汗⋯⋯終於「咻——」大象整隻滑出畫面，他撲空趴在地上（隹的右半）。
// 語詞那一刻：一台大推車掉在他面前，他雙手一推，推到畫面正中間：推車！再把推車推出畫面。
// 回馬槍（第四次）：大象又走回來了。他得意地閉眼、照樣雙手一頂——這次大象只是往前輕輕一頂，
// 他整隻被推得「咻——」滑出畫面左邊，大象坐下來哈哈大笑。
// 最後畫面暗下來只剩「推」，小恐龍走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「推！」，然後退場只留字。
// 刻意不跟「瓜」（推西瓜、西瓜滾回來壓扁他）、「甲」（甲蟲用角把東西頂上天）、「象」（大象噴水）撞：
// 這支一定是雙手頂在東西上、往前推，東西貼著地面滑出去。
// 推、推、推車、這是什麼字？、推

/** 小恐龍（左邊，flip 朝右；前三次都站在同一個地方推） */
const RS = 34
const RY = 77 - 0.42 * RS
const RX = 42
/** push 那張雙手往前伸，手掌的位置（翻過來朝右） */
const HAND = { x: RX + 14.6, y: 56.5 }
/** 被推的東西：圖的左緣剛好貼著他的手 */
const BOX = 30
const BOXX = HAND.x + 0.46 * BOX
const ROCK = 38
const ROCKX = HAND.x + 0.46 * ROCK
const ELE = 52
const ELEX = HAND.x + 0.4 * ELE
const EY = 77 - 0.42 * ELE
const CART = 36
const CY = 77 - 0.42 * CART
/** 推出去的終點（畫面外右邊） */
const OUT = 220
/** 字框：比預設偏左一點，背後只有素色天空（右上有太陽） */
const FRAME = { x: 72, y: 21.5 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點：換成 push、往後退一步蹲低蓄力（停 wind 秒）→ 往前一衝，雙手頂在東西上：
 * 💥 在手上（一次比一次大）、鏡頭推一下＋震、同一個「碰」聲（一次多疊一個音）。
 * at 是手頂到東西那一刻，k 是第幾次（0～3），back 是蓄力退多遠。東西怎麼滑、他怎麼反應由呼叫的人寫。
 */
function shove(at: number, k: number, wind: number, back: number, x = RX): Gag {
  const moves: Move[] = [
    { at: at - wind, actor: 'rex', do: 'swap', emoji: 'hero:rex/push' },
    { at: at - wind, actor: 'rex', do: 'moveTo', to: { x: x - back, y: RY }, dur: wind * 0.6, ease: 'out' },
    { at: at - wind, actor: 'rex', do: 'squash', amount: 0.12 + 0.03 * k, dur: wind },
    { at: at - 0.12, actor: 'rex', do: 'moveTo', to: { x, y: RY }, dur: 0.12, ease: 'in' },
  ]
  const hand = { x: HAND.x + (x - RX), y: HAND.y }
  const fx: Fx[] = [
    { at, kind: 'burst', x: hand.x + 1, y: hand.y, n: 1, dur: 0.4, scale: 1.3 + 0.3 * Math.min(k, 2) },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.08 + 0.04 * Math.min(k, 2), to: { x: hand.x + 6, y: hand.y + 2 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'rumble' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues }
}

/** 東西被推得貼著地面往右滑出畫面：後面揚起一團灰、「咻」一聲 */
function slide(at: number, who: string, dur: number, y: number, ease: 'linear' | 'in' = 'in'): Gag {
  return {
    moves: [{ at, actor: who, do: 'moveTo', to: { x: OUT, y }, dur, ease }],
    fx: [{ at: at + 0.05, kind: 'puff', actor: who, dx: -10, dy: 12, dur: 0.5 }],
    camera: [],
    cues: [{ at, sfx: 'slide' }, { at: at + 0.05, sfx: 'whoosh' }],
  }
}

const H1 = 1.9, H2 = 3.55, H3 = 5.9, H4 = 9.8
/** 第三次：頂住大象打滑多久，大象才滑走 */
const STRAIN = 0.65
const g1 = shove(H1, 0, 0.4, 3)
const s1 = slide(H1 + 0.04, 'thing', 0.8, 77 - 0.42 * BOX, 'linear')
const g2 = shove(H2, 1, 0.5, 5)
const s2 = slide(H2 + 0.28, 'thing', 0.75, 77 - 0.42 * ROCK)
// 第三次：先停一拍，退到最後面、蓄力最久
const g3 = shove(H3, 2, 0.6, 8)
const s3 = slide(H3 + STRAIN, 'ele', 0.75, EY)
const g4 = shove(H4, 3, 0.35, 4)

const WORD = 8.4

const clip: Clip = {
  format: 2,
  char: '推',
  meta: { theme: '小恐龍什麼都想推', cast: '小恐龍＋大象＋紙箱／石頭／推車', gags: ['小恐龍每次雙手一頂把東西推得滑出畫面，東西一次比一次大、推得一次比一次吃力：紙箱、大石頭、推到腳打滑才推走的大象；回馬槍是大象走回來，他得意地再推，大象輕輕一頂就把他推得滑出畫面'] },
  duration: 15,
  bg: { top: '#D6EEFF', bottom: '#F3FAFF', floor: '#C6E09A', scenery: 'hills' },
  actors: [
    { id: 'thing', emoji: 'prop:box', x: 200, y: 77 - 0.42 * BOX, size: BOX },
    { id: 'ele', emoji: 'prop:elephant', x: 200, y: EY, size: ELE },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RY, size: RS, flip: true, hidden: true },
  ],
  moves: [
    // 登場：走進來、抬頭看字框
    { at: 0, actor: 'rex', do: 'enter', from: { x: -25, y: RY }, dur: 0.55, ease: 'out' },
    { at: 0.6, actor: 'rex', do: 'tilt', amount: -8, dur: 0.4 },
    // 一個大紙箱從右邊滑到他面前
    { at: 0.85, actor: 'thing', do: 'moveTo', to: { x: BOXX, y: 77 - 0.42 * BOX }, dur: 0.35, ease: 'out' },
    { at: 1.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    // 第 1 次：一推，紙箱咻地滑出去，他閉眼得意
    ...g1.moves,
    ...s1.moves,
    { at: H1 + 0.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: H1 + 0.35, actor: 'rex', do: 'hop', amount: 2, dur: 0.25 },
    // 換成大石頭：從右邊「轟隆隆」滑到他面前
    { at: 2.7, actor: 'thing', do: 'swap', emoji: 'prop:rock' },
    { at: 2.7, actor: 'thing', do: 'moveTo', to: { x: 200, y: 77 - 0.42 * ROCK }, dur: 0.01 },
    { at: 2.72, actor: 'thing', do: 'scaleTo', amount: ROCK / BOX, dur: 0.01 },
    { at: 2.72, actor: 'thing', do: 'moveTo', to: { x: ROCKX, y: 77 - 0.42 * ROCK }, dur: 0.33, ease: 'out' },
    { at: 2.9, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    // 第 2 次：更用力——石頭頂住停一下才滑走，他累得喘氣
    ...g2.moves,
    { at: H2, actor: 'thing', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: H2, actor: 'rex', do: 'shake', amount: 0.6, dur: 0.25 },
    ...s2.moves,
    { at: H2 + 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/tired' },
    // 第 3 次前停一拍：一隻大象走過來站在他面前，他抬頭傻眼、吞口水
    { at: 4.55, actor: 'ele', do: 'moveTo', to: { x: ELEX, y: EY }, dur: 0.5, ease: 'out' },
    { at: 5.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: 5.0, actor: 'rex', do: 'tilt', amount: -10, dur: 0.3 },
    ...g3.moves,
    // 雙手頂住，大象紋風不動：他腳在地上打滑（腳後面一直揚灰）、全身發抖
    { at: H3, actor: 'rex', do: 'shake', amount: 1.1, dur: STRAIN },
    ...s3.moves,
    // 終於推動了！大象滑走，他撲空趴在地上
    { at: H3 + STRAIN + 0.15, actor: 'rex', do: 'moveTo', to: { x: RX + 10, y: RY }, dur: 0.2, ease: 'out' },
    { at: H3 + STRAIN + 0.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/flat' },
    // 國字回到正中央，他爬起來看
    { at: 7.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: 7.15, actor: 'rex', do: 'moveTo', to: { x: 20, y: RY }, dur: 0.35 },
    // 語詞那一刻：一台大推車掉在他面前，他雙手推著走到畫面正中間：推車！再一路推出畫面右邊
    // 推車的把手朝左（靠他那一邊）
    { at: 7.65, actor: 'thing', do: 'swap', emoji: '🛒' },
    { at: 7.65, actor: 'thing', do: 'flip' },
    { at: 7.65, actor: 'thing', do: 'scaleTo', amount: CART / ROCK, dur: 0.01 },
    { at: 7.65, actor: 'thing', do: 'moveTo', to: { x: 43, y: -40 }, dur: 0.01 },
    { at: 7.95, actor: 'thing', do: 'moveTo', to: { x: 43, y: CY }, dur: 0.2, ease: 'in' },
    { at: 8.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/push' },
    { at: 8.2, actor: 'rex', do: 'moveTo', to: { x: 58, y: RY }, dur: 0.5 },
    { at: 8.2, actor: 'thing', do: 'moveTo', to: { x: 80, y: CY }, dur: 0.5 },
    { at: WORD + 0.3, actor: 'rex', do: 'squash', amount: 0.15, dur: 0.2 },
    // 再用力一推，推車咻地滑出畫面
    { at: 8.9, actor: 'rex', do: 'moveTo', to: { x: 62, y: RY }, dur: 0.1, ease: 'in' },
    { at: 8.95, actor: 'thing', do: 'moveTo', to: { x: OUT, y: CY }, dur: 0.45, ease: 'linear' },
    // 回馬槍（第 4 次）：大象又走回來了。他得意地閉眼，照樣雙手一頂——
    { at: 9.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: 9.1, actor: 'rex', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.3 },
    { at: 9.25, actor: 'ele', do: 'moveTo', to: { x: ELEX, y: EY }, dur: 0.45, ease: 'out' },
    ...g4.moves,
    // 大象只是往前輕輕一頂，他整隻被推得滑出畫面左邊
    { at: H4 + 0.15, actor: 'ele', do: 'moveTo', to: { x: ELEX - 6, y: EY }, dur: 0.12, ease: 'out' },
    { at: H4 + 0.15, actor: 'ele', do: 'tilt', amount: -12, dur: 0.35 },
    { at: H4 + 0.3, actor: 'ele', do: 'moveTo', to: { x: ELEX, y: EY }, dur: 0.2 },
    { at: H4 + 0.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: H4 + 0.2, actor: 'rex', do: 'moveTo', to: { x: -40, y: RY }, dur: 0.8, ease: 'linear' },
    // 大象坐下來哈哈大笑，再轉身走掉
    { at: H4 + 0.32, actor: 'ele', do: 'swap', emoji: 'prop:elephant-laugh' },
    { at: H4 + 0.45, actor: 'ele', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 10.5, actor: 'ele', do: 'swap', emoji: 'prop:elephant' },
    { at: 10.5, actor: 'ele', do: 'flip' },
    { at: 10.5, actor: 'ele', do: 'moveTo', to: { x: OUT, y: EY }, dur: 0.38, ease: 'in' },
    // 問他：從左邊走回來、變大
    { at: 10.95, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: 10.95, actor: 'rex', do: 'scaleTo', amount: 1.3, dur: 0.01 },
    { at: 10.95, actor: 'rex', do: 'moveTo', to: { x: 34, y: RY + 4 }, dur: 0.35, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 12.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: 12.0, actor: 'rex', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'rex', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: 13.5, actor: 'rex', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: 13.78, actor: 'rex', do: 'moveTo', to: { x: -45, y: RY + 4 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 1 次：扌從推的那雙手、紙箱上震出來
    { at: H1 + 0.1, dur: 0.5, strokes: [0, 1, 2], from: 'thing', color: partColor('扌') },
    // 第 2、3 次：隹從滑出去的大石頭、大象身上震出來
    { at: H2 + 0.35, dur: 0.5, strokes: [3, 4, 5], from: 'thing', color: partColor('隹') },
    { at: H3 + STRAIN + 0.05, dur: 0.5, strokes: [6, 7, 8, 9, 10], from: 'ele', color: partColor('隹') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: 0.55 },
    { at: 7.1, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.9, dur: 0.45, do: 'park', to: FRAME, amount: 0.55 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小恐龍
    { at: 10.9, dur: 3.05, do: 'ask', keep: ['rex'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.95, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 1.2, kind: 'pop', actor: 'rex', emoji: '❗', dx: 2, dur: 0.4, scale: 1.3 },
    ...g1.fx,
    ...s1.fx,
    ...g2.fx,
    ...s2.fx,
    { at: H2 + 0.5, kind: 'sweat', actor: 'rex' },
    // 第 3 次前停一拍：抬頭看大象
    { at: 5.0, kind: 'pop', actor: 'rex', emoji: '😳', dx: 2, dur: 0.45, scale: 1.4 },
    ...g3.fx,
    // 腳在地上打滑：腳後面一直揚灰，滿頭大汗
    { at: H3 + 0.1, kind: 'puff', x: RX - 12, y: 72, dur: 0.35 },
    { at: H3 + 0.3, kind: 'puff', x: RX - 14, y: 72, dur: 0.35 },
    { at: H3 + 0.5, kind: 'puff', x: RX - 16, y: 72, dur: 0.35 },
    { at: H3 + 0.15, kind: 'sweat', actor: 'rex', scale: 1.3 },
    ...s3.fx,
    { at: WORD + 0.3, kind: 'burst', x: 80, y: CY - 8, emoji: '✨', n: 8, dur: 0.5 },
    ...g4.fx,
    // 他被推走時腳下揚起的灰（留在原地，不跟著他出畫面）
    { at: H4 + 0.25, kind: 'puff', x: RX + 2, y: 72, dur: 0.45 },
    { at: 13.5, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: H3 + STRAIN, dur: 0.3, do: 'shake', amount: 1.6 },
    ...g4.camera,
  ],
  lights: [
    { at: 7.1, dur: 0.05, level: -0.2 },
    { at: 7.15, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '推' },
    { at: 0.85, sfx: 'slide' },
    ...g1.cues,
    ...s1.cues,
    { at: 2.72, sfx: 'rumble' },
    ...g2.cues,
    ...s2.cues,
    ...g3.cues,
    ...s3.cues,
    { at: 7.25, say: '推' },
    { at: 8.15, sfx: 'plop' },
    { at: WORD, say: '推車' },
    { at: 8.95, sfx: 'slide' },
    ...g4.cues,
    { at: H4 + 0.15, sfx: 'tap' },
    { at: H4 + 0.2, sfx: 'whoosh' },
    { at: H4 + 0.2, sfx: 'slide' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '推' },
    { at: 13.55, sfx: 'cheer' },
  ],
}

export default clip
