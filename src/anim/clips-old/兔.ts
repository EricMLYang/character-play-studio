import type { Clip } from '../clip'

// 兔：小外星人想要右邊那疊胡蘿蔔積木，牽引光束一射——光束彎回來把自己吸起來，「哐」掉在左邊的投石器上。
// 乾脆數「3、2、1」用力一踩——「蹦！」整個飛過畫面，天線順手掃到胡蘿蔔塔，自己啪地貼在右邊牆上、倒栽蔥掉進水桶；胡蘿蔔積木滾成「兔」。
// 一隻小白兔跳進來啃剩下的胡蘿蔔；外星人頂著水桶當頭盔冒出來揮手，又想用光束吸胡蘿蔔——結果吸走自己頭上的水桶。兔、兔、兔子
const clip: Clip = {
  char: '兔',
  meta: { theme: '外星人搶胡蘿蔔', cast: '小外星人＋投石器＋胡蘿蔔積木＋水桶＋小白兔', gags: ['光束吸到自己', '投石器把自己彈飛', '貼牆倒栽蔥進水桶', '又吸錯東西'] },
  duration: 10,
  bg: { top: '#E3F6EC', bottom: '#F4FBF6', floor: '#B9DDB0', scenery: 'hills' },
  actors: [
    { id: 'plank', emoji: '🪵', x: 26, y: 72, size: 12 },
    { id: 'c1', emoji: '🥕', x: 130, y: 70, size: 9 },
    { id: 'c2', emoji: '🥕', x: 130, y: 62, size: 9 },
    { id: 'c3', emoji: '🥕', x: 130, y: 54, size: 9 },
    { id: 'left', emoji: '🥕', x: 124, y: 72, size: 7, hidden: true },
    { id: 'bunny', emoji: '🐇', x: 134, y: 71, size: 12, hidden: true },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 22, y: 46, size: 15, float: true, flip: true },
    { id: 'bucket', emoji: '🪣', x: 150, y: 71, size: 11 },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'hop', amount: 2, dur: 0.6 },
    // 光束彎回來把自己吸上去
    { at: 0.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 0.7, actor: 'alien', do: 'moveTo', to: { x: 22, y: 34 }, dur: 0.3, ease: 'out' },
    { at: 0.7, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 1.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    // 哐——掉在投石器上
    { at: 1.0, actor: 'alien', do: 'moveTo', to: { x: 22, y: 64 }, dur: 0.3, ease: 'in' },
    { at: 1.3, actor: 'alien', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 1.3, actor: 'plank', do: 'shake', amount: 1, dur: 0.25 },
    // 站好，數 3、2、1，用力踩
    { at: 1.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
    { at: 2.5, actor: 'alien', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 2.6, actor: 'plank', do: 'rotateTo', amount: -20, dur: 0.1 },
    // 蹦！飛過整個畫面
    { at: 2.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 2.6, actor: 'alien', do: 'moveTo', to: { x: 151, y: 40 }, arc: 22, dur: 1.0, ease: 'linear' },
    { at: 2.6, actor: 'alien', do: 'spin', times: 1, dur: 1.0 },
    { at: 2.8, actor: 'plank', do: 'rotateTo', amount: 20, dur: 0.3, ease: 'elastic' },
    // 天線掃到胡蘿蔔塔，塔搖搖晃晃
    { at: 3.4, actor: 'c3', do: 'shake', amount: 2, dur: 0.3 },
    { at: 3.4, actor: 'c2', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 3.4, actor: 'c1', do: 'shake', amount: 1, dur: 0.3 },
    // 啪地貼在牆上，滑下來、倒栽蔥掉進水桶
    { at: 3.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 3.6, actor: 'alien', do: 'squash', amount: -0.45, dur: 0.35 },
    { at: 4.0, actor: 'alien', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 4.0, actor: 'alien', do: 'moveTo', to: { x: 150, y: 52 }, dur: 0.35, ease: 'in' },
    { at: 4.35, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.5, actor: 'alien', do: 'shake', amount: 1.2, dur: 1.0 },
    // 胡蘿蔔滾成字
    { at: 3.7, actor: 'c3', do: 'vanish', dur: 0.2 },
    { at: 4.2, actor: 'c2', do: 'vanish', dur: 0.2 },
    { at: 4.55, actor: 'c1', do: 'vanish', dur: 0.2 },
    { at: 4.6, actor: 'left', do: 'pop', dur: 0.3 },
    // 小白兔跳進來啃胡蘿蔔
    { at: 5.6, actor: 'bunny', do: 'enter', from: { x: 175, y: 71 }, arc: 8, dur: 0.5 },
    { at: 6.1, actor: 'bunny', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.6, actor: 'bunny', do: 'bounce', amount: 1.5, times: 4, dur: 1.2 },
    { at: 6.8, actor: 'left', do: 'scaleTo', amount: 0.5, dur: 1.2 },
    // 外星人頂著水桶當頭盔冒出來
    { at: 7.4, actor: 'alien', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 7.4, actor: 'alien', do: 'moveTo', to: { x: 150, y: 67 }, dur: 0.3 },
    { at: 7.4, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.4, actor: 'bucket', do: 'moveTo', to: { x: 150, y: 52 }, dur: 0.3 },
    { at: 7.4, actor: 'bucket', do: 'rotateTo', amount: 180, dur: 0.3 },
    // 回馬槍：又想吸胡蘿蔔——吸走自己頭上的水桶
    { at: 8.4, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 8.6, actor: 'bucket', do: 'moveTo', to: { x: 146, y: 24 }, dur: 0.5, ease: 'out' },
    { at: 8.6, actor: 'bucket', do: 'spin', times: 1, dur: 0.5 },
    { at: 9.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 9.2, actor: 'bunny', do: 'hop', amount: 5, dur: 0.3 },
  ],
  builds: [
    // 胡蘿蔔積木滾進來：頭 → 腿 → 尾巴那一點
    { at: 3.7, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'c3', color: '#F76707' },
    { at: 4.2, dur: 0.4, strokes: [5, 6], from: 'c2', color: '#F76707' },
    { at: 4.55, dur: 0.25, strokes: [7], from: 'c1', color: '#F76707' },
  ],
  glyph: [{ at: 4.8, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'bubble', actor: 'alien', emoji: '🥕', dur: 0.8 },
    { at: 0.6, kind: 'beam', actor: 'alien', n: 14, dur: 0.5 },
    { at: 1.0, kind: 'pop', actor: 'alien', emoji: '❓', dur: 0.4 },
    { at: 1.6, kind: 'pop', actor: 'alien', emoji: '3️⃣', dur: 0.3 },
    { at: 1.9, kind: 'pop', actor: 'alien', emoji: '2️⃣', dur: 0.3 },
    { at: 2.2, kind: 'pop', actor: 'alien', emoji: '1️⃣', dur: 0.3 },
    { at: 2.6, kind: 'puff', actor: 'plank', dur: 0.4 },
    { at: 3.6, kind: 'burst', actor: 'alien', dx: -4, dur: 0.4 },
    { at: 6.6, kind: 'pop', actor: 'bunny', emoji: '😋', dur: 0.8 },
    { at: 7.8, kind: 'dizzy', actor: 'bucket', dy: 2, dur: 0.7 },
    { at: 7.9, kind: 'pop', actor: 'alien', emoji: '👋', dx: -16, dy: 4, dur: 0.6 },
    { at: 8.5, kind: 'line', actor: 'alien', target: 'bucket', color: '#B197FC', width: 2.5, dur: 0.7 },
    { at: 9.15, kind: 'pop', actor: 'alien', emoji: '❓', dx: -16, dy: 4, dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'bunny', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 2.6, dur: 0.4, do: 'follow', actor: 'alien', amount: 1.3 },
    { at: 3.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 3.6, dur: 0.3, do: 'shake', amount: 1.3 },
  ],
  cues: [
    { at: 0.6, sfx: 'laser' },
    { at: 1.3, say: '兔' },
    { at: 1.3, sfx: 'clink' },
    { at: 1.6, sfx: 'blip' },
    { at: 1.9, sfx: 'blip' },
    { at: 2.2, sfx: 'blip' },
    { at: 2.6, sfx: 'boing' },
    { at: 3.6, sfx: 'bonk' },
    { at: 4.35, sfx: 'clink' },
    { at: 4.85, say: '兔' },
    { at: 6.1, say: '兔子' },
    { at: 8.5, sfx: 'laser' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
