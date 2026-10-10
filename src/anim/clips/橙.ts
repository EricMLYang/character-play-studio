import type { Clip } from '../clip'

// 橙：猴子想喝柳橙汁，用力擠一顆柳橙——果汁「噗」地噴到自己眼睛！換個方向再擠——噴到旁邊的鸚鵡。
// 乾脆坐上去用屁股壓，柳橙「啪」爆開，果汁和果皮變成「橙」。杯子裝滿了，猴子正要喝——鸚鵡一口吸光。橙、橙、橙汁
const clip: Clip = {
  char: '橙',
  meta: { theme: '擠果汁', cast: '猴子＋柳橙＋鸚鵡', gags: ['噴到自己眼睛', '噴到旁邊的人', '用屁股壓', '被搶先喝光'] },
  duration: 10,
  bg: { top: '#FFE7C2', bottom: '#FFF6E6', floor: '#E9C9A0', scenery: 'desert' },
  actors: [
    { id: 'cup', emoji: '🥤', x: 120, y: 71, size: 13, hidden: true },
    { id: 'orange', emoji: '🍊', x: 56, y: 71, size: 15, hidden: true },
    { id: 'monkey', emoji: '🐒', x: 34, y: 69.5, size: 19, hidden: true, flip: true },
    { id: 'parrot', emoji: '🦜', x: 142, y: 66, size: 17, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'orange', do: 'pop' },
    { at: 0.1, actor: 'monkey', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    { at: 0.3, actor: 'parrot', do: 'enter', from: { x: 178, y: 66 }, dur: 0.7 },
    { at: 0.5, actor: 'cup', do: 'pop' },
    // 用力擠——噴到自己眼睛
    { at: 1.6, actor: 'monkey', do: 'moveTo', to: { x: 44, y: 69.5 }, dur: 0.3 },
    { at: 1.9, actor: 'orange', do: 'squash', amount: 0.3, dur: 0.5 },
    { at: 2.2, actor: 'monkey', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 2.2, actor: 'monkey', do: 'moveTo', to: { x: 36, y: 69.5 }, dur: 0.3 },
    // 換個方向再擠——噴到鸚鵡
    { at: 3.2, actor: 'orange', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 3.6, actor: 'orange', do: 'squash', amount: 0.3, dur: 0.5 },
    { at: 3.9, actor: 'parrot', do: 'hop', amount: 8, dur: 0.4 },
    { at: 3.9, actor: 'parrot', do: 'shake', amount: 1.2, dur: 0.5 },
    // 乾脆坐上去用屁股壓——啪！
    { at: 4.8, actor: 'monkey', do: 'moveTo', to: { x: 56, y: 58 }, dur: 0.45, arc: 14 },
    { at: 5.25, actor: 'monkey', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.25, actor: 'orange', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 5.55, actor: 'orange', do: 'vanish', dur: 0.1 },
    { at: 5.55, actor: 'monkey', do: 'moveTo', to: { x: 30, y: 69.5 }, dur: 0.5, arc: 14 },
    { at: 5.55, actor: 'monkey', do: 'spin', dur: 0.5 },
    // 杯子裝滿了——鸚鵡一口吸光
    { at: 7.4, actor: 'cup', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.0, actor: 'monkey', do: 'moveTo', to: { x: 22, y: 69.5 }, dur: 0.3 },
    { at: 8.3, actor: 'parrot', do: 'moveTo', to: { x: 128, y: 62 }, dur: 0.3, arc: 6 },
    { at: 8.7, actor: 'cup', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 9.1, actor: 'parrot', do: 'moveTo', to: { x: 146, y: 66 }, dur: 0.4, arc: 8 },
  ],
  builds: [
    // 爆開的果皮 → 木；果汁 → 登
    { at: 5.6, dur: 0.6, strokes: [0, 1, 2, 3], from: 'orange', color: '#2F9E5A' },
    { at: 5.95, dur: 1.0, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'orange', color: '#F58A2E' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'monkey', emoji: '🥤', dur: 0.8 },
    { at: 2.15, kind: 'line', actor: 'orange', dy: -2, to: { x: 38, y: 62 }, color: '#FFB13B', width: 1.4, dur: 0.3 },
    { at: 2.3, kind: 'pop', actor: 'monkey', emoji: '😖', dur: 0.7 },
    { at: 3.85, kind: 'line', actor: 'orange', dy: -2, to: { x: 138, y: 60 }, color: '#FFB13B', width: 1.4, dur: 0.3 },
    { at: 4.0, kind: 'pop', actor: 'parrot', emoji: '💢', dur: 0.7 },
    { at: 5.55, kind: 'burst', actor: 'orange', emoji: '💦', n: 8, dur: 0.6 },
    { at: 6.1, kind: 'dizzy', actor: 'monkey', dur: 1.0 },
    { at: 8.7, kind: 'pop', actor: 'parrot', emoji: '😋', dur: 0.7 },
    { at: 9.2, kind: 'pop', actor: 'monkey', emoji: '😱', dur: 0.8 },
  ],
  camera: [
    { at: 5.2, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 54, y: 62 } },
  ],
  cues: [
    { at: 0.9, say: '橙' },
    { at: 2.15, sfx: 'splash' },
    { at: 3.85, sfx: 'splash' },
    { at: 4.8, sfx: 'boing' },
    { at: 5.5, sfx: 'crack' },
    { at: 5.6, sfx: 'splash' },
    { at: 7.05, say: '橙' },
    { at: 7.95, say: '橙汁' },
    { at: 8.7, sfx: 'gulp' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
