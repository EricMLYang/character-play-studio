import type { Clip } from '../clip'

// 弟：倉鼠哥哥在滾輪上跑得好快，倉鼠弟弟也要跑！弟弟一跳上去——滾輪轉太快，弟弟被甩出去；再跳一次——又被甩出去，黏在牆上。
// 哥哥停下來，牽著弟弟一起慢慢跑……越跑越快，兩個一起被甩飛，木屑飛成「弟」。弟弟開心地說：再一次！弟、弟、弟弟
const clip: Clip = {
  char: '弟',
  meta: { theme: '倉鼠滾輪', cast: '倉鼠哥哥＋倉鼠弟弟', gags: ['被甩出去', '黏在牆上', '一起被甩飛'] },
  duration: 10,
  bg: { top: '#FFF0DC', bottom: '#FFF8EE', floor: '#C9A06A', scenery: 'room' },
  actors: [
    { id: 'wheel', emoji: '🎡', x: 132, y: 56, size: 36, hidden: true, tint: 'saturate(.6) brightness(1.1)' },
    { id: 'big', emoji: '🐹', x: 132, y: 66, size: 14, hidden: true },
    { id: 'small', emoji: '🐹', x: 40, y: 72, size: 10, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'wheel', do: 'pop' },
    { at: 0.1, actor: 'big', do: 'pop' },
    { at: 0.3, actor: 'wheel', do: 'spin', times: 2, dur: 1.6 },
    { at: 0.3, actor: 'big', do: 'bounce', amount: 1.5, times: 6, dur: 1.6 },
    { at: 0.4, actor: 'small', do: 'pop' },
    // 弟弟跳上去——被甩出去
    { at: 2.0, actor: 'small', do: 'moveTo', to: { x: 120, y: 66 }, dur: 0.4, arc: 10 },
    { at: 2.4, actor: 'wheel', do: 'spin', times: 2, dur: 0.8 },
    { at: 2.6, actor: 'small', do: 'moveTo', to: { x: 40, y: 72 }, dur: 0.5, arc: 18 },
    { at: 2.6, actor: 'small', do: 'spin', times: 2, dur: 0.5 },
    // 再跳一次——黏在牆上
    { at: 3.6, actor: 'small', do: 'moveTo', to: { x: 120, y: 66 }, dur: 0.4, arc: 10 },
    { at: 4.0, actor: 'wheel', do: 'spin', times: 2, dur: 0.8 },
    { at: 4.2, actor: 'small', do: 'moveTo', to: { x: 8, y: 30 }, dur: 0.4 },
    { at: 4.6, actor: 'small', do: 'squash', amount: 0.4, dur: 0.6 },
    { at: 5.2, actor: 'small', do: 'moveTo', to: { x: 40, y: 72 }, dur: 0.4 },
    // 哥哥牽著弟弟一起跑——越跑越快，一起被甩飛
    { at: 5.8, actor: 'big', do: 'moveTo', to: { x: 126, y: 66 }, dur: 0.2 },
    { at: 5.8, actor: 'small', do: 'moveTo', to: { x: 138, y: 66 }, dur: 0.4, arc: 8 },
    { at: 6.2, actor: 'wheel', do: 'spin', times: 4, dur: 1.0 },
    { at: 7.2, actor: 'big', do: 'moveTo', to: { x: 22, y: 70 }, dur: 0.6, arc: 22 },
    { at: 7.2, actor: 'small', do: 'moveTo', to: { x: 36, y: 72 }, dur: 0.6, arc: 26 },
    { at: 7.2, actor: 'big', do: 'spin', dur: 0.6 },
    { at: 7.2, actor: 'small', do: 'spin', times: 2, dur: 0.6 },
    { at: 8.8, actor: 'small', do: 'bounce', amount: 4, times: 2, dur: 0.6 },
  ],
  builds: [
    // 甩飛出來的木屑
    { at: 7.3, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'wheel', color: '#A0522D' },
  ],
  glyph: [{ at: 8.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'small', emoji: '🎡', dur: 0.8 },
    { at: 3.1, kind: 'dizzy', actor: 'small', dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'small', emoji: '😵', dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'big', emoji: '🤝', dur: 0.6 },
    { at: 6.5, kind: 'pop', actor: 'small', emoji: '😆', dur: 0.6 },
    { at: 7.8, kind: 'dizzy', actor: 'big', dur: 1.0 },
    { at: 8.9, kind: 'pop', actor: 'small', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 4.4, dur: 0.4, do: 'shake', amount: 1.2 },
    { at: 6.4, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 132, y: 58 } },
  ],
  cues: [
    { at: 0.9, say: '弟' },
    { at: 2.0, sfx: 'boing' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 3.6, sfx: 'boing' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 4.6, sfx: 'plop' },
    { at: 6.2, sfx: 'rumble' },
    { at: 7.2, sfx: 'whoosh' },
    { at: 8.2, say: '弟' },
    { at: 9.1, say: '弟弟' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
