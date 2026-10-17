import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 拉（v8）：小外星人坐飛碟用牽引光束想把玩具戰士的盾牌拉走，戰士往後拔河。戰士揮劍太用力自己轉一圈，光束甩開反而把飛碟吊得倒過來，
// 外星人掉出來肚子著地一路滑，像保齡球一樣撞倒戰士和一排球瓶——球瓶飛起來落成「拉」。外星人把戰士拉起來手拉手，倒過來的飛碟飄下來扣在他頭上當帽子。拉、拉、手拉手
const hat: Move[] = pressStack(9.15, 0.3, 0.2, 12, ['ufo'])
const clip: Clip = {
  char: '拉',
  meta: { theme: '外星人保齡球', cast: '小外星人＋飛碟＋玩具戰士＋球瓶', gags: ['光束拔河', '光束吊起自己的飛碟', '肚子滑行當保齡球', '飛碟扣頭上'] },
  duration: 10,
  bg: { top: '#1B1F4B', bottom: '#38407A', floor: '#5A5F8A', scenery: 'space' },
  actors: [
    { id: 'pins1', emoji: '🎳', x: 136, y: 71, size: 9, hidden: true },
    { id: 'pins2', emoji: '🎳', x: 146, y: 71, size: 9, hidden: true },
    { id: 'pins3', emoji: '🎳', x: 155, y: 71, size: 9, hidden: true },
    { id: 'warrior', emoji: 'hero:warrior/shield', x: 120, y: 71.1, size: 14, hidden: true },
    { id: 'alien', emoji: 'hero:alien/beam', x: 28, y: 24, size: 12, hidden: true, float: true, flip: true },
    { id: 'ufo', emoji: '🛸', x: 28, y: 32, size: 20, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'warrior', do: 'pop', dur: 0.3 },
    { at: 0, actor: 'pins1', do: 'pop', dur: 0.3 },
    { at: 0.05, actor: 'pins2', do: 'pop', dur: 0.3 },
    { at: 0.1, actor: 'pins3', do: 'pop', dur: 0.3 },
    { at: 0.1, actor: 'ufo', do: 'enter', from: { x: -20, y: 20 }, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'alien', do: 'enter', from: { x: -20, y: 12 }, dur: 0.6, ease: 'out' },
    // 光束拉盾牌，戰士往後拔河
    { at: 1.0, actor: 'warrior', do: 'tilt', amount: -15, dur: 0.8 },
    { at: 1.0, actor: 'warrior', do: 'shake', amount: 0.5, dur: 0.8 },
    { at: 1.2, actor: 'warrior', do: 'moveTo', to: { x: 114, y: 71.1 }, dur: 0.5 },
    // 揮劍太用力，自己轉一圈
    { at: 1.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 1.9, actor: 'warrior', do: 'spin', times: 1, dur: 0.5 },
    { at: 1.9, actor: 'warrior', do: 'moveTo', to: { x: 120, y: 71.1 }, dur: 0.3 },
    // 光束甩回來吊住自己的飛碟，倒過來
    { at: 2.3, actor: 'ufo', do: 'rotateTo', amount: 180, dur: 0.4, ease: 'back' },
    { at: 2.3, actor: 'ufo', do: 'moveTo', to: { x: 28, y: 12 }, dur: 0.4 },
    { at: 2.35, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 2.4, actor: 'alien', do: 'moveTo', to: { x: 26, y: 72 }, dur: 0.35, ease: 'in' },
    { at: 2.75, actor: 'alien', do: 'squash', amount: 0.45, dur: 0.3 },
    // 肚子著地一路滑——保齡球
    { at: 2.95, actor: 'alien', do: 'moveTo', to: { x: 120, y: 72 }, dur: 0.6, ease: 'in' },
    { at: 2.95, actor: 'alien', do: 'tilt', amount: 25, dur: 0.6 },
    { at: 3.15, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    // 撞！戰士翻倒、球瓶飛起來
    { at: 3.55, actor: 'warrior', do: 'moveTo', to: { x: 143, y: 71.1 }, dur: 0.6, arc: 14, ease: 'out' },
    { at: 3.55, actor: 'warrior', do: 'spin', times: 1, dur: 0.6 },
    { at: 3.55, actor: 'pins1', do: 'moveTo', to: { x: 100, y: 30 }, dur: 0.3, arc: 6 },
    { at: 3.55, actor: 'pins2', do: 'moveTo', to: { x: 120, y: 28 }, dur: 0.3, arc: 6 },
    { at: 3.55, actor: 'pins3', do: 'moveTo', to: { x: 150, y: 30 }, dur: 0.3, arc: 6 },
    { at: 3.55, actor: 'pins1', do: 'spin', times: 2, dur: 0.3 },
    { at: 3.55, actor: 'pins2', do: 'spin', times: 2, dur: 0.3 },
    { at: 3.55, actor: 'pins3', do: 'spin', times: 2, dur: 0.3 },
    { at: 3.85, actor: 'pins1', do: 'vanish', dur: 0.1 },
    { at: 4.15, actor: 'pins2', do: 'vanish', dur: 0.1 },
    { at: 4.45, actor: 'pins3', do: 'vanish', dur: 0.1 },
    { at: 4.15, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 4.15, actor: 'warrior', do: 'squash', amount: 0.4, dur: 0.4 },
    // 外星人爬起來比得意的姿勢
    { at: 4.4, actor: 'alien', do: 'moveTo', to: { x: 124, y: 71.5 }, dur: 0.3 },
    { at: 5.3, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 5.3, actor: 'alien', do: 'hop', amount: 5, dur: 0.35 },
    // 手拉手把戰士拉起來，一起甩手
    { at: 6.3, actor: 'alien', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 6.55, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.55, actor: 'warrior', do: 'hop', amount: 6, dur: 0.35 },
    { at: 6.6, actor: 'warrior', do: 'moveTo', to: { x: 137, y: 71.1 }, dur: 0.35 },
    { at: 7.3, actor: 'alien', do: 'bounce', amount: 2.5, times: 3, dur: 0.9 },
    { at: 7.3, actor: 'warrior', do: 'bounce', amount: 2.5, times: 3, dur: 0.9 },
    // 回馬槍：倒過來的飛碟飄過來扣在頭上當帽子
    { at: 7.6, actor: 'ufo', do: 'scaleTo', amount: 0.55, dur: 0.4 },
    { at: 7.7, actor: 'ufo', do: 'moveTo', to: { x: 124, y: 4 }, dur: 1.0, ease: 'linear' },
    { at: 8.75, actor: 'ufo', do: 'moveTo', to: { x: 124, y: 53 }, dur: 0.4, ease: 'in' },
    { at: 9.15, actor: 'alien', do: 'squash', amount: 0.2, dur: 0.3 },
    ...hat,
    { at: 9.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 9.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
  ],
  builds: [
    // 飛起來的球瓶：左邊三支 → 扌；右邊五支 → 立
    { at: 3.75, dur: 0.5, strokes: [0, 1, 2], from: 'pins1', color: '#FF4D4F' },
    { at: 4.1, dur: 0.75, strokes: [3, 4, 5, 6, 7], from: 'pins2', color: '#E03131' },
  ],
  glyph: [{ at: 4.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, dur: 1.4, kind: 'line', actor: 'ufo', target: 'warrior', color: '#74C0FC', width: 1.6 },
    { at: 0.6, kind: 'pop', actor: 'alien', emoji: '😏', dur: 0.4 },
    { at: 1.3, kind: 'sweat', actor: 'warrior' },
    { at: 1.4, kind: 'puff', actor: 'warrior', dur: 0.5 },
    { at: 2.35, kind: 'pop', actor: 'alien', emoji: '❗', dur: 0.3 },
    { at: 2.75, kind: 'puff', actor: 'alien', dur: 0.4 },
    { at: 3.2, kind: 'pop', actor: 'warrior', emoji: '😱', dur: 0.35 },
    { at: 3.55, kind: 'burst', actor: 'warrior', n: 1, dur: 0.4 },
    { at: 4.15, kind: 'dizzy', actor: 'warrior', dur: 2.2 },
    { at: 5.4, kind: 'pop', actor: 'alien', emoji: '💪', dur: 0.5 },
    { at: 6.6, kind: 'pop', actor: 'warrior', emoji: '🤝', dur: 0.7 },
    { at: 9.2, kind: 'pop', actor: 'warrior', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    { at: 2.95, dur: 0.2, do: 'follow', actor: 'alien', amount: 1.35 },
    { at: 3.55, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 3.6, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.9, sfx: 'laser' },
    { at: 1.25, say: '拉' },
    { at: 1.9, sfx: 'whoosh' },
    { at: 2.3, sfx: 'boing' },
    { at: 2.75, sfx: 'plop' },
    { at: 2.95, sfx: 'slide' },
    { at: 3.55, sfx: 'bonk' },
    { at: 3.65, sfx: 'clink' },
    { at: 4.9, say: '拉' },
    { at: 6.6, say: '手拉手' },
    { at: 9.15, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
