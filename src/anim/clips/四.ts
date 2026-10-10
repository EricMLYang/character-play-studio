import type { Clip } from '../clip'

// 四：熊在樹下。春天開花，熊戴上花；夏天太陽好熱，熊換成游泳圈；秋天葉子掉滿頭；冬天下雪，熊包成大雪球！
// 四季越換越快，熊來不及換衣服，轉得頭昏眼花，花、太陽、葉子、雪花飛成「四」。最後熊乾脆冬眠了。四、四、四季
const clip: Clip = {
  char: '四',
  meta: { theme: '四季', cast: '熊＋大樹', gags: ['季節一直換', '越換越快來不及', '乾脆冬眠'] },
  duration: 10,
  bg: { top: '#DDF2FF', bottom: '#F4FBEA', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 132, y: 56, size: 40, hidden: true },
    { id: 'bear', emoji: '🐻', x: 36, y: 68.6, size: 20, hidden: true },
    { id: 'item', emoji: '🌸', x: 36, y: 56, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.2, actor: 'bear', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    // 春天：開花，戴上花
    { at: 1.0, actor: 'tree', do: 'swap', emoji: '🌸' },
    { at: 1.0, actor: 'tree', do: 'flash', dur: 0.4 },
    { at: 1.4, actor: 'item', do: 'pop' },
    { at: 1.7, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 夏天：好熱，換成游泳圈
    { at: 2.6, actor: 'tree', do: 'swap', emoji: '🌴' },
    { at: 2.6, actor: 'item', do: 'swap', emoji: '🛟' },
    { at: 2.6, actor: 'item', do: 'moveTo', to: { x: 36, y: 70 }, dur: 0.3 },
    { at: 2.9, actor: 'bear', do: 'shake', amount: 1, dur: 0.5 },
    // 秋天：葉子掉滿頭
    { at: 3.8, actor: 'tree', do: 'swap', emoji: '🍂' },
    { at: 3.8, actor: 'item', do: 'swap', emoji: '🍁' },
    { at: 3.8, actor: 'item', do: 'moveTo', to: { x: 36, y: 56 }, dur: 0.3 },
    // 冬天：下雪，包成大雪球
    { at: 4.6, actor: 'tree', do: 'swap', emoji: '🌲' },
    { at: 4.6, actor: 'item', do: 'swap', emoji: '🧣' },
    { at: 4.6, actor: 'item', do: 'moveTo', to: { x: 36, y: 66 }, dur: 0.2 },
    // 越換越快——轉得頭昏眼花
    { at: 5.1, actor: 'tree', do: 'swap', emoji: '🌸' }, { at: 5.25, actor: 'tree', do: 'swap', emoji: '🌴' },
    { at: 5.4, actor: 'tree', do: 'swap', emoji: '🍂' }, { at: 5.55, actor: 'tree', do: 'swap', emoji: '🌲' },
    { at: 5.1, actor: 'bear', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.7, actor: 'item', do: 'vanish', dur: 0.2 },
    { at: 5.75, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    // 乾脆冬眠
    { at: 8.0, actor: 'bear', do: 'moveTo', to: { x: 114, y: 68.6 }, dur: 0.6 },
    { at: 8.8, actor: 'bear', do: 'squash', amount: 0.2, dur: 0.6 },
  ],
  builds: [
    // 春天的花、夏天的太陽、秋天的葉子、冬天的雪花，四個一起飛
    { at: 5.7, dur: 0.4, strokes: [0], from: { x: 132, y: 46 }, color: '#F06292' },
    { at: 5.95, dur: 0.4, strokes: [1], from: { x: 132, y: 46 }, color: '#F5A623' },
    { at: 6.2, dur: 0.4, strokes: [2, 3], from: { x: 132, y: 46 }, color: '#E86A33' },
    { at: 6.5, dur: 0.4, strokes: [4], from: { x: 132, y: 46 }, color: '#3D8BEF' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'burst', actor: 'tree', emoji: '🌸', n: 6, dur: 0.6 },
    { at: 2.6, kind: 'burst', actor: 'tree', emoji: '☀️', n: 4, dur: 0.6 },
    { at: 2.9, kind: 'sweat', actor: 'bear' },
    { at: 3.8, kind: 'rain', x: 36, y: 40, emoji: '🍂', n: 6, dur: 0.8 },
    { at: 4.6, kind: 'rain', x: 36, y: 40, emoji: '❄️', n: 6, dur: 0.6 },
    { at: 4.7, kind: 'pop', actor: 'bear', emoji: '🥶', dur: 0.4 },
    { at: 5.9, kind: 'dizzy', actor: 'bear', dur: 1.2 },
    { at: 8.7, kind: 'zzz', actor: 'bear', dur: 1.3 },
  ],
  camera: [
    { at: 5.1, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 60, y: 60 } },
  ],
  cues: [
    { at: 1.0, sfx: 'blip' },
    { at: 1.3, say: '四' },
    { at: 2.6, sfx: 'blip' },
    { at: 3.8, sfx: 'blip' },
    { at: 4.6, sfx: 'blip' },
    { at: 5.1, sfx: 'whoosh' },
    { at: 5.75, sfx: 'bonk' },
    { at: 7.05, say: '四' },
    { at: 7.95, say: '四季' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
