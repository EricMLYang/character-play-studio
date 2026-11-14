// 演的是字面意思：龍＋貓——家裡睡著一條龍和一隻小貓，貓不玩毛線球，偏要把龍的尾巴當逗貓棒撲（沒有灰色大肚子、葉子傘、貓巴士、公車站）。
import { scene } from '../../story/scene'

// 晚上的客廳：一條龍盤在地上睡覺，尾巴一抖一抖。小貓走進來，毛線球滾到牠腳邊——牠聞一聞，不玩。
// 牠看到龍的尾巴在動，耳朵豎起來、屁股扭一扭、撲！尾巴剛好甩開，牠臉朝下撲在地板上。左看右看……龍還在睡。
// 屁股扭更久、撲！這次咬住了。龍嚇醒飛起來，小貓掛在尾巴上被甩來甩去。龍停下來，跟掛著的小貓大眼瞪小眼……
// 停一拍……小貓「喵」，龍也笑了。龍盤回地上，小貓跳到他頭上坐好：「龍貓」。尾巴又抖一下，小貓又撲。
const CAT = 14
const CG = 77 - 0.42 * CAT
const D = 40 // 龍的 size（翻面：頭在右上、尾巴在左下）
const DG = 77 - 0.42 * D
const DRAGON = { x: 112, y: DG }
const TAIL = { x: 96, y: CG } // 尾巴尖在地上的位置
const UP = -26 // 龍飛起來
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const HEAD = { x: 122, y: DG - 18 } // 龍頭上（小貓坐的地方）

