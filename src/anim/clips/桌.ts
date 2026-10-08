import type { Clip } from '../clip'

// 桌：搬家卡車載著一疊家具開過來。急煞車，家具往前滑；壓到石頭，家具跳起來；掉進坑洞，沙發和箱子整個飛上天，摔成一張「桌」。
// 浣熊開心拍桌子，可是沒有椅子……結果剛剛飛走的椅子這時才從天上掉下來，剛好落在旁邊，浣熊一屁股坐上去。桌、桌、桌子
const clip: Clip = {
  char: '桌',
  meta: { theme: '搬家', cast: '浣熊＋搬家卡車＋家具', gags: ['急煞車家具滑', '壓石頭彈起', '掉坑全部飛天', '椅子很晚才掉下來'] },
  duration: 10,
  bg: { top: '#D8F0FF', bottom: '#FFF4DE', floor: '#9EA8B3', scenery: 'city' },
  actors: [
    { id: 'rock', emoji: '🪨', x: 74, y: 74.4, size: 6 },
    { id: 'hole', emoji: '🕳️', x: 100, y: 75.5, size: 9 },
    { id: 'truck', emoji: '🚚', x: 44, y: 67.8, size: 22, hidden: true, flip: true },
    { id: 'couch', emoji: '🛋️', x: 46, y: 50, size: 13, hidden: true, float: true },
    { id: 'box', emoji: '📦', x: 44, y: 40, size: 9, hidden: true, float: true },
    { id: 'chair', emoji: '🪑', x: 46, y: 31, size: 9, hidden: true, float: true },
    { id: 'rac', emoji: '🦝', x: 140, y: 71.1, size: 14, hidden: true },
  ],
  moves: [
    // 卡車載著一疊家具開進來
    { at: 0, actor: 'truck', do: 'enter', from: { x: -30, y: 67.8 }, dur: 1.0 },
    { at: 0, actor: 'couch', do: 'enter', from: { x: -28, y: 50 }, dur: 1.0 },
    { at: 0, actor: 'box', do: 'enter', from: { x: -30, y: 40 }, dur: 1.0 },
    { at: 0, actor: 'chair', do: 'enter', from: { x: -28, y: 31 }, dur: 1.0 },
    { at: 0.2, actor: 'rac', do: 'pop' },
    // 急煞車：家具往前滑
    { at: 1.0, actor: 'truck', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 1.0, actor: 'couch', do: 'moveTo', to: { x: 50, y: 50 }, dur: 0.2 },
    { at: 1.0, actor: 'box', do: 'moveTo', to: { x: 50, y: 40 }, dur: 0.2 },
    { at: 1.0, actor: 'chair', do: 'moveTo', to: { x: 54, y: 31 }, dur: 0.2 },
    { at: 1.0, actor: 'chair', do: 'tilt', amount: 25, dur: 0.5 },
    { at: 1.0, actor: 'box', do: 'tilt', amount: 15, dur: 0.5 },
    // 壓到石頭：家具全部跳起來
    { at: 2.0, actor: 'truck', do: 'moveTo', to: { x: 70, y: 67.8 }, dur: 0.6 },
    { at: 2.0, actor: 'couch', do: 'moveTo', to: { x: 76, y: 50 }, dur: 0.6 },
    { at: 2.0, actor: 'box', do: 'moveTo', to: { x: 76, y: 40 }, dur: 0.6 },
    { at: 2.0, actor: 'chair', do: 'moveTo', to: { x: 80, y: 31 }, dur: 0.6 },
    { at: 2.6, actor: 'truck', do: 'hop', dur: 0.3, amount: 4 },
    { at: 2.6, actor: 'couch', do: 'hop', dur: 0.4, amount: 8 },
    { at: 2.65, actor: 'box', do: 'hop', dur: 0.45, amount: 11 },
    { at: 2.7, actor: 'chair', do: 'hop', dur: 0.5, amount: 14 },
    { at: 2.7, actor: 'chair', do: 'spin', dur: 0.5 },
    // 掉進坑洞：家具整個飛上天
    { at: 3.3, actor: 'truck', do: 'moveTo', to: { x: 94, y: 67.8 }, dur: 0.4 },
    { at: 3.3, actor: 'couch', do: 'moveTo', to: { x: 100, y: 50 }, dur: 0.4 },
    { at: 3.3, actor: 'box', do: 'moveTo', to: { x: 100, y: 40 }, dur: 0.4 },
    { at: 3.3, actor: 'chair', do: 'moveTo', to: { x: 104, y: 31 }, dur: 0.4 },
    { at: 3.7, actor: 'truck', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.75, actor: 'couch', do: 'moveTo', to: { x: 76, y: 12 }, dur: 0.5 },
    { at: 3.75, actor: 'couch', do: 'spin', dur: 0.5, times: 2 },
    { at: 3.75, actor: 'box', do: 'moveTo', to: { x: 92, y: 8 }, dur: 0.5 },
    { at: 3.75, actor: 'box', do: 'spin', dur: 0.5, times: 2 },
    { at: 3.75, actor: 'chair', do: 'moveTo', to: { x: 128, y: -30 }, dur: 0.5 },
    { at: 3.75, actor: 'chair', do: 'spin', dur: 0.5, times: 2 },
    // 卡車開走，浣熊跳起來讓它過
    { at: 4.4, actor: 'truck', do: 'moveTo', to: { x: 200, y: 67.8 }, dur: 0.8 },
    { at: 4.4, actor: 'couch', do: 'vanish', dur: 0.2 },
    { at: 4.4, actor: 'box', do: 'vanish', dur: 0.2 },
    { at: 4.65, actor: 'rac', do: 'hop', dur: 0.5, amount: 22 },
    // 拍桌子
    { at: 6.3, actor: 'rac', do: 'moveTo', to: { x: 118, y: 71.1 }, dur: 0.3 },
    { at: 6.7, actor: 'rac', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 6.95, actor: 'rac', do: 'squash', amount: 0.3, dur: 0.25 },
    // 回馬槍：椅子現在才掉下來
    { at: 8.2, actor: 'chair', do: 'moveTo', to: { x: 134, y: 73.2 }, dur: 0.5 },
    { at: 8.7, actor: 'chair', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.1, actor: 'rac', do: 'moveTo', to: { x: 134, y: 66 }, dur: 0.3, arc: 6 },
    { at: 9.4, actor: 'rac', do: 'squash', amount: 0.25, dur: 0.25 },
  ],
  builds: [
    // 飛上天的箱子 → 上半；沙發 → 木
    { at: 4.4, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'box', color: '#A0522D' },
    { at: 4.8, dur: 0.7, strokes: [6, 7, 8, 9], from: 'couch', color: '#5E8C2A' },
  ],
  glyph: [{ at: 5.6, dur: 0.4, do: 'wobble' }, { at: 6.75, dur: 0.5, do: 'shake' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'rac', emoji: '🍽️', dur: 0.8, dx: -16 },
    { at: 1.1, kind: 'pop', actor: 'rac', emoji: '😬', dur: 0.5 },
    { at: 2.6, kind: 'puff', actor: 'truck' },
    { at: 2.8, kind: 'sweat', actor: 'rac' },
    { at: 3.75, kind: 'burst', actor: 'truck', dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'rac', emoji: '😱', dur: 0.5 },
    { at: 4.4, kind: 'burst', x: 84, y: 14, emoji: '🪵', n: 6, dur: 0.5 },
    { at: 7.4, kind: 'bubble', actor: 'rac', emoji: '🪑', dur: 0.7 },
    { at: 7.6, kind: 'pop', actor: 'rac', emoji: '❓', dur: 0.5, dx: -14 },
    { at: 8.7, kind: 'puff', actor: 'chair' },
    { at: 9.45, kind: 'bubble', actor: 'rac', emoji: '😌', dur: 0.55, dx: -16 },
  ],
  camera: [
    { at: 3.7, dur: 0.5, do: 'shake', amount: 2 },
    { at: 8.7, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.2, sfx: 'rumble' },
    { at: 1.0, sfx: 'slide' },
    { at: 1.3, say: '桌' },
    { at: 2.6, sfx: 'boing' },
    { at: 3.7, sfx: 'bonk' },
    { at: 3.75, sfx: 'whoosh' },
    { at: 4.4, sfx: 'poof' },
    { at: 4.65, sfx: 'boing' },
    { at: 5.6, say: '桌' },
    { at: 6.7, sfx: 'tap' }, { at: 6.95, sfx: 'tap' },
    { at: 7.0, say: '桌子' },
    { at: 8.2, sfx: 'whoosh' },
    { at: 8.7, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
