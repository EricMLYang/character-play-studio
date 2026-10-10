import type { Clip } from '../clip'

// 昨：小狗記得昨天把骨頭埋在這裡，挖一個洞——挖到一隻襪子；再挖一個洞——挖到一隻生氣的鼴鼠；
// 用力挖最大的洞，沙土噴成「昨」……挖出一根超——大的恐龍骨頭！小狗扛不動，被骨頭壓在下面。昨、昨、昨天
const clip: Clip = {
  char: '昨',
  meta: { theme: '挖骨頭', cast: '小狗＋鼴鼠＋恐龍骨頭', gags: ['挖錯東西', '挖出意外的傢伙', '挖到太大的'] },
  duration: 10,
  bg: { top: '#DDF1FF', bottom: '#F7F3E6', floor: '#C9A06A', scenery: 'desert' },
  actors: [
    { id: 'hole1', emoji: '🕳️', x: 34, y: 75, size: 14, hidden: true, float: true },
    { id: 'hole2', emoji: '🕳️', x: 132, y: 75, size: 14, hidden: true, float: true },
    { id: 'sock', emoji: '🧦', x: 34, y: 60, size: 10, hidden: true, float: true },
    { id: 'mole', emoji: '🦫', x: 132, y: 70, size: 13, hidden: true },
    { id: 'dog', emoji: '🐕', x: 50, y: 69.5, size: 18, hidden: true },
    { id: 'bone', emoji: '🦴', x: 136, y: 70, size: 34, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 第一個洞——挖到一隻襪子
    { at: 1.4, actor: 'dog', do: 'shake', amount: 1.5, dur: 0.8 },
    { at: 1.6, actor: 'hole1', do: 'pop', dur: 0.4 },
    { at: 2.2, actor: 'sock', do: 'pop', dur: 0.3 },
    { at: 2.5, actor: 'sock', do: 'moveTo', to: { x: -10, y: 30 }, dur: 0.6, arc: 10 },
    // 第二個洞——挖到生氣的鼴鼠
    { at: 3.1, actor: 'dog', do: 'flip' },
    { at: 3.15, actor: 'dog', do: 'moveTo', to: { x: 116, y: 69.5 }, dur: 0.5 },
    { at: 3.7, actor: 'dog', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 3.8, actor: 'hole2', do: 'pop', dur: 0.4 },
    { at: 4.3, actor: 'mole', do: 'pop', dur: 0.3 },
    { at: 4.5, actor: 'mole', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.6, actor: 'dog', do: 'moveTo', to: { x: 96, y: 69.5 }, dur: 0.3, arc: 6 },
    { at: 5.0, actor: 'mole', do: 'vanish', dur: 0.2 },
    // 用力挖最大的洞——挖出超大恐龍骨頭
    { at: 5.4, actor: 'dog', do: 'shake', amount: 2.5, dur: 0.8 },
    { at: 6.4, actor: 'bone', do: 'pop', dur: 0.4 },
    { at: 6.4, actor: 'dog', do: 'moveTo', to: { x: 22, y: 69.5 }, dur: 0.5, arc: 8 },
    // 小狗想扛起來——被壓在下面
    { at: 8.0, actor: 'dog', do: 'moveTo', to: { x: 132, y: 69.5 }, dur: 0.5 },
    { at: 8.5, actor: 'bone', do: 'moveTo', to: { x: 136, y: 62 }, dur: 0.3 },
    { at: 8.8, actor: 'bone', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 9.2, actor: 'bone', do: 'moveTo', to: { x: 136, y: 70 }, dur: 0.15 },
    { at: 9.2, actor: 'dog', do: 'squash', amount: 0.5, dur: 0.4 },
  ],
  builds: [
    // 挖得沙土亂噴：日、乍
    { at: 5.5, dur: 0.5, strokes: [0, 1, 2, 3], from: 'dog', color: '#A0522D' },
    { at: 5.85, dur: 0.7, strokes: [4, 5, 6, 7, 8], from: 'dog', color: '#E3A23A' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'dog', emoji: '🦴', dur: 0.8 },
    { at: 1.4, kind: 'puff', actor: 'dog', dur: 0.8 },
    { at: 2.3, kind: 'pop', actor: 'dog', emoji: '😑', dur: 0.6 },
    { at: 3.7, kind: 'puff', actor: 'dog', dur: 0.6 },
    { at: 4.4, kind: 'pop', actor: 'mole', emoji: '💢', dur: 0.6 },
    { at: 4.6, kind: 'sweat', actor: 'dog' },
    { at: 5.4, kind: 'puff', actor: 'dog', dur: 0.8 },
    { at: 6.5, kind: 'burst', actor: 'bone', emoji: '✨', n: 7, dur: 0.6 },
    { at: 6.7, kind: 'pop', actor: 'dog', emoji: '😍', dur: 0.8 },
    { at: 9.3, kind: 'pop', actor: 'dog', emoji: '😵', dur: 0.7, dx: -6 },
  ],
  camera: [
    { at: 6.4, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 120, y: 60 } },
    { at: 9.2, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 0.8, say: '昨' },
    { at: 1.4, sfx: 'slide' },
    { at: 2.2, sfx: 'plop' },
    { at: 3.7, sfx: 'slide' },
    { at: 4.3, sfx: 'boing' },
    { at: 5.4, sfx: 'rumble' },
    { at: 6.4, sfx: 'blip' },
    { at: 7.2, say: '昨' },
    { at: 8.2, say: '昨天' },
    { at: 9.2, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
