// 演的是字面意思：蘋果＋假面（戴上假眼鏡假鬍子）＋超人（披上圍巾當披風、想飛）：一顆蘋果假扮超人，飛起來又摔下來（沒有變身腰帶、頭盔、變身姿勢）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 中午的街上：一顆蘋果從水果籃跳出來，啪一聲戴上假眼鏡假鬍子、圍巾往後一甩當披風，跳上紙箱擺好姿勢。
// 小鳥歪頭看。蘋果蹲低、用力一跳……在半空停住……咚！直直掉下來壓扁，小鳥笑到打滾。蘋果氣得冒煙，
// 這時一陣大風吹來，披風鼓起來——蘋果真的飛起來了！繞一圈正得意，風停了。往下看……停一拍……
// 咻——正好砸在小鳥頭上，彈回紙箱，站好、披風飄飄：「蘋果假面超人」。小鳥頭上轉圈圈，還是拍拍手。
const A = 14 // 蘋果的 size
const G = 77 - 0.42 * A // 蘋果站在地上的 y
const BOX = 61 // 紙箱頂（蘋果的腳踩在這）
const ON_BOX = { x: 62, y: BOX - 0.42 * A }
const BIRD = { x: 118, y: 77 - 0.42 * 12 }
const MASK = { dx: 0.2, dy: 0.6 } // 假眼鏡貼在蘋果正面
const CAPE = { dx: -6, dy: 1 } // 披風在蘋果背後

/** 蘋果的動作，假面與披風照抄一份（位置加上偏移） */
const hero = (moves: Move[]): Move[] => moves.flatMap((m) => {
  if (m.do !== 'moveTo' && m.do !== 'enter' && m.do !== 'hop' && m.do !== 'shake' && m.do !== 'bounce') return [m]
  const at = (o: { dx: number; dy: number }) => (v?: Move['to']) => v && { x: v.x + o.dx, y: v.y + o.dy }
  return [m, { ...m, actor: 'mask', to: at(MASK)(m.to), from: at(MASK)(m.from) }, { ...m, actor: 'cape', to: at(CAPE)(m.to), from: at(CAPE)(m.from) }]
})

