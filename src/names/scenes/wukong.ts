// 演的是本尊：《西遊記》的孫悟空——拔一根猴毛一吹就變出一群小猴子（身外身法），愛偷吃仙桃，最後駕筋斗雲。造型照傳統年畫（prop:wukong 那一套），不照任何改編作品。
import type { Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import { pressStack } from '../../anim/helpers'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：悟空搆不到樹頂的仙桃，拔毛一吹就變出小分身疊在他頭上去摘，一次疊得比一次高——結果摘到的那隻自己把桃子吃掉。
// 同一個鼓臉吹毛、同一聲「啵」、同一個往上跳著搆，三次只有塔越疊越高：一隻（差一大截）→ 再兩隻（指尖差一點點、塔開始晃）→
// 停一拍（他吸一大口氣、臉鼓到最大）→ 再兩隻，一路疊到樹頂、搖得厲害。停一拍——最上面那隻摘到桃子，坐下來自己啃。
// 反轉：悟空氣得舉金箍棒往頭上一敲，分身「啵啵啵」從下往上全變回猴毛飄落；咬過一口的桃子直直掉下來砸在他頭上，彈進他懷裡。
// 筋斗雲飄過來，他抱著桃子坐上去升到畫面中間：「孫悟空」。
const S = 32 // 悟空的 size（prop 圖留白多，鏡頭再推近補）
const G = 77 - 0.42 * S // 悟空站在地上的 y
const TX = 74 // 悟空站的地方，也是羅漢塔的中線
const CS = 16 // 分身的 size：本尊的一半，全景裡也看得出是一隻一隻的小悟空
const RISE = 8.3 // 疊上去一隻塔高多少：踩在下面那隻的肩膀上，跟下面那隻重疊約四成
/** 第 n 隻分身（1 是踩在悟空頭上那隻）站好的 y：第一隻的腳踩在悟空的額頭（v 0.2）上 */
const cy = (n: number) => G - 0.3 * S - 0.42 * CS - (n - 1) * RISE
/** 一左一右錯開，腳才踩在下面那隻的肩膀、不會踩在臉上 */
const cx = (n: number) => TX + (n % 2 ? 3 : -3)
const PEACH = { x: TX + 10, y: 11 } // 樹頂唯一的那顆仙桃：5 隻疊好、最上面那隻伸手剛好搆到
const PS = 9
const POP = { x: TX + 19, y: 38 } // 猴毛飛到這裡「啵」變出分身（樹幹旁的天空，離悟空的臉遠一點）
const TS = 86 // 又高又瘦的樹，樹冠在最上面（y 1～18），沒有別的果子
const TREE = TX + 21
const ALL = ['c1', 'c2', 'c3', 'c4', 'c5']
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡（引擎還會再夾在背景裡） */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })

/** 塔搖一搖：越上面晃得越大。n 是現在疊了幾隻 */
function sway(at: number, amp: number, n: number): Move[] {
  return ALL.slice(0, n).flatMap((id, i) => {
    const off = amp * ((i + 1) / n)
    return [
      { at, actor: id, do: 'moveTo' as const, to: { x: cx(i + 1) + off, y: cy(i + 1) }, dur: 0.13, ease: 'out' as const },
      { at: at + 0.13, actor: id, do: 'moveTo' as const, to: { x: cx(i + 1) - off * 0.8, y: cy(i + 1) }, dur: 0.17 },
      { at: at + 0.3, actor: id, do: 'moveTo' as const, to: { x: cx(i + 1), y: cy(i + 1) }, dur: 0.15, ease: 'out' as const },
    ]
  })
}

/**
 * 主軸笑點：鼓臉吸氣 → 吹一口，猴毛飛出去「啵」一團煙 → 變出分身，一隻一隻跳上去疊在頭上。
 * k 是第幾次（0、1、2），from 是這次第一隻新分身的編號（1 起算）、count 是這次變出幾隻。p 是吹出去那一刻。
 * 回傳 land＝最後一隻疊好的時間。
 */
