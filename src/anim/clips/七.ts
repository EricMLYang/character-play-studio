import type { Clip } from '../clip'

// 七：變色龍要躲貓貓。趴在紅花上變紅色、趴在葉子上變綠色、趴在藍色石頭上變藍色——藏得好好！
// 一隻彩虹蝴蝶飛過來，變色龍看呆了，一口氣變成七種顏色，閃得停不下來，七道彩光變成「七」。找牠的小狗一眼就看到了。七、七、七彩
const clip: Clip = {
  char: '七',
  meta: { theme: '躲貓貓', cast: '變色龍＋蝴蝶＋小狗', gags: ['變顏色藏起來', '看到漂亮的東西變色失控', '一眼就被找到'] },
  duration: 10,
  bg: { top: '#E3F7E3', bottom: '#F7FCF2', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'flower', emoji: '🌺', x: 30, y: 68, size: 18, hidden: true },
    { id: 'leaf', emoji: '🌿', x: 72, y: 68, size: 18, hidden: true },
    { id: 'rock', emoji: '🪨', x: 114, y: 69, size: 18, hidden: true, tint: 'sepia(1) saturate(4) hue-rotate(170deg)' },
    { id: 'lizard', emoji: '🦎', x: 30, y: 62, size: 15, hidden: true, flip: true },
    { id: 'bfly', emoji: '🦋', x: 180, y: 30, size: 12, hidden: true, float: true },
    { id: 'dog', emoji: '🐶', x: 146, y: 69.5, size: 17, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'flower', do: 'pop' }, { at: 0.1, actor: 'leaf', do: 'pop' }, { at: 0.2, actor: 'rock', do: 'pop' },
    { at: 6.4, actor: 'leaf', do: 'vanish', dur: 0.3 },
    { at: 0.3, actor: 'lizard', do: 'pop' },
    // 趴在紅花上變紅色
    { at: 1.1, actor: 'lizard', do: 'tint', filter: 'hue-rotate(230deg) saturate(2.6) brightness(.95)' },
    { at: 1.1, actor: 'lizard', do: 'flash', dur: 0.4 },
    // 趴在葉子上變綠色
    { at: 2.0, actor: 'lizard', do: 'moveTo', to: { x: 72, y: 62 }, dur: 0.5, arc: 10 },
    { at: 2.6, actor: 'lizard', do: 'flash', dur: 0.4 },
    { at: 2.6, actor: 'lizard', do: 'tint', filter: '' },
    // 趴在藍色石頭上變藍色
    { at: 3.4, actor: 'lizard', do: 'moveTo', to: { x: 114, y: 62 }, dur: 0.5, arc: 10 },
    { at: 4.0, actor: 'lizard', do: 'flash', dur: 0.4 },
    { at: 4.0, actor: 'lizard', do: 'tint', filter: 'hue-rotate(110deg) saturate(2.2)' },
    // 彩虹蝴蝶飛過來——看呆了，七種顏色停不下來
    { at: 4.6, actor: 'bfly', do: 'moveTo', to: { x: 96, y: 40 }, dur: 0.7, arc: 8 },
    { at: 5.4, actor: 'lizard', do: 'flash', dur: 1.0 },
    { at: 5.4, actor: 'lizard', do: 'shake', amount: 1.2, dur: 1.0 },
    { at: 5.40, actor: 'lizard', do: 'tint', filter: 'hue-rotate(250deg) saturate(2)' },
    { at: 5.54, actor: 'lizard', do: 'tint', filter: 'hue-rotate(300deg) saturate(2)' },
    { at: 5.68, actor: 'lizard', do: 'tint', filter: 'hue-rotate(0deg) saturate(2)' },
    { at: 5.82, actor: 'lizard', do: 'tint', filter: 'hue-rotate(60deg) saturate(2)' },
    { at: 5.96, actor: 'lizard', do: 'tint', filter: 'hue-rotate(120deg) saturate(2)' },
    { at: 6.10, actor: 'lizard', do: 'tint', filter: 'hue-rotate(180deg) saturate(2)' },
    { at: 6.24, actor: 'lizard', do: 'tint', filter: 'hue-rotate(220deg) saturate(2)' },
    { at: 6.4, actor: 'lizard', do: 'tint', filter: '' },
    { at: 6.3, actor: 'bfly', do: 'moveTo', to: { x: 180, y: 16 }, dur: 0.7 },
    // 小狗一眼就看到了
    { at: 7.6, actor: 'dog', do: 'pop', dur: 0.3 },
    { at: 8.4, actor: 'dog', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.8, actor: 'lizard', do: 'hop', amount: 8, dur: 0.4 },
    { at: 8.8, actor: 'lizard', do: 'tint', filter: 'hue-rotate(230deg) saturate(2.6) brightness(.95)' },
  ],
  builds: [
    // 七道彩光
    { at: 5.6, dur: 0.5, strokes: [0], from: 'lizard', color: '#F0473E' },
    { at: 6.0, dur: 0.5, strokes: [1], from: 'lizard', color: '#9B5DE5' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'pop', actor: 'lizard', emoji: '🔴', dur: 0.8 },
    { at: 2.5, kind: 'pop', actor: 'lizard', emoji: '🟢', dur: 0.8 },
    { at: 3.9, kind: 'pop', actor: 'lizard', emoji: '🔵', dur: 0.8 },
    { at: 5.2, kind: 'pop', actor: 'lizard', emoji: '😍', dur: 0.4 },
    { at: 5.5, kind: 'burst', actor: 'lizard', emoji: '🌈', n: 7, dur: 0.9 },
    { at: 7.8, kind: 'pop', actor: 'dog', emoji: '👀', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'dog', emoji: '😆', dur: 0.8 },
    { at: 8.8, kind: 'pop', actor: 'lizard', emoji: '😳', dur: 0.8 },
  ],
  camera: [
    { at: 5.4, dur: 1.0, do: 'punch', amount: 0.25, to: { x: 112, y: 58 } },
  ],
  cues: [
    { at: 1.1, say: '七' },
    { at: 2.0, sfx: 'boing' },
    { at: 2.6, sfx: 'blip' },
    { at: 3.4, sfx: 'boing' },
    { at: 4.0, sfx: 'blip' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 5.4, sfx: 'laser' },
    { at: 6.65, say: '七' },
    { at: 7.6, say: '七彩' },
    { at: 8.8, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
