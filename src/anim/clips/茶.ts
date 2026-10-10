import type { Clip } from '../clip'

// 茶：雪地跳水大賽，跳台下面是一杯熱茶。第一片茶葉漂亮入水，企鵝裁判給 7 分；第二片轉太多圈，肚子拍在杯緣彈飛。
// 大茶壺飛來助陣，倒太多，茶滿出來淋了裁判一身，濺出來的茶變成「茶」。泡熱茶好舒服，裁判自己也跳進杯子裡泡澡。茶、茶、茶壺
const clip: Clip = {
  char: '茶',
  meta: { theme: '雪地茶杯跳水', cast: '茶葉選手＋企鵝裁判＋大茶壺', gags: ['肚子拍在杯緣彈飛', '茶壺倒太多滿出來', '裁判被淋濕', '裁判自己跳進去泡澡'] },
  duration: 10,
  bg: { top: '#DDEEFF', bottom: '#F4F9FF', floor: '#C9DCEB', scenery: 'snow' },
  actors: [
    { id: 'ladder', emoji: '🪜', x: 47, y: 68.6, size: 20, hidden: true },
    { id: 'judge', emoji: '🐧', x: 12, y: 71.2, size: 13.8, hidden: true },
    { id: 'cup', emoji: '🍵', x: 30, y: 69.6, size: 17.5, hidden: true },
    { id: 'leaf1', emoji: '🍃', x: 45, y: 59, size: 8.8, hidden: true },
    { id: 'leaf2', emoji: '🍃', x: 45, y: 59, size: 8.8, hidden: true },
    { id: 'teapot', emoji: '🫖', x: 32, y: 36, size: 22.5, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'ladder', do: 'pop' },
    { at: 0.1, actor: 'cup', do: 'pop' },
    { at: 0.2, actor: 'judge', do: 'enter', from: { x: -12, y: 71.2 }, dur: 0.5 },
    { at: 0.4, actor: 'leaf1', do: 'pop' },
    // 第一跳：漂亮入水
    { at: 0.8, actor: 'leaf1', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 1.05, actor: 'leaf1', do: 'moveTo', to: { x: 30, y: 65 }, arc: 14, dur: 0.5 },
    { at: 1.05, actor: 'leaf1', do: 'spin', times: 2, dur: 0.5 },
    { at: 1.57, actor: 'leaf1', do: 'vanish', dur: 0.1 },
    { at: 2.06, actor: 'judge', do: 'bounce', amount: 2, times: 1, dur: 0.4 },
    // 第二跳：轉太多圈，肚子拍在杯緣彈飛
    { at: 2.38, actor: 'leaf2', do: 'pop' },
    { at: 2.81, actor: 'leaf2', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 3.13, actor: 'leaf2', do: 'moveTo', to: { x: 33, y: 62 }, arc: 22, dur: 0.6 },
    { at: 3.13, actor: 'leaf2', do: 'spin', times: 4, dur: 0.6 },
    { at: 3.77, actor: 'leaf2', do: 'moveTo', to: { x: 62, y: 68 }, arc: 10, dur: 0.45 },
    { at: 3.77, actor: 'leaf2', do: 'rotateTo', amount: 160, dur: 0.45 },
    { at: 3.77, actor: 'cup', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 4.31, actor: 'judge', do: 'tilt', amount: -12, dur: 0.35 },
    // 大茶壺飛來，倒太多
    { at: 4.74, actor: 'teapot', do: 'drop', dur: 0.5 },
    { at: 5.27, actor: 'teapot', do: 'rotateTo', amount: -35, dur: 0.3 },
    { at: 5.49, actor: 'cup', do: 'shake', amount: 1, dur: 1.0 },
    { at: 5.7, actor: 'leaf2', do: 'vanish', dur: 0.15 },
    { at: 6.1, actor: 'judge', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 6.7, actor: 'judge', do: 'shake', amount: 1, dur: 0.4 },
    // 茶壺鞠躬
    { at: 7.3, actor: 'teapot', do: 'rotateTo', amount: 35, dur: 0.3 },
    { at: 8, actor: 'teapot', do: 'tilt', amount: 20, dur: 0.5 },
    // 裁判泡熱茶好舒服，自己跳進杯子
    { at: 8.8, actor: 'judge', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 9.01, actor: 'judge', do: 'moveTo', to: { x: 30, y: 66.5 }, arc: 14, dur: 0.5 },
    { at: 9.01, actor: 'judge', do: 'spin', dur: 0.5 },
    { at: 6.8, actor: 'ladder', do: 'vanish', dur: 0.3 },
  ],
  builds: [
    // 彈飛的茶葉散開 → 草字頭；茶壺倒出來的茶 → 下面
    { at: 5.7, dur: 0.6, strokes: [0, 1, 2], from: 'leaf2', color: '#3E9B4F' },
    { at: 6.2, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'teapot', color: '#A0522D' },
  ],
  glyph: [{ at: 7.1, dur: 0.4, do: 'wobble' }, { at: 9.57, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'leaf1', emoji: '😎', dur: 0.5 },
    { at: 1.57, kind: 'fountain', actor: 'cup', dy: 4, n: 6, dur: 0.6 },
    { at: 1.95, kind: 'pop', actor: 'judge', emoji: '7️⃣', dur: 0.7 },
    { at: 3.77, kind: 'burst', actor: 'cup', dx: 3, dur: 0.4 },
    { at: 4.25, kind: 'dizzy', actor: 'leaf2', dur: 1.1 },
    { at: 4.31, kind: 'pop', actor: 'judge', emoji: '1️⃣', dur: 0.7 },
    { at: 5.38, kind: 'rain', actor: 'teapot', dx: -8, dy: 6, n: 8, emoji: '🟤', dur: 1.0 },
    { at: 5.8, kind: 'fountain', actor: 'cup', dy: 4, n: 10, dur: 1.0 },
    { at: 6.1, kind: 'rain', actor: 'judge', n: 5, dur: 0.8 },
    { at: 6.2, kind: 'pop', actor: 'judge', emoji: '😳', dur: 0.6 },
    { at: 7.4, kind: 'zzz', actor: 'cup', emoji: '♨️', dur: 1.4 },
    { at: 8.45, kind: 'bubble', actor: 'judge', emoji: '😌', dur: 0.4 },
    { at: 9.44, kind: 'fountain', actor: 'cup', dy: 4, n: 6, dur: 0.6 },
    { at: 9.48, kind: 'pop', actor: 'judge', emoji: '🔟', dur: 0.6 },
  ],
  camera: [
    { at: 3.77, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 34, y: 64 } },
    { at: 5.8, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.05, sfx: 'whoosh' },
    { at: 1.57, sfx: 'splash' },
    { at: 1.79, say: '茶' },
    { at: 3.13, sfx: 'whoosh' },
    { at: 3.77, sfx: 'boing' },
    { at: 4.84, sfx: 'whoosh' },
    { at: 5.38, sfx: 'bubble' },
    { at: 5.8, sfx: 'splash' },
    { at: 7.15, say: '茶' },
    { at: 8.15, say: '茶壺' },
    { at: 9.01, sfx: 'whoosh' },
    { at: 9.44, sfx: 'splash' },
    { at: 9.66, sfx: 'cheer' },
  ],
}

export default clip
