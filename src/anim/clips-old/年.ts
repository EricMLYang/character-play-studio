import type { Clip } from '../clip'

// 年：長短手機器人想輕輕放好最後一塊紅積木，馬達太猛，長手一甩「咚」撞倒第一塊——骨牌一塊接一塊越倒越快，還把停在中間的呆呆賽車撞飛出畫面。
// 倒下的紅條排成「年」的上半；賽車彈回來剛好砸在蹺蹺板（一根長鞭炮）的另一頭，把機器人彈上天，長鞭炮直直插下來當最後一豎。機器人掉在車頂上，胸口彈出紅燈籠：過年囉！
// 結果馬達又暴衝，賽車嚇得開溜，機器人一屁股坐在地上。年、年、過年
const clip: Clip = {
  char: '年',
  meta: { theme: '骨牌過年', cast: '玩具機器人＋酷炫車子＋紅積木骨牌＋鞭炮＋燈籠', gags: ['骨牌連鎖越倒越快', '撞飛賽車', '蹺蹺板彈上天', '馬達又暴衝一屁股坐地'] },
  duration: 10,
  bg: { top: '#CFE4FF', bottom: '#FFF8EC', floor: '#F7FBFF', scenery: 'snow' },
  actors: [
    { id: 'pebble', emoji: '🪨', x: 30, y: 74, size: 5 },
    { id: 'tall', emoji: '🧨', x: 24, y: 64, size: 11 },
    { id: 'd1', emoji: '🧱', x: 46, y: 73, size: 7 },
    { id: 'd2', emoji: '🧱', x: 56, y: 73, size: 7 },
    { id: 'd3', emoji: '🧱', x: 66, y: 73, size: 7 },
    { id: 'car', emoji: 'hero:car/idle', x: 82, y: 69, size: 19, flip: true },
    { id: 'd4', emoji: '🧱', x: 98, y: 73, size: 7 },
    { id: 'd5', emoji: '🧱', x: 108, y: 73, size: 7 },
    { id: 'robot', emoji: 'hero:robot/idle', x: 13, y: 71, size: 14, flip: true },
    { id: 'brick', emoji: '🧱', x: 20, y: 64, size: 5, float: true },
    { id: 'lantern', emoji: '🏮', x: 38, y: 50, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 長鞭炮橫躺在小石頭上當蹺蹺板，機器人站在旁邊
    { at: 0, actor: 'tall', do: 'rotateTo', amount: 90, dur: 0 },
    // 踮腳、想輕輕放好積木——馬達暴衝，長手一甩
    { at: 0.3, actor: 'robot', do: 'hop', amount: 2, dur: 0.3 },
    { at: 0.6, actor: 'brick', do: 'moveTo', to: { x: 38, y: 64 }, dur: 0.5 },
    { at: 0.9, actor: 'robot', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.2, actor: 'robot', do: 'tilt', amount: 30, dur: 0.3 },
    { at: 1.2, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 1.25, actor: 'brick', do: 'moveTo', to: { x: 42, y: 70 }, dur: 0.12, ease: 'in' },
    { at: 1.4, actor: 'brick', do: 'vanish', dur: 0.15 },
    // 骨牌一塊接一塊倒，越倒越快
    { at: 1.35, actor: 'd1', do: 'rotateTo', amount: 75, dur: 0.3, ease: 'in' },
    { at: 1.6, actor: 'd2', do: 'rotateTo', amount: 75, dur: 0.25, ease: 'in' },
    { at: 1.8, actor: 'd3', do: 'rotateTo', amount: 75, dur: 0.2, ease: 'in' },
    // 撞到賽車，賽車眼睛亂轉、衝出畫面，順便撞倒後面兩塊
    { at: 1.95, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 2.05, actor: 'car', do: 'moveTo', to: { x: 185, y: 69 }, dur: 0.45, ease: 'in' },
    { at: 2.2, actor: 'd4', do: 'rotateTo', amount: 75, dur: 0.15, ease: 'in' },
    { at: 2.3, actor: 'd5', do: 'rotateTo', amount: 75, dur: 0.15, ease: 'in' },
    { at: 2.5, actor: 'd1', do: 'vanish', dur: 0.2 },
    { at: 2.65, actor: 'd2', do: 'vanish', dur: 0.2 },
    { at: 2.8, actor: 'd3', do: 'vanish', dur: 0.2 },
    { at: 3.0, actor: 'd4', do: 'vanish', dur: 0.2 },
    { at: 3.2, actor: 'd5', do: 'vanish', dur: 0.2 },
    { at: 2.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    // 賽車從右邊彈回來，剛好砸在蹺蹺板另一頭
    { at: 3.8, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 3.8, actor: 'car', do: 'moveTo', to: { x: 34, y: 62 }, arc: 30, dur: 0.6, ease: 'inOut' },
    { at: 3.8, actor: 'car', do: 'spin', times: 1, dur: 0.6 },
    { at: 4.4, actor: 'tall', do: 'tilt', amount: 18, dur: 0.25 },
    { at: 4.4, actor: 'car', do: 'moveTo', to: { x: 34, y: 69 }, dur: 0.2, ease: 'bounce' },
    // 機器人被彈上天，停格一拍
    { at: 4.45, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 4.45, actor: 'robot', do: 'moveTo', to: { x: 22, y: 16 }, dur: 0.4, ease: 'out' },
    { at: 4.85, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.4 },
    // 長鞭炮翻起來，飛去當中間那一豎
    { at: 4.5, actor: 'tall', do: 'vanish', dur: 0.2 },
    // 機器人掉在車頂上，暈暈地比讚
    { at: 5.3, actor: 'robot', do: 'moveTo', to: { x: 32, y: 56 }, dur: 0.45, ease: 'bounce' },
    { at: 5.75, actor: 'car', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 5.75, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 6.0, actor: 'robot', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 6.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 6.4, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    // 胸口彈出紅燈籠：過年囉！
    { at: 6.6, actor: 'lantern', do: 'pop', dur: 0.35 },
    { at: 7.0, actor: 'lantern', do: 'tilt', amount: 15, dur: 0.5 },
    { at: 7.5, actor: 'lantern', do: 'tilt', amount: -15, dur: 0.5 },
    // 回馬槍：馬達又暴衝——賽車嚇得開溜，機器人一屁股坐在地上
    { at: 8.1, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.1, actor: 'lantern', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.4, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 8.45, actor: 'car', do: 'moveTo', to: { x: 190, y: 69 }, dur: 0.35, ease: 'in' },
    { at: 8.5, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 8.75, actor: 'robot', do: 'moveTo', to: { x: 32, y: 71 }, dur: 0.3, ease: 'in' },
    { at: 8.75, actor: 'lantern', do: 'moveTo', to: { x: 38, y: 65 }, dur: 0.3, ease: 'in' },
    { at: 9.05, actor: 'robot', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 9.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
  ],
  builds: [
    // 倒下的骨牌滑過去排好：上面一撇、三橫、左邊短豎
    { at: 2.5, dur: 0.3, strokes: [0], from: 'd1', color: '#E03131' },
    { at: 2.65, dur: 0.75, strokes: [1, 2, 4], from: 'd2', color: '#E03131' },
    { at: 3.2, dur: 0.3, strokes: [3], from: 'd5', color: '#E03131' },
    // 長鞭炮直直插下來當最後一豎
    { at: 4.6, dur: 0.4, strokes: [5], from: 'tall', style: 'drop', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.0, dur: 0.4, do: 'shake' }, { at: 9.05, dur: 0.3, do: 'shake' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'robot', emoji: '😬', dur: 0.4 },
    { at: 1.3, kind: 'burst', actor: 'd1', n: 1, dur: 0.35 },
    { at: 2.0, kind: 'pop', actor: 'car', emoji: '❗', dur: 0.4 },
    { at: 4.4, kind: 'burst', actor: 'car', emoji: '⭐', n: 5, dur: 0.5 },
    { at: 5.8, kind: 'dizzy', actor: 'robot', dur: 0.7 },
    { at: 6.6, kind: 'burst', actor: 'lantern', emoji: '🎊', n: 6, dur: 0.7 },
    { at: 8.1, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 9.05, kind: 'burst', actor: 'robot', emoji: '💫', n: 4, dur: 0.5 },
  ],
  camera: [
    { at: 1.4, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 66, y: 64 } },
    { at: 2.1, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.45, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 30, y: 40 } },
  ],
  cues: [
    { at: 0.9, sfx: 'rumble' },
    { at: 1.35, say: '年' },
    { at: 1.6, sfx: 'tap' },
    { at: 1.8, sfx: 'tap' },
    { at: 1.95, sfx: 'tap' },
    { at: 2.05, sfx: 'whoosh' },
    { at: 2.25, sfx: 'tap' },
    { at: 3.5, say: '年' },
    { at: 4.4, sfx: 'boing' },
    { at: 5.0, sfx: 'plop' },
    { at: 5.75, sfx: 'bonk' },
    { at: 6.65, say: '過年' },
    { at: 6.65, sfx: 'poof' },
    { at: 8.1, sfx: 'rumble' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 9.05, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
