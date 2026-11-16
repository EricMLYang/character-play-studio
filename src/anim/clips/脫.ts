import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 脫（v2）：浣熊花生回到家要脫鞋，可是他什麼都穿太多——每次抬腳用力一甩「啵！」，腳上的東西就脫下來飛出去，
// 低頭一看：裡面還有一隻！同一個「抬腳→甩→啵」，一次比一次難脫、飛得一次比一次遠：
// 大雨鞋飛到前面地上（⺼）→ 裡面的球鞋飛到畫面邊（兌的丷）→ 先停一拍：裡面還有襪子，他瞪著它、全身抖著蓄力⋯⋯啵！襪子飛上天又掉下來（兄）。
// 光著腳好得意——另一隻腳還穿著一隻大雨鞋。他換腳、使出全身的力氣：「脫鞋！」
// 回馬槍（第四次）：這隻卡得太緊，一甩——鞋子沒脫掉，連他自己一起被甩飛出畫面；他從天上掉下來時，兩隻腳終於光溜溜。
// 最後畫面暗下來只剩「脫」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「脫！」，然後退場只留字。
// 刻意不跟「很」（脫下臭襪子甩出臭氣）撞：這支沒有臭味，笑點是「脫了一隻裡面還有一隻」和越甩越遠；也不演穿上去（那是「穿」）。
// 脫、脫、脫鞋、這是什麼字？、脫

/** 花生（size 34，flip 朝右）每次都站在同一個地方甩腳 */
const RS = 40
/** 腳的位置是照 size 34 量的，換大小要跟著縮放 */
const F = RS / 34
const fy = (y: number) => 77 + (y - 77) * F
const RY = 77 - 0.42 * RS
const X = 34
/** 第四次（回馬槍）換腳時跳到畫面中間：語詞那一刻他和大雨鞋在正中間 */
const X2 = 74
/** 鞋子、襪子的大小（emoji 會被自動放大三成）：一層比一層大，總覽縮圖上才一眼看得出腳上還有一隻 */
const BOOT = 13, SHOE = 15, SOCK = 18
/** 自動放大的倍率（小於 18 的都是 1.3） */
const GROW = 1.3
/** 球鞋調濃（3D 圖的淡紫在灰毛旁邊看不清楚） */
const SHOE_TINT = 'saturate(2.6) brightness(0.85)'
/** 穿在腳上時，鞋子中心比腳的中心高多少（鞋底對齊腳底）；x 往前偏一點，鞋筒才套在腿上 */
const lift = (s: number) => 0.4375 * s * GROW - 1.5
const ground = (s: number) => 78.5 - 0.4375 * s * GROW

/**
 * 每個姿勢兩隻腳在哪裡（圖朝左、劇本 flip 朝右，所以照圖量的 x 要反過來）：
 * [前腳 dx, 後腳 dx, 前腳 y, 後腳 y]。stomp 前腳抬起來、kick 前腳踢到半空。
 */
const FEET = {
  idle: [5.4, -2.3, 77, 77],
  surprised: [5.7, -2.9, 77, 77],
  ponder: [6.5, -2.1, 77, 77],
  smug: [5.6, -1.3, 77, 77],
  stomp: [7.3, -6.0, 74.3, 76.6],
  kick: [10.0, -0.1, 64.0, 77],
} as const
type Pose = keyof typeof FEET

/** 腳上穿的東西：front＝前腳（一層一層：雨鞋→球鞋→襪子）、back＝後腳（一隻大雨鞋） */
type Slot = { id: string; size: number } | null

/** 換姿勢：花生換圖，腳上的東西跟著搬到那張圖的腳上 */
function pose(at: number, p: Pose, front: Slot, back: Slot, x = X): Move[] {
  const [fx, bx, fy0, by0] = FEET[p].map((v, i) => i < 2 ? v * F : fy(v))
  const fy1 = fy0, by = by0
  const ms: Move[] = [{ at, actor: 'raccoon', do: 'swap', emoji: `hero:raccoon/${p}` }]
  if (front) ms.push({ at, actor: front.id, do: 'moveTo', to: { x: x + fx + 1.5, y: fy1 - lift(front.size) }, dur: 0.04 })
  if (back) ms.push({ at, actor: back.id, do: 'moveTo', to: { x: x + bx - 2.5, y: by - lift(back.size) }, dur: 0.04 })
  return ms
}

