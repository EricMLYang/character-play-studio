import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蛋（v2）：野餐，小機器人要把籃子裡的一顆雞蛋拿到右邊的平底鍋裡。蛋好脆，一碰就破：
// 每次他螢幕臉好專心、夾子慢慢靠近——「啪！」蛋殼裂成兩半、一大坨黃黃的蛋黃流下來，他看著黏答答的自己傻眼、當機冒煙，地上多一灘蛋黃。
// 一次比一次小心、結果一次比一次慘：夾子直接夾（破在夾子上，疋的上半）→ 換成兩隻手捧著、一步一步慢慢走，走到一半手一抖，
// 蛋飛起來「啪」在自己頭上（疋的下半）→ 先停一拍：他托著下巴想、擦汗、在夾子上墊一根羽毛，用最輕最輕的力氣……成功拿起來了！
// 高興地舉高跳起來——頭上的天線「啪」戳破蛋，蛋黃從頭淋到腳（虫）。每破一次，筆畫就從破掉的蛋殼飛進字框；地上的蛋黃一灘、兩灘、三灘。
// 語詞那一刻籃子裡又冒出一顆最大的蛋，他站在旁邊小心翼翼地指著、不敢碰：「雞蛋」。
// 回馬槍（第四次）：只剩最後一顆，他不敢碰了，蹲在旁邊盯著它發愁——蛋自己「喀、喀、喀」……「啪！」裂開，
// 一隻小雞頂著蛋殼蹦出來，跳到他頭上啾啾叫（原來不是用來煮的）。
// 最後畫面暗下來只剩「蛋」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「蛋！」，然後退場只留字。
// 刻意不跟「書」（翻開東西跳出來）、「岩」（敲不破的硬石頭）、「接」（接東西疊高）撞：這支只演「小心翼翼去拿→啪，破了」。
// 蛋、蛋、雞蛋、這是什麼字？、蛋

/** 小機器人：圖朝左，整支面向右邊的籃子（flip） */
const S = 38
const PY = 77 - 0.42 * S
/** 他每次都從同一個地方開始；伸手夾的時候站到 XA（reach 的夾子剛好碰到蛋） */
const X0 = 60
const XA = 67
/** 籃子在畫面中間，蛋放在籃子裡（蛋的底部比籃子口低一點） */
const BX = 88
const BS = 26
const BY = 77 - 0.42 * BS
const ES = 28
/** 道具的腳底在 y + 0.42 size；蛋的圖底部在 0.961、頂在 0.041 */
const eggY = (bottom: number, size = ES) => bottom - 0.041 * size - 0.42 * size
const EY = eggY(63)
/** 平底鍋（要把蛋放進去的地方）在右邊 */
const PAN = { x: 134, size: 24, y: 77 - 0.42 * 24 }
/** 字放大的時候籃子讓到右邊 */
const BASKET_AWAY = 122
const EGG_TINT = 'saturate(.55) brightness(1.12)'
/** 字框一開始就在左上（太陽在右上） */
const FRAME = { x: 21, y: 19 }
const FRAME_K = 0.42
/** 頭頂（天線）的高度 */
const ANT = PY - 0.45 * S

const moves: Move[] = []
const fx: Fx[] = []
const camera: Camera[] = []
const cues: Cue[] = []
const lights: Light[] = []

/** 蛋（egg）累計轉了幾度：每一顆新蛋要轉回正 */
let eggRot = 0

