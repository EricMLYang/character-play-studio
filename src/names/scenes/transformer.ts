// 演的是字面意思：變形（捏黏土變出各種形狀）＋金剛（大猩猩）——一隻大猩猩捏黏土要給小猴子捏一根香蕉，越捏越怪，最後一屁股坐下去，捏出一隻跟自己一樣大的黏土大猩猩（沒有車子變機器人、沒有標誌）。
import { scene } from '../../story/scene'

// 傍晚的草地：大猩猩捧著一團黏土走過來，小猴子坐在對面，頭上想著香蕉。
// 大猩猩一拍——黏土變成一根香蕉！小猴子撲過去咬一口……喀，咬到黏土，牙齒好痛，把香蕉丟回來。
// 大猩猩再捏：變成章魚（小猴子搖頭）、再捏：變成鴨子（小猴子翻白眼）。大猩猩氣得跳起來，一屁股坐在黏土上——碰！
// 停一拍……他屁股底下的黏土鼓起來，把他頂開，長成一隻跟他一樣大的黏土大猩猩！小猴子左看右看分不出來。
// 大猩猩拍胸脯，黏土大猩猩也拍胸脯：「變形金剛」。小猴子跳到黏土大猩猩頭上。
const K = 26 // 大猩猩
const G = 77 - 0.42 * K
const C = 12 // 黏土
const CG = 77 - 0.42 * C
const KX = 58
const CX = 84
const M = 14 // 小猴子
const MG = 77 - 0.42 * M
const MX = 132
const CLAY = 'sepia(1) saturate(1.4) hue-rotate(-12deg) brightness(.82)' // 染成黏土的咖啡色