export default scene({
  duration: 9.8,
  bg: { top: '#5BB8FF', bottom: '#D6F0FF', floor: '#B9B4AA', scenery: 'city' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 120, y: 16, size: 14, float: true },
    { id: 'sun', emoji: '☀️', x: 22, y: 14, size: 12, float: true },
    { id: 'basket', emoji: '🧺', x: 28, y: 77 - 0.42 * 16, size: 16 },
    { id: 'box', emoji: '📦', x: 62, y: 77 - 0.42 * 20, size: 20 },
    { id: 'wind', emoji: '🌬️', x: 190, y: 40, size: 16, float: true },
    { id: 'bird', emoji: '🐦', x: BIRD.x, y: BIRD.y, size: 12 },
    { id: 'cape', emoji: '🧣', x: 28 + CAPE.dx, y: G - 6 + CAPE.dy, size: 10, hidden: true, pivot: 'center' },
    { id: 'apple', emoji: '🍎', x: 28, y: G - 6, size: A, hidden: true, pivot: 'center' },
    { id: 'mask', emoji: '🥸', x: 28 + MASK.dx, y: G - 6 + MASK.dy, size: 8, hidden: true, pivot: 'center' },
  ],
  moves: [
    // ① 從籃子裡跳出來
    { at: 0.1, actor: 'apple', do: 'pop', dur: 0.3 },
    ...hero([{ at: 0.2, actor: 'apple', do: 'moveTo', to: { x: 40, y: G }, arc: 10, dur: 0.45, ease: 'out' }]),
    // 啪！戴上假面、披風甩出來
    { at: 0.75, actor: 'mask', do: 'drop', dur: 0.3 },
    { at: 1.05, actor: 'apple', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 1.15, actor: 'cape', do: 'pop', dur: 0.3 },
    { at: 1.15, actor: 'cape', do: 'shake', amount: 1.2, dur: 0.4 },
    // ② 跳上紙箱，擺姿勢；小鳥歪頭
    ...hero([{ at: 1.55, actor: 'apple', do: 'moveTo', to: ON_BOX, arc: 12, dur: 0.45, ease: 'out' }]),
    { at: 2.0, actor: 'apple', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 2.05, actor: 'bird', do: 'tilt', amount: 14, dur: 0.5 },
    // 蹲低……跳！停在半空……咚
    { at: 2.45, actor: 'apple', do: 'squash', amount: 0.3, dur: 0.25 },
    ...hero([{ at: 2.7, actor: 'apple', do: 'moveTo', to: { x: 74, y: 34 }, dur: 0.35, ease: 'out' }]),
    { at: 3.05, actor: 'cape', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 3.0, actor: 'apple', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 3.0, actor: 'mask', do: 'tilt', amount: 15, dur: 0.4 },
    ...hero([{ at: 3.45, actor: 'apple', do: 'moveTo', to: { x: 78, y: G }, dur: 0.25, ease: 'in' }]),
    { at: 3.7, actor: 'apple', do: 'squash', amount: 0.55, dur: 0.45 },
    { at: 3.7, actor: 'mask', do: 'rotateTo', amount: 28, dur: 0.15 },
    // 小鳥笑到打滾
    { at: 3.9, actor: 'bird', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    { at: 3.95, actor: 'bird', do: 'tilt', amount: -18, dur: 0.6 },
    // 氣到冒煙，戴正假面
    { at: 4.45, actor: 'mask', do: 'rotateTo', amount: -28, dur: 0.15 },
    ...hero([{ at: 4.45, actor: 'apple', do: 'shake', amount: 1, dur: 0.35 }]),
    // ③ 大風吹來，披風鼓起來——飛起來了！
    { at: 4.7, actor: 'wind', do: 'moveTo', to: { x: 140, y: 44 }, dur: 0.4, ease: 'out' },
    { at: 4.95, actor: 'cape', do: 'rotateTo', amount: -40, dur: 0.2 },
    ...hero([
      { at: 5.0, actor: 'apple', do: 'moveTo', to: { x: 58, y: 30 }, arc: 4, dur: 0.55, ease: 'out' },
      { at: 5.55, actor: 'apple', do: 'moveTo', to: { x: 96, y: 22 }, arc: 6, dur: 0.6, ease: 'inOut' },
    ]),
    { at: 5.0, actor: 'cape', do: 'shake', amount: 1.2, dur: 1.1 },
    { at: 5.6, actor: 'apple', do: 'spin', times: 1, dur: 0.5 },
    { at: 5.6, actor: 'mask', do: 'spin', times: 1, dur: 0.5 },
    // 風停了……往下看……停一拍
    { at: 6.1, actor: 'wind', do: 'vanish', dur: 0.2 },
    { at: 6.1, actor: 'cape', do: 'rotateTo', amount: 40, dur: 0.3 },
    { at: 6.25, actor: 'apple', do: 'tilt', amount: 14, dur: 0.45 },
    // 咻——砸在小鳥頭上
    ...hero([{ at: 6.7, actor: 'apple', do: 'moveTo', to: { x: BIRD.x, y: 60 }, dur: 0.3, ease: 'in' }]),
    { at: 7.0, actor: 'bird', do: 'squash', amount: 0.5, dur: 0.4 },
    // 彈回紙箱，站好
    ...hero([{ at: 7.0, actor: 'apple', do: 'moveTo', to: ON_BOX, arc: 16, dur: 0.55, ease: 'out' }]),
    { at: 7.0, actor: 'apple', do: 'spin', times: -1, dur: 0.55 },
    { at: 7.0, actor: 'mask', do: 'spin', times: -1, dur: 0.55 },
    // ⑤ 亮相：放大、披風飄飄
    { at: 7.6, actor: 'apple', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'mask', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'cape', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'cape', do: 'moveTo', to: { x: ON_BOX.x + CAPE.dx * 1.6, y: ON_BOX.y + CAPE.dy }, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'apple', do: 'tint', filter: 'brightness(1.1) saturate(1.25)' },
    { at: 8.0, actor: 'cape', do: 'shake', amount: 0.8, dur: 1.2 },
    { at: 8.4, actor: 'bird', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 0.15, kind: 'puff', actor: 'basket', dur: 0.4 },
    { at: 0.9, kind: 'pop', actor: 'apple', emoji: '😎', dx: 9, dur: 0.6 },
    { at: 1.2, kind: 'burst', actor: 'apple', emoji: '✨', n: 6, dur: 0.6 },
    { at: 2.1, kind: 'pop', actor: 'bird', emoji: '❓', dur: 0.6 },
    { at: 3.05, kind: 'sweat', actor: 'apple' },
    { at: 3.7, kind: 'puff', actor: 'apple', n: 8, dur: 0.5 },
    { at: 3.75, kind: 'dizzy', actor: 'apple', dur: 0.7 },
    { at: 3.95, kind: 'pop', actor: 'bird', emoji: '😆', dur: 0.8 },
    { at: 4.45, kind: 'stink', actor: 'apple', emoji: '💢', dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'apple', emoji: '🤩', dx: 10, dur: 0.6 },
    { at: 6.3, kind: 'pop', actor: 'apple', emoji: '❗', dx: 8, dur: 0.4 },
    { at: 6.4, kind: 'sweat', actor: 'apple' },
    { at: 6.98, kind: 'burst', actor: 'bird', n: 1, dur: 0.4 },
    { at: 7.1, kind: 'dizzy', actor: 'bird', dur: 2.4 },
    { at: 7.6, kind: 'burst', actor: 'apple', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.3, kind: 'burst', actor: 'apple', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 8.5, kind: 'pop', actor: 'bird', emoji: '👏', dx: -8, dur: 0.8 },
  ],
  camera: [
    { at: 3.7, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 7.0, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 7.5, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: 64, y: 44 } },
    { at: 7.65, dur: 0.4, do: 'punch', amount: 0.1, to: { x: 62, y: 42 } },
  ],
  lights: [
    { at: 7.6, dur: 0.05, level: -0.4 },
    { at: 7.65, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'plop' },
    { at: 0.95, sfx: 'tap' },
    { at: 1.15, sfx: 'whoosh' },
    { at: 1.6, sfx: 'boing' },
    { at: 2.7, sfx: 'whoosh' },
    { at: 3.7, sfx: 'bonk' },
    { at: 4.7, sfx: 'whoosh' },
    { at: 5.6, sfx: 'cheer' },
    { at: 6.7, sfx: 'slide' },
    { at: 7.0, sfx: 'bonk' },
    { at: 7.2, sfx: 'boing' },
    { at: 7.75, say: '蘋果假面超人' },
    { at: 8.4, sfx: 'cheer' },
  ],
})
