import type { Clip } from '../clip'

// 公：小兔子玩滑板摔了好幾次，烏龜外公拄著拐杖慢慢走過來：「我來試試。」大家都捂著眼睛不敢看——
// 外公一踩上去，咻——滑得超帥，還翻了一圈！拐杖和滑板的軌跡變成「公」。外公落地，鬍子都翹起來；小兔子拍手。公、公、外公
const clip: Clip = {
  char: '公',
  meta: { theme: '滑板', cast: '烏龜外公＋小兔子', gags: ['以為老人家不行', '外公超厲害', '看傻眼'] },
  duration: 10,
  bg: { top: '#DCEEFF', bottom: '#F6F9FF', floor: '#9AA5B1', scenery: 'city' },
  actors: [
    { id: 'board', emoji: '🛹', x: 70, y: 73, size: 12, hidden: true },
    { id: 'bunny', emoji: '🐰', x: 70, y: 66, size: 14, hidden: true, flip: true },
    { id: 'grandpa', emoji: '🐢', x: 140, y: 70.5, size: 16, hidden: true },
    { id: 'cane', emoji: '🦯', x: 132, y: 66, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'board', do: 'pop' },
    { at: 0.1, actor: 'bunny', do: 'pop' },
    // 小兔子摔了好幾次
    { at: 0.6, actor: 'bunny', do: 'rotateTo', amount: 70, dur: 0.2 },
    { at: 0.6, actor: 'bunny', do: 'moveTo', to: { x: 60, y: 70 }, dur: 0.2 },
    { at: 1.1, actor: 'bunny', do: 'rotateTo', amount: -70, dur: 0.2 },
    { at: 1.1, actor: 'bunny', do: 'moveTo', to: { x: 70, y: 66 }, dur: 0.2 },
    { at: 1.6, actor: 'bunny', do: 'rotateTo', amount: -70, dur: 0.2 },
    { at: 1.6, actor: 'bunny', do: 'moveTo', to: { x: 80, y: 70 }, dur: 0.2 },
    // 烏龜外公拄著拐杖慢慢走過來
    { at: 2.0, actor: 'grandpa', do: 'enter', from: { x: 178, y: 70.5 }, dur: 1.2 },
    { at: 2.0, actor: 'cane', do: 'enter', from: { x: 170, y: 66 }, dur: 1.2 },
    { at: 2.4, actor: 'bunny', do: 'rotateTo', amount: 70, dur: 0.2 },
    { at: 2.4, actor: 'bunny', do: 'moveTo', to: { x: 30, y: 70.5 }, dur: 0.4 },
    // 外公踩上滑板——大家都捂眼睛
    { at: 3.6, actor: 'grandpa', do: 'moveTo', to: { x: 74, y: 66 }, dur: 0.8 },
    { at: 3.6, actor: 'cane', do: 'moveTo', to: { x: 66, y: 60 }, dur: 0.8 },
    // 咻——滑得超帥，還翻一圈
    { at: 4.8, actor: 'board', do: 'moveTo', to: { x: 140, y: 73 }, dur: 0.7 },
    { at: 4.8, actor: 'grandpa', do: 'moveTo', to: { x: 140, y: 66 }, dur: 0.7 },
    { at: 4.8, actor: 'cane', do: 'moveTo', to: { x: 132, y: 60 }, dur: 0.7 },
    { at: 5.5, actor: 'grandpa', do: 'hop', amount: 18, dur: 0.6 },
    { at: 5.5, actor: 'grandpa', do: 'spin', dur: 0.6 },
    { at: 5.5, actor: 'board', do: 'hop', amount: 12, dur: 0.6 },
    { at: 5.5, actor: 'cane', do: 'hop', amount: 18, dur: 0.6 },
    { at: 6.1, actor: 'grandpa', do: 'squash', amount: 0.2, dur: 0.3 },
    // 小兔子拍手
    { at: 8.4, actor: 'bunny', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
  ],
  builds: [
    // 滑板和拐杖劃過的軌跡
    { at: 5.6, dur: 0.5, strokes: [0, 1], from: 'board', color: '#E86A33' },
    { at: 5.95, dur: 0.5, strokes: [2, 3], from: 'cane', color: '#3D7DD8' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'bunny', emoji: '😣', dur: 0.4 },
    { at: 1.7, kind: 'dizzy', actor: 'bunny', dur: 0.5 },
    { at: 3.0, kind: 'pop', actor: 'grandpa', emoji: '😌', dur: 0.6 },
    { at: 4.0, kind: 'pop', actor: 'bunny', emoji: '🙈', dur: 0.7 },
    { at: 4.8, kind: 'puff', actor: 'board', dur: 0.6 },
    { at: 5.6, kind: 'burst', actor: 'grandpa', emoji: '✨', n: 6, dur: 0.6 },
    { at: 6.3, kind: 'pop', actor: 'grandpa', emoji: '😎', dur: 0.8 },
    { at: 7.0, kind: 'pop', actor: 'bunny', emoji: '😮', dur: 0.8 },
    { at: 8.4, kind: 'pop', actor: 'bunny', emoji: '👏', dur: 0.8 },
  ],
  camera: [
    { at: 5.4, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 138, y: 58 } },
  ],
  cues: [
    { at: 0.6, sfx: 'bonk' }, { at: 1.6, sfx: 'bonk' },
    { at: 2.4, say: '公' },
    { at: 3.6, sfx: 'tap' },
    { at: 4.8, sfx: 'slide' },
    { at: 5.5, sfx: 'whoosh' },
    { at: 6.1, sfx: 'plop' },
    { at: 6.55, say: '公' },
    { at: 7.5, say: '外公' },
    { at: 8.4, sfx: 'cheer' },
  ],
}

export default clip
