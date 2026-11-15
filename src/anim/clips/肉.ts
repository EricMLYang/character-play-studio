import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 肉（v2）：畫面中間擺著一大塊帶骨頭的烤肉，貪吃的浣熊花生每次「啊——嗚！」一大口咬下去，肉就少一大截（碎肉噴出來），
// 他「咕嘟」吞下去，肚子就「啵」地脹大一圈：一大塊 → 一半（冂）→ 一小塊（上面的人）→ 先停一拍（打個嗝、托下巴看剩下的肉⋯⋯還是忍不住）
// 一口吃光光，圓滾滾地坐下來（下面的人）。
// 回馬槍：天上又掉下一整塊大牛肉，他照樣「啊——嗚！」——一口把肉全部咬光，只剩骨頭，「喀！」牙齒咬在骨頭上，整個人麻得發抖，骨頭好好的、彈走了。
// 最後畫面暗下來只剩「肉」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「肉！」，然後退場只留字。
// 肉、肉、牛肉、這是什麼字？、肉
const RS = 32 // 花生的 size
const P = 77 - 0.42 * RS // 花生站在地上的 y
/** 花生每次都站在同一個地方（左邊，翻過來朝右看著肉） */
const RX = 46
/** 肉擺在畫面中間 */
const MS = 50
const MX = 92
const MY = 77 - 0.42 * MS
/** 每一口之前肉的大小（以底部中間為準縮小）：大 → 中 → 小 */
const SIZE = [1, 0.66, 0.4]
/** 肚子一次比一次圓：整個人大一點（scaleTo）、再撐寬一點（stretchTo），都會累乘；每一口寬 1.3 倍、高多 4% */
const GROW = 1.16, WID = 1.12
const SX = (k: number) => (GROW * WID) ** k
/** 咬下去那一點：肉的左邊（肉身，不是骨頭）；s 是肉當下的大小 */
const bitePt = (s: number) => ({ x: MX - 0.27 * MS * s, y: 74 - 0.3 * MS * s })
/** 咬的時候花生站的地方：嘴巴（朝右，在身體中間偏前一點）對到咬的那一點 */
const biteX = (s: number, k: number) => bitePt(s).x - 0.1 * RS * SX(k)
/** 吞下去以後滿足的臉停多久 */
const HOLD = 0.5

/**
 * 「啊——嗚！」：張大嘴往後仰（預備，看得到）→ 撲上去一口咬下去（同一刻 💥＋碎肉噴出來＋鏡頭推近＋震＋同一個音效）→
 * 肉縮小一截 → 退回原地「咕嘟」吞下去，肚子「啵」地脹大一圈，滿足的臉停 HOLD 秒。k 是第幾口（越後面越大）。
 * 第 3 口把剩下的一小塊整個咬光（肉不見）；第 4 口（bone）把一整塊新的肉一口咬光，只剩骨頭——「喀！」咬到骨頭。
 */
