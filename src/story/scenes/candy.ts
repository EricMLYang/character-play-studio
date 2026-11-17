import { scene } from '../scene'
import { castScale, type Move } from '../../anim/clip'
import type { Scenes } from './index'

// 誰在門後：萬聖節晚上，小骷髏提著南瓜桶肚子好餓，走到一扇大門前「叩叩叩」。
// 門後是姑姑就倒出一大堆糖，南瓜桶脹成跟他一樣大；是獅子就一聲大吼把他吹走、拔腿逃出畫面；
// 是熊就踮腳想偷拿熊旁邊的糖，自己打了一個大噴嚏把熊吵醒。
// 他拖不動那桶糖，等著坐東西回家：坐車咻一聲開走；騎馬一路狂奔把糖噴光；坐雲被載到天上嚇得發抖，雲一散摔回地上。
// 到家倒在床上就睡著了，夢到糖還在流口水。
// 主角 jerry（size 24 站在地上 y = 66.9），一身黑：天是深藍紫、地板是淺色（照「燈」「晚」的配色，不關燈）。
// 圖都朝左，他整本都面向右邊（flip: true）。
// 大門在右邊 x 112；門後的黑洞是同一張門染黑、畫在門下面，門往左邊的門鉸「拉窄」就是打開了。
// 等著選的樣子：門前 —— 他站在 x 84、idle、南瓜桶在他右手邊地上 x 92；
//            回家前 —— 他站在 x 52、tired，脹大的南瓜桶（上面堆著糖）在 x 78，門已經在畫面外。
const G = 66.9
const BG = { top: '#28307A', bottom: '#9C94DE', floor: '#E8D6AC', scenery: 'night' as const }
const J = 'hero:jerry/'

/** 大門與門後的黑洞（門寬約 0.5 × size） */
const DOOR = { x: 112, y: 56, size: 50 }
const OPEN_W = 0.12
/** 門往左邊的門鉸拉窄：左緣不動 */
const OPEN_X = DOOR.x - (DOOR.size * 0.5 * (1 - OPEN_W)) / 2
const door = (x = DOOR.x, hidden = false) => [
  { id: 'hole', emoji: '🚪', x, y: DOOR.y, size: DOOR.size, tint: 'brightness(.18) saturate(.6)', hidden },
  { id: 'door', emoji: '🚪', x, y: DOOR.y, size: DOOR.size, hidden },
]
const openDoor = (at: number, dur = 0.3): Move[] => [
  { at, dur, actor: 'door', do: 'stretchTo', amount: OPEN_W, ease: 'out' },
  { at, dur, actor: 'door', do: 'moveTo', to: { x: OPEN_X, y: DOOR.y }, ease: 'out' },
]
const closeDoor = (at: number, dur = 0.25): Move[] => [
  { at, dur, actor: 'door', do: 'stretchTo', amount: 1 / OPEN_W, ease: 'in' },
  { at, dur, actor: 'door', do: 'moveTo', to: { x: DOOR.x, y: DOOR.y }, ease: 'in' },
]

/** 南瓜桶：平常提在右手邊、底部碰地 */
const PUMP = { size: 9, y: 73.2, dx: 8 }
const WAIT = { x: 84 }
const pump = (x: number, hidden = false) => ({ id: 'pump', emoji: '🎃', x, y: PUMP.y, size: PUMP.size, hidden })
/** 他走、跳的時候南瓜桶跟著（只跟水平移動與跳） */
const carry = (moves: Move[]): Move[] => moves.flatMap((m) => {
  if (m.actor !== 'jerry') return [m]
  const shift = (v?: { x: number; y: number }) => v && { x: v.x + PUMP.dx, y: PUMP.y }
  if (m.do === 'moveTo' || m.do === 'enter') return [m, { ...m, actor: 'pump', to: shift(m.to), from: shift(m.from), arc: undefined }]
  if (m.do === 'hop') return [m, { ...m, actor: 'pump' }]
  return [m]
})

/** 脹大的南瓜桶（姑姑倒完糖以後）：倍率、上面堆的糖 */
const BIG = 2.4
/** 姑姑那段是把小桶 scaleTo 放大：小東西引擎會自動放大比較多，要換算才跟後面直接寫 size 的大桶一樣大 */
const GROW = (PUMP.size * BIG * castScale(PUMP.size * BIG)) / (PUMP.size * castScale(PUMP.size))
const BAG_X = 78
/** 姑姑倒完糖的時候（還在門口）：南瓜桶與他的位置，拖到 BAG_X／HOME_X */
const BAG0 = { x: 86, jerry: 61 }
/** 桶口上面那一堆糖：相對桶子的位置 */
const LOOT = [
  { id: 'c1', emoji: '🍬', dx: -6, dy: -14, size: 9 },
  { id: 'c2', emoji: '🍭', dx: 1, dy: -18, size: 11 },
  { id: 'c3', emoji: '🍬', dx: 7, dy: -13, size: 8 },
]
const loot = (x: number, y = PUMP.y, hidden = false) => LOOT.map((c) => ({ id: c.id, emoji: c.emoji, x: x + c.dx, y: y + c.dy, size: c.size, hidden, float: true, pivot: 'center' as const }))
/** 南瓜桶與上面的糖一起動 */
const withLoot = (m: Move): Move[] => [m, ...LOOT.map((c): Move => ({ ...m, actor: c.id, to: m.to && { x: m.to.x + c.dx, y: m.to.y + c.dy } }))]
const HOME_X = 52

