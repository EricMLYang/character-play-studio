import type { Clip } from '../clip'

// 河：晚上小刺蝟想過河去摘蘋果，一顆、兩顆石頭跳得好好的，第三顆「石頭」竟然是鱷魚的背！鱷魚張嘴要咬，
// 刺蝟縮成刺刺的栗子球，鱷魚咬到刺痛得把牠甩過河——剛好到對岸。鱷魚氣得甩水，結果被冒出來的河馬頂起來又掉進水裡。河、河、河馬
const clip: Clip = {
  char: '河',
  meta: { theme: '踩石頭過河', cast: '刺蝟＋鱷魚＋河馬', gags: ['石頭其實是鱷魚', '縮成刺球咬不下去', '被甩過河反而成功', '欺負人的被頂飛'] },
  duration: 10,
  bg: { top: '#1C2752', bottom: '#3A4D8F', floor: '#2C6E9E', scenery: 'night' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 148, y: 67.8, size: 22 },
    { id: 'stone1', emoji: '🪨', x: 34, y: 74, size: 8.8, float: true },
    { id: 'stone2', emoji: '🪨', x: 56, y: 74, size: 8.8, float: true },
    { id: 'hippo', emoji: '🦛', x: 26, y: 72, size: 20, hidden: true, flip: true },
    { id: 'croc', emoji: '🐊', x: 84, y: 72, size: 22.5, float: true },
    { id: 'apple', emoji: '🍎', x: 124, y: 61, size: 7.5, float: true, hidden: true },
    { id: 'hog', emoji: '🦔', x: 14, y: 70.7, size: 15, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hog', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.6 },
    // 一顆、兩顆
    { at: 1, actor: 'hog', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 1.2, actor: 'hog', do: 'moveTo', to: { x: 34, y: 67 }, dur: 0.4, arc: 10 },
    { at: 1.64, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.64, actor: 'stone1', do: 'hop', amount: -1, dur: 0.25 },
    { at: 1.97, actor: 'hog', do: 'moveTo', to: { x: 56, y: 67 }, dur: 0.4, arc: 10 },
    { at: 2.41, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.41, actor: 'stone2', do: 'hop', amount: -1, dur: 0.25 },
    // 第三顆：鱷魚的背
    { at: 2.85, actor: 'hog', do: 'moveTo', to: { x: 86, y: 59 }, dur: 0.4, arc: 10 },
    { at: 3.28, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.83, actor: 'croc', do: 'tilt', amount: -18, dur: 0.5 },
    { at: 3.89, actor: 'hog', do: 'swap', emoji: '🌰' },
    { at: 4.16, actor: 'croc', do: 'shake', amount: 2, dur: 0.6 },
    // 咬到刺，痛得把牠甩過河
    { at: 4.27, actor: 'hog', do: 'moveTo', to: { x: 128, y: 70.7 }, dur: 0.8, arc: 26 },
    { at: 4.27, actor: 'hog', do: 'spin', times: 3, dur: 0.8 },
    { at: 5.1, actor: 'hog', do: 'swap', emoji: '🦔' },
    { at: 5.1, actor: 'hog', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 5.1, actor: 'stone1', do: 'vanish', dur: 0.2 },
    { at: 5.15, actor: 'stone2', do: 'vanish', dur: 0.2 },
    // 鱷魚氣呼呼游走
    { at: 5.3, actor: 'croc', do: 'moveTo', to: { x: 26, y: 70.7 }, dur: 0.7 },
    // 河馬冒出來，把鱷魚頂起來
    { at: 6.9, actor: 'hippo', do: 'enter', from: { x: 26, y: 96 }, dur: 0.5 },
    { at: 6.9, actor: 'croc', do: 'moveTo', to: { x: 26, y: 57 }, dur: 0.5 },
    { at: 7.66, actor: 'hippo', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 7.66, actor: 'croc', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 河馬潛下去，鱷魚撲通掉進水裡
    { at: 8.47, actor: 'hippo', do: 'moveTo', to: { x: 26, y: 96 }, dur: 0.4 },
    { at: 8.6, actor: 'croc', do: 'moveTo', to: { x: 26, y: 73 }, dur: 0.35 },
    { at: 8.92, actor: 'croc', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.87, actor: 'hippo', do: 'vanish', dur: 0.1 },
    { at: 9.1, actor: 'apple', do: 'pop' },
    { at: 9.19, actor: 'hog', do: 'bounce', amount: 3, times: 2, dur: 0.7 },
  ],
  builds: [
    // 鱷魚甩出的水花 → 氵；兩顆石頭跳起來 → 可
    { at: 4.6, dur: 0.6, strokes: [0, 1, 2], from: 'croc', color: '#6EC6FF' },
    { at: 5.1, dur: 0.9, strokes: [3, 4, 5, 6, 7], from: { x: 45, y: 70.7 }, color: '#F2C94C' },
  ],
  glyph: [{ at: 6, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'croc', dur: 3.1, dx: -6 },
    { at: 0.5, kind: 'bubble', actor: 'hog', emoji: '🍎', dur: 0.6 },
    { at: 3.39, kind: 'pop', actor: 'croc', emoji: '👀', dur: 0.5, dx: -12 },
    { at: 3.5, kind: 'sweat', actor: 'hog' },
    { at: 3.89, kind: 'burst', actor: 'hog', emoji: '💨', n: 5, dur: 0.4 },
    { at: 4.16, kind: 'burst', actor: 'croc', emoji: '💢', dur: 0.5, dx: -6 },
    { at: 4.38, kind: 'fountain', actor: 'croc', emoji: '💧', n: 8, dur: 0.9 },
    { at: 4.49, kind: 'pop', actor: 'croc', emoji: '😭', dur: 0.6, dx: -12 },
    { at: 5.1, kind: 'puff', actor: 'hog' },
    { at: 7.25, kind: 'pop', actor: 'croc', emoji: '😳', dur: 0.7 },
    { at: 7.66, kind: 'bubble', actor: 'hog', emoji: '😆', dur: 0.8, dx: -12 },
    { at: 8.92, kind: 'fountain', actor: 'croc', emoji: '💧', n: 8, dur: 0.8 },
    { at: 9.19, kind: 'sweat', actor: 'croc' },
  ],
  camera: [
    { at: 3.34, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 84, y: 62 } },
    { at: 8.92, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.64, say: '河' },
    { at: 2.41, sfx: 'tap' },
    { at: 3.28, sfx: 'tap' },
    { at: 3.89, sfx: 'poof' },
    { at: 4.16, sfx: 'bonk' },
    { at: 4.27, sfx: 'boing' },
    { at: 4.38, sfx: 'splash' },
    { at: 5.1, sfx: 'plop' },
    { at: 6.1, say: '河' },
    { at: 6.9, sfx: 'bubble' },
    { at: 7.25, say: '河馬' },
    { at: 8.92, sfx: 'splash' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
