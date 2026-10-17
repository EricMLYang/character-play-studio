import type { Clip } from '../clip'

// 你（v8）：調皮小老鼠看到門後的大起司，衝去鑽門下面——「咚」彈回來轉兩圈；拉布拉多警長吹著哨子衝進來維持秩序，滑過頭溜出畫面。
// 小老鼠拉長身子助跑全速撞門，扁成一張餅，門上的紅木板一片片掉下來排成「你」。警長從另一邊繞回來，尾巴撞到門，起司掉進小老鼠懷裡，鞠躬道謝；警長又滑走了。你、你、謝謝你
const clip: Clip = {
  char: '你',
  meta: { theme: '小老鼠撞門搶起司', cast: '調皮小老鼠＋拉布拉多警長＋紅木板門＋大起司', gags: ['撞門彈回來', '警長滑過頭', '撞扁成一張餅', '起司掉進懷裡'] },
  duration: 10,
  bg: { top: '#D8F5E8', bottom: '#F1FBF6', floor: '#C9A27A', scenery: 'room' },
  actors: [
    { id: 'cheese', emoji: '🧀', x: 138, y: 47, size: 12, hidden: true },
    { id: 'door', emoji: '🚪', x: 138, y: 62.5, size: 34, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 30, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'sheriff', emoji: 'hero:sheriff/run', x: 185, y: 70.7, size: 15 },
  ],
  moves: [
    { at: 0, actor: 'door', do: 'pop', dur: 0.2 },
    { at: 0.1, actor: 'cheese', do: 'pop', dur: 0.3 },
    // 衝進來急煞
    { at: 0.1, actor: 'mouse', do: 'enter', from: { x: -15, y: 71.5 }, dur: 0.45, ease: 'back' },
    { at: 0.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 1.1, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    // 第一次：鑽門下面，「咚」彈回來
    { at: 1.6, actor: 'mouse', do: 'moveTo', to: { x: 122, y: 71.5 }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 1.95, actor: 'door', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 1.95, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.2 },
    { at: 2.0, actor: 'mouse', do: 'moveTo', to: { x: 74, y: 71.5 }, dur: 0.6, arc: 16, ease: 'out' },
    { at: 2.0, actor: 'mouse', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 2.6, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
    // 警長吹哨衝進來，滑過頭溜出左邊
    { at: 2.3, actor: 'sheriff', do: 'moveTo', to: { x: -25, y: 70.7 }, dur: 0.9, ease: 'in' },
    { at: 2.7, actor: 'mouse', do: 'hop', amount: 7, dur: 0.35 },
    // 回到左邊，拉長身子蓄力
    { at: 3.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 3.3, actor: 'mouse', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.35 },
    { at: 3.7, actor: 'mouse', do: 'squash', amount: -0.35, dur: 0.45 },
    { at: 3.7, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.45 },
    // 全速衝鋒——撞扁在門上
    { at: 4.15, actor: 'mouse', do: 'moveTo', to: { x: 124, y: 71.5 }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 4.55, actor: 'mouse', do: 'squash', amount: 0.55, dur: 0.5 },
    { at: 4.55, actor: 'door', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 5.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 5.2, actor: 'mouse', do: 'moveTo', to: { x: 121, y: 71.5 }, dur: 0.3 },
    // 警長從右邊繞回來，轉身時尾巴撞到門，起司掉下來
    { at: 6.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 6.1, actor: 'sheriff', do: 'moveTo', to: { x: 188, y: 70.7 }, dur: 0.01 },
    { at: 6.2, actor: 'sheriff', do: 'moveTo', to: { x: 153, y: 70.7 }, dur: 0.6, ease: 'out' },
    { at: 6.9, actor: 'sheriff', do: 'flip' },
    { at: 7.0, actor: 'sheriff', do: 'moveTo', to: { x: 149, y: 70.7 }, dur: 0.15 },
    { at: 7.1, actor: 'door', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 7.15, actor: 'cheese', do: 'moveTo', to: { x: 121, y: 64 }, dur: 0.45, arc: 8, ease: 'in' },
    { at: 7.15, actor: 'cheese', do: 'spin', times: 1, dur: 0.45 },
    { at: 7.6, actor: 'cheese', do: 'vanish', dur: 0.1 },
    { at: 7.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cheese' },
    { at: 7.6, actor: 'mouse', do: 'squash', amount: 0.2, dur: 0.2 },
    // 謝謝你——鞠躬兩次
    { at: 7.9, actor: 'mouse', do: 'tilt', amount: -20, dur: 0.35 },
    { at: 8.3, actor: 'mouse', do: 'tilt', amount: -20, dur: 0.35 },
    { at: 7.6, actor: 'sheriff', do: 'flip' },
    { at: 8.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    // 回馬槍：警長又吹哨子要走，又滑過頭溜出右邊
    { at: 8.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 9.1, actor: 'sheriff', do: 'flip' },
    { at: 9.2, actor: 'sheriff', do: 'moveTo', to: { x: 190, y: 70.7 }, dur: 0.5, ease: 'in' },
    { at: 9.3, actor: 'mouse', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 撞落的紅木板：左邊兩片斜板 → 亻；右邊的蓋子、鉤子、兩根短木樁 → 尔
    { at: 4.7, dur: 0.35, strokes: [0, 1], from: 'door', color: '#E8483A' },
    { at: 5.0, dur: 0.35, strokes: [2, 3], from: 'door', color: '#E8483A' },
    { at: 5.3, dur: 0.4, strokes: [4, 5, 6], from: 'door', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 0.8, kind: 'bubble', actor: 'mouse', emoji: '🧀', dur: 0.8 },
    { at: 1.95, kind: 'burst', actor: 'mouse', dur: 0.3 },
    { at: 2.6, kind: 'dizzy', actor: 'mouse', dur: 0.7 },
    { at: 2.75, kind: 'pop', actor: 'sheriff', emoji: '📣', dur: 0.3 },
    { at: 2.9, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 4.1, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 4.55, kind: 'burst', actor: 'mouse', n: 1, dur: 0.4 },
    { at: 5.1, kind: 'dizzy', actor: 'mouse', dur: 1.2 },
    { at: 6.85, kind: 'sweat', actor: 'sheriff', dx: -6 },
    { at: 7.6, kind: 'pop', actor: 'mouse', emoji: '❤️', dur: 0.5 },
    { at: 8.0, kind: 'pop', actor: 'sheriff', emoji: '⭐', dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    { at: 3.6, dur: 0.5, do: 'zoom', amount: 1.4, actor: 'mouse' },
    { at: 4.15, dur: 0.2, do: 'follow', actor: 'mouse', amount: 1.3 },
    { at: 4.55, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 4.6, dur: 0.5, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.4, sfx: 'slide' },
    { at: 1.15, say: '你' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 1.95, sfx: 'boing' },
    { at: 2.35, sfx: 'blip' },
    { at: 2.7, sfx: 'slide' },
    { at: 4.15, sfx: 'whoosh' },
    { at: 4.55, sfx: 'bonk' },
    { at: 5.8, say: '你' },
    { at: 7.1, sfx: 'bonk' },
    { at: 7.6, sfx: 'plop' },
    { at: 7.9, say: '謝謝你' },
    { at: 9.2, sfx: 'slide' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
