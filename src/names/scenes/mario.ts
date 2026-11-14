// 演的是字面意思：名字沒有字面意思，演「一個好愛跳的人」——小忍者一朵雲一朵雲往上跳，跳太高卡在月亮上，青蛙跳上來救他（沒有紅帽子、鬍子、吊帶褲、水管、問號磚、蘑菇、烏龜殼、金幣）。
import { scene } from '../../story/scene'

// 傍晚的山坡：小忍者一路蹦蹦跳跳進來，青蛙在地上看。他看到天上一階一階的雲，咚、咚、咚跳上去，
// 站在最高那朵雲上看月亮，蹲低……用力一跳，飛出畫面。青蛙抬頭等……等……掉下來的只有一顆星星，砸在青蛙頭上。
// 原來他卡在月亮彎彎的那一邊，腳亂踢。青蛙一朵雲一朵雲跳上去，抓住他的腳一拉——兩個一起掉在雲上，
// 雲像彈簧床把他們彈起來，小忍者站穩、青蛙站在他頭上，兩個一起舉手：「瑪利歐」。
const N = 15 // 小忍者的 size
const G = 77 - 0.42 * N
const FROG = 12
const FG = 77 - 0.42 * FROG
// 三朵雲（雲上面站人的位置用 anim:shot 量過）
const C1 = { x: 58, y: 64 }
const C2 = { x: 84, y: 56 }
const C3 = { x: 110, y: 50 }
const on = (c: { x: number; y: number }, size: number) => ({ x: c.x, y: c.y - 2 - 0.42 * size })
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const MOON = { x: 134, y: 29 }
const STUCK = { x: 131, y: 33 } // 卡在月亮彎彎的那一邊

