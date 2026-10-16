import type { Clip } from '../clip'
import { ride } from '../helpers'

// 捷（楊捷睿賽車手 第二集：參加比賽）：楊捷睿開著賽車衝進賽車場，跟獵豹比賽。旗子一揮「咻」——快到衝出畫面，只好倒車回來；
// 再比一次又快到原地打轉，連人帶車轉得頭昏眼花。閃電尾巴變成「扌」，獵豹的腳印變成右邊，「捷」站好了。
// 這時捷運「咻」地滑進站——比他們兩個都快，楊捷睿不服氣追上去（接第三集）。捷、捷、捷運
const clip: Clip = {
  char: '捷',
  meta: { theme: '楊捷睿賽車手②比賽', cast: '楊捷睿＋賽車＋獵豹＋旗子＋捷運', gags: ['快到衝出畫面倒車回來', '原地打轉轉到昏', '捷運比誰都快'] },
  duration: 10,
  bg: { top: '#BFE3FF', bottom: '#EEF7FF', floor: '#A7B0BA', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: 80, y: 28, size: 13, hidden: true, float: true },
    { id: 'cheetah', emoji: '🐆', x: 30, y: 66, size: 20, hidden: true, flip: true },
    { id: 'boy', emoji: 'hero:yang/drive', x: 18, y: 69, size: 13, hidden: true },
    { id: 'car', emoji: '🏎️', x: 18, y: 70, size: 19, hidden: true, flip: true },
    { id: 'train', emoji: '🚈', x: 138, y: 66, size: 24, hidden: true },
  ],
  moves: [
    // 從第一集衝出畫面，這一集從左邊衝進來
    { at: 0.05, actor: 'cheetah', do: 'enter', from: { x: -25, y: 66 }, dur: 0.45 },
    { at: 0.3, actor: 'flag', do: 'drop', dur: 0.5 },
    { at: 0.7, actor: 'cheetah', do: 'squash', amount: -0.25, dur: 0.4 },
    // 旗子一揮——出發！
    { at: 1.1, actor: 'flag', do: 'tilt', amount: 25, dur: 0.3 },
    { at: 1.3, actor: 'cheetah', do: 'moveTo', to: { x: 148, y: 66 }, dur: 0.6, anticipate: 3, ease: 'in' },
    { at: 1.4, actor: 'flag', do: 'vanish', dur: 0.2 },
    // 再比一次，往回跑
    { at: 3.1, actor: 'cheetah', do: 'flip' },
    { at: 3.3, actor: 'cheetah', do: 'moveTo', to: { x: 36, y: 66 }, dur: 0.55 },
    { at: 4.6, actor: 'cheetah', do: 'hop', amount: 6, dur: 0.35 },
    // 捷運進站
    { at: 6.6, actor: 'train', do: 'enter', from: { x: 190, y: 66 }, dur: 0.5, ease: 'out' },
    { at: 7.1, actor: 'train', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 7.3, actor: 'cheetah', do: 'hop', amount: 5, dur: 0.3 },
    { at: 8.3, actor: 'train', do: 'moveTo', to: { x: 190, y: 66 }, dur: 0.4 },
    ...ride([
      { at: 0, actor: 'car', do: 'enter', from: { x: -20, y: 70 }, dur: 0.35 },
      // 催油門
      { at: 0.7, actor: 'car', do: 'shake', amount: 1, dur: 0.5 },
      { at: 1.3, actor: 'car', do: 'moveTo', to: { x: 185, y: 70 }, dur: 0.4, anticipate: 3, ease: 'in' },
      // 快到衝出畫面——倒車回來
      { at: 2.2, actor: 'car', do: 'moveTo', to: { x: 116, y: 70 }, dur: 0.6, ease: 'back' },
      { at: 3.1, actor: 'car', do: 'flip' },
      { at: 3.3, actor: 'car', do: 'moveTo', to: { x: 20, y: 70 }, dur: 0.3 },
      // 停不下來，原地打轉
      { at: 3.6, actor: 'car', do: 'spin', times: 3, dur: 0.8 },
      { at: 4.4, actor: 'boy', do: 'swap', emoji: 'hero:yang/dizzy' },
      { at: 6.9, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 8.8, actor: 'boy', do: 'swap', emoji: 'hero:yang/drive' },
      // 捷運開走，不服氣追上去
      { at: 8.8, actor: 'car', do: 'shake', amount: 1, dur: 0.3 },
      { at: 9.1, actor: 'car', do: 'flip' },
      { at: 9.15, actor: 'car', do: 'moveTo', to: { x: 190, y: 70 }, dur: 0.4, anticipate: 3, ease: 'in' },
    ], 'boy', -1, 19),
  ],
  builds: [
    // 打轉留下的閃電尾巴 → 扌；獵豹的腳印 → 右邊
    { at: 4.4, dur: 0.5, strokes: [0, 1, 2], from: 'car', color: '#F03E3E' },
    { at: 4.9, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9, 10], from: 'cheetah', color: '#F59F00' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 0.8, kind: 'pop', actor: 'boy', emoji: '😤', dur: 0.4 },
    { at: 1.3, kind: 'zap', actor: 'car', target: 'cheetah', dur: 0.2 },
    { at: 1.7, kind: 'pop', actor: 'cheetah', emoji: '❓', dur: 0.5 },
    { at: 2.7, kind: 'sweat', actor: 'boy' },
    { at: 2.8, kind: 'pop', actor: 'cheetah', emoji: '😆', dur: 0.5 },
    { at: 3.6, kind: 'burst', actor: 'car', emoji: '⚡', n: 6, dur: 0.6 },
    { at: 4.4, kind: 'dizzy', actor: 'boy', dur: 1.0 },
    { at: 7.3, kind: 'pop', actor: 'cheetah', emoji: '❗', dur: 0.6 },
    { at: 8.8, kind: 'pop', actor: 'boy', emoji: '💢', dur: 0.4 },
  ],
  camera: [
    // 起跑那一下跟拍賽車，快出畫面時退回全景
    { at: 1.3, dur: 0.3, do: 'follow', actor: 'car', amount: 1.35 },
    { at: 1.9, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 3.6, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 24, y: 64 } },
  ],
  cues: [
    { at: 0.7, sfx: 'rumble' },
    { at: 1.15, say: '捷' },
    { at: 1.3, sfx: 'whoosh' },
    { at: 2.2, sfx: 'slide' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.6, sfx: 'slide' },
    { at: 5.9, say: '捷' },
    { at: 6.6, sfx: 'whoosh' },
    { at: 7.1, say: '捷運' },
    { at: 8.3, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
