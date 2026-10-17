import type { Clip } from '../clip'

// 枝：消防隊長開消防車來幫光禿禿的小樹澆水，水管卻只滴出一滴；大怪獸轉身一屁股撞到水泵開到最大，水柱暴衝，
// 隊長抓著水管像火箭一樣亂彈：地板、牆壁、天花板、怪獸的頭，每撞一下就敲正兩根木條，拼成「枝」，隊長像小鳥一樣停在最高那一筆上面。
// 水管最後打個噴嚏噴到小樹，冒出一根新樹枝；回馬槍：怪獸又轉身撞到水泵，水柱噴了停在上面的隊長一身。枝、枝、樹枝
const clip: Clip = {
  char: '枝',
  meta: { theme: '失控消防水管', cast: '消防隊長＋大怪獸＋消防車＋小樹盆栽', gags: ['水管只滴一滴', '怪獸屁股撞開水泵', '四連彈像火箭亂撞'] },
  duration: 10,
  bg: { top: '#DCEBFA', bottom: '#F2F8FF', floor: '#C9D6E3', scenery: 'room' },
  actors: [
    { id: 'w1', emoji: '🪵', x: 72, y: 72.5, size: 8 },
    { id: 'w2', emoji: '🪵', x: 82, y: 72.5, size: 8 },
    { id: 'w3', emoji: '🪵', x: 92, y: 72.5, size: 8 },
    { id: 'w4', emoji: '🪵', x: 82, y: 67, size: 8 },
    { id: 'pot', emoji: '🪴', x: 142, y: 71, size: 12, tint: 'grayscale(1) brightness(.85)' },
    { id: 'leaf', emoji: '🌿', x: 146, y: 58, size: 11, hidden: true },
    { id: 'mon', emoji: 'hero:monster/idle', x: 8, y: 70.5, size: 15, hidden: true, flip: true },
    { id: 'truck', emoji: '🚒', x: 20, y: 68, size: 18, hidden: true, flip: true },
    { id: 'chief', emoji: 'hero:firefighter/idle', x: 40, y: 71.5, size: 13, hidden: true, flip: true },
  ],
  moves: [
    // 消防車開進來停在左下角，隊長跳下車
    { at: 0.0, actor: 'truck', do: 'enter', from: { x: -20, y: 68 }, dur: 0.5, ease: 'back' },
    { at: 0.5, actor: 'truck', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 0.6, actor: 'chief', do: 'enter', from: { x: 22, y: 64 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 1.0, actor: 'chief', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 1.2, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/hose' },
    // 轉開水——只滴出一滴；甩一甩往水管裡看
    { at: 1.7, actor: 'chief', do: 'shake', amount: 1, dur: 0.4 },
    { at: 2.2, actor: 'chief', do: 'tilt', amount: 18, dur: 0.5 },
    // 怪獸走過來，一轉身屁股撞到水泵
    { at: 1.8, actor: 'mon', do: 'enter', from: { x: -16, y: 70.5 }, dur: 0.6 },
    { at: 2.5, actor: 'mon', do: 'flip' },
    { at: 2.6, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 2.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    // 水柱暴衝，隊長被沖成火箭：地板
    { at: 2.9, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 2.9, actor: 'chief', do: 'moveTo', to: { x: 64, y: 71.5 }, arc: 16, dur: 0.35, ease: 'in' },
    { at: 3.25, actor: 'chief', do: 'squash', amount: 0.4, dur: 0.15 },
    // 牆壁
    { at: 3.3, actor: 'chief', do: 'moveTo', to: { x: 7, y: 40 }, dur: 0.35, ease: 'in' },
    { at: 3.65, actor: 'chief', do: 'squash', amount: 0.35, dur: 0.15 },
    // 天花板
    { at: 3.7, actor: 'chief', do: 'moveTo', to: { x: 40, y: 7 }, dur: 0.35, ease: 'in' },
    { at: 4.05, actor: 'chief', do: 'squash', amount: 0.35, dur: 0.15 },
    // 怪獸的頭
    { at: 4.1, actor: 'chief', do: 'moveTo', to: { x: 12, y: 54 }, dur: 0.35, ease: 'in' },
    { at: 4.45, actor: 'mon', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.45, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    // 水管軟掉，隊長落在最高那一筆的頂端
    { at: 4.55, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 4.55, actor: 'chief', do: 'moveTo', to: { x: 67, y: 12.5 }, arc: 10, dur: 0.55, ease: 'out' },
    { at: 4.55, actor: 'chief', do: 'spin', times: 1, dur: 0.55 },
    { at: 3.25, actor: 'w1', do: 'vanish', dur: 0.15 },
    { at: 3.65, actor: 'w2', do: 'vanish', dur: 0.15 },
    { at: 4.05, actor: 'w3', do: 'vanish', dur: 0.15 },
    { at: 4.45, actor: 'w4', do: 'vanish', dur: 0.15 },
    // 水管打個噴嚏，小樹冒出新樹枝
    { at: 6.1, actor: 'truck', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 6.4, actor: 'pot', do: 'tint', filter: '' },
    { at: 6.4, actor: 'pot', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 6.45, actor: 'leaf', do: 'pop', dur: 0.35 },
    { at: 6.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 6.6, actor: 'mon', do: 'hop', amount: 5, dur: 0.4 },
    { at: 6.8, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.9, actor: 'leaf', do: 'tilt', amount: 12, dur: 0.6 },
    // 回馬槍：怪獸又轉身，屁股又撞到水泵——水柱噴了隊長一身
    { at: 7.9, actor: 'mon', do: 'flip' },
    { at: 8.0, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 8.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 8.3, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.3, actor: 'chief', do: 'shake', amount: 1, dur: 0.6 },
    { at: 9.0, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 9.0, actor: 'chief', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 每撞一下敲正兩根：木的橫豎 → 木的兩撇 → 支的橫豎 → 又
    { at: 3.25, dur: 0.35, strokes: [0, 1], from: 'w1', color: '#7A4A26' },
    { at: 3.65, dur: 0.35, strokes: [2, 3], from: 'w2', color: '#7A4A26' },
    { at: 4.05, dur: 0.35, strokes: [4, 5], from: 'w3', color: '#7A4A26' },
    { at: 4.45, dur: 0.45, strokes: [6, 7], from: 'w4', color: '#7A4A26' },
  ],
  glyph: [{ at: 5.1, dur: 0.4, do: 'shake' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'puff', actor: 'truck', dur: 0.5 },
    { at: 1.0, kind: 'bubble', actor: 'chief', emoji: '🌱', dur: 0.8, dx: 6 },
    { at: 1.9, kind: 'pop', actor: 'chief', emoji: '💧', dur: 0.5, dx: 7, dy: 6 },
    { at: 2.3, kind: 'pop', actor: 'chief', emoji: '❓', dur: 0.5 },
    { at: 2.6, kind: 'burst', actor: 'truck', dur: 0.35 },
    { at: 2.85, kind: 'line', actor: 'chief', to: { x: 60, y: 0 }, color: '#74C0FC', width: 3, dur: 0.4 },
    { at: 3.25, kind: 'puff', actor: 'chief', dur: 0.4 },
    { at: 3.65, kind: 'burst', actor: 'chief', dur: 0.3, dx: 4 },
    { at: 4.05, kind: 'burst', actor: 'chief', dur: 0.3, dy: 12 },
    { at: 4.45, kind: 'burst', actor: 'mon', emoji: '💫', n: 4, dur: 0.4, dx: 8 },
    { at: 5.1, kind: 'dizzy', actor: 'chief', dur: 1.0, dx: 9, dy: 10 },
    { at: 6.1, kind: 'rain', x: 142, y: 54, emoji: '💦', n: 5, dur: 0.5 },
    { at: 6.45, kind: 'burst', actor: 'leaf', emoji: '✨', n: 5, dur: 0.5, dx: -8, dy: 4 },
    { at: 8.05, kind: 'fountain', actor: 'truck', emoji: '💦', dur: 0.6 },
    { at: 8.3, kind: 'rain', actor: 'chief', emoji: '💧', n: 5, dur: 0.6, dx: 10, dy: 8 },
    { at: 9.0, kind: 'pop', actor: 'chief', emoji: '👍', dur: 0.6, dx: 10, dy: 8 },
  ],
  camera: [
    { at: 2.9, dur: 0.4, do: 'shake', amount: 0.8 },
    { at: 3.65, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 4.45, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.1, sfx: 'rumble' },
    { at: 1.3, say: '枝' },
    { at: 1.9, sfx: 'plop' },
    { at: 2.6, sfx: 'bonk' },
    { at: 2.85, sfx: 'whoosh' },
    { at: 3.25, sfx: 'boing' },
    { at: 3.65, sfx: 'bonk' },
    { at: 4.05, sfx: 'boing' },
    { at: 4.45, sfx: 'bonk' },
    { at: 5.15, say: '枝' },
    { at: 6.1, sfx: 'achoo' },
    { at: 6.45, say: '樹枝' },
    { at: 8.05, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
