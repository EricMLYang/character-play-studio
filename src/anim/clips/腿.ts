import type { Clip } from '../clip'

// 腿：跳舞比賽，比誰的腿最厲害。紅鶴單腳轉圈轉到跌倒，毛毛蟲踢踏舞跳太快把自己絆倒，最後沒有腿的蛇扭一扭——評審貓頭鷹給一百分！
// 大家的舞步變成「腿」，冠軍獎品是一支大雞腿，蛇一口吞下去，撐到扭不動還打嗝。腿、腿、雞腿
const clip: Clip = {
  char: '腿',
  meta: { theme: '跳舞比賽', cast: '紅鶴＋毛毛蟲＋蛇＋貓頭鷹評審', gags: ['單腳跌倒', '腳太多絆倒', '反轉：沒腿的贏', '一口吞獎品'] },
  duration: 10,
  bg: { top: '#E4ECFF', bottom: '#FFE1F0', floor: '#C7A3E6', scenery: 'track' },
  actors: [
    { id: 'flam', emoji: '🦩', x: 24, y: 69.4, size: 18, hidden: true },
    { id: 'bug', emoji: '🐛', x: 44, y: 72.8, size: 10, hidden: true },
    { id: 'owl', emoji: '🦉', x: 147, y: 72, size: 12, hidden: true },
    { id: 'snake', emoji: '🐍', x: 96, y: 71.1, size: 14, hidden: true },
    { id: 'leg', emoji: '🍗', x: 124, y: 52, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flam', do: 'enter', from: { x: -15, y: 69.4 }, dur: 0.6 },
    { at: 0.2, actor: 'owl', do: 'pop' },
    // 紅鶴：單腳轉圈、踢腿、跌倒
    { at: 0.8, actor: 'flam', do: 'hop', dur: 0.4, amount: 8 },
    { at: 0.8, actor: 'flam', do: 'spin', dur: 0.4 },
    { at: 1.3, actor: 'flam', do: 'tilt', amount: 25, dur: 0.5 },
    { at: 1.85, actor: 'flam', do: 'tilt', amount: -30, dur: 0.4 },
    { at: 2.25, actor: 'flam', do: 'rotateTo', amount: -75, dur: 0.25 },
    { at: 2.9, actor: 'flam', do: 'rotateTo', amount: 75, dur: 0.25 },
    // 毛毛蟲：踢踏舞太快，絆倒翻肚
    { at: 2.8, actor: 'bug', do: 'pop' },
    { at: 3.0, actor: 'bug', do: 'bounce', dur: 1.0, times: 6, amount: 3 },
    { at: 4.0, actor: 'bug', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 4.7, actor: 'bug', do: 'rotateTo', amount: -180, dur: 0.3 },
    // 沒有腿的蛇扭一扭
    { at: 4.4, actor: 'snake', do: 'enter', from: { x: 190, y: 71.1 }, dur: 0.5 },
    { at: 4.9, actor: 'snake', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 4.9, actor: 'snake', do: 'flash', dur: 0.9 },
    { at: 5.2, actor: 'snake', do: 'tilt', amount: -20, dur: 0.3 },
    { at: 5.5, actor: 'snake', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 5.3, actor: 'owl', do: 'hop', dur: 0.4, amount: 6 },
    { at: 5.3, actor: 'owl', do: 'flash', dur: 0.6 },
    // 蛇退到旁邊
    { at: 6.4, actor: 'snake', do: 'flip' },
    { at: 6.4, actor: 'snake', do: 'moveTo', to: { x: 126, y: 71.1 }, dur: 0.4 },
    { at: 6.8, actor: 'snake', do: 'flip' },
    // 獎品：大雞腿
    { at: 7.4, actor: 'leg', do: 'pop' },
    { at: 7.4, actor: 'owl', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 7.5, actor: 'flam', do: 'hop', dur: 0.3, amount: 4 },
    // 回馬槍：一口吞，撐到扭不動
    { at: 8.4, actor: 'leg', do: 'moveTo', to: { x: 122, y: 66 }, dur: 0.3 },
    { at: 8.7, actor: 'leg', do: 'vanish', dur: 0.1 },
    { at: 8.7, actor: 'snake', do: 'scaleTo', amount: 1.4, dur: 0.3 },
    { at: 8.7, actor: 'snake', do: 'moveTo', to: { x: 128, y: 68.8 }, dur: 0.3 },
    { at: 9.1, actor: 'snake', do: 'tilt', amount: 6, dur: 0.3 },
    { at: 9.2, actor: 'snake', do: 'hop', dur: 0.2, amount: 2 },
    { at: 9.2, actor: 'bug', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
  ],
  builds: [
    // 紅鶴踢腿 → 月；毛毛蟲的腳 → 艮；蛇扭出來 → 辶
    { at: 5.6, dur: 0.5, strokes: [0, 1, 2, 3], from: 'flam', color: '#FF4F98' },
    { at: 5.9, dur: 0.6, strokes: [4, 5, 6, 7, 8, 9], from: 'bug', color: '#25A86B' },
    { at: 6.3, dur: 0.5, strokes: [10, 11, 12], from: 'snake', color: '#EE7F1B' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'pop', actor: 'flam', emoji: '🦵', dur: 0.5 },
    { at: 2.3, kind: 'dizzy', actor: 'flam', dur: 0.6 },
    { at: 2.4, kind: 'pop', actor: 'owl', emoji: '3️⃣', dur: 0.6 },
    { at: 3.0, kind: 'puff', actor: 'bug' },
    { at: 3.5, kind: 'puff', actor: 'bug' },
    { at: 4.2, kind: 'pop', actor: 'owl', emoji: '😬', dur: 0.5 },
    { at: 4.3, kind: 'dizzy', actor: 'bug', dur: 0.5 },
    { at: 5.0, kind: 'burst', actor: 'snake', emoji: '🎵', n: 5, dur: 0.6 },
    { at: 5.4, kind: 'pop', actor: 'owl', emoji: '💯', dur: 0.8 },
    { at: 5.5, kind: 'bubble', actor: 'flam', emoji: '❓', dur: 0.6 },
    { at: 7.4, kind: 'burst', actor: 'leg', emoji: '🎉', n: 6, dur: 0.6 },
    { at: 8.75, kind: 'burst', actor: 'snake', emoji: '💨', n: 5, dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'flam', emoji: '😆', dur: 0.7 },
    { at: 9.3, kind: 'pop', actor: 'snake', emoji: '😵', dur: 0.6 },
  ],
  lights: [
    { at: 5.0, dur: 0.05, level: -0.45 }, { at: 5.06, dur: 0.2, level: 0 },
    { at: 5.3, dur: 0.05, level: -0.45 }, { at: 5.36, dur: 0.2, level: 0 },
    { at: 5.6, dur: 0.05, level: -0.45 }, { at: 5.66, dur: 0.2, level: 0 },
  ],
  camera: [
    { at: 4.9, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 96, y: 62 } },
  ],
  cues: [
    { at: 0.8, sfx: 'whoosh' },
    { at: 1.4, say: '腿' },
    { at: 2.3, sfx: 'plop' },
    { at: 3.0, sfx: 'tap' }, { at: 3.3, sfx: 'tap' }, { at: 3.6, sfx: 'tap' },
    { at: 4.0, sfx: 'bonk' },
    { at: 4.4, sfx: 'slide' },
    { at: 5.4, sfx: 'blip' },
    { at: 6.85, say: '腿' },
    { at: 7.4, sfx: 'poof' },
    { at: 7.85, say: '雞腿' },
    { at: 8.7, sfx: 'gulp' },
    { at: 9.2, sfx: 'hic' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
