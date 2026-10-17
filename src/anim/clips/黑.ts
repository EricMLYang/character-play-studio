import type { Clip } from '../clip'

// 黑：大怪獸看到墨水桶，屁股一扭衝過去，被橡膠恐龍的大腳絆倒，一頭栽進墨水桶，爬出來全身黑漆漆。腳底一滑彈到恐龍肚皮上，
// 撞天花板、撞牆、撞地板，每撞一下蓋出一筆墨印；最後一屁股坐上恐龍頭，甩下四滴墨變成四點，黑漆漆的怪獸舉起雙手學黑熊吼。恐龍一抖，怪獸又掉回墨水桶，噴得恐龍也全黑。黑、黑、黑熊
const clip: Clip = {
  char: '黑',
  meta: { theme: '墨水彈跳蓋印', cast: '大怪獸＋橡膠恐龍＋墨水桶', gags: ['絆倒栽進墨水桶', '彈來彈去每撞一下蓋一筆', '恐龍小手搆不到頭上', '全身黑學黑熊', '回馬槍噴得恐龍也全黑'] },
  duration: 10,
  bg: { top: '#E3F8EE', bottom: '#F3FCF7', floor: '#B9E4CF', scenery: 'room' },
  actors: [
    { id: 'dino', emoji: 'hero:dino/idle', x: 124, y: 70.3, size: 16 },
    { id: 'monster', emoji: 'hero:monster/idle', x: 22, y: 70.7, size: 15, flip: true },
    { id: 'tub', emoji: '🪣', x: 148, y: 70, size: 13, tint: 'brightness(.35) contrast(1.4)' },
  ],
  moves: [
    // 看到墨水桶，屁股一扭
    { at: 0.5, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 0.6, actor: 'monster', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 0.6, actor: 'monster', do: 'shake', amount: 1.2, dur: 0.4 },
    // 衝過去，被恐龍的大腳絆倒，栽進墨水桶
    { at: 1.0, actor: 'monster', do: 'moveTo', to: { x: 116, y: 70.7 }, dur: 0.4, anticipate: 3, ease: 'in' },
    { at: 1.4, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 1.4, actor: 'monster', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 1.4, actor: 'monster', do: 'moveTo', to: { x: 146, y: 62 }, arc: 12, dur: 0.4 },
    { at: 1.45, actor: 'dino', do: 'tilt', amount: -12, dur: 0.3 },
    { at: 1.8, actor: 'monster', do: 'vanish', dur: 0.1 },
    { at: 1.8, actor: 'tub', do: 'squash', amount: 0.35, dur: 0.3 },
    // 爬出來：全身黑漆漆
    { at: 1.95, actor: 'monster', do: 'rotateTo', amount: -90, dur: 0.01 },
    { at: 1.95, actor: 'monster', do: 'tint', filter: 'brightness(.22) contrast(1.3)' },
    { at: 2.3, actor: 'monster', do: 'pop', dur: 0.3 },
    { at: 2.3, actor: 'monster', do: 'moveTo', to: { x: 146, y: 58 }, dur: 0.3, ease: 'back' },
    // 腳底一滑，往後飛到恐龍肚皮上——彈！
    { at: 2.9, actor: 'monster', do: 'moveTo', to: { x: 128, y: 64 }, arc: 5, dur: 0.3, ease: 'out' },
    { at: 2.9, actor: 'monster', do: 'rotateTo', amount: -40, dur: 0.3 },
    { at: 3.2, actor: 'dino', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    // 撞天花板
    { at: 3.25, actor: 'monster', do: 'rotateTo', amount: 40, dur: 0.2 },
    { at: 3.25, actor: 'monster', do: 'moveTo', to: { x: 80, y: 14 }, dur: 0.3, ease: 'out' },
    { at: 3.55, actor: 'monster', do: 'squash', amount: -0.4, dur: 0.2 },
    // 撞左邊牆
    { at: 3.65, actor: 'monster', do: 'moveTo', to: { x: 10, y: 42 }, dur: 0.3, ease: 'in' },
    { at: 3.95, actor: 'monster', do: 'squash', amount: 0.4, dur: 0.2 },
    // 撞地板
    { at: 4.05, actor: 'monster', do: 'moveTo', to: { x: 36, y: 70.7 }, dur: 0.25, ease: 'in' },
    { at: 4.3, actor: 'monster', do: 'squash', amount: 0.5, dur: 0.2 },
    // 彈到恐龍頭上，一屁股坐下
    { at: 4.4, actor: 'monster', do: 'moveTo', to: { x: 125, y: 56 }, arc: 14, dur: 0.45, ease: 'out' },
    { at: 4.85, actor: 'monster', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.85, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 4.85, actor: 'dino', do: 'shake', amount: 1.5, dur: 0.8 },
    // 恐龍小手往上推，搆不到
    { at: 5.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 5.5, actor: 'dino', do: 'shake', amount: 0.8, dur: 1.2 },
    // 拍拍黑黑的肚子，舉起雙手學黑熊吼
    { at: 6.3, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 6.35, actor: 'monster', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 6.95, actor: 'monster', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 6.95, actor: 'monster', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 7.8, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    // 回馬槍：恐龍一抖，怪獸掉回墨水桶，墨水噴得恐龍也全黑
    { at: 8.1, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.2, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 8.2, actor: 'monster', do: 'moveTo', to: { x: 148, y: 62 }, arc: 10, dur: 0.4 },
    { at: 8.6, actor: 'monster', do: 'vanish', dur: 0.1 },
    { at: 8.6, actor: 'tub', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 8.7, actor: 'dino', do: 'tint', filter: 'brightness(.25) contrast(1.3)' },
    { at: 8.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 9.0, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 9.0, actor: 'monster', do: 'pop', dur: 0.3 },
    { at: 9.0, actor: 'monster', do: 'moveTo', to: { x: 148, y: 58 }, dur: 0.3, ease: 'back' },
  ],
  builds: [
    // 每撞一下蓋一筆墨印：天花板 → 上面的框；左牆 → 中間一豎和短橫；地板 → 長橫；坐下甩掉四滴墨 → 四點
    { at: 3.55, dur: 0.35, strokes: [0, 1, 2, 3, 4], from: 'monster', color: '#22222E' },
    { at: 3.95, dur: 0.3, strokes: [5, 6], from: 'monster', color: '#22222E' },
    { at: 4.3, dur: 0.25, strokes: [7], from: 'monster', color: '#22222E' },
    { at: 4.95, dur: 0.25, strokes: [8], from: 'monster', color: '#22222E' },
    { at: 5.15, dur: 0.25, strokes: [9], from: 'monster', color: '#22222E' },
    { at: 5.35, dur: 0.25, strokes: [10], from: 'monster', color: '#22222E' },
    { at: 5.55, dur: 0.25, strokes: [11], from: 'monster', color: '#22222E' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'monster', emoji: '🪣', dur: 0.7 },
    { at: 1.4, kind: 'pop', actor: 'dino', emoji: '❓', dur: 0.5 },
    { at: 1.8, kind: 'burst', actor: 'tub', emoji: '⚫', n: 6, dur: 0.6, dx: -10, dy: 6 },
    { at: 2.5, kind: 'pop', actor: 'monster', emoji: '👀', dur: 0.4 },
    { at: 3.2, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 3.55, kind: 'burst', actor: 'monster', n: 1, dur: 0.3 },
    { at: 3.95, kind: 'burst', actor: 'monster', n: 1, dur: 0.3 },
    { at: 4.3, kind: 'puff', actor: 'monster', dur: 0.4 },
    { at: 4.85, kind: 'dizzy', actor: 'dino', dur: 0.9 },
    { at: 5.5, kind: 'sweat', actor: 'dino' },
    { at: 6.95, kind: 'bubble', actor: 'monster', emoji: '🐻', dur: 0.9, dx: 8 },
    { at: 8.6, kind: 'burst', actor: 'tub', emoji: '⚫', n: 7, dur: 0.6, dx: -12, dy: 6 },
    { at: 9.0, kind: 'pop', actor: 'dino', emoji: '😑', dur: 0.8 },
    { at: 9.3, kind: 'pop', actor: 'monster', emoji: '😆', dur: 0.6, dx: -10 },
  ],
  camera: [
    // 蓄力時靠近怪獸，衝出去退回全景；栽進桶子推一下
    { at: 0.5, dur: 0.5, do: 'zoom', amount: 1.3, actor: 'monster' },
    { at: 1.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 1.8, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 146, y: 62 } },
    { at: 3.55, dur: 0.2, do: 'shake', amount: 1 },
    { at: 3.95, dur: 0.2, do: 'shake', amount: 1 },
    { at: 4.3, dur: 0.2, do: 'shake', amount: 1 },
    { at: 8.6, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 136, y: 62 } },
  ],
  cues: [
    { at: 1.4, sfx: 'bonk' },
    { at: 1.8, sfx: 'splash' },
    { at: 1.85, say: '黑' },
    { at: 2.9, sfx: 'slide' },
    { at: 3.2, sfx: 'boing' },
    { at: 3.55, sfx: 'tap' },
    { at: 3.95, sfx: 'tap' },
    { at: 4.3, sfx: 'tap' },
    { at: 4.85, sfx: 'boing' },
    { at: 5.9, say: '黑' },
    { at: 7.0, say: '黑熊' },
    { at: 8.6, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
