import type { Clip } from '../clip'

// 都：玩具海盜看到積木塔頂的金幣，鸚鵡卻停在他鼻子上；第一次衝鋒鸚鵡擋住眼睛，衝過頭跑出畫面，第二次後仰蓄力「碰」地撞上積木塔，
// 積木全都飛起來掉成「都」。金幣彈到左邊，鸚鵡先坐上去；海盜張開雙手「這些都是我的！」——結果鸚鵡叼著金幣飛走了。都、都、都是
const clip: Clip = {
  char: '都',
  meta: { theme: '海盜搶金幣', cast: '玩具海盜＋鸚鵡＋積木小隊＋金幣', gags: ['鸚鵡停在鼻子上擋眼睛', '衝過頭跑出畫面', '撞塔積木全飛起來', '回馬槍鸚鵡叼走金幣'] },
  duration: 10,
  bg: { top: '#FFF1C9', bottom: '#FFF8E4', floor: '#EBD39A', scenery: 'desert' },
  actors: [
    { id: 'tower', emoji: 'hero:brick/stack', x: 144, y: 70.3, size: 16 },
    { id: 'coin', emoji: '🪙', x: 144, y: 55, size: 7 },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 20, y: 70.7, size: 15, flip: true },
    { id: 'parrot', emoji: '🦜', x: 16, y: 61, size: 7, flip: true, float: true },
  ],
  moves: [
    // 看到金幣，用望遠鏡確認
    { at: 0.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/telescope' },
    { at: 0.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    // 鸚鵡停到他鼻子上
    { at: 0.9, actor: 'parrot', do: 'moveTo', to: { x: 25, y: 65 }, arc: 5, dur: 0.3 },
    { at: 1.3, actor: 'pirate', do: 'shake', amount: 1, dur: 0.3 },
    { at: 1.35, actor: 'parrot', do: 'moveTo', to: { x: 14, y: 58 }, dur: 0.25 },
    { at: 1.4, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 1.4, actor: 'pirate', do: 'squash', amount: -0.25, dur: 0.3 },
    // 第一次衝鋒：鸚鵡飛到眼前擋住，衝過頭跑出畫面
    { at: 1.7, actor: 'pirate', do: 'moveTo', to: { x: 178, y: 70.7 }, dur: 0.55, anticipate: 4, ease: 'in' },
    { at: 1.7, actor: 'parrot', do: 'moveTo', to: { x: 182, y: 62 }, dur: 0.55, ease: 'in' },
    // 氣呼呼地走回來
    { at: 2.5, actor: 'pirate', do: 'flip' },
    { at: 2.5, actor: 'parrot', do: 'flip' },
    { at: 2.55, actor: 'pirate', do: 'moveTo', to: { x: 26, y: 70.7 }, dur: 0.7 },
    { at: 2.55, actor: 'pirate', do: 'bounce', amount: 2, times: 4, dur: 0.7 },
    { at: 2.6, actor: 'parrot', do: 'moveTo', to: { x: 26, y: 58 }, dur: 0.7 },
    { at: 3.3, actor: 'pirate', do: 'flip' },
    { at: 3.3, actor: 'parrot', do: 'flip' },
    // 更大的蓄力：整個人往後仰，鸚鵡坐到帽子上，積木塔緊張地發抖
    { at: 3.4, actor: 'pirate', do: 'rotateTo', amount: -25, dur: 0.4 },
    { at: 3.4, actor: 'parrot', do: 'moveTo', to: { x: 22, y: 57 }, dur: 0.4 },
    { at: 3.5, actor: 'tower', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 3.5, actor: 'tower', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 3.5, actor: 'coin', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 3.95, actor: 'pirate', do: 'rotateTo', amount: 25, dur: 0.1 },
    { at: 3.95, actor: 'parrot', do: 'moveTo', to: { x: 40, y: 26 }, dur: 0.4, ease: 'out' },
    { at: 4.0, actor: 'pirate', do: 'moveTo', to: { x: 128, y: 70.7 }, dur: 0.35, anticipate: 5, ease: 'in' },
    // 碰！積木全都飛起來，金幣彈到左邊
    { at: 4.35, actor: 'pirate', do: 'squash', amount: -0.55, dur: 0.5 },
    { at: 4.35, actor: 'tower', do: 'squash', amount: 0.4, dur: 0.4 },
    { at: 4.4, actor: 'tower', do: 'hop', amount: 10, dur: 0.4 },
    { at: 4.4, actor: 'coin', do: 'moveTo', to: { x: 22, y: 72 }, arc: 40, dur: 1.0 },
    { at: 4.4, actor: 'coin', do: 'spin', times: 3, dur: 1.0 },
    { at: 4.9, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 4.9, actor: 'tower', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 5.0, actor: 'parrot', do: 'moveTo', to: { x: 22, y: 66 }, dur: 0.5 },
    { at: 5.4, actor: 'coin', do: 'hop', amount: 3, dur: 0.3 },
    // 這些都是我的！鸚鵡跟著張開翅膀
    { at: 6.9, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/treasure' },
    { at: 6.9, actor: 'pirate', do: 'squash', amount: -0.2, dur: 0.35 },
    { at: 7.0, actor: 'parrot', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.6, actor: 'pirate', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.6, actor: 'tower', do: 'swap', emoji: 'hero:brick/idle' },
    // 回馬槍：鸚鵡叼起金幣，飛過來停在他鼻子上，再一溜煙飛走
    { at: 8.1, actor: 'coin', do: 'moveTo', to: { x: 122, y: 64 }, arc: 8, dur: 0.6 },
    { at: 8.1, actor: 'parrot', do: 'moveTo', to: { x: 122, y: 62 }, arc: 8, dur: 0.6 },
    { at: 8.7, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 8.75, actor: 'pirate', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 9.1, actor: 'coin', do: 'moveTo', to: { x: 172, y: 8 }, dur: 0.5, ease: 'in' },
    { at: 9.1, actor: 'parrot', do: 'moveTo', to: { x: 172, y: 6 }, dur: 0.5, ease: 'in' },
  ],
  builds: [
    // 飛起來的積木掉下來：土、一撇、日 → 左邊的「者」；最後兩塊 → 右邊的耳朵「阝」
    { at: 4.45, dur: 0.35, strokes: [0, 1, 2], from: 'tower', style: 'drop', color: '#C92A2A' },
    { at: 4.8, dur: 0.25, strokes: [3], from: 'tower', color: '#C92A2A' },
    { at: 5.0, dur: 0.45, strokes: [4, 5, 6, 7], from: 'tower', style: 'drop', color: '#C92A2A' },
    { at: 5.45, dur: 0.4, strokes: [8, 9], from: 'tower', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'pirate', emoji: '🪙', dur: 0.6, dx: 6 },
    { at: 0.8, kind: 'pop', actor: 'pirate', emoji: '❗', dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'pirate', emoji: '😑', dur: 0.4, dx: -6 },
    { at: 1.8, kind: 'puff', actor: 'pirate', dur: 0.4 },
    { at: 3.3, kind: 'pop', actor: 'pirate', emoji: '💢', dur: 0.4 },
    { at: 3.6, kind: 'sweat', actor: 'tower' },
    { at: 4.35, kind: 'burst', actor: 'pirate', n: 1, dur: 0.35, dx: 6 },
    { at: 4.4, kind: 'burst', actor: 'tower', emoji: '🧱', n: 6, dur: 0.6, dx: -6 },
    { at: 4.9, kind: 'dizzy', actor: 'pirate', dur: 1.3 },
    { at: 5.6, kind: 'pop', actor: 'parrot', emoji: '😆', dur: 0.5 },
    { at: 6.9, kind: 'burst', actor: 'pirate', emoji: '✨', n: 5, dur: 0.6 },
    { at: 8.7, kind: 'pop', actor: 'pirate', emoji: '❗', dur: 0.4 },
    { at: 9.3, kind: 'pop', actor: 'pirate', emoji: '😭', dur: 0.6 },
  ],
  camera: [
    // 第二次衝鋒跟拍，撞上去退回全景
    { at: 3.4, dur: 0.5, do: 'zoom', amount: 1.3, actor: 'pirate' },
    { at: 4.0, dur: 0.25, do: 'follow', actor: 'pirate', amount: 1.3 },
    { at: 4.35, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 4.35, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.7, say: '都' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.6, sfx: 'tap' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.35, sfx: 'bonk' },
    { at: 5.45, sfx: 'clink' },
    { at: 5.95, say: '都' },
    { at: 6.95, say: '都是' },
    { at: 9.1, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
