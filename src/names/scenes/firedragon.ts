// 演的是字面意思：小＋火＋龍——一條小小的龍，只噴得出小小的火，連一堆柴火都點不著，最後一打嗝噴出大火（不是尾巴有火的橘色蜥蜴）。
import { scene } from '../../story/scene'

// 晚上的營火派對：燈籠還沒點、柴火堆也還沒點，兔子冷得等著。一條小小的龍跳進來說「我來！」
// 呼——只冒出一縷煙。再用力——噴出一顆小火星，掉在柴堆前面滅了。兔子翻白眼。小龍深吸一口氣，整隻鼓得圓圓的……
// 停一拍……「噗」，洩氣了。兔子睡著了。小龍一個嗝——再一個嗝：轟！大火噴出去，柴火熊熊燒起來、兩盞燈籠全亮，
// 小龍被自己的嗝彈上天，轉兩圈，剛好落在禮物盒上挺胸：「小火龍」。兔子醒來烤火拍手，小龍又打一個小嗝。
const D = 10 // 小龍的 size（預設臉朝左）
const DG = 77 - 0.42 * D
const ME = { x: 110, y: DG }
const LOGS = { x: 82, y: 77 - 0.42 * 14 }
const GIFT = { x: 132, y: 77 - 0.42 * 14 }
const TOP = { x: 132, y: DG - 13 } // 小龍站在禮物盒上
const MOUTH = { x: ME.x - 5, y: ME.y - 3 }
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const OFF = 'brightness(0.45) saturate(0.4)'