function blow(p: number, k: number, from: number, count: number) {
  const stacked = ALL.slice(0, from - 1)
  const inhale = 0.1 + 0.07 * k
  const out = 0.18 + 0.05 * k
  const moves: Move[] = [
    { at: p - 0.45, actor: 'wk', do: 'swap', emoji: 'prop:wukong-blow' },
    { at: p - 0.4, actor: 'wk', do: 'squash', amount: -inhale, dur: 0.35 },
    ...pressStack(p - 0.4, 0.35, -inhale, S, stacked),
    { at: p, actor: 'wk', do: 'squash', amount: out, dur: 0.25 },
    ...pressStack(p, 0.25, out, S, stacked),
    { at: p + 0.3, actor: 'wk', do: 'swap', emoji: 'prop:wukong' },
  ]
  let land = 0
  for (let j = 0; j < count; j++) {
    const id = ALL[from - 1 + j]
    const hop = p + 0.4 + 0.11 * j
    land = hop + 0.26
    moves.push(
      { at: p + 0.25, actor: id, do: 'pop', dur: 0.3 },
      { at: hop, actor: id, do: 'moveTo', to: { x: cx(from + j), y: cy(from + j) }, arc: 5, dur: 0.26, ease: 'out' },
      { at: land, actor: id, do: 'squash', amount: 0.18, dur: 0.18 },
    )
  }
  const fx: Fx[] = [
    // 猴毛從手上吹出去（一次比一次多根）
    { at: p, kind: 'blow', actor: 'wk', dx: 8, dy: 7, to: POP, emoji: 'prop:monkey-hair', n: count, dur: 0.32 },
    { at: p + 0.25, kind: 'burst', x: POP.x, y: POP.y - 4, emoji: 'prop:smoke', n: 1, dur: 0.45, scale: [1.2, 1.5, 1.8][k] },
    { at: p + 0.28, kind: 'burst', x: POP.x, y: POP.y - 4, emoji: '✨', n: 4 + 3 * k, dur: 0.5, scale: 0.9 + 0.2 * k },
  ]
  const camera: Camera[] = [{ at: p + 0.25, dur: 0.3, do: 'shake', amount: 0.4 + 0.4 * k }]
  // 同一個音效：吹（咻）＋啵，一隻疊上去一聲
  const cues: Cue[] = [{ at: p, sfx: 'whoosh' }, { at: p + 0.25, sfx: 'poof' }]
  for (let j = 0; j < count; j++) cues.push({ at: p + 0.66 + 0.11 * j, sfx: 'tap' })
  return { moves, fx, camera, cues, land }
}

/** 最上面那隻往上跳著搆桃子（每一次都一樣），沒搆到。n 是最上面那隻的編號 */
function reach(at: number, n: number) {
  const id = ALL[n - 1]
  const moves: Move[] = [
    { at, actor: id, do: 'swap', emoji: 'prop:wukong-happy' },
    { at, actor: id, do: 'squash', amount: -0.2, dur: 0.45 },
    { at, actor: id, do: 'hop', amount: 11, dur: 0.45 },
    { at: at + 0.47, actor: id, do: 'swap', emoji: 'prop:wukong' },
    // 底下的悟空被踩得一沉
    { at: at + 0.4, actor: 'wk', do: 'squash', amount: 0.12, dur: 0.2 },
    ...pressStack(at + 0.4, 0.2, 0.12, S, ALL.slice(0, n)),
  ]
  const cues: Cue[] = [{ at, sfx: 'boing' }]
  return { moves, cues }
}

const P1 = 1.6, P2 = 3.2, P3 = 5.6
const b1 = blow(P1, 0, 1, 1)
const r1 = reach(b1.land + 0.08, 1)
const b2 = blow(P2, 1, 2, 2)
const r2 = reach(b2.land + 0.08, 3)
const SW2 = b2.land + 0.55 // 第二次沒搆到，塔開始晃
const INHALE = 4.8 // 第三次前停一拍：吸一大口氣
const b3 = blow(P3, 2, 4, 2)
const SW3 = b3.land + 0.02 // 疊到樹頂，搖得很厲害
const GRAB = 7.2 // 停一拍之後，最上面那隻摘到桃子
const SHOCK = 7.8 // 鏡頭拉回本尊：傻眼
const STRIKE = 8.3 // 反轉：舉金箍棒往頭上一敲
const CHAIN = 8.4 // 分身從下往上一隻一隻變回猴毛
const FALL = 8.75 // 桃子掉下來
const BONK = 9.05 // 砸在頭上
const CATCH = 9.45 // 彈進懷裡
const RIDE = 9.85 // 筋斗雲載著他升上來
const UP = { x: 70, y: 40 } // 亮相時悟空的位置
const CLOUD_DY = 7 // 筋斗雲在悟空底下多少

