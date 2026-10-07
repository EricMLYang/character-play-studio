import type { Clip } from '../clip'

// 閃：忍者是閃避高手：飛鏢從上面來就跳、從中間來就蹲、兩支一起來就「碰」變成木頭。得意擺姿勢，結果踩到香蕉皮滑倒。
// 打雷了，閃電劈下來又變木頭躲過；鬆一口氣往前走——又踩到同一片香蕉皮。閃、閃、閃電
const clip: Clip = {
  char: '閃',
  meta: { theme: '忍者', cast: '忍者', gags: ['閃避高手', '變身木頭', '踩到香蕉皮', '同一個坑跌兩次'] },
  duration: 10,
  bg: { top: '#FFF1E2', bottom: '#FFDFC0', floor: '#D8B184', scenery: 'room' },
  actors: [
    { id: 'banana', emoji: '🍌', x: 42, y: 74.6, size: 6, hidden: true },
    { id: 'ninja', emoji: '🥷', x: 28, y: 71.5, size: 13, hidden: true },
    { id: 's1', emoji: '⭐', x: 170, y: 64, size: 6, hidden: true, float: true },
    { id: 's2', emoji: '⭐', x: 170, y: 61, size: 6, hidden: true, float: true },
    { id: 's3', emoji: '⭐', x: 170, y: 64, size: 6, hidden: true, float: true },
    { id: 's4', emoji: '⭐', x: 170, y: 71, size: 6, hidden: true, float: true },
    { id: 'cloud', emoji: '⛈️', x: 30, y: 26, size: 16, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'ninja', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.5 },
    { at: 0, actor: 'ninja', do: 'spin', dur: 0.5 },
    // 上面來：跳
    { at: 1.0, actor: 's1', do: 'pop', dur: 0.05 },
    { at: 1.0, actor: 's1', do: 'moveTo', to: { x: -10, y: 64 }, dur: 0.8 },
    { at: 1.0, actor: 's1', do: 'spin', dur: 0.8, times: 4 },
    { at: 1.4, actor: 'ninja', do: 'hop', dur: 0.45, amount: 14 },
    // 中間來：蹲
    { at: 2.2, actor: 's2', do: 'pop', dur: 0.05 },
    { at: 2.2, actor: 's2', do: 'moveTo', to: { x: -10, y: 61 }, dur: 0.8 },
    { at: 2.2, actor: 's2', do: 'spin', dur: 0.8, times: 4 },
    { at: 2.6, actor: 'ninja', do: 'squash', amount: 0.55, dur: 0.5 },
    // 兩支一起：碰！變木頭，飛鏢插在木頭上
    { at: 3.3, actor: 's3', do: 'pop', dur: 0.05 }, { at: 3.3, actor: 's4', do: 'pop', dur: 0.05 },
    { at: 3.3, actor: 's3', do: 'moveTo', to: { x: 31, y: 65 }, dur: 0.6 },
    { at: 3.3, actor: 's4', do: 'moveTo', to: { x: 31, y: 70 }, dur: 0.6 },
    { at: 3.3, actor: 's3', do: 'spin', dur: 0.6, times: 3 }, { at: 3.3, actor: 's4', do: 'spin', dur: 0.6, times: 3 },
    { at: 3.6, actor: 'ninja', do: 'swap', emoji: '🪵' },
    { at: 3.9, actor: 'ninja', do: 'shake', dur: 0.3, amount: 0.8 },
    // 變回來：飛鏢還插在身上
    { at: 4.3, actor: 'ninja', do: 'swap', emoji: '🥷' },
    { at: 4.6, actor: 's3', do: 'vanish' }, { at: 4.6, actor: 's4', do: 'vanish' },
    // 擺帥氣姿勢……踩到香蕉皮
    { at: 5.3, actor: 'banana', do: 'pop', dur: 0.2 },
    { at: 5.6, actor: 'ninja', do: 'moveTo', to: { x: 40, y: 71.5 }, dur: 0.2 },
    { at: 5.8, actor: 'ninja', do: 'hop', dur: 0.5, amount: 12 },
    { at: 5.8, actor: 'ninja', do: 'rotateTo', amount: 90, dur: 0.5 },
    { at: 5.8, actor: 'banana', do: 'moveTo', to: { x: 22, y: 74.6 }, dur: 0.4 },
    { at: 6.6, actor: 'ninja', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 6.6, actor: 'ninja', do: 'moveTo', to: { x: 30, y: 71.5 }, dur: 0.25 },
    // 打雷：再變木頭躲過
    { at: 6.8, actor: 'cloud', do: 'pop', dur: 0.3 },
    { at: 7.15, actor: 'ninja', do: 'swap', emoji: '🪵' },
    { at: 7.3, actor: 'ninja', do: 'shake', dur: 0.4, amount: 1 },
    { at: 7.9, actor: 'ninja', do: 'swap', emoji: '🥷' },
    { at: 8.0, actor: 'cloud', do: 'vanish', dur: 0.3 },
    // 鬆一口氣往前走——又是同一片香蕉皮
    { at: 8.5, actor: 'ninja', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.3 },
    { at: 8.8, actor: 'ninja', do: 'hop', dur: 0.45, amount: 10 },
    { at: 8.8, actor: 'ninja', do: 'rotateTo', amount: -90, dur: 0.45 },
    { at: 8.8, actor: 'banana', do: 'moveTo', to: { x: 6, y: 74.6 }, dur: 0.35 },
  ],
  builds: [
    // 身上的飛鏢拔下來 → 門；滑倒的忍者 → 人
    { at: 4.6, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: { x: 31, y: 67 }, color: '#5A4BB8' },
    { at: 5.9, dur: 0.5, strokes: [8, 9], from: 'ninja', color: '#E2563A' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'puff', actor: 'ninja' },
    { at: 3.55, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.5 },
    { at: 4.25, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.5 },
    { at: 4.4, kind: 'sweat', actor: 'ninja' },
    { at: 5.0, kind: 'bubble', actor: 'ninja', emoji: '😎', dur: 0.6 },
    { at: 6.3, kind: 'dizzy', actor: 'ninja', dur: 0.5 },
    { at: 7.1, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.4 },
    { at: 7.2, kind: 'zap', actor: 'cloud', target: 'ninja', dur: 0.35 },
    { at: 7.3, kind: 'burst', actor: 'ninja', dur: 0.4 },
    { at: 7.85, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.4 },
    { at: 8.0, kind: 'bubble', actor: 'ninja', emoji: '😮‍💨', dur: 0.5 },
    { at: 9.25, kind: 'dizzy', actor: 'ninja', dur: 0.75 },
  ],
  camera: [
    { at: 3.6, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 30, y: 64 } },
    { at: 7.2, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.0, sfx: 'whoosh' },
    { at: 1.55, say: '閃' },
    { at: 2.2, sfx: 'whoosh' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.6, sfx: 'poof' },
    { at: 3.9, sfx: 'bonk' },
    { at: 4.3, sfx: 'poof' },
    { at: 5.8, sfx: 'slide' },
    { at: 6.25, sfx: 'bonk' },
    { at: 6.4, say: '閃' },
    { at: 7.15, sfx: 'poof' },
    { at: 7.2, sfx: 'rumble' },
    { at: 7.35, say: '閃電' },
    { at: 8.8, sfx: 'slide' },
    { at: 9.25, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