/** 籃子裡冒出一顆新的完整的蛋（上一顆的殼先「噗」地清掉） */
function newEgg(at: number, size = ES) {
  moves.push(
    { at: at - 0.12, dur: 0.1, actor: 'egg', do: 'vanish' },
    { at: at - 0.12, dur: 0.1, actor: 'shell', do: 'vanish' },
    { at: at - 0.02, dur: 0.01, actor: 'egg', do: 'moveTo', to: { x: BX, y: eggY(63, size) } },
    { at: at - 0.015, actor: 'egg', do: 'swap', emoji: 'prop:egg', half: 'whole' },
  )
  if (eggRot) moves.push({ at: at - 0.015, dur: 0.01, actor: 'egg', do: 'rotateTo', amount: -eggRot, pivot: 'center' })
  eggRot = 0
  moves.push({ at, dur: 0.2, actor: 'egg', do: 'pop' })
  if (size !== ES) moves.push({ at: at + 0.001, dur: 0.01, actor: 'egg', do: 'scaleTo', amount: size / ES })
  cues.push({ at, sfx: 'plop' })
  fx.push({ at: at + 0.05, dur: 0.4, kind: 'burst', x: BX, y: 52, emoji: '✨', n: 5 })
}

/** 地上的一灘一灘蛋黃（一直留到問他之前：一灘、兩灘、三灘），最後才畫 */
const puddles: [number, number, number][] = []
/** 一灘蛋黃：白色的蛋白上面一攤黃（伸縮管畫成扁扁的一條，掛在不會動的平底鍋上） */
function puddle(at: number, x: number, w: number, until: number) {
  const y = 79.5
  fx.push(
    { at, dur: until - at, kind: 'tube', actor: 'pan', dx: x - w / 2 - PAN.x, dy: y - PAN.y, to: { x: x + w / 2, y }, color: '#FFFFFF', width: 4.2, n: 99 },
    { at, dur: until - at, kind: 'tube', actor: 'pan', dx: x - 1.2 - PAN.x, dy: y - 0.8 - PAN.y, to: { x: x + 1.2, y: y - 0.8 }, color: '#FFC21A', width: 3.6, n: 99 },
  )
}

/**
 * 「啪！」（每一次都一樣）：同一個音效、鏡頭推近＋震、💥；蛋殼裂成兩半——上面那片（egg 切成上半）彈起來轉著掉到地上，
 * 下面那片（shell）留在原地；中間一大坨蛋黃冒出來、一滴一滴流到地上，變成一灘。他先傻眼（surprised）、再當機冒煙（glitch）。
 * (x, y) 是蛋的中心；k 是第幾次（越來越大）；land 是蛋黃流到地上的那一點。
 */
function splat(at: number, k: number, x: number, y: number, land: number, w: number) {
  const top = { x: x - 9 - 4 * k, y: y - 9 }
  /** 蛋黃一次比一次大 */
  const YK = 2.6 + 0.4 * k
  moves.push(
    { at, actor: 'egg', do: 'swap', half: 'top', cut: 0.5 },
    { at: at - 0.02, dur: 0.01, actor: 'shell', do: 'moveTo', to: { x, y } },
    { at, dur: 0.01, actor: 'shell', do: 'enter', from: { x, y } },
    { at, dur: 0.12, actor: 'shell', do: 'shake', amount: 1.2 },
    // 上面那片殼：彈起來、轉，停一下，再掉到蛋黃那灘旁邊
    { at, dur: 0.16, actor: 'egg', do: 'moveTo', to: top, ease: 'out' },
    { at, dur: 0.16, actor: 'egg', do: 'rotateTo', amount: -50, pivot: 'center' },
    { at: at + 0.4, dur: 0.22, actor: 'egg', do: 'moveTo', to: { x: land - w / 2 - 5, y: 76 }, ease: 'in' },
    { at: at + 0.4, dur: 0.22, actor: 'egg', do: 'rotateTo', amount: -100, pivot: 'center' },
    // 他：傻眼（停住）→ 當機冒煙
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at, dur: 0.22, actor: 'bot', do: 'hop', amount: 2.5 + k },
    { at: at + 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/glitch' },
    { at: at + 0.45, dur: 0.3, actor: 'bot', do: 'shake', amount: 0.8 },
  )
  eggRot -= 150
  fx.push(
    { at, dur: 0.5, kind: 'burst', x: x + 2, y: y - 6, emoji: '💥', scale: 1.3 + 0.25 * k },
    // 一大坨蛋黃：從裂開的地方冒出來，黏在那裡晃
    // （pop 畫在錨點右上 (6, −6) × scale 的地方，所以錨點往左下退回去，蛋黃才會剛好卡在下面那片殼的口上）
    { at: at + 0.02, dur: 0.75, kind: 'pop', x: x + 1 - 6 * YK, y: y - 1 + 6 * YK, emoji: '🟨', scale: YK },
    // 一滴一滴流下去
    { at: at + 0.1, dur: 0.55, kind: 'rain', x: x + 4, y: y + 2, emoji: '🟨', n: 5 + k, scale: 1.4 + 0.2 * k },
    { at: at + 0.5, kind: 'sweat', actor: 'bot', dx: -4 },
    { at: at + 0.5, dur: 0.45, kind: 'pop', actor: 'bot', emoji: '❓', dx: 2, dy: 2, scale: 1.3 },
  )
  cues.push({ at, sfx: 'crack' }, { at: at + 0.03, sfx: 'splash' }, { at: at + 0.45, sfx: 'blip' })
  if (k > 0) cues.push({ at: at + 0.05, sfx: 'bonk' })
  camera.push(
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x, y: Math.max(y, 52) } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.3 * k },
  )
}

