import type { Clip } from '../clip'

// 矮：高高的玩具機器人在比牠還高的塔旁邊秀肌肉，矮矮的小恐龍抬頭看到脖子痠。機器人衝過來，小恐龍一蹲就讓牠衝過頭；
// 第二次更快，小恐龍只伸出一隻大腳——機器人像大樹一樣倒下，砰！震垮的高塔倒成矮矮的「矮」。小恐龍爬上肚子比高還是比不過，機器人一坐起來，牠就站到機器人頭上變最高。矮、矮、矮小
const clip: Clip = {
  char: '矮',
  meta: { theme: '高機器人對矮恐龍', cast: '玩具機器人＋橡膠恐龍＋橘色高塔', gags: ['大小對比', '一蹲讓牠衝過頭', '伸腳絆倒像大樹倒下', '站到頭上變最高'] },
  duration: 10,
  bg: { top: '#FFE8CC', bottom: '#FFF4E6', floor: '#E6C79C', scenery: 'desert' },
  actors: [
    { id: 't1', emoji: '🟧', x: 146, y: 71.5, size: 7 },
    { id: 't2', emoji: '🟧', x: 146, y: 65, size: 7 },
    { id: 't3', emoji: '🟧', x: 146, y: 58.5, size: 7 },
    { id: 't4', emoji: '🟧', x: 146, y: 52, size: 7 },
    { id: 'robot', emoji: 'hero:robot/happy', x: 122, y: 69.4, size: 18 },
    { id: 'dino', emoji: 'hero:dino/idle', x: 40, y: 72.4, size: 11, hidden: true, flip: true },
  ],
  moves: [
    // 機器人秀肌肉
    { at: 0.1, actor: 'robot', do: 'hop', amount: 3, dur: 0.35 },
    { at: 0.5, actor: 'robot', do: 'squash', amount: -0.15, dur: 0.4 },
    // 小恐龍搖搖擺擺走進來，抬頭看
    { at: 0.3, actor: 'dino', do: 'enter', from: { x: -12, y: 72.4 }, dur: 0.7, ease: 'out' },
    { at: 0.3, actor: 'dino', do: 'bounce', amount: 1.5, times: 3, dur: 0.7 },
    { at: 1.1, actor: 'dino', do: 'tilt', amount: -15, dur: 0.5 },
    { at: 1.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 1.5, actor: 'dino', do: 'hop', amount: 1.5, dur: 0.25 },
    // 第一次衝：小恐龍一蹲，機器人衝過頭
    { at: 2.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 2.1, actor: 'robot', do: 'moveTo', to: { x: 12, y: 69.4 }, dur: 0.6, anticipate: 4, ease: 'in' },
    { at: 2.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 2.35, actor: 'dino', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 2.7, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.3 },
    // 轉身、跺腳、蓄力更大
    { at: 3.05, actor: 'robot', do: 'flip' },
    { at: 3.1, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.35, actor: 'robot', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 3.35, actor: 'robot', do: 'shake', amount: 1, dur: 0.4 },
    // 小恐龍往旁邊一步，伸出大腳
    { at: 3.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 3.3, actor: 'dino', do: 'moveTo', to: { x: 46, y: 72.4 }, dur: 0.25 },
    // 第二次衝——絆倒
    { at: 3.8, actor: 'robot', do: 'moveTo', to: { x: 50, y: 69.4 }, dur: 0.25, ease: 'in' },
    { at: 4.05, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 4.05, actor: 'robot', do: 'moveTo', to: { x: 74, y: 52 }, dur: 0.25, ease: 'out' },
    // 空中定格一拍……像大樹一樣倒下
    { at: 4.6, actor: 'robot', do: 'moveTo', to: { x: 116, y: 62 }, dur: 0.4, ease: 'in' },
    { at: 4.6, actor: 'robot', do: 'rotateTo', amount: 90, dur: 0.4, ease: 'in' },
    { at: 5.0, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 震垮的高塔
    { at: 5.05, actor: 't4', do: 'moveTo', to: { x: 150, y: 40 }, dur: 0.2, ease: 'out' },
    { at: 5.05, actor: 't3', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 5.2, actor: 't4', do: 'vanish', dur: 0.2 },
    { at: 5.6, actor: 't3', do: 'vanish', dur: 0.2 },
    { at: 5.9, actor: 't2', do: 'vanish', dur: 0.2 },
    { at: 6.2, actor: 't1', do: 'vanish', dur: 0.2 },
    // 小恐龍爬上機器人肚子，伸長脖子比高
    { at: 6.55, actor: 'dino', do: 'moveTo', to: { x: 124, y: 60 }, dur: 0.6, arc: 14 },
    { at: 7.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 7.2, actor: 'dino', do: 'squash', amount: -0.35, dur: 0.6 },
    // 機器人一坐起來，小恐龍站到牠頭上
    { at: 8.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 8.1, actor: 'robot', do: 'rotateTo', amount: -90, dur: 0.35, ease: 'back' },
    { at: 8.1, actor: 'robot', do: 'moveTo', to: { x: 120, y: 69.4 }, dur: 0.35 },
    { at: 8.1, actor: 'dino', do: 'moveTo', to: { x: 120, y: 56.3 }, dur: 0.4, arc: 10 },
    { at: 8.5, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 8.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 8.75, actor: 'dino', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 塔的橘色積木倒成矮矮的字：矢、禾、女
    { at: 5.1, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 't4', color: '#F76707' },
    { at: 5.6, dur: 0.6, strokes: [5, 6, 7, 8, 9], from: 't3', color: '#F76707' },
    { at: 6.1, dur: 0.45, strokes: [10, 11, 12], from: 't1', color: '#E8590C' },
  ],
  glyph: [{ at: 5.05, dur: 0.4, do: 'shake' }, { at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'robot', emoji: '💪', dur: 0.6 },
    { at: 1.2, kind: 'pop', actor: 'dino', emoji: '😮', dur: 0.5 },
    { at: 2.1, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 2.7, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 2.8, kind: 'pop', actor: 'dino', emoji: '😆', dur: 0.5 },
    { at: 3.15, kind: 'pop', actor: 'robot', emoji: '💢', dur: 0.5 },
    { at: 3.35, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 4.1, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.5 },
    { at: 5.0, kind: 'burst', actor: 'robot', dy: 6 },
    { at: 5.0, kind: 'puff', actor: 'robot', dur: 0.6 },
    { at: 5.4, kind: 'dizzy', actor: 'robot', dy: 6, dur: 1.4 },
    { at: 7.4, kind: 'sweat', actor: 'dino' },
    { at: 8.85, kind: 'pop', actor: 'dino', emoji: '😎', dur: 0.6 },
  ],
  camera: [
    { at: 4.1, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 74, y: 52 } },
    { at: 5.0, dur: 0.4, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 0.3, sfx: 'tap' },
    { at: 1.55, say: '矮' },
    { at: 2.1, sfx: 'whoosh' },
    { at: 2.7, sfx: 'slide' },
    { at: 3.1, sfx: 'bonk' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 4.1, sfx: 'boing' },
    { at: 5.0, sfx: 'rumble' },
    { at: 6.6, say: '矮' },
    { at: 7.4, say: '矮小' },
    { at: 8.5, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
