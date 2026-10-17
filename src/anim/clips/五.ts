import type { Clip } from '../clip'

// 五：小布忍者躲在泡棉長條後面，頭和腳都露在外面。煙霧彈不小心在自己腳下炸開，把披風英雄的披風吹成巨人；英雄衝過去，披風蓋住臉跑歪了，
// 踮著腳搖搖晃晃——忍者只用一根手指輕輕一戳，英雄像大樹一樣「咚」倒下，四根紅長條被震起來變成「五」。結尾忍者再戳一下肚子，被彈飛。五、五、五官
const clip: Clip = {
  char: '五',
  meta: { theme: '超級英雄對忍者', cast: '披風英雄＋布忍者＋紅色泡棉長條', gags: ['躲得超明顯', '披風蓋臉跑歪', '一戳就倒像大樹', '肚子彈飛回馬槍'] },
  duration: 10,
  bg: { top: '#FFE8D6', bottom: '#FFF6EC', floor: '#E9C9A8', scenery: 'city' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 132, y: 71.5, size: 13 },
    { id: 'bars', emoji: '🧱', x: 125, y: 72.8, size: 10 },
    { id: 'hero', emoji: 'hero:cape/idle', x: 24, y: 71, size: 14, flip: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'hero', do: 'enter', from: { x: -15, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    // 忍者眨眨眼：我隱形了
    { at: 0.6, actor: 'ninja', do: 'bounce', amount: 1, times: 2, dur: 0.4 },
    // 煙霧彈在自己腳下炸開，粉紅煙把披風吹成巨人
    { at: 1.0, actor: 'ninja', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.15, actor: 'hero', do: 'scaleTo', amount: 1.7, dur: 0.45, ease: 'elastic' },
    { at: 1.5, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.3 },
    // 衝鋒！小碎步咚咚咚
    { at: 1.85, actor: 'hero', do: 'moveTo', to: { x: 140, y: 71 }, dur: 0.95, anticipate: 3, ease: 'in' },
    { at: 1.95, actor: 'ninja', do: 'moveTo', to: { x: 150, y: 71.5 }, dur: 0.25, ease: 'out' },
    { at: 1.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    // 披風翻過來蓋住臉，洩氣變回原來大小，跑歪
    { at: 2.25, actor: 'hero', do: 'scaleTo', amount: 0.588, dur: 0.3 },
    { at: 2.25, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 2.35, actor: 'hero', do: 'tilt', amount: 12, dur: 0.4 },
    // 踮腳搖搖晃晃，停格
    { at: 2.9, actor: 'hero', do: 'tilt', amount: -14, dur: 0.35 },
    { at: 3.25, actor: 'hero', do: 'tilt', amount: 16, dur: 0.35 },
    // 一根手指輕輕一戳
    { at: 3.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 3.5, actor: 'ninja', do: 'moveTo', to: { x: 146, y: 71.5 }, dur: 0.12 },
    { at: 3.62, actor: 'ninja', do: 'moveTo', to: { x: 150, y: 71.5 }, dur: 0.2 },
    // 像大樹一樣直挺挺倒下
    { at: 3.65, actor: 'hero', do: 'rotateTo', amount: -90, dur: 0.35, ease: 'in' },
    { at: 3.65, actor: 'hero', do: 'moveTo', to: { x: 140, y: 66 }, dur: 0.35, ease: 'in' },
    { at: 4.0, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 4.0, actor: 'bars', do: 'hop', amount: 8, dur: 0.3 },
    { at: 4.05, actor: 'bars', do: 'vanish', dur: 0.2 },
    // 忍者跳上英雄肚子，勝利姿勢
    { at: 4.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 4.9, actor: 'ninja', do: 'moveTo', to: { x: 141, y: 59 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 5.4, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 7.3, actor: 'ninja', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    // 回馬槍：忍者再戳一下肚子——肚子太彈，忍者被彈飛
    { at: 8.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 8.35, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.45, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 8.45, actor: 'ninja', do: 'moveTo', to: { x: 152, y: 71.5 }, arc: 18, dur: 0.6, ease: 'bounce' },
    { at: 8.45, actor: 'ninja', do: 'spin', times: 1, dur: 0.5 },
    { at: 9.1, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
  ],
  builds: [
    // 四根長條被震飛，翻一圈站成五的四劃
    { at: 4.1, dur: 0.25, strokes: [0], from: 'bars', color: '#E03131' },
    { at: 4.3, dur: 0.25, strokes: [1], from: 'bars', color: '#E03131' },
    { at: 4.5, dur: 0.25, strokes: [2], from: 'bars', color: '#E03131' },
    { at: 4.7, dur: 0.3, strokes: [3], from: 'bars', color: '#E03131' },
  ],
  glyph: [{ at: 5.0, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'hero', emoji: '❗', dur: 0.4 },
    { at: 0.7, kind: 'pop', actor: 'ninja', emoji: '😌', dur: 0.4 },
    { at: 1.0, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.6 },
    { at: 1.05, kind: 'puff', actor: 'hero', dur: 0.6 },
    { at: 1.85, kind: 'puff', actor: 'hero', dur: 0.5 },
    { at: 2.3, kind: 'pop', actor: 'hero', emoji: '❓', dur: 0.5 },
    { at: 2.95, kind: 'sweat', actor: 'hero' },
    { at: 3.5, kind: 'pop', actor: 'ninja', emoji: '👉', dur: 0.3 },
    { at: 4.0, kind: 'burst', actor: 'hero', n: 1, dur: 0.4, dx: 6 },
    { at: 4.0, kind: 'puff', actor: 'hero', dur: 0.5 },
    // 五官一個一個搞笑起來
    { at: 6.1, kind: 'pop', x: 147, y: 52, emoji: '👀', dur: 0.5 },
    { at: 6.45, kind: 'pop', x: 151, y: 54, emoji: '👃', dur: 0.4 },
    { at: 6.75, kind: 'pop', x: 145, y: 55, emoji: '👂', dur: 0.4 },
    { at: 7.05, kind: 'pop', x: 149, y: 56, emoji: '👄', dur: 0.4 },
    { at: 5.4, kind: 'dizzy', actor: 'hero', dur: 1.2, dx: 6, dy: 4 },
    { at: 7.6, kind: 'pop', x: 132, y: 58, emoji: '👍', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'ninja', emoji: '😵', dur: 0.5, dx: -7 },
  ],
  camera: [
    { at: 1.85, dur: 0.3, do: 'follow', actor: 'hero', amount: 1.3 },
    { at: 2.85, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 136, y: 60 } },
    { at: 3.75, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.0, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.0, sfx: 'poof' },
    { at: 1.15, sfx: 'boing' },
    { at: 1.55, say: '五' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 2.25, sfx: 'deflate' },
    { at: 3.5, sfx: 'tap' },
    { at: 4.0, sfx: 'bonk' },
    { at: 5.05, say: '五' },
    { at: 6.1, say: '五官' },
    { at: 8.35, sfx: 'boing' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
