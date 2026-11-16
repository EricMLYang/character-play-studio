import type { Clip } from '../clip'

// 乖：太空人玩偶想衝去坐好在右邊的紅沙發上。第一次跑三步就飄起來，在空中原地踩空；拉著靴子把自己拽下來，再更用力衝——
// 半路又飄高，「碰」一聲臉貼在綠色發射塔上。塔上的綠色桿子被震下來排成「乖」，他像貼紙一樣撕下來，暈暈地飄到沙發上，
// 坐得直挺挺一動也不動。最後屁股又飄起來，趕快抓住沙發把自己拉回去。乖、乖、乖乖
const clip: Clip = {
  char: '乖',
  meta: { theme: '太空站坐好', cast: '太空人玩偶＋綠色發射塔＋紅沙發', gags: ['一跑就飄起來踩空', '臉貼發射塔變貼紙', '坐好又飄起來'] },
  duration: 10,
  bg: { top: '#1E2A5A', bottom: '#46518C', floor: '#C9C3E6', scenery: 'space' },
  actors: [
    { id: 'tower', emoji: '🗼', x: 96, y: 64, size: 30, tint: 'hue-rotate(110deg) saturate(1.3)' },
    { id: 'sofa', emoji: '🛋️', x: 142, y: 71, size: 15, tint: 'sepia(1) saturate(5) hue-rotate(-30deg)' },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 18, y: 71, size: 13, flip: true },
  ],
  moves: [
    // 指著沙發，跺腳，往後仰蓄力
    { at: 0.7, actor: 'astro', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 0.95, actor: 'astro', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 1.1, actor: 'astro', do: 'tilt', amount: -18, dur: 0.4 },
    // 第一次：跑三步就飄起來，在空中原地踩空
    { at: 1.5, actor: 'astro', do: 'moveTo', to: { x: 34, y: 71 }, dur: 0.35, ease: 'in' },
    { at: 1.85, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 1.85, actor: 'astro', do: 'moveTo', to: { x: 38, y: 54 }, dur: 0.4, ease: 'out' },
    { at: 2.2, actor: 'astro', do: 'shake', amount: 1.5, dur: 0.5 },
    // 抓住靴子把自己拽下來，吱一聲落地，再更用力蓄力
    { at: 2.7, actor: 'astro', do: 'moveTo', to: { x: 30, y: 71 }, dur: 0.3, ease: 'in' },
    { at: 3.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 3.0, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 3.25, actor: 'astro', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 3.25, actor: 'astro', do: 'tilt', amount: -25, dur: 0.4 },
    // 大衝刺——半路飄高，臉貼在發射塔上
    { at: 3.65, actor: 'astro', do: 'moveTo', to: { x: 86, y: 50 }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 3.85, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 4.05, actor: 'astro', do: 'scaleTo', amount: 0.7, dur: 0.1 },
    { at: 4.05, actor: 'astro', do: 'squash', amount: 0.5, dur: 0.4 },
    { at: 4.05, actor: 'tower', do: 'shake', amount: 2, dur: 0.5 },
    { at: 4.45, actor: 'tower', do: 'vanish', dur: 0.2 },
    // 像貼紙一樣撕下來，「啵」地鼓回原狀，暈暈地飄到沙發上
    { at: 4.6, actor: 'astro', do: 'scaleTo', amount: 1.43, dur: 0.25, ease: 'back' },
    { at: 4.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 4.85, actor: 'astro', do: 'moveTo', to: { x: 142, y: 61 }, dur: 1.2, arc: 6, ease: 'inOut' },
    { at: 6.05, actor: 'sofa', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 6.05, actor: 'astro', do: 'squash', amount: 0.2, dur: 0.25 },
    // 坐得直挺挺，一動也不動
    { at: 6.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/salute' },
    { at: 6.5, actor: 'astro', do: 'flash', dur: 0.5 },
    // 回馬槍：屁股又飄起來，抓住沙發把自己拉回去
    { at: 8.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 8.0, actor: 'astro', do: 'moveTo', to: { x: 142, y: 50 }, dur: 0.6, ease: 'out' },
    { at: 8.0, actor: 'sofa', do: 'tilt', amount: 6, dur: 0.6 },
    { at: 8.7, actor: 'astro', do: 'moveTo', to: { x: 142, y: 61 }, dur: 0.35, ease: 'bounce' },
    { at: 9.05, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 9.05, actor: 'sofa', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 9.4, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
  ],
  builds: [
    // 發射塔上震下來的綠色桿子直直掉下來：斜帽＋一橫＋中間一根長柱 → 左邊的小直線和兩短橫 → 右邊帶勾的一撇
    { at: 4.15, dur: 0.6, strokes: [0, 1, 2], from: { x: 80, y: 0 }, style: 'drop', color: '#2B8A3E' },
    { at: 4.65, dur: 0.55, strokes: [3, 4, 5], from: { x: 80, y: 0 }, style: 'drop', color: '#37B24D' },
    { at: 5.1, dur: 0.45, strokes: [6, 7], from: { x: 80, y: 0 }, style: 'drop', color: '#2B8A3E' },
  ],
  glyph: [{ at: 5.65, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'astro', emoji: '🛋️', dur: 0.9 },
    { at: 0.7, kind: 'puff', actor: 'astro', dur: 0.4 },
    { at: 2.0, kind: 'pop', actor: 'astro', emoji: '😲', dur: 0.5 },
    { at: 2.3, kind: 'sweat', actor: 'astro' },
    { at: 3.3, kind: 'pop', actor: 'astro', emoji: '😤', dur: 0.4 },
    { at: 3.7, kind: 'puff', actor: 'astro', dur: 0.5 },
    { at: 4.05, kind: 'burst', actor: 'tower', n: 1, dur: 0.4, dy: 14 },
    { at: 4.9, kind: 'dizzy', actor: 'astro', dur: 1.3 },
    { at: 6.55, kind: 'pop', actor: 'astro', emoji: '⭐', dur: 0.8 },
    { at: 8.1, kind: 'pop', actor: 'astro', emoji: '😳', dur: 0.5, dx: -12 },
    { at: 9.1, kind: 'pop', actor: 'astro', emoji: '😅', dur: 0.6, dx: -12 },
  ],
  camera: [
    { at: 3.25, dur: 0.4, do: 'zoom', amount: 1.15, to: { x: 40, y: 60 } },
    { at: 3.65, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.05, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 88, y: 50 } },
  ],
  cues: [
    { at: 0.7, sfx: 'tap' },
    { at: 0.95, sfx: 'tap' },
    { at: 1.2, say: '乖' },
    { at: 1.9, sfx: 'whoosh' },
    { at: 3.0, sfx: 'blip' },
    { at: 3.7, sfx: 'whoosh' },
    { at: 4.05, sfx: 'bonk' },
    { at: 4.6, sfx: 'poof' },
    { at: 5.7, say: '乖' },
    { at: 6.05, sfx: 'plop' },
    { at: 6.55, say: '乖乖' },
    { at: 8.0, sfx: 'whoosh' },
    { at: 9.05, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
