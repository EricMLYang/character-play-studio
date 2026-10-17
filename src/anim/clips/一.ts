import type { Clip } from '../clip'

// 一（機器人疊高塔）：玩具機器人想疊出全世界最高的塔，馬達太有力，每放一塊都「咚」得地板跳，塔越晃越厲害。
// 最後放上一顆小珠子——全場定格——整座塔像大樹一樣側倒「砰」地壓平成一條橫線「一」，機器人被埋在積木堆裡。
// 他探出頭舉起剩下的一個積木；回馬槍：得意往上一拋，馬達太猛，積木掉下來砸在自己頭上。一、一、一個
const clip: Clip = {
  char: '一',
  meta: { theme: '機器人疊高塔', cast: '玩具機器人＋積木＋小珠子', gags: ['馬達太猛越疊越晃', '放上小珠子整座塔側倒', '拋積木砸自己頭'] },
  duration: 10,
  bg: { top: '#FFF4D6', bottom: '#FFEBB8', floor: '#C3EBD7', scenery: 'room' },
  actors: [
    { id: 't1', emoji: '🧱', x: 80, y: 73.2, size: 9, hidden: true },
    { id: 't2', emoji: '🧱', x: 80, y: 65.2, size: 9, hidden: true },
    { id: 't3', emoji: '🧱', x: 80, y: 57.2, size: 9, hidden: true },
    { id: 't4', emoji: '🧱', x: 80, y: 49.2, size: 9, hidden: true },
    { id: 't5', emoji: '🧱', x: 80, y: 41.2, size: 9, hidden: true },
    { id: 'bead', emoji: '🔴', x: 80, y: 35, size: 5, hidden: true, float: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 60, y: 71, size: 14, hidden: true, flip: true },
    { id: 'h1', emoji: '🧱', x: 30, y: 73.2, size: 9, hidden: true },
    { id: 'h2', emoji: '🧱', x: 38, y: 73.2, size: 9, hidden: true },
    { id: 'h3', emoji: '🧱', x: 46, y: 73.2, size: 9, hidden: true },
    { id: 'h4', emoji: '🧱', x: 34, y: 66, size: 9, hidden: true },
    { id: 'h5', emoji: '🧱', x: 42, y: 66, size: 9, hidden: true },
    { id: 'one', emoji: '🧱', x: 40, y: 46, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'robot', do: 'enter', from: { x: -12, y: 71 }, dur: 0.6, ease: 'back' },
    { at: 0.7, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 0.7, actor: 'robot', do: 'hop', amount: 3, dur: 0.3 },
    // 咚！第一塊放太用力，地板都跳了
    { at: 1.0, actor: 't1', do: 'drop', dur: 0.35 },
    { at: 1.3, actor: 'robot', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.6, actor: 't2', do: 'drop', dur: 0.35 },
    { at: 1.9, actor: 't1', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 2.1, actor: 't3', do: 'drop', dur: 0.35 },
    { at: 2.4, actor: 't2', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 2.4, actor: 't3', do: 'shake', amount: 1.6, dur: 0.4 },
    // 搆不到，噴火飛上去疊
    { at: 2.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 2.4, actor: 'robot', do: 'moveTo', to: { x: 64, y: 48 }, dur: 0.4, ease: 'out' },
    { at: 2.6, actor: 't4', do: 'drop', dur: 0.35 },
    { at: 3.0, actor: 't5', do: 'drop', dur: 0.35 },
    // 越晃越大
    { at: 3.0, actor: 't3', do: 'shake', amount: 1.5, dur: 0.8 },
    { at: 3.0, actor: 't4', do: 'shake', amount: 2.2, dur: 0.8 },
    { at: 3.0, actor: 't5', do: 'shake', amount: 3, dur: 0.8 },
    { at: 3.0, actor: 'robot', do: 'tilt', amount: -20, dur: 0.8 },
    // 輕輕放上一顆小珠子……定格……
    { at: 3.4, actor: 'robot', do: 'moveTo', to: { x: 68, y: 33 }, dur: 0.35 },
    { at: 3.8, actor: 'bead', do: 'pop', dur: 0.25 },
    { at: 3.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    // 整座塔側倒，砰！
    { at: 4.3, actor: 't5', do: 'moveTo', to: { x: 116, y: 73.2 }, dur: 0.35, ease: 'in' },
    { at: 4.3, actor: 't4', do: 'moveTo', to: { x: 108, y: 73.2 }, dur: 0.35, ease: 'in' },
    { at: 4.3, actor: 't3', do: 'moveTo', to: { x: 100, y: 73.2 }, dur: 0.35, ease: 'in' },
    { at: 4.3, actor: 't2', do: 'moveTo', to: { x: 92, y: 73.2 }, dur: 0.35, ease: 'in' },
    { at: 4.3, actor: 't1', do: 'moveTo', to: { x: 84, y: 73.2 }, dur: 0.35, ease: 'in' },
    ...(['t1', 't2', 't3', 't4', 't5'] as const).map((actor) => ({ at: 4.3, actor, do: 'rotateTo' as const, amount: 90, dur: 0.35, ease: 'in' as const })),
    { at: 4.3, actor: 'bead', do: 'moveTo', to: { x: 128, y: 72 }, arc: 6, dur: 0.6, ease: 'bounce' },
    { at: 4.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 4.3, actor: 'robot', do: 'moveTo', to: { x: 38, y: 71 }, arc: 6, dur: 0.4, ease: 'in' },
    // 壓平、黏成一條橫線
    { at: 4.7, actor: 't1', do: 'vanish', dur: 0.2 }, { at: 4.75, actor: 't2', do: 'vanish', dur: 0.2 },
    { at: 4.8, actor: 't3', do: 'vanish', dur: 0.2 }, { at: 4.85, actor: 't4', do: 'vanish', dur: 0.2 },
    { at: 4.9, actor: 't5', do: 'vanish', dur: 0.2 },
    // 剩下的積木全砸在機器人身上
    { at: 4.75, actor: 'h1', do: 'drop', dur: 0.4 },
    { at: 4.8, actor: 'h3', do: 'drop', dur: 0.4 },
    { at: 4.85, actor: 'h2', do: 'drop', dur: 0.4 },
    { at: 4.95, actor: 'h4', do: 'drop', dur: 0.45 },
    { at: 5.0, actor: 'h5', do: 'drop', dur: 0.45 },
    { at: 4.8, actor: 'robot', do: 'scaleTo', amount: 0.6, dur: 0.15 },
    { at: 4.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    // 從積木堆裡探出頭，舉起剩下的一個
    { at: 6.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 6.3, actor: 'robot', do: 'scaleTo', amount: 1 / 0.6, dur: 0.3, ease: 'back' },
    { at: 6.3, actor: 'robot', do: 'moveTo', to: { x: 38, y: 58 }, dur: 0.3, ease: 'back' },
    { at: 7.0, actor: 'one', do: 'pop', dur: 0.3 },
    { at: 7.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 7.4, actor: 'robot', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    { at: 7.4, actor: 'one', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    // 回馬槍：得意往上一拋——馬達太猛，飛出畫面，掉下來砸在自己頭上
    { at: 8.0, actor: 'one', do: 'moveTo', to: { x: 40, y: -15 }, dur: 0.35, ease: 'out' },
    { at: 8.0, actor: 'robot', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 8.5, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 8.7, actor: 'one', do: 'moveTo', to: { x: 38, y: 47 }, dur: 0.3, ease: 'in' },
    { at: 9.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 9.0, actor: 'robot', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 9.0, actor: 'one', do: 'hop', amount: -3, dur: 0.3 },
  ],
  builds: [
    // 倒平的整座塔擠成一條橫線
    { at: 4.7, dur: 0.5, strokes: [0], from: 't3', color: '#FF6B6B' },
  ],
  glyph: [{ at: 5.2, dur: 0.4, do: 'shake' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'robot', emoji: '🗼', dur: 0.8 },
    { at: 1.3, kind: 'puff', actor: 't1', dur: 0.4 },
    { at: 2.6, kind: 'sweat', actor: 'robot' },
    { at: 3.9, kind: 'pop', actor: 'robot', emoji: '😁', dur: 0.4 },
    { at: 4.65, kind: 'puff', actor: 't3', dur: 0.6 },
    { at: 4.65, kind: 'burst', actor: 't3', emoji: '💥', dur: 0.5 },
    { at: 5.3, kind: 'pop', actor: 'h4', emoji: '👀', dx: -2, dy: 4, dur: 0.9 },
    { at: 6.4, kind: 'dizzy', actor: 'robot', dur: 0.8 },
    { at: 7.0, kind: 'burst', actor: 'one', emoji: '✨', n: 6, dur: 0.6 },
    { at: 9.0, kind: 'burst', actor: 'robot', emoji: '💥', dur: 0.4 },
    { at: 9.2, kind: 'dizzy', actor: 'robot', dur: 0.8 },
  ],
  camera: [
    // 疊到最高時推近看那顆小珠子，倒下前退回全景
    { at: 3.4, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 76, y: 42 } },
    { at: 4.25, dur: 0.25, do: 'zoom', amount: 1 },
    { at: 1.0, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.65, dur: 0.5, do: 'shake', amount: 2.2 },
  ],
  cues: [
    { at: 1.3, say: '一' },
    { at: 1.3, sfx: 'bonk' },
    { at: 1.9, sfx: 'bonk' },
    { at: 2.4, sfx: 'whoosh' },
    { at: 3.3, sfx: 'bonk' },
    { at: 3.95, sfx: 'tap' },
    { at: 4.35, sfx: 'crack' },
    { at: 4.65, sfx: 'rumble' },
    { at: 5.25, say: '一' },
    { at: 6.3, sfx: 'boing' },
    { at: 7.05, say: '一個' },
    { at: 8.0, sfx: 'whoosh' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
