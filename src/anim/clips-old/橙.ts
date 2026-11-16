import type { Clip, Move } from '../clip'

// 橙：消防車隊長「噹噹」帶著兩個小隊員，看上木箱頂上一顆超大的柳橙。隊員拿水管去噴——水管自己扭來扭去，反過來把隊員噴得團團轉，柳橙一動也不動。
// 消防車只好倒車蓄力，像橡皮筋一樣拉長，「咻——碰！」撞進木箱：木板掉成「木」，柳橙飛上天裂開，果皮變成「登」的頭、果肉排成「豆」。
// 水管抬頭一笑，噴出一大道橙汁，把紅色消防車噴成橘色；最後又噴到隊員自己。橙、橙、橙汁
const truckMoves: Move[] = [
  { at: 0, actor: 'truck', do: 'enter', from: { x: -20, y: 67.8 }, dur: 0.5, ease: 'back' },
  { at: 0.8, actor: 'truck', do: 'tilt', amount: 8, dur: 0.4 },
  // 倒車、拉長蓄力
  { at: 3.0, actor: 'truck', do: 'moveTo', to: { x: 14, y: 67.8 }, dur: 0.4 },
  { at: 3.45, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.5 },
  // 咻——碰！
  { at: 4.0, actor: 'truck', do: 'moveTo', to: { x: 120, y: 67.8 }, dur: 0.3, anticipate: 5, ease: 'in' },
  // 撞扁、彈回右下角
  { at: 4.45, actor: 'truck', do: 'moveTo', to: { x: 134, y: 67.8 }, dur: 0.5, ease: 'out' },
]
/** 隊員坐在車頂：抄一份車子的動作，位置往旁邊、往上偏一點。 */
const onTruck = (rider: string, dx: number, dy: number): Move[] =>
  truckMoves.map((m) => ({ ...m, actor: rider, to: m.to && { x: m.to.x + dx, y: m.to.y + dy }, from: m.from && { x: m.from.x + dx, y: m.from.y + dy } }))

