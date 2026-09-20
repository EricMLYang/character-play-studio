import table from '../../data/parts.json'

/** 一個藏在別的字裡面的字，以及它在那個字裡佔掉哪幾筆。由 npm run parts 產生。 */
export type Part = { char: string; strokes: number[]; role?: string }

const parts = table as Record<string, Part[]>

/** 這個字裡面有哪些他也在學的字。 */
export const partsOf = (char: string): Part[] => parts[char] || []

const inside = new Map<string, string[]>()
for (const [whole, list] of Object.entries(parts)) {
  for (const part of list) {
    const found = inside.get(part.char)
    if (found) found.push(whole)
    else inside.set(part.char, [whole])
  }
}

/** 反過來看：這個字躲在哪些字裡面。學會「口」之後，吃喝器都跟著變好記。 */
export const hidesIn = (char: string): string[] => inside.get(char) || []
