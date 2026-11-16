import type { Clip } from '../clip'

// 樹：發條鯊魚看上積木樹頂的紅蘋果，踮著高高的腳尖一步一吱、偷偷繞過靠著樹打瞌睡的橡膠恐龍——張大嘴一咬，咬到的是恐龍！
// 兩個面對面尖叫，恐龍跳起來一踩，鯊魚彈飛，積木樹整棵散開：木頭倒成「木」、綠葉塊疊成中間、恐龍一甩甩出「寸」，蘋果落下當那一點。
// 右下角蹦出一棵小樹，恐龍手太短抱不到，只好整個身體貼上去抱；最後又一顆蘋果掉下來，鯊魚張嘴去接——又咬空，砸到頭。樹、樹、大樹
const clip: Clip = {
  char: '樹',
  meta: { theme: '森林偷蘋果', cast: '發條鯊魚＋橡膠恐龍＋積木樹＋紅蘋果', gags: ['踮腳偷偷走一步一吱', '咬錯咬到恐龍', '手太短抱不到小樹'] },
  duration: 10,
  bg: { top: '#FFF6DE', bottom: '#FDF9EE', floor: '#B9D7A0', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 82, y: 62, size: 36 },
    { id: 'apple', emoji: '🍎', x: 82, y: 42, size: 7 },
    { id: 'little', emoji: '🌳', x: 146, y: 72, size: 12, hidden: true },
    { id: 'dino', emoji: 'hero:dino/dizzy', x: 102, y: 70.7, size: 15 },
    { id: 'shark', emoji: 'hero:shark/idle', x: 30, y: 71, size: 14, hidden: true, flip: true },
    { id: 'apple2', emoji: '🍎', x: 30, y: 60, size: 6, hidden: true },
  ],
  moves: [
    // 鯊魚滑進來，盯著蘋果，背上的發條「喀喀」轉一圈
    { at: 0, actor: 'shark', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.8, actor: 'shark', do: 'shake', amount: 0.8, dur: 0.4 },
    // 踮著高高的腳尖，一步一吱，每一步回頭看恐龍
    { at: 1.4, actor: 'shark', do: 'moveTo', to: { x: 44, y: 71 }, arc: 6, dur: 0.35 },
    { at: 1.85, actor: 'shark', do: 'moveTo', to: { x: 56, y: 71 }, arc: 6, dur: 0.35 },
    { at: 2.3, actor: 'shark', do: 'moveTo', to: { x: 68, y: 71 }, arc: 6, dur: 0.35 },
    { at: 1.4, actor: 'shark', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 1.85, actor: 'shark', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 2.3, actor: 'shark', do: 'squash', amount: -0.2, dur: 0.3 },
    // 往後一仰，張大嘴——咬下去，咬到的是恐龍
    { at: 2.8, actor: 'shark', do: 'tilt', amount: -18, dur: 0.35 },
    { at: 3.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 3.1, actor: 'shark', do: 'moveTo', to: { x: 88, y: 71 }, dur: 0.2, ease: 'in' },
    { at: 3.3, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.2 },
    // 停格一拍……恐龍睜開一隻眼
    { at: 3.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 3.75, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 3.8, actor: 'dino', do: 'shake', amount: 1, dur: 0.3 },
    { at: 3.8, actor: 'shark', do: 'shake', amount: 1, dur: 0.3 },
    // 恐龍跳起來一踩，鯊魚彈飛，兩個撞在樹的兩邊
    { at: 4.1, actor: 'dino', do: 'hop', amount: 14, dur: 0.4 },
    { at: 4.5, actor: 'dino', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.5, actor: 'shark', do: 'moveTo', to: { x: 30, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 4.5, actor: 'shark', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.5, actor: 'dino', do: 'moveTo', to: { x: 126, y: 70.7 }, dur: 0.45, ease: 'out' },
    { at: 4.5, actor: 'tree', do: 'shake', amount: 2, dur: 0.3 },
    { at: 4.75, actor: 'tree', do: 'vanish', dur: 0.15 },
    { at: 4.75, actor: 'apple', do: 'moveTo', to: { x: 93, y: 34 }, arc: 8, dur: 0.5, ease: 'out' },
    // 恐龍尾巴一甩
    { at: 5.15, actor: 'dino', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 5.85, actor: 'apple', do: 'vanish', dur: 0.15 },
    // 鯊魚在左下角頭昏轉圈圈
    { at: 6.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 6.1, actor: 'shark', do: 'spin', times: 2, dur: 1.4 },
    // 右下角蹦出一棵小樹，恐龍手太短抱不到——整個身體貼上去抱
    { at: 6.75, actor: 'little', do: 'pop', dur: 0.4 },
    { at: 6.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 7.4, actor: 'dino', do: 'moveTo', to: { x: 136, y: 70.7 }, dur: 0.3 },
    { at: 7.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.7, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 7.7, actor: 'little', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 7.55, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 回馬槍：又一顆蘋果掉下來，鯊魚張嘴去接——咬空，砸到頭
    { at: 8.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 8.3, actor: 'apple2', do: 'drop', dur: 0.5 },
    { at: 8.8, actor: 'shark', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 8.85, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 8.85, actor: 'apple2', do: 'moveTo', to: { x: 40, y: 72 }, arc: 5, dur: 0.4, ease: 'out' },
  ],
  builds: [
    // 木頭段往左倒 → 木；綠葉塊直直往下疊 → 中間；恐龍尾巴甩出最後一塊 → 寸；蘋果落下 → 那一點
    { at: 4.75, dur: 0.5, strokes: [0, 1, 2, 3], from: 'tree', color: '#8A5A2E' },
    { at: 5.0, dur: 0.85, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12], from: { x: 82, y: 0 }, style: 'drop', color: '#2B8A3E' },
    { at: 5.25, dur: 0.4, strokes: [13, 14], from: 'dino', color: '#2F9E44' },
    { at: 5.85, dur: 0.35, strokes: [15], from: 'apple', color: '#E03131' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'shark', emoji: '🍎', dur: 0.9 },
    { at: 0.3, kind: 'zzz', actor: 'dino', dur: 3.2 },
    { at: 1.7, kind: 'pop', actor: 'shark', emoji: '👀', dur: 0.3 },
    { at: 2.6, kind: 'pop', actor: 'shark', emoji: '🤫', dur: 0.4 },
    { at: 3.3, kind: 'burst', actor: 'dino', n: 1, dur: 0.3, dx: -4 },
    { at: 3.5, kind: 'pop', actor: 'dino', emoji: '👁️', dur: 0.4 },
    { at: 3.8, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.5 },
    { at: 3.8, kind: 'pop', actor: 'shark', emoji: '❗', dur: 0.5 },
    { at: 4.5, kind: 'puff', actor: 'dino', dur: 0.5 },
    { at: 4.75, kind: 'burst', actor: 'tree', emoji: '🍃', n: 7, dur: 0.6 },
    { at: 6.2, kind: 'dizzy', actor: 'shark', dur: 1.4 },
    { at: 7.75, kind: 'pop', actor: 'dino', emoji: '💕', dur: 0.7 },
    { at: 8.85, kind: 'dizzy', actor: 'shark', dur: 0.8 },
    { at: 9.2, kind: 'pop', actor: 'dino', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    // 咬下去的那一刻推近，尖叫完退回全景
    { at: 3.1, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 92, y: 58 } },
    { at: 4.1, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 4.5, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.8, sfx: 'clink' },
    { at: 1.2, say: '樹' },
    { at: 1.55, sfx: 'tap' },
    { at: 2.0, sfx: 'tap' },
    { at: 2.45, sfx: 'tap' },
    { at: 3.3, sfx: 'gulp' },
    { at: 3.8, sfx: 'boing' },
    { at: 4.5, sfx: 'bonk' },
    { at: 6.25, say: '樹' },
    { at: 6.75, sfx: 'boing' },
    { at: 6.85, say: '大樹' },
    { at: 8.8, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
