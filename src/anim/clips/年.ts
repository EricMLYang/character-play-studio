import type { Clip } from '../clip'

// 年：過年了！一隻大怪獸「年獸」跑來搗蛋，小兔子點一串鞭炮——「劈哩啪啦」！年獸嚇得跳起來；再點一串，年獸抱頭亂跑。
// 鞭炮的火花變成「年」。年獸躲在角落……原來牠只是想要紅包。小兔子給牠一個紅包，年獸開心地轉圈圈。年、年、過年
const clip: Clip = {
  char: '年',
  meta: { theme: '過年', cast: '年獸＋小兔子＋鞭炮', gags: ['大怪獸怕小鞭炮', '抱頭亂跑', '原來只想要紅包'] },
  duration: 10,
  bg: { top: '#3A1E3E', bottom: '#7A2E3A', floor: '#9C3B2E', scenery: 'night' },
  actors: [
    { id: 'lantern', emoji: '🏮', x: 24, y: 20, size: 12, hidden: true, float: true },
    { id: 'lantern2', emoji: '🏮', x: 136, y: 20, size: 12, hidden: true, float: true },
    { id: 'beast', emoji: '🐲', x: 128, y: 64, size: 30, hidden: true },
    { id: 'bunny', emoji: '🐰', x: 30, y: 70.3, size: 16, hidden: true },
    { id: 'cracker', emoji: '🧨', x: 54, y: 71, size: 12, hidden: true },
    { id: 'red', emoji: '🧧', x: 30, y: 60, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'lantern', do: 'pop' }, { at: 0.1, actor: 'lantern2', do: 'pop' },
    { at: 0.2, actor: 'bunny', do: 'pop' },
    { at: 0.4, actor: 'beast', do: 'enter', from: { x: 190, y: 64 }, dur: 0.8 },
    { at: 1.2, actor: 'beast', do: 'squash', amount: -0.25, dur: 0.4 },
    // 第一串鞭炮——年獸嚇得跳起來
    { at: 2.0, actor: 'cracker', do: 'pop' },
    { at: 2.6, actor: 'cracker', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 2.7, actor: 'beast', do: 'hop', amount: 18, dur: 0.6 },
    // 第二串——抱頭亂跑
    { at: 3.8, actor: 'cracker', do: 'shake', amount: 2, dur: 0.8 },
    { at: 3.9, actor: 'beast', do: 'moveTo', to: { x: 100, y: 64 }, dur: 0.3 },
    { at: 4.2, actor: 'beast', do: 'flip' },
    { at: 4.2, actor: 'beast', do: 'moveTo', to: { x: 146, y: 64 }, dur: 0.3 },
    { at: 4.5, actor: 'beast', do: 'flip' },
    { at: 4.5, actor: 'beast', do: 'moveTo', to: { x: 120, y: 64 }, dur: 0.3 },
    { at: 4.8, actor: 'cracker', do: 'vanish', dur: 0.2 },
    // 年獸躲在角落發抖
    { at: 5.1, actor: 'beast', do: 'moveTo', to: { x: 142, y: 64 }, dur: 0.4 },
    { at: 5.5, actor: 'beast', do: 'scaleTo', amount: 0.7, dur: 0.4 },
    { at: 5.9, actor: 'beast', do: 'shake', amount: 0.8, dur: 1.0 },
    // 小兔子給牠一個紅包——開心轉圈圈
    { at: 7.6, actor: 'red', do: 'pop' },
    { at: 7.9, actor: 'red', do: 'moveTo', to: { x: 136, y: 58 }, dur: 0.6, arc: 14 },
    { at: 8.5, actor: 'red', do: 'vanish', dur: 0.15 },
    { at: 8.55, actor: 'beast', do: 'scaleTo', amount: 1.43, dur: 0.3 },
    { at: 8.55, actor: 'beast', do: 'moveTo', to: { x: 134, y: 64 }, dur: 0.3 },
    { at: 8.85, actor: 'beast', do: 'bounce', amount: 4, times: 2, dur: 0.7 },
  ],
  builds: [
    // 鞭炮的火花
    { at: 4.8, dur: 0.6, strokes: [0, 1, 2, 3], from: 'cracker', color: '#FFC94D' },
    { at: 5.2, dur: 0.5, strokes: [4, 5], from: 'cracker', color: '#FF5A4E' },
  ],
  glyph: [{ at: 5.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.2, kind: 'burst', actor: 'beast', emoji: '💢', n: 4, dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'bunny', emoji: '😨', dur: 0.6 },
    { at: 2.0, kind: 'pop', actor: 'bunny', emoji: '💡', dur: 0.5 },
    { at: 2.6, kind: 'burst', actor: 'cracker', emoji: '💥', n: 6, dur: 0.5 },
    { at: 2.8, kind: 'pop', actor: 'beast', emoji: '😱', dur: 0.6 },
    { at: 3.8, kind: 'burst', actor: 'cracker', emoji: '✨', n: 8, dur: 0.8 },
    { at: 4.1, kind: 'sweat', actor: 'beast' },
    { at: 6.4, kind: 'bubble', actor: 'beast', emoji: '🧧', dur: 1.0 },
    { at: 8.8, kind: 'burst', actor: 'beast', emoji: '🎉', n: 7, dur: 0.6 },
  ],
  camera: [
    { at: 2.6, dur: 0.4, do: 'shake', amount: 1.5 },
    { at: 3.8, dur: 0.6, do: 'shake', amount: 1.8 },
  ],
  cues: [
    { at: 1.2, sfx: 'rumble' },
    { at: 1.5, say: '年' },
    { at: 2.6, sfx: 'crack' },
    { at: 2.8, sfx: 'crack' },
    { at: 3.8, sfx: 'crack' }, { at: 4.0, sfx: 'crack' }, { at: 4.2, sfx: 'crack' },
    { at: 5.8, say: '年' },
    { at: 7.9, sfx: 'whoosh' },
    { at: 8.55, say: '過年' },
    { at: 8.8, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
