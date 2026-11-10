import type { Clip } from '../clip'

// 晚（重做）：布忍者想睡覺，太陽卻一直照著他。丟繩子套太陽——太陽一動也不動，反而把他扯飛、臉著地；跳上去抱太陽——好燙！
// 燙到手上拋下拋，一把丟出去，太陽「轟」地砸在畫面中間變成「日」；消防車被吵醒噴水，水柱落成「免」。太陽不見了，天就黑了。
// 國字讓到上方，床跳出來，忍者跳上床說晚安；月亮卻冒出來照他，他又丟繩子套月亮——連人帶床被吊上天，乾脆掛在月亮下睡。晚、晚、晚安
const G = 67.8 // 忍者（size 22）站在地上的 y

const clip: Clip = {
  char: '晚',
  meta: { theme: '忍者趕走太陽', cast: '布忍者＋太陽＋消防車＋床＋月亮', gags: ['套太陽反被扯飛', '抱太陽燙手拋接', '砸下去變成字', '套月亮連人帶床吊上天'] },
  duration: 10,
  bg: { top: '#CFE8FF', bottom: '#FFF1DC', floor: '#E6D5B8', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '🌞', x: 128, y: 17, size: 15, float: true },
    { id: 'moon', emoji: '🌝', x: 128, y: 14, size: 16, float: true, hidden: true },
    { id: 'truck', emoji: '🚒', x: 146, y: 67.8, size: 22 },
    { id: 'bed', emoji: '🛏️', x: 80, y: 64, size: 30, hidden: true },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 56, y: G, size: 22, flip: true, hidden: true },
  ],
  moves: [
    // 揉著眼睛走進來，被太陽照得睜不開眼
    { at: 0, actor: 'ninja', do: 'enter', from: { x: -15, y: G }, dur: 0.65, ease: 'out' },
    { at: 0.85, actor: 'sun', do: 'flash', dur: 0.5 },
    { at: 0.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 1.2, actor: 'ninja', do: 'hop', amount: 3, dur: 0.25 },
    // 第一次：丟繩子套太陽，用力拉——太陽不動，反而把他扯飛
    { at: 1.65, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 1.65, actor: 'ninja', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 2.05, actor: 'ninja', do: 'moveTo', to: { x: 50, y: G }, dur: 0.35, ease: 'out' },
    { at: 2.05, actor: 'ninja', do: 'rotateTo', amount: -14, dur: 0.3 },
    { at: 2.15, actor: 'sun', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 2.6, actor: 'ninja', do: 'rotateTo', amount: 14, dur: 0.1 },
    { at: 2.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 2.6, actor: 'ninja', do: 'moveTo', to: { x: 102, y: G }, arc: 22, dur: 0.5, ease: 'inOut' },
    { at: 2.6, actor: 'ninja', do: 'spin', times: 1, dur: 0.5 },
    { at: 3.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    // 第二次：蹲低、跳上去一把抱住太陽——好燙！
    { at: 3.55, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 3.55, actor: 'ninja', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 3.85, actor: 'ninja', do: 'moveTo', to: { x: 126, y: 30 }, dur: 0.3, ease: 'out' },
    { at: 4.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 4.2, actor: 'ninja', do: 'moveTo', to: { x: 118, y: G }, dur: 0.3, ease: 'in' },
    { at: 4.2, actor: 'sun', do: 'moveTo', to: { x: 118, y: 49 }, dur: 0.3, ease: 'in' },
    // 燙到在手上拋下拋
    { at: 4.55, actor: 'sun', do: 'hop', amount: 12, dur: 0.28 },
    { at: 4.55, actor: 'ninja', do: 'shake', amount: 1.4, dur: 0.55 },
    { at: 4.85, actor: 'sun', do: 'hop', amount: 14, dur: 0.3 },
    // 一把丟出去：太陽轉著砸到畫面正中間
    { at: 5.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 5.15, actor: 'ninja', do: 'flip' },
    { at: 5.15, actor: 'sun', do: 'moveTo', to: { x: 80, y: 46 }, dur: 0.25, ease: 'in' },
    { at: 5.15, actor: 'sun', do: 'spin', times: -1, dur: 0.25 },
    { at: 5.4, actor: 'sun', do: 'vanish', dur: 0.1 },
    // 消防車被吵醒，噴水
    { at: 5.45, actor: 'truck', do: 'hop', amount: 4, dur: 0.3 },
    { at: 5.6, actor: 'truck', do: 'shake', amount: 0.8, dur: 0.8 },
    { at: 6.1, actor: 'ninja', do: 'flip' },
    { at: 6.1, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 6.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 6.5, actor: 'ninja', do: 'hop', amount: 5, dur: 0.35 },
    // 國字讓位：床跳出來，忍者一跳跳上床
    { at: 7.25, actor: 'bed', do: 'pop', dur: 0.35 },
    { at: 7.4, actor: 'ninja', do: 'moveTo', to: { x: 80, y: 54 }, arc: 14, dur: 0.5 },
    { at: 7.9, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 7.9, actor: 'bed', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 8.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    // 躺下來睡
    { at: 8.15, actor: 'ninja', do: 'rotateTo', amount: -85, dur: 0.2 },
    { at: 8.15, actor: 'ninja', do: 'moveTo', to: { x: 88, y: 59 }, dur: 0.2 },
    // 回馬槍：月亮冒出來照他，他又丟繩子——連人帶床被吊上天
    { at: 8.45, actor: 'moon', do: 'pop', dur: 0.3 },
    { at: 8.5, actor: 'moon', do: 'flash', dur: 0.5 },
    { at: 8.55, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 8.55, actor: 'ninja', do: 'rotateTo', amount: 85, dur: 0.12 },
    { at: 8.55, actor: 'ninja', do: 'moveTo', to: { x: 80, y: 54 }, dur: 0.12 },
    { at: 8.55, actor: 'ninja', do: 'hop', amount: 6, dur: 0.3 },
    { at: 8.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 9.0, actor: 'ninja', do: 'moveTo', to: { x: 128, y: 37 }, dur: 0.4, ease: 'back' },
    { at: 9.0, actor: 'bed', do: 'moveTo', to: { x: 128, y: 47 }, dur: 0.4, ease: 'back' },
    { at: 9.45, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 9.5, actor: 'bed', do: 'tilt', amount: 8, dur: 0.5 },
    { at: 9.5, actor: 'ninja', do: 'tilt', amount: 8, dur: 0.5 },
  ],
  builds: [
    // 太陽砸下去 → 日
    { at: 5.4, dur: 0.4, strokes: [0, 1, 2, 3], from: 'sun', color: '#F59F00' },
    // 消防車噴出來的水柱 → 免
    { at: 5.6, dur: 0.7, strokes: [4, 5, 6, 7, 8, 9, 10], from: 'truck', color: '#3B5BDB' },
  ],
  glyph: [
    { at: 6.3, dur: 0.4, do: 'wobble' },
    { at: 7.1, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'ninja', emoji: '🥱', dur: 0.5 },
    { at: 0.95, kind: 'sweat', actor: 'ninja' },
    { at: 1.2, kind: 'bubble', actor: 'ninja', emoji: '🌙', dur: 0.55 },
    { at: 1.95, dur: 0.75, kind: 'line', actor: 'ninja', dy: -4, target: 'sun', color: '#fff', width: 0.8 },
    { at: 2.25, kind: 'pop', actor: 'sun', emoji: '😏', dx: -14, dy: 14, dur: 0.5 },
    { at: 2.3, kind: 'sweat', actor: 'ninja' },
    { at: 3.15, kind: 'dizzy', actor: 'ninja', dur: 0.5 },
    { at: 4.15, kind: 'burst', actor: 'ninja', emoji: '🔥', n: 5, dur: 0.45 },
    { at: 4.55, kind: 'sweat', actor: 'ninja' },
    { at: 4.6, kind: 'stink', actor: 'ninja', dur: 0.7 },
    { at: 5.4, kind: 'burst', x: 80, y: 44, emoji: '✨', n: 8, dur: 0.6 },
    { at: 5.45, kind: 'pop', actor: 'truck', emoji: '❗', dx: -6, dur: 0.5 },
    { at: 5.6, kind: 'fountain', actor: 'truck', dx: -8, n: 8, dur: 0.9 },
    { at: 6.05, kind: 'rain', actor: 'ninja', emoji: '💧', dur: 0.6 },
    { at: 6.85, kind: 'pop', actor: 'ninja', emoji: '🥱', dur: 0.5 },
    { at: 7.95, kind: 'pop', actor: 'ninja', emoji: '👋', dx: -14, dy: 6, dur: 0.55 },
    { at: 8.2, dur: 0.4, kind: 'zzz', actor: 'ninja', dx: 8, dy: 6 },
    { at: 8.8, dur: 1.2, kind: 'line', actor: 'ninja', dy: -3, target: 'moon', color: '#fff', width: 0.8 },
    { at: 9.0, kind: 'pop', actor: 'truck', emoji: '😆', dx: -6, dur: 0.7 },
    { at: 9.45, dur: 0.55, kind: 'zzz', actor: 'ninja', dx: -14 },
  ],
  camera: [
    // 太陽砸下來那一下
    { at: 5.4, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    // 太陽砸下去那一刻白光一閃
    { at: 5.4, dur: 0.05, level: -0.45 },
    { at: 5.45, dur: 0.3, level: 0 },
    // 太陽變成字了，天就黑了
    { at: 6.3, dur: 0.8, level: 0.32 },
  ],
  cues: [
    { at: 1.25, say: '晚' },
    { at: 1.95, sfx: 'whoosh' },
    { at: 2.6, sfx: 'boing' },
    { at: 3.1, sfx: 'bonk' },
    { at: 3.85, sfx: 'whoosh' },
    { at: 4.15, sfx: 'hic' },
    { at: 4.55, sfx: 'tap' },
    { at: 4.85, sfx: 'tap' },
    { at: 5.15, sfx: 'whoosh' },
    { at: 5.4, sfx: 'crack' },
    { at: 5.6, sfx: 'splash' },
    { at: 6.3, say: '晚' },
    { at: 7.4, sfx: 'boing' },
    { at: 7.95, say: '晚安' },
    { at: 8.45, sfx: 'blip' },
    { at: 8.8, sfx: 'whoosh' },
    { at: 9.0, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
