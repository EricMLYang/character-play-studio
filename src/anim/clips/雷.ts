import type { Clip, Move } from '../clip'

// 雷：桶子海盜和積木小隊拿泡棉劍決鬥，兩邊都揮空、轉成陀螺，最後「咚」一聲撞頭，各自跌回角落轉星星；
// 飛上天的兩把劍、鸚鵡的棲木和積木凸點掉下來拼成「雨」，積木小隊抖落的積木拼成「田」。海盜拍桶子肚子「轟」出一朵小雷雲，
// 結果淋到自己；最後臭臉鸚鵡飛過去，偏偏停在積木塔頭上，塔晃得東倒西歪。雷、雷、打雷
// 拿在手上／站在肩上的東西：抄一份走路的動作，位置偏移 dx、dy
const carry = (moves: Move[], id: string, dx: number, dy: number): Move[] => moves
  .filter((m) => m.do === 'moveTo' || m.do === 'enter')
  .map((m) => ({ ...m, actor: id, to: m.to && { x: m.to.x + dx, y: m.to.y + dy }, from: m.from && { x: m.from.x + dx, y: m.from.y + dy } }))

const pirateWalk: Move[] = [
  { at: 0, actor: 'pirate', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.6, ease: 'out' },
  { at: 1.0, actor: 'pirate', do: 'moveTo', to: { x: 20, y: 71.1 }, dur: 0.3 },
  { at: 1.4, actor: 'pirate', do: 'moveTo', to: { x: 62, y: 71.1 }, dur: 0.35, anticipate: 3, ease: 'in' },
  { at: 2.05, actor: 'pirate', do: 'moveTo', to: { x: 72.5, y: 71.1 }, dur: 0.3, ease: 'in' },
]
const brickWalk: Move[] = [
  { at: 0, actor: 'brick', do: 'enter', from: { x: 180, y: 70.7 }, dur: 0.6, ease: 'out' },
  { at: 1.0, actor: 'brick', do: 'moveTo', to: { x: 140, y: 70.7 }, dur: 0.3 },
  { at: 1.4, actor: 'brick', do: 'moveTo', to: { x: 98, y: 70.7 }, dur: 0.35, anticipate: 3, ease: 'in' },
  { at: 2.05, actor: 'brick', do: 'moveTo', to: { x: 87.5, y: 70.7 }, dur: 0.3, ease: 'in' },
]

