import type { Clip } from '../clip'

// 弟：大怪獸踮腳偷架上的大餅乾，每一步都吱吱叫；睡在長條堆上的發條鯊魚突然醒來，一口咬住怪獸的角，兩個鼻子對鼻子尖叫，
// 慌亂中撞成一團，長條飛起來排成「弟」。餅乾不見了——架子後面蹦出一隻迷你小怪獸弟弟抱著餅乾，最後一大口咬掉一半。弟、弟、弟弟
const clip: Clip = {
  char: '弟',
  meta: { theme: '玩具房偷餅乾', cast: '大怪獸＋發條鯊魚＋迷你怪獸弟弟', gags: ['踮腳偷偷走每步都吱', '咬錯東西對看尖叫', '小弟弟其實拿走了'] },
  duration: 10,
  bg: { top: '#DCEBFF', bottom: '#F3F8FF', floor: '#F2DFC0', scenery: 'room' },
  actors: [
    { id: 'little', emoji: 'hero:monster/happy', x: 136, y: 73.2, size: 9, hidden: true },
    { id: 'shelf', emoji: '🗄️', x: 149, y: 71, size: 14 },
    { id: 'cookie', emoji: '🍪', x: 149, y: 60, size: 8 },
    { id: 'cookie2', emoji: '🍪', x: 133, y: 72, size: 6, hidden: true },
    { id: 'bar1', emoji: '🟧', x: 128, y: 71, size: 7 },
    { id: 'bar2', emoji: '🟧', x: 128, y: 64.5, size: 7 },
    { id: 'bar3', emoji: '🟧', x: 128, y: 58, size: 7 },
    { id: 'shark', emoji: 'hero:shark/idle', x: 128, y: 49, size: 11 },
    { id: 'monster', emoji: 'hero:monster/idle', x: 22, y: 70.7, size: 15, flip: true, hidden: true },
  ],
  moves: [
    // 從左邊探頭進來，眼睛盯著餅乾
    { at: 0, actor: 'monster', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.5, ease: 'out' },
    { at: 0.9, actor: 'monster', do: 'swap', emoji: 'hero:monster/oops' },
    // 誇張的踮腳：一步、兩步、三步，每步都吱一聲
    { at: 1.2, actor: 'monster', do: 'moveTo', to: { x: 50, y: 70.7 }, arc: 5, dur: 0.4 },
    { at: 1.7, actor: 'monster', do: 'moveTo', to: { x: 80, y: 70.7 }, arc: 5, dur: 0.4 },
    { at: 2.2, actor: 'monster', do: 'moveTo', to: { x: 108, y: 70.7 }, arc: 5, dur: 0.4 },
    { at: 2.65, actor: 'monster', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 2.65, actor: 'monster', do: 'tilt', amount: 12, dur: 0.4 },
    // 鯊魚眼睛一睜，一口咬住怪獸的角
    { at: 2.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 2.9, actor: 'shark', do: 'moveTo', to: { x: 117, y: 55 }, dur: 0.15, ease: 'out' },
    { at: 3.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 3.1, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 3.1, actor: 'monster', do: 'squash', amount: -0.2, dur: 0.3 },
    // 慌亂：怪獸原地倒退跑，鯊魚原地打轉，撞成一團
    { at: 3.6, actor: 'shark', do: 'moveTo', to: { x: 124, y: 72 }, dur: 0.25, ease: 'in' },
    { at: 3.6, actor: 'monster', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 3.85, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 3.85, actor: 'shark', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.25, actor: 'monster', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.25, actor: 'bar1', do: 'moveTo', to: { x: 70, y: 22 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 4.25, actor: 'bar2', do: 'moveTo', to: { x: 86, y: 16 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 4.25, actor: 'bar3', do: 'moveTo', to: { x: 100, y: 24 }, arc: 10, dur: 0.35, ease: 'out' },
    // 撞開：鯊魚滾到左邊，怪獸彈回右邊
    { at: 4.3, actor: 'shark', do: 'moveTo', to: { x: 24, y: 72.4 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 4.3, actor: 'shark', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.3, actor: 'monster', do: 'moveTo', to: { x: 120, y: 70.7 }, dur: 0.3, ease: 'out' },
    { at: 4.6, actor: 'monster', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 4.6, actor: 'bar1', do: 'vanish', dur: 0.15 },
    { at: 4.95, actor: 'bar2', do: 'vanish', dur: 0.15 },
    { at: 5.4, actor: 'bar3', do: 'vanish', dur: 0.15 },
    { at: 5.0, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 餅乾不見了——小弟弟抱著餅乾從架子後面蹦出來
    { at: 6.1, actor: 'cookie', do: 'vanish', dur: 0.15 },
    { at: 6.15, actor: 'little', do: 'enter', from: { x: 149, y: 73.2 }, dur: 0.3, ease: 'back' },
    { at: 6.15, actor: 'cookie2', do: 'enter', from: { x: 146, y: 72 }, dur: 0.3, ease: 'back' },
    { at: 6.5, actor: 'little', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 6.5, actor: 'cookie2', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 6.4, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 7.1, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 7.4, actor: 'monster', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 7.5, actor: 'little', do: 'squash', amount: 0.15, dur: 0.25 },
    // 鯊魚在角落慢慢轉
    { at: 6.6, actor: 'shark', do: 'spin', times: 2, dur: 2.2 },
    // 回馬槍：小弟弟一口咬掉大半塊
    { at: 8.3, actor: 'little', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 8.4, actor: 'cookie2', do: 'scaleTo', amount: 0.45, dur: 0.15 },
    { at: 8.6, actor: 'monster', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 9.2, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
  ],
  builds: [
    // 長條在地上彈一彈，一根一根排成弟
    { at: 4.6, dur: 0.35, strokes: [0, 1], from: 'bar1', color: '#F2541B' },
    { at: 4.95, dur: 0.45, strokes: [2, 3, 4], from: 'bar2', color: '#F76707' },
    { at: 5.4, dur: 0.4, strokes: [5, 6], from: 'bar3', color: '#F2541B' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'shark', emoji: '🫧', dur: 2.8 },
    { at: 0.5, kind: 'pop', actor: 'monster', emoji: '✨', dur: 0.4 },
    { at: 0.6, kind: 'bubble', actor: 'monster', emoji: '🍪', dur: 0.6 },
    { at: 1.35, kind: 'pop', actor: 'shark', emoji: '❗', dur: 0.2, dx: 6 },
    { at: 2.3, kind: 'sweat', actor: 'monster' },
    { at: 3.1, kind: 'pop', actor: 'monster', emoji: '😱', dur: 0.6 },
    { at: 3.1, kind: 'pop', actor: 'shark', emoji: '😱', dur: 0.6, dx: 6 },
    { at: 4.25, kind: 'burst', actor: 'monster', n: 1, dur: 0.4 },
    { at: 4.7, kind: 'dizzy', actor: 'monster', dur: 1.4 },
    { at: 6.3, kind: 'pop', actor: 'little', emoji: '😁', dur: 0.5, dx: -3 },
    { at: 7.5, kind: 'pop', actor: 'little', emoji: '💜', dur: 0.5, dx: -3 },
    { at: 7.0, kind: 'dizzy', actor: 'shark', dur: 2.0 },
    { at: 8.6, kind: 'sweat', actor: 'monster' },
  ],
  camera: [
    { at: 3.0, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 116, y: 58 } },
    { at: 4.25, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.25, sfx: 'blip' },
    { at: 1.75, sfx: 'blip' },
    { at: 1.8, say: '弟' },
    { at: 2.25, sfx: 'blip' },
    { at: 2.95, sfx: 'gulp' },
    { at: 4.25, sfx: 'bonk' },
    { at: 5.85, say: '弟' },
    { at: 6.2, sfx: 'boing' },
    { at: 6.5, say: '弟弟' },
    { at: 8.4, sfx: 'gulp' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
