import type { Clip } from '../clip'

// 摸：博物館裡寫著「請勿觸摸」，小猴子左看右看，偷偷戳一下恐龍骨頭——晃一下。再戳一下，掉下一根骨頭，整副恐龍骨架嘩啦散掉，
// 骨頭拼成了「摸」。警衛跑來，猴子嚇得縮成一團，警衛一看這麼漂亮，竟然摸摸牠的頭；旁邊的石像也歪過來想被摸頭。摸、摸、摸頭
const BONE = 'grayscale(1) brightness(1.7) contrast(0.85)'

const clip: Clip = {
  char: '摸',
  meta: { theme: '博物館請勿觸摸', cast: '小猴子＋恐龍骨架＋警衛＋石像', gags: ['越不能碰越想碰', '戳一下整副散掉（連鎖）', '以為要被罵卻被摸頭', '石像也想被摸頭'] },
  duration: 10,
  bg: { top: '#EEF0FA', bottom: '#DCE0F2', floor: '#9C7B5C', scenery: 'room' },
  actors: [
    { id: 'sign', emoji: '🚫', x: 140, y: 40, size: 11.2, float: true },
    { id: 'statue', emoji: '🗿', x: 146, y: 69.1, size: 18.8 },
    { id: 'dino', emoji: '🦖', x: 82, y: 64, size: 30, tint: BONE },
    { id: 'bone', emoji: '🦴', x: 96, y: 58, size: 8.8, hidden: true, float: true },
    { id: 'monkey', emoji: '🐒', x: 40, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'guard', emoji: '👮', x: 18, y: 70.2, size: 16.2, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'monkey', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.7 },
    // 左看右看
    { at: 0.9, actor: 'monkey', do: 'flip' },
    { at: 1.15, actor: 'monkey', do: 'flip' },
    // 偷戳一下：晃一下
    { at: 1.36, actor: 'monkey', do: 'moveTo', to: { x: 60, y: 70.7 }, dur: 0.25 },
    { at: 1.64, actor: 'monkey', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 1.69, actor: 'dino', do: 'shake', amount: 1, dur: 0.4 },
    { at: 2.3, actor: 'monkey', do: 'hop', amount: 4, dur: 0.3 },
    // 再戳一下：掉下一根骨頭
    { at: 2.84, actor: 'monkey', do: 'tilt', amount: 25, dur: 0.3 },
    { at: 2.9, actor: 'dino', do: 'tilt', amount: 6, dur: 0.6 },
    { at: 3.17, actor: 'bone', do: 'pop', dur: 0.1 },
    { at: 3.23, actor: 'bone', do: 'moveTo', to: { x: 44, y: 74 }, arc: 10, dur: 0.5 },
    { at: 3.23, actor: 'bone', do: 'spin', times: 2, dur: 0.5 },
    // 整副骨架晃啊晃……散掉
    { at: 3.83, actor: 'dino', do: 'shake', amount: 3, dur: 0.7 },
    { at: 4.16, actor: 'monkey', do: 'moveTo', to: { x: 34, y: 70.7 }, arc: 8, dur: 0.35 },
    { at: 4.6, actor: 'dino', do: 'vanish', dur: 0.3 },
    // 猴子把腳邊的骨頭丟上去
    { at: 5.3, actor: 'monkey', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 5.5, actor: 'bone', do: 'vanish', dur: 0.15 },
    // 警衛來了
    { at: 6.6, actor: 'guard', do: 'enter', from: { x: -14, y: 70.2 }, dur: 0.5 },
    { at: 7.1, actor: 'monkey', do: 'squash', amount: 0.35, dur: 0.6 },
    { at: 7.1, actor: 'monkey', do: 'shake', amount: 1, dur: 0.6 },
    { at: 7.5, actor: 'guard', do: 'hop', amount: 4, dur: 0.3 },
    // 摸摸頭
    { at: 7.9, actor: 'guard', do: 'moveTo', to: { x: 23, y: 70.2 }, dur: 0.2 },
    { at: 8.05, actor: 'guard', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 8.1, actor: 'monkey', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 8.36, actor: 'guard', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 8.4, actor: 'monkey', do: 'squash', amount: 0.15, dur: 0.3 },
    // 石像也歪過來想被摸頭
    { at: 8.79, actor: 'statue', do: 'rotateTo', amount: -18, dur: 0.4 },
    { at: 9.14, actor: 'statue', do: 'shake', amount: 0.8, dur: 0.4 },
  ],
  builds: [
    // 散掉的骨架 → 艹、日；丟上去的骨頭 → 扌；最後掉下來的骨頭 → 大
    { at: 4.65, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9], from: { x: 82, y: 60 }, color: '#A0703C' },
    { at: 5.5, dur: 0.55, strokes: [0, 1, 2], from: 'bone', color: '#3B6FB6' },
    { at: 5.9, dur: 0.6, strokes: [10, 11, 12], from: { x: 82, y: 30 }, style: 'drop', color: '#A0703C' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.57, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'monkey', emoji: '🦖', dur: 0.6 },
    { at: 1, kind: 'pop', actor: 'sign', emoji: '✋', dur: 0.6, dx: -14, dy: 8 },
    { at: 1.75, kind: 'burst', actor: 'monkey', emoji: '✨', n: 4, dur: 0.4, dx: 6 },
    { at: 2.3, kind: 'pop', actor: 'monkey', emoji: '😏', dur: 0.5 },
    { at: 3.39, kind: 'pop', actor: 'monkey', emoji: '😳', dur: 0.6 },
    { at: 3.61, kind: 'sweat', actor: 'monkey' },
    { at: 4.6, kind: 'burst', x: 82, y: 58, emoji: '🦴', n: 8, dur: 0.6 },
    { at: 4.9, kind: 'pop', actor: 'statue', emoji: '😲', dur: 0.6, dx: -12 },
    { at: 7.1, kind: 'pop', actor: 'guard', emoji: '❗', dur: 0.5 },
    { at: 7.2, kind: 'sweat', actor: 'monkey' },
    { at: 7.5, kind: 'pop', actor: 'guard', emoji: '😍', dur: 0.5 },
    { at: 8.19, kind: 'burst', actor: 'monkey', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.88, kind: 'bubble', actor: 'statue', emoji: '🥺', dur: 0.9, dx: -20 },
    { at: 9.14, kind: 'pop', actor: 'monkey', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.54, dur: 0.4, do: 'shake', amount: 2 },
    { at: 8, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 28, y: 64 } },
  ],
  cues: [
    { at: 1.64, sfx: 'tap' },
    { at: 1.8, say: '摸' },
    { at: 2.84, sfx: 'tap' },
    { at: 3.23, sfx: 'clink' },
    { at: 3.83, sfx: 'rumble' },
    { at: 4.6, sfx: 'crack' },
    { at: 5.5, sfx: 'whoosh' },
    { at: 6.55, say: '摸' },
    { at: 7.1, sfx: 'blip' },
    { at: 8.1, say: '摸頭' },
    { at: 8.79, sfx: 'slide' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
