import type { Clip } from '../clip'

// 家：豬探長發現一條紅色大繩索（線索！），咬住就往回拖，玩具機器人卻抓住另一頭。拔河拔到臉紅、腳滑、繩子愈拉愈細——啪！
// 兩個屁股著地飛出去，斷掉的繩段彈上天落成「家」。豬探長一溜煙鑽進角落的小豬屋，從窗口探頭；機器人也想回家，小屋卻只夠戴在頭上。家、家、回家
const clip: Clip = {
  char: '家',
  meta: { theme: '豬探長搶線索', cast: '豬探長＋玩具機器人＋紅繩子＋小豬屋', gags: ['拔河拔到繩子斷', '屁股著地飛出去', '小屋太小戴在頭上'] },
  duration: 10,
  bg: { top: '#FFF3BF', bottom: '#FFF9DB', floor: '#E9C46A', scenery: 'room' },
  actors: [
    { id: 'rope', emoji: '🪢', x: 80, y: 71, size: 10 },
    { id: 'house', emoji: '🏠', x: 13, y: 68.5, size: 18, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 62, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 108, y: 71.1, size: 14, hidden: true },
    { id: 'hut', emoji: '🛖', x: 150, y: 73, size: 8, hidden: true },
  ],
  moves: [
    // 豬探長衝進來，看到線索
    { at: 0, actor: 'pig', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.5, ease: 'back' },
    { at: 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 0.6, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 咬住繩子往左拖
    { at: 0.95, actor: 'rope', do: 'vanish', dur: 0.15 },
    { at: 0.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 0.95, actor: 'pig', do: 'moveTo', to: { x: 54, y: 71.1 }, dur: 0.4 },
    // 機器人抓住另一頭
    { at: 1.2, actor: 'robot', do: 'enter', from: { x: 175, y: 71.1 }, dur: 0.45, ease: 'out' },
    { at: 1.65, actor: 'robot', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 拔河：愈拉愈開
    { at: 1.9, actor: 'pig', do: 'moveTo', to: { x: 26, y: 71.1 }, dur: 1.4 },
    { at: 1.9, actor: 'robot', do: 'moveTo', to: { x: 134, y: 71.1 }, dur: 1.4 },
    { at: 1.9, actor: 'pig', do: 'rotateTo', amount: -12, dur: 0.4 },
    { at: 1.9, actor: 'robot', do: 'rotateTo', amount: 12, dur: 0.4 },
    { at: 2.4, actor: 'pig', do: 'shake', amount: 1, dur: 0.8 },
    { at: 2.4, actor: 'robot', do: 'shake', amount: 1, dur: 0.8 },
    { at: 3.2, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 3.2, actor: 'robot', do: 'shake', amount: 0.6, dur: 0.3 },
    // 啪！屁股著地飛出去
    { at: 3.55, actor: 'pig', do: 'rotateTo', amount: 12, dur: 0.2 },
    { at: 3.55, actor: 'robot', do: 'rotateTo', amount: -12, dur: 0.2 },
    { at: 3.55, actor: 'pig', do: 'moveTo', to: { x: 28, y: 71.1 }, dur: 0.45, arc: 8, ease: 'out' },
    { at: 3.55, actor: 'robot', do: 'moveTo', to: { x: 140, y: 71.1 }, dur: 0.45, arc: 8, ease: 'out' },
    { at: 3.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 3.55, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 4.0, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.0, actor: 'robot', do: 'squash', amount: 0.4, dur: 0.3 },
    // 小豬屋冒出來，豬探長衝回家
    { at: 6.0, actor: 'house', do: 'pop' },
    { at: 6.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 6.35, actor: 'pig', do: 'hop', amount: 4, dur: 0.25 },
    { at: 6.6, actor: 'pig', do: 'moveTo', to: { x: 14, y: 71.1 }, dur: 0.3, anticipate: 2, ease: 'in' },
    { at: 6.85, actor: 'pig', do: 'vanish', dur: 0.15 },
    { at: 6.95, actor: 'house', do: 'squash', amount: 0.2, dur: 0.25 },
    // 從窗口探頭
    { at: 7.3, actor: 'pig', do: 'moveTo', to: { x: 13, y: 66 }, dur: 0.01 },
    { at: 7.35, actor: 'pig', do: 'pop' },
    { at: 7.35, actor: 'pig', do: 'scaleTo', amount: 0.5, dur: 0.01 },
    { at: 7.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    // 機器人也想回家：小屋太小，只好戴在頭上
    { at: 7.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 7.9, actor: 'hut', do: 'pop' },
    { at: 8.2, actor: 'robot', do: 'moveTo', to: { x: 146, y: 71.1 }, dur: 0.3 },
    { at: 8.5, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.55, actor: 'hut', do: 'moveTo', to: { x: 146, y: 61.5 }, dur: 0.35, arc: 6, ease: 'back' },
    { at: 8.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 9.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 9.3, actor: 'robot', do: 'hop', amount: 3, dur: 0.3 },
    { at: 9.3, actor: 'hut', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 斷掉的繩段彈上天：寶蓋頭先落，再落成「豕」
    { at: 3.6, dur: 0.55, strokes: [0, 1, 2], from: { x: 80, y: 62 }, color: '#E8412C' },
    { at: 4.15, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8, 9], from: { x: 80, y: 62 }, color: '#E8412C' },
  ],
  glyph: [{ at: 5.2, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 0.95, kind: 'line', actor: 'pig', to: { x: 80, y: 72 }, color: '#E8412C', width: 2.4, dur: 0.75 },
    { at: 1.6, kind: 'line', actor: 'pig', target: 'robot', color: '#E8412C', width: 2.4, dur: 1.0 },
    { at: 2.5, kind: 'line', actor: 'pig', target: 'robot', color: '#E8412C', width: 1.5, dur: 0.6 },
    { at: 3.0, kind: 'line', actor: 'pig', target: 'robot', color: '#E8412C', width: 0.8, dur: 0.55 },
    { at: 1.75, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5 },
    { at: 2.3, kind: 'sweat', actor: 'pig' },
    { at: 2.5, kind: 'pop', actor: 'robot', emoji: '💢', dur: 0.5 },
    { at: 2.6, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 2.6, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 3.55, kind: 'burst', x: 80, y: 66 },
    { at: 4.05, kind: 'puff', actor: 'pig' },
    { at: 4.05, kind: 'puff', actor: 'robot' },
    { at: 4.1, kind: 'dizzy', actor: 'pig', dur: 1.4 },
    { at: 4.1, kind: 'dizzy', actor: 'robot', dur: 1.4 },
    { at: 6.95, kind: 'puff', actor: 'house' },
    { at: 7.7, kind: 'pop', actor: 'pig', emoji: '👋', dur: 0.8 },
    { at: 8.9, kind: 'sweat', actor: 'robot' },
    { at: 9.3, kind: 'pop', actor: 'robot', emoji: '👍', dx: -6, dy: -4, dur: 0.6 },
  ],
  camera: [
    { at: 3.1, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 80, y: 66 } },
    { at: 3.6, dur: 0.35, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.05, sfx: 'whoosh' },
    { at: 0.5, sfx: 'boing' },
    { at: 1.0, say: '家' },
    { at: 1.65, sfx: 'plop' },
    { at: 2.3, sfx: 'slide' },
    { at: 3.55, sfx: 'crack' },
    { at: 4.0, sfx: 'bonk' },
    { at: 5.25, say: '家' },
    { at: 6.0, sfx: 'clink' },
    { at: 6.6, say: '回家' },
    { at: 7.35, sfx: 'boing' },
    { at: 8.5, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
