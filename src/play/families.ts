import type { CharEntry, Progress } from '../types'
import { RADICALS, familyOf, type Radical } from '../../shared/radicals.mjs'

/**
 * 部首家族（Roots.tsx）的規則：哪幾家要出現、故事裡介紹誰、「找家人」出哪幾題。純函式，好測。
 */
export type Family = Radical & {
  /** 這一家在孩子端看得到的字，照 radicals.mjs 的順序 */
  list: CharEntry[]
}

/** 同一家看得到的字少於這個數就先不出現：只有一個字的家講不出「它們有什麼共同點」 */
export const MIN_MEMBERS = 2
/** 變身故事裡最多介紹幾個家人（再多他坐不住，其他的留給找家人） */
export const STORY_MEMBERS = 5
/** 找家人一輪最多幾題 */
export const FIND_ROUNDS = 5

export function familiesIn(library: CharEntry[]): Family[] {
  const byChar = new Map(library.map((c) => [c.char, c]))
  return RADICALS.map((r) => ({ ...r, list: Object.keys(r.members).flatMap((c) => byChar.get(c) ?? []) }))
    .filter((f) => f.list.length >= MIN_MEMBERS)
}

/** 這個字住的那一家（字卡上的部首按鈕用）；那一家沒出現在孩子端就當沒有 */
export function familyFor(char: string, families: Family[]) {
  const id = familyOf(char)?.id
  return families.find((f) => f.id === id)
}

/** 他在這一家找到了幾個家人 */
export const foundIn = (family: Family, progress: Progress) =>
  family.list.filter((c) => progress.radicals?.[family.id]?.[c.char]).length

/**
 * 故事要介紹誰：他從哪個字的字卡點進來（lead），那個字第一個出場；
 * 再來是他看過的字（認得的字最好聯想），其他照表上的順序
 */
export function storyMembers(family: Family, progress: Progress, lead?: string, max = STORY_MEMBERS) {
  const rank = (c: CharEntry) => (c.char === lead ? 0 : progress.watched[c.char] ? 1 : 2)
  return [...family.list].sort((a, b) => rank(a) - rank(b)).slice(0, max)
}

export type FindRound = { char: string; options: string[] }

/**
 * 找家人：每題一個這家的字，配兩個別家的字。還沒找到過的家人先出；
 * 別家的字挑他看過的（認得字形才是在比部首，不是在猜沒見過的字）。
 */
export function pickFinds(family: Family, families: Family[], progress: Progress, random = Math.random): FindRound[] {
  const found = progress.radicals?.[family.id] || {}
  const answers = [...shuffle(family.list.filter((c) => !found[c.char]), random), ...shuffle(family.list.filter((c) => found[c.char]), random)]
    .slice(0, FIND_ROUNDS).map((c) => c.char)
  const others = families.filter((f) => f.id !== family.id).flatMap((f) => f.list)
  const seenOthers = others.filter((c) => progress.watched[c.char]).map((c) => c.char)
  const pool = seenOthers.length >= 4 ? seenOthers : others.map((c) => c.char)
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