const clip: Clip = {
  char: '雷',
  meta: { theme: '甲板決鬥', cast: '玩具海盜＋積木小隊＋鸚鵡＋泡棉劍', gags: ['揮空轉陀螺', '撞頭咚', '拍肚子打雷淋到自己', '鸚鵡停在積木塔上'] },
  duration: 10,
  bg: { top: '#CDEBFF', bottom: '#EEF8FF', floor: '#F1DFA6', scenery: 'sea' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 24, y: 46, size: 11, hidden: true, float: true },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 24, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'swordP', emoji: '🗡️', x: 33, y: 66, size: 8, hidden: true, float: true, flip: true },
    { id: 'parrot', emoji: '🦜', x: 28, y: 62, size: 7, hidden: true, float: true, flip: true },
    { id: 'brick', emoji: 'hero:brick/idle', x: 136, y: 70.7, size: 15, hidden: true },
    { id: 'swordB', emoji: '🗡️', x: 127, y: 66, size: 8, hidden: true, float: true },
    { id: 'stick', emoji: '🥢', x: 80, y: 52, size: 7, hidden: true, float: true },
    { id: 'studs', emoji: '🟦', x: 80, y: 56, size: 5, hidden: true, float: true },
  ],
  moves: [
    // 海盜（劍和鸚鵡跟著走）、積木小隊（劍跟著走）；最後撞頭那一步劍另外寫
    ...pirateWalk,
    ...carry(pirateWalk.filter((m) => m.at < 2), 'swordP', 9, -5),
    ...carry(pirateWalk, 'parrot', 4, -9),
    ...brickWalk,
    ...carry(brickWalk.filter((m) => m.at < 2), 'swordB', -9, -5),
    // 鸚鵡轉頭不理人
    { at: 0.85, actor: 'parrot', do: 'flip' },
    // 大大地往後蓄力……揮空，轉成陀螺
    { at: 1.0, actor: 'pirate', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 1.0, actor: 'brick', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 1.0, actor: 'swordP', do: 'rotateTo', amount: -50, dur: 0.3 },
    { at: 1.0, actor: 'swordB', do: 'rotateTo', amount: 50, dur: 0.3 },
    { at: 1.4, actor: 'swordP', do: 'rotateTo', amount: 140, dur: 0.2 },
    { at: 1.4, actor: 'swordB', do: 'rotateTo', amount: -140, dur: 0.2 },
    { at: 1.6, actor: 'pirate', do: 'spin', times: 2, dur: 0.45 },
    { at: 1.6, actor: 'brick', do: 'spin', times: 2, dur: 0.45 },
    { at: 1.6, actor: 'swordP', do: 'spin', times: 2, dur: 0.45 },
    { at: 1.6, actor: 'swordB', do: 'spin', times: 2, dur: 0.45 },
    { at: 2.05, actor: 'swordP', do: 'moveTo', to: { x: 78, y: 64 }, dur: 0.3, ease: 'in' },
    { at: 2.05, actor: 'swordB', do: 'moveTo', to: { x: 82, y: 64 }, dur: 0.3, ease: 'in' },
    // 咚！撞頭
    { at: 2.35, actor: 'pirate', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 2.35, actor: 'brick', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 2.55, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 2.55, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 2.55, actor: 'pirate', do: 'moveTo', to: { x: 22, y: 71.1 }, dur: 0.5, ease: 'out', arc: 5 },
    { at: 2.55, actor: 'brick', do: 'moveTo', to: { x: 138, y: 70.7 }, dur: 0.5, ease: 'out', arc: 5 },
    // 東西全飛上天
    { at: 2.4, actor: 'swordP', do: 'moveTo', to: { x: 60, y: 6 }, dur: 0.5, ease: 'out' },
    { at: 2.4, actor: 'swordP', do: 'spin', times: 2, dur: 0.5 },
    { at: 2.4, actor: 'swordB', do: 'moveTo', to: { x: 100, y: 6 }, dur: 0.5, ease: 'out' },
    { at: 2.4, actor: 'swordB', do: 'spin', times: 2, dur: 0.5 },
    { at: 2.4, actor: 'stick', do: 'pop', dur: 0.2 },
    { at: 2.45, actor: 'stick', do: 'moveTo', to: { x: 40, y: 7 }, dur: 0.5, ease: 'out' },
    { at: 2.45, actor: 'stick', do: 'spin', times: 1, dur: 0.5 },
    { at: 2.4, actor: 'studs', do: 'pop', dur: 0.2 },
    { at: 2.45, actor: 'studs', do: 'moveTo', to: { x: 120, y: 7 }, dur: 0.5, ease: 'out' },
    { at: 2.4, actor: 'parrot', do: 'moveTo', to: { x: 16, y: 24 }, dur: 0.5, arc: 4 },
    { at: 2.9, actor: 'parrot', do: 'bounce', amount: 1.5, times: 6, dur: 4 },
    // 被拿去當筆畫
    { at: 3.0, actor: 'swordP', do: 'vanish', dur: 0.2 },
    { at: 3.3, actor: 'swordB', do: 'vanish', dur: 0.2 },
    { at: 3.6, actor: 'stick', do: 'vanish', dur: 0.2 },
    { at: 3.95, actor: 'studs', do: 'vanish', dur: 0.2 },
    { at: 4.5, actor: 'brick', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.6, actor: 'brick', do: 'shake', amount: 1, dur: 0.6 },
    { at: 5.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 5.0, actor: 'brick', do: 'swap', emoji: 'hero:brick/idle' },
    // 拍桶子肚子——轟！小雷雲，淋到自己
    { at: 5.85, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 5.9, actor: 'pirate', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 6.1, actor: 'pirate', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: 6.25, actor: 'cloud', do: 'pop', dur: 0.3 },
    { at: 6.45, actor: 'cloud', do: 'swap', emoji: '🌩️' },
    { at: 6.45, actor: 'cloud', do: 'flash', dur: 0.5 },
    { at: 6.5, actor: 'brick', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 7.3, actor: 'cloud', do: 'vanish', dur: 0.3 },
    // 回馬槍：鸚鵡偏偏停在積木塔頭上，塔晃得東倒西歪
    { at: 7.1, actor: 'parrot', do: 'flip' },
    { at: 7.15, actor: 'parrot', do: 'moveTo', to: { x: 80, y: 7 }, dur: 0.5 },
    { at: 7.65, actor: 'parrot', do: 'moveTo', to: { x: 138, y: 59 }, dur: 0.5, ease: 'out' },
    { at: 8.15, actor: 'brick', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 8.15, actor: 'brick', do: 'tilt', amount: 14, dur: 0.35 },
    { at: 8.5, actor: 'brick', do: 'tilt', amount: -14, dur: 0.35 },
    { at: 8.15, actor: 'parrot', do: 'shake', amount: 2, dur: 0.7 },
    { at: 8.4, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 8.95, actor: 'brick', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 9.0, actor: 'pirate', do: 'hop', amount: 4, dur: 0.35 },
    { at: 9.1, actor: 'brick', do: 'hop', amount: 4, dur: 0.35 },
  ],
  builds: [
    // 長劍 → 最上面一橫；彎掉的劍 → 寶蓋框；棲木 → 左豎和中間一豎；凸點 → 四個點；積木 → 田
    { at: 3.0, dur: 0.3, strokes: [0], from: 'swordP', color: '#1C4FC4' },
    { at: 3.3, dur: 0.3, strokes: [2], from: 'swordB', color: '#1C4FC4' },
    { at: 3.6, dur: 0.4, strokes: [1, 3], from: 'stick', color: '#1C4FC4' },
    { at: 3.95, dur: 0.6, strokes: [4, 5, 6, 7], from: 'studs', color: '#3A6FE6' },
    { at: 4.55, dur: 0.8, strokes: [8, 9, 10, 11, 12], from: 'brick', color: '#2457D6' },
  ],
  glyph: [{ at: 5.35, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'pirate', emoji: '😠', dur: 0.4 },
    { at: 0.6, kind: 'pop', actor: 'brick', emoji: '😠', dur: 0.4 },
    { at: 0.9, kind: 'pop', actor: 'parrot', emoji: '😒', dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'pirate', dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'brick', dur: 0.5 },
    { at: 2.35, kind: 'burst', x: 80, y: 58, emoji: '💥', n: 1, dur: 0.5 },
    { at: 2.4, kind: 'burst', x: 80, y: 58, emoji: '⭐', n: 6, dur: 0.6 },
    { at: 3.0, kind: 'dizzy', actor: 'pirate', dur: 1.8 },
    { at: 3.0, kind: 'dizzy', actor: 'brick', dur: 1.8 },
    { at: 5.9, kind: 'burst', actor: 'pirate', emoji: '🥁', n: 1, dur: 0.4 },
    { at: 6.6, kind: 'rain', actor: 'cloud', dur: 0.8 },
    { at: 6.6, kind: 'pop', actor: 'brick', emoji: '😲', dur: 0.5 },
    { at: 7.0, kind: 'sweat', actor: 'pirate' },
    { at: 8.0, kind: 'pop', actor: 'parrot', emoji: '😒', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'pirate', emoji: '😆', dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'brick', emoji: '👋', dur: 0.5 },
  ],
  camera: [
    { at: 1.4, dur: 0.9, do: 'zoom', amount: 1.3, to: { x: 80, y: 58 } },
    { at: 2.35, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 2.6, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.4, sfx: 'whoosh' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.35, sfx: 'bonk' },
    { at: 2.45, say: '雷' },
    { at: 2.6, sfx: 'boing' },
    { at: 5.4, say: '雷' },
    { at: 5.9, sfx: 'tap' },
    { at: 6.1, sfx: 'tap' },
    { at: 6.3, say: '打雷' },
    { at: 6.45, sfx: 'rumble' },
    { at: 7.65, sfx: 'plop' },
    { at: 8.15, sfx: 'boing' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
