import type { Clip } from '../clip'

// 姐：貓姐姐幫小貓梳毛。梳一下——小貓的毛「蓬」地炸開；再梳一下——更蓬，變成一顆毛球！
// 姐姐拿吹風機一吹，小貓整隻被吹飛轉圈圈，毛和梳子飛成「姐」。小貓落下來，毛變得超順超亮——姐姐自己的毛卻炸開了。姐、姐、姐姐
const clip: Clip = {
  char: '姐',
  meta: { theme: '梳毛', cast: '貓姐姐＋小貓', gags: ['越梳越蓬', '吹風機吹飛', '最後換姐姐炸毛'] },
  duration: 10,
  bg: { top: '#FFE9F2', bottom: '#FFF7FA', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'big', emoji: '🐈', x: 30, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'kit', emoji: '🐱', x: 60, y: 70.5, size: 14, hidden: true },
    { id: 'comb', emoji: '🪮', x: 46, y: 60, size: 9, hidden: true, float: true },
    { id: 'dryer', emoji: '💨', x: 46, y: 62, size: 12, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'big', do: 'pop' },
    { at: 0.2, actor: 'kit', do: 'pop' },
    { at: 0.6, actor: 'comb', do: 'pop' },
    // 梳一下——蓬！
    { at: 1.2, actor: 'comb', do: 'moveTo', to: { x: 60, y: 62 }, dur: 0.3 },
    { at: 1.5, actor: 'comb', do: 'moveTo', to: { x: 60, y: 70 }, dur: 0.3 },
    { at: 1.8, actor: 'kit', do: 'scaleTo', amount: 1.3, dur: 0.2 },
    { at: 1.8, actor: 'kit', do: 'tint', filter: 'contrast(1.3) saturate(1.3)' },
    // 再梳——更蓬，變成毛球
    { at: 2.6, actor: 'comb', do: 'moveTo', to: { x: 60, y: 60 }, dur: 0.3 },
    { at: 2.9, actor: 'comb', do: 'moveTo', to: { x: 60, y: 72 }, dur: 0.3 },
    { at: 3.2, actor: 'kit', do: 'scaleTo', amount: 1.4, dur: 0.2 },
    { at: 3.2, actor: 'kit', do: 'shake', amount: 1, dur: 0.4 },
    { at: 3.8, actor: 'comb', do: 'moveTo', to: { x: 46, y: 60 }, dur: 0.3 },
    // 拿吹風機一吹——小貓被吹飛轉圈圈
    { at: 4.3, actor: 'dryer', do: 'pop', dur: 0.2 },
    { at: 4.6, actor: 'dryer', do: 'shake', amount: 1, dur: 0.6 },
    { at: 4.7, actor: 'kit', do: 'moveTo', to: { x: 130, y: 40 }, dur: 0.7, arc: 14 },
    { at: 4.7, actor: 'kit', do: 'spin', times: 3, dur: 0.9 },
    { at: 5.3, actor: 'comb', do: 'vanish', dur: 0.2 },
    { at: 5.4, actor: 'dryer', do: 'vanish', dur: 0.2 },
    // 落下來——毛變得超順超亮
    { at: 6.0, actor: 'kit', do: 'scaleTo', amount: 0.55, dur: 0.3 },
    { at: 6.0, actor: 'kit', do: 'tint', filter: 'brightness(1.12)' },
    { at: 6.0, actor: 'kit', do: 'moveTo', to: { x: 130, y: 70.5 }, dur: 0.5 },
    { at: 6.5, actor: 'kit', do: 'flash', dur: 0.6 },
    // 姐姐自己的毛炸開了
    { at: 8.5, actor: 'big', do: 'scaleTo', amount: 1.35, dur: 0.2 },
    { at: 8.5, actor: 'big', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 9.1, actor: 'kit', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 吹飛的毛 → 女；梳子 → 且
    { at: 5.0, dur: 0.6, strokes: [0, 1, 2], from: 'kit', color: '#E8508A' },
    { at: 5.4, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: 'comb', color: '#B07CFF' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'big', emoji: '😊', dur: 0.6 },
    { at: 1.8, kind: 'burst', actor: 'kit', emoji: '💨', n: 5, dur: 0.4 },
    { at: 2.1, kind: 'pop', actor: 'kit', emoji: '😾', dur: 0.5 },
    { at: 3.2, kind: 'burst', actor: 'kit', emoji: '💨', n: 6, dur: 0.4 },
    { at: 3.6, kind: 'sweat', actor: 'big' },
    { at: 4.0, kind: 'pop', actor: 'big', emoji: '💡', dur: 0.4 },
    { at: 4.7, kind: 'pop', actor: 'kit', emoji: '😱', dur: 0.5 },
    { at: 6.6, kind: 'burst', actor: 'kit', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.6, kind: 'pop', actor: 'big', emoji: '😳', dur: 0.8 },
    { at: 9.1, kind: 'pop', actor: 'kit', emoji: '😹', dur: 0.8 },
  ],
  camera: [
    { at: 3.1, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 56, y: 62 } },
  ],
  cues: [
    { at: 0.8, say: '姐' },
    { at: 1.8, sfx: 'poof' },
    { at: 3.2, sfx: 'poof' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 4.7, sfx: 'boing' },
    { at: 6.1, say: '姐' },
    { at: 6.5, sfx: 'blip' },
    { at: 7.1, say: '姐姐' },
    { at: 8.5, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
