import type { Clip } from '../clip'

// 妹：鴨媽媽帶小鴨下水，鴨妹妹站在岸邊不敢下去，腳一碰水就縮回來；哥哥們游過來叫牠，牠搖搖頭。
// 一隻青蛙「呱！」跳到牠旁邊，妹妹嚇得一跳——撲通掉進水裡，結果游得最快，水花變成「妹」。大家都追不上妹妹。妹、妹、妹妹
const clip: Clip = {
  char: '妹',
  meta: { theme: '學游泳', cast: '鴨媽媽＋小鴨們＋鴨妹妹＋青蛙', gags: ['不敢下水', '被嚇一跳掉下去', '結果游最快'] },
  duration: 10,
  bg: { top: '#D9F1FF', bottom: '#EEF9FF', floor: '#3FA6D6', scenery: 'sea' },
  actors: [
    { id: 'rock', emoji: '🪨', x: 22, y: 70, size: 22, hidden: true },
    { id: 'sis', emoji: '🐥', x: 24, y: 58, size: 11, hidden: true, flip: true },
    { id: 'mom', emoji: '🦆', x: 90, y: 76, size: 18, hidden: true },
    { id: 'd1', emoji: '🐤', x: 108, y: 78, size: 10, hidden: true },
    { id: 'd2', emoji: '🐤', x: 120, y: 78, size: 10, hidden: true },
    { id: 'frog', emoji: '🐸', x: 60, y: 40, size: 12, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'rock', do: 'pop' },
    { at: 0.1, actor: 'sis', do: 'pop' },
    { at: 0.2, actor: 'mom', do: 'enter', from: { x: 175, y: 76 }, dur: 0.7 },
    { at: 0.4, actor: 'd1', do: 'enter', from: { x: 175, y: 78 }, dur: 0.7 },
    { at: 0.6, actor: 'd2', do: 'enter', from: { x: 175, y: 78 }, dur: 0.7 },
    // 腳一碰水就縮回來
    { at: 1.6, actor: 'sis', do: 'moveTo', to: { x: 32, y: 62 }, dur: 0.3 },
    { at: 1.9, actor: 'sis', do: 'moveTo', to: { x: 24, y: 58 }, dur: 0.2 },
    { at: 2.1, actor: 'sis', do: 'shake', amount: 1, dur: 0.4 },
    // 哥哥們游過來叫牠——搖搖頭
    { at: 2.8, actor: 'd1', do: 'moveTo', to: { x: 50, y: 78 }, dur: 0.6 },
    { at: 2.9, actor: 'd2', do: 'moveTo', to: { x: 62, y: 78 }, dur: 0.6 },
    { at: 3.6, actor: 'd1', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 3.8, actor: 'sis', do: 'shake', amount: 1.5, dur: 0.5 },
    // 青蛙呱！——妹妹嚇一跳掉進水裡
    { at: 4.6, actor: 'frog', do: 'moveTo', to: { x: 34, y: 60 }, dur: 0.4, arc: 10 },
    { at: 4.6, actor: 'frog', do: 'pop', dur: 0.1 },
    { at: 5.0, actor: 'sis', do: 'hop', amount: 10, dur: 0.4 },
    { at: 5.4, actor: 'sis', do: 'moveTo', to: { x: 44, y: 78 }, dur: 0.3 },
    // 結果游得最快
    { at: 5.9, actor: 'sis', do: 'moveTo', to: { x: 142, y: 78 }, dur: 0.6 },
    { at: 6.0, actor: 'd1', do: 'moveTo', to: { x: 104, y: 78 }, dur: 1.0 },
    { at: 6.0, actor: 'd2', do: 'moveTo', to: { x: 113, y: 78 }, dur: 1.0 },
    { at: 6.1, actor: 'mom', do: 'moveTo', to: { x: 124, y: 76 }, dur: 1.0 },
    { at: 8.6, actor: 'sis', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 撲通濺起的水花：女、未
    { at: 5.5, dur: 0.5, strokes: [0, 1, 2], from: 'sis', color: '#3D8BEF' },
    { at: 5.9, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: 'sis', color: '#E8508A' },
  ],
  glyph: [{ at: 6.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.9, kind: 'pop', actor: 'sis', emoji: '🥶', dur: 0.6 },
    { at: 3.7, kind: 'pop', actor: 'd1', emoji: '👋', dur: 0.6 },
    { at: 3.9, kind: 'pop', actor: 'sis', emoji: '🙅', dur: 0.6 },
    { at: 4.95, kind: 'pop', actor: 'frog', emoji: '❗', dur: 0.4 },
    { at: 5.0, kind: 'pop', actor: 'sis', emoji: '😱', dur: 0.4 },
    { at: 5.5, kind: 'fountain', x: 44, y: 74, n: 8, dur: 0.6 },
    { at: 5.9, kind: 'puff', actor: 'sis', dur: 0.6 },
    { at: 6.9, kind: 'sweat', actor: 'd1' },
    { at: 8.7, kind: 'pop', actor: 'sis', emoji: '😎', dur: 0.8, dx: -8 },
  ],
  camera: [
    { at: 4.8, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 34, y: 62 } },
  ],
  cues: [
    { at: 1.2, say: '妹' },
    { at: 1.9, sfx: 'splash' },
    { at: 4.6, sfx: 'boing' },
    { at: 5.0, sfx: 'blip' },
    { at: 5.5, sfx: 'splash' },
    { at: 5.9, sfx: 'whoosh' },
    { at: 7.0, say: '妹' },
    { at: 7.9, say: '妹妹' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
