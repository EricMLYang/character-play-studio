import type { Clip } from '../clip'

// 雲（重做）：豬探長用放大鏡發現一大團白雲「是線索！」，衝過去——雲往上一飄，他從底下滑過去臉著地，雲還偷笑。
// 他退回去蓄力、舉著放大鏡全速衝，這次雲「碰」地整團坐在他身上：雲頂壓成雨字頭、震出四滴雨點、下面捲成云。
// 國字讓到上方，他從薄餅彈回來，走到中間用放大鏡一看——一朵小雲朵從鏡子裡冒出來（雲朵）。想抱它，小雲朵又往上一飄（第一招再來），
// 變成雷雨雲劈他一下，整隻豬被電成黑炭。雲、雲、雲朵
const G = 67.8 // 豬探長（size 22）站在地上的 y

const clip: Clip = {
  char: '雲',
  meta: { theme: '偵探抓雲', cast: '豬探長＋大白雲＋小雲朵', gags: ['衝過去雲剛好飄走', '倒退蓄力再衝反被雲坐扁', '小雲朵又飄走', '雷雨雲電成黑炭'] },
  duration: 10,
  bg: { top: '#8EC9FF', bottom: '#E4F3FF', floor: '#B9D99A', scenery: 'hills' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 122, y: 60, size: 26, float: true },
    { id: 'mini', emoji: '☁️', x: 90, y: 52, size: 14, float: true, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 40, y: G, size: 22, flip: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'pig', do: 'enter', from: { x: -16, y: G }, dur: 0.55, ease: 'out' },
    // 拿出放大鏡一照：是線索！
    { at: 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 1.0, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
    { at: 1.2, actor: 'cloud', do: 'tilt', amount: 8, dur: 0.4 },
    // 第一次：蓄力衝過去，雲往上一飄，他從底下滑過去臉著地
    { at: 1.45, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 1.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 1.8, actor: 'pig', do: 'moveTo', to: { x: 116, y: G }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 1.95, actor: 'cloud', do: 'moveTo', to: { x: 122, y: 36 }, dur: 0.25, ease: 'out' },
    { at: 2.2, actor: 'pig', do: 'moveTo', to: { x: 140, y: G }, dur: 0.4, ease: 'out' },
    { at: 2.2, actor: 'pig', do: 'rotateTo', amount: 80, dur: 0.2 },
    { at: 2.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 2.75, actor: 'cloud', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    // 爬起來，倒退走回最左邊；雲偷偷降回原位
    { at: 3.05, actor: 'pig', do: 'rotateTo', amount: -80, dur: 0.2 },
    { at: 3.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 3.2, actor: 'pig', do: 'moveTo', to: { x: 34, y: G }, dur: 0.75 },
    { at: 3.4, actor: 'cloud', do: 'moveTo', to: { x: 122, y: 60 }, dur: 0.5 },
    // 第二次：蓄力更久，舉著放大鏡全速衝——雲整團坐在他身上
    { at: 4.0, actor: 'pig', do: 'squash', amount: -0.4, dur: 0.45 },
    { at: 4.0, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.45 },
    { at: 4.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 4.45, actor: 'pig', do: 'moveTo', to: { x: 122, y: G }, dur: 0.3, anticipate: 6, ease: 'in' },
    { at: 4.55, actor: 'cloud', do: 'moveTo', to: { x: 122, y: 54 }, dur: 0.18, ease: 'in' },
    { at: 4.75, actor: 'cloud', do: 'squash', amount: 0.5, dur: 0.5 },
    { at: 4.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 4.75, actor: 'pig', do: 'squash', amount: 0.6, dur: 1.25 },
    { at: 5.95, actor: 'cloud', do: 'vanish', dur: 0.2 },
    // 從薄餅彈回來
    { at: 6.1, actor: 'pig', do: 'hop', amount: 6, dur: 0.35 },
    { at: 6.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 6.55, actor: 'pig', do: 'tilt', amount: -10, dur: 0.35 },
    // 國字讓位：走到中間，用放大鏡一看——小雲朵冒出來
    { at: 7.0, actor: 'pig', do: 'flip' },
    { at: 7.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 7.0, actor: 'pig', do: 'moveTo', to: { x: 74, y: G }, dur: 0.5 },
    { at: 7.5, actor: 'pig', do: 'flip' },
    { at: 7.6, actor: 'mini', do: 'pop', dur: 0.3 },
    { at: 7.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.75, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.9, actor: 'mini', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：想抱它——小雲朵又往上一飄，變成雷雨雲劈下來
    { at: 8.2, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 8.35, actor: 'pig', do: 'hop', amount: 10, dur: 0.45 },
    { at: 8.4, actor: 'mini', do: 'moveTo', to: { x: 106, y: 40 }, dur: 0.2, ease: 'out' },
    { at: 8.6, actor: 'mini', do: 'swap', emoji: '⛈️' },
    { at: 8.6, actor: 'mini', do: 'scaleTo', amount: 1.4, dur: 0.15, ease: 'back' },
    { at: 8.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.8, actor: 'pig', do: 'tint', filter: 'brightness(.35) saturate(.4)' },
    { at: 8.8, actor: 'pig', do: 'shake', amount: 1.6, dur: 0.4 },
    // 黑炭豬晃到旁邊，雷雨雲跟著
    { at: 9.15, actor: 'pig', do: 'moveTo', to: { x: 126, y: G }, dur: 0.4 },
    { at: 9.15, actor: 'mini', do: 'moveTo', to: { x: 130, y: 34 }, dur: 0.4 },
  ],
  builds: [
    // 雲頂壓扁成雨字頭，震出四滴雨點，下面捲成云
    { at: 4.8, dur: 0.45, strokes: [0, 1, 2, 3], from: 'cloud', color: '#4C6EF5' },
    { at: 5.25, dur: 0.35, strokes: [4, 5, 6, 7], from: 'cloud', style: 'drop', color: '#22B8CF' },
    { at: 5.6, dur: 0.4, strokes: [8, 9, 10, 11], from: 'cloud', color: '#4C6EF5' },
  ],
  glyph: [
    { at: 6.0, dur: 0.4, do: 'wobble' },
    { at: 6.85, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.65, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.4 },
    { at: 1.25, kind: 'pop', actor: 'cloud', emoji: '😌', dy: 10, dur: 0.45 },
    { at: 1.45, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 2.6, kind: 'dizzy', actor: 'pig', dur: 0.5, dx: -4 },
    { at: 2.75, kind: 'pop', actor: 'cloud', emoji: '😆', dy: 10, dur: 0.5 },
    { at: 4.0, kind: 'pop', actor: 'pig', emoji: '😤', dur: 0.45 },
    { at: 4.0, kind: 'puff', actor: 'pig', dur: 0.45 },
    { at: 4.75, kind: 'burst', actor: 'cloud', n: 1, dx: -10, dy: 14, dur: 0.4 },
    { at: 5.25, kind: 'rain', actor: 'cloud', emoji: '💧', dur: 0.5 },
    { at: 5.0, kind: 'dizzy', actor: 'pig', dur: 1.0 },
    { at: 7.6, kind: 'burst', actor: 'mini', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.95, kind: 'pop', actor: 'pig', emoji: '💕', dur: 0.45 },
    { at: 8.5, kind: 'pop', actor: 'mini', emoji: '😠', dx: 4, dur: 0.35 },
    { at: 8.8, dur: 0.35, kind: 'zap', actor: 'mini', target: 'pig' },
    { at: 8.95, kind: 'stink', actor: 'pig', dur: 1.0 },
    { at: 9.0, kind: 'rain', actor: 'mini', emoji: '💧', dur: 0.9 },
  ],
  camera: [
    { at: 4.75, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    // 雷劈下來：白光一閃
    { at: 8.8, dur: 0.04, level: -0.6 },
    { at: 8.84, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 1.0, say: '雲' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 2.2, sfx: 'slide' },
    { at: 2.6, sfx: 'plop' },
    { at: 4.45, sfx: 'whoosh' },
    { at: 4.75, sfx: 'bonk' },
    { at: 6.0, say: '雲' },
    { at: 6.1, sfx: 'boing' },
    { at: 7.6, sfx: 'poof' },
    { at: 7.7, say: '雲朵' },
    { at: 8.35, sfx: 'boing' },
    { at: 8.8, sfx: 'crack' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
