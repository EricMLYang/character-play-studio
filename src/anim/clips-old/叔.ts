import type { Clip } from '../clip'

// 叔：布忍者拿著小葉子躲著（全身都看得到），跳出來拿泡棉劍跟消防隊長來一場友誼對決；他揮空轉三圈，隊長的水管自己扭過來噴了自己一臉、頭盔飛上天，
// 兩個晃到中間「咚」地撞頭坐倒，煙霧彈這時才爆開，掉下來的劍、頭盔、水管和煙霧彈排成「叔」。隊長站起來揮手——他就是那位「叔叔」。叔、叔、叔叔
const clip: Clip = {
  char: '叔',
  meta: { theme: '友誼對決', cast: '布忍者＋消防隊長＋消防車', gags: ['揮空轉成陀螺', '水管噴自己一臉', '撞頭後煙霧彈才爆開'] },
  duration: 10,
  bg: { top: '#FFF1DC', bottom: '#FFF8EE', floor: '#E8CFA8', scenery: 'city' },
  actors: [
    { id: 'truck', emoji: '🚒', x: 152, y: 68, size: 18 },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 22, y: 71.5, size: 13, flip: true },
    { id: 'fire', emoji: 'hero:firefighter/idle', x: 134, y: 71, size: 14 },
    { id: 'helmet', emoji: '⛑️', x: 134, y: 58, size: 7, hidden: true, float: true },
    { id: 'sword', emoji: '🗡️', x: 70, y: 60, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 隊長擺好相撲架式
    { at: 0.3, actor: 'fire', do: 'squash', amount: 0.2, dur: 0.4 },
    // 布忍者跳出「藏身處」，拉一個超大的蓄力
    { at: 1.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 1.2, actor: 'ninja', do: 'hop', amount: 8, dur: 0.4 },
    { at: 1.65, actor: 'ninja', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 1.65, actor: 'ninja', do: 'tilt', amount: -25, dur: 0.4 },
    // 衝過去揮——揮空，轉三圈
    { at: 2.05, actor: 'ninja', do: 'moveTo', to: { x: 58, y: 71.5 }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 2.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 2.4, actor: 'ninja', do: 'spin', times: 3, dur: 0.8 },
    { at: 3.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    // 隊長反擊：水管自己扭過來噴了他一臉，頭盔飛上天
    { at: 2.3, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 2.3, actor: 'fire', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 2.75, actor: 'helmet', do: 'pop', dur: 0.15 },
    { at: 2.75, actor: 'helmet', do: 'moveTo', to: { x: 100, y: 4 }, dur: 0.6, ease: 'out' },
    { at: 2.75, actor: 'helmet', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.8, actor: 'fire', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.4, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 兩個都暈頭轉向晃到中間，鼻子對鼻子
    { at: 3.4, actor: 'ninja', do: 'moveTo', to: { x: 72, y: 71.5 }, dur: 0.5 },
    { at: 3.4, actor: 'fire', do: 'moveTo', to: { x: 88, y: 71 }, dur: 0.5 },
    { at: 3.9, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 3.9, actor: 'fire', do: 'shake', amount: 0.8, dur: 0.4 },
    // 咚！撞頭、坐倒
    { at: 4.35, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.35, actor: 'fire', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.5, actor: 'ninja', do: 'moveTo', to: { x: 24, y: 71.5 }, dur: 0.45, arc: 8, ease: 'out' },
    { at: 4.5, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 4.5, actor: 'fire', do: 'moveTo', to: { x: 134, y: 71 }, dur: 0.45, arc: 8, ease: 'out' },
    // 劍掉下來，頭盔落回來，都掉進煙霧裡
    { at: 4.5, actor: 'sword', do: 'pop', dur: 0.15 },
    { at: 4.5, actor: 'sword', do: 'moveTo', to: { x: 70, y: 36 }, dur: 0.3, ease: 'out' },
    { at: 4.5, actor: 'sword', do: 'spin', dur: 0.3 },
    { at: 4.75, actor: 'helmet', do: 'moveTo', to: { x: 70, y: 30 }, dur: 0.3, ease: 'in' },
    { at: 4.95, actor: 'sword', do: 'vanish', dur: 0.1 },
    { at: 5.1, actor: 'helmet', do: 'vanish', dur: 0.1 },
    // 隊長站起來捻鬍子、揮手——他就是叔叔
    { at: 6.6, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.6, actor: 'fire', do: 'hop', amount: 5, dur: 0.35 },
    { at: 7.0, actor: 'fire', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 7.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.5, actor: 'ninja', do: 'hop', amount: 5, dur: 0.35 },
    // 回馬槍：布忍者又躲回小葉子後面；隊長的水管又噴了自己一下
    { at: 8.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.3, actor: 'ninja', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 8.6, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 8.85, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.85, actor: 'fire', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.4, actor: 'fire', do: 'swap', emoji: 'hero:firefighter/happy' },
  ],
  builds: [
    // 劍立成直的、頭盔帶子是短橫、攤平的水管是長橫：上
    { at: 4.9, dur: 0.5, strokes: [0, 1, 2], from: 'sword', color: '#1C5FD4' },
    // 噴頭掛成中間的勾，兩顆煙霧彈是兩點：小
    { at: 5.35, dur: 0.45, strokes: [3, 4, 5], from: { x: 70, y: 30 }, color: '#1C5FD4' },
    // 軟趴趴的水管捲成右邊的又
    { at: 5.75, dur: 0.45, strokes: [6, 7], from: 'fire', color: '#1C5FD4' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'ninja', emoji: '🤭', dur: 0.7 },
    { at: 0.9, kind: 'bubble', actor: 'ninja', emoji: '⚔️', dur: 0.6 },
    { at: 1.2, kind: 'puff', actor: 'ninja' },
    { at: 2.65, dur: 0.6, kind: 'fountain', actor: 'fire', emoji: '💧', n: 6 },
    { at: 3.4, kind: 'dizzy', actor: 'ninja', dur: 0.9 },
    { at: 3.4, kind: 'dizzy', actor: 'fire', dur: 0.9 },
    { at: 3.95, kind: 'sweat', actor: 'ninja' },
    { at: 3.95, kind: 'sweat', actor: 'fire' },
    { at: 4.35, kind: 'burst', x: 80, y: 58, emoji: '💥', dur: 0.45 },
    // 撞完才爆開的煙霧彈
    { at: 4.85, kind: 'burst', x: 70, y: 36, emoji: '☁️', n: 8, dur: 0.8 },
    { at: 5.0, kind: 'dizzy', actor: 'ninja', dur: 1.2 },
    { at: 5.0, kind: 'dizzy', actor: 'fire', dur: 1.2 },
    { at: 6.9, kind: 'pop', actor: 'fire', emoji: '👋', dur: 1.0 },
    { at: 7.55, kind: 'pop', actor: 'ninja', emoji: '🤝', dur: 0.7 },
    { at: 8.35, kind: 'pop', actor: 'ninja', emoji: '👍', dur: 0.9 },
    { at: 8.6, dur: 0.4, kind: 'fountain', actor: 'fire', emoji: '💧', n: 4 },
  ],
  camera: [
    // 撞頭前那半拍推近
    { at: 3.85, dur: 0.75, do: 'punch', amount: 0.3, to: { x: 80, y: 60 } },
    { at: 4.37, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.2, say: '叔' },
    { at: 2.05, sfx: 'whoosh' },
    { at: 2.65, sfx: 'splash' },
    { at: 2.8, sfx: 'whoosh' },
    { at: 4.35, sfx: 'bonk' },
    { at: 4.85, sfx: 'poof' },
    { at: 6.3, say: '叔' },
    { at: 6.95, say: '叔叔' },
    { at: 8.6, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
