// 演的是字面意思：龍＋貓——一條龍睡在地上，一隻小貓把龍的尾巴當逗貓棒撲（沒有灰色大肚子、葉子傘、貓巴士、公車站）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小貓撲龍的尾巴，尾巴每次都「咻」一下甩開，小貓撲空摔一跤——一次比一次摔得慘。
// 同一個預備（屁股扭一扭）、同一種撲法、同一聲「咻＋咚」，三次只有結果變大：臉朝下趴著 → 彈起來滾回原地 →
// 先停一拍（尾巴慢慢左右晃、小貓的頭跟著晃）撲最高，摔到彈上天、四腳朝天轉回原地。
// 反轉是第四次：一樣扭屁股，尾巴又先甩開——這次小貓根本沒跳（假動作），尾巴一放回來就撲上去，抓到了！
// 龍嚇醒跳起來，小貓抱著尾巴爬上龍頭，一起亮相：「龍貓」。
const D = 46 // 龍的 size（翻面：頭在右上、尾巴在左下）
const DG = 77 - 0.42 * D
const DX = 112
const C = 26 // 小貓的 size
const CG = 77 - 0.42 * C
const HOME = 46 // 小貓每次都從這裡撲
const TAIL = 80 // 撲到尾巴時小貓站的地方（前腳剛好碰到尾巴尖）
const TAIL_FX = { x: 98, y: 68 } // 尾巴根（甩尾巴那道弧的中心）
const GREEN = '#2FB37A'
/** 撲空摔下去以後傻眼停多久 */
const HOLD = 0.45
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 預備：小貓壓低、屁股扭一扭（每一次都一樣，第三次扭比較久）。a 是開始扭的時間 */
function windup(a: number, dur = 0.45): Move[] {
  return [
    { at: a, actor: 'cat', do: 'squash', amount: 0.22, dur: dur + 0.1 },
    { at: a + 0.05, actor: 'cat', do: 'shake', amount: 0.7, dur },
  ]
}

/** 尾巴「咻」一下甩開：龍的身體往右一縮、彈一下，一道龍身顏色的弧從尾巴掃上去。f 是甩的那一刻 */
function flick(f: number) {
  const moves: Move[] = [
    { at: f, actor: 'dragon', do: 'tilt', amount: 7, dur: 0.35 },
    { at: f, actor: 'dragon', do: 'hop', amount: 2, dur: 0.25 },
  ]
  const fx: Fx[] = [
    { at: f - 0.05, kind: 'swoosh', ...TAIL_FX, to: { x: DX + 20, y: 30 }, n: 12, dur: 0.4, color: GREEN, width: 5.5 },
  ]
  const cues: Cue[] = [{ at: f, sfx: 'whoosh' }]
  return { moves, fx, cues }
}

/**
 * 主軸笑點：扭屁股 → 撲 → 尾巴甩開 → 撲空「咚」摔在地上。k 是第幾次（0、1、2），越後面撲越高、摔越重、彈越遠。
 * p 是小貓落地（撲空）那一刻；回傳 end＝傻眼停完的時間。
 */
