import type { Clip } from '../clip'

// 龜：龜兔賽跑。兔子咻一下跑到終點前睡大覺，烏龜一步……一步……慢慢爬，累到冒汗。
// 想到了！縮進殼裡變成火箭，轟——衝過去，把睡覺的兔子吹得轉圈圈，火箭的煙變成「龜」，烏龜拿金牌。龜、龜、龜兔賽跑
const clip: Clip = {
  char: '龜',
  meta: { theme: '龜兔賽跑', cast: '烏龜＋兔子', gags: ['慢吞吞', '殼變火箭', '兔子被吹轉圈'] },
  duration: 10,
  bg: { top: '#DDF1FF', bottom: '#F3F9E8', floor: '#C96F4A', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: 155, y: 70, size: 12, hidden: true },
    { id: 'rabbit', emoji: '🐇', x: 30, y: 70.5, size: 15, hidden: true, flip: true },
    { id: 'turtle', emoji: '🐢', x: 16, y: 70.5, size: 15, hidden: true, flip: true },
    { id: 'medal', emoji: '🥇', x: 142, y: 54, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flag', do: 'pop' },
    { at: 0.15, actor: 'turtle', do: 'pop' },
    { at: 0.3, actor: 'rabbit', do: 'pop' },
    // 兔子蓄力，咻——跑到終點前，躺下睡覺
    { at: 0.8, actor: 'rabbit', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 1.05, actor: 'rabbit', do: 'moveTo', to: { x: 121, y: 70.5 }, dur: 0.4 },
    { at: 1.45, actor: 'rabbit', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 2.0, actor: 'rabbit', do: 'rotateTo', amount: -80, dur: 0.4 },
    { at: 2.0, actor: 'rabbit', do: 'moveTo', to: { x: 121, y: 75 }, dur: 0.4 },
    // 烏龜一步……一步……
    { at: 1.6, actor: 'turtle', do: 'squash', amount: -0.12, dur: 0.5 },
    { at: 1.7, actor: 'turtle', do: 'moveTo', to: { x: 19, y: 70.5 }, dur: 0.8 },
    { at: 2.7, actor: 'turtle', do: 'squash', amount: -0.12, dur: 0.5 },
    { at: 2.8, actor: 'turtle', do: 'moveTo', to: { x: 22, y: 70.5 }, dur: 0.8 },
    // 想到了：縮進殼裡……變火箭，抖、抖、抖
    { at: 4.2, actor: 'turtle', do: 'swap', emoji: '🚀' },
    { at: 4.2, actor: 'turtle', do: 'flip' },
    { at: 4.2, actor: 'turtle', do: 'rotateTo', amount: 45, dur: 0.2 },
    { at: 4.4, actor: 'turtle', do: 'shake', amount: 1, dur: 0.6 },
    { at: 5.0, actor: 'turtle', do: 'moveTo', to: { x: 190, y: 68 }, dur: 0.45 },
    // 兔子被吹得轉圈圈
    { at: 5.25, actor: 'rabbit', do: 'rotateTo', amount: 80, dur: 0.01 },
    { at: 5.25, actor: 'rabbit', do: 'moveTo', to: { x: 121, y: 70.5 }, dur: 0.01 },
    { at: 5.25, actor: 'rabbit', do: 'hop', amount: 16, dur: 0.7 },
    { at: 5.25, actor: 'rabbit', do: 'spin', times: 2, dur: 0.7 },
    { at: 5.95, actor: 'rabbit', do: 'squash', amount: 0.35, dur: 0.3 },
    // 烏龜從天上掉到終點，拿金牌
    { at: 6.6, actor: 'turtle', do: 'swap', emoji: '🐢' },
    { at: 6.6, actor: 'turtle', do: 'flip' },
    { at: 6.6, actor: 'turtle', do: 'rotateTo', amount: -45, dur: 0.01 },
    { at: 6.6, actor: 'turtle', do: 'moveTo', to: { x: 142, y: 70.5 }, dur: 0.01 },
    { at: 6.62, actor: 'turtle', do: 'drop', dur: 0.6 },
    { at: 7.2, actor: 'medal', do: 'pop' },
    { at: 7.3, actor: 'turtle', do: 'hop', amount: 4, dur: 0.4 },
    { at: 7.3, actor: 'medal', do: 'hop', amount: 4, dur: 0.4 },
    // 尾聲：兔子還暈暈的，烏龜開心地彈兩下
    { at: 9.2, actor: 'turtle', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 發射的煙 → 左邊；天上落下來 → 上面的頭；把兔子吹飛的風 → 右邊
    { at: 5.0, dur: 0.7, strokes: [8, 9, 10, 11, 12, 13], from: { x: 24, y: 66 }, color: '#7A8A99' },
    { at: 5.5, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], style: 'drop', from: { x: 80, y: 0 }, color: '#2F8F5B' },
    { at: 5.9, dur: 0.7, strokes: [6, 7, 14, 15, 16, 17], from: 'rabbit', color: '#E0702B' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.2, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'rabbit', emoji: '😎', dur: 0.8 },
    { at: 1.05, kind: 'puff', actor: 'rabbit' },
    { at: 2.4, kind: 'zzz', actor: 'rabbit', dur: 2.7, dy: 4 },
    { at: 3.2, kind: 'sweat', actor: 'turtle', dur: 0.9 },
    { at: 3.8, kind: 'pop', actor: 'turtle', emoji: '💡', dur: 0.6 },
    { at: 4.2, kind: 'burst', actor: 'turtle', emoji: '💨', n: 6, dur: 0.5 },
    { at: 4.95, kind: 'burst', x: 22, y: 66, emoji: '🔥', n: 6, dur: 0.5 },
    { at: 5.25, kind: 'pop', actor: 'rabbit', emoji: '😱', dur: 0.6 },
    { at: 6.0, kind: 'dizzy', actor: 'rabbit', dur: 3.2 },
    { at: 7.2, kind: 'burst', actor: 'turtle', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.4, kind: 'pop', actor: 'rabbit', emoji: '😳', dur: 0.9 },
  ],
  camera: [
    { at: 4.2, dur: 0.9, do: 'punch', amount: 0.3, to: { x: 24, y: 62 } },
    { at: 5.0, dur: 0.5, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.05, sfx: 'whoosh' },
    { at: 1.75, say: '龜' },
    { at: 3.8, sfx: 'blip' },
    { at: 4.2, sfx: 'poof' },
    { at: 4.4, sfx: 'rumble' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 5.95, sfx: 'bonk' },
    { at: 6.7, say: '龜' },
    { at: 7.2, sfx: 'plop' },
    { at: 7.7, say: '龜兔賽跑' },
    { at: 9.3, sfx: 'cheer' },
  ],
}

export default clip