export default scene({
  duration: 9.5,
  bg: { top: '#5A4A7A', bottom: '#9C83B8', floor: '#C9925E', scenery: 'room' },
  actors: [
    { id: 'sofa', emoji: '🛋️', x: 26, y: 77 - 0.42 * 30, size: 30 },
    { id: 'plant', emoji: '🪴', x: 150, y: 77 - 0.42 * 18, size: 18 },
    { id: 'yarn', emoji: '🧶', x: 66, y: 77 - 0.42 * 8, size: 8, pivot: 'center' },
    { id: 'dragon', emoji: '🐉', x: DRAGON.x, y: DRAGON.y, size: D, flip: true },
    { id: 'cat', emoji: '🐈', x: 40, y: CG, size: CAT, flip: true },
  ],
  moves: [
    // ① 小貓走進來，毛線球滾到腳邊，聞一聞，不玩
    { at: 0, actor: 'cat', do: 'enter', from: { x: -14, y: CG }, dur: 0.8, ease: 'out' },
    { at: 0.6, actor: 'yarn', do: 'moveTo', to: { x: 50, y: 77 - 0.42 * 8 }, dur: 0.5, ease: 'out' },
    { at: 0.6, actor: 'yarn', do: 'rotateTo', amount: -200, dur: 0.5, ease: 'out' },
    { at: 1.15, actor: 'cat', do: 'tilt', amount: 12, dur: 0.4 },
    // ② 尾巴一抖——耳朵豎起來，屁股扭一扭，撲！尾巴甩開，臉朝下
    { at: 1.6, actor: 'dragon', do: 'tilt', amount: -4, dur: 0.3 },
    { at: 1.7, actor: 'cat', do: 'hop', amount: 2, dur: 0.2 },
    { at: 1.95, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.5 },
    { at: 2.0, actor: 'cat', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 2.45, actor: 'cat', do: 'moveTo', to: TAIL, arc: 12, dur: 0.4, ease: 'out' },
    { at: 2.5, actor: 'dragon', do: 'tilt', amount: 7, dur: 0.4 },
    { at: 2.85, actor: 'cat', do: 'rotateTo', amount: 30, dur: 0.1 },
    { at: 2.85, actor: 'cat', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 3.2, actor: 'cat', do: 'rotateTo', amount: -30, dur: 0.15 },
    // 左看右看……龍還在睡
    { at: 3.4, actor: 'cat', do: 'flip' },
    { at: 3.75, actor: 'cat', do: 'flip' },
    // 屁股扭更久、撲！咬住了
    { at: 4.1, actor: 'dragon', do: 'tilt', amount: -4, dur: 0.3 },
    { at: 4.1, actor: 'cat', do: 'moveTo', to: { x: 82, y: CG }, dur: 0.3, ease: 'out' },
    { at: 4.4, actor: 'cat', do: 'squash', amount: 0.35, dur: 0.6 },
    { at: 4.4, actor: 'cat', do: 'shake', amount: 1, dur: 0.6 },
    { at: 5.0, actor: 'cat', do: 'moveTo', to: TAIL, arc: 8, dur: 0.25, ease: 'out' },
    // 龍嚇醒飛起來，小貓掛在尾巴上被甩來甩去
    { at: 5.3, actor: 'dragon', do: 'shake', amount: 1.5, dur: 0.25 },
    { at: 5.5, actor: 'dragon', do: 'moveTo', to: { x: DRAGON.x, y: DRAGON.y + UP }, dur: 0.4, ease: 'out' },
    { at: 5.5, actor: 'cat', do: 'moveTo', to: { x: TAIL.x, y: TAIL.y + UP }, dur: 0.4, ease: 'out' },
    { at: 5.9, actor: 'dragon', do: 'tilt', amount: 14, dur: 0.35 },
    { at: 5.9, actor: 'cat', do: 'moveTo', to: { x: 74, y: TAIL.y + UP - 6 }, dur: 0.18 },
    { at: 6.08, actor: 'cat', do: 'moveTo', to: { x: TAIL.x, y: TAIL.y + UP }, dur: 0.17 },
    { at: 6.25, actor: 'dragon', do: 'tilt', amount: -10, dur: 0.3 },
    { at: 6.25, actor: 'cat', do: 'moveTo', to: { x: 102, y: TAIL.y + UP + 3 }, dur: 0.15 },
    { at: 6.4, actor: 'cat', do: 'moveTo', to: { x: TAIL.x, y: TAIL.y + UP }, dur: 0.15 },
    { at: 6.25, actor: 'cat', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
    // 大眼瞪小眼……停一拍……喵
    { at: 7.0, actor: 'cat', do: 'hop', amount: 2, dur: 0.25 },
    // 龍盤回地上，小貓跳到他頭上
    { at: 7.3, actor: 'dragon', do: 'moveTo', to: DRAGON, dur: 0.35, ease: 'out' },
    { at: 7.3, actor: 'cat', do: 'moveTo', to: HEAD, arc: 10, dur: 0.4, ease: 'out' },
    { at: 7.65, actor: 'dragon', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 7.7, actor: 'dragon', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    { at: 7.7, actor: 'cat', do: 'moveTo', to: { x: HEAD.x + 2, y: HEAD.y - 4 }, dur: 0.3, ease: 'back' },
    { at: 7.7, actor: 'cat', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    // 尾巴又抖一下，小貓又想撲
    { at: 8.7, actor: 'dragon', do: 'tilt', amount: -3, dur: 0.3 },
    { at: 8.8, actor: 'cat', do: 'squash', amount: 0.2, dur: 0.3 },
  ],
  fx: [
    { at: 0, kind: 'zzz', actor: 'dragon', dx: 10, dur: 5.2 },
    { at: 1.2, kind: 'pop', actor: 'cat', emoji: '😑', dx: 8, dur: 0.5 },
    { at: 1.65, kind: 'pop', actor: 'cat', emoji: '❗', dx: 6, dur: 0.4 },
    { at: 2.45, kind: 'puff', actor: 'cat', n: 4, dur: 0.3 },
    { at: 2.85, kind: 'burst', actor: 'cat', n: 1, dur: 0.3 },
    { at: 3.4, kind: 'pop', actor: 'cat', emoji: '❓', dx: 6, dur: 0.6 },
    { at: 5.0, kind: 'burst', actor: 'cat', emoji: '💥', n: 4, dur: 0.4 },
    { at: 5.3, kind: 'pop', actor: 'dragon', emoji: '😱', dx: 16, dy: 2, dur: 0.6 },
    { at: 5.5, kind: 'puff', actor: 'dragon', n: 10, dur: 0.6 },
    { at: 6.0, kind: 'sweat', actor: 'cat' },
    { at: 6.65, kind: 'pop', actor: 'dragon', emoji: '👀', dx: 14, dur: 0.6 },
    { at: 7.0, kind: 'pop', actor: 'cat', emoji: '💕', dx: -6, dur: 0.6 },
    { at: 7.7, kind: 'burst', actor: 'dragon', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.3, kind: 'burst', actor: 'cat', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 2.85, dur: 0.25, do: 'shake', amount: 0.6 },
    { at: 5.0, dur: 0.3, do: 'punch', amount: 0.15, to: { x: 96, y: 62 } },
    { at: 5.3, dur: 0.5, do: 'shake', amount: 1.6 },
    { at: 7.65, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 7.8, dur: 0.5, do: 'zoom', amount: 1.25, to: look(108, 45, 1.25) },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.2 },
    { at: 5.3, dur: 0.05, level: -0.3 },
    { at: 5.35, dur: 0.4, level: 0.1 },
    { at: 7.7, dur: 0.05, level: -0.35 },
    { at: 7.75, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.6, sfx: 'slide' },
    { at: 1.65, sfx: 'blip' },
    { at: 2.45, sfx: 'whoosh' },
    { at: 2.85, sfx: 'bonk' },
    { at: 5.0, sfx: 'crack' },
    { at: 5.3, sfx: 'rumble' },
    { at: 5.9, sfx: 'whoosh' },
    { at: 7.0, sfx: 'blip' },
    { at: 7.65, sfx: 'plop' },
    { at: 7.85, say: '龍貓' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