export default scene({
  duration: 9.5,
  bg: { top: '#1F2350', bottom: '#4A3F7A', floor: '#4E6B4C', scenery: 'night' },
  actors: [
    { id: 'lantern1', emoji: '🏮', x: 96, y: 20, size: 11, float: true, tint: OFF },
    { id: 'lantern2', emoji: '🏮', x: 128, y: 16, size: 11, float: true, tint: OFF },
    { id: 'balloon', emoji: '🎈', x: 22, y: 40, size: 14, float: true },
    { id: 'gift', emoji: '🎁', x: GIFT.x, y: GIFT.y, size: 14 },
    { id: 'logs', emoji: '🪵', x: LOGS.x, y: LOGS.y, size: 14 },
    { id: 'bonfire', emoji: '🔥', x: LOGS.x, y: LOGS.y - 8, size: 16, hidden: true },
    { id: 'rabbit', emoji: '🐰', x: 50, y: 77 - 0.42 * 16, size: 16 },
    { id: 'spark', emoji: '🔥', x: MOUTH.x, y: MOUTH.y, size: 4, float: true, hidden: true },
    { id: 'blast', emoji: '🔥', x: MOUTH.x, y: MOUTH.y, size: 10, float: true, hidden: true },
    { id: 'dragon', emoji: '🐉', x: ME.x, y: ME.y, size: D },
  ],
  moves: [
    // ① 兔子等著，小龍跳進來
    { at: 0.1, actor: 'rabbit', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.1, actor: 'dragon', do: 'enter', from: { x: 172, y: DG }, dur: 0.7, ease: 'out' },
    { at: 0.85, actor: 'dragon', do: 'hop', amount: 4, dur: 0.3 },
    // ② 第一次：呼——只冒煙
    { at: 1.3, actor: 'dragon', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 1.6, actor: 'dragon', do: 'tilt', amount: -8, dur: 0.3 },
    // 第二次：一顆小火星，掉在地上滅了
    { at: 2.3, actor: 'dragon', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.5, actor: 'spark', do: 'pop', dur: 0.1 },
    { at: 2.55, actor: 'spark', do: 'moveTo', to: { x: LOGS.x + 12, y: 73 }, arc: 4, dur: 0.4, ease: 'in' },
    { at: 3.0, actor: 'spark', do: 'vanish', dur: 0.25 },
    { at: 2.8, actor: 'rabbit', do: 'tilt', amount: 10, dur: 0.5 },
    // 第三次：鼓得圓圓的……停一拍……噗，洩氣
    { at: 3.4, actor: 'dragon', do: 'scaleTo', amount: 1.8, dur: 0.6, ease: 'out' },
    { at: 4.0, actor: 'dragon', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 4.75, actor: 'dragon', do: 'scaleTo', amount: 1 / 1.8, dur: 0.3, ease: 'in' },
    { at: 4.75, actor: 'dragon', do: 'hop', amount: 3, dur: 0.3 },
    { at: 5.0, actor: 'rabbit', do: 'squash', amount: 0.2, dur: 0.4 },
    // ③ 嗝——再一個嗝：轟！
    { at: 5.5, actor: 'dragon', do: 'hop', amount: 3, dur: 0.2 },
    { at: 6.0, actor: 'dragon', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 6.05, actor: 'blast', do: 'pop', dur: 0.05 },
    { at: 6.05, actor: 'blast', do: 'moveTo', to: { x: LOGS.x + 4, y: LOGS.y - 8 }, dur: 0.25, ease: 'out' },
    { at: 6.05, actor: 'blast', do: 'scaleTo', amount: 3.2, dur: 0.25, ease: 'out' },
    { at: 6.35, actor: 'blast', do: 'vanish', dur: 0.25 },
    { at: 6.3, actor: 'bonfire', do: 'pop', dur: 0.25 },
    { at: 6.3, actor: 'bonfire', do: 'scaleTo', amount: 1.1, dur: 0.4, ease: 'elastic' },
    { at: 7.0, actor: 'rabbit', do: 'moveTo', to: { x: 62, y: 77 - 0.42 * 16 }, dur: 0.4, ease: 'out' },
    { at: 6.4, actor: 'lantern2', do: 'tint', filter: '' },
    { at: 6.5, actor: 'lantern1', do: 'tint', filter: '' },
    { at: 6.4, actor: 'lantern2', do: 'hop', amount: 2, dur: 0.3 },
    { at: 6.5, actor: 'lantern1', do: 'hop', amount: 2, dur: 0.3 },
    // 小龍被自己的嗝彈上天，轉兩圈，落在蛋糕上
    { at: 6.05, actor: 'dragon', do: 'moveTo', to: TOP, arc: 30, dur: 0.6, ease: 'out' },
    { at: 6.05, actor: 'dragon', do: 'spin', times: 2, dur: 0.55, pivot: 'center' },
    { at: 6.65, actor: 'gift', do: 'squash', amount: 0.2, dur: 0.25 },
    // ⑤ 站在蠟燭中間挺胸
    { at: 6.8, actor: 'dragon', do: 'scaleTo', amount: 2.3, dur: 0.35, ease: 'back' },
    { at: 7.0, actor: 'rabbit', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.4, actor: 'rabbit', do: 'hop', amount: 3, dur: 0.3 },
    // 又打一個小嗝
    { at: 8.5, actor: 'dragon', do: 'hop', amount: 2, dur: 0.25 },
    { at: 8.6, actor: 'rabbit', do: 'tilt', amount: -10, dur: 0.4 },
  ],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'rabbit', emoji: '🥶', dx: 8, dur: 0.6 },
    { at: 1.0, kind: 'pop', actor: 'dragon', emoji: '💪', dx: 8, dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'dragon', n: 3, dx: -6, dur: 0.5 },
    { at: 1.9, kind: 'pop', actor: 'dragon', emoji: '😅', dx: 8, dur: 0.4 },
    { at: 3.0, kind: 'puff', actor: 'spark', n: 3, dur: 0.4 },
    { at: 2.9, kind: 'pop', actor: 'rabbit', emoji: '😑', dx: -8, dur: 0.6 },
    { at: 4.0, kind: 'sweat', actor: 'dragon' },
    { at: 4.75, kind: 'puff', actor: 'dragon', n: 5, dx: -8, dur: 0.5 },
    { at: 5.0, kind: 'zzz', actor: 'rabbit', dur: 1.8 },
    { at: 5.5, kind: 'pop', actor: 'dragon', emoji: '😳', dx: 8, dur: 0.4 },
    { at: 6.05, kind: 'burst', actor: 'blast', emoji: '🔥', n: 8, dur: 0.6 },
    { at: 6.4, kind: 'burst', actor: 'bonfire', emoji: '✨', n: 8, dur: 0.6 },
    { at: 6.5, kind: 'puff', actor: 'logs', n: 8, dur: 0.6 },
    { at: 6.85, kind: 'burst', actor: 'dragon', emoji: '⭐', n: 10, dur: 0.9 },
    { at: 7.0, kind: 'pop', actor: 'rabbit', emoji: '❗', dx: -6, dur: 0.4 },
    { at: 7.6, kind: 'burst', actor: 'dragon', emoji: '🎉', n: 8, dur: 0.9 },
    { at: 8.5, kind: 'puff', actor: 'dragon', n: 3, dx: -10, dy: -6, dur: 0.4 },
  ],
  camera: [
    { at: 3.4, dur: 0.6, do: 'zoom', amount: 1.5, to: look(104, 56, 1.5) },
    { at: 4.75, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 6.05, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 6.8, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 128, y: 50 } },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.45, to: look(118, 50, 1.45) },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.3 },
    { at: 3.4, dur: 0.5, level: 0.4 },
    { at: 6.05, dur: 0.05, level: -0.45 },
    { at: 6.1, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.85, sfx: 'boing' },
    { at: 1.6, sfx: 'poof' },
    { at: 2.5, sfx: 'blip' },
    { at: 3.4, sfx: 'bubble' },
    { at: 4.75, sfx: 'deflate' },
    { at: 5.5, sfx: 'hic' },
    { at: 6.0, sfx: 'hic' },
    { at: 6.05, sfx: 'whoosh' },
    { at: 6.65, sfx: 'plop' },
    { at: 7.0, say: '小火龍' },
    { at: 7.6, sfx: 'cheer' },
    { at: 8.5, sfx: 'hic' },
  ],
})
