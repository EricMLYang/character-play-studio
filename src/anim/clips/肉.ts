import type { Clip } from '../clip'

// 肉：布忍者躲在一片小葉子後面（整個人都露出來），想偷右邊的肉丸。煙霧彈提早爆炸，把他像皮球一樣彈飛——撞地板、撞右牆、
// 撞消防車的雲梯、被水柱沖上天、撞到天花板、再被噴回來，每撞一下就「喀」地敲出「肉」的一筆。最後一彈正好坐在字的頂上，
// 水柱把肉丸沖上來掉進他懷裡。他跳下來抱著肉丸、舉起葉子「躲好」，結果水管又噴他一下。肉、肉、肉丸
const clip: Clip = {
  char: '肉',
  meta: { theme: '夜裡忍者偷肉丸', cast: '布忍者＋消防車＋肉丸', gags: ['葉子後面整個人都露出來', '煙霧彈提早爆炸彈來彈去', '水管亂噴'] },
  duration: 10,
  bg: { top: '#24325F', bottom: '#4B5D94', floor: '#BFD8C9', scenery: 'night' },
  actors: [
    { id: 'meat', emoji: '🧆', x: 146, y: 70, size: 8 },
    { id: 'engine', emoji: '🚒', x: 22, y: 69, size: 20, hidden: true, flip: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 18, y: 72, size: 12, flip: true },
  ],
  moves: [
    // 拿著葉子，大步大步踮腳走
    { at: 0.4, actor: 'ninja', do: 'moveTo', to: { x: 26, y: 72 }, arc: 4, dur: 0.35 },
    { at: 0.85, actor: 'ninja', do: 'moveTo', to: { x: 34, y: 72 }, arc: 4, dur: 0.35 },
    // 拿出煙霧彈——提早爆炸，被彈飛
    { at: 1.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 1.45, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 1.45, actor: 'ninja', do: 'moveTo', to: { x: 48, y: 72 }, arc: 16, dur: 0.4, ease: 'in' },
    // ① 撞地板
    { at: 1.85, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.15 },
    { at: 1.95, actor: 'ninja', do: 'moveTo', to: { x: 152, y: 40 }, dur: 0.45, ease: 'linear' },
    { at: 1.95, actor: 'ninja', do: 'spin', times: 1, dur: 0.45 },
    // ② 撞右牆
    { at: 2.4, actor: 'ninja', do: 'squash', amount: -0.4, dur: 0.15 },
    { at: 2.5, actor: 'ninja', do: 'moveTo', to: { x: 30, y: 54 }, arc: 8, dur: 0.6, ease: 'linear' },
    { at: 2.5, actor: 'ninja', do: 'spin', times: 2, dur: 0.6 },
    // 消防車開進來
    { at: 2.3, actor: 'engine', do: 'enter', from: { x: -20, y: 69 }, dur: 0.6, ease: 'out' },
    // ③ 撞雲梯
    { at: 3.1, actor: 'engine', do: 'squash', amount: 0.2, dur: 0.2 },
    // ④ 水柱把他沖上天
    { at: 3.2, actor: 'ninja', do: 'moveTo', to: { x: 66, y: 20 }, dur: 0.3, ease: 'out' },
    // ⑤ 撞天花板
    { at: 3.5, actor: 'ninja', do: 'moveTo', to: { x: 104, y: 6 }, dur: 0.3, ease: 'linear' },
    { at: 3.8, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.15 },
    { at: 3.9, actor: 'ninja', do: 'moveTo', to: { x: 40, y: 38 }, dur: 0.45, ease: 'linear' },
    { at: 3.9, actor: 'ninja', do: 'spin', times: 1, dur: 0.45 },
    // ⑥ 水管轉一圈噴到自己人，他被噴回來
    { at: 3.95, actor: 'engine', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 4.35, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.15 },
    // 最後一彈正好坐在字的頂上
    { at: 4.45, actor: 'ninja', do: 'moveTo', to: { x: 80, y: 8 }, arc: 8, dur: 0.5, ease: 'out' },
    { at: 4.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.95, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.2 },
    // 水柱把肉丸沖上來，掉進他懷裡
    { at: 5.8, actor: 'meat', do: 'hop', amount: 3, dur: 0.2 },
    { at: 6.0, actor: 'meat', do: 'moveTo', to: { x: 86, y: 9 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 6.0, actor: 'meat', do: 'spin', times: 2, dur: 0.6 },
    { at: 6.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 6.6, actor: 'ninja', do: 'squash', amount: 0.2, dur: 0.2 },
    // 抱著肉丸跳下來，舉起葉子「躲好」
    { at: 7.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 7.4, actor: 'ninja', do: 'moveTo', to: { x: 132, y: 72 }, arc: 10, dur: 0.6, ease: 'inOut' },
    { at: 7.4, actor: 'meat', do: 'moveTo', to: { x: 138, y: 70 }, arc: 10, dur: 0.6, ease: 'inOut' },
    { at: 8.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.2, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.4 },
    // 回馬槍：水管又偷偷噴他一下
    { at: 8.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 8.9, actor: 'ninja', do: 'hop', amount: 6, dur: 0.35 },
    { at: 8.9, actor: 'meat', do: 'hop', amount: 9, dur: 0.4 },
    { at: 9.35, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
  ],
  builds: [
    // 每撞一下敲出一筆：地板 → 左邊長長的一豎；右牆 → 右上帶勾的框；雲梯 → 上面那個人的撇；水柱 → 捺；天花板 → 下面那個人的撇；噴回來 → 最後一捺
    { at: 1.85, dur: 0.35, strokes: [0], from: { x: 48, y: 76 }, color: '#B5452F' },
    { at: 2.4, dur: 0.4, strokes: [1], from: { x: 158, y: 40 }, color: '#C0392B' },
    { at: 3.1, dur: 0.3, strokes: [2], from: 'engine', color: '#B5452F' },
    { at: 3.4, dur: 0.3, strokes: [3], from: { x: 66, y: 22 }, color: '#C0392B' },
    { at: 3.8, dur: 0.3, strokes: [4], from: { x: 104, y: 2 }, color: '#B5452F' },
    { at: 4.35, dur: 0.35, strokes: [5], from: { x: 40, y: 38 }, color: '#C0392B' },
  ],
  glyph: [{ at: 4.95, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'bubble', actor: 'ninja', emoji: '🧆', dur: 0.9 },
    { at: 1.45, kind: 'burst', actor: 'ninja', emoji: '💨', n: 1, dur: 0.45 },
    { at: 1.85, kind: 'puff', actor: 'ninja', dur: 0.4 },
    { at: 2.4, kind: 'burst', actor: 'ninja', n: 1, dur: 0.3, dx: -4 },
    { at: 3.1, kind: 'burst', actor: 'ninja', n: 1, dur: 0.3 },
    { at: 3.15, dur: 0.35, kind: 'line', actor: 'engine', target: 'ninja', color: '#74C0FC', width: 1.6, dy: -4 },
    { at: 3.8, kind: 'burst', actor: 'ninja', n: 1, dur: 0.3, dy: 10 },
    { at: 3.95, kind: 'fountain', actor: 'engine', emoji: '💧', dur: 0.6 },
    { at: 4.25, dur: 0.3, kind: 'line', actor: 'engine', target: 'ninja', color: '#74C0FC', width: 1.6, dy: -4 },
    { at: 5.0, kind: 'pop', actor: 'ninja', emoji: '💫', dur: 0.8, dx: 4, dy: 10 },
    { at: 5.85, dur: 0.3, kind: 'line', actor: 'engine', target: 'meat', color: '#74C0FC', width: 1.2, dy: -4 },
    { at: 6.65, kind: 'pop', actor: 'ninja', emoji: '💕', dur: 0.6, dx: 4, dy: 10 },
    { at: 8.85, dur: 0.25, kind: 'line', actor: 'engine', target: 'ninja', color: '#74C0FC', width: 1.2, dy: -4 },
    { at: 8.95, kind: 'pop', actor: 'ninja', emoji: '💦', dur: 0.5 },
  ],
  camera: [
    { at: 2.4, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 3.8, dur: 0.35, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.5, sfx: 'tap' },
    { at: 0.95, sfx: 'tap' },
    { at: 1.45, sfx: 'poof' },
    { at: 1.9, say: '肉' },
    { at: 2.4, sfx: 'bonk' },
    { at: 3.1, sfx: 'clink' },
    { at: 3.2, sfx: 'splash' },
    { at: 3.8, sfx: 'bonk' },
    { at: 4.3, sfx: 'splash' },
    { at: 4.95, say: '肉' },
    { at: 5.85, sfx: 'splash' },
    { at: 6.6, say: '肉丸' },
    { at: 8.9, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
