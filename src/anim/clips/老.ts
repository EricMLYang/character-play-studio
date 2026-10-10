import type { Clip } from '../clip'

// 老：戴眼鏡的老老虎想吼一聲嚇跑小老鼠——只咳了兩下。深吸一大口氣用力吼，假牙「咻」地飛出去，被小老鼠接住。
// 小老鼠戴上假牙「吼！」——把老虎吼得往後翻，吼聲變成「老」。老鼠把假牙還給老虎，老虎再吼一次……假牙又飛走了。老、老、老虎
const clip: Clip = {
  char: '老',
  meta: { theme: '老老虎', cast: '老虎爺爺＋小老鼠＋假牙', gags: ['吼不出來只會咳', '假牙飛出去', '小傢伙吼贏大傢伙', '又飛走了'] },
  duration: 10,
  bg: { top: '#FFE7C8', bottom: '#FFF5E6', floor: '#9BB86A', scenery: 'forest' },
  actors: [
    { id: 'tiger', emoji: '🐯', x: 32, y: 67, size: 24, hidden: true },
    { id: 'glasses', emoji: '👓', x: 32, y: 61, size: 12, hidden: true, float: true },
    { id: 'mouse', emoji: '🐭', x: 124, y: 71.5, size: 14, hidden: true },
    { id: 'teeth', emoji: '🦷', x: 32, y: 70, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tiger', do: 'pop' },
    { at: 0.15, actor: 'glasses', do: 'pop' },
    { at: 0.3, actor: 'mouse', do: 'enter', from: { x: 178, y: 71.5 }, dur: 0.7 },
    { at: 1.0, actor: 'mouse', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
    // 吼——只咳了兩下
    { at: 1.2, actor: 'tiger', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 1.2, actor: 'glasses', do: 'hop', amount: 2, dur: 0.4 },
    { at: 1.7, actor: 'tiger', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 1.7, actor: 'glasses', do: 'shake', amount: 0.8, dur: 0.5 },
    // 深吸一大口氣，用力吼——假牙飛出去
    { at: 2.9, actor: 'tiger', do: 'scaleTo', amount: 1.25, dur: 0.6 },
    { at: 2.9, actor: 'glasses', do: 'moveTo', to: { x: 32, y: 58 }, dur: 0.6 },
    { at: 3.6, actor: 'tiger', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 3.6, actor: 'tiger', do: 'scaleTo', amount: 0.8, dur: 0.3 },
    { at: 3.6, actor: 'glasses', do: 'moveTo', to: { x: 32, y: 61 }, dur: 0.3 },
    { at: 3.62, actor: 'teeth', do: 'pop', dur: 0.1 },
    { at: 3.7, actor: 'teeth', do: 'moveTo', to: { x: 120, y: 62 }, dur: 0.7, arc: 22 },
    { at: 3.7, actor: 'teeth', do: 'spin', times: 2, dur: 0.7 },
    // 小老鼠戴上假牙——吼！
    { at: 4.5, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.9, actor: 'teeth', do: 'moveTo', to: { x: 124, y: 76 }, dur: 0.25 },
    { at: 5.1, actor: 'mouse', do: 'scaleTo', amount: 1.6, dur: 0.2 },
    { at: 5.1, actor: 'teeth', do: 'moveTo', to: { x: 124, y: 76 }, dur: 0.2 },
    { at: 5.3, actor: 'mouse', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 6.3, actor: 'mouse', do: 'scaleTo', amount: 0.625, dur: 0.3 },
    { at: 6.3, actor: 'teeth', do: 'moveTo', to: { x: 124, y: 76 }, dur: 0.3 },
    { at: 5.3, actor: 'teeth', do: 'shake', amount: 1.2, dur: 0.5 },
    // 老虎被吼得往後翻
    { at: 5.4, actor: 'tiger', do: 'moveTo', to: { x: 22, y: 67 }, dur: 0.5, arc: 12 },
    { at: 5.4, actor: 'tiger', do: 'spin', dur: 0.5 },
    { at: 5.4, actor: 'glasses', do: 'moveTo', to: { x: 22, y: 61 }, dur: 0.5, arc: 12 },
    { at: 5.9, actor: 'tiger', do: 'squash', amount: 0.3, dur: 0.3 },
    // 還假牙，老虎再吼一次——假牙又飛走了
    { at: 7.9, actor: 'teeth', do: 'moveTo', to: { x: 24, y: 70 }, dur: 0.6, arc: 14 },
    { at: 8.5, actor: 'teeth', do: 'vanish', dur: 0.1 },
    { at: 8.7, actor: 'tiger', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 8.72, actor: 'teeth', do: 'moveTo', to: { x: 24, y: 70 }, dur: 0.01 },
    { at: 8.75, actor: 'teeth', do: 'pop', dur: 0.1 },
    { at: 8.8, actor: 'teeth', do: 'moveTo', to: { x: 6, y: -10 }, dur: 0.6 },
    { at: 8.8, actor: 'teeth', do: 'spin', times: 2, dur: 0.6 },
  ],
  builds: [
    // 小老鼠的吼聲 → 上半；被吼飛的老虎 → 下半
    { at: 5.45, dur: 0.6, strokes: [0, 1, 2], from: 'mouse', color: '#E86A33' },
    { at: 5.85, dur: 0.6, strokes: [3, 4, 5], from: 'tiger', color: '#7A5CC9' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'tiger', emoji: '🐭', dur: 0.8 },
    { at: 1.7, kind: 'burst', actor: 'tiger', emoji: '💨', n: 3, dur: 0.4, dy: 12 },
    { at: 2.0, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.8 },
    { at: 3.0, kind: 'sweat', actor: 'tiger' },
    { at: 3.6, kind: 'burst', actor: 'tiger', emoji: '💨', n: 6, dur: 0.5, dy: 10 },
    { at: 4.0, kind: 'pop', actor: 'tiger', emoji: '😳', dur: 0.7 },
    { at: 5.3, kind: 'burst', actor: 'mouse', emoji: '💥', n: 6, dur: 0.6 },
    { at: 6.2, kind: 'dizzy', actor: 'tiger', dur: 1.2 },
    { at: 8.95, kind: 'pop', actor: 'tiger', emoji: '😱', dur: 0.8 },
    { at: 9.0, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 3.6, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 40, y: 60 } },
    { at: 5.3, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.3, say: '老' },
    { at: 1.7, sfx: 'hic' },
    { at: 2.0, sfx: 'hic' },
    { at: 2.9, sfx: 'gulp' },
    { at: 3.6, sfx: 'rumble' },
    { at: 3.7, sfx: 'whoosh' },
    { at: 4.9, sfx: 'clink' },
    { at: 5.3, sfx: 'rumble' },
    { at: 5.9, sfx: 'bonk' },
    { at: 6.55, say: '老' },
    { at: 7.45, say: '老虎' },
    { at: 8.8, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