/** 小車：停在畫面中間偏右；坐在車頂比站在地上高 roof */
const CAR = { x: 104, y: 58.5, size: 44, roof: 14 }
/** 小車載著的：車頂前面是他、後面是南瓜桶與糖 */
const CAR_RIDERS: [string, number, number][] = [['car', 0, CAR.y], ['jerry', -8, G - CAR.roof], ['pump', 9, PUMP.y - CAR.roof], ...LOOT.map((c): [string, number, number] => [c.id, 9 + c.dx, PUMP.y - CAR.roof + c.dy])]
/** 馬：停下來的位置；騎在馬背上比站在地上高 back */
const HORSE = { x: 104, y: 60.2, size: 40, back: 24 }
/** 雲：落在他左邊；坐在雲上比站在地上高 seat，往上飄 rise */
const CLOUD = { x: 30, y: 64.4, size: 30, seat: 12, rise: 24 }
/** 床 */
const BED = { x: 104, y: 58.5, size: 44, lie: 50 }
/** 馬帶著他和南瓜桶狂奔一趟（從 x0 跑到 x1）；jump 是先瞬間移到起點（從另一邊再衝一次） */
const RIDERS: [string, number, number][] = [['horse', 0, HORSE.y], ['jerry', -4, G - HORSE.back], ['pump', 9, PUMP.y - HORSE.back], ...LOOT.map((c): [string, number, number] => [c.id, 9 + c.dx, PUMP.y - HORSE.back + c.dy])]
const gallop = (at: number, dur: number, x0: number, x1: number, ease: 'in' | 'linear', jump = false): Move[] => RIDERS.flatMap(([actor, dx, y]): Move[] => [
  ...(jump ? [{ at: at - 0.05, actor, do: 'moveTo' as const, to: { x: x0 + dx, y }, dur: 0 }] : []),
  { at, actor, do: 'moveTo', to: { x: x1 + dx, y }, dur, ease },
  { at, actor, do: 'bounce', amount: 2.5, times: Math.round(dur * 5), dur },
])

