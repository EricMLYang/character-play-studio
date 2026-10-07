import type { Clip } from '../clip'

// 冷：北極熊被大太陽曬到流汗，抱住冰塊——好冰！放開又好熱，再抱又好冰。乾脆搬出冷氣猛吹，結果吹太強把自己凍成冰塊，
// 雪花飛成「冷」。冷氣越吹越大，連天上的太陽都凍成冷冰冰的臉。冷、冷、冷氣
const clip: Clip = {
  char: '冷',
  meta: { theme: '北極冰雪', cast: '北極熊＋太陽＋冷氣', gags: ['冷熱來回', '吹過頭', '凍成冰塊', '連太陽都凍住'] },
  duration: 10,
  bg: { top: '#E8F5FF', bottom: '#D0E8FA', floor: '#FBFDFF', scenery: 'snow' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 130, y: 18, size: 16, hidden: true, float: true },
    { id: 'ice', emoji: '🧊', x: 44, y: 74.1, size: 7, hidden: true },
    { id: 'bear', emoji: '🐻‍❄️', x: 28, y: 71.1, size: 14, hidden: true },
    { id: 'wind', emoji: '🌬️', x: 12, y: 54, size: 12, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'pop', dur: 0.4 },
    { at: 0.3, actor: 'sun', do: 'flash', dur: 1.2 },
    { at: 0, actor: 'bear', do: 'enter', dur: 0.6 },
    { at: 0.7, actor: 'bear', do: 'squash', amount: 0.15, dur: 0.6 },
    // 抱冰塊：好冰！
    { at: 1.2, actor: 'ice', do: 'pop' },
    { at: 1.4, actor: 'bear', do: 'moveTo', to: { x: 37, y: 71.1 }, dur: 0.15 },
    { at: 1.55, actor: 'bear', do: 'shake', dur: 0.6, amount: 1 },
    { at: 1.55, actor: 'bear', do: 'hop', dur: 0.3, amount: 4 },
    // 放開又好熱，再抱又好冰
    { at: 2.3, actor: 'bear', do: 'moveTo', to: { x: 27, y: 71.1 }, dur: 0.2 },
    { at: 2.4, actor: 'sun', do: 'flash', dur: 0.6 },
    { at: 2.5, actor: 'bear', do: 'squash', amount: 0.2, dur: 0.4 },
    { at: 3.0, actor: 'bear', do: 'moveTo', to: { x: 37, y: 71.1 }, dur: 0.15 },
    { at: 3.15, actor: 'bear', do: 'shake', dur: 0.7, amount: 1.6 },
    { at: 3.15, actor: 'bear', do: 'hop', dur: 0.35, amount: 7 },
    // 搬出冷氣猛吹
    { at: 3.9, actor: 'wind', do: 'pop' },
    { at: 4.0, actor: 'bear', do: 'moveTo', to: { x: 30, y: 71.1 }, dur: 0.2 },
    { at: 4.1, actor: 'wind', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 4.3, actor: 'ice', do: 'vanish', dur: 0.15 },
    // 吹太強：自己凍成冰塊
    { at: 4.7, actor: 'bear', do: 'swap', emoji: '🧊' },
    { at: 4.7, actor: 'bear', do: 'shake', dur: 0.3, amount: 0.8 },
    { at: 6.3, actor: 'wind', do: 'scaleTo', amount: 1.4, dur: 0.3 },
    { at: 6.3, actor: 'wind', do: 'shake', dur: 1.0, amount: 1 },
    // 連太陽都凍住
    { at: 7.4, actor: 'sun', do: 'swap', emoji: '🥶' },
    { at: 7.4, actor: 'sun', do: 'shake', dur: 1.0, amount: 1 },
    { at: 8.4, actor: 'bear', do: 'swap', emoji: '🐻‍❄️' },
    { at: 8.5, actor: 'bear', do: 'shake', dur: 0.8, amount: 0.8 },
    { at: 8.6, actor: 'wind', do: 'vanish' },
  ],
  builds: [
    // 冰塊 → 兩點冰；冷氣吹出的雪花 → 令
    { at: 4.3, dur: 0.4, strokes: [0, 1], from: 'ice', color: '#3AA7E0' },
    { at: 4.8, dur: 0.9, strokes: [2, 3, 4, 5, 6], from: 'wind', color: '#4A6FD3' },
  ],
  glyph: [{ at: 5.8, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'sweat', actor: 'bear' },
    { at: 1.0, kind: 'bubble', actor: 'bear', emoji: '🥵', dur: 0.6 },
    { at: 1.6, kind: 'pop', actor: 'bear', emoji: '🥶', dur: 0.6 },
    { at: 2.5, kind: 'sweat', actor: 'bear' },
    { at: 3.2, kind: 'pop', actor: 'bear', emoji: '🥶', dur: 0.6 },
    { at: 4.1, kind: 'burst', actor: 'wind', emoji: '❄️', n: 6, dur: 0.6, dx: 10 },
    { at: 4.6, kind: 'burst', actor: 'bear', emoji: '❄️', n: 6, dur: 0.6 },
    { at: 5.2, kind: 'burst', actor: 'wind', emoji: '❄️', n: 6, dur: 0.6, dx: 10 },
    { at: 6.3, kind: 'burst', actor: 'wind', emoji: '❄️', n: 8, dur: 0.8, dx: 12 },
    { at: 7.4, kind: 'burst', actor: 'sun', emoji: '❄️', n: 6, dur: 0.6, dy: 10 },
    { at: 8.4, kind: 'burst', actor: 'bear', emoji: '🧊', n: 5, dur: 0.5 },
    { at: 8.9, kind: 'bubble', actor: 'bear', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 6.3, dur: 0.8, do: 'shake', amount: 1.2 },
    { at: 7.4, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 128, y: 24 } },
  ],
  cues: [
    { at: 0.7, sfx: 'blip' },
    { at: 1.6, say: '冷' },
    { at: 3.15, sfx: 'slide' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.7, sfx: 'crack' },
    { at: 5.85, say: '冷' },
    { at: 6.8, say: '冷氣' },
    { at: 7.4, sfx: 'crack' },
    { at: 8.4, sfx: 'crack' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
