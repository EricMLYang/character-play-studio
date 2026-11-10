import type { Clip } from '../clip'

// 爬：大怪獸想爬上一座才到膝蓋的小山丘，卻像要跑百米一樣蹲下蓄力、腳一直原地踩——一衝就整隻飛過小山，臉先撞進一疊橘色泡棉塊，壓成一張餅。
// 泡棉塊飛上天落成「爬」；牠冒煙倒滑回小山旁，看看小山、看看自己的腳，終於懂了：輕輕一步就爬上山頂，揮小旗子。結果最後一塊泡棉塊從天上掉下來砸在牠頭上。爬、爬、爬山
const clip: Clip = {
  char: '爬',
  meta: { theme: '爬小山', cast: '大怪獸＋小山丘＋小旗子＋泡棉塊', gags: ['小事用全力衝過頭', '臉撞進泡棉壓成餅', '倒滑回原點', '輕輕一步就上去', '最後一塊砸頭'] },
  duration: 10,
  bg: { top: '#BFE3FF', bottom: '#EAF6FF', floor: '#F3E9CF', scenery: 'hills' },
  actors: [
    { id: 'hill', emoji: '⛰️', x: 42, y: 70, size: 13 },
    { id: 'flag', emoji: '🚩', x: 43, y: 60, size: 6 },
    { id: 'blk1', emoji: '🟧', x: 142, y: 72, size: 9 },
    { id: 'blk2', emoji: '🟧', x: 142, y: 64, size: 9 },
    { id: 'blk3', emoji: '🟧', x: 142, y: 56, size: 9 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 18, y: 70.7, size: 15, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'mon', do: 'enter', from: { x: -18, y: 70.7 }, dur: 0.5, ease: 'out' },
    // 看到小山上的旗子，好想爬上去
    { at: 0.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 0.6, actor: 'mon', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.8, actor: 'flag', do: 'tilt', amount: 15, dur: 0.4 },
    // 蹲下蓄力，腳原地狂踩
    { at: 1.1, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 1.1, actor: 'mon', do: 'moveTo', to: { x: 12, y: 70.7 }, dur: 0.3 },
    { at: 1.4, actor: 'mon', do: 'squash', amount: -0.35, dur: 0.6 },
    { at: 1.4, actor: 'mon', do: 'shake', amount: 1.2, dur: 0.6 },
    // 一衝就飛過小山，臉撞進泡棉塊
    { at: 2.0, actor: 'mon', do: 'moveTo', to: { x: 130, y: 70.7 }, arc: 16, dur: 0.5, anticipate: 4, ease: 'in' },
    { at: 2.5, actor: 'mon', do: 'squash', amount: 0.55, dur: 0.4 },
    { at: 2.5, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 2.5, actor: 'blk1', do: 'moveTo', to: { x: 110, y: 24 }, dur: 0.4, ease: 'out' },
    { at: 2.5, actor: 'blk1', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.5, actor: 'blk2', do: 'moveTo', to: { x: 136, y: 14 }, dur: 0.45, ease: 'out' },
    { at: 2.5, actor: 'blk2', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.5, actor: 'blk3', do: 'moveTo', to: { x: 150, y: -25 }, dur: 0.4, ease: 'out' },
    { at: 3.0, actor: 'blk1', do: 'vanish', dur: 0.25 },
    { at: 3.35, actor: 'blk2', do: 'vanish', dur: 0.25 },
    // 冒煙倒滑回小山旁
    { at: 3.0, actor: 'mon', do: 'moveTo', to: { x: 22, y: 70.7 }, dur: 0.9, ease: 'out' },
    // 看看小山、看看自己的腳——懂了
    { at: 4.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 4.7, actor: 'mon', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 5.2, actor: 'mon', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 5.8, actor: 'mon', do: 'shake', amount: 0.8, dur: 0.4 },
    // 輕輕一步就爬上山頂
    { at: 6.4, actor: 'mon', do: 'moveTo', to: { x: 40, y: 59 }, arc: 3, dur: 0.6 },
    { at: 7.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 7.0, actor: 'flag', do: 'moveTo', to: { x: 48, y: 50 }, dur: 0.2 },
    { at: 7.2, actor: 'flag', do: 'tilt', amount: 25, dur: 0.35 },
    { at: 7.55, actor: 'flag', do: 'tilt', amount: -25, dur: 0.35 },
    { at: 7.6, actor: 'mon', do: 'shake', amount: 1, dur: 0.5 },
    // 回馬槍：飛走的最後一塊泡棉塊掉回來，砸在頭上
    { at: 8.3, actor: 'blk3', do: 'moveTo', to: { x: 40, y: -15 }, dur: 0.01 },
    { at: 8.35, actor: 'blk3', do: 'moveTo', to: { x: 40, y: 47 }, dur: 0.4, ease: 'bounce' },
    { at: 8.55, actor: 'mon', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.55, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 8.55, actor: 'flag', do: 'hop', amount: -3, dur: 0.25 },
    { at: 9.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
  ],
  builds: [
    // 飛上天的泡棉塊落下：爪、巴
    { at: 3.0, dur: 0.7, strokes: [0, 1, 2, 3], from: 'blk1', color: '#F76707' },
    { at: 3.35, dur: 0.75, strokes: [4, 5, 6, 7], from: 'blk2', color: '#FD7E14' },
  ],
  glyph: [{ at: 4.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'mon', emoji: '❗', dur: 0.5 },
    { at: 1.4, kind: 'puff', actor: 'mon', dur: 0.5 },
    { at: 1.7, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 1.5, kind: 'sweat', actor: 'mon' },
    { at: 2.5, kind: 'burst', actor: 'mon', n: 1, dx: 4, dy: 6, dur: 0.5 },
    { at: 3.1, kind: 'stink', actor: 'mon', emoji: '💨', dur: 0.8 },
    { at: 3.4, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 3.9, kind: 'dizzy', actor: 'mon', dur: 0.8 },
    { at: 5.6, kind: 'pop', actor: 'mon', emoji: '💡', dur: 0.6 },
    { at: 8.6, kind: 'burst', actor: 'blk3', emoji: '⭐', n: 4, dur: 0.5 },
    { at: 8.9, kind: 'pop', actor: 'mon', emoji: '😅', dx: 9, dur: 0.5 },
  ],
  camera: [
    { at: 1.4, dur: 0.6, do: 'zoom', amount: 1.3, actor: 'mon' },
    { at: 2.0, dur: 0.3, do: 'follow', actor: 'mon', amount: 1.3 },
    { at: 2.5, dur: 0.3, do: 'shake', amount: 1.3 },
    { at: 2.6, dur: 0.5, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.45, say: '爬' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 2.5, sfx: 'bonk' },
    { at: 3.0, sfx: 'slide' },
    { at: 4.15, say: '爬' },
    { at: 6.5, sfx: 'tap' },
    { at: 7.0, say: '爬山' },
    { at: 8.55, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
