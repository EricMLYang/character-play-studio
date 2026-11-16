import type { Clip } from '../clip'

// 摸：積木小隊想摸摸小老鼠，伸手一摸——老鼠往後一跳，摸了個空；再摸一次又空。乾脆爬上彈弓把自己射過去，
// 結果整個飛過老鼠頭頂，撞牆散架，頭倒栽進水桶。散落的積木拼成「摸」，老鼠走過去摸摸他的頭。最後積木想摸回去——老鼠又一跳躲開。摸、摸、摸摸
const clip: Clip = {
  char: '摸',
  meta: { theme: '積木小隊摸老鼠', cast: '積木小隊＋小老鼠＋彈弓＋水桶', gags: ['一直摸不到', '彈弓發射飛過頭撞牆', '倒栽進水桶', '回馬槍又摸空'] },
  duration: 10,
  bg: { top: '#FFF3C4', bottom: '#FFF9E2', floor: '#E8CF94', scenery: 'room' },
  actors: [
    { id: 'sling', emoji: '🏹', x: 12, y: 68, size: 12 },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 58, y: 71.5, size: 13 },
    { id: 'brick', emoji: 'hero:brick/idle', x: 30, y: 70.7, size: 15, flip: true },
    { id: 'bucket', emoji: '🪣', x: 146, y: 71, size: 12 },
  ],
  moves: [
    // 伸手摸——老鼠往後一跳
    { at: 0.4, actor: 'brick', do: 'moveTo', to: { x: 40, y: 70.7 }, dur: 0.3, ease: 'back' },
    { at: 0.4, actor: 'brick', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 0.5, actor: 'mouse', do: 'moveTo', to: { x: 72, y: 71.5 }, arc: 5, dur: 0.25, ease: 'out' },
    // 再摸一次，又空
    { at: 0.9, actor: 'brick', do: 'moveTo', to: { x: 58, y: 70.7 }, dur: 0.3, ease: 'back' },
    { at: 0.9, actor: 'brick', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.0, actor: 'mouse', do: 'moveTo', to: { x: 94, y: 71.5 }, arc: 7, dur: 0.3, ease: 'out' },
    { at: 1.25, actor: 'brick', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 1.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 跺腳生氣，指著彈弓
    { at: 1.7, actor: 'brick', do: 'swap', emoji: 'hero:brick/march' },
    { at: 1.7, actor: 'brick', do: 'bounce', amount: 2, times: 3, dur: 0.4 },
    { at: 2.1, actor: 'brick', do: 'flip' },
    // 爬上彈弓，跺三下倒數
    { at: 2.2, actor: 'brick', do: 'moveTo', to: { x: 14, y: 62 }, arc: 8, dur: 0.4 },
    { at: 2.7, actor: 'brick', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: 2.95, actor: 'brick', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: 3.2, actor: 'brick', do: 'squash', amount: 0.35, dur: 0.15 },
    { at: 2.7, actor: 'mouse', do: 'shake', amount: 0.5, dur: 0.6 },
    // 發射！飛過老鼠頭頂
    { at: 3.35, actor: 'sling', do: 'tilt', amount: 35, dur: 0.3 },
    { at: 3.35, actor: 'brick', do: 'flip' },
    { at: 3.35, actor: 'brick', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 3.35, actor: 'brick', do: 'moveTo', to: { x: 153, y: 44 }, arc: 26, dur: 0.7, ease: 'linear' },
    { at: 3.35, actor: 'brick', do: 'spin', times: 1, dur: 0.7 },
    { at: 3.6, actor: 'mouse', do: 'squash', amount: 0.45, dur: 0.4 },
    // 碰！撞牆散架，頭倒栽進水桶
    { at: 4.05, actor: 'brick', do: 'squash', amount: -0.5, dur: 0.3 },
    { at: 4.3, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.3, actor: 'brick', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 4.3, actor: 'brick', do: 'moveTo', to: { x: 146, y: 56 }, dur: 0.45, ease: 'bounce' },
    { at: 4.75, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.9, actor: 'brick', do: 'shake', amount: 0.8, dur: 0.8 },
    // 老鼠走過去，摸摸他的頭
    { at: 4.95, actor: 'mouse', do: 'flip' },
    { at: 4.95, actor: 'mouse', do: 'moveTo', to: { x: 130, y: 71.5 }, dur: 0.6 },
    { at: 4.95, actor: 'mouse', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 6.8, actor: 'mouse', do: 'hop', amount: 2.5, dur: 0.25 },
    { at: 7.1, actor: 'mouse', do: 'hop', amount: 2.5, dur: 0.25 },
    { at: 6.9, actor: 'brick', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 7.0, actor: 'bucket', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 7.4, actor: 'brick', do: 'shake', amount: 0.8, dur: 0.5 },
    // 回馬槍：積木跳出水桶想摸回去——老鼠又一跳躲開
    { at: 8.2, actor: 'brick', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 8.2, actor: 'brick', do: 'moveTo', to: { x: 142, y: 70.7 }, arc: 10, dur: 0.45 },
    { at: 8.7, actor: 'brick', do: 'moveTo', to: { x: 134, y: 70.7 }, dur: 0.25, ease: 'back' },
    { at: 8.7, actor: 'brick', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 8.75, actor: 'mouse', do: 'moveTo', to: { x: 120, y: 71.5 }, arc: 6, dur: 0.25, ease: 'out' },
    { at: 9.0, actor: 'mouse', do: 'flip' },
    { at: 9.0, actor: 'brick', do: 'swap', emoji: 'hero:brick/surprised' },
  ],
  builds: [
    // 彈弓的柱子和橫桿 → 扌；散開的積木 → 艹、日、大
    { at: 4.15, dur: 0.4, strokes: [0, 1, 2], from: 'sling', color: '#E8590C' },
    { at: 4.45, dur: 0.35, strokes: [3, 4, 5], from: 'brick', color: '#D9480F' },
    { at: 4.75, dur: 0.4, strokes: [6, 7, 8, 9], from: 'brick', color: '#D9480F' },
    { at: 5.1, dur: 0.4, strokes: [10, 11, 12], from: 'brick', color: '#D9480F' },
  ],
  glyph: [{ at: 5.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.25, kind: 'pop', actor: 'brick', emoji: '❓', dur: 0.5 },
    { at: 1.45, kind: 'pop', actor: 'mouse', emoji: '😜', dur: 0.5 },
    { at: 1.8, kind: 'pop', actor: 'brick', emoji: '💢', dur: 0.4 },
    { at: 2.1, kind: 'pop', actor: 'brick', emoji: '💡', dur: 0.4 },
    { at: 2.8, kind: 'pop', actor: 'mouse', emoji: '🙈', dur: 0.6 },
    { at: 3.35, kind: 'puff', actor: 'sling', dur: 0.4 },
    { at: 4.05, kind: 'burst', actor: 'brick', n: 1, dur: 0.3, dx: -4 },
    { at: 4.1, kind: 'burst', actor: 'brick', emoji: '🧱', n: 6, dur: 0.6, dx: -10 },
    { at: 4.75, kind: 'burst', actor: 'bucket', emoji: '💦', n: 4, dur: 0.5, dx: -6 },
    { at: 7.0, kind: 'burst', actor: 'brick', emoji: '💕', n: 3, dur: 0.6, dx: -6 },
    { at: 8.95, kind: 'pop', actor: 'mouse', emoji: '😜', dur: 0.6 },
    { at: 9.1, kind: 'sweat', actor: 'brick' },
  ],
  camera: [
    // 發射時跟拍，撞牆前退回全景
    { at: 3.35, dur: 0.3, do: 'follow', actor: 'brick', amount: 1.25 },
    { at: 3.8, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.05, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.5, sfx: 'whoosh' },
    { at: 1.1, say: '摸' },
    { at: 1.7, sfx: 'tap' },
    { at: 2.7, sfx: 'tap' },
    { at: 2.95, sfx: 'tap' },
    { at: 3.2, sfx: 'tap' },
    { at: 3.35, sfx: 'boing' },
    { at: 4.05, sfx: 'bonk' },
    { at: 4.75, sfx: 'splash' },
    { at: 5.6, say: '摸' },
    { at: 6.8, say: '摸摸' },
    { at: 8.75, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
