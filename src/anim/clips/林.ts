import type { Clip } from '../clip'

// 林：河狸伐木工想咬樹，樹往旁邊一閃；再咬，樹從牠頭上跳過去；河狸轉成電鋸模式衝過去，兩棵樹一起跳開，河狸撞上大石頭。
// 兩棵樹得意地變成「林」。河狸偷偷去咬國字——連國字都會閃！四周冒出一整片森林，最後連小芽都逃走。林、林、森林
const clip: Clip = {
  char: '林',
  meta: { theme: '伐木工', cast: '河狸＋會躲的樹', gags: ['樹會閃開', '從頭上跳過去', '衝太猛撞石頭', '連國字跟小芽都會閃'] },
  duration: 10,
  bg: { top: '#E4F7E0', bottom: '#BFE6B5', floor: '#7DAA5A', scenery: 'forest' },
  actors: [
    { id: 'rock', emoji: '🪨', x: 150, y: 71, size: 12.5 },
    { id: 'm1', emoji: '🌲', x: 8, y: 70.7, size: 15, hidden: true },
    { id: 'm2', emoji: '🌲', x: 20, y: 70.7, size: 15, hidden: true },
    { id: 'm3', emoji: '🌲', x: 32, y: 70.7, size: 15, hidden: true },
    { id: 'm4', emoji: '🌲', x: 44, y: 70.7, size: 15, hidden: true },
    { id: 't1', emoji: '🌲', x: 66, y: 68.6, size: 20 },
    { id: 't2', emoji: '🌳', x: 104, y: 68.6, size: 20 },
    { id: 'sprout', emoji: '🌱', x: 128, y: 73.9, size: 7.5, hidden: true },
    { id: 'beaver', emoji: '🦫', x: 22, y: 70.2, size: 16.2, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'beaver', do: 'enter', from: { x: -15, y: 70.2 }, dur: 0.6 },
    // 第一口：樹往旁邊閃
    { at: 1, actor: 'beaver', do: 'moveTo', to: { x: 52, y: 70.2 }, dur: 0.3 },
    { at: 1.36, actor: 'beaver', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 1.36, actor: 'beaver', do: 'moveTo', to: { x: 56, y: 70.2 }, dur: 0.15 },
    { at: 1.36, actor: 't1', do: 'moveTo', to: { x: 82, y: 68.6 }, dur: 0.2 },
    { at: 1.74, actor: 't1', do: 'tilt', amount: 10, dur: 0.4 },
    // 第二口：樹從頭上跳過去
    { at: 2.39, actor: 'beaver', do: 'moveTo', to: { x: 72, y: 70.2 }, dur: 0.2 },
    { at: 2.39, actor: 't1', do: 'moveTo', to: { x: 44, y: 68.6 }, dur: 0.45, arc: 24 },
    { at: 2.61, actor: 'beaver', do: 'squash', amount: -0.25, dur: 0.25 },
    // 電鋸模式衝過去：大樹跳起來，河狸撞上石頭
    { at: 3.37, actor: 'beaver', do: 'spin', times: 3, dur: 0.5 },
    { at: 3.91, actor: 'beaver', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 4.02, actor: 'beaver', do: 'moveTo', to: { x: 140, y: 70.2 }, dur: 0.35 },
    { at: 3.97, actor: 't2', do: 'hop', amount: 26, dur: 0.5 },
    { at: 4.4, actor: 'rock', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.4, actor: 'beaver', do: 'moveTo', to: { x: 128, y: 70.2 }, dur: 0.3, arc: 6 },
    // 兩棵樹偷笑，變成字
    { at: 4.67, actor: 't1', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
    { at: 4.67, actor: 't2', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
    { at: 5.05, actor: 't1', do: 'vanish', dur: 0.2 },
    { at: 5.55, actor: 't2', do: 'vanish', dur: 0.2 },
    // 偷咬國字——國字也會閃
    { at: 6.6, actor: 'beaver', do: 'flip' },
    { at: 6.6, actor: 'beaver', do: 'moveTo', to: { x: 116, y: 70.2 }, dur: 0.5 },
    { at: 6.6, actor: 'beaver', do: 'squash', amount: 0.2, dur: 0.5 },
    { at: 7.15, actor: 'beaver', do: 'moveTo', to: { x: 112, y: 70.2 }, dur: 0.12 },
    { at: 7.15, actor: 'beaver', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 7.4, actor: 'beaver', do: 'moveTo', to: { x: 118, y: 70.2 }, dur: 0.25 },
    // 冒出一整片森林
    { at: 7.6, actor: 'm1', do: 'pop' },
    { at: 7.7, actor: 'm2', do: 'pop' },
    { at: 7.8, actor: 'm3', do: 'pop' },
    { at: 7.89, actor: 'm4', do: 'pop' },
    { at: 8.24, actor: 'm1', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.24, actor: 'm3', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.33, actor: 'm2', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.33, actor: 'm4', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 最後咬小芽——小芽也逃走
    { at: 8.42, actor: 'sprout', do: 'pop' },
    { at: 8.68, actor: 'beaver', do: 'flip' },
    { at: 8.94, actor: 'beaver', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 8.94, actor: 'sprout', do: 'moveTo', to: { x: 140, y: 73.9 }, dur: 0.35, arc: 8 },
    { at: 9.21, actor: 'beaver', do: 'squash', amount: 0.35, dur: 0.3 },
  ],
  builds: [
    // 左邊那棵樹 → 左木；大樹 → 右木
    { at: 5, dur: 0.7, strokes: [0, 1, 2, 3], from: 't1', color: '#3E8E41' },
    { at: 5.5, dur: 0.7, strokes: [4, 5, 6, 7], from: 't2', color: '#8C5A2B' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 7.15, dur: 0.5, do: 'shake' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'beaver', emoji: '🪵', dur: 0.6 },
    { at: 1.74, kind: 'pop', actor: 't1', emoji: '😜', dur: 0.5 },
    { at: 1.85, kind: 'pop', actor: 'beaver', emoji: '❓', dur: 0.4 },
    { at: 2.94, kind: 'pop', actor: 'beaver', emoji: '💢', dur: 0.4 },
    { at: 3.37, kind: 'puff', actor: 'beaver' },
    { at: 4.02, kind: 'puff', actor: 'beaver' },
    { at: 4.4, kind: 'burst', actor: 'rock', dur: 0.4 },
    { at: 4.67, kind: 'dizzy', actor: 'beaver', dur: 1.2 },
    { at: 6.5, kind: 'bubble', actor: 'beaver', emoji: '😏', dur: 0.5 },
    { at: 7.3, kind: 'pop', actor: 'beaver', emoji: '😳', dur: 0.5 },
    { at: 8.5, kind: 'sweat', actor: 'beaver' },
    { at: 9.03, kind: 'puff', actor: 'sprout' },
    { at: 9.25, kind: 'bubble', actor: 'beaver', emoji: '😭', dur: 0.8 },
  ],
  camera: [
    { at: 4.4, dur: 0.4, do: 'shake', amount: 2 },
    { at: 7.15, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 100, y: 50 } },
  ],
  cues: [
    { at: 1.36, sfx: 'whoosh' },
    { at: 1.58, say: '林' },
    { at: 2.39, sfx: 'boing' },
    { at: 2.61, sfx: 'clink' },
    { at: 3.37, sfx: 'rumble' },
    { at: 4.02, sfx: 'whoosh' },
    { at: 4.4, sfx: 'bonk' },
    { at: 6.3, say: '林' },
    { at: 7.15, sfx: 'whoosh' },
    { at: 7.6, sfx: 'poof' },
    { at: 7.8, say: '森林' },
    { at: 8.94, sfx: 'clink' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
