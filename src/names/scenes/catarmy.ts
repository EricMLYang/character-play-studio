// 演的是字面意思：野貓＋軍團——一排戴頭盔的貓咪排成一隊行軍，隊伍一直出包，最後疊成一座貓塔（不演偷魚、被罰）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 操場上：四隻戴頭盔的貓咪踏步進場，隊長突然停下來敬禮——後面三隻煞不住，一隻撞一隻，頭盔全彈起來。
// 排好隊重來。一隻蝴蝶飛過來，大家的頭跟著轉來轉去；隊長一瞪，全部立正……停一拍……蝴蝶停在隊長的頭盔上。
// 三隻貓一起撲上去！碰——一團煙。煙散了，四隻貓疊成一座貓塔，頭盔一頂一頂掉回頭上，最上面那隻敬禮：「野貓軍團」。
const C = 13 // 貓的 size
const G = 77 - 0.42 * C
const HELM = { dx: 4, dy: -6.5 } // 頭盔戴在頭上（貓朝右，頭在右邊）
const X = [40, 58, 76, 96] // 隊伍：c1 最後、c4 是隊長
const STEP = 12 // 疊貓塔一層多高
const TOWER = 96

/** 貓的動作，頭盔照抄一份 */
const cat = (moves: Move[]): Move[] => moves.flatMap((m) => {
  if (m.do !== 'moveTo' && m.do !== 'enter' && m.do !== 'hop' && m.do !== 'bounce' && m.do !== 'shake') return [m]
  const at = (v?: Move['to']) => v && { x: v.x + HELM.dx, y: v.y + HELM.dy }
  return [m, { ...m, actor: m.actor.replace('c', 'h'), to: at(m.to), from: at(m.from) }]
})
const ids = ['c1', 'c2', 'c3', 'c4']

