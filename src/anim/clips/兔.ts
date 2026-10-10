import type { Clip } from '../clip'

// 兔：魔術師想從帽子變出兔子。第一下變出一隻雞，飛走了；第二下變出章魚，啪一聲黏在他臉上；第三下用力一敲——變出一頭大象！
// 魔術師嚇得亂揮魔杖，大象和章魚「砰」變成「兔」。原來兔子一直躲在他背後，跳出來坐上帽子。兔、兔、兔子
const clip: Clip = {
  char: '兔',
  meta: { theme: '魔術表演', cast: '魔術師＋帽子＋雞、章魚、大象＋兔子', gags: ['一直變錯東西', '越變越大', '其實一直在你後面'] },
  duration: 10,
  bg: { top: '#2A1A52', bottom: '#5B3C8C', floor: '#8A5A3C', scenery: 'night' },
  actors: [
    { id: 'rabbit', emoji: '🐇', x: 22, y: 71, size: 13, hidden: true },
    { id: 'magician', emoji: '🧙', x: 22, y: 68.5, size: 20, hidden: true },
    { id: 'hat', emoji: '🎩', x: 42, y: 71.5, size: 13, hidden: true },
    { id: 'chicken', emoji: '🐔', x: 42, y: 64, size: 12, hidden: true },
    { id: 'octo', emoji: '🐙', x: 42, y: 64, size: 12, hidden: true },
    { id: 'elephant', emoji: '🐘', x: 46, y: 63, size: 30, hidden: true },
    { id: 'wand', emoji: '🪄', x: 33, y: 62, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'magician', do: 'enter', from: { x: -15, y: 68.5 }, dur: 0.6 },
    { at: 0.4, actor: 'hat', do: 'pop' },
    { at: 0.6, actor: 'wand', do: 'pop' },
    // 第一下：雞，咯咯咯飛走
    { at: 1.6, actor: 'wand', do: 'tilt', amount: 35, dur: 0.3 },
    { at: 1.9, actor: 'chicken', do: 'pop' },
    { at: 2.2, actor: 'chicken', do: 'moveTo', to: { x: 176, y: 12 }, dur: 0.9, arc: 10 },
    { at: 2.2, actor: 'chicken', do: 'bounce', amount: 3, times: 4, dur: 0.9 },
    // 第二下：章魚，啪——黏在臉上
    { at: 3.1, actor: 'wand', do: 'tilt', amount: 35, dur: 0.3 },
    { at: 3.4, actor: 'octo', do: 'pop' },
    { at: 3.6, actor: 'octo', do: 'moveTo', to: { x: 22, y: 61 }, dur: 0.3, arc: 8 },
    { at: 3.9, actor: 'magician', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 4.6, actor: 'octo', do: 'moveTo', to: { x: 8, y: 72 }, dur: 0.35 },
    // 第三下：用力敲——大象！
    { at: 4.9, actor: 'wand', do: 'tilt', amount: 50, dur: 0.3 },
    { at: 4.9, actor: 'wand', do: 'flash', dur: 0.4 },
    { at: 4.9, actor: 'hat', do: 'shake', amount: 2, dur: 0.4 },
    { at: 5.25, actor: 'elephant', do: 'pop', dur: 0.3 },
    { at: 5.4, actor: 'magician', do: 'hop', amount: 5, dur: 0.35 },
    { at: 5.7, actor: 'elephant', do: 'moveTo', to: { x: 80, y: 63 }, dur: 0.45, arc: 6 },
    // 嚇得亂揮魔杖
    { at: 6.2, actor: 'wand', do: 'shake', amount: 2, dur: 0.8 },
    { at: 6.3, actor: 'elephant', do: 'vanish', dur: 0.25 },
    { at: 6.75, actor: 'octo', do: 'vanish', dur: 0.2 },
    // 兔子在哪？——一直在背後
    { at: 7.6, actor: 'rabbit', do: 'pop', dur: 0.15 },
    { at: 7.65, actor: 'rabbit', do: 'moveTo', to: { x: 42, y: 61 }, dur: 0.5, arc: 14 },
    { at: 7.7, actor: 'magician', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.15, actor: 'hat', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.0, actor: 'rabbit', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 被變不見的大象 → 上半；章魚 → 兩條腿
    { at: 6.3, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: 'elephant', color: '#E05D9A' },
    { at: 6.75, dur: 0.6, strokes: [5, 6, 7], from: 'octo', color: '#3FB6E0' },
  ],
  glyph: [{ at: 7.4, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'magician', emoji: '🐇', dur: 1.0 },
    { at: 1.7, kind: 'burst', actor: 'hat', emoji: '✨', n: 5, dur: 0.5 },
    { at: 2.5, kind: 'pop', actor: 'magician', emoji: '😑', dur: 0.6 },
    { at: 3.2, kind: 'burst', actor: 'hat', emoji: '✨', n: 5, dur: 0.5 },
    { at: 4.0, kind: 'sweat', actor: 'magician' },
    { at: 5.0, kind: 'burst', actor: 'hat', emoji: '✨', n: 7, dur: 0.5 },
    { at: 5.35, kind: 'pop', actor: 'magician', emoji: '😱', dur: 0.6 },
    { at: 6.2, kind: 'line', actor: 'wand', target: 'elephant', color: '#FFE066', width: 1.2, dur: 0.3 },
    { at: 6.3, kind: 'burst', actor: 'elephant', emoji: '✨', n: 7, dur: 0.6 },
    { at: 6.65, kind: 'line', actor: 'wand', target: 'octo', color: '#FFE066', width: 1.2, dur: 0.25 },
    { at: 7.8, kind: 'pop', actor: 'magician', emoji: '❗', dur: 0.6 },
    { at: 8.4, kind: 'bubble', actor: 'rabbit', emoji: '😎', dur: 1.0 },
  ],
  camera: [
    { at: 3.6, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 26, y: 62 } },
    { at: 5.25, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.9, say: '兔' },
    { at: 1.6, sfx: 'blip' },
    { at: 2.2, sfx: 'whoosh' },
    { at: 3.1, sfx: 'blip' },
    { at: 3.9, sfx: 'plop' },
    { at: 4.9, sfx: 'rumble' },
    { at: 5.25, sfx: 'poof' },
    { at: 6.3, sfx: 'laser' },
    { at: 6.75, sfx: 'laser' },
    { at: 7.45, say: '兔' },
    { at: 8.4, say: '兔子' },
    { at: 9.3, sfx: 'cheer' },
  ],
}

export default clip
