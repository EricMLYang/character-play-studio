// 演的是字面意思：小＋火＋龍——一條小小的龍，噴出來的火都小小的，連一根蠟燭都點不著；最後打一個嗝，噴出一大道火（不是尾巴有火的橘色蜥蜴）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小龍對著熊貓生日蛋糕上的蠟燭用力噴火，噴出來的都只是一顆小小的火星，「噗」一聲就熄了。
// 同一個憋氣（皺眉鼓起來）、同一個張嘴噴、同一聲「噗」，三次只有火星飛得越來越遠：
// 第一次一出嘴巴就熄、第二次飛到一半掉地上、第三次先停一拍（憋到發抖、熊貓湊過來看）——火星真的落到燭芯上，抖兩下……噗，熄了。
// 小龍洩氣坐在地上。反轉：他沒在噴，只是打了一個嗝——轟！一大道火把蠟燭點亮、整片樹林亮起來，自己被後座力往後推。
// 亮相：「小火龍」。
const S = 30 // 小龍的 size（圖朝左，正好面對蛋糕）
const R = 77 - 0.42 * S
const DX = 108 // 小龍每次都站在這裡噴
const MOUTH = { x: DX - 7, y: 61 } // 張嘴噴的那一刻，火星從這裡出來
const PANDA = { x: 40, y: 77 - 0.42 * 32 }
const CAKE = { x: 72, y: 77 - 0.42 * 24 }
const CANDLE = { x: 72, y: 52.5 } // 蠟燭（🕯️，float 站在蛋糕上）
const WICK = { x: 72, y: 49.5 } // 燭芯：火星要落到這裡
/** 沒點：切掉上面那截火苗，只剩蠟燭和燭芯 */
const UNLIT = 0.33
/** 天黑的樹林 */
const DARK = 0.4
/** 傻眼停多久 */
const HOLD = 0.5

/**
 * 主軸笑點：皺眉憋氣鼓起來 → 張嘴噴 → 一顆小火星飛出去 → 「噗」熄了、傻眼。
 * k 是第幾次（0、1、2）：憋得越久、鼓得越大，火星飛得越遠（嘴邊 → 半路 → 燭芯上）。at 是張嘴噴的那一刻。
 */
function huff(at: number, k: number) {
  const inhale = [0.45, 0.5, 1.0][k]
  const swell = [1.08, 1.14, 1.22][k]
  // 火星熄掉的地方，一次比一次靠近蠟燭
  const land = [{ x: MOUTH.x - 8, y: MOUTH.y + 1 }, { x: 88, y: 73 }, WICK][k]
  const fly = [0.3, 0.45, 0.55][k]
  // 第三次落到燭芯上，抖兩下才熄（期待一下）
  const flicker = k === 2 ? 0.6 : 0
  const out = at + fly + flicker
  const moves: Move[] = [
    // 憋氣：皺眉、拉長、鼓起來
    { at: at - inhale, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: at - inhale, actor: 'dino', do: 'scaleTo', amount: swell, dur: inhale * 0.8, ease: 'out' },
    { at: at - inhale, actor: 'dino', do: 'squash', amount: -0.12 - 0.03 * k, dur: inhale },
    // 張嘴噴
    { at, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at, actor: 'dino', do: 'scaleTo', amount: 1 / swell, dur: 0.15, ease: 'out' },
    { at, actor: 'dino', do: 'moveTo', to: { x: DX - 3, y: R }, dur: 0.12, ease: 'out' },
    // 小火星飛出去
    { at, actor: 'spark', do: 'moveTo', to: MOUTH, dur: 0.01 },
    { at, actor: 'spark', do: 'pop', dur: 0.08 },
    { at: at + 0.02, actor: 'spark', do: 'moveTo', to: land, arc: k === 1 ? 6 : k === 2 ? 5 : 0, dur: fly, ease: k === 1 ? 'in' : 'out' },
    // 噗，熄了
    { at: out, actor: 'spark', do: 'vanish', dur: 0.12 },
    // 傻眼
    { at: out, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: out, actor: 'dino', do: 'moveTo', to: { x: DX, y: R }, dur: 0.2, ease: 'out' },
  ]
  if (k === 2) moves.push({ at: at + fly, actor: 'spark', do: 'shake', amount: 0.6, dur: flicker })
  const fx: Fx[] = [
    { at: out, kind: 'puff', x: land.x, y: land.y + (k === 1 ? 2 : 0), n: 4 + 2 * k, dur: 0.6, scale: 1.1 + 0.15 * k },
    { at: out, kind: 'burst', x: land.x, y: land.y - 3, emoji: 'prop:smoke', n: 1, dur: 0.6, scale: 0.55 + 0.15 * k },
  ]
  if (k >= 1) fx.push({ at: out + 0.1, kind: 'sweat', actor: 'dino', dur: 0.6 })
  const camera: Camera[] = [{ at: out, dur: 0.35, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: land.x, y: land.y } }]
  // 同一組音效：吸氣、咻、噗
  const cues: Cue[] = [{ at: at - inhale, sfx: 'gulp' }, { at, sfx: 'whoosh' }, { at: out, sfx: 'poof' }]
  if (k === 2) cues.push({ at: at + fly, sfx: 'blip' }, { at: at + fly + 0.3, sfx: 'blip' }, { at: out + 0.15, sfx: 'deflate' })
  return { moves, fx, camera, cues, end: out + HOLD }
}

