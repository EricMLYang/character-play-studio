import type { Clip } from '../anim/clip'

/**
 * 故事屋的一段戲：就是一份沒有國字的動畫劇本（src/anim/clip.ts 的 Clip），畫面一樣只由 t 決定，
 * 所以可以用 npm run anim:shot -- --story <id> 逐格看成品。
 *
 * 跟識字動畫不一樣的地方：
 * - 沒有 builds、glyph（沒有國字要拼），整個舞台都是角色的
 * - cues 裡**剛好一句 say**：就是這一頁（或這個選項的結果）那句話，一字不差（tests/stories.test.mjs 會擋）。
 *   畫面下面那行字照這句的時間一個字一個字亮；句子要落在「看得到那件事」的那一刻
 * - 選的頁沒有自己的戲：舞台停在上一段的最後一格等他選。所以每一段的結尾要停在「說得通」的樣子，
 *   選了不往下走的那幾種結果（好笑的那幾段）演完要回到原本的困境，他才能再選一次
 */
export type Scene = Omit<Clip, 'char' | 'builds' | 'glyph' | 'meta'>

export const scene = (def: Scene): Clip => ({ ...def, char: '', builds: [] })

/** 這段戲那句話從第幾秒開始唸 */
export const lineOf = (clip: Clip) => clip.cues.find((c): c is { at: number; say: string } => 'say' in c)
