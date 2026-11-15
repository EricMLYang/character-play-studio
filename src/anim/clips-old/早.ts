import type { Clip } from '../clip'

// 早：披風英雄想把睡在地上、綁著橡皮繩的玩具太陽拉上天，布忍者卻躲在小葉子後面拉另一頭想留住夜晚——兩個拔河拉到臉紅、往後倒成快平躺，
// 披風還蓋住英雄的臉。停一拍——「啪」繩子鬆了，兩個屁股著地，太陽彈上去壓成「日」，橡皮繩彈直變成「十」，組成「早」。
// 唸「早安」時英雄伸懶腰揮手道早安；忍者的煙霧彈這才遲到地爆開。最後英雄想飛上去打招呼，披風又蓋住臉，一屁股摔下來。早、早、早安
const RED = 'sepia(.5) saturate(3) hue-rotate(-25deg)'
const clip: Clip = {
  char: '早',
  meta: { theme: '拔河拉太陽', cast: '披風英雄＋布忍者＋睡覺的太陽', gags: ['披風蓋住臉', '拔河拉到臉紅', '繩子鬆了屁股著地', '煙霧彈遲到', '披風又蓋臉'] },
  duration: 10,
  bg: { top: '#FFD8A8', bottom: '#FFF4E6', floor: '#D8F5A2', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '🌞', x: 80, y: 71.5, size: 13 },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 120, y: 71.5, size: 13, hidden: true },
    { id: 'hero', emoji: 'hero:cape/fly', x: 52, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 英雄飛進來，披風蓋住臉，咚一聲撞上太陽
    { at: 0, actor: 'hero', do: 'enter', from: { x: -15, y: 60 }, dur: 0.45, ease: 'in' },
    { at: 0.45, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 0.45, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 0.47, actor: 'sun', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 0.85, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    // 抓住繩子往上拉，太陽浮起來一點
    { at: 1.1, actor: 'hero', do: 'moveTo', to: { x: 44, y: 71.1 }, dur: 0.3 },
    { at: 1.15, actor: 'sun', do: 'moveTo', to: { x: 78, y: 63 }, dur: 0.45, ease: 'out' },
    // 忍者躲在小葉子後面，拉另一頭
    { at: 1.6, actor: 'ninja', do: 'pop', dur: 0.3 },
    { at: 1.95, actor: 'sun', do: 'moveTo', to: { x: 86, y: 71.5 }, dur: 0.3, ease: 'in' },
    { at: 2.0, actor: 'hero', do: 'moveTo', to: { x: 50, y: 71.1 }, dur: 0.25 },
    { at: 2.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    // 拔河
    { at: 2.25, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 2.25, actor: 'hero', do: 'rotateTo', amount: -20, dur: 0.3 },
    { at: 2.25, actor: 'ninja', do: 'rotateTo', amount: 20, dur: 0.3 },
    { at: 2.3, actor: 'sun', do: 'moveTo', to: { x: 74, y: 70 }, dur: 0.3 },
    { at: 2.6, actor: 'sun', do: 'moveTo', to: { x: 87, y: 70 }, dur: 0.3 },
    { at: 2.9, actor: 'sun', do: 'moveTo', to: { x: 77, y: 69 }, dur: 0.3 },
    { at: 3.2, actor: 'sun', do: 'moveTo', to: { x: 82, y: 70 }, dur: 0.3 },
    ...[2.3, 2.6, 2.9, 3.2].map((at) => ({ at, actor: 'sun', do: 'hop' as const, amount: 3, dur: 0.3 })),
    { at: 2.3, actor: 'hero', do: 'shake', amount: 0.7, dur: 1.4 },
    { at: 2.3, actor: 'ninja', do: 'shake', amount: 0.7, dur: 1.4 },
    // 往後倒到快平躺，臉都紅了，披風又蓋住臉
    { at: 3.2, actor: 'hero', do: 'rotateTo', amount: -22, dur: 0.5 },
    { at: 3.2, actor: 'ninja', do: 'rotateTo', amount: 22, dur: 0.5 },
    { at: 3.3, actor: 'hero', do: 'tint', filter: RED },
    { at: 3.3, actor: 'ninja', do: 'tint', filter: RED },
    { at: 3.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 3.8, actor: 'sun', do: 'shake', amount: 0.5, dur: 0.5 },
    // 啪！繩子鬆了，兩個屁股著地
    { at: 4.35, actor: 'hero', do: 'rotateTo', amount: 42, dur: 0.3 },
    { at: 4.35, actor: 'hero', do: 'moveTo', to: { x: 16, y: 71.1 }, dur: 0.4, ease: 'out' },
    { at: 4.35, actor: 'ninja', do: 'rotateTo', amount: -42, dur: 0.3 },
    { at: 4.35, actor: 'ninja', do: 'moveTo', to: { x: 141, y: 71.5 }, dur: 0.4, ease: 'out' },
    { at: 4.75, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.75, actor: 'ninja', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 4.75, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.75, actor: 'hero', do: 'tint', filter: '' },
    { at: 4.75, actor: 'ninja', do: 'tint', filter: '' },
    // 太陽彈上天
    { at: 4.38, actor: 'sun', do: 'moveTo', to: { x: 80, y: 26 }, dur: 0.25, ease: 'out' },
    { at: 4.68, actor: 'sun', do: 'vanish', dur: 0.15 },
    // 「早安」：伸懶腰、揮手道早安
    { at: 6.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 6.0, actor: 'hero', do: 'squash', amount: -0.3, dur: 0.6 },
    { at: 6.55, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 6.55, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },
    // 忍者的煙霧彈這才爆開，整個人露出來
    { at: 7.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 7.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    // 回馬槍：想飛上去打招呼，披風又蓋住臉，一屁股摔下來
    { at: 8.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 8.2, actor: 'hero', do: 'moveTo', to: { x: 22, y: 52 }, dur: 0.35, ease: 'out' },
    { at: 8.55, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 8.6, actor: 'hero', do: 'moveTo', to: { x: 18, y: 71.1 }, dur: 0.3, ease: 'in' },
    { at: 8.9, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 8.95, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 9.05, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 9.05, actor: 'ninja', do: 'bounce', times: 2, amount: 2, dur: 0.6 },
  ],
  builds: [
    // 太陽壓扁成「日」；彈直的橡皮繩 → 十
    { at: 4.62, dur: 0.45, strokes: [0, 1, 2, 3], from: 'sun', color: '#F76707' },
    { at: 4.9, dur: 0.45, strokes: [4, 5], from: { x: 80, y: 74 }, color: '#F76707' },
  ],
  glyph: [{ at: 5.4, dur: 0.4, do: 'wobble' }, { at: 6.6, dur: 0.5, do: 'pulse' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'sun', dur: 1.1 },
    { at: 0.5, kind: 'burst', actor: 'sun', dur: 0.3 },
    { at: 0.9, kind: 'pop', actor: 'hero', emoji: '☝️', dx: 5, dur: 0.4 },
    { at: 1.1, kind: 'line', actor: 'hero', target: 'sun', color: '#FF922B', width: 1.2, dur: 3.25 },
    { at: 1.95, kind: 'line', actor: 'ninja', target: 'sun', color: '#FF922B', width: 1.2, dur: 2.4 },
    { at: 2.3, kind: 'puff', actor: 'hero', dur: 0.5 },
    { at: 2.3, kind: 'puff', actor: 'ninja', dur: 0.5 },
    { at: 3.4, kind: 'sweat', actor: 'hero' },
    { at: 3.4, kind: 'sweat', actor: 'ninja' },
    { at: 4.8, kind: 'dizzy', actor: 'hero', dur: 0.9 },
    { at: 6.55, kind: 'pop', actor: 'hero', emoji: '👋', dx: 6, dur: 0.7 },
    { at: 7.3, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dy: 6, dur: 0.6 },
    { at: 7.85, kind: 'pop', actor: 'ninja', emoji: '🤷', dur: 0.5 },
    { at: 8.95, kind: 'pop', actor: 'hero', emoji: '😵', dur: 0.6 },
    { at: 9.1, kind: 'pop', actor: 'ninja', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    // 拉到快平躺時慢慢推近，鬆手那一下退回全景
    { at: 3.2, dur: 1.0, do: 'zoom', amount: 1.25, to: { x: 82, y: 58 } },
    { at: 4.3, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 4.75, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.45, sfx: 'boing' },
    { at: 1.15, say: '早' },
    { at: 2.0, sfx: 'slide' },
    { at: 3.3, sfx: 'rumble' },
    { at: 4.35, sfx: 'boing' },
    { at: 4.75, sfx: 'bonk' },
    { at: 5.4, say: '早' },
    { at: 6.55, say: '早安' },
    { at: 7.3, sfx: 'poof' },
    { at: 8.9, sfx: 'bonk' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
