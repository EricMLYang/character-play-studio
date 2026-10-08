import type { Clip } from '../clip'

// 肩：海盜船長肩膀上站著一隻鸚鵡，船長說「寶藏」，鸚鵡學成「香蕉」；船長說「挖」，鸚鵡學成「內褲」；船長叫牠小聲，牠叫得超大聲，羽毛炸飛、地下的寶藏也被震出來。
// 兩個一起聳聳肩；最後鸚鵡終於說對「寶藏」——然後叼著錢袋飛走了。肩、肩、聳肩
const clip: Clip = {
  char: '肩',
  meta: { theme: '海盜尋寶', cast: '海盜船長＋鸚鵡＋寶藏', gags: ['鸚鵡學錯話（模仿）', '叫牠小聲反而超大聲', '一起聳肩', '學對了就把寶藏叼走'] },
  duration: 10,
  bg: { top: '#DDF4FF', bottom: '#B8E6FF', floor: '#EBC98A', scenery: 'hills' },
  actors: [
    { id: 'flag', emoji: '🏴‍☠️', x: 8, y: 71.1, size: 14, hidden: true },
    { id: 'xmark', emoji: '❌', x: 136, y: 75, size: 6, hidden: true, float: true },
    { id: 'bag', emoji: '💰', x: 136, y: 73.2, size: 9, hidden: true },
    { id: 'captain', emoji: '🧔', x: 26, y: 70.3, size: 16, hidden: true },
    { id: 'parrot', emoji: '🦜', x: 36, y: 64, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flag', do: 'pop' },
    { at: 0.1, actor: 'captain', do: 'enter', from: { x: -15, y: 70.3 }, dur: 0.6 },
    { at: 0.5, actor: 'parrot', do: 'enter', from: { x: -10, y: 30 }, dur: 0.8, arc: 6 },
    { at: 0.9, actor: 'xmark', do: 'pop' },
    // 降落在肩膀上
    { at: 1.3, actor: 'parrot', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.3, actor: 'captain', do: 'squash', amount: 0.12, dur: 0.25 },
    // 船長說「寶藏」，鸚鵡學成「香蕉」
    { at: 1.8, actor: 'captain', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 2.5, actor: 'parrot', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 船長說「挖」，鸚鵡學成「內褲」
    { at: 3.2, actor: 'captain', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 3.8, actor: 'parrot', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 4.1, actor: 'captain', do: 'shake', amount: 1.5, dur: 0.4 },
    // 叫牠小聲……牠叫超大聲
    { at: 4.6, actor: 'parrot', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 4.65, actor: 'parrot', do: 'hop', amount: 6, dur: 0.4 },
    { at: 4.65, actor: 'captain', do: 'hop', amount: 8, dur: 0.4 },
    { at: 4.65, actor: 'captain', do: 'squash', amount: -0.25, dur: 0.4 },
    // 地下的寶藏被震出來
    { at: 5.0, actor: 'xmark', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'bag', do: 'pop', dur: 0.3 },
    { at: 5.0, actor: 'bag', do: 'hop', amount: 10, dur: 0.45 },
    { at: 6.1, actor: 'bag', do: 'shake', amount: 1, dur: 0.4 },
    // 一起聳肩
    { at: 7.0, actor: 'captain', do: 'swap', emoji: '🤷‍♂️' },
    { at: 7.0, actor: 'captain', do: 'hop', amount: 3, dur: 0.35 },
    { at: 7.0, actor: 'parrot', do: 'hop', amount: 3, dur: 0.35 },
    { at: 7.4, actor: 'captain', do: 'hop', amount: 3, dur: 0.35 },
    { at: 7.4, actor: 'parrot', do: 'hop', amount: 3, dur: 0.35 },
    { at: 7.9, actor: 'captain', do: 'swap', emoji: '🧔' },
    // 終於說對「寶藏」……叼著錢袋飛走
    { at: 8.0, actor: 'captain', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
    { at: 8.45, actor: 'parrot', do: 'moveTo', to: { x: 136, y: 63 }, arc: 40, dur: 0.4 },
    { at: 8.9, actor: 'parrot', do: 'moveTo', to: { x: 178, y: 12 }, dur: 0.7 },
    { at: 8.9, actor: 'bag', do: 'moveTo', to: { x: 178, y: 20 }, dur: 0.7 },
    { at: 9.1, actor: 'captain', do: 'shake', amount: 2, dur: 0.5 },
  ],
  builds: [
    // 炸飛的羽毛 → 戶；震出來的金幣 → 月
    { at: 4.7, dur: 0.7, strokes: [0, 1, 2, 3], from: 'parrot', color: '#22A06B' },
    { at: 5.2, dur: 0.8, strokes: [4, 5, 6, 7], from: 'bag', color: '#E8A317' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.8, kind: 'bubble', actor: 'captain', emoji: '💰', dur: 0.7 },
    { at: 2.5, kind: 'bubble', actor: 'parrot', emoji: '🍌', dur: 0.7 },
    { at: 2.9, kind: 'sweat', actor: 'captain' },
    { at: 3.2, kind: 'bubble', actor: 'captain', emoji: '⛏️', dur: 0.6 },
    { at: 3.8, kind: 'bubble', actor: 'parrot', emoji: '🩲', dur: 0.7 },
    { at: 4.1, kind: 'pop', actor: 'captain', emoji: '🤫', dur: 0.5 },
    { at: 4.65, kind: 'burst', actor: 'parrot', emoji: '🪶', n: 7, dur: 0.6 },
    { at: 4.7, kind: 'pop', actor: 'captain', emoji: '😵', dur: 0.6 },
    { at: 5.05, kind: 'puff', actor: 'bag' },
    { at: 5.6, kind: 'pop', actor: 'captain', emoji: '❗', dur: 0.5 },
    { at: 7.1, kind: 'bubble', actor: 'parrot', emoji: '🤷', dur: 0.7 },
    { at: 8.0, kind: 'bubble', actor: 'parrot', emoji: '💰', dur: 0.45 },
    { at: 8.1, kind: 'pop', actor: 'captain', emoji: '😃', dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'captain', emoji: '😱', dur: 0.8 },
  ],
  camera: [
    { at: 4.6, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 34, y: 62 } },
    { at: 5.0, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.3, sfx: 'plop' },
    { at: 1.4, say: '肩' },
    { at: 2.5, sfx: 'blip' },
    { at: 3.8, sfx: 'blip' },
    { at: 4.65, sfx: 'crack' },
    { at: 5.0, sfx: 'boing' },
    { at: 6.05, say: '肩' },
    { at: 7.1, say: '聳肩' },
    { at: 8.0, sfx: 'blip' },
    { at: 8.9, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
