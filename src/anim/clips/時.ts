import type { Clip } from '../clip'

// 時：倉鼠要搭火車，時鐘滴答滴答，火車準時要開了！倉鼠拚命跑，跑太急跌一跤；爬起來繼續衝——火車門正要關，
// 倉鼠飛撲過去……火車開走了，時鐘的齒輪和指針飛成「時」。倉鼠坐在地上哭——原來牠跑錯月台，自己的火車剛好開進來。時、時、準時
const clip: Clip = {
  char: '時',
  meta: { theme: '趕火車', cast: '倉鼠＋火車＋時鐘', gags: ['越急越跌倒', '差一點點', '原來跑錯邊'] },
  duration: 10,
  bg: { top: '#E3EEFF', bottom: '#F6F9FF', floor: '#9AA5B1', scenery: 'city' },
  actors: [
    { id: 'clock', emoji: '⏰', x: 80, y: 22, size: 14, hidden: true, float: true },
    { id: 'train', emoji: '🚃', x: 126, y: 64, size: 32, hidden: true },
    { id: 'train2', emoji: '🚃', x: 34, y: 64, size: 32, hidden: true },
    { id: 'ham', emoji: '🐹', x: 20, y: 71, size: 15, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'train', do: 'pop' },
    { at: 0.1, actor: 'clock', do: 'pop' },
    { at: 0.3, actor: 'clock', do: 'shake', amount: 1, dur: 1.2 },
    { at: 0.2, actor: 'ham', do: 'enter', from: { x: -12, y: 71 }, dur: 0.6 },
    // 拚命跑——跌一跤
    { at: 1.6, actor: 'ham', do: 'moveTo', to: { x: 56, y: 71 }, dur: 0.5 },
    { at: 2.1, actor: 'ham', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 2.1, actor: 'ham', do: 'moveTo', to: { x: 62, y: 73 }, dur: 0.2 },
    { at: 2.9, actor: 'ham', do: 'rotateTo', amount: -90, dur: 0.2 },
    { at: 2.9, actor: 'ham', do: 'moveTo', to: { x: 62, y: 71 }, dur: 0.2 },
    // 爬起來繼續衝——飛撲
    { at: 3.4, actor: 'clock', do: 'shake', amount: 2, dur: 0.8 },
    { at: 3.6, actor: 'ham', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 3.85, actor: 'ham', do: 'moveTo', to: { x: 106, y: 66 }, dur: 0.4, arc: 10 },
    // 火車開走了
    { at: 4.15, actor: 'train', do: 'moveTo', to: { x: 200, y: 64 }, dur: 0.6 },
    { at: 4.25, actor: 'ham', do: 'moveTo', to: { x: 122, y: 71 }, dur: 0.2 },
    { at: 4.45, actor: 'ham', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.9, actor: 'clock', do: 'vanish', dur: 0.2 },
    // 坐在地上哭
    { at: 6.3, actor: 'ham', do: 'shake', amount: 0.8, dur: 0.8 },
    // 原來跑錯月台——自己的火車從另一邊開進來
    { at: 7.6, actor: 'train2', do: 'enter', from: { x: -30, y: 64 }, dur: 0.8 },
    { at: 8.5, actor: 'ham', do: 'flip' },
    { at: 8.6, actor: 'ham', do: 'hop', amount: 8, dur: 0.4 },
  ],
  builds: [
    // 時鐘飛出來的齒輪 → 日；指針 → 寺
    { at: 4.9, dur: 0.5, strokes: [0, 1, 2, 3], from: 'clock', color: '#3D7DD8' },
    { at: 5.25, dur: 0.8, strokes: [4, 5, 6, 7, 8, 9], from: 'clock', color: '#E86A33' },
  ],
  glyph: [{ at: 6.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'ham', emoji: '🚃', dur: 0.6 },
    { at: 2.2, kind: 'dizzy', actor: 'ham', dur: 0.7 },
    { at: 3.5, kind: 'sweat', actor: 'ham' },
    { at: 4.5, kind: 'pop', actor: 'ham', emoji: '😱', dur: 0.6 },
    { at: 4.9, kind: 'burst', actor: 'clock', emoji: '⚙️', n: 6, dur: 0.6 },
    { at: 6.3, kind: 'rain', actor: 'ham', emoji: '💧', n: 4, dur: 0.9, dy: 4 },
    { at: 8.6, kind: 'pop', actor: 'ham', emoji: '😳', dur: 0.8 },
  ],
  camera: [
    { at: 3.85, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 108, y: 62 } },
  ],
  cues: [
    { at: 0.3, sfx: 'tap' },
    { at: 0.95, say: '時' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.1, sfx: 'plop' },
    { at: 3.4, sfx: 'tap' },
    { at: 3.85, sfx: 'whoosh' },
    { at: 4.15, sfx: 'rumble' },
    { at: 4.45, sfx: 'bonk' },
    { at: 6.15, say: '時' },
    { at: 7.6, sfx: 'rumble' },
    { at: 8.65, say: '準時' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
