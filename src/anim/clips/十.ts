import type { Clip } from '../clip'

// 十：積木小隊只要輕輕按一下服務鈴，卻疊成高塔、退到最左邊蓄力、全速衝過頭，「碰」一聲撞扁在右邊牆上。
// 彈回來一震，積木散開卡成一橫一豎的「十」；暈頭轉向的隊長輕輕一按，月亮跳出來。最後又用力過猛按一次，月亮被震得翻跟斗。十、十、十月
const clip: Clip = {
  char: '十',
  meta: { theme: '積木小隊按按鈕', cast: '積木小隊＋服務鈴＋月亮', gags: ['小事卯足全力衝過頭', '撞牆壓成扁餅', '輕輕一按才成功', '回馬槍又用力過猛'] },
  duration: 10,
  bg: { top: '#FFF6E3', bottom: '#FFFBF2', floor: '#CDEBDD', scenery: 'room' },
  actors: [
    { id: 'bell', emoji: '🛎️', x: 122, y: 72, size: 9 },
    { id: 'moon', emoji: '🌝', x: 22, y: 18, size: 14, hidden: true, float: true },
    { id: 'brick', emoji: 'hero:brick/march', x: 24, y: 70.7, size: 15, hidden: true, flip: true },
  ],
  moves: [
    // 踏步進場，看到鈴
    { at: 0, actor: 'brick', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.8 },
    { at: 0, actor: 'brick', do: 'bounce', amount: 2, times: 4, dur: 0.8 },
    { at: 1.4, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 1.4, actor: 'brick', do: 'squash', amount: -0.3, dur: 0.35 },
    // 退到最左邊，蹲低蓄力冒煙
    { at: 1.9, actor: 'brick', do: 'moveTo', to: { x: 11, y: 70.7 }, dur: 0.4 },
    { at: 2.35, actor: 'brick', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 2.35, actor: 'brick', do: 'shake', amount: 0.8, dur: 0.4 },
    // 全速衝！從鈴上面擦過去，撞扁在右邊牆上
    { at: 2.8, actor: 'brick', do: 'moveTo', to: { x: 151, y: 70.7 }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 2.8, actor: 'bell', do: 'hop', amount: 2, dur: 0.2 },
    { at: 3.2, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 3.2, actor: 'brick', do: 'squash', amount: -0.6, dur: 0.5 },
    // 彈回來滑到中間，一震散開
    { at: 3.8, actor: 'brick', do: 'moveTo', to: { x: 92, y: 70.7 }, dur: 0.5, ease: 'back' },
    { at: 3.8, actor: 'brick', do: 'hop', amount: 5, dur: 0.3 },
    { at: 4.35, actor: 'brick', do: 'shake', amount: 1.5, dur: 0.4 },
    // 暈暈地晃到鈴旁邊，輕輕一按
    { at: 5.3, actor: 'brick', do: 'moveTo', to: { x: 134, y: 70.7 }, dur: 0.6 },
    { at: 5.3, actor: 'brick', do: 'tilt', amount: 10, dur: 0.6 },
    { at: 5.95, actor: 'brick', do: 'flip' },
    { at: 6.1, actor: 'brick', do: 'hop', amount: 2, dur: 0.2 },
    { at: 6.2, actor: 'bell', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 6.25, actor: 'moon', do: 'pop', dur: 0.4 },
    { at: 6.7, actor: 'moon', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 得意地扭一扭、鞠個躬
    { at: 7.1, actor: 'brick', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 7.2, actor: 'brick', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 7.9, actor: 'brick', do: 'tilt', amount: -18, dur: 0.4 },
    // 回馬槍：再按一次——又用力過猛，月亮被震得翻跟斗
    { at: 8.4, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 8.4, actor: 'brick', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.7, actor: 'brick', do: 'moveTo', to: { x: 123, y: 66 }, arc: 12, dur: 0.35 },
    { at: 9.05, actor: 'bell', do: 'squash', amount: 0.6, dur: 0.3 },
    { at: 9.05, actor: 'brick', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 9.05, actor: 'moon', do: 'spin', times: 1, dur: 0.5 },
    { at: 9.1, actor: 'moon', do: 'hop', amount: 4, dur: 0.4 },
    { at: 9.35, actor: 'brick', do: 'moveTo', to: { x: 136, y: 70.7 }, arc: 5, dur: 0.3 },
    { at: 9.4, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
  ],
  builds: [
    // 一震散開：一排積木卡成一橫，剩下的直直掉下來穿過中間
    { at: 4.4, dur: 0.35, strokes: [0], from: 'brick', color: '#E03131' },
    { at: 4.8, dur: 0.4, strokes: [1], from: 'brick', style: 'drop', color: '#E03131' },
  ],
  glyph: [{ at: 5.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'brick', emoji: '❗', dur: 0.5 },
    { at: 1.0, kind: 'bubble', actor: 'brick', emoji: '🛎️', dur: 0.5, dx: 6 },
    { at: 3.2, kind: 'burst', actor: 'brick', n: 1, dur: 0.35, dx: -6 },
    { at: 3.5, kind: 'dizzy', actor: 'brick', dur: 0.6, dx: -4 },
    { at: 3.9, kind: 'puff', actor: 'brick', dur: 0.5 },
    { at: 5.4, kind: 'dizzy', actor: 'brick', dur: 0.7 },
    { at: 6.25, kind: 'burst', actor: 'moon', emoji: '✨', n: 5, dur: 0.6 },
    { at: 6.6, kind: 'zzz', actor: 'moon', dur: 1.2, dx: 10, dy: 8 },
    { at: 9.1, kind: 'burst', actor: 'bell', n: 1, dur: 0.3 },
    { at: 9.4, kind: 'pop', actor: 'moon', emoji: '😵', dur: 0.6 },
  ],
  camera: [
    // 衝刺跟拍，撞牆退回全景
    { at: 2.8, dur: 0.3, do: 'follow', actor: 'brick', amount: 1.3 },
    { at: 3.2, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.2, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 9.05, dur: 0.6, do: 'punch', amount: 0.1, to: { x: 124, y: 66 } },
  ],
  cues: [
    { at: 0, sfx: 'tap' },
    { at: 1.4, say: '十' },
    { at: 2.35, sfx: 'rumble' },
    { at: 2.8, sfx: 'whoosh' },
    { at: 3.2, sfx: 'bonk' },
    { at: 3.8, sfx: 'slide' },
    { at: 5.3, say: '十' },
    { at: 6.2, sfx: 'clink' },
    { at: 6.4, say: '十月' },
    { at: 9.05, sfx: 'clink' },
    { at: 9.1, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
