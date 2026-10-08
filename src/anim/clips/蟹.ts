import type { Clip } from '../clip'

// 蟹：螃蟹想過斑馬線去買冰淇淋，學人「轉身面向前方」再走——結果橫著往天上走！轉回來小步小步橫走，汽車衝過來急煞，
// 螃蟹一緊張從車底「咻」地橫衝過去，踢飛的斑馬線變成「蟹」。烏龜導護這才慢吞吞來舉綠燈，螃蟹又學人轉身——又往天上走了。蟹、蟹、螃蟹
const clip: Clip = {
  char: '蟹',
  meta: { theme: '過馬路', cast: '螃蟹＋汽車＋烏龜導護', gags: ['轉身走錯方向往上走', '急煞車', '踢飛斑馬線', '同一招再錯一次'] },
  duration: 10,
  bg: { top: '#FFE9E0', bottom: '#FFF7EC', floor: '#8C8C99', scenery: 'city' },
  actors: [
    { id: 'light', emoji: '🚦', x: 14, y: 71.1, size: 14, hidden: true },
    { id: 'cream', emoji: '🍦', x: 144, y: 72.8, size: 10, hidden: true },
    { id: 's1', emoji: '⬜', x: 64, y: 75.5, size: 7, hidden: true, float: true },
    { id: 's2', emoji: '⬜', x: 80, y: 75.5, size: 7, hidden: true, float: true },
    { id: 's3', emoji: '⬜', x: 96, y: 75.5, size: 7, hidden: true, float: true },
    { id: 'car', emoji: '🚗', x: 100, y: 71.5, size: 13, hidden: true },
    { id: 'turtle', emoji: '🐢', x: 30, y: 72.8, size: 10, hidden: true, flip: true },
    { id: 'crab', emoji: '🦀', x: 28, y: 73.2, size: 9, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'light', do: 'pop' },
    { at: 0.1, actor: 's1', do: 'pop' }, { at: 0.2, actor: 's2', do: 'pop' }, { at: 0.3, actor: 's3', do: 'pop' },
    { at: 0.3, actor: 'cream', do: 'pop' },
    { at: 0, actor: 'crab', do: 'enter', from: { x: -10, y: 73.2 }, dur: 0.6 },
    { at: 1.2, actor: 'crab', do: 'hop', amount: 5, dur: 0.3 },
    // 學人轉身面向前方……往天上走
    { at: 1.7, actor: 'crab', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 1.7, actor: 'crab', do: 'moveTo', to: { x: 28, y: 66 }, dur: 0.3 },
    { at: 2.1, actor: 'crab', do: 'moveTo', to: { x: 28, y: 50 }, dur: 0.35 },
    { at: 2.5, actor: 'crab', do: 'moveTo', to: { x: 28, y: 66 }, dur: 0.25 },
    { at: 2.85, actor: 'crab', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 2.85, actor: 'crab', do: 'moveTo', to: { x: 28, y: 73.2 }, dur: 0.25 },
    // 小步小步橫著走
    { at: 3.5, actor: 'crab', do: 'moveTo', to: { x: 36, y: 73.2 }, dur: 0.25 },
    { at: 3.8, actor: 'crab', do: 'moveTo', to: { x: 44, y: 73.2 }, dur: 0.25 },
    { at: 4.1, actor: 'crab', do: 'moveTo', to: { x: 52, y: 73.2 }, dur: 0.25 },
    // 汽車衝過來急煞
    { at: 4.2, actor: 'car', do: 'enter', from: { x: 185, y: 71.5 }, dur: 0.5 },
    { at: 4.65, actor: 'car', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 4.7, actor: 'car', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 4.75, actor: 'crab', do: 'shake', amount: 1, dur: 0.3 },
    // 從車底橫衝過去，踢飛斑馬線
    { at: 5.05, actor: 'crab', do: 'moveTo', to: { x: 128, y: 73.2 }, dur: 0.35 },
    { at: 5.1, actor: 's1', do: 'vanish', dur: 0.15 },
    { at: 5.4, actor: 's2', do: 'vanish', dur: 0.15 },
    { at: 5.75, actor: 's3', do: 'vanish', dur: 0.15 },
    { at: 5.3, actor: 'car', do: 'spin', dur: 0.5 },
    { at: 5.9, actor: 'car', do: 'moveTo', to: { x: 185, y: 71.5 }, dur: 0.4 },
    // 拿到冰淇淋
    { at: 6.9, actor: 'crab', do: 'moveTo', to: { x: 134, y: 73.2 }, dur: 0.2 },
    { at: 7.0, actor: 'cream', do: 'moveTo', to: { x: 134, y: 64 }, dur: 0.3 },
    { at: 7.2, actor: 'crab', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.2, actor: 'cream', do: 'hop', amount: 4, dur: 0.3 },
    // 烏龜導護慢吞吞來了
    { at: 8.0, actor: 'turtle', do: 'enter', from: { x: -12, y: 72.8 }, dur: 0.8 },
    { at: 8.0, actor: 'light', do: 'flash', dur: 0.6 },
    // 又學人轉身——又往天上走
    { at: 9.1, actor: 'crab', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 9.1, actor: 'crab', do: 'moveTo', to: { x: 134, y: 66 }, dur: 0.2 },
    { at: 9.35, actor: 'crab', do: 'moveTo', to: { x: 134, y: 52 }, dur: 0.3 },
    { at: 9.35, actor: 'cream', do: 'moveTo', to: { x: 142, y: 48 }, dur: 0.3 },
  ],
  builds: [
    // 踢飛的斑馬線 → 角、刀牛、虫
    { at: 5.1, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6], from: 's1', color: '#E8453C' },
    { at: 5.4, dur: 0.6, strokes: [7, 8, 9, 10, 11, 12], from: 's2', color: '#2D7DD2' },
    { at: 5.75, dur: 0.6, strokes: [13, 14, 15, 16, 17, 18], from: 's3', color: '#F5A623' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'crab' },
    { at: 0.8, kind: 'bubble', actor: 'crab', emoji: '🍦', dur: 0.7 },
    { at: 2.5, kind: 'sweat', actor: 'crab' },
    { at: 2.9, kind: 'pop', actor: 'crab', emoji: '❓', dur: 0.4 },
    { at: 3.3, kind: 'pop', actor: 'crab', emoji: '💡', dur: 0.3 },
    { at: 4.45, kind: 'pop', actor: 'crab', emoji: '😱', dur: 0.5 },
    { at: 4.65, kind: 'puff', actor: 'car' },
    { at: 5.05, kind: 'puff', actor: 'crab' },
    { at: 5.4, kind: 'dizzy', actor: 'car', dur: 0.5 },
    { at: 7.2, kind: 'burst', actor: 'crab', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'turtle', emoji: '🟢', dur: 0.7 },
    { at: 8.5, kind: 'bubble', actor: 'crab', emoji: '😑', dur: 0.5 },
    { at: 9.5, kind: 'pop', actor: 'turtle', emoji: '😮', dur: 0.5 },
  ],
  camera: [
    { at: 4.7, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 76, y: 64 } },
  ],
  cues: [
    { at: 0.6, sfx: 'tap' },
    { at: 1.3, say: '蟹' },
    { at: 2.1, sfx: 'boing' },
    { at: 2.75, sfx: 'plop' },
    { at: 3.5, sfx: 'tap' }, { at: 3.8, sfx: 'tap' }, { at: 4.1, sfx: 'tap' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 4.6, sfx: 'slide' },
    { at: 5.05, sfx: 'whoosh' },
    { at: 6.35, say: '蟹' },
    { at: 7.0, sfx: 'clink' },
    { at: 7.35, say: '螃蟹' },
    { at: 8.3, sfx: 'blip' },
    { at: 9.35, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
