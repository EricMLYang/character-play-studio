import type { Clip } from '../clip'

// 腦：消防隊長要滅營火，一拉水管——噴頭先噴了自己滿臉泡沫，接著像蛇一樣扭著逃走；隊長追、消防車兩輪甩尾、隊長被自己的靴子絆倒。
// 噴頭停下來挑釁，隊長蓄力飛撲、肚皮「啪」壓住它：甩尾的輪胎痕變成「月」，噴出來的泡沫變成右邊，拼成「腦」。
// 唸「頭腦」時隊長敲敲頭盔，頭上冒出粉紅色的腦袋氣球——最後噴頭又偷偷噴一下，把氣球射破了。腦、腦、頭腦
const clip: Clip = {
  char: '腦',
  meta: { theme: '消防隊追水管', cast: '消防隊長＋消防車＋亂跑的噴頭＋營火', gags: ['噴到自己滿臉', '追著亂跑的水管', '被自己絆倒', '飛撲肚皮壓住', '噴破氣球'] },
  duration: 10,
  bg: { top: '#E6FCF5', bottom: '#FFF9DB', floor: '#C3FAE8', scenery: 'city' },
  actors: [
    { id: 'fire', emoji: '🔥', x: 10, y: 73.6, size: 8 },
    { id: 'truck', emoji: '🚒', x: 138, y: 68.6, size: 20 },
    { id: 'brain', emoji: '🧠', x: 130, y: 50, size: 11, hidden: true, float: true },
    { id: 'chief', emoji: 'hero:firefighter/idle', x: 32, y: 71.1, size: 14, hidden: true },
    { id: 'nozzle', emoji: '🚿', x: 26, y: 66, size: 6, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'chief', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.45, ease: 'back' },
    { at: 0.3, actor: 'nozzle', do: 'pop', dur: 0.2 },
    // 指著營火，一拉水管
    { at: 0.55, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 0.6, actor: 'nozzle', do: 'shake', amount: 1, dur: 0.35 },
    // 噗！先噴自己滿臉
    { at: 0.95, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 0.95, actor: 'chief', do: 'squash', amount: 0.2, dur: 0.25 },
    // 噴頭像蛇一樣扭著逃走
    { at: 1.2, actor: 'nozzle', do: 'moveTo', to: { x: 118, y: 30 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 1.65, actor: 'nozzle', do: 'moveTo', to: { x: 142, y: 50 }, dur: 0.35 },
    { at: 2.0, actor: 'nozzle', do: 'moveTo', to: { x: 108, y: 18 }, dur: 0.35 },
    { at: 2.35, actor: 'nozzle', do: 'moveTo', to: { x: 66, y: 34 }, dur: 0.4 },
    { at: 2.75, actor: 'nozzle', do: 'moveTo', to: { x: 100, y: 72 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 1.2, actor: 'nozzle', do: 'spin', times: 4, dur: 2.0 },
    // 隊長追；消防車兩輪甩尾
    { at: 1.3, actor: 'chief', do: 'flip' },
    { at: 1.3, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 1.35, actor: 'chief', do: 'moveTo', to: { x: 96, y: 71.1 }, dur: 0.6, anticipate: 3, ease: 'in' },
    { at: 1.6, actor: 'truck', do: 'moveTo', to: { x: 28, y: 68.6 }, dur: 0.85, ease: 'out' },
    { at: 1.6, actor: 'truck', do: 'tilt', amount: 18, dur: 0.85 },
    { at: 2.1, actor: 'chief', do: 'flip' },
    { at: 2.15, actor: 'chief', do: 'moveTo', to: { x: 62, y: 71.1 }, dur: 0.45 },
    // 被自己的靴子絆倒，肚皮滑行
    { at: 2.6, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 2.6, actor: 'chief', do: 'moveTo', to: { x: 48, y: 72 }, dur: 0.5, ease: 'out' },
    { at: 2.6, actor: 'chief', do: 'squash', amount: 0.3, dur: 0.5 },
    // 噴頭停下來挑釁；隊長蓄力
    { at: 3.2, actor: 'nozzle', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 3.25, actor: 'chief', do: 'flip' },
    { at: 3.3, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 3.45, actor: 'chief', do: 'squash', amount: -0.35, dur: 0.5 },
    // 飛撲——啪！
    { at: 3.95, actor: 'chief', do: 'moveTo', to: { x: 98, y: 71.6 }, arc: 22, dur: 0.45, ease: 'in' },
    { at: 4.4, actor: 'chief', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 4.4, actor: 'nozzle', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.45, actor: 'truck', do: 'hop', amount: 5, dur: 0.3 },
    // 抱著乖乖的噴頭彈到右邊坐好
    { at: 4.8, actor: 'chief', do: 'moveTo', to: { x: 134, y: 71.1 }, arc: 8, dur: 0.5, ease: 'out' },
    { at: 4.8, actor: 'nozzle', do: 'moveTo', to: { x: 127, y: 69 }, arc: 8, dur: 0.5, ease: 'out' },
    { at: 5.3, actor: 'chief', do: 'flip' },
    // 「頭腦」：敲敲頭盔，冒出腦袋氣球
    { at: 6.1, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.15, actor: 'chief', do: 'hop', amount: 2, dur: 0.2 },
    { at: 6.4, actor: 'chief', do: 'hop', amount: 2, dur: 0.2 },
    { at: 6.6, actor: 'brain', do: 'pop', dur: 0.4 },
    { at: 7.0, actor: 'brain', do: 'bounce', times: 3, amount: 2, dur: 1.0 },
    { at: 7.2, actor: 'truck', do: 'shake', amount: 1, dur: 0.6 },
    // 回馬槍：噴頭又扭起來，偷噴一下——氣球破了
    { at: 8.2, actor: 'nozzle', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.6, actor: 'nozzle', do: 'tilt', amount: -25, dur: 0.3 },
    { at: 8.85, actor: 'brain', do: 'vanish', dur: 0.1 },
    { at: 8.9, actor: 'chief', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.9, actor: 'chief', do: 'squash', amount: 0.2, dur: 0.25 },
  ],
  builds: [
    // 消防車甩尾的輪胎痕 → 月；噴頭灑的泡沫 → 右邊
    { at: 4.5, dur: 0.6, strokes: [0, 1, 2, 3], from: 'truck', color: '#0C8599' },
    { at: 4.65, dur: 0.95, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12], from: 'nozzle', color: '#0C8599' },
  ],
  glyph: [{ at: 5.65, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'chief', emoji: '❗', dur: 0.4 },
    { at: 0.95, kind: 'burst', actor: 'chief', emoji: '💦', n: 6, dur: 0.5 },
    { at: 1.5, kind: 'burst', actor: 'nozzle', emoji: '💦', n: 3, dur: 0.4 },
    { at: 2.2, kind: 'burst', actor: 'nozzle', emoji: '💦', n: 3, dur: 0.4 },
    { at: 1.7, kind: 'puff', actor: 'truck', dur: 0.6 },
    { at: 2.65, kind: 'puff', actor: 'chief', dur: 0.5 },
    { at: 2.8, kind: 'dizzy', actor: 'chief', dur: 0.6 },
    { at: 3.3, kind: 'pop', actor: 'nozzle', emoji: '😝', dur: 0.6 },
    { at: 4.4, kind: 'burst', actor: 'chief', emoji: '💦', n: 8, dur: 0.6 },
    { at: 6.6, kind: 'pop', actor: 'chief', emoji: '💡', dx: -7, dur: 0.6 },
    { at: 7.3, kind: 'pop', actor: 'truck', emoji: '👏', dur: 0.6 },
    { at: 8.6, kind: 'line', actor: 'nozzle', target: 'brain', color: '#66D9E8', width: 1.4, dur: 0.3 },
    { at: 8.85, kind: 'burst', actor: 'brain', dy: 6, dur: 0.35 },
    { at: 9.0, kind: 'rain', actor: 'chief', emoji: '💧', dur: 0.8 },
  ],
  camera: [
    // 飛撲跟拍，壓住那一下退回全景再震
    { at: 3.95, dur: 0.25, do: 'follow', actor: 'chief', amount: 1.3 },
    { at: 4.3, dur: 0.15, do: 'zoom', amount: 1 },
    { at: 4.4, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.6, sfx: 'tap' },
    { at: 1.0, say: '腦' },
    { at: 0.95, sfx: 'splash' },
    { at: 1.25, sfx: 'whoosh' },
    { at: 1.65, sfx: 'slide' },
    { at: 2.6, sfx: 'slide' },
    { at: 3.95, sfx: 'whoosh' },
    { at: 4.4, sfx: 'splash' },
    { at: 5.65, say: '腦' },
    { at: 6.6, say: '頭腦' },
    { at: 8.6, sfx: 'splash' },
    { at: 8.85, sfx: 'poof' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
