import type { Clip } from '../clip'

// 岩：小暴龍拿著香腸想去火山烤，舉了半天火山都沒反應，氣得踢火山一腳——火山大爆發，岩石噴得滿天飛，暴龍抱頭逃跑，
// 岩石掉下來堆成「岩」。牠把香腸丟進岩漿，香腸烤好噴回來，一口吃掉。最後火山打了個嗝，噴得暴龍滿臉煙。岩、岩、岩漿
const clip: Clip = {
  char: '岩',
  meta: { theme: '恐龍＋火山', cast: '小暴龍＋火山', gags: ['等不到反應', '踢了就爆發', '抱頭逃跑', '火山打嗝'] },
  duration: 10,
  bg: { top: '#FFE7D6', bottom: '#FFC8A6', floor: '#A07F66', scenery: 'desert' },
  actors: [
    { id: 'volcano', emoji: '🌋', x: 128, y: 62.7, size: 34, hidden: true },
    { id: 'pebble', emoji: '🪨', x: 128, y: 48, size: 6, hidden: true },
    { id: 'rex', emoji: '🦖', x: 32, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'sausage', emoji: '🌭', x: 42, y: 66, size: 6, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'rex', do: 'enter', dur: 0.7 },
    { at: 0, actor: 'rex', do: 'bounce', dur: 0.7, times: 3, amount: 1.5 },
    { at: 0.3, actor: 'volcano', do: 'pop', dur: 0.4 },
    { at: 1.0, actor: 'sausage', do: 'pop' },
    // 火山打了個小嗝，吐出一顆小岩石
    { at: 1.5, actor: 'pebble', do: 'pop', dur: 0.15 },
    { at: 1.6, actor: 'pebble', do: 'moveTo', to: { x: 108, y: 74.5 }, dur: 0.5, arc: 10 },
    { at: 1.5, actor: 'volcano', do: 'squash', amount: 0.12, dur: 0.25 },
    // 走過去舉著香腸等……沒反應
    { at: 2.2, actor: 'rex', do: 'moveTo', to: { x: 94, y: 70.7 }, dur: 0.6 },
    { at: 2.2, actor: 'sausage', do: 'moveTo', to: { x: 104, y: 62 }, dur: 0.6 },
    { at: 2.9, actor: 'sausage', do: 'shake', dur: 0.6, amount: 0.5 },
    // 踢一腳！
    { at: 3.5, actor: 'rex', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 3.7, actor: 'rex', do: 'moveTo', to: { x: 100, y: 70.7 }, dur: 0.1 },
    { at: 3.75, actor: 'volcano', do: 'shake', dur: 0.8, amount: 2 },
    { at: 3.8, actor: 'pebble', do: 'vanish' },
    // 爆發！抱頭逃跑
    { at: 4.1, actor: 'rex', do: 'moveTo', to: { x: 24, y: 70.7 }, dur: 0.5 },
    { at: 4.1, actor: 'rex', do: 'bounce', dur: 0.5, times: 4, amount: 3 },
    { at: 4.1, actor: 'sausage', do: 'moveTo', to: { x: 34, y: 64 }, dur: 0.5 },
    { at: 4.6, actor: 'rex', do: 'shake', dur: 0.8, amount: 0.8 },
    // 香腸丟進岩漿烤
    { at: 6.0, actor: 'sausage', do: 'moveTo', to: { x: 128, y: 44 }, dur: 0.5, arc: 16 },
    { at: 6.0, actor: 'sausage', do: 'spin', dur: 0.5 },
    { at: 6.5, actor: 'volcano', do: 'flash', dur: 0.8 },
    { at: 6.8, actor: 'sausage', do: 'moveTo', to: { x: 34, y: 62 }, dur: 0.6, arc: 22 },
    { at: 6.8, actor: 'sausage', do: 'spin', dur: 0.6, times: 2 },
    { at: 7.45, actor: 'sausage', do: 'vanish', dur: 0.1 },
    { at: 7.45, actor: 'rex', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 7.65, actor: 'rex', do: 'squash', amount: 0.25, dur: 0.2 },
    // 火山打嗝
    { at: 8.5, actor: 'volcano', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 8.8, actor: 'rex', do: 'shake', dur: 0.5, amount: 0.6 },
  ],
  builds: [
    // 掉下來的岩石：上面先疊成山，火山噴出來的變成石
    { at: 4.5, dur: 0.6, strokes: [0, 1, 2], from: { x: 80, y: 0 }, style: 'drop', color: '#7A5A44' },
    { at: 4.8, dur: 0.9, strokes: [3, 4, 5, 6, 7], from: 'volcano', color: '#E0532F' },
  ],
  glyph: [{ at: 5.1, dur: 0.4, do: 'shake' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'rex', emoji: '🌭', dur: 0.8 },
    { at: 3.2, kind: 'bubble', actor: 'rex', emoji: '😑', dur: 0.5 },
    { at: 4.05, kind: 'fountain', actor: 'volcano', emoji: '🪨', n: 8, dur: 1.0 },
    { at: 4.1, kind: 'pop', actor: 'rex', emoji: '😱', dur: 0.6 },
    { at: 4.6, kind: 'sweat', actor: 'rex' },
    { at: 6.45, kind: 'fountain', actor: 'volcano', emoji: '🔥', n: 7, dur: 1.0 },
    { at: 7.6, kind: 'burst', actor: 'rex', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.75, kind: 'burst', actor: 'rex', emoji: '💨', n: 6, dur: 0.7 },
    { at: 9.1, kind: 'bubble', actor: 'rex', emoji: '😶‍🌫️', dur: 0.8 },
  ],
  camera: [
    { at: 3.75, dur: 0.8, do: 'shake', amount: 2 },
    { at: 6.45, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 120, y: 50 } },
  ],
  cues: [
    { at: 1.5, sfx: 'plop' },
    { at: 1.65, say: '岩' },
    { at: 3.7, sfx: 'bonk' },
    { at: 3.75, sfx: 'rumble' },
    { at: 4.05, sfx: 'poof' },
    { at: 5.75, say: '岩' },
    { at: 6.0, sfx: 'whoosh' },
    { at: 6.7, say: '岩漿' },
    { at: 7.45, sfx: 'gulp' },
    { at: 8.6, sfx: 'hic' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
