import type { Clip } from '../clip'

// 蛙：青蛙參加跳水比賽。第一跳肚子先落水「啪」，裁判給 2 分、1 分；第二跳蓄力太猛，直接飛出畫面不見了，
// 大家抬頭找……「轟」地掉回來，大水花變成「蛙」。青蛙戴上蛙鏡拿到兩個 10 分，海豹裁判卻悄悄滑進水裡、一點水花都沒有，拿到 100 分。蛙、蛙、蛙鏡
const clip: Clip = {
  char: '蛙',
  meta: { theme: '游泳池跳水', cast: '青蛙＋紅鶴裁判＋海豹裁判', gags: ['肚子先落水', '跳太高不見了', '超大水花', '海豹沒水花贏了'] },
  duration: 10,
  bg: { top: '#E4F7FF', bottom: '#C8ECFA', floor: '#4DB8E0', scenery: 'room' },
  actors: [
    { id: 'ladder', emoji: '🪜', x: 22, y: 64.4, size: 30 },
    { id: 'flamingo', emoji: '🦩', x: 128, y: 68.6, size: 20, hidden: true },
    { id: 'seal', emoji: '🦭', x: 146, y: 69.6, size: 17.5, hidden: true },
    { id: 'frog', emoji: '🐸', x: 22, y: 44, size: 15, hidden: true },
    { id: 'goggles', emoji: '🥽', x: 34, y: 68, size: 8.8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'frog', do: 'enter', from: { x: 22, y: 72 }, dur: 0.8 },
    { at: 0.2, actor: 'flamingo', do: 'pop' },
    { at: 0.3, actor: 'seal', do: 'pop' },
    { at: 0.9, actor: 'frog', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 第一跳：肚子先落水
    { at: 1.52, actor: 'frog', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.84, actor: 'frog', do: 'moveTo', to: { x: 64, y: 72 }, arc: 14, dur: 0.55 },
    { at: 1.84, actor: 'frog', do: 'rotateTo', amount: 90, dur: 0.55 },
    { at: 2.43, actor: 'frog', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 3.13, actor: 'frog', do: 'rotateTo', amount: -90, dur: 0.2 },
    { at: 3.24, actor: 'frog', do: 'moveTo', to: { x: 22, y: 44 }, arc: 10, dur: 0.5 },
    // 第二跳：蓄力太猛，飛出畫面
    { at: 3.88, actor: 'frog', do: 'squash', amount: -0.5, dur: 0.4 },
    { at: 3.88, actor: 'frog', do: 'flash', dur: 0.4 },
    { at: 4.31, actor: 'frog', do: 'moveTo', to: { x: 40, y: -20 }, dur: 0.35 },
    // 掉回來：轟！
    { at: 5.17, actor: 'frog', do: 'moveTo', to: { x: 80, y: 72 }, dur: 0.25 },
    { at: 5.49, actor: 'frog', do: 'vanish', dur: 0.1 },
    { at: 5.49, actor: 'flamingo', do: 'hop', amount: 6, dur: 0.35 },
    { at: 5.55, actor: 'seal', do: 'hop', amount: 6, dur: 0.35 },
    // 從左邊冒出來，戴上蛙鏡
    { at: 7.1, actor: 'frog', do: 'moveTo', to: { x: 34, y: 71.5 }, dur: 0.01 },
    { at: 7.15, actor: 'frog', do: 'pop' },
    { at: 7.75, actor: 'goggles', do: 'pop', dur: 0.3 },
    // 兩個 10 分！
    { at: 8.42, actor: 'frog', do: 'hop', amount: 6, dur: 0.4 },
    { at: 8.42, actor: 'goggles', do: 'hop', amount: 6, dur: 0.4 },
    // 海豹悄悄滑進水裡
    { at: 8.77, actor: 'seal', do: 'moveTo', to: { x: 118, y: 72 }, dur: 0.35 },
    { at: 9.08, actor: 'seal', do: 'vanish', dur: 0.2 },
  ],
  builds: [
    // 超大水花噴起來
    { at: 5.6, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: { x: 80, y: 68 }, color: '#2FA44F' },
    { at: 6.1, dur: 0.7, strokes: [6, 7, 8, 9, 10, 11], from: { x: 80, y: 68 }, color: '#1C7FD6' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'pop', actor: 'frog', emoji: '💪', dur: 0.5 },
    { at: 2.43, kind: 'fountain', actor: 'frog', emoji: '💦', n: 9, dur: 0.8 },
    { at: 2.81, kind: 'pop', actor: 'flamingo', emoji: '2️⃣', dur: 0.8 },
    { at: 2.86, kind: 'pop', actor: 'seal', emoji: '1️⃣', dur: 0.8 },
    { at: 2.92, kind: 'sweat', actor: 'frog' },
    { at: 4.69, kind: 'pop', actor: 'flamingo', emoji: '❓', dur: 0.5 },
    { at: 4.74, kind: 'pop', actor: 'seal', emoji: '❓', dur: 0.5 },
    { at: 5.44, kind: 'fountain', actor: 'frog', emoji: '💦', n: 12, dur: 1.0 },
    { at: 5.44, kind: 'burst', actor: 'frog', emoji: '💧', n: 8, dur: 0.6 },
    { at: 7.75, kind: 'burst', actor: 'goggles', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.24, kind: 'pop', actor: 'flamingo', emoji: '🔟', dur: 0.9 },
    { at: 8.29, kind: 'pop', actor: 'seal', emoji: '🔟', dur: 0.5 },
    { at: 9.25, kind: 'pop', actor: 'flamingo', emoji: '💯', dur: 0.8 },
    { at: 9.34, kind: 'pop', actor: 'frog', emoji: '😑', dur: 0.7 },
  ],
  camera: [
    { at: 2.43, dur: 0.3, do: 'shake', amount: 1 },
    { at: 5.44, dur: 0.6, do: 'shake', amount: 2.5 },
  ],
  cues: [
    { at: 1.2, say: '蛙' },
    { at: 1.84, sfx: 'whoosh' },
    { at: 2.43, sfx: 'splash' },
    { at: 2.81, sfx: 'blip' },
    { at: 4.31, sfx: 'boing' },
    { at: 5.17, sfx: 'whoosh' },
    { at: 5.44, sfx: 'splash' },
    { at: 6.85, say: '蛙' },
    { at: 7.85, say: '蛙鏡' },
    { at: 8.24, sfx: 'blip' },
    { at: 8.77, sfx: 'slide' },
    { at: 9.12, sfx: 'plop' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
