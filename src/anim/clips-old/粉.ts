import type { Clip } from '../clip'

// 粉（外星人牽引光束）：小外星人想用牽引光束抓戰士守著的一碗麵粉，碗「咚」地撞上自己的飛碟；開到最大，光束反而把飛碟自己吊起來亂甩——
// 撞地板、撞玩具戰士的盾牌（戰士揮劍揮到自己打轉）、撞牆、撞天花板，每撞一下就敲一筆進位，最後一跳坐在拼好的「粉」上面，
// 麵粉碗掉下來扣在他頭上，綠臉變成白白一片。回馬槍：再開一次光束，這次把戰士吸上來，戰士也被麵粉撲成白色。粉、粉、麵粉
// （影片 prompt 的語詞是「粉紅」，但「紅」是多音字，改用字卡的「麵粉」）
const clip: Clip = {
  char: '粉',
  meta: { theme: '外星人牽引光束連環彈跳', cast: '小外星人＋玩具戰士＋麵粉碗', gags: ['光束吸到自己', '飛碟連環彈跳每撞一下敲一筆', '麵粉扣頭變白臉'] },
  duration: 10,
  bg: { top: '#FFF5CF', bottom: '#FFEFC0', floor: '#FFF7E6', scenery: 'room' },
  actors: [
    { id: 'heap', emoji: '🥢', x: 80, y: 73, size: 9 },
    { id: 'stand', emoji: '🪵', x: 148, y: 73.6, size: 8 },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 132, y: 71, size: 14 },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 30, y: 30, size: 14, hidden: true, float: true, flip: true },
    { id: 'puff', emoji: '🥣', x: 148, y: 66.7, size: 7, float: true },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'enter', from: { x: -15, y: 24 }, dur: 0.6, ease: 'out' },
    { at: 0.6, actor: 'alien', do: 'bounce', amount: 1.5, times: 2, dur: 0.4 },
    // 光束一吸：麵粉碗直直飛上來撞到飛碟
    { at: 0.8, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 1.0, actor: 'puff', do: 'moveTo', to: { x: 32, y: 38 }, dur: 0.3, ease: 'in' },
    { at: 1.3, actor: 'alien', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.3, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 1.3, actor: 'puff', do: 'moveTo', to: { x: 56, y: -18 }, dur: 0.35, ease: 'out' },
    // 開到最大……光束繞回來把飛碟自己吊起來甩
    { at: 1.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 1.6, actor: 'alien', do: 'shake', amount: 1, dur: 0.3 },
    { at: 1.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 1.9, actor: 'alien', do: 'moveTo', to: { x: 30, y: 9 }, dur: 0.25, ease: 'out' },
    { at: 1.95, actor: 'alien', do: 'spin', times: 4, dur: 1.4 },
    { at: 2.15, actor: 'alien', do: 'moveTo', to: { x: 60, y: 66 }, dur: 0.25, ease: 'in' },
    { at: 2.4, actor: 'alien', do: 'moveTo', to: { x: 120, y: 60 }, dur: 0.3 },
    { at: 2.7, actor: 'alien', do: 'moveTo', to: { x: 8, y: 40 }, dur: 0.35 },
    { at: 3.05, actor: 'alien', do: 'moveTo', to: { x: 70, y: 5 }, dur: 0.3 },
    { at: 3.35, actor: 'alien', do: 'moveTo', to: { x: 80, y: 8 }, arc: 4, dur: 0.4, ease: 'bounce' },
    // 戰士揮劍擋，揮太大力自己轉圈
    { at: 2.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 2.75, actor: 'warrior', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.35, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 3.35, actor: 'warrior', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 3.4, actor: 'heap', do: 'vanish', dur: 0.3 },
    // 坐在「粉」上面發昏——麵粉碗掉下來扣在頭上，臉變白
    { at: 4.45, actor: 'puff', do: 'moveTo', to: { x: 80, y: 10 }, dur: 0.3, ease: 'in' },
    { at: 4.75, actor: 'alien', do: 'tint', filter: 'grayscale(1) brightness(1.7)' },
    { at: 4.75, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 4.75, actor: 'alien', do: 'squash', amount: 0.25, dur: 0.25 },
    // 開著飛碟滑到右邊，抱著麵粉碗
    { at: 5.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    { at: 5.6, actor: 'alien', do: 'moveTo', to: { x: 132, y: 26 }, dur: 0.6 },
    { at: 5.6, actor: 'puff', do: 'moveTo', to: { x: 132, y: 28 }, dur: 0.6 },
    { at: 5.6, actor: 'alien', do: 'rotateTo', amount: 15, dur: 0.3 },
    { at: 5.9, actor: 'alien', do: 'rotateTo', amount: -15, dur: 0.3 },
    { at: 6.4, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 6.4, actor: 'alien', do: 'bounce', amount: 1.5, times: 3, dur: 0.8 },
    { at: 6.4, actor: 'puff', do: 'bounce', amount: 1.5, times: 3, dur: 0.8 },
    { at: 6.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/idle' },
    // 回馬槍：再開光束——吸上來的是戰士，麵粉碗扣在他頭上
    { at: 8.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 8.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 8.1, actor: 'warrior', do: 'moveTo', to: { x: 132, y: 54 }, dur: 0.5, ease: 'out' },
    { at: 8.6, actor: 'puff', do: 'moveTo', to: { x: 132, y: 46 }, dur: 0.2, ease: 'in' },
    { at: 8.8, actor: 'warrior', do: 'tint', filter: 'grayscale(1) brightness(1.7)' },
    { at: 8.8, actor: 'warrior', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 9.1, actor: 'warrior', do: 'moveTo', to: { x: 132, y: 71 }, dur: 0.3, ease: 'bounce' },
    { at: 9.1, actor: 'puff', do: 'moveTo', to: { x: 132, y: 63 }, dur: 0.3, ease: 'bounce' },
    { at: 9.4, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 9.4, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
  ],
  builds: [
    // 每撞一下，地上那堆筆畫棒就彈一根進位：米（左）先，分（右）後
    { at: 2.4, dur: 0.4, strokes: [0, 1, 2], from: 'heap', color: '#E64980' },
    { at: 2.7, dur: 0.4, strokes: [3, 4, 5], from: 'heap', color: '#E64980' },
    { at: 3.05, dur: 0.4, strokes: [6, 7], from: 'heap', color: '#D6336C' },
    { at: 3.35, dur: 0.4, strokes: [8, 9], from: 'heap', color: '#D6336C' },
  ],
  glyph: [
    { at: 2.4, dur: 0.25, do: 'shake' }, { at: 2.7, dur: 0.25, do: 'shake' }, { at: 3.05, dur: 0.25, do: 'shake' },
    { at: 3.75, dur: 0.5, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' },
  ],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'alien', emoji: '🥣', dur: 0.6 },
    { at: 0.85, kind: 'line', actor: 'alien', target: 'puff', color: '#B2F2BB', width: 2.5, dur: 0.45 },
    { at: 1.3, kind: 'burst', actor: 'alien', emoji: '☁️', n: 6, dy: 8, dur: 0.6 },
    { at: 1.6, kind: 'beam', actor: 'alien', n: 14, dur: 0.35 },
    { at: 2.4, kind: 'burst', actor: 'alien', emoji: '💥', dur: 0.35 },
    { at: 2.7, kind: 'burst', actor: 'alien', emoji: '💥', dur: 0.35 },
    { at: 3.05, kind: 'burst', actor: 'alien', emoji: '💥', dx: 4, dy: 10, dur: 0.35 },
    { at: 3.35, kind: 'burst', actor: 'alien', emoji: '💥', dy: 10, dur: 0.35 },
    { at: 3.5, kind: 'dizzy', actor: 'warrior', dur: 1.6 },
    { at: 3.8, kind: 'dizzy', actor: 'alien', dy: 3, dur: 0.9 },
    { at: 4.75, kind: 'burst', actor: 'puff', emoji: '☁️', n: 7, dy: 16, dur: 0.7 },
    { at: 6.4, kind: 'pop', actor: 'alien', emoji: '💕', dx: -14, dy: 6, dur: 0.8 },
    { at: 8.0, kind: 'beam', actor: 'alien', n: 16, dur: 0.9 },
    { at: 8.8, kind: 'burst', actor: 'puff', emoji: '☁️', n: 7, dur: 0.7 },
  ],
  camera: [
    { at: 2.4, dur: 0.2, do: 'shake', amount: 1.2 },
    { at: 2.7, dur: 0.2, do: 'shake', amount: 1.2 },
    { at: 3.05, dur: 0.2, do: 'shake', amount: 1.2 },
    { at: 3.35, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 0.85, sfx: 'laser' },
    { at: 1.3, say: '粉' },
    { at: 1.3, sfx: 'boing' },
    { at: 1.6, sfx: 'laser' },
    { at: 2.4, sfx: 'bonk' },
    { at: 2.7, sfx: 'bonk' },
    { at: 3.05, sfx: 'bonk' },
    { at: 3.35, sfx: 'bonk' },
    { at: 3.85, say: '粉' },
    { at: 4.75, say: '麵粉' },
    { at: 4.75, sfx: 'poof' },
    { at: 8.0, sfx: 'laser' },
    { at: 8.8, sfx: 'poof' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
