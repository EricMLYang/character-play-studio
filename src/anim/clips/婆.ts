import type { Clip } from '../clip'

// 婆：橡膠恐龍聞到門裡飄出饅頭香，想敲門，手太短差一大截；用頭去頂，又往後翻倒彈起來。最後退到最左邊整隻衝過去——咚！壓成一張餅。
// 震下來的水滴、門板和門框排成「婆」，外婆開門探頭，把熱饅頭拋到牠鼻子上；牠想拿，手又太短搆不到自己的鼻子。婆、婆、外婆
const clip: Clip = {
  char: '婆',
  meta: { theme: '恐龍去外婆家', cast: '橡膠恐龍＋外婆＋門＋饅頭', gags: ['手太短敲不到門', '衝過去撞門壓成餅', '手短拿不到鼻子上的饅頭'] },
  duration: 10,
  bg: { top: '#E6F4EA', bottom: '#F4FBF6', floor: '#C9B79C', scenery: 'forest' },
  actors: [
    { id: 'door', emoji: '🚪', x: 142, y: 65, size: 22 },
    { id: 'granny', emoji: '👵', x: 142, y: 66, size: 13, hidden: true },
    { id: 'bun', emoji: '🥟', x: 136, y: 66, size: 6, hidden: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 22, y: 71.1, size: 14, flip: true },
  ],
  moves: [
    // 聞到香味，跑去敲門
    { at: 0.3, actor: 'dino', do: 'hop', amount: 2, dur: 0.3 },
    { at: 0.8, actor: 'dino', do: 'moveTo', to: { x: 120, y: 71.1 }, dur: 0.5, ease: 'out' },
    { at: 1.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 1.35, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.4 },
    // 踮腳再敲一次，還是差一截
    { at: 1.85, actor: 'dino', do: 'squash', amount: -0.25, dur: 0.4 },
    { at: 1.85, actor: 'dino', do: 'hop', amount: 2, dur: 0.4 },
    { at: 2.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    // 用頭頂，頂過頭往後翻，像皮球彈起來
    { at: 2.6, actor: 'dino', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 2.9, actor: 'dino', do: 'rotateTo', amount: -70, dur: 0.25 },
    { at: 2.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 3.15, actor: 'dino', do: 'rotateTo', amount: 70, dur: 0.3, ease: 'back' },
    { at: 3.15, actor: 'dino', do: 'hop', amount: 5, dur: 0.3 },
    // 退到最左邊，蓄力
    { at: 3.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 3.6, actor: 'dino', do: 'moveTo', to: { x: 22, y: 71.1 }, dur: 0.5 },
    { at: 4.15, actor: 'dino', do: 'squash', amount: -0.35, dur: 0.45 },
    { at: 4.15, actor: 'dino', do: 'shake', amount: 1, dur: 0.45 },
    // 衝！咚——壓成一張餅
    { at: 4.6, actor: 'dino', do: 'moveTo', to: { x: 125, y: 71.1 }, dur: 0.4, anticipate: 5, ease: 'in' },
    { at: 5.0, actor: 'dino', do: 'squash', amount: -0.6, dur: 0.35 },
    { at: 5.0, actor: 'door', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 5.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    // 從門上彈開，滾回左下角
    { at: 5.35, actor: 'dino', do: 'moveTo', to: { x: 26, y: 71.1 }, dur: 0.5, arc: 10, ease: 'out' },
    { at: 5.85, actor: 'dino', do: 'squash', amount: 0.4, dur: 0.3 },
    // 外婆開門
    { at: 7.5, actor: 'granny', do: 'pop' },
    { at: 7.5, actor: 'bun', do: 'pop' },
    { at: 7.55, actor: 'door', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 7.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    // 饅頭拋到恐龍鼻子上
    { at: 7.95, actor: 'bun', do: 'moveTo', to: { x: 21, y: 63 }, dur: 0.6, arc: 30 },
    { at: 7.95, actor: 'bun', do: 'spin', times: 2, dur: 0.6 },
    { at: 8.55, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 8.55, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 8.55, actor: 'bun', do: 'hop', amount: -1, dur: 0.2 },
    // 想拿，手太短搆不到
    { at: 8.85, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 8.85, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 8.85, actor: 'bun', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 9.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 9.3, actor: 'granny', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 屋簷水滴 → 氵；門板 → 皮；門框和門墊 → 女
    { at: 5.05, dur: 0.45, strokes: [0, 1, 2], from: { x: 136, y: 50 }, style: 'drop', color: '#C2255C' },
    { at: 5.45, dur: 0.7, strokes: [3, 4, 5, 6, 7], from: 'door', color: '#C2255C' },
    { at: 6.1, dur: 0.5, strokes: [8, 9, 10], from: 'door', color: '#A61E4D' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'door', emoji: '♨️', dx: -8, dy: 10, dur: 1.4 },
    { at: 0.3, kind: 'bubble', actor: 'dino', emoji: '🥟', dur: 0.7 },
    { at: 1.4, kind: 'pop', actor: 'dino', emoji: '❓', dur: 0.4 },
    { at: 2.25, kind: 'sweat', actor: 'dino' },
    { at: 2.9, kind: 'pop', actor: 'dino', emoji: '💫', dur: 0.4 },
    { at: 3.65, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 4.15, kind: 'puff', actor: 'dino', dur: 0.45 },
    { at: 5.0, kind: 'burst', actor: 'dino', dx: 6 },
    { at: 5.9, kind: 'dizzy', actor: 'dino', dur: 1.4 },
    { at: 7.5, kind: 'zzz', actor: 'bun', emoji: '♨️', dur: 1.0 },
    { at: 7.65, kind: 'pop', actor: 'granny', emoji: '😊', dur: 0.6 },
    { at: 8.55, kind: 'pop', actor: 'dino', emoji: '❤️', dur: 0.4 },
    { at: 8.95, kind: 'sweat', actor: 'dino' },
    { at: 9.3, kind: 'pop', actor: 'granny', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 4.1, dur: 0.45, do: 'zoom', amount: 1.3, actor: 'dino' },
    { at: 4.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.0, dur: 0.35, do: 'shake', amount: 1.3 },
  ],
  cues: [
    { at: 0.3, sfx: 'bubble' },
    { at: 1.3, say: '婆' },
    { at: 1.9, sfx: 'tap' },
    { at: 2.9, sfx: 'slide' },
    { at: 3.15, sfx: 'boing' },
    { at: 4.15, sfx: 'rumble' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 5.0, sfx: 'bonk' },
    { at: 6.7, say: '婆' },
    { at: 7.55, say: '外婆' },
    { at: 8.55, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
