/**
 * 部首會演出自己的意思：三點水在滴水、火字旁在冒火、目字旁會眨眼、口字旁會咬一口。
 *
 * 研究上部首（意符）意識有中強的證據：認得部首，不認得整個字也能猜意思。
 * 但「三點水」對六歲只是三個點，要讓他把那三點跟「水」連起來，最直接的是讓它真的滴水。
 * Endless Alphabet 教英文單字也是這招：字母本身會演出那個字的意思。
 *
 * 每一家兩件事：
 *   motion  粒子怎麼動（從部首掉下來、冒上去、走過去、跳出來、繞一圈、跑出來偷看、劃一刀）
 *   glyph   部首本身怎麼動（跳動、眨眼、咬一口、搖、發抖、閃爍、長高）
 * 動作只有幾種、CSS 共用（styles/radicalfx.css），每一家換的是粒子跟組合。
 * 粒子一律用 public/emoji3d/ 有的 3D 圖（tests/radical-fx.test.mjs 檢查）。
 */
export type FxMotion = 'fall' | 'rise' | 'walk' | 'pop' | 'orbit' | 'peek' | 'slash' | 'wave'
export type FxGlyph = 'beat' | 'blink' | 'chomp' | 'sway' | 'shiver' | 'flicker' | 'grow' | 'none'

export type RadicalFx = { motion: FxMotion; emoji: string; count: number; glyph: FxGlyph }

export const RADICAL_FX: Record<string, RadicalFx> = {
  water:    { motion: 'fall',  emoji: '💧', count: 5, glyph: 'sway' },
  ice:      { motion: 'pop',   emoji: '❄️', count: 5, glyph: 'shiver' },
  hand:     { motion: 'wave',  emoji: '✋', count: 1, glyph: 'sway' },
  foot:     { motion: 'walk',  emoji: '👣', count: 3, glyph: 'none' },
  flesh:    { motion: 'pop',   emoji: '💪', count: 2, glyph: 'beat' },
  mouth:    { motion: 'pop',   emoji: '👄', count: 1, glyph: 'chomp' },
  eye:      { motion: 'pop',   emoji: '👀', count: 1, glyph: 'blink' },
  heart:    { motion: 'rise',  emoji: '❤️', count: 4, glyph: 'beat' },
  person:   { motion: 'walk',  emoji: '🏃', count: 1, glyph: 'sway' },
  woman:    { motion: 'pop',   emoji: '🎀', count: 2, glyph: 'sway' },
  tree:     { motion: 'fall',  emoji: '🍃', count: 4, glyph: 'sway' },
  grass:    { motion: 'rise',  emoji: '🌱', count: 4, glyph: 'grow' },
  rice:     { motion: 'pop',   emoji: '🍚', count: 2, glyph: 'none' },
  food:     { motion: 'rise',  emoji: '💨', count: 3, glyph: 'none' },
  sun:      { motion: 'orbit', emoji: '✨', count: 6, glyph: 'beat' },
  rain:     { motion: 'fall',  emoji: '💦', count: 6, glyph: 'none' },
  fire:     { motion: 'rise',  emoji: '🔥', count: 4, glyph: 'flicker' },
  mountain: { motion: 'pop',   emoji: '⛰️', count: 1, glyph: 'grow' },
  hole:     { motion: 'peek',  emoji: '🐰', count: 1, glyph: 'none' },
  knife:    { motion: 'slash', emoji: '🔪', count: 1, glyph: 'shiver' },
  dog:      { motion: 'walk',  emoji: '🐕', count: 1, glyph: 'none' },
  bug:      { motion: 'walk',  emoji: '🐛', count: 1, glyph: 'none' },
  bird:     { motion: 'orbit', emoji: '🐦', count: 1, glyph: 'sway' },
}

/** 這一家的特效；沒列的（新加的家）回 null，畫面就只亮藍色、不演 */
export const fxFor = (id: string): RadicalFx | null => RADICAL_FX[id] ?? null

/**
 * 第 i 顆粒子的位置與延遲：平均散在部首的寬度上（10%～90%），一顆接一顆出來，
 * 不要同時出現（同時出現看起來是一團，看不出「在滴水」）。
 */
export function particle(i: number, count: number) {
  const n = Math.max(1, count)
  const x = n === 1 ? 50 : 10 + (80 * i) / (n - 1)
  return { x: Math.round(x), delay: +(i * (1.6 / n)).toFixed(2) }
}
