import type { Clip } from '../clip'

// 背：小外星人只想用牽引光束幫玩具戰士拍掉背上的灰，卻把轉盤轉到最大——光束反把飛碟整台拖走，咻地衝過頭撞進深藍積木塔，
// 積木飛散落成「背」；它轉到最小輕輕一點，灰掉了、最後一塊積木也歸位。接著它躲到戰士背後，戰士轉來轉去就是找不到。背、背、背後
const TOWER = [71, 63, 55, 47, 39]

const clip: Clip = {
  char: '背',
  meta: { theme: '外星人拍灰塵', cast: '小外星人＋飛碟＋玩具戰士＋深藍積木塔', gags: ['光束開太大被拖走', '衝過頭撞塔', '轉到最小輕輕一點', '躲在背後找不到'] },
  duration: 10,
  bg: { top: '#E8F8F1', bottom: '#FFF8E8', floor: '#BFE6D3', scenery: 'room' },
  actors: [
    ...TOWER.map((y, i) => ({ id: `k${i}`, emoji: '🟦', x: 140, y, size: 8 })),
    { id: 'last', emoji: '🟦', x: 130, y: 72, size: 6 },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 30, y: 40, size: 14, float: true, hidden: true, flip: true },
    { id: 'warrior', emoji: 'hero:warrior/shield', x: 42, y: 71.1, size: 14, flip: true },
    { id: 'dust', emoji: '🌫️', x: 37, y: 66, size: 6, float: true },
  ],
  moves: [
    { at: 0.2, actor: 'alien', do: 'enter', from: { x: -15, y: 34 }, dur: 0.6, ease: 'out' },
    { at: 1.3, actor: 'alien', do: 'hop', amount: 2, dur: 0.3 },
    // 轉盤轉到最大，飛碟抖個不停
    { at: 1.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 1.9, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.9 },
    // 光束太強，反把飛碟拖走——衝過頭
    { at: 2.85, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 2.85, actor: 'alien', do: 'moveTo', to: { x: 133, y: 52 }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 2.95, actor: 'warrior', do: 'spin', times: 1, dur: 0.5 },
    { at: 2.95, actor: 'dust', do: 'shake', amount: 1, dur: 0.5 },
    // 咚！撞進積木塔
    { at: 3.25, actor: 'alien', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 3.25, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 3.25, actor: 'k0', do: 'moveTo', to: { x: 120, y: 28 }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 3.25, actor: 'k1', do: 'moveTo', to: { x: 102, y: 14 }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 3.25, actor: 'k2', do: 'moveTo', to: { x: 82, y: 8 }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 3.25, actor: 'k3', do: 'moveTo', to: { x: 146, y: 14 }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 3.25, actor: 'k4', do: 'moveTo', to: { x: 62, y: 16 }, arc: 6, dur: 0.35, ease: 'out' },
    ...TOWER.map((_, i) => ({ at: 3.6, actor: `k${i}`, do: 'shake' as const, amount: 0.8, dur: 0.4 })),
    { at: 4.1, actor: 'k2', do: 'vanish', dur: 0.2 },
    { at: 4.1, actor: 'k1', do: 'vanish', dur: 0.2 },
    { at: 4.1, actor: 'k3', do: 'vanish', dur: 0.2 },
    { at: 4.7, actor: 'k4', do: 'vanish', dur: 0.2 },
    { at: 4.7, actor: 'k0', do: 'vanish', dur: 0.2 },
    // 飛碟冒煙倒退出來，頭昏
    { at: 3.6, actor: 'alien', do: 'moveTo', to: { x: 128, y: 36 }, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'alien', do: 'tilt', amount: -20, dur: 0.8 },
    // 最後一塊在旁邊搖搖晃晃
    { at: 4.6, actor: 'last', do: 'shake', amount: 0.8, dur: 1.8 },
    // 甩甩頭，轉到最小，飛回戰士背後
    { at: 5.4, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
    { at: 5.4, actor: 'alien', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 5.75, actor: 'alien', do: 'moveTo', to: { x: 34, y: 42 }, dur: 0.55 },
    { at: 6.3, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 6.45, actor: 'dust', do: 'vanish', dur: 0.2 },
    { at: 6.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.5, actor: 'warrior', do: 'hop', amount: 2, dur: 0.3 },
    { at: 6.5, actor: 'last', do: 'vanish', dur: 0.15 },
    // 躲到戰士背後，偷看
    { at: 7.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.0, actor: 'alien', do: 'moveTo', to: { x: 36, y: 64 }, dur: 0.35, ease: 'out' },
    { at: 7.0, actor: 'alien', do: 'scaleTo', amount: 0.8, dur: 0.35 },
    { at: 7.6, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 7.6, actor: 'warrior', do: 'flip' },
    { at: 7.6, actor: 'alien', do: 'moveTo', to: { x: 48, y: 64 }, dur: 0.2 },
    { at: 8.2, actor: 'warrior', do: 'flip' },
    { at: 8.2, actor: 'alien', do: 'moveTo', to: { x: 36, y: 64 }, dur: 0.2 },
    { at: 8.7, actor: 'warrior', do: 'flip' },
    { at: 8.7, actor: 'alien', do: 'moveTo', to: { x: 48, y: 64 }, dur: 0.2 },
    // 戰士轉到昏，外星人從他頭上冒出來
    { at: 9.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 9.2, actor: 'alien', do: 'moveTo', to: { x: 42, y: 54 }, dur: 0.3, ease: 'back' },
  ],
  builds: [
    // 撞飛的深藍積木落回來：上面的「北」，下面的「月」
    { at: 4.1, dur: 0.75, strokes: [0, 1, 2, 3, 4], from: 'k2', style: 'drop', color: '#1C3D99' },
    { at: 4.7, dur: 0.5, strokes: [5, 6, 7], from: 'k4', color: '#1C3D99' },
    // 輕輕一點，最後那塊搖晃的積木歸位
    { at: 6.5, dur: 0.35, strokes: [8], from: 'last', color: '#1C3D99' },
  ],
  glyph: [{ at: 6.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.05, kind: 'pop', actor: 'alien', emoji: '👇', dur: 0.6 },
    { at: 1.95, kind: 'sweat', actor: 'alien', dur: 0.7 },
    { at: 2.4, dur: 0.45, kind: 'beam', actor: 'alien', n: 20 },
    { at: 3.25, kind: 'burst', actor: 'alien', dur: 0.4 },
    { at: 3.4, kind: 'pop', actor: 'warrior', emoji: '❓', dur: 0.6 },
    { at: 3.7, kind: 'dizzy', actor: 'alien', dur: 1.5 },
    { at: 3.7, dur: 1.5, kind: 'stink', actor: 'alien', dy: 6 },
    { at: 5.5, kind: 'pop', actor: 'alien', emoji: '🤏', dur: 0.6 },
    { at: 6.3, dur: 0.3, kind: 'beam', actor: 'alien', n: 6 },
    { at: 6.45, kind: 'burst', actor: 'warrior', emoji: '✨', n: 5, dur: 0.5, dx: -5 },
    { at: 7.6, kind: 'pop', actor: 'warrior', emoji: '❓', dur: 0.4 },
    { at: 8.2, kind: 'pop', actor: 'warrior', emoji: '❓', dur: 0.4 },
    { at: 9.2, kind: 'dizzy', actor: 'warrior', dur: 0.8 },
    { at: 9.45, kind: 'pop', actor: 'alien', emoji: '😜', dur: 0.5 },
  ],
  camera: [
    // 被光束拖走時跟拍，撞上前回全景，撞上震一下
    { at: 2.85, dur: 0.2, do: 'follow', actor: 'alien', amount: 1.25 },
    { at: 3.15, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 3.25, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.2, sfx: 'blip' },
    { at: 1.1, say: '背' },
    { at: 2.0, sfx: 'rumble' },
    { at: 2.4, sfx: 'laser' },
    { at: 2.85, sfx: 'whoosh' },
    { at: 3.25, sfx: 'bonk' },
    { at: 5.25, say: '背' },
    { at: 6.3, sfx: 'blip' },
    { at: 7.05, say: '背後' },
    { at: 7.6, sfx: 'whoosh' },
    { at: 8.2, sfx: 'whoosh' },
    { at: 8.7, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
