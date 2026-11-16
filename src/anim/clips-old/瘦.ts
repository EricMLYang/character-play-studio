import type { Clip } from '../clip'

// 瘦：賽車和太空人玩偶各拿一根細長的泡棉棒來比劍。賽車衝過頭直接衝到右邊、太空人一揮就飄起來轉到左邊——兩個換了位置；
// 轉回來「咚」鼻子撞頭盔，兩根細棒飛上天，掉下來疊成「瘦」。最後賽車把自己吸得瘦瘦的，一溜煙從太空人腳下鑽過去。瘦、瘦、瘦瘦
const clip: Clip = {
  char: '瘦',
  meta: { theme: '泡棉棒比劍', cast: '賽車＋太空人玩偶＋兩根細泡棉棒', gags: ['衝過頭揮空', '飄起來揮空兩個換位置', '撞頭', '吸成瘦瘦鑽過腳下'] },
  duration: 10,
  bg: { top: '#FFF4C7', bottom: '#FFFBEA', floor: '#F2D98A', scenery: 'track' },
  actors: [
    { id: 'n1', emoji: '🥢', x: 44, y: 58, size: 9, float: true, hidden: true },
    { id: 'n2', emoji: '🥢', x: 118, y: 60, size: 9, float: true, hidden: true },
    { id: 'car', emoji: 'hero:car/idle', x: 32, y: 69, size: 19, flip: true, hidden: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 128, y: 71, size: 14, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'car', do: 'enter', from: { x: -20, y: 69 }, dur: 0.5, ease: 'back' },
    { at: 0, actor: 'n1', do: 'enter', from: { x: -8, y: 58 }, dur: 0.5, ease: 'back' },
    { at: 0.1, actor: 'astro', do: 'enter', from: { x: 175, y: 71 }, arc: 8, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'n2', do: 'enter', from: { x: 165, y: 60 }, arc: 8, dur: 0.6, ease: 'out' },
    // 舉劍對峙：細細長長
    { at: 0.8, actor: 'n1', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.8, actor: 'n2', do: 'hop', amount: 4, dur: 0.3 },
    // 賽車往後拉發條，太空人踮腳跳
    { at: 1.0, actor: 'car', do: 'moveTo', to: { x: 22, y: 69 }, dur: 0.5, ease: 'out' },
    { at: 1.0, actor: 'n1', do: 'moveTo', to: { x: 34, y: 58 }, dur: 0.5, ease: 'out' },
    { at: 1.0, actor: 'astro', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 1.5, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    // 賽車衝出去，衝過頭一路到右邊
    { at: 1.7, actor: 'car', do: 'moveTo', to: { x: 148, y: 69 }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 1.7, actor: 'n1', do: 'moveTo', to: { x: 160, y: 58 }, dur: 0.45, anticipate: 3, ease: 'in' },
    // 太空人用力一揮，結果飄起來揮空
    { at: 1.8, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 1.8, actor: 'n2', do: 'rotateTo', amount: -120, dur: 0.25 },
    { at: 1.85, actor: 'astro', do: 'moveTo', to: { x: 128, y: 56 }, dur: 0.4, ease: 'out' },
    { at: 1.85, actor: 'n2', do: 'moveTo', to: { x: 118, y: 45 }, dur: 0.4, ease: 'out' },
    // 兩個都轉得像陀螺；太空人一路轉到左邊
    { at: 2.3, actor: 'car', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.3, actor: 'n1', do: 'moveTo', to: { x: 140, y: 56 }, dur: 0.3 },
    { at: 2.3, actor: 'astro', do: 'spin', times: 3, dur: 0.8 },
    { at: 2.3, actor: 'astro', do: 'moveTo', to: { x: 40, y: 71 }, arc: 6, dur: 0.8 },
    { at: 2.3, actor: 'n2', do: 'moveTo', to: { x: 52, y: 60 }, arc: 6, dur: 0.8 },
    { at: 2.3, actor: 'n2', do: 'rotateTo', amount: 120, dur: 0.8 },
    { at: 3.1, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 3.1, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    // 換邊了！轉回來衝向中間
    { at: 3.3, actor: 'car', do: 'flip' },
    { at: 3.3, actor: 'astro', do: 'flip' },
    { at: 3.4, actor: 'car', do: 'moveTo', to: { x: 92, y: 69 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'n1', do: 'moveTo', to: { x: 82, y: 56 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'astro', do: 'moveTo', to: { x: 70, y: 71 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'n2', do: 'moveTo', to: { x: 80, y: 60 }, dur: 0.35, ease: 'in' },
    // 咚！
    { at: 4.0, actor: 'car', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.0, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.05, actor: 'n1', do: 'moveTo', to: { x: 70, y: 16 }, dur: 0.35, ease: 'out' },
    { at: 4.05, actor: 'n2', do: 'moveTo', to: { x: 92, y: 14 }, dur: 0.35, ease: 'out' },
    { at: 4.05, actor: 'n1', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.05, actor: 'n2', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.1, actor: 'car', do: 'moveTo', to: { x: 136, y: 69 }, dur: 0.4, ease: 'out' },
    { at: 4.1, actor: 'astro', do: 'moveTo', to: { x: 32, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 4.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 4.5, actor: 'n1', do: 'vanish', dur: 0.15 },
    { at: 4.9, actor: 'n2', do: 'vanish', dur: 0.15 },
    { at: 6.0, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 6.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    // 吸氣變瘦瘦，一溜煙從太空人腳下鑽過去
    { at: 6.8, actor: 'car', do: 'squash', amount: -0.6, dur: 1.3 },
    { at: 7.05, actor: 'car', do: 'moveTo', to: { x: 14, y: 69 }, dur: 0.35, ease: 'in' },
    { at: 7.4, actor: 'astro', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.1, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    // 回馬槍：太空人一拍手，又飄起來撞到空氣
    { at: 8.3, actor: 'astro', do: 'bounce', amount: 1, times: 2, dur: 0.3 },
    { at: 8.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 8.5, actor: 'astro', do: 'moveTo', to: { x: 32, y: 60 }, dur: 0.5, ease: 'out' },
    { at: 9.0, actor: 'astro', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 9.2, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
  ],
  builds: [
    // 細棒掉下來：疒先折好，叟塞進去，又最後咚咚落地
    { at: 4.5, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'n1', style: 'drop', color: '#C92A2A' },
    { at: 4.95, dur: 0.6, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'n2', style: 'drop', color: '#E03131' },
    { at: 5.5, dur: 0.3, strokes: [12, 13], from: 'n2', style: 'drop', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 1.2, kind: 'pop', actor: 'car', emoji: '😠', dur: 0.4 },
    { at: 2.0, kind: 'pop', actor: 'astro', emoji: '❓', dur: 0.4 },
    { at: 3.15, kind: 'pop', actor: 'car', emoji: '❗', dur: 0.4, dx: -4 },
    { at: 3.15, kind: 'pop', actor: 'astro', emoji: '❗', dur: 0.4 },
    { at: 4.0, kind: 'burst', actor: 'car', n: 1, dur: 0.4, dx: -10 },
    { at: 4.5, kind: 'dizzy', actor: 'car', dur: 1.3 },
    { at: 4.5, kind: 'dizzy', actor: 'astro', dur: 1.3 },
    { at: 7.1, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 7.5, kind: 'pop', actor: 'astro', emoji: '👏', dur: 0.5 },
    { at: 8.1, kind: 'pop', actor: 'car', emoji: '😆', dur: 0.5, dx: 4 },
    { at: 9.05, kind: 'pop', actor: 'astro', emoji: '💫', dur: 0.4 },
  ],
  camera: [
    { at: 1.7, dur: 0.3, do: 'follow', actor: 'car', amount: 1.3 },
    { at: 2.25, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.75, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 81, y: 62 } },
  ],
  cues: [
    { at: 1.0, sfx: 'slide' },
    { at: 1.1, say: '瘦' },
    { at: 1.7, sfx: 'whoosh' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 3.4, sfx: 'whoosh' },
    { at: 4.0, sfx: 'boing' },
    { at: 5.85, say: '瘦' },
    { at: 6.8, sfx: 'deflate' },
    { at: 6.9, say: '瘦瘦' },
    { at: 7.05, sfx: 'whoosh' },
    { at: 8.1, sfx: 'boing' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
