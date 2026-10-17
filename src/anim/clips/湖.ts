import type { Clip } from '../clip'

// 湖：玩具機器人在濕滑地板的另一頭排好一排藍色水瓶，橡膠恐龍小手伸得再長也搆不到，乾脆退出畫面助跑、撲倒，
// 用肚子像保齡球一樣滑過去——全倒！水花變成三點水，倒下的水瓶疊成「古」和「月」。機器人倒一桶水在恐龍頭上；最後自己踩到水滑出畫面。湖、湖、湖水
const clip: Clip = {
  char: '湖',
  meta: { theme: '恐龍肚子保齡球', cast: '橡膠恐龍＋玩具機器人＋水瓶', gags: ['小手搆不到', '肚子滑行全倒', '水桶澆頭', '回馬槍機器人自己滑倒'] },
  duration: 10,
  bg: { top: '#FFF9D9', bottom: '#FFFCEB', floor: '#A8E6E0', scenery: 'hills' },
  actors: [
    { id: 'p1', emoji: '🧴', x: 112, y: 70, size: 9, hidden: true, tint: 'hue-rotate(185deg) saturate(1.6)' },
    { id: 'p2', emoji: '🧴', x: 121, y: 70, size: 9, hidden: true, tint: 'hue-rotate(185deg) saturate(1.6)' },
    { id: 'p3', emoji: '🧴', x: 130, y: 70, size: 9, hidden: true, tint: 'hue-rotate(185deg) saturate(1.6)' },
    { id: 'robot', emoji: 'hero:robot/idle', x: 146, y: 70.7, size: 15 },
    { id: 'bucket', emoji: '🪣', x: 138, y: 56, size: 8, hidden: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 18, y: 70.3, size: 16, flip: true },
  ],
  moves: [
    // 機器人排好水瓶，得意叉腰
    { at: 0.1, actor: 'p1', do: 'pop', dur: 0.25 },
    { at: 0.3, actor: 'p2', do: 'pop', dur: 0.25 },
    { at: 0.5, actor: 'p3', do: 'pop', dur: 0.25 },
    { at: 0.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    // 恐龍伸長小手——搆不到
    { at: 0.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 0.8, actor: 'dino', do: 'moveTo', to: { x: 26, y: 70.3 }, dur: 0.4 },
    { at: 1.2, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 1.8, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    // 退出畫面……轟轟轟助跑
    { at: 2.1, actor: 'dino', do: 'moveTo', to: { x: -14, y: 70.3 }, dur: 0.4 },
    { at: 2.7, actor: 'dino', do: 'moveTo', to: { x: 58, y: 70.3 }, dur: 0.5, ease: 'in' },
    { at: 2.7, actor: 'dino', do: 'bounce', amount: 2.5, times: 4, dur: 0.5 },
    // 撲倒，肚子著地滑過去
    { at: 3.2, actor: 'dino', do: 'moveTo', to: { x: 66, y: 64 }, arc: 8, dur: 0.25 },
    { at: 3.2, actor: 'dino', do: 'rotateTo', amount: 90, dur: 0.25 },
    { at: 3.45, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 3.45, actor: 'dino', do: 'moveTo', to: { x: 108, y: 64 }, dur: 0.6, ease: 'out' },
    { at: 3.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 3.6, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.5 },
    // 全倒！
    { at: 4.0, actor: 'p1', do: 'moveTo', to: { x: 96, y: 30 }, dur: 0.4, ease: 'out' },
    { at: 4.0, actor: 'p1', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.0, actor: 'p2', do: 'moveTo', to: { x: 118, y: 24 }, dur: 0.4, ease: 'out' },
    { at: 4.0, actor: 'p2', do: 'spin', times: -2, dur: 0.6 },
    { at: 4.0, actor: 'p3', do: 'moveTo', to: { x: 136, y: 34 }, dur: 0.4, ease: 'out' },
    { at: 4.0, actor: 'p3', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.6, actor: 'p1', do: 'vanish', dur: 0.2 },
    { at: 4.95, actor: 'p2', do: 'vanish', dur: 0.2 },
    { at: 5.1, actor: 'p3', do: 'vanish', dur: 0.2 },
    // 機器人轉一圈暈暈坐下
    { at: 4.3, actor: 'robot', do: 'spin', times: 1, dur: 0.5 },
    { at: 4.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 4.8, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.3 },
    // 恐龍跳起來擺出全倒的勝利姿勢
    { at: 5.0, actor: 'dino', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 5.0, actor: 'dino', do: 'moveTo', to: { x: 124, y: 70.3 }, arc: 8, dur: 0.35 },
    { at: 5.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 5.6, actor: 'dino', do: 'squash', amount: -0.2, dur: 0.3 },
    // 機器人咯咯笑，一桶水澆在恐龍頭上
    { at: 6.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 6.35, actor: 'bucket', do: 'pop', dur: 0.25 },
    { at: 6.7, actor: 'bucket', do: 'moveTo', to: { x: 131, y: 52 }, dur: 0.2 },
    { at: 6.7, actor: 'bucket', do: 'rotateTo', amount: -110, dur: 0.25 },
    { at: 7.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 7.0, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 7.5, actor: 'bucket', do: 'vanish', dur: 0.2 },
    { at: 7.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.5, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 8.0, actor: 'dino', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    // 回馬槍：機器人踩到水，一滑——自己滑出畫面
    { at: 8.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 8.5, actor: 'robot', do: 'rotateTo', amount: -80, dur: 0.2 },
    { at: 8.5, actor: 'robot', do: 'moveTo', to: { x: 180, y: 66 }, dur: 0.55, ease: 'in' },
    { at: 9.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
  ],
  builds: [
    // 浪花 → 三點水；滾在空中的水瓶 → 中間的「古」、右邊的「月」
    { at: 4.15, dur: 0.4, strokes: [0, 1, 2], from: 'dino', color: '#1971C2' },
    { at: 4.5, dur: 0.5, strokes: [3, 4, 5, 6, 7], from: 'p1', color: '#1864AB' },
    { at: 4.95, dur: 0.45, strokes: [8, 9, 10, 11], from: 'p3', color: '#1864AB' },
  ],
  glyph: [{ at: 5.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'sweat', actor: 'dino' },
    { at: 1.8, kind: 'pop', actor: 'dino', emoji: '💡', dur: 0.4 },
    { at: 3.05, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 3.45, kind: 'burst', actor: 'dino', emoji: '💦', n: 4, dur: 0.5, dx: 6 },
    { at: 3.6, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.4 },
    { at: 4.0, kind: 'burst', x: 112, y: 58, n: 1, dur: 0.3 },
    { at: 4.8, kind: 'dizzy', actor: 'robot', dur: 1.0 },
    { at: 5.6, kind: 'pop', actor: 'dino', emoji: '🎳', dur: 0.6 },
    { at: 6.5, kind: 'pop', actor: 'robot', emoji: '😆', dur: 0.5 },
    { at: 6.9, kind: 'rain', actor: 'dino', emoji: '💧', dur: 0.6 },
    { at: 7.5, kind: 'burst', actor: 'dino', emoji: '💧', n: 5, dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'dino', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    // 肚子滑行跟拍，撞上水瓶退回全景
    { at: 3.45, dur: 0.3, do: 'follow', actor: 'dino', amount: 1.3 },
    { at: 4.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.0, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.2, say: '湖' },
    { at: 2.7, sfx: 'tap' },
    { at: 3.45, sfx: 'slide' },
    { at: 4.0, sfx: 'crack' },
    { at: 4.15, sfx: 'splash' },
    { at: 5.5, say: '湖' },
    { at: 6.95, say: '湖水' },
    { at: 7.0, sfx: 'splash' },
    { at: 8.5, sfx: 'slide' },
    { at: 9.05, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
