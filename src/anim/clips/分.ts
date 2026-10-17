import type { Clip } from '../clip'

// 分：愛衝過頭的玩具賽車追著老是飄起來的太空人玩偶。第一次衝過去，太空人一飄，賽車一頭撞進泡棉輪胎；再繞一大圈，兩道甩尾痕畫出上面的「八」。
// 最後飛撲成功，撞成一團堆出下面的「刀」——兩個黏在一起，「啵」地分開滑到兩邊。賽車得意原地甩尾，甩到自己頭暈。分、分、分開
const clip: Clip = {
  char: '分',
  meta: { theme: '賽車追太空人', cast: '酷炫車子＋太空人玩偶＋泡棉輪胎', gags: ['衝過頭撞輪胎', '甩尾痕畫筆畫', '黏在一起啵地分開'] },
  duration: 10,
  bg: { top: '#DBE4FF', bottom: '#EDF2FF', floor: '#B0B8C4', scenery: 'track' },
  actors: [
    { id: 'tire1', emoji: '🛞', x: 152, y: 70, size: 10 },
    { id: 'tire2', emoji: '🛞', x: 152, y: 61, size: 10 },
    { id: 'astro', emoji: 'hero:astronaut/float', x: 126, y: 60, size: 13, float: true },
    { id: 'car', emoji: 'hero:car/idle', x: 22, y: 68.6, size: 20, flip: true },
  ],
  moves: [
    // 往後拉、上發條
    { at: 0.1, actor: 'car', do: 'moveTo', to: { x: 16, y: 68.6 }, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'car', do: 'shake', amount: 0.8, dur: 0.8 },
    { at: 0.3, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 0.3, actor: 'astro', do: 'bounce', amount: 2, times: 2, dur: 0.8 },
    // 彈出去！
    { at: 1.0, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 1.0, actor: 'car', do: 'moveTo', to: { x: 140, y: 68.6 }, dur: 0.55, anticipate: 4, ease: 'in' },
    // 太空人最後一秒飄上去，賽車撞進輪胎
    { at: 1.3, actor: 'astro', do: 'moveTo', to: { x: 128, y: 34 }, dur: 0.35, ease: 'out' },
    { at: 1.55, actor: 'car', do: 'squash', amount: -0.4, dur: 0.25 },
    { at: 1.55, actor: 'tire1', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 1.55, actor: 'tire2', do: 'hop', amount: 4, dur: 0.35 },
    { at: 1.55, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 1.8, actor: 'car', do: 'moveTo', to: { x: 124, y: 68.6 }, dur: 0.4, ease: 'out' },
    // 甩甩頭再來，繞一大圈
    { at: 2.4, actor: 'car', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.5, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 2.6, actor: 'car', do: 'flip' },
    { at: 2.6, actor: 'car', do: 'moveTo', to: { x: 24, y: 68.6 }, dur: 0.55, ease: 'in' },
    { at: 2.6, actor: 'astro', do: 'moveTo', to: { x: 148, y: 46 }, dur: 0.8 },
    { at: 3.15, actor: 'car', do: 'flip' },
    { at: 3.15, actor: 'car', do: 'spin', times: 1, dur: 0.3 },
    { at: 3.45, actor: 'car', do: 'moveTo', to: { x: 128, y: 68.6 }, dur: 0.5, ease: 'inOut' },
    // 定格一拍：蹲低……飛撲！
    { at: 4.1, actor: 'car', do: 'squash', amount: 0.35, dur: 0.4 },
    { at: 4.05, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 4.5, actor: 'car', do: 'moveTo', to: { x: 140, y: 60 }, dur: 0.35, arc: 14, ease: 'out' },
    { at: 4.85, actor: 'astro', do: 'moveTo', to: { x: 144, y: 62 }, dur: 0.2, ease: 'out' },
    { at: 4.85, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 4.85, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 4.85, actor: 'car', do: 'moveTo', to: { x: 138, y: 66 }, dur: 0.25, ease: 'bounce' },
    { at: 4.85, actor: 'tire2', do: 'moveTo', to: { x: 156, y: 70 }, dur: 0.4, arc: 6, ease: 'out' },
    { at: 4.85, actor: 'tire2', do: 'spin', times: 1, dur: 0.4 },
    { at: 5.2, actor: 'car', do: 'shake', amount: 0.6, dur: 1.0 },
    { at: 5.2, actor: 'astro', do: 'shake', amount: 0.6, dur: 1.0 },
    // 啵！分開
    { at: 6.8, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 6.8, actor: 'car', do: 'flip' },
    { at: 6.8, actor: 'car', do: 'moveTo', to: { x: 18, y: 68.6 }, dur: 0.5, ease: 'out' },
    { at: 6.8, actor: 'astro', do: 'moveTo', to: { x: 150, y: 50 }, dur: 0.5, ease: 'out' },
    { at: 7.4, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 7.4, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/salute' },
    { at: 7.4, actor: 'astro', do: 'bounce', amount: 2, times: 3, dur: 1.6 },
    // 得意甩尾——甩到頭暈
    { at: 8.0, actor: 'car', do: 'spin', times: 3, dur: 0.9 },
    { at: 8.9, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 8.9, actor: 'car', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 9.2, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
  ],
  builds: [
    // 兩道甩尾痕 → 八
    { at: 3.0, dur: 0.4, strokes: [0], from: 'car', color: '#1E3A8A' },
    { at: 3.75, dur: 0.4, strokes: [1], from: 'car', color: '#1E3A8A' },
    // 撞成一團 → 刀
    { at: 4.95, dur: 0.4, strokes: [2], from: 'car', color: '#1E3A8A' },
    { at: 5.35, dur: 0.4, strokes: [3], from: 'astro', color: '#1E3A8A' },
  ],
  glyph: [{ at: 5.8, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'puff', actor: 'car', dur: 0.8 },
    { at: 0.5, kind: 'pop', actor: 'astro', emoji: '👋', dur: 0.6 },
    { at: 1.55, kind: 'burst', actor: 'car', dx: 8 },
    { at: 1.8, kind: 'dizzy', actor: 'car', dur: 0.8 },
    { at: 1.8, kind: 'pop', actor: 'astro', emoji: '😆', dur: 0.6 },
    { at: 3.0, kind: 'puff', actor: 'car', dur: 0.4 },
    { at: 3.75, kind: 'puff', actor: 'car', dur: 0.4 },
    { at: 4.85, kind: 'burst', actor: 'astro', dx: -6 },
    { at: 5.4, kind: 'dizzy', actor: 'astro', dur: 1.2 },
    { at: 6.8, kind: 'burst', x: 141, y: 60 },
    { at: 7.4, kind: 'pop', actor: 'astro', emoji: '👍', dur: 0.7 },
    { at: 8.0, kind: 'puff', actor: 'car', dur: 0.9 },
    { at: 8.95, kind: 'dizzy', actor: 'car', dur: 0.9 },
  ],
  camera: [
    { at: 1.0, dur: 0.3, do: 'follow', actor: 'car', amount: 1.3 },
    { at: 1.6, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 1.55, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.85, dur: 0.35, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.1, sfx: 'rumble' },
    { at: 1.05, say: '分' },
    { at: 1.0, sfx: 'whoosh' },
    { at: 1.55, sfx: 'bonk' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 3.0, sfx: 'slide' },
    { at: 3.75, sfx: 'slide' },
    { at: 4.5, sfx: 'boing' },
    { at: 4.85, sfx: 'bonk' },
    { at: 5.85, say: '分' },
    { at: 6.8, sfx: 'poof' },
    { at: 6.85, say: '分開' },
    { at: 8.0, sfx: 'slide' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
