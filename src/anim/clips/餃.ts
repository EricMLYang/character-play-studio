import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 餃：冬天廚師打開蒸籠，三顆水餃跳出來逃跑。廚師追過去，水餃玩跳山羊從他頭上跳過去；廚師轉身再追，又被跳過去，轉到頭昏倒地。
// 兩顆水餃得意地跳上天變成「餃」，最後一顆跳回蒸籠。廚師拿長筷子去夾——蒸籠是空的，水餃其實坐在他頭上。餃、餃、蒸餃
const clip: Clip = {
  char: '餃',
  meta: { theme: '餃子大逃亡', cast: '廚師＋三顆水餃＋蒸籠', gags: ['跳山羊閃過', '追到轉圈圈', '跳上天變成字', '其實坐在你頭上'] },
  duration: 10,
  bg: { top: '#FFE9E0', bottom: '#F5D3C8', floor: '#FAFCFF', scenery: 'snow' },
  actors: [
    { id: 'd1', emoji: '🥟', x: 130, y: 62, size: 9, hidden: true },
    { id: 'd2', emoji: '🥟', x: 136, y: 60, size: 9, hidden: true },
    { id: 'd3', emoji: '🥟', x: 142, y: 62, size: 9, hidden: true },
    { id: 'steamer', emoji: '🧺', x: 136, y: 69.4, size: 18 },
    { id: 'chef', emoji: '🧑‍🍳', x: 28, y: 70.3, size: 16, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'chef', do: 'enter', from: { x: -14, y: 70.3 }, dur: 0.7 },
    // 蒸籠一跳，水餃冒出來
    { at: 1.2, actor: 'steamer', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.25, actor: 'd1', do: 'pop', dur: 0.3 },
    { at: 1.3, actor: 'd2', do: 'pop', dur: 0.3 },
    { at: 1.35, actor: 'd3', do: 'pop', dur: 0.3 },
    ...(['d1', 'd2', 'd3'] as const).map((id) => ({ at: 1.7, actor: id, do: 'bounce' as const, amount: 2, times: 2, dur: 0.4 })),
    // 逃跑！
    { at: 2.0, actor: 'd1', do: 'moveTo', to: { x: 100, y: 73.2 }, arc: 6, dur: 0.4 },
    { at: 2.05, actor: 'd2', do: 'moveTo', to: { x: 110, y: 73.2 }, arc: 6, dur: 0.4 },
    { at: 2.1, actor: 'd3', do: 'moveTo', to: { x: 120, y: 73.2 }, arc: 6, dur: 0.4 },
    { at: 2.2, actor: 'chef', do: 'moveTo', to: { x: 88, y: 70.3 }, dur: 0.5 },
    // 跳山羊：從廚師頭上跳過去
    { at: 2.7, actor: 'd1', do: 'moveTo', to: { x: 40, y: 73.2 }, arc: 26, dur: 0.45 },
    { at: 2.8, actor: 'd2', do: 'moveTo', to: { x: 52, y: 73.2 }, arc: 26, dur: 0.45 },
    { at: 2.9, actor: 'd3', do: 'moveTo', to: { x: 64, y: 73.2 }, arc: 26, dur: 0.45 },
    { at: 3.2, actor: 'chef', do: 'flip' },
    { at: 3.25, actor: 'chef', do: 'moveTo', to: { x: 76, y: 70.3 }, dur: 0.3 },
    // 又跳過去
    { at: 3.5, actor: 'd3', do: 'moveTo', to: { x: 96, y: 73.2 }, arc: 26, dur: 0.45 },
    { at: 3.6, actor: 'd2', do: 'moveTo', to: { x: 108, y: 73.2 }, arc: 26, dur: 0.45 },
    { at: 3.7, actor: 'd1', do: 'moveTo', to: { x: 120, y: 73.2 }, arc: 26, dur: 0.45 },
    // 轉到頭昏倒地
    { at: 4.0, actor: 'chef', do: 'flip' },
    { at: 4.0, actor: 'chef', do: 'spin', times: 2, dur: 0.5 },
    { at: 4.5, actor: 'chef', do: 'rotateTo', amount: 90, dur: 0.3 },
    ...(['d1', 'd2', 'd3'] as const).map((id) => ({ at: 4.4, actor: id, do: 'bounce' as const, amount: 3, times: 2, dur: 0.4 })),
    // 兩顆水餃跳上天變成字
    { at: 4.8, actor: 'd1', do: 'moveTo', to: { x: 78, y: 30 }, dur: 0.3 },
    { at: 5.1, actor: 'd1', do: 'vanish', dur: 0.1 },
    { at: 5.4, actor: 'd2', do: 'moveTo', to: { x: 98, y: 30 }, dur: 0.3 },
    { at: 5.7, actor: 'd2', do: 'vanish', dur: 0.1 },
    // 廚師爬起來，走回左邊
    { at: 5.9, actor: 'chef', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 6.0, actor: 'chef', do: 'moveTo', to: { x: 28, y: 70.3 }, dur: 0.5 },
    // 最後一顆跳回蒸籠
    { at: 7.0, actor: 'd3', do: 'moveTo', to: { x: 136, y: 62 }, arc: 8, dur: 0.4 },
    { at: 7.4, actor: 'steamer', do: 'shake', amount: 1, dur: 0.4 },
    // 長筷子去夾——水餃跳到廚師頭上
    { at: 8.3, actor: 'steamer', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 8.4, actor: 'd3', do: 'moveTo', to: { x: 28, y: 59.5 }, arc: 52, dur: 0.6 },
    { at: 8.4, actor: 'd3', do: 'spin', times: 2, dur: 0.6 },
    { at: 9.0, actor: 'chef', do: 'squash', amount: 0.15, dur: 0.2 },
    ...pressStack(9.0, 0.2, 0.15, 16, ['d3']),
    { at: 9.3, actor: 'd3', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
  ],
  builds: [
    { at: 5.1, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'd1', color: '#E9A23B' },
    { at: 5.7, dur: 0.8, strokes: [8, 9, 10, 11, 12, 13], from: 'd2', color: '#D2553F' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'steamer', emoji: '♨️', dur: 1.2 },
    { at: 0.9, kind: 'bubble', actor: 'chef', emoji: '🤤', dur: 0.6 },
    { at: 1.9, kind: 'pop', actor: 'chef', emoji: '❗', dur: 0.4 },
    { at: 2.85, kind: 'pop', actor: 'chef', emoji: '❓', dur: 0.4 },
    { at: 4.8, kind: 'dizzy', actor: 'chef', dur: 1.1 },
    { at: 4.8, kind: 'burst', actor: 'd1', emoji: '✨', n: 5, dur: 0.4 },
    { at: 5.4, kind: 'burst', actor: 'd2', emoji: '✨', n: 5, dur: 0.4 },
    { at: 7.45, kind: 'burst', actor: 'steamer', emoji: '♨️', n: 6, dur: 0.6 },
    { at: 7.8, kind: 'pop', actor: 'chef', emoji: '😏', dur: 0.4 },
    { at: 8.0, kind: 'line', actor: 'chef', to: { x: 128, y: 66 }, dx: 7, dy: -3, color: '#A0522D', width: 1.2, dur: 1.0 },
    { at: 9.1, kind: 'pop', actor: 'chef', emoji: '❓', dur: 0.8, dx: 6 },
    { at: 9.3, kind: 'pop', actor: 'd3', emoji: '😜', dur: 0.6 },
  ],
  camera: [
    { at: 4.5, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 76, y: 64 } },
  ],
  cues: [
    { at: 1.25, sfx: 'boing' },
    { at: 1.4, say: '餃' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 2.7, sfx: 'whoosh' },
    { at: 3.5, sfx: 'whoosh' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.8, sfx: 'bonk' },
    { at: 6.55, say: '餃' },
    { at: 7.4, sfx: 'poof' },
    { at: 7.55, say: '蒸餃' },
    { at: 8.0, sfx: 'clink' },
    { at: 8.4, sfx: 'boing' },
    { at: 9.0, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
