import type { Clip } from '../clip'

// 窗：玩具海盜想看海，可是積木小隊砌了一面沒有窗戶的實心牆，望遠鏡只看得到磚頭。他抓住綁在牆中間的彈力繩跟積木小隊拔河，
// 鸚鵡不但不幫忙，還降落在繩子正中間、再跳到他鼻子上擋住眼睛。繩子越拉越細——「啪」！兩邊都摔個屁股蹲，牆炸開，磚塊落成「窗」。
// 海盜撿到一個小窗框，探頭一看，終於看到海浪；鸚鵡又把望遠鏡壓下去。積木小隊想疊起來敬禮，又倒了。窗、窗、窗戶
const clip: Clip = {
  char: '窗',
  meta: { theme: '拔河開窗', cast: '玩具海盜＋積木小隊＋鸚鵡＋磚牆', gags: ['望遠鏡只看到牆', '拔河鸚鵡坐在繩子上', '繩子彈斷兩邊摔屁股', '疊起來敬禮又倒'] },
  duration: 10,
  bg: { top: '#BDE7FF', bottom: '#E8F6FF', floor: '#F2D9A0', scenery: 'sea' },
  actors: [
    { id: 'wall', emoji: '🧱', x: 96, y: 64, size: 22 },
    { id: 'brick', emoji: 'hero:brick/idle', x: 134, y: 71, size: 14 },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 30, y: 71, size: 14, hidden: true, flip: true },
    { id: 'frame', emoji: '🪟', x: 31, y: 62, size: 8, hidden: true },
    { id: 'wave', emoji: '🌊', x: 42, y: 70, size: 6, hidden: true },
    { id: 'parrot', emoji: '🦜', x: 32, y: 60, size: 7, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'pirate', do: 'enter', from: { x: -15, y: 71 }, dur: 0.8, ease: 'linear' },
    { at: 0, actor: 'pirate', do: 'bounce', amount: 2, times: 4, dur: 0.8 },
    { at: 0, actor: 'parrot', do: 'enter', from: { x: -13, y: 60 }, dur: 0.8, ease: 'linear' },
    // 拿望遠鏡看——只看到磚頭
    { at: 0.9, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/telescope' },
    { at: 1.4, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 1.45, actor: 'pirate', do: 'squash', amount: 0.25, dur: 0.2 },
    // 抓住繩子，用力往後拉；積木小隊搖頭不要
    { at: 1.9, actor: 'pirate', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 1.95, actor: 'brick', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 2.4, actor: 'pirate', do: 'tilt', amount: -18, dur: 0.5 },
    { at: 2.4, actor: 'pirate', do: 'moveTo', to: { x: 26, y: 71 }, dur: 0.5 },
    { at: 2.6, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 2.7, actor: 'brick', do: 'tilt', amount: 15, dur: 0.5 },
    { at: 2.9, actor: 'pirate', do: 'tilt', amount: -18, dur: 0.5 },
    // 鸚鵡不幫忙，降落在繩子正中間
    { at: 2.9, actor: 'parrot', do: 'moveTo', to: { x: 60, y: 54 }, arc: 8, dur: 0.45 },
    { at: 3.35, actor: 'parrot', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 3.5, actor: 'parrot', do: 'tilt', amount: 15, dur: 0.3 },
    // 再跳到海盜鼻子上，擋住眼睛
    { at: 3.9, actor: 'parrot', do: 'moveTo', to: { x: 31, y: 65 }, arc: 5, dur: 0.3 },
    { at: 3.95, actor: 'pirate', do: 'shake', amount: 1, dur: 0.4 },
    // 繩子越拉越細，停一拍——啪！
    { at: 4.5, actor: 'pirate', do: 'tilt', amount: -22, dur: 0.3 },
    { at: 4.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 4.8, actor: 'pirate', do: 'moveTo', to: { x: 14, y: 71 }, dur: 0.35, ease: 'out' },
    { at: 4.8, actor: 'parrot', do: 'moveTo', to: { x: 22, y: 44 }, dur: 0.4, ease: 'out' },
    { at: 5.15, actor: 'pirate', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 5.15, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 4.8, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.8, actor: 'brick', do: 'moveTo', to: { x: 146, y: 71 }, dur: 0.35, ease: 'out' },
    { at: 5.15, actor: 'brick', do: 'squash', amount: 0.4, dur: 0.25 },
    // 牆炸開
    { at: 4.85, actor: 'wall', do: 'shake', amount: 2, dur: 0.2 },
    { at: 5.05, actor: 'wall', do: 'vanish', dur: 0.2 },
    // 撿到一個小窗框，探頭一看——海浪！
    { at: 6.6, actor: 'frame', do: 'pop', dur: 0.3 },
    { at: 6.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/telescope' },
    { at: 6.8, actor: 'pirate', do: 'moveTo', to: { x: 26, y: 71 }, dur: 0.3 },
    { at: 7.0, actor: 'wave', do: 'pop', dur: 0.3 },
    { at: 7.0, actor: 'wave', do: 'bounce', amount: 2, times: 3, dur: 1.2 },
    { at: 7.5, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    // 鸚鵡停在望遠鏡上，把它壓下去
    { at: 7.8, actor: 'parrot', do: 'moveTo', to: { x: 40, y: 58 }, dur: 0.35 },
    { at: 8.15, actor: 'pirate', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 8.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    // 回馬槍：積木小隊疊起來敬禮——又倒了
    { at: 8.4, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 8.4, actor: 'brick', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.8, actor: 'brick', do: 'tilt', amount: 12, dur: 0.3 },
    { at: 9.1, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 9.1, actor: 'brick', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 9.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 9.4, actor: 'parrot', do: 'shake', amount: 1, dur: 0.4 },
  ],
  builds: [
    // 炸開的磚塊在空中落下：上面的 → 穴、下面的 → 囪
    { at: 5.1, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: 'wall', color: '#1864AB' },
    { at: 5.5, dur: 0.9, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'wall', color: '#1C7ED6' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'pop', actor: 'pirate', emoji: '❓', dur: 0.4 },
    { at: 1.45, kind: 'pop', actor: 'pirate', emoji: '💢', dur: 0.4 },
    { at: 1.8, kind: 'line', actor: 'pirate', dy: 3, target: 'wall', color: '#4DABF7', width: 1.2, dur: 3.0 },
    { at: 2.0, kind: 'pop', actor: 'brick', emoji: '🙅', dur: 0.5 },
    { at: 2.5, kind: 'sweat', actor: 'pirate' },
    { at: 2.6, kind: 'puff', actor: 'pirate', dur: 0.4 },
    { at: 3.5, kind: 'pop', actor: 'parrot', emoji: '😏', dur: 0.4 },
    { at: 4.1, kind: 'pop', actor: 'pirate', emoji: '💢', dx: -6, dur: 0.4 },
    { at: 4.8, kind: 'burst', x: 60, y: 62, n: 1, dur: 0.4 },
    { at: 5.05, kind: 'burst', actor: 'wall', emoji: '🧱', n: 6, dur: 0.5 },
    { at: 5.4, kind: 'dizzy', actor: 'pirate', dur: 0.9 },
    { at: 5.4, kind: 'dizzy', actor: 'brick', dur: 0.9 },
    { at: 7.1, kind: 'pop', actor: 'pirate', emoji: '😍', dx: -6, dur: 0.5 },
    { at: 8.3, kind: 'pop', actor: 'pirate', emoji: '😑', dx: -6, dur: 0.5 },
    { at: 8.45, kind: 'pop', actor: 'brick', emoji: '🫡', dur: 0.4 },
  ],
  camera: [
    { at: 4.1, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 60, y: 58 } },
    { at: 4.8, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 4.85, dur: 0.4, do: 'shake', amount: 1.3 },
  ],
  cues: [
    { at: 1.45, sfx: 'tap' },
    { at: 1.9, say: '窗' },
    { at: 3.35, sfx: 'plop' },
    { at: 4.8, sfx: 'boing' },
    { at: 5.05, sfx: 'crack' },
    { at: 5.15, sfx: 'bonk' },
    { at: 6.45, say: '窗' },
    { at: 7.1, say: '窗戶' },
    { at: 7.1, sfx: 'splash' },
    { at: 9.1, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
