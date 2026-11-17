// 演的是字面意思：毛毛＋蟲——一隻毛毛的小蟲，一伸一縮地爬，爬過誰的腳，身上的毛就把誰搔得哈哈大笑（不演吃水果、肚子痛、結繭、變蝴蝶）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：毛毛蟲爬過誰的腳，誰就被牠的毛搔得哈哈大笑——一個比一個笑得大。
// 同一個動作（抬起頭、扭一扭）、同一聲「嘰嘰—咚」，只有結果越來越大：兔子女孩摀嘴偷笑 → 大象笑到一屁股坐倒、地都在震 →
// 先停一拍（毛毛蟲轉回頭又朝兔子爬過去，兔子伸手「等一下！」），反轉：兔子拿出一根大羽毛搔牠——這次換毛毛蟲笑到打滾，
// 全身的毛都笑蓬了、變成一大隻。三個一起笑：「毛毛蟲」。
const S = 34 // 毛毛蟲
const G = 77 - 0.42 * S
const BX = 58 // 兔子女孩站的地方
const BS = 34
const BG = 77 - 0.42 * BS
const EX = 116 // 大象
const ES = 54
const EG = 77 - 0.42 * ES
/** 毛毛蟲搔兔子、搔大象時站的地方（頭剛好壓在腳上） */
const AT_B = 36
const AT_E = 92
/** 第三次：轉回頭爬到這裡，被羽毛搔 */
const AT_3 = 84
/** 每一伸一縮爬多遠 */
const STEP = 13
/** 被搔以後笑著停多久 */
const HOLD = 0.6

/** 一伸一縮爬一步：先縮成一團（拱起來），再往前伸長。at 開始縮、to 伸到哪裡 */
function inch(at: number, to: number): Move[] {
  return [
    { at, actor: 'bug', do: 'stretchTo', amount: 0.8, dur: 0.16, ease: 'out' },
    { at: at + 0.16, actor: 'bug', do: 'moveTo', to: { x: to, y: G }, dur: 0.2, ease: 'out' },
    { at: at + 0.16, actor: 'bug', do: 'stretchTo', amount: 1 / 0.8, dur: 0.2, ease: 'back' },
  ]
}

/** 從 from 一步一步爬到 to，每步 gap 秒；回傳 moves 與爬完的時間 */
function crawl(at: number, from: number, to: number, gap = 0.42, steps = 0) {
  const n = steps || Math.max(1, Math.round(Math.abs(to - from) / STEP))
  const moves: Move[] = []
  for (let i = 1; i <= n; i++) moves.push(...inch(at + (i - 1) * gap, from + ((to - from) * i) / n))
  return { moves, end: at + (n - 1) * gap + 0.36 }
}

/**
 * 主軸笑點：毛毛蟲抬起頭（預備）→ 壓在對方腳上「扭一扭」（毛在搔）→ 對方笑出來。
 * at 是扭的那一刻、k 是第幾次（0 兔子、1 大象），x 是毛毛蟲站的地方。回傳 end＝笑完停住的時間。
 */
