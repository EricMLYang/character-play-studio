import type { Clip } from '../clip'

// 夜：晚上公雞想睡覺，貓頭鷹、浣熊和蝙蝠卻開起派對：叫牠們小聲一點，安靜三秒又更吵，蝙蝠還飛過來擦過公雞的頭。
// 公雞氣得一叫，閃光把派對球和月亮都震成「夜」。半夜大家玩累睡著了——天亮了，換公雞神清氣爽地大叫，把大家全吵醒。夜、夜、半夜
const clip: Clip = {
  char: '夜',
  meta: { theme: '夜行動物派對', cast: '公雞＋貓頭鷹＋浣熊＋蝙蝠', gags: ['叫小聲反而更吵', '公雞氣到大叫', '天亮換公雞吵醒大家（報仇）'] },
  duration: 10,
  bg: { top: '#1B2050', bottom: '#3A3F7A', floor: '#2E3560', scenery: 'night' },
  actors: [
    { id: 'moon', emoji: '🌙', x: 30, y: 15, size: 12, float: true, top: true },
    { id: 'sun', emoji: '☀️', x: 140, y: 15, size: 13, float: true, hidden: true },
    { id: 'clock', emoji: '🕛', x: 148, y: 30, size: 8, float: true, hidden: true },
    { id: 'disco', emoji: '🪩', x: 132, y: 22, size: 9, float: true, hidden: true, top: true },
    { id: 'rooster', emoji: '🐓', x: 22, y: 71.1, size: 14, flip: true },
    { id: 'owl', emoji: '🦉', x: 120, y: 72, size: 12, top: true },
    { id: 'raccoon', emoji: '🦝', x: 143, y: 71.5, size: 13, top: true },
    { id: 'bat', emoji: '🦇', x: 132, y: 44, size: 10, float: true, top: true },
  ],
  moves: [
    { at: 0.9, actor: 'moon', do: 'flash', dur: 0.6 },
    { at: 0.9, actor: 'moon', do: 'bounce', amount: 2, times: 1, dur: 0.5 },
    // 派對開始
    { at: 1.6, actor: 'disco', do: 'drop', dur: 0.5 },
    { at: 2.0, actor: 'disco', do: 'spin', times: 3, dur: 1.5 },
    { at: 2.0, actor: 'owl', do: 'bounce', amount: 3, times: 4, dur: 0.7 },
    { at: 2.0, actor: 'raccoon', do: 'bounce', amount: 3, times: 4, dur: 0.7 },
    { at: 2.0, actor: 'bat', do: 'bounce', amount: 3, times: 4, dur: 0.7 },
    // 公雞醒來：噓！
    { at: 2.1, actor: 'rooster', do: 'hop', amount: 5, dur: 0.3 },
    { at: 2.7, actor: 'rooster', do: 'shake', amount: 1, dur: 0.4 },
    // 安靜一下……又更吵，蝙蝠擦過公雞的頭
    { at: 3.5, actor: 'bat', do: 'moveTo', to: { x: 26, y: 52 }, arc: 6, dur: 0.4 },
    { at: 3.5, actor: 'owl', do: 'hop', amount: 8, dur: 0.4 },
    { at: 3.5, actor: 'raccoon', do: 'bounce', amount: 4, times: 4, dur: 0.8 },
    { at: 3.6, actor: 'rooster', do: 'hop', amount: 10, dur: 0.4 },
    { at: 3.9, actor: 'bat', do: 'moveTo', to: { x: 132, y: 44 }, arc: 6, dur: 0.4 },
    // 公雞氣得大叫
    { at: 4.1, actor: 'rooster', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.4, actor: 'rooster', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 4.45, actor: 'owl', do: 'hop', amount: 12, dur: 0.45 },
    { at: 4.45, actor: 'owl', do: 'spin', dur: 0.45 },
    { at: 4.45, actor: 'raccoon', do: 'hop', amount: 12, dur: 0.45 },
    { at: 4.45, actor: 'raccoon', do: 'spin', dur: 0.45 },
    { at: 4.45, actor: 'bat', do: 'spin', times: 2, dur: 0.5 },
    { at: 4.5, actor: 'disco', do: 'vanish', dur: 0.25 },
    { at: 5.0, actor: 'moon', do: 'shake', amount: 1.5, dur: 0.4 },
    // 半夜
    { at: 6.9, actor: 'clock', do: 'pop' },
    { at: 7.0, actor: 'clock', do: 'flash', dur: 0.6 },
    { at: 7.0, actor: 'owl', do: 'squash', amount: 0.15, dur: 0.3 },
    // 大家玩累睡著；天亮，公雞報仇
    { at: 8.7, actor: 'moon', do: 'vanish', dur: 0.3 },
    { at: 8.7, actor: 'clock', do: 'vanish', dur: 0.3 },
    { at: 8.8, actor: 'sun', do: 'enter', from: { x: 140, y: 34 }, dur: 0.4 },
    { at: 9.0, actor: 'rooster', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 9.25, actor: 'rooster', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 9.25, actor: 'owl', do: 'hop', amount: 12, dur: 0.45 },
    { at: 9.25, actor: 'raccoon', do: 'hop', amount: 12, dur: 0.45 },
    { at: 9.25, actor: 'bat', do: 'hop', amount: 8, dur: 0.45 },
  ],
  builds: [
    // 震碎的派對球 → 亠＋亻；被震一下的月亮 → 夜的右下
    { at: 4.5, dur: 0.7, strokes: [0, 1, 2, 3], from: 'disco', color: '#FFD447' },
    { at: 5.0, dur: 0.9, strokes: [4, 5, 6, 7], from: 'moon', color: '#C9A2FF' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'rooster', dur: 1.9 },
    { at: 2.0, kind: 'zzz', actor: 'raccoon', emoji: '🎵', dur: 1.4 },
    { at: 2.2, kind: 'pop', actor: 'rooster', emoji: '😠', dur: 0.5 },
    { at: 2.7, kind: 'pop', actor: 'rooster', emoji: '🤫', dur: 0.5 },
    { at: 2.9, kind: 'pop', actor: 'owl', emoji: '😳', dur: 0.4 },
    { at: 3.1, kind: 'zzz', actor: 'rooster', dur: 0.5 },
    { at: 3.5, kind: 'zzz', actor: 'owl', emoji: '🎶', dur: 1.0 },
    { at: 3.75, kind: 'pop', actor: 'rooster', emoji: '💢', dur: 0.4 },
    { at: 4.4, kind: 'burst', actor: 'rooster', emoji: '📢', dx: 12, dy: 4 },
    { at: 4.4, kind: 'burst', actor: 'rooster', emoji: '🎵', n: 7, dur: 0.6, dx: 10 },
    { at: 4.95, kind: 'dizzy', actor: 'owl', dur: 1.0 },
    { at: 7.2, kind: 'pop', actor: 'rooster', emoji: '😩', dur: 0.6 },
    { at: 7.8, kind: 'zzz', actor: 'owl', dur: 1.4 },
    { at: 7.9, kind: 'zzz', actor: 'raccoon', dur: 1.3 },
    { at: 8.0, kind: 'zzz', actor: 'bat', dur: 1.2 },
    { at: 9.25, kind: 'burst', actor: 'rooster', emoji: '📢', dx: 12, dy: 4 },
    { at: 9.3, kind: 'pop', actor: 'owl', emoji: '😵', dur: 0.6 },
    { at: 9.3, kind: 'pop', actor: 'raccoon', emoji: '😵', dur: 0.6, dx: -10 },
  ],
  camera: [
    { at: 4.4, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 26, y: 64 } },
    { at: 4.45, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: 1.7, dur: 0.3, level: 0.45 },
    { at: 4.4, dur: 0.1, level: -0.8 },
    { at: 4.5, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.2, say: '夜' },
    { at: 1.6, sfx: 'plop' },
    { at: 2.0, sfx: 'tap' }, { at: 2.25, sfx: 'tap' }, { at: 2.5, sfx: 'tap' },
    { at: 3.5, sfx: 'whoosh' },
    { at: 3.6, sfx: 'tap' }, { at: 3.85, sfx: 'tap' },
    { at: 4.4, sfx: 'rumble' },
    { at: 4.5, sfx: 'crack' },
    { at: 5.95, say: '夜' },
    { at: 7.0, say: '半夜' },
    { at: 9.25, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
