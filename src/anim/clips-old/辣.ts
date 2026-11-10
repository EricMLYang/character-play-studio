import type { Clip } from '../clip'

// 辣：短手橡膠恐龍跳了又跳，就是搆不到高架上的大辣椒，只好坐上機器人的湯匙投石器——結果馬達太強，牠飛過辣椒、
// 撞翻一箱紅積木、彈牆後倒栽進水桶；散落的積木條拼成「辣」。辣椒晃下來剛好掉進牠嘴裡，辣到噴火，又把自己噴上天。辣、辣、辣椒
const clip: Clip = {
  char: '辣',
  meta: { theme: '桌上投石器', cast: '橡膠恐龍＋玩具機器人＋辣椒＋水桶', gags: ['短手搆不到', '投石器馬力太強飛過頭', '倒栽進水桶', '辣到噴火把自己噴上天'] },
  duration: 10,
  bg: { top: '#DDEFFF', bottom: '#F2F8FF', floor: '#F3E3B5', scenery: 'room' },
  actors: [
    { id: 'chili', emoji: '🌶️', x: 28, y: 40, size: 10, float: true },
    { id: 'crate', emoji: '📦', x: 9, y: 70.5, size: 11 },
    { id: 'spoon', emoji: '🥄', x: 124, y: 71, size: 11, hidden: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 143, y: 71.1, size: 14, hidden: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 36, y: 71.1, size: 14 },
    { id: 'bucket', emoji: '🪣', x: 28, y: 70.5, size: 12 },
  ],
  moves: [
    // 跳一下、再用力跳——短短的手差好遠
    { at: 0.5, actor: 'dino', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 0.6, actor: 'dino', do: 'hop', amount: 5, dur: 0.35 },
    { at: 0.95, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 0.95, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 1.05, actor: 'dino', do: 'hop', amount: 10, dur: 0.4 },
    // 啪嘰，肚子著地
    { at: 1.45, actor: 'dino', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 1.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    // 機器人推著湯匙投石器進來
    { at: 1.3, actor: 'robot', do: 'enter', from: { x: 185, y: 71.1 }, dur: 0.5, ease: 'out' },
    { at: 1.3, actor: 'spoon', do: 'enter', from: { x: 166, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 1.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 1.75, actor: 'dino', do: 'flip' },
    { at: 1.8, actor: 'dino', do: 'moveTo', to: { x: 122, y: 64 }, dur: 0.45, arc: 10 },
    { at: 2.3, actor: 'dino', do: 'flip' },
    // 擺好姿勢打鼓等發射
    { at: 2.35, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 2.35, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.4 },
    // 拉桿——馬達轉太猛
    { at: 2.75, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 2.75, actor: 'robot', do: 'shake', amount: 1.4, dur: 0.4 },
    { at: 2.75, actor: 'robot', do: 'flash', dur: 0.4 },
    { at: 2.75, actor: 'spoon', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 3.1, actor: 'spoon', do: 'rotateTo', amount: 50, dur: 0.12 },
    { at: 3.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    // 咻——飛過辣椒，撞翻積木箱
    { at: 3.1, actor: 'dino', do: 'moveTo', to: { x: 13, y: 63 }, dur: 0.55, arc: 38, ease: 'linear' },
    { at: 3.1, actor: 'dino', do: 'spin', times: 1, dur: 0.55 },
    { at: 3.65, actor: 'crate', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 3.65, actor: 'dino', do: 'squash', amount: 0.45, dur: 0.2 },
    { at: 3.65, actor: 'chili', do: 'shake', amount: 0.8, dur: 0.4 },
    // 彈牆、倒栽進水桶，腳在外面踢
    { at: 3.85, actor: 'dino', do: 'moveTo', to: { x: 28, y: 52 }, dur: 0.5, arc: 12, ease: 'out' },
    { at: 3.85, actor: 'dino', do: 'rotateTo', amount: 180, dur: 0.5 },
    { at: 4.35, actor: 'bucket', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 4.6, actor: 'dino', do: 'shake', amount: 1, dur: 1.2 },
    { at: 3.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    // 從水桶裡探出頭
    { at: 6.2, actor: 'dino', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 6.2, actor: 'dino', do: 'moveTo', to: { x: 28, y: 62 }, dur: 0.3, ease: 'back' },
    { at: 6.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    // 辣椒晃下來，剛好掉進嘴裡
    { at: 6.3, actor: 'chili', do: 'shake', amount: 1, dur: 0.4 },
    { at: 6.7, actor: 'chili', do: 'moveTo', to: { x: 28, y: 57 }, dur: 0.25, ease: 'in' },
    { at: 6.95, actor: 'chili', do: 'vanish', dur: 0.1 },
    { at: 6.95, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 7.15, actor: 'dino', do: 'tint', filter: 'hue-rotate(-90deg) saturate(1.6)' },
    { at: 7.15, actor: 'dino', do: 'flash', dur: 0.6 },
    { at: 7.15, actor: 'dino', do: 'shake', amount: 1, dur: 0.4 },
    // 回馬槍：辣到噴火，把自己噴上天，又掉回水桶
    { at: 7.6, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 7.8, actor: 'dino', do: 'hop', amount: 26, dur: 0.75 },
    { at: 7.8, actor: 'dino', do: 'spin', times: 1, dur: 0.75 },
    { at: 8.55, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.55, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.8, actor: 'dino', do: 'tint', filter: '' },
    { at: 8.8, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 8.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 8.9, actor: 'robot', do: 'hop', amount: 4, dur: 0.35 },
  ],
  builds: [
    // 撞散的紅積木條：先拼辛，再拼束
    { at: 4.3, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'crate', color: '#E03131' },
    { at: 5.05, dur: 0.9, strokes: [7, 8, 9, 10, 11, 12, 13], from: 'crate', color: '#F03E3E' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    // 撐著辣椒的高架子
    { at: 0, kind: 'line', actor: 'chili', to: { x: 28, y: 74 }, color: '#B08968', width: 1.2, dur: 6.7 },
    { at: 0.2, kind: 'bubble', actor: 'dino', emoji: '😋', dur: 0.7 },
    { at: 1.5, kind: 'puff', actor: 'dino', dur: 0.5 },
    { at: 1.5, kind: 'sweat', actor: 'dino' },
    { at: 2.75, kind: 'burst', actor: 'robot', emoji: '⚙️', n: 5, dur: 0.6 },
    { at: 3.65, kind: 'burst', actor: 'crate', emoji: '💥', n: 1, dy: -4, dur: 0.5 },
    { at: 3.7, kind: 'burst', actor: 'crate', emoji: '🧱', n: 6, dx: 10, dur: 0.6 },
    { at: 4.35, kind: 'burst', actor: 'bucket', emoji: '💦', n: 5, dur: 0.5 },
    { at: 3.6, kind: 'puff', actor: 'robot', dur: 0.6 },
    { at: 7.2, kind: 'burst', actor: 'dino', emoji: '💨', n: 2, dur: 0.5 },
    { at: 7.8, kind: 'burst', actor: 'dino', emoji: '🔥', n: 5, dur: 0.6 },
    { at: 8.6, kind: 'burst', actor: 'bucket', emoji: '💦', n: 4, dur: 0.5 },
    { at: 8.4, kind: 'pop', actor: 'robot', emoji: '👍', dur: 0.6 },
  ],
  camera: [
    { at: 3.1, dur: 0.2, do: 'follow', actor: 'dino', amount: 1.3 },
    { at: 3.65, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 3.8, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.6, sfx: 'boing' },
    { at: 1.05, sfx: 'boing' },
    { at: 1.45, sfx: 'deflate' },
    { at: 1.4, sfx: 'blip' },
    { at: 2.35, say: '辣' },
    { at: 2.75, sfx: 'rumble' },
    { at: 3.1, sfx: 'whoosh' },
    { at: 3.65, sfx: 'bonk' },
    { at: 3.9, sfx: 'boing' },
    { at: 4.35, sfx: 'splash' },
    { at: 6.0, say: '辣' },
    { at: 6.95, say: '辣椒' },
    { at: 7.8, sfx: 'whoosh' },
    { at: 8.55, sfx: 'splash' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
