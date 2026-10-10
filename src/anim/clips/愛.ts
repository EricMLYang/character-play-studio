import type { Clip } from '../clip'

// 愛：小恐龍想對小雞比一個愛心，可是手太短了！舉起來——碰不到；用力伸——還是碰不到，整隻往後倒。
// 小雞跑過來，跳到牠頭上張開翅膀，一起拼出一個大愛心，冒出好多愛心變成「愛」。恐龍感動到流淚……眼淚也是愛心形狀。愛、愛、愛心
const clip: Clip = {
  char: '愛',
  meta: { theme: '比愛心', cast: '小恐龍＋小雞', gags: ['手太短', '用力過猛往後倒', '朋友來幫忙'] },
  duration: 10,
  bg: { top: '#FFE3EC', bottom: '#FFF6F8', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'chick', emoji: '🐥', x: 128, y: 71.5, size: 13, hidden: true },
    { id: 'dino', emoji: '🦖', x: 40, y: 64, size: 30, hidden: true, flip: true },
    { id: 'heart', emoji: '❤️', x: 42, y: 34, size: 18, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'dino', do: 'enter', from: { x: -20, y: 64 }, dur: 0.8 },
    { at: 0.3, actor: 'chick', do: 'pop' },
    { at: 0.8, actor: 'chick', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 舉起手——碰不到
    { at: 1.6, actor: 'dino', do: 'squash', amount: -0.15, dur: 0.6 },
    { at: 2.4, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.4 },
    // 用力伸——還是碰不到，整隻往後倒
    { at: 3.2, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.6 },
    { at: 3.8, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 4.2, actor: 'dino', do: 'rotateTo', amount: -80, dur: 0.35 },
    { at: 4.2, actor: 'dino', do: 'moveTo', to: { x: 34, y: 70 }, dur: 0.35 },
    // 小雞跑過來，跳到恐龍旁邊，一起拼出大愛心
    { at: 5.0, actor: 'dino', do: 'rotateTo', amount: 80, dur: 0.35 },
    { at: 5.0, actor: 'dino', do: 'moveTo', to: { x: 40, y: 64 }, dur: 0.35 },
    { at: 5.0, actor: 'chick', do: 'moveTo', to: { x: 46, y: 46 }, dur: 0.6, arc: 22 },
    { at: 5.6, actor: 'chick', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 5.9, actor: 'heart', do: 'pop', dur: 0.4 },
    { at: 5.9, actor: 'heart', do: 'flash', dur: 0.6 },
    { at: 6.5, actor: 'heart', do: 'vanish', dur: 0.2 },
    { at: 7.0, actor: 'chick', do: 'moveTo', to: { x: 32, y: 46 }, dur: 0.5, arc: 6 },
    { at: 7.0, actor: 'dino', do: 'moveTo', to: { x: 32, y: 64 }, dur: 0.5 },
    // 恐龍感動到流淚
    { at: 8.2, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 9.0, actor: 'chick', do: 'hop', amount: 4, dur: 0.4 },
  ],
  builds: [
    // 大愛心碎成好多小愛心：爫冖心 → 上半；夂 → 下半
    { at: 6.5, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], from: 'heart', color: '#E8508A' },
    { at: 7.0, dur: 0.5, strokes: [10, 11, 12], from: 'heart', color: '#F48FB1' },
  ],
  glyph: [{ at: 7.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'dino', emoji: '❤️', dur: 0.8 },
    { at: 2.4, kind: 'sweat', actor: 'dino' },
    { at: 3.8, kind: 'pop', actor: 'dino', emoji: '😣', dur: 0.5 },
    { at: 4.55, kind: 'puff', actor: 'dino' },
    { at: 4.6, kind: 'pop', actor: 'chick', emoji: '❗', dur: 0.4 },
    { at: 5.9, kind: 'burst', actor: 'heart', emoji: '💕', n: 7, dur: 0.7 },
    { at: 8.2, kind: 'rain', actor: 'dino', emoji: '💗', n: 4, dur: 1.0, dx: 6, dy: 6 },
    { at: 8.3, kind: 'pop', actor: 'dino', emoji: '🥹', dur: 0.9 },
  ],
  camera: [
    { at: 3.2, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 40, y: 52 } },
    { at: 4.55, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.0, say: '愛' },
    { at: 2.4, sfx: 'deflate' },
    { at: 3.8, sfx: 'slide' },
    { at: 4.55, sfx: 'bonk' },
    { at: 5.0, sfx: 'boing' },
    { at: 5.9, sfx: 'blip' },
    { at: 7.6, say: '愛' },
    { at: 8.5, say: '愛心' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
