import type { Clip } from '../clip'

// 豹：獵豹上跑步機，烏龜教練按一下加速、再按一下更快，然後教練睡著趴在按鈕上——速度爆表，獵豹被甩飛，身上的斑點全被甩掉變成「豹」，
// 剩下一隻普通的貓。牠抖一抖長回斑點，咻一聲衝出畫面，繞了地球一圈又從另一邊跑回跑步機上。豹、豹、獵豹
const clip: Clip = {
  char: '豹',
  meta: { theme: '健身房跑步機', cast: '獵豹＋烏龜教練＋控制台', gags: ['越按越快', '教練睡著壓到按鈕', '斑點被甩掉變成貓', '繞地球一圈跑回來'] },
  duration: 10,
  bg: { top: '#E6F4FF', bottom: '#CBE6FF', floor: '#D9774B', scenery: 'track' },
  actors: [
    { id: 'belt', emoji: '➖', x: 40, y: 75, size: 20, float: true, hidden: true, tint: 'brightness(0.4)' },
    { id: 'panel', emoji: '🎛️', x: 118, y: 72.8, size: 10, hidden: true },
    { id: 'turtle', emoji: '🐢', x: 134, y: 72.4, size: 11, hidden: true },
    { id: 'cheetah', emoji: '🐆', x: 40, y: 70, size: 14, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'belt', do: 'pop' },
    { at: 0.1, actor: 'cheetah', do: 'pop' },
    { at: 0.2, actor: 'panel', do: 'pop' },
    { at: 0.2, actor: 'turtle', do: 'enter', from: { x: 175, y: 72.4 }, dur: 0.6 },
    // 第一下：慢跑
    { at: 0.9, actor: 'turtle', do: 'tilt', amount: -20, dur: 0.3 },
    { at: 0.9, actor: 'panel', do: 'flash', dur: 0.4 },
    { at: 1.0, actor: 'cheetah', do: 'bounce', amount: 2, times: 4, dur: 1.0 },
    // 第二下：快跑
    { at: 2.0, actor: 'turtle', do: 'tilt', amount: -20, dur: 0.3 },
    { at: 2.0, actor: 'panel', do: 'flash', dur: 0.4 },
    { at: 2.0, actor: 'cheetah', do: 'bounce', amount: 3, times: 8, dur: 1.0 },
    { at: 2.0, actor: 'cheetah', do: 'shake', amount: 1, dur: 1.0 },
    // 教練睡著，趴在按鈕上：速度爆表
    { at: 3.0, actor: 'turtle', do: 'rotateTo', amount: -25, dur: 0.4 },
    { at: 3.1, actor: 'panel', do: 'flash', dur: 1.2 },
    { at: 3.1, actor: 'belt', do: 'shake', amount: 1.5, dur: 1.0 },
    { at: 3.1, actor: 'cheetah', do: 'bounce', amount: 3, times: 16, dur: 1.0 },
    { at: 3.1, actor: 'cheetah', do: 'shake', amount: 3, dur: 1.0 },
    // 甩飛：斑點被甩掉，變成一隻普通的貓
    { at: 4.1, actor: 'cheetah', do: 'moveTo', to: { x: 14, y: 71.1 }, arc: 22, dur: 0.6 },
    { at: 4.1, actor: 'cheetah', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.35, actor: 'cheetah', do: 'swap', emoji: '🐈' },
    { at: 4.7, actor: 'cheetah', do: 'squash', amount: 0.35, dur: 0.3 },
    // 控制台過熱爆掉，教練醒了
    { at: 4.9, actor: 'panel', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 5.1, actor: 'turtle', do: 'rotateTo', amount: 25, dur: 0.2 },
    { at: 5.1, actor: 'turtle', do: 'hop', amount: 6, dur: 0.35 },
    { at: 5.3, actor: 'panel', do: 'vanish', dur: 0.2 },
    // 抖一抖，斑點長回來
    { at: 6.4, actor: 'cheetah', do: 'shake', amount: 2, dur: 0.5 },
    { at: 6.75, actor: 'cheetah', do: 'swap', emoji: '🐆' },
    // 咻——衝出畫面
    { at: 7.0, actor: 'cheetah', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 7.25, actor: 'cheetah', do: 'moveTo', to: { x: 180, y: 70 }, dur: 0.45 },
    { at: 7.5, actor: 'turtle', do: 'spin', times: 2, dur: 0.6 },
    // 繞地球一圈，從左邊跑回跑步機上
    { at: 8.0, actor: 'cheetah', do: 'moveTo', to: { x: -20, y: 70 }, dur: 0.01 },
    { at: 8.4, actor: 'cheetah', do: 'moveTo', to: { x: 40, y: 70 }, dur: 0.4 },
    { at: 8.8, actor: 'cheetah', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.2, actor: 'cheetah', do: 'bounce', amount: 2, times: 4, dur: 0.8 },
  ],
  builds: [
    // 甩掉的斑點 → 豸；爆掉的控制台 → 勺
    { at: 4.25, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'cheetah', color: '#3B2A1E' },
    { at: 5.25, dur: 0.65, strokes: [7, 8, 9], from: 'panel', color: '#F29B1D' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'cheetah', emoji: '😎', dur: 0.6 },
    { at: 1.2, kind: 'puff', actor: 'cheetah' },
    { at: 2.2, kind: 'puff', actor: 'cheetah' },
    { at: 2.3, kind: 'sweat', actor: 'cheetah' },
    { at: 2.6, kind: 'puff', actor: 'cheetah' },
    { at: 2.7, kind: 'zzz', actor: 'turtle', dur: 2.2 },
    { at: 3.2, kind: 'puff', actor: 'cheetah' },
    { at: 3.3, kind: 'pop', actor: 'cheetah', emoji: '😱', dur: 0.7 },
    { at: 3.5, kind: 'puff', actor: 'cheetah' },
    { at: 3.8, kind: 'puff', actor: 'cheetah' },
    { at: 4.2, kind: 'burst', actor: 'cheetah', emoji: '⚫', n: 8, dur: 0.6, dx: 10 },
    { at: 4.7, kind: 'puff', actor: 'cheetah' },
    { at: 5.0, kind: 'pop', actor: 'cheetah', emoji: '😳', dur: 0.8 },
    { at: 5.1, kind: 'burst', actor: 'panel', dur: 0.4 },
    { at: 5.15, kind: 'pop', actor: 'turtle', emoji: '❗', dur: 0.5 },
    { at: 6.7, kind: 'burst', actor: 'cheetah', emoji: '✨', n: 6, dur: 0.5, dx: 6 },
    { at: 7.25, kind: 'puff', actor: 'cheetah' },
    { at: 7.7, kind: 'dizzy', actor: 'turtle', dur: 1.0 },
    { at: 8.8, kind: 'puff', actor: 'cheetah' },
    { at: 8.9, kind: 'pop', actor: 'turtle', emoji: '😲', dur: 0.7 },
    { at: 9.0, kind: 'bubble', actor: 'cheetah', emoji: '🌏', dur: 0.9 },
    { at: 9.1, kind: 'sweat', actor: 'cheetah' },
  ],
  camera: [
    { at: 3.2, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 40, y: 64 } },
    { at: 5.1, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.95, sfx: 'blip' },
    { at: 1.4, say: '豹' },
    { at: 2.05, sfx: 'blip' },
    { at: 3.1, sfx: 'blip' }, { at: 3.35, sfx: 'blip' }, { at: 3.6, sfx: 'blip' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.7, sfx: 'plop' },
    { at: 5.1, sfx: 'crack' },
    { at: 5.95, say: '豹' },
    { at: 6.75, sfx: 'poof' },
    { at: 7.25, sfx: 'whoosh' },
    { at: 7.3, say: '獵豹' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 8.8, sfx: 'slide' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
