import type { Clip } from '../clip'

// 冰：小機器人在結冰的池塘上敲敲冰面，巨大的賽車吹牛衝過來——機器人想閃開，馬達太強原地轉成陀螺；賽車在冰上打滑衝過頭、繞一大圈。
// 賽車用後輪站起來嚇人，停一拍——機器人用長手臂輕輕一戳，賽車像大樹一樣「咚」倒下：冰面裂成「水」，噴飛的兩片冰屑變成「冫」。
// 唸「冰棒」時機器人站在倒下的賽車上，從胸口拿出一枝冰棒；最後一口吞掉，凍得全身發抖原地亂轉。冰、冰、冰棒
const clip: Clip = {
  char: '冰',
  meta: { theme: '冰上對決', cast: '小機器人＋巨大賽車', gags: ['馬達太強原地轉', '冰上打滑衝過頭', '輕輕一戳像大樹倒下', '冰棒凍到發抖'] },
  duration: 10,
  bg: { top: '#E3FAFC', bottom: '#F8F9FA', floor: '#D0EBFF', scenery: 'snow' },
  actors: [
    { id: 'car', emoji: 'hero:car/idle', x: 30, y: 66, size: 26, hidden: true, flip: true },
    { id: 'bot', emoji: 'hero:robot/idle', x: 100, y: 72, size: 12, hidden: true },
    { id: 'pop', emoji: '🍭', x: 133, y: 41, size: 7, hidden: true },
  ],
  moves: [
    // 機器人踏上冰面，敲一敲
    { at: 0, actor: 'bot', do: 'enter', from: { x: 175, y: 72 }, dur: 0.6, ease: 'back' },
    { at: 0.8, actor: 'bot', do: 'tilt', amount: -20, dur: 0.3 },
    // 巨大賽車從左邊進來，催油門、秀肌肉
    { at: 1.2, actor: 'car', do: 'enter', from: { x: -30, y: 66 }, dur: 0.5, ease: 'out' },
    { at: 1.75, actor: 'car', do: 'shake', amount: 1, dur: 0.4 },
    { at: 2.1, actor: 'car', do: 'squash', amount: -0.15, dur: 0.3 },
    // 衝！機器人想閃開，馬達太強原地轉
    { at: 2.4, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 2.4, actor: 'car', do: 'moveTo', to: { x: 150, y: 66 }, dur: 0.6, anticipate: 4, ease: 'out' },
    { at: 2.45, actor: 'bot', do: 'spin', times: 3, dur: 0.6 },
    { at: 3.05, actor: 'bot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 打滑衝過頭，繞一大圈回來
    { at: 3.0, actor: 'car', do: 'flip' },
    { at: 3.0, actor: 'car', do: 'rotateTo', amount: 15, dur: 0.2 },
    { at: 3.2, actor: 'car', do: 'rotateTo', amount: -15, dur: 0.2 },
    { at: 3.1, actor: 'car', do: 'moveTo', to: { x: 128, y: 66 }, dur: 0.4, ease: 'back' },
    // 用後輪站起來，居高臨下——停一拍
    { at: 3.6, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 3.6, actor: 'car', do: 'rotateTo', amount: 35, dur: 0.3, ease: 'back' },
    { at: 3.6, actor: 'bot', do: 'swap', emoji: 'hero:robot/idle' },
    // 長手臂輕輕一戳
    { at: 4.2, actor: 'bot', do: 'moveTo', to: { x: 106, y: 72 }, dur: 0.12 },
    { at: 4.32, actor: 'bot', do: 'moveTo', to: { x: 100, y: 72 }, dur: 0.2 },
    // 搖兩下，像大樹一樣倒向右下角
    { at: 4.35, actor: 'car', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 4.65, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 4.65, actor: 'car', do: 'rotateTo', amount: 55, dur: 0.35, ease: 'in' },
    { at: 4.65, actor: 'car', do: 'moveTo', to: { x: 128, y: 53 }, dur: 0.35, ease: 'in' },
    { at: 5.0, actor: 'car', do: 'squash', amount: 0.2, dur: 0.25 },
    // 爬上倒下的賽車，擺勝利姿勢
    { at: 5.9, actor: 'bot', do: 'moveTo', to: { x: 140, y: 46 }, arc: 10, dur: 0.5 },
    { at: 6.4, actor: 'bot', do: 'swap', emoji: 'hero:robot/happy' },
    // 「冰棒」：從胸口拿出冰棒舉高
    { at: 6.75, actor: 'pop', do: 'pop', dur: 0.3 },
    { at: 7.0, actor: 'pop', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.0, actor: 'bot', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.3, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    // 回馬槍：一口吞掉——凍得發抖，馬達又失控原地亂轉
    { at: 8.2, actor: 'pop', do: 'moveTo', to: { x: 139, y: 42 }, dur: 0.15 },
    { at: 8.35, actor: 'pop', do: 'vanish', dur: 0.1 },
    { at: 8.5, actor: 'bot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 8.5, actor: 'bot', do: 'tint', filter: 'hue-rotate(180deg) saturate(1.5)' },
    { at: 8.55, actor: 'bot', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 8.95, actor: 'bot', do: 'spin', times: 3, dur: 0.6 },
    { at: 9.55, actor: 'bot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 9.55, actor: 'bot', do: 'tint', filter: '' },
  ],
  builds: [
    // 賽車倒下撞裂冰面 → 水；噴飛的兩片冰屑 → 冫
    { at: 5.0, dur: 0.7, strokes: [2, 3, 4, 5], from: 'car', color: '#1098AD' },
    { at: 5.4, dur: 0.45, strokes: [0, 1], from: 'car', color: '#1098AD' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.85, kind: 'burst', actor: 'bot', emoji: '❄️', n: 6, dy: 12, dur: 0.6 },
    { at: 1.75, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 2.1, kind: 'pop', actor: 'car', emoji: '😤', dur: 0.5 },
    { at: 3.1, kind: 'dizzy', actor: 'bot', dur: 0.6 },
    { at: 3.1, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 3.9, kind: 'sweat', actor: 'bot' },
    { at: 4.2, kind: 'pop', actor: 'bot', emoji: '👉', dx: 6, dur: 0.4 },
    { at: 5.0, kind: 'burst', actor: 'car', emoji: '❄️', n: 7, dur: 0.6 },
    { at: 6.75, kind: 'pop', actor: 'bot', emoji: '✨', dx: -8, dur: 0.5 },
    { at: 7.3, kind: 'dizzy', actor: 'car', dur: 1.2 },
    { at: 8.5, kind: 'pop', actor: 'bot', emoji: '🥶', dur: 0.6 },
  ],
  camera: [
    // 賽車站起來時慢慢推近，倒下前退回全景，倒地再震
    { at: 3.6, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 112, y: 52 } },
    { at: 4.45, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 5.0, dur: 0.4, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 0.85, say: '冰' },
    { at: 0.85, sfx: 'clink' },
    { at: 1.75, sfx: 'rumble' },
    { at: 2.4, sfx: 'whoosh' },
    { at: 3.0, sfx: 'slide' },
    { at: 4.2, sfx: 'tap' },
    { at: 5.0, sfx: 'crack' },
    { at: 5.9, say: '冰' },
    { at: 6.8, say: '冰棒' },
    { at: 8.3, sfx: 'gulp' },
    { at: 8.95, sfx: 'boing' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
