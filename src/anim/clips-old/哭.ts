import type { Clip } from '../clip'

// 哭：橡膠恐龍手太短搆不到狗狗拉繩，只好用嘴咬住，跟機器人拔河；越拉越往後仰，用力到眼睛噴出小淚珠。繩子「啵」地彈開，兩個都跌坐在地，
// 兩個咬環彈上去變成兩個「口」，繩子捲成「犬」、繩結跳上去當那一點。恐龍坐在地上假裝大哭噴出淚泉，機器人馬達太強自己往後翻倒。哭、哭、大哭
const clip: Clip = {
  char: '哭',
  meta: { theme: '狗狗拉繩拔河', cast: '橡膠恐龍＋機器人＋拉繩玩具', gags: ['手太短搆不到只好用咬的', '拔河繩子彈開兩個跌坐', '假裝大哭噴淚泉', '馬達太強自己翻倒'] },
  duration: 10,
  bg: { top: '#BFE6FF', bottom: '#EEF8FF', floor: '#F3E9D2', scenery: 'room' },
  actors: [
    { id: 'toy', emoji: '🪢', x: 80, y: 70, size: 11 },
    { id: 'dino', emoji: 'hero:dino/idle', x: 34, y: 71, size: 14, hidden: true, flip: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 104, y: 71, size: 14, hidden: true },
  ],
  moves: [
    // 恐龍登場，伸短手搆拉繩——差一大截
    { at: 0, actor: 'dino', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0, actor: 'dino', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 0.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 0.6, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.4 },
    // 乾脆撲過去用嘴咬
    { at: 1.0, actor: 'dino', do: 'moveTo', to: { x: 66, y: 71 }, dur: 0.3, anticipate: 3, ease: 'in' },
    { at: 1.3, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 1.0, actor: 'robot', do: 'enter', from: { x: 175, y: 71 }, dur: 0.5, ease: 'back' },
    { at: 1.5, actor: 'robot', do: 'moveTo', to: { x: 94, y: 71 }, dur: 0.2 },
    // 拔河：兩邊越拉越往後仰
    { at: 1.8, actor: 'dino', do: 'moveTo', to: { x: 42, y: 71 }, dur: 1.4, ease: 'linear' },
    { at: 1.8, actor: 'robot', do: 'moveTo', to: { x: 118, y: 71 }, dur: 1.4, ease: 'linear' },
    { at: 1.8, actor: 'dino', do: 'rotateTo', amount: -18, dur: 1.2 },
    { at: 1.8, actor: 'robot', do: 'rotateTo', amount: 18, dur: 1.2 },
    { at: 1.8, actor: 'toy', do: 'shake', amount: 1, dur: 1.5 },
    { at: 2.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 3.2, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 3.2, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.25 },
    // 啵！繩子彈開，兩個往後飛、跌坐在地
    { at: 3.45, actor: 'toy', do: 'vanish', dur: 0.15 },
    { at: 3.45, actor: 'dino', do: 'moveTo', to: { x: 22, y: 71 }, dur: 0.45, arc: 8, ease: 'out' },
    { at: 3.45, actor: 'robot', do: 'moveTo', to: { x: 136, y: 71 }, dur: 0.45, arc: 8, ease: 'out' },
    { at: 3.45, actor: 'dino', do: 'rotateTo', amount: 18, dur: 0.3 },
    { at: 3.45, actor: 'robot', do: 'rotateTo', amount: -18, dur: 0.3 },
    { at: 3.9, actor: 'dino', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.9, actor: 'robot', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 3.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 嘴唇抖抖抖——仰頭假裝大哭
    { at: 5.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 5.3, actor: 'dino', do: 'shake', amount: 0.6, dur: 0.5 },
    { at: 5.9, actor: 'dino', do: 'rotateTo', amount: -14, dur: 0.2 },
    { at: 5.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 7.3, actor: 'dino', do: 'rotateTo', amount: 14, dur: 0.2 },
    { at: 6.2, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 6.4, actor: 'robot', do: 'tilt', amount: -12, dur: 0.4 },
    // 哭完咧嘴笑，跳舞
    { at: 7.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.6, actor: 'dino', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
    // 回馬槍：機器人也想跳，馬達太強自己往後翻倒
    { at: 8.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 8.1, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.55, actor: 'robot', do: 'rotateTo', amount: 80, dur: 0.4, ease: 'bounce' },
    { at: 8.55, actor: 'robot', do: 'moveTo', to: { x: 134, y: 74 }, dur: 0.4 },
    { at: 8.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
  ],
  builds: [
    // 兩個咬環 → 兩個口；繩子 → 犬；繩結 → 那一點
    { at: 3.5, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: 'toy', color: '#D6336C' },
    { at: 4.0, dur: 0.45, strokes: [6, 7, 8], from: 'toy', color: '#C92A2A' },
    { at: 4.45, dur: 0.2, strokes: [9], from: { x: 80, y: 70 }, color: '#C92A2A' },
  ],
  glyph: [{ at: 4.7, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'sweat', actor: 'dino' },
    { at: 0.7, kind: 'bubble', actor: 'dino', emoji: '🪢', dur: 0.6 },
    { at: 1.3, kind: 'pop', actor: 'dino', emoji: '💦', dur: 0.5 },
    { at: 1.7, kind: 'pop', actor: 'robot', emoji: '😠', dur: 0.4 },
    { at: 1.8, kind: 'line', actor: 'dino', target: 'robot', color: '#E03131', width: 2.2, dur: 1.65 },
    { at: 1.9, kind: 'puff', actor: 'dino', dur: 1.2 },
    { at: 1.9, kind: 'puff', actor: 'robot', dur: 1.2 },
    { at: 2.5, kind: 'pop', actor: 'dino', emoji: '💦', dur: 0.5 },
    { at: 3.45, kind: 'burst', x: 80, y: 62, n: 1, dur: 0.4 },
    { at: 3.95, kind: 'dizzy', actor: 'dino', dur: 1.2 },
    { at: 3.95, kind: 'dizzy', actor: 'robot', dur: 1.2 },
    { at: 5.95, kind: 'fountain', actor: 'dino', emoji: '💧', dx: 4, dur: 1.0 },
    { at: 6.5, kind: 'pop', actor: 'robot', emoji: '😅', dur: 0.6 },
    { at: 7.6, kind: 'pop', actor: 'dino', emoji: '😆', dur: 0.6 },
    { at: 8.9, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'robot', emoji: '❓', dur: 0.6 },
  ],
  camera: [
    { at: 1.9, dur: 1.2, do: 'zoom', amount: 1.3, to: { x: 80, y: 62 } },
    { at: 3.2, dur: 0.25, do: 'shake', amount: 0.6 },
    { at: 3.45, dur: 0.3, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.6, sfx: 'boing' },
    { at: 1.3, say: '哭' },
    { at: 1.9, sfx: 'rumble' },
    { at: 3.45, sfx: 'boing' },
    { at: 3.9, sfx: 'bonk' },
    { at: 4.0, sfx: 'clink' },
    { at: 4.75, say: '哭' },
    { at: 5.9, say: '大哭' },
    { at: 6.0, sfx: 'splash' },
    { at: 8.55, sfx: 'bonk' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
