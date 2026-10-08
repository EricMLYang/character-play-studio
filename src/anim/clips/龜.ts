import type { Clip } from '../clip'

// 龜：龜兔賽跑，兔子一溜煙跑到終點前睡大覺，烏龜一步一步慢慢爬——想一想，縮進殼裡變成火箭，轟一聲衝過去，把兔子吹得轉圈圈，
// 火箭的煙變成「龜」。烏龜從天上掉到終點拿金牌；兔子不服氣，抱著紅蘿蔔也想變火箭，結果只噗一聲。龜、龜、龜兔賽跑
const clip: Clip = {
  char: '龜',
  meta: { theme: '龜兔賽跑', cast: '烏龜＋兔子', gags: ['慢吞吞', '殼變火箭', '兔子被吹轉圈', '紅蘿蔔火箭噗一聲'] },
  duration: 10,
  bg: { top: '#E9F7EC', bottom: '#CDEBD5', floor: '#C96F4A', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: 154, y: 73.2, size: 9, hidden: true },
    { id: 'rabbit', emoji: '🐇', x: 30, y: 72, size: 12, hidden: true, flip: true },
    { id: 'turtle', emoji: '🐢', x: 16, y: 72, size: 12, hidden: true, flip: true },
    { id: 'medal', emoji: '🥇', x: 143, y: 58, size: 6, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flag', do: 'pop' },
    { at: 0.1, actor: 'turtle', do: 'pop' },
    { at: 0.2, actor: 'rabbit', do: 'pop' },
    // 兔子咻一下跑到終點前，躺下睡覺
    { at: 0.9, actor: 'rabbit', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.1, actor: 'rabbit', do: 'moveTo', to: { x: 124, y: 72 }, dur: 0.35 },
    { at: 1.45, actor: 'rabbit', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.8, actor: 'rabbit', do: 'flip' },
    // 烏龜一步……一小步
    { at: 1.3, actor: 'turtle', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 1.4, actor: 'turtle', do: 'moveTo', to: { x: 18, y: 72 }, dur: 0.6 },
    { at: 2.3, actor: 'turtle', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 2.4, actor: 'turtle', do: 'moveTo', to: { x: 20, y: 72 }, dur: 0.6 },
    // 縮進殼裡……變火箭！
    { at: 3.3, actor: 'turtle', do: 'swap', emoji: '🚀' },
    { at: 3.3, actor: 'turtle', do: 'flip' },
    { at: 3.3, actor: 'turtle', do: 'rotateTo', amount: 45, dur: 0.2 },
    { at: 3.6, actor: 'turtle', do: 'shake', amount: 1, dur: 0.5 },
    { at: 4.1, actor: 'turtle', do: 'moveTo', to: { x: 185, y: 70 }, dur: 0.4 },
    // 火箭衝過去，兔子被吹得轉圈圈
    { at: 4.3, actor: 'rabbit', do: 'hop', amount: 18, dur: 0.6 },
    { at: 4.3, actor: 'rabbit', do: 'spin', times: 3, dur: 0.6 },
    { at: 4.9, actor: 'rabbit', do: 'squash', amount: 0.35, dur: 0.25 },
    // 烏龜從天上掉到終點旁邊
    { at: 6.4, actor: 'turtle', do: 'swap', emoji: '🐢' },
    { at: 6.4, actor: 'turtle', do: 'rotateTo', amount: -45, dur: 0.01 },
    { at: 6.4, actor: 'turtle', do: 'moveTo', to: { x: 143, y: 72 }, dur: 0.01 },
    { at: 6.45, actor: 'turtle', do: 'drop', dur: 0.6 },
    { at: 7.0, actor: 'medal', do: 'pop' },
    { at: 7.1, actor: 'turtle', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.1, actor: 'medal', do: 'hop', amount: 4, dur: 0.35 },
    // 兔子也想變火箭：紅蘿蔔……噗
    { at: 8.3, actor: 'rabbit', do: 'swap', emoji: '🥕' },
    { at: 8.3, actor: 'rabbit', do: 'rotateTo', amount: -45, dur: 0.2 },
    { at: 8.5, actor: 'rabbit', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 9.1, actor: 'rabbit', do: 'hop', amount: 3, dur: 0.3 },
    { at: 9.4, actor: 'rabbit', do: 'rotateTo', amount: 45, dur: 0.01 },
    { at: 9.4, actor: 'rabbit', do: 'swap', emoji: '🐇' },
    { at: 9.5, actor: 'turtle', do: 'bounce', amount: 2, times: 3, dur: 0.5 },
  ],
  builds: [
    // 發射台的煙 → 左邊；落下的煙 → 頭；吹飛兔子的風 → 右邊
    { at: 4.15, dur: 0.7, strokes: [8, 9, 10, 11, 12, 13], from: { x: 22, y: 68 }, color: '#7A8A99' },
    { at: 4.7, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], style: 'drop', from: { x: 80, y: 0 }, color: '#2F8F5B' },
    { at: 5.15, dur: 0.7, strokes: [6, 7, 14, 15, 16, 17], from: 'rabbit', color: '#E0702B' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'rabbit', emoji: '😎', dur: 0.6 },
    { at: 1.1, kind: 'puff', actor: 'rabbit' },
    { at: 2.0, kind: 'zzz', actor: 'rabbit', dur: 2.2 },
    { at: 1.6, kind: 'sweat', actor: 'turtle' },
    { at: 2.7, kind: 'bubble', actor: 'turtle', emoji: '🐌', dur: 0.5 },
    { at: 3.0, kind: 'pop', actor: 'turtle', emoji: '💡', dur: 0.4 },
    { at: 3.25, kind: 'burst', actor: 'turtle', emoji: '💨', n: 6, dur: 0.5 },
    { at: 4.05, kind: 'burst', x: 20, y: 66, emoji: '🔥', n: 6, dur: 0.5 },
    { at: 4.1, kind: 'puff', actor: 'turtle' },
    { at: 4.3, kind: 'pop', actor: 'rabbit', emoji: '😱', dur: 0.6 },
    { at: 5.0, kind: 'dizzy', actor: 'rabbit', dur: 1.4 },
    { at: 7.0, kind: 'burst', actor: 'turtle', emoji: '✨', n: 6, dur: 0.6 },
    { at: 7.5, kind: 'pop', actor: 'rabbit', emoji: '😤', dur: 0.6 },
    { at: 8.05, kind: 'pop', actor: 'rabbit', emoji: '💡', dur: 0.3 },
    { at: 9.1, kind: 'puff', actor: 'rabbit' },
    { at: 9.4, kind: 'pop', actor: 'rabbit', emoji: '😳', dur: 0.6 },
    { at: 9.5, kind: 'pop', actor: 'turtle', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    { at: 3.3, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 22, y: 64 } },
    { at: 4.1, dur: 0.5, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.55, say: '龜' },
    { at: 3.3, sfx: 'poof' },
    { at: 3.6, sfx: 'rumble' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.9, sfx: 'bonk' },
    { at: 5.9, say: '龜' },
    { at: 6.95, sfx: 'plop' },
    { at: 7.05, say: '龜兔賽跑' },
    { at: 8.3, sfx: 'poof' },
    { at: 8.5, sfx: 'rumble' },
    { at: 9.1, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
