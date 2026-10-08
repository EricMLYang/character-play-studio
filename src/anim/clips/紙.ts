import type { Clip } from '../clip'

// 紙：青蛙摺紙飛機。第一架一丟就倒栽蔥；第二架繞一圈飛回來，青蛙以為是蒼蠅，舌頭一伸「咻」吞掉了；第三架終於飛得好直——
// 直直飛進山羊嘴裡被吃掉，山羊嚼一嚼吐出來變成「紙」。青蛙再丟一架漂亮的紙飛機，山羊跳起來半空中又一口吃掉。紙、紙、紙飛機
const clip: Clip = {
  char: '紙',
  meta: { theme: '紙飛機', cast: '青蛙＋紙飛機＋山羊', gags: ['一丟就倒栽蔥', '以為是蒼蠅吞掉', '飛進別人嘴裡', '半空中又被吃'] },
  duration: 10,
  bg: { top: '#FFE7EC', bottom: '#FFCCD6', floor: '#B9A9C9', scenery: 'city' },
  actors: [
    { id: 'goat', emoji: '🐐', x: 136, y: 70.3, size: 16, hidden: true },
    { id: 'frog', emoji: '🐸', x: 22, y: 72, size: 12, hidden: true },
    { id: 'paper', emoji: '📄', x: 30, y: 64, size: 8, hidden: true, float: true },
    { id: 'paper2', emoji: '📄', x: 30, y: 62, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'frog', do: 'pop' },
    { at: 0.2, actor: 'goat', do: 'pop' },
    { at: 0.4, actor: 'paper', do: 'pop' },
    // 摺紙
    { at: 0.9, actor: 'paper', do: 'spin', dur: 0.4 },
    { at: 0.9, actor: 'paper', do: 'squash', amount: 0.4, dur: 0.4 },
    { at: 1.3, actor: 'paper', do: 'rotateTo', amount: -20, dur: 0.15 },
    // 第一架：倒栽蔥
    { at: 1.6, actor: 'frog', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 1.7, actor: 'paper', do: 'moveTo', to: { x: 42, y: 72.5 }, dur: 0.35, arc: 3 },
    { at: 1.7, actor: 'paper', do: 'rotateTo', amount: 90, dur: 0.35 },
    { at: 2.4, actor: 'paper', do: 'moveTo', to: { x: 30, y: 64 }, dur: 0.3, arc: 4 },
    { at: 2.4, actor: 'paper', do: 'rotateTo', amount: -90, dur: 0.3 },
    // 第二架：繞一圈回來，被舌頭吞掉
    { at: 2.8, actor: 'frog', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 2.9, actor: 'paper', do: 'moveTo', to: { x: 72, y: 28 }, dur: 0.4, arc: 6 },
    { at: 3.3, actor: 'paper', do: 'moveTo', to: { x: 54, y: 14 }, dur: 0.3 },
    { at: 3.3, actor: 'paper', do: 'rotateTo', amount: -180, dur: 0.6 },
    { at: 3.6, actor: 'paper', do: 'moveTo', to: { x: 40, y: 40 }, dur: 0.35 },
    { at: 4.0, actor: 'paper', do: 'moveTo', to: { x: 23, y: 70 }, dur: 0.12 },
    { at: 4.12, actor: 'paper', do: 'vanish', dur: 0.08 },
    { at: 4.15, actor: 'frog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 吐出來，再丟一次：直直飛進山羊嘴裡
    { at: 4.6, actor: 'paper', do: 'rotateTo', amount: 180, dur: 0 },
    { at: 4.6, actor: 'paper', do: 'moveTo', to: { x: 30, y: 64 }, dur: 0 },
    { at: 4.6, actor: 'paper', do: 'pop' },
    { at: 4.8, actor: 'frog', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 4.9, actor: 'paper', do: 'moveTo', to: { x: 128, y: 63 }, dur: 0.7 },
    { at: 5.55, actor: 'goat', do: 'hop', amount: 3, dur: 0.2 },
    { at: 5.6, actor: 'paper', do: 'vanish', dur: 0.1 },
    { at: 5.7, actor: 'goat', do: 'shake', amount: 1, dur: 0.5 },
    // 紙飛機
    { at: 7.0, actor: 'paper2', do: 'pop' },
    { at: 7.0, actor: 'paper2', do: 'rotateTo', amount: -20, dur: 0 },
    { at: 7.3, actor: 'frog', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 7.4, actor: 'paper2', do: 'moveTo', to: { x: 80, y: 8 }, dur: 0.8 },
    { at: 8.2, actor: 'paper2', do: 'moveTo', to: { x: 134, y: 30 }, dur: 0.6 },
    { at: 8.2, actor: 'paper2', do: 'rotateTo', amount: 40, dur: 0.6 },
    // 山羊跳起來半空中吃掉
    { at: 8.45, actor: 'goat', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.6, actor: 'goat', do: 'hop', amount: 30, dur: 0.6 },
    { at: 8.85, actor: 'paper2', do: 'vanish', dur: 0.08 },
    { at: 9.2, actor: 'goat', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.3, actor: 'frog', do: 'squash', amount: 0.25, dur: 0.4 },
  ],
  builds: [
    // 山羊吐出來的紙屑：糸、氏
    { at: 5.95, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'goat', color: '#3D7BD9' },
    { at: 6.35, dur: 0.5, strokes: [6, 7, 8, 9], from: 'goat', color: '#F07C2C' },
  ],
  glyph: [{ at: 6.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'frog', emoji: '✈️', dur: 0.6 },
    { at: 2.05, kind: 'puff', actor: 'paper' },
    { at: 2.15, kind: 'pop', actor: 'frog', emoji: '😑', dur: 0.4 },
    { at: 3.75, kind: 'pop', actor: 'frog', emoji: '👀', dur: 0.3 },
    { at: 3.95, kind: 'line', actor: 'frog', target: 'paper', dy: -2, color: '#E2466B', width: 1.4, dur: 0.25 },
    { at: 4.3, kind: 'pop', actor: 'frog', emoji: '😳', dur: 0.4 },
    { at: 4.5, kind: 'burst', actor: 'frog', emoji: '💦', n: 4, dur: 0.4 },
    { at: 5.4, kind: 'pop', actor: 'frog', emoji: '😃', dur: 0.3 },
    { at: 5.7, kind: 'pop', actor: 'frog', emoji: '😱', dur: 0.5 },
    { at: 5.9, kind: 'burst', actor: 'goat', emoji: '📄', n: 5, dur: 0.5, dx: -6 },
    { at: 7.4, kind: 'burst', actor: 'frog', emoji: '✨', n: 5, dur: 0.5 },
    { at: 9.1, kind: 'bubble', actor: 'goat', emoji: '😋', dur: 0.7, dx: -14 },
    { at: 9.3, kind: 'sweat', actor: 'frog' },
  ],
  camera: [
    { at: 3.95, dur: 0.5, do: 'punch', amount: 0.25, to: { x: 26, y: 66 } },
    { at: 5.55, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 132, y: 62 } },
  ],
  cues: [
    { at: 0.9, sfx: 'slide' },
    { at: 1.3, say: '紙' },
    { at: 2.05, sfx: 'plop' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.95, sfx: 'boing' },
    { at: 4.15, sfx: 'gulp' },
    { at: 4.5, sfx: 'poof' },
    { at: 4.9, sfx: 'whoosh' },
    { at: 5.6, sfx: 'gulp' },
    { at: 5.95, sfx: 'crack' },
    { at: 6.85, say: '紙' },
    { at: 7.85, say: '紙飛機' },
    { at: 8.85, sfx: 'gulp' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
