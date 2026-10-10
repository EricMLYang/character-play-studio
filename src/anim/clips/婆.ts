import type { Clip } from '../clip'

// 婆：貓頭鷹外婆坐在搖椅上織毛衣，毛線球滾下去，小貓撲上去玩——毛線越拉越長，小貓把自己纏成一顆毛線球！
// 外婆戴上眼鏡一看，笑著把毛線一拉——小貓轉呀轉呀滾出來，毛線飛成「婆」。小貓轉得頭昏眼花，外婆笑呵呵。婆、婆、外婆
const clip: Clip = {
  char: '婆',
  meta: { theme: '織毛衣', cast: '貓頭鷹外婆＋小貓＋毛線球', gags: ['越玩越纏', '把自己纏成球', '一拉就轉出來'] },
  duration: 10,
  bg: { top: '#FFEEDB', bottom: '#FFF8EF', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'chair', emoji: '🪑', x: 30, y: 66, size: 24, hidden: true },
    { id: 'gran', emoji: '🦉', x: 30, y: 56, size: 18, hidden: true, flip: true },
    { id: 'yarn', emoji: '🧶', x: 44, y: 62, size: 9, hidden: true, float: true },
    { id: 'kit', emoji: '🐱', x: 130, y: 70.5, size: 14, hidden: true },
    { id: 'ball', emoji: '🧶', x: 110, y: 70, size: 20, hidden: true },
    { id: 'glasses', emoji: '👓', x: 30, y: 54, size: 8, hidden: true, float: true },
    { id: 'peek', emoji: '🐱', x: 112, y: 60, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'chair', do: 'pop' },
    { at: 0.1, actor: 'gran', do: 'pop' },
    { at: 0.2, actor: 'yarn', do: 'pop' },
    { at: 0.4, actor: 'gran', do: 'tilt', amount: 8, dur: 1.2 },
    { at: 0.5, actor: 'kit', do: 'pop' },
    // 毛線球滾下去——小貓撲上去
    { at: 1.6, actor: 'yarn', do: 'moveTo', to: { x: 96, y: 72 }, dur: 0.9, arc: 4 },
    { at: 1.6, actor: 'yarn', do: 'spin', times: 3, dur: 0.9 },
    { at: 2.6, actor: 'kit', do: 'moveTo', to: { x: 100, y: 70.5 }, dur: 0.3, arc: 8 },
    // 越拉越長——纏成一顆毛線球
    { at: 3.1, actor: 'kit', do: 'spin', times: 2, dur: 0.8 },
    { at: 3.1, actor: 'yarn', do: 'moveTo', to: { x: 110, y: 72 }, dur: 0.6 },
    { at: 3.9, actor: 'kit', do: 'vanish', dur: 0.1 },
    { at: 3.9, actor: 'yarn', do: 'vanish', dur: 0.1 },
    { at: 3.95, actor: 'ball', do: 'pop', dur: 0.3 },
    { at: 4.3, actor: 'ball', do: 'shake', amount: 1, dur: 0.6 },
    { at: 4.0, actor: 'peek', do: 'pop', dur: 0.3 },
    { at: 4.3, actor: 'peek', do: 'shake', amount: 1, dur: 0.6 },
    { at: 5.9, actor: 'peek', do: 'vanish', dur: 0.2 },
    // 外婆戴上眼鏡一看
    { at: 5.0, actor: 'glasses', do: 'pop', dur: 0.3 },
    { at: 5.4, actor: 'gran', do: 'tilt', amount: -12, dur: 0.4 },
    // 把毛線一拉——小貓轉呀轉滾出來
    { at: 5.9, actor: 'ball', do: 'spin', times: 3, dur: 0.8 },
    { at: 6.7, actor: 'ball', do: 'vanish', dur: 0.2 },
    { at: 6.7, actor: 'kit', do: 'moveTo', to: { x: 130, y: 70.5 }, dur: 0.01 },
    { at: 6.72, actor: 'kit', do: 'pop', dur: 0.2 },
    // 外婆笑呵呵
    { at: 8.4, actor: 'gran', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    
    { at: 8.4, actor: 'kit', do: 'flash', dur: 0.5 },
    { at: 8.8, actor: 'kit', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 拉開的毛線：波、女
    { at: 6.0, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'ball', color: '#E8508A' },
    { at: 6.6, dur: 0.5, strokes: [8, 9, 10], from: 'ball', color: '#7A5CC9' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'zzz', actor: 'gran', emoji: '🎵', dur: 1.2 },
    { at: 2.2, kind: 'pop', actor: 'kit', emoji: '😻', dur: 0.5 },
    { at: 4.3, kind: 'pop', actor: 'peek', emoji: '😿', dur: 0.6 },
    { at: 5.3, kind: 'pop', actor: 'gran', emoji: '😆', dur: 0.6 },
    { at: 6.8, kind: 'dizzy', actor: 'kit', dur: 1.0 },
    { at: 8.4, kind: 'burst', actor: 'kit', emoji: '💕', n: 5, dur: 0.6 },
  ],
  camera: [
    { at: 3.9, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 110, y: 64 } },
  ],
  cues: [
    { at: 0.8, say: '婆' },
    { at: 1.6, sfx: 'slide' },
    { at: 2.6, sfx: 'boing' },
    { at: 3.1, sfx: 'whoosh' },
    { at: 3.95, sfx: 'poof' },
    { at: 5.0, sfx: 'clink' },
    { at: 5.9, sfx: 'whoosh' },
    { at: 7.2, say: '婆' },
    { at: 8.2, say: '外婆' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
