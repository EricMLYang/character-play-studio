// 演的是字面意思：角落（牆和櫃子夾出來的一個窄窄的位置）＋小夥伴（一群好朋友）——大家都想擠進同一個角落，後來的一個比一個大，先到的被越擠越扁（沒有白熊、企鵝、貓、炸豬排、炸蝦尾、恐龍、雜草、粉圓那一組，不是縮在牆角怕冷害羞）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：角落已經有人了，後面來的一個比一個大，屁股先塞、「啵」地硬擠進去，把先到的越擠越扁。
// 同一個動作（走到角落口 → 看一眼、裡面的人伸手「等一下！」→ 轉身屁股朝裡 → 往後一塞 →「啵」）、同一串「咻—啵」做三次：
// 小機器人擠進來，小老鼠被擠瘦一截 → 大怪獸擠進來，兩個都被擠成細細一條、大怪獸自己也卡在角落口 →
// 停一拍：第三個來的是一隻小小的小雞，三個大家屏住呼吸吸肚子……小雞照樣屁股先塞，從大家腳邊一路鑽到最裡面——
// 反轉：「啵！」三個像瓶塞一樣全被擠出來，往前面地上滾成一團，角落變成小雞一個人的。三個擠成一團哈哈笑：「角落小夥伴」。
// 卡司：自家主角小老鼠（小）、小機器人（中）、大怪獸（大）＋一隻小雞；不用熊、企鵝、貓、恐龍那一組，不排排坐。

// ── 角落：左邊一面牆（🟫 拉成細高的牆面）、右邊一個高櫃子，中間夾出一個窄窄的位置 ──
const WALL = { x: 33, s: 40 } // 牆面（內側約在 x 38）
const CAB = { x: 93, s: 50 } // 高櫃子（左緣約在 x 82）

// ── 三個小夥伴＋小雞 ──
const M = 24 // 小老鼠
const B = 32 // 小機器人
const X = 42 // 大怪獸
const C = 12 // 小雞
const gy = (s: number) => 77 - 0.42 * s
/** 跌出來以後在前面地上（比地板再往前一點，靠近鏡頭） */
const fy = (s: number) => 79.5 - 0.42 * s

/** 每一個階段的寬、高倍率（被擠瘦、變高一點）；用 stretchTo（寬 a、高 1/a）＋ scaleTo（s）湊出來：a = √(w/h)、s = √(w·h) */
type Shape = { w: number; h: number; x: number }
const SHAPE: Record<string, Shape[]> = {
  // 0：開場　1：小機器人擠進來　2：大怪獸擠進來　3：屏住呼吸吸肚子
  mouse: [{ w: 1, h: 1, x: 50 }, { w: 0.72, h: 1.08, x: 45.5 }, { w: 0.5, h: 1.14, x: 43 }, { w: 0.42, h: 1.18, x: 42.3 }],
  bot: [{ w: 1, h: 1, x: 0 }, { w: 1, h: 1, x: 61.5 }, { w: 0.66, h: 1.1, x: 54 }, { w: 0.58, h: 1.14, x: 52 }],
  mon: [{ w: 1, h: 1, x: 0 }, { w: 1, h: 1, x: 0 }, { w: 0.84, h: 1.06, x: 74 }, { w: 0.77, h: 1.1, x: 71 }],
}
const ar = (p: Shape) => Math.sqrt(p.w / p.h)
const sc = (p: Shape) => Math.sqrt(p.w * p.h)
/** 從階段 i 變到階段 j 的 stretchTo／scaleTo（兩個都會累乘，所以給比值） */
function reshape(id: string, i: number, j: number, at: number, dur: number, ease: Move['ease'] = 'back'): Move[] {
  const a = SHAPE[id][i], b = SHAPE[id][j]
  return [
    { at, actor: id, do: 'stretchTo', amount: ar(b) / ar(a), dur, ease },
    { at, actor: id, do: 'scaleTo', amount: sc(b) / sc(a), dur, ease },
  ]
}
const SIZE: Record<string, number> = { mouse: M, bot: B, mon: X }

/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const Z = 1.55
const MAIN = look(70, 48, Z)

/** 看一眼、伸手「等一下」的裡面的人用哪張圖；被擠到時用哪張 */
const WAIT: Record<string, string> = { mouse: 'hero:mouse/wait', bot: 'hero:bot/wait' }
const SQUISH: Record<string, string> = { mouse: 'hero:mouse/scared', bot: 'hero:bot/scared', mon: 'hero:monster/surprised' }

