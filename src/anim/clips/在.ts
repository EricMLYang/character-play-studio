import type { Clip } from '../clip'

// 在：披風英雄只想按一顆小小的紅按鈕，卻蓄力蓄到手臂狂轉、披風蓋住頭，矇著眼衝過頭，一頭撞散一疊藍色黏土棒——棒子落下排成「在」。
// 他踮腳走兩步輕輕一點，按鈕亮燈，布忍者就站在按鈕後面摀著眼睛「在這裡」！煙霧彈慢一拍才噗一聲。在、在、在這裡
const clip: Clip = {
  char: '在',
  meta: { theme: '英雄按按鈕', cast: '披風英雄＋布忍者＋紅按鈕＋黏土棒', gags: ['蓄力過頭衝過頭撞散', '輕輕一點就成功', '忍者一直在按鈕後面'] },
  duration: 10,
  bg: { top: '#D0EBFF', bottom: '#E7F5FF', floor: '#A5D8FF', scenery: 'hills' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 146, y: 71.5, size: 13, hidden: true },
    { id: 'button', emoji: '🔴', x: 138, y: 73, size: 6 },
    { id: 'bar1', emoji: '🟦', x: 152, y: 72, size: 7 },
    { id: 'bar2', emoji: '🟦', x: 152, y: 65.5, size: 7 },
    { id: 'bar3', emoji: '🟦', x: 152, y: 59, size: 7 },
    { id: 'hero', emoji: 'hero:cape/idle', x: 24, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 從天而降，披風蓋住臉
    { at: 0, actor: 'hero', do: 'drop', dur: 0.5 },
    { at: 0.45, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 0.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 0.9, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 0.9, actor: 'hero', do: 'hop', amount: 3, dur: 0.25 },
    // 蹲下蓄力
    { at: 1.3, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.5 },
    // 手臂狂轉、披風亂飄，蓄力蓄太久
    { at: 1.8, actor: 'hero', do: 'shake', amount: 1.4, dur: 0.9 },
    { at: 1.9, actor: 'hero', do: 'tilt', amount: -10, dur: 0.3 },
    { at: 2.2, actor: 'hero', do: 'tilt', amount: -14, dur: 0.3 },
    { at: 2.5, actor: 'hero', do: 'squash', amount: -0.35, dur: 0.3 },
    // 衝！披風蓋住頭，衝過按鈕
    { at: 2.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 2.8, actor: 'hero', do: 'moveTo', to: { x: 146, y: 62 }, dur: 0.5, anticipate: 4, ease: 'in' },
    // 咚！撞散黏土棒
    { at: 3.3, actor: 'hero', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 3.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.3, actor: 'bar3', do: 'moveTo', to: { x: 140, y: 30 }, dur: 0.3, ease: 'out' },
    { at: 3.3, actor: 'bar2', do: 'moveTo', to: { x: 130, y: 36 }, dur: 0.3, ease: 'out' },
    { at: 3.3, actor: 'bar1', do: 'moveTo', to: { x: 150, y: 40 }, dur: 0.3, ease: 'out' },
    { at: 3.6, actor: 'bar3', do: 'vanish', dur: 0.2 },
    { at: 3.95, actor: 'bar2', do: 'vanish', dur: 0.2 },
    { at: 4.3, actor: 'bar1', do: 'vanish', dur: 0.2 },
    // 冒煙的靴子往後滑（滑回按鈕旁邊）
    { at: 3.6, actor: 'hero', do: 'moveTo', to: { x: 119, y: 71.1 }, dur: 0.7, ease: 'out' },
    // 踮腳回來輕輕按
    { at: 5.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 5.8, actor: 'hero', do: 'moveTo', to: { x: 128, y: 71.1 }, dur: 0.7, ease: 'linear' },
    { at: 5.8, actor: 'hero', do: 'bounce', amount: 1.5, times: 3, dur: 0.7 },
    { at: 6.6, actor: 'hero', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 6.65, actor: 'button', do: 'flash', dur: 0.6 },
    { at: 6.65, actor: 'button', do: 'squash', amount: 0.3, dur: 0.2 },
    // 忍者一直站在按鈕後面
    { at: 6.85, actor: 'ninja', do: 'pop' },
    { at: 7.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 7.0, actor: 'hero', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    // 煙霧彈慢一拍
    { at: 8.0, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 8.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    // 英雄得意扭屁股
    { at: 8.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 8.6, actor: 'hero', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 8.85, actor: 'hero', do: 'tilt', amount: -12, dur: 0.25 },
    { at: 9.1, actor: 'hero', do: 'tilt', amount: 12, dur: 0.25 },
  ],
  builds: [
    // 撞飛的黏土棒落下：上面的橫、撇、豎，再疊成右下的「土」
    { at: 3.6, dur: 0.75, strokes: [0, 1, 2], from: 'bar3', color: '#1C7ED6' },
    { at: 4.3, dur: 0.75, strokes: [3, 4, 5], from: 'bar1', style: 'drop', color: '#1971C2' },
  ],
  glyph: [{ at: 5.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'puff', actor: 'hero' },
    { at: 0.55, kind: 'pop', actor: 'hero', emoji: '❓', dur: 0.4 },
    { at: 0.95, kind: 'bubble', actor: 'hero', emoji: '🔴', dur: 0.8 },
    { at: 1.8, kind: 'puff', actor: 'hero', dur: 0.9 },
    { at: 2.0, kind: 'pop', actor: 'hero', emoji: '💪', dur: 0.7 },
    { at: 2.95, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.35 },
    { at: 3.3, kind: 'burst', actor: 'hero', dx: 4 },
    { at: 3.4, kind: 'dizzy', actor: 'hero', dur: 1.4 },
    { at: 3.7, kind: 'stink', actor: 'hero', dy: 4, dur: 1.0 },
    { at: 6.65, kind: 'burst', actor: 'button', emoji: '✨', n: 6 },
    { at: 7.0, kind: 'pop', actor: 'hero', emoji: '❗', dur: 0.5 },
    { at: 8.0, kind: 'puff', actor: 'ninja', dur: 0.6 },
    { at: 8.1, kind: 'pop', actor: 'ninja', emoji: '💨', dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'ninja', emoji: '😅', dur: 0.6 },
  ],
  camera: [
    { at: 2.8, dur: 0.3, do: 'follow', actor: 'hero', amount: 1.3 },
    { at: 3.3, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.3, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 6.85, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 140, y: 66 } },
  ],
  cues: [
    { at: 0.45, sfx: 'plop' },
    { at: 1.35, say: '在' },
    { at: 2.0, sfx: 'rumble' },
    { at: 2.8, sfx: 'whoosh' },
    { at: 3.3, sfx: 'bonk' },
    { at: 3.6, sfx: 'slide' },
    { at: 5.1, say: '在' },
    { at: 6.65, sfx: 'blip' },
    { at: 7.0, say: '在這裡' },
    { at: 8.0, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
