import type { Clip, Move } from '../clip'

// 蝦（重做）：小蝦尾巴上只有一點點火苗，消防員卻當成大火災：水管一噴，小蝦往後一跳躲開、他被後座力推倒退；飛撲過去肚子著地，
// 壓住的水管變成大水柱把他頂上天，水花炸開變成「叚」、他摔下來甩出的水變成「虫」。國字讓到上方，他踮腳走到中間只擠一滴水就熄了（蝦子）。
// 回馬槍：一顆火星跳到他頭上變成大火，小蝦一個大噴嚏把火吹走，也把他吹到旁邊。蝦、蝦、蝦子
const F = 67.8 // 消防員（size 22）站在地上的 y
const S = 69.4 // 小蝦（size 18）
const FX = 11, FY = -7 // 火苗在小蝦背上（相對小蝦）

// 小蝦的移動抄一份給尾巴上的火苗
const tail = (ms: Move[]): Move[] => ms.flatMap((m) => [
  m,
  ...(m.do === 'moveTo' || m.do === 'hop' ? [{ ...m, actor: 'flame', to: m.to && { x: m.to.x + FX, y: m.to.y + FY } }] : []),
])

const clip: Clip = {
  char: '蝦',
  meta: { theme: '消防員救小火苗', cast: '消防員＋尾巴著火的小蝦＋一滴水＋火星', gags: ['小火苗當大火災', '水管後座力自己倒退', '飛撲肚子著地被水柱頂上天', '一滴水就熄', '火星跳到頭上被噴嚏吹走'] },
  duration: 10,
  bg: { top: '#FFE8CC', bottom: '#FFF6EA', floor: '#E6CFA8', scenery: 'city' },
  actors: [
    { id: 'shrimp', emoji: '🦐', x: 96, y: S, size: 18 },
    { id: 'flame', emoji: '🔥', x: 96 + FX, y: S + FY, size: 7, float: true },
    { id: 'drop', emoji: '💧', x: 72, y: 63, size: 6, hidden: true, float: true },
    { id: 'spark', emoji: '🔥', x: 104, y: 64, size: 4.5, hidden: true, float: true },
    { id: 'ff', emoji: 'hero:firefighter/idle', x: 34, y: F, size: 22, hidden: true },
  ],
  moves: [
    // 小蝦坐在中間，尾巴冒著一點點火，悠哉地甩尾巴
    { at: 0.1, actor: 'shrimp', do: 'tilt', amount: 8, dur: 0.5 },
    { at: 0, actor: 'flame', do: 'shake', amount: 0.6, dur: 1.2 },
    // 消防員衝進來，看到火：大火災！
    { at: 0, actor: 'ff', do: 'enter', from: { x: -20, y: F }, dur: 0.55, ease: 'out' },
    { at: 0.7, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 0.7, actor: 'ff', do: 'hop', amount: 5, dur: 0.3 },
    { at: 1.05, actor: 'ff', do: 'shake', amount: 1.2, dur: 0.35 },
    // 第一次：水管瞄準、噴——小蝦往後一跳躲開，他被後座力推得倒退
    { at: 1.4, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 1.45, actor: 'ff', do: 'squash', amount: -0.3, dur: 0.3 },
    ...tail([
      { at: 1.72, actor: 'shrimp', do: 'moveTo', to: { x: 114, y: S }, arc: 10, dur: 0.35, ease: 'out' },
    ]),
    { at: 1.75, actor: 'ff', do: 'moveTo', to: { x: 20, y: F }, dur: 0.35, ease: 'out' },
    { at: 1.75, actor: 'ff', do: 'shake', amount: 1, dur: 0.35 },
    { at: 2.15, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 第二次：蹲低蓄力、飛撲過去——小蝦又往後一跳，他肚子著地
    { at: 2.55, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 2.55, actor: 'ff', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: 2.9, actor: 'ff', do: 'moveTo', to: { x: 84, y: F }, arc: 16, dur: 0.45, anticipate: 5, ease: 'in' },
    ...tail([
      { at: 3.05, actor: 'shrimp', do: 'moveTo', to: { x: 130, y: S }, arc: 12, dur: 0.4, ease: 'out' },
    ]),
    { at: 3.35, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 3.35, actor: 'ff', do: 'squash', amount: 0.5, dur: 0.35 },
    // 壓住的水管變成大水柱，把他頂上天
    { at: 3.65, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 3.65, actor: 'ff', do: 'moveTo', to: { x: 84, y: 30 }, dur: 0.6, ease: 'out' },
    { at: 3.65, actor: 'ff', do: 'spin', times: 2, dur: 0.6 },
    // 水柱停了，他停在半空——低頭一看
    { at: 4.6, actor: 'ff', do: 'shake', amount: 0.6, dur: 0.3 },
    // 掉下來，摔到左邊
    { at: 4.95, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 4.95, actor: 'ff', do: 'moveTo', to: { x: 26, y: F }, arc: 6, dur: 0.5, ease: 'in' },
    { at: 4.95, actor: 'ff', do: 'spin', times: -1, dur: 0.5 },
    // 小蝦：火還在耶
    { at: 5.75, actor: 'shrimp', do: 'tilt', amount: -10, dur: 0.4 },
    { at: 5.75, actor: 'flame', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 6.05, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 6.05, actor: 'ff', do: 'shake', amount: 0.8, dur: 0.3 },
    // 國字讓位：他踮腳走到中間，小蝦也跳過來
    { at: 6.5, actor: 'ff', do: 'moveTo', to: { x: 62, y: F }, dur: 0.6 },
    ...tail([
      { at: 6.6, actor: 'shrimp', do: 'moveTo', to: { x: 96, y: S }, arc: 6, dur: 0.45 },
    ]),
    // 只擠一滴水
    { at: 7.15, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 7.2, actor: 'ff', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 7.4, actor: 'drop', do: 'pop', dur: 0.1 },
    { at: 7.45, actor: 'drop', do: 'moveTo', to: { x: 96 + FX, y: S + FY }, arc: 6, dur: 0.3, ease: 'in' },
    { at: 7.75, actor: 'drop', do: 'vanish', dur: 0.1 },
    { at: 7.75, actor: 'flame', do: 'vanish', dur: 0.15 },
    // 熄了！小蝦開心跳起來（蝦子）
    { at: 7.8, actor: 'shrimp', do: 'hop', amount: 13, dur: 0.55 },
    { at: 7.8, actor: 'shrimp', do: 'spin', times: 1, dur: 0.5 },
    { at: 7.85, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 7.85, actor: 'ff', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：一顆火星從尾巴跳到他頭上，變成大火
    { at: 8.35, actor: 'spark', do: 'pop', dur: 0.1 },
    { at: 8.4, actor: 'spark', do: 'moveTo', to: { x: 62, y: 52 }, arc: 10, dur: 0.3, ease: 'in' },
    { at: 8.7, actor: 'spark', do: 'scaleTo', amount: 3.2, dur: 0.2, ease: 'back' },
    { at: 8.7, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.7, actor: 'ff', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 8.7, actor: 'spark', do: 'shake', amount: 1.5, dur: 0.4 },
    // 燙燙燙！原地亂跳
    ...[8.75, 8.92].flatMap((at) => (['ff', 'spark'] as const).map((actor) => ({ at, actor, do: 'hop' as const, amount: 5, dur: 0.16 }))),
    // 小蝦吸一口氣——哈啾！把火吹走，也把他吹到左邊；自己往後彈
    { at: 8.8, actor: 'shrimp', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 9.1, actor: 'shrimp', do: 'squash', amount: 0.4, dur: 0.2 },
    { at: 9.1, actor: 'spark', do: 'moveTo', to: { x: -14, y: 34 }, dur: 0.35, ease: 'out' },
    { at: 9.45, actor: 'spark', do: 'vanish', dur: 0.1 },
    { at: 9.1, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 9.1, actor: 'ff', do: 'moveTo', to: { x: 28, y: F }, arc: 18, dur: 0.45, ease: 'out' },
    { at: 9.1, actor: 'ff', do: 'spin', times: -1, dur: 0.45 },
    { at: 9.1, actor: 'shrimp', do: 'moveTo', to: { x: 128, y: S }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 9.6, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 9.6, actor: 'shrimp', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
  ],
  builds: [
    // 水柱在半空炸開 → 叚；他摔下來甩出的水 → 虫
    { at: 4.25, dur: 0.6, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14], from: 'ff', color: '#339AF0' },
    { at: 5.0, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: 'ff', color: '#1098AD' },
  ],
  glyph: [
    { at: 5.6, dur: 0.4, do: 'wobble' },
    { at: 6.4, dur: 0.45, do: 'park' },
    { at: 9.15, dur: 0.4, do: 'home' },
    { at: 9.6, dur: 0.4, do: 'pulse' },
  ],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'ff', emoji: '❗', dur: 0.45 },
    { at: 1.05, kind: 'pop', actor: 'ff', emoji: '😱', dur: 0.4 },
    { at: 1.1, kind: 'pop', actor: 'shrimp', emoji: '😑', dx: -6, dur: 0.5 },
    { at: 1.4, kind: 'sweat', actor: 'ff' },
    // 第一次噴水
    { at: 1.75, dur: 0.35, kind: 'line', actor: 'ff', to: { x: 98, y: 70 }, color: '#74C0FC', width: 3, dx: 8, dy: -1 },
    { at: 2.0, kind: 'burst', x: 98, y: 68, emoji: '💦', n: 5, dur: 0.45 },
    { at: 2.2, kind: 'pop', actor: 'shrimp', emoji: '😏', dx: -6, dur: 0.45 },
    { at: 2.3, kind: 'pop', actor: 'ff', emoji: '😤', dur: 0.45 },
    // 肚子著地、水柱
    { at: 3.35, kind: 'burst', actor: 'ff', n: 1, dy: 10, dur: 0.35 },
    { at: 3.65, dur: 0.95, kind: 'line', actor: 'ff', to: { x: 84, y: 74 }, color: '#4DABF7', width: 6, dy: 6 },
    { at: 3.7, kind: 'fountain', actor: 'ff', emoji: '💦', n: 8, dy: 14, dur: 0.6 },
    { at: 4.25, kind: 'burst', actor: 'ff', emoji: '💧', n: 8, dur: 0.5 },
    { at: 4.6, kind: 'pop', actor: 'ff', emoji: '😳', dx: 10, dur: 0.4 },
    { at: 5.45, kind: 'dizzy', actor: 'ff', dur: 0.8 },
    { at: 5.75, kind: 'pop', actor: 'shrimp', emoji: '😑', dx: -6, dur: 0.5 },
    { at: 6.1, kind: 'sweat', actor: 'ff' },
    // 一滴水
    { at: 7.15, kind: 'sweat', actor: 'ff' },
    { at: 7.75, kind: 'burst', actor: 'shrimp', emoji: '☁️', n: 4, dy: 10, dur: 0.5 },
    { at: 7.85, kind: 'burst', actor: 'shrimp', emoji: '✨', n: 6, dur: 0.6 },
    // 回馬槍
    { at: 8.75, kind: 'pop', actor: 'ff', emoji: '😱', dx: -14, dy: 8, dur: 0.4 },
    { at: 9.1, kind: 'burst', actor: 'shrimp', emoji: '💨', n: 4, dx: -18, dy: 8, dur: 0.45 },
    { at: 9.1, kind: 'pop', actor: 'shrimp', emoji: '💨', dx: -16, dy: 12, dur: 0.4 },
    { at: 9.5, kind: 'dizzy', actor: 'ff', dur: 0.5 },
  ],
  camera: [
    { at: 3.35, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: 4.25, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 7.8, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 80, y: 60 } },
    { at: 9.1, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 水柱炸開：白光一閃
    { at: 4.25, dur: 0.04, level: -0.7 },
    { at: 4.29, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'slide' },
    { at: 1.05, say: '蝦' },
    { at: 1.75, sfx: 'splash' },
    { at: 1.72, sfx: 'boing' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.35, sfx: 'bonk' },
    { at: 3.65, sfx: 'splash' },
    { at: 4.25, sfx: 'poof' },
    { at: 4.95, sfx: 'whoosh' },
    { at: 5.6, say: '蝦' },
    { at: 6.6, sfx: 'boing' },
    { at: 7.45, sfx: 'plop' },
    { at: 7.8, say: '蝦子' },
    { at: 8.4, sfx: 'blip' },
    { at: 9.05, sfx: 'achoo' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