const A1 = 1.45, A2 = 2.95, A3 = 5.15
const h1 = huff(A1, 0)
const h2 = huff(A2, 1)
const h3 = huff(A3, 2)
// 反轉：洩氣坐著，打嗝——第一下小小的，第二下轟！
const SIT = h3.end - 0.25
const HIC1 = SIT + 0.6
const BOOM = HIC1 + 0.55
const LIT = BOOM + 0.22
const POSE = BOOM + 0.95

export default scene({
  duration: Math.round((POSE + 1.9) * 10) / 10,
  bg: { top: '#1C2B45', bottom: '#3D5A6E', floor: '#3B5A3A', scenery: 'forest' },
  actors: [
    { id: 'panda', emoji: 'prop:panda', x: PANDA.x, y: PANDA.y, size: 32 },
    { id: 'cake', emoji: 'prop:cake', x: CAKE.x, y: CAKE.y, size: 24 },
    { id: 'candle', emoji: '🕯️', x: CANDLE.x, y: CANDLE.y, size: 18, float: true, half: 'bottom', cut: UNLIT },
    { id: 'spark', emoji: '🔥', x: MOUTH.x, y: MOUTH.y, size: 8, float: true, hidden: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: DX, y: R, size: S },
  ],
  moves: [
    // 開場：熊貓抱著生日蛋糕等著，小龍跳進來拍胸脯「我來點！」
    { at: 0.05, actor: 'dino', do: 'enter', from: { x: 178, y: R }, dur: 0.6, ease: 'out' },
    { at: 0.2, actor: 'panda', do: 'swap', emoji: 'prop:panda-wave' },
    { at: 0.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 0.75, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.9, actor: 'panda', do: 'swap', emoji: 'prop:panda' },
    // 第一次：火星一出嘴巴就熄了
    ...h1.moves,
    { at: h1.end, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: h1.end - 0.3, actor: 'panda', do: 'tilt', amount: 8, dur: 0.4 },
    // 第二次：飛到一半掉在地上熄了
    ...h2.moves,
    { at: h2.end - 0.3, actor: 'panda', do: 'tilt', amount: -10, dur: 0.4 },
    // 第三次前停一拍：熊貓湊過去看，小龍憋到發抖（憋氣寫在 huff 裡，這裡加抖）
    { at: A3 - 1.0, actor: 'panda', do: 'moveTo', to: { x: PANDA.x + 6, y: PANDA.y }, dur: 0.5, ease: 'out' },
    { at: A3 - 0.7, actor: 'dino', do: 'shake', amount: 0.7, dur: 0.6 },
    ...h3.moves,
    // 洩氣：一屁股坐下
    { at: SIT, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: SIT + 0.1, actor: 'panda', do: 'moveTo', to: PANDA, dur: 0.4, ease: 'inOut' },
    { at: SIT + 0.1, actor: 'dino', do: 'tilt', amount: -8, dur: 0.5 },
    // 嗝（小小的）
    { at: HIC1, actor: 'dino', do: 'hop', amount: 5, dur: 0.25 },
    { at: HIC1 + 0.15, actor: 'panda', do: 'tilt', amount: 10, dur: 0.4 },
    // 嗝——轟！大火
    { at: BOOM - 0.08, actor: 'dino', do: 'squash', amount: -0.2, dur: 0.08 },
    { at: BOOM, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: BOOM, actor: 'dino', do: 'moveTo', to: { x: DX + 10, y: R }, dur: 0.35, ease: 'out' },
    { at: BOOM, actor: 'dino', do: 'tilt', amount: 10, dur: 0.5 },
    // 蠟燭點著了
    { at: LIT, actor: 'candle', do: 'swap', half: 'whole' },
    { at: LIT, actor: 'candle', do: 'scaleTo', amount: 1.25, dur: 0.35, ease: 'elastic' },
    { at: LIT, actor: 'panda', do: 'swap', emoji: 'prop:panda-daze' },
    { at: LIT, actor: 'panda', do: 'hop', amount: 4, dur: 0.3 },
    // 亮相：小龍跳起來、挺胸
    { at: POSE, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: POSE, actor: 'dino', do: 'moveTo', to: { x: DX + 2, y: R }, dur: 0.3, ease: 'out' },
    { at: POSE, actor: 'dino', do: 'scaleTo', amount: 1.25, dur: 0.35, ease: 'back' },
    { at: POSE + 0.25, actor: 'panda', do: 'swap', emoji: 'prop:panda-wave' },
  ],
  fx: [
    { at: 0.75, kind: 'puff', actor: 'dino', n: 4, dur: 0.4 },
    ...h1.fx,
    ...h2.fx,
    ...h3.fx,
    { at: SIT, kind: 'puff', actor: 'dino', n: 6, dur: 0.6 },
    { at: HIC1, kind: 'burst', actor: 'dino', emoji: 'prop:smoke', n: 1, dx: -9, dy: 8, dur: 0.45, scale: 0.5 },
    // 一大道火從嘴巴衝到蠟燭
    { at: BOOM, kind: 'blow', actor: 'dino', emoji: '🔥', dx: -7, dy: 9, to: { x: WICK.x + 5, y: WICK.y }, n: 9, dur: 0.6, scale: 1.5 },
    { at: BOOM, kind: 'burst', actor: 'dino', emoji: '💥', n: 1, dx: -8, dy: 8, dur: 0.35, scale: 1.6 },
    { at: LIT, kind: 'burst', x: WICK.x, y: WICK.y - 3, emoji: '✨', n: 8, dur: 0.7, scale: 1.3 },
    { at: BOOM + 0.1, kind: 'puff', actor: 'dino', n: 6, dur: 0.6 },
    { at: POSE, kind: 'burst', actor: 'dino', emoji: '⭐', n: 9, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.5, kind: 'burst', actor: 'dino', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：熊貓、蛋糕、小龍都在畫面裡，小龍夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.35, to: { x: 76, y: 56 } },
    ...h1.camera,
    ...h2.camera,
    // 停一拍：慢慢推近蠟燭和小龍
    { at: A3 - 1.0, dur: 0.8, do: 'zoom', amount: 1.6, to: { x: 86, y: 54 } },
    ...h3.camera,
    { at: SIT, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 76, y: 56 } },
    // 轟
    { at: BOOM, dur: 0.5, do: 'shake', amount: 1.8 },
    { at: BOOM, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 84, y: 56 } },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 84, y: 54 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: DARK },
    // 轟：一閃，整片樹林亮起來
    { at: BOOM, dur: 0.05, level: -0.45 },
    { at: BOOM + 0.05, dur: 0.6, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'tap' },
    { at: 0.75, sfx: 'boing' },
    ...h1.cues,
    ...h2.cues,
    ...h3.cues,
    { at: SIT, sfx: 'plop' },
    { at: HIC1, sfx: 'hic' },
    { at: BOOM - 0.05, sfx: 'hic' },
    { at: BOOM, sfx: 'whoosh' },
    { at: BOOM + 0.05, sfx: 'rumble' },
    { at: LIT, sfx: 'clink' },
    { at: POSE + 0.15, say: '小火龍' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
