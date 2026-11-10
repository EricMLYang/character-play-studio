import type { Clip } from '../clip'

// 餃：半夜，豬探長看到披風英雄看守的一籠水餃，放大鏡後的眼睛瞪得好大；他高抬腿偷溜，每一步都吱吱叫，英雄一動他就單腳定格。
// 手指快碰到水餃時英雄醒了——兩個面對面大叫、往反方向逃、又彈回來撞在一起，水餃飛上天掉成「食」，放大鏡和披風交叉成「交」。
// 唸「水餃」時小鍋子裡浮起一顆水餃，豬探長得意地鞠躬；最後他一口咬下——熱氣噗地噴了他滿臉。餃、餃、水餃
const clip: Clip = {
  char: '餃',
  meta: { theme: '半夜偷吃水餃', cast: '豬探長＋披風英雄＋一籠水餃', gags: ['高抬腿偷溜吱吱叫', '單腳定格', '面對面大叫相撞', '燙到噴熱氣'] },
  duration: 10,
  bg: { top: '#364FC7', bottom: '#91A7FF', floor: '#FFE8CC', scenery: 'night' },
  actors: [
    { id: 'stool', emoji: '🪑', x: 120, y: 72.4, size: 11 },
    { id: 'd1', emoji: '🥟', x: 116, y: 64, size: 7 },
    { id: 'd2', emoji: '🥟', x: 124, y: 64, size: 7 },
    { id: 'd3', emoji: '🥟', x: 120, y: 59.5, size: 7 },
    { id: 'hero', emoji: 'hero:cape/idle', x: 142, y: 71.1, size: 14 },
    { id: 'pot', emoji: '🍲', x: 41, y: 73.6, size: 8, hidden: true },
    { id: 'jiao', emoji: '🥟', x: 41, y: 67, size: 6, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 26, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 豬探長滑進來，放大鏡後的眼睛瞪得好大
    { at: 0, actor: 'pig', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.5, ease: 'back' },
    { at: 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 1.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 1.3, actor: 'pig', do: 'squash', amount: 0.15, dur: 0.3 },
    // 高抬腿偷溜，一步一吱
    { at: 1.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 1.6, actor: 'pig', do: 'moveTo', to: { x: 40, y: 71.1 }, arc: 7, dur: 0.35 },
    { at: 2.0, actor: 'pig', do: 'moveTo', to: { x: 54, y: 71.1 }, arc: 7, dur: 0.35 },
    { at: 2.4, actor: 'pig', do: 'moveTo', to: { x: 68, y: 71.1 }, arc: 7, dur: 0.2 },
    // 英雄動了一下——單腳定格，放大鏡擋住臉
    { at: 2.6, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: 2.6, actor: 'pig', do: 'moveTo', to: { x: 72, y: 66 }, dur: 0.1 },
    { at: 2.62, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.7, actor: 'pig', do: 'shake', amount: 0.5, dur: 0.4 },
    // 沒事，繼續偷溜，伸長手
    { at: 3.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 3.15, actor: 'pig', do: 'moveTo', to: { x: 90, y: 71.1 }, arc: 6, dur: 0.35 },
    { at: 3.5, actor: 'pig', do: 'moveTo', to: { x: 104, y: 71.1 }, arc: 6, dur: 0.3 },
    { at: 3.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 3.85, actor: 'pig', do: 'squash', amount: -0.2, dur: 0.3 },
    // 英雄醒了！面對面
    { at: 3.95, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 3.95, actor: 'hero', do: 'moveTo', to: { x: 133, y: 71.1 }, dur: 0.15 },
    { at: 4.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 4.05, actor: 'pig', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 4.05, actor: 'hero', do: 'squash', amount: -0.2, dur: 0.2 },
    // 往反方向逃——又彈回來撞在一起
    { at: 4.3, actor: 'pig', do: 'moveTo', to: { x: 90, y: 71.1 }, dur: 0.15, ease: 'out' },
    { at: 4.3, actor: 'hero', do: 'moveTo', to: { x: 148, y: 71.1 }, dur: 0.15, ease: 'out' },
    { at: 4.45, actor: 'pig', do: 'moveTo', to: { x: 113, y: 71.1 }, dur: 0.2, ease: 'in' },
    { at: 4.45, actor: 'hero', do: 'moveTo', to: { x: 127, y: 71.1 }, dur: 0.2, ease: 'in' },
    { at: 4.65, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 4.65, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.2 },
    // 水餃飛上天
    { at: 4.65, actor: 'd1', do: 'moveTo', to: { x: 100, y: -10 }, dur: 0.3, ease: 'out' },
    { at: 4.65, actor: 'd2', do: 'moveTo', to: { x: 120, y: -10 }, dur: 0.3, ease: 'out' },
    { at: 4.65, actor: 'd3', do: 'moveTo', to: { x: 80, y: -12 }, dur: 0.3, ease: 'out' },
    { at: 4.65, actor: 'stool', do: 'hop', amount: 4, dur: 0.3 },
    // 兩個彈開，暈暈的
    { at: 4.8, actor: 'pig', do: 'moveTo', to: { x: 24, y: 71.1 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: 4.8, actor: 'hero', do: 'moveTo', to: { x: 144, y: 71.1 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: 5.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 5.4, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    // 「水餃」：小鍋子浮起一顆水餃，豬探長得意地鞠躬
    { at: 6.5, actor: 'pot', do: 'pop', dur: 0.3 },
    { at: 6.95, actor: 'jiao', do: 'pop', dur: 0.3 },
    { at: 7.2, actor: 'jiao', do: 'bounce', times: 2, amount: 1.2, dur: 0.8 },
    { at: 7.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.6, actor: 'pig', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 7.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    // 回馬槍：一口咬下——熱氣噴了滿臉
    { at: 8.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.3, actor: 'jiao', do: 'moveTo', to: { x: 31, y: 64 }, dur: 0.2 },
    { at: 8.5, actor: 'jiao', do: 'vanish', dur: 0.1 },
    { at: 8.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.65, actor: 'pig', do: 'tint', filter: 'sepia(.5) saturate(3) hue-rotate(-25deg)' },
    { at: 8.65, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.25, actor: 'pig', do: 'tint', filter: '' },
    { at: 9.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  ],
  builds: [
    // 掉下來的水餃 → 食；放大鏡和披風交叉 → 交
    { at: 4.9, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'd3', style: 'drop', color: '#FCC419' },
    { at: 5.15, dur: 0.75, strokes: [8, 9, 10, 11, 12, 13], from: 'pig', color: '#FF922B' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'hero', dur: 2.5 },
    { at: 0.6, kind: 'pop', actor: 'pig', emoji: '👀', dx: -5, dur: 0.5 },
    { at: 1.3, kind: 'pop', actor: 'pig', emoji: '😬', dur: 0.4 },
    { at: 2.65, kind: 'pop', actor: 'hero', emoji: '❓', dur: 0.4 },
    { at: 2.7, kind: 'sweat', actor: 'pig' },
    { at: 3.1, kind: 'zzz', actor: 'hero', dur: 0.8 },
    { at: 4.05, kind: 'pop', actor: 'pig', emoji: '😱', dur: 0.45 },
    { at: 4.05, kind: 'pop', actor: 'hero', emoji: '😱', dur: 0.45 },
    { at: 4.65, kind: 'burst', actor: 'stool', dy: -8, dur: 0.35 },
    { at: 5.4, kind: 'dizzy', actor: 'pig', dur: 1.0 },
    { at: 7.0, kind: 'zzz', actor: 'jiao', emoji: '♨️', dur: 1.2 },
    { at: 7.8, kind: 'pop', actor: 'hero', emoji: '👍', dur: 0.6 },
    { at: 8.6, kind: 'burst', actor: 'pig', emoji: '💨', n: 6, dur: 0.6 },
    { at: 8.75, kind: 'pop', actor: 'pig', emoji: '🥵', dur: 0.5 },
  ],
  camera: [
    // 放大鏡那一下推近豬探長，相撞時震
    { at: 0.6, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 30, y: 62 } },
    { at: 2.6, dur: 0.6, do: 'punch', amount: 0.1, to: { x: 74, y: 60 } },
    { at: 4.65, dur: 0.4, do: 'shake', amount: 1.3 },
  ],
  cues: [
    { at: 0.1, sfx: 'slide' },
    { at: 1.65, say: '餃' },
    { at: 1.95, sfx: 'tap' },
    { at: 2.35, sfx: 'tap' },
    { at: 2.6, sfx: 'tap' },
    { at: 3.5, sfx: 'tap' },
    { at: 3.85, sfx: 'tap' },
    { at: 4.05, sfx: 'boing' },
    { at: 4.65, sfx: 'bonk' },
    { at: 5.95, say: '餃' },
    { at: 7.0, say: '水餃' },
    { at: 8.5, sfx: 'gulp' },
    { at: 8.65, sfx: 'poof' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
