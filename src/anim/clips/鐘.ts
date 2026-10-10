import type { Clip } from '../clip'

// 鐘：貓熊在睡覺，鬧鐘響了。拍一下按掉；鬧鐘變大又響，還跳到床上耳邊吵，貓熊一掌把它打飛出窗外——
// 結果它變成超巨大鬧鐘衝回來，響到貓熊整隻彈起來，齒輪炸開變成「鐘」。又跑出一個迷你鬧鐘；貓熊戴耳機想再睡，這次連國字都響了。鐘、鐘、鬧鐘
const clip: Clip = {
  char: '鐘',
  meta: { theme: '起床大戰', cast: '貓熊＋鬧鐘', gags: ['按掉又響', '越響越大', '打飛又衝回來', '連國字都響'] },
  duration: 10,
  bg: { top: '#EEE7FB', bottom: '#D6CAF1', floor: '#A792D6', scenery: 'room' },
  actors: [
    { id: 'bed', emoji: '🛏️', x: 30, y: 64.4, size: 30, hidden: true },
    { id: 'panda', emoji: '🐼', x: 22, y: 57, size: 15, hidden: true, float: true },
    { id: 'clock', emoji: '⏰', x: 58, y: 71.8, size: 12.5, hidden: true },
    { id: 'mini', emoji: '⏰', x: 136, y: 73.9, size: 7.5, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bed', do: 'pop' },
    { at: 0.1, actor: 'panda', do: 'pop' },
    { at: 0.25, actor: 'clock', do: 'pop' },
    // 第一次響：拍一下按掉
    { at: 1.2, actor: 'clock', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 1.2, actor: 'clock', do: 'flash', dur: 0.6 },
    { at: 1.9, actor: 'panda', do: 'moveTo', to: { x: 46, y: 64 }, dur: 0.15, arc: 3 },
    { at: 2.05, actor: 'clock', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 2.21, actor: 'panda', do: 'moveTo', to: { x: 22, y: 57 }, dur: 0.2 },
    // 第二次：變大、跳到床上耳邊吵
    { at: 2.97, actor: 'clock', do: 'scaleTo', amount: 1.5, dur: 0.2 },
    { at: 2.97, actor: 'clock', do: 'bounce', dur: 0.6, times: 3, amount: 4 },
    { at: 2.97, actor: 'clock', do: 'shake', amount: 2, dur: 0.6 },
    { at: 3.07, actor: 'panda', do: 'moveTo', to: { x: 22, y: 62 }, dur: 0.2 },
    { at: 3.61, actor: 'clock', do: 'moveTo', to: { x: 36, y: 50 }, dur: 0.4, arc: 10 },
    { at: 4.04, actor: 'clock', do: 'shake', amount: 2, dur: 0.4 },
    // 一掌打飛出窗外
    { at: 4.31, actor: 'panda', do: 'moveTo', to: { x: 22, y: 55 }, dur: 0.1 },
    { at: 4.36, actor: 'clock', do: 'moveTo', to: { x: 175, y: 18 }, dur: 0.4, arc: 10 },
    { at: 4.36, actor: 'clock', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.57, actor: 'panda', do: 'moveTo', to: { x: 22, y: 57 }, dur: 0.2 },
    // 超巨大鬧鐘衝回來
    { at: 4.95, actor: 'clock', do: 'scaleTo', amount: 2, dur: 0.35 },
    { at: 4.95, actor: 'clock', do: 'moveTo', to: { x: 112, y: 64 }, dur: 0.35, arc: 12 },
    { at: 5.32, actor: 'clock', do: 'shake', amount: 3, dur: 0.4 },
    { at: 5.32, actor: 'clock', do: 'flash', dur: 0.4 },
    { at: 5.38, actor: 'panda', do: 'hop', amount: 26, dur: 0.7 },
    { at: 5.38, actor: 'panda', do: 'spin', times: 2, dur: 0.7 },
    { at: 5.7, actor: 'clock', do: 'vanish', dur: 0.15 },
    // 迷你鬧鐘
    { at: 7.6, actor: 'mini', do: 'pop', dur: 0.3 },
    { at: 8, actor: 'mini', do: 'shake', amount: 1, dur: 0.6 },
    { at: 8, actor: 'mini', do: 'bounce', dur: 0.6, times: 3, amount: 2 },
    // 戴耳機繼續睡——國字自己響了
    { at: 9.1, actor: 'panda', do: 'hop', amount: 16, dur: 0.5 },
    { at: 9.1, actor: 'panda', do: 'spin', times: 1, dur: 0.5 },
    { at: 9.1, actor: 'mini', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
  ],
  builds: [
    // 齒輪炸開
    { at: 5.7, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'clock', color: '#E3A400' },
    { at: 6.09, dur: 0.6, strokes: [8, 9, 10, 11, 12], from: 'clock', color: '#4A5BC4' },
    { at: 6.33, dur: 0.8, strokes: [13, 14, 15, 16, 17, 18, 19], from: 'clock', color: '#C2417A' },
  ],
  glyph: [{ at: 7.1, dur: 0.4, do: 'wobble' }, { at: 9.05, dur: 0.5, do: 'shake' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'panda', dur: 1.3 },
    { at: 1.2, kind: 'zzz', actor: 'clock', emoji: '🔔', dur: 0.7 },
    { at: 2.05, kind: 'burst', actor: 'clock', n: 1, dur: 0.35 },
    { at: 2.43, kind: 'zzz', actor: 'panda', dur: 0.6 },
    { at: 2.97, kind: 'zzz', actor: 'clock', emoji: '🔔', dur: 1.4 },
    { at: 3.18, kind: 'pop', actor: 'panda', emoji: '😫', dur: 0.4 },
    { at: 4.14, kind: 'pop', actor: 'panda', emoji: '💢', dur: 0.3, dx: -10 },
    { at: 4.68, kind: 'bubble', actor: 'panda', emoji: '😌', dur: 0.3 },
    { at: 5.32, kind: 'zzz', actor: 'clock', emoji: '🔔', dur: 0.4 },
    { at: 5.7, kind: 'burst', actor: 'clock', emoji: '⚙️', n: 8, dur: 0.7 },
    { at: 6.14, kind: 'dizzy', actor: 'panda', dur: 0.8 },
    { at: 8, kind: 'zzz', actor: 'mini', emoji: '🔔', dur: 0.7 },
    { at: 8.2, kind: 'pop', actor: 'panda', emoji: '😩', dur: 0.4 },
    { at: 8.51, kind: 'pop', actor: 'panda', emoji: '🎧', dur: 0.5, dx: -10, dy: 6 },
    { at: 8.56, kind: 'zzz', actor: 'panda', dur: 0.6 },
    { at: 9.05, kind: 'burst', x: 80, y: 40, emoji: '🔔', n: 6, dur: 0.5 },
    { at: 9.55, kind: 'dizzy', actor: 'panda', dur: 0.5 },
  ],
  camera: [
    { at: 4.04, dur: 0.5, do: 'punch', amount: 0.25, to: { x: 30, y: 55 } },
    { at: 5.32, dur: 0.5, do: 'shake', amount: 2.2 },
  ],
  cues: [
    { at: 1.2, sfx: 'clink' }, { at: 1.35, sfx: 'clink' },
    { at: 1.55, say: '鐘' },
    { at: 2.05, sfx: 'bonk' },
    { at: 2.97, sfx: 'clink' }, { at: 3.13, sfx: 'clink' }, { at: 3.29, sfx: 'clink' }, { at: 4.04, sfx: 'clink' }, { at: 4.2, sfx: 'clink' },
    { at: 4.36, sfx: 'whoosh' },
    { at: 4.95, sfx: 'rumble' },
    { at: 5.32, sfx: 'clink' }, { at: 5.43, sfx: 'clink' }, { at: 5.54, sfx: 'clink' },
    { at: 5.7, sfx: 'poof' },
    { at: 7.15, say: '鐘' },
    { at: 8, sfx: 'blip' },
    { at: 8.15, say: '鬧鐘' },
    { at: 9.05, sfx: 'clink' }, { at: 9.14, sfx: 'clink' }, { at: 9.23, sfx: 'clink' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
