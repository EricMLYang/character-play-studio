import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 楊（重做）：楊捷睿提著水桶來澆一棵小樹苗，想讓它長成大樹。澆一點點——只長一點點；整桶倒下去——樹苗「轟」地長成超級大樹，把他頂上樹頂、水桶飛上天。
// 樹葉落成「木」、被樹頂撞到的太陽變成「日」、樹枝拼成右下，大樹縮回樹苗，他從半空掉下來。國字讓到上方，他輕輕親一下樹苗，長成一棵剛剛好的楊樹（楊樹）。
// 回馬槍：水桶從天上掉下來扣在他頭上、淋得一身濕——他頭上也長出一棵樹，頂著樹走掉。楊、楊、楊樹
const B = 67.8 // 楊捷睿（size 22）站在地上的 y
const T = 73.6 // 樹苗（size 8）站在地上的 y
const BK = -1 // 水桶提在手上（相對他的 y）
const BX = 10 // 水桶在他右手邊（相對他的 x）

// 楊捷睿的移動抄一份給手上／頭上的東西（dx、dy 是相對他的位置）
const follow = (ms: Move[], ids: [string, number, number][]): Move[] => ms.flatMap((m) => [
  m,
  ...ids.map(([actor, dx, dy]) => ({
    ...m, actor,
    to: m.to && { x: m.to.x + dx, y: m.to.y + dy },
    from: m.from && { x: m.from.x + dx, y: m.from.y + dy },
  })),
])

