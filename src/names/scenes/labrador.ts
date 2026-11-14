// 演的是字面意思：拉（拉扯）＋布（布袋）＋拉＋多（好多），警長＝頭上頂著警燈的狗狗。狗警長跟小偷拉布袋，拉破了掉出好多金幣。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 傍晚的街上：浣熊揹著一袋錢躡手躡腳走過來，看到警燈一閃，躲進垃圾桶後面。頭上頂著警燈的狗狗聞著腳印過來——
// 就在垃圾桶旁邊停下……聞一聞……往反方向走了（浣熊偷笑）。浣熊溜出來，狗狗一回頭咬住布袋：兩個拉來拉去、越拉越長，
// 「砰！」布袋拉破，好多金幣噴出來，浣熊被彈進垃圾桶。狗狗跳上金幣山，警燈閃閃：「拉布拉多警長」。
const D = 67.8 // 狗狗（size 22）站在地上的 y
const R = 69.4 // 浣熊（size 18）
const HAT = { dx: 0, dy: -15 } // 警燈頂在狗狗背上

/** 狗狗的動作，警燈照抄一份（位置加上 HAT） */
const dog = (moves: Move[]): Move[] => moves.flatMap((m) => {
  const shift = (v?: Move['to']) => v && { x: v.x + HAT.dx, y: v.y + HAT.dy }
  return m.do === 'moveTo' || m.do === 'enter' || m.do === 'hop' ? [m, { ...m, actor: 'siren', to: shift(m.to), from: shift(m.from) }] : [m]
})
/** 浣熊的動作，錢袋照抄一份（揹在背後） */
const coon = (moves: Move[], dx = 7, dy = -6): Move[] => moves.flatMap((m) => {
  const shift = (v?: Move['to']) => v && { x: v.x + dx, y: v.y + dy }
  return m.do === 'moveTo' || m.do === 'enter' ? [m, { ...m, actor: 'bag', to: shift(m.to), from: shift(m.from) }] : [m]
})

