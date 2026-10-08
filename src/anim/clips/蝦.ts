import type { Clip } from '../clip'

// 蝦：小蝦子想游去拿右邊的貝殼，一用力卻「咻」地往後彈，再用力就往後撞上石頭。牠靈機一動轉身背對貝殼再彈——
// 這次彈太遠，撞醒貝殼旁的河豚，河豚氣得鼓成刺球。最後大龍蝦來示範怎麼往前走，結果也咻地往後飛出畫面。蝦、蝦、龍蝦
const clip: Clip = {
  char: '蝦',
  meta: { theme: '海底游泳', cast: '小蝦＋河豚＋龍蝦', gags: ['越用力越往後彈', '轉身倒著游', '撞醒河豚鼓成刺球', '大龍蝦也往後飛'] },
  duration: 10,
  bg: { top: '#C7F0F7', bottom: '#7FCBE3', floor: '#E9D6A6', scenery: 'ocean' },
  actors: [
    { id: 'rock', emoji: '🪨', x: 8, y: 72, size: 12 },
    { id: 'shell', emoji: '🐚', x: 132, y: 72.8, size: 10, hidden: true },
    { id: 'puffer', emoji: '🐡', x: 148, y: 60, size: 10, float: true, hidden: true },
    { id: 'lobster', emoji: '🦞', x: 30, y: 70, size: 15, hidden: true, flip: true },
    { id: 'shrimp', emoji: '🦐', x: 40, y: 62, size: 11, float: true, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'shrimp', do: 'pop' },
    { at: 0.2, actor: 'shell', do: 'pop' },
    { at: 0.3, actor: 'puffer', do: 'pop' },
    { at: 0.3, actor: 'shrimp', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 第一次：蓄力往前……咻地往後
    { at: 1.0, actor: 'shrimp', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 1.35, actor: 'shrimp', do: 'moveTo', to: { x: 22, y: 62 }, dur: 0.25 },
    { at: 1.6, actor: 'shrimp', do: 'shake', amount: 1, dur: 0.3 },
    // 第二次：更用力，往後撞上石頭
    { at: 2.3, actor: 'shrimp', do: 'squash', amount: -0.45, dur: 0.4 },
    { at: 2.7, actor: 'shrimp', do: 'moveTo', to: { x: 14, y: 64 }, dur: 0.15 },
    { at: 2.85, actor: 'rock', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 2.85, actor: 'shrimp', do: 'moveTo', to: { x: 22, y: 62 }, dur: 0.3, arc: 4 },
    // 靈機一動：轉身背對貝殼，倒著彈過去——彈太遠
    { at: 3.6, actor: 'shrimp', do: 'flip' },
    { at: 3.75, actor: 'shrimp', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 4.05, actor: 'shrimp', do: 'moveTo', to: { x: 140, y: 62 }, dur: 0.35 },
    { at: 4.4, actor: 'puffer', do: 'scaleTo', amount: 1.9, dur: 0.25 },
    { at: 4.4, actor: 'puffer', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.4, actor: 'shrimp', do: 'moveTo', to: { x: 120, y: 64 }, dur: 0.4, arc: 8 },
    { at: 4.4, actor: 'shrimp', do: 'spin', times: 2, dur: 0.4 },
    // 大龍蝦登場示範
    { at: 6.2, actor: 'lobster', do: 'enter', from: { x: -20, y: 70 }, dur: 0.5 },
    { at: 6.8, actor: 'lobster', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 7.6, actor: 'lobster', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 8.0, actor: 'lobster', do: 'moveTo', to: { x: -30, y: 70 }, dur: 0.3 },
    { at: 8.6, actor: 'puffer', do: 'scaleTo', amount: 1 / 1.9, dur: 0.4 },
    { at: 8.7, actor: 'shrimp', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
  ],
  builds: [
    // 一路噴出的泡泡 → 虫；河豚的刺 → 叚
    { at: 4.1, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5], from: { x: 70, y: 62 }, color: '#E8604C' },
    { at: 4.75, dur: 0.95, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14], from: 'puffer', color: '#F29E4C' },
  ],
  glyph: [{ at: 5.7, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'shrimp', emoji: '🐚', dur: 0.6 },
    { at: 1.35, kind: 'puff', actor: 'shrimp' },
    { at: 1.75, kind: 'pop', actor: 'shrimp', emoji: '❓', dur: 0.5 },
    { at: 0.6, kind: 'zzz', actor: 'puffer', dur: 3.6 },
    { at: 2.85, kind: 'burst', actor: 'rock', dur: 0.4 },
    { at: 3.0, kind: 'dizzy', actor: 'shrimp', dur: 0.6 },
    { at: 3.5, kind: 'pop', actor: 'shrimp', emoji: '💡', dur: 0.4 },
    { at: 4.05, kind: 'burst', actor: 'shrimp', emoji: '🫧', n: 6, dur: 0.5 },
    { at: 4.4, kind: 'burst', actor: 'puffer', dur: 0.4, dx: -4 },
    { at: 4.8, kind: 'pop', actor: 'puffer', emoji: '💢', dur: 0.8, dx: -14, dy: 6 },
    { at: 5.0, kind: 'sweat', actor: 'shrimp' },
    { at: 6.8, kind: 'pop', actor: 'lobster', emoji: '😎', dur: 0.7 },
    { at: 7.0, kind: 'pop', actor: 'shrimp', emoji: '😲', dur: 0.6 },
    { at: 7.6, kind: 'puff', actor: 'lobster' },
    { at: 8.7, kind: 'bubble', actor: 'shrimp', emoji: '😆', dur: 0.8, dx: -12 },
  ],
  camera: [
    { at: 4.4, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 135, y: 60 } },
    { at: 8.35, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.35, sfx: 'whoosh' },
    { at: 1.6, say: '蝦' },
    { at: 2.7, sfx: 'whoosh' },
    { at: 2.85, sfx: 'bonk' },
    { at: 4.05, sfx: 'whoosh' },
    { at: 4.4, sfx: 'boing' },
    { at: 5.75, say: '蝦' },
    { at: 6.9, say: '龍蝦' },
    { at: 8.0, sfx: 'whoosh' },
    { at: 8.35, sfx: 'bonk' },
    { at: 8.6, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
