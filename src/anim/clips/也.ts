import type { Clip } from '../clip'

// 也：猴子吃香蕉，鸚鵡說「我也要！」也拿一根；猴子跳一下，鸚鵡也跳一下；猴子翻一圈，鸚鵡也翻一圈——
// 猴子踩到香蕉皮滑倒，鸚鵡想了想……也故意滑倒！兩個摔成一團，香蕉皮飛成「也」。最後猴子打哈欠，鸚鵡也打哈欠，一起睡著。也、也、也是
const clip: Clip = {
  char: '也',
  meta: { theme: '學人精', cast: '猴子＋鸚鵡', gags: ['模仿', '連跌倒也要學', '一起睡著'] },
  duration: 10,
  bg: { top: '#DDF4E3', bottom: '#F6FCF2', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'monkey', emoji: '🐒', x: 40, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'parrot', emoji: '🦜', x: 120, y: 68.6, size: 16, hidden: true },
    { id: 'peel', emoji: '🍌', x: 60, y: 73.5, size: 8, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'monkey', do: 'pop' },
    { at: 0.2, actor: 'parrot', do: 'enter', from: { x: 178, y: 68.6 }, dur: 0.6 },
    // 跳一下——也跳一下
    { at: 1.6, actor: 'monkey', do: 'hop', amount: 8, dur: 0.4 },
    { at: 2.1, actor: 'parrot', do: 'hop', amount: 8, dur: 0.4 },
    // 翻一圈——也翻一圈
    { at: 2.9, actor: 'monkey', do: 'hop', amount: 14, dur: 0.5 },
    { at: 2.9, actor: 'monkey', do: 'spin', dur: 0.5 },
    { at: 3.5, actor: 'parrot', do: 'hop', amount: 14, dur: 0.5 },
    { at: 3.5, actor: 'parrot', do: 'spin', dur: 0.5 },
    // 踩到香蕉皮滑倒
    { at: 4.2, actor: 'peel', do: 'pop', dur: 0.2 },
    { at: 4.5, actor: 'monkey', do: 'moveTo', to: { x: 60, y: 69.5 }, dur: 0.3 },
    { at: 4.8, actor: 'monkey', do: 'moveTo', to: { x: 76, y: 69.5 }, dur: 0.3 },
    { at: 4.8, actor: 'monkey', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 4.8, actor: 'peel', do: 'moveTo', to: { x: 40, y: 60 }, dur: 0.4, arc: 10 },
    // 鸚鵡想了想……也故意滑倒
    { at: 5.5, actor: 'parrot', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 6.0, actor: 'parrot', do: 'moveTo', to: { x: 92, y: 68.6 }, dur: 0.3 },
    { at: 6.3, actor: 'parrot', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 6.4, actor: 'peel', do: 'vanish', dur: 0.2 },
    // 起來；一起打哈欠睡著
    { at: 7.0, actor: 'monkey', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 7.0, actor: 'monkey', do: 'moveTo', to: { x: 30, y: 69.5 }, dur: 0.4 },
    { at: 7.0, actor: 'parrot', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 7.0, actor: 'parrot', do: 'moveTo', to: { x: 130, y: 68.6 }, dur: 0.4 },
    { at: 8.3, actor: 'monkey', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 8.7, actor: 'parrot', do: 'squash', amount: -0.15, dur: 0.4 },
  ],
  builds: [
    // 飛起來的香蕉皮
    { at: 6.4, dur: 0.7, strokes: [0, 1, 2], from: 'peel', color: '#F5C542' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'monkey', emoji: '🍌', dur: 0.6 },
    { at: 1.0, kind: 'bubble', actor: 'parrot', emoji: '🍌', dur: 0.6 },
    { at: 4.9, kind: 'burst', actor: 'monkey', dur: 0.4 },
    { at: 5.3, kind: 'dizzy', actor: 'monkey', dur: 1.2 },
    { at: 5.5, kind: 'bubble', actor: 'parrot', emoji: '🤔', dur: 0.5 },
    { at: 6.6, kind: 'pop', actor: 'parrot', emoji: '😆', dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'monkey', emoji: '🥱', dur: 0.5 },
    { at: 8.7, kind: 'pop', actor: 'parrot', emoji: '🥱', dur: 0.5 },
    { at: 9.2, kind: 'zzz', actor: 'monkey', dur: 0.8 },
    { at: 9.3, kind: 'zzz', actor: 'parrot', dur: 0.7 },
  ],
  camera: [
    { at: 5.5, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 84, y: 62 } },
  ],
  cues: [
    { at: 1.0, say: '也' },
    { at: 1.6, sfx: 'boing' }, { at: 2.1, sfx: 'boing' },
    { at: 2.9, sfx: 'whoosh' }, { at: 3.5, sfx: 'whoosh' },
    { at: 4.8, sfx: 'slide' },
    { at: 5.0, sfx: 'bonk' },
    { at: 6.3, sfx: 'bonk' },
    { at: 7.2, say: '也' },
    { at: 8.2, say: '也是' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
