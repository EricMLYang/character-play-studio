import type { Clip } from '../clip'

// 爸：企鵝爸爸把蛋放在腳上保護，一步一步慢慢走。一陣風吹來，蛋滑走了！爸爸滑過去追——蛋從冰上溜過來、溜過去，
// 爸爸一個飛撲接住，肚子貼地滑了好遠，冰花飛成「爸」。蛋「喀」地裂開，小企鵝探出頭——第一眼看到爸爸。爸、爸、爸爸
const clip: Clip = {
  char: '爸',
  meta: { theme: '企鵝爸爸', cast: '企鵝爸爸＋蛋', gags: ['蛋滑走了', '溜來溜去追不到', '飛撲滑好遠'] },
  duration: 10,
  bg: { top: '#DCEFFF', bottom: '#F4FAFF', floor: '#DDEBF7', scenery: 'snow' },
  actors: [
    { id: 'dad', emoji: '🐧', x: 30, y: 67, size: 24, hidden: true, flip: true },
    { id: 'egg', emoji: '🥚', x: 36, y: 74, size: 9, hidden: true },
    { id: 'chick', emoji: '🐣', x: 120, y: 72, size: 11, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dad', do: 'pop' },
    { at: 0.15, actor: 'egg', do: 'pop' },
    // 一步一步慢慢走
    { at: 0.8, actor: 'dad', do: 'moveTo', to: { x: 40, y: 67 }, dur: 0.6 },
    { at: 0.8, actor: 'egg', do: 'moveTo', to: { x: 46, y: 74 }, dur: 0.6 },
    { at: 1.6, actor: 'dad', do: 'moveTo', to: { x: 50, y: 67 }, dur: 0.6 },
    { at: 1.6, actor: 'egg', do: 'moveTo', to: { x: 56, y: 74 }, dur: 0.6 },
    // 風吹來——蛋滑走了
    { at: 2.6, actor: 'egg', do: 'moveTo', to: { x: 110, y: 74 }, dur: 0.7 },
    { at: 2.6, actor: 'egg', do: 'spin', times: 2, dur: 0.7 },
    // 滑過去追——溜過來、溜過去
    { at: 3.4, actor: 'dad', do: 'moveTo', to: { x: 96, y: 67 }, dur: 0.5 },
    { at: 3.6, actor: 'egg', do: 'moveTo', to: { x: 40, y: 74 }, dur: 0.5 },
    { at: 4.0, actor: 'dad', do: 'flip' },
    { at: 4.1, actor: 'dad', do: 'moveTo', to: { x: 60, y: 67 }, dur: 0.4 },
    { at: 4.2, actor: 'egg', do: 'moveTo', to: { x: 128, y: 74 }, dur: 0.6 },
    { at: 4.6, actor: 'dad', do: 'flip' },
    // 飛撲接住，肚子貼地滑好遠
    { at: 5.0, actor: 'dad', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 5.25, actor: 'dad', do: 'rotateTo', amount: 85, dur: 0.15 },
    { at: 5.25, actor: 'dad', do: 'moveTo', to: { x: 124, y: 70 }, dur: 0.5 },
    { at: 5.75, actor: 'egg', do: 'moveTo', to: { x: 136, y: 74 }, dur: 0.2 },
    { at: 6.1, actor: 'dad', do: 'rotateTo', amount: -85, dur: 0.3 },
    { at: 6.1, actor: 'dad', do: 'moveTo', to: { x: 120, y: 67 }, dur: 0.3 },
    // 蛋裂開，小企鵝探出頭
    { at: 7.6, actor: 'egg', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 8.1, actor: 'egg', do: 'vanish', dur: 0.15 },
    { at: 8.1, actor: 'chick', do: 'moveTo', to: { x: 136, y: 72 }, dur: 0.01 },
    { at: 8.12, actor: 'chick', do: 'pop', dur: 0.3 },
    { at: 8.8, actor: 'dad', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 滑過的冰花：父、巴
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2, 3], from: 'dad', color: '#3D8BEF' },
    { at: 5.8, dur: 0.6, strokes: [4, 5, 6, 7], from: 'dad', color: '#7A5CC9' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'dad', emoji: '🥚', dur: 0.6 },
    { at: 2.6, kind: 'burst', x: 30, y: 60, emoji: '💨', n: 4, dur: 0.5 },
    { at: 2.8, kind: 'pop', actor: 'dad', emoji: '😱', dur: 0.6 },
    { at: 3.4, kind: 'sweat', actor: 'dad' },
    { at: 5.25, kind: 'puff', actor: 'dad', dur: 0.6 },
    { at: 7.6, kind: 'pop', actor: 'egg', emoji: '❗', dur: 0.5 },
    { at: 8.2, kind: 'burst', actor: 'chick', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'dad', emoji: '🥹', dur: 0.8 },
  ],
  camera: [
    { at: 5.25, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 120, y: 66 } },
  ],
  cues: [
    { at: 0.9, say: '爸' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 3.4, sfx: 'slide' },
    { at: 4.1, sfx: 'slide' },
    { at: 5.25, sfx: 'slide' },
    { at: 6.5, say: '爸' },
    { at: 7.6, sfx: 'crack' },
    { at: 8.2, say: '爸爸' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
