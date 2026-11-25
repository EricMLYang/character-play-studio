import { scene } from '../scene'
import type { Actor, Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import type { Scenes } from './index'

// 孫悟空會變：豬八戒流著口水把一顆大桃子放在地上、走開，孫悟空踮腳溜進來抱著就啃。豬八戒哼著歌回來，
// 悟空嚇得把桃子整顆吞下去，躲回左邊發抖——快變！
// 變什麼：蟲——「啵」變成一隻金色的小蟲，跳到豬八戒的鼻子前面揮手他都沒看到，還爬上他的帽子跟著他走；
// 石——變成石頭，豬八戒找累了一屁股坐上去，石頭被壓扁、冒汗、越抖越厲害，「啵」變回悟空把他彈飛，他沒看到是誰，走回去；
// 花——變成一朵鬱金香，豬八戒湊過去用力聞三下，花被吸進鼻孔，一個大噴嚏把花噴飛，花摔成頭暈的悟空。
// 果子沒了：豬八戒想著桃子、發現沒了，肚子咕嚕叫、氣得跺腳，把帽子上的小蟲震飛；小蟲落地變回悟空，
// 豬八戒餓到坐在地上，悟空不好意思，拔一根毛。
// 猴毛變什麼：瓜——吹出去「啵」變成一顆大西瓜砸在地上，豬八戒星星眼、一片一片啃到西瓜不見、肚子撐大；
// 蜂——變出一群蜜蜂，豬八戒扛著釘耙逃，繞一圈從悟空腳下跑過（悟空笑到跳起來），屁股被叮一下跳更高，喘著走回來坐下；
// 蟹——變出一隻螃蟹，夾住豬八戒的鼻子往外拉成長長一條，一放開鼻子腫成一大顆，「啵」消下去，螃蟹橫著走掉。
// 吃太多：往後一躺、拍肚子、打嗝、笑。坐雲回家：筋斗雲載悟空飄起來，豬八戒那朵雲被他壓到貼地，
// 悟空在前面用繩子拉到冒汗，一隻蝸牛從旁邊慢慢超過他們。
//
// 兩個都是 prop 圖（不算「角色」：引擎不會自動踩步伐、不會閒著做小動作），走路用 walk() 自己顛、等著時自己塞小動作。
// 圖都朝左：悟空在左邊要看右邊，一律 flip。豬八戒在右邊面向左，不 flip。
// 悟空 size 32（站在地上 y 63.56）、豬八戒 size 40（y 60.2）。帽子、鼻子這些疊在豬八戒身上的位置（hat()、SNOUT_DY、NOSE_BUG）
// 是照 anim:shot 的成品一格一格對出來的，不是照圖算的，改 size 要重量。
// W1（back 的結尾、等他選「變什麼」）：悟空 x 52 嚇到發抖（wukong-shock），豬八戒 x 122 哼著歌站著（bajie）。
// W2（hungry 的結尾、等他選「猴毛變什麼」）：悟空 x 52 捏著毛（wukong-blow），豬八戒 x 104 餓到坐在地上（bajie-dizzy）。
// 蟲的結尾＝hungry 的開頭：豬八戒 x 104 站著（bajie），小蟲在他帽子上。瓜的結尾＝full 的開頭：豬八戒 x 104 抱著西瓜（bajie-melon，撐寬 1.33 倍）。
// 每一段開頭與結尾都是同一個構圖（START／hold），換頁時鏡頭不跳；中間交給自動取景。

const BG = { top: '#7CC8F2', bottom: '#E4F5FF', floor: '#E2BE7E', scenery: 'hills' as const }

const WS = 32
const WG = 77 - 0.42 * WS
const BS = 40
const BJG = 77 - 0.42 * BS
const WX = 52 // 悟空等著的地方（W1、W2）
const B1X = 122 // W1：豬八戒走回來站的地方
const BX = 104 // 蟲以後：豬八戒站／坐的地方
const ground = (size: number) => 77 - 0.42 * size

const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡 */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })
const FRAME_Z = 1.1
const FRAME_C = { x: 84, y: 48 }
const hold = (at: number, dur = 0.5): Camera => ({ at, dur, do: 'zoom', amount: FRAME_Z, to: aim(FRAME_C, FRAME_Z) })
const release = (at: number, dur = 0.6): Camera => ({ at, dur, do: 'zoom', amount: 1 })
const START = hold(-0.3, 0.01)

const wk = (pose: string, x = WX, more: Partial<Actor> = {}): Actor => ({ id: 'wk', emoji: `prop:${pose}`, x, y: WG, size: WS, flip: true, ...more })
const bj = (pose: string, x = BX, more: Partial<Actor> = {}): Actor => ({ id: 'bj', emoji: `prop:${pose}`, x, y: BJG, size: BS, ...more })

/** 走路：等速移過去，一路小小顛（prop 圖引擎不會自己踩步伐） */
function walk(id: string, at: number, to: Vec, dur: number, step = 0.2, h = 1.6): Move[] {
  const n = Math.max(1, Math.round(dur / step))
  return [
    { at, actor: id, do: 'moveTo', to, dur, ease: 'linear' },
    ...Array.from({ length: n }, (_, i): Move => ({ at: +(at + (i * dur) / n).toFixed(3), actor: id, do: 'hop', amount: h, dur: +(dur / n).toFixed(3) })),
  ]
}

/** 悟空吸一口氣「啵」變身：煙＋星光。p＝啵那一刻 */
function poof(p: number, at: Vec, scale = 1.3): { fx: Fx[]; cues: Cue[] } {
  return {
    fx: [
      { at: p, kind: 'burst', x: at.x, y: at.y, emoji: 'prop:smoke', n: 1, dur: 0.5, scale },
      { at: p + 0.03, kind: 'burst', x: at.x, y: at.y, emoji: '✨', n: 6, dur: 0.55 },
    ],
    cues: [{ at: p, sfx: 'poof' }],
  }
}

// ── 第一頁：果子 ────────────────────────────────────
const PEACH_S = 12
const PEACH_SPOT = { x: 77, y: ground(PEACH_S) }
const STEAL_X = 72 // 悟空坐著啃：wukong-peach 手上的桃子剛好在 PEACH_SPOT

// ── 選「變什麼」 ──────────────────────────────────
const ROCK_S = 18
const ROCK_W = 1.5 // 被坐扁一次
const ROCK_W2 = 1.3 // 再扁一次（一共 1.95 倍寬，快變成一張餅）
const FLOWER_S = 18
const BUG_S = 12
/** 金色的小蟲（看得出是悟空變的） */
const BUG_TINT = 'sepia(.65) saturate(2.4) hue-rotate(-12deg) brightness(1.08)'
/** 豬八戒（bajie，不 flip）帽子頂上，小蟲站的地方 */
const hat = (x: number): Vec => ({ x: x + 4, y: 46 })
/** 豬八戒的豬鼻子（不 flip、bajie-shock）：相對他的 (x, y)，照成品量的 */
const SNOUT_DY = -4

// ── 猴毛 ────────────────────────────────────────
/** 毛吹出去「啵」的地方 */
const POP = { x: 82, y: 44 }
/** 悟空捏著毛吹（wukong-blow flip）：嘴巴相對頭頂 */
const blowHair = (at: number, to: Vec = POP): { moves: Move[]; fx: Fx[]; cues: Cue[] } => ({
  moves: [
    { at, actor: 'wk', do: 'squash', amount: -0.18, dur: 0.3 },
    { at: at + 0.3, actor: 'wk', do: 'squash', amount: 0.2, dur: 0.25 },
  ],
  fx: [{ at: at + 0.3, kind: 'blow', actor: 'wk', dx: 4, dy: 8, to, emoji: 'prop:monkey-hair', n: 1, dur: 0.35, scale: 1.4 }],
  cues: [{ at: at + 0.3, sfx: 'whoosh' }],
})
const FAT = 1.1 // 啃一口肚子撐寬一次（瓜）
const FAT_ALL = FAT ** 3

const BEES = ['b1', 'b2', 'b3', 'b4']