const clip: Clip = {
  char: '橙',
  meta: { theme: '消防車摘柳橙', cast: '消防車隊長＋兩個消防小隊員＋木箱＋大柳橙', gags: ['水管失控噴自己', '倒車拉長蓄力撞箱子', '被橙汁噴成橘色'] },
  duration: 10,
  bg: { top: '#FFF3DD', bottom: '#FFFAF0', floor: '#E9D8B8', scenery: 'hills' },
  actors: [
    { id: 'crate', emoji: '📦', x: 138, y: 67, size: 16 },
    { id: 'orange', emoji: '🍊', x: 138, y: 52, size: 14 },
    { id: 'truck', emoji: '🚒', x: 32, y: 67.8, size: 22, flip: true, hidden: true },
    { id: 'c1', emoji: 'hero:firefighter/idle', x: 28, y: 55, size: 9, flip: true, hidden: true },
    { id: 'c2', emoji: 'hero:firefighter/idle', x: 37, y: 55, size: 9, flip: true, hidden: true },
  ],
  moves: [
    ...truckMoves,
    ...onTruck('c1', -4, -12.8),
    ...onTruck('c2', 5, -12.8),
    // 撞上那一下：車子壓扁，隊員一起往下沉
    { at: 3.45, actor: 'truck', do: 'squash', amount: -0.35, dur: 0.5 },
    { at: 4.3, actor: 'truck', do: 'squash', amount: 0.55, dur: 0.35 },
    { at: 4.3, actor: 'c1', do: 'hop', amount: 9, dur: 0.5 },
    { at: 4.3, actor: 'c2', do: 'hop', amount: 12, dur: 0.55 },
    // 隊員指著柳橙
    { at: 0.5, actor: 'c1', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.6, actor: 'c2', do: 'hop', amount: 3, dur: 0.3 },
    // 水管失控：扭兩圈，反過來把隊員噴得團團轉，摔到後面
    { at: 1.5, actor: 'c1', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 1.9, actor: 'c1', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 2.3, actor: 'c1', do: 'spin', times: 2, dur: 0.5 },
    { at: 2.3, actor: 'c1', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 2.8, actor: 'c1', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.3, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 3.0, actor: 'c1', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 3.0, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 4.5, actor: 'c1', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 4.5, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    // 木箱散開、柳橙飛上天裂開
    { at: 4.3, actor: 'crate', do: 'vanish', dur: 0.2 },
    { at: 4.3, actor: 'orange', do: 'moveTo', to: { x: 108, y: 18 }, dur: 0.45, ease: 'out' },
    { at: 4.3, actor: 'orange', do: 'spin', times: 1, dur: 0.45 },
    { at: 4.8, actor: 'orange', do: 'vanish', dur: 0.2 },
    // 頭昏昏、扁扁的
    { at: 5.0, actor: 'truck', do: 'shake', amount: 0.8, dur: 0.6 },
    // 水管抬頭——噴出橙汁，消防車變成橘色
    { at: 6.4, actor: 'c1', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 6.4, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 6.6, actor: 'c1', do: 'tilt', amount: -20, dur: 0.4 },
    { at: 7.1, actor: 'truck', do: 'tint', filter: 'hue-rotate(28deg) saturate(1.4) brightness(1.08)' },
    { at: 7.1, actor: 'truck', do: 'flash', dur: 0.6 },
    { at: 7.9, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.5 },
    // 兩個隊員擊掌
    { at: 8.3, actor: 'c1', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 8.3, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 8.3, actor: 'c1', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.3, actor: 'c2', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：水管又自己噴了一下——這次噴到隊員，隊員也變橘色
    { at: 8.9, actor: 'c2', do: 'tint', filter: 'hue-rotate(28deg) saturate(1.4) brightness(1.08)' },
    { at: 8.9, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.9, actor: 'c2', do: 'hop', amount: 5, dur: 0.35 },
    { at: 9.4, actor: 'c2', do: 'swap', emoji: 'hero:firefighter/happy' },
  ],
  builds: [
    // 木板一片一片掉成「木」
    { at: 4.35, dur: 0.6, strokes: [0, 1, 2, 3], from: 'crate', color: '#A0612B' },
    // 果皮變成「登」的頭，果肉排成「豆」
    { at: 4.85, dur: 0.5, strokes: [4, 5, 6, 7, 8], from: 'orange', color: '#FF8A00' },
    { at: 5.3, dur: 0.75, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'orange', color: '#FF8A00' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'c2', emoji: '🍊', dur: 0.9 },
    { at: 0.8, kind: 'pop', actor: 'truck', emoji: '🚨', dx: -6, dy: 2, dur: 0.6 },
    { at: 1.6, kind: 'line', actor: 'c1', to: { x: 128, y: 48 }, color: '#74C0FC', width: 1.6, dur: 0.6 },
    { at: 2.25, kind: 'fountain', actor: 'c1', n: 8, dur: 0.8 },
    { at: 2.8, kind: 'pop', actor: 'truck', emoji: '😞', dx: -6, dy: 4, dur: 0.6 },
    { at: 2.9, kind: 'pop', actor: 'orange', emoji: '😏', dur: 0.5 },
    { at: 3.45, kind: 'puff', actor: 'truck', dur: 0.5 },
    { at: 4.0, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 4.3, kind: 'burst', actor: 'truck', dur: 0.5 },
    { at: 4.35, kind: 'burst', actor: 'truck', emoji: '⚙️', n: 3, dur: 0.6 },
    { at: 4.8, kind: 'burst', actor: 'orange', emoji: '🍊', n: 6, dur: 0.5 },
    { at: 5.0, kind: 'dizzy', actor: 'truck', dy: 4, dur: 1.2 },
    { at: 6.8, kind: 'fountain', actor: 'c1', emoji: '🟠', n: 9, dur: 1.0 },
    { at: 7.0, kind: 'rain', actor: 'truck', emoji: '🧃', n: 6, dur: 0.8 },
    { at: 7.9, kind: 'rain', actor: 'truck', emoji: '🟠', n: 5, dur: 0.5 },
    { at: 8.35, kind: 'pop', actor: 'c1', emoji: '🙌', dx: 1, dur: 0.5 },
    { at: 8.8, kind: 'fountain', actor: 'c1', emoji: '🟠', n: 5, dur: 0.6 },
  ],
  camera: [
    { at: 3.45, dur: 0.5, do: 'zoom', amount: 1.3, actor: 'truck' },
    { at: 4.0, dur: 0.3, do: 'follow', actor: 'truck', amount: 1.3 },
    { at: 4.3, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.3, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.8, say: '橙' },
    { at: 1.6, sfx: 'splash' },
    { at: 2.3, sfx: 'boing' },
    { at: 3.45, sfx: 'rumble' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.3, sfx: 'bonk' },
    { at: 4.8, sfx: 'poof' },
    { at: 6.1, say: '橙' },
    { at: 7.0, say: '橙汁' },
    { at: 7.0, sfx: 'splash' },
    { at: 8.35, sfx: 'clink' },
    { at: 8.85, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
