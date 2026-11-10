import type { Clip, Move } from '../clip'

// 晚：布忍者想偷走打瞌睡消防車車頂的小太陽燈籠，好讓天黑。高抬腿踮腳每一步都吱吱叫，燈籠一勾滑下來變成「日」；
// 偷溜時煙霧彈掉下來「噗」，消防車驚醒，兩個臉貼臉一起尖叫，水管一噴——忍者的圍巾、頭巾和水管圈飛起來落成「免」。天暗了，打呵欠說晚安；結尾又一顆煙霧彈「噗」，他以為自己隱形了。晚、晚、晚安
const STEPS = [1.0, 1.25, 1.5, 1.75]
const tiptoe: Move[] = STEPS.flatMap((at): Move[] => [
  { at, actor: 'ninja', do: 'hop', amount: 4, dur: 0.22 },
  { at: at + 0.1, actor: 'engine', do: 'shake', amount: 0.5, dur: 0.15 },
])

const clip: Clip = {
  char: '晚',
  meta: { theme: '忍者偷太陽', cast: '布忍者＋消防車＋太陽燈籠＋水管', gags: ['高抬腿每步都吱吱叫', '煙霧彈最糟時候爆開', '臉貼臉一起尖叫', '以為自己隱形'] },
  duration: 10,
  bg: { top: '#E9DDF7', bottom: '#FBEFE6', floor: '#D8C9E8', scenery: 'hills' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 18, y: 71.5, size: 13, flip: true },
    { id: 'bush', emoji: '🌳', x: 12, y: 66, size: 18 },
    { id: 'engine', emoji: '🚒', x: 132, y: 68.6, size: 20 },
    { id: 'lantern', emoji: '🏮', x: 130, y: 55, size: 7, float: true },
    { id: 'scarf', emoji: '🧣', x: 82, y: 66, size: 6, float: true, hidden: true },
    { id: 'loop', emoji: '➰', x: 86, y: 64, size: 6, float: true, hidden: true },
  ],
  moves: [
    // 從樹後探頭，指著燈籠
    { at: 0.2, actor: 'ninja', do: 'moveTo', to: { x: 32, y: 71.5 }, dur: 0.3, ease: 'out' },
    { at: 0.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 0.8, actor: 'ninja', do: 'squash', amount: 0.2, dur: 0.3 },
    // 高抬腿踮腳走過去，每一步都吱吱叫，消防車的燈抖一下
    { at: 0.95, actor: 'ninja', do: 'moveTo', to: { x: 112, y: 71.5 }, dur: 0.95, ease: 'linear' },
    ...tiptoe,
    // 伸長、用圍巾勾燈籠
    { at: 1.95, actor: 'ninja', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 2.0, actor: 'lantern', do: 'vanish', dur: 0.2 },
    // 得意地偷溜——煙霧彈掉下來「噗」
    { at: 2.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 2.8, actor: 'ninja', do: 'flip' },
    { at: 2.85, actor: 'ninja', do: 'moveTo', to: { x: 96, y: 71.5 }, dur: 0.6, ease: 'linear' },
    { at: 2.85, actor: 'ninja', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 3.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    // 消防車驚醒往前一衝，臉貼臉
    { at: 3.7, actor: 'engine', do: 'hop', amount: 3, dur: 0.25 },
    { at: 3.95, actor: 'ninja', do: 'flip' },
    { at: 3.95, actor: 'engine', do: 'moveTo', to: { x: 110, y: 68.6 }, dur: 0.2, ease: 'back' },
    { at: 4.1, actor: 'ninja', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.1, actor: 'engine', do: 'shake', amount: 1.5, dur: 0.4 },
    // 水管一噴，忍者被沖得轉圈，東西飛起來
    { at: 4.55, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.55, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.15 },
    { at: 4.7, actor: 'ninja', do: 'moveTo', to: { x: 26, y: 71.5 }, arc: 16, dur: 0.6, ease: 'out' },
    { at: 4.7, actor: 'ninja', do: 'spin', times: -2, dur: 0.6 },
    { at: 4.7, actor: 'scarf', do: 'pop', dur: 0.15 },
    { at: 4.7, actor: 'loop', do: 'pop', dur: 0.15 },
    { at: 4.7, actor: 'scarf', do: 'moveTo', to: { x: 96, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 4.7, actor: 'loop', do: 'moveTo', to: { x: 108, y: 18 }, dur: 0.35, ease: 'out' },
    { at: 5.2, actor: 'scarf', do: 'vanish', dur: 0.2 },
    { at: 5.6, actor: 'loop', do: 'vanish', dur: 0.2 },
    { at: 5.3, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.2, actor: 'engine', do: 'moveTo', to: { x: 132, y: 68.6 }, dur: 0.5 },
    // 天黑了：濕答答的忍者打呵欠、揮揮手；消防車也想睡了
    { at: 6.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 6.55, actor: 'ninja', do: 'squash', amount: -0.25, dur: 0.5 },
    { at: 6.7, actor: 'engine', do: 'hop', amount: 2, dur: 0.3 },
    { at: 7.4, actor: 'ninja', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 8.0, actor: 'ninja', do: 'tilt', amount: 15, dur: 0.6 },
    // 回馬槍：又一顆煙霧彈「噗」——他以為自己隱形了，其實大家都看得到
    { at: 8.7, actor: 'engine', do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 9.3, actor: 'ninja', do: 'squash', amount: 0.15, dur: 0.3 },
  ],
  builds: [
    // 太陽燈籠滑下來 → 日
    { at: 2.0, dur: 0.4, strokes: [0, 1, 2, 3], from: 'lantern', color: '#F08C00' },
    // 圍巾、頭巾、水管圈 → 免
    { at: 5.2, dur: 0.85, strokes: [4, 5, 6, 7, 8, 9, 10], from: 'scarf', color: '#5F3DC4' },
  ],
  glyph: [{ at: 6.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'ninja', emoji: '🌙', dur: 0.8 },
    { at: 1.6, dur: 0.6, kind: 'zzz', actor: 'engine', dx: -6 },
    { at: 2.3, kind: 'pop', actor: 'ninja', emoji: '😏', dur: 0.5 },
    { at: 3.3, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.6 },
    { at: 3.7, kind: 'pop', actor: 'engine', emoji: '❗', dx: -6, dur: 0.5 },
    { at: 4.1, kind: 'pop', actor: 'ninja', emoji: '😱', dur: 0.45 },
    { at: 4.1, kind: 'pop', actor: 'engine', emoji: '😱', dx: -6, dur: 0.45 },
    { at: 4.5, dur: 0.45, kind: 'line', actor: 'engine', dx: -8, dy: -2, target: 'ninja', color: '#4DABF7', width: 2.2 },
    { at: 4.55, kind: 'burst', actor: 'ninja', emoji: '💦', n: 6, dur: 0.5 },
    { at: 5.3, kind: 'rain', actor: 'ninja', emoji: '💧', dur: 0.8 },
    { at: 6.55, kind: 'pop', actor: 'ninja', emoji: '🥱', dur: 0.7 },
    { at: 6.7, kind: 'pop', actor: 'engine', emoji: '👋', dx: -6, dur: 0.6 },
    { at: 7.2, dur: 1.4, kind: 'zzz', actor: 'ninja' },
    { at: 7.2, dur: 1.4, kind: 'zzz', actor: 'engine', dx: -6 },
    { at: 8.6, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'engine', emoji: '😑', dx: -6, dur: 0.7 },
  ],
  camera: [
    // 臉貼臉尖叫那一下推近
    { at: 4.05, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 104, y: 62 } },
  ],
  lights: [
    // 燈籠被偷走，天慢慢暗下來；回馬槍消防車驚醒開燈
    { at: 5.6, dur: 1.2, level: 0.3 },
    { at: 8.65, dur: 0.2, level: 0 },
  ],
  cues: [
    ...STEPS.map((at) => ({ at, sfx: 'tap' as const })),
    { at: 2.0, sfx: 'slide' },
    { at: 2.45, say: '晚' },
    { at: 3.3, sfx: 'poof' },
    { at: 4.5, sfx: 'splash' },
    { at: 6.1, say: '晚' },
    { at: 6.6, say: '晚安' },
    { at: 8.6, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
