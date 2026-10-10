import type { Clip } from '../clip'

// 晚：晚上小熊睡不著，開始數羊：一隻羊跳過去、兩隻、三隻……越跳越快，羊全部疊在床邊越疊越高，
// 最上面那隻搖搖晃晃——嘩啦倒下來，羊毛滿天飛變成「晚」。小熊終於睡著了；最後一隻小羊爬上床，跟牠一起睡。晚、晚、晚安
const clip: Clip = {
  char: '晚',
  meta: { theme: '數羊睡覺', cast: '小熊＋一群羊', gags: ['越數越多（失控）', '疊疊樂倒塌', '小羊也來睡'] },
  duration: 10,
  bg: { top: '#1E2352', bottom: '#3B3F7E', floor: '#5B4A7A', scenery: 'night' },
  actors: [
    { id: 'bed', emoji: '🛏️', x: 30, y: 64, size: 34, hidden: true },
    { id: 'bear', emoji: '🐻', x: 22, y: 57, size: 17, hidden: true },
    { id: 's1', emoji: '🐑', x: 140, y: 70.3, size: 14, hidden: true },
    { id: 's2', emoji: '🐑', x: 140, y: 70.3, size: 14, hidden: true },
    { id: 's3', emoji: '🐑', x: 140, y: 70.3, size: 14, hidden: true },
    { id: 's4', emoji: '🐑', x: 140, y: 70.3, size: 14, hidden: true },
    { id: 'lamb', emoji: '🐑', x: 150, y: 72, size: 10, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bed', do: 'pop' },
    { at: 0.2, actor: 'bear', do: 'drop', dur: 0.6 },
    { at: 1.0, actor: 'bear', do: 'tilt', amount: 12, dur: 0.5 },
    // 一隻、兩隻、三隻、四隻……越跳越快，疊在床邊
    { at: 1.8, actor: 's1', do: 'enter', from: { x: 175, y: 70.3 }, dur: 0.6 },
    { at: 2.4, actor: 's1', do: 'moveTo', to: { x: 58, y: 70.3 }, dur: 0.7, arc: 18 },
    { at: 3.2, actor: 's2', do: 'enter', from: { x: 175, y: 70.3 }, dur: 0.45 },
    { at: 3.65, actor: 's2', do: 'moveTo', to: { x: 58, y: 59 }, dur: 0.55, arc: 18 },
    { at: 4.25, actor: 's3', do: 'enter', from: { x: 175, y: 70.3 }, dur: 0.35 },
    { at: 4.6, actor: 's3', do: 'moveTo', to: { x: 58, y: 48 }, dur: 0.45, arc: 18 },
    { at: 5.1, actor: 's4', do: 'enter', from: { x: 175, y: 70.3 }, dur: 0.3 },
    { at: 5.4, actor: 's4', do: 'moveTo', to: { x: 58, y: 37 }, dur: 0.4, arc: 18 },
    // 搖搖晃晃——嘩啦倒下來
    { at: 5.85, actor: 's4', do: 'tilt', amount: 18, dur: 0.6 },
    { at: 5.85, actor: 's3', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 6.45, actor: 's4', do: 'vanish', dur: 0.2 },
    { at: 6.5, actor: 's3', do: 'vanish', dur: 0.2 },
    { at: 6.55, actor: 's2', do: 'vanish', dur: 0.2 },
    { at: 6.6, actor: 's1', do: 'vanish', dur: 0.2 },
    // 小熊終於睡著；最後一隻小羊爬上床
    { at: 7.6, actor: 'bear', do: 'squash', amount: 0.15, dur: 0.5 },
    { at: 8.3, actor: 'lamb', do: 'enter', from: { x: 175, y: 72 }, dur: 0.6 },
    { at: 8.95, actor: 'lamb', do: 'moveTo', to: { x: 40, y: 58 }, dur: 0.5, arc: 14 },
  ],
  builds: [
    // 倒下來的羊毛：左邊的日、右邊的免
    { at: 6.5, dur: 0.5, strokes: [0, 1, 2, 3], from: 's1', color: '#FFE38A' },
    { at: 6.8, dur: 0.8, strokes: [4, 5, 6, 7, 8, 9, 10], from: 's4', color: '#B9A6FF' },
  ],
  glyph: [{ at: 7.65, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'bubble', actor: 'bear', emoji: '😳', dur: 0.8 },
    { at: 2.5, kind: 'burst', x: 100, y: 40, emoji: '1️⃣', dur: 0.6 },
    { at: 3.7, kind: 'burst', x: 100, y: 40, emoji: '2️⃣', dur: 0.5 },
    { at: 4.65, kind: 'burst', x: 100, y: 40, emoji: '3️⃣', dur: 0.45 },
    { at: 5.45, kind: 'burst', x: 100, y: 40, emoji: '4️⃣', dur: 0.4 },
    { at: 5.9, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.6 },
    { at: 6.5, kind: 'burst', x: 58, y: 50, emoji: '☁️', n: 7, dur: 0.6 },
    { at: 7.7, kind: 'zzz', actor: 'bear', dur: 2.2 },
    { at: 9.4, kind: 'zzz', actor: 'lamb', dur: 0.6 },
  ],
  camera: [
    { at: 5.85, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 54, y: 48 } },
    { at: 6.45, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.1, say: '晚' },
    { at: 2.4, sfx: 'boing' },
    { at: 3.65, sfx: 'boing' },
    { at: 4.6, sfx: 'boing' },
    { at: 5.4, sfx: 'boing' },
    { at: 6.45, sfx: 'rumble' },
    { at: 7.7, say: '晚' },
    { at: 8.7, say: '晚安' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
