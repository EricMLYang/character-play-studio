import type { Clip } from '../clip'

// 姑：長頸鹿姑姑要出門，小鳥幫她挑帽子：戴一頂皇冠——太重，脖子彎下來；換一頂草帽——風一吹飛走；
// 換一個蝴蝶結——好像不錯！小鳥自己飛上去坐在姑姑頭上當帽子，姑姑開心轉一圈，帽子們飛成「姑」。姑、姑、姑姑
const clip: Clip = {
  char: '姑',
  meta: { theme: '挑帽子', cast: '長頸鹿姑姑＋小鳥', gags: ['帽子一直不對', '自己當帽子'] },
  duration: 10,
  bg: { top: '#FFEAF2', bottom: '#FFF8FA', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'aunt', emoji: '🦒', x: 30, y: 60, size: 34, hidden: true, flip: true },
    { id: 'hat', emoji: '👑', x: 41, y: 41, size: 10, hidden: true, float: true },
    { id: 'bird', emoji: '🐦', x: 120, y: 40, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'aunt', do: 'pop' },
    { at: 0.2, actor: 'bird', do: 'enter', from: { x: 175, y: 30 }, dur: 0.6 },
    // 皇冠——太重，脖子彎下來
    { at: 1.0, actor: 'hat', do: 'drop', dur: 0.5 },
    { at: 1.6, actor: 'aunt', do: 'tilt', amount: -25, dur: 0.8 },
    { at: 1.6, actor: 'hat', do: 'moveTo', to: { x: 46, y: 50 }, dur: 0.4 },
    { at: 2.4, actor: 'hat', do: 'vanish', dur: 0.2 },
    // 草帽——風一吹飛走
    { at: 2.8, actor: 'hat', do: 'swap', emoji: '👒' },
    { at: 2.8, actor: 'hat', do: 'moveTo', to: { x: 41, y: 41 }, dur: 0.01 },
    { at: 2.82, actor: 'hat', do: 'drop', dur: 0.5 },
    { at: 3.6, actor: 'hat', do: 'moveTo', to: { x: 170, y: 10 }, dur: 0.8, arc: 10 },
    { at: 3.6, actor: 'hat', do: 'spin', times: 2, dur: 0.8 },
    // 蝴蝶結——好像不錯
    { at: 4.6, actor: 'hat', do: 'swap', emoji: '🎀' },
    { at: 4.6, actor: 'hat', do: 'moveTo', to: { x: 41, y: 41 }, dur: 0.01 },
    { at: 4.62, actor: 'hat', do: 'drop', dur: 0.5 },
    { at: 5.2, actor: 'aunt', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 5.2, actor: 'hat', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 小鳥自己飛上去當帽子
    { at: 5.9, actor: 'hat', do: 'vanish', dur: 0.2 },
    { at: 5.9, actor: 'bird', do: 'moveTo', to: { x: 42, y: 39 }, dur: 0.5, arc: 10 },
    { at: 6.5, actor: 'aunt', do: 'flash', dur: 0.5 },
    // 姑姑開心
    { at: 8.4, actor: 'aunt', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.4, actor: 'bird', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 飛起來的帽子們
    { at: 6.0, dur: 0.5, strokes: [0, 1, 2], from: { x: 41, y: 41 }, color: '#E8508A' },
    { at: 6.4, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: { x: 41, y: 41 }, color: '#F5A623' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'bird', emoji: '🎩', dur: 0.6 },
    { at: 2.0, kind: 'sweat', actor: 'aunt', dy: 2 },
    { at: 3.6, kind: 'burst', x: 60, y: 30, emoji: '💨', n: 4, dur: 0.5 },
    { at: 3.9, kind: 'pop', actor: 'aunt', emoji: '😮', dur: 0.5, dy: 2 },
    { at: 5.3, kind: 'pop', actor: 'bird', emoji: '🤔', dur: 0.5 },
    { at: 6.4, kind: 'burst', actor: 'bird', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'aunt', emoji: '😊', dur: 0.8, dy: 2 },
  ],
  camera: [
    { at: 1.6, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 36, y: 40 } },
  ],
  cues: [
    { at: 0.8, say: '姑' },
    { at: 1.4, sfx: 'clink' },
    { at: 2.0, sfx: 'deflate' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 5.1, sfx: 'blip' },
    { at: 5.9, sfx: 'boing' },
    { at: 7.1, say: '姑' },
    { at: 8.0, say: '姑姑' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
