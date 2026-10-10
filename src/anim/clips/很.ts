import type { Clip } from '../clip'

// 很：母雞下了一顆蛋，好開心！再用力——兩顆、三顆、五顆……蛋越下越多，堆得比母雞還高，蛋山搖搖晃晃——
// 「嘩啦」滾得滿地都是，蛋殼碎片飛成「很」。小雞一隻一隻鑽出來，排成一長排跟在母雞後面。很、很、很多
const clip: Clip = {
  char: '很',
  meta: { theme: '下蛋', cast: '母雞＋好多蛋＋小雞', gags: ['越下越多（失控）', '蛋山倒塌', '一長排小雞'] },
  duration: 10,
  bg: { top: '#FFF2D6', bottom: '#FFFAEE', floor: '#C9A06A', scenery: 'hills' },
  actors: [
    { id: 'hen', emoji: '🐔', x: 30, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'e1', emoji: '🥚', x: 50, y: 71.5, size: 9, hidden: true },
    { id: 'e2', emoji: '🥚', x: 58, y: 71.5, size: 9, hidden: true },
    { id: 'e3', emoji: '🥚', x: 54, y: 64, size: 9, hidden: true },
    { id: 'e4', emoji: '🥚', x: 66, y: 71.5, size: 9, hidden: true },
    { id: 'e5', emoji: '🥚', x: 62, y: 64, size: 9, hidden: true },
    { id: 'e6', emoji: '🥚', x: 58, y: 56.5, size: 9, hidden: true },
    { id: 'c1', emoji: '🐤', x: 130, y: 72, size: 10, hidden: true },
    { id: 'c2', emoji: '🐤', x: 140, y: 72, size: 10, hidden: true },
    { id: 'c3', emoji: '🐤', x: 150, y: 72, size: 10, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'hen', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    // 一顆蛋
    { at: 0.9, actor: 'hen', do: 'squash', amount: 0.25, dur: 0.4 },
    { at: 1.2, actor: 'e1', do: 'pop', dur: 0.3 },
    { at: 1.6, actor: 'hen', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 越下越多
    { at: 2.4, actor: 'hen', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 2.6, actor: 'e2', do: 'pop', dur: 0.25 },
    { at: 3.0, actor: 'hen', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.15, actor: 'e3', do: 'pop', dur: 0.2 },
    { at: 3.45, actor: 'hen', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 3.55, actor: 'e4', do: 'pop', dur: 0.2 },
    { at: 3.8, actor: 'e5', do: 'pop', dur: 0.2 },
    { at: 4.0, actor: 'e6', do: 'pop', dur: 0.2 },
    // 蛋山搖搖晃晃——嘩啦
    { at: 4.5, actor: 'e6', do: 'tilt', amount: 20, dur: 0.6 },
    { at: 4.5, actor: 'e5', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 4.5, actor: 'e3', do: 'tilt', amount: -12, dur: 0.6 },
    ...['e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map((actor, i) => ({ at: 5.2 + i * 0.05, actor, do: 'vanish' as const, dur: 0.25 })),
    // 母雞走到右邊；小雞一隻一隻鑽出來，排在母雞後面
    { at: 6.7, actor: 'hen', do: 'moveTo', to: { x: 116, y: 68.6 }, dur: 0.5 },
    { at: 7.25, actor: 'hen', do: 'flip' },
    { at: 7.4, actor: 'c1', do: 'pop', dur: 0.25 },
    { at: 7.65, actor: 'c2', do: 'pop', dur: 0.25 },
    { at: 7.9, actor: 'c3', do: 'pop', dur: 0.25 },
    ...['c1', 'c2', 'c3'].map((actor, i) => ({ at: 8.6 + i * 0.1, actor, do: 'bounce' as const, dur: 0.6, times: 2, amount: 2 })),
  ],
  builds: [
    // 滾滿地的蛋殼碎片
    { at: 5.25, dur: 0.6, strokes: [0, 1, 2], from: 'e3', color: '#E3A23A' },
    { at: 5.6, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'e4', color: '#8A5A3B' },
  ],
  glyph: [{ at: 6.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.6, kind: 'pop', actor: 'hen', emoji: '😊', dur: 0.6 },
    { at: 3.6, kind: 'pop', actor: 'hen', emoji: '😳', dur: 0.6 },
    { at: 4.6, kind: 'sweat', actor: 'hen' },
    { at: 5.2, kind: 'burst', actor: 'e3', emoji: '✨', n: 6, dur: 0.6 },
    { at: 7.5, kind: 'pop', actor: 'c1', emoji: '💛', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'hen', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 3.6, dur: 1.4, do: 'punch', amount: 0.2, to: { x: 50, y: 60 } },
    { at: 5.2, dur: 0.35, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.2, sfx: 'plop' },
    { at: 1.4, say: '很' },
    { at: 2.6, sfx: 'plop' }, { at: 3.15, sfx: 'plop' }, { at: 3.55, sfx: 'plop' }, { at: 3.8, sfx: 'plop' }, { at: 4.0, sfx: 'plop' },
    { at: 5.2, sfx: 'crack' },
    { at: 6.6, say: '很' },
    { at: 7.4, sfx: 'blip' }, { at: 7.65, sfx: 'blip' }, { at: 7.9, sfx: 'blip' },
    { at: 8.1, say: '很多' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
