import type { Reaction } from './poses'

/**
 * 小書的每一頁是一個小舞台：一位夥伴當演員，句子唸到哪裡就演到哪裡。
 * 「火車好大！」——火車真的變超大、夥伴嚇一跳；「你有火車。」——火車飛到夥伴手上。
 *
 * 演的就是句子的意思：小書反覆出現的那幾個字（好大、好小、有、要、愛）他還讀不懂，
 * 看到它們每次都跟同一種動作綁在一起，就猜得出意思——跟繪本「看圖猜字」是同一件事。
 *
 * trigger：句子唸到哪一段開始演。句型後半段有字（好大！）就是 'after'，只有前半段（你有＿）就是 'slot'。
 */
export type Act = 'big' | 'small' | 'cute' | 'fun' | 'have' | 'want' | 'love'
export type Staging = { act: Act; reaction: Reaction; trigger: 'slot' | 'after' }

export const ACTS: Record<string, Staging> = {
  big: { act: 'big', reaction: 'oops', trigger: 'after' },
  small: { act: 'small', reaction: 'think', trigger: 'after' },
  cute: { act: 'cute', reaction: 'cheer', trigger: 'after' },
  fun: { act: 'fun', reaction: 'cheer', trigger: 'after' },
  have: { act: 'have', reaction: 'wave', trigger: 'slot' },
  want: { act: 'want', reaction: 'think', trigger: 'slot' },
  love: { act: 'love', reaction: 'cheer', trigger: 'slot' },
}

/** 沒列到的句型（之後新加的）：東西跳一下、夥伴開心，不會壞掉 */
export const stagingFor = (patternId: string): Staging => ACTS[patternId] ?? { act: 'fun', reaction: 'cheer', trigger: 'slot' }

/** 句子的第幾段開始演（segmentsOf 的順序：前半、語詞、後半；沒有前半就從語詞算起） */
export function actSegment(pattern: { before: string; after: string }, staging: Staging) {
  const slot = pattern.before ? 1 : 0
  return staging.trigger === 'after' && pattern.after.replace(/[。！？，]/g, '') ? slot + 1 : slot
}
