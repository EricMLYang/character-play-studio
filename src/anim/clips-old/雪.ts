import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 雪（重做）：拉布拉多警長丟雪球，豬探長一蹲躲過還偷笑——雪球打中樹，樹上的一大坨雪掉在他頭上。豬探長氣得推來越滾越大的大雪球，
// 警長吹哨叫停，大雪球急煞、豬探長臉撞上去，雪球「碰」地炸成雨字頭，他甩掉頭上的雪變成彐。國字讓到上方，兩個在中間滾雪球疊成雪人（雪人）；回馬槍：雪人打大噴嚏把兩個噴成白白的冰棒。雪、雪、雪人
const G = 68.2 // size 21 的主角站在地上的 y
const HAT = -15 // 頭上那坨雪相對豬探長的高度

// 頭上那坨雪跟著豬探長走：移動抄一份，壓扁時一起往下沉
const withHat = (ms: Move[]): Move[] => ms.flatMap((m): Move[] => {
  if (m.do === 'moveTo' && m.to) return [m, { ...m, actor: 'clump', to: { x: m.to.x, y: m.to.y + HAT } }]
  if (m.do === 'squash') return [m, ...pressStack(m.at, m.dur ?? 0.3, m.amount ?? 0.2, 21, ['clump'])]
  if (m.do === 'shake' || m.do === 'hop') return [m, { ...m, actor: 'clump' }]
  return [m]
})

