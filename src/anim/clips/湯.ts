import type { Clip } from '../clip'

// 湯：小巫師晚上煮魔法湯。丟紅蘿蔔進去，鍋子打個嗝；丟辣椒，鍋子噴火；丟蘑菇，鍋子越脹越大、跳來跳去，最後「碰」地爆炸，
// 湯噴出來變成「湯」。小鍋子跳出一顆湯圓，飛進巫師嘴裡——巫師變成一隻豬，鍋子在旁邊偷笑。湯、湯、湯圓
const clip: Clip = {
  char: '湯',
  meta: { theme: '魔法藥水', cast: '小巫師＋魔法鍋', gags: ['丟什麼鍋子就怎樣', '越脹越大爆炸', '吃了變成豬', '鍋子偷笑'] },
  duration: 10,
  bg: { top: '#241D4A', bottom: '#3F3473', floor: '#2E2747', scenery: 'night' },
  actors: [
    { id: 'pot', emoji: '🍲', x: 80, y: 68.6, size: 20, hidden: true },
    { id: 'wizard', emoji: '🧙', x: 54, y: 70.7, size: 15, hidden: true },
    { id: 'carrot', emoji: '🥕', x: 58, y: 60, size: 7, hidden: true, float: true },
    { id: 'chili', emoji: '🌶️', x: 56, y: 60, size: 7, hidden: true, float: true },
    { id: 'mush', emoji: '🍄', x: 50, y: 60, size: 7, hidden: true, float: true },
    { id: 'pot2', emoji: '🍲', x: 134, y: 71.1, size: 14, hidden: true },
    { id: 'yuan', emoji: '🍡', x: 134, y: 58, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'pot', do: 'pop' },
    { at: 0, actor: 'wizard', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.7 },
    // 紅蘿蔔：打嗝
    { at: 1.1, actor: 'carrot', do: 'pop', dur: 0.1 },
    { at: 1.15, actor: 'carrot', do: 'moveTo', to: { x: 80, y: 60 }, arc: 10, dur: 0.35 },
    { at: 1.15, actor: 'carrot', do: 'spin', dur: 0.35 },
    { at: 1.5, actor: 'carrot', do: 'vanish', dur: 0.1 },
    { at: 1.5, actor: 'pot', do: 'squash', amount: 0.3, dur: 0.3 },
    // 辣椒：噴火
    { at: 2.2, actor: 'chili', do: 'pop', dur: 0.1 },
    { at: 2.25, actor: 'chili', do: 'moveTo', to: { x: 80, y: 60 }, arc: 10, dur: 0.35 },
    { at: 2.25, actor: 'chili', do: 'spin', dur: 0.35 },
    { at: 2.6, actor: 'chili', do: 'vanish', dur: 0.1 },
    { at: 2.6, actor: 'pot', do: 'shake', amount: 2, dur: 0.5 },
    { at: 2.6, actor: 'pot', do: 'flash', dur: 0.5 },
    { at: 2.7, actor: 'wizard', do: 'hop', amount: 6, dur: 0.35 },
    { at: 2.75, actor: 'wizard', do: 'moveTo', to: { x: 46, y: 70.7 }, dur: 0.3 },
    // 蘑菇：越脹越大、跳來跳去
    { at: 3.4, actor: 'mush', do: 'pop', dur: 0.1 },
    { at: 3.45, actor: 'mush', do: 'moveTo', to: { x: 80, y: 60 }, arc: 12, dur: 0.35 },
    { at: 3.45, actor: 'mush', do: 'spin', dur: 0.35 },
    { at: 3.8, actor: 'mush', do: 'vanish', dur: 0.1 },
    { at: 3.85, actor: 'pot', do: 'scaleTo', amount: 1.5, dur: 0.5 },
    { at: 3.9, actor: 'pot', do: 'bounce', amount: 4, times: 3, dur: 0.7 },
    { at: 4.6, actor: 'pot', do: 'shake', amount: 2.5, dur: 0.25 },
    // 碰！
    { at: 4.85, actor: 'pot', do: 'vanish', dur: 0.2 },
    { at: 4.85, actor: 'wizard', do: 'moveTo', to: { x: 22, y: 70.7 }, arc: 12, dur: 0.45 },
    { at: 4.85, actor: 'wizard', do: 'spin', dur: 0.45 },
    // 小鍋子跳出湯圓
    { at: 6.7, actor: 'pot2', do: 'pop' },
    { at: 7.25, actor: 'yuan', do: 'pop', dur: 0.3 },
    { at: 7.3, actor: 'pot2', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.55, actor: 'yuan', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
    // 湯圓飛進巫師嘴裡——變成豬
    { at: 8.0, actor: 'yuan', do: 'moveTo', to: { x: 24, y: 61 }, arc: 50, dur: 0.6 },
    { at: 8.0, actor: 'yuan', do: 'spin', times: 2, dur: 0.6 },
    { at: 8.6, actor: 'yuan', do: 'vanish', dur: 0.1 },
    { at: 8.6, actor: 'wizard', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 8.95, actor: 'wizard', do: 'swap', emoji: '🐷' },
    { at: 9.05, actor: 'wizard', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.2, actor: 'pot2', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
  ],
  builds: [
    // 鍋子爆炸，湯噴出來
    { at: 4.9, dur: 0.6, strokes: [0, 1, 2], from: { x: 80, y: 60 }, color: '#4FE3C9' },
    { at: 5.3, dur: 0.5, strokes: [3, 4, 5, 6], from: { x: 80, y: 60 }, color: '#FFC94A' },
    { at: 5.7, dur: 0.6, strokes: [7, 8, 9, 10, 11], from: { x: 80, y: 60 }, color: '#FF8FB8' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'zzz', actor: 'pot', emoji: '🫧', dur: 1.0 },
    { at: 0.8, kind: 'bubble', actor: 'wizard', emoji: '🪄', dur: 0.6 },
    { at: 1.5, kind: 'burst', actor: 'pot', emoji: '🫧', n: 5, dur: 0.5 },
    { at: 2.65, kind: 'fountain', actor: 'pot', emoji: '🔥', n: 7, dur: 0.8 },
    { at: 3.0, kind: 'sweat', actor: 'wizard' },
    { at: 3.9, kind: 'fountain', actor: 'pot', emoji: '🫧', n: 8, dur: 1.0 },
    { at: 3.9, kind: 'pop', actor: 'wizard', emoji: '❗', dur: 0.5 },
    { at: 4.85, kind: 'burst', actor: 'pot', dur: 0.5 },
    { at: 5.3, kind: 'dizzy', actor: 'wizard', dur: 1.0 },
    { at: 6.8, kind: 'zzz', actor: 'pot2', emoji: '🫧', dur: 1.4 },
    { at: 7.3, kind: 'burst', actor: 'yuan', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.9, kind: 'burst', actor: 'wizard', emoji: '💨', n: 6, dur: 0.5 },
    { at: 9.2, kind: 'pop', actor: 'wizard', emoji: '❓', dur: 0.7 },
    { at: 9.2, kind: 'pop', actor: 'pot2', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 3.9, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 80, y: 60 } },
    { at: 4.85, dur: 0.5, do: 'shake', amount: 2.5 },
  ],
  cues: [
    { at: 1.5, sfx: 'hic' },
    { at: 1.65, say: '湯' },
    { at: 2.6, sfx: 'rumble' },
    { at: 3.9, sfx: 'bubble' },
    { at: 4.85, sfx: 'crack' },
    { at: 4.9, sfx: 'poof' },
    { at: 6.35, say: '湯' },
    { at: 7.25, sfx: 'boing' },
    { at: 7.35, say: '湯圓' },
    { at: 8.6, sfx: 'gulp' },
    { at: 8.95, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
