// 演的是字面意思：海綿＋寶寶——浴室裡一塊小小的海綿（寶寶），把浴缸的泡泡水一口一口吸光、脹成好大一塊，被鴨子一踩全噴出來（海綿沒有臉、沒穿褲子，不在海底，沒有鳳梨屋、水母）。
import { scene } from '../../story/scene'

// 浴室：小海綿蹦蹦跳上浴缸邊，鴨子在泡泡水裡漂著。海綿低頭一吸——咕嚕，泡泡被吸進去，它脹大一點；再吸、再吸，越吸越大，
// 浴缸的水被吸光，鴨子「咚」一聲沉到缸底，氣呼呼地爬出來。鴨子啄一下：海綿只是晃一晃（停一拍）。
// 鴨子退後、助跑、一屁股跳到海綿上——噗咻！水全部噴出來，鴨子被噴上天，泡泡滿屋子飛；
// 鴨子掉回裝滿水的浴缸，海綿縮回小小一塊，跳到浴缸中間亮相：「海綿寶寶」。
const RIM = 53.5 // 浴缸邊的高度（浴缸 size 50、x 100）
const on = (surface: number, size: number) => surface + 3 - 0.42 * size // 站在某個面上的 y
const S = { x: 84, y: on(RIM, 12) } // 海綿坐在浴缸左邊
const DUCK = { x: 97, y: on(RIM, 16) + 1 } // 鴨子漂在水面
const FLOOR_D = on(74, 16) // 鴨子站在地上
const BUB = [90, 104, 112, 119]

