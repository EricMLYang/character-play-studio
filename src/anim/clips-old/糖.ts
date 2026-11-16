import type { Clip } from '../clip'

// 糖（發條鯊魚與大恐龍搶糖果罐）：發條鯊魚咬糖果卻只咬到一張糖果紙，原地轉圈圈。大恐龍挺胸秀小短手（連罐蓋都搆不到），
// 低頭衝過來——鯊魚剛好轉一圈跳起來閃開，恐龍在半空定格，像大樹一樣「咚」地倒下，震得罐子裡的糖果飛出來堆成「糖」。
// 鯊魚跳上恐龍肚子，一顆糖果剛好掉進嘴裡。回馬槍：鯊魚把下一顆丟給恐龍，恐龍也笑了。糖、糖、糖果
const clip: Clip = {
  char: '糖',
  meta: { theme: '鯊魚恐龍搶糖果罐', cast: '發條鯊魚＋橡膠恐龍＋糖果罐', gags: ['只咬到糖果紙原地轉', '大傢伙衝過頭定格倒下', '糖果掉進嘴巴'] },
  duration: 10,
  bg: { top: '#E6F8EF', bottom: '#D6F2E4', floor: '#C7E8D6', scenery: 'hills' },
  actors: [
    { id: 'jar', emoji: '🫙', x: 80, y: 72.8, size: 10 },
    { id: 'wrap', emoji: '🍬', x: 58, y: 56, size: 6, float: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 132, y: 70.7, size: 15, hidden: true },
    { id: 'shark', emoji: 'hero:shark/idle', x: 40, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'candy', emoji: '🍬', x: 80, y: 66, size: 5, hidden: true, float: true },
    { id: 'candy2', emoji: '🍬', x: 34, y: 50, size: 5, hidden: true, float: true },
  ],
  moves: [
    // 鯊魚喀啦喀啦走進來，撲上去——只咬到糖果紙
    { at: 0, actor: 'shark', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.6 },
    { at: 0, actor: 'shark', do: 'bounce', amount: 1.5, times: 4, dur: 0.6 },
    { at: 0.7, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 0.7, actor: 'shark', do: 'moveTo', to: { x: 54, y: 60 }, arc: 6, dur: 0.25, anticipate: 3 },
    { at: 0.95, actor: 'wrap', do: 'vanish', dur: 0.1 },
    { at: 1.0, actor: 'shark', do: 'moveTo', to: { x: 40, y: 71.5 }, dur: 0.3, ease: 'bounce' },
    { at: 1.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 1.3, actor: 'shark', do: 'spin', times: 1, dur: 0.5 },
    // 大恐龍跺腳進場，挺胸、秀小短手
    { at: 1.0, actor: 'dino', do: 'enter', from: { x: 185, y: 70.7 }, dur: 0.6 },
    { at: 1.0, actor: 'dino', do: 'scaleTo', amount: 1.5, dur: 0.3 },
    { at: 1.0, actor: 'dino', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 1.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 1.7, actor: 'dino', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 2.05, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    // 低頭衝！鯊魚還在轉，最後一圈剛好跳起來閃開
    { at: 2.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 2.4, actor: 'dino', do: 'moveTo', to: { x: 46, y: 64 }, dur: 0.5, anticipate: 5, ease: 'in' },
    { at: 2.4, actor: 'shark', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.6, actor: 'shark', do: 'moveTo', to: { x: 30, y: 40 }, dur: 0.3, ease: 'out' },
    // 半空定格，小短手亂揮
    { at: 2.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 2.9, actor: 'dino', do: 'shake', amount: 1, dur: 0.4 },
    { at: 2.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    // 像大樹一樣倒下——咚！
    { at: 3.3, actor: 'dino', do: 'rotateTo', amount: -90, dur: 0.35, ease: 'in' },
    { at: 3.3, actor: 'dino', do: 'moveTo', to: { x: 44, y: 63 }, dur: 0.35, ease: 'in' },
    { at: 3.65, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 3.65, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 3.65, actor: 'jar', do: 'hop', amount: 5, dur: 0.3 },
    { at: 3.65, actor: 'shark', do: 'moveTo', to: { x: 16, y: 71.5 }, dur: 0.4, ease: 'bounce' },
    // 鯊魚跳上恐龍肚子；一顆糖從罐口彈出來掉進嘴裡
    { at: 5.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 5.3, actor: 'shark', do: 'moveTo', to: { x: 34, y: 50 }, arc: 10, dur: 0.4, ease: 'back' },
    { at: 5.7, actor: 'candy', do: 'pop', dur: 0.2 },
    { at: 5.75, actor: 'candy', do: 'moveTo', to: { x: 36, y: 50 }, arc: 46, dur: 0.6 },
    { at: 6.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 6.35, actor: 'candy', do: 'vanish', dur: 0.1 },
    { at: 6.6, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 6.8, actor: 'shark', do: 'bounce', amount: 1.5, times: 3, dur: 0.8 },
    // 回馬槍：鯊魚把下一顆丟給恐龍
    { at: 8.0, actor: 'candy2', do: 'pop', dur: 0.2 },
    { at: 8.3, actor: 'candy2', do: 'moveTo', to: { x: 26, y: 60 }, arc: 8, dur: 0.35 },
    { at: 8.65, actor: 'candy2', do: 'vanish', dur: 0.1 },
    { at: 8.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 8.7, actor: 'dino', do: 'shake', amount: 1, dur: 0.5 },
    { at: 8.7, actor: 'shark', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 倒地一震，罐子裡的糖果飛出來：米（左）先，唐（右）後
    { at: 3.75, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'jar', color: '#F03E8C' },
    { at: 4.3, dur: 1.1, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'jar', color: '#E64980' },
  ],
  glyph: [{ at: 5.4, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'shark', emoji: '🍬', dur: 0.6 },
    { at: 0.95, kind: 'burst', actor: 'wrap', emoji: '✨', n: 5, dur: 0.4 },
    { at: 1.4, kind: 'pop', actor: 'shark', emoji: '😵', dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 2.05, kind: 'sweat', actor: 'dino' },
    { at: 2.4, kind: 'puff', actor: 'dino', dur: 0.5 },
    { at: 2.95, kind: 'pop', actor: 'dino', emoji: '😨', dur: 0.4 },
    { at: 3.65, kind: 'puff', actor: 'dino', dur: 0.6 },
    { at: 3.7, kind: 'fountain', actor: 'jar', emoji: '🍬', n: 8, dur: 0.8 },
    { at: 4.0, kind: 'dizzy', actor: 'dino', dx: -8, dy: 10, dur: 3.5 },
    { at: 6.4, kind: 'pop', actor: 'shark', emoji: '🤩', dur: 0.6 },
    { at: 8.75, kind: 'burst', actor: 'dino', emoji: '💕', n: 5, dx: -8, dy: 10, dur: 0.7 },
  ],
  camera: [
    // 恐龍衝過來定格那一下推近，倒下時震一下
    { at: 2.6, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 40, y: 54 } },
    { at: 3.65, dur: 0.5, do: 'shake', amount: 2.4 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.95, say: '糖' },
    { at: 0.95, sfx: 'gulp' },
    { at: 1.6, sfx: 'rumble' },
    { at: 2.4, sfx: 'whoosh' },
    { at: 3.65, sfx: 'bonk' },
    { at: 3.75, sfx: 'rumble' },
    { at: 5.45, say: '糖' },
    { at: 6.3, say: '糖果' },
    { at: 6.3, sfx: 'gulp' },
    { at: 8.65, sfx: 'gulp' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
