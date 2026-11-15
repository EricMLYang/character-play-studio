import type { Clip, Move } from '../clip'

// 七：玩具戰士想一劍掃倒花生排好的七塊積木，揮太用力自己轉成陀螺、一塊都沒碰到，背上的盾牌輕輕一碰——七塊積木骨牌般連環倒成長長的彎鉤；
// 戰士追著擋不住，最後一塊壓下翹板把他彈上天，泡棉劍掉下來橫在上面變成一橫，「七」完成。花生舉手數出七顆點點，又在不對的時機敬禮。七、七、七個
const BX = [40, 50, 60, 70, 80, 90, 100]
const FALL = [2.25, 2.7, 3.0, 3.25, 3.42, 3.56, 3.68]
const blockFalls: Move[] = BX.flatMap((_, i): Move[] => [
  { at: FALL[i], actor: `b${i}`, do: 'rotateTo', amount: 90, dur: 0.22, ease: 'in' },
  { at: 4.0, actor: `b${i}`, do: 'vanish', dur: 0.25 },
])

const clip: Clip = {
  char: '七',
  meta: { theme: '戰士揮劍', cast: '玩具戰士＋浣熊花生＋七塊積木＋翹板', gags: ['揮太用力轉成陀螺', '骨牌連環倒成彎鉤', '翹板把自己彈上天'] },
  duration: 10,
  bg: { top: '#FFF2B8', bottom: '#FFFAE6', floor: '#F3E2B3', scenery: 'room' },
  actors: [
    ...BX.map((x, i) => ({ id: `b${i}`, emoji: '🟥', x, y: 71, size: 7 })),
    { id: 'seesaw', emoji: '🛹', x: 116, y: 72.5, size: 11 },
    { id: 'raccoon', emoji: 'hero:raccoon/salute', x: 12, y: 71.5, size: 13, flip: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 30, y: 71, size: 14, hidden: true, flip: true },
    { id: 'sword', emoji: '🗡️', x: 116, y: 60, size: 9, hidden: true, float: true },
  ],
  moves: [
    ...blockFalls,
    // 戰士跺腳進場，指著積木，往後拉一個超大的蓄力
    { at: 0.1, actor: 'warrior', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.7, actor: 'warrior', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.0, actor: 'warrior', do: 'squash', amount: -0.3, dur: 0.5 },
    { at: 1.0, actor: 'warrior', do: 'tilt', amount: -22, dur: 0.5 },
    // 揮太用力：轉兩圈，一塊都沒碰到
    { at: 1.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 1.5, actor: 'warrior', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 2.1, actor: 'warrior', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 2.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 骨牌倒了！戰士追上去想擋，擋不住，站到翹板另一頭
    { at: 2.8, actor: 'warrior', do: 'moveTo', to: { x: 124, y: 71 }, dur: 0.95, ease: 'in' },
    { at: 3.75, actor: 'seesaw', do: 'tilt', amount: -25, dur: 0.3 },
    // 被翹板彈上天，劍飛掉
    { at: 3.8, actor: 'warrior', do: 'moveTo', to: { x: 142, y: 71 }, dur: 1.0, arc: 42, ease: 'linear' },
    { at: 3.8, actor: 'warrior', do: 'spin', dur: 1.0 },
    { at: 3.85, actor: 'sword', do: 'pop', dur: 0.15 },
    { at: 3.85, actor: 'sword', do: 'moveTo', to: { x: 96, y: 14 }, dur: 0.55, ease: 'out' },
    { at: 3.85, actor: 'sword', do: 'spin', dur: 0.55 },
    { at: 4.45, actor: 'sword', do: 'vanish', dur: 0.15 },
    // 一屁股坐下，彈一下，呆看
    { at: 4.8, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 4.8, actor: 'warrior', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 5.1, actor: 'warrior', do: 'bounce', amount: 3, times: 1, dur: 0.4 },
    { at: 5.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 5.9, actor: 'warrior', do: 'hop', amount: 4, dur: 0.35 },
    // 花生舉手數七顆點點
    { at: 6.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 7.7, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.7, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    // 回馬槍：戰士又想帥氣揮一劍——沒有劍了，空手轉到坐倒
    { at: 8.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 8.1, actor: 'warrior', do: 'squash', amount: -0.25, dur: 0.35 },
    { at: 8.45, actor: 'warrior', do: 'spin', times: 2, dur: 0.6 },
    { at: 9.05, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 9.05, actor: 'warrior', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 9.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
  ],
  builds: [
    // 倒下的七塊積木頭尾相接，變成往下彎、再往上勾的那一長筆
    { at: 3.85, dur: 0.5, strokes: [1], from: { x: 70, y: 70 }, color: '#C92A2A' },
    // 泡棉劍掉下來，橫在上面變成一橫
    { at: 4.45, dur: 0.4, strokes: [0], from: 'sword', style: 'drop', color: '#E8590C' },
  ],
  glyph: [{ at: 4.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.25, kind: 'pop', actor: 'raccoon', emoji: '🫡', dur: 0.7 },
    { at: 0.7, kind: 'puff', actor: 'warrior' },
    { at: 0.8, kind: 'bubble', actor: 'warrior', emoji: '💪', dur: 0.7 },
    { at: 2.1, kind: 'dizzy', actor: 'warrior', dur: 0.7 },
    { at: 2.3, kind: 'pop', actor: 'raccoon', emoji: '😮', dur: 0.8 },
    { at: 2.85, kind: 'sweat', actor: 'warrior' },
    { at: 3.75, kind: 'burst', actor: 'seesaw', emoji: '💥', dy: 4, dur: 0.4 },
    { at: 4.8, kind: 'puff', actor: 'warrior' },
    { at: 5.0, kind: 'dizzy', actor: 'warrior', dur: 0.9 },
    { at: 5.95, kind: 'pop', actor: 'warrior', emoji: '👍', dur: 0.7 },
    // 七顆小點點一顆一顆跳出來，排成一道弧
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({
      at: 6.3 + i * 0.12, dur: 1.4 - i * 0.12, kind: 'pop' as const, emoji: '🟡',
      x: 1 + i * 4.4, y: 52 - 7 * Math.sin((Math.PI * i) / 6),
    })),
    { at: 7.75, kind: 'pop', actor: 'raccoon', emoji: '🫡', dur: 0.6 },
    { at: 9.05, kind: 'dizzy', actor: 'warrior', dur: 0.9 },
  ],
  camera: [
    // 骨牌越倒越快時跟著那排推近一點，彈上天前回全景
    { at: 2.3, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 66, y: 60 } },
    { at: 3.5, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 3.78, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.5, sfx: 'whoosh' },
    { at: 2.25, say: '七' },
    { at: 2.7, sfx: 'tap' },
    { at: 3.0, sfx: 'tap' },
    { at: 3.25, sfx: 'tap' },
    { at: 3.45, sfx: 'tap' },
    { at: 3.62, sfx: 'tap' },
    { at: 3.8, sfx: 'boing' },
    { at: 4.8, sfx: 'plop' },
    { at: 4.95, say: '七' },
    { at: 6.4, say: '七個' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 9.05, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
