import type { Clip } from '../clip'

// 家（重做）：豬探長想用紅繩子把大房子拖走，拉到臉紅——繩子一滑，他整隻彈回去臉撞上牆。機器人開噴射一拉，房子整棟飛上天，
// 「轟」地砸在中間碎成「家」，只剩一間迷你小屋彈出來。國字讓到上方，豬探長從屋頂鑽進小屋，只露出頭（回家）；機器人也跳進去，把他像瓶塞一樣擠飛。家、家、回家
const G = 68.6 // size 20 的主角站在地上的 y
const HY = 70.7 // 迷你小屋（size 15）站在地上的 y
const IN = 63 // 鑽進小屋以後，只露出頭的 y

const clip: Clip = {
  char: '家',
  meta: { theme: '拖房子搬家', cast: '豬探長＋玩具機器人＋紅繩子＋大房子＋迷你小屋', gags: ['拉繩子一滑臉撞牆', '噴射一拉房子飛上天', '房子砸下來碎成字', '從屋頂鑽進小屋只露出頭', '跳進去把對方像瓶塞擠飛'] },
  duration: 10,
  bg: { top: '#D0EBFF', bottom: '#F1F8FF', floor: '#B2D88A', scenery: 'hills' },
  actors: [
    { id: 'house', emoji: '🏠', x: 106, y: 65.2, size: 28 },
    { id: 'pig', emoji: 'hero:pig/idle', x: 40, y: G, size: 20, hidden: true, flip: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 26, y: G, size: 20, hidden: true },
    { id: 'tiny', emoji: '🏠', x: 80, y: 60, size: 15, hidden: true },
  ],
  moves: [
    // 豬探長走進來，看著大房子：我要把它搬走！
    { at: 0, actor: 'pig', do: 'enter', from: { x: -6, y: G }, dur: 0.6, ease: 'out' },
    { at: 0.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 第一拉：拉到臉紅，房子一動也不動
    { at: 1.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 1.3, actor: 'pig', do: 'rotateTo', amount: -14, dur: 0.2 },
    { at: 1.35, actor: 'pig', do: 'moveTo', to: { x: 33, y: G }, dur: 0.55, ease: 'linear' },
    { at: 1.4, actor: 'pig', do: 'shake', amount: 1, dur: 0.55 },
    { at: 1.55, actor: 'house', do: 'shake', amount: 0.5, dur: 0.35 },
    // 繩子一滑：整隻彈回去，臉撞上牆
    { at: 1.95, actor: 'pig', do: 'rotateTo', amount: 14, dur: 0.1 },
    { at: 1.95, actor: 'pig', do: 'moveTo', to: { x: 80, y: G }, dur: 0.22, ease: 'in' },
    { at: 2.17, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 2.17, actor: 'house', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 2.17, actor: 'pig', do: 'moveTo', to: { x: 64, y: G }, arc: 6, dur: 0.35, ease: 'out' },
    // 機器人走進來：讓我來！
    { at: 2.55, actor: 'robot', do: 'enter', from: { x: -20, y: G }, dur: 0.5, ease: 'out' },
    { at: 3.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 3.1, actor: 'robot', do: 'squash', amount: -0.3, dur: 0.3 },
    // 噴射往上一拉：房子整棟被拔起來
    { at: 3.4, actor: 'robot', do: 'moveTo', to: { x: 22, y: 34 }, dur: 0.55, ease: 'in' },
    { at: 3.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.55, actor: 'house', do: 'shake', amount: 1, dur: 0.25 },
    { at: 3.7, actor: 'house', do: 'moveTo', to: { x: 80, y: 26 }, dur: 0.55, ease: 'out' },
    { at: 3.7, actor: 'house', do: 'rotateTo', amount: -25, dur: 0.55 },
    // 豬探長嚇得逃到右邊
    { at: 3.85, actor: 'pig', do: 'flip' },
    { at: 3.9, actor: 'pig', do: 'moveTo', to: { x: 136, y: G }, dur: 0.45, anticipate: 3, ease: 'in' },
    // 繩子斷了：機器人自己飛去撞天花板，房子在空中停一下
    { at: 4.25, actor: 'robot', do: 'moveTo', to: { x: 14, y: 14 }, dur: 0.2, ease: 'out' },
    { at: 4.25, actor: 'robot', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.25, actor: 'house', do: 'shake', amount: 1.2, dur: 0.25 },
    { at: 4.45, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    { at: 4.5, actor: 'robot', do: 'moveTo', to: { x: 24, y: G }, dur: 0.45, ease: 'in' },
    { at: 4.5, actor: 'house', do: 'rotateTo', amount: 25, dur: 0.4 },
    { at: 4.5, actor: 'house', do: 'moveTo', to: { x: 80, y: 62 }, dur: 0.4, ease: 'in' },
    // 轟！房子碎掉，只剩一間迷你小屋彈出來
    { at: 4.9, actor: 'house', do: 'vanish', dur: 0.08 },
    { at: 4.92, actor: 'tiny', do: 'pop' },
    { at: 4.92, actor: 'tiny', do: 'moveTo', to: { x: 120, y: HY }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 4.92, actor: 'tiny', do: 'spin', times: 1, dur: 0.5 },
    { at: 4.95, actor: 'pig', do: 'flip' },
    { at: 5.45, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 機器人修好自己
    { at: 6.1, actor: 'robot', do: 'shake', amount: 1, dur: 0.35 },
    { at: 6.45, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 6.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    // 國字讓位：豬探長把小屋推到中間
    { at: 6.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 6.9, actor: 'tiny', do: 'moveTo', to: { x: 82, y: HY }, dur: 0.45, ease: 'inOut' },
    { at: 6.9, actor: 'pig', do: 'moveTo', to: { x: 98, y: G }, dur: 0.45, ease: 'inOut' },
    // 從屋頂鑽進去，只露出頭
    { at: 7.4, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 7.5, actor: 'pig', do: 'moveTo', to: { x: 82, y: IN }, arc: 14, dur: 0.35, ease: 'in' },
    { at: 7.85, actor: 'tiny', do: 'squash', amount: 0.3, dur: 0.25 },
    // 戴著小屋一跳一跳
    { at: 8.1, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.1, actor: 'tiny', do: 'hop', amount: 3, dur: 0.25 },
    // 回馬槍：機器人也要回家，跳進去，把豬探長像瓶塞一樣擠飛
    { at: 7.6, actor: 'robot', do: 'moveTo', to: { x: 44, y: G }, dur: 0.4 },
    { at: 8.15, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 8.15, actor: 'robot', do: 'squash', amount: -0.35, dur: 0.2 },
    { at: 8.25, actor: 'robot', do: 'moveTo', to: { x: 82, y: IN }, arc: 16, dur: 0.3, ease: 'in' },
    { at: 8.55, actor: 'tiny', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 8.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.55, actor: 'pig', do: 'moveTo', to: { x: 134, y: G }, arc: 26, dur: 0.55, ease: 'out' },
    { at: 8.55, actor: 'pig', do: 'spin', times: 2, dur: 0.55 },
    // 機器人戴著小屋走到左邊
    { at: 8.7, actor: 'robot', do: 'moveTo', to: { x: 30, y: IN }, dur: 0.4 },
    { at: 8.7, actor: 'tiny', do: 'moveTo', to: { x: 30, y: HY }, dur: 0.4 },
    { at: 9.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
  ],
  builds: [
    // 碎掉的屋頂 → 寶蓋頭；房子的牆 → 豕
    { at: 4.95, dur: 0.45, strokes: [0, 1, 2], from: 'house', color: '#E03131' },
    { at: 5.35, dur: 0.6, strokes: [3, 4, 5, 6, 7, 8, 9], from: 'house', color: '#F08C00' },
  ],
  glyph: [
    { at: 5.95, dur: 0.4, do: 'wobble' },
    { at: 6.75, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.55, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    { at: 0.65, kind: 'bubble', actor: 'pig', emoji: '🚚', dur: 0.65 },
    // 紅繩子：豬探長拉著大房子
    { at: 1.0, kind: 'line', actor: 'pig', target: 'house', color: '#E8412C', width: 2, dur: 0.95 },
    { at: 1.5, kind: 'sweat', actor: 'pig' },
    { at: 2.17, kind: 'burst', x: 90, y: 62, n: 1, dur: 0.35 },
    { at: 2.4, kind: 'dizzy', actor: 'pig', dur: 0.8 },
    { at: 2.9, kind: 'pop', actor: 'robot', emoji: '💡', dur: 0.4 },
    { at: 3.15, kind: 'line', actor: 'robot', target: 'house', color: '#E8412C', width: 2, dur: 1.1 },
    { at: 3.3, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 3.6, kind: 'pop', actor: 'pig', emoji: '😱', dur: 0.4 },
    { at: 4.25, kind: 'burst', x: 14, y: 6, n: 1, dur: 0.3 },
    { at: 4.45, kind: 'pop', actor: 'house', emoji: '❗', dur: 0.3 },
    { at: 4.9, kind: 'burst', x: 80, y: 62, n: 1, dur: 0.4 },
    { at: 4.92, kind: 'burst', x: 80, y: 62, emoji: '🧱', n: 8, dur: 0.5 },
    { at: 5.0, kind: 'stink', actor: 'robot', dur: 1.0 },
    { at: 5.0, kind: 'dizzy', actor: 'robot', dur: 1.0 },
    { at: 5.45, kind: 'pop', actor: 'pig', emoji: '❓', dx: 4, dur: 0.6 },
    { at: 6.3, kind: 'bubble', actor: 'pig', emoji: '💡', dur: 0.5 },
    { at: 7.9, kind: 'puff', actor: 'tiny', dur: 0.4 },
    { at: 7.9, kind: 'pop', actor: 'pig', emoji: '💕', dx: 12, dy: 2, dur: 0.6 },
    { at: 8.0, kind: 'pop', actor: 'robot', emoji: '😍', dur: 0.4 },
    { at: 8.55, kind: 'burst', actor: 'tiny', n: 1, dy: 6, dur: 0.3 },
    { at: 9.15, kind: 'pop', actor: 'pig', emoji: '😤', dx: 6, dur: 0.6 },
    { at: 9.3, kind: 'pop', actor: 'robot', emoji: '👋', dx: 8, dur: 0.6 },
  ],
  camera: [
    { at: 2.17, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.9, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: 4.9, dur: 0.04, level: -0.8 },
    { at: 4.94, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'tap' },
    { at: 1.0, say: '家' },
    { at: 1.4, sfx: 'slide' },
    { at: 1.95, sfx: 'whoosh' },
    { at: 2.17, sfx: 'bonk' },
    { at: 3.4, sfx: 'rumble' },
    { at: 4.25, sfx: 'crack' },
    { at: 4.9, sfx: 'poof' },
    { at: 5.95, say: '家' },
    { at: 6.9, sfx: 'slide' },
    { at: 7.85, sfx: 'plop' },
    { at: 7.9, say: '回家' },
    { at: 8.55, sfx: 'boing' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
