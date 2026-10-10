import type { Clip } from '../clip'

// 慢：賽車比賽倒數 3、2、1——兩台車咻一聲衝出畫面，蝸牛只往前挪了一點點。畫面外「碰」！兩台車冒著煙倒車回來，
// 暈頭轉向又往反方向衝走。蝸牛慢慢慢地爬，竟然拿到冠軍；畫面外又一聲「碰」。慢、慢、慢跑
const clip: Clip = {
  char: '慢',
  meta: { theme: '賽車', cast: '兩台賽車＋蝸牛', gags: ['倒數', '衝太快撞車', '慢吞吞贏', '畫面外又撞一次'] },
  duration: 10,
  bg: { top: '#E4ECFF', bottom: '#F4F1FF', floor: '#A2A8B4', scenery: 'track' },
  actors: [
    { id: 'finish', emoji: '🏁', x: 150, y: 70, size: 12, hidden: true },
    { id: 'trophy', emoji: '🏆', x: 142, y: 66, size: 11, hidden: true, float: true },
    { id: 'car2', emoji: '🚗', x: 12, y: 70.5, size: 15, hidden: true, flip: true },
    { id: 'car1', emoji: '🏎️', x: 32, y: 70.5, size: 16, hidden: true, flip: true },
    { id: 'snail', emoji: '🐌', x: 14, y: 79, size: 11, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'finish', do: 'pop' },
    { at: 0, actor: 'car1', do: 'pop' }, { at: 0.1, actor: 'car2', do: 'pop' }, { at: 0.25, actor: 'snail', do: 'pop' },
    { at: 0.4, actor: 'car1', do: 'shake', dur: 1.2, amount: 0.4 },
    { at: 0.4, actor: 'car2', do: 'shake', dur: 1.2, amount: 0.4 },
    // 開跑！車子咻一聲不見，蝸牛挪了一點點
    { at: 1.7, actor: 'car1', do: 'moveTo', to: { x: 195, y: 70.5 }, dur: 0.3 },
    { at: 1.75, actor: 'car2', do: 'moveTo', to: { x: 195, y: 70.5 }, dur: 0.35 },
    { at: 1.8, actor: 'snail', do: 'moveTo', to: { x: 18, y: 79 }, dur: 1.2 },
    // 冒著煙倒車回來，暈頭轉向
    { at: 3.2, actor: 'car1', do: 'moveTo', to: { x: 124, y: 70.5 }, dur: 0.6 },
    { at: 3.3, actor: 'car2', do: 'moveTo', to: { x: 104, y: 70.5 }, dur: 0.6 },
    { at: 3.9, actor: 'car1', do: 'shake', dur: 0.8, amount: 0.8 },
    { at: 3.9, actor: 'car2', do: 'shake', dur: 0.8, amount: 0.8 },
    // 轉頭，往反方向衝走
    { at: 4.9, actor: 'car1', do: 'flip' }, { at: 4.9, actor: 'car2', do: 'flip' },
    { at: 5.0, actor: 'car1', do: 'moveTo', to: { x: -30, y: 70.5 }, dur: 0.35 },
    { at: 5.05, actor: 'car2', do: 'moveTo', to: { x: -30, y: 70.5 }, dur: 0.4 },
    // 蝸牛慢慢慢地爬到終點
    { at: 3.4, actor: 'snail', do: 'moveTo', to: { x: 136, y: 79 }, dur: 5.0 },
    { at: 8.6, actor: 'trophy', do: 'pop' },
    { at: 8.75, actor: 'snail', do: 'hop', dur: 0.4, amount: 3 },
  ],
  builds: [
    // 蝸牛爬過留下的亮亮的路 → 忄；撞車飛出來的零件 → 曼
    { at: 5.2, dur: 0.6, strokes: [0, 1, 2], from: 'snail', color: '#3FA37A' },
    { at: 5.6, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: { x: 150, y: 60 }, color: '#D9423E' },
    { at: 6.4, dur: 0.5, strokes: [12, 13], from: { x: 150, y: 60 }, color: '#D9423E' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'burst', x: 48, y: 38, emoji: '3️⃣', dur: 0.45 },
    { at: 0.85, kind: 'burst', x: 48, y: 38, emoji: '2️⃣', dur: 0.45 },
    { at: 1.3, kind: 'burst', x: 48, y: 38, emoji: '1️⃣', dur: 0.45 },
    { at: 1.7, kind: 'puff', actor: 'car1' },
    { at: 2.1, kind: 'bubble', actor: 'snail', emoji: '😌', dur: 1.0 },
    { at: 2.7, kind: 'burst', x: 154, y: 62, dur: 0.6 },
    { at: 3.9, kind: 'dizzy', actor: 'car1', dur: 1.0 },
    { at: 3.9, kind: 'dizzy', actor: 'car2', dur: 1.0 },
    { at: 3.9, kind: 'burst', actor: 'car1', emoji: '💨', n: 5, dur: 0.6 },
    { at: 7.4, kind: 'sweat', actor: 'snail' },
    { at: 8.6, kind: 'burst', actor: 'trophy', emoji: '🎉', n: 6, dur: 0.6 },
    { at: 9.3, kind: 'burst', x: 6, y: 62, dur: 0.5 },
  ],
  camera: [
    { at: 2.7, dur: 0.4, do: 'shake', amount: 2 },
    { at: 9.3, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.4, sfx: 'blip' }, { at: 0.85, sfx: 'blip' }, { at: 1.3, sfx: 'blip' },
    { at: 1.7, sfx: 'whoosh' },
    { at: 2.2, say: '慢' },
    { at: 2.7, sfx: 'bonk' }, { at: 2.75, sfx: 'rumble' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 6.95, say: '慢' },
    { at: 7.9, say: '慢跑' },
    { at: 8.65, sfx: 'cheer' },
    { at: 9.3, sfx: 'bonk' },
  ],
}

export default clip
