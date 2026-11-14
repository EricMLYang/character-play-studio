// 演的是字面意思：噴＋火＋龍——一條龍感冒了，一打噴嚏就噴火，把母雞晾的衣服全烤焦（不是橘色有翅膀的原作造型，也沒有蚊子）。
import { scene } from '../../story/scene'

// 下雪的院子：母雞把最後一隻襪子夾上曬衣繩。旁邊的龍圍著圍巾、鼻子癢癢，「哈……哈……」母雞嚇得躲到籃子後面——
// 停一拍……沒打出來。母雞探頭、鬆一口氣走出來。龍突然「哈啾！」一大團火噴過曬衣繩，衣服褲子襪子全烤成黑的、冒黑煙。
// 母雞拿著一隻焦襪子瞪他，龍不好意思地縮起來。鼻子又癢了——母雞一跳跳到他頭上，把他的鼻子扳向天空：
// 「哈啾！」火球衝上天變成煙火，滿天亮晶晶。龍抬頭挺胸、母雞坐在他頭上取暖：「噴火龍」。
const D = 30 // 龍頭的 size（預設臉朝左）
const DG = 77 - 0.42 * D
const DRAGON = { x: 122, y: DG }
const MOUTH = { x: 110, y: DG + 4 }
const HEN = 13
const HG = 77 - 0.42 * HEN
const LINE_Y = 44
const CLOTHES = [
  { id: 'shirt', emoji: '👕', x: 34, size: 12 },
  { id: 'pants', emoji: '👖', x: 52, size: 13 },
  { id: 'sock', emoji: '🧦', x: 70, size: 9 },
]
const BURNT = 'brightness(0.25) saturate(0.3)'
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const ON_HEAD = { x: 124, y: DG - 18 }

