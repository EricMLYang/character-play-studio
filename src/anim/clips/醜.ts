import type { Clip } from '../clip'

// 醜：選美比賽，孔雀、紅鶴、天鵝都超美，最後上台的是一隻怪怪的渡渡鳥。孔雀轉圈展示尾巴轉到頭暈，一倒就像骨牌壓倒紅鶴和天鵝，羽毛飛成「醜」。
// 渡渡鳥跳起怪怪舞，評審猴子愛死了，皇冠給牠！孔雀不服氣學牠扮醜，結果又暈倒，三個再倒一次。醜、醜、醜八怪
const clip: Clip = {
  char: '醜',
  meta: { theme: '選美比賽', cast: '孔雀＋紅鶴＋天鵝＋渡渡鳥＋猴子評審', gags: ['轉圈轉到暈', '骨牌倒成一排', '怪怪的贏了', '學扮醜又倒一次'] },
  duration: 10,
  bg: { top: '#FFE3F1', bottom: '#FFC9E3', floor: '#C77DAA', scenery: 'track' },
  actors: [
    { id: 'peacock', emoji: '🦚', x: 44, y: 71.5, size: 13, hidden: true },
    { id: 'flamingo', emoji: '🦩', x: 57, y: 71.5, size: 13, hidden: true },
    { id: 'swan', emoji: '🦢', x: 70, y: 71.5, size: 13, hidden: true },
    { id: 'dodo', emoji: '🦤', x: 126, y: 71.5, size: 13, hidden: true },
    { id: 'judge', emoji: '🐒', x: 148, y: 72.4, size: 11, hidden: true },
    { id: 'crown', emoji: '👑', x: 126, y: 62, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'peacock', do: 'pop' },
    { at: 0.15, actor: 'flamingo', do: 'pop' },
    { at: 0.3, actor: 'swan', do: 'pop' },
    { at: 0.4, actor: 'judge', do: 'pop' },
    { at: 0.6, actor: 'peacock', do: 'flash', dur: 0.6 },
    { at: 0.7, actor: 'swan', do: 'tilt', amount: -10, dur: 0.4 },
    // 最後上台的是怪怪的渡渡鳥
    { at: 1.1, actor: 'dodo', do: 'enter', from: { x: 176, y: 71.5 }, dur: 0.4 },
    { at: 1.5, actor: 'dodo', do: 'squash', amount: 0.3, dur: 0.25 },
    // 孔雀轉圈展示，轉到頭暈
    { at: 2.0, actor: 'peacock', do: 'spin', times: 3, dur: 0.6 },
    { at: 2.65, actor: 'peacock', do: 'tilt', amount: -15, dur: 0.25 },
    // 骨牌倒成一排
    { at: 2.9, actor: 'peacock', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 2.9, actor: 'peacock', do: 'moveTo', to: { x: 44, y: 64.5 }, dur: 0.3 },
    { at: 3.15, actor: 'flamingo', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 3.15, actor: 'flamingo', do: 'moveTo', to: { x: 57, y: 64.5 }, dur: 0.3 },
    { at: 3.4, actor: 'swan', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 3.4, actor: 'swan', do: 'moveTo', to: { x: 70, y: 64.5 }, dur: 0.3 },
    // 爬起來退到旁邊
    { at: 4.3, actor: 'peacock', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 4.3, actor: 'peacock', do: 'moveTo', to: { x: 12, y: 71.5 }, dur: 0.4 },
    { at: 4.4, actor: 'flamingo', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 4.4, actor: 'flamingo', do: 'moveTo', to: { x: 26, y: 71.5 }, dur: 0.4 },
    { at: 4.5, actor: 'swan', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 4.5, actor: 'swan', do: 'moveTo', to: { x: 40, y: 71.5 }, arc: 8, dur: 0.5 },
    // 渡渡鳥跳怪怪舞
    { at: 4.6, actor: 'dodo', do: 'bounce', amount: 4, times: 4, dur: 1.0 },
    { at: 4.7, actor: 'dodo', do: 'tilt', amount: 20, dur: 0.4 },
    { at: 5.1, actor: 'dodo', do: 'tilt', amount: -20, dur: 0.4 },
    { at: 5.0, actor: 'judge', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
    // 皇冠給牠
    { at: 6.6, actor: 'crown', do: 'drop', dur: 0.6 },
    // 孔雀學扮醜，又暈倒，三個再倒一次
    { at: 8.05, actor: 'peacock', do: 'bounce', amount: 4, times: 3, dur: 0.5 },
    { at: 8.1, actor: 'peacock', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 8.6, actor: 'peacock', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 8.6, actor: 'peacock', do: 'moveTo', to: { x: 12, y: 64.5 }, dur: 0.3 },
    { at: 8.85, actor: 'flamingo', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 8.85, actor: 'flamingo', do: 'moveTo', to: { x: 26, y: 64.5 }, dur: 0.3 },
    { at: 9.1, actor: 'swan', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 9.1, actor: 'swan', do: 'moveTo', to: { x: 40, y: 64.5 }, dur: 0.3 },
    { at: 9.3, actor: 'judge', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 三個倒下噴出來的羽毛 → 酉；渡渡鳥的怪怪舞 → 鬼
    { at: 3.9, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'swan', color: '#8E44AD' },
    { at: 5.0, dur: 0.7, strokes: [7, 8, 9, 10, 11, 12], from: 'dodo', color: '#16A085' },
    { at: 5.6, dur: 0.6, strokes: [13, 14, 15, 16], from: 'dodo', style: 'drop', color: '#E67E22' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.65, kind: 'burst', actor: 'peacock', emoji: '✨', n: 6, dur: 0.6 },
    { at: 1.55, kind: 'pop', actor: 'judge', emoji: '❓', dur: 0.6 },
    { at: 1.6, kind: 'pop', actor: 'swan', emoji: '😒', dur: 0.6 },
    { at: 2.65, kind: 'dizzy', actor: 'peacock', dur: 0.6 },
    { at: 3.65, kind: 'burst', actor: 'swan', emoji: '🪶', n: 8, dur: 0.6 },
    { at: 3.7, kind: 'pop', actor: 'dodo', emoji: '😮', dur: 0.5 },
    { at: 5.0, kind: 'burst', actor: 'dodo', emoji: '💕', n: 6, dur: 0.6 },
    { at: 5.1, kind: 'pop', actor: 'judge', emoji: '😍', dur: 0.7 },
    { at: 7.1, kind: 'burst', actor: 'crown', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.2, kind: 'pop', actor: 'dodo', emoji: '🤪', dy: -5, dur: 0.8 },
    { at: 7.4, kind: 'pop', actor: 'peacock', emoji: '😤', dur: 0.5 },
    { at: 7.95, kind: 'pop', actor: 'peacock', emoji: '🤪', dur: 0.5 },
    { at: 9.35, kind: 'dizzy', actor: 'swan', dy: 5, dur: 0.65 },
    { at: 9.3, kind: 'pop', actor: 'judge', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 3.4, dur: 0.5, do: 'shake', amount: 1.5 },
    { at: 7.1, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 126, y: 64 } },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.5, sfx: 'plop' },
    { at: 1.65, say: '醜' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 2.9, sfx: 'bonk' }, { at: 3.15, sfx: 'bonk' }, { at: 3.4, sfx: 'bonk' },
    { at: 4.6, sfx: 'boing' },
    { at: 6.25, say: '醜' },
    { at: 7.1, sfx: 'clink' },
    { at: 7.35, say: '醜八怪' },
    { at: 8.6, sfx: 'bonk' }, { at: 8.85, sfx: 'bonk' }, { at: 9.1, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
