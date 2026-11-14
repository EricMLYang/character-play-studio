export type Name = { id: string; text: string; emoji: string; note?: string }

export const NAMES: Name[]
export function nameById(id: string): Name | undefined
export function isHan(c: string): boolean
export function spellChars(name: Name): string[]
export function nameChars(name: Name): string[]
export function askLine(name: Name): string
export const NAME_FIXED: {
  nameHello: string; nameAgain: string; nameDone: string; nameSticker: string; nameSeen: string; nameNew: string
  nameChoose: string; nameWatch: string; nameRespell: string; nameTapHero: string
}
export function nameLines(): string[]
export function validName(event: { char?: unknown; done?: unknown }): boolean
