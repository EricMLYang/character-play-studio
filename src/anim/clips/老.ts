import type { Clip } from '../clip'

// 老：玩具戰士想撞倒花生抱著的高高木板塔。第一次揮劍太用力，把自己轉三圈、頭盔蓋住眼睛一屁股坐反方向；
// 退到最左邊助跑、肚皮貼地像保齡球一樣滑過去——咚！六塊木板飛起來落成「老」，花生翻了個跟斗，戴上眼鏡變成小老師；戰士學他敬禮，又把自己轉昏了。老、老、老師
const PLANKS = [72, 66.5, 61, 55.5, 50, 44.5]
const FLY = [{ x: 60, y: 8 }, { x: 78, y: 4 }, { x: 96, y: 8 }, { x: 112, y: 16 }, { x: 128, y: 10 }, { x: 140, y: 24 }]

const clip: Clip = {
  char: '老',
  meta: { theme: '肚皮保齡球', cast: '玩具戰士＋浣熊花生＋六塊木板', gags: ['揮太用力轉三圈', '肚皮滑壘撞塔', '彈回來還在滑', '敬禮敬錯手又轉昏'] },
  duration: 10,
  bg: { top: '#FFF8EC', bottom: '#FCEBD5', floor: '#F2D9B8', scenery: 'track' },
  actors: [
    ...PLANKS.map((y, i) => ({ id: `p${i}`, emoji: '🪵', x: 128, y, size: 7 })),
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 141, y: 71.1, size: 14 },
    { id: 'glasses', emoji: '👓', x: 140, y: 64, size: 5, float: true, hidden: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 26, y: 71.1, size: 14, flip: true },
  ],
  moves: [
    // 拿劍指著塔，挺胸跺腳
    { at: 0.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 0.5, actor: 'warrior', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    // 花生敬禮——塔一歪，趕快抱住
    { at: 0.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    ...PLANKS.map((_, i) => ({ at: 0.85, actor: `p${i}`, do: 'tilt' as const, amount: 4 + i * 3, dur: 0.6 })),
    { at: 1.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 1.4, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.3 },
    // 揮太用力，把自己轉三圈，坐反方向
    { at: 1.7, actor: 'warrior', do: 'spin', times: 3, dur: 0.8 },
    { at: 2.5, actor: 'warrior', do: 'flip' },
    { at: 2.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 2.5, actor: 'warrior', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.0, actor: 'warrior', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 3.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/idle' },
    // 退到最左邊（還是背對），轉身助跑
    { at: 3.3, actor: 'warrior', do: 'moveTo', to: { x: 10, y: 71.1 }, dur: 0.35 },
    { at: 3.7, actor: 'warrior', do: 'flip' },
    { at: 3.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/shield' },
    { at: 3.75, actor: 'warrior', do: 'moveTo', to: { x: 50, y: 71.1 }, dur: 0.35, anticipate: 4, ease: 'in' },
    // 撲下去，肚皮滑過去
    { at: 4.1, actor: 'warrior', do: 'rotateTo', amount: 80, dur: 0.12 },
    { at: 4.1, actor: 'warrior', do: 'moveTo', to: { x: 112, y: 71.1 }, dur: 0.45, ease: 'out' },
    // 咚！塔被撞飛，花生翻跟斗
    { at: 4.55, actor: 'warrior', do: 'squash', amount: 0.35, dur: 0.25 },
    ...PLANKS.map((_, i) => ({ at: 4.6, actor: `p${i}`, do: 'moveTo' as const, to: FLY[i], arc: 6, dur: 0.4, ease: 'out' as const })),
    ...PLANKS.map((_, i) => ({ at: 4.6, actor: `p${i}`, do: 'spin' as const, times: i % 2 ? 2 : -2, dur: 0.5 })),
    ...PLANKS.map((_, i) => ({ at: i < 3 ? 5.0 : 5.6, actor: `p${i}`, do: 'vanish' as const, dur: 0.2 })),
    { at: 4.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 4.6, actor: 'raccoon', do: 'moveTo', to: { x: 147, y: 71.1 }, arc: 12, dur: 0.55 },
    { at: 4.6, actor: 'raccoon', do: 'spin', times: 1, dur: 0.55 },
    { at: 5.15, actor: 'raccoon', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 戰士被彈回來，趴著一路滑回左邊
    { at: 4.65, actor: 'warrior', do: 'moveTo', to: { x: 26, y: 71.1 }, dur: 0.75, ease: 'out' },
    // 跳起來擺帥氣姿勢……然後頭昏傻笑
    { at: 5.7, actor: 'warrior', do: 'rotateTo', amount: -80, dur: 0.2 },
    { at: 5.7, actor: 'warrior', do: 'hop', amount: 4, dur: 0.3 },
    { at: 5.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 6.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.3, actor: 'warrior', do: 'tilt', amount: 12, dur: 0.6 },
    // 花生戴上眼鏡變成小老師
    { at: 6.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 6.9, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.95, actor: 'glasses', do: 'moveTo', to: { x: 146, y: 64 }, dur: 0.01 },
    { at: 6.95, actor: 'glasses', do: 'pop', dur: 0.3 },
    { at: 7.3, actor: 'raccoon', do: 'tilt', amount: -10, dur: 0.3 },
    { at: 7.6, actor: 'raccoon', do: 'tilt', amount: -10, dur: 0.3 },
    { at: 8.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 戰士學敬禮——敬錯手、敬太用力，又轉三圈坐倒
    { at: 8.3, actor: 'warrior', do: 'flip' },
    { at: 8.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/idle' },
    { at: 8.55, actor: 'warrior', do: 'spin', times: 3, dur: 0.7 },
    { at: 9.25, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 9.25, actor: 'warrior', do: 'squash', amount: 0.4, dur: 0.3 },
  ],
  builds: [
    // 飛起來的木板落成「老」：上面三塊 → 土，下面三塊 → 撇和匕
    { at: 5.0, dur: 0.6, strokes: [0, 1, 2], from: 'p1', color: '#E8590C' },
    { at: 5.6, dur: 0.65, strokes: [3, 4, 5], from: 'p4', color: '#E03131' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'warrior', emoji: '😤', dur: 0.5 },
    { at: 0.9, kind: 'sweat', actor: 'raccoon', dur: 0.6 },
    { at: 2.5, kind: 'puff', actor: 'warrior', dur: 0.4 },
    { at: 2.55, kind: 'dizzy', actor: 'warrior', dur: 0.7 },
    { at: 4.1, kind: 'puff', actor: 'warrior', dur: 0.5 },
    { at: 4.2, kind: 'pop', actor: 'raccoon', emoji: '😱', dur: 0.4 },
    { at: 4.55, kind: 'burst', actor: 'warrior', dx: 10, dur: 0.4 },
    { at: 5.2, kind: 'dizzy', actor: 'raccoon', dur: 1.2 },
    { at: 7.3, kind: 'pop', actor: 'raccoon', emoji: '👆', dx: -14, dy: 4, dur: 0.6 },
    { at: 8.35, kind: 'pop', actor: 'warrior', emoji: '🫡', dur: 0.4 },
    { at: 9.3, kind: 'dizzy', actor: 'warrior', dur: 0.7 },
    { at: 9.4, kind: 'pop', actor: 'raccoon', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    // 肚皮滑過去時跟拍，撞上之前退回全景
    { at: 3.75, dur: 0.3, do: 'follow', actor: 'warrior', amount: 1.3 },
    { at: 4.4, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 4.55, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.5, sfx: 'tap' },
    { at: 1.1, say: '老' },
    { at: 1.7, sfx: 'whoosh' },
    { at: 2.5, sfx: 'plop' },
    { at: 3.75, sfx: 'whoosh' },
    { at: 4.1, sfx: 'slide' },
    { at: 4.55, sfx: 'bonk' },
    { at: 4.65, sfx: 'slide' },
    { at: 6.35, say: '老' },
    { at: 7.0, say: '老師' },
    { at: 8.55, sfx: 'whoosh' },
    { at: 9.25, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
