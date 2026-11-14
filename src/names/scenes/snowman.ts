// 演的是字面意思：雪（雪做的）＋寶（寶寶）——一個雪球疊成的小雪寶寶在沙漠裡怕太陽，躲來躲去，最後躲進一塊大冰塊（沒有三根頭髮、樹枝手，也不演想過夏天）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 沙漠的清晨：雪寶寶（兩顆雪球疊起來的小寶寶）蹦蹦跳跳出來玩。太陽一冒出來，他就開始冒汗、變小。
// 他躲到駱駝的影子裡，呼——涼快。停一拍……駱駝走掉了，他整個曬在太陽下。他衝向一大塊冰，跳上去抱住：
// 冷冰冰，又變回圓滾滾。太陽不服氣，靠過來變更大，冰塊融成一灘水，他摔到地上……兩個大眼瞪小眼。
// 這時冰塊融化的水氣往上飄，變成一朵下雪的雲，擋住太陽、嘩啦啦下起雪，雪寶寶越長越大：「雪寶」。太陽在雲後面嘟嘴。
const B = 14 // 身體（下面那顆雪球）
const HS = 11 // 頭
const FEET = 77 // 腳底（地上）
const BY = (feet: number) => feet - 0.42 * B // 身體的 y
const HEAD_UP = 17 // 頭的中心比腳底高多少（1 倍大時，用 anim:shot 量過）
const HY = (feet: number, s: number) => feet - HEAD_UP * s
const SNOW = 'grayscale(1) brightness(1.5) contrast(0.95)' // 黃色笑臉染成雪白
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const ICE = { x: 120, y: 77 - 0.42 * 22 }
const ON_ICE = ICE.y - 9 + 0.42 * B // 冰塊頂（腳底）

/** 雪寶寶走到哪：身體與頭一起（s 是那時候的大小） */
const go = (at: number, x: number, feet: number, s: number, extra: Partial<Move> = {}): Move[] => [
  { at, actor: 'body', do: 'moveTo', to: { x, y: BY(feet) }, ...extra },
  { at, actor: 'head', do: 'moveTo', to: { x, y: HY(feet, s) }, ...extra },
]
/** 一起變大變小（從腳底長） */
const grow = (at: number, feet: number, x: number, from: number, to: number, dur: number, ease: Move['ease'] = 'out', fix = 0): Move[] => [
  { at, actor: 'body', do: 'scaleTo', amount: to / from, dur, ease },
  { at, actor: 'head', do: 'scaleTo', amount: to / from, dur, ease },
  { at, actor: 'head', do: 'moveTo', to: { x, y: HY(feet, to) + fix }, dur, ease },
]
const both = (m: Omit<Move, 'actor'>): Move[] => [{ ...m, actor: 'body' }, { ...m, actor: 'head' }]

