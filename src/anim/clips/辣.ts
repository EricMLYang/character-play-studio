import type { Clip } from '../clip'

// 辣：月球上的吃辣大賽，外星人對機器人。外星人咬一口就辣到滿臉通紅，機器人面不改色；外星人不服輸再吃——噴火把機器人烤焦，
// 再吸一口氣往下噴火，整個人像火箭一樣飛上天，火花變成「辣」，再慢慢飄回月球。機器人拿出超大辣椒一口吞，結果自己也變火箭飛走。辣、辣、辣椒
const clip: Clip = {
  char: '辣',
  meta: { theme: '太空吃辣大賽', cast: '外星人＋機器人', gags: ['面不改色', '噴火烤焦對手', '辣到變火箭', '換對手飛走'] },
  duration: 10,
  bg: { top: '#221E4D', bottom: '#3B3275', floor: '#B7B2C8', scenery: 'space' },
  actors: [
    { id: 'alien', emoji: '👽', x: 26, y: 71.5, size: 13, hidden: true },
    { id: 'robot', emoji: '🤖', x: 136, y: 71.5, size: 13, hidden: true },
    { id: 'c1', emoji: '🌶️', x: 36, y: 62, size: 6, hidden: true, float: true },
    { id: 'c2', emoji: '🌶️', x: 126, y: 62, size: 6, hidden: true, float: true },
    { id: 'c3', emoji: '🌶️', x: 36, y: 62, size: 6, hidden: true, float: true },
    { id: 'big', emoji: '🌶️', x: 119, y: 69.4, size: 18, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'pop' },
    { at: 0.15, actor: 'robot', do: 'pop' },
    // 第一回合：外星人
    { at: 0.9, actor: 'c1', do: 'pop', dur: 0.2 },
    { at: 1.15, actor: 'c1', do: 'moveTo', to: { x: 27, y: 67 }, dur: 0.2 },
    { at: 1.35, actor: 'c1', do: 'vanish', dur: 0.1 },
    { at: 1.5, actor: 'alien', do: 'swap', emoji: '🥵' },
    { at: 1.5, actor: 'alien', do: 'hop', dur: 0.35, amount: 6 },
    { at: 1.85, actor: 'alien', do: 'shake', dur: 0.5, amount: 1 },
    // 機器人：面不改色
    { at: 2.2, actor: 'c2', do: 'pop', dur: 0.2 },
    { at: 2.45, actor: 'c2', do: 'moveTo', to: { x: 135, y: 67 }, dur: 0.2 },
    { at: 2.65, actor: 'c2', do: 'vanish', dur: 0.1 },
    // 外星人不服輸，再吃——噴火
    { at: 2.9, actor: 'c3', do: 'pop', dur: 0.2 },
    { at: 3.1, actor: 'c3', do: 'moveTo', to: { x: 27, y: 67 }, dur: 0.15 },
    { at: 3.25, actor: 'c3', do: 'vanish', dur: 0.1 },
    { at: 3.35, actor: 'alien', do: 'flash', dur: 0.4 },
    { at: 3.35, actor: 'alien', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 3.7, actor: 'robot', do: 'shake', dur: 0.5, amount: 1.2 },
    // 吸一口氣，往下噴火，變火箭飛上天
    { at: 4.3, actor: 'alien', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.6, actor: 'alien', do: 'moveTo', to: { x: 26, y: 22 }, dur: 0.5 },
    { at: 5.1, actor: 'alien', do: 'shake', dur: 0.8, amount: 0.8 },
    // 月球重力小，慢慢飄下來
    { at: 6.0, actor: 'alien', do: 'moveTo', to: { x: 26, y: 71.5 }, dur: 1.0 },
    { at: 7.0, actor: 'alien', do: 'swap', emoji: '👽' },
    { at: 7.0, actor: 'alien', do: 'squash', amount: 0.25, dur: 0.25 },
    // 機器人拿出超大辣椒
    { at: 7.1, actor: 'big', do: 'pop', dur: 0.3 },
    { at: 7.4, actor: 'alien', do: 'hop', dur: 0.3, amount: 5 },
    { at: 7.9, actor: 'big', do: 'moveTo', to: { x: 133, y: 68 }, dur: 0.25 },
    { at: 7.9, actor: 'big', do: 'scaleTo', amount: 0.3, dur: 0.3 },
    { at: 8.15, actor: 'big', do: 'vanish', dur: 0.1 },
    { at: 8.3, actor: 'robot', do: 'flash', dur: 0.5 },
    { at: 8.3, actor: 'robot', do: 'shake', dur: 0.5, amount: 1.2 },
    { at: 8.8, actor: 'robot', do: 'moveTo', to: { x: 136, y: -20 }, dur: 0.7 },
    { at: 9.1, actor: 'alien', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
  ],
  builds: [
    // 噴出來的火花 → 辛、束
    { at: 5.0, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'alien', color: '#FF5A1F' },
    { at: 5.4, dur: 0.8, strokes: [7, 8, 9, 10, 11, 12, 13], from: 'alien', color: '#FFC21A' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'alien', emoji: '🏆', dur: 0.6 },
    { at: 1.55, kind: 'sweat', actor: 'alien' },
    { at: 1.6, kind: 'zzz', actor: 'alien', emoji: '💨', dur: 0.8 },
    { at: 2.75, kind: 'pop', actor: 'robot', emoji: '😎', dur: 0.6, dx: -12 },
    { at: 3.6, kind: 'line', actor: 'alien', target: 'robot', dx: 4, dy: -1, color: '#FF7A1A', width: 3, dur: 0.5 },
    { at: 3.7, kind: 'burst', actor: 'robot', emoji: '🔥', n: 6, dur: 0.5, dy: 6 },
    { at: 4.1, kind: 'zzz', actor: 'robot', emoji: '💨', dur: 1.2, dx: -10 },
    { at: 4.15, kind: 'dizzy', actor: 'robot', dur: 1.0 },
    { at: 4.6, kind: 'rain', actor: 'alien', emoji: '🔥', n: 6, dy: 8, dur: 0.9 },
    { at: 4.6, kind: 'puff', actor: 'alien' },
    { at: 6.95, kind: 'puff', actor: 'alien' },
    { at: 7.3, kind: 'pop', actor: 'alien', emoji: '😱', dur: 0.6 },
    { at: 8.0, kind: 'pop', actor: 'robot', emoji: '😎', dur: 0.4, dx: -12 },
    { at: 8.8, kind: 'rain', actor: 'robot', emoji: '🔥', n: 6, dy: 8, dur: 0.8 },
    { at: 9.15, kind: 'pop', actor: 'alien', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 3.6, dur: 0.4, do: 'shake', amount: 1.2 },
    { at: 4.6, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 30, y: 40 } },
  ],
  cues: [
    { at: 1.35, sfx: 'gulp' },
    { at: 1.55, say: '辣' },
    { at: 2.65, sfx: 'gulp' },
    { at: 3.25, sfx: 'gulp' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 3.7, sfx: 'crack' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 6.3, say: '辣' },
    { at: 7.3, say: '辣椒' },
    { at: 8.15, sfx: 'gulp' },
    { at: 8.8, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