export default scene({
  duration: 9.6,
  bg: { top: '#F59E6B', bottom: '#FFD7A8', floor: '#9AA3AE', scenery: 'city' },
  actors: [
    { id: 'lamp', emoji: '🏮', x: 30, y: 30, size: 9, float: true },
    { id: 'bench', emoji: '🪑', x: 22, y: 70.3, size: 16 },
    { id: 'c1', emoji: '🪙', x: 84, y: 71.5, size: 9, hidden: true },
    { id: 'c2', emoji: '🪙', x: 92, y: 71.5, size: 9, hidden: true },
    { id: 'c3', emoji: '🪙', x: 100, y: 71.5, size: 9, hidden: true },
    { id: 'c4', emoji: '🪙', x: 88, y: 66, size: 9, hidden: true },
    { id: 'c5', emoji: '🪙', x: 96, y: 66, size: 9, hidden: true },
    { id: 'c6', emoji: '🪙', x: 92, y: 60.5, size: 9, hidden: true },
    { id: 'coon', emoji: '🦝', x: 175, y: R, size: 18 },
    { id: 'bag', emoji: '💰', x: 182, y: R - 6, size: 12, float: true, pivot: 'center' },
    { id: 'bin', emoji: '🗑️', x: 128, y: 70.3, size: 16 },
    { id: 'dog', emoji: '🐕', x: -30, y: D, size: 22, flip: true },
    { id: 'siren', emoji: '🚨', x: -30 + HAT.dx, y: D + HAT.dy, size: 8, float: true },
  ],
  moves: [
    // 浣熊揹著錢袋躡手躡腳走進來，左看右看，躲到垃圾桶後面
    ...coon([
      { at: 0.1, actor: 'coon', do: 'moveTo', to: { x: 112, y: R }, dur: 0.9, ease: 'out' },
      { at: 1.3, actor: 'coon', do: 'moveTo', to: { x: 130, y: R }, dur: 0.25, ease: 'out' },
    ]),
    { at: 0.1, actor: 'coon', do: 'bounce', amount: 1.2, times: 4, dur: 0.9 },
    { at: 1.05, actor: 'coon', do: 'flip' },
    { at: 1.25, actor: 'coon', do: 'flip' },
    // 狗狗頂著警燈聞過來，停在垃圾桶旁邊
    ...dog([
      { at: 1.2, actor: 'dog', do: 'moveTo', to: { x: 58, y: D }, dur: 0.9, ease: 'out' },
      { at: 2.4, actor: 'dog', do: 'moveTo', to: { x: 100, y: D }, dur: 0.6, ease: 'inOut' },
    ]),
    { at: 1.3, actor: 'siren', do: 'flash', dur: 0.6 },
    { at: 2.1, actor: 'dog', do: 'tilt', amount: 8, dur: 0.4 },
    // 聞一聞（觀眾知道浣熊就在後面）……往反方向走了
    { at: 3.1, actor: 'dog', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 3.2, actor: 'coon', do: 'hop', amount: 2, dur: 0.25 },
    { at: 3.7, actor: 'dog', do: 'flip' },
    { at: 3.7, actor: 'siren', do: 'flip' },
    ...dog([{ at: 3.8, actor: 'dog', do: 'moveTo', to: { x: 70, y: D }, dur: 0.5 }]),
    // 浣熊溜出來想跑——狗狗一回頭，咬住布袋
    ...coon([{ at: 4.1, actor: 'coon', do: 'moveTo', to: { x: 108, y: R }, dur: 0.3, ease: 'out' }], -9, -6),
    { at: 4.1, actor: 'coon', do: 'flip' },
    { at: 4.45, actor: 'dog', do: 'flip' },
    { at: 4.45, actor: 'siren', do: 'flip' },
    ...dog([{ at: 4.5, actor: 'dog', do: 'moveTo', to: { x: 82, y: D }, dur: 0.2, anticipate: 3, ease: 'in' }]),
    // 拉！拉！兩個往後倒、布袋越拉越長
    ...dog([
      { at: 4.8, actor: 'dog', do: 'moveTo', to: { x: 78, y: D }, dur: 0.25 },
      { at: 5.3, actor: 'dog', do: 'moveTo', to: { x: 82, y: D }, dur: 0.2 },
      { at: 5.55, actor: 'dog', do: 'moveTo', to: { x: 76, y: D }, dur: 0.25 },
    ]),
    { at: 4.8, actor: 'coon', do: 'moveTo', to: { x: 110, y: R }, dur: 0.25 },
    { at: 5.05, actor: 'coon', do: 'moveTo', to: { x: 106, y: R }, dur: 0.25 },
    { at: 5.55, actor: 'coon', do: 'moveTo', to: { x: 112, y: R }, dur: 0.25 },
    { at: 4.8, actor: 'dog', do: 'tilt', amount: -12, dur: 0.5 },
    { at: 4.8, actor: 'coon', do: 'tilt', amount: -12, dur: 0.5 },
    { at: 4.75, actor: 'bag', do: 'moveTo', to: { x: 96, y: 62 }, dur: 0.2 },
    { at: 4.95, actor: 'bag', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 5.4, actor: 'bag', do: 'squash', amount: 0.45, dur: 0.45 },
    { at: 5.4, actor: 'bag', do: 'shake', amount: 0.8, dur: 0.45 },
    // 砰！布袋破了：浣熊彈飛，狗狗一屁股坐下
    { at: 5.85, actor: 'bag', do: 'vanish', dur: 0.08 },
    // 浣熊被彈進垃圾桶，只露出頭
    { at: 5.85, actor: 'coon', do: 'moveTo', to: { x: 128, y: 61 }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 5.85, actor: 'coon', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    ...dog([{ at: 5.85, actor: 'dog', do: 'moveTo', to: { x: 58, y: D }, dur: 0.3, ease: 'out' }]),
    { at: 5.9, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 好多金幣掉下來，堆成一座小山
    { at: 6.1, actor: 'c1', do: 'drop', dur: 0.35 },
    { at: 6.18, actor: 'c3', do: 'drop', dur: 0.35 },
    { at: 6.26, actor: 'c2', do: 'drop', dur: 0.35 },
    { at: 6.34, actor: 'c4', do: 'drop', dur: 0.35 },
    { at: 6.42, actor: 'c5', do: 'drop', dur: 0.35 },
    { at: 6.5, actor: 'c6', do: 'drop', dur: 0.35 },
    // 狗狗跳上金幣山，警燈閃閃；亮相
    ...dog([{ at: 7.0, actor: 'dog', do: 'moveTo', to: { x: 92, y: 56 }, arc: 12, dur: 0.45, ease: 'out' }]),
    { at: 7.45, actor: 'dog', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.5, actor: 'siren', do: 'flash', dur: 0.5 },
    { at: 8.0, actor: 'siren', do: 'flash', dur: 0.5 },
    { at: 8.5, actor: 'siren', do: 'flash', dur: 0.5 },
    { at: 7.6, actor: 'coon', do: 'shake', amount: 0.6, dur: 0.6 },
    ...dog([{ at: 8.3, actor: 'dog', do: 'hop', amount: 4, dur: 0.35 }]),
  ],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'coon', emoji: '🤫', dx: 8, dur: 0.6 },
    { at: 1.3, kind: 'pop', actor: 'coon', emoji: '❗', dur: 0.4 },
    { at: 1.4, kind: 'puff', actor: 'dog', dur: 0.4 },
    { at: 2.15, kind: 'pop', actor: 'dog', emoji: '🐾', dx: -10, dur: 0.6 },
    { at: 3.1, kind: 'pop', actor: 'dog', emoji: '❓', dx: -6, dur: 0.5 },
    { at: 3.15, kind: 'sweat', actor: 'coon' },
    { at: 3.9, kind: 'pop', actor: 'coon', emoji: '😆', dur: 0.5 },
    { at: 4.45, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
    { at: 5.0, kind: 'sweat', actor: 'dog' },
    { at: 5.2, kind: 'sweat', actor: 'coon' },
    { at: 5.85, kind: 'burst', actor: 'bag', dur: 0.4 },
    { at: 5.85, kind: 'fountain', actor: 'bag', emoji: '🪙', n: 12, dur: 1.1 },
    { at: 5.95, kind: 'puff', actor: 'dog', dur: 0.4 },
    { at: 6.4, kind: 'dizzy', actor: 'coon', dur: 2.6 },
    { at: 7.45, kind: 'burst', actor: 'dog', emoji: '⭐', n: 8, dur: 0.8 },
    { at: 8.1, kind: 'burst', actor: 'siren', emoji: '🎉', n: 6, dur: 0.9 },
  ],
  camera: [
    { at: 3.0, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 100, y: 60 } },
    { at: 5.85, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 7.2, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 126, y: 52 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.3 },
    { at: 5.85, dur: 0.05, level: -0.4 },
    { at: 5.9, dur: 0.3, level: 0.3 },
    // 亮相：路燈都亮了
    { at: 7.3, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.3, sfx: 'blip' },
    { at: 2.1, sfx: 'blip' },
    { at: 4.45, sfx: 'whoosh' },
    { at: 4.8, sfx: 'slide' },
    { at: 5.4, sfx: 'slide' },
    { at: 5.85, sfx: 'crack' },
    { at: 6.1, sfx: 'clink' },
    { at: 6.4, sfx: 'clink' },
    { at: 7.0, sfx: 'boing' },
    { at: 7.55, say: '拉布拉多警長' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
