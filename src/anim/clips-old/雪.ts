import type { Clip } from '../clip'

// 雪：拉布拉多警長舉著雪球、豬探長扛著三齒雪耙，在雪地上來一場友誼對決；兩個都大力揮空、各自轉圈，晃到中間額頭碰額頭「咚」地坐倒。
// 雪球炸開凍成上面的雨字頭，雪耙轉一轉平躺成下面的彐，「雪」完成。天上下起雪，兩個頭上都戴了一頂雪帽子，握手和好。雪、雪、下雪
const clip: Clip = {
  char: '雪',
  meta: { theme: '雪地對決', cast: '拉布拉多警長＋豬探長＋雪球＋雪耙', gags: ['大力揮空自己轉圈', '額頭碰額頭坐倒', '雪球砸頭回馬槍'] },
  duration: 10,
  bg: { top: '#D8ECFF', bottom: '#F2F8FF', floor: '#F4F8FC', scenery: 'snow' },
  actors: [
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: 22, y: 71, size: 14, flip: true },
    { id: 'ball', emoji: '⚪', x: 31, y: 61, size: 7, float: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 138, y: 71, size: 14 },
    { id: 'rake', emoji: '🔱', x: 129, y: 63, size: 10, float: true },
    { id: 'cap1', emoji: '☁️', x: 22, y: 62, size: 7, hidden: true, float: true, tint: 'brightness(1.15)' },
    { id: 'cap2', emoji: '☁️', x: 138, y: 61, size: 7, hidden: true, float: true, tint: 'brightness(1.15)' },
    { id: 'big', emoji: '⚪', x: 138, y: 60, size: 10, hidden: true, float: true },
  ],
  moves: [
    // 對峙
    { at: 0.4, actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 0.6, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.3 },
    // 警長超大的往後拉——呼！揮空，自己轉兩圈
    { at: 1.6, actor: 'sheriff', do: 'squash', amount: -0.3, dur: 0.45 },
    { at: 1.6, actor: 'sheriff', do: 'tilt', amount: -22, dur: 0.45 },
    { at: 1.6, actor: 'ball', do: 'moveTo', to: { x: 24, y: 58 }, dur: 0.45 },
    { at: 2.05, actor: 'sheriff', do: 'moveTo', to: { x: 40, y: 71 }, dur: 0.6 },
    { at: 2.05, actor: 'sheriff', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.05, actor: 'ball', do: 'moveTo', to: { x: 49, y: 61 }, dur: 0.6, arc: 6 },
    // 豬探長全速搖擺衝過來，揮太高，往另一邊轉
    { at: 2.3, actor: 'pig', do: 'moveTo', to: { x: 120, y: 71 }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 2.3, actor: 'rake', do: 'moveTo', to: { x: 111, y: 63 }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 2.8, actor: 'pig', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.8, actor: 'rake', do: 'spin', times: 2, dur: 0.6 },
    // 兩個暈暈地滑到中間，鼻子對鼻子
    { at: 3.45, actor: 'sheriff', do: 'moveTo', to: { x: 71, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 3.45, actor: 'ball', do: 'moveTo', to: { x: 74, y: 52 }, dur: 0.45, ease: 'out' },
    { at: 3.45, actor: 'pig', do: 'moveTo', to: { x: 89, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 3.45, actor: 'rake', do: 'moveTo', to: { x: 98, y: 60 }, dur: 0.45, ease: 'out' },
    { at: 3.9, actor: 'sheriff', do: 'shake', amount: 0.7, dur: 0.35 },
    { at: 3.9, actor: 'pig', do: 'shake', amount: 0.7, dur: 0.35 },
    // 咚！額頭碰額頭，坐倒
    { at: 4.3, actor: 'sheriff', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.3, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.45, actor: 'sheriff', do: 'moveTo', to: { x: 22, y: 71 }, dur: 0.45, arc: 8, ease: 'out' },
    { at: 4.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 4.45, actor: 'pig', do: 'moveTo', to: { x: 138, y: 71 }, dur: 0.45, arc: 8, ease: 'out' },
    // 雪球飛上去炸開；雪耙轉一轉
    { at: 4.35, actor: 'ball', do: 'moveTo', to: { x: 80, y: 22 }, dur: 0.3, ease: 'out' },
    { at: 4.65, actor: 'ball', do: 'vanish', dur: 0.1 },
    { at: 4.4, actor: 'rake', do: 'moveTo', to: { x: 80, y: 62 }, dur: 0.9, arc: 20 },
    { at: 4.4, actor: 'rake', do: 'spin', times: 2, dur: 0.9 },
    { at: 5.45, actor: 'rake', do: 'vanish', dur: 0.15 },
    // 下雪了，兩個頭上都戴了雪帽子
    { at: 6.9, actor: 'cap1', do: 'drop', dur: 0.5 },
    { at: 7.0, actor: 'cap2', do: 'drop', dur: 0.5 },
    { at: 7.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.6, actor: 'cap1', do: 'moveTo', to: { x: 22, y: 58 }, dur: 0.1 },
    { at: 7.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.6, actor: 'cap2', do: 'moveTo', to: { x: 138, y: 57 }, dur: 0.1 },
    // 回馬槍：警長得意地吹哨——震下一顆大雪球，正好砸在豬探長頭上
    { at: 8.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 8.2, actor: 'cap1', do: 'moveTo', to: { x: 22, y: 61 }, dur: 0.1 },
    { at: 8.7, actor: 'big', do: 'drop', dur: 0.4 },
    { at: 8.7, actor: 'cap2', do: 'vanish', dur: 0.2 },
    { at: 9.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 9.05, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.1, actor: 'big', do: 'vanish', dur: 0.2 },
    { at: 9.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 9.35, actor: 'cap1', do: 'moveTo', to: { x: 22, y: 58 }, dur: 0.1 },
  ],
  builds: [
    // 雪球凍成上面的雨字頭：蓋子、方框、中間一豎、四顆冰珠
    { at: 4.7, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: { x: 80, y: 22 }, color: '#1C7ED6' },
    // 雪耙平躺下來，三根耙齒朝右：彐
    { at: 5.45, dur: 0.5, strokes: [8, 9, 10], from: 'rake', color: '#0B5394' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.45, dur: 0.55, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'sheriff', emoji: '😤', dur: 0.6 },
    { at: 0.7, kind: 'pop', actor: 'pig', emoji: '😠', dur: 0.6 },
    { at: 0.9, dur: 1.2, kind: 'rain', x: 80, y: 8, emoji: '❄️', n: 5 },
    { at: 2.65, kind: 'dizzy', actor: 'sheriff', dur: 0.8 },
    { at: 3.4, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    { at: 3.95, kind: 'sweat', actor: 'sheriff' },
    { at: 3.95, kind: 'sweat', actor: 'pig' },
    { at: 4.3, kind: 'burst', x: 80, y: 58, emoji: '💥', dur: 0.4 },
    { at: 4.62, kind: 'burst', x: 80, y: 22, emoji: '❄️', n: 8, dur: 0.6 },
    { at: 4.95, kind: 'dizzy', actor: 'sheriff', dur: 1.5 },
    { at: 4.95, kind: 'dizzy', actor: 'pig', dur: 1.5 },
    // 下雪：雪花落在兩個人頭上
    { at: 6.4, dur: 1.0, kind: 'rain', actor: 'sheriff', dy: -14, emoji: '❄️', n: 6 },
    { at: 6.5, dur: 1.0, kind: 'rain', actor: 'pig', dy: -14, emoji: '❄️', n: 6 },
    { at: 7.65, kind: 'pop', actor: 'sheriff', emoji: '🤝', dur: 0.6 },
    { at: 7.75, kind: 'pop', actor: 'pig', emoji: '🤝', dx: -10, dur: 0.6 },
    { at: 8.25, kind: 'pop', actor: 'sheriff', emoji: '🎵', dur: 0.6 },
    { at: 9.05, kind: 'burst', actor: 'pig', emoji: '❄️', n: 6, dur: 0.5 },
  ],
  camera: [
    // 碰頭前那半拍推近
    { at: 3.8, dur: 0.75, do: 'punch', amount: 0.3, to: { x: 80, y: 60 } },
    { at: 4.32, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.1, say: '雪' },
    { at: 2.05, sfx: 'whoosh' },
    { at: 2.8, sfx: 'whoosh' },
    { at: 3.45, sfx: 'slide' },
    { at: 4.3, sfx: 'bonk' },
    { at: 4.62, sfx: 'poof' },
    { at: 6.0, say: '雪' },
    { at: 6.6, say: '下雪' },
    { at: 8.2, sfx: 'blip' },
    { at: 9.05, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