export default scene({
  duration: 9.2,
  bg: { top: '#7EC8F2', bottom: '#DDF1FB', floor: '#D9876A', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🚩', x: 140, y: 77 - 0.42 * 18, size: 18 },
    { id: 'drum', emoji: '🥁', x: 14, y: 77 - 0.42 * 10, size: 10 },
    ...ids.flatMap((id, i) => [
      { id, emoji: '🐈', x: X[i], y: G, size: C, flip: true },
      { id: id.replace('c', 'h'), emoji: '🪖', x: X[i] + HELM.dx, y: G + HELM.dy, size: 7, float: true, pivot: 'center' as const },
    ]),
    { id: 'fly', emoji: '🦋', x: 190, y: 20, size: 8, float: true },
  ],
  moves: [
    // ① 踏步進場
    ...cat(ids.map((actor, i): Move => ({ at: 0, actor, do: 'enter', from: { x: X[i] - 80, y: G }, dur: 1.2, ease: 'out' }))),
    // 隊長突然停下來——後面一隻撞一隻
    ...cat([
      { at: 1.4, actor: 'c4', do: 'hop', amount: 2, dur: 0.2 },
      { at: 1.55, actor: 'c3', do: 'moveTo', to: { x: 86, y: G }, dur: 0.15, ease: 'in' },
      { at: 1.65, actor: 'c2', do: 'moveTo', to: { x: 74, y: G }, dur: 0.15, ease: 'in' },
      { at: 1.75, actor: 'c1', do: 'moveTo', to: { x: 62, y: G }, dur: 0.15, ease: 'in' },
      { at: 1.7, actor: 'c4', do: 'moveTo', to: { x: 102, y: G }, dur: 0.15, ease: 'out' },
    ]),
    { at: 1.7, actor: 'c4', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.8, actor: 'c3', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.9, actor: 'c2', do: 'squash', amount: 0.3, dur: 0.25 },
    // 頭盔全彈起來
    ...ids.map((id, i): Move => ({ at: 1.7 + i * 0.05, actor: id.replace('c', 'h'), do: 'hop', amount: 9, dur: 0.45 })),
    ...ids.map((id, i): Move => ({ at: 1.7 + i * 0.05, actor: id.replace('c', 'h'), do: 'spin', times: i % 2 ? 1 : -1, dur: 0.45 })),
    // 排好隊
    ...cat(ids.map((actor, i): Move => ({ at: 2.5, actor, do: 'moveTo', to: { x: X[i], y: G }, dur: 0.4 }))),
    // ② 蝴蝶飛過來，頭跟著轉
    { at: 2.9, actor: 'fly', do: 'moveTo', to: { x: 60, y: 40 }, dur: 0.9, ease: 'inOut' },
    { at: 3.8, actor: 'fly', do: 'moveTo', to: { x: 116, y: 36 }, dur: 0.6, ease: 'inOut' },
    { at: 3.2, actor: 'c1', do: 'tilt', amount: -14, dur: 0.6 },
    { at: 3.3, actor: 'c2', do: 'tilt', amount: -14, dur: 0.6 },
    { at: 3.4, actor: 'c3', do: 'tilt', amount: -14, dur: 0.6 },
    { at: 3.9, actor: 'c1', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 3.95, actor: 'c2', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 4.0, actor: 'c3', do: 'tilt', amount: 12, dur: 0.5 },
    // 隊長一瞪，全部立正
    { at: 4.45, actor: 'c4', do: 'flip' },
    ...cat([{ at: 4.45, actor: 'c4', do: 'hop', amount: 3, dur: 0.25 }]),
    ...cat(['c1', 'c2', 'c3'].map((actor): Move => ({ at: 4.65, actor, do: 'hop', amount: 2, dur: 0.2 }))),
    { at: 4.9, actor: 'c4', do: 'flip' },
    // 停一拍……蝴蝶停在隊長頭盔上
    { at: 4.6, actor: 'fly', do: 'moveTo', to: { x: X[3] + HELM.dx, y: G + HELM.dy - 5 }, dur: 0.6, ease: 'out' },
    // ③ 三隻一起撲上去！
    { at: 5.4, actor: 'c1', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 5.4, actor: 'c2', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 5.4, actor: 'c3', do: 'squash', amount: -0.2, dur: 0.15 },
    ...cat([
      { at: 5.55, actor: 'c1', do: 'moveTo', to: { x: TOWER, y: G - 4 }, arc: 14, dur: 0.35, ease: 'in' },
      { at: 5.55, actor: 'c2', do: 'moveTo', to: { x: TOWER, y: G - 4 }, arc: 10, dur: 0.3, ease: 'in' },
      { at: 5.55, actor: 'c3', do: 'moveTo', to: { x: TOWER, y: G - 4 }, arc: 6, dur: 0.25, ease: 'in' },
    ]),
    { at: 5.55, actor: 'c1', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
    // 頭盔全飛上天
    ...ids.map((id, i): Move => ({ at: 5.9, actor: id.replace('c', 'h'), do: 'moveTo', to: { x: TOWER - 30 + i * 18, y: 14 }, dur: 0.4, ease: 'out' })),
    ...ids.map((id, i): Move => ({ at: 5.9, actor: id.replace('c', 'h'), do: 'spin', times: i % 2 ? 2 : -2, dur: 0.6 })),
    { at: 5.9, actor: 'fly', do: 'moveTo', to: { x: 128, y: 24 }, dur: 0.4, ease: 'out' },
    // ④ 煙散了：疊成貓塔
    { at: 6.25, actor: 'c4', do: 'moveTo', to: { x: TOWER, y: G }, dur: 0.01 },
    { at: 6.25, actor: 'c3', do: 'moveTo', to: { x: TOWER, y: G - STEP }, dur: 0.01 },
    { at: 6.25, actor: 'c2', do: 'moveTo', to: { x: TOWER, y: G - STEP * 2 }, dur: 0.01 },
    { at: 6.25, actor: 'c1', do: 'moveTo', to: { x: TOWER, y: G - STEP * 3 }, dur: 0.01 },
    // 頭盔一頂一頂掉回頭上
    ...ids.map((id, i): Move => ({ at: 6.35 + (3 - i) * 0.13, actor: id.replace('c', 'h'), do: 'moveTo', to: { x: TOWER + HELM.dx, y: G + HELM.dy - STEP * (3 - i) }, dur: 0.3, ease: 'bounce' })),
    { at: 6.9, actor: 'fly', do: 'moveTo', to: { x: TOWER + HELM.dx + 7, y: G + HELM.dy - STEP * 3 - 7 }, dur: 0.4, ease: 'out' },
    // ⑤ 塔晃一晃、最上面那隻敬禮
    { at: 7.0, actor: 'c1', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.0, actor: 'h1', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.0, actor: 'fly', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.4, actor: 'c4', do: 'squash', amount: 0.12, dur: 0.3 },
    { at: 7.7, actor: 'c2', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: 8.2, actor: 'c3', do: 'shake', amount: 0.4, dur: 0.4 },
  ],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'drum', emoji: '🎵', dur: 1.4 },
    { at: 1.4, kind: 'pop', actor: 'c4', emoji: '❗', dur: 0.4 },
    { at: 1.75, kind: 'burst', actor: 'c3', n: 1, dx: 6, dur: 0.4 },
    { at: 1.95, kind: 'dizzy', actor: 'c2', dur: 0.7 },
    { at: 2.5, kind: 'pop', actor: 'c4', emoji: '💢', dur: 0.6 },
    { at: 3.3, kind: 'pop', actor: 'c2', emoji: '😍', dur: 0.8 },
    { at: 4.45, kind: 'pop', actor: 'c4', emoji: '😤', dx: -6, dur: 0.6 },
    { at: 4.7, kind: 'sweat', actor: 'c1' },
    { at: 5.15, kind: 'pop', actor: 'c4', emoji: '❓', dur: 0.4 },
    { at: 5.35, kind: 'pop', actor: 'c3', emoji: '❗', dur: 0.3 },
    { at: 5.85, kind: 'puff', actor: 'c4', n: 18, dur: 0.9 },
    { at: 5.85, kind: 'burst', actor: 'c4', n: 1, dur: 0.4 },
    { at: 7.0, kind: 'burst', actor: 'c1', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.8, kind: 'burst', actor: 'c1', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 7.4, kind: 'sweat', actor: 'c4' },
  ],
  camera: [
    { at: 1.75, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.45, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 100, y: 62 } },
    { at: 5.85, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: 6.6, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 98, y: 45 } },
  ],
  lights: [
    { at: 4.6, dur: 0.3, level: 0.25 },
    { at: 5.6, dur: 0.2, level: 0 },
    { at: 7.0, dur: 0.05, level: -0.35 },
    { at: 7.05, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.6, sfx: 'tap' },
    { at: 1.4, sfx: 'blip' },
    { at: 1.7, sfx: 'bonk' },
    { at: 1.9, sfx: 'bonk' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 4.45, sfx: 'blip' },
    { at: 5.55, sfx: 'whoosh' },
    { at: 5.85, sfx: 'crack' },
    { at: 6.4, sfx: 'clink' },
    { at: 6.75, sfx: 'clink' },
    { at: 7.25, say: '野貓軍團' },
    { at: 7.9, sfx: 'cheer' },
  ],
})
