import type { Clip } from '../clip'

// 呆：拉布拉多警長踮腳偷拿豬探長看守的紅色證物箱，每踩一步就「吱」，豬探長在睡夢中哼一聲、警長就單腳定格。
// 手快碰到箱子——豬探長眼睛一睜，兩個臉貼臉一起尖叫！警長拔腿想跑，腳在地上空轉，「咚」撞翻木架：木架疊成「木」、箱子翻一圈落成「口」。
// 兩個坐在地上一起發呆；口哨自己「嗶」一聲，豬探長又睡著了。呆、呆、發呆
const clip: Clip = {
  char: '呆',
  meta: { theme: '偷拿證物箱', cast: '拉布拉多警長＋豬探長＋證物箱＋木架', gags: ['踮腳偷溜一踩就吱', '臉貼臉一起尖叫', '腳空轉撞翻木架', '兩個一起發呆'] },
  duration: 10,
  bg: { top: '#FFF3C4', bottom: '#FFF9E3', floor: '#BFE8D2', scenery: 'room' },
  actors: [
    { id: 'stool', emoji: '🪑', x: 134, y: 69, size: 12 },
    { id: 'pig', emoji: 'hero:pig/idle', x: 134, y: 63, size: 14 },
    { id: 'stand', emoji: '🪵', x: 106, y: 69, size: 13 },
    { id: 'box', emoji: '🧰', x: 106, y: 59, size: 10 },
    { id: 'dog', emoji: 'hero:sheriff/idle', x: 18, y: 71, size: 14, flip: true, hidden: true },
  ],
  moves: [
    // 從左邊探頭進來，盯著箱子
    { at: 0, actor: 'dog', do: 'enter', from: { x: -12, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'dog', do: 'tilt', amount: 12, dur: 0.4 },
    // 抬起一隻腳——踮腳
    { at: 0.8, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.5 },
    { at: 0, actor: 'pig', do: 'tilt', amount: 8, dur: 1.4 },
    { at: 1.4, actor: 'pig', do: 'tilt', amount: -8, dur: 1.4 },
    // 偷溜：高抬腿，一步一吱
    { at: 1.5, actor: 'dog', do: 'moveTo', to: { x: 38, y: 71 }, arc: 5, dur: 0.35 },
    { at: 1.85, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
    { at: 1.9, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: 2.3, actor: 'dog', do: 'moveTo', to: { x: 60, y: 71 }, arc: 5, dur: 0.35 },
    { at: 2.65, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
    { at: 2.7, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.0, actor: 'dog', do: 'moveTo', to: { x: 90, y: 71 }, arc: 4, dur: 0.4 },
    // 豬探長醒來：臉貼臉一起尖叫
    { at: 3.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.5, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 3.5, actor: 'pig', do: 'hop', amount: 9, dur: 0.4 },
    { at: 3.5, actor: 'dog', do: 'hop', amount: 7, dur: 0.4 },
    { at: 3.55, actor: 'dog', do: 'shake', amount: 1.5, dur: 0.4 },
    // 拔腿想跑——腳在地上空轉，結果往前滑去撞木架
    { at: 4.0, actor: 'dog', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 4.0, actor: 'dog', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 4.3, actor: 'dog', do: 'moveTo', to: { x: 102, y: 71 }, dur: 0.2, ease: 'in' },
    { at: 4.5, actor: 'dog', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.5, actor: 'stand', do: 'shake', amount: 2, dur: 0.15 },
    { at: 4.5, actor: 'box', do: 'moveTo', to: { x: 80, y: 18 }, arc: 6, dur: 0.5, ease: 'out' },
    { at: 4.5, actor: 'box', do: 'spin', times: 1, dur: 0.5 },
    { at: 4.65, actor: 'stand', do: 'vanish', dur: 0.15 },
    // 撞完彈回左邊，一屁股坐下
    { at: 4.8, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.8, actor: 'dog', do: 'moveTo', to: { x: 24, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 5.3, actor: 'box', do: 'vanish', dur: 0.15 },
    { at: 5.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 5.0, actor: 'pig', do: 'moveTo', to: { x: 140, y: 71 }, arc: 6, dur: 0.5 },
    { at: 5.0, actor: 'stool', do: 'moveTo', to: { x: 150, y: 70 }, dur: 0.4, ease: 'out' },
    { at: 5.0, actor: 'stool', do: 'rotateTo', amount: 90, dur: 0.4 },
    { at: 5.5, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.4, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 發呆：一起盯著前方
    { at: 6.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 6.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 回馬槍：口哨自己嗶一聲，警長眨眼比讚；豬探長又睡著了
    { at: 7.6, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 7.6, actor: 'dog', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.2, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 8.2, actor: 'dog', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.4, actor: 'pig', do: 'tilt', amount: 14, dur: 1.4 },
  ],
  builds: [
    // 木架散開疊成「木」，紅箱子翻一圈落成「口」
    { at: 4.6, dur: 0.7, strokes: [3, 4, 5, 6], from: 'stand', color: '#1C3D8C' },
    { at: 5.3, dur: 0.55, strokes: [0, 1, 2], from: 'box', color: '#E03131' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'pig', dur: 3.2 },
    { at: 0.5, kind: 'bubble', actor: 'dog', emoji: '🧰', dur: 1.0 },
    { at: 1.85, kind: 'pop', actor: 'dog', emoji: '😬', dur: 0.45 },
    { at: 2.65, kind: 'sweat', actor: 'dog', dur: 0.4 },
    { at: 3.5, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.6 },
    { at: 3.5, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.6 },
    { at: 4.0, kind: 'puff', actor: 'dog', dur: 0.4 },
    { at: 4.5, kind: 'burst', actor: 'dog', dur: 0.5 },
    { at: 5.6, kind: 'dizzy', actor: 'dog', dur: 2.0 },
    { at: 5.6, kind: 'dizzy', actor: 'pig', dur: 2.0 },
    { at: 7.6, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.8 },
    { at: 8.3, kind: 'pop', actor: 'dog', emoji: '👍', dur: 0.7 },
    { at: 8.5, kind: 'zzz', actor: 'pig', dur: 1.5 },
  ],
  camera: [
    { at: 3.5, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 110, y: 60 } },
    { at: 4.5, dur: 0.35, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.85, say: '呆' },
    { at: 1.85, sfx: 'tap' },
    { at: 2.65, sfx: 'tap' },
    { at: 3.4, sfx: 'tap' },
    { at: 3.5, sfx: 'boing' },
    { at: 4.0, sfx: 'slide' },
    { at: 4.5, sfx: 'bonk' },
    { at: 4.7, sfx: 'crack' },
    { at: 5.9, say: '呆' },
    { at: 6.8, say: '發呆' },
    { at: 7.6, sfx: 'blip' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
