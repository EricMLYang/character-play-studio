import type { Clip } from '../clip'

// 鵝：披風英雄和布忍者抱著羽毛枕頭對決。英雄一揮，披風蓋住頭，轉一圈揮空；忍者丟煙霧彈，在自己手上爆開，也揮空轉一圈。
// 兩個轉著轉著「咚」地撞頭，枕頭爆開，英雄的羽毛落成「我」、忍者的羽毛落成「鳥」。小天鵝滑過去；最後一根羽毛飄到英雄鼻子上——哈啾！鵝、鵝、天鵝
const clip: Clip = {
  char: '鵝',
  meta: { theme: '枕頭大戰', cast: '披風英雄＋布忍者＋羽毛枕頭＋天鵝', gags: ['披風蓋住頭揮空', '煙霧彈在自己手上爆', '轉圈撞頭', '回馬槍羽毛搔鼻子打噴嚏'] },
  duration: 10,
  bg: { top: '#E1F7EE', bottom: '#F2FCF7', floor: '#B8E2CC', scenery: 'hills' },
  actors: [
    { id: 'cape', emoji: 'hero:cape/idle', x: 30, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 132, y: 71.5, size: 13, hidden: true },
    { id: 'pL', emoji: '☁️', x: 37, y: 67, size: 9, hidden: true, float: true, tint: 'sepia(1) saturate(5) hue-rotate(-20deg)' },
    { id: 'pR', emoji: '☁️', x: 125, y: 68, size: 9, hidden: true, float: true, tint: 'sepia(1) saturate(5) hue-rotate(-20deg)' },
    { id: 'swan', emoji: '🦢', x: -15, y: 75, size: 8, flip: true },
    { id: 'feather', emoji: '🪶', x: 30, y: -10, size: 5, float: true },
  ],
  moves: [
    // 對峙：英雄抱枕頭登場，忍者躲在枕頭後面（一眼就看到）
    { at: 0, actor: 'cape', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.5 },
    { at: 0, actor: 'pL', do: 'enter', from: { x: -8, y: 67 }, dur: 0.5 },
    { at: 0.1, actor: 'ninja', do: 'pop', dur: 0.3 },
    { at: 0.1, actor: 'pR', do: 'pop', dur: 0.3 },
    { at: 0.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 0.7, actor: 'cape', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 0.7, actor: 'cape', do: 'squash', amount: -0.2, dur: 0.3 },
    // 披風蓋住頭——甩開，咧嘴笑
    { at: 1.1, actor: 'cape', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 1.1, actor: 'cape', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 1.5, actor: 'cape', do: 'swap', emoji: 'hero:cape/happy' },
    // 英雄大力一揮，披風又蓋住臉，轉一圈揮空
    { at: 1.8, actor: 'cape', do: 'moveTo', to: { x: 54, y: 70.7 }, dur: 0.3, anticipate: 4 },
    { at: 1.8, actor: 'pL', do: 'moveTo', to: { x: 61, y: 67 }, dur: 0.3, anticipate: 4 },
    { at: 2.1, actor: 'cape', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 2.1, actor: 'cape', do: 'spin', times: 1, dur: 0.5 },
    { at: 2.1, actor: 'pL', do: 'spin', times: 1, dur: 0.5 },
    // 忍者丟煙霧彈——在自己手上爆開，揮空，反方向轉一圈
    { at: 2.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 2.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 2.95, actor: 'ninja', do: 'moveTo', to: { x: 106, y: 71.5 }, dur: 0.3 },
    { at: 2.95, actor: 'pR', do: 'moveTo', to: { x: 99, y: 68 }, dur: 0.3 },
    { at: 3.25, actor: 'ninja', do: 'spin', times: -1, dur: 0.5 },
    { at: 3.25, actor: 'pR', do: 'spin', times: -1, dur: 0.5 },
    // 兩個轉著轉著撞在一起——咚！
    { at: 3.4, actor: 'cape', do: 'moveTo', to: { x: 74, y: 70.7 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'pL', do: 'moveTo', to: { x: 68, y: 66 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'cape', do: 'spin', times: 1, dur: 0.35 },
    { at: 3.4, actor: 'ninja', do: 'moveTo', to: { x: 86, y: 71.5 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'pR', do: 'moveTo', to: { x: 92, y: 67 }, dur: 0.35, ease: 'in' },
    { at: 3.4, actor: 'ninja', do: 'spin', times: -1, dur: 0.35 },
    { at: 3.75, actor: 'cape', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.75, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.3 },
    // 枕頭爆開
    { at: 4.05, actor: 'pL', do: 'vanish', dur: 0.15 },
    { at: 4.05, actor: 'pR', do: 'vanish', dur: 0.15 },
    // 暈暈地往兩邊坐倒
    { at: 4.15, actor: 'cape', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 4.15, actor: 'cape', do: 'moveTo', to: { x: 28, y: 70.7 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 4.15, actor: 'ninja', do: 'moveTo', to: { x: 134, y: 71.5 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 4.6, actor: 'cape', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.6, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.25 },
    // 小天鵝從下面滑過去
    { at: 6.2, actor: 'swan', do: 'moveTo', to: { x: 175, y: 75 }, dur: 2.0, ease: 'linear' },
    // 握手和好
    { at: 6.4, actor: 'cape', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 6.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 6.5, actor: 'cape', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.6, actor: 'ninja', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：最後一根羽毛飄下來，搔到英雄的鼻子——哈啾！忍者嚇得又躲起來
    { at: 7.9, actor: 'feather', do: 'moveTo', to: { x: 26, y: 60 }, dur: 1.0, ease: 'out' },
    { at: 7.9, actor: 'feather', do: 'tilt', amount: 25, dur: 1.0 },
    { at: 8.9, actor: 'cape', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 9.2, actor: 'cape', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 9.2, actor: 'cape', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 9.2, actor: 'feather', do: 'moveTo', to: { x: 40, y: 30 }, dur: 0.6, ease: 'out' },
    { at: 9.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 9.3, actor: 'ninja', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 英雄的羽毛往左落 → 「我」；忍者的羽毛往右落 → 「鳥」
    { at: 4.1, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'pL', color: '#F76707' },
    { at: 4.6, dur: 0.95, strokes: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], from: 'pR', color: '#E8590C' },
  ],
  glyph: [{ at: 5.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'ninja', emoji: '👁️', dur: 0.6, dx: -4 },
    { at: 1.1, kind: 'pop', actor: 'cape', emoji: '🙈', dur: 0.4 },
    { at: 2.1, kind: 'pop', actor: 'cape', emoji: '🙈', dur: 0.4 },
    { at: 2.9, kind: 'puff', actor: 'ninja', dur: 0.6 },
    { at: 2.9, kind: 'burst', actor: 'ninja', emoji: '💨', n: 4, dur: 0.5 },
    { at: 3.75, kind: 'burst', x: 80, y: 60, n: 1, dur: 0.35 },
    { at: 4.05, kind: 'burst', x: 70, y: 60, emoji: '🪶', n: 7, dur: 0.6 },
    { at: 4.05, kind: 'burst', x: 92, y: 60, emoji: '🪶', n: 7, dur: 0.6 },
    { at: 4.6, kind: 'dizzy', actor: 'cape', dur: 1.2 },
    { at: 4.6, kind: 'dizzy', actor: 'ninja', dur: 1.2 },
    { at: 7.2, kind: 'pop', actor: 'swan', emoji: '🎵', dur: 0.6 },
    { at: 6.6, kind: 'pop', actor: 'cape', emoji: '🤝', dur: 0.7 },
    { at: 9.2, kind: 'burst', actor: 'cape', emoji: '💦', n: 4, dur: 0.5 },
  ],
  camera: [
    // 撞頭推近，爆開時退回全景
    { at: 3.75, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 80, y: 64 } },
    { at: 9.2, dur: 0.5, do: 'shake', amount: 0.8 },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.9, say: '鵝' },
    { at: 2.9, sfx: 'poof' },
    { at: 3.75, sfx: 'bonk' },
    { at: 4.05, sfx: 'poof' },
    { at: 5.6, say: '鵝' },
    { at: 7.2, say: '天鵝' },
    { at: 9.2, sfx: 'achoo' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
