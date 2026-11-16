import type { Clip } from '../clip'

// 拍：賽車咬住彈力繩一端倒車猛拉，太空人玩偶抓另一端，拔河拔到人飄起來、被扯過去頭盔撞到繩子中間的球；
// 繩子「啪」斷掉，賽車倒撞左邊、太空人一屁股坐下，兩段繩子捲成「扌」和「白」。太空人拍拍球，最後拍太大力，球彈起來砸自己頭盔。拍、拍、拍球
const clip: Clip = {
  char: '拍',
  meta: { theme: '拔河', cast: '賽車＋太空人玩偶＋彈力繩紅球', gags: ['拔河拔到飄起來', '繩子斷掉兩邊摔', '拍球拍太大力砸自己'] },
  duration: 10,
  bg: { top: '#DDF6EE', bottom: '#F6FCF8', floor: '#CFE8C7', scenery: 'hills' },
  actors: [
    { id: 'ball', emoji: '🔴', x: 80, y: 72, size: 6 },
    { id: 'car', emoji: 'hero:car/idle', x: 34, y: 69, size: 19, flip: true, hidden: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 126, y: 71, size: 14, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'car', do: 'enter', from: { x: -20, y: 69 }, dur: 0.45, ease: 'back' },
    { at: 0.45, actor: 'astro', do: 'drop', dur: 0.5 },
    { at: 1.0, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    // 拔河：賽車倒車猛拉
    { at: 1.2, actor: 'car', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.6, actor: 'car', do: 'moveTo', to: { x: 24, y: 69 }, dur: 0.5, ease: 'out' },
    { at: 1.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    // 太空人的靴子離地，被扯過去，頭盔撞到球
    { at: 1.7, actor: 'astro', do: 'moveTo', to: { x: 120, y: 58 }, dur: 0.45, ease: 'out' },
    { at: 2.2, actor: 'astro', do: 'moveTo', to: { x: 89, y: 66 }, dur: 0.3, ease: 'in' },
    { at: 2.5, actor: 'ball', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 2.5, actor: 'astro', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 2.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    // 站穩再拉，兩邊都脹紅臉
    { at: 2.8, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 2.8, actor: 'astro', do: 'moveTo', to: { x: 130, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 3.2, actor: 'astro', do: 'tilt', amount: -14, dur: 0.6 },
    { at: 3.2, actor: 'car', do: 'squash', amount: 0.2, dur: 0.6 },
    { at: 3.3, actor: 'ball', do: 'shake', amount: 0.5, dur: 0.5 },
    // 啪！斷了
    { at: 3.85, actor: 'ball', do: 'moveTo', to: { x: 80, y: 18 }, dur: 0.4, ease: 'out' },
    { at: 3.85, actor: 'car', do: 'moveTo', to: { x: 8, y: 69 }, dur: 0.2, ease: 'in' },
    { at: 4.05, actor: 'car', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.05, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 3.85, actor: 'astro', do: 'moveTo', to: { x: 134, y: 71 }, dur: 0.2, ease: 'out' },
    { at: 4.05, actor: 'astro', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.05, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    // 球掉到右下角
    { at: 4.3, actor: 'ball', do: 'moveTo', to: { x: 120, y: 74.5 }, arc: 6, dur: 0.55, ease: 'bounce' },
    { at: 5.0, actor: 'car', do: 'moveTo', to: { x: 22, y: 69 }, dur: 0.5, ease: 'out' },
    { at: 5.2, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    // 拍、拍、拍
    { at: 6.0, actor: 'astro', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 6.05, actor: 'ball', do: 'hop', amount: 4, dur: 0.35 },
    { at: 6.5, actor: 'astro', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 6.55, actor: 'ball', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.0, actor: 'astro', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 7.05, actor: 'ball', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.4, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 7.4, actor: 'car', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：拍太大力，球彈高高砸回自己頭盔
    { at: 8.0, actor: 'astro', do: 'tilt', amount: 20, dur: 0.25 },
    { at: 8.05, actor: 'ball', do: 'moveTo', to: { x: 134, y: 60 }, arc: 22, dur: 0.6, ease: 'in' },
    { at: 8.65, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.65, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 8.7, actor: 'ball', do: 'moveTo', to: { x: 120, y: 74.5 }, arc: 5, dur: 0.45, ease: 'bounce' },
  ],
  builds: [
    // 左半段繩子捲成扌，右半段捲成白
    { at: 3.95, dur: 0.5, strokes: [0, 1, 2], from: 'car', color: '#1C4FD8' },
    { at: 4.4, dur: 0.65, strokes: [3, 4, 5, 6, 7], from: 'astro', color: '#1C4FD8' },
  ],
  glyph: [{ at: 5.1, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    // 彈力繩：賽車 → 球 → 太空人
    { at: 1.0, dur: 2.85, kind: 'line', actor: 'car', target: 'ball', color: '#E03131', width: 1.1 },
    { at: 1.0, dur: 2.85, kind: 'line', actor: 'ball', target: 'astro', color: '#E03131', width: 1.1 },
    { at: 0.9, kind: 'pop', actor: 'car', emoji: '👀', dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'astro', emoji: '😤', dur: 0.4 },
    { at: 1.6, kind: 'puff', actor: 'car', dur: 0.6 },
    { at: 2.5, kind: 'burst', actor: 'astro', emoji: '💫', n: 4, dur: 0.4 },
    { at: 3.2, kind: 'sweat', actor: 'astro' },
    { at: 3.3, kind: 'pop', actor: 'car', emoji: '😣', dur: 0.5 },
    { at: 3.85, kind: 'burst', actor: 'ball', n: 1, dur: 0.3 },
    { at: 4.05, kind: 'burst', actor: 'car', n: 1, dur: 0.3, dx: 4 },
    { at: 4.2, kind: 'dizzy', actor: 'car', dur: 1.0, dx: 8 },
    { at: 7.5, kind: 'pop', actor: 'car', emoji: '😉', dur: 0.5 },
    { at: 8.7, kind: 'dizzy', actor: 'astro', dur: 1.0 },
  ],
  camera: [
    { at: 2.3, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 88, y: 64 } },
    { at: 3.85, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.2, sfx: 'rumble' },
    { at: 1.3, say: '拍' },
    { at: 2.5, sfx: 'bonk' },
    { at: 3.85, sfx: 'crack' },
    { at: 4.05, sfx: 'bonk' },
    { at: 5.1, say: '拍' },
    { at: 6.05, say: '拍球' },
    { at: 6.05, sfx: 'tap' },
    { at: 6.55, sfx: 'tap' },
    { at: 7.05, sfx: 'tap' },
    { at: 8.05, sfx: 'boing' },
    { at: 8.65, sfx: 'bonk' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