const scenes: Scenes = {
  // 夜晚了，他想吃糖。——提著南瓜桶走進來，肚子咕嚕叫、摸扁扁的肚子，想到糖，口水流下來
  want: scene({
    duration: 4.9,
    bg: BG,
    actors: [
      { id: 'jerry', emoji: `${J}walk`, x: 66, y: G, size: 24, flip: true, hidden: true },
      pump(66 + PUMP.dx, true),
    ],
    moves: carry([
      { at: 0, actor: 'jerry', do: 'enter', from: { x: -18, y: G }, dur: 1.3, ease: 'out' },
      { at: 1.4, actor: 'jerry', do: 'swap', emoji: `${J}hungry` },
      { at: 1.6, actor: 'jerry', do: 'shake', amount: 1, dur: 0.5 },
      { at: 2.3, actor: 'jerry', do: 'squash', amount: 0.2, dur: 0.3 },
      { at: 2.3, actor: 'jerry', do: 'shake', amount: 1.3, dur: 0.5 },
      // 想到糖：眼睛亮起來、流口水
      { at: 3.5, actor: 'jerry', do: 'swap', emoji: `${J}drool` },
      { at: 3.6, actor: 'jerry', do: 'hop', amount: 3, dur: 0.3 },
      { at: 4.2, actor: 'jerry', do: 'tilt', amount: 6, dur: 0.6 },
    ]),
    fx: [
      { at: 1.6, kind: 'pop', actor: 'jerry', emoji: '💦', dx: -8, dur: 0.8 },
      { at: 2.4, kind: 'bubble', actor: 'jerry', emoji: '🍬', dur: 1.6, scale: 1.3 },
      { at: 3.6, kind: 'burst', actor: 'jerry', emoji: '✨', n: 6, dur: 0.8 },
      { at: 3.9, kind: 'pop', actor: 'jerry', emoji: '🍭', dx: 9, dur: 1.0 },
    ],
    cues: [
      { at: 1.5, say: '夜晚了，他想吃糖。' },
      { at: 1.6, sfx: 'rumble' },
      { at: 2.3, sfx: 'rumble' },
      { at: 3.6, sfx: 'blip' },
    ],
  }),

  // 前面有一個大門。——他往前走，大門出現在右邊；他抬頭看、走上前「叩、叩、叩」，退一步等著
  door: scene({
    duration: 5.2,
    bg: BG,
    actors: [
      ...door(DOOR.x, true),
      { id: 'jerry', emoji: `${J}drool`, x: 66, y: G, size: 24, flip: true },
      pump(66 + PUMP.dx),
    ],
    moves: carry([
      { at: 0.1, actor: 'jerry', do: 'swap', emoji: `${J}walk` },
      { at: 0.1, actor: 'jerry', do: 'moveTo', to: { x: WAIT.x, y: G }, dur: 1.2, ease: 'out' },
      { at: 0.1, actor: 'hole', do: 'enter', from: { x: 200, y: DOOR.y }, dur: 1.2, ease: 'out' },
      { at: 0.1, actor: 'door', do: 'enter', from: { x: 200, y: DOOR.y }, dur: 1.2, ease: 'out' },
      { at: 1.4, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 1.4, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
      // 走上前敲門
      { at: 2.3, actor: 'jerry', do: 'swap', emoji: `${J}reach` },
      { at: 2.3, actor: 'jerry', do: 'moveTo', to: { x: WAIT.x + 4, y: G }, dur: 0.3 },
      { at: 2.75, actor: 'door', do: 'shake', amount: 0.5, dur: 0.15 },
      { at: 3.1, actor: 'door', do: 'shake', amount: 0.5, dur: 0.15 },
      { at: 3.45, actor: 'door', do: 'shake', amount: 0.5, dur: 0.15 },
      { at: 2.75, actor: 'jerry', do: 'tilt', amount: -5, dur: 0.15 },
      { at: 3.1, actor: 'jerry', do: 'tilt', amount: -5, dur: 0.15 },
      { at: 3.45, actor: 'jerry', do: 'tilt', amount: -5, dur: 0.15 },
      // 退一步，等門開
      { at: 3.9, actor: 'jerry', do: 'swap', emoji: `${J}idle` },
      { at: 3.9, actor: 'jerry', do: 'moveTo', to: { x: WAIT.x, y: G }, dur: 0.35 },
      { at: 4.5, actor: 'jerry', do: 'hop', amount: 2, dur: 0.25 },
    ]),
    fx: [
      { at: 1.45, kind: 'pop', actor: 'jerry', emoji: '❗', dur: 0.7 },
      { at: 2.75, kind: 'burst', x: 101, y: 50, n: 1, dur: 0.25, scale: 0.5 },
      { at: 3.1, kind: 'burst', x: 101, y: 50, n: 1, dur: 0.25, scale: 0.5 },
      { at: 3.45, kind: 'burst', x: 101, y: 50, n: 1, dur: 0.25, scale: 0.5 },
      { at: 4.4, kind: 'pop', actor: 'jerry', emoji: '❓', dur: 0.8 },
    ],
    cues: [
      { at: 1.0, say: '前面有一個大門。' },
      { at: 2.75, sfx: 'tap' },
      { at: 3.1, sfx: 'tap' },
      { at: 3.45, sfx: 'tap' },
    ],
  }),

  // 門後是姑姑！——門一開，姑姑笑著把糖倒下來，南瓜桶越裝越大、把他擠得跌坐；姑姑丟一個飛吻，他臉紅，門關上
  'who:姑': scene({
    duration: 7.0,
    bg: BG,
    actors: [
      door()[0],
      { id: 'aunt', emoji: 'prop:aunt', x: DOOR.x + 1, y: 57.7, size: 46, hidden: true },
      door()[1],
      { id: 'jerry', emoji: `${J}idle`, x: WAIT.x, y: G, size: 24, flip: true },
      pump(WAIT.x + PUMP.dx),
      ...loot(BAG0.x, PUMP.y, true),
    ],
    moves: [
      ...openDoor(0.2),
      { at: 0.25, actor: 'aunt', do: 'pop', dur: 0.3 },
      { at: 0.5, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 0.5, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
      // 姑姑笑著倒糖：南瓜桶一下一下脹大，把他擠到旁邊
      { at: 1.0, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-laugh' },
      { at: 1.4, actor: 'jerry', do: 'swap', emoji: `${J}happy` },
      { at: 1.4, actor: 'jerry', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.5, actor: 'pump', do: 'scaleTo', amount: 1.35, dur: 0.25, ease: 'back' },
      { at: 1.5, actor: 'pump', do: 'moveTo', to: { x: 89, y: PUMP.y }, dur: 0.25 },
      { at: 2.0, actor: 'pump', do: 'scaleTo', amount: 1.35, dur: 0.25, ease: 'back' },
      { at: 2.0, actor: 'jerry', do: 'moveTo', to: { x: 76, y: G }, dur: 0.25, ease: 'out' },
      { at: 2.5, actor: 'pump', do: 'scaleTo', amount: GROW / 1.35 / 1.35, dur: 0.3, ease: 'back' },
      { at: 2.5, actor: 'pump', do: 'moveTo', to: { x: BAG0.x, y: PUMP.y }, dur: 0.3 },
      { at: 2.5, actor: 'jerry', do: 'swap', emoji: `${J}fall` },
      { at: 2.5, actor: 'jerry', do: 'moveTo', to: { x: BAG0.jerry, y: G }, dur: 0.35, ease: 'out' },
      ...LOOT.map((c, i): Move => ({ at: 2.7 + i * 0.12, actor: c.id, do: 'pop', dur: 0.25 })),
      // 飛吻
      { at: 3.4, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-kiss' },
      { at: 3.6, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 4.2, actor: 'jerry', do: 'swap', emoji: `${J}giggle` },
      { at: 4.2, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
      { at: 4.6, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.6 },
      // 姑姑笑著進去，門關上
      { at: 4.9, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-laugh' },
      { at: 5.5, actor: 'aunt', do: 'vanish', dur: 0.2 },
      ...closeDoor(5.5),
      { at: 6.0, actor: 'jerry', do: 'swap', emoji: `${J}happy` },
      { at: 6.1, actor: 'jerry', do: 'hop', amount: 5, dur: 0.35 },
    ],
    fx: [
      { at: 0.55, kind: 'pop', actor: 'jerry', emoji: '❗', dur: 0.5 },
      { at: 1.0, kind: 'fountain', actor: 'aunt', emoji: '🍬', n: 9, dur: 1.0 },
      { at: 1.3, kind: 'rain', x: 90, y: 30, emoji: '🍬', n: 8, dur: 1.0 },
      { at: 1.8, kind: 'rain', x: 84, y: 26, emoji: '🍭', n: 7, dur: 1.0 },
      { at: 2.5, kind: 'burst', actor: 'pump', emoji: '🍬', n: 8, dur: 0.8 },
      { at: 2.85, kind: 'dizzy', actor: 'jerry', dur: 0.8 },
      { at: 3.5, kind: 'blow', actor: 'aunt', emoji: '💋', to: { x: 60, y: 58 }, dx: -7, dy: 8, n: 3, dur: 0.8 },
      { at: 4.25, kind: 'burst', actor: 'jerry', emoji: '💗', n: 7, dur: 0.9 },
      { at: 4.3, kind: 'pop', actor: 'jerry', emoji: '😳', dx: -10, dur: 1.4 },
      { at: 6.1, kind: 'burst', actor: 'jerry', emoji: '⭐', n: 7, dur: 0.8 },
    ],
    camera: [{ at: 2.5, dur: 0.3, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 0.9, say: '姑姑給他好多糖！' },
      { at: 1.5, sfx: 'plop' },
      { at: 2.0, sfx: 'plop' },
      { at: 2.5, sfx: 'boing' },
      { at: 3.5, sfx: 'blip' },
      { at: 5.5, sfx: 'tap' },
      { at: 6.1, sfx: 'cheer' },
    ],
  }),

  // 門後是獅子！——門一開，獅子一聲大吼，把他吹得往後滑、轉身拔腿逃出畫面；獅子得意地縮回去，門關上，他抖著走回來
  'who:獅': scene({
    duration: 6.8,
    bg: BG,
    actors: [
      door()[0],
      { id: 'lion', emoji: 'prop:lion', x: DOOR.x + 4, y: 58.5, size: 44, hidden: true },
      door()[1],
      { id: 'jerry', emoji: `${J}idle`, x: WAIT.x, y: G, size: 24, flip: true },
      pump(WAIT.x + PUMP.dx),
    ],
    moves: [
      ...openDoor(0.2, 0.2),
      { at: 0.25, actor: 'lion', do: 'pop', dur: 0.25 },
      { at: 0.5, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 0.5, actor: 'jerry', do: 'hop', amount: 3, dur: 0.25 },
      // 吸一口氣……吼！
      { at: 0.9, actor: 'lion', do: 'squash', amount: -0.15, dur: 0.35 },
      { at: 1.25, actor: 'lion', do: 'swap', emoji: 'prop:lion-roar' },
      { at: 1.25, actor: 'lion', do: 'shake', amount: 0.8, dur: 0.9 },
      // 被吼得腳都離地、往後滑
      { at: 1.3, actor: 'jerry', do: 'swap', emoji: `${J}slip` },
      { at: 1.3, actor: 'jerry', do: 'moveTo', to: { x: 66, y: G }, dur: 0.6, ease: 'out' },
      { at: 1.3, actor: 'jerry', do: 'hop', amount: 4, dur: 0.6 },
      { at: 1.3, actor: 'pump', do: 'shake', amount: 1.2, dur: 0.6 },
      // 拔腿就跑（flee 的圖往右跑，翻過來就往左），南瓜桶丟在原地
      { at: 2.0, actor: 'jerry', do: 'swap', emoji: `${J}flee` },
      { at: 2.15, actor: 'jerry', do: 'moveTo', to: { x: -25, y: G }, dur: 0.55, anticipate: 4, ease: 'in' },
      // 獅子得意，縮回門後，門關上
      { at: 2.2, actor: 'lion', do: 'swap', emoji: 'prop:lion' },
      { at: 2.6, actor: 'lion', do: 'tilt', amount: -6, dur: 0.5 },
      { at: 3.3, actor: 'lion', do: 'vanish', dur: 0.2 },
      ...closeDoor(3.35),
      { at: 3.6, actor: 'door', do: 'shake', amount: 0.6, dur: 0.2 },
      // 抖著從左邊走回來
      { at: 4.2, actor: 'jerry', do: 'swap', emoji: `${J}scared` },
      { at: 4.2, actor: 'jerry', do: 'flip' },
      { at: 4.2, actor: 'jerry', do: 'moveTo', to: { x: WAIT.x, y: G }, dur: 1.4, ease: 'out' },
      { at: 4.2, actor: 'jerry', do: 'shake', amount: 1, dur: 1.4 },
      { at: 6.0, actor: 'jerry', do: 'swap', emoji: `${J}idle` },
    ],
    fx: [
      { at: 0.55, kind: 'pop', actor: 'jerry', emoji: '❓', dur: 0.5 },
      { at: 1.25, kind: 'blow', actor: 'lion', to: { x: 62, y: 58 }, dx: -14, dy: 10, n: 5, dur: 0.9 },
      { at: 1.4, kind: 'pop', actor: 'jerry', emoji: '😱', dx: -10, dur: 0.8 },
      { at: 2.15, kind: 'puff', actor: 'jerry', dur: 0.4 },
      { at: 2.7, kind: 'pop', actor: 'lion', emoji: '😤', dx: -6, dur: 0.8 },
      { at: 5.0, kind: 'sweat', actor: 'jerry' },
    ],
    camera: [
      { at: 1.25, dur: 0.6, do: 'shake', amount: 1.6 },
    ],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 0.6, say: '是獅子！快跑！' },
      { at: 1.25, sfx: 'rumble' },
      { at: 2.15, sfx: 'whoosh' },
      { at: 3.4, sfx: 'bonk' },
    ],
  }),

  // 門後是熊！——熊在門口睡覺，旁邊一碗糖；他踮腳去拿，鼻子一癢打了個大噴嚏，熊跳起來大吼；
  // 他嚇得彈到半空、逃回原位，熊打個哈欠又睡回去，門關上
  'who:熊': scene({
    duration: 7.6,
    bg: BG,
    actors: [
      door()[0],
      { id: 'bear', emoji: 'prop:bear-sleep', x: DOOR.x + 6, y: 58.5, size: 44, hidden: true },
      { id: 'sweet', emoji: '🍭', x: 104, y: 71, size: 13, hidden: true, pivot: 'center' },
      door()[1],
      { id: 'jerry', emoji: `${J}idle`, x: WAIT.x, y: G, size: 24, flip: true },
      pump(WAIT.x + PUMP.dx),
    ],
    moves: [
      ...openDoor(0.2),
      { at: 0.25, actor: 'bear', do: 'pop', dur: 0.25 },
      { at: 0.35, actor: 'sweet', do: 'pop', dur: 0.25 },
      { at: 0.6, actor: 'jerry', do: 'swap', emoji: `${J}drool` },
      // 踮腳偷溜過去拿
      { at: 1.4, actor: 'jerry', do: 'swap', emoji: `${J}sneak` },
      ...carry([
        { at: 1.6, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
        { at: 1.6, actor: 'jerry', do: 'moveTo', to: { x: 87, y: G }, dur: 0.3 },
        { at: 2.1, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
        { at: 2.1, actor: 'jerry', do: 'moveTo', to: { x: 90, y: G }, dur: 0.3 },
      ]),
      // 鼻子癢……哈……哈……哈啾！
      { at: 2.9, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 3.0, actor: 'jerry', do: 'squash', amount: -0.2, dur: 0.35 },
      { at: 3.4, actor: 'jerry', do: 'squash', amount: -0.25, dur: 0.3 },
      { at: 3.75, actor: 'jerry', do: 'swap', emoji: `${J}sneeze` },
      { at: 3.75, actor: 'sweet', do: 'moveTo', to: { x: 140, y: 30 }, arc: 10, dur: 0.5, ease: 'out' },
      { at: 3.75, actor: 'sweet', do: 'spin', times: 2, dur: 0.5 },
      { at: 4.25, actor: 'sweet', do: 'vanish', dur: 0.1 },
      // 熊醒來大吼，他彈到半空
      { at: 4.1, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' },
      { at: 4.1, actor: 'bear', do: 'shake', amount: 0.8, dur: 0.7 },
      { at: 4.15, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 4.15, actor: 'jerry', do: 'hop', amount: 18, dur: 0.6 },
      { at: 4.15, actor: 'jerry', do: 'shake', amount: 1.5, dur: 0.6 },
      ...carry([{ at: 4.8, actor: 'jerry', do: 'moveTo', to: { x: WAIT.x, y: G }, dur: 0.3, ease: 'out' }]),
      { at: 4.8, actor: 'jerry', do: 'swap', emoji: `${J}scared` },
      { at: 5.1, actor: 'jerry', do: 'shake', amount: 1.3, dur: 1.2 },
      // 熊打個哈欠，又趴回去睡，門關上
      { at: 5.3, actor: 'bear', do: 'squash', amount: -0.1, dur: 0.5 },
      { at: 5.8, actor: 'bear', do: 'swap', emoji: 'prop:bear-sleep' },
      { at: 6.3, actor: 'bear', do: 'vanish', dur: 0.2 },
      ...closeDoor(6.3, 0.35),
      { at: 6.9, actor: 'jerry', do: 'swap', emoji: `${J}idle` },
    ],
    fx: [
      { at: 0.5, kind: 'zzz', actor: 'bear', emoji: '💤', dx: -8, dur: 3.4 },
      { at: 0.7, kind: 'pop', actor: 'jerry', emoji: '🍭', dx: 8, dur: 0.7 },
      { at: 3.0, kind: 'pop', actor: 'jerry', emoji: '💦', dx: 8, dur: 0.7 },
      { at: 3.75, kind: 'blow', actor: 'jerry', to: { x: 120, y: 50 }, dx: 6, dy: 10, emoji: '💦', n: 4, dur: 0.6 },
      { at: 4.15, kind: 'pop', actor: 'jerry', emoji: '😱', dx: -10, dur: 0.8 },
      { at: 4.15, kind: 'pop', actor: 'bear', emoji: '💢', dx: 6, dur: 0.8 },
      { at: 5.2, kind: 'sweat', actor: 'jerry' },
      { at: 5.9, kind: 'zzz', actor: 'bear', emoji: '💤', dx: -8, dur: 0.6 },
    ],
    camera: [{ at: 4.1, dur: 0.5, do: 'shake', amount: 1.6 }],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 0.8, say: '熊在睡。不要叫他！' },
      { at: 3.75, sfx: 'achoo' },
      { at: 4.1, sfx: 'rumble' },
      { at: 6.4, sfx: 'tap' },
    ],
  }),

  // 好多糖！他要回家了。——他想把大南瓜桶舉起來，舉不動；只好咬著牙拖著走，大門越來越遠，累得喘氣
  bag: scene({
    duration: 5.6,
    bg: BG,
    actors: [
      ...door(),
      { id: 'jerry', emoji: `${J}happy`, x: BAG0.jerry, y: G, size: 24, flip: true },
      { id: 'pump', emoji: '🎃', x: BAG0.x, y: PUMP.y, size: PUMP.size * BIG },
      ...loot(BAG0.x),
    ],
    moves: [
      { at: 0.3, actor: 'jerry', do: 'hop', amount: 4, dur: 0.35 },
      // 舉：桶子只離地一點點又掉下來
      { at: 1.2, actor: 'jerry', do: 'swap', emoji: `${J}lift` },
      { at: 1.2, actor: 'jerry', do: 'moveTo', to: { x: BAG0.jerry + 5, y: G }, dur: 0.25 },
      { at: 1.6, actor: 'jerry', do: 'shake', amount: 1.2, dur: 0.6 },
      ...withLoot({ at: 1.6, actor: 'pump', do: 'hop', amount: 4, dur: 0.5 }),
      { at: 2.15, actor: 'jerry', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 2.3, actor: 'jerry', do: 'swap', emoji: `${J}tired` },
      // 拖著走：大門往後退出畫面
      { at: 3.0, actor: 'jerry', do: 'swap', emoji: `${J}pull` },
      { at: 3.1, actor: 'jerry', do: 'moveTo', to: { x: HOME_X, y: G }, dur: 1.4 },
      { at: 3.1, actor: 'jerry', do: 'shake', amount: 0.8, dur: 1.4 },
      ...withLoot({ at: 3.1, actor: 'pump', do: 'moveTo', to: { x: BAG_X, y: PUMP.y }, dur: 1.4 }),
      ...withLoot({ at: 3.1, actor: 'pump', do: 'shake', amount: 0.6, dur: 1.4 }),
      { at: 3.1, actor: 'door', do: 'moveTo', to: { x: 205, y: DOOR.y }, dur: 1.4 },
      { at: 3.1, actor: 'hole', do: 'moveTo', to: { x: 205, y: DOOR.y }, dur: 1.4 },
      { at: 4.6, actor: 'jerry', do: 'swap', emoji: `${J}tired` },
    ],
    fx: [
      { at: 0.35, kind: 'burst', actor: 'jerry', emoji: '🍬', n: 6, dur: 0.8 },
      { at: 2.2, kind: 'sweat', actor: 'jerry' },
      { at: 3.2, kind: 'puff', actor: 'pump', dur: 0.5 },
      { at: 3.8, kind: 'puff', actor: 'pump', dur: 0.5 },
      { at: 4.7, kind: 'sweat', actor: 'jerry' },
      { at: 4.8, kind: 'pop', actor: 'jerry', emoji: '💨', dx: -12, dy: 10, dur: 0.7 },
    ],
    cues: [
      { at: 0.3, say: '好多糖！他要回家了。' },
      { at: 2.15, sfx: 'bonk' },
      { at: 3.1, sfx: 'slide' },
    ],
  }),
  // 坐車回家，好快！——小車叭叭開進來，南瓜桶先跳上去，他也跳上去坐好，咻一聲開走
  'ride:車': scene({
    duration: 4.7,
    bg: BG,
    actors: [
      { id: 'car', emoji: 'hero:car/fast', x: CAR.x, y: CAR.y, size: CAR.size, hidden: true },
      { id: 'jerry', emoji: `${J}tired`, x: HOME_X, y: G, size: 24, flip: true },
      { id: 'pump', emoji: '🎃', x: BAG_X, y: PUMP.y, size: PUMP.size * BIG },
      ...loot(BAG_X),
    ],
    moves: [
      { at: 0.15, actor: 'car', do: 'enter', from: { x: 200, y: CAR.y }, dur: 0.75, ease: 'back' },
      { at: 0.9, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
      { at: 1.1, actor: 'car', do: 'hop', amount: 1.5, dur: 0.18 },
      { at: 1.35, actor: 'car', do: 'hop', amount: 1.5, dur: 0.18 },
      { at: 1.0, actor: 'jerry', do: 'swap', emoji: `${J}happy` },
      { at: 1.0, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
      // 南瓜桶先上車（車尾），他再跳上車頭坐好
      ...withLoot({ at: 1.6, actor: 'pump', do: 'moveTo', to: { x: CAR.x + 9, y: PUMP.y - CAR.roof }, arc: 10, dur: 0.45, ease: 'out' }),
      { at: 2.05, actor: 'car', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 2.1, actor: 'jerry', do: 'flip' },
      { at: 2.1, actor: 'jerry', do: 'moveTo', to: { x: CAR.x - 8, y: G - CAR.roof }, arc: 10, dur: 0.45, ease: 'out' },
      { at: 2.55, actor: 'jerry', do: 'swap', emoji: `${J}full` },
      { at: 2.55, actor: 'car', do: 'squash', amount: 0.2, dur: 0.25 },
      // 咻——
      // 催油門：車子抖一抖
      { at: 2.75, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
      ...[['car', CAR.y], ['jerry', 0], ['pump', 0]].map(([actor]): Move => ({ at: 2.8, actor: actor as string, do: 'shake', amount: 0.7, dur: 0.4 })),
      ...CAR_RIDERS.map(([actor, dx, y]): Move => ({ at: 3.2, actor, do: 'moveTo', to: { x: -80 + dx, y }, dur: 1.2, anticipate: 4, ease: 'in' })),
    ],
    fx: [
      { at: 0.9, kind: 'puff', actor: 'car', dur: 0.5 },
      { at: 1.05, kind: 'pop', actor: 'jerry', emoji: '❗', dur: 0.6 },
      { at: 2.6, kind: 'pop', actor: 'jerry', emoji: '😋', dx: -10, dur: 1.0 },
      { at: 2.8, kind: 'puff', actor: 'car', dx: 18, dur: 0.4 },
      { at: 3.2, kind: 'puff', actor: 'car', dur: 0.5 },
      { at: 3.7, kind: 'pop', x: 110, y: 66, emoji: '💨', dur: 1.0 },
    ],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 1.1, sfx: 'blip' },
      { at: 1.35, sfx: 'blip' },
      { at: 2.0, sfx: 'boing' },
      { at: 2.3, say: '坐車回家，好快！' },
      { at: 2.8, sfx: 'rumble' },
      { at: 3.2, sfx: 'whoosh' },
    ],
  }),

  // 馬跑太快了！糖都飛了！——馬衝進來抬起前腳，他抱著糖跳上馬背，馬狂奔出去又從另一邊衝回來，糖一路噴滿天
  'ride:馬': scene({
    duration: 5.3,
    bg: BG,
    actors: [
      { id: 'horse', emoji: '🐎', x: HORSE.x, y: HORSE.y, size: HORSE.size, hidden: true },
      { id: 'jerry', emoji: `${J}tired`, x: HOME_X, y: G, size: 24, flip: true },
      { id: 'pump', emoji: '🎃', x: BAG_X, y: PUMP.y, size: PUMP.size * BIG },
      ...loot(BAG_X),
    ],
    moves: [
      { at: 0.15, actor: 'horse', do: 'enter', from: { x: 200, y: HORSE.y }, dur: 0.75, ease: 'out' },
      { at: 0.95, actor: 'horse', do: 'tilt', amount: -16, dur: 0.6 },
      { at: 1.0, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 1.0, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
      ...withLoot({ at: 1.5, actor: 'pump', do: 'moveTo', to: { x: HORSE.x + 9, y: PUMP.y - HORSE.back }, arc: 10, dur: 0.45, ease: 'out' }),
      { at: 1.9, actor: 'jerry', do: 'flip' },
      { at: 1.9, actor: 'jerry', do: 'swap', emoji: `${J}happy` },
      { at: 1.9, actor: 'jerry', do: 'moveTo', to: { x: HORSE.x - 4, y: G - HORSE.back }, arc: 10, dur: 0.4, ease: 'out' },
      { at: 2.35, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      // 第一圈：往左衝出去；第二圈：從右邊衝回來，糖越噴越少
      ...gallop(2.4, 0.8, HORSE.x, -50, 'in'),
      ...gallop(3.15, 1.5, 192, -60, 'linear', true),
      ...LOOT.map((c, i): Move => ({ at: 2.6 + i * 0.25, actor: c.id, do: 'vanish', dur: 0.15 })),
      { at: 3.25, actor: 'pump', do: 'scaleTo', amount: 0.5, dur: 1.2 },
    ],
    fx: [
      { at: 1.0, kind: 'pop', actor: 'jerry', emoji: '❗', dur: 0.6 },
      { at: 2.4, kind: 'fountain', actor: 'pump', emoji: '🍬', n: 9, dur: 1.0 },
      { at: 2.6, kind: 'pop', actor: 'jerry', emoji: '😱', dx: -10, dur: 0.7 },
      { at: 3.25, kind: 'fountain', actor: 'pump', emoji: '🍭', n: 9, dur: 1.2 },
      { at: 3.5, kind: 'pop', actor: 'jerry', emoji: '😱', dx: -10, dur: 1.2 },
      { at: 3.9, kind: 'rain', x: 60, y: 6, emoji: '🍬', n: 8, dur: 1.4 },
      { at: 4.2, kind: 'rain', x: 100, y: 4, emoji: '🍭', n: 7, dur: 1.4 },
      { at: 4.5, kind: 'rain', x: 80, y: 2, emoji: '🍬', n: 8, dur: 1.2 },
    ],
    cues: [
      { at: 0.15, sfx: 'rumble' },
      { at: 1.5, sfx: 'boing' },
      { at: 2.2, say: '馬跑太快了！糖都飛了！' },
      { at: 2.4, sfx: 'whoosh' },
      { at: 3.2, sfx: 'whoosh' },
    ],
  }),

  // 雲太高了！他好怕！——一朵笑咪咪的雲飄下來，他坐上去，被載到天上嚇得發抖；雲憋氣變烏雲、下雨、噗一聲散掉，他摔回地上
  'ride:雲': scene({
    duration: 7.6,
    bg: BG,
    actors: [
      { id: 'jerry', emoji: `${J}tired`, x: HOME_X, y: G, size: 24, flip: true },
      { id: 'pump', emoji: '🎃', x: BAG_X, y: PUMP.y, size: PUMP.size * BIG },
      ...loot(BAG_X),
      { id: 'cloud', emoji: 'prop:cloud-happy', x: CLOUD.x, y: CLOUD.y, size: CLOUD.size, hidden: true, float: true },
    ],
    moves: [
      { at: 0.15, actor: 'cloud', do: 'enter', from: { x: CLOUD.x, y: -20 }, dur: 0.7, ease: 'out' },
      { at: 0.85, actor: 'cloud', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 0.9, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 0.9, actor: 'jerry', do: 'flip' },
      { at: 0.9, actor: 'jerry', do: 'hop', amount: 3, dur: 0.3 },
      // 跳上去坐好
      { at: 1.4, actor: 'jerry', do: 'swap', emoji: `${J}happy` },
      { at: 1.4, actor: 'jerry', do: 'moveTo', to: { x: CLOUD.x, y: G - CLOUD.seat }, arc: 8, dur: 0.4, ease: 'out' },
      { at: 1.8, actor: 'cloud', do: 'squash', amount: 0.2, dur: 0.25 },
      // 往上飄到最高
      { at: 2.0, actor: 'cloud', do: 'moveTo', to: { x: CLOUD.x + 10, y: CLOUD.y - CLOUD.rise }, dur: 1.1 },
      { at: 2.0, actor: 'jerry', do: 'moveTo', to: { x: CLOUD.x + 10, y: G - CLOUD.seat - CLOUD.rise }, dur: 1.1 },
      { at: 2.6, actor: 'jerry', do: 'swap', emoji: `${J}scared` },
      { at: 3.1, actor: 'jerry', do: 'shake', amount: 1.5, dur: 1.6 },
      // 雲憋氣……變烏雲下雨……噗！
      { at: 3.8, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-puff' },
      { at: 3.9, actor: 'cloud', do: 'squash', amount: -0.15, dur: 0.6 },
      { at: 4.5, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-dark' },
      { at: 5.0, actor: 'cloud', do: 'vanish', dur: 0.15 },
      { at: 5.0, actor: 'jerry', do: 'swap', emoji: `${J}surprised` },
      { at: 5.05, actor: 'jerry', do: 'moveTo', to: { x: CLOUD.x + 10, y: G }, dur: 0.4, ease: 'in' },
      { at: 5.45, actor: 'jerry', do: 'swap', emoji: `${J}flat` },
      { at: 6.0, actor: 'jerry', do: 'swap', emoji: `${J}dizzy` },
      // 爬起來，回到糖旁邊
      { at: 6.6, actor: 'jerry', do: 'swap', emoji: `${J}tired` },
      { at: 6.6, actor: 'jerry', do: 'flip' },
      { at: 6.6, actor: 'jerry', do: 'moveTo', to: { x: HOME_X, y: G }, dur: 0.6 },
    ],
    fx: [
      { at: 0.95, kind: 'pop', actor: 'jerry', emoji: '❓', dur: 0.6 },
      { at: 2.7, kind: 'pop', actor: 'jerry', emoji: '😱', dx: 10, dy: 12, dur: 1.2 },
      { at: 3.2, kind: 'sweat', actor: 'jerry' },
      { at: 4.5, kind: 'rain', actor: 'cloud', dy: 14, n: 8, dur: 0.6 },
      { at: 5.0, kind: 'puff', actor: 'cloud', dur: 0.5 },
      { at: 5.45, kind: 'burst', actor: 'jerry', n: 1, dur: 0.4 },
      { at: 5.6, kind: 'dizzy', actor: 'jerry', dur: 1.0 },
    ],
    // 往上飄的時候自己定在全景：看得到地上的糖，才知道他有多高
    camera: [
      { at: 1.9, dur: 0.6, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
      { at: 5.45, dur: 0.35, do: 'shake', amount: 1.8 },
      { at: 5.7, dur: 0.6, do: 'zoom', amount: 1.4, to: { x: 64, y: 58 } },
    ],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 1.8, sfx: 'boing' },
      { at: 2.5, say: '雲太高了！他好怕！' },
      { at: 4.5, sfx: 'splash' },
      { at: 5.0, sfx: 'poof' },
      { at: 5.45, sfx: 'bonk' },
    ],
  }),

  // 到家了。他累了，睡了。——他拖著腳步走進房間，彎腰喘氣、站著打瞌睡，一頭倒在床上睡著，夢到糖還在流口水
  home: scene({
    duration: 6.6,
    bg: { top: '#BDB5EC', bottom: '#E6E1FA', floor: '#D7B48A', scenery: 'room' },
    actors: [
      { id: 'moon', emoji: '🌙', x: 30, y: 24, size: 10, float: true, hidden: true },
      { id: 'bed', emoji: '🛏️', x: BED.x, y: BED.y, size: BED.size, hidden: true },
      { id: 'jerry', emoji: `${J}walk`, x: 68, y: G, size: 24, flip: true, hidden: true },
      { id: 'drip', emoji: '💧', x: BED.x - 10, y: BED.lie + 7, size: 3, float: true, hidden: true },
    ],
    moves: [
      { at: 0.1, actor: 'bed', do: 'pop', dur: 0.2 },
      { at: 0.1, actor: 'moon', do: 'pop', dur: 0.2 },
      { at: 0.2, actor: 'jerry', do: 'enter', from: { x: -18, y: G }, dur: 1.4, ease: 'out' },
      { at: 1.7, actor: 'jerry', do: 'swap', emoji: `${J}tired` },
      { at: 2.5, actor: 'jerry', do: 'swap', emoji: `${J}doze` },
      { at: 2.6, actor: 'jerry', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 3.1, actor: 'jerry', do: 'tilt', amount: -8, dur: 0.5 },
      // 咚！倒在床上
      { at: 3.6, actor: 'jerry', do: 'flip' },
      { at: 3.6, actor: 'jerry', do: 'swap', emoji: `${J}sleep` },
      { at: 3.6, actor: 'jerry', do: 'moveTo', to: { x: BED.x - 2, y: BED.lie }, arc: 6, dur: 0.4 },
      { at: 4.0, actor: 'bed', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 5.4, actor: 'jerry', do: 'hop', amount: 1, dur: 0.3 },
      // 夢到糖，口水流下來
      { at: 5.1, actor: 'drip', do: 'pop', dur: 0.3 },
      { at: 5.4, actor: 'drip', do: 'scaleTo', amount: 1.6, dur: 0.6 },
      { at: 5.4, actor: 'drip', do: 'moveTo', to: { x: BED.x - 10, y: BED.lie + 10 }, dur: 0.6 },
    ],
    fx: [
      { at: 1.8, kind: 'sweat', actor: 'jerry' },
      { at: 4.2, kind: 'zzz', actor: 'jerry', emoji: '💤', dx: -4, dur: 2.4 },
      { at: 4.6, kind: 'bubble', actor: 'jerry', emoji: '🍭', dx: 8, dur: 1.8, scale: 1.2 },
      { at: 4.4, kind: 'burst', actor: 'moon', emoji: '⭐', n: 6, dur: 1.4 },
    ],
    cues: [
      { at: 0.6, say: '到家了。他累了，睡了。' },
      { at: 4.0, sfx: 'plop' },
      { at: 5.4, sfx: 'bubble' },
    ],
  }),
}

export default scenes
