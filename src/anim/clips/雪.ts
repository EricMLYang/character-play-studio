import type { Clip } from '../clip'

// 雪：企鵝和海豹打雪仗。企鵝丟太近，海豹一丟就正中企鵝的臉。企鵝氣到滾一顆超級大雪球，越滾越大，撞飛海豹，碎成「雪」。
// 雪人冒出來了，企鵝開心地轉頭看——雪人也加入打雪仗，一顆雪球正中企鵝。雪、雪、雪人
const clip: Clip = {
  char: '雪',
  meta: { theme: '打雪仗', cast: '企鵝＋海豹＋雪人', gags: ['丟太近', '被正中臉', '雪球越滾越大', '雪人也加入偷襲'] },
  duration: 10,
  bg: { top: '#CFE4FF', bottom: '#F2F8FF', floor: '#C9DDF0', scenery: 'snow' },
  actors: [
    { id: 'peng', emoji: '🐧', x: 28, y: 72, size: 12, hidden: true, flip: true },
    { id: 'big', emoji: '⚪', x: 46, y: 74.5, size: 6, hidden: true },
    { id: 'seal', emoji: '🦭', x: 132, y: 71.1, size: 14, hidden: true },
    { id: 'b1', emoji: '⚪', x: 36, y: 64, size: 4, hidden: true, float: true },
    { id: 'b2', emoji: '⚪', x: 124, y: 66, size: 5, hidden: true, float: true },
    { id: 'snowman', emoji: '⛄', x: 13, y: 70.3, size: 16, hidden: true },
    { id: 'b3', emoji: '⚪', x: 20, y: 62, size: 4, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'peng', do: 'enter', from: { x: -12, y: 72 }, dur: 0.6 },
    { at: 0.2, actor: 'seal', do: 'pop' },
    // 企鵝丟——太近
    { at: 0.8, actor: 'b1', do: 'pop', dur: 0.2 },
    { at: 1.0, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 1.2, actor: 'b1', do: 'moveTo', to: { x: 64, y: 74 }, dur: 0.5, arc: 12 },
    { at: 1.75, actor: 'b1', do: 'vanish', dur: 0.2 },
    { at: 1.9, actor: 'seal', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 海豹丟回來：正中臉
    { at: 2.4, actor: 'b2', do: 'pop', dur: 0.2 },
    { at: 2.5, actor: 'seal', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 2.6, actor: 'b2', do: 'moveTo', to: { x: 30, y: 66 }, dur: 0.35, arc: 6 },
    { at: 2.95, actor: 'b2', do: 'vanish', dur: 0.1 },
    { at: 2.95, actor: 'peng', do: 'shake', dur: 0.5, amount: 1.5 },
    // 滾超級大雪球
    { at: 3.6, actor: 'big', do: 'pop', dur: 0.2 },
    { at: 3.7, actor: 'big', do: 'moveTo', to: { x: 58, y: 68.3 }, dur: 1.0 },
    { at: 3.7, actor: 'big', do: 'scaleTo', amount: 3.5, dur: 1.0 },
    { at: 3.7, actor: 'peng', do: 'moveTo', to: { x: 44, y: 72 }, dur: 1.0 },
    { at: 4.7, actor: 'big', do: 'scaleTo', amount: 1.6, dur: 0.4 },
    { at: 4.7, actor: 'big', do: 'moveTo', to: { x: 64, y: 63 }, dur: 0.4 },
    { at: 5.1, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 5.3, actor: 'big', do: 'moveTo', to: { x: 116, y: 63 }, dur: 0.45 },
    // 撞飛海豹，雪球碎成「雪」
    { at: 5.75, actor: 'big', do: 'vanish', dur: 0.15 },
    { at: 5.75, actor: 'seal', do: 'hop', dur: 0.4, amount: 10 },
    { at: 5.8, actor: 'seal', do: 'rotateTo', amount: 80, dur: 0.25 },
    { at: 5.8, actor: 'peng', do: 'moveTo', to: { x: 36, y: 72 }, dur: 0.4 },
    { at: 6.6, actor: 'seal', do: 'rotateTo', amount: -80, dur: 0.25 },
    { at: 6.95, actor: 'peng', do: 'bounce', dur: 0.5, times: 2, amount: 3 },
    // 雪人出現
    { at: 7.6, actor: 'snowman', do: 'pop' },
    { at: 7.7, actor: 'peng', do: 'flip' },
    { at: 7.8, actor: 'peng', do: 'hop', dur: 0.3, amount: 4 },
    // 回馬槍：雪人也丟雪球
    { at: 8.4, actor: 'b3', do: 'pop', dur: 0.15 },
    { at: 8.5, actor: 'snowman', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 8.55, actor: 'b3', do: 'moveTo', to: { x: 35, y: 66 }, dur: 0.25 },
    { at: 8.8, actor: 'b3', do: 'vanish', dur: 0.1 },
    { at: 8.8, actor: 'peng', do: 'shake', dur: 0.5, amount: 1.5 },
    { at: 8.8, actor: 'peng', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.0, actor: 'seal', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 大雪球撞碎 → 雨；雪花飄下來 → 彐
    { at: 5.75, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'big', color: '#3A8BD8' },
    { at: 6.3, dur: 0.6, strokes: [8, 9, 10], from: { x: 80, y: 0 }, style: 'drop', color: '#7C5CD6' },
  ],
  glyph: [{ at: 6.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'peng', emoji: '🎯', dur: 0.5 },
    { at: 1.75, kind: 'pop', actor: 'peng', emoji: '😑', dur: 0.5 },
    { at: 1.9, kind: 'pop', actor: 'seal', emoji: '😆', dur: 0.6 },
    { at: 2.95, kind: 'burst', actor: 'peng', emoji: '❄️', n: 6, dur: 0.5 },
    { at: 3.4, kind: 'bubble', actor: 'peng', emoji: '😤', dur: 0.5 },
    { at: 4.7, kind: 'sweat', actor: 'peng' },
    { at: 5.3, kind: 'pop', actor: 'seal', emoji: '😱', dur: 0.45 },
    { at: 5.75, kind: 'burst', x: 118, y: 58, emoji: '❄️', n: 8, dur: 0.6 },
    { at: 6.1, kind: 'dizzy', actor: 'seal', dur: 0.7 },
    { at: 7.7, kind: 'pop', actor: 'peng', emoji: '😍', dur: 0.6 },
    { at: 8.8, kind: 'burst', actor: 'peng', emoji: '❄️', n: 6, dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'seal', emoji: '😆', dur: 0.7 },
    { at: 9.1, kind: 'bubble', actor: 'peng', emoji: '😵', dur: 0.7 },
  ],
  camera: [
    { at: 4.7, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 60, y: 60 } },
    { at: 5.75, dur: 0.5, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.2, sfx: 'whoosh' },
    { at: 1.3, say: '雪' },
    { at: 1.7, sfx: 'plop' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 2.95, sfx: 'plop' },
    { at: 3.7, sfx: 'slide' },
    { at: 5.3, sfx: 'rumble' },
    { at: 5.75, sfx: 'bonk' },
    { at: 6.9, say: '雪' },
    { at: 7.6, sfx: 'poof' },
    { at: 7.85, say: '雪人' },
    { at: 8.55, sfx: 'whoosh' },
    { at: 8.8, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
