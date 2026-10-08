import type { Clip } from '../clip'

// 瘦：瘦瘦的貓咪縮一縮就從兩棵樹中間的窄縫鑽過去吃到魚，胖狗狗也要鑽——卡住了！退後助跑再衝一次，卡得更緊，兩棵樹被撐飛，狗像軟木塞一樣「啵」地彈出去。
// 狗狗吸一口氣縮小肚子假裝自己也很瘦，憋不住一放氣，變得比原來還胖。瘦、瘦、瘦巴巴
const clip: Clip = {
  char: '瘦',
  meta: { theme: '森林鑽樹縫', cast: '瘦貓＋胖狗＋兩棵樹', gags: ['瘦的一鑽就過', '胖的卡住越衝越緊', '像軟木塞彈出去', '憋氣裝瘦反而更胖'] },
  duration: 10,
  bg: { top: '#E9F7E4', bottom: '#CDEBC2', floor: '#7FB069', scenery: 'forest' },
  actors: [
    { id: 'fish', emoji: '🐟', x: 132, y: 73.2, size: 9, hidden: true },
    { id: 'tree1', emoji: '🌲', x: 75, y: 68.6, size: 20, hidden: true },
    { id: 'cat', emoji: '🐈', x: 40, y: 72.4, size: 11, hidden: true, flip: true },
    { id: 'dog', emoji: '🐕', x: 20, y: 69.9, size: 17, hidden: true, flip: true },
    { id: 'tree2', emoji: '🌲', x: 89, y: 68.6, size: 20, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'tree1', do: 'pop' },
    { at: 0.1, actor: 'tree2', do: 'pop' },
    { at: 0.2, actor: 'fish', do: 'pop' },
    { at: 0, actor: 'cat', do: 'enter', from: { x: -12, y: 72.4 }, dur: 0.6 },
    { at: 0.1, actor: 'dog', do: 'enter', from: { x: -20, y: 69.9 }, dur: 0.7 },
    // 貓咪縮一縮，鑽過去
    { at: 1.2, actor: 'cat', do: 'moveTo', to: { x: 82, y: 72.4 }, dur: 0.35 },
    { at: 1.45, actor: 'cat', do: 'squash', amount: -0.5, dur: 0.4 },
    { at: 1.75, actor: 'cat', do: 'moveTo', to: { x: 120, y: 72.4 }, dur: 0.4 },
    { at: 2.15, actor: 'cat', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 2.2, actor: 'fish', do: 'vanish', dur: 0.15 },
    // 胖狗狗卡住
    { at: 2.5, actor: 'dog', do: 'moveTo', to: { x: 70, y: 69.9 }, dur: 0.4 },
    { at: 2.9, actor: 'dog', do: 'moveTo', to: { x: 79, y: 69.9 }, dur: 0.15 },
    { at: 3.0, actor: 'dog', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 3.0, actor: 'tree1', do: 'shake', amount: 1, dur: 0.3 },
    { at: 3.0, actor: 'tree2', do: 'shake', amount: 1, dur: 0.3 },
    // 退後、助跑、再衝一次
    { at: 3.5, actor: 'dog', do: 'moveTo', to: { x: 42, y: 69.9 }, dur: 0.35 },
    { at: 3.9, actor: 'dog', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 4.15, actor: 'dog', do: 'moveTo', to: { x: 81, y: 69.9 }, dur: 0.22 },
    { at: 4.37, actor: 'dog', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 4.37, actor: 'tree1', do: 'shake', amount: 2, dur: 0.35 },
    { at: 4.37, actor: 'tree2', do: 'shake', amount: 2, dur: 0.35 },
    // 樹被撐飛，狗「啵」地彈出去
    { at: 4.75, actor: 'tree1', do: 'moveTo', to: { x: 40, y: -20 }, dur: 0.5 },
    { at: 4.75, actor: 'tree1', do: 'spin', dur: 0.5 },
    { at: 4.75, actor: 'tree2', do: 'moveTo', to: { x: 130, y: -20 }, dur: 0.5 },
    { at: 4.75, actor: 'tree2', do: 'spin', dur: 0.5 },
    { at: 5.0, actor: 'tree1', do: 'vanish', dur: 0.2 },
    { at: 5.2, actor: 'tree2', do: 'vanish', dur: 0.2 },
    { at: 4.75, actor: 'dog', do: 'moveTo', to: { x: 142, y: 69.9 }, arc: 22, dur: 0.6 },
    { at: 4.75, actor: 'dog', do: 'spin', dur: 0.6 },
    { at: 5.35, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 貓咪：我瘦巴巴
    { at: 7.0, actor: 'cat', do: 'squash', amount: -0.45, dur: 0.6 },
    { at: 7.0, actor: 'cat', do: 'flash', dur: 0.6 },
    // 狗狗憋氣裝瘦……一放氣更胖
    { at: 8.0, actor: 'dog', do: 'scaleTo', amount: 0.75, dur: 0.4 },
    { at: 8.4, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 8.9, actor: 'dog', do: 'scaleTo', amount: 1.7, dur: 0.3 },
    { at: 9.0, actor: 'cat', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
  ],
  builds: [
    // 飛走的樹 → 疒；另一棵樹 → 叟
    { at: 4.75, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'tree1', color: '#2F7D4F' },
    { at: 5.1, dur: 0.9, strokes: [5, 6, 7, 8, 9, 10, 11, 12, 13], from: 'tree2', color: '#9C5B2E' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'cat', emoji: '🐟', dur: 0.6 },
    { at: 0.9, kind: 'pop', actor: 'dog', emoji: '🤤', dur: 0.5 },
    { at: 2.3, kind: 'pop', actor: 'cat', emoji: '😋', dur: 0.5 },
    { at: 3.2, kind: 'sweat', actor: 'dog' },
    { at: 3.3, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.5 },
    { at: 4.37, kind: 'burst', actor: 'dog' },
    { at: 5.35, kind: 'puff', actor: 'dog' },
    { at: 5.4, kind: 'dizzy', actor: 'dog', dur: 1.0 },
    { at: 7.3, kind: 'pop', actor: 'dog', emoji: '😑', dur: 0.5 },
    { at: 8.0, kind: 'bubble', actor: 'dog', emoji: '😤', dur: 0.8 },
    { at: 8.9, kind: 'burst', actor: 'dog', emoji: '💨', n: 6, dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'cat', emoji: '😹', dur: 0.8 },
  ],
  camera: [
    { at: 4.37, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 82, y: 62 } },
    { at: 4.4, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.45, sfx: 'slide' },
    { at: 1.55, say: '瘦' },
    { at: 2.2, sfx: 'gulp' },
    { at: 3.0, sfx: 'boing' },
    { at: 4.15, sfx: 'whoosh' },
    { at: 4.37, sfx: 'bonk' },
    { at: 4.75, sfx: 'poof' },
    { at: 6.05, say: '瘦' },
    { at: 7.1, say: '瘦巴巴' },
    { at: 8.9, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
