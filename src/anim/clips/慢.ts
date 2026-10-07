import type { Clip } from '../clip'

// 慢：賽車比賽倒數 3、2、1——兩台車「咻」一聲衝出畫面，蝸牛只往前挪了一點點。外面傳來「碰」的一聲，兩台車撞在一起，
// 冒著煙倒車回來又亂衝出去。蝸牛慢慢慢跑，竟然拿到冠軍；畫面外又傳來一聲「碰」。慢、慢、慢跑
const clip: Clip = {
  char: '慢',
  meta: { theme: '賽車', cast: '兩台賽車＋蝸牛', gags: ['倒數', '衝太快撞車', '慢吞吞贏', '畫面外又撞一次'] },
  duration: 10,
  bg: { top: '#F3EFFF', bottom: '#E0D8F6', floor: '#A2A8B4', scenery: 'track' },
  actors: [
    { id: 'finish', emoji: '🏁', x: 148, y: 60, size: 10, hidden: true, float: true },
    { id: 'trophy', emoji: '🏆', x: 134, y: 58, size: 9, hidden: true, float: true },
    { id: 'car2', emoji: '🚗', x: 10, y: 72.4, size: 11, hidden: true, flip: true },
    { id: 'car1', emoji: '🏎️', x: 26, y: 72, size: 12, hidden: true, flip: true },
    { id: 'snail', emoji: '🐌', x: 12, y: 74.6, size: 6, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'finish', do: 'pop' },
    { at: 0, actor: 'car1', do: 'pop' }, { at: 0.1, actor: 'car2', do: 'pop' }, { at: 0.2, actor: 'snail', do: 'pop' },
    { at: 0.3, actor: 'car1', do: 'shake', dur: 1.2, amount: 0.4 },
    { at: 0.3, actor: 'car2', do: 'shake', dur: 1.2, amount: 0.4 },
    // 開跑！
    { at: 1.6, actor: 'car1', do: 'moveTo', to: { x: 190, y: 72 }, dur: 0.25 },
    { at: 1.62, actor: 'car2', do: 'moveTo', to: { x: 190, y: 72.4 }, dur: 0.3 },
    { at: 1.6, actor: 'snail', do: 'moveTo', to: { x: 15, y: 74.6 }, dur: 1.0 },
    // 撞車後倒車回來，暈頭轉向又衝出去
    { at: 2.9, actor: 'car1', do: 'moveTo', to: { x: 122, y: 72 }, dur: 0.5 },
    { at: 3.0, actor: 'car2', do: 'moveTo', to: { x: 104, y: 72.4 }, dur: 0.5 },
    { at: 3.5, actor: 'car1', do: 'shake', dur: 0.8, amount: 0.8 },
    { at: 3.5, actor: 'car2', do: 'shake', dur: 0.8, amount: 0.8 },
    { at: 4.4, actor: 'car1', do: 'flip' }, { at: 4.4, actor: 'car2', do: 'flip' },
    { at: 4.5, actor: 'car1', do: 'moveTo', to: { x: -25, y: 72 }, dur: 0.3 },
    { at: 4.55, actor: 'car2', do: 'moveTo', to: { x: -25, y: 72.4 }, dur: 0.35 },
    // 蝸牛慢慢慢地爬向終點
    { at: 3.6, actor: 'snail', do: 'moveTo', to: { x: 140, y: 74.6 }, dur: 5.0 },
    { at: 6.3, actor: 'snail', do: 'bounce', dur: 2.0, times: 7, amount: 1.2 },
    { at: 8.65, actor: 'trophy', do: 'pop' },
    { at: 8.8, actor: 'snail', do: 'hop', dur: 0.35, amount: 3 },
  ],
  builds: [
    // 蝸牛爬過留下的亮亮的路 → 忄；撞車飛出來的零件 → 曼
    { at: 3.9, dur: 0.6, strokes: [0, 1, 2], from: 'snail', color: '#3FA37A' },
    { at: 4.3, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: { x: 150, y: 62 }, color: '#D9423E' },
    { at: 5.1, dur: 0.5, strokes: [12, 13], from: { x: 150, y: 62 }, color: '#D9423E' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'burst', x: 40, y: 40, emoji: '3️⃣', dur: 0.45 },
    { at: 0.75, kind: 'burst', x: 40, y: 40, emoji: '2️⃣', dur: 0.45 },
    { at: 1.2, kind: 'burst', x: 40, y: 40, emoji: '1️⃣', dur: 0.45 },
    { at: 1.6, kind: 'puff', actor: 'car1' },
    { at: 2.4, kind: 'burst', x: 154, y: 62, dur: 0.6 },
    { at: 2.0, kind: 'bubble', actor: 'snail', emoji: '😌', dur: 0.8 },
    { at: 3.5, kind: 'dizzy', actor: 'car1', dur: 0.9 },
    { at: 3.5, kind: 'dizzy', actor: 'car2', dur: 0.9 },
    { at: 3.5, kind: 'burst', actor: 'car1', emoji: '💨', n: 5, dur: 0.6 },
    { at: 6.4, kind: 'sweat', actor: 'snail' },
    { at: 8.65, kind: 'burst', actor: 'trophy', emoji: '🎉', n: 6, dur: 0.6 },
    { at: 9.2, kind: 'burst', x: 6, y: 62, dur: 0.5 },
    { at: 9.4, kind: 'bubble', actor: 'snail', emoji: '😌', dur: 0.6 },
  ],
  camera: [
    { at: 2.4, dur: 0.4, do: 'shake', amount: 2 },
    { at: 9.2, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.3, sfx: 'blip' }, { at: 0.75, sfx: 'blip' }, { at: 1.2, sfx: 'blip' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 1.95, say: '慢' },
    { at: 2.4, sfx: 'bonk' }, { at: 2.45, sfx: 'rumble' },
    { at: 4.5, sfx: 'whoosh' },
    { at: 5.75, say: '慢' },
    { at: 6.7, say: '慢跑' },
    { at: 8.7, sfx: 'cheer' },
    { at: 9.2, sfx: 'bonk' },
  ],
}

export default clip
