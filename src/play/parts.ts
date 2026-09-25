import type { Library } from '../types'

/** 一個藏在別的字裡面的字，以及它在那個字裡佔掉哪幾筆。伺服器在字庫變動時重算，跟著字庫一起送來。 */
export type Part = Library['parts'][string][number]

let parts: Library['parts'] = {}
let inside = new Map<string, string[]>()

/** 字庫載入時呼叫一次。 */
export function setParts(table: Library['parts']) {
  parts = table || {}
  inside = new Map()
  for (const [whole, list] of Object.entries(parts)) {
    for (const part of list) {
      const found = inside.get(part.char)
      if (found) found.push(whole)
      else inside.set(part.char, [whole])
    }
  }
}

/** 這個字裡面有哪些他也在學的字。 */
export const partsOf = (char: string): Part[] => parts[char] || []

/** 反過來看：這個字躲在哪些字裡面。學會「口」之後，吃喝器都跟著變好記。 */
export const hidesIn = (char: string): string[] => inside.get(char) || []
