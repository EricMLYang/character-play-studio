import type { Clip } from '../clip'

// 穿：玩具戰士瞄準地上一堆紫色積木揮劍——揮太用力，完全沒砍到，自己轉成陀螺彈出去：彈地板「喀」敲出寶蓋、
// 撞左牆「喀」敲出八、撞天花板卡住一拍，再頭下腳上砸進花生頭上那疊衣服，衣服噴上天變成「牙」，戰士暈暈地坐在「穿」字屋頂上。
// 唸「穿衣服」時一件紅衣服掉下來套住他，頭從領口鑽出來；最後花生敬禮敬太用力，頭上那件也飛過去又套他一次。穿、穿、穿衣服
const clip: Clip = {
  char: '穿',
  meta: { theme: '戰士彈跳球', cast: '玩具戰士＋浣熊花生＋一疊衣服', gags: ['揮劍揮過頭自己轉起來', '連環彈牆', '砸進衣服堆', '衣服套頭', '又被套一次'] },
  duration: 10,
  bg: { top: '#FFF3BF', bottom: '#FFF9DB', floor: '#FFD8A8', scenery: 'room' },
  actors: [
    { id: 'k1', emoji: '🟪', x: 76, y: 72, size: 7 },
    { id: 'k2', emoji: '🟪', x: 84, y: 72, size: 7 },
    { id: 'k3', emoji: '🟪', x: 80, y: 66.5, size: 7 },
    { id: 'pea', emoji: 'hero:raccoon/idle', x: 134, y: 71.1, size: 14, hidden: true },
    { id: 'sh1', emoji: '👕', x: 134, y: 61, size: 8, hidden: true },
    { id: 'sh2', emoji: '👕', x: 134, y: 56, size: 8, hidden: true },
    { id: 'sh3', emoji: '👕', x: 134, y: 51, size: 8, hidden: true },
    { id: 'hero', emoji: 'hero:warrior/idle', x: 24, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'red', emoji: '👕', x: 80, y: 10.5, size: 6, hidden: true, tint: 'hue-rotate(150deg) saturate(1.6)' },
  ],
  moves: [
    { at: 0, actor: 'hero', do: 'pop', dur: 0.35 },
    { at: 0.4, actor: 'hero', do: 'swap', emoji: 'hero:warrior/swing' },
    // 花生頂著一疊衣服走進來，對著空氣敬禮
    ...['pea', 'sh1', 'sh2', 'sh3'].map((actor) => ({ at: 0.2, actor, do: 'enter' as const, from: { x: 178, y: actor === 'pea' ? 71.1 : actor === 'sh1' ? 61 : actor === 'sh2' ? 56 : 51 }, dur: 0.7 })),
    { at: 1.0, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 1.6, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 劍往後拉，拉太遠
    { at: 0.9, actor: 'hero', do: 'squash', amount: -0.25, dur: 0.5 },
    { at: 0.9, actor: 'hero', do: 'rotateTo', amount: -20, dur: 0.4 },
    // 用盡全力一揮——沒砍到，自己轉兩圈彈出去
    { at: 1.6, actor: 'hero', do: 'rotateTo', amount: 20, dur: 0.1 },
    { at: 1.6, actor: 'hero', do: 'spin', times: 2, dur: 0.4 },
    { at: 2.0, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.12 },
    { at: 2.05, actor: 'hero', do: 'moveTo', to: { x: 8, y: 36 }, dur: 0.3, ease: 'linear' },
    { at: 2.35, actor: 'hero', do: 'moveTo', to: { x: 74, y: 10 }, dur: 0.35, ease: 'linear' },
    { at: 2.05, actor: 'hero', do: 'spin', times: 2, dur: 0.65 },
    // 卡在天花板一拍；花生抬頭
    { at: 2.7, actor: 'hero', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 2.7, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.9, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 3.25, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 頭下腳上砸進衣服堆
    { at: 3.3, actor: 'hero', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 3.35, actor: 'hero', do: 'moveTo', to: { x: 134, y: 36 }, dur: 0.35, ease: 'in' },
    { at: 3.7, actor: 'pea', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 3.7, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 3.7, actor: 'sh2', do: 'moveTo', to: { x: 116, y: 6 }, dur: 0.3, ease: 'out' },
    { at: 3.7, actor: 'sh3', do: 'moveTo', to: { x: 146, y: 4 }, dur: 0.3, ease: 'out' },
    { at: 3.7, actor: 'sh1', do: 'moveTo', to: { x: 134, y: 64.5 }, dur: 0.3, ease: 'bounce' },
    { at: 3.7, actor: 'k3', do: 'moveTo', to: { x: 90, y: 20 }, arc: 10, dur: 0.3 },
    { at: 2.05, actor: 'k1', do: 'vanish', dur: 0.15 },
    { at: 2.4, actor: 'k2', do: 'vanish', dur: 0.15 },
    { at: 3.9, actor: 'k3', do: 'vanish', dur: 0.15 },
    { at: 3.95, actor: 'sh2', do: 'vanish', dur: 0.15 },
    { at: 3.95, actor: 'sh3', do: 'vanish', dur: 0.15 },
    // 最後一彈：暈暈地坐在屋頂尖上，小得像裝飾品
    { at: 3.75, actor: 'hero', do: 'rotateTo', amount: -180, dur: 0.4 },
    { at: 3.75, actor: 'hero', do: 'moveTo', to: { x: 80, y: 11 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 3.75, actor: 'hero', do: 'scaleTo', amount: 0.6, dur: 0.6 },
    { at: 4.35, actor: 'hero', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 4.35, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.25 },
    // 「穿衣服」：紅衣服掉下來套住他，頭從領口鑽出來
    { at: 6.1, actor: 'red', do: 'drop', dur: 0.45 },
    { at: 6.6, actor: 'hero', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.6, actor: 'red', do: 'moveTo', to: { x: 80, y: 12.5 }, dur: 0.2 },
    { at: 6.55, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: 6.55, actor: 'red', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: 7.2, actor: 'hero', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 7.2, actor: 'hero', do: 'hop', amount: 2, dur: 0.3 },
    { at: 7.2, actor: 'red', do: 'hop', amount: 2, dur: 0.3 },
    // 花生慢半拍，這次敬對了時機
    { at: 7.8, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.8, actor: 'pea', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：敬禮太用力，頭上那件衣服也飛過去，又套他一次
    { at: 8.45, actor: 'sh1', do: 'moveTo', to: { x: 80, y: 9.5 }, arc: 16, dur: 0.55 },
    { at: 8.45, actor: 'sh1', do: 'spin', times: 1, dur: 0.55 },
    { at: 9.0, actor: 'hero', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 9.0, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.25 },
  ],
  builds: [
    // 彈地板 → 寶蓋；撞左牆 → 八；砸進衣服堆，噴上天的積木 → 牙
    { at: 2.0, dur: 0.4, strokes: [0, 1, 2], from: 'k1', color: '#7048E8' },
    { at: 2.35, dur: 0.35, strokes: [3, 4], from: 'k2', color: '#7048E8' },
    { at: 3.8, dur: 0.6, strokes: [5, 6, 7, 8], from: 'k3', color: '#7048E8' },
  ],
  glyph: [{ at: 4.45, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'hero', emoji: '😤', dur: 0.5 },
    { at: 2.0, kind: 'puff', actor: 'hero', dur: 0.4 },
    { at: 2.33, kind: 'burst', actor: 'hero', dur: 0.25 },
    { at: 2.7, kind: 'burst', actor: 'hero', dy: 4, dur: 0.3 },
    { at: 2.9, kind: 'pop', actor: 'pea', emoji: '❓', dur: 0.4 },
    { at: 3.7, kind: 'burst', actor: 'pea', emoji: '👕', n: 6, dur: 0.6 },
    { at: 4.4, kind: 'dizzy', actor: 'hero', dy: 2, dur: 1.4 },
    { at: 4.1, kind: 'dizzy', actor: 'pea', dur: 1.2 },
    { at: 9.05, kind: 'sweat', actor: 'hero', dx: 4 },
  ],
  camera: [
    // 撞天花板震一下，砸進衣服堆推近
    { at: 2.7, dur: 0.3, do: 'shake', amount: 1 },
    { at: 3.7, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 128, y: 55 } },
  ],
  cues: [
    { at: 1.2, say: '穿' },
    { at: 1.65, sfx: 'whoosh' },
    { at: 2.0, sfx: 'boing' },
    { at: 2.35, sfx: 'bonk' },
    { at: 2.7, sfx: 'bonk' },
    { at: 2.78, say: '穿' },
    { at: 3.7, sfx: 'bonk' },
    { at: 4.35, sfx: 'boing' },
    { at: 6.5, say: '穿衣服' },
    { at: 6.5, sfx: 'whoosh' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 9.0, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
