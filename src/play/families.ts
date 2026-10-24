import type { CharEntry, Progress } from '../types'
import { RADICALS, RADICAL_FIXED, familyOf, type Radical } from '../../shared/radicals.mjs'
import { SOUNDS } from '../../shared/phonetics.mjs'
import { LINES } from '../../shared/voice-lines.mjs'
import { wordsFor } from './puzzles'

/**
 * 字的家族（Roots.tsx）的規則：哪幾家要出現、故事裡介紹誰、「找家人」出哪幾題。純函式，好測。
 *
 * 三種家：
 * - radical 部首家（radicals.mjs）：意思連得上（三點水的字都跟水有關）
 * - sound 聲音家（phonetics.mjs）：念起來像（包 → 跑、抱）
 * - word 詞家族：同一個字的詞都住一起（火 → 火車、火山、煙火；研究上一個字出現的詞越多越好學）。
 *   從字卡的語詞算出來，不用另外寫內容；家人是詞，不是字。
 */
export type FamilyKind = 'radical' | 'sound' | 'word'
export type Family = Radical & {
  kind: FamilyKind
  /** 這一家在孩子端看得到的字，照表上的順序（詞家族是那個字本身，家人看 words） */
  list: CharEntry[]
  /** 詞家族：家人是這些詞 */
  words?: { text: string; emoji?: string }[]
}

/** 部首家看得到的字少於這個數就先不出現：只有一個字的家講不出「它們有什麼共同點」；聲音家門牌本身就是示範，一個家人就夠 */
export const MIN_MEMBERS = 2
/** 詞家族至少要幾個詞 */
export const MIN_WORDS = 3
/** 變身故事裡最多介紹幾個家人（再多他坐不住，其他的留給找家人） */
export const STORY_MEMBERS = 5
/** 找家人一輪最多幾題 */
export const FIND_ROUNDS = 5

export function familiesIn(library: CharEntry[]): Family[] {
  const byChar = new Map(library.map((c) => [c.char, c]))
  const radicals: Family[] = RADICALS.map((r) => ({ ...r, kind: 'radical' as const, list: Object.keys(r.members).flatMap((c) => byChar.get(c) ?? []) }))
    .filter((f) => f.list.length >= MIN_MEMBERS)
  const sounds: Family[] = SOUNDS.map((r) => ({ ...r, kind: 'sound' as const, list: Object.keys(r.members).flatMap((c) => byChar.get(c) ?? []) }))
    .filter((f) => f.list.length >= 1)
  const words: Family[] = library.flatMap((c) => {
    const ws = wordsFor(c)
    if (ws.length < MIN_WORDS) return []
    return [{
      kind: 'word' as const, id: `word-${c.char}`, forms: [c.char], name: `${c.char}的詞`, emoji: c.emoji || '📚',
      intro: RADICAL_FIXED.wordIntro, change: RADICAL_FIXED.wordChange, common: RADICAL_FIXED.wordCommon,
      // 家人是詞：每個詞那句「火車的火」本來就有音檔（詞語拼圖用的）
      members: Object.fromEntries(ws.map((w) => [w.text, LINES.puzzleAsk(c.char, w.text)])),
      list: [c], words: ws.map((w) => ({ text: w.text, emoji: w.emoji })),
    }]
  })
  return [...radicals, ...sounds, ...words]
}

/** 這個字住的部首家（字卡、今天的路用）；那一家沒出現在孩子端就當沒有 */
export function familyFor(char: string, families: Family[]) {
  const id = familyOf(char)?.id
  return families.find((f) => f.id === id)
}

/** 這個字住的所有家：部首家、聲音家、它自己的詞家族（字卡上一排按鈕） */
export const homesFor = (char: string, families: Family[]) =>
  families.filter((f) => f.kind === 'word' ? f.id === `word-${char}` : Object.hasOwn(f.members, char))

/** 這一家的家人有幾個（詞家族算詞） */
export const sizeOf = (family: Family) => family.kind === 'word' ? family.words!.length : family.list.length

/** 他在這一家找到了幾個家人 */
export const foundIn = (family: Family, progress: Progress) => {
  const found = progress.radicals?.[family.id] || {}
  return family.kind === 'word' ? family.words!.filter((w) => found[w.text]).length : family.list.filter((c) => found[c.char]).length
}

/**
 * 故事要介紹誰：他從哪個字的字卡點進來（lead），那個字第一個出場；
 * 再來是他看過的字（認得的字最好聯想），其他照表上的順序
 */
export function storyMembers(family: Family, progress: Progress, lead?: string, max = STORY_MEMBERS) {
  const rank = (c: CharEntry) => (c.char === lead ? 0 : progress.watched[c.char] ? 1 : 2)
  return [...family.list].sort((a, b) => rank(a) - rank(b)).slice(0, max)
}

/** 找家人的一題：answer 是這家的字（詞家族是詞），options 已洗好 */
export type FindRound = { char: string; options: string[] }

/**
 * 找家人：每題一個這家的家人，配兩個別家的。還沒找到過的先出；
 * 別家的挑他看過的（認得字形才是在比部首，不是在猜沒見過的字）。
 * 詞家族：答案是含這個字的詞，干擾是別的字的詞。
 */
export function pickFinds(family: Family, families: Family[], progress: Progress, random = Math.random): FindRound[] {
  const found = progress.radicals?.[family.id] || {}
  if (family.kind === 'word') {
    const mine = family.words!.map((w) => w.text)
    const answers = [...shuffle(mine.filter((w) => !found[w]), random), ...shuffle(mine.filter((w) => found[w]), random)].slice(0, FIND_ROUNDS)
    const head = family.list[0].char
    const pool = families.filter((f) => f.kind === 'word' && f.id !== family.id && progress.watched[f.list[0].char])
      .flatMap((f) => f.words!.map((w) => w.text)).filter((w) => !w.includes(head))
    const others = pool.length >= 4 ? pool : families.filter((f) => f.kind === 'word' && f.id !== family.id).flatMap((f) => f.words!.map((w) => w.text)).filter((w) => !w.includes(head))
    return answers.map((char) => ({ char, options: shuffle([char, ...shuffle(others, random).slice(0, 2)], random) }))
  }
  const answers = [...shuffle(family.list.filter((c) => !found[c.char]), random), ...shuffle(family.list.filter((c) => found[c.char]), random)]
    .slice(0, FIND_ROUNDS).map((c) => c.char)
  // 聲音家的干擾字也不能念起來像；部首家的不能同部首
  const others = families.filter((f) => f.kind === family.kind && f.id !== family.id).flatMap((f) => f.list)
    .filter((c) => !Object.hasOwn(family.members, c.char))
  const seenOthers = others.filter((c) => progress.watched[c.char]).map((c) => c.char)
  const pool = [...new Set(seenOthers.length >= 4 ? seenOthers : others.map((c) => c.char))]
  return answers.map((char) => ({ char, options: shuffle([char, ...shuffle(pool, random).slice(0, 2)], random) }))
}

/** 名字裡的字各住哪一家（首頁那條「你的名字住在三個部首家族裡」）；有字不在任何一家就不顯示 */
export function nameFamilies(name: string, families: Family[]) {
  const homes = [...name].map((char) => ({ char, family: familyFor(char, families) }))
  return homes.every((h) => h.family) ? homes as { char: string; family: Family }[] : []
}

function shuffle<T>(list: T[], random: () => number) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
