import type { Clip } from '../clip'

// 怕：超大暴龍「吼——」地走進來，結果一隻小小的瓢蟲爬過來，暴龍嚇得跳起來，躲到一株小小的草後面發抖（根本躲不住）。
// 瓢蟲友善地揮手，暴龍還是尖叫。最後瓢蟲飛到暴龍鼻子上，暴龍直接嚇昏。怕、怕、害怕
const clip: Clip = {
  char: '怕',
  meta: { theme: '恐龍', cast: '大暴龍＋小瓢蟲', gags: ['大怕小', '躲不住', '友善卻被誤會', '嚇昏'] },
  duration: 10,
  bg: { top: '#E9FFF5', bottom: '#CDF1DD', floor: '#A9D98E', scenery: 'forest' },
  actors: [
    { id: 'rex', emoji: '🦖', x: 44, y: 66.1, size: 26, hidden: true, flip: true },
    { id: 'sprout', emoji: '🌱', x: 31, y: 72.8, size: 10, hidden: true },
    { id: 'bug', emoji: '🐞', x: 100, y: 74.9, size: 5, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'sprout', do: 'pop' },
    { at: 0, actor: 'rex', do: 'enter', from: { x: -20, y: 66.1 }, dur: 0.8 },
    { at: 0, actor: 'rex', do: 'bounce', dur: 0.8, times: 4, amount: 1.5 },
    { at: 0.9, actor: 'rex', do: 'squash', amount: -0.2, dur: 0.5 },
    // 小瓢蟲爬進來
    { at: 1.4, actor: 'bug', do: 'enter', from: { x: 170, y: 74.9 }, dur: 0.6 },
    { at: 1.4, actor: 'bug', do: 'bounce', dur: 0.6, times: 5, amount: 0.6 },
    // 嚇到跳起來
    { at: 2.1, actor: 'rex', do: 'hop', dur: 0.5, amount: 20 },
    { at: 2.1, actor: 'rex', do: 'squash', amount: -0.2, dur: 0.5 },
    // 躲到小草後面（根本躲不住）
    { at: 2.7, actor: 'rex', do: 'moveTo', to: { x: 26, y: 66.1 }, dur: 0.3 },
    { at: 3.0, actor: 'rex', do: 'shake', dur: 1.8, amount: 0.8 },
    { at: 3.2, actor: 'bug', do: 'moveTo', to: { x: 46, y: 74.9 }, dur: 1.0 },
    { at: 3.2, actor: 'bug', do: 'bounce', dur: 1.0, times: 8, amount: 0.6 },
    // 瓢蟲揮手，暴龍尖叫
    { at: 6.4, actor: 'bug', do: 'hop', dur: 0.3, amount: 2 },
    { at: 6.5, actor: 'rex', do: 'hop', dur: 0.4, amount: 8 },
    // 瓢蟲飛到鼻子上——嚇昏
    { at: 8.1, actor: 'bug', do: 'moveTo', to: { x: 36, y: 58 }, dur: 0.5, arc: 8 },
    { at: 8.7, actor: 'rex', do: 'shake', dur: 0.4, amount: 0.4 },
    { at: 9.1, actor: 'rex', do: 'rotateTo', amount: -80, dur: 0.35 },
    { at: 9.1, actor: 'bug', do: 'moveTo', to: { x: 44, y: 74.9 }, dur: 0.35, arc: 6 },
  ],
  builds: [
    // 暴龍抖下來的冷汗 → 忄；瓢蟲的殼 → 白
    { at: 4.9, dur: 0.5, strokes: [0, 1, 2], from: 'rex', color: '#E2463A' },
    { at: 5.2, dur: 0.7, strokes: [3, 4, 5, 6, 7], from: 'bug', color: '#2D2D3A' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'rex', emoji: '💪', dur: 0.6 },
    { at: 2.0, kind: 'pop', actor: 'rex', emoji: '😱', dur: 0.6 },
    { at: 3.0, kind: 'sweat', actor: 'rex' },
    { at: 3.7, kind: 'sweat', actor: 'rex' },
    { at: 6.4, kind: 'pop', actor: 'bug', emoji: '👋', dur: 0.8 },
    { at: 6.5, kind: 'pop', actor: 'rex', emoji: '😱', dur: 0.6 },
    { at: 7.0, kind: 'bubble', actor: 'bug', emoji: '❤️', dur: 0.7 },
    { at: 8.6, kind: 'bubble', actor: 'rex', emoji: '😵', dur: 0.5 },
    { at: 9.45, kind: 'dizzy', actor: 'rex', dur: 0.55 },
  ],
  camera: [
    { at: 0.9, dur: 0.5, do: 'shake', amount: 1.5 },
    { at: 2.1, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 44, y: 52 } },
    { at: 8.6, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 34, y: 58 } },
  ],
  cues: [
    { at: 0.9, sfx: 'rumble' },
    { at: 2.1, sfx: 'slide' },
    { at: 2.3, say: '怕' },
    { at: 5.95, say: '怕' },
    { at: 6.5, sfx: 'slide' },
    { at: 6.9, say: '害怕' },
    { at: 9.1, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
