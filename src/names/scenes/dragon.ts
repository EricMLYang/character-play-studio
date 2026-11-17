// 演的是字面意思：神（神奇）＋龍——住在雲裡、會呼風的神龍，幫地上熱壞的小孩吹風。（沒有任何球、許願、召喚，也不噴火）
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：大太陽下楊捷睿熱到吐舌頭，舉手拜託雲裡的龍吹點風——龍一探頭「呼」，風一次比一次大，把他吹得一次比一次遠。
// 同一個舉手、同一個探頭鼓嘴、同一聲「呼」，三次只有結果變大：被吹退兩步 → 被吹得翻滾到畫面邊、跌坐 →
// 停一拍（他走回來彎腰頂住、龍吸氣吸到整顆頭鼓起來、他抱頭蹲下）——第三口風最大，卻沒吹到他：
// 整朵雲被吹飛、剛好蓋住太陽，地上變陰涼。他抬頭、跳起來好涼快；沒了雲的龍整條露出來，盤在天上亮相：「神龍」。
const S = 30 // 楊捷睿的 size
const Y = 77 - 0.42 * S // 楊捷睿站在地上的 y
const KID = 54 // 他每次舉手拜託的位置
const D = 38 // 龍頭的 size
const DOWN = { x: 108, y: 43 } // 龍躲在雲後面
const UP = { x: 108, y: 27 } // 龍從雲上探頭（每次都探到這裡）
const CLOUD = { x: 106, y: 46 }
const SUN = { x: 38, y: 17 }
/** 被吹到以後傻眼停多久 */
const HOLD = 0.45

/** 他舉手拜託（每次都一樣）：熱到吐舌頭 → 舉手跳一下「拜託！」。p 是舉手那一刻 */
function ask(p: number) {
  const moves: Move[] = [
    { at: p - 0.15, actor: 'kid', do: 'squash', amount: -0.12, dur: 0.15 },
    { at: p, actor: 'kid', do: 'swap', emoji: 'hero:yang/know' },
    { at: p, actor: 'kid', do: 'hop', amount: 3, dur: 0.3 },
  ]
  const cues: Cue[] = [{ at: p, sfx: 'blip' }]
  return { moves, cues }
}

/** 龍從雲後面探頭、鼓嘴（每次都一樣）。at 開始探頭；回傳鼓好嘴、要吹的那一刻 */
function peek(at: number, puff = 0.18, hold = 0.35, to = UP) {
  const moves: Move[] = [
    { at, actor: 'dragon', do: 'moveTo', to, dur: 0.3, ease: 'back' },
    { at: at + 0.35, actor: 'dragon', do: 'squash', amount: -puff, dur: hold },
  ]
  const cues: Cue[] = [{ at, sfx: 'whoosh' }]
  return { moves, cues, blow: at + 0.35 + hold }
}

/**
 * 主軸笑點：舉手 → 龍探頭鼓嘴 → 「呼」一口風吹到他。k 是第幾次（0、1），越後面風越大、他飛越遠、音效多疊一個。
 * p 是舉手那一刻；回傳 hit＝風吹到的那一刻、end＝傻眼停完。
 */
