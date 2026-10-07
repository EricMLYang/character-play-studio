import type { Clip } from '../clip'

// 丟：浣熊想把球丟進垃圾桶。第一球太近、第二球飛出畫面砸到貓（喵！），第三球垃圾桶竟然自己跳開。
// 浣熊氣到把球全丟過來變成「丟」；最後一球垃圾桶終於跳起來接住——浣熊開心到自己也跳進垃圾桶。丟、丟、丟球
const clip: Clip = {
  char: '丟',
  meta: { theme: '投籃', cast: '浣熊＋會動的垃圾桶', gags: ['怎麼丟都不進', '畫面外砸到貓', '目標自己閃開', '自己跳進去'] },
  duration: 10,
  bg: { top: '#FFF6E6', bottom: '#FCE6C4', floor: '#E2B57E', scenery: 'city' },
  actors: [
    { id: 'bin', emoji: '🗑️', x: 124, y: 72, size: 12, hidden: true },
    { id: 'peek', emoji: '🦝', x: 140, y: 64, size: 7, hidden: true, float: true },
    { id: 'coon', emoji: '🦝', x: 26, y: 72, size: 12, hidden: true },
    { id: 'b1', emoji: '⚾', x: 35, y: 67, size: 5, hidden: true },
    { id: 'b2', emoji: '⚾', x: 35, y: 67, size: 5, hidden: true },
    { id: 'b3', emoji: '⚾', x: 35, y: 67, size: 5, hidden: true },
    { id: 'b4', emoji: '⚾', x: 35, y: 67, size: 5, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'coon', do: 'enter', dur: 0.6 },
    { at: 0.2, actor: 'bin', do: 'pop' },
    { at: 0.7, actor: 'b1', do: 'pop' },
    // 第一球：太近
    { at: 1.35, actor: 'coon', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 1.5, actor: 'b1', do: 'moveTo', to: { x: 72, y: 74.9 }, dur: 0.5, arc: 18 },
    { at: 2.0, actor: 'b1', do: 'hop', dur: 0.3, amount: 3 },
    // 第二球：太遠，飛出畫面
    { at: 2.6, actor: 'b2', do: 'pop' },
    { at: 2.85, actor: 'coon', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 3.0, actor: 'b2', do: 'moveTo', to: { x: 180, y: 26 }, dur: 0.55, arc: 26 },
    // 第三球：垃圾桶自己跳開
    { at: 4.0, actor: 'b3', do: 'pop' },
    { at: 4.2, actor: 'coon', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 4.35, actor: 'b3', do: 'moveTo', to: { x: 124, y: 74.9 }, dur: 0.5, arc: 16 },
    { at: 4.5, actor: 'bin', do: 'moveTo', to: { x: 140, y: 72 }, dur: 0.2, arc: 6 },
    // 氣到全丟過來 → 丟
    { at: 5.15, actor: 'coon', do: 'shake', dur: 0.4, amount: 1 },
    { at: 5.2, actor: 'b1', do: 'vanish' },
    { at: 5.5, actor: 'b3', do: 'vanish' },
    // 最後一球：垃圾桶跳起來接住
    { at: 6.3, actor: 'b4', do: 'pop' },
    { at: 6.45, actor: 'coon', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 6.6, actor: 'b4', do: 'moveTo', to: { x: 140, y: 62 }, dur: 0.5, arc: 16 },
    { at: 6.85, actor: 'bin', do: 'hop', dur: 0.35, amount: 6 },
    { at: 7.1, actor: 'b4', do: 'vanish', dur: 0.05 },
    { at: 7.2, actor: 'coon', do: 'bounce', dur: 0.6, times: 2, amount: 3 },
    // 開心到自己也跳進去
    { at: 8.3, actor: 'coon', do: 'moveTo', to: { x: 140, y: 64 }, dur: 0.5, arc: 24 },
    { at: 8.3, actor: 'coon', do: 'spin', dur: 0.5 },
    { at: 8.8, actor: 'coon', do: 'vanish', dur: 0.05 },
    { at: 8.85, actor: 'bin', do: 'shake', dur: 0.4, amount: 1 },
    { at: 9.3, actor: 'peek', do: 'pop' },
  ],
  builds: [
    { at: 5.2, dur: 0.5, strokes: [0, 1, 2], from: 'b1', color: '#D9483B' },
    { at: 5.5, dur: 0.6, strokes: [3, 4, 5], from: 'b3', color: '#2F7FD0' },
  ],
  glyph: [{ at: 6.1, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'coon', emoji: '🗑️', dur: 0.5 },
    { at: 2.2, kind: 'bubble', actor: 'coon', emoji: '😅', dur: 0.4 },
    { at: 3.55, kind: 'burst', x: 154, y: 30, dur: 0.5 },
    { at: 3.6, kind: 'burst', x: 146, y: 40, emoji: '🙀', dur: 0.7 },
    { at: 4.7, kind: 'pop', actor: 'bin', emoji: '😜', dur: 0.6 },
    { at: 5.0, kind: 'pop', actor: 'coon', emoji: '💢', dur: 0.5 },
    { at: 7.1, kind: 'burst', actor: 'bin', emoji: '🎉', n: 6, dur: 0.6 },
    { at: 8.0, kind: 'bubble', actor: 'coon', emoji: '😋', dur: 0.4 },
    { at: 9.4, kind: 'pop', actor: 'peek', emoji: '❤️', dur: 0.6 },
  ],
  camera: [
    { at: 3.55, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 8.8, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 138, y: 64 } },
  ],
  cues: [
    { at: 1.5, sfx: 'whoosh' },
    { at: 1.55, say: '丟' },
    { at: 2.0, sfx: 'plop' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 3.55, sfx: 'bonk' }, { at: 3.65, sfx: 'slide' },
    { at: 4.35, sfx: 'whoosh' }, { at: 4.5, sfx: 'boing' },
    { at: 5.95, say: '丟' },
    { at: 6.9, say: '丟球' },
    { at: 7.1, sfx: 'cheer' },
    { at: 8.85, sfx: 'bonk' },
    { at: 9.3, sfx: 'blip' },
  ],
}

export default clip
