/** 名字的一段：chars 依序接起來就是 text；word 是這幾個字在動畫裡代表的詞（皮→皮球）；emoji 是那個東西的圖 */
export type NamePart = { chars: string; word?: string; emoji: string }
export type Name = { id: string; text: string; emoji: string; parts: NamePart[]; note?: string }
/** 一段對到名字的哪幾格：from～to（不含 to）；last 是這一段最後一個要拼的格子 */
export type PartSpan = { part: NamePart; from: number; to: number; last: number }
export type NameLog = { first?: string; last?: string; count: number }

export const NAMES: Name[]
export function nameById(id: string): Name | undefined
export function isHan(c: string): boolean
export function spellChars(name: Name): string[]
export function nameChars(name: Name): string[]
export function askLine(name: Name): string
export function partLine(part: NamePart): string | null
export function partSpans(name: Name): PartSpan[]
export const NAME_SCENES_REDONE: string
export function hasNewScene(log: NameLog | undefined, redone?: string): boolean
export const NAME_FIXED: {
  nameHello: string; nameAgain: string; nameDone: string; nameSticker: string; nameSeen: string; nameNew: string
  nameChoose: string; nameWatch: string; nameRespell: string; nameTapHero: string; nameNewScene: string
}
export function nameLines(): string[]
export function validName(event: { char?: unknown; done?: unknown }): boolean
