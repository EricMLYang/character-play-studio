import type { Clip } from '../clip'

// 新：發條鯊魚追一隻會自己跑的亮晶晶新鞋，一口咬下去——咬到的是橡膠恐龍的大腳，恐龍單腳跳、小手搆不到；
// 越追越快、越轉越大圈，最後飛撲肚皮著地「啪」壓住新鞋，紅色滑行痕跡變成「新」。恐龍一腳踩進新鞋——鯊魚又撲過去咬他的腳。新、新、新鞋
const clip: Clip = {
  char: '新',
  meta: { theme: '鯊魚追新鞋', cast: '發條鯊魚＋橡膠恐龍＋新鞋', gags: ['咬錯恐龍的大腳', '原地打轉', '飛撲壓住', '回馬槍又咬恐龍腳'] },
  duration: 10,
  bg: { top: '#FFF6DA', bottom: '#FFFBEE', floor: '#F5DF96', scenery: 'room' },
  actors: [
    { id: 'dino', emoji: 'hero:dino/idle', x: 130, y: 70.3, size: 16 },
    { id: 'shoe', emoji: '👟', x: 100, y: 72, size: 8, hidden: true, tint: 'hue-rotate(140deg) saturate(2.2)' },
    { id: 'shark', emoji: 'hero:shark/idle', x: 30, y: 71.1, size: 14, flip: true },
  ],
  moves: [
    // 新鞋自己跑進來
    { at: 0, actor: 'shoe', do: 'enter', from: { x: -10, y: 72 }, dur: 0.6, ease: 'out' },
    { at: 0, actor: 'shoe', do: 'bounce', amount: 3, times: 3, dur: 0.6 },
    // 鯊魚盯上，發條轉轉轉，撲過去
    { at: 0.7, actor: 'shark', do: 'shake', amount: 1, dur: 0.5 },
    { at: 1.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.2, actor: 'shark', do: 'moveTo', to: { x: 80, y: 71.1 }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 1.3, actor: 'shoe', do: 'moveTo', to: { x: 148, y: 72 }, arc: 12, dur: 0.4 },
    { at: 1.6, actor: 'shark', do: 'moveTo', to: { x: 116, y: 71.1 }, dur: 0.25, ease: 'in' },
    // 咬錯了！咬到恐龍的大腳
    { at: 1.85, actor: 'shark', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 1.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 2.0, actor: 'dino', do: 'bounce', amount: 4, times: 3, dur: 0.9 },
    { at: 2.0, actor: 'shark', do: 'bounce', amount: 4, times: 3, dur: 0.9 },
    { at: 2.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    // 鬆口，原地打轉
    { at: 2.95, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 2.95, actor: 'shark', do: 'moveTo', to: { x: 96, y: 71.1 }, dur: 0.25, ease: 'out' },
    { at: 3.2, actor: 'shark', do: 'spin', times: 1, dur: 0.5 },
    { at: 3.0, actor: 'shoe', do: 'moveTo', to: { x: 52, y: 72 }, arc: 16, dur: 0.6 },
    { at: 3.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    // 越追越大圈
    { at: 3.75, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 3.75, actor: 'shark', do: 'flip' },
    { at: 3.8, actor: 'shoe', do: 'moveTo', to: { x: 16, y: 72 }, dur: 0.45, ease: 'out' },
    { at: 3.8, actor: 'shark', do: 'moveTo', to: { x: 52, y: 71.1 }, dur: 0.45, ease: 'in' },
    // 定格蹲低……飛撲！
    { at: 4.3, actor: 'shark', do: 'squash', amount: 0.35, dur: 0.4 },
    { at: 4.7, actor: 'shark', do: 'moveTo', to: { x: 20, y: 70 }, arc: 14, dur: 0.35 },
    { at: 4.7, actor: 'shark', do: 'rotateTo', amount: -20, dur: 0.35 },
    { at: 5.05, actor: 'shark', do: 'rotateTo', amount: 20, dur: 0.1 },
    { at: 5.05, actor: 'shark', do: 'squash', amount: 0.6, dur: 0.35 },
    { at: 5.05, actor: 'shoe', do: 'squash', amount: 0.5, dur: 0.35 },
    // 鯊魚暈暈坐起來；新鞋蹦去恐龍那邊，恐龍一腳踩進去
    { at: 5.5, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 6.4, actor: 'shoe', do: 'moveTo', to: { x: 125, y: 73 }, arc: 10, dur: 0.45 },
    { at: 6.9, actor: 'dino', do: 'hop', amount: 5, dur: 0.3 },
    { at: 7.2, actor: 'shoe', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 7.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.6, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 7.6, actor: 'shark', do: 'spin', times: 1, dur: 0.5 },
    // 回馬槍：鯊魚又盯上新鞋，撲過去——又咬到恐龍的腳
    { at: 8.2, actor: 'shark', do: 'flip' },
    { at: 8.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 8.3, actor: 'shark', do: 'moveTo', to: { x: 114, y: 71.1 }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 8.65, actor: 'shark', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 8.8, actor: 'dino', do: 'bounce', amount: 4, times: 3, dur: 0.9 },
    { at: 8.8, actor: 'shark', do: 'bounce', amount: 4, times: 3, dur: 0.9 },
    { at: 8.8, actor: 'shoe', do: 'bounce', amount: 4, times: 3, dur: 0.9 },
    { at: 9.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
  ],
  builds: [
    // 紅色的滑行痕跡 → 左邊的「立」和「木」；撞飛的碎片滾到右邊 → 「斤」
    { at: 5.1, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: 'shark', color: '#E03131' },
    { at: 5.6, dur: 0.5, strokes: [9, 10, 11, 12], from: 'shoe', color: '#C92A2A' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'burst', actor: 'shoe', emoji: '✨', n: 4, dur: 0.5 },
    { at: 0.7, kind: 'pop', actor: 'shark', emoji: '❗', dur: 0.4 },
    { at: 0.7, kind: 'puff', actor: 'shark', dur: 0.5 },
    { at: 1.85, kind: 'burst', actor: 'dino', n: 1, dur: 0.3, dx: -4, dy: 10 },
    { at: 2.1, kind: 'sweat', actor: 'dino' },
    { at: 2.4, kind: 'pop', actor: 'dino', emoji: '😖', dur: 0.5 },
    { at: 3.2, kind: 'puff', actor: 'shark', dur: 0.5 },
    { at: 3.5, kind: 'pop', actor: 'shoe', emoji: '😜', dur: 0.4 },
    { at: 3.8, kind: 'puff', actor: 'shark', dur: 0.4 },
    { at: 5.05, kind: 'burst', actor: 'shark', n: 1, dur: 0.3 },
    { at: 5.5, kind: 'dizzy', actor: 'shark', dur: 1.2 },
    { at: 7.2, kind: 'burst', actor: 'shoe', emoji: '✨', n: 5, dur: 0.6, dy: -4 },
    { at: 9.0, kind: 'pop', actor: 'dino', emoji: '😖', dur: 0.6 },
  ],
  camera: [
    // 追逐時跟拍鯊魚，蹲低時退回全景
    { at: 3.75, dur: 0.3, do: 'follow', actor: 'shark', amount: 1.3 },
    { at: 4.3, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 5.05, dur: 0.25, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.7, sfx: 'rumble' },
    { at: 1.2, say: '新' },
    { at: 1.85, sfx: 'crack' },
    { at: 2.0, sfx: 'boing' },
    { at: 3.2, sfx: 'slide' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 5.05, sfx: 'plop' },
    { at: 6.2, say: '新' },
    { at: 7.2, say: '新鞋' },
    { at: 8.65, sfx: 'crack' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