export default scene({
  duration: 11.9,
  bg: { top: '#F4A6B8', bottom: '#FFE6BF', floor: '#8FC25A', scenery: 'hills' },
  actors: [
    { id: 'mtn', emoji: 'prop:mountain', x: 26, y: 50, size: 66, tint: 'saturate(.6) brightness(1.15)' },
    { id: 'tree', emoji: 'prop:tall-tree', x: TREE, y: 77 - 0.42 * TS, size: TS },
    { id: 'cloud', emoji: 'prop:nimbus', x: -30, y: G + CLOUD_DY, size: 34, float: true },
    { id: 'wk', emoji: 'prop:wukong-look', x: TX, y: G, size: S, flip: true },
    // 樹頂那顆仙桃畫在分身後面：摘的那一下不會蓋住分身的臉
    { id: 'goal', emoji: 'prop:peach', x: PEACH.x, y: PEACH.y, size: PS, float: true },
    // 分身：一開始躲在「啵」的地方，被吹出來才 pop
    ...ALL.map((id, i) => {
      const j = i === 0 ? 0 : (i - 1) % 2 // 第一次一隻，之後每次兩隻
      const n = i === 0 ? 1 : 2
      return { id, emoji: 'prop:wukong', x: POP.x + 6 * (j - (n - 1) / 2), y: POP.y - 2 * j, size: CS, flip: true, hidden: true }
    }),
  ],
  moves: [
    // 開場：手搭眉毛往上看，仙桃閃一下；蹲低、跳起來搆——差一大截
    { at: 0.1, actor: 'wk', do: 'tilt', amount: -8, dur: 0.5 },
    { at: 0.15, actor: 'goal', do: 'flash', dur: 0.6 },
    // 仙桃一直一閃一閃，提醒目標在那裡
    { at: 2.0, actor: 'goal', do: 'flash', dur: 0.5 },
    { at: 3.9, actor: 'goal', do: 'flash', dur: 0.5 },
    { at: 6.4, actor: 'goal', do: 'flash', dur: 0.5 },
    { at: 0.5, actor: 'wk', do: 'squash', amount: 0.15, dur: 0.18 },
    { at: 0.65, actor: 'wk', do: 'swap', emoji: 'prop:wukong-happy' },
    { at: 0.65, actor: 'wk', do: 'hop', amount: 12, dur: 0.45 },
    { at: 1.1, actor: 'wk', do: 'swap', emoji: 'prop:wukong' },
    { at: 1.1, actor: 'wk', do: 'squash', amount: 0.2, dur: 0.2 },
    // 第一次：一隻分身，跳起來還差一大截
    ...b1.moves,
    ...r1.moves,
    // 第二次：再兩隻，跳起來指尖差一點點，桃子晃一下；塔開始搖
    ...b2.moves,
    ...r2.moves,
    { at: b2.land + 0.3, actor: 'goal', do: 'shake', amount: 0.8, dur: 0.35 },
    ...sway(SW2, 2, 3),
    { at: SW2, actor: 'wk', do: 'shake', amount: 0.5, dur: 0.4 },
    // 停一拍：吸一大口氣，臉鼓到最大、抖起來
    { at: INHALE, actor: 'wk', do: 'swap', emoji: 'prop:wukong-blow' },
    { at: INHALE + 0.05, actor: 'wk', do: 'squash', amount: -0.22, dur: 0.6 },
    ...pressStack(INHALE + 0.05, 0.6, -0.22, S, ALL.slice(0, 3)),
    { at: INHALE + 0.35, actor: 'wk', do: 'shake', amount: 0.6, dur: 0.3 },
    // 第三次：再三隻，一路疊到樹頂，整座塔搖得很厲害
    ...b3.moves.filter((m) => m.at >= P3 - 0.1), // 吸氣用上面那段長的
    ...sway(SW3, 4, 5),
    { at: SW3, actor: 'wk', do: 'shake', amount: 0.8, dur: 0.45 },
    // 停一拍——最上面那隻伸手，摘到了，坐下來自己啃
    { at: SW3 + 0.4, actor: 'c5', do: 'swap', emoji: 'prop:wukong-happy' },
    { at: GRAB, actor: 'goal', do: 'vanish', dur: 0.05 },
    { at: GRAB, actor: 'c5', do: 'swap', emoji: 'prop:wukong-peach' },
    { at: GRAB + 0.15, actor: 'c5', do: 'squash', amount: 0.15, dur: 0.18 },
    { at: GRAB + 0.4, actor: 'c5', do: 'squash', amount: 0.15, dur: 0.18 },
    // 鏡頭拉回本尊：傻眼
    { at: SHOCK, actor: 'wk', do: 'swap', emoji: 'prop:wukong-shock' },
    { at: SHOCK + 0.05, actor: 'wk', do: 'shake', amount: 0.9, dur: 0.4 },
    // 反轉：氣得舉金箍棒往頭上一敲——分身從下往上「啵啵啵」全變回猴毛
    { at: STRIKE, actor: 'wk', do: 'swap', emoji: 'prop:wukong-strike' },
    { at: STRIKE, actor: 'wk', do: 'squash', amount: -0.12, dur: 0.15 },
    ...ALL.map((id, i): Move => ({ at: CHAIN + 0.06 * i, actor: id, do: 'vanish', dur: 0.12 })),
    // 桃子從塔頂直直掉下來：他抬頭找——砸在頭上
    { at: CHAIN + 0.3, actor: 'goal', do: 'moveTo', to: { x: cx(5) + 2, y: cy(5) + 2 }, dur: 0.01 },
    { at: CHAIN + 0.31, actor: 'goal', do: 'pop', dur: 0.12 },
    { at: FALL, actor: 'wk', do: 'swap', emoji: 'prop:wukong-look' },
    { at: FALL, actor: 'goal', do: 'moveTo', to: { x: TX - 1, y: G - 0.43 * S - PS / 2 + 1.5 }, dur: BONK - FALL, ease: 'in' },
    { at: BONK, actor: 'wk', do: 'swap', emoji: 'prop:wukong-dizzy' },
    { at: BONK, actor: 'wk', do: 'squash', amount: 0.25, dur: 0.25 },
    // 彈起來，掉進他懷裡
    { at: BONK + 0.05, actor: 'goal', do: 'moveTo', to: { x: TX + 13, y: G - 24 }, dur: 0.18, ease: 'out' },
    { at: BONK + 0.23, actor: 'goal', do: 'moveTo', to: { x: TX + 0.14 * S, y: G + 0.16 * S }, dur: CATCH - BONK - 0.23, ease: 'in' },
    { at: CATCH, actor: 'goal', do: 'vanish', dur: 0.05 },
    { at: CATCH, actor: 'wk', do: 'swap', emoji: 'prop:wukong-peach' },
    // 筋斗雲飄過來，他抱著桃子坐上去，一起升到畫面中間
    { at: CATCH, actor: 'cloud', do: 'moveTo', to: { x: TX, y: G + CLOUD_DY }, dur: 0.35, ease: 'out' },
    { at: CATCH + 0.33, actor: 'wk', do: 'hop', amount: 3, dur: 0.25 },
    { at: RIDE, actor: 'wk', do: 'moveTo', to: UP, dur: 0.5, ease: 'back' },
    { at: RIDE, actor: 'cloud', do: 'moveTo', to: { x: UP.x, y: UP.y + CLOUD_DY }, dur: 0.5, ease: 'back' },
    // 亮相：坐在雲上啃桃子，雲一浮一浮
    { at: RIDE + 0.75, actor: 'wk', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: RIDE + 1.0, actor: 'cloud', do: 'hop', amount: 1.5, dur: 0.6 },
    { at: RIDE + 1.0, actor: 'wk', do: 'hop', amount: 1.5, dur: 0.6 },
    { at: RIDE + 1.45, actor: 'wk', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: RIDE + 1.7, actor: 'cloud', do: 'hop', amount: 1.5, dur: 0.6 },
    { at: RIDE + 1.7, actor: 'wk', do: 'hop', amount: 1.5, dur: 0.6 },
  ],
  fx: [
    { at: 0.2, kind: 'burst', actor: 'goal', emoji: '✨', n: 5, dy: 3, dur: 0.7, scale: 0.8 },
    { at: 1.1, kind: 'puff', actor: 'wk', n: 4, dur: 0.4 },
    ...b1.fx,
    { at: r1.moves[0].at + 0.5, kind: 'sweat', actor: 'wk', dur: 0.6 },
    ...b2.fx,
    { at: SW2, kind: 'sweat', actor: 'wk', dur: 0.7 },
    ...b3.fx,
    { at: SW3 + 0.4, kind: 'burst', actor: 'goal', emoji: '✨', n: 5, dy: 3, dur: 0.6, scale: 0.8 },
    { at: GRAB, kind: 'burst', actor: 'c5', emoji: '✨', n: 6, dy: -6, dur: 0.5, scale: 0.6 },
    // 分身一隻一隻「啵」，猴毛飄下來
    ...ALL.map((id, i): Fx => ({ at: CHAIN + 0.06 * i, kind: 'burst', actor: id, emoji: 'prop:smoke', n: 1, dy: -1, dur: 0.4, scale: 0.75 })),
    { at: CHAIN + 0.1, kind: 'rain', x: TX, y: 30, emoji: 'prop:monkey-hair', n: 6, dur: 1.0 },
    { at: CHAIN + 0.2, kind: 'rain', x: TX + 2, y: 12, emoji: 'prop:monkey-hair', n: 5, dur: 1.1 },
    { at: BONK, kind: 'burst', actor: 'wk', emoji: '💥', n: 1, dy: 2, dur: 0.35, scale: 0.9 },
    { at: BONK + 0.1, kind: 'dizzy', actor: 'wk', dur: 0.5 },
    { at: RIDE + 0.5, kind: 'burst', actor: 'wk', emoji: '✨', n: 10, dy: -6, dur: 0.9, scale: 1.3 },
    { at: RIDE + 0.9, kind: 'burst', actor: 'wk', emoji: '🎉', n: 7, dx: -6, dy: -16, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    // 開場就定住構圖：悟空與樹頂的仙桃都在畫面裡
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.2, to: aim({ x: TX + 10, y: 42 }, 1.2) },
    { at: 0.7, dur: 0.4, do: 'punch', amount: 0.05, to: { x: TX, y: 50 } },
    ...b1.camera,
    ...b2.camera,
    { at: r2.moves[0].at + 0.2, dur: 0.35, do: 'punch', amount: 0.08, to: PEACH },
    // 停一拍：推近悟空鼓起來的臉
    { at: INHALE, dur: 0.5, do: 'zoom', amount: 1.45, to: aim({ x: TX + 4, y: 50 }, 1.45) },
    // 第三次：退到全景，整座塔都在畫面裡
    { at: P3 + 0.1, dur: 0.45, do: 'zoom', amount: 1, to: MID },
    ...b3.camera,
    { at: SW3, dur: 0.45, do: 'shake', amount: 1.2 },
    // 停一拍，推到塔頂：摘到了
    { at: SW3 + 0.35, dur: 0.3, do: 'zoom', amount: 2, to: aim({ x: TX + 3, y: 21 }, 2) },
    // 直接切回本尊的反應（推回去的途中會切到他的頭）
    { at: SHOCK - 0.05, dur: 0, do: 'zoom', amount: 1.6, to: aim({ x: TX, y: 55 }, 1.6) },
    // 反轉：退到全景看整座塔變回毛
    { at: STRIKE - 0.05, dur: 0.3, do: 'zoom', amount: 1.2, to: aim({ x: TX + 10, y: 42 }, 1.2) },
    { at: STRIKE + 0.05, dur: 0.3, do: 'shake', amount: 1 },
    { at: BONK, dur: 0.35, do: 'punch', amount: 0.12, to: { x: TX, y: G - 5 } },
    { at: BONK, dur: 0.3, do: 'shake', amount: 1.2 },
    // 亮相
    { at: RIDE, dur: 0.6, do: 'zoom', amount: 1.6, to: aim({ x: UP.x, y: UP.y + 6 }, 1.6) },
  ],
  lights: [
    { at: P3 + 0.25, dur: 0.05, level: -0.3 },
    { at: P3 + 0.3, dur: 0.35, level: 0 },
    { at: BONK, dur: 0.05, level: -0.25 },
    { at: BONK + 0.05, dur: 0.3, level: 0 },
    { at: RIDE + 0.5, dur: 0.05, level: -0.3 },
    { at: RIDE + 0.55, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.2, sfx: 'blip' },
    { at: 0.65, sfx: 'boing' },
    ...b1.cues,
    ...r1.cues,
    ...b2.cues,
    ...r2.cues,
    { at: SW2, sfx: 'slide' },
    { at: INHALE + 0.05, sfx: 'bubble' },
    ...b3.cues,
    { at: SW3, sfx: 'rumble' },
    { at: GRAB, sfx: 'clink' },
    { at: GRAB + 0.15, sfx: 'gulp' },
    { at: GRAB + 0.4, sfx: 'gulp' },
    { at: STRIKE, sfx: 'bonk' },
    { at: CHAIN, sfx: 'poof' },
    { at: CHAIN + 0.15, sfx: 'poof' },
    { at: CHAIN + 0.3, sfx: 'poof' },
    { at: BONK, sfx: 'bonk' },
    { at: CATCH, sfx: 'plop' },
    { at: CATCH, sfx: 'whoosh' },
    { at: RIDE + 0.5, sfx: 'boing' },
    { at: RIDE + 0.6, say: '孫悟空' },
    { at: RIDE + 0.9, sfx: 'cheer' },
  ],
})
