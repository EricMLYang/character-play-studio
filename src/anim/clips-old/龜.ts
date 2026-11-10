import type { Clip } from '../clip'

// 龜：桶子身材的玩具海盜想衝去拿甲板另一頭的烏龜殼寶箱。第一次木腿在濕甲板上打滑，原地跑半天；退後再助跑，撲倒用肚子滑——
// 鸚鵡偏偏停在他臉上遮住眼睛，他盲滑一路撞倒排成一排的積木小隊，積木翻滾疊成「龜」。寶箱打開，一隻小烏龜慢慢爬出來，
// 鸚鵡改站到烏龜背上；海盜跳木腿勝利舞，結果又在濕甲板上滑一跤。龜、龜、烏龜
const clip: Clip = {
  char: '龜',
  meta: { theme: '海盜船甲板搶寶箱', cast: '玩具海盜＋鸚鵡＋積木小隊＋小烏龜', gags: ['濕甲板原地打滑', '鸚鵡遮臉盲滑撞倒一排積木', '勝利舞又滑一跤'] },
  duration: 10,
  bg: { top: '#CFEFFF', bottom: '#EFF9FF', floor: '#E8D9A8', scenery: 'sea' },
  actors: [
    { id: 'b1', emoji: 'hero:brick/idle', x: 74, y: 71.5, size: 12, hidden: true },
    { id: 'b2', emoji: 'hero:brick/idle', x: 88, y: 71.5, size: 12, hidden: true },
    { id: 'b3', emoji: 'hero:brick/idle', x: 102, y: 71.5, size: 12, hidden: true },
    { id: 'turtle', emoji: '🐢', x: 146, y: 72, size: 9, hidden: true },
    { id: 'chest', emoji: '🧰', x: 148, y: 71, size: 13, tint: 'hue-rotate(110deg) saturate(1.2)' },
    { id: 'pirate', emoji: 'hero:pirate/telescope', x: 18, y: 71, size: 14, flip: true },
    { id: 'parrot', emoji: '🦜', x: 18, y: 61, size: 7, flip: true },
  ],
  moves: [
    // 積木小隊踏步進來排成一排，像保齡球瓶
    { at: 0.1, actor: 'b1', do: 'enter', from: { x: 175, y: 71.5 }, dur: 0.8, ease: 'out' },
    { at: 0.2, actor: 'b2', do: 'enter', from: { x: 185, y: 71.5 }, dur: 0.8, ease: 'out' },
    { at: 0.3, actor: 'b3', do: 'enter', from: { x: 195, y: 71.5 }, dur: 0.8, ease: 'out' },
    { at: 0.1, actor: 'b1', do: 'swap', emoji: 'hero:brick/march' },
    { at: 0.2, actor: 'b2', do: 'swap', emoji: 'hero:brick/march' },
    { at: 0.3, actor: 'b3', do: 'swap', emoji: 'hero:brick/march' },
    { at: 1.0, actor: 'b1', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 1.05, actor: 'b2', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 1.1, actor: 'b3', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 0.6, actor: 'chest', do: 'flash', dur: 0.6 },
    // 海盜看到寶箱，扳手指
    { at: 1.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 1.05, actor: 'pirate', do: 'shake', amount: 0.8, dur: 0.35 },
    // 第一次：木腿在濕甲板上打滑，原地跑
    { at: 1.5, actor: 'pirate', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 1.6, actor: 'pirate', do: 'shake', amount: 2, dur: 0.9 },
    { at: 1.6, actor: 'parrot', do: 'shake', amount: 2, dur: 0.9 },
    { at: 1.8, actor: 'b2', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 2.0, actor: 'b1', do: 'tilt', amount: -10, dur: 0.3 },
    // 退後、揮開鸚鵡，準備更長的助跑
    { at: 2.6, actor: 'pirate', do: 'moveTo', to: { x: 12, y: 71 }, dur: 0.35 },
    { at: 2.6, actor: 'parrot', do: 'moveTo', to: { x: 14, y: 52 }, dur: 0.35, ease: 'out' },
    // 衝、跳、撲倒用肚子滑
    { at: 3.1, actor: 'pirate', do: 'moveTo', to: { x: 30, y: 71 }, dur: 0.3, anticipate: 3, ease: 'in' },
    { at: 3.4, actor: 'pirate', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 3.4, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 3.45, actor: 'pirate', do: 'moveTo', to: { x: 62, y: 71 }, dur: 0.5, ease: 'linear' },
    // 鸚鵡飛下來剛好停在他臉上
    { at: 3.45, actor: 'parrot', do: 'moveTo', to: { x: 74, y: 64 }, arc: 4, dur: 0.5, ease: 'in' },
    { at: 3.95, actor: 'parrot', do: 'moveTo', to: { x: 124, y: 64 }, dur: 0.75, ease: 'linear' },
    // 盲滑撞進積木小隊——全部飛起來
    { at: 3.95, actor: 'pirate', do: 'moveTo', to: { x: 112, y: 71 }, dur: 0.75, ease: 'linear' },
    { at: 3.95, actor: 'b1', do: 'moveTo', to: { x: 80, y: 18 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 4.1, actor: 'b2', do: 'moveTo', to: { x: 56, y: 40 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 4.25, actor: 'b3', do: 'moveTo', to: { x: 104, y: 36 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 3.95, actor: 'b1', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.1, actor: 'b2', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.25, actor: 'b3', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.4, actor: 'b1', do: 'vanish', dur: 0.2 },
    { at: 4.85, actor: 'b2', do: 'vanish', dur: 0.2 },
    { at: 5.3, actor: 'b3', do: 'vanish', dur: 0.2 },
    // 一頭撞到寶箱停下來，跳起來擺姿勢（鸚鵡還在臉上）
    { at: 4.7, actor: 'pirate', do: 'moveTo', to: { x: 126, y: 71 }, dur: 0.3, ease: 'out' },
    { at: 4.7, actor: 'parrot', do: 'moveTo', to: { x: 138, y: 66 }, dur: 0.3, ease: 'out' },
    { at: 5.0, actor: 'chest', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 5.2, actor: 'pirate', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 5.2, actor: 'pirate', do: 'moveTo', to: { x: 124, y: 71 }, dur: 0.25 },
    { at: 5.2, actor: 'parrot', do: 'moveTo', to: { x: 124, y: 62 }, dur: 0.25 },
    { at: 5.45, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 5.45, actor: 'parrot', do: 'hop', amount: 10, dur: 0.6 },
    { at: 6.1, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    // 寶箱打開，小烏龜慢慢爬出來，眨眨眼
    { at: 6.6, actor: 'chest', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.75, actor: 'turtle', do: 'pop', dur: 0.4 },
    { at: 7.1, actor: 'turtle', do: 'moveTo', to: { x: 140, y: 72 }, dur: 1.4, ease: 'linear' },
    { at: 6.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 7.5, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    // 鸚鵡從他臉上跳下來，改站到烏龜背上
    { at: 8.0, actor: 'parrot', do: 'moveTo', to: { x: 140, y: 66 }, arc: 8, dur: 0.45 },
    // 回馬槍：跳木腿勝利舞——又在濕甲板上滑一跤
    { at: 8.4, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 8.4, actor: 'pirate', do: 'bounce', amount: 4, times: 2, dur: 0.6 },
    { at: 9.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 9.0, actor: 'pirate', do: 'moveTo', to: { x: 118, y: 71 }, dur: 0.3, ease: 'out' },
    { at: 9.0, actor: 'pirate', do: 'spin', times: 1, dur: 0.35 },
    { at: 9.3, actor: 'parrot', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 飛起來的積木翻滾落下：上面 → 龜頭；左下 → 左邊一排；右邊 → 龜殼
    { at: 4.4, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'b1', color: '#0B7285' },
    { at: 4.85, dur: 0.6, strokes: [8, 9, 10, 11, 12, 13], from: 'b2', color: '#0C8599' },
    { at: 5.3, dur: 0.65, strokes: [6, 7, 14, 15, 16, 17], from: 'b3', color: '#0B7285' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'pirate', emoji: '💰', dur: 0.9 },
    { at: 1.1, kind: 'pop', actor: 'parrot', emoji: '🥱', dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'pirate', dur: 0.9 },
    { at: 1.9, kind: 'pop', actor: 'b2', emoji: '😆', dur: 0.6 },
    { at: 2.4, kind: 'sweat', actor: 'pirate' },
    { at: 3.45, kind: 'fountain', actor: 'pirate', emoji: '💦', dur: 1.2, dy: 8 },
    { at: 3.95, kind: 'pop', actor: 'pirate', emoji: '🙈', dur: 0.6, dx: 10 },
    { at: 3.95, kind: 'burst', actor: 'b1', n: 1, dur: 0.35 },
    { at: 5.0, kind: 'burst', actor: 'chest', emoji: '⭐', n: 5, dur: 0.5, dx: -8 },
    { at: 5.5, kind: 'dizzy', actor: 'pirate', dur: 0.8 },
    { at: 7.2, kind: 'pop', actor: 'turtle', emoji: '😊', dur: 0.7 },
    { at: 9.05, kind: 'puff', actor: 'pirate', dur: 0.5 },
    { at: 9.3, kind: 'pop', actor: 'turtle', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    // 肚子滑行跟拍，撞進積木前退回全景
    { at: 3.45, dur: 0.3, do: 'follow', actor: 'pirate', amount: 1.3 },
    { at: 4.0, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.95, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.6, sfx: 'slide' },
    { at: 2.4, say: '龜' },
    { at: 3.45, sfx: 'splash' },
    { at: 3.95, sfx: 'bonk' },
    { at: 4.5, sfx: 'clink' },
    { at: 5.0, sfx: 'bonk' },
    { at: 6.05, say: '龜' },
    { at: 6.6, sfx: 'clink' },
    { at: 6.8, say: '烏龜' },
    { at: 9.0, sfx: 'slide' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
