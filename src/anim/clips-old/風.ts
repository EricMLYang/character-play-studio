import type { Clip } from '../clip'

// 風：浣熊助手花生抱著一疊高到搖晃的積木還在敬禮，一陣大風把他吹成皮球——彈地板、彈牆壁、彈天花板，每彈一下就「喀」出一筆；
// 最後一彈撞到敬錯禮的積木小隊，整隊倒成裡面的「虫」，花生暈呼呼坐在字頂上。風把他的紅圍巾吹成風箏，他一敬禮就放手了，風箏又飛回來砸他頭。風、風、風箏
const clip: Clip = {
  char: '風',
  meta: { theme: '花生被風吹', cast: '浣熊花生＋積木小隊＋一陣風＋風箏', gags: ['被風吹成皮球到處彈', '敬錯禮撞倒整隊', '敬禮放掉風箏'] },
  duration: 10,
  bg: { top: '#E3FAFC', bottom: '#F8F9FA', floor: '#D8E2DC', scenery: 'hills' },
  actors: [
    { id: 'squad', emoji: 'hero:brick/march', x: 142, y: 70.7, size: 15 },
    { id: 'gust', emoji: '🌬️', x: 12, y: 44, size: 16, hidden: true, float: true },
    { id: 'leaf1', emoji: '🍃', x: 20, y: 36, size: 5, hidden: true, float: true },
    { id: 'leaf2', emoji: '🍂', x: 16, y: 54, size: 5, hidden: true, float: true },
    { id: 'kite', emoji: '🪁', x: 92, y: 12, size: 10, hidden: true, float: true },
    { id: 'peanut', emoji: 'hero:raccoon/carry', x: 26, y: 71.5, size: 13, flip: true, float: true },
  ],
  moves: [
    // 疊太高的積木搖搖晃晃，他還在敬禮
    { at: 0.1, actor: 'peanut', do: 'tilt', amount: 6, dur: 0.5 },
    { at: 0.6, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 0.6, actor: 'peanut', do: 'hop', amount: 2, dur: 0.25 },
    // 大風捲進來
    { at: 0.9, actor: 'gust', do: 'enter', from: { x: -15, y: 44 }, dur: 0.45, ease: 'out' },
    { at: 0.95, actor: 'leaf1', do: 'enter', from: { x: -10, y: 30 }, dur: 0.5 },
    { at: 1.0, actor: 'leaf2', do: 'enter', from: { x: -10, y: 50 }, dur: 0.5 },
    { at: 1.35, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 1.35, actor: 'peanut', do: 'tilt', amount: 25, dur: 0.4 },
    { at: 1.4, actor: 'leaf1', do: 'moveTo', to: { x: 175, y: 20 }, dur: 0.8, ease: 'in' },
    { at: 1.45, actor: 'leaf2', do: 'moveTo', to: { x: 175, y: 40 }, dur: 0.9, ease: 'in' },
    // 彈地板！
    { at: 1.75, actor: 'peanut', do: 'moveTo', to: { x: 44, y: 71.5 }, dur: 0.35, arc: 18 },
    { at: 1.75, actor: 'peanut', do: 'spin', times: 1, dur: 0.35 },
    { at: 2.1, actor: 'peanut', do: 'squash', amount: 0.45, dur: 0.2 },
    // 彈牆壁！
    { at: 2.3, actor: 'peanut', do: 'moveTo', to: { x: 152, y: 34 }, dur: 0.4, ease: 'in' },
    { at: 2.3, actor: 'gust', do: 'vanish', dur: 0.4 },
    { at: 2.7, actor: 'peanut', do: 'squash', amount: -0.45, dur: 0.2 },
    // 彈天花板！
    { at: 2.9, actor: 'peanut', do: 'moveTo', to: { x: 116, y: 8 }, dur: 0.3, ease: 'in' },
    { at: 3.2, actor: 'peanut', do: 'squash', amount: 0.45, dur: 0.2 },
    // 積木小隊在這時候敬禮
    { at: 3.3, actor: 'squad', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 3.3, actor: 'squad', do: 'hop', amount: 2, dur: 0.25 },
    // 最後一彈：撞到隊長的頭
    { at: 3.6, actor: 'peanut', do: 'moveTo', to: { x: 142, y: 56 }, dur: 0.3, ease: 'in' },
    { at: 3.9, actor: 'squad', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 3.9, actor: 'squad', do: 'rotateTo', amount: -80, dur: 0.3, ease: 'in' },
    { at: 4.25, actor: 'squad', do: 'vanish', dur: 0.25 },
    // 彈回去，一屁股坐在字頂上
    { at: 3.95, actor: 'peanut', do: 'moveTo', to: { x: 90, y: 12.5 }, dur: 0.55, arc: 10, ease: 'out' },
    { at: 3.95, actor: 'peanut', do: 'spin', times: 1, dur: 0.55 },
    { at: 4.5, actor: 'peanut', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.5, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 風再吹一口，圍巾變成風箏
    { at: 6.1, actor: 'gust', do: 'enter', from: { x: -15, y: 30 }, dur: 0.4, ease: 'out' },
    { at: 6.4, actor: 'kite', do: 'pop' },
    { at: 6.4, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.45, actor: 'kite', do: 'moveTo', to: { x: 140, y: 18 }, dur: 0.6, ease: 'out' },
    { at: 7.1, actor: 'kite', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 7.0, actor: 'gust', do: 'vanish', dur: 0.4 },
    // 一敬禮就放手了
    { at: 7.9, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.15, actor: 'kite', do: 'moveTo', to: { x: 150, y: 6 }, dur: 0.35, ease: 'out' },
    { at: 8.3, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 風箏繞回來砸到他頭上
    { at: 8.6, actor: 'kite', do: 'moveTo', to: { x: 90, y: 4 }, dur: 0.4, arc: -4, ease: 'in' },
    { at: 8.6, actor: 'kite', do: 'spin', times: 1, dur: 0.4 },
    { at: 9.0, actor: 'peanut', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.0, actor: 'kite', do: 'hop', amount: -1, dur: 0.25 },
    { at: 9.25, actor: 'peanut', do: 'swap', emoji: 'hero:raccoon/happy' },
  ],
  builds: [
    // 彈地板 → 左撇；彈牆壁 → 右邊的橫折彎鉤；彈天花板 → 裡面的短撇
    { at: 2.12, dur: 0.4, strokes: [0], from: 'peanut', color: '#0C8599' },
    { at: 2.72, dur: 0.4, strokes: [1], from: 'peanut', color: '#0C8599' },
    { at: 3.22, dur: 0.35, strokes: [2], from: 'peanut', color: '#0C8599' },
    // 積木小隊倒成「虫」
    { at: 4.0, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'squad', color: '#1098AD' },
  ],
  glyph: [{ at: 4.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.15, kind: 'sweat', actor: 'peanut' },
    { at: 1.35, kind: 'pop', actor: 'peanut', emoji: '🧢', dur: 0.4 },
    { at: 2.1, kind: 'burst', actor: 'peanut', emoji: '✨', n: 5 },
    { at: 2.7, kind: 'burst', actor: 'peanut', dx: -8, dur: 0.45 },
    { at: 3.2, kind: 'burst', actor: 'peanut', dy: 9, dur: 0.45 },
    { at: 3.35, kind: 'pop', actor: 'squad', emoji: '🫡', dx: -8, dur: 0.5 },
    { at: 3.9, kind: 'burst', actor: 'squad' },
    { at: 4.6, kind: 'dizzy', actor: 'peanut', dy: 2, dur: 1.4 },
    { at: 6.45, kind: 'line', actor: 'peanut', target: 'kite', color: '#C92A2A', width: 0.6, dur: 1.75 },
    { at: 8.3, kind: 'pop', actor: 'peanut', emoji: '❗', dx: 4, dy: 6, dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'peanut', emoji: '😵', dx: 4, dy: 6, dur: 0.5 },
  ],
  camera: [
    { at: 2.7, dur: 0.3, do: 'shake', amount: 1 },
    { at: 3.9, dur: 0.3, do: 'shake', amount: 0.8 },
  ],
  cues: [
    { at: 0.6, sfx: 'tap' },
    { at: 0.9, sfx: 'whoosh' },
    { at: 1.35, say: '風' },
    { at: 2.1, sfx: 'boing' },
    { at: 2.7, sfx: 'boing' },
    { at: 3.2, sfx: 'boing' },
    { at: 3.9, sfx: 'bonk' },
    { at: 4.95, say: '風' },
    { at: 6.1, sfx: 'whoosh' },
    { at: 6.5, say: '風箏' },
    { at: 8.15, sfx: 'whoosh' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
