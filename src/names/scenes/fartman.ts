// 演的是字面意思：屁屁＋超人——一個披披風的超人（自家主角）怎麼跳、怎麼跑都飛不起來，吃了一包豆子，「噗」一聲放屁才衝上天（沒有番薯、校長等原作情節）。
import { scene } from '../../story/scene'

// 運動場上的飛行比賽：小鳥拍拍翅膀就飛上終點旗，得意地看著超人。超人擺好姿勢、蹲低、跳——
// 在半空停一下……啪，臉朝下摔回地上。小鳥笑翻。他助跑、披風甩起來、用力一跳——絆到自己的披風滾了好幾圈。
// 他看到地上一包豆子，一口吃光。肚子咕嚕咕嚕……他回頭看屁股……停一拍……沒事。正要嘆氣——
// 「噗！」好大一團屁把他衝上天，小鳥被吹得在空中轉圈。超人在天上繞一圈，帥氣地落地擺姿勢：「屁屁超人」。
// 屁股後面又「噗」一小聲，把他抬高一點點。
const H = 15 // 超人的 size
const G = 77 - 0.42 * H
const BIRD = 11
const FLAG = { x: 140, y: 77 - 0.42 * 22 }
const ON_FLAG = { x: 136, y: FLAG.y - 12 } // 小鳥站在旗子上
const BEANS = { x: 116, y: 77 - 0.42 * 9 }
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const POSE = { x: 80, y: G }