export default scene({
  duration: 9.6,
  bg: { top: '#8FB8DE', bottom: '#E4F0FA', floor: '#F2F7FF', scenery: 'snow' },
  actors: [
    { id: 'tree1', emoji: '🌲', x: 20, y: 77 - 0.42 * 36, size: 36 },
    { id: 'tree2', emoji: '🌲', x: 88, y: 77 - 0.42 * 36, size: 36 },
    ...CLOTHES.map((c) => ({ id: c.id, emoji: c.emoji, x: c.x, y: LINE_Y + c.size * 0.45, size: c.size, float: true, hidden: c.id === 'sock' })),
    { id: 'basket', emoji: '🧺', x: 70, y: 77 - 0.42 * 11, size: 11 },
    { id: 'dragon', emoji: '🐲', x: DRAGON.x, y: DRAGON.y, size: D },
    { id: 'scarf', emoji: '🧣', x: 128, y: DG + 10, size: 12 },
    { id: 'fire1', emoji: '🔥', x: MOUTH.x, y: MOUTH.y, size: 10, float: true, hidden: true },
    { id: 'fire2', emoji: '🔥', x: MOUTH.x, y: MOUTH.y, size: 13, float: true, hidden: true },
    { id: 'fire3', emoji: '🔥', x: MOUTH.x, y: MOUTH.y, size: 10, float: true, hidden: true },
    { id: 'rocket', emoji: '🔥', x: 118, y: DG - 10, size: 10, float: true, hidden: true },
    { id: 'hen', emoji: '🐔', x: 72, y: HG, size: HEN },
  ],
  moves: [
    // ① 母雞夾好最後一隻襪子
    { at: 0.1, actor: 'hen', do: 'hop', amount: 6, dur: 0.35 },
    { at: 0.3, actor: 'sock', do: 'pop', dur: 0.25 },
    { at: 0.7, actor: 'hen', do: 'moveTo', to: { x: 56, y: HG }, dur: 0.5, ease: 'out' },
    // 龍鼻子癢癢：哈……哈……
    { at: 0.9, actor: 'dragon', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: 1.4, actor: 'dragon', do: 'squash', amount: -0.15, dur: 0.45 },
    { at: 1.4, actor: 'dragon', do: 'tilt', amount: 10, dur: 0.45 },
    { at: 1.9, actor: 'dragon', do: 'squash', amount: -0.22, dur: 0.55 },
    { at: 1.9, actor: 'dragon', do: 'tilt', amount: 14, dur: 0.55 },
    // 母雞嚇得躲到籃子後面
    { at: 1.6, actor: 'hen', do: 'moveTo', to: { x: 76, y: HG + 2 }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 1.9, actor: 'hen', do: 'shake', amount: 0.8, dur: 0.7 },
    // 停一拍……沒打出來。母雞探頭、走出來
    { at: 2.9, actor: 'dragon', do: 'hop', amount: -1, dur: 0.3 },
    { at: 3.3, actor: 'hen', do: 'hop', amount: 3, dur: 0.3 },
    { at: 3.65, actor: 'hen', do: 'moveTo', to: { x: 58, y: HG }, dur: 0.4, ease: 'out' },
    // ③ 哈啾！大火噴過曬衣繩
    { at: 4.1, actor: 'dragon', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.1, actor: 'dragon', do: 'moveTo', to: { x: DRAGON.x - 3, y: DRAGON.y }, dur: 0.1 },
    { at: 4.2, actor: 'dragon', do: 'moveTo', to: DRAGON, dur: 0.3, ease: 'out' },
    { at: 4.1, actor: 'fire1', do: 'pop', dur: 0.05 },
    { at: 4.15, actor: 'fire2', do: 'pop', dur: 0.05 },
    { at: 4.2, actor: 'fire3', do: 'pop', dur: 0.05 },
    { at: 4.1, actor: 'fire1', do: 'moveTo', to: { x: 20, y: LINE_Y + 2 }, dur: 0.45, ease: 'in' },
    { at: 4.15, actor: 'fire2', do: 'moveTo', to: { x: 30, y: LINE_Y + 8 }, dur: 0.45, ease: 'in' },
    { at: 4.2, actor: 'fire3', do: 'moveTo', to: { x: 24, y: LINE_Y + 14 }, dur: 0.45, ease: 'in' },
    { at: 4.15, actor: 'fire2', do: 'scaleTo', amount: 1.6, dur: 0.3 },
    { at: 4.55, actor: 'fire1', do: 'vanish', dur: 0.15 },
    { at: 4.6, actor: 'fire2', do: 'vanish', dur: 0.15 },
    { at: 4.65, actor: 'fire3', do: 'vanish', dur: 0.15 },
    { at: 4.25, actor: 'sock', do: 'tint', filter: BURNT },
    { at: 4.35, actor: 'pants', do: 'tint', filter: BURNT },
    { at: 4.45, actor: 'shirt', do: 'tint', filter: BURNT },
    { at: 4.3, actor: 'hen', do: 'hop', amount: 10, dur: 0.5 },
    { at: 4.3, actor: 'hen', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    // 焦襪子掉下來，母雞撿起來瞪他
    { at: 4.8, actor: 'sock', do: 'moveTo', to: { x: 62, y: 66 }, dur: 0.35, ease: 'in' },
    { at: 4.8, actor: 'sock', do: 'rotateTo', amount: 40, dur: 0.35 },
    { at: 5.3, actor: 'hen', do: 'flip' },
    { at: 5.4, actor: 'hen', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 5.5, actor: 'dragon', do: 'scaleTo', amount: 0.85, dur: 0.4 },
    // 鼻子又癢了——母雞跳上他的頭，把鼻子扳向天空
    { at: 6.1, actor: 'dragon', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: 6.25, actor: 'hen', do: 'moveTo', to: { x: ON_HEAD.x, y: ON_HEAD.y + 4 }, arc: 14, dur: 0.4, ease: 'out' },
    { at: 6.6, actor: 'dragon', do: 'rotateTo', amount: 35, dur: 0.25 },
    { at: 6.6, actor: 'hen', do: 'moveTo', to: { x: ON_HEAD.x + 6, y: ON_HEAD.y + 2 }, dur: 0.25 },
    // 哈啾！火球衝上天變成煙火
    { at: 6.95, actor: 'rocket', do: 'pop', dur: 0.05 },
    { at: 6.95, actor: 'rocket', do: 'moveTo', to: { x: 100, y: 12 }, dur: 0.3, ease: 'out' },
    { at: 6.95, actor: 'dragon', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 7.25, actor: 'rocket', do: 'vanish', dur: 0.1 },
    // ⑤ 抬頭挺胸，母雞坐在他頭上
    { at: 7.4, actor: 'dragon', do: 'rotateTo', amount: -35, dur: 0.3, ease: 'back' },
    { at: 7.4, actor: 'dragon', do: 'scaleTo', amount: 1.5, dur: 0.35, ease: 'back' },
    { at: 7.4, actor: 'scarf', do: 'scaleTo', amount: 1.3, dur: 0.35, ease: 'back' },
    { at: 7.4, actor: 'hen', do: 'moveTo', to: { x: 124, y: DG - 26 }, dur: 0.35, ease: 'back' },
    { at: 8.4, actor: 'hen', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.4, actor: 'dragon', do: 'hop', amount: 1.5, dur: 0.3 },
  ],
  fx: [
    { at: 0, kind: 'line', actor: 'tree1', to: { x: 88, y: LINE_Y }, dy: LINE_Y - (77 - 0.42 * 36), color: '#8A6A4A', width: 0.5, dur: 9.6 },
    { at: 0.9, kind: 'pop', actor: 'dragon', emoji: '🤧', dx: -12, dur: 0.6 },
    { at: 1.6, kind: 'pop', actor: 'hen', emoji: '😱', dx: -6, dur: 0.6 },
    { at: 2.95, kind: 'pop', actor: 'dragon', emoji: '😌', dx: -12, dur: 0.5 },
    { at: 3.3, kind: 'pop', actor: 'hen', emoji: '❓', dx: -6, dur: 0.5 },
    { at: 4.1, kind: 'burst', actor: 'fire2', emoji: '🔥', n: 7, dur: 0.6 },
    { at: 4.5, kind: 'stink', actor: 'pants', dur: 1.6 },
    { at: 4.5, kind: 'puff', actor: 'shirt', n: 6, dur: 0.7 },
    { at: 4.55, kind: 'puff', actor: 'hen', n: 6, dur: 0.5 },
    { at: 5.4, kind: 'pop', actor: 'hen', emoji: '💢', dx: 6, dur: 0.7 },
    { at: 5.6, kind: 'sweat', actor: 'dragon' },
    { at: 6.1, kind: 'pop', actor: 'dragon', emoji: '🤧', dx: -14, dur: 0.4 },
    { at: 7.25, kind: 'burst', actor: 'rocket', emoji: '✨', n: 12, dur: 1.1 },
    { at: 7.3, kind: 'burst', actor: 'rocket', emoji: '🎉', n: 8, dx: -16, dy: 6, dur: 1.0 },
    { at: 7.75, kind: 'burst', actor: 'dragon', emoji: '⭐', n: 10, dur: 0.9 },
    { at: 8.4, kind: 'pop', actor: 'hen', emoji: '💕', dx: 8, dur: 0.7 },
  ],
  camera: [
    { at: 1.4, dur: 1.0, do: 'zoom', amount: 1.35, to: { x: 96, y: 50 } },
    { at: 3.4, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.1, dur: 0.45, do: 'shake', amount: 2 },
    { at: 6.95, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 7.6, dur: 0.5, do: 'zoom', amount: 1.35, to: look(114, 46, 1.35) },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.1 },
    { at: 4.1, dur: 0.05, level: -0.4 },
    { at: 4.15, dur: 0.5, level: 0.15 },
    { at: 7.25, dur: 0.05, level: -0.35 },
    { at: 7.3, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'boing' },
    { at: 0.3, sfx: 'clink' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.95, sfx: 'blip' },
    { at: 4.1, sfx: 'achoo' },
    { at: 4.15, sfx: 'whoosh' },
    { at: 4.8, sfx: 'plop' },
    { at: 6.25, sfx: 'boing' },
    { at: 6.95, sfx: 'achoo' },
    { at: 7.25, sfx: 'crack' },
    { at: 7.6, say: '噴火龍' },
    { at: 8.4, sfx: 'cheer' },
  ],
})