const clip: Clip = {
  char: '雪',
  meta: { theme: '打雪仗滾雪球', cast: '拉布拉多警長＋豬探長＋雪球＋大雪球＋樹＋雪人', gags: ['蹲下躲過偷笑雪從樹上掉頭上', '吹哨急煞臉撞大雪球', '大雪球炸成字', '甩掉頭上的雪', '雪人打噴嚏噴成冰棒'] },
  duration: 10,
  bg: { top: '#CFE6FF', bottom: '#F2F8FF', floor: '#F4F8FC', scenery: 'snow' },
  actors: [
    { id: 'tree', emoji: '🌲', x: 145, y: 64, size: 26 },
    { id: 'clump', emoji: '⚪', x: 142, y: 51, size: 11, float: true, tint: 'grayscale(1) brightness(1.25)' },
    { id: 'big', emoji: '⚪', x: 108, y: 73.5, size: 8, hidden: true, tint: 'grayscale(1) brightness(1.25)' },
    { id: 'ballL', emoji: '⚪', x: 44, y: 73.5, size: 8, hidden: true, tint: 'grayscale(1) brightness(1.25)' },
    { id: 'ballR', emoji: '⚪', x: 116, y: 74.5, size: 6, hidden: true, tint: 'grayscale(1) brightness(1.25)' },
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: 30, y: G, size: 21, flip: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 126, y: G, size: 21 },
    { id: 'ball', emoji: '⚪', x: 40, y: 64, size: 7, hidden: true, float: true, tint: 'grayscale(1) brightness(1.25)' },
  ],
  moves: [
    // 警長捏雪球，豬探長扭屁股挑釁
    { at: 0, actor: 'sheriff', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 0.3, actor: 'ball', do: 'pop' },
    { at: 0.5, actor: 'pig', do: 'tilt', amount: 14, dur: 0.25 },
    { at: 0.75, actor: 'pig', do: 'tilt', amount: -14, dur: 0.25 },
    // 往後拉——丟！
    { at: 1.0, actor: 'sheriff', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.0, actor: 'sheriff', do: 'tilt', amount: -18, dur: 0.3 },
    { at: 1.0, actor: 'ball', do: 'moveTo', to: { x: 32, y: 58 }, dur: 0.3 },
    { at: 1.3, actor: 'ball', do: 'moveTo', to: { x: 142, y: 54 }, arc: 10, dur: 0.45, ease: 'linear' },
    { at: 1.3, actor: 'ball', do: 'spin', times: 2, dur: 0.45 },
    // 豬探長一蹲躲過
    { at: 1.35, actor: 'pig', do: 'squash', amount: 0.5, dur: 0.45 },
    // 打中樹
    { at: 1.75, actor: 'ball', do: 'vanish', dur: 0.08 },
    { at: 1.75, actor: 'tree', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 1.75, actor: 'clump', do: 'shake', amount: 1.5, dur: 0.4 },
    // 豬探長偷笑
    { at: 1.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 1.9, actor: 'pig', do: 'bounce', amount: 2, times: 2, dur: 0.45 },
    { at: 2.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 樹上那一大坨雪滑下來——咚，正好掉在他頭上
    { at: 2.25, actor: 'clump', do: 'moveTo', to: { x: 126, y: G + HAT }, arc: 3, dur: 0.3, ease: 'in' },
    { at: 2.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    ...withHat([{ at: 2.55, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.3 }]),
    // 換警長笑
    { at: 2.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 2.75, actor: 'sheriff', do: 'bounce', amount: 2.5, times: 2, dur: 0.5 },
    // 豬探長氣呼呼，蹲下捏一個雪球，推著越滾越大
    { at: 3.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    ...withHat([{ at: 3.05, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 }]),
    { at: 3.2, actor: 'big', do: 'pop' },
    { at: 3.4, actor: 'big', do: 'moveTo', to: { x: 80, y: 71 }, dur: 0.75, ease: 'in' },
    { at: 3.4, actor: 'big', do: 'scaleTo', amount: 3.1, dur: 0.75, ease: 'in' },
    ...withHat([{ at: 3.4, actor: 'pig', do: 'moveTo', to: { x: 104, y: G }, dur: 0.75, ease: 'in' }]),
    { at: 3.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 警長吹哨：停！大雪球急煞，豬探長停不下來臉撞上去
    { at: 3.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 3.9, actor: 'sheriff', do: 'squash', amount: -0.2, dur: 0.25 },
    ...withHat([{ at: 4.15, actor: 'pig', do: 'moveTo', to: { x: 99, y: G }, dur: 0.08, ease: 'in' }]),
    { at: 4.23, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    ...withHat([{ at: 4.23, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.25 }]),
    // 大雪球晃啊晃……
    { at: 4.25, actor: 'big', do: 'shake', amount: 1.5, dur: 0.45 },
    { at: 4.25, actor: 'big', do: 'scaleTo', amount: 1.15, dur: 0.45, ease: 'in' },
    { at: 4.25, actor: 'big', do: 'moveTo', to: { x: 80, y: 70 }, dur: 0.45, ease: 'in' },
    // 碰！炸開，兩個都被炸回兩邊
    { at: 4.7, actor: 'big', do: 'vanish', dur: 0.08 },
    ...withHat([{ at: 4.7, actor: 'pig', do: 'moveTo', to: { x: 132, y: G }, arc: 10, dur: 0.45, ease: 'out' }]),
    { at: 4.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.7, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: G }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 4.7, actor: 'sheriff', do: 'spin', times: 1, dur: 0.45 },
    // 豬探長甩頭，頭上的雪甩出去變成彐
    ...withHat([{ at: 5.3, actor: 'pig', do: 'shake', amount: 1.8, dur: 0.3 }]),
    { at: 5.55, actor: 'clump', do: 'vanish', dur: 0.08 },
    { at: 5.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 5.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 有了！來堆雪人
    { at: 6.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 6.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 6.55, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 國字讓位後兩個各滾一顆雪球到中間
    { at: 6.95, actor: 'sheriff', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 7.0, actor: 'ballL', do: 'pop' },
    { at: 7.15, actor: 'ballL', do: 'moveTo', to: { x: 80, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 7.15, actor: 'ballL', do: 'scaleTo', amount: 2.7, dur: 0.6, ease: 'out' },
    { at: 7.15, actor: 'sheriff', do: 'moveTo', to: { x: 56, y: G }, dur: 0.6, ease: 'out' },
    { at: 6.95, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 7.0, actor: 'ballR', do: 'pop' },
    { at: 7.15, actor: 'ballR', do: 'moveTo', to: { x: 104, y: 70.5 }, dur: 0.45, ease: 'out' },
    { at: 7.15, actor: 'ballR', do: 'scaleTo', amount: 2, dur: 0.45, ease: 'out' },
    { at: 7.15, actor: 'pig', do: 'moveTo', to: { x: 116, y: G }, dur: 0.45, ease: 'out' },
    // 豬探長把小雪球抱起來往上一丟，疊上去——變成雪人！
    { at: 7.65, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 7.7, actor: 'ballR', do: 'moveTo', to: { x: 80, y: 58 }, arc: 8, dur: 0.3, ease: 'out' },
    { at: 8.0, actor: 'ballR', do: 'vanish', dur: 0.06 },
    { at: 8.0, actor: 'ballL', do: 'swap', emoji: '⛄' },
    { at: 8.0, actor: 'ballL', do: 'tint', filter: '' },
    { at: 8.0, actor: 'ballL', do: 'scaleTo', amount: 1.1, dur: 0.25, ease: 'back' },
    { at: 7.8, actor: 'pig', do: 'moveTo', to: { x: 106, y: G }, dur: 0.25, ease: 'out' },
    { at: 8.05, actor: 'sheriff', do: 'hop', amount: 5, dur: 0.35 },
    { at: 8.1, actor: 'pig', do: 'hop', amount: 5, dur: 0.35 },
    // 回馬槍：雪人鼻子癢，吸——
    { at: 8.35, actor: 'ballL', do: 'tilt', amount: -20, dur: 0.4 },
    { at: 8.5, actor: 'ballL', do: 'shake', amount: 0.7, dur: 0.25 },
    { at: 8.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 8.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 哈啾！雪人自己噴散，兩個被噴飛到兩邊、全身白白結冰
    { at: 8.75, actor: 'ballL', do: 'vanish', dur: 0.1 },
    { at: 8.75, actor: 'sheriff', do: 'moveTo', to: { x: 24, y: G }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 8.75, actor: 'pig', do: 'moveTo', to: { x: 136, y: G }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 8.8, actor: 'sheriff', do: 'tint', filter: 'grayscale(1) brightness(1.75)' },
    { at: 8.8, actor: 'pig', do: 'tint', filter: 'grayscale(1) brightness(1.75)' },
    { at: 9.15, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: 9.15, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.35 },
    // 抖一抖，雪掉光，一起笑
    { at: 9.55, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 9.55, actor: 'pig', do: 'tint', filter: '' },
    { at: 9.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 9.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  ],
  builds: [
    // 大雪球炸開，碎雪落成雨字頭
    { at: 4.7, dur: 0.75, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'big', color: '#1C7ED6' },
    // 頭上那坨雪甩出去：彐
    { at: 5.55, dur: 0.4, strokes: [8, 9, 10], from: 'clump', color: '#0B5394' },
  ],
  glyph: [
    { at: 6.0, dur: 0.4, do: 'wobble' },
    { at: 6.8, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.55, kind: 'pop', actor: 'pig', emoji: '😜', dur: 0.5 },
    { at: 0.6, kind: 'pop', actor: 'sheriff', emoji: '😤', dur: 0.4 },
    { at: 1.75, kind: 'burst', actor: 'tree', emoji: '❄️', n: 5, dx: -4, dy: 4, dur: 0.45 },
    { at: 1.95, kind: 'pop', actor: 'pig', emoji: '😆', dy: 6, dur: 0.35 },
    { at: 2.55, kind: 'burst', actor: 'pig', emoji: '❄️', n: 6, dy: 2, dur: 0.4 },
    { at: 2.7, kind: 'sweat', actor: 'pig', dx: -8 },
    { at: 2.8, kind: 'pop', actor: 'sheriff', emoji: '😆', dur: 0.4 },
    { at: 3.1, kind: 'pop', actor: 'pig', emoji: '😤', dx: -10, dy: -4, dur: 0.4 },
    { at: 3.4, kind: 'puff', actor: 'big', dur: 0.6 },
    { at: 3.6, kind: 'sweat', actor: 'sheriff' },
    { at: 3.95, kind: 'zzz', actor: 'sheriff', emoji: '🎵', dx: 6, dur: 0.5 },
    { at: 4.23, kind: 'burst', x: 92, y: 60, n: 1, dur: 0.35 },
    { at: 4.4, kind: 'sweat', actor: 'pig' },
    { at: 4.7, kind: 'burst', actor: 'big', emoji: '❄️', n: 10, dur: 0.6 },
    { at: 5.0, kind: 'dizzy', actor: 'sheriff', dur: 1.0 },
    { at: 5.55, kind: 'burst', actor: 'pig', emoji: '❄️', n: 5, dx: -4, dur: 0.4 },
    { at: 6.0, kind: 'pop', actor: 'sheriff', emoji: '😲', dur: 0.4 },
    { at: 6.4, kind: 'bubble', actor: 'sheriff', emoji: '⛄', dx: -2, dur: 0.6 },
    { at: 7.15, kind: 'puff', actor: 'ballL', dur: 0.5 },
    { at: 7.15, kind: 'puff', actor: 'ballR', dur: 0.4 },
    { at: 8.0, kind: 'burst', actor: 'ballL', emoji: '✨', n: 8, dur: 0.55 },
    { at: 8.45, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: -6, dur: 0.35 },
    { at: 8.45, kind: 'pop', actor: 'pig', emoji: '❗', dx: 6, dur: 0.35 },
    { at: 8.75, kind: 'burst', x: 80, y: 62, emoji: '❄️', n: 12, dur: 0.6 },
    { at: 8.75, kind: 'puff', x: 80, y: 70, dur: 0.6 },
    { at: 9.15, kind: 'pop', actor: 'sheriff', emoji: '🥶', dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'pig', emoji: '🥶', dur: 0.4 },
    { at: 9.55, kind: 'burst', actor: 'sheriff', emoji: '❄️', n: 5, dur: 0.4 },
    { at: 9.55, kind: 'burst', actor: 'pig', emoji: '❄️', n: 5, dur: 0.4 },
  ],
  camera: [
    { at: 4.23, dur: 0.25, do: 'shake', amount: 1.0 },
    { at: 4.7, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 8.0, dur: 0.4, do: 'punch', amount: 0.1, to: { x: 80, y: 56 } },
    { at: 8.75, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: 4.7, dur: 0.04, level: -0.7 },
    { at: 4.74, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'tap' },
    { at: 1.0, say: '雪' },
    { at: 1.3, sfx: 'whoosh' },
    { at: 1.75, sfx: 'plop' },
    { at: 2.55, sfx: 'bonk' },
    { at: 3.4, sfx: 'rumble' },
    { at: 3.9, sfx: 'blip' },
    { at: 4.23, sfx: 'bonk' },
    { at: 4.7, sfx: 'poof' },
    { at: 5.3, sfx: 'boing' },
    { at: 6.0, say: '雪' },
    { at: 7.15, sfx: 'slide' },
    { at: 8.0, say: '雪人' },
    { at: 8.4, sfx: 'bubble' },
    { at: 8.75, sfx: 'achoo' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
