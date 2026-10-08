import type { Clip } from '../clip'

// 冰：沙漠好熱，刺蝟好想吃冰。冰淇淋車呼一聲開過去沒停，刺蝟追不上；車子倒車回來給了一支，太陽一曬馬上融化，滴成「冰」。
// 冰淇淋車又來了，刺蝟學乖了，一口整支吞下去——結果凍成冰臉，太陽在旁邊笑。冰、冰、冰淇淋
const clip: Clip = {
  char: '冰',
  meta: { theme: '冰淇淋車', cast: '刺蝟＋冰淇淋車＋太陽', gags: ['車子開過頭', '倒車回來', '馬上融化', '一口吞結果凍住'] },
  duration: 10,
  bg: { top: '#FFE6B0', bottom: '#FFCF86', floor: '#E8BC78', scenery: 'desert' },
  actors: [
    { id: 'sun', emoji: '🌞', x: 140, y: 16, size: 14, hidden: true, float: true },
    { id: 'hog', emoji: '🦔', x: 30, y: 72.8, size: 10, hidden: true, flip: true },
    { id: 'van', emoji: '🚐', x: 190, y: 68.6, size: 20 },
    { id: 'cone', emoji: '🍦', x: 56, y: 58, size: 7, hidden: true, float: true },
    { id: 'cone2', emoji: '🍦', x: 128, y: 58, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'pop' },
    { at: 0.2, actor: 'hog', do: 'enter', from: { x: -10, y: 72.8 }, dur: 0.6 },
    // 冰淇淋車開過去沒停
    { at: 1.3, actor: 'van', do: 'moveTo', to: { x: -30, y: 68.6 }, dur: 0.9 },
    { at: 1.75, actor: 'hog', do: 'spin', dur: 0.4 },
    { at: 2.4, actor: 'hog', do: 'flip' },
    { at: 2.4, actor: 'hog', do: 'moveTo', to: { x: 16, y: 72.8 }, dur: 0.3 },
    { at: 2.75, actor: 'hog', do: 'squash', amount: 0.4, dur: 0.35 },
    // 倒車回來
    { at: 3.1, actor: 'van', do: 'moveTo', to: { x: 62, y: 68.6 }, dur: 0.6 },
    { at: 3.4, actor: 'hog', do: 'flip' },
    { at: 3.8, actor: 'cone', do: 'pop', dur: 0.2 },
    { at: 3.9, actor: 'cone', do: 'moveTo', to: { x: 22, y: 64 }, dur: 0.35, arc: 6 },
    { at: 4.25, actor: 'hog', do: 'bounce', dur: 0.4, times: 2, amount: 2 },
    { at: 4.4, actor: 'van', do: 'flip' },
    { at: 4.4, actor: 'van', do: 'moveTo', to: { x: 200, y: 68.6 }, dur: 0.8 },
    // 太陽一曬：融化
    { at: 4.4, actor: 'sun', do: 'squash', amount: -0.25, dur: 0.4 },
    { at: 4.4, actor: 'sun', do: 'flash', dur: 0.8 },
    { at: 4.8, actor: 'cone', do: 'scaleTo', amount: 0.75, dur: 0.5 },
    { at: 4.8, actor: 'cone', do: 'shake', dur: 0.5, amount: 0.6 },
    { at: 5.6, actor: 'cone', do: 'vanish', dur: 0.3 },
    // 又來了
    { at: 6.9, actor: 'van', do: 'flip' },
    { at: 7.0, actor: 'van', do: 'moveTo', to: { x: 138, y: 68.6 }, dur: 0.5 },
    { at: 7.5, actor: 'cone2', do: 'pop', dur: 0.15 },
    { at: 7.6, actor: 'cone2', do: 'moveTo', to: { x: 22, y: 64 }, dur: 0.6, arc: 48 },
    { at: 8.2, actor: 'hog', do: 'bounce', dur: 0.3, times: 1, amount: 2 },
    // 回馬槍：一口吞——凍住
    { at: 8.45, actor: 'hog', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 8.5, actor: 'cone2', do: 'moveTo', to: { x: 18, y: 69 }, dur: 0.1 },
    { at: 8.6, actor: 'cone2', do: 'vanish', dur: 0.1 },
    { at: 8.8, actor: 'hog', do: 'swap', emoji: '🥶' },
    { at: 8.8, actor: 'hog', do: 'shake', dur: 0.9, amount: 1.2 },
    { at: 9.1, actor: 'sun', do: 'bounce', dur: 0.6, times: 2, amount: 1.5 },
  ],
  builds: [
    // 融化滴下來 → 冫；整支化成一攤 → 水
    { at: 5.2, dur: 0.5, strokes: [0, 1], from: 'cone', color: '#47AEF5' },
    { at: 5.7, dur: 0.7, strokes: [2, 3, 4, 5], from: { x: 22, y: 66 }, color: '#1F6FD1' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'sweat', actor: 'hog' },
    { at: 0.9, kind: 'bubble', actor: 'hog', emoji: '🍦', dur: 0.6 },
    { at: 2.25, kind: 'pop', actor: 'hog', emoji: '❗', dur: 0.4 },
    { at: 2.8, kind: 'sweat', actor: 'hog' },
    { at: 4.3, kind: 'pop', actor: 'hog', emoji: '💕', dur: 0.4 },
    { at: 4.4, kind: 'burst', actor: 'sun', emoji: '🔥', n: 6, dur: 0.6, dx: -4, dy: 10 },
    { at: 4.85, kind: 'pop', actor: 'hog', emoji: '😱', dur: 0.5 },
    { at: 5.0, kind: 'sweat', actor: 'hog' },
    { at: 5.9, kind: 'bubble', actor: 'hog', emoji: '😭', dur: 0.6 },
    { at: 8.8, kind: 'burst', actor: 'hog', emoji: '❄️', n: 6, dur: 0.6, dx: 5 },
    { at: 9.1, kind: 'pop', actor: 'sun', emoji: '😆', dur: 0.8, dx: -18, dy: 12 },
  ],
  camera: [
    { at: 4.4, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 120, y: 30 } },
    { at: 8.8, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 24, y: 64 } },
  ],
  cues: [
    { at: 1.3, sfx: 'whoosh' },
    { at: 1.5, say: '冰' },
    { at: 2.8, sfx: 'plop' },
    { at: 3.1, sfx: 'blip' }, { at: 3.35, sfx: 'blip' },
    { at: 4.2, sfx: 'clink' },
    { at: 4.4, sfx: 'rumble' },
    { at: 5.2, sfx: 'plop' },
    { at: 6.45, say: '冰' },
    { at: 7.0, sfx: 'slide' },
    { at: 7.6, sfx: 'whoosh' },
    { at: 7.65, say: '冰淇淋' },
    { at: 8.6, sfx: 'gulp' },
    { at: 8.8, sfx: 'crack' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
