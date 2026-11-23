import { scene } from '../scene'
import { castScale, type Fx, type Move } from '../../anim/clip'
import type { Scenes } from './index'

// 誰偷了包子：房間裡桌上一小山熱騰騰的包子，燈一暗，牆上一對長耳朵的影子溜過去、低頭吃三口、溜走，燈亮了桌上空了，只剩一顆包子屑轉一轉倒下。
// 豬偵探滑進來擺姿勢，拿放大鏡查桌上的包子屑，再轉頭指著牆：那對長耳朵的影子浮出來、變大、閃，牆上的線索一直留著讓他對。
// 小偷是誰（嫌疑犯都從左邊的門進來）：象擠門擠三次一次比一次用力，像瓶塞一樣啵地彈飛；蛇被放大鏡從頭看到尾沒有耳，
// 頂兩根羽毛當耳朵，掉兩次，垂頭滑走（這兩個豬偵探都在頭上打大叉）；兔吹口哨裝沒事，牆上的影子飛過來疊到他頭上剛剛好，
// 放大鏡一照，臉頰鼓一下，嘴裡的包子啵地噴出來打到豬偵探、彈回桌上。
// 兔跑了：衝出左邊、從右邊衝回來，繞三圈一圈比一圈快，豬偵探越追越落後，喘到吐舌頭。
// 丟什麼：豆撒滿地，兔輕鬆跳過，豬偵探自己踩到、原地亂踩、飛起來摔扁；糖讓兔快成殘影衝三趟（地上、反方向、
// 沿著牆跑上天花板再衝下來），風把豬偵探轉成陀螺、放大鏡飛掉砸頭；
// 菜丟到兔後面，兔急煞車、眼睛發亮、抱著啃，豬偵探踮腳從後面一把抓起來舉高高，兔在上面亂踢、菜掉下去滾走，豬偵探得意地轉身展示。
// 兔哭著道歉，從背後拿出最後一顆包子放在地上，鞠躬一次比一次低，第三次頭撞地板；豬偵探點頭摸摸頭。
// 最後：豬偵探趁兔在鞠躬，左右偷瞄、撿起包子、停一拍、一口塞進嘴裡，放大鏡掉在地上被兔撿起來照他：鏡片裡一顆包子，兩個大笑。
//
// 主角 pig（豬偵探）與 bunny（兔）都是 size 24、站在地上 y = 66.9（引擎放大成 28.5）；圖都朝左。
// 共用的站位：門在左邊 x 14（嫌疑犯從這裡進來），桌子在右邊 x 132（偷之前一小山包子；偷之後一顆倒下的包子屑；兔以後一顆包子）。
// W1（等他選「小偷是＿」）：豬偵探 x 84 think（放大鏡朝左），牆上 x 52 一對長耳朵的影子；左半邊留給嫌疑犯。
// W2（兔的結尾、run 的開頭）：豬偵探 x 78 point，兔 x 48 scared（面向豬偵探）；桌上回來一顆包子。
// W3（等他選「豬偵探丟＿」）：豬偵探 x 100 tired，兔 x 44 giggle（面向豬偵探）。
// W4（菜的結尾、sorry 的開頭）：豬偵探 x 62 lift 把兔舉在頭上，兔 cry。W5（sorry 的結尾）：兔 x 42 鞠躬、包子在他面前地上，豬偵探 x 64。
const BG = { top: '#CFE0F2', bottom: '#EEF4FA', floor: '#B88A5C', scenery: 'room' as const }
const S = 24
const G = 77 - 0.42 * S
/** 引擎把 size 24 放大成這個倍率（畫出來的大小） */
const K = castScale(S)
/** 畫出來的主角中心高度（float 的影子要疊上去就用這個） */
const HERO_MID = 77 - 0.42 * S * K

/** float 的道具：要讓圖的底（內容範圍的下緣 bottom，畫布的幾分之幾）落在 F，y 要寫多少（float 以中心放大） */
const floatOn = (F: number, size: number, bottom = 0.96) => F - (bottom - 0.5) * size * castScale(size)