const scenes: Scenes = {
  // 孫悟空偷吃豬八戒的果子。——豬八戒流著口水把桃子放在地上、拍拍它，扛起釘耙走掉；
  // 悟空手搭眉毛踮腳溜進來，看到桃子跳起來，抱著坐下來大口啃
  steal: (() => {
    const sneak = walk('wk', 1.7, { x: 58, y: WG }, 0.9, 0.3, 2.4)
    return scene({
      duration: 6.3,
      bg: BG,
      actors: [
        bj('bajie-drool', 98),
        { id: 'peach', emoji: 'prop:peach', x: 92, y: 64, size: PEACH_S, float: true },
        wk('wukong-look', -20),
      ],
      moves: [
        // 放好、拍拍它
        { at: 0.2, actor: 'bj', do: 'squash', amount: 0.15, dur: 0.35 },
        { at: 0.2, actor: 'peach', do: 'moveTo', to: PEACH_SPOT, arc: 3, dur: 0.4, ease: 'out' },
        { at: 0.6, actor: 'peach', do: 'squash', amount: 0.2, dur: 0.2 },
        { at: 0.75, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
        { at: 1.05, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
        { at: 0.75, actor: 'peach', do: 'flash', dur: 0.5 },
        // 扛起釘耙走掉（朝右）
        { at: 1.35, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
        { at: 1.35, actor: 'bj', do: 'flip' },
        ...walk('bj', 1.45, { x: 195, y: BJG }, 1.3, 0.22, 1.8),
        // 悟空踮腳溜進來：一步一步、高高的
        ...sneak,
        { at: 2.65, actor: 'wk', do: 'tilt', amount: 8, dur: 0.3 },
        { at: 2.75, actor: 'wk', do: 'swap', emoji: 'prop:wukong-happy' },
        { at: 2.75, actor: 'wk', do: 'hop', amount: 6, dur: 0.35 },
        { at: 2.75, actor: 'peach', do: 'flash', dur: 0.4 },
        // 抱起來就啃
        { at: 3.1, actor: 'wk', do: 'moveTo', to: { x: STEAL_X, y: WG }, dur: 0.2, ease: 'out' },
        { at: 3.3, actor: 'peach', do: 'vanish', dur: 0.05 },
        { at: 3.3, actor: 'wk', do: 'swap', emoji: 'prop:wukong-peach' },
        ...[3.55, 3.85, 4.15, 4.5, 4.85, 5.2, 5.55].map((at, i): Move => ({ at, actor: 'wk', do: 'squash', amount: i % 3 === 2 ? 0.16 : 0.09, dur: 0.22 })),
        // 偷看一下右邊有沒有人來，繼續啃
        { at: 4.6, actor: 'wk', do: 'tilt', amount: 8, dur: 0.4 },
      ],
      fx: [
        { at: 0.25, kind: 'pop', actor: 'bj', emoji: '😋', dx: -4, dur: 1.0 },
        { at: 0.65, kind: 'burst', actor: 'peach', emoji: '✨', n: 6, dy: 4, dur: 0.6 },
        { at: 1.0, kind: 'burst', x: PEACH_SPOT.x, y: 58, emoji: '💗', n: 1, dur: 0.6, scale: 0.6 },
        { at: 2.75, kind: 'pop', actor: 'wk', emoji: '❗', dur: 0.5 },
        { at: 3.35, kind: 'burst', actor: 'wk', emoji: '✨', n: 6, dy: 10, dur: 0.5 },
        { at: 3.6, kind: 'pop', actor: 'wk', emoji: '😋', dx: 2, dur: 1.6 },
        { at: 4.2, kind: 'burst', actor: 'wk', emoji: '✨', n: 4, dx: 4, dy: 12, dur: 0.5, scale: 0.7 },
        { at: 5.2, kind: 'burst', actor: 'wk', emoji: '✨', n: 4, dx: 4, dy: 12, dur: 0.5, scale: 0.7 },
      ],
      camera: [START, release(0.3), hold(5.2, 0.6)],
      cues: [
        { at: 0.6, sfx: 'plop' },
        { at: 2.75, sfx: 'blip' },
        { at: 3.3, say: '孫悟空偷吃豬八戒的果子。' },
        { at: 3.55, sfx: 'gulp' },
        { at: 4.15, sfx: 'gulp' },
        { at: 4.85, sfx: 'gulp' },
        { at: 5.55, sfx: 'gulp' },
      ],
    })
  })(),

  // 豬八戒回來了！快變！——悟空正啃得開心，右邊傳來哼歌聲；嚇一跳，把整顆桃子塞進嘴裡吞下去，
  // 逃回左邊，左看右看、急得發抖。豬八戒哼著歌走回來（還沒發現）。結尾 W1
  back: scene({
    duration: 4.6,
    bg: BG,
    actors: [
      wk('wukong-peach', STEAL_X),
      { id: 'gulp', emoji: 'prop:peach', x: STEAL_X + 4, y: 58, size: PEACH_S, hidden: true, float: true },
      bj('bajie', 195),
    ],
    moves: [
      { at: 0.1, actor: 'wk', do: 'squash', amount: 0.1, dur: 0.22 },
      { at: 0.4, actor: 'wk', do: 'squash', amount: 0.1, dur: 0.22 },
      // 豬八戒哼著歌走回來
      ...walk('bj', 0.2, { x: B1X, y: BJG }, 1.9, 0.24, 1.8),
      // 嚇一跳：整顆塞進嘴裡
      { at: 0.75, actor: 'wk', do: 'swap', emoji: 'prop:wukong-shock' },
      { at: 0.75, actor: 'wk', do: 'hop', amount: 5, dur: 0.3 },
      { at: 0.75, actor: 'gulp', do: 'pop', dur: 0.05 },
      { at: 0.75, actor: 'gulp', do: 'hop', amount: 4, dur: 0.25 },
      { at: 1.0, actor: 'gulp', do: 'moveTo', to: { x: STEAL_X - 1, y: 51 }, dur: 0.2, ease: 'in' },
      { at: 1.0, actor: 'gulp', do: 'scaleTo', amount: 0.3, dur: 0.2, ease: 'in' },
      { at: 1.2, actor: 'gulp', do: 'vanish', dur: 0.05 },
      { at: 1.2, actor: 'wk', do: 'squash', amount: 0.35, dur: 0.3 },
      { at: 1.4, actor: 'wk', do: 'shake', amount: 0.8, dur: 0.3 },
      // 逃回左邊，左看右看
      { at: 1.75, actor: 'wk', do: 'moveTo', to: { x: WX, y: WG }, dur: 0.35, ease: 'out', anticipate: 3 },
      { at: 1.75, actor: 'wk', do: 'hop', amount: 4, dur: 0.35 },
      { at: 2.2, actor: 'wk', do: 'flip' },
      { at: 2.5, actor: 'wk', do: 'flip' },
      { at: 2.8, actor: 'wk', do: 'shake', amount: 1.2, dur: 0.6 },
      { at: 3.5, actor: 'wk', do: 'hop', amount: 2, dur: 0.2 },
      { at: 3.75, actor: 'wk', do: 'hop', amount: 2, dur: 0.2 },
      { at: 4.0, actor: 'wk', do: 'shake', amount: 1.0, dur: 0.5 },
      // 豬八戒站定，晃著肚子哼歌
      { at: 2.3, actor: 'bj', do: 'tilt', amount: 5, dur: 0.5 },
      { at: 2.9, actor: 'bj', do: 'tilt', amount: -5, dur: 0.5 },
      { at: 3.5, actor: 'bj', do: 'tilt', amount: 5, dur: 0.5 },
      { at: 4.1, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.35 },
    ],
    fx: [
      { at: 0.3, kind: 'blow', actor: 'bj', dx: -6, dy: 8, to: { x: 128, y: 24 }, emoji: '🎵', n: 3, dur: 1.0 },
      { at: 0.75, kind: 'pop', actor: 'wk', emoji: '❗', dur: 0.5 },
      { at: 1.2, kind: 'burst', actor: 'wk', emoji: '💦', n: 4, dy: 8, dur: 0.4, scale: 0.6 },
      { at: 1.3, kind: 'blow', actor: 'bj', dx: -6, dy: 8, to: { x: 112, y: 20 }, emoji: '🎶', n: 3, dur: 1.0 },
      { at: 2.2, kind: 'sweat', actor: 'wk' },
      { at: 2.6, kind: 'blow', actor: 'bj', dx: -6, dy: 8, to: { x: 106, y: 18 }, emoji: '🎵', n: 3, dur: 1.1 },
      { at: 3.0, kind: 'sweat', actor: 'wk' },
      { at: 3.8, kind: 'blow', actor: 'bj', dx: -6, dy: 8, to: { x: 112, y: 18 }, emoji: '🎶', n: 3, dur: 0.8 },
    ],
    camera: [START, release(0.3), hold(3.9, 0.6)],
    cues: [
      { at: 0.75, sfx: 'boing' },
      { at: 1.2, sfx: 'gulp' },
      { at: 1.1, say: '豬八戒回來了！快變！' },
      { at: 1.75, sfx: 'whoosh' },
    ],
  }),

  // 變小蟲了！豬八戒看不見他！——「啵」變成一隻金色的小蟲；豬八戒走過來找，小蟲一跳停在他的鼻子前面揮手，
  // 他瞪大眼睛東看西看就是沒看到；小蟲爬上他的帽子，他東張西望走回右邊。結尾：豬八戒 x 104，小蟲在帽子上
  'hide:蟲': (() => {
    const BUG0 = { x: WX + 2, y: ground(BUG_S) }
    const LOOK_X = 84 // 豬八戒找到這裡停下來
    // 小蟲跳上來停在他的豬鼻子前面（比站在帽子上低 8）
    const NOSE_BUG = { x: LOOK_X - 8, y: hat(0).y + 11 }
    const ride = (at: number, x: number, dur: number) => [
      ...walk('bj', at, { x, y: BJG }, dur, 0.24, 1.8),
      ...walk('bug', at, hat(x), dur, 0.24, 1.8),
    ]
    const p = poof(0.4, { x: WX, y: 58 }, 1.4)
    return scene({
      duration: 7.4,
      bg: BG,
      actors: [
        wk('wukong-shock'),
        bj('bajie', B1X),
        { id: 'bug', emoji: 'prop:caterpillar', ...BUG0, size: BUG_S, flip: true, hidden: true, tint: BUG_TINT },
      ],
      moves: [
        { at: 0.1, actor: 'wk', do: 'squash', amount: -0.2, dur: 0.3 },
        { at: 0.4, actor: 'wk', do: 'vanish', dur: 0.08 },
        { at: 0.42, actor: 'bug', do: 'pop', dur: 0.25 },
        { at: 0.8, actor: 'bug', do: 'squash', amount: 0.25, dur: 0.2 },
        { at: 1.05, actor: 'bug', do: 'squash', amount: 0.25, dur: 0.2 },
        // 豬八戒：咦？人呢？走過來找
        { at: 0.6, actor: 'bj', do: 'tilt', amount: -6, dur: 0.4 },
        ...walk('bj', 1.0, { x: LOOK_X, y: BJG }, 0.9, 0.22, 1.8),
        // 小蟲一跳，停在他的鼻子前面揮手；他瞪大眼睛東看西看，就是沒看到
        { at: 1.95, actor: 'bug', do: 'moveTo', to: NOSE_BUG, arc: 10, dur: 0.4, ease: 'out' },
        { at: 2.4, actor: 'bug', do: 'hop', amount: 2, dur: 0.2 },
        { at: 2.65, actor: 'bug', do: 'hop', amount: 2, dur: 0.2 },
        { at: 2.9, actor: 'bug', do: 'hop', amount: 2, dur: 0.2 },
        { at: 2.4, actor: 'bj', do: 'tilt', amount: -7, dur: 0.4 },
        { at: 2.85, actor: 'bj', do: 'tilt', amount: 7, dur: 0.4 },
        { at: 3.25, actor: 'bj', do: 'squash', amount: -0.06, dur: 0.25 },
        // 小蟲爬上帽子
        { at: 3.45, actor: 'bug', do: 'moveTo', to: hat(LOOK_X), arc: 6, dur: 0.35, ease: 'out' },
        { at: 3.8, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.2 },
        // 東張西望，帶著頭上的小蟲走回右邊
        { at: 4.0, actor: 'bj', do: 'tilt', amount: -8, dur: 0.4 },
        { at: 4.0, actor: 'bug', do: 'tilt', amount: -12, dur: 0.4 },
        { at: 4.4, actor: 'bj', do: 'tilt', amount: 8, dur: 0.4 },
        { at: 4.4, actor: 'bug', do: 'tilt', amount: 12, dur: 0.4 },
        ...ride(4.85, BX, 0.9),
        // 小蟲在帽子上扭來扭去
        { at: 5.9, actor: 'bug', do: 'squash', amount: 0.25, dur: 0.2 },
        { at: 6.15, actor: 'bug', do: 'squash', amount: 0.25, dur: 0.2 },
        { at: 6.0, actor: 'bj', do: 'tilt', amount: -6, dur: 0.45 },
        { at: 6.5, actor: 'bug', do: 'hop', amount: 2, dur: 0.22 },
        { at: 6.6, actor: 'bj', do: 'tilt', amount: 6, dur: 0.45 },
        { at: 7.0, actor: 'bug', do: 'squash', amount: 0.2, dur: 0.2 },
      ],
      fx: [
        ...p.fx,
        { at: 0.75, kind: 'pop', actor: 'bug', emoji: '😆', dur: 0.8 },
        { at: 0.6, kind: 'pop', actor: 'bj', emoji: '❓', dur: 0.8 },
        { at: 2.4, kind: 'pop', actor: 'bug', emoji: '👋', dx: -10, dy: 2, dur: 0.85 },
        { at: 2.45, kind: 'pop', actor: 'bj', emoji: '❓', dx: 4, dur: 1.0 },
        { at: 4.05, kind: 'pop', actor: 'bj', emoji: '❓', dx: -14, dy: 6, dur: 0.6 },
        { at: 4.45, kind: 'pop', actor: 'bj', emoji: '❓', dx: 8, dy: 6, dur: 0.6 },
        { at: 5.9, kind: 'pop', actor: 'bug', emoji: '🤭', dur: 1.2 },
      ],
      camera: [
        START, release(0.3),
        // 小蟲在鼻子前面：推近看清楚
        { at: 1.95, dur: 0.4, do: 'zoom', amount: 1.9, to: aim({ x: LOOK_X - 4, y: 48 }, 1.9) },
        { at: 3.45, dur: 0.5, do: 'zoom', amount: 1.6, to: aim({ x: LOOK_X + 2, y: 50 }, 1.6) },
        { at: 4.85, dur: 0.9, do: 'zoom', amount: 1.6, to: aim({ x: BX + 2, y: 50 }, 1.6) },
        hold(6.6, 0.6),
      ],
      cues: [
        ...p.cues,
        { at: 0.6, say: '變小蟲了！豬八戒看不見他！' },
        { at: 1.95, sfx: 'boing' },
        { at: 2.4, sfx: 'tap' },
        { at: 2.65, sfx: 'tap' },
        { at: 2.9, sfx: 'tap' },
        { at: 3.45, sfx: 'boing' },
      ],
    })
  })(),

  // 豬八戒坐在石上。他太胖了！——變成石頭；豬八戒找累了，背對著一屁股坐上去，舒服地往後一躺；
  // 石頭被壓扁、冒汗、越抖越厲害——「啵」變回悟空把他彈飛，他落地東張西望，沒看到是誰，走回右邊。回到 W1
  'hide:石': (() => {
    const RX = WX
    const ROCK = { x: RX, y: ground(ROCK_S) }
    // 坐在石頭上（bajie-full）：屁股在石頭頂上，壓扁一次、再一次就跟著沉
    // 石頭內容底在 77.7、高 13.4（壓扁後高 ÷ 寬的倍率）；bajie-full 的底在 y + 18.4，屁股陷進去 2
    const top = (w: number) => 77.7 - 13.4 / w
    const SIT1 = top(1) + 2 - 18.4
    const SIT2 = top(ROCK_W) + 2 - 18.4
    const SIT3 = top(ROCK_W * ROCK_W2) + 2 - 18.4
    const p = poof(0.4, { x: WX, y: 58 }, 1.4)
    const BOOM = 5.0
    const p2 = poof(BOOM, { x: RX, y: 62 }, 1.6)
    return scene({
      duration: 7.6,
      bg: BG,
      actors: [
        { id: 'rock', emoji: 'prop:rock', ...ROCK, size: ROCK_S, hidden: true },
        wk('wukong-shock'),
        bj('bajie', B1X),
      ],
      moves: [
        { at: 0.1, actor: 'wk', do: 'squash', amount: -0.2, dur: 0.3 },
        { at: 0.4, actor: 'wk', do: 'vanish', dur: 0.08 },
        { at: 0.42, actor: 'rock', do: 'pop', dur: 0.25 },
        { at: 0.9, actor: 'rock', do: 'shake', amount: 0.4, dur: 0.3 },
        // 豬八戒走過來找，擦汗，好累
        { at: 0.6, actor: 'bj', do: 'tilt', amount: -6, dur: 0.4 },
        ...walk('bj', 1.0, { x: 76, y: BJG }, 1.0, 0.25, 1.6),
        { at: 2.05, actor: 'bj', do: 'squash', amount: 0.12, dur: 0.4 },
        // 轉身、一屁股坐上去，往後一躺
        { at: 2.45, actor: 'bj', do: 'squash', amount: 0.15, dur: 0.15 },
        { at: 2.6, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
        { at: 2.6, actor: 'bj', do: 'moveTo', to: { x: RX + 2, y: SIT1 }, arc: 8, dur: 0.35, ease: 'in' },
        { at: 2.95, actor: 'rock', do: 'stretchTo', amount: ROCK_W, dur: 0.1 },
        { at: 2.95, actor: 'bj', do: 'moveTo', to: { x: RX + 2, y: SIT2 }, dur: 0.1 },
        { at: 2.95, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.25 },
        // 舒服地嘆氣、拍肚子
        { at: 3.5, actor: 'bj', do: 'squash', amount: 0.07, dur: 0.25 },
        { at: 3.8, actor: 'bj', do: 'squash', amount: 0.07, dur: 0.25 },
        { at: 3.3, actor: 'rock', do: 'shake', amount: 0.6, dur: 0.5 },
        // 再扭一下屁股坐好：石頭更扁，抖得更厲害
        { at: 4.15, actor: 'bj', do: 'hop', amount: 2, dur: 0.2 },
        { at: 4.35, actor: 'rock', do: 'stretchTo', amount: ROCK_W2, dur: 0.1 },
        { at: 4.35, actor: 'bj', do: 'moveTo', to: { x: RX + 2, y: SIT3 }, dur: 0.1 },
        { at: 4.4, actor: 'rock', do: 'shake', amount: 1.6, dur: 0.6 },
        // 撐不住了——啵！
        { at: BOOM, actor: 'rock', do: 'vanish', dur: 0.06 },
        { at: BOOM, actor: 'wk', do: 'swap', emoji: 'prop:wukong-dizzy' },
        { at: BOOM, actor: 'wk', do: 'pop', dur: 0.15 },
        { at: BOOM, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
        { at: BOOM, actor: 'bj', do: 'moveTo', to: { x: 92, y: BJG }, arc: 16, dur: 0.55, ease: 'out' },
        { at: BOOM, actor: 'bj', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
        // 落地東張西望（背對悟空），沒看到是誰
        { at: BOOM + 0.75, actor: 'bj', do: 'flip' },
        { at: BOOM + 1.0, actor: 'bj', do: 'flip' },
        { at: BOOM + 1.15, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
        { at: BOOM + 1.15, actor: 'bj', do: 'flip' },
        ...walk('bj', BOOM + 1.2, { x: B1X, y: BJG }, 0.8, 0.22, 1.6),
        { at: BOOM + 2.05, actor: 'bj', do: 'flip' },
        { at: BOOM + 2.3, actor: 'bj', do: 'tilt', amount: 4, dur: 0.3 },
        // 悟空頭暈，爬起來
        { at: BOOM + 1.5, actor: 'wk', do: 'swap', emoji: 'prop:wukong-shock' },
        { at: BOOM + 1.55, actor: 'wk', do: 'shake', amount: 1.0, dur: 0.5 },
        { at: BOOM + 2.2, actor: 'wk', do: 'shake', amount: 0.8, dur: 0.4 },
      ],
      fx: [
        ...p.fx,
        { at: 0.6, kind: 'pop', actor: 'bj', emoji: '❓', dur: 0.8 },
        { at: 1.6, kind: 'sweat', actor: 'bj' },
        { at: 2.1, kind: 'pop', actor: 'bj', emoji: '😮‍💨', dx: -10, dur: 0.7 },
        { at: 2.95, kind: 'puff', actor: 'rock', dur: 0.5 },
        { at: 3.2, kind: 'sweat', actor: 'rock', dx: -4, dy: 4 },
        { at: 3.3, kind: 'pop', actor: 'rock', emoji: '😖', dx: -16, dy: 8, dur: 0.9 },
        { at: 4.45, kind: 'pop', actor: 'rock', emoji: '😵', dx: -16, dy: 8, dur: 0.55 },
        { at: 3.6, kind: 'burst', x: RX - 6, y: 60, emoji: '💦', n: 3, dur: 0.5, scale: 0.6 },
        { at: 4.35, kind: 'puff', actor: 'rock', dur: 0.5 },
        { at: 4.4, kind: 'burst', x: RX, y: 64, emoji: '💦', n: 6, dur: 0.6 },
        { at: 4.5, kind: 'sweat', actor: 'rock', dx: 6, dy: 4 },
        ...p2.fx,
        { at: BOOM + 0.1, kind: 'dizzy', actor: 'wk', dur: 1.4 },
        { at: BOOM + 0.6, kind: 'pop', actor: 'bj', emoji: '❗', dur: 0.4 },
        { at: BOOM + 0.8, kind: 'pop', actor: 'bj', emoji: '❓', dur: 0.8 },
      ],
      camera: [START, release(0.3), { at: 2.95, dur: 0.3, do: 'shake', amount: 1.2 }, { at: 4.35, dur: 0.3, do: 'shake', amount: 1.6 },
        { at: BOOM, dur: 0.35, do: 'shake', amount: 2 }, hold(6.8, 0.6)],
      cues: [
        ...p.cues,
        { at: 2.6, sfx: 'whoosh' },
        { at: 2.95, sfx: 'bonk' },
        { at: 3.0, say: '豬八戒坐在石上。他太胖了！' },
        { at: 4.35, sfx: 'crack' },
        { at: 4.4, sfx: 'rumble' },
        ...p2.cues,
        { at: BOOM + 0.05, sfx: 'boing' },
      ],
    })
  })(),

  // 豬八戒聞花。花跑到鼻子裡了！——變成一朵鬱金香；豬八戒走過來，眼睛一亮，彎腰聞一下、兩下、第三下用力一吸，
  // 花被吸進鼻孔；鼻子癢、吸氣、吸氣——哈啾！花噴飛出去，摔成頭暈的悟空。豬八戒被自己的噴嚏震退，揉著鼻子走回右邊。回到 W1
  'hide:花': (() => {
    const FLOWER = { x: WX + 2, y: ground(FLOWER_S) }
    const SNIFF_X = 72 // 彎腰聞花時豬八戒站的地方
    const LEAN = -28 // 彎腰：鼻子湊到花的上面
    const NOSE = { x: 60, y: 57 } // 彎腰時鼻孔的位置
    // 直起來以後（bajie-shock）：花塞在鼻孔裡，花頭朝裡、花梗露在外面
    const STUCK = { x: SNIFF_X - 6, y: 52 }
    const p = poof(0.4, { x: WX, y: 58 }, 1.4)
    const ACHOO = 4.75
    return scene({
      duration: 7.8,
      bg: BG,
      actors: [
        wk('wukong-shock'),
        // 地上的花畫在豬八戒後面（彎腰聞的時候不會蓋住他的臉）；塞在鼻孔裡的那朵畫在他前面
        { id: 'flower', emoji: '🌷', ...FLOWER, size: FLOWER_S, hidden: true, pivot: 'center' },
        bj('bajie', B1X),
        { id: 'stuck', emoji: '🌷', ...STUCK, size: FLOWER_S * 0.45, hidden: true, float: true, pivot: 'center' },
      ],
      moves: [
        { at: 0.1, actor: 'wk', do: 'squash', amount: -0.2, dur: 0.3 },
        { at: 0.4, actor: 'wk', do: 'vanish', dur: 0.08 },
        { at: 0.42, actor: 'flower', do: 'pop', dur: 0.25 },
        { at: 0.8, actor: 'flower', do: 'tilt', amount: 10, dur: 0.5 },
        // 豬八戒走過來，看到花
        { at: 0.6, actor: 'bj', do: 'tilt', amount: -6, dur: 0.4 },
        ...walk('bj', 0.9, { x: SNIFF_X, y: BJG }, 1.0, 0.25, 1.6),
        { at: 1.95, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
        { at: 1.95, actor: 'bj', do: 'hop', amount: 3, dur: 0.25 },
        // 彎腰：聞一下、兩下（花往鼻子那邊歪），第三下用力一吸
        { at: 2.25, actor: 'bj', do: 'rotateTo', amount: LEAN, dur: 0.3, ease: 'out' },
        { at: 2.6, actor: 'bj', do: 'squash', amount: -0.06, dur: 0.2 },
        { at: 2.6, actor: 'flower', do: 'tilt', amount: 10, dur: 0.25 },
        { at: 2.95, actor: 'bj', do: 'squash', amount: -0.1, dur: 0.2 },
        { at: 2.95, actor: 'flower', do: 'tilt', amount: 18, dur: 0.25 },
        { at: 3.3, actor: 'bj', do: 'squash', amount: -0.2, dur: 0.35 },
        { at: 3.35, actor: 'flower', do: 'moveTo', to: NOSE, dur: 0.2, ease: 'in' },
        { at: 3.35, actor: 'flower', do: 'scaleTo', amount: 0.45, dur: 0.2, ease: 'in' },
        { at: 3.35, actor: 'flower', do: 'rotateTo', amount: 40, dur: 0.2 },
        { at: 3.55, actor: 'flower', do: 'vanish', dur: 0.05 },
        // 直起來：花塞在鼻孔裡，鼻子好癢
        { at: 3.6, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
        { at: 3.6, actor: 'bj', do: 'rotateTo', amount: -LEAN, dur: 0.2, ease: 'back' },
        { at: 3.6, actor: 'stuck', do: 'pop', dur: 0.1 },
        { at: 3.6, actor: 'stuck', do: 'rotateTo', amount: 90, dur: 0.05 },
        { at: 3.95, actor: 'stuck', do: 'shake', amount: 0.6, dur: 0.3 },
        { at: 4.0, actor: 'bj', do: 'squash', amount: -0.12, dur: 0.3 },
        { at: 4.35, actor: 'bj', do: 'squash', amount: -0.22, dur: 0.35 },
        { at: 4.35, actor: 'stuck', do: 'shake', amount: 0.9, dur: 0.35 },
        // 哈啾！被自己震退
        { at: ACHOO, actor: 'bj', do: 'squash', amount: 0.35, dur: 0.3 },
        { at: ACHOO, actor: 'bj', do: 'moveTo', to: { x: 96, y: BJG }, dur: 0.35, ease: 'out' },
        // 花噴出去，摔成頭暈的悟空
        { at: ACHOO, actor: 'stuck', do: 'scaleTo', amount: 2.2, dur: 0.15 },
        { at: ACHOO, actor: 'stuck', do: 'moveTo', to: { x: WX, y: 58 }, arc: 10, dur: 0.33, ease: 'out' },
        { at: ACHOO, actor: 'stuck', do: 'spin', times: -2, dur: 0.33 },
        { at: ACHOO + 0.35, actor: 'stuck', do: 'vanish', dur: 0.05 },
        { at: ACHOO + 0.35, actor: 'wk', do: 'swap', emoji: 'prop:wukong-dizzy' },
        { at: ACHOO + 0.35, actor: 'wk', do: 'pop', dur: 0.15 },
        // 揉揉鼻子，走回右邊
        { at: ACHOO + 0.6, actor: 'bj', do: 'shake', amount: 0.8, dur: 0.4 },
        { at: ACHOO + 1.1, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
        { at: ACHOO + 1.1, actor: 'bj', do: 'flip' },
        ...walk('bj', ACHOO + 1.15, { x: B1X, y: BJG }, 0.9, 0.22, 1.6),
        { at: ACHOO + 2.1, actor: 'bj', do: 'flip' },
        { at: ACHOO + 2.4, actor: 'bj', do: 'tilt', amount: 4, dur: 0.3 },
        // 悟空爬起來
        { at: ACHOO + 1.8, actor: 'wk', do: 'swap', emoji: 'prop:wukong-shock' },
        { at: ACHOO + 1.85, actor: 'wk', do: 'shake', amount: 1.0, dur: 0.5 },
        { at: ACHOO + 2.5, actor: 'wk', do: 'shake', amount: 0.8, dur: 0.4 },
      ],
      fx: [
        ...p.fx,
        { at: 0.6, kind: 'pop', actor: 'bj', emoji: '❓', dur: 0.8 },
        { at: 1.95, kind: 'burst', actor: 'flower', emoji: '✨', n: 5, dur: 0.5 },
        { at: 2.6, kind: 'blow', actor: 'flower', to: NOSE, emoji: '〰️', n: 2, dur: 0.35 },
        { at: 2.95, kind: 'blow', actor: 'flower', to: NOSE, emoji: '〰️', n: 3, dur: 0.35 },
        { at: 3.3, kind: 'blow', actor: 'flower', to: NOSE, emoji: '〰️', n: 4, dur: 0.3, scale: 1.3 },
        { at: 3.65, kind: 'pop', actor: 'bj', emoji: '❗', dur: 0.5 },
        { at: 3.9, kind: 'burst', actor: 'bj', emoji: '🌸', n: 4, dy: 12, dur: 0.5, scale: 0.6 },
        { at: ACHOO, kind: 'blow', actor: 'bj', dx: -6, dy: 12, to: { x: 30, y: 50 }, n: 5, dur: 0.5, scale: 1.6 },
        { at: ACHOO, kind: 'burst', actor: 'bj', emoji: '💦', n: 7, dx: -6, dy: 12, dur: 0.5 },
        { at: ACHOO + 0.35, kind: 'burst', x: WX, y: 58, emoji: 'prop:smoke', n: 1, dur: 0.45, scale: 1.3 },
        { at: ACHOO + 0.35, kind: 'burst', x: WX, y: 58, emoji: '🌸', n: 6, dur: 0.6 },
        { at: ACHOO + 0.45, kind: 'dizzy', actor: 'wk', dur: 1.4 },
        { at: ACHOO + 0.6, kind: 'pop', actor: 'bj', emoji: '🤧', dur: 0.9 },
      ],
      camera: [START, release(0.3), { at: 3.35, dur: 0.35, do: 'punch', amount: 0.12, to: NOSE }, { at: ACHOO, dur: 0.4, do: 'shake', amount: 1.8 }, hold(7.0, 0.6)],
      cues: [
        ...p.cues,
        { at: 1.95, sfx: 'blip' },
        { at: 2.3, say: '豬八戒聞花。花跑到鼻子裡了！' },
        { at: 3.35, sfx: 'whoosh' },
        { at: ACHOO, sfx: 'achoo' },
        { at: ACHOO + 0.35, sfx: 'poof' },
      ],
    })
  })(),

  // 果子沒了。豬八戒好餓！——豬八戒想著那顆桃子，一想到「沒了」就嚇一跳；肚子咕嚕叫，氣得跺腳，
  // 第一下小蟲被震起來又落回帽子，第二下被震飛到左邊，「啵」變回悟空；豬八戒餓到坐在地上。
  // 悟空看他這樣，不好意思地抓抓頭——想到了，拔一根毛。結尾 W2
  hungry: (() => {
    const p = poof(3.25, { x: WX, y: 58 }, 1.3)
    return scene({
      duration: 6.2,
      bg: BG,
      actors: [
        wk('wukong-shock', WX, { hidden: true }),
        bj('bajie'),
        { id: 'bug', emoji: 'prop:caterpillar', ...hat(BX), size: BUG_S, flip: true, tint: BUG_TINT },
      ],
      moves: [
        // 想著桃子……沒了！
        { at: 0.2, actor: 'bj', do: 'tilt', amount: -6, dur: 0.5 },
        { at: 0.95, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
        { at: 0.95, actor: 'bj', do: 'hop', amount: 4, dur: 0.3 },
        { at: 0.95, actor: 'bug', do: 'hop', amount: 6, dur: 0.35 },
        // 肚子咕嚕叫
        { at: 1.5, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.35 },
        { at: 1.5, actor: 'bj', do: 'shake', amount: 0.6, dur: 0.4 },
        // 跺腳：第一下小蟲彈起來又落回帽子
        { at: 2.0, actor: 'bj', do: 'swap', emoji: 'prop:bajie-angry' },
        { at: 2.05, actor: 'bj', do: 'hop', amount: 3, dur: 0.2 },
        { at: 2.05, actor: 'bug', do: 'hop', amount: 9, dur: 0.4 },
        { at: 2.1, actor: 'bug', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
        // 第二下：小蟲被震飛到左邊
        { at: 2.55, actor: 'bj', do: 'hop', amount: 5, dur: 0.25 },
        { at: 2.8, actor: 'bug', do: 'moveTo', to: { x: WX + 2, y: ground(BUG_S) }, arc: 18, dur: 0.45, ease: 'linear' },
        { at: 2.8, actor: 'bug', do: 'spin', times: -2, dur: 0.45, pivot: 'center' },
        { at: 3.25, actor: 'bug', do: 'vanish', dur: 0.06 },
        { at: 3.25, actor: 'wk', do: 'pop', dur: 0.2 },
        // 豬八戒餓到坐在地上
        { at: 3.1, actor: 'bj', do: 'swap', emoji: 'prop:bajie-dizzy' },
        { at: 3.1, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
        { at: 4.1, actor: 'bj', do: 'squash', amount: 0.12, dur: 0.3 },
        { at: 4.1, actor: 'bj', do: 'shake', amount: 0.4, dur: 0.3 },
        { at: 5.3, actor: 'bj', do: 'squash', amount: 0.15, dur: 0.3 },
        { at: 5.3, actor: 'bj', do: 'shake', amount: 0.5, dur: 0.3 },
        // 悟空看他這樣，不好意思
        { at: 3.7, actor: 'wk', do: 'tilt', amount: 8, dur: 0.5 },
        { at: 4.3, actor: 'wk', do: 'tilt', amount: -6, dur: 0.4 },
        // 想到了：拔一根毛
        { at: 4.7, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
        { at: 5.05, actor: 'wk', do: 'swap', emoji: 'prop:wukong-blow' },
        { at: 5.05, actor: 'wk', do: 'squash', amount: -0.15, dur: 0.2 },
        { at: 5.6, actor: 'wk', do: 'tilt', amount: 5, dur: 0.4 },
      ],
      fx: [
        { at: 0.2, kind: 'bubble', actor: 'bj', emoji: 'prop:peach', scale: 1.3, dur: 0.75 },
        { at: 0.95, kind: 'pop', actor: 'bj', emoji: '❗', dx: -10, dur: 0.5 },
        { at: 1.5, kind: 'burst', actor: 'bj', emoji: '〰️', n: 4, dy: 22, dur: 0.5, scale: 0.8 },
        { at: 2.05, kind: 'puff', actor: 'bj', dur: 0.4 },
        { at: 2.1, kind: 'pop', actor: 'bj', emoji: '💢', dx: -12, dur: 0.8 },
        { at: 2.55, kind: 'puff', actor: 'bj', dur: 0.45 },
        ...p.fx,
        { at: 3.4, kind: 'burst', actor: 'bj', emoji: '〰️', n: 5, dy: 22, dur: 0.6 },
        { at: 3.6, kind: 'sweat', actor: 'wk' },
        { at: 3.7, kind: 'pop', actor: 'wk', emoji: '😅', dur: 0.9 },
        { at: 4.7, kind: 'pop', actor: 'wk', emoji: '💡', dur: 0.6 },
        { at: 5.05, kind: 'burst', actor: 'wk', emoji: '✨', n: 4, dx: 8, dy: 6, dur: 0.4, scale: 0.6 },
        { at: 5.3, kind: 'burst', actor: 'bj', emoji: '〰️', n: 4, dy: 22, dur: 0.5, scale: 0.8 },
      ],
      // 小蟲被震飛那一段：鏡頭跟著小蟲會把豬八戒切掉，先退回固定構圖
      camera: [START, release(0.3), hold(2.5, 0.4), { at: 2.55, dur: 0.25, do: 'shake', amount: 0.8 }, release(3.6, 0.5), hold(5.5, 0.6)],
      cues: [
        { at: 0.95, sfx: 'boing' },
        { at: 1.1, say: '果子沒了。豬八戒好餓！' },
        { at: 1.5, sfx: 'rumble' },
        { at: 2.05, sfx: 'bonk' },
        { at: 2.55, sfx: 'bonk' },
        { at: 2.8, sfx: 'whoosh' },
        ...p.cues,
        { at: 3.4, sfx: 'rumble' },
        { at: 4.7, sfx: 'blip' },
        { at: 5.05, sfx: 'tap' },
      ],
    })
  })(),

  // 毛變大瓜了！豬八戒吃好多！——一吹，猴毛飄出去「啵」變成一顆大西瓜砸在豬八戒面前；他星星眼跳起來，
  // 抱著一片一片啃，汁亂噴，西瓜越來越小、肚子越來越寬，最後一口整顆不見。結尾：抱著最後一片（接 full）
  'hair:瓜': (() => {
    const MS = 26
    const MELON = { x: 77, y: ground(MS) }
    const b = blowHair(0.1)
    const p = poof(0.65, POP, 1.5)
    const bites = [2.1, 2.85, 3.6, 4.35]
    return scene({
      duration: 6.4,
      bg: BG,
      actors: [
        wk('wukong-blow'),
        { id: 'melon', emoji: 'prop:watermelon', x: POP.x, y: POP.y, size: MS, hidden: true },
        bj('bajie-dizzy'),
      ],
      moves: [
        ...b.moves,
        { at: 0.65, actor: 'melon', do: 'pop', dur: 0.15 },
        { at: 0.8, actor: 'melon', do: 'moveTo', to: MELON, dur: 0.25, ease: 'in' },
        { at: 1.05, actor: 'melon', do: 'squash', amount: 0.25, dur: 0.25 },
        // 星星眼跳起來
        { at: 1.15, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
        { at: 1.15, actor: 'bj', do: 'hop', amount: 6, dur: 0.35 },
        { at: 1.6, actor: 'bj', do: 'moveTo', to: { x: 98, y: BJG }, dur: 0.25, anticipate: 2 },
        // 一片一片啃：西瓜越來越小，肚子越來越寬
        ...bites.flatMap((at, i): Move[] => [
          ...(i === 0 ? [{ at, actor: 'bj', do: 'swap', emoji: 'prop:bajie-melon' } as Move] : []),
          { at, actor: 'melon', do: 'scaleTo', amount: [0.78, 0.75, 0.66, 0.4][i], dur: 0.12 },
          { at, actor: 'melon', do: 'shake', amount: 0.6, dur: 0.2 },
          { at: at + 0.1, actor: 'bj', do: 'squash', amount: 0.12, dur: 0.18 },
          { at: at + 0.35, actor: 'bj', do: 'squash', amount: 0.12, dur: 0.18 },
          { at: at + 0.55, actor: 'bj', do: 'stretchTo', amount: i < 3 ? FAT : 1, dur: 0.15, ease: 'back' },
        ]),
        { at: 4.9, actor: 'melon', do: 'vanish', dur: 0.1 },
        { at: 5.0, actor: 'bj', do: 'moveTo', to: { x: BX, y: BJG }, dur: 0.3 },
        { at: 5.4, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.2 },
        { at: 5.8, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.2 },
        // 悟空：成功了！
        { at: 1.3, actor: 'wk', do: 'swap', emoji: 'prop:wukong-happy' },
        { at: 1.35, actor: 'wk', do: 'hop', amount: 5, dur: 0.35 },
        { at: 3.2, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
        { at: 4.6, actor: 'wk', do: 'hop', amount: 6, dur: 0.35 },
        { at: 5.6, actor: 'wk', do: 'tilt', amount: 6, dur: 0.4 },
      ],
      fx: [
        ...b.fx,
        ...p.fx,
        { at: 1.05, kind: 'puff', actor: 'melon', dur: 0.4 },
        { at: 1.15, kind: 'burst', actor: 'bj', emoji: '✨', n: 7, dur: 0.6 },
        ...bites.flatMap((at, i): Fx[] => [
          { at: at + 0.1, kind: 'burst', actor: 'bj', emoji: '🔴', n: 5 + i, dx: -6, dy: 14, dur: 0.45, scale: 0.35 + 0.05 * i },
        ]),
        { at: 1.4, kind: 'pop', actor: 'wk', emoji: '😆', dur: 1.0 },
        { at: 4.9, kind: 'burst', x: MELON.x, y: 66, emoji: '✨', n: 5, dur: 0.4 },
        { at: 5.0, kind: 'pop', actor: 'bj', emoji: '😋', dx: -8, dur: 1.2 },
      ],
      camera: [START, release(0.3), { at: 1.05, dur: 0.3, do: 'shake', amount: 1.2 }, hold(5.6, 0.6)],
      cues: [
        ...b.cues,
        ...p.cues,
        { at: 1.05, sfx: 'bonk' },
        { at: 1.15, sfx: 'blip' },
        { at: 1.3, say: '毛變大瓜了！豬八戒吃好多！' },
        ...bites.map((at): Cue => ({ at: at + 0.1, sfx: 'gulp' })),
      ],
    })
  })(),

  // 好多蜂！豬八戒快跑！——一吹，變出一群蜜蜂；豬八戒跳起來扛著釘耙往右逃，蜜蜂追出去；
  // 繞一圈從左邊衝回來，悟空笑到跳起來，豬八戒從他腳下跑過，屁股被叮一下跳得更高，又衝出右邊；
  // 蜜蜂飛走，豬八戒喘著走回來、坐倒在地上。悟空不好意思地又捏起一根毛。回到 W2
  'hair:蜂': (() => {
    const b = blowHair(0.1)
    const p = poof(0.65, POP, 1.5)
    // 蜜蜂從「啵」的地方散開
    const spread = [{ x: 76, y: 38 }, { x: 90, y: 42 }, { x: 82, y: 50 }, { x: 70, y: 46 }]
    // 第一圈：往右逃
    const RUN1 = 1.3
    // 第二圈：從左邊衝回來，從悟空腳下跑過
    const RUN2 = 2.4
    const RUN2_DUR = 1.5
    const STING = 3.05
    const BACK = 4.3
    // 豬八戒衝出右邊以後，外面被叮的三下（第三次出去以後、走回來之前）
    const OUCH = [3.75, 4.0, 4.25]
    return scene({
      duration: 7.2,
      bg: BG,
      actors: [
        wk('wukong-blow'),
        bj('bajie-dizzy'),
        ...BEES.map((id, i): Actor => ({ id, emoji: i === 3 ? 'prop:bee-sting' : 'prop:bee', x: POP.x, y: POP.y, size: 12, hidden: true, float: true })),
      ],
      moves: [
        ...b.moves,
        ...BEES.flatMap((id, i): Move[] => [
          { at: 0.65, actor: id, do: 'pop', dur: 0.15 },
          { at: 0.68, actor: id, do: 'moveTo', to: spread[i], dur: 0.25, ease: 'out' },
          { at: 0.95 + 0.05 * i, actor: id, do: 'hop', amount: 2, dur: 0.2 },
          // 追出右邊
          { at: RUN1 + 0.1 + 0.08 * i, actor: id, do: 'moveTo', to: { x: 200 + 8 * i, y: 40 + 4 * i }, dur: 0.75, ease: 'in' },
          { at: RUN1 + 0.2 + 0.08 * i, actor: id, do: 'flip' },
          // 第二圈從左邊追回來（叮人的那隻跑最前面）
          { at: RUN2 - 0.1, actor: id, do: 'moveTo', to: { x: -40 - 10 * (i === 3 ? -1.5 : i), y: 44 + 4 * i }, dur: 0.05 },
          { at: RUN2 + 0.05, actor: id, do: 'moveTo', to: { x: 210 + 10 * i, y: 36 + 5 * i }, dur: RUN2_DUR + 0.1, ease: 'linear' },
          { at: RUN2 + 0.3 + 0.1 * i, actor: id, do: 'hop', amount: 4, dur: 0.4 },
          { at: RUN2 + 0.8 + 0.1 * i, actor: id, do: 'hop', amount: 4, dur: 0.4 },
        ]),
        // 豬八戒：嚇得跳起來，往右逃
        { at: 0.8, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
        { at: 0.8, actor: 'bj', do: 'hop', amount: 7, dur: 0.4 },
        { at: RUN1, actor: 'bj', do: 'swap', emoji: 'prop:bajie-flee' },
        { at: RUN1, actor: 'bj', do: 'flip' },
        { at: RUN1, actor: 'bj', do: 'moveTo', to: { x: 195, y: BJG }, dur: 0.7, ease: 'in', anticipate: 4 },
        ...Array.from({ length: 4 }, (_, i): Move => ({ at: RUN1 + 0.1 + 0.15 * i, actor: 'bj', do: 'hop', amount: 2.5, dur: 0.15 })),
        // 從左邊衝回來
        { at: RUN2 - 0.1, actor: 'bj', do: 'moveTo', to: { x: -30, y: BJG }, dur: 0.05 },
        { at: RUN2, actor: 'bj', do: 'moveTo', to: { x: 200, y: BJG }, dur: RUN2_DUR, ease: 'linear' },
        ...Array.from({ length: 9 }, (_, i): Move => ({ at: +(RUN2 + 0.16 * i).toFixed(2), actor: 'bj', do: 'hop', amount: 2.5, dur: 0.16 })),
        // 屁股被叮：跳得更高
        { at: STING, actor: 'bj', do: 'hop', amount: 12, dur: 0.45 },
        { at: STING, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
        { at: STING + 0.45, actor: 'bj', do: 'swap', emoji: 'prop:bajie-flee' },
        // 蜜蜂飛走，豬八戒喘著走回來，坐倒
        { at: BACK - 0.1, actor: 'bj', do: 'flip' },
        { at: BACK - 0.1, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
        ...walk('bj', BACK, { x: BX, y: BJG }, 1.3, 0.26, 1.4),
        { at: BACK + 1.35, actor: 'bj', do: 'swap', emoji: 'prop:bajie-dizzy' },
        { at: BACK + 1.35, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
        { at: BACK + 2.1, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.3 },
        // 悟空：笑到跳起來，豬八戒從腳下跑過
        { at: 1.4, actor: 'wk', do: 'swap', emoji: 'prop:wukong-happy' },
        { at: 1.5, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
        { at: 1.9, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
        { at: 2.4, actor: 'wk', do: 'squash', amount: 0.2, dur: 0.15 },
        { at: 2.55, actor: 'wk', do: 'hop', amount: 40, dur: 0.8 },
        { at: 2.55, actor: 'wk', do: 'spin', times: 1, dur: 0.8, pivot: 'center' },
        // 畫面右邊外面一下一下傳來「被叮」：悟空一下比一下縮得大（看得出又痛又好笑）
        ...OUCH.flatMap((at, i): Move[] => [
          { at, actor: 'wk', do: 'squash', amount: 0.1 + 0.06 * i, dur: 0.2 },
          { at: at + 0.02, actor: 'wk', do: 'tilt', amount: 6 + 3 * i, dur: 0.25 },
        ]),
        // 看到他喘著回來，不好意思
        { at: 5.2, actor: 'wk', do: 'swap', emoji: 'prop:wukong-blow' },
        { at: 5.25, actor: 'wk', do: 'tilt', amount: 8, dur: 0.5 },
        { at: 6.3, actor: 'wk', do: 'squash', amount: 0.06, dur: 0.3 },
      ],
      fx: [
        ...b.fx,
        ...p.fx,
        { at: 0.8, kind: 'pop', actor: 'bj', emoji: '❗', dur: 0.5 },
        { at: 1.4, kind: 'sweat', actor: 'bj' },
        { at: 1.6, kind: 'pop', actor: 'wk', emoji: '😆', dur: 1.0 },
        { at: STING, kind: 'burst', actor: 'bj', emoji: '💥', n: 1, dx: -10, dy: 24, dur: 0.35, scale: 0.8 },
        { at: STING + 0.05, kind: 'pop', actor: 'bj', emoji: '😱', dur: 0.6 },
        { at: 3.7, kind: 'pop', actor: 'wk', emoji: '😆', dur: 1.0 },
        // 外面被叮：右邊畫面邊上一下一下冒 💥，一下比一下大，最後一下冒 ❗
        ...OUCH.map((at, i): Fx => ({ at, kind: 'burst', x: 150, y: [56, 46, 60][i], emoji: '💥', n: 1, dur: 0.3, scale: 0.7 + 0.25 * i })),
        { at: OUCH[2] + 0.05, kind: 'burst', x: 148, y: 34, emoji: '❗', n: 1, dur: 0.35, scale: 0.9 },
        { at: BACK + 0.2, kind: 'sweat', actor: 'bj' },
        { at: BACK + 0.8, kind: 'sweat', actor: 'bj' },
        { at: BACK + 1.4, kind: 'dizzy', actor: 'bj', dur: 1.0 },
        { at: 5.3, kind: 'pop', actor: 'wk', emoji: '😅', dur: 0.9 },
      ],
      // 繞圈跑、悟空跳到最高：整段全景（自動取景跟著跑來跑去的人會晃）
      camera: [START, release(0.3, 0.4), { at: 1.1, dur: 0.4, do: 'zoom', amount: 1.02, to: MID },
        ...OUCH.map((at, i): Camera => ({ at, dur: 0.2, do: 'shake', amount: 0.5 + 0.3 * i })),
        release(4.9, 0.5), hold(6.4, 0.6)],
      cues: [
        ...b.cues,
        ...p.cues,
        { at: 0.8, sfx: 'boing' },
        { at: 0.9, say: '好多蜂！豬八戒快跑！' },
        { at: RUN1, sfx: 'whoosh' },
        { at: RUN2, sfx: 'whoosh' },
        { at: 2.55, sfx: 'boing' },
        { at: STING, sfx: 'bonk' },
        ...OUCH.map((at): Cue => ({ at, sfx: 'bonk' })),
        { at: BACK + 1.35, sfx: 'plop' },
      ],
    })
  })(),

  // 蟹拉他的鼻子！鼻子好大！——一吹，變出一隻螃蟹，橫著走過去，跳起來夾住豬八戒的鼻子，用力往外拉、拉、拉，
  // 鼻子被拉成長長一條；一放開，鼻子「啪」縮回去腫成一大顆。停一拍——「啵」消下去，螃蟹橫著走掉。回到 W2
  'hair:蟹': (() => {
    const b = blowHair(0.1)
    const p = poof(0.65, POP, 1.5)
    const CS = 14
    const CRAB0 = { x: 84, y: ground(CS) }
    // 豬八戒（bajie-shock）的鼻子：相對他的中心
    const nose = { x: BX, y: BJG + SNOUT_DY }
    const PINCH = 1.75
    const LET = 3.0
    const POOF_NOSE = 4.55
    const pullTo = [nose.x - 14, nose.x - 22, nose.x - 32]
    const NOSE_C = '#F6A5AE'
    return scene({
      duration: 6.6,
      bg: BG,
      actors: [
        wk('wukong-blow'),
        bj('bajie-dizzy'),
        { id: 'crab', emoji: 'prop:crab', x: POP.x, y: POP.y, size: CS, hidden: true, flip: true },
      ],
      moves: [
        ...b.moves,
        { at: 0.65, actor: 'crab', do: 'pop', dur: 0.15 },
        { at: 0.75, actor: 'crab', do: 'moveTo', to: CRAB0, dur: 0.25, ease: 'in' },
        { at: 1.0, actor: 'crab', do: 'squash', amount: 0.2, dur: 0.2 },
        // 橫著走過去，跳起來夾住鼻子
        { at: 1.15, actor: 'crab', do: 'swap', emoji: 'prop:crab-walk' },
        ...walk('crab', 1.15, { x: 92, y: CRAB0.y }, 0.3, 0.1, 1),
        { at: 1.45, actor: 'crab', do: 'swap', emoji: 'prop:crab-pinch' },
        { at: 1.45, actor: 'crab', do: 'moveTo', to: { x: nose.x - 9, y: nose.y }, arc: 6, dur: 0.3, ease: 'out' },
        { at: PINCH, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
        { at: PINCH, actor: 'bj', do: 'hop', amount: 3, dur: 0.25 },
        // 拉、拉、拉：一下比一下遠，豬八戒被拉得往前傾
        ...pullTo.flatMap((x, i): Move[] => [
          { at: 2.0 + 0.32 * i, actor: 'crab', do: 'moveTo', to: { x, y: nose.y + i }, dur: 0.18, ease: 'out' },
          { at: 2.0 + 0.32 * i, actor: 'bj', do: 'rotateTo', amount: -5, dur: 0.18 },
        ]),
        // 放開：鼻子縮回去、腫成一大顆
        { at: LET, actor: 'bj', do: 'rotateTo', amount: 15, dur: 0.2, ease: 'back' },
        { at: LET, actor: 'crab', do: 'moveTo', to: { x: 74, y: CRAB0.y }, arc: 10, dur: 0.4, ease: 'out' },
        { at: LET, actor: 'crab', do: 'spin', times: -1, dur: 0.4, pivot: 'center' },
        { at: LET + 0.4, actor: 'crab', do: 'swap', emoji: 'prop:crab' },
        { at: LET + 0.3, actor: 'bj', do: 'shake', amount: 0.6, dur: 0.4 },
        { at: LET + 0.9, actor: 'bj', do: 'tilt', amount: -5, dur: 0.4 },
        { at: LET + 1.3, actor: 'bj', do: 'tilt', amount: 5, dur: 0.3 },
        // 啵：消下去，坐回地上
        { at: POOF_NOSE, actor: 'bj', do: 'squash', amount: -0.15, dur: 0.25 },
        { at: POOF_NOSE + 0.5, actor: 'bj', do: 'swap', emoji: 'prop:bajie-dizzy' },
        { at: POOF_NOSE + 0.5, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.3 },
        { at: 6.1, actor: 'bj', do: 'squash', amount: 0.08, dur: 0.3 },
        // 螃蟹橫著走掉（從悟空腳邊過去，悟空跳一下讓它過）
        { at: 4.0, actor: 'crab', do: 'swap', emoji: 'prop:crab-walk' },
        ...walk('crab', 4.05, { x: -20, y: CRAB0.y }, 1.4, 0.1, 1),
        { at: 4.25, actor: 'wk', do: 'hop', amount: 9, dur: 0.4 },
        { at: 5.5, actor: 'crab', do: 'vanish', dur: 0.05 },
        // 悟空：傻眼 → 笑 → 不好意思又捏起一根毛
        { at: PINCH, actor: 'wk', do: 'swap', emoji: 'prop:wukong-shock' },
        { at: LET + 0.2, actor: 'wk', do: 'swap', emoji: 'prop:wukong-happy' },
        { at: LET + 0.3, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
        { at: LET + 0.75, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
        { at: 5.1, actor: 'wk', do: 'swap', emoji: 'prop:wukong-blow' },
        { at: 5.15, actor: 'wk', do: 'tilt', amount: 8, dur: 0.5 },
        { at: 6.0, actor: 'wk', do: 'squash', amount: 0.06, dur: 0.3 },
      ],
      fx: [
        ...b.fx,
        ...p.fx,
        { at: 1.0, kind: 'pop', actor: 'crab', emoji: '❗', dur: 0.4 },
        { at: PINCH, kind: 'burst', x: nose.x - 4, y: nose.y, emoji: '💥', n: 1, dur: 0.3, scale: 0.7 },
        { at: PINCH, kind: 'pop', actor: 'bj', emoji: '😱', dx: 4, dur: 0.8 },
        // 拉長的鼻子：粉紅色的伸縮管，從鼻子接到螃蟹
        { at: 2.0, kind: 'tube', actor: 'bj', dx: 0, dy: SNOUT_DY, target: 'crab', color: NOSE_C, width: 5, n: 2.6, dur: LET - 2.0 },
        { at: 2.6, kind: 'sweat', actor: 'bj' },
        // 腫成一大顆：粉紅色的大圓（一格一格脹大、再微微一脹一縮），兩個鼻孔
        ...[[0.0, 5], [0.06, 7.5], [0.12, 9.5], [0.2, 10.5], [0.45, 10], [0.7, 10.5], [0.95, 10], [1.2, 10.5]].map(([dt, w], i, arr): Fx => ({
          at: LET + dt, kind: 'tube', actor: 'bj', dx: -1, dy: SNOUT_DY + 1, to: { x: nose.x - 0.8, y: nose.y + 1 }, color: NOSE_C, width: w,
          dur: (i < arr.length - 1 ? arr[i + 1][0] : POOF_NOSE - LET) - dt,
        })),
        ...[-1, 1].map((s): Fx => ({ at: LET + 0.12, kind: 'tube', actor: 'bj', dx: -1 + 2.2 * s, dy: SNOUT_DY + 1.6, to: { x: nose.x - 0.8 + 2.2 * s, y: nose.y + 1.8 }, color: '#7A3B45', width: 1.8, dur: POOF_NOSE - LET - 0.12 })),
        { at: LET, kind: 'burst', x: nose.x, y: nose.y, emoji: '✨', n: 6, dur: 0.5 },
        { at: LET + 0.4, kind: 'pop', actor: 'bj', emoji: '😵', dx: 6, dur: 1.0 },
        { at: LET + 0.3, kind: 'pop', actor: 'wk', emoji: '😆', dur: 1.0 },
        { at: POOF_NOSE, kind: 'burst', x: nose.x, y: nose.y, emoji: 'prop:smoke', n: 1, dur: 0.4, scale: 1.0 },
        { at: POOF_NOSE + 0.5, kind: 'dizzy', actor: 'bj', dur: 1.0 },
        { at: 5.2, kind: 'pop', actor: 'wk', emoji: '😅', dur: 0.9 },
      ],
      camera: [START, release(0.3),
        { at: LET + 0.1, dur: 0.35, do: 'zoom', amount: 1.45, to: aim({ x: 92, y: 52 }, 1.45) },
        { at: LET + 1.1, dur: 0.6, do: 'zoom', amount: 1 },
        hold(5.9, 0.6)],
      cues: [
        ...b.cues,
        ...p.cues,
        { at: PINCH, sfx: 'crack' },
        { at: 1.85, say: '蟹拉他的鼻子！鼻子好大！' },
        { at: 2.0, sfx: 'slide' },
        { at: 2.32, sfx: 'slide' },
        { at: 2.64, sfx: 'slide' },
        { at: LET, sfx: 'boing' },
        { at: POOF_NOSE, sfx: 'deflate' },
      ],
    })
  })(),

  // 豬八戒吃太多了。他笑了。——吞下最後一口，往後一躺，肚子圓得像一顆球；拍拍肚子、打一個大嗝，
  // 躺著哈哈大笑，肚子跟著一抖一抖。悟空也開心得跳起來
  full: scene({
    duration: 5.0,
    bg: BG,
    actors: [wk('wukong-happy'), bj('bajie-melon')],
    moves: [
      { at: 0, dur: 0, actor: 'bj', do: 'stretchTo', amount: FAT_ALL },
      { at: 0.15, actor: 'bj', do: 'squash', amount: 0.12, dur: 0.2 },
      // 往後一躺
      { at: 0.5, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
      { at: 0.5, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
      // 拍拍肚子
      { at: 1.1, actor: 'bj', do: 'squash', amount: 0.08, dur: 0.18 },
      { at: 1.35, actor: 'bj', do: 'squash', amount: 0.08, dur: 0.18 },
      // 打嗝
      { at: 1.75, actor: 'bj', do: 'squash', amount: -0.15, dur: 0.3 },
      { at: 1.75, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
      // 哈哈大笑：肚子一抖一抖
      ...[2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.1, 4.5].map((at): Move => ({ at, actor: 'bj', do: 'squash', amount: 0.07, dur: 0.2 })),
      // 悟空也開心
      { at: 0.6, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.0, actor: 'wk', do: 'hop', amount: 5, dur: 0.35 },
      { at: 2.6, actor: 'wk', do: 'hop', amount: 7, dur: 0.4 },
      { at: 2.6, actor: 'wk', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
      { at: 3.5, actor: 'wk', do: 'hop', amount: 4, dur: 0.3 },
      { at: 4.3, actor: 'wk', do: 'tilt', amount: 6, dur: 0.4 },
    ],
    fx: [
      { at: 0.5, kind: 'puff', actor: 'bj', dur: 0.4 },
      { at: 1.1, kind: 'burst', actor: 'bj', emoji: '✨', n: 3, dx: -10, dy: 10, dur: 0.3, scale: 0.6 },
      { at: 1.35, kind: 'burst', actor: 'bj', emoji: '✨', n: 3, dx: -10, dy: 10, dur: 0.3, scale: 0.6 },
      // 打嗝：嘴巴（躺著時頭在右上）噴出一大團
      { at: 1.75, kind: 'blow', x: 122, y: 54, to: { x: 132, y: 32 }, n: 3, dur: 0.7, scale: 1.6 },
      { at: 1.8, kind: 'burst', x: 124, y: 50, emoji: '💨', n: 1, dur: 0.5, scale: 1.2 },
      { at: 2.5, kind: 'pop', actor: 'bj', emoji: '😆', dx: 4, dur: 1.6 },
      { at: 2.6, kind: 'burst', actor: 'bj', emoji: '🎵', n: 5, dy: 4, dur: 0.8 },
      { at: 2.0, kind: 'pop', actor: 'wk', emoji: '😆', dur: 1.2 },
    ],
    // 躺下來很寬：整段定住一個框得住兩個人的構圖
    camera: [START, { at: 0.3, dur: 0.6, do: 'zoom', amount: 1.25, to: aim({ x: 86, y: 52 }, 1.25) }, { at: 1.75, dur: 0.3, do: 'punch', amount: 0.08, to: { x: 112, y: 52 } }, hold(4.3, 0.6)],
    cues: [
      { at: 0.15, sfx: 'gulp' },
      { at: 0.5, sfx: 'plop' },
      { at: 1.1, sfx: 'tap' },
      { at: 1.35, sfx: 'tap' },
      { at: 1.75, sfx: 'hic' },
      { at: 0.7, say: '豬八戒吃太多了。他笑了。' },
      { at: 2.6, sfx: 'cheer' },
    ],
  }),

  // 他們坐雲回家。雲飛好慢！——悟空吹一聲口哨，筋斗雲飛過來，他跳上去飄起來；另一朵雲鑽到豬八戒底下，
  // 一載上去就被壓扁、貼著地面；悟空在前面用繩子拉，越拉越用力、滿頭大汗，雲才挪一點點——
  // 一隻蝸牛從後面慢慢爬過來，超過他們。定格：蝸牛在前面，悟空傻眼，豬八戒躺在雲上睡著了
  cloud: (() => {
    const NS = 54
    const LIFT = 10 // 雲鑽到底下時把豬八戒抬多高
    const RIDE = { x: 44, y: 46 } // 悟空坐雲飄起來的地方
    const PULL = 3.0
    const C2Y = ground(NS) + 4 // 被壓扁、貼著地面的雲
    const SINK = 6 // 壓扁以後豬八戒往下沉多少
    // 繩子綁在雲的前端（雲 stretch 1.4 以後左邊緣約在中心左邊 30）
    const KNOT_DX = -26
    const KNOT_Y = 70
    const SNAIL_S = 14
    const step = 2.5 // 拉一次，雲挪多少
    return scene({
      duration: 8.0,
      bg: BG,
      actors: [
        { id: 'nimbus', emoji: 'prop:nimbus', x: -30, y: 34, size: 34, float: true, hidden: true },
        { id: 'cloud2', emoji: 'prop:nimbus', x: 200, y: ground(NS) + 2, size: NS, float: true, hidden: true },
        wk('wukong-happy'),
        bj('bajie-full'),
        { id: 'knot', emoji: '🪢', x: BX + KNOT_DX, y: KNOT_Y, size: 7, float: true, hidden: true },
        { id: 'snail', emoji: '🐌', x: 172, y: ground(SNAIL_S), size: SNAIL_S, hidden: true, tint: 'brightness(1.2) saturate(1.3)' },
      ],
      moves: [
        { at: 0, dur: 0, actor: 'bj', do: 'stretchTo', amount: FAT_ALL },
        // 口哨：筋斗雲飛過來，悟空跳上去
        { at: 0.2, actor: 'wk', do: 'hop', amount: 3, dur: 0.25 },
        { at: 0.28, actor: 'nimbus', do: 'pop', dur: 0.02 },
        { at: 0.3, actor: 'nimbus', do: 'moveTo', to: { x: WX, y: ground(34) + 2 }, dur: 0.6, ease: 'back' },
        { at: 0.95, actor: 'wk', do: 'hop', amount: 8, dur: 0.35 },
        { at: 1.3, actor: 'nimbus', do: 'vanish', dur: 0.05 },
        { at: 1.3, actor: 'wk', do: 'swap', emoji: 'prop:wukong-cloud' },
        { at: 1.3, actor: 'wk', do: 'flip' },
        { at: 1.35, actor: 'wk', do: 'moveTo', to: RIDE, dur: 0.5, ease: 'back' },
        // 另一朵雲貼著地面滑到豬八戒底下，把他抬起來——一載上去就被壓扁、貼著地面
        { at: 1.0, actor: 'cloud2', do: 'pop', dur: 0.02 },
        { at: 1.0, actor: 'cloud2', do: 'moveTo', to: { x: BX, y: ground(NS) + 2 }, dur: 0.6, ease: 'out' },
        { at: 1.7, actor: 'cloud2', do: 'moveTo', to: { x: BX, y: ground(NS) + 2 - LIFT }, dur: 0.25, ease: 'out' },
        { at: 1.7, actor: 'bj', do: 'moveTo', to: { x: BX, y: BJG - LIFT }, dur: 0.25, ease: 'out' },
        { at: 2.15, actor: 'cloud2', do: 'stretchTo', amount: 1.4, dur: 0.15 },
        { at: 2.15, actor: 'cloud2', do: 'moveTo', to: { x: BX, y: C2Y }, dur: 0.15, ease: 'in' },
        { at: 2.15, actor: 'bj', do: 'moveTo', to: { x: BX, y: BJG - LIFT + SINK }, dur: 0.15, ease: 'in' },
        { at: 2.3, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.25 },
        { at: 2.3, actor: 'cloud2', do: 'squash', amount: 0.2, dur: 0.25 },
        { at: PULL - 0.1, actor: 'knot', do: 'pop', dur: 0.1 },
        // 悟空拉：一次比一次用力，雲才挪一點點
        ...[0, 1, 2].flatMap((i): Move[] => {
          const at = PULL + 1.05 * i
          const dx = -step * (i + 1)
          return [
            { at, actor: 'wk', do: 'moveTo', to: { x: RIDE.x - 4 - 2 * i, y: RIDE.y - 1 }, dur: 0.25, ease: 'out' },
            { at: at + 0.25, actor: 'wk', do: 'shake', amount: 0.6 + 0.5 * i, dur: 0.5 },
            { at: at + 0.75, actor: 'wk', do: 'moveTo', to: { x: RIDE.x + 1 - 2 * i, y: RIDE.y }, dur: 0.25, ease: 'back' },
            { at: at + 0.3, actor: 'cloud2', do: 'moveTo', to: { x: BX + dx, y: C2Y }, dur: 0.6 },
            { at: at + 0.3, actor: 'bj', do: 'moveTo', to: { x: BX + dx, y: BJG - LIFT + SINK }, dur: 0.6 },
            { at: at + 0.3, actor: 'knot', do: 'moveTo', to: { x: BX + KNOT_DX + dx, y: KNOT_Y }, dur: 0.6 },
          ]
        }),
        { at: 6.3, actor: 'wk', do: 'shake', amount: 1.6, dur: 0.6 },
        // 蝸牛從後面慢慢爬過來，超過他們
        { at: 3.2, actor: 'snail', do: 'pop', dur: 0.05 },
        { at: 3.2, actor: 'snail', do: 'moveTo', to: { x: 50, y: ground(SNAIL_S) }, dur: 4.4, ease: 'linear' },
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Move => ({ at: 3.3 + 0.55 * i, actor: 'snail', do: 'squash', amount: -0.12, dur: 0.45 })),
        // 豬八戒躺在雲上睡著
        { at: 2.9, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.35 },
        { at: 4.6, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.35 },
        { at: 6.0, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.35 },
        { at: 7.2, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.35 },
        { at: 7.0, actor: 'wk', do: 'tilt', amount: -6, dur: 0.5 },
      ],
      fx: [
        { at: 0.2, kind: 'blow', actor: 'wk', dx: 4, dy: 8, to: { x: 30, y: 24 }, emoji: '🎵', n: 2, dur: 0.6 },
        { at: 1.3, kind: 'burst', actor: 'wk', emoji: '✨', n: 6, dur: 0.5 },
        { at: 2.15, kind: 'puff', actor: 'cloud2', dur: 0.5 },
        { at: 2.3, kind: 'sweat', actor: 'cloud2', dx: -14, dy: 10 },
        // 繩子：悟空拉著豬八戒那朵雲（演完以後還留著）
        { at: PULL, kind: 'line', actor: 'wk', dx: 9, dy: 4, target: 'knot', color: '#8A5A2B', width: 1, dur: 30 },
        { at: PULL + 0.3, kind: 'sweat', actor: 'wk' },
        { at: PULL + 1.35, kind: 'sweat', actor: 'wk' },
        { at: PULL + 2.4, kind: 'sweat', actor: 'wk' },
        { at: PULL + 2.4, kind: 'pop', actor: 'wk', emoji: '💦', dx: -12, dur: 0.7 },
        { at: PULL + 0.3, kind: 'puff', actor: 'cloud2', dur: 0.5 },
        { at: PULL + 1.35, kind: 'puff', actor: 'cloud2', dur: 0.5 },
        { at: PULL + 2.4, kind: 'puff', actor: 'cloud2', dur: 0.5 },
        // 這兩個效果的長度超過劇本：最後一格（整本故事停在這裡）還看得到
        { at: 2.9, kind: 'zzz', actor: 'bj', dx: 6, dur: 6 },
        { at: 6.4, kind: 'pop', actor: 'wk', emoji: '😑', dx: -12, dur: 3 },
        { at: 6.2, kind: 'pop', actor: 'snail', emoji: '👋', dur: 1.2 },
      ],
      camera: [START, release(0.3), hold(1.8, 0.6)],
      cues: [
        { at: 0.3, sfx: 'whoosh' },
        { at: 1.0, sfx: 'whoosh' },
        { at: 1.3, sfx: 'boing' },
        { at: 2.15, sfx: 'deflate' },
        { at: 2.4, say: '他們坐雲回家。雲飛好慢！' },
        { at: PULL, sfx: 'slide' },
        { at: PULL + 1.05, sfx: 'slide' },
        { at: PULL + 2.1, sfx: 'slide' },
      ],
    })
  })(),
}

export default scenes
