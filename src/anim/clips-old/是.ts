import type { Clip } from '../clip'

// 是：拉布拉多警長守著一疊藍色證物，三倍大的豬探長跺腳進場要搶。警長吹哨衝過去——在亮晶晶的地板上滑過頭，直接滑出畫面；
// 豬探長像公牛一樣刨地衝過來，警長只伸出一隻小腳……大豬絆倒、像大樹一樣「碰」趴在左下角，整疊證物彈起來排成「是」。
// 警長跳上豬肚子比著字；跳舞跳太用力，被豬肚子彈到半空中。是、是、就是
const clip: Clip = {
  char: '是',
  meta: { theme: '守證物', cast: '拉布拉多警長＋巨大豬探長＋藍色證物', gags: ['衝過去滑過頭出畫面', '小腳絆倒大傢伙', '在豬肚子上跳舞被彈飛'] },
  duration: 10,
  bg: { top: '#FFF6E6', bottom: '#FFFBF3', floor: '#BFD9F2', scenery: 'city' },
  actors: [
    { id: 'pile1', emoji: '🟦', x: 80, y: 70, size: 9 },
    { id: 'pile2', emoji: '🟦', x: 80, y: 62, size: 9 },
    { id: 'glass', emoji: '🔍', x: 150, y: 70, size: 10, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 132, y: 64, size: 30, hidden: true },
    { id: 'dog', emoji: 'hero:sheriff/idle', x: 60, y: 71, size: 14, flip: true },
  ],
  moves: [
    // 警長指著證物：這是我的
    { at: 0.1, actor: 'dog', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.4, actor: 'dog', do: 'tilt', amount: -12, dur: 0.4 },
    // 巨豬跺腳進場
    { at: 0.3, actor: 'pig', do: 'enter', from: { x: 195, y: 64 }, dur: 0.7, ease: 'out' },
    { at: 1.1, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 1.1, actor: 'pile2', do: 'hop', amount: 3, dur: 0.25 },
    { at: 1.1, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
    { at: 1.5, actor: 'pig', do: 'shake', amount: 1, dur: 0.4 },
    // 吹哨衝過去——滑過頭滑出畫面
    { at: 1.8, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 2.2, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 2.2, actor: 'dog', do: 'moveTo', to: { x: 180, y: 71 }, dur: 0.5, anticipate: 4, ease: 'in' },
    { at: 2.8, actor: 'pig', do: 'tilt', amount: 10, dur: 0.4 },
    // 頭昏昏地爬回來
    { at: 3.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 3.1, actor: 'dog', do: 'flip' },
    { at: 3.1, actor: 'dog', do: 'moveTo', to: { x: 100, y: 71 }, dur: 0.45, ease: 'out' },
    { at: 3.55, actor: 'dog', do: 'flip' },
    // 豬探長刨地，往後退助跑
    { at: 3.0, actor: 'pig', do: 'moveTo', to: { x: 142, y: 64 }, dur: 0.4 },
    { at: 3.4, actor: 'pig', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.0, actor: 'pig', do: 'moveTo', to: { x: 116, y: 64 }, dur: 0.3, anticipate: 4, ease: 'in' },
    // 警長只伸出一隻腳
    { at: 3.9, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 4.15, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.25 },
    // 絆到！空中定格一下，然後像大樹一樣往前倒
    { at: 4.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 4.3, actor: 'pig', do: 'moveTo', to: { x: 108, y: 54 }, dur: 0.25, ease: 'out' },
    { at: 4.85, actor: 'pig', do: 'moveTo', to: { x: 38, y: 53 }, dur: 0.45, ease: 'in' },
    { at: 4.85, actor: 'pig', do: 'rotateTo', amount: -90, dur: 0.45, ease: 'in' },
    { at: 5.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 5.3, actor: 'pile1', do: 'vanish', dur: 0.15 },
    { at: 5.3, actor: 'pile2', do: 'vanish', dur: 0.15 },
    { at: 5.3, actor: 'glass', do: 'enter', from: { x: 108, y: 40 }, arc: 10, dur: 0.6, ease: 'bounce' },
    { at: 5.9, actor: 'glass', do: 'spin', times: 3, dur: 2.4 },
    // 警長跳上豬肚子
    { at: 5.5, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 5.5, actor: 'dog', do: 'moveTo', to: { x: 26, y: 48 }, arc: 14, dur: 0.5 },
    { at: 6.0, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 6.0, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 7.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.3, actor: 'dog', do: 'hop', amount: 4, dur: 0.35 },
    // 回馬槍：在肚子上跳舞跳太用力，被彈到半空中
    { at: 8.0, actor: 'dog', do: 'bounce', amount: 2, times: 3, dur: 0.8 },
    { at: 8.0, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.8 },
    { at: 8.85, actor: 'dog', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 8.9, actor: 'dog', do: 'hop', amount: 22, dur: 0.8 },
    { at: 8.9, actor: 'dog', do: 'spin', times: 1, dur: 0.7 },
    { at: 8.9, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 9.7, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 9.7, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.25 },
  ],
  builds: [
    // 大豬「碰」一聲，整疊證物彈起來：日 → 一 → 下面
    { at: 5.35, dur: 0.6, strokes: [0, 1, 2, 3], from: 'pile2', color: '#1F4FD1' },
    { at: 5.85, dur: 0.3, strokes: [4], from: 'pile1', color: '#1F4FD1' },
    { at: 6.1, dur: 0.65, strokes: [5, 6, 7, 8], from: 'pile1', color: '#1F4FD1' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'pop', actor: 'dog', emoji: '👉', dx: 6, dur: 0.6 },
    { at: 1.1, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 1.5, kind: 'bubble', actor: 'pig', emoji: '🟦', dur: 0.9 },
    { at: 1.8, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.5 },
    { at: 2.3, kind: 'puff', actor: 'dog', dur: 0.4 },
    { at: 2.8, kind: 'pop', actor: 'pig', emoji: '😑', dur: 0.6 },
    { at: 3.2, kind: 'dizzy', actor: 'dog', dur: 0.7 },
    { at: 3.4, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 4.3, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 5.3, kind: 'burst', actor: 'pig', dx: -6, dy: 12, dur: 0.5 },
    { at: 5.3, kind: 'puff', actor: 'pig', dur: 0.6 },
    { at: 5.5, kind: 'dizzy', actor: 'pig', dx: -12, dy: 10, dur: 1.5 },
    { at: 7.3, kind: 'burst', actor: 'dog', emoji: '⭐', n: 5, dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'pig', emoji: '😆', dx: -12, dy: 10, dur: 0.6 },
  ],
  camera: [
    { at: 2.2, dur: 0.3, do: 'follow', actor: 'dog', amount: 1.3 },
    { at: 2.6, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.3, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 104, y: 52 } },
    { at: 5.3, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.1, say: '是' },
    { at: 1.1, sfx: 'rumble' },
    { at: 1.8, sfx: 'blip' },
    { at: 2.3, sfx: 'slide' },
    { at: 3.4, sfx: 'rumble' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.3, sfx: 'boing' },
    { at: 5.3, sfx: 'bonk' },
    { at: 6.8, say: '是' },
    { at: 7.4, say: '就是' },
    { at: 8.9, sfx: 'boing' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
