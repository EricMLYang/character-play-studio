import type { Clip } from '../clip'

// 窗：小鳥在窗外看到玻璃裡的自己，以為是壞蛋，叩叩叩啄窗戶，再退後衝過去——啪！扁在玻璃上滑下來。第二次衝更快，貓剛好把窗打開，
// 小鳥直接飛過整個房間摔進盆栽，窗框和羽毛變成「窗」。貓把窗戶關好；小鳥想出去，又一頭撞上關好的窗。窗、窗、窗戶
const clip: Clip = {
  char: '窗',
  meta: { theme: '窗邊小鳥', cast: '小鳥＋貓＋窗戶＋盆栽', gags: ['以為倒影是敵人', '撞玻璃滑下來', '剛好開窗飛過頭', '從裡面又撞一次'] },
  duration: 10,
  bg: { top: '#E6F5EC', bottom: '#FFF6E6', floor: '#D6B08A', scenery: 'room' },
  actors: [
    { id: 'pot', emoji: '🪴', x: 22, y: 69.1, size: 18.8 },
    { id: 'win', emoji: '🪟', x: 130, y: 36, size: 26, float: true },
    { id: 'cat', emoji: '🐈', x: 132, y: 69.6, size: 17.5, hidden: true },
    { id: 'bird', emoji: '🐦', x: 146, y: 32, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cat', do: 'pop' },
    { at: 0.3, actor: 'bird', do: 'enter', from: { x: 180, y: 10 }, dur: 0.6 },
    // 叩叩叩：以為玻璃裡的是壞蛋
    { at: 1, actor: 'bird', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 1.31, actor: 'bird', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 1.64, actor: 'bird', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 1.31, actor: 'win', do: 'shake', dur: 0.4, amount: 0.4 },
    // 退後、衝——啪！扁在玻璃上
    { at: 2.29, actor: 'bird', do: 'moveTo', to: { x: 153, y: 28 }, dur: 0.4 },
    { at: 2.83, actor: 'bird', do: 'moveTo', to: { x: 136, y: 36 }, dur: 0.15 },
    { at: 3, actor: 'bird', do: 'squash', amount: 0.6, dur: 0.5 },
    { at: 3, actor: 'win', do: 'shake', dur: 0.4, amount: 1 },
    { at: 3.27, actor: 'bird', do: 'moveTo', to: { x: 136, y: 50 }, dur: 0.6 },
    // 飛遠一點蓄力
    { at: 4.14, actor: 'bird', do: 'moveTo', to: { x: 175, y: 18 }, dur: 0.4 },
    // 貓剛好把窗打開
    { at: 4.57, actor: 'cat', do: 'hop', dur: 0.4, amount: 14 },
    { at: 4.79, actor: 'win', do: 'vanish', dur: 0.2 },
    // 小鳥衝進來，飛過整個房間摔進盆栽
    { at: 4.9, actor: 'bird', do: 'moveTo', to: { x: 24, y: 60 }, dur: 0.5 },
    { at: 5.4, actor: 'bird', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 5.4, actor: 'pot', do: 'shake', dur: 0.4, amount: 1.2 },
    // 貓把窗關好
    { at: 7.2, actor: 'cat', do: 'hop', dur: 0.4, amount: 12 },
    { at: 7.35, actor: 'win', do: 'pop', dur: 0.35 },
    // 回馬槍：想出去，又撞上
    { at: 8.14, actor: 'bird', do: 'flip' },
    { at: 8.23, actor: 'bird', do: 'moveTo', to: { x: 116, y: 38 }, dur: 0.7, arc: 40 },
    { at: 8.85, actor: 'bird', do: 'squash', amount: 0.6, dur: 0.5 },
    { at: 8.85, actor: 'win', do: 'shake', dur: 0.4, amount: 1 },
    { at: 9.12, actor: 'bird', do: 'moveTo', to: { x: 116, y: 52 }, dur: 0.6 },
    { at: 9.2, actor: 'cat', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 打開的窗框 → 穴；撞散的羽毛 → 囪
    { at: 4.9, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: { x: 130, y: 36 }, color: '#2A9D8F' },
    { at: 5.5, dur: 0.9, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'bird', color: '#E2553F' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 8.89, dur: 0.4, do: 'shake' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'cat', dur: 2.4 },
    { at: 0.85, kind: 'pop', actor: 'bird', emoji: '😠', dur: 0.5 },
    { at: 1.96, kind: 'bubble', actor: 'bird', emoji: '🐦', dur: 0.5, dx: -12 },
    { at: 3, kind: 'burst', actor: 'bird', emoji: '💥', dur: 0.4, dx: -3 },
    { at: 3.38, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.6 },
    { at: 3.92, kind: 'dizzy', actor: 'bird', dur: 0.4 },
    { at: 4.57, kind: 'pop', actor: 'cat', emoji: '💡', dur: 0.4, dx: -12 },
    { at: 5.4, kind: 'burst', actor: 'pot', emoji: '🪶', n: 6, dur: 0.6 },
    { at: 5.7, kind: 'dizzy', actor: 'bird', dur: 0.9 },
    { at: 7.88, kind: 'bubble', actor: 'bird', emoji: '🌤️', dur: 0.5 },
    { at: 8.85, kind: 'burst', actor: 'bird', emoji: '💥', dur: 0.4, dx: 3 },
    { at: 9.2, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.8 },
    { at: 9.38, kind: 'dizzy', actor: 'bird', dur: 0.7 },
  ],
  camera: [
    { at: 3, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 132, y: 38 } },
    { at: 5.4, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1, sfx: 'tap' }, { at: 1.31, sfx: 'tap' },
    { at: 1.64, sfx: 'tap' },
    { at: 1.36, say: '窗' },
    { at: 2.83, sfx: 'whoosh' },
    { at: 3, sfx: 'bonk' },
    { at: 3.27, sfx: 'slide' },
    { at: 4.79, sfx: 'whoosh' },
    { at: 5.4, sfx: 'plop' },
    { at: 6.45, say: '窗' },
    { at: 7.35, sfx: 'clink' },
    { at: 7.7, say: '窗戶' },
    { at: 8.23, sfx: 'whoosh' },
    { at: 8.85, sfx: 'bonk' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
