import type { Clip } from '../clip'

// 貓（重做）：小貓卡在大樹頂下不來，消防員扛梯子跳上去搆——被小貓一掌拍下來；大怪獸咚咚咚走來，把整棵樹往下拉彎，小貓一爪抓牠鼻子，
// 牠一放手，樹「咻」地彈回去，滿樹的葉子噴上天落成「貓」，小貓也被彈上天。國字讓到上方，小貓從天上掉到怪獸頭上（貓咪）；回馬槍：怪獸想摸牠，小貓炸毛一兇，大怪獸嚇到跳上光禿禿的樹頂、換牠卡在上面下不來。貓、貓、貓咪
const G = 66.9 // 大怪獸（size 24）站在地上的 y
const F = 68.6 // 消防員（size 20）
const K = 46 // 小貓坐在樹頂的 y

const clip: Clip = {
  char: '貓',
  meta: { theme: '救卡在樹上的小貓', cast: '大怪獸＋消防員＋消防車＋小貓咪＋大樹', gags: ['扛梯子跳上去被小貓拍下來', '把樹拉彎被抓鼻子一放手樹彈回去', '葉子噴上天變成字', '小貓從天上掉到怪獸頭上', '怪獸被小貓嚇到跳上樹頂換牠下不來'] },
  duration: 10,
  bg: { top: '#CFEFFF', bottom: '#F2FBFF', floor: '#C8C2B8', scenery: 'city' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 30, y: 63.6, size: 32 },
    { id: 'kit', emoji: '🐈', x: 34, y: K, size: 12, flip: true, pivot: 'center' },
    { id: 'engine', emoji: '🚒', x: 146, y: 69.5, size: 18, hidden: true },
    { id: 'mon', emoji: 'hero:monster/idle', x: 128, y: G, size: 24, hidden: true },
    { id: 'fire', emoji: 'hero:firefighter/idle', x: 120, y: F, size: 20, hidden: true },
  ],
  moves: [
    // 消防車嗚嗚開進來，消防員跳下車
    { at: 0, actor: 'engine', do: 'enter', from: { x: 190, y: 69.5 }, dur: 0.6, ease: 'back' },
    { at: 0.1, actor: 'kit', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 0.55, actor: 'fire', do: 'enter', from: { x: 142, y: 60 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 1.0, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 扛起梯子衝過去，蹲、跳——差一點點
    { at: 1.35, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/ladder' },
    { at: 1.4, actor: 'fire', do: 'moveTo', to: { x: 52, y: F }, dur: 0.45, ease: 'out' },
    { at: 1.9, actor: 'fire', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.1, actor: 'fire', do: 'moveTo', to: { x: 46, y: 54 }, dur: 0.25, ease: 'out' },
    // 小貓一掌拍下去
    { at: 2.3, actor: 'kit', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 2.35, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 2.35, actor: 'fire', do: 'moveTo', to: { x: 58, y: F }, dur: 0.3, ease: 'in' },
    { at: 2.35, actor: 'fire', do: 'spin', times: -1, dur: 0.3, pivot: 'center' },
    // 大怪獸咚咚咚走來，每一步都震得消防車跳一下；消防員趕快爬回車頂讓開
    { at: 2.8, actor: 'mon', do: 'enter', from: { x: 190, y: G }, dur: 0.9, ease: 'linear' },
    ...[3.0, 3.3, 3.6].map((at) => ({ at, actor: 'engine', do: 'hop' as const, amount: 2.5, dur: 0.18 })),
    { at: 2.95, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 2.95, actor: 'fire', do: 'flip' },
    { at: 3.0, actor: 'fire', do: 'moveTo', to: { x: 144, y: 55 }, arc: 14, dur: 0.55, ease: 'inOut' },
    { at: 3.6, actor: 'fire', do: 'flip' },
    { at: 3.7, actor: 'mon', do: 'moveTo', to: { x: 62, y: G }, dur: 0.45, ease: 'out' },
    // 抓住樹，往下拉彎——小貓被帶到牠鼻子前面
    { at: 4.15, actor: 'mon', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 4.2, actor: 'tree', do: 'rotateTo', amount: 32, dur: 0.6, ease: 'inOut' },
    { at: 4.2, actor: 'kit', do: 'moveTo', to: { x: 56, y: 52 }, dur: 0.6, ease: 'inOut' },
    { at: 4.2, actor: 'mon', do: 'rotateTo', amount: 10, dur: 0.6 },
    // 一爪抓鼻子！牠一放手往後翻，樹「咻」地彈回去
    { at: 4.85, actor: 'kit', do: 'tilt', amount: 30, dur: 0.15 },
    { at: 4.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 4.95, actor: 'mon', do: 'rotateTo', amount: -10, dur: 0.1 },
    { at: 4.95, actor: 'mon', do: 'moveTo', to: { x: 126, y: G }, arc: 12, dur: 0.5, ease: 'out' },
    { at: 4.95, actor: 'mon', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    { at: 4.95, actor: 'tree', do: 'rotateTo', amount: -32, dur: 0.6, ease: 'elastic' },
    // 葉子掉光只剩樹幹：用 🪵（有分枝的樹幹）。🪾 沒有 3D 圖、舊 iPad 也可能顯示成方框
    { at: 5.05, actor: 'tree', do: 'swap', emoji: '🪵' },
    // 小貓被彈上天
    { at: 5.05, actor: 'kit', do: 'moveTo', to: { x: 40, y: -20 }, dur: 0.35, ease: 'out' },
    { at: 5.05, actor: 'kit', do: 'spin', times: 2, dur: 0.35 },
    // 怪獸一屁股撞上消防車，車頂的消防員被震得跳起來
    { at: 5.45, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 5.45, actor: 'engine', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 5.45, actor: 'fire', do: 'hop', amount: 6, dur: 0.35 },
    { at: 5.5, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 國字讓位：怪獸甩甩頭，走到中間抬頭看；消防員跳下車
    { at: 6.4, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 6.4, actor: 'mon', do: 'shake', amount: 1, dur: 0.3 },
    { at: 6.7, actor: 'mon', do: 'moveTo', to: { x: 80, y: G }, dur: 0.5, ease: 'out' },
    { at: 6.7, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 6.75, actor: 'fire', do: 'moveTo', to: { x: 116, y: F }, arc: 8, dur: 0.4, ease: 'out' },
    // 小貓從天上掉下來，剛好坐在怪獸頭上
    { at: 7.15, actor: 'kit', do: 'moveTo', to: { x: 80, y: -20 }, dur: 0.01 },
    { at: 7.16, actor: 'kit', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: 7.2, actor: 'kit', do: 'moveTo', to: { x: 80, y: 51 }, dur: 0.5, ease: 'in' },
    { at: 7.2, actor: 'kit', do: 'spin', times: 1, dur: 0.5 },
    { at: 7.7, actor: 'mon', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 7.7, actor: 'kit', do: 'scaleTo', amount: 1.35, dur: 0.25, ease: 'back' },
    { at: 7.8, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 7.8, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/happy' },
    // 回馬槍：怪獸伸手想摸——小貓炸毛一兇
    { at: 8.1, actor: 'mon', do: 'tilt', amount: 8, dur: 0.25 },
    { at: 8.2, actor: 'kit', do: 'scaleTo', amount: 1.35, dur: 0.12, ease: 'back' },
    { at: 8.2, actor: 'kit', do: 'shake', amount: 1, dur: 0.2 },
    // 大怪獸嚇到跳上光禿禿的樹頂，換牠下不來；小貓掉進消防員懷裡
    { at: 8.4, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 8.4, actor: 'mon', do: 'moveTo', to: { x: 30, y: 40 }, arc: 14, dur: 0.4, ease: 'out' },
    { at: 8.4, actor: 'kit', do: 'scaleTo', amount: 0.74, dur: 0.2 },
    { at: 8.4, actor: 'kit', do: 'moveTo', to: { x: 116, y: 56 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 8.8, actor: 'tree', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 8.8, actor: 'mon', do: 'shake', amount: 1, dur: 1.0 },
    { at: 8.85, actor: 'fire', do: 'moveTo', to: { x: 124, y: F }, dur: 0.3, ease: 'out' },
    { at: 8.85, actor: 'kit', do: 'moveTo', to: { x: 124, y: 56 }, dur: 0.3, ease: 'out' },
    { at: 9.1, actor: 'tree', do: 'tilt', amount: 6, dur: 0.5 },
    { at: 9.6, actor: 'tree', do: 'tilt', amount: -6, dur: 0.4 },
    { at: 9.5, actor: 'fire', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.5, actor: 'kit', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 樹彈回去，滿樹的葉子噴上天：豸、苗
    { at: 5.05, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'tree', color: '#2F9E44' },
    { at: 5.3, dur: 0.6, strokes: [7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'tree', color: '#74B816' },
  ],
  glyph: [
    { at: 5.95, dur: 0.4, do: 'wobble' },
    { at: 6.75, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.15, kind: 'bubble', actor: 'kit', emoji: '😿', dur: 0.8 },
    { at: 1.0, kind: 'pop', actor: 'fire', emoji: '❗', dur: 0.45 },
    { at: 2.3, kind: 'burst', actor: 'fire', n: 1, dur: 0.3 },
    { at: 2.7, kind: 'dizzy', actor: 'fire', dur: 0.5 },
    { at: 2.75, kind: 'pop', actor: 'kit', emoji: '😼', dur: 0.5 },
    { at: 3.75, kind: 'pop', actor: 'mon', emoji: '💪', dur: 0.45 },
    { at: 4.4, kind: 'sweat', actor: 'mon' },
    { at: 4.85, kind: 'burst', actor: 'mon', n: 1, dx: -6, dy: 8, dur: 0.35 },
    { at: 5.05, kind: 'burst', actor: 'tree', emoji: '🍃', n: 8, dur: 0.6 },
    { at: 5.45, kind: 'burst', actor: 'engine', n: 1, dx: -8, dur: 0.3 },
    { at: 5.6, kind: 'dizzy', actor: 'mon', dur: 0.8 },
    { at: 7.1, kind: 'pop', actor: 'mon', emoji: '❓', dx: -16, dy: 4, dur: 0.4 },
    { at: 7.8, kind: 'burst', actor: 'kit', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.2, kind: 'pop', actor: 'kit', emoji: '💢', dx: 16, dy: 8, dur: 0.4 },
    { at: 8.45, kind: 'pop', actor: 'mon', emoji: '😱', dx: -12, dur: 0.45 },
    { at: 8.9, kind: 'sweat', actor: 'mon' },
    { at: 9.5, kind: 'sweat', actor: 'mon' },
    { at: 9.2, kind: 'pop', actor: 'fire', emoji: '😆', dx: 12, dur: 0.5 },
  ],
  camera: [
    { at: 5.05, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 7.7, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 80, y: 50 } },
    { at: 8.4, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    { at: 5.05, dur: 0.04, level: -0.45 },
    { at: 5.09, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 1.0, say: '貓' },
    { at: 2.1, sfx: 'boing' },
    { at: 2.3, sfx: 'bonk' },
    { at: 2.95, sfx: 'rumble' },
    { at: 4.2, sfx: 'slide' },
    { at: 4.85, sfx: 'tap' },
    { at: 5.05, sfx: 'whoosh' },
    { at: 5.45, sfx: 'bonk' },
    { at: 5.95, say: '貓' },
    { at: 7.2, sfx: 'whoosh' },
    { at: 7.7, sfx: 'plop' },
    { at: 7.7, say: '貓咪' },
    { at: 8.2, sfx: 'laser' },
    { at: 8.4, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
