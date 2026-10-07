import type { Clip } from '../clip'

// 雷：老鼠科學家搖燒杯，越搖越用力——砰！炸出一朵小雲。雲灑下「雨」，「田」從天上掉下來。
// 老鼠戳了戳，雲生氣變成雷雨雲，一道閃電讓老鼠跳得超高；雲在旁邊笑。雷、雷、打雷
const clip: Clip = {
  char: '雷',
  meta: { theme: '科學實驗', cast: '老鼠科學家＋小雲', gags: ['越搖越大力爆炸', '戳了惹生氣', '嚇到跳超高', '旁觀者偷笑'] },
  duration: 10,
  bg: { top: '#EEE8FF', bottom: '#DAD0F6', floor: '#FFF1D6', scenery: 'room' },
  actors: [
    { id: 'mouse', emoji: '🐭', x: 24, y: 71, size: 13, hidden: true },
    { id: 'flask', emoji: '🧪', x: 40, y: 72, size: 10, hidden: true },
    { id: 'cloud', emoji: '☁️', x: 40, y: 50, size: 22, hidden: true, float: true },
    { id: 'bolt', emoji: '⚡', x: 40, y: 56, size: 14, hidden: true, float: true },
    { id: 'ok', emoji: '👍', x: 37, y: 60, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'mouse', do: 'enter', dur: 0.6 },
    { at: 0, actor: 'mouse', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 0.3, actor: 'flask', do: 'pop' },
    { at: 0.7, actor: 'mouse', do: 'tilt', amount: 18, dur: 0.5 },
    { at: 0.8, actor: 'flask', do: 'shake', dur: 0.8, amount: 1 },
    // 越搖越大力
    { at: 1.6, actor: 'flask', do: 'shake', dur: 0.5, amount: 2.5 },
    { at: 1.6, actor: 'mouse', do: 'hop', dur: 0.25, amount: 3 },
    { at: 1.9, actor: 'flask', do: 'squash', amount: -0.4, dur: 0.2 },
    { at: 2.1, actor: 'flask', do: 'vanish', dur: 0.08 },
    // 砰！被炸飛轉一圈
    { at: 2.1, actor: 'mouse', do: 'moveTo', to: { x: 14, y: 71 }, dur: 0.35, arc: 6 },
    { at: 2.1, actor: 'mouse', do: 'spin', dur: 0.4 },
    { at: 2.15, actor: 'cloud', do: 'pop', dur: 0.5 },
    { at: 2.7, actor: 'cloud', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
    { at: 3.0, actor: 'cloud', do: 'moveTo', to: { x: 80, y: 22 }, dur: 0.6 },
    { at: 4.4, actor: 'cloud', do: 'moveTo', to: { x: 136, y: 20 }, dur: 0.8 },
    // 好奇走過去戳一下
    { at: 5.4, actor: 'mouse', do: 'moveTo', to: { x: 40, y: 71 }, dur: 0.6 },
    { at: 5.4, actor: 'mouse', do: 'bounce', dur: 0.6, times: 3, amount: 1.5 },
    { at: 6.0, actor: 'mouse', do: 'tilt', amount: -20, dur: 0.3 },
    // 雲生氣了
    { at: 6.0, actor: 'cloud', do: 'swap', emoji: '⛈️' },
    { at: 6.0, actor: 'cloud', do: 'shake', dur: 0.4, amount: 1.5 },
    { at: 6.4, actor: 'cloud', do: 'flash', dur: 0.7 },
    { at: 6.4, actor: 'bolt', do: 'pop', dur: 0.12 },
    { at: 6.7, actor: 'bolt', do: 'vanish', dur: 0.1 },
    // 嚇到跳超高
    { at: 6.45, actor: 'mouse', do: 'hop', dur: 0.7, amount: 30 },
    { at: 6.45, actor: 'mouse', do: 'spin', dur: 0.7 },
    { at: 7.15, actor: 'mouse', do: 'squash', amount: 0.5, dur: 0.3 },
    // 雲笑到彈來彈去
    { at: 7.4, actor: 'cloud', do: 'swap', emoji: '☁️' },
    { at: 7.4, actor: 'cloud', do: 'bounce', dur: 0.9, times: 4, amount: 2 },
    { at: 8.2, actor: 'ok', do: 'pop' },
    { at: 8.3, actor: 'ok', do: 'shake', dur: 1.0, amount: 0.8 },
    { at: 9.0, actor: 'mouse', do: 'hop', dur: 0.3, amount: 8 },
    { at: 9.0, actor: 'ok', do: 'vanish', dur: 0.15 },
  ],
  builds: [
    { at: 3.6, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'cloud', color: '#2F5FD0' },
    { at: 4.6, dur: 0.6, strokes: [8, 9, 10, 11, 12], from: { x: 80, y: 0 }, style: 'drop', color: '#2F5FD0' },
  ],
  glyph: [{ at: 5.15, dur: 0.4, do: 'shake' }, { at: 6.45, dur: 0.5, do: 'shake' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'burst', x: 40, y: 64, emoji: '🫧', n: 4, dur: 0.8 },
    { at: 1.6, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.5 },
    { at: 2.1, kind: 'burst', x: 40, y: 64, dur: 0.6 },
    { at: 2.1, kind: 'burst', x: 40, y: 66, emoji: '💨', n: 6, dur: 0.7 },
    { at: 2.8, kind: 'bubble', actor: 'mouse', emoji: '❓', dur: 0.9 },
    { at: 3.6, kind: 'rain', actor: 'cloud', n: 8, dur: 0.9 },
    { at: 6.0, kind: 'pop', actor: 'cloud', emoji: '💢', dur: 0.6, dx: -16, dy: 14 },
    { at: 6.4, kind: 'zap', actor: 'cloud', target: 'mouse', dur: 0.35 },
    { at: 7.15, kind: 'puff', actor: 'mouse' },
    { at: 7.2, kind: 'dizzy', actor: 'mouse', dur: 1.4 },
    { at: 7.4, kind: 'pop', actor: 'cloud', emoji: '😆', dur: 1.0, dx: -18, dy: 16 },
    { at: 9.0, kind: 'burst', actor: 'mouse', emoji: '⚡', dur: 0.4 },
  ],
  camera: [
    { at: 2.1, dur: 0.5, do: 'shake', amount: 2 },
    { at: 5.15, dur: 0.3, do: 'shake', amount: 1 },
    { at: 6.4, dur: 0.6, do: 'shake', amount: 2.5 },
  ],
  cues: [
    { at: 0.8, sfx: 'bubble' },
    { at: 1.0, say: '雷' },
    { at: 1.6, sfx: 'blip' },
    { at: 2.1, sfx: 'poof' }, { at: 2.12, sfx: 'bonk' },
    { at: 4.9, say: '雷' },
    { at: 6.0, sfx: 'hic' },
    { at: 6.4, sfx: 'rumble' },
    { at: 6.45, sfx: 'slide' },
    { at: 6.6, say: '打雷' },
    { at: 7.15, sfx: 'bonk' },
    { at: 9.0, sfx: 'slide' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
