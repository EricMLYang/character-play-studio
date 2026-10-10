import type { Clip } from '../clip'

// 相：企鵝看到鏡子裡的自己——舉手，鏡子裡也舉手；跳一下，鏡子裡也跳一下，一模一樣！企鵝轉一圈……鏡子裡的企鵝卻吐舌頭。
// 企鵝湊近一看，鏡子「啪」碎成「相」——原來鏡子後面是另一隻企鵝在學牠！兩隻企鵝互看，一起哈哈大笑。相、相、相同
const clip: Clip = {
  char: '相',
  meta: { theme: '照鏡子', cast: '兩隻企鵝＋鏡框', gags: ['模仿', '一模一樣', '突然不一樣了', '原來是另一隻'] },
  duration: 10,
  bg: { top: '#E3F2FF', bottom: '#F6FBFF', floor: '#C9D6E6', scenery: 'snow' },
  actors: [
    { id: 'frame', emoji: '🪞', x: 80, y: 56, size: 36, hidden: true, float: true },
    { id: 'p1', emoji: '🐧', x: 60, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'p2', emoji: '🐧', x: 100, y: 69.5, size: 18, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'frame', do: 'pop' },
    { at: 0.1, actor: 'p1', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    { at: 0.1, actor: 'p2', do: 'enter', from: { x: 174, y: 69.5 }, dur: 0.6 },
    // 舉手——鏡子裡也舉手
    { at: 1.2, actor: 'p1', do: 'tilt', amount: 15, dur: 0.5 },
    { at: 1.2, actor: 'p2', do: 'tilt', amount: -15, dur: 0.5 },
    // 跳一下——也跳一下
    { at: 2.2, actor: 'p1', do: 'hop', amount: 8, dur: 0.45 },
    { at: 2.2, actor: 'p2', do: 'hop', amount: 8, dur: 0.45 },
    { at: 3.0, actor: 'p1', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 3.0, actor: 'p2', do: 'squash', amount: 0.25, dur: 0.3 },
    // 轉一圈……鏡子裡的吐舌頭
    { at: 3.8, actor: 'p1', do: 'spin', dur: 0.6 },
    { at: 4.5, actor: 'p2', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 湊近一看——鏡子碎了
    { at: 5.3, actor: 'p1', do: 'moveTo', to: { x: 70, y: 69.5 }, dur: 0.4 },
    { at: 5.8, actor: 'frame', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 6.1, actor: 'frame', do: 'vanish', dur: 0.2 },
    { at: 6.15, actor: 'p1', do: 'moveTo', to: { x: 30, y: 69.5 }, dur: 0.4, arc: 8 },
    { at: 6.15, actor: 'p2', do: 'moveTo', to: { x: 130, y: 69.5 }, dur: 0.4, arc: 8 },
    // 互看，一起哈哈大笑
    { at: 8.4, actor: 'p1', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
    { at: 8.4, actor: 'p2', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
  ],
  builds: [
    // 碎掉的鏡子
    { at: 6.15, dur: 0.6, strokes: [0, 1, 2, 3], from: 'frame', color: '#3D8BEF' },
    { at: 6.5, dur: 0.6, strokes: [4, 5, 6, 7, 8], from: 'frame', color: '#7A5CC9' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'p1', emoji: '😮', dur: 0.6 },
    { at: 3.1, kind: 'pop', actor: 'p1', emoji: '😆', dur: 0.6 },
    { at: 4.5, kind: 'pop', actor: 'p2', emoji: '😜', dur: 0.8 },
    { at: 4.7, kind: 'pop', actor: 'p1', emoji: '❓', dur: 0.6 },
    { at: 6.1, kind: 'burst', actor: 'frame', emoji: '✨', n: 8, dur: 0.6 },
    { at: 6.6, kind: 'pop', actor: 'p1', emoji: '😳', dur: 0.6 },
    { at: 6.6, kind: 'pop', actor: 'p2', emoji: '😳', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'p1', emoji: '😆', dur: 0.8 },
    { at: 8.5, kind: 'pop', actor: 'p2', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 4.5, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 98, y: 62 } },
    { at: 6.1, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.3, say: '相' },
    { at: 2.2, sfx: 'boing' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 4.5, sfx: 'blip' },
    { at: 5.8, sfx: 'tap' },
    { at: 6.1, sfx: 'crack' },
    { at: 7.2, say: '相' },
    { at: 8.2, say: '相同' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
