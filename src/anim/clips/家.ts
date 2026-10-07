import type { Clip } from '../clip'

// 家：一朵雨雲只追著小企鵝下雨，跑左邊跟到左邊、跑右邊跟到右邊。工程車開來倒下磚塊砌成「豕」，屋頂「碰」一聲蓋上去，
// 雨全打在屋頂上，企鵝一家從旁邊冒出來。最後雨雲轉去追工程車，工程車按喇叭落跑。家、家、家人
const clip: Clip = {
  char: '家',
  meta: { theme: '工程車＋天氣', cast: '企鵝一家＋雨雲＋卡車', gags: ['甩不掉的雨雲', '蓋房子', '目標轉移', '落跑'] },
  duration: 10,
  bg: { top: '#E2ECF4', bottom: '#CCDAE8', floor: '#DCCBA9' },
  actors: [
    { id: 'truck', emoji: '🚚', x: 130, y: 69.5, size: 18, hidden: true },
    { id: 'kid1', emoji: '🐧', x: 36, y: 73.5, size: 8, hidden: true },
    { id: 'kid2', emoji: '🐧', x: 12, y: 73.5, size: 8, hidden: true },
    { id: 'peng', emoji: '🐧', x: 40, y: 72, size: 12, hidden: true },
    { id: 'cloud', emoji: '🌧️', x: 40, y: 44, size: 16, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'peng', do: 'enter', dur: 0.7 },
    { at: 0, actor: 'peng', do: 'bounce', dur: 0.7, times: 4, amount: 1.5 },
    { at: 0.6, actor: 'cloud', do: 'pop', dur: 0.4 },
    // 往右跑——雲跟過來；往左跑——雲又跟過來
    { at: 2.3, actor: 'peng', do: 'moveTo', to: { x: 100, y: 72 }, dur: 0.5 },
    { at: 2.3, actor: 'peng', do: 'bounce', dur: 0.5, times: 4, amount: 1.5 },
    { at: 2.5, actor: 'cloud', do: 'moveTo', to: { x: 100, y: 44 }, dur: 0.5 },
    { at: 3.1, actor: 'peng', do: 'moveTo', to: { x: 22, y: 72 }, dur: 0.5 },
    { at: 3.1, actor: 'peng', do: 'bounce', dur: 0.5, times: 4, amount: 1.5 },
    { at: 3.3, actor: 'cloud', do: 'moveTo', to: { x: 22, y: 44 }, dur: 0.5 },
    // 工程車來了，倒下一車磚塊
    { at: 4.0, actor: 'truck', do: 'enter', from: { x: 180, y: 69.5 }, dur: 0.6 },
    { at: 4.6, actor: 'truck', do: 'tilt', amount: -12, dur: 0.6 },
    { at: 4.6, actor: 'truck', do: 'shake', dur: 0.6, amount: 0.8 },
    // 衝進屋頂底下躲雨
    { at: 5.0, actor: 'peng', do: 'moveTo', to: { x: 80, y: 72 }, dur: 0.4 },
    { at: 5.4, actor: 'cloud', do: 'moveTo', to: { x: 80, y: 6 }, dur: 0.5 },
    { at: 6.4, actor: 'cloud', do: 'shake', dur: 0.4, amount: 1.2 },
    // 企鵝一家冒出來
    { at: 6.6, actor: 'peng', do: 'moveTo', to: { x: 24, y: 72 }, dur: 0.4, arc: 8 },
    { at: 6.9, actor: 'kid1', do: 'pop' }, { at: 7.0, actor: 'kid2', do: 'pop' },
    { at: 7.2, actor: 'kid1', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 7.25, actor: 'kid2', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 雨雲改追工程車
    { at: 7.9, actor: 'cloud', do: 'moveTo', to: { x: 130, y: 42 }, dur: 0.6 },
    { at: 8.6, actor: 'truck', do: 'shake', dur: 0.4, amount: 1 },
    { at: 9.0, actor: 'truck', do: 'moveTo', to: { x: 185, y: 69.5 }, dur: 0.45 },
    { at: 9.2, actor: 'cloud', do: 'moveTo', to: { x: 185, y: 42 }, dur: 0.5 },
    { at: 9.2, actor: 'peng', do: 'bounce', dur: 0.6, times: 3, amount: 2 },
  ],
  builds: [
    // 磚塊 → 豕（房子裡那隻豬）；屋頂最後從天上蓋下來
    { at: 4.7, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8, 9], from: 'truck', color: '#B5653A' },
    { at: 5.7, dur: 0.5, strokes: [0, 1, 2], from: { x: 80, y: 0 }, style: 'drop', color: '#D23F3F' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'shake' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 1.3, kind: 'bubble', actor: 'peng', emoji: '🏠', dur: 0.9 },
    { at: 1.5, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 2.3, kind: 'puff', actor: 'peng' },
    { at: 2.3, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 2.8, kind: 'sweat', actor: 'peng' },
    { at: 3.1, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 3.9, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 3.9, kind: 'bubble', actor: 'peng', emoji: '😑', dur: 0.8 },
    { at: 4.6, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 4.6, kind: 'burst', actor: 'truck', emoji: '🧱', n: 5, dur: 0.6 },
    { at: 6.0, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 6.4, kind: 'pop', actor: 'cloud', emoji: '💢', dur: 0.6, dx: -14, dy: 12 },
    { at: 7.0, kind: 'burst', actor: 'peng', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.4, kind: 'rain', actor: 'cloud', dy: 12, n: 6, dur: 0.8 },
    { at: 8.6, kind: 'pop', actor: 'truck', emoji: '😱', dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'peng', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 6.15, dur: 0.35, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.7, sfx: 'bubble' },
    { at: 1.4, say: '家' },
    { at: 2.3, sfx: 'whoosh' }, { at: 3.1, sfx: 'whoosh' },
    { at: 4.0, sfx: 'blip' }, { at: 4.15, sfx: 'blip' },
    { at: 4.6, sfx: 'rumble' },
    { at: 6.15, sfx: 'bonk' },
    { at: 6.3, say: '家' },
    { at: 7.05, say: '家人' },
    { at: 8.6, sfx: 'blip' }, { at: 8.75, sfx: 'blip' },
    { at: 9.0, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
