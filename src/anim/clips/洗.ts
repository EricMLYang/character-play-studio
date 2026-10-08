import type { Clip } from '../clip'

// 洗：水獺開洗車場，來了一台超髒的車。水太小只滴兩滴，水太大把車沖得轉圈飛走，最後整台埋進泡泡裡搓搓搓——
// 沖乾淨閃閃發亮，水和泡泡變成「洗」。水獺累到自己跳進浴缸洗澡；車子開走，馬上又倒車回來——更髒了。洗、洗、洗澡
const clip: Clip = {
  char: '洗',
  meta: { theme: '洗車場', cast: '水獺＋髒車子', gags: ['水太小又太大', '車子被沖到轉圈', '埋進泡泡', '洗完又弄髒'] },
  duration: 10,
  bg: { top: '#E4F6FF', bottom: '#CDE7F7', floor: '#9AA7B3', scenery: 'city' },
  actors: [
    { id: 'car', emoji: '🚙', x: 80, y: 69.4, size: 18, hidden: true, flip: true, tint: 'sepia(1) brightness(.5)' },
    { id: 'clean', emoji: '🚙', x: 34, y: 69.4, size: 18, hidden: true, flip: true },
    { id: 'foam', emoji: '☁️', x: 34, y: 66, size: 26, hidden: true, float: true },
    { id: 'otter', emoji: '🦦', x: 134, y: 71.5, size: 13, hidden: true },
    { id: 'tub', emoji: '🛁', x: 138, y: 70.3, size: 16, hidden: true },
    { id: 'hose', emoji: '🚿', x: 124, y: 60, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'car', do: 'enter', from: { x: -20, y: 69.4 }, dur: 0.9 },
    { at: 0.9, actor: 'car', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 0.2, actor: 'otter', do: 'pop' },
    { at: 0.35, actor: 'hose', do: 'pop' },
    // 水太小
    { at: 1.4, actor: 'hose', do: 'shake', amount: 0.6, dur: 0.8 },
    // 水太大：車子被沖得轉圈飛走
    { at: 2.6, actor: 'otter', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 2.9, actor: 'hose', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 2.95, actor: 'car', do: 'moveTo', to: { x: 34, y: 69.4 }, dur: 0.45 },
    { at: 2.95, actor: 'car', do: 'spin', times: 1, dur: 0.45 },
    // 埋進泡泡裡搓搓搓
    { at: 3.8, actor: 'otter', do: 'moveTo', to: { x: 58, y: 71.5 }, dur: 0.3, arc: 4 },
    { at: 3.8, actor: 'hose', do: 'moveTo', to: { x: 50, y: 60 }, dur: 0.3, arc: 4 },
    { at: 4.0, actor: 'foam', do: 'pop', dur: 0.3 },
    { at: 4.2, actor: 'foam', do: 'shake', amount: 1.5, dur: 0.7 },
    { at: 4.2, actor: 'otter', do: 'shake', amount: 1.5, dur: 0.7 },
    // 沖乾淨
    { at: 5.0, actor: 'foam', do: 'vanish', dur: 0.3 },
    { at: 5.0, actor: 'car', do: 'vanish', dur: 0.05 },
    { at: 5.0, actor: 'clean', do: 'pop', dur: 0.05 },
    { at: 5.1, actor: 'clean', do: 'flash', dur: 0.8 },
    { at: 5.1, actor: 'otter', do: 'moveTo', to: { x: 128, y: 71.5 }, dur: 0.4, arc: 6 },
    { at: 5.1, actor: 'hose', do: 'moveTo', to: { x: 138, y: 50 }, dur: 0.4, arc: 6 },
    // 水獺自己跳進浴缸
    { at: 6.6, actor: 'tub', do: 'pop' },
    { at: 6.9, actor: 'otter', do: 'moveTo', to: { x: 138, y: 66 }, dur: 0.4, arc: 10 },
    { at: 7.3, actor: 'tub', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.5, actor: 'otter', do: 'bounce', dur: 0.6, times: 2, amount: 1.5 },
    // 車子開走……倒車回來，更髒了
    { at: 8.2, actor: 'clean', do: 'flip' },
    { at: 8.3, actor: 'clean', do: 'moveTo', to: { x: -25, y: 69.4 }, dur: 0.4 },
    { at: 8.85, actor: 'car', do: 'enter', from: { x: -25, y: 69.4 }, dur: 0.35 },
    { at: 9.2, actor: 'car', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 9.3, actor: 'otter', do: 'moveTo', to: { x: 138, y: 70 }, dur: 0.3 },
  ],
  builds: [
    // 沖下來的水 → 三點水；泡泡 → 先
    { at: 4.9, dur: 0.6, strokes: [0, 1, 2], from: { x: 60, y: 10 }, style: 'drop', color: '#2A9FDF' },
    { at: 5.2, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'foam', color: '#E04F8C' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'stink', actor: 'car', dur: 1.4 },
    { at: 1.0, kind: 'pop', actor: 'otter', emoji: '😖', dur: 0.5 },
    { at: 1.4, kind: 'line', actor: 'hose', target: 'car', color: '#7FD3FF', width: 0.8, dur: 0.8, dx: -3 },
    { at: 1.6, kind: 'rain', actor: 'car', n: 3, dur: 0.6 },
    { at: 2.25, kind: 'bubble', actor: 'otter', emoji: '😑', dur: 0.4 },
    { at: 2.9, kind: 'line', actor: 'hose', target: 'car', color: '#4FC3F7', width: 3.5, dur: 0.6, dx: -3 },
    { at: 3.0, kind: 'burst', actor: 'car', emoji: '💧', n: 7, dur: 0.5 },
    { at: 3.5, kind: 'sweat', actor: 'otter' },
    { at: 4.0, kind: 'burst', actor: 'foam', emoji: '🫧', n: 8, dur: 0.7 },
    { at: 4.6, kind: 'burst', actor: 'foam', emoji: '🫧', n: 8, dur: 0.6 },
    { at: 4.8, kind: 'rain', actor: 'foam', n: 8, dur: 0.6, dy: -4 },
    { at: 5.2, kind: 'burst', actor: 'clean', emoji: '✨', n: 6, dur: 0.7 },
    { at: 5.9, kind: 'sweat', actor: 'otter' },
    { at: 7.2, kind: 'rain', actor: 'hose', n: 6, dur: 1.0 },
    { at: 7.3, kind: 'burst', actor: 'tub', emoji: '🫧', n: 7, dur: 0.7 },
    { at: 9.15, kind: 'burst', actor: 'car', emoji: '🟤', n: 6, dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'otter', emoji: '😱', dur: 0.6, dx: -12, dy: 4 },
    { at: 9.3, kind: 'stink', actor: 'car', dur: 0.7 },
  ],
  camera: [
    { at: 2.95, dur: 0.4, do: 'shake', amount: 1.5 },
    { at: 5.0, dur: 0.7, do: 'punch', amount: 0.2, to: { x: 40, y: 64 } },
  ],
  cues: [
    { at: 0.1, sfx: 'rumble' },
    { at: 1.4, sfx: 'splash' },
    { at: 1.55, say: '洗' },
    { at: 2.9, sfx: 'splash' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 4.0, sfx: 'bubble' },
    { at: 4.8, sfx: 'splash' },
    { at: 5.15, sfx: 'blip' },
    { at: 6.25, say: '洗' },
    { at: 7.3, sfx: 'bubble' },
    { at: 7.35, say: '洗澡' },
    { at: 8.3, sfx: 'whoosh' },
    { at: 8.9, sfx: 'splash' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
