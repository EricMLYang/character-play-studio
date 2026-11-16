import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 拍（v2）：一隻蚊子嗡嗡嗡停在小機器人面前。一板一眼的小機器人兩手張得開開的，「啪！」用力一拍——
// 蚊子早就飛走了，可是這一拍拍出一圈震波，把右邊的大向日葵震到，一次比一次大力：
// 向日葵被震得往後一歪（扌從他的手飛出來）→ 整棵被震彎、葉子噴飛（白從那團白白的震波裡飛出來）→
// 先停一拍：蚊子又停回來，他看一眼、手張得更開、全身抖著蓄力⋯⋯啪！向日葵連根被震飛出畫面，他自己也被震得滑到後面（白的最後兩橫）。
// 語詞那一刻他走到中間，開開心心地拍拍手：「拍手」。
// 回馬槍（第四次）：蚊子停在他頭頂上。他得意地閉眼、手舉過頭——啪！一拍拍在自己頭上，最大的震波，把自己拍扁在地上，蚊子飛走了。
// 最後畫面暗下來只剩「拍」，小機器人站起來問「這是什麼字？」，手放耳邊等他回答，再指著字說「拍！」，然後退場只留字。
// 刻意不跟「不」（大紅叉把東西震飛）、「獅」（吼聲的風把人和樹吹走）撞：這支的震波一定是兩手「啪」地一拍拍出來的，大大的 👏 在畫面中間。
// 拍、拍、拍手、這是什麼字？、拍

/** 小機器人（左邊，flip 朝右；前三次都站在同一個地方拍） */
const BS = 36
const BY = 77 - 0.42 * BS
const BX = 56
/** 第三次被自己震到滑去的地方（國字回到正中央時不擋字） */
const BACK = 26
/** 語詞那一刻與回馬槍他站的地方（畫面正中間） */
const MID = 80
/** 拍的那一下兩隻手合起來的地方（push 那張雙手往前伸） */
const HAND: Vec = { x: BX + 15, y: 58 }
/** 蚊子停的地方：他手的正前方 */
const MZ: Vec = { x: HAND.x + 1, y: 55 }
const MS = 12
/** 向日葵：右邊、比他高一點 */
const FS = 40
const FY = 77 - 0.42 * FS
const FX = 124
/** 震波的顏色：白的部件色（白白的一圈風），在淺色天空上也看得到 */
const WAVE = partColor('白')
/** 每一拍前把手張開停多久（預備） */
const WIND = 0.35

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 震波：從 o 往外一圈一圈擴散出去（每一圈晚一點出現），n 圈。每一圈是 16 截粗線圍成的扁橢圓，
 * 上下最多 h，才不會掃到上面的字框。base 是 line 的錨點角色那時候的位置。
 */
function rings(at: number, who: string, base: Vec, o: Vec, n: number, width: number, step: number, h: number): Fx[] {
  const out: Fx[] = []
  const N = 16
  for (let i = 0; i < n; i++) {
    const r = 7 + step * i
    const ry = Math.min(0.6 * r, h)
    const pts = Array.from({ length: N + 1 }, (_, j) => {
      const a = (2 * Math.PI * j) / N
      return { x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * ry }
    })
    for (let j = 0; j < N; j++) {
      out.push({ at: at + 0.04 * i, dur: 0.22, kind: 'line', actor: who, dx: pts[j].x - base.x, dy: pts[j].y - base.y,
        to: pts[j + 1], color: WAVE, width })
    }
  }
  return out
}

/**
 * 同一個笑點：兩手張得開開的（hug，停 wind 秒）→「啪！」換成雙手往前合起來（push）：
 * 大大的 👏 在手上、一圈一圈震波、鏡頭推一下＋震、同一個「啪」聲（一次多疊一個音），蚊子在拍下去的前一刻咻地飛走 →
 * 他傻眼看著空空的手。at 是拍下去那一刻，k 是第幾次（0～3），o 是手合起來的地方，pose 是拍的那張姿勢，x 是他站的地方。
 * 震到什麼東西、蚊子飛去哪，由呼叫的人寫。
 */
