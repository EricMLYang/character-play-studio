import type { Clip } from '../clip'

// 夜：晚上公雞想睡覺，貓頭鷹、浣熊和蝙蝠卻開起派對：叫牠們小聲一點，安靜三秒又更吵，蝙蝠還飛過來擦過公雞的頭。
// 公雞氣得一叫，閃光把派對球和月亮都震成「夜」。半夜大家玩累睡著了——天亮了，換公雞神清氣爽地大叫，把大家全吵醒。夜、夜、半夜
const clip: Clip = {
  char: '夜',
  meta: { theme: '夜行動物派對', cast: '公雞＋貓頭鷹＋浣熊＋蝙蝠', gags: ['叫小聲反而更吵', '公雞氣到大叫', '天亮換公雞吵醒大家（報仇）'] },
  duration: 10,
  bg: { top: '#1B2050', bottom: '#3A3F7A', floor: '#2E3560', scenery: 'night' },
  actors: [
    { id: 'moon', emoji: '🌙', x: 30, y: 15, size: 15, float: true, top: true },
    { id: 'sun', emoji: '☀️', x: 140, y: 15, size: 16.2, float: true, hidden: true },
    { id: 'clock', emoji: '🕛', x: 148, y: 30, size: 10, float: true, hidden: true },
    { id: 'disco', emoji: '🪩', x: 132, y: 22, size: 11.2, float: true, hidden: true, top: true },
    { id: 'rooster', emoji: '🐓', x: 22, y: 69.6, size: 17.5, flip: true },
    { id: 'owl', emoji: '🦉', x: 120, y: 70.7, size: 15, top: true },
    { id: 'raccoon', emoji: '🦝', x: 143, y: 70.2, size: 16.2, top: true },
    { id: 'bat', emoji: '🦇', x: 132, y: 44, size: 12.5, float: true, top: true },
  ],
  moves: [
    { at: 0.9, actor: 'moon', do: 'flash', dur: 0.6 },
    { at: 0.9, actor: 'moon', do: 'bounce', amount: 2, times: 1, dur: 0.5 },
    // 派對開始
    { at: 1.6, actor: 'disco', do: 'drop', dur: 0.5 },
    { at: 2, actor: 'disco', do: 'spin', times: 3, dur: 1.5 },
    { at: 2, actor: 'owl', do: 'bounce', amount: 3, times: 4, dur: 0.7 },
    { at: 2, actor: 'raccoon', do: 'bounce', amount: 3, times: 4, dur: 0.7 },
    { at: 2, actor: 'bat', do: 'bounce', amount: 3, times: 4, dur: 0.7 },
    // 公雞醒來：噓！
    { at: 2.12, actor: 'rooster', do: 'hop', amount: 5, dur: 0.3 },
    { at: 2.84, actor: 'rooster', do: 'shake', amount: 1, dur: 0.4 },
    // 安靜一下……又更吵，蝙蝠擦過公雞的頭
    { at: 3.8, actor: 'bat', do: 'moveTo', to: { x: 26, y: 52 }, arc: 6, dur: 0.4 },
    { at: 3.8, actor: 'owl', do: 'hop', amount: 8, dur: 0.4 },
    { at: 3.8, actor: 'raccoon', do: 'bounce', amount: 4, times: 4, dur: 0.8 },
    { at: 3.92, actor: 'rooster', do: 'hop', amount: 10, dur: 0.4 },
    { at: 4.28, actor: 'bat', do: 'moveTo', to: { x: 132, y: 44 }, arc: 6, dur: 0.4 },
    // 公雞氣得大叫
    { at: 4.52, actor: 'rooster', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.88, actor: 'rooster', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 4.94, actor: 'owl', do: 'hop', amount: 12, dur: 0.45 },
    { at: 4.94, actor: 'owl', do: 'spin', dur: 0.45 },
    { at: 4.94, actor: 'raccoon', do: 'hop', amount: 12, dur: 0.45 },
    { at: 4.94, actor: 'raccoon', do: 'spin', dur: 0.45 },
    { at: 4.94, actor: 'bat', do: 'spin', times: 2, dur: 0.5 },
    { at: 5, actor: 'disco', do: 'vanish', dur: 0.25 },
    { at: 5.48, actor: 'moon', do: 'shake', amount: 1.5, dur: 0.4 },
    // 半夜
    { at: 7.4, actor: 'clock', do: 'pop' },
    { at: 7.5, actor: 'clock', do: 'flash', dur: 0.6 },
    { at: 7.5, actor: 'owl', do: 'squash', amount: 0.15, dur: 0.3 },
    // 大家玩累睡著；天亮，公雞報仇
    { at: 8.92, actor: 'moon', do: 'vanish', dur: 0.3 },
    { at: 8.92, actor: 'clock', do: 'vanish', dur: 0.3 },
    { at: 9, actor: 'sun', do: 'enter', from: { x: 140, y: 34 }, dur: 0.4 },
    { at: 9.17, actor: 'rooster', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 9.38, actor: 'rooster', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 9.38, actor: 'owl', do: 'hop', amount: 12, dur: 0.45 },
    { at: 9.38, actor: 'raccoon', do: 'hop', amount: 12, dur: 0.45 },
    { at: 9.38, actor: 'bat', do: 'hop', amount: 8, dur: 0.45 },
  ],
  builds: [
    // 震碎的派對球 → 亠＋亻；被震一下的月亮 → 夜的右下
    { at: 5, dur: 0.7, strokes: [0, 1, 2, 3], from: 'disco', color: '#FFD447' },
    { at: 5.48, dur: 0.9, strokes: [4, 5, 6, 7], from: 'moon', color: '#C9A2FF' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.58, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'rooster', dur: 1.9 },
    { at: 2, kind: 'zzz', actor: 'raccoon', emoji: '🎵', dur: 1.4 },
    { at: 2.24, kind: 'pop', actor: 'rooster', emoji: '😠', dur: 0.5 },
    { at: 2.84, kind: 'pop', actor: 'rooster', emoji: '🤫', dur: 0.5 },
    { at: 3.08, kind: 'pop', actor: 'owl', emoji: '😳', dur: 0.4 },
    { at: 3.32, kind: 'zzz', actor: 'rooster', dur: 0.5 },
    { at: 3.8, kind: 'zzz', actor: 'owl', emoji: '🎶', dur: 1.0 },
    { at: 4.1, kind: 'pop', actor: 'rooster', emoji: '💢', dur: 0.4 },
    { at: 4.88, kind: 'burst', actor: 'rooster', emoji: '📢', dx: 12, dy: 4 },
    { at: 4.88, kind: 'burst', actor: 'rooster', emoji: '🎵', n: 7, dur: 0.6, dx: 10 },
    { at: 5.43, kind: 'dizzy', actor: 'owl', dur: 1.0 },
    { at: 7.67, kind: 'pop', actor: 'rooster', emoji: '😩', dur: 0.6 },
    { at: 8.17, kind: 'zzz', actor: 'owl', dur: 1.4 },
    { at: 8.25, kind: 'zzz', actor: 'raccoon', dur: 1.3 },
    { at: 8.33, kind: 'zzz', actor: 'bat', dur: 1.2 },
    { at: 9.38, kind: 'burst', actor: 'rooster', emoji: '📢', dx: 12, dy: 4 },
    { at: 9.42, kind: 'pop', actor: 'owl', emoji: '😵', dur: 0.6 },
    { at: 9.42, kind: 'pop', actor: 'raccoon', emoji: '😵', dur: 0.6, dx: -10 },
  ],
  camera: [
    { at: 4.88, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 26, y: 64 } },
    { at: 4.94, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: 1.7, dur: 0.3, level: 0.45 },
    { at: 4.88, dur: 0.1, level: -0.8 },
    { at: 5, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.2, say: '夜' },
    { at: 1.6, sfx: 'plop' },
    { at: 2, sfx: 'tap' }, { at: 2.3, sfx: 'tap' }, { at: 2.6, sfx: 'tap' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 3.92, sfx: 'tap' }, { at: 4.22, sfx: 'tap' },
    { at: 4.88, sfx: 'rumble' },
    { at: 5, sfx: 'crack' },
    { at: 6.4, say: '夜' },
    { at: 7.5, say: '半夜' },
    { at: 9.38, sfx: 'boing' },
    { at: 9.67, sfx: 'cheer' },
  ],
}

export default clip