export default scene({
  duration: 9.4,
  bg: { top: '#BFE6F2', bottom: '#EAF8FB', floor: '#9FD3D8', scenery: 'room' },
  actors: [
    { id: 'mirror', emoji: '🪞', x: 28, y: 34, size: 22, float: true },
    { id: 'bottle', emoji: '🧴', x: 18, y: on(74, 14), size: 14 },
    ...BUB.map((x, i) => ({ id: `b${i}`, emoji: '🫧', x, y: RIM - 1 - (i % 2) * 2, size: 8, float: true })),
    { id: 'tub', emoji: '🛁', x: 100, y: on(74, 50), size: 50 },
    { id: 'duck', emoji: '🦆', x: DUCK.x, y: DUCK.y, size: 16, float: true },
    { id: 'sponge', emoji: '🧽', x: S.x, y: S.y, size: 12 },
  ],
  moves: [
    // 小海綿從左邊蹦進來，跳上浴缸邊
    { at: 0.05, actor: 'sponge', do: 'enter', from: { x: 40, y: on(74, 12) }, dur: 0.6, anticipate: 3, ease: 'out' },
    { at: 0.05, actor: 'sponge', do: 'spin', times: 1, dur: 0.6 },
    { at: 0.7, actor: 'duck', do: 'tilt', amount: 8, dur: 0.6 },
    // 低頭吸：泡泡一顆一顆飛進去，海綿一次脹一點
    { at: 1.1, actor: 'sponge', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 1.25, actor: 'b0', do: 'moveTo', to: { x: S.x, y: S.y - 3 }, dur: 0.25, ease: 'in' },
    { at: 1.5, actor: 'b0', do: 'vanish', dur: 0.05 },
    { at: 1.5, actor: 'sponge', do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'back' },
    { at: 1.75, actor: 'b1', do: 'moveTo', to: { x: S.x, y: S.y - 4 }, dur: 0.25, ease: 'in' },
    { at: 2.0, actor: 'b1', do: 'vanish', dur: 0.05 },
    { at: 2.0, actor: 'sponge', do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'back' },
    { at: 2.2, actor: 'b2', do: 'moveTo', to: { x: S.x, y: S.y - 6 }, dur: 0.22, ease: 'in' },
    { at: 2.2, actor: 'b3', do: 'moveTo', to: { x: S.x, y: S.y - 6 }, dur: 0.28, ease: 'in' },
    { at: 2.45, actor: 'b2', do: 'vanish', dur: 0.05 },
    { at: 2.5, actor: 'b3', do: 'vanish', dur: 0.05 },
    { at: 2.5, actor: 'sponge', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    // 越吸越大，水被吸光：鴨子沉下去，咚！
    { at: 2.4, actor: 'duck', do: 'moveTo', to: { x: DUCK.x, y: DUCK.y + 6 }, dur: 0.5, ease: 'in' },
    { at: 2.85, actor: 'duck', do: 'vanish', dur: 0.1 },
    { at: 2.9, actor: 'sponge', do: 'scaleTo', amount: 1.3, dur: 0.35, ease: 'back' },
    { at: 3.0, actor: 'tub', do: 'squash', amount: 0.08, dur: 0.25 },
    // 鴨子氣呼呼地從浴缸前面跳出來
    { at: 3.5, actor: 'duck', do: 'pop', dur: 0.15 },
    { at: 3.5, actor: 'duck', do: 'moveTo', to: { x: 100, y: 38 }, dur: 0.2, ease: 'out' },
    { at: 3.7, actor: 'duck', do: 'moveTo', to: { x: 78, y: FLOOR_D }, arc: 4, dur: 0.3, ease: 'in' },
    // 海綿太重，想跳下來也跳不動
    { at: 3.9, actor: 'sponge', do: 'squash', amount: -0.1, dur: 0.3 },
    { at: 4.2, actor: 'sponge', do: 'squash', amount: 0.15, dur: 0.3 },
    // 鴨子啄一下：只晃一晃
    { at: 4.5, actor: 'duck', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 4.75, actor: 'sponge', do: 'shake', amount: 0.5, dur: 0.3 },
    // 退後、助跑、跳到海綿頭上
    { at: 5.2, actor: 'duck', do: 'flip' },
    { at: 5.2, actor: 'duck', do: 'moveTo', to: { x: 46, y: FLOOR_D }, dur: 0.35, ease: 'out' },
    { at: 5.6, actor: 'duck', do: 'flip' },
    { at: 5.65, actor: 'duck', do: 'moveTo', to: { x: 82, y: 22 }, arc: 10, dur: 0.4, anticipate: 3, ease: 'in' },
    { at: 6.05, actor: 'sponge', do: 'squash', amount: 0.3, dur: 0.25 },
    // 噗咻！全噴出來：海綿縮回去，鴨子被噴上天
    { at: 6.3, actor: 'sponge', do: 'scaleTo', amount: 0.26, dur: 0.35, ease: 'out' },
    { at: 6.3, actor: 'sponge', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: 6.3, actor: 'duck', do: 'moveTo', to: { x: 96, y: 16 }, dur: 0.4, ease: 'out' },
    { at: 6.3, actor: 'duck', do: 'spin', times: 2, dur: 0.8, pivot: 'center' },
    // 水又滿了，泡泡回來
    ...BUB.map((_, i) => ({ at: 6.5 + i * 0.08, actor: `b${i}`, do: 'moveTo' as const, to: { x: BUB[i], y: RIM - 1 - (i % 2) * 2 }, dur: 0.05 })),
    ...BUB.map((_, i) => ({ at: 6.6 + i * 0.08, actor: `b${i}`, do: 'pop' as const, dur: 0.2 })),
    { at: 6.75, actor: 'duck', do: 'moveTo', to: { x: 115, y: DUCK.y }, dur: 0.45, ease: 'bounce' },
    // 亮相：海綿跳到浴缸中間，變大
    { at: 7.3, actor: 'sponge', do: 'moveTo', to: { x: 88, y: on(64, 12) }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 7.3, actor: 'sponge', do: 'scaleTo', amount: 3.4, dur: 0.4, ease: 'back' },
    { at: 7.85, actor: 'duck', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.2, actor: 'sponge', do: 'hop', amount: 3, dur: 0.35 },
  ],
  fx: [
    { at: 0.7, kind: 'puff', actor: 'sponge', dur: 0.4 },
    { at: 1.5, kind: 'pop', actor: 'sponge', emoji: '😋', dx: -6, dur: 0.5 },
    { at: 2.5, kind: 'burst', actor: 'sponge', emoji: '💦', n: 5, dur: 0.6 },
    { at: 3.0, kind: 'burst', actor: 'duck', emoji: '💥', n: 1, dur: 0.4 },
    { at: 3.55, kind: 'pop', actor: 'duck', emoji: '💢', dx: 6, dur: 0.6 },
    { at: 4.0, kind: 'sweat', actor: 'sponge' },
    { at: 4.85, kind: 'pop', actor: 'duck', emoji: '😑', dx: 6, dur: 0.5 },
    { at: 6.3, kind: 'fountain', actor: 'sponge', dur: 0.9 },
    { at: 6.3, kind: 'burst', actor: 'sponge', emoji: '🫧', n: 12, dur: 0.9 },
    { at: 6.4, kind: 'pop', actor: 'duck', emoji: '😱', dx: 7, dur: 0.5 },
    { at: 7.2, kind: 'burst', actor: 'duck', emoji: '💦', n: 6, dur: 0.6 },
    { at: 7.7, kind: 'burst', actor: 'sponge', emoji: '🫧', n: 8, dur: 0.9 },
    { at: 7.8, kind: 'burst', actor: 'sponge', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 3.0, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 6.05, dur: 0.3, do: 'punch', amount: 0.12, to: { x: 88, y: 46 } },
    { at: 6.3, dur: 0.45, do: 'shake', amount: 1.6 },
    { at: 7.4, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 90, y: 44 } },
  ],
  lights: [
    { at: 6.3, dur: 0.05, level: -0.35 },
    { at: 6.35, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'boing' },
    { at: 1.4, sfx: 'gulp' },
    { at: 1.9, sfx: 'gulp' },
    { at: 2.4, sfx: 'gulp' },
    { at: 2.9, sfx: 'bubble' },
    { at: 3.0, sfx: 'bonk' },
    { at: 4.7, sfx: 'tap' },
    { at: 5.65, sfx: 'whoosh' },
    { at: 6.05, sfx: 'plop' },
    { at: 6.3, sfx: 'splash' },
    { at: 7.2, sfx: 'splash' },
    { at: 7.6, say: '海綿寶寶' },
    { at: 7.8, sfx: 'cheer' },
  ],
})
