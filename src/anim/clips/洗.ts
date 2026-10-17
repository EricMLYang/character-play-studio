import type { Clip } from '../clip'

// 洗：布忍者躲在比他小一半的茶杯後面（全身都看得到），助跑衝向架上的大肥皂；煙霧彈提早爆開，他矇著眼衝出畫面又滑回來，
// 再衝一次「碰」地撞扁在磁磚牆上，震落的水珠變成三點水、肥皂和刷子疊成「先」。消防車開進來，水管自己噴水，他開心地洗手。洗、洗、洗手
const clip: Clip = {
  char: '洗',
  meta: { theme: '浴室衝肥皂', cast: '布忍者＋大肥皂＋刷子＋消防車', gags: ['煙霧彈提早爆開矇眼亂衝', '撞扁在磁磚牆上', '水管自己噴水'] },
  duration: 10,
  bg: { top: '#C8F1EE', bottom: '#E8FBF8', floor: '#9ED9D3', scenery: 'room' },
  actors: [
    { id: 'shelf', emoji: '🟫', x: 140, y: 56, size: 12, float: true, tint: 'brightness(1.3) saturate(.6)' },
    { id: 'brush1', emoji: '🪥', x: 133, y: 46, size: 7, float: true },
    { id: 'soap', emoji: '🧼', x: 141, y: 45, size: 10, float: true },
    { id: 'brush2', emoji: '🪥', x: 149, y: 46, size: 7, float: true, flip: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 18, y: 71.5, size: 13, flip: true },
    { id: 'cup', emoji: '☕', x: 23, y: 72, size: 8 },
    { id: 'truck', emoji: '🚒', x: 150, y: 68, size: 18, hidden: true },
  ],
  moves: [
    // 指著肥皂，往後仰蓄力
    { at: 0.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 0.8, actor: 'ninja', do: 'moveTo', to: { x: 32, y: 71.5 }, dur: 0.35, arc: 4 },
    { at: 1.2, actor: 'ninja', do: 'squash', amount: -0.35, dur: 0.45 },
    { at: 1.2, actor: 'ninja', do: 'tilt', amount: -22, dur: 0.45 },
    // 衝！煙霧彈提早爆開，矇著眼直接衝出畫面
    { at: 1.65, actor: 'ninja', do: 'moveTo', to: { x: 175, y: 71.5 }, dur: 0.7, anticipate: 4, ease: 'in' },
    // 從畫面邊緣滑回來，圍巾蓋住眼睛
    { at: 2.55, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 2.55, actor: 'ninja', do: 'flip' },
    { at: 2.55, actor: 'ninja', do: 'moveTo', to: { x: 84, y: 71.5 }, dur: 0.6, ease: 'back' },
    { at: 3.2, actor: 'ninja', do: 'shake', amount: 1, dur: 0.3 },
    // 瞪著肥皂，蓄更大的力
    { at: 3.4, actor: 'ninja', do: 'flip' },
    { at: 3.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 3.45, actor: 'ninja', do: 'squash', amount: -0.45, dur: 0.5 },
    { at: 3.45, actor: 'ninja', do: 'tilt', amount: -32, dur: 0.5 },
    // 全速衝刺——碰！扁在牆上
    { at: 3.95, actor: 'ninja', do: 'moveTo', to: { x: 152, y: 71.5 }, dur: 0.35, anticipate: 4, ease: 'in' },
    { at: 4.3, actor: 'ninja', do: 'squash', amount: -0.5, dur: 0.45 },
    { at: 4.3, actor: 'shelf', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.3, actor: 'soap', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.3, actor: 'brush1', do: 'hop', amount: 5, dur: 0.3 },
    { at: 4.3, actor: 'brush2', do: 'hop', amount: 5, dur: 0.3 },
    // 肥皂和刷子彈下架子
    { at: 4.95, actor: 'soap', do: 'vanish', dur: 0.2 },
    { at: 5.2, actor: 'brush1', do: 'vanish', dur: 0.2 },
    { at: 5.35, actor: 'brush2', do: 'vanish', dur: 0.2 },
    // 從牆上剝下來，暈暈地坐下
    { at: 4.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.8, actor: 'ninja', do: 'moveTo', to: { x: 128, y: 71.5 }, dur: 0.4, ease: 'out' },
    // 消防車開進來，水管自己噴水
    { at: 6.2, actor: 'truck', do: 'enter', from: { x: 185, y: 68 }, dur: 0.5, ease: 'out' },
    { at: 6.7, actor: 'truck', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 7.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.4, actor: 'ninja', do: 'shake', amount: 1, dur: 0.6 },
    { at: 8.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    // 回馬槍：煙霧彈又晚一步爆開，他以為隱形了——水管照樣噴到他
    { at: 8.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.9, actor: 'truck', do: 'hop', amount: 2, dur: 0.3 },
    { at: 9.15, actor: 'ninja', do: 'squash', amount: 0.2, dur: 0.25 },
  ],
  builds: [
    // 震落的三顆水珠一顆接一顆掉下來：三點水
    { at: 4.45, dur: 0.6, strokes: [0, 1, 2], from: { x: 136, y: 52 }, color: '#1971C2' },
    // 肥皂和刷子疊成右邊的「先」
    { at: 5.0, dur: 0.85, strokes: [3, 4, 5, 6, 7, 8], from: 'soap', color: '#0B4F8A' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.5 },
    { at: 0.85, kind: 'bubble', actor: 'ninja', emoji: '🧼', dur: 0.8 },
    { at: 1.6, kind: 'puff', actor: 'ninja' },
    { at: 1.85, kind: 'burst', actor: 'ninja', emoji: '☁️', n: 7, dur: 0.6 },
    { at: 3.2, kind: 'pop', actor: 'ninja', emoji: '😠', dur: 0.6 },
    { at: 3.9, kind: 'puff', actor: 'ninja' },
    { at: 4.3, kind: 'burst', x: 150, y: 60, emoji: '💥', dur: 0.4 },
    { at: 5.0, kind: 'dizzy', actor: 'ninja', dur: 1.3 },
    // 水管噴出一道水弧
    { at: 6.75, dur: 1.0, kind: 'fountain', actor: 'truck', dx: -8, emoji: '💧', n: 7 },
    { at: 7.1, kind: 'burst', actor: 'ninja', emoji: '🫧', n: 6, dur: 0.8 },
    { at: 7.6, kind: 'burst', actor: 'ninja', emoji: '🫧', n: 5, dur: 0.7 },
    { at: 8.35, kind: 'burst', actor: 'ninja', emoji: '☁️', n: 6, dur: 0.6 },
    { at: 8.95, dur: 0.6, kind: 'fountain', actor: 'truck', dx: -8, emoji: '💧', n: 5 },
    { at: 9.2, kind: 'pop', actor: 'ninja', emoji: '🫧', dur: 0.6 },
  ],
  camera: [
    // 第二次衝刺跟拍，撞牆時退回全景再震
    { at: 3.95, dur: 0.2, do: 'follow', actor: 'ninja', amount: 1.3 },
    { at: 4.35, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.3, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  cues: [
    { at: 1.7, say: '洗' },
    { at: 1.85, sfx: 'poof' },
    { at: 2.55, sfx: 'slide' },
    { at: 3.95, sfx: 'whoosh' },
    { at: 4.3, sfx: 'bonk' },
    { at: 4.5, sfx: 'splash' },
    { at: 5.95, say: '洗' },
    { at: 6.75, sfx: 'splash' },
    { at: 7.1, say: '洗手' },
    { at: 8.35, sfx: 'poof' },
    { at: 9.2, sfx: 'bubble' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
