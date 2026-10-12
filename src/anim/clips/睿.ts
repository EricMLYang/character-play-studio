import type { Clip } from '../clip'

// 睿：貓頭鷹天文學家用望遠鏡看星星，一隻飛碟一直偷偷躲在牠背後，牠一轉身飛碟就溜走。聰明的貓頭鷹靈機一動——
// 頭「咻」地轉一整圈，抓到了！飛碟嚇得光束灑下「睿」的上半部，貓頭鷹的大眼睛變成下面的「目」。外星人想學轉頭，轉到頭昏。睿、睿、睿智
const clip: Clip = {
  char: '睿',
  meta: { theme: '天文台抓飛碟', cast: '貓頭鷹天文學家＋望遠鏡＋飛碟＋外星人', gags: ['其實一直在你後面', '頭轉一整圈抓到', '外星人模仿轉頭轉到昏'] },
  duration: 10,
  bg: { top: '#121A3D', bottom: '#2E3D7A', floor: '#3B4569', scenery: 'night' },
  actors: [
    { id: 'ufo', emoji: '🛸', x: 14, y: 20, size: 20, hidden: true, float: true },
    { id: 'scope', emoji: '🔭', x: 40, y: 67, size: 16, hidden: true },
    { id: 'owl', emoji: '🦉', x: 22, y: 68, size: 20, hidden: true },
    { id: 'alien', emoji: '👽', x: 136, y: 70, size: 15, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'owl', do: 'pop' },
    { at: 0.15, actor: 'scope', do: 'pop' },
    { at: 0.6, actor: 'owl', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.0, actor: 'owl', do: 'moveTo', to: { x: 28, y: 68 }, dur: 0.3 },
    // 飛碟偷偷躲到背後
    { at: 1.6, actor: 'ufo', do: 'enter', from: { x: -20, y: 8 }, dur: 0.5 },
    // 一轉身——飛碟溜到另一邊
    { at: 2.5, actor: 'ufo', do: 'moveTo', to: { x: 140, y: 20 }, dur: 0.2 },
    { at: 2.6, actor: 'owl', do: 'flip' },
    { at: 3.3, actor: 'ufo', do: 'moveTo', to: { x: 14, y: 20 }, dur: 0.2 },
    { at: 3.4, actor: 'owl', do: 'flip' },
    // 靈機一動：頭轉一整圈，抓到！
    { at: 4.2, actor: 'owl', do: 'squash', amount: -0.2, dur: 0.3 },
    // 轉頭轉得飛快：左右左，最後停在面向飛碟
    { at: 4.5, actor: 'owl', do: 'flip' },
    { at: 4.6, actor: 'owl', do: 'flip' },
    { at: 4.7, actor: 'owl', do: 'flip' },
    { at: 4.5, actor: 'owl', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 4.9, actor: 'ufo', do: 'shake', amount: 2, dur: 0.5 },
    // 飛碟逃到右邊，放下外星人
    { at: 6.4, actor: 'ufo', do: 'moveTo', to: { x: 136, y: 22 }, dur: 0.5 },
    { at: 7.1, actor: 'alien', do: 'pop', dur: 0.3 },
    { at: 7.7, actor: 'owl', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 外星人學轉頭——轉到頭昏
    { at: 8.4, actor: 'alien', do: 'flip' },
    { at: 8.5, actor: 'alien', do: 'flip' },
    { at: 8.6, actor: 'alien', do: 'flip' },
    { at: 8.7, actor: 'alien', do: 'flip' },
    { at: 8.4, actor: 'alien', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 9.0, actor: 'alien', do: 'tilt', amount: 20, dur: 0.5 },
  ],
  builds: [
    // 飛碟的光束 → 上半部；貓頭鷹的大眼睛 → 目
    { at: 5.1, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: 'ufo', color: '#63E6BE' },
    { at: 5.6, dur: 0.5, strokes: [9, 10, 11, 12, 13], from: 'owl', color: '#FFD43B' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'owl', emoji: '🌟', dur: 0.8 },
    { at: 2.0, kind: 'pop', actor: 'owl', emoji: '❓', dur: 0.4 },
    { at: 2.8, kind: 'pop', actor: 'owl', emoji: '❓', dur: 0.4 },
    { at: 3.6, kind: 'pop', actor: 'owl', emoji: '😑', dur: 0.5 },
    { at: 4.2, kind: 'pop', actor: 'owl', emoji: '💡', dur: 0.4 },
    { at: 4.5, kind: 'burst', actor: 'owl', emoji: '💨', n: 4, dur: 0.4 },
    { at: 4.9, kind: 'pop', actor: 'ufo', emoji: '❗', dur: 0.5 },
    { at: 5.0, kind: 'beam', actor: 'ufo', n: 16, dur: 0.6 },
    { at: 6.9, kind: 'beam', actor: 'ufo', n: 16, dur: 0.5 },
    { at: 7.6, kind: 'pop', actor: 'owl', emoji: '🎓', dur: 0.9 },
    { at: 7.7, kind: 'burst', actor: 'alien', emoji: '👏', n: 4, dur: 0.6 },
    { at: 9.0, kind: 'dizzy', actor: 'alien', dur: 0.9 },
    { at: 9.1, kind: 'pop', actor: 'owl', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.5, dur: 0.7, do: 'punch', amount: 0.15, to: { x: 24, y: 58 } },
  ],
  cues: [
    { at: 1.1, say: '睿' },
    { at: 1.6, sfx: 'blip' },
    { at: 2.5, sfx: 'whoosh' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 4.5, sfx: 'boing' },
    { at: 5.0, sfx: 'laser' },
    { at: 6.2, say: '睿' },
    { at: 7.7, say: '睿智' },
    { at: 8.4, sfx: 'slide' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