function chomp(at: number, k: number, opt: { s?: number; next?: number; last?: boolean; bone?: boolean } = {}) {
  const s = opt.s ?? SIZE[k]
  const b = bitePt(s)
  const bx = biteX(s, k)
  const moves: Move[] = [
    // 預備：張大嘴往後仰
    { at: at - 0.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/eat' },
    { at: at - 0.55, actor: 'raccoon', do: 'rotateTo', amount: 22, dur: 0.25, ease: 'out' },
    { at: at - 0.55, actor: 'raccoon', do: 'squash', amount: -0.12, dur: 0.3 },
    // 撲上去，往前一口
    { at: at - 0.2, actor: 'raccoon', do: 'moveTo', to: { x: bx, y: P }, dur: 0.2, ease: 'in', anticipate: 3 },
    { at: at - 0.2, actor: 'raccoon', do: 'rotateTo', amount: -34, dur: 0.2, ease: 'in' },
    // 咬下去那一下：肉一抖
    { at, actor: 'meat', do: 'shake', amount: 1 + 0.3 * k, dur: 0.25 },
  ]
  if (opt.bone) {
    // 一口咬光，只剩骨頭——喀！咬在骨頭上：咬著不放、牙齒麻得整個人抖，骨頭好好的
    moves.push(
      { at, actor: 'meat', do: 'swap', emoji: 'prop:bone' },
      { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
      { at: at + 0.05, actor: 'raccoon', do: 'shake', amount: 2.2, dur: 0.55 },
      { at: at + 0.6, actor: 'raccoon', do: 'rotateTo', amount: 12, dur: 0.2 },
      { at: at + 0.6, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: P }, dur: 0.3, ease: 'out' },
      { at: at + 0.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    )
  } else {
    moves.push(
      // 退回原地（身體回正）
      { at: at + 0.12, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: P }, dur: 0.25, ease: 'out' },
      { at: at + 0.12, actor: 'raccoon', do: 'rotateTo', amount: 12, dur: 0.25 },
      // 咕嘟吞下去：肚子啵地脹大一圈，滿足地閉眼
      { at: at + 0.4, actor: 'raccoon', do: 'stretchTo', amount: WID, dur: 0.3, ease: 'back' },
      { at: at + 0.4, actor: 'raccoon', do: 'scaleTo', amount: GROW, dur: 0.3, ease: 'back' },
      { at: at + 0.4, actor: 'raccoon', do: 'swap', emoji: opt.last ? 'hero:raccoon/full' : 'hero:raccoon/smug' },
    )
    if (opt.last) {
      // 最後一小塊整個被咬進嘴裡
      moves.push(
        { at, actor: 'meat', do: 'moveTo', to: { x: b.x - 4, y: MY - 2 }, dur: 0.12, ease: 'in' },
        { at, actor: 'meat', do: 'scaleTo', amount: 0.3, dur: 0.12, ease: 'in' },
        { at: at + 0.1, actor: 'meat', do: 'vanish', dur: 0.06 },
      )
    } else {
      moves.push({ at, actor: 'meat', do: 'scaleTo', amount: (opt.next ?? SIZE[k + 1]) / s, dur: 0.12, ease: 'out' })
    }
  }
  const fx: Fx[] = [
    // 💥 在咬的地方，一次比一次大；碎肉從咬的地方噴出來
    // 第 4 口：整塊肉被咬光，碎肉從肉那邊（骨頭上）噴開，💥 往右偏，不蓋住他麻掉的臉
    { at, kind: 'burst', x: b.x + (opt.bone ? 12 : 4), y: b.y - 6, n: 1, dur: 0.35, scale: 1.3 + 0.3 * k },
    { at, kind: 'burst', x: opt.bone ? MX + 8 : b.x + 2, y: b.y - 2, emoji: 'prop:meat', n: 5 + 2 * k, dur: 0.5, scale: opt.bone ? 1.6 : 1.5 + 0.2 * k },
  ]
  if (!opt.bone) fx.push({ at: at + 0.42, kind: 'burst', x: RX + 12 * SX(k + 1), y: P - 2, emoji: '✨', n: 5, dur: 0.4 })
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: b.x - 6, y: P - 6 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.4 * k },
  ]
  // 同一個音效（啊嗚——咬下去），一次比一次多疊一個；咕嘟、啵
  const cues: Cue[] = [{ at, sfx: 'crack' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'tap' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'plop' })
  if (opt.bone) cues.push({ at: at + 0.02, sfx: 'clink' }, { at: at + 0.1, sfx: 'bonk' })
  else cues.push({ at: at + 0.4, sfx: 'gulp' }, { at: at + 0.45, sfx: 'boing' })
  return { moves, fx, camera, cues, b }
}

const B1 = 1.9, B2 = 3.55, B3 = 5.85, B4 = 9.75
const c1 = chomp(B1, 0)
const c2 = chomp(B2, 1)
const c3 = chomp(B3, 2, { last: true })
const c4 = chomp(B4, 3, { s: 1, bone: true })
/** 第 3 口吃光以後，圓滾滾的他往後滾到左邊（國字要到正中央） */
const ROLL = B3 + 0.4 + HOLD + 0.05
const SIDE = 34
const HOME = ROLL + 0.45
const PARK = HOME + 1.0
/** 語詞那一刻：一整塊新的大牛肉掉下來 */
const DROP = PARK + 0.05
const LAND = DROP + 0.3