function pounce(p: number, k: number, wiggle = 0.45) {
  const fl = flick(p - 0.15)
  const moves: Move[] = [
    ...windup(p - 0.35 - wiggle - 0.05, wiggle),
    { at: p - 0.32, actor: 'cat', do: 'moveTo', to: { x: TAIL, y: CG }, arc: 9 + 5 * k, dur: 0.32, ease: 'out' },
    { at: p - 0.32, actor: 'cat', do: 'rotateTo', amount: 15, dur: 0.16 },
    ...fl.moves,
    // 咚！臉朝下趴扁
    { at: p, actor: 'cat', do: 'rotateTo', amount: -15, dur: 0.06 },
    { at: p, actor: 'cat', do: 'squash', amount: 0.45 + 0.05 * k, dur: HOLD },
  ]
  const fx: Fx[] = [
    ...fl.fx,
    { at: p, kind: 'burst', x: TAIL + 8, y: 72, n: 1, dur: 0.4, scale: 1.3 + 0.4 * k },
    { at: p, kind: 'puff', actor: 'cat', n: 5 + 3 * k, dur: 0.5 },
  ]
  if (k >= 1) fx.push({ at: p + 0.05, kind: 'burst', x: TAIL + 4, y: 60, emoji: '⭐', n: 3 + 2 * k, dur: 0.5, scale: 1 + 0.2 * k })
  const camera: Camera[] = [
    { at: p, dur: 0.4, do: 'punch', amount: 0.07 + 0.05 * k, to: { x: TAIL + 6, y: 66 } },
    { at: p, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一聲咻＋咚，一次比一次多疊一個
  const cues: Cue[] = [...fl.cues, { at: p, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: p + 0.05, sfx: 'boing' })
  if (k >= 2) cues.push({ at: p + 0.1, sfx: 'crack' })
  return { moves, fx, camera, cues, end: p + HOLD }
}

const P1 = 1.9, P2 = 3.85, P3 = 6.75
const s1 = pounce(P1, 0)
const s2 = pounce(P2, 1)
const s3 = pounce(P3, 2, 0.8)
// 反轉（第四次）：一樣扭屁股，尾巴先甩開——小貓沒跳；尾巴放回來那一刻才撲上去，抓到了
const W4 = 8.35 // 開始扭
const F4 = W4 + 0.45 // 尾巴先甩
const J4 = F4 + 0.5 // 尾巴放回來、小貓撲
const CATCH = J4 + 0.3
const f4 = flick(F4)
const WAKE = CATCH + 0.2
const HEAD = { x: DX - 16, y: CG - 8 } // 龍盤起來的背上（小貓爬上去坐的地方，不擋龍的臉）
const POSE = WAKE + 0.75

export default scene({
  duration: 11.8,
  bg: { top: '#4E3F78', bottom: '#9A82C2', floor: '#C9925E', scenery: 'room' },
  actors: [
    { id: 'sofa', emoji: '🛋️', x: 14, y: 77 - 0.42 * 26, size: 26 },
    { id: 'plant', emoji: '🪴', x: 148, y: 77 - 0.42 * 18, size: 18 },
    { id: 'dragon', emoji: '🐉', x: DX, y: DG, size: D, flip: true },
    { id: 'cat', emoji: '🐈', x: HOME, y: CG, size: C, flip: true },
  ],
  moves: [
    // 開場：尾巴抖一下——小貓的耳朵豎起來，往前探
    { at: 0.25, actor: 'dragon', do: 'tilt', amount: 4, dur: 0.3 },
    { at: 0.35, actor: 'cat', do: 'hop', amount: 3, dur: 0.25 },
    { at: 0.65, actor: 'cat', do: 'tilt', amount: -8, dur: 0.4 },
    // 第一次：撲空，臉朝下趴著；爬起來走回去
    ...s1.moves,
    { at: s1.end + 0.1, actor: 'cat', do: 'moveTo', to: { x: HOME, y: CG }, dur: 0.5, ease: 'inOut' },
    // 第二次：撲空，彈起來翻一圈滾回原地
    ...s2.moves,
    { at: s2.end, actor: 'cat', do: 'moveTo', to: { x: HOME, y: CG }, arc: 6, dur: 0.45, ease: 'out' },
    { at: s2.end, actor: 'cat', do: 'spin', times: -1, dur: 0.45, pivot: 'center' },
    // 第三次前停一拍：尾巴慢慢左右晃，小貓的頭跟著晃
    { at: 4.9, actor: 'dragon', do: 'tilt', amount: 5, dur: 0.45 },
    { at: 4.9, actor: 'cat', do: 'tilt', amount: -12, dur: 0.45 },
    { at: 5.35, actor: 'dragon', do: 'tilt', amount: -4, dur: 0.45 },
    { at: 5.35, actor: 'cat', do: 'tilt', amount: 10, dur: 0.45 },
    // 第三次：撲最高、摔最重，彈上天、四腳朝天轉回原地
    ...s3.moves,
    { at: s3.end, actor: 'cat', do: 'moveTo', to: { x: HOME, y: CG }, arc: 14, dur: 0.6, ease: 'out' },
    { at: s3.end, actor: 'cat', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
    { at: s3.end + 0.6, actor: 'cat', do: 'squash', amount: 0.5, dur: 0.55 },
    // 反轉：一樣扭屁股——尾巴先甩開，小貓沒跳，等著……
    ...windup(W4, 0.4),
    ...f4.moves,
    { at: F4 + 0.1, actor: 'cat', do: 'tilt', amount: -6, dur: 0.3 },
    // 尾巴放回來那一刻，撲！抓到了
    { at: J4, actor: 'cat', do: 'moveTo', to: { x: TAIL + 4, y: CG - 4 }, arc: 8, dur: 0.3, ease: 'out' },
    { at: J4, actor: 'cat', do: 'rotateTo', amount: 15, dur: 0.15 },
    { at: CATCH, actor: 'cat', do: 'squash', amount: 0.2, dur: 0.2 },
    // 龍嚇醒，整條彈起來，小貓抱著尾巴一起被甩上去
    { at: WAKE, actor: 'dragon', do: 'hop', amount: 9, dur: 0.45 },
    { at: WAKE, actor: 'dragon', do: 'shake', amount: 1.5, dur: 0.45 },
    { at: WAKE, actor: 'cat', do: 'hop', amount: 9, dur: 0.45 },
    // 小貓順著龍身爬上頭頂坐好
    { at: WAKE + 0.45, actor: 'cat', do: 'rotateTo', amount: -15, dur: 0.2 },
    { at: WAKE + 0.45, actor: 'cat', do: 'moveTo', to: HEAD, arc: 10, dur: 0.35, ease: 'out' },
    // 亮相：兩個一起變大
    { at: POSE, actor: 'dragon', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: POSE, actor: 'dragon', do: 'scaleTo', amount: 1.08, dur: 0.35, ease: 'back' },
    { at: POSE, actor: 'cat', do: 'moveTo', to: { x: HEAD.x + 1, y: HEAD.y - 3 }, dur: 0.35, ease: 'back' },
    { at: POSE, actor: 'cat', do: 'scaleTo', amount: 1.12, dur: 0.35, ease: 'back' },
  ],
  fx: [
    { at: 0, kind: 'zzz', actor: 'dragon', dx: 10, dur: WAKE },
    ...s1.fx,
    ...s2.fx,
    { at: 5.2, kind: 'sweat', actor: 'cat', dur: 0.7 },
    ...s3.fx,
    { at: s3.end + 0.6, kind: 'dizzy', actor: 'cat', dur: 0.6 },
    ...f4.fx,
    { at: CATCH, kind: 'burst', x: TAIL + 12, y: 66, emoji: '💥', n: 1, dur: 0.35, scale: 1.4 },
    { at: WAKE, kind: 'puff', actor: 'dragon', n: 12, dur: 0.6 },
    { at: POSE, kind: 'burst', actor: 'dragon', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.4, kind: 'burst', actor: 'cat', emoji: '🎉', n: 7, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.35, to: look(84, 52, 1.35) },
    ...s1.camera,
    ...s2.camera,
    // 停一拍：慢慢推近小貓和尾巴
    { at: 4.9, dur: 0.9, do: 'zoom', amount: 1.4, to: look(80, 53, 1.4) },
    ...s3.camera,
    { at: s3.end + 0.2, dur: 0.5, do: 'zoom', amount: 1.35, to: look(84, 52, 1.35) },
    { at: CATCH, dur: 0.35, do: 'punch', amount: 0.12, to: { x: TAIL + 8, y: 62 } },
    { at: WAKE, dur: 0.45, do: 'shake', amount: 1.8 },
    // 亮相
    { at: POSE - 0.1, dur: 0.5, do: 'zoom', amount: 1.5, to: look(DX - 6, 50, 1.5) },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.15 },
    // 第三次「咚」：一閃
    { at: P3, dur: 0.05, level: -0.3 },
    { at: P3 + 0.05, dur: 0.35, level: 0.15 },
    // 龍醒來，燈亮起來
    { at: WAKE, dur: 0.05, level: -0.4 },
    { at: WAKE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.35, sfx: 'blip' },
    ...s1.cues,
    ...s2.cues,
    { at: 4.9, sfx: 'slide' },
    { at: 5.35, sfx: 'slide' },
    ...s3.cues,
    { at: s3.end + 0.6, sfx: 'plop' },
    ...f4.cues,
    { at: CATCH, sfx: 'tap' },
    { at: WAKE, sfx: 'rumble' },
    { at: POSE, sfx: 'boing' },
    { at: POSE + 0.15, say: '龍貓' },
    { at: POSE + 0.4, sfx: 'cheer' },
  ],
})
