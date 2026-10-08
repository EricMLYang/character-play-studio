import type { Clip } from '../clip'

// 茶：雪地跳水大賽，跳台下面是一杯熱茶。第一片茶葉漂亮入水，企鵝裁判給 7 分；第二片轉太多圈，肚子拍在杯緣彈飛。
// 大茶壺飛來助陣，倒太多，茶滿出來淋了裁判一身，濺出來的茶變成「茶」。泡熱茶好舒服，裁判自己也跳進杯子裡泡澡。茶、茶、茶壺
const clip: Clip = {
  char: '茶',
  meta: { theme: '雪地茶杯跳水', cast: '茶葉選手＋企鵝裁判＋大茶壺', gags: ['肚子拍在杯緣彈飛', '茶壺倒太多滿出來', '裁判被淋濕', '裁判自己跳進去泡澡'] },
  duration: 10,
  bg: { top: '#DDEEFF', bottom: '#F4F9FF', floor: '#C9DCEB', scenery: 'snow' },
  actors: [
    { id: 'ladder', emoji: '🪜', x: 47, y: 70.3, size: 16, hidden: true },
    { id: 'judge', emoji: '🐧', x: 12, y: 72.4, size: 11, hidden: true },
    { id: 'cup', emoji: '🍵', x: 30, y: 71.1, size: 14, hidden: true },
    { id: 'leaf1', emoji: '🍃', x: 45, y: 59, size: 7, hidden: true },
    { id: 'leaf2', emoji: '🍃', x: 45, y: 59, size: 7, hidden: true },
    { id: 'teapot', emoji: '🫖', x: 32, y: 36, size: 18, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'ladder', do: 'pop' },
    { at: 0.1, actor: 'cup', do: 'pop' },
    { at: 0.2, actor: 'judge', do: 'enter', from: { x: -12, y: 72.4 }, dur: 0.5 },
    { at: 0.4, actor: 'leaf1', do: 'pop' },
    // 第一跳：漂亮入水
    { at: 0.8, actor: 'leaf1', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 1.05, actor: 'leaf1', do: 'moveTo', to: { x: 30, y: 65 }, arc: 14, dur: 0.5 },
    { at: 1.05, actor: 'leaf1', do: 'spin', times: 2, dur: 0.5 },
    { at: 1.55, actor: 'leaf1', do: 'vanish', dur: 0.1 },
    { at: 2.0, actor: 'judge', do: 'bounce', amount: 2, times: 1, dur: 0.4 },
    // 第二跳：轉太多圈，肚子拍在杯緣彈飛
    { at: 2.3, actor: 'leaf2', do: 'pop' },
    { at: 2.7, actor: 'leaf2', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 3.0, actor: 'leaf2', do: 'moveTo', to: { x: 33, y: 62 }, arc: 22, dur: 0.6 },
    { at: 3.0, actor: 'leaf2', do: 'spin', times: 4, dur: 0.6 },
    { at: 3.6, actor: 'leaf2', do: 'moveTo', to: { x: 62, y: 68 }, arc: 10, dur: 0.45 },
    { at: 3.6, actor: 'leaf2', do: 'rotateTo', amount: 160, dur: 0.45 },
    { at: 3.6, actor: 'cup', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 4.1, actor: 'judge', do: 'tilt', amount: -12, dur: 0.35 },
    // 大茶壺飛來，倒太多
    { at: 4.5, actor: 'teapot', do: 'drop', dur: 0.5 },
    { at: 5.0, actor: 'teapot', do: 'rotateTo', amount: -35, dur: 0.3 },
    { at: 5.2, actor: 'cup', do: 'shake', amount: 1, dur: 1.0 },
    { at: 5.4, actor: 'leaf2', do: 'vanish', dur: 0.15 },
    { at: 5.8, actor: 'judge', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 6.4, actor: 'judge', do: 'shake', amount: 1, dur: 0.4 },
    // 茶壺鞠躬
    { at: 7.0, actor: 'teapot', do: 'rotateTo', amount: 35, dur: 0.3 },
    { at: 7.7, actor: 'teapot', do: 'tilt', amount: 20, dur: 0.5 },
    // 裁判泡熱茶好舒服，自己跳進杯子
    { at: 8.6, actor: 'judge', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 8.85, actor: 'judge', do: 'moveTo', to: { x: 30, y: 66.5 }, arc: 14, dur: 0.5 },
    { at: 8.85, actor: 'judge', do: 'spin', dur: 0.5 },
  ],
  builds: [
    // 彈飛的茶葉散開 → 草字頭；茶壺倒出來的茶 → 下面
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2], from: 'leaf2', color: '#3E9B4F' },
    { at: 5.9, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'teapot', color: '#A0522D' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'leaf1', emoji: '😎', dur: 0.5 },
    { at: 1.55, kind: 'fountain', actor: 'cup', dy: 4, n: 6, dur: 0.6 },
    { at: 1.9, kind: 'pop', actor: 'judge', emoji: '7️⃣', dur: 0.7 },
    { at: 3.6, kind: 'burst', actor: 'cup', dx: 3, dur: 0.4 },
    { at: 4.05, kind: 'dizzy', actor: 'leaf2', dur: 1.1 },
    { at: 4.1, kind: 'pop', actor: 'judge', emoji: '1️⃣', dur: 0.7 },
    { at: 5.1, kind: 'rain', actor: 'teapot', dx: -8, dy: 6, n: 8, emoji: '🟤', dur: 1.0 },
    { at: 5.5, kind: 'fountain', actor: 'cup', dy: 4, n: 10, dur: 1.0 },
    { at: 5.8, kind: 'rain', actor: 'judge', n: 5, dur: 0.8 },
    { at: 5.9, kind: 'pop', actor: 'judge', emoji: '😳', dur: 0.6 },
    { at: 7.1, kind: 'zzz', actor: 'cup', emoji: '♨️', dur: 1.4 },
    { at: 8.2, kind: 'bubble', actor: 'judge', emoji: '😌', dur: 0.4 },
    { at: 9.35, kind: 'fountain', actor: 'cup', dy: 4, n: 6, dur: 0.6 },
    { at: 9.4, kind: 'pop', actor: 'judge', emoji: '🔟', dur: 0.6 },
  ],
  camera: [
    { at: 3.6, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 34, y: 64 } },
    { at: 5.5, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.05, sfx: 'whoosh' },
    { at: 1.55, sfx: 'splash' },
    { at: 1.75, say: '茶' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 3.6, sfx: 'boing' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 5.1, sfx: 'bubble' },
    { at: 5.5, sfx: 'splash' },
    { at: 6.85, say: '茶' },
    { at: 7.85, say: '茶壺' },
    { at: 8.85, sfx: 'whoosh' },
    { at: 9.35, sfx: 'splash' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
