import type { Clip } from '../clip'

// 樂：小狗、小貓、小豬組樂團！小狗打鼓「咚」、小貓彈吉他「噹」、小豬吹喇叭——「噗～」吹出一個大泡泡。
// 三個越玩越快樂，跳起來轉圈，音符飛成「樂」。最後小豬的泡泡「啵」一聲破了，大家嚇一跳——又一起哈哈大笑。樂、樂、快樂
const clip: Clip = {
  char: '樂',
  meta: { theme: '組樂團', cast: '小狗＋小貓＋小豬', gags: ['喇叭吹出泡泡', '越玩越嗨', '泡泡破掉嚇一跳'] },
  duration: 10,
  bg: { top: '#2A2352', bottom: '#5B3C8C', floor: '#4A3B6E', scenery: 'night' },
  actors: [
    { id: 'dog', emoji: '🐶', x: 26, y: 69.5, size: 17, hidden: true },
    { id: 'drum', emoji: '🥁', x: 38, y: 72, size: 10, hidden: true },
    { id: 'cat', emoji: '🐱', x: 128, y: 69.5, size: 17, hidden: true },
    { id: 'guitar', emoji: '🎸', x: 140, y: 68, size: 11, hidden: true, float: true },
    { id: 'pig2', emoji: '🐷', x: 150, y: 69.5, size: 15, hidden: true },
    { id: 'horn', emoji: '🎺', x: 142, y: 62, size: 9, hidden: true, float: true, flip: true },
    { id: 'bubble', emoji: '🫧', x: 126, y: 50, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'pop' }, { at: 0.1, actor: 'drum', do: 'pop' },
    { at: 0.2, actor: 'cat', do: 'pop' }, { at: 0.3, actor: 'guitar', do: 'pop' },
    // 小狗打鼓
    { at: 1.0, actor: 'dog', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 1.0, actor: 'drum', do: 'squash', amount: 0.3, dur: 0.2 },
    // 小貓彈吉他
    { at: 1.8, actor: 'guitar', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.8, actor: 'cat', do: 'tilt', amount: 10, dur: 0.4 },
    // 小豬吹喇叭——吹出一個大泡泡
    { at: 2.6, actor: 'pig2', do: 'enter', from: { x: 178, y: 69.5 }, dur: 0.5 },
    { at: 2.6, actor: 'horn', do: 'enter', from: { x: 170, y: 62 }, dur: 0.5 },
    { at: 3.3, actor: 'pig2', do: 'squash', amount: -0.25, dur: 0.6 },
    { at: 3.4, actor: 'bubble', do: 'pop', dur: 0.3 },
    { at: 3.7, actor: 'bubble', do: 'scaleTo', amount: 2.4, dur: 0.8 },
    { at: 3.7, actor: 'bubble', do: 'moveTo', to: { x: 140, y: 30 }, dur: 0.8 },
    // 越玩越快樂——跳起來轉圈
    { at: 4.8, actor: 'dog', do: 'bounce', amount: 4, times: 3, dur: 0.8 },
    { at: 4.8, actor: 'drum', do: 'shake', amount: 1, dur: 0.8 },
    { at: 4.9, actor: 'cat', do: 'hop', amount: 10, dur: 0.5 },
    { at: 4.9, actor: 'cat', do: 'spin', dur: 0.5 },
    { at: 5.0, actor: 'pig2', do: 'bounce', amount: 4, times: 3, dur: 0.8 },
    // 泡泡啵一聲破了——嚇一跳，又哈哈大笑
    { at: 8.0, actor: 'bubble', do: 'vanish', dur: 0.1 },
    { at: 8.05, actor: 'dog', do: 'hop', amount: 6, dur: 0.3 },
    { at: 8.05, actor: 'cat', do: 'hop', amount: 6, dur: 0.3 },
    { at: 8.05, actor: 'pig2', do: 'hop', amount: 6, dur: 0.3 },
    { at: 8.7, actor: 'dog', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.7, actor: 'cat', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.7, actor: 'pig2', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 飛起來的音符
    { at: 5.0, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], from: { x: 80, y: 60 }, color: '#FFD25A' },
    { at: 5.8, dur: 0.6, strokes: [11, 12, 13, 14], from: { x: 80, y: 60 }, color: '#7CF2D2' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'burst', actor: 'drum', emoji: '🎵', n: 3, dur: 0.5 },
    { at: 1.8, kind: 'burst', actor: 'guitar', emoji: '🎶', n: 3, dur: 0.5 },
    { at: 3.4, kind: 'pop', actor: 'pig2', emoji: '😳', dur: 0.6 },
    { at: 4.8, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 1.6 },
    { at: 4.9, kind: 'zzz', actor: 'cat', emoji: '🎶', dur: 1.6 },
    { at: 8.0, kind: 'burst', x: 140, y: 30, emoji: '💦', n: 7, dur: 0.6 },
    { at: 8.1, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.5 },
    { at: 8.7, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.8 },
    { at: 8.75, kind: 'pop', actor: 'dog', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 3.6, dur: 0.9, do: 'punch', amount: 0.15, to: { x: 136, y: 46 } },
    { at: 8.0, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 1.3, say: '樂' },
    { at: 1.8, sfx: 'clink' },
    { at: 3.3, sfx: 'deflate' },
    { at: 3.7, sfx: 'bubble' },
    { at: 4.8, sfx: 'tap' }, { at: 5.1, sfx: 'clink' }, { at: 5.4, sfx: 'tap' },
    { at: 6.5, say: '樂' },
    { at: 7.4, say: '快樂' },
    { at: 8.0, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
