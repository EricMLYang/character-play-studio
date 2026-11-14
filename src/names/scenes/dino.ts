// 演的是字面意思：恐（害怕）＋龍——一隻小龍從蛋裡出來，火山一噴長成大恐龍，結果被一隻小老鼠嚇到跳上石頭。
import { scene } from '../../story/scene'

// 沙漠裡一顆蛋搖啊搖，喀！跑出一隻小恐龍。他想吼——只發出「吱」；用力再吼——只打了一個嗝。
// 背後的火山轟隆隆……轟！火山爆發，小恐龍跟著變成超大恐龍，仰天大吼：「恐龍」！
// 這時一隻小老鼠走過來，「吱」一聲——大恐龍嚇得跳上石頭發抖。小老鼠爬到他頭上，兩個一起吼，變成好朋友。
const G = 71.1 // 小恐龍（size 14）站在地上的 y
const ROCK = { x: 52, y: 70.3 }
const ON_ROCK = 63 // 站在石頭上

export default scene({
  duration: 9.6,
  bg: { top: '#FFB86B', bottom: '#FFE8B8', floor: '#E9C27A', scenery: 'desert' },
  actors: [
    { id: 'volcano', emoji: '🌋', x: 138, y: 62, size: 40 },
    { id: 'cactus', emoji: '🌵', x: 20, y: 67, size: 24 },
    { id: 'rock', emoji: '🪨', x: ROCK.x, y: ROCK.y, size: 16 },
    { id: 'bone', emoji: '🦴', x: 112, y: 73.5, size: 8 },
    { id: 'egg', emoji: '🥚', x: 84, y: 70.3, size: 16, pivot: 'center' },
    { id: 'dino', emoji: 'hero:dino/happy', x: 84, y: G, size: 14, hidden: true },
    { id: 'mouse', emoji: '🐁', x: 178, y: 72.4, size: 11 },
  ],
  moves: [
    // 蛋搖啊搖（越搖越大力），喀！
    { at: 0.15, actor: 'egg', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 0.5, actor: 'egg', do: 'tilt', amount: -14, dur: 0.3 },
    { at: 0.85, actor: 'egg', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: 1.2, actor: 'egg', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 1.3, actor: 'egg', do: 'vanish', dur: 0.1 },
    { at: 1.3, actor: 'dino', do: 'pop', dur: 0.35 },
    { at: 1.3, actor: 'dino', do: 'hop', amount: 5, dur: 0.4 },
    // 第一次吼：吱
    { at: 1.95, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 2.15, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 2.15, actor: 'dino', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 2.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    // 第二次：蹲更低、用力——嗝
    { at: 2.95, actor: 'dino', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: 3.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 3.3, actor: 'dino', do: 'hop', amount: 3, dur: 0.3 },
    { at: 3.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    // 背後的火山轟隆隆，他回頭看
    { at: 3.9, actor: 'volcano', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 4.0, actor: 'dino', do: 'flip' },
    // 轟！火山爆發，他跟著長成大恐龍，仰天大吼
    { at: 4.55, actor: 'volcano', do: 'squash', amount: -0.2, dur: 0.35 },
    { at: 4.6, actor: 'dino', do: 'flip' },
    { at: 4.65, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 4.65, actor: 'dino', do: 'scaleTo', amount: 2.3, dur: 0.45, ease: 'elastic' },
    { at: 5.3, actor: 'dino', do: 'shake', amount: 0.6, dur: 0.6 },
    // 小老鼠走過來，停在他面前：吱
    { at: 5.9, actor: 'mouse', do: 'moveTo', to: { x: 104, y: 72.4 }, dur: 0.7, ease: 'out' },
    { at: 6.6, actor: 'mouse', do: 'hop', amount: 2, dur: 0.25 },
    // 大恐龍嚇得跳上石頭發抖
    { at: 6.85, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 6.9, actor: 'dino', do: 'moveTo', to: { x: ROCK.x, y: ON_ROCK }, arc: 14, dur: 0.4, ease: 'out' },
    { at: 7.35, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.7 },
    // 小老鼠跳到他頭上；兩個一起吼，好朋友
    { at: 7.4, actor: 'mouse', do: 'moveTo', to: { x: 55, y: 28 }, arc: 16, dur: 0.55, ease: 'out' },
    { at: 8.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 8.1, actor: 'dino', do: 'hop', amount: 3, dur: 0.35 },
    { at: 8.1, actor: 'mouse', do: 'hop', amount: 3, dur: 0.35 },
  ],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'egg', emoji: '❗', dur: 0.4 },
    { at: 1.3, kind: 'burst', actor: 'egg', emoji: '🥚', n: 6, dur: 0.6 },
    { at: 1.35, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 2.2, kind: 'pop', actor: 'dino', emoji: '🎵', dx: -8, dur: 0.5 },
    { at: 2.7, kind: 'sweat', actor: 'dino' },
    { at: 3.35, kind: 'puff', actor: 'dino', n: 3, dur: 0.4 },
    { at: 3.4, kind: 'pop', actor: 'dino', emoji: '😳', dx: -8, dur: 0.5 },
    { at: 4.0, kind: 'pop', actor: 'dino', emoji: '❓', dx: 6, dur: 0.5 },
    { at: 4.55, kind: 'fountain', actor: 'volcano', emoji: '🔥', n: 12, dur: 1.4 },
    { at: 4.65, kind: 'burst', actor: 'dino', emoji: '⭐', n: 10, dur: 0.9 },
    { at: 4.7, kind: 'puff', actor: 'dino', n: 12, dur: 0.7 },
    { at: 6.6, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.35 },
    { at: 6.9, kind: 'pop', actor: 'dino', emoji: '😱', dx: 16, dy: 6, dur: 0.7 },
    { at: 7.3, kind: 'sweat', actor: 'dino' },
    { at: 7.95, kind: 'pop', actor: 'mouse', emoji: '💗', dx: 6, dur: 0.6 },
    { at: 8.15, kind: 'burst', actor: 'dino', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    // 開場先讓蛋、石頭、火山都在畫面裡，蛋裂開後再交給自動取景
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.15, to: { x: 98, y: 50 } },
    { at: 1.3, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.9, dur: 0.5, do: 'shake', amount: 0.6 },
    { at: 4.55, dur: 0.6, do: 'shake', amount: 2 },
    { at: 4.7, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 84, y: 45 } },
    { at: 6.9, dur: 0.3, do: 'shake', amount: 1 },
    { at: 8.0, dur: 0.45, do: 'zoom', amount: 1.3, to: { x: 60, y: 46 } },
  ],
  lights: [
    { at: 3.9, dur: 0.6, level: 0.3 },
    { at: 4.55, dur: 0.05, level: -0.45 },
    { at: 4.6, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.15, sfx: 'tap' },
    { at: 0.5, sfx: 'tap' },
    { at: 1.3, sfx: 'crack' },
    { at: 2.15, sfx: 'blip' },
    { at: 3.3, sfx: 'hic' },
    { at: 3.9, sfx: 'rumble' },
    { at: 4.55, sfx: 'crack' },
    { at: 4.65, sfx: 'whoosh' },
    { at: 4.8, say: '恐龍' },
    { at: 6.6, sfx: 'blip' },
    { at: 6.9, sfx: 'boing' },
    { at: 8.1, sfx: 'cheer' },
  ],
})