const clip: Clip = {
  format: 2,
  char: '肉',
  meta: { theme: '浣熊花生大口吃烤肉', cast: '浣熊花生＋一大塊帶骨烤肉（骨頭）', gags: ['貪吃的花生每次啊嗚一大口咬下去，肉就少一大截、他咕嘟吞下去肚子就脹大一圈（大塊→一半→一小塊→吃光，第三口前打個嗝停一拍），最後圓滾滾地坐下來；回馬槍是又掉下一整塊大牛肉，他照樣啊嗚一口，肉全咬光只剩骨頭，喀！咬在骨頭上牙齒麻得發抖，骨頭好好的彈走了'] },
  duration: 15,
  bg: { top: '#FFE1C7', bottom: '#FFF6EA', floor: '#D9B48A', scenery: 'room' },
  actors: [
    { id: 'meat', emoji: 'prop:meat', x: MX, y: MY, size: MS },
    // 花生的圖朝左，翻過來朝右：面向右邊的肉
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: RX, y: P, size: RS, hidden: true, flip: true },
  ],
  moves: [
    // 花生走進來，看到一大塊肉：眼睛發亮流口水
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -20, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/drool' },
    { at: 0.6, actor: 'meat', do: 'hop', amount: 2, dur: 0.25 },
    // 第 1 口：大塊 → 一半
    ...c1.moves,
    { at: B1 + 0.4 + HOLD, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/drool' },
    // 第 2 口：一半 → 一小塊
    ...c2.moves,
    // 第 3 口前停一拍：打個嗝、托下巴看看剩下的一小塊⋯⋯還是忍不住
    { at: 4.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/full' },
    { at: 4.55, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    { at: 4.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: 5.0, actor: 'meat', do: 'tilt', amount: 6, dur: 0.3 },
    { at: 5.15, actor: 'raccoon', do: 'tilt', amount: 8, dur: 0.3 },
    ...c3.moves,
    // 吃光光：圓滾滾的他往後一倒，滾到左邊
    { at: ROLL, actor: 'raccoon', do: 'moveTo', to: { x: SIDE, y: P }, dur: 0.4, ease: 'out' },
    { at: ROLL, actor: 'raccoon', do: 'rotateTo', amount: -360, dur: 0.4, pivot: 'center' },
    // 語詞那一刻：國字讓回上方，天上又掉下一整塊大牛肉
    { at: DROP, actor: 'meat', do: 'moveTo', to: { x: MX, y: -40 }, dur: 0.01 },
    { at: DROP, actor: 'meat', do: 'pop', dur: 0.02 },
    { at: DROP + 0.02, actor: 'meat', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.28, ease: 'in' },
    { at: LAND, actor: 'meat', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: LAND + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/drool' },
    { at: LAND + 0.1, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    { at: LAND + 0.15, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: P }, dur: 0.4 },
    // 回馬槍（第 4 口）：一整塊一口咬光，只剩骨頭——喀！
    ...c4.moves,
    // 骨頭好好的：硬梆梆地彈走
    { at: B4 + 0.6, actor: 'meat', do: 'moveTo', to: { x: 200, y: MY - 10 }, arc: 14, dur: 0.45, ease: 'out' },
    { at: B4 + 0.6, actor: 'meat', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    // 問他：花生（還是圓滾滾的）走到左前方、變大，轉向觀眾
    { at: 10.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 10.9, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25 },
    { at: 11.0, actor: 'raccoon', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 12.05, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.28 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.75, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 每一口咬掉的那塊肉裡飛出一組：冂 → 上面的人 → 下面的人
    { at: B1 + 0.05, dur: 0.6, strokes: [0, 1], from: c1.b, color: partColor('冂') },
    { at: B2 + 0.05, dur: 0.6, strokes: [2, 3], from: c2.b, color: partColor('人') },
    { at: B3 + 0.05, dur: 0.6, strokes: [4, 5], from: c3.b, color: partColor('人') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給圓滾滾的花生
    { at: 10.85, dur: 3.1, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.8 },
    { at: 10.9, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...c1.fx,
    ...c2.fx,
    // 嗝！
    { at: 4.55, kind: 'pop', actor: 'raccoon', emoji: '🫧', dx: 10, dy: 2, dur: 0.5, scale: 2.2 },
    ...c3.fx,
    // 新的大牛肉掉下來，閃一下
    { at: LAND, kind: 'burst', x: MX, y: MY - 2, emoji: '✨', n: 8, dur: 0.5 },
    ...c4.fx,
    // 喀！牙齒麻：頭上冒星星
    { at: B4 + 0.1, kind: 'burst', x: biteX(1, 3) + 2, y: P - 20, emoji: '⚡', n: 6, dur: 0.5 },
    { at: B4 + 0.7, kind: 'dizzy', actor: 'raccoon', dur: 0.9 },
    { at: 13.45, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...c1.camera,
    ...c2.camera,
    ...c3.camera,
    // 語詞那一刻到第 4 口：固定全景（自動取景會往上推，把地上的大牛肉和花生切掉）
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...c4.camera,
  ],
  lights: [
    // 每一口咬下去淡淡白光一閃（不要把花生刷白）
    ...[B1, B2, B3, B4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.15 - 0.05 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.8, say: '肉' },
    ...c1.cues,
    ...c2.cues,
    { at: 4.55, sfx: 'hic' },
    ...c3.cues,
    { at: ROLL, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '肉' },
    { at: DROP, sfx: 'whoosh' },
    { at: LAND, sfx: 'plop' },
    { at: LAND, say: '牛肉' },
    ...c4.cues,
    { at: B4 + 0.6, sfx: 'boing' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '肉' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
