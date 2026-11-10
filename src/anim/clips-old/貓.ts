import type { Clip } from '../clip'

// 貓：大怪獸咚咚咚走進來，對著小小的消防車和消防小隊耍威風、低頭衝過來——水管把消防員往上一拽，怪獸從底下衝過頭、
// 肚子滑到消防車前面；水管還得意地噴了消防員自己一臉。怪獸退回去更用力再衝，消防員只輕輕「噗」地噴一下牠的鼻子，
// 怪獸像大樹一樣往後倒，「咚」地震得車上的橘色水管一圈圈甩出來，排成「豸」和「苗」，拼出「貓」。小貓咪從怪獸的角後面冒出來。貓、貓、貓咪
const clip: Clip = {
  char: '貓',
  meta: { theme: '城市消防隊對大怪獸', cast: '消防小隊＋大怪獸＋消防車＋小貓咪', gags: ['被水管拽起來閃過衝撞', '水管噴自己人', '噴一下鼻子怪獸像大樹倒下'] },
  duration: 10,
  bg: { top: '#FFF2B3', bottom: '#FFF9DD', floor: '#C8C2B8', scenery: 'city' },
  actors: [
    { id: 'engine', emoji: '🚒', x: 18, y: 69, size: 20, flip: true },
    { id: 'monster', emoji: 'hero:monster/idle', x: 128, y: 62.7, size: 34, hidden: true },
    { id: 'kitten', emoji: '🐱', x: 150, y: 66, size: 9, hidden: true },
    { id: 'fire', emoji: 'hero:firefighter/hose', x: 56, y: 71.5, size: 13, flip: true },
  ],
  moves: [
    // 咚、咚、咚走進來，每一步都震得消防車跳起來
    { at: 0, actor: 'monster', do: 'enter', from: { x: 185, y: 62.7 }, dur: 1.0, ease: 'linear' },
    { at: 0.3, actor: 'engine', do: 'hop', amount: 3, dur: 0.2 },
    { at: 0.65, actor: 'engine', do: 'hop', amount: 3, dur: 0.2 },
    { at: 1.0, actor: 'engine', do: 'hop', amount: 3, dur: 0.2 },
    // 挺胸、吼、刨地
    { at: 1.05, actor: 'monster', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 1.05, actor: 'monster', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 1.1, actor: 'fire', do: 'moveTo', to: { x: 52, y: 71.5 }, dur: 0.2 },
    { at: 1.3, actor: 'fire', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.45, actor: 'monster', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 1.45, actor: 'monster', do: 'tilt', amount: -12, dur: 0.4 },
    // 第一次衝：水管把消防員往上一拽，怪獸從底下衝過頭，肚子滑到消防車前面
    { at: 1.8, actor: 'monster', do: 'moveTo', to: { x: 44, y: 62.7 }, dur: 0.55, anticipate: 4, ease: 'in' },
    { at: 1.95, actor: 'fire', do: 'hop', amount: 34, dur: 0.6 },
    { at: 2.35, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 2.4, actor: 'engine', do: 'shake', amount: 1, dur: 0.4 },
    { at: 2.6, actor: 'monster', do: 'flip' },
    { at: 2.65, actor: 'monster', do: 'shake', amount: 1.5, dur: 0.4 },
    // 水管得意地轉回來噴了消防員自己一臉
    { at: 2.7, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 3.1, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/idle' },
    // 怪獸倒退回右邊，更用力蓄力
    { at: 3.1, actor: 'monster', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 3.1, actor: 'monster', do: 'flip' },
    { at: 3.15, actor: 'monster', do: 'moveTo', to: { x: 132, y: 62.7 }, dur: 0.5, ease: 'inOut' },
    { at: 3.2, actor: 'fire', do: 'moveTo', to: { x: 100, y: 71.5 }, dur: 0.5 },
    { at: 3.65, actor: 'monster', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 3.65, actor: 'monster', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 3.7, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/hose' },
    // 第二次衝……停格……「噗」一下噴鼻子
    { at: 3.95, actor: 'monster', do: 'moveTo', to: { x: 120, y: 62.7 }, dur: 0.2, ease: 'in' },
    { at: 4.3, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 4.4, actor: 'monster', do: 'tilt', amount: -8, dur: 0.25 },
    { at: 4.65, actor: 'monster', do: 'tilt', amount: 8, dur: 0.25 },
    // 像大樹一樣往後倒——咚！
    { at: 4.9, actor: 'monster', do: 'rotateTo', amount: 90, dur: 0.4, ease: 'in' },
    { at: 5.3, actor: 'monster', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 5.3, actor: 'engine', do: 'hop', amount: 5, dur: 0.3 },
    { at: 5.3, actor: 'fire', do: 'hop', amount: 4, dur: 0.3 },
    { at: 5.55, actor: 'monster', do: 'swap', emoji: 'hero:monster/dizzy' },
    // 消防員爬上怪獸的肚子擺勝利姿勢
    { at: 5.6, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/ladder' },
    { at: 5.6, actor: 'fire', do: 'moveTo', to: { x: 128, y: 52 }, arc: 10, dur: 0.5, ease: 'out' },
    { at: 6.15, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.15, actor: 'fire', do: 'hop', amount: 3, dur: 0.3 },
    // 小貓咪從怪獸的角後面冒出來，跳到額頭上
    { at: 7.25, actor: 'kitten', do: 'pop', dur: 0.35 },
    { at: 7.75, actor: 'kitten', do: 'moveTo', to: { x: 146, y: 58 }, arc: 5, dur: 0.35 },
    // 回馬槍：小貓拍拍噴嘴，水管又噴一下——兩個都嚇一跳、偷笑
    { at: 8.3, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 8.5, actor: 'kitten', do: 'hop', amount: 5, dur: 0.3 },
    { at: 8.55, actor: 'fire', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.0, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/happy' },
  ],
  builds: [
    // 震飛的橘色水管一圈圈甩出來：左邊 → 豸；右邊疊上去 → 苗
    { at: 5.35, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'engine', color: '#F76707' },
    { at: 5.7, dur: 0.8, strokes: [7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'engine', color: '#FD7E14' },
  ],
  glyph: [{ at: 6.55, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'pop', actor: 'monster', emoji: '💢', dur: 0.5, dx: -8 },
    { at: 1.4, kind: 'puff', actor: 'monster', dur: 0.4 },
    { at: 1.95, kind: 'pop', actor: 'fire', emoji: '😲', dur: 0.5 },
    { at: 2.35, kind: 'puff', actor: 'monster', dur: 0.5 },
    { at: 2.7, kind: 'rain', actor: 'fire', emoji: '💧', dur: 0.4 },
    { at: 3.05, kind: 'pop', actor: 'fire', emoji: '😑', dur: 0.5 },
    { at: 3.65, kind: 'pop', actor: 'monster', emoji: '😤', dur: 0.4, dx: -8 },
    { at: 4.15, dur: 0.25, kind: 'line', actor: 'fire', target: 'monster', color: '#74C0FC', width: 1.2, dy: -2 },
    { at: 4.3, kind: 'pop', actor: 'monster', emoji: '😵', dur: 0.6, dx: -8 },
    { at: 5.3, kind: 'burst', actor: 'engine', n: 1, dur: 0.35 },
    { at: 5.3, kind: 'puff', actor: 'monster', dur: 0.6 },
    { at: 5.7, kind: 'dizzy', actor: 'monster', dur: 1.6, dx: 12, dy: 18 },
    { at: 7.4, kind: 'pop', actor: 'kitten', emoji: '💕', dur: 0.6 },
    { at: 8.5, kind: 'fountain', actor: 'fire', emoji: '💧', dur: 0.5 },
    { at: 8.9, kind: 'pop', actor: 'kitten', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 1.8, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 52, y: 55 } },
    { at: 3.95, dur: 0.4, do: 'zoom', amount: 1.25, to: { x: 110, y: 55 } },
    { at: 4.8, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.3, dur: 0.45, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.3, sfx: 'rumble' },
    { at: 1.1, sfx: 'rumble' },
    { at: 1.6, say: '貓' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 2.4, sfx: 'slide' },
    { at: 2.7, sfx: 'splash' },
    { at: 3.95, sfx: 'whoosh' },
    { at: 4.17, sfx: 'splash' },
    { at: 5.3, sfx: 'bonk' },
    { at: 6.6, say: '貓' },
    { at: 7.3, say: '貓咪' },
    { at: 8.55, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
