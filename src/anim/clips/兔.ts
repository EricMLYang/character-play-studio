import type { Clip } from '../clip'

// 兔：魔術師要從帽子變出兔子。第一下變出一隻雞，飛走了；第二下變出章魚，啪一聲黏在他臉上；第三下用力一敲——變出一頭大象！
// 魔術師亂揮魔杖，大象和章魚「砰」變成「兔」。兔子其實一直躲在他背後，跳出來搶走魔杖一點——換魔術師被變進帽子裡。兔、兔、兔子
const clip: Clip = {
  char: '兔',
  meta: { theme: '魔術表演', cast: '魔術師＋帽子＋雞、章魚、大象＋兔子', gags: ['一直變錯東西', '越變越大', '其實一直在你後面', '反過來被變不見'] },
  duration: 10,
  bg: { top: '#3A2160', bottom: '#6A3E8E', floor: '#8A5A3C', scenery: 'track' },
  actors: [
    { id: 'rabbit', emoji: '🐇', x: 24, y: 73.2, size: 9, hidden: true },
    { id: 'magician', emoji: '🧙', x: 24, y: 70.7, size: 15, hidden: true },
    { id: 'hat', emoji: '🎩', x: 40, y: 72.8, size: 10, hidden: true },
    { id: 'chicken', emoji: '🐔', x: 40, y: 68, size: 9, hidden: true },
    { id: 'octo', emoji: '🐙', x: 40, y: 68, size: 9, hidden: true },
    { id: 'elephant', emoji: '🐘', x: 44, y: 65.2, size: 28, hidden: true },
    { id: 'wand', emoji: '🪄', x: 32, y: 66, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'magician', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.6 },
    { at: 0.4, actor: 'hat', do: 'pop' },
    { at: 0.6, actor: 'wand', do: 'pop' },
    // 第一下：雞
    { at: 1.2, actor: 'wand', do: 'tilt', amount: 35, dur: 0.3 },
    { at: 1.5, actor: 'chicken', do: 'pop' },
    { at: 1.75, actor: 'chicken', do: 'moveTo', to: { x: 80, y: 36 }, dur: 0.4, arc: 6 },
    { at: 2.15, actor: 'chicken', do: 'moveTo', to: { x: 176, y: 14 }, dur: 0.6 },
    { at: 1.75, actor: 'chicken', do: 'bounce', amount: 3, times: 4, dur: 1.0 },
    // 第二下：章魚黏在臉上
    { at: 2.7, actor: 'wand', do: 'tilt', amount: 35, dur: 0.3 },
    { at: 2.95, actor: 'octo', do: 'pop' },
    { at: 3.15, actor: 'octo', do: 'moveTo', to: { x: 24, y: 64 }, dur: 0.3, arc: 8 },
    { at: 3.45, actor: 'magician', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 3.9, actor: 'octo', do: 'moveTo', to: { x: 8, y: 73.2 }, dur: 0.35 },
    // 第三下：大象！
    { at: 4.1, actor: 'wand', do: 'tilt', amount: 50, dur: 0.3 },
    { at: 4.1, actor: 'wand', do: 'flash', dur: 0.4 },
    { at: 4.1, actor: 'hat', do: 'shake', amount: 2, dur: 0.4 },
    { at: 4.45, actor: 'elephant', do: 'pop', dur: 0.3 },
    { at: 4.8, actor: 'elephant', do: 'moveTo', to: { x: 78, y: 65.2 }, dur: 0.4, arc: 6 },
    { at: 4.6, actor: 'magician', do: 'hop', amount: 5, dur: 0.3 },
    // 亂揮魔杖
    { at: 4.9, actor: 'wand', do: 'shake', amount: 2, dur: 0.8 },
    { at: 5.15, actor: 'elephant', do: 'vanish', dur: 0.25 },
    { at: 5.7, actor: 'octo', do: 'vanish', dur: 0.2 },
    // 兔子在哪？——一直在背後
    { at: 6.9, actor: 'magician', do: 'flip' },
    { at: 7.2, actor: 'magician', do: 'flip' },
    { at: 7.3, actor: 'rabbit', do: 'pop', dur: 0.15 },
    { at: 7.35, actor: 'rabbit', do: 'moveTo', to: { x: 50, y: 73.2 }, dur: 0.4, arc: 12 },
    { at: 7.8, actor: 'rabbit', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 7.6, actor: 'magician', do: 'hop', amount: 4, dur: 0.3 },
    // 兔子搶走魔杖，把魔術師變進帽子
    { at: 8.2, actor: 'wand', do: 'moveTo', to: { x: 47, y: 66 }, dur: 0.3, arc: 4 },
    { at: 8.6, actor: 'wand', do: 'tilt', amount: -35, dur: 0.3 },
    { at: 8.75, actor: 'magician', do: 'moveTo', to: { x: 40, y: 70 }, dur: 0.35 },
    { at: 8.75, actor: 'magician', do: 'scaleTo', amount: 0.15, dur: 0.35 },
    { at: 8.75, actor: 'magician', do: 'spin', dur: 0.35, times: 2 },
    { at: 9.1, actor: 'magician', do: 'vanish', dur: 0.1 },
    { at: 9.1, actor: 'hat', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
  ],
  builds: [
    // 被變不見的大象 → 上半；章魚 → 兩條腿
    { at: 5.15, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: 'elephant', color: '#E05D9A' },
    { at: 5.7, dur: 0.6, strokes: [5, 6, 7], from: 'octo', color: '#3FB6E0' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'magician', emoji: '🐇', dur: 0.6 },
    { at: 1.3, kind: 'burst', actor: 'hat', emoji: '✨', n: 5, dur: 0.5 },
    { at: 2.2, kind: 'pop', actor: 'magician', emoji: '😑', dur: 0.4 },
    { at: 2.8, kind: 'burst', actor: 'hat', emoji: '✨', n: 5, dur: 0.5 },
    { at: 3.5, kind: 'sweat', actor: 'magician' },
    { at: 4.2, kind: 'burst', actor: 'hat', emoji: '✨', n: 7, dur: 0.5 },
    { at: 4.55, kind: 'pop', actor: 'magician', emoji: '😱', dur: 0.5 },
    { at: 5.05, kind: 'line', actor: 'wand', target: 'elephant', color: '#FFE066', width: 1.2, dur: 0.3 },
    { at: 5.15, kind: 'burst', actor: 'elephant', emoji: '✨', n: 7, dur: 0.6 },
    { at: 5.6, kind: 'line', actor: 'wand', target: 'octo', color: '#FFE066', width: 1.2, dur: 0.25 },
    { at: 6.9, kind: 'pop', actor: 'magician', emoji: '❓', dur: 0.4 },
    { at: 7.6, kind: 'pop', actor: 'magician', emoji: '❗', dur: 0.4 },
    { at: 8.65, kind: 'burst', actor: 'magician', emoji: '✨', n: 6, dur: 0.5 },
    { at: 9.2, kind: 'bubble', actor: 'rabbit', emoji: '😎', dur: 0.7 },
  ],
  camera: [
    { at: 3.15, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 26, y: 64 } },
    { at: 5.2, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.2, sfx: 'blip' },
    { at: 1.5, say: '兔' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.7, sfx: 'blip' },
    { at: 3.45, sfx: 'plop' },
    { at: 4.1, sfx: 'rumble' },
    { at: 4.45, sfx: 'poof' },
    { at: 5.15, sfx: 'laser' },
    { at: 5.7, sfx: 'laser' },
    { at: 6.4, say: '兔' },
    { at: 7.4, say: '兔子' },
    { at: 8.6, sfx: 'blip' },
    { at: 8.75, sfx: 'whoosh' },
    { at: 9.1, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