/** 照引擎 castUp 的算法：劇本寫 y0，畫出來腳底在哪裡（離地 25 以上漸漸改成以中心放大） */
function castFeet(y0: number, size: number) {
  const k = castScale(size)
  const h = 77 - (y0 + 0.42 * size)
  const fall = 1 - Math.min(1, Math.max(0, (h - 25) / 20))
  const feet = 77 - h * (1 + (k - 1) * fall)
  const y = y0 + (feet - 0.42 * size * k - y0) * fall
  return y + 0.42 * size * k
}
/** 不在地上的角色要站在 F 這個高度（腳底）時 y 要寫多少 */
function on(F: number, size = S) {
  let lo = -80, hi = 77
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (castFeet(mid, size) < F) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** 門：嫌疑犯都從這裡進來 */
const DOOR_X = 14
const door = { id: 'door', emoji: '🚪', x: DOOR_X, y: 77 - 0.42 * 30, size: 30 }
/** 桌子 */
const TABLE_X = 132
const table = { id: 'table', emoji: 'prop:table', x: TABLE_X, y: 77 - 0.42 * 28, size: 28 }
/** 桌面的高度：桌子畫出來 31 高，桌面在圖的上面兩成多 */
const TOP = 77 - 0.92 * 28 * castScale(28) + 0.22 * 28 * castScale(28)
/** 偷之前：桌上直接疊一小山包子（下面三顆、上面兩顆），偷吃一口少兩顆 */
const BAO_S = 10
const PILE = [
  { x: TABLE_X - 8, F: TOP + 1 }, { x: TABLE_X, F: TOP + 1.5 }, { x: TABLE_X + 8, F: TOP + 1 },
  { x: TABLE_X - 4, F: TOP - 5.5 }, { x: TABLE_X + 4, F: TOP - 5.5 },
]
const pile = PILE.map((b, i) => ({ id: `p${i}`, emoji: 'prop:bao', x: b.x, y: floatOn(b.F, BAO_S), size: BAO_S, float: true }))
/** 偷之後：桌面只剩一顆包子屑，轉完倒下（之後每一段都倒在那裡） */
const CRUMB = { x: TABLE_X - 2, y: floatOn(TOP + 1, 5.5) }
const crumb = { id: 'crumb', emoji: 'prop:bao', ...CRUMB, size: 5.5, float: true, pivot: 'center' as const }
const CRUMB_DOWN = 80
const crumbDown: Move = { at: 0, dur: 0, actor: 'crumb', do: 'rotateTo', amount: CRUMB_DOWN }
/** 兔噴出來、彈回桌上的那一顆包子（包子屑被它壓在底下）：run 以後桌上就是這一顆 */
const BAO_ON_TABLE = { x: TABLE_X - 1, y: floatOn(TOP + 1, BAO_S) }
const baoOnTable = { id: 'bao', emoji: 'prop:bao', ...BAO_ON_TABLE, size: BAO_S, float: true, pivot: 'center' as const }
/** W1：門、桌子、倒著的包子屑；兔以後：門、桌子、一顆包子 */
const room = [door, table, crumb]
const roomAfter = [door, table, baoOnTable]

/**
 * 牆上的長耳朵影子：兔的上半截（頭＋耳朵）染黑，平常放大 EARS_K 倍貼在牆上（看得到的部分約 y 18～38）。
 * float 的角色放大是以「腳底」（y + 0.42 × 畫出來的 size）為支點往上長，要原地變大就同時往下移 EARS_DROP。
 */
const SHADOW = 'brightness(0) opacity(.72)'
const EARS_K = 1.4
const EARS_WALL = { x: 52, y: 42.7 }
const ears = { id: 'ears', emoji: 'hero:bunny/idle', ...EARS_WALL, size: S, float: true, flip: true, half: 'top' as const, cut: 0.5, tint: SHADOW }
const earsBig: Move = { at: 0, dur: 0, actor: 'ears', do: 'scaleTo', amount: EARS_K }
/** 線索強調時再放大的倍率，與為了中心不動要往下移多少（中心在腳底上面 0.67 個畫出來的高） */
const EARS_PUMP = 1.3
const EARS_DROP = EARS_K * (EARS_PUMP - 1) * 0.67 * S * K

/**
 * 鏡頭：每一段的結尾都退回全景（等他選的畫面看得到門、牆上的線索、桌子），下一段第一格也是全景，再慢慢交給自動取景，換頁才不會一遠一近。
 * 第一格要是全景，定全景的鏡頭得在 0 秒以前就開始（從 0 秒開始的話，自動取景在第一格還沒讓出來）。
 */
const holdWide = (at: number, dur = 0.5) => ({ at, dur, do: 'zoom' as const, amount: 1.02, to: { x: 80, y: 45 } })
const release = (at: number, dur = 0.6) => ({ at, dur, do: 'zoom' as const, amount: 1 })
const START = holdWide(-0.3, 0.01)

const PIG_X = 84
const pigAt = (pose: string, x = PIG_X, flip = false) => ({ id: 'pig', emoji: `hero:pig/${pose}`, x, y: G, size: S, flip })
const bunAt = (pose: string, x: number, flip = true) => ({ id: 'bun', emoji: `hero:bunny/${pose}`, x, y: G, size: S, flip })

/** 打叉：豬偵探頭上冒出嫌疑犯的小圖，停一拍，紅色大叉蓋上去 */
const NOTE = { x: PIG_X - 2, y: 34 }
function crossOut(at: number, who: string, until: number): { actors: object[]; moves: Move[]; fx: Fx[] } {
  return {
    actors: [
      { id: 'note', emoji: who, ...NOTE, size: 15, hidden: true, float: true },
      { id: 'x', emoji: 'prop:red-x', ...NOTE, size: 17, hidden: true, float: true },
    ],
    moves: [
      { at, actor: 'note', do: 'pop', dur: 0.25 },
      { at: +(at + 0.5).toFixed(2), actor: 'x', do: 'pop', dur: 0.15 },
      { at: +(at + 0.5).toFixed(2), actor: 'x', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: +(at + 0.55).toFixed(2), actor: 'note', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: until, actor: 'note', do: 'vanish', dur: 0.2 },
      { at: until, actor: 'x', do: 'vanish', dur: 0.2 },
    ],
    fx: [],
  }
}

const scenes: Scenes = {
  // 桌上的包子不見了！——一小山包子冒煙閃亮；燈一暗，牆上一對長耳朵的影子溜到桌子上面，低頭吃三口（一口少兩顆），咻地溜出門；
  // 燈亮：桌上空了，只剩一顆包子屑在轉，轉完倒下，一縷煙慢慢散掉
  gone: scene({
    duration: 5.8,
    bg: BG,
    actors: [
      { ...ears, x: -24, y: 40, hidden: true },
      door,
      table,
      { ...crumb, hidden: true },
      ...pile,
    ],
    moves: [
      ...pile.map((b, i): Move => ({ at: 0.3 + i * 0.08, actor: b.id, do: 'hop', amount: 1.2, dur: 0.25 })),
      ...pile.map((b, i): Move => ({ at: 0.8 + (i % 2) * 0.1, actor: b.id, do: 'squash', amount: -0.1, dur: 0.3 })),
      // 燈暗：影子溜進來
      { at: 1.2, actor: 'ears', do: 'pop', dur: 0.05 },
      { at: 1.26, actor: 'ears', do: 'scaleTo', amount: EARS_K, dur: 0.01 },
      { at: 1.2, actor: 'ears', do: 'moveTo', to: { x: TABLE_X - 4, y: EARS_WALL.y }, dur: 0.5, ease: 'in' },
      // 低頭吃三口（一口比一口大），一口少兩顆
      ...[1.85, 2.25, 2.65].flatMap((t, i): Move[] => [
        { at: t, actor: 'ears', do: 'moveTo', to: { x: TABLE_X - 4, y: EARS_WALL.y + 4 + i * 3 }, dur: 0.15, ease: 'in' },
        { at: +(t + 0.18).toFixed(2), actor: 'ears', do: 'moveTo', to: { x: TABLE_X - 4, y: EARS_WALL.y }, dur: 0.18 },
        ...pile.map((b): Move => ({ at: +(t + 0.12).toFixed(2), actor: b.id, do: 'shake', amount: 0.5 + i * 0.3, dur: 0.15 })),
        ...[['p3', 'p4'], ['p0', 'p2'], ['p1']][i].map((id): Move => ({ at: +(t + 0.15).toFixed(2), actor: id, do: 'vanish', dur: 0.08 })),
      ]),
      { at: 2.82, actor: 'crumb', do: 'pop', dur: 0.05 },
      // 咻！溜出門
      { at: 3.05, actor: 'ears', do: 'moveTo', to: { x: -30, y: EARS_WALL.y }, dur: 0.35, ease: 'in' },
      { at: 3.4, actor: 'ears', do: 'vanish', dur: 0.05 },
      { at: 3.3, actor: 'door', do: 'shake', amount: 1, dur: 0.3 },
      // 燈亮：包子屑在轉，越轉越慢，搖兩下倒下
      { at: 3.6, actor: 'crumb', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.6, actor: 'crumb', do: 'spin', times: 3, dur: 1.0 },
      { at: 3.95, actor: 'crumb', do: 'hop', amount: 2, dur: 0.25 },
      { at: 4.25, actor: 'crumb', do: 'hop', amount: 1, dur: 0.2 },
      { at: 4.6, actor: 'crumb', do: 'tilt', amount: 25, dur: 0.3 },
      { at: 4.9, actor: 'crumb', do: 'rotateTo', amount: CRUMB_DOWN, dur: 0.3, ease: 'bounce' },
      { at: 5.2, actor: 'crumb', do: 'squash', amount: 0.2, dur: 0.25 },
    ],
    fx: [
      { at: 0.2, kind: 'burst', actor: 'p1', emoji: '✨', n: 6, dy: -2, dur: 0.8 },
      { at: 0.5, kind: 'zzz', actor: 'p4', emoji: '♨️', dy: 2, dur: 0.9 },
      { at: 2.05, kind: 'burst', x: TABLE_X, y: TOP - 4, emoji: '💨', n: 3, scale: 0.7, dur: 0.3 },
      { at: 2.45, kind: 'burst', x: TABLE_X, y: TOP - 4, emoji: '💨', n: 4, scale: 0.9, dur: 0.3 },
      { at: 2.85, kind: 'burst', x: TABLE_X, y: TOP - 4, emoji: '💨', n: 6, scale: 1.1, dur: 0.35 },
      { at: 3.65, kind: 'pop', actor: 'crumb', emoji: '❗', dy: -2, dur: 0.6 },
      { at: 3.7, kind: 'zzz', actor: 'crumb', emoji: '💨', dx: 3, dy: 2, scale: 0.8, dur: 1.9 },
      { at: 4.45, kind: 'pop', actor: 'crumb', emoji: '❓', dy: -2, dur: 0.8 },
    ],
    // 一翻開先看到整個房間，再慢慢推到桌子；最後退回全景接下一頁
    camera: [START, { at: 0.1, dur: 0.9, do: 'zoom', amount: 1.25, to: { x: 106, y: 46 } }, holdWide(4.9, 0.7)],
    lights: [
      { at: 0.95, dur: 0.25, level: 0.62 },
      { at: 3.4, dur: 0.2, level: 0 },
    ],
    cues: [
      { at: 1.2, sfx: 'whoosh' },
      { at: 2.0, sfx: 'gulp' },
      { at: 2.4, sfx: 'gulp' },
      { at: 2.8, sfx: 'gulp' },
      { at: 3.05, sfx: 'whoosh' },
      { at: 3.3, sfx: 'bonk' },
      { at: 3.7, say: '桌上的包子不見了！' },
      { at: 5.0, sfx: 'tap' },
    ],
  }),

  // 豬偵探來了。小偷有大大的耳！——從左邊一路滑進來、急停、舉手指擺姿勢；轉身拿放大鏡湊到桌上，包子屑被放大；
  // 回頭一指牆：長耳朵的影子浮出來，唸到「大大的耳」那一刻變大、閃、鏡頭推過去；走回中間想。結尾 W1
  clue: scene({
    duration: 5.6,
    bg: BG,
    actors: [{ ...ears, hidden: true }, ...room, { ...pigAt('dash', PIG_X, true), hidden: true }],
    moves: [
      crumbDown,
      { at: 0.05, actor: 'pig', do: 'enter', from: { x: -20, y: G }, dur: 0.7, ease: 'out' },
      { at: 0.7, actor: 'pig', do: 'flip' },
      { at: 0.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/know' },
      { at: 0.75, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
      // 轉身查桌子：包子屑在放大鏡裡變好大
      { at: 1.3, actor: 'pig', do: 'flip' },
      { at: 1.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
      { at: 1.3, actor: 'pig', do: 'moveTo', to: { x: 104, y: G }, dur: 0.35 },
      { at: 1.7, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
      { at: 1.75, actor: 'crumb', do: 'scaleTo', amount: 2.4, dur: 0.15, ease: 'back' },
      { at: 2.15, actor: 'crumb', do: 'scaleTo', amount: 1 / 2.4, dur: 0.15 },
      // 回頭指牆：耳朵的影子浮出來
      { at: 2.2, actor: 'pig', do: 'flip' },
      { at: 2.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
      { at: 2.3, actor: 'ears', do: 'pop', dur: 0.3 },
      // 重新出場會把大小歸 1，再放大回貼在牆上的大小
      { at: 2.31, actor: 'ears', do: 'scaleTo', amount: EARS_K, dur: 0.01 },
      { at: 2.85, actor: 'ears', do: 'scaleTo', amount: EARS_PUMP, dur: 0.25, ease: 'back' },
      { at: 2.85, actor: 'ears', do: 'moveTo', to: { x: EARS_WALL.x, y: EARS_WALL.y + EARS_DROP }, dur: 0.25, ease: 'back' },
      { at: 3.1, actor: 'ears', do: 'flash', dur: 0.5 },
      { at: 3.15, actor: 'ears', do: 'tilt', amount: 5, dur: 0.35 },
      { at: 2.85, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.65, actor: 'ears', do: 'scaleTo', amount: 1 / EARS_PUMP, dur: 0.3 },
      { at: 3.65, actor: 'ears', do: 'moveTo', to: EARS_WALL, dur: 0.3 },
      // 走回中間想
      { at: 3.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
      { at: 3.7, actor: 'pig', do: 'moveTo', to: { x: PIG_X, y: G }, dur: 0.55 },
      { at: 4.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
      { at: 4.8, actor: 'pig', do: 'tilt', amount: -6, dur: 0.5 },
    ],
    fx: [
      { at: 0.1, kind: 'puff', actor: 'pig', dur: 0.5 },
      { at: 0.75, kind: 'burst', actor: 'pig', emoji: '✨', n: 6, dy: -10, dur: 0.6 },
      { at: 1.75, kind: 'pop', actor: 'crumb', emoji: '❗', dy: -3, dur: 0.5 },
      { at: 2.9, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.6 },
      { at: 4.35, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.8 },
    ],
    // 唸到「大大的耳」：鏡頭定在牆上的耳朵與指著它的豬偵探；之後退回全景（W1）
    camera: [START, release(0.4), { at: 2.6, dur: 0.35, do: 'zoom', amount: 1.45, to: { x: 66, y: 36 } }, holdWide(3.8, 0.7)],
    cues: [
      { at: 0.05, sfx: 'slide' },
      { at: 0.75, sfx: 'cheer' },
      { at: 1.0, say: '豬偵探來了。小偷有大大的耳！' },
      { at: 1.75, sfx: 'blip' },
      { at: 2.3, sfx: 'poof' },
      { at: 2.75, sfx: 'boing' },
    ],
  }),

  // 象太大了！門太小了！——地板轟轟響，一隻大象擠到門口，頭卡在門邊；擠三次一次比一次用力，門被擠扁、房間跟著震，
  // 豬偵探被震得東倒西歪；第三次卡住、抖、啵！像瓶塞一樣彈飛出去。豬偵探頭上：🐘 打一個大叉。回到 W1
  'who:象': scene({
    duration: 6.6,
    bg: BG,
    ...(() => {
      const X = crossOut(4.75, '🐘', 6.0)
      const EX = 18
      const ey = 77 - 0.42 * 52
      return {
        actors: [
          { ...ears },
          { id: 'ele', emoji: 'prop:elephant', x: EX, y: ey, size: 52, flip: true, hidden: true },
          ...room,
          { id: 'star', emoji: '🌟', x: 36, y: 12, size: 9, hidden: true, float: true },
          pigAt('think'),
          ...X.actors,
        ] as never,
        moves: [
          crumbDown,
          earsBig,
          { at: 0.1, actor: 'ele', do: 'enter', from: { x: -40, y: ey }, dur: 0.6, ease: 'out' },
          { at: 0.7, actor: 'door', do: 'shake', amount: 0.8, dur: 0.3 },
          { at: 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          { at: 0.75, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
          // 第一次：擠一下
          { at: 1.15, actor: 'ele', do: 'moveTo', to: { x: EX + 4, y: ey }, dur: 0.15, ease: 'in' },
          { at: 1.3, actor: 'door', do: 'tilt', amount: 6, dur: 0.35 },
          { at: 1.3, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.3 },
          { at: 1.45, actor: 'ele', do: 'moveTo', to: { x: EX, y: ey }, dur: 0.25 },
          // 第二次：退一步再用力
          { at: 1.8, actor: 'ele', do: 'moveTo', to: { x: EX - 5, y: ey }, dur: 0.25 },
          { at: 2.05, actor: 'ele', do: 'moveTo', to: { x: EX + 8, y: ey }, dur: 0.15, ease: 'in' },
          { at: 2.2, actor: 'door', do: 'tilt', amount: 12, dur: 0.4 },
          { at: 2.2, actor: 'door', do: 'squash', amount: 0.15, dur: 0.4 },
          { at: 2.2, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
          { at: 2.2, actor: 'pig', do: 'tilt', amount: -18, dur: 0.4 },
          { at: 2.2, actor: 'pig', do: 'moveTo', to: { x: PIG_X + 3, y: G }, dur: 0.2 },
          { at: 2.2, actor: 'crumb', do: 'hop', amount: 3, dur: 0.25 },
          { at: 2.45, actor: 'ele', do: 'moveTo', to: { x: EX, y: ey }, dur: 0.25 },
          // 第三次：退好遠、衝！卡住了
          { at: 2.8, actor: 'ele', do: 'moveTo', to: { x: EX - 12, y: ey }, dur: 0.35, ease: 'out' },
          { at: 3.15, actor: 'ele', do: 'moveTo', to: { x: EX + 12, y: ey }, dur: 0.15, ease: 'in' },
          { at: 3.3, actor: 'ele', do: 'stretchTo', amount: 0.85, dur: 0.1 },
          { at: 3.3, actor: 'door', do: 'stretchTo', amount: 0.75, dur: 0.1 },
          { at: 3.3, actor: 'door', do: 'tilt', amount: 16, dur: 0.6 },
          { at: 3.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/slip' },
          { at: 3.3, actor: 'pig', do: 'moveTo', to: { x: PIG_X + 10, y: G }, dur: 0.3, ease: 'out' },
          { at: 3.3, actor: 'pig', do: 'hop', amount: 7, dur: 0.4 },
          { at: 3.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
          { at: 3.3, actor: 'crumb', do: 'hop', amount: 5, dur: 0.3 },
          { at: 3.45, actor: 'ele', do: 'shake', amount: 1.2, dur: 0.6 },
          // 啵！彈飛
          // 啵！像瓶塞一樣往後上方彈飛，越飛越小，天上叮一顆星
          { at: 4.1, actor: 'ele', do: 'stretchTo', amount: 1 / 0.85, dur: 0.1 },
          { at: 4.1, actor: 'ele', do: 'moveTo', to: { x: 36, y: 4 }, dur: 0.6, ease: 'out' },
          { at: 4.1, actor: 'ele', do: 'scaleTo', amount: 0.2, dur: 0.6, ease: 'in' },
          { at: 4.1, actor: 'ele', do: 'rotateTo', amount: -30, dur: 0.6 },
          { at: 4.7, actor: 'ele', do: 'vanish', dur: 0.05 },
          { at: 4.72, actor: 'star', do: 'pop', dur: 0.2 },
          { at: 4.95, actor: 'star', do: 'shake', amount: 0.8, dur: 0.3 },
          { at: 5.3, actor: 'star', do: 'vanish', dur: 0.25 },
          { at: 4.1, actor: 'door', do: 'stretchTo', amount: 1 / 0.75, dur: 0.6, ease: 'elastic' },
          { at: 4.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
          { at: 4.15, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.4 },
          // 回原位，頭上打叉
          { at: 4.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
          { at: 4.7, actor: 'pig', do: 'moveTo', to: { x: PIG_X, y: G }, dur: 0.4 },
          { at: 5.15, actor: 'pig', do: 'tilt', amount: -8, dur: 0.25 },
          { at: 5.4, actor: 'pig', do: 'tilt', amount: 8, dur: 0.25 },
          ...X.moves,
        ],
        fx: [
          { at: 0.3, kind: 'puff', actor: 'ele', scale: 1.4, dur: 0.5 },
          { at: 0.75, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
          { at: 1.3, kind: 'burst', x: 23, y: 54, n: 1, scale: 0.7, dur: 0.3 },
          { at: 2.2, kind: 'burst', x: 24, y: 54, n: 1, scale: 1, dur: 0.35 },
          { at: 3.3, kind: 'burst', x: 25, y: 52, n: 1, scale: 1.4, dur: 0.4 },
          { at: 3.5, kind: 'sweat', actor: 'ele', dx: 8 },
          { at: 4.1, kind: 'burst', x: 30, y: 52, emoji: '💨', n: 6, scale: 1.5, dur: 0.5 },
          { at: 4.72, kind: 'burst', x: 36, y: 14, emoji: '✨', n: 6, dur: 0.6 },
          { at: 4.2, kind: 'dizzy', actor: 'pig', dur: 0.5 },
        ],
        camera: [
          START,
          release(0.5),
          { at: 1.3, dur: 0.25, do: 'shake', amount: 0.6 },
          { at: 2.2, dur: 0.3, do: 'shake', amount: 1.2 },
          { at: 3.3, dur: 0.45, do: 'shake', amount: 2.2 },
          // 大象往上彈飛：自動取景會追出去，自己定成全景；之後停在全景等他選（W1）
          holdWide(3.9, 0.2),
        ],
        cues: [
          { at: 0.1, sfx: 'rumble' },
          { at: 1.3, sfx: 'bonk' },
          { at: 2.2, sfx: 'bonk' },
          { at: 2.3, say: '象太大了！門太小了！' },
          { at: 3.3, sfx: 'crack' },
          { at: 4.1, sfx: 'poof' },
          { at: 4.15, sfx: 'whoosh' },
          { at: 5.1, sfx: 'tap' },
        ],
      }
    })(),
  }),

  // 不是蛇。蛇沒有耳！——蛇從門底下滑進來笑一笑；豬偵探拿放大鏡從頭看到尾，沒有耳；蛇撿兩根羽毛頂在頭上當耳朵，
  // 一抬頭就掉；再頂一次、伸長脖子，又掉，還打到自己。豬偵探搖頭打叉，蛇垂頭喪氣滑出去。回到 W1
  'who:蛇': scene({
    duration: 6.8,
    bg: BG,
    ...(() => {
      const X = crossOut(5.0, '🐍', 6.2)
      const SX = 52
      const sy = 77 - 0.42 * 18
      /** 蛇頭（🐍 的頭在右上角）頂上；羽毛（float、以中心轉）立起來時中心在這上面 */
      const HEAD = { x: SX + 6, y: 56 }
      const f0 = { x: SX - 12, y: 70 }
      const f1 = { x: SX + 20, y: 70 }
      const lie = (f: { x: number }) => ({ x: f.x, y: 73 })
      const onHead = (dx: number) => ({ x: HEAD.x + dx, y: HEAD.y - 8 })
      return {
        actors: [
          { ...ears },
          ...room,
          { id: 'snake', emoji: '🐍', x: SX, y: sy, size: 18, hidden: true },
          { id: 'f0', emoji: 'prop:feather', ...f0, size: 12, hidden: true, float: true, pivot: 'center' as const },
          { id: 'f1', emoji: 'prop:feather', ...f1, size: 12, hidden: true, float: true, flip: true, pivot: 'center' as const },
          pigAt('think'),
          ...X.actors,
        ] as never,
        moves: [
          crumbDown,
          earsBig,
          { at: 0.1, actor: 'snake', do: 'enter', from: { x: -10, y: sy }, dur: 0.8, ease: 'out' },
          ...[0.1, 0.35, 0.6].map((t, i): Move => ({ at: t, actor: 'snake', do: 'tilt', amount: i % 2 ? -8 : 8, dur: 0.25 })),
          { at: 0.95, actor: 'snake', do: 'hop', amount: 3, dur: 0.3 },
          // 放大鏡從頭看到尾
          { at: 1.1, actor: 'pig', do: 'moveTo', to: { x: 78, y: G }, dur: 0.3 },
          { at: 1.45, actor: 'pig', do: 'hop', amount: 4, dur: 0.4 },
          { at: 1.85, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.4 },
          { at: 1.85, actor: 'pig', do: 'moveTo', to: { x: 75, y: G }, dur: 0.3 },
          { at: 2.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
          { at: 2.3, actor: 'pig', do: 'moveTo', to: { x: 80, y: G }, dur: 0.3 },
          // 撿羽毛頂在頭上
          { at: 2.4, actor: 'f0', do: 'pop', dur: 0.2 },
          { at: 2.4, actor: 'f1', do: 'pop', dur: 0.2 },
          { at: 2.7, actor: 'f0', do: 'moveTo', to: onHead(-3), arc: 6, dur: 0.3 },
          { at: 2.7, actor: 'f1', do: 'moveTo', to: onHead(3), arc: 6, dur: 0.3 },
          { at: 2.7, actor: 'f0', do: 'rotateTo', amount: -55, dur: 0.3 },
          { at: 2.7, actor: 'f1', do: 'rotateTo', amount: 55, dur: 0.3 },
          { at: 3.0, actor: 'snake', do: 'hop', amount: 3, dur: 0.3 },
          { at: 3.0, actor: 'f0', do: 'hop', amount: 3, dur: 0.3 },
          { at: 3.0, actor: 'f1', do: 'hop', amount: 3, dur: 0.3 },
          // 掉了
          { at: 3.45, actor: 'f0', do: 'moveTo', to: lie(f0), dur: 0.35, ease: 'in' },
          { at: 3.45, actor: 'f0', do: 'rotateTo', amount: 100, dur: 0.35 },
          { at: 3.5, actor: 'f1', do: 'moveTo', to: lie(f1), dur: 0.35, ease: 'in' },
          { at: 3.5, actor: 'f1', do: 'rotateTo', amount: -100, dur: 0.35 },
          { at: 3.5, actor: 'snake', do: 'squash', amount: 0.2, dur: 0.3 },
          // 再一次：伸長脖子
          { at: 3.95, actor: 'f0', do: 'rotateTo', amount: -100, dur: 0.25 },
          { at: 3.95, actor: 'f1', do: 'rotateTo', amount: 100, dur: 0.25 },
          { at: 3.95, actor: 'f0', do: 'moveTo', to: onHead(-3), arc: 6, dur: 0.25 },
          { at: 3.95, actor: 'f1', do: 'moveTo', to: onHead(3), arc: 6, dur: 0.25 },
          { at: 4.2, actor: 'snake', do: 'squash', amount: -0.3, dur: 0.5 },
          { at: 4.2, actor: 'f0', do: 'hop', amount: 5, dur: 0.5 },
          { at: 4.2, actor: 'f1', do: 'hop', amount: 5, dur: 0.5 },
          { at: 4.7, actor: 'f0', do: 'moveTo', to: lie(f0), dur: 0.25, ease: 'in' },
          { at: 4.7, actor: 'f0', do: 'rotateTo', amount: 100, dur: 0.25 },
          { at: 4.7, actor: 'f1', do: 'moveTo', to: { x: HEAD.x + 1, y: HEAD.y + 2 }, dur: 0.15, ease: 'in' },
          { at: 4.85, actor: 'f1', do: 'moveTo', to: lie(f1), dur: 0.25 },
          { at: 4.85, actor: 'f1', do: 'rotateTo', amount: -100, dur: 0.25 },
          { at: 4.85, actor: 'snake', do: 'squash', amount: 0.3, dur: 0.3 },
          // 搖頭、打叉；蛇垂頭喪氣滑出去，羽毛一起帶走
          { at: 4.95, actor: 'pig', do: 'tilt', amount: -8, dur: 0.25 },
          { at: 5.2, actor: 'pig', do: 'tilt', amount: 8, dur: 0.25 },
          { at: 5.4, actor: 'snake', do: 'flip' },
          { at: 5.5, actor: 'snake', do: 'moveTo', to: { x: -14, y: sy }, dur: 0.9, ease: 'in' },
          { at: 5.5, actor: 'f0', do: 'moveTo', to: { x: -20, y: 73 }, dur: 0.9, ease: 'in' },
          { at: 5.5, actor: 'f1', do: 'moveTo', to: { x: -8, y: 73 }, dur: 0.9, ease: 'in' },
          { at: 6.4, actor: 'snake', do: 'vanish', dur: 0.05 },
          { at: 6.4, actor: 'f0', do: 'vanish', dur: 0.05 },
          { at: 6.4, actor: 'f1', do: 'vanish', dur: 0.05 },
          { at: 5.7, actor: 'pig', do: 'moveTo', to: { x: PIG_X, y: G }, dur: 0.4 },
          { at: 5.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
          ...X.moves,
        ],
        fx: [
          { at: 1.0, kind: 'pop', actor: 'snake', emoji: '😊', dur: 0.6 },
          { at: 2.0, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.6 },
          { at: 3.05, kind: 'burst', actor: 'snake', emoji: '✨', n: 5, dy: -2, dur: 0.5 },
          { at: 3.6, kind: 'sweat', actor: 'snake' },
          { at: 4.85, kind: 'burst', x: HEAD.x, y: HEAD.y, n: 1, scale: 0.6, dur: 0.3 },
          { at: 5.5, kind: 'pop', actor: 'snake', emoji: '💧', dur: 0.8 },
        ],
        camera: [START, release(0.5), holdWide(5.6, 0.6)],
        cues: [
          { at: 0.1, sfx: 'slide' },
          { at: 2.0, say: '不是蛇。蛇沒有耳！' },
          { at: 3.0, sfx: 'boing' },
          { at: 3.5, sfx: 'deflate' },
          { at: 4.2, sfx: 'boing' },
          { at: 4.85, sfx: 'bonk' },
          { at: 5.35, sfx: 'tap' },
        ],
      }
    })(),
  }),

  // 是兔！兔的嘴裡有包子！——兔從門口晃進來，吹口哨、手背在後面裝沒事；牆上的影子飛過來疊到頭上：一模一樣！
  // 臉頰鼓鼓的，豬偵探湊過去拿放大鏡一照，臉頰再鼓一下（臉變寬、看得到裡面一顆包子），嘴裡的包子啵地噴出來打到豬偵探的頭，
  // 彈回桌上壓住包子屑。結尾 W2：豬偵探指著兔，兔慌張發抖
  'who:兔': scene({
    duration: 6.6,
    bg: BG,
    ...(() => {
      const BX = 48
      const MOUTH = { x: BX + 2, y: 61.5 }
      return {
        actors: [
          ...room,
          { ...bunAt('blow', BX), hidden: true },
          { ...ears },
          pigAt('think'),
          { ...baoOnTable, ...MOUTH, hidden: true },
          { id: 'cheek', emoji: 'prop:bao', x: MOUTH.x + 2, y: MOUTH.y, size: 6, hidden: true, float: true, tint: 'opacity(.6)' },
        ] as never,
        moves: [
          crumbDown,
          earsBig,
          { at: 0.05, actor: 'bun', do: 'enter', from: { x: DOOR_X + 2, y: G }, dur: 0.8 },
          { at: 0, actor: 'door', do: 'shake', amount: 0.6, dur: 0.3 },
          { at: 0.9, actor: 'bun', do: 'tilt', amount: 6, dur: 0.4 },
          { at: 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
          // 影子飛過來疊到頭上
          { at: 1.3, actor: 'ears', do: 'moveTo', to: { x: BX, y: HERO_MID }, dur: 0.55, ease: 'inOut' },
          { at: 1.3, actor: 'ears', do: 'scaleTo', amount: 1 / EARS_K, dur: 0.55 },
          { at: 1.6, actor: 'ears', do: 'tint', filter: 'brightness(0) opacity(.45)' },
          { at: 1.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/know' },
          { at: 1.9, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
          { at: 2.35, actor: 'ears', do: 'vanish', dur: 0.3 },
          // 臉頰鼓鼓的
          { at: 2.3, actor: 'bun', do: 'swap', emoji: 'hero:bunny/eat' },
          { at: 2.5, actor: 'bun', do: 'squash', amount: -0.08, dur: 0.25 },
          { at: 2.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
          { at: 2.5, actor: 'pig', do: 'moveTo', to: { x: 70, y: G }, dur: 0.35 },
          { at: 2.9, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
          { at: 2.9, actor: 'bun', do: 'shake', amount: 0.8, dur: 0.4 },
          // 放大鏡照到：臉頰再鼓一下，看得到裡面一顆包子
          { at: 2.95, actor: 'bun', do: 'stretchTo', amount: 1.18, dur: 0.15, ease: 'back' },
          { at: 2.95, actor: 'cheek', do: 'pop', dur: 0.2 },
          { at: 3.15, actor: 'cheek', do: 'squash', amount: -0.15, dur: 0.2 },
          { at: 3.33, actor: 'cheek', do: 'vanish', dur: 0.05 },
          { at: 3.35, actor: 'bun', do: 'stretchTo', amount: 1 / 1.18, dur: 0.08 },
          // 啵！
          { at: 3.35, actor: 'bao', do: 'pop', dur: 0.08 },
          { at: 3.35, actor: 'bao', do: 'moveTo', to: { x: 64, y: 55 }, dur: 0.12, ease: 'out' },
          { at: 3.35, actor: 'bun', do: 'swap', emoji: 'hero:bunny/surprised' },
          { at: 3.35, actor: 'bun', do: 'hop', amount: 5, dur: 0.35 },
          { at: 3.47, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          { at: 3.47, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.25 },
          { at: 3.47, actor: 'bao', do: 'moveTo', to: BAO_ON_TABLE, arc: 22, dur: 0.75, ease: 'linear' },
          { at: 3.47, actor: 'bao', do: 'spin', times: 2, dur: 0.75 },
          { at: 4.22, actor: 'bao', do: 'squash', amount: 0.25, dur: 0.25 },
          { at: 4.22, actor: 'crumb', do: 'vanish', dur: 0.05 },
          // 指著他：就是你！
          { at: 4.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
          { at: 4.3, actor: 'pig', do: 'moveTo', to: { x: 78, y: G }, dur: 0.3 },
          { at: 4.35, actor: 'bun', do: 'swap', emoji: 'hero:bunny/scared' },
          { at: 4.4, actor: 'bun', do: 'shake', amount: 1, dur: 0.8 },
          { at: 5.3, actor: 'bun', do: 'shake', amount: 0.8, dur: 0.6 },
          { at: 6.0, actor: 'bun', do: 'shake', amount: 0.6, dur: 0.4 },
          { at: 4.7, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
        ],
        fx: [
          { at: 0.2, kind: 'zzz', actor: 'bun', emoji: '🎵', dx: 6, dy: 10, dur: 1.4 },
          { at: 1.0, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5 },
          { at: 1.9, kind: 'pop', actor: 'bun', emoji: '⭕', dy: -2, scale: 1.3, dur: 0.8 },
          { at: 1.95, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
          { at: 2.6, kind: 'sweat', actor: 'bun' },
          { at: 3.35, kind: 'burst', x: MOUTH.x + 2, y: MOUTH.y, n: 1, scale: 0.6, dur: 0.3 },
          { at: 3.47, kind: 'burst', actor: 'pig', emoji: '⭐', n: 4, dy: 4, scale: 0.8, dur: 0.4 },
          { at: 4.22, kind: 'burst', actor: 'bao', emoji: '✨', n: 5, dy: 2, scale: 0.8, dur: 0.5 },
          { at: 4.5, kind: 'sweat', actor: 'bun' },
        ],
        camera: [START, release(0.6), holdWide(5.5, 0.6)],
        cues: [
          { at: 0.1, sfx: 'blip' },
          { at: 1.9, sfx: 'blip' },
          { at: 2.3, say: '是兔！兔的嘴裡有包子！' },
          { at: 3.35, sfx: 'poof' },
          { at: 3.47, sfx: 'bonk' },
          { at: 4.22, sfx: 'plop' },
        ],
      }
    })(),
  }),

  // 兔跑了！跑好快！——兔一轉身衝出左邊，從右邊衝回來、超過豬偵探，再從左邊衝回來，一圈比一圈快；豬偵探左追右追越追越後面，
  // 停下來喘到吐舌頭。結尾 W3：豬偵探在右邊喘，兔在左邊偷笑
  run: scene({
    duration: 5.6,
    bg: BG,
    actors: [...roomAfter, bunAt('scared', 48), pigAt('point', 78)],
    moves: [
      { at: 0.1, actor: 'bun', do: 'flip' },
      { at: 0.1, actor: 'bun', do: 'swap', emoji: 'hero:bunny/dash' },
      { at: 0.15, actor: 'bun', do: 'moveTo', to: { x: -25, y: G }, dur: 0.4, ease: 'in', anticipate: 4 },
      { at: 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 0.3, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
      // 第一圈：從右邊衝回來（畫面外換邊）
      { at: 0.6, actor: 'bun', do: 'moveTo', to: { x: 185, y: G }, dur: 0.01 },
      { at: 0.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
      { at: 0.65, actor: 'pig', do: 'moveTo', to: { x: 44, y: G }, dur: 0.8 },
      { at: 0.7, actor: 'bun', do: 'moveTo', to: { x: -25, y: G }, dur: 0.55, ease: 'linear' },
      // 第二圈：從左邊衝回來，更快
      { at: 1.3, actor: 'bun', do: 'flip' },
      { at: 1.35, actor: 'bun', do: 'moveTo', to: { x: 185, y: G }, dur: 0.4, ease: 'linear' },
      { at: 1.5, actor: 'pig', do: 'flip' },
      { at: 1.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 1.55, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
      { at: 1.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
      { at: 1.85, actor: 'pig', do: 'moveTo', to: { x: 100, y: G }, dur: 0.85 },
      // 第三圈：從右邊衝回來，最快，停在左邊
      { at: 1.8, actor: 'bun', do: 'flip' },
      { at: 2.1, actor: 'bun', do: 'moveTo', to: { x: 44, y: G }, dur: 0.3, ease: 'back' },
      { at: 2.25, actor: 'pig', do: 'tilt', amount: 15, dur: 0.3 },
      { at: 2.4, actor: 'bun', do: 'flip' },
      { at: 2.45, actor: 'bun', do: 'swap', emoji: 'hero:bunny/happy' },
      { at: 2.5, actor: 'bun', do: 'hop', amount: 6, dur: 0.35 },
      // 豬偵探停下來喘
      { at: 2.75, actor: 'pig', do: 'flip' },
      { at: 2.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/tired' },
      ...[2.9, 3.3, 3.7, 4.1, 4.5, 4.95].map((t): Move => ({ at: t, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.3 })),
      { at: 3.0, actor: 'bun', do: 'hop', amount: 6, dur: 0.35 },
      { at: 3.45, actor: 'bun', do: 'swap', emoji: 'hero:bunny/giggle' },
      { at: 3.5, actor: 'bun', do: 'hop', amount: 3, dur: 0.3 },
      { at: 4.3, actor: 'bun', do: 'shake', amount: 0.6, dur: 0.6 },
    ],
    fx: [
      { at: 0.2, kind: 'puff', actor: 'bun', dur: 0.4 },
      { at: 0.35, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.4 },
      { at: 0.75, kind: 'puff', x: 150, y: 74, dur: 0.4 },
      { at: 1.4, kind: 'puff', x: 10, y: 74, scale: 1.3, dur: 0.4 },
      { at: 1.55, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.35 },
      { at: 2.1, kind: 'puff', x: 150, y: 74, scale: 1.6, dur: 0.5 },
      { at: 2.45, kind: 'puff', actor: 'bun', scale: 1.6, dur: 0.5 },
      { at: 2.8, kind: 'sweat', actor: 'pig' },
      { at: 3.0, kind: 'burst', actor: 'pig', emoji: '💦', n: 5, dy: -4, dur: 0.7 },
      { at: 3.6, kind: 'pop', actor: 'bun', emoji: '😝', dur: 1.0 },
      { at: 3.8, kind: 'sweat', actor: 'pig' },
    ],
    // 衝出畫面、從另一邊衝回來：自己定成全景，不讓自動取景追出去；停下來以後交回去
    camera: [START, release(3.0), holdWide(4.6, 0.6)],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 0.7, sfx: 'whoosh' },
      { at: 0.9, say: '兔跑了！跑好快！' },
      { at: 1.35, sfx: 'whoosh' },
      { at: 2.1, sfx: 'whoosh' },
      { at: 2.4, sfx: 'slide' },
    ],
  }),

  // 好多豆！豬偵探飛起來了！——豬偵探丟出一把豆，啪啦撒滿地；兔輕輕一跳就跳過去；豬偵探衝過去，一腳踩到豆子，
  // 原地亂踩越踩越快，整個人飛起來翻兩圈、啪地摔扁，豆子全部被震得滾出畫面。兔笑到抱肚子。回到 W3
  'throw:豆': scene({
    duration: 6.6,
    bg: BG,
    ...(() => {
      const BEAN_X = [40, 50, 58, 64, 70, 76, 82, 88]
      const by = 77 - 0.42 * 6
      const HAND = { x: 91, y: 57 }
      const beans = BEAN_X.map((x, i) => ({ id: `b${i}`, emoji: '🫘', ...HAND, size: 6, hidden: true, pivot: 'center' as const, float: true, _x: x }))
      return {
        actors: [
          ...roomAfter,
          bunAt('giggle', 44),
          { id: 'bag', emoji: '🫘', ...HAND, size: 12, hidden: true, float: true, pivot: 'center' as const },
          pigAt('tired', 100),
          ...beans.map(({ _x, ...b }) => b),
        ] as never,
        moves: [
              { at: 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/throw' },
          { at: 0.15, actor: 'bag', do: 'pop', dur: 0.1 },
          { at: 0.3, actor: 'bag', do: 'moveTo', to: { x: 66, y: 66 }, arc: 10, dur: 0.4 },
          { at: 0.3, actor: 'bag', do: 'spin', times: 1, dur: 0.4 },
          { at: 0.7, actor: 'bag', do: 'vanish', dur: 0.05 },
          ...beans.flatMap((b, i): Move[] => [
            { at: 0.7, actor: b.id, do: 'moveTo', to: { x: 66, y: 66 }, dur: 0.01 },
            { at: 0.7, actor: b.id, do: 'pop', dur: 0.1 },
            { at: 0.72, actor: b.id, do: 'moveTo', to: { x: b._x, y: by }, arc: 6 + (i % 3) * 3, dur: 0.35, ease: 'out' },
            { at: 0.72, actor: b.id, do: 'spin', times: i % 2 ? 2 : -2, dur: 0.35 },
          ]),
          { at: 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
          // 兔輕輕跳過去
          { at: 1.0, actor: 'b0', do: 'moveTo', to: { x: 34, y: by }, dur: 0.35 },
          { at: 1.0, actor: 'b1', do: 'moveTo', to: { x: 44, y: by }, dur: 0.35 },
          { at: 0.95, actor: 'bun', do: 'swap', emoji: 'hero:bunny/leap' },
          { at: 0.95, actor: 'bun', do: 'hop', amount: 9, dur: 0.5 },
          { at: 1.5, actor: 'bun', do: 'swap', emoji: 'hero:bunny/giggle' },
          // 衝過去、踩到豆子：原地亂踩，一次比一次大
          { at: 1.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
          { at: 1.5, actor: 'pig', do: 'moveTo', to: { x: 80, y: G }, dur: 0.3, ease: 'in', anticipate: 3 },
          { at: 1.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/slip' },
          ...[1.8, 2.0, 2.2, 2.4].flatMap((t, i): Move[] => [
            { at: t, actor: 'pig', do: 'moveTo', to: { x: 80 + (i % 2 ? 4 : -4) * (1 + i * 0.3), y: G }, dur: 0.2, ease: 'linear' },
            { at: t, actor: 'pig', do: 'hop', amount: 1.5 + i, dur: 0.2 },
            { at: t, actor: 'pig', do: 'tilt', amount: (i % 2 ? 1 : -1) * (6 + i * 4), dur: 0.2 },
          ]),
          // 飛起來：翻兩圈（左右翻面）
          { at: 2.65, actor: 'pig', do: 'moveTo', to: { x: 74, y: 30 }, dur: 0.4, ease: 'out' },
          { at: 2.65, actor: 'pig', do: 'rotateTo', amount: -30, dur: 0.4 },
          { at: 2.75, actor: 'pig', do: 'flip' },
          { at: 2.9, actor: 'pig', do: 'flip' },
          { at: 3.05, actor: 'pig', do: 'flip' },
          { at: 3.2, actor: 'pig', do: 'flip' },
          { at: 3.05, actor: 'pig', do: 'moveTo', to: { x: 70, y: G }, dur: 0.3, ease: 'in' },
          { at: 3.05, actor: 'pig', do: 'rotateTo', amount: 30, dur: 0.3 },
          { at: 3.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
          { at: 3.35, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
          // 豆子全部被震得滾出去
          ...BEAN_X.map((x, i): Move => ({ at: 3.35 + (i % 3) * 0.04, actor: `b${i}`, do: 'moveTo', to: { x: i < 4 ? -12 : 172, y: by - 10 }, arc: 8, dur: 0.6, ease: 'out' })),
          ...BEAN_X.map((_, i): Move => ({ at: 4.05, actor: `b${i}`, do: 'vanish', dur: 0.05 })),
          { at: 3.4, actor: 'bun', do: 'swap', emoji: 'hero:bunny/laugh' },
          { at: 3.45, actor: 'bun', do: 'hop', amount: 4, dur: 0.3 },
          { at: 3.85, actor: 'bun', do: 'hop', amount: 4, dur: 0.3 },
          // 爬起來、暈暈地走回去
          { at: 4.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
          { at: 4.8, actor: 'pig', do: 'flip' },
          { at: 4.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
          { at: 4.85, actor: 'pig', do: 'moveTo', to: { x: 100, y: G }, dur: 0.7 },
          { at: 5.6, actor: 'pig', do: 'flip' },
          { at: 5.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/tired' },
          { at: 5.3, actor: 'bun', do: 'swap', emoji: 'hero:bunny/giggle' },
          { at: 5.9, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.3 },
        ],
        fx: [
          { at: 0.7, kind: 'burst', x: 66, y: 66, emoji: '🫘', n: 6, dur: 0.5 },
          { at: 1.0, kind: 'burst', actor: 'bun', emoji: '✨', n: 5, dy: -4, dur: 0.5 },
          { at: 1.85, kind: 'pop', actor: 'pig', emoji: '❗', dx: 6, dur: 0.5 },
          { at: 2.2, kind: 'sweat', actor: 'pig' },
          { at: 2.65, kind: 'puff', x: 80, y: 74, scale: 1.4, dur: 0.5 },
          { at: 3.35, kind: 'burst', actor: 'pig', n: 1, dy: 14, scale: 1.2, dur: 0.4 },
          { at: 3.35, kind: 'puff', actor: 'pig', scale: 1.6, dur: 0.6 },
          { at: 3.5, kind: 'pop', actor: 'bun', emoji: '😆', dur: 1.2 },
          { at: 4.15, kind: 'dizzy', actor: 'pig', dur: 0.9 },
        ],
        camera: [
          START,
          release(0.5),
          // 飛到天上：自己定成全景，摔下來以後交回去
          { at: 2.5, dur: 0.2, do: 'zoom', amount: 1.05, to: { x: 76, y: 45 } },
          { at: 3.35, dur: 0.35, do: 'shake', amount: 1.8 },
          release(4.0, 0.5),
          holdWide(5.8, 0.6),
        ],
        cues: [
          { at: 0.3, sfx: 'whoosh' },
          { at: 0.7, sfx: 'poof' },
          { at: 0.95, say: '好多豆！豬偵探飛起來了！' },
          { at: 1.8, sfx: 'slide' },
          { at: 2.65, sfx: 'boing' },
          { at: 3.35, sfx: 'bonk' },
          { at: 3.45, sfx: 'cheer' },
        ],
      }
    })(),
  }),

  // 兔吃了糖。兔跑太快了！——豬偵探丟一顆糖，兔一口吃掉，眼睛發亮、全身越抖越兇；然後衝三趟，一趟比一趟誇張：
  // 第一趟在地上衝過去；第二趟反方向、更快，塵土把豬偵探吹得轉半圈；第三趟快到沿著左邊的牆跑上去、從畫面上緣橫越、
  // 再從右邊的牆衝下來，豬偵探被捲得原地打轉、放大鏡飛出去又砸回頭上。回到 W3
  'throw:糖': scene({
    duration: 5.8,
    bg: BG,
    ...(() => {
      const HAND = { x: 91, y: 57 }
      /** 第三趟貼著畫面上緣跑的高度（頭頂剛好在畫面裡） */
      const ROOF = 12
      return {
        actors: [
          ...roomAfter,
          bunAt('giggle', 44),
          pigAt('tired', 100),
          { id: 'candy', emoji: '🍬', ...HAND, size: 9, hidden: true, float: true, pivot: 'center' as const },
          { id: 'lens', emoji: '🔍', x: 100, y: 52, size: 10, hidden: true, float: true, pivot: 'center' as const },
        ] as never,
        moves: [
          { at: 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/throw' },
          { at: 0.15, actor: 'candy', do: 'pop', dur: 0.1 },
          { at: 0.3, actor: 'candy', do: 'moveTo', to: { x: 47, y: 61 }, arc: 12, dur: 0.45 },
          { at: 0.3, actor: 'candy', do: 'spin', times: 2, dur: 0.45 },
          { at: 0.62, actor: 'candy', do: 'scaleTo', amount: 0.35, dur: 0.13 },
          { at: 0.75, actor: 'candy', do: 'vanish', dur: 0.05 },
          { at: 0.75, actor: 'bun', do: 'swap', emoji: 'hero:bunny/eat' },
          { at: 0.75, actor: 'bun', do: 'squash', amount: 0.15, dur: 0.25 },
          { at: 0.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          // 眼睛發亮、越抖越兇（蓄力）
          { at: 1.15, actor: 'bun', do: 'swap', emoji: 'hero:bunny/drool' },
          { at: 1.2, actor: 'bun', do: 'shake', amount: 0.6, dur: 0.3 },
          { at: 1.5, actor: 'bun', do: 'shake', amount: 1.2, dur: 0.3 },
          { at: 1.5, actor: 'bun', do: 'squash', amount: -0.1, dur: 0.3 },
          { at: 1.8, actor: 'bun', do: 'shake', amount: 2, dur: 0.25 },
          { at: 1.8, actor: 'bun', do: 'squash', amount: -0.18, dur: 0.25 },
          { at: 1.8, actor: 'bun', do: 'flash', dur: 0.25 },
          // 第一趟：在地上衝過去
          { at: 2.05, actor: 'bun', do: 'swap', emoji: 'hero:bunny/dash' },
          { at: 2.05, actor: 'bun', do: 'moveTo', to: { x: 150, y: G }, dur: 0.6, ease: 'in', anticipate: 4 },
          { at: 2.45, actor: 'pig', do: 'tilt', amount: 10, dur: 0.3 },
          // 第二趟：反方向、更快；豬偵探被吹得轉半圈
          { at: 2.7, actor: 'bun', do: 'flip' },
          { at: 2.72, actor: 'bun', do: 'moveTo', to: { x: 12, y: G }, dur: 0.4, ease: 'linear' },
          { at: 2.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/scared' },
          { at: 2.85, actor: 'pig', do: 'flip' },
          { at: 2.85, actor: 'pig', do: 'tilt', amount: -16, dur: 0.35 },
          { at: 2.85, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
          // 第三趟：沿著左牆跑上去、從上緣橫越、從右牆衝下來
          { at: 3.12, actor: 'bun', do: 'flip' },
          { at: 3.15, actor: 'bun', do: 'moveTo', to: { x: 8, y: ROOF + 6 }, dur: 0.2, ease: 'in' },
          { at: 3.15, actor: 'bun', do: 'rotateTo', amount: -75, dur: 0.15, pivot: 'center' },
          { at: 3.35, actor: 'bun', do: 'rotateTo', amount: 75, dur: 0.1, pivot: 'center' },
          { at: 3.35, actor: 'bun', do: 'moveTo', to: { x: 150, y: ROOF }, dur: 0.35, ease: 'linear' },
          { at: 3.7, actor: 'bun', do: 'rotateTo', amount: 75, dur: 0.1, pivot: 'center' },
          { at: 3.7, actor: 'bun', do: 'moveTo', to: { x: 152, y: G }, dur: 0.2, ease: 'in' },
          { at: 3.9, actor: 'bun', do: 'rotateTo', amount: -75, dur: 0.08, pivot: 'center' },
          { at: 3.9, actor: 'bun', do: 'flip' },
          { at: 3.92, actor: 'bun', do: 'moveTo', to: { x: 44, y: G }, dur: 0.35, ease: 'back' },
          { at: 4.3, actor: 'bun', do: 'flip' },
          { at: 4.3, actor: 'bun', do: 'swap', emoji: 'hero:bunny/happy' },
          { at: 4.35, actor: 'bun', do: 'hop', amount: 5, dur: 0.35 },
          { at: 4.75, actor: 'bun', do: 'swap', emoji: 'hero:bunny/laugh' },
          { at: 4.8, actor: 'bun', do: 'hop', amount: 3, dur: 0.3 },
          { at: 5.2, actor: 'bun', do: 'swap', emoji: 'hero:bunny/giggle' },
          // 豬偵探被捲得原地打轉（左右翻面越來越快，翻偶數次回到原本的方向）
          ...[3.3, 3.42, 3.52, 3.6, 3.68, 3.76, 3.84, 3.92, 4.0].map((t): Move => ({ at: t, actor: 'pig', do: 'flip' })),
          { at: 3.3, actor: 'pig', do: 'tilt', amount: 12, dur: 0.25 },
          { at: 3.6, actor: 'pig', do: 'tilt', amount: -14, dur: 0.25 },
          { at: 3.85, actor: 'pig', do: 'tilt', amount: 16, dur: 0.25 },
          { at: 4.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
          // 放大鏡飛出去，又砸回頭上
          { at: 3.4, actor: 'lens', do: 'pop', dur: 0.05 },
          { at: 3.4, actor: 'lens', do: 'moveTo', to: { x: 118, y: 30 }, dur: 0.45, ease: 'out' },
          { at: 3.4, actor: 'lens', do: 'spin', times: 3, dur: 0.95 },
          { at: 3.85, actor: 'lens', do: 'moveTo', to: { x: 101, y: 54 }, dur: 0.4, ease: 'in' },
          { at: 4.25, actor: 'pig', do: 'squash', amount: 0.25, dur: 0.25 },
          { at: 4.25, actor: 'lens', do: 'hop', amount: 4, dur: 0.3 },
          { at: 4.55, actor: 'lens', do: 'moveTo', to: { x: 104, y: 68 }, dur: 0.2, ease: 'in' },
          { at: 4.75, actor: 'lens', do: 'vanish', dur: 0.15 },
          { at: 4.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/tired' },
          { at: 4.9, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.3 },
          { at: 5.3, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.3 },
        ],
        fx: [
          { at: 0.8, kind: 'pop', actor: 'bun', emoji: '😋', dur: 0.4 },
          { at: 1.2, kind: 'burst', actor: 'bun', emoji: '✨', n: 6, dy: -6, dur: 0.5 },
          { at: 1.8, kind: 'burst', actor: 'bun', emoji: '⚡', n: 6, dy: -6, scale: 1.2, dur: 0.35 },
          { at: 2.1, kind: 'puff', x: 44, y: 74, dur: 0.4 },
          { at: 2.7, kind: 'puff', x: 150, y: 74, scale: 1.4, dur: 0.45 },
          { at: 2.85, kind: 'blow', x: 120, y: 62, to: { x: 84, y: 60 }, n: 4, scale: 1.3, dur: 0.4 },
          { at: 3.12, kind: 'puff', x: 12, y: 74, scale: 1.8, dur: 0.5 },
          { at: 3.4, kind: 'burst', actor: 'pig', emoji: '💨', n: 7, dy: 6, scale: 1.4, dur: 0.6 },
          { at: 3.9, kind: 'puff', x: 152, y: 74, scale: 2.1, dur: 0.5 },
          { at: 4.25, kind: 'burst', actor: 'pig', n: 1, dy: -2, scale: 0.7, dur: 0.3 },
          { at: 4.25, kind: 'puff', x: 44, y: 74, scale: 2.2, dur: 0.5 },
          { at: 4.3, kind: 'dizzy', actor: 'pig', dur: 0.8 },
          { at: 4.8, kind: 'pop', actor: 'bun', emoji: '😆', dur: 0.8 },
        ],
        // 衝刺：要看到整面牆跟天花板，定成全景到結尾（W3）
        camera: [
          START,
          release(0.5),
          holdWide(1.9, 0.2),
          { at: 2.7, dur: 0.2, do: 'shake', amount: 0.6 },
          { at: 3.12, dur: 0.2, do: 'shake', amount: 1.0 },
          { at: 3.9, dur: 0.3, do: 'shake', amount: 1.6 },
        ],
        cues: [
          { at: 0.3, sfx: 'whoosh' },
          { at: 0.75, sfx: 'gulp' },
          { at: 1.5, sfx: 'rumble' },
          { at: 1.6, say: '兔吃了糖。兔跑太快了！' },
          { at: 2.05, sfx: 'whoosh' },
          { at: 2.72, sfx: 'whoosh' },
          { at: 3.15, sfx: 'whoosh' },
          { at: 3.7, sfx: 'whoosh' },
          { at: 4.25, sfx: 'bonk' },
        ],
      }
    })(),
  }),

  // 兔看到菜，不跑了！——豬偵探把一棵菜丟過兔的頭頂，落在兔後面；兔正要往左逃，急煞車、眼睛發亮，抱著菜一口一口啃；
  // 豬偵探踮著腳從後面溜過去，一把舉起來：剩下的菜跟著飛上去又掉下來滾走，兔在上面手腳亂踢、哭著伸手要菜，
  // 豬偵探得意地轉身展示、點頭。結尾 W4：豬偵探舉著哭哭的兔
  'throw:菜': scene({
    duration: 6.6,
    bg: BG,
    ...(() => {
      const HAND = { x: 91, y: 57 }
      const VEG = { x: 22, y: 77 - 0.42 * 16 }
      return {
        actors: [
          ...roomAfter,
          { id: 'veg', emoji: 'prop:bokchoy', ...HAND, size: 16, hidden: true, pivot: 'center' as const },
          bunAt('giggle', 44),
          pigAt('tired', 100),
        ] as never,
        moves: [
              { at: 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/throw' },
          { at: 0.15, actor: 'veg', do: 'pop', dur: 0.1 },
          { at: 0.3, actor: 'veg', do: 'moveTo', to: VEG, arc: 30, dur: 0.6 },
          { at: 0.3, actor: 'veg', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
          // 兔要逃：轉身衝
          { at: 0.25, actor: 'bun', do: 'flip' },
          { at: 0.25, actor: 'bun', do: 'swap', emoji: 'hero:bunny/dash' },
          { at: 0.4, actor: 'bun', do: 'moveTo', to: { x: 36, y: G }, dur: 0.4, ease: 'in', anticipate: 3 },
          // 急煞車
          { at: 0.9, actor: 'bun', do: 'swap', emoji: 'hero:bunny/drool' },
          { at: 0.9, actor: 'bun', do: 'moveTo', to: { x: 38, y: G }, dur: 0.25, ease: 'back' },
          { at: 0.95, actor: 'bun', do: 'hop', amount: 5, dur: 0.35 },
          { at: 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          // 抱著菜啃，一口一口變小
          { at: 1.7, actor: 'bun', do: 'swap', emoji: 'hero:bunny/hug' },
          { at: 1.7, actor: 'bun', do: 'moveTo', to: { x: 32, y: G }, dur: 0.3 },
          ...[2.1, 2.5, 2.9].flatMap((t): Move[] => [
            { at: t, actor: 'bun', do: 'swap', emoji: 'hero:bunny/eat' },
            { at: t, actor: 'bun', do: 'squash', amount: 0.12, dur: 0.2 },
            { at: t, actor: 'veg', do: 'scaleTo', amount: 0.8, dur: 0.1 },
            { at: t, actor: 'veg', do: 'shake', amount: 0.6, dur: 0.2 },
          ]),
          // 豬偵探踮腳溜過去
          { at: 1.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/sneak' },
          ...[1.6, 1.95, 2.3, 2.65, 3.0].map((t, i): Move => ({ at: t, actor: 'pig', do: 'moveTo', to: { x: 100 - (i + 1) * 9, y: G }, dur: 0.3, ease: 'inOut' })),
          ...[1.6, 1.95, 2.3, 2.65, 3.0].map((t): Move => ({ at: t, actor: 'pig', do: 'hop', amount: 2.5, dur: 0.3 })),
          // 一把抓起來
          { at: 3.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
          { at: 3.45, actor: 'pig', do: 'moveTo', to: { x: 62, y: G }, dur: 0.2 },
          { at: 3.5, actor: 'bun', do: 'swap', emoji: 'hero:bunny/surprised' },
          { at: 3.5, actor: 'bun', do: 'moveTo', to: { x: 62, y: on(54.5) }, arc: 6, dur: 0.35, ease: 'out' },
          // 剩下的菜跟著飛上去，掉下來彈一下、滾出門外
          { at: 3.5, actor: 'veg', do: 'moveTo', to: { x: 48, y: 46 }, arc: 4, dur: 0.3, ease: 'out' },
          { at: 3.8, actor: 'veg', do: 'moveTo', to: { x: 40, y: VEG.y }, dur: 0.3, ease: 'in' },
          { at: 4.1, actor: 'veg', do: 'hop', amount: 3, dur: 0.25 },
          { at: 4.35, actor: 'veg', do: 'moveTo', to: { x: -14, y: VEG.y }, dur: 0.8, ease: 'in' },
          { at: 4.35, actor: 'veg', do: 'rotateTo', amount: -540, dur: 0.8 },
          { at: 5.15, actor: 'veg', do: 'vanish', dur: 0.05 },
          // 兔在上面手腳亂踢、哭著要菜
          { at: 3.9, actor: 'bun', do: 'swap', emoji: 'hero:bunny/kick' },
          { at: 3.9, actor: 'bun', do: 'tilt', amount: 12, dur: 0.25 },
          { at: 4.15, actor: 'bun', do: 'swap', emoji: 'hero:bunny/cry' },
          { at: 4.15, actor: 'bun', do: 'tilt', amount: -12, dur: 0.25 },
          { at: 4.4, actor: 'bun', do: 'swap', emoji: 'hero:bunny/kick' },
          { at: 4.4, actor: 'bun', do: 'tilt', amount: 15, dur: 0.25 },
          { at: 4.65, actor: 'bun', do: 'swap', emoji: 'hero:bunny/cry' },
          { at: 4.65, actor: 'bun', do: 'shake', amount: 1, dur: 0.4 },
          // 豬偵探得意：轉身展示（連兔一起轉）、點頭
          { at: 3.95, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.25 },
          { at: 4.9, actor: 'pig', do: 'flip' },
          { at: 4.9, actor: 'bun', do: 'flip' },
          { at: 5.05, actor: 'pig', do: 'hop', amount: 2, dur: 0.3 },
          { at: 5.05, actor: 'bun', do: 'hop', amount: 2, dur: 0.3 },
          { at: 5.45, actor: 'pig', do: 'flip' },
          { at: 5.45, actor: 'bun', do: 'flip' },
          { at: 5.65, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.2 },
          { at: 5.95, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.2 },
          { at: 5.7, actor: 'bun', do: 'shake', amount: 0.8, dur: 0.4 },
          { at: 6.2, actor: 'bun', do: 'tilt', amount: -6, dur: 0.3 },
        ],
        fx: [
          { at: 0.9, kind: 'burst', actor: 'veg', emoji: '✨', n: 6, dy: 2, dur: 0.6 },
          { at: 1.0, kind: 'burst', actor: 'bun', emoji: '💕', n: 7, dy: -4, dur: 0.9 },
          { at: 1.0, kind: 'puff', actor: 'bun', scale: 1.3, dur: 0.4 },
          ...[2.1, 2.5, 2.9].map((t): Fx => ({ at: t, kind: 'burst', actor: 'veg', emoji: '🍃', n: 4, dy: 4, scale: 0.7, dur: 0.4 })),
          { at: 1.7, kind: 'pop', actor: 'pig', emoji: '🤫', dur: 1.0 },
          { at: 3.5, kind: 'burst', actor: 'bun', emoji: '💥', n: 1, dy: -6, dur: 0.3 },
          { at: 4.2, kind: 'burst', actor: 'bun', emoji: '💧', n: 5, dy: 6, dur: 0.6 },
          { at: 4.7, kind: 'bubble', actor: 'bun', emoji: '🥬', dx: -20, dy: 20, dur: 0.9 },
          { at: 5.05, kind: 'burst', x: 84, y: 60, emoji: '⭐', n: 5, dur: 0.7 },
          { at: 5.65, kind: 'pop', actor: 'pig', emoji: '😤', dx: 16, dy: 10, dur: 0.8 },
        ],
        camera: [START, release(0.5), holdWide(5.8, 0.6)],
        cues: [
          { at: 0.3, sfx: 'whoosh' },
          { at: 0.9, sfx: 'slide' },
          { at: 1.0, say: '兔看到菜，不跑了！' },
          { at: 2.1, sfx: 'gulp' },
          { at: 2.5, sfx: 'gulp' },
          { at: 2.9, sfx: 'gulp' },
          { at: 3.5, sfx: 'boing' },
          { at: 3.95, sfx: 'cheer' },
          { at: 4.1, sfx: 'plop' },
          { at: 5.05, sfx: 'boing' },
        ],
      }
    })(),
  }),

  // 兔說對不起！——豬偵探把兔放下來、抱胸瞪他；兔大哭，從背後拿出最後一顆包子放在地上，鞠躬一次比一次低，
  // 第三次咚一聲頭撞到地板；豬偵探點點頭，摸摸他的頭。結尾 W5：兔鞠躬，包子在他面前，豬偵探在旁邊
  sorry: scene({
    duration: 6.4,
    bg: BG,
    ...(() => {
      const BX = 42
      const BAO = { x: 55, y: 77 - 0.42 * 7 }
      return {
        actors: [
          ...roomAfter,
          { id: 'gift', emoji: 'prop:bao', x: BX - 7, y: 66, size: 7, hidden: true, float: true, pivot: 'center' as const },
          { id: 'bun', emoji: 'hero:bunny/cry', x: 62, y: on(54.5), size: S },
          pigAt('lift', 62),
        ] as never,
        moves: [
              // 放下來
          { at: 0.1, actor: 'bun', do: 'moveTo', to: { x: BX, y: G }, arc: 6, dur: 0.45 },
          { at: 0.1, actor: 'bun', do: 'flip' },
          { at: 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
          { at: 0.4, actor: 'pig', do: 'moveTo', to: { x: 68, y: G }, dur: 0.3 },
          { at: 0.6, actor: 'bun', do: 'swap', emoji: 'hero:bunny/cry' },
          { at: 0.65, actor: 'bun', do: 'shake', amount: 1, dur: 0.5 },
          // 從背後拿出最後一顆包子，放在地上
          { at: 1.25, actor: 'gift', do: 'pop', dur: 0.15 },
          { at: 1.25, actor: 'bun', do: 'swap', emoji: 'hero:bunny/reach' },
          { at: 1.3, actor: 'gift', do: 'moveTo', to: { x: BX + 11, y: 62 }, arc: 6, dur: 0.3 },
          { at: 1.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          { at: 1.9, actor: 'gift', do: 'moveTo', to: { x: BAO.x, y: 77 - 0.46 * 7 * castScale(7) }, dur: 0.3 },
          // 鞠躬一次比一次低
          { at: 1.9, actor: 'bun', do: 'swap', emoji: 'hero:bunny/bow' },
          { at: 2.45, actor: 'bun', do: 'swap', emoji: 'hero:bunny/cry' },
          { at: 2.7, actor: 'bun', do: 'swap', emoji: 'hero:bunny/bow' },
          { at: 2.7, actor: 'bun', do: 'rotateTo', amount: 22, dur: 0.2, pivot: 'feet' },
          { at: 3.2, actor: 'bun', do: 'rotateTo', amount: -22, dur: 0.2, pivot: 'feet' },
          { at: 3.2, actor: 'bun', do: 'swap', emoji: 'hero:bunny/cry' },
          // 第三次：用力一鞠躬，整個人撲到地上（臉朝下），咚！
          { at: 3.55, actor: 'bun', do: 'swap', emoji: 'hero:bunny/bow' },
          { at: 3.55, actor: 'bun', do: 'rotateTo', amount: 30, dur: 0.15, ease: 'in', pivot: 'feet' },
          { at: 3.7, actor: 'bun', do: 'rotateTo', amount: -30, dur: 0.01 },
          { at: 3.7, actor: 'bun', do: 'swap', emoji: 'hero:bunny/flat' },
          { at: 3.7, actor: 'bun', do: 'squash', amount: 0.25, dur: 0.25 },
          { at: 3.95, actor: 'bun', do: 'shake', amount: 0.6, dur: 0.3 },
          { at: 4.3, actor: 'bun', do: 'swap', emoji: 'hero:bunny/bow' },
          { at: 2.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
          { at: 2.0, actor: 'pig', do: 'moveTo', to: { x: 76, y: G }, dur: 0.3 },
          { at: 3.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          { at: 3.75, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
          // 點頭，摸摸頭
          { at: 4.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
          { at: 4.35, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.2 },
          { at: 4.6, actor: 'pig', do: 'squash', amount: 0.1, dur: 0.2 },
          { at: 4.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
          { at: 4.9, actor: 'pig', do: 'moveTo', to: { x: 63, y: G }, dur: 0.3 },
          { at: 5.2, actor: 'bun', do: 'squash', amount: 0.08, dur: 0.2 },
          { at: 5.45, actor: 'bun', do: 'squash', amount: 0.08, dur: 0.2 },
          { at: 5.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
          { at: 5.8, actor: 'pig', do: 'moveTo', to: { x: 68, y: G }, dur: 0.3 },
        ],
        fx: [
          { at: 0.7, kind: 'burst', actor: 'bun', emoji: '💧', n: 5, dy: 4, dur: 0.6 },
          { at: 1.4, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.4 },
          { at: 3.7, kind: 'burst', x: BX + 12, y: 70, n: 1, scale: 0.8, dur: 0.35 },
          { at: 3.8, kind: 'dizzy', actor: 'bun', dy: 4, dur: 0.6 },
          { at: 5.2, kind: 'burst', x: 50, y: 44, emoji: '💗', n: 5, dur: 0.8 },
        ],
        camera: [START, release(0.5), holdWide(5.6, 0.6)],
        cues: [
          { at: 1.25, sfx: 'poof' },
          { at: 1.9, say: '兔說對不起！' },
          { at: 3.7, sfx: 'bonk' },
          { at: 5.2, sfx: 'tap' },
          { at: 5.45, sfx: 'tap' },
        ],
      }
    })(),
  }),

  // 看！豬偵探也在偷吃！——豬偵探盯著地上的包子流口水，左右偷瞄兩下（兔還在鞠躬），撿起包子舉到嘴邊、停一拍，一口塞進去，
  // 臉頰鼓起來嚼兩下；放大鏡從口袋掉出來，兔抬頭撿起來照他的臉頰：鏡片裡一顆包子！豬偵探冒汗、眼神飄走。兩個大笑
  end: scene({
    duration: 7.8,
    bg: BG,
    ...(() => {
      const BX = 42
      const GIFT = { x: 55, y: 77 - 0.46 * 7 * castScale(7) }
      const PX = 68
      /** 豬偵探 reach 的手、張大的嘴 */
      const HAND = { x: PX - 12, y: 63 }
      const MOUTH = { x: PX - 4, y: 61 }
      /** 兔舉著放大鏡照豬偵探的臉頰：鏡片中心 */
      const LENS = { x: 61, y: 61 }
      const GLASS = { x: 59.5, y: 54.5 }
      return {
        actors: [
          ...roomAfter,
          { id: 'gift', emoji: 'prop:bao', ...GIFT, size: 7, float: true, pivot: 'center' as const },
          bunAt('bow', BX),
          pigAt('smug', PX),
          { id: 'lens', emoji: '🔍', x: PX - 2, y: 68, size: 7, hidden: true, float: true, pivot: 'center' as const },
          { id: 'seen', emoji: 'prop:bao', ...GLASS, size: 5, hidden: true, float: true },
          { id: 'bit', emoji: 'prop:bao', x: MOUTH.x - 2, y: MOUTH.y + 2.5, size: 3, hidden: true, float: true },
        ] as never,
        moves: [
          { at: 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
          { at: 0.25, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
          { at: 0.3, actor: 'bun', do: 'shake', amount: 0.5, dur: 0.5 },
          // 左右偷瞄兩下：兔還在鞠躬
          { at: 0.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/sneak' },
          { at: 1.05, actor: 'pig', do: 'flip' },
          { at: 1.05, actor: 'pig', do: 'tilt', amount: 6, dur: 0.3 },
          { at: 1.4, actor: 'pig', do: 'flip' },
          { at: 1.4, actor: 'pig', do: 'tilt', amount: -6, dur: 0.3 },
          { at: 1.7, actor: 'pig', do: 'flip' },
          { at: 1.7, actor: 'pig', do: 'tilt', amount: 6, dur: 0.25 },
          { at: 1.95, actor: 'pig', do: 'flip' },
          { at: 1.5, actor: 'bun', do: 'squash', amount: 0.06, dur: 0.3 },
          // 撿起來：地上 → 手邊 → 嘴邊，停一拍
          { at: 2.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
          { at: 2.3, actor: 'gift', do: 'moveTo', to: HAND, dur: 0.35, ease: 'out' },
          { at: 2.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
          { at: 2.8, actor: 'gift', do: 'moveTo', to: MOUTH, arc: 3, dur: 0.3 },
          { at: 3.1, actor: 'gift', do: 'hop', amount: 1, dur: 0.3 },
          { at: 3.1, actor: 'pig', do: 'squash', amount: -0.1, dur: 0.3 },
          // 一口塞進去：變小、不見、臉頰鼓起來嚼兩下
          { at: 3.45, actor: 'gift', do: 'scaleTo', amount: 0.3, dur: 0.12 },
          { at: 3.57, actor: 'gift', do: 'vanish', dur: 0.05 },
          { at: 3.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/blow' },
          { at: 3.55, actor: 'pig', do: 'stretchTo', amount: 1.12, dur: 0.15, ease: 'back' },
          { at: 3.6, actor: 'bit', do: 'pop', dur: 0.1 },
          { at: 3.85, actor: 'pig', do: 'squash', amount: 0.12, dur: 0.2 },
          { at: 4.15, actor: 'pig', do: 'squash', amount: 0.12, dur: 0.2 },
          // 放大鏡從口袋掉出來
          { at: 3.6, actor: 'lens', do: 'pop', dur: 0.05 },
          { at: 3.6, actor: 'lens', do: 'moveTo', to: { x: 55, y: 73 }, arc: 4, dur: 0.35, ease: 'in' },
          { at: 3.6, actor: 'lens', do: 'rotateTo', amount: -90, dur: 0.35 },
          // 兔抬頭、撿起來照他：鏡片裡一顆包子
          { at: 4.1, actor: 'bun', do: 'swap', emoji: 'hero:bunny/surprised' },
          { at: 4.1, actor: 'bun', do: 'hop', amount: 3, dur: 0.3 },
          { at: 4.45, actor: 'bun', do: 'swap', emoji: 'hero:bunny/reach' },
          { at: 4.45, actor: 'bun', do: 'moveTo', to: { x: BX + 5, y: G }, dur: 0.25 },
          { at: 4.45, actor: 'lens', do: 'moveTo', to: LENS, dur: 0.25 },
          { at: 4.45, actor: 'lens', do: 'rotateTo', amount: 90, dur: 0.25 },
          { at: 4.7, actor: 'lens', do: 'scaleTo', amount: 1.8, dur: 0.2, ease: 'back' },
          { at: 4.85, actor: 'seen', do: 'pop', dur: 0.25 },
          { at: 5.3, actor: 'seen', do: 'squash', amount: -0.15, dur: 0.3 },
          { at: 5.9, actor: 'seen', do: 'squash', amount: -0.15, dur: 0.3 },
          // 冒汗、眼神飄走
          { at: 5.0, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.4 },
          { at: 5.45, actor: 'pig', do: 'tilt', amount: -10, dur: 0.4 },
          { at: 5.9, actor: 'pig', do: 'tilt', amount: 10, dur: 0.4 },
          // 兩個大笑
          { at: 6.35, actor: 'seen', do: 'vanish', dur: 0.15 },
          { at: 6.35, actor: 'lens', do: 'vanish', dur: 0.15 },
          { at: 6.35, actor: 'bit', do: 'vanish', dur: 0.1 },
          { at: 6.35, actor: 'pig', do: 'stretchTo', amount: 1 / 1.12, dur: 0.15 },
          { at: 6.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
          { at: 6.35, actor: 'bun', do: 'swap', emoji: 'hero:bunny/laugh' },
          { at: 6.35, actor: 'bun', do: 'moveTo', to: { x: BX, y: G }, dur: 0.3 },
          { at: 6.45, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
          { at: 6.6, actor: 'bun', do: 'hop', amount: 4, dur: 0.35 },
          { at: 6.95, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
          { at: 7.1, actor: 'bun', do: 'hop', amount: 4, dur: 0.35 },
          { at: 7.45, actor: 'pig', do: 'tilt', amount: 8, dur: 0.3 },
          { at: 7.45, actor: 'bun', do: 'tilt', amount: -8, dur: 0.3 },
        ],
        fx: [
          { at: 0.3, kind: 'pop', actor: 'pig', emoji: '🤤', dur: 0.6 },
          { at: 1.05, kind: 'pop', actor: 'pig', emoji: '🤫', dur: 1.0 },
          { at: 1.6, kind: 'sweat', actor: 'pig' },
          { at: 3.1, kind: 'burst', actor: 'gift', emoji: '✨', n: 4, scale: 0.6, dur: 0.4 },
          { at: 4.15, kind: 'pop', actor: 'bun', emoji: '❗', dur: 0.5 },
          { at: 4.9, kind: 'sweat', actor: 'pig' },
          { at: 5.5, kind: 'sweat', actor: 'pig', dx: 4 },
          { at: 6.4, kind: 'burst', x: 56, y: 40, emoji: '😆', n: 6, dur: 1.0 },
        ],
        // 照到的那一刻：鏡頭推到放大鏡（鏡片裡的包子）跟鼓鼓的臉頰；大笑時退一點，定住兩個人
        camera: [START, release(0.5), { at: 4.6, dur: 0.35, do: 'zoom', amount: 1.6, to: { x: 60, y: 57 } }, { at: 6.3, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 58, y: 56 } }],
        cues: [
          { at: 2.3, sfx: 'tap' },
          { at: 3.45, sfx: 'gulp' },
          { at: 3.85, sfx: 'gulp' },
          { at: 3.95, sfx: 'plop' },
          { at: 4.15, sfx: 'gulp' },
          { at: 4.85, sfx: 'blip' },
          { at: 4.95, say: '看！豬偵探也在偷吃！' },
          { at: 6.35, sfx: 'cheer' },
        ],
      }
    })(),
  }),
}

export default scenes
