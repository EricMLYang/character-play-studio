import type { Clip } from '../clip'
import { ride } from '../helpers'

// 楊（楊捷睿賽車手 第一集：練習）：楊捷睿在楊樹下的小賽車裡睡著了，鬧鐘一響開始練車——第一次發動「噗」熄火，
// 第二次催太猛「碰」撞上楊樹，車子彈回去，他自己飛進樹上卡住。樹葉變成「木」、太陽變成「日」、排氣管的煙拼成右下，「楊」站好了。
// 車子自己開回來接他，他從樹上掉進駕駛座，想著比賽「咻」地衝出畫面（接第二集）。楊、楊、楊樹
const clip: Clip = {
  char: '楊',
  meta: { theme: '楊捷睿賽車手①練習', cast: '楊捷睿＋賽車＋楊樹＋太陽', gags: ['發動熄火', '撞樹人飛進樹上', '車子自己回來接他'] },
  duration: 10,
  bg: { top: '#9FD8FF', bottom: '#E6F6FF', floor: '#9CD67E', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 20, y: 15, size: 14, hidden: true, float: true },
    { id: 'tree', emoji: '🌳', x: 140, y: 62, size: 36, hidden: true },
    // 楊捷睿本人：public/hero/yang/（npm run hero），坐在駕駛座用 drive、撞飛後 dizzy。畫在車子前面（陣列在前），車身會遮住腳，看起來才像坐在車裡
    { id: 'boy', emoji: 'hero:yang/drive', x: 26, y: 69, size: 13, hidden: true },
    { id: 'car', emoji: '🏎️', x: 26, y: 70, size: 19, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'pop' },
    { at: 0, actor: 'tree', do: 'pop' },
    ...ride([
      { at: 0.1, actor: 'car', do: 'pop' },
      // 鬧鐘響，跳起來
      { at: 1.0, actor: 'car', do: 'hop', amount: 6, dur: 0.3 },
      // 第一次發動：抖一抖——噗，熄火
      { at: 1.6, actor: 'car', do: 'shake', amount: 1, dur: 0.5 },
      { at: 2.1, actor: 'car', do: 'squash', amount: 0.25, dur: 0.3 },
      // 第二次催太猛，衝出去
      { at: 2.9, actor: 'car', do: 'shake', amount: 2, dur: 0.4 },
      // 先往後縮一下再衝出去（預備動作），用 in 緩動像真的在加速
      { at: 3.3, actor: 'car', do: 'moveTo', to: { x: 124, y: 70 }, dur: 0.3, anticipate: 3, ease: 'in' },
    ], 'boy', -1, 19),
    // 撞上楊樹：車子彈回去，人飛進樹上卡住
    { at: 3.55, actor: 'tree', do: 'shake', amount: 2, dur: 0.6 },
    { at: 3.55, actor: 'boy', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: 3.55, actor: 'boy', do: 'moveTo', to: { x: 136, y: 42 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 3.9, actor: 'boy', do: 'shake', amount: 1, dur: 0.4 },
    { at: 3.7, actor: 'car', do: 'moveTo', to: { x: 26, y: 70 }, dur: 0.6, ease: 'out' },
    { at: 3.7, actor: 'car', do: 'hop', amount: 5, dur: 0.4 },
    { at: 4.3, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    // 楊樹
    { at: 7.2, actor: 'tree', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 7.2, actor: 'boy', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 車子自己開過來接他，他從樹上掉進駕駛座
    { at: 8.0, actor: 'car', do: 'moveTo', to: { x: 134, y: 70 }, dur: 0.5, ease: 'back' },
    { at: 8.6, actor: 'boy', do: 'swap', emoji: 'hero:yang/drive' },
    { at: 8.6, actor: 'boy', do: 'moveTo', to: { x: 134, y: 69 }, dur: 0.3, ease: 'bounce' },
    { at: 8.9, actor: 'car', do: 'squash', amount: 0.25, dur: 0.25 },
    // 出發去比賽！
    { at: 9.15, actor: 'car', do: 'moveTo', to: { x: 195, y: 70 }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 9.15, actor: 'boy', do: 'moveTo', to: { x: 195, y: 69 }, dur: 0.35, anticipate: 3, ease: 'in' },
  ],
  builds: [
    // 撞下來的樹葉 → 木；太陽 → 日；排氣管的煙 → 右下那幾筆
    { at: 4.4, dur: 0.6, strokes: [0, 1, 2, 3], from: 'tree', style: 'drop', color: '#2F9E44' },
    { at: 5.0, dur: 0.5, strokes: [4, 5, 6, 7], from: 'sun', color: '#FF9F1C' },
    { at: 5.5, dur: 0.6, strokes: [8, 9, 10, 11, 12], from: 'car', color: '#E03131' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'boy', dur: 0.8 },
    { at: 1.0, kind: 'pop', actor: 'boy', emoji: '⏰', dur: 0.6 },
    { at: 1.6, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 2.2, kind: 'pop', actor: 'car', emoji: '💨', dur: 0.5 },
    { at: 2.5, kind: 'sweat', actor: 'boy' },
    { at: 2.9, kind: 'burst', actor: 'car', emoji: '🔥', n: 4, dur: 0.4 },
    { at: 3.55, kind: 'burst', x: 128, y: 58, emoji: '💥', n: 1, dur: 0.4 },
    { at: 3.6, kind: 'burst', x: 140, y: 42, emoji: '🍃', n: 6, dur: 0.6 },
    { at: 4.3, kind: 'dizzy', actor: 'car', dur: 0.9 },
    { at: 7.2, kind: 'burst', x: 140, y: 36, emoji: '🍃', n: 5, dur: 0.6 },
    { at: 7.4, kind: 'pop', actor: 'boy', emoji: '😅', dur: 0.6 },
    { at: 8.1, kind: 'pop', actor: 'car', emoji: '📢', dur: 0.4 },
    { at: 8.75, kind: 'bubble', actor: 'boy', emoji: '🏁', dx: -12, dur: 0.4 },
  ],
  camera: [
    // 催油門時鏡頭慢慢靠近賽車，衝出去的瞬間跟拍，撞樹後退回全景讓筆畫拼字
    { at: 2.9, dur: 0.4, do: 'zoom', amount: 1.3, actor: 'car' },
    { at: 3.3, dur: 0.25, do: 'follow', actor: 'car', amount: 1.3 },
    { at: 3.55, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 3.7, dur: 0.6, do: 'zoom', amount: 1 },
    { at: 7.1, dur: 0.8, do: 'punch', amount: 0.12, to: { x: 140, y: 50 } },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 1.2, say: '楊' },
    { at: 1.6, sfx: 'rumble' },
    { at: 2.1, sfx: 'deflate' },
    { at: 2.9, sfx: 'rumble' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.55, sfx: 'bonk' },
    { at: 4.3, sfx: 'boing' },
    { at: 6.2, say: '楊' },
    { at: 7.25, say: '楊樹' },
    { at: 8.1, sfx: 'blip' },
    { at: 8.9, sfx: 'plop' },
    { at: 9.15, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