/** 抬腳蓄力多久（前三次一次比一次久；第四次前面已經換腳、唸「脫鞋」停過一拍了） */
const WIND = [0.45, 0.55, 0.75, 0.6]

/**
 * 「啵」：抬腳蓄力（stomp，腳上的東西抖著、卡住了）→ 一甩（kick）→ 💥＋鏡頭推近＋震＋同一個音效（一次多疊一個），
 * 腳上那一層變成 fly 飛出去；k 是第幾次（越後面抖得越久、💥 越大、震越大）。
 */
function pop(at: number, k: number, front: Slot, back: Slot, x = X) {
  const kickAt = { x: x + FEET.kick[0] * F + 1.5, y: fy(FEET.kick[2]) - 2 }
  const moves: Move[] = [
    ...pose(at - WIND[k], 'stomp', front, back, x),
    { at: at - WIND[k] + 0.1, actor: front!.id, do: 'shake', amount: 0.8 + 0.4 * k, dur: WIND[k] - 0.12 },
    { at: at - WIND[k] + 0.1, actor: 'raccoon', do: 'shake', amount: 0.3 + 0.2 * k, dur: WIND[k] - 0.12 },
    ...pose(at, 'kick', front, back, x),
  ]
  const fx: Fx[] = [
    { at: at - WIND[k] + 0.1, kind: 'sweat', actor: 'raccoon', dx: -4, dur: WIND[k] },
    { at: at + 0.02, kind: 'burst', x: kickAt.x + 3, y: kickAt.y - 1, n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
  ]
  const camera: Camera[] = [
    // 推近的中心放低、往畫面中間偏，花生整隻（含腳）留在畫面裡
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.03 * k, to: { x: kickAt.x + 8, y: 66 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues, kickAt }
}

const K1 = 1.9, K2 = 3.5, K3 = 5.55, K4 = 9.6
const BOOT_F: Slot = { id: 'front', size: BOOT }
const SHOE_F: Slot = { id: 'front', size: SHOE }
const SOCK_F: Slot = { id: 'front', size: SOCK }
const BOOT_B: Slot = { id: 'back', size: BOOT }
const p1 = pop(K1, 0, BOOT_F, BOOT_B)
const p2 = pop(K2, 1, SHOE_F, BOOT_B)
const p3 = pop(K3, 2, SOCK_F, BOOT_B)
// 第四次：換腳，後腳那隻大雨鞋現在在抬起來的那隻腳上
const p4 = pop(K4, 3, BOOT_F, null, X2)

/** 脫下來的那一層：從踢到半空的腳飛出去（fly 換成那一層的圖） */
function fling(at: number, emoji: string, shrink: number, to: { x: number; y: number }, arc: number, dur: number, spin: number): Move[] {
  return [
    { at, actor: 'fly', do: 'swap', emoji },
    // scaleTo 會累乘：每次只縮「比上一層小多少」
    { at, actor: 'fly', do: 'scaleTo', amount: shrink, dur: 0.01 },
    { at, actor: 'fly', do: 'moveTo', to: p1.kickAt, dur: 0.01 },
    { at: at + 0.01, actor: 'fly', do: 'pop', dur: 0.04 },
    { at: at + 0.03, actor: 'fly', do: 'moveTo', to, arc, dur, ease: 'out' },
    { at: at + 0.03, actor: 'fly', do: 'spin', times: spin, dur, pivot: 'center' },
  ]
}

/** 問他的時候花生站的地方（左前方，國字偏右） */
const AX = 34

const clip: Clip = {
  format: 2,
  char: '脫',
  meta: { theme: '浣熊花生回家脫鞋', cast: '浣熊花生＋雨鞋＋球鞋＋襪子', gags: ['花生每次抬腳用力一甩「啵」地脫下一層，裡面還有一隻、一次比一次難脫、飛得一次比一次遠（雨鞋→球鞋→襪子飛上天）；回馬槍是最後一隻大雨鞋卡太緊，一甩連他自己一起被甩飛出畫面'] },
  duration: 15,
  bg: { top: '#FFF0DA', bottom: '#FFF8EC', floor: '#C9965F', scenery: 'room' },
  actors: [
    // 後腳的大雨鞋畫在花生後面（看得出是另一隻腳），前腳的雨鞋畫在前面（裡面還有球鞋、襪子：同一個角色換圖）
    { id: 'back', emoji: '👢', x: X + FEET.idle[1] * F - 2.5, y: 77 - lift(BOOT), size: BOOT, float: true },
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: X, y: RY, size: RS, flip: true },
    { id: 'front', emoji: '👢', x: X + FEET.idle[0] * F + 1.5, y: 77 - lift(BOOT), size: BOOT, float: true, pivot: 'center' },
    // 脫下來飛出去的那一層
    { id: 'fly', emoji: '👢', x: X, y: 60, size: BOOT, float: true, hidden: true },
  ],
  moves: [
    // 開場：回到家，抬頭看字框，再低頭看腳上的大雨鞋（要脫鞋了）
    { at: 0.35, actor: 'raccoon', do: 'tilt', amount: -8, dur: 0.5 },
    ...pose(1.1, 'ponder', BOOT_F, BOOT_B),
    // 第 1 次：啵！雨鞋飛到前面地上——腳上還有一隻球鞋
    ...p1.moves,
    ...fling(K1, '👢', 1, { x: 82, y: ground(BOOT) }, 12, 0.45, 1),
    { at: K1 + 0.02, actor: 'front', do: 'swap', emoji: '👟' },
    { at: K1 + 0.02, actor: 'front', do: 'scaleTo', amount: SHOE / BOOT, dur: 0.01 },
    // 球鞋的圖是斜的（鞋尖朝右下），穿在腳上要轉平
    { at: K1 + 0.02, actor: 'front', do: 'rotateTo', amount: -25, dur: 0.01 },
    // 3D 球鞋是很淡的薰衣草紫，跟他的灰毛太像：調濃一點
    { at: K1 + 0.02, actor: 'front', do: 'tint', filter: SHOE_TINT },
    ...pose(K1 + 0.35, 'surprised', SHOE_F, BOOT_B),
    // 第 2 次：啵！球鞋飛到畫面邊——腳上還有一隻襪子
    ...pose(K2 - WIND[1] - 0.35, 'idle', SHOE_F, BOOT_B),
    ...p2.moves,
    ...fling(K2, '👟', SHOE / BOOT, { x: 118, y: ground(SHOE) }, 18, 0.55, 2),
    { at: K2 + 0.02, actor: 'front', do: 'swap', emoji: '🧦' },
    { at: K2 + 0.02, actor: 'front', do: 'scaleTo', amount: SOCK / SHOE, dur: 0.01 },
    { at: K2 + 0.02, actor: 'front', do: 'rotateTo', amount: 25, dur: 0.01 },
    { at: K2 + 0.02, actor: 'front', do: 'tint', filter: '' },
    { at: K2, actor: 'fly', do: 'tint', filter: SHOE_TINT },
    { at: K3, actor: 'fly', do: 'tint', filter: '' },
    ...pose(K2 + 0.35, 'surprised', SOCK_F, BOOT_B),
    // 停一拍：瞪著襪子想一想⋯⋯
    ...pose(4.3, 'ponder', SOCK_F, BOOT_B),
    { at: 4.45, actor: 'front', do: 'shake', amount: 0.6, dur: 0.3 },
    // 第 3 次：抖最久——啵！襪子飛上天（出畫面），過一會兒才掉下來
    ...p3.moves,
    // 襪子先大大的、轉著往右上飛一段（看得到），再咻地衝出畫面上方
    ...fling(K3, '🧦', SOCK / SHOE, { x: 122, y: 46 }, 12, 0.45, 2),
    { at: K3 + 0.5, actor: 'fly', do: 'moveTo', to: { x: 150, y: -25 }, dur: 0.3, ease: 'in' },
    { at: K3 + 0.5, actor: 'fly', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
    { at: K3 + 0.02, actor: 'front', do: 'vanish', dur: 0.05 },
    ...pose(K3 + 0.35, 'smug', null, BOOT_B),
    // 掉回來：從畫面上方轉著慢慢落下，看得到一路掉到地上
    { at: 6.3, actor: 'fly', do: 'moveTo', to: { x: 126, y: -25 }, dur: 0.01 },
    { at: 6.32, actor: 'fly', do: 'moveTo', to: { x: 126, y: ground(SOCK) }, dur: 0.43, ease: 'in' },
    { at: 6.32, actor: 'fly', do: 'spin', times: 1, dur: 0.43, pivot: 'center' },
    // 每一層落地一彈，就變成筆畫飛上去
    { at: K1 + 0.6, actor: 'fly', do: 'vanish', dur: 0.15 },
    { at: K2 + 0.7, actor: 'fly', do: 'vanish', dur: 0.15 },
    { at: 6.8, actor: 'fly', do: 'vanish', dur: 0.15 },
    // 字框填滿：光著一隻腳好得意⋯⋯低頭一看，另一隻腳還有一隻大雨鞋
    ...pose(7.95, 'ponder', null, BOOT_B),
    { at: 8.05, actor: 'back', do: 'shake', amount: 0.8, dur: 0.3 },
    // 換腳：一跳跳到畫面中間（大雨鞋換到要甩的那隻腳）
    // 後腳的雨鞋畫在他後面，跳到半空時換成前面那個角色（front）來演，甩的時候才看得清楚
    { at: 8.35, actor: 'raccoon', do: 'moveTo', to: { x: X2, y: RY }, arc: 5, dur: 0.35 },
    { at: 8.35, actor: 'back', do: 'moveTo', to: { x: X2 + FEET.idle[0] * F + 1.5, y: 77 - lift(BOOT) }, arc: 5, dur: 0.35 },
    { at: 8.52, actor: 'front', do: 'swap', emoji: '👢' },
    { at: 8.52, actor: 'front', do: 'scaleTo', amount: BOOT / SOCK, dur: 0.01 },
    { at: 8.52, actor: 'front', do: 'moveTo', to: { x: X2 + FEET.idle[0] * F + 1.5, y: 77 - lift(BOOT) - 2.5 }, dur: 0.01 },
    { at: 8.52, actor: 'front', do: 'moveTo', to: { x: X2 + FEET.idle[0] * F + 1.5, y: 77 - lift(BOOT) }, dur: 0.18, ease: 'in' },
    { at: 8.53, actor: 'front', do: 'pop', dur: 0.02 },
    { at: 8.53, actor: 'back', do: 'vanish', dur: 0.01 },
    ...pose(8.72, 'idle', BOOT_F, null, X2),
    // 回馬槍（第四次）：卡太緊——啵！鞋子沒脫掉，連他自己一起被甩飛出右上方
    ...p4.moves,
    { at: K4 + 0.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: K4 + 0.25, actor: 'raccoon', do: 'moveTo', to: { x: 220, y: 58 }, dur: 0.4, ease: 'in' },
    { at: K4 + 0.25, actor: 'raccoon', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    { at: K4 + 0.25, actor: 'front', do: 'moveTo', to: { x: 230, y: 64 }, dur: 0.4, ease: 'in' },
    { at: K4 + 0.25, actor: 'front', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    // 問他：花生從天上掉到左前方（兩隻腳光溜溜），轉向觀眾
    { at: 10.5, actor: 'raccoon', do: 'moveTo', to: { x: AX, y: -40 }, dur: 0.01 },
    { at: 10.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 10.5, actor: 'raccoon', do: 'scaleTo', amount: 1.3, dur: 0.01 },
    { at: 10.55, actor: 'raccoon', do: 'moveTo', to: { x: AX, y: RY + 2 }, dur: 0.28, ease: 'in' },
    { at: 11.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.95, actor: 'raccoon', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.72, actor: 'raccoon', do: 'flip' },
    { at: 13.75, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: RY + 2 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：雨鞋落地一彈，⺼ 從雨鞋裡彈出來
    { at: K1 + 0.55, dur: 0.55, strokes: [0, 1, 2, 3], from: 'fly', color: partColor('⺼') },
    // 第 2 次：球鞋落地，兌的上面兩點
    { at: K2 + 0.65, dur: 0.4, strokes: [4, 5], from: 'fly', color: partColor('兌') },
    // 第 3 次：襪子從天上掉下來，兌的下面（兄）
    { at: 6.75, dur: 0.6, strokes: [6, 7, 8, 9, 10], from: 'fly', color: partColor('兌') },
  ],
  glyph: [
    { at: 7.4, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.25, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給花生
    { at: 10.5, dur: 3.45, do: 'ask', keep: ['raccoon'], to: { x: 102, y: 43 }, amount: 0.82 },
    { at: 10.55, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...p1.fx,
    { at: K1 + 0.5, kind: 'burst', actor: 'fly', n: 1, dur: 0.3 },
    { at: K1 + 0.55, kind: 'puff', actor: 'fly', dur: 0.4 },
    ...p2.fx,
    { at: K2 + 0.6, kind: 'burst', actor: 'fly', n: 1, dur: 0.3 },
    { at: K2 + 0.65, kind: 'puff', actor: 'fly', dur: 0.4 },
    // 停一拍：瞪著襪子
    { at: 4.35, kind: 'pop', actor: 'raccoon', emoji: '❓', dx: 4, dur: 0.5, scale: 1.3 },
    ...p3.fx,
    { at: K3 + 0.4, kind: 'burst', actor: 'raccoon', emoji: '⭐', n: 6, dur: 0.4 },
    { at: 6.7, kind: 'burst', actor: 'fly', n: 1, dur: 0.3 },
    { at: 6.75, kind: 'puff', actor: 'fly', dur: 0.4 },
    ...p4.fx,
    { at: K4 + 0.02, kind: 'burst', x: p4.kickAt.x + 3, y: p4.kickAt.y - 1, emoji: '⭐', n: 8, dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 102, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 語詞那一刻：推近他和大雨鞋
    { at: 8.7, dur: 0.3, do: 'zoom', amount: 1.25, to: { x: X2 + 4, y: 56 } },
    { at: 9.45, dur: 0.15, do: 'zoom', amount: 1 },
    ...p1.camera,
    ...p2.camera,
    ...p3.camera,
    // 襪子飛走到掉回來這段，鏡頭停在全景偏一點點（不讓自動取景把花生擠到左下角）
    { at: K3 + 0.45, dur: 0.3, do: 'zoom', amount: 1.04, to: { x: 80, y: 48 } },
    { at: 6.75, dur: 0.2, do: 'zoom', amount: 1 },
    ...p4.camera,
  ],
  lights: [
    { at: 7.4, dur: 0.05, level: -0.3 },
    { at: 7.45, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '脫' },
    ...p1.cues,
    { at: K1 + 0.5, sfx: 'plop' },
    ...p2.cues,
    { at: K2 + 0.6, sfx: 'plop' },
    ...p3.cues,
    { at: 6.7, sfx: 'plop' },
    { at: 7.5, say: '脫' },
    { at: 8.72, say: '脫鞋' },
    ...p4.cues,
    { at: 10.85, sfx: 'bonk' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '脫' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
