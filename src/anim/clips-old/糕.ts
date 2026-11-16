import type { Clip } from '../clip'

// 糕：拉布拉多警長看到一座超大蛋糕擋在路中間，吹哨、後仰、衝——踩到一坨奶油，滑過頭溜出畫面，探頭回來好尷尬。
// 第二次退更遠、蓄更久，全速「碰」撞進蛋糕：米粒掉成「米」、奶油層掉成「羊」、四根蠟燭火苗掉成四點。一塊蛋糕掉到他頭上當帽子；最後滑下來，一口吃掉。糕、糕、蛋糕
const clip: Clip = {
  char: '糕',
  meta: { theme: '警長撞蛋糕', cast: '拉布拉多警長＋超大蛋糕＋奶油', gags: ['踩到奶油滑過頭', '探頭回來好尷尬', '全速撞進蛋糕', '回馬槍蛋糕帽一口吃掉'] },
  duration: 10,
  bg: { top: '#FFF5CF', bottom: '#FFFAE6', floor: '#D8C9A6', scenery: 'city' },
  actors: [
    { id: 'cake', emoji: '🎂', x: 134, y: 63.5, size: 32 },
    { id: 'cream', emoji: '🍦', x: 92, y: 73, size: 6 },
    { id: 'sheriff', emoji: 'hero:sheriff/run', x: 26, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'slice', emoji: '🍰', x: 128, y: 59, size: 8, hidden: true },
  ],
  moves: [
    // 滑進來，看到蛋糕擋路，指著它吹哨
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.6, ease: 'back' },
    { at: 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 0.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 0.9, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.25 },
    // 後仰蓄力
    { at: 1.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 1.25, actor: 'sheriff', do: 'rotateTo', amount: -20, dur: 0.35 },
    { at: 1.25, actor: 'sheriff', do: 'squash', amount: -0.2, dur: 0.4 },
    // 衝——踩到奶油，滑過頭溜出畫面
    { at: 1.75, actor: 'sheriff', do: 'rotateTo', amount: 20, dur: 0.1 },
    { at: 1.75, actor: 'sheriff', do: 'moveTo', to: { x: 90, y: 70.7 }, dur: 0.35, anticipate: 4, ease: 'in' },
    { at: 2.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 2.1, actor: 'sheriff', do: 'moveTo', to: { x: 182, y: 70.7 }, dur: 0.45, ease: 'linear' },
    { at: 2.1, actor: 'sheriff', do: 'shake', amount: 1.5, dur: 0.45 },
    { at: 2.1, actor: 'cream', do: 'squash', amount: 0.6, dur: 0.3 },
    // 空蕩蕩的路……探頭回來
    { at: 2.9, actor: 'sheriff', do: 'flip' },
    { at: 2.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 2.9, actor: 'sheriff', do: 'moveTo', to: { x: 154, y: 70.7 }, dur: 0.3, ease: 'out' },
    // 走回去，退得更遠，蓄力更久
    { at: 3.4, actor: 'sheriff', do: 'moveTo', to: { x: 16, y: 70.7 }, dur: 0.45, ease: 'inOut' },
    { at: 3.4, actor: 'sheriff', do: 'bounce', amount: 2, times: 4, dur: 0.45 },
    { at: 3.4, actor: 'cream', do: 'vanish', dur: 0.2 },
    { at: 3.9, actor: 'sheriff', do: 'flip' },
    { at: 3.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 3.9, actor: 'sheriff', do: 'rotateTo', amount: -25, dur: 0.3 },
    { at: 4.15, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 0.25 },
    // 全速衝撞——碰！
    { at: 4.4, actor: 'sheriff', do: 'rotateTo', amount: 25, dur: 0.08 },
    { at: 4.4, actor: 'sheriff', do: 'moveTo', to: { x: 114, y: 70.7 }, dur: 0.3, anticipate: 5, ease: 'in' },
    { at: 4.7, actor: 'sheriff', do: 'squash', amount: -0.55, dur: 0.5 },
    { at: 4.7, actor: 'cake', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 4.7, actor: 'cake', do: 'shake', amount: 1.5, dur: 0.8 },
    { at: 4.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    // 蛋糕整個震散了；警長暈暈地晃到右下角
    { at: 6.0, actor: 'cake', do: 'vanish', dur: 0.3 },
    { at: 5.9, actor: 'sheriff', do: 'moveTo', to: { x: 128, y: 70.7 }, dur: 0.4 },
    // 一塊蛋糕掉到頭上當帽子
    { at: 6.6, actor: 'slice', do: 'drop', dur: 0.55 },
    { at: 7.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.0, actor: 'sheriff', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 7.0, actor: 'slice', do: 'hop', amount: -1.6, dur: 0.25 },
    // 回馬槍：蛋糕滑下來，用鼻子接住——一口吃掉
    { at: 8.2, actor: 'sheriff', do: 'tilt', amount: -10, dur: 0.4 },
    { at: 8.3, actor: 'slice', do: 'moveTo', to: { x: 121, y: 66 }, dur: 0.35, ease: 'bounce' },
    { at: 8.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 9.0, actor: 'slice', do: 'vanish', dur: 0.15 },
    { at: 9.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 9.0, actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 9.3, actor: 'sheriff', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 米粒灑下來 → 米；奶油層掉下來 → 羊；四根蠟燭的火苗 → 四點
    { at: 4.8, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: 'cake', style: 'drop', color: '#D6336C' },
    { at: 5.25, dur: 0.5, strokes: [6, 7, 8, 9, 10, 11], from: 'cake', style: 'drop', color: '#D6336C' },
    { at: 5.7, dur: 0.45, strokes: [12, 13, 14, 15], from: 'cake', color: '#F76707' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'sheriff', emoji: '❗', dur: 0.4 },
    { at: 1.3, kind: 'puff', actor: 'sheriff', dur: 0.4 },
    { at: 3.15, kind: 'sweat', actor: 'sheriff', dx: -8 },
    { at: 3.05, kind: 'pop', actor: 'sheriff', emoji: '😅', dur: 0.4, dx: -4 },
    { at: 4.0, kind: 'zzz', actor: 'sheriff', emoji: '💨', dur: 0.5, dx: 6 },
    { at: 4.7, kind: 'burst', actor: 'sheriff', n: 1, dur: 0.35, dx: 6 },
    { at: 4.75, kind: 'burst', actor: 'cake', emoji: '🍚', n: 5, dur: 0.6 },
    { at: 5.0, kind: 'dizzy', actor: 'sheriff', dur: 1.4 },
    { at: 7.1, kind: 'pop', actor: 'sheriff', emoji: '😵‍💫', dur: 0.5, dx: -8 },
    { at: 9.05, kind: 'pop', actor: 'sheriff', emoji: '😋', dur: 0.6 },
  ],
  camera: [
    // 第一次衝跟拍；第二次蓄力推近，撞上去退回全景並震一下
    { at: 1.75, dur: 0.3, do: 'follow', actor: 'sheriff', amount: 1.3 },
    { at: 2.4, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.9, dur: 0.45, do: 'zoom', amount: 1.3, actor: 'sheriff' },
    { at: 4.4, dur: 0.25, do: 'zoom', amount: 1 },
    { at: 4.7, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.4, say: '糕' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.1, sfx: 'slide' },
    { at: 3.4, sfx: 'tap' },
    { at: 4.4, sfx: 'whoosh' },
    { at: 4.7, sfx: 'bonk' },
    { at: 6.2, say: '糕' },
    { at: 7.0, sfx: 'plop' },
    { at: 7.15, say: '蛋糕' },
    { at: 9.0, sfx: 'gulp' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
