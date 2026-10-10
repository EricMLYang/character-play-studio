import type { Clip } from '../clip'

// 十：河馬警察在十字路口指揮交通。左手一指，車子往右開；右手一指，車子往左開；兩手一起指——
// 好多車同時衝過來，河馬轉得頭昏，一條馬路變成橫的、一條變成直的，就是「十」！最後一隻小鴨子慢慢走過，大家都停下來等。十、十、十字路口
const clip: Clip = {
  char: '十',
  meta: { theme: '交通警察', cast: '河馬警察＋車子＋小鴨子', gags: ['指揮得越來越亂', '轉到頭昏', '小鴨子讓大家等'] },
  duration: 10,
  bg: { top: '#E3EEFF', bottom: '#F6F9FF', floor: '#9AA5B1', scenery: 'city' },
  actors: [
    { id: 'hippo', emoji: '🦛', x: 80, y: 67, size: 24, hidden: true },
    { id: 'hat', emoji: '🧢', x: 80, y: 56, size: 9, hidden: true, float: true, tint: 'hue-rotate(200deg)' },
    { id: 'car1', emoji: '🚗', x: -20, y: 70, size: 16, hidden: true, flip: true },
    { id: 'car2', emoji: '🚕', x: 180, y: 70, size: 16, hidden: true },
    { id: 'bus', emoji: '🚌', x: 180, y: 68, size: 20, hidden: true },
    { id: 'duck', emoji: '🦆', x: 40, y: 72, size: 11, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hippo', do: 'pop' },
    { at: 0.15, actor: 'hat', do: 'drop', dur: 0.5 },
    // 左手一指——車往右開
    { at: 1.2, actor: 'hippo', do: 'tilt', amount: -15, dur: 0.4 },
    { at: 1.4, actor: 'car1', do: 'pop', dur: 0.01 },
    { at: 1.4, actor: 'car1', do: 'moveTo', to: { x: 190, y: 70 }, dur: 1.2 },
    // 右手一指——車往左開
    { at: 2.8, actor: 'hippo', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 3.0, actor: 'car2', do: 'pop', dur: 0.01 },
    { at: 3.0, actor: 'car2', do: 'moveTo', to: { x: -30, y: 70 }, dur: 1.2 },
    // 兩手一起指——好多車衝過來，轉到頭昏
    { at: 4.5, actor: 'hippo', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 4.7, actor: 'car1', do: 'moveTo', to: { x: -20, y: 70 }, dur: 0.01 },
    { at: 4.72, actor: 'car1', do: 'moveTo', to: { x: 190, y: 70 }, dur: 0.8 },
    { at: 4.8, actor: 'bus', do: 'pop', dur: 0.01 },
    { at: 4.8, actor: 'bus', do: 'moveTo', to: { x: -30, y: 68 }, dur: 0.9 },
    { at: 4.8, actor: 'hippo', do: 'shake', amount: 2.5, dur: 1.0 },
    { at: 4.8, actor: 'hippo', do: 'flip' }, { at: 5.0, actor: 'hippo', do: 'flip' }, { at: 5.2, actor: 'hippo', do: 'flip' }, { at: 5.4, actor: 'hippo', do: 'flip' },
    { at: 4.8, actor: 'hat', do: 'moveTo', to: { x: 120, y: 30 }, dur: 0.8, arc: 10 },
    { at: 5.6, actor: 'hat', do: 'vanish', dur: 0.2 },
    { at: 5.9, actor: 'hippo', do: 'moveTo', to: { x: 30, y: 67 }, dur: 0.5, arc: 6 },
    // 小鴨子慢慢走過，大家停下來等
    { at: 7.4, actor: 'duck', do: 'pop', dur: 0.2 },
    { at: 7.6, actor: 'duck', do: 'moveTo', to: { x: 130, y: 72 }, dur: 2.0 },
    { at: 7.6, actor: 'duck', do: 'bounce', amount: 1.5, times: 6, dur: 2.0 },
  ],
  builds: [
    // 橫的馬路、直的馬路
    { at: 5.6, dur: 0.5, strokes: [0], from: 'car1', color: '#3D7DD8' },
    { at: 6.0, dur: 0.5, strokes: [1], style: 'drop', from: { x: 80, y: 0 }, color: '#E86A33' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'hippo', emoji: '😎', dur: 0.6 },
    { at: 1.2, kind: 'pop', actor: 'hippo', emoji: '👈', dur: 0.6, dx: -16 },
    { at: 2.8, kind: 'pop', actor: 'hippo', emoji: '👉', dur: 0.6 },
    { at: 4.5, kind: 'pop', actor: 'hippo', emoji: '😱', dur: 0.4 },
    { at: 5.8, kind: 'dizzy', actor: 'hippo', dur: 1.4 },
    { at: 7.6, kind: 'zzz', actor: 'duck', emoji: '🎵', dur: 1.6 },
    { at: 8.4, kind: 'pop', actor: 'hippo', emoji: '😌', dur: 0.8 },
  ],
  camera: [
    { at: 4.8, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 80, y: 60 } },
  ],
  cues: [
    { at: 0.7, say: '十' },
    { at: 1.4, sfx: 'whoosh' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 4.7, sfx: 'whoosh' },
    { at: 4.8, sfx: 'rumble' },
    { at: 5.9, sfx: 'plop' },
    { at: 6.65, say: '十' },
    { at: 7.6, say: '十字路口' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
