import type { Clip } from '../clip'

// 露：拉布拉多警長吹哨要抓一顆在草地上亂跳的調皮露珠——衝過頭、四腳煞車滑過去；回頭再追，被自己的前腳絆倒翻跟斗，露珠還跳到他鼻子上嘲笑他。
// 他趴低搖屁股、飛撲肚皮「啪」壓下去：噴起的水珠落成上面的「雨」，煞車的滑痕拉成下面的「路」，拼出「露」。
// 唸「露水」時他全身一甩，一串小水珠灑在草地上；最後其中一顆又蹦蹦跳跳逃走了。露、露、露水
const clip: Clip = {
  char: '露',
  meta: { theme: '警長抓露珠', cast: '拉布拉多警長＋調皮露珠', gags: ['衝過頭四腳煞車', '被自己絆倒翻跟斗', '跳到鼻子上嘲笑', '飛撲肚皮壓', '又一顆逃走'] },
  duration: 10,
  bg: { top: '#E6FCF5', bottom: '#FFF9DB', floor: '#B2F2BB', scenery: 'hills' },
  actors: [
    { id: 'dog', emoji: 'hero:sheriff/idle', x: 28, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'drop', emoji: '💧', x: 108, y: 73.6, size: 7 },
    { id: 'd1', emoji: '💧', x: 138, y: 74.5, size: 4, hidden: true },
    { id: 'd2', emoji: '💧', x: 145, y: 74.5, size: 4, hidden: true },
    { id: 'd3', emoji: '💧', x: 152, y: 74.5, size: 4, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'pop', dur: 0.35 },
    // 露珠「啵」跳走；警長瞪大眼、吹哨、指著它
    { at: 0.4, actor: 'drop', do: 'moveTo', to: { x: 128, y: 73.6 }, arc: 10, dur: 0.45 },
    { at: 0.45, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 0.9, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 1.1, actor: 'drop', do: 'bounce', times: 2, amount: 4, dur: 0.6 },
    // 後腳蹬地——衝！
    { at: 1.6, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 1.6, actor: 'dog', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.9, actor: 'dog', do: 'moveTo', to: { x: 138, y: 71.1 }, dur: 0.45, anticipate: 4, ease: 'in' },
    // 露珠往反方向跳走，警長四腳煞車滑過頭
    { at: 1.95, actor: 'drop', do: 'moveTo', to: { x: 48, y: 73.6 }, arc: 12, dur: 0.45 },
    { at: 2.35, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 2.35, actor: 'dog', do: 'moveTo', to: { x: 143, y: 71.1 }, dur: 0.25, ease: 'back' },
    // 回頭再追，被自己的前腳絆倒翻跟斗
    { at: 2.65, actor: 'dog', do: 'flip' },
    { at: 2.65, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 2.7, actor: 'dog', do: 'moveTo', to: { x: 64, y: 71.1 }, dur: 0.45, ease: 'in' },
    { at: 3.15, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 3.15, actor: 'dog', do: 'moveTo', to: { x: 52, y: 71.1 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 3.15, actor: 'dog', do: 'spin', times: -1, dur: 0.4 },
    // 露珠跳到他鼻子上嘲笑，又彈走
    { at: 3.55, actor: 'drop', do: 'moveTo', to: { x: 47, y: 63 }, arc: 6, dur: 0.25 },
    { at: 3.85, actor: 'drop', do: 'moveTo', to: { x: 112, y: 73.6 }, arc: 14, dur: 0.45 },
    // 趴低搖屁股——飛撲！
    { at: 4.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 4.1, actor: 'dog', do: 'flip' },
    { at: 4.15, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.4 },
    { at: 4.15, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 4.55, actor: 'dog', do: 'moveTo', to: { x: 112, y: 71.6 }, arc: 26, dur: 0.5, ease: 'inOut' },
    { at: 5.05, actor: 'dog', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 5.05, actor: 'drop', do: 'vanish', dur: 0.1 },
    { at: 5.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    // 搖搖晃晃站起來，走到旁邊
    { at: 5.6, actor: 'dog', do: 'moveTo', to: { x: 128, y: 71.1 }, dur: 0.45 },
    { at: 6.1, actor: 'dog', do: 'flip' },
    { at: 6.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 「露水」：全身一甩，水珠灑到草地上
    { at: 6.8, actor: 'dog', do: 'shake', amount: 2.5, dur: 0.6 },
    { at: 7.05, actor: 'd1', do: 'pop', dur: 0.25 },
    { at: 7.15, actor: 'd2', do: 'pop', dur: 0.25 },
    { at: 7.25, actor: 'd3', do: 'pop', dur: 0.25 },
    { at: 7.7, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.7, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 回馬槍：最後那顆又蹦蹦跳跳逃走了
    { at: 8.4, actor: 'd3', do: 'moveTo', to: { x: 158, y: 74.5 }, arc: 6, dur: 0.3 },
    { at: 8.7, actor: 'd3', do: 'moveTo', to: { x: 175, y: 74.5 }, arc: 8, dur: 0.35 },
    { at: 8.5, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 8.95, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 8.95, actor: 'dog', do: 'squash', amount: -0.15, dur: 0.3 },
  ],
  builds: [
    // 噴起來的水珠落成「雨」；煞車滑痕拉成「路」
    { at: 5.1, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'drop', style: 'drop', color: '#1971C2' },
    { at: 5.3, dur: 0.85, strokes: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], from: 'dog', color: '#1971C2' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.45, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
    { at: 0.9, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.6 },
    { at: 1.15, kind: 'pop', actor: 'drop', emoji: '✨', dur: 0.4 },
    { at: 1.6, kind: 'puff', actor: 'dog', dur: 0.4 },
    { at: 2.35, kind: 'puff', actor: 'dog', dur: 0.5 },
    { at: 3.3, kind: 'dizzy', actor: 'dog', dur: 0.8 },
    { at: 3.6, kind: 'pop', actor: 'drop', emoji: '😝', dur: 0.5 },
    { at: 4.2, kind: 'pop', actor: 'dog', emoji: '😛', dur: 0.4 },
    { at: 5.05, kind: 'burst', actor: 'dog', emoji: '💧', n: 8, dur: 0.6 },
    { at: 6.85, kind: 'burst', actor: 'dog', emoji: '💧', n: 6, dur: 0.6 },
    { at: 7.25, kind: 'pop', actor: 'd2', emoji: '✨', dur: 0.4 },
    { at: 7.75, kind: 'pop', actor: 'dog', emoji: '⭐', dx: -6, dur: 0.5 },
    { at: 8.95, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.6 },
  ],
  camera: [
    // 第一次衝刺跟拍；飛撲前退回全景，壓下去時震
    { at: 1.9, dur: 0.25, do: 'follow', actor: 'dog', amount: 1.3 },
    { at: 2.5, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.05, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.4, sfx: 'boing' },
    { at: 0.9, sfx: 'blip' },
    { at: 1.15, say: '露' },
    { at: 1.95, sfx: 'whoosh' },
    { at: 2.35, sfx: 'slide' },
    { at: 3.15, sfx: 'bonk' },
    { at: 3.55, sfx: 'boing' },
    { at: 4.55, sfx: 'whoosh' },
    { at: 5.05, sfx: 'splash' },
    { at: 6.2, say: '露' },
    { at: 6.9, say: '露水' },
    { at: 8.4, sfx: 'boing' },
    { at: 8.95, sfx: 'blip' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