export default scene({
  duration: 9.6,
  bg: { top: '#F7A07A', bottom: '#FFE1C2', floor: '#8CC56F', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 12, y: 77 - 0.42 * 32, size: 32 },
    { id: 'paint', emoji: '🎨', x: 150, y: 77 - 0.42 * 9, size: 9 },
    { id: 'gorilla', emoji: '🦍', x: KX, y: G, size: K, flip: true },
    { id: 'clay', emoji: '🟤', x: CX, y: CG, size: C, tint: CLAY },
    { id: 'monkey', emoji: '🐒', x: MX, y: MG, size: M },
  ],
  moves: [
    // ① 大猩猩走過來
    { at: 0, actor: 'gorilla', do: 'enter', from: { x: -20, y: G }, dur: 0.9, ease: 'out' },
    { at: 0, actor: 'clay', do: 'enter', from: { x: CX - 70, y: CG }, dur: 0.9, ease: 'out' },
    // ② 一拍——變成香蕉
    { at: 1.2, actor: 'gorilla', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: 1.35, actor: 'gorilla', do: 'tilt', amount: 14, dur: 0.3 },
    { at: 1.4, actor: 'clay', do: 'squash', amount: 0.5, dur: 0.25 },
    { at: 1.6, actor: 'clay', do: 'swap', emoji: '🍌' },
    { at: 1.6, actor: 'clay', do: 'hop', amount: 4, dur: 0.3 },
    // 小猴子撲過去咬一口……喀
    { at: 2.0, actor: 'monkey', do: 'moveTo', to: { x: 98, y: MG }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 2.5, actor: 'monkey', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 2.55, actor: 'monkey', do: 'shake', amount: 1, dur: 0.35 },
    // 把香蕉丟回來，跳回去
    { at: 2.95, actor: 'clay', do: 'moveTo', to: { x: CX, y: CG }, arc: 6, dur: 0.3 },
    { at: 2.95, actor: 'clay', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
    { at: 3.05, actor: 'monkey', do: 'moveTo', to: { x: MX, y: MG }, arc: 6, dur: 0.4, ease: 'out' },
    // 再捏：章魚、鴨子，越捏越怪
    { at: 3.5, actor: 'gorilla', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 3.55, actor: 'clay', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 3.75, actor: 'clay', do: 'swap', emoji: '🐙' },
    { at: 3.9, actor: 'monkey', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 4.15, actor: 'gorilla', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 4.2, actor: 'clay', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 4.4, actor: 'clay', do: 'swap', emoji: '🦆' },
    // ③ 氣得跳起來，一屁股坐下去——碰！
    { at: 4.75, actor: 'gorilla', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 4.95, actor: 'gorilla', do: 'moveTo', to: { x: CX, y: G }, arc: 16, dur: 0.4, ease: 'in' },
    { at: 5.35, actor: 'clay', do: 'swap', emoji: '🟤' },
    { at: 5.35, actor: 'clay', do: 'squash', amount: 0.6, dur: 0.6 },
    // 停一拍……屁股底下鼓起來，把他頂開
    { at: 5.9, actor: 'gorilla', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 6.2, actor: 'gorilla', do: 'moveTo', to: { x: KX - 8, y: G }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 6.2, actor: 'clay', do: 'swap', emoji: '🦍' },
    { at: 6.2, actor: 'clay', do: 'scaleTo', amount: 2, dur: 0.45, ease: 'back' },
    { at: 6.2, actor: 'clay', do: 'moveTo', to: { x: CX + 20, y: CG }, dur: 0.45, ease: 'out' },
    // 小猴子左看右看
    { at: 6.75, actor: 'monkey', do: 'flip' },
    { at: 7.05, actor: 'monkey', do: 'flip' },
    // ④ 拍胸脯，黏土大猩猩也拍胸脯
    { at: 7.2, actor: 'gorilla', do: 'scaleTo', amount: 1.2, dur: 0.3, ease: 'back' },
    { at: 7.2, actor: 'gorilla', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.4, actor: 'clay', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.6, actor: 'gorilla', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: 7.8, actor: 'clay', do: 'shake', amount: 0.5, dur: 0.3 },
    // ⑤ 小猴子跳到黏土大猩猩頭上
    { at: 8.0, actor: 'monkey', do: 'moveTo', to: { x: CX + 22, y: MG - 18 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 8.6, actor: 'monkey', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'monkey', emoji: '🍌', dur: 1.0 },
    { at: 1.4, kind: 'puff', actor: 'clay', n: 8, dur: 0.5 },
    { at: 1.6, kind: 'burst', actor: 'clay', emoji: '✨', n: 5, dur: 0.5 },
    { at: 2.5, kind: 'burst', actor: 'monkey', n: 1, dx: -4, dur: 0.35 },
    { at: 2.6, kind: 'pop', actor: 'monkey', emoji: '😖', dur: 0.6 },
    { at: 3.75, kind: 'puff', actor: 'clay', n: 6, dur: 0.4 },
    { at: 3.9, kind: 'pop', actor: 'monkey', emoji: '😑', dur: 0.5 },
    { at: 4.4, kind: 'puff', actor: 'clay', n: 6, dur: 0.4 },
    { at: 4.5, kind: 'pop', actor: 'monkey', emoji: '🙄', dur: 0.5 },
    { at: 4.6, kind: 'pop', actor: 'gorilla', emoji: '💢', dur: 0.5 },
    { at: 5.35, kind: 'puff', actor: 'gorilla', n: 18, dur: 0.8 },
    { at: 5.5, kind: 'sweat', actor: 'gorilla' },
    { at: 5.9, kind: 'pop', actor: 'gorilla', emoji: '❗', dur: 0.4 },
    { at: 6.6, kind: 'pop', actor: 'monkey', emoji: '❓', dur: 0.8 },
    { at: 7.2, kind: 'burst', actor: 'gorilla', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.1, kind: 'burst', actor: 'gorilla', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 2.5, dur: 0.35, do: 'punch', amount: 0.15, to: { x: 98, y: 64 } },
    { at: 5.35, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: 6.2, dur: 0.35, do: 'shake', amount: 0.8 },
    { at: 7.0, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 77, y: 62 } },
  ],
  lights: [
    { at: 4.6, dur: 0.4, level: 0.2 },
    { at: 5.35, dur: 0.05, level: -0.35 },
    { at: 5.4, dur: 0.3, level: 0.2 },
    { at: 6.2, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.4, sfx: 'plop' },
    { at: 1.6, sfx: 'poof' },
    { at: 2.5, sfx: 'bonk' },
    { at: 3.75, sfx: 'poof' },
    { at: 4.4, sfx: 'poof' },
    { at: 4.95, sfx: 'whoosh' },
    { at: 5.35, sfx: 'crack' },
    { at: 6.2, sfx: 'boing' },
    { at: 7.25, say: '變形金剛' },
    { at: 8.1, sfx: 'cheer' },
  ],
})
