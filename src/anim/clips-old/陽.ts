import type { Clip } from '../clip'

// 陽：大怪獸看到小山丘上的玩具太陽，抓住太陽垂下來的金色光帶；發條鯊魚衝進來咬住另一頭——拔河！拉來拉去、腳底打滑，
// 「啵」一聲光帶鬆開，兩個都往後飛。怪獸撞扁山丘變成「阝」，太陽和彈回去的光帶落成「昜」。新的太陽升起來；鯊魚跳起來想咬太陽，咬空摔個四腳朝天。陽、陽、太陽
const clip: Clip = {
  char: '陽',
  meta: { theme: '太陽光帶拔河', cast: '大怪獸＋發條鯊魚＋玩具太陽＋山丘', gags: ['拔河拉來拉去', '鬆手兩個都往後飛', '撞扁山丘變部首', '回馬槍鯊魚咬太陽咬空'] },
  duration: 10,
  bg: { top: '#DCEEFF', bottom: '#F3F9FF', floor: '#EBD7A8', scenery: 'hills' },
  actors: [
    { id: 'hill', emoji: '⛰️', x: 14, y: 67, size: 20 },
    { id: 'sun', emoji: '☀️', x: 14, y: 50, size: 12, float: true },
    { id: 'monster', emoji: 'hero:monster/idle', x: -15, y: 70.7, size: 15, flip: true },
    { id: 'shark', emoji: 'hero:shark/idle', x: 190, y: 71.1, size: 14, hidden: true },
    { id: 'sun2', emoji: '🌞', x: 138, y: 18, size: 14, hidden: true, float: true },
  ],
  moves: [
    // 怪獸搖搖擺擺走進來，回頭看到太陽
    { at: 0, actor: 'monster', do: 'moveTo', to: { x: 44, y: 70.7 }, dur: 0.8 },
    { at: 0, actor: 'monster', do: 'bounce', amount: 2, times: 4, dur: 0.8 },
    { at: 0.9, actor: 'monster', do: 'flip' },
    { at: 0.9, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 1.3, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 1.4, actor: 'monster', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.5, actor: 'sun', do: 'flash', dur: 0.6 },
    // 鯊魚衝進來，咬住光帶另一頭
    { at: 2.0, actor: 'monster', do: 'flip' },
    { at: 2.0, actor: 'shark', do: 'enter', from: { x: 190, y: 71.1 }, dur: 0.0 },
    { at: 2.0, actor: 'shark', do: 'moveTo', to: { x: 124, y: 71.1 }, dur: 0.5, ease: 'out' },
    { at: 2.5, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    // 拔河：拉過來、拉過去
    { at: 2.7, actor: 'monster', do: 'moveTo', to: { x: 36, y: 70.7 }, dur: 0.3 },
    { at: 2.7, actor: 'monster', do: 'rotateTo', amount: -15, dur: 0.3 },
    { at: 2.7, actor: 'shark', do: 'moveTo', to: { x: 116, y: 71.1 }, dur: 0.3 },
    { at: 3.0, actor: 'monster', do: 'moveTo', to: { x: 46, y: 70.7 }, dur: 0.3 },
    { at: 3.0, actor: 'shark', do: 'moveTo', to: { x: 128, y: 71.1 }, dur: 0.3 },
    { at: 3.0, actor: 'shark', do: 'rotateTo', amount: 15, dur: 0.3 },
    { at: 3.3, actor: 'monster', do: 'moveTo', to: { x: 40, y: 70.7 }, dur: 0.3 },
    { at: 3.3, actor: 'shark', do: 'moveTo', to: { x: 122, y: 71.1 }, dur: 0.3 },
    { at: 3.4, actor: 'monster', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 3.4, actor: 'shark', do: 'shake', amount: 0.8, dur: 0.5 },
    // 啵！光帶鬆開，兩個都往後飛
    { at: 3.9, actor: 'monster', do: 'rotateTo', amount: 15, dur: 0.1 },
    { at: 3.9, actor: 'shark', do: 'rotateTo', amount: -15, dur: 0.1 },
    { at: 3.9, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 3.9, actor: 'monster', do: 'moveTo', to: { x: 22, y: 70.7 }, dur: 0.25, ease: 'out' },
    { at: 3.9, actor: 'shark', do: 'moveTo', to: { x: 144, y: 71.1 }, dur: 0.3, ease: 'out' },
    { at: 4.15, actor: 'hill', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.15, actor: 'monster', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.2, actor: 'sun', do: 'moveTo', to: { x: 96, y: 4 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 4.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 4.3, actor: 'shark', do: 'spin', times: 2, dur: 0.8 },
    { at: 4.35, actor: 'hill', do: 'vanish', dur: 0.2 },
    { at: 4.8, actor: 'sun', do: 'vanish', dur: 0.15 },
    { at: 4.5, actor: 'monster', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 5.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 太陽：新的太陽升起來，怪獸張開雙手
    { at: 6.5, actor: 'sun2', do: 'enter', from: { x: 138, y: 40 }, dur: 0.5, ease: 'back' },
    { at: 6.6, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 6.7, actor: 'monster', do: 'scaleTo', amount: 1.15, dur: 0.4, ease: 'elastic' },
    { at: 7.4, actor: 'monster', do: 'bounce', amount: 2, times: 3, dur: 0.8 },
    { at: 7.4, actor: 'sun2', do: 'bounce', amount: 1.5, times: 2, dur: 0.8 },
    // 回馬槍：鯊魚跳起來咬太陽——咬空，摔個四腳朝天
    { at: 8.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 8.1, actor: 'shark', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.35, actor: 'shark', do: 'hop', amount: 28, dur: 0.6 },
    { at: 8.5, actor: 'sun2', do: 'moveTo', to: { x: 128, y: 14 }, dur: 0.2, ease: 'out' },
    { at: 8.95, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 8.95, actor: 'shark', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 8.95, actor: 'shark', do: 'moveTo', to: { x: 144, y: 60 }, dur: 0.2 },
  ],
  builds: [
    // 撞扁的山丘 → 阝；太陽 → 日；彈回去的光帶 → 一橫和下面的「勿」
    { at: 4.2, dur: 0.35, strokes: [0, 1], from: 'hill', color: '#E8590C' },
    { at: 4.5, dur: 0.4, strokes: [2, 3, 4, 5], from: 'sun', color: '#F08C00' },
    { at: 4.9, dur: 0.25, strokes: [6], from: 'shark', color: '#E8590C' },
    { at: 5.1, dur: 0.4, strokes: [7, 8, 9, 10], from: 'shark', color: '#E8590C' },
  ],
  glyph: [{ at: 5.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'monster', emoji: '😍', dur: 0.5 },
    // 金色光帶：太陽垂到怪獸手上，再拉到鯊魚嘴裡
    { at: 1.5, dur: 2.4, kind: 'line', actor: 'sun', target: 'monster', color: '#FCC419', width: 1.6 },
    { at: 2.5, dur: 1.4, kind: 'line', actor: 'monster', target: 'shark', color: '#FCC419', width: 1.6 },
    { at: 2.35, kind: 'zzz', actor: 'shark', emoji: '⚙️', dur: 0.6 },
    { at: 3.3, kind: 'sweat', actor: 'monster' },
    { at: 3.3, kind: 'sweat', actor: 'shark' },
    { at: 3.9, kind: 'burst', x: 80, y: 60, emoji: '✨', n: 6, dur: 0.5 },
    { at: 4.15, kind: 'puff', actor: 'monster', dur: 0.5 },
    { at: 4.5, kind: 'dizzy', actor: 'monster', dur: 1.2 },
    { at: 6.6, kind: 'burst', actor: 'sun2', emoji: '✨', n: 5, dur: 0.6 },
    { at: 8.7, kind: 'pop', actor: 'sun2', emoji: '😆', dur: 0.6, dx: -10, dy: 8 },
    { at: 9.15, kind: 'dizzy', actor: 'shark', dur: 0.8 },
  ],
  camera: [
    // 拔河時慢慢推近，鬆手退回全景並震一下
    { at: 2.7, dur: 0.8, do: 'zoom', amount: 1.25, to: { x: 80, y: 58 } },
    { at: 3.9, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.15, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.5, say: '陽' },
    { at: 2.0, sfx: 'tap' },
    { at: 2.25, sfx: 'tap' },
    { at: 2.7, sfx: 'slide' },
    { at: 3.3, sfx: 'slide' },
    { at: 3.9, sfx: 'boing' },
    { at: 4.15, sfx: 'bonk' },
    { at: 5.6, say: '陽' },
    { at: 6.75, say: '太陽' },
    { at: 8.35, sfx: 'whoosh' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
