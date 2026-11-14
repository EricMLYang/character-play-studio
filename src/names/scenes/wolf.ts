// 演的是字面意思：大＋野狼——一隻野狼半夜想用大大的叫聲嚇小羊，結果被月亮上自己的大影子嚇到，躲到小羊後面。
import { scene } from '../../story/scene'

// 月亮很圓的晚上：野狼踮著腳溜到睡覺的小羊後面，「嗷！」——小羊照睡（落空）。野狼不服氣，跳上大石頭，吸一大口氣，
// 「嗷嗚——」！月亮上冒出一隻好大好大的狼影子。野狼嚇得跳下石頭，躲到小羊後面發抖；小羊醒來一臉問號。
// 野狼探出頭小小叫一聲——影子也小小叫一聲：原來是自己！他跳上小羊的背，挺胸變大，影子跟著變大：「大野狼」。小羊又睡著了。
const W = 69.4 // 野狼（size 18）站在地上的 y
const S = 68.6 // 小羊（size 20）
const ROCK = { x: 50, y: 69.4 } // 大石頭 size 18
const ON_ROCK = 61.5
const ON_SHEEP = { x: 112, y: 56 }
const SHADOW = 'brightness(0) opacity(0.75)'

export default scene({
  duration: 9.4,
  bg: { top: '#14244A', bottom: '#3B4F86', floor: '#2F5A4A', scenery: 'night' },
  actors: [
    { id: 'moon', emoji: '🌕', x: 74, y: 36, size: 30, float: true },
    { id: 'shadow', emoji: '🐺', x: 74, y: 33, size: 14, tint: SHADOW, hidden: true, float: true },
    { id: 'tree', emoji: '🌲', x: 142, y: 59, size: 42 },
    { id: 'owl', emoji: '🦉', x: 136, y: 40, size: 9, float: true },
    { id: 'rock', emoji: '🪨', x: ROCK.x, y: ROCK.y, size: 18 },
    { id: 'fence', emoji: '🌾', x: 132, y: 72, size: 12 },
    { id: 'wolf', emoji: '🐺', x: 46, y: W, size: 18 },
    { id: 'sheep', emoji: '🐑', x: 110, y: S, size: 20 },
  ],
  moves: [
    // 踮腳溜進來
    { at: 0, actor: 'wolf', do: 'enter', from: { x: -14, y: W }, dur: 1.1, ease: 'out' },
    { at: 0, actor: 'wolf', do: 'hop', amount: 2, dur: 0.27 },
    { at: 0.28, actor: 'wolf', do: 'hop', amount: 2, dur: 0.27 },
    { at: 0.56, actor: 'wolf', do: 'hop', amount: 2, dur: 0.27 },
    { at: 0.84, actor: 'wolf', do: 'hop', amount: 2, dur: 0.27 },
    { at: 1.2, actor: 'wolf', do: 'moveTo', to: { x: 94, y: W }, dur: 0.5, ease: 'inOut' },
    // 「嗷！」——小羊照睡
    { at: 1.8, actor: 'wolf', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 2.1, actor: 'wolf', do: 'scaleTo', amount: 1.3, dur: 0.15, ease: 'back' },
    { at: 2.1, actor: 'wolf', do: 'hop', amount: 3, dur: 0.3 },
    { at: 2.5, actor: 'wolf', do: 'scaleTo', amount: 1 / 1.3, dur: 0.25 },
    { at: 2.6, actor: 'owl', do: 'tilt', amount: 15, dur: 0.5 },
    // 跳上大石頭，吸一大口氣
    { at: 3.0, actor: 'wolf', do: 'moveTo', to: { x: ROCK.x, y: ON_ROCK }, arc: 12, dur: 0.5, ease: 'out' },
    { at: 3.6, actor: 'wolf', do: 'scaleTo', amount: 1.4, dur: 0.5, ease: 'out' },
    { at: 3.6, actor: 'wolf', do: 'squash', amount: -0.2, dur: 0.5 },
    // 「嗷嗚——」月亮上冒出好大的影子
    { at: 4.1, actor: 'wolf', do: 'hop', amount: 4, dur: 0.35 },
    { at: 4.2, actor: 'shadow', do: 'pop', dur: 0.3 },
    { at: 4.2, actor: 'shadow', do: 'scaleTo', amount: 1.35, dur: 0.3, ease: 'back' },
    { at: 4.6, actor: 'wolf', do: 'shake', amount: 1, dur: 0.3 },
    // 嚇得跳下來，躲到小羊後面發抖
    { at: 4.9, actor: 'wolf', do: 'scaleTo', amount: 1 / 1.4, dur: 0.3 },
    { at: 4.9, actor: 'wolf', do: 'moveTo', to: { x: 120, y: W }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 5.45, actor: 'wolf', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 5.5, actor: 'sheep', do: 'hop', amount: 3, dur: 0.3 },
    { at: 5.8, actor: 'sheep', do: 'tilt', amount: -12, dur: 0.5 },
    // 探出頭小小叫一聲——影子也小小叫一聲
    { at: 6.1, actor: 'wolf', do: 'hop', amount: 7, dur: 0.4 },
    { at: 6.1, actor: 'shadow', do: 'hop', amount: 3, dur: 0.35 },
    { at: 6.1, actor: 'shadow', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    // 跳上小羊的背，挺胸變大，影子跟著變大
    { at: 6.75, actor: 'wolf', do: 'moveTo', to: ON_SHEEP, arc: 8, dur: 0.4, ease: 'out' },
    { at: 7.15, actor: 'sheep', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.2, actor: 'wolf', do: 'scaleTo', amount: 1.7, dur: 0.35, ease: 'back' },
    { at: 7.2, actor: 'shadow', do: 'scaleTo', amount: 2.4, dur: 0.35, ease: 'back' },
    { at: 7.9, actor: 'owl', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.0, actor: 'wolf', do: 'hop', amount: 2, dur: 0.3 },
    { at: 8.0, actor: 'shadow', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'sheep', dur: 2.6 },
    { at: 1.85, kind: 'pop', actor: 'owl', emoji: '👀', dx: -6, dur: 0.5 },
    { at: 2.1, kind: 'burst', actor: 'wolf', emoji: '❗', n: 4, dur: 0.5 },
    { at: 2.65, kind: 'pop', actor: 'wolf', emoji: '😑', dx: -10, dur: 0.6 },
    { at: 3.5, kind: 'puff', actor: 'wolf', dur: 0.4 },
    { at: 4.1, kind: 'burst', actor: 'wolf', emoji: '💥', n: 5, dur: 0.6 },
    { at: 4.2, kind: 'burst', actor: 'shadow', emoji: '✨', n: 6, dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'wolf', emoji: '😱', dx: -12, dur: 0.7 },
    { at: 5.5, kind: 'sweat', actor: 'wolf' },
    { at: 5.55, kind: 'pop', actor: 'sheep', emoji: '❓', dx: -10, dur: 0.6 },
    { at: 6.45, kind: 'pop', actor: 'wolf', emoji: '💡', dx: 8, dur: 0.5 },
    { at: 7.2, kind: 'burst', actor: 'wolf', emoji: '⭐', n: 8, dur: 0.9 },
    { at: 7.6, kind: 'zzz', actor: 'sheep', dx: -12, dy: 8, dur: 1.6 },
    { at: 7.9, kind: 'pop', actor: 'owl', emoji: '😆', dx: -6, dur: 0.6 },
    { at: 8.0, kind: 'burst', actor: 'wolf', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 3.5, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 60, y: 45 } },
    { at: 4.1, dur: 0.45, do: 'shake', amount: 1.5 },
    { at: 4.85, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 7.2, dur: 0.3, do: 'punch', amount: 0.12, to: { x: 110, y: 45 } },
    { at: 7.6, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 98, y: 50 } },
  ],
  lights: [
    { at: 3.6, dur: 0.5, level: 0.35 },
    { at: 4.8, dur: 0.6, level: 0.1 },
    { at: 7.15, dur: 0.05, level: -0.35 },
    { at: 7.2, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'tap' },
    { at: 0.56, sfx: 'tap' },
    { at: 2.1, sfx: 'boing' },
    { at: 2.65, sfx: 'blip' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 4.1, sfx: 'rumble' },
    { at: 4.6, sfx: 'crack' },
    { at: 4.9, sfx: 'slide' },
    { at: 6.1, sfx: 'blip' },
    { at: 6.75, sfx: 'boing' },
    { at: 7.3, say: '大野狼' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
