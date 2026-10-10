import type { Clip } from '../clip'

// 來：小狗對遠方的烏龜招手：「過來！」烏龜一步……一步……慢慢爬。小狗等到不耐煩，揮手揮到轉圈圈；
// 等到坐下、等到趴下、等到睡著。烏龜終於到了，拍拍小狗——小狗嚇醒跳起來，葉子和草飛成「來」。烏龜轉身：「換你過來！」又慢慢爬回去。來、來、過來
const clip: Clip = {
  char: '來',
  meta: { theme: '等朋友', cast: '小狗＋烏龜', gags: ['慢吞吞', '等到睡著', '又要慢慢爬回去'] },
  duration: 10,
  bg: { top: '#DDF2FF', bottom: '#F2FBEA', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'dog', emoji: '🐕', x: 30, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'turtle', emoji: '🐢', x: 140, y: 71, size: 15, hidden: true, flip: false },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'pop' },
    { at: 0.15, actor: 'turtle', do: 'pop' },
    // 過來！——招手
    { at: 0.7, actor: 'dog', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 烏龜一步……一步……
    { at: 1.4, actor: 'turtle', do: 'moveTo', to: { x: 46, y: 71 }, dur: 5.7 },
    // 等到不耐煩，轉圈圈
    { at: 2.3, actor: 'dog', do: 'spin', dur: 0.6 },
    { at: 2.3, actor: 'dog', do: 'hop', amount: 6, dur: 0.6 },
    // 坐下、趴下、睡著
    { at: 3.3, actor: 'dog', do: 'squash', amount: 0.2, dur: 0.6 },
    { at: 4.3, actor: 'dog', do: 'rotateTo', amount: -80, dur: 0.4 },
    { at: 4.3, actor: 'dog', do: 'moveTo', to: { x: 30, y: 73 }, dur: 0.4 },
    // 烏龜終於到了——拍拍小狗
    { at: 7.3, actor: 'turtle', do: 'tilt', amount: -15, dur: 0.3 },
    // 小狗嚇醒跳起來
    { at: 7.6, actor: 'dog', do: 'rotateTo', amount: 80, dur: 0.15 },
    { at: 7.6, actor: 'dog', do: 'moveTo', to: { x: 30, y: 69.5 }, dur: 0.15 },
    { at: 7.6, actor: 'dog', do: 'hop', amount: 18, dur: 0.5 },
    // 換你過來——烏龜又慢慢爬回去
    { at: 8.8, actor: 'turtle', do: 'flip' },
    { at: 8.9, actor: 'turtle', do: 'moveTo', to: { x: 48, y: 71 }, dur: 1.1 },
  ],
  builds: [
    // 嚇醒跳起來，草和葉子飛起來
    { at: 7.7, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'dog', color: '#3E9B4F' },
    { at: 8.0, dur: 0.5, strokes: [5, 6, 7], from: 'dog', color: '#8A5A3B' },
  ],
  glyph: [{ at: 8.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'dog', emoji: '👋', dur: 0.7 },
    { at: 1.6, kind: 'puff', actor: 'turtle', dur: 0.5 },
    { at: 2.4, kind: 'sweat', actor: 'dog' },
    { at: 3.3, kind: 'bubble', actor: 'dog', emoji: '😑', dur: 0.8 },
    { at: 4.8, kind: 'zzz', actor: 'dog', dur: 2.6 },
    { at: 5.5, kind: 'bubble', actor: 'turtle', emoji: '😤', dur: 0.8 },
    { at: 7.3, kind: 'pop', actor: 'turtle', emoji: '👋', dur: 0.4 },
    { at: 7.6, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'turtle', emoji: '👋', dur: 0.8 },
  ],
  camera: [
    { at: 7.3, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 38, y: 62 } },
  ],
  cues: [
    { at: 0.8, say: '來' },
    { at: 2.3, sfx: 'whoosh' },
    { at: 3.3, sfx: 'plop' },
    { at: 4.3, sfx: 'slide' },
    { at: 7.3, sfx: 'tap' },
    { at: 7.6, sfx: 'boing' },
    { at: 8.0, say: '來' },
    { at: 8.95, say: '過來' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
