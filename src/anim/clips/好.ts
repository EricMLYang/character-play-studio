import type { Clip } from '../clip'

// 好：熊廚師煮湯給貓頭鷹評審試喝。第一口——「呸！」好難喝；加一根辣椒——辣到噴火！加一大瓢蜂蜜……
// 貓頭鷹喝一口，眼睛發亮、翅膀一拍，湯匙和蜂蜜飛成「好」！熊得意地自己也喝一口——結果是加錯的辣椒那一鍋。好、好、好吃
const clip: Clip = {
  char: '好',
  meta: { theme: '料理比賽', cast: '熊廚師＋貓頭鷹評審', gags: ['越試越糟', '辣到噴火', '終於好吃', '自己喝到辣的'] },
  duration: 10,
  bg: { top: '#FFEBD6', bottom: '#FFF8EE', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'pot', emoji: '🍲', x: 44, y: 70, size: 18, hidden: true },
    { id: 'bear', emoji: '🐻', x: 22, y: 68.6, size: 20, hidden: true },
    { id: 'owl', emoji: '🦉', x: 128, y: 68.6, size: 20, hidden: true },
    { id: 'chili', emoji: '🌶️', x: 44, y: 52, size: 10, hidden: true, float: true },
    { id: 'honey', emoji: '🍯', x: 44, y: 52, size: 11, hidden: true, float: true },
    { id: 'spoon', emoji: '🥄', x: 116, y: 60, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'pot', do: 'pop' },
    { at: 0.1, actor: 'bear', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    { at: 0.3, actor: 'owl', do: 'enter', from: { x: 175, y: 68.6 }, dur: 0.6 },
    { at: 0.8, actor: 'spoon', do: 'pop' },
    // 第一口——呸！
    { at: 1.4, actor: 'owl', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 1.8, actor: 'owl', do: 'shake', amount: 1.5, dur: 0.5 },
    // 加辣椒——辣到噴火
    { at: 2.6, actor: 'chili', do: 'pop', dur: 0.2 },
    { at: 2.8, actor: 'chili', do: 'moveTo', to: { x: 44, y: 66 }, dur: 0.3 },
    { at: 3.1, actor: 'chili', do: 'vanish', dur: 0.1 },
    { at: 3.6, actor: 'owl', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 4.0, actor: 'owl', do: 'hop', amount: 12, dur: 0.5 },
    // 加一大瓢蜂蜜
    { at: 4.9, actor: 'honey', do: 'pop', dur: 0.2 },
    { at: 5.1, actor: 'honey', do: 'tilt', amount: 60, dur: 0.4 },
    { at: 5.5, actor: 'honey', do: 'vanish', dur: 0.2 },
    { at: 5.6, actor: 'pot', do: 'flash', dur: 0.4 },
    // 貓頭鷹喝一口——眼睛發亮
    { at: 6.0, actor: 'owl', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 6.4, actor: 'owl', do: 'flash', dur: 0.5 },
    { at: 6.5, actor: 'owl', do: 'hop', amount: 6, dur: 0.4 },
    { at: 6.5, actor: 'spoon', do: 'vanish', dur: 0.2 },
    // 熊自己也喝一口——喝到辣的
    { at: 8.4, actor: 'bear', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 8.8, actor: 'bear', do: 'hop', amount: 12, dur: 0.5 },
  ],
  builds: [
    // 湯匙 → 女；蜂蜜 → 子
    { at: 6.55, dur: 0.5, strokes: [0, 1, 2], from: 'owl', color: '#E8508A' },
    { at: 6.9, dur: 0.5, strokes: [3, 4, 5], from: 'pot', color: '#E3A23A' },
  ],
  glyph: [{ at: 7.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'bear', emoji: '🍲', dur: 0.7 },
    { at: 1.8, kind: 'pop', actor: 'owl', emoji: '🤢', dur: 0.7 },
    { at: 2.4, kind: 'sweat', actor: 'bear' },
    { at: 4.0, kind: 'fountain', actor: 'owl', emoji: '🔥', n: 6, dur: 0.6 },
    { at: 4.1, kind: 'pop', actor: 'owl', emoji: '🥵', dur: 0.6, dx: -12 },
    { at: 5.6, kind: 'burst', actor: 'pot', emoji: '✨', n: 6, dur: 0.6 },
    { at: 6.4, kind: 'burst', actor: 'owl', emoji: '⭐', n: 6, dur: 0.6 },
    { at: 6.5, kind: 'pop', actor: 'owl', emoji: '😋', dur: 0.8, dx: -12 },
    { at: 8.8, kind: 'fountain', actor: 'bear', emoji: '🔥', n: 6, dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'bear', emoji: '🥵', dur: 0.7, dx: 6 },
  ],
  camera: [
    { at: 4.0, dur: 0.4, do: 'shake', amount: 1.4 },
    { at: 6.3, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 120, y: 60 } },
  ],
  cues: [
    { at: 1.0, say: '好' },
    { at: 1.4, sfx: 'gulp' },
    { at: 1.8, sfx: 'deflate' },
    { at: 2.8, sfx: 'plop' },
    { at: 3.6, sfx: 'gulp' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 5.1, sfx: 'splash' },
    { at: 6.0, sfx: 'gulp' },
    { at: 6.4, sfx: 'blip' },
    { at: 7.5, say: '好' },
    { at: 8.4, say: '好吃' },
    { at: 8.8, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