function clap(at: number, k: number, o: Vec = HAND, pose = 'push', x = BX, wind = WIND): Gag {
  const moves: Move[] = [
    { at: at - wind, actor: 'bot', do: 'swap', emoji: 'hero:bot/hug' },
    { at: at - wind, actor: 'bot', do: 'squash', amount: -0.1 - 0.03 * k, dur: wind },
    { at, actor: 'bot', do: 'swap', emoji: `hero:bot/${pose}` },
    { at, actor: 'bot', do: 'squash', amount: 0.2 + 0.05 * k, dur: 0.25 },
  ]
  if (k < 3) moves.push({ at: at + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' })
  const base = { x, y: BY }
  const fx: Fx[] = [
    // 👏 每次都在手合起來的地方，一次比一次大
    { at, kind: 'burst', x: o.x, y: o.y, emoji: '👏', n: 1, dur: 0.5, scale: k < 3 ? 1.5 + 0.35 * k : 2.3 },
    // 第 4 次在他頭頂、離字框近：圈壓得扁一點，不掃到上面的國字
    ...rings(at, 'bot', base, o, 3 + k, 1.3 + 0.35 * k, 9 + 3 * k, k < 3 ? 14 + k : 9),
  ]
  const camera: Camera[] = [
    // 推近對著手和右邊被震的東西中間（第 4 次對著他自己），他才不會被推出畫面左邊
    { at, dur: 0.4, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: k < 3 ? 84 : o.x, y: k < 3 ? o.y + 2 : o.y - 6 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 白光：一次比一次亮
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.15 - 0.1 * k },
    { at: at + 0.04, dur: 0.25, level: 0 },
  ]
  // 同一個「啪」，一次比一次多疊一個音
  const cues: Cue[] = [{ at, sfx: 'crack' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights }
}

/** 蚊子嗡嗡飛回來停在 to：繞一個小彎（float 不畫影子） */
const buzzIn = (at: number, to: Vec, dur = 0.4): Move[] => [
  { at, actor: 'mos', do: 'moveTo', to, arc: 5, dur, ease: 'inOut' },
  { at: at + dur, actor: 'mos', do: 'shake', amount: 0.6, dur: 0.3 },
]
/** 蚊子在拍下去之前一刻咻地飛走 */
const escape = (at: number, to: Vec): Move => ({ at: at - 0.08, actor: 'mos', do: 'moveTo', to, dur: 0.22, ease: 'out' })

const H1 = 2.1, H2 = 3.85, H3 = 6.1, H4 = 10.0
const g1 = clap(H1, 0)
const g2 = clap(H2, 1)
// 第三次：先停一拍，手張得特別久、全身抖著蓄力
const g3 = clap(H3, 2, HAND, 'push', BX, 0.75)
// 回馬槍：蚊子停在他頭頂，他手舉過頭（jump 那張雙手往上）拍在自己頭上
const TOP: Vec = { x: MID, y: BY - 13 }
const g4 = clap(H4, 3, TOP, 'jump', MID, 0.4)

const WORD = 8.6

const clip: Clip = {
  format: 2,
  char: '拍',
  meta: { theme: '小機器人拍蚊子', cast: '小機器人＋蚊子＋向日葵', gags: ['小機器人每次兩手啪地一拍要拍蚊子，蚊子都飛走了，拍出的震波一次比一次大力：向日葵被震歪、震彎、連根震飛；回馬槍是蚊子停在他頭頂，他一拍拍在自己頭上，把自己拍扁'] },
  duration: 15,
  bg: { top: '#D9F0FF', bottom: '#F4FBFF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'flower', emoji: '🌻', x: FX, y: FY, size: FS },
    { id: 'bot', emoji: 'hero:bot/idle', x: BX, y: BY, size: BS, flip: true, hidden: true },
    { id: 'mos', emoji: '🦟', x: 170, y: 30, size: MS, float: true },
  ],
  moves: [
    // 登場：走進來、抬頭看字框
    { at: 0, actor: 'bot', do: 'enter', from: { x: -25, y: BY }, dur: 0.55, ease: 'out' },
    { at: 0.65, actor: 'bot', do: 'tilt', amount: -8, dur: 0.4 },
    // 蚊子嗡嗡嗡飛進來，停在他手前面
    { at: 0.6, actor: 'mos', do: 'moveTo', to: { x: 108, y: 46 }, arc: 6, dur: 0.45 },
    ...buzzIn(1.05, MZ, 0.35),
    { at: 1.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    // 第 1 次：啪！蚊子飛走，向日葵被震得往後一歪
    ...g1.moves,
    escape(H1, { x: 96, y: 44 }),
    { at: H1 + 0.08, actor: 'flower', do: 'tilt', amount: 24, dur: 0.5 },
    { at: H1 + 0.75, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    ...buzzIn(2.75, MZ),
    // 第 2 次：更大力——向日葵整棵被震彎、葉子噴飛
    ...g2.moves,
    escape(H2, { x: 100, y: 42 }),
    { at: H2 + 0.08, actor: 'flower', do: 'tilt', amount: 42, dur: 0.75 },
    { at: H2 + 0.1, actor: 'flower', do: 'shake', amount: 1, dur: 0.6 },
    { at: H2 + 0.8, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 第 3 次前停一拍：蚊子又停回來，他看一眼（👀），手張得特別開、全身抖著蓄力，向日葵也跟著發抖
    ...buzzIn(4.75, MZ),
    ...g3.moves,
    { at: H3 - 0.7, actor: 'bot', do: 'shake', amount: 0.7, dur: 0.65 },
    { at: H3 - 0.5, actor: 'flower', do: 'shake', amount: 0.8, dur: 0.45 },
    escape(H3, { x: 104, y: 46 }),
    // 啪！向日葵連根被震飛出畫面，他自己也被震得往後滑
    { at: H3 + 0.06, actor: 'flower', do: 'moveTo', to: { x: 205, y: 10 }, dur: 0.5, ease: 'out' },
    { at: H3 + 0.06, actor: 'flower', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: H3 + 0.1, actor: 'bot', do: 'moveTo', to: { x: BACK, y: BY }, dur: 0.35, ease: 'out' },
    { at: H3 + 0.6, actor: 'mos', do: 'moveTo', to: { x: 128, y: 52 }, arc: 4, dur: 0.4 },
    // 字框填滿（國字 home 到正中央），他看傻了
    { at: 7.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 語詞那一刻：國字讓回上方，他走到正中間，開開心心地拍拍手
    { at: 8.0, actor: 'bot', do: 'moveTo', to: { x: MID, y: BY }, dur: 0.45 },
    { at: WORD - 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/hug' },
    { at: WORD, actor: 'bot', do: 'swap', emoji: 'hero:bot/push' },
    { at: WORD + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/hug' },
    { at: WORD + 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/push' },
    { at: WORD + 0.75, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: WORD + 0.75, actor: 'bot', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍（第 4 次）：蚊子停到他頭頂。他抬頭看、得意地閉眼、手舉過頭——啪！拍在自己頭上，把自己拍扁
    ...buzzIn(9.1, TOP, 0.35),
    { at: 9.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: 9.5, actor: 'bot', do: 'swap', emoji: 'hero:bot/smug' },
    ...g4.moves,
    escape(H4, { x: 118, y: 40 }),
    { at: H4 + 0.12, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
    { at: H4 + 0.4, actor: 'mos', do: 'moveTo', to: { x: 200, y: 20 }, arc: 6, dur: 0.45, ease: 'in' },
    // 問他：起來、變大、走到左前方
    { at: 10.75, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: 10.8, actor: 'bot', do: 'moveTo', to: { x: 36, y: BY + 4 }, dur: 0.3 },
    { at: 10.8, actor: 'bot', do: 'scaleTo', amount: 1.4, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 11.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: 11.95, actor: 'bot', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'bot', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 13.45, actor: 'bot', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: 13.75, actor: 'bot', do: 'moveTo', to: { x: -45, y: BY + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：扌從他拍的那雙手飛出來
    { at: H1 + 0.1, dur: 0.5, strokes: [0, 1, 2], from: HAND, color: partColor('扌') },
    // 第 2、3 次：白從那團白白的震波裡飛出來
    { at: H2 + 0.1, dur: 0.55, strokes: [3, 4, 5], from: { x: HAND.x + 12, y: HAND.y }, color: partColor('白') },
    { at: H3 + 0.1, dur: 0.5, strokes: [6, 7], from: { x: HAND.x + 12, y: HAND.y }, color: partColor('白') },
  ],
  glyph: [
    { at: 6.85, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.9, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小機器人
    { at: 10.7, dur: 3.25, do: 'ask', keep: ['bot'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.75, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 1.4, kind: 'pop', actor: 'bot', emoji: '❗', dx: 2, dur: 0.45, scale: 1.3 },
    ...g1.fx,
    { at: H1 + 0.35, kind: 'pop', actor: 'bot', emoji: '❓', dx: 2, dur: 0.4 },
    ...g2.fx,
    { at: H2 + 0.12, kind: 'burst', actor: 'flower', emoji: '🍃', n: 6, dy: 8, dur: 0.55 },
    { at: H2 + 0.4, kind: 'sweat', actor: 'bot' },
    // 第 3 次前停一拍：看一眼蚊子
    { at: 5.2, kind: 'pop', actor: 'bot', emoji: '👀', dx: 2, dur: 0.45, scale: 1.3 },
    ...g3.fx,
    { at: H3 + 0.1, kind: 'burst', x: FX - 4, y: FY - 6, emoji: '🍃', n: 8, dur: 0.5 },
    { at: H3 + 0.45, kind: 'sweat', actor: 'bot', scale: 1.3 },
    // 語詞：開心地拍拍手，兩個 👏 在胸前
    { at: WORD, kind: 'burst', x: MID + 12, y: BY - 4, emoji: '👏', n: 1, dur: 0.35, scale: 1.6 },
    { at: WORD + 0.45, kind: 'burst', x: MID + 12, y: BY - 4, emoji: '👏', n: 1, dur: 0.35, scale: 1.6 },
    { at: WORD + 0.5, kind: 'burst', x: MID, y: BY - 8, emoji: '✨', n: 8, dur: 0.5 },
    ...g4.fx,
    { at: H4 + 0.1, kind: 'burst', x: MID, y: BY - 8, emoji: '⭐', n: 8, dur: 0.45 },
    { at: H4 + 0.3, kind: 'dizzy', actor: 'bot', dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    ...g4.camera,
  ],
  lights: [
    ...g1.lights,
    ...g2.lights,
    ...g3.lights,
    { at: 6.85, dur: 0.05, level: -0.35 },
    { at: 6.9, dur: 0.35, level: 0 },
    ...g4.lights,
  ],
  cues: [
    { at: 0.75, say: '拍' },
    { at: 1.1, sfx: 'blip' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: 7.0, say: '拍' },
    { at: WORD, say: '拍手' },
    { at: WORD, sfx: 'tap' },
    { at: WORD + 0.45, sfx: 'tap' },
    ...g4.cues,
    { at: 10.85, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '拍' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
