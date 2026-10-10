import type { Clip } from '../clip'

// 九：小老鼠在冰淇淋店點了「九球」！店員一球一球往上疊：一、二、三……越疊越高，比小老鼠還高好多，搖搖晃晃。
// 疊到第九球，整座塔歪下來——小老鼠張大嘴巴，九球全部掉進嘴裡！肚子變得圓滾滾，甜筒和冰淇淋變成「九」。九、九、九個
const clip: Clip = {
  char: '九',
  meta: { theme: '冰淇淋店', cast: '小老鼠＋九球冰淇淋', gags: ['越疊越高', '搖搖晃晃', '全部掉進嘴裡'] },
  duration: 10,
  bg: { top: '#FFE6F0', bottom: '#FFF7FA', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'mouse', emoji: '🐭', x: 30, y: 70.5, size: 16, hidden: true },
    { id: 'cone', emoji: '🍦', x: 124, y: 68, size: 14, hidden: true },
    ...Array.from({ length: 9 }, (_, i) => ({ id: `s${i}`, emoji: '🍨', x: 124, y: 60 - i * 5.4, size: 8, hidden: true, float: true })),
  ],
  moves: [
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -12, y: 70.5 }, dur: 0.6 },
    { at: 0.3, actor: 'cone', do: 'pop' },
    // 一球一球往上疊，越來越快
    ...Array.from({ length: 9 }, (_, i) => ({ at: 1.2 + i * 0.42 - i * i * 0.012, actor: `s${i}`, do: 'drop' as const, dur: 0.4 })),
    // 搖搖晃晃
    ...Array.from({ length: 9 }, (_, i) => ({ at: 4.7, actor: `s${i}`, do: 'shake' as const, amount: 0.3 + i * 0.25, dur: 0.6 })),
    // 整座塔歪下來——小老鼠張大嘴巴
    { at: 5.2, actor: 'mouse', do: 'moveTo', to: { x: 76, y: 70.5 }, dur: 0.4 },
    { at: 5.4, actor: 'mouse', do: 'squash', amount: -0.3, dur: 0.5 },
    ...Array.from({ length: 9 }, (_, i) => ({ at: 5.4 + i * 0.05, actor: `s${i}`, do: 'moveTo' as const, to: { x: 78, y: 66 }, dur: 0.35, arc: 10 })),
    ...Array.from({ length: 9 }, (_, i) => ({ at: 5.75 + i * 0.05, actor: `s${i}`, do: 'vanish' as const, dur: 0.1 })),
    { at: 6.3, actor: 'mouse', do: 'scaleTo', amount: 1.6, dur: 0.3 },
    { at: 6.6, actor: 'mouse', do: 'moveTo', to: { x: 30, y: 67 }, dur: 0.5 },
    { at: 8.8, actor: 'mouse', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 甜筒 → 乀；冰淇淋 → 丿
    { at: 6.35, dur: 0.4, strokes: [0], from: 'cone', color: '#D9893B' },
    { at: 6.65, dur: 0.4, strokes: [1], from: 'mouse', color: '#F06292' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'mouse', emoji: '🍨', dur: 0.6 },
    { at: 4.2, kind: 'pop', actor: 'mouse', emoji: '😮', dur: 0.6 },
    { at: 5.4, kind: 'pop', actor: 'mouse', emoji: '😋', dur: 0.4 },
    { at: 6.3, kind: 'burst', actor: 'mouse', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 4.0, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 120, y: 44 } },
  ],
  cues: [
    { at: 0.9, say: '九' },
    ...Array.from({ length: 9 }, (_, i) => ({ at: 1.55 + i * 0.42 - i * i * 0.012, sfx: 'plop' as const })),
    { at: 5.4, sfx: 'whoosh' },
    { at: 6.0, sfx: 'gulp' },
    { at: 6.3, sfx: 'boing' },
    { at: 7.2, say: '九' },
    { at: 8.2, say: '九個' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
