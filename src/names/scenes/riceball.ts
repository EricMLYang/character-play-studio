// 演的是字面意思：飯糰＋男孩——男孩想把小飯糰滾成大雪球那麼大，結果滾成一顆大雪球；最後把帽子戴在真正的飯糰上，兩個都是「飯糰男孩」。
import { scene } from '../../story/scene'

// 雪地上：楊捷睿拿著一顆小小的飯糰跳進來，看一看——太小了。他靈機一動：像滾雪球一樣滾大！
// 飯糰在雪上越滾越大、越滾越白，大到推不動……停住……往回滾，把他壓成一片。企鵝笑翻。
// 他爬起來，肚子好餓，張大嘴「啊嗚」咬一口……停一拍……全是雪！整個人凍成藍色、牙齒喀喀抖。
// 大雪球喀啦裂開，真正的小飯糰從裡面彈出來，落在他手上；企鵝把一頂帽子丟過來戴在飯糰上：「飯糰男孩」。
const B = 15 // 楊捷睿的 size
const G = 77 - 0.42 * B
const R = 10 // 飯糰
const RG = 77 - 0.42 * R
const P = 13 // 企鵝
const HAND = { dx: 6, dy: -1 } // 飯糰拿在手上
const UP = { x: 52, y: 53 } // 亮相：飯糰舉在頭上

