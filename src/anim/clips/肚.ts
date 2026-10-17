import type { Clip } from '../clip'
import { ride } from '../helpers'

// 肚：小老鼠想拿起司塔頂的起司，把仰躺打盹的太空人圓肚皮當彈簧床。第一次只彈起一點點，太空人還在睡夢中飄起來又落下；
// 第二次蓄力猛跳，「啵～ㄧㄥ」被彈飛，擦過起司塔、撞牆、倒栽蔥掉進水桶。起司條落下拼成「肚」，小老鼠戴著起司帽冒出來，
// 太空人醒來拍拍肚皮，小老鼠衝回去再彈一下——這次彈得更高。肚、肚、肚皮
const clip: Clip = {
  char: '肚',
  meta: { theme: '肚皮彈簧床', cast: '小老鼠＋太空人玩偶＋起司塔＋水桶', gags: ['第一次只彈一點點', '睡夢中飄起來', '用力過猛飛過頭撞牆', '倒栽蔥進水桶戴起司帽'] },
  duration: 10,
  bg: { top: '#FFF7E6', bottom: '#FFFCF4', floor: '#BFEBD6', scenery: 'room' },
  actors: [
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 30, y: 70.7, size: 15 },
    { id: 'ch1', emoji: '🧀', x: 120, y: 72.5, size: 9 },
    { id: 'ch2', emoji: '🧀', x: 121, y: 65, size: 9 },
    { id: 'ch3', emoji: '🧀', x: 119, y: 57.5, size: 9 },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 60, y: 72.4, size: 11, hidden: true, flip: true },
    { id: 'bucket', emoji: '🪣', x: 148, y: 72, size: 12 },
    { id: 'wedge', emoji: '🧀', x: 120, y: 50, size: 8 },
  ],
  moves: [
    // 仰躺打盹
    { at: 0, actor: 'astro', do: 'rotateTo', amount: -90, dur: 0 },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -15, y: 72.4 }, dur: 0.4, ease: 'out' },
    { at: 1.0, actor: 'mouse', do: 'flip' },
    { at: 1.0, actor: 'mouse', do: 'moveTo', to: { x: 24, y: 59 }, arc: 8, dur: 0.3 },
    // 小拳頭在肚皮上打鼓
    { at: 1.3, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.4 },
    // 第一次：只彈一點點
    { at: 1.7, actor: 'astro', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 1.75, actor: 'mouse', do: 'hop', amount: 6, dur: 0.45 },
    { at: 2.2, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.2, actor: 'astro', do: 'squash', amount: 0.15, dur: 0.2 },
    // 太空人睡夢中飄起來、頭盔叩一下、又落下
    { at: 2.4, actor: 'astro', do: 'moveTo', to: { x: 30, y: 64 }, dur: 0.5 },
    { at: 2.4, actor: 'mouse', do: 'moveTo', to: { x: 24, y: 52.3 }, dur: 0.5 },
    { at: 2.9, actor: 'astro', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 2.9, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 3.1, actor: 'astro', do: 'moveTo', to: { x: 30, y: 70.7 }, dur: 0.4 },
    { at: 3.1, actor: 'mouse', do: 'moveTo', to: { x: 24, y: 59 }, dur: 0.4 },
    // 蹲低、定住、全力一跳
    { at: 3.6, actor: 'mouse', do: 'squash', amount: 0.35, dur: 0.5 },
    { at: 4.0, actor: 'astro', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 4.1, actor: 'mouse', do: 'flip' },
    { at: 4.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 4.15, actor: 'mouse', do: 'moveTo', to: { x: 150, y: 50 }, arc: 12, dur: 0.75, ease: 'linear' },
    { at: 4.15, actor: 'mouse', do: 'spin', times: 1, dur: 0.75 },
    // 擦過起司塔
    { at: 4.72, actor: 'wedge', do: 'moveTo', to: { x: 150, y: 24 }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 4.72, actor: 'wedge', do: 'spin', times: 1, dur: 0.3 },
    { at: 5.0, actor: 'wedge', do: 'vanish', dur: 0.1 },
    { at: 4.75, actor: 'ch1', do: 'moveTo', to: { x: 100, y: 66 }, dur: 0.3, ease: 'out' },
    { at: 4.75, actor: 'ch2', do: 'moveTo', to: { x: 96, y: 40 }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 4.75, actor: 'ch3', do: 'moveTo', to: { x: 108, y: 28 }, arc: 6, dur: 0.4, ease: 'out' },
    { at: 4.75, actor: 'ch2', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.75, actor: 'ch3', do: 'spin', times: 2, dur: 0.5 },
    { at: 4.9, actor: 'ch1', do: 'vanish', dur: 0.2 },
    { at: 5.1, actor: 'ch2', do: 'vanish', dur: 0.15 },
    { at: 5.55, actor: 'ch3', do: 'vanish', dur: 0.15 },
    // 撞牆，倒栽蔥進水桶
    { at: 4.9, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 4.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 5.1, actor: 'mouse', do: 'rotateTo', amount: 180, dur: 0.25 },
    { at: 5.1, actor: 'mouse', do: 'moveTo', to: { x: 148, y: 56 }, dur: 0.3, ease: 'in' },
    { at: 5.4, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.6, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.5 },
    // 戴著起司帽冒出來
    { at: 6.4, actor: 'mouse', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 6.4, actor: 'mouse', do: 'moveTo', to: { x: 148, y: 62 }, dur: 0.2 },
    { at: 6.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 6.55, actor: 'wedge', do: 'moveTo', to: { x: 148, y: 53 }, dur: 0.01 },
    { at: 6.6, actor: 'wedge', do: 'pop' },
    // 太空人醒來，拍拍肚皮
    { at: 6.9, actor: 'astro', do: 'rotateTo', amount: 90, dur: 0.3, ease: 'back' },
    { at: 6.9, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 7.25, actor: 'astro', do: 'bounce', amount: 1, times: 2, dur: 0.5 },
    // 衝回去再彈一下——這次彈得更高
    { at: 7.75, actor: 'mouse', do: 'flip' },
    ...ride([
      { at: 7.6, actor: 'mouse', do: 'moveTo', to: { x: 148, y: 72.4 }, dur: 0.15 },
      { at: 7.8, actor: 'mouse', do: 'moveTo', to: { x: 42, y: 72.4 }, dur: 0.4, ease: 'linear' },
      { at: 8.25, actor: 'mouse', do: 'moveTo', to: { x: 31, y: 66 }, arc: 8, dur: 0.3 },
      { at: 8.55, actor: 'mouse', do: 'hop', amount: 20, dur: 0.8 },
      { at: 9.35, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
    ], 'wedge', -9, 11),
    { at: 8.55, actor: 'astro', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 9.35, actor: 'astro', do: 'squash', amount: 0.2, dur: 0.2 },
  ],
  builds: [
    // 起司條落下：左邊的月、右邊的土
    { at: 5.0, dur: 0.6, strokes: [0, 1, 2, 3], from: 'ch2', color: '#F59F00' },
    { at: 5.5, dur: 0.6, strokes: [4, 5, 6], from: 'ch3', style: 'drop', color: '#E8590C' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'astro', dur: 6.6 },
    { at: 0.45, kind: 'bubble', actor: 'mouse', emoji: '🧀', dur: 0.6 },
    { at: 1.3, kind: 'zzz', actor: 'mouse', emoji: '🥁', dur: 0.4 },
    { at: 2.3, kind: 'pop', actor: 'mouse', emoji: '😑', dur: 0.5 },
    { at: 2.9, kind: 'pop', actor: 'astro', emoji: '💫', dur: 0.4 },
    { at: 3.6, kind: 'sweat', actor: 'mouse' },
    { at: 4.0, kind: 'puff', actor: 'astro' },
    { at: 4.72, kind: 'burst', actor: 'ch3', emoji: '✨', n: 5, dur: 0.5 },
    { at: 4.9, kind: 'burst', actor: 'mouse', n: 1, dur: 0.4 },
    { at: 5.4, kind: 'burst', actor: 'bucket', dx: -8, emoji: '💦', n: 5, dur: 0.5 },
    { at: 6.7, kind: 'pop', actor: 'mouse', emoji: '😁', dx: -8, dur: 0.6 },
    { at: 7.3, kind: 'pop', actor: 'astro', emoji: '😊', dur: 0.6 },
    { at: 8.6, kind: 'burst', actor: 'astro', emoji: '✨', n: 5, dur: 0.5 },
  ],
  camera: [
    { at: 3.5, dur: 0.5, do: 'zoom', amount: 1.4, actor: 'mouse' },
    { at: 4.15, dur: 0.25, do: 'follow', actor: 'mouse', amount: 1.3 },
    { at: 4.9, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 5.1, dur: 0.5, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 1.3, sfx: 'tap' },
    { at: 1.75, sfx: 'boing' },
    { at: 1.8, say: '肚' },
    { at: 2.4, sfx: 'bubble' },
    { at: 2.9, sfx: 'tap' },
    { at: 4.0, sfx: 'boing' },
    { at: 4.15, sfx: 'whoosh' },
    { at: 4.75, sfx: 'crack' },
    { at: 4.9, sfx: 'bonk' },
    { at: 5.4, sfx: 'splash' },
    { at: 6.15, say: '肚' },
    { at: 6.6, sfx: 'poof' },
    { at: 7.25, sfx: 'tap' },
    { at: 7.3, say: '肚皮' },
    { at: 7.8, sfx: 'whoosh' },
    { at: 8.55, sfx: 'boing' },
    { at: 9.35, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
