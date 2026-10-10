import type { Clip } from '../clip'

// 露：熊去露營，搭好帳篷開心伸懶腰——一朵小雨雲飄過來，只下在牠頭上。熊往左跑，雲跟著；往右跑，雲也跟著！
// 熊鑽進帳篷躲雨，雲也硬擠進去，帳篷「噗」一聲噴出雨水和腳印，變成「露」。熊探出頭，雲在牠頭上又下了一點點。露、露、露營
const clip: Clip = {
  char: '露',
  meta: { theme: '露營', cast: '熊＋跟屁蟲雨雲＋帳篷', gags: ['雲只下在你頭上', '跑到哪跟到哪', '連帳篷都擠進來'] },
  duration: 10,
  bg: { top: '#CFEAFF', bottom: '#EEF8EE', floor: '#7FB069', scenery: 'forest' },
  actors: [
    { id: 'tent', emoji: '⛺', x: 144, y: 65, size: 28, hidden: true },
    { id: 'bear', emoji: '🐻', x: 96, y: 68.6, size: 20, hidden: true },
    { id: 'cloud', emoji: '🌧️', x: 96, y: 34, size: 18, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tent', do: 'pop' },
    { at: 0.1, actor: 'bear', do: 'enter', from: { x: -16, y: 68.6 }, dur: 0.9 },
    // 開心伸懶腰
    { at: 1.2, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.5 },
    // 小雨雲飄過來，只下在熊頭上
    { at: 1.9, actor: 'cloud', do: 'enter', from: { x: -20, y: 20 }, dur: 0.8 },
    { at: 2.8, actor: 'bear', do: 'squash', amount: 0.2, dur: 0.4 },
    // 往左跑——雲跟著
    { at: 3.5, actor: 'bear', do: 'flip' },
    { at: 3.55, actor: 'bear', do: 'moveTo', to: { x: 36, y: 68.6 }, dur: 0.45 },
    { at: 3.9, actor: 'cloud', do: 'moveTo', to: { x: 36, y: 34 }, dur: 0.45 },
    // 往右跑——雲也跟著
    { at: 4.8, actor: 'bear', do: 'flip' },
    { at: 4.85, actor: 'bear', do: 'moveTo', to: { x: 112, y: 68.6 }, dur: 0.45 },
    { at: 5.2, actor: 'cloud', do: 'moveTo', to: { x: 112, y: 34 }, dur: 0.45 },
    // 鑽進帳篷躲雨……雲也硬擠進去
    { at: 5.85, actor: 'bear', do: 'moveTo', to: { x: 144, y: 68.6 }, dur: 0.25 },
    { at: 6.05, actor: 'bear', do: 'vanish', dur: 0.15 },
    { at: 6.35, actor: 'cloud', do: 'moveTo', to: { x: 144, y: 58 }, dur: 0.3 },
    { at: 6.35, actor: 'cloud', do: 'scaleTo', amount: 0.4, dur: 0.3 },
    { at: 6.6, actor: 'cloud', do: 'vanish', dur: 0.1 },
    { at: 6.7, actor: 'tent', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 6.7, actor: 'tent', do: 'squash', amount: -0.25, dur: 0.4 },
    // 熊探出頭，雲又在頭上下一點點
    { at: 8.1, actor: 'bear', do: 'moveTo', to: { x: 125, y: 68.6 }, dur: 0.01 },
    { at: 8.12, actor: 'bear', do: 'pop', dur: 0.3 },
    { at: 8.5, actor: 'cloud', do: 'moveTo', to: { x: 126, y: 42 }, dur: 0.01 },
    { at: 8.52, actor: 'cloud', do: 'scaleTo', amount: 1.5, dur: 0.01 },
    { at: 8.55, actor: 'cloud', do: 'pop', dur: 0.3 },
  ],
  builds: [
    // 擠進帳篷的雨 → 上面的雨字頭；熊踩出來的濕腳印 → 下面的路
    { at: 6.75, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'tent', color: '#3D8BEF' },
    { at: 7.1, dur: 1.0, strokes: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], from: 'tent', color: '#8A5A3B' },
  ],
  glyph: [{ at: 8.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'pop', actor: 'bear', emoji: '😊', dur: 0.8 },
    { at: 2.7, kind: 'rain', actor: 'cloud', n: 7, dur: 0.9, dy: 6 },
    { at: 3.0, kind: 'pop', actor: 'bear', emoji: '😑', dur: 0.6 },
    { at: 4.35, kind: 'rain', actor: 'cloud', n: 7, dur: 0.8, dy: 6 },
    { at: 4.4, kind: 'sweat', actor: 'bear' },
    { at: 5.65, kind: 'rain', actor: 'cloud', n: 7, dur: 0.6, dy: 6 },
    { at: 5.7, kind: 'pop', actor: 'bear', emoji: '😫', dur: 0.4 },
    { at: 6.7, kind: 'burst', actor: 'tent', emoji: '💦', n: 8, dur: 0.6 },
    { at: 8.85, kind: 'rain', actor: 'cloud', n: 4, dur: 0.9, dy: 6 },
    { at: 9.0, kind: 'pop', actor: 'bear', emoji: '😑', dur: 0.8, dx: -12, dy: 4 },
  ],
  camera: [
    { at: 2.8, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 96, y: 54 } },
    { at: 6.7, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.25, say: '露' },
    { at: 2.7, sfx: 'splash' },
    { at: 3.55, sfx: 'whoosh' },
    { at: 4.35, sfx: 'splash' },
    { at: 4.85, sfx: 'whoosh' },
    { at: 5.65, sfx: 'splash' },
    { at: 6.05, sfx: 'slide' },
    { at: 6.7, sfx: 'poof' },
    { at: 8.2, say: '露' },
    { at: 9.1, say: '露營' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
