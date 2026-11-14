// 演的是字面意思：麵包＋小偷——半夜一個小忍者偷偷把一條麵包抱走（不是披著麵包的老鼠，也沒有老鼠）。
import { scene } from '../../story/scene'

// 半夜的麵包店：忍者從天花板跳下來，舉著葉子假裝隱形、踮腳摸到麵包籃。一抬麵包，睡在上面的貓也被抬起來——
// 貓醒了左看右看（他僵住冒汗）……又睡回去。他抱著麵包跑到中間跳起來慶祝，燈突然亮了！他立刻躲到麵包後面，
// 只露出眼睛：「麵包小偷」。貓瞄一眼又睡了，他抱著麵包比耶。
const G = 66.1 // 忍者（size 26）站在地上的 y
const BASKET = { x: 116, y: 71.1 }
const BREAD = { x: 116, y: 61 }

export default scene({
  duration: 9.5,
  bg: { top: '#4C3B6B', bottom: '#8A6FA8', floor: '#C79A6B', scenery: 'room' },
  actors: [
    { id: 'plant', emoji: '🪴', x: 20, y: 68.6, size: 20 },
    { id: 'rack', emoji: '🧺', x: 146, y: 70.3, size: 16 },
    { id: 'long', emoji: '🥖', x: 146, y: 62, size: 13, float: true },
    { id: 'candle', emoji: '🕯️', x: 40, y: 71.5, size: 11 },
    { id: 'basket', emoji: '🧺', x: BASKET.x, y: BASKET.y, size: 14 },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 46, y: G, size: 26, hidden: true },
    { id: 'bread', emoji: '🍞', x: BREAD.x, y: BREAD.y, size: 17, float: true },
    { id: 'cat', emoji: '🐈', x: 117, y: 53.5, size: 13, float: true },
  ],
  moves: [
    // 從天花板跳下來（先縮成一團再落地），馬上舉葉子假裝隱形，左看右看
    { at: 0.15, actor: 'ninja', do: 'drop', dur: 0.5 },
    { at: 0.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 1.05, actor: 'ninja', do: 'flip' },
    { at: 1.35, actor: 'ninja', do: 'flip' },
    // 想到麵包，踮腳摸過去
    { at: 1.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 2.15, actor: 'ninja', do: 'moveTo', to: { x: 97, y: G }, dur: 1.0, ease: 'linear' },
    { at: 2.15, actor: 'ninja', do: 'bounce', amount: 1.3, times: 5, dur: 1.0 },
    // 抬麵包——連貓一起抬起來
    { at: 3.3, actor: 'ninja', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 3.35, actor: 'bread', do: 'moveTo', to: { x: BREAD.x - 4, y: BREAD.y - 6 }, dur: 0.35, ease: 'out' },
    { at: 3.35, actor: 'cat', do: 'moveTo', to: { x: 113, y: 47.5 }, dur: 0.35, ease: 'out' },
    // 貓醒了：他僵住、舉葉子；貓左看右看
    { at: 3.8, actor: 'cat', do: 'hop', amount: 4, dur: 0.3 },
    { at: 3.85, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 3.85, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 4.3, actor: 'cat', do: 'flip' },
    { at: 4.75, actor: 'cat', do: 'flip' },
    { at: 4.3, actor: 'ninja', do: 'shake', amount: 0.5, dur: 1.0 },
    // ……又睡回去了。呼——
    { at: 5.2, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.4 },
    // 真的抱走：麵包舉過頭，貓滑回籃子上繼續睡
    { at: 5.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 5.6, actor: 'bread', do: 'moveTo', to: { x: 97, y: 47 }, dur: 0.3, ease: 'out' },
    { at: 5.65, actor: 'cat', do: 'moveTo', to: { x: BASKET.x, y: 62.5 }, arc: 3, dur: 0.35, ease: 'in' },
    // 抱著麵包跑到中間
    { at: 5.95, actor: 'ninja', do: 'flip' },
    { at: 6.0, actor: 'ninja', do: 'moveTo', to: { x: 72, y: G }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 6.0, actor: 'bread', do: 'moveTo', to: { x: 72, y: 47 }, dur: 0.45, ease: 'in' },
    // 跳起來慶祝……
    { at: 6.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 6.5, actor: 'ninja', do: 'hop', amount: 6, dur: 0.4 },
    { at: 6.5, actor: 'bread', do: 'moveTo', to: { x: 72, y: 50 }, dur: 0.1 },
    { at: 6.5, actor: 'bread', do: 'hop', amount: 6, dur: 0.4 },
    // 燈亮了！立刻躲到麵包後面，只露出眼睛
    { at: 6.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 7.05, actor: 'bread', do: 'moveTo', to: { x: 72, y: 75.5 }, dur: 0.15, ease: 'out' },
    { at: 7.05, actor: 'bread', do: 'scaleTo', amount: 1.2, dur: 0.15, ease: 'back' },
    { at: 7.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 7.25, actor: 'ninja', do: 'shake', amount: 0.5, dur: 0.6 },
    // 貓瞄一眼，又睡了
    { at: 7.4, actor: 'cat', do: 'hop', amount: 2, dur: 0.25 },
    // 亮相：抱著麵包跳出來比耶
    { at: 8.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 8.15, actor: 'ninja', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 8.15, actor: 'bread', do: 'moveTo', to: { x: 77, y: 41 }, dur: 0.3, ease: 'back' },
    { at: 8.15, actor: 'bread', do: 'scaleTo', amount: 1.05, dur: 0.3 },
    { at: 8.15, actor: 'bread', do: 'tilt', amount: 12, dur: 0.4 },
  ],
  fx: [
    { at: 0.68, kind: 'puff', actor: 'ninja', dur: 0.4 },
    { at: 0.8, kind: 'pop', actor: 'ninja', emoji: '🤫', dx: -12, dy: 4, dur: 0.8 },
    { at: 0.3, kind: 'zzz', actor: 'cat', dur: 3.3 },
    { at: 1.75, kind: 'bubble', actor: 'ninja', emoji: '🍞', dur: 1.2 },
    { at: 3.8, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.5 },
    { at: 4.0, kind: 'sweat', actor: 'ninja' },
    { at: 4.45, kind: 'pop', actor: 'cat', emoji: '❓', dur: 0.45 },
    { at: 5.25, kind: 'zzz', actor: 'cat', dur: 1.9 },
    { at: 5.3, kind: 'pop', actor: 'ninja', emoji: '😮‍💨', dx: -12, dur: 0.5 },
    { at: 6.0, kind: 'puff', actor: 'ninja', dur: 0.4 },
    { at: 7.0, kind: 'pop', actor: 'ninja', emoji: '😱', dx: -16, dy: 2, dur: 0.5 },
    { at: 7.4, kind: 'pop', actor: 'cat', emoji: '😑', dur: 0.6 },
    { at: 7.9, kind: 'zzz', actor: 'cat', dur: 1.3 },
    { at: 8.2, kind: 'burst', actor: 'ninja', emoji: '✨', n: 9, dur: 0.8 },
    { at: 8.3, kind: 'burst', actor: 'bread', emoji: '🎉', n: 5, dur: 0.9 },
  ],
  camera: [
    { at: 0.66, dur: 0.25, do: 'shake', amount: 0.8 },
    { at: 7.0, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 7.05, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 72, y: 52 } },
    { at: 8.15, dur: 0.45, do: 'zoom', amount: 1.5, to: { x: 75, y: 53 } },
  ],
  lights: [
    // 半夜：一開始就是暗的；燈突然亮了（白光一閃）
    { at: 0, dur: 0.01, level: 0.5 },
    { at: 6.95, dur: 0.05, level: -0.35 },
    { at: 7.0, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.65, sfx: 'plop' },
    { at: 2.15, sfx: 'tap' },
    { at: 3.35, sfx: 'slide' },
    { at: 3.8, sfx: 'bonk' },
    { at: 5.6, sfx: 'whoosh' },
    { at: 6.5, sfx: 'boing' },
    { at: 6.95, sfx: 'clink' },
    { at: 7.3, say: '麵包小偷' },
    { at: 8.2, sfx: 'cheer' },
  ],
})