/**
 * 主軸：走到角落口 T → 看一眼（裡面的人伸手「等一下！」）→ 轉身屁股朝裡 → 往後一塞 →「啵」：裡面的人被擠瘦一截。
 * who＝擠進來的、inside＝已經在裡面的、k＝第幾次（0 小機器人、1 大怪獸、2 小雞）、to＝塞到哪裡、look＝看一眼停多久。
 * 回傳 hit＝「啵」那一刻。
 */
function squeeze(T: number, who: string, inside: string[], k: number, to: number, y: number, lookDur = 0.35) {
  const turn = T + lookDur
  const push = turn + 0.2
  const slide = k === 2 ? 0.5 : 0.35
  const hit = push + slide
  const moves: Move[] = [
    // 看一眼：頭往角落一歪
    { at: T, actor: who, do: 'tilt', amount: 10, dur: 0.3 },
    // 裡面的人：「等一下！」
    ...inside.filter((id) => WAIT[id]).map((id): Move => ({ at: T + 0.05, actor: id, do: 'swap', emoji: WAIT[id] })),
    // 轉身屁股朝裡、蹲一下蓄力
    { at: turn, actor: who, do: 'flip' },
    { at: turn + 0.02, actor: who, do: 'squash', amount: 0.15, dur: 0.18 },
    // 往後一塞（扭屁股）
    { at: push, actor: who, do: 'moveTo', to: { x: to, y }, dur: slide, ease: 'in' },
    { at: push, actor: who, do: 'shake', amount: 0.8, dur: slide },
  ]
  const fx: Fx[] = [{ at: hit, kind: 'puff', x: to - 6, y: 74, n: 6 + 3 * k, dur: 0.45 }]
  const cues: Cue[] = [{ at: push, sfx: 'slide' }, { at: hit, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: hit + 0.05, sfx: 'bonk' })
  if (k < 2) {
    const stage = k + 1 // 擠完以後的階段
    // 啵：裡面的人被擠瘦一截、表情變成被擠扁
    for (const id of inside) {
      moves.push(...reshape(id, stage - 1, stage, hit, 0.16))
      moves.push({ at: hit, actor: id, do: 'moveTo', to: { x: SHAPE[id][stage].x, y: gy(SIZE[id]) }, dur: 0.16, ease: 'out' })
      moves.push({ at: hit, actor: id, do: 'swap', emoji: SQUISH[id] })
      moves.push({ at: hit + 0.1, actor: id, do: 'shake', amount: 0.5 + 0.3 * k, dur: 0.4 })
      fx.push({ at: hit + 0.1, kind: 'sweat', actor: id, dur: 0.6 })
    }
    // 擠進來的那個：卡住、得意（大怪獸自己也被擠瘦一點）
    if (k === 1) moves.push(...reshape(who, 1, 2, hit, 0.16))
    moves.push({ at: hit, actor: who, do: 'squash', amount: 0.18 + 0.06 * k, dur: 0.25 })
    moves.push({ at: hit + 0.15, actor: who, do: 'swap', emoji: who === 'bot' ? 'hero:bot/smug' : 'hero:monster/happy' })
    fx.push({ at: hit, kind: 'burst', x: to - 7, y: 50 - 4 * k, emoji: '💥', n: 1, dur: 0.4, scale: 1.3 + 0.4 * k })
  }
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.05 + 0.04 * k, to: { x: 58, y: 56 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  return { moves, fx, cues, camera, hit }
}

// ── 時間表 ──
const T1 = 1.6 // 小機器人走到角落口
const s1 = squeeze(T1, 'bot', ['mouse'], 0, SHAPE.bot[1].x, gy(B))
const T2 = 3.75 // 大怪獸走到角落口
const s2 = squeeze(T2, 'mon', ['mouse', 'bot'], 1, SHAPE.mon[2].x, gy(X))
const T3 = 6.55 // 小雞走到角落口（前面停一拍）
const CHICK_IN = 45 // 小雞鑽到最裡面的地方
const s3 = squeeze(T3, 'chick', ['mouse', 'bot', 'mon'], 2, CHICK_IN, gy(C), 0.5)
const POP = s3.hit
// 被擠出來：往前面地上滾成一團（落地的地方、落地的時間）
const OUT = {
  mon: { x: 96, t: POP + 0.5 },
  bot: { x: 73, t: POP + 0.6 },
  mouse: { x: 119, t: POP + 0.7 },
}
const LAUGH = POP + 1.3 // 三個一起笑、唸名字
const END = LAUGH + 2.0

/** 啵！像瓶塞一樣被擠出來：變回原來的胖瘦、往前滾一圈落在地上，頭暈 */
function popOut(id: string, delay: number): Move[] {
  const o = OUT[id as keyof typeof OUT]
  const at = POP + delay
  const dur = o.t - at
  return [
    ...reshape(id, 3, 0, at, 0.15),
    { at, actor: id, do: 'swap', emoji: SQUISH[id] },
    { at, actor: id, do: 'moveTo', to: { x: o.x, y: fy(SIZE[id]) }, arc: 7, dur, ease: 'out' },
    { at, actor: id, do: 'tilt', amount: -28, dur, pivot: 'center' },
    { at: o.t, actor: id, do: 'swap', emoji: id === 'mon' ? 'hero:monster/dizzy' : `hero:${id}/dizzy` },
  ]
}

export default scene({
  duration: Math.round(END * 10) / 10,
  bg: { top: '#F6B7C6', bottom: '#FDE3EA', floor: '#B98A66', scenery: 'room' },
  actors: [
    { id: 'window', emoji: '🪟', x: 141, y: 20, size: 15, float: true },
    { id: 'wall', emoji: '🟫', x: WALL.x, y: gy(WALL.s), size: WALL.s, tint: 'hue-rotate(-45deg) saturate(0.7) brightness(1.45)' },
    { id: 'cab', emoji: '🗄️', x: CAB.x, y: gy(CAB.s), size: CAB.s, tint: 'hue-rotate(115deg) saturate(0.75) brightness(1.05)' },
    { id: 'mouse', emoji: 'hero:mouse/smug', x: SHAPE.mouse[0].x, y: gy(M), size: M, flip: true },
    { id: 'bot', emoji: 'hero:bot/walk', x: 176, y: gy(B), size: B },
    { id: 'mon', emoji: 'hero:monster/idle', x: 190, y: gy(X), size: X },
    { id: 'chick', emoji: '🐥', x: 176, y: gy(C), size: C },
  ],
  moves: [
    // 牆、櫃子拉成細高
    { at: 0, dur: 0, actor: 'wall', do: 'stretchTo', amount: 0.36 },
    { at: 0, dur: 0, actor: 'cab', do: 'stretchTo', amount: 0.72 },
    // 開場：小老鼠一個人窩在角落，扭一扭好舒服
    { at: 0.15, actor: 'mouse', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.4, actor: 'mouse', do: 'hop', amount: 2, dur: 0.25 },
    { at: 0.75, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.4 },
    // 小機器人走過來
    { at: 0.6, actor: 'bot', do: 'moveTo', to: { x: 78, y: gy(B) }, dur: T1 - 0.6, ease: 'out' },
    { at: T1, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    ...s1.moves,
    // 大怪獸走過來
    { at: 2.65, actor: 'mon', do: 'moveTo', to: { x: 96, y: gy(X) }, dur: T2 - 2.65, ease: 'out' },
    ...s2.moves,
    // 停一拍：三個卡在角落裡……一隻小小的小雞走過來，大家屏住呼吸吸肚子
    { at: 5.0, actor: 'chick', do: 'moveTo', to: { x: 92, y: gy(C) }, dur: T3 - 5.0, ease: 'out' },
    { at: 5.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/wait' },
    { at: 5.9, actor: 'bot', do: 'swap', emoji: 'hero:bot/wait' },
    { at: 5.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    ...reshape('mouse', 2, 3, T3, 0.4, 'inOut'),
    ...reshape('bot', 2, 3, T3, 0.4, 'inOut'),
    ...reshape('mon', 2, 3, T3, 0.4, 'inOut'),
    { at: T3, actor: 'mouse', do: 'moveTo', to: { x: SHAPE.mouse[3].x, y: gy(M) }, dur: 0.4 },
    { at: T3, actor: 'bot', do: 'moveTo', to: { x: SHAPE.bot[3].x, y: gy(B) }, dur: 0.4 },
    { at: T3, actor: 'mon', do: 'moveTo', to: { x: SHAPE.mon[3].x, y: gy(X) }, dur: 0.4 },
    { at: T3 + 0.3, actor: 'mouse', do: 'shake', amount: 0.4, dur: 0.8 },
    { at: T3 + 0.3, actor: 'bot', do: 'shake', amount: 0.4, dur: 0.8 },
    { at: T3 + 0.3, actor: 'mon', do: 'shake', amount: 0.4, dur: 0.8 },
    ...s3.moves,
    // 反轉：小雞一鑽到最裡面——啵！三個像瓶塞一樣全被擠出來，往前滾到地上
    ...popOut('mon', 0),
    ...popOut('bot', 0.04),
    ...popOut('mouse', 0.08),
    // 小雞一個人坐在角落，得意地蹦一下
    { at: POP + 0.3, actor: 'chick', do: 'flip' },
    { at: POP + 0.5, actor: 'chick', do: 'hop', amount: 3, dur: 0.3 },
    { at: POP + 0.85, actor: 'chick', do: 'squash', amount: 0.2, dur: 0.3 },
    // 三個擠成一團、回頭看小雞，哈哈大笑
    { at: LAUGH, actor: 'bot', do: 'flip' },
    { at: LAUGH, actor: 'mon', do: 'flip' },
    { at: LAUGH, actor: 'mouse', do: 'flip' },
    { at: LAUGH, actor: 'bot', do: 'swap', emoji: 'hero:bot/laugh' },
    { at: LAUGH, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: LAUGH, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    { at: LAUGH + 0.05, actor: 'mon', do: 'hop', amount: 2, dur: 0.3 },
    { at: LAUGH + 0.1, actor: 'bot', do: 'hop', amount: 3, dur: 0.3 },
    { at: LAUGH + 0.15, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    { at: LAUGH + 0.2, actor: 'chick', do: 'hop', amount: 3, dur: 0.3 },
    { at: LAUGH + 0.7, actor: 'bot', do: 'tilt', amount: 8, dur: 0.5 },
    { at: LAUGH + 0.7, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.5 },
  ],
  fx: [
    ...s1.fx,
    ...s2.fx,
    // 屏住呼吸：冒汗
    { at: T3 + 0.1, kind: 'sweat', actor: 'mon', dur: 0.8 },
    { at: T3 + 0.2, kind: 'sweat', actor: 'bot', dur: 0.7 },
    ...s3.fx,
    // 啵！
    { at: POP, kind: 'burst', x: 50, y: 64, emoji: '💥', n: 1, dur: 0.4, scale: 1.8 },
    { at: POP, kind: 'burst', x: 52, y: 64, emoji: '💫', n: 6, dur: 0.6, scale: 1.3 },
    { at: OUT.bot.t, kind: 'puff', actor: 'bot', n: 8, dur: 0.5 },
    { at: OUT.mon.t, kind: 'dizzy', actor: 'mon', dur: LAUGH - OUT.mon.t },
    // 亮相
    { at: LAUGH, kind: 'burst', x: 90, y: 46, emoji: '✨', n: 10, dy: -12, dur: 0.9, scale: 1.4 },
    { at: LAUGH + 0.4, kind: 'burst', x: 90, y: 46, emoji: '🎉', n: 7, dy: -12, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: Z, to: MAIN },
    ...s1.camera,
    ...s2.camera,
    // 停一拍：推近角落口，看小雞跟擠成細條的三個
    { at: 5.4, dur: 1.0, do: 'zoom', amount: 1.75, to: look(68, 55, 1.75) },
    // 啵：退開，看他們滾出來
    { at: POP, dur: 0.5, do: 'shake', amount: 1.8 },
    { at: POP, dur: 0.45, do: 'zoom', amount: 1.45, to: look(78, 52, 1.45) },
    // 亮相：一團小夥伴＋角落裡的小雞
    { at: LAUGH - 0.2, dur: 0.5, do: 'zoom', amount: 1.42, to: look(78, 52, 1.42) },
  ],
  lights: [
    { at: POP, dur: 0.05, level: -0.25 },
    { at: POP + 0.05, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.4, sfx: 'boing' },
    ...s1.cues,
    ...s2.cues,
    { at: T3 + 0.05, sfx: 'gulp' },
    ...s3.cues,
    { at: POP + 0.03, sfx: 'boing' },
    { at: OUT.mon.t, sfx: 'bonk' },
    { at: OUT.mouse.t, sfx: 'plop' },
    { at: LAUGH, sfx: 'cheer' },
    { at: LAUGH + 0.15, say: '角落小夥伴' },
  ],
})
