import type { Clip } from '../clip'

// 你（重做）：調皮小老鼠想拿門頂上的大起司，跳上去只抓到門板一半、滑下來；退到底助跑全速撞門，扁成一張餅，門頂的紅書藍書飛上天落成「你」。
// 起司也被震飛，剛好掉在衝進來的警長頭上。國字讓到上方，警長在中間把起司交給小老鼠，小老鼠鞠躬再飛撲抱住他（謝謝你）；
// 回馬槍：警長開心到尾巴狂搖，整隻轉成直升機飛起來，把小老鼠甩到另一邊。你、你、謝謝你
const M = 68.6 // 小老鼠（size 20）站在地上的 y
const S = 67.3 // 警長（size 23）
const C = -14 // 起司頂在警長頭上（相對他的 y）

const clip: Clip = {
  char: '你',
  meta: { theme: '小老鼠撞門搶起司', cast: '調皮小老鼠＋拉布拉多警長＋門＋大起司＋紅書藍書', gags: ['跳上門只抓到一半滑下來', '助跑撞門扁成一張餅', '起司掉在警長頭上', '鞠躬再飛撲抱住', '尾巴搖成直升機把小老鼠甩飛'] },
  duration: 10,
  bg: { top: '#D8F5E8', bottom: '#F1FBF6', floor: '#C9A27A', scenery: 'room' },
  actors: [
    { id: 'door', emoji: '🚪', x: 136, y: 62.5, size: 34 },
    { id: 'book1', emoji: '📕', x: 127, y: 49, size: 9, pivot: 'center' },
    { id: 'book2', emoji: '📘', x: 146, y: 49, size: 9, pivot: 'center' },
    { id: 'cheese', emoji: '🧀', x: 137, y: 47.5, size: 12, pivot: 'center' },
    { id: 'sheriff', emoji: 'hero:sheriff/run', x: 30, y: S, size: 23, hidden: true, flip: true, pivot: 'center' },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 30, y: M, size: 20, hidden: true, flip: true },
  ],
  moves: [
    // 衝進來，看到門頂上的大起司
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -6, y: M }, dur: 0.5, ease: 'out' },
    { at: 0.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 0.65, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.8, actor: 'cheese', do: 'tilt', amount: 10, dur: 0.4 },
    // 第一次：跳上門，只抓到一半
    { at: 1.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 1.25, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.5, actor: 'mouse', do: 'moveTo', to: { x: 121, y: 54 }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 1.95, actor: 'mouse', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.95, actor: 'door', do: 'shake', amount: 0.4, dur: 0.3 },
    // 一路滑下來
    { at: 2.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 2.35, actor: 'mouse', do: 'moveTo', to: { x: 121, y: M }, dur: 0.3, ease: 'in' },
    // 退到最左邊，拉長身子蓄力
    { at: 2.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 2.85, actor: 'mouse', do: 'moveTo', to: { x: 20, y: M }, dur: 0.5 },
    { at: 3.4, actor: 'mouse', do: 'squash', amount: -0.35, dur: 0.45 },
    { at: 3.4, actor: 'mouse', do: 'shake', amount: 0.7, dur: 0.45 },
    // 全速衝鋒——撞扁在門上
    { at: 3.85, actor: 'mouse', do: 'moveTo', to: { x: 116, y: M }, dur: 0.32, anticipate: 4, ease: 'in' },
    { at: 4.17, actor: 'mouse', do: 'squash', amount: 0.6, dur: 0.7 },
    { at: 4.17, actor: 'door', do: 'shake', amount: 1.4, dur: 0.6 },
    // 門頂的書和起司都被震飛
    { at: 4.17, actor: 'book1', do: 'moveTo', to: { x: 96, y: 8 }, dur: 0.35, ease: 'out' },
    { at: 4.17, actor: 'book1', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.17, actor: 'book2', do: 'moveTo', to: { x: 130, y: 4 }, dur: 0.4, ease: 'out' },
    { at: 4.17, actor: 'book2', do: 'spin', times: -2, dur: 0.45 },
    { at: 4.17, actor: 'cheese', do: 'moveTo', to: { x: 150, y: -14 }, dur: 0.4, ease: 'out' },
    { at: 4.17, actor: 'cheese', do: 'spin', times: 2, dur: 0.4 },
    // 警長吹著哨子衝進來
    { at: 4.3, actor: 'sheriff', do: 'enter', from: { x: -25, y: S }, dur: 0.55, ease: 'out' },
    { at: 4.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    // 起司從天上掉下來，「咚」剛好落在警長頭上
    { at: 4.9, actor: 'cheese', do: 'moveTo', to: { x: 30, y: S + C }, dur: 0.5, ease: 'in' },
    { at: 4.9, actor: 'cheese', do: 'spin', times: -2, dur: 0.5 },
    { at: 5.4, actor: 'sheriff', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 5.4, actor: 'cheese', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 4.5, actor: 'book1', do: 'vanish', dur: 0.1 },
    { at: 4.85, actor: 'book2', do: 'vanish', dur: 0.1 },
    // 小老鼠從門上剝下來
    { at: 5.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 5.25, actor: 'mouse', do: 'moveTo', to: { x: 122, y: M }, dur: 0.3, ease: 'out' },
    { at: 5.9, actor: 'mouse', do: 'shake', amount: 1, dur: 0.35 },
    { at: 6.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 6.25, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    // 國字讓位：兩個走到中間
    { at: 6.6, actor: 'sheriff', do: 'moveTo', to: { x: 64, y: S }, dur: 0.55 },
    { at: 6.6, actor: 'cheese', do: 'moveTo', to: { x: 64, y: S + C }, dur: 0.55 },
    { at: 6.6, actor: 'mouse', do: 'flip' },
    { at: 6.6, actor: 'mouse', do: 'moveTo', to: { x: 96, y: M }, dur: 0.55 },
    // 警長低頭，起司滑進小老鼠懷裡
    { at: 7.2, actor: 'sheriff', do: 'tilt', amount: 18, dur: 0.4 },
    { at: 7.25, actor: 'cheese', do: 'moveTo', to: { x: 92, y: 69 }, arc: 8, dur: 0.3, ease: 'in' },
    { at: 7.55, actor: 'cheese', do: 'vanish', dur: 0.05 },
    { at: 7.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cheese' },
    // 謝謝你——深深一鞠躬，再飛撲抱住警長
    { at: 7.75, actor: 'mouse', do: 'tilt', amount: 40, dur: 0.45 },
    { at: 8.25, actor: 'mouse', do: 'moveTo', to: { x: 74, y: 60 }, arc: 8, dur: 0.25, ease: 'out' },
    { at: 8.5, actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.25 },
    // 回馬槍：警長開心到尾巴狂搖，整隻轉成直升機飛起來
    { at: 8.6, actor: 'sheriff', do: 'shake', amount: 1.5, dur: 0.25 },
    { at: 8.6, actor: 'mouse', do: 'shake', amount: 1.5, dur: 0.25 },
    { at: 8.85, actor: 'sheriff', do: 'spin', times: 3, dur: 0.65, ease: 'linear' },
    { at: 8.85, actor: 'sheriff', do: 'moveTo', to: { x: 64, y: 50 }, dur: 0.15, ease: 'out' },
    { at: 8.85, actor: 'mouse', do: 'moveTo', to: { x: 74, y: 45 }, dur: 0.2, ease: 'out' },
    // 小老鼠被甩到右邊
    { at: 9.05, actor: 'mouse', do: 'moveTo', to: { x: 132, y: M }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 9.05, actor: 'mouse', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    // 警長一邊轉一邊飄到左邊落地
    { at: 9.0, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: S }, arc: 6, dur: 0.45, ease: 'inOut' },
    { at: 9.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
  ],
  builds: [
    // 飛上天的紅書 → 亻；藍書 → 尔
    { at: 4.5, dur: 0.45, strokes: [0, 1], from: 'book1', color: '#E8483A' },
    { at: 4.85, dur: 0.6, strokes: [2, 3, 4, 5, 6], from: 'book2', color: '#1C7ED6' },
  ],
  glyph: [
    { at: 5.5, dur: 0.4, do: 'wobble' },
    { at: 6.3, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.45, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 0.7, kind: 'bubble', actor: 'mouse', emoji: '🧀', dur: 0.7 },
    { at: 1.95, kind: 'sweat', actor: 'mouse' },
    { at: 2.35, kind: 'pop', actor: 'mouse', emoji: '😣', dur: 0.45 },
    { at: 3.4, kind: 'puff', actor: 'mouse', dx: -6, dy: 10, dur: 0.45 },
    { at: 4.17, kind: 'burst', actor: 'mouse', n: 1, dx: 6, dy: 4, dur: 0.4 },
    { at: 4.95, kind: 'pop', actor: 'sheriff', emoji: '📣', dx: 8, dur: 0.4 },
    { at: 5.4, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: 10, dy: 6, dur: 0.4 },
    { at: 5.3, kind: 'dizzy', actor: 'mouse', dur: 0.9 },
    { at: 6.25, kind: 'pop', actor: 'mouse', emoji: '😍', dx: 8, dur: 0.4 },
    { at: 7.6, kind: 'pop', actor: 'mouse', emoji: '❤️', dx: 10, dy: 6, dur: 0.4 },
    { at: 8.5, kind: 'burst', actor: 'sheriff', emoji: '💕', n: 6, dx: 4, dy: 8, dur: 0.6 },
    { at: 8.9, kind: 'puff', actor: 'sheriff', dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'mouse', emoji: '😵', dx: 6, dur: 0.4 },
    { at: 9.55, kind: 'pop', actor: 'mouse', emoji: '😆', dx: 8, dur: 0.45 },
    { at: 9.5, kind: 'dizzy', actor: 'sheriff', dur: 0.5 },
  ],
  camera: [
    { at: 4.17, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: 4.17, dur: 0.04, level: -0.45 },
    { at: 4.21, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'slide' },
    { at: 0.65, say: '你' },
    { at: 1.5, sfx: 'boing' },
    { at: 2.35, sfx: 'slide' },
    { at: 3.85, sfx: 'whoosh' },
    { at: 4.17, sfx: 'bonk' },
    { at: 4.95, sfx: 'blip' },
    { at: 5.4, sfx: 'plop' },
    { at: 5.55, say: '你' },
    { at: 7.25, sfx: 'whoosh' },
    { at: 7.75, say: '謝謝你' },
    { at: 8.85, sfx: 'whoosh' },
    { at: 9.05, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