export default scene({
  duration: 9.4,
  bg: { top: '#9CC8F0', bottom: '#EAF4FF', floor: '#F4F8FF', scenery: 'snow' },
  actors: [
    { id: 'tree1', emoji: '🌲', x: 14, y: 77 - 0.42 * 26, size: 26 },
    { id: 'snowman', emoji: '⛄', x: 146, y: 77 - 0.42 * 20, size: 20 },
    { id: 'flake', emoji: '❄️', x: 112, y: 16, size: 8, float: true },
    { id: 'ball', emoji: '🍙', x: 30 + HAND.dx, y: G + HAND.dy, size: R, pivot: 'center' },
    { id: 'boy', emoji: 'hero:yang/happy', x: 30, y: G, size: B },
    { id: 'peng', emoji: '🐧', x: 128, y: 77 - 0.42 * P, size: P },
    { id: 'rice', emoji: '🍙', x: 30, y: 30, size: R, hidden: true, pivot: 'center' },
    { id: 'cap', emoji: '🧢', x: UP.x, y: UP.y - 7, size: 7, hidden: true, float: true },
  ],
  moves: [
    // ① 拿著小飯糰跳進來
    { at: 0, actor: 'boy', do: 'enter', from: { x: -20, y: G }, dur: 0.8, ease: 'out' },
    { at: 0, actor: 'ball', do: 'enter', from: { x: -20 + HAND.dx, y: G + HAND.dy }, dur: 0.8, ease: 'out' },
    { at: 0.85, actor: 'ball', do: 'hop', amount: 3, dur: 0.3 },
    // 看一看……太小了。想一想——滾大！
    { at: 1.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/think' },
    { at: 1.0, actor: 'boy', do: 'tilt', amount: 10, dur: 0.5 },
    // ② 放到雪上，推著滾：越滾越大、越滾越白
    { at: 1.6, actor: 'boy', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 1.6, actor: 'ball', do: 'moveTo', to: { x: 44, y: RG }, dur: 0.2 },
    { at: 1.85, actor: 'ball', do: 'moveTo', to: { x: 84, y: RG }, dur: 1.2, ease: 'inOut' },
    { at: 1.85, actor: 'ball', do: 'rotateTo', amount: 540, dur: 1.2, ease: 'inOut' },
    { at: 1.85, actor: 'ball', do: 'scaleTo', amount: 3.3, dur: 1.2, ease: 'in' },
    { at: 2.3, actor: 'ball', do: 'tint', filter: 'grayscale(.5) brightness(1.15)' },
    { at: 2.7, actor: 'ball', do: 'tint', filter: 'grayscale(1) brightness(1.5)' },
    { at: 1.85, actor: 'boy', do: 'moveTo', to: { x: 58, y: G }, dur: 1.2, ease: 'inOut' },
    // ③ 推不動……停住……往回滾，把他壓扁
    { at: 3.1, actor: 'boy', do: 'shake', amount: 0.8, dur: 0.45 },
    { at: 3.1, actor: 'ball', do: 'shake', amount: 0.4, dur: 0.45 },
    { at: 3.2, actor: 'ball', do: 'tilt', amount: 9, dur: 0.5 },
    { at: 3.3, actor: 'peng', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 3.75, actor: 'ball', do: 'moveTo', to: { x: 30, y: RG }, dur: 0.6, ease: 'in' },
    { at: 3.75, actor: 'ball', do: 'rotateTo', amount: -400, dur: 0.6, ease: 'in' },
    { at: 4.0, actor: 'boy', do: 'squash', amount: 0.75, dur: 0.7 },
    { at: 4.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: 4.0, actor: 'peng', do: 'bounce', amount: 2, times: 3, dur: 0.8 },
    { at: 4.0, actor: 'peng', do: 'tilt', amount: -15, dur: 0.7 },
    // 爬起來，肚子餓，啊嗚咬一口
    { at: 4.9, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 5.1, actor: 'boy', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: 5.3, actor: 'boy', do: 'moveTo', to: { x: 45, y: G }, dur: 0.25, ease: 'in', anticipate: 3 },
    { at: 5.55, actor: 'ball', do: 'squash', amount: 0.15, dur: 0.2 },
    // 停一拍……全是雪！凍成藍色、抖
    { at: 6.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 6.0, actor: 'boy', do: 'tint', filter: 'hue-rotate(180deg) saturate(.6) brightness(1.15)' },
    { at: 6.05, actor: 'boy', do: 'shake', amount: 1, dur: 0.6 },
    // ④ 大雪球裂開，真正的小飯糰彈出來，落到他手上
    { at: 6.6, actor: 'ball', do: 'vanish', dur: 0.12 },
    { at: 6.6, actor: 'rice', do: 'moveTo', to: { x: 30, y: 50 }, dur: 0.01 },
    { at: 6.65, actor: 'rice', do: 'pop', dur: 0.2 },
    { at: 6.7, actor: 'rice', do: 'moveTo', to: UP, arc: 14, dur: 0.5, ease: 'out' },
    { at: 6.7, actor: 'rice', do: 'spin', times: 2, dur: 0.5 },
    { at: 6.75, actor: 'boy', do: 'moveTo', to: { x: 52, y: G }, dur: 0.35 },
    { at: 6.9, actor: 'boy', do: 'tint', filter: '' },
    { at: 7.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    // 企鵝把帽子丟過來，戴在飯糰上
    { at: 6.9, actor: 'peng', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.0, actor: 'cap', do: 'moveTo', to: { x: 128, y: 60 }, dur: 0.01 },
    { at: 7.02, actor: 'cap', do: 'pop', dur: 0.15 },
    { at: 7.05, actor: 'cap', do: 'moveTo', to: { x: UP.x, y: UP.y - 8 }, arc: 14, dur: 0.45, ease: 'out' },
    { at: 7.05, actor: 'cap', do: 'spin', times: 2, dur: 0.45 },
    // ⑤ 亮相：舉高高
    { at: 7.5, actor: 'rice', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    { at: 7.5, actor: 'cap', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    { at: 7.5, actor: 'cap', do: 'moveTo', to: { x: UP.x, y: UP.y - 13 }, dur: 0.3, ease: 'back' },
    { at: 7.3, actor: 'boy', do: 'scaleTo', amount: 1.7, dur: 0.35, ease: 'back' },
    { at: 7.3, actor: 'peng', do: 'moveTo', to: { x: 92, y: 77 - 0.42 * P }, dur: 0.6 },
    { at: 7.55, actor: 'boy', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.55, actor: 'rice', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.55, actor: 'cap', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.3, actor: 'peng', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  fx: [
    { at: 0.8, kind: 'puff', actor: 'boy', dur: 0.4 },
    { at: 1.1, kind: 'bubble', actor: 'boy', emoji: '🍙', dur: 0.6 },
    { at: 1.5, kind: 'pop', actor: 'boy', emoji: '💡', dur: 0.5 },
    { at: 2.0, kind: 'puff', actor: 'ball', n: 6, dur: 0.6 },
    { at: 2.6, kind: 'puff', actor: 'ball', n: 8, dur: 0.6 },
    { at: 2.4, kind: 'pop', actor: 'peng', emoji: '❓', dur: 0.6 },
    { at: 3.15, kind: 'sweat', actor: 'boy' },
    { at: 4.0, kind: 'burst', actor: 'boy', emoji: '❄️', n: 8, dur: 0.6 },
    { at: 4.05, kind: 'pop', actor: 'peng', emoji: '😆', dur: 0.8 },
    { at: 4.2, kind: 'dizzy', actor: 'boy', dur: 0.8 },
    { at: 5.0, kind: 'pop', actor: 'boy', emoji: '😋', dx: 8, dur: 0.5 },
    { at: 6.0, kind: 'pop', actor: 'boy', emoji: '🥶', dx: 8, dur: 0.6 },
    { at: 6.6, kind: 'fountain', actor: 'ball', emoji: '❄️', n: 12, dur: 1.0 },
    { at: 6.6, kind: 'puff', actor: 'ball', n: 10, dur: 0.6 },
    { at: 7.5, kind: 'burst', actor: 'rice', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.1, kind: 'burst', actor: 'rice', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 8.3, kind: 'pop', actor: 'peng', emoji: '👏', dur: 0.8 },
  ],
  camera: [
    { at: 4.0, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 5.55, dur: 0.4, do: 'punch', amount: 0.15, to: { x: 40, y: 58 } },
    { at: 6.6, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: 64, y: 50 } },
  ],
  lights: [
    { at: 6.0, dur: 0.2, level: 0.25 },
    { at: 6.6, dur: 0.05, level: -0.35 },
    { at: 6.65, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.5, sfx: 'blip' },
    { at: 1.9, sfx: 'slide' },
    { at: 3.1, sfx: 'rumble' },
    { at: 4.0, sfx: 'bonk' },
    { at: 5.55, sfx: 'gulp' },
    { at: 6.05, sfx: 'hic' },
    { at: 6.6, sfx: 'crack' },
    { at: 6.7, sfx: 'boing' },
    { at: 7.1, sfx: 'whoosh' },
    { at: 7.55, say: '飯糰男孩' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
