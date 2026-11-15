import type { Clip } from '../clip'

// 粥：調皮小老鼠從大鍋裡拉出一條黏黏的白粥絲，拉布拉多警長吹著哨子衝過來——衝過頭又倒回來，抓住另一端要沒收，兩個拔河越拉越後仰；
// 粥絲「啵」一聲斷掉，兩個摔坐在地，回彈的兩段捲成左右兩個「弓」，翻倒的鍋子噴出米粒落成中間的「米」。小老鼠捧著一碗白粥開心地喝。粥、粥、白粥
const clip: Clip = {
  char: '粥',
  meta: { theme: '粥絲拔河', cast: '調皮小老鼠＋拉布拉多警長＋大鍋粥', gags: ['衝過頭再倒回來', '黏黏粥絲拔河', '斷掉兩邊摔屁股'] },
  duration: 10,
  bg: { top: '#DDF5E8', bottom: '#F2FBF5', floor: '#F3E6CB', scenery: 'room' },
  actors: [
    { id: 'pot', emoji: '🍲', x: 80, y: 67, size: 20 },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 62, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'sheriff', emoji: 'hero:sheriff/run', x: 180, y: 71, size: 14, hidden: true },
    { id: 'bowl', emoji: '🥣', x: 27, y: 66, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 小老鼠從鍋邊冒出來，舔舔嘴，拉出一條長長的粥絲
    { at: 0.15, actor: 'mouse', do: 'pop' },
    { at: 0.5, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.85, actor: 'mouse', do: 'moveTo', to: { x: 44, y: 71.5 }, dur: 0.7, ease: 'out' },
    { at: 0.85, actor: 'mouse', do: 'rotateTo', amount: -12, dur: 0.4 },
    // 嗶！警長衝進來，衝過頭，倒回來
    { at: 1.75, actor: 'sheriff', do: 'pop', dur: 0.01 },
    { at: 1.75, actor: 'sheriff', do: 'moveTo', to: { x: 66, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 1.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 2.3, actor: 'sheriff', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.6, actor: 'sheriff', do: 'moveTo', to: { x: 104, y: 71 }, dur: 0.35, ease: 'back' },
    { at: 2.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 拔河：越拉越後仰
    { at: 3.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 3.0, actor: 'mouse', do: 'moveTo', to: { x: 26, y: 71.5 }, dur: 1.2, ease: 'out' },
    { at: 3.0, actor: 'mouse', do: 'rotateTo', amount: -8, dur: 0.6 },
    { at: 3.0, actor: 'sheriff', do: 'moveTo', to: { x: 134, y: 71 }, dur: 1.2, ease: 'out' },
    { at: 3.0, actor: 'sheriff', do: 'rotateTo', amount: 18, dur: 0.6 },
    { at: 3.4, actor: 'sheriff', do: 'tint', filter: 'sepia(.3) saturate(2) hue-rotate(-20deg)' },
    { at: 3.3, actor: 'mouse', do: 'shake', amount: 0.8, dur: 1.2 },
    { at: 3.3, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 1.2 },
    // 啵！斷掉，兩邊摔屁股
    { at: 4.6, actor: 'mouse', do: 'rotateTo', amount: 20, dur: 0.25 },
    { at: 4.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 4.6, actor: 'mouse', do: 'moveTo', to: { x: 16, y: 71.5 }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'sheriff', do: 'rotateTo', amount: -18, dur: 0.25 },
    { at: 4.6, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 4.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.6, actor: 'sheriff', do: 'moveTo', to: { x: 144, y: 71 }, dur: 0.35, ease: 'out' },
    { at: 4.95, actor: 'mouse', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.95, actor: 'sheriff', do: 'squash', amount: 0.35, dur: 0.3 },
    // 鍋子翻倒，米粒噴上天
    { at: 4.9, actor: 'pot', do: 'rotateTo', amount: 50, dur: 0.25, ease: 'back' },
    { at: 5.15, actor: 'pot', do: 'vanish', dur: 0.4 },
    // 小老鼠捧著一碗白粥
    { at: 6.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 6.65, actor: 'bowl', do: 'pop' },
    { at: 7.2, actor: 'bowl', do: 'tilt', amount: -25, dur: 0.5 },
    { at: 7.2, actor: 'mouse', do: 'squash', amount: 0.12, dur: 0.5 },
    { at: 7.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    // 回馬槍：小老鼠抱著碗踮腳偷溜——警長一吹哨，他頭也不回溜得更快
    { at: 8.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 8.3, actor: 'mouse', do: 'flip' },
    { at: 8.35, actor: 'bowl', do: 'moveTo', to: { x: 8, y: 66 }, dur: 0.5 },
    { at: 8.35, actor: 'mouse', do: 'moveTo', to: { x: 12, y: 71.5 }, dur: 0.5 },
    { at: 8.9, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.1, actor: 'mouse', do: 'moveTo', to: { x: -14, y: 71.5 }, dur: 0.4, ease: 'in' },
    { at: 9.1, actor: 'bowl', do: 'moveTo', to: { x: -18, y: 66 }, dur: 0.4, ease: 'in' },
    { at: 9.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  ],
  builds: [
    // 回彈的兩段粥絲捲成左右兩個弓
    { at: 4.65, dur: 0.45, strokes: [0, 1, 2], from: 'mouse', color: '#862E9C' },
    { at: 4.75, dur: 0.45, strokes: [9, 10, 11], from: 'sheriff', color: '#862E9C' },
    // 鍋子噴出的米粒落成中間的米
    { at: 5.2, dur: 0.8, strokes: [3, 4, 5, 6, 7, 8], from: 'pot', color: '#A61E4D' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'pop', actor: 'mouse', emoji: '😋', dur: 0.6 },
    // 黏黏的粥絲：先從鍋子拉到小老鼠，再被警長抓住另一端
    { at: 0.85, dur: 2.15, kind: 'line', actor: 'pot', dy: -6, target: 'mouse', color: '#F8F9FA', width: 1.8 },
    { at: 3.0, dur: 1.6, kind: 'line', actor: 'mouse', target: 'sheriff', color: '#F8F9FA', width: 1.4 },
    { at: 1.7, kind: 'pop', x: 150, y: 50, emoji: '📢', dur: 0.5 },
    { at: 2.3, kind: 'puff', actor: 'sheriff' },
    { at: 2.35, kind: 'pop', actor: 'sheriff', emoji: '❗', dur: 0.4 },
    { at: 3.6, kind: 'sweat', actor: 'sheriff' },
    { at: 4.2, kind: 'sweat', actor: 'mouse' },
    { at: 4.6, kind: 'burst', x: 80, y: 60, emoji: '💥', dur: 0.4 },
    { at: 4.95, kind: 'puff', actor: 'mouse' },
    { at: 4.95, kind: 'puff', actor: 'sheriff' },
    { at: 5.0, dur: 0.8, kind: 'fountain', actor: 'pot', emoji: '🍚', n: 7 },
    { at: 5.2, kind: 'dizzy', actor: 'sheriff', dur: 1.8 },
    { at: 5.2, kind: 'dizzy', actor: 'mouse', dur: 1.0 },
    { at: 7.25, kind: 'pop', actor: 'mouse', emoji: '😋', dur: 0.7 },
    { at: 7.55, kind: 'pop', actor: 'sheriff', emoji: '🫡', dur: 0.6 },
    { at: 8.85, kind: 'pop', actor: 'sheriff', emoji: '🎵', dur: 0.5 },
    { at: 9.55, kind: 'pop', actor: 'sheriff', emoji: '❓', dur: 0.45 },
  ],
  camera: [
    // 粥絲快斷的那一下推近
    { at: 3.9, dur: 0.7, do: 'zoom', amount: 1.15, to: { x: 80, y: 60 } },
    { at: 4.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.62, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.1, say: '粥' },
    { at: 1.7, sfx: 'blip' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 2.3, sfx: 'slide' },
    { at: 3.3, sfx: 'slide' },
    { at: 4.6, sfx: 'boing' },
    { at: 4.95, sfx: 'plop' },
    { at: 6.1, say: '粥' },
    { at: 6.75, say: '白粥' },
    { at: 7.2, sfx: 'gulp' },
    { at: 8.85, sfx: 'blip' },
    { at: 9.1, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
