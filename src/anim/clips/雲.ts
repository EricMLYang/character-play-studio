import type { Clip } from '../clip'

// 雲：豬探長用放大鏡發現一大團白雲「是線索！」，全速衝過去——雲剛好往上飄一下，他從底下鑽過去摔個狗吃屎；
// 倒著退得更遠再衝，雲剛好落下「碰」：雲頂壓成雨字頭、震出四滴雨點，下面捲成云。他被壓成薄餅，放大鏡裡冒出一朵小雲朵，最後小雲朵對他下雨。雲、雲、雲朵
const clip: Clip = {
  char: '雲',
  meta: { theme: '偵探追線索', cast: '豬探長＋大白雲＋小雲朵', gags: ['衝過去雲剛好飄走', '倒退再衝撞上', '壓成薄餅', '小雲朵下雨回馬槍'] },
  duration: 10,
  bg: { top: '#24345E', bottom: '#3E5486', floor: '#5B6E8F', scenery: 'night' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 132, y: 67, size: 22, float: true },
    { id: 'pig', emoji: 'hero:pig/think', x: 20, y: 71, size: 14, flip: true, hidden: true },
    { id: 'mini', emoji: '☁️', x: 124, y: 55, size: 7, float: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'pig', do: 'enter', from: { x: -15, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 0.6, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
    // 四隻蹄子抓地，身體往後拉
    { at: 1.0, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.6 },
    { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 衝！雲往上飄一下
    { at: 1.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 1.65, actor: 'pig', do: 'moveTo', to: { x: 120, y: 71 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 1.8, actor: 'cloud', do: 'moveTo', to: { x: 132, y: 46 }, dur: 0.3, ease: 'out' },
    // 從底下鑽過去，肚子滑行摔成一團
    { at: 2.1, actor: 'pig', do: 'moveTo', to: { x: 150, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 2.1, actor: 'pig', do: 'spin', times: 1, dur: 0.45 },
    { at: 2.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 2.55, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    // 站起來，倒退著退到最左邊
    { at: 2.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 3.0, actor: 'pig', do: 'moveTo', to: { x: 12, y: 71 }, dur: 0.7 },
    { at: 3.0, actor: 'pig', do: 'bounce', amount: 1.2, times: 4, dur: 0.7 },
    { at: 3.6, actor: 'cloud', do: 'moveTo', to: { x: 132, y: 67 }, dur: 0.6, ease: 'inOut' },
    // 停一拍，噴氣，放大鏡往前當撞城槌
    { at: 3.75, actor: 'pig', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 4.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 4.1, actor: 'pig', do: 'moveTo', to: { x: 118, y: 71 }, dur: 0.35, anticipate: 5, ease: 'in' },
    // 碰！
    { at: 4.45, actor: 'cloud', do: 'squash', amount: 0.5, dur: 0.5 },
    { at: 4.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 4.45, actor: 'pig', do: 'squash', amount: 0.6, dur: 1.6 },
    { at: 5.95, actor: 'cloud', do: 'vanish', dur: 0.2 },
    // 彈回原形
    { at: 6.1, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 6.5, actor: 'pig', do: 'tilt', amount: -10, dur: 0.4 },
    // 放大鏡裡冒出一朵小雲朵
    { at: 6.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 7.0, actor: 'mini', do: 'pop', dur: 0.3 },
    { at: 7.3, actor: 'mini', do: 'moveTo', to: { x: 120, y: 50 }, dur: 0.5, ease: 'out' },
    { at: 7.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.6, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：伸手去碰，小雲朵也往上一飄，然後對著他下雨
    { at: 8.2, actor: 'pig', do: 'hop', amount: 6, dur: 0.4 },
    { at: 8.25, actor: 'mini', do: 'moveTo', to: { x: 120, y: 40 }, dur: 0.25, ease: 'out' },
    { at: 8.7, actor: 'mini', do: 'moveTo', to: { x: 120, y: 48 }, dur: 0.3 },
    { at: 8.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
  ],
  builds: [
    // 雲頂壓扁成雨字頭，震出四滴雨點，下面捲成云
    { at: 4.55, dur: 0.5, strokes: [0, 1, 2, 3], from: 'cloud', color: '#4C6EF5' },
    { at: 5.05, dur: 0.35, strokes: [4, 5, 6, 7], from: 'cloud', style: 'drop', color: '#74C0FC' },
    { at: 5.4, dur: 0.45, strokes: [8, 9, 10, 11], from: 'cloud', color: '#4C6EF5' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.55, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.4 },
    { at: 1.65, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 2.0, kind: 'pop', actor: 'cloud', emoji: '😌', dur: 0.4, dy: 8 },
    { at: 2.6, kind: 'dizzy', actor: 'pig', dur: 0.6, dx: -4 },
    { at: 3.75, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 3.8, kind: 'pop', actor: 'pig', emoji: '😤', dur: 0.4 },
    { at: 4.45, kind: 'burst', actor: 'cloud', n: 1, dur: 0.4, dx: -8, dy: 10 },
    { at: 5.05, kind: 'rain', actor: 'cloud', emoji: '💧', dur: 0.5 },
    { at: 4.8, kind: 'dizzy', actor: 'pig', dur: 1.2 },
    { at: 7.0, kind: 'puff', actor: 'mini', dur: 0.4 },
    { at: 7.7, kind: 'pop', actor: 'pig', emoji: '💕', dur: 0.5 },
    { at: 8.7, kind: 'rain', actor: 'mini', emoji: '💧', dur: 1.0 },
    { at: 9.0, kind: 'sweat', actor: 'pig' },
  ],
  camera: [
    { at: 1.65, dur: 0.3, do: 'follow', actor: 'pig', amount: 1.3 },
    { at: 2.7, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.1, say: '雲' },
    { at: 1.65, sfx: 'whoosh' },
    { at: 2.1, sfx: 'slide' },
    { at: 2.55, sfx: 'plop' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.45, sfx: 'bonk' },
    { at: 5.9, say: '雲' },
    { at: 6.1, sfx: 'boing' },
    { at: 7.0, sfx: 'poof' },
    { at: 7.1, say: '雲朵' },
    { at: 8.7, sfx: 'splash' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
