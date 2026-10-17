import type { Clip } from '../clip'

// 燕：調皮小老鼠想跟高處的小燕子擊掌，跳了也搆不到，乾脆閃電般疊起石頭、木箱、木板、長板，自己站上去。拉布拉多警長吹著哨子衝進來要阻止——滑過頭衝出畫面，
// 一陣風吹得塔東搖西晃。老鼠再放上一顆小瓜子……「轟」！塔倒下，零件落成「燕」：長板是廿、兩塊木板是北、木箱是口、四顆石頭是四點。
// 老鼠埋進乾草堆只露出眼睛，小燕子飛下來停在牠頭上，終於擊掌成功。警長又吹哨衝回來，風一吹，老鼠又掉回草堆。燕、燕、燕子
const clip: Clip = {
  char: '燕',
  meta: { theme: '疊高高擊掌', cast: '調皮小老鼠＋拉布拉多警長＋小燕子＋石頭木箱木板', gags: ['跳起來搆不到', '疊疊樂越疊越晃', '警長衝過頭', '多放一顆瓜子全倒', '埋進草堆只露眼睛'] },
  duration: 10,
  bg: { top: '#FFF0BF', bottom: '#FFF8E0', floor: '#D9B98A', scenery: 'hills' },
  actors: [
    { id: 'ledge', emoji: '🪵', x: 18, y: 22, size: 9, float: true },
    { id: 'bird', emoji: '🐦', x: 18, y: 14, size: 8, float: true, flip: true },
    { id: 'pebble', emoji: '🪨', x: 80, y: 74, size: 7, hidden: true },
    { id: 'crate', emoji: '📦', x: 80, y: 67, size: 8, hidden: true },
    { id: 'board', emoji: '🪵', x: 80, y: 60, size: 8, hidden: true },
    { id: 'plank', emoji: '🟫', x: 80, y: 53, size: 8, hidden: true },
    { id: 'seed', emoji: '🌰', x: 84, y: 47, size: 4, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 62, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'hay', emoji: '🌾', x: 132, y: 70, size: 13, hidden: true },
    { id: 'eyes', emoji: '👀', x: 132, y: 64, size: 5, hidden: true },
    { id: 'dog', emoji: 'hero:sheriff/whistle', x: -20, y: 71, size: 14, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -15, y: 71.5 }, dur: 0.5, ease: 'out' },
    { at: 0.1, actor: 'bird', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 舉手要擊掌——跳了也搆不到
    { at: 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 0.65, actor: 'mouse', do: 'hop', amount: 10, dur: 0.4 },
    // 閃電般疊起來
    { at: 1.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 1.1, actor: 'pebble', do: 'pop', dur: 0.2 },
    { at: 1.3, actor: 'crate', do: 'drop', dur: 0.25 },
    { at: 1.5, actor: 'board', do: 'drop', dur: 0.25 },
    { at: 1.7, actor: 'plank', do: 'drop', dur: 0.25 },
    { at: 1.95, actor: 'mouse', do: 'moveTo', to: { x: 80, y: 43.5 }, arc: 10, dur: 0.35 },
    { at: 2.0, actor: 'plank', do: 'tilt', amount: 6, dur: 0.4 },
    // 警長吹哨衝進來——滑過頭衝出畫面
    { at: 2.45, actor: 'dog', do: 'enter', from: { x: -25, y: 71 }, dur: 0.05 },
    { at: 2.5, actor: 'dog', do: 'moveTo', to: { x: 190, y: 71 }, dur: 0.6, ease: 'in' },
    // 一陣風，塔東搖西晃，老鼠在頂上踮腳揮手
    { at: 2.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    ...['pebble', 'crate', 'board', 'plank', 'mouse'].flatMap((id, i) => [
      { at: 2.9, actor: id, do: 'tilt' as const, amount: 3 + i * 3, dur: 0.4 },
      { at: 3.3, actor: id, do: 'tilt' as const, amount: -(3 + i * 3), dur: 0.4 },
    ]),
    { at: 3.0, actor: 'mouse', do: 'shake', amount: 1.5, dur: 0.6 },
    // 得意地多放一顆小瓜子……停一拍……轟！
    { at: 3.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cheese' },
    { at: 4.0, actor: 'seed', do: 'pop', dur: 0.2 },
    { at: 4.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 4.5, actor: 'plank', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 4.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 4.8, actor: 'mouse', do: 'moveTo', to: { x: 132, y: 74 }, arc: 14, dur: 0.5, ease: 'in' },
    { at: 4.8, actor: 'mouse', do: 'spin', times: 1, dur: 0.5 },
    { at: 4.8, actor: 'seed', do: 'moveTo', to: { x: 120, y: 74 }, arc: 10, dur: 0.6 },
    { at: 4.85, actor: 'plank', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'board', do: 'vanish', dur: 0.2 },
    { at: 5.2, actor: 'crate', do: 'vanish', dur: 0.2 },
    { at: 5.4, actor: 'pebble', do: 'vanish', dur: 0.2 },
    // 埋進乾草堆，只露出兩隻眼睛
    { at: 5.25, actor: 'hay', do: 'pop', dur: 0.3 },
    { at: 5.6, actor: 'eyes', do: 'pop', dur: 0.2 },
    { at: 6.0, actor: 'eyes', do: 'squash', amount: 0.4, dur: 0.15 },
    // 小燕子飛下來停在牠頭上
    { at: 6.1, actor: 'bird', do: 'flip' },
    { at: 6.2, actor: 'bird', do: 'moveTo', to: { x: 132, y: 58 }, arc: 12, dur: 0.6 },
    // 老鼠從草堆裡鑽出來，終於擊掌
    { at: 7.1, actor: 'eyes', do: 'vanish', dur: 0.1 },
    { at: 7.1, actor: 'mouse', do: 'moveTo', to: { x: 132, y: 61 }, dur: 0.3, ease: 'back' },
    { at: 7.1, actor: 'bird', do: 'moveTo', to: { x: 136, y: 49 }, dur: 0.3, ease: 'back' },
    { at: 7.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 7.6, actor: 'bird', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：警長又吹哨衝回來，風一吹，老鼠又掉回草堆
    { at: 8.3, actor: 'dog', do: 'moveTo', to: { x: 147, y: 71 }, dur: 0.4, ease: 'back' },
    { at: 8.3, actor: 'dog', do: 'flip' },
    { at: 8.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 8.7, actor: 'mouse', do: 'tilt', amount: -20, dur: 0.3 },
    { at: 8.7, actor: 'bird', do: 'moveTo', to: { x: 128, y: 38 }, dur: 0.4, ease: 'out' },
    { at: 9.0, actor: 'mouse', do: 'moveTo', to: { x: 132, y: 74 }, dur: 0.25, ease: 'in' },
    { at: 9.3, actor: 'eyes', do: 'pop', dur: 0.2 },
    { at: 9.3, actor: 'bird', do: 'moveTo', to: { x: 132, y: 58 }, dur: 0.4 },
  ],
  builds: [
    // 塔倒下：長板 → 廿、木箱 → 口、兩塊木板 → 北、四顆石頭 → 四點
    { at: 4.85, dur: 0.5, strokes: [0, 1, 2, 3], from: 'plank', color: '#1864AB' },
    { at: 5.0, dur: 0.5, strokes: [7, 8, 9, 10, 11], from: 'board', color: '#1971C2' },
    { at: 5.2, dur: 0.45, strokes: [4, 5, 6], from: 'crate', color: '#1864AB' },
    { at: 5.4, dur: 0.6, strokes: [12, 13, 14, 15], from: 'pebble', color: '#4263EB' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'mouse', emoji: '✋', dx: 4, dur: 0.4 },
    { at: 1.1, kind: 'sweat', actor: 'mouse' },
    { at: 1.1, kind: 'puff', actor: 'mouse', dur: 0.8 },
    { at: 2.8, kind: 'puff', x: 110, y: 74, dur: 0.5 },
    { at: 3.0, kind: 'sweat', actor: 'mouse' },
    { at: 4.0, kind: 'pop', actor: 'mouse', emoji: '😏', dur: 0.4 },
    { at: 4.85, kind: 'burst', x: 80, y: 60, n: 1, dur: 0.5 },
    { at: 5.3, kind: 'puff', actor: 'hay', dur: 0.5 },
    { at: 7.6, kind: 'burst', actor: 'bird', emoji: '✨', n: 5, dx: -3, dur: 0.5 },
    { at: 8.4, kind: 'pop', actor: 'dog', emoji: '🎵', dx: -5, dur: 0.4 },
    { at: 8.7, kind: 'puff', actor: 'dog', dx: -6, dur: 0.4 },
    { at: 9.4, kind: 'pop', actor: 'dog', emoji: '😅', dur: 0.5 },
  ],
  camera: [
    { at: 3.9, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 80, y: 45 } },
    { at: 4.8, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.85, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.15, say: '燕' },
    { at: 1.3, sfx: 'tap' },
    { at: 1.5, sfx: 'tap' },
    { at: 1.7, sfx: 'tap' },
    { at: 2.5, sfx: 'blip' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 4.5, sfx: 'crack' },
    { at: 4.85, sfx: 'rumble' },
    { at: 5.3, sfx: 'poof' },
    { at: 6.0, say: '燕' },
    { at: 6.75, say: '燕子' },
    { at: 7.6, sfx: 'clink' },
    { at: 8.35, sfx: 'blip' },
    { at: 9.0, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
