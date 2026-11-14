// 演的是字面意思：神（神奇）＋龍——一條會變魔法的龍從雲海裡升起來，想幫熊貓烤糰子，可是每一口吐出來的都不一樣。（沒有任何球、許願）
import { scene } from '../../story/scene'

// 清晨的山頂、腳下一片雲海：熊貓舉著一串糰子等著。雲裡冒出一條金色的龍，熊貓請他噴火烤糰子——
// 第一口：只吐出一小團煙。第二口：噗！吐出一大堆花，熊貓頭上戴滿了花。第三口：龍深吸一口氣、整條身體鼓起來……
// 停一拍……只咳出一小朵煙。熊貓放下糰子——轟！大火噴出來，熊貓整張臉烤黑了，糰子烤得香噴噴。
// 龍不好意思，轉一圈灑出魔法星星，熊貓變回白白的。龍盤在天上亮相：「神龍」。熊貓一口吃掉糰子。
const P = 70.3 // 熊貓（size 16）站在地上的 y
const PANDA = 44
const DANGO = { x: PANDA + 10, y: 60 } // 熊貓舉著的糰子
const SKY = { x: 112, y: 42 } // 龍飄著的位置
const MOUTH = { x: SKY.x - 13, y: SKY.y - 10 } // 龍的嘴（🐉 頭朝左上）