function gust(p: number, k: number) {
  const a = ask(p)
  const pk = peek(p + 0.35)
  const hit = pk.blow
  const land = { x: [KID - 13, 27][k], y: Y }
  const moves: Move[] = [
    ...a.moves,
    ...pk.moves,
    // 呼！龍往後一縮
    { at: hit, actor: 'dragon', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: hit, actor: 'dragon', do: 'moveTo', to: { x: UP.x + 3, y: UP.y }, dur: 0.15, ease: 'out' },
    { at: hit + 0.2, actor: 'dragon', do: 'moveTo', to: UP, dur: 0.2 },
    // 風吹到他：傻眼、往後飛
    { at: hit + 0.15, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
  ]
  if (k === 0) {
    moves.push(
      { at: hit + 0.15, actor: 'kid', do: 'moveTo', to: land, dur: 0.35, ease: 'out' },
      { at: hit + 0.15, actor: 'kid', do: 'tilt', amount: -12, dur: 0.5 },
    )
  } else {
    moves.push(
      { at: hit + 0.15, actor: 'kid', do: 'moveTo', to: land, arc: 14, dur: 0.6, ease: 'out' },
      { at: hit + 0.15, actor: 'kid', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
      { at: hit + 0.75, actor: 'kid', do: 'swap', emoji: 'hero:yang/fall' },
      { at: hit + 0.75, actor: 'kid', do: 'shake', amount: 0.6, dur: 0.4 },
    )
  }
  const fx: Fx[] = [
    { at: hit, kind: 'blow', actor: 'dragon', target: 'kid', dx: -14, dy: 8, n: 4 + 3 * k, dur: 0.45, scale: 2.2 + 0.9 * k },
    { at: hit + 0.05, kind: 'blow', actor: 'dragon', target: 'kid', emoji: '🍃', dx: -14, dy: 8, n: 3 + 3 * k, dur: 0.4, scale: 1.6 + 0.5 * k },
    { at: hit + 0.2, kind: 'burst', actor: 'kid', emoji: '🍃', n: 5 + 4 * k, dur: 0.7, scale: 1.3 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: hit + 0.15, dur: 0.45, do: 'punch', amount: 0.06 + 0.06 * k, to: { x: land.x + 10, y: Y - 6 } },
    { at: hit + 0.15, dur: 0.3 + 0.15 * k, do: 'shake', amount: 0.6 + 0.7 * k },
  ]
  // 同一聲「呼」，一次比一次多疊一個
  const cues: Cue[] = [...a.cues, ...pk.cues, { at: hit, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: hit + 0.75, sfx: 'bonk' })
  const end = hit + (k === 0 ? 0.5 : 0.75) + HOLD
  return { moves, fx, camera, cues, hit, end }
}

const P1 = 1.1, P2 = 3.85
const g1 = gust(P1, 0)
const g2 = gust(P2, 1)
// 第三次：他走回來、舉手（同一個拜託），龍探頭——這次吸氣吸好久（停一拍）
const P3 = 7.05
const a3 = ask(P3)
const LOW = { x: UP.x - 2, y: UP.y + 12 } // 第三次吸氣會鼓大，探低一點
const pk3 = peek(P3 + 0.35, 0.12, 0.95, LOW)
const HIT3 = pk3.blow
const POSE = HIT3 + 1.25

export default scene({
  duration: 11.4,
  bg: { top: '#4FB3F2', bottom: '#FFF0A8', floor: '#EBC77A', scenery: 'desert' },
  actors: [
    { id: 'sun', emoji: '☀️', x: SUN.x, y: SUN.y, size: 22, float: true },
    { id: 'cactus', emoji: '🌵', x: 146, y: 66, size: 22 },
    { id: 'dragon', emoji: '🐲', x: DOWN.x, y: DOWN.y, size: D, float: true, pivot: 'center' },
    { id: 'cloud', emoji: '☁️', x: CLOUD.x, y: CLOUD.y, size: 46, float: true },
    { id: 'kid', emoji: 'hero:yang/hot', x: KID, y: Y, size: S, flip: true },
  ],
  moves: [
    // 開場：大太陽一跳一跳，他熱到吐舌頭搧風；雲動了一下（裡面有東西）
    { at: 0.1, actor: 'sun', do: 'squash', amount: -0.15, dur: 0.35 },
    { at: 0.2, actor: 'kid', do: 'shake', amount: 0.5, dur: 0.5 },
    { at: 0.6, actor: 'cloud', do: 'shake', amount: 0.8, dur: 0.3 },
    // 第一次：被吹退兩步、傻眼，又熱回去
    ...g1.moves,
    { at: g1.end, actor: 'dragon', do: 'moveTo', to: DOWN, dur: 0.3, ease: 'in' },
    { at: g1.end, actor: 'kid', do: 'swap', emoji: 'hero:yang/hot' },
    { at: g1.end + 0.15, actor: 'kid', do: 'moveTo', to: { x: KID, y: Y }, dur: 0.45 },
    { at: g1.end + 0.6, actor: 'sun', do: 'squash', amount: -0.15, dur: 0.3 },
    // 第二次：翻滾到畫面邊、跌坐
    ...g2.moves,
    { at: g2.end, actor: 'dragon', do: 'moveTo', to: DOWN, dur: 0.3, ease: 'in' },
    // 停一拍：他走回來，熱、但這次彎腰頂住
    { at: g2.end + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/walk' },
    { at: g2.end + 0.1, actor: 'kid', do: 'moveTo', to: { x: KID, y: Y }, dur: 0.75 },
    ...a3.moves,
    ...pk3.moves,
    // 龍吸氣吸好久，整顆頭鼓起來、抖；他看到了，改成抱頭蹲下
    { at: P3 + 0.7, actor: 'dragon', do: 'scaleTo', amount: 1.25, dur: 0.9, ease: 'out' },
    { at: P3 + 0.8, actor: 'dragon', do: 'shake', amount: 0.6, dur: 0.85 },
    { at: P3 + 0.95, actor: 'kid', do: 'swap', emoji: 'hero:yang/duck' },
    // 第三口：最大的風——把整朵雲吹飛，蓋住太陽
    { at: HIT3, actor: 'dragon', do: 'scaleTo', amount: 0.85, dur: 0.2, ease: 'out' },
    { at: HIT3, actor: 'dragon', do: 'moveTo', to: { x: LOW.x + 4, y: LOW.y }, dur: 0.2, ease: 'out' },
    { at: HIT3, actor: 'cloud', do: 'moveTo', to: { x: SUN.x + 7, y: SUN.y + 6 }, dur: 0.55, ease: 'out' },
    { at: HIT3, actor: 'cloud', do: 'scaleTo', amount: 0.9, dur: 0.55, ease: 'out' },
    { at: HIT3 + 0.1, actor: 'kid', do: 'shake', amount: 0.5, dur: 0.4 },
    // 他偷看：沒被吹走？好涼快！跳起來
    { at: HIT3 + 0.65, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: HIT3 + 0.95, actor: 'kid', do: 'swap', emoji: 'hero:yang/happy' },
    { at: HIT3 + 0.95, actor: 'kid', do: 'hop', amount: 6, dur: 0.4 },
    // 沒了雲的龍整條露出來：盤在天上亮相
    { at: POSE - 0.05, actor: 'dragon', do: 'swap', emoji: '🐉' },
    { at: POSE - 0.05, actor: 'dragon', do: 'moveTo', to: { x: 110, y: 47 }, dur: 0.45, ease: 'back' },
    { at: POSE - 0.05, actor: 'dragon', do: 'scaleTo', amount: 1.2, dur: 0.45, ease: 'back' },
    { at: POSE + 0.6, actor: 'kid', do: 'swap', emoji: 'hero:yang/wave' },
    { at: POSE + 0.9, actor: 'dragon', do: 'hop', amount: 3, dur: 0.4 },
  ],
  fx: [
    { at: 0.2, kind: 'sweat', actor: 'kid' },
    { at: 0.65, kind: 'puff', actor: 'cloud', n: 5, dur: 0.5 },
    ...g1.fx,
    { at: g1.end + 0.6, kind: 'sweat', actor: 'kid' },
    ...g2.fx,
    { at: g2.hit + 0.75, kind: 'puff', actor: 'kid', n: 6, dur: 0.6 },
    // 停一拍：他汗流浹背
    { at: P3 + 0.8, kind: 'sweat', actor: 'kid', dur: 0.9 },
    // 第三口：最大的風，往雲吹過去
    { at: HIT3, kind: 'blow', actor: 'dragon', to: { x: SUN.x + 10, y: SUN.y + 6 }, dx: -14, dy: 8, n: 12, dur: 0.6, scale: 3.4 },
    { at: HIT3 + 0.05, kind: 'blow', actor: 'dragon', to: { x: SUN.x + 10, y: SUN.y + 6 }, emoji: '🍃', dx: -14, dy: 8, n: 9, dur: 0.55, scale: 2.2 },
    // 涼快了
    { at: HIT3 + 0.95, kind: 'burst', actor: 'kid', emoji: '💨', n: 6, dur: 0.7, scale: 1.3 },
    { at: POSE + 0.1, kind: 'burst', actor: 'dragon', emoji: '✨', n: 10, dur: 0.9, scale: 1.5 },
    { at: POSE + 0.5, kind: 'burst', actor: 'dragon', emoji: '🎉', n: 8, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.15, to: { x: 82, y: 46 } },
    ...g1.camera,
    ...g2.camera,
    // 停一拍時慢慢推近
    { at: P3 + 0.5, dur: 0.9, do: 'zoom', amount: 1.22, to: { x: 86, y: 45 } },
    { at: HIT3, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 84, y: 40 } },
    { at: HIT3, dur: 0.5, do: 'shake', amount: 2 },
    { at: HIT3 + 0.6, dur: 0.5, do: 'zoom', amount: 1.15, to: { x: 82, y: 46 } },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.12, to: { x: 84, y: 46 } },
  ],
  lights: [
    // 大太陽：一開始有點刺眼；雲蓋住太陽以後變陰涼
    { at: 0, dur: 0.01, level: -0.15 },
    { at: HIT3 + 0.3, dur: 0.5, level: 0.22 },
    { at: POSE, dur: 0.05, level: -0.3 },
    { at: POSE + 0.05, dur: 0.4, level: 0.12 },
  ],
  cues: [
    { at: 0.6, sfx: 'bubble' },
    ...g1.cues,
    ...g2.cues,
    ...a3.cues,
    ...pk3.cues,
    { at: P3 + 0.7, sfx: 'rumble' },
    { at: HIT3, sfx: 'whoosh' },
    { at: HIT3 + 0.05, sfx: 'whoosh' },
    { at: HIT3 + 0.4, sfx: 'poof' },
    { at: HIT3 + 0.95, sfx: 'boing' },
    { at: POSE + 0.1, say: '神龍' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
