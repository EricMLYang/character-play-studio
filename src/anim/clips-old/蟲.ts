import type { Clip } from '../clip'

// 蟲：迴力賽車盯上樹樁上那片大葉子想去撞。第一次衝太快直接飛過去、在最右邊煞車，倒車回來；用力往後拉、定格——放手衝過去，咚！撞扁在樹樁上，
// 樹樁和葉子翻飛出去，躲在葉子下的三隻紅色小蟲被震飛，一隻落在上、兩隻落在下，排成「蟲」。毛毛蟲戴著葉子從賽車背後冒出來；賽車又想衝，毛毛蟲一口把葉子吞掉。蟲、蟲、毛毛蟲
const BUGS = [{ id: 'g1', to: { x: 80, y: 20 } }, { id: 'g2', to: { x: 62, y: 38 } }, { id: 'g3', to: { x: 100, y: 38 } }]

const clip: Clip = {
  char: '蟲',
  meta: { theme: '迴力車撞葉子', cast: '迴力賽車＋樹樁＋大葉子＋三隻紅蟲＋毛毛蟲', gags: ['衝過頭飛過去', '拉滿蓄力撞扁', '小蟲被震飛排成字', '一口吞掉葉子'] },
  duration: 10,
  bg: { top: '#FFF8EA', bottom: '#F1F7E4', floor: '#D3E3B5', scenery: 'forest' },
  actors: [
    { id: 'stump', emoji: '🪵', x: 80, y: 70, size: 12 },
    ...BUGS.map((b) => ({ id: b.id, emoji: '🐞', x: 80, y: 63, size: 6, hidden: true })),
    { id: 'leaf', emoji: '🍃', x: 80, y: 60, size: 14 },
    { id: 'cat', emoji: '🐛', x: 36, y: 76, size: 12, hidden: true },
    { id: 'car', emoji: 'hero:car/idle', x: 20, y: 68.6, size: 20, flip: true },
  ],
  moves: [
    // 盯上葉子，前輪翹起來空轉
    { at: 0.5, actor: 'car', do: 'tilt', amount: -15, dur: 0.6 },
    { at: 0.5, actor: 'car', do: 'shake', amount: 0.6, dur: 0.6 },
    // 衝太快，直接飛過樹樁，在最右邊煞車
    { at: 1.2, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 1.2, actor: 'car', do: 'moveTo', to: { x: 146, y: 68.6 }, arc: 14, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 1.65, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.7, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 1.65, actor: 'leaf', do: 'shake', amount: 0.8, dur: 0.4 },
    // 不好意思地倒車回來
    { at: 2.0, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 2.0, actor: 'car', do: 'moveTo', to: { x: 22, y: 68.6 }, dur: 0.5 },
    { at: 2.0, actor: 'car', do: 'shake', amount: 0.8, dur: 0.5 },
    // 用力往後拉，車身拉長，定格
    { at: 2.55, actor: 'car', do: 'moveTo', to: { x: 12, y: 68.6 }, dur: 0.5, ease: 'out' },
    { at: 2.55, actor: 'car', do: 'squash', amount: 0.25, dur: 0.9 },
    { at: 2.55, actor: 'car', do: 'shake', amount: 0.5, dur: 0.9 },
    // 放手——咚！撞扁在樹樁上
    { at: 3.45, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 3.45, actor: 'car', do: 'moveTo', to: { x: 66, y: 68.6 }, dur: 0.28, ease: 'in' },
    { at: 3.73, actor: 'car', do: 'swap', emoji: 'hero:car/broken' },
    { at: 3.73, actor: 'car', do: 'squash', amount: 0.65, dur: 0.6 },
    // 樹樁和葉子翻飛出去，三隻小蟲彈起來
    { at: 3.75, actor: 'stump', do: 'moveTo', to: { x: 178, y: 50 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 3.75, actor: 'stump', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.75, actor: 'leaf', do: 'moveTo', to: { x: 175, y: 18 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: 3.75, actor: 'leaf', do: 'spin', times: -2, dur: 0.6 },
    { at: 4.4, actor: 'leaf', do: 'vanish', dur: 0.1 },
    ...BUGS.flatMap((b, i) => [
      { at: 3.78, actor: b.id, do: 'pop' as const, dur: 0.2 },
      { at: 3.78, actor: b.id, do: 'moveTo' as const, to: b.to, arc: 6, dur: 0.4, ease: 'out' as const },
      { at: 4.2, actor: b.id, do: 'bounce' as const, amount: 1.5, times: 2, dur: 0.5 + i * 0.3 },
      { at: 4.25 + i * 0.35, actor: b.id, do: 'vanish' as const, dur: 0.15 },
    ]),
    // 彈回原形，歪歪扭扭退到左下角
    { at: 4.35, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 4.4, actor: 'car', do: 'moveTo', to: { x: 22, y: 68.6 }, dur: 0.6 },
    { at: 4.4, actor: 'car', do: 'tilt', amount: 10, dur: 0.6 },
    // 毛毛蟲戴著葉子從賽車背後冒出來，啃一口
    { at: 6.25, actor: 'cat', do: 'pop', dur: 0.3 },
    { at: 6.3, actor: 'cat', do: 'moveTo', to: { x: 36, y: 62 }, dur: 0.3, ease: 'back' },
    { at: 6.3, actor: 'leaf', do: 'moveTo', to: { x: 36, y: 53 }, dur: 0.01 },
    { at: 6.35, actor: 'leaf', do: 'pop', dur: 0.3 },
    { at: 6.35, actor: 'leaf', do: 'scaleTo', amount: 0.65, dur: 0.01 },
    { at: 6.7, actor: 'cat', do: 'bounce', amount: 1.5, times: 3, dur: 0.8 },
    { at: 6.7, actor: 'leaf', do: 'bounce', amount: 1.5, times: 3, dur: 0.8 },
    // 賽車回神，開心跳一下，毛毛蟲拍拍引擎蓋
    { at: 7.4, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 7.4, actor: 'car', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.8, actor: 'cat', do: 'tilt', amount: -20, dur: 0.3 },
    // 回馬槍：賽車又盯上葉子想衝——毛毛蟲一口吞掉
    { at: 8.3, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 8.3, actor: 'car', do: 'tilt', amount: -15, dur: 0.5 },
    { at: 8.8, actor: 'leaf', do: 'moveTo', to: { x: 36, y: 60 }, dur: 0.15 },
    { at: 8.85, actor: 'leaf', do: 'vanish', dur: 0.15 },
    { at: 8.9, actor: 'cat', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: 9.1, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
  ],
  builds: [
    // 三隻小蟲捲成三個虫：一隻在上，兩隻在下
    { at: 4.25, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: 'g1', color: '#C2255C' },
    { at: 4.6, dur: 0.5, strokes: [6, 7, 8, 9, 10, 11], from: 'g2', color: '#D6336C' },
    { at: 4.95, dur: 0.5, strokes: [12, 13, 14, 15, 16, 17], from: 'g3', color: '#D6336C' },
  ],
  glyph: [{ at: 5.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'car', emoji: '👀', dur: 0.5 },
    { at: 0.5, kind: 'puff', actor: 'car', dur: 0.6 },
    { at: 1.65, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 1.7, kind: 'dizzy', actor: 'car', dur: 0.4 },
    { at: 2.1, kind: 'sweat', actor: 'car', dur: 0.5 },
    { at: 3.73, kind: 'burst', actor: 'car', dx: 6, dur: 0.4 },
    { at: 4.4, kind: 'dizzy', actor: 'car', dur: 1.6 },
    { at: 6.75, kind: 'pop', actor: 'cat', emoji: '😋', dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'car', emoji: '👀', dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'car', emoji: '😮', dur: 0.6 },
  ],
  camera: [
    // 第一次衝跟拍；拉滿蓄力時推近；撞上震一下
    { at: 1.2, dur: 0.25, do: 'follow', actor: 'car', amount: 1.3 },
    { at: 1.75, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 2.6, dur: 0.8, do: 'zoom', amount: 1.3, actor: 'car' },
    { at: 3.45, dur: 0.25, do: 'zoom', amount: 1 },
    { at: 3.73, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.5, sfx: 'rumble' },
    { at: 1.2, sfx: 'whoosh' },
    { at: 1.65, sfx: 'slide' },
    { at: 2.2, say: '蟲' },
    { at: 2.6, sfx: 'rumble' },
    { at: 3.45, sfx: 'whoosh' },
    { at: 3.73, sfx: 'bonk' },
    { at: 4.35, sfx: 'boing' },
    { at: 5.55, say: '蟲' },
    { at: 6.35, say: '毛毛蟲' },
    { at: 8.9, sfx: 'gulp' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