export default scene({
  duration: 9.6,
  bg: { top: '#7A5BB8', bottom: '#FFC9A0', floor: '#7DB860', scenery: 'hills' },
  actors: [
    { id: 'moon', emoji: '🌙', x: MOON.x, y: MOON.y, size: 24, float: true, pivot: 'center' },
    { id: 'tree', emoji: '🌳', x: 14, y: 77 - 0.42 * 28, size: 28 },
    { id: 'rock', emoji: '🪨', x: 36, y: 77 - 0.42 * 10, size: 10 },
    { id: 'c1', emoji: '☁️', x: C1.x, y: C1.y, size: 18, float: true },
    { id: 'c2', emoji: '☁️', x: C2.x, y: C2.y, size: 18, float: true },
    { id: 'c3', emoji: '☁️', x: C3.x, y: C3.y, size: 26, float: true },
    { id: 'star', emoji: '⭐', x: 36, y: 8, size: 8, float: true, pivot: 'center', hidden: true },
    { id: 'frog', emoji: '🐸', x: 36, y: 77 - 0.42 * 10 - 7, size: FROG },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 20, y: G, size: N },
  ],
  moves: [
    // ① 蹦蹦跳跳進來（愛跳的人，走路也用跳的）
    { at: 0, actor: 'ninja', do: 'enter', from: { x: -14, y: G }, dur: 0.3, ease: 'out' },
    { at: 0.3, actor: 'ninja', do: 'moveTo', to: { x: 32, y: G }, arc: 7, dur: 0.3, ease: 'out' },
    { at: 0.6, actor: 'ninja', do: 'moveTo', to: { x: 46, y: G }, arc: 7, dur: 0.3, ease: 'out' },
    { at: 0.9, actor: 'frog', do: 'hop', amount: 3, dur: 0.3 },
    // ② 咚、咚、咚跳上三朵雲
    { at: 1.2, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.15 },
    { at: 1.35, actor: 'ninja', do: 'moveTo', to: on(C1, N), arc: 9, dur: 0.35, ease: 'out' },
    { at: 1.7, actor: 'c1', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.85, actor: 'ninja', do: 'moveTo', to: on(C2, N), arc: 9, dur: 0.35, ease: 'out' },
    { at: 2.2, actor: 'c2', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 2.35, actor: 'ninja', do: 'moveTo', to: on(C3, N), arc: 9, dur: 0.35, ease: 'out' },
    { at: 2.7, actor: 'c3', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 2.5, actor: 'frog', do: 'tilt', amount: -12, dur: 0.5 },
    // 看月亮，蹲低……用力一跳，飛出畫面
    { at: 3.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 3.25, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.35 },
    { at: 3.25, actor: 'c3', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 3.6, actor: 'ninja', do: 'moveTo', to: { x: 122, y: -30 }, dur: 0.35, ease: 'out' },
    { at: 3.6, actor: 'c3', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 青蛙抬頭等……等……掉下來的只有一顆星星
    { at: 4.1, actor: 'frog', do: 'tilt', amount: 10, dur: 0.6 },
    { at: 4.8, actor: 'star', do: 'pop', dur: 0.1 },
    { at: 4.85, actor: 'star', do: 'moveTo', to: { x: 36, y: 60 }, dur: 0.35, ease: 'in' },
    { at: 4.85, actor: 'star', do: 'spin', times: 2, dur: 0.35 },
    { at: 5.2, actor: 'frog', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 5.2, actor: 'star', do: 'moveTo', to: { x: 50, y: 72 }, arc: 6, dur: 0.4, ease: 'out' },
    // 原來卡在月亮上，腳亂踢
    { at: 4.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 4.5, actor: 'ninja', do: 'moveTo', to: { x: STUCK.x, y: -30 }, dur: 0.01 },
    { at: 5.4, actor: 'ninja', do: 'moveTo', to: STUCK, dur: 0.2, ease: 'back' },
    { at: 5.55, actor: 'moon', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 5.6, actor: 'ninja', do: 'shake', amount: 1.2, dur: 0.6 },
    // ④ 青蛙一朵雲一朵雲跳上去，抓住他的腳一拉
    { at: 5.8, actor: 'frog', do: 'moveTo', to: on(C1, FROG), arc: 8, dur: 0.25, ease: 'out' },
    { at: 6.05, actor: 'frog', do: 'moveTo', to: on(C2, FROG), arc: 8, dur: 0.25, ease: 'out' },
    { at: 6.3, actor: 'frog', do: 'moveTo', to: on(C3, FROG), arc: 8, dur: 0.25, ease: 'out' },
    { at: 6.6, actor: 'frog', do: 'moveTo', to: { x: STUCK.x - 2, y: STUCK.y + 11 }, dur: 0.25, ease: 'out' },
    { at: 6.9, actor: 'moon', do: 'tilt', amount: -18, dur: 0.4 },
    // 兩個一起掉在雲上，雲把他們彈起來
    { at: 7.0, actor: 'ninja', do: 'moveTo', to: { x: C3.x - 4, y: on(C3, N).y }, dur: 0.3, ease: 'in' },
    { at: 7.0, actor: 'frog', do: 'moveTo', to: { x: C3.x + 12, y: on(C3, FROG).y - 6 }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'c3', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 7.3, actor: 'ninja', do: 'hop', amount: 6, dur: 0.4 },
    { at: 7.3, actor: 'frog', do: 'hop', amount: 6, dur: 0.4 },
    // ⑤ 站穩、青蛙站在頭上，兩個一起舉手
    { at: 7.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.7, actor: 'ninja', do: 'scaleTo', amount: 1.6, dur: 0.3, ease: 'back' },
    { at: 7.7, actor: 'frog', do: 'moveTo', to: { x: C3.x + 13, y: on(C3, FROG).y }, dur: 0.3, ease: 'back' },
    { at: 7.7, actor: 'frog', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 8.3, actor: 'ninja', do: 'hop', amount: 2, dur: 0.3 },
    { at: 8.3, actor: 'frog', do: 'hop', amount: 4, dur: 0.3 },
  ],
  fx: [
    { at: 0.3, kind: 'puff', actor: 'ninja', dur: 0.3 },
    { at: 0.9, kind: 'pop', actor: 'frog', emoji: '👀', dx: 6, dur: 0.6 },
    { at: 1.7, kind: 'burst', actor: 'c1', emoji: '✨', n: 4, dur: 0.4 },
    { at: 2.2, kind: 'burst', actor: 'c2', emoji: '✨', n: 4, dur: 0.4 },
    { at: 2.7, kind: 'burst', actor: 'c3', emoji: '✨', n: 4, dur: 0.4 },
    { at: 3.0, kind: 'pop', actor: 'ninja', emoji: '💡', dx: 8, dur: 0.5 },
    { at: 3.6, kind: 'puff', actor: 'c3', n: 8, dur: 0.5 },
    { at: 4.2, kind: 'pop', actor: 'frog', emoji: '❓', dx: 6, dur: 0.6 },
    { at: 5.2, kind: 'dizzy', actor: 'frog', dur: 0.7 },
    { at: 5.6, kind: 'sweat', actor: 'ninja' },
    { at: 5.65, kind: 'pop', actor: 'ninja', emoji: '😱', dx: -12, dur: 0.6 },
    { at: 6.6, kind: 'pop', actor: 'frog', emoji: '💪', dx: -8, dur: 0.4 },
    { at: 7.3, kind: 'puff', actor: 'c3', n: 10, dur: 0.6 },
    { at: 7.7, kind: 'burst', actor: 'ninja', emoji: '⭐', n: 8, dur: 0.8 },
    { at: 8.3, kind: 'burst', actor: 'ninja', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1, to: { x: 80, y: 45 } },
    { at: 3.6, dur: 0.4, do: 'shake', amount: 0.8 },
    { at: 3.7, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.2, dur: 0.3, do: 'shake', amount: 1 },
    { at: 5.4, dur: 0.4, do: 'zoom', amount: 1.5, to: look(118, 40, 1.5) },
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 7.6, dur: 0.45, do: 'zoom', amount: 1.45, to: { x: C3.x, y: 40 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.15 },
    { at: 3.6, dur: 0.6, level: 0.3 },
    { at: 7.65, dur: 0.05, level: -0.35 },
    { at: 7.7, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'boing' },
    { at: 0.6, sfx: 'boing' },
    { at: 1.7, sfx: 'blip' },
    { at: 2.2, sfx: 'blip' },
    { at: 2.7, sfx: 'blip' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 5.2, sfx: 'bonk' },
    { at: 5.6, sfx: 'slide' },
    { at: 6.05, sfx: 'tap' },
    { at: 7.3, sfx: 'boing' },
    { at: 7.8, say: '瑪利歐' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