export default scene({
  duration: 9.6,
  bg: { top: '#FFB070', bottom: '#FFE9BF', floor: '#EBC27C', scenery: 'desert' },
  actors: [
    { id: 'sun', emoji: '🌞', x: 30, y: 40, size: 20, float: true, hidden: true },
    { id: 'cloud', emoji: '🌨️', x: 96, y: 22, size: 30, float: true, hidden: true },
    { id: 'cactus', emoji: '🌵', x: 150, y: 77 - 0.42 * 24, size: 24 },
    { id: 'ice', emoji: '🧊', x: ICE.x, y: ICE.y, size: 22 },
    { id: 'camel', emoji: '🐫', x: 46, y: 77 - 0.42 * 32, size: 32 },
    { id: 'body', emoji: '⚪', x: -14, y: BY(FEET), size: B },
    { id: 'head', emoji: '😊', x: -14, y: HY(FEET, 1), size: HS, tint: SNOW },
  ],
  moves: [
    // ① 蹦蹦跳跳出來
    ...go(0, 66, FEET, 1, { arc: 8, dur: 0.5, ease: 'out' }),
    ...go(0.5, 82, FEET, 1, { arc: 6, dur: 0.4, ease: 'out' }),
    // 太陽冒出來：冒汗、變小
    { at: 0.9, actor: 'sun', do: 'pop', dur: 0.2 },
    { at: 0.9, actor: 'sun', do: 'moveTo', to: { x: 36, y: 14 }, dur: 0.6, ease: 'out' },
    { at: 1.5, actor: 'head', do: 'swap', emoji: '😰' },
    ...both({ at: 1.5, do: 'shake', amount: 0.6, dur: 0.4 }),
    ...grow(1.6, FEET, 82, 1, 0.85, 0.6),
    // 躲到駱駝的影子裡，呼——
    ...go(2.25, 52, FEET, 0.85, { dur: 0.45, ease: 'in' }),
    { at: 2.8, actor: 'head', do: 'swap', emoji: '😌' },
    // 停一拍……駱駝走掉了
    { at: 3.4, actor: 'camel', do: 'moveTo', to: { x: -30, y: 77 - 0.42 * 32 }, dur: 1.0, ease: 'in' },
    { at: 3.9, actor: 'head', do: 'swap', emoji: '😱' },
    { at: 3.9, actor: 'sun', do: 'hop', amount: 3, dur: 0.3 },
    ...grow(4.0, FEET, 52, 0.85, 0.72, 0.3),
    // 衝向冰塊，跳上去抱住：又變回圓滾滾
    ...go(4.35, ICE.x, ON_ICE, 0.72, { arc: 12, dur: 0.5, ease: 'out' }),
    { at: 4.9, actor: 'head', do: 'swap', emoji: '😊' },
    ...grow(4.9, ON_ICE, ICE.x, 0.72, 1, 0.35, 'back'),
    // 太陽不服氣，靠過來變更大；冰塊融化，他摔到地上
    { at: 5.3, actor: 'sun', do: 'moveTo', to: { x: 76, y: 20 }, dur: 0.5, ease: 'out' },
    { at: 5.3, actor: 'sun', do: 'scaleTo', amount: 1.5, dur: 0.5, ease: 'out' },
    { at: 5.6, actor: 'ice', do: 'scaleTo', amount: 0.25, dur: 0.5, ease: 'in' },
    { at: 5.6, actor: 'ice', do: 'shake', amount: 0.6, dur: 0.5 },
    ...go(5.6, ICE.x, FEET, 1, { dur: 0.5, ease: 'in' }),
    { at: 6.1, actor: 'head', do: 'swap', emoji: '😰' },
    // 水氣往上飄，變成下雪的雲，擋住太陽
    { at: 6.7, actor: 'cloud', do: 'pop', dur: 0.4 },
    { at: 6.7, actor: 'cloud', do: 'moveTo', to: { x: 80, y: 20 }, dur: 0.5, ease: 'out' },
    { at: 6.9, actor: 'sun', do: 'scaleTo', amount: 1 / 1.5, dur: 0.4 },
    // ⑤ 嘩啦啦下雪，雪寶寶越長越大
    { at: 7.2, actor: 'head', do: 'swap', emoji: '😊' },
    ...grow(7.2, FEET, ICE.x, 1, 1.75, 0.5, 'back', 7), // 放很大時自動放大變少，頭要往下補
    { at: 8.4, actor: 'sun', do: 'moveTo', to: { x: 62, y: 20 }, dur: 0.4, ease: 'out' },
    ...both({ at: 8.5, do: 'hop', amount: 2, dur: 0.3 }),
  ],
  fx: [
    { at: 0.95, kind: 'burst', actor: 'sun', emoji: '✨', n: 6, dur: 0.6 },
    { at: 1.5, kind: 'sweat', actor: 'head' },
    { at: 1.7, kind: 'rain', actor: 'body', emoji: '💧', n: 3, dur: 0.6 },
    { at: 2.3, kind: 'puff', actor: 'body', n: 4, dur: 0.4 },
    { at: 2.85, kind: 'pop', actor: 'head', emoji: '💤', dx: 8, dur: 0.5 },
    { at: 3.95, kind: 'pop', actor: 'sun', emoji: '😆', dx: 12, dur: 0.6 },
    { at: 4.0, kind: 'sweat', actor: 'head' },
    { at: 4.9, kind: 'burst', actor: 'head', emoji: '❄️', n: 8, dur: 0.7 },
    { at: 5.35, kind: 'pop', actor: 'sun', emoji: '💢', dx: 14, dur: 0.6 },
    { at: 5.7, kind: 'puff', actor: 'ice', n: 10, dur: 0.8 },
    { at: 6.15, kind: 'burst', actor: 'ice', emoji: '💦', n: 6, dur: 0.6 },
    { at: 6.25, kind: 'pop', actor: 'head', emoji: '❓', dx: 8, dur: 0.5 },
    { at: 6.3, kind: 'stink', actor: 'ice', color: '#fff', dur: 0.6 },
    { at: 6.9, kind: 'rain', actor: 'cloud', emoji: '❄️', n: 10, dur: 2.6 },
    { at: 7.3, kind: 'burst', actor: 'head', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'head', emoji: '🎉', n: 8, dur: 0.9 },
    { at: 8.5, kind: 'pop', actor: 'sun', emoji: '😑', dx: -12, dur: 0.8 },
  ],
  camera: [
    { at: 1.5, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 82, y: 64 } },
    { at: 5.3, dur: 0.4, do: 'shake', amount: 1 },
    { at: 6.1, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.3, to: look(106, 48, 1.3) },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.35 },
    { at: 0.9, dur: 0.6, level: -0.15 },
    { at: 5.3, dur: 0.4, level: -0.3 },
    { at: 6.7, dur: 0.5, level: 0.15 },
    { at: 7.2, dur: 0.05, level: -0.3 },
    { at: 7.25, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'boing' },
    { at: 0.5, sfx: 'boing' },
    { at: 0.9, sfx: 'rumble' },
    { at: 1.7, sfx: 'deflate' },
    { at: 2.25, sfx: 'whoosh' },
    { at: 3.9, sfx: 'blip' },
    { at: 4.35, sfx: 'boing' },
    { at: 4.9, sfx: 'clink' },
    { at: 5.6, sfx: 'slide' },
    { at: 6.1, sfx: 'splash' },
    { at: 6.7, sfx: 'poof' },
    { at: 7.45, say: '雪寶' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
