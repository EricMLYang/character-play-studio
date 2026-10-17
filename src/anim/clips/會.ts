import type { Clip } from '../clip'

// 會：大塊頭玩具戰士敲盾牌挑釁，小外星人用飛碟光束去抓他的劍——結果抓到自己的飛碟，倒吊在半空。戰士衝過來揮劍，小外星人只輕輕一戳，
// 戰士轉兩圈像大樹一樣倒下，震得綠積木排成「會」。小外星人終於學會用光束，把泡棉劍吸起來轉圈——一得意連戰士也吸起來又掉下去。會、會、學會
const clip: Clip = {
  char: '會',
  meta: { theme: '小外星人學光束', cast: '小外星人＋玩具戰士＋綠積木＋泡棉劍', gags: ['光束抓錯吸到自己', '大塊頭被一戳就倒', '學會了卻連人一起吸'] },
  duration: 10,
  bg: { top: '#CDE9FF', bottom: '#EEF7FF', floor: '#B7C9DA', scenery: 'track' },
  actors: [
    { id: 'blocks', emoji: '🟩', x: 80, y: 73.2, size: 9 },
    { id: 'sword', emoji: '🗡️', x: 22, y: 72, size: 9, hidden: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 128, y: 68.6, size: 20 },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 28, y: 44, size: 13 },
  ],
  moves: [
    // 戰士挺胸、敲盾牌
    { at: 0.3, actor: 'warrior', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 0.8, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/shield' },
    { at: 0.85, actor: 'warrior', do: 'shake', amount: 0.8, dur: 0.2 },
    { at: 1.15, actor: 'warrior', do: 'shake', amount: 0.8, dur: 0.2 },
    { at: 0.5, actor: 'alien', do: 'hop', amount: 2, dur: 0.6 },
    // 戰士踏著重重的步子衝過來
    { at: 1.6, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 1.6, actor: 'warrior', do: 'moveTo', to: { x: 50, y: 68.6 }, dur: 1.4, ease: 'linear' },
    { at: 1.6, actor: 'warrior', do: 'bounce', amount: 2, times: 4, dur: 1.4 },
    // 光束沒抓到劍，抓到自己的飛碟——倒吊
    { at: 1.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 2.15, actor: 'alien', do: 'moveTo', to: { x: 28, y: 22 }, dur: 0.45, ease: 'out' },
    { at: 2.2, actor: 'alien', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 2.3, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 2.5, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 2.9, actor: 'alien', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 2.9, actor: 'alien', do: 'moveTo', to: { x: 30, y: 48 }, dur: 0.35, ease: 'bounce' },
    { at: 3.25, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    // 戰士揮到一半定格……小外星人輕輕一戳
    { at: 3.5, actor: 'alien', do: 'tilt', amount: -20, dur: 0.4 },
    { at: 3.8, actor: 'warrior', do: 'spin', times: 2, dur: 0.7 },
    { at: 3.8, actor: 'warrior', do: 'moveTo', to: { x: 42, y: 68.6 }, dur: 0.7 },
    { at: 4.0, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 4.5, actor: 'warrior', do: 'tilt', amount: 8, dur: 0.3 },
    // 像大樹一樣倒下——砰！
    { at: 4.8, actor: 'warrior', do: 'rotateTo', amount: -90, dur: 0.35, ease: 'in' },
    { at: 5.15, actor: 'sword', do: 'enter', from: { x: 50, y: 58 }, dur: 0.4, arc: 8 },
    { at: 5.15, actor: 'sword', do: 'spin', dur: 0.4 },
    { at: 5.15, actor: 'blocks', do: 'hop', amount: 10, dur: 0.3 },
    { at: 5.3, actor: 'blocks', do: 'vanish', dur: 0.2 },
    // 降落在戰士背上，比勝利
    { at: 6.7, actor: 'alien', do: 'moveTo', to: { x: 34, y: 54 }, dur: 0.4, ease: 'bounce' },
    { at: 7.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.1, actor: 'alien', do: 'hop', amount: 3, dur: 0.3 },
    // 這次學會了：光束穩穩吸起泡棉劍轉圈
    { at: 7.3, actor: 'alien', do: 'moveTo', to: { x: 22, y: 36 }, dur: 0.4 },
    { at: 7.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 7.8, actor: 'sword', do: 'moveTo', to: { x: 22, y: 52 }, dur: 0.6, ease: 'out' },
    { at: 7.8, actor: 'sword', do: 'spin', times: 2, dur: 1.0 },
    { at: 8.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    // 回馬槍：一得意連戰士也吸起來……掉下去
    { at: 8.5, actor: 'alien', do: 'moveTo', to: { x: 34, y: 34 }, dur: 0.3 },
    { at: 8.75, actor: 'warrior', do: 'moveTo', to: { x: 42, y: 58 }, dur: 0.4, ease: 'out' },
    { at: 9.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 9.2, actor: 'warrior', do: 'moveTo', to: { x: 42, y: 68.6 }, dur: 0.25, ease: 'in' },
    { at: 9.2, actor: 'sword', do: 'moveTo', to: { x: 22, y: 72 }, dur: 0.3, ease: 'bounce' },
    { at: 9.45, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
  ],
  builds: [
    // 倒地一震，綠積木彈起來疊成「會」：屋頂、中間的框、底下的曰
    { at: 5.2, dur: 0.5, strokes: [0, 1, 2], from: 'blocks', color: '#12A15A' },
    { at: 5.45, dur: 0.7, strokes: [3, 4, 5, 6, 7, 8], from: 'blocks', color: '#0F8A4C' },
    { at: 5.85, dur: 0.55, strokes: [9, 10, 11, 12], from: 'blocks', color: '#12A15A' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'warrior', emoji: '💪', dur: 0.6 },
    { at: 1.3, kind: 'pop', actor: 'alien', emoji: '😑', dur: 0.5 },
    { at: 1.9, kind: 'beam', actor: 'alien', n: 10, dur: 1.0 },
    { at: 2.4, kind: 'sweat', actor: 'alien' },
    { at: 3.6, kind: 'pop', actor: 'alien', emoji: '👉', dx: 7, dur: 0.6 },
    { at: 4.0, kind: 'dizzy', actor: 'warrior', dur: 1.0 },
    { at: 5.15, kind: 'puff', actor: 'warrior', dur: 0.6 },
    { at: 7.6, kind: 'beam', actor: 'alien', n: 8, dur: 1.0 },
    { at: 8.4, kind: 'pop', actor: 'warrior', emoji: '👍', dur: 0.6 },
    { at: 8.7, kind: 'beam', actor: 'alien', n: 10, dur: 0.5 },
    { at: 9.05, kind: 'pop', actor: 'alien', emoji: '😅', dur: 0.6 },
    { at: 9.45, kind: 'puff', actor: 'warrior', dur: 0.4 },
  ],
  camera: [
    { at: 3.0, dur: 0.3, do: 'zoom', amount: 1.35, to: { x: 42, y: 55 } },
    { at: 3.7, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.15, dur: 0.45, do: 'shake' },
  ],
  cues: [
    { at: 0.85, sfx: 'bonk' },
    { at: 1.0, say: '會' },
    { at: 1.15, sfx: 'bonk' },
    { at: 1.6, sfx: 'rumble' },
    { at: 1.9, sfx: 'laser' },
    { at: 2.9, sfx: 'boing' },
    { at: 3.65, sfx: 'tap' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 5.15, sfx: 'bonk' },
    { at: 5.2, sfx: 'rumble' },
    { at: 6.45, say: '會' },
    { at: 7.6, sfx: 'laser' },
    { at: 7.85, say: '學會' },
    { at: 8.7, sfx: 'laser' },
    { at: 9.45, sfx: 'bonk' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
