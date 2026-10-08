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
    { id: 'flamingo', emoji: '🦩', x: 128, y: 70.3, size: 16, hidden: true },
    { id: 'seal', emoji: '🦭', x: 146, y: 71.1, size: 14, hidden: true },
    { id: 'frog', emoji: '🐸', x: 22, y: 44, size: 12, hidden: true },
    { id: 'goggles', emoji: '🥽', x: 34, y: 68, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'frog', do: 'enter', from: { x: 22, y: 72 }, dur: 0.8 },
    { at: 0.2, actor: 'flamingo', do: 'pop' },
    { at: 0.3, actor: 'seal', do: 'pop' },
    { at: 0.9, actor: 'frog', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 第一跳：肚子先落水
    { at: 1.5, actor: 'frog', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.8, actor: 'frog', do: 'moveTo', to: { x: 64, y: 72 }, arc: 14, dur: 0.55 },
    { at: 1.8, actor: 'frog', do: 'rotateTo', amount: 90, dur: 0.55 },
    { at: 2.35, actor: 'frog', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 3.0, actor: 'frog', do: 'rotateTo', amount: -90, dur: 0.2 },
    { at: 3.1, actor: 'frog', do: 'moveTo', to: { x: 22, y: 44 }, arc: 10, dur: 0.5 },
    // 第二跳：蓄力太猛，飛出畫面
    { at: 3.7, actor: 'frog', do: 'squash', amount: -0.5, dur: 0.4 },
    { at: 3.7, actor: 'frog', do: 'flash', dur: 0.4 },
    { at: 4.1, actor: 'frog', do: 'moveTo', to: { x: 40, y: -20 }, dur: 0.35 },
    // 掉回來：轟！
    { at: 4.9, actor: 'frog', do: 'moveTo', to: { x: 80, y: 72 }, dur: 0.25 },
    { at: 5.2, actor: 'frog', do: 'vanish', dur: 0.1 },
    { at: 5.2, actor: 'flamingo', do: 'hop', amount: 6, dur: 0.35 },
    { at: 5.25, actor: 'seal', do: 'hop', amount: 6, dur: 0.35 },
    // 從左邊冒出來，戴上蛙鏡
    { at: 6.8, actor: 'frog', do: 'moveTo', to: { x: 34, y: 71.5 }, dur: 0.01 },
    { at: 6.85, actor: 'frog', do: 'pop' },
    { at: 7.45, actor: 'goggles', do: 'pop', dur: 0.3 },
    // 兩個 10 分！
    { at: 8.2, actor: 'frog', do: 'hop', amount: 6, dur: 0.4 },
    { at: 8.2, actor: 'goggles', do: 'hop', amount: 6, dur: 0.4 },
    // 海豹悄悄滑進水裡
    { at: 8.6, actor: 'seal', do: 'moveTo', to: { x: 118, y: 72 }, dur: 0.35 },
    { at: 8.95, actor: 'seal', do: 'vanish', dur: 0.2 },
  ],
  builds: [
    // 超大水花噴起來
    { at: 5.3, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: { x: 80, y: 68 }, color: '#2FA44F' },
    { at: 5.8, dur: 0.7, strokes: [6, 7, 8, 9, 10, 11], from: { x: 80, y: 68 }, color: '#1C7FD6' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'pop', actor: 'frog', emoji: '💪', dur: 0.5 },
    { at: 2.35, kind: 'fountain', actor: 'frog', emoji: '💦', n: 9, dur: 0.8 },
    { at: 2.7, kind: 'pop', actor: 'flamingo', emoji: '2️⃣', dur: 0.8 },
    { at: 2.75, kind: 'pop', actor: 'seal', emoji: '1️⃣', dur: 0.8 },
    { at: 2.8, kind: 'sweat', actor: 'frog' },
    { at: 4.45, kind: 'pop', actor: 'flamingo', emoji: '❓', dur: 0.5 },
    { at: 4.5, kind: 'pop', actor: 'seal', emoji: '❓', dur: 0.5 },
    { at: 5.15, kind: 'fountain', actor: 'frog', emoji: '💦', n: 12, dur: 1.0 },
    { at: 5.15, kind: 'burst', actor: 'frog', emoji: '💧', n: 8, dur: 0.6 },
    { at: 7.45, kind: 'burst', actor: 'goggles', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.0, kind: 'pop', actor: 'flamingo', emoji: '🔟', dur: 0.9 },
    { at: 8.05, kind: 'pop', actor: 'seal', emoji: '🔟', dur: 0.5 },
    { at: 9.15, kind: 'pop', actor: 'flamingo', emoji: '💯', dur: 0.8 },
    { at: 9.25, kind: 'pop', actor: 'frog', emoji: '😑', dur: 0.7 },
  ],
  camera: [
    { at: 2.35, dur: 0.3, do: 'shake', amount: 1 },
    { at: 5.15, dur: 0.6, do: 'shake', amount: 2.5 },
  ],
  cues: [
    { at: 1.2, say: '蛙' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 2.35, sfx: 'splash' },
    { at: 2.7, sfx: 'blip' },
    { at: 4.1, sfx: 'boing' },
    { at: 4.9, sfx: 'whoosh' },
    { at: 5.15, sfx: 'splash' },
    { at: 6.55, say: '蛙' },
    { at: 7.55, say: '蛙鏡' },
    { at: 8.0, sfx: 'blip' },
    { at: 8.6, sfx: 'slide' },
    { at: 9.0, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
