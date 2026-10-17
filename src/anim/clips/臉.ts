import type { Clip } from '../clip'

// 臉：調皮小老鼠想在打瞌睡的拉布拉多警長臉上畫鬍子，踮腳爬上他的膝蓋，筆尖只差一點點——警長醒了，臉對臉一起大叫，
// 「咚」地撞頭，紅顏料潑到牆上變成「臉」。老鼠鼓起臉頰；最後那桶顏料掉下來，倒扣在警長頭上。臉、臉、臉頰
const clip: Clip = {
  char: '臉',
  meta: { theme: '警長辦公室惡作劇', cast: '小老鼠＋拉布拉多警長＋紅顏料', gags: ['踮腳偷畫鬍子差一點點', '臉對臉一起大叫撞頭', '鼓臉頰', '回馬槍顏料桶扣在頭上'] },
  duration: 10,
  bg: { top: '#FFE9DC', bottom: '#FFF4EC', floor: '#D9C2A8', scenery: 'room' },
  actors: [
    { id: 'cheese', emoji: '🧀', x: 10, y: 70, size: 13 },
    { id: 'chair', emoji: '🪑', x: 130, y: 68, size: 18 },
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: 130, y: 63, size: 16 },
    { id: 'mouse', emoji: 'hero:mouse/sneak', x: 10, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'bucket', emoji: '🪣', x: 32, y: 71, size: 6, hidden: true, tint: 'hue-rotate(-30deg) saturate(3)' },
  ],
  moves: [
    // 從起司後面探出頭，拿起刷子和紅顏料
    { at: 0.3, actor: 'mouse', do: 'enter', from: { x: 10, y: 71.5 }, dur: 0.45 },
    { at: 0.3, actor: 'mouse', do: 'moveTo', to: { x: 24, y: 71.5 }, dur: 0.45 },
    { at: 0.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 1.0, actor: 'bucket', do: 'pop', dur: 0.3 },
    { at: 1.3, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    // 踮腳走過去，一步一吱
    { at: 1.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 1.8, actor: 'mouse', do: 'moveTo', to: { x: 108, y: 71.5 }, dur: 1.3, ease: 'linear' },
    { at: 1.8, actor: 'mouse', do: 'bounce', amount: 2.5, times: 5, dur: 1.3 },
    { at: 1.8, actor: 'bucket', do: 'moveTo', to: { x: 116, y: 71 }, dur: 1.3, ease: 'linear' },
    { at: 1.8, actor: 'bucket', do: 'bounce', amount: 2.5, times: 5, dur: 1.3 },
    // 爬上膝蓋，刷子離鼻子只差一點點
    { at: 3.15, actor: 'mouse', do: 'moveTo', to: { x: 120, y: 62 }, arc: 6, dur: 0.35 },
    { at: 3.15, actor: 'bucket', do: 'moveTo', to: { x: 126, y: 62 }, arc: 6, dur: 0.35 },
    { at: 3.6, actor: 'mouse', do: 'shake', amount: 0.4, dur: 0.5 },
    // 警長醒了！臉對臉一起大叫
    { at: 4.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 4.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 4.0, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.0, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    // 咚！撞頭；顏料桶往上一甩
    { at: 4.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 4.35, actor: 'sheriff', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.35, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.35, actor: 'bucket', do: 'moveTo', to: { x: 82, y: 8 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 4.35, actor: 'bucket', do: 'spin', times: 1, dur: 0.4 },
    { at: 4.8, actor: 'bucket', do: 'vanish', dur: 0.15 },
    // 兩個暈頭轉向地分開
    { at: 4.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 4.6, actor: 'mouse', do: 'moveTo', to: { x: 26, y: 71.5 }, arc: 22, dur: 0.45, ease: 'out' },
    { at: 4.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.6, actor: 'sheriff', do: 'moveTo', to: { x: 142, y: 70.3 }, dur: 0.4, ease: 'out' },
    { at: 4.6, actor: 'chair', do: 'moveTo', to: { x: 126, y: 68 }, dur: 0.3, ease: 'out' },
    { at: 5.05, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
    // 鼓起臉頰
    { at: 6.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 6.85, actor: 'mouse', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'elastic' },
    { at: 7.7, actor: 'mouse', do: 'scaleTo', amount: 1 / 1.3, dur: 0.2 },
    { at: 7.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.0, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 0.6 },
    // 回馬槍：那桶顏料從天上掉下來，倒扣在警長頭上
    { at: 8.3, actor: 'bucket', do: 'moveTo', to: { x: 142, y: 53 }, dur: 0.01 },
    { at: 8.36, actor: 'bucket', do: 'scaleTo', amount: 2, dur: 0.01 },
    { at: 8.3, actor: 'bucket', do: 'rotateTo', amount: 180, dur: 0.01 },
    { at: 8.35, actor: 'bucket', do: 'drop', dur: 0.5 },
    { at: 8.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 8.6, actor: 'sheriff', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 9.0, actor: 'mouse', do: 'bounce', amount: 3, times: 3, dur: 0.6 },
  ],
  builds: [
    // 紅顏料潑到牆上：左邊的「月」，右邊的「僉」
    { at: 4.8, dur: 0.4, strokes: [0, 1, 2, 3], from: 'bucket', color: '#E8384F' },
    { at: 5.15, dur: 0.65, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], from: 'bucket', color: '#E8384F' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'sheriff', dur: 3.9 },
    { at: 0.9, kind: 'pop', actor: 'mouse', emoji: '😏', dur: 0.5 },
    { at: 1.3, kind: 'bubble', actor: 'mouse', emoji: '🥸', dur: 0.6, dx: 6 },
    { at: 3.5, kind: 'sweat', actor: 'mouse' },
    { at: 4.0, kind: 'pop', actor: 'sheriff', emoji: '❗', dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.4 },
    { at: 4.35, kind: 'burst', x: 125, y: 56, n: 1, dur: 0.35 },
    { at: 4.8, kind: 'burst', actor: 'bucket', emoji: '🔴', n: 6, dur: 0.5, dy: 10 },
    { at: 5.1, kind: 'dizzy', actor: 'mouse', dur: 1.2 },
    { at: 5.0, kind: 'dizzy', actor: 'sheriff', dur: 1.2 },
    { at: 6.9, kind: 'pop', actor: 'mouse', emoji: '😊', dur: 0.7 },
    { at: 8.85, kind: 'burst', actor: 'sheriff', emoji: '🔴', n: 5, dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    // 唸「臉」時框住警長的大臉；爬上膝蓋時慢慢推近，醒來退回全景
    { at: 1.2, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 130, y: 58 } },
    { at: 3.3, dur: 0.6, do: 'zoom', amount: 1.4, to: { x: 124, y: 60 } },
    { at: 4.0, dur: 0.2, do: 'shake', amount: 1 },
    { at: 4.35, dur: 0.3, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.25, say: '臉' },
    { at: 1.9, sfx: 'tap' },
    { at: 2.35, sfx: 'tap' },
    { at: 2.8, sfx: 'tap' },
    { at: 4.0, sfx: 'blip' },
    { at: 4.35, sfx: 'bonk' },
    { at: 4.8, sfx: 'splash' },
    { at: 5.9, say: '臉' },
    { at: 6.9, say: '臉頰' },
    { at: 7.0, sfx: 'boing' },
    { at: 8.8, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