// ---- 開場：他走進來，回頭指著字框——蛋！ ----
moves.push(
  { at: 0, dur: 0.35, actor: 'bot', do: 'enter', from: { x: -25, y: PY }, ease: 'out' },
  { at: 0.36, actor: 'bot', do: 'flip' },
  { at: 0.36, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
  { at: 0.82, actor: 'bot', do: 'flip' },
  { at: 0.82, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
)

/** 瞄準：螢幕臉好專心，夾子慢慢、慢慢靠近（≥ 0.3 秒看得到） */
function aim(at: number, dur: number, from = X0) {
  moves.push(
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/sneak' },
    { at, dur: dur * 0.45, actor: 'bot', do: 'moveTo', to: { x: from + (XA - from) * 0.6, y: PY } },
    { at: at + dur * 0.5, actor: 'bot', do: 'swap', emoji: 'hero:bot/reach' },
    { at: at + dur * 0.5, dur: dur * 0.5, actor: 'bot', do: 'moveTo', to: { x: XA, y: PY }, ease: 'linear' },
  )
  fx.push({ at: at + dur * 0.5, dur: dur * 0.5, kind: 'sweat', actor: 'bot', dx: -4 })
}

// ---- 第一次：夾子直接夾 ----
const A1 = 0.9
aim(A1, 0.55)
const P1 = A1 + 0.57
splat(P1, 0, BX, EY, 80, 10)
puddles.push([P1 + 0.55, 80, 10])

// ---- 第二次：兩隻手捧著、一步一步慢慢走——手一抖，蛋飛起來「啪」在頭上 ----
const R2 = P1 + 0.75
moves.push(
  { at: R2, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
  { at: R2, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: X0, y: PY } },
)
newEgg(R2 + 0.1)
const PICK2 = R2 + 0.3
/** 捧在胸前 */
const HOLD = (bx: number) => ({ x: bx + 14, y: PY + 1 })
moves.push(
  { at: PICK2, actor: 'bot', do: 'swap', emoji: 'hero:bot/hug' },
  { at: PICK2, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: XA, y: PY } },
  { at: PICK2 + 0.15, dur: 0.15, actor: 'egg', do: 'moveTo', to: HOLD(XA), ease: 'out' },
  { at: PICK2 + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/sneak' },
)
// 一步一步慢慢走（往右邊的鍋子）
const XW = 104
const W2 = PICK2 + 0.3
moves.push(
  { at: W2, dur: 0.55, actor: 'bot', do: 'moveTo', to: { x: XW, y: PY }, ease: 'linear' },
  { at: W2, dur: 0.55, actor: 'egg', do: 'moveTo', to: HOLD(XW), ease: 'linear' },
)
fx.push({ at: W2 + 0.15, dur: 0.45, kind: 'sweat', actor: 'bot', dx: -4 })
// 手一抖
const SHK = W2 + 0.57
moves.push(
  { at: SHK, actor: 'bot', do: 'swap', emoji: 'hero:bot/scared' },
  { at: SHK, dur: 0.25, actor: 'bot', do: 'shake', amount: 1.2 },
  { at: SHK, dur: 0.25, actor: 'egg', do: 'shake', amount: 2 },
)
fx.push({ at: SHK, dur: 0.4, kind: 'pop', actor: 'bot', emoji: '❗', dx: 2, scale: 1.4 })
cues.push({ at: SHK, sfx: 'boing' })
// 蛋飛起來、翻一圈，掉在他的頭上
const UP2 = SHK + 0.22
moves.push(
  { at: UP2, dur: 0.25, actor: 'egg', do: 'moveTo', to: { x: XW + 1, y: ANT - 5 }, arc: 14 },
  { at: UP2, dur: 0.25, actor: 'egg', do: 'rotateTo', amount: 360, pivot: 'center' },
  { at: UP2, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
)
eggRot += 360
const P2 = UP2 + 0.25
splat(P2, 1, XW + 1, ANT - 5, 108, 13)
puddles.push([P2 + 0.55, 108, 13])

// ---- 第三次：先停一拍。托下巴想、擦汗、夾子墊一根羽毛，最輕最輕……成功！舉高跳起來——天線「啪」 ----
const R3 = P2 + 0.75
moves.push(
  { at: R3, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
  { at: R3, actor: 'bot', do: 'flip' },
  { at: R3, dur: 0.25, actor: 'bot', do: 'moveTo', to: { x: X0, y: PY } },
  { at: R3 + 0.26, actor: 'bot', do: 'flip' },
  { at: R3 + 0.26, actor: 'bot', do: 'swap', emoji: 'hero:bot/ponder' },
)
newEgg(R3 + 0.2)
// 停一拍：盯著蛋想、擦汗
const THINK = R3 + 0.28
fx.push(
  { at: THINK + 0.05, kind: 'sweat', actor: 'bot', dx: -4 },
  { at: THINK + 0.05, dur: 0.4, kind: 'pop', actor: 'bot', emoji: '❓', dx: 2, scale: 1.3 },
)
cues.push({ at: THINK + 0.05, sfx: 'gulp' })
// 夾子上墊一根羽毛，屏住呼吸、慢慢伸過去
const SOFT = THINK + 0.42
moves.push(
  { at: SOFT, actor: 'bot', do: 'swap', emoji: 'hero:bot/reach' },
  { at: SOFT, dur: 0.5, actor: 'bot', do: 'moveTo', to: { x: XA, y: PY }, ease: 'linear' },
)
fx.push({ at: SOFT, dur: 0.65, kind: 'pop', actor: 'bot', emoji: 'prop:feather', dx: 6, dy: 14, scale: 1.4 })
cues.push({ at: SOFT, sfx: 'bubble' })
// 成功拿起來了！
const GOT = SOFT + 0.52
moves.push(
  { at: GOT, dur: 0.15, actor: 'egg', do: 'moveTo', to: { x: BX - 2, y: EY - 4 }, ease: 'out' },
  { at: GOT + 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
)
fx.push({ at: GOT, dur: 0.45, kind: 'burst', x: BX - 2, y: EY - 2, emoji: '✨', n: 6 })
cues.push({ at: GOT, sfx: 'clink' })
// 舉高高歡呼……
const RAISE = GOT + 0.22
const ABOVE = { x: X0 + 1, y: eggY(ANT - 1) }
moves.push(
  { at: RAISE, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
  { at: RAISE, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: X0, y: PY } },
  { at: RAISE, dur: 0.18, actor: 'egg', do: 'moveTo', to: { x: ABOVE.x, y: ABOVE.y - 5 }, ease: 'out' },
  { at: RAISE + 0.2, dur: 0.3, actor: 'bot', do: 'hop', amount: 6 },
  { at: RAISE + 0.2, dur: 0.13, actor: 'egg', do: 'moveTo', to: { x: ABOVE.x, y: ABOVE.y + 2 }, ease: 'in' },
)
cues.push({ at: RAISE + 0.2, sfx: 'cheer' })
const P3 = RAISE + 0.33
splat(P3, 2, ABOVE.x, ABOVE.y + 2, 62, 16)
puddles.push([P3 + 0.55, 62, 16])
// 蛋黃從頭淋到腳
fx.push({ at: P3 + 0.15, dur: 0.6, kind: 'rain', actor: 'bot', emoji: '🟨', n: 8, dy: 8, scale: 1.5 })

// ---- 拼好：國字放大到中間 ----
const BUILT = P3 + 0.25 + 0.5
const HOME = BUILT + 0.1
const PARK = HOME + 0.85
// 字放大的時候大家讓開：殼收掉、他退到左邊、籃子滑到右邊
moves.push(
  { at: HOME - 0.15, dur: 0.12, actor: 'egg', do: 'vanish' },
  { at: HOME - 0.15, dur: 0.12, actor: 'shell', do: 'vanish' },
  { at: HOME - 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
  { at: HOME - 0.15, actor: 'bot', do: 'flip' },
  { at: HOME - 0.15, dur: 0.25, actor: 'bot', do: 'moveTo', to: { x: 24, y: PY } },
  { at: HOME + 0.1, actor: 'bot', do: 'flip' },
  { at: HOME + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
  { at: HOME - 0.15, dur: 0.25, actor: 'basket', do: 'moveTo', to: { x: BASKET_AWAY, y: BY } },
)
fx.push({ at: HOME - 0.15, dur: 0.35, kind: 'puff', x: 62, y: 76 })

// ---- 語詞：籃子裡冒出一顆最大的蛋，他小心翼翼地指著、不敢碰——雞蛋 ----
const WORD = PARK + 0.4
const BIG = 38
newEgg(WORD - 0.05, BIG)
moves.push(
  { at: WORD - 0.22, dur: 0.17, actor: 'basket', do: 'moveTo', to: { x: BX, y: BY } },
  { at: WORD - 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
  { at: WORD - 0.05, dur: 0.22, actor: 'bot', do: 'moveTo', to: { x: X0 - 2, y: PY } },
  { at: WORD + 0.18, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
  { at: WORD + 0.25, dur: 0.3, actor: 'egg', do: 'flash' },
)
fx.push({ at: WORD + 0.2, dur: 0.5, kind: 'burst', x: BX, y: 44, emoji: '🌟', n: 8, scale: 1.2 })

// ---- 回馬槍（第四次）：最後一顆，他不敢碰了，蹲著發愁——蛋自己喀、喀、喀……啪！小雞蹦出來 ----
const A4 = WORD + 0.6
moves.push(
  { at: A4, actor: 'bot', do: 'swap', emoji: 'hero:bot/peek' },
  { at: A4, dur: 0.2, actor: 'bot', do: 'moveTo', to: { x: XA - 1, y: PY } },
)
fx.push({ at: A4 + 0.2, kind: 'sweat', actor: 'bot', dx: -4 })
const EY4 = eggY(63, BIG)
;[0, 1, 2].forEach((i) => {
  const t = A4 + 0.25 + i * 0.2
  moves.push(
    { at: t, dur: 0.14, actor: 'egg', do: 'shake', amount: 1.2 + 0.5 * i },
    { at: t, dur: 0.14, actor: 'bot', do: 'hop', amount: 1.5 },
  )
  cues.push({ at: t, sfx: 'tap' })
})
const P4 = A4 + 0.25 + 3 * 0.2 + 0.1
// 啪！（同一個音效、同一個鏡頭）上面那片殼頂在小雞頭上蹦出來
const CHICK = { x: BX, y: 77 - 0.42 * 20 - 10 }
moves.push(
  { at: P4, actor: 'egg', do: 'swap', half: 'top', cut: 0.45 },
  { at: P4 - 0.02, dur: 0.01, actor: 'shell', do: 'moveTo', to: { x: BX, y: CHICK.y + 6 } },
  { at: P4 - 0.015, actor: 'shell', do: 'swap', emoji: '🐥', half: 'whole' },
  { at: P4 - 0.015, actor: 'shell', do: 'tint', filter: '' },
  { at: P4, dur: 0.2, actor: 'shell', do: 'pop' },
  { at: P4, dur: 0.18, actor: 'shell', do: 'moveTo', to: CHICK, ease: 'back' },
  { at: P4, dur: 0.18, actor: 'egg', do: 'moveTo', to: { x: BX, y: CHICK.y - 2 - 0.2 * BIG }, ease: 'back' },
  { at: P4, dur: 0.16, actor: 'egg', do: 'scaleTo', amount: 0.62 },
  { at: P4, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
  { at: P4, dur: 0.22, actor: 'bot', do: 'hop', amount: 5 },
)
fx.push({ at: P4, dur: 0.5, kind: 'burst', x: BX + 2, y: EY4 - 6, emoji: '💥', scale: 1.9 })
cues.push({ at: P4, sfx: 'crack' }, { at: P4 + 0.05, sfx: 'poof' })
camera.push(
  { at: P4, dur: 0.45, do: 'punch', amount: 0.2, to: { x: BX, y: 50 } },
  { at: P4, dur: 0.3, do: 'shake', amount: 1.6 },
)
// 小雞頂著蛋殼跳到他頭上，啾啾叫
const HOP4 = P4 + 0.42
const HEAD = { x: XA - 2, y: ANT - 6 }
moves.push(
  { at: HOP4, dur: 0.3, actor: 'shell', do: 'moveTo', to: HEAD, arc: 10 },
  { at: HOP4, dur: 0.3, actor: 'egg', do: 'moveTo', to: { x: HEAD.x, y: HEAD.y - 8 - 0.05 * BIG }, arc: 10 },
  { at: HOP4 + 0.32, actor: 'bot', do: 'swap', emoji: 'hero:bot/glitch' },
  { at: HOP4 + 0.32, dur: 0.2, actor: 'bot', do: 'squash', amount: 0.12 },
)
fx.push({ at: HOP4 + 0.35, dur: 0.6, kind: 'zzz', actor: 'shell', emoji: '🎵', dx: -6, scale: 1.3 })
cues.push({ at: HOP4 + 0.32, sfx: 'blip' }, { at: HOP4 + 0.35, sfx: 'bubble' })

// ---- 問他 ----
const ASK = HOP4 + 0.62
/** 問句唸完（0.97 秒）再安靜 1.5 秒以上才回答 */
const ANSWER = ASK + 0.05 + 0.974 + 1.53
const AS = 1.3
const APY = 77 - 0.42 * S * AS
const AX = 128
moves.push(
  { at: ASK, dur: 0.2, actor: 'egg', do: 'vanish' },
  { at: ASK, dur: 0.2, actor: 'shell', do: 'vanish' },
  { at: ASK, dur: 0.2, actor: 'basket', do: 'vanish' },
  { at: ASK, dur: 0.2, actor: 'pan', do: 'vanish' },
  { at: ASK - 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
  { at: ASK - 0.1, dur: 0.25, actor: 'bot', do: 'moveTo', to: { x: AX, y: APY }, arc: 5, ease: 'out' },
  { at: ASK + 0.15, actor: 'bot', do: 'flip' },
  { at: ASK + 0.1, dur: 0.3, actor: 'bot', do: 'scaleTo', amount: AS, ease: 'back' },
  { at: ASK + 1.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
  { at: ASK + 1.6, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
  { at: ASK + 2.1, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
  { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
  { at: ANSWER, dur: 0.3, actor: 'bot', do: 'hop', amount: 7 },
  { at: ANSWER + 0.12, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
  { at: ANSWER + 0.12, actor: 'bot', do: 'flip' },
  { at: ANSWER + 0.12, dur: 0.18, actor: 'bot', do: 'moveTo', to: { x: 205, y: APY }, ease: 'in' },
)

for (const [at, x, w] of puddles) puddle(at, x, w, ASK)

const clip: Clip = {
  format: 2,
  char: '蛋',
  meta: { theme: '小機器人搬雞蛋，一碰就破', cast: '小機器人＋雞蛋＋籃子＋平底鍋＋小雞', gags: ['小機器人要把籃子裡的雞蛋拿到平底鍋，每次螢幕臉好專心、慢慢靠近，「啪」蛋殼裂成兩半、蛋黃流下來，他傻眼當機，地上多一灘蛋黃；一次比一次小心、一次比一次慘（夾子直接夾破在夾子上→兩手捧著慢慢走，手一抖蛋飛起來啪在臉上→停一拍：墊羽毛最輕最輕地拿起來成功了，高興舉高一跳，天線啪地戳破、淋了一身）；回馬槍是最後一顆他不敢碰、蹲著發愁，蛋自己喀喀喀啪地裂開，小雞頂著蛋殼蹦出來跳到他頭上啾啾叫'] },
  duration: 15,
  // 野餐的草地：淡淡的天空、嫩綠的地（白蛋白、黃蛋黃在綠地上看得清楚）；太陽在右上，字框在左上
  bg: { top: '#DDF1FF', bottom: '#F6FBFF', floor: '#BFD98A', scenery: 'hills' },
  actors: [
    { id: 'basket', emoji: 'prop:charm-basket', x: BX, y: BY, size: BS },
    { id: 'bot', emoji: 'hero:bot/walk', x: X0, y: PY, size: S, hidden: true, flip: true },
    // 蛋殼調淡一點（淺褐色），跟橘色的小機器人分得開
    { id: 'egg', emoji: 'prop:egg', x: BX, y: EY, size: ES, tint: EGG_TINT },
    { id: 'shell', emoji: 'prop:egg', x: BX, y: EY, size: ES, hidden: true, half: 'bottom', cut: 0.5, tint: EGG_TINT },
    { id: 'pan', emoji: '🍳', x: PAN.x, y: PAN.y, size: PAN.size },
  ],
  moves,
  builds: [
    // 每破一次，筆畫就從破掉的蛋殼飛進字框
    { at: P1 + 0.25, dur: 0.45, strokes: [0, 1, 2], from: 'shell', color: partColor('疋') },
    { at: P2 + 0.25, dur: 0.45, strokes: [3, 4], from: 'shell', color: partColor('疋') },
    { at: P3 + 0.25, dur: 0.5, strokes: [5, 6, 7, 8, 9, 10], from: 'shell', color: partColor('虫') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.3, do: 'park' },
    { at: PARK + 0.3, dur: 0.3, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['bot'], to: { x: 62, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.3, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...fx,
    { at: ANSWER, dur: 0.25, kind: 'burst', x: 80, y: 40, emoji: '🌟', n: 10 },
  ],
  camera: [
    // 鏡頭鎖全景（自動取景往前預看會切到人或字），只有「啪」的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...camera,
  ],
  lights: [
    ...lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.4, say: '蛋' },
    ...cues,
    { at: HOME + 0.1, say: '蛋' },
    { at: WORD + 0.1, say: '雞蛋' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '蛋' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
