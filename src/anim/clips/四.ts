import type { Clip } from '../clip'
import { ride } from '../helpers'

// 四：橡膠恐龍手太短，連地上的方形充氣圈都撿不起來，只好肚子一趴套上去當相撲腰帶，跟揮著兩根泡棉棒的長短手機器人對決。
// 機器人揮空自己轉兩圈，恐龍肚子衝撞也衝過頭；兩個額頭「咚」撞在一起，方形圈彈飛變成「囗」，泡棉棒掉進框裡變成「儿」。機器人在空中畫一個方形；恐龍想揮手，手太短，只好抬腳。四、四、四方形
const clip: Clip = {
  char: '四',
  meta: { theme: '恐龍相撲', cast: '橡膠恐龍＋玩具機器人＋方形充氣圈＋泡棉棒', gags: ['手太短撿不起來', '揮空自己轉圈', '衝過頭', '額頭互撞', '握手改握腳'] },
  duration: 10,
  bg: { top: '#FFF3C4', bottom: '#FFF9E3', floor: '#F1D58A', scenery: 'room' },
  actors: [
    { id: 'robot', emoji: 'hero:robot/idle', x: 134, y: 71, size: 14, hidden: true },
    { id: 'stick1', emoji: '🪄', x: 127, y: 66, size: 7, hidden: true },
    { id: 'stick2', emoji: '🏑', x: 142, y: 64, size: 8, hidden: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 22, y: 71, size: 14, hidden: true, flip: true },
    { id: 'ring', emoji: '🔲', x: 42, y: 73, size: 8, tint: 'invert(1) sepia(1) saturate(8) hue-rotate(180deg)' },
    { id: 'square', emoji: '🟦', x: 134, y: 44, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'dino', do: 'enter', from: { x: -15, y: 71 }, dur: 0.5, ease: 'out' },
    ...ride([
      { at: 0, actor: 'robot', do: 'enter', from: { x: 180, y: 71 }, dur: 0.5, ease: 'out' },
    ], 'stick1', -5, 14),
    { at: 0, actor: 'stick2', do: 'enter', from: { x: 188, y: 64 }, dur: 0.5, ease: 'out' },
    // 機器人馬達太強，棒子甩得呼呼響
    { at: 0.5, actor: 'stick1', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 0.6, actor: 'stick2', do: 'tilt', amount: -50, dur: 0.35 },
    // 恐龍想撿方形圈，小短手在上面一直揮，搆不到
    { at: 0.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 0.7, actor: 'dino', do: 'moveTo', to: { x: 34, y: 71 }, dur: 0.3 },
    { at: 1.0, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.4 },
    // 乾脆肚子一趴套上去
    { at: 1.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 1.45, actor: 'dino', do: 'moveTo', to: { x: 42, y: 71 }, arc: 8, dur: 0.35 },
    { at: 1.8, actor: 'ring', do: 'moveTo', to: { x: 42, y: 70 }, dur: 0.15 },
    { at: 1.8, actor: 'ring', do: 'scaleTo', amount: 1.5, dur: 0.15 },
    ...ride([
      { at: 1.8, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: 2.1, actor: 'dino', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    ], 'ring', -1, 14),
    // 機器人大風車衝過來——揮空，自己轉兩圈
    ...ride([
      { at: 2.7, actor: 'robot', do: 'moveTo', to: { x: 66, y: 71 }, dur: 0.4, anticipate: 4, ease: 'in' },
      { at: 3.1, actor: 'robot', do: 'spin', times: 2, dur: 0.6 },
      { at: 3.7, actor: 'robot', do: 'moveTo', to: { x: 96, y: 71 }, dur: 0.35, ease: 'out' },
    ], 'stick1', -5, 14),
    { at: 2.7, actor: 'stick2', do: 'moveTo', to: { x: 74, y: 64 }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 3.1, actor: 'stick2', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.7, actor: 'stick2', do: 'moveTo', to: { x: 104, y: 64 }, dur: 0.35, ease: 'out' },
    { at: 3.1, actor: 'dino', do: 'squash', amount: 0.4, dur: 0.35 },
    { at: 3.1, actor: 'ring', do: 'hop', amount: -4, dur: 0.35 },
    { at: 3.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 恐龍肚子衝撞——機器人晃開，恐龍衝過頭
    ...ride([
      { at: 4.0, actor: 'dino', do: 'moveTo', to: { x: 124, y: 71 }, dur: 0.45, anticipate: 4, ease: 'in' },
      { at: 4.45, actor: 'dino', do: 'spin', times: 1, dur: 0.4 },
      { at: 4.9, actor: 'dino', do: 'flip' },
    ], 'ring', -1, 14),
    ...ride([{ at: 4.15, actor: 'robot', do: 'hop', amount: 12, dur: 0.4 }], 'stick1', -5, 14),
    { at: 4.15, actor: 'stick2', do: 'hop', amount: 12, dur: 0.4 },
    { at: 4.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 4.8, actor: 'robot', do: 'flip' },
    // 對看一拍，同時撲上去，額頭「咚」！
    ...ride([{ at: 5.2, actor: 'dino', do: 'moveTo', to: { x: 108, y: 71 }, dur: 0.2, ease: 'in' }], 'ring', -1, 14),
    { at: 5.2, actor: 'robot', do: 'moveTo', to: { x: 98, y: 71 }, dur: 0.2, ease: 'in' },
    { at: 5.4, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.4, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.25 },
    // 方形圈彈上天、泡棉棒脫手
    { at: 5.45, actor: 'ring', do: 'moveTo', to: { x: 80, y: 22 }, dur: 0.3, ease: 'out' },
    { at: 5.45, actor: 'ring', do: 'spin', times: 1, dur: 0.3 },
    { at: 5.45, actor: 'stick1', do: 'moveTo', to: { x: 70, y: 30 }, dur: 0.35, ease: 'out' },
    { at: 5.45, actor: 'stick2', do: 'moveTo', to: { x: 90, y: 30 }, dur: 0.35, ease: 'out' },
    { at: 5.8, actor: 'ring', do: 'vanish', dur: 0.2 },
    { at: 6.1, actor: 'stick1', do: 'vanish', dur: 0.2 },
    { at: 6.3, actor: 'stick2', do: 'vanish', dur: 0.2 },
    // 兩個彈開、坐倒在字的兩邊
    { at: 5.5, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 5.5, actor: 'robot', do: 'moveTo', to: { x: 136, y: 71 }, arc: 18, dur: 0.6, ease: 'out' },
    { at: 5.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 5.5, actor: 'dino', do: 'moveTo', to: { x: 24, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 6.1, actor: 'robot', do: 'flip' },
    // 機器人用長手在空中畫一個方形，點四個角
    { at: 7.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 7.05, actor: 'square', do: 'pop', dur: 0.3 },
    { at: 7.4, actor: 'square', do: 'flash', dur: 0.8 },
    { at: 7.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.5, actor: 'dino', do: 'tilt', amount: 12, dur: 0.3 },
    { at: 7.85, actor: 'dino', do: 'tilt', amount: 12, dur: 0.3 },
    // 回馬槍：恐龍想揮手——手太短；乾脆抬起大腳丫揮一揮
    { at: 8.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 8.35, actor: 'dino', do: 'shake', amount: 1, dur: 0.4 },
    { at: 8.85, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 8.9, actor: 'dino', do: 'tilt', amount: -28, dur: 0.7 },
    { at: 9.2, actor: 'robot', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 9.2, actor: 'square', do: 'vanish', dur: 0.3 },
  ],
  builds: [
    // 方形圈落下 → 外框囗；泡棉棒掉進框裡 → 儿
    { at: 5.8, dur: 0.6, strokes: [0, 1, 4], from: 'ring', color: '#1C7ED6' },
    { at: 6.1, dur: 0.5, strokes: [2, 3], from: 'stick1', color: '#1864AB' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'robot', emoji: '😎', dur: 0.5 },
    { at: 1.1, kind: 'sweat', actor: 'dino' },
    { at: 1.3, kind: 'pop', actor: 'dino', emoji: '😤', dur: 0.4 },
    { at: 2.1, kind: 'puff', actor: 'dino', dur: 0.5 },
    { at: 3.1, kind: 'burst', actor: 'robot', emoji: '💨', n: 5, dur: 0.5 },
    { at: 3.7, kind: 'dizzy', actor: 'robot', dur: 0.9 },
    { at: 4.5, kind: 'puff', actor: 'dino', dur: 0.5 },
    { at: 5.0, kind: 'pop', actor: 'dino', emoji: '😠', dur: 0.4 },
    { at: 5.0, kind: 'pop', actor: 'robot', emoji: '😠', dur: 0.4 },
    { at: 5.4, kind: 'burst', actor: 'dino', n: 1, dx: -6, dur: 0.5 },
    { at: 6.2, kind: 'dizzy', actor: 'dino', dur: 0.8 },
    { at: 6.2, kind: 'dizzy', actor: 'robot', dur: 0.8 },
    { at: 7.1, kind: 'pop', x: 128, y: 38, emoji: '✨', dur: 0.3 },
    { at: 7.3, kind: 'pop', x: 140, y: 38, emoji: '✨', dur: 0.3 },
    { at: 7.5, kind: 'pop', x: 140, y: 50, emoji: '✨', dur: 0.3 },
    { at: 7.7, kind: 'pop', x: 128, y: 50, emoji: '✨', dur: 0.3 },
    { at: 8.4, kind: 'sweat', actor: 'dino' },
    { at: 9.0, kind: 'pop', actor: 'robot', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 2.7, dur: 0.3, do: 'follow', actor: 'robot', amount: 1.3 },
    { at: 3.5, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.4, dur: 0.4, do: 'punch', amount: 0.15, to: { x: 103, y: 60 } },
  ],
  cues: [
    { at: 0.5, sfx: 'whoosh' },
    { at: 1.8, sfx: 'boing' },
    { at: 2.0, say: '四' },
    { at: 2.7, sfx: 'whoosh' },
    { at: 3.1, sfx: 'slide' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.45, sfx: 'slide' },
    { at: 5.4, sfx: 'bonk' },
    { at: 6.6, say: '四' },
    { at: 7.2, say: '四方形' },
    { at: 7.1, sfx: 'blip' },
    { at: 8.4, sfx: 'tap' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