export default scene({
  duration: 9.6,
  bg: { top: '#7FC6F5', bottom: '#E2F4FF', floor: '#D98C5F', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: FLAG.x, y: FLAG.y, size: 22 },
    { id: 'trophy', emoji: '🏆', x: 22, y: 77 - 0.42 * 12, size: 12 },
    { id: 'beans', emoji: '🫘', x: BEANS.x, y: BEANS.y, size: 9 },
    { id: 'fart', emoji: '💨', x: 60, y: 66, size: 22, float: true, hidden: true },
    { id: 'bird', emoji: '🐦', x: 58, y: 77 - 0.42 * BIRD, size: BIRD, flip: true },
    { id: 'hero', emoji: 'hero:cape/idle', x: 42, y: G, size: H },
  ],
  moves: [
    // ① 小鳥拍拍翅膀就飛上終點旗
    { at: 0.1, actor: 'bird', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 0.3, actor: 'bird', do: 'moveTo', to: ON_FLAG, arc: 18, dur: 0.7, ease: 'inOut' },
    { at: 1.05, actor: 'bird', do: 'flip' },
    { at: 1.1, actor: 'bird', do: 'hop', amount: 2, dur: 0.25 },
    // ② 超人擺姿勢、蹲低、跳——半空停一下……臉朝下摔回地上
    { at: 1.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 1.6, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 1.9, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 1.9, actor: 'hero', do: 'moveTo', to: { x: 46, y: 50 }, dur: 0.3, ease: 'out' },
    { at: 2.2, actor: 'hero', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 2.5, actor: 'hero', do: 'moveTo', to: { x: 48, y: G }, dur: 0.2, ease: 'in' },
    { at: 2.7, actor: 'hero', do: 'squash', amount: 0.5, dur: 0.4 },
    { at: 2.75, actor: 'bird', do: 'tilt', amount: 18, dur: 0.6 },
    // 助跑、用力一跳——絆到披風滾好幾圈
    { at: 3.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 3.2, actor: 'hero', do: 'flip' },
    { at: 3.3, actor: 'hero', do: 'moveTo', to: { x: 84, y: G }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 3.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.75, actor: 'hero', do: 'moveTo', to: { x: 104, y: G }, arc: 5, dur: 0.5, ease: 'out' },
    { at: 3.75, actor: 'hero', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: 4.3, actor: 'bird', do: 'hop', amount: 3, dur: 0.3 },
    // ③ 看到豆子，一口吃光
    { at: 4.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 4.9, actor: 'beans', do: 'moveTo', to: { x: 104, y: G - 6 }, arc: 6, dur: 0.25 },
    { at: 5.15, actor: 'beans', do: 'vanish', dur: 0.1 },
    { at: 5.15, actor: 'hero', do: 'squash', amount: -0.15, dur: 0.25 },
    // 肚子咕嚕咕嚕……回頭看屁股……沒事
    { at: 5.45, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 5.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 5.95, actor: 'hero', do: 'flip' },
    { at: 6.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 6.35, actor: 'hero', do: 'flip' },
    // ④ 噗！衝上天，小鳥被吹得在空中轉圈
    { at: 6.6, actor: 'fart', do: 'moveTo', to: { x: 96, y: 68 }, dur: 0.01 },
    { at: 6.6, actor: 'fart', do: 'pop', dur: 0.2 },
    { at: 6.6, actor: 'fart', do: 'scaleTo', amount: 2, dur: 0.4, ease: 'out' },
    { at: 6.6, actor: 'fart', do: 'moveTo', to: { x: 88, y: 66 }, dur: 0.6, ease: 'out' },
    { at: 7.1, actor: 'fart', do: 'vanish', dur: 0.4 },
    { at: 6.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 6.6, actor: 'hero', do: 'rotateTo', amount: 90, dur: 0.1, pivot: 'center' },
    { at: 6.6, actor: 'hero', do: 'moveTo', to: { x: 108, y: -20 }, dur: 0.35, ease: 'in' },
    { at: 6.65, actor: 'bird', do: 'moveTo', to: { x: 156, y: 18 }, dur: 0.5, ease: 'out' },
    { at: 6.65, actor: 'bird', do: 'spin', times: 3, dur: 0.6, pivot: 'center' },
    // 天上繞一圈回來，帥氣落地
    { at: 7.0, actor: 'hero', do: 'rotateTo', amount: 90, dur: 0.01, pivot: 'center' },
    { at: 7.0, actor: 'hero', do: 'moveTo', to: { x: 60, y: -20 }, dur: 0.01 },
    { at: 7.05, actor: 'hero', do: 'moveTo', to: { x: POSE.x, y: 40 }, dur: 0.3, ease: 'out' },
    { at: 7.05, actor: 'hero', do: 'rotateTo', amount: 180, dur: 0.3, pivot: 'center' },
    { at: 7.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 7.35, actor: 'hero', do: 'moveTo', to: POSE, dur: 0.2, ease: 'in' },
    { at: 7.55, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 7.6, actor: 'hero', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.4, actor: 'bird', do: 'moveTo', to: { x: 112, y: 77 - 0.42 * BIRD }, dur: 0.5, ease: 'in' },
    // 又「噗」一小聲，抬高一點點
    { at: 8.5, actor: 'hero', do: 'hop', amount: 3, dur: 0.45 },
    { at: 8.6, actor: 'bird', do: 'tilt', amount: -15, dur: 0.5 },
  ],
  fx: [
    { at: 0.3, kind: 'puff', actor: 'bird', n: 4, dur: 0.4 },
    { at: 1.15, kind: 'pop', actor: 'bird', emoji: '😎', dx: -8, dur: 0.6 },
    { at: 2.25, kind: 'sweat', actor: 'hero' },
    { at: 2.8, kind: 'pop', actor: 'bird', emoji: '😆', dx: -8, dur: 0.6 },
    { at: 3.3, kind: 'puff', actor: 'hero', n: 5, dur: 0.4 },
    { at: 4.25, kind: 'dizzy', actor: 'hero', dur: 0.6 },
    { at: 4.35, kind: 'pop', actor: 'bird', emoji: '😆', dx: -8, dur: 0.5 },
    { at: 4.8, kind: 'pop', actor: 'hero', emoji: '💡', dx: 8, dur: 0.4 },
    { at: 5.5, kind: 'pop', actor: 'hero', emoji: '😳', dx: 9, dur: 0.5 },
    { at: 6.0, kind: 'pop', actor: 'hero', emoji: '❓', dx: 9, dur: 0.5 },
    { at: 6.6, kind: 'puff', actor: 'fart', n: 12, dur: 0.7 },
    { at: 6.6, kind: 'stink', actor: 'fart', dur: 1.4 },
    { at: 6.7, kind: 'pop', actor: 'bird', emoji: '😵', dx: -6, dur: 0.6 },
    { at: 7.6, kind: 'burst', actor: 'hero', emoji: '⭐', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'dizzy', actor: 'bird', dur: 0.8 },
    { at: 8.4, kind: 'burst', actor: 'hero', emoji: '🎉', n: 8, dur: 0.9 },
    { at: 8.5, kind: 'puff', actor: 'hero', n: 3, dx: -6, dur: 0.4 },
  ],
  camera: [
    { at: 2.7, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 5.3, dur: 0.6, do: 'zoom', amount: 1.5, to: { x: 104, y: 56 } },
    { at: 6.6, dur: 0.4, do: 'shake', amount: 2 },
    { at: 6.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.6, dur: 0.5, do: 'zoom', amount: 1.4, to: look(POSE.x + 8, 54, 1.4) },
  ],
  lights: [
    { at: 6.6, dur: 0.05, level: -0.4 },
    { at: 6.65, dur: 0.4, level: 0 },
    { at: 7.0, dur: 0.01, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'whoosh' },
    { at: 1.9, sfx: 'boing' },
    { at: 2.7, sfx: 'bonk' },
    { at: 3.75, sfx: 'slide' },
    { at: 5.15, sfx: 'gulp' },
    { at: 5.45, sfx: 'rumble' },
    { at: 6.6, sfx: 'poof' },
    { at: 6.65, sfx: 'whoosh' },
    { at: 7.55, sfx: 'plop' },
    { at: 7.8, say: '屁屁超人' },
    { at: 8.5, sfx: 'poof' },
  ],
})