const clip: Clip = {
  char: '楊',
  meta: { theme: '澆樹苗澆過頭', cast: '楊捷睿＋小樹苗（楊樹）＋水桶＋太陽＋小松鼠', gags: ['澆一點只長一點點', '整桶倒下去樹爆長頂上天', '大樹縮回樹苗掉下來', '輕輕一親就長好', '水桶扣頭上頭頂長出樹'] },
  duration: 10,
  bg: { top: '#A8DCFF', bottom: '#EAF7FF', floor: '#A7DB7F', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 132, y: 19, size: 13, float: true },
    { id: 'chip', emoji: '🐿️', x: 14, y: 72, size: 12 },
    { id: 'tree', emoji: '🌱', x: 128, y: T, size: 8 },
    { id: 'boy', emoji: 'hero:yang/idle', x: 2, y: B, size: 22 },
    { id: 'bucket', emoji: '🪣', x: 2 + BX, y: B + BK, size: 10, float: true },
    { id: 'htree', emoji: '🌱', x: 104, y: 47.5, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 提著水桶跑進來
    ...follow([
      { at: 0, actor: 'boy', do: 'moveTo', to: { x: 104, y: B }, dur: 0.85, ease: 'out' },
    ], [['bucket', BX, BK]]),
    // 看到小樹苗：要讓它長成大樹！
    { at: 0.95, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 0.95, actor: 'boy', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.95, actor: 'bucket', do: 'hop', amount: 4, dur: 0.3 },
    // 第一次：澆一點點
    { at: 1.4, actor: 'bucket', do: 'rotateTo', amount: 65, dur: 0.25 },
    { at: 1.95, actor: 'tree', do: 'scaleTo', amount: 1.3, dur: 0.25, ease: 'back' },
    { at: 2.1, actor: 'bucket', do: 'rotateTo', amount: -65, dur: 0.2 },
    { at: 2.2, actor: 'boy', do: 'swap', emoji: 'hero:yang/idle' },
    // 第二次：整桶舉高高——倒下去
    { at: 2.55, actor: 'boy', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 2.55, actor: 'bucket', do: 'moveTo', to: { x: 108, y: 47 }, dur: 0.3, ease: 'out' },
    { at: 2.95, actor: 'bucket', do: 'rotateTo', amount: 150, dur: 0.15 },
    { at: 2.95, actor: 'bucket', do: 'moveTo', to: { x: 116, y: 50 }, dur: 0.15 },
    { at: 2.95, actor: 'boy', do: 'squash', amount: 0.2, dur: 0.25 },
    // 沒反應……湊過去看
    { at: 3.3, actor: 'bucket', do: 'rotateTo', amount: -150, dur: 0.2 },
    { at: 3.3, actor: 'bucket', do: 'moveTo', to: { x: 108 + BX, y: B + BK }, dur: 0.2 },
    { at: 3.3, actor: 'boy', do: 'moveTo', to: { x: 108, y: B }, dur: 0.25 },
    { at: 3.35, actor: 'tree', do: 'shake', amount: 0.8, dur: 0.4 },
    // 轟！樹苗爆長成超級大樹，把他頂上樹頂、水桶飛上天、樹頂撞到太陽
    { at: 3.75, actor: 'tree', do: 'swap', emoji: '🌳' },
    { at: 3.75, actor: 'tree', do: 'scaleTo', amount: 5, dur: 0.3, ease: 'back' },
    { at: 3.75, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 3.75, actor: 'boy', do: 'moveTo', to: { x: 124, y: 36 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 3.75, actor: 'bucket', do: 'moveTo', to: { x: 104, y: -25 }, dur: 0.45, ease: 'out' },
    { at: 3.75, actor: 'bucket', do: 'spin', times: 2, dur: 0.45 },
    { at: 3.95, actor: 'sun', do: 'moveTo', to: { x: 146, y: 12 }, dur: 0.3, ease: 'out' },
    { at: 3.95, actor: 'sun', do: 'spin', times: 1, dur: 0.4 },
    // 卡在樹頂手腳亂揮
    { at: 4.15, actor: 'boy', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 4.1, actor: 'chip', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 樹葉被他搖下來 → 木；大樹一邊縮
    { at: 4.55, actor: 'tree', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.6, actor: 'tree', do: 'scaleTo', amount: 0.75, dur: 0.6 },
    { at: 4.6, actor: 'boy', do: 'moveTo', to: { x: 124, y: 44 }, dur: 0.6 },
    { at: 5.1, actor: 'sun', do: 'shake', amount: 1, dur: 0.4 },
    // 樹枝也飛走，大樹縮回樹苗，他懸在半空——掉下來
    { at: 5.5, actor: 'tree', do: 'scaleTo', amount: 0.27, dur: 0.4, ease: 'in' },
    { at: 5.9, actor: 'tree', do: 'swap', emoji: '🌱' },
    { at: 5.9, actor: 'boy', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: 5.95, actor: 'boy', do: 'moveTo', to: { x: 134, y: B }, dur: 0.25, ease: 'in' },
    // 爬起來，走到樹苗旁邊（國字已經讓位）
    { at: 6.9, actor: 'boy', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 6.9, actor: 'boy', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 7.0, actor: 'boy', do: 'flip' },
    { at: 7.05, actor: 'boy', do: 'moveTo', to: { x: 104, y: B }, dur: 0.4, ease: 'out' },
    { at: 7.45, actor: 'boy', do: 'flip' },
    // 輕輕親一下：長成剛剛好的楊樹
    { at: 7.5, actor: 'boy', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 7.7, actor: 'tree', do: 'swap', emoji: '🌳' },
    { at: 7.7, actor: 'tree', do: 'scaleTo', amount: 3.4, dur: 0.45, ease: 'elastic' },
    { at: 7.8, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 7.85, actor: 'boy', do: 'hop', amount: 8, dur: 0.4 },
    { at: 7.8, actor: 'chip', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：水桶從天上掉下來，扣在他頭上
    { at: 8.05, actor: 'bucket', do: 'moveTo', to: { x: 104, y: 55 }, dur: 0.4, ease: 'in' },
    { at: 8.05, actor: 'bucket', do: 'spin', times: -1, dur: 0.4 },
    { at: 8.45, actor: 'boy', do: 'squash', amount: 0.35, dur: 0.35 },
    ...pressStack(8.45, 0.35, 0.35, 22, ['bucket']),
    { at: 8.45, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    // 淋得一身濕——頭上長出一棵樹
    { at: 8.75, actor: 'htree', do: 'pop' },
    { at: 8.95, actor: 'htree', do: 'swap', emoji: '🌳' },
    { at: 8.95, actor: 'htree', do: 'scaleTo', amount: 2.8, dur: 0.35, ease: 'elastic' },
    { at: 8.95, actor: 'boy', do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.95, actor: 'bucket', do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.95, actor: 'htree', do: 'hop', amount: 3, dur: 0.25 },
    // 頂著頭上的樹走到左邊
    ...follow([
      { at: 9.1, actor: 'boy', do: 'moveTo', to: { x: 40, y: B }, dur: 0.45, ease: 'out' },
    ], [['bucket', 0, 55 - B], ['htree', 0, 47.5 - B]]),
    { at: 9.65, actor: 'chip', do: 'bounce', amount: 2, times: 2, dur: 0.35 },
    // 頭上的樹太重，整疊晃一晃
    ...['boy', 'bucket', 'htree'].map((actor) => ({ at: 9.6, actor, do: 'shake' as const, amount: 0.8, dur: 0.4 })),
  ],
  builds: [
    // 搖下來的樹葉 → 木；被樹頂撞到的太陽 → 日；樹枝 → 右下
    { at: 4.6, dur: 0.55, strokes: [0, 1, 2, 3], from: 'tree', color: '#2F9E44' },
    { at: 5.1, dur: 0.4, strokes: [4, 5, 6, 7], from: 'sun', color: '#FF9F1C' },
    { at: 5.5, dur: 0.45, strokes: [8, 9, 10, 11, 12], from: 'tree', color: '#A0522D' },
  ],
  glyph: [
    { at: 6.0, dur: 0.4, do: 'wobble' },
    { at: 6.8, dur: 0.45, do: 'park' },
    { at: 9.15, dur: 0.4, do: 'home' },
    { at: 9.6, dur: 0.4, do: 'pulse' },
  ],
  fx: [
    { at: 0.95, kind: 'bubble', actor: 'boy', emoji: '🌳', dur: 0.8 },
    { at: 1.5, kind: 'rain', actor: 'bucket', dx: 8, n: 4, dur: 0.5 },
    { at: 2.2, kind: 'pop', actor: 'boy', emoji: '😑', dur: 0.45 },
    { at: 2.6, kind: 'sweat', actor: 'boy' },
    { at: 3.0, kind: 'rain', actor: 'bucket', dx: 10, n: 10, dur: 0.45 },
    { at: 3.2, kind: 'burst', x: 128, y: 70, emoji: '💦', n: 5, dur: 0.4 },
    { at: 3.4, kind: 'bubble', actor: 'boy', emoji: '❓', dur: 0.35 },
    { at: 3.75, kind: 'burst', x: 128, y: 48, emoji: '🍃', n: 8, dur: 0.6 },
    { at: 3.95, kind: 'burst', x: 140, y: 18, n: 1, dur: 0.35 },
    { at: 4.15, kind: 'sweat', actor: 'boy' },
    { at: 4.2, kind: 'pop', actor: 'chip', emoji: '😆', dur: 0.6 },
    { at: 5.15, kind: 'dizzy', actor: 'sun', dur: 0.6 },
    { at: 6.2, kind: 'dizzy', actor: 'boy', dur: 0.65 },
    { at: 7.55, kind: 'pop', actor: 'boy', emoji: '💕', dx: 6, dy: 8, dur: 0.4 },
    { at: 7.75, kind: 'burst', x: 128, y: 50, emoji: '✨', n: 6, dur: 0.6 },
    { at: 7.9, kind: 'pop', actor: 'chip', emoji: '👏', dur: 0.45 },
    { at: 8.2, kind: 'pop', actor: 'boy', emoji: '❗', dx: 10, dur: 0.3 },
    { at: 8.45, kind: 'burst', actor: 'boy', emoji: '💦', n: 6, dur: 0.45 },
    { at: 8.5, kind: 'pop', actor: 'chip', emoji: '😆', dur: 0.5 },
    { at: 9.7, kind: 'pop', actor: 'chip', emoji: '🤣', dur: 0.3 },
  ],
  camera: [
    { at: 3.75, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 7.7, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 112, y: 50 } },
    { at: 8.45, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    { at: 3.75, dur: 0.04, level: -0.7 },
    { at: 3.79, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'slide' },
    { at: 1.0, say: '楊' },
    { at: 1.5, sfx: 'splash' },
    { at: 1.95, sfx: 'blip' },
    { at: 3.0, sfx: 'splash' },
    { at: 3.35, sfx: 'rumble' },
    { at: 3.75, sfx: 'boing' },
    { at: 3.95, sfx: 'bonk' },
    { at: 5.95, sfx: 'whoosh' },
    { at: 6.05, say: '楊' },
    { at: 6.2, sfx: 'plop' },
    { at: 7.7, say: '楊樹' },
    { at: 8.05, sfx: 'whoosh' },
    { at: 8.45, sfx: 'bonk' },
    { at: 8.5, sfx: 'splash' },
    { at: 8.95, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
