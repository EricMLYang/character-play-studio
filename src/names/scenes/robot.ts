// 演的是字面意思：機器＋人——一個會動的機器做的人，在運動場上學小青蛙做暖身操，學過頭轉到冒煙。
import { scene } from '../../story/scene'

// 運動會的跑道：機器人咚一聲降落，小青蛙揮揮手帶暖身操。青蛙跳一下，機器人慢半拍「咚」地跳一下；青蛙彎腰，機器人彎過頭；
// 青蛙轉一圈，機器人跟著轉——停不下來！越轉越快、全身發紅冒火花，喀！冒煙當機，倒在地上。
// 青蛙戳一戳……沒反應；再戳一戳……還是沒反應，青蛙難過地轉身——叮！機器人眼睛亮起來，噴火飛上天繞一圈，
// 咚地落地擺姿勢：「機器人」。青蛙學他擺姿勢，結果自己轉暈了。
const R = 66.1 // 機器人（size 26）站在地上的 y
const B = 71.1 // 青蛙（size 14）
const BOT = 92
const BUN = 56

export default scene({
  duration: 9.6,
  bg: { top: '#8FD0FF', bottom: '#E4F4FF', floor: '#D9785A', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: 18, y: 69.4, size: 20 },
    { id: 'cone', emoji: '🚧', x: 140, y: 70.3, size: 16 },
    { id: 'bot', emoji: 'hero:robot/idle', x: BOT, y: R, size: 26, hidden: true },
    { id: 'bun', emoji: '🐸', x: BUN, y: B, size: 14 },
    { id: 'medal', emoji: '🥇', x: BOT, y: 30, size: 10, hidden: true, float: true },
  ],
  moves: [
    // 機器人從天上咚一聲降落
    { at: 0.1, actor: 'bot', do: 'drop', dur: 0.45 },
    { at: 0.75, actor: 'bun', do: 'hop', amount: 3, dur: 0.3 },
    // 青蛙跳一下 → 機器人慢半拍跳一下（很笨重）
    { at: 1.1, actor: 'bun', do: 'hop', amount: 7, dur: 0.4 },
    { at: 1.5, actor: 'bot', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: 1.6, actor: 'bot', do: 'hop', amount: 3, dur: 0.35 },
    // 青蛙彎腰 → 機器人彎過頭
    { at: 2.1, actor: 'bun', do: 'tilt', amount: -18, dur: 0.5 },
    { at: 2.45, actor: 'bot', do: 'tilt', amount: -40, dur: 0.7 },
    { at: 2.5, actor: 'bot', do: 'shake', amount: 0.6, dur: 0.6 },
    // 青蛙轉一圈 → 機器人跟著轉，停不下來
    { at: 3.2, actor: 'bun', do: 'hop', amount: 4, dur: 0.4 },
    { at: 3.2, actor: 'bun', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
    { at: 3.7, actor: 'bot', do: 'spin', times: 7, dur: 1.4, pivot: 'center' },
    { at: 3.7, actor: 'bot', do: 'bounce', amount: 2, times: 5, dur: 1.4 },
    { at: 4.0, actor: 'bot', do: 'tint', filter: 'hue-rotate(165deg) saturate(1.8)' },
    { at: 4.0, actor: 'bun', do: 'moveTo', to: { x: BUN - 10, y: B }, dur: 0.3, ease: 'out' },
    // 喀！冒煙當機，倒下
    { at: 5.1, actor: 'bot', do: 'swap', emoji: 'hero:robot/broken' },
    { at: 5.1, actor: 'bot', do: 'tint', filter: '' },
    { at: 5.15, actor: 'bot', do: 'rotateTo', amount: 20, dur: 0.3, ease: 'bounce' },
    // 青蛙戳一戳……沒反應；再戳……還是沒反應，難過轉身
    { at: 5.5, actor: 'bun', do: 'moveTo', to: { x: BOT - 27, y: B }, dur: 0.35 },
    { at: 5.9, actor: 'bun', do: 'tilt', amount: 15, dur: 0.25 },
    { at: 6.25, actor: 'bun', do: 'tilt', amount: 15, dur: 0.25 },
    { at: 6.6, actor: 'bun', do: 'flip' },
    // 叮！眼睛亮了：噴火飛上天繞一圈
    { at: 6.85, actor: 'bot', do: 'rotateTo', amount: -20, dur: 0.15 },
    { at: 6.85, actor: 'bot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 6.9, actor: 'bot', do: 'moveTo', to: { x: 118, y: 30 }, dur: 0.35, ease: 'in' },
    { at: 7.25, actor: 'bot', do: 'moveTo', to: { x: BOT - 2, y: R }, arc: 10, dur: 0.4, ease: 'in' },
    { at: 6.95, actor: 'bun', do: 'flip' },
    { at: 6.95, actor: 'bun', do: 'moveTo', to: { x: BOT - 32, y: B }, arc: 5, dur: 0.35, ease: 'out' },
    // 咚地落地擺姿勢，拿到獎牌
    { at: 7.65, actor: 'bot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 7.65, actor: 'bot', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 7.8, actor: 'medal', do: 'pop', dur: 0.3 },
    { at: 7.8, actor: 'medal', do: 'moveTo', to: { x: BOT - 1, y: 61 }, dur: 0.35, ease: 'bounce' },
    // 青蛙學他擺姿勢，結果自己轉暈
    { at: 8.3, actor: 'bun', do: 'hop', amount: 5, dur: 0.4 },
    { at: 8.3, actor: 'bun', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: 8.85, actor: 'bun', do: 'tilt', amount: -20, dur: 0.5 },
  ],
  fx: [
    { at: 0.55, kind: 'puff', actor: 'bot', n: 8, dur: 0.5 },
    { at: 0.8, kind: 'pop', actor: 'bun', emoji: '👋', dur: 0.5 },
    { at: 1.95, kind: 'pop', actor: 'bot', emoji: '✅', dx: 10, dur: 0.4 },
    { at: 2.7, kind: 'sweat', actor: 'bot' },
    { at: 4.1, kind: 'burst', actor: 'bot', emoji: '⚡', n: 6, dur: 0.6 },
    { at: 4.6, kind: 'burst', actor: 'bot', emoji: '⚡', n: 8, dur: 0.6 },
    { at: 4.2, kind: 'pop', actor: 'bun', emoji: '😱', dur: 0.6 },
    { at: 5.1, kind: 'burst', actor: 'bot', n: 1, dur: 0.4 },
    { at: 5.15, kind: 'puff', actor: 'bot', n: 10, dur: 0.8 },
    { at: 5.3, kind: 'stink', actor: 'bot', dur: 1.4 },
    { at: 5.95, kind: 'pop', actor: 'bun', emoji: '❓', dur: 0.4 },
    { at: 6.6, kind: 'pop', actor: 'bun', emoji: '😢', dx: -6, dur: 0.5 },
    { at: 6.8, kind: 'pop', actor: 'bot', emoji: '💡', dur: 0.4 },
    { at: 6.9, kind: 'puff', actor: 'bot', n: 8, dur: 0.6 },
    { at: 7.65, kind: 'burst', actor: 'bot', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.1, kind: 'burst', actor: 'bot', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 8.8, kind: 'dizzy', actor: 'bun', dur: 0.8 },
  ],
  camera: [
    { at: 0.55, dur: 0.3, do: 'shake', amount: 1 },
    { at: 5.1, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: 5.1, dur: 0.6, do: 'punch', amount: 0.15, to: { x: BOT, y: 60 } },
    { at: 7.6, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: BOT - 6, y: 64 } },
  ],
  lights: [
    { at: 5.1, dur: 0.05, level: -0.3 },
    { at: 5.15, dur: 0.3, level: 0.35 },
    { at: 6.85, dur: 0.05, level: -0.25 },
    { at: 6.9, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.5, sfx: 'bonk' },
    { at: 1.1, sfx: 'boing' },
    { at: 1.55, sfx: 'bonk' },
    { at: 2.45, sfx: 'slide' },
    { at: 3.7, sfx: 'whoosh' },
    { at: 4.2, sfx: 'rumble' },
    { at: 5.1, sfx: 'crack' },
    { at: 5.25, sfx: 'deflate' },
    { at: 5.9, sfx: 'tap' },
    { at: 6.25, sfx: 'tap' },
    { at: 6.85, sfx: 'laser' },
    { at: 7.65, sfx: 'boing' },
    { at: 7.8, say: '機器人' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