function tickle(at: number, k: number, x: number) {
  const moves: Move[] = [
    // 預備：抬起頭、往上拱一下
    { at: at - 0.35, actor: 'bug', do: 'tilt', amount: -14, dur: 0.35 },
    { at: at - 0.35, actor: 'bug', do: 'squash', amount: -0.15, dur: 0.35 },
    // 扭一扭（毛在搔）
    { at, actor: 'bug', do: 'shake', amount: 1.4, dur: 0.5 },
  ]
  const fx: Fx[] = [{ at, kind: 'burst', x: x + 13, y: 71, emoji: '✨', n: 4 + 2 * k, dur: 0.5, scale: 1.1 + 0.2 * k }]
  const camera: Camera[] = []
  // 同一個音效：嘰嘰（搔）＋咚（笑出來），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'blip' }, { at: at + 0.15, sfx: 'blip' }]
  const hit = at + 0.2
  if (k === 0) {
    moves.push(
      { at: hit, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/giggle' },
      { at: hit, actor: 'bunny', do: 'hop', amount: 3, dur: 0.3 },
      { at: hit + 0.3, actor: 'bunny', do: 'shake', amount: 0.6, dur: HOLD },
    )
    camera.push({ at: hit, dur: 0.45, do: 'punch', amount: 0.08, to: { x: BX - 4, y: 58 } })
    cues.push({ at: hit, sfx: 'boing' })
  } else {
    // 大象笑到一屁股坐倒：地在震，兔子跟毛毛蟲都被彈起來
    moves.push(
      { at: hit - 0.1, actor: 'ele', do: 'squash', amount: -0.12, dur: 0.15 },
      { at: hit, actor: 'ele', do: 'swap', emoji: 'prop:elephant-laugh' },
      { at: hit, actor: 'ele', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: hit + 0.3, actor: 'ele', do: 'shake', amount: 1, dur: HOLD + 0.3 },
      { at: hit + 0.05, actor: 'bug', do: 'hop', amount: 5, dur: 0.35 },
      { at: hit + 0.05, actor: 'bunny', do: 'hop', amount: 5, dur: 0.35 },
      { at: hit + 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/laugh' },
    )
    fx.push(
      { at: hit, kind: 'burst', x: EX - 4, y: 70, emoji: '💥', n: 1, dur: 0.4, scale: 1.8 },
      { at: hit + 0.05, kind: 'puff', x: EX, y: 75, n: 12, dur: 0.6 },
    )
    camera.push(
      { at: hit, dur: 0.45, do: 'punch', amount: 0.14, to: { x: EX - 8, y: 56 } },
      { at: hit, dur: 0.45, do: 'shake', amount: 1.6 },
    )
    cues.push({ at: hit, sfx: 'boing' }, { at: hit + 0.05, sfx: 'bonk' }, { at: hit + 0.1, sfx: 'rumble' })
  }
  return { moves, fx, camera, cues, end: hit + HOLD }
}

// 出場：從左邊一伸一縮爬過來
const c1 = crawl(0.15, 6, AT_B, 0.42, 3)
const T1 = c1.end + 0.45
const t1 = tickle(T1, 0, AT_B)
// 繼續往大象爬（兔子還在偷笑）
const c2 = crawl(t1.end - 0.1, AT_B, AT_E, 0.38)
const T2 = c2.end + 0.4
const t2 = tickle(T2, 1, AT_E)
// 停一拍：轉回頭，又朝兔子爬過去；兔子伸手「等一下！」
const TURN = t2.end + 0.05
const c3 = crawl(TURN + 0.2, AT_E, AT_3, 0.38)
const STOP = c3.end + 0.05
const REAR = STOP + 0.45 // 毛毛蟲抬頭要扭（跟前兩次一樣的預備）
// 反轉：兔子拿出羽毛搔牠
const FEATHER = REAR + 0.3
const LAUGH = FEATHER + 0.35 // 毛毛蟲笑出來
const ROLL = LAUGH + 0.55 // 笑到打滾
const POOF = ROLL + 0.6 // 毛笑蓬了
const FX0 = { x: AT_3 - 11, y: 60 } // 羽毛搔的地方（毛毛蟲的肚子前面）

export default scene({
  duration: POOF + 2.0,
  bg: { top: '#FFD9E6', bottom: '#FFF4E2', floor: '#9DCB70', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 14, y: 77 - 0.42 * 52, size: 52 },
    { id: 'flower', emoji: '🌼', x: 146, y: 77 - 0.42 * 10, size: 10 },
    { id: 'ele', emoji: 'prop:elephant', x: EX, y: EG, size: ES },
    { id: 'bunny', emoji: 'hero:bunny/idle', x: BX, y: BG, size: BS },
    { id: 'feather', emoji: 'prop:feather', x: BX + 8, y: 54, size: 16, hidden: true, float: true },
    { id: 'bug', emoji: 'prop:caterpillar', x: 6, y: G, size: S, flip: true },
  ],
  moves: [
    ...c1.moves,
    // 兔子低頭看：咦，誰爬過來了？
    { at: 1.0, actor: 'bunny', do: 'tilt', amount: -8, dur: 0.5 },
    // 第一次：兔子摀嘴偷笑
    ...t1.moves,
    { at: t1.end, actor: 'bug', do: 'hop', amount: 2, dur: 0.2 },
    ...c2.moves,
    // 第二次：大象笑到坐倒
    ...t2.moves,
    // 停一拍：毛毛蟲轉回頭，朝兔子爬過去
    { at: TURN, actor: 'bug', do: 'flip' },
    { at: TURN, actor: 'bug', do: 'squash', amount: 0.2, dur: 0.2 },
    ...c3.moves,
    { at: c3.end - 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/wait' },
    { at: c3.end - 0.3, actor: 'bunny', do: 'flip' },
    { at: REAR, actor: 'bug', do: 'tilt', amount: 14, dur: 0.35 },
    { at: REAR, actor: 'bug', do: 'squash', amount: -0.15, dur: 0.35 },
    // 反轉：兔子拿出大羽毛，搔毛毛蟲
    { at: FEATHER - 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/reach' },
    { at: FEATHER - 0.1, actor: 'feather', do: 'pop', dur: 0.15 },
    { at: FEATHER, actor: 'feather', do: 'moveTo', to: FX0, dur: 0.2, ease: 'out' },
    { at: FEATHER + 0.2, actor: 'feather', do: 'shake', amount: 1.6, dur: ROLL - FEATHER },
    { at: FEATHER + 0.2, actor: 'feather', do: 'tilt', amount: 18, dur: ROLL - FEATHER },
    // 毛毛蟲笑出來，越扭越厲害
    { at: LAUGH, actor: 'bug', do: 'shake', amount: 2.2, dur: 0.55 },
    { at: LAUGH, actor: 'bug', do: 'squash', amount: 0.2, dur: 0.55 },
    // 笑到打滾
    { at: ROLL, actor: 'feather', do: 'moveTo', to: { x: BX + 10, y: 52 }, dur: 0.25, ease: 'out' },
    { at: ROLL, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/giggle' },
    { at: ROLL, actor: 'bug', do: 'hop', amount: 8, dur: 0.6 },
    { at: ROLL, actor: 'bug', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
    { at: ROLL, actor: 'bug', do: 'moveTo', to: { x: AT_3 + 4, y: G }, dur: 0.6 },
    // 毛笑蓬了：變成一大隻
    { at: POOF, actor: 'bug', do: 'scaleTo', amount: 1.35, dur: 0.4, ease: 'elastic' },
    { at: POOF, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/laugh' },
    { at: POOF + 0.3, actor: 'ele', do: 'hop', amount: 2, dur: 0.3 },
    { at: POOF + 0.45, actor: 'bug', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: POOF + 0.5, actor: 'feather', do: 'vanish', dur: 0.2 },
  ],
  fx: [
    ...t1.fx,
    ...t2.fx,
    { at: c3.end - 0.25, kind: 'sweat', actor: 'bunny', dur: 0.8 },
    // 羽毛搔、毛毛蟲笑
    { at: FEATHER + 0.2, kind: 'burst', x: FX0.x + 6, y: 68, emoji: '✨', n: 8, dur: 0.6, scale: 1.4 },
    { at: ROLL + 0.1, kind: 'burst', actor: 'bug', emoji: '💫', n: 5, dur: 0.6, scale: 1.3 },
    { at: POOF, kind: 'puff', actor: 'bug', n: 12, dur: 0.6 },
    { at: POOF, kind: 'burst', actor: 'bug', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POOF + 0.35, kind: 'burst', actor: 'bug', emoji: '🎉', n: 8, dur: 1.0, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：三個都在畫面裡、夠大
    { at: -1, dur: 0.01, do: 'zoom', amount: 1.4, to: { x: 80, y: 52 } },
    ...t1.camera,
    ...t2.camera,
    // 停一拍：慢慢推近兔子和毛毛蟲
    { at: STOP - 0.3, dur: 0.8, do: 'zoom', amount: 1.5, to: { x: 70, y: 56 } },
    { at: LAUGH, dur: 0.4, do: 'punch', amount: 0.1, to: { x: AT_3, y: 62 } },
    { at: LAUGH, dur: 0.35, do: 'shake', amount: 1 },
    // 亮相
    { at: POOF, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: POOF, dur: 0.5, do: 'zoom', amount: 1.6, to: { x: 84, y: 56 } },
  ],
  lights: [
    { at: POOF, dur: 0.05, level: -0.25 },
    { at: POOF + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    ...c1.moves.filter((m) => m.do === 'moveTo').map((m): Cue => ({ at: m.at, sfx: 'tap' })),
    ...t1.cues,
    ...t2.cues,
    { at: c3.end - 0.3, sfx: 'blip' },
    { at: FEATHER - 0.1, sfx: 'poof' },
    { at: FEATHER + 0.2, sfx: 'blip' },
    { at: FEATHER + 0.35, sfx: 'blip' },
    { at: LAUGH, sfx: 'boing' },
    { at: ROLL, sfx: 'whoosh' },
    { at: POOF, sfx: 'poof' },
    { at: POOF + 0.05, sfx: 'boing' },
    { at: POOF + 0.3, say: '毛毛蟲' },
    { at: POOF + 0.6, sfx: 'cheer' },
  ],
})
