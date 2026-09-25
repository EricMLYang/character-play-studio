import { partsOf, hidesIn } from './parts'
import { sceneFor, type Scene } from './scenes'

/**
 * 魔法鍋：把字丟進鍋子攪一攪。
 * - 一個字 → 變成一個藏著它的字（口 → 日），優先給還沒發現過的，所以同一個字可以一直丟
 * - 兩個字剛好湊成一個字 → 變出那個字（口＋犬 → 器）
 * - 一個字本來就躲在另一個字裡 → 「找到了！」
 * - 其他組合 → 依兩個字的場景冒出一個好笑的反應（火＋水 → 冒煙）。永遠有東西發生，沒有「錯」。
 */
export type Brew =
  | { kind: 'make'; char: string; from: string[]; strokes: number[] }
  | { kind: 'inside'; char: string; part: string; strokes: number[] }
  | { kind: 'react'; emoji: string; line: string }
  | { kind: 'alone'; char: string }

/** 某個字裡面，這些部件佔掉的筆畫（合在一起標藍）。 */
const strokesOf = (whole: string, from: string[]) =>
  partsOf(whole).filter((p) => from.includes(p.char)).flatMap((p) => p.strokes)

/** 孩子端看得到的字裡，魔法鍋變得出來的字（圖鑑的格子）。 */
export const recipes = (known: Set<string>) =>
  [...known].filter((c) => partsOf(c).some((p) => known.has(p.char)))
    .map((char) => ({ char, from: partsOf(char).filter((p) => known.has(p.char)).map((p) => p.char) }))

export function brew(picked: string[], known: Set<string>, found: Record<string, string>, random = Math.random): Brew {
  const [a, b] = picked
  if (b === undefined) {
    const wholes = hidesIn(a).filter((c) => known.has(c))
    if (!wholes.length) return { kind: 'alone', char: a }
    const fresh = wholes.filter((c) => !found[c])
    const pool = fresh.length ? fresh : wholes
    const char = pool[Math.floor(random() * pool.length)]
    return { kind: 'make', char, from: [a], strokes: strokesOf(char, [a]) }
  }
  const exact = [...known].find((c) => {
    const parts = partsOf(c).map((p) => p.char)
    return a !== b && parts.length === 2 && parts.includes(a) && parts.includes(b)
  })
  if (exact) return { kind: 'make', char: exact, from: [a, b], strokes: strokesOf(exact, [a, b]) }
  for (const [part, whole] of [[a, b], [b, a]]) {
    if (partsOf(whole).some((p) => p.char === part)) return { kind: 'inside', char: whole, part, strokes: strokesOf(whole, [part]) }
  }
  return react(sceneFor(a), sceneFor(b), random)
}

// 兩個場景相遇會發生什麼。key 是排序後的兩個場景，所以火＋水跟水＋火一樣
const REACTIONS: Record<string, [string, string]> = {
  'fire+rain': ['💨', '滋～冒煙了！'],
  'fire+grow': ['🍠', '烤地瓜，好香喔！'],
  'grow+rain': ['🌸', '下雨了，長出小花！'],
  'glow+grow': ['🌻', '曬太陽，長得好高！'],
  'glow+rain': ['🌈', '出現彩虹了！'],
  'fire+glow': ['🥵', '好熱好熱，流汗了！'],
  'fire+fly': ['🎈', '熱氣球飛上天！'],
  'fly+rain': ['☔', '飛到一半被淋濕了！'],
  'bounce+rain': ['💦', '踩水坑，啪啪啪！'],
  'bounce+fire': ['🏃', '燙燙燙！跑超快！'],
  'bounce+grow': ['🍎', '跳起來摘果子！'],
  'bounce+fly': ['🤸', '跳好高，飛起來了！'],
  'bounce+bounce': ['🤝', '兩個一起跳跳跳！'],
  'rain+zap': ['⛈️', '打雷下大雨！'],
  'fire+zap': ['🎆', '碰！放煙火！'],
  'grow+zap': ['🛖', '叮叮咚咚，蓋了一間樹屋！'],
  'bounce+zap': ['🥋', '嘿！哈！一起練功夫！'],
  'fly+zap': ['🚀', '咻～變成火箭！'],
  'glow+zap': ['🦸', '變身超級英雄！'],
  'zap+zap': ['🤖', '合體！變成大機器人！'],
  'fly+glow': ['🌙', '飛到月亮上！'],
  'bounce+glow': ['😎', '戴上墨鏡去散步！'],
  'glow+glow': ['✨', '亮晶晶，好刺眼！'],
  'fly+grow': ['🪺', '在樹上做一個鳥窩！'],
  'fly+fly': ['🛩️', '比賽誰飛得快！'],
  'fire+fire': ['🌋', '火山爆發了！'],
  'rain+rain': ['🌊', '變成大海了！'],
  'grow+grow': ['🌳', '變成一片森林！'],
}
// 閃亮（沒有專屬場景的字）碰到什麼都是驚喜，每次不一樣
const SURPRISES: [string, string][] = [
  ['🫧', '冒出好多泡泡！'], ['🎁', '變出一個禮物！'], ['🎵', '鍋子唱起歌來了！'],
  ['🍭', '變成一根棒棒糖！'], ['🐸', '跳出一隻青蛙！呱！'], ['🎈', '飄出一顆氣球！'],
]

function react(x: Scene, y: Scene, random: () => number): Brew {
  const found = REACTIONS[[x, y].sort().join('+')]
  const [emoji, line] = found || SURPRISES[Math.floor(random() * SURPRISES.length)]
  return { kind: 'react', emoji, line }
}
