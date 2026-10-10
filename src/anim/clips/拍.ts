import type { Clip } from '../clip'

// 拍：章魚幫長頸鹿和烏龜拍照。第一張長頸鹿的頭跑出畫面（只拍到腳），第二張長頸鹿蹲下了、烏龜卻縮進殼裡（只拍到石頭），
// 第三張一隻鸚鵡衝進來亂入。章魚氣到照片全飛出來變成「拍」。最後大家擺好姿勢自拍——鸚鵡又亂入。拍、拍、拍照
const clip: Clip = {
  char: '拍',
  meta: { theme: '拍照', cast: '章魚攝影師＋長頸鹿＋烏龜＋鸚鵡', gags: ['每張都出糗', '亂入', '照片結果泡泡', '又亂入'] },
  duration: 10,
  bg: { top: '#FFF0F6', bottom: '#FFDCEA', floor: '#E8D5C0', scenery: 'room' },
  actors: [
    { id: 'giraffe', emoji: '🦒', x: 124, y: 66.9, size: 24, hidden: true },
    { id: 'turtle', emoji: '🐢', x: 142, y: 71.8, size: 12.5, hidden: true },
    { id: 'octo', emoji: '🐙', x: 18, y: 70.2, size: 16.2, hidden: true },
    { id: 'cam', emoji: '📷', x: 31, y: 64, size: 10, hidden: true, float: true },
    { id: 'parrot', emoji: '🦜', x: 130, y: 50, size: 12.5, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'octo', do: 'enter', dur: 0.6 },
    { at: 0.2, actor: 'giraffe', do: 'pop' }, { at: 0.3, actor: 'turtle', do: 'pop' },
    { at: 0.6, actor: 'cam', do: 'pop' },
    // 第二張：長頸鹿蹲下，烏龜縮進殼裡
    { at: 2.7, actor: 'giraffe', do: 'squash', amount: 0.45, dur: 1.0 },
    { at: 2.81, actor: 'turtle', do: 'swap', emoji: '🪨' },
    { at: 3.99, actor: 'turtle', do: 'swap', emoji: '🐢' },
    // 第三張：鸚鵡亂入
    { at: 4.2, actor: 'giraffe', do: 'squash', amount: 0.45, dur: 1.0 },
    { at: 4.63, actor: 'parrot', do: 'enter', from: { x: 180, y: 30 }, dur: 0.3 },
    { at: 4.96, actor: 'parrot', do: 'bounce', dur: 0.3, times: 2, amount: 2 },
    { at: 5.39, actor: 'parrot', do: 'moveTo', to: { x: -20, y: 20 }, dur: 0.7 },
    { at: 5.28, actor: 'octo', do: 'shake', dur: 0.4, amount: 1 },
    // 自拍：設好計時，衝過去一起擺姿勢
    { at: 6.7, actor: 'cam', do: 'shake', dur: 0.6, amount: 0.4 },
    { at: 6.7, actor: 'octo', do: 'moveTo', to: { x: 146, y: 70.2 }, dur: 0.45, arc: 16 },
    { at: 7.2, actor: 'parrot', do: 'enter', from: { x: 140, y: -10 }, dur: 0.01 },
    { at: 7.2, actor: 'parrot', do: 'moveTo', to: { x: 136, y: 44 }, dur: 0.2 },
    { at: 7.76, actor: 'parrot', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
    { at: 8.48, actor: 'octo', do: 'moveTo', to: { x: 120, y: 30 }, dur: 0.4, arc: 10 },
    { at: 8.48, actor: 'parrot', do: 'moveTo', to: { x: 180, y: 10 }, dur: 0.4 },
    { at: 8.84, actor: 'octo', do: 'moveTo', to: { x: 146, y: 70.2 }, dur: 0.4 },
    { at: 9.19, actor: 'octo', do: 'squash', amount: 0.35, dur: 0.3 },
  ],
  builds: [
    // 章魚氣到把照片全甩出來
    { at: 5.6, dur: 0.5, strokes: [0, 1, 2], from: 'cam', color: '#E2603A' },
    { at: 5.9, dur: 0.7, strokes: [3, 4, 5, 6, 7], from: 'cam', color: '#8A4FC9' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1, kind: 'bubble', actor: 'octo', emoji: '😁', dur: 0.5 },
    { at: 2, kind: 'bubble', actor: 'cam', emoji: '🦵', dur: 0.8 },
    { at: 2.6, kind: 'pop', actor: 'octo', emoji: '😑', dur: 0.4 },
    { at: 3.61, kind: 'bubble', actor: 'cam', emoji: '🪨', dur: 0.8 },
    { at: 5.22, kind: 'bubble', actor: 'cam', emoji: '🦜', dur: 0.6 },
    { at: 5.28, kind: 'pop', actor: 'octo', emoji: '💢', dur: 0.5 },
    { at: 5.6, kind: 'burst', actor: 'cam', emoji: '🖼️', n: 5, dur: 0.6 },
    { at: 7.85, kind: 'bubble', actor: 'cam', emoji: '🦜', dur: 0.8 },
    { at: 7.94, kind: 'pop', actor: 'octo', emoji: '💢', dur: 0.5, dx: -12 },
    { at: 9.28, kind: 'dizzy', actor: 'octo', dur: 0.8 },
  ],
  lights: [
    { at: 1.52, dur: 0.05, level: -0.9 }, { at: 1.59, dur: 0.3, level: 0 },
    { at: 3.13, dur: 0.05, level: -0.9 }, { at: 3.2, dur: 0.3, level: 0 },
    { at: 4.85, dur: 0.05, level: -0.9 }, { at: 4.91, dur: 0.3, level: 0 },
    { at: 7.4, dur: 0.05, level: -0.9 }, { at: 7.46, dur: 0.3, level: 0 },
  ],
  camera: [
    { at: 8.48, dur: 0.6, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 1.52, sfx: 'tap' },
    { at: 1.63, say: '拍' },
    { at: 3.13, sfx: 'tap' },
    { at: 4.63, sfx: 'whoosh' },
    { at: 4.85, sfx: 'tap' },
    { at: 5.6, sfx: 'poof' },
    { at: 6.5, say: '拍' },
    { at: 6.7, sfx: 'blip' }, { at: 6.9, sfx: 'blip' },
    { at: 7.4, sfx: 'tap' },
    { at: 7.45, say: '拍照' },
    { at: 8.48, sfx: 'whoosh' },
    { at: 9.19, sfx: 'bonk' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
