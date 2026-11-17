import type { Clip, Move, Vec } from '../clip'

// 傘：調皮小老鼠和拉布拉多警長拿收起來的雨傘當劍比武。兩個都大力揮空、各自轉圈轉到昏，搖搖晃晃走到中間「啵」地撞頭坐倒——
// 警長的大傘飛上去打開變成傘頂，老鼠臉頰裡掉出四把小傘變成四個小人，傘柄和哨子繩變成十，拼成「傘」。下雨了，老鼠把小傘丟過去替警長擋雨；警長吹哨道謝，雲卻飄去淋老鼠。傘、傘、雨傘
// 手上的傘跟著主人走
const hold = (item: string, o: Vec, ms: Move[]): Move[] => ms.flatMap((m): Move[] => {
  if (m.do === 'moveTo' && m.to) return [m, { ...m, actor: item, to: { x: m.to.x + o.x, y: m.to.y + o.y } }]
  if (m.do === 'spin') return [m, { ...m, actor: item }]
  if (m.do === 'tilt') return [m, { ...m, actor: item, do: 'shake', amount: 2 }]
  if (m.do === 'hop' || m.do === 'shake' || m.do === 'bounce') return [m, { ...m, actor: item }]
  return [m]
})

const clip: Clip = {
  char: '傘',
  meta: { theme: '雨傘比劍', cast: '小老鼠＋拉布拉多警長＋雨傘＋雲', gags: ['大力揮空轉成陀螺', '轉昏撞頭坐倒', '傘丟過去擋雨', '雲飄去淋老鼠'] },
  duration: 10,
  bg: { top: '#D9EEFF', bottom: '#F0F8FF', floor: '#BCD3E6', scenery: 'city' },
  actors: [
    { id: 'cloud', emoji: '🌧️', x: 134, y: 42, size: 14, float: true, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 26, y: 71.5, size: 13, flip: true },
    { id: 'mu', emoji: '🌂', x: 34, y: 67, size: 8, float: true, flip: true },
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: 132, y: 70.7, size: 15 },
    { id: 'su', emoji: '🌂', x: 123, y: 63, size: 11, float: true },
    { id: 'spare', emoji: '☂️', x: 30, y: 66, size: 9, float: true, hidden: true },
  ],
  moves: [
    // 老鼠用傘尖點點地，擠眉弄眼
    ...hold('mu', { x: 8, y: -4.5 }, [
      { at: 0.35, actor: 'mouse', do: 'hop', amount: 2, dur: 0.25 },
      { at: 0.95, actor: 'mouse', do: 'hop', amount: -2, dur: 0.3 },
    ]),
    // 警長挺胸吹哨，舉起大傘
    { at: 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 1.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    ...hold('su', { x: -9, y: -7.7 }, [
      { at: 1.2, actor: 'sheriff', do: 'hop', amount: 3, dur: 0.3 },
      // 警長揮太大力，轉成陀螺
      { at: 1.6, actor: 'sheriff', do: 'tilt', amount: -30, dur: 0.3 },
      { at: 1.9, actor: 'sheriff', do: 'spin', times: 2, dur: 0.8 },
      // 頭昏走向中間
      { at: 2.9, actor: 'sheriff', do: 'moveTo', to: { x: 90, y: 70.7 }, dur: 0.6 },
    ]),
    ...hold('mu', { x: 8, y: -4.5 }, [
      // 老鼠揮一個大圓，揮空，往另一邊轉
      { at: 2.0, actor: 'mouse', do: 'hop', amount: 5, dur: 0.4 },
      { at: 2.2, actor: 'mouse', do: 'spin', times: -2, dur: 0.7 },
      { at: 2.9, actor: 'mouse', do: 'moveTo', to: { x: 70, y: 71.5 }, dur: 0.6 },
    ]),
    { at: 2.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 2.8, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 2.9, actor: 'mouse', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 2.9, actor: 'sheriff', do: 'tilt', amount: -12, dur: 0.6 },
    // 定格一拍——啵！撞頭
    { at: 3.85, actor: 'mouse', do: 'moveTo', to: { x: 74, y: 71.5 }, dur: 0.12, ease: 'in' },
    { at: 3.85, actor: 'sheriff', do: 'moveTo', to: { x: 86, y: 70.7 }, dur: 0.12, ease: 'in' },
    { at: 3.97, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 3.97, actor: 'sheriff', do: 'squash', amount: 0.4, dur: 0.25 },
    // 彈開、一屁股坐下
    { at: 4.1, actor: 'mouse', do: 'moveTo', to: { x: 24, y: 71.5 }, arc: 6, dur: 0.5, ease: 'out' },
    { at: 4.1, actor: 'sheriff', do: 'moveTo', to: { x: 134, y: 70.7 }, arc: 6, dur: 0.5, ease: 'out' },
    { at: 4.6, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.6, actor: 'sheriff', do: 'squash', amount: 0.3, dur: 0.25 },
    // 大傘飛上去打開
    { at: 4.0, actor: 'su', do: 'moveTo', to: { x: 80, y: 14 }, dur: 0.35, ease: 'out' },
    { at: 4.0, actor: 'su', do: 'spin', times: 1, dur: 0.35 },
    { at: 4.3, actor: 'su', do: 'swap', emoji: '☂️' },
    { at: 4.3, actor: 'su', do: 'scaleTo', amount: 1.6, dur: 0.15, ease: 'back' },
    { at: 4.5, actor: 'su', do: 'vanish', dur: 0.15 },
    // 老鼠的傘柄直直掉下來
    { at: 4.0, actor: 'mu', do: 'moveTo', to: { x: 64, y: 8 }, dur: 0.4, ease: 'out' },
    { at: 4.0, actor: 'mu', do: 'spin', times: 2, dur: 0.5 },
    { at: 5.6, actor: 'mu', do: 'vanish', dur: 0.15 },
    { at: 5.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 5.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    // 下雨了：老鼠掏出小傘，丟過去替警長擋雨
    { at: 6.3, actor: 'cloud', do: 'pop', dur: 0.35 },
    { at: 6.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 6.6, actor: 'spare', do: 'pop', dur: 0.2 },
    { at: 6.7, actor: 'spare', do: 'moveTo', to: { x: 134, y: 56 }, arc: 26, dur: 0.55, ease: 'out' },
    { at: 6.7, actor: 'spare', do: 'spin', times: 1, dur: 0.55 },
    { at: 6.7, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.2, actor: 'spare', do: 'bounce', amount: 1, times: 2, dur: 0.6 },
    // 回馬槍：警長吹哨道謝——雲被吹走，飄去淋老鼠
    { at: 8.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 8.2, actor: 'cloud', do: 'moveTo', to: { x: 26, y: 44 }, arc: 34, dur: 0.6 },
    { at: 8.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 9.3, actor: 'mouse', do: 'squash', amount: 0.2, dur: 0.3 },
  ],
  builds: [
    // 打開的大傘 → 上面的人
    { at: 4.45, dur: 0.35, strokes: [0, 1], from: 'su', color: '#D6336C' },
    // 老鼠臉頰裡掉出四把小傘 → 四個小人
    { at: 4.75, dur: 0.75, strokes: [2, 3, 4, 5, 6, 7, 8, 9], from: 'mouse', color: '#E64980' },
    // 傘柄直直插下來，哨子繩拉成一橫 → 十
    { at: 5.6, dur: 0.3, strokes: [11], from: 'mu', style: 'drop', color: '#C2255C' },
    { at: 5.85, dur: 0.3, strokes: [10], from: 'sheriff', color: '#C2255C' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.35, kind: 'pop', actor: 'mouse', emoji: '😏', dur: 0.5 },
    { at: 0.55, kind: 'zzz', actor: 'sheriff', emoji: '🎵', dur: 0.6 },
    { at: 1.9, kind: 'puff', actor: 'sheriff', dur: 0.6 },
    { at: 2.85, kind: 'dizzy', actor: 'mouse', dur: 1.0 },
    { at: 2.85, kind: 'dizzy', actor: 'sheriff', dur: 1.0 },
    { at: 3.97, kind: 'burst', actor: 'mouse', dx: 5, dur: 0.4 },
    { at: 4.6, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 4.6, kind: 'puff', actor: 'sheriff', dur: 0.4 },
    { at: 6.45, kind: 'rain', actor: 'cloud', emoji: '💧', dur: 1.0 },
    { at: 7.3, kind: 'pop', actor: 'sheriff', emoji: '💕', dur: 0.6 },
    { at: 8.0, kind: 'zzz', actor: 'sheriff', emoji: '🎵', dur: 0.6 },
    { at: 8.85, kind: 'rain', actor: 'cloud', emoji: '💧', dur: 1.0 },
    { at: 9.1, kind: 'sweat', actor: 'mouse', dur: 0.6 },
  ],
  camera: [
    // 撞頭前定格那一拍推近，撞完退回全景
    { at: 3.4, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 80, y: 62 } },
    { at: 3.97, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 3.97, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.35, sfx: 'tap' },
    { at: 0.55, sfx: 'blip' },
    { at: 1.0, say: '傘' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.2, sfx: 'whoosh' },
    { at: 3.97, sfx: 'boing' },
    { at: 4.6, sfx: 'plop' },
    { at: 6.2, say: '傘' },
    { at: 6.8, say: '雨傘' },
    { at: 8.0, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
