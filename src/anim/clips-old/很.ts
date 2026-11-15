import type { Clip } from '../clip'

// 很：布忍者躲在細細的站牌後面（整個人都露在外面），想偷消防車的水管當祕密武器；消防車醒來跟他拔河，水管越拉越長，
// 煙霧彈還在這時候自己爆開。水管「啵」一聲鬆手，兩邊都摔屁股，彈回來的水管圈成「很」，噴頭冒出好多好多泡泡。很、很、很多
const clip: Clip = {
  char: '很',
  meta: { theme: '偷水管拔河', cast: '布忍者＋消防車＋水管＋泡泡', gags: ['躲在細站牌後面', '拔河越拉越長', '鬆手兩邊摔屁股'] },
  duration: 10,
  bg: { top: '#CFEAFF', bottom: '#EEF8FF', floor: '#E9D3A6', scenery: 'city' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 18, y: 71.5, size: 13, flip: true },
    { id: 'post', emoji: '🚏', x: 22, y: 66, size: 18 },
    { id: 'truck', emoji: '🚒', x: 132, y: 68, size: 22 },
    { id: 'nozzle', emoji: '🚿', x: 32, y: 69, size: 8, hidden: true },
    { id: 'bub1', emoji: '🫧', x: 34, y: 60, size: 7, hidden: true, float: true },
    { id: 'bub2', emoji: '🫧', x: 42, y: 54, size: 8, hidden: true, float: true },
    { id: 'bub3', emoji: '🫧', x: 12, y: 52, size: 6, hidden: true, float: true },
  ],
  moves: [
    // 踮腳偷偷溜過去（整個人都看得到）
    { at: 0.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 0.4, actor: 'ninja', do: 'moveTo', to: { x: 52, y: 71.5 }, dur: 0.35, arc: 4 },
    { at: 0.8, actor: 'ninja', do: 'moveTo', to: { x: 86, y: 71.5 }, dur: 0.35, arc: 4 },
    { at: 1.2, actor: 'ninja', do: 'moveTo', to: { x: 112, y: 71.5 }, dur: 0.3, arc: 3 },
    // 抓住噴頭用力一扯——消防車醒了
    { at: 1.6, actor: 'ninja', do: 'tilt', amount: -18, dur: 0.3 },
    { at: 1.6, actor: 'truck', do: 'hop', amount: 3, dur: 0.3 },
    // 拔河：兩邊越拉越後仰，水管拉得好長
    { at: 2.0, actor: 'ninja', do: 'moveTo', to: { x: 30, y: 71.5 }, dur: 1.6, ease: 'out' },
    { at: 2.0, actor: 'ninja', do: 'rotateTo', amount: -18, dur: 0.5 },
    { at: 2.0, actor: 'truck', do: 'moveTo', to: { x: 140, y: 68 }, dur: 1.6, ease: 'out' },
    { at: 2.0, actor: 'truck', do: 'rotateTo', amount: 8, dur: 0.5 },
    { at: 2.6, actor: 'ninja', do: 'tint', filter: 'sepia(.35) saturate(2.2) hue-rotate(-25deg)' },
    { at: 2.4, actor: 'ninja', do: 'shake', amount: 0.8, dur: 1.0 },
    { at: 2.4, actor: 'truck', do: 'shake', amount: 0.8, dur: 1.0 },
    { at: 3.4, actor: 'ninja', do: 'shake', amount: 1.2, dur: 0.8 },
    { at: 3.4, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.8 },
    // 鬆手！兩邊都摔屁股
    { at: 4.4, actor: 'ninja', do: 'rotateTo', amount: 18, dur: 0.3 },
    { at: 4.4, actor: 'ninja', do: 'tint', filter: '' },
    { at: 4.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.4, actor: 'ninja', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.4, ease: 'out' },
    { at: 4.8, actor: 'ninja', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.4, actor: 'truck', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: 4.4, actor: 'truck', do: 'moveTo', to: { x: 146, y: 68 }, dur: 0.4, ease: 'out' },
    { at: 4.8, actor: 'truck', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 噴頭掉在左下角，冒出好多泡泡
    { at: 6.3, actor: 'nozzle', do: 'pop' },
    { at: 6.5, actor: 'nozzle', do: 'shake', amount: 1, dur: 0.6 },
    { at: 6.75, actor: 'bub1', do: 'pop' },
    { at: 6.95, actor: 'bub2', do: 'pop' },
    { at: 7.15, actor: 'bub3', do: 'pop' },
    { at: 6.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    // 布忍者開心地手刀戳泡泡
    { at: 7.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 7.85, actor: 'bub2', do: 'vanish', dur: 0.15 },
    { at: 8.25, actor: 'bub1', do: 'vanish', dur: 0.15 },
    { at: 8.0, actor: 'truck', do: 'tilt', amount: 8, dur: 0.4 },
    // 回馬槍：煙霧彈又在不對的時候爆開，他以為自己隱形了
    { at: 8.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.8, actor: 'bub3', do: 'vanish', dur: 0.2 },
    { at: 9.2, actor: 'truck', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 彈回來的水管圈成「很」：先是噴頭那一端的彳，再是車子那一端的艮
    { at: 4.5, dur: 0.5, strokes: [0, 1, 2], from: 'ninja', color: '#C2255C' },
    { at: 5.0, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'truck', color: '#E03131' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.4 },
    { at: 0.3, kind: 'zzz', actor: 'truck', dur: 1.3 },
    { at: 1.65, kind: 'pop', actor: 'truck', emoji: '❗', dur: 0.5 },
    // 水管：一條紅色粗線，被拉得越來越長
    { at: 1.6, dur: 2.8, kind: 'line', actor: 'truck', target: 'ninja', dx: -8, dy: 2, color: '#E03131', width: 1.4 },
    { at: 2.6, kind: 'sweat', actor: 'ninja' },
    { at: 3.1, kind: 'burst', actor: 'ninja', emoji: '💜', n: 6, dur: 0.6 },
    { at: 3.6, kind: 'pop', actor: 'ninja', emoji: '😎', dur: 0.6 },
    { at: 3.9, kind: 'sweat', actor: 'truck' },
    { at: 4.4, kind: 'burst', x: 80, y: 56, emoji: '💥', dur: 0.4 },
    { at: 4.8, kind: 'puff', actor: 'ninja' },
    { at: 4.8, kind: 'puff', actor: 'truck' },
    { at: 4.9, kind: 'dizzy', actor: 'ninja', dur: 1.2 },
    { at: 4.9, kind: 'dizzy', actor: 'truck', dur: 1.2 },
    { at: 6.6, dur: 0.7, kind: 'fountain', actor: 'nozzle', emoji: '🫧', n: 8 },
    { at: 7.85, kind: 'burst', actor: 'bub2', emoji: '✨', n: 5, dur: 0.4 },
    { at: 8.25, kind: 'burst', actor: 'bub1', emoji: '✨', n: 5, dur: 0.4 },
    { at: 8.75, kind: 'burst', actor: 'ninja', emoji: '💜', n: 6, dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'truck', emoji: '😑', dur: 0.8 },
  ],
  camera: [
    // 水管快撐不住那一下推近
    { at: 3.6, dur: 0.8, do: 'zoom', amount: 1.15, to: { x: 80, y: 58 } },
    { at: 4.4, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.42, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 0.4, sfx: 'tap' },
    { at: 0.8, sfx: 'tap' },
    { at: 1.65, say: '很' },
    { at: 2.4, sfx: 'slide' },
    { at: 3.1, sfx: 'poof' },
    { at: 4.4, sfx: 'boing' },
    { at: 4.8, sfx: 'plop' },
    { at: 6.0, say: '很' },
    { at: 6.6, sfx: 'bubble' },
    { at: 6.85, say: '很多' },
    { at: 7.85, sfx: 'poof' },
    { at: 8.25, sfx: 'poof' },
    { at: 8.75, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