export default scene({
  duration: 9.6,
  bg: { top: '#FF9FC2', bottom: '#FFE6B8', floor: '#F7EEFF', scenery: 'hills' },
  actors: [
    { id: 'peak', emoji: '🏔️', x: 18, y: 63, size: 34 },
    { id: 'c3', emoji: '☁️', x: 70, y: 18, size: 16, float: true },
    { id: 'dragon', emoji: '🐉', x: SKY.x + 6, y: 118, size: 34, float: true, tint: 'hue-rotate(-125deg) saturate(1.3)' },
    { id: 'c2', emoji: '☁️', x: 128, y: 70, size: 34, float: true },
    { id: 'c1', emoji: '☁️', x: 84, y: 73, size: 22, float: true },
    { id: 'panda', emoji: '🐼', x: PANDA, y: P, size: 16 },
    { id: 'crown', emoji: '🌸', x: PANDA, y: 58, size: 8, float: true, hidden: true },
    { id: 'dango', emoji: '🍡', x: DANGO.x, y: DANGO.y, size: 11, float: true },
  ],
  moves: [
    // 雲海動一動，龍從雲裡升起來
    { at: 0.15, actor: 'c2', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 0.4, actor: 'dragon', do: 'moveTo', to: SKY, dur: 0.9, ease: 'back' },
    { at: 1.35, actor: 'panda', do: 'hop', amount: 4, dur: 0.35 },
    { at: 1.35, actor: 'dango', do: 'hop', amount: 4, dur: 0.35 },
    // 第一口：一小團煙
    { at: 1.9, actor: 'dragon', do: 'squash', amount: -0.12, dur: 0.3 },
    { at: 2.2, actor: 'dragon', do: 'tilt', amount: -8, dur: 0.3 },
    // 第二口：吐出一堆花，熊貓頭上戴滿了花
    { at: 2.9, actor: 'dragon', do: 'squash', amount: -0.2, dur: 0.35 },
    { at: 2.9, actor: 'dragon', do: 'shake', amount: 0.5, dur: 0.35 },
    { at: 3.3, actor: 'dragon', do: 'tilt', amount: -12, dur: 0.35 },
    { at: 3.45, actor: 'crown', do: 'pop', dur: 0.3 },
    // 第三口：深吸一口氣、整條鼓起來……只咳出一小朵煙
    { at: 4.1, actor: 'dragon', do: 'moveTo', to: { x: SKY.x + 3, y: SKY.y - 5 }, dur: 0.5, ease: 'out' },
    { at: 4.1, actor: 'dragon', do: 'scaleTo', amount: 1.15, dur: 0.5, ease: 'out' },
    { at: 4.2, actor: 'dragon', do: 'shake', amount: 0.7, dur: 0.7 },
    { at: 4.95, actor: 'dragon', do: 'scaleTo', amount: 0.87, dur: 0.2 },
    { at: 4.95, actor: 'dragon', do: 'moveTo', to: SKY, dur: 0.2 },
    // 熊貓放下糰子……轟！大火
    { at: 5.25, actor: 'dango', do: 'moveTo', to: { x: DANGO.x, y: 66 }, dur: 0.25 },
    { at: 5.6, actor: 'dragon', do: 'tilt', amount: -18, dur: 0.5 },
    { at: 5.6, actor: 'panda', do: 'tint', filter: 'brightness(0.3)' },
    { at: 5.6, actor: 'crown', do: 'vanish', dur: 0.15 },
    { at: 5.6, actor: 'dango', do: 'tint', filter: 'sepia(0.8) saturate(1.6) brightness(0.85)' },
    { at: 5.6, actor: 'panda', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 6.1, actor: 'panda', do: 'shake', amount: 0.5, dur: 0.4 },
    // 龍不好意思，轉一圈灑魔法星星，熊貓變回白白的
    { at: 6.55, actor: 'dragon', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    { at: 6.9, actor: 'panda', do: 'tint', filter: '' },
    { at: 6.9, actor: 'panda', do: 'hop', amount: 5, dur: 0.35 },
    // 龍盤在天上亮相；熊貓一口吃掉糰子
    { at: 7.2, actor: 'dragon', do: 'moveTo', to: { x: 98, y: 50 }, dur: 0.4, ease: 'back' },
    { at: 7.2, actor: 'dragon', do: 'scaleTo', amount: 1.35, dur: 0.4, ease: 'back' },
    { at: 7.25, actor: 'dango', do: 'moveTo', to: { x: PANDA + 6, y: 63 }, dur: 0.3 },
    { at: 8.0, actor: 'dango', do: 'scaleTo', amount: 0.6, dur: 0.15 },
    { at: 8.0, actor: 'panda', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 8.2, actor: 'dragon', do: 'hop', amount: 3, dur: 0.4 },
  ],
  fx: [
    { at: 0.5, kind: 'puff', actor: 'c2', n: 8, dur: 0.6 },
    { at: 1.4, kind: 'bubble', actor: 'panda', emoji: '🔥', dur: 0.9 },
    { at: 2.2, kind: 'burst', x: MOUTH.x - 4, y: MOUTH.y + 2, emoji: '💨', n: 3, dur: 0.6 },
    { at: 2.55, kind: 'pop', actor: 'panda', emoji: '😑', dur: 0.5 },
    { at: 3.3, kind: 'line', actor: 'dragon', target: 'panda', color: '#FFB3D1', width: 3, dur: 0.35 },
    { at: 3.4, kind: 'burst', actor: 'panda', emoji: '🌸', n: 12, dur: 0.9 },
    { at: 3.8, kind: 'pop', actor: 'panda', emoji: '😅', dx: 9, dur: 0.5 },
    { at: 4.3, kind: 'sweat', actor: 'panda' },
    { at: 4.95, kind: 'burst', x: MOUTH.x - 2, y: MOUTH.y + 4, emoji: '💨', n: 2, dur: 0.5 },
    { at: 5.05, kind: 'pop', actor: 'panda', emoji: '❓', dx: 8, dur: 0.4 },
    { at: 5.55, kind: 'line', actor: 'dragon', target: 'panda', color: '#FF8A2A', width: 9, dur: 0.5 },
    { at: 5.6, kind: 'burst', actor: 'panda', emoji: '🔥', n: 10, dur: 0.7 },
    { at: 5.9, kind: 'puff', actor: 'panda', n: 8, dur: 0.7 },
    { at: 6.1, kind: 'pop', actor: 'dragon', emoji: '😳', dx: -10, dur: 0.5 },
    { at: 6.6, kind: 'burst', actor: 'panda', emoji: '✨', n: 10, dur: 0.8 },
    { at: 7.3, kind: 'burst', actor: 'dragon', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'pop', actor: 'panda', emoji: '😋', dx: -8, dur: 0.7 },
    { at: 8.1, kind: 'burst', actor: 'dragon', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 4.1, dur: 0.8, do: 'zoom', amount: 1.25, to: { x: 80, y: 60 } },
    { at: 5.55, dur: 0.45, do: 'shake', amount: 1.8 },
    { at: 5.6, dur: 0.6, do: 'punch', amount: 0.15, to: { x: PANDA, y: 66 } },
    { at: 7.2, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 80, y: 70 } },
  ],
  lights: [
    // 清晨：一開始有點暗，龍升起來時天亮了
    { at: 0, dur: 0.01, level: 0.3 },
    { at: 0.5, dur: 0.8, level: 0 },
    { at: 5.55, dur: 0.05, level: -0.4 },
    { at: 5.6, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.5, sfx: 'whoosh' },
    { at: 1.35, sfx: 'boing' },
    { at: 2.2, sfx: 'poof' },
    { at: 3.3, sfx: 'blip' },
    { at: 4.1, sfx: 'rumble' },
    { at: 4.95, sfx: 'deflate' },
    { at: 5.55, sfx: 'crack' },
    { at: 6.55, sfx: 'clink' },
    { at: 7.3, say: '神龍' },
    { at: 8.0, sfx: 'gulp' },
    { at: 8.2, sfx: 'cheer' },
  ],
})
